---
slug: '/examples/aggregate-function-combinators/sumSimpleState'
title: 'sumSimpleState'
description: 'Пример использования комбинатора sumSimpleState'
keywords: ['sum', 'state', 'simple', 'комбинатор', 'примеры', 'sumSimpleState']
sidebar_label: 'sumSimpleState'
doc_type: 'reference'
---



# sumSimpleState {#sumsimplestate}


## Описание {#description}

Комбинатор [`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) может применяться к функции [`sum`](/sql-reference/aggregate-functions/reference/sum)
для вычисления суммы всех входных значений. Результат возвращается с
типом [`SimpleAggregateFunction`](/docs/sql-reference/data-types/simpleaggregatefunction).


## Пример использования {#example-usage}

### Отслеживание положительных и отрицательных голосов {#tracking-post-votes}

Рассмотрим практический пример с использованием таблицы, которая отслеживает голоса за публикации.
Для каждой публикации необходимо поддерживать текущие итоги положительных голосов, отрицательных голосов и
общий счёт. Использование типа `SimpleAggregateFunction` с функцией sum подходит для
данного случая, поскольку нам нужно хранить только текущие итоги, а не полное состояние
агрегации. В результате это будет быстрее и не потребует слияния
частичных агрегатных состояний.

Сначала создадим таблицу для исходных данных:

```sql title="Запрос"
CREATE TABLE raw_votes
(
    post_id UInt32,
    vote_type Enum8('upvote' = 1, 'downvote' = -1)
)
ENGINE = MergeTree()
ORDER BY post_id;
```

Затем создадим целевую таблицу, которая будет хранить агрегированные данные:

```sql
CREATE TABLE vote_aggregates
(
    post_id UInt32,
    upvotes SimpleAggregateFunction(sum, UInt64),
    downvotes SimpleAggregateFunction(sum, UInt64),
    score SimpleAggregateFunction(sum, Int64)
)
ENGINE = AggregatingMergeTree()
ORDER BY post_id;
```

Далее создадим материализованное представление со столбцами типа `SimpleAggregateFunction`:

```sql
CREATE MATERIALIZED VIEW mv_vote_processor TO vote_aggregates
AS
SELECT
  post_id,
  -- Начальное значение для состояния sum (1 для положительного голоса, 0 в противном случае)
  toUInt64(vote_type = 'upvote') AS upvotes,
  -- Начальное значение для состояния sum (1 для отрицательного голоса, 0 в противном случае)
  toUInt64(vote_type = 'downvote') AS downvotes,
  -- Начальное значение для состояния sum (1 для положительного голоса, -1 для отрицательного)
  toInt64(vote_type) AS score
FROM raw_votes;
```

Вставим тестовые данные:

```sql
INSERT INTO raw_votes VALUES
    (1, 'upvote'),
    (1, 'upvote'),
    (1, 'downvote'),
    (2, 'upvote'),
    (2, 'downvote'),
    (3, 'downvote');
```

Выполним запрос к материализованному представлению с использованием комбинатора `SimpleState`:

```sql
SELECT
  post_id,
  sum(upvotes) AS total_upvotes,
  sum(downvotes) AS total_downvotes,
  sum(score) AS total_score
FROM vote_aggregates -- Запрос к целевой таблице
GROUP BY post_id
ORDER BY post_id ASC;
```

```response
┌─post_id─┬─total_upvotes─┬─total_downvotes─┬─total_score─┐
│       1 │             2 │               1 │           1 │
│       2 │             1 │               1 │           0 │
│       3 │             0 │               1 │          -1 │
└─────────┴───────────────┴─────────────────┴─────────────┘
```


## См. также {#see-also}

- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [Комбинатор `SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [Тип `SimpleAggregateFunction`](/sql-reference/data-types/simpleaggregatefunction)
