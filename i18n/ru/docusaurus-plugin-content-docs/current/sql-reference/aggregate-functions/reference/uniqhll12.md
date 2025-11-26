---
description: 'Вычисляет приблизительное количество различных значений аргумента с использованием алгоритма HyperLogLog.'
sidebar_position: 208
slug: /sql-reference/aggregate-functions/reference/uniqhll12
title: 'uniqHLL12'
doc_type: 'reference'
---

# uniqHLL12

Вычисляет приблизительное количество различных значений аргументов с использованием алгоритма [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog).

```sql
uniqHLL12(x[, ...])
```

**Аргументы**

Функция принимает переменное число параметров. Параметры могут иметь типы `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовые типы.

**Возвращаемое значение**

* Число типа [UInt64](../../../sql-reference/data-types/int-uint.md).

**Подробности реализации**

Функция:

* Вычисляет хэш для всех параметров в агрегате и затем использует его в вычислениях.

* Использует алгоритм HyperLogLog для приближённого подсчёта количества различных значений аргументов.

  Используются 2^12 5-битных ячеек. Размер состояния немного больше 2,5 КБ. Результат не очень точен (погрешность до ~10%) для небольших наборов данных (&lt;10K элементов). Однако результат достаточно точен для наборов данных с высокой кардинальностью (10K-100M), с максимальной погрешностью ~1,6%. Начиная со 100M элементов, ошибка оценки увеличивается, и функция будет возвращать крайне неточные результаты для наборов данных с чрезвычайно высокой кардинальностью (1B+ элементов).

* Обеспечивает детерминированный результат (он не зависит от порядка обработки запроса).

Мы не рекомендуем использовать эту функцию. В большинстве случаев используйте функцию [uniq](/sql-reference/aggregate-functions/reference/uniq) или [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined).

**См. также**

* [uniq](/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
