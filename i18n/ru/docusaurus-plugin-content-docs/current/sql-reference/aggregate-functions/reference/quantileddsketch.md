---
description: 'Вычисляет приблизительный квантиль выборки с гарантированной относительной погрешностью.'
sidebar_position: 171
slug: /sql-reference/aggregate-functions/reference/quantileddsketch
title: 'quantileDD'
doc_type: 'reference'
---

Вычисляет приблизительный [квантиль](https://en.wikipedia.org/wiki/Quantile) выборки с гарантированной относительной погрешностью. Работает на основе построения [DD](https://www.vldb.org/pvldb/vol12/p2195-masson.pdf).

**Синтаксис**

```sql
quantileDD(relative_accuracy, [level])(expr)
```

**Аргументы**

* `expr` — Столбец с числовыми данными. [Integer](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md).

**Параметры**

* `relative_accuracy` — Относительная точность квантиля. Возможные значения — в диапазоне от 0 до 1. [Float](../../../sql-reference/data-types/float.md). Размер скетча зависит от диапазона данных и относительной точности. Чем больше диапазон и чем меньше относительная точность, тем больше скетч. Приблизительный объём памяти, занимаемый скетчем, — `log(max_value/min_value)/relative_accuracy`. Рекомендуемое значение — 0.001 или выше.

* `level` — Уровень квантиля. Необязательный параметр. Возможные значения — в диапазоне от 0 до 1. Значение по умолчанию: 0.5. [Float](../../../sql-reference/data-types/float.md).

**Возвращаемое значение**

* Приблизительный квантиль указанного уровня.

Тип: [Float64](/sql-reference/data-types/float).

**Пример**

Во входной таблице есть столбцы целого типа и типа с плавающей запятой:

```text
┌─a─┬─────b─┐
│ 1 │ 1.001 │
│ 2 │ 1.002 │
│ 3 │ 1.003 │
│ 4 │ 1.004 │
└───┴───────┘
```

Запрос для вычисления квантили 0,75 (третьего квартиля):

```sql
SELECT quantileDD(0.01, 0.75)(a), quantileDD(0.01, 0.75)(b) FROM example_table;
```

Результат:

```text
┌─quantileDD(0.01, 0.75)(a)─┬─quantileDD(0.01, 0.75)(b)─┐
│               2.974233423476717 │                            1.01 │
└─────────────────────────────────┴─────────────────────────────────┘
```

**См. также**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
