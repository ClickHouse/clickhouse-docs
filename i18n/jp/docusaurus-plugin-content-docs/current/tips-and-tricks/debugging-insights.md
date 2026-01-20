---
sidebar_position: 1
slug: /community-wisdom/debugging-insights
sidebar_label: 'デバッグインサイト'
doc_type: 'guide'
keywords: [
  'ClickHouse トラブルシューティング',
  'ClickHouse エラー',
  '遅いクエリ',
  'メモリの問題', 
  '接続の問題',
  'パフォーマンス最適化',
  'データベースエラー',
  '設定の問題',
  'デバッグ',
  '解決策'
]
title: 'レッスン - デバッグインサイト'
description: '遅いクエリ、メモリエラー、接続問題、設定の問題など、ClickHouse でよく発生する問題に対する代表的な解決策をまとめています。'
---

# ClickHouse の運用: コミュニティによるデバッグインサイト \{#clickhouse-operations-community-debugging-insights\}

*このガイドは、コミュニティミートアップから得られた知見を集約したコレクションの一部です。より多くの実運用に基づく解決策や知見については、[特定の問題別に閲覧](./community-wisdom.md)できます。*
*高い運用コストにお悩みですか？[コスト最適化](./cost-optimization.md)に関するコミュニティのインサイトガイドを参照してください。*

## 重要なシステムテーブル \{#essential-system-tables\}

これらのシステムテーブルは、本番環境でのデバッグに不可欠です。

### system.errors \{#system-errors\}

ClickHouse インスタンス内で現在発生しているすべてのエラーを表示します。

```sql
SELECT name, value, changed 
FROM system.errors 
WHERE value > 0 
ORDER BY value DESC;
```


### system.replicas \{#system-replicas\}

クラスターの健全性を監視するためのレプリケーション遅延およびステータス情報を含みます。

```sql
SELECT database, table, replica_name, absolute_delay, queue_size, inserts_in_queue
FROM system.replicas 
WHERE absolute_delay > 60
ORDER BY absolute_delay DESC;
```


### system.replication&#95;queue \{#system-replication-queue\}

レプリケーション関連の問題の診断に役立つ詳細情報を提供します。

```sql
SELECT database, table, replica_name, position, type, create_time, last_exception
FROM system.replication_queue 
WHERE last_exception != ''
ORDER BY create_time DESC;
```


### system.merges \{#system-merges\}

現在実行中のマージ処理を表示し、ハングしているプロセスを特定できます。

```sql
SELECT database, table, elapsed, progress, is_mutation, total_size_bytes_compressed
FROM system.merges 
ORDER BY elapsed DESC;
```


### system.parts \{#system-parts\}

パーツ数の監視や断片化の問題を特定するうえで不可欠です。

```sql
SELECT database, table, count() as part_count
FROM system.parts 
WHERE active = 1
GROUP BY database, table
ORDER BY count() DESC;
```


## 本番環境でよく起きる問題 \{#common-production-issues\}

### ディスク容量の問題 \{#disk-space-problems\}

レプリケーション構成でディスク容量が枯渇すると、連鎖的な問題が発生します。あるノードの空き容量がなくなると、他のノードは同期を続けようとするため、ネットワークトラフィックのスパイクや原因が分かりにくい症状が発生します。コミュニティメンバーの一人は、単なるディスク容量不足だった問題の調査に 4 時間費やしました。特定のクラスター上のディスクストレージを監視するには、この [クエリ](/knowledgebase/useful-queries-for-troubleshooting#show-disk-storage-number-of-parts-number-of-rows-in-systemparts-and-marks-across-databases) を参照してください。

AWS を利用している場合は、デフォルトの汎用 EBS ボリュームには 16TB の上限があることを認識しておいてください。

### too many parts エラー \{#too-many-parts-error\}

小さなデータを高頻度で挿入すると、パフォーマンス問題が発生します。コミュニティでは、1 秒あたり 10 回を超える挿入レートでは、多くの場合 ClickHouse がパーツを十分な速度でマージできないために「too many parts」エラーが発生することが確認されています。

**解決策:**

* 30 秒または 200MB をしきい値としてデータをバッチ処理する
* 自動バッチ処理のために async&#95;insert を有効にする
* サーバー側でのバッチ処理に buffer テーブルを使用する
* バッチサイズを制御するために Kafka を構成する

[公式推奨](/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous): 挿入 1 回あたり最小 1,000 行、理想的には 10,000 ～ 100,000 行。

### 不正なタイムスタンプの問題 \{#data-quality-issues\}

任意のタイムスタンプを付与してデータを送信するアプリケーションは、パーティションの問題を引き起こします。その結果、1998 年や 2050 年のような非現実的な日付のデータを含むパーティションが作成され、予期しないストレージ動作につながります。

### `ALTER` 操作のリスク \{#alter-operation-risks\}

マルチテラバイトのテーブルに対する大規模な `ALTER` 操作は、大量のリソースを消費し、データベースをロックする可能性があります。コミュニティの事例では、14TB のデータ上で Integer 型を Float 型に変更したところ、データベース全体がロックされ、バックアップからの再構築が必要になりました。

**高コストな mutation の監視:**

```sql
SELECT database, table, mutation_id, command, parts_to_do, is_done
FROM system.mutations 
WHERE is_done = 0;
```

まずは小規模なデータセットを使ってスキーマ変更を検証してください。


## メモリとパフォーマンス \{#memory-and-performance\}

### 外部集約 \{#external-aggregation\}

メモリ使用量の大きい処理に対しては、外部集約を有効化してください。ディスクへのスピルが発生するため処理は遅くなりますが、メモリ不足によるクラッシュを防止できます。これは `max_bytes_before_external_group_by` を設定することで有効化できます。これにより、大規模な `GROUP BY` 処理時のメモリ不足によるクラッシュを防ぐのに役立ちます。この設定の詳細は[こちら](/operations/settings/settings#max_bytes_before_external_group_by)を参照してください。

```sql
SELECT 
    column1,
    column2,
    COUNT(*) as count,
    SUM(value) as total
FROM large_table
GROUP BY column1, column2
SETTINGS max_bytes_before_external_group_by = 1000000000; -- 1GB threshold
```


### 非同期インサートの詳細 \{#async-insert-details\}

非同期インサートは、小さなインサートをサーバー側で自動的にバッチ化してパフォーマンスを向上させます。ディスクへの書き込み完了を待ってから応答を返すかどうかを設定できます。即時に返す方が高速ですが、永続性は低くなります。最近のバージョンでは、バッチ内の重複データを処理するための重複排除もサポートされています。

**関連ドキュメント**

* [インサート戦略の選択](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)

### Distributed テーブルの設定 \{#distributed-table-configuration\}

デフォルトでは、Distributed テーブルは単一スレッドでインサートを実行します。並列処理とシャードへの即時データ送信のために `insert_distributed_sync` を有効にします。

Distributed テーブルを使用する場合は、一時データの蓄積を監視してください。

### パフォーマンス監視のしきい値 \{#performance-monitoring-thresholds\}

コミュニティ推奨の監視しきい値:

* パーティションあたりのパーツ数: 望ましくは 100 未満
* 遅延インサート: 0 を維持すること
* インサートレート: 最適なパフォーマンスのため、おおよそ 1 秒あたり 1 回に制限する

**関連ドキュメント**

* [カスタムパーティションキー](/engines/table-engines/mergetree-family/custom-partitioning-key)

## クイックリファレンス \{#quick-reference\}

| 課題 | 検知 | 解決策 |
|-------|-----------|----------|
| ディスク容量 | `system.parts` の合計バイト数を確認 | 使用量を監視し、スケーリングを計画 |
| パーツ数過多 | テーブルごとのパーツ数をカウント | バッチ挿入を行い、async_insert を有効化 |
| レプリケーション遅延 | `system.replicas` の遅延を確認 | ネットワークを監視し、レプリカを再起動 |
| 不正データ | パーティションの日付を検証 | タイムスタンプ検証を実装 |
| ミューテーションが進まない | `system.mutations` のステータスを確認 | まずは小さなデータでテスト |

### 動画資料 \{#video-sources\}

- [ClickHouse 運用から得た 10 の教訓](https://www.youtube.com/watch?v=liTgGiTuhJE)
- [ClickHouse における高速・並行・一貫した非同期 INSERT](https://www.youtube.com/watch?v=AsMPEfN5QtM)