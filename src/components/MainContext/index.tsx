'use client';

import { PropsWithChildren, useCallback, useState, createContext, useContext, useMemo } from 'react';
import { useTransformer } from '@/hooks/useTransformer.ts';
import { Task, RenderedTask } from '@/types/tasks.ts';

interface MainContextValue {
  tasks: Task[];
  updateTask: (fileName: string, updatedTask: Partial<Task>) => void;
  setTasks: (tasks: Task[]) => void;
  busy: boolean,
  progress: number,
  setBusy: (busy: boolean) => void;
  renderedTasks: RenderedTask[];
  viewBox: string;
}

const mainContext = createContext<MainContextValue | null>(null);

export function MainProvider({ children }: PropsWithChildren) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [busy, setBusy] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [renderedTasks, setRenderedTasks] = useState<RenderedTask[]>([]);
  const [viewBox, setViewBox] = useState<string>('');

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
    setViewBox,
    setProgress,
  });

  const contextValue: MainContextValue = useMemo(() => ({
    setTasks,
    setBusy,
    tasks,
    busy,
    progress,
    updateTask,
    renderedTasks,
    viewBox,
  }), [tasks, busy, progress, updateTask, renderedTasks, viewBox]);

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
