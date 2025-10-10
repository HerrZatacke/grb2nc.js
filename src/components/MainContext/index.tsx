'use client';

import { IntRect } from 'clipper-lib';
import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import { useLocalStorage } from 'react-storage-complete';
import { useTransformer } from '@/hooks/useTransformer.ts';
import { machiningDefaultOperations } from '@/modules/machining/machiningDefaults.ts';
import { MachiningOperations, MachiningParams } from '@/types/machining.ts';
import { RenderedTask, Task, TaskType, Units } from '@/types/tasks.ts';
import { defaultBounds } from '@/workers/transformWorker/functions/defaultBounds.ts';

interface MainContextValue {
  tasks: Task[];
  updateTask: (fileName: string, updatedTask: Partial<Task>) => void;
  updateMachiningOperationParam: (taskType: TaskType, param: keyof MachiningParams, value: string) => void;
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
  operationForm: TaskType | null;
  setOprtationForm: (operationForm: TaskType | null) => void;
}

const MACHINING_PARAMS_STORAGE_KEY = 'machiningParams';

const mainContext = createContext<MainContextValue | null>(null);

export function MainProvider({ children }: PropsWithChildren) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [busy, setBusy] = useState<boolean>(false);
  const [activeHandles, setActiveHandles] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [renderedTasks, setRenderedTasks] = useState<RenderedTask[]>([]);
  const [globalBounds, setGlobalBounds] = useState<IntRect>(() => defaultBounds(0));
  const [globalUnits, setGlobalUnits] = useState<Units>(Units.MILLIMETERS);
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [machiningOperations, setMachiningOperations] = useLocalStorage<MachiningOperations>(MACHINING_PARAMS_STORAGE_KEY, machiningDefaultOperations());
  const [operationForm, setOprtationForm] = useState<TaskType | null>(null);

  const updateTask = useCallback((fileName: string, updatedTask: Partial<Task>) => {
    setTasks((currentTasks) => (
      currentTasks.map((currentTask: Task) => {
        if (currentTask.fileName !== fileName) {
          return currentTask;
        }

        return {
          ...currentTask,
          ...updatedTask,
        };
      })
    ));
  }, []);

  const updateMachiningOperationParam = useCallback((taskType: TaskType, param: keyof MachiningParams, value: string) => {
    const currentOperations = machiningOperations || machiningDefaultOperations();
    const updatedParams: MachiningParams = {
      ...currentOperations[taskType],
      [param]: value,
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
    setOprtationForm,
    tasks,
    busy,
    progress,
    activeHandles,
    globalErrors,
    updateTask,
    updateMachiningOperationParam,
    renderedTasks,
    globalBounds,
    globalUnits,
    operationForm,
    machiningOperations: machiningOperations as MachiningOperations,
  }), [tasks, busy, progress, activeHandles, globalErrors, updateTask, updateMachiningOperationParam, renderedTasks, globalBounds, globalUnits, operationForm, machiningOperations]);

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
