import {Task, TaskType} from "@/types/tasks.ts";
import {useMainContext} from "@/components/MainContext";
import {useCallback, type ChangeEvent, useState, useEffect} from "react";

export interface UseFileReader {
  canUseFilePicker: boolean;
  onFileInputChange: (ev: ChangeEvent<HTMLInputElement>) => Promise<void>;
  requestInputHandle: () => void;
}

const extensions: `.${string}`[] = ['.gbr', '.drl'];

const tasksAreEqual = (arr1: Task[], arr2: Task[]): boolean => {
  if (arr1.length !== arr2.length) return false;

  const normalize = (o: Task) => `${o.fileName}|${o.fileTime}`;

  const set1 = new Set(arr1.map(normalize));
  const set2 = new Set(arr2.map(normalize));

  if (set1.size !== set2.size) return false;

  for (let val of set1) {
    if (!set2.has(val)) return false;
  }

  return true;
}

export const useFileReader = (): UseFileReader => {
  const {tasks, setTasks} = useMainContext();
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
    } catch {
      setFileHandles([]);
    }
  }, []);

  const createTaskFromFile = useCallback(async (taskFile: File): Promise<Task | null> => {
    const name = (taskFile.name as string).toLowerCase();
    const ext = name.split('.').pop() || '';
    if (!extensions.includes(`.${ext}`)) return null;

    let type: TaskType = TaskType.ISOLATION;
    let flip = false;

    if (ext === 'drl') {
      type = TaskType.DRILL;
      flip = false;
    } else if (name.includes('edge')) {
      type = TaskType.EDGE_CUT;
      flip = false;
    } else if (name.includes('b_cu') || name.includes('bottom')) {
      type = TaskType.ISOLATION;
      flip = true;
    } else {
      type = TaskType.ISOLATION;
      flip = false;
    }

    return {
      fileName: taskFile.name,
      fileTime: taskFile.lastModified,
      fileContent: await taskFile.text(),
      hide: false,
      type,
      flip,
    };
  }, []);

  useEffect(() => {
    if (!fileHandles?.length) { return; }

    const updateHandles = async () => {
      const newTasks: Task[] = (await Promise.all(
        fileHandles.map(async (handle): Promise<Task | null> => {
          const file = await handle.getFile();
          return createTaskFromFile(file);
        })
      ))
        .filter(Boolean) as Task[];

      if (!tasksAreEqual(tasks, newTasks)) {
        console.log('relaODING tasks', tasks, newTasks);
        setTasks(newTasks);
      }
    };

    const intervalHandle = window.setInterval(updateHandles, 2000);
    updateHandles();

    return () => window.clearInterval(intervalHandle);
  }, [fileHandles, tasks])

  const onFileInputChange = useCallback(async (ev: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const input = ev.currentTarget;
    if (!input.files?.length) { throw new Error('can not read files'); }
    const tasks: (Task | null)[] = await Promise.all([...input.files].map(createTaskFromFile));
    input.value = '';
    setTasks(tasks.filter(Boolean) as Task[]);
  }, [setTasks]);

  return {
    canUseFilePicker,
    onFileInputChange,
    requestInputHandle,
  };
}
