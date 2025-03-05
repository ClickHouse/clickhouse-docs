---
slug: /updating-data/overview
title: 概要
description: ClickHouseでデータを更新する方法
keywords: [更新, データ更新]
---

## ClickHouseとOLTPデータベースにおけるデータ更新の違い {#differences-between-updating-data-in-clickhouse-and-oltp-databases}

データ更新の処理に関して、ClickHouseとOLTPデータベースは、その基本設計哲学と対象とするユースケースのために大きく異なります。例えば、行指向でACID準拠のリレーショナルデータベースであるPostgreSQLは、データの整合性と整合性を確保するために、Multi-Version Concurrency Control (MVCC) のようなメカニズムを通じて、堅牢でトランザクション型の更新および削除操作をサポートします。これにより、高い同時実行性のある環境でも安全かつ信頼性の高い変更が可能です。

これに対して、ClickHouseは、読み込み重視の分析と高スループットの追加専用操作に最適化された列指向データベースです。ClickHouseはネイティブでインプレース更新と削除をサポートしていますが、高I/Oを避けるために注意して使う必要があります。また、テーブルを再構造化することで、削除と更新を非同期的に処理される追加操作に変換することができ、これによりリアルタイムでのデータ操作よりも高スループットのデータ取り込みと効率的なクエリパフォーマンスに重点が置かれます。

## ClickHouseでデータを更新する方法 {#methods-to-update-data-in-clickhouse}

ClickHouseではデータを更新する方法がいくつかあり、それぞれに利点とパフォーマンス特性があります。更新するデータモデルや量に基づいて適切な方法を選択する必要があります。

どちらの操作でも、提出された変更の数が一定の時間間隔でバックグラウンドで処理される変更の数を常に上回る場合、適用される必要のある非マテリアライズ化された変更のキューは増加し続けます。これにより、最終的に `SELECT` クエリのパフォーマンスが低下します。

要約すると、更新操作は注意して発行すべきであり、`system.mutations` テーブルを使用して変更のキューを注意深く追跡する必要があります。OLTPデータベースのように頻繁に更新を発行しないでください。頻繁な更新が必要な場合は、[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)を参照してください。

| メソッド                                                                                 | 構文                                | 使用するタイミング                                                                                                                                                                                                                      |
|------------------------------------------------------------------------------------------|------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [更新変更](/sql-reference/statements/alter/update)                                     | `ALTER TABLE [table] UPDATE`        | データをディスクに即座に更新する必要がある場合に使用します（例：コンプライアンスのため）。`SELECT` パフォーマンスに悪影響を与えます。                                                                                                                                                       |
| [軽量更新](/guides/developer/lightweight-update)                                       | `ALTER TABLE [table] UPDATE`        | `SET apply_mutations_on_fly = 1;`を使用して有効にします。少量のデータを更新する際に使用します。行はすぐに更新されたデータで返されますが、最初はディスク上で内部的にのみ更新としてマークされます。                  |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)      | `ENGINE = ReplacingMergeTree`       | 大量のデータを更新する場合に使用します。このテーブルエンジンはマージ時のデータの重複排除に最適化されています。                                                                                                                                                       |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)    | `ENGINE = CollapsingMergeTree(Sign)`| 個々の行を頻繁に更新する場合や、時間の経過に伴って変化するオブジェクトの最新の状態を維持する必要があるシナリオに使用します。例えば、ユーザーの活動や記事の統計を追跡する場合などです。                                                       |

ClickHouseでデータを更新するさまざまな方法の概要は以下の通りです。

## 更新変更 {#update-mutations}

更新変更は、`ALTER TABLE … UPDATE` コマンドを通じて発行できます。例えば：

```sql
ALTER TABLE posts_temp
	(UPDATE AnswerCount = AnswerCount + 1 WHERE AnswerCount = 0)
```
これらは非常にI/Oを消費し、`WHERE` 式に一致するすべてのパーツを再書き込みます。このプロセスには原子性はありません - パーツは準備が整い次第、変更されたパーツに置き換えられ、変更中に実行される `SELECT` クエリは、すでに変更されたパーツのデータと、まだ変更されていないパーツのデータを同時に見ることになります。ユーザーは、[systems.mutations](/operations/system-tables/mutations#system_tables-mutations) テーブルを介して進行状況を追跡できます。これらはI/O集約型の操作であり、クラスターの `SELECT` パフォーマンスに影響を与える可能性があるため、節度を持って使用するべきです。

[更新変更](/sql-reference/statements/alter/update)の詳細を読む。

## 軽量更新 {#lightweight-updates}

軽量更新は、行を即座に更新し、その後の `SELECT` クエリが自動的に変更された値を返すようにするメカニズムを提供します（これはオーバーヘッドを伴い、クエリを遅くします）。これは、通常の変更の原子性の制限を効果的に解決します。以下に例を示します：

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

軽量更新では、データを更新するために変更が使用されますが、即座にはマテリアライズされず、`SELECT` クエリ中に適用されます。依然としてバックグラウンドで非同期プロセスとして適用され、変更と同様の重いオーバーヘッドを伴うため、I/O集約型の操作であるため節度を持って使用するべきです。この操作で使用できる式も制限されています（[詳細](/guides/developer/lightweight-update#support-for-subqueries-and-non-deterministic-functions)を参照してください）。

[軽量更新](/guides/developer/lightweight-update)の詳細を読む。

## Collapsing Merge Tree {#collapsing-merge-tree}

更新は高コストですが、挿入を利用して更新を行うことができるというアイデアに基づいて、[`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree) テーブルエンジンは、`sign` カラムを使用して特定の行を更新するために使用できます。[1] と [-1] のサインを持つペアの行を崩す（削除する）ことで、ClickHouseに特定の行を更新させることができます。`sign` カラムに [-1] を挿入すると、行全体が削除されます。`1` を挿入すると、ClickHouseはその行を保持します。更新対象の行は、テーブル作成時の `ORDER BY ()` ステートメントで使用されたソートキーに基づいて特定されます。

```sql
CREATE TABLE UAct
(
    UserID UInt64,
    PageViews UInt8,
    Duration UInt8,
    Sign Int8 -- CollapsingMergeTreeテーブルエンジンと一緒に使用される特別なカラム
)
ENGINE = CollapsingMergeTree(Sign)
ORDER BY UserID

INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1)
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1) -- sign = -1 がこの行の状態を更新することを示します
INSERT INTO UAct VALUES (4324182021466249494, 6, 185, 1) -- 行が新しい状態に置き換えられます

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
上記の更新アプローチは、ユーザーがクライアント側で状態を維持することを要求します。ClickHouseの観点からは最も効率的ですが、大規模で作業する際には複雑になる可能性があります。

より包括的な概要については、[`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree)のドキュメントを読むことをお勧めします。
:::

## さらなるリソース {#more-resources}

- [ClickHouseにおける更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
