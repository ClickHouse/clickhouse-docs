---
slug: /guides/developer/understanding-query-execution-with-the-analyzer
sidebar_label: 'Понимание выполнения запросов с помощью анализатора'
title: 'Понимание выполнения запросов с помощью анализатора'
description: 'Описание того, как вы можете использовать анализатор для понимания того, как ClickHouse выполняет ваши запросы'
---

import analyzer1 from '@site/static/images/guides/developer/analyzer1.png';
import analyzer2 from '@site/static/images/guides/developer/analyzer2.png';
import analyzer3 from '@site/static/images/guides/developer/analyzer3.png';
import analyzer4 from '@site/static/images/guides/developer/analyzer4.png';
import analyzer5 from '@site/static/images/guides/developer/analyzer5.png';
import Image from '@theme/IdealImage';


# Понимание выполнения запросов с помощью анализатора

ClickHouse обрабатывает запросы исключительно быстро, но выполнение запроса — это не простая задача. Давайте попробуем понять, как выполняется запрос `SELECT`. Для иллюстрации добавим некоторые данные в таблицу в ClickHouse:

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

Теперь, когда у нас есть некоторые данные в ClickHouse, мы хотим запустить несколько запросов и понять их выполнение. Выполнение запроса разбито на множество шагов. Каждый шаг выполнения запроса можно проанализировать и диагностировать с помощью соответствующего запроса `EXPLAIN`. Эти шаги подытожены в таблице ниже:

<Image img={analyzer1} alt="Шаги объяснения запроса" size="md"/>

Давайте посмотрим на каждую сущность в действии во время выполнения запроса. Мы возьмем несколько запросов и затем рассмотрим их с помощью оператора `EXPLAIN`.

## Парсер {#parser}

Цель парсера — преобразовать текст запроса в AST (абстрактное синтаксическое дерево). Этот шаг можно визуализировать, используя `EXPLAIN AST`:

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

Вывод — это абстрактное синтаксическое дерево, которое можно визуализировать следующим образом:

<Image img={analyzer2} alt="Вывод AST" size="md"/>

Каждый узел имеет соответствующие дочерние элементы, и все дерево представляет собой общую структуру вашего запроса. Это логическая структура, помогающая в обработке запроса. С точки зрения конечного пользователя (если не интересует выполнение запроса) она не очень полезна; этот инструмент в основном используется разработчиками.

## Анализатор {#analyzer}

В настоящее время ClickHouse имеет две архитектуры для анализатора. Вы можете использовать старую архитектуру, установив: `enable_analyzer=0`. Новая архитектура включена по умолчанию. Мы собираемся описать только новую архитектуру здесь, поскольку старая будет устаревать, как только новый анализатор станет общедоступным.

:::note
Новая архитектура должна обеспечить нам лучшую основу для улучшения производительности ClickHouse. Однако, учитывая, что она является важным компонентом шагов обработки запросов, она также может отрицательно повлиять на некоторые запросы, и существуют [известные несовместимости](/operations/analyzer#known-incompatibilities). Вы можете вернуться к старому анализатору, изменив настройку `enable_analyzer` на уровне запроса или пользователя.
:::

Анализатор является важным шагом выполнения запроса. Он принимает AST и преобразует его в дерево запроса. Основное преимущество дерева запроса по сравнению с AST заключается в том, что многие компоненты будут разрешены, например, хранилище. Мы также знаем, из какой таблицы читать, алиасы также разрешены, и дерево знает различные используемые типы данных. С этими всеми преимуществами анализатор может применять оптимизации. Способ работы этих оптимизаций осуществляется через "проходы". Каждый проход будет искать различные оптимизации. Вы можете увидеть все проходы [здесь](https://github.com/ClickHouse/ClickHouse/blob/76578ebf92af3be917cd2e0e17fea2965716d958/src/Analyzer/QueryTreePassManager.cpp#L249), давайте посмотрим на это на практике, используя наш предыдущий запрос:

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

Между двумя исполнениями вы можете увидеть разрешение алиасов и проекций.

## Планировщик {#planner}

Планировщик берет дерево запроса и строит из него план запроса. Дерево запроса сообщает нам, что мы хотим сделать с конкретным запросом, а план запроса говорит нам, как мы это сделаем. Дополнительные оптимизации будут выполняться как часть плана запроса. Вы можете использовать `EXPLAIN PLAN` или `EXPLAIN`, чтобы увидеть план запроса (`EXPLAIN` выполнит `EXPLAIN PLAN`).

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

Хотя это дает нам некоторую информацию, мы можем получить больше. Например, возможно, мы хотим знать название столбца, по которому нам нужны проекции. Вы можете добавить заголовок к запросу:

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

Таким образом, теперь вы знаете имена столбцов, которые необходимо создать для последней проекции (`minimum_date`, `maximum_date` и `percentage`), но вы также можете захотеть получить детали всех действий, которые необходимо выполнить. Вы можете сделать это, установив `actions=1`.

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

Теперь вы можете видеть все входы, функции, алиасы и типы данных, которые используются. Вы можете увидеть некоторые оптимизации, которые планировщик собирается применить [здесь](https://github.com/ClickHouse/ClickHouse/blob/master/src/Processors/QueryPlan/Optimizations/Optimizations.h).

## Конвейер запросов {#query-pipeline}

Конвейер запросов создается из плана запроса. Конвейер запросов очень похож на план запроса, с той разницей, что это не дерево, а граф. Он подчеркивает, как ClickHouse будет выполнять запрос и какие ресурсы будут использованы. Анализ конвейера запросов очень полезен, чтобы увидеть, где находится узкое место в терминах входов/выходов. Давайте возьмем наш предыдущий запрос и посмотрим на выполнение конвейера запросов:

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

Внутри скобок находится шаг плана запроса, а рядом с ним — процессор. Это отличная информация, но поскольку это граф, было бы неплохо визуализировать его в таком виде. У нас есть настройка `graph`, которую мы можем установить в 1 и указать формат вывода как TSV:

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

Вы можете скопировать этот вывод и вставить [здесь](https://dreampuf.github.io/GraphvizOnline), и это создаст следующий график:

<Image img={analyzer3} alt="Вывод графа" size="md"/>

Белый прямоугольник соответствует узлу в конвейере, серый прямоугольник соответствует этапам плана запроса, а `x`, за которым следует число, соответствует количеству входов/выходов, которые используются. Если вы не хотите видеть их в компактном виде, вы всегда можете добавить `compact=0`:

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

<Image img={analyzer4} alt="Компактный вывод графа" size="md" />

Почему ClickHouse не читает из таблицы, используя несколько потоков? Давайте попробуем добавить больше данных в нашу таблицу:

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
}
```

<Image img={analyzer5} alt="Параллельный вывод графа" size="md" />

Таким образом, исполнитель решил не параллелить операции, потому что объем данных был недостаточно высок. Добавив больше строк, исполнитель, следовательно, решил использовать несколько потоков, как показано на графике.

## Исполнитель {#executor}

Наконец, последний шаг выполнения запроса выполняется исполнителем. Он берет конвейер запроса и выполняет его. Существуют различные типы исполнителей, в зависимости от того, выполняете ли вы `SELECT`, `INSERT` или `INSERT SELECT`.
