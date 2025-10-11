import { Flip } from '@/modules/machining/generateGCode.ts';
import type { MachiningParams } from '@/types/machining.ts';
import { Units } from '@/types/tasks.ts';

export interface MachiningContext {
  units: Units;
  zDirection: number;
  zPasses: number;
  totalDepth: number;
  stepDepth: number;

  originOffsetX: number;
  originOffsetY: number;
  workHeight: number;

  spindleSpeed: string;
  plungeSpeed: string;
  feedRateXY: string;

  safeHeight: string;
  clearanceHeight: string;

  flipX: number;
  flipY: number;
  scaleX: number;
  scaleY: number;
}

export const createMachiningContext = (
  params: MachiningParams,
  flip: Flip,
  scale: number,
): MachiningContext => {
  const units = params.units;

  const zDirection = Math.sign(parseFloat(params.cutDepth)) || -1;
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
  const feedRateXY = parseFloat(params.feedRateXY).toFixed(3);

  // Safety
  const safeHeight = parseFloat(params.safeHeight).toFixed(3);
  const clearanceHeight = parseFloat(params.clearanceHeight).toFixed(3);

  const flipX = flip === Flip.BOTH || flip === Flip.X ? -1 : 1;
  const flipY = flip === Flip.BOTH || flip === Flip.Y ? -1 : 1;
  const scaleX = scale * flipX;
  const scaleY = scale * flipY;


  return {
    units,
    zDirection,
    zPasses,
    totalDepth,
    stepDepth,
    originOffsetX,
    originOffsetY,
    workHeight,
    spindleSpeed,
    plungeSpeed,
    feedRateXY,
    safeHeight,
    clearanceHeight,
    flipX,
    flipY,
    scaleX,
    scaleY,
  };
};
