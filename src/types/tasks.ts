import { CircleShape } from '@hpcreery/tracespace-plotter';
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

export interface EditableTask {
  steps: number;
  offset: number;
}

export interface Task extends EditableTask {
  fileName: string;
  fileTime: number;
  fileContent: string;
  type: TaskType;
  flip: boolean;
  hidePaths: boolean;
  hideAreas: boolean;
}

export interface TaskWithPolygons extends Task {
  polygons: Polygon[];
  drills: CircleShape[];
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
