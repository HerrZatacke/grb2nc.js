'use client';

import './styles.scss';
import { useMemo } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { useMainContext } from '@/components/MainContext';
import { Grid } from '@/components/SVGPreview/Grid.tsx';
import { getViewBox } from '@/modules/renderSVG';
import { SVGPathType } from '@/types/tasks.ts';

export default function SVGPreview() {
  const { renderedTasks, globalBounds, visibilities } = useMainContext();
  const viewBox = useMemo(() => getViewBox(globalBounds), [globalBounds]);

  return (
    <div className="svg-preview">
      <TransformWrapper
        initialScale={1}
        minScale={0.25}
        maxScale={10}
        limitToBounds={false}
        centerZoomedOut={false}
        centerOnInit
      >
        <TransformComponent>
          <svg className="svg-preview__svg" viewBox={viewBox}>
            <Grid />
            {
              renderedTasks.map(({ svgPathProps }, taskIndex) => {
                return (
                  <g key={`g-${taskIndex}`}>
                    {svgPathProps.map(({ path, fill, stroke, strokeWidth, fileName, pathType }, pathIndex) => {
                      const visibility = visibilities.find((taskVisibility) => fileName === taskVisibility.fileName) || null;
                      if (!visibility) { return null; }

                      let hide: boolean;

                      switch(pathType) {
                        case SVGPathType.AREA:
                          hide = visibility.hideAreas;
                          break;
                        case SVGPathType.OUTLINE:
                          hide = visibility.hidePaths;
                          break;
                        default:
                          hide = true;
                          break;
                      }

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
