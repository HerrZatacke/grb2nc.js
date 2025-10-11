import { CircleShape } from '@hpcreery/tracespace-plotter';
import { MachiningContext } from '@/modules/machining/createMachiningContext.ts';
import { drillZPasses } from '@/modules/machining/drillZPasses.ts';
import { withToolChange } from '@/modules/machining/withToolChange.ts';

export const generateDrillGroup = (locations: CircleShape[], context: MachiningContext): string[] => {
  const { units } = context;

  const diameter = locations[0].r * 2;

  return [
    '',
    `(Drill: ${diameter}${units})`,
    ...withToolChange(
      `Insert ${diameter}${units} drill`,
      locations.map((location): string[] => (
        drillZPasses(location, context)
      )).flat(),
      context,
    ),
  ];
};
