---
slug: /guides/developer/understanding-query-execution-with-the-analyzer
sidebar_label: '使用分析器理解查询执行'
title: '使用分析器理解查询执行'
description: '介绍如何使用分析器来理解 ClickHouse 是如何执行你的查询的'
doc_type: 'guide'
keywords: ['query execution', 'analyzer', 'query optimization', 'explain', 'performance']
---

import analyzer1 from '@site/static/images/guides/developer/analyzer1.png';
import analyzer2 from '@site/static/images/guides/developer/analyzer2.png';
import analyzer3 from '@site/static/images/guides/developer/analyzer3.png';
import analyzer4 from '@site/static/images/guides/developer/analyzer4.png';
import analyzer5 from '@site/static/images/guides/developer/analyzer5.png';
import Image from '@theme/IdealImage';


# 通过 analyzer 理解查询执行

ClickHouse 处理查询的速度极快，但查询的执行过程并不简单。下面我们来了解一个 `SELECT` 查询是如何执行的。为便于说明，我们先在 ClickHouse 中向一张表插入一些数据：

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

现在我们已经在 ClickHouse 中写入了一些数据，接下来希望运行一些查询并理解它们的执行过程。一个查询的执行会被分解为多个步骤。查询执行的每个步骤都可以通过对应的 `EXPLAIN` 查询进行分析和排障。这些步骤在下图中进行了汇总：

<Image img={analyzer1} alt="Explain query steps" size="md" />

下面我们来看看在查询执行过程中各个实体是如何实际工作的。我们将选取几个查询，然后使用 `EXPLAIN` 语句对它们进行分析。


## 解析器 {#parser}

解析器的作用是将查询文本转换为 AST(抽象语法树)。可以使用 `EXPLAIN AST` 来可视化这一步骤:

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

输出结果是一个抽象语法树,可以按如下方式可视化:

<Image img={analyzer2} alt='AST 输出' size='md' />

每个节点都有对应的子节点,整棵树表示查询的整体结构。这是一个用于辅助查询处理的逻辑结构。从最终用户的角度来看(除非对查询执行感兴趣),它的用处不大;该工具主要面向开发人员使用。


## 分析器 {#analyzer}

ClickHouse 目前有两种分析器架构。您可以通过设置 `enable_analyzer=0` 来使用旧架构。新架构默认启用。由于旧架构将在新分析器正式发布后被弃用,本文仅介绍新架构。

:::note
新架构为我们提供了更好的框架来提升 ClickHouse 的性能。但是,由于它是查询处理步骤的基础组件,也可能对某些查询产生负面影响,并且存在[已知的不兼容性](/operations/analyzer#known-incompatibilities)。您可以通过在查询或用户级别更改 `enable_analyzer` 设置来恢复使用旧分析器。
:::

分析器是查询执行的重要步骤。它接收一个 AST 并将其转换为查询树。查询树相对于 AST 的主要优势在于许多组件会被解析,例如存储。我们还能知道从哪个表读取数据,别名也会被解析,并且树能识别所使用的不同数据类型。基于这些优势,分析器可以应用优化。这些优化通过"遍历"(passes)来实现。每个遍历会寻找不同的优化机会。您可以在[这里](https://github.com/ClickHouse/ClickHouse/blob/76578ebf92af3be917cd2e0e17fea2965716d958/src/Analyzer/QueryTreePassManager.cpp#L249)查看所有遍历,让我们用之前的查询来实际演示:

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

在这两次执行之间,您可以看到别名和投影的解析过程。


## 规划器 {#planner}

规划器接收查询树并基于此构建查询计划。查询树告诉我们特定查询需要做什么,而查询计划则告诉我们如何执行。查询计划中还会进行额外的优化。您可以使用 `EXPLAIN PLAN` 或 `EXPLAIN` 来查看查询计划(`EXPLAIN` 会执行 `EXPLAIN PLAN`)。

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

虽然这已经提供了一些信息,但我们可以获取更多。例如,我们可能想知道需要进行投影的列名。您可以在查询中添加 header:

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

现在您已经知道了最后投影需要创建的列名(`minimum_date`、`maximum_date` 和 `percentage`),但您可能还想了解所有需要执行的操作的详细信息。您可以通过设置 `actions=1` 来实现。

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
│ Expression ((Projection + Before ORDER BY))                                                                                                │
│ Actions: INPUT :: 0 -&gt; type String : 0                                                                                                     │
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
│     Actions: INPUT :: 0 -&gt; timestamp DateTime : 0                                                                                          │
│              INPUT :: 1 -&gt; type String : 1                                                                                                 │
│     Positions: 0 1                                                                                                                         │
│       ReadFromMergeTree (default.session&#95;events)                                                                                           │
│       ReadType: Default                                                                                                                    │
│       Parts: 1                                                                                                                             │
│       Granules: 1                                                                                                                          │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

```

现在您可以看到所有正在使用的输入、函数、别名和数据类型。您可以在[此处](https://github.com/ClickHouse/ClickHouse/blob/master/src/Processors/QueryPlan/Optimizations/Optimizations.h)查看查询规划器将应用的部分优化策略。
```


## 查询管道 {#query-pipeline}

查询管道由查询计划生成。查询管道与查询计划非常相似,区别在于它不是树状结构而是图状结构。它展示了 ClickHouse 将如何执行查询以及将使用哪些资源。分析查询管道对于识别输入/输出方面的瓶颈非常有用。让我们以之前的查询为例,查看查询管道的执行情况:

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

括号内是查询计划步骤,旁边是处理器。这些信息很有用,但由于这是一个图结构,如果能将其可视化会更好。我们可以将 `graph` 设置为 1 并指定输出格式为 TSV:

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

然后可以复制此输出并粘贴到[这里](https://dreampuf.github.io/GraphvizOnline),即可生成以下图形:

<Image img={analyzer3} alt='图形输出' size='md' />

白色矩形对应管道节点,灰色矩形对应查询计划步骤,`x` 后跟的数字对应正在使用的输入/输出数量。如果不想以紧凑形式查看,可以添加 `compact=0`:

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

<Image img={analyzer4} alt="紧凑图输出" size="md" />

为什么 ClickHouse 没有使用多线程从表中读取？我们来尝试向表中添加更多数据：

```sql
INSERT INTO session_events SELECT * FROM generateRandom('clientId UUID,
   sessionId UUID,
   pageId UUID,
   timestamp DateTime,
   type Enum(\'type1\', \'type2\')', 1, 10, 2) LIMIT 1000000;
```

现在我们再运行一次 `EXPLAIN` 查询：

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

<Image img={analyzer5} alt="并行图输出" size="md" />

因此，执行器认为数据量不足，未对操作进行并行化。增加更多行之后，执行器便开始使用多个线程，如图所示。


## 执行器 {#executor}

查询执行的最后一步由执行器完成。执行器会接收查询管道并执行。根据执行的查询类型(`SELECT`、`INSERT` 或 `INSERT SELECT`)会使用不同类型的执行器。
