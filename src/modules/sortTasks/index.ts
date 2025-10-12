import { Task, TaskType } from '@/types/tasks';

const taskValues: Record<TaskType, number> = {
  [TaskType.EDGE_CUT]: 3,
  [TaskType.DRILL]: 2,
  [TaskType.ISOLATION]: 1,
};

export const sortTasks = (taskA: Task, taskB: Task): number => {
  const valueA = taskValues[taskA.type];
  const valueB = taskValues[taskB.type];

  return Math.sign(valueA - valueB);
};
