---
description: 'Вычисляет приблизительное количество различных значений аргументов.'
sidebar_position: 205
slug: /sql-reference/aggregate-functions/reference/uniqcombined
title: 'uniqCombined'
---


# uniqCombined

Вычисляет приблизительное количество различных значений аргументов.

```sql
uniqCombined(HLL_precision)(x[, ...])
```

Функция `uniqCombined` является хорошим выбором для вычисления числа различных значений.

**Аргументы**

- `HLL_precision`: Двоичный логарифм числа ячеек в [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog). Необязательный параметр, вы можете использовать функцию как `uniqCombined(x[, ...])`. Значение по умолчанию для `HLL_precision` равно 17, что соответствует 96 KiB пространства (2^17 ячеек по 6 бит каждая).
- `X`: Переменное количество параметров. Параметры могут быть типов `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовых типов.

**Возвращаемое значение**

- Число типа [UInt64](../../../sql-reference/data-types/int-uint.md).

**Детали реализации**

Функция `uniqCombined`:

- Вычисляет хеш (64-битный хеш для `String` и 32-битный для других типов) для всех параметров в агрегате, а затем использует его в расчетах.
- Использует комбинацию трех алгоритмов: массив, хеш-таблица и HyperLogLog с таблицей коррекции ошибок.
    - Для небольшого числа различных элементов используется массив.
    - Когда размер выборки больше, используется хеш-таблица.
    - Для большего числа элементов используется HyperLogLog, который занимает фиксированное количество памяти.
- Предоставляет результат детерминированно (он не зависит от порядка обработки запроса).

:::note    
Поскольку для типов, отличных от `String`, используется 32-битный хеш, результат будет иметь очень большую ошибку для кардинальностей, значительно превышающих `UINT_MAX` (ошибка будет быстро расти после нескольких десятков миллиардов различных значений), поэтому в этом случае следует использовать [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64).
:::

По сравнению с функцией [uniq](/sql-reference/aggregate-functions/reference/uniq), функция `uniqCombined`:

- Потребляет в несколько раз меньше памяти.
- Вычисляет с в несколько раз большей точностью.
- Обычно имеет немного более низкую производительность. В некоторых сценариях `uniqCombined` может работать лучше, чем `uniq`, например, при распределенных запросах, которые передают большое количество состояний агрегации по сети.

**Пример**

Запрос:

```sql
SELECT uniqCombined(number) FROM numbers(1e6);
```

Результат:

```response
┌─uniqCombined(number)─┐
│              1001148 │ -- 1.00 миллион
└──────────────────────┘
```

Смотрите раздел примеров для [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) для примера различий между `uniqCombined` и `uniqCombined64` для гораздо больших входных данных.

**Смотрите также**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
