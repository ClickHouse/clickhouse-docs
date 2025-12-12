---
description: 'Документация по оператору `WHERE` в ClickHouse'
sidebar_label: 'WHERE'
slug: /sql-reference/statements/select/where
title: 'Оператор WHERE'
doc_type: 'reference'
keywords: ['WHERE']
---

# Условие WHERE {#where-clause}

Условие `WHERE` позволяет отфильтровать данные, полученные из предложения [`FROM`](../../../sql-reference/statements/select/from.md) запроса `SELECT`.

Если используется условие `WHERE`, за ним должно следовать выражение типа `UInt8`.
Строки, для которых это выражение даёт значение `0`, исключаются из последующих преобразований или из результата.

Выражение после `WHERE` часто используется вместе с [операторами сравнения](/sql-reference/operators#comparison-operators) и [логическими операторами](/sql-reference/operators#operators-for-working-with-data-sets), либо с одной из множества [регулярных функций](/sql-reference/functions/regular-functions).

Для выражения в `WHERE` проверяется возможность использования индексов и отсечения партиций, если это поддерживает используемый движок таблицы.

:::note PREWHERE
Существует также оптимизация фильтрации под названием [`PREWHERE`](../../../sql-reference/statements/select/prewhere.md).
PREWHERE — это оптимизация для более эффективного применения фильтрации.
Она включена по умолчанию, даже если конструкция `PREWHERE` явно не указана.
:::

## Проверка на `NULL` {#testing-for-null}

Если вам нужно проверить значение на [`NULL`](/sql-reference/syntax#null), используйте:
- [`IS NULL`](/sql-reference/operators#is_null) или [`isNull`](../../../sql-reference/functions/functions-for-nulls.md#isNull)
- [`IS NOT NULL`](/sql-reference/operators#is_not_null)   или [`isNotNull`](../../../sql-reference/functions/functions-for-nulls.md#isNotNull)

В противном случае выражение с `NULL` никогда не будет истинным.

## Фильтрация данных с помощью логических операторов {#filtering-data-with-logical-operators}

Вы можете использовать следующие [логические функции](/sql-reference/functions/logical-functions#and) в сочетании с предложением `WHERE` для объединения нескольких условий:

- [`and()`](/sql-reference/functions/logical-functions#and) или `AND`
- [`not()`](/sql-reference/functions/logical-functions#not) или `NOT`
- [`or()`](/sql-reference/functions/logical-functions#or) или `NOT`
- [`xor()`](/sql-reference/functions/logical-functions#xor)

## Использование столбцов UInt8 в качестве условия {#using-uint8-columns-as-a-condition}

В ClickHouse столбцы `UInt8` могут напрямую использоваться в булевых условиях, где `0` — это `false`, а любое ненулевое значение (обычно `1`) — `true`.
Пример этого приведён в разделе [ниже](#example-uint8-column-as-condition).

## Использование операторов сравнения {#using-comparison-operators}

Можно использовать следующие [операторы сравнения](/sql-reference/operators#comparison-operators):

| Оператор | Функция | Описание | Пример |
|----------|----------|-------------|---------|
| `a = b` | `equals(a, b)` | Равно | `price = 100` |
| `a == b` | `equals(a, b)` | Равно (альтернативный синтаксис) | `price == 100` |
| `a != b` | `notEquals(a, b)` | Не равно | `category != 'Electronics'` |
| `a <> b` | `notEquals(a, b)` | Не равно (альтернативный синтаксис) | `category <> 'Electronics'` |
| `a < b` | `less(a, b)` | Меньше | `price < 200` |
| `a <= b` | `lessOrEquals(a, b)` | Меньше либо равно | `price <= 200` |
| `a > b` | `greater(a, b)` | Больше | `price > 500` |
| `a >= b` | `greaterOrEquals(a, b)` | Больше либо равно | `price >= 500` |
| `a LIKE s` | `like(a, b)` | Сопоставление с шаблоном (с учётом регистра) | `name LIKE '%top%'` |
| `a NOT LIKE s` | `notLike(a, b)` | Несоответствие шаблону (с учётом регистра) | `name NOT LIKE '%top%'` |
| `a ILIKE s` | `ilike(a, b)` | Сопоставление с шаблоном (без учёта регистра) | `name ILIKE '%LAPTOP%'` |
| `a BETWEEN b AND c` | `a >= b AND a <= c` | Проверка вхождения в диапазон (включительно) | `price BETWEEN 100 AND 500` |
| `a NOT BETWEEN b AND c` | `a < b OR a > c` | Проверка выхода за пределы диапазона | `price NOT BETWEEN 100 AND 500` |

## Сопоставление по шаблону и условные выражения {#pattern-matching-and-conditional-expressions}

Помимо операторов сравнения, в предложении `WHERE` можно использовать сопоставление по шаблону и условные выражения.

| Feature     | Syntax                         | Case-Sensitive | Performance | Best For                              |
| ----------- | ------------------------------ | -------------- | ----------- | ------------------------------------- |
| `LIKE`      | `col LIKE '%pattern%'`         | Yes            | Fast        | Точное сопоставление с учётом регистра |
| `ILIKE`     | `col ILIKE '%pattern%'`        | No             | Slower      | Поиск без учёта регистра              |
| `if()`      | `if(cond, a, b)`               | N/A            | Fast        | Простые бинарные условия              |
| `multiIf()` | `multiIf(c1, r1, c2, r2, def)` | N/A            | Fast        | Несколько условий                     |
| `CASE`      | `CASE WHEN ... THEN ... END`   | N/A            | Fast        | Условная логика по стандарту SQL      |

См. раздел ["Сопоставление по шаблону и условные выражения"](#examples-pattern-matching-and-conditional-expressions) с примерами использования.

## Выражение с литералами, столбцами или подзапросами {#expressions-with-literals-columns-subqueries}

Выражение после оператора `WHERE` также может включать [литералы](/sql-reference/syntax#literals), столбцы или подзапросы — вложенные операторы `SELECT`, которые возвращают значения, используемые в условиях.

| Type         | Definition                         | Evaluation                  | Performance           | Example                    |
| ------------ | ---------------------------------- | --------------------------- | --------------------- | -------------------------- |
| **Literal**  | Фиксированное константное значение | Во время разбора запроса    | Самое быстрое         | `WHERE price > 100`        |
| **Column**   | Ссылка на данные таблицы           | Для каждой строки           | Быстро                | `WHERE price > cost`       |
| **Subquery** | Вложенный SELECT                   | Во время выполнения запроса | Зависит от подзапроса | `WHERE id IN (SELECT ...)` |

Вы можете комбинировать литералы, столбцы и подзапросы в сложных условиях:

```sql
-- Literal + Column
WHERE price > 100 AND category = 'Electronics'

-- Column + Subquery
WHERE price > (SELECT AVG(price) FROM products) AND in_stock = true

-- Literal + Column + Subquery
WHERE category = 'Electronics' 
  AND price < 500
  AND id IN (SELECT product_id FROM bestsellers)

-- All three with logical operators
WHERE (price > 100 OR category IN (SELECT category FROM featured))
  AND in_stock = true
  AND name LIKE '%Special%'
```

-- Все три условия с логическими операторами
WHERE (price &gt; 100 OR category IN (SELECT category FROM featured))
AND in&#95;stock = true
AND name LIKE &#39;%Special%&#39;

````sql
CREATE TABLE t_null(x Int8, y Nullable(Int8)) ENGINE=MergeTree() ORDER BY x;
INSERT INTO t_null VALUES (1, NULL), (2, 3);

SELECT * FROM t_null WHERE y IS NULL;
SELECT * FROM t_null WHERE y != 0;
```sql
CREATE TABLE t_null(x Int8, y Nullable(Int8)) ENGINE=MergeTree() ORDER BY x;
INSERT INTO t_null VALUES (1, NULL), (2, 3);

SELECT * FROM t_null WHERE y IS NULL;
SELECT * FROM t_null WHERE y != 0;
````response
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```response
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```sql
CREATE TABLE products (
    id UInt32,
    name String,
    price Float32,
    category String,
    in_stock Bool
) ENGINE = MergeTree()
ORDER BY id;

INSERT INTO products VALUES
(1, 'Laptop', 999.99, 'Electronics', true),
(2, 'Mouse', 25.50, 'Electronics', true),
(3, 'Desk', 299.00, 'Furniture', false),
(4, 'Chair', 150.00, 'Furniture', true),
(5, 'Monitor', 350.00, 'Electronics', true),
(6, 'Lamp', 45.00, 'Furniture', false);
```sql
CREATE TABLE products (
    id UInt32,
    name String,
    price Float32,
    category String,
    in_stock Bool
) ENGINE = MergeTree()
ORDER BY id;

INSERT INTO products VALUES
(1, 'Ноутбук', 999.99, 'Электроника', true),
(2, 'Мышь', 25.50, 'Электроника', true),
(3, 'Стол', 299.00, 'Мебель', false),
(4, 'Стул', 150.00, 'Мебель', true),
(5, 'Монитор', 350.00, 'Электроника', true),
(6, 'Лампа', 45.00, 'Мебель', false);
```sql
SELECT * FROM products
WHERE category = 'Electronics' AND price < 500;
```sql
SELECT * FROM products
WHERE category = 'Electronics' AND price < 500;
```response
   ┌─id─┬─name────┬─price─┬─category────┬─in_stock─┐
1. │  2 │ Mouse   │  25.5 │ Electronics │ true     │
2. │  5 │ Monitor │   350 │ Electronics │ true     │
   └────┴─────────┴───────┴─────────────┴──────────┘
```response
   ┌─id─┬─name────┬─price─┬─category────┬─in_stock─┐
1. │  2 │ Mouse   │  25.5 │ Электроника │ true     │
2. │  5 │ Monitor │   350 │ Электроника │ true     │
   └────┴─────────┴───────┴─────────────┴──────────┘
```sql
SELECT * FROM products
WHERE category = 'Furniture' OR price > 500;
```sql
SELECT * FROM products
WHERE category = 'Мебель' OR price > 500;
```response
   ┌─id─┬─name───┬──price─┬─category────┬─in_stock─┐
1. │  1 │ Laptop │ 999.99 │ Electronics │ true     │
2. │  3 │ Desk   │    299 │ Furniture   │ false    │
3. │  4 │ Chair  │    150 │ Furniture   │ true     │
4. │  6 │ Lamp   │     45 │ Furniture   │ false    │
   └────┴────────┴────────┴─────────────┴──────────┘
```response
   ┌─id─┬─name───┬──price─┬─category────┬─in_stock─┐
1. │  1 │ Ноутбук │ 999.99 │ Электроника │ true     │
2. │  3 │ Стол   │    299 │ Мебель      │ false    │
3. │  4 │ Стул   │    150 │ Мебель      │ true     │
4. │  6 │ Лампа  │     45 │ Мебель      │ false    │
   └────┴────────┴────────┴─────────────┴──────────┘
```sql
SELECT * FROM products
WHERE NOT in_stock;
```sql
SELECT * FROM products
WHERE NOT in_stock;
```response
   ┌─id─┬─name─┬─price─┬─category──┬─in_stock─┐
1. │  3 │ Desk │   299 │ Furniture │ false    │
2. │  6 │ Lamp │    45 │ Furniture │ false    │
   └────┴──────┴───────┴───────────┴──────────┘
```response
   ┌─id─┬─name─┬─price─┬─category──┬─in_stock─┐
1. │  3 │ Стол │   299 │ Мебель    │ false    │
2. │  6 │ Лампа│    45 │ Мебель    │ false    │
   └────┴──────┴───────┴───────────┴──────────┘
```sql
SELECT *
FROM products
WHERE xor(price > 200, category = 'Electronics')
```sql
SELECT *
FROM products
WHERE xor(price > 200, category = 'Electronics')
```response
   ┌─id─┬─name──┬─price─┬─category────┬─in_stock─┐
1. │  2 │ Mouse │  25.5 │ Electronics │ true     │
2. │  3 │ Desk  │   299 │ Furniture   │ false    │
   └────┴───────┴───────┴─────────────┴──────────┘
```response
   ┌─id─┬─name──┬─price─┬─category────┬─in_stock─┐
1. │  2 │ Mouse │  25.5 │ Электроника │ true     │
2. │  3 │ Desk  │   299 │ Мебель      │ false    │
   └────┴───────┴───────┴─────────────┴──────────┘
```sql
SELECT * FROM products
WHERE (category = 'Electronics' OR category = 'Furniture')
  AND in_stock = true
  AND price < 400;
```sql
SELECT * FROM products
WHERE (category = 'Электроника' OR category = 'Мебель')
  AND in_stock = true
  AND price < 400;
```response
   ┌─id─┬─name────┬─price─┬─category────┬─in_stock─┐
1. │  2 │ Mouse   │  25.5 │ Electronics │ true     │
2. │  4 │ Chair   │   150 │ Furniture   │ true     │
3. │  5 │ Monitor │   350 │ Electronics │ true     │
   └────┴─────────┴───────┴─────────────┴──────────┘
```response
   ┌─id─┬─name────┬─price─┬─category────┬─in_stock─┐
1. │  2 │ Mouse   │  25.5 │ Электроника │ true     │
2. │  4 │ Chair   │   150 │ Мебель   │ true     │
3. │  5 │ Monitor │   350 │ Электроника │ true     │
   └────┴─────────┴───────┴─────────────┴──────────┘
```sql
SELECT * FROM products
WHERE and(or(category = 'Electronics', price > 100), in_stock);
```sql
SELECT * FROM products
WHERE and(or(category = 'Electronics', price > 100), in_stock);
```response
   ┌─id─┬─name────┬──price─┬─category────┬─in_stock─┐
1. │  1 │ Laptop  │ 999.99 │ Electronics │ true     │
2. │  2 │ Mouse   │   25.5 │ Electronics │ true     │
3. │  4 │ Chair   │    150 │ Furniture   │ true     │
4. │  5 │ Monitor │    350 │ Electronics │ true     │
   └────┴─────────┴────────┴─────────────┴──────────┘
```response
   ┌─id─┬─name────┬──price─┬─category────┬─in_stock─┐
1. │  1 │ Ноутбук  │ 999.99 │ Электроника │ true     │
2. │  2 │ Мышь   │   25.5 │ Электроника │ true     │
3. │  4 │ Стул   │    150 │ Мебель   │ true     │
4. │  5 │ Монитор │    350 │ Электроника │ true     │
   └────┴─────────┴────────┴─────────────┴──────────┘
```sql
SELECT * FROM products
WHERE in_stock
```sql
SELECT * FROM products
WHERE in_stock
```response
   ┌─id─┬─name────┬──price─┬─category────┬─in_stock─┐
1. │  1 │ Laptop  │ 999.99 │ Electronics │ true     │
2. │  2 │ Mouse   │   25.5 │ Electronics │ true     │
3. │  4 │ Chair   │    150 │ Furniture   │ true     │
4. │  5 │ Monitor │    350 │ Electronics │ true     │
   └────┴─────────┴────────┴─────────────┴──────────┘
```response
   ┌─id─┬─name────┬──price─┬─category────┬─in_stock─┐
1. │  1 │ Ноутбук  │ 999.99 │ Электроника │ true     │
2. │  2 │ Мышь   │   25.5 │ Электроника │ true     │
3. │  4 │ Стул   │    150 │ Мебель   │ true     │
4. │  5 │ Монитор │    350 │ Электроника │ true     │
   └────┴─────────┴────────┴─────────────┴──────────┘
```sql
SELECT * FROM products
WHERE in_stock = true;
-- or
WHERE in_stock = 1;
```sql
SELECT * FROM products
WHERE in_stock = true;
-- или
WHERE in_stock = 1;
```sql
SELECT * FROM products
WHERE in_stock = false;
-- or
WHERE in_stock = 0;
```sql
SELECT * FROM products
WHERE in_stock = false;
-- или
WHERE in_stock = 0;
```sql
SELECT * FROM products
WHERE in_stock != false;
-- or
WHERE in_stock != 0;
```sql
SELECT * FROM products
WHERE in_stock != false;
-- или
WHERE in_stock != 0;
```sql
SELECT * FROM products
WHERE in_stock > 0;
```sql
SELECT * FROM products
WHERE in_stock > 0;
```sql
SELECT * FROM products
WHERE in_stock <= 0;
```sql
SELECT * FROM products
WHERE in_stock <= 0;
```sql
SELECT * FROM products
WHERE in_stock AND price < 400;
```sql
SELECT * FROM products
WHERE in_stock AND price < 400;
```sql
SELECT * FROM products
WHERE in_stock IN (1, true);
```sql
SELECT * FROM products
WHERE in_stock IN (1, true);
```sql
SELECT * FROM products
WHERE in_stock IN [1, true];
```sql
SELECT * FROM products
WHERE in_stock IN [1, true];
```sql
SELECT * FROM products
WHERE category = 'Electronics' AND in_stock = true;
```sql
SELECT * FROM products
WHERE category = 'Электроника' AND in_stock = true;
```sql
-- Find products with 'o' in the name
SELECT * FROM products WHERE name LIKE '%o%';
-- Result: Laptop, Monitor

-- Find products starting with 'L'
SELECT * FROM products WHERE name LIKE 'L%';
-- Result: Laptop, Lamp

-- Find products with exactly 4 characters
SELECT * FROM products WHERE name LIKE '____';
-- Result: Desk, Lamp
```sql
-- Найти продукты с буквой 'o' в названии
SELECT * FROM products WHERE name LIKE '%o%';
-- Результат: Laptop, Monitor

-- Найти продукты, начинающиеся с 'L'
SELECT * FROM products WHERE name LIKE 'L%';
-- Результат: Laptop, Lamp

-- Найти продукты с названием из ровно 4 символов
SELECT * FROM products WHERE name LIKE '____';
-- Результат: Desk, Lamp
```sql
-- Case-insensitive search for 'LAPTOP'
SELECT * FROM products WHERE name ILIKE '%laptop%';
-- Result: Laptop

-- Case-insensitive prefix match
SELECT * FROM products WHERE name ILIKE 'l%';
-- Result: Laptop, Lamp
```sql
-- Поиск без учета регистра для 'LAPTOP'
SELECT * FROM products WHERE name ILIKE '%laptop%';
-- Результат: Laptop

-- Совпадение по префиксу без учета регистра
SELECT * FROM products WHERE name ILIKE 'l%';
-- Результат: Laptop, Lamp
```sql
-- Different price thresholds by category
SELECT * FROM products
WHERE if(category = 'Electronics', price < 500, price < 200);
-- Result: Mouse, Chair, Monitor
-- (Electronics under $500 OR Furniture under $200)

-- Filter based on stock status
SELECT * FROM products
WHERE if(in_stock, price > 100, true);
-- Result: Laptop, Chair, Monitor, Desk, Lamp
-- (In stock items over $100 OR all out-of-stock items)
```sql
-- Различные пороговые значения цены по категориям
SELECT * FROM products
WHERE if(category = 'Electronics', price < 500, price < 200);
-- Результат: Mouse, Chair, Monitor
-- (Электроника дешевле $500 ИЛИ Мебель дешевле $200)

-- Фильтрация по статусу наличия на складе
SELECT * FROM products
WHERE if(in_stock, price > 100, true);
-- Результат: Laptop, Chair, Monitor, Desk, Lamp
-- (Товары в наличии дороже $100 ИЛИ все отсутствующие товары)
```sql
-- Multiple category-based conditions
SELECT * FROM products
WHERE multiIf(
    category = 'Electronics', price < 600,
    category = 'Furniture', in_stock = true,
    false
);
-- Result: Mouse, Monitor, Chair
-- (Electronics < $600 OR in-stock Furniture)

-- Tiered filtering
SELECT * FROM products
WHERE multiIf(
    price > 500, category = 'Electronics',
    price > 100, in_stock = true,
    true
);
-- Result: Laptop, Chair, Monitor, Lamp
```sql
-- Множественные условия на основе категорий
SELECT * FROM products
WHERE multiIf(
    category = 'Electronics', price < 600,
    category = 'Furniture', in_stock = true,
    false
);
-- Результат: Mouse, Monitor, Chair
-- (Electronics < $600 ИЛИ Furniture в наличии)

-- Многоуровневая фильтрация
SELECT * FROM products
WHERE multiIf(
    price > 500, category = 'Electronics',
    price > 100, in_stock = true,
    true
);
-- Результат: Laptop, Chair, Monitor, Lamp
```sql
-- Different rules per category
SELECT * FROM products
WHERE CASE category
    WHEN 'Electronics' THEN price < 400
    WHEN 'Furniture' THEN in_stock = true
    ELSE false
END;
-- Result: Mouse, Monitor, Chair
```sql
-- Различные правила для каждой категории
SELECT * FROM products
WHERE CASE category
    WHEN 'Electronics' THEN price < 400
    WHEN 'Furniture' THEN in_stock = true
    ELSE false
END;
-- Результат: Mouse, Monitor, Chair
```sql
-- Price-based tiered logic
SELECT * FROM products
WHERE CASE
    WHEN price > 500 THEN in_stock = true
    WHEN price > 100 THEN category = 'Electronics'
    ELSE true
END;
-- Result: Laptop, Monitor, Mouse, Lamp
```sql
-- Многоуровневая логика на основе цены
SELECT * FROM products
WHERE CASE
    WHEN price > 500 THEN in_stock = true
    WHEN price > 100 THEN category = 'Electronics'
    ELSE true
END;
-- Результат: Laptop, Monitor, Mouse, Lamp
```
