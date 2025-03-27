---
description: 'Вычисляет приблизительное количество различных значений аргументов с использованием
  алгоритма HyperLogLog.'
sidebar_position: 208
slug: /sql-reference/aggregate-functions/reference/uniqhll12
title: 'uniqHLL12'
---


# uniqHLL12

Вычисляет приблизительное количество различных значений аргументов, используя алгоритм [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog).

```sql
uniqHLL12(x[, ...])
```

**Аргументы**

Функция принимает переменное количество параметров. Параметрами могут быть `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовые типы.

**Возвращаемое значение**

- Число типа [UInt64](../../../sql-reference/data-types/int-uint.md).

**Детали реализации**

Функция:

- Вычисляет хеш для всех параметров в агрегате, затем использует его в вычислениях.

- Использует алгоритм HyperLogLog для оценки количества различных значений аргументов.

        Используются 2^12 5-битных ячеек. Размер состояния чуть больше 2.5 КБ. Результат не очень точен (до ~10% ошибки) для небольших наборов данных (&lt;10K элементов). Однако результат достаточно точен для наборов данных с высокой кардинальностью (10K-100M), с максимальной ошибкой около ~1.6%. Начиная с 100M, ошибка оценки увеличивается, и функция будет возвращать очень неточные результаты для наборов данных с крайне высокой кардинальностью (1B+ элементов).

- Обеспечивает детерминированный результат (не зависит от порядка обработки запроса).


Мы не рекомендуем использовать эту функцию. В большинстве случаев используйте функцию [uniq](/sql-reference/aggregate-functions/reference/uniq) или [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined).

**Смотрите также**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
