import * as jsdom from 'jsdom';

const globalAsAny: NodeJS.Global & { [key: string]: any; } = global;

export default class JsDomGlobalPolyfill {

  private static defaultGlobalProps: string[];
  private static polyfillProps: string[];
  
  public static setup(jsdomInstance: jsdom.JSDOM) {
    if (JsDomGlobalPolyfill.defaultGlobalProps) {
      throw new Error('Should only be used once');
    }
    
    const globalProps = JsDomGlobalPolyfill.getAllObjectProperties(global);
    const domProps = JsDomGlobalPolyfill.getAllObjectProperties(jsdomInstance.window);
    JsDomGlobalPolyfill.polyfillProps = domProps.filter(p => !globalProps.includes(p));
    JsDomGlobalPolyfill.defaultGlobalProps = domProps;
    
    for (const prop of JsDomGlobalPolyfill.polyfillProps) {
      if (globalAsAny[prop] !== undefined) {
        throw new Error(`Overwriting global property ${prop}`);
      }
      globalAsAny[prop] = jsdomInstance.window[prop as any];
    }
  }
  
  public static tearDown() {    
    for (const prop of JsDomGlobalPolyfill.polyfillProps) {
      delete globalAsAny[prop];
    }
  }
  
  private static getAllObjectProperties(obj: any): string[] {
    const allProps: string = [];
    let curr: any = obj;
    while (curr) {
      const props = Object.getOwnPropertyNames(curr);
      props.forEach(prop => {
        if (!allProps.includes(prop)){
          allProps.push(prop);
        }
      });
      curr = Object.getPrototypeOf(curr);
    }
    return allProps;
  }
  
}
