import { saveAs } from 'file-saver';
import { useCallback } from 'react';
import { transformer } from '@/modules/transformer';
import { Polygon } from '@/types/geo';
import { RenderedTask } from '@/types/tasks.ts';

interface UseDownloadNC {
  downloadNCCode: (task: RenderedTask) => void;
}

interface GCodeParams {
  contours: Polygon[],
  scale: number,
  zPasses: number,
  zStep: number,
  safeHeight: number,
  feedZ: number,
  feedXY: number,
}

function generateGCode(params: GCodeParams): string {

  const {
    contours,
    scale,
    zPasses,
    zStep,
    safeHeight,
    feedZ,
    feedXY,
  } = params;

  const header = [
    '%', // Start of program
    'G90 G17 G21', // Absolute positioning, XY plane, mm units
    `G0 Z${safeHeight.toFixed(3)}`, // Lift to safe height
  ];

  const footer = [
    `G0 Z${safeHeight.toFixed(3)}`, // Retract tool
    'M30', // End of program
    '%',
  ];

  const lines: string[] = [...header];

  // For each contour (outer array)
  for (let i = 0; i < contours.length; i++) {
    const contour = contours[i];

    lines.push(`(Contour ${i + 1})`);

    // For each Z-pass
    for (let pass = 1; pass <= zPasses; pass++) {
      const zDepth = -(zStep * pass);

      lines.push(`(Z Pass ${pass}: Depth ${zDepth.toFixed(3)})`);

      // Rapid to the first point (scaled)
      const start = contour[0];
      const startX = (start.X / scale).toFixed(3);
      const startY = (start.Y / scale).toFixed(3);

      lines.push(`G0 X${startX} Y${startY}`);
      lines.push(`G1 Z${zDepth.toFixed(3)} F${feedZ.toFixed(1)}`); // Feed into material

      // Cut along the rest of the contour
      for (let j = 1; j < contour.length; j++) {
        const p = contour[j];
        const x = (p.X / scale).toFixed(3);
        const y = (p.Y / scale).toFixed(3);
        lines.push(`G1 X${x} Y${y} F${feedXY.toFixed(1)}`);
      }

      // Return to safe height before next pass
      lines.push(`G0 Z${safeHeight.toFixed(3)}`);
    }
  }

  lines.push(...footer);

  return lines.join('\n');
}

export const useDownloadNC = (): UseDownloadNC => {
  const downloadNCCode = useCallback((task: RenderedTask) => {
    // console.log(task.offsetPaths.flat(1));
    const gCode = generateGCode({
      contours: task.offsetPaths.flat(1),
      scale: transformer.getScale(),
      zPasses: 1,
      zStep: 0,
      safeHeight: 2,
      feedZ: 200,
      feedXY: 800,
    });
    saveAs(new Blob([gCode]), 'gcode.nc');
  }, []);

  return {
    downloadNCCode,
  };
};
