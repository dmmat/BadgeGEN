import { describe, it, expect } from 'vitest';
import { SHAPE_DEFS } from './shape-defs';

describe('SHAPE_DEFS', () => {
  const shapes = Object.keys(SHAPE_DEFS) as (keyof typeof SHAPE_DEFS)[];

  it('covers every advertised shape', () => {
    expect(shapes).toContain('circle');
    expect(shapes).toContain('shield');
    expect(shapes).toContain('shield-modern');
    expect(shapes.length).toBeGreaterThanOrEqual(15);
  });

  it('every shape has at least one gradient layer', () => {
    for (const shape of shapes) {
      const layers = SHAPE_DEFS[shape];
      const hasFill = layers.some(l => l.fill === 'gradient');
      expect(hasFill, `shape "${shape}" has no gradient layer`).toBe(true);
    }
  });

  it('layer kinds match their fields', () => {
    for (const shape of shapes) {
      for (const layer of SHAPE_DEFS[shape]) {
        if (layer.kind === 'circle') {
          expect(typeof layer.cx).toBe('number');
          expect(typeof layer.r).toBe('number');
        } else if (layer.kind === 'rect') {
          expect(typeof layer.width).toBe('number');
          expect(typeof layer.height).toBe('number');
        } else if (layer.kind === 'polygon') {
          expect(layer.points).toMatch(/[0-9]/);
        } else if (layer.kind === 'path') {
          expect(layer.d.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
