---
'slug': '/guides/developer/understanding-query-execution-with-the-analyzer'
'sidebar_label': 'クエリ実行の理解とアナライザー'
'title': 'クエリ実行の理解とアナライザー'
'description': 'ClickHouseがどのようにあなたのクエリを実行するかを理解するためにアナライザーを使用する方法について説明します'
'doc_type': 'guide'
---

import analyzer1 from '@site/static/images/guides/developer/analyzer1.png';
import analyzer2 from '@site/static/images/guides/developer/analyzer2.png';
import analyzer3 from '@site/static/images/guides/developer/analyzer3.png';
import analyzer4 from '@site/static/images/guides/developer/analyzer4.png';
import analyzer5 from '@site/static/images/guides/developer/analyzer5.png';
import Image from '@theme/IdealImage';


# クエリ実行を理解するためのアナライザー

ClickHouseはクエリを非常に迅速に処理しますが、クエリの実行は単純な話ではありません。`SELECT`クエリがどのように実行されるかを理解してみましょう。それを示すために、ClickHouseのテーブルにデータを追加しましょう：

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

ClickHouseにデータが追加されたので、いくつかのクエリを実行し、それらの実行を理解したいと思います。クエリの実行は多くのステップに分解されます。クエリ実行の各ステップは、対応する`EXPLAIN`クエリを用いて分析したりトラブルシューティングしたりできます。これらのステップは以下のチャートに要約されています：

<Image img={analyzer1} alt="Explain query steps" size="md"/>

クエリの実行中に各エンティティがどのように動作するかを見てみましょう。いくつかのクエリを取り上げ、それらを`EXPLAIN`文を使って調べます。

## パーサー {#parser}

パーサーの目的は、クエリテキストをAST（抽象構文木）に変換することです。このステップは`EXPLAIN AST`を使用して可視化できます：

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

出力は、以下に示すように可視化できる抽象構文木です：

<Image img={analyzer2} alt="AST output" size="md"/>

各ノードには対応する子があり、全体の木はクエリの全体的な構造を表します。これはクエリを処理するための論理的な構造です。エンドユーザーの視点から見ると（クエリの実行に関心がない限り）、それほど役に立つものではありません。このツールは主に開発者によって使用されます。

## アナライザー {#analyzer}

ClickHouseには現在、アナライザーのための2つのアーキテクチャがあります。古いアーキテクチャを使用するには、`enable_analyzer=0`を設定します。新しいアーキテクチャはデフォルトで有効になっています。ここでは新しいアーキテクチャのみについて説明します。古いアーキテクチャは新しいアナライザーが一般公開されると非推奨になります。

:::note
新しいアーキテクチャは、ClickHouseのパフォーマンスを改善するためのより良いフレームワークを提供するはずです。しかし、これはクエリ処理ステップの基本的なコンポーネントであるため、一部のクエリに対して逆に悪影響を与える可能性もあり、[知られている非互換性](/operations/analyzer#known-incompatibilities)もあります。クエリまたはユーザーのレベルで`enable_analyzer`の設定を変更することで、古いアナライザーに戻すことができます。
:::

アナライザーはクエリ実行の重要なステップです。ASTを受け取り、それをクエリツリーに変換します。ASTに対するクエリツリーの主な利点は、多くのコンポーネントが解決されることです。たとえば、どのテーブルから読み込むかが分かりますし、エイリアスも解決され、木は使用される異なるデータ型を知っています。これらのすべての利点を活かして、アナライザーは最適化を適用できます。これらの最適化は「パス」を介して行われます。すべてのパスは異なる最適化を探します。すべてのパスを[こちら](https://github.com/ClickHouse/ClickHouse/blob/76578ebf92af3be917cd2e0e17fea2965716d958/src/Analyzer/QueryTreePassManager.cpp#L249)で見ることができます。次に、以前のクエリを用いてこれを実際に見てみましょう：

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

2つの実行の間で、エイリアスとプロジェクションの解決を見ることができます。

## プランナー {#planner}

プランナーはクエリツリーを受け取り、それからクエリプランを構築します。クエリツリーは特定のクエリで何をしたいかを教えてくれ、クエリプランはそれをどのように行うかを示します。追加の最適化は、クエリプランの一部として行われます。`EXPLAIN PLAN`または`EXPLAIN`を使用してクエリプランを見ることができます（`EXPLAIN`は`EXPLAIN PLAN`を実行します）。

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

これによりいくつかの情報が得られますが、もっと得られるかもしれません。たとえば、プロジェクションが必要なカラム名を知りたいかもしれません。クエリにヘッダーを追加できます：

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

これで、最後のプロジェクション（`minimum_date`、`maximum_date`、および`percentage`）のために作成する必要があるカラム名がわかりましたが、実行する必要があるすべてのアクションの詳細も欲しいかもしれません。`actions=1`を設定することでそれが可能です。

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

これで、使用されるすべての入力、関数、エイリアス、およびデータ型が表示されます。プランナーが適用するいくつかの最適化を見ることができます[こちら](https://github.com/ClickHouse/ClickHouse/blob/master/src/Processors/QueryPlan/Optimizations/Optimizations.h)です。

## クエリパイプライン {#query-pipeline}

クエリパイプラインはクエリプランから生成されます。クエリパイプラインはクエリプランに非常に似ていますが、木ではなくグラフです。これはClickHouseがクエリをどのように実行するか、どのリソースが使用されるかを強調します。クエリパイプラインを分析することは、入力/出力に関してボトルネックがどこにあるかを見るために非常に役立ちます。前のクエリを取り上げ、それを基にクエリパイプラインの実行を見てみましょう：

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

かっこ内にはクエリプランのステップがあり、その横にプロセッサがあります。これは素晴らしい情報ですが、グラフであるため、そのように可視化すると良いでしょう。設定`graph`を1に設定し、出力形式をTSVに指定できます：

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

この出力をコピーして[こちら](https://dreampuf.github.io/GraphvizOnline)に貼り付けると、次のようなグラフが生成されます：

<Image img={analyzer3} alt="Graph output" size="md"/>

白い長方形はパイプラインノードに対応し、灰色の長方形はクエリプランのステップに対応し、`x`の後に続く数字は使用される入力/出力の数です。コンパクトな形式で表示したくない場合は、常に`compact=0`を追加できます：

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

<Image img={analyzer4} alt="Compact graph output" size="md" />

ClickHouseはなぜテーブルから複数のスレッドを使用して読み取らないのでしょうか？テーブルにデータを追加してみましょう：

```sql
INSERT INTO session_events SELECT * FROM generateRandom('clientId UUID,
   sessionId UUID,
   pageId UUID,
   timestamp DateTime,
   type Enum(\'type1\', \'type2\')', 1, 10, 2) LIMIT 1000000;
```

さて、再度`EXPLAIN`クエリを実行しましょう：

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

<Image img={analyzer5} alt="Parallel graph output" size="md" />

実行者は、データのボリュームが十分に高くなかったため、操作を並列化しないことを決定しました。行を追加することで、実行者はグラフに示されるように複数のスレッドを使用することを決定しました。

## 実行者 {#executor}

最終的に、クエリ実行の最後のステップは実行者によって行われます。実行者はクエリパイプラインを取得し、それを実行します。`SELECT`、`INSERT`、または`INSERT SELECT`を行うかどうかによって、異なるタイプの実行者があります。
