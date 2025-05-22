import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.zookeeper_connection

<SystemTableCloud/>

如果未配置 ZooKeeper，则此表不存在。 'system.zookeeper_connection' 表显示当前连接到 ZooKeeper 的信息（包括辅助 ZooKeeper）。每一行显示有关一个连接的信息。

列：

-   `name` ([String](../../sql-reference/data-types/string.md)) — ZooKeeper 集群的名称。
-   `host` ([String](../../sql-reference/data-types/string.md)) — ClickHouse 连接的 ZooKeeper 节点的主机名/IP。
-   `port` ([UIn16](../../sql-reference/data-types/int-uint.md)) — ClickHouse 连接的 ZooKeeper 节点的端口。
-   `index` ([Nullable(UInt8)](../../sql-reference/data-types/int-uint.md)) — ClickHouse 连接的 ZooKeeper 节点的索引。该索引来自于 ZooKeeper 配置。如果未连接，则此列为 NULL。
-   `connected_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 连接建立的时间。
-   `session_uptime_elapsed_seconds` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 自连接建立以来经过的秒数。
-   `is_expired` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 当前连接是否已过期。
-   `keeper_api_version` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Keeper API 版本。
-   `client_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — 连接的会话 ID。
-   `xid` ([Int64](../../sql-reference/data-types/int-uint.md)) — 当前会话的 XID。
-   `enabled_feature_flags` ([Array(Enum16)](../../sql-reference/data-types/array.md)) — 启用的特性标志。仅适用于 ClickHouse Keeper。可能的值包括 `FILTERED_LIST`、`MULTI_READ`、`CHECK_NOT_EXISTS`、`CREATE_IF_NOT_EXISTS`、`REMOVE_RECURSIVE`。
-   `availability_zone` ([String](../../sql-reference/data-types/string.md)) — 可用性区域。

示例：

```sql
SELECT * FROM system.zookeeper_connection;
```

```text
┌─name────┬─host──────┬─port─┬─index─┬──────connected_time─┬─session_uptime_elapsed_seconds─┬─is_expired─┬─keeper_api_version─┬─client_id─┬─xid─┬─enabled_feature_flags────────────────────────────────────────────────────┬─availability_zone─┐
│ default │ 127.0.0.1 │ 2181 │     0 │ 2025-04-10 14:30:00 │                            943 │          0 │                  0 │       420 │  69 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS'] │ eu-west-1b        │
└─────────┴───────────┴──────┴───────┴─────────────────────┴────────────────────────────────┴────────────┴────────────────────┴───────────┴─────┴──────────────────────────────────────────────────────────────────────────┴───────────────────┘
```
