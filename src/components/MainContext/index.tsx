'use client';

import { IntRect } from 'clipper-lib';
import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import { useTransformer } from '@/hooks/useTransformer.ts';
import { RenderedTask, Task, Units } from '@/types/tasks.ts';
import { defaultBounds } from '@/workers/transformWorker/functions/defaultBounds.ts';

interface MainContextValue {
  tasks: Task[];
  updateTask: (fileName: string, updatedTask: Partial<Task>) => void;
  setTasks: (tasks: Task[]) => void;
  busy: boolean,
  progress: number,
  activeHandles: number,
  setBusy: (busy: boolean) => void;
  setActiveHandles: (count: number) => void;
  renderedTasks: RenderedTask[];
  globalBounds: IntRect;
  globalUnits: Units;
}

const mainContext = createContext<MainContextValue | null>(null);

export function MainProvider({ children }: PropsWithChildren) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [busy, setBusy] = useState<boolean>(false);
  const [activeHandles, setActiveHandles] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [renderedTasks, setRenderedTasks] = useState<RenderedTask[]>([]);
  const [globalBounds, setGlobalBounds] = useState<IntRect>(() => defaultBounds(0));
  const [globalUnits, setGlobalUnits] = useState<Units>(Units.MILLIMETERS);

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

  useTransformer({
    tasks,
    setBusy,
    setRenderedTasks,
    setGlobalBounds,
    setGlobalUnits,
    setProgress,
  });

  const contextValue: MainContextValue = useMemo(() => ({
    setTasks,
    setBusy,
    setActiveHandles,
    tasks,
    busy,
    progress,
    activeHandles,
    updateTask,
    renderedTasks,
    globalBounds,
    globalUnits,
  }), [tasks, busy, progress, activeHandles, updateTask, renderedTasks, globalBounds, globalUnits]);

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
