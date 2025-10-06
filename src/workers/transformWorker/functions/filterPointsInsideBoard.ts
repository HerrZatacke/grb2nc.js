import { Clipper, IntPoint } from 'clipper-lib';
import { Polygon } from '@/types/geo';

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
};


export const filterPointsInsideBoard = (
  polygons: Polygon[],
  boardPolygons: Polygon[],
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
