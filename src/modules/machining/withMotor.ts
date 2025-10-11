import { MachiningContext } from '@/modules/machining/createMachiningContext.ts';

export const withMotor = (lines: string[], context: MachiningContext) => {
  const { spindleSpeed } = context;

  return [
    `M3 S${spindleSpeed}`, // Motor on
    'G4 P2', // Wait 2 seconds

    ...lines,

    'M5', // Motor off
    'G4 P2', // Wait 2 seconds
  ];
};
