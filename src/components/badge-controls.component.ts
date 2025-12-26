import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BadgeStore } from '../services/badge.store';
import { BadgeDesign, Decoration, DecorationType } from '../services/gemini.service';

@Component({
  selector: 'app-badge-controls',
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      
      <div class="space-y-4">
        <!-- Tabs for Config / Decorations -->
        <div class="flex border-b border-gray-200">
           <button (click)="activeTab = 'config'" [class]="activeTab === 'config' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'" class="flex-1 py-2 text-xs font-bold uppercase tracking-wider border-b-2">Configuration</button>
           <button (click)="activeTab = 'decorations'" [class]="activeTab === 'decorations' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'" class="flex-1 py-2 text-xs font-bold uppercase tracking-wider border-b-2">Decorations</button>
        </div>
        
        @if (activeTab === 'config') {
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
                  <!-- Simple Shape Icons -->
                  @if(shape === 'circle') { <div class="w-4 h-4 rounded-full bg-current"></div> }
                  @if(shape === 'shield') { <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/></svg> }
                  @if(shape === 'hexagon') { <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 16.5l-9 5.25l-9-5.25v-9l9-5.25l9 5.25v9z"/></svg> }
                  @if(shape === 'star') { <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> }
                  @if(shape === 'ribbon') { <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 2h16v14l-8-3l-8 3z"/></svg> }
                  @if(shape === 'diamond') { <div class="w-4 h-4 bg-current rotate-45 transform scale-75"></div> }
                  @if(shape === 'octagon') { <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2z"/></svg> }
                  @if(shape === 'award') { <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="7"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/></svg> }
                  @if(shape === 'plaque') { <div class="w-5 h-3.5 bg-current rounded-sm"></div> }
                  @if(shape === 'gem') { <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2l-3.5 6L12 22l9.5-14L18 2H6z"/></svg> }
                  @if(shape === 'leaf-1') { <div class="w-4 h-4 bg-current rounded-tl-lg rounded-br-lg"></div> }
                  @if(shape === 'leaf-2') { <div class="w-4 h-4 bg-current rounded-tr-lg rounded-bl-lg"></div> }
                  @if(shape === 'seal') { <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 2.4 3.4-1.2 1.2 3.4 3.4 1.2-1.2 3.4 1.2 3.4-3.4 1.2-1.2 3.4-3.4-1.2-2.4 2.4-2.4-2.4-3.4 1.2-1.2-3.4-3.4-1.2 1.2-3.4-1.2-3.4 3.4-1.2 1.2-3.4 3.4-1.2L12 2z"/></svg> }
                  @if(shape === 'banner') { <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 2h14v16l-7 4-7-4V2z"/></svg> }
                  @if(shape === 'shield-modern') { <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4h14l-2 10-5 6-5-6-2-10z"/></svg> }
                </button>
              }
            </div>
          </div>

          <!-- Theme Colors & Gradients -->
          <div class="space-y-3 pt-2">
              <label class="block text-xs font-medium text-gray-500">Theme & Gradient</label>
              
              <!-- Gradient Presets -->
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
                 <!-- Gradient Type -->
                 <select 
                   [ngModel]="store.badge().gradientType" 
                   (ngModelChange)="store.update({gradientType: $event})"
                   class="w-full text-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 px-2 py-1 bg-white text-gray-900"
                 >
                    <option value="linear">Linear</option>
                    <option value="radial">Radial</option>
                 </select>

                 <!-- Angle (Only for linear) -->
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

          <!-- Font Selection -->
           <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
             <label class="block text-xs font-medium text-gray-500 mb-1">Font Family</label>
             <select 
               [ngModel]="store.badge().font" 
               (ngModelChange)="store.update({font: $event})"
               class="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 px-2 py-1 bg-white text-gray-900"
             >
                <option value="Inter">Inter (Modern)</option>
                <option value="Roboto Slab">Roboto Slab (Serif)</option>
                <option value="Playfair Display">Playfair Display (Elegant)</option>
                <option value="Oswald">Oswald (Bold Condensed)</option>
                <option value="Cinzel">Cinzel (Classic)</option>
                <option value="Montserrat">Montserrat (Geometric)</option>
             </select>
           </div>

          <!-- Text Inputs & Sizers -->
          <div class="space-y-4">
            
            <!-- Title Control -->
            <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
               <div class="flex justify-between items-center mb-1">
                 <label class="text-xs font-medium text-gray-500">Title</label>
                 <input type="range" min="10" max="40" 
                   [ngModel]="store.badge().titleSettings?.size || 18" 
                   (ngModelChange)="updateSize('title', $event)"
                   class="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                 >
               </div>
               <input type="text" 
                  [ngModel]="store.badge().title" (ngModelChange)="store.update({title: $event})"
                  class="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 px-2 py-1 bg-white text-gray-900"
               >
            </div>

            <!-- Subtitle Control -->
            <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
               <div class="flex justify-between items-center mb-1">
                 <label class="text-xs font-medium text-gray-500">Subtitle</label>
                 <input type="range" min="8" max="30" 
                   [ngModel]="store.badge().subtitleSettings?.size || 12" 
                   (ngModelChange)="updateSize('subtitle', $event)"
                   class="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                 >
               </div>
               <input type="text" 
                  [ngModel]="store.badge().subtitle" (ngModelChange)="store.update({subtitle: $event})"
                  class="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 px-2 py-1 bg-white text-gray-900"
               >
            </div>

            <!-- Accent Control -->
             <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
               <div class="flex justify-between items-center mb-1">
                 <label class="text-xs font-medium text-gray-500">Accent / Year</label>
                 <input type="range" min="8" max="30" 
                   [ngModel]="store.badge().accentSettings?.size || 10" 
                   (ngModelChange)="updateSize('accent', $event)"
                   class="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                 >
               </div>
               <input type="text" 
                  [ngModel]="store.badge().accentText" (ngModelChange)="store.update({accentText: $event})"
                  class="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 px-2 py-1 bg-white text-gray-900"
               >
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
                 <button (click)="addExtraText()" class="text-xs text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1">
                   + Add Text
                 </button>
               </div>
               
               <div class="space-y-2">
                  @for (txt of store.badge().extraTexts; track txt.id) {
                     <div class="bg-gray-50 p-2 rounded border border-gray-200 space-y-2">
                        <div class="flex gap-2">
                           <input type="text" [ngModel]="txt.text" (ngModelChange)="store.updateExtraText(txt.id, {text: $event})" class="flex-1 text-xs rounded border-gray-300 bg-white text-gray-900 px-1 py-0.5">
                           <button (click)="store.removeExtraText(txt.id)" class="text-red-500">×</button>
                        </div>
                        <div class="flex gap-2 items-center">
                           <input type="color" [ngModel]="txt.color" (ngModelChange)="store.updateExtraText(txt.id, {color: $event})" class="w-4 h-4 p-0 border-0 rounded bg-white cursor-pointer">
                           <input type="range" min="8" max="40" [value]="txt.size" (input)="store.updateExtraText(txt.id, {size: +$any($event.target).value})" class="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                           <button (click)="store.updateExtraText(txt.id, {weight: txt.weight === 'bold' ? 'normal' : 'bold'})" [class.font-bold]="txt.weight === 'bold'" class="text-xs w-5 h-5 flex items-center justify-center border rounded bg-white">B</button>
                        </div>
                     </div>
                  }
               </div>
            </div>
          </div>
        } @else {
          <!-- Decorations Tab -->
          <div class="space-y-4">
             <div class="grid grid-cols-3 gap-2">
                @for (deco of decorationTypes; track deco.label) {
                   <button (click)="addDecoration(deco.type)" class="p-2 border border-gray-200 rounded-lg hover:bg-blue-50 flex flex-col items-center gap-1 text-xs text-gray-600 transition-colors">
                     <div class="text-lg">{{ deco.icon }}</div>
                     <span class="text-[10px]">{{ deco.label }}</span>
                   </button>
                }
             </div>

             <!-- Upload Extra Decoration -->
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

             <!-- Layer List -->
             @if (store.badge().decorations.length > 0) {
               <div class="pt-2 border-t border-gray-100 space-y-2">
                 <h4 class="text-xs font-medium text-gray-500">Layers ({{store.badge().decorations.length}})</h4>
                 <div class="space-y-1 max-h-40 overflow-y-auto">
                    @for (deco of store.badge().decorations; track deco.id) {
                      <div class="flex items-center justify-between p-2 bg-white rounded border border-gray-200 text-xs">
                         <span class="capitalize">{{ deco.type }}</span>
                         <div class="flex items-center gap-2">
                            <input type="color" [ngModel]="deco.color || '#ffffff'" (ngModelChange)="store.updateDecoration(deco.id, {color: $event})" class="w-4 h-4 p-0 border-0 rounded cursor-pointer bg-white">
                            <input type="range" min="10" max="60" [value]="deco.size" (input)="store.updateDecoration(deco.id, {size: +$any($event.target).value})" class="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                            <button (click)="store.removeDecoration(deco.id)" class="text-red-500 hover:text-red-700">×</button>
                         </div>
                      </div>
                    }
                 </div>
               </div>
             }
          </div>
        }
      </div>
    </div>
  `
})
export class BadgeControlsComponent {
  store = inject(BadgeStore);
  
  activeTab: 'config' | 'decorations' = 'config';
  shapes: BadgeDesign['shape'][] = [
    'circle', 'shield', 'hexagon', 'star', 'ribbon', 
    'diamond', 'octagon', 'award', 'plaque', 'gem',
    'leaf-1', 'leaf-2', 'seal', 'banner', 'shield-modern'
  ];

  decorationTypes: {type: DecorationType, icon: string, label: string}[] = [
    { type: 'star', icon: '★', label: 'Star' },
    { type: 'heart', icon: '♥', label: 'Heart' },
    { type: 'crown', icon: '👑', label: 'Crown' },
    { type: 'ribbon-bow', icon: '🎀', label: 'Bow' },
    { type: 'laurel-wreath', icon: '🌿', label: 'Laurel' },
    { type: 'wing', icon: '🪽', label: 'Wing' },
    { type: 'sparkles', icon: '✨', label: 'Sparkles' },
    { type: 'trophy', icon: '🏆', label: 'Trophy' },
    { type: 'medal', icon: '🥇', label: 'Medal' },
    { type: 'check-mark', icon: '✓', label: 'Check' },
  ];

  gradientPresets = [
    { name: 'Ocean', primary: '#2563eb', secondary: '#06b6d4' },
    { name: 'Sunset', primary: '#f97316', secondary: '#db2777' },
    { name: 'Forest', primary: '#166534', secondary: '#84cc16' },
    { name: 'Royal', primary: '#eab308', secondary: '#991b1b' },
    { name: 'Metal', primary: '#94a3b8', secondary: '#f8fafc' },
    { name: 'Midnight', primary: '#0f172a', secondary: '#3b82f6' },
  ];

  applyGradientPreset(preset: { primary: string, secondary: string }) {
    this.store.update({
      primaryColor: preset.primary,
      secondaryColor: preset.secondary
    });
  }

  updateShape(shape: BadgeDesign['shape']) {
    this.store.update({ shape });
  }

  updateSize(element: 'title' | 'subtitle' | 'accent' | 'icon', size: number) {
    this.store.updateElement(element, { size: Number(size) });
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

  // Decorations
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

  // Extra Text
  addExtraText() {
    this.store.addExtraText({
      text: 'New Text',
      x: 100,
      y: 100,
      size: 14,
      color: '#ffffff',
      weight: 'bold',
      rotation: 0
    });
  }
}