---
slug: /sql-reference/aggregate-functions/reference/uniqhll12
sidebar_position: 208
title: 'uniqHLL12'
description: 'Вычисляет приближенное количество различных значений аргументов, используя алгоритм HyperLogLog.'
---


# uniqHLL12

Вычисляет приближенное количество различных значений аргументов, используя алгоритм [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog).

``` sql
uniqHLL12(x[, ...])
```

**Аргументы**

Функция принимает переменное количество параметров. Параметры могут быть `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовыми типами.

**Возвращаемое значение**

- Число типа [UInt64](../../../sql-reference/data-types/int-uint.md).

**Подробности реализации**

Функция:

- Вычисляет хэш для всех параметров в агрегате, затем использует его в расчетах.

- Использует алгоритм HyperLogLog для приближенного подсчета количества различных значений аргументов.

        Используются ячейки размером 5 бит по 2^12. Размер состояния немного больше 2.5 КБ. Результат не очень точен (ошибка до ~10%) для небольших наборов данных (&lt;10K элементов). Однако результат довольно точен для наборов данных с высокой кардинальностью (10K-100M), с максимальной ошибкой ~1.6%. Начиная с 100M, ошибка оценки увеличивается, и функция будет возвращать очень неточные результаты для наборов данных с чрезвычайно высокой кардинальностью (1B+ элементов).

- Обеспечивает детерминированный результат (он не зависит от порядка обработки запроса).

Мы не рекомендуем использовать эту функцию. В большинстве случаев используйте функцию [uniq](/sql-reference/aggregate-functions/reference/uniq) или [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined).

**Смотрите также**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
