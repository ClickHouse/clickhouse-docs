---
description: '仅在配置了 ZooKeeper 时存在的系统表。显示当前与 ZooKeeper 的连接（包括辅助 ZooKeeper）。'
slug: /operations/system-tables/zookeeper_connection
title: 'system.zookeeper_connection'
keywords: ['system table', 'zookeeper_connection']
---
import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# zookeeper_connection

<SystemTableCloud/>

如果没有配置 ZooKeeper，则此表不存在。'system.zookeeper_connection' 表显示当前与 ZooKeeper 的连接（包括辅助 ZooKeeper）。每一行显示一个连接的信息。

列：

-   `name` ([String](../../sql-reference/data-types/string.md)) — ZooKeeper 集群的名称。
-   `host` ([String](../../sql-reference/data-types/string.md)) — ClickHouse 连接的 ZooKeeper 节点的主机名/IP。
-   `port` ([String](../../sql-reference/data-types/string.md)) — ClickHouse 连接的 ZooKeeper 节点的端口。
-   `index` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ClickHouse 连接的 ZooKeeper 节点的索引。该索引来自 ZooKeeper 配置。
-   `connected_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 连接建立的时间。
-   `session_uptime_elapsed_seconds` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 自连接建立以来经过的秒数。
-   `is_expired` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 当前连接是否过期。
-   `keeper_api_version` ([String](../../sql-reference/data-types/string.md)) — Keeper API 版本。
-   `client_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 连接的会话 ID。
-   `xid` ([Int32](../../sql-reference/data-types/int-uint.md)) — 当前会话的 Xid。

示例：

``` sql
SELECT * FROM system.zookeeper_connection;
```

``` text
┌─name────┬─host──────┬─port─┬─index─┬──────connected_time─┬─session_uptime_elapsed_seconds─┬─is_expired─┬─keeper_api_version─┬─client_id─┐
│ default │ 127.0.0.1 │ 9181 │     0 │ 2023-06-15 14:36:01 │                           3058 │          0 │                  3 │         5 │
└─────────┴───────────┴──────┴───────┴─────────────────────┴────────────────────────────────┴────────────┴────────────────────┴───────────┘
```
