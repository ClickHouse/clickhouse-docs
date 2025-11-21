---
slug: /cloud/reference/shared-merge-tree
sidebar_label: 'SharedMergeTree'
title: 'SharedMergeTree'
keywords: ['SharedMergeTree']
description: 'SharedMergeTree テーブルエンジンの説明'
doc_type: 'reference'
---

import shared_merge_tree from '@site/static/images/cloud/reference/shared-merge-tree-1.png';
import shared_merge_tree_2 from '@site/static/images/cloud/reference/shared-merge-tree-2.png';
import Image from '@theme/IdealImage';


# SharedMergeTree テーブルエンジン

SharedMergeTree テーブルエンジンファミリーは、共有ストレージ（例: Amazon S3、Google Cloud Storage、MinIO、Azure Blob Storage）上での動作に最適化された、ReplicatedMergeTree エンジンのクラウドネイティブな代替です。各種の MergeTree エンジンタイプごとに対応する SharedMergeTree エンジンが用意されており、たとえば ReplacingSharedMergeTree は ReplacingReplicatedMergeTree を置き換えます。

SharedMergeTree テーブルエンジンファミリーは ClickHouse Cloud を支える基盤です。エンドユーザーは、ReplicatedMergeTree ベースのエンジンの代わりに SharedMergeTree エンジンファミリーを利用し始めるにあたって、何も変更を行う必要はありません。これにより、次のような追加の利点が得られます:

- より高い挿入スループット
- バックグラウンドマージのスループット向上
- ミューテーションのスループット向上
- より高速なスケールアップおよびスケールダウン
- SELECT クエリに対する、より軽量な強い一貫性

SharedMergeTree がもたらす大きな改善点は、ReplicatedMergeTree と比較して、コンピュートとストレージの分離をより一層進めていることです。以下に、ReplicatedMergeTree がコンピュートとストレージをどのように分離しているかを示します:

<Image img={shared_merge_tree} alt="ReplicatedMergeTree の図" size="md"  />

ご覧のとおり、ReplicatedMergeTree に保存されているデータはオブジェクトストレージ上にあるものの、メタデータは各 clickhouse-server 上に保持されています。これは、すべてのレプリケーション処理において、メタデータもすべてのレプリカにレプリケートする必要があることを意味します。

<Image img={shared_merge_tree_2} alt="メタデータ付き ReplicatedMergeTree の図" size="md"  />

ReplicatedMergeTree と異なり、SharedMergeTree ではレプリカ同士が互いに通信する必要がありません。代わりに、すべての通信は共有ストレージと clickhouse-keeper を通じて行われます。SharedMergeTree は非同期のリーダーレスレプリケーションを実装し、調整およびメタデータの保存に clickhouse-keeper を使用します。これにより、サービスのスケールアップおよびスケールダウン時にメタデータをレプリケートする必要がなくなります。その結果、レプリケーション、ミューテーション、マージ、およびスケールアップ処理がより高速になります。SharedMergeTree は各テーブルに対して数百のレプリカを許容し、シャードを用いずに動的なスケーリングを可能にします。ClickHouse Cloud では、クエリに対してより多くのコンピュートリソースを活用するために、分散クエリ実行アプローチが採用されています。



## イントロスペクション {#introspection}

ReplicatedMergeTreeのイントロスペクションに使用されるシステムテーブルのほとんどは、SharedMergeTreeにも存在しますが、`system.replication_queue`と`system.replicated_fetches`は例外です。これは、データとメタデータのレプリケーションが発生しないためです。ただし、SharedMergeTreeには、これら2つのテーブルに対応する代替テーブルが用意されています。

**system.virtual_parts**

このテーブルは、SharedMergeTreeにおける`system.replication_queue`の代替として機能します。最新の現在のパートセット、およびマージ、ミューテーション、削除されたパーティションなど、進行中の将来のパートに関する情報を格納します。

**system.shared_merge_tree_fetches**

このテーブルは、SharedMergeTreeにおける`system.replicated_fetches`の代替です。プライマリキーとチェックサムをメモリにフェッチする現在進行中の処理に関する情報を格納します。


## SharedMergeTreeの有効化 {#enabling-sharedmergetree}

`SharedMergeTree`はデフォルトで有効になっています。

SharedMergeTreeテーブルエンジンをサポートするサービスでは、手動で有効化する必要はありません。従来と同じ方法でテーブルを作成すると、CREATE TABLEクエリで指定したエンジンに対応するSharedMergeTreeベースのテーブルエンジンが自動的に使用されます。

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ENGINE = MergeTree
ORDER BY key
```

これにより、SharedMergeTreeテーブルエンジンを使用して`my_table`テーブルが作成されます。

ClickHouse Cloudでは`default_table_engine=MergeTree`が設定されているため、`ENGINE=MergeTree`を指定する必要はありません。以下のクエリは上記のクエリと同一です。

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ORDER BY key
```

Replacing、Collapsing、Aggregating、Summing、VersionedCollapsing、またはGraphite MergeTreeテーブルを使用する場合、対応するSharedMergeTreeベースのテーブルエンジンに自動的に変換されます。

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

特定のテーブルに対して、`SHOW CREATE TABLE`を使用することで、`CREATE TABLE`文で使用されたテーブルエンジンを確認できます。

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

一部の設定の動作が大幅に変更されています：

- `insert_quorum` -- SharedMergeTreeへのすべての挿入はクォーラム挿入（共有ストレージへの書き込み）であるため、SharedMergeTreeテーブルエンジンを使用する際、この設定は不要です。
- `insert_quorum_parallel` -- SharedMergeTreeへのすべての挿入はクォーラム挿入（共有ストレージへの書き込み）であるため、SharedMergeTreeテーブルエンジンを使用する際、この設定は不要です。
- `select_sequential_consistency` -- クォーラム挿入を必要としませんが、`SELECT`クエリ実行時にclickhouse-keeperへの追加負荷が発生します


## 一貫性 {#consistency}

SharedMergeTreeは、ReplicatedMergeTreeよりも優れた軽量な一貫性を提供します。SharedMergeTreeへの挿入時には、`insert_quorum`や`insert_quorum_parallel`などの設定を指定する必要はありません。挿入はクォーラム挿入として処理され、メタデータはClickHouse-Keeperに保存され、少なくともClickHouse-Keeperのクォーラムに複製されます。クラスタ内の各レプリカは、ClickHouse-Keeperから非同期的に新しい情報を取得します。

ほとんどの場合、`select_sequential_consistency`や`SYSTEM SYNC REPLICA LIGHTWEIGHT`を使用する必要はありません。非同期レプリケーションはほとんどのシナリオに対応し、非常に低いレイテンシを実現します。古いデータの読み取りを絶対に防ぐ必要がある稀なケースでは、以下の推奨事項を優先順位に従って実施してください:

1. 読み取りと書き込みを同じセッションまたは同じノードで実行している場合、レプリカはすでに最新のメタデータを保持しているため、`select_sequential_consistency`を使用する必要はありません。

2. 1つのレプリカに書き込み、別のレプリカから読み取る場合は、`SYSTEM SYNC REPLICA LIGHTWEIGHT`を使用して、レプリカにClickHouse-Keeperからメタデータを強制的に取得させることができます。

3. クエリの一部として`select_sequential_consistency`を設定として使用します。
