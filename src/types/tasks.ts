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
