---
slug: /guides/developer/understanding-query-execution-with-the-analyzer
sidebar_label: "クエリ実行の理解: アナライザーを用いて"
title: "クエリ実行の理解: アナライザーを用いて"
---

# クエリ実行の理解: アナライザーを用いて

ClickHouseはクエリを非常に迅速に処理しますが、クエリの実行は単純な話ではありません。`SELECT`クエリがどのように実行されるのかを理解してみましょう。これを説明するために、ClickHouseのテーブルにいくつかのデータを追加しましょう。

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

これでClickHouseにデータが追加されたので、いくつかのクエリを実行し、その実行方法を理解したいと思います。クエリの実行は多くのステップに分解されます。クエリ実行の各ステップは、対応する`EXPLAIN`クエリを使用して分析およびトラブルシューティングできます。これらのステップは下のチャートでまとめられています。

![Explain query steps](./images/analyzer1.png)

クエリ実行中の各エンティティの動作を見てみましょう。いくつかのクエリを取り上げ、その後で`EXPLAIN`ステートメントを使用して詳しく調べます。

## パーサー {#parser}

パーサーの目的は、クエリテキストをAST（抽象構文木）に変換することです。このステップは`EXPLAIN AST`を使用して視覚化できます。

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

出力は、下のように視覚化できる抽象構文木です。

![AST output](./images/analyzer2.png)

各ノードには対応する子ノードがあり、全体の木はクエリの全体の構造を表しています。これはクエリを処理するための論理的な構造です。エンドユーザーの立場から（クエリ実行に関心がない場合を除いて）、これはそれほど役に立たないですが、このツールは主に開発者によって使用されます。

## アナライザー {#analyzer}

ClickHouseには現在、アナライザーの2つのアーキテクチャがあります。`enable_analyzer=0`を設定することで古いアーキテクチャを使用できます。新しいアーキテクチャはデフォルトで有効です。ここでは新しいアーキテクチャのみを説明します。古いアーキテクチャは、新しいアナライザーが一般利用可能になった際に非推奨となります。

:::note
新しいアーキテクチャは、ClickHouseのパフォーマンスを向上させるためのより良いフレームワークを提供するはずです。しかし、これはクエリ処理ステップの基本的なコンポーネントなので、一部のクエリに対して負の影響を及ぼす可能性もあります。また、[既知の非互換性](/operations/analyzer#known-incompatibilities)もあります。クエリまたはユーザーレベルで`enable_analyzer`設定を変更することで、古いアナライザーに戻ることができます。
:::

アナライザーはクエリ実行の重要なステップです。ASTを受け取り、クエリツリーに変換します。ASTに対するクエリツリーの主な利点は、多くのコンポーネントが解決されることです。例えば、どのストレージから読み込むのか、エイリアスが解決され、ツリーは使用されるさまざまなデータ型を把握しています。これらの利点を活用して、アナライザーは最適化を適用することができます。これらの最適化は「パス」によって実行されます。各パスは異なる最適化を探します。すべてのパスは[こちら](https://github.com/ClickHouse/ClickHouse/blob/76578ebf92af3be917cd2e0e17fea2965716d958/src/Analyzer/QueryTreePassManager.cpp#L249)で確認できます。前のクエリを使って実際に確認してみましょう。

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

2回の実行の間に、エイリアスとプロジェクションの解決が見られます。

## プランナー {#planner}

プランナーはクエリツリーを受け取り、それをクエリプランに構築します。クエリツリーは特定のクエリで何をしたいのかを示し、クエリプランはどうやってそれを実行するかを示します。追加の最適化はクエリプランの一部として行われます。クエリプランを確認するには、`EXPLAIN PLAN`または`EXPLAIN`を使用します（`EXPLAIN`は`EXPLAIN PLAN`を実行します）。

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

この情報は役立ちますが、さらなる情報が必要な場合があります。たとえば、プロジェクションの上に必要なカラムの名前を知りたい場合、クエリのヘッダーを追加できます。

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

これで、最後のプロジェクション（`minimum_date`、`maximum_date`、`percentage`）に必要なカラム名がわかりました。また、実行する必要のあるすべてのアクションの詳細を知りたい場合、`actions=1`を設定できます。

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

これで、使用されているすべての入力、関数、エイリアス、データ型が確認できます。また、プランナーが適用しようとしている最適化の一部は[こちら](https://github.com/ClickHouse/ClickHouse/blob/master/src/Processors/QueryPlan/Optimizations/Optimizations.h)で確認できます。

## クエリパイプライン {#query-pipeline}

クエリパイプラインはクエリプランから生成されます。クエリパイプラインはクエリプランに非常に似ていますが、異なる点は木ではなくグラフであるということです。これにより、ClickHouseがクエリをどのように実行するのか、どのリソースが使用されるのかが強調されます。クエリパイプラインを分析することは、入力/出力の観点からボトルネックがどこにあるかを確認するのに非常に役立ちます。前のクエリを取り上げて、クエリパイプライン実行を見てみましょう。

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

括弧内にはクエリプランステップが表示され、その隣にはプロセッサーがあります。これは素晴らしい情報ですが、グラフで視覚化した方が良いことが多いです。`graph`設定を1に設定し、出力形式をTSVに指定できます。

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

この出力を[こちら](https://dreampuf.github.io/GraphvizOnline)にコピーして貼り付けると、次のようなグラフが生成されます。

![Graph output](./images/analyzer3.png)

白い矩形はパイプラインノードに対応し、灰色の矩形はクエリプランのステップに対応します。また、`x`の後に数字が続くものは、使用されている入力/出力の数を示します。コンパクトな形で表示したくない場合は、`compact=0`を追加できます。

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

![Compact graph output](./images/analyzer4.png)

ClickHouseがなぜ複数のスレッドを使ってテーブルから読み込まないのかを見てみましょう。テーブルにもっとデータを追加してみます。

```sql
INSERT INTO session_events SELECT * FROM generateRandom('clientId UUID,
   sessionId UUID,
   pageId UUID,
   timestamp DateTime,
   type Enum(\'type1\', \'type2\')', 1, 10, 2) LIMIT 1000000;
```

では、再度`EXPLAIN`クエリを実行してみましょう。

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

![Parallel graph](./images/analyzer5.png)

実行者は、データの量が十分に高くないために操作の並列化を選択しなかったようです。行数を増やすことで、実行者は複数のスレッドを使用することに決定しました。

## 実行者 {#executor}

クエリ実行の最終ステップは実行者によって行われます。実行者はクエリパイプラインを取得し、それを実行します。`SELECT`や`INSERT`、`INSERT SELECT`など、さまざまなタイプの実行者があります。
