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
  canvasSize: 1000,
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
  private readonly undoCount = signal(0);
  private readonly redoCount = signal(0);
  private debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
  private debounceBaselines: Record<string, BadgeDesign | undefined> = {};

  readonly canUndo = computed(() => this.undoCount() > 0);
  readonly canRedo = computed(() => this.redoCount() > 0);

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

  // Sharing — UTF-safe base64url
  serializeState(): string {
    const json = JSON.stringify(this.state());
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  loadState(encoded: string): boolean {
    try {
      // Accept both legacy (encodeURIComponent + btoa) and new base64url payloads
      const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
      const padding = padded.length % 4 === 0 ? 0 : 4 - (padded.length % 4);
      const base64 = padded + '='.repeat(padding);
      const binary = atob(base64);
      let json: string;
      try {
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        json = new TextDecoder().decode(bytes);
        JSON.parse(json);
      } catch {
        json = decodeURIComponent(binary);
      }
      const design = JSON.parse(json) as BadgeDesign;
      this.state.set({ ...createDefaultBadge(), ...design });
      this.undoStack = [];
      this.redoStack = [];
      this.syncHistorySignals();
      return true;
    } catch (e) {
      console.error('Failed to load shared state', e);
      return false;
    }
  }

  // Selectors/Computed
  readonly badge = computed(() => this.state());

  reset() {
    this.undoStack = [];
    this.redoStack = [];
    this.syncHistorySignals();
    this.state.set(createDefaultBadge());
  }

  applyTemplate(template: Partial<BadgeDesign>) {
    // Drop element-collections from previous design so a template starts clean
    const merged: BadgeDesign = {
      ...createDefaultBadge(),
      ...template,
      decorations: template.decorations ?? [],
      extraTexts: template.extraTexts ?? []
    };
    this.commit(merged);
  }

  undo() {
    if (this.undoStack.length === 0) return;
    const previous = this.undoStack.pop()!;
    const currentSnapshot = cloneDesign(this.state());
    this.redoStack.push(currentSnapshot);
    this.syncHistorySignals();
    this.state.set(previous);
  }

  redo() {
    if (this.redoStack.length === 0) return;
    const next = this.redoStack.pop()!;
    const currentSnapshot = cloneDesign(this.state());
    this.undoStack.push(currentSnapshot);
    this.syncHistorySignals();
    this.state.set(next);
  }

  private commit(newState: BadgeDesign) {
    const snapshot = cloneDesign(this.state());
    this.undoStack.push(snapshot);
    if (this.undoStack.length > MAX_UNDO_HISTORY) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    this.syncHistorySignals();
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

      this.undoStack.push(baseline);
      if (this.undoStack.length > MAX_UNDO_HISTORY) {
        this.undoStack.shift();
      }
      this.redoStack = [];
      this.syncHistorySignals();
      this.state.set(cloneDesign(newState));
    }, ms);
  }

  private syncHistorySignals() {
    this.undoCount.set(this.undoStack.length);
    this.redoCount.set(this.redoStack.length);
  }
}
