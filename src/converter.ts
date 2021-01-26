import { editor as MonacoEditor, MarkerSeverity } from 'monaco-editor';
import { saveEscape, saveUnescape } from './utils/codec';
import { delay } from './utils/async';
import { WorkerMessageService } from './utils/messages';
import CompileWorker from 'worker-loader?inline=no-fallback!./converter.worker';

export class Converter {
  remote = new WorkerMessageService(new CompileWorker);
  mode = '';
  isCompiling = false;
  newValue = '';
  handles: {
    [token: number]: {
      resolve: (result: any) => void,
      reject: (reason: any) => void
    }
  } = {};

  constructor(public message: any) {
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
      this.updateStatus(false);
      this.updateMarkers([]);
      // Wait until user is finish editing
      do {
        valueToProcess = this.newValue;
        await delay(100);
      } while(valueToProcess !== this.newValue);
  
      if(!valueToProcess.replace(/^\s+|\s+$/g, '').length)
        return this.updateCompiledData!('');
  
      const footer = `\n\n/** ${this.message.srcwarn} **/\n/*${this.mode}.source::=lz85${saveEscape(valueToProcess, 1)}*/`;
      this.updateCompiledData!(footer);
      const [formatted]: string[] = await this.remote.call('compile', valueToProcess, this.mode);
      this.updateCompiledData(formatted + footer);
    } catch(e) {
      console.error(e.stack || e);
      if(e.line) {
        this.updateMarkers([{
          startColumn: e.column as number, endColumn: e.column as number,
          startLineNumber: e.line as number, endLineNumber: e.line as number,
          message: e.message as string,
          severity: MarkerSeverity.Error,
        }]);
      }
    } finally {
      this.isCompiling = false;
      this.updateStatus(false);
    }
    if(this.newValue !== valueToProcess)
      this.delayCompile();
  }

  updateStatus(_: boolean) {}
  updateCompiledData(_: string) {}
  updateMarkers(_: MonacoEditor.IMarkerData[]) {}
}