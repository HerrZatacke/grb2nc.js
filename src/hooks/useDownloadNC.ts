import { saveAs } from 'file-saver';
import { useCallback } from 'react';
import { useMainContext } from '@/components/MainContext';
import { generateGCode } from '@/modules/machining/generateGCode.ts';
import { transformer } from '@/modules/transformer';

interface UseDownloadNC {
  downloadNCCode: (fileName: string) => void;
}

export const useDownloadNC = (): UseDownloadNC => {
  const { renderedTasks, machiningOperations } = useMainContext();
  const downloadNCCode = useCallback((fileName: string) => {
    const renderedTask = renderedTasks.find((task) => (task.fileName === fileName));

    if (!renderedTask) { return; }

    const gCode = generateGCode(
      renderedTask.offsetPaths.flat(1),
      transformer.getScale(),
      machiningOperations[renderedTask.type],
    );
    saveAs(new Blob([gCode]), 'gcode.nc');
  }, [machiningOperations, renderedTasks]);

  return {
    downloadNCCode,
  };
};
