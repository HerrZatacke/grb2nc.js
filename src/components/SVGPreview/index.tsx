'use client';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import {useMainContext} from '@/components/MainContext';
import './styles.scss';

export default function SVGPreview() {
  const { renderedTasks, viewBox } = useMainContext();
  if (!renderedTasks.length) { return null; }

  return (
    <div className="svg-preview">
      <TransformWrapper initialScale={1}>
        <TransformComponent>
          <svg className="svg-preview__svg" viewBox={viewBox}>
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
