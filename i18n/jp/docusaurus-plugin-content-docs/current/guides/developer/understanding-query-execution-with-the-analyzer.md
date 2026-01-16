---
slug: /guides/developer/understanding-query-execution-with-the-analyzer
sidebar_label: 'アナライザーを使用したクエリ実行の理解'
title: 'アナライザーを使用したクエリ実行の理解'
description: 'アナライザーを使用してClickHouseがクエリを実行する方法を理解する方法を説明します'
doc_type: 'guide'
keywords: ['クエリ実行', 'アナライザー', 'クエリ最適化', 'explain', 'パフォーマンス']
---

import analyzer1 from '@site/static/images/guides/developer/analyzer1.png';
import analyzer2 from '@site/static/images/guides/developer/analyzer2.png';
import analyzer3 from '@site/static/images/guides/developer/analyzer3.png';
import analyzer4 from '@site/static/images/guides/developer/analyzer4.png';
import analyzer5 from '@site/static/images/guides/developer/analyzer5.png';
import Image from '@theme/IdealImage';

# アナライザーを使用したクエリ実行の理解 \{#understanding-query-execution-with-the-analyzer\}

ClickHouseはクエリを非常に高速に処理しますが、クエリの実行は単純な話ではありません。`SELECT`クエリがどのように実行されるかを理解してみましょう。これを説明するために、ClickHouseのテーブルにいくつかのデータを追加しましょう：

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

ClickHouseにデータがあるので、いくつかのクエリを実行して、その実行を理解したいと思います。クエリの実行は多くのステップに分解されます。クエリ実行の各ステップは、対応する`EXPLAIN`クエリを使用して分析およびトラブルシューティングできます。これらのステップを以下のチャートにまとめます：

<Image img={analyzer1} alt="Explainクエリステップ" size="md"/>

クエリ実行中に動作する各エンティティを見てみましょう。いくつかのクエリを取り、`EXPLAIN`文を使用してそれらを検査します。

## パーサー \\{#parser\\}

パーサーの目標は、クエリテキストをAST（抽象構文木）に変換することです。このステップは`EXPLAIN AST`を使用して視覚化できます：

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

出力は、以下に示すように視覚化できる抽象構文木です：

<Image img={analyzer2} alt="AST出力" size="md"/>

各ノードには対応する子があり、ツリー全体がクエリの全体構造を表します。これは、クエリを処理するのに役立つ論理構造です。エンドユーザーの観点から（クエリ実行に興味がある場合を除く）、それほど有用ではありません。このツールは主に開発者によって使用されます。

## アナライザー \\{#analyzer\\}

ClickHouseには現在、アナライザーのための2つのアーキテクチャがあります。`enable_analyzer=0`を設定することで、古いアーキテクチャを使用できます。新しいアーキテクチャはデフォルトで有効になっています。新しいアナライザーが一般に利用可能になると、古いアーキテクチャは非推奨になる予定なので、ここでは新しいアーキテクチャのみを説明します。

:::note
新しいアーキテクチャは、ClickHouseのパフォーマンスを向上させるためのより良いフレームワークを提供するはずです。ただし、これはクエリ処理ステップの基本的なコンポーネントであるため、一部のクエリに悪影響を与える可能性もあり、[既知の非互換性](/operations/analyzer#known-incompatibilities)があります。クエリまたはユーザーレベルで`enable_analyzer`設定を変更することで、古いアナライザーに戻すことができます。
:::

アナライザーは、クエリ実行の重要なステップです。ASTを受け取り、それをクエリツリーに変換します。ASTに対するクエリツリーの主な利点は、多くのコンポーネントが解決されることです。たとえば、ストレージなどです。どのテーブルから読み取るか、エイリアスも解決され、ツリーは使用されるさまざまなデータ型を認識します。これらすべての利点により、アナライザーは最適化を適用できます。これらの最適化が機能する方法は「パス」を介して行われます。すべてのパスは異なる最適化を探します。すべてのパスは[ここ](https://github.com/ClickHouse/ClickHouse/blob/76578ebf92af3be917cd2e0e17fea2965716d958/src/Analyzer/QueryTreePassManager.cpp#L249)で確認できます。以前のクエリで実際に見てみましょう：

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

2つの実行の間で、エイリアスと射影の解決を確認できます。

## プランナー \\{#planner\\}

プランナーはクエリツリーを受け取り、それからクエリプランを構築します。クエリツリーは特定のクエリで何をしたいかを教えてくれ、クエリプランはそれをどのように行うかを教えてくれます。追加の最適化がクエリプランの一部として行われます。`EXPLAIN PLAN`または`EXPLAIN`を使用してクエリプランを確認できます（`EXPLAIN`は`EXPLAIN PLAN`を実行します）。

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

これはいくつかの情報を提供していますが、さらに多くを得ることができます。たとえば、射影が必要な列名を知りたい場合があります。クエリにヘッダーを追加できます：

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

これで、最後の射影（`minimum_date`、`maximum_date`、`percentage`）のために作成する必要がある列名がわかりますが、実行する必要があるすべてのアクションの詳細も知りたいかもしれません。`actions=1`を設定することでこれを行えます。

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
│          FUNCTION multiply(divide(count(), total_rows) :: 2, 100 :: 5) -> multiply(divide(count(), total_rows), 100) Nullable(Float64) : 4 │
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

これで、使用されているすべての入力、関数、エイリアス、データ型を確認できます。プランナーが適用する最適化のいくつかは[ここ](https://github.com/ClickHouse/ClickHouse/blob/master/src/Processors/QueryPlan/Optimizations/Optimizations.h)で確認できます。

## クエリパイプライン \\{#query-pipeline\\}

クエリパイプラインはクエリプランから生成されます。クエリパイプラインはクエリプランと非常に似ていますが、違いは木ではなくグラフであることです。ClickHouseがクエリをどのように実行し、どのリソースが使用されるかを強調します。クエリパイプラインを分析することは、入出力の観点からボトルネックがどこにあるかを確認するのに非常に便利です。以前のクエリを取り、クエリパイプラインの実行を見てみましょう：

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

括弧内はクエリプランのステップで、その隣がプロセッサです。これは素晴らしい情報ですが、これはグラフなので、そのように視覚化したいと思います。設定`graph`を1に設定し、出力形式をTSVに指定できます：

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

この出力をコピーして[ここ](https://dreampuf.github.io/GraphvizOnline)に貼り付けると、次のグラフが生成されます：

<Image img={analyzer3} alt="グラフ出力" size="md"/>

白い長方形はパイプラインノードに対応し、灰色の長方形はクエリプランステップに対応し、`x`の後に数字が続くのは使用されている入出力の数に対応します。コンパクトな形式で表示したくない場合は、いつでも`compact=0`を追加できます：

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

<Image img={analyzer4} alt="コンパクトグラフ出力" size="md" />

なぜClickHouseは複数のスレッドを使用してテーブルから読み取らないのでしょうか？テーブルにより多くのデータを追加してみましょう：

```sql
INSERT INTO session_events SELECT * FROM generateRandom('clientId UUID,
   sessionId UUID,
   pageId UUID,
   timestamp DateTime,
   type Enum(\'type1\', \'type2\')', 1, 10, 2) LIMIT 1000000;
```

次に、`EXPLAIN`クエリを再度実行してみましょう：

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

<Image img={analyzer5} alt="並列グラフ出力" size="md" />

つまり、エグゼキュータはデータ量が十分に多くなかったため、操作を並列化しないことを決定しました。より多くの行を追加することで、エグゼキュータはグラフに示されているように複数のスレッドを使用することを決定しました。

## エグゼキュータ \\{#executor\\}

最後に、クエリ実行の最後のステップはエグゼキュータによって行われます。クエリパイプラインを受け取り、それを実行します。`SELECT`、`INSERT`、または`INSERT SELECT`を実行しているかどうかによって、さまざまなタイプのエグゼキュータがあります。
