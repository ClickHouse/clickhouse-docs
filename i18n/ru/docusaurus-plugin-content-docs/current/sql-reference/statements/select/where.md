---
description: 'Документация по условию `WHERE` в ClickHouse'
sidebar_label: 'WHERE'
slug: /sql-reference/statements/select/where
title: 'Условие WHERE'
doc_type: 'reference'
keywords: ['WHERE']
---



# Оператор WHERE

Оператор `WHERE` позволяет фильтровать данные, полученные из оператора [`FROM`](../../../sql-reference/statements/select/from.md) в `SELECT`.

Если указан оператор `WHERE`, за ним должно следовать выражение типа `UInt8`.
Строки, для которых это выражение даёт значение `0`, исключаются из дальнейших преобразований или из результата.

Выражение после оператора `WHERE` часто используется с [операторами сравнения](/sql-reference/operators#comparison-operators) и [логическими операторами](/sql-reference/operators#operators-for-working-with-data-sets), а также с одной из множества [регулярных функций](/sql-reference/functions/regular-functions).

Выражение `WHERE` также анализируется с точки зрения возможности использования индексов и отсечения партиций, если движок базовой таблицы это поддерживает.

:::note PREWHERE
Существует также оптимизация фильтрации под названием [`PREWHERE`](../../../sql-reference/statements/select/prewhere.md).
PREWHERE — это оптимизация для более эффективного применения фильтрации.
Она включена по умолчанию, даже если оператор `PREWHERE` явно не указан.
:::



## Проверка на `NULL` {#testing-for-null}

Если необходимо проверить значение на [`NULL`](/sql-reference/syntax#null), используйте:

- [`IS NULL`](/sql-reference/operators#is_null) или [`isNull`](../../../sql-reference/functions/functions-for-nulls.md#isNull)
- [`IS NOT NULL`](/sql-reference/operators#is_not_null) или [`isNotNull`](../../../sql-reference/functions/functions-for-nulls.md#isNotNull)

В противном случае выражение с `NULL` никогда не будет истинным.


## Фильтрация данных с помощью логических операторов {#filtering-data-with-logical-operators}

Для объединения нескольких условий можно использовать следующие [логические функции](/sql-reference/functions/logical-functions#and) вместе с предложением `WHERE`:

- [`and()`](/sql-reference/functions/logical-functions#and) or `AND`
- [`not()`](/sql-reference/functions/logical-functions#not) or `NOT`
- [`or()`](/sql-reference/functions/logical-functions#or) или `OR`
- [`xor()`](/sql-reference/functions/logical-functions#xor)


## Использование столбцов UInt8 в качестве условия {#using-uint8-columns-as-a-condition}

В ClickHouse столбцы типа `UInt8` можно использовать непосредственно в качестве логических условий: `0` интерпретируется как `false`, а любое ненулевое значение (обычно `1`) — как `true`.
Пример использования приведён в разделе [ниже](#example-uint8-column-as-condition).


## Использование операторов сравнения {#using-comparison-operators}

Можно использовать следующие [операторы сравнения](/sql-reference/operators#comparison-operators):

| Оператор                | Функция                 | Описание                              | Пример                          |
| ----------------------- | ----------------------- | ------------------------------------- | ------------------------------- |
| `a = b`                 | `equals(a, b)`          | Равно                                 | `price = 100`                   |
| `a == b`                | `equals(a, b)`          | Равно (альтернативный синтаксис)      | `price == 100`                  |
| `a != b`                | `notEquals(a, b)`       | Не равно                              | `category != 'Electronics'`     |
| `a <> b`                | `notEquals(a, b)`       | Не равно (альтернативный синтаксис)   | `category <> 'Electronics'`     |
| `a < b`                 | `less(a, b)`            | Меньше                                | `price < 200`                   |
| `a <= b`                | `lessOrEquals(a, b)`    | Меньше или равно                      | `price <= 200`                  |
| `a > b`                 | `greater(a, b)`         | Больше                                | `price > 500`                   |
| `a >= b`                | `greaterOrEquals(a, b)` | Больше или равно                      | `price >= 500`                  |
| `a LIKE s`              | `like(a, b)`            | Сопоставление с шаблоном (с учётом регистра)     | `name LIKE '%top%'`             |
| `a NOT LIKE s`          | `notLike(a, b)`         | Несоответствие шаблону (с учётом регистра) | `name NOT LIKE '%top%'`         |
| `a ILIKE s`             | `ilike(a, b)`           | Сопоставление с шаблоном (без учёта регистра)   | `name ILIKE '%LAPTOP%'`         |
| `a BETWEEN b AND c`     | `a >= b AND a <= c`     | Проверка диапазона (включительно)               | `price BETWEEN 100 AND 500`     |
| `a NOT BETWEEN b AND c` | `a < b OR a > c`        | Проверка вне диапазона                   | `price NOT BETWEEN 100 AND 500` |


## Сопоставление с шаблоном и условные выражения {#pattern-matching-and-conditional-expressions}

Помимо операторов сравнения, в предложении `WHERE` можно использовать сопоставление с шаблоном и условные выражения.

| Функция     | Синтаксис                      | Учет регистра | Производительность | Оптимально для                 |
| ----------- | ------------------------------ | -------------- | ----------- | ------------------------------ |
| `LIKE`      | `col LIKE '%pattern%'`         | Да            | Быстро        | Точное сопоставление с учетом регистра    |
| `ILIKE`     | `col ILIKE '%pattern%'`        | Нет             | Медленнее      | Поиск без учета регистра     |
| `if()`      | `if(cond, a, b)`               | Н/Д            | Быстро        | Простые бинарные условия       |
| `multiIf()` | `multiIf(c1, r1, c2, r2, def)` | Н/Д            | Быстро        | Множественные условия            |
| `CASE`      | `CASE WHEN ... THEN ... END`   | Н/Д            | Быстро        | Условная логика стандарта SQL |

Примеры использования см. в разделе ["Сопоставление с шаблоном и условные выражения"](#examples-pattern-matching-and-conditional-expressions).


## Выражения с литералами, столбцами или подзапросами {#expressions-with-literals-columns-subqueries}

Выражение, следующее за предложением `WHERE`, также может включать [литералы](/sql-reference/syntax#literals), столбцы или подзапросы — вложенные операторы `SELECT`, возвращающие значения, используемые в условиях.

| Тип          | Определение                  | Вычисление               | Производительность | Пример                     |
| ------------ | ---------------------------- | ------------------------ | ------------------ | -------------------------- |
| **Литерал**  | Фиксированное константное значение | Время написания запроса | Наивысшая          | `WHERE price > 100`        |
| **Столбец**  | Ссылка на данные таблицы     | На каждую строку         | Высокая            | `WHERE price > cost`       |
| **Подзапрос** | Вложенный SELECT            | Время выполнения запроса | Варьируется        | `WHERE id IN (SELECT ...)` |

Вы можете комбинировать литералы, столбцы и подзапросы в сложных условиях:

```sql
-- Литерал + Столбец
WHERE price > 100 AND category = 'Electronics'

-- Столбец + Подзапрос
WHERE price > (SELECT AVG(price) FROM products) AND in_stock = true

-- Литерал + Столбец + Подзапрос
WHERE category = 'Electronics'
  AND price < 500
  AND id IN (SELECT product_id FROM bestsellers)

```


-- Все три с логическими операторами
WHERE (price > 100 OR category IN (SELECT category FROM featured))
AND in_stock = true
AND name LIKE '%Special%'

````
## Примеры {#examples}

### Проверка на `NULL` {#examples-testing-for-null}

Запросы со значениями `NULL`:

```sql
CREATE TABLE t_null(x Int8, y Nullable(Int8)) ENGINE=MergeTree() ORDER BY x;
INSERT INTO t_null VALUES (1, NULL), (2, 3);

SELECT * FROM t_null WHERE y IS NULL;
SELECT * FROM t_null WHERE y != 0;
````

```response
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```

### Фильтрация данных с помощью логических операторов {#example-filtering-with-logical-operators}

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

**1. `AND` — оба условия должны быть истинными:**

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

**2. `OR` — хотя бы одно условие должно быть истинным:**

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

**3. `NOT` — инвертирует условие:**

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

**4. `XOR` — ровно одно условие должно быть истинным (но не оба):**

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

**6. Использование функционального синтаксиса:**

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

Синтаксис с ключевыми словами SQL (`AND`, `OR`, `NOT`, `XOR`) обычно более читаем, однако функциональный синтаксис может быть полезен в сложных выражениях или при построении динамических запросов.

### Использование столбцов UInt8 в качестве условия {#example-uint8-column-as-condition}

Используя таблицу из [предыдущего примера](#example-filtering-with-logical-operators), можно использовать имя столбца непосредственно в качестве условия:

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

### Использование операторов сравнения {#example-using-comparison-operators}

В приведенных ниже примерах используются таблица и данные из [примера](#example-filtering-with-logical-operators) выше. Результаты опущены для краткости.

**1. Явное сравнение с true (`= 1` или `= true`):**

```sql
SELECT * FROM products
WHERE in_stock = true;
-- или
WHERE in_stock = 1;
```

**2. Явное сравнение с false (`= 0` или `= false`):**

```sql
SELECT * FROM products
WHERE in_stock = false;
-- или
WHERE in_stock = 0;
```

**3. Неравенство (`!= 0` или `!= false`):**

```sql
SELECT * FROM products
WHERE in_stock != false;
-- или
WHERE in_stock != 0;
```

**4. Больше чем:**

```sql
SELECT * FROM products
WHERE in_stock > 0;
```

**5. Меньше или равно:**

```sql
SELECT * FROM products
WHERE in_stock <= 0;
```

**6. Комбинирование с другими условиями:**

```sql
SELECT * FROM products
WHERE in_stock AND price < 400;
```

**7. Использование оператора `IN`:**

В приведенном ниже примере `(1, true)` является [кортежем](/sql-reference/data-types/tuple).

```sql
SELECT * FROM products
WHERE in_stock IN (1, true);
```

Также можно использовать [массив](/sql-reference/data-types/array):

```sql
SELECT * FROM products
WHERE in_stock IN [1, true];
```

**8. Смешивание стилей сравнения:**

```sql
SELECT * FROM products
WHERE category = 'Electronics' AND in_stock = true;
```

### Сопоставление с шаблоном и условные выражения {#examples-pattern-matching-and-conditional-expressions}

В приведенных ниже примерах используются таблица и данные из [примера](#example-filtering-with-logical-operators) выше. Результаты опущены для краткости.

#### Примеры LIKE {#like-examples}


```sql
-- Найти продукты с буквой 'o' в названии
SELECT * FROM products WHERE name LIKE '%o%';
-- Результат: Laptop, Monitor

-- Найти продукты, начинающиеся с 'L'
SELECT * FROM products WHERE name LIKE 'L%';
-- Результат: Laptop, Lamp

-- Найти продукты с названием ровно из 4 символов
SELECT * FROM products WHERE name LIKE '____';
-- Результат: Desk, Lamp
```

#### Примеры ILIKE {#ilike-examples}

```sql
-- Поиск 'LAPTOP' без учёта регистра
SELECT * FROM products WHERE name ILIKE '%laptop%';
-- Результат: Laptop

-- Поиск по префиксу без учёта регистра
SELECT * FROM products WHERE name ILIKE 'l%';
-- Результат: Laptop, Lamp
```

#### Примеры IF {#if-examples}

```sql
-- Различные пороговые значения цены по категориям
SELECT * FROM products
WHERE if(category = 'Electronics', price < 500, price < 200);
-- Результат: Mouse, Chair, Monitor
-- (Электроника дешевле $500 ИЛИ Мебель дешевле $200)

-- Фильтрация по статусу наличия
SELECT * FROM products
WHERE if(in_stock, price > 100, true);
-- Результат: Laptop, Chair, Monitor, Desk, Lamp
-- (Товары в наличии дороже $100 ИЛИ все товары не в наличии)
```

#### Примеры multiIf {#multiif-examples}

```sql
-- Множественные условия на основе категорий
SELECT * FROM products
WHERE multiIf(
    category = 'Electronics', price < 600,
    category = 'Furniture', in_stock = true,
    false
);
-- Результат: Mouse, Monitor, Chair
-- (Электроника < $600 ИЛИ Мебель в наличии)

-- Многоуровневая фильтрация
SELECT * FROM products
WHERE multiIf(
    price > 500, category = 'Electronics',
    price > 100, in_stock = true,
    true
);
-- Результат: Laptop, Chair, Monitor, Lamp
```

#### Примеры CASE {#case-examples}

**Простой CASE:**

```sql
-- Различные правила для каждой категории
SELECT * FROM products
WHERE CASE category
    WHEN 'Electronics' THEN price < 400
    WHEN 'Furniture' THEN in_stock = true
    ELSE false
END;
-- Результат: Mouse, Monitor, Chair
```

**CASE с условиями:**

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
