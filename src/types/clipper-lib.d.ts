//https://github.com/junmer/clipper-lib/blob/master/Documentation.md

declare module 'clipper-lib' {
  export interface IntPoint {
    X: number;
    Y: number;
  }

  export type Path = IntPoint[];

  export type Paths = Path[];

  export interface IntRect {
    bottom: number,
    left: number,
    right: number,
    top: number,
  }

  export class Clipper {
    constructor(init?: number);
    AddPath(polygon: Polygon, polyType: PolyType, closed: boolean): void;
    AddPaths(polygons: Polygon[], polyType: PolyType, closed: boolean): void;
    Execute(clipType: ClipType, solutionTarget: Polygon[], subjFillType: PolyFillType, clipFillType: PolyFillType): any;
    Clear(): void;

    static CleanPolygon(...args: any[]): any;
    static GetBounds(...args: any[]): IntRect;
    static Orientation(...args: any[]): boolean;
    static ioReverseSolution: 1;
    static ioStrictlySimple: 2;
    static ioPreserveCollinear: 4;
  }

  export class ClipperOffset {
    constructor(miterLimit?: number, arcTolerance?: number);
    AddPath(path: Polygon, joinType: JoinType, endType: EndType): void;
    AddPaths(paths: Polygon[], joinType: JoinType, endType: EndType): void;
    Execute(solutionTarget: Polygon[], delta: number): void;
    Clear(): void;
  }

  export enum PolyType {
    ptSubject = 0,
    ptClip = 1,
  }

  export enum ClipType {
    ctIntersection = 0,
    ctUnion = 1,
    ctDifference = 2,
    ctXor = 3,
  }

  export enum PolyFillType {
    pftEvenOdd = 0,
    pftNonZero = 1,
    pftPositive = 2,
    pftNegative = 3,
  }

  export enum JoinType {
    jtSquare = 0,
    jtRound = 1,
    jtMiter = 2,
  }

  export enum EndType {
    etClosedPolygon = 0,
    etClosedLine = 1,
    etOpenButt = 2,
    etOpenSquare = 3,
    etOpenRound = 4,
  }

}
