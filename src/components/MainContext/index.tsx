'use client';

import { IntRect } from 'clipper-lib';
import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import { useLocalStorage } from 'react-storage-complete';
import { useTransformer } from '@/hooks/useTransformer.ts';
import { machiningDefaultOperations } from '@/modules/machining/machiningDefaults.ts';
import { sortTasks } from '@/modules/sortTasks';
import { MachiningOperations, MachiningParams } from '@/types/machining.ts';
import { EditableTask, RenderedTask, Task, TaskType, TaskVisibility, Units } from '@/types/tasks.ts';
import { defaultBounds } from '@/workers/transformWorker/functions/defaultBounds.ts';

export type UpdateTaskParamsFunction = (fileName: string, updatedTask: Partial<EditableTask>) => void;
export type UpdateTaskVisibilityFunction = (fileName: string, updatedTask: Partial<TaskVisibility>) => void;
export type UpdateMachiningOperationParamsFunction = (taskType: TaskType, update: Partial<MachiningParams>) => void

interface MainContextValue {
  tasks: Task[];
  updateTaskParams: UpdateTaskParamsFunction;
  updateTaskVisibility: UpdateTaskVisibilityFunction;
  updateMachiningOperationParams: UpdateMachiningOperationParamsFunction;
  setTasks: (tasks: Task[]) => void;
  busy: boolean,
  progress: number,
  activeHandles: number,
  globalErrors: string[],
  setBusy: (busy: boolean) => void;
  setActiveHandles: (count: number) => void;
  renderedTasks: RenderedTask[];
  globalBounds: IntRect;
  globalUnits: Units;
  machiningOperations: MachiningOperations;
  setOperationForm: (operationForm: TaskType | null) => void;
  operationForm: TaskType | null;
  setTaskForm: (fileName: string) => void;
  taskForm: string;
}

const MACHINING_PARAMS_STORAGE_KEY = 'machiningParams';

const mainContext = createContext<MainContextValue | null>(null);

export function MainProvider({ children }: PropsWithChildren) {
  const [tasks, setTasksRaw] = useState<Task[]>([]);
  const [busy, setBusy] = useState<boolean>(false);
  const [activeHandles, setActiveHandles] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [renderedTasks, setRenderedTasks] = useState<RenderedTask[]>([]);
  const [globalBounds, setGlobalBounds] = useState<IntRect>(() => defaultBounds(0));
  const [globalUnits, setGlobalUnits] = useState<Units>(Units.MILLIMETERS);
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [machiningOperations, setMachiningOperations] = useLocalStorage<MachiningOperations>(MACHINING_PARAMS_STORAGE_KEY, machiningDefaultOperations());
  const [operationForm, setOperationForm] = useState<TaskType | null>(null);
  const [taskForm, setTaskForm] = useState<string>('');

  const updateTaskParams = useCallback((fileName: string, updatedTask: Partial<EditableTask>) => {
    setTasksRaw((currentTasks) => (
      currentTasks
        .map((currentTask: Task) => {
          if (currentTask.fileName !== fileName) {
            return currentTask;
          }

          return {
            ...currentTask,
            ...updatedTask,
          };
        })
        .sort(sortTasks)
    ));
  }, []);

  const updateTaskVisibility = useCallback((fileName: string, updatedTask: Partial<TaskVisibility>) => {
    setTasksRaw((currentTasks) => (
      currentTasks
        .map((currentTask: Task) => {
          if (currentTask.fileName !== fileName) {
            return currentTask;
          }

          return {
            ...currentTask,
            ...updatedTask,
          };
        })
        .sort(sortTasks)
    ));
  }, []);

  const setTasks = useCallback((newTasks: Task[]) => {
    setTasksRaw([...newTasks].sort(sortTasks));
  }, []);

  const updateMachiningOperationParams = useCallback((taskType: TaskType, update: Partial<MachiningParams>) => {
    const currentOperations = machiningOperations || machiningDefaultOperations();
    const updatedParams: MachiningParams = {
      ...currentOperations[taskType],
      ...update,
    };

    setMachiningOperations({
      ...currentOperations,
      [taskType]: updatedParams,
    });
  }, [machiningOperations, setMachiningOperations]);

  const setGlobalError = useCallback((errorText: string) => {
    setGlobalErrors((currentErrors) => ([
      ...currentErrors,
      errorText,
    ]));
  }, []);

  const resetGlobalError = useCallback(() => {
    setGlobalErrors([]);
  }, []);

  useTransformer({
    tasks,
    setBusy,
    setRenderedTasks,
    setGlobalBounds,
    setGlobalUnits,
    setGlobalError,
    resetGlobalError,
    setProgress,
  });

  const contextValue: MainContextValue = useMemo(() => ({
    setTasks,
    setBusy,
    setActiveHandles,
    setOperationForm,
    setTaskForm,
    tasks,
    busy,
    progress,
    activeHandles,
    globalErrors,
    updateTaskParams,
    updateTaskVisibility,
    updateMachiningOperationParams,
    renderedTasks,
    globalBounds,
    globalUnits,
    operationForm,
    taskForm,
    machiningOperations: machiningOperations as MachiningOperations,
  }), [setTasks, tasks, busy, progress, activeHandles, globalErrors, updateTaskParams, updateTaskVisibility, updateMachiningOperationParams, renderedTasks, globalBounds, globalUnits, operationForm, taskForm, machiningOperations]);

  return (
    <mainContext.Provider value={contextValue}>
      {children}
    </mainContext.Provider>
  );
}

export const useMainContext = (): MainContextValue => {
  const context = useContext(mainContext);
  if (!context) {
    throw new Error('useMainContext must be used within a MainProvider');
  }

  return context;
};
