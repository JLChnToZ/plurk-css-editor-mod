'use strict';
declare function escape(s:string): string;
declare function unescape(s:string): string;

let token: number = 0;

export function getToken(): number { return ++token; }

export function delay(timeout: number): Promise<void>;
export function delay<T>(timeout: number, value: T): Promise<T>;
export function delay<T>(timeout: number, value?: T) {
  return new Promise<T>(resolve => setTimeout(resolve, timeout, value));
}

export function saveEscape(value: string): string {
  return btoa(unescape(encodeURIComponent(value)));
}

export function saveUnescape(value: string): string {
  return decodeURIComponent(escape(atob(value)));
}
