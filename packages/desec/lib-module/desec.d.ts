export declare class DesecAPI {
    fetchFn: FetchType;
    authToken?: string;
    constructor(opts?: {
        authToken?: string;
        fetch?: FetchType;
    });
    private getAuthToken;
    getAccountInfo(): Promise<AccountInfoResult>;
    register(opts: {
        email: string;
        password: string;
    }): Promise<RegisterResult>;
    login(opts: {
        email: string;
        password: string;
    }): Promise<LoginResult>;
    /** Invalidate an auth token */
    logout(): Promise<void>;
    createDomain(opts: {
        name: string;
        useDefaultRoot?: boolean;
    }): Promise<CreateDomainResult>;
    listDomains(): Promise<ListDomainsResult>;
    getDomainInfo(opts: {
        name: string;
        useDefaultRoot?: boolean;
    }): Promise<DomainInfoResult>;
    getDomainRecordSets(opts: {
        name: string;
        useDefaultRoot?: boolean;
        filterType?: string;
    }): Promise<DomainResourceRecord[]>;
    createDomainRecordSet(opts: {
        recordSet: CreateRecordSetOptions | CreateRecordSetOptions[];
        name: string;
        useDefaultRoot?: boolean;
    }): Promise<DomainResourceRecord | DomainResourceRecord[]>;
    updateDomainRecordSet(opts: {
        recordSet: UpdateRecordSetOptions | UpdateRecordSetOptions[];
        name: string;
        useDefaultRoot?: boolean;
    }): Promise<DomainResourceRecord[]>;
    deleteDomainRecordSet(opts: {
        recordSet: DeleteRecordSetOptions | DeleteRecordSetOptions[];
        name: string;
        useDefaultRoot?: boolean;
    }): Promise<void>;
}
export declare type RequestInit = {
    body?: string | any;
    headers?: {
        [key: string]: any;
    } | string[][];
    method?: string;
    mode?: string | any;
    cache?: string | any;
    referrer?: string;
    redirect?: string | any;
    [key: string]: any;
};
export declare type Response = {
    json(): Promise<any>;
    text(): Promise<string>;
    status: number;
    statusText: string;
    ok: boolean;
    [key: string]: any;
};
export declare type FetchType = (url: string, init?: RequestInit) => Promise<Response>;
export interface AccountInfoResult {
    /**
     * Email address associated with the account. This address must be valid in
     * order to submit support requests to deSEC.
     */
    email: string;
    /**
     * Maximum number of DNS zones the user can create.
     */
    limit_domains: number;
    /**
     * Indicates whether the account is locked. If so, domains put in read-only mode.
     * Changes are not propagated in the DNS system.
     */
    locked: boolean;
}
export interface RegisterResult {
    email: string;
}
export interface LoginResult {
    auth_token: string;
}
export interface CreateDomainResult {
    /**
     * Timestamp of domain creation, in ISO 8601 format (e.g. 2013-01-29T12:34:56.000000Z).
     */
    created: string;
    /**
     * Array with DNSSEC key information. Each entry contains DNSKEY and DS record contents
     * (the latter being computed from the former), and some extra information. For delegation
     * of DNSSEC-secured domains, the parent domain needs to publish these DS records. (This
     * usually involves telling your registrar/registry about those records, and they will
     * publish them for you.)
     * Notes: Newly created domains are assigned a key after a short while (usually around one
     * minute). Until then, this field is empty. The contents of this field are generated from
     * PowerDNS’ cryptokeys endpoint, see https://doc.powerdns.com/md/httpapi/api_spec/#cryptokeys.
     * We look at each active cryptokey_resource (active is true) and then use the dnskey, ds,
     * flags, and keytype fields.
     */
    keys: any[];
    /**
     * Smallest TTL that can be used in an RRset. The value is set automatically by the server.
     * If you would like to use lower TTL values, you can apply for an exception by contacting
     * support. We reserve the right to reject applications at our discretion.
     */
    minimum_ttl: number;
    /**
     * Domain name. Restrictions on what is a valid domain name apply on a per-user basis. In
     * general, a domain name consists of lowercase alphanumeric characters as well as hyphens
     *  - and underscores _ (except at the beginning of the name). The maximum length is 191.
     */
    name: string;
}
export interface DomainResourceRecord {
    /**
     * Name of the zone to which the RRset belongs.
     * Note that the zone name does not follow immediately from the RRset name.
     * For example, the `com` zone contains an RRset of type `NS` for the name
     * `example.com.`, in order to set up the delegation to `example.com`’s DNS
     * operator. The DNS operator’s nameserver again has a similar `NS` RRset
     * which, this time however, belongs to the `example.com` zone.
     */
    domain: string;
    /**
     * The full DNS name of the RRset. If `subname` is empty, this is equal to
     * `:name.`, otherwise it is equal to `:subname.:name.`.
     */
    name: string;
    /**
     * Array of record content strings. Please note that when a record value contains
     * a domain name, it is in almost all cases required to add a final dot after
     * the domain name. This applies, for example, to the CNAME, MX, and SRV record
     * types. A typical MX value would thus be be 10 mx.example.com. (note the
     * trailing dot). Please also consider the caveat on the priority field. The
     * maximum number of array elements is 4091, and the maximum length of the array
     * is 64,000 (after JSON encoding).
     */
    records: string[];
    /**
     * Subdomain string which, together with domain, defines the RRset name. Typical
     * examples are www or _443._tcp. In general, a subname consists of lowercase
     * alphanumeric characters as well as hyphens -, underscores _, and dots ..
     * Wildcard name components are denoted by *; this is allowed only once at the
     * beginning of the name (see RFC 4592 for details). The maximum length is 178.
     * Further restrictions may apply on a per-user basis.
     */
    subname: string;
    /**
     * TTL (time-to-live) value, which dictates for how long resolvers may cache this
     * RRset, measured in seconds. The smallest acceptable value is given by the
     * domain’s minimum TTL setting. The maximum value is 604800 (one week).
     */
    ttl: number;
    /**
     * RRset type (uppercase). We support all RRset types supported by PowerDNS, with
     * the exception of DNSSEC-related types (the backend automagically takes care of
     * setting those records properly). You also cannot access the SOA, see SOA caveat.
     */
    type: string;
}
export interface CreateRecordSetOptions extends Pick<DomainResourceRecord, 'type' | 'records' | 'ttl'>, Partial<Pick<DomainResourceRecord, 'subname'>> {
}
export interface UpdateRecordSetOptions extends Pick<DomainResourceRecord, 'type'>, Partial<Pick<DomainResourceRecord, 'records' | 'ttl' | 'subname'>> {
}
export interface DeleteRecordSetOptions extends Pick<DomainResourceRecord, 'type'>, Partial<Pick<DomainResourceRecord, 'subname'>> {
}
export interface DomainInfoResult {
    /**
     * Timestamp of domain creation, in ISO 8601 format (e.g. 2013-01-29T12:34:56.000000Z).
     */
    created: string;
    /**
     * Array with DNSSEC key information. Each entry contains DNSKEY and DS record contents
     * (the latter being computed from the former), and some extra information. For delegation
     * of DNSSEC-secured domains, the parent domain needs to publish these DS records. (This
     * usually involves telling your registrar/registry about those records, and they will
     * publish them for you.)
     * Notes: Newly created domains are assigned a key after a short while (usually around one
     * minute). Until then, this field is empty. The contents of this field are generated from
     * PowerDNS’ cryptokeys endpoint, see https://doc.powerdns.com/md/httpapi/api_spec/#cryptokeys.
     * We look at each active cryptokey_resource (active is true) and then use the dnskey, ds,
     * flags, and keytype fields.
     */
    keys: any[];
    /**
     * Smallest TTL that can be used in an RRset. The value is set automatically by the server.
     * If you would like to use lower TTL values, you can apply for an exception by contacting
     * support. We reserve the right to reject applications at our discretion.
     */
    minimum_ttl: number;
    /**
     * Domain name. Restrictions on what is a valid domain name apply on a per-user basis. In
     * general, a domain name consists of lowercase alphanumeric characters as well as hyphens
     *  - and underscores _ (except at the beginning of the name). The maximum length is 191.
     */
    name: string;
    /**
     * Timestamp of when the domain’s DNS records have last been published, in ISO 8601 format
     * (e.g. 2013-01-29T12:34:56.000000Z). As we publish record modifications immediately, this
     * indicates the point in time of the last successful write request to a domain’s rrsets/
     * endpoint.
     */
    published: string;
}
export interface ListDomainsResult extends Array<DomainInfoResult> {
}
export declare class ApiError extends Error {
    httpStatus: number;
    httpStatusText: string;
    responseText?: string;
    responseJson?: any;
    constructor(httpStatus: number, httpStatusText: string, responseText?: string);
}
export declare class EmailAlreadyRegisteredError extends ApiError {
    constructor(error: ApiError);
}
export declare class DomainNameAlreadyExistsError extends ApiError {
    constructor(error: ApiError);
}
export declare class DomainUnavailableError extends ApiError {
    constructor(error: ApiError);
}
//# sourceMappingURL=desec.d.ts.map