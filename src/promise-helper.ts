// Resolves promise after certain time.
export function delay(timeout: number): Promise<void>;
export function delay<T>(timeout: number, value: T): Promise<T>;
export function delay<T>(timeout: number, value?: T) {
  return new Promise<T>(resolve => setTimeout(resolve, timeout, value));
}

// Rejects promise after certain time.
export function delayTimeout(timeout: number): Promise<any>;
export function delayTimeout<T>(timeout: number, reason?: any): Promise<T>;
export function delayTimeout(timeout: number, reason?: any) {
  return new Promise<any>((resolve, reject) => setTimeout(reject, timeout, reason));
}