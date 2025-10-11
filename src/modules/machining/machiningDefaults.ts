import { MachiningOperations, MachiningParams } from '@/types/machining.ts';
import { TaskType, Units } from '@/types/tasks.ts';

export const machiningDefaultParams = (taskType: TaskType): MachiningParams => {
  switch (taskType) {
    case TaskType.DRILL:
      return {
        units: Units.MILLIMETERS,
        originOffsetX: '0',
        originOffsetY: '0',
        safeHeight: '30.0',
        clearanceHeight: '1.0',
        workHeight: '0',
        cutDepth: '-1.8',
        stepDepth: '1.0', // peck depth
        feedRateXY: '0', // not required/no milling
        plungeSpeed: '25',
        spindleSpeed: '10000',
      };

    case TaskType.ISOLATION:
      return {
        units: Units.MILLIMETERS,
        originOffsetX: '0',
        originOffsetY: '0',
        safeHeight: '30.0',
        clearanceHeight: '1.0',
        workHeight: '0',
        cutDepth: '-0.1', // copper thickness
        stepDepth: '0.1',
        feedRateXY: '70',
        plungeSpeed: '70',
        spindleSpeed: '10000',
      };

    case TaskType.EDGE_CUT:
      return {
        units: Units.MILLIMETERS,
        originOffsetX: '0',
        originOffsetY: '0',
        safeHeight: '30.0',
        clearanceHeight: '1.0',
        workHeight: '0',
        cutDepth: '-1.8',
        stepDepth: '0.9', // pass depth
        feedRateXY: '60',
        plungeSpeed: '60',
        spindleSpeed: '10000',
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
