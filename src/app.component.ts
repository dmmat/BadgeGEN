import { Component, inject, OnInit } from '@angular/core';
import { BadgePreviewComponent } from './components/badge-preview.component';
import { BadgeControlsComponent } from './components/badge-controls.component';
import { BadgeStore } from './services/badge.store';

@Component({
  selector: 'app-root',
  imports: [BadgePreviewComponent, BadgeControlsComponent],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  store = inject(BadgeStore);

  ngOnInit() {
    // Check for shared state in hash
    const hash = window.location.hash.slice(1);
    if (hash) {
      this.store.loadState(hash);
    }
  }

  copyShareLink() {
    const hash = this.store.serializeState();
    // Use the full URL and ensure we replace any existing hash
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;
    
    // Update the browser URL bar so the user can also manually copy
    window.history.pushState(null, '', url);
    
    navigator.clipboard.writeText(url).then(() => {
      alert('Share link copied to clipboard!');
    }).catch(err => {
       console.error('Could not copy text: ', err);
       alert('Could not copy to clipboard. The link is now in your address bar.');
    });
  }
}