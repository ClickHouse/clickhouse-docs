---
description: 'Вычисляет приблизительное количество различных значений аргументов с использованием
  фреймворка Theta Sketch.'
sidebar_position: 209
slug: /sql-reference/aggregate-functions/reference/uniqthetasketch
title: 'uniqTheta'
---

Вычисляет приблизительное количество различных значений аргументов с использованием [фреймворка Theta Sketch](https://datasketches.apache.org/docs/Theta/ThetaSketches.html#theta-sketch-framework).

```sql
uniqTheta(x[, ...])
```

**Аргументы**

Функция принимает переменное количество параметров. Параметры могут быть `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовыми типами.

**Возвращаемое значение**

- Число типа [UInt64](../../../sql-reference/data-types/int-uint.md).

**Подробности реализации**

Функция:

- Вычисляет хеш для всех параметров в агрегате, затем использует его в расчетах.

- Использует алгоритм [KMV](https://datasketches.apache.org/docs/Theta/InverseEstimate.html) для приближения количества различных значений аргументов.

        Используются 4096 (2^12) 64-битных эскизов. Размер состояния составляет около 41 КБ.

- Относительная ошибка составляет 3.125% (95% доверительный интервал), см. [таблицу относительной ошибки](https://datasketches.apache.org/docs/Theta/ThetaErrorTable.html) для подробностей.

**См. также**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
