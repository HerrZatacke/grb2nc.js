import {saveAs} from 'file-saver';
import {useCallback} from 'react';
import {useMainContext} from '@/components/MainContext';
import {Flip, generateGCode} from '@/modules/machining/generateGCode.ts';
import {transformer} from '@/modules/transformer';
import {Layer} from "@/types/tasks.ts";

interface UseDownloadNC {
  downloadNCCode: (fileName: string) => void;
}

export const useDownloadNC = (): UseDownloadNC => {
  const { renderedTasks, machiningOperations } = useMainContext();
  const downloadNCCode = useCallback((fileName: string) => {
    const renderedTask = renderedTasks.find((task) => (task.fileName === fileName));

    if (!renderedTask) { return; }

    const gCode = generateGCode({
      contours: renderedTask.offsetPaths.flat(1),
      drills: renderedTask.drills,
      flip: renderedTask.layer === Layer.TOP ? Flip.Y : Flip.BOTH,
      params: machiningOperations[renderedTask.type],
      scale: transformer.getScale(),
      description: `${renderedTask.type} - "${renderedTask.fileName}"`,
    });

    saveAs(new Blob([gCode]), `${renderedTask.fileName}.nc`);
  }, [machiningOperations, renderedTasks]);

  return {
    downloadNCCode,
  };
};
