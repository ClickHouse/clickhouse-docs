---
description: 'Документация для функций работы с Nullable значениями'
sidebar_label: 'Nullable'
sidebar_position: 135
slug: /sql-reference/functions/functions-for-nulls
title: 'Функции для работы с Nullable значениями'
---


# Функции для работы с Nullable значениями

## isNull {#isnull}

Возвращает, является ли аргумент [NULL](../../sql-reference/syntax.md#null).

Смотрите также оператор [`IS NULL`](../operators/index.md#is_null).

**Синтаксис**

```sql
isNull(x)
```

Псевдоним: `ISNULL`.

**Аргументы**

- `x` — Значение не составного типа данных.

**Возвращаемое значение**

- `1`, если `x` равно `NULL`.
- `0`, если `x` не равно `NULL`.

**Пример**

Таблица:

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

Запрос:

```sql
SELECT x FROM t_null WHERE isNull(y);
```

Результат:

```text
┌─x─┐
│ 1 │
└───┘
```

## isNullable {#isnullable}

Возвращает `1`, если колонка является [Nullable](../data-types/nullable.md) (то есть позволяет значения `NULL`), и `0` в противном случае.

**Синтаксис**

```sql
isNullable(x)
```

**Аргументы**

- `x` — колонка.

**Возвращаемое значение**

- `1`, если `x` позволяет значения `NULL`. [UInt8](../data-types/int-uint.md).
- `0`, если `x` не позволяет значения `NULL`. [UInt8](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
CREATE TABLE tab (ordinary_col UInt32, nullable_col Nullable(UInt32)) ENGINE = Log;
INSERT INTO tab (ordinary_col, nullable_col) VALUES (1,1), (2, 2), (3,3);
SELECT isNullable(ordinary_col), isNullable(nullable_col) FROM tab;    
```

Результат:

```text
   ┌───isNullable(ordinary_col)──┬───isNullable(nullable_col)──┐
1. │                           0 │                           1 │
2. │                           0 │                           1 │
3. │                           0 │                           1 │
   └─────────────────────────────┴─────────────────────────────┘
```

## isNotNull {#isnotnull}

Возвращает, является ли аргумент не [NULL](/operations/settings/formats#input_format_null_as_default).

Смотрите также оператор [`IS NOT NULL`](../operators/index.md#is_not_null).

```sql
isNotNull(x)
```

**Аргументы:**

- `x` — Значение не составного типа данных.

**Возвращаемое значение**

- `1`, если `x` не равно `NULL`.
- `0`, если `x` равно `NULL`.

**Пример**

Таблица:

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

Запрос:

```sql
SELECT x FROM t_null WHERE isNotNull(y);
```

Результат:

```text
┌─x─┐
│ 2 │
└───┘
```

## isNotDistinctFrom {#isnotdistinctfrom}

Выполняет безопасное по отношению к нулю сравнение. Используется для сравнения ключей JOIN, которые содержат значения NULL в разделе JOIN ON. Эта функция будет рассматривать два значения `NULL` как идентичные и вернёт `true`, что отличается от обычного поведения равенства, когда сравнение двух значений `NULL` вернёт `NULL`.

:::note
Эта функция является внутренней функцией, используемой реализацией JOIN ON. Пожалуйста, не используйте её вручную в запросах.
:::

**Синтаксис**

```sql
isNotDistinctFrom(x, y)
```

**Аргументы**

- `x` — первый ключ JOIN.
- `y` — второй ключ JOIN.

**Возвращаемое значение**

- `true`, когда `x` и `y` оба равны `NULL`.
- `false` в противном случае.

**Пример**

Для полного примера смотрите: [NULL значения в ключах JOIN](../../sql-reference/statements/select/join#null-values-in-join-keys).

## isZeroOrNull {#iszeroornull}

Возвращает, является ли аргумент 0 (ноль) или [NULL](/operations/settings/formats#input_format_null_as_default).

```sql
isZeroOrNull(x)
```

**Аргументы:**

- `x` — Значение не составного типа данных.

**Возвращаемое значение**

- `1`, если `x` равно 0 (ноль) или `NULL`.
- `0` в противном случае.

**Пример**

Таблица:

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴹ │
│ 2 │    0 │
│ 3 │    3 │
└───┴──────┘
```

Запрос:

```sql
SELECT x FROM t_null WHERE isZeroOrNull(y);
```

Результат:

```text
┌─x─┐
│ 1 │
│ 2 │
└───┘
```

## coalesce {#coalesce}

Возвращает самый левый аргумент, который не равен `NULL`.

```sql
coalesce(x,...)
```

**Аргументы:**

- Любое количество параметров не составного типа. Все параметры должны быть совместимы по типам данных.

**Возвращаемые значения**

- Первый аргумент, который не равен `NULL`
- `NULL`, если все аргументы равны `NULL`.

**Пример**

Рассмотрим список контактов, которые могут указывать несколько способов связаться с клиентом.

```text
┌─name─────┬─mail─┬─phone─────┬──telegram─┐
│ client 1 │ ᴺᵁᴸᴸ │ 123-45-67 │       123 │
│ client 2 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ      │      ᴺᵁᴸᴸ │
└──────────┴──────┴───────────┴───────────┘
```

Поля `mail` и `phone` имеют тип String, но поле `telegram` — это `UInt32`, поэтому его нужно преобразовать в `String`.

Получите первый доступный способ контакта с клиентом из списка контактов:

```sql
SELECT name, coalesce(mail, phone, CAST(telegram,'Nullable(String)')) FROM aBook;
```

```text
┌─name─────┬─coalesce(mail, phone, CAST(telegram, 'Nullable(String)'))─┐
│ client 1 │ 123-45-67                                                 │
│ client 2 │ ᴺᵁᴸᴸ                                                      │
└──────────┴───────────────────────────────────────────────────────────┘
```

## ifNull {#ifnull}

Возвращает альтернативное значение, если аргумент равен `NULL`.

```sql
ifNull(x, alt)
```

**Аргументы:**

- `x` — Значение, которое необходимо проверить на `NULL`.
- `alt` — Значение, которое функция возвращает, если `x` равно `NULL`.

**Возвращаемые значения**

- `x`, если `x` не равно `NULL`.
- `alt`, если `x` равно `NULL`.

**Пример**

Запрос:

```sql
SELECT ifNull('a', 'b');
```

Результат:

```text
┌─ifNull('a', 'b')─┐
│ a                │
└──────────────────┘
```

Запрос:

```sql
SELECT ifNull(NULL, 'b');
```

Результат:

```text
┌─ifNull(NULL, 'b')─┐
│ b                 │
└───────────────────┘
```

## nullIf {#nullif}

Возвращает `NULL`, если оба аргумента равны.

```sql
nullIf(x, y)
```

**Аргументы:**

`x`, `y` — Значения для сравнения. Должны быть совместимы по типам.

**Возвращаемые значения**

- `NULL`, если аргументы равны.
- `x`, если аргументы не равны.

**Пример**

Запрос:

```sql
SELECT nullIf(1, 1);
```

Результат:

```text
┌─nullIf(1, 1)─┐
│         ᴺᵁᴸᴸ │
└──────────────┘
```

Запрос:

```sql
SELECT nullIf(1, 2);
```

Результат:

```text
┌─nullIf(1, 2)─┐
│            1 │
└──────────────┘
```

## assumeNotNull {#assumenotnull}

Возвращает соответствующее значение не-`Nullable` для значения типа [Nullable](../data-types/nullable.md). Если исходное значение равно `NULL`, может быть возвращено произвольное значение. Смотрите также функции `ifNull` и `coalesce`.

```sql
assumeNotNull(x)
```

**Аргументы:**

- `x` — Исходное значение.

**Возвращаемые значения**

- Входное значение в виде не-`Nullable` типа, если оно не равно `NULL`.
- Произвольное значение, если входное значение равно `NULL`.

**Пример**

Таблица:

```text

┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

Запрос:

```sql
SELECT assumeNotNull(y) FROM table;
```

Результат:

```text
┌─assumeNotNull(y)─┐
│                0 │
│                3 │
└──────────────────┘
```

Запрос:

```sql
SELECT toTypeName(assumeNotNull(y)) FROM t_null;
```

Результат:

```text
┌─toTypeName(assumeNotNull(y))─┐
│ Int8                         │
│ Int8                         │
└──────────────────────────────┘
```

## toNullable {#tonullable}

Преобразует тип аргумента в `Nullable`.

```sql
toNullable(x)
```

**Аргументы:**

- `x` — Значение не составного типа.

**Возвращаемое значение**

- Входное значение, но в типе `Nullable`.

**Пример**

Запрос:

```sql
SELECT toTypeName(10);
```

Результат:

```text
┌─toTypeName(10)─┐
│ UInt8          │
└────────────────┘
```

Запрос:

```sql
SELECT toTypeName(toNullable(10));
```

Результат:

```text
┌─toTypeName(toNullable(10))─┐
│ Nullable(UInt8)            │
└────────────────────────────┘
```
