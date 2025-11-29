---
description: 'Документация по условным функциям'
sidebar_label: 'Условные'
slug: /sql-reference/functions/conditional-functions
title: 'Условные функции'
doc_type: 'reference'
---

# Условные функции {#conditional-functions}

## Обзор {#overview}

### Прямое использование результатов условных выражений {#using-conditional-results-directly}

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


### Значения NULL в условных выражениях {#null-values-in-conditionals}

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


### Оператор CASE {#case-statement}

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


#### Особенности {#caveats}

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

Получено 3 строки. Время выполнения: 0.011 сек.
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

-- преобразуется в

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

Получено 3 строки. Прошло: 0.002 сек.
```

{/* 
  Внутреннее содержимое тегов ниже при сборке фреймворка документации
  заменяется документацией, сгенерированной из system.functions. Пожалуйста, не изменяйте и не удаляйте эти теги.
  См.: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
