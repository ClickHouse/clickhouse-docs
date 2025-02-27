---
slug: /cloud/reference/shared-merge-tree
sidebar_label: SharedMergeTree
title: SharedMergeTree
keywords: [shared merge tree SharedMergeTree engine]
---

# SharedMergeTree テーブルエンジン

** 利用は ClickHouse Cloud（および第1者パートナークラウドサービス）のみ **

SharedMergeTree テーブルエンジンファミリーは、共有ストレージ（例：Amazon S3、Google Cloud Storage、MinIO、Azure Blob Storage）上で動作するように最適化された ReplicatedMergeTree エンジンのクラウドネイティブな代替です。各特定の MergeTree エンジンタイプに対して対応する SharedMergeTree アナログがあります。すなわち、ReplacingSharedMergeTree は ReplacingReplicatedMergeTree の代わりになります。

SharedMergeTree テーブルエンジンファミリーは ClickHouse Cloud の基盤を支えています。エンドユーザーにとって、ReplicatedMergeTree ベースのエンジンの代わりに SharedMergeTree エンジンファミリーを使用するために変更する必要はありません。以下の追加の利点があります：

- 高い挿入スループット
- バックグラウンドマージのスループット向上
- 変異のスループット向上
- スケールアップおよびスケールダウン操作の迅速化
- 選択クエリに対するより軽量な強い整合性

SharedMergeTree がもたらす重要な改善点は、ReplicatedMergeTree と比べて計算とストレージのより深い分離を提供することです。以下に、ReplicatedMergeTree が計算とストレージをどのように分離しているか示します：

![ReplicatedMergeTree ダイアグラム](./images/shared-merge-tree-1.png)

ご覧のように、ReplicatedMergeTree に保存されたデータはオブジェクトストレージにありますが、メタデータは各 clickhouse サーバーに存在します。これは、すべてのレプリケート操作に対して、メタデータもすべてのレプリカでレプリケーションされる必要があることを意味します。

![メタデータ付き ReplicatedMergeTree ダイアグラム](./images/shared-merge-tree-2.png)

ReplicatedMergeTree とは異なり、SharedMergeTree はレプリカ間の通信を必要としません。代わりに、すべての通信は共有ストレージと clickhouse-keeper を通じて行われます。SharedMergeTree は非同期のリーダーレスレプリケーションを実装し、コーディネーションとメタデータストレージには clickhouse-keeper を使用します。これにより、サービスがスケールアップおよびスケールダウンする際にメタデータをレプリケーションする必要がなくなります。これにより、レプリケーション、変異、マージ、スケールアップ操作が迅速化します。SharedMergeTree は各テーブルに対して数百のレプリカを許可し、シャードなしでダイナミックにスケールすることを可能にしています。ClickHouse Cloud では、クエリに対してより多くの計算リソースを利用するために分散クエリ実行アプローチが使用されています。

## インストロペクション {#introspection}

ReplicatedMergeTree のインストロペクションに使用されるほとんどのシステムテーブルは SharedMergeTree にも存在しますが、`system.replication_queue` と `system.replicated_fetches` はデータとメタデータのレプリケーションが行われないため存在しません。しかし、SharedMergeTree にはこれらの2つのテーブルに対応する代替があります。

**system.virtual_parts**

このテーブルは SharedMergeTree の `system.replication_queue` に対応する代替です。最も最近の現在のパーツのセットに関する情報や、マージ、変異、削除されたパーティションなどの進行中の将来のパーツに関する情報を保存します。

**system.shared_merge_tree_fetches**

このテーブルは SharedMergeTree の `system.replicated_fetches` に対応する代替です。プライマリキーおよびチェックサムの現在の進行中のフェッチに関する情報をメモリに保存します。

## SharedMergeTree の有効化 {#enabling-sharedmergetree}

`SharedMergeTree` はデフォルトで有効です。

SharedMergeTree テーブルエンジンをサポートするサービスでは、手動で何かを有効にする必要はありません。以前と同じ方法でテーブルを作成でき、指定した CREATE TABLE クエリに対応する SharedMergeTree ベースのテーブルエンジンが自動的に使用されます。

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ENGINE = MergeTree
ORDER BY key 
```

これにより、SharedMergeTree テーブルエンジンを使用して `my_table` テーブルが作成されます。

ClickHouse Cloud では、`ENGINE=MergeTree` を指定する必要はありません。以下のクエリは上記のクエリと同じです。

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ORDER BY key 
```

Replacing、Collapsing、Aggregating、Summing、VersionedCollapsing、または Graphite MergeTree テーブルを使用する場合、それは自動的に対応する SharedMergeTree ベースのテーブルエンジンに変換されます。

```sql
CREATE TABLE myFirstReplacingMT
(
    `key` Int64,
    `someCol` String,
    `eventTime` DateTime
)
ENGINE = ReplacingMergeTree
ORDER BY key;
```

特定のテーブルについて、`SHOW CREATE TABLE` を使用して使用されたテーブルエンジンを確認できます：
```sql
SHOW CREATE TABLE myFirstReplacingMT;
```

```sql
CREATE TABLE default.myFirstReplacingMT 
( `key` Int64, `someCol` String, `eventTime` DateTime ) 
ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}') 
ORDER BY key 
SETTINGS index_granularity = 8192
```

## 設定 {#settings}

一部の設定の動作が大幅に変更されています：

- `insert_quorum` -- SharedMergeTree へのすべての挿入はクオーラム挿入であり（共有ストレージに書き込まれます）、したがって SharedMergeTree テーブルエンジンを使用する場合、この設定は必要ありません。
- `insert_quorum_parallel` -- SharedMergeTree へのすべての挿入はクオーラム挿入であり（共有ストレージに書き込まれます）、したがって SharedMergeTree テーブルエンジンを使用する場合、この設定は必要ありません。
- `select_sequential_consistency` -- クオーラム挿入を必要とせず、`SELECT` クエリで clickhouse-keeper に追加の負荷をかけることになります。

## 整合性 {#consistency}

SharedMergeTree は ReplicatedMergeTree よりも優れた軽量整合性を提供します。SharedMergeTree に挿入する際、`insert_quorum` や `insert_quorum_parallel` などの設定を提供する必要はありません。挿入はクオーラム挿入であり、メタデータは ClickHouse-Keeper に保存され、メタデータは少なくともクオーラムの ClickHouse-keeper にレプリケートされます。クラスター内の各レプリカは、ClickHouse-Keeper から新しい情報を非同期的に取得します。

ほとんどの場合、`select_sequential_consistency` や `SYSTEM SYNC REPLICA LIGHTWEIGHT` を使用するべきではありません。非同期レプリケーションはほとんどのシナリオをカバーし、非常に低レイテンシです。古い読み込みを防ぐ必要がある稀なケースでは、以下の推奨事項に従ってください：

1. 同じセッションまたは同じノードで読み書きを行う場合、`select_sequential_consistency` は必要ありません。なぜなら、あなたのレプリカはすでに最新のメタデータを持っているからです。

2. 1つのレプリカに書き込んで別のレプリカから読み込む場合、`SYSTEM SYNC REPLICA LIGHTWEIGHT` を使用して、そのレプリカに ClickHouse-Keeper からメタデータを取得させることができます。

3. クエリの一部として設定として `select_sequential_consistency` を使用してください。

## 関連コンテンツ {#related-content}

- [ClickHouse Cloud が SharedMergeTree と Lightweight Updates によりパフォーマンスを向上](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)
