---
description: 'Вычисляет приблизительное количество различных значений аргумента.'
sidebar_position: 205
slug: /sql-reference/aggregate-functions/reference/uniqcombined
title: 'uniqCombined'
doc_type: 'reference'
---

# uniqCombined

Вычисляет приблизительное количество различных значений аргументов.

```sql
uniqCombined(HLL_precision)(x[, ...])
```

Функция `uniqCombined` — хороший выбор для вычисления количества различных значений.

**Аргументы**

* `HLL_precision`: двоичный логарифм количества ячеек в [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog). Необязательный параметр, можно использовать функцию как `uniqCombined(x[, ...])`. Значение по умолчанию для `HLL_precision` — 17, что соответствует примерно 96 КиБ памяти (2^17 ячеек, по 6 бит каждая).
* `X`: переменное число параметров. Параметры могут иметь типы `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовые типы.

**Возвращаемое значение**

* Число типа [UInt64](../../../sql-reference/data-types/int-uint.md).

**Подробности реализации**

Функция `uniqCombined`:

* Вычисляет хеш (64-битный хеш для `String` и 32-битный в остальных случаях) для всех параметров в агрегирующей выборке и затем использует его в вычислениях.
* Использует комбинацию трёх алгоритмов: массив, хеш-таблица и HyperLogLog с таблицей коррекции ошибок.
  * Для небольшого числа различных элементов используется массив.
  * При большем размере множества используется хеш-таблица.
  * Для ещё большего числа элементов используется HyperLogLog, который занимает фиксированный объём памяти.
* Возвращает детерминированный результат (он не зависит от порядка обработки запроса).

:::note\
Поскольку для типов, отличных от `String`, используется 32-битный хеш, результат будет иметь очень большую погрешность для мощностей множеств, значительно превышающих `UINT_MAX` (погрешность быстро возрастает после нескольких десятков миллиардов различных значений). В таком случае следует использовать [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64).
:::

По сравнению с функцией [uniq](/sql-reference/aggregate-functions/reference/uniq), функция `uniqCombined`:

* Потребляет в несколько раз меньше памяти.
* Обеспечивает в несколько раз более высокую точность.
* Обычно имеет немного более низкую производительность. В некоторых сценариях `uniqCombined` может работать лучше, чем `uniq`, например, при распределённых запросах, которые передают по сети большое количество состояний агрегации.

**Пример**

Запрос:

```sql
SELECT uniqCombined(number) FROM numbers(1e6);
```

Результат:

```response
┌─uniqCombined(number)─┐
│              1001148 │ -- 1,00 миллиона
└──────────────────────┘
```

См. раздел с примером в [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) для демонстрации различий между `uniqCombined` и `uniqCombined64` при значительно больших объемах входных данных.

**См. также**

* [uniq](/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
* [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
