---
description: 'ZooKeeper が構成されている場合にのみ存在するシステムテーブル。現在の ZooKeeper への接続を表示します（補助的な
  ZooKeeper を含む）。'
keywords:
- 'system table'
- 'zookeeper_connection'
slug: '/operations/system-tables/zookeeper_connection'
title: 'system.zookeeper_connection'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.zookeeper_connection

<SystemTableCloud/>

このテーブルはZooKeeperが構成されていない場合は存在しません。'system.zookeeper_connection' テーブルは、ZooKeeperへの現在の接続（補助ZooKeeperを含む）を示します。各行は1つの接続に関する情報を示します。

カラム:

-   `name` ([String](../../sql-reference/data-types/string.md)) — ZooKeeperクラスタの名前。
-   `host` ([String](../../sql-reference/data-types/string.md)) — ClickHouseが接続しているZooKeeperノードのホスト名/IP。
-   `port` ([UIn16](../../sql-reference/data-types/int-uint.md)) — ClickHouseが接続しているZooKeeperノードのポート。
-   `index` ([Nullable(UInt8)](../../sql-reference/data-types/int-uint.md)) — ClickHouseが接続しているZooKeeperノードのインデックス。このインデックスはZooKeeperの設定からのものです。接続されていない場合、このカラムはNULLです。
-   `connected_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 接続が確立された日時。
-   `session_uptime_elapsed_seconds` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 接続が確立されてから経過した秒数。
-   `is_expired` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 現在の接続が期限切れかどうか。
-   `keeper_api_version` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Keeper APIのバージョン。
-   `client_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — 接続のセッションID。
-   `xid` ([Int64](../../sql-reference/data-types/int-uint.md)) — 現在のセッションのXID。
-   `enabled_feature_flags` ([Array(Enum16)](../../sql-reference/data-types/array.md)) — 有効になっている機能フラグ。ClickHouse Keeperにのみ適用されます。可能な値は `FILTERED_LIST`, `MULTI_READ`, `CHECK_NOT_EXISTS`, `CREATE_IF_NOT_EXISTS`, `REMOVE_RECURSIVE`です。
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
