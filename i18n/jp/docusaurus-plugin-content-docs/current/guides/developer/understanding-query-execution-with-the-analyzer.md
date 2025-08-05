---
slug: '/guides/developer/understanding-query-execution-with-the-analyzer'
sidebar_label: 'Understanding Query Execution with the Analyzer'
title: 'Understanding Query Execution with the Analyzer'
description: 'Describes how you can use the analyzer to understand how ClickHouse
  executes your queries'
---

import analyzer1 from '@site/static/images/guides/developer/analyzer1.png';
import analyzer2 from '@site/static/images/guides/developer/analyzer2.png';
import analyzer3 from '@site/static/images/guides/developer/analyzer3.png';
import analyzer4 from '@site/static/images/guides/developer/analyzer4.png';
import analyzer5 from '@site/static/images/guides/developer/analyzer5.png';
import Image from '@theme/IdealImage';


# クエリ実行の理解とアナライザー

ClickHouseはクエリを非常に迅速に処理しますが、クエリの実行は単純なプロセスではありません。`SELECT` クエリがどのように実行されるかを理解してみましょう。その説明にあたり、ClickHouseのテーブルにいくつかのデータを追加してみます。

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

ClickHouseにデータが追加されたので、いくつかのクエリを実行し、実行の理解を深めたいと思います。クエリの実行は多くのステップに分解されます。各クエリの実行ステップは、対応する `EXPLAIN` クエリを使用して分析およびトラブルシューティングできます。これらのステップは以下のチャートに要約されています：

<Image img={analyzer1} alt="Explain query steps" size="md"/>

クエリ実行時に各エンティティがどのように動作するかを見ていきましょう。いくつかのクエリを取り上げ、それらを `EXPLAIN` ステートメントを使って確認します。

## パーサー {#parser}

パーサーの目標は、クエリテキストをAST（抽象構文木）に変換することです。このステップは、`EXPLAIN AST` を使用して視覚化できます：

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

出力は、以下のように視覚化できる抽象構文木です：

<Image img={analyzer2} alt="AST output" size="md"/>

各ノードには対応する子ノードがあり、全体の木構造はクエリの全体的な構造を表しています。これはクエリを処理するための論理構造です。エンドユーザーの視点から見ると（クエリ実行に興味がない限り）あまり役立ちません。このツールは主に開発者が使用します。

## アナライザー {#analyzer}

ClickHouseには現在アナライザーの2つのアーキテクチャがあります。`enable_analyzer=0` を設定することで旧アーキテクチャを使用できます。新しいアーキテクチャはデフォルトで有効になっています。ここでは、旧アーキテクチャが新しいアナライザーが一般に利用可能になると廃止されることを考慮して、新しいアーキテクチャのみを説明します。

:::note
新しいアーキテクチャはClickHouseのパフォーマンスを改善するためのより良いフレームワークを提供します。しかし、クエリ処理ステップの基本的な要素であるため、一部のクエリに負の影響を与える可能性もあり、[既知の非互換性](/operations/analyzer#known-incompatibilities)があります。クエリまたはユーザーレベルで `enable_analyzer` 設定を変更することで、旧アナライザーに戻ることができます。
:::

アナライザーはクエリ実行の重要なステップです。ASTを受け取り、それをクエリツリーに変換します。ASTに対するクエリツリーの主な利点は、多くのコンポーネントが解決されていることです。たとえば、読み取るテーブルの情報やエイリアスも解決され、使用される異なるデータ型がツリーに知られています。これらの利点により、アナライザーは最適化を適用できます。これらの最適化は「パス」によって機能します。各パスは異なる最適化を探します。すべてのパスは[こちら](https://github.com/ClickHouse/ClickHouse/blob/76578ebf92af3be917cd2e0e17fea2965716d958/src/Analyzer/QueryTreePassManager.cpp#L249)で確認できます。前述のクエリを実際に見てみましょう：

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

2つの実行間で、エイリアスとプロジェクションの解決を見ることができます。

## プランナー {#planner}

プランナーはクエリツリーを受け取り、そこからクエリプランを構築します。クエリツリーは特定のクエリを何をしたいかを教えてくれ、クエリプランはそれをどのように行うかを示します。クエリプランの一環として追加の最適化が行われます。クエリプランを見るには `EXPLAIN PLAN` または `EXPLAIN` を使用できます（`EXPLAIN` は `EXPLAIN PLAN` を実行します）。

```sql
EXPLAIN PLAN WITH
   (
       SELECT count(*)
       FROM session_events
   ) AS total_rows
SELECT type, min(timestamp) AS minimum_date, max(timestamp) AS maximum_date, count(*) /total_rows * 100 AS percentage FROM session_events GROUP BY type;

┌─explain──────────────────────────────────────────┐
│ Expression ((Projection + Before ORDER BY))      │
│   Aggregating                                    │
│     Expression (Before GROUP BY)                 │
│       ReadFromMergeTree (default.session_events) │
└──────────────────────────────────────────────────┘
```

この情報は提供されますが、さらに得たい情報があるかもしれません。例えば、プロジェクションが必要な列名を知りたい場合、クエリにヘッダーを追加できます：

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
GROUP BY type;

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

これで、最後のプロジェクション（`minimum_date`、`maximum_date`、および `percentage`）のために作成する必要がある列名がわかります。しかし、実行する必要があるすべてのアクションの詳細も知りたいかもしれません。`actions=1` を設定することで実現できます。

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
GROUP BY type;

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
│          FUNCTION multiply(divide(count() :: 3, total_rows :: 4) :: 2, 100 :: 5) -> multiply(divide(count(), total_rows), 100) Nullable(Float64) : 4 │
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

これで、使用されているすべての入力、関数、エイリアス、およびデータ型を確認できます。プランナーが適用する最適化の一部は[こちら](https://github.com/ClickHouse/ClickHouse/blob/master/src/Processors/QueryPlan/Optimizations/Optimizations.h)で見ることができます。

## クエリパイプライン {#query-pipeline}

クエリパイプラインはクエリプランから生成されます。クエリパイプラインはクエリプランと非常に似ていますが、木構造ではなくグラフです。ClickHouseがクエリをどのように実行し、どのリソースが使用されるかを明示します。クエリパイプラインを分析することは、入力/出力の観点でボトルネックを確認するために非常に役立ちます。前述のクエリを取り上げ、クエリパイプラインの実行を見てみましょう：

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

括弧内はクエリプランステップであり、その隣にプロセッサがあります。これは優れた情報ですが、これはグラフであるため、グラフとして視覚化すると良いでしょう。`graph`設定を1にして、出力フォーマットをTSVに指定することができます：

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

この出力をコピーして、[こちら](https://dreampuf.github.io/GraphvizOnline)に貼り付けると、以下のグラフが生成されます：

<Image img={analyzer3} alt="Graph output" size="md"/>

白い長方形はパイプラインノードに対応し、灰色の長方形はクエリプランステップに対応し、`x`の後に続く数字は使用される入力/出力の数に対応します。コンパクトな形式で表示したくない場合は、`compact=0`を追加できます。

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
FORMAT TSV;
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

<Image img={analyzer4} alt="Compact graph output" size="md" />

ClickHouseはなぜ複数のスレッドを使用してテーブルから読み取らないのでしょうか？テーブルにより多くのデータを追加してみましょう：

```sql
INSERT INTO session_events SELECT * FROM generateRandom('clientId UUID,
   sessionId UUID,
   pageId UUID,
   timestamp DateTime,
   type Enum(\'type1\', \'type2\')', 1, 10, 2) LIMIT 1000000;
```

それでは、再度 `EXPLAIN` クエリを実行してみましょう：

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
FORMAT TSV;
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

<Image img={analyzer5} alt="Parallel graph output" size="md" />

このように、エグゼキュータはデータボリュームが十分に高くないため、操作を並列化しないことを決定しました。行を追加することで、エグゼキュータは複数のスレッドを使用することを決定しました、グラフに示されるように。

## エグゼキュータ {#executor}

クエリ実行の最終ステップはエグゼキュータによって行われます。エグゼキュータはクエリパイプラインを受け取り、それを実行します。`SELECT`、`INSERT`、または `INSERT SELECT` を行うかどうかに応じて異なる種類のエグゼキュータがあります。
