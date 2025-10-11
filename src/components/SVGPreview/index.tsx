'use client';

import './styles.scss';
import { useMemo } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useMainContext } from '@/components/MainContext';
import { Grid } from '@/components/SVGPreview/Grid.tsx';
import { getViewBox } from '@/modules/renderSVG';

export default function SVGPreview() {
  const { renderedTasks, globalBounds } = useMainContext();
  const viewBox = useMemo(() => getViewBox(globalBounds), [globalBounds]);

  return (
    <div className="svg-preview">
      <TransformWrapper
        initialScale={1}
        minScale={0.25}
        maxScale={10}
      >
        <TransformComponent>
          <svg className="svg-preview__svg" viewBox={viewBox}>
            <Grid />
            {
              renderedTasks.map(({ svgPathProps }, taskIndex) => {
                return (
                  <g key={`g-${taskIndex}`}>
                    {svgPathProps.map(({ path, fill, stroke, strokeWidth, hide }, pathIndex) => {
                      return (
                        !hide && (<path
                            fill={fill}
                            stroke={stroke}
                            strokeWidth={strokeWidth}
                            key={`p-${taskIndex}-${pathIndex}`}
                            d={path}
                          />
                        ));
                    })}
                  </g>
                );
              })
            }
          </svg>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
