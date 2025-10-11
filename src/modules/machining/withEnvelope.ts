import { MachiningContext } from '@/modules/machining/createMachiningContext.ts';
import { toScaledOffsetPoint } from '@/modules/machining/toScaledOffsetPoint.ts';
import { Units } from '@/types/tasks.ts';

export const withEnvelope = (lines: string[], context: MachiningContext) => {
  const {
    units,
    safeHeight,
  } = context;

  return [
    'G90', // Absolute positioning
    'G17', // XY plane
    units === Units.MILLIMETERS ? 'G21' : 'G20',
    'G94', // Feedrate in units/minute
    `G0 Z${safeHeight}`, // Lift to safe height
    `G0 ${toScaledOffsetPoint({ X: 0, Y: 0 }, context)}`,
    '',
    '',
    ...lines,
    '',
    '',
    `G0 ${toScaledOffsetPoint({ X: 0, Y: 0 }, context)}`,
    'M30', // Program end
  ];
};
