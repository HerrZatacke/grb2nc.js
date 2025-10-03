import {useEffect, useState} from "react";
import {Clipper, type IntRect} from "clipper-lib";
import {useMainContext} from "@/components/MainContext";
import {parse} from "@hpcreery/tracespace-parser";
import {plot} from "@hpcreery/tracespace-plotter";
import {transformer} from "@/modules/transformer";
import {Polygon} from "@/types/geo";
import {Task} from "@/types/tasks.ts";
import {getColor, getOffset, getOffsetStroke, getSteps, polygonsToPath} from "@/modules/render";
import {createOffset} from "@/modules/createOffset";

const svgViewBoxOffset = 75;

interface TaskWithPolygons extends Task {
  polygons: Polygon[];
  steps: number;
  offset: number;
}

interface TaskProps {
  path: string;
  fill: string;
  stroke: string;
  strokeWidth: string;
  hide: boolean;
}

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
    if (!tasks.length) { return; }

    const transformedTasks = tasks.map((task): TaskWithPolygons => {
      const syntaxTree = parse(task.fileContent)
      const imageTree = plot(syntaxTree);
      transformer.run(imageTree, task.type);

      const polygons = transformer.result(task.type);

      return {
        ...task,
        polygons,
        steps: getSteps(task.type),
        offset: getOffset(task.type)
      }
    });

    const globalBounds: IntRect = transformedTasks.reduce((acc: IntRect, { polygons }): IntRect => {
      const bounds = Clipper.GetBounds(polygons);
      return {
        bottom: Math.max(acc.bottom, bounds.bottom),
        left: Math.min(acc.left, bounds.left),
        right: Math.max(acc.right, bounds.right),
        top: Math.min(acc.top, bounds.top),
      };
    }, {
      bottom: -Infinity,
      left: Infinity,
      right: -Infinity,
      top: Infinity,
    });

    const x = globalBounds.left / precision;
    const y = globalBounds.top / precision;
    const w = (globalBounds.right - globalBounds.left) / precision;
    const h = (globalBounds.bottom - globalBounds.top) / precision;
    setViewBox([
      Math.round(x -svgViewBoxOffset),
      Math.round(y -svgViewBoxOffset),
      Math.round(w + (2 * svgViewBoxOffset)),
      Math.round(h + (2 * svgViewBoxOffset)),
    ].join(' '));

    const paths = transformedTasks.map(({ polygons, type, flip, steps, offset, hide }): TaskProps[] => {
      // const start = Date.now();
      const color = getColor(type, flip);


      // create filled shape
      const taskPaths: TaskProps[] = [{
        path: polygonsToPath(polygons, precision),
        fill: `rgba(${color}, 0.1)`,
        stroke: `rgba(${color}, 0.6)`,
        strokeWidth: '0.5',
        hide,
      }];


      // const clipperOffsetStart = Date.now();
      // create preview paths
      const offsetPaths = Array.from({ length: steps })
        .reduce((acc: Polygon[][]): Polygon[][] => {
          const next = createOffset(acc[acc.length - 1], offset);
          return [...acc, next];
        }, [polygons])
        .slice(1);

      // const svgOffsetStart = Date.now();
      taskPaths.push(...offsetPaths.map((offsetPath: Polygon[]) => ({
        path: polygonsToPath(offsetPath, precision),
        fill: "none",
        stroke: `rgba(${color}, 1)`,
        strokeWidth: getOffsetStroke(type),
        hide,
      })));

      // const duration = Date.now() - start;
      // const clipperOffsetDuration = Date.now() - clipperOffsetStart;
      // const svgOffsetDuration = Date.now() - svgOffsetStart;
      // console.log(`Rendering ${type} polygons to svg paths took ${duration}ms\nClipper Offsets: ${clipperOffsetDuration}ms\nSVG Offsets: ${svgOffsetDuration}ms`);

      return taskPaths;
    });

    setPaths(paths.flat());
  }, [tasks]);

  return {
    paths,
    viewBox,
    precision,
  };
}
