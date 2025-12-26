import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BadgeStore } from '../services/badge.store';
import { BadgeDesign } from '../services/badge-types';

@Component({
  selector: 'app-badge-main-controls',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-4">
      <div>
        <p class="text-[11px] uppercase tracking-wide text-gray-400">Layout & Styling</p>
      </div>

      <!-- Shape Selection -->
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-2">Shape</label>
        <div class="grid grid-cols-5 gap-2">
          @for (shape of shapes; track shape) {
            <button 
              (click)="updateShape(shape)"
              class="aspect-square rounded-lg border-2 flex items-center justify-center hover:bg-gray-50 transition-all text-gray-600"
              [class.border-blue-500]="store.badge().shape === shape"
              [class.bg-blue-50]="store.badge().shape === shape"
              [class.text-blue-600]="store.badge().shape === shape"
              [class.border-gray-200]="store.badge().shape !== shape"
              [title]="shape"
            >
              @if(shape === 'circle') { <div class="w-8 h-8 rounded-full bg-current"></div> }
              @if(shape === 'shield') { <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/></svg> }
              @if(shape === 'hexagon') { <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M21 16.5l-9 5.25l-9-5.25v-9l9-5.25l9 5.25v9z"/></svg> }
              @if(shape === 'star') { <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> }
              @if(shape === 'ribbon') { <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M4 2h16v14l-8-3l-8 3z"/></svg> }
              @if(shape === 'diamond') { <div class="w-8 h-8 bg-current rotate-45 transform scale-75"></div> }
              @if(shape === 'octagon') { <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2z"/></svg> }
              @if(shape === 'award') { <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="7"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/></svg> }
              @if(shape === 'plaque') { <div class="w-5 h-3.5 bg-current rounded-sm"></div> }
              @if(shape === 'gem') { <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2l-3.5 6L12 22l9.5-14L18 2H6z"/></svg> }
              @if(shape === 'leaf-1') { <div class="w-8 h-8 bg-current rounded-tl-lg rounded-br-lg"></div> }
              @if(shape === 'leaf-2') { <div class="w-8 h-8 bg-current rounded-tr-lg rounded-bl-lg"></div> }
              @if(shape === 'seal') { <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 2.4 3.4-1.2 1.2 3.4 3.4 1.2-1.2 3.4 1.2 3.4-3.4 1.2-1.2 3.4-3.4-1.2-2.4 2.4-2.4-2.4-3.4 1.2-1.2-3.4-3.4-1.2 1.2-3.4-1.2-3.4 3.4-1.2 1.2-3.4 3.4-1.2L12 2z"/></svg> }
              @if(shape === 'banner') { <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M5 2h14v16l-7 4-7-4V2z"/></svg> }
              @if(shape === 'shield-modern') { <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4h14l-2 10-5 6-5-6-2-10z"/></svg> }
            </button>
          }
        </div>
        <div class="mt-3 space-y-1">
          <label class="text-xs text-gray-500">Size: {{store.badge().shapeScale || 100}}%</label>
          <input type="range" min="70" max="130" 
            [ngModel]="store.badge().shapeScale || 100" 
            (ngModelChange)="store.update({shapeScale: +$event})"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          >
        </div>
      </div>

      <!-- Theme Colors & Gradients -->
      <div class="space-y-3 pt-2">
        <label class="block text-xs font-medium text-gray-500">Theme & Gradient</label>
        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          @for (preset of gradientPresets; track preset.name) {
            <button (click)="applyGradientPreset(preset)" 
              class="w-8 h-8 rounded-full border border-gray-200 flex-shrink-0"
              [style.background]="'linear-gradient(135deg, ' + preset.primary + ', ' + preset.secondary + ')'"
              [title]="preset.name"
            ></button>
          }
        </div>

        <div class="grid grid-cols-2 gap-2">
          <select 
            [ngModel]="store.badge().gradientType" 
            (ngModelChange)="store.update({gradientType: $event})"
            class="w-full text-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 px-2 py-1 bg-white text-gray-900"
          >
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
          </select>
          <input type="number" 
            [ngModel]="store.badge().gradientAngle" 
            (ngModelChange)="store.update({gradientAngle: $event})"
            [disabled]="store.badge().gradientType === 'radial'"
            placeholder="Angle"
            class="w-full text-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 px-2 py-1 bg-white text-gray-900"
          >
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div class="flex flex-col gap-1">
            <input type="color" [ngModel]="store.badge().primaryColor" (ngModelChange)="store.update({primaryColor: $event})" class="h-8 w-full rounded cursor-pointer border border-gray-200 p-0 bg-white">
            <span class="text-[10px] text-gray-500 text-center">Start</span>
          </div>
          <div class="flex flex-col gap-1">
            <input type="color" [ngModel]="store.badge().secondaryColor" (ngModelChange)="store.update({secondaryColor: $event})" class="h-8 w-full rounded cursor-pointer border border-gray-200 p-0 bg-white">
            <span class="text-[10px] text-gray-500 text-center">End</span>
          </div>
          <div class="flex flex-col gap-1">
            <input type="color" [ngModel]="store.badge().textColor" (ngModelChange)="store.update({textColor: $event})" class="h-8 w-full rounded cursor-pointer border border-gray-200 p-0 bg-white">
            <span class="text-[10px] text-gray-500 text-center">Text</span>
          </div>
        </div>
      </div>

      <!-- Border & Shadow -->
      <div class="space-y-3 pt-3 border-t border-gray-100">
        <label class="block text-xs font-medium text-gray-500">Border & Shadow</label>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="text-xs text-gray-500">Width: {{store.badge().borderWidth}}px</label>
            <input type="range" min="0" max="15" [ngModel]="store.badge().borderWidth" (ngModelChange)="store.update({borderWidth: +$event})" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-gray-500">Color</label>
            <input type="color" [ngModel]="store.badge().borderColor" (ngModelChange)="store.update({borderColor: $event})" class="h-8 w-full rounded cursor-pointer border border-gray-200 p-0 bg-white">
          </div>
        </div>
        <div class="flex items-center gap-2">
          <input type="checkbox" id="shadowToggle" class="h-8 w-8 rounded border-gray-300 text-blue-600 focus:ring-blue-500" [ngModel]="store.badge().hasShadow" (ngModelChange)="store.update({hasShadow: $event})">
          <label for="shadowToggle" class="text-xs font-medium text-gray-700">Enable Badge Shadow</label>
        </div>
      </div>

    </div>
  `
})
export class BadgeMainControlsComponent {
  store = inject(BadgeStore);

  shapes: BadgeDesign['shape'][] = [
    'circle', 'shield', 'hexagon', 'star', 'ribbon', 
    'diamond', 'octagon', 'award', 'plaque', 'gem',
    'leaf-1', 'leaf-2', 'seal', 'banner', 'shield-modern'
  ];

  gradientPresets = [
    { name: 'Ocean', primary: '#2563eb', secondary: '#06b6d4' },
    { name: 'Sunset', primary: '#f97316', secondary: '#db2777' },
    { name: 'Forest', primary: '#166534', secondary: '#84cc16' },
    { name: 'Gold', primary: '#d97706', secondary: '#fbbf24' },
    { name: 'Metal', primary: '#94a3b8', secondary: '#f8fafc' },
    { name: 'Midnight', primary: '#0f172a', secondary: '#3b82f6' },
    { name: 'Fire', primary: '#dc2626', secondary: '#f59e0b' },
    { name: 'Ice', primary: '#3b82f6', secondary: '#e0f2fe' },
    { name: 'Lavender', primary: '#8b5cf6', secondary: '#ec4899' },
    { name: 'Purchase', primary: '#10b981', secondary: '#14b8a6' }
  ];

  updateShape(shape: BadgeDesign['shape']) {
    this.store.update({ shape });
  }

  applyGradientPreset(preset: { primary: string, secondary: string }) {
    this.store.update({
      primaryColor: preset.primary,
      secondaryColor: preset.secondary
    });
  }
}
