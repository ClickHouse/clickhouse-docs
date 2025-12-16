---
description: 'Вычисляет приблизительное количество различных значений аргументов.'
sidebar_position: 205
slug: /sql-reference/aggregate-functions/reference/uniqcombined
title: 'uniqCombined'
doc_type: 'reference'
---

# uniqCombined {#uniqcombined}

Вычисляет приблизительное количество различных значений аргументов.

```sql
uniqCombined(HLL_precision)(x[, ...])
```

Функция `uniqCombined` — хороший выбор для вычисления количества различных значений.

**Аргументы**

* `HLL_precision`: двоичный логарифм количества ячеек в [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog). Необязательный параметр, функцию можно использовать как `uniqCombined(x[, ...])`. Значение по умолчанию для `HLL_precision` равно 17, что фактически соответствует 96 КиБ памяти (2^17 ячеек по 6 бит каждая).
* `X`: переменное количество параметров. Параметры могут иметь типы `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовые типы.

**Возвращаемое значение**

* Число типа [UInt64](../../../sql-reference/data-types/int-uint.md).

**Подробности реализации**

Функция `uniqCombined`:

* Вычисляет хеш (64-битный хеш для `String` и 32-битный в остальных случаях) для всех параметров в агрегатной функции и затем использует его в вычислениях.
* Использует комбинацию из трёх алгоритмов: массива, хеш-таблицы и HyperLogLog с таблицей коррекции ошибок.
  * Для малого количества различных элементов используется массив.
  * Когда размер множества больше, используется хеш-таблица.
  * Для ещё большего количества элементов используется HyperLogLog, который занимает фиксированный объём памяти.
* Возвращает детерминированный результат (он не зависит от порядка обработки запроса).

:::note
Поскольку для типов, отличных от `String`, используется 32-битный хеш, результат будет иметь очень большую погрешность для кардинальностей, значительно превышающих `UINT_MAX` (ошибка быстро возрастает после нескольких десятков миллиардов различных значений). Поэтому в таком случае следует использовать [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64).
:::

По сравнению с функцией [uniq](/sql-reference/aggregate-functions/reference/uniq), функция `uniqCombined`:

* Потребляет в несколько раз меньше памяти.
* Обеспечивает точность в несколько раз выше.
* Обычно имеет немного более низкую производительность. В некоторых сценариях `uniqCombined` может работать быстрее, чем `uniq`, например, при распределённых запросах, которые передают по сети большое количество состояний агрегации.

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

См. раздел с примерами в описании [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64), где показана разница между `uniqCombined` и `uniqCombined64` на значительно больших объёмах входных данных.

**См. также**

* [uniq](/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
* [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
