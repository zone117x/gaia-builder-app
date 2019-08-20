import * as chai from 'chai';
import { assert } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as jsdom from 'jsdom';
import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';
import JsDomGlobalPolyfill from './JsDomGlobalPolyfill';
import * as main from '../src/index';
import * as viewModel from '../src/viewModel';

chai.use(chaiAsPromised);

describe('app tests', () => {

  let jsdomInstance: jsdom.JSDOM;

  before('add jsdom global polyfills for node.js runtime', () => {
    const indexHtmlPath = path.resolve(__dirname, '../index.html');
    assert.isTrue(fs.existsSync(indexHtmlPath), `File does not exist at ${indexHtmlPath}`);
    const indexHtml = fs.readFileSync(indexHtmlPath, { encoding: 'utf8'});
    jsdomInstance = new jsdom.JSDOM(indexHtml, { url: 'http://localhost' });
    JsDomGlobalPolyfill.setup(jsdomInstance);
    (global as any)['fetch'] = fetch;
  });

  after('cleanup jsdom global polyfills', () => {
    JsDomGlobalPolyfill.tearDown();
    delete (global as any)['fetch'];
  });

  it('todo', async () => {
    assert.ok(true, 'okay');
    const thing = await main.testThing();
    assert.ok(thing);
    // main.
  });

  it('reference desec', () => {
    const inst = main.createDesecInst();
    assert.notOk(inst.authToken);
  });

  it('test viewModel', () => {
    viewModel.domTest();
  });

});

