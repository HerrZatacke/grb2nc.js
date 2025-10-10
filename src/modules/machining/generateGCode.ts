import { IntPoint } from 'clipper-lib';
import { Polygon } from '@/types/geo';
import { MachiningParams } from '@/types/machining.ts';
import { Units } from '@/types/tasks.ts';

export const generateGCode = (contours: Polygon[], scale: number, params: MachiningParams): string => {
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
  const retractSpeed = parseFloat(params.retractSpeed).toFixed(3);
  const feedRateXY = parseFloat(params.feedRateXY).toFixed(3);

  // Safety
  const safeHeight = parseFloat(params.safeHeight).toFixed(3);
  const clearanceHeight = parseFloat(params.clearanceHeight).toFixed(3);

  const toScaledOffsetPoint = (point: IntPoint): string => {
    const startX = (originOffsetX + (point.X / scale)).toFixed(3);
    const startY = (originOffsetY + (point.Y / scale)).toFixed(3);

    return `X${startX} Y${startY}`;
  };

  const header = [
    '%', // Start of program
    'G90', // Absolute positioning
    'G17', // XY plane
    params.units === Units.MILLIMETERS ? 'G21' : 'G20',
    `G0 Z${safeHeight}`, // Lift to safe height
    `G0 ${toScaledOffsetPoint({ X: 0, Y: 0 })}`,
    `M3 S${spindleSpeed}`,
    'G4 P2',
  ];

  const footer = [
    `G0 Z${safeHeight}`, // Retract tool
    'M5',
    'G4 P2',
    `G0 ${toScaledOffsetPoint({ X: 0, Y: 0 })}`,
    'M30', // End of program
    '%',
  ];

  const lines: string[] = [...header];


  // For each contour (outer array)
  for (let i = 0; i < contours.length; i++) {
    const contour = contours[i];

    lines.push(`(Contour ${i + 1})`);
    lines.push(`G0 Z${safeHeight}`);

    // For each Z-pass
    for (let pass = 1; pass <= zPasses; pass++) {
      const zDepth = ((direction * Math.min(pass * stepDepth, totalDepth)) + workHeight).toFixed(3);

      lines.push(`(Z Pass ${pass}: Depth ${zDepth})`);

      // Rapid to the first point
      lines.push(`G0 ${toScaledOffsetPoint(contour[0])}`);
      // Feed into material
      lines.push(`G1 Z${zDepth} F${plungeSpeed}`);

      for (let j = 1; j < contour.length; j++) {
        lines.push(`G1 ${toScaledOffsetPoint(contour[j])} F${feedRateXY}`);
      }

      lines.push(`G1 Z${workHeight.toFixed(3)} F${retractSpeed}`);
    }

    lines.push(`G0 Z${clearanceHeight}`);
  }

  lines.push(...footer);

  return lines.join('\n');
};
