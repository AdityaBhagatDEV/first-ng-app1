/**
 * Common testing utilities and helpers for Angular unit tests
 */

import { ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

/**
 * Helper class for common testing operations
 */
export class TestHelpers {
  
  /**
   * Get element by CSS selector
   */
  static getElement<T>(fixture: ComponentFixture<T>, selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  /**
   * Get all elements by CSS selector
   */
  static getAllElements<T>(fixture: ComponentFixture<T>, selector: string): NodeListOf<HTMLElement> {
    return fixture.nativeElement.querySelectorAll(selector);
  }

  /**
   * Get debug element by CSS selector
   */
  static getDebugElement<T>(fixture: ComponentFixture<T>, selector: string): DebugElement {
    return fixture.debugElement.query(By.css(selector));
  }

  /**
   * Get all debug elements by CSS selector
   */
  static getAllDebugElements<T>(fixture: ComponentFixture<T>, selector: string): DebugElement[] {
    return fixture.debugElement.queryAll(By.css(selector));
  }

  /**
   * Trigger click event on element
   */
  static clickElement<T>(fixture: ComponentFixture<T>, selector: string): void {
    const element = this.getElement(fixture, selector);
    if (element) {
      element.click();
      fixture.detectChanges();
    }
  }

  /**
   * Set input value and trigger input event
   */
  static setInputValue<T>(fixture: ComponentFixture<T>, selector: string, value: string): void {
    const input = this.getElement(fixture, selector) as HTMLInputElement;
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    }
  }

  /**
   * Wait for async operations to complete
   */
  static async waitForAsync(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  /**
   * Create a spy object with specified methods
   */
  static createSpyObj(baseName: string, methodNames: string[]): any {
    const obj: any = {};
    methodNames.forEach(name => {
      obj[name] = jasmine.createSpy(name);
    });
    return obj;
  }

  /**
   * Expect element to exist
   */
  static expectElementToExist<T>(fixture: ComponentFixture<T>, selector: string): void {
    const element = this.getElement(fixture, selector);
    expect(element).toBeTruthy();
  }

  /**
   * Expect element not to exist
   */
  static expectElementNotToExist<T>(fixture: ComponentFixture<T>, selector: string): void {
    const element = this.getElement(fixture, selector);
    expect(element).toBeFalsy();
  }

  /**
   * Expect element to have text content
   */
  static expectElementToHaveText<T>(fixture: ComponentFixture<T>, selector: string, expectedText: string): void {
    const element = this.getElement(fixture, selector);
    expect(element?.textContent?.trim()).toBe(expectedText);
  }

  /**
   * Expect element to contain text
   */
  static expectElementToContainText<T>(fixture: ComponentFixture<T>, selector: string, expectedText: string): void {
    const element = this.getElement(fixture, selector);
    expect(element?.textContent).toContain(expectedText);
  }
}

/**
 * Mock data generators for testing
 */
export class MockDataGenerator {
  
  /**
   * Generate random string
   */
  static randomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate random number within range
   */
  static randomNumber(min: number = 0, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate random boolean
   */
  static randomBoolean(): boolean {
    return Math.random() < 0.5;
  }

  /**
   * Generate random email
   */
  static randomEmail(): string {
    return `${this.randomString(8)}@${this.randomString(5)}.com`;
  }
}

/**
 * Common test constants
 */
export const TestConstants = {
  DEBOUNCE_TIME: 300,
  ANIMATION_DURATION: 500,
  DEFAULT_TIMEOUT: 5000,
  
  // Common CSS selectors
  SELECTORS: {
    BUTTON: 'button',
    INPUT: 'input',
    FORM: 'form',
    LOADING: '.loading',
    ERROR: '.error',
    SUCCESS: '.success'
  },
  
  // Common test data
  MOCK_DATA: {
    USER: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com'
    }
  }
};