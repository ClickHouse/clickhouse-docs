description: 'Движок таблицы для хранения временных рядов, т.е. набора значений,
  связанных с метками времени и тегами (или метками).'
sidebar_label: 'Временные ряды'
sidebar_position: 60
slug: /engines/table-engines/special/time_series
title: 'Движок временных рядов'
```

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Движок временных рядов

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

Движок таблицы для хранения временных рядов, т.е. набора значений, связанных с метками времени и тегами (или метками):

```sql
metric_name1[tag1=value1, tag2=value2, ...] = {timestamp1: value1, timestamp2: value2, ...}
metric_name2[...] = ...
```

:::info
Это экспериментальная функция, которая может измениться в несовместимых с предыдущими версиями форматах в будущих релизах.
Включите использование движка таблицы TimeSeries с помощью настройки [allow_experimental_time_series_table](/operations/settings/settings#allow_experimental_time_series_table).
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

Проще всего начать с настроек по умолчанию (разрешено создавать таблицу `TimeSeries`, не указывая список столбцов):

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

Затем эту таблицу можно использовать с помощью следующих протоколов (порт должен быть назначен в конфигурации сервера):
- [prometheus remote-write](../../../interfaces/prometheus.md#remote-write)
- [prometheus remote-read](../../../interfaces/prometheus.md#remote-read)

## Целевые таблицы {#target-tables}

Таблица `TimeSeries` не содержит собственных данных, все данные хранятся в ее целевых таблицах.
Это похоже на то, как работает [материализованное представление](../../../sql-reference/statements/create/view#materialized-view),
с разницей в том, что у материализованного представления есть одна целевая таблица,
в то время как у таблицы `TimeSeries` есть три целевых таблицы с именами [data](#data-table), [tags](#tags-table) и [metrics](#metrics-table).

Целевые таблицы могут быть либо указаны явно в запросе `CREATE TABLE`,
либо движок таблицы `TimeSeries` может автоматически создать внутренние целевые таблицы.

Целевые таблицы следующие:

### Таблица данных {#data-table}

Таблица _data_ содержит временные ряды, связанные с каким-либо идентификатором.

Таблица _data_ должна содержать столбцы:

| Имя | Обязательный? | Тип по умолчанию | Возможные типы | Описание |
|---|---|---|---|---|
| `id` | [x] | `UUID` | любой | Идентифицирует сочетание имени метрики и тегов |
| `timestamp` | [x] | `DateTime64(3)` | `DateTime64(X)` | Момент времени |
| `value` | [x] | `Float64` | `Float32` или `Float64` | Значение, связанное с `timestamp` |


### Таблица тегов {#tags-table}

Таблица _tags_ содержит идентификаторы, вычисленные для каждого сочетания имени метрики и тегов.

Таблица _tags_ должна содержать столбцы:

| Имя | Обязательный? | Тип по умолчанию | Возможные типы | Описание |
|---|---|---|---|---|
| `id` | [x] | `UUID` | любой (должен соответствовать типу `id` в таблице [data](#data-table)) | Идентификатор `id` идентифицирует сочетание имени метрики и тегов. Выражение DEFAULT указывает, как вычислить такой идентификатор |
| `metric_name` | [x] | `LowCardinality(String)` | `String` или `LowCardinality(String)` | Имя метрики |
| `<tag_value_column>` | [ ] | `String` | `String` или `LowCardinality(String)` или `LowCardinality(Nullable(String))` | Значение конкретного тега, имя тега и имя соответствующего столбца указываются в настройке [tags_to_columns](#settings) |
| `tags` | [x] | `Map(LowCardinality(String), String)` | `Map(String, String)` или `Map(LowCardinality(String), String)` или `Map(LowCardinality(String), LowCardinality(String))` | Карта тегов, исключая тег `__name__`, содержащий имя метрики, и исключая теги с именами, перечисленными в настройке [tags_to_columns](#settings) |
| `all_tags` | [ ] | `Map(String, String)` | `Map(String, String)` или `Map(LowCardinality(String), String)` или `Map(LowCardinality(String), LowCardinality(String))` | Эфемерный столбец, каждая строка является картой всех тегов, исключая только тег `__name__`, содержащий имя метрики. Единственная цель этого столбца - использоваться при вычислении `id` |
| `min_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` или `Nullable(DateTime64(X))` | Минимальная метка времени временных рядов с этим `id`. Столбец создается, если [store_min_time_and_max_time](#settings) равно `true` |
| `max_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` или `Nullable(DateTime64(X))` | Максимальная метка времени временных рядов с этим `id`. Столбец создается, если [store_min_time_and_max_time](#settings) равно `true` |

### Таблица метрик {#metrics-table}

Таблица _metrics_ содержит информацию о собираемых метриках, типах этих метрик и их описаниях.

Таблица _metrics_ должна содержать столбцы:

| Имя | Обязательный? | Тип по умолчанию | Возможные типы | Описание |
|---|---|---|---|---|
| `metric_family_name` | [x] | `String` | `String` или `LowCardinality(String)` | Название семейства метрик |
| `type` | [x] | `String` | `String` или `LowCardinality(String)` | Тип семейства метрик, один из "counter", "gauge", "summary", "stateset", "histogram", "gaugehistogram" |
| `unit` | [x] | `String` | `String` или `LowCardinality(String)` | Единица измерения, используемая в метрике |
| `help` | [x] | `String` | `String` или `LowCardinality(String)` | Описание метрики |

Любая строка, вставленная в таблицу `TimeSeries`, на самом деле будет храниться в этих трех целевых таблицах.
Таблица `TimeSeries` содержит все эти столбцы из таблиц [data](#data-table), [tags](#tags-table) и [metrics](#metrics-table).

## Создание {#creation}

Существует несколько способов создать таблицу с движком `TimeSeries`.
Самое простое выражение

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

на самом деле создаст следующую таблицу (это можно увидеть, выполнив `SHOW CREATE TABLE my_table`):

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

Итак, столбцы были сгенерированы автоматически, а также в этом операторе есть три внутренних UUID -
по одному для каждой из внутренних целевых таблиц, которые были созданы.
(Внутренние UUID обычно не отображаются до тех пор, пока настройка
[show_table_uuid_in_table_create_query_if_not_nil](../../../operations/settings/settings#show_table_uuid_in_table_create_query_if_not_nil)
не установлена.)

Внутренние целевые таблицы имеют имена, такие как `.inner_id.data.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
`.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, `.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
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

Вы можете настроить типы почти любого столбца внутренних целевых таблиц, указав их явно
при определении основной таблицы. Например,

```sql
CREATE TABLE my_table
(
    timestamp DateTime64(6)
) ENGINE=TimeSeries
```

приведет к тому, что внутренняя таблица [data](#data-table) будет хранить метки времени в микросекундах вместо миллисекунд:

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

Столбец `id` содержит идентификаторы, каждый идентификатор вычисляется для сочетания имени метрики и тегов.
Выражение DEFAULT для столбца `id` - это выражение, которое будет использоваться для вычисления таких идентификаторов.
Как тип столбца `id`, так и это выражение можно настроить, указав их явно:

```sql
CREATE TABLE my_table
(
    id UInt64 DEFAULT sipHash64(metric_name, all_tags)
) ENGINE=TimeSeries
```

## Столбцы `tags` и `all_tags` {#tags-and-all-tags}

Существует два столбца, содержащих карты тегов - `tags` и `all_tags`. В этом примере они означают одно и то же, однако они могут быть разными,
если используется настройка `tags_to_columns`. Эта настройка позволяет указать, что конкретный тег должен храниться в отдельном столбце вместо хранения
в карте внутри столбца `tags`:

```sql
CREATE TABLE my_table ENGINE=TimeSeries SETTINGS = {'instance': 'instance', 'job': 'job'}
```

Это выражение добавит столбцы
```sql
    `instance` String,
    `job` String
```
в определение как `my_table`, так и его внутренней целевой таблицы [tags](#tags-table). В этом случае столбец `tags` не будет содержать теги `instance` и `job`,
но столбец `all_tags` будет их содержать. Столбец `all_tags` эфемерен, и его единственная цель - использоваться в выражении DEFAULT
для столбца `id`.

Типы столбцов можно настроить, указав их явно:

```sql
CREATE TABLE my_table (instance LowCardinality(String), job LowCardinality(Nullable(String)))
ENGINE=TimeSeries SETTINGS = {'instance': 'instance', 'job': 'job'}
```

## Движки таблиц внутренних целевых таблиц {#inner-table-engines}

По умолчанию внутренние целевые таблицы используют следующие движки таблиц:
- таблица [data](#data-table) использует [MergeTree](../mergetree-family/mergetree);
- таблица [tags](#tags-table) использует [AggregatingMergeTree](../mergetree-family/aggregatingmergetree), потому что одни и те же данные часто вставляются несколько раз в эту таблицу, поэтому нам нужно избавиться от дубликатов, а также потому что требуется выполнять агрегацию для столбцов `min_time` и `max_time`;
- таблица [metrics](#metrics-table) использует [ReplacingMergeTree](../mergetree-family/replacingmergetree), потому что одни и те же данные часто вставляются несколько раз в эту таблицу, поэтому нам нужно избавиться от дубликатов.

Другие движки таблиц также могут использоваться для внутренних целевых таблиц, если это указано:

```sql
CREATE TABLE my_table ENGINE=TimeSeries
DATA ENGINE=ReplicatedMergeTree
TAGS ENGINE=ReplicatedAggregatingMergeTree
METRICS ENGINE=ReplicatedReplacingMergeTree
```

## Внешние целевые таблицы {#external-target-tables}

Можно сделать так, чтобы таблица `TimeSeries` использовала вручную созданную таблицу:

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
| `use_all_tags_column_to_generate_id` | Bool | true | При генерации выражения для вычисления идентификатора временного ряда этот флаг позволяет использовать столбец `all_tags` в этом вычислении |
| `store_min_time_and_max_time` | Bool | true | Если установлено в true, тогда таблица будет хранить `min_time` и `max_time` для каждого временного ряда |
| `aggregate_min_time_and_max_time` | Bool | true | При создании внутренней целевой таблицы `tags` эта настройка позволяет использовать `SimpleAggregateFunction(min, Nullable(DateTime64(3)))` вместо простого `Nullable(DateTime64(3))` в качестве типа столбца `min_time`, и то же самое для столбца `max_time` |
| `filter_by_min_time_and_max_time` | Bool | true | Если установлено в true, тогда таблица будет использовать столбцы `min_time` и `max_time` для фильтрации временных рядов |


# Функции {#functions}

Вот список функций, поддерживающих таблицу `TimeSeries` в качестве аргумента:
- [timeSeriesData](../../../sql-reference/table-functions/timeSeriesData.md)
- [timeSeriesTags](../../../sql-reference/table-functions/timeSeriesTags.md)
- [timeSeriesMetrics](../../../sql-reference/table-functions/timeSeriesMetrics.md)
