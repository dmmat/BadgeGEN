import { Injectable, signal, computed } from '@angular/core';
import { BadgeDesign, LayoutSettings, Decoration, ExtraText } from './badge-types';

const DEFAULT_LAYOUT = {
  title: { x: 100, y: 120, size: 18, fontWeight: 'bold', fontStyle: 'normal', hasShadow: true } as LayoutSettings,
  subtitle: { x: 100, y: 140, size: 12, fontWeight: 'normal', fontStyle: 'normal', hasShadow: false } as LayoutSettings,
  accent: { x: 100, y: 165, size: 10, fontWeight: 'bold', fontStyle: 'normal', hasShadow: false } as LayoutSettings,
  icon: { x: 100, y: 85, size: 40 }
};

const DEFAULT_YEAR = new Date().getFullYear().toString();

const createDefaultBadge = (): BadgeDesign => ({
  shape: 'shield',
  shapeScale: 100,
  title: 'Certified',
  subtitle: 'Developer',
  accentText: DEFAULT_YEAR,
  primaryColor: '#3B82F6',
  secondaryColor: '#1E40AF',
  textColor: '#FFFFFF',
  emoji: '🛡️',
  iconStyle: 'emoji',
  iconColor: '#FFFFFF',
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
});

const cloneDesign = (design: BadgeDesign): BadgeDesign => {
  if (typeof structuredClone === 'function') {
    return structuredClone(design);
  }
  return JSON.parse(JSON.stringify(design));
};
const MAX_UNDO_HISTORY = 50;

@Injectable({
  providedIn: 'root'
})
export class BadgeStore {
  // State
  readonly state = signal<BadgeDesign>(createDefaultBadge());
  private undoStack: BadgeDesign[] = [];
  private redoStack: BadgeDesign[] = [];
  private debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
  private debounceBaselines: Record<string, BadgeDesign | undefined> = {};

  // Actions
  update(partial: Partial<BadgeDesign>) {
    const merged = { ...this.state(), ...partial } as BadgeDesign;
    this.commit(merged);
  }

  updateElement(element: 'title' | 'subtitle' | 'accent' | 'icon', settings: Partial<LayoutSettings>) {
    const current = this.state();
    const key = `${element}Settings` as keyof BadgeDesign;
    const currentSettings = current[key] as LayoutSettings | undefined;
    
    // Get default settings for the specific element type
    let defaultSettings: LayoutSettings | object = {};
    if (element === 'icon') {
        defaultSettings = DEFAULT_LAYOUT.icon;
    } else {
        defaultSettings = DEFAULT_LAYOUT[element];
    }

    const merged = {
      ...current,
      [key]: { ...(currentSettings || defaultSettings), ...settings }
    } as BadgeDesign;

    const isPositionalChange = 'x' in settings || 'y' in settings || 'size' in settings;
    if (isPositionalChange) {
      // Live update the state, but debounce the history commit to avoid per-pixel entries
      this.commitDebounced(`element:${element}`, merged, 200);
    } else {
      this.commit(merged);
    }
  }

  // Decoration Actions
  addDecoration(decoration: Omit<Decoration, 'id'>) {
    const id = crypto.randomUUID();
    const current = this.state();
    this.commit({
      ...current,
      decorations: [...current.decorations, { ...decoration, id }]
    });
  }

  updateDecoration(id: string, updates: Partial<Decoration>) {
    const current = this.state();
    const merged = {
      ...current,
      decorations: current.decorations.map(d => d.id === id ? { ...d, ...updates } : d)
    } as BadgeDesign;

    const isPositionalChange = 'x' in updates || 'y' in updates || 'size' in updates;
    if (isPositionalChange) {
      this.commitDebounced(`decoration:${id}`, merged, 200);
    } else {
      this.commit(merged);
    }
  }

  removeDecoration(id: string) {
    const current = this.state();
    this.commit({
      ...current,
      decorations: current.decorations.filter(d => d.id !== id)
    });
  }

  // Extra Text Actions
  addExtraText(text: Omit<ExtraText, 'id'>) {
    const id = crypto.randomUUID();
    const current = this.state();
    this.commit({
      ...current,
      extraTexts: [...current.extraTexts, { ...text, id, fontWeight: 'bold', fontStyle: 'normal', hasShadow: false }]
    });
  }

  updateExtraText(id: string, updates: Partial<ExtraText>) {
    const current = this.state();
    const merged = {
      ...current,
      extraTexts: current.extraTexts.map(t => t.id === id ? { ...t, ...updates } : t)
    } as BadgeDesign;

    const isPositionalChange = 'x' in updates || 'y' in updates || 'size' in updates;
    if (isPositionalChange) {
      this.commitDebounced(`extraText:${id}`, merged, 200);
    } else {
      this.commit(merged);
    }
  }

  removeExtraText(id: string) {
    const current = this.state();
    this.commit({
      ...current,
      extraTexts: current.extraTexts.filter(t => t.id !== id)
    });
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
      this.state.set({ ...createDefaultBadge(), ...design });
      this.undoStack = [];
      this.redoStack = [];
    } catch (e) {
      console.error('Failed to load shared state', e);
    }
  }

  // Selectors/Computed
  readonly badge = computed(() => this.state());

  reset() {
    this.undoStack = [];
    this.redoStack = [];
    this.state.set(createDefaultBadge());
  }

  undo() {
    if (this.undoStack.length === 0) return;
    const previous = this.undoStack.pop()!;
    const currentSnapshot = cloneDesign(this.state());
    this.redoStack.push(currentSnapshot);
    this.state.set(previous);
  }

  redo() {
    if (this.redoStack.length === 0) return;
    const next = this.redoStack.pop()!;
    const currentSnapshot = cloneDesign(this.state());
    this.undoStack.push(currentSnapshot);
    this.state.set(next);
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  private commit(newState: BadgeDesign) {
    const snapshot = cloneDesign(this.state());
    this.undoStack.push(snapshot);
    if (this.undoStack.length > MAX_UNDO_HISTORY) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    this.state.set(cloneDesign(newState));
  }

  private commitDebounced(key: string, newState: BadgeDesign, ms = 200) {
    // Initialize baseline on first call for this key
    if (!this.debounceTimers[key] && !this.debounceBaselines[key]) {
      this.debounceBaselines[key] = cloneDesign(this.state());
    }

    // Reset timer for coalescing rapid updates
    if (this.debounceTimers[key]) {
      clearTimeout(this.debounceTimers[key]);
    }

    // Live-update the state for immediate visual feedback
    this.state.set(cloneDesign(newState));

    // Schedule a single history commit using the baseline
    this.debounceTimers[key] = setTimeout(() => {
      const baseline = this.debounceBaselines[key] ?? cloneDesign(this.state());
      delete this.debounceTimers[key];
      delete this.debounceBaselines[key];

      // Push baseline to undo history and apply final state
      this.undoStack.push(baseline);
      if (this.undoStack.length > MAX_UNDO_HISTORY) {
        this.undoStack.shift();
      }
      this.redoStack = [];
      this.state.set(cloneDesign(newState));
    }, ms);
  }
}
