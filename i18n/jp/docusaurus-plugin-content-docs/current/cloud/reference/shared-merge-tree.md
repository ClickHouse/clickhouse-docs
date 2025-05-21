---
slug: /cloud/reference/shared-merge-tree
sidebar_label: 'SharedMergeTree'
title: 'SharedMergeTree'
keywords: ['SharedMergeTree']
description: 'SharedMergeTree テーブルエンジンについて説明します'
---

import shared_merge_tree from '@site/static/images/cloud/reference/shared-merge-tree-1.png';
import shared_merge_tree_2 from '@site/static/images/cloud/reference/shared-merge-tree-2.png';
import Image from '@theme/IdealImage';



# SharedMergeTree テーブルエンジン

*\* ClickHouse Cloud（および第一者パートナーのクラウドサービス）のみで利用可能*

SharedMergeTree テーブルエンジンファミリーは、共有ストレージ（例：Amazon S3、Google Cloud Storage、MinIO、Azure Blob Storage）上で動作するように最適化された ReplicatedMergeTree エンジンのクラウドネイティブな代替品です。各特定の MergeTree エンジンタイプには、SharedMergeTree のアナログがあります。つまり、ReplacingSharedMergeTree は ReplacingReplicatedMergeTree に置き換わります。

SharedMergeTree テーブルエンジンファミリーは ClickHouse Cloud を支えています。エンドユーザーにとって、ReplicatedMergeTree ベースのエンジンの代わりに SharedMergeTree エンジンファミリーを使用するために変更する必要はありません。以下の追加の利点を提供します：

- 高い挿入スループット
- バックグラウンドマージのスループットの改善
- 変異のスループットの改善
- スケールアップおよびスケールダウン操作の高速化
- 选択クエリに対するより軽量な強い整合性

SharedMergeTree がもたらす大きな改善は、ReplicatedMergeTree と比較して計算とストレージの分離がより深くなったことです。以下に ReplicatedMergeTree が計算とストレージをどのように分離しているかを見ることができます：

<Image img={shared_merge_tree} alt="ReplicatedMergeTree ダイアグラム" size="md"  />

ご覧のように、ReplicatedMergeTree に保存されたデータはオブジェクトストレージにありますが、メタデータは各 clickhouse-servers に存在します。これは、すべてのレプリケーション操作でメタデータがすべてのレプリカにレプリケートされる必要があることを意味します。

<Image img={shared_merge_tree_2} alt="メタデータを含む ReplicatedMergeTree ダイアグラム" size="md"  />

ReplicatedMergeTree とは異なり、SharedMergeTree はレプリカ同士の通信を必要としません。代わりに、すべての通信は共有ストレージと clickhouse-keeper を通じて行われます。SharedMergeTree は非同期リーダレスレプリケーションを実装し、調整とメタデータストレージのために clickhouse-keeper を使用します。これは、サービスがスケールアップおよびスケールダウンする際にメタデータをレプリケートする必要がなくなることを意味します。これにより、レプリケーション、変異、マージ、スケールアップ操作が迅速化されます。SharedMergeTree は各テーブルに対して数百のレプリカを許可し、シャードなしで動的にスケールすることを可能にします。ClickHouse Cloud では、クエリのためにより多くの計算リソースを利用するために分散クエリ実行アプローチが使用されます。

## イン introspection {#introspection}

SharedMergeTree に対するインストロスペクションに使用されるほとんどのシステムテーブルは、`system.replication_queue` と `system.replicated_fetches` を除いて存在します。これは、データおよびメタデータのレプリケーションが発生しないためです。ただし、SharedMergeTree にはこれらの2つのテーブルに対応する代替品があります。

**system.virtual_parts**

このテーブルは、SharedMergeTree に対する `system.replication_queue` の代替として機能します。これは、最も最近の現在のパーツのセットおよびマージ、変異、削除されたパーティションなどの進行中の未来のパーツに関する情報を格納します。

**system.shared_merge_tree_fetches**

このテーブルは、SharedMergeTree に対する `system.replicated_fetches` の代替です。これは、メモリ内の主キーとチェックサムの現在進行中のフェッチに関する情報を含みます。

## SharedMergeTree の有効化 {#enabling-sharedmergetree}

`SharedMergeTree` はデフォルトで有効です。

SharedMergeTree テーブルエンジンをサポートするサービスでは、手動で何かを有効にする必要はありません。テーブルは以前と同じ方法で作成でき、自動的に CREATE TABLE クエリで指定されたエンジンに対応する SharedMergeTree ベースのテーブルエンジンを使用します。

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ENGINE = MergeTree
ORDER BY key
```

これにより、SharedMergeTree テーブルエンジンを使用して `my_table` が作成されます。

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

特定のテーブルについて、`SHOW CREATE TABLE` 文を使用してどのテーブルエンジンが使用されたかを確認できます：
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

一部の設定の動作は大きく変更されています：

- `insert_quorum` -- SharedMergeTree へのすべての挿入はクォーラム挿入（共有ストレージに書き込む）であるため、この設定は SharedMergeTree テーブルエンジンを使用する際には必要ありません。
- `insert_quorum_parallel` -- SharedMergeTree へのすべての挿入はクォーラム挿入（共有ストレージに書き込む）であるため、この設定は SharedMergeTree テーブルエンジンを使用する際には必要ありません。
- `select_sequential_consistency` -- クォーラム挿入を必要とせず、`SELECT` クエリで clickhouse-keeper に追加の負荷をかけます

## 一貫性 {#consistency}

SharedMergeTree は ReplicatedMergeTree よりも軽量な一貫性を提供します。SharedMergeTree への挿入時には、`insert_quorum` や `insert_quorum_parallel` のような設定を提供する必要はありません。挿入はクォーラム挿入であり、メタデータは ClickHouse-Keeper に保存され、メタデータは少なくともクォーラムの ClickHouse-keeper にレプリケートされます。クラスター内の各レプリカは、ClickHouse-Keeper から非同期的に新しい情報を取得します。

ほとんどの時間において、`select_sequential_consistency` や `SYSTEM SYNC REPLICA LIGHTWEIGHT` を使用するべきではありません。非同期レプリケーションはほとんどのシナリオをカバーし、非常に低いレイテンシを持っています。古いデータの読み取りを絶対に防ぐ必要がある稀な場合には、以下の推奨事項に従ってください：

1. 同じセッションまたは同じノードで読み取りと書き込みを行う場合、`select_sequential_consistency` は必要ありません。なぜなら、レプリカはすでに最新のメタデータを持っているからです。

2. 一つのレプリカに書き込み、別のレプリカから読み取る場合、`SYSTEM SYNC REPLICA LIGHTWEIGHT` を使用してレプリカに ClickHouse-Keeper からメタデータを取得させることができます。

3. クエリの一部として設定として `select_sequential_consistency` を使用してください。

## 関連コンテンツ {#related-content}

- [ClickHouse Cloud が SharedMergeTree と Lightweight Updates でパフォーマンスを向上させる](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)
