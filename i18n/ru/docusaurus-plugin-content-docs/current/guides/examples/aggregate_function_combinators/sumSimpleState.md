---
slug: '/examples/aggregate-function-combinators/sumSimpleState'
title: 'sumSimpleState'
description: 'Пример использования комбинатора sumSimpleState'
keywords: ['sum', 'state', 'simple', 'combinator', 'examples', 'sumSimpleState']
sidebar_label: 'sumSimpleState'
doc_type: 'reference'
---



# sumSimpleState {#sumsimplestate}



## Описание {#description}

Комбинатор [`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) может быть применён к функции [`sum`](/sql-reference/aggregate-functions/reference/sum) для вычисления суммы по всем входным значениям. Результат имеет тип [`SimpleAggregateFunction`](/docs/sql-reference/data-types/simpleaggregatefunction).



## Пример использования {#example-usage}

### Отслеживание голосов «за» и «против» {#tracking-post-votes}

Рассмотрим практический пример с таблицей, которая отслеживает голоса по постам.
Для каждого поста мы хотим поддерживать текущее количество голосов «за», голосов «против» и
общий счёт. Использование типа `SimpleAggregateFunction` с суммированием подходит для
этого сценария, так как нам нужно хранить только текущие суммы, а не всё состояние
агрегации. В результате это будет быстрее и не потребует слияния
частичных агрегатных состояний.

Сначала создадим таблицу для сырых данных:

```sql title="Query"
CREATE TABLE raw_votes
(
    post_id UInt32,
    vote_type Enum8('upvote' = 1, 'downvote' = -1)
)
ENGINE = MergeTree()
ORDER BY post_id;
```

Далее мы создадим целевую таблицу, которая будет хранить агрегированные данные:

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

Затем создаём материализованное представление со столбцами типа `SimpleAggregateFunction`:

```sql
CREATE MATERIALIZED VIEW mv_vote_processor TO vote_aggregates
AS
SELECT
  post_id,
  -- Начальное значение для состояния суммы (1 для положительной оценки, 0 в остальных случаях)
  toUInt64(vote_type = 'upvote') AS upvotes,
  -- Начальное значение для состояния суммы (1 для отрицательной оценки, 0 в остальных случаях)
  toUInt64(vote_type = 'downvote') AS downvotes,
  -- Начальное значение для состояния суммы (1 для положительной оценки, -1 для отрицательной)
  toInt64(vote_type) AS score
FROM raw_votes;
```

Вставьте пример данных:

```sql
INSERT INTO raw_votes VALUES
    (1, 'upvote'),
    (1, 'upvote'),
    (1, 'downvote'),
    (2, 'upvote'),
    (2, 'downvote'),
    (3, 'downvote');
```

Выполните запрос к материализованному представлению с помощью комбинатора `SimpleState`:

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
┌─post_id─┬─всего_голосов_за─┬─всего_голосов_против─┬─общий_балл─┐
│       1 │                2 │                     1 │          1 │
│       2 │                1 │                     1 │          0 │
│       3 │                0 │                     1 │         -1 │
└─────────┴──────────────────┴───────────────────────┴────────────┘
```


## См. также {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [комбинатор `SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [тип `SimpleAggregateFunction`](/sql-reference/data-types/simpleaggregatefunction)
