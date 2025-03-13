---
description: "ZooKeeperが設定されている場合のみ存在するシステムテーブル。ZooKeeperへの現在の接続（補助ZooKeeperを含む）を表示します。"
slug: /operations/system-tables/zookeeper_connection
title: "system.zookeeper_connection"
keywords: ["システムテーブル", "zookeeper_connection"]
---
import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# zookeeper_connection

<SystemTableCloud/>

このテーブルは、ZooKeeperが設定されていない場合は存在しません。 'system.zookeeper_connection' テーブルは、ZooKeeper（補助ZooKeeperを含む）への現在の接続を表示します。各行は1つの接続に関する情報を示します。

カラム:

-   `name` ([String](../../sql-reference/data-types/string.md)) — ZooKeeperクラスタの名前。
-   `host` ([String](../../sql-reference/data-types/string.md)) — ClickHouseが接続しているZooKeeperノードのホスト名/IP。
-   `port` ([String](../../sql-reference/data-types/string.md)) — ClickHouseが接続しているZooKeeperノードのポート。
-   `index` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ClickHouseが接続しているZooKeeperノードのインデックス。インデックスはZooKeeperの設定から取得されます。
-   `connected_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 接続が確立された時刻。
-   `session_uptime_elapsed_seconds` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 接続が確立されてから経過した秒数。
-   `is_expired` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 現在の接続は期限切れかどうか。
-   `keeper_api_version` ([String](../../sql-reference/data-types/string.md)) — Keeper APIのバージョン。
-   `client_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 接続のセッションID。
-   `xid` ([Int32](../../sql-reference/data-types/int-uint.md)) — 現在のセッションのXid。

例:

``` sql
SELECT * FROM system.zookeeper_connection;
```

``` text
┌─name────┬─host──────┬─port─┬─index─┬──────connected_time─┬─session_uptime_elapsed_seconds─┬─is_expired─┬─keeper_api_version─┬─client_id─┐
│ default │ 127.0.0.1 │ 9181 │     0 │ 2023-06-15 14:36:01 │                           3058 │          0 │                  3 │         5 │
└─────────┴───────────┴──────┴───────┴─────────────────────┴────────────────────────────────┴────────────┴────────────────────┴───────────┘
```
