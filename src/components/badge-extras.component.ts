import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BadgeStore } from '../services/badge.store';
import { CurveSettings, DecorationType, LayoutSettings, Selection } from '../services/badge-types';

type CurveTarget = 'title' | 'subtitle' | 'accent';
const DEFAULT_CURVE: CurveSettings = { radius: 70, centerAngle: 0, flip: false };

/** Tailwind class bundles for each settings-block "size". Kept here so the
 *  shared `blockClass()` helper can toggle the highlight ring without each
 *  callsite re-specifying the base classes.
 */
const BLOCK_BASE = {
  default: 'bg-gray-50 p-3 rounded-lg border border-gray-100 transition-shadow duration-200',
  sm: 'bg-gray-50 p-2 rounded border border-gray-200 space-y-2 text-xs transition-shadow duration-200',
  deco: 'p-2 bg-white rounded border border-gray-200 text-xs space-y-1 transition-shadow duration-200'
} as const;
const HIGHLIGHT = ' ring-2 ring-blue-500 ring-offset-2 shadow-lg';

function selectionKey(sel: Selection | null): string | null {
  if (!sel) return null;
  if (sel.id) return `${sel.type}:${sel.id}`;
  return sel.type;
}

@Component({
  selector: 'app-badge-extras',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
        <div data-sel="title" [class]="blockClass('title')" (click)="store.selection.set({type: 'title'})">
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
          <details class="mt-2 text-[11px]">
            <summary class="cursor-pointer text-gray-500">Curve along arc</summary>
            <div class="space-y-1 mt-1">
              <label class="flex items-center gap-2 text-gray-600">
                <input type="checkbox" [checked]="isCurveOn('title')" (change)="toggleCurve('title')">
                <span>Enable</span>
              </label>
              @if (isCurveOn('title')) {
                <div class="flex items-center gap-2">
                  <span class="w-10 text-gray-500">Radius</span>
                  <input type="range" min="20" max="95" [value]="curveOf('title')?.radius ?? 70" (input)="updateCurve('title', {radius: +$any($event.target).value})" class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                  <span class="w-8 text-right text-gray-500">{{ curveOf('title')?.radius ?? 70 }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-10 text-gray-500">Angle</span>
                  <input type="range" min="0" max="360" [value]="curveOf('title')?.centerAngle ?? 0" (input)="updateCurve('title', {centerAngle: snapAngle(+$any($event.target).value)})" class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                  <span class="w-8 text-right text-gray-500">{{ curveOf('title')?.centerAngle ?? 0 }}°</span>
                </div>
                <label class="flex items-center gap-2 text-gray-600">
                  <input type="checkbox" [checked]="curveOf('title')?.flip ?? false" (change)="updateCurve('title', {flip: $any($event.target).checked})">
                  <span>Flip (inside arc — for bottom text)</span>
                </label>
              }
            </div>
          </details>
        </div>

        <div data-sel="subtitle" [class]="blockClass('subtitle')" (click)="store.selection.set({type: 'subtitle'})">
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
          <details class="mt-2 text-[11px]">
            <summary class="cursor-pointer text-gray-500">Curve along arc</summary>
            <div class="space-y-1 mt-1">
              <label class="flex items-center gap-2 text-gray-600">
                <input type="checkbox" [checked]="isCurveOn('subtitle')" (change)="toggleCurve('subtitle')">
                <span>Enable</span>
              </label>
              @if (isCurveOn('subtitle')) {
                <div class="flex items-center gap-2">
                  <span class="w-10 text-gray-500">Radius</span>
                  <input type="range" min="20" max="95" [value]="curveOf('subtitle')?.radius ?? 70" (input)="updateCurve('subtitle', {radius: +$any($event.target).value})" class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                  <span class="w-8 text-right text-gray-500">{{ curveOf('subtitle')?.radius ?? 70 }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-10 text-gray-500">Angle</span>
                  <input type="range" min="0" max="360" [value]="curveOf('subtitle')?.centerAngle ?? 0" (input)="updateCurve('subtitle', {centerAngle: snapAngle(+$any($event.target).value)})" class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                  <span class="w-8 text-right text-gray-500">{{ curveOf('subtitle')?.centerAngle ?? 0 }}°</span>
                </div>
                <label class="flex items-center gap-2 text-gray-600">
                  <input type="checkbox" [checked]="curveOf('subtitle')?.flip ?? false" (change)="updateCurve('subtitle', {flip: $any($event.target).checked})">
                  <span>Flip (inside arc — for bottom text)</span>
                </label>
              }
            </div>
          </details>
        </div>

        <div data-sel="accent" [class]="blockClass('accent')" (click)="store.selection.set({type: 'accent'})">
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
          <details class="mt-2 text-[11px]">
            <summary class="cursor-pointer text-gray-500">Curve along arc</summary>
            <div class="space-y-1 mt-1">
              <label class="flex items-center gap-2 text-gray-600">
                <input type="checkbox" [checked]="isCurveOn('accent')" (change)="toggleCurve('accent')">
                <span>Enable</span>
              </label>
              @if (isCurveOn('accent')) {
                <div class="flex items-center gap-2">
                  <span class="w-10 text-gray-500">Radius</span>
                  <input type="range" min="20" max="95" [value]="curveOf('accent')?.radius ?? 70" (input)="updateCurve('accent', {radius: +$any($event.target).value})" class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                  <span class="w-8 text-right text-gray-500">{{ curveOf('accent')?.radius ?? 70 }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-10 text-gray-500">Angle</span>
                  <input type="range" min="0" max="360" [value]="curveOf('accent')?.centerAngle ?? 0" (input)="updateCurve('accent', {centerAngle: snapAngle(+$any($event.target).value)})" class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                  <span class="w-8 text-right text-gray-500">{{ curveOf('accent')?.centerAngle ?? 0 }}°</span>
                </div>
                <label class="flex items-center gap-2 text-gray-600">
                  <input type="checkbox" [checked]="curveOf('accent')?.flip ?? false" (change)="updateCurve('accent', {flip: $any($event.target).checked})">
                  <span>Flip (inside arc — for bottom text)</span>
                </label>
              }
            </div>
          </details>
        </div>
      </div>

      <!-- Logo/Icon Control -->
      <div data-sel="icon" [class]="blockClass('icon')" (click)="store.selection.set({type: 'icon'})">
        <div class="flex justify-between items-center mb-2">
          <label class="text-xs font-medium text-gray-500">Logo</label>
          <input type="range" min="20" max="100"
            [ngModel]="store.badge().iconSettings?.size || 40"
            (ngModelChange)="updateSize('icon', $event)"
            class="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            aria-label="Icon size"
          >
        </div>
        <div class="flex gap-2">
          <input type="text"
            [ngModel]="store.badge().emoji"
            (ngModelChange)="store.update({emoji: $event, customLogo: undefined})"
            placeholder="Emoji"
            class="flex-1 text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 px-2 py-1 bg-white text-gray-900"
            aria-label="Icon emoji"
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
        <div class="flex items-center gap-2 mt-2">
          <div class="inline-flex rounded-md border border-gray-200 overflow-hidden text-xs">
            <button (click)="store.update({iconStyle: 'emoji'})"
              [class.bg-blue-100]="store.badge().iconStyle !== 'mono'"
              [class.text-blue-700]="store.badge().iconStyle !== 'mono'"
              class="px-2 py-1 bg-white text-gray-700"
              aria-label="Use color emoji"
            >Emoji</button>
            <button (click)="store.update({iconStyle: 'mono'})"
              [class.bg-blue-100]="store.badge().iconStyle === 'mono'"
              [class.text-blue-700]="store.badge().iconStyle === 'mono'"
              class="px-2 py-1 bg-white text-gray-700 border-l border-gray-200"
              aria-label="Use monochrome icon"
            >Mono</button>
          </div>
          @if (store.badge().iconStyle === 'mono') {
            <input type="color"
              [ngModel]="store.badge().iconColor"
              (ngModelChange)="store.update({iconColor: $event})"
              class="w-7 h-7 p-0 border border-gray-200 rounded bg-white cursor-pointer"
              aria-label="Icon color"
            >
          }
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
            <div [attr.data-sel]="'extraText:' + txt.id" [class]="blockClass('extraText:' + txt.id, 'sm')" (click)="store.selection.set({type: 'extraText', id: txt.id})">
              <div class="flex gap-2">
                <input type="text" [ngModel]="txt.text" (ngModelChange)="store.updateExtraText(txt.id, {text: $event})" class="flex-1 text-xs rounded border-gray-300 bg-white text-gray-900 px-1 py-0.5">
                <button (click)="$event.stopPropagation(); store.removeExtraText(txt.id)" class="text-red-500">×</button>
              </div>
              <div class="flex gap-2 items-center flex-wrap text-xs">
                <input type="color" [ngModel]="txt.color" (ngModelChange)="store.updateExtraText(txt.id, {color: $event})" class="w-5 h-5 p-0 border border-gray-200 rounded bg-white cursor-pointer" aria-label="Text color">
                <input type="range" min="8" max="40" [value]="txt.size" (input)="store.updateExtraText(txt.id, {size: +$any($event.target).value})" class="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" aria-label="Text size">
                <button (click)="store.updateExtraText(txt.id, {fontWeight: txt.fontWeight === 'bold' ? 'normal' : 'bold'})" [class.font-bold]="txt.fontWeight === 'bold'" class="text-xs w-5 h-5 flex items-center justify-center border rounded bg-white" aria-label="Toggle bold"><b>B</b></button>
                <button (click)="store.updateExtraText(txt.id, {fontStyle: txt.fontStyle === 'italic' ? 'normal' : 'italic'})" [class.italic]="txt.fontStyle === 'italic'" class="text-xs w-5 h-5 flex items-center justify-center border rounded bg-white" aria-label="Toggle italic"><i>I</i></button>
                <button (click)="store.updateExtraText(txt.id, {hasShadow: !txt.hasShadow})" class="text-xs w-5 h-5 flex items-center justify-center border rounded bg-white" [class.bg-blue-100]="txt.hasShadow" [class.text-blue-600]="txt.hasShadow" [class.border-blue-200]="txt.hasShadow" aria-label="Toggle shadow"><b>S</b></button>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-gray-500 w-8">Rot</span>
                <input type="range" min="0" max="360" [value]="txt.rotation || 0" (input)="store.updateExtraText(txt.id, {rotation: +$any($event.target).value})" class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" aria-label="Text rotation">
                <span class="text-[10px] text-gray-500 w-8 text-right">{{txt.rotation || 0}}°</span>
              </div>
              <details class="text-[11px]">
                <summary class="cursor-pointer text-gray-500">Curve along arc</summary>
                <div class="space-y-1 mt-1">
                  <label class="flex items-center gap-2 text-gray-600">
                    <input type="checkbox" [checked]="!!txt.curve && txt.curve.radius > 0" (change)="toggleCurveExtra(txt.id)">
                    <span>Enable</span>
                  </label>
                  @if (txt.curve && txt.curve.radius > 0) {
                    <div class="flex items-center gap-2">
                      <span class="w-10 text-gray-500">Radius</span>
                      <input type="range" min="20" max="95" [value]="txt.curve.radius" (input)="updateCurveExtra(txt.id, {radius: +$any($event.target).value})" class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                      <span class="w-8 text-right text-gray-500">{{ txt.curve.radius }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="w-10 text-gray-500">Angle</span>
                      <input type="range" min="0" max="360" [value]="txt.curve.centerAngle" (input)="updateCurveExtra(txt.id, {centerAngle: snapAngle(+$any($event.target).value)})" class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                      <span class="w-8 text-right text-gray-500">{{ txt.curve.centerAngle }}°</span>
                    </div>
                    <label class="flex items-center gap-2 text-gray-600">
                      <input type="checkbox" [checked]="txt.curve.flip" (change)="updateCurveExtra(txt.id, {flip: $any($event.target).checked})">
                      <span>Flip (inside arc — for bottom text)</span>
                    </label>
                  }
                </div>
              </details>
            </div>
          }
          @if (store.badge().extraTexts.length === 0) {
            <p class="text-[11px] text-gray-400">No extra texts yet.</p>
          }
        </div>
      </div>

      <!-- Seal Shapes -->
      <div class="space-y-3 border-t border-gray-100 pt-3">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-medium text-gray-500">Seal Shapes</h4>
          <button (click)="addSealCircle()" class="text-xs text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1">+ Ring</button>
        </div>
        @for (shape of store.badge().sealShapes; track shape.id) {
          <div [attr.data-sel]="'sealShape:' + shape.id" [class]="blockClass('sealShape:' + shape.id, 'sm')" (click)="store.selection.set({type: 'sealShape', id: shape.id})">
            <div class="flex items-center justify-between">
              <span class="text-gray-600 capitalize">{{ shape.kind }}</span>
              <button (click)="$event.stopPropagation(); store.removeSealShape(shape.id)" class="text-red-500" aria-label="Remove seal shape">×</button>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-12 text-gray-500">Radius</span>
              <input type="range" min="20" max="100" [value]="shape.radius" (input)="store.updateSealShape(shape.id, {radius: +$any($event.target).value})" class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
              <span class="w-8 text-right text-gray-500">{{ shape.radius }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-12 text-gray-500">Width</span>
              <input type="range" min="0.5" max="10" step="0.5" [value]="shape.strokeWidth" (input)="store.updateSealShape(shape.id, {strokeWidth: +$any($event.target).value})" class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
              <span class="w-8 text-right text-gray-500">{{ shape.strokeWidth }}</span>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="w-12 text-gray-500">Stroke</span>
              <input type="color" [ngModel]="shape.stroke" (ngModelChange)="store.updateSealShape(shape.id, {stroke: $event})" class="w-5 h-5 p-0 border border-gray-200 rounded bg-white cursor-pointer" aria-label="Stroke color">
              <select [ngModel]="shape.strokeStyle" (ngModelChange)="store.updateSealShape(shape.id, {strokeStyle: $event})" class="text-xs rounded border-gray-300 bg-white text-gray-900 px-1 py-0.5">
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-12 text-gray-500">Fill</span>
              @if (shape.fill === 'none') {
                <button (click)="store.updateSealShape(shape.id, {fill: '#FFFFFF'})" class="px-2 py-0.5 rounded border border-gray-200 bg-white text-gray-600">+ Fill</button>
              } @else {
                <input type="color" [ngModel]="shape.fill" (ngModelChange)="store.updateSealShape(shape.id, {fill: $event})" class="w-5 h-5 p-0 border border-gray-200 rounded bg-white cursor-pointer" aria-label="Fill color">
                <button (click)="store.updateSealShape(shape.id, {fill: 'none'})" class="text-gray-500 hover:text-gray-700">Clear</button>
              }
            </div>
            <div class="flex items-center gap-2">
              <span class="w-12 text-gray-500">Opacity</span>
              <input type="range" min="0" max="1" step="0.05" [value]="shape.strokeOpacity" (input)="store.updateSealShape(shape.id, {strokeOpacity: +$any($event.target).value})" class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
              <span class="w-10 text-right text-gray-500">{{ (shape.strokeOpacity * 100).toFixed(0) }}%</span>
            </div>
          </div>
        }
        @if (store.badge().sealShapes.length === 0) {
          <p class="text-[11px] text-gray-400">No rings yet. Use "+ Ring" to add a decorative seal.</p>
        }
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
                <div [attr.data-sel]="'decoration:' + deco.id" [class]="blockClass('decoration:' + deco.id, 'deco')" (click)="store.selection.set({type: 'decoration', id: deco.id})">
                  <div class="flex items-center justify-between">
                    <span class="capitalize">{{ deco.type }}</span>
                    <div class="flex items-center gap-2">
                      <input type="color" [ngModel]="deco.color || '#ffffff'" (ngModelChange)="store.updateDecoration(deco.id, {color: $event})" class="w-4 h-4 p-0 border-0 rounded cursor-pointer bg-white" aria-label="Decoration color">
                      <input type="range" min="10" max="60" [value]="deco.size" (input)="store.updateDecoration(deco.id, {size: +$any($event.target).value})" class="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" aria-label="Decoration size">
                      <button (click)="$event.stopPropagation(); store.removeDecoration(deco.id)" class="text-red-500 hover:text-red-700" aria-label="Remove decoration">×</button>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] text-gray-500 w-8">Rot</span>
                    <input type="range" min="0" max="360" [value]="deco.rotation || 0" (input)="store.updateDecoration(deco.id, {rotation: +$any($event.target).value})" class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" aria-label="Decoration rotation">
                    <span class="text-[10px] text-gray-500 w-8 text-right">{{deco.rotation || 0}}°</span>
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

  /** Key of the block currently flashing — drives the highlight ring class. */
  private readonly flashKey = signal<string | null>(null);
  private flashTimer: ReturnType<typeof setTimeout> | null = null;

  /** Scroll the panel block matching the current canvas selection into view,
   *  then flash it briefly so the user sees where their click landed. */
  private readonly selectionWatcher = effect(() => {
    const key = selectionKey(this.store.selection());
    if (!key || typeof document === 'undefined') return;
    // Defer until after Angular has rendered the latest state (a freshly
    // added decoration row won't exist in the DOM during the current tick).
    setTimeout(() => {
      // No CSS.escape — our keys are <type>:<uuid>, safe inside an attribute
      // selector's quoted value. CSS.escape adds `\:` which some browsers
      // resolve oddly inside `[attr="…"]`, breaking matches for decoration rows.
      const el = document.querySelector(`[data-sel="${key}"]`) as HTMLElement | null;
      if (!el) return;
      // `center` is more aggressive than `nearest` — it always scrolls both
      // the inner Layers list and the outer side panel even if the element
      // is barely visible.
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.flashKey.set(key);
      if (this.flashTimer) clearTimeout(this.flashTimer);
      this.flashTimer = setTimeout(() => this.flashKey.set(null), 1500);
    }, 0);
  });

  blockClass(key: string, size: keyof typeof BLOCK_BASE = 'default'): string {
    return this.flashKey() === key ? BLOCK_BASE[size] + HIGHLIGHT : BLOCK_BASE[size];
  }

  decorationTypes: {type: DecorationType, icon: string, label: string}[] = [
    { type: 'star', icon: '★', label: 'Star' },
    { type: 'heart', icon: '♥', label: 'Heart' },
    { type: 'crown', icon: '👑', label: 'Crown' },
    { type: 'check-mark', icon: '✓', label: 'Check' },
    { type: 'laurel-wreath', icon: '🏆', label: 'Laurel' },
    { type: 'ribbon-bow', icon: '🎀', label: 'Ribbon' },
    { type: 'wing', icon: '🪽', label: 'Wing' },
    { type: 'sparkles', icon: '✨', label: 'Sparkles' },
    { type: 'trophy', icon: '🏅', label: 'Trophy' },
    { type: 'medal', icon: '🥇', label: 'Medal' },
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

  /** Magnetic snap to multiples of 45° within a 3° threshold — soft detent feel. */
  snapAngle(value: number): number {
    const step = 45;
    const threshold = 3;
    const nearest = Math.round(value / step) * step;
    return Math.abs(value - nearest) <= threshold ? nearest : value;
  }

  isCurveOn(element: CurveTarget): boolean {
    const c = this.curveOf(element);
    return !!c && c.radius > 0;
  }

  curveOf(element: CurveTarget): CurveSettings | undefined {
    const settings = this.store.badge()[`${element}Settings` as const] as LayoutSettings | undefined;
    return settings?.curve;
  }

  toggleCurve(element: CurveTarget) {
    if (this.isCurveOn(element)) {
      this.store.updateElement(element, { curve: undefined });
    } else {
      this.store.updateElement(element, { curve: { ...DEFAULT_CURVE } });
    }
  }

  updateCurve(element: CurveTarget, partial: Partial<CurveSettings>) {
    const current = this.curveOf(element) ?? DEFAULT_CURVE;
    this.store.updateElement(element, { curve: { ...current, ...partial } });
  }

  toggleCurveExtra(id: string) {
    const txt = this.store.badge().extraTexts.find(t => t.id === id);
    if (!txt) return;
    if (txt.curve && txt.curve.radius > 0) {
      this.store.updateExtraText(id, { curve: undefined });
    } else {
      this.store.updateExtraText(id, { curve: { ...DEFAULT_CURVE } });
    }
  }

  updateCurveExtra(id: string, partial: Partial<CurveSettings>) {
    const txt = this.store.badge().extraTexts.find(t => t.id === id);
    const current = txt?.curve ?? DEFAULT_CURVE;
    this.store.updateExtraText(id, { curve: { ...current, ...partial } });
  }

  addSealCircle() {
    this.store.addSealShape({
      kind: 'circle',
      cx: 100,
      cy: 100,
      radius: 85,
      fill: 'none',
      stroke: '#FFFFFF',
      strokeWidth: 1,
      strokeStyle: 'dashed',
      strokeOpacity: 0.7
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
