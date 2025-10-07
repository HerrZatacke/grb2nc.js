import { useMainContext } from '@/components/MainContext';
import {
  getGridStrokeProps,
  getSVGBounds,
  SVG_SCALE,
  SVG_VIEWBOX_OFFSET,
} from '@/modules/renderSVG';

export function Grid() {
  const { globalBounds, globalUnits } = useMainContext();
  const svgBounds = getSVGBounds(globalBounds);

  const top = svgBounds.top;
  const left = svgBounds.left;
  const right = svgBounds.right;
  const bottom = svgBounds.bottom;

  const numXLines = Math.ceil((right - left) / SVG_SCALE);
  const numYLines = Math.ceil((bottom - top) / SVG_SCALE);

  return (
    <>
      <g>
        <circle
          cx={left + SVG_VIEWBOX_OFFSET}
          cy={top + SVG_VIEWBOX_OFFSET}
          r={0.5 * SVG_SCALE}
          fill="none"
          {...getGridStrokeProps()}
        />
        <text
          x={left + SVG_VIEWBOX_OFFSET + (0.3 * SVG_SCALE)}
          y={top + SVG_VIEWBOX_OFFSET + (0.9 * SVG_SCALE)}
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
            x1={(i * SVG_SCALE) + left}
            y1={top}
            x2={(i * SVG_SCALE) + left}
            y2={bottom}
            {...getGridStrokeProps(i)}
          />
        ))}
      </g>
      <g>
        {Array.from({ length: numYLines }, (_, i) => (
          <line
            key={`y-${i}`}
            x1={left}
            y1={(i * SVG_SCALE) + top}
            x2={right}
            y2={(i * SVG_SCALE) + top}
            {...getGridStrokeProps(i)}
          />
        ))}
      </g>
    </>
  );
}
