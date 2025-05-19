---
slug: '/examples/aggregate-function-combinators/sumSimpleState'
title: 'sumSimpleState'
description: 'Пример использования комбинатора sumSimpleState'
keywords: ['sum', 'state', 'simple', 'combinator', 'examples', 'sumSimpleState']
sidebar_label: 'sumSimpleState'
---


# sumSimpleState {#sumsimplestate}

## Описание {#description}

Комбинатор [`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) может быть применен к функции [`sum`](/sql-reference/aggregate-functions/reference/sum) для возвращения суммы по всем входным значениям. Он возвращает результат с типом [`SimpleAggregateFunction`](/docs/sql-reference/data-types/simpleaggregatefunction).

## Пример использования {#example-usage}

### Отслеживание голосов за и против {#tracking-post-votes}

Рассмотрим практический пример, использующий таблицу, которая отслеживает голоса по публикациям. 
Для каждой публикации нам нужно поддерживать текущие итоги голосов за, голосов против и общий балл. Использование типа `SimpleAggregateFunction` с функцией sum подходит для этого случая, так как нам нужно хранить только текущие итоги, а не все состояние агрегации. В результате это будет быстрее и не потребует слияния частичных состояний агрегации.

Сначала мы создаем таблицу для сырых данных:

```sql title="Запрос"
CREATE TABLE raw_votes
(
    post_id UInt32,
    vote_type Enum8('upvote' = 1, 'downvote' = -1)
)
ENGINE = MergeTree()
ORDER BY post_id;
```

Затем мы создаем целевую таблицу, которая будет хранить агрегированные данные:

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

Затем мы создаем материализованное представление с колонками типа `SimpleAggregateFunction`:
       
```sql
CREATE MATERIALIZED VIEW mv_vote_processor TO vote_aggregates
AS
SELECT
  post_id,
  -- Начальное значение для состояния суммы (1 если голос за, 0 в противном случае)
  toUInt64(vote_type = 'upvote') AS upvotes,
  -- Начальное значение для состояния суммы (1 если голос против, 0 в противном случае)
  toUInt64(vote_type = 'downvote') AS downvotes,
  -- Начальное значение для состояния суммы (1 за голос, -1 против голоса)
  toInt64(vote_type) AS score
FROM raw_votes;
```

Вставить тестовые данные:
       
```sql
INSERT INTO raw_votes VALUES
    (1, 'upvote'),
    (1, 'upvote'),
    (1, 'downvote'),
    (2, 'upvote'),
    (2, 'downvote'),
    (3, 'downvote');
```

Запрос к материализованному представлению, используя комбинатор `SimpleState`:

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
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction)
