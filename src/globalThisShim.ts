// From https://github.com/medikoo/es5-ext/blob/master/global.js

declare const __global__: WindowOrWorkerGlobalScope;

export default (function () {
  // @ts-ignore
  if (this) {
    // @ts-ignore
    return this;
  }

  // Unexpected strict mode (may happen if e.g. bundled into ESM module), be nice

  // Thanks @mathiasbynens -> https://mathiasbynens.be/notes/globalthis
  // In all ES5+ engines global object inherits from Object.prototype
  // (if you approached one that doesn't please report)
  Object.defineProperty(Object.prototype, '__global__', {
    get: function () {
      return this; 
    },
    configurable: true
  });
  try {
    return __global__;
  } finally {
    // @ts-ignore
    delete Object.prototype.__global__;
  }
})() as WindowOrWorkerGlobalScope;
