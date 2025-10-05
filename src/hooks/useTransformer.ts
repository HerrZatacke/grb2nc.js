import { Remote, wrap } from 'comlink';
import { useEffect, useRef } from 'react';
import { transformer } from '@/modules/transformer';
import { Task, RenderedTask } from '@/types/tasks.ts';
import type { TansformWorkerApi, TransformWorkerParams, TransformWorkerResult } from '@/workers/transformWorker';

const svgViewBoxOffset = 75;

// export interface UseTransformer {
//   precision: number;
// }

interface UseTransformerParams {
  tasks: Task[];
  setBusy: (busy: boolean) => void;
  setRenderedTasks: (renderedTasks: RenderedTask[]) => void;
  setViewBox: (viewBox: string) => void;
}

export const useTransformer = (useTransformerParams: UseTransformerParams) => {
  const { tasks, setBusy, setRenderedTasks, setViewBox } = useTransformerParams;
  const workerApi = useRef<Remote<TansformWorkerApi> | null>(null);

  const precision = transformer.getPrecision();

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

      const x = bounds.left / precision;
      const y = bounds.top / precision;
      const w = (bounds.right - bounds.left) / precision;
      const h = (bounds.bottom - bounds.top) / precision;
      setViewBox([
        Math.round(x -svgViewBoxOffset),
        Math.round(y -svgViewBoxOffset),
        Math.round(w + (2 * svgViewBoxOffset)),
        Math.round(h + (2 * svgViewBoxOffset)),
      ].join(' '));

      setRenderedTasks(renderedTasks);
      setBusy(false);
    };

    setBusy(true);

    const params: TransformWorkerParams = {
      tasks,
      precision,
    };

    workerApi.current.calculate(params)
      .then((result) => {
        handleResult(result);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [tasks, setBusy, precision, setViewBox, setRenderedTasks]);
};
