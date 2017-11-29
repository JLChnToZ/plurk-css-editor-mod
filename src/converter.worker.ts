'use strict';
if(!('window' in self)) {
  // Stub of shimmed window global object for hacking to make LESS.js to work
  const fakeElement = {
    dataset: {},
    rel: '',
    appendChild: noop,
    removeChild: noop
  };
  const window = (self as any).window = {
    document: {
      getElementsByTagName(tagName: string) {
        switch(tagName) {
          case 'script': case 'style':
          case 'link': case 'head':
            return [fakeElement];
        }
      },
      createElement: () => fakeElement,
      createTextNode: noop
    }, location: {}
  };
  (self as any).document = window.document;
}

import * as less from 'less';
import * as CleanCss from 'clean-css';
import * as Sass from 'sass.js';

const ctx: Worker = self as any;

ctx.addEventListener('message', (event) => {
  switch(event.data.type) {
    case 'compile': return compile(event.data.token, event.data.content, event.data.mode);
  }
});

const cleanCss = new CleanCss({
  format: 'beautify',
  inline: false,
  returnPromise: true,
  level: { 2: { all: true } }
});

async function compile(token: number, src: string, mode: string) {
  let rendered: string;
  try {
    switch(mode) {
      case 'less': rendered = (await less.render(src)).css; break;
      case 'sass': case 'scss': rendered = await new Promise<string>((resolve, reject) => {
        Sass.options({ indentedSyntax: mode === 'sass' });
        Sass.compile(src, result => {
          if(result.status > 0)
            return reject({
              message: result.message,
              line: result.line,
              column: result.column,
              formatted: result.formatted
            });
          return resolve(result.text);
        });
      }); break;
      default: rendered = src; break;
    }
    const formatted = await cleanCss.minify(rendered);
    rendered = formatted.styles || '';
    ctx.postMessage({ token, content: rendered });  
  } catch(e) {
    ctx.postMessage({ token, content: '', error: wrapError(e) });
  }
}

function wrapError(e: any) {
  if(typeof e === 'object') {
    let wrapped: any = e;
    const stack = (e.stack || new Error(e.message || '').stack) as string;
    if(e instanceof Error) wrapped = Object.assign({}, e);
    wrapped.stack = stack;
    return wrapped;
  }
  return { stack: new Error().stack, message: e };
}

function noop() {}