---
slug: /cloud/reference/shared-merge-tree
sidebar_label: 'SharedMergeTree'
title: 'SharedMergeTree'
keywords: ['SharedMergeTree']
description: 'SharedMergeTree テーブルエンジンについて説明します'
doc_type: 'reference'
---

import shared_merge_tree from '@site/static/images/cloud/reference/shared-merge-tree-1.png';
import shared_merge_tree_2 from '@site/static/images/cloud/reference/shared-merge-tree-2.png';
import Image from '@theme/IdealImage';


# SharedMergeTree テーブルエンジン \\{#sharedmergetree-table-engine\\}

SharedMergeTree テーブルエンジンファミリーは、共有ストレージ（例: Amazon S3、Google Cloud Storage、MinIO、Azure Blob Storage）上で動作するように最適化された、クラウドネイティブな ReplicatedMergeTree エンジンの代替です。あらゆる種類の MergeTree エンジンに対応する SharedMergeTree が用意されており、たとえば SharedReplacingMergeTree は ReplicatedReplacingMergeTree の代わりとなります。

SharedMergeTree テーブルエンジンファミリーは ClickHouse Cloud の基盤となっています。エンドユーザー側では、ReplicatedMergeTree ベースのエンジンの代わりに SharedMergeTree エンジンファミリーを利用し始めるために、特別な変更は必要ありません。SharedMergeTree は次のような追加の利点を提供します:

- より高い挿入スループット
- バックグラウンドマージのスループット向上
- ミューテーションのスループット向上
- スケールアップおよびスケールダウン操作の高速化
- `SELECT` クエリに対する、より軽量な強整合性

SharedMergeTree の大きな改善点の 1 つは、ReplicatedMergeTree と比較して、コンピュートとストレージの分離をより徹底して実現していることです。以下に、ReplicatedMergeTree がどのようにコンピュートとストレージを分離しているかを示します:

<Image img={shared_merge_tree} alt="ReplicatedMergeTree の図" size="md"  />

ご覧のとおり、ReplicatedMergeTree ではデータ自体はオブジェクトストレージに保存されていますが、メタデータは依然として各 clickhouse-server 上に存在しています。これは、あらゆるレプリケーション処理において、メタデータもすべてのレプリカ間でレプリケートする必要があることを意味します。

<Image img={shared_merge_tree_2} alt="メタデータ付き ReplicatedMergeTree の図" size="md"  />

ReplicatedMergeTree と異なり、SharedMergeTree ではレプリカ同士が直接通信する必要はありません。代わりに、すべての通信は共有ストレージと clickhouse-keeper を通じて行われます。SharedMergeTree は非同期のリーダーレスレプリケーションを実装し、clickhouse-keeper をコーディネーションおよびメタデータの保存に利用します。これは、サービスをスケールアップおよびスケールダウンしても、メタデータをレプリケートする必要がないことを意味します。その結果、レプリケーション、ミューテーション、マージ、およびスケールアップ操作が高速になります。SharedMergeTree はテーブルごとに数百のレプリカをサポートし、シャードを用いずに動的なスケーリングを可能にします。ClickHouse Cloud では、クエリに対してより多くのコンピュートリソースを活用するために、分散クエリ実行アプローチが採用されています。

## 内部情報の確認 \\{#introspection\\}

ReplicatedMergeTree の内部情報確認に利用されるほとんどの system テーブルは SharedMergeTree にも存在しますが、データおよびメタデータのレプリケーションが行われないため、`system.replication_queue` と `system.replicated_fetches` は存在しません。ただし、SharedMergeTree にはこれら 2 つのテーブルに対応する代替テーブルが用意されています。

**system.virtual_parts**

このテーブルは、SharedMergeTree における `system.replication_queue` の代替として機能します。最新の現在のパーツ集合に関する情報に加え、マージやミューテーション、ドロップされたパーティションなど、進行中の処理で生成される将来のパーツに関する情報も保持します。

**system.shared_merge_tree_fetches**

このテーブルは、SharedMergeTree における `system.replicated_fetches` の代替です。プライマリキーおよびチェックサムをメモリにフェッチしている、進行中の取得処理に関する情報を保持します。

## SharedMergeTree の有効化 \{#enabling-sharedmergetree\}

`SharedMergeTree` はデフォルトで有効になっています。

SharedMergeTree テーブルエンジンをサポートするサービスでは、手動で何かを有効にする必要はありません。これまでと同じ方法でテーブルを作成すれば、CREATE TABLE クエリで指定したエンジンに対応する SharedMergeTree ベースのテーブルエンジンが自動的に使用されます。

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ENGINE = MergeTree
ORDER BY key
```

これにより、SharedMergeTree テーブルエンジンを使用してテーブル `my_table` が作成されます。

ClickHouse Cloud では、`default_table_engine=MergeTree` が設定されているため、`ENGINE=MergeTree` を指定する必要はありません。次のクエリは上記のクエリと同じです。

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ORDER BY key
```

Replacing、Collapsing、Aggregating、Summing、VersionedCollapsing、Graphite の各 MergeTree テーブルを使用している場合、それらは自動的に対応する SharedMergeTree ベースのテーブルエンジンに変換されます。

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

特定のテーブルについて、`SHOW CREATE TABLE` を実行して `CREATE TABLE` ステートメントを確認することで、どのテーブルエンジンが使用されているかを確認できます。

```sql
SHOW CREATE TABLE myFirstReplacingMT;
```

```sql
CREATE TABLE default.myFirstReplacingMT
( `key` Int64, `someCol` String, `eventTime` DateTime )
ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}')
ORDER BY key
```


## 設定 \\{#settings\\}

一部の設定の挙動が大きく変更されています。

- `insert_quorum` -- SharedMergeTree へのすべての挿入はクォーラム挿入（共有ストレージへの書き込み）となるため、SharedMergeTree テーブルエンジンを使用する場合、この設定は不要です。
- `insert_quorum_parallel` -- SharedMergeTree へのすべての挿入はクォーラム挿入（共有ストレージへの書き込み）となるため、SharedMergeTree テーブルエンジンを使用する場合、この設定は不要です。
- `select_sequential_consistency` -- クォーラム挿入を必要とせず、`SELECT` クエリ実行時に clickhouse-keeper への追加負荷を発生させます。

## 一貫性 \\{#consistency\\}

SharedMergeTree は、ReplicatedMergeTree よりも軽量な一貫性モデルを提供します。SharedMergeTree に対して挿入を行う場合、`insert_quorum` や `insert_quorum_parallel` のような設定を指定する必要はありません。挿入はクォーラム挿入となり、メタデータは ClickHouse-Keeper に保存され、そのメタデータは少なくともクォーラムを満たす数の ClickHouse-Keeper ノードにレプリケートされます。クラスタ内の各レプリカは、ClickHouse-Keeper から新しい情報を非同期に取得します。

ほとんどの場合、`select_sequential_consistency` や `SYSTEM SYNC REPLICA LIGHTWEIGHT` を使用する必要はありません。非同期レプリケーションでほとんどのシナリオをカバーでき、レイテンシも非常に低く抑えられます。古いデータを読み取ってしまうことをどうしても防ぐ必要があるまれなケースでは、優先度順に次の推奨事項に従ってください。

1. 同じセッション、または同じノードで読み取りと書き込みのクエリを実行している場合、`select_sequential_consistency` を使用する必要はありません。レプリカはすでに最新のメタデータを保持しているためです。

2. あるレプリカに書き込み、別のレプリカから読み取る場合は、`SYSTEM SYNC REPLICA LIGHTWEIGHT` を使用して、そのレプリカに ClickHouse-Keeper からメタデータを取得させることができます。

3. クエリの設定として `select_sequential_consistency` を指定します。