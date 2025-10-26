---
'description': 'ZooKeeperが構成されている場合のみ存在するシステムテーブル。現在のZooKeeperへの接続（補助的なZooKeeperを含む）を表示します。'
'keywords':
- 'system table'
- 'zookeeper_connection'
'slug': '/operations/system-tables/zookeeper_connection'
'title': 'system.zookeeper_connection'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.zookeeper_connection

<SystemTableCloud/>

このテーブルは、ZooKeeperが設定されていない場合は存在しません。 `system.zookeeper_connection` テーブルは、現在のZooKeeper（補助ZooKeeperを含む）への接続を示します。各行は1つの接続に関する情報を表示します。

カラム:

-   `name` ([String](../../sql-reference/data-types/string.md)) — ZooKeeperクラスターの名前。
-   `host` ([String](../../sql-reference/data-types/string.md)) — ClickHouseが接続したZooKeeperノードのホスト名/IP。
-   `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — ClickHouseが接続したZooKeeperノードのポート。
-   `index` ([Nullable(UInt8)](../../sql-reference/data-types/int-uint.md)) — ClickHouseが接続したZooKeeperノードのインデックス。インデックスはZooKeeperの設定からのものです。接続されていない場合、このカラムはNULLです。
-   `connected_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 接続が確立された時刻。
-   `session_uptime_elapsed_seconds` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 接続が確立されてから経過した秒数。
-   `is_expired` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 現在の接続が期限切れかどうか。
-   `keeper_api_version` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Keeper APIのバージョン。
-   `client_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — 接続のセッションID。
-   `xid` ([Int64](../../sql-reference/data-types/int-uint.md)) — 現在のセッションのXID。
-   `enabled_feature_flags` ([Array(Enum16)](../../sql-reference/data-types/array.md)) — 有効な機能フラグ。ClickHouse Keeperにのみ適用されます。考えられる値は `FILTERED_LIST`, `MULTI_READ`, `CHECK_NOT_EXISTS`, `CREATE_IF_NOT_EXISTS`, `REMOVE_RECURSIVE` です。
-   `availability_zone` ([String](../../sql-reference/data-types/string.md)) — アベイラビリティゾーン。

例:

```sql
SELECT * FROM system.zookeeper_connection;
```

```text
┌─name────┬─host──────┬─port─┬─index─┬──────connected_time─┬─session_uptime_elapsed_seconds─┬─is_expired─┬─keeper_api_version─┬─client_id─┬─xid─┬─enabled_feature_flags────────────────────────────────────────────────────┬─availability_zone─┐
│ default │ 127.0.0.1 │ 2181 │     0 │ 2025-04-10 14:30:00 │                            943 │          0 │                  0 │       420 │  69 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS'] │ eu-west-1b        │
└─────────┴───────────┴──────┴───────┴─────────────────────┴────────────────────────────────┴────────────┴────────────────────┴───────────┴─────┴──────────────────────────────────────────────────────────────────────────┴───────────────────┘
```
