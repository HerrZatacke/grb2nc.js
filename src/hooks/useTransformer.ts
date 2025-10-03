import {useEffect, useState} from "react";
import { wrap } from 'comlink';
import {useMainContext} from "@/components/MainContext";
import {transformer} from "@/modules/transformer";
import {TaskProps} from "@/types/tasks.ts";
import {type TansformWorkerApi} from "@/workers/transformWorker";

const svgViewBoxOffset = 75;

export interface UseTransformer {
  paths: TaskProps[];
  viewBox: string;
  precision: number;
}


export const useTransformer = (): UseTransformer => {
  const {tasks} = useMainContext();
  const [paths, setPaths] = useState<TaskProps[]>([]);
  const [viewBox, setViewBox] = useState<string>('');
  const precision = transformer.getPrecision();

  useEffect(() => {
    const worker = new Worker(new URL('@/workers/transformWorker', import.meta.url), { type: 'module' });
    const api = wrap<TansformWorkerApi>(worker);

    // setIsWorking(true);

    api.calculate(tasks, precision)
      .then(({ bounds, paths, timings }) => {
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
      });

  }, [tasks]);

  return {
    paths,
    viewBox,
    precision,
  };
}
