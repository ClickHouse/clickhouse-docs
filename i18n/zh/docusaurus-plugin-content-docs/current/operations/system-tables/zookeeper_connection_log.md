---
description: '显示 ZooKeeper 连接历史（包括辅助 ZooKeeper）。'
keywords: ['system table', 'zookeeper_connection_log']
slug: /operations/system-tables/zookeeper_connection_log
title: 'system.zookeeper_connection_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.zookeeper&#95;connection&#95;log

<SystemTableCloud />

`system.zookeeper&#95;connection&#95;log` 表显示 ZooKeeper 连接（包括辅助 ZooKeeper）的历史记录。每一行对应一个与连接相关的事件。

:::note
该表不包含由于服务器关闭导致的断开连接事件。
:::

列：

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 与 ZooKeeper 建立连接或断开连接的服务器主机名。
* `type` ([Enum8](../../sql-reference/data-types/enum.md)) - 事件类型。可能的取值：`Connected`、`Disconnected`。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) - 记录的日期。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) - 记录的时间。
* `event_time_microseconds` ([Date](../../sql-reference/data-types/datetime64.md)) - 具有微秒精度的记录时间。
* `name` ([String](../../sql-reference/data-types/string.md)) — ZooKeeper 集群名称。
* `host` ([String](../../sql-reference/data-types/string.md)) — ClickHouse 所连接的 ZooKeeper 节点的主机名/IP。
* `port` ([UIn16](../../sql-reference/data-types/int-uint.md)) — ClickHouse 所连接的 ZooKeeper 节点的端口。
* `index` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ClickHouse 连接到或从其断开连接的 ZooKeeper 节点索引。该索引来自 ZooKeeper 配置。
* `client_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — 该连接的会话 ID。
* `keeper_api_version` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Keeper API 版本。
* `enabled_feature_flags` ([Array(Enum16)](../../sql-reference/data-types/array.md)) — 已启用的功能标志。仅适用于 ClickHouse Keeper。可能的取值为 `FILTERED_LIST`、`MULTI_READ`、`CHECK_NOT_EXISTS`、`CREATE_IF_NOT_EXISTS`、`REMOVE_RECURSIVE`。
* `availability_zone` ([String](../../sql-reference/data-types/string.md)) — 可用区。
* `reason` ([String](../../sql-reference/data-types/string.md)) — 连接或断开连接的原因。

Example:

```sql
SELECT * FROM system.zookeeper_connection_log;
```


```text
┌─hostname─┬─type─────────┬─event_date─┬──────────event_time─┬────event_time_microseconds─┬─name───────────────┬─host─┬─port─┬─index─┬─client_id─┬─keeper_api_version─┬─enabled_feature_flags───────────────────────────────────────────────────────────────────────┬─availability_zone─┬─reason──────────────┐
 1. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:35 │ 2025-05-12 19:49:35.713067 │ zk_conn_log_test_4 │ zoo2 │ 2181 │     0 │        10 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ 初始化      │
 2. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:23 │ 2025-05-12 19:49:23.981570 │ default            │ zoo1 │ 2181 │     0 │         4 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ 初始化      │
 3. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:28 │ 2025-05-12 19:49:28.104021 │ default            │ zoo1 │ 2181 │     0 │         5 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ 初始化      │
 4. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.459251 │ zk_conn_log_test_2 │ zoo2 │ 2181 │     0 │         6 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ 初始化      │
 5. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.574312 │ zk_conn_log_test_3 │ zoo3 │ 2181 │     0 │         7 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ 初始化      │
 6. │ node     │ Disconnected │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.909890 │ default            │ zoo1 │ 2181 │     0 │         5 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ 配置变更      │
 7. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.909895 │ default            │ zoo2 │ 2181 │     0 │         8 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ 配置变更      │
 8. │ node     │ Disconnected │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.912010 │ zk_conn_log_test_2 │ zoo2 │ 2181 │     0 │         6 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ 配置变更      │
 9. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.912014 │ zk_conn_log_test_2 │ zoo3 │ 2181 │     0 │         9 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ 配置变更      │
10. │ node     │ Disconnected │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.912061 │ zk_conn_log_test_3 │ zoo3 │ 2181 │     0 │         7 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ 从配置中移除 │
    └──────────┴──────────────┴────────────┴─────────────────────┴────────────────────────────┴────────────────────┴──────┴──────┴───────┴───────────┴────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────┴───────────────────┴─────────────────────┘
```