---
'slug': '/cloud/reference/shared-merge-tree'
'sidebar_label': 'SharedMergeTree'
'title': 'SharedMergeTree'
'keywords':
- 'SharedMergeTree'
'description': 'SharedMergeTree テーブルエンジンについて説明します'
---

import shared_merge_tree from '@site/static/images/cloud/reference/shared-merge-tree-1.png';
import shared_merge_tree_2 from '@site/static/images/cloud/reference/shared-merge-tree-2.png';
import Image from '@theme/IdealImage';



# SharedMergeTree テーブルエンジン

*\* ClickHouse Cloud（および第一パーティパートナーのクラウドサービス）でのみ利用可能*

SharedMergeTree テーブルエンジンファミリーは、ReplicatedMergeTree エンジンのクラウドネイティブな代替であり、共有ストレージ（例：Amazon S3、Google Cloud Storage、MinIO、Azure Blob Storage）上で動作するように最適化されています。各特定の MergeTree エンジンタイプには SharedMergeTree のアナログがあります。即ち、ReplacingSharedMergeTree は ReplacingReplicatedMergeTree を置き換えます。

SharedMergeTree テーブルエンジンファミリーは ClickHouse Cloud を支えています。エンドユーザーにとって、ReplicatedMergeTree ベースのエンジンの代わりに SharedMergeTree エンジンファミリーを使用するために必要な変更はありません。以下の追加メリットを提供します：

- より高い挿入スループット
- バックグラウンドマージのスループットの向上
- ミューテーションのスループットの向上
- スケールアップおよびスケールダウン操作の高速化
- セレクトクエリに対するより軽量な強い整合性

SharedMergeTree がもたらす重要な改善の一つは、ReplicatedMergeTree に比べてコンピュートとストレージの深い分離を提供することです。以下に、ReplicatedMergeTree がどのようにコンピュートとストレージを分離しているかを示します：

<Image img={shared_merge_tree} alt="ReplicatedMergeTree 図" size="md"  />

ご覧の通り、ReplicatedMergeTree に保存されているデータはオブジェクトストレージにありますが、メタデータは依然として各 clickhouse-server に存在します。これは、すべてのレプリケーション操作に対してメタデータもすべてのレプリカに複製する必要があることを意味します。

<Image img={shared_merge_tree_2} alt="メタデータを持つ ReplicatedMergeTree 図" size="md"  />

ReplicatedMergeTree とは異なり、SharedMergeTree はレプリカ同士の通信を必要としません。代わりに、すべての通信は共有ストレージと clickhouse-keeper を通じて行われます。SharedMergeTree は非同期リーダーレスレプリケーションを実装し、コーディネーションとメタデータストレージには clickhouse-keeper を使用します。これにより、サービスのスケールアップおよびスケールダウンに伴い、メタデータを複製する必要がなくなります。これにより、より迅速なレプリケーション、ミューテーション、マージ、スケールアップ操作が行えます。SharedMergeTree は各テーブルに対して数百のレプリカを許容し、シャードなしで動的にスケールすることが可能です。ClickHouse Cloud では分散クエリエグゼキューションアプローチを利用して、クエリのためのより多くのコンピュートリソースを使用します。

## インストロスペクション {#introspection}

ReplicatedMergeTree のインストロスペクションに使用されるほとんどのシステムテーブルは SharedMergeTree にも存在しますが、`system.replication_queue` と `system.replicated_fetches` はデータとメタデータの複製が行われないため存在しません。しかし、SharedMergeTree にはこれら2つのテーブルに対応する代替があります。

**system.virtual_parts**

このテーブルは SharedMergeTree の `system.replication_queue` の代替として機能します。現在のパーツの最も最近のセットと、マージ、ミューテーション、削除されたパーティションなどの進行中の将来のパーツに関する情報を格納します。

**system.shared_merge_tree_fetches**

このテーブルは SharedMergeTree の `system.replicated_fetches` の代替です。プライマリキーとチェックサムのメモリ内にある現在の進行中のフェッチに関する情報を含みます。

## SharedMergeTree の有効化 {#enabling-sharedmergetree}

`SharedMergeTree` はデフォルトで有効です。

SharedMergeTree テーブルエンジンをサポートするサービスでは、手動で有効にする必要はありません。以前と同様にテーブルを作成でき、CREATE TABLE クエリで指定されたエンジンに対応する SharedMergeTree ベースのテーブルエンジンが自動的に使用されます。

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ENGINE = MergeTree
ORDER BY key
```

これにより、SharedMergeTree テーブルエンジンを使用して `my_table` テーブルが作成されます。

ClickHouse Cloud では `ENGINE=MergeTree` を指定する必要はありません。以下のクエリは上記のクエリと同じです。

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ORDER BY key
```

Replacing、Collapsing、Aggregating、Summing、VersionedCollapsing、または Graphite MergeTree テーブルを使用すると、自動的に対応する SharedMergeTree ベースのテーブルエンジンに変換されます。

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

特定のテーブルについて、どのテーブルエンジンが `CREATE TABLE` ステートメントで使用されたかを `SHOW CREATE TABLE` で確認できます：
``` sql
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

- `insert_quorum` -- SharedMergeTree へのすべての挿入がクォーラム挿入（共有ストレージに書き込まれます）であるため、SharedMergeTree テーブルエンジンを使用する際にこの設定は必要ありません。
- `insert_quorum_parallel` -- SharedMergeTree へのすべての挿入がクォーラム挿入（共有ストレージに書き込まれます）であるため、SharedMergeTree テーブルエンジンを使用する際にこの設定は必要ありません。
- `select_sequential_consistency` -- クォーラム挿入を必要とせず、`SELECT` クエリでクリックハウスキーパーに追加の負荷をかけます。

## 一貫性 {#consistency}

SharedMergeTree は ReplicatedMergeTree よりも優れた軽量な一貫性を提供します。SharedMergeTree に挿入する際、`insert_quorum` や `insert_quorum_parallel` などの設定を提供する必要はありません。挿入はクォーラム挿入であり、メタデータは ClickHouse-Keeper に格納され、メタデータは少なくともクォーラムの ClickHouse-Keeper に複製されます。クラスター内の各レプリカは ClickHouse-Keeper から新しい情報を非同期的にフェッチします。

ほとんどの場合、`select_sequential_consistency` や `SYSTEM SYNC REPLICA LIGHTWEIGHT` を使用する必要はありません。非同期レプリケーションはほとんどのシナリオをカバーし、非常に低いレイテンシを持っています。古い読み取りを防ぐ必要がある珍しいケースでは、以下の推奨事項に従ってください。

1. 読み取りと書き込みが同じセッションや同じノードで行われている場合、`select_sequential_consistency` は必要ありません。なぜなら、あなたのレプリカはすでに最新のメタデータを持っているからです。

2. 1つのレプリカに書き込み、別のレプリカから読み取る場合は、`SYSTEM SYNC REPLICA LIGHTWEIGHT` を使用してレプリカが ClickHouse-Keeper からメタデータをフェッチするように強制できます。

3. クエリの一部として設定として `select_sequential_consistency` を使用します。

## 関連コンテンツ {#related-content}

- [ClickHouse Cloud は SharedMergeTree と Lightweight Updates で性能を向上させます](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)
