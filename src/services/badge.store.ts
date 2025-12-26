import { Injectable, signal, computed } from '@angular/core';
import { BadgeDesign, LayoutSettings, Decoration, ExtraText } from './gemini.service';

const DEFAULT_LAYOUT = {
  title: { x: 100, y: 120, size: 18, fontWeight: 'bold', fontStyle: 'normal', hasShadow: true } as LayoutSettings,
  subtitle: { x: 100, y: 140, size: 12, fontWeight: 'normal', fontStyle: 'normal', hasShadow: false } as LayoutSettings,
  accent: { x: 100, y: 165, size: 10, fontWeight: 'bold', fontStyle: 'normal', hasShadow: false } as LayoutSettings,
  icon: { x: 100, y: 85, size: 40 }
};

const DEFAULT_BADGE: BadgeDesign = {
  shape: 'shield',
  title: 'Certified',
  subtitle: 'Developer',
  accentText: '2024',
  primaryColor: '#3B82F6',
  secondaryColor: '#1E40AF',
  textColor: '#FFFFFF',
  emoji: '🛡️',
  font: 'Inter',
  gradientType: 'linear',
  gradientAngle: 135,
  borderWidth: 4,
  borderColor: '#FFFFFF',
  hasShadow: true,
  titleSettings: DEFAULT_LAYOUT.title,
  subtitleSettings: DEFAULT_LAYOUT.subtitle,
  accentSettings: DEFAULT_LAYOUT.accent,
  iconSettings: DEFAULT_LAYOUT.icon,
  decorations: [],
  extraTexts: []
};

@Injectable({
  providedIn: 'root'
})
export class BadgeStore {
  // State
  readonly state = signal<BadgeDesign>(DEFAULT_BADGE);

  // Actions
  update(partial: Partial<BadgeDesign>) {
    this.state.update(current => ({ ...current, ...partial }));
  }

  updateElement(element: 'title' | 'subtitle' | 'accent' | 'icon', settings: Partial<LayoutSettings>) {
    this.state.update(current => {
      const key = `${element}Settings` as keyof BadgeDesign;
      const currentSettings = current[key] as LayoutSettings | undefined;
      
      // Get default settings for the specific element type
      let defaultSettings: LayoutSettings | object = {};
      if (element === 'icon') {
          defaultSettings = DEFAULT_LAYOUT.icon;
      } else {
          defaultSettings = DEFAULT_LAYOUT[element];
      }

      return {
        ...current,
        [key]: { ...(currentSettings || defaultSettings), ...settings }
      };
    });
  }

  // Decoration Actions
  addDecoration(decoration: Omit<Decoration, 'id'>) {
    const id = crypto.randomUUID();
    this.state.update(current => ({
      ...current,
      decorations: [...current.decorations, { ...decoration, id }]
    }));
  }

  updateDecoration(id: string, updates: Partial<Decoration>) {
    this.state.update(current => ({
      ...current,
      decorations: current.decorations.map(d => d.id === id ? { ...d, ...updates } : d)
    }));
  }

  removeDecoration(id: string) {
    this.state.update(current => ({
      ...current,
      decorations: current.decorations.filter(d => d.id !== id)
    }));
  }

  // Extra Text Actions
  addExtraText(text: Omit<ExtraText, 'id'>) {
    const id = crypto.randomUUID();
    this.state.update(current => ({
      ...current,
      extraTexts: [...current.extraTexts, { ...text, id, fontWeight: 'bold', fontStyle: 'normal', hasShadow: false }]
    }));
  }

  updateExtraText(id: string, updates: Partial<ExtraText>) {
    this.state.update(current => ({
      ...current,
      extraTexts: current.extraTexts.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  }

  removeExtraText(id: string) {
    this.state.update(current => ({
      ...current,
      extraTexts: current.extraTexts.filter(t => t.id !== id)
    }));
  }

  // Sharing
  serializeState(): string {
    const json = JSON.stringify(this.state());
    return btoa(encodeURIComponent(json));
  }

  loadState(encoded: string) {
    try {
      const json = decodeURIComponent(atob(encoded));
      const design = JSON.parse(json) as BadgeDesign;
      this.state.set(design);
    } catch (e) {
      console.error('Failed to load shared state', e);
    }
  }

  // Selectors/Computed
  readonly badge = computed(() => this.state());
}