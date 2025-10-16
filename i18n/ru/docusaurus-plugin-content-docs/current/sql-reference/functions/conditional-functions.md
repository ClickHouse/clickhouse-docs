---
slug: '/sql-reference/functions/conditional-functions'
sidebar_label: Условные
description: 'Документация для Conditional Functions'
title: 'Условные функции'
doc_type: reference
---
# Условные функции

## Обзор {#overview}

### Использование условных результатов напрямую {#using-conditional-results-directly}

Условные функции всегда возвращают `0`, `1` или `NULL`. Поэтому вы можете использовать условные результаты напрямую следующим образом:

```sql
SELECT left < right AS is_small
FROM LEFT_RIGHT

┌─is_small─┐
│     ᴺᵁᴸᴸ │
│        1 │
│        0 │
│        0 │
│     ᴺᵁᴸᴸ │
└──────────┘
```

### Значения NULL в условных выражениях {#null-values-in-conditionals}

Когда в условных выражениях участвуют значения `NULL`, результат также будет `NULL`.

```sql
SELECT
    NULL < 1,
    2 < NULL,
    NULL < NULL,
    NULL = NULL

┌─less(NULL, 1)─┬─less(2, NULL)─┬─less(NULL, NULL)─┬─equals(NULL, NULL)─┐
│ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ             │ ᴺᵁᴸᴸ               │
└───────────────┴───────────────┴──────────────────┴────────────────────┘
```

Поэтому вам следует тщательно конструировать ваши запросы, если типы являются `Nullable`.

Следующий пример демонстрирует это, не добавляя условие равенства к `multiIf`.

```sql
SELECT
    left,
    right,
    multiIf(left < right, 'left is smaller', left > right, 'right is smaller', 'Both equal') AS faulty_result
FROM LEFT_RIGHT

┌─left─┬─right─┬─faulty_result────┐
│ ᴺᵁᴸᴸ │     4 │ Both equal       │
│    1 │     3 │ left is smaller  │
│    2 │     2 │ Both equal       │
│    3 │     1 │ right is smaller │
│    4 │  ᴺᵁᴸᴸ │ Both equal       │
└──────┴───────┴──────────────────┘
```

### Оператор CASE {#case-statement}

Выражение CASE в ClickHouse предоставляет логику условий, аналогичную оператору CASE в SQL. Оно оценивает условия и возвращает значения на основе первого совпадающего условия.

ClickHouse поддерживает две формы CASE:

1. `CASE WHEN ... THEN ... ELSE ... END`
   <br/>
   Эта форма позволяет полную гибкость и реализуется внутри с использованием функции [multiIf](/sql-reference/functions/conditional-functions#multiIf). Каждое условие оценивается независимо, и выражения могут включать неконстантные значения.

```sql
SELECT
    number,
    CASE
        WHEN number % 2 = 0 THEN number + 1
        WHEN number % 2 = 1 THEN number * 10
        ELSE number
    END AS result
FROM system.numbers
WHERE number < 5;

-- is translated to
SELECT
    number,
    multiIf((number % 2) = 0, number + 1, (number % 2) = 1, number * 10, number) AS result
FROM system.numbers
WHERE number < 5

┌─number─┬─result─┐
│      0 │      1 │
│      1 │     10 │
│      2 │      3 │
│      3 │     30 │
│      4 │      5 │
└────────┴────────┘

5 rows in set. Elapsed: 0.002 sec.
```

2. `CASE <expr> WHEN <val1> THEN ... WHEN <val2> THEN ... ELSE ... END`
   <br/>
   Эта более компактная форма оптимизирована для сопоставления с константными значениями и использует `caseWithExpression()`.

Например, следующее выражение является действительным:

```sql
SELECT
    number,
    CASE number
        WHEN 0 THEN 100
        WHEN 1 THEN 200
        ELSE 0
    END AS result
FROM system.numbers
WHERE number < 3;

-- is translated to

SELECT
    number,
    caseWithExpression(number, 0, 100, 1, 200, 0) AS result
FROM system.numbers
WHERE number < 3

┌─number─┬─result─┐
│      0 │    100 │
│      1 │    200 │
│      2 │      0 │
└────────┴────────┘

3 rows in set. Elapsed: 0.002 sec.
```

Эта форма также не требует, чтобы возвращаемые выражения были константами.

```sql
SELECT
    number,
    CASE number
        WHEN 0 THEN number + 1
        WHEN 1 THEN number * 10
        ELSE number
    END
FROM system.numbers
WHERE number < 3;

-- is translated to

SELECT
    number,
    caseWithExpression(number, 0, number + 1, 1, number * 10, number)
FROM system.numbers
WHERE number < 3

┌─number─┬─caseWithExpr⋯0), number)─┐
│      0 │                        1 │
│      1 │                       10 │
│      2 │                        2 │
└────────┴──────────────────────────┘

3 rows in set. Elapsed: 0.001 sec.
```

#### Предостережения  {#caveats}

ClickHouse определяет тип результата выражения CASE (или его внутреннего эквивалента, такого как `multiIf`) перед оценкой любых условий. Это важно, когда возвращаемые выражения различаются по типу, например, по различным временным зонам или числовым типам.

- Тип результата выбирается на основе наибольшего совместимого типа среди всех ветвей.
- Как только этот тип выбран, все остальные ветви неявно приводятся к нему - даже если их логика никогда не будет выполнена во время выполнения.
- Для таких типов, как DateTime64, где временная зона является частью сигнатуры типа, это может привести к неожиданному поведению: первая встреченная временная зона может использоваться для всех ветвей, даже когда другие ветви указывают на разные временные зоны.

Например, ниже все строки возвращают метку времени в временной зоне первой подходящей ветви, т.е. `Asia/Kolkata`.

```sql
SELECT
    number,
    CASE
        WHEN number = 0 THEN fromUnixTimestamp64Milli(0, 'Asia/Kolkata')
        WHEN number = 1 THEN fromUnixTimestamp64Milli(0, 'America/Los_Angeles')
        ELSE fromUnixTimestamp64Milli(0, 'UTC')
    END AS tz
FROM system.numbers
WHERE number < 3;

-- is translated to

SELECT
    number,
    multiIf(number = 0, fromUnixTimestamp64Milli(0, 'Asia/Kolkata'), number = 1, fromUnixTimestamp64Milli(0, 'America/Los_Angeles'), fromUnixTimestamp64Milli(0, 'UTC')) AS tz
FROM system.numbers
WHERE number < 3

┌─number─┬──────────────────────tz─┐
│      0 │ 1970-01-01 05:30:00.000 │
│      1 │ 1970-01-01 05:30:00.000 │
│      2 │ 1970-01-01 05:30:00.000 │
└────────┴─────────────────────────┘

3 rows in set. Elapsed: 0.011 sec.
```

Здесь ClickHouse видит несколько типов возвратов `DateTime64(3, <timezone>)`. Он выводит общий тип как `DateTime64(3, 'Asia/Kolkata')`, поскольку это первый тип, который он видит, неявно приводя другие ветви к этому типу.

Это можно решить, преобразовав в строку, чтобы сохранить желаемое форматирование временной зоны:

```sql
SELECT
    number,
    multiIf(
        number = 0, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'Asia/Kolkata'),
        number = 1, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'America/Los_Angeles'),
        formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'UTC')
    ) AS tz
FROM system.numbers
WHERE number < 3;

-- is translated to

SELECT
    number,
    multiIf(number = 0, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'Asia/Kolkata'), number = 1, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'America/Los_Angeles'), formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'UTC')) AS tz
FROM system.numbers
WHERE number < 3

┌─number─┬─tz──────────────────┐
│      0 │ 1970-01-01 05:30:00 │
│      1 │ 1969-12-31 16:00:00 │
│      2 │ 1970-01-01 00:00:00 │
└────────┴─────────────────────┘

3 rows in set. Elapsed: 0.002 sec.
```

<!-- 
Внутреннее содержание тегов ниже заменяется во время сборки документа на 
документацию, сгенерированную из system.functions. Пожалуйста, не изменяйте и не удаляйте теги.
Смотрите: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
## clamp {#clamp}

Представлено в: v24.5


Ограничивает значение в пределах указанных минимальных и максимальных границ.

Если значение меньше минимума, возвращает минимум. Если значение больше максимума, возвращает максимум. В противном случае возвращает само значение.

Все аргументы должны быть сопоставимыми типами. Тип результата - это наибольший совместимый тип среди всех аргументов.
    

**Синтаксис**

```sql
clamp(value, min, max)
```

**Аргументы**

- `value` — Значение, которое нужно ограничить. 
- `min` — Минимальная граница. 
- `max` — Максимальная граница. 

**Возвращаемое значение**

Возвращает значение, ограниченное в диапазоне [min, max].

**Примеры**

**Основное использование**

```sql title=Query
SELECT clamp(5, 1, 10) AS result;
```

```response title=Response
┌─result─┐
│      5 │
└────────┘
```

**Значение ниже минимума**

```sql title=Query
SELECT clamp(-3, 0, 7) AS result;
```

```response title=Response
┌─result─┐
│      0 │
└────────┘
```

**Значение выше максимума**

```sql title=Query
SELECT clamp(15, 0, 7) AS result;
```

```response title=Response
┌─result─┐
│      7 │
└────────┘
```



## greatest {#greatest}

Представлено в: v1.1


Возвращает наибольшее значение среди аргументов.
Аргументы `NULL` игнорируются.

- Для массивов возвращает лексикографически наибольший массив.
- Для типов `DateTime` тип результата повышается до наибольшего типа (например, `DateTime64`, если смешано с `DateTime32`).

:::note Используйте настройку `least_greatest_legacy_null_behavior`, чтобы изменить поведение с `NULL`
Версия [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) представила несовместимое изменение, при котором значения `NULL` игнорируются, в то время как ранее она возвращала `NULL`, если один из аргументов был `NULL`.
Чтобы сохранить предыдущее поведение, установите настройку `least_greatest_legacy_null_behavior` (по умолчанию: `false`) на `true`.
:::
    

**Синтаксис**

```sql
greatest(x1[, x2, ...])
```

**Аргументы**

- `x1[, x2, ...]` — Одно или несколько значений для сравнения. Все аргументы должны быть сопоставимыми типами. [`Any`](/sql-reference/data-types)


**Возвращаемое значение**

Возвращает наибольшее значение среди аргументов, повышенное до наибольшего совместимого типа. [`Any`](/sql-reference/data-types)

**Примеры**

**Числовые типы**

```sql title=Query
SELECT greatest(1, 2, toUInt8(3), 3.) AS result, toTypeName(result) AS type;
-- The type returned is a Float64 as the UInt8 must be promoted to 64 bit for the comparison.
```

```response title=Response
┌─result─┬─type────┐
│      3 │ Float64 │
└────────┴─────────┘
```

**Массивы**

```sql title=Query
SELECT greatest(['hello'], ['there'], ['world']);
```

```response title=Response
┌─greatest(['hello'], ['there'], ['world'])─┐
│ ['world']                                 │
└───────────────────────────────────────────┘
```

**Типы DateTime**

```sql title=Query
SELECT greatest(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3));
-- The type returned is a DateTime64 as the DateTime32 must be promoted to 64 bit for the comparison.
```

```response title=Response
┌─greatest(toD⋯(now(), 3))─┐
│  2025-05-28 15:50:53.000 │
└──────────────────────────┘
```



## if {#if}

Представлено в: v1.1


Выполняет условное разветвление.

- Если условие `cond` оценивается как ненулевое значение, функция возвращает результат выражения `then`.
- Если `cond` оценивается как ноль или NULL, возвращается результат выражения `else`.

Настройка [`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) управляет тем, используется ли короткое замыкание.

Если включено, выражение `then` оценивается только для строк, где `cond` истинно, а выражение `else` — где `cond` ложно.

Например, при оценке в коротком замыкании никаких исключений деления на ноль не возникает при выполнении следующего запроса:

```sql
SELECT if(number = 0, 0, intDiv(42, number)) FROM numbers(10)
```

`then` и `else` должны быть одного похожего типа.


**Синтаксис**

```sql
if(cond, then, else)
```

**Аргументы**

- `cond` — Оцениваемое условие. [`UInt8`](/sql-reference/data-types/int-uint) или [`Nullable(UInt8)`](/sql-reference/data-types/nullable) или [`NULL`](/sql-reference/syntax#null)
- `then` — Выражение, возвращаемое если `cond` истинно. 
- `else` — Выражение, возвращаемое если `cond` ложно или `NULL`. 

**Возвращаемое значение**

Результат либо выражения `then`, либо выражения `else`, в зависимости от условия `cond`.

**Примеры**

**Пример использования**

```sql title=Query
SELECT if(1, 2 + 2, 2 + 6) AS res;
```

```response title=Response
┌─res─┐
│   4 │
└─────┘
```



## least {#least}

Представлено в: v1.1


Возвращает наименьшее значение среди аргументов.
Аргументы `NULL` игнорируются.

- Для массивов возвращает лексикографически наименьший массив.
- Для типов DateTime тип результата повышается до наибольшего типа (например, DateTime64, если смешано с DateTime32).

:::note Используйте настройку `least_greatest_legacy_null_behavior`, чтобы изменить поведение с `NULL`
Версия [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) представила несовместимое изменение, при котором значения `NULL` игнорируются, в то время как ранее она возвращала `NULL`, если один из аргументов был `NULL`.
Чтобы сохранить предыдущее поведение, установите настройку `least_greatest_legacy_null_behavior` (по умолчанию: `false`) на `true`.
:::
    

**Синтаксис**

```sql
least(x1[, x2, ...])
```

**Аргументы**

- `x1[, x2, ...]` — Одно или несколько значений для сравнения. Все аргументы должны быть сопоставимыми типами. [`Any`](/sql-reference/data-types)


**Возвращаемое значение**

Возвращает наименьшее значение среди аргументов, повышенное до наибольшего совместимого типа. [`Any`](/sql-reference/data-types)

**Примеры**

**Числовые типы**

```sql title=Query
SELECT least(1, 2, toUInt8(3), 3.) AS result, toTypeName(result) AS type;
-- The type returned is a Float64 as the UInt8 must be promoted to 64 bit for the comparison.
```

```response title=Response
┌─result─┬─type────┐
│      1 │ Float64 │
└────────┴─────────┘
```

**Массивы**

```sql title=Query
SELECT least(['hello'], ['there'], ['world']);
```

```response title=Response
┌─least(['hell⋯ ['world'])─┐
│ ['hello']                │
└──────────────────────────┘
```

**Типы DateTime**

```sql title=Query
SELECT least(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3));
-- The type returned is a DateTime64 as the DateTime32 must be promoted to 64 bit for the comparison.
```

```response title=Response
┌─least(toDate⋯(now(), 3))─┐
│  2025-05-27 15:55:20.000 │
└──────────────────────────┘
```



## multiIf {#multiIf}

Представлено в: v1.1


Позволяет писать оператор [`CASE`](/sql-reference/operators#conditional-expression) более компактно в запросе.
Оценивает каждое условие по порядку. Для первого условия, которое истинно (ненулевое и не `NULL`), возвращает соответствующее значение ветви.
Если ни одно из условий не истинно, возвращает значение `else`.

Настройка [`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) контролирует, используется ли короткое замыкание. Если включено, выражение `then_i` оценивается только для строк, где `((NOT cond_1) AND ... AND (NOT cond_{i-1}) AND cond_i)` истинно.

Например, при оценке в коротком замыкании никаких исключений деления на ноль не возникает при выполнении следующего запроса:

```sql
SELECT multiIf(number = 2, intDiv(1, number), number = 5) FROM numbers(10)
```

Все ветвевые и else выражения должны иметь общий супертип. Условия `NULL` рассматриваются как ложные.
    

**Синтаксис**

```sql
multiIf(cond_1, then_1, cond_2, then_2, ..., else)
```

**Аргументы**

- `cond_N` — N-е оцениваемое условие, которое контролирует, будет ли возвращено `then_N`. [`UInt8`](/sql-reference/data-types/int-uint) или [`Nullable(UInt8)`](/sql-reference/data-types/nullable) или [`NULL`](/sql-reference/syntax#null)
- `then_N` — Результат функции, когда `cond_N` истинно. 
- `else` — Результат функции, если ни одно из условий не истинно. 

**Возвращаемое значение**

Возвращает результат `then_N` для соответствующего `cond_N`, в противном случае возвращает условие `else`.

**Примеры**

**Пример использования**

```sql title=Query
CREATE TABLE LEFT_RIGHT (left Nullable(UInt8), right Nullable(UInt8)) ENGINE = Memory;
INSERT INTO LEFT_RIGHT VALUES (NULL, 4), (1, 3), (2, 2), (3, 1), (4, NULL);

SELECT
    left,
    right,
    multiIf(left < right, 'left is smaller', left > right, 'left is greater', left = right, 'Both equal', 'Null value') AS result
FROM LEFT_RIGHT;
```

```response title=Response
┌─left─┬─right─┬─result──────────┐
│ ᴺᵁᴸᴸ │     4 │ Null value      │
│    1 │     3 │ left is smaller │
│    2 │     2 │ Both equal      │
│    3 │     1 │ left is greater │
│    4 │  ᴺᵁᴸᴸ │ Null value      │
└──────┴───────┴─────────────────┘
```

<!--AUTOGENERATED_END-->