---
slug: '/sql-reference/aggregate-functions/reference/uniq'
sidebar_position: 204
description: 'Вычисляет временное количество различных значений аргумента.'
title: uniq
doc_type: reference
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

**Детали реализации**

Функция:

- Вычисляет хеш для всех параметров в агрегации, а затем использует его в расчетах.

- Использует адаптивный алгоритм выборки. Для состояния расчета функция использует выборку хеш-значений элементов до 65536. Этот алгоритм очень точный и очень эффективный по отношению к CPU. Когда запрос содержит несколько из этих функций, использование `uniq` почти так же быстро, как использование других аггрегатных функций.

- Обеспечивает результат детерминирированно (он не зависит от порядка обработки запросов).

Мы рекомендуем использовать эту функцию почти во всех сценариях.

**Смотрите также**

- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)