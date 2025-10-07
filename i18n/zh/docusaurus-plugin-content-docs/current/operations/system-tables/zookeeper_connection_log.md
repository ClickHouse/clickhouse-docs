---
'description': '显示 ZooKeeper 连接的历史记录（包括辅助 ZooKeeper）。'
'keywords':
- 'system table'
- 'zookeeper_connection_log'
'slug': '/operations/system-tables/zookeeper_connection_log'
'title': 'system.zookeeper_connection_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.zookeeper_connection_log

<SystemTableCloud/>

'system.zookeeper_connection_log' 表显示了 ZooKeeper 连接的历史记录（包括辅助 ZooKeeper）。每一行显示关于一个连接事件的信息。

:::note
该表不包含由于服务器关闭导致的断开连接事件。
:::

列：

-   `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 连接到或从 ZooKeeper 断开的服务器的主机名。
-   `type` ([Enum8](../../sql-reference/data-types/enum.md)) - 事件的类型。可能的值：`Connected`, `Disconnected`。
-   `event_date` ([Date](../../sql-reference/data-types/date.md)) - 条目的日期。
-   `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) - 条目的时间。
-   `event_time_microseconds` ([Date](../../sql-reference/data-types/datetime64.md)) - 带有微秒精度的条目时间。
-   `name` ([String](../../sql-reference/data-types/string.md)) — ZooKeeper 集群的名称。
-   `host` ([String](../../sql-reference/data-types/string.md)) — ClickHouse 连接的 ZooKeeper 节点的主机名/IP。
-   `port` ([UIn16](../../sql-reference/data-types/int-uint.md)) — ClickHouse 连接的 ZooKeeper 节点的端口。
-   `index` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ClickHouse 连接或断开连接的 ZooKeeper 节点的索引。索引来源于 ZooKeeper 配置。
-   `client_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — 连接的会话 ID。
-   `keeper_api_version` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Keeper API 版本。
-   `enabled_feature_flags` ([Array(Enum16)](../../sql-reference/data-types/array.md)) — 启用的功能标志。仅适用于 ClickHouse Keeper。可能的值有 `FILTERED_LIST`, `MULTI_READ`, `CHECK_NOT_EXISTS`, `CREATE_IF_NOT_EXISTS`, `REMOVE_RECURSIVE`。
-   `availability_zone` ([String](../../sql-reference/data-types/string.md)) — 可用区域。
-   `reason` ([String](../../sql-reference/data-types/string.md)) — 连接或断开的原因。

示例：

```sql
SELECT * FROM system.zookeeper_connection_log;
```

```text
    ┌─hostname─┬─type─────────┬─event_date─┬──────────event_time─┬────event_time_microseconds─┬─name───────────────┬─host─┬─port─┬─index─┬─client_id─┬─keeper_api_version─┬─enabled_feature_flags───────────────────────────────────────────────────────────────────────┬─availability_zone─┬─reason──────────────┐
 1. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:35 │ 2025-05-12 19:49:35.713067 │ zk_conn_log_test_4 │ zoo2 │ 2181 │     0 │        10 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Initialization      │
 2. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:23 │ 2025-05-12 19:49:23.981570 │ default            │ zoo1 │ 2181 │     0 │         4 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Initialization      │
 3. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:28 │ 2025-05-12 19:49:28.104021 │ default            │ zoo1 │ 2181 │     0 │         5 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Initialization      │
 4. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.459251 │ zk_conn_log_test_2 │ zoo2 │ 2181 │     0 │         6 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Initialization      │
 5. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.574312 │ zk_conn_log_test_3 │ zoo3 │ 2181 │     0 │         7 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Initialization      │
 6. │ node     │ Disconnected │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.909890 │ default            │ zoo1 │ 2181 │     0 │         5 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Config changed      │
 7. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.909895 │ default            │ zoo2 │ 2181 │     0 │         8 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Config changed      │
 8. │ node     │ Disconnected │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.912010 │ zk_conn_log_test_2 │ zoo2 │ 2181 │     0 │         6 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Config changed      │
 9. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.912014 │ zk_conn_log_test_2 │ zoo3 │ 2181 │     0 │         9 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Config changed      │
10. │ node     │ Disconnected │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.912061 │ zk_conn_log_test_3 │ zoo3 │ 2181 │     0 │         7 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Removed from config │
    └──────────┴──────────────┴────────────┴─────────────────────┴────────────────────────────┴────────────────────┴──────┴──────┴───────┴───────────┴────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────┴───────────────────┴─────────────────────┘
```
