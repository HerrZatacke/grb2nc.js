import { expose } from 'comlink';
import {Task, TaskProps, TaskType, TaskWithPolygons} from "@/types/tasks.ts";
import {parse} from "@hpcreery/tracespace-parser";
import {plot} from "@hpcreery/tracespace-plotter";
import {transformer} from "@/modules/transformer";
import {getColor, getOffset, getOffsetStroke, getSteps, polygonsToPath} from "@/modules/render";
import {Clipper, type IntPoint, IntRect} from "clipper-lib";
import {Polygon} from "@/types/geo";
import {createOffset} from "@/modules/createOffset";

export interface TransformWorkerResult {
  paths: TaskProps[],
  bounds: IntRect,
}

export interface TansformWorkerApi {
  calculate: (
    tasks: Task[],
    precision: number,
  ) => Promise<TransformWorkerResult>
}

const defaultBounds = (value: number): IntRect => ({
  bottom: -value,
  left: value,
  right: -value,
  top: value,
});

const isPointInsideBoard = (pt: IntPoint, boardPolygons: Polygon[]): boolean => {
  let insideOuter = false;

  for (const poly of boardPolygons) {
    const orientation = Clipper.Orientation(poly); // true = clockwise
    const res = Clipper.PointInPolygon(pt, poly);

    if (res !== 0) {
      if (orientation) {
        insideOuter = true;
      } else {
        return false;
      }
    }
  }

  return insideOuter;
}

const filterPointsInsideBoard = (polygons: Polygon[], boardPolygons: Polygon[]): Polygon[] => {
  return polygons.map(path =>
    path.filter(pt => isPointInsideBoard(pt, boardPolygons))
  ).filter(path => path.length > 0); // remove empty ones
}


const api: TansformWorkerApi = {
  async calculate(
    tasks: Task[],
    precision: number,
  ): Promise<TransformWorkerResult> {
    if (!tasks.length) {
      return {
        paths: [],
        bounds: defaultBounds(0),
      };
    }

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

    const boardEdge = transformedTasks.find(({ type }) => (type === TaskType.EDGE_CUT));
    const boardEdgeOffset = boardEdge?.polygons;

    let globalBounds: IntRect;

    if (boardEdge) {
      globalBounds = Clipper.GetBounds(boardEdge.polygons);
    } else {
      globalBounds = transformedTasks.reduce((acc: IntRect, { polygons }): IntRect => {
        const bounds = Clipper.GetBounds(polygons);
        return {
          bottom: Math.max(acc.bottom, bounds.bottom),
          left: Math.min(acc.left, bounds.left),
          right: Math.max(acc.right, bounds.right),
          top: Math.min(acc.top, bounds.top),
        };
      }, defaultBounds(Infinity))
    }

    const paths = transformedTasks.map(({ polygons, type, flip, steps, offset, hide }): TaskProps[] => {
      // const start = Date.now();
      const color = getColor(type, flip);

      // create filled shape
      const taskPaths: TaskProps[] = [{
        path: polygonsToPath(polygons, precision),
        fill: `rgba(${color}, 0.025)`,
        stroke: `rgba(${color}, 0.33)`,
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
        .slice(1)
        .map((offsetPaths) => (
          (type !== TaskType.EDGE_CUT && boardEdgeOffset) ? filterPointsInsideBoard(offsetPaths, boardEdgeOffset) : offsetPaths
        ));

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

    return {
      bounds: globalBounds,
      paths: paths.flat(),
    };
  }
}

expose(api);
