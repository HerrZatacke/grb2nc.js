import { IntRect } from 'clipper-lib';

export const defaultBounds = (value: number): IntRect => ({
  bottom: -value,
  left: value,
  right: -value,
  top: value,
});
