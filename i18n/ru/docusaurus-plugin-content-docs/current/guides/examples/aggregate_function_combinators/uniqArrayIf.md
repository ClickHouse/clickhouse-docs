---
slug: '/examples/aggregate-function-combinators/uniqArrayIf'
title: 'uniqArrayIf'
description: 'Пример использования комбинирования uniqArrayIf'
keywords: ['uniq', 'array', 'if', 'combinator', 'examples', 'uniqArrayIf']
sidebar_label: 'uniqArrayIf'
doc_type: 'reference'
---



# uniqArrayIf {#uniqarrayif}


## Описание {#description}

Комбинаторы [`Array`](/sql-reference/aggregate-functions/combinators#-array) и [`If`](/sql-reference/aggregate-functions/combinators#-if) можно применять к функции [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
для подсчёта количества уникальных значений в массивах для строк, удовлетворяющих
заданному условию, используя агрегатную функцию-комбинатор `uniqArrayIf`.

:::note Комбинаторы `-If` и `-Array` можно комбинировать. Однако `Array` должен идти первым, затем `If`.
:::

Это удобно, когда требуется подсчитать уникальные элементы в массиве на основе
определённых условий без необходимости использовать `arrayJoin`.


## Примеры использования {#example-usage}

### Подсчет уникальных просмотренных товаров по типу сегмента и уровню вовлеченности {#count-unique-products}

В этом примере мы используем таблицу с данными о покупательских сессиях пользователей для подсчета количества уникальных товаров, просмотренных пользователями определенного сегмента с учетом метрики вовлеченности — времени, проведенного в сессии.

```sql title="Запрос"
CREATE TABLE user_shopping_sessions
(
    session_date Date,
    user_segment String,
    viewed_products Array(String),
    session_duration_minutes Int32
) ENGINE = Memory;

INSERT INTO user_shopping_sessions VALUES
    ('2024-01-01', 'new_customer', ['smartphone_x', 'headphones_y', 'smartphone_x'], 12),
    ('2024-01-01', 'returning', ['laptop_z', 'smartphone_x', 'tablet_a'], 25),
    ('2024-01-01', 'new_customer', ['smartwatch_b', 'headphones_y', 'fitness_tracker'], 8),
    ('2024-01-02', 'returning', ['laptop_z', 'external_drive', 'laptop_z'], 30),
    ('2024-01-02', 'new_customer', ['tablet_a', 'keyboard_c', 'tablet_a'], 15),
    ('2024-01-02', 'premium', ['smartphone_x', 'smartwatch_b', 'headphones_y'], 22);

-- Подсчет уникальных просмотренных товаров по типу сегмента и уровню вовлеченности
SELECT
    session_date,
    -- Подсчет уникальных товаров, просмотренных новыми клиентами в длительных сессиях
    uniqArrayIf(viewed_products, user_segment = 'new_customer' AND session_duration_minutes > 10) AS new_customer_engaged_products,
    -- Подсчет уникальных товаров, просмотренных возвращающимися клиентами
    uniqArrayIf(viewed_products, user_segment = 'returning') AS returning_customer_products,
    -- Подсчет уникальных товаров, просмотренных во всех сессиях
    uniqArray(viewed_products) AS total_unique_products
FROM user_shopping_sessions
GROUP BY session_date
ORDER BY session_date
FORMAT Vertical;
```

```response title="Результат"
Row 1:
──────
session_date:                2024-01-01
new_customer⋯ed_products:    2
returning_customer_products: 3
total_unique_products:       6

Row 2:
──────
session_date:                2024-01-02
new_customer⋯ed_products:    2
returning_customer_products: 2
total_unique_products:       7
```


## См. также {#see-also}

- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [Комбинатор `Array`](/sql-reference/aggregate-functions/combinators#-array)
- [Комбинатор `If`](/sql-reference/aggregate-functions/combinators#-if)
