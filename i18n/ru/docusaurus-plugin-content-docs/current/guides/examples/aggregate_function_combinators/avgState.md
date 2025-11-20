---
slug: '/examples/aggregate-function-combinators/avgState'
title: 'avgState'
description: 'Пример использования комбинатора avgState'
keywords: ['avg', 'state', 'combinator', 'examples', 'avgState']
sidebar_label: 'avgState'
doc_type: 'reference'
---



# avgState {#avgState}


## Описание {#description}

Комбинатор [`State`](/sql-reference/aggregate-functions/combinators#-state)
может применяться к функции [`avg`](/sql-reference/aggregate-functions/reference/avg)
для создания промежуточного состояния типа `AggregateFunction(avg, T)`, где
`T` — тип данных для вычисления среднего значения.


## Пример использования {#example-usage}

В этом примере мы рассмотрим, как использовать тип `AggregateFunction`
вместе с функцией `avgState` для агрегирования данных о трафике веб-сайта.

Сначала создадим исходную таблицу для данных о трафике веб-сайта:

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

Создадим агрегатную таблицу, которая будет хранить средние значения времени отклика. Обратите внимание, что
`avg` не может использовать тип `SimpleAggregateFunction`, так как требует сложного
состояния (суммы и количества). Поэтому мы используем тип `AggregateFunction`:

```sql
CREATE TABLE page_performance
(
    page_id UInt32,
    page_name String,
    avg_response_time AggregateFunction(avg, UInt32)  -- Хранит состояние, необходимое для вычисления avg
)
ENGINE = AggregatingMergeTree()
ORDER BY page_id;
```

Создадим инкрементальное материализованное представление, которое будет действовать как триггер вставки для
новых данных и сохранять промежуточные данные состояния в целевой таблице, определенной выше:

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

Вставим начальные данные в исходную таблицу, создав часть на диске:

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
    (1, 'Homepage', 120),
    (1, 'Homepage', 135),
    (2, 'Products', 95),
    (2, 'Products', 105),
    (3, 'About', 80),
    (3, 'About', 90);
```

Вставим еще данные, чтобы создать вторую часть на диске:

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
(1, 'Homepage', 150),
(2, 'Products', 110),
(3, 'About', 70),
(4, 'Contact', 60),
(4, 'Contact', 65);
```

Изучим целевую таблицу `page_performance`:

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

Обратите внимание, что столбец `avg_response_time` имеет тип `AggregateFunction(avg, UInt32)`
и хранит информацию о промежуточном состоянии. Также обратите внимание, что данные строк для
`avg_response_time` не представляют для нас ценности, и мы видим странные текстовые символы, такие
как `�, n, F, }`. Это попытка терминала отобразить двоичные данные в виде текста.
Причина этого в том, что типы `AggregateFunction` хранят свое состояние в
двоичном формате, который оптимизирован для эффективного хранения и вычислений, а не для
читаемости человеком. Это двоичное состояние содержит всю информацию, необходимую для
вычисления среднего значения.

Чтобы использовать его, примените комбинатор `Merge`:

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
│       1 │ Главная   │                      135 │
│       2 │ Продукты  │       103.33333333333333 │
│       3 │ О нас     │                       80 │
│       4 │ Контакты  │                     62.5 │
└─────────┴───────────┴──────────────────────────┘
```


## См. также {#see-also}

- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`State`](/sql-reference/aggregate-functions/combinators#-state)
