import './env/worker-dom';
import less from 'less';
import CleanCss from 'clean-css';
import Sass from 'sass.js';
import { WorkerMessageService } from './utils/messages';
import { delayTimeout } from './utils/async';

const cleanCss = new CleanCss({
  format: 'beautify',
  inline: false,
  sourceMap: true,
  returnPromise: true,
  level: { 2: { all: true } }
});

async function compile(src: string, mode: string) {
  let rendered: string, sourceMap: any;
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
          Sass.compile(src, r => (r.status > 0 ? reject : resolve)(r));
        }),
        delayTimeout<Sass.SassResponse>(5000, 'Sass compile timeout')
      ]);
      rendered = sassResult.text as string;
      sourceMap = sassResult.map;
      break;
    default: rendered = src; break;
  }
  const formatted = await cleanCss.minify(rendered, sourceMap);
  return formatted.styles || '';
}

WorkerMessageService.host.on({ compile });
