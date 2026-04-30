import { LayoutSettings } from './badge-types';
import { ShapeName } from './shape-defs';

export interface ShapeLayout {
  iconSettings: { x: number; y: number; size: number };
  titleSettings: LayoutSettings;
  subtitleSettings: LayoutSettings;
  accentSettings: LayoutSettings;
}

const titleBase = { x: 100, size: 18, fontWeight: 'bold' as const, fontStyle: 'normal' as const, hasShadow: true };
const subtitleBase = { x: 100, size: 12, fontWeight: 'normal' as const, fontStyle: 'normal' as const, hasShadow: false };
const accentBase = { x: 100, size: 10, fontWeight: 'bold' as const, fontStyle: 'normal' as const, hasShadow: false };
const iconBase = { x: 100, size: 40 };

const layout = (icon: number, title: number, subtitle: number, accent: number): ShapeLayout => ({
  iconSettings: { ...iconBase, y: icon },
  titleSettings: { ...titleBase, y: title },
  subtitleSettings: { ...subtitleBase, y: subtitle },
  accentSettings: { ...accentBase, y: accent }
});

/**
 * Per-shape inner area is different — using a single default for all of them
 * pushes title/subtitle into the geometry of star, ribbon, award, banner, etc.
 * Templates pull a layout from this map so the shape and the text agree.
 */
export const SHAPE_LAYOUTS: Record<ShapeName, ShapeLayout> = {
  circle: layout(72, 110, 132, 158),
  shield: layout(78, 122, 142, 168),
  hexagon: layout(75, 115, 135, 160),
  star: layout(82, 116, 132, 152),
  ribbon: layout(48, 72, 90, 105),
  diamond: layout(82, 112, 130, 150),
  octagon: layout(75, 115, 135, 160),
  award: layout(58, 84, 104, 178),
  plaque: layout(72, 108, 130, 154),
  gem: layout(68, 102, 122, 146),
  'leaf-1': layout(80, 115, 135, 158),
  'leaf-2': layout(80, 115, 135, 158),
  seal: layout(70, 110, 130, 152),
  banner: layout(48, 80, 100, 122),
  'shield-modern': layout(58, 88, 108, 132)
};

export function layoutFor(shape: ShapeName): ShapeLayout {
  return SHAPE_LAYOUTS[shape];
}
