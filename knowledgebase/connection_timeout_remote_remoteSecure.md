---
description: "When using the `remote` or `remoteSecure` table functions on a node that is located more than 100ms (latency wise) away from the remote node, it is common to encounter the following timeout error."
date: 2023-03-20
---

# Code: 279. DB::NetException: All connection tries failed.

**Problem**
[`remote()` or `remoteSecure()`](https://clickhouse.com/docs/en/sql-reference/table-functions/remote/) table function allows the access of remote table from another ClickHouse node.

When using these functions on a node that is located more than 100ms (latency wise) away from the remote node, it is common to encounter the following timeout error.

```
4776d4bd8190 :) SELECT * FROM remoteSecure('HOSTNAME.us-east-2.aws.clickhouse.cloud', DATABASE, TABLE, 'USER', 'USER_PASSWORD')

SELECT *
FROM remoteSecure('HOSTNAME.us-east-2.aws.clickhouse.cloud', DATABASE, TABLE, 'USER', 'USER_PASSWORD')

Query id: 2bd6ddd0-66d9-4d19-830f-87e3cec3724b


0 rows in set. Elapsed: 1.213 sec.

Received exception from server (version 22.6.9):
Code: 519. DB::Exception: Received from localhost:9000. DB::NetException. DB::NetException: All attempts to get table structure failed. Log:

Code: 279. DB::NetException: All connection tries failed. Log:

Code: 209. DB::NetException: Timeout: connect timed out: 18.218.245.169:9440 (hc7d963h1t.us-east-2.aws.clickhouse.cloud:9440, connection timeout 100 ms). (SOCKET_TIMEOUT) (version 22.6.9.11 (official build))
Code: 209. DB::NetException: Timeout: connect timed out: 18.218.245.169:9440 (hc7d963h1t.us-east-2.aws.clickhouse.cloud:9440, connection timeout 100 ms). (SOCKET_TIMEOUT) (version 22.6.9.11 (official build))
Code: 209. DB::NetException: Timeout: connect timed out: 18.218.245.169:9440 (hc7d963h1t.us-east-2.aws.clickhouse.cloud:9440, connection timeout 100 ms). (SOCKET_TIMEOUT) (version 22.6.9.11 (official build))

. (ALL_CONNECTION_TRIES_FAILED) (version 22.6.9.11 (official build))

. (NO_REMOTE_SHARD_AVAILABLE)
```

**Workaround**
To get increase the connection timeout, set [`connect_timeout_with_failover_secure_ms`](https://github.com/ClickHouse/ClickHouse/blob/master/src/Core/Settings.h#L67) to a higher value (e.g. 1 second) from the default 100ms.

```
4776d4bd8190 :) SELECT * FROM remoteSecure('HOSTNAME.us-east-2.aws.clickhouse.cloud:9440', DATABASE, TABLE, 'USER', 'USER_PASSWORD') SETTINGS connect_timeout_with_failover_secure_ms = 1000

SELECT *
FROM remoteSecure('HOSTNAME.us-east-2.aws.clickhouse.cloud:9440', DATABASE, TABLE, 'USER', 'USER_PASSWORD')
SETTINGS connect_timeout_with_failover_secure_ms = 1000

Query id: 8e2f4d41-307b-4e61-abb8-809190023247

┌─x─┐
│ 1 │
└───┘

1 row in set. Elapsed: 2.403 sec.
```
