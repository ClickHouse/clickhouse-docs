---
slug: '/examples/aggregate-function-combinators/uniqArrayIf'
title: 'uniqArrayIf'
description: 'Пример использования комбинатора uniqArrayIf'
keywords: ['uniq', 'array', 'if', 'combinator', 'examples', 'uniqArrayIf']
sidebar_label: 'uniqArrayIf'
doc_type: 'reference'
---



# uniqArrayIf {#uniqarrayif}



## Описание {#description}

Комбинаторы [`Array`](/sql-reference/aggregate-functions/combinators#-array) и [`If`](/sql-reference/aggregate-functions/combinators#-if) могут быть применены к функции [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
для подсчёта количества уникальных значений в массивах для строк, удовлетворяющих
условию, с использованием агрегатной функции-комбинатора `uniqArrayIf`.

:::note
-`If` и -`Array` можно комбинировать. Однако сначала должен идти `Array`, затем `If`.
:::

Это полезно, когда нужно посчитать уникальные элементы в массиве на основе 
определённых условий, не используя `arrayJoin`.



## Пример использования {#example-usage}

### Подсчёт уникальных товаров, просмотренных по типу сегмента и уровню вовлечённости {#count-unique-products}

В этом примере мы используем таблицу с данными пользовательских сессий в интернет‑магазине, чтобы подсчитать количество уникальных товаров, просмотренных пользователями определённого сегмента, при этом метрикой вовлечённости является время, проведённое в сессии.

```sql title="Query"
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

-- Подсчёт уникальных просмотренных продуктов по типу сегмента и уровню вовлечённости
SELECT 
    session_date,
    -- Подсчёт уникальных продуктов, просмотренных новыми клиентами в длительных сессиях
    uniqArrayIf(viewed_products, user_segment = 'new_customer' AND session_duration_minutes > 10) AS new_customer_engaged_products,
    -- Подсчёт уникальных продуктов, просмотренных возвращающимися клиентами
    uniqArrayIf(viewed_products, user_segment = 'returning') AS returning_customer_products,
    -- Подсчёт уникальных продуктов, просмотренных во всех сессиях
    uniqArray(viewed_products) AS total_unique_products
FROM user_shopping_sessions
GROUP BY session_date
ORDER BY session_date
FORMAT Vertical;
```

```response title="Response"
Строка 1:
──────
session_date:                2024-01-01
new_customer⋯ed_products:    2
returning_customer_products: 3
total_unique_products:       6

Строка 2:
──────
session_date:                2024-01-02
new_customer⋯ed_products:    2
returning_customer_products: 2
total_unique_products:       7
```


## См. также {#see-also}
- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
