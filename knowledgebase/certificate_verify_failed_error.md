---
date: 2023-05-02
---

# DB::NetException: SSL Exception: error:1000007d:SSL routines:OPENSSL_internal:CERTIFICATE_VERIFY_FAILED

## Cause of the Error

This error occurs while trying to connect to a ClickHouse server using `clickhouse-client`. The cause of the error is either:

- the client configuration file `config.xml` is missing the root certificate in the machine CA default store, or
- there is a self-signed or internal CA certificate that is not configured

## Solution

If using an internal or self-signed CA, configure the CA root certificate in `config.xml` in the client directory (e.g. `/etc/clickhouse-client`) and disable the loading of the default root CA certificates from the default location.

Here is an example configuration:

```xml
<openSSL>
    <client>
        <loadDefaultCAFile>false</loadDefaultCAFile>
        <caConfig>/etc/clickhouse-server/certs/marsnet_ca.crt</caConfig>
        <cacheSessions>true</cacheSessions>
        <disableProtocols>sslv2,sslv3</disableProtocols>
        <preferServerCiphers>true</preferServerCiphers>
        <invalidCertificateHandler>
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```

## Additional resources

View [https://clickhouse.com/docs/en/interfaces/cli/#configuration_files](https://clickhouse.com/docs/en/interfaces/cli/#configuration_files)
