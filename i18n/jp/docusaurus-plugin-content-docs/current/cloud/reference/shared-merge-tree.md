---
slug: /cloud/reference/shared-merge-tree
sidebar_label: SharedMergeTree
title: SharedMergeTree
keywords: [shared merge tree SharedMergeTree engine]
---

import shared_merge_tree from '@site/static/images/cloud/reference/shared-merge-tree-1.png';
import shared_merge_tree_2 from '@site/static/images/cloud/reference/shared-merge-tree-2.png';



# SharedMergeTree テーブルエンジン

*\* ClickHouse Cloud（および初のパートナーのクラウドサービス）のみで利用可能*

SharedMergeTree テーブルエンジンファミリーは、ReplicatedMergeTree エンジンのクラウドネイティブな置き換えであり、共有ストレージ（例：Amazon S3、Google Cloud Storage、MinIO、Azure Blob Storage）の上で動作するように最適化されています。各特定の MergeTree エンジンタイプに対して SharedMergeTree のアナログが存在します。つまり、ReplacingSharedMergeTree は ReplacingReplicatedMergeTree に置き換わります。

SharedMergeTree テーブルエンジンファミリーは ClickHouse Cloud を支えています。エンドユーザーにとって、ReplicatedMergeTree ベースのエンジンの代わりに SharedMergeTree エンジンファミリーを使用し始めるために変更する必要はありません。以下の追加の利点を提供します：

- より高い挿入スループット
- バックグラウンドマージのスループットの改善
- ミューテーションのスループットの改善
- スケールアップおよびスケールダウン操作の迅速化
- SELECT クエリのためのより軽量な強い整合性

SharedMergeTree がもたらす重要な改善点は、ReplicatedMergeTree と比較して計算とストレージのより深い分離を提供することです。以下に、ReplicatedMergeTree が計算とストレージをどのように分けているかを示します：

<img alt="ReplicatedMergeTree Diagram"
  src={shared_merge_tree} />

ご覧の通り、ReplicatedMergeTree に保存されているデータはオブジェクトストレージにありますが、メタデータは各 ClickHouse サーバーに残っています。これは、すべてのレプリケート操作に対して、メタデータもすべてのレプリカにレプリケートされる必要があることを意味します。

<img alt="ReplicatedMergeTree Diagram with Metadata"
  src={shared_merge_tree_2} />

ReplicatedMergeTree とは異なり、SharedMergeTree はレプリカ同士が通信する必要がありません。代わりに、すべての通信は共有ストレージと ClickHouse-keeper を通じて行われます。SharedMergeTree は非同期のリーダーレスレプリケーションを実装し、コーディネーションとメタデータストレージに ClickHouse-keeper を使用します。これは、サービスがスケールアップおよびスケールダウンする際にメタデータをレプリケートする必要がないことを意味します。これにより、レプリケーション、ミューテーション、マージ、スケールアップ操作が迅速化されます。SharedMergeTree は各テーブルのために数百のレプリカを許可し、シャードなしでのダイナミックなスケールを可能にします。ClickHouse Cloud では、クエリのためにより多くの計算リソースを利用するために分散クエリ実行アプローチが使用されています。

## 内部情報 {#introspection}

ReplicatedMergeTree の内部情報用に使用される多くのシステムテーブルは SharedMergeTree のために存在しますが、`system.replication_queue` と `system.replicated_fetches` はデータとメタデータのレプリケーションが発生しないため存在しません。ただし、SharedMergeTree にはこれらの 2 つのテーブルの対応する代替手段があります。

**system.virtual_parts**

このテーブルは、SharedMergeTree のための `system.replication_queue` の代替として機能します。最も最近の現在のパーツのセットに関する情報、およびマージ、ミューテーション、削除されたパーティションなどの進行中の将来のパーツに関する情報を保存します。

**system.shared_merge_tree_fetches**

このテーブルは、SharedMergeTree のための `system.replicated_fetches` の代替です。プライマリキーおよびチェックサムの現在の進行中のフェッチをメモリに関する情報を含みます。

## SharedMergeTreeの有効化 {#enabling-sharedmergetree}

`SharedMergeTree` はデフォルトで有効になっています。

SharedMergeTree テーブルエンジンをサポートするサービスでは、手動で何も有効にする必要はありません。テーブルを以前と同じ方法で作成すると、自動的に CREATE TABLE クエリで指定されたエンジンに対応する SharedMergeTree ベースのテーブルエンジンが使用されます。

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ENGINE = MergeTree
ORDER BY key
```

これにより、SharedMergeTree テーブルエンジンを使用してテーブル `my_table` が作成されます。

ClickHouse Cloud では `ENGINE=MergeTree` を指定する必要はありません。以下のクエリは上記のクエリと同じです。

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

特定のテーブルでは、`SHOW CREATE TABLE` を使用してどのテーブルエンジンが使用されているかを確認できます：
``` sql
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

いくつかの設定の動作が大幅に変更されています：

- `insert_quorum` -- SharedMergeTree へのすべての挿入はクオーラム挿入（共有ストレージに書き込まれる）であるため、SharedMergeTree テーブルエンジンを使用する場合、この設定は必要ありません。
- `insert_quorum_parallel` -- SharedMergeTree へのすべての挿入はクオーラム挿入（共有ストレージに書き込まれる）であるため、SharedMergeTree テーブルエンジンを使用する場合、この設定は必要ありません。
- `select_sequential_consistency` -- クオーラム挿入は必要なく、`SELECT` クエリで ClickHouse-keeper への追加の負荷を引き起こします。

## 一貫性 {#consistency}

SharedMergeTree は ReplicatedMergeTree よりも優れた軽量な一貫性を提供します。SharedMergeTree への挿入の際には、`insert_quorum` や `insert_quorum_parallel` といった設定を提供する必要はありません。挿入はクオーラム挿入であり、メタデータは ClickHouse-Keeper に保存され、メタデータは少なくともクオーラムの ClickHouse-Keeper にレプリケートされます。クラスター内の各レプリカは、非同期的に ClickHouse-Keeper から新しい情報を取得します。

ほとんどの場合、`select_sequential_consistency` や `SYSTEM SYNC REPLICA LIGHTWEIGHT` を使用する必要はありません。非同期レプリケーションがほとんどのシナリオをカバーし、非常に低いレイテンシを持っています。古い読み取りを防ぐ必要がある稀なケースでは、以下の推奨事項に従ってください。

1. 読み取りと書き込みを同じセッションまたは同じノードで実行している場合、`select_sequential_consistency` は必要ありません。なぜなら、あなたのレプリカはすでに最新のメタデータを持っているからです。

2. 一方のレプリカに書き込み、別のレプリカから読み取る場合、`SYSTEM SYNC REPLICA LIGHTWEIGHT` を使用してレプリカが ClickHouse-Keeper からメタデータを取得するように強制できます。

3. クエリの一部として設定として `select_sequential_consistency` を使用します。

## 関連コンテンツ {#related-content}

- [ClickHouse Cloud が SharedMergeTree と Lightweight Updates でパフォーマンスを向上](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)
