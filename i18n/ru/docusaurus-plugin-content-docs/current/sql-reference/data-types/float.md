---
description: 'Документация по типам данных с плавающей запятой в ClickHouse: Float32,
  Float64 и BFloat16'
sidebar_label: 'Float32 | Float64 | BFloat16'
sidebar_position: 4
slug: /sql-reference/data-types/float
title: 'Типы Float32 | Float64 | BFloat16'
doc_type: 'reference'
---

:::note
Если вам нужны точные вычисления, в частности, если вы работаете с финансовыми или бизнес-данными, требующими высокой точности, следует рассмотреть возможность использования [Decimal](../data-types/decimal.md).

[Числа с плавающей запятой](https://en.wikipedia.org/wiki/IEEE_754) могут приводить к неточным результатам, как показано ниже:

```sql
CREATE TABLE IF NOT EXISTS float_vs_decimal
(
   my_float Float64,
   my_decimal Decimal64(3)
)
ENGINE=MergeTree
ORDER BY tuple();
```


# Сгенерируйте 1 000 000 случайных чисел с двумя знаками после запятой и сохраните их как значения типов Float и Decimal

INSERT INTO float&#95;vs&#95;decimal SELECT round(randCanonical(), 3) AS res, res FROM system.numbers LIMIT 1000000;

````
```sql
SELECT sum(my_float), sum(my_decimal) FROM float_vs_decimal;

┌──────sum(my_float)─┬─sum(my_decimal)─┐
│ 499693.60500000004 │      499693.605 │
└────────────────────┴─────────────────┘

SELECT sumKahan(my_float), sumKahan(my_decimal) FROM float_vs_decimal;

┌─sumKahan(my_float)─┬─sumKahan(my_decimal)─┐
│         499693.605 │           499693.605 │
└────────────────────┴──────────────────────┘
````

:::

Эквивалентные типы в ClickHouse и C перечислены ниже:

* `Float32` — `float`.
* `Float64` — `double`.

Типы с плавающей запятой в ClickHouse имеют следующие псевдонимы:

* `Float32` — `FLOAT`, `REAL`, `SINGLE`.
* `Float64` — `DOUBLE`, `DOUBLE PRECISION`.

При создании таблиц для чисел с плавающей запятой можно задавать числовые параметры (например, `FLOAT(12)`, `FLOAT(15, 22)`, `DOUBLE(12)`, `DOUBLE(4, 18)`), но ClickHouse их игнорирует.


## Использование чисел с плавающей точкой {#using-floating-point-numbers}

- Вычисления с числами с плавающей точкой могут приводить к ошибкам округления.

<!-- -->

```sql
SELECT 1 - 0.9

┌───────minus(1, 0.9)─┐
│ 0.09999999999999998 │
└─────────────────────┘
```

- Результат вычисления зависит от метода вычисления (типа процессора и архитектуры компьютерной системы).
- Вычисления с плавающей точкой могут приводить к таким значениям, как бесконечность (`Inf`) и «не-число» (`NaN`). Это необходимо учитывать при обработке результатов вычислений.
- При парсинге чисел с плавающей точкой из текста результат может не соответствовать ближайшему машинно-представимому числу.


## NaN и Inf {#nan-and-inf}

В отличие от стандартного SQL, ClickHouse поддерживает следующие категории чисел с плавающей точкой:

- `Inf` – бесконечность.

<!-- -->

```sql
SELECT 0.5 / 0

┌─divide(0.5, 0)─┐
│            inf │
└────────────────┘
```

- `-Inf` — отрицательная бесконечность.

<!-- -->

```sql
SELECT -0.5 / 0

┌─divide(-0.5, 0)─┐
│            -inf │
└─────────────────┘
```

- `NaN` — не число.

<!-- -->

```sql
SELECT 0 / 0

┌─divide(0, 0)─┐
│          nan │
└──────────────┘
```

Правила сортировки `NaN` см. в разделе [Секция ORDER BY](../../sql-reference/statements/select/order-by.md).


## BFloat16 {#bfloat16}

`BFloat16` — это 16-битный тип данных с плавающей точкой, имеющий 8-битную экспоненту, знак и 7-битную мантиссу.
Он полезен для приложений машинного обучения и искусственного интеллекта.

ClickHouse поддерживает преобразования между `Float32` и `BFloat16`, которые
можно выполнить с помощью функций [`toFloat32()`](../functions/type-conversion-functions.md/#tofloat32) или [`toBFloat16`](../functions/type-conversion-functions.md/#tobfloat16).

:::note
Большинство других операций не поддерживается.
:::
