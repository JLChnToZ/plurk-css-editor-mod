export interface Ascii85Options {
  table?: string[];
  delimiter?: boolean;
  groupSpace?: boolean;
}

export declare class Ascii85 {
  constructor(options?: Ascii85Options);
  encode(data: string | Buffer): Buffer;
  decode(data: string | Buffer): Buffer;
}

export declare const ZeroMQ: Ascii85;
export declare const PostScript: Ascii85;

export function encode(data: string | Buffer, table: string[]): Buffer;
export function encode(data: string | Buffer, options?: Ascii85Options): Buffer;
export function decode(data: string | Buffer, table: string[]): Buffer;