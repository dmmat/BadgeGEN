export interface LayoutSettings {
  x: number;
  y: number;
  size: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  hasShadow: boolean;
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
  iconSettings?: Omit<LayoutSettings, 'fontWeight' | 'fontStyle' | 'hasShadow'>;

  // Extra Elements
  decorations: Decoration[];
  extraTexts: ExtraText[];
}
