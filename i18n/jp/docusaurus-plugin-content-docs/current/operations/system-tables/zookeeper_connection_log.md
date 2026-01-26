---
description: 'ZooKeeper への接続履歴（補助的な ZooKeeper を含む）を表示します。'
keywords: ['system table', 'zookeeper_connection_log']
slug: /operations/system-tables/zookeeper_connection_log
title: 'system.zookeeper_connection_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.zookeeper&#95;connection&#95;log \{#systemzookeeper&#95;connection&#95;log\}

<SystemTableCloud />

&#39;system.zookeeper&#95;connection&#95;log&#39; テーブルは、ZooKeeper への接続履歴（補助 ZooKeeper を含む）を示します。各行は、接続に関する 1 件のイベント情報を表します。

:::note
このテーブルには、サーバーのシャットダウンによって発生した切断イベントは含まれません。
:::

列:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — ZooKeeper に接続または切断したサーバーのホスト名。
* `type` ([Enum8](../../sql-reference/data-types/enum.md)) - イベントの種類。取りうる値: `Connected`, `Disconnected`。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) - エントリの日付。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) - エントリの時刻。
* `event_time_microseconds` ([Date](../../sql-reference/data-types/datetime64.md)) - マイクロ秒精度でのエントリの時刻。
* `name` ([String](../../sql-reference/data-types/string.md)) — ZooKeeper クラスター名。
* `host` ([String](../../sql-reference/data-types/string.md)) — ClickHouse が接続した ZooKeeper ノードのホスト名/IP。
* `port` ([UIn16](../../sql-reference/data-types/int-uint.md)) — ClickHouse が接続した ZooKeeper ノードのポート。
* `index` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ClickHouse が接続または切断した ZooKeeper ノードのインデックス。インデックスは ZooKeeper の設定に由来します。
* `client_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — 接続のセッション ID。
* `keeper_api_version` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Keeper API バージョン。
* `enabled_feature_flags` ([Array(Enum16)](../../sql-reference/data-types/array.md)) — 有効化されているフィーチャーフラグ。ClickHouse Keeper にのみ適用されます。取りうる値は `FILTERED_LIST`, `MULTI_READ`, `CHECK_NOT_EXISTS`, `CREATE_IF_NOT_EXISTS`, `REMOVE_RECURSIVE` です。
* `availability_zone` ([String](../../sql-reference/data-types/string.md)) — アベイラビリティーゾーン。
* `reason` ([String](../../sql-reference/data-types/string.md)) — 接続または切断の理由。

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