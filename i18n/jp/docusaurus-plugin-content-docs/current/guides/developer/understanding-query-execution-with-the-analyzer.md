---
slug: /guides/developer/understanding-query-execution-with-the-analyzer
sidebar_label: クエリ実行の理解 - アナライザーを使用して
title: クエリ実行の理解 - アナライザーを使用して
---

import analyzer1 from '@site/static/images/guides/developer/analyzer1.png';
import analyzer2 from '@site/static/images/guides/developer/analyzer2.png';
import analyzer3 from '@site/static/images/guides/developer/analyzer3.png';
import analyzer4 from '@site/static/images/guides/developer/analyzer4.png';
import analyzer5 from '@site/static/images/guides/developer/analyzer5.png';


# クエリ実行の理解 - アナライザーを使用して

ClickHouseはクエリを非常に迅速に処理しますが、クエリの実行は単純なものではありません。`SELECT` クエリがどのように実行されるのかを理解してみましょう。これを示すために、ClickHouseのテーブルにデータを追加しましょう：

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

ClickHouseにデータが追加されたので、クエリを実行してその実行を理解したいと思います。クエリの実行は多くのステップに分解されます。クエリの実行の各ステップは、対応する `EXPLAIN` クエリを使用して分析およびトラブルシューティングすることができます。これらのステップは、以下のチャートに要約されています：

<img src={analyzer1} class="image" alt="Explain query steps" style={{width: '600px'}} />

クエリ実行中の各エンティティを見てみましょう。いくつかのクエリを実行し、それらを `EXPLAIN` ステートメントを使用して調べてみます。

## パーサー {#parser}

パーサーの目標は、クエリテキストをAST（抽象構文木）に変換することです。このステップは `EXPLAIN AST` を使用して可視化することができます：

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

出力は以下のように可視化された抽象構文木です：

<img src={analyzer2} class="image" alt="AST output" style={{width: '600px'}} />

各ノードには対応する子供があり、全体の木はクエリの構造を表しています。これはクエリを処理するための論理的な構造です。エンドユーザーの立場から見ると（クエリの実行に興味がない限り）、あまり役に立たないかもしれません。このツールは主に開発者によって使用されます。

## アナライザー {#analyzer}

現時点でClickHouseにはアナライザーの2つのアーキテクチャがあります。古いアーキテクチャを使用するには、`enable_analyzer=0` を設定します。新しいアーキテクチャはデフォルトで有効になっています。ここでは新しいアーキテクチャのみを説明します。古いアーキテクチャは、新しいアナライザーが一般的に利用可能になり次第、非推奨となります。

:::note
新しいアーキテクチャは、ClickHouseのパフォーマンスを改善するためのより良いフレームワークを提供するはずです。しかし、クエリ処理ステップの基本的なコンポーネントであるため、一部のクエリに悪影響を及ぼす可能性もあり、[既知の非互換性](https://operations/analyzer#known-incompatibilities)もあります。クエリまたはユーザーのレベルで `enable_analyzer` 設定を変更することで、古いアナライザーに戻ることができます。
:::

アナライザーはクエリ実行の重要なステップです。ASTをクエリツリーに変換します。ASTに対するクエリツリーの主な利点は、多くのコンポーネントが解決される点です。たとえば、どのテーブルから読み取るかやエイリアスも解決され、異なるデータ型が使用されていることが知られています。これらの利点により、アナライザーは最適化を適用できます。これらの最適化の方法は「パス」を通じて行われます。各パスは異なる最適化を探します。すべてのパスは[こちら](https://github.com/ClickHouse/ClickHouse/blob/76578ebf92af3be917cd2e0e17fea2965716d958/src/Analyzer/QueryTreePassManager.cpp#L249)で見ることができます。次のクエリで確認しましょう：

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

二つの実行の間で、エイリアスとプロジェクションの解決を確認できます。

## プランナー {#planner}

プランナーはクエリツリーを取り、それからクエリプランを構築します。クエリツリーは、特定のクエリで何をするかを教え、クエリプランはそれをどのようにするかを示します。クエリプランの一部として追加の最適化が行われます。`EXPLAIN PLAN` または `EXPLAIN` を使用してクエリプランを表示できます（`EXPLAIN` は `EXPLAIN PLAN` を実行します）。

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

この出力は一部の情報を提供しますが、例えば、プロジェクションの上に必要なカラム名を知りたい場合もあります。クエリにヘッダーを追加できます：

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

これで、最後のプロジェクション（`minimum_date`、`maximum_date`、`percentage`）を作成するために必要なカラム名がわかりますが、実行する必要があるすべてのアクションの詳細も知りたい場合があります。そのためには `actions=1` を設定できます。

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


┌─explain────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Expression ((Projection + Before ORDER BY))                                                                                                │
│ Actions: INPUT :: 0 -> type String : 0                                                                                                     │
│          INPUT : 1 -> min(timestamp) DateTime : 1                                                                                          │
│          INPUT : 2 -> max(timestamp) DateTime : 2                                                                                          │
│          INPUT : 3 -> count() UInt64 : 3                                                                                                   │
│          COLUMN Const(Nullable(UInt64)) -> total_rows Nullable(UInt64) : 4                                                                 │
│          COLUMN Const(UInt8) -> 100 UInt8 : 5                                                                                              │
│          ALIAS min(timestamp) :: 1 -> minimum_date DateTime : 6                                                                            │
│          ALIAS max(timestamp) :: 2 -> maximum_date DateTime : 1                                                                            │
│          FUNCTION divide(count() :: 3, total_rows :: 4) -> divide(count(), total_rows) Nullable(Float64) : 2                               │
│          FUNCTION multiply(divide(count() :: 3, total_rows :: 4) :: 2, 100 UInt8 : 5) -> multiply(divide(count(), total_rows), 100) Nullable(Float64) : 4 │
│          ALIAS multiply(divide(count(), total_rows), 100) :: 4 -> percentage Nullable(Float64) : 5                                         │
│ Positions: 0 6 1 5                                                                                                                         │
│   Aggregating                                                                                                                              │
│   Keys: type                                                                                                                               │
│   Aggregates:                                                                                                                              │
│       min(timestamp)                                                                                                                       │
│         Function: min(DateTime) → DateTime                                                                                                 │
│         Arguments: timestamp                                                                                                               │
│       max(timestamp)                                                                                                                       │
│         Function: max(DateTime) → DateTime                                                                                                 │
│         Arguments: timestamp                                                                                                               │
│       count()                                                                                                                              │
│         Function: count() → UInt64                                                                                                         │
│         Arguments: none                                                                                                                    │
│   Skip merging: 0                                                                                                                          │
│     Expression (Before GROUP BY)                                                                                                           │
│     Actions: INPUT :: 0 -> timestamp DateTime : 0                                                                                          │
│              INPUT :: 1 -> type String : 1                                                                                                 │
│     Positions: 0 1                                                                                                                         │
│       ReadFromMergeTree (default.session_events)                                                                                           │
│       ReadType: Default                                                                                                                    │
│       Parts: 1                                                                                                                             │
│       Granules: 1                                                                                                                          │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

これで、使用されているすべての入力、関数、エイリアス、データ型が確認できます。プランナーが適用しようとしているいくつかの最適化は[こちら](https://github.com/ClickHouse/ClickHouse/blob/master/src/Processors/QueryPlan/Optimizations/Optimizations.h)で確認できます。

## クエリパイプライン {#query-pipeline}

クエリパイプラインはクエリプランから生成されます。クエリパイプラインはクエリプランに非常に似ていますが、ツリーではなくグラフです。ClickHouseがクエリをどのように実行し、どのリソースが使用されるかを強調します。クエリパイプラインを分析することは、入力/出力のボトルネックを確認するのに非常に有用です。前のクエリをとり、クエリパイプラインの実行を見てみましょう：

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

括弧の中には、クエリプランステップが含まれ、次にプロセッサが示されています。これは素晴らしい情報ですが、これはグラフであるため、そのように可視化できると良いでしょう。設定 `graph` を1に設定し、出力形式をTSVに指定できます：

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

この出力をコピーして[こちら](https://dreampuf.github.io/GraphvizOnline)に貼り付けると、次のグラフが生成されます：

<img src={analyzer3} class="image" alt="Graph output" style={{width: '600px'}} />

白い長方形はパイプラインノードに対応し、灰色の長方形はクエリプランステップに対応し、`x` の後に数字が続くものは使用されている入力/出力の数に対応します。コンパクトではない形式で表示したい場合は、`compact=0`を追加できます：

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

<img src={analyzer4} class="image" alt="Compact graph output" style={{width: '600px'}} />

ClickHouseはなぜテーブルから複数のスレッドを使用して読み込まないのでしょうか？テーブルにさらにデータを追加してみましょう：

```sql
INSERT INTO session_events SELECT * FROM generateRandom('clientId UUID,
   sessionId UUID,
   pageId UUID,
   timestamp DateTime,
   type Enum(\'type1\', \'type2\')', 1, 10, 2) LIMIT 1000000;
```

再度 `EXPLAIN` クエリを実行しましょう：

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
}
```

<img src={analyzer5} class="image" alt="Parallel graph output" style={{width: '600px'}} />

したがって、エグゼキュータはデータの量が十分多くないため、操作を並列化しないことを決定しました。行を追加することで、エグゼキュータはグラフに示されているように複数のスレッドを使用することを選択しました。

## エグゼキュータ {#executor}

最後に、クエリ実行の最終ステップはエグゼキュータによって行われます。エグゼキュータはクエリパイプラインを取り、それを実行します。`SELECT`、`INSERT`、または `INSERT SELECT` に応じて異なるタイプのエグゼキュータがあります。
