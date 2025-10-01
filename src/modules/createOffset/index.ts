import {Polygon} from "@/types/geo";
import {ClipperOffset, EndType, JoinType} from "clipper-lib";

export const createOffset = (polygons: Polygon[], offsetDistance: number): Polygon[] => {
  const clipperOffset = new ClipperOffset();
  const offsetPaths: Polygon[] = [];

  polygons.forEach((path) => {
    // if (!Clipper.Orientation(path)) { //flip? }
    clipperOffset.AddPath(path, JoinType.jtMiter, EndType.etClosedPolygon);
  });

  const offsetPath: Polygon[] = [];
  clipperOffset.Execute(offsetPath, offsetDistance);
  if (offsetPath.length > 0) {
    offsetPaths.push(...offsetPath);
  }

  return offsetPaths;
}
