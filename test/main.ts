import * as chai from 'chai';
import { assert } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as main from '../src';

chai.use(chaiAsPromised);

describe('app tests', () => {

  it('todo', async () => {
    assert.ok(true, 'okay');
    const thing = await main.testThing();
    assert.ok(thing);
    // main.
  });

  it('referene desec', () => {
    const inst = main.createDesecInst();
    assert.notOk(inst.authToken);
  });

});
