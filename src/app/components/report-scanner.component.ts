import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportImportService, ReportData, ImportResult } from '../services/report-import.service';
import { ReportValidationService, ValidationResult, ValidationIssue, ValidationSummary } from '../services/report-validation.service';

@Component({
  selector: 'app-report-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="report-scanner-container">
      <header class="scanner-header">
        <h1>
          <i class="icon-scanner"></i>
          Report Scanner & Validator
        </h1>
        <p>Import your reports and scan for missing or incorrect data</p>
      </header>

      <!-- File Upload Section -->
      <section class="upload-section" *ngIf="!reportData">
        <div class="upload-area" 
             [class.dragover]="isDragOver"
             (dragover)="onDragOver($event)"
             (dragleave)="onDragLeave($event)"
             (drop)="onDrop($event)"
             (click)="fileInput.click()">
          
          <div class="upload-content">
            <i class="icon-upload"></i>
            <h3>Drop your report file here or click to browse</h3>
            <p>Supported formats: CSV, JSON, TXT, TSV</p>
            <p class="file-limit">Maximum file size: 10MB</p>
          </div>
          
          <input #fileInput 
                 type="file" 
                 accept=".csv,.json,.txt,.tsv" 
                 (change)="onFileSelected($event)"
                 style="display: none;">
        </div>

        <!-- Import Progress -->
        <div class="progress-section" *ngIf="importProgress > 0">
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="importProgress"></div>
          </div>
          <p>Importing report... {{importProgress}}%</p>
        </div>
      </section>

      <!-- Report Overview -->
      <section class="report-overview" *ngIf="reportData && !validationResult">
        <div class="overview-card">
          <h2>Report Overview</h2>
          <div class="overview-stats">
            <div class="stat">
              <span class="stat-value">{{reportData.fileName}}</span>
              <span class="stat-label">File Name</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{reportData.fileType}}</span>
              <span class="stat-label">File Type</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{reportData.totalRows}}</span>
              <span class="stat-label">Rows</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{reportData.totalColumns}}</span>
              <span class="stat-label">Columns</span>
            </div>
          </div>
          
          <div class="action-buttons">
            <button class="btn btn-primary" (click)="scanReport()" [disabled]="isScanning">
              <i class="icon-scan"></i>
              {{isScanning ? 'Scanning...' : 'Scan Report'}}
            </button>
            <button class="btn btn-secondary" (click)="previewData()">
              <i class="icon-preview"></i>
              Preview Data
            </button>
            <button class="btn btn-secondary" (click)="resetScanner()">
              <i class="icon-reset"></i>
              Upload New File
            </button>
          </div>
        </div>

        <!-- Scan Progress -->
        <div class="progress-section" *ngIf="scanProgress > 0">
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="scanProgress"></div>
          </div>
          <p>Scanning report for issues... {{scanProgress}}%</p>
        </div>
      </section>

      <!-- Validation Results -->
      <section class="validation-results" *ngIf="validationResult">
        <div class="results-header">
          <h2>Validation Results</h2>
          <div class="results-actions">
            <button class="btn btn-secondary" (click)="previewData()">
              <i class="icon-preview"></i>
              Preview Data
            </button>
            <button class="btn btn-secondary" (click)="exportResults()">
              <i class="icon-export"></i>
              Export Results
            </button>
            <button class="btn btn-secondary" (click)="resetScanner()">
              <i class="icon-reset"></i>
              Scan New File
            </button>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="summary-cards">
          <div class="summary-card" [class.success]="validationResult.isValid" [class.error]="!validationResult.isValid">
            <div class="card-icon">
              <i [class]="validationResult.isValid ? 'icon-check' : 'icon-warning'"></i>
            </div>
            <div class="card-content">
              <h3>{{validationResult.isValid ? 'Report Valid' : 'Issues Found'}}</h3>
              <p>{{validationResult.isValid ? 'No critical errors detected' : validationResult.summary.totalIssues + ' issues found'}}</p>
            </div>
          </div>

          <div class="summary-card">
            <div class="card-icon">
              <i class="icon-quality"></i>
            </div>
            <div class="card-content">
              <h3>Data Quality Score</h3>
              <p class="quality-score" [class.high]="validationResult.summary.dataQualityScore >= 80" 
                                        [class.medium]="validationResult.summary.dataQualityScore >= 60 && validationResult.summary.dataQualityScore < 80"
                                        [class.low]="validationResult.summary.dataQualityScore < 60">
                {{validationResult.summary.dataQualityScore}}%
              </p>
            </div>
          </div>

          <div class="summary-card">
            <div class="card-icon">
              <i class="icon-completion"></i>
            </div>
            <div class="card-content">
              <h3>Data Completion</h3>
              <p>{{validationResult.summary.completionPercentage}}%</p>
            </div>
          </div>

          <div class="summary-card">
            <div class="card-icon">
              <i class="icon-rows"></i>
            </div>
            <div class="card-content">
              <h3>Valid Rows</h3>
              <p>{{validationResult.summary.validRows}} / {{validationResult.summary.totalRows}}</p>
            </div>
          </div>
        </div>

        <!-- Issue Breakdown -->
        <div class="issue-breakdown">
          <h3>Issue Breakdown</h3>
          <div class="breakdown-stats">
            <div class="breakdown-item error" *ngIf="validationResult.summary.errorCount > 0">
              <span class="count">{{validationResult.summary.errorCount}}</span>
              <span class="label">Errors</span>
            </div>
            <div class="breakdown-item warning" *ngIf="validationResult.summary.warningCount > 0">
              <span class="count">{{validationResult.summary.warningCount}}</span>
              <span class="label">Warnings</span>
            </div>
            <div class="breakdown-item info" *ngIf="validationResult.summary.infoCount > 0">
              <span class="count">{{validationResult.summary.infoCount}}</span>
              <span class="label">Info</span>
            </div>
          </div>
        </div>

        <!-- Issues List -->
        <div class="issues-list" *ngIf="validationResult.issues.length > 0">
          <div class="list-header">
            <h3>Detailed Issues ({{displayedIssues.length}} of {{validationResult.issues.length}})</h3>
            <div class="list-controls">
              <select [(ngModel)]="selectedSeverityFilter" (change)="filterIssues()">
                <option value="">All Severities</option>
                <option value="error">Errors Only</option>
                <option value="warning">Warnings Only</option>
                <option value="info">Info Only</option>
              </select>
              <button class="btn btn-small" (click)="toggleShowAll()">
                {{showAllIssues ? 'Show Less' : 'Show All'}}
              </button>
            </div>
          </div>

          <div class="issues-container">
            <div class="issue-item" 
                 *ngFor="let issue of displayedIssues; trackBy: trackIssue"
                 [class]="issue.severity">
              <div class="issue-header">
                <div class="issue-severity">
                  <i [class]="getSeverityIcon(issue.severity)"></i>
                  <span>{{issue.severity.toUpperCase()}}</span>
                </div>
                <div class="issue-location">
                  Row {{issue.row}}, Column "{{issue.column}}"
                </div>
              </div>
              <div class="issue-content">
                <h4>{{issue.message}}</h4>
                <p *ngIf="issue.description">{{issue.description}}</p>
                <div class="issue-details">
                  <div class="detail-item" *ngIf="issue.currentValue !== null && issue.currentValue !== undefined">
                    <strong>Current Value:</strong> 
                    <span class="value">{{formatValue(issue.currentValue)}}</span>
                  </div>
                  <div class="detail-item" *ngIf="issue.suggestedValue">
                    <strong>Suggested:</strong> 
                    <span class="value suggested">{{issue.suggestedValue}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Issues Message -->
        <div class="no-issues" *ngIf="validationResult.issues.length === 0">
          <i class="icon-success"></i>
          <h3>Excellent! No issues found</h3>
          <p>Your report data appears to be clean and properly formatted.</p>
        </div>
      </section>

      <!-- Data Preview Modal -->
      <div class="modal-overlay" *ngIf="showPreview" (click)="closePreview()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Data Preview</h3>
            <button class="btn-close" (click)="closePreview()">×</button>
          </div>
          <div class="modal-body">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th *ngFor="let header of reportData?.headers">{{header}}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let row of getPreviewRows(); let i = index">
                    <td *ngFor="let cell of row; let j = index" 
                        [class.has-issue]="hasIssueAtPosition(i, j)"
                        [title]="getIssueTooltip(i, j)">
                      {{formatValue(cell)}}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="preview-note">
              Showing first {{Math.min(20, reportData?.totalRows || 0)}} rows. 
              Highlighted cells indicate potential issues.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .report-scanner-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .scanner-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .scanner-header h1 {
      color: #2c3e50;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .scanner-header p {
      color: #7f8c8d;
      font-size: 18px;
    }

    /* Upload Section */
    .upload-section {
      margin-bottom: 40px;
    }

    .upload-area {
      border: 2px dashed #3498db;
      border-radius: 12px;
      padding: 60px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #f8f9fa;
    }

    .upload-area:hover,
    .upload-area.dragover {
      border-color: #2980b9;
      background: #e3f2fd;
    }

    .upload-content h3 {
      color: #2c3e50;
      margin: 20px 0 10px;
    }

    .upload-content p {
      color: #7f8c8d;
      margin: 5px 0;
    }

    .file-limit {
      font-size: 12px;
      color: #95a5a6;
    }

    /* Progress Bar */
    .progress-section {
      margin: 20px 0;
      text-align: center;
    }

    .progress-bar {
      width: 100%;
      height: 6px;
      background: #ecf0f1;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 10px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(45deg, #3498db, #2980b9);
      transition: width 0.3s ease;
    }

    /* Report Overview */
    .overview-card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .overview-card h2 {
      color: #2c3e50;
      margin-bottom: 20px;
    }

    .overview-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat {
      text-align: center;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .stat-value {
      display: block;
      font-size: 24px;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 5px;
    }

    .stat-label {
      color: #7f8c8d;
      font-size: 14px;
    }

    /* Buttons */
    .action-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      text-decoration: none;
    }

    .btn-primary {
      background: #3498db;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2980b9;
    }

    .btn-secondary {
      background: #95a5a6;
      color: white;
    }

    .btn-secondary:hover {
      background: #7f8c8d;
    }

    .btn-small {
      padding: 8px 16px;
      font-size: 14px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Validation Results */
    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .results-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    /* Summary Cards */
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .summary-card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .summary-card.success {
      border-left: 4px solid #27ae60;
    }

    .summary-card.error {
      border-left: 4px solid #e74c3c;
    }

    .card-icon {
      font-size: 32px;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #f8f9fa;
    }

    .card-content h3 {
      margin: 0 0 5px 0;
      color: #2c3e50;
    }

    .card-content p {
      margin: 0;
      color: #7f8c8d;
    }

    .quality-score {
      font-size: 24px;
      font-weight: bold;
    }

    .quality-score.high { color: #27ae60; }
    .quality-score.medium { color: #f39c12; }
    .quality-score.low { color: #e74c3c; }

    /* Issue Breakdown */
    .issue-breakdown {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .breakdown-stats {
      display: flex;
      gap: 30px;
      margin-top: 15px;
      flex-wrap: wrap;
    }

    .breakdown-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 15px;
      border-radius: 8px;
      min-width: 80px;
    }

    .breakdown-item.error {
      background: #fdedec;
      color: #c0392b;
    }

    .breakdown-item.warning {
      background: #fef9e7;
      color: #d68910;
    }

    .breakdown-item.info {
      background: #eaf2f8;
      color: #2471a3;
    }

    .breakdown-item .count {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .breakdown-item .label {
      font-size: 12px;
      text-transform: uppercase;
    }

    /* Issues List */
    .issues-list {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 15px;
    }

    .list-controls {
      display: flex;
      gap: 15px;
      align-items: center;
      flex-wrap: wrap;
    }

    .list-controls select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: white;
    }

    .issues-container {
      max-height: 600px;
      overflow-y: auto;
    }

    .issue-item {
      border: 1px solid #ecf0f1;
      border-radius: 8px;
      margin-bottom: 15px;
      padding: 20px;
      transition: all 0.3s ease;
    }

    .issue-item:hover {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .issue-item.error {
      border-left: 4px solid #e74c3c;
      background: #fdfdfd;
    }

    .issue-item.warning {
      border-left: 4px solid #f39c12;
      background: #fdfdfd;
    }

    .issue-item.info {
      border-left: 4px solid #3498db;
      background: #fdfdfd;
    }

    .issue-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .issue-severity {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 12px;
    }

    .issue-severity.error { color: #e74c3c; }
    .issue-severity.warning { color: #f39c12; }
    .issue-severity.info { color: #3498db; }

    .issue-location {
      color: #7f8c8d;
      font-size: 14px;
    }

    .issue-content h4 {
      margin: 0 0 10px 0;
      color: #2c3e50;
    }

    .issue-content p {
      margin: 0 0 15px 0;
      color: #7f8c8d;
    }

    .issue-details {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .detail-item {
      font-size: 14px;
    }

    .detail-item strong {
      color: #2c3e50;
    }

    .value {
      padding: 2px 6px;
      background: #f8f9fa;
      border-radius: 4px;
      font-family: monospace;
    }

    .value.suggested {
      background: #d5f4e6;
      color: #27ae60;
    }

    /* No Issues */
    .no-issues {
      text-align: center;
      padding: 60px 20px;
      color: #27ae60;
    }

    .no-issues i {
      font-size: 64px;
      margin-bottom: 20px;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      max-width: 90vw;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 25px;
      border-bottom: 1px solid #ecf0f1;
    }

    .modal-header h3 {
      margin: 0;
      color: #2c3e50;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #7f8c8d;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-close:hover {
      color: #2c3e50;
    }

    .modal-body {
      padding: 25px;
      overflow: auto;
      max-height: 70vh;
    }

    /* Data Table */
    .table-container {
      overflow: auto;
      max-height: 400px;
      border: 1px solid #ecf0f1;
      border-radius: 8px;
      margin-bottom: 15px;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .data-table th,
    .data-table td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #ecf0f1;
      border-right: 1px solid #ecf0f1;
    }

    .data-table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #2c3e50;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .data-table td.has-issue {
      background: #fdedec;
      position: relative;
    }

    .data-table td.has-issue::after {
      content: "⚠";
      position: absolute;
      top: 2px;
      right: 2px;
      color: #e74c3c;
      font-size: 10px;
    }

    .preview-note {
      color: #7f8c8d;
      font-size: 14px;
      text-align: center;
      margin: 0;
    }

    /* Icons (using CSS shapes as fallback) */
    .icon-scanner::before { content: "🔍"; }
    .icon-upload::before { content: "📤"; }
    .icon-scan::before { content: "🔎"; }
    .icon-preview::before { content: "👁"; }
    .icon-reset::before { content: "🔄"; }
    .icon-export::before { content: "💾"; }
    .icon-check::before { content: "✅"; }
    .icon-warning::before { content: "⚠️"; }
    .icon-quality::before { content: "⭐"; }
    .icon-completion::before { content: "📊"; }
    .icon-rows::before { content: "📋"; }
    .icon-success::before { content: "🎉"; }

    /* Responsive Design */
    @media (max-width: 768px) {
      .report-scanner-container {
        padding: 10px;
      }
      
      .overview-stats {
        grid-template-columns: 1fr;
      }
      
      .summary-cards {
        grid-template-columns: 1fr;
      }
      
      .action-buttons,
      .results-actions {
        flex-direction: column;
      }
      
      .btn {
        width: 100%;
        justify-content: center;
      }
      
      .breakdown-stats {
        justify-content: center;
      }
      
      .issue-header {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .modal-content {
        max-width: 95vw;
      }
    }
  `]
})
export class ReportScannerComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // State
  reportData: ReportData | null = null;
  validationResult: ValidationResult | null = null;
  isDragOver = false;
  isScanning = false;
  showPreview = false;
  importProgress = 0;
  scanProgress = 0;

  // Filtering
  selectedSeverityFilter = '';
  showAllIssues = false;
  displayedIssues: ValidationIssue[] = [];

  constructor(
    private importService: ReportImportService,
    private validationService: ReportValidationService
  ) {
    // Subscribe to progress updates
    this.importService.importProgress$.subscribe(progress => {
      this.importProgress = progress;
    });

    this.validationService.validationProgress$.subscribe(progress => {
      this.scanProgress = progress;
    });
  }

  // File Upload Handlers
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  async processFile(file: File) {
    try {
      const result = await this.importService.importReport(file);
      
      if (result.success && result.data) {
        this.reportData = result.data;
        this.validationResult = null;
      } else {
        alert('Failed to import file:\\n' + result.errors.map(e => e.message).join('\\n'));
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert('An error occurred while processing the file.');
    }
  }

  // Scanning
  async scanReport() {
    if (!this.reportData) return;

    this.isScanning = true;
    try {
      this.validationResult = await this.validationService.validateReport(this.reportData);
      this.filterIssues();
    } catch (error) {
      console.error('Error scanning report:', error);
      alert('An error occurred while scanning the report.');
    } finally {
      this.isScanning = false;
    }
  }

  // Filtering and Display
  filterIssues() {
    if (!this.validationResult) return;

    let filtered = this.validationResult.issues;

    if (this.selectedSeverityFilter) {
      filtered = filtered.filter(issue => issue.severity === this.selectedSeverityFilter);
    }

    this.displayedIssues = this.showAllIssues ? filtered : filtered.slice(0, 10);
  }

  toggleShowAll() {
    this.showAllIssues = !this.showAllIssues;
    this.filterIssues();
  }

  trackIssue(index: number, issue: ValidationIssue): string {
    return issue.id;
  }

  getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'error': return 'icon-warning';
      case 'warning': return 'icon-warning';
      case 'info': return 'icon-info';
      default: return 'icon-info';
    }
  }

  formatValue(value: any): string {
    if (value === null || value === undefined) return '(empty)';
    if (typeof value === 'string' && value.trim() === '') return '(empty)';
    return String(value);
  }

  // Preview Functions
  previewData() {
    this.showPreview = true;
  }

  closePreview() {
    this.showPreview = false;
  }

  getPreviewRows() {
    return this.reportData?.rows.slice(0, 20) || [];
  }

  hasIssueAtPosition(row: number, col: number): boolean {
    if (!this.validationResult) return false;
    return this.validationResult.issues.some(issue => 
      issue.row === row + 1 && issue.columnIndex === col
    );
  }

  getIssueTooltip(row: number, col: number): string {
    if (!this.validationResult) return '';
    const issue = this.validationResult.issues.find(issue => 
      issue.row === row + 1 && issue.columnIndex === col
    );
    return issue ? issue.message : '';
  }

  // Export and Reset
  exportResults() {
    if (!this.validationResult || !this.reportData) return;

    const exportData = {
      fileName: this.reportData.fileName,
      summary: this.validationResult.summary,
      issues: this.validationResult.issues,
      processedAt: this.validationResult.processedAt
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation-report-${this.reportData.fileName}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  resetScanner() {
    this.reportData = null;
    this.validationResult = null;
    this.showPreview = false;
    this.selectedSeverityFilter = '';
    this.showAllIssues = false;
    this.displayedIssues = [];
    
    // Reset file input
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Utility
  Math = Math;
}