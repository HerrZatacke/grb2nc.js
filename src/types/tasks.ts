import { CircleShape } from '@hpcreery/tracespace-plotter';
import { Polygon } from '@/types/geo';

export enum TaskType {
  ISOLATION = 'isolation',
  EDGE_CUT = 'edgecut',
  DRILL = 'drill',
  DRAWING = 'drawing',
}

export enum Units {
  MILLIMETERS = 'mm',
  INCHES = 'in',
}

export enum Layer {
  TOP = 'top',
  BOTTOM = 'bottom',
  OTHER = 'other',
}

export interface TaskVisibility {
  fileName: string;
  hidePaths: boolean;
  hideAreas: boolean;
}

export interface EditableTask {
  fileName: string;
  fileTime: number;
  steps: number;
  offset: number;
}

export interface Task extends EditableTask {
  fileContent: string;
  type: TaskType;
  layer: Layer;
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
