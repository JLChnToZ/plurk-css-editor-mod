const cdnPath = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.21.3/min/';
const workerUrl = URL.createObjectURL(new Blob([`
self.MonacoEnvironment = { baseUrl: '${cdnPath}' };
importScripts(self.MonacoEnvironment.baseUrl + 'vs/base/worker/workerMain.js');
`], { type: 'text/javascript' }));
Object.assign(self, {
  MonacoEnvironment: {
    getWorkerUrl() { return workerUrl; },
  },
});
