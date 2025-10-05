import {useEffect, useRef, useState} from 'react';
import {Remote, wrap} from 'comlink';
import {useMainContext} from '@/components/MainContext';
import {transformer} from '@/modules/transformer';
import {TaskProps} from '@/types/tasks.ts';
import type {TansformWorkerApi, TransformWorkerParams, TransformWorkerResult} from '@/workers/transformWorker';

const svgViewBoxOffset = 75;

export interface UseTransformer {
  paths: TaskProps[];
  viewBox: string;
  precision: number;
}

export const useTransformer = (): UseTransformer => {
  const {tasks, setBusy} = useMainContext();
  const workerApi = useRef<Remote<TansformWorkerApi> | null>(null);
  const [paths, setPaths] = useState<TaskProps[]>([]);
  const [viewBox, setViewBox] = useState<string>('');
  const precision = transformer.getPrecision();

  useEffect(() => {
    const handle = setTimeout(() => {
      const worker = new Worker(new URL('@/workers/transformWorker', import.meta.url), { type: 'module' });
      workerApi.current = wrap<TansformWorkerApi>(worker);
    }, 1);

    return () => clearTimeout(handle);
  }, [])

  useEffect(() => {
    if (!workerApi.current || !tasks.length) { return; }

    const handleResult = ({ bounds, paths, timings }: TransformWorkerResult) => {
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

      setPaths(paths);
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
  }, [tasks, setBusy]);

  return {
    paths,
    viewBox,
    precision,
  };
}
