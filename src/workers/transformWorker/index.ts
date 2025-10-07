import { parse, UNITS, Units as UnitsNode } from '@hpcreery/tracespace-parser';
import { plot } from '@hpcreery/tracespace-plotter';
import { Clipper, IntRect } from 'clipper-lib';
import { expose } from 'comlink';
import { hash as ohash } from 'ohash';
import { delay } from '@/modules/delay';
import { transformer } from '@/modules/transformer';
import { RenderedTask, TaskType, TaskWithPolygons, Units } from '@/types/tasks.ts';
import { closePath } from '@/workers/transformWorker/functions/closePath.ts';
import { defaultBounds } from '@/workers/transformWorker/functions/defaultBounds.ts';
import { renderTask } from '@/workers/transformWorker/functions/renderTask.ts';
import {
  ITansformWorkerApi,
  ProgressAddEstimate,
  ProgressCallback,
  ProgressTick,
  TransformWorkerParams,
  TransformWorkerResult,
} from '@/workers/transformWorker/functions/types.ts';

class TansformWorkerApi implements ITansformWorkerApi {
  private progressCallback: ProgressCallback = () => {};
  private progressCount = 0;
  private progressEstimate = 0;
  private resultMap: Map<string, TransformWorkerResult> = new Map([]);

  setup(onProgress: ProgressCallback) {
    this.progressCallback = onProgress;
  };

  private progressTick: ProgressTick = async (): Promise<void> => {
    this.progressCount += 1;
    // console.log(`${'#'.repeat(this.progressCount)}${'-'.repeat(this.progressEstimate - this.progressCount)}`);
    this.progressCallback(this.progressCount / this.progressEstimate);
    await delay(1);
  };

  private progressAddEstimate: ProgressAddEstimate = (items: number) => {
    this.progressEstimate += items;
  };

  async calculate(params: TransformWorkerParams): Promise<TransformWorkerResult> {
    const { tasks, scale } = params;
    this.progressCount = 0;
    this.progressEstimate = 0;
    this.progressAddEstimate(3);

    if (!tasks.length) {
      await delay(1);
      this.progressCallback(0);
      return {
        renderedTasks: [],
        bounds: defaultBounds(0),
        units: Units.MILLIMETERS,
        timings: ['No tasks, nothing to do.'],
      };
    }

    const parameterHash = ohash(params);

    if (this.resultMap.has(parameterHash)) {
      await delay(1);
      this.progressCallback(0);
      return this.resultMap.get(parameterHash) as TransformWorkerResult;
    }

    const timings: string[] = [];

    const transformedTasks = tasks.map((task): TaskWithPolygons => {
      const syntaxTree = parse(task.fileContent);

      const unitsNode = syntaxTree.children.find(({ type }) => (type === UNITS)) as (UnitsNode | undefined);
      const units = unitsNode && unitsNode.units === 'in' ? Units.INCHES : Units.MILLIMETERS;

      console.log(units);

      const imageTree = plot(syntaxTree);
      transformer.run(imageTree, task.type);

      const polygons = transformer.result(task.type).map(closePath);

      return {
        ...task,
        polygons,
        units,
      };
    });

    this.progressAddEstimate(3 * transformedTasks.length);

    await this.progressTick();

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
      }, defaultBounds(Infinity));
    }

    const globalUnits: Units = transformedTasks.reduce((acc: Units | null, { units }): Units => {
      if (acc === null) {
        return units;
      }

      if (acc !== units) {
        console.log('Using mixed units');
        return Units.MILLIMETERS;
      }

      return acc;
    }, null) || Units.MILLIMETERS;


    await this.progressTick();

    const renderedTasks: RenderedTask[] = [];

    for (let i = 0; i < transformedTasks.length; i++) {
      const task = { ...transformedTasks[i] };
      const result = await renderTask({
        scale,
        timings,
        boardEdgeOffset,
        progressTick: this.progressTick,
        progressAddEstimate: this.progressAddEstimate,
      })(task);
      renderedTasks.push(result);
    }

    await this.progressTick();

    const result: TransformWorkerResult = {
      bounds: globalBounds,
      units: globalUnits,
      renderedTasks,
      timings,
    };

    this.resultMap.set(parameterHash, result);

    await delay(1);
    this.progressCallback(0);

    return result;
  };
}

expose(new TansformWorkerApi());
