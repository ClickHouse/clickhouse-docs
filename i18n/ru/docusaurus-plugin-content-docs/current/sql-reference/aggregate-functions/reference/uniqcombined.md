---
slug: /sql-reference/aggregate-functions/reference/uniqcombined
sidebar_position: 205
title: 'uniqCombined'
description: 'Вычисляет приблизительное количество различных значений аргументов.'
---


# uniqCombined

Вычисляет приблизительное количество различных значений аргументов.

``` sql
uniqCombined(HLL_precision)(x[, ...])
```

Функция `uniqCombined` является хорошим выбором для вычисления количества различных значений.

**Аргументы**

- `HLL_precision`: Двоичный логарифм количества ячеек в [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog). Опционально, вы можете использовать функцию как `uniqCombined(x[, ...])`. Значение по умолчанию для `HLL_precision` равно 17, что эквивалентно 96 KiB памяти (2^17 ячеек, по 6 бит каждая).
- `X`: Переменное количество параметров. Параметры могут быть типа `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовых типов.


**Возвращаемое значение**

- Число типа [UInt64](../../../sql-reference/data-types/int-uint.md).

**Детали реализации**

Функция `uniqCombined`:

- Вычисляет хэш (64-битный хэш для `String` и 32-битный в противном случае) для всех параметров в агрегате, а затем использует его в расчетах.
- Использует комбинацию трех алгоритмов: массив, хэш-таблица и HyperLogLog с таблицей коррекции ошибок.
    - Для небольшого количества различных элементов используется массив. 
    - Когда размер множества больше, используется хэш-таблица. 
    - Для большего количества элементов используется HyperLogLog, который занимает фиксированное количество памяти.
- Обеспечивает детерминированный результат (он не зависит от порядка обработки запросов).

:::note    
Поскольку используется 32-битный хэш для не-`String` типов, результат будет иметь очень высокую погрешность для кардинальностей, значительно превышающих `UINT_MAX` (погрешность быстро возрастает после нескольких десятков миллиардов различных значений), поэтому в этом случае вы должны использовать [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64).
:::

По сравнению с функцией [uniq](/sql-reference/aggregate-functions/reference/uniq), функция `uniqCombined`:

- Потребляет в несколько раз меньше памяти.
- Вычисляет с гораздо более высокой точностью.
- Обычно имеет немного более низкую производительность. В некоторых сценариях `uniqCombined` может работать быстрее, чем `uniq`, например, при распределенных запросах, которые передают большое количество состояний агрегации по сети.

**Пример**

Запрос:

```sql
SELECT uniqCombined(number) FROM numbers(1e6);
```

Результат:

```response
┌─uniqCombined(number)─┐
│              1001148 │ -- 1.00 million
└──────────────────────┘
```

Смотрите раздел примеров [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) для примера различий между `uniqCombined` и `uniqCombined64` для значительно больших объемов данных.

**См. также**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
