---
description: 'Вычисляет примерное число различных значений аргумента с использованием алгоритма HyperLogLog.'
sidebar_position: 208
slug: /sql-reference/aggregate-functions/reference/uniqhll12
title: 'uniqHLL12'
doc_type: 'reference'
---

# uniqHLL12

Вычисляет приблизительное число различных значений аргумента с использованием алгоритма [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog).

```sql
uniqHLL12(x[, ...])
```

**Аргументы**

Функция принимает переменное число параметров. Параметры могут иметь типы `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовые типы.

**Возвращаемое значение**

* Число типа [UInt64](../../../sql-reference/data-types/int-uint.md).

**Подробности реализации**

Функция:

* Вычисляет хеш для всех параметров в агрегате, затем использует его в вычислениях.

* Использует алгоритм HyperLogLog для приближённой оценки числа различных значений аргументов.

  Используется 2^12 ячеек по 5 бит. Размер состояния немного превышает 2,5 КБ. Результат недостаточно точен (погрешность до ~10%) для небольших наборов данных (&lt;10K элементов). Однако результат достаточно точен для наборов данных с высокой кардинальностью (10K–100M), с максимальной погрешностью около ~1,6%. Начиная примерно со 100M, ошибка оценки возрастает, и функция будет возвращать сильно неточные результаты для наборов данных с чрезвычайно высокой кардинальностью (1B+ элементов).

* Обеспечивает детерминированный результат (он не зависит от порядка обработки данных в запросе).

Мы не рекомендуем использовать эту функцию. В большинстве случаев используйте функцию [uniq](/sql-reference/aggregate-functions/reference/uniq) или [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined).

**См. также**

* [uniq](/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
