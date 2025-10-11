import { IntRect } from 'clipper-lib';
import { Remote, wrap, proxy } from 'comlink';
import { useEffect, useRef } from 'react';
import { transformer } from '@/modules/transformer';
import { Task, RenderedTask, Units } from '@/types/tasks.ts';
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
  setGlobalBounds: (bounds: IntRect) => void;
  setGlobalUnits: (units: Units) => void;
  setGlobalError: (error: string) => void;
  resetGlobalError: () => void;
}

export const useTransformer = (useTransformerParams: UseTransformerParams) => {
  const { tasks, setBusy, setRenderedTasks, setGlobalBounds, setProgress, setGlobalError, resetGlobalError, setGlobalUnits } = useTransformerParams;
  const workerApi = useRef<Remote<ITansformWorkerApi> | null>(null);

  const scale = transformer.getScale();

  useEffect(() => {
    const worker = new Worker(new URL('@/workers/transformWorker', import.meta.url), { type: 'module' });
    const handle = setTimeout(() => {
      workerApi.current = wrap<ITansformWorkerApi>(worker);
      workerApi.current.setup(proxy(setProgress), proxy(setGlobalError));
    }, 1);

    return () => {
      clearTimeout(handle);
      worker.terminate();
    };
  }, [setGlobalError, setProgress]);

  useEffect(() => {
    if (!workerApi.current || !tasks.length) { return; }

    const handleResult = ({ bounds, renderedTasks, units }: TransformWorkerResult) => {
      // console.info(timings.join('\n'));

      setGlobalBounds({
        left: Math.min(bounds.left, 0),
        top: Math.min(bounds.top, 0),
        right: Math.max(bounds.right, 0),
        bottom: Math.max(bounds.bottom, 0),
      });

      // setGlobalBounds(bounds);
      setGlobalUnits(units);
      setRenderedTasks(renderedTasks);
      setBusy(false);
    };

    setProgress(0.001);
    resetGlobalError();
    setBusy(true);

    const params: TransformWorkerParams = {
      tasks,
      scale,
    };

    workerApi.current.calculate(params)
      .then(handleResult)
      .catch((error) => {
        setGlobalError((error as Error).message);
      });
  }, [tasks, setBusy, scale, setGlobalBounds, setRenderedTasks, setProgress, setGlobalUnits, setGlobalError, resetGlobalError]);
};
