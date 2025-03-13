---
slug: /sql-reference/aggregate-functions/reference/uniqthetasketch
sidebar_position: 209
title: uniqTheta
description: "Вычисляет приблизительное количество различных значений аргументов, используя Theta Sketch Framework."
---

Вычисляет приблизительное количество различных значений аргументов, используя [Theta Sketch Framework](https://datasketches.apache.org/docs/Theta/ThetaSketchFramework.html).

``` sql
uniqTheta(x[, ...])
```

**Аргументы**

Функция принимает переменное количество параметров. Параметры могут быть `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовыми типами.

**Возвращаемое значение**

- Число типа [UInt64](../../../sql-reference/data-types/int-uint.md).

**Детали реализации**

Функция:

- Вычисляет хэш для всех параметров в агрегате, затем использует его в расчетах.

- Использует алгоритм [KMV](https://datasketches.apache.org/docs/Theta/InverseEstimate.html) для приближенного подсчета количества различных значений аргументов.

        Используются 4096 (2^12) 64-битных эскизов. Размер состояния составляет около 41 КБ.

- Относительная ошибка составляет 3.125% (95% доверительный интервал), см. [таблицу относительных ошибок](https://datasketches.apache.org/docs/Theta/ThetaErrorTable.html) для подробной информации.

**Смотрите также**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
