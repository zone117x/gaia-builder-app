import importModule from './dynamicModuleImportShim';
import globalThis from './globalThisShim';

import desec from 'desec';

export const testThing = async () => {
  const desecAPI = new desec();
  await new Promise(resolve => setImmediate(() => resolve()));
  return desecAPI.constructor.name;
};

export async function otherThing() {
  await new Promise(resolve => globalThis.setTimeout(() => resolve(), 0));
  const m = await importModule('adf');
  return m;
}

export function createDesecInst() {
  const ff = new desec();
  return ff;
}

