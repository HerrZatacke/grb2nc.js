'use client';

import {PropsWithChildren, useCallback, useState} from 'react';
import { createContext, useContext, useMemo } from 'react';
import {Task} from "@/types/tasks.ts";

interface MainContextValue {
  tasks: Task[];
  updateTask: (task: Task) => void;
  setTasks: (tasks: Task[]) => void;
}

const mainContext = createContext<MainContextValue | null>(null);

export function MainProvider({ children }: PropsWithChildren) {
  const [tasks, setTasks] = useState<Task[]>([]);

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
    updateTask,
    setTasks,
  }), [tasks]);

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
