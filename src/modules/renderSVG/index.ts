import {Point, Polygon} from "@/types/geo";
import {TaskType} from "@/types/tasks.ts";

export const polygonsToSVGPaths = (polygons: Polygon[], precision: number): string[] => {
  return polygons.reduce((path: string[], points: Point[]): string[] => {
    return [
      ...path,
      points.map((pt, index) => {
        const lm = index ? 'L' : 'M'

        const x = pt.X / precision;
        const y = pt.Y / precision;

        return `${lm}${x.toFixed(2)} ${y.toFixed(2)}`;
      }).join(' '),
    ];
  }, []);
}


export const getColor = (taskType: TaskType, flip: boolean): string => {
  if (taskType === TaskType.EDGE_CUT) {
    return '127,127,127';
  }

  if (taskType === TaskType.DRILL) {
    return '63,63,63';
  }

  return flip ? '0,64,255' : '255,64,0';
}

export const getSteps = (type: TaskType): number => {
  switch (type) {
    case TaskType.EDGE_CUT:
      return 1;
    case TaskType.ISOLATION:
      return 4;
    case TaskType.DRILL:
      return 0;
  }
}

export const getOffset = (type: TaskType): number => {
  switch (type) {
    case TaskType.EDGE_CUT:
      return 60000;
    case TaskType.ISOLATION:
      return 5000
    default:
      return 0;
  }
}

export const getOffsetStroke = (type: TaskType): string => {
  switch (type) {
    case TaskType.EDGE_CUT:
      return '4';
    case TaskType.ISOLATION:
      return '1'
    default:
      return 'none';
  }
}
