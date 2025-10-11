import { countourZPasses } from '@/modules/machining/countourZPasses.ts';
import { MachiningContext } from '@/modules/machining/createMachiningContext.ts';
import { withToolChange } from '@/modules/machining/withToolChange.ts';
import { Polygon } from '@/types/geo';

export const generateContours = (contours: Polygon[], context: MachiningContext): string[] => {
  const contourLines: string[] = [];
  const { clearanceHeight, safeHeight } = context;

  for (let i = 0; i < contours.length; i++) {
    contourLines.push(
      '',
      `(Contour ${i + 1})`,
      `G0 Z${clearanceHeight}`,
      ...countourZPasses(contours[i], context),
      `G0 Z${clearanceHeight}`,
    );
  }

  return [
    ...withToolChange('Insert bit/engraver', contourLines, context),
    `G0 Z${safeHeight}`, // Retract
  ];
};
