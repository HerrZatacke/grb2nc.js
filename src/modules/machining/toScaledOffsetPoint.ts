import type { IntPoint } from 'clipper-lib';
import { MachiningContext } from '@/modules/machining/createMachiningContext.ts';

export const toScaledOffsetPoint = (point: IntPoint, context: MachiningContext) => {
  const {
    originOffsetX,
    originOffsetY,
    scaleX,
    scaleY,
  } = context;

  const startX = (originOffsetX + (point.X / scaleX)).toFixed(3);
  const startY = (originOffsetY + (point.Y / scaleY)).toFixed(3);

  return `X${startX} Y${startY}`;
};
