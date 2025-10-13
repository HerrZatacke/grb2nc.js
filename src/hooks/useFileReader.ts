import { identifyLayers, type LayerIdentity } from '@tracespace/identify-layers';
import { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useMainContext } from '@/components/MainContext';
import { Layer, Task, TaskType } from '@/types/tasks.ts';

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
    default:
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

  const createTaskFromFile = useCallback(async (taskFile: File, identity: LayerIdentity): Promise<Task | null> => {
    const name = (taskFile.name as string).toLowerCase();
    const ext = name.split('.').pop() || '';
    if (!extensions.includes(`.${ext}`)) {
      return null;
    }

    let hideAreas = true;

    let layer: Layer;
    switch (identity.side) {
      case 'top':
        layer = Layer.TOP;
        break;
      case 'all': // drill and edgecuts
      case 'bottom':
        layer = Layer.BOTTOM;
        break;
      default:
        layer = Layer.OTHER;
        break;
    }

    let type: TaskType;
    switch (identity.type) {
      case 'copper':
        type = TaskType.ISOLATION;
        hideAreas = false;
        break;
      case 'drill':
        type = TaskType.DRILL;
        hideAreas = false;
        break;
      case 'outline':
        type = TaskType.EDGE_CUT;
        hideAreas = false;
        break;

      case 'silkscreen':
      case 'soldermask':
      case 'solderpaste':
        hideAreas = false;
        type = TaskType.DRAWING;
        layer = Layer.OTHER;
        break;

      default:
        type = TaskType.DRAWING;
        layer = Layer.OTHER;
        break;
    }



    return {
      fileName: taskFile.name,
      fileTime: taskFile.lastModified,
      fileContent: await taskFile.text(),
      hidePaths: layer === Layer.OTHER,
      hideAreas,
      steps: getSteps(type),
      offset: getOffset(type),
      type,
      layer,
    };
  }, []);

  useEffect(() => {
    if (!fileHandles?.length) { return; }

    const updateHandles = async () => {
      const layerMapping = identifyLayers(fileHandles.map((handle) => (handle.name)));

      const newTasks: Task[] = (await Promise.all(
        fileHandles.map(async (handle): Promise<Task | null> => {
          const identity = layerMapping[handle.name];
          try {
            const file = await handle.getFile();
            return createTaskFromFile(file, identity);
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

    const layerMapping = identifyLayers([...input.files].map((handle) => (handle.name)));

    const newTasks: (Task | null)[] = await Promise.all([...input.files].map((file) => {
      const identity = layerMapping[file.name];
      return createTaskFromFile(file, identity);
    }));

    input.value = '';
    setTasks(newTasks.filter(Boolean) as Task[]);
  }, [createTaskFromFile, setTasks]);

  return {
    canUseFilePicker,
    onFileInputChange,
    requestInputHandle,
  };
};
