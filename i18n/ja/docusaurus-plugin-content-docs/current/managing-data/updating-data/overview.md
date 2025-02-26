---
slug: /updating-data/overview
title: 概要
description: ClickHouseでのデータ更新方法
keywords: [更新, データの更新]
---

## ClickHouseとOLTPデータベースにおけるデータ更新の違い {#differences-between-updating-data-in-clickhouse-and-oltp-databases}

データ更新を扱う際、ClickHouseとOLTPデータベースは、その根本的な設計哲学およびターゲットとなるユースケースの違いにより大きく異なります。例えば、PostgreSQLは行指向でACID準拠のリレーショナルデータベースであり、強力でトランザクショナルな更新および削除操作をサポートし、Multi-Version Concurrency Control (MVCC)のようなメカニズムを使用してデータの整合性を確保します。これにより、高い同時実行環境でも安全で信頼性のある変更が可能です。

これに対して、ClickHouseは読み取り中心の分析に最適化された列指向データベースであり、高スループットの追加専用操作を得意としています。ClickHouseはインプレース更新および削除をネイティブにサポートしますが、それらは高いI/Oを避けるために注意深く使用する必要があります。代わりに、テーブルを再構成して削除および更新を追加操作に変換し、非同期的に処理または読み取り時に処理することで、高スループットのデータ取り込みと効率的なクエリパフォーマンスに重きを置いています。

## ClickHouseでデータを更新する方法 {#methods-to-update-data-in-clickhouse}

ClickHouseでデータを更新する方法はいくつかあります。それぞれの利点と性能特性が異なるため、データモデルと更新しようとするデータの量に基づいて適切な方法を選択する必要があります。

両方の操作において、提出された変異の数が、ある時間間隔内でバックグラウンドで処理される変異の数を常に超える場合、適用する必要のある非マテリアライズド変異のキューは増え続けます。これにより、最終的には `SELECT` クエリの性能が低下します。

要約すると、更新操作は慎重に発行されるべきであり、`system.mutations` テーブルを使用して変異のキューを注意深く監視する必要があります。OLTPデータベースのように頻繁に更新を発行しないでください。頻繁な更新が必要な場合は、[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)を参照してください。

| メソッド                                                                                           | 構文                               | 使用タイミング                                                                                                                                                                                                                              |
|--------------------------------------------------------------------------------------------------|--------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Update mutation](/sql-reference/statements/alter/update)                                      | `ALTER TABLE [table] UPDATE`         | データを即座にディスクに更新する必要がある場合に使用します（例：コンプライアンスのため）。`SELECT` パフォーマンスに悪影響を与えます。                                                                                                                                                                   |
| [Lightweight update](/guides/developer/lightweight-update)                                     | `ALTER TABLE [table] UPDATE`         | 使用するには `SET apply_mutations_on_fly = 1;` を有効にします。少量のデータを更新するときに使用します。行は、すべての後続の `SELECT` クエリで更新されたデータで即座に返されますが、ディスク上では初めて内部的に更新されたとマークされます。                                                               |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)               | `ENGINE = ReplacingMergeTree`        | 大量のデータを更新するときに使用します。このテーブルエンジンは、マージ時のデータの重複排除に最適化されています。                                                                                                                                                                          |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)           | `ENGINE = CollapsingMergeTree(Sign)` | 行を頻繁に更新する場合や、時間とともに変化するオブジェクトの最新の状態を保持する必要があるシナリオで使用します。例えば、ユーザー活動や記事統計を追跡する場合です。                                                                                                                 |

次に、ClickHouseでデータを更新するためのさまざまな方法の概要を示します。

## 更新変異 {#update-mutations}

更新変異は、`ALTER TABLE … UPDATE` コマンドを介して発行できます。例えば:

```sql
ALTER TABLE posts_temp
    (UPDATE AnswerCount = AnswerCount + 1 WHERE AnswerCount = 0)
```
これらは非常にI/O集約的で、`WHERE` 式に一致するすべてのパーツを書き換えます。このプロセスには原子性がなく、変異が行われている間に実行を開始する `SELECT` クエリは、すでに変異されたパーツのデータとまだ変異されていないパーツのデータの両方を見ることになります。ユーザーは、[systems.mutations](/operations/system-tables/mutations#system_tables-mutations) テーブルを介して進行状況の状態を追跡できます。これらはI/O集約的な操作であり、クラスターの `SELECT` パフォーマンスに影響を与える可能性があるため、使用は控えめにするべきです。

[更新変異についての詳細はこちら](/sql-reference/statements/alter/update)をお読みください。

## 軽量更新 {#lightweight-updates}

軽量更新では、行を即座に更新するメカニズムを提供し、後続の `SELECT` クエリは自動的に変更された値を返すようになります（これにはオーバーヘッドがかかり、クエリを遅くします）。これは、通常の変異の原子性制限に対処します。以下に例を示します:

```sql
SET apply_mutations_on_fly = 1;

SELECT ViewCount
FROM posts
WHERE Id = 404346

┌─ViewCount─┐
│ 	26762   │
└───────────┘

1 row in set. Elapsed: 0.115 sec. Processed 59.55 million rows, 238.25 MB (517.83 million rows/s., 2.07 GB/s.)
Peak memory usage: 113.65 MiB.

-increment count
ALTER TABLE posts
	(UPDATE ViewCount = ViewCount + 1 WHERE Id = 404346)

SELECT ViewCount
FROM posts
WHERE Id = 404346

┌─ViewCount─┐
│ 	26763   │
└───────────┘

1 row in set. Elapsed: 0.149 sec. Processed 59.55 million rows, 259.91 MB (399.99 million rows/s., 1.75 GB/s.)
```

軽量更新では、データを更新するために変異が使用されますが、即座にマテリアライズされるわけではなく、`SELECT` クエリ時に適用されます。それでも、バックグラウンドで非同期プロセスとして適用され、変異と同じ重いオーバーヘッドがかかるため、I/O集約的な操作となり、使用は控えめにする必要があります。この操作で使用できる式も限られています（[詳細はこちら](/guides/developer/lightweight-update#support-for-subqueries-and-non-deterministic-functions)を参照）。 

[軽量更新の詳細はこちら](/guides/developer/lightweight-update)をお読みください。

## Collapsing Merge Tree {#collapsing-merge-tree}

更新は高コストですが、挿入を利用して更新を行うことができるという考えに基づいて、 [`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree) テーブルエンジンは、特定の行を更新するために、`sign` カラムと一緒に使用することができます。これは、`1` と `-1` のサインを持つ行のペアを削除（コラプス）することによって特定の行を更新するようClickHouseに指示します。`sign` カラムに `-1` を挿入すると、行全体が削除されます。`sign` カラムに `1` を挿入すると、ClickHouseは行を保持します。更新する行は、テーブル作成時の `ORDER BY ()` で使用されるソートキーに基づいて特定されます。

```sql
CREATE TABLE UAct
(
    UserID UInt64,
    PageViews UInt8,
    Duration UInt8,
    Sign Int8 -- CollapsingMergeTreeテーブルエンジンと共に使用される特別なカラム
)
ENGINE = CollapsingMergeTree(Sign)
ORDER BY UserID

INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1)
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1) -- sign = -1は、この行の状態を更新することを示します
INSERT INTO UAct VALUES (4324182021466249494, 6, 185, 1) -- 行が新しい状態で置き換えられます

SELECT
    UserID,
    sum(PageViews * Sign) AS PageViews,
    sum(Duration * Sign) AS Duration
FROM UAct
GROUP BY UserID
HAVING sum(Sign) > 0

┌──────────────UserID─┬─PageViews─┬─Duration─┐
│ 4324182021466249494 │         6 │      185 │
└─────────────────────┴───────────┴──────────┘
```

:::note
上記の更新アプローチでは、ユーザーがクライアント側で状態を維持する必要があります。これはClickHouseの観点から最も効率的ですが、大規模での作業は複雑になる可能性があります。

[`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree)に関するドキュメントを読むことをお勧めします。より包括的な概要が提供されています。
:::

## 参考資料 {#more-resources}

- [ClickHouseにおける更新と削除の扱い](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
