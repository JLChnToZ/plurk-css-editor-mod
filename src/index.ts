((document?: Document) => {
  try {
    if (!document) return;
    const baseURI = document.baseURI || location.href;
    const { currentScript } = document;
    let scriptUrl: string | null | undefined;
    if (currentScript instanceof HTMLScriptElement)
      scriptUrl = currentScript.src;
    else if (currentScript instanceof SVGScriptElement)
      scriptUrl = currentScript.href.baseVal;
    const url = Object.assign<URL, Partial<URL>>(new URL(scriptUrl || baseURI, baseURI), {
      search: '', hash: '',
    });
    const { pathname } = url;
    const lastFragIndex = pathname.lastIndexOf('/') + 1;
    if (lastFragIndex > 0 && lastFragIndex < pathname.length)
      url.pathname = pathname.substring(0, lastFragIndex);
    __webpack_public_path__ = url.toString();
    console.log('Detected base path:', __webpack_public_path__);
  } catch (e) {
    console.warn('Failed to resolve base URL');
    console.warn(e);
  }
})(self.document);
import './style.css';
import { EmbeddedEditor } from './embedded-editor';

new EmbeddedEditor('#custom-css');
