---
slug: /guides/developer/understanding-query-execution-with-the-analyzer
sidebar_label: Понимание выполнения запросов с помощью Анализатора
title: Понимание выполнения запросов с помощью Анализатора
keywords: ['ClickHouse', 'анализ', 'выполнение запросов']
description: 'Этот раздел объясняет, как ClickHouse обрабатывает запросы с помощью анализа и различных этапов выполнения.'

---

import analyzer1 from '@site/static/images/guides/developer/analyzer1.png';
import analyzer2 from '@site/static/images/guides/developer/analyzer2.png';
import analyzer3 from '@site/static/images/guides/developer/analyzer3.png';
import analyzer4 from '@site/static/images/guides/developer/analyzer4.png';
import analyzer5 from '@site/static/images/guides/developer/analyzer5.png';


# Понимание выполнения запросов с помощью Анализатора

ClickHouse обрабатывает запросы крайне быстро, но выполнение запроса — это не простая задача. Давайте попробуем понять, как выполняется запрос `SELECT`. Для наглядности добавим немного данных в таблицу в ClickHouse:

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

Теперь, когда у нас есть данные в ClickHouse, мы хотим выполнить несколько запросов и понять их выполнение. Выполнение запроса делится на множество этапов. Каждый этап выполнения запроса можно проанализировать и диагностировать, используя соответствующий запрос `EXPLAIN`. Эти этапы обобщены в следующей схеме:

<img src={analyzer1} class="image" alt="Explain query steps" style={{width: '600px'}} />

Давайте рассмотрим каждую сущность в действии во время выполнения запроса. Мы будем использовать несколько запросов и затем анализировать их с помощью оператора `EXPLAIN`.

## Парсер {#parser}

Цель парсера — преобразовать текст запроса в AST (дерево абстрактного синтаксиса). Этот этап можно визуализировать с помощью `EXPLAIN AST`:

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

Вывод представляет собой дерево абстрактного синтаксиса, которое можно визуализировать следующим образом:

<img src={analyzer2} class="image" alt="AST output" style={{width: '600px'}} />

Каждый узел имеет соответствующих дочерних узлов, и общее дерево представляет собой общую структуру вашего запроса. Это логическая структура, помогающая в обработке запроса. С точки зрения конечного пользователя (если не интересует выполнение запроса), она не слишком полезна; этот инструмент в основном используется разработчиками.

## Анализатор {#analyzer}

На данный момент у ClickHouse есть две архитектуры для Анализатора. Вы можете использовать старую архитектуру, установив: `enable_analyzer=0`. Новая архитектура включена по умолчанию. Мы здесь опишем только новую архитектуру, поскольку старая будет устаревать, как только новый анализатор станет общедоступным.

:::note
Новая архитектура должна предоставить нам лучшую основу для улучшения производительности ClickHouse. Однако, так как она является основным компонентом этапов обработки запроса, она может также оказать негативное влияние на некоторые запросы, и уже есть [известные несовместимости](/operations/analyzer#known-incompatibilities). Вы можете вернуться к старому анализатору, изменив настройку `enable_analyzer` на уровне запроса или пользователя.
:::

Анализатор — это важный этап выполнения запроса. Он принимает AST и преобразует его в дерево запроса. Основное преимущество дерева запроса перед AST заключается в том, что многие компоненты будут разрешены, например, хранилище. Мы также знаем, из какой таблицы читать, псевдонимы также разрешены, и дерево знает о различных используемых типах данных. Со всеми этими преимуществами анализатор способен применять оптимизации. Оптимизации работают через «проходы». Каждый проход ищет разные оптимизации. Вы можете увидеть все проходы [здесь](https://github.com/ClickHouse/ClickHouse/blob/76578ebf92af3be917cd2e0e17fea2965716d958/src/Analyzer/QueryTreePassManager.cpp#L249), давайте увидим это на практике с нашим предыдущим запросом:

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

Между двумя выполнениями вы можете увидеть разрешение псевдонимов и проекций.

## Планировщик {#planner}

Планировщик берет дерево запроса и строит план запроса из него. Дерево запроса говорит нам, что мы хотим сделать с конкретным запросом, а план запроса говорит нам, как мы будем это делать. Дополнительные оптимизации будут выполняться в рамках плана запроса. Вы можете использовать `EXPLAIN PLAN` или `EXPLAIN`, чтобы увидеть план запроса (`EXPLAIN` выполнит `EXPLAIN PLAN`).

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

Хотя это дает нам некоторую информацию, мы можем получить больше. Например, возможно, мы хотим знать имя колонки, на которой нам нужны проекции. Вы можете добавить заголовок к запросу:

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

Теперь вы знаете имена колонок, которые необходимо создать для последней проекции (`minimum_date`, `maximum_date` и `percentage`), но вы также можете захотеть видеть все действия, которые необходимо выполнить. Вы можете сделать это, установив `actions=1`.

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

Теперь вы видите все входные данные, функции, псевдонимы и типы данных, которые используются. Вы также можете увидеть некоторые оптимизации, которые планировщик собирается применить [здесь](https://github.com/ClickHouse/ClickHouse/blob/master/src/Processors/QueryPlan/Optimizations/Optimizations.h).

## Конвейер Запросов {#query-pipeline}

Конвейер запросов генерируется из плана запроса. Конвейер запросов очень похож на план запроса, с тем отличием, что это не дерево, а граф. Он подчеркивает, как ClickHouse будет выполнять запрос и какие ресурсы будут использоваться. Анализ конвейера запросов очень полезен для определения узкого места в терминах входных/выходных данных. Давайте рассмотрим наш предыдущий запрос и посмотрим на выполнение конвейера запросов:

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

Внутри круглых скобок находится шаг плана запроса, а рядом с ним — процессор. Это отличная информация, но поскольку это граф, было бы неплохо визуализировать его как таковой. У нас есть настройка `graph`, которую мы можем установить на 1 и указать формат вывода как TSV:

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

Затем вы можете скопировать этот вывод и вставить его [сюда](https://dreampuf.github.io/GraphvizOnline), и это сгенерирует следующий график:

<img src={analyzer3} class="image" alt="Graph output" style={{width: '600px'}} />

Белый прямоугольник соответствует узлу конвейера, серый прямоугольник соответствует шагам плана запроса, а `x`, за которым следует число, соответствует количеству входных/выходных данных, которые используются. Если вы не хотите видеть их в компактной форме, вы всегда можете добавить `compact=0`:

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

Почему ClickHouse не считывает таблицу с использованием нескольких потоков? Давайте попробуем добавить больше данных в нашу таблицу:

```sql
INSERT INTO session_events SELECT * FROM generateRandom('clientId UUID,
   sessionId UUID,
   pageId UUID,
   timestamp DateTime,
   type Enum(\'type1\', \'type2\')', 1, 10, 2) LIMIT 1000000;
```

Теперь давайте снова запустим наш запрос `EXPLAIN`:

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

<img src={analyzer5} class="image" alt="Parallel graph output" style={{width: '600px'}} />

Таким образом, исполнение решило не параллелить операции, потому что объем данных был недостаточно высоким. После добавления большего числа строк, исполнитель решил использовать несколько потоков, как показано на графе.

## Исполнитель {#executor}

Наконец, последний шаг выполнения запроса выполняется исполнителем. Он берет конвейер запроса и выполняет его. Существуют различные типы исполнителей, в зависимости от того, выполняете ли вы `SELECT`, `INSERT` или `INSERT SELECT`.
