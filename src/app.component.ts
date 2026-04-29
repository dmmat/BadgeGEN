import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { BadgePreviewComponent } from './components/badge-preview.component';
import { BadgeMainControlsComponent } from './components/badge-main-controls.component';
import { BadgeExtrasComponent } from './components/badge-extras.component';
import { ToastHostComponent } from './components/toast-host.component';
import { BadgeStore } from './services/badge.store';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  imports: [BadgePreviewComponent, BadgeMainControlsComponent, BadgeExtrasComponent, ToastHostComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
  store = inject(BadgeStore);
  private toast = inject(ToastService);
  private readonly onHashChange = () => this.applyHashState();

  ngOnInit() {
    this.applyHashState();
    window.addEventListener('hashchange', this.onHashChange);
    window.addEventListener('popstate', this.onHashChange);
  }

  ngOnDestroy() {
    window.removeEventListener('hashchange', this.onHashChange);
    window.removeEventListener('popstate', this.onHashChange);
  }

  copyShareLink() {
    const hash = this.store.serializeState();
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;

    // Replace (not push) so the back button doesn't fill up with share entries
    window.history.replaceState(null, '', url);

    if (!navigator.clipboard) {
      this.toast.show('Link is in the address bar — copy from there.');
      return;
    }

    navigator.clipboard.writeText(url).then(
      () => this.toast.success('Share link copied to clipboard'),
      err => {
        console.error('Could not copy text:', err);
        this.toast.error('Could not copy. Link is in the address bar.');
      }
    );
  }

  private applyHashState() {
    const hash = window.location.hash.slice(1);
    if (hash) {
      this.store.loadState(hash);
    }
  }
}