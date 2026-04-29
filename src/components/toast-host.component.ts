import { Component, inject } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none" aria-live="polite" aria-atomic="true">
      @for (toast of toasts.toasts(); track toast.id) {
        <div
          class="pointer-events-auto px-4 py-2 rounded-lg shadow-lg text-sm font-medium border flex items-center gap-3 max-w-sm"
          [class.bg-white]="toast.variant === 'info'"
          [class.text-gray-800]="toast.variant === 'info'"
          [class.border-gray-200]="toast.variant === 'info'"
          [class.bg-emerald-50]="toast.variant === 'success'"
          [class.text-emerald-800]="toast.variant === 'success'"
          [class.border-emerald-200]="toast.variant === 'success'"
          [class.bg-red-50]="toast.variant === 'error'"
          [class.text-red-800]="toast.variant === 'error'"
          [class.border-red-200]="toast.variant === 'error'"
        >
          <span class="flex-1">{{ toast.message }}</span>
          <button
            (click)="toasts.dismiss(toast.id)"
            class="opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >×</button>
        </div>
      }
    </div>
  `
})
export class ToastHostComponent {
  toasts = inject(ToastService);
}
