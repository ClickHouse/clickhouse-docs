---
slug: '/sql-reference/aggregate-functions/reference/uniqcombined64'
sidebar_position: 206
description: 'Вычисляет количество различных значений аргументов. Это то же самое,'
title: uniqCombined64
doc_type: reference
---
# uniqCombined64

Вычисляет приблизительное количество различных значений аргументов. Это то же самое, что и [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined), но использует 64-битный хеш для всех типов данных, а не только для типа String.

```sql
uniqCombined64(HLL_precision)(x[, ...])
```

**Параметры**

- `HLL_precision`: Бинарный логарифм количества ячеек в [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog). При желании вы можете использовать функцию как `uniqCombined64(x[, ...])`. Значение по умолчанию для `HLL_precision` равно 17, что эквивалентно 96 Киб (2^17 ячеек по 6 бит каждая).
- `X`: Переменное количество параметров. Параметры могут быть `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовыми типами.

**Возвращаемое значение**

- Число типа [UInt64](../../../sql-reference/data-types/int-uint.md).

**Детали реализации**

Функция `uniqCombined64`:
- Вычисляет хеш (64-битный хеш для всех типов данных) для всех параметров в агрегации, а затем использует его в расчетах.
- Использует комбинацию трех алгоритмов: массив, хеш-таблица и HyperLogLog с таблицей коррекции ошибок.
  - Для небольшого количества различных элементов используется массив.
  - Когда размер множества больше, используется хеш-таблица.
  - Для большего количества элементов используется HyperLogLog, который занимает фиксированное количество памяти.
- Обеспечивает детерминированный результат (он не зависит от порядка обработки запроса).

:::note
Поскольку используется 64-битный хеш для всех типов, результат не страдает от очень высокой ошибки для кардинальностей, значительно превышающих `UINT_MAX`, как это делает [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md), который использует 32-битный хеш для не-`String` типов.
:::

По сравнению с функцией [uniq](/sql-reference/aggregate-functions/reference/uniq), функция `uniqCombined64`:

- Потребляет в несколько раз меньше памяти.
- Вычисляет с в несколько раз большей точностью.

**Пример**

В приведенном ниже примере `uniqCombined64` запускается на `1e10` различных числах, возвращая очень близкое приближение количества различных значений аргументов. 

Запрос:

```sql
SELECT uniqCombined64(number) FROM numbers(1e10);
```

Результат:

```response
┌─uniqCombined64(number)─┐
│             9998568925 │ -- 10.00 billion
└────────────────────────┘
```

Для сравнения функция `uniqCombined` возвращает довольно плохое приближение для такого размера входных данных.

Запрос:

```sql
SELECT uniqCombined(number) FROM numbers(1e10);
```

Результат:

```response
┌─uniqCombined(number)─┐
│           5545308725 │ -- 5.55 billion
└──────────────────────┘
```

**См. также**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)