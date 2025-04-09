---
description: 'Вычисляет приблизительное количество различных значений аргумента.'
sidebar_position: 204
slug: /sql-reference/aggregate-functions/reference/uniq
title: 'uniq'
---


# uniq

Вычисляет приблизительное количество различных значений аргумента.

```sql
uniq(x[, ...])
```

**Аргументы**

Функция принимает переменное количество параметров. Параметры могут быть `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовыми типами.

**Возвращаемое значение**

- Число типа [UInt64](../../../sql-reference/data-types/int-uint.md).

**Подробности реализации**

Функция:

- Вычисляет хеш для всех параметров в агрегации, затем использует его в расчетах.

- Использует алгоритм адаптивной выборки. Для состояния вычисления функция использует выборку хеш-значений элементов до 65536. Этот алгоритм очень точен и очень эффективен для CPU. Когда запрос содержит несколько таких функций, использование `uniq` практически так же быстро, как и использование других агрегатных функций.

- Обеспечивает предсказуемый результат (он не зависит от порядка обработки запроса).

Мы рекомендуем использовать эту функцию в практически всех сценариях.

**См. также**

- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
