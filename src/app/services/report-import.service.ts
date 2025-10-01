import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ReportData {
  headers: string[];
  rows: (string | number | boolean | null)[][];
  fileName: string;
  fileType: string;
  totalRows: number;
  totalColumns: number;
}

export interface ImportError {
  type: 'error' | 'warning';
  message: string;
  row?: number;
  column?: string;
}

export interface ImportResult {
  success: boolean;
  data?: ReportData;
  errors: ImportError[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportImportService {
  private importProgressSubject = new BehaviorSubject<number>(0);
  public importProgress$ = this.importProgressSubject.asObservable();

  constructor() { }

  /**
   * Import and parse various file formats
   */
  async importReport(file: File): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      errors: []
    };

    try {
      this.importProgressSubject.next(10);

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        result.errors.push({
          type: 'error',
          message: 'File size exceeds 10MB limit'
        });
        return result;
      }

      this.importProgressSubject.next(30);

      const fileExtension = this.getFileExtension(file.name).toLowerCase();
      let data: ReportData;

      switch (fileExtension) {
        case 'csv':
          data = await this.parseCsvFile(file);
          break;
        case 'json':
          data = await this.parseJsonFile(file);
          break;
        case 'txt':
          data = await this.parseTextFile(file);
          break;
        case 'tsv':
          data = await this.parseTsvFile(file);
          break;
        default:
          result.errors.push({
            type: 'error',
            message: `Unsupported file format: ${fileExtension}. Supported formats: CSV, JSON, TXT, TSV`
          });
          return result;
      }

      this.importProgressSubject.next(80);

      // Basic validation
      if (!data.headers || data.headers.length === 0) {
        result.errors.push({
          type: 'warning',
          message: 'No headers detected in the file'
        });
      }

      if (!data.rows || data.rows.length === 0) {
        result.errors.push({
          type: 'error',
          message: 'No data rows found in the file'
        });
        return result;
      }

      this.importProgressSubject.next(100);

      result.success = true;
      result.data = data;

    } catch (error) {
      result.errors.push({
        type: 'error',
        message: `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      // Reset progress after a short delay
      setTimeout(() => this.importProgressSubject.next(0), 1000);
    }

    return result;
  }

  private async parseCsvFile(file: File): Promise<ReportData> {
    const text = await this.readFileAsText(file);
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length === 0) {
      throw new Error('File is empty');
    }

    const headers = this.parseCsvLine(lines[0]);
    const rows: (string | number | boolean | null)[][] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = this.parseCsvLine(lines[i]);
      // Pad or trim row to match header length
      while (row.length < headers.length) {
        row.push('');
      }
      if (row.length > headers.length) {
        row.splice(headers.length);
      }
      rows.push(this.convertRowTypes(row));
    }

    return {
      headers,
      rows,
      fileName: file.name,
      fileType: 'CSV',
      totalRows: rows.length,
      totalColumns: headers.length
    };
  }

  private async parseJsonFile(file: File): Promise<ReportData> {
    const text = await this.readFileAsText(file);
    const jsonData = JSON.parse(text);

    let headers: string[] = [];
    let rows: (string | number | boolean | null)[][] = [];

    if (Array.isArray(jsonData)) {
      if (jsonData.length === 0) {
        throw new Error('JSON array is empty');
      }

      // Extract headers from first object
      if (typeof jsonData[0] === 'object' && jsonData[0] !== null) {
        headers = Object.keys(jsonData[0]);
        
        // Convert objects to rows
        rows = jsonData.map(item => {
          if (typeof item === 'object' && item !== null) {
            return headers.map(header => {
              const value = item[header];
              return value !== undefined ? value : null;
            });
          }
          return [item];
        });
      } else {
        // Array of primitives
        headers = ['Value'];
        rows = jsonData.map(item => [item]);
      }
    } else if (typeof jsonData === 'object' && jsonData !== null) {
      // Single object - convert to single row
      headers = Object.keys(jsonData);
      rows = [headers.map(header => jsonData[header])];
    } else {
      throw new Error('Invalid JSON structure for report data');
    }

    return {
      headers,
      rows: rows.map(row => this.convertRowTypes(row)),
      fileName: file.name,
      fileType: 'JSON',
      totalRows: rows.length,
      totalColumns: headers.length
    };
  }

  private async parseTextFile(file: File): Promise<ReportData> {
    const text = await this.readFileAsText(file);
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length === 0) {
      throw new Error('File is empty');
    }

    // Try to detect delimiter
    const firstLine = lines[0];
    let delimiter = '\t';
    if (firstLine.includes('|')) delimiter = '|';
    else if (firstLine.includes(',')) delimiter = ',';
    else if (firstLine.includes(';')) delimiter = ';';

    const headers = lines[0].split(delimiter).map(h => h.trim());
    const rows: (string | number | boolean | null)[][] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(delimiter).map(cell => cell.trim());
      // Pad or trim row to match header length
      while (row.length < headers.length) {
        row.push('');
      }
      if (row.length > headers.length) {
        row.splice(headers.length);
      }
      rows.push(this.convertRowTypes(row));
    }

    return {
      headers,
      rows,
      fileName: file.name,
      fileType: 'TXT',
      totalRows: rows.length,
      totalColumns: headers.length
    };
  }

  private async parseTsvFile(file: File): Promise<ReportData> {
    const text = await this.readFileAsText(file);
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length === 0) {
      throw new Error('File is empty');
    }

    const headers = lines[0].split('\t').map(h => h.trim());
    const rows: (string | number | boolean | null)[][] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split('\t').map(cell => cell.trim());
      // Pad or trim row to match header length
      while (row.length < headers.length) {
        row.push('');
      }
      if (row.length > headers.length) {
        row.splice(headers.length);
      }
      rows.push(this.convertRowTypes(row));
    }

    return {
      headers,
      rows,
      fileName: file.name,
      fileType: 'TSV',
      totalRows: rows.length,
      totalColumns: headers.length
    };
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private convertRowTypes(row: (string | any)[]): (string | number | boolean | null)[] {
    return row.map(cell => {
      if (cell === null || cell === undefined || cell === '') {
        return null;
      }
      
      const strValue = String(cell).trim();
      
      // Check if it's a number
      if (!isNaN(Number(strValue)) && strValue !== '') {
        return Number(strValue);
      }
      
      // Check for boolean values
      if (strValue.toLowerCase() === 'true') return true;
      if (strValue.toLowerCase() === 'false') return false;
      
      return strValue;
    });
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  private getFileExtension(fileName: string): string {
    return fileName.split('.').pop() || '';
  }
}