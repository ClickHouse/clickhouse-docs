---
slug: '/sql-reference/aggregate-functions/reference/uniqcombined'
sidebar_position: 205
description: 'Вычисляет применно количество различных значений аргумента.'
title: uniqCombined
doc_type: reference
---
# uniqCombined

Вычисляет приблизительное количество различных значений аргументов.

```sql
uniqCombined(HLL_precision)(x[, ...])
```

Функция `uniqCombined` является хорошим выбором для вычисления количества различных значений.

**Аргументы**

- `HLL_precision`: База-2 логарифм количества ячеек в [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog). Необязательный, вы можете использовать функцию как `uniqCombined(x[, ...])`. Значение по умолчанию для `HLL_precision` — 17, что фактически соответствует 96 KiB пространства (2^17 ячеек, по 6 бит каждая).
- `X`: Переменное число параметров. Параметры могут быть `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовыми типами.

**Возвращаемое значение**

- Число типа [UInt64](../../../sql-reference/data-types/int-uint.md).

**Детали реализации**

Функция `uniqCombined`:

- Вычисляет хеш (64-битный хеш для `String` и 32-битный в противном случае) для всех параметров в агрегате, затем использует его в вычислениях.
- Использует комбинацию трех алгоритмов: массив, хеш-таблица и HyperLogLog с таблицей коррекции ошибок.
  - Для небольшого количества различных элементов используется массив.
  - Когда размер набора больше, используется хеш-таблица.
  - Для большего количества элементов используется HyperLogLog, который занимает фиксированное количество памяти.
- Обеспечивает детерминированный результат (он не зависит от порядка обработки запроса).

:::note    
Поскольку используется 32-битный хеш для типов, отличных от `String`, результат будет иметь очень высокую ошибку для кардинальностей, значительно превышающих `UINT_MAX` (ошибка быстро увеличится после нескольких десятков миллиардов различных значений), поэтому в этом случае вы должны использовать [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64).
:::

В сравнении с функцией [uniq](/sql-reference/aggregate-functions/reference/uniq), функция `uniqCombined`:

- Потребляет в несколько раз меньше памяти.
- Вычисляет с в несколько раз большей точностью.
- Обычно имеет немного более низкую производительность. В некоторых сценариях `uniqCombined` может работать быстрее, чем `uniq`, например, при распределенных запросах, которые передают большое количество состояний агрегации через сеть.

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

См. раздел примеров для [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64), чтобы увидеть различие между `uniqCombined` и `uniqCombined64` для гораздо больших входных данных.

**Смотрите также**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)