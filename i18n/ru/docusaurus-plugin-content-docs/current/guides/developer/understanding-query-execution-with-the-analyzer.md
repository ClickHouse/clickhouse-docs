---
slug: /guides/developer/understanding-query-execution-with-the-analyzer
sidebar_label: 'Понимание выполнения запросов с помощью анализатора'
title: 'Понимание выполнения запросов с помощью анализатора'
description: 'Описывает, как можно использовать анализатор, чтобы понять, как ClickHouse выполняет ваши запросы'
doc_type: 'guide'
keywords: ['выполнение запросов', 'анализатор', 'оптимизация запросов', 'EXPLAIN', 'производительность']
---

import analyzer1 from '@site/static/images/guides/developer/analyzer1.png';
import analyzer2 from '@site/static/images/guides/developer/analyzer2.png';
import analyzer3 from '@site/static/images/guides/developer/analyzer3.png';
import analyzer4 from '@site/static/images/guides/developer/analyzer4.png';
import analyzer5 from '@site/static/images/guides/developer/analyzer5.png';
import Image from '@theme/IdealImage';


# Понимание выполнения запросов в анализаторе

ClickHouse обрабатывает запросы чрезвычайно быстро, но выполнение запроса — это не такой уж простой процесс. Давайте попробуем разобраться, как выполняется запрос `SELECT`. Для наглядности добавим немного данных в таблицу в ClickHouse:

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

Теперь, когда у нас есть некоторые данные в ClickHouse, мы хотим выполнить несколько запросов и понять, как они обрабатываются. Выполнение запроса разбивается на множество шагов. Каждый шаг выполнения запроса можно проанализировать и отладить с помощью соответствующего запроса `EXPLAIN`. Эти шаги показаны на диаграмме ниже:

<Image img={analyzer1} alt="Шаги выполнения запроса EXPLAIN" size="md" />

Рассмотрим каждую сущность в действии во время выполнения запроса. Мы возьмём несколько запросов и затем проанализируем их с помощью оператора `EXPLAIN`.


## Парсер {#parser}

Задача парсера — преобразовать текст запроса в AST (абстрактное синтаксическое дерево). Этот этап можно визуализировать с помощью `EXPLAIN AST`:

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

На выходе получается абстрактное синтаксическое дерево, которое можно визуализировать следующим образом:

<Image img={analyzer2} alt='Вывод AST' size='md' />

Каждый узел имеет соответствующие дочерние элементы, а дерево в целом представляет общую структуру запроса. Это логическая структура, которая помогает в обработке запроса. С точки зрения конечного пользователя (если только он не интересуется выполнением запросов), она не особенно полезна; этот инструмент используется главным образом разработчиками.


## Анализатор {#analyzer}

В настоящее время в ClickHouse существует две архитектуры анализатора. Вы можете использовать старую архитектуру, установив параметр `enable_analyzer=0`. Новая архитектура включена по умолчанию. Здесь мы будем описывать только новую архитектуру, поскольку старая будет признана устаревшей после того, как новый анализатор станет общедоступным.

:::note
Новая архитектура должна предоставить более совершенную основу для повышения производительности ClickHouse. Однако, учитывая, что это фундаментальный компонент этапов обработки запросов, она также может негативно повлиять на некоторые запросы, и существуют [известные несовместимости](/operations/analyzer#known-incompatibilities). Вы можете вернуться к старому анализатору, изменив настройку `enable_analyzer` на уровне запроса или пользователя.
:::

Анализатор является важным этапом выполнения запроса. Он принимает AST и преобразует его в дерево запроса. Основное преимущество дерева запроса перед AST заключается в том, что многие компоненты будут разрешены, например, хранилище. Мы также знаем, из какой таблицы читать данные, псевдонимы также разрешаются, и дерево содержит информацию о различных используемых типах данных. Благодаря всем этим преимуществам анализатор может применять оптимизации. Эти оптимизации работают через «проходы». Каждый проход ищет различные оптимизации. Вы можете увидеть все проходы [здесь](https://github.com/ClickHouse/ClickHouse/blob/76578ebf92af3be917cd2e0e17fea2965716d958/src/Analyzer/QueryTreePassManager.cpp#L249), давайте рассмотрим это на практике с нашим предыдущим запросом:

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

Между двумя выполнениями можно увидеть разрешение псевдонимов и проекций.


## Планировщик {#planner}

Планировщик принимает дерево запроса и строит на его основе план выполнения запроса. Дерево запроса определяет, что мы хотим сделать с конкретным запросом, а план запроса определяет, как это будет выполнено. Дополнительные оптимизации выполняются в рамках плана запроса. Для просмотра плана запроса можно использовать `EXPLAIN PLAN` или `EXPLAIN` (команда `EXPLAIN` выполняет `EXPLAIN PLAN`).

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

Хотя это дает некоторую информацию, можно получить больше. Например, может потребоваться узнать имена столбцов, для которых выполняются проекции. Для этого можно добавить заголовок к запросу:

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

Теперь известны имена столбцов, которые необходимо создать для последней проекции (`minimum_date`, `maximum_date` и `percentage`), но может также потребоваться получить подробную информацию обо всех выполняемых действиях. Это можно сделать, установив параметр `actions=1`.

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
│ Выражение ((Projection + Before ORDER BY))                                                                                                │
│ Действия: INPUT :: 0 -&gt; type String : 0                                                                                                   │
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
│ Позиции: 0 6 1 5                                                                                                                           │
│   Агрегирование                                                                                                                            │
│   Ключи: type                                                                                                                              │
│   Агрегатные функции:                                                                                                                     │
│       min(timestamp)                                                                                                                       │
│         Функция: min(DateTime) → DateTime                                                                                                  │
│         Аргументы: timestamp                                                                                                               │
│       max(timestamp)                                                                                                                       │
│         Функция: max(DateTime) → DateTime                                                                                                  │
│         Аргументы: timestamp                                                                                                               │
│       count()                                                                                                                              │
│         Функция: count() → UInt64                                                                                                          │
│         Аргументы: нет                                                                                                                     │
│   Пропуск слияния: 0                                                                                                                       │
│     Выражение (Before GROUP BY)                                                                                                            │
│     Действия: INPUT :: 0 -&gt; timestamp DateTime : 0                                                                                         │
│              INPUT :: 1 -&gt; type String : 1                                                                                                 │
│     Позиции: 0 1                                                                                                                           │
│       ReadFromMergeTree (default.session&#95;events)                                                                                           │
│       ReadType: Default                                                                                                                    │
│       Частей: 1                                                                                                                            │
│       Гранул: 1                                                                                                                            │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

```

Теперь вы можете видеть все входные данные, функции, псевдонимы и типы данных, которые используются. Некоторые оптимизации, которые будет применять планировщик запросов, можно посмотреть [здесь](https://github.com/ClickHouse/ClickHouse/blob/master/src/Processors/QueryPlan/Optimizations/Optimizations.h).
```


## Конвейер запроса {#query-pipeline}

Конвейер запроса генерируется из плана запроса. Конвейер запроса очень похож на план запроса, с той разницей, что это не дерево, а граф. Он показывает, как ClickHouse будет выполнять запрос и какие ресурсы будут использованы. Анализ конвейера запроса очень полезен для определения узких мест с точки зрения входов/выходов. Рассмотрим наш предыдущий запрос и посмотрим на выполнение конвейера запроса:

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

Внутри скобок находится шаг плана запроса, а рядом с ним — процессор. Это полезная информация, но поскольку это граф, было бы удобно визуализировать его соответствующим образом. У нас есть настройка `graph`, которую можно установить в 1, и указать формат вывода TSV:

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

Затем вы можете скопировать этот вывод и вставить его [сюда](https://dreampuf.github.io/GraphvizOnline), что сгенерирует следующий граф:

<Image img={analyzer3} alt='Вывод графа' size='md' />

Белый прямоугольник соответствует узлу конвейера, серый прямоугольник соответствует шагам плана запроса, а `x` с последующим числом соответствует количеству используемых входов/выходов. Если вы не хотите видеть их в компактной форме, всегда можно добавить `compact=0`:

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

Почему ClickHouse не читает данные из таблицы в несколько потоков? Давайте попробуем добавить больше данных в нашу таблицу:

```sql
INSERT INTO session_events SELECT * FROM generateRandom('clientId UUID,
   sessionId UUID,
   pageId UUID,
   timestamp DateTime,
   type Enum(\'type1\', \'type2\')', 1, 10, 2) LIMIT 1000000;
```

Теперь снова выполним запрос `EXPLAIN`:

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

<Image img={analyzer5} alt="Параллельный вывод графика" size="md" />

Таким образом, исполнитель решил не параллелизировать операции, поскольку объем данных был недостаточно велик. После добавления большего числа строк он решил задействовать несколько потоков, как показано на графике.


## Исполнитель {#executor}

Наконец, последний этап выполнения запроса выполняется исполнителем. Он получает конвейер запроса и исполняет его. Существуют различные типы исполнителей в зависимости от того, выполняется ли запрос `SELECT`, `INSERT` или `INSERT SELECT`.
