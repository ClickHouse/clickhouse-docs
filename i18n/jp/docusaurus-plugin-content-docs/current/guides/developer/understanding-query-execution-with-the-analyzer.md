---
slug: /guides/developer/understanding-query-execution-with-the-analyzer
sidebar_label: 'アナライザーで理解するクエリ実行'
title: 'アナライザーで理解するクエリ実行'
description: 'ClickHouse がクエリをどのように実行するかを理解するために、アナライザーをどのように活用できるかを説明します'
doc_type: 'guide'
keywords: ['クエリ実行', 'アナライザー', 'クエリ最適化', 'EXPLAIN', 'パフォーマンス']
---

import analyzer1 from '@site/static/images/guides/developer/analyzer1.png';
import analyzer2 from '@site/static/images/guides/developer/analyzer2.png';
import analyzer3 from '@site/static/images/guides/developer/analyzer3.png';
import analyzer4 from '@site/static/images/guides/developer/analyzer4.png';
import analyzer5 from '@site/static/images/guides/developer/analyzer5.png';
import Image from '@theme/IdealImage';

# analyzer を用いたクエリ実行の理解 {#understanding-query-execution-with-the-analyzer}

ClickHouse はクエリを非常に高速に処理しますが、その実行の仕組みはそれほど単純ではありません。`SELECT` クエリがどのように実行されるのかを見ていきましょう。その説明のために、ClickHouse のテーブルにいくつかのデータを追加してみます。

```sql
CREATE TABLE session_events(
   clientId UUID,
   sessionId UUID,
   pageId UUID,
   timestamp DateTime,
   type String
) ORDER BY (timestamp);

INSERT INTO session_events SELECT * FROM generateRandom('clientId UUID,
   sessionId UUID,
   pageId UUID,
   timestamp DateTime,
   type Enum(\'type1\', \'type2\')', 1, 10, 2) LIMIT 1000;
```

ClickHouse にいくつかデータが入ったので、クエリを実行し、その実行内容を理解していきます。クエリの実行は多くのステップに分解されます。クエリ実行の各ステップは、対応する `EXPLAIN` クエリを使って分析およびトラブルシューティングできます。これらのステップは、以下のチャートにまとめられています。

<Image img={analyzer1} alt="Explain query steps" size="md" />

クエリ実行中にそれぞれのコンポーネントがどのように動作するかを見ていきましょう。いくつかのクエリを取り上げて、`EXPLAIN` ステートメントを使って詳しく見ていきます。

## パーサー {#parser}

パーサーの目的は、クエリテキストを AST（抽象構文木）に変換することです。この処理は、`EXPLAIN AST` を使用して可視化できます。

```sql
EXPLAIN AST SELECT min(timestamp), max(timestamp) FROM session_events;

┌─explain────────────────────────────────────────────┐
│ SelectWithUnionQuery (children 1)                  │
│  ExpressionList (children 1)                       │
│   SelectQuery (children 2)                         │
│    ExpressionList (children 2)                     │
│     Function min (alias minimum_date) (children 1) │
│      ExpressionList (children 1)                   │
│       Identifier timestamp                         │
│     Function max (alias maximum_date) (children 1) │
│      ExpressionList (children 1)                   │
│       Identifier timestamp                         │
│    TablesInSelectQuery (children 1)                │
│     TablesInSelectQueryElement (children 1)        │
│      TableExpression (children 1)                  │
│       TableIdentifier session_events               │
└────────────────────────────────────────────────────┘
```

出力は抽象構文木 (AST: Abstract Syntax Tree) であり、以下のように可視化できます。

<Image img={analyzer2} alt="AST 出力" size="md" />

各ノードは子ノードを持ち、ツリー全体でクエリ全体の構造を表します。これはクエリ処理を支援するための論理構造です。エンドユーザーの立場からは（クエリ実行に関心がない限り）それほど有用ではなく、このツールは主に開発者によって利用されます。

## Analyzer {#analyzer}

現在、ClickHouse には Analyzer のアーキテクチャが 2 つあります。古いアーキテクチャを使用するには、`enable_analyzer=0` を設定します。新しいアーキテクチャはデフォルトで有効です。新しい Analyzer が一般提供されると古いアーキテクチャは非推奨となるため、ここでは新しいアーキテクチャのみを説明します。

:::note
新しいアーキテクチャは、ClickHouse のパフォーマンスを向上させるための、より優れたフレームワークを提供します。しかし、クエリ処理パイプラインの根幹を成すコンポーネントであるため、一部のクエリに悪影響を及ぼす可能性もあり、[既知の非互換性](/operations/analyzer#known-incompatibilities) が存在します。クエリ単位またはユーザーレベルで `enable_analyzer` 設定を変更することで、従来の Analyzer に戻すことができます。
:::

Analyzer は、クエリ実行における重要なステップです。AST を受け取り、それを query tree に変換します。AST に比べた query tree の主な利点は、多くのコンポーネントが解析時点で解決されている点です。例えば、どのストレージを使うかが決まり、どのテーブルから読み取るかが分かり、エイリアスも解決され、ツリーは使用されるデータ型も把握しています。これらの利点により、Analyzer は最適化を適用できます。これらの最適化は「パス (passes)」という単位で行われます。各パスがそれぞれ異なる最適化を探索します。すべてのパスは[こちら](https://github.com/ClickHouse/ClickHouse/blob/76578ebf92af3be917cd2e0e17fea2965716d958/src/Analyzer/QueryTreePassManager.cpp#L249)で確認できます。先ほどのクエリを使って実際に見てみましょう。

```sql
EXPLAIN QUERY TREE passes=0 SELECT min(timestamp) AS minimum_date, max(timestamp) AS maximum_date FROM session_events SETTINGS allow_experimental_analyzer=1;

┌─explain────────────────────────────────────────────────────────────────────────────────┐
│ QUERY id: 0                                                                            │
│   PROJECTION                                                                           │
│     LIST id: 1, nodes: 2                                                               │
│       FUNCTION id: 2, alias: minimum_date, function_name: min, function_type: ordinary │
│         ARGUMENTS                                                                      │
│           LIST id: 3, nodes: 1                                                         │
│             IDENTIFIER id: 4, identifier: timestamp                                    │
│       FUNCTION id: 5, alias: maximum_date, function_name: max, function_type: ordinary │
│         ARGUMENTS                                                                      │
│           LIST id: 6, nodes: 1                                                         │
│             IDENTIFIER id: 7, identifier: timestamp                                    │
│   JOIN TREE                                                                            │
│     IDENTIFIER id: 8, identifier: session_events                                       │
│   SETTINGS allow_experimental_analyzer=1                                               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

```sql
EXPLAIN QUERY TREE passes=20 SELECT min(timestamp) AS minimum_date, max(timestamp) AS maximum_date FROM session_events SETTINGS allow_experimental_analyzer=1;

┌─explain───────────────────────────────────────────────────────────────────────────────────┐
│ QUERY id: 0                                                                               │
│   PROJECTION COLUMNS                                                                      │
│     minimum_date DateTime                                                                 │
│     maximum_date DateTime                                                                 │
│   PROJECTION                                                                              │
│     LIST id: 1, nodes: 2                                                                  │
│       FUNCTION id: 2, function_name: min, function_type: aggregate, result_type: DateTime │
│         ARGUMENTS                                                                         │
│           LIST id: 3, nodes: 1                                                            │
│             COLUMN id: 4, column_name: timestamp, result_type: DateTime, source_id: 5     │
│       FUNCTION id: 6, function_name: max, function_type: aggregate, result_type: DateTime │
│         ARGUMENTS                                                                         │
│           LIST id: 7, nodes: 1                                                            │
│             COLUMN id: 4, column_name: timestamp, result_type: DateTime, source_id: 5     │
│   JOIN TREE                                                                               │
│     TABLE id: 5, alias: __table1, table_name: default.session_events                      │
│   SETTINGS allow_experimental_analyzer=1                                                  │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

2回の実行結果を比較すると、エイリアスとプロジェクションがどのように解決されるかを確認できます。

## プランナー {#planner}

プランナーはクエリツリーを受け取り、そこからクエリプランを構築します。クエリツリーは特定のクエリで「何を行うか」を表し、クエリプランは「それをどのように実行するか」を表します。追加の最適化はクエリプランの一部として行われます。`EXPLAIN PLAN` または `EXPLAIN` を使用してクエリプランを確認できます（`EXPLAIN` は内部的に `EXPLAIN PLAN` を実行します）。

```sql
EXPLAIN PLAN WITH
   (
       SELECT count(*)
       FROM session_events
   ) AS total_rows
SELECT type, min(timestamp) AS minimum_date, max(timestamp) AS maximum_date, count(*) /total_rows * 100 AS percentage FROM session_events GROUP BY type

┌─explain──────────────────────────────────────────┐
│ Expression ((Projection + Before ORDER BY))      │
│   Aggregating                                    │
│     Expression (Before GROUP BY)                 │
│       ReadFromMergeTree (default.session_events) │
└──────────────────────────────────────────────────┘
```

これでもある程度の情報は得られていますが、まだ他にも取得できる情報があります。例えば、どのカラム名を基準にプロジェクションを作成すべきか知りたい場合があります。その場合は、クエリにヘッダーを追加できます。

```SQL
EXPLAIN header = 1
WITH (
       SELECT count(*)
       FROM session_events
   ) AS total_rows
SELECT
   type,
   min(timestamp) AS minimum_date,
   max(timestamp) AS maximum_date,
   (count(*) / total_rows) * 100 AS percentage
FROM session_events
GROUP BY type

┌─explain──────────────────────────────────────────┐
│ Expression ((Projection + Before ORDER BY))      │
│ Header: type String                              │
│         minimum_date DateTime                    │
│         maximum_date DateTime                    │
│         percentage Nullable(Float64)             │
│   Aggregating                                    │
│   Header: type String                            │
│           min(timestamp) DateTime                │
│           max(timestamp) DateTime                │
│           count() UInt64                         │
│     Expression (Before GROUP BY)                 │
│     Header: timestamp DateTime                   │
│             type String                          │
│       ReadFromMergeTree (default.session_events) │
│       Header: timestamp DateTime                 │
│               type String                        │
└──────────────────────────────────────────────────┘
```

これで、最後の Projection で作成する必要がある列名（`minimum_date`、`maximum_date`、`percentage`）は把握できましたが、実行されるすべてのアクションの詳細も確認したい場合があるかもしれません。その場合は、`actions=1` を設定してください。

```sql
EXPLAIN actions = 1
WITH (
       SELECT count(*)
       FROM session_events
   ) AS total_rows
SELECT
   type,
   min(timestamp) AS minimum_date,
   max(timestamp) AS maximum_date,
   (count(*) / total_rows) * 100 AS percentage
FROM session_events
GROUP BY type
```

┌─explain────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 式 ((Projection + Before ORDER BY))                                                                                                       │
│ アクション: INPUT :: 0 -&gt; type String : 0                                                                                                │
│          INPUT : 1 -&gt; min(timestamp) DateTime : 1                                                                                          │
│          INPUT : 2 -&gt; max(timestamp) DateTime : 2                                                                                          │
│          INPUT : 3 -&gt; count() UInt64 : 3                                                                                                   │
│          COLUMN Const(Nullable(UInt64)) -&gt; total&#95;rows Nullable(UInt64) : 4                                                                 │
│          COLUMN Const(UInt8) -&gt; 100 UInt8 : 5                                                                                              │
│          ALIAS min(timestamp) :: 1 -&gt; minimum&#95;date DateTime : 6                                                                            │
│          ALIAS max(timestamp) :: 2 -&gt; maximum&#95;date DateTime : 1                                                                            │
│          FUNCTION divide(count() :: 3, total&#95;rows :: 4) -&gt; divide(count(), total&#95;rows) Nullable(Float64) : 2                               │
│          FUNCTION multiply(divide(count(), total&#95;rows) :: 2, 100 :: 5) -&gt; multiply(divide(count(), total&#95;rows), 100) Nullable(Float64) : 4 │
│          ALIAS multiply(divide(count(), total&#95;rows), 100) :: 4 -&gt; percentage Nullable(Float64) : 5                                         │
│ 位置: 0 6 1 5                                                                                                                              │
│   集約処理                                                                                                                                 │
│   キー: type                                                                                                                               │
│   集約関数:                                                                                                                                │
│       min(timestamp)                                                                                                                       │
│         関数: min(DateTime) → DateTime                                                                                                     │
│         引数: timestamp                                                                                                                    │
│       max(timestamp)                                                                                                                       │
│         関数: max(DateTime) → DateTime                                                                                                     │
│         引数: timestamp                                                                                                                    │
│       count()                                                                                                                              │
│         関数: count() → UInt64                                                                                                             │
│         引数: なし                                                                                                                         │
│   マージのスキップ: 0                                                                                                                      │
│     式 (Before GROUP BY)                                                                                                                   │
│     アクション: INPUT :: 0 -&gt; timestamp DateTime : 0                                                                                       │
│              INPUT :: 1 -&gt; type String : 1                                                                                                 │
│     位置: 0 1                                                                                                                              │
│       ReadFromMergeTree (default.session&#95;events)                                                                                           │
│       ReadType: Default                                                                                                                    │
│       パーツ: 1                                                                                                                            │
│       グラニュール数: 1                                                                                                                     │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

```

使用されているすべての入力、関数、エイリアス、およびデータ型を確認できるようになりました。プランナーが適用する最適化の一部は[こちら](https://github.com/ClickHouse/ClickHouse/blob/master/src/Processors/QueryPlan/Optimizations/Optimizations.h)で確認できます。
```

## クエリパイプライン {#query-pipeline}

クエリパイプラインはクエリプランから生成されます。クエリパイプラインはクエリプランと非常によく似ていますが、木構造ではなくグラフ構造である点が異なります。ClickHouse がクエリをどのように実行し、どのリソースを使用するかを示します。クエリパイプラインを分析することで、入力／出力の観点からボトルネックがどこにあるかを把握するのに非常に有用です。先ほどのクエリを使って、クエリパイプラインの実行を見てみましょう。

```sql
EXPLAIN PIPELINE
WITH (
       SELECT count(*)
       FROM session_events
   ) AS total_rows
SELECT
   type,
   min(timestamp) AS minimum_date,
   max(timestamp) AS maximum_date,
   (count(*) / total_rows) * 100 AS percentage
FROM session_events
GROUP BY type;

┌─explain────────────────────────────────────────────────────────────────────┐
│ (Expression)                                                               │
│ ExpressionTransform × 2                                                    │
│   (Aggregating)                                                            │
│   Resize 1 → 2                                                             │
│     AggregatingTransform                                                   │
│       (Expression)                                                         │
│       ExpressionTransform                                                  │
│         (ReadFromMergeTree)                                                │
│         MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread) 0 → 1 │
└────────────────────────────────────────────────────────────────────────────┘
```

括弧内にはクエリプランのステップが、その横にはプロセッサが表示されています。これは非常に有用な情報ですが、グラフになっていることを考えると、その構造をそのまま可視化できると便利です。そこで、`graph` という設定を 1 にし、出力フォーマットとして TSV を指定します。

```sql
EXPLAIN PIPELINE graph=1 WITH
   (
       SELECT count(*)
       FROM session_events
   ) AS total_rows
SELECT type, min(timestamp) AS minimum_date, max(timestamp) AS maximum_date, count(*) /total_rows * 100 AS percentage FROM session_events GROUP BY type FORMAT TSV;
```

```response
digraph
{
 rankdir="LR";
 { node [shape = rect]
   subgraph cluster_0 {
     label ="Expression";
     style=filled;
     color=lightgrey;
     node [style=filled,color=white];
     { rank = same;
       n5 [label="ExpressionTransform × 2"];
     }
   }
   subgraph cluster_1 {
     label ="Aggregating";
     style=filled;
     color=lightgrey;
     node [style=filled,color=white];
     { rank = same;
       n3 [label="AggregatingTransform"];
       n4 [label="Resize"];
     }
   }
   subgraph cluster_2 {
     label ="Expression";
     style=filled;
     color=lightgrey;
     node [style=filled,color=white];
     { rank = same;
       n2 [label="ExpressionTransform"];
     }
   }
   subgraph cluster_3 {
     label ="ReadFromMergeTree";
     style=filled;
     color=lightgrey;
     node [style=filled,color=white];
     { rank = same;
       n1 [label="MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread)"];
     }
   }
 }
 n3 -> n4 [label=""];
 n4 -> n5 [label="× 2"];
 n2 -> n3 [label=""];
 n1 -> n2 [label=""];
}
```

その後、この出力をコピーして[こちら](https://dreampuf.github.io/GraphvizOnline)に貼り付けると、以下のグラフが生成されます。

<Image img={analyzer3} alt="グラフ出力" size="md" />

白い長方形はパイプラインノードを表し、灰色の長方形はクエリプランのステップを表します。`x` に続く数字は、使用されている入力／出力の数を表します。コンパクト表示にしたくない場合は、`compact=0` を追加してください。

```sql
EXPLAIN PIPELINE graph = 1, compact = 0
WITH (
       SELECT count(*)
       FROM session_events
   ) AS total_rows
SELECT
   type,
   min(timestamp) AS minimum_date,
   max(timestamp) AS maximum_date,
   (count(*) / total_rows) * 100 AS percentage
FROM session_events
GROUP BY type
FORMAT TSV
```

```response
digraph
{
 rankdir="LR";
 { node [shape = rect]
   n0[label="MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread)"];
   n1[label="ExpressionTransform"];
   n2[label="AggregatingTransform"];
   n3[label="Resize"];
   n4[label="ExpressionTransform"];
   n5[label="ExpressionTransform"];
 }
 n0 -> n1;
 n1 -> n2;
 n2 -> n3;
 n3 -> n4;
 n3 -> n5;
}
```

<Image img={analyzer4} alt="コンパクトなグラフ出力" size="md" />

なぜ ClickHouse はテーブルを複数スレッドで読み込まないのでしょうか？テーブルにさらに多くのデータを追加してみましょう。

```sql
INSERT INTO session_events SELECT * FROM generateRandom('clientId UUID,
   sessionId UUID,
   pageId UUID,
   timestamp DateTime,
   type Enum(\'type1\', \'type2\')', 1, 10, 2) LIMIT 1000000;
```

それでは、もう一度 `EXPLAIN` クエリを実行してみましょう：

```sql
EXPLAIN PIPELINE graph = 1, compact = 0
WITH (
       SELECT count(*)
       FROM session_events
   ) AS total_rows
SELECT
   type,
   min(timestamp) AS minimum_date,
   max(timestamp) AS maximum_date,
   (count(*) / total_rows) * 100 AS percentage
FROM session_events
GROUP BY type
FORMAT TSV
```

```response
digraph
{
  rankdir="LR";
  { node [shape = rect]
    n0[label="MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread)"];
    n1[label="MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread)"];
    n2[label="ExpressionTransform"];
    n3[label="ExpressionTransform"];
    n4[label="StrictResize"];
    n5[label="AggregatingTransform"];
    n6[label="AggregatingTransform"];
    n7[label="Resize"];
    n8[label="ExpressionTransform"];
    n9[label="ExpressionTransform"];
  }
  n0 -> n2;
  n1 -> n3;
  n2 -> n4;
  n3 -> n4;
  n4 -> n5;
  n4 -> n6;
  n5 -> n7;
  n6 -> n7;
  n7 -> n8;
  n7 -> n9;
}
```

<Image img={analyzer5} alt="並列グラフの出力" size="md" />

その結果、実行エンジンはデータ量が十分でないと判断し、処理を並列化しませんでした。そこで行数を増やすと、グラフに示されているように、今度は実行エンジンが複数スレッドの使用を選択しました。

## Executor {#executor}

最後に、クエリ実行の最終ステップは executor が担当します。executor はクエリパイプラインを受け取り、それを実行します。`SELECT`、`INSERT`、`INSERT SELECT` のいずれを実行するかによって、さまざまな種類の executor が存在します。
