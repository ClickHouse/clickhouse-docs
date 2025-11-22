---
description: 'Документация по условным функциям'
sidebar_label: 'Условные'
slug: /sql-reference/functions/conditional-functions
title: 'Условные функции'
doc_type: 'reference'
---



# Условные функции



## Обзор {#overview}

### Прямое использование результатов условных выражений {#using-conditional-results-directly}

Условные выражения всегда возвращают `0`, `1` или `NULL`. Поэтому результаты условных выражений можно использовать напрямую следующим образом:

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

Если в условных выражениях участвуют значения `NULL`, результат также будет `NULL`.

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

Поэтому при работе с типами `Nullable` необходимо тщательно составлять запросы.

Следующий пример демонстрирует это на примере некорректного добавления условия равенства в `multiIf`.

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

Выражение CASE в ClickHouse предоставляет условную логику, аналогичную оператору CASE в SQL. Оно вычисляет условия и возвращает значения на основе первого совпадающего условия.

ClickHouse поддерживает две формы CASE:

1. `CASE WHEN ... THEN ... ELSE ... END`
   <br />
   Эта форма обеспечивает полную гибкость и внутренне реализована с использованием функции
   [multiIf](/sql-reference/functions/conditional-functions#multiIf).
   Каждое условие вычисляется независимо, и выражения могут включать
   неконстантные значения.

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

-- преобразуется в
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
   Эта более компактная форма оптимизирована для сопоставления константных значений и
   внутренне использует `caseWithExpression()`.

Например, следующий запрос является корректным:

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

```


┌─number─┬─result─┐
│ 0 │ 100 │
│ 1 │ 200 │
│ 2 │ 0 │
└────────┴────────┘

Получено 3 строки. Затрачено: 0.002 сек.

````

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

-- преобразуется в

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
````

#### Особенности {#caveats}

ClickHouse определяет тип результата выражения CASE (или его внутреннего эквивалента, например `multiIf`) до вычисления каких-либо условий. Это важно, когда возвращаемые выражения различаются по типу, например имеют разные часовые пояса или числовые типы.

- Тип результата выбирается на основе наибольшего совместимого типа среди всех ветвей.
- После выбора этого типа все остальные ветви неявно приводятся к нему — даже если их логика никогда не будет выполнена во время выполнения.
- Для типов, таких как DateTime64, где часовой пояс является частью сигнатуры типа, это может привести к неожиданному поведению: первый встреченный часовой пояс может использоваться для всех ветвей, даже когда другие ветви указывают другие часовые пояса.

Например, ниже все строки возвращают временную метку в часовом поясе первой совпавшей ветви, т. е. `Asia/Kolkata`

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

-- преобразуется в

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

Получено 3 строки. Затрачено: 0.011 сек.
```

Здесь ClickHouse видит несколько возвращаемых типов `DateTime64(3, <timezone>)`. Он выводит общий тип как `DateTime64(3, 'Asia/Kolkata')`, поскольку это первый встреченный тип, неявно приводя другие ветви к этому типу.

Это можно решить путём преобразования в строку для сохранения требуемого форматирования часового пояса:

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

-- преобразуется в

SELECT
    number,
    multiIf(number = 0, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'Asia/Kolkata'), number = 1, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'America/Los_Angeles'), formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'UTC')) AS tz
FROM system.numbers
WHERE number < 3

```


┌─number─┬─tz──────────────────┐
│      0 │ 1970-01-01 05:30:00 │
│      1 │ 1969-12-31 16:00:00 │
│      2 │ 1970-01-01 00:00:00 │
└────────┴─────────────────────┘

3 строки в наборе. Затрачено: 0.002 сек.

```

<!-- 
Внутреннее содержимое тегов ниже заменяется во время сборки документации
на документацию, сгенерированную из system.functions. Пожалуйста, не изменяйте и не удаляйте теги.
См.: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->
```


<!--AUTOGENERATED_START-->

## clamp {#clamp}

Введена в версии: v24.5

Ограничивает значение указанными минимальной и максимальной границами.

Если значение меньше минимума, возвращается минимум. Если значение больше максимума, возвращается максимум. В противном случае возвращается само значение.

Все аргументы должны иметь сравнимые типы. Тип результата — наибольший совместимый тип среди всех аргументов.

**Синтаксис**

```sql
clamp(value, min, max)
```

**Аргументы**

- `value` — Ограничиваемое значение. - `min` — Минимальная граница. - `max` — Максимальная граница.

**Возвращаемое значение**

Возвращает значение, ограниченное диапазоном [min, max].

**Примеры**

**Базовое использование**

```sql title=Запрос
SELECT clamp(5, 1, 10) AS result;
```

```response title=Ответ
┌─result─┐
│      5 │
└────────┘
```

**Значение ниже минимума**

```sql title=Запрос
SELECT clamp(-3, 0, 7) AS result;
```

```response title=Ответ
┌─result─┐
│      0 │
└────────┘
```

**Значение выше максимума**

```sql title=Запрос
SELECT clamp(15, 0, 7) AS result;
```

```response title=Ответ
┌─result─┐
│      7 │
└────────┘
```


## greatest {#greatest}

Введено в версии: v1.1

Возвращает наибольшее значение среди аргументов.
Аргументы `NULL` игнорируются.

- Для массивов возвращает лексикографически наибольший массив.
- Для типов `DateTime` тип результата повышается до наибольшего типа (например, `DateTime64` при смешивании с `DateTime32`).

:::note Используйте настройку `least_greatest_legacy_null_behavior` для изменения поведения с `NULL`
В версии [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) было внесено обратно несовместимое изменение, при котором значения `NULL` игнорируются, тогда как ранее функция возвращала `NULL`, если один из аргументов был `NULL`.
Чтобы сохранить прежнее поведение, установите настройку `least_greatest_legacy_null_behavior` (по умолчанию: `false`) в `true`.
:::

**Синтаксис**

```sql
greatest(x1[, x2, ...])
```

**Аргументы**

- `x1[, x2, ...]` — одно или несколько значений для сравнения. Все аргументы должны иметь сравнимые типы. [`Any`](/sql-reference/data-types)

**Возвращаемое значение**

Возвращает наибольшее значение среди аргументов с повышением до наибольшего совместимого типа. [`Any`](/sql-reference/data-types)

**Примеры**

**Числовые типы**

```sql title=Запрос
SELECT greatest(1, 2, toUInt8(3), 3.) AS result, toTypeName(result) AS type;
-- Возвращаемый тип — Float64, так как UInt8 должен быть повышен до 64 бит для сравнения.
```

```response title=Результат
┌─result─┬─type────┐
│      3 │ Float64 │
└────────┴─────────┘
```

**Массивы**

```sql title=Запрос
SELECT greatest(['hello'], ['there'], ['world']);
```

```response title=Результат
┌─greatest(['hello'], ['there'], ['world'])─┐
│ ['world']                                 │
└───────────────────────────────────────────┘
```

**Типы DateTime**

```sql title=Запрос
SELECT greatest(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3));
-- Возвращаемый тип — DateTime64, так как DateTime32 должен быть повышен до 64 бит для сравнения.
```

```response title=Результат
┌─greatest(toD⋯(now(), 3))─┐
│  2025-05-28 15:50:53.000 │
└──────────────────────────┘
```


## if {#if}

Введено в версии: v1.1

Выполняет условное ветвление.

- Если условие `cond` принимает ненулевое значение, функция возвращает результат выражения `then`.
- Если `cond` принимает значение ноль или NULL, возвращается результат выражения `else`.

Настройка [`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) управляет использованием ленивого вычисления.

Если включено, выражение `then` вычисляется только для строк, где `cond` истинно, а выражение `else` — где `cond` ложно.

Например, при ленивом вычислении не возникает исключение деления на ноль при выполнении следующего запроса:

```sql
SELECT if(number = 0, 0, intDiv(42, number)) FROM numbers(10)
```

`then` и `else` должны иметь совместимые типы.

**Синтаксис**

```sql
if(cond, then, else)
```

**Аргументы**

- `cond` — Вычисляемое условие. [`UInt8`](/sql-reference/data-types/int-uint), [`Nullable(UInt8)`](/sql-reference/data-types/nullable) или [`NULL`](/sql-reference/syntax#null)
- `then` — Выражение, возвращаемое, если `cond` истинно.
- `else` — Выражение, возвращаемое, если `cond` ложно или `NULL`.

**Возвращаемое значение**

Результат выражения `then` или `else` в зависимости от условия `cond`.

**Примеры**

**Пример использования**

```sql title=Запрос
SELECT if(1, 2 + 2, 2 + 6) AS res;
```

```response title=Ответ
┌─res─┐
│   4 │
└─────┘
```


## least {#least}

Введено в версии: v1.1

Возвращает наименьшее значение среди аргументов.
Аргументы `NULL` игнорируются.

- Для массивов возвращает лексикографически наименьший массив.
- Для типов DateTime тип результата приводится к наибольшему типу (например, DateTime64 при смешивании с DateTime32).

:::note Используйте настройку `least_greatest_legacy_null_behavior` для изменения поведения с `NULL`
Версия [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) внесла обратно несовместимое изменение, при котором значения `NULL` игнорируются, тогда как ранее функция возвращала `NULL`, если один из аргументов был `NULL`.
Чтобы сохранить прежнее поведение, установите настройку `least_greatest_legacy_null_behavior` (по умолчанию: `false`) в значение `true`.
:::

**Синтаксис**

```sql
least(x1[, x2, ...])
```

**Аргументы**

- `x1[, x2, ...]` — одно значение или несколько значений для сравнения. Все аргументы должны быть сравнимых типов. [`Any`](/sql-reference/data-types)

**Возвращаемое значение**

Возвращает наименьшее значение среди аргументов, приведённое к наибольшему совместимому типу. [`Any`](/sql-reference/data-types)

**Примеры**

**Числовые типы**

```sql title=Запрос
SELECT least(1, 2, toUInt8(3), 3.) AS result, toTypeName(result) AS type;
-- Возвращаемый тип — Float64, так как UInt8 должен быть приведён к 64-битному типу для сравнения.
```

```response title=Результат
┌─result─┬─type────┐
│      1 │ Float64 │
└────────┴─────────┘
```

**Массивы**

```sql title=Запрос
SELECT least(['hello'], ['there'], ['world']);
```

```response title=Результат
┌─least(['hell⋯ ['world'])─┐
│ ['hello']                │
└──────────────────────────┘
```

**Типы DateTime**

```sql title=Запрос
SELECT least(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3));
-- Возвращаемый тип — DateTime64, так как DateTime32 должен быть приведён к 64-битному типу для сравнения.
```

```response title=Результат
┌─least(toDate⋯(now(), 3))─┐
│  2025-05-27 15:55:20.000 │
└──────────────────────────┘
```


## multiIf {#multiIf}

Введена в версии: v1.1

Позволяет записывать оператор [`CASE`](/sql-reference/operators#conditional-expression) в более компактной форме в запросе.
Вычисляет каждое условие по порядку. Для первого истинного условия (не равного нулю и не `NULL`) возвращает соответствующее значение ветви.
Если ни одно из условий не является истинным, возвращает значение `else`.

Настройка [`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) управляет
использованием сокращённого вычисления. Если она включена, выражение `then_i` вычисляется только для строк, где
`((NOT cond_1) AND ... AND (NOT cond_{i-1}) AND cond_i)` истинно.

Например, при сокращённом вычислении не возникает исключение деления на ноль при выполнении следующего запроса:

```sql
SELECT multiIf(number = 2, intDiv(1, number), number = 5) FROM numbers(10)
```

Все выражения ветвей и else должны иметь общий супертип. Условия `NULL` обрабатываются как ложные.

**Синтаксис**

```sql
multiIf(cond_1, then_1, cond_2, then_2, ..., else)
```

**Псевдонимы**: `caseWithoutExpression`, `caseWithoutExpr`

**Аргументы**

- `cond_N` — N-ое вычисляемое условие, которое определяет, будет ли возвращено `then_N`. [`UInt8`](/sql-reference/data-types/int-uint) или [`Nullable(UInt8)`](/sql-reference/data-types/nullable) или [`NULL`](/sql-reference/syntax#null)
- `then_N` — Результат функции, когда `cond_N` истинно. 
- `else` — Результат функции, если ни одно из условий не является истинным.

**Возвращаемое значение**

Возвращает результат `then_N` для соответствующего `cond_N`, в противном случае возвращает значение `else`.

**Примеры**

**Пример использования**

```sql title=Запрос
CREATE TABLE LEFT_RIGHT (left Nullable(UInt8), right Nullable(UInt8)) ENGINE = Memory;
INSERT INTO LEFT_RIGHT VALUES (NULL, 4), (1, 3), (2, 2), (3, 1), (4, NULL);

SELECT
    left,
    right,
    multiIf(left < right, 'левое меньше', left > right, 'левое больше', left = right, 'Оба равны', 'Значение Null') AS result
FROM LEFT_RIGHT;
```

```response title=Результат
┌─left─┬─right─┬─result──────────┐
│ ᴺᵁᴸᴸ │     4 │ Значение Null   │
│    1 │     3 │ левое меньше    │
│    2 │     2 │ Оба равны       │
│    3 │     1 │ левое больше    │
│    4 │  ᴺᵁᴸᴸ │ Значение Null   │
└──────┴───────┴─────────────────┘
```

<!--AUTOGENERATED_END-->
