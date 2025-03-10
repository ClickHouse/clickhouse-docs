---
slug: /sql-reference/data-types/float
sidebar_position: 4
sidebar_label: Float32 | Float64 | BFloat16
title: Типы Float32 | Float64 | BFloat16
---

:::note
Если вам нужны точные вычисления, особенно если вы работаете с финансовыми или бизнес-данными, требующими высокой точности, вам следует рассмотреть возможность использования [Decimal](../data-types/decimal.md).

[Числа с плавающей запятой](https://en.wikipedia.org/wiki/IEEE_754) могут приводить к неточным результатам, как показано ниже:

```sql
CREATE TABLE IF NOT EXISTS float_vs_decimal
(
   my_float Float64,
   my_decimal Decimal64(3)
)
Engine=MergeTree
ORDER BY tuple();


# Сгенерировать 1 000 000 случайных чисел с 2 знаками после запятой и сохранить их как float и как decimal
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

Эквивалентные типы в ClickHouse и C указаны ниже:

- `Float32` — `float`.
- `Float64` — `double`.

Типы с плавающей запятой в ClickHouse имеют следующие алиасы:

- `Float32` — `FLOAT`, `REAL`, `SINGLE`.
- `Float64` — `DOUBLE`, `DOUBLE PRECISION`.

При создании таблиц числовые параметры для чисел с плавающей запятой могут быть установлены (например, `FLOAT(12)`, `FLOAT(15, 22)`, `DOUBLE(12)`, `DOUBLE(4, 18)`), но ClickHouse игнорирует их.

## Использование чисел с плавающей запятой {#using-floating-point-numbers}

- Вычисления с числами с плавающей запятой могут привести к погрешностям при округлении.

<!-- -->

``` sql
SELECT 1 - 0.9

┌───────minus(1, 0.9)─┐
│ 0.09999999999999998 │
└─────────────────────┘
```

- Результат вычисления зависит от метода расчета (типа процессора и архитектуры компьютерной системы).
- Вычисления с плавающей запятой могут привести к числам, таким как бесконечность (`Inf`) и "нечисло" (`NaN`). Это следует учитывать при обработке результатов расчетов.
- При разборе чисел с плавающей запятой из текста результат может не совпадать с ближайшим числом, представимым в машинном формате.

## NaN и Inf {#nan-and-inf}

В отличие от стандартного SQL, ClickHouse поддерживает следующие категории чисел с плавающей запятой:

- `Inf` – бесконечность.

<!-- -->

``` sql
SELECT 0.5 / 0

┌─divide(0.5, 0)─┐
│            inf │
└────────────────┘
```

- `-Inf` — отрицательная бесконечность.

<!-- -->

``` sql
SELECT -0.5 / 0

┌─divide(-0.5, 0)─┐
│            -inf │
└─────────────────┘
```

- `NaN` — не число.

<!-- -->

``` sql
SELECT 0 / 0

┌─divide(0, 0)─┐
│          nan │
└──────────────┘
```

Смотрите правила сортировки `NaN` в разделе [ORDER BY clause](../../sql-reference/statements/select/order-by.md).

## BFloat16 {#bfloat16}

`BFloat16` — это 16-битный тип данных с плавающей запятой, имеющий 8-битный экспонент, знак и 7-битный мантиссу. 
Он полезен для приложений в области машинного обучения и искусственного интеллекта.

ClickHouse поддерживает преобразования между `Float32` и `BFloat16`, которые 
можно выполнить с помощью функций [`toFloat32()`](../functions/type-conversion-functions.md/#tofloat32) или [`toBFloat16`](../functions/type-conversion-functions.md/#tobfloat16).

:::note
Большинство других операций не поддерживаются.
:::
