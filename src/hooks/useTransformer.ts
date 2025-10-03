import {useEffect, useState} from "react";
import { wrap } from 'comlink';
import {useMainContext} from "@/components/MainContext";
import {transformer} from "@/modules/transformer";
import {TaskProps} from "@/types/tasks.ts";
import {type TansformWorkerApi, TransformWorkerParams, TransformWorkerResult} from "@/workers/transformWorker";
import {hash as ohash} from "ohash";

const svgViewBoxOffset = 75;

export interface UseTransformer {
  paths: TaskProps[];
  viewBox: string;
  precision: number;
}

const resultMap: Map<string, TransformWorkerResult> = new Map([]);

export const useTransformer = (): UseTransformer => {
  const {tasks, setBusy} = useMainContext();
  const [paths, setPaths] = useState<TaskProps[]>([]);
  const [viewBox, setViewBox] = useState<string>('');
  const precision = transformer.getPrecision();

  useEffect(() => {
    const worker = new Worker(new URL('@/workers/transformWorker', import.meta.url), { type: 'module' });
    const api = wrap<TansformWorkerApi>(worker);

    const handleResult = ({ bounds, paths, timings }: TransformWorkerResult) => {
      console.log(timings.join('\n'));

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
    const parameterHash = ohash(params);

    if (resultMap.has(parameterHash)) {
      const result = resultMap.get(parameterHash) as TransformWorkerResult;
      handleResult({
        ...result,
        timings: ['Result from cache'],
      });
    } else {
      api.calculate(params)
        .then((result) => {
          resultMap.set(parameterHash, result)
          handleResult(result);
        });
    }

  }, [tasks, setBusy]);

  return {
    paths,
    viewBox,
    precision,
  };
}
