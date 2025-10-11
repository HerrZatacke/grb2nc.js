import { CircleShape } from '@hpcreery/tracespace-plotter';
import groupBy from '@/modules/groupBy';
import { MachiningContext } from '@/modules/machining/createMachiningContext.ts';
import { generateDrillGroup } from '@/modules/machining/generateDrillGroup.ts';

export const generateDrills = (drills: CircleShape[], context: MachiningContext): string[] => {
  const groupByRadius = groupBy<CircleShape, 'r'>('r', (r: number) => (r.toString(10)));
  const groupedDrills = Object.values(groupByRadius(drills));
  const { safeHeight } = context;

  const drillLines = [
    '',
    `(Drills: ${groupedDrills.length} size)`,

    ...groupedDrills.map((locations): string[] => (
      generateDrillGroup(locations, context)
    )).flat(),
  ];

  return [
    ...drillLines,
    `G0 Z${safeHeight}`, // Retract
  ];
};
