---
slug: '/examples/aggregate-function-combinators/avgState'
sidebar_label: avgState
description: 'Пример использования комбинирования avgState'
title: avgState
keywords: ['avg', 'state', 'combinator', 'examples', 'avgState']
doc_type: reference
---
# avgState {#avgState}

## Описание {#description}

Комбинатор [`State`](/sql-reference/aggregate-functions/combinators#-state) 
может быть применён к функции [`avg`](/sql-reference/aggregate-functions/reference/avg) 
для получения промежуточного состояния типа `AggregateFunction(avg, T)`, где 
`T` — это указанный тип для среднего значения.

## Пример использования {#example-usage}

В этом примере мы рассмотрим, как можно использовать тип `AggregateFunction`, 
вместе с функцией `avgState` для агрегации данных о трафике веб-сайта.

Сначала создайте исходную таблицу для данных о трафике веб-сайта:

```sql
CREATE TABLE raw_page_views
(
    page_id UInt32,
    page_name String,
    response_time_ms UInt32,  -- Page response time in milliseconds
    viewed_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY (page_id, viewed_at);
```

Создайте агрегирующую таблицу, которая будет хранить средние времена ответа. Обратите внимание, что 
`avg` не может использовать тип `SimpleAggregateFunction`, так как ему требуется сложное 
состояние (сумма и количество). Поэтому мы используем тип `AggregateFunction`:

```sql
CREATE TABLE page_performance
(
    page_id UInt32,
    page_name String,
    avg_response_time AggregateFunction(avg, UInt32)  -- Stores the state needed for avg calculation
)
ENGINE = AggregatingMergeTree()
ORDER BY page_id;
```

Создайте инкрементное материализованное представление, которое будет действовать как триггер вставки для 
новых данных и хранить промежуточные данные состояния в целевой таблице, определённой выше:

```sql
CREATE MATERIALIZED VIEW page_performance_mv
TO page_performance
AS SELECT
    page_id,
    page_name,
    avgState(response_time_ms) AS avg_response_time  -- Using -State combinator
FROM raw_page_views
GROUP BY page_id, page_name;
```

Вставьте некоторые начальные данные в исходную таблицу, создавая часть на диске:

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
    (1, 'Homepage', 120),
    (1, 'Homepage', 135),
    (2, 'Products', 95),
    (2, 'Products', 105),
    (3, 'About', 80),
    (3, 'About', 90);
```

Вставьте ещё некоторые данные, чтобы создать вторую часть на диске:

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
(1, 'Homepage', 150),
(2, 'Products', 110),
(3, 'About', 70),
(4, 'Contact', 60),
(4, 'Contact', 65);
```

Просмотрите целевую таблицу `page_performance`:

```sql
SELECT 
    page_id,
    page_name,
    avg_response_time,
    toTypeName(avg_response_time)
FROM page_performance
```

```response
┌─page_id─┬─page_name─┬─avg_response_time─┬─toTypeName(avg_response_time)──┐
│       1 │ Homepage  │ �                 │ AggregateFunction(avg, UInt32) │
│       2 │ Products  │ �                 │ AggregateFunction(avg, UInt32) │
│       3 │ About     │ �                 │ AggregateFunction(avg, UInt32) │
│       1 │ Homepage  │ �                 │ AggregateFunction(avg, UInt32) │
│       2 │ Products  │ n                 │ AggregateFunction(avg, UInt32) │
│       3 │ About     │ F                 │ AggregateFunction(avg, UInt32) │
│       4 │ Contact   │ }                 │ AggregateFunction(avg, UInt32) │
└─────────┴───────────┴───────────────────┴────────────────────────────────┘
```

Обратите внимание, что колонка `avg_response_time` имеет тип `AggregateFunction(avg, UInt32)` 
и хранит информацию о промежуточном состоянии. Также обратите внимание, что строки данных для 
`avg_response_time` не полезны для нас, и мы видим странные текстовые символы, такие как `�, n, F, }`. Это попытка терминала отобразить двоичные данные как текст. 
Причина этому заключается в том, что типы `AggregateFunction` хранят своё состояние в 
двоичном формате, оптимизированном для эффективного хранения и вычисления, а не для 
человеческой читаемости. Это двоичное состояние содержит всю информацию, необходимую для 
подсчёта среднего.

Чтобы использовать его, воспользуйтесь комбинатором `Merge`:

```sql
SELECT
    page_id,
    page_name,
    avgMerge(avg_response_time) AS average_response_time_ms
FROM page_performance
GROUP BY page_id, page_name
ORDER BY page_id;
```

Теперь мы видим правильные средние значения:

```response
┌─page_id─┬─page_name─┬─average_response_time_ms─┐
│       1 │ Homepage  │                      135 │
│       2 │ Products  │       103.33333333333333 │
│       3 │ About     │                       80 │
│       4 │ Contact   │                     62.5 │
└─────────┴───────────┴──────────────────────────┘
```

## См. также {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`State`](/sql-reference/aggregate-functions/combinators#-state)