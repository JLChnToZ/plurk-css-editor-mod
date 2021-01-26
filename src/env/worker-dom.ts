if(!('window' in self)) {
  const _self = self as any;
  // Stub of shimmed window global object for hacking to make LESS.js to work
  const fakeElement = {
    dataset: {},
    rel: '',
    appendChild: noop,
    removeChild: noop
  };
  const window = _self.window = {
    document: {
      getElementsByTagName(tagName: string) {
        switch(tagName) {
          case 'script': case 'style':
          case 'link': case 'head':
            return [fakeElement];
        }
      },
      createElement: () => fakeElement,
      currentScript: () => fakeElement,
      createTextNode: noop
    }, 
    location: {},
    XMLHttpRequest
  };
  _self.document = window.document;
  _self.XMLHttpRequest = XMLHttpRequest;
}

function noop() {}
