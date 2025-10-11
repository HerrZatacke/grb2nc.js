import { IntPoint } from 'clipper-lib';
import { MachiningContext } from '@/modules/machining/createMachiningContext';
import { toScaledOffsetPoint } from '@/modules/machining/toScaledOffsetPoint.ts';

export const countourZPasses = (contour: IntPoint[], context: MachiningContext) => {
  const {
    zPasses,
    zDirection,
    stepDepth,
    totalDepth,
    workHeight,
    plungeSpeed,
    feedRateXY,
    clearanceHeight,
  } = context;

  const lines = [];

  for (let pass = 1; pass <= zPasses; pass += 1) {
      const zDepth = ((zDirection * Math.min(pass * stepDepth, totalDepth)) + workHeight).toFixed(3);

    lines.push(
      `(Z Pass ${pass}: Depth ${zDepth})`,
      `G0 ${toScaledOffsetPoint(contour[0], context)}`, // Rapid to the first point
      `G1 Z${zDepth} F${plungeSpeed}`, // Feed into material

      ...contour.map((point) => (
        `G1 ${toScaledOffsetPoint(point, context)} F${feedRateXY}`
      )),

      `G0 Z${workHeight.toFixed(3)}`, // Retract
    );
  }

  lines.push(`G0 Z${clearanceHeight}`);

  return lines;
};
