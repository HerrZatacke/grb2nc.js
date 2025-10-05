import { useCallback } from 'react';
import { RenderedTask } from '@/types/tasks.ts';

interface UseDownloadNC {
  downloadNCCode: (task: RenderedTask) => void;
}

export const useDownloadNC = (): UseDownloadNC => {
  const downloadNCCode = useCallback((task: RenderedTask) => {
    console.log(task.offsetPaths);
  }, []);

  return {
    downloadNCCode,
  };
};
