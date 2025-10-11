import { useCallback, type ChangeEvent, useState, useEffect } from 'react';
import { useMainContext } from '@/components/MainContext';
import { Task, TaskType } from '@/types/tasks.ts';

export interface UseFileReader {
  canUseFilePicker: boolean;
  onFileInputChange: (ev: ChangeEvent<HTMLInputElement>) => Promise<void>;
  requestInputHandle: () => void;
}

export const getSteps = (type: TaskType): number => {
  switch (type) {
    case TaskType.EDGE_CUT:
      return 1;
    case TaskType.ISOLATION:
      return 1;
    case TaskType.DRILL:
      return 0;
  }
};

export const getOffset = (type: TaskType): number => {
  switch (type) {
    case TaskType.EDGE_CUT:
      return 1.5; // assuming a 3.0mm wide cutter
    case TaskType.ISOLATION:
      return 0.05; // assuming a 0.1mm wide mill
    case TaskType.DRILL:
    default:
      return 0; // not required
  }
};


const extensions: `.${string}`[] = ['.gbr', '.drl'];

const tasksAreEqual = (arr1: Task[], arr2: Task[]): boolean => {
  if (arr1.length !== arr2.length) return false;

  const normalize = (o: Task) => `${o.fileName}|${o.fileTime}`;

  const set1 = new Set(arr1.map(normalize));
  const set2 = new Set(arr2.map(normalize));

  if (set1.size !== set2.size) return false;

  for (const val of set1) {
    if (!set2.has(val)) return false;
  }

  return true;
};

export const useFileReader = (): UseFileReader => {
  const { tasks, setTasks, setActiveHandles } = useMainContext();
  const [fileHandles, setFileHandles] = useState<FileSystemFileHandle[]>();
  const [canUseFilePicker, setCanUseFilePicker] = useState(false);

  useEffect(() => {
    setCanUseFilePicker(typeof window.showOpenFilePicker === 'function');
  }, []);

  const requestInputHandle = useCallback(async () => {
    try {
      const handles = await window.showOpenFilePicker({
        multiple: true,
        types: [
          {
            description: 'Gerber files',
            accept: { 'text/plain': extensions },
          },
        ],
      });

      setFileHandles(handles);
      setActiveHandles(handles.length);
    } catch {
      setFileHandles([]);
      setActiveHandles(0);
    }
  }, [setActiveHandles]);

  const createTaskFromFile = useCallback(async (taskFile: File): Promise<Task | null> => {
    const name = (taskFile.name as string).toLowerCase();
    const ext = name.split('.').pop() || '';
    if (!extensions.includes(`.${ext}`)) return null;

    let type: TaskType;
    let flip: boolean;

    // for now, let's flip everything but the top layer, because they can be milled at the same time as the bottom copper
    if (ext === 'drl') {
      type = TaskType.DRILL;
      flip = true;
    } else if (name.includes('edge')) {
      type = TaskType.EDGE_CUT;
      flip = true;
    } else if (name.includes('b_cu') || name.includes('bottom')) {
      type = TaskType.ISOLATION;
      flip = true;
    } else {
      // only the top layer does not get flipped
      type = TaskType.ISOLATION;
      flip = false;
    }

    return {
      fileName: taskFile.name,
      fileTime: taskFile.lastModified,
      fileContent: await taskFile.text(),
      hidePaths: false,
      hideAreas: false,
      steps: getSteps(type),
      offset: getOffset(type),
      type,
      flip,
    };
  }, []);

  useEffect(() => {
    if (!fileHandles?.length) { return; }

    const updateHandles = async () => {
      const newTasks: Task[] = (await Promise.all(
        fileHandles.map(async (handle): Promise<Task | null> => {
          try {
            const file = await handle.getFile();
            return createTaskFromFile(file);
          } catch {
            return null;
          }
        }),
      ))
        .filter(Boolean) as Task[];

      if (!tasksAreEqual(tasks, newTasks)) {
        setTasks(newTasks);
      }
    };

    const intervalHandle = window.setInterval(updateHandles, 2000);
    updateHandles();

    return () => window.clearInterval(intervalHandle);
  }, [createTaskFromFile, fileHandles, setTasks, tasks]);

  const onFileInputChange = useCallback(async (ev: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const input = ev.currentTarget;
    if (!input.files?.length) { throw new Error('can not read files'); }
    const newTasks: (Task | null)[] = await Promise.all([...input.files].map(createTaskFromFile));
    input.value = '';
    setTasks(newTasks.filter(Boolean) as Task[]);
  }, [createTaskFromFile, setTasks]);

  return {
    canUseFilePicker,
    onFileInputChange,
    requestInputHandle,
  };
};
