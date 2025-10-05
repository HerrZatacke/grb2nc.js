import { IntRect } from 'clipper-lib';
import { transformer } from '@/modules/transformer';
import { Point, Polygon } from '@/types/geo';
import { TaskType } from '@/types/tasks.ts';

const SVG_SCALE = parseInt(process.env.NEXT_PUBLIC_SVG_SCALE || '0', 10);
const SVG_VIEWBOX_OFFSET = SVG_SCALE * 2;

export const polygonsToSVGPaths = (polygons: Polygon[], precision: number): string[] => {
  return polygons.reduce((path: string[], points: Point[]): string[] => {
    return [
      ...path,
      points.map((pt, index) => {
        const lm = index ? 'L' : 'M';

        const x = SVG_SCALE * pt.X / precision;
        const y = SVG_SCALE * pt.Y / precision;

        return `${lm}${x.toFixed(2)} ${y.toFixed(2)}`;
      }).join(' '),
    ];
  }, []);
};


export const getColor = (taskType: TaskType, flip: boolean): string => {
  if (taskType === TaskType.EDGE_CUT) {
    return '127,127,127';
  }

  if (taskType === TaskType.DRILL) {
    return '63,63,63';
  }

  return flip ? '0,64,255' : '255,64,0';
};

export const getViewBox = (bounds: IntRect): string => {
  const scale = transformer.getScale();
  const x = SVG_SCALE * bounds.left / scale;
  const y = SVG_SCALE * bounds.top / scale;
  const w = SVG_SCALE * (bounds.right - bounds.left) / scale;
  const h = SVG_SCALE * (bounds.bottom - bounds.top) / scale;

  return [
    Math.round(x -SVG_VIEWBOX_OFFSET),
    Math.round(y -SVG_VIEWBOX_OFFSET),
    Math.round(w + (2 * SVG_VIEWBOX_OFFSET)),
    Math.round(h + (2 * SVG_VIEWBOX_OFFSET)),
  ].join(' ');
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
    default:
      return '0';
  }
};
