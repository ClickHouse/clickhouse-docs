---
description: 'Вычисляет приблизительное количество различных значений аргумента на основе фреймворка Theta Sketch.'
sidebar_position: 209
slug: /sql-reference/aggregate-functions/reference/uniqthetasketch
title: 'uniqTheta'
doc_type: 'reference'
---

Вычисляет приблизительное количество различных значений аргумента на основе [фреймворка Theta Sketch](https://datasketches.apache.org/docs/Theta/ThetaSketches.html#theta-sketch-framework).

```sql
uniqTheta(x[, ...])
```

**Аргументы**

Функция принимает переменное число параметров. Параметры могут иметь типы данных `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовые типы.

**Возвращаемое значение**

* Число типа [UInt64](../../../sql-reference/data-types/int-uint.md).

**Подробности реализации**

Функция:

* Вычисляет хеш для всех параметров в агрегате и затем использует его в вычислениях.

* Использует алгоритм [KMV](https://datasketches.apache.org/docs/Theta/InverseEstimate.html) для приближённой оценки количества различных значений аргументов.

  Используются 4096 (2^12) 64-битных эскизов (sketches). Размер состояния составляет около 41 КБ.

* Относительная погрешность — 3.125 % (95 % доверительный интервал), подробности см. в [таблице относительной погрешности](https://datasketches.apache.org/docs/Theta/ThetaErrorTable.html).

**См. также**

* [uniq](/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
* [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
