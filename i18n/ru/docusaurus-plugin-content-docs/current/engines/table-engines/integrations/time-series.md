---
slug: '/engines/table-engines/special/time_series'
sidebar_label: TimeSeries
sidebar_position: 60
description: 'Движок таблицы, хранящий данные временных рядов, т.е. набор значений,'
title: 'Движок TimeSeries'
doc_type: reference
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Движок TimeSeries

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

Движок таблицы для хранения временных рядов, т.е. набора значений, связанных с временными отметками и тегами (или метками):

```sql
metric_name1[tag1=value1, tag2=value2, ...] = {timestamp1: value1, timestamp2: value2, ...}
metric_name2[...] = ...
```

:::info
Это экспериментальная функция, которая может изменяться несовместимыми способами в будущих релизах.
Включите использование движка таблицы TimeSeries с настройкой [allow_experimental_time_series_table](/operations/settings/settings#allow_experimental_time_series_table).
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

Проще всего начать с настройки по умолчанию (разрешено создавать таблицу `TimeSeries` без указания списка колонок):

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

После этого эту таблицу можно использовать с следующими протоколами (порт должен быть назначен в конфигурации сервера):
- [prometheus remote-write](../../../interfaces/prometheus.md#remote-write)
- [prometheus remote-read](../../../interfaces/prometheus.md#remote-read)

## Целевые таблицы {#target-tables}

Таблица `TimeSeries` не содержит собственных данных, все данные хранятся в целевых таблицах.
Это похоже на работу [материализованного представления](../../../sql-reference/statements/create/view#materialized-view),
с той разницей, что у материализованного представления есть одна целевая таблица, в то время как у таблицы `TimeSeries` три целевые таблицы, именуемые [data](#data-table), [tags](#tags-table) и [metrics](#metrics-table).

Целевые таблицы могут быть явно указаны в запросе `CREATE TABLE`
или движок таблицы `TimeSeries` может автоматически создать внутренние целевые таблицы.

Целевые таблицы следующие:

### Таблица данных {#data-table}

_Таблица данных_ содержит временные ряды, связанные с некоторым идентификатором.

_Таблица данных_ должна иметь колонки:

| Имя | Обязательная? | Тип по умолчанию | Возможные типы | Описание |
|---|---|---|---|---|
| `id` | [x] | `UUID` | любой | Идентифицирует комбинацию названия метрики и тегов |
| `timestamp` | [x] | `DateTime64(3)` | `DateTime64(X)` | Временная метка |
| `value` | [x] | `Float64` | `Float32` или `Float64` | Значение, связанное с `timestamp` |

### Таблица тегов {#tags-table}

_Таблица тегов_ содержит идентификаторы, рассчитанные для каждой комбинации названия метрики и тегов.

_Таблица тегов_ должна иметь колонки:

| Имя | Обязательная? | Тип по умолчанию | Возможные типы | Описание |
|---|---|---|---|---|
| `id` | [x] | `UUID` | любой (должен соответствовать типу `id` в таблице [data](#data-table)) | Идентификатор `id` идентифицирует комбинацию названия метрики и тегов. Выражение по умолчанию указывает, как вычислять такой идентификатор |
| `metric_name` | [x] | `LowCardinality(String)` | `String` или `LowCardinality(String)` | Название метрики |
| `<tag_value_column>` | [ ] | `String` | `String` или `LowCardinality(String)` или `LowCardinality(Nullable(String))` | Значение конкретного тега, имя тега и имя соответствующей колонки указываются в настройке [tags_to_columns](#settings) |
| `tags` | [x] | `Map(LowCardinality(String), String)` | `Map(String, String)` или `Map(LowCardinality(String), String)` или `Map(LowCardinality(String), LowCardinality(String))` | Карта тегов, исключая тег `__name__`, содержащий название метрики, и исключая теги с именами, перечисленными в настройке [tags_to_columns](#settings) |
| `all_tags` | [ ] | `Map(String, String)` | `Map(String, String)` или `Map(LowCardinality(String), String)` или `Map(LowCardinality(String), LowCardinality(String))` | Эфемерная колонка, каждая строка представляет карту всех тегов, исключая только тег `__name__`, содержащий название метрики. Единственная цель этой колонки - использоваться при вычислении `id` |
| `min_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` или `Nullable(DateTime64(X))` | Минимальная временная метка временного ряда с этим `id`. Колонка создается, если [store_min_time_and_max_time](#settings) равно `true` |
| `max_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` или `Nullable(DateTime64(X))` | Максимальная временная метка временного ряда с этим `id`. Колонка создается, если [store_min_time_and_max_time](#settings) равно `true` |

### Таблица метрик {#metrics-table}

_Таблица метрик_ содержит некоторую информацию о собираемых метриках, их типах и описаниях.

_Таблица метрик_ должна иметь колонки:

| Имя | Обязательная? | Тип по умолчанию | Возможные типы | Описание |
|---|---|---|---|---|
| `metric_family_name` | [x] | `String` | `String` или `LowCardinality(String)` | Название семейства метрик |
| `type` | [x] | `String` | `String` или `LowCardinality(String)` | Тип семейства метрик, один из "counter", "gauge", "summary", "stateset", "histogram", "gaugehistogram" |
| `unit` | [x] | `String` | `String` или `LowCardinality(String)` | Единица измерения, используемая в метрике |
| `help` | [x] | `String` | `String` или `LowCardinality(String)` | Описание метрики |

Любая строка, вставленная в таблицу `TimeSeries`, будет на самом деле храниться в этих трех целевых таблицах.
Таблица `TimeSeries` содержит все эти колонки из таблиц [data](#data-table), [tags](#tags-table), [metrics](#metrics-table).

## Создание {#creation}

Существует несколько способов создать таблицу с движком таблицы `TimeSeries`.
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

Таким образом, колонки были сгенерированы автоматически, и также в этом выражении есть три внутренних UUID -
по одному на каждую внутреннюю целевую таблицу, которая была создана.
(Внутренние UUID обычно не показываются, пока не установлена настройка
[show_table_uuid_in_table_create_query_if_not_nil](../../../operations/settings/settings#show_table_uuid_in_table_create_query_if_not_nil).)

Внутренние целевые таблицы имеют названия вроде `.inner_id.data.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
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

Вы можете настроить типы почти любой колонки внутренних целевых таблиц, указав их явно
при определении основной таблицы. Например,

```sql
CREATE TABLE my_table
(
    timestamp DateTime64(6)
) ENGINE=TimeSeries
```

сделает так, что внутренняя таблица [data](#data-table) будет хранить временную метку в микросекулах вместо миллисекунд:

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

Колонка `id` содержит идентификаторы, каждый идентификатор рассчитывается для комбинации названия метрики и тегов.
Выражение по умолчанию для колонки `id` - это выражение, которое будет использоваться для вычисления таких идентификаторов.
Как тип колонки `id`, так и это выражение могут быть настроены явно:

```sql
CREATE TABLE my_table
(
  id UInt64 DEFAULT sipHash64(metric_name, all_tags)
)
ENGINE=TimeSeries
```

## Колонки `tags` и `all_tags` {#tags-and-all-tags}

Существует две колонки, содержащие карты тегов - `tags` и `all_tags`. В этом примере они означают одно и то же, однако они могут быть разными,
если используется настройка `tags_to_columns`. Эта настройка позволяет указать, что конкретный тег должен храниться в отдельной колонке вместо хранения
в карте внутри колонки `tags`:

```sql
CREATE TABLE my_table
ENGINE = TimeSeries 
SETTINGS tags_to_columns = {'instance': 'instance', 'job': 'job'}
```

Это выражение добавит колонки:

```sql
`instance` String,
`job` String
```

в определение как `my_table`, так и его внутренней целевой таблицы [tags](#tags-table). В этом случае колонка `tags` не будет содержать теги `instance` и `job`,
но колонка `all_tags` будет их содержать. Колонка `all_tags` эфемерна, и ее единственная цель - использоваться в выражении DEFAULT
для колонки `id`.

Типы колонок могут быть настроены, указав их явно:

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
- таблица [tags](#tags-table) использует [AggregatingMergeTree](../mergetree-family/aggregatingmergetree), потому что одни и те же данные часто вставляются несколько раз в эту таблицу, поэтому нам нужен способ
удалить дубликаты, а также это необходимо для агрегации для колонок `min_time` и `max_time`;
- таблица [metrics](#metrics-table) использует [ReplacingMergeTree](../mergetree-family/replacingmergetree), потому что одни и те же данные часто вставляются несколько раз в эту таблицу, поэтому нам нужен способ
удалить дубликаты.

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
| `tags_to_columns` | Map | {} | Карта, указывающая, какие теги должны помещаться в отдельные колонки в таблице [tags](#tags-table). Синтаксис: `{'tag1': 'column1', 'tag2' : column2, ...}` |
| `use_all_tags_column_to_generate_id` | Bool | true | При генерации выражения для вычисления идентификатора временного ряда этот флаг включает использование колонки `all_tags` в этом вычислении |
| `store_min_time_and_max_time` | Bool | true | Если установлено в true, то таблица будет хранить `min_time` и `max_time` для каждого временного ряда |
| `aggregate_min_time_and_max_time` | Bool | true | При создании внутренней целевой таблицы `tags` этот флаг включает использование `SimpleAggregateFunction(min, Nullable(DateTime64(3)))` вместо просто `Nullable(DateTime64(3))` как типа колонки `min_time`, и то же самое для колонки `max_time` |
| `filter_by_min_time_and_max_time` | Bool | true | Если установлено в true, то таблица будет использовать колонки `min_time` и `max_time` для фильтрации временных рядов |


# Функции {#functions}

Вот список функций, поддерживающих таблицу `TimeSeries` в качестве аргумента:
- [timeSeriesData](../../../sql-reference/table-functions/timeSeriesData.md)
- [timeSeriesTags](../../../sql-reference/table-functions/timeSeriesTags.md)
- [timeSeriesMetrics](../../../sql-reference/table-functions/timeSeriesMetrics.md)