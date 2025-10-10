import { MachiningOperations, MachiningParams } from '@/types/machining.ts';
import { TaskType, Units } from '@/types/tasks.ts';

export const machiningDefaultParams = (taskType: TaskType): MachiningParams => {
  switch (taskType) {
    case TaskType.DRILL:
      return {
        units: Units.MILLIMETERS,
        originOffsetX: '0',
        originOffsetY: '0',
        safeHeight: '1.5',
        clearanceHeight: '0.5',
        workHeight: '0',
        cutDepth: '-1.8',
        stepDepth: '0.5', // peck depth
        feedRateXY: '0',
        plungeSpeed: '80',
        retractSpeed: '300',
        spindleSpeed: '10000',
      };

    case TaskType.ISOLATION:
      return {
        units: Units.MILLIMETERS,
        originOffsetX: '0',
        originOffsetY: '0',
        safeHeight: '1.0',
        clearanceHeight: '0.3',
        workHeight: '0',
        cutDepth: '-0.1',
        stepDepth: '0.1',
        feedRateXY: '150',
        plungeSpeed: '100',
        retractSpeed: '300',
        spindleSpeed: '16000',
      };

    case TaskType.EDGE_CUT:
      return {
        units: Units.MILLIMETERS,
        originOffsetX: '0',
        originOffsetY: '0',
        safeHeight: '2.0',
        clearanceHeight: '0.5',
        workHeight: '0',
        cutDepth: '-1.8',
        stepDepth: '0.6', // pass depth
        feedRateXY: '300',
        plungeSpeed: '100',
        retractSpeed: '300',
        spindleSpeed: '14000',
      };

    default:
      throw new Error(`Unknown task type: ${taskType}`);
  }
};

export const machiningDefaultOperations = (): MachiningOperations => {
  return {
    [TaskType.DRILL]: machiningDefaultParams(TaskType.DRILL),
    [TaskType.ISOLATION]: machiningDefaultParams(TaskType.ISOLATION),
    [TaskType.EDGE_CUT]: machiningDefaultParams(TaskType.EDGE_CUT),
  };
};
