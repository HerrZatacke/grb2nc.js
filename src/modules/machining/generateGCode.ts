import { type CircleShape } from '@hpcreery/tracespace-plotter';
import { createMachiningContext } from '@/modules/machining/createMachiningContext.ts';
import { generateContours } from '@/modules/machining/generateContours.ts';
import { generateDrills } from '@/modules/machining/generateDrills.ts';
import { withEnvelope } from '@/modules/machining/withEnvelope.ts';
import { type Polygon } from '@/types/geo';
import { type MachiningParams } from '@/types/machining.ts';

export enum Flip {
  NONE = 'none',
  X = 'x',
  Y = 'y',
  BOTH = 'both',
}

interface GenerateGCodeParams {
  contours: Polygon[],
  drills: CircleShape[],
  params: MachiningParams,
  description: string,
  flip: Flip,
  scale: number,
  renderOnlyPaths: boolean;
}

export const generateGCode = (generationParams: GenerateGCodeParams): string => {
  const {
    contours,
    drills,
    params,
    description,
    flip,
    scale,
    renderOnlyPaths,
  } = generationParams;
  const machiningContext = createMachiningContext(params, flip, scale);

  const lines: string[] = [];

  if (contours.length) {
    lines.push(
      '',
      '(Contours)',
      `(${description})`,
      '',
      ...generateContours(contours, machiningContext),
    );
  }

  if (drills.length) {
    lines.push(
      '',
      '(Drills)',
      `(${description})`,
      '',
      ...generateDrills(drills, machiningContext),
    );
  }

  if (renderOnlyPaths) {
    return lines.filter((line) => (
      line.startsWith('G0') ||
      line.startsWith('G1') ||
      line.startsWith('(') ||
      line === ''
    )).join('\n');
  }

  return withEnvelope(lines, machiningContext).join('\n');
};
