import { type CircleShape } from '@hpcreery/tracespace-plotter';
import { type IntPoint } from 'clipper-lib';
import groupBy from '@/modules/groupBy';
import { type Polygon } from '@/types/geo';
import { type MachiningParams } from '@/types/machining.ts';
import { Units } from '@/types/tasks.ts';

export enum Flip {
  NONE = 'none',
  X = 'x',
  Y = 'y',
  BOTH = 'both',
}

interface GenerateGCodeParams {
  contours: Polygon[],
  drills: CircleShape[],
  scale: number,
  params: MachiningParams,
  flip: Flip,
}

export const generateGCode = (generationParams: GenerateGCodeParams): string => {
  const {
    contours,
    drills,
    scale,
    params,
    flip,
  } = generationParams;

  const direction = Math.sign(parseFloat(params.cutDepth)) || -1;
  const totalDepth = Math.abs(parseFloat(params.cutDepth));
  const stepDepth = Math.abs(parseFloat(params.stepDepth));
  const zPasses = Math.ceil(totalDepth / stepDepth);

  // Offsets
  const originOffsetX = parseFloat(params.originOffsetX);
  const originOffsetY = parseFloat(params.originOffsetY);
  const workHeight  = parseFloat(params.workHeight );

  // Speeds
  const spindleSpeed = parseFloat(params.spindleSpeed).toFixed(0);
  const plungeSpeed = parseFloat(params.plungeSpeed).toFixed(3);
  const feedRateXY = parseFloat(params.feedRateXY).toFixed(3);

  // Safety
  const safeHeight = parseFloat(params.safeHeight).toFixed(3);
  const clearanceHeight = parseFloat(params.clearanceHeight).toFixed(3);

  const flipX = flip === Flip.BOTH || flip === Flip.X ? -1 : 1;
  const flipY = flip === Flip.BOTH || flip === Flip.Y ? -1 : 1;
  const scaleX = scale * flipX;
  const scaleY = scale * flipY;

  const toScaledOffsetPoint = (point: IntPoint): string => {
    const startX = (originOffsetX + (point.X / scaleX)).toFixed(3);
    const startY = (originOffsetY + (point.Y / scaleY)).toFixed(3);

    return `X${startX} Y${startY}`;
  };

  const toOffsetPoint = (point: IntPoint): string => {
    const startX = (originOffsetX + (point.X * flipX)).toFixed(3);
    const startY = (originOffsetY + (point.Y * flipY)).toFixed(3);

    return `X${startX} Y${startY}`;
  };

  const header = [
    'G90', // Absolute positioning
    'G17', // XY plane
    params.units === Units.MILLIMETERS ? 'G21' : 'G20',
    'G94', // Feedrate in units/minute
    `G0 Z${safeHeight}`, // Lift to safe height
    `G0 ${toScaledOffsetPoint({ X: 0, Y: 0 })}`,
    '',
    '',
    '',
  ];

  const footer = [
    '',
    '',
    '',
    `G0 ${toScaledOffsetPoint({ X: 0, Y: 0 })}`,
    'M30', // Program end
  ];

  const lines: string[] = [...header];

  if (contours.length) {
    lines.push(
      '',
      `M3 S${spindleSpeed}`, // Motor on
      'G4 P2', // Wait 2 seconds
    );

    for (let i = 0; i < contours.length; i++) {
      const contour = contours[i];

      lines.push(
        '',
        `(Contour ${i + 1})`,
        `G0 Z${clearanceHeight}`,
      );

      // For each Z-pass
      for (let pass = 1; pass <= zPasses; pass++) {
        const zDepth = ((direction * Math.min(pass * stepDepth, totalDepth)) + workHeight).toFixed(3);

        lines.push(
          `(Z Pass ${pass}: Depth ${zDepth})`,
          `G0 ${toScaledOffsetPoint(contour[0])}`, // Rapid to the first point
          `G1 Z${zDepth} F${plungeSpeed}`, // Feed into material

          ...contour.map((point) => (
            `G1 ${toScaledOffsetPoint(point)} F${feedRateXY}`
          )),

          `G0 Z${workHeight.toFixed(3)}`, // Retract
        );
      }

      lines.push(`G0 Z${clearanceHeight}`);
    }

    lines.push(
      `G0 Z${safeHeight}`, // Retract
      'M5', // Motor off
      'G4 P2', // Wait 2 seconds
    );
  }


  if (drills.length) {
    const groupByRadius = groupBy<CircleShape, 'r'>('r', (r: number) => (r.toString(10)));
    const groupedDrills = Object.values(groupByRadius(drills));
    lines.push(
      '',
      `(Drills: ${groupedDrills.length} dimensions)`,

      ...groupedDrills.map((locations): string[] => {
        const diameter = locations[0].r * 2;

        return [
          '',
          `(Drill: ${diameter}${params.units})`,
          `G0 ${toScaledOffsetPoint({ X: 0, Y: 0 })}`, // Move "home"
          `M0 tool change required - insert drill ${diameter}${params.units}`,
          `G0 Z${clearanceHeight}`,
          `M3 S${spindleSpeed}`, // Motor on
          'G4 P2', // Wait 2 seconds

          ...locations.map((location): string[] => {
            const point: IntPoint = {
              X: location.cx,
              Y: location.cy,
            };

            const locationLines = [
              '',
              `(drill ${diameter}${params.units} at ${toOffsetPoint(point)} - ${zPasses} passes)`,
              `G0 ${toOffsetPoint(point)}`, // Rapid to the point
            ];


            for (let pass = 1; pass <= zPasses; pass++) {
              const zDepth = ((direction * Math.min(pass * stepDepth, totalDepth)) + workHeight).toFixed(3);

              locationLines.push(
                `G1 Z${zDepth} F${plungeSpeed}`, // Feed into material
                `G0 Z${workHeight.toFixed(3)}`, // Retract
              );
            }

            locationLines.push(
              `G0 Z${clearanceHeight}`, // To Clearance
            );

            return locationLines;
          }).flat(),

          `G0 Z${safeHeight}`, // Retract
          'M5', // Motor off
          'G4 P2', // Wait 2 seconds
        ];
      })
        .flat(),
    );
  }

  lines.push(...footer);

  return lines.join('\n');
};
