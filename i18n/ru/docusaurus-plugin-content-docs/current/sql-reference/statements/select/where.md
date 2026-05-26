---
description: 'Документация по предложению `WHERE` в ClickHouse'
sidebar_label: 'WHERE'
slug: /sql-reference/statements/select/where
title: 'Предложение WHERE'
doc_type: 'reference'
keywords: ['WHERE']
---

Предложение `WHERE` позволяет отфильтровать данные, полученные из предложения [`FROM`](../../../sql-reference/statements/select/from.md) запроса `SELECT`.

Если используется предложение `WHERE`, за ним должно следовать выражение типа `UInt8`.
Строки, для которых это выражение даёт значение `0`, исключаются из последующих преобразований или из результата.

Выражение после `WHERE` часто используется вместе с [операторами сравнения](/sql-reference/operators#comparison-operators) и [логическими операторами](/sql-reference/operators#operators-for-working-with-data-sets), либо с одной из множества [регулярных функций](/sql-reference/functions/regular-functions).

Для выражения в `WHERE` проверяется возможность использования индексов и отсечения партиций, если это поддерживает используемый движок таблицы.

:::note PREWHERE
Существует также оптимизация фильтрации под названием [`PREWHERE`](../../../sql-reference/statements/select/prewhere.md).
PREWHERE — это оптимизация для более эффективного применения фильтрации.
Она включена по умолчанию, даже если конструкция `PREWHERE` явно не указана.
:::

## Проверка на `NULL` \{#testing-for-null\}

Если вам нужно проверить значение на [`NULL`](/sql-reference/syntax#null), используйте:

* [`IS NULL`](/sql-reference/operators#is_null) или [`isNull`](../../../sql-reference/functions/functions-for-nulls.md#isNull)
* [`IS NOT NULL`](/sql-reference/operators#is_not_null)   или [`isNotNull`](../../../sql-reference/functions/functions-for-nulls.md#isNotNull)

В противном случае выражение с `NULL` никогда не будет истинным.

## Фильтрация данных с помощью логических операторов \{#filtering-data-with-logical-operators\}

Вы можете использовать следующие [логические функции](/sql-reference/functions/logical-functions#and) в сочетании с предложением `WHERE` для объединения нескольких условий:

* [`and()`](/sql-reference/functions/logical-functions#and) или `AND`
* [`not()`](/sql-reference/functions/logical-functions#not) или `NOT`
* [`or()`](/sql-reference/functions/logical-functions#or) или `NOT`
* [`xor()`](/sql-reference/functions/logical-functions#xor)

## Использование столбцов UInt8 в качестве условия \{#using-uint8-columns-as-a-condition\}

В ClickHouse столбцы `UInt8` могут напрямую использоваться в булевых условиях, где `0` — это `false`, а любое ненулевое значение (обычно `1`) — `true`.
Пример этого приведён в разделе [ниже](#example-uint8-column-as-condition).

## Использование операторов сравнения \{#using-comparison-operators\}

Можно использовать следующие [операторы сравнения](/sql-reference/operators#comparison-operators):

| Оператор                | Функция                 | Описание                                      | Пример                          |
| ----------------------- | ----------------------- | --------------------------------------------- | ------------------------------- |
| `a = b`                 | `equals(a, b)`          | Равно                                         | `price = 100`                   |
| `a == b`                | `equals(a, b)`          | Равно (альтернативный синтаксис)              | `price == 100`                  |
| `a != b`                | `notEquals(a, b)`       | Не равно                                      | `category != 'Electronics'`     |
| `a <> b`                | `notEquals(a, b)`       | Не равно (альтернативный синтаксис)           | `category <> 'Electronics'`     |
| `a < b`                 | `less(a, b)`            | Меньше                                        | `price < 200`                   |
| `a <= b`                | `lessOrEquals(a, b)`    | Меньше либо равно                             | `price <= 200`                  |
| `a > b`                 | `greater(a, b)`         | Больше                                        | `price > 500`                   |
| `a >= b`                | `greaterOrEquals(a, b)` | Больше либо равно                             | `price >= 500`                  |
| `a LIKE s`              | `like(a, b)`            | Сопоставление с шаблоном (с учётом регистра)  | `name LIKE '%top%'`             |
| `a NOT LIKE s`          | `notLike(a, b)`         | Несоответствие шаблону (с учётом регистра)    | `name NOT LIKE '%top%'`         |
| `a ILIKE s`             | `ilike(a, b)`           | Сопоставление с шаблоном (без учёта регистра) | `name ILIKE '%LAPTOP%'`         |
| `a BETWEEN b AND c`     | `a >= b AND a <= c`     | Проверка вхождения в диапазон (включительно)  | `price BETWEEN 100 AND 500`     |
| `a NOT BETWEEN b AND c` | `a < b OR a > c`        | Проверка выхода за пределы диапазона          | `price NOT BETWEEN 100 AND 500` |

## Сопоставление с шаблоном и условные выражения \{#pattern-matching-and-conditional-expressions\}

Помимо операторов сравнения, в предложении `WHERE` можно использовать сопоставление с шаблоном и условные выражения.

| Feature     | Syntax                         | Case-Sensitive | Performance | Best For                               |
| ----------- | ------------------------------ | -------------- | ----------- | -------------------------------------- |
| `LIKE`      | `col LIKE '%pattern%'`         | Yes            | Fast        | Точное сопоставление с учётом регистра |
| `ILIKE`     | `col ILIKE '%pattern%'`        | No             | Slower      | Поиск без учёта регистра               |
| `if()`      | `if(cond, a, b)`               | N/A            | Fast        | Простые бинарные условия               |
| `multiIf()` | `multiIf(c1, r1, c2, r2, def)` | N/A            | Fast        | Несколько условий                      |
| `CASE`      | `CASE WHEN ... THEN ... END`   | N/A            | Fast        | Условная логика по стандарту SQL       |

См. раздел [&quot;Сопоставление с шаблоном и условные выражения&quot;](#examples-pattern-matching-and-conditional-expressions) с примерами использования.

## Выражение с литералами, столбцами или подзапросами \{#expressions-with-literals-columns-subqueries\}

Выражение после предложения `WHERE` также может включать [литералы](/sql-reference/syntax#literals), столбцы или подзапросы — вложенные операторы `SELECT`, которые возвращают значения, используемые в условиях.

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

## Примеры \{#examples\}

### Проверка на `NULL` \{#examples-testing-for-null\}

Запросы со значениями `NULL`:

```sql
CREATE TABLE t_null(x Int8, y Nullable(Int8)) ENGINE=MergeTree() ORDER BY x;
INSERT INTO t_null VALUES (1, NULL), (2, 3);

SELECT * FROM t_null WHERE y IS NULL;
SELECT * FROM t_null WHERE y != 0;
```

```response
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```

### Фильтрация данных с помощью логических операторов \{#example-filtering-with-logical-operators\}

Рассмотрим следующую таблицу и данные:

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
```

**1. `AND` - оба условия должны выполняться:**

```sql
SELECT * FROM products
WHERE category = 'Electronics' AND price < 500;
```

```response
   ┌─id─┬─name────┬─price─┬─category────┬─in_stock─┐
1. │  2 │ Mouse   │  25.5 │ Electronics │ true     │
2. │  5 │ Monitor │   350 │ Electronics │ true     │
   └────┴─────────┴───────┴─────────────┴──────────┘
```

**2. `OR` - должно быть истинно хотя бы одно условие:**

```sql
SELECT * FROM products
WHERE category = 'Furniture' OR price > 500;
```

```response
   ┌─id─┬─name───┬──price─┬─category────┬─in_stock─┐
1. │  1 │ Laptop │ 999.99 │ Electronics │ true     │
2. │  3 │ Desk   │    299 │ Furniture   │ false    │
3. │  4 │ Chair  │    150 │ Furniture   │ true     │
4. │  6 │ Lamp   │     45 │ Furniture   │ false    │
   └────┴────────┴────────┴─────────────┴──────────┘
```

**3. `NOT` — Отрицание условия:**

```sql
SELECT * FROM products
WHERE NOT in_stock;
```

```response
   ┌─id─┬─name─┬─price─┬─category──┬─in_stock─┐
1. │  3 │ Desk │   299 │ Furniture │ false    │
2. │  6 │ Lamp │    45 │ Furniture │ false    │
   └────┴──────┴───────┴───────────┴──────────┘
```

**4. `XOR` - Истинным должно быть ровно одно условие (но не оба):**

```sql
SELECT *
FROM products
WHERE xor(price > 200, category = 'Electronics')
```

```response
   ┌─id─┬─name──┬─price─┬─category────┬─in_stock─┐
1. │  2 │ Mouse │  25.5 │ Electronics │ true     │
2. │  3 │ Desk  │   299 │ Furniture   │ false    │
   └────┴───────┴───────┴─────────────┴──────────┘
```

**5. Комбинирование нескольких операторов:**

```sql
SELECT * FROM products
WHERE (category = 'Electronics' OR category = 'Furniture')
  AND in_stock = true
  AND price < 400;
```

```response
   ┌─id─┬─name────┬─price─┬─category────┬─in_stock─┐
1. │  2 │ Mouse   │  25.5 │ Electronics │ true     │
2. │  4 │ Chair   │   150 │ Furniture   │ true     │
3. │  5 │ Monitor │   350 │ Electronics │ true     │
   └────┴─────────┴───────┴─────────────┴──────────┘
```

**6. Использование синтаксиса функции:**

```sql
SELECT * FROM products
WHERE and(or(category = 'Electronics', price > 100), in_stock);
```

```response
   ┌─id─┬─name────┬──price─┬─category────┬─in_stock─┐
1. │  1 │ Laptop  │ 999.99 │ Electronics │ true     │
2. │  2 │ Mouse   │   25.5 │ Electronics │ true     │
3. │  4 │ Chair   │    150 │ Furniture   │ true     │
4. │  5 │ Monitor │    350 │ Electronics │ true     │
   └────┴─────────┴────────┴─────────────┴──────────┘
```

Синтаксис с ключевыми словами SQL (`AND`, `OR`, `NOT`, `XOR`) обычно более читабелен, но синтаксис функций может быть полезен в сложных выражениях или при построении динамических запросов.

### Использование столбцов UInt8 в качестве условия \{#example-uint8-column-as-condition\}

Используя таблицу из [предыдущего примера](#example-filtering-with-logical-operators), вы можете использовать имя столбца напрямую в качестве условия:

```sql
SELECT * FROM products
WHERE in_stock
```

```response
   ┌─id─┬─name────┬──price─┬─category────┬─in_stock─┐
1. │  1 │ Laptop  │ 999.99 │ Electronics │ true     │
2. │  2 │ Mouse   │   25.5 │ Electronics │ true     │
3. │  4 │ Chair   │    150 │ Furniture   │ true     │
4. │  5 │ Monitor │    350 │ Electronics │ true     │
   └────┴─────────┴────────┴─────────────┴──────────┘
```

### Использование операторов сравнения \{#example-using-comparison-operators\}

В приведённых ниже примерах используются таблица и данные из [примера](#example-filtering-with-logical-operators) выше. Результаты опущены для краткости.

**1. Явное равенство с true (`= 1` или `= true`):**

```sql
SELECT * FROM products
WHERE in_stock = true;
-- or
WHERE in_stock = 1;
```

**2. Явное равенство со значением false (`= 0` или `= false`):**

```sql
SELECT * FROM products
WHERE in_stock = false;
-- or
WHERE in_stock = 0;
```

**3. Неравенство (`!= 0` или `!= false`):**

```sql
SELECT * FROM products
WHERE in_stock != false;
-- or
WHERE in_stock != 0;
```

**4. Больше:**

```sql
SELECT * FROM products
WHERE in_stock > 0;
```

**5. Меньше или равно:**

```sql
SELECT * FROM products
WHERE in_stock <= 0;
```

**6. Сочетание с другими условиями:**

```sql
SELECT * FROM products
WHERE in_stock AND price < 400;
```

**7. Использование оператора `IN`:**

В примере ниже `(1, true)` — это [кортеж](/sql-reference/data-types/tuple).

```sql
SELECT * FROM products
WHERE in_stock IN (1, true);
```

Для этого также можно использовать [массив](/sql-reference/data-types/array):

```sql
SELECT * FROM products
WHERE in_stock IN [1, true];
```

**8. Смешивание стилей сравнения:**

```sql
SELECT * FROM products
WHERE category = 'Electronics' AND in_stock = true;
```

### Сопоставление с шаблоном и условные выражения \{#examples-pattern-matching-and-conditional-expressions\}

В примерах ниже используются таблица и данные из [примера](#example-filtering-with-logical-operators), приведённого выше. Результаты опущены для краткости.

#### Примеры LIKE \{#like-examples\}

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
```

#### Примеры ILIKE \{#ilike-examples\}

```sql
-- Case-insensitive search for 'LAPTOP'
SELECT * FROM products WHERE name ILIKE '%laptop%';
-- Result: Laptop

-- Case-insensitive prefix match
SELECT * FROM products WHERE name ILIKE 'l%';
-- Result: Laptop, Lamp
```

#### Примеры IF \{#if-examples\}

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
```

#### Примеры multiIf \{#multiif-examples\}

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
```

#### Примеры CASE \{#case-examples\}

**Простой CASE:**

```sql
-- Different rules per category
SELECT * FROM products
WHERE CASE category
    WHEN 'Electronics' THEN price < 400
    WHEN 'Furniture' THEN in_stock = true
    ELSE false
END;
-- Result: Mouse, Monitor, Chair
```

**CASE с условиями:**

```sql
-- Price-based tiered logic
SELECT * FROM products
WHERE CASE
    WHEN price > 500 THEN in_stock = true
    WHEN price > 100 THEN category = 'Electronics'
    ELSE true
END;
-- Result: Laptop, Monitor, Mouse, Lamp
```