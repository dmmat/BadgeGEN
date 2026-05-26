import { BadgeDesign } from './badge-types';

export type ShapeName = BadgeDesign['shape'];

/**
 * Each shape is described by ordered layers. The renderer reads
 * fill/stroke flags per layer instead of the previous big @switch.
 */
export type ShapeLayer =
  | { kind: 'path'; d: string; fill: LayerFill; stroke?: LayerStroke }
  | { kind: 'polygon'; points: string; fill: LayerFill; stroke?: LayerStroke }
  | { kind: 'rect'; x: number; y: number; width: number; height: number; rx?: number; fill: LayerFill; stroke?: LayerStroke }
  | { kind: 'circle'; cx: number; cy: number; r: number; fill: LayerFill; stroke?: LayerStroke };

export type LayerFill = 'gradient' | 'secondary' | 'none';

export interface LayerStroke {
  width?: number;
  /** When omitted, uses design.borderColor; when 'border-width' the layer uses design.borderWidth. */
  useBorderWidth?: boolean;
}

const outerStroke: LayerStroke = { useBorderWidth: true };

export const SHAPE_DEFS: Record<ShapeName, ShapeLayer[]> = {
  circle: [
    { kind: 'circle', cx: 100, cy: 100, r: 90, fill: 'gradient', stroke: outerStroke }
  ],
  shield: [
    { kind: 'path', d: 'M100 10 L180 50 V110 C180 155 145 185 100 195 C55 185 20 155 20 110 V50 L100 10 Z', fill: 'gradient', stroke: outerStroke }
  ],
  hexagon: [
    { kind: 'polygon', points: '100,10 190,55 190,145 100,190 10,145 10,55', fill: 'gradient', stroke: outerStroke }
  ],
  star: [
    { kind: 'polygon', points: '100,10 123,75 190,78 138,115 155,180 100,145 45,180 62,115 10,78 77,75', fill: 'gradient', stroke: outerStroke }
  ],
  ribbon: [
    { kind: 'path', d: 'M40 20 H160 V140 L100 110 L40 140 V20 Z', fill: 'gradient', stroke: outerStroke },
    { kind: 'rect', x: 30, y: 10, width: 140, height: 15, rx: 5, fill: 'secondary', stroke: { width: 2 } }
  ],
  diamond: [
    { kind: 'polygon', points: '100,10 190,100 100,190 10,100', fill: 'gradient', stroke: outerStroke }
  ],
  octagon: [
    { kind: 'polygon', points: '60,10 140,10 190,60 190,140 140,190 60,190 10,140 10,60', fill: 'gradient', stroke: outerStroke }
  ],
  award: [
    { kind: 'path', d: 'M70 150 L50 190 L85 180 L100 195 L115 180 L150 190 L130 150', fill: 'secondary', stroke: { width: 2 } },
    { kind: 'circle', cx: 100, cy: 90, r: 70, fill: 'gradient', stroke: outerStroke }
  ],
  plaque: [
    { kind: 'rect', x: 20, y: 30, width: 160, height: 140, rx: 10, fill: 'gradient', stroke: outerStroke }
  ],
  gem: [
    { kind: 'path', d: 'M50 30 L150 30 L190 80 L100 180 L10 80 Z', fill: 'gradient', stroke: outerStroke }
  ],
  'leaf-1': [
    { kind: 'path', d: 'M 30 90 Q 30 30 90 30 L 170 30 L 170 110 Q 170 170 110 170 L 30 170 Z', fill: 'gradient', stroke: outerStroke }
  ],
  'leaf-2': [
    { kind: 'path', d: 'M 30 30 L 110 30 Q 170 30 170 90 L 170 170 L 90 170 Q 30 170 30 110 Z', fill: 'gradient', stroke: outerStroke }
  ],
  seal: [
    { kind: 'path', d: 'M100 10 L115 15 L122 25 L135 35 L145 50 L155 65 L165 80 L160 95 L165 110 L155 125 L145 140 L135 155 L122 165 L115 175 L100 180 L85 175 L78 165 L65 155 L55 140 L45 125 L35 110 L40 95 L35 80 L45 65 L55 50 L65 35 L78 25 L85 15 Z', fill: 'gradient', stroke: outerStroke }
  ],
  banner: [
    { kind: 'path', d: 'M 30 10 H 170 V 150 L 100 190 L 30 150 Z', fill: 'gradient', stroke: outerStroke }
  ],
  'shield-modern': [
    { kind: 'path', d: 'M 30 20 H 170 L 160 120 L 100 190 L 40 120 Z', fill: 'gradient', stroke: outerStroke }
  ]
};
