// Modified from https://github.com/Microsoft/monaco-editor-webpack-plugin/pull/57#issuecomment-472307670

const w = window as Window & { [key: string]: any };
let monacoEnv: any = w.MonacoEnvironment;
let getWorkerUrl: ((moduleId: any, label: any) => string) | undefined;

if(monacoEnv)
  getWorkerUrl = monacoEnv.getWorkerUrl;
else
  monacoEnv = {};

Object.defineProperty(w, 'MonacoEnvironment', {
  get: () => monacoEnv,
  set: v => Object.assign(monacoEnv, v),
});

Object.defineProperty(monacoEnv, 'getWorkerUrl', {
  get: () => getWorkerUrl && patchedGetWorkerUrl,
  set: v => getWorkerUrl = v,
})

function patchedGetWorkerUrl(moduleId: any, label: any) {
  if(!getWorkerUrl) return '';
  const workerUrl = getWorkerUrl(moduleId, label);
  if(testSameOrigin(workerUrl))
    return workerUrl;
  let blob: Blob;
  const loader = `importScripts('${workerUrl}')`;
  const type = 'application/javascript';
  try {
    blob = new Blob([loader], { type });
  } catch {
    const blobBuilder = new (w.BlobBuilder || w.WebKitBlobBuilder || w.MozBlobBuilder)();
    blobBuilder.append(loader);
    blob = blobBuilder.getBlob(type);
  }
  return (w.URL || w.webkitURL).createObjectURL(blob);
}

function testSameOrigin(url: string) {
  const l = window.location;
  const a = document.createElement('a');
  a.href = url;
  return a.hostname === l.hostname && a.port === l.port && a.protocol === l.protocol;
}