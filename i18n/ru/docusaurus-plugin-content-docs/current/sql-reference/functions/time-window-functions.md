---
slug: /sql-reference/functions/time-window-functions
sidebar_position: 175
sidebar_label: Временные окна
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';



# Временные окно функции

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

Функции временного окна возвращают включительную нижнюю и исключительную верхнюю границу соответствующего окна. Функции для работы с [WindowView](/sql-reference/statements/create/view#window-view) перечислены ниже:

## tumble {#tumble}

Функция «tumble» присваивает записи неперекрывающимся, непрерывным окнам с фиксированной продолжительностью (`interval`).

**Синтаксис**

``` sql
tumble(time_attr, interval [, timezone])
```

**Аргументы**
- `time_attr` — Дата и время. [DateTime](../data-types/datetime.md).
- `interval` — Интервал окна в [Interval](../data-types/special-data-types/interval.md).
- `timezone` — [Название часового пояса](../../operations/server-configuration-parameters/settings.md#timezone) (необязательно).

**Возвращаемые значения**

- Включительная нижняя и исключительная верхняя граница соответствующего временного окна. [Tuple](../data-types/tuple.md)([DateTime](../data-types/datetime.md), [DateTime](../data-types/datetime.md)).

**Пример**

Запрос:

``` sql
SELECT tumble(now(), toIntervalDay('1'));
```

Результат:

``` text
┌─tumble(now(), toIntervalDay('1'))─────────────┐
│ ('2024-07-04 00:00:00','2024-07-05 00:00:00') │
└───────────────────────────────────────────────┘
```

## tumbleStart {#tumblestart}

Возвращает включительную нижнюю границу соответствующего [временного окна](#tumble).

**Синтаксис**

``` sql
tumbleStart(time_attr, interval [, timezone]);
```

**Аргументы**

- `time_attr` — Дата и время. [DateTime](../data-types/datetime.md).
- `interval` — Интервал окна в [Interval](../data-types/special-data-types/interval.md).
- `timezone` — [Название часового пояса](../../operations/server-configuration-parameters/settings.md#timezone) (необязательно).

**Возвращаемые значения**

- Включительная нижняя граница соответствующего временного окна. [DateTime](../data-types/datetime.md), [Tuple](../data-types/tuple.md) или [UInt32](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT tumbleStart(now(), toIntervalDay('1'));
```

Результат:

```response
┌─tumbleStart(now(), toIntervalDay('1'))─┐
│                    2024-07-04 00:00:00 │
└────────────────────────────────────────┘
```

## tumbleEnd {#tumbleend}

Возвращает исключительную верхнюю границу соответствующего [временного окна](#tumble).

**Синтаксис**

``` sql
tumbleEnd(time_attr, interval [, timezone]);
```

**Аргументы**

- `time_attr` — Дата и время. [DateTime](../data-types/datetime.md).
- `interval` — Интервал окна в [Interval](../data-types/special-data-types/interval.md).
- `timezone` — [Название часового пояса](../../operations/server-configuration-parameters/settings.md#timezone) (необязательно).

**Возвращаемые значения**

- Исключительная верхняя граница соответствующего временного окна. [DateTime](../data-types/datetime.md), [Tuple](../data-types/tuple.md) или [UInt32](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT tumbleEnd(now(), toIntervalDay('1'));
```

Результат:

```response
┌─tumbleEnd(now(), toIntervalDay('1'))─┐
│                  2024-07-05 00:00:00 │
└──────────────────────────────────────┘
```

## hop {#hop}

Функция «hop» имеет фиксированную продолжительность (`window_interval`) и перескакивает через указанный интервал (`hop_interval`). Если `hop_interval` меньше, чем `window_interval`, оконные промежутки будут перекрываться. Таким образом, записи могут быть присвоены нескольким окнам.

``` sql
hop(time_attr, hop_interval, window_interval [, timezone])
```

**Аргументы**

- `time_attr` — Дата и время. [DateTime](../data-types/datetime.md).
- `hop_interval` — Положительный интервал перескока. [Interval](../data-types/special-data-types/interval.md).
- `window_interval` — Положительный интервал окна. [Interval](../data-types/special-data-types/interval.md).
- `timezone` — [Название часового пояса](../../operations/server-configuration-parameters/settings.md#timezone) (необязательно).

**Возвращаемые значения**

- Включительная нижняя и исключительная верхняя граница соответствующего перескакивающего окна. [Tuple](../data-types/tuple.md)([DateTime](../data-types/datetime.md), [DateTime](../data-types/datetime.md))`.

:::note
Поскольку одна запись может быть присвоена нескольким перескакивающим окнам, функция возвращает только границу **первого** окна, когда функция hop используется **без** `WINDOW VIEW`.
:::

**Пример**

Запрос:

``` sql
SELECT hop(now(), INTERVAL '1' DAY, INTERVAL '2' DAY);
```

Результат:

``` text
┌─hop(now(), toIntervalDay('1'), toIntervalDay('2'))─┐
│ ('2024-07-03 00:00:00','2024-07-05 00:00:00')      │
└────────────────────────────────────────────────────┘
```

## hopStart {#hopstart}

Возвращает включительную нижнюю границу соответствующего [перескакивающего окна](#hop).

**Синтаксис**

``` sql
hopStart(time_attr, hop_interval, window_interval [, timezone]);
```
**Аргументы**

- `time_attr` — Дата и время. [DateTime](../data-types/datetime.md).
- `hop_interval` — Положительный интервал перескока. [Interval](../data-types/special-data-types/interval.md).
- `window_interval` — Положительный интервал окна. [Interval](../data-types/special-data-types/interval.md).
- `timezone` — [Название часового пояса](../../operations/server-configuration-parameters/settings.md#timezone) (необязательно).

**Возвращаемые значения**

- Включительная нижняя граница соответствующего перескакивающего окна. [DateTime](../data-types/datetime.md), [Tuple](../data-types/tuple.md) или [UInt32](../data-types/int-uint.md).

:::note
Поскольку одна запись может быть присвоена нескольким перескакивающим окнам, функция возвращает только границу **первого** окна, когда функция hop используется **без** `WINDOW VIEW`.
:::

**Пример**

Запрос:

``` sql
SELECT hopStart(now(), INTERVAL '1' DAY, INTERVAL '2' DAY);
```

Результат:

``` text
┌─hopStart(now(), toIntervalDay('1'), toIntervalDay('2'))─┐
│                                     2024-07-03 00:00:00 │
└─────────────────────────────────────────────────────────┘
```

## hopEnd {#hopend}

Возвращает исключительную верхнюю границу соответствующего [перескакивающего окна](#hop).

**Синтаксис**

``` sql
hopEnd(time_attr, hop_interval, window_interval [, timezone]);
```
**Аргументы**

- `time_attr` — Дата и время. [DateTime](../data-types/datetime.md).
- `hop_interval` — Положительный интервал перескока. [Interval](../data-types/special-data-types/interval.md).
- `window_interval` — Положительный интервал окна. [Interval](../data-types/special-data-types/interval.md).
- `timezone` — [Название часового пояса](../../operations/server-configuration-parameters/settings.md#timezone) (необязательно).

**Возвращаемые значения**

- Исключительная верхняя граница соответствующего перескакивающего окна. [DateTime](../data-types/datetime.md), [Tuple](../data-types/tuple.md) или [UInt32](../data-types/int-uint.md).

:::note
Поскольку одна запись может быть присвоена нескольким перескакивающим окнам, функция возвращает только границу **первого** окна, когда функция hop используется **без** `WINDOW VIEW`.
:::

**Пример**

Запрос:

``` sql
SELECT hopEnd(now(), INTERVAL '1' DAY, INTERVAL '2' DAY);
```

Результат:

``` text
┌─hopEnd(now(), toIntervalDay('1'), toIntervalDay('2'))─┐
│                                   2024-07-05 00:00:00 │
└───────────────────────────────────────────────────────┘

```

## Связанный контент {#related-content}

- Блог: [Работа с временными рядами в ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
