import { editor as MonacoEditor, MarkerSeverity } from 'monaco-editor';
import { delay, getToken, saveEscape, saveUnescape } from './utils';
const CompileWorker = require('worker-loader?inline=true&fallback=false!./converter.worker');

export class Converter {
  message: any;
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

  constructor(message: any) {
    this.worker = new CompileWorker();
    this.mode = '';
    this.isCompiling = false;
    this.newValue = '';
    this.handles = {};
    this.token = 0;
    this.message = message;
    
    this.worker.addEventListener('message', this.receiveFromWorker.bind(this));
  }

  setMode(newMode: string, value: string) {
    if(this.mode === newMode) return;
    this.mode = newMode;
    this.updateStatus!(true);
    this.compile(value);
  }

  load(value: string) {
    const matches = /\/\*(less|s[ac]ss)\.source::(?:=lz85([0-9A-Za-z!#$%&()*+;<=>?@^_`{|}~-]+)|([0-9A-Za-z+\/]+={0,2}))\*\//.exec(value);
    if(matches) {
      const unescaped = matches[2] ? saveUnescape(matches[2], 1) : saveUnescape(matches[3]);
      this.setMode(matches[1], unescaped);
      return unescaped;
    }
    this.setMode('less', value);
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
      this.updateStatus!(false);
      this.updateMarkers!([]);
      // Wait until user is finish editing
      do {
        valueToProcess = this.newValue;
        await delay(100);
      } while(valueToProcess !== this.newValue);
  
      if(!valueToProcess.replace(/^\s+|\s+$/g, '').length)
        return this.updateCompiledData!('');
  
      const footer = `\n\n/** ${this.message.srcwarn} **/\n/*${this.mode}.source::=lz85${saveEscape(valueToProcess, 1)}*/`;
      this.updateCompiledData!(footer);
      const formatted: string = (await this.sendToWorker('compile', { mode: this.mode, content: valueToProcess }));
      this.updateCompiledData!(formatted + footer);
    } catch(e) {
      console.error(e.stack || e);
      if(e.line) {
        this.updateMarkers!([{
          startColumn: e.column as number, endColumn: e.column as number,
          startLineNumber: e.line as number, endLineNumber: e.line as number,
          message: e.message as string,
          severity: MarkerSeverity.Error,
        }]);
      }
    } finally {
      this.isCompiling = false;
      this.updateStatus!(false);
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
  
  updateStatus(_: boolean) {}
  updateCompiledData(_: string) {}
  updateMarkers(_: MonacoEditor.IMarkerData[]) {}
}