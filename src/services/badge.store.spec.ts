import { describe, it, expect, beforeEach, vi } from 'vitest';

// effect() requires an Angular injection context. The store uses it only for
// autosave, which is an integration concern; stub it so we can unit-test the
// pure state machine.
vi.mock('@angular/core', async () => {
  const actual = await vi.importActual<typeof import('@angular/core')>('@angular/core');
  return { ...actual, effect: () => ({ destroy: () => {} }) };
});

import { BadgeStore } from './badge.store';
import { BadgeDesign } from './badge-types';

describe('BadgeStore', () => {
  let store: BadgeStore;

  beforeEach(() => {
    localStorage.clear();
    store = new BadgeStore();
  });

  describe('initial state', () => {
    it('starts on the default design', () => {
      expect(store.state().shape).toBe('shield');
      expect(store.state().title).toBe('Certified');
    });

    it('reports empty undo/redo stacks initially', () => {
      expect(store.canUndo()).toBe(false);
      expect(store.canRedo()).toBe(false);
    });
  });

  describe('update + undo/redo', () => {
    it('records updates in history', () => {
      store.update({ title: 'Changed' });
      expect(store.state().title).toBe('Changed');
      expect(store.canUndo()).toBe(true);
      expect(store.canRedo()).toBe(false);
    });

    it('undo restores previous state and enables redo', () => {
      store.update({ title: 'A' });
      store.update({ title: 'B' });

      store.undo();
      expect(store.state().title).toBe('A');
      expect(store.canRedo()).toBe(true);

      store.undo();
      expect(store.state().title).toBe('Certified');
    });

    it('redo replays an undone change', () => {
      store.update({ title: 'A' });
      store.undo();
      store.redo();
      expect(store.state().title).toBe('A');
    });

    it('committing after undo clears redo', () => {
      store.update({ title: 'A' });
      store.undo();
      expect(store.canRedo()).toBe(true);

      store.update({ title: 'B' });
      expect(store.canRedo()).toBe(false);
    });

    it('caps undo history (sanity bound, not throwing)', () => {
      for (let i = 0; i < 80; i++) {
        store.update({ title: `T${i}` });
      }
      // 50-entry cap means we can undo at most 50 times back from the latest
      let undoSteps = 0;
      while (store.canUndo() && undoSteps < 100) {
        store.undo();
        undoSteps++;
      }
      expect(undoSteps).toBeLessThanOrEqual(50);
    });
  });

  describe('decoration actions', () => {
    it('adds a decoration with a generated id', () => {
      store.addDecoration({ type: 'star', x: 50, y: 50, size: 20, rotation: 0, color: '#fff' });
      expect(store.state().decorations).toHaveLength(1);
      expect(store.state().decorations[0].id).toBeTruthy();
      expect(store.state().decorations[0].type).toBe('star');
    });

    it('updates and removes a decoration', () => {
      store.addDecoration({ type: 'star', x: 50, y: 50, size: 20, rotation: 0, color: '#fff' });
      const id = store.state().decorations[0].id;

      store.updateDecoration(id, { color: '#ff0000' });
      expect(store.state().decorations[0].color).toBe('#ff0000');

      store.removeDecoration(id);
      expect(store.state().decorations).toHaveLength(0);
    });
  });

  describe('serialization', () => {
    it('round-trips through serializeState / loadState', () => {
      store.update({ title: 'Round Trip', primaryColor: '#abcdef' });
      const encoded = store.serializeState();

      const fresh = new BadgeStore();
      fresh.loadState(encoded);
      expect(fresh.state().title).toBe('Round Trip');
      expect(fresh.state().primaryColor).toBe('#abcdef');
    });

    it('handles non-ASCII characters (UTF-8 safe)', () => {
      store.update({ title: 'Сертифікат 🎉', subtitle: 'Развитие' });
      const encoded = store.serializeState();
      // base64url alphabet only
      expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);

      const fresh = new BadgeStore();
      fresh.loadState(encoded);
      expect(fresh.state().title).toBe('Сертифікат 🎉');
      expect(fresh.state().subtitle).toBe('Развитие');
    });

    it('rejects garbage and returns false', () => {
      const ok = store.loadState('!!!not-valid!!!');
      expect(ok).toBe(false);
    });

    it('accepts legacy encodeURIComponent+btoa payloads', () => {
      const legacy: Partial<BadgeDesign> = { title: 'Legacy', subtitle: 'Old' };
      const legacyEncoded = btoa(encodeURIComponent(JSON.stringify({ ...legacy })));

      const fresh = new BadgeStore();
      const ok = fresh.loadState(legacyEncoded);
      expect(ok).toBe(true);
      expect(fresh.state().title).toBe('Legacy');
    });

    it('clears history on load', () => {
      store.update({ title: 'A' });
      const fresh = new BadgeStore();
      fresh.loadState(store.serializeState());
      expect(fresh.canUndo()).toBe(false);
      expect(fresh.canRedo()).toBe(false);
    });
  });

  describe('import / export JSON', () => {
    it('exports + imports JSON', () => {
      store.update({ title: 'Exported' });
      const json = store.exportJson();

      const fresh = new BadgeStore();
      const ok = fresh.importJson(json);
      expect(ok).toBe(true);
      expect(fresh.state().title).toBe('Exported');
    });

    it('refuses malformed JSON', () => {
      expect(store.importJson('not json')).toBe(false);
    });

    it('importJson is undoable', () => {
      const original = store.state().title;
      store.importJson(JSON.stringify({ title: 'Imported' }));
      expect(store.state().title).toBe('Imported');
      store.undo();
      expect(store.state().title).toBe(original);
    });
  });

  describe('reset / template', () => {
    it('reset wipes history and restores defaults', () => {
      store.update({ title: 'Modified' });
      store.reset();
      expect(store.state().title).toBe('Certified');
      expect(store.canUndo()).toBe(false);
    });

    it('applyTemplate clears decorations from previous design', () => {
      store.addDecoration({ type: 'star', x: 50, y: 50, size: 20, rotation: 0, color: '#fff' });
      expect(store.state().decorations).toHaveLength(1);

      store.applyTemplate({ shape: 'circle', title: 'New' });
      expect(store.state().decorations).toHaveLength(0);
      expect(store.state().shape).toBe('circle');
      expect(store.state().title).toBe('New');
    });
  });
});
