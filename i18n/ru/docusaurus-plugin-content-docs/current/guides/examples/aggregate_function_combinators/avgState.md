---
slug: '/examples/aggregate-function-combinators/avgState'
title: 'avgState'
description: 'Пример использования комбинатора avgState'
keywords: ['avg', 'state', 'combinator', 'examples', 'avgState']
sidebar_label: 'avgState'
---


# avgState {#avgState}

## Описание {#description}

Комбинатор [`State`](/sql-reference/aggregate-functions/combinators#-state) 
можно применить к функции [`avg`](/sql-reference/aggregate-functions/reference/avg), 
чтобы получить промежуточное состояние типа `AggregateFunction(avg, T)`, где
`T` — это указанный тип для среднего.

## Пример использования {#example-usage}

В этом примере мы рассмотрим, как можно использовать тип `AggregateFunction`, 
вместе с функцией `avgState`, для агрегации данных о трафике сайта.

Сначала создайте исходную таблицу для данных о трафике сайта:

```sql
CREATE TABLE raw_page_views
(
    page_id UInt32,
    page_name String,
    response_time_ms UInt32,  -- Время отклика страницы в миллисекундах
    viewed_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY (page_id, viewed_at);
```

Создайте агрегатную таблицу, которая будет хранить средние времена отклика. Обратите внимание, что 
`avg` не может использовать тип `SimpleAggregateFunction`, так как он требует сложного 
состояния (сумму и количество). Поэтому мы используем тип `AggregateFunction`:

```sql
CREATE TABLE page_performance
(
    page_id UInt32,
    page_name String,
    avg_response_time AggregateFunction(avg, UInt32)  -- Хранит состояние, необходимое для расчёта avg
)
ENGINE = AggregatingMergeTree()
ORDER BY page_id;
```

Создайте инкрементное материализованное представление, которое будет действовать как триггер вставки для 
новых данных и хранить промежуточные состояния в целевой таблице, определённой выше:

```sql
CREATE MATERIALIZED VIEW page_performance_mv
TO page_performance
AS SELECT
    page_id,
    page_name,
    avgState(response_time_ms) AS avg_response_time  -- Использование комбинатора -State
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

Вставьте еще данных, чтобы создать вторую часть на диске:

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
(1, 'Homepage', 150),
(2, 'Products', 110),
(3, 'About', 70),
(4, 'Contact', 60),
(4, 'Contact', 65);
```

Изучите целевую таблицу `page_performance`:

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
и хранит промежуточную информацию о состоянии. Также обратите внимание, что данные строки для 
`avg_response_time` нам не полезны, и мы видим странные текстовые символы, такие как `�, n, F, }`. Это попытка терминала отобразить двоичные данные в текстовом формате. 
Причина этого в том, что типы `AggregateFunction` хранят своё состояние в двоичном формате, оптимизированном для эффективного хранения и вычислений, а не для 
читаемости человеком. Это двоичное состояние содержит всю информацию, необходимую для 
вычисления среднего.

Чтобы использовать это, воспользуйтесь комбинатором `Merge`:

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
