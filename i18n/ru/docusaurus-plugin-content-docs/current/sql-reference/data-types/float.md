---
slug: '/sql-reference/data-types/float'
sidebar_label: 'Float32 | Float64 | BFloat16'
sidebar_position: 4
description: 'Документация для ClickHouse по типам данных: Float32, Float64 и BFloat16'
title: 'Типы Float32 | Float64 | BFloat16'
doc_type: reference
---
:::note
Если вам нужны точные расчёты, особенно если вы работаете с финансовыми или бизнес-данными, требующими высокой точности, вам стоит рассмотреть возможность использования [Decimal](../data-types/decimal.md) вместо этого.

[Числа с плавающей точкой](https://en.wikipedia.org/wiki/IEEE_754) могут привести к неточным результатам, как показано ниже:

```sql
CREATE TABLE IF NOT EXISTS float_vs_decimal
(
   my_float Float64,
   my_decimal Decimal64(3)
)
ENGINE=MergeTree
ORDER BY tuple();


# Generate 1 000 000 random numbers with 2 decimal places and store them as a float and as a decimal
INSERT INTO float_vs_decimal SELECT round(randCanonical(), 3) AS res, res FROM system.numbers LIMIT 1000000;
```
```sql
SELECT sum(my_float), sum(my_decimal) FROM float_vs_decimal;

┌──────sum(my_float)─┬─sum(my_decimal)─┐
│ 499693.60500000004 │      499693.605 │
└────────────────────┴─────────────────┘

SELECT sumKahan(my_float), sumKahan(my_decimal) FROM float_vs_decimal;

┌─sumKahan(my_float)─┬─sumKahan(my_decimal)─┐
│         499693.605 │           499693.605 │
└────────────────────┴──────────────────────┘
```
:::

Эквивалентные типы в ClickHouse и C приведены ниже:

- `Float32` — `float`.
- `Float64` — `double`.

Типы с плавающей точкой в ClickHouse имеют следующие псевдонимы:

- `Float32` — `FLOAT`, `REAL`, `SINGLE`.
- `Float64` — `DOUBLE`, `DOUBLE PRECISION`.

При создании таблиц числовые параметры для чисел с плавающей точкой могут быть заданы (например, `FLOAT(12)`, `FLOAT(15, 22)`, `DOUBLE(12)`, `DOUBLE(4, 18)`), но ClickHouse игнорирует их.

## Использование чисел с плавающей точкой {#using-floating-point-numbers}

- Расчёты с числами с плавающей точкой могут привести к ошибке округления.

<!-- -->

```sql
SELECT 1 - 0.9

┌───────minus(1, 0.9)─┐
│ 0.09999999999999998 │
└─────────────────────┘
```

- Результат расчёта зависит от метода вычислений (типа процессора и архитектуры компьютерной системы).
- Вычисления с плавающей точкой могут привести к числам, таким как бесконечность (`Inf`) и "не число" (`NaN`). Это следует учитывать при обработке результатов вычислений.
- При разборе чисел с плавающей точкой из текста результат может не совпадать с ближайшим представимым машинным числом.

## NaN и Inf {#nan-and-inf}

В отличие от стандартного SQL, ClickHouse поддерживает следующие категории чисел с плавающей точкой:

- `Inf` – Бесконечность.

<!-- -->

```sql
SELECT 0.5 / 0

┌─divide(0.5, 0)─┐
│            inf │
└────────────────┘
```

- `-Inf` — Отрицательная бесконечность.

<!-- -->

```sql
SELECT -0.5 / 0

┌─divide(-0.5, 0)─┐
│            -inf │
└─────────────────┘
```

- `NaN` — Не число.

<!-- -->

```sql
SELECT 0 / 0

┌─divide(0, 0)─┐
│          nan │
└──────────────┘
```

Смотрите правила сортировки `NaN` в разделе [ORDER BY clause](../../sql-reference/statements/select/order-by.md).

## BFloat16 {#bfloat16}

`BFloat16` — это 16-битный тип данных с плавающей точкой с 8-разрядным показателем, знаком и 7-разрядной мантиссой. 
Он полезен для приложений машинного обучения и ИИ.

ClickHouse поддерживает преобразования между `Float32` и `BFloat16`, которые 
можно выполнить с помощью функций [`toFloat32()`](../functions/type-conversion-functions.md/#tofloat32) или [`toBFloat16`](../functions/type-conversion-functions.md/#tobfloat16).

:::note
Большинство других операций не поддерживается.
:::