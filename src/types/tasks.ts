import {Polygon} from '@/types/geo';

export enum TaskType {
  ISOLATION = 'isolation',
  EDGE_CUT = 'edgecut',
  DRILL = 'drill',
}

export type Task = {
  fileName: string;
  fileTime: number;
  fileContent: string;
  type: TaskType;
  flip: boolean;
  hidePaths: boolean;
  hideAreas: boolean;
};

export interface TaskWithPolygons extends Task {
  polygons: Polygon[];
  steps: number;
  offset: number;
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
