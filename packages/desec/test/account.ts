import * as chai from 'chai';
import { assert } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as desec from '../src/desec';
import * as nodeFetch from 'node-fetch';

chai.use(chaiAsPromised);

const TEST_ACCOUNT_EMAIL = 'desec_testing@tmailservices.com';
const TEST_ACCOUNT_PASSWORD = 'winkle-guano-sphinx-equator';
const TEST_ACCOUNT_TOKEN = 'kBg-lv0KIQctimYG2zjT.uEaqBkZ';
const TEST_DOMAIN_NAME = 'desec_testing_winkle';

describe('desec.io API tests', () => {

  let desecAPI: desec.DesecAPI;

  before('setup API instance', () => {
    desecAPI = new desec.DesecAPI({fetch: nodeFetch.default});
  });

  it('registration - email already taken', async () => {
    const registerPromise = desecAPI.register({
      email: TEST_ACCOUNT_EMAIL, 
      password: TEST_ACCOUNT_PASSWORD
    });
    await assert.isRejected(registerPromise, desec.EmailAlreadyRegisteredError);
  });

  it('login', async () => {
    const result = await desecAPI.login({
      email: TEST_ACCOUNT_EMAIL, 
      password: TEST_ACCOUNT_PASSWORD
    });
    assert.isString(result.auth_token);
    assert.isAbove(result.auth_token.length, 1);
  });

  it('[logout] destroy new token', async () => {
    await desecAPI.logout();
  });

  it('get account info', async () => {
    desecAPI.authToken = TEST_ACCOUNT_TOKEN;
    const info = await desecAPI.getAccountInfo();
    assert.equal(info.email, TEST_ACCOUNT_EMAIL);
    assert.equal(info.limit_domains, 5);
    assert.equal(info.locked, false);
  });

  it('create domain', async () => {
    const createDomainPromise = desecAPI.createDomain({
      name: TEST_DOMAIN_NAME
    });
    await assert.isRejected(createDomainPromise, desec.DomainNameAlreadyExistsError);
  });

  it('list domains', async () => {
    const domainList = await desecAPI.listDomains();
    const domain = domainList.find(d => d.name === `${TEST_DOMAIN_NAME}.dedyn.io`);
    if (!domain) {
      throw new Error('Should have found domain');
    }
  });

  it('get domain info', async () => {
    const domainInfo = await desecAPI.getDomainInfo({
      name: TEST_DOMAIN_NAME
    });
    assert.strictEqual(domainInfo.created, '2019-08-09T02:17:30Z');
    assert.strictEqual(domainInfo.name, `${TEST_DOMAIN_NAME}.dedyn.io`);
    // assert.strictEqual(domainInfo.published, '2019-08-09T02:17:30.375201Z');
  });

  it('get domain records', async () => {
    const records = await desecAPI.getDomainRecordSets({
      name: TEST_DOMAIN_NAME
    });
    assert.ok(records);
  });

  it('create record set', async () => {
    await desecAPI.createDomainRecordSet({
      name: TEST_DOMAIN_NAME,
      recordSet: {
        ttl: 60,
        type: 'A',
        records: ['1.2.3.4']
      }
    });
    // await assert.isRejected(createPromise, /same subdomain and type exists for this domain/);
  });

  it('update record set', async () => {
    await desecAPI.updateDomainRecordSet({
      name: TEST_DOMAIN_NAME,
      recordSet: {
        ttl: 60,
        type: 'A',
        records: ['2.2.2.2']
      }
    });
    const recordSets = await desecAPI.getDomainRecordSets({
      name: TEST_DOMAIN_NAME,
      filterType: 'A'
    });
    assert.isArray(recordSets);
    assert.lengthOf(recordSets, 1);
    assert.sameMembers(recordSets[0].records, ['2.2.2.2']);
  });

  it('delete record set', async () => {
    await desecAPI.deleteDomainRecordSet({
      name: TEST_DOMAIN_NAME,
      recordSet: {
        type: 'A'
      }
    });
    const records = await desecAPI.getDomainRecordSets({
      name: TEST_DOMAIN_NAME,
      filterType: 'A'
    });
    assert.isArray(records);
    assert.lengthOf(records, 0);
  });

});
