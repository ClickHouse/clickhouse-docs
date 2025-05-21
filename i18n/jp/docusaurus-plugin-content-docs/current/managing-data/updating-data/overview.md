---
slug: /updating-data/overview
title: '概要'
description: 'ClickHouseでデータを更新する方法'
keywords: ['update', 'updating data']
---

## ClickHouseとOLTPデータベースにおけるデータ更新の違い {#differences-between-updating-data-in-clickhouse-and-oltp-databases}

更新の処理に関して、ClickHouseとOLTPデータベースは、その基本的な設計哲学とターゲットユースケースのために大きく異なります。例えば、行指向でACID準拠の関係データベースであるPostgreSQLは、マルチバージョン同時実行制御（MVCC）などのメカニズムを介してデータの一貫性と整合性を保証する、堅牢でトランザクション性のある更新および削除操作をサポートしています。これにより、高い同時実行性環境でも安全で信頼性の高い変更が可能になります。

対照的に、ClickHouseは列指向のデータベースであり、読み取り重視の分析と高スループットの追加専用操作に最適化されています。ClickHouseでは、インプレースの更新および削除をネイティブにサポートしていますが、高I/Oを避けるために慎重に使用する必要があります。別の方法として、テーブルを再構成し、削除や更新を追加操作に変換することができます。その際、非同期で処理されたり、読み取り時に処理されたりするため、高スループットなデータの取り込みと効率的なクエリパフォーマンスに重点を置いています。

## ClickHouseでデータを更新する方法 {#methods-to-update-data-in-clickhouse}

ClickHouseでデータを更新する方法はいくつかあり、それぞれに利点とパフォーマンス特性があります。更新するデータモデルやデータ量に応じて、適切な方法を選択する必要があります。

両方の操作において、提出されたミューテーションの数が一定の時間間隔において背景で処理されるミューテーションの数を常に超える場合、適用されるべき非マテリアライズドミューテーションのキューは増え続けます。これにより、最終的に `SELECT` クエリのパフォーマンスが劣化します。

要約すると、更新操作は慎重に行う必要があり、`system.mutations` テーブルを使用してミューテーションキューを注意深く追跡する必要があります。OLTPデータベースのように頻繁に更新を行わないでください。頻繁な更新の必要がある場合は、[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)を参照してください。

| 方法                                                                                      | 構文                                | 使用のタイミング                                                                                                                                                                                                                                |
|-------------------------------------------------------------------------------------------|--------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Update mutation](/sql-reference/statements/alter/update)                                | `ALTER TABLE [table] UPDATE`         | データをディスクに即時に更新する必要がある場合に使用します（例：コンプライアンスのため）。`SELECT` パフォーマンスに悪影響を及ぼします。                                                                                                                                             |
| [Lightweight update](/guides/developer/lightweight-update)                               | `ALTER TABLE [table] UPDATE`         | `SET apply_mutations_on_fly = 1;` を有効にします。少量のデータを更新する際に使用します。行はすぐに更新されたデータで返されますが、最初はディスク上で内部的にのみ更新としてマークされます。                                                                                   |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)         | `ENGINE = ReplacingMergeTree`        | 大量のデータを更新する際に使用します。このテーブルエンジンは、マージ時のデータデデュプリケーションに最適化されています。                                                                                                                                                  |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)     | `ENGINE = CollapsingMergeTree(Sign)` | 個々の行を頻繁に更新する場合や、時間の経過に伴って変化するオブジェクトの最新の状態を維持する必要があるシナリオで使用します。例えば、ユーザー活動や記事の統計を追跡する際です。                                                                                                   |

以下に、ClickHouseでデータを更新するさまざまな方法の要約を示します。

## 更新ミューテーション {#update-mutations}

更新ミューテーションは、`ALTER TABLE ... UPDATE` コマンドを使用して発行できます。例：

```sql
ALTER TABLE posts_temp
        (UPDATE AnswerCount = AnswerCount + 1 WHERE AnswerCount = 0)
```
これらは非常にIO集約的で、`WHERE` 式に一致するすべてのパーツを再書き込みます。このプロセスに原子性はありません - ミューテーションが完了すると、パーツはすぐにミューテーションされたパーツに置き換えられ、その間に実行される `SELECT` クエリは、既にミューテーションされたパーツのデータとミューテーションされていないパーツのデータの両方を確認します。ユーザーは、[systems.mutations](/operations/system-tables/mutations) テーブルを介して進行状況の状態を追跡できます。これらはI/O集約的な操作であり、クラスターの `SELECT` パフォーマンスに影響を与える可能性があるため、控えめに使用する必要があります。

[更新ミューテーション](/sql-reference/statements/alter/update)について詳しく読む。

## ライトウェイト更新 {#lightweight-updates}

ライトウェイト更新は、行を更新するメカニズムを提供し、それにより即座に更新させ、後続の `SELECT` クエリが自動的に変更された値を返すようになります（これにはオーバーヘッドが発生し、クエリを遅くします）。これは、通常のミューテーションの原子性の制限に対処します。以下に例を示します：

```sql
SET apply_mutations_on_fly = 1;

SELECT ViewCount
FROM posts
WHERE Id = 404346

┌─ViewCount─┐
│       26762   │
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
│       26763   │
└───────────┘

1 row in set. Elapsed: 0.149 sec. Processed 59.55 million rows, 259.91 MB (399.99 million rows/s., 1.75 GB/s.)
```

ライトウェイト更新では、データを更新するためにミューテーションが依然として使用されます。これは、すぐにはマテリアライズされず、`SELECT` クエリ中に適用されます。バックグラウンドで非同期プロセスとして適用されるため、依然としてミューテーションと同様の重いオーバーヘッドが発生し、したがって、I/O集約的な操作となるため控えめに使用するべきです。この操作で使用できる式にも制限があります（詳細は、[こちら](/guides/developer/lightweight-update#support-for-subqueries-and-non-deterministic-functions)を参照）。

[ライトウェイト更新](/guides/developer/lightweight-update)について詳しく読む。

## Collapsing Merge Tree {#collapsing-merge-tree}

更新が高コストだが、挿入を活用して更新を実行できるというアイデアから、[`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree) テーブルエンジンは、特定の行を更新するために削除するためのペアの行を`1`および`-1`のサイン列を使用して、ClickHouseに指示するために使用できます。
`sign` 列に `-1` が挿入されると、全体の行が削除されます。
`sign` 列に `1` が挿入されると、ClickHouseは行を保持します。
更新する行は、テーブルを作成する際に使用される `ORDER BY ()` ステートメントで使用されるソートキーに基づいて特定されます。

```sql
CREATE TABLE UAct
(
    UserID UInt64,
    PageViews UInt8,
    Duration UInt8,
    Sign Int8 -- CollapsingMergeTreeテーブルエンジンで使用される特別なカラム
)
ENGINE = CollapsingMergeTree(Sign)
ORDER BY UserID

INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1)
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1) -- sign = -1がこの行の状態を更新することを示します
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
上記の更新アプローチでは、ユーザーがクライアントサイドで状態を維持する必要があります。
これはClickHouseの観点からは最も効率的ですが、大規模で扱うのは複雑になる可能性があります。

[`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree)に関する文書を読むことをお勧めします。
詳細な概要が得られます。
:::

## さらなるリソース {#more-resources}

- [ClickHouseにおける更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
