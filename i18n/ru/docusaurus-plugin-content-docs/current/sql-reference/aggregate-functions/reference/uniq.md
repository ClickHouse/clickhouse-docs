---
description: 'Вычисляет приблизительное число различных значений аргумента.'
sidebar_position: 204
slug: /sql-reference/aggregate-functions/reference/uniq
title: 'uniq'
doc_type: 'reference'
---

# uniq

Вычисляет приблизительное количество различных значений аргумента.

```sql
uniq(x[, ...])
```

**Аргументы**

Функция принимает переменное количество аргументов. Аргументы могут иметь типы `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовые типы.

**Возвращаемое значение**

* Число типа [UInt64](../../../sql-reference/data-types/int-uint.md).

**Подробности реализации**

Функция:

* Вычисляет хеш для всех аргументов в агрегатной функции, затем использует его в вычислениях.

* Использует адаптивный алгоритм выборки. Для хранения состояния вычисления функция использует выборку значений хешей элементов размером до 65536. Этот алгоритм очень точный и очень эффективный с точки зрения использования CPU. Когда запрос содержит несколько таких функций, использование `uniq` почти так же быстро, как использование других агрегатных функций.

* Возвращает детерминированный результат (он не зависит от порядка обработки запроса).

Рекомендуем использовать эту функцию почти во всех сценариях.

**См. также**

* [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
* [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
