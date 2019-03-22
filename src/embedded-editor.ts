import { messages } from './i18n';
import * as monaco from 'monaco-editor'
import { Converter } from './converter';

type HTMLValueElement = HTMLElement & { value: string };

interface IDomOverlayWidget extends monaco.editor.IOverlayWidget {
  domNode?: HTMLElement;
}

const { lang } = document.documentElement;
const message = messages[lang] || messages.en;

const overlayWidget: IDomOverlayWidget = {
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

export class EmbeddedEditor {
  query: string;
  originalEditor?: HTMLValueElement;
  overlayWidget?: IDomOverlayWidget;
  observer: MutationObserver;
  editor?: monaco.editor.IStandaloneCodeEditor;
  model?: monaco.editor.ITextModel;
  converter: Converter;

  constructor(query: string) {
    this.query = query;
    window.addEventListener('resize', this.onResize.bind(this));
    this.converter = new Converter(message);
    this.converter.updateCompiledData = this.onUpdateCompiledData.bind(this);
    this.converter.updateMarkers = this.onMarkersUpdate.bind(this);
    this.converter.updateStatus = this.onStatusUpdate.bind(this);
    this.onDidChangeContent = this.onDidChangeContent.bind(this);
    this.observer = new MutationObserver(this.onMutate.bind(this));
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  onMutate() {
    const element = document.querySelector(this.query);
    if(element) {
      if(this.originalEditor) return;
      this.originalEditor = element as HTMLValueElement;
      this.onAppear(this.originalEditor);
    } else {
      if(!this.originalEditor) return;
      delete this.originalEditor;
      this.onDisappear();
    }
  }

  onAppear(element: HTMLValueElement) {
    const root = element.parentElement!.insertBefore(
      document.createElement('div'),
      element.nextElementSibling,
    );
    root.id = 'custom_css_editor';
    this.overlayWidget = Object.create(overlayWidget);
    this.editor = monaco.editor.create(root, {
      language: 'less',
      value: element.value,
      theme: 'vs',
      selectOnLineNumbers: true,
      wordWrap: 'on',
      minimap: { enabled: true },
      folding: true,
    });
    this.editor.addOverlayWidget(this.overlayWidget!);
    this.model = this.editor.getModel()!;
    this.model.updateOptions({
      insertSpaces: true,
      tabSize: 2
    });
    this.model.onDidChangeContent(this.onDidChangeContent);
    this.editor.addAction({
      id:'mode-less',
      label: message.mode_less,
      run: this.switchLanguage.bind(this, 'less', false),
    });
    this.editor.addAction({
      id:'mode-scss',
      label: message.mode_scss,
      run: this.switchLanguage.bind(this, 'scss', false),
    });
    this.editor.setValue(this.converter.load(element.value));
  }

  onDisappear() {
    if(!this.editor) return;
    this.editor.dispose();
    delete this.model;
    delete this.editor;
  }

  onResize() {
    if(this.editor)
      this.editor.layout();
  }

  onUpdateCompiledData(value: string) {
    if(this.originalEditor)
      this.originalEditor.value = value;
  }

  onMarkersUpdate(markers: monaco.editor.IMarkerData[]) {
    if(this.model)
      monaco.editor.setModelMarkers(this.model, 'compiler', markers);
  }

  onStatusUpdate(modeChanged: boolean) {
    const mode = this.converter.mode;
    if(this.overlayWidget)
      this.overlayWidget.getDomNode().textContent =
        message.mode_hint.replace('%s', mode) +
        (this.converter.isCompiling ? ' - ' + message.processing : '');
    if(modeChanged && this.model)
      monaco.editor.setModelLanguage(this.model, mode);
  }

  onDidChangeContent() {
    if(this.model)
      this.converter.compile(this.model.getValue());
  }
  
  switchLanguage(lang: string, force = false) {
    if(this.model)
      this.converter.setMode(lang, this.model.getValue(), force);
  }
}
