export type Collection<T> = ArrayLike<T> | Iterable<T>;

export type Callback = (...args: any[]) => any;

export const emptyArray = Object.freeze({
  length: 0,
  [Symbol.toStringTag]: 'EmptyArray',
  next() { return { done: true } as IteratorReturnResult<any>; },
  [Symbol.iterator]() { return this; },
} as ArrayLike<any> & IterableIterator<any>);

export interface Resolver<T> {
  resolve(value?: T | PromiseLike<T>): void;
  reject(reason?: any): void;
}

export function isIterable(src: any): src is Iterable<any> {
  return src != null && typeof src[Symbol.iterator] === 'function';
}

export function isArrayLike(src: any): src is ArrayLike<any> {
  if (src == null || typeof src === 'function')
    return false;
  if (Array.isArray(src))
    return true;
  const { length } = src;
  return Number.isInteger(length) && length >= 0;
}

export function forEach<S extends Iterable<any> | ArrayLike<any>>(
  src: S,
  callback: (
    value: S extends Iterable<infer T> ? T : S extends ArrayLike<infer T> ? T : unknown,
    value2: S extends Iterable<infer T> ? T : S extends ArrayLike<any> ? number : unknown,
    src: S,
  ) => void
): void;
export function forEach<S extends Iterable<any> | ArrayLike<any>, A>(
  src: S,
  callback: (
    this: A,
    value: S extends Iterable<infer T> ? T :
      S extends ArrayLike<infer T> ? T : never,
    value2: S extends Iterable<infer T> ? T :
      S extends ArrayLike<any> ? number : never,
    src: S,
  ) => void,
  thisArg: A,
): void;
export function forEach(
  src: Iterable<any> | ArrayLike<any>,
  callback: (value: any, value2: any, src: Iterable<any> | ArrayLike<any>) => void,
  thisArg?: any,
) {
  if (src instanceof Set)
    src.forEach(callback, thisArg);
  else if (isIterable(src))
    for (const entry of src)
      callback.call(thisArg, entry, entry, src);
  else
    Array.prototype.forEach.call(src, callback, thisArg);
}
