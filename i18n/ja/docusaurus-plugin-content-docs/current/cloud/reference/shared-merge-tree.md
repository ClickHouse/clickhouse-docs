---
slug: /cloud/reference/shared-merge-tree
sidebar_label: SharedMergeTree
title: SharedMergeTree
keywords: [shared merge tree SharedMergeTree engine]
---

import shared_merge_tree from '@site/static/images/cloud/reference/shared-merge-tree-1.png';
import shared_merge_tree_2 from '@site/static/images/cloud/reference/shared-merge-tree-2.png';

# SharedMergeTree テーブルエンジン

*\* ClickHouse Cloud（およびファーストパーティパートナーのクラウドサービス）のみで利用可能*

SharedMergeTree テーブルエンジンファミリーは、共有ストレージ（例：Amazon S3、Google Cloud Storage、MinIO、Azure Blob Storage）上で動作するように最適化された ReplicatedMergeTree エンジンのクラウドネイティブな代替品です。各特定の MergeTree エンジンタイプには SharedMergeTree のアナログがあります。つまり、ReplacingSharedMergeTree は ReplacingReplicatedMergeTree の代わりになります。

SharedMergeTree テーブルエンジンファミリーは ClickHouse Cloud を支えています。エンドユーザーにとっては、ReplicatedMergeTree ベースのエンジンの代わりに SharedMergeTree エンジンファミリーを使用するために、何も変更する必要はありません。以下の追加の利点を提供します：

- 高い挿入スループット
- バックグラウンドマージのスループットの改善
- 変異のスループットの改善
- スケールアップおよびスケールダウン操作の高速化
- セレクトクエリにおけるより軽量な強い整合性

SharedMergeTree がもたらす重要な改善点は、ReplicatedMergeTree と比較して計算とストレージの分離がより深くなったことです。以下に ReplicatedMergeTree の計算とストレージの分離の様子を示します：

<img alt="ReplicatedMergeTree Diagram"
  src={shared_merge_tree} />

ご覧のように、ReplicatedMergeTree に保存されているデータはオブジェクトストレージ内にありますが、メタデータは各 clickhouse-server に存在しています。これは、複製操作ごとに、メタデータもすべてのレプリカで複製される必要があることを意味します。

<img alt="ReplicatedMergeTree Diagram with Metadata"
  src={shared_merge_tree_2} />

ReplicatedMergeTree とは異なり、SharedMergeTree ではレプリカが相互に通信する必要はありません。代わりに、すべての通信は共有ストレージと clickhouse-keeper を介して行われます。SharedMergeTree は非同期リーダーレスレプリケーションを実装し、調整とメタデータストレージのために clickhouse-keeper を使用します。これにより、サービスがスケールアップおよびスケールダウンする際にメタデータを複製する必要がなくなります。これにより、レプリケーション、変異、マージ、およびスケールアップ操作が迅速に行えるようになります。SharedMergeTree は、各テーブルに対して数百のレプリカを許可し、シャードなしで動的にスケーリングできるようにします。ClickHouse Cloud では、クエリに対する計算リソースをより多く利用するための分散クエリ実行アプローチが使用されます。

## Introspection {#introspection}

ReplicatedMergeTree のイントロスペクションに使用されるほとんどのシステムテーブルは SharedMergeTree に存在しますが、`system.replication_queue` と `system.replicated_fetches` は存在しません。データとメタデータの複製が行われないためです。ただし、SharedMergeTree にはこれらの2つのテーブルに対応する代替があります。

**system.virtual_parts**

このテーブルは SharedMergeTree に対する `system.replication_queue` の代替として機能します。最も最近の現在のパーツのセットや、マージ、変異、削除されたパーティションなどの進行中の将来のパーツに関する情報を保存します。

**system.shared_merge_tree_fetches**

このテーブルは SharedMergeTree に対する `system.replicated_fetches` の代替です。プライマリキーとチェックサムの現在進行中のフェッチに関する情報をメモリに格納します。

## SharedMergeTree を有効にする {#enabling-sharedmergetree}

`SharedMergeTree` はデフォルトで有効になっています。

SharedMergeTree テーブルエンジンをサポートするサービスでは、手動で何も有効にする必要はありません。テーブルを以前と同様に作成すると、CREATE TABLE クエリで指定されたエンジンに対応する SharedMergeTree ベースのテーブルエンジンが自動的に使用されます。

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ENGINE = MergeTree
ORDER BY key
```

これにより、SharedMergeTree テーブルエンジンを使用して `my_table` テーブルが作成されます。

ClickHouse Cloud では `ENGINE=MergeTree` を指定する必要はありません。以下のクエリは上のクエリと同じです。

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ORDER BY key
```

Replacing、Collapsing、Aggregating、Summing、VersionedCollapsing、または Graphite MergeTree テーブルを使用する場合は、自動的に対応する SharedMergeTree ベースのテーブルエンジンに変換されます。

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

特定のテーブルについて、使用されたテーブルエンジンを `CREATE TABLE` ステートメントとともに確認するには、`SHOW CREATE TABLE` を使用します：

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

一部の設定の挙動が大幅に変更されます：

- `insert_quorum` -- SharedMergeTree へのすべての挿入はクオラム挿入（共有ストレージに書き込まれる）であるため、この設定は SharedMergeTree テーブルエンジンを使用する際には必要ありません。
- `insert_quorum_parallel` -- SharedMergeTree へのすべての挿入はクオラム挿入（共有ストレージに書き込まれる）であるため、この設定は SharedMergeTree テーブルエンジンを使用する際には必要ありません。
- `select_sequential_consistency` -- クオラム挿入は必要なく、`SELECT` クエリに対して clickhouse-keeper への追加の負荷を引き起こします。

## 整合性 {#consistency}

SharedMergeTree は、ReplicatedMergeTree よりも優れた軽量整合性を提供します。SharedMergeTree への挿入時に、`insert_quorum` や `insert_quorum_parallel` などの設定を提供する必要はありません。挿入はクオラム挿入であり、メタデータは ClickHouse-Keeper に保存され、メタデータは少なくともクオラムの ClickHouse-Keeper に複製されます。クラスター内の各レプリカは非同期で ClickHouse-Keeper から新しい情報を取得します。

ほとんどの場合、`select_sequential_consistency` や `SYSTEM SYNC REPLICA LIGHTWEIGHT` を使用するべきではありません。非同期レプリケーションはほとんどのシナリオをカバーし、非常に低遅延です。古い読み取りを絶対に防ぐ必要がある場合は、以下の推奨事項を優先順位に従って実行してください：

1. 読み書きを同じセッションまたは同じノードで実行している場合、`select_sequential_consistency` は必要ありません。なぜなら、レプリカはすでに最新のメタデータを持っているからです。

2. 一つのレプリカに書き込み、別のレプリカから読み取る場合、`SYSTEM SYNC REPLICA LIGHTWEIGHT` を使用してレプリカに ClickHouse-Keeper からメタデータを取得させることができます。

3. 自分のクエリの一部として `select_sequential_consistency` を設定として使用してください。

## 関連コンテンツ {#related-content}

- [ClickHouse Cloud が SharedMergeTree と Lightweight Updates でパフォーマンスを向上](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)
