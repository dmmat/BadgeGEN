export interface CurveSettings {
  /** Radius of the imaginary circle the text follows, in viewBox units. 0 disables curving. */
  radius: number;
  /** Angle (deg) at which the centre of the text sits. 0 = top, 90 = right, 180 = bottom, 270 = left. */
  centerAngle: number;
  /** When true, text rides on the inside of the arc — useful for bottom-curved text. */
  flip: boolean;
}

export interface LayoutSettings {
  x: number;
  y: number;
  size: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  hasShadow: boolean;
  curve?: CurveSettings;
}

export type DecorationType =
  'star' | 'heart' | 'laurel-wreath' | 'crown' | 'ribbon-bow' |
  'wing' | 'sparkles' | 'trophy' | 'medal' | 'check-mark' | 'image';

export interface Decoration {
  id: string;
  type: DecorationType;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color?: string;
  customImage?: string; // Base64
}

export interface ExtraText {
  id: string;
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  font?: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  hasShadow: boolean;
  rotation: number;
  curve?: CurveSettings;
}

export type SealShapeKind = 'circle';
export type StrokeStyle = 'solid' | 'dashed' | 'dotted';

export type SelectableType = 'title' | 'subtitle' | 'accent' | 'icon' | 'decoration' | 'extraText' | 'sealShape';
export interface Selection {
  type: SelectableType;
  id?: string;
}

export interface ShapeBorder {
  id: string;
  color: string;
  width: number;
  style: StrokeStyle;
  opacity: number;
  /** Scale around the shape centre (1 = on the outline, >1 = outward, <1 = inward). */
  scale: number;
}

export interface SealShape {
  id: string;
  kind: SealShapeKind;
  cx: number;
  cy: number;
  /** Radius (for circle) in viewBox units. */
  radius: number;
  fill: string;          // 'none' or hex
  stroke: string;        // hex
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  strokeOpacity: number; // 0..1
}

export interface BadgeDesign {
  shape: 'circle' | 'shield' | 'hexagon' | 'star' | 'ribbon' | 'diamond' | 'octagon' | 'award' | 'plaque' | 'gem' | 'leaf-1' | 'leaf-2' | 'seal' | 'banner' | 'shield-modern';
  shapeScale: number;
  canvasSize?: number; // export PNG size (px)
  title: string;
  subtitle: string;
  accentText: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  emoji: string;
  font: string;

  // Border & Shadow
  borderWidth: number;
  borderColor: string;
  hasShadow: boolean;

  // Gradient Settings
  gradientType: 'linear' | 'radial';
  gradientAngle: number; // 0-360 for linear

  customLogo?: string; // Base64 data URI
  iconStyle: 'emoji' | 'mono';
  iconColor: string;

  // Layout Configuration
  titleSettings?: LayoutSettings;
  subtitleSettings?: LayoutSettings;
  accentSettings?: LayoutSettings;
  iconSettings?: Omit<LayoutSettings, 'fontWeight' | 'fontStyle' | 'hasShadow' | 'curve'>;

  // Extra Elements
  decorations: Decoration[];
  extraTexts: ExtraText[];
  sealShapes: SealShape[];
  extraBorders: ShapeBorder[];
}
