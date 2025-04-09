---
description: 'Документация по функциям временных окон'
sidebar_label: 'Временное окно'
sidebar_position: 175
slug: /sql-reference/functions/time-window-functions
title: 'Функции временных окон'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';



# Функции временных окон

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

Функции временных окон возвращают включительную нижнюю и исключительную верхнюю границу соответствующего окна. Функции для работы с [WindowView](/sql-reference/statements/create/view#window-view) перечислены ниже:

## tumble {#tumble}

Функция тумблирующего временного окна присваивает записи неперекрывающимся, непрерывным окнам с фиксированной продолжительностью (`interval`).

**Синтаксис**

```sql
tumble(time_attr, interval [, timezone])
```

**Аргументы**
- `time_attr` — Дата и время. [DateTime](../data-types/datetime.md).
- `interval` — Интервал окна в [Interval](../data-types/special-data-types/interval.md).
- `timezone` — [Название часового пояса](../../operations/server-configuration-parameters/settings.md#timezone) (необязательно).

**Возвращаемые значения**

- Включительная нижняя и исключительная верхняя граница соответствующего тумблирующего окна. [Tuple](../data-types/tuple.md)([DateTime](../data-types/datetime.md), [DateTime](../data-types/datetime.md)).

**Пример**

Запрос:

```sql
SELECT tumble(now(), toIntervalDay('1'));
```

Результат:

```text
┌─tumble(now(), toIntervalDay('1'))─────────────┐
│ ('2024-07-04 00:00:00','2024-07-05 00:00:00') │
└───────────────────────────────────────────────┘
```

## tumbleStart {#tumblestart}

Возвращает включительную нижнюю границу соответствующего [тумблирующего окна](#tumble).

**Синтаксис**

```sql
tumbleStart(time_attr, interval [, timezone]);
```

**Аргументы**

- `time_attr` — Дата и время. [DateTime](../data-types/datetime.md).
- `interval` — Интервал окна в [Interval](../data-types/special-data-types/interval.md).
- `timezone` — [Название часового пояса](../../operations/server-configuration-parameters/settings.md#timezone) (необязательно).

**Возвращаемые значения**

- Включительная нижняя граница соответствующего тумблирующего окна. [DateTime](../data-types/datetime.md), [Tuple](../data-types/tuple.md) или [UInt32](../data-types/int-uint.md).

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

Возвращает исключительную верхнюю границу соответствующего [тумблирующего окна](#tumble).

**Синтаксис**

```sql
tumbleEnd(time_attr, interval [, timezone]);
```

**Аргументы**

- `time_attr` — Дата и время. [DateTime](../data-types/datetime.md).
- `interval` — Интервал окна в [Interval](../data-types/special-data-types/interval.md).
- `timezone` — [Название часового пояса](../../operations/server-configuration-parameters/settings.md#timezone) (необязательно).

**Возвращаемые значения**

- Исключительная верхняя граница соответствующего тумблирующего окна. [DateTime](../data-types/datetime.md), [Tuple](../data-types/tuple.md) или [UInt32](../data-types/int-uint.md).

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

Функция скачущего временного окна имеет фиксированную продолжительность (`window_interval`) и скачет с заданным интервалом скачка (`hop_interval`). Если значение `hop_interval` меньше, чем `window_interval`, скачущие окна перекрываются. Таким образом, записи могут быть присвоены нескольким окнам.

```sql
hop(time_attr, hop_interval, window_interval [, timezone])
```

**Аргументы**

- `time_attr` — Дата и время. [DateTime](../data-types/datetime.md).
- `hop_interval` — Положительный интервал скачка. [Interval](../data-types/special-data-types/interval.md).
- `window_interval` — Положительный интервал окна. [Interval](../data-types/special-data-types/interval.md).
- `timezone` — [Название часового пояса](../../operations/server-configuration-parameters/settings.md#timezone) (необязательно).

**Возвращаемые значения**

- Включительная нижняя и исключительная верхняя граница соответствующего скачущего окна. [Tuple](../data-types/tuple.md)([DateTime](../data-types/datetime.md), [DateTime](../data-types/datetime.md))`.

:::note
Поскольку одна запись может быть присвоена нескольким скачущим окнам, функция возвращает только границу **первого** окна, когда функция hop используется **без** `WINDOW VIEW`.
:::

**Пример**

Запрос:

```sql
SELECT hop(now(), INTERVAL '1' DAY, INTERVAL '2' DAY);
```

Результат:

```text
┌─hop(now(), toIntervalDay('1'), toIntervalDay('2'))─┐
│ ('2024-07-03 00:00:00','2024-07-05 00:00:00')      │
└────────────────────────────────────────────────────┘
```

## hopStart {#hopstart}

Возвращает включительную нижнюю границу соответствующего [скачущего окна](#hop).

**Синтаксис**

```sql
hopStart(time_attr, hop_interval, window_interval [, timezone]);
```
**Аргументы**

- `time_attr` — Дата и время. [DateTime](../data-types/datetime.md).
- `hop_interval` — Положительный интервал скачка. [Interval](../data-types/special-data-types/interval.md).
- `window_interval` — Положительный интервал окна. [Interval](../data-types/special-data-types/interval.md).
- `timezone` — [Название часового пояса](../../operations/server-configuration-parameters/settings.md#timezone) (необязательно).

**Возвращаемые значения**

- Включительная нижняя граница соответствующего скачущего окна. [DateTime](../data-types/datetime.md), [Tuple](../data-types/tuple.md) или [UInt32](../data-types/int-uint.md).

:::note
Поскольку одна запись может быть присвоена нескольким скачущим окнам, функция возвращает только границу **первого** окна, когда функция hop используется **без** `WINDOW VIEW`.
:::

**Пример**

Запрос:

```sql
SELECT hopStart(now(), INTERVAL '1' DAY, INTERVAL '2' DAY);
```

Результат:

```text
┌─hopStart(now(), toIntervalDay('1'), toIntervalDay('2'))─┐
│                                     2024-07-03 00:00:00 │
└─────────────────────────────────────────────────────────┘
```

## hopEnd {#hopend}

Возвращает исключительную верхнюю границу соответствующего [скачущего окна](#hop).

**Синтаксис**

```sql
hopEnd(time_attr, hop_interval, window_interval [, timezone]);
```
**Аргументы**

- `time_attr` — Дата и время. [DateTime](../data-types/datetime.md).
- `hop_interval` — Положительный интервал скачка. [Interval](../data-types/special-data-types/interval.md).
- `window_interval` — Положительный интервал окна. [Interval](../data-types/special-data-types/interval.md).
- `timezone` — [Название часового пояса](../../operations/server-configuration-parameters/settings.md#timezone) (необязательно).

**Возвращаемые значения**

- Исключительная верхняя граница соответствующего скачущего окна. [DateTime](../data-types/datetime.md), [Tuple](../data-types/tuple.md) или [UInt32](../data-types/int-uint.md).

:::note
Поскольку одна запись может быть присвоена нескольким скачущим окнам, функция возвращает только границу **первого** окна, когда функция hop используется **без** `WINDOW VIEW`.
:::

**Пример**

Запрос:

```sql
SELECT hopEnd(now(), INTERVAL '1' DAY, INTERVAL '2' DAY);
```

Результат:

```text
┌─hopEnd(now(), toIntervalDay('1'), toIntervalDay('2'))─┐
│                                   2024-07-05 00:00:00 │
└───────────────────────────────────────────────────────┘

```

## Связанное содержимое {#related-content}

- Блог: [Работа с данными временных рядов в ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
