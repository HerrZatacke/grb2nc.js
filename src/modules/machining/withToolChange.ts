import { MachiningContext } from '@/modules/machining/createMachiningContext.ts';
import { toScaledOffsetPoint } from '@/modules/machining/toScaledOffsetPoint.ts';
import { withMotor } from '@/modules/machining/withMotor.ts';

export const withToolChange = (message: string, lines: string[], context: MachiningContext): string[] => {
  const {
    clearanceHeight,
    safeHeight,
  } = context;

  return [
    `G0 ${toScaledOffsetPoint({ X: 0, Y: 0 }, context)}`, // Move "home"
    `M0 tool change required - ${message}`,
    `G0 Z${clearanceHeight}`,

    ...withMotor(lines, context),

    `G0 Z${safeHeight}`, // Retract
  ];
};
