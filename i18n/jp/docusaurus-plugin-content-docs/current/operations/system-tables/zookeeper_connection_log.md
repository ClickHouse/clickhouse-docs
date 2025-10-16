---
'description': 'ZooKeeper 接続の歴史を示します (補助 ZooKeeper を含む)。'
'keywords':
- 'system table'
- 'zookeeper_connection_log'
'slug': '/operations/system-tables/zookeeper_connection_log'
'title': 'system.zookeeper_connection_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.zookeeper_connection_log

<SystemTableCloud/>

'system.zookeeper_connection_log' テーブルは、ZooKeeper 接続の履歴（補助 ZooKeeper を含む）を示します。各行は接続に関する1つのイベントの情報を示します。

:::note
このテーブルには、サーバーのシャットダウンによって引き起こされた切断のイベントは含まれていません。
:::

カラム:

-   `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — ZooKeeper に接続または切断されたサーバーのホスト名。
-   `type` ([Enum8](../../sql-reference/data-types/enum.md)) - イベントのタイプ。可能な値: `Connected`, `Disconnected`。
-   `event_date` ([Date](../../sql-reference/data-types/date.md)) - エントリーの日付。
-   `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) - エントリーの時間。
-   `event_time_microseconds` ([Date](../../sql-reference/data-types/datetime64.md)) - マイクロ秒精度のエントリー時間。
-   `name` ([String](../../sql-reference/data-types/string.md)) — ZooKeeper クラスターの名前。
-   `host` ([String](../../sql-reference/data-types/string.md)) — ClickHouse が接続した ZooKeeper ノードのホスト名/IP。
-   `port` ([UIn16](../../sql-reference/data-types/int-uint.md)) — ClickHouse が接続した ZooKeeper ノードのポート。
-   `index` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ClickHouse が接続または切断した ZooKeeper ノードのインデックス。インデックスは ZooKeeper の設定からのものです。
-   `client_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — 接続のセッション ID。
-   `keeper_api_version` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Keeper API バージョン。
-   `enabled_feature_flags` ([Array(Enum16)](../../sql-reference/data-types/array.md)) — 有効な機能フラグ。ClickHouse Keeper のみに適用されます。可能な値は `FILTERED_LIST`, `MULTI_READ`, `CHECK_NOT_EXISTS`, `CREATE_IF_NOT_EXISTS`, `REMOVE_RECURSIVE`。
-   `availability_zone` ([String](../../sql-reference/data-types/string.md)) — アベイラビリティゾーン。
-   `reason` ([String](../../sql-reference/data-types/string.md)) — 接続または切断の理由。

例:

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
