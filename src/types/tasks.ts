import { Polygon } from '@/types/geo';

export enum TaskType {
  ISOLATION = 'isolation',
  EDGE_CUT = 'edgecut',
  DRILL = 'drill',
}

export enum Units {
  MILLIMETERS = 'mm',
  INCHES = 'in',
}

export type Task = {
  fileName: string;
  fileTime: number;
  fileContent: string;
  type: TaskType;
  flip: boolean;
  hidePaths: boolean;
  hideAreas: boolean;
  steps: number;
  offset: number;
};

export interface TaskWithPolygons extends Task {
  polygons: Polygon[];
  units: Units;
}

export interface SVGPathProps {
  path: string;
  fill: string;
  stroke: string;
  strokeWidth: string;
  hide: boolean;
}

export interface RenderedTask extends TaskWithPolygons {
  svgPathProps: SVGPathProps[];
  offsetPaths: Polygon[][];
}
