'use strict';
import * as React from 'react';
import { render } from 'react-dom';
import './style-injector';
import { CSSEditor } from './editor';

declare const ThemeSelectas: {
  clearCustom: () => void
};

const originalEditor = document.getElementById('custom_css') as HTMLTextAreaElement;
const parent = originalEditor.parentElement as HTMLElement;
const container = document.createElement('div');
container.id = 'custom_css_editor';
parent.insertBefore(container, originalEditor);
render(<CSSEditor
  originalEditor={originalEditor}
  lang={document.documentElement.lang}
  onMountCallback={editor => {
    if(typeof ThemeSelectas !== 'undefined' && ThemeSelectas.clearCustom) {
      const clearCustom = ThemeSelectas.clearCustom;
      ThemeSelectas.clearCustom = function() {
        const result = clearCustom.call(ThemeSelectas, arguments);
        editor.setValue(originalEditor.value);
        return result;
      };
    }
  }}
/>, container);