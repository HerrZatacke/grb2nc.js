import type { CircleShape } from '@hpcreery/tracespace-plotter';
import type { IntRect } from 'clipper-lib';
import { transformer } from '@/modules/transformer';
import type { Point, Polygon } from '@/types/geo';
import { Layer, TaskType } from '@/types/tasks.ts';

interface StrokeProps {
  stroke: string;
  strokeWidth: string;
}

export const SVG_SCALE = parseInt(process.env.NEXT_PUBLIC_SVG_SCALE || '0', 10);
export const SVG_VIEWBOX_OFFSET = 4;
export const SVG_SCALED_VIEWBOX_OFFSET = SVG_VIEWBOX_OFFSET * SVG_SCALE;

const svgPoint = (lm: 'L'|'M', x: number, y: number): string => {
  return `${lm}${x.toFixed(2)} ${y.toFixed(2)}`;
};

export const polygonsToSVGPaths = (polygons: Polygon[], precision: number): string[] => {
  return polygons.reduce((path: string[], points: Point[]): string[] => {
    return [
      ...path,
      points.map((pt, index) => {
        const lm = index ? 'L' : 'M';

        const x = SVG_SCALE * pt.X / precision;
        const y = SVG_SCALE * pt.Y / precision;

        return svgPoint(lm, x, y);
      }).join(' '),
    ];
  }, []);
};


export const circleShapeToSVGPath = (circleShape: CircleShape): string => {
  const x = SVG_SCALE * circleShape.cx;
  const y = SVG_SCALE * circleShape.cy;
  const r = SVG_SCALE * circleShape.r;

  return [
    svgPoint('M', x - r, y),
    svgPoint('L', x + r, y),
    svgPoint('M', x, y - r),
    svgPoint('L', x, y + r),
  ].join(' ');
};

export const getColor = (taskType: TaskType, layer: Layer): string => {
  if (taskType === TaskType.EDGE_CUT) {
    return 'edgecut';
  }

  if (taskType === TaskType.DRILL) {
    return 'drill';
  }

  if (taskType === TaskType.DRAWING) {
    return 'drawing';
  }

  switch (layer) {
    case Layer.BOTTOM:
      return 'bottom';
    case Layer.TOP:
      return 'top';
  }

  return 'drawing';
};

export const getGridStrokeProps = (index?: number): StrokeProps => {
  const iMod = index ? index % 10 : 0;
  const isOrigin = !index;
  const isStrong = (iMod * SVG_SCALE) === SVG_SCALED_VIEWBOX_OFFSET;

  if (isOrigin) {
    return {
      stroke: 'var(--color-grid-origin)',
      strokeWidth: (0.025 * SVG_SCALE).toFixed(2),
    };
  }

  if (isStrong) {
    return {
      stroke: 'var(--color-grid-strong)',
      strokeWidth: (0.0075 * SVG_SCALE).toFixed(2),
    };
  }

  return {
    stroke: 'var(--color-grid-regular)',
    strokeWidth: (0.005 * SVG_SCALE).toFixed(2),
  };
};

export const getSVGBounds = (bounds: IntRect): IntRect => {
  const scale = transformer.getScale();

  return {
    left: SVG_SCALE * Math.round((bounds.left / scale) - SVG_VIEWBOX_OFFSET),
    top: SVG_SCALE * Math.round((bounds.top / scale) - SVG_VIEWBOX_OFFSET),
    right: SVG_SCALE * Math.round((bounds.right / scale) + SVG_VIEWBOX_OFFSET),
    bottom: SVG_SCALE * Math.round((bounds.bottom / scale) + SVG_VIEWBOX_OFFSET),
  };
};

export const getViewBox = (bounds: IntRect): string => {
  const svgBounds = getSVGBounds(bounds);
  const x = svgBounds.left;
  const y = svgBounds.top;
  const w = svgBounds.right - svgBounds.left;
  const h = svgBounds.bottom - svgBounds.top;

  return [x, y, w, h].join(' ');
};

export const getAreaStroke = (): string => {
  return (0.01 * SVG_SCALE).toFixed(2);
};

export const getOffsetStroke = (type: TaskType): string => {
  switch (type) {
    case TaskType.EDGE_CUT:
      return (0.1 * SVG_SCALE).toFixed(2);
    case TaskType.ISOLATION:
      return (0.015 * SVG_SCALE).toFixed(2);
    case TaskType.DRILL:
      return (0.025 * SVG_SCALE).toFixed(2);
    default:
      return '0';
  }
};
