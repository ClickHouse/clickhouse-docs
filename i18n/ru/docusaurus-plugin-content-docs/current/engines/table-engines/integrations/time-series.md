---
slug: /engines/table-engines/special/time_series
sidebar_position: 60
sidebar_label: TimeSeries
title: 'ВремяСерийный Двигатель'
description: 'Двигатель таблицы, хранящий временные ряды, т.е. набор значений, связанных с отметками времени и тегами (или метками).'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# ВремяСерийный Двигатель

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

Двигатель таблицы, хранящий временные ряды, т.е. набор значений, связанных с отметками времени и тегами (или метками):

```sql
metric_name1[tag1=value1, tag2=value2, ...] = {timestamp1: value1, timestamp2: value2, ...}
metric_name2[...] = ...
```

:::info
Это экспериментальная функция, которая может измениться в несовместимых с предыдущими версиями способах в будущих релизах.
Включите использование двигателя таблицы TimeSeries
с помощью настройки [allow_experimental_time_series_table](/operations/settings/settings#allow_experimental_time_series_table).
Введите команду `set allow_experimental_time_series_table = 1`.
:::

## Синтаксис {#syntax}

```sql
CREATE TABLE name [(columns)] ENGINE=TimeSeries
[SETTINGS var1=value1, ...]
[DATA db.data_table_name | DATA ENGINE data_table_engine(arguments)]
[TAGS db.tags_table_name | TAGS ENGINE tags_table_engine(arguments)]
[METRICS db.metrics_table_name | METRICS ENGINE metrics_table_engine(arguments)]
```

## Использование {#usage}

Проще всего начать с настройки всего по умолчанию (разрешено создавать таблицу `TimeSeries` без указания списка колонок):

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

Затем эту таблицу можно использовать с следующими протоколами (порт должен быть назначен в конфигурации сервера):
- [prometheus remote-write](../../../interfaces/prometheus.md#remote-write)
- [prometheus remote-read](../../../interfaces/prometheus.md#remote-read)

## Целевые таблицы {#target-tables}

Таблица `TimeSeries` не имеет собственных данных, все хранится в её целевых таблицах.
Это похоже на работу [материализованного представления](../../../sql-reference/statements/create/view#materialized-view),
с разницей в том, что у материализованного представления есть одна целевая таблица,
в то время как у таблицы `TimeSeries` три целевые таблицы, названные [data](#data-table), [tags](#tags-table) и [metrics](#metrics-table).

Целевые таблицы можно либо явно указать в запросе `CREATE TABLE`,
либо движок таблицы `TimeSeries` может автоматически сгенерировать внутренние целевые таблицы.

Целевые таблицы следующие:

### Таблица данных {#data-table}

_tabel_ содержит временные ряды, связанные с некоторым идентификатором.

Таблица _data_ должна иметь колонки:

| Имя | Обязательно? | Тип по умолчанию | Возможные типы | Описание |
|---|---|---|---|---|
| `id` | [x] | `UUID` | любой | Идентифицирует комбинацию имен метрик и тегов |
| `timestamp` | [x] | `DateTime64(3)` | `DateTime64(X)` | Временная точка |
| `value` | [x] | `Float64` | `Float32` или `Float64` | Значение, связанное с `timestamp` |


### Таблица тегов {#tags-table}

_tabel_ содержит идентификаторы, вычисляемые для каждой комбинации имени метрики и тегов.

Таблица _tags_ должна иметь колонки:

| Имя | Обязательно? | Тип по умолчанию | Возможные типы | Описание |
|---|---|---|---|---|
| `id` | [x] | `UUID` | любой (должен соответствовать типу `id` в таблице [data](#data-table)) | Идентификатор `id` идентифицирует комбинацию имени метрики и тегов. Выражение DEFAULT указывает, как вычислить такой идентификатор |
| `metric_name` | [x] | `LowCardinality(String)` | `String` или `LowCardinality(String)` | Имя метрики |
| `<tag_value_column>` | [ ] | `String` | `String` или `LowCardinality(String)` или `LowCardinality(Nullable(String))` | Значение конкретного тега, имя тега и название соответствующей колонки указываются в настройке [tags_to_columns](#settings) |
| `tags` | [x] | `Map(LowCardinality(String), String)` | `Map(String, String)` или `Map(LowCardinality(String), String)` или `Map(LowCardinality(String), LowCardinality(String))` | Карта тегов, исключая тег `__name__`, содержащий имя метрики и исключая теги с именами, перечисленными в настройке [tags_to_columns](#settings) |
| `all_tags` | [ ] | `Map(String, String)` | `Map(String, String)` или `Map(LowCardinality(String), String)` или `Map(LowCardinality(String), LowCardinality(String))` | Эфемерная колонка, каждая строка - это карта всех тегов, исключая только тег `__name__`, содержащий имя метрики. Единственная цель этой колонки - использоваться при вычислении `id` |
| `min_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` или `Nullable(DateTime64(X))` | Минимальная отметка времени временных рядов с этим `id`. Колонка создаётся, если [store_min_time_and_max_time](#settings) равно `true` |
| `max_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` или `Nullable(DateTime64(X))` | Максимальная отметка времени временных рядов с этим `id`. Колонка создаётся, если [store_min_time_and_max_time](#settings) равно `true` |

### Таблица метрик {#metrics-table}

_tabel_ содержит некоторую информацию о собираемых метриках, типах этих метрик и их описаниях.

Таблица _metrics_ должна иметь колонки:

| Имя | Обязательно? | Тип по умолчанию | Возможные типы | Описание |
|---|---|---|---|---|
| `metric_family_name` | [x] | `String` | `String` или `LowCardinality(String)` | Имя семейства метрик |
| `type` | [x] | `String` | `String` или `LowCardinality(String)` | Тип семейства метрик, один из "counter", "gauge", "summary", "stateset", "histogram", "gaugehistogram" |
| `unit` | [x] | `String` | `String` или `LowCardinality(String)` | Единица измерения в метрике |
| `help` | [x] | `String` | `String` или `LowCardinality(String)` | Описание метрики |

Любая строка, вставленная в таблицу `TimeSeries`, будет фактически храниться в этих трёх целевых таблицах.
Таблица `TimeSeries` содержит все эти колонки из таблиц [data](#data-table), [tags](#tags-table), [metrics](#metrics-table).

## Создание {#creation}

Существует несколько способов создать таблицу с движком таблицы `TimeSeries`.
Самое простое выражение

``` sql
CREATE TABLE my_table ENGINE=TimeSeries
```

фактически создаст следующую таблицу (вы можете это увидеть, выполнив `SHOW CREATE TABLE my_table`):

``` sql
CREATE TABLE my_table
(
    `id` UUID DEFAULT reinterpretAsUUID(sipHash128(metric_name, all_tags)),
    `timestamp` DateTime64(3),
    `value` Float64,
    `metric_name` LowCardinality(String),
    `tags` Map(LowCardinality(String), String),
    `all_tags` Map(String, String),
    `min_time` Nullable(DateTime64(3)),
    `max_time` Nullable(DateTime64(3)),
    `metric_family_name` String,
    `type` String,
    `unit` String,
    `help` String
)
ENGINE = TimeSeries
DATA ENGINE = MergeTree ORDER BY (id, timestamp)
DATA INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
TAGS ENGINE = AggregatingMergeTree PRIMARY KEY metric_name ORDER BY (metric_name, id)
TAGS INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
METRICS ENGINE = ReplacingMergeTree ORDER BY metric_family_name
METRICS INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

Таким образом, колонки были сгенерированы автоматически, также в этом выражении есть три внутренних UUID -
по одному для каждой внутренней целевой таблицы, которая была создана.
(Внутренние UUID обычно не отображаются, пока не установлено
[show_table_uuid_in_table_create_query_if_not_nil](../../../operations/settings/settings#show_table_uuid_in_table_create_query_if_not_nil)
параметр.)

Внутренние целевые таблицы имеют такие имена, как `.inner_id.data.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
`.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, `.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
и каждая целевая таблица имеет колонки, которые являются подмножеством колонок основной таблицы `TimeSeries`:

```sql
CREATE TABLE default.`.inner_id.data.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
(
    `id` UUID,
    `timestamp` DateTime64(3),
    `value` Float64
)
ENGINE = MergeTree
ORDER BY (id, timestamp)
```

```sql
CREATE TABLE default.`.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
(
    `id` UUID DEFAULT reinterpretAsUUID(sipHash128(metric_name, all_tags)),
    `metric_name` LowCardinality(String),
    `tags` Map(LowCardinality(String), String),
    `all_tags` Map(String, String) EPHEMERAL,
    `min_time` SimpleAggregateFunction(min, Nullable(DateTime64(3))),
    `max_time` SimpleAggregateFunction(max, Nullable(DateTime64(3)))
)
ENGINE = AggregatingMergeTree
PRIMARY KEY metric_name
ORDER BY (metric_name, id)
```

```sql
CREATE TABLE default.`.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
(
    `metric_family_name` String,
    `type` String,
    `unit` String,
    `help` String
)
ENGINE = ReplacingMergeTree
ORDER BY metric_family_name
```

## Настройка типов колонок {#adjusting-column-types}

Вы можете настроить типы почти любой колонки внутренних целевых таблиц, указывая их явно
при определении основной таблицы. Например,

```sql
CREATE TABLE my_table
(
    timestamp DateTime64(6)
) ENGINE=TimeSeries
```

сделает так, что внутренняя таблица [data](#data-table) будет хранить временную метку в микросекундах вместо миллисекунд:

```sql
CREATE TABLE default.`.inner_id.data.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
(
    `id` UUID,
    `timestamp` DateTime64(6),
    `value` Float64
)
ENGINE = MergeTree
ORDER BY (id, timestamp)
```

## Колонка `id` {#id-column}

Колонка `id` содержит идентификаторы, каждый идентификатор вычисляется для комбинации имени метрики и тегов.
Выражение DEFAULT для колонки `id` - это выражение, которое будет использоваться для вычисления таких идентификаторов.
Как тип колонки `id`, так и это выражение можно настроить, указав их явно:

``` sql
CREATE TABLE my_table
(
    id UInt64 DEFAULT sipHash64(metric_name, all_tags)
) ENGINE=TimeSeries
```

## Колонки `tags` и `all_tags` {#tags-and-all-tags}

Существуют две колонки, содержащие карты тегов - `tags` и `all_tags`. В этом примере они означают одно и то же, однако они могут отличаться,
если используется настройка `tags_to_columns`. Эта настройка позволяет указать, что конкретный тег должен храниться в отдельной колонке, вместо хранения
в карте внутри колонки `tags`:

```sql
CREATE TABLE my_table ENGINE=TimeSeries SETTINGS = {'instance': 'instance', 'job': 'job'}
```

Это выражение добавит колонки
```sql
    `instance` String,
    `job` String
```
в определение как `my_table`, так и её цели внутренней таблицы [tags](#tags-table). В этом случае колонка `tags` не будет содержать теги `instance` и `job`,
но колонка `all_tags` будет содержать их. Колонка `all_tags` эфемерна и её единственная цель - использоваться в выражении DEFAULT
для колонки `id`.

Типы колонок могут быть настроены, указав их явно:

``` sql
CREATE TABLE my_table (instance LowCardinality(String), job LowCardinality(Nullable(String)))
ENGINE=TimeSeries SETTINGS = {'instance': 'instance', 'job': 'job'}
```

## Движки таблиц внутренних целевых таблиц {#inner-table-engines}

По умолчанию внутренние целевые таблицы используют следующие движки таблиц:
- таблица [data](#data-table) использует [MergeTree](../mergetree-family/mergetree);
- таблица [tags](#tags-table) использует [AggregatingMergeTree](../mergetree-family/aggregatingmergetree), потому что одни и те же данные часто вставляются несколько раз в эту таблицу, поэтому нам нужен способ
для удаления дубликатов, а также это необходимо сделать агрегацию для колонок `min_time` и `max_time`;
- таблица [metrics](#metrics-table) использует [ReplacingMergeTree](../mergetree-family/replacingmergetree), потому что одни и те же данные часто вставляются несколько раз в эту таблицу, поэтому нам нужен способ
для удаления дубликатов.

Другие движки таблиц также могут быть использованы для внутренних целевых таблиц, если это указано таким образом:

```sql
CREATE TABLE my_table ENGINE=TimeSeries
DATA ENGINE=ReplicatedMergeTree
TAGS ENGINE=ReplicatedAggregatingMergeTree
METRICS ENGINE=ReplicatedReplacingMergeTree
```

## Внешние целевые таблицы {#external-target-tables}

Возможно сделать так, чтобы таблица `TimeSeries` использовала вручную созданную таблицу:

```sql
CREATE TABLE data_for_my_table
(
    `id` UUID,
    `timestamp` DateTime64(3),
    `value` Float64
)
ENGINE = MergeTree
ORDER BY (id, timestamp);

CREATE TABLE tags_for_my_table ...

CREATE TABLE metrics_for_my_table ...

CREATE TABLE my_table ENGINE=TimeSeries DATA data_for_my_table TAGS tags_for_my_table METRICS metrics_for_my_table;
```

## Настройки {#settings}

Вот список настроек, которые можно указать при определении таблицы `TimeSeries`:

| Имя | Тип | По умолчанию | Описание |
|---|---|---|---|
| `tags_to_columns` | Map | {} | Карта, указывающая, какие теги должны быть помещены в отдельные колонки в таблице [tags](#tags-table). Синтаксис: `{'tag1': 'column1', 'tag2' : column2, ...}` |
| `use_all_tags_column_to_generate_id` | Bool | true | При генерации выражения для вычисления идентификатора временного ряда этот флаг позволяет использовать колонку `all_tags` в этом расчёте |
| `store_min_time_and_max_time` | Bool | true | Если установить в true, таблица будет хранить `min_time` и `max_time` для каждого временного ряда |
| `aggregate_min_time_and_max_time` | Bool | true | При создании внутренней целевой таблицы `tags` этот флаг позволяет использовать `SimpleAggregateFunction(min, Nullable(DateTime64(3)))` вместо просто `Nullable(DateTime64(3))` в качестве типа колонки `min_time`, и так же для колонки `max_time` |
| `filter_by_min_time_and_max_time` | Bool | true | Если установить в true, таблица будет использовать колонки `min_time` и `max_time` для фильтрации временных рядов |


# Функции {#functions}

Вот список функций, поддерживающих таблицу `TimeSeries` в качестве аргумента:
- [timeSeriesData](../../../sql-reference/table-functions/timeSeriesData.md)
- [timeSeriesTags](../../../sql-reference/table-functions/timeSeriesTags.md)
- [timeSeriesMetrics](../../../sql-reference/table-functions/timeSeriesMetrics.md)
