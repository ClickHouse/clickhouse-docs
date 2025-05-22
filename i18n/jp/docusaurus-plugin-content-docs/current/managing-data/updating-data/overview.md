---
'slug': '/updating-data/overview'
'title': '概要'
'description': 'ClickHouseでデータを更新する方法'
'keywords':
- 'update'
- 'updating data'
---



## ClickHouseとOLTPデータベースにおけるデータ更新の違い {#differences-between-updating-data-in-clickhouse-and-oltp-databases}

データの更新処理に関して、ClickHouseとOLTPデータベースはその基盤となる設計哲学とターゲットユースケースにより大きく異なります。例えば、行指向でACID準拠のリレーショナルデータベースであるPostgreSQLは、強力でトランザクションをサポートする更新および削除操作をサポートし、Multi-Version Concurrency Control (MVCC)といったメカニズムを通じてデータの整合性と完全性を確保します。これにより、高い競合環境でも安全で信頼性の高い変更が可能になります。

それに対して、ClickHouseは読み取り重視の分析と高スループットの追加専用操作に最適化された列指向データベースです。ClickHouseはネイティブにインプレースでの更新と削除をサポートしていますが、これらは高いI/Oを避けるために注意して使用する必要があります。また、テーブルを再構築して、削除と更新を追加操作に変換することで、非同期で処理されるか、または読み取り時にのみ適用されるようにすることができます。これにより、リアルタイムのデータ操作よりも高スループットなデータ取り込みと効率的なクエリパフォーマンスにフォーカスしています。

## ClickHouseでのデータ更新方法 {#methods-to-update-data-in-clickhouse}

ClickHouseではデータを更新するためのいくつかの方法があり、それぞれに利点とパフォーマンス特性があります。利用するデータモデルと更新するデータ量に応じて適切な方法を選択する必要があります。

両方の操作において、提出された変更の数が特定の時間間隔において処理される変更数を常に上回る場合、適用される非物質化された変更のキューは成長し続けます。これは最終的に`SELECT`クエリのパフォーマンス低下を引き起こします。

要約すると、更新操作は注意して発行すべきであり、`system.mutations`テーブルを使用して変更キューを厳密に追跡する必要があります。OLTPデータベースのように頻繁に更新を発行しないでください。頻繁な更新の要件がある場合は、[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)を参照してください。

| 方法                                                                                   | 構文                                      | 使用するタイミング                                                                                                                                                                                                                      |
|----------------------------------------------------------------------------------------|------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Update mutation](/sql-reference/statements/alter/update)                           | `ALTER TABLE [table] UPDATE`            | データをすぐにディスクに更新する必要がある場合に使用します（例：コンプライアンスのため）。`SELECT`パフォーマンスに悪影響を及ぼします。                                                                                          |
| [Lightweight update](/guides/developer/lightweight-update)                          | `ALTER TABLE [table] UPDATE`            | `SET apply_mutations_on_fly = 1;`を有効にします。データの小規模な更新に使用します。行はすぐに更新データとともにすべての後続の`SELECT`クエリに返されますが、最初はディスク上では内部的にのみ更新としてマークされます。                           |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)    | `ENGINE = ReplacingMergeTree`           | 大量のデータを更新する場合に使用します。このテーブルエンジンはマージ時のデータ重複除去に最適化されています。                                                                                                                      |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)  | `ENGINE = CollapsingMergeTree(Sign)`    | 個々の行を頻繁に更新する場合、または時間とともに変化するオブジェクトの最新状態を維持する必要があるシナリオに使用します。例えば、ユーザーのアクティビティや記事の統計を追跡する場合です。                                          |

ClickHouseでのデータ更新のさまざまな方法を要約します。

## 更新ミューテーション {#update-mutations}

更新ミューテーションは`ALTER TABLE ... UPDATE`コマンドを通じて発行できます。例えば：

```sql
ALTER TABLE posts_temp
        (UPDATE AnswerCount = AnswerCount + 1 WHERE AnswerCount = 0)

これらは非常にI/O負荷が高く、`WHERE`式に一致するすべての部分を書き直します。このプロセスには原子性がなく、ミューテーション中に実行を開始する`SELECT`クエリは、すでにミューテートされた部分とまだミューテートされていない部分のデータを確認します。ユーザーは、[systems.mutations](/operations/system-tables/mutations)テーブルを使用して進捗状況を追跡できます。これらはI/O集約型の操作であり、クラスターの`SELECT`パフォーマンスに影響を与える可能性があるため、控えめに使用するべきです。

[更新ミューテーション](/sql-reference/statements/alter/update)について詳細を読む。

## 軽量更新 {#lightweight-updates}

軽量更新は行を即座に更新する機構を提供し、以降の`SELECT`クエリは変更値を自動的に返します（これはオーバーヘッドを伴い、クエリが遅くなります）。これにより、通常のミューテーションの原子性制限が効果的に解決されます。以下に例を示します：

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

軽量更新の場合、データを更新するためにミューテーションは依然として使用されますが、即座に物質化されず、`SELECT`クエリの間に適用されます。バックグラウンドで非同期プロセスとして適用され、ミューテーションと同じ重いオーバーヘッドが発生するため、I/O集約型の操作は控えめに使用する必要があります。この操作で使用できる式は限られています（[詳細はこちら](/guides/developer/lightweight-update#support-for-subqueries-and-non-deterministic-functions)を参照）。

[軽量更新](/guides/developer/lightweight-update)について詳細を読む。

## Collapsing Merge Tree {#collapsing-merge-tree}

更新は高コストですが、挿入を利用して更新を行うという考え方から、[`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree)テーブルエンジンは、特定の行を更新するために`sign`カラムを用いて、`1`と`-1`のペアの行を削除（折りたたむ）する方法として使用できます。
`sign`カラムに`-1`が挿入されると、全行が削除されます。
`sign`カラムに`1`が挿入されると、ClickHouseはその行を保持します。
更新する行は、テーブル作成時の`ORDER BY ()`ステートメントに使用されるソートキーに基づいて特定されます。

```sql
CREATE TABLE UAct
(
    UserID UInt64,
    PageViews UInt8,
    Duration UInt8,
    Sign Int8 -- CollapsingMergeTreeテーブルエンジンとともに使用される特別なカラム
)
ENGINE = CollapsingMergeTree(Sign)
ORDER BY UserID

INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1)
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1) -- sign = -1はこの行の状態を更新することを示します
INSERT INTO UAct VALUES (4324182021466249494, 6, 185, 1) -- 行は新しい状態に置き換えられます

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

:::note
上記の更新アプローチでは、ユーザーがクライアント側で状態を維持する必要があります。
ClickHouseの視点からは最も効率的ですが、大規模で作業するには複雑になる場合があります。

[`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree)のドキュメントを読むことをお勧めします。
より包括的な概要が得られます。
:::

## 追加リソース {#more-resources}

- [ClickHouseにおける更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
