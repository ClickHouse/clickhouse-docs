---
sidebar_position: 1
title: Troubleshooting
date: 2022-12-06
---
import SelfManagedTroubleshooting from '@site/docs/en/operations/_troubleshooting.md';

## ClickHouse Cloud Troubleshooting

### Unable to access a ClickHouse Cloud service

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

Check the [IP Access List](https://clickhouse.com/docs/en/cloud/security/ip-access-list.md), if you are attempting to connect from outside the allowed list then your connection will fail.

## Self-managed ClickHouse Troubleshooting

<SelfManagedTroubleshooting />
