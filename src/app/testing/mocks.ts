/**
 * Mock implementations for common Angular services and dependencies
 */

import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

/**
 * Mock Router service for testing
 */
export class MockRouter {
  navigate = jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true));
  navigateByUrl = jasmine.createSpy('navigateByUrl').and.returnValue(Promise.resolve(true));
  url = '/';
  events = of();
}

/**
 * Mock Location service for testing
 */
export class MockLocation {
  back = jasmine.createSpy('back');
  forward = jasmine.createSpy('forward');
  go = jasmine.createSpy('go');
  replaceState = jasmine.createSpy('replaceState');
  path = jasmine.createSpy('path').and.returnValue('/');
}

/**
 * Mock ActivatedRoute service for testing
 */
export class MockActivatedRoute {
  params = of({});
  queryParams = of({});
  fragment = of('');
  data = of({});
  url = of([]);
  outlet = 'primary';
  routeConfig = null;
  parent = null;
  firstChild = null;
  children = [];
  pathFromRoot = [];
  paramMap = of(new Map());
  queryParamMap = of(new Map());
  snapshot = {
    params: {},
    queryParams: {},
    fragment: '',
    data: {},
    url: [],
    outlet: 'primary',
    routeConfig: null,
    parent: null,
    firstChild: null,
    children: [],
    pathFromRoot: [],
    paramMap: new Map(),
    queryParamMap: new Map()
  };
}

/**
 * Mock HttpClient service for testing
 */
export class MockHttpClient {
  get = jasmine.createSpy('get').and.returnValue(of({}));
  post = jasmine.createSpy('post').and.returnValue(of({}));
  put = jasmine.createSpy('put').and.returnValue(of({}));
  delete = jasmine.createSpy('delete').and.returnValue(of({}));
  patch = jasmine.createSpy('patch').and.returnValue(of({}));
  head = jasmine.createSpy('head').and.returnValue(of({}));
  options = jasmine.createSpy('options').and.returnValue(of({}));
}

/**
 * Mock LocalStorage for testing
 */
export class MockLocalStorage {
  private storage: { [key: string]: string } = {};

  getItem(key: string): string | null {
    return this.storage[key] || null;
  }

  setItem(key: string, value: string): void {
    this.storage[key] = value;
  }

  removeItem(key: string): void {
    delete this.storage[key];
  }

  clear(): void {
    this.storage = {};
  }

  get length(): number {
    return Object.keys(this.storage).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.storage);
    return keys[index] || null;
  }
}

/**
 * Mock SessionStorage for testing
 */
export class MockSessionStorage extends MockLocalStorage {}

/**
 * Mock Window object for testing
 */
export class MockWindow {
  location = {
    href: 'http://localhost:4200',
    origin: 'http://localhost:4200',
    protocol: 'http:',
    host: 'localhost:4200',
    hostname: 'localhost',
    port: '4200',
    pathname: '/',
    search: '',
    hash: '',
    assign: jasmine.createSpy('assign'),
    replace: jasmine.createSpy('replace'),
    reload: jasmine.createSpy('reload')
  };
  
  localStorage = new MockLocalStorage();
  sessionStorage = new MockSessionStorage();
  
  open = jasmine.createSpy('open');
  close = jasmine.createSpy('close');
  alert = jasmine.createSpy('alert');
  confirm = jasmine.createSpy('confirm').and.returnValue(true);
  prompt = jasmine.createSpy('prompt').and.returnValue('');
}

/**
 * Utility function to create component test setup
 */
export interface ComponentTestSetup<T> {
  component: T;
  fixture: any;
}

export function createComponentTestSetup<T>(
  componentClass: any,
  providers: any[] = [],
  imports: any[] = []
): ComponentTestSetup<T> {
  const fixture = {
    componentInstance: new componentClass(),
    nativeElement: document.createElement('div'),
    debugElement: {
      query: jasmine.createSpy('query'),
      queryAll: jasmine.createSpy('queryAll')
    },
    detectChanges: jasmine.createSpy('detectChanges'),
    destroy: jasmine.createSpy('destroy'),
    whenStable: jasmine.createSpy('whenStable').and.returnValue(Promise.resolve()),
    isStable: jasmine.createSpy('isStable').and.returnValue(true)
  };

  return {
    component: fixture.componentInstance,
    fixture
  };
}