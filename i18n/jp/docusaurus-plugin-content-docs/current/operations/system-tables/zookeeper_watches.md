---
description: 'この ClickHouse サーバーに登録されている、現在アクティブな ZooKeeper のウォッチを表示する system テーブル。'
keywords: ['system テーブル', 'zookeeper_watches']
slug: /operations/system-tables/zookeeper_watches
title: 'system.zookeeper_watches'
doc_type: 'reference'
---

## 説明 \{#description\}

この ClickHouse サーバー が ZooKeeper ノード (補助的な ZooKeeper を含む) に登録している、現在有効な[ウォッチ](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#ch_zkWatches)を表示します。各行は 1 つのウォッチを表します。

## カラム \{#columns\}

* `zookeeper_name` ([String](../../sql-reference/data-types/string.md)) — ZooKeeper 接続の名前 (メイン接続は `default`、それ以外は補助接続名) 。
* `create_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — ウォッチが作成された時刻。
* `create_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — ウォッチが作成された時刻 (マイクロ秒精度) 。
* `path` ([String](../../sql-reference/data-types/string.md)) — 監視対象の ZooKeeper パス。
* `session_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — ウォッチを登録した接続のセッション ID。
* `request_xid` ([Int64](../../sql-reference/data-types/int-uint.md)) — ウォッチを作成したリクエストの XID。
* `op_num` ([Enum](../../sql-reference/data-types/enum.md)) — ウォッチを作成したリクエストの種類。
* `watch_type` ([Enum8](../../sql-reference/data-types/enum.md)) — ウォッチの種類。設定可能な値:
  * `Children` — 子ノードの一覧の変化を監視します (`List` 操作で設定) 。
  * `Exists` — ノードの作成または削除を監視します。
  * `Data` — ノードデータの変化を監視します (`Get` 操作で設定) 。

例:

```sql
SELECT * FROM system.zookeeper_watches FORMAT Vertical;
```

```text
Row 1:
──────
zookeeper_name:           default
create_time:              2026-03-16 12:00:00
create_time_microseconds: 2026-03-16 12:00:00.123456
path:                     /clickhouse/task_queue/ddl
session_id:               106662742089334927
request_xid:              10858
op_num:                   List
watch_type:               Children
```

**関連項目**

* [ZooKeeper](../../operations/tips.md#zookeeper)
* [ZooKeeper ガイド](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html)