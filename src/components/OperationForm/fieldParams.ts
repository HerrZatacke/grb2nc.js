import { MachiningParams } from '@/types/machining.ts';

export interface FieldParam {
  fieldName: keyof MachiningParams;
  precision: number;
  step: number;
  min?: number,
  max?: number,
  unitKey: string;
}

export const fieldParams: FieldParam[] = [
  {
    fieldName: 'feedRateXY',
    precision: 0,
    step: 5,
    min: 1,
    unitKey: 'feedRate',
  },
  {
    fieldName: 'plungeSpeed',
    precision: 0,
    step: 5,
    min: 1,
    unitKey: 'feedRate',
  },
  {
    fieldName: 'spindleSpeed',
    precision: 0,
    step: 1000,
    min: 0,
    unitKey: 'rpm',
  },
  {
    fieldName: 'cutDepth',
    precision: 2,
    step: 0.01,
    max: 0,
    unitKey: 'dimension',
  },
  {
    fieldName: 'stepDepth',
    precision: 2,
    step: 0.01,
    min: 0.01,
    unitKey: 'dimension',
  },
  {
    fieldName: 'safeHeight',
    precision: 2,
    step: 0.1,
    min: 0,
    unitKey: 'dimension',
  },
  {
    fieldName: 'clearanceHeight',
    precision: 2,
    step: 0.01,
    min: 0,
    unitKey: 'dimension',
  },
  {
    fieldName: 'workHeight',
    precision: 2,
    step: 0.01,
    unitKey: 'dimension',
  },
  {
    fieldName: 'originOffsetX',
    precision: 2,
    step: 0.01,
    unitKey: 'dimension',
  },
  {
    fieldName: 'originOffsetY',
    precision: 2,
    step: 0.01,
    unitKey: 'dimension',
  },
];
