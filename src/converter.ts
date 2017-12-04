'use strict';
import { delay, getToken, saveEscape, saveUnescape } from './utils';
const CompileWorker = require('worker-loader?inline=true&fallback=false!./converter.worker');

export class Converter {
  static message: any;
  worker: Worker;
  mode: string;
  isCompiling: boolean;
  newValue: string;
  token: number;
  handles: {
    [token: number]: {
      resolve: (result: any) => void,
      reject: (reason: any) => void
    }
  };
  updateStatus: (modeChanged: boolean) => void;
  updateCompiledData: (value: string) => void;
  updateMarkers: (markers: monaco.editor.IMarkerData[]) => void;

  constructor() {
    this.worker = new CompileWorker();
    this.mode = '';
    this.isCompiling = false;
    this.newValue = '';
    this.handles = {};
    this.token = 0;
    
    this.worker.addEventListener('message', this.receiveFromWorker.bind(this));
  }

  setMode(newMode: string, value: string, forceChange: boolean = false) {
    if(this.mode === newMode) return;
    this.mode = newMode;
    this.updateStatus(true);
    this.compile(value);
  }

  load(value: string) {
    const matches = /\/\*(less|s[ac]ss)\.source::([A-Za-z0-9+\/]+={0,2})\*\//.exec(value);
    if(matches) {
      this.setMode(matches[1], saveUnescape(matches[2]), true);
      return saveUnescape(matches[2]);
    }
    this.setMode('less', value, true);
    return value;
  }

  compile(value: string) {
    this.newValue = value;
    if(!this.isCompiling) this.delayCompile();
  }

  async delayCompile(): Promise<void> {
    let valueToProcess: string = '';
    try {
      this.isCompiling = true;
      this.updateStatus(false);
      this.updateMarkers([]);
      // Wait until user is finish editing
      do {
        valueToProcess = this.newValue;
        await delay(100);
      } while(valueToProcess !== this.newValue);
  
      if(!valueToProcess.replace(/^\s+|\s+$/g, '').length)
        return this.updateCompiledData('');
  
      const footer = `\n\n/** ${Converter.message.srcwarn} **/\n/*${this.mode}.source::${saveEscape(valueToProcess)}*/`;
      this.updateCompiledData(footer);
      const formatted: string = (await this.sendToWorker('compile', { mode: this.mode, content: valueToProcess }));
      this.updateCompiledData(formatted + footer);
    } catch(e) {
      console.error(e.stack || e);
      if(e.line) {
        this.updateMarkers([{
          startColumn: e.column as number, endColumn: e.column as number,
          startLineNumber: e.line as number, endLineNumber: e.line as number,
          message: e.message as string,
          severity: monaco.Severity.Error
        }]);
      }
    } finally {
      this.isCompiling = false;
      this.updateStatus(false);
    }
    if(this.newValue !== valueToProcess)
      this.delayCompile();
  }

  sendToWorker(type: string, data: any = {}): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const token = getToken();
      this.handles[token] = { resolve, reject };
      data.type = type;
      data.token = token;
      this.worker.postMessage(data);
    });
  }

  receiveFromWorker(e: MessageEvent) {
    const handle = this.handles[e.data.token];
    if(!handle) return;
    if(e.data.error) handle.reject(e.data.error);
    else handle.resolve(e.data.content);
    delete this.handles[e.data.token];
  }
}