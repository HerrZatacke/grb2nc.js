import { samePoint } from '@/modules/transformer/mergePolyline.ts';
import { Polygon } from '@/types/geo';

export const closePath = (path: Polygon): Polygon => {
  const firstPoint = path[0];
  const lastPoint = path[path.length - 1];

  if (samePoint(firstPoint, lastPoint)) {
    return path;
  }

  return [
    ...path,
    firstPoint,
  ];
};
