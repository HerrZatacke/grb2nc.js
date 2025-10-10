import { TaskType, Units } from '@/types/tasks.ts';

export interface MachiningParams {
  units: Units; // Millimeters or inches
  originOffsetX: string; // Machine offset X
  originOffsetY: string; // Machine offset Y
  safeHeight: string; // Safe Z for rapids
  clearanceHeight: string; // Lower travel Z (non-cutting)
  workHeight: string; // Material surface (usually 0)
  cutDepth: string; // Final depth (negative)
  stepDepth: string; // Depth increment per pass/peck
  feedRateXY: string; // XY move feedrate
  plungeSpeed: string; // Z plunge feedrate
  retractSpeed: string; // Z retract feedrate
  spindleSpeed: string; // Spindle RPM
}

export interface MachiningOperations {
  [TaskType.DRILL]: MachiningParams;
  [TaskType.ISOLATION]: MachiningParams;
  [TaskType.EDGE_CUT]: MachiningParams;
}
