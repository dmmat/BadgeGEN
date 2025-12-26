import { Component, input, ElementRef, viewChild, inject, signal, effect } from '@angular/core';
import { BadgeDesign, LayoutSettings } from '../services/badge-types';
import { BadgeStore } from '../services/badge.store';

type DraggableType = 'title' | 'subtitle' | 'accent' | 'icon' | 'decoration' | 'extraText';

interface DragState {
  type: DraggableType;
  id?: string; // For decorations/extraText
  startX: number;
  startY: number;
  elementStartX: number;
  elementStartY: number;
}

@Component({
  selector: 'app-badge-preview',
  template: `
    <div 
      class="relative w-full aspect-square max-w-[500px] mx-auto flex items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-gray-100"
      (mousemove)="onMouseMove($event)"
      (mouseup)="onMouseUp()"
      (mouseleave)="onMouseUp()"
    >
      <div #captureContainer class="w-full h-full flex items-center justify-center relative select-none">
        
        <!-- SVG Canvas -->
        <svg viewBox="0 0 200 200" class="w-full h-full drop-shadow-xl cursor-default" xmlns="http://www.w3.org/2000/svg">
          <defs>
            @if (design().gradientType === 'radial') {
              <radialGradient id="mainGradient" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
                <stop offset="0%" [attr.stop-color]="design().primaryColor" />
                <stop offset="100%" [attr.stop-color]="design().secondaryColor" />
              </radialGradient>
            } @else {
               <linearGradient id="mainGradient" x1="0%" y1="0%" x2="0%" y2="100%" [attr.gradientTransform]="'rotate(' + (design().gradientAngle || 0) + ', 0.5, 0.5)'">
                <stop offset="0%" [attr.stop-color]="design().primaryColor" />
                <stop offset="100%" [attr.stop-color]="design().secondaryColor" />
              </linearGradient>
            }
            
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
            </filter>
            
            <!-- Font Style for Export -->
            <style>
               /* Dynamic font class injection */
               .badge-text { font-family: '{{design().font}}', sans-serif; }
            </style>
          </defs>
          
          <g [attr.filter]="design().hasShadow ? 'url(#shadow)' : 'none'">
            <!-- Shapes -->
            @switch (design().shape) {
              @case ('circle') {
                <circle cx="100" cy="100" r="90" fill="url(#mainGradient)" [attr.stroke]="design().borderColor" [attr.stroke-width]="design().borderWidth" />
                <circle cx="100" cy="100" r="80" fill="none" [attr.stroke]="design().borderColor" stroke-width="1" opacity="0.5" stroke-dasharray="4 2" />
              }
              @case ('shield') {
                <path d="M100 10 L180 50 V110 C180 155 145 185 100 195 C55 185 20 155 20 110 V50 L100 10 Z" fill="url(#mainGradient)" [attr.stroke]="design().borderColor" [attr.stroke-width]="design().borderWidth" />
                <path d="M100 20 L170 55 V105 C170 145 140 170 100 180 C60 170 30 145 30 105 V55 L100 20 Z" fill="none" [attr.stroke]="design().borderColor" stroke-width="1" opacity="0.3" />
              }
              @case ('hexagon') {
                <polygon points="100,10 190,55 190,145 100,190 10,145 10,55" fill="url(#mainGradient)" [attr.stroke]="design().borderColor" [attr.stroke-width]="design().borderWidth" />
                <polygon points="100,20 180,60 180,140 100,180 20,140 20,60" fill="none" [attr.stroke]="design().borderColor" stroke-width="1" opacity="0.4" />
              }
              @case ('star') {
                 <polygon points="100,10 123,75 190,78 138,115 155,180 100,145 45,180 62,115 10,78 77,75" fill="url(#mainGradient)" [attr.stroke]="design().borderColor" [attr.stroke-width]="design().borderWidth"/>
              }
              @case ('ribbon') {
                 <path d="M40 20 H160 V140 L100 110 L40 140 V20 Z" fill="url(#mainGradient)" [attr.stroke]="design().borderColor" [attr.stroke-width]="design().borderWidth"/>
                 <rect x="30" y="10" width="140" height="15" rx="5" [attr.fill]="design().secondaryColor" [attr.stroke]="design().borderColor" stroke-width="2"/>
              }
              @case ('diamond') {
                 <polygon points="100,10 190,100 100,190 10,100" fill="url(#mainGradient)" [attr.stroke]="design().borderColor" [attr.stroke-width]="design().borderWidth"/>
                 <polygon points="100,25 175,100 100,175 25,100" fill="none" [attr.stroke]="design().borderColor" stroke-width="1" opacity="0.4"/>
              }
              @case ('octagon') {
                 <polygon points="60,10 140,10 190,60 190,140 140,190 60,190 10,140 10,60" fill="url(#mainGradient)" [attr.stroke]="design().borderColor" [attr.stroke-width]="design().borderWidth"/>
                 <polygon points="65,20 135,20 180,65 180,135 135,180 65,180 20,135 20,65" fill="none" [attr.stroke]="design().borderColor" stroke-width="1" opacity="0.4"/>
              }
              @case ('award') {
                 <!-- Ribbons behind -->
                 <path d="M70 150 L50 190 L85 180 L100 195 L115 180 L150 190 L130 150" [attr.fill]="design().secondaryColor" [attr.stroke]="design().borderColor" stroke-width="2"/>
                 <!-- Main Circle -->
                 <circle cx="100" cy="90" r="70" fill="url(#mainGradient)" [attr.stroke]="design().borderColor" [attr.stroke-width]="design().borderWidth"/>
                 <circle cx="100" cy="90" r="60" fill="none" [attr.stroke]="design().borderColor" stroke-width="1" stroke-dasharray="2 2" opacity="0.6"/>
              }
              @case ('plaque') {
                 <rect x="20" y="30" width="160" height="140" rx="10" fill="url(#mainGradient)" [attr.stroke]="design().borderColor" [attr.stroke-width]="design().borderWidth"/>
                 <rect x="30" y="40" width="140" height="120" rx="5" fill="none" [attr.stroke]="design().borderColor" stroke-width="1" opacity="0.4"/>
              }
              @case ('gem') {
                 <path d="M50 30 L150 30 L190 80 L100 180 L10 80 Z" fill="url(#mainGradient)" [attr.stroke]="design().borderColor" [attr.stroke-width]="design().borderWidth"/>
                 <path d="M50 30 L100 100 M150 30 L100 100 M190 80 L100 100 M10 80 L100 100 M100 180 L100 100" [attr.stroke]="design().borderColor" stroke-width="1" opacity="0.5"/>
              }
              @case ('leaf-1') {
                 <path d="M 30 90 Q 30 30 90 30 L 170 30 L 170 110 Q 170 170 110 170 L 30 170 Z" fill="url(#mainGradient)" [attr.stroke]="design().borderColor" [attr.stroke-width]="design().borderWidth"/>
                 <path d="M 40 95 Q 40 40 95 40 L 160 40 L 160 105 Q 160 160 105 160 L 40 160 Z" fill="none" [attr.stroke]="design().borderColor" stroke-width="1" opacity="0.4"/>
              }
              @case ('leaf-2') {
                 <path d="M 30 30 L 110 30 Q 170 30 170 90 L 170 170 L 90 170 Q 30 170 30 110 Z" fill="url(#mainGradient)" [attr.stroke]="design().borderColor" [attr.stroke-width]="design().borderWidth"/>
                 <path d="M 40 40 L 105 40 Q 160 40 160 95 L 160 160 L 95 160 Q 40 160 40 105 Z" fill="none" [attr.stroke]="design().borderColor" stroke-width="1" opacity="0.4"/>
              }
              @case ('seal') {
                 <path d="M100 10 L115 15 L122 25 L135 35 L145 50 L155 65 L165 80 L160 95 L165 110 L155 125 L145 140 L135 155 L122 165 L115 175 L100 180 L85 175 L78 165 L65 155 L55 140 L45 125 L35 110 L40 95 L35 80 L45 65 L55 50 L65 35 L78 25 L85 15 Z" fill="url(#mainGradient)" [attr.stroke]="design().borderColor" [attr.stroke-width]="design().borderWidth"/>
                 <circle cx="100" cy="95" r="70" fill="none" [attr.stroke]="design().borderColor" stroke-width="1" stroke-dasharray="3 3" opacity="0.5"/>
              }
              @case ('banner') {
                 <path d="M 30 10 H 170 V 150 L 100 190 L 30 150 Z" fill="url(#mainGradient)" [attr.stroke]="design().borderColor" [attr.stroke-width]="design().borderWidth"/>
                 <rect x="40" y="20" width="120" height="120" fill="none" [attr.stroke]="design().borderColor" stroke-width="1" opacity="0.3"/>
              }
              @case ('shield-modern') {
                 <path d="M 30 20 H 170 L 160 120 L 100 190 L 40 120 Z" fill="url(#mainGradient)" [attr.stroke]="design().borderColor" [attr.stroke-width]="design().borderWidth"/>
                 <path d="M 45 30 H 155 L 148 110 L 100 170 L 52 110 Z" fill="none" [attr.stroke]="design().borderColor" stroke-width="1" opacity="0.4"/>
              }
            }
          </g>

          <!-- Decorations -->
          @for (deco of design().decorations; track deco.id) {
            <g 
              class="hover:cursor-move hover:opacity-80 decoration-item"
              (mousedown)="startDrag($event, 'decoration', deco.id)"
              [style.transform]="'translate(' + deco.x + 'px, ' + deco.y + 'px) rotate(' + (deco.rotation || 0) + 'deg) scale(' + (deco.size/20) + ')'"
            >
               @if (deco.type === 'image' && deco.customImage) {
                  <image 
                    [attr.href]="deco.customImage" 
                    x="-10" y="-10" width="20" height="20"
                  />
               } @else {
                  <!-- Inline paths -->
                  @if (deco.type === 'star') {
                    <polygon points="0,-10 2.2,-3.2 9.5,-3.2 3.6,1.1 5.9,7.8 0,3.6 -5.9,7.8 -3.6,1.1 -9.5,-3.2 -2.2,-3.2" [attr.fill]="deco.color || 'white'"/>
                  }
                  @if (deco.type === 'heart') {
                    <path d="M0,8 C-5,8 -10,3 -10,-3 C-10,-9 -5,-12 0,-5 C5,-12 10,-9 10,-3 C10,3 5,8 0,8 Z" [attr.fill]="deco.color || 'white'"/>
                  }
                  @if (deco.type === 'crown') {
                    <path d="M-10,5 L-10,-5 L-6,-2 L0,-8 L6,-2 L10,-5 L10,5 Z" [attr.fill]="deco.color || 'white'"/>
                  }
                  @if (deco.type === 'laurel-wreath') {
                    <path d="M-20,10 Q-25,0 -20,-10 Q-15,-15 -10,-10" fill="none" [attr.stroke]="deco.color || 'white'" stroke-width="2"/>
                    <path d="M20,10 Q25,0 20,-10 Q15,-15 10,-10" fill="none" [attr.stroke]="deco.color || 'white'" stroke-width="2"/>
                  }
                  @if (deco.type === 'ribbon-bow') {
                    <path d="M0,0 C-5,-5 -10,5 -10,-5 C-10,-10 -5,-10 0,-2 C5,-10 10,-10 10,-5 C10,5 5,-5 0,0 L-3,10 L0,8 L3,10 Z" [attr.fill]="deco.color || 'white'"/>
                  }
                  @if (deco.type === 'wing') {
                    <path d="M0,0 Q10,-10 20,-5 Q25,0 15,5 Q10,2 0,0" [attr.fill]="deco.color || 'white'"/>
                  }
                  @if (deco.type === 'sparkles') {
                    <path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z" [attr.fill]="deco.color || 'white'"/>
                  }
                  @if (deco.type === 'trophy') {
                    <path d="M-8 -8 H8 L6 4 H-6 Z M-4 4 V8 H4 V4 M-5 10 H5" [attr.fill]="deco.color || 'white'"/>
                  }
                  @if (deco.type === 'medal') {
                    <circle r="6" cy="2" [attr.fill]="deco.color || 'white'"/>
                    <path d="M-4 -8 L-4 -2 L4 -2 L4 -8" fill="none" [attr.stroke]="deco.color || 'white'" stroke-width="2"/>
                  }
                  @if (deco.type === 'check-mark') {
                     <path d="M-8 0 L-2 6 L8 -6" fill="none" [attr.stroke]="deco.color || 'white'" stroke-width="3" stroke-linecap="round"/>
                  }
               }
            </g>
          }

          <!-- Interactive Elements -->
          <!-- Icon / Logo -->
          <g 
            class="hover:cursor-move hover:opacity-80 transition-opacity"
            (mousedown)="startDrag($event, 'icon')"
            [style.transform]="'translate(' + (design().iconSettings?.x || 100) + 'px, ' + (design().iconSettings?.y || 85) + 'px)'"
          >
            @if (design().customLogo) {
              <image 
                [attr.href]="design().customLogo" 
                [attr.width]="design().iconSettings?.size || 40" 
                [attr.height]="design().iconSettings?.size || 40"
                [attr.x]="-(design().iconSettings?.size || 40)/2"
                [attr.y]="-(design().iconSettings?.size || 40)/2"
              />
            } @else {
              <text 
                text-anchor="middle" 
                alignment-baseline="middle"
                [attr.font-size]="design().iconSettings?.size || 40" 
                filter="url(#shadow)"
                style="pointer-events: none;"
              >
                {{ design().emoji }}
              </text>
            }
          </g>

          <!-- Title -->
          <text 
            [attr.x]="design().titleSettings?.x || 100" 
            [attr.y]="design().titleSettings?.y || 120" 
            [attr.font-size]="design().titleSettings?.size || 18"
            text-anchor="middle" 
            [style.font-family]="design().font"
            [attr.font-weight]="design().titleSettings?.fontWeight || 'bold'" 
            [attr.font-style]="design().titleSettings?.fontStyle || 'normal'" 
            [attr.fill]="design().textColor" 
            [attr.filter]="design().titleSettings?.hasShadow ? 'url(#shadow)' : 'none'"
            class="hover:cursor-move hover:fill-opacity-80 select-none badge-text"
            (mousedown)="startDrag($event, 'title')"
          >
            {{ design().title }}
          </text>

          <!-- Subtitle -->
          <text 
            [attr.x]="design().subtitleSettings?.x || 100" 
            [attr.y]="design().subtitleSettings?.y || 140" 
            [attr.font-size]="design().subtitleSettings?.size || 12"
            text-anchor="middle" 
            [style.font-family]="design().font"
            [attr.font-weight]="design().subtitleSettings?.fontWeight || 'normal'" 
            [attr.font-style]="design().subtitleSettings?.fontStyle || 'normal'" 
            [attr.fill]="design().textColor" 
            [attr.filter]="design().subtitleSettings?.hasShadow ? 'url(#shadow)' : 'none'"
            opacity="0.9"
            class="hover:cursor-move hover:fill-opacity-80 select-none badge-text"
            (mousedown)="startDrag($event, 'subtitle')"
          >
            {{ design().subtitle }}
          </text>
          
          <!-- Accent Text -->
          <text 
             [attr.x]="design().accentSettings?.x || 100"
             [attr.y]="design().accentSettings?.y || 165"
             [attr.font-size]="design().accentSettings?.size || 10"
             text-anchor="middle" 
             letter-spacing="2" 
             [style.font-family]="design().font"
             [attr.font-weight]="design().accentSettings?.fontWeight || 'bold'" 
             [attr.font-style]="design().accentSettings?.fontStyle || 'normal'"
             [attr.fill]="design().textColor"
             [attr.filter]="design().accentSettings?.hasShadow ? 'url(#shadow)' : 'none'"
             class="hover:cursor-move hover:fill-opacity-80 select-none badge-text"
             (mousedown)="startDrag($event, 'accent')"
          >
             {{ design().accentText }}
          </text>

          <!-- Extra Texts -->
          @for (txt of design().extraTexts; track txt.id) {
             <text 
               [attr.x]="txt.x" 
               [attr.y]="txt.y" 
               [attr.font-size]="txt.size"
               [attr.transform]="'rotate(' + txt.rotation + ', ' + txt.x + ', ' + txt.y + ')'"
               text-anchor="middle" 
               [style.font-family]="design().font"
               [attr.font-weight]="txt.fontWeight"
               [attr.font-style]="txt.fontStyle"
               [attr.fill]="txt.color" 
               [attr.filter]="txt.hasShadow ? 'url(#shadow)' : 'none'"
               class="hover:cursor-move hover:fill-opacity-80 select-none badge-text"
               (mousedown)="startDrag($event, 'extraText', txt.id)"
             >
               {{ txt.text }}
             </text>
          }
          
          <!-- Snapping Guides -->
          @if (isDragging()) {
             <line x1="100" y1="0" x2="100" y2="200" stroke="#3B82F6" stroke-width="0.5" stroke-dasharray="4 2" 
                [class.opacity-0]="!snappedX()" [class.opacity-100]="snappedX()" />
             <line x1="0" y1="100" x2="200" y2="100" stroke="#3B82F6" stroke-width="0.5" stroke-dasharray="4 2"
                [class.opacity-0]="!snappedY()" [class.opacity-100]="snappedY()" />
          }
        </svg>
      </div>

      <!-- Export Actions Overlay -->
      <div class="absolute bottom-4 right-4 flex gap-2">
        <button (click)="downloadPng()" class="bg-gray-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-lg flex items-center gap-1">
           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
           PNG
        </button>
      </div>
    </div>
  `,
  standalone: true
})
export class BadgePreviewComponent {
  store = inject(BadgeStore);
  design = this.store.badge;
  captureContainer = viewChild<ElementRef>('captureContainer');

  // Dragging State
  private dragState: DragState | null = null;
  isDragging = signal(false);
  snappedX = signal(false);
  snappedY = signal(false);

  startDrag(event: MouseEvent, type: DraggableType, id?: string) {
    event.preventDefault();
    event.stopPropagation();
    
    // Initial Position Lookup
    let startX = 0;
    let startY = 0;

    if (type === 'decoration' && id) {
      const deco = this.design().decorations.find(d => d.id === id);
      if (deco) {
        startX = deco.x;
        startY = deco.y;
      }
    } else if (type === 'extraText' && id) {
      const txt = this.design().extraTexts.find(t => t.id === id);
      if (txt) {
        startX = txt.x;
        startY = txt.y;
      }
    } else if (type !== 'decoration' && type !== 'extraText') {
      const settings = this.design()[`${type}Settings` as const];
      if (settings) {
        startX = settings.x;
        startY = settings.y;
      }
    }

    this.dragState = {
      type,
      id,
      startX: event.clientX,
      startY: event.clientY,
      elementStartX: startX,
      elementStartY: startY
    };
    this.isDragging.set(true);
  }

  onMouseMove(event: MouseEvent) {
    if (!this.dragState) return;
    
    const svgRect = this.captureContainer()?.nativeElement.getBoundingClientRect();
    if (!svgRect) return;
    
    const scaleFactor = 200 / svgRect.width;
    const dx = (event.clientX - this.dragState.startX) * scaleFactor;
    const dy = (event.clientY - this.dragState.startY) * scaleFactor;
    
    let newX = this.dragState.elementStartX + dx;
    let newY = this.dragState.elementStartY + dy;

    // Snapping Logic
    const SNAP_THRESHOLD = 3;
    const CENTER = 100;
    
    if (Math.abs(newX - CENTER) < SNAP_THRESHOLD) {
      newX = CENTER;
      this.snappedX.set(true);
    } else {
      this.snappedX.set(false);
    }

    if (Math.abs(newY - CENTER) < SNAP_THRESHOLD) {
      newY = CENTER;
      this.snappedY.set(true);
    } else {
      this.snappedY.set(false);
    }

    // Update Store
    if (this.dragState.type === 'decoration' && this.dragState.id) {
       this.store.updateDecoration(this.dragState.id, { x: newX, y: newY });
    } else if (this.dragState.type === 'extraText' && this.dragState.id) {
       this.store.updateExtraText(this.dragState.id, { x: newX, y: newY });
    } else if (this.dragState.type !== 'decoration' && this.dragState.type !== 'extraText') {
       this.store.updateElement(this.dragState.type as any, { x: newX, y: newY });
    }
  }

  onMouseUp() {
    this.dragState = null;
    this.isDragging.set(false);
    this.snappedX.set(false);
    this.snappedY.set(false);
  }

  async downloadPng() {
    const svgElement = this.captureContainer()?.nativeElement.querySelector('svg');
    if (!svgElement) return;

    // Clone to manipulate for export without affecting view
    const svgClone = svgElement.cloneNode(true) as SVGElement;
    
    // Attempt to inline font for better export (Basic Google Fonts support)
    const fontName = this.design().font;
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;700&display=swap`;
    
    try {
        const response = await fetch(fontUrl);
        const css = await response.text();
        const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
        style.textContent = `@import url('${fontUrl}');`;
        svgClone.prepend(style);
    } catch(e) {
        console.warn('Font export optimization failed, falling back', e);
    }

    const svgData = new XMLSerializer().serializeToString(svgClone);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 1000;
    canvas.height = 1000;

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 1000, 1000);
      const pngUrl = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `badge-${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }
}