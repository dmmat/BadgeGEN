import { BadgeDesign } from './badge-types';

export interface BadgeTemplate {
  id: string;
  label: string;
  preview: string; // emoji used as a tiny sneak-peek
  design: Partial<BadgeDesign>;
}

const baseLayout = {
  titleSettings: { x: 100, y: 120, size: 18, fontWeight: 'bold' as const, fontStyle: 'normal' as const, hasShadow: true },
  subtitleSettings: { x: 100, y: 140, size: 12, fontWeight: 'normal' as const, fontStyle: 'normal' as const, hasShadow: false },
  accentSettings: { x: 100, y: 165, size: 10, fontWeight: 'bold' as const, fontStyle: 'normal' as const, hasShadow: false },
  iconSettings: { x: 100, y: 85, size: 40 }
};

export const BADGE_TEMPLATES: BadgeTemplate[] = [
  {
    id: 'hackathon-winner',
    label: 'Hackathon Winner',
    preview: '🏆',
    design: {
      shape: 'star',
      title: 'Hackathon',
      subtitle: 'Winner',
      accentText: new Date().getFullYear().toString(),
      primaryColor: '#f59e0b',
      secondaryColor: '#dc2626',
      textColor: '#FFFFFF',
      borderColor: '#FFFFFF',
      emoji: '🏆',
      font: 'Bebas Neue',
      gradientType: 'linear',
      gradientAngle: 135,
      borderWidth: 3,
      hasShadow: true,
      ...baseLayout
    }
  },
  {
    id: 'top-contributor',
    label: 'Top Contributor',
    preview: '⭐',
    design: {
      shape: 'shield',
      title: 'Top',
      subtitle: 'Contributor',
      accentText: 'OPEN SOURCE',
      primaryColor: '#1e3a8a',
      secondaryColor: '#3b82f6',
      textColor: '#FFFFFF',
      borderColor: '#bfdbfe',
      emoji: '⭐',
      font: 'Inter',
      gradientType: 'linear',
      gradientAngle: 135,
      borderWidth: 4,
      hasShadow: true,
      ...baseLayout
    }
  },
  {
    id: 'course-completion',
    label: 'Course Completion',
    preview: '🎓',
    design: {
      shape: 'seal',
      title: 'Certified',
      subtitle: 'Graduate',
      accentText: 'COMPLETED',
      primaryColor: '#7c3aed',
      secondaryColor: '#4338ca',
      textColor: '#FFFFFF',
      borderColor: '#FFFFFF',
      emoji: '🎓',
      font: 'Cinzel',
      gradientType: 'radial',
      gradientAngle: 0,
      borderWidth: 3,
      hasShadow: true,
      ...baseLayout
    }
  },
  {
    id: 'speaker',
    label: 'Speaker',
    preview: '🎤',
    design: {
      shape: 'ribbon',
      title: 'Speaker',
      subtitle: 'Conf 2026',
      accentText: 'KEYNOTE',
      primaryColor: '#0f172a',
      secondaryColor: '#3b82f6',
      textColor: '#FFFFFF',
      borderColor: '#FFFFFF',
      emoji: '🎤',
      font: 'Montserrat',
      gradientType: 'linear',
      gradientAngle: 135,
      borderWidth: 3,
      hasShadow: true,
      ...baseLayout
    }
  },
  {
    id: 'beta-tester',
    label: 'Beta Tester',
    preview: '🧪',
    design: {
      shape: 'hexagon',
      title: 'Beta',
      subtitle: 'Tester',
      accentText: 'EARLY ACCESS',
      primaryColor: '#10b981',
      secondaryColor: '#0ea5e9',
      textColor: '#FFFFFF',
      borderColor: '#FFFFFF',
      emoji: '🧪',
      font: 'Rubik',
      gradientType: 'linear',
      gradientAngle: 135,
      borderWidth: 3,
      hasShadow: true,
      ...baseLayout
    }
  },
  {
    id: 'founder',
    label: 'Founder',
    preview: '🚀',
    design: {
      shape: 'shield-modern',
      title: 'Founder',
      subtitle: 'Member',
      accentText: 'CHARTER',
      primaryColor: '#1f2937',
      secondaryColor: '#fbbf24',
      textColor: '#FFFFFF',
      borderColor: '#fbbf24',
      emoji: '🚀',
      font: 'Playfair Display',
      gradientType: 'linear',
      gradientAngle: 135,
      borderWidth: 4,
      hasShadow: true,
      ...baseLayout
    }
  },
  {
    id: 'verified',
    label: 'Verified',
    preview: '✓',
    design: {
      shape: 'circle',
      title: 'Verified',
      subtitle: 'Account',
      accentText: 'TRUSTED',
      primaryColor: '#1d4ed8',
      secondaryColor: '#06b6d4',
      textColor: '#FFFFFF',
      borderColor: '#FFFFFF',
      emoji: '✓',
      iconStyle: 'mono',
      iconColor: '#FFFFFF',
      font: 'Inter',
      gradientType: 'linear',
      gradientAngle: 135,
      borderWidth: 4,
      hasShadow: true,
      ...baseLayout
    }
  },
  {
    id: 'community-hero',
    label: 'Community Hero',
    preview: '🦸',
    design: {
      shape: 'award',
      title: 'Community',
      subtitle: 'Hero',
      accentText: 'CONTRIBUTOR',
      primaryColor: '#db2777',
      secondaryColor: '#f97316',
      textColor: '#FFFFFF',
      borderColor: '#FFFFFF',
      emoji: '🦸',
      font: 'Poppins',
      gradientType: 'linear',
      gradientAngle: 135,
      borderWidth: 3,
      hasShadow: true,
      ...baseLayout
    }
  },
  {
    id: 'hall-of-fame',
    label: 'Hall of Fame',
    preview: '🏅',
    design: {
      shape: 'gem',
      title: 'Hall of',
      subtitle: 'Fame',
      accentText: new Date().getFullYear().toString(),
      primaryColor: '#854d0e',
      secondaryColor: '#fbbf24',
      textColor: '#FFFFFF',
      borderColor: '#FFFFFF',
      emoji: '🏅',
      font: 'Cinzel',
      gradientType: 'radial',
      gradientAngle: 0,
      borderWidth: 4,
      hasShadow: true,
      ...baseLayout
    }
  }
];
