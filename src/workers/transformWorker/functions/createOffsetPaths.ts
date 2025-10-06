import { hash as ohash } from 'ohash';
import { createOffset } from '@/modules/createOffset';
import { transformer } from '@/modules/transformer';
import { Polygon } from '@/types/geo';
import { TaskType } from '@/types/tasks.ts';
import { closePath } from '@/workers/transformWorker/functions/closePath.ts';
import { filterPointsInsideBoard } from '@/workers/transformWorker/functions/filterPointsInsideBoard.ts';
import { CreateOffsetPathsParams } from '@/workers/transformWorker/functions/types.ts';

const offsetPathsMap: Map<string, Polygon[][]> = new Map([]);


export const createOffsetPaths = async (params: CreateOffsetPathsParams): Promise<Polygon[][]> => {
  const {
    offsetSteps,
    offsetDistance,
    initialPath,
    taskType,
    boardEdgeOffset,
    progressTick,
    progressAddEstimate,
  } = params;

  const scale = transformer.getScale();
  const parameterHash = ohash(params);

  if (offsetPathsMap.has(parameterHash)) {
    return offsetPathsMap.get(parameterHash) as Polygon[][];
  }

  const offsetPaths: Polygon[][] = [];

  if (offsetSteps) {
    const numSteps = offsetDistance ? offsetSteps : 1;
    let currentPath = initialPath;

    progressAddEstimate(numSteps);

    for (let index = 0; index < numSteps; index += 1) {
      const next = createOffset(currentPath, offsetDistance * scale).map(closePath);

      const processed =
        taskType !== TaskType.EDGE_CUT && boardEdgeOffset
          ? filterPointsInsideBoard(next, boardEdgeOffset)
          : next;

      offsetPaths.push(processed);
      currentPath = next;

      await progressTick();
    }
  }

  offsetPathsMap.set(parameterHash, offsetPaths);
  return offsetPaths;
};
