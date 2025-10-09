---
'slug': '/cloud/reference/shared-merge-tree'
'sidebar_label': 'SharedMergeTree'
'title': 'SharedMergeTree'
'keywords':
- 'SharedMergeTree'
'description': 'SharedMergeTree テーブルエンジンについて説明します'
'doc_type': 'reference'
---

import shared_merge_tree from '@site/static/images/cloud/reference/shared-merge-tree-1.png';
import shared_merge_tree_2 from '@site/static/images/cloud/reference/shared-merge-tree-2.png';
import Image from '@theme/IdealImage';


# SharedMergeTree テーブルエンジン

SharedMergeTree テーブルエンジンファミリーは、共有ストレージ（例：Amazon S3、Google Cloud Storage、MinIO、Azure Blob Storage）の上で動作するよう最適化された、ReplicatedMergeTree エンジンのクラウドネイティブな置き換えです。各特定の MergeTree エンジンタイプに対して SharedMergeTree のアナログがあり、つまり、ReplacingSharedMergeTree は ReplacingReplicatedMergeTree を置き換えます。

SharedMergeTree テーブルエンジンファミリーは ClickHouse Cloud を支えています。エンドユーザーにとっては、ReplicatedMergeTree ベースのエンジンの代わりに SharedMergeTree エンジンファミリーを使用するために変更する必要はありません。以下の追加の利点を提供します。

- 高い挿入スループット
- バックグラウンドでのマージのスループット改善
- 変異のスループット改善
- スケールアップおよびスケールダウン操作の高速化
- SELECT クエリに対するより軽量な強い整合性

SharedMergeTree がもたらす重要な改善点は、ReplicatedMergeTree と比較して計算とストレージの分離がより深くなることです。以下に ReplicatedMergeTree がどのように計算とストレージを分離しているかを見ることができます。

<Image img={shared_merge_tree} alt="ReplicatedMergeTree 図" size="md"  />

ご覧のとおり、ReplicatedMergeTree に保存されたデータはオブジェクトストレージにありますが、メタデータは依然として各 ClickHouse サーバーに存在します。これは、すべてのレプリケーション操作について、メタデータもすべてのレプリカにレプリケートする必要があることを意味します。

<Image img={shared_merge_tree_2} alt="メタデータを持つ ReplicatedMergeTree 図" size="md"  />

ReplicatedMergeTree とは異なり、SharedMergeTree はレプリカ間の通信を必要としません。代わりに、すべての通信は共有ストレージと ClickHouse-Keeper を介して行われます。SharedMergeTree は非同期リーダーレスレプリケーションを実装し、調整とメタデータストレージのために ClickHouse-Keeper を使用します。これにより、サービスがスケールアップまたはスケールダウンする際にメタデータをレプリケートする必要がなくなります。これにより、レプリケーション、変異、マージ、スケールアップ操作が高速化されます。SharedMergeTree は、各テーブルに対して数百のレプリカを許可し、シャードなしで動的にスケーリングすることを可能にします。ClickHouse Cloud では、クエリに対してより多くの計算リソースを活用するために分散クエリ実行アプローチが使用されます。

## インストロpection {#introspection}

ReplicatedMergeTree のインストロpection に使用されるシステムテーブルのほとんどは、データとメタデータのレプリケーションが行われないため、`system.replication_queue` および `system.replicated_fetches` を除いて、SharedMergeTree のために存在します。しかし、SharedMergeTree にはこれら2つのテーブルに対応する代替があります。

**system.virtual_parts**

このテーブルは、SharedMergeTree の `system.replication_queue` の代替として機能します。最新の現在のパーツのセットと、マージ、変異、ドロップされたパーティションなどの進行中の将来のパーツに関する情報を格納します。

**system.shared_merge_tree_fetches**

このテーブルは、SharedMergeTree の `system.replicated_fetches` の代替です。プライマリキーとチェックサムをメモリにフェッチする現在の進行中のフェッチに関する情報を含みます。

## SharedMergeTree の有効化 {#enabling-sharedmergetree}

`SharedMergeTree` はデフォルトで有効になっています。

SharedMergeTree テーブルエンジンをサポートするサービスに対しては、手動で何かを有効にする必要はありません。テーブルは以前と同じ方法で作成でき、自動的にCREATE TABLE クエリで指定されたエンジンに対応する SharedMergeTree ベースのテーブルエンジンが使用されます。

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ENGINE = MergeTree
ORDER BY key
```

これにより `my_table` というテーブルが SharedMergeTree テーブルエンジンを使用して作成されます。

ClickHouse Cloud で `default_table_engine=MergeTree` が設定されているため、`ENGINE=MergeTree` を指定する必要はありません。以下のクエリは上記と同一です。

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ORDER BY key
```

Replacing, Collapsing, Aggregating, Summing, VersionedCollapsing、または Graphite MergeTree テーブルを使用すると、それは自動的に対応する SharedMergeTree ベースのテーブルエンジンに変換されます。

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

特定のテーブルについて、どのテーブルエンジンが `CREATE TABLE` ステートメントで使用されたかを `SHOW CREATE TABLE` を使用して確認できます。

```sql
SHOW CREATE TABLE myFirstReplacingMT;
```

```sql
CREATE TABLE default.myFirstReplacingMT
( `key` Int64, `someCol` String, `eventTime` DateTime )
ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}')
ORDER BY key
```

## 設定 {#settings}

いくつかの設定の動作は大きく変更されています：

- `insert_quorum` -- SharedMergeTree へのすべての挿入はクオーラム挿入（共有ストレージに書き込まれる）であるため、本設定は SharedMergeTree テーブルエンジンを使用する際には必要ありません。
- `insert_quorum_parallel` -- SharedMergeTree へのすべての挿入はクオーラム挿入（共有ストレージに書き込まれる）であるため、本設定は SharedMergeTree テーブルエンジンを使用する際には必要ありません。
- `select_sequential_consistency` -- クオーラム挿入を必要とせず、`SELECT` クエリに対して ClickHouse-Keeper に追加の負荷を引き起こします。

## 一貫性 {#consistency}

SharedMergeTree は ReplicatedMergeTree よりも優れた軽量な整合性を提供します。SharedMergeTree に挿入する際、`insert_quorum` や `insert_quorum_parallel` のような設定を提供する必要はありません。挿入はクオーラム挿入であり、メタデータは ClickHouse-Keeper に保存され、メタデータは少なくともクオーラムの ClickHouse-Keeper にレプリケートされます。クラスター内の各レプリカは、新しい情報を非同期的に ClickHouse-Keeper から取得します。

ほとんどの場合、`select_sequential_consistency` や `SYSTEM SYNC REPLICA LIGHTWEIGHT` を使用する必要はありません。非同期レプリケーションはほとんどのシナリオをカバーし、非常に低いレイテンシがあります。まれに古い読み取りを防ぐ必要がある場合は、次の推奨を優先順位順に従ってください：

1. 読み取りと書き込みを同じセッションまたは同じノードで実行する場合、レプリカはすでに最も最近のメタデータを持っているため、`select_sequential_consistency` は必要ありません。

2. 1つのレプリカに書き込み、別のレプリカから読み取る場合は、`SYSTEM SYNC REPLICA LIGHTWEIGHT` を使用してレプリカが ClickHouse-Keeper からメタデータを取得するよう強制できます。

3. クエリの一部として設定として `select_sequential_consistency` を使用します。
