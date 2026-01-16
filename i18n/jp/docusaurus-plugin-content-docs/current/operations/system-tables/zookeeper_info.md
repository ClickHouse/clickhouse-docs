---
description: '利用可能なすべての Keeper ノードの内部情報を出力するシステムテーブル。'
keywords: ['システムテーブル', 'zookeeper_info']
slug: /operations/system-tables/zookeeper_info
title: 'system.zookeeper_info'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.zookeeper_info \{#systemzookeeper_info\}

<SystemTableCloud />

このテーブルは、ZooKeeper に関する統合的な内部情報を出力し、ノードは config から取得されます。

カラム:

* `zookeeper_cluster_name` ([String](../../sql-reference/data-types/string.md)) — ZooKeeper クラスターの名前。
* `host` ([String](../../sql-reference/data-types/string.md)) — ClickHouse が接続した ZooKeeper ノードのホスト名または IP アドレス。
* `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — ClickHouse が接続した先の ZooKeeper ノードのポート。
* `index` ([Nullable(UInt8)](../../sql-reference/data-types/int-uint.md)) — ClickHouse が接続した ZooKeeper ノードのインデックス。インデックスは ZooKeeper の設定で定義された値です。接続していない場合、このカラムは NULL です。
* `is_connected` ([Nullable(UInt8)](../../sql-reference/data-types/int-uint.md)) — ZooKeeper に接続しているかどうか。
* `is_readonly` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 読み取り専用かどうか。
* `version` ([String](../../sql-reference/data-types/string.md)) — ZooKeeper のバージョン。
* `avg_latency` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 平均レイテンシー。
* `max_latency` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 最大レイテンシー
* `min_latency` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 最小レイテンシー。
* `packets_received` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 受信したパケット数。
* `packets_sent` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 送信されたパケットの数。
* `outstanding_requests` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 処理待ちリクエストの数。
* `server_state` ([String](../../sql-reference/data-types/string.md)) — サーバー状態。
* `is_leader` ([UInt8](../../sql-reference/data-types/int-uint.md)) — この ZooKeeper ノードがリーダーかどうかを示します。
* `znode_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — znode 数。
* `watch_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ウォッチ数。
* `ephemerals_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — エフェメラルノード数。
* `approximate_data_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 概算データサイズ。
* `followers` ([UInt64](../../sql-reference/data-types/int-uint.md)) — リーダーノードのフォロワー数。このフィールドはリーダーからのみ公開されます。
* `synced_followers` ([UInt64](../../sql-reference/data-types/int-uint.md)) — リーダーと同期しているフォロワーの数。このフィールドが公開されるのはリーダーのみです。
* `pending_syncs` ([UInt64](../../sql-reference/data-types/int-uint.md)) — リーダーの保留中の同期数。このフィールドはリーダーでのみ公開されます。
* `open_file_descriptor_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — オープンしているファイルディスクリプタの数。Unixプラットフォームでのみ使用可能です。
* `max_file_descriptor_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 最大ファイルディスクリプタ数。Unix プラットフォームでのみ利用可能です。
* `connections` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper への接続数。
* `outstanding` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper の未処理リクエスト数（outstanding）。
* `zxid` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper の zxid。
* `node_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper のノード数。
* `snapshot_dir_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper のスナップショットディレクトリのサイズ。
* `log_dir_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper のログディレクトリのサイズ。
* `first_log_idx` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper の最初のログインデックス。
* `first_log_term` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper の最初のログの term。
* `last_log_idx` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper の最新ログインデックス。
* `last_log_term` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper における最後のログエントリの term。
* `last_committed_idx` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper における直近のコミット済み索引。
* `leader_committed_log_idx` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper リーダーがコミット済みとしたログのインデックス。
* `target_committed_log_idx` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper におけるターゲットのコミット済みログインデックス。
* `last_snapshot_idx` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper の最新スナップショットのインデックス。
  g