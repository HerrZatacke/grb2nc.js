import { Remote, wrap } from 'comlink';
import { useEffect, useRef } from 'react';
import { getViewBox } from '@/modules/renderSVG';
import { transformer } from '@/modules/transformer';
import { Task, RenderedTask } from '@/types/tasks.ts';
import type { TansformWorkerApi, TransformWorkerParams, TransformWorkerResult } from '@/workers/transformWorker';

interface UseTransformerParams {
  tasks: Task[];
  setBusy: (busy: boolean) => void;
  setRenderedTasks: (renderedTasks: RenderedTask[]) => void;
  setViewBox: (viewBox: string) => void;
}

export const useTransformer = (useTransformerParams: UseTransformerParams) => {
  const { tasks, setBusy, setRenderedTasks, setViewBox } = useTransformerParams;
  const workerApi = useRef<Remote<TansformWorkerApi> | null>(null);

  const scale = transformer.getScale();

  useEffect(() => {
    const handle = setTimeout(() => {
      const worker = new Worker(new URL('@/workers/transformWorker', import.meta.url), { type: 'module' });
      workerApi.current = wrap<TansformWorkerApi>(worker);
    }, 1);

    return () => clearTimeout(handle);
  }, []);

  useEffect(() => {
    if (!workerApi.current || !tasks.length) { return; }

    const handleResult = ({ bounds, renderedTasks, timings }: TransformWorkerResult) => {
      console.info(timings.join('\n'));
      setViewBox(getViewBox(bounds));
      setRenderedTasks(renderedTasks);
      setBusy(false);
    };

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
  }, [tasks, setBusy, scale, setViewBox, setRenderedTasks]);
};
