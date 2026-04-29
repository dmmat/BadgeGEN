import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BadgeStore } from '../services/badge.store';
import { BADGE_TEMPLATES, BadgeTemplate } from '../services/badge-templates';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-badge-templates',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-2">
      <p class="text-[11px] uppercase tracking-wide text-gray-400">Templates</p>
      <div class="grid grid-cols-3 gap-2">
        @for (tpl of templates; track tpl.id) {
          <button
            (click)="apply(tpl)"
            class="flex flex-col items-center justify-center gap-1 p-2 rounded-lg border border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-700"
            [title]="tpl.label"
            [attr.aria-label]="'Apply template ' + tpl.label"
          >
            <span
              class="w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-inner"
              [style.background]="gradientFor(tpl)"
              [style.color]="tpl.design.textColor || '#fff'"
            >{{ tpl.preview }}</span>
            <span class="text-[10px] leading-tight text-center">{{ tpl.label }}</span>
          </button>
        }
      </div>
    </div>
  `
})
export class BadgeTemplatesComponent {
  private store = inject(BadgeStore);
  private toast = inject(ToastService);
  templates = BADGE_TEMPLATES;

  apply(tpl: BadgeTemplate) {
    this.store.applyTemplate(tpl.design);
    this.toast.success(`Applied "${tpl.label}"`);
  }

  gradientFor(tpl: BadgeTemplate): string {
    const a = tpl.design.primaryColor || '#3B82F6';
    const b = tpl.design.secondaryColor || '#1E40AF';
    return `linear-gradient(135deg, ${a}, ${b})`;
  }
}
