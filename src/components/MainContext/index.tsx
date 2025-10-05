'use client';

import {PropsWithChildren, useCallback, useState, createContext, useContext, useMemo} from 'react';
import {Task, RenderedTask} from '@/types/tasks.ts';
import {useTransformer} from "@/hooks/useTransformer.ts";

interface MainContextValue {
  tasks: Task[];
  updateTask: (task: Task) => void;
  setTasks: (tasks: Task[]) => void;
  busy: boolean,
  setBusy: (busy: boolean) => void;
  renderedTasks: RenderedTask[];
  viewBox: string;
}

const mainContext = createContext<MainContextValue | null>(null);

export function MainProvider({ children }: PropsWithChildren) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [busy, setBusy] = useState<boolean>(false);
  const [renderedTasks, setRenderedTasks] = useState<RenderedTask[]>([]);
  const [viewBox, setViewBox] = useState<string>('');

  const updateTask = useCallback((updateTask: Task) => {
    setTasks((currentTasks) => (
      currentTasks.map((task: Task) => {
        if (task.fileName !== updateTask.fileName) {
          return task;
        }

        return updateTask;
      })
    ))
  }, []);

  useTransformer({ tasks, setBusy, setRenderedTasks, setViewBox });

  const contextValue: MainContextValue = useMemo(() => ({
    setTasks,
    setBusy,
    tasks,
    busy,
    updateTask,
    renderedTasks,
    viewBox,
  }), [tasks, busy, updateTask, renderedTasks, viewBox]);

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
