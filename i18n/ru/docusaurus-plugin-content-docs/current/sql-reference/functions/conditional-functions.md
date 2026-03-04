---
description: 'Документация по условным функциям'
sidebar_label: 'Условные'
slug: /sql-reference/functions/conditional-functions
title: 'Условные функции'
doc_type: 'reference'
---

# Условные функции \{#conditional-functions\}

## Обзор \{#overview\}

### Прямое использование результатов условных выражений \{#using-conditional-results-directly\}

Условные выражения всегда возвращают значение `0`, `1` или `NULL`. Поэтому вы можете напрямую использовать результаты условных выражений, как показано ниже:

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

### Значения NULL в условных выражениях \{#null-values-in-conditionals\}

Когда в условных выражениях участвует `NULL`, результат также будет `NULL`.

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

Поэтому при работе с типами `Nullable` запросы следует составлять особенно тщательно.

Следующий пример демонстрирует это на ситуации, когда к `multiIf` не добавлено условие равенства.

```sql
SELECT
    left,
    right,
    multiIf(left < right, 'левое меньше', left > right, 'правое меньше', 'Оба равны') AS faulty_result
FROM LEFT_RIGHT

┌─left─┬─right─┬─faulty_result────┐
│ ᴺᵁᴸᴸ │     4 │ Оба равны        │
│    1 │     3 │ левое меньше     │
│    2 │     2 │ Оба равны        │
│    3 │     1 │ правое меньше    │
│    4 │  ᴺᵁᴸᴸ │ Оба равны        │
└──────┴───────┴──────────────────┘
```

### Оператор CASE \{#case-statement\}

Выражение CASE в ClickHouse реализует условную логику, аналогичную оператору CASE в SQL. Оно проверяет условия и возвращает значения в зависимости от первого условия, которое оказалось истинным.

ClickHouse поддерживает две формы записи CASE:

1. `CASE WHEN ... THEN ... ELSE ... END`
   <br />
   Эта форма предоставляет максимальную гибкость и внутренне реализована с использованием функции [multiIf](/sql-reference/functions/conditional-functions#multiIf). Каждое условие вычисляется независимо, а выражения могут включать неконстантные значения.

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

-- транслируется в
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

Получено 5 строк. Затрачено: 0.002 сек.
```

2. `CASE <expr> WHEN <val1> THEN ... WHEN <val2> THEN ... ELSE ... END`
   <br />
   Эта более компактная форма оптимизирована для сопоставления с константными значениями и внутри использует `caseWithExpression()`.

Например, следующая конструкция является допустимой:

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

-- преобразуется в

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

Получено 3 строки. Прошло: 0.002 сек.
```

В этой форме также не требуется, чтобы возвращаемые выражения были константами.

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

-- транслируется в

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

Получено 3 строки. Затрачено: 0.001 сек.
```

#### Особенности \{#caveats\}

ClickHouse определяет результирующий тип выражения CASE (или его внутреннего аналога, такого как `multiIf`) до вычисления каких-либо условий. Это важно, когда выражения, возвращаемые в разных ветвях, имеют разные типы, например разные часовые пояса или числовые типы.

* Результирующий тип выбирается на основе наибольшего совместимого типа среди всех ветвей.
* После выбора этого типа все остальные ветви неявно приводятся к нему — даже если соответствующая ветка никогда не будет выбрана при выполнении.
* Для типов вроде DateTime64, где часовой пояс является частью сигнатуры типа, это может приводить к неожиданному поведению: первый встретившийся часовой пояс может быть использован для всех ветвей, даже если в других ветвях указаны разные часовые пояса.

Например, ниже во всех строках возвращается метка времени в часовом поясе первой совпавшей ветви, то есть `Asia/Kolkata`.

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

Здесь ClickHouse видит несколько возвращаемых типов `DateTime64(3, <timezone>)`. Он определяет общий тип как `DateTime64(3, 'Asia/Kolkata'` по первому встреченному значению, неявно приводя остальные ветви к этому типу.

Эту ситуацию можно исправить, преобразовав значение в строку, чтобы сохранить требуемое форматирование часового пояса:

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

{/* 
    Внутреннее содержимое тегов ниже во время сборки фреймворка документации
    заменяется документацией, генерируемой из system.functions. Пожалуйста, не изменяйте и не удаляйте эти теги.
    См.: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

## clamp \{#clamp\}

Добавлено в: v24.5.0

Ограничивает значение указанными минимальным и максимальным пределами.

Если значение меньше минимума, возвращает минимум. Если значение больше максимума, возвращает максимум. В противном случае возвращает само значение.

Все аргументы должны иметь сравнимые типы. Тип результата — это наибольший совместимый тип среди всех аргументов.

**Синтаксис**

```sql
clamp(value, min, max)
```

**Аргументы**

* `value` — Значение, которое нужно ограничить. - `min` — Нижняя граница. - `max` — Верхняя граница.

**Возвращаемое значение**

Возвращает значение, ограниченное диапазоном [min, max].

**Примеры**

**Базовое использование**

```sql title=Query
SELECT clamp(5, 1, 10) AS result;
```

```response title=Response
┌─result─┐
│      5 │
└────────┘
```

**Значение меньше минимального**

```sql title=Query
SELECT clamp(-3, 0, 7) AS result;
```

```response title=Response
┌─result─┐
│      0 │
└────────┘
```

**Значение превышает максимум**

```sql title=Query
SELECT clamp(15, 0, 7) AS result;
```

```response title=Response
┌─result─┐
│      7 │
└────────┘
```

## greatest \{#greatest\}

Введена в версии: v1.1.0

Возвращает наибольшее значение среди аргументов.
Аргументы `NULL` игнорируются.

* Для массивов возвращает лексикографически наибольший массив.
* Для типов `DateTime` тип результата повышается до наибольшего типа (например, до `DateTime64`, если используется совместно с `DateTime32`).

:::note Используйте SETTING `least_greatest_legacy_null_behavior` для изменения поведения `NULL`
В версии [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) было внесено изменение, несовместимое с предыдущими версиями: значения `NULL` теперь игнорируются, тогда как ранее функция возвращала `NULL`, если один из аргументов был `NULL`.
Чтобы сохранить прежнее поведение, установите SETTING `least_greatest_legacy_null_behavior` (по умолчанию: `false`) в значение `true`.
:::

**Синтаксис**

```sql
greatest(x1[, x2, ...])
```

**Аргументы**

* `x1[, x2, ...]` — одно или несколько значений для сравнения. Все аргументы должны быть сравнимых типов. [`Any`](/sql-reference/data-types)

**Возвращаемое значение**

Возвращает наибольшее значение среди аргументов, приведённое к наибольшему совместимому типу. [`Any`](/sql-reference/data-types)

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

**Типы данных DateTime**

```sql title=Query
SELECT greatest(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3));
-- The type returned is a DateTime64 as the DateTime32 must be promoted to 64 bit for the comparison.
```

```response title=Response
┌─greatest(toD⋯(now(), 3))─┐
│  2025-05-28 15:50:53.000 │
└──────────────────────────┘
```

## if \{#if\}

Добавлено в: v1.1.0

Выполняет условное ветвление.

* Если условие `cond` даёт ненулевое значение, функция возвращает результат выражения `then`.
* Если `cond` даёт ноль или NULL, возвращается результат выражения `else`.

Настройка [`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) управляет использованием укороченного вычисления.

Если она включена, выражение `then` вычисляется только для строк, где `cond` истинно, а выражение `else` — только для строк, где `cond` ложно.

Например, при укороченном вычислении исключение деления на ноль не генерируется при выполнении следующего запроса:

```sql
SELECT if(number = 0, 0, intDiv(42, number)) FROM numbers(10)
```

`then` и `else` должны быть одного типа.

**Синтаксис**

```sql
if(cond, then, else)
```

**Аргументы**

* `cond` — Оцениваемое условие. [`UInt8`](/sql-reference/data-types/int-uint) или [`Nullable(UInt8)`](/sql-reference/data-types/nullable) или [`NULL`](/sql-reference/syntax#null)
* `then` — выражение, возвращаемое, если `cond` истинно. - `else` — выражение, возвращаемое, если `cond` ложно или равно `NULL`.

**Возвращаемое значение**

Результат выражения `then` или `else` в зависимости от условия `cond`.

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

## least \{#least\}

Впервые представлен в версии v1.1.0

Возвращает наименьшее значение среди аргументов.
Аргументы `NULL` игнорируются.

* Для массивов возвращает лексикографически наименьший массив.
* Для типов DateTime тип результата повышается до наиболее широкого типа (например, DateTime64, если он используется вместе с DateTime32).

:::note Используйте настройку `least_greatest_legacy_null_behavior` для изменения поведения `NULL`
Версия [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) ввела несовместимое с предыдущими версиями изменение, при котором значения `NULL` игнорируются, тогда как ранее возвращался `NULL`, если один из аргументов был `NULL`.
Чтобы сохранить предыдущее поведение, установите настройку `least_greatest_legacy_null_behavior` (значение по умолчанию: `false`) в `true`.
:::

**Синтаксис**

```sql
least(x1[, x2, ...])
```

**Аргументы**

* `x1[, x2, ...]` — одно или несколько значений для сравнения. Все аргументы должны быть сравнимых типов. [`Any`](/sql-reference/data-types)

**Возвращаемое значение**

Возвращает наименьшее значение среди аргументов, приведённое к наибольшему совместимому типу. [`Any`](/sql-reference/data-types)

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

## multiIf \{#multiIf\}

Введена в версии: v1.1.0

Позволяет более компактно записывать оператор [`CASE`](/sql-reference/operators#conditional-expression) в запросе.
Последовательно вычисляет каждое условие. Для первого условия, которое истинно (ненулевое и не `NULL`), возвращает соответствующее значение ветви.
Если ни одно из условий не истинно, возвращает значение `else`.

Настройка [`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) управляет тем,
используется ли вычисление с коротким замыканием. Если оно включено, выражение `then_i` вычисляется только для строк, для которых
`((NOT cond_1) AND ... AND (NOT cond_{i-1}) AND cond_i)` истинно.

Например, при вычислении с коротким замыканием при выполнении следующего запроса не возникает исключение деления на ноль:

```sql
SELECT multiIf(number = 2, intDiv(1, number), number = 5) FROM numbers(10)
```

Все выражения во всех ветвях и в `else` должны иметь общий супертип. Условия с `NULL` считаются ложными.

**Синтаксис**

```sql
multiIf(cond_1, then_1, cond_2, then_2, ..., else)
```

**Псевдонимы**: `caseWithoutExpression`, `caseWithoutExpr`

**Аргументы**

* `cond_N` — N‑е проверяемое условие, которое определяет, будет ли возвращён `then_N`. [`UInt8`](/sql-reference/data-types/int-uint) или [`Nullable(UInt8)`](/sql-reference/data-types/nullable) или [`NULL`](/sql-reference/syntax#null)
* `then_N` — результат функции, когда `cond_N` истинно.
* `else` — результат функции, если ни одно из условий не истинно.

**Возвращаемое значение**

Возвращает значение `then_N` для соответствующего `cond_N`, в противном случае возвращает значение аргумента `else`.

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

{/*AUTOGENERATED_END*/ }
