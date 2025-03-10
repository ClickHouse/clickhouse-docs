---
slug: /sql-reference/aggregate-functions/reference/entropy
sidebar_position: 131
title: 'entropy'
description: 'Calculates Shannon entropy of for a column of values.'
---


# entropy

Вызывает [энтропию Шеннона](https://en.wikipedia.org/wiki/Entropy_(information_theory)) для колонки значений.

**Синтаксис**

``` sql
entropy(val)
```

**Аргументы**

- `val` — Колонка значений любого типа.

**Возвращаемое значение**

- Этропия Шеннона.

Тип: [Float64](../../../sql-reference/data-types/float.md).

**Пример**

Запрос:

``` sql
CREATE TABLE entropy (`vals` UInt32,`strings` String) ENGINE = Memory;

INSERT INTO entropy VALUES (1, 'A'), (1, 'A'), (1,'A'), (1,'A'), (2,'B'), (2,'B'), (2,'C'), (2,'D');

SELECT entropy(vals), entropy(strings) FROM entropy;
```

Результат:

``` text
┌─entropy(vals)─┬─entropy(strings)─┐
│             1 │             1.75 │
└───────────────┴──────────────────┘
```
