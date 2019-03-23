import './worker-dom-shim';
import less from 'less';
import CleanCss from 'clean-css';
import Sass from 'sass.js';
import { delayTimeout } from './promise-helper';

declare const self: Worker;

self.addEventListener('message', (event) => {
  switch(event.data.type) {
    case 'compile': return compile(event.data.token, event.data.content, event.data.mode);
  }
});

const cleanCss = new CleanCss({
  format: 'beautify',
  inline: false,
  sourceMap: true,
  returnPromise: true,
  level: { 2: { all: true } }
});

async function compile(token: number, src: string, mode: string) {
  let rendered: string, sourceMap: any;
  try {
    switch(mode) {
      case 'less':
        const lessResult = await Promise.race([
          less.render(src),
          delayTimeout<Less.RenderOutput>(5000, 'Less render timeout')
        ]);
        rendered = lessResult.css;
        sourceMap = lessResult.map;
        break;
      case 'sass': case 'scss':
        const sassResult = await Promise.race([
          new Promise<Sass.SassResponse>((resolve, reject) => {
            Sass.options({ indentedSyntax: mode === 'sass' });
            Sass.compile(src, result => {
              if(result.status > 0)
                return reject(result);
              return resolve(result);
            });
          }),
          delayTimeout<Sass.SassResponse>(5000, 'Sass compile timeout')
        ]);
        rendered = sassResult.text as string;
        sourceMap = sassResult.map;
        break;
      default: rendered = src; break;
    }
    const formatted = await cleanCss.minify(rendered, sourceMap);
    rendered = formatted.styles || '';
    self.postMessage({ token, content: rendered });  
  } catch(e) {
    self.postMessage({ token, content: '', error: wrapError(e) });
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
  return {
    stack: new Error(e && e.toString()).stack,
    message: e
  };
}