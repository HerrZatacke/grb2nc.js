import type { IntRect } from 'clipper-lib';
import type { Polygon } from '@/types/geo';
import type { RenderedTask, Task, TaskType, Units } from '@/types/tasks.ts';

export type ProgressCallback = (progress: number) => void;
export type ErrorCallback = (error: string) => void;
export type ProgressTick = () => Promise<void>;
export type ProgressAddEstimate = (items: number) => void;

export interface TransformWorkerParams {
  tasks: Task[];
  scale: number;
}

export interface TransformWorkerResult {
  renderedTasks: RenderedTask[];
  bounds: IntRect;
  units: Units;
  timings: string[];
}

export interface ITansformWorkerApi {
  setup: (onProgress: ProgressCallback, onError: ErrorCallback) => void;
  calculate: (params: TransformWorkerParams) => Promise<TransformWorkerResult>;
}

export interface CreateOffsetPathsParams {
  offsetSteps: number;
  offsetDistance: number;
  initialPath: Polygon[];
  taskType: TaskType;
  progressTick: ProgressTick;
  progressAddEstimate: ProgressAddEstimate;
  boardEdgeOffset?: Polygon[];
}

export interface RenderTaskParams {
  scale: number;
  timings: string[];
  boardEdgeOffset?: Polygon[];
  progressTick: ProgressTick;
  progressAddEstimate: ProgressAddEstimate;
}
