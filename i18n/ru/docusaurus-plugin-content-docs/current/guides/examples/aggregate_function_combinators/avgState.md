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
можно применить к функции [`avg`](/sql-reference/aggregate-functions/reference/avg) 
для получения промежуточного состояния типа `AggregateFunction(avg, T)`, где
`T` — указанный тип для среднего значения.



## Пример использования

В этом примере мы рассмотрим, как можно использовать тип `AggregateFunction`
вместе с функцией `avgState` для агрегирования данных о трафике сайта.

Сначала создайте таблицу-источник с данными о трафике сайта:

```sql
CREATE TABLE raw_page_views
(
    page_id UInt32,
    page_name String,
    response_time_ms UInt32,  -- Время ответа страницы в миллисекундах
    viewed_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY (page_id, viewed_at);
```

Создайте агрегатную таблицу, которая будет хранить среднее время отклика. Обратите внимание, что
`avg` не может использовать тип `SimpleAggregateFunction`, так как для него требуется сложное
состояние (сумма и счетчик). Поэтому мы используем тип `AggregateFunction`:

```sql
CREATE TABLE page_performance
(
    page_id UInt32,
    page_name String,
    avg_response_time AggregateFunction(avg, UInt32)  -- Хранит состояние для вычисления среднего значения
)
ENGINE = AggregatingMergeTree()
ORDER BY page_id;
```

Создайте инкрементальное материализованное представление, которое будет выступать в роли триггера вставки для
новых данных и сохранять данные промежуточного состояния в целевой таблице, указанной выше:

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

Вставьте начальные данные в исходную таблицу, чтобы на диске создалась часть:

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
    (1, 'Главная', 120),
    (1, 'Главная', 135),
    (2, 'Продукты', 95),
    (2, 'Продукты', 105),
    (3, 'О нас', 80),
    (3, 'О нас', 90);
```

Добавьте ещё немного данных, чтобы создать вторую часть на диске:

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
(1, 'Главная', 150),
(2, 'Продукты', 110),
(3, 'О нас', 70),
(4, 'Контакты', 60),
(4, 'Контакты', 65);
```

Ознакомьтесь с целевой таблицей `page_performance`:

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
│       1 │ Главная страница  │ �                 │ AggregateFunction(avg, UInt32) │
│       2 │ Продукция  │ �                 │ AggregateFunction(avg, UInt32) │
│       3 │ О компании     │ �                 │ AggregateFunction(avg, UInt32) │
│       1 │ Главная страница  │ �                 │ AggregateFunction(avg, UInt32) │
│       2 │ Продукция  │ n                 │ AggregateFunction(avg, UInt32) │
│       3 │ О компании     │ F                 │ AggregateFunction(avg, UInt32) │
│       4 │ Контакты   │ }                 │ AggregateFunction(avg, UInt32) │
└─────────┴───────────┴───────────────────┴────────────────────────────────┘
```

Обратите внимание, что столбец `avg_response_time` имеет тип `AggregateFunction(avg, UInt32)`
и хранит промежуточные данные состояния. Также обратите внимание, что данные строк
для `avg_response_time` не представляют для нас ценности, и мы видим странные символы,
такие как `�, n, F, }`. Это попытка терминала отобразить двоичные данные как текст.
Причина в том, что типы `AggregateFunction` хранят своё состояние в двоичном формате,
оптимизированном для эффективного хранения и вычислений, а не для удобства чтения человеком.
Это двоичное состояние содержит всю информацию, необходимую для вычисления среднего значения.

Чтобы воспользоваться этим состоянием, используйте комбинатор `Merge`:

```sql
SELECT
    page_id,
    page_name,
    avgMerge(avg_response_time) AS average_response_time_ms
FROM page_performance
GROUP BY page_id, page_name
ORDER BY page_id;
```

Теперь мы видим корректные средние значения:


```response
┌─page_id─┬─page_name─┬─average_response_time_ms─┐
│       1 │ Главная   │                      135 │
│       2 │ Продукты  │       103.33333333333333 │
│       3 │ О нас     │                       80 │
│       4 │ Контакты  │                     62.5 │
└─────────┴───────────┴──────────────────────────┘
```


## Смотрите также {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`State`](/sql-reference/aggregate-functions/combinators#-state)
