'use strict';
if(!window.URL) window.URL = (window as any).webkitURL;

const script = `const baseUrl = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.10.1/min/';
self.MonacoEnvironment = { baseUrl };
importScripts(baseUrl + 'vs/base/worker/workerMain.js');`;

let blob: Blob, blobUrl: string;

export default function getWorkerUrl(): string {
  if(!blob) try {
    blob = new Blob([script], {
      type: 'application/javascript'
    });
  } catch (e) { // Backwards-compatibility
    const BlobBuilder = (window as any).BlobBuilder ||
      (window as any).WebKitBlobBuilder ||
      (window as any).MozBlobBuilder;
    const builder = new BlobBuilder();
    builder.append(script);
    blob = builder.getBlob() as Blob;
  }
  if(!blobUrl) blobUrl = URL.createObjectURL(blob);
  return blobUrl;
};

(window as any).MonacoEnvironment = { getWorkerUrl };