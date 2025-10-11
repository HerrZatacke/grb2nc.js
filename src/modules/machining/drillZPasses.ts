import { CircleShape } from '@hpcreery/tracespace-plotter';
import { type IntPoint } from 'clipper-lib';
import { MachiningContext } from '@/modules/machining/createMachiningContext.ts';
import { toOffsetPoint } from '@/modules/machining/toOffsetPoint.ts';

export const drillZPasses = (location: CircleShape, context: MachiningContext): string[] => {
  const {
    units,
    clearanceHeight,
    zPasses,
    zDirection,
    stepDepth,
    totalDepth,
    workHeight,
    plungeSpeed,
  } = context;

  const diameter = location.r * 2;

  const point: IntPoint = {
    X: location.cx,
    Y: location.cy,
  };

  const locationLines = [
    '',
    `(drill ${diameter}${units} at ${toOffsetPoint(point, context)} - ${zPasses} passes)`,
    `G0 ${toOffsetPoint(point, context)}`, // Rapid to the point
  ];


  for (let pass = 1; pass <= zPasses; pass++) {
    const zDepth = ((zDirection * Math.min(pass * stepDepth, totalDepth)) + workHeight).toFixed(3);

    locationLines.push(
      `G1 Z${zDepth} F${plungeSpeed}`, // Feed into material
      `G0 Z${workHeight.toFixed(3)}`, // Retract
    );
  }

  locationLines.push(
    `G0 Z${clearanceHeight}`, // To Clearance
  );

  return locationLines;
};
