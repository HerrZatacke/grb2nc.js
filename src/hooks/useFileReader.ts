import { identifyLayers, type LayerIdentity } from '@tracespace/identify-layers';
import JSZip, { type JSZipObject } from 'jszip';
import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useMainContext } from '@/components/MainContext';
import { Layer, Task, TaskType, TaskVisibility } from '@/types/tasks.ts';

export interface UseFileReader {
  canUseFilePicker: boolean;
  onFileInputChange: (ev: ChangeEvent<HTMLInputElement>) => Promise<void>;
  requestInputHandle: () => void;
  extensions: `.${string}`[];
}

export interface CreateTasksResult {
  task: Task | null;
  taskVisibility: TaskVisibility | null;
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
  const { tasks, setTasks, setActiveHandles, setVisibilities } = useMainContext();
  const [fileHandles, setFileHandles] = useState<FileSystemFileHandle[]>();
  const [canUseFilePicker, setCanUseFilePicker] = useState(false);
  const extensions: `.${string}`[] = useMemo(() => (['.zip', '.gbr', '.drl']), []);

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
  }, [extensions, setActiveHandles]);

  const createTasksFromFile = useCallback(async (taskFile: File, identity: LayerIdentity): Promise<CreateTasksResult[]> => {
    const name = (taskFile.name as string).toLowerCase();
    const ext = name.split('.').pop() || '';

    if (ext === 'zip') {
      const zip = await JSZip.loadAsync(taskFile);

      const fileNames = Object.keys(zip.files).filter((fileName) => !fileName.endsWith('.zip'));

      const zipLayerMapping = identifyLayers(fileNames);

      const files = (await Promise.all(fileNames.map(async (fileName): Promise<File | null> => {
        const zipEntry: JSZipObject = zip.files[fileName];
        const fileContent = await zipEntry.async('blob');

        if (zipEntry.dir) { return null; }

        return new File([fileContent], fileName, { lastModified: zipEntry.date.getTime(), type: 'text/plain' });
      }))).filter(Boolean) as File[];

      return (await Promise.all(files.map(async (file: File): Promise<CreateTasksResult[]> => {
        const zipEntryIdentity = zipLayerMapping[file.name];
        try {
          return createTasksFromFile(file, zipEntryIdentity);
        } catch {
          return [];
        }
      })))
        .flat(1);
    }

    if (!extensions.includes(`.${ext}`)) {
      return [];
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

    const task: Task = {
      fileName: taskFile.name,
      fileTime: taskFile.lastModified,
      fileContent: await taskFile.text(),
      steps: getSteps(type),
      offset: getOffset(type),
      type,
      layer,
    };

    const taskVisibility: TaskVisibility = {
      fileName: taskFile.name,
      hidePaths: layer === Layer.OTHER,
      hideAreas,
    };

    return [{ task, taskVisibility }];
  }, [extensions]);

  const setUpdatedResults = useCallback((createTaskResults: CreateTasksResult[]) => {
    const newTasks = createTaskResults.reduce((acc: Task[], { task }): Task[] => (
      task ? [...acc, task] : acc
    ), []);

    const newTaskVisibilitiess = createTaskResults.reduce((acc: TaskVisibility[], { taskVisibility }): TaskVisibility[] => (
      taskVisibility ? [...acc, taskVisibility] : acc
    ), []);

    if (!tasksAreEqual(tasks, newTasks)) {
      setTasks(newTasks);
      setVisibilities(newTaskVisibilitiess);
    }
  }, [setVisibilities, setTasks, tasks]);

  useEffect(() => {
    if (!fileHandles?.length) { return; }

    const updateHandles = async () => {
      const layerMapping = identifyLayers(fileHandles.map((handle) => (handle.name)));

      const createTaskResults: CreateTasksResult[] = (await Promise.all(
        fileHandles.map(async (handle): Promise<CreateTasksResult[]> => {
          const identity = layerMapping[handle.name];
          try {
            const file = await handle.getFile();
            return createTasksFromFile(file, identity);
          } catch {
            return [];
          }
        }),
      )).flat(1);

      setUpdatedResults(createTaskResults);
    };

    const intervalHandle = window.setInterval(updateHandles, 2000);
    updateHandles();

    return () => window.clearInterval(intervalHandle);
  }, [createTasksFromFile, fileHandles, setUpdatedResults]);

  const onFileInputChange = useCallback(async (ev: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const input = ev.currentTarget;
    if (!input.files?.length) { throw new Error('can not read files'); }

    const layerMapping = identifyLayers([...input.files].map((handle) => (handle.name)));

    const newTasks: (CreateTasksResult)[] = (await Promise.all([...input.files].map((file): Promise<CreateTasksResult[]> => {
      const identity = layerMapping[file.name];
      return createTasksFromFile(file, identity);
    }))).flat(1);

    input.value = '';
    setUpdatedResults(newTasks);
  }, [createTasksFromFile, setUpdatedResults]);

  return {
    canUseFilePicker,
    onFileInputChange,
    requestInputHandle,
    extensions,
  };
};
