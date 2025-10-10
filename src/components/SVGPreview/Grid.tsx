import { useMainContext } from '@/components/MainContext';
import {
  getGridStrokeProps,
  getSVGBounds,
  SVG_SCALE,
} from '@/modules/renderSVG';

export function Grid() {
  const { globalBounds, globalUnits } = useMainContext();
  const svgBounds = getSVGBounds(globalBounds);

  const top = svgBounds.top;
  const left = svgBounds.left;
  const right = svgBounds.right;
  const bottom = svgBounds.bottom;

  const numXLines = Math.floor((right - left) / SVG_SCALE) + 1;
  const numYLines = Math.floor((bottom - top) / SVG_SCALE) + 1;
  const lineXOffset = left / SVG_SCALE;
  const lineYOffset = top / SVG_SCALE;

  return (
    <>
      <g>
        <circle
          cx={0}
          cy={0}
          r={0.5 * SVG_SCALE}
          fill="none"
          {...getGridStrokeProps()}
        />
        <text
          x={0.3 * SVG_SCALE}
          y={0.9 * SVG_SCALE}
          fill="rgba(0, 0, 0, 0.4)"
          style={{ fontSize: `${0.5 * SVG_SCALE}px` }}
        >
          {globalUnits}
        </text>
      </g>
      <g>
        {Array.from({ length: numXLines }, (_, i) => (
          <line
            className={`l-${left} i-${i}`}
            key={`x-${i}`}
            id={`x-${i}|${(left / SVG_SCALE)}`}
            x1={(i * SVG_SCALE) + left}
            y1={top}
            x2={(i * SVG_SCALE) + left}
            y2={bottom}
            {...getGridStrokeProps(i + lineXOffset)}
          />
        ))}
      </g>
      <g>
        {Array.from({ length: numYLines }, (_, i) => (
          <line
            key={`y-${i}-${(top / SVG_SCALE)}`}
            id={`y-${i}|${(top / SVG_SCALE)}`}
            x1={left}
            y1={(i * SVG_SCALE) + top}
            x2={right}
            y2={(i * SVG_SCALE) + top}
            {...getGridStrokeProps(i + lineYOffset)}
          />
        ))}
      </g>
    </>
  );
}
