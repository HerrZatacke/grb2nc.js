'use client';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {useTransformer} from "@/hooks/useTransformer.ts";
import './styles.scss';

export default function SVGPreview() {
  const { paths, viewBox } = useTransformer();

  if (!paths.length) { return null; }

  return (
    <div className="svg-preview">
      <TransformWrapper initialScale={1}>
        <TransformComponent>
          <svg className="svg-preview__svg" viewBox={viewBox}>
            {
              paths.map(({ path, fill, stroke, strokeWidth, hide }, index) => (
                !hide && (<path
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  key={index}
                  d={path}
                />
              )))
            }
          </svg>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
