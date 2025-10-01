'use client';

import {PropsWithChildren, useState} from 'react';
import { createContext, useContext, useMemo } from 'react';
import {Task} from "@/types/tasks.ts";

interface MainContextValue {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
}

const mainContext = createContext<MainContextValue | null>(null);

export function MainProvider({ children }: PropsWithChildren) {

  const [tasks, setTasks] = useState<Task[]>([]);

  const contextValue: MainContextValue = useMemo(() => ({
    tasks,
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
