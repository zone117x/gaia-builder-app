const API_ENDPOINT = 'https://desec.io/api/v1';
const USER_AGENT = 'blockstack-gaia-desec';
const DEFAULT_ROOT_DOMAIN = 'dedyn.io';
export class DesecAPI {
    constructor(opts) {
        if (opts && opts.fetch) {
            this.fetchFn = opts.fetch;
        }
        else if (typeof fetch !== 'undefined') {
            this.fetchFn = fetch;
        }
        else {
            throw new Error('The `fetch` API is not available. It must be specified.');
        }
        if (opts && opts.authToken) {
            this.authToken = opts.authToken;
        }
    }
    getAuthToken() {
        if (!this.authToken) {
            throw new Error('The `authToken` variable has not been set. Either specify '
                + 'it in the constructor or call the `login` function');
        }
        else {
            return this.authToken;
        }
    }
    async getAccountInfo() {
        const url = `${API_ENDPOINT}/auth/me/`;
        const fetchOpts = getDefaultFetchOpts({
            method: 'GET',
            authToken: this.getAuthToken()
        });
        const response = await this.fetchFn(url, fetchOpts);
        const apiError = await checkBadResponse(response);
        if (apiError) {
            throw apiError;
        }
        const accountInfo = await response.json();
        return accountInfo;
    }
    async register(opts) {
        const url = `${API_ENDPOINT}/auth/users/`;
        const data = {
            'email': opts.email,
            'password': opts.password
        };
        const fetchOpts = getDefaultFetchOpts({
            method: 'POST',
            contentType: 'application/json',
            body: JSON.stringify(data)
        });
        const response = await this.fetchFn(url, fetchOpts);
        const apiError = await checkBadResponse(response);
        if (apiError) {
            if (apiError.responseJson
                && apiError.responseJson.email
                && typeof apiError.responseJson.email[0] === 'string'
                && apiError.responseJson.email[0].includes('already exists')) {
                throw new EmailAlreadyRegisteredError(apiError);
            }
            throw apiError;
        }
        const loginResult = await response.json();
        return loginResult;
    }
    async login(opts) {
        const url = `${API_ENDPOINT}/auth/token/login/`;
        const data = {
            'email': opts.email,
            'password': opts.password
        };
        const fetchOpts = getDefaultFetchOpts({
            method: 'POST',
            contentType: 'application/json',
            body: JSON.stringify(data)
        });
        const response = await this.fetchFn(url, fetchOpts);
        const apiError = await checkBadResponse(response);
        if (apiError) {
            throw apiError;
        }
        const loginResult = await response.json();
        this.authToken = loginResult.auth_token;
        return loginResult;
    }
    /** Invalidate an auth token */
    async logout() {
        const url = `${API_ENDPOINT}/auth/token/logout/`;
        const fetchOpts = getDefaultFetchOpts({
            method: 'POST',
            authToken: this.getAuthToken()
        });
        const response = await this.fetchFn(url, fetchOpts);
        const apiError = await checkBadResponse(response);
        if (apiError) {
            throw apiError;
        }
        this.authToken = undefined;
    }
    async createDomain(opts) {
        const fullDomainName = getFullDomainName(opts.name, opts.useDefaultRoot);
        const url = `${API_ENDPOINT}/domains/`;
        const data = {
            'name': fullDomainName
        };
        const fetchOpts = getDefaultFetchOpts({
            method: 'POST',
            authToken: this.getAuthToken(),
            contentType: 'application/json',
            body: JSON.stringify(data)
        });
        const response = await this.fetchFn(url, fetchOpts);
        const apiError = await checkBadResponse(response);
        if (apiError) {
            if (apiError.responseJson
                && apiError.responseJson.code
                && apiError.responseJson.code === 'domain-unavailable') {
                throw new DomainUnavailableError(apiError);
            }
            if (apiError.responseJson
                && apiError.responseJson.name
                && typeof apiError.responseJson.name[0] === 'string'
                && typeof apiError.responseJson.name[0].includes('name already exists')) {
                throw new DomainNameAlreadyExistsError(apiError);
            }
            throw apiError;
        }
        const result = await response.json();
        return result;
    }
    async listDomains() {
        const url = `${API_ENDPOINT}/domains/`;
        const fetchOpts = getDefaultFetchOpts({
            method: 'GET',
            authToken: this.getAuthToken()
        });
        const response = await this.fetchFn(url, fetchOpts);
        const apiError = await checkBadResponse(response);
        if (apiError) {
            throw apiError;
        }
        const result = await response.json();
        return result;
    }
    async getDomainInfo(opts) {
        const fullDomainName = getFullDomainName(opts.name, opts.useDefaultRoot);
        const url = `${API_ENDPOINT}/domains/${fullDomainName}/`;
        const fetchOpts = getDefaultFetchOpts({
            method: 'GET',
            authToken: this.getAuthToken()
        });
        const response = await this.fetchFn(url, fetchOpts);
        const apiError = await checkBadResponse(response);
        if (apiError) {
            throw apiError;
        }
        const result = await response.json();
        return result;
    }
    async getDomainRecordSets(opts) {
        const fullDomainName = getFullDomainName(opts.name, opts.useDefaultRoot);
        let url = `${API_ENDPOINT}/domains/${fullDomainName}/rrsets/`;
        if (opts.filterType !== undefined) {
            url += `?type=${opts.filterType}`;
        }
        const fetchOpts = getDefaultFetchOpts({
            method: 'GET',
            authToken: this.getAuthToken()
        });
        const response = await this.fetchFn(url, fetchOpts);
        const apiError = await checkBadResponse(response);
        if (apiError) {
            throw apiError;
        }
        const result = await response.json();
        return result;
    }
    async createDomainRecordSet(opts) {
        const fullDomainName = getFullDomainName(opts.name, opts.useDefaultRoot);
        const url = `${API_ENDPOINT}/domains/${fullDomainName}/rrsets/`;
        const fetchOpts = getDefaultFetchOpts({
            method: 'POST',
            authToken: this.getAuthToken(),
            contentType: 'application/json',
            body: JSON.stringify(opts.recordSet)
        });
        const response = await this.fetchFn(url, fetchOpts);
        const apiError = await checkBadResponse(response);
        if (apiError) {
            throw apiError;
        }
        const result = await response.json();
        return result;
    }
    async updateDomainRecordSet(opts) {
        const fullDomainName = getFullDomainName(opts.name, opts.useDefaultRoot);
        const url = `${API_ENDPOINT}/domains/${fullDomainName}/rrsets/`;
        let recordSet;
        if (Array.isArray(opts.recordSet)) {
            recordSet = opts.recordSet;
        }
        else {
            recordSet = [opts.recordSet];
        }
        recordSet.forEach(record => {
            if (record.subname === undefined) {
                record.subname = '';
            }
        });
        const fetchOpts = getDefaultFetchOpts({
            method: 'PATCH',
            authToken: this.getAuthToken(),
            contentType: 'application/json',
            body: JSON.stringify(recordSet)
        });
        const response = await this.fetchFn(url, fetchOpts);
        const apiError = await checkBadResponse(response);
        if (apiError) {
            throw apiError;
        }
        const result = await response.json();
        return result;
    }
    async deleteDomainRecordSet(opts) {
        let recordSet;
        if (Array.isArray(opts.recordSet)) {
            recordSet = opts.recordSet.map(item => {
                return Object.assign(item, { records: [] });
            });
        }
        else {
            recordSet = [Object.assign(opts.recordSet, { records: [] })];
        }
        recordSet.forEach(record => {
            if (record.subname === undefined) {
                record.subname = '';
            }
        });
        const fullDomainName = getFullDomainName(opts.name, opts.useDefaultRoot);
        const url = `${API_ENDPOINT}/domains/${fullDomainName}/rrsets/`;
        const fetchOpts = getDefaultFetchOpts({
            method: 'PATCH',
            authToken: this.getAuthToken(),
            contentType: 'application/json',
            body: JSON.stringify(recordSet)
        });
        const response = await this.fetchFn(url, fetchOpts);
        const apiError = await checkBadResponse(response);
        if (apiError) {
            throw apiError;
        }
        const result = await response.json();
        return result;
    }
}
function getDefaultFetchOpts(opts) {
    const paramHeaders = {};
    if (opts.authToken) {
        paramHeaders['Authorization'] = `Token ${opts.authToken}`;
    }
    if (opts.contentType) {
        paramHeaders['Content-Type'] = opts.contentType;
    }
    const optsResult = {
        method: opts.method,
        mode: 'cors',
        cache: 'no-cache',
        redirect: 'follow',
        referrer: 'no-referrer',
        headers: Object.assign({
            'User-Agent': USER_AGENT
        }, paramHeaders, opts.headers)
    };
    if (opts.body !== undefined && opts.body !== null) {
        optsResult.body = opts.body;
    }
    return optsResult;
}
async function checkBadResponse(response) {
    if (response.ok) {
        return false;
    }
    let responseString;
    try {
        responseString = await response.text();
    }
    catch (_err) {
        // ignore
    }
    return new ApiError(response.status, response.statusText, responseString);
}
function getFullDomainName(name, useDefaultRoot = true) {
    if (useDefaultRoot && !name.endsWith(`.${DEFAULT_ROOT_DOMAIN}`)) {
        return `${name}.${DEFAULT_ROOT_DOMAIN}`;
    }
    return name;
}
export class ApiError extends Error {
    constructor(httpStatus, httpStatusText, responseText) {
        let message = `${httpStatus}: ${httpStatusText}`;
        let responseJson;
        if (responseText) {
            message += ` - ${responseText}`;
            try {
                responseJson = JSON.parse(responseText);
            }
            catch (_err) { }
        }
        super(message);
        this.name = this.constructor.name;
        this.httpStatus = httpStatus;
        this.httpStatusText = httpStatusText;
        this.responseText = responseText;
        this.responseJson = responseJson;
    }
}
export class EmailAlreadyRegisteredError extends ApiError {
    constructor(error) {
        super(error.httpStatus, error.httpStatusText, error.responseText);
        this.name = this.constructor.name;
        this.message = error.responseJson.email[0];
    }
}
export class DomainNameAlreadyExistsError extends ApiError {
    constructor(error) {
        super(error.httpStatus, error.httpStatusText, error.responseText);
        this.name = this.constructor.name;
        this.message = error.responseJson.name[0];
    }
}
export class DomainUnavailableError extends ApiError {
    constructor(error) {
        super(error.httpStatus, error.httpStatusText, error.responseText);
        this.name = this.constructor.name;
        this.message = error.responseJson.detail || error.responseJson.code;
    }
}
//# sourceMappingURL=desec.js.map