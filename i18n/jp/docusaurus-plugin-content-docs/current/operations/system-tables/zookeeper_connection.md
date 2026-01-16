---
description: 'ZooKeeper が設定されている場合にのみ存在するシステムテーブル。現在の ZooKeeper への接続状況（補助的な ZooKeeper を含む）を表示します。'
keywords: ['システムテーブル', 'zookeeper_connection']
slug: /operations/system-tables/zookeeper_connection
title: 'system.zookeeper_connection'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.zookeeper_connection \{#systemzookeeper_connection\}

<SystemTableCloud />

ZooKeeper が構成されていない場合、このテーブルは存在しません。`system.zookeeper&#95;connection` テーブルは、ZooKeeper への現在の接続（追加の ZooKeeper を含む）を表示します。各行は 1 つの接続に関する情報を示します。

カラム:

* `name` ([String](../../sql-reference/data-types/string.md)) — ZooKeeper クラスター名。
* `host` ([String](../../sql-reference/data-types/string.md)) — ClickHouse が接続した ZooKeeper ノードのホスト名/IP。
* `port` ([UIn16](../../sql-reference/data-types/int-uint.md)) — ClickHouse が接続した ZooKeeper ノードのポート。
* `index` ([Nullable(UInt8)](../../sql-reference/data-types/int-uint.md)) — ClickHouse が接続した ZooKeeper ノードのインデックス。インデックスは ZooKeeper の設定に由来します。未接続の場合、このカラムは NULL です。
* `connected_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 接続が確立された時刻。
* `session_uptime_elapsed_seconds` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 接続が確立されてから経過した秒数。
* `is_expired` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 現在の接続が期限切れかどうか。
* `keeper_api_version` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Keeper API バージョン。
* `client_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — 接続のセッション ID。
* `xid` ([Int64](../../sql-reference/data-types/int-uint.md)) — 現在のセッションの XID。
* `enabled_feature_flags` ([Array(Enum16)](../../sql-reference/data-types/array.md)) — 有効になっているフィーチャーフラグ。ClickHouse Keeper にのみ適用されます。取り得る値は `FILTERED_LIST`, `MULTI_READ`, `CHECK_NOT_EXISTS`, `CREATE_IF_NOT_EXISTS`, `REMOVE_RECURSIVE` です。
* `availability_zone` ([String](../../sql-reference/data-types/string.md)) — アベイラビリティゾーン。
* `session_timeout_ms` ([UInt64](../../sql-reference/data-types/int-uint.md)) — セッションタイムアウト（ミリ秒）。
* `last_zxid_seen` ([Int64](../../sql-reference/data-types/int-uint.md)) — 現在のセッションで最後に確認された zxid。

例:

```sql
SELECT * FROM system.zookeeper_connection;
```

```text
┌─name────┬─host──────┬─port─┬─index─┬──────connected_time─┬─session_uptime_elapsed_seconds─┬─is_expired─┬─keeper_api_version─┬─client_id─┬─xid─┬─enabled_feature_flags────────────────────────────────────────────────────┬─availability_zone─┐
│ default │ 127.0.0.1 │ 2181 │     0 │ 2025-04-10 14:30:00 │                            943 │          0 │                  0 │       420 │  69 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS'] │ eu-west-1b        │
└─────────┴───────────┴──────┴───────┴─────────────────────┴────────────────────────────────┴────────────┴────────────────────┴───────────┴─────┴──────────────────────────────────────────────────────────────────────────┴───────────────────┘
```
