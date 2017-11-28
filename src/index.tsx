'use strict';
import * as React from 'react';
import { render } from 'react-dom';
import MonacoEditor from 'react-monaco-editor';
import './monaco-worker-proxy-factory';
import './style-injector';
import {
  registerUpdateCompiledData,
  registerUpdateMarkers,
  registerUpdateStatus,
  getIsCompiling,
  getMode,
  setMode,
  load,
  compile
} from './converter';

declare const ThemeSelectas: {
  clearCustom: () => void
};

// Tailor-made language map for Plurk and Monaco Editor
const langList: any = {
  'zh-Hant': 'zh-tw', 'zh-Hant-HK': 'zh-tw', 'zh-Hans-CN': 'zh-cn',
  ja: 'ja', ru: 'ru', 'pt-BR': 'pt-br', hu: 'hu', fr: 'fr',
  es: 'es', de: 'de', it: 'it', ko: 'ko', tr: 'tr'
};
const langMatch = langList[document.documentElement.lang];
const lang = langMatch ? { availableLanguages: { '*': langMatch } } : {};

class App extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }
  render() {
    return (<MonacoEditor
      width="100%"
      height="100%"
      language="less"
      theme="vs"
      value=""
      options={{
        selectOnLineNumbers: true,
        wordWrap: 'on',
        minimap: { enabled: true }
      }}
      editorDidMount={onMount}
      requireConfig={{
        url: 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.1/require.min.js',
        paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.10.1/min/vs' },
        'vs/nls': lang
      }}
    />);
  }
}

const originalEditor = document.getElementById('custom_css') as HTMLTextAreaElement;
const parent = originalEditor.parentElement as HTMLElement;
const container = document.createElement('div');
container.id = 'custom_css_editor';
render(<App />, container);
parent.insertBefore(container, originalEditor);

const overlayWidget: monaco.editor.IOverlayWidget & { domNode: HTMLElement | null } = {
  domNode: null,
  getId() { return 'mode.display.widget'; },
  getDomNode() {
    if (!this.domNode) {
      this.domNode = document.createElement('h2');
      this.domNode.id = 'custom_css_mode';
    }
    return this.domNode;
  },
  getPosition() { return { preference: 0 }; }
};

function onMount(editor: monaco.editor.IStandaloneCodeEditor, Monaco: typeof monaco) {
  const editorModel = editor.getModel();
  editorModel.updateOptions({
    insertSpaces: true,
    tabSize: 2
  });

  // Bind clear function here...
  if(typeof ThemeSelectas !== 'undefined' && ThemeSelectas.clearCustom) {
    const clearCustom = ThemeSelectas.clearCustom;
    ThemeSelectas.clearCustom = function() {
      const result = clearCustom.call(ThemeSelectas, arguments);
      editor.setValue(originalEditor.value);
      return result;
    };
  }

  window.addEventListener('resize', () => editor.layout());
  registerUpdateStatus(updateStatus);
  registerUpdateMarkers(markers => Monaco.editor.setModelMarkers(editorModel, 'compiler', markers));
  editor.addAction({
    id:'mode-less',
    label: '切換至 LESS 編輯器',
    run() { switchLanguage('less'); }
  });
  editor.addAction({
    id:'mode-scss',
    label: '切換至 SCSS 編輯器',
    run() { switchLanguage('scss'); }
  });

  editor.addOverlayWidget(overlayWidget);
  editor.setValue(load(originalEditor.value));

  editorModel.onDidChangeContent(() => compile(editorModel.getValue()));
  
  function switchLanguage(lang: string, force: boolean = false) {
    setMode(lang, editorModel.getValue(), force);
  }
  
  function updateStatus(modeChanged: boolean) {
    const mode = getMode();
    overlayWidget.getDomNode().textContent = `${mode} 模式 (可按一下 F1 在命令列切換) ${getIsCompiling() ? ', 處理中...' : ''}`;
    if(modeChanged) Monaco.editor.setModelLanguage(editorModel, mode);
  }
}
registerUpdateCompiledData(value => originalEditor.value = value);
