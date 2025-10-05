import {expose} from 'comlink';
import {Task, TaskProps, TaskType, TaskWithPolygons} from '@/types/tasks.ts';
import {parse} from '@hpcreery/tracespace-parser';
import {plot} from '@hpcreery/tracespace-plotter';
import {transformer} from '@/modules/transformer';
import {getColor, getOffset, getOffsetStroke, getSteps, polygonsToSVGPaths} from '@/modules/renderSVG';
import {Clipper, type IntPoint, IntRect} from 'clipper-lib';
import {Polygon} from '@/types/geo';
import {createOffset} from '@/modules/createOffset';
import {samePoint} from '@/modules/transformer/mergePolyline.ts';
import {hash as ohash} from 'ohash';

export interface TransformWorkerParams {
  tasks: Task[],
  precision: number,
}

export interface TransformWorkerResult {
  paths: TaskProps[],
  bounds: IntRect,
  timings: string[],
}

export interface TansformWorkerApi {
  calculate: (params: TransformWorkerParams) => Promise<TransformWorkerResult>
}

const resultMap: Map<string, TransformWorkerResult> = new Map([]);
const offsetPathsMap: Map<string, Polygon[][]> = new Map([]);

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

function closePath(path: Polygon): Polygon {
  const firstPoint = path[0];
  const lastPoint = path[path.length - 1]

  if (samePoint(firstPoint, lastPoint)) {
    return path;
  }

  return [
    ...path,
    firstPoint,
  ]
}

const filterPointsInsideBoard = (
  polygons: Polygon[],
  boardPolygons: Polygon[]
): Polygon[] => {
  return polygons.map((path: Polygon): Polygon[] => {
    const result: Polygon[] = [];
    let current: Polygon = [];

    for (const point of path) {
      if (isPointInsideBoard(point, boardPolygons)) {
        current.push(point);
      } else {
        // when a point is filtered, close the current polygon (if any)
        if (current.length > 0) {
          result.push(current);
          current = [];
        }
      }
    }

    // push last collected segment
    if (current.length > 0) {
      result.push(current);
    }

    // if nothing valid, preserve as one empty polygon
    return result.length > 0 ? result : [];
  }).flat();
};

interface CreateOffsetPathsParams {
  offsetSteps: number;
  offsetDistance: number;
  initialPath: Polygon[],
  taskType: TaskType,
  boardEdgeOffset?: Polygon[],
}

const createOffsetPaths = (params: CreateOffsetPathsParams): Polygon[][] => {
  const {
    offsetSteps,
    offsetDistance,
    initialPath,
    taskType,
    boardEdgeOffset,
  } = params;

  const parameterHash = ohash(params);

  if (offsetPathsMap.has(parameterHash)) {
    return offsetPathsMap.get(parameterHash) as Polygon[][];
  }

  const offsetPaths: Polygon[][] = Array.from({ length: offsetSteps })
    .reduce((acc: Polygon[][], _, index: number): Polygon[][] => {
      const next = createOffset(acc[acc.length - 1], offsetDistance).map(closePath);
      // the first path (index===0) is the original shape without offset, which gets dropped.
      return (index === 0) ? [next] : [...acc, next];
    }, [initialPath])
    .map((offsetPaths) => (
      (taskType !== TaskType.EDGE_CUT && boardEdgeOffset) ? filterPointsInsideBoard(offsetPaths, boardEdgeOffset) : offsetPaths
    ));

  offsetPathsMap.set(parameterHash, offsetPaths)

  return offsetPaths;
}

const api: TansformWorkerApi = {
  async calculate(params: TransformWorkerParams): Promise<TransformWorkerResult> {
    const { tasks, precision } = params;

    if (!tasks.length) {
      return {
        paths: [],
        bounds: defaultBounds(0),
        timings: ['No tasks, nothing to do.'],
      };
    }

    const parameterHash = ohash(params);

    if (resultMap.has(parameterHash)) {
      return resultMap.get(parameterHash) as TransformWorkerResult;
    }

    const timings: string[] = [];

    const transformedTasks = tasks.map((task): TaskWithPolygons => {
      const syntaxTree = parse(task.fileContent)
      const imageTree = plot(syntaxTree);
      transformer.run(imageTree, task.type);

      const polygons = transformer.result(task.type).map(closePath);

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

    const paths = transformedTasks.map(({ polygons, type, flip, steps, offset, hidePaths, hideAreas }): TaskProps[] => {
      const color = getColor(type, flip);

      const polygonsToSVGPathsStart = performance.now();

      const svgPaths = polygonsToSVGPaths(polygons, precision);

      const taskPaths: TaskProps[] = svgPaths.map((SVGpath): TaskProps => ({
        path: SVGpath,
        fill: `rgba(${color}, 0.025)`,
        stroke: `rgba(${color}, 0.33)`,
        strokeWidth: '0.5',
        hide: hideAreas,
      }));

      const polygonsToSVGPathsDuration = performance.now() - polygonsToSVGPathsStart;
      const clipperOffsetStart = performance.now();

      // create offset paths
      const offsetPaths: Polygon[][] = createOffsetPaths({
        boardEdgeOffset,
        initialPath: polygons,
        offsetDistance: offset,
        offsetSteps: steps,
        taskType: type
      });

      const clipperOffsetDuration = performance.now() - clipperOffsetStart;
      const pathOffsetStart = performance.now();

      taskPaths.push(...offsetPaths.map((offsetPath: Polygon[]) => {
        const pathSegments = polygonsToSVGPaths(offsetPath, precision);
        return pathSegments.map((pathSegment): TaskProps => {
          return ({
            path: pathSegment,
            fill: 'none',
            stroke: `rgba(${color}, 1)`,
            strokeWidth: getOffsetStroke(type),
            hide: hidePaths,
          });
        });
      }).flat());

      const pathOffsetDuration = performance.now() - pathOffsetStart;
      const totalDuration = polygonsToSVGPathsDuration + clipperOffsetDuration + pathOffsetDuration;

      timings.push(
        `Rendering ${type} polygons to paths took total ${totalDuration.toFixed(2)}ms:`,
        `  Polygons to Path: ${polygonsToSVGPathsDuration.toFixed(2)}ms`,
        `  Clipper Offsets (${steps} steps): ${clipperOffsetDuration.toFixed(2)}ms`,
        `  Paths Offset SVG Paths: ${pathOffsetDuration.toFixed(2)}ms`
      );

      return taskPaths;
    });

    const result = {
      bounds: globalBounds,
      paths: paths.flat(),
      timings,
    };

    resultMap.set(parameterHash, result);

    return result;
  }
}

expose(api);
