import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Component } from '@angular/core';

// Mock component for testing routes
@Component({ template: 'Test Component' })
class TestComponent { }

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create the app', () => {
      expect(component).toBeTruthy();
    });

    it('should be defined', () => {
      expect(component).toBeDefined();
    });

    it('should be an instance of AppComponent', () => {
      expect(component instanceof AppComponent).toBe(true);
    });
  });

  describe('Component Properties', () => {
    it(`should have the 'first-ng-app1' title`, () => {
      expect(component.title).toEqual('first-ng-app1');
    });

    it('should have title property as string', () => {
      expect(typeof component.title).toBe('string');
    });

    it('should not have empty title', () => {
      expect(component.title).not.toBe('');
      expect(component.title.length).toBeGreaterThan(0);
    });
  });

  describe('Template Rendering', () => {
    it('should render title in welcome message', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('h1')?.textContent).toContain('Welcome to first-ng-app1!');
    });

    it('should contain router-outlet', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('router-outlet')).toBeTruthy();
    });

    it('should have h1 element', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const h1Element = compiled.querySelector('h1');
      expect(h1Element).toBeTruthy();
    });
  });

  describe('Component Lifecycle', () => {
    it('should initialize without errors', () => {
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle title changes', () => {
      const newTitle = 'Updated Title';
      component.title = newTitle;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('h1')?.textContent).toContain(`Welcome to ${newTitle}!`);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title gracefully', () => {
      component.title = '';
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('h1')?.textContent).toContain('Welcome to !');
    });

    it('should handle special characters in title', () => {
      const specialTitle = 'App-123!@#';
      component.title = specialTitle;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('h1')?.textContent).toContain(`Welcome to ${specialTitle}!`);
    });
  });
});
