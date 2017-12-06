'use strict';
import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { messages } from './i18n';
import MonacoEditor from 'react-monaco-editor';
import './monaco-worker-proxy-factory';
import { Converter } from './converter';

type IMonacoEditor = monaco.editor.IStandaloneCodeEditor;
type OverlayWidget = monaco.editor.IOverlayWidget & { domNode: HTMLElement | null };
type HTMLValueElement = HTMLElement & { value: string };
type MountCallbackFn = ((this: CSSEditor, editor: IMonacoEditor, Monaco: typeof monaco) => void) | undefined;

const langList: any = {
  'zh-Hant': 'zh-tw', 'zh-Hant-HK': 'zh-tw', 'zh-Hans-CN': 'zh-cn',
  ja: 'ja', ru: 'ru', 'pt-BR': 'pt-br', hu: 'hu', fr: 'fr',
  es: 'es', de: 'de', it: 'it', ko: 'ko', tr: 'tr'
};

export interface CSSEditorOptions {
  originalEditor: HTMLValueElement;
  lang: string;
  onMountCallback: MountCallbackFn;
}

export class CSSEditor extends React.Component<CSSEditorOptions, any> {
  originalEditor: HTMLValueElement;
  nls: any;
  message: any;
  onMountCallback: MountCallbackFn;
  overlayWidget: OverlayWidget;

  constructor(options: CSSEditorOptions, context?: any) {
    super(options, context);
    this.originalEditor = options.originalEditor;
    this.onMountCallback = options.onMountCallback;
    this.message = messages[options.lang] || messages.en;
    const langMatch = langList[options.lang];
    this.nls = langMatch ? { availableLanguages: { '*': langMatch } } : {};
    this.onMount = this.onMount.bind(this);
  }

  render() {
    return (<MonacoEditor
      width="100%" height="100%"
      language="less" theme="vs"
      options={{
        selectOnLineNumbers: true,
        wordWrap: 'on',
        minimap: { enabled: true },
        folding: true
      }}
      editorDidMount={this.onMount}
      requireConfig={{
        url: 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.1/require.min.js',
        paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.10.1/min/vs' },
        'vs/nls': this.nls
      }}
    />);
  }

  onMount(editor: IMonacoEditor, Monaco: typeof monaco) {
    if(this.onMountCallback) this.onMountCallback(editor, Monaco);

    this.overlayWidget = {
      domNode: null,
      getId() { return 'mode.display.widget'; },
      getDomNode() {
        if(!this.domNode) {
          this.domNode = document.createElement('h2');
          this.domNode.id = 'custom_css_mode';
        }
        return this.domNode;
      },
      getPosition() { return { preference: 0 }; }
    };
  
    const originalEditor = this.originalEditor;
    const message = this.message;
    const converter = new Converter(message);
    const editorModel = editor.getModel();
    editorModel.updateOptions({
      insertSpaces: true,
      tabSize: 2
    });
  
    window.addEventListener('resize', () => editor.layout());
    converter.updateCompiledData = value => originalEditor.value = value;
    converter.updateStatus = modeChanged => {
      const mode = converter.mode;
      this.overlayWidget.getDomNode().textContent =
        message.mode_hint.replace('%s', mode) +
        (converter.isCompiling ? ' - ' + message.processing : '');
      if(modeChanged) Monaco.editor.setModelLanguage(editorModel, mode);
    };
    converter.updateMarkers = markers => Monaco.editor.setModelMarkers(editorModel, 'compiler', markers);
  
    editor.addAction({
      id:'mode-less',
      label: message.mode_less,
      run() { switchLanguage('less'); }
    });
    editor.addAction({
      id:'mode-scss',
      label: message.mode_scss,
      run() { switchLanguage('scss'); }
    });
  
    editor.addOverlayWidget(this.overlayWidget);
    editor.setValue(converter.load(originalEditor.value));
  
    editorModel.onDidChangeContent(() => converter.compile(editorModel.getValue()));
    
    function switchLanguage(lang: string, force: boolean = false) {
      converter.setMode(lang, editorModel.getValue(), force);
    }
  
    (findDOMNode(this).parentElement as HTMLElement).addEventListener(
      'mousewheel', e => editor.isFocused() && e.preventDefault(), true
    );
  }
}