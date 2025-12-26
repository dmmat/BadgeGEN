import { Injectable } from '@angular/core';

export interface LayoutSettings {
  x: number;
  y: number;
  size: number;
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
  weight: 'normal' | 'bold';
  rotation: number;
}

export interface BadgeDesign {
  shape: 'circle' | 'shield' | 'hexagon' | 'star' | 'ribbon' | 'diamond' | 'octagon' | 'award' | 'plaque' | 'gem' | 'leaf-1' | 'leaf-2' | 'seal' | 'banner' | 'shield-modern';
  title: string;
  subtitle: string;
  accentText: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  emoji: string;
  font: string;
  
  // Gradient Settings
  gradientType: 'linear' | 'radial';
  gradientAngle: number; // 0-360 for linear

  customLogo?: string; // Base64 data URI
  
  // Layout Configuration
  titleSettings?: LayoutSettings;
  subtitleSettings?: LayoutSettings;
  accentSettings?: LayoutSettings;
  iconSettings?: LayoutSettings;

  // Extra Elements
  decorations: Decoration[];
  extraTexts: ExtraText[];
}