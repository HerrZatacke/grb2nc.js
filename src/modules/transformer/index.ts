import {type ImagePath, type ImageRegion, type ImageTree, type Shape,} from '@hpcreery/tracespace-plotter';
import {Clipper, PolyType, ClipType, PolyFillType} from 'clipper-lib';
import {mergePolyline} from './mergePolyline';
import {Point, type Polygon} from '@/types/geo';
import {TaskType} from '@/types/tasks.ts';

const PI = Math.PI;
const PI_2 = Math.PI / 2;
const PI_1_5 = 1.5 * Math.PI;
const PI2 = 2 * Math.PI;


class Transformer {
  private clipper: Clipper = new Clipper();
  private edgePolygons: Polygon[] = [];
  private scale = 0;
  private minimumRadius = 0;
  private precision = 1000;

  constructor(scale: number, minimumRadius: number) {
    this.scale = scale * this.precision;
    this.minimumRadius = minimumRadius;
  }

  run(plotData: ImageTree, taskType: TaskType) {
    this.clipper.Clear();
    this.edgePolygons = [];

    // const start = Date.now();

    plotData.children.forEach(child => {
      switch (child.type) {

        // Pads and something near the pads....
        case 'imageShape':
          this.drawShape(child.shape);
          break;

        // pcb traces
        case 'imagePath':
          this.drawPath(child, taskType);
          break;

        // filled layers to be merged with traces
        case 'imageRegion':
          this.drawRegion(child);
          break;

        default:
          console.error(`not implemented type`);
      }
    });

    if (taskType === TaskType.EDGE_CUT) {
      mergePolyline(this.edgePolygons)
        .forEach((polygon: Polygon) => {
          this.addPolygon(polygon, true);
        });
    }

    // const duration = Date.now() - start;
    // console.log(`Transforming gerber to ${taskType} polygons took ${duration}ms`);
  }

  drawShape(shape: Shape /* , taskType: TaskType*/) {
    switch (shape.type) {
      case 'rectangle': {
        const x = shape.x;
        const y = shape.y;
        const w = shape.xSize;
        const h = shape.ySize;
        const r = Math.max(shape.r || 0, this.minimumRadius);

        const tl = this.createArc(x + r, y + r, r, PI, PI_1_5);
        const tr = this.createArc(x + w - r, y + r, r, PI_1_5, PI2);
        const br = this.createArc(x + w - r, y + h - r, r, 0, PI_2);
        const bl = this.createArc(x + r, y + h - r, r, PI_2, PI);

        const polygon: Polygon = [
          ...tl,
          ...tr,
          ...br,
          ...bl,
          tl[0],
        ];

        this.addPolygon(polygon, false);
        break;
      }

      case 'circle': {
        const cx = shape.cx;
        const cy = shape.cy;
        const r = shape.r;

        const polygon = this.createArc(cx, cy, r, 0, PI2);
        polygon.push(polygon[0]);

        this.addPolygon(polygon, false);
        break;
      }

      case 'polygon': {
        if (shape.points && shape.points.length > 1) {

          if (!shape.points || !shape.points.length) return;

          const polygon: Polygon = [];

          shape.points.forEach(([X, Y]) => {
            polygon.push({ X, Y });
          });

          polygon.push({...polygon[0]});

          if (polygon.length > 2) {
            this.addPolygon(polygon, false);
          }
        }
        break;
      }

      case 'layeredShape': {
        if (shape.shapes) {
          shape.shapes.forEach(subShape => this.drawShape(subShape));
        }

        break;
      }

      default:
        console.log(`unknown shapetype "${shape.type}"`, shape);
    }
  }

  drawPath(path: ImagePath, taskType: TaskType) {
    if (!path.segments || !path.segments.length) return;

    const width = Math.max(path.width || 1);

    path.segments.forEach(segment => {
      switch (segment.type) {
        case 'line': {
          switch (taskType) {
            case TaskType.ISOLATION: {
              const [x1, y1] = segment.start;
              const [x2, y2] = segment.end;

              const dx = x2 - x1;
              const dy = y2 - y1;

              const angle = Math.atan2(dy, dx);
              const arcRadius = width / 2;

              const startArc = this.createArc(
                x1, y1, arcRadius,
                angle + PI_2,
                angle - PI_2 + PI2
              );

              const endArc = this.createArc(
                x2, y2, arcRadius,
                angle - PI_2,
                angle + PI_2,
              );

              const polygon: Polygon = [
                ...startArc,
                ...endArc,
                startArc[0]
              ].map(pt => ({X: pt.X, Y: pt.Y}));

              this.addPolygon(polygon, false);
              break;
            }

            case TaskType.EDGE_CUT: {
              const [x1, y1] = segment.start;
              const [x2, y2] = segment.end;
              this.edgePolygons.push([{ X: x1, Y: y1 }, { X: x2, Y: y2 }]);
              break;
            }
          }
          break;
        }

        case 'arc': {
          const [cx, cy] = segment.center;
          const [x1, y1, a1] = segment.start;
          const [x2, y2, a2] = segment.end;

          const arc = this.createArc(cx, cy, segment.radius, a1, a2);
          const polygon = [
            { X: x1, Y: y1 },
            ...arc,
            { X: x2, Y: y2 },
          ];


          switch (taskType) {
            case TaskType.ISOLATION: {
              this.addPolygon(polygon, false);
              break;
            }

            case TaskType.EDGE_CUT: {
              this.edgePolygons.push(polygon);
              break;
            }
          }
        }
      }
    });
  }

  drawRegion(region: ImageRegion /* , taskType: TaskType*/) {
    if (!region.segments || !region.segments.length) return;

    const polygon: Polygon = [];

    region.segments.forEach((segment, index) => {
      if (index === 0) {
        polygon.push({ X: segment.start[0], Y: segment.start[1] });
      }
      polygon.push({ X: segment.end[0], Y: segment.end[1] });
    });

    polygon.push(polygon[0])

    if (polygon.length > 2) {
      this.addPolygon(polygon, false);
    }
  }

  createArc(
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number,
  ): Polygon {
    const f = .02;
    const arcLength = Math.abs(endAngle - startAngle) * r;
    const estimated = Math.pow(2, Math.ceil(Math.log2(arcLength / f)));
    const numPoints = Math.max(8, Math.min(estimated, 64));

    const points: Polygon = [];
    const step = (endAngle - startAngle) / (numPoints - 1);
    for (let i = 0; i < numPoints; i++) {
      const angle = startAngle + i * step;
      points.push({
        X: cx + r * Math.cos(angle),
        Y: cy + r * Math.sin(angle),
      });
    }
    return points;
  }

  addPolygon(polygon: Polygon, keepChirality: boolean): void {
    const clipper: Clipper = new Clipper();
    clipper.Clear();

    const scaledPolygon = polygon.map(({ X, Y }): Point => ({
      X: Math.round(X * this.scale),
      Y: Math.round(Y * this.scale),
    }));

    if (!keepChirality) {
      if (!Clipper.Orientation(scaledPolygon)) {
        scaledPolygon.reverse();
      }
    }

    this.clipper.AddPath(scaledPolygon, PolyType.ptSubject, true);
  }

  result(taskType: TaskType): Polygon[] {
    const traceSolution: Polygon[] = [];
    const pft: PolyFillType = taskType === TaskType.EDGE_CUT ? PolyFillType.pftEvenOdd : PolyFillType.pftNonZero
    // const pft: PolyFillType = PolyFillType.pftEvenOdd;
    // const pft: PolyFillType = PolyFillType.pftNonZero;

    this.clipper.Execute(
      ClipType.ctUnion,
      traceSolution,
      pft,
      pft,
    );

    return traceSolution;
  }

  getPrecision(): number {
    return this.precision;
  }
}

export const transformer = new Transformer(60, 0.05);
