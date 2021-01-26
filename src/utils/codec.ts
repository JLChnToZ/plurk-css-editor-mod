import { Ascii85 } from 'ascii85';
import LZW from 'node-lzw';

declare function escape(s: string): string;
declare function unescape(s: string): string;

const a85 = new Ascii85({
  table: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|}~'.split('')
});

export function saveEscape(value: string, mode?: number): string {
  value = unescape(encodeURIComponent(value));
  switch(mode) {
    case 1: return a85.encode(Buffer.from(LZW.encode(value), 'utf8')).toString('utf8');
    default: return btoa(value);
  }
}

export function saveUnescape(value: string, mode?: number): string {
  switch(mode) {
    case 1: value = LZW.decode(a85.decode(value).toString('utf8')); break;
    default: value = atob(value); break;
  }
  return decodeURIComponent(escape(value));
}
