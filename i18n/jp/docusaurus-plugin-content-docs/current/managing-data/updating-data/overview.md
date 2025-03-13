---
slug: '/updating-data/overview'
title: '概要'
description: 'ClickHouseでのデータ更新方法'
keywords: [update, updating data]
---

## ClickHouseとOLTPデータベースにおけるデータ更新の違い {#differences-between-updating-data-in-clickhouse-and-oltp-databases}

データの更新を扱う際、ClickHouseとOLTPデータベースは、その基本的な設計哲学とターゲットユースケースが異なるため、大きく異なります。たとえば、行指向でACID準拠の関係データベースであるPostgreSQLは、強力でトランザクショナルな更新や削除操作をサポートし、Multi-Version Concurrency Control (MVCC)などのメカニズムを通じてデータの整合性と完全性を保証します。これにより、高い同時実行環境でも安全で信頼性のある修正が可能になります。

対照的に、ClickHouseは読み取り重視の分析と高スループットの追加専用操作に最適化された列指向データベースです。ClickHouseはネイティブにインプレースの更新や削除をサポートしていますが、これらは高I/Oを回避するために慎重に使用する必要があります。代わりに、削除や更新を追加操作に変換するためにテーブルを再構築することができ、これにより非同期で処理され、または読み取り時に処理されるため、リアルタイムでのデータ操作ではなく、高スループットのデータ取り込みと効率的なクエリパフォーマンスに焦点を当てています。

## ClickHouseでのデータ更新方法 {#methods-to-update-data-in-clickhouse}

ClickHouseでデータを更新する方法はいくつかあり、それぞれには独自の利点とパフォーマンス特性があります。更新するデータモデルとデータの量に基づいて適切な方法を選択する必要があります。

どちらの操作においても、提出された変更の数が、ある時間間隔内にバックグラウンドで処理される変更の数を継続的に超える場合、適用される必要のある非物質化変更のキューは成長し続けます。これにより、最終的には `SELECT` クエリのパフォーマンスが劣化します。

要するに、更新操作は慎重に発行されるべきであり、変更のキューは `system.mutations` テーブルを使用して密接に監視する必要があります。OLTPデータベースのように頻繁に更新を発行しないでください。頻繁な更新が必要な場合は、[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)を参照してください。

| 方法                                                                                   | 構文                              | 使用するタイミング                                                                                                                                                                                                                              |
|------------------------------------------------------------------------------------------|-----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [更新変更](/sql-reference/statements/alter/update)                                      | `ALTER TABLE [table] UPDATE`       | データを即座にディスクに更新する必要がある場合に使用します（例：コンプライアンスのため）。`SELECT` パフォーマンスに悪影響を与えます。                                                                                                                                   |
| [軽量更新](/guides/developer/lightweight-update)                                        | `ALTER TABLE [table] UPDATE`       | `SET apply_mutations_on_fly = 1;`を有効にします。少量のデータを更新する場合に使用します。行はすぐに更新されたデータで返されますが、ディスク上では初めは内部的にだけ更新済みとしてマークされます。                                      |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)       | `ENGINE = ReplacingMergeTree`      | 大量のデータを更新する場合に使用します。このテーブルエンジンはマージ時のデータの重複排除に最適化されています。                                                                                                                                                  |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)     | `ENGINE = CollapsingMergeTree(Sign)` | 特定の行を頻繁に更新する場合、または時間経過によって変化するオブジェクトの最新の状態を維持する必要があるシナリオで使用します。たとえば、ユーザー活動や記事の統計を追跡する場合です。                                                        |

ClickHouseでデータを更新するさまざまな方法の概要は次のとおりです。

## 更新変更 {#update-mutations}

更新変更は、`ALTER TABLE … UPDATE` コマンドを介して発行できます。例えば：

```sql
ALTER TABLE posts_temp
	(UPDATE AnswerCount = AnswerCount + 1 WHERE AnswerCount = 0)
```

これらは非常にI/O集約的で、`WHERE` 式に一致するすべてのパーツを書き換えます。このプロセスには原子的な性質はありません - パーツは準備ができ次第、変更されたパーツと交換され、変更中に実行を開始した `SELECT` クエリは、すでに変更されたパーツのデータとまだ変更されていないパーツのデータを同時に見ることになります。ユーザーは、[systems.mutations](/operations/system-tables/mutations) テーブルを介して進捗状況の状態を追跡できます。これらはI/O集約的な操作であり、クラスターの `SELECT` パフォーマンスに影響を与える可能性があるため、控えめに使用するべきです。

[更新変更](/sql-reference/statements/alter/update)の詳細を読む。

## 軽量更新 {#lightweight-updates}

軽量更新は、行を即座に更新するメカニズムを提供し、以降の `SELECT` クエリは自動的に変更された値を返します（これにはオーバーヘッドがかかり、クエリが遅くなる可能性があります）。これは、通常の変更の原子的な制約に効果的に対処します。以下に例を示します。

```sql
SET apply_mutations_on_fly = 1;

SELECT ViewCount
FROM posts
WHERE Id = 404346

┌─ViewCount─┐
│ 	26762   │
└───────────┘

1 行がセットに含まれています。経過時間: 0.115 秒。59.55百万行、238.25 MBを処理しました (517.83百万行/s., 2.07 GB/s.)
ピークメモリ使用量: 113.65 MiB。

-- カウントを増加
ALTER TABLE posts
	(UPDATE ViewCount = ViewCount + 1 WHERE Id = 404346)

SELECT ViewCount
FROM posts
WHERE Id = 404346

┌─ViewCount─┐
│ 	26763   │
└───────────┘

1 行がセットに含まれています。経過時間: 0.149 秒。59.55百万行、259.91 MBを処理しました (399.99百万行/s., 1.75 GB/s.)
```

軽量更新の場合、データを更新するために変更が使用されますが、それは単に即座に物質化されず、`SELECT` クエリ中に適用されます。それでもバックグラウンドとして非同期プロセスで適用され、変更と同じような重いオーバーヘッドがかかるため、I/O集約的な操作になります。この操作で使用できる式も制限されています（[詳細はこちら](/guides/developer/lightweight-update#support-for-subqueries-and-non-deterministic-functions)を参照）。

[軽量更新](/guides/developer/lightweight-update)の詳細を読む。

## Collapsing Merge Tree {#collapsing-merge-tree}

更新はコストがかかりますが、挿入を利用して更新を実行できるという考えから、[`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree) テーブルエンジンは、特定の行を削除するために `sign` カラムと組み合わせて利用できる方法です。`sign` カラムに `-1` を挿入すると、その行全体が削除されます。`sign` カラムに `1` を挿入すると、ClickHouseはその行を保持します。更新する行は、テーブル作成時の `ORDER BY ()` ステートメントで使用されるソートキーに基づいて特定されます。

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
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1) -- sign = -1はこの行の状態を更新することを示します
INSERT INTO UAct VALUES (4324182021466249494, 6, 185, 1) -- 行は新しい状態で置き換えられます

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
上記の更新アプローチは、クライアント側で状態を維持することをユーザーに要求します。これはClickHouseの観点から最も効率的ですが、大規模に扱うには複雑です。

[`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree)に関する文書を参照して、より包括的な概要を読むことをお勧めします。
:::

## その他のリソース {#more-resources}

- [ClickHouseにおける更新と削除の扱い](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
