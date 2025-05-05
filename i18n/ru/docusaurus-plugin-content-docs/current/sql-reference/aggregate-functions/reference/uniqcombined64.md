---
description: 'Вычитывает приблизительное количество различных значений аргументов. Это аналогично uniqCombined, но использует 64-битный хеш для всех типов данных, а не только для типа String.'
sidebar_position: 206
slug: /sql-reference/aggregate-functions/reference/uniqcombined64
title: 'uniqCombined64'
---


# uniqCombined64

Вычитывает приблизительное количество различных значений аргументов. Это аналогично [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined), но использует 64-битный хеш для всех типов данных, а не только для типа String.

```sql
uniqCombined64(HLL_precision)(x[, ...])
```

**Параметры**

- `HLL_precision`: Основание логарифма по 2 для количества ячеек в [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog). Опционально, вы можете использовать функцию как `uniqCombined64(x[, ...])`. Значение по умолчанию для `HLL_precision` равно 17, что соответствует 96 KiB памяти (2^17 ячеек по 6 бит каждое).
- `X`: Переменное количество параметров. Параметры могут быть `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовыми типами.

**Возвращаемое значение**

- Число типа [UInt64](../../../sql-reference/data-types/int-uint.md).

**Детали реализации**

Функция `uniqCombined64`:
- Вычисляет хеш (64-битный хеш для всех типов данных) для всех параметров в агрегации, затем использует его в расчетах.
- Использует комбинацию трех алгоритмов: массив, хеш-таблица и HyperLogLog с таблицей для исправления ошибок.
    - Для небольшого количества различных элементов используется массив.
    - Когда размер множества больше, используется хеш-таблица.
    - Для большего количества элементов используется HyperLogLog, который займет фиксированное количество памяти.
- Обеспечивает детерминированный результат (он не зависит от порядка обработки запроса).

:::note
Поскольку он использует 64-битный хеш для всех типов, результат не страдает от очень высокой ошибки для кардинальностей, значительно превышающих `UINT_MAX`, как это делает [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md), который использует 32-битный хеш для типов, отличных от `String`.
:::

По сравнению с функцией [uniq](/sql-reference/aggregate-functions/reference/uniq), функция `uniqCombined64`:

- Использует в несколько раз меньше памяти.
- Вычисляет с в несколько раз большей точностью.

**Пример**

В приведенном ниже примере `uniqCombined64` выполняется на `1e10` различных чисел, возвращая очень близкую приближенную оценку количества различных значений аргументов.

Запрос:

```sql
SELECT uniqCombined64(number) FROM numbers(1e10);
```

Результат:

```response
┌─uniqCombined64(number)─┐
│             9998568925 │ -- 10.00 миллиардов
└────────────────────────┘
```

Для сравнения, функция `uniqCombined` возвращает довольно плохую приближенную оценку для такого размера входных данных.

Запрос:

```sql
SELECT uniqCombined(number) FROM numbers(1e10);
```

Результат:

```response
┌─uniqCombined(number)─┐
│           5545308725 │ -- 5.55 миллиардов
└──────────────────────┘
```

**См. также**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
