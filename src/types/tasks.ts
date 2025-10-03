import {Polygon} from "@/types/geo";

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
  hide: boolean;
};

export interface TaskWithPolygons extends Task {
  polygons: Polygon[];
  steps: number;
  offset: number;
}

export interface TaskProps {
  path: string;
  fill: string;
  stroke: string;
  strokeWidth: string;
  hide: boolean;
}
