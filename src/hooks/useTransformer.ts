import { Remote, wrap, proxy } from 'comlink';
import { useEffect, useRef } from 'react';
import { getViewBox } from '@/modules/renderSVG';
import { transformer } from '@/modules/transformer';
import { Task, RenderedTask } from '@/types/tasks.ts';
import {
  ITansformWorkerApi,
  TransformWorkerParams,
  TransformWorkerResult,
} from '@/workers/transformWorker/functions/types.ts';

interface UseTransformerParams {
  tasks: Task[];
  setBusy: (busy: boolean) => void;
  setProgress: (progress: number) => void;
  setRenderedTasks: (renderedTasks: RenderedTask[]) => void;
  setViewBox: (viewBox: string) => void;
}

export const useTransformer = (useTransformerParams: UseTransformerParams) => {
  const { tasks, setBusy, setRenderedTasks, setViewBox, setProgress } = useTransformerParams;
  const workerApi = useRef<Remote<ITansformWorkerApi> | null>(null);

  const scale = transformer.getScale();

  useEffect(() => {
    const worker = new Worker(new URL('@/workers/transformWorker', import.meta.url), { type: 'module' });
    const handle = setTimeout(() => {
      workerApi.current = wrap<ITansformWorkerApi>(worker);
      workerApi.current.setup(proxy(setProgress));
    }, 1);

    return () => {
      clearTimeout(handle);
      worker.terminate();
    };
  }, [setProgress]);

  useEffect(() => {
    if (!workerApi.current || !tasks.length) { return; }

    const handleResult = ({ bounds, renderedTasks, timings }: TransformWorkerResult) => {
      console.info(timings.join('\n'));
      setViewBox(getViewBox(bounds));
      setRenderedTasks(renderedTasks);
      setBusy(false);
    };

    setProgress(0.001);
    setBusy(true);

    const params: TransformWorkerParams = {
      tasks,
      scale,
    };

    workerApi.current.calculate(params)
      .then((result) => {
        handleResult(result);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [tasks, setBusy, scale, setViewBox, setRenderedTasks, setProgress]);
};
