import type { CircleShape } from '@hpcreery/tracespace-plotter';
import { circleShapeToSVGPath, getAreaStroke, getColor, getOffsetStroke, polygonsToSVGPaths } from '@/modules/renderSVG';
import type { Polygon } from '@/types/geo';
import { type RenderedTask, type SVGPathProps, SVGPathType, TaskType, type TaskWithPolygons } from '@/types/tasks.ts';
import { createOffsetPaths } from '@/workers/transformWorker/functions/createOffsetPaths.ts';
import { RenderTaskParams } from '@/workers/transformWorker/functions/types.ts';

export const renderTask = (renderTaskParams: RenderTaskParams) => async (taskWithPolygons: TaskWithPolygons): Promise<RenderedTask> => {
  const {
    scale,
    timings,
    boardEdgeOffset,
    progressTick,
    progressAddEstimate,
  } = renderTaskParams;

  const {
    polygons,
    drills,
    type,
    fileName,
    layer,
    steps,
    offset,
  } = taskWithPolygons;

  const color = getColor(type, layer);

  const polygonsToSVGPathsStart = performance.now();

  const svgPaths = polygonsToSVGPaths(polygons, scale);

  const svgPathProps: SVGPathProps[] = [{
    path: svgPaths.join('\n'),
    fill: `var(--color-fill-${color})`,
    stroke: `var(--color-stroke-${color})`,
    strokeWidth: getAreaStroke(),
    fileName,
    pathType: SVGPathType.AREA,
  }];

  const polygonsToSVGPathsDuration = performance.now() - polygonsToSVGPathsStart;
  const clipperOffsetStart = performance.now();

  await progressTick();

  // create offset paths
  const offsetPaths: Polygon[][] = await createOffsetPaths({
    boardEdgeOffset,
    initialPath: polygons,
    offsetDistance: offset,
    offsetSteps: steps,
    taskType: type,
    progressTick,
    progressAddEstimate,
  });

  await progressTick();

  const clipperOffsetDuration = performance.now() - clipperOffsetStart;
  const pathOffsetStart = performance.now();

  if (type === TaskType.DRILL) {
    svgPathProps.push(...drills.map((circleShape: CircleShape) => ({
      path: circleShapeToSVGPath(circleShape),
      fill: 'none',
      stroke: `var(--color-path-${color})`,
      strokeWidth: getOffsetStroke(type),
      fileName,
      pathType: SVGPathType.OUTLINE,
    })));
  } else {
    svgPathProps.push(...offsetPaths.map((offsetPath: Polygon[]) => {
      const pathSegments = polygonsToSVGPaths(offsetPath, scale);
      return pathSegments.map((pathSegment): SVGPathProps => {
        return {
          path: pathSegment,
          fill: 'none',
          stroke: `var(--color-path-${color})`,
          strokeWidth: getOffsetStroke(type),
          fileName,
          pathType: SVGPathType.OUTLINE,
        };
      });
    }).flat());
  }

  await progressTick();

  const pathOffsetDuration = performance.now() - pathOffsetStart;
  const totalDuration = polygonsToSVGPathsDuration + clipperOffsetDuration + pathOffsetDuration;

  timings.push(
    `Rendering ${type} polygons to paths took total ${totalDuration.toFixed(2)}ms:`,
    `  Polygons to Path: ${polygonsToSVGPathsDuration.toFixed(2)}ms`,
    `  Clipper Offsets (${steps} steps): ${clipperOffsetDuration.toFixed(2)}ms`,
    `  Paths Offset SVG Paths: ${pathOffsetDuration.toFixed(2)}ms`,
  );

  return {
    ...taskWithPolygons,
    svgPathProps,
    offsetPaths,
  };
};
