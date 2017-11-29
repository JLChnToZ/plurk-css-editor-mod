'use strict';
import { delay, getToken, saveEscape, saveUnescape } from './utils';
const CompileWorker = require('worker-loader?inline=true!./converter.worker');

const worker = new CompileWorker() as Worker;

let mode: string = '',
  isCompiling: boolean = false,
  newValue: string = '',
  updateStatus: (modeChanged: boolean) => void,
  updateCompiledData: (value: string) => void,
  updateMarkers: (markers: monaco.editor.IMarkerData[]) => void,
  message: any;

export function registerUpdateStatus(fn: (changed: boolean) => void) {
  if(fn) updateStatus = fn;
}

export function registerUpdateCompiledData(fn: (value: string) => void) {
  if(fn) updateCompiledData = fn;
}

export function registerUpdateMarkers(fn: (markers: monaco.editor.IMarkerData[]) => void) {
  if(fn) updateMarkers = fn;
}

export function getMode(): string { return mode; }

export function setMode(newMode: string, value: string, forceChange: boolean = false) {
  if(mode === newMode) return;
  mode = newMode;
  updateStatus(true);
  compile(value);
}

export function setLangMessage(i18nMessage: any) {
  if(i18nMessage) message = i18nMessage;
}

export function load(value: string) {
  const matches = /\/\*(less|s[ac]ss)\.source::([A-Za-z0-9+\/]+={0,2})\*\//.exec(value);
  if(matches) {
    setMode(matches[1], saveUnescape(matches[2]), true);
    return saveUnescape(matches[2]);
  }
  setMode('less', value, true);
  return value;
}

export function getIsCompiling(): boolean {
  return isCompiling;
}

export function compile(value: string) {
  newValue = value;
  if(!isCompiling) delayCompile();
}

async function delayCompile(): Promise<void> {
  let valueToProcess: string = '';
  try {
    isCompiling = true;
    updateStatus(false);
    updateMarkers([]);
    // Wait until user is finish editing
    do {
      valueToProcess = newValue;
      await delay(100);
    } while(valueToProcess !== newValue);

    if(!valueToProcess.replace(/^\s+|\s+$/g, '').length)
      return updateCompiledData('');

    const footer = `

/** ${message.srcwarn} **/
/*${mode}.source::${saveEscape(valueToProcess)}*/`;
    updateCompiledData(footer);
    const formatted: string = (await sendToWorker('compile', { mode, content: valueToProcess }));
    updateCompiledData(formatted + footer);
  } catch(e) {
    console.error(e.stack || e);
    if(e.line) {
      updateMarkers([{
        startColumn: e.column as number, endColumn: e.column as number,
        startLineNumber: e.line as number, endLineNumber: e.line as number,
        message: e.message as string,
        severity: monaco.Severity.Error
      }]);
    }
  } finally {
    isCompiling = false;
    updateStatus(false);
  }
  if(newValue !== valueToProcess)
    delayCompile();
}

const handles: {
  [token: number]: {
    resolve: (result: any) => void,
    reject: (reason: any) => void
  }
} = {};
let token = 0;

worker.addEventListener('message', function(e) {
  const handle = handles[e.data.token];
  if(!handle) return;
  if(e.data.error) handle.reject(e.data.error);
  else handle.resolve(e.data.content);
  delete handles[e.data.token];
});

function sendToWorker(type: string, data: any = {}): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    const token = getToken();
    handles[token] = { resolve, reject };
    data.type = type;
    data.token = token;
    worker.postMessage(data);
  });
}