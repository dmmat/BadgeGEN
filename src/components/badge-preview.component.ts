import { ChangeDetectionStrategy, Component, ElementRef, HostListener, viewChild, inject, signal, computed, effect } from '@angular/core';
import { BadgeStore } from '../services/badge.store';
import { ToastService } from '../services/toast.service';
import { SHAPE_DEFS, ShapeLayer, LayerStroke } from '../services/shape-defs';
import { CurveSettings, SealShape, Selection, StrokeStyle } from '../services/badge-types';

const VIEWBOX = 200;
const CENTER = 100;

type DraggableType = 'title' | 'subtitle' | 'accent' | 'icon' | 'decoration' | 'extraText' | 'sealShape';

interface CurvePathDef {
  id: string;
  d: string;
}

interface DragState {
  type: DraggableType;
  id?: string; // For decorations/extraText
  pointerId: number;
  startX: number;
  startY: number;
  elementStartX: number;
  elementStartY: number;
}

interface RotateState {
  type: DraggableType;
  id?: string;
  pointerId: number;
  anchorClientX: number;
  anchorClientY: number;
  startScreenAngleDeg: number;
  startRotation: number;
}

@Component({
  selector: 'app-badge-preview',
  template: `
    <div
      class="relative w-full max-w-[880px] mx-auto flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100"
      (pointermove)="onPointerMove($event)"
      (pointerup)="onPointerUp($event)"
      (pointercancel)="onPointerUp($event)"
    >
      <div class="w-full flex items-center justify-between mb-4 text-xs">
        <span class="uppercase tracking-wide text-gray-400 flex items-center gap-2">
          Live Preview
          <span class="text-gray-300" title="Ctrl/Cmd+Z undo · Shift+Z redo · Arrow keys nudge · Shift+Arrow ×10 · Delete removes selection · Esc deselects" aria-label="Keyboard shortcuts">⌨</span>
        </span>
        <div class="flex gap-2">
          <button (click)="store.undo()" [disabled]="!store.canUndo()" class="px-3 py-1 rounded-md border border-gray-200 bg-white text-gray-700 font-semibold disabled:opacity-40" title="Undo (Ctrl+Z)" aria-label="Undo">↶ Undo</button>
          <button (click)="store.redo()" [disabled]="!store.canRedo()" class="px-3 py-1 rounded-md border border-gray-200 bg-white text-gray-700 font-semibold disabled:opacity-40" title="Redo (Ctrl+Shift+Z)" aria-label="Redo">↷ Redo</button>
          <button (click)="confirmReset()" class="px-3 py-1 rounded-md border border-gray-200 bg-white text-gray-600 font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200" title="Reset to default badge" aria-label="Reset design">↺ Reset</button>
        </div>
      </div>
      <div #captureContainer class="w-full aspect-square max-w-[700px] flex items-center justify-center relative select-none" (pointerdown)="clearSelection()">
        
        <!-- SVG Canvas -->
        <svg viewBox="0 0 200 200" class="w-full h-full drop-shadow-xl cursor-default" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
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

            <!-- Selection highlight: blue halo around the selected element. -->
            <filter id="selection-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feMorphology in="SourceAlpha" operator="dilate" radius="1.5" result="thick"/>
              <feGaussianBlur in="thick" stdDeviation="2" result="blurred"/>
              <feFlood flood-color="#3B82F6" flood-opacity="0.9" result="color"/>
              <feComposite in="color" in2="blurred" operator="in" result="glow"/>
              <feMerge>
                <feMergeNode in="glow"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <!-- Curved-text paths -->
            @for (cp of curvePaths(); track cp.id) {
              <path [attr.id]="cp.id" [attr.d]="cp.d" fill="none" />
            }

            <!-- Font Style for Export -->
            <style>
               /* Dynamic font class injection */
               .badge-text { font-family: '{{design().font}}', sans-serif; }
            </style>
          </defs>
          
          <g
            [attr.filter]="design().hasShadow ? 'url(#shadow)' : 'none'"
            [attr.transform]="shapeTransform"
          >
            @for (layer of shapeLayers(); track $index) {
              @switch (layer.kind) {
                @case ('circle') {
                  <circle [attr.cx]="layer.cx" [attr.cy]="layer.cy" [attr.r]="layer.r"
                    [attr.fill]="fillFor(layer.fill)"
                    [attr.stroke]="design().borderColor"
                    [attr.stroke-width]="strokeWidthFor(layer.stroke)"
                  />
                }
                @case ('rect') {
                  <rect [attr.x]="layer.x" [attr.y]="layer.y"
                    [attr.width]="layer.width" [attr.height]="layer.height"
                    [attr.rx]="layer.rx ?? null"
                    [attr.fill]="fillFor(layer.fill)"
                    [attr.stroke]="design().borderColor"
                    [attr.stroke-width]="strokeWidthFor(layer.stroke)"
                  />
                }
                @case ('polygon') {
                  <polygon [attr.points]="layer.points"
                    [attr.fill]="fillFor(layer.fill)"
                    [attr.stroke]="design().borderColor"
                    [attr.stroke-width]="strokeWidthFor(layer.stroke)"
                  />
                }
                @case ('path') {
                  <path [attr.d]="layer.d"
                    [attr.fill]="fillFor(layer.fill)"
                    [attr.stroke]="design().borderColor"
                    [attr.stroke-width]="strokeWidthFor(layer.stroke)"
                  />
                }
              }
            }

            <!-- Extra Borders (concentric outlines following the outer geometry) -->
            @for (border of sortedExtraBorders(); track border.id) {
              <g [attr.transform]="borderTransform(border)">
                @switch (outerLayer().kind) {
                  @case ('circle') {
                    <circle [attr.cx]="$any(outerLayer()).cx" [attr.cy]="$any(outerLayer()).cy" [attr.r]="$any(outerLayer()).r"
                      fill="none"
                      [attr.stroke]="border.color"
                      [attr.stroke-width]="border.width"
                      [attr.stroke-opacity]="border.opacity"
                      [attr.stroke-dasharray]="dashArrayFor(border.style, border.width)"
                      stroke-linecap="round"
                      vector-effect="non-scaling-stroke"
                    />
                  }
                  @case ('rect') {
                    <rect [attr.x]="$any(outerLayer()).x" [attr.y]="$any(outerLayer()).y"
                      [attr.width]="$any(outerLayer()).width" [attr.height]="$any(outerLayer()).height"
                      [attr.rx]="$any(outerLayer()).rx ?? null"
                      fill="none"
                      [attr.stroke]="border.color"
                      [attr.stroke-width]="border.width"
                      [attr.stroke-opacity]="border.opacity"
                      [attr.stroke-dasharray]="dashArrayFor(border.style, border.width)"
                      stroke-linecap="round"
                      vector-effect="non-scaling-stroke"
                    />
                  }
                  @case ('polygon') {
                    <polygon [attr.points]="$any(outerLayer()).points"
                      fill="none"
                      [attr.stroke]="border.color"
                      [attr.stroke-width]="border.width"
                      [attr.stroke-opacity]="border.opacity"
                      [attr.stroke-dasharray]="dashArrayFor(border.style, border.width)"
                      stroke-linecap="round"
                      vector-effect="non-scaling-stroke"
                    />
                  }
                  @case ('path') {
                    <path [attr.d]="$any(outerLayer()).d"
                      fill="none"
                      [attr.stroke]="border.color"
                      [attr.stroke-width]="border.width"
                      [attr.stroke-opacity]="border.opacity"
                      [attr.stroke-dasharray]="dashArrayFor(border.style, border.width)"
                      stroke-linecap="round"
                      vector-effect="non-scaling-stroke"
                    />
                  }
                }
              </g>
            }
          </g>

          <!-- Seal Shapes (decorative rings) -->
          @for (shape of design().sealShapes; track shape.id) {
            <circle
              class="hover:cursor-move hover:opacity-80 transition-opacity"
              (pointerdown)="startDrag($event, 'sealShape', shape.id)"
              [attr.filter]="isSelected('sealShape', shape.id) ? 'url(#selection-glow)' : null"
              [attr.cx]="shape.cx"
              [attr.cy]="shape.cy"
              [attr.r]="shape.radius"
              [attr.fill]="shape.fill || 'none'"
              [attr.stroke]="shape.stroke"
              [attr.stroke-width]="shape.strokeWidth"
              [attr.stroke-dasharray]="dashArrayFor(shape.strokeStyle, shape.strokeWidth)"
              [attr.stroke-opacity]="shape.strokeOpacity"
              stroke-linecap="round"
            />
          }

          <!-- Decorations -->
          @for (deco of design().decorations; track deco.id) {
            <g
              class="hover:cursor-move hover:opacity-80 decoration-item"
              (pointerdown)="startDrag($event, 'decoration', deco.id)"
              [attr.transform]="'translate(' + deco.x + ' ' + deco.y + ') rotate(' + (deco.rotation || 0) + ') scale(' + (deco.size/20) + ')'"
              [attr.filter]="isSelected('decoration', deco.id) ? 'url(#selection-glow)' : null"
            >
               @if (deco.type === 'image' && deco.customImage) {
                  <image
                    [attr.href]="deco.customImage"
                    [attr.xlink:href]="deco.customImage"
                    x="-10" y="-10" width="20" height="20"
                  />
               } @else {
                  @switch (deco.type) {
                    @case ('star') {
                      <polygon points="0,-10 2.2,-3.2 9.5,-3.2 3.6,1.1 5.9,7.8 0,3.6 -5.9,7.8 -3.6,1.1 -9.5,-3.2 -2.2,-3.2" [attr.fill]="deco.color || design().textColor"/>
                    }
                    @case ('heart') {
                      <path d="M0,8 C-8,2 -10,-3 -7,-7 C-4,-10 -1,-8 0,-5 C1,-8 4,-10 7,-7 C10,-3 8,2 0,8 Z" [attr.fill]="deco.color || design().textColor"/>
                    }
                    @case ('crown') {
                      <path d="M-10,5 L-10,-5 L-6,-2 L0,-8 L6,-2 L10,-5 L10,5 Z" [attr.fill]="deco.color || design().textColor"/>
                    }
                    @case ('check-mark') {
                      <path d="M-8 0 L-2 6 L8 -6" fill="none" [attr.stroke]="deco.color || design().textColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    }
                    @case ('laurel-wreath') {
                      <g [attr.fill]="deco.color || design().textColor">
                        <path d="M-9,-2 Q-11,-6 -8,-9 Q-5,-7 -7,-3 Z"/>
                        <path d="M-9,2 Q-11,6 -8,9 Q-5,7 -7,3 Z"/>
                        <path d="M-7,-7 Q-9,-10 -5,-11 Q-3,-9 -5,-7 Z"/>
                        <path d="M-7,7 Q-9,10 -5,11 Q-3,9 -5,7 Z"/>
                        <path d="M9,-2 Q11,-6 8,-9 Q5,-7 7,-3 Z"/>
                        <path d="M9,2 Q11,6 8,9 Q5,7 7,3 Z"/>
                        <path d="M7,-7 Q9,-10 5,-11 Q3,-9 5,-7 Z"/>
                        <path d="M7,7 Q9,10 5,11 Q3,9 5,7 Z"/>
                      </g>
                    }
                    @case ('ribbon-bow') {
                      <g [attr.fill]="deco.color || design().textColor">
                        <path d="M-2,-1 L-9,-6 L-9,6 L-2,1 Z"/>
                        <path d="M2,-1 L9,-6 L9,6 L2,1 Z"/>
                        <circle cx="0" cy="0" r="2.5"/>
                      </g>
                    }
                    @case ('wing') {
                      <g [attr.fill]="deco.color || design().textColor">
                        <path d="M-2,0 Q-8,-2 -10,2 Q-6,3 -2,2 Z"/>
                        <path d="M-2,0 Q-7,-4 -9,-1 Q-5,0 -2,-1 Z"/>
                        <path d="M2,0 Q8,-2 10,2 Q6,3 2,2 Z"/>
                        <path d="M2,0 Q7,-4 9,-1 Q5,0 2,-1 Z"/>
                      </g>
                    }
                    @case ('sparkles') {
                      <g [attr.fill]="deco.color || design().textColor">
                        <path d="M0,-9 L1,-1 L9,0 L1,1 L0,9 L-1,1 L-9,0 L-1,-1 Z"/>
                        <path d="M-7,-7 L-6,-5 L-4,-4 L-6,-3 L-7,-1 L-8,-3 L-10,-4 L-8,-5 Z" transform="scale(0.4) translate(-12,-12)"/>
                        <path d="M7,7 L8,9 L10,10 L8,11 L7,13 L6,11 L4,10 L6,9 Z" transform="scale(0.4) translate(12,12)"/>
                      </g>
                    }
                    @case ('trophy') {
                      <g [attr.fill]="deco.color || design().textColor">
                        <path d="M-6,-8 L6,-8 L5,2 Q5,5 0,5 Q-5,5 -5,2 Z"/>
                        <rect x="-2" y="5" width="4" height="3"/>
                        <rect x="-5" y="8" width="10" height="2" rx="1"/>
                        <path d="M-6,-6 Q-9,-6 -9,-3 Q-9,-1 -6,-1" fill="none" [attr.stroke]="deco.color || design().textColor" stroke-width="1.5"/>
                        <path d="M6,-6 Q9,-6 9,-3 Q9,-1 6,-1" fill="none" [attr.stroke]="deco.color || design().textColor" stroke-width="1.5"/>
                      </g>
                    }
                    @case ('medal') {
                      <g>
                        <path d="M-5,-9 L-3,-3 L0,-5 L3,-3 L5,-9" fill="none" [attr.stroke]="deco.color || design().textColor" stroke-width="2"/>
                        <circle cx="0" cy="3" r="6" [attr.fill]="deco.color || design().textColor"/>
                        <circle cx="0" cy="3" r="3" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="0.8"/>
                      </g>
                    }
                  }
               }
            </g>
          }

          <!-- Interactive Elements -->
          <!-- Icon / Logo -->
          <g
            class="hover:cursor-move hover:opacity-80 transition-opacity"
            (pointerdown)="startDrag($event, 'icon')"
            [attr.transform]="'translate(' + (design().iconSettings?.x || 100) + ' ' + (design().iconSettings?.y || 85) + ')'"
            [attr.filter]="isSelected('icon') ? 'url(#selection-glow)' : null"
          >
            <!-- Invisible hit area so blank pixels around the emoji are still draggable -->
            <rect
              [attr.x]="-(design().iconSettings?.size || 40)/2"
              [attr.y]="-(design().iconSettings?.size || 40)/2"
              [attr.width]="design().iconSettings?.size || 40"
              [attr.height]="design().iconSettings?.size || 40"
              fill="transparent"
            />
            @if (design().customLogo) {
              <image
                [attr.href]="design().customLogo"
                [attr.xlink:href]="design().customLogo"
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
                [attr.fill]="design().iconStyle === 'mono' ? design().iconColor : undefined"
              >
                {{ design().emoji }}
              </text>
            }
          </g>

          <!-- Title -->
          @if (isCurved(design().titleSettings?.curve)) {
            <text
              [attr.font-size]="design().titleSettings?.size || 18"
              text-anchor="middle"
              [style.font-family]="design().font"
              [attr.font-weight]="design().titleSettings?.fontWeight || 'bold'"
              [attr.font-style]="design().titleSettings?.fontStyle || 'normal'"
              [attr.fill]="design().textColor"
              [attr.filter]="filterFor('title', undefined, !!design().titleSettings?.hasShadow)"
              class="hover:cursor-move hover:fill-opacity-80 select-none badge-text"
              (pointerdown)="startDrag($event, 'title')"
            >
              <textPath [attr.href]="'#curve-title'" [attr.xlink:href]="'#curve-title'" startOffset="50%">{{ design().title }}</textPath>
            </text>
          } @else {
            <text
              [attr.x]="design().titleSettings?.x || 100"
              [attr.y]="design().titleSettings?.y || 120"
              [attr.font-size]="design().titleSettings?.size || 18"
              text-anchor="middle"
              [style.font-family]="design().font"
              [attr.font-weight]="design().titleSettings?.fontWeight || 'bold'"
              [attr.font-style]="design().titleSettings?.fontStyle || 'normal'"
              [attr.fill]="design().textColor"
              [attr.filter]="filterFor('title', undefined, !!design().titleSettings?.hasShadow)"
              class="hover:cursor-move hover:fill-opacity-80 select-none badge-text"
              (pointerdown)="startDrag($event, 'title')"
            >
              {{ design().title }}
            </text>
          }

          <!-- Subtitle -->
          @if (isCurved(design().subtitleSettings?.curve)) {
            <text
              [attr.font-size]="design().subtitleSettings?.size || 12"
              text-anchor="middle"
              [style.font-family]="design().font"
              [attr.font-weight]="design().subtitleSettings?.fontWeight || 'normal'"
              [attr.font-style]="design().subtitleSettings?.fontStyle || 'normal'"
              [attr.fill]="design().textColor"
              [attr.filter]="filterFor('subtitle', undefined, !!design().subtitleSettings?.hasShadow)"
              opacity="0.9"
              class="hover:cursor-move hover:fill-opacity-80 select-none badge-text"
              (pointerdown)="startDrag($event, 'subtitle')"
            >
              <textPath [attr.href]="'#curve-subtitle'" [attr.xlink:href]="'#curve-subtitle'" startOffset="50%">{{ design().subtitle }}</textPath>
            </text>
          } @else {
            <text
              [attr.x]="design().subtitleSettings?.x || 100"
              [attr.y]="design().subtitleSettings?.y || 140"
              [attr.font-size]="design().subtitleSettings?.size || 12"
              text-anchor="middle"
              [style.font-family]="design().font"
              [attr.font-weight]="design().subtitleSettings?.fontWeight || 'normal'"
              [attr.font-style]="design().subtitleSettings?.fontStyle || 'normal'"
              [attr.fill]="design().textColor"
              [attr.filter]="filterFor('subtitle', undefined, !!design().subtitleSettings?.hasShadow)"
              opacity="0.9"
              class="hover:cursor-move hover:fill-opacity-80 select-none badge-text"
              (pointerdown)="startDrag($event, 'subtitle')"
            >
              {{ design().subtitle }}
            </text>
          }

          <!-- Accent Text -->
          @if (isCurved(design().accentSettings?.curve)) {
            <text
              [attr.font-size]="design().accentSettings?.size || 10"
              text-anchor="middle"
              letter-spacing="2"
              [style.font-family]="design().font"
              [attr.font-weight]="design().accentSettings?.fontWeight || 'bold'"
              [attr.font-style]="design().accentSettings?.fontStyle || 'normal'"
              [attr.fill]="design().textColor"
              [attr.filter]="filterFor('accent', undefined, !!design().accentSettings?.hasShadow)"
              class="hover:cursor-move hover:fill-opacity-80 select-none badge-text"
              (pointerdown)="startDrag($event, 'accent')"
            >
              <textPath [attr.href]="'#curve-accent'" [attr.xlink:href]="'#curve-accent'" startOffset="50%">{{ design().accentText }}</textPath>
            </text>
          } @else {
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
              [attr.filter]="filterFor('accent', undefined, !!design().accentSettings?.hasShadow)"
              class="hover:cursor-move hover:fill-opacity-80 select-none badge-text"
              (pointerdown)="startDrag($event, 'accent')"
            >
              {{ design().accentText }}
            </text>
          }

          <!-- Extra Texts -->
          @for (txt of design().extraTexts; track txt.id) {
            @if (isCurved(txt.curve)) {
              <text
                [attr.font-size]="txt.size"
                text-anchor="middle"
                [style.font-family]="design().font"
                [attr.font-weight]="txt.fontWeight"
                [attr.font-style]="txt.fontStyle"
                [attr.fill]="txt.color"
                [attr.filter]="filterFor('extraText', txt.id, txt.hasShadow)"
                class="hover:cursor-move hover:fill-opacity-80 select-none badge-text"
                (pointerdown)="startDrag($event, 'extraText', txt.id)"
              >
                <textPath [attr.href]="'#curve-extra-' + txt.id" [attr.xlink:href]="'#curve-extra-' + txt.id" startOffset="50%">{{ txt.text }}</textPath>
              </text>
            } @else {
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
                [attr.filter]="filterFor('extraText', txt.id, txt.hasShadow)"
                class="hover:cursor-move hover:fill-opacity-80 select-none badge-text"
                (pointerdown)="startDrag($event, 'extraText', txt.id)"
              >
                {{ txt.text }}
              </text>
            }
          }
          
          <!-- Snapping Guides -->
          @if (isDragging()) {
             <line data-export-skip="true" x1="100" y1="0" x2="100" y2="200" stroke="#3B82F6" stroke-width="0.5" stroke-dasharray="4 2"
                [class.opacity-0]="!snappedX()" [class.opacity-100]="snappedX()" />
             <line data-export-skip="true" x1="0" y1="100" x2="200" y2="100" stroke="#3B82F6" stroke-width="0.5" stroke-dasharray="4 2"
                [class.opacity-0]="!snappedY()" [class.opacity-100]="snappedY()" />
          }

          <!-- Selection: visual highlight is the selection-glow SVG filter
               applied to the element itself (see filterFor). Here we only
               render the rotation handle, floating above the anchor. -->
          @if (selectionAnchor(); as anchor) {
             @if (selectionRotation() !== null) {
                <g data-export-skip="true" [attr.transform]="'rotate(' + (selectionRotation() ?? 0) + ' ' + anchor.x + ' ' + anchor.y + ')'">
                   <line style="pointer-events: none;" [attr.x1]="anchor.x" [attr.y1]="anchor.y - 14" [attr.x2]="anchor.x" [attr.y2]="anchor.y - 20" stroke="#3B82F6" stroke-width="0.8" opacity="0.9"/>
                   <circle
                     [attr.cx]="anchor.x"
                     [attr.cy]="anchor.y - 22"
                     r="2.5"
                     fill="#3B82F6"
                     stroke="#FFFFFF"
                     stroke-width="0.6"
                     class="cursor-grab"
                     role="button"
                     aria-label="Rotate selection"
                     (pointerdown)="startRotate($event)"
                   />
                </g>
             }
          }
        </svg>
      </div>

      <!-- Controls (below canvas) -->
      <div class="mt-4 w-full flex items-center justify-center">
        <div class="flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
          <label class="text-xs text-gray-600">Canvas</label>
          <input type="range" min="1000" max="1500" step="100"
            [value]="store.badge().canvasSize || 1000"
            (input)="store.update({canvasSize: +$any($event.target).value})"
            class="w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            aria-label="Canvas size"
          />
          <span class="text-xs text-gray-600">{{store.badge().canvasSize || 1000}}px</span>

          <button (click)="downloadPng()" class="ml-3 bg-gray-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-lg flex items-center gap-1" aria-label="Download PNG">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
             PNG
          </button>
          <button (click)="downloadSvg()" class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1" aria-label="Download SVG">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
             SVG
          </button>
          <button (click)="downloadJson()" class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1" aria-label="Save design as JSON" title="Save design as .badge.json">
             JSON
          </button>
          <label class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer" title="Load design from .badge.json">
             Load
             <input type="file" accept="application/json,.json" class="hidden" (change)="loadJson($event)" />
          </label>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgePreviewComponent {
  private static readonly loadedFonts = new Set<string>();
  private static readonly inlinedFontCss = new Map<string, string>();
  readonly CENTER = CENTER;

  get shapeTransform() {
    const scale = (this.design().shapeScale || 100) / 100;
    return `translate(${CENTER} ${CENTER}) scale(${scale}) translate(-${CENTER} -${CENTER})`;
  }
  store = inject(BadgeStore);
  private toast = inject(ToastService);
  design = this.store.badge;
  readonly shapeLayers = computed<ShapeLayer[]>(() => SHAPE_DEFS[this.design().shape]);
  /** The outermost geometry layer of the active shape — reused for extra borders. */
  readonly outerLayer = computed<ShapeLayer>(() => SHAPE_DEFS[this.design().shape][0]);
  /**
   * Extra borders sorted by visible outer extent (outermost first), so inner
   * rings paint last and stay on top. Extent = scale + halfWidth/viewBox.
   */
  readonly sortedExtraBorders = computed(() =>
    [...(this.design().extraBorders ?? [])].sort((a, b) => {
      const ea = (a.scale ?? 1) + a.width / (2 * VIEWBOX);
      const eb = (b.scale ?? 1) + b.width / (2 * VIEWBOX);
      return eb - ea;
    })
  );
  captureContainer = viewChild<ElementRef>('captureContainer');

  readonly curvePaths = computed<CurvePathDef[]>(() => {
    const d = this.design();
    const out: CurvePathDef[] = [];
    const push = (id: string, curve: CurveSettings | undefined, anchorX: number | undefined, anchorY: number | undefined) => {
      if (!curve || curve.radius <= 0) return;
      // Position the arc so that its midpoint (where the text sits) lands at the
      // element's (x, y) — keeps curved text anchored to where the user dragged
      // it instead of jumping up by `radius`.
      const ax = anchorX ?? CENTER;
      const ay = anchorY ?? CENTER;
      const angleRad = (curve.centerAngle * Math.PI) / 180;
      const cx = ax - curve.radius * Math.sin(angleRad);
      const cy = ay + curve.radius * Math.cos(angleRad);
      out.push({ id, d: this.curvePathD(cx, cy, curve.radius, curve.centerAngle, curve.flip) });
    };
    push('curve-title', d.titleSettings?.curve, d.titleSettings?.x, d.titleSettings?.y);
    push('curve-subtitle', d.subtitleSettings?.curve, d.subtitleSettings?.x, d.subtitleSettings?.y);
    push('curve-accent', d.accentSettings?.curve, d.accentSettings?.x, d.accentSettings?.y);
    for (const t of d.extraTexts) {
      push(`curve-extra-${t.id}`, t.curve, t.x, t.y);
    }
    return out;
  });

  isCurved(curve: CurveSettings | undefined): boolean {
    return !!curve && curve.radius > 0;
  }

  /**
   * Build an arc path whose midpoint (at startOffset=50%) sits on the circle of
   * `r` centered at (cx,cy), at `centerAngleDeg` (0 = top, +clockwise from viewer).
   * `flip=false` lays the glyphs on the OUTSIDE of the arc (good for top text);
   * `flip=true`  lays them on the INSIDE (good for bottom text that should still
   * read upright).
   */
  curvePathD(cx: number, cy: number, r: number, centerAngleDeg: number, flip: boolean): string {
    const mathCenter = (centerAngleDeg - 90) * Math.PI / 180;
    const startA = flip ? mathCenter + Math.PI / 2 : mathCenter - Math.PI / 2;
    const endA   = flip ? mathCenter - Math.PI / 2 : mathCenter + Math.PI / 2;
    const sweep  = flip ? 0 : 1;
    const sx = cx + r * Math.cos(startA);
    const sy = cy + r * Math.sin(startA);
    const ex = cx + r * Math.cos(endA);
    const ey = cy + r * Math.sin(endA);
    return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 0 ${sweep} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
  }

  /** True when the given selectable element is the current canvas selection. */
  isSelected(type: 'title' | 'subtitle' | 'accent' | 'icon' | 'decoration' | 'extraText' | 'sealShape', id?: string): boolean {
    const sel = this.selection();
    if (!sel || sel.type !== type) return false;
    if (id !== undefined) return sel.id === id;
    return !sel.id;
  }

  /**
   * Combine `shadow` (user-controlled drop shadow) and `selection-glow` (blue
   * halo) into one chained `filter=` attribute. Returns null when neither
   * applies so the attribute isn't rendered as 'none url(...)'.
   */
  filterFor(type: 'title' | 'subtitle' | 'accent' | 'icon' | 'decoration' | 'extraText' | 'sealShape', id: string | undefined, hasShadow: boolean): string | null {
    const filters: string[] = [];
    if (hasShadow) filters.push('url(#shadow)');
    if (this.isSelected(type, id)) filters.push('url(#selection-glow)');
    return filters.length ? filters.join(' ') : null;
  }

  /** Scale a border's geometry around the badge centre. */
  borderTransform(border: { scale?: number }): string {
    const s = border.scale ?? 1;
    return `translate(${CENTER} ${CENTER}) scale(${s}) translate(-${CENTER} -${CENTER})`;
  }

  dashArrayFor(style: StrokeStyle, width: number): string | null {
    if (style === 'dashed') return `${Math.max(width * 2, 2)} ${Math.max(width * 1.5, 2)}`;
    if (style === 'dotted') return `0 ${Math.max(width * 1.8, 1)}`;
    return null;
  }

  fillFor(fill: ShapeLayer['fill']): string {
    if (fill === 'gradient') return 'url(#mainGradient)';
    if (fill === 'secondary') return this.design().secondaryColor;
    return 'none';
  }

  strokeWidthFor(stroke?: LayerStroke): number | null {
    if (!stroke) return null;
    if (stroke.useBorderWidth) return this.design().borderWidth;
    return stroke.width ?? 1;
  }
  private readonly fontLoaderEffect = effect(() => {
    this.ensureFontLoaded(this.design().font);
  });

  // Dragging State
  private dragState: DragState | null = null;
  isDragging = signal(false);
  snappedX = signal(false);
  snappedY = signal(false);

  // Selection state for keyboard nudging and visual indicator (lives on the
  // store so the side panel can also react and highlight the matching block).
  selection = this.store.selection;
  readonly selectionAnchor = computed(() => this.resolveAnchor(this.selection()));
  readonly selectionRotation = computed<number | null>(() => {
    const sel = this.selection();
    if (!sel) return null;
    if (sel.type === 'decoration' && sel.id) {
      return this.design().decorations.find(d => d.id === sel.id)?.rotation ?? 0;
    }
    if (sel.type === 'extraText' && sel.id) {
      return this.design().extraTexts.find(t => t.id === sel.id)?.rotation ?? 0;
    }
    return null;
  });

  private rotateState: RotateState | null = null;

  startDrag(event: PointerEvent, type: DraggableType, id?: string) {
    event.preventDefault();
    event.stopPropagation();

    const start = this.resolveAnchor({ type, id });
    if (!start) return;

    this.dragState = {
      type,
      id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      elementStartX: start.x,
      elementStartY: start.y
    };
    this.isDragging.set(true);
    this.selection.set({ type, id });

    const target = event.currentTarget as Element | null;
    target?.setPointerCapture?.(event.pointerId);
  }

  startRotate(event: PointerEvent) {
    event.preventDefault();
    event.stopPropagation();

    const sel = this.selection();
    if (!sel) return;
    const anchor = this.resolveAnchor(sel);
    if (!anchor) return;
    const currentRotation = this.selectionRotation();
    if (currentRotation === null) return;

    const svgRect = this.captureContainer()?.nativeElement.getBoundingClientRect();
    if (!svgRect) return;

    const scale = svgRect.width / VIEWBOX;
    const anchorClientX = svgRect.left + anchor.x * scale;
    const anchorClientY = svgRect.top + anchor.y * scale;

    const dxStart = event.clientX - anchorClientX;
    const dyStart = event.clientY - anchorClientY;
    // Handle sits at the top, so '0 deg' = pointer above anchor (-Y direction).
    // atan2 returns 0 along +X, so add 90° to make 'up' = 0.
    const startScreenAngleDeg = (Math.atan2(dyStart, dxStart) * 180) / Math.PI + 90;

    this.rotateState = {
      type: sel.type,
      id: sel.id,
      pointerId: event.pointerId,
      anchorClientX,
      anchorClientY,
      startScreenAngleDeg,
      startRotation: currentRotation
    };

    const target = event.currentTarget as Element | null;
    target?.setPointerCapture?.(event.pointerId);
  }

  onPointerMove(event: PointerEvent) {
    if (this.rotateState && event.pointerId === this.rotateState.pointerId) {
      const dx = event.clientX - this.rotateState.anchorClientX;
      const dy = event.clientY - this.rotateState.anchorClientY;
      const screenAngleDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      let rotation = this.rotateState.startRotation + (screenAngleDeg - this.rotateState.startScreenAngleDeg);
      if (event.shiftKey) rotation = Math.round(rotation / 15) * 15;
      rotation = ((rotation % 360) + 360) % 360;
      this.applyRotation(this.rotateState.type, this.rotateState.id, rotation);
      return;
    }

    if (!this.dragState || event.pointerId !== this.dragState.pointerId) return;

    const svgRect = this.captureContainer()?.nativeElement.getBoundingClientRect();
    if (!svgRect) return;

    const scaleFactor = VIEWBOX / svgRect.width;
    const dx = (event.clientX - this.dragState.startX) * scaleFactor;
    const dy = (event.clientY - this.dragState.startY) * scaleFactor;

    let newX = this.dragState.elementStartX + dx;
    let newY = this.dragState.elementStartY + dy;

    const SNAP_THRESHOLD = 3;

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

    this.applyPosition(this.dragState.type, this.dragState.id, newX, newY);
  }

  onPointerUp(event: PointerEvent) {
    if (this.dragState && event.pointerId === this.dragState.pointerId) {
      const target = event.currentTarget as Element | null;
      target?.releasePointerCapture?.(event.pointerId);
    }
    if (this.rotateState && event.pointerId === this.rotateState.pointerId) {
      const target = event.currentTarget as Element | null;
      target?.releasePointerCapture?.(event.pointerId);
      this.rotateState = null;
    }
    this.dragState = null;
    this.isDragging.set(false);
    this.snappedX.set(false);
    this.snappedY.set(false);
  }

  private applyRotation(type: DraggableType, id: string | undefined, rotation: number) {
    if (type === 'decoration' && id) {
      this.store.updateDecoration(id, { rotation });
    } else if (type === 'extraText' && id) {
      this.store.updateExtraText(id, { rotation });
    }
  }

  confirmReset() {
    if (window.confirm('Reset the badge to defaults? This clears history.')) {
      this.store.reset();
      this.selection.set(null);
    }
  }

  clearSelection() {
    this.selection.set(null);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null;
    const tag = target?.tagName;
    const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable;

    const mod = event.metaKey || event.ctrlKey;
    if (mod && !event.shiftKey && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      this.store.undo();
      return;
    }
    if (mod && (event.shiftKey && event.key.toLowerCase() === 'z' || event.key.toLowerCase() === 'y')) {
      event.preventDefault();
      this.store.redo();
      return;
    }

    if (isEditable) return;

    const sel = this.selection();
    if (!sel) return;

    if (event.key === 'Escape') {
      this.selection.set(null);
      return;
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (sel.type === 'decoration' && sel.id) {
        event.preventDefault();
        this.store.removeDecoration(sel.id);
        this.selection.set(null);
        return;
      }
      if (sel.type === 'extraText' && sel.id) {
        event.preventDefault();
        this.store.removeExtraText(sel.id);
        this.selection.set(null);
        return;
      }
      if (sel.type === 'sealShape' && sel.id) {
        event.preventDefault();
        this.store.removeSealShape(sel.id);
        this.selection.set(null);
        return;
      }
    }

    const nudges: Record<string, [number, number]> = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0]
    };
    const delta = nudges[event.key];
    if (!delta) return;
    event.preventDefault();
    const step = event.shiftKey ? 10 : 1;
    const anchor = this.resolveAnchor(sel);
    if (!anchor) return;
    this.applyPosition(sel.type, sel.id, anchor.x + delta[0] * step, anchor.y + delta[1] * step);
  }

  private resolveAnchor(sel: Selection | null): { x: number; y: number } | null {
    if (!sel) return null;
    if (sel.type === 'decoration' && sel.id) {
      const deco = this.design().decorations.find(d => d.id === sel.id);
      return deco ? { x: deco.x, y: deco.y } : null;
    }
    if (sel.type === 'extraText' && sel.id) {
      const txt = this.design().extraTexts.find(t => t.id === sel.id);
      return txt ? { x: txt.x, y: txt.y } : null;
    }
    if (sel.type === 'sealShape' && sel.id) {
      const shape = this.design().sealShapes.find(s => s.id === sel.id);
      return shape ? { x: shape.cx, y: shape.cy } : null;
    }
    const settings = this.design()[`${sel.type}Settings` as const];
    return settings ? { x: settings.x, y: settings.y } : null;
  }

  private applyPosition(type: DraggableType, id: string | undefined, x: number, y: number) {
    if (type === 'decoration' && id) {
      this.store.updateDecoration(id, { x, y });
    } else if (type === 'extraText' && id) {
      this.store.updateExtraText(id, { x, y });
    } else if (type === 'sealShape' && id) {
      this.store.updateSealShape(id, { cx: x, cy: y });
    } else if (type !== 'decoration' && type !== 'extraText' && type !== 'sealShape') {
      this.store.updateElement(type, { x, y });
    }
  }

  async downloadPng() {
    const svgClone = await this.prepareExportSvg();
    if (!svgClone) return;

    const svgData = new XMLSerializer().serializeToString(svgClone);
    const size = this.design().canvasSize || 1000;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      ctx?.drawImage(img, 0, 0, size, size);
      try {
        const pngUrl = canvas.toDataURL('image/png');
        this.triggerDownload(pngUrl, `badge-${Date.now()}.png`);
        this.toast.success('PNG downloaded');
      } catch (err) {
        console.error('PNG export failed', err);
        this.toast.error('PNG export failed');
      }
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      this.toast.error('Could not render badge for export');
    };
    img.src = url;
  }

  async downloadSvg() {
    const svgClone = await this.prepareExportSvg();
    if (!svgClone) return;

    const svgData = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(svgClone);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    this.triggerDownload(url, `badge-${Date.now()}.svg`);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.toast.success('SVG downloaded');
  }

  private async prepareExportSvg(): Promise<SVGElement | null> {
    const svgElement: SVGElement | null = this.captureContainer()?.nativeElement.querySelector('svg') ?? null;
    if (!svgElement) return null;

    const svgClone = svgElement.cloneNode(true) as SVGElement;

    // Strip transient editor-only nodes (selection indicator, snap guides)
    svgClone.querySelectorAll('[data-export-skip]').forEach(node => node.remove());

    // Strip selection-glow filter from any selected element so the export
    // doesn't carry the editor's blue halo. Remove the filter definition too.
    svgClone.querySelectorAll('[filter*="selection-glow"]').forEach(node => {
      const value = (node.getAttribute('filter') ?? '')
        .replace(/url\(#selection-glow\)/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (value) node.setAttribute('filter', value);
      else node.removeAttribute('filter');
    });
    svgClone.querySelector('#selection-glow')?.remove();

    // Ensure correct namespace + explicit dimensions for downstream tools
    const size = this.design().canvasSize || 1000;
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    svgClone.setAttribute('width', String(size));
    svgClone.setAttribute('height', String(size));

    const fontName = this.design().font;
    const css = await this.inlineFontFaces(fontName);
    if (css) {
      const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      style.textContent = css;
      svgClone.prepend(style);
    }

    return svgClone;
  }

  /**
   * Fetch a Google Fonts CSS bundle and replace every external `url(...)` with a
   * base64 data URI. Browsers render `<img src="blob:...">` of an SVG in a
   * sandboxed context that won't honour `@import` or remote `url(...)`, so we
   * must inline the actual woff2 bytes for the PNG export to use the right
   * font. Result is cached per-family for the session.
   */
  private async inlineFontFaces(fontName: string): Promise<string> {
    if (!fontName) return '';
    const cached = BadgePreviewComponent.inlinedFontCss.get(fontName);
    if (cached) return cached;

    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
    try {
      const cssRes = await fetch(fontUrl);
      if (!cssRes.ok) return '';
      let css = await cssRes.text();

      const urls = Array.from(new Set([...css.matchAll(/url\((https?:\/\/[^)]+)\)/g)].map(m => m[1])));
      const pairs = await Promise.all(urls.map(async (url): Promise<[string, string]> => {
        try {
          const r = await fetch(url);
          if (!r.ok) return [url, ''];
          const blob = await r.blob();
          const dataUri = await new Promise<string>((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(String(fr.result));
            fr.onerror = () => reject(new Error('font read failed'));
            fr.readAsDataURL(blob);
          });
          return [url, dataUri];
        } catch {
          return [url, ''];
        }
      }));
      for (const [url, dataUri] of pairs) {
        if (dataUri) css = css.split(url).join(dataUri);
      }
      BadgePreviewComponent.inlinedFontCss.set(fontName, css);
      return css;
    } catch (e) {
      console.warn('Font inline failed', e);
      return '';
    }
  }

  private triggerDownload(href: string, filename: string) {
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadJson() {
    const blob = new Blob([this.store.exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    this.triggerDownload(url, `badge-${Date.now()}.badge.json`);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.toast.success('Design saved');
  }

  loadJson(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      const ok = this.store.importJson(text);
      if (ok) {
        this.toast.success('Design loaded');
        this.selection.set(null);
      } else {
        this.toast.error('Invalid badge JSON');
      }
    };
    reader.onerror = () => this.toast.error('Could not read file');
    reader.readAsText(file);
    input.value = '';
  }

  private ensureFontLoaded(font?: string) {
    if (!font || typeof document === 'undefined' || BadgePreviewComponent.loadedFonts.has(font)) {
      return;
    }

    const head = document.head;
    if (!head) return;

    const fontParam = font.replace(/ /g, '+');
    const href = `https://fonts.googleapis.com/css2?family=${fontParam}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
    const linkId = `badge-font-${fontParam}`;

    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = href;
      head.appendChild(link);
    }

    BadgePreviewComponent.loadedFonts.add(font);
  }
}
