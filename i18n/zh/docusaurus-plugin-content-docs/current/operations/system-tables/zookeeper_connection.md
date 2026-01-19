---
description: '仅在配置了 ZooKeeper 时存在的系统表。显示当前与 ZooKeeper 的连接（包括辅助 ZooKeeper 实例）。'
keywords: ['system table', 'zookeeper_connection']
slug: /operations/system-tables/zookeeper_connection
title: 'system.zookeeper_connection'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.zookeeper_connection \{#systemzookeeper_connection\}

<SystemTableCloud />

如果未配置 ZooKeeper，则该表不存在。`system.zookeeper&#95;connection` 表显示当前到 ZooKeeper 的连接（包括辅助 ZooKeeper）。每一行包含一个连接的信息。

列：

* `name` ([String](../../sql-reference/data-types/string.md)) — ZooKeeper 集群的名称。
* `host` ([String](../../sql-reference/data-types/string.md)) — ClickHouse 已连接的 ZooKeeper 节点的主机名/IP。
* `port` ([UIn16](../../sql-reference/data-types/int-uint.md)) — ClickHouse 已连接的 ZooKeeper 节点的端口。
* `index` ([Nullable(UInt8)](../../sql-reference/data-types/int-uint.md)) — ClickHouse 已连接的 ZooKeeper 节点的索引。该索引来源于 ZooKeeper 的配置。如果未连接，此列为 NULL。
* `connected_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 建立连接的时间。
* `session_uptime_elapsed_seconds` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 自连接建立以来经过的秒数。
* `is_expired` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 当前连接是否已过期。
* `keeper_api_version` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Keeper API 版本。
* `client_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — 连接的会话 ID。
* `xid` ([Int64](../../sql-reference/data-types/int-uint.md)) — 当前会话的 XID。
* `enabled_feature_flags` ([Array(Enum16)](../../sql-reference/data-types/array.md)) — 已启用的功能标志。仅适用于 ClickHouse Keeper。可能的取值为 `FILTERED_LIST`、`MULTI_READ`、`CHECK_NOT_EXISTS`、`CREATE_IF_NOT_EXISTS`、`REMOVE_RECURSIVE`。
* `availability_zone` ([String](../../sql-reference/data-types/string.md)) — 可用区。
* `session_timeout_ms` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 会话超时时间（毫秒）。
* `last_zxid_seen` ([Int64](../../sql-reference/data-types/int-uint.md)) — 当前会话最后看到的 zxid。

示例：

```sql
SELECT * FROM system.zookeeper_connection;
```

```text
┌─name────┬─host──────┬─port─┬─index─┬──────connected_time─┬─session_uptime_elapsed_seconds─┬─is_expired─┬─keeper_api_version─┬─client_id─┬─xid─┬─enabled_feature_flags────────────────────────────────────────────────────┬─availability_zone─┐
│ default │ 127.0.0.1 │ 2181 │     0 │ 2025-04-10 14:30:00 │                            943 │          0 │                  0 │       420 │  69 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS'] │ eu-west-1b        │
└─────────┴───────────┴──────┴───────┴─────────────────────┴────────────────────────────────┴────────────┴────────────────────┴───────────┴─────┴──────────────────────────────────────────────────────────────────────────┴───────────────────┘
```
