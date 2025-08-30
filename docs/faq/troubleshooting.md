---
title: 'Troubleshooting'
slug: /faq/troubleshooting
description: 'How to troubleshoot common ClickHouse Cloud error messages.'
doc_type: 'how-to'
---

## ClickHouse Cloud troubleshooting {#clickhouse-cloud-troubleshooting}

### Unable to access a ClickHouse Cloud service {#unable-to-access-a-clickhouse-cloud-service}

If you are seeing an error message like one of these, your IP Access List may be denying access:

```response
curl: (35) error:02FFF036:system library:func(4095):Connection reset by peer
```
or
```response
curl: (35) LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to HOSTNAME.clickhouse.cloud:8443
```
or
```response
Code: 210. DB::NetException: SSL connection unexpectedly closed (e46453teek.us-east-2.aws.clickhouse-staging.com:9440). (NETWORK_ERROR)
```

Check the [IP Access List](/cloud/security/setting-ip-filters), if you are attempting to connect from outside the allowed list then your connection will fail.
