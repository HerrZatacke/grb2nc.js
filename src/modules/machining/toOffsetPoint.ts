import type { IntPoint } from 'clipper-lib';
import { MachiningContext } from '@/modules/machining/createMachiningContext.ts';

export   const toOffsetPoint = (point: IntPoint, context: MachiningContext): string => {
  const {
    originOffsetX,
    originOffsetY,
    flipX,
    flipY,
  } = context;

  const startX = (originOffsetX + (point.X * flipX)).toFixed(3);
  const startY = (originOffsetY + (point.Y * flipY)).toFixed(3);

  return `X${startX} Y${startY}`;
};
