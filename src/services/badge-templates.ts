import { BadgeDesign, LayoutSettings } from './badge-types';
import { layoutFor } from './shape-layouts';
import { ShapeName } from './shape-defs';

export interface BadgeTemplate {
  id: string;
  label: string;
  preview: string;
  design: Partial<BadgeDesign>;
}

interface TemplateInput {
  shape: ShapeName;
  title: string;
  subtitle: string;
  accentText: string;
  primaryColor: string;
  secondaryColor: string;
  textColor?: string;
  borderColor?: string;
  emoji: string;
  iconStyle?: 'emoji' | 'mono';
  iconColor?: string;
  font: string;
  gradientType?: 'linear' | 'radial';
  gradientAngle?: number;
  borderWidth?: number;
  /** Per-template overrides for individual sub-settings (sizes, weights). */
  titleOverride?: Partial<LayoutSettings>;
  subtitleOverride?: Partial<LayoutSettings>;
  accentOverride?: Partial<LayoutSettings>;
  iconOverride?: Partial<{ x: number; y: number; size: number }>;
}

function build(input: TemplateInput): Partial<BadgeDesign> {
  const layout = layoutFor(input.shape);
  return {
    shape: input.shape,
    title: input.title,
    subtitle: input.subtitle,
    accentText: input.accentText,
    primaryColor: input.primaryColor,
    secondaryColor: input.secondaryColor,
    textColor: input.textColor ?? '#FFFFFF',
    borderColor: input.borderColor ?? '#FFFFFF',
    emoji: input.emoji,
    iconStyle: input.iconStyle ?? 'emoji',
    iconColor: input.iconColor ?? '#FFFFFF',
    font: input.font,
    gradientType: input.gradientType ?? 'linear',
    gradientAngle: input.gradientAngle ?? 135,
    borderWidth: input.borderWidth ?? 3,
    hasShadow: true,
    titleSettings: { ...layout.titleSettings, ...input.titleOverride },
    subtitleSettings: { ...layout.subtitleSettings, ...input.subtitleOverride },
    accentSettings: { ...layout.accentSettings, ...input.accentOverride },
    iconSettings: { ...layout.iconSettings, ...input.iconOverride }
  };
}

export const BADGE_TEMPLATES: BadgeTemplate[] = [
  {
    id: 'hackathon-winner',
    label: 'Hackathon Winner',
    preview: '🏆',
    design: build({
      shape: 'star',
      title: 'WINNER',
      subtitle: 'Hackathon',
      accentText: new Date().getFullYear().toString(),
      primaryColor: '#f59e0b',
      secondaryColor: '#dc2626',
      emoji: '🏆',
      font: 'Bebas Neue',
      // star's inner area is small, shrink the title and accent so it fits
      titleOverride: { size: 16 },
      subtitleOverride: { size: 10 },
      accentOverride: { size: 9 },
      iconOverride: { size: 32 }
    })
  },
  {
    id: 'top-contributor',
    label: 'Top Contributor',
    preview: '⭐',
    design: build({
      shape: 'shield',
      title: 'Top',
      subtitle: 'Contributor',
      accentText: 'OPEN SOURCE',
      primaryColor: '#1e3a8a',
      secondaryColor: '#3b82f6',
      borderColor: '#bfdbfe',
      emoji: '⭐',
      font: 'Inter',
      borderWidth: 4
    })
  },
  {
    id: 'course-completion',
    label: 'Course Completion',
    preview: '🎓',
    design: build({
      shape: 'seal',
      title: 'Certified',
      subtitle: 'Graduate',
      accentText: 'COMPLETED',
      primaryColor: '#7c3aed',
      secondaryColor: '#4338ca',
      emoji: '🎓',
      font: 'Cinzel',
      gradientType: 'radial',
      gradientAngle: 0,
      titleOverride: { size: 16 },
      iconOverride: { size: 36 }
    })
  },
  {
    id: 'speaker',
    label: 'Speaker',
    preview: '🎤',
    design: build({
      shape: 'ribbon',
      title: 'Speaker',
      subtitle: 'Conf 2026',
      accentText: 'KEYNOTE',
      primaryColor: '#0f172a',
      secondaryColor: '#3b82f6',
      emoji: '🎤',
      font: 'Montserrat',
      titleOverride: { size: 14 },
      subtitleOverride: { size: 10 },
      accentOverride: { size: 8 },
      iconOverride: { size: 28 }
    })
  },
  {
    id: 'beta-tester',
    label: 'Beta Tester',
    preview: '🧪',
    design: build({
      shape: 'hexagon',
      title: 'Beta',
      subtitle: 'Tester',
      accentText: 'EARLY ACCESS',
      primaryColor: '#10b981',
      secondaryColor: '#0ea5e9',
      emoji: '🧪',
      font: 'Rubik'
    })
  },
  {
    id: 'founder',
    label: 'Founder',
    preview: '🚀',
    design: build({
      shape: 'shield-modern',
      title: 'Founder',
      subtitle: 'Member',
      accentText: 'CHARTER',
      primaryColor: '#1f2937',
      secondaryColor: '#fbbf24',
      borderColor: '#fbbf24',
      emoji: '🚀',
      font: 'Playfair Display',
      borderWidth: 4,
      titleOverride: { size: 15 },
      subtitleOverride: { size: 11 }
    })
  },
  {
    id: 'verified',
    label: 'Verified',
    preview: '✓',
    design: build({
      shape: 'circle',
      title: 'Verified',
      subtitle: 'Account',
      accentText: 'TRUSTED',
      primaryColor: '#1d4ed8',
      secondaryColor: '#06b6d4',
      emoji: '✓',
      iconStyle: 'mono',
      iconColor: '#FFFFFF',
      font: 'Inter',
      borderWidth: 4
    })
  },
  {
    id: 'community-hero',
    label: 'Community Hero',
    preview: '🦸',
    design: build({
      shape: 'award',
      title: 'Community',
      subtitle: 'Hero',
      accentText: 'CONTRIBUTOR',
      primaryColor: '#db2777',
      secondaryColor: '#f97316',
      emoji: '🦸',
      font: 'Poppins',
      titleOverride: { size: 14 },
      subtitleOverride: { size: 11 },
      accentOverride: { size: 9, hasShadow: false },
      iconOverride: { size: 30 }
    })
  },
  {
    id: 'hall-of-fame',
    label: 'Hall of Fame',
    preview: '🏅',
    design: build({
      shape: 'gem',
      title: 'Hall of',
      subtitle: 'Fame',
      accentText: new Date().getFullYear().toString(),
      primaryColor: '#854d0e',
      secondaryColor: '#fbbf24',
      emoji: '🏅',
      font: 'Cinzel',
      gradientType: 'radial',
      gradientAngle: 0,
      borderWidth: 4,
      titleOverride: { size: 16 },
      subtitleOverride: { size: 14 }
    })
  }
];
