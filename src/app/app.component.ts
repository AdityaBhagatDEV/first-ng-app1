import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReportScannerComponent } from './components/report-scanner.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ReportScannerComponent],
  template: `
    <app-report-scanner></app-report-scanner>
    <router-outlet />
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
  `],
})
export class AppComponent {
  title = 'Report Scanner';
}
