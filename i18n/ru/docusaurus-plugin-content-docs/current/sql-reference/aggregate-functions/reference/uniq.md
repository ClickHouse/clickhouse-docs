---
description: 'Выдает приблизительное число различных значений аргумента.'
sidebar_position: 204
slug: /sql-reference/aggregate-functions/reference/uniq
title: 'uniq'
---


# uniq

Выдает приблизительное число различных значений аргумента.

```sql
uniq(x[, ...])
```

**Аргументы**

Функция принимает переменное число параметров. Параметры могут быть `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовыми типами.

**Возвращаемое значение**

- Число типа [UInt64](../../../sql-reference/data-types/int-uint.md).

**Детали реализации**

Функция:

- Вычисляет хеш для всех параметров в агрегате, затем использует его в вычислениях.

- Использует алгоритм адаптивного выборки. Для состояния вычисления функция использует выборку хеш-значений элементов до 65536. Этот алгоритм является очень точным и очень эффективным для CPU. Когда запрос содержит несколько таких функций, использование `uniq` почти так же быстро, как использование других агрегатных функций.

- Предоставляет результат детерминированно (он не зависит от порядка обработки запроса).

Мы рекомендуем использовать эту функцию почти во всех сценариях.

**Смотрите также**

- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
