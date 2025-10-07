---
'sidebar_position': 1
'slug': '/community-wisdom/debugging-insights'
'sidebar_label': 'デバッグのインサイト'
'doc_type': 'guide'
'keywords':
- 'clickhouse troubleshooting'
- 'clickhouse errors'
- 'slow queries'
- 'memory problems'
- 'connection issues'
- 'performance optimization'
- 'database errors'
- 'configuration problems'
- 'debug'
- 'solutions'
'title': 'レッスン - デバッグのインサイト'
'description': '最も一般的な ClickHouse の問題の解決策を見つけます。これには、遅いクエリ、メモリエラー、接続の問題、および構成の問題が含まれます。'
---


# ClickHouseの操作: コミュニティのデバッグインサイト {#clickhouse-operations-community-debugging-insights}
*このガイドは、コミュニティのミートアップから得られた調査結果のコレクションの一部です。より実践的な解決策やインサイトについては、[特定の問題からブラウズ](./community-wisdom.md)してください。*
*運用コストが高くて困っていますか？[コスト最適化](./cost-optimization.md)に関するコミュニティのインサイトガイドをチェックしてください。*

## 重要なシステムテーブル {#essential-system-tables}

これらのシステムテーブルは、プロダクションデバッグにおいて基本的なものです。

### system.errors {#system-errors}

あなたのClickHouseインスタンスで発生しているすべてのアクティブなエラーを表示します。

```sql
SELECT name, value, changed 
FROM system.errors 
WHERE value > 0 
ORDER BY value DESC;
```

### system.replicas {#system-replicas}

クラスタの健康を監視するためのレプリケーションの遅れと状態情報を含みます。

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

現在のマージ操作を表示し、ストップしたプロセスを特定できます。

```sql
SELECT database, table, elapsed, progress, is_mutation, total_size_bytes_compressed
FROM system.merges 
ORDER BY elapsed DESC;
```

### system.parts {#system-parts}

パーツ数を監視し、フラグメンテーションの問題を特定するために不可欠です。

```sql
SELECT database, table, count() as part_count
FROM system.parts 
WHERE active = 1
GROUP BY database, table
ORDER BY count() DESC;
```

## 一般的なプロダクションの問題 {#common-production-issues}

### ディスクスペースの問題 {#disk-space-problems}

レプリケーションセットアップにおけるディスクスペースの枯渇は、 cascadingな問題を引き起こします。一つのノードがスペース不足になると、他のノードはそれと同期し続け、ネットワークトラフィックの急増と混乱した症状を引き起こします。あるコミュニティのメンバーは、単にディスクスペースが低いために4時間デバッグに費やしました。特定のクラスタでのディスクストレージを監視するためのこの[クエリ](/knowledgebase/useful-queries-for-troubleshooting#show-disk-storage-number-of-parts-number-of-rows-in-systemparts-and-marks-across-databases)をチェックしてください。

AWSのユーザーは、デフォルトの一般目的EBSボリュームには16TBの制限があることを理解しておく必要があります。

### パーツが多すぎるエラー {#too-many-parts-error}

小さい頻繁な挿入はパフォーマンスの問題を引き起こします。コミュニティは、1秒あたり10以上の挿入レートがあると「パーツが多すぎる」エラーを引き起こすことが多いことを特定しました。これはClickHouseがパーツを十分に早くマージできないためです。

**解決策:**
- 30秒または200MBのしきい値でデータをバッチ処理する
- 自動バッチ処理のためにasync_insertを有効にする  
- サーバー側のバッチ処理のためにバッファテーブルを使用する
- 制御されたバッチサイズのためにKafkaを設定する

[公式推奨](/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous): 挿入ごとに最低1,000行、理想は10,000から100,000。

### 無効なタイムスタンプの問題 {#data-quality-issues}

任意のタイムスタンプでデータを送信するアプリケーションは、パーティションの問題を引き起こします。これにより、現実的でない日付（例えば1998年や2050年）のデータを含むパーティションが生成され、予期しないストレージ動作を引き起こします。

### `ALTER`操作のリスク {#alter-operation-risks}

マルチテラバイトのテーブルに対する大規模な`ALTER`操作は、 significantなリソースを消費し、データベースをロックする可能性があります。あるコミュニティの例では、14TBのデータに対してIntegerをFloatに変更した際に、データベース全体がロックされ、バックアップからの再構築が必要になりました。

**高価な変異を監視する:**

```sql
SELECT database, table, mutation_id, command, parts_to_do, is_done
FROM system.mutations 
WHERE is_done = 0;
```

スキーマ変更は、最初に小さなデータセットでテストしてください。

## メモリとパフォーマンス {#memory-and-performance}

### 外部集約 {#external-aggregation}

メモリ集約性が高い操作には外部集約を有効にします。遅いですが、スピルしてディスクに書き出すことで、メモリ不足によるクラッシュを防ぎます。`max_bytes_before_external_group_by`を使用することで、 largeな`GROUP BY`操作の際のメモリ不足によるクラッシュを防ぐのに役立ちます。この設定については[こちら](/operations/settings/settings#max_bytes_before_external_group_by)で詳しく学ぶことができます。

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

### 非同期挿入の詳細 {#async-insert-details}

非同期挿入は、小さな挿入をサーバー側で自動的にバッチ処理してパフォーマンスを向上させます。データがディスクに書き込まれるのを待ってから確認を返すかどうかを設定できます - 即時の返却は速いですが、耐久性が低下します。最新のバージョンでは、バッチ内の重複データを処理するための重複排除をサポートしています。

**関連ドキュメント**
- [挿入戦略の選択](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)

### 分散テーブルの構成 {#distributed-table-configuration}

デフォルトでは、分散テーブルはシングルスレッドで挿入を行います。並列処理とシャードへの即時データ送信のために`insert_distributed_sync`を有効にしてください。

分散テーブルを使用する際の一時データの蓄積を監視してください。

### パフォーマンスモニタリングのしきい値 {#performance-monitoring-thresholds}

コミュニティ推奨のモニタリングしきい値:
- パーティションごとのパーツ数: できれば100未満
- 遅延挿入: ゼロのままにするべき
- 挿入レート: 最適なパフォーマンスのために約1秒あたり1に制限する

**関連ドキュメント**
- [カスタムパーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key)

## クイックリファレンス {#quick-reference}

| 問題 | 検出 | 解決策 |
|-------|-----------|----------|
| ディスクスペース | `system.parts`の合計バイトをチェック | 使用状況の監視、スケーリング計画 |
| パーツが多すぎる | テーブルごとのパーツ数をカウント | 挿入をバッチ処理、async_insertを有効にする |
| レプリケーションの遅延 | `system.replicas`の遅延をチェック | ネットワークを監視、レプリカを再起動 |
| 悪いデータ | パーティションの日付を検証 | タイムスタンプの検証を実装 |
| ストック変異 | `system.mutations`のステータスをチェック | まず小さなデータでテスト |

### ビデオソース {#video-sources}
- [ClickHouseの運用からの10の教訓](https://www.youtube.com/watch?v=liTgGiTuhJE)
- [ClickHouseにおける高速で同時進行かつ一貫した非同期INSERTS](https://www.youtube.com/watch?v=AsMPEfN5QtM)
