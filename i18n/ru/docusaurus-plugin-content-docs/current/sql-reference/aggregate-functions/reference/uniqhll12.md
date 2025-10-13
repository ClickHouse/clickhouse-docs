---
slug: '/sql-reference/aggregate-functions/reference/uniqhll12'
sidebar_position: 208
description: 'Вычисляет приближительное количество различных значений аргументов,'
title: uniqHLL12
doc_type: reference
---
# uniqHLL12

Выполняет вычисление приблизительного числа различных значений аргументов с использованием алгоритма [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog).

```sql
uniqHLL12(x[, ...])
```

**Аргументы**

Функция принимает переменное количество параметров. Параметры могут быть `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовыми типами.

**Возвращаемое значение**

- Число типа [UInt64](../../../sql-reference/data-types/int-uint.md).

**Детали реализации**

Функция:

- Вычисляет хеш для всех параметров в агрегации, затем использует его в вычислениях.

- Использует алгоритм HyperLogLog для приближения количества различных значений аргументов.

        Используются 2^12 5-битных ячеек. Размер состояния чуть более 2.5 КБ. Результат не очень точный (ошибка до ~10%) для небольших наборов данных (&lt;10K элементов). Однако, результат довольно точен для наборов данных с высокой кардинальностью (10K-100M), с максимальной ошибкой ~1.6%. Начиная с 100M, ошибка оценивания увеличивается, и функция будет возвращать очень неточные результаты для наборов данных с экстремально высокой кардинальностью (1B+ элементов).

- Обеспечивает детерминированный результат (он не зависит от порядка обработки запроса).

Мы не рекомендуем использовать эту функцию. В большинстве случаев используйте функцию [uniq](/sql-reference/aggregate-functions/reference/uniq) или [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined).

**См. также**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)