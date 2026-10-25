// eslint-disable-next-line no-shadow
export enum DnsRecordTypeEnum {
    A = 'A',
    AAAA = 'AAAA',
    CNAME = 'CNAME',
    TXT = 'TXT',
    MX = 'MX',
    NS = 'NS',
    SRV = 'SRV',
    CAA = 'CAA',
    PTR = 'PTR',
    SVCB = 'SVCB',
    HTTPS = 'HTTPS',
    LOC = 'LOC',
    SPF = 'SPF',
    CERT = 'CERT',
    DNSKEY = 'DNSKEY',
    DS = 'DS',
    NAPTR = 'NAPTR',
    SMIMEA = 'SMIMEA',
    SSHFP = 'SSHFP',
    TLSA = 'TLSA',
    URI = 'URI',
}

// SOA records are created automatically by Cloudflare and cannot be created
// through the API, but they may appear in record lists (and be editable on
// Enterprise plans), so the type is still valid for display and updates.
export enum DnsReadOnlyRecordTypeEnum {
    SOA = 'SOA',
}
