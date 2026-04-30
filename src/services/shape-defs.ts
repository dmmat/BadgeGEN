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
  opacity?: number;
  dasharray?: string;
  /** When omitted, uses design.borderColor; when 'border-width' the layer uses design.borderWidth. */
  useBorderWidth?: boolean;
}

const outerStroke: LayerStroke = { useBorderWidth: true };
const innerStroke = (opacity: number, dasharray?: string): LayerStroke => ({ width: 1, opacity, dasharray });

export const SHAPE_DEFS: Record<ShapeName, ShapeLayer[]> = {
  circle: [
    { kind: 'circle', cx: 100, cy: 100, r: 90, fill: 'gradient', stroke: outerStroke },
    { kind: 'circle', cx: 100, cy: 100, r: 80, fill: 'none', stroke: innerStroke(0.5, '4 2') }
  ],
  shield: [
    { kind: 'path', d: 'M100 10 L180 50 V110 C180 155 145 185 100 195 C55 185 20 155 20 110 V50 L100 10 Z', fill: 'gradient', stroke: outerStroke },
    { kind: 'path', d: 'M100 20 L170 55 V105 C170 145 140 170 100 180 C60 170 30 145 30 105 V55 L100 20 Z', fill: 'none', stroke: innerStroke(0.3) }
  ],
  hexagon: [
    { kind: 'polygon', points: '100,10 190,55 190,145 100,190 10,145 10,55', fill: 'gradient', stroke: outerStroke },
    { kind: 'polygon', points: '100,20 180,60 180,140 100,180 20,140 20,60', fill: 'none', stroke: innerStroke(0.4) }
  ],
  star: [
    { kind: 'polygon', points: '100,10 123,75 190,78 138,115 155,180 100,145 45,180 62,115 10,78 77,75', fill: 'gradient', stroke: outerStroke }
  ],
  ribbon: [
    { kind: 'path', d: 'M40 20 H160 V140 L100 110 L40 140 V20 Z', fill: 'gradient', stroke: outerStroke },
    { kind: 'rect', x: 30, y: 10, width: 140, height: 15, rx: 5, fill: 'secondary', stroke: { width: 2 } }
  ],
  diamond: [
    { kind: 'polygon', points: '100,10 190,100 100,190 10,100', fill: 'gradient', stroke: outerStroke },
    { kind: 'polygon', points: '100,25 175,100 100,175 25,100', fill: 'none', stroke: innerStroke(0.4) }
  ],
  octagon: [
    { kind: 'polygon', points: '60,10 140,10 190,60 190,140 140,190 60,190 10,140 10,60', fill: 'gradient', stroke: outerStroke },
    { kind: 'polygon', points: '65,20 135,20 180,65 180,135 135,180 65,180 20,135 20,65', fill: 'none', stroke: innerStroke(0.4) }
  ],
  award: [
    { kind: 'path', d: 'M70 150 L50 190 L85 180 L100 195 L115 180 L150 190 L130 150', fill: 'secondary', stroke: { width: 2 } },
    { kind: 'circle', cx: 100, cy: 90, r: 70, fill: 'gradient', stroke: outerStroke },
    { kind: 'circle', cx: 100, cy: 90, r: 60, fill: 'none', stroke: innerStroke(0.6, '2 2') }
  ],
  plaque: [
    { kind: 'rect', x: 20, y: 30, width: 160, height: 140, rx: 10, fill: 'gradient', stroke: outerStroke },
    { kind: 'rect', x: 30, y: 40, width: 140, height: 120, rx: 5, fill: 'none', stroke: innerStroke(0.4) }
  ],
  gem: [
    { kind: 'path', d: 'M50 30 L150 30 L190 80 L100 180 L10 80 Z', fill: 'gradient', stroke: outerStroke },
    { kind: 'path', d: 'M50 30 L100 100 M150 30 L100 100 M190 80 L100 100 M10 80 L100 100 M100 180 L100 100', fill: 'none', stroke: innerStroke(0.5) }
  ],
  'leaf-1': [
    { kind: 'path', d: 'M 30 90 Q 30 30 90 30 L 170 30 L 170 110 Q 170 170 110 170 L 30 170 Z', fill: 'gradient', stroke: outerStroke },
    { kind: 'path', d: 'M 40 95 Q 40 40 95 40 L 160 40 L 160 105 Q 160 160 105 160 L 40 160 Z', fill: 'none', stroke: innerStroke(0.4) }
  ],
  'leaf-2': [
    { kind: 'path', d: 'M 30 30 L 110 30 Q 170 30 170 90 L 170 170 L 90 170 Q 30 170 30 110 Z', fill: 'gradient', stroke: outerStroke },
    { kind: 'path', d: 'M 40 40 L 105 40 Q 160 40 160 95 L 160 160 L 95 160 Q 40 160 40 105 Z', fill: 'none', stroke: innerStroke(0.4) }
  ],
  seal: [
    { kind: 'path', d: 'M100 10 L115 15 L122 25 L135 35 L145 50 L155 65 L165 80 L160 95 L165 110 L155 125 L145 140 L135 155 L122 165 L115 175 L100 180 L85 175 L78 165 L65 155 L55 140 L45 125 L35 110 L40 95 L35 80 L45 65 L55 50 L65 35 L78 25 L85 15 Z', fill: 'gradient', stroke: outerStroke },
    { kind: 'circle', cx: 100, cy: 95, r: 70, fill: 'none', stroke: innerStroke(0.5, '3 3') }
  ],
  banner: [
    { kind: 'path', d: 'M 30 10 H 170 V 150 L 100 190 L 30 150 Z', fill: 'gradient', stroke: outerStroke },
    { kind: 'rect', x: 40, y: 20, width: 120, height: 120, fill: 'none', stroke: innerStroke(0.3) }
  ],
  'shield-modern': [
    { kind: 'path', d: 'M 30 20 H 170 L 160 120 L 100 190 L 40 120 Z', fill: 'gradient', stroke: outerStroke },
    { kind: 'path', d: 'M 45 30 H 155 L 148 110 L 100 170 L 52 110 Z', fill: 'none', stroke: innerStroke(0.4) }
  ]
};
