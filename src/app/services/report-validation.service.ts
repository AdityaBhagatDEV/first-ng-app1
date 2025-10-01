import { Injectable } from '@angular/core';
import { ReportData } from './report-import.service';
import { BehaviorSubject } from 'rxjs';

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  type: 'required' | 'datatype' | 'format' | 'range' | 'custom';
  column?: string;
  severity: 'error' | 'warning' | 'info';
  enabled: boolean;
  parameters?: { [key: string]: any };
}

export interface ValidationIssue {
  id: string;
  ruleId: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  row: number;
  column: string;
  columnIndex: number;
  currentValue: any;
  suggestedValue?: any;
  description?: string;
}

export interface ValidationSummary {
  totalRows: number;
  totalColumns: number;
  totalIssues: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  validRows: number;
  invalidRows: number;
  completionPercentage: number;
  dataQualityScore: number;
}

export interface ValidationResult {
  summary: ValidationSummary;
  issues: ValidationIssue[];
  isValid: boolean;
  processedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ReportValidationService {
  private validationProgressSubject = new BehaviorSubject<number>(0);
  public validationProgress$ = this.validationProgressSubject.asObservable();

  private defaultRules: ValidationRule[] = [
    {
      id: 'empty-cells',
      name: 'Empty Cells Check',
      description: 'Identifies empty or null cells that should contain data',
      type: 'required',
      severity: 'warning',
      enabled: true
    },
    {
      id: 'numeric-format',
      name: 'Numeric Format Validation',
      description: 'Ensures numeric columns contain valid numbers',
      type: 'datatype',
      severity: 'error',
      enabled: true
    },
    {
      id: 'email-format',
      name: 'Email Format Validation',
      description: 'Validates email address format',
      type: 'format',
      severity: 'error',
      enabled: true
    },
    {
      id: 'date-format',
      name: 'Date Format Validation',
      description: 'Validates date format and values',
      type: 'format',
      severity: 'error',
      enabled: true
    },
    {
      id: 'duplicate-rows',
      name: 'Duplicate Rows Check',
      description: 'Identifies duplicate rows in the dataset',
      type: 'custom',
      severity: 'warning',
      enabled: true
    },
    {
      id: 'data-consistency',
      name: 'Data Consistency Check',
      description: 'Checks for inconsistent data patterns',
      type: 'custom',
      severity: 'info',
      enabled: true
    },
    {
      id: 'length-validation',
      name: 'Text Length Validation',
      description: 'Validates text field lengths',
      type: 'range',
      severity: 'warning',
      enabled: true,
      parameters: { minLength: 1, maxLength: 255 }
    }
  ];

  constructor() {}

  /**
   * Validate report data against predefined rules
   */
  async validateReport(data: ReportData, customRules?: ValidationRule[]): Promise<ValidationResult> {
    this.validationProgressSubject.next(0);
    
    const rules = customRules || this.defaultRules.filter(rule => rule.enabled);
    const issues: ValidationIssue[] = [];
    let processedRules = 0;

    // Run validation rules
    for (const rule of rules) {
      const ruleIssues = await this.executeValidationRule(rule, data);
      issues.push(...ruleIssues);
      
      processedRules++;
      this.validationProgressSubject.next((processedRules / rules.length) * 80);
    }

    this.validationProgressSubject.next(90);

    // Calculate summary
    const summary = this.calculateValidationSummary(data, issues);
    
    this.validationProgressSubject.next(100);

    const result: ValidationResult = {
      summary,
      issues: issues.sort((a, b) => {
        // Sort by severity first, then by row
        const severityOrder = { error: 0, warning: 1, info: 2 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[a.severity] - severityOrder[b.severity];
        }
        return a.row - b.row;
      }),
      isValid: summary.errorCount === 0,
      processedAt: new Date()
    };

    // Reset progress after delay
    setTimeout(() => this.validationProgressSubject.next(0), 1000);

    return result;
  }

  private async executeValidationRule(rule: ValidationRule, data: ReportData): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    switch (rule.type) {
      case 'required':
        issues.push(...this.checkRequiredFields(rule, data));
        break;
      case 'datatype':
        issues.push(...this.checkDataTypes(rule, data));
        break;
      case 'format':
        issues.push(...this.checkFormats(rule, data));
        break;
      case 'range':
        issues.push(...this.checkRanges(rule, data));
        break;
      case 'custom':
        issues.push(...this.checkCustomRules(rule, data));
        break;
    }

    return issues;
  }

  private checkRequiredFields(rule: ValidationRule, data: ReportData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    data.rows.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === null || cell === undefined || cell === '') {
          issues.push({
            id: `${rule.id}-${rowIndex}-${colIndex}`,
            ruleId: rule.id,
            severity: rule.severity,
            message: `Empty cell found in column "${data.headers[colIndex]}"`,
            row: rowIndex + 1,
            column: data.headers[colIndex],
            columnIndex: colIndex,
            currentValue: cell,
            description: 'This cell appears to be empty but may require data'
          });
        }
      });
    });

    return issues;
  }

  private checkDataTypes(rule: ValidationRule, data: ReportData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    data.rows.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const columnName = data.headers[colIndex].toLowerCase();
        
        // Check for numeric columns
        if (this.isNumericColumn(columnName) && cell !== null && cell !== '') {
          if (typeof cell !== 'number' && isNaN(Number(cell))) {
            issues.push({
              id: `${rule.id}-numeric-${rowIndex}-${colIndex}`,
              ruleId: rule.id,
              severity: rule.severity,
              message: `Invalid numeric value in column "${data.headers[colIndex]}"`,
              row: rowIndex + 1,
              column: data.headers[colIndex],
              columnIndex: colIndex,
              currentValue: cell,
              description: 'Expected a numeric value but found text or invalid format'
            });
          }
        }

        // Check for boolean columns
        if (this.isBooleanColumn(columnName) && cell !== null && cell !== '') {
          if (typeof cell !== 'boolean' && 
              !['true', 'false', '1', '0', 'yes', 'no'].includes(String(cell).toLowerCase())) {
            issues.push({
              id: `${rule.id}-boolean-${rowIndex}-${colIndex}`,
              ruleId: rule.id,
              severity: rule.severity,
              message: `Invalid boolean value in column "${data.headers[colIndex]}"`,
              row: rowIndex + 1,
              column: data.headers[colIndex],
              columnIndex: colIndex,
              currentValue: cell,
              suggestedValue: 'true/false, yes/no, or 1/0',
              description: 'Expected a boolean value'
            });
          }
        }
      });
    });

    return issues;
  }

  private checkFormats(rule: ValidationRule, data: ReportData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    data.rows.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === null || cell === '') return;
        
        const columnName = data.headers[colIndex].toLowerCase();
        const cellValue = String(cell);

        // Email validation
        if (this.isEmailColumn(columnName)) {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(cellValue)) {
            issues.push({
              id: `${rule.id}-email-${rowIndex}-${colIndex}`,
              ruleId: rule.id,
              severity: rule.severity,
              message: `Invalid email format in column "${data.headers[colIndex]}"`,
              row: rowIndex + 1,
              column: data.headers[colIndex],
              columnIndex: colIndex,
              currentValue: cell,
              description: 'Email format should be: user@domain.com'
            });
          }
        }

        // Date validation
        if (this.isDateColumn(columnName)) {
          const date = new Date(cellValue);
          if (isNaN(date.getTime())) {
            issues.push({
              id: `${rule.id}-date-${rowIndex}-${colIndex}`,
              ruleId: rule.id,
              severity: rule.severity,
              message: `Invalid date format in column "${data.headers[colIndex]}"`,
              row: rowIndex + 1,
              column: data.headers[colIndex],
              columnIndex: colIndex,
              currentValue: cell,
              description: 'Date should be in a valid format (YYYY-MM-DD, MM/DD/YYYY, etc.)'
            });
          }
        }

        // Phone validation
        if (this.isPhoneColumn(columnName)) {
          const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
          const cleanPhone = cellValue.replace(/[\s\-\(\)]/g, '');
          if (!phonePattern.test(cleanPhone)) {
            issues.push({
              id: `${rule.id}-phone-${rowIndex}-${colIndex}`,
              ruleId: rule.id,
              severity: rule.severity,
              message: `Invalid phone format in column "${data.headers[colIndex]}"`,
              row: rowIndex + 1,
              column: data.headers[colIndex],
              columnIndex: colIndex,
              currentValue: cell,
              description: 'Phone number should contain only digits and common separators'
            });
          }
        }
      });
    });

    return issues;
  }

  private checkRanges(rule: ValidationRule, data: ReportData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const params = rule.parameters || {};

    data.rows.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === null || cell === '') return;
        
        const cellValue = String(cell);

        // Text length validation
        if (params['minLength'] && cellValue.length < params['minLength']) {
          issues.push({
            id: `${rule.id}-minlength-${rowIndex}-${colIndex}`,
            ruleId: rule.id,
            severity: rule.severity,
            message: `Text too short in column "${data.headers[colIndex]}" (minimum ${params['minLength']} characters)`,
            row: rowIndex + 1,
            column: data.headers[colIndex],
            columnIndex: colIndex,
            currentValue: cell,
            description: `Current length: ${cellValue.length}, required minimum: ${params['minLength']}`
          });
        }

        if (params['maxLength'] && cellValue.length > params['maxLength']) {
          issues.push({
            id: `${rule.id}-maxlength-${rowIndex}-${colIndex}`,
            ruleId: rule.id,
            severity: rule.severity,
            message: `Text too long in column "${data.headers[colIndex]}" (maximum ${params['maxLength']} characters)`,
            row: rowIndex + 1,
            column: data.headers[colIndex],
            columnIndex: colIndex,
            currentValue: cell,
            description: `Current length: ${cellValue.length}, maximum allowed: ${params['maxLength']}`
          });
        }

        // Numeric range validation
        if (typeof cell === 'number') {
          if (params['minValue'] && cell < params['minValue']) {
            issues.push({
              id: `${rule.id}-minvalue-${rowIndex}-${colIndex}`,
              ruleId: rule.id,
              severity: rule.severity,
              message: `Value too small in column "${data.headers[colIndex]}" (minimum ${params['minValue']})`,
              row: rowIndex + 1,
              column: data.headers[colIndex],
              columnIndex: colIndex,
              currentValue: cell,
              description: `Current value: ${cell}, required minimum: ${params['minValue']}`
            });
          }

          if (params['maxValue'] && cell > params['maxValue']) {
            issues.push({
              id: `${rule.id}-maxvalue-${rowIndex}-${colIndex}`,
              ruleId: rule.id,
              severity: rule.severity,
              message: `Value too large in column "${data.headers[colIndex]}" (maximum ${params['maxValue']})`,
              row: rowIndex + 1,
              column: data.headers[colIndex],
              columnIndex: colIndex,
              currentValue: cell,
              description: `Current value: ${cell}, maximum allowed: ${params['maxValue']}`
            });
          }
        }
      });
    });

    return issues;
  }

  private checkCustomRules(rule: ValidationRule, data: ReportData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    switch (rule.id) {
      case 'duplicate-rows':
        issues.push(...this.findDuplicateRows(rule, data));
        break;
      case 'data-consistency':
        issues.push(...this.checkDataConsistency(rule, data));
        break;
    }

    return issues;
  }

  private findDuplicateRows(rule: ValidationRule, data: ReportData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const rowHashes = new Map<string, number[]>();

    // Create hash for each row and track duplicates
    data.rows.forEach((row, rowIndex) => {
      const rowHash = JSON.stringify(row);
      if (!rowHashes.has(rowHash)) {
        rowHashes.set(rowHash, []);
      }
      rowHashes.get(rowHash)!.push(rowIndex);
    });

    // Find duplicates
    rowHashes.forEach((rowIndices, rowHash) => {
      if (rowIndices.length > 1) {
        rowIndices.forEach((rowIndex, duplicateIndex) => {
          if (duplicateIndex > 0) { // Skip the first occurrence
            issues.push({
              id: `${rule.id}-${rowIndex}`,
              ruleId: rule.id,
              severity: rule.severity,
              message: `Duplicate row found (first occurrence at row ${rowIndices[0] + 1})`,
              row: rowIndex + 1,
              column: 'All Columns',
              columnIndex: -1,
              currentValue: data.rows[rowIndex],
              description: `This row is identical to row ${rowIndices[0] + 1}`
            });
          }
        });
      }
    });

    return issues;
  }

  private checkDataConsistency(rule: ValidationRule, data: ReportData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Check for inconsistent formatting within columns
    data.headers.forEach((header, colIndex) => {
      const columnValues = data.rows.map(row => row[colIndex]).filter(val => val !== null && val !== '');
      
      if (columnValues.length === 0) return;

      // Check date format consistency
      if (this.isDateColumn(header.toLowerCase())) {
        const dateFormats = new Set<string>();
        columnValues.forEach((value, valueIndex) => {
          const dateStr = String(value);
          if (dateStr.includes('/')) dateFormats.add('MM/DD/YYYY');
          else if (dateStr.includes('-')) dateFormats.add('YYYY-MM-DD');
          else if (dateStr.includes('.')) dateFormats.add('DD.MM.YYYY');
        });

        if (dateFormats.size > 1) {
          issues.push({
            id: `${rule.id}-dateformat-${colIndex}`,
            ruleId: rule.id,
            severity: rule.severity,
            message: `Inconsistent date formats in column "${header}"`,
            row: 0,
            column: header,
            columnIndex: colIndex,
            currentValue: Array.from(dateFormats).join(', '),
            description: `Multiple date formats detected: ${Array.from(dateFormats).join(', ')}`
          });
        }
      }

      // Check case consistency for text columns
      if (typeof columnValues[0] === 'string') {
        const hasUpperCase = columnValues.some(val => /[A-Z]/.test(String(val)));
        const hasLowerCase = columnValues.some(val => /[a-z]/.test(String(val)));
        
        if (hasUpperCase && hasLowerCase) {
          const inconsistentRows: number[] = [];
          data.rows.forEach((row, rowIndex) => {
            const value = String(row[colIndex]);
            if (value && value !== value.toLowerCase() && value !== value.toUpperCase()) {
              inconsistentRows.push(rowIndex + 1);
            }
          });

          if (inconsistentRows.length > 0) {
            issues.push({
              id: `${rule.id}-case-${colIndex}`,
              ruleId: rule.id,
              severity: rule.severity,
              message: `Inconsistent text casing in column "${header}"`,
              row: 0,
              column: header,
              columnIndex: colIndex,
              currentValue: 'Mixed case formats',
              description: `Rows with mixed casing: ${inconsistentRows.slice(0, 10).join(', ')}${inconsistentRows.length > 10 ? '...' : ''}`
            });
          }
        }
      }
    });

    return issues;
  }

  private calculateValidationSummary(data: ReportData, issues: ValidationIssue[]): ValidationSummary {
    const errorCount = issues.filter(issue => issue.severity === 'error').length;
    const warningCount = issues.filter(issue => issue.severity === 'warning').length;
    const infoCount = issues.filter(issue => issue.severity === 'info').length;

    const rowsWithIssues = new Set(issues.map(issue => issue.row)).size;
    const validRows = data.totalRows - rowsWithIssues;

    const totalCells = data.totalRows * data.totalColumns;
    const completionPercentage = totalCells > 0 ? 
      ((totalCells - issues.filter(issue => issue.ruleId === 'empty-cells').length) / totalCells) * 100 : 100;

    // Calculate quality score (100 = perfect, 0 = terrible)
    let qualityScore = 100;
    qualityScore -= (errorCount * 5); // Each error reduces score by 5
    qualityScore -= (warningCount * 2); // Each warning reduces score by 2
    qualityScore -= (infoCount * 0.5); // Each info reduces score by 0.5
    qualityScore = Math.max(0, Math.min(100, qualityScore));

    return {
      totalRows: data.totalRows,
      totalColumns: data.totalColumns,
      totalIssues: issues.length,
      errorCount,
      warningCount,
      infoCount,
      validRows,
      invalidRows: rowsWithIssues,
      completionPercentage: Math.round(completionPercentage * 100) / 100,
      dataQualityScore: Math.round(qualityScore * 100) / 100
    };
  }

  // Helper methods to identify column types
  private isNumericColumn(columnName: string): boolean {
    const numericKeywords = ['amount', 'price', 'cost', 'value', 'number', 'count', 'quantity', 'total', 'sum', 'avg', 'average'];
    return numericKeywords.some(keyword => columnName.includes(keyword));
  }

  private isBooleanColumn(columnName: string): boolean {
    const booleanKeywords = ['active', 'enabled', 'valid', 'confirmed', 'approved', 'published', 'visible'];
    return booleanKeywords.some(keyword => columnName.includes(keyword));
  }

  private isEmailColumn(columnName: string): boolean {
    return columnName.includes('email') || columnName.includes('mail');
  }

  private isDateColumn(columnName: string): boolean {
    const dateKeywords = ['date', 'time', 'created', 'updated', 'modified', 'birth', 'start', 'end', 'expire'];
    return dateKeywords.some(keyword => columnName.includes(keyword));
  }

  private isPhoneColumn(columnName: string): boolean {
    return columnName.includes('phone') || columnName.includes('mobile') || columnName.includes('tel');
  }

  /**
   * Get default validation rules
   */
  getDefaultRules(): ValidationRule[] {
    return JSON.parse(JSON.stringify(this.defaultRules)); // Deep copy
  }

  /**
   * Create custom validation rule
   */
  createCustomRule(rule: Partial<ValidationRule>): ValidationRule {
    return {
      id: rule.id || `custom-${Date.now()}`,
      name: rule.name || 'Custom Rule',
      description: rule.description || '',
      type: rule.type || 'custom',
      severity: rule.severity || 'warning',
      enabled: rule.enabled !== undefined ? rule.enabled : true,
      column: rule.column,
      parameters: rule.parameters || {}
    };
  }
}