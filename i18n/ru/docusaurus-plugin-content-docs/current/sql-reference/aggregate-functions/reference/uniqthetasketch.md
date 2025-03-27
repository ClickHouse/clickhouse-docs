---
description: 'Вычисляет приблизительное количество различных значений аргументов, используя
  фреймворк Theta Sketch.'
sidebar_position: 209
slug: /sql-reference/aggregate-functions/reference/uniqthetasketch
title: 'uniqTheta'
---

Вычисляет приблизительное количество различных значений аргументов, используя [фреймворк Theta Sketch](https://datasketches.apache.org/docs/Theta/ThetaSketchFramework.html).

```sql
uniqTheta(x[, ...])
```

**Аргументы**

Функция принимает переменное количество параметров. Параметры могут быть типа `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовых типов.

**Возвращаемое значение**

- Число типа [UInt64](../../../sql-reference/data-types/int-uint.md).

**Детали реализации**

Функция:

- Вычисляет хеш для всех параметров в агрегате, затем использует его в вычислениях.

- Использует алгоритм [KMV](https://datasketches.apache.org/docs/Theta/InverseEstimate.html) для приближенного подсчета количества различных значений аргументов.

        Используются 4096 (2^12) 64-битные эскизы. Размер состояния составляет около 41 КБ.

- Относительная ошибка составляет 3.125% (95% доверительный интервал), подробности см. в [таблице относительных ошибок](https://datasketches.apache.org/docs/Theta/ThetaErrorTable.html).

**См. также**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
