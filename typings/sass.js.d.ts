// Type definitions for sass.js v0.10.7
// Project: https://github.com/medialize/sass.js/
// Definitions by: Jeremy Lam "JLChnToZ" <https://github.com/jlchntoz>

// This file only contains definitions for sass.sync.js, which is default entry point while loading sass.js with require().

declare namespace Sass {
  export enum style {
    nested = 0,
    expanded = 1,
    compact = 2,
    compressed = 3,
  }
  
  export interface ISassOptions {
    style?: Sass.style,
    precision?: number,
    comments?: boolean,
    indentedSyntax?: boolean,
    indent?: string,
    linefeed?: string,
    importer?: any
  }

  export interface SassResponse {
    status: number,
    text?: string,
    map?: sourceMap.RawSourceMap,
    file?: string,
    files?: string[],
    line?: number,
    column?: number,
    message?: string,
    formatted?: string
  }

  export interface SassImporterRequest {
    current: string,
    previous: string,
    resolved: string,
    path: string | null,
    options: any
  }

  export interface ISassImporterResponse {
    path?: string,
    content?: string,
    error?: string
  }
  
  type SassOptions = 'defaults' | ISassOptions;
  type SassResponseCallback = (result: SassResponse) => void;
  type NoopCallback = () => void;
  
  export function options(option: SassOptions, callback?: NoopCallback): void;
  export function compile(source: string, callback: SassResponseCallback): void;
  export function compile(source: string, options: SassOptions, callback: SassResponseCallback): void;
  export function compileFile(path: string, callback: SassResponseCallback): void;
  export function compileFile(path: string, options: SassOptions, callback: SassResponseCallback): void;
  export function writeFile(path: string, source: string, callback?: (success: boolean) => void): void;
  export function writeFile(files: { [path: string]: string }, callback?: (result: { [path: string]: boolean }) => void): void;
  export function readFile(path: string, callback: (content: string) => void): void;
  export function readFile(paths: string[], callback: (result: { [path: string]: string }) => void): void;
  export function removeFile(path: string, callback?: (success: boolean) => void): void;
  export function removeFile(files: string[], callback?: (result: { [path: string]: boolean }) => void): void;
  export function listFiles(callback?: (list: string[]) => void): void;
  export function clearFiles(callback?: NoopCallback): void;
  export function preloadFiles(base: string, directory: string, files: string[], callback?: NoopCallback): void;
  export function lazyFiles(base: string, directory: string, files: string[], callback?: NoopCallback): void;
  export function importer(callback: ((request: SassImporterRequest, done: (result?: ISassImporterResponse) => void) => void) | null): void;
}

export = Sass;