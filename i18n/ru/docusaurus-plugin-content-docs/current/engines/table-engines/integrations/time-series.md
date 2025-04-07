---
description: 'Движок таблицы, хранящий временные ряды, т.е. набор значений, связанных с временными метками и тегами (или метками).'
sidebar_label: 'TimeSeries'
sidebar_position: 60
slug: /engines/table-engines/special/time_series
title: 'Движок TimeSeries'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Движок TimeSeries

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

Движок таблицы, хранящий временные ряды, т.е. набор значений, связанных с временными метками и тегами (или метками):

```sql
metric_name1[tag1=value1, tag2=value2, ...] = {timestamp1: value1, timestamp2: value2, ...}
metric_name2[...] = ...
```

:::info
Это экспериментальная функция, которая может измениться несовместимым образом в будущих релизах. 
Включите использование движка таблицы TimeSeries с помощью настройки 
[allow_experimental_time_series_table](/operations/settings/settings#allow_experimental_time_series_table). 
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

Проще всего начать с того, что все значения установлены по умолчанию (разрешено создавать таблицу `TimeSeries` без указания списка столбцов):

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

Эта таблица может быть использована с следующими протоколами (порт должен быть назначен в конфигурации сервера):
- [prometheus remote-write](../../../interfaces/prometheus.md#remote-write)
- [prometheus remote-read](../../../interfaces/prometheus.md#remote-read)

## Целевые таблицы {#target-tables}

Таблица `TimeSeries` не имеет своих собственных данных, все хранится в целевых таблицах. Это похоже на то, как работает [материализованное представление](../../../sql-reference/statements/create/view#materialized-view), с той разницей, что у материализованного представления есть одна целевая таблица, тогда как у таблицы `TimeSeries` есть три целевые таблицы, названные [data](#data-table), [tags](#tags-table) и [metrics](#metrics-table).

Целевые таблицы могут быть либо указаны явно в запросе `CREATE TABLE`, либо движок таблицы `TimeSeries` может автоматически генерировать внутренние целевые таблицы.

Целевые таблицы:

### Таблица данных {#data-table}

Таблица _data_ содержит временные ряды, связанные с некоторым идентификатором.

Таблица _data_ должна иметь следующие столбцы:

| Имя | Обязательно? | Тип по умолчанию | Возможные типы | Описание |
|---|---|---|---|---|
| `id` | [x] | `UUID` | любой | Идентифицирует комбинацию имён метрик и тегов |
| `timestamp` | [x] | `DateTime64(3)` | `DateTime64(X)` | Временная метка |
| `value` | [x] | `Float64` | `Float32` или `Float64` | Значение, связанное с `timestamp` |

### Таблица тегов {#tags-table}

Таблица _tags_ содержит идентификаторы, рассчитанные для каждой комбинации имени метрики и тегов.

Таблица _tags_ должна иметь следующие столбцы:

| Имя | Обязательно? | Тип по умолчанию | Возможные типы | Описание |
|---|---|---|---|---|
| `id` | [x] | `UUID` | любой (должен соответствовать типу `id` в таблице [data](#data-table)) | `id` идентифицирует комбинацию имени метрики и тегов. Выражение DEFAULT определяет, как рассчитать такой идентификатор |
| `metric_name` | [x] | `LowCardinality(String)` | `String` или `LowCardinality(String)` | Имя метрики |
| `<tag_value_column>` | [ ] | `String` | `String` или `LowCardinality(String)` или `LowCardinality(Nullable(String))` | Значение конкретного тега, имя тега и название соответствующего столбца указаны в настройке [tags_to_columns](#settings) |
| `tags` | [x] | `Map(LowCardinality(String), String)` | `Map(String, String)` или `Map(LowCardinality(String), String)` или `Map(LowCardinality(String), LowCardinality(String))` | Карта тегов, исключая тег `__name__`, содержащий имя метрики, и исключая теги с названиями, перечисленными в настройке [tags_to_columns](#settings) |
| `all_tags` | [ ] | `Map(String, String)` | `Map(String, String)` или `Map(LowCardinality(String), String)` или `Map(LowCardinality(String), LowCardinality(String))` | Эфемерный столбец, каждая строка представляет собой карту всех тегов, исключая только тег `__name__`, содержащий имя метрики. Единственная цель этого столбца — использовать его при вычислении `id` |
| `min_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` или `Nullable(DateTime64(X))` | Минимальная временная метка временного ряда с этим `id`. Столбец создается, если [store_min_time_and_max_time](#settings) равно `true` |
| `max_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` или `Nullable(DateTime64(X))` | Максимальная временная метка временного ряда с этим `id`. Столбец создается, если [store_min_time_and_max_time](#settings) равно `true` |

### Таблица метрик {#metrics-table}

Таблица _metrics_ содержит информацию о собираемых метриках, типах этих метрик и их описаниях.

Таблица _metrics_ должна иметь следующие столбцы:

| Имя | Обязательно? | Тип по умолчанию | Возможные типы | Описание |
|---|---|---|---|---|
| `metric_family_name` | [x] | `String` | `String` или `LowCardinality(String)` | Имя семейства метрик |
| `type` | [x] | `String` | `String` или `LowCardinality(String)` | Тип семейства метрик, один из "counter", "gauge", "summary", "stateset", "histogram", "gaugehistogram" |
| `unit` | [x] | `String` | `String` или `LowCardinality(String)` | Единица измерения метрики |
| `help` | [x] | `String` | `String` или `LowCardinality(String)` | Описание метрики |

Любая строка, вставленная в таблицу `TimeSeries`, на самом деле будет храниться в этих трех целевых таблицах. Таблица `TimeSeries` содержит все эти столбцы из таблиц [data](#data-table), [tags](#tags-table), [metrics](#metrics-table).

## Создание {#creation}

Существует несколько способов создать таблицу с движком `TimeSeries`. Самое простое выражение

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

на самом деле создаст следующую таблицу (вы можете увидеть это, выполнив `SHOW CREATE TABLE my_table`):

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

Таким образом, столбцы были сгенерированы автоматически, и в этом операторе также есть три внутренних UUID - по одному для каждой созданной внутренней целевой таблицы. 
(Внутренние UUID обычно не отображаются до тех пор, пока не будет установлена настройка 
[show_table_uuid_in_table_create_query_if_not_nil](../../../operations/settings/settings#show_table_uuid_in_table_create_query_if_not_nil).)

Внутренние целевые таблицы имеют названия, такие как `.inner_id.data.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, `.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, `.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, 
и каждая целевая таблица имеет столбцы, которые представляют собой подмножество столбцов основной таблицы `TimeSeries`:

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

Вы можете настроить типы почти любого столбца внутренних целевых таблиц, явно указывая их при определении главной таблицы. Например,

```sql
CREATE TABLE my_table
(
    timestamp DateTime64(6)
) ENGINE=TimeSeries
```

сделает так, что внутренняя таблица [data](#data-table) будет хранить временные метки в микросекундах вместо миллисекунд:

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

Столбец `id` содержит идентификаторы, каждый идентификатор вычисляется для комбинации имени метрики и тегов. 
Выражение DEFAULT для столбца `id` — это выражение, которое будет использоваться для вычисления таких идентификаторов. 
Оба типа столбца `id` и это выражение можно настроить, явно указывая их:

```sql
CREATE TABLE my_table
(
    id UInt64 DEFAULT sipHash64(metric_name, all_tags)
) ENGINE=TimeSeries
```

## Столбцы `tags` и `all_tags` {#tags-and-all-tags}

Существуют два столбца, содержащие карты тегов - `tags` и `all_tags`. В этом примере они означают одно и то же, однако они могут отличаться, если используется настройка `tags_to_columns`. Эта настройка позволяет указать, что определённый тег должен храниться в отдельном столбце вместо хранения в карте внутри столбца `tags`:

```sql
CREATE TABLE my_table ENGINE=TimeSeries SETTINGS = {'instance': 'instance', 'job': 'job'}
```

Этот оператор добавит столбцы
```sql
    `instance` String,
    `job` String
```
в определение как `my_table`, так и её внутренней целевой таблицы [tags](#tags-table). В этом случае столбец `tags` не будет содержать теги `instance` и `job`, 
но столбец `all_tags` будет содержать их. Столбец `all_tags` является эфемерным, и его единственная цель - использовать его в выражении DEFAULT для столбца `id`.

Типы столбцов можно настроить, явно указывая их:

```sql
CREATE TABLE my_table (instance LowCardinality(String), job LowCardinality(Nullable(String)))
ENGINE=TimeSeries SETTINGS = {'instance': 'instance', 'job': 'job'}
```

## Движки таблиц внутренних целевых таблиц {#inner-table-engines}

По умолчанию внутренние целевые таблицы используют следующие движки таблиц:
- таблица [data](#data-table) использует [MergeTree](../mergetree-family/mergetree);
- таблица [tags](#tags-table) использует [AggregatingMergeTree](../mergetree-family/aggregatingmergetree), поскольку одни и те же данные часто вставляются несколько раз в эту таблицу, поэтому нам нужен способ
для удаления дубликатов, а также потому, что необходимо проводить агрегацию для столбцов `min_time` и `max_time`;
- таблица [metrics](#metrics-table) использует [ReplacingMergeTree](../mergetree-family/replacingmergetree), поскольку одни и те же данные часто вставляются несколько раз в эту таблицу, поэтому нам нужен способ
для удаления дубликатов.

Другие движки таблиц также могут использоваться для внутренних целевых таблиц, если это указано:

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

Вот список настроек, которые могут быть указаны при определении таблицы `TimeSeries`:

| Имя | Тип | По умолчанию | Описание |
|---|---|---|---|
| `tags_to_columns` | Map | {} | Карта, указывающая, какие теги должны быть помещены в отдельные столбцы в таблице [tags](#tags-table). Синтаксис: `{'tag1': 'column1', 'tag2' : column2, ...}` |
| `use_all_tags_column_to_generate_id` | Bool | true | При генерации выражения для расчета идентификатора временного ряда этот флаг позволяет использовать столбец `all_tags` в этом вычислении |
| `store_min_time_and_max_time` | Bool | true | Если установлено в true, то таблица будет хранить `min_time` и `max_time` для каждого временного ряда |
| `aggregate_min_time_and_max_time` | Bool | true | При создании внутренней целевой таблицы `tags` этот флаг включает использование `SimpleAggregateFunction(min, Nullable(DateTime64(3)))` вместо просто `Nullable(DateTime64(3))` как типа для столбца `min_time`, а то же самое - для столбца `max_time` |
| `filter_by_min_time_and_max_time` | Bool | true | Если установлено в true, то таблица будет использовать столбцы `min_time` и `max_time` для фильтрации временных рядов |


# Функции {#functions}

Вот список функций, поддерживающих таблицу `TimeSeries` в качестве аргумента:
- [timeSeriesData](../../../sql-reference/table-functions/timeSeriesData.md)
- [timeSeriesTags](../../../sql-reference/table-functions/timeSeriesTags.md)
- [timeSeriesMetrics](../../../sql-reference/table-functions/timeSeriesMetrics.md)
