---
slug: '/sql-reference/aggregate-functions/reference/uniqthetasketch'
sidebar_position: 209
description: 'Вычисляет приблизительное количество различных значений аргументов,'
title: uniqTheta
doc_type: reference
---
Вычисляет приблизительное количество различных значений аргументов, используя [Theta Sketch Framework](https://datasketches.apache.org/docs/Theta/ThetaSketches.html#theta-sketch-framework).

```sql
uniqTheta(x[, ...])
```

**Аргументы**

Функция принимает переменное число параметров. Параметры могут быть `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовыми типами.

**Возвращаемое значение**

- Число типа [UInt64](../../../sql-reference/data-types/int-uint.md).

**Подробности реализации**

Функция:

- Вычисляет хеш для всех параметров в агрегации, затем использует его в расчетах.

- Использует алгоритм [KMV](https://datasketches.apache.org/docs/Theta/InverseEstimate.html) для приближения количества различных значений аргументов.

        Используются 4096 (2^12) 64-битные эскизы. Размер состояния составляет около 41 KB.

- Относительная ошибка составляет 3.125% (95% доверительный интервал), информацию о [таблице относительной ошибки](https://datasketches.apache.org/docs/Theta/ThetaErrorTable.html) смотрите для детальной информации.

**Смотрите также**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)