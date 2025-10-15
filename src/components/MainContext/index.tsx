'use client';

import { IntRect } from 'clipper-lib';
import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import { useLocalStorage } from 'react-storage-complete';
import { useTransformer } from '@/hooks/useTransformer.ts';
import { defaultSettings } from '@/modules/globalSettings';
import { machiningDefaultOperations } from '@/modules/machining/machiningDefaults.ts';
import { sortTasks } from '@/modules/sortTasks';
import { type MachiningOperations, type MachiningParams } from '@/types/machining.ts';
import { type GlobalSettings } from '@/types/settings';
import { EditableTask, RenderedTask, Task, TaskType, TaskVisibility, Units } from '@/types/tasks.ts';
import { defaultBounds } from '@/workers/transformWorker/functions/defaultBounds.ts';

export type UpdateTaskParamsFunction = (fileName: string, updatedTask: Partial<EditableTask>) => void;
export type UpdateTaskVisibilityFunction = (fileName: string, updatedTask: Partial<TaskVisibility>) => void;
export type UpdateMachiningOperationParamsFunction = (taskType: TaskType, update: Partial<MachiningParams>) => void

interface MainContextValue {
  activeHandles: number,
  busy: boolean,
  globalBounds: IntRect;
  globalErrors: string[],
  globalSettings: GlobalSettings,
  globalUnits: Units;
  machiningOperations: MachiningOperations;
  operationForm: TaskType | null;
  progress: number,
  renderedTasks: RenderedTask[];
  setActiveHandles: (count: number) => void;
  setBusy: (busy: boolean) => void;
  updateGlobalSettings: (settings: Partial<GlobalSettings>) => void;
  setOperationForm: (operationForm: TaskType | null) => void;
  setShowSettings: (show: boolean) => void;
  setTaskForm: (fileName: string) => void;
  setTasks: (tasks: Task[]) => void;
  setVisibilities: (vilibilities: TaskVisibility[]) => void;
  showSettings: boolean,
  taskForm: string;
  tasks: Task[];
  updateMachiningOperationParams: UpdateMachiningOperationParamsFunction;
  updateTaskParams: UpdateTaskParamsFunction;
  updateVisibility: UpdateTaskVisibilityFunction;
  visibilities: TaskVisibility[];
}

const MACHINING_PARAMS_STORAGE_KEY = 'grb2nc.machiningParams';
const SETTINGS_STORAGE_KEY = 'grb2nc.settings';

const mainContext = createContext<MainContextValue | null>(null);

export function MainProvider({ children }: PropsWithChildren) {
  const [activeHandles, setActiveHandles] = useState<number>(0);
  const [busy, setBusy] = useState<boolean>(false);
  const [globalBounds, setGlobalBounds] = useState<IntRect>(() => defaultBounds(0));
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [globalSettings, setGlobalSettings] = useLocalStorage<GlobalSettings>(SETTINGS_STORAGE_KEY, defaultSettings());
  const [globalUnits, setGlobalUnits] = useState<Units>(Units.MILLIMETERS);
  const [machiningOperations, setMachiningOperations] = useLocalStorage<MachiningOperations>(MACHINING_PARAMS_STORAGE_KEY, machiningDefaultOperations());
  const [operationForm, setOperationForm] = useState<TaskType | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [renderedTasks, setRenderedTasks] = useState<RenderedTask[]>([]);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [taskForm, setTaskForm] = useState<string>('');
  const [tasks, setTasksRaw] = useState<Task[]>([]);
  const [visibilities, setVisibilities] = useState<TaskVisibility[]>([]);

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

  const updateVisibility = useCallback((fileName: string, updatedTask: Partial<TaskVisibility>) => {
    setVisibilities((currentTasks) => (
      currentTasks
        .map((currentTask: TaskVisibility) => {
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

  const updateGlobalSettings = useCallback((newGlobalSettings: Partial<GlobalSettings>) => {
    const currentFlobalSettings = globalSettings || defaultSettings();
    const updatedGlobalSettings: GlobalSettings = {
      ...currentFlobalSettings,
      ...newGlobalSettings,
    };
    setGlobalSettings(updatedGlobalSettings);
  }, [globalSettings, setGlobalSettings]);

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
    visibilities,
    setBusy,
    setRenderedTasks,
    setGlobalBounds,
    setGlobalUnits,
    setGlobalError,
    resetGlobalError,
    setProgress,
  });

  const contextValue: MainContextValue = useMemo(() => ({
    activeHandles,
    busy,
    globalBounds,
    globalErrors,
    globalSettings: globalSettings as GlobalSettings,
    globalUnits,
    machiningOperations: machiningOperations as MachiningOperations,
    operationForm,
    progress,
    renderedTasks,
    setActiveHandles,
    setBusy,
    setOperationForm,
    setShowSettings,
    setTaskForm,
    setTasks,
    setVisibilities,
    showSettings,
    taskForm,
    tasks,
    updateGlobalSettings,
    updateMachiningOperationParams,
    updateTaskParams,
    updateVisibility,
    visibilities,
  }), [activeHandles, busy, globalBounds, globalErrors, globalSettings, globalUnits, machiningOperations, operationForm, progress, renderedTasks, setTasks, showSettings, taskForm, tasks, updateMachiningOperationParams, updateTaskParams, updateVisibility, visibilities]);

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
