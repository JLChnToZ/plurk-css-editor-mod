import { Callback } from '.';

interface CallbackQueue {
  callback: Callback;
  thisArg: any;
  args: any[];
  next?: CallbackQueue | null;
}

export function delay(timeout: number): Promise<void>;
export function delay<T>(timeout: number, value: T): Promise<T>;
export function delay<T>(timeout: number, value?: T) {
  return new Promise<T>(resolve => setTimeout(resolve, timeout, value));
}

export function delayTimeout(timeout: number): Promise<any>;
export function delayTimeout<T>(timeout: number, reason?: any): Promise<T>;
export function delayTimeout(timeout: number, reason?: any) {
  return new Promise<any>((_, reject) => setTimeout(reject, timeout, reason));
}

export function defer(callback: Callback, thisArg: any, args: any[]) {
  return new Promise<any>(r => r(Reflect.apply(callback, thisArg, args)));
}

let first: CallbackQueue | null | undefined;
let last: CallbackQueue | null | undefined;
let hasPending = false;

export function deferTrigger(callback: Callback, thisArg: any, args: any[]) {
  const current: CallbackQueue = { callback, thisArg, args };
  if (last == null)
    first = last = current;
  else
    last = last.next = current;
  if (!hasPending) {
    hasPending = true;
    if (typeof setImmediate === 'function')
      setImmediate(processCallback);
    else
      setTimeout(processCallback, 0);
  }
}

function processCallback() {
  while (first != null) try {
    const { callback, thisArg, args, next } = first;
    first = next;
    if (first == null) last = null;
    Function.prototype.apply.call(callback, thisArg, args);
  } catch {}
  hasPending = false;
}