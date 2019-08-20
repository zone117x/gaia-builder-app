// From https://observablehq.com/@bryangingechen/dynamic-import-polyfill
// slight modification of:
// https://github.com/uupaa/dynamic-import-polyfill/blob/master/importModule.js

// eslint-disable-next-line @typescript-eslint/promise-function-async
export default function importModule(url: string): Promise<any> {
  // if dynamic import is supported, don't bother with the stuff below
  try { 
    // return (new Function(`return import("${url}")`))();
    // ^ That method is often disallowed from Content Security Policy (like within web extensions)
    //   Seems like this should work?
    return import(url);
  } catch (err) {
    // ignore
  }
  
  function toAbsoluteURL(url: string) {
    const a = document.createElement('a');
    a.setAttribute('href', url);    // <a href="hoge.html">
    return (a.cloneNode(false) as HTMLAnchorElement).href; // -> "http://example.com/hoge.html"
  }
  
  return new Promise((resolve, reject) => {
    const vector = '$importModule$' + Math.random().toString(32).slice(2);
    const script = document.createElement('script');
    const destructor = () => {
      delete (window as any)[vector];
      script.onerror = null;
      script.onload = null;
      script.remove();
      URL.revokeObjectURL(script.src);
      script.src = '';
    };
    script.defer = true;
    script.type = 'module';
    script.onerror = () => {
      reject(new Error(`Failed to import: ${url}`));
      destructor();
    };
    script.onload = () => {
      resolve((window as any)[vector]);
      destructor();
    };
    const absURL = toAbsoluteURL(url);
    const loader = `import * as m from "${absURL}"; window.${vector} = m;`; // export Module
    const blob = new Blob([loader], { type: 'text/javascript' });
    script.src = URL.createObjectURL(blob);
  
    document.head.appendChild(script);
  });
}
