---
slug: /sql-reference/aggregate-functions/reference/uniq
sidebar_position: 204
title: 'uniq'
description: 'Вызывает приблизительное количество различных значений аргумента.'
---


# uniq

Вызывает приблизительное количество различных значений аргумента.

``` sql
uniq(x[, ...])
```

**Аргументы**

Функция принимает переменное количество параметров. Параметры могут быть `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовыми типами.

**Возвращаемое значение**

- Число типа [UInt64](../../../sql-reference/data-types/int-uint.md).

**Детали реализации**

Функция:

- Вычисляет хеш для всех параметров в агрегате, затем использует его в расчетах.

- Использует адаптивный алгоритм выборки. Для состояния расчета функция использует выборку значений хешей элементов до 65536. Этот алгоритм очень точен и очень эффективен для ЦП. Когда запрос содержит несколько таких функций, использование `uniq` почти так же быстро, как использование других агрегатных функций.

- Предоставляет результат детерминистически (он не зависит от порядка обработки запроса).

Мы рекомендуем использовать эту функцию практически во всех сценариях.

**Смотрите также**

- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
