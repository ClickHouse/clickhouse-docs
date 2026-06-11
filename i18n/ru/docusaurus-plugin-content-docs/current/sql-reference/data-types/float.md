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
Если вам нужны точные вычисления, в частности, если вы работаете с финансовыми или бизнес-данными, требующими высокой точности, вам следует рассмотреть использование [Decimal](../data-types/decimal.md).

[Числа с плавающей запятой](https://en.wikipedia.org/wiki/IEEE_754) могут приводить к неточным результатам, как показано ниже:

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

Эквивалентные типы в ClickHouse и в C приведены ниже:

* `Float32` — `float`.
* `Float64` — `double`.

Типы Float в ClickHouse имеют следующие алиасы:

* `Float32` — `FLOAT`, `REAL`, `SINGLE`.
* `Float64` — `DOUBLE`, `DOUBLE PRECISION`.

При создании таблиц можно устанавливать числовые параметры для чисел с плавающей точкой (например, `FLOAT(12)`, `FLOAT(15, 22)`, `DOUBLE(12)`, `DOUBLE(4, 18)`), но ClickHouse игнорирует их.


## Использование чисел с плавающей точкой \{#using-floating-point-numbers\}

* Вычисления с числами с плавающей точкой могут привести к ошибке округления.

{/* */ }

```sql
SELECT 1 - 0.9

┌───────minus(1, 0.9)─┐
│ 0.09999999999999998 │
└─────────────────────┘
```

* Результат вычисления зависит от метода вычисления (типа процессора и архитектуры компьютерной системы).
* Вычисления с плавающей точкой могут привести к таким числам, как бесконечность (`Inf`) и &quot;не-число&quot; (`NaN`). Это следует учитывать при обработке результатов вычислений.
* При разборе чисел с плавающей точкой из текста результат может не быть ближайшим машинно-представимым числом.


## NaN и Inf \{#nan-and-inf\}

В отличие от стандартного SQL, ClickHouse поддерживает следующие категории чисел с плавающей точкой:

* `Inf` – Бесконечность.

{/* */ }

```sql
SELECT 0.5 / 0

┌─divide(0.5, 0)─┐
│            inf │
└────────────────┘
```

* `-Inf` — Отрицательная бесконечность.

{/* */ }

```sql
SELECT -0.5 / 0

┌─divide(-0.5, 0)─┐
│            -inf │
└─────────────────┘
```

* `NaN` — Не число.

{/* */ }

```sql
SELECT 0 / 0

┌─divide(0, 0)─┐
│          nan │
└──────────────┘
```

См. правила сортировки `NaN` в разделе [предложение ORDER BY](../../sql-reference/statements/select/order-by.md).


## Значения NaN в семантике множеств \{#nan-values-in-set-semantics\}

Стандарт IEEE 754 определяет `NaN` так, что скалярное сравнение `NaN = NaN` возвращает `false`.
ClickHouse следует этому правилу для оператора `=`.

Однако `NaN` — это не одно конкретное значение, а любая битовая комбинация, у которой экспонента состоит только из единиц, а
мантисса не равна нулю. Разные операции и разные архитектуры CPU могут порождать значения `NaN`
с разными знаковыми битами или разным содержимым мантиссы. Например:

* `0./0.` порождает `NaN`, у которого на большинстве платформ x86 знаковый бит равен 1.
* Литерал `nan` порождает `NaN`, у которого знаковый бит равен 0.
* После [PR #98230](https://github.com/ClickHouse/ClickHouse/pull/98230) реализация AArch64 NEON для
  `log` возвращает `NaN`, у которого знаковый бит отличается от скалярного `log` из glibc для отрицательных входных значений.

Хеш-таблицы в ClickHouse сравнивают ключи побайтно, поэтому разные битовые комбинации `NaN` хешируются в
разные бакеты и рассматриваются как разные значения в операциях с семантикой множеств, включая
`DISTINCT`, `GROUP BY`, `uniqExact`, `countDistinct` и `JOIN` по равенству по ключу `Float`:

```sql
SELECT countDistinct(arrayJoin([0./0., nan, log(-1.)]));
-- May return 2 or 3 depending on architecture and build, even though all three inputs are NaN.
```

Это соответствует IEEE 754 (каждый `NaN` не равен ни одному другому значению, включая самого себя),
но это может показаться неожиданным. Если вам нужно, чтобы операции с семантикой множества считали все значения `NaN` равными,
приведите их к каноническому виду в запросе:

```sql
-- Replace every NaN with a single canonical NaN value
SELECT countDistinct(if(isNaN(x), CAST('nan' AS Float64), x))
FROM (SELECT arrayJoin([0./0., nan, log(-1.)]) AS x);
-- Returns 1.

-- Or exclude NaN values from the set entirely
SELECT countDistinct(if(isNaN(x), NULL, x))
FROM (SELECT arrayJoin([0./0., nan, log(-1.)]) AS x);
-- Returns 0.
```

Тот же подход применим к ключам `DISTINCT`, `GROUP BY` и `JOIN`.

## BFloat16 \{#bfloat16\}

`BFloat16` — это 16-битный тип данных с плавающей точкой с 8-битной экспонентой, знаком и 7-битной мантиссой. 
Он полезен для приложений машинного обучения и искусственного интеллекта.

ClickHouse поддерживает преобразования между `Float32` и `BFloat16`, которые 
могут быть выполнены с использованием функций [`toFloat32()`](../functions/type-conversion-functions.md/#toFloat32) или [`toBFloat16`](../functions/type-conversion-functions.md/#toBFloat16).

:::note
Большинство других операций не поддерживаются.
:::