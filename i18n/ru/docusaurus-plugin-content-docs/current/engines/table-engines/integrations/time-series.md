---
description: 'Табличный движок, предназначенный для хранения временных рядов — наборов значений, связанных с временными метками и тегами (или метками).'
sidebar_label: 'TimeSeries'
sidebar_position: 60
slug: /engines/table-engines/special/time_series
title: 'Табличный движок TimeSeries'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Движок таблицы TimeSeries

<ExperimentalBadge />

<CloudNotSupportedBadge />

Табличный движок, предназначенный для хранения временных рядов — наборов значений, связанных с отметками времени и тегами (метками):

```sql
metric_name1[tag1=value1, tag2=value2, ...] = {timestamp1: value1, timestamp2: value2, ...}
metric_name2[...] = ...
```

:::info
Это экспериментальная функциональность, которая в будущих релизах может измениться с нарушением обратной совместимости.
Включите использование табличного движка TimeSeries
с помощью настройки [allow&#95;experimental&#95;time&#95;series&#95;table](/operations/settings/settings#allow_experimental_time_series_table).
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

Проще всего начать с настроек по умолчанию (допускается создание таблицы `TimeSeries` без указания списка столбцов):

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

Затем эту таблицу можно использовать со следующими протоколами (в конфигурации сервера должен быть назначен порт):

- [prometheus remote-write](../../../interfaces/prometheus.md#remote-write)
- [prometheus remote-read](../../../interfaces/prometheus.md#remote-read)


## Целевые таблицы {#target-tables}

Таблица `TimeSeries` не хранит собственные данные — всё сохраняется в её целевых таблицах.
Это похоже на работу [материализованного представления](../../../sql-reference/statements/create/view#materialized-view),
с той разницей, что материализованное представление имеет одну целевую таблицу,
тогда как таблица `TimeSeries` имеет три целевые таблицы с именами [data](#data-table), [tags](#tags-table) и [metrics](#metrics-table).

Целевые таблицы могут быть либо явно указаны в запросе `CREATE TABLE`,
либо движок таблиц `TimeSeries` может автоматически создать внутренние целевые таблицы.

Целевые таблицы следующие:

### Таблица данных {#data-table}

Таблица _data_ содержит временные ряды, связанные с определённым идентификатором.

Таблица _data_ должна содержать столбцы:

| Имя         | Обязательно? | Тип по умолчанию | Возможные типы          | Описание                                            |
| ----------- | ------------ | ---------------- | ----------------------- | --------------------------------------------------- |
| `id`        | [x]          | `UUID`           | любой                   | Идентифицирует комбинацию имени метрики и тегов     |
| `timestamp` | [x]          | `DateTime64(3)`  | `DateTime64(X)`         | Временная точка                                     |
| `value`     | [x]          | `Float64`        | `Float32` или `Float64` | Значение, связанное с `timestamp`                   |

### Таблица тегов {#tags-table}

Таблица _tags_ содержит идентификаторы, вычисленные для каждой комбинации имени метрики и тегов.

Таблица _tags_ должна содержать столбцы:

| Имя                  | Обязательно? | Тип по умолчанию                      | Возможные типы                                                                                                             | Описание                                                                                                                                                                                       |
| -------------------- | ------------ | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                 | [x]          | `UUID`                                | любой (должен совпадать с типом `id` в таблице [data](#data-table))                                                       | Идентификатор `id` определяет комбинацию имени метрики и тегов. Выражение DEFAULT указывает, как вычислить такой идентификатор                                                                 |
| `metric_name`        | [x]          | `LowCardinality(String)`              | `String` или `LowCardinality(String)`                                                                                      | Имя метрики                                                                                                                                                                                    |
| `<tag_value_column>` | [ ]          | `String`                              | `String` или `LowCardinality(String)` или `LowCardinality(Nullable(String))`                                              | Значение конкретного тега; имя тега и имя соответствующего столбца указываются в настройке [tags_to_columns](#settings)                                                                       |
| `tags`               | [x]          | `Map(LowCardinality(String), String)` | `Map(String, String)` или `Map(LowCardinality(String), String)` или `Map(LowCardinality(String), LowCardinality(String))` | Карта тегов, исключая тег `__name__`, содержащий имя метрики, и исключая теги с именами, перечисленными в настройке [tags_to_columns](#settings)                                              |
| `all_tags`           | [ ]          | `Map(String, String)`                 | `Map(String, String)` или `Map(LowCardinality(String), String)` или `Map(LowCardinality(String), LowCardinality(String))` | Эфемерный столбец; каждая строка представляет собой карту всех тегов, исключая только тег `__name__`, содержащий имя метрики. Единственное назначение этого столбца — использование при вычислении `id` |
| `min_time`           | [ ]          | `Nullable(DateTime64(3))`             | `DateTime64(X)` или `Nullable(DateTime64(X))`                                                                              | Минимальная временная метка временного ряда с данным `id`. Столбец создаётся, если [store_min_time_and_max_time](#settings) имеет значение `true`                                             |
| `max_time`           | [ ]          | `Nullable(DateTime64(3))`             | `DateTime64(X)` или `Nullable(DateTime64(X))`                                                                              | Максимальная временная метка временного ряда с данным `id`. Столбец создаётся, если [store_min_time_and_max_time](#settings) имеет значение `true`                                            |

### Таблица метрик {#metrics-table}

Таблица _metrics_ содержит информацию о собираемых метриках, их типах и описаниях.

Таблица _metrics_ должна содержать столбцы:


| Имя | Обязательный? | Тип по умолчанию | Возможные типы | Описание |
|---|---|---|---|---|
| `metric_family_name` | [x] | `String` | `String` или `LowCardinality(String)` | Имя семейства метрик |
| `type` | [x] | `String` | `String` или `LowCardinality(String)` | Тип семейства метрик, одно из значений: "counter", "gauge", "summary", "stateset", "histogram", "gaugehistogram" |
| `unit` | [x] | `String` | `String` или `LowCardinality(String)` | Единица измерения метрики |
| `help` | [x] | `String` | `String` или `LowCardinality(String)` | Описание метрики |

Любая строка, вставленная в таблицу `TimeSeries`, на самом деле будет храниться в этих трёх целевых таблицах.
Таблица `TimeSeries` содержит все столбцы из таблиц [data](#data-table), [tags](#tags-table), [metrics](#metrics-table).



## Создание {#creation}

Существует несколько способов создания таблицы с движком таблиц `TimeSeries`.
Простейшая инструкция

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

фактически создаст следующую таблицу (это можно увидеть, выполнив команду `SHOW CREATE TABLE my_table`):

```sql
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

Таким образом, столбцы были сгенерированы автоматически, а также в этой инструкции присутствуют три внутренних UUID —
по одному для каждой созданной внутренней целевой таблицы.
(Внутренние UUID обычно не отображаются, пока не будет установлена настройка
[show_table_uuid_in_table_create_query_if_not_nil](../../../operations/settings/settings#show_table_uuid_in_table_create_query_if_not_nil).)

Внутренние целевые таблицы имеют имена вида `.inner_id.data.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
`.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, `.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
и каждая целевая таблица содержит столбцы, которые являются подмножеством столбцов основной таблицы `TimeSeries`:

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


## Настройка типов столбцов {#adjusting-column-types}

Вы можете настроить типы практически любого столбца внутренних целевых таблиц, явно указав их
при определении основной таблицы. Например,

```sql
CREATE TABLE my_table
(
    timestamp DateTime64(6)
) ENGINE=TimeSeries
```

это приведет к тому, что внутренняя таблица [data](#data-table) будет хранить временные метки в микросекундах вместо миллисекунд:

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


## Столбец `id` {#id-column}

Столбец `id` содержит идентификаторы; каждый идентификатор вычисляется для комбинации имени метрики и тегов.
Выражение DEFAULT для столбца `id` определяет, как будут вычисляться такие идентификаторы.
Тип столбца `id` и это выражение можно настроить, указав их явно:

```sql
CREATE TABLE my_table
(
  id UInt64 DEFAULT sipHash64(metric_name, all_tags)
)
ENGINE=TimeSeries
```


## Столбцы `tags` и `all_tags` {#tags-and-all-tags}

Существует два столбца, содержащих словари тегов — `tags` и `all_tags`. В данном примере они имеют одинаковое содержимое, однако могут различаться
при использовании настройки `tags_to_columns`. Эта настройка позволяет указать, что определённый тег должен храниться в отдельном столбце, а не
в словаре внутри столбца `tags`:

```sql
CREATE TABLE my_table
ENGINE = TimeSeries
SETTINGS tags_to_columns = {'instance': 'instance', 'job': 'job'}
```

Данная инструкция добавит столбцы:

```sql
`instance` String,
`job` String
```

в определение как таблицы `my_table`, так и её внутренней целевой таблицы [tags](#tags-table). В этом случае столбец `tags` не будет содержать теги `instance` и `job`,
но столбец `all_tags` будет их содержать. Столбец `all_tags` является эфемерным, и его единственное назначение — использование в выражении DEFAULT
для столбца `id`.

Типы столбцов можно настроить, указав их явно:

```sql
CREATE TABLE my_table (
  instance LowCardinality(String),
  job LowCardinality(Nullable(String))
)
ENGINE=TimeSeries
SETTINGS tags_to_columns = {'instance': 'instance', 'job': 'job'}
```


## Движки таблиц внутренних целевых таблиц {#inner-table-engines}

По умолчанию внутренние целевые таблицы используют следующие движки таблиц:

- таблица [data](#data-table) использует [MergeTree](../mergetree-family/mergetree);
- таблица [tags](#tags-table) использует [AggregatingMergeTree](../mergetree-family/aggregatingmergetree), так как одни и те же данные часто вставляются в эту таблицу несколько раз, поэтому необходим способ
  удаления дубликатов, а также потому, что требуется выполнять агрегацию для столбцов `min_time` и `max_time`;
- таблица [metrics](#metrics-table) использует [ReplacingMergeTree](../mergetree-family/replacingmergetree), так как одни и те же данные часто вставляются в эту таблицу несколько раз, поэтому необходим способ
  удаления дубликатов.

Для внутренних целевых таблиц также могут использоваться другие движки таблиц, если это явно указано:

```sql
CREATE TABLE my_table ENGINE=TimeSeries
DATA ENGINE=ReplicatedMergeTree
TAGS ENGINE=ReplicatedAggregatingMergeTree
METRICS ENGINE=ReplicatedReplacingMergeTree
```


## Внешние целевые таблицы {#external-target-tables}

Таблицу `TimeSeries` можно настроить на использование вручную созданной таблицы:

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

Ниже приведен список настроек, которые можно указать при определении таблицы `TimeSeries`:

| Название                             | Тип  | По умолчанию | Описание                                                                                                                                                                                                                                           |
| ------------------------------------ | ---- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tags_to_columns`                    | Map  | {}      | Словарь, определяющий, какие теги должны быть размещены в отдельных столбцах таблицы [tags](#tags-table). Синтаксис: `{'tag1': 'column1', 'tag2' : column2, ...}`                                                                                 |
| `use_all_tags_column_to_generate_id` | Bool | true    | При генерации выражения для вычисления идентификатора временного ряда этот флаг включает использование столбца `all_tags` в этом вычислении                                                                                                        |
| `store_min_time_and_max_time`        | Bool | true    | Если установлено в true, таблица будет хранить `min_time` и `max_time` для каждого временного ряда                                                                                                                                                 |
| `aggregate_min_time_and_max_time`    | Bool | true    | При создании внутренней целевой таблицы `tags` этот флаг включает использование `SimpleAggregateFunction(min, Nullable(DateTime64(3)))` вместо `Nullable(DateTime64(3))` в качестве типа столбца `min_time`, и аналогично для столбца `max_time` |
| `filter_by_min_time_and_max_time`    | Bool | true    | Если установлено в true, таблица будет использовать столбцы `min_time` и `max_time` для фильтрации временных рядов                                                                                                                                 |


# Функции {#functions}

Ниже приведён список функций, которые поддерживают таблицу `TimeSeries` в качестве аргумента:

- [timeSeriesData](../../../sql-reference/table-functions/timeSeriesData.md)
- [timeSeriesTags](../../../sql-reference/table-functions/timeSeriesTags.md)
- [timeSeriesMetrics](../../../sql-reference/table-functions/timeSeriesMetrics.md)
