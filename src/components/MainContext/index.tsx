'use client';

import {PropsWithChildren, useCallback, useState} from 'react';
import { createContext, useContext, useMemo } from 'react';
import {Task} from '@/types/tasks.ts';

interface MainContextValue {
  tasks: Task[];
  updateTask: (task: Task) => void;
  setTasks: (tasks: Task[]) => void;
  busy: boolean,
  setBusy: (busy: boolean) => void;
}

const mainContext = createContext<MainContextValue | null>(null);

export function MainProvider({ children }: PropsWithChildren) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [busy, setBusy] = useState<boolean>(false);

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

  const contextValue: MainContextValue = useMemo(() => ({
    tasks,
    setTasks,
    busy,
    setBusy,
    updateTask,
  }), [tasks, busy, updateTask]);

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
