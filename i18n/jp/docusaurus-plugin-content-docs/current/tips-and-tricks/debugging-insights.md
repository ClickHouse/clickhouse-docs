---
sidebar_position: 1
slug: /community-wisdom/debugging-insights
sidebar_label: 'デバッグのヒント'
doc_type: 'guide'
keywords: [
  'clickhouse troubleshooting',
  'clickhouse errors',
  'slow queries',
  'memory problems', 
  'connection issues',
  'performance optimization',
  'database errors',
  'configuration problems',
  'debug',
  'solutions'
]
title: 'レッスン - デバッグのヒント'
description: '遅いクエリ、メモリエラー、接続の問題、設定の問題など、ClickHouse でよく発生する問題に対する代表的な解決策を紹介します。'
---



# ClickHouse運用：コミュニティデバッグの知見 {#clickhouse-operations-community-debugging-insights}

_このガイドは、コミュニティミートアップから得られた知見をまとめたものの一部です。実際の問題解決事例や知見については、[問題別に参照](./community-wisdom.md)できます。_
_運用コストの高さにお悩みですか？[コスト最適化](./cost-optimization.md)コミュニティ知見ガイドをご確認ください。_


## 必須のシステムテーブル {#essential-system-tables}

これらのシステムテーブルは、本番環境のデバッグに不可欠です:

### system.errors {#system-errors}

ClickHouseインスタンス内のすべてのアクティブなエラーを表示します。

```sql
SELECT name, value, changed
FROM system.errors
WHERE value > 0
ORDER BY value DESC;
```

### system.replicas {#system-replicas}

クラスタの健全性を監視するためのレプリケーション遅延とステータス情報を含みます。

```sql
SELECT database, table, replica_name, absolute_delay, queue_size, inserts_in_queue
FROM system.replicas
WHERE absolute_delay > 60
ORDER BY absolute_delay DESC;
```

### system.replication_queue {#system-replication-queue}

レプリケーションの問題を診断するための詳細情報を提供します。

```sql
SELECT database, table, replica_name, position, type, create_time, last_exception
FROM system.replication_queue
WHERE last_exception != ''
ORDER BY create_time DESC;
```

### system.merges {#system-merges}

現在のマージ操作を表示し、停止しているプロセスを特定できます。

```sql
SELECT database, table, elapsed, progress, is_mutation, total_size_bytes_compressed
FROM system.merges
ORDER BY elapsed DESC;
```

### system.parts {#system-parts}

パート数の監視とフラグメンテーション問題の特定に不可欠です。

```sql
SELECT database, table, count() as part_count
FROM system.parts
WHERE active = 1
GROUP BY database, table
ORDER BY count() DESC;
```


## 本番環境でよくある問題 {#common-production-issues}

### ディスク容量の問題 {#disk-space-problems}

レプリケーション構成においてディスク容量が枯渇すると、連鎖的な問題が発生します。1つのノードの容量が不足すると、他のノードはそのノードとの同期を試み続けるため、ネットワークトラフィックが急増し、混乱を招く症状が現れます。あるコミュニティメンバーは、単なるディスク容量不足の問題のデバッグに4時間を費やしました。特定のクラスタのディスクストレージを監視するには、この[クエリ](/knowledgebase/useful-queries-for-troubleshooting#show-disk-storage-number-of-parts-number-of-rows-in-systemparts-and-marks-across-databases)を参照してください。

AWSユーザーは、デフォルトの汎用EBSボリュームには16TBの制限があることに注意してください。

### パーツ数過多エラー {#too-many-parts-error}

小規模で頻繁な挿入はパフォーマンス問題を引き起こします。コミュニティでは、毎秒10回を超える挿入レートでは、ClickHouseがパーツを十分な速度でマージできないため、「パーツ数過多」エラーが頻繁に発生することが確認されています。

**解決策:**

- 30秒または200MBの閾値を使用してデータをバッチ処理する
- 自動バッチ処理のために async_insert を有効にする
- サーバー側のバッチ処理にはバッファテーブルを使用する
- 制御されたバッチサイズのために Kafka を設定する

[公式推奨事項](/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous): 1回の挿入あたり最低1,000行、理想的には10,000から100,000行。

### 無効なタイムスタンプの問題 {#data-quality-issues}

任意のタイムスタンプを持つデータを送信するアプリケーションは、パーティションの問題を引き起こします。これにより、非現実的な日付(1998年や2050年など)のデータを含むパーティションが作成され、予期しないストレージ動作が発生します。

### `ALTER` 操作のリスク {#alter-operation-risks}

数テラバイト規模のテーブルに対する大規模な `ALTER` 操作は、大量のリソースを消費し、データベースをロックする可能性があります。あるコミュニティの事例では、14TBのデータに対して Integer から Float への変更を行った結果、データベース全体がロックされ、バックアップからの再構築が必要になりました。

**高コストなミューテーションの監視:**

```sql
SELECT database, table, mutation_id, command, parts_to_do, is_done
FROM system.mutations
WHERE is_done = 0;
```

スキーマ変更は、まず小規模なデータセットでテストしてください。


## メモリとパフォーマンス {#memory-and-performance}

### 外部集約 {#external-aggregation}

メモリ集約的な操作には外部集約を有効にしてください。処理速度は低下しますが、ディスクへのスピルによってメモリ不足によるクラッシュを防ぎます。`max_bytes_before_external_group_by` を使用することで、大規模な `GROUP BY` 操作でのメモリ不足クラッシュを防ぐことができます。この設定の詳細については[こちら](/operations/settings/settings#max_bytes_before_external_group_by)をご覧ください。

```sql
SELECT
    column1,
    column2,
    COUNT(*) as count,
    SUM(value) as total
FROM large_table
GROUP BY column1, column2
SETTINGS max_bytes_before_external_group_by = 1000000000; -- 1GBの閾値
```

### 非同期挿入の詳細 {#async-insert-details}

非同期挿入は、パフォーマンスを向上させるために小規模な挿入をサーバー側で自動的にバッチ処理します。データがディスクに書き込まれるのを待ってから確認応答を返すかどうかを設定できます。即座に返す方が高速ですが、耐久性は低くなります。最新バージョンでは、バッチ内の重複データを処理するための重複排除機能がサポートされています。

**関連ドキュメント**

- [Selecting an insert strategy](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)

### 分散テーブルの設定 {#distributed-table-configuration}

デフォルトでは、分散テーブルはシングルスレッドの挿入を使用します。並列処理とシャードへの即座のデータ送信を行うには、`insert_distributed_sync` を有効にしてください。

分散テーブルを使用する際は、一時データの蓄積を監視してください。

### パフォーマンス監視の閾値 {#performance-monitoring-thresholds}

コミュニティ推奨の監視閾値:

- パーティションあたりのパート数: 100未満が望ましい
- 遅延挿入: ゼロを維持すべき
- 挿入レート: 最適なパフォーマンスのために1秒あたり約1回に制限

**関連ドキュメント**

- [Custom partitioning key](/engines/table-engines/mergetree-family/custom-partitioning-key)


## クイックリファレンス {#quick-reference}

| 問題           | 検出方法                        | 解決策                           |
| --------------- | -------------------------------- | ---------------------------------- |
| ディスク容量      | `system.parts`の合計バイト数を確認 | 使用状況を監視し、スケーリングを計画        |
| パーツ数過多  | テーブルごとのパーツ数をカウント            | バッチ挿入を実施し、async_insertを有効化 |
| レプリケーション遅延 | `system.replicas`の遅延を確認    | ネットワークを監視し、レプリカを再起動  |
| 不正なデータ        | パーティション日付を検証         | タイムスタンプ検証を実装     |
| ミューテーションの停滞 | `system.mutations`のステータスを確認  | まず小規模データでテスト           |

### 動画リソース {#video-sources}

- [ClickHouse運用から学んだ10の教訓](https://www.youtube.com/watch?v=liTgGiTuhJE)
- [ClickHouseにおける高速・並行・一貫性のある非同期INSERT](https://www.youtube.com/watch?v=AsMPEfN5QtM)
