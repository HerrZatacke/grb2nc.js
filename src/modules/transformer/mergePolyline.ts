import type {Point, Polygon} from '@/types/geo';

export const samePoint = (p1: Point, p2: Point, eps = 1e-4): boolean => {
  return (
    Math.abs(p1.X - p2.X) < eps &&
    Math.abs(p1.Y - p2.Y) < eps
  );
}

export const mergePolyline = (segments: Polygon[]): Polygon[] => {
  if (segments.length === 0) return [];

  // Source of unconnected segments
  const pool: Polygon[] = segments.map((seg): Polygon => ([...seg]));

  // Result of connected segments
  const result: Polygon[] = [];

  // Set the first segment as staring path
  let currentPath = pool.shift();

  while (pool.length > 0) {
    if (!currentPath) {
      throw new Error('No current path');
    }

    const firstSearchPoint = currentPath[0];
    const lastSearchPoint = currentPath[currentPath.length - 1];

    if (samePoint(firstSearchPoint, lastSearchPoint)) {
      result.push(currentPath);
      currentPath = pool.shift();
      continue;
    }

    let foundConnection = false;
    for (let i = 0; i < pool.length; i++) {
      const seg = pool[i];
      const firstSegPoint = seg[0];
      const lastSegPoint = seg[seg.length - 1];

      if (samePoint(lastSearchPoint, firstSegPoint)) {
        // Connect end -> start
        currentPath.push(...seg);
        foundConnection = true;
      } else if (samePoint(lastSearchPoint, lastSegPoint)) {
        // Connect end -> end (reverse segment)
        currentPath.push(...(seg.reverse()));
        foundConnection = true;
      } else if (samePoint(firstSearchPoint, lastSegPoint)) {
        // Connect start -> end (prepend as-is)
        currentPath.unshift(...seg);
        foundConnection = true;
      } else if (samePoint(firstSearchPoint, firstSegPoint)) {
        // Connect start -> start (prepend reversed)
        currentPath.unshift(...(seg.reverse()));
        foundConnection = true;
      }

      if (foundConnection) {
        pool.splice(i, 1);
        break;
      }
    }

    if (!foundConnection) {
      result.push(currentPath);
      currentPath = pool.shift();
      continue;
    }
  }

  if (currentPath) {
    result.push(currentPath);
  }

  return result;
}
