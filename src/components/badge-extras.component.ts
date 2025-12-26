import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BadgeStore } from '../services/badge.store';
import { DecorationType } from '../services/badge-types';

@Component({
  selector: 'app-badge-extras',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-4">
      <div>
        <p class="text-[11px] uppercase tracking-wide text-gray-400">Typography & Extras</p>
      </div>

      <!-- Font Selection -->
      <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
        <label class="block text-xs font-medium text-gray-500 mb-1">Font Family</label>
        <select 
          [ngModel]="store.badge().font" 
          (ngModelChange)="store.update({font: $event})"
          class="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 px-2 py-1 bg-white text-gray-900"
        >
          <option value="Inter">Inter</option>
          <option value="Roboto">Roboto</option>
          <option value="Roboto Slab">Roboto Slab</option>
          <option value="Open Sans">Open Sans</option>
          <option value="Lato">Lato</option>
          <option value="Montserrat">Montserrat</option>
          <option value="Poppins">Poppins</option>
          <option value="Nunito">Nunito</option>
          <option value="Quicksand">Quicksand</option>
          <option value="Raleway">Raleway</option>
          <option value="Rubik">Rubik</option>
          <option value="Kanit">Kanit</option>
          <option value="Fira Sans">Fira Sans</option>
          <option value="Source Sans Pro">Source Sans Pro</option>
          <option value="Playfair Display">Playfair Display</option>
          <option value="Merriweather">Merriweather</option>
          <option value="Lora">Lora</option>
          <option value="Arvo">Arvo</option>
          <option value="Bebas Neue">Bebas Neue</option>
          <option value="Cinzel">Cinzel</option>
          <option value="Abril Fatface">Abril Fatface</option>
          <option value="Josefin Sans">Josefin Sans</option>
          <option value="Varela Round">Varela Round</option>
          <option value="PT Sans">PT Sans</option>
          <option value="PT Serif">PT Serif</option>
          <option value="Cabin">Cabin</option>
          <option value="Noto Sans">Noto Sans</option>
          <option value="Comfortaa">Comfortaa</option>
          <option value="Alfa Slab One">Alfa Slab One</option>
          <option value="Open Sans Condensed">Open Sans Condensed</option>
        </select>
      </div>

      <!-- Text Inputs & Sizers -->
      <div class="space-y-4">
        <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div class="flex justify-between items-center mb-1">
            <label class="text-xs font-medium text-gray-500">Title</label>
            <div class="flex items-center gap-1">
              <button (click)="toggleStyle('title', 'fontWeight')" class="w-5 h-5 text-xs rounded border bg-white flex items-center justify-center" [class.bg-blue-100]="store.badge().titleSettings?.fontWeight === 'bold'" [class.text-blue-600]="store.badge().titleSettings?.fontWeight === 'bold'" [class.border-blue-200]="store.badge().titleSettings?.fontWeight === 'bold'"><b>B</b></button>
              <button (click)="toggleStyle('title', 'fontStyle')" class="w-5 h-5 text-xs rounded border bg-white flex items-center justify-center" [class.bg-blue-100]="store.badge().titleSettings?.fontStyle === 'italic'" [class.text-blue-600]="store.badge().titleSettings?.fontStyle === 'italic'" [class.border-blue-200]="store.badge().titleSettings?.fontStyle === 'italic'"><i>I</i></button>
              <button (click)="toggleShadow('title')" class="w-5 h-5 text-xs rounded border bg-white flex items-center justify-center" [class.bg-blue-100]="store.badge().titleSettings?.hasShadow" [class.text-blue-600]="store.badge().titleSettings?.hasShadow" [class.border-blue-200]="store.badge().titleSettings?.hasShadow"><b>S</b></button>
              <input type="range" min="10" max="40" 
                [ngModel]="store.badge().titleSettings?.size || 18" 
                (ngModelChange)="updateSize('title', $event)"
                class="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              >
            </div>
          </div>
          <input type="text" 
            [ngModel]="store.badge().title" (ngModelChange)="store.update({title: $event})"
            class="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 px-2 py-1 bg-white text-gray-900"
          >
        </div>

        <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div class="flex justify-between items-center mb-1">
            <label class="text-xs font-medium text-gray-500">Subtitle</label>
            <div class="flex items-center gap-1">
              <button (click)="toggleStyle('subtitle', 'fontWeight')" class="w-5 h-5 text-xs rounded border bg-white flex items-center justify-center" [class.bg-blue-100]="store.badge().subtitleSettings?.fontWeight === 'bold'" [class.text-blue-600]="store.badge().subtitleSettings?.fontWeight === 'bold'" [class.border-blue-200]="store.badge().subtitleSettings?.fontWeight === 'bold'"><b>B</b></button>
              <button (click)="toggleStyle('subtitle', 'fontStyle')" class="w-5 h-5 text-xs rounded border bg-white flex items-center justify-center" [class.bg-blue-100]="store.badge().subtitleSettings?.fontStyle === 'italic'" [class.text-blue-600]="store.badge().subtitleSettings?.fontStyle === 'italic'" [class.border-blue-200]="store.badge().subtitleSettings?.fontStyle === 'italic'"><i>I</i></button>
              <button (click)="toggleShadow('subtitle')" class="w-5 h-5 text-xs rounded border bg-white flex items-center justify-center" [class.bg-blue-100]="store.badge().subtitleSettings?.hasShadow" [class.text-blue-600]="store.badge().subtitleSettings?.hasShadow" [class.border-blue-200]="store.badge().subtitleSettings?.hasShadow"><b>S</b></button>
              <input type="range" min="8" max="30" 
                [ngModel]="store.badge().subtitleSettings?.size || 12" 
                (ngModelChange)="updateSize('subtitle', $event)"
                class="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              >
            </div>
          </div>
          <input type="text" 
            [ngModel]="store.badge().subtitle" (ngModelChange)="store.update({subtitle: $event})"
            class="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 px-2 py-1 bg-white text-gray-900"
          >
        </div>

        <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div class="flex justify-between items-center mb-1">
            <label class="text-xs font-medium text-gray-500">Accent / Year</label>
            <div class="flex items-center gap-1">
              <button (click)="toggleStyle('accent', 'fontWeight')" class="w-5 h-5 text-xs rounded border bg-white flex items-center justify-center" [class.bg-blue-100]="store.badge().accentSettings?.fontWeight === 'bold'" [class.text-blue-600]="store.badge().accentSettings?.fontWeight === 'bold'" [class.border-blue-200]="store.badge().accentSettings?.fontWeight === 'bold'"><b>B</b></button>
              <button (click)="toggleStyle('accent', 'fontStyle')" class="w-5 h-5 text-xs rounded border bg-white flex items-center justify-center" [class.bg-blue-100]="store.badge().accentSettings?.fontStyle === 'italic'" [class.text-blue-600]="store.badge().accentSettings?.fontStyle === 'italic'" [class.border-blue-200]="store.badge().accentSettings?.fontStyle === 'italic'"><i>I</i></button>
              <button (click)="toggleShadow('accent')" class="w-5 h-5 text-xs rounded border bg-white flex items-center justify-center" [class.bg-blue-100]="store.badge().accentSettings?.hasShadow" [class.text-blue-600]="store.badge().accentSettings?.hasShadow" [class.border-blue-200]="store.badge().accentSettings?.hasShadow"><b>S</b></button>
              <input type="range" min="8" max="30" 
                [ngModel]="store.badge().accentSettings?.size || 10" 
                (ngModelChange)="updateSize('accent', $event)"
                class="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              >
            </div>
          </div>
          <input type="text" 
            [ngModel]="store.badge().accentText" (ngModelChange)="store.update({accentText: $event})"
            class="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 px-2 py-1 bg-white text-gray-900"
          >
        </div>
      </div>

      <!-- Logo/Icon Control -->
      <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
        <div class="flex justify-between items-center mb-2">
          <label class="text-xs font-medium text-gray-500">Logo</label>
          <input type="range" min="20" max="100" 
            [ngModel]="store.badge().iconSettings?.size || 40" 
            (ngModelChange)="updateSize('icon', $event)"
            class="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          >
        </div>
        <div class="flex gap-2">
          <input type="text" 
            [ngModel]="store.badge().emoji" 
            (ngModelChange)="store.update({emoji: $event, customLogo: undefined})"
            placeholder="Emoji"
            class="flex-1 text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 px-2 py-1 bg-white text-gray-900"
          >
          <div class="relative">
            <input 
              type="file" 
              accept="image/*"
              (change)="uploadLogo($event)"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Upload Image/SVG"
            >
            <button class="bg-white border border-gray-300 rounded-md px-3 py-1 text-xs font-medium hover:bg-gray-50 text-gray-900">
              Upload
            </button>
          </div>
        </div>
      </div>

      <!-- Extra Text Controls -->
      <div class="pt-2 border-t border-gray-100 space-y-2">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-medium text-gray-500">Extra Texts</h4>
          <button (click)="addExtraText()" class="text-xs text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1">+ Add Text</button>
        </div>
        <div class="space-y-2">
          @for (txt of store.badge().extraTexts; track txt.id) {
            <div class="bg-gray-50 p-2 rounded border border-gray-200 space-y-2">
              <div class="flex gap-2">
                <input type="text" [ngModel]="txt.text" (ngModelChange)="store.updateExtraText(txt.id, {text: $event})" class="flex-1 text-xs rounded border-gray-300 bg-white text-gray-900 px-1 py-0.5">
                <button (click)="store.removeExtraText(txt.id)" class="text-red-500">×</button>
              </div>
              <div class="flex gap-2 items-center flex-wrap text-xs">
                <input type="color" [ngModel]="txt.color" (ngModelChange)="store.updateExtraText(txt.id, {color: $event})" class="w-5 h-5 p-0 border border-gray-200 rounded bg-white cursor-pointer">
                <input type="range" min="8" max="40" [value]="txt.size" (input)="store.updateExtraText(txt.id, {size: +$any($event.target).value})" class="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                <button (click)="store.updateExtraText(txt.id, {fontWeight: txt.fontWeight === 'bold' ? 'normal' : 'bold'})" [class.font-bold]="txt.fontWeight === 'bold'" class="text-xs w-5 h-5 flex items-center justify-center border rounded bg-white"><b>B</b></button>
                <button (click)="store.updateExtraText(txt.id, {fontStyle: txt.fontStyle === 'italic' ? 'normal' : 'italic'})" [class.italic]="txt.fontStyle === 'italic'" class="text-xs w-5 h-5 flex items-center justify-center border rounded bg-white"><i>I</i></button>
                <button (click)="store.updateExtraText(txt.id, {hasShadow: !txt.hasShadow})" class="text-xs w-5 h-5 flex items-center justify-center border rounded bg-white" [class.bg-blue-100]="txt.hasShadow" [class.text-blue-600]="txt.hasShadow" [class.border-blue-200]="txt.hasShadow"><b>S</b></button>
              </div>
            </div>
          }
          @if (store.badge().extraTexts.length === 0) {
            <p class="text-[11px] text-gray-400">No extra texts yet.</p>
          }
        </div>
      </div>

      <!-- Decorations Tab -->
      <div class="space-y-4 border-t border-gray-100 pt-3">
        <div class="grid grid-cols-3 gap-2">
          @for (deco of decorationTypes; track deco.label) {
            <button (click)="addDecoration(deco.type)" class="p-2 border border-gray-200 rounded-lg hover:bg-blue-50 flex flex-col items-center gap-1 text-xs text-gray-600 transition-colors">
              <div class="text-lg">{{ deco.icon }}</div>
              <span class="text-[10px]">{{ deco.label }}</span>
            </button>
          }
        </div>

        <div class="pt-2 border-t border-gray-100">
          <h4 class="text-xs font-medium text-gray-500 mb-2">Upload Layer</h4>
          <div class="flex items-center justify-center w-full">
            <label class="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div class="flex flex-col items-center justify-center pt-5 pb-6">
                <svg class="w-8 h-8 mb-2 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p class="text-xs text-gray-500">PNG, SVG</p>
              </div>
              <input type="file" class="hidden" accept="image/*" (change)="uploadDecoration($event)" />
            </label>
          </div> 
        </div>

        @if (store.badge().decorations.length > 0) {
          <div class="pt-2 border-t border-gray-100 space-y-2">
            <h4 class="text-xs font-medium text-gray-500">Layers ({{store.badge().decorations.length}})</h4>
            <div class="space-y-1 max-h-40 overflow-y-auto">
              @for (deco of store.badge().decorations; track deco.id) {
                <div class="flex items-center justify-between p-2 bg-white rounded border border-gray-200 text-xs">
                  <span class="capitalize">{{ deco.type }}</span>
                  <div class="flex items-center gap-2">
                    <input type="color" [ngModel]="deco.color || '#ffffff'" (ngModelChange)="store.updateDecoration(deco.id, {color: $event})" class="w-4 h-4 p-0 border-0 rounded cursor-pointer bg-white" aria-label="Decoration color">
                    <input type="range" min="10" max="60" [value]="deco.size" (input)="store.updateDecoration(deco.id, {size: +$any($event.target).value})" class="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                    <button (click)="store.removeDecoration(deco.id)" class="text-red-500 hover:text-red-700">×</button>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class BadgeExtrasComponent {
  store = inject(BadgeStore);

  decorationTypes: {type: DecorationType, icon: string, label: string}[] = [
    { type: 'star', icon: '★', label: 'Star' },
    { type: 'crown', icon: '👑', label: 'Crown' },
    { type: 'check-mark', icon: '✓', label: 'Check' },
  ];

  updateSize(element: 'title' | 'subtitle' | 'accent' | 'icon', size: number) {
    this.store.updateElement(element, { size: Number(size) });
  }

  toggleStyle(element: 'title' | 'subtitle' | 'accent', style: 'fontWeight' | 'fontStyle') {
    const key = `${element}Settings` as const;
    const settings = this.store.badge()[key];
    if (settings) {
      if (style === 'fontWeight') {
        this.store.updateElement(element, { fontWeight: settings.fontWeight === 'bold' ? 'normal' : 'bold' });
      } else {
        this.store.updateElement(element, { fontStyle: settings.fontStyle === 'italic' ? 'normal' : 'italic' });
      }
    }
  }

  toggleShadow(element: 'title' | 'subtitle' | 'accent') {
    const key = `${element}Settings` as const;
    const settings = this.store.badge()[key];
    if (settings) {
      this.store.updateElement(element, { hasShadow: !settings.hasShadow });
    }
  }

  uploadLogo(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        this.store.update({ customLogo: result });
      }
    };
    reader.readAsDataURL(file);
  }

  addExtraText() {
    this.store.addExtraText({
      text: 'New Text',
      x: 100,
      y: 100,
      size: 14,
      color: '#ffffff',
      rotation: 0,
      fontWeight: 'bold',
      fontStyle: 'normal',
      hasShadow: false
    });
  }

  addDecoration(type: DecorationType) {
    this.store.addDecoration({
      type,
      x: 100,
      y: 100,
      size: 20,
      rotation: 0,
      color: '#FFFFFF'
    });
  }

  uploadDecoration(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        this.store.addDecoration({
          type: 'image',
          x: 100,
          y: 100,
          size: 40,
          rotation: 0,
          customImage: result
        });
      }
    };
    reader.readAsDataURL(file);
  }
}
