---
description: 'Движок таблицы для хранения временных рядов — набора значений, привязанных к меткам времени и тегам (лейблам).'
sidebar_label: 'TimeSeries'
sidebar_position: 60
slug: /engines/table-engines/special/time_series
title: 'Движок таблицы TimeSeries'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Табличный движок TimeSeries

<ExperimentalBadge />

<CloudNotSupportedBadge />

Табличный движок для хранения временных рядов, то есть наборов значений, связанных с временными метками и тегами (или метками):

```sql
metric_name1[tag1=value1, tag2=value2, ...] = {timestamp1: value1, timestamp2: value2, ...}
metric_name2[...] = ...
```

:::info
Это экспериментальная функция, поведение которой в будущих релизах может измениться без сохранения обратной совместимости.
Активируйте использование табличного движка TimeSeries
с помощью настройки [allow&#95;experimental&#95;time&#95;series&#95;table](/operations/settings/settings#allow_experimental_time_series_table).
Выполните команду `set allow_experimental_time_series_table = 1`.
:::


## Синтаксис

```sql
CREATE TABLE name [(columns)] ENGINE=TimeSeries
[SETTINGS var1=value1, ...]
[DATA db.data_table_name | DATA ENGINE data_table_engine(arguments)]
[TAGS db.tags_table_name | TAGS ENGINE tags_table_engine(arguments)]
[METRICS db.metrics_table_name | METRICS ENGINE metrics_table_engine(arguments)]
```


## Использование

Проще всего начать, оставив все настройки по умолчанию (можно создать таблицу `TimeSeries` без явного указания списка столбцов):

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

После этого эту таблицу можно использовать со следующими протоколами (порт должен быть указан в конфигурации сервера):

* [prometheus remote-write](../../../interfaces/prometheus.md#remote-write)
* [prometheus remote-read](../../../interfaces/prometheus.md#remote-read)


## Целевые таблицы {#target-tables}

Таблица `TimeSeries` не имеет собственных данных, всё хранится в её целевых таблицах.
Это похоже на работу [материализованного представления](../../../sql-reference/statements/create/view#materialized-view),
с той разницей, что у материализованного представления есть одна целевая таблица,
тогда как у таблицы `TimeSeries` есть три целевые таблицы с именами [data](#data-table), [tags](#tags-table) и [metrics](#metrics-table).

Целевые таблицы могут быть либо указаны явно в запросе `CREATE TABLE`,
либо движок таблицы `TimeSeries` может автоматически сгенерировать внутренние целевые таблицы.

Целевые таблицы следующие:

### Таблица data {#data-table}

Таблица _data_ содержит временные ряды, связанные с некоторым идентификатором.

Таблица _data_ должна иметь столбцы:

| Name | Mandatory? | Default type | Possible types | Description |
|---|---|---|---|---|
| `id` | [x] | `UUID` | any | Идентифицирует комбинацию имён метрик и тегов |
| `timestamp` | [x] | `DateTime64(3)` | `DateTime64(X)` | Точка во времени |
| `value` | [x] | `Float64` | `Float32` or `Float64` | Значение, связанное с `timestamp` |

### Таблица tags {#tags-table}

Таблица _tags_ содержит идентификаторы, вычисленные для каждой комбинации имени метрики и тегов.

Таблица _tags_ должна иметь столбцы:

| Name | Mandatory? | Default type | Possible types | Description |
|---|---|---|---|---|
| `id` | [x] | `UUID` | any (must match the type of `id` in the [data](#data-table) table) | `id` идентифицирует комбинацию имени метрики и тегов. Выражение DEFAULT определяет, как вычисляется такой идентификатор |
| `metric_name` | [x] | `LowCardinality(String)` | `String` or `LowCardinality(String)` | Имя метрики |
| `<tag_value_column>` | [ ] | `String` | `String` or `LowCardinality(String)` or `LowCardinality(Nullable(String))` | Значение конкретного тега, имя тега и имя соответствующего столбца задаются в настройке [tags_to_columns](#settings) |
| `tags` | [x] | `Map(LowCardinality(String), String)` | `Map(String, String)` or `Map(LowCardinality(String), String)` or `Map(LowCardinality(String), LowCardinality(String))` | Карта тегов за исключением тега `__name__`, содержащего имя метрики, и за исключением тегов с именами, перечисленными в настройке [tags_to_columns](#settings) |
| `all_tags` | [ ] | `Map(String, String)` | `Map(String, String)` or `Map(LowCardinality(String), String)` or `Map(LowCardinality(String), LowCardinality(String))` | Эфемерный столбец, каждая строка — это карта всех тегов, за исключением только тега `__name__`, содержащего имя метрики. Единственная цель этого столбца — использовать его при вычислении `id` |
| `min_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` or `Nullable(DateTime64(X))` | Минимальная метка времени временных рядов с этим `id`. Столбец создаётся, если [store_min_time_and_max_time](#settings) имеет значение `true` |
| `max_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` or `Nullable(DateTime64(X))` | Максимальная метка времени временных рядов с этим `id`. Столбец создаётся, если [store_min_time_and_max_time](#settings) имеет значение `true` |

### Таблица metrics {#metrics-table}

Таблица _metrics_ содержит информацию о собираемых метриках, типах этих метрик и их описаниях.

Таблица _metrics_ должна иметь столбцы:



| Имя | Обязательный? | Тип по умолчанию | Возможные типы | Описание |
|---|---|---|---|---|
| `metric_family_name` | [x] | `String` | `String` или `LowCardinality(String)` | Имя семейства метрик |
| `type` | [x] | `String` | `String` или `LowCardinality(String)` | Тип семейства метрик, одно из следующих значений: "counter", "gauge", "summary", "stateset", "histogram", "gaugehistogram" |
| `unit` | [x] | `String` | `String` или `LowCardinality(String)` | Единица измерения, используемая в метрике |
| `help` | [x] | `String` | `String` или `LowCardinality(String)` | Описание метрики |

Любая строка, вставленная в таблицу `TimeSeries`, фактически будет сохранена в этих трёх целевых таблицах.
Таблица `TimeSeries` содержит все столбцы из таблиц [data](#data-table), [tags](#tags-table), [metrics](#metrics-table).



## Создание

Существует несколько способов создать таблицу с движком `TimeSeries`.
Самый простой запрос

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

будет создана следующая таблица (это можно увидеть, выполнив `SHOW CREATE TABLE my_table`):

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

Таким образом, столбцы были сгенерированы автоматически, и в этом операторе также присутствуют три внутренних UUID —
по одному для каждой внутренней целевой таблицы, которая была создана.
(Внутренние UUID обычно не показываются, пока параметр
[show&#95;table&#95;uuid&#95;in&#95;table&#95;create&#95;query&#95;if&#95;not&#95;nil](../../../operations/settings/settings#show_table_uuid_in_table_create_query_if_not_nil)
не включён.)

Внутренние целевые таблицы имеют имена вида `.inner_id.data.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
`.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, `.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
и каждая целевая таблица содержит столбцы, которые представляют собой подмножество столбцов основной таблицы `TimeSeries`:

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


## Настройка типов столбцов

Вы можете изменить тип почти любого столбца во внутренних целевых таблицах, явно указав его
при определении основной таблицы. Например,

```sql
CREATE TABLE my_table
(
    timestamp DateTime64(6)
) ENGINE=TimeSeries
```

приведёт к тому, что внутренняя таблица [data](#data-table) будет хранить временные метки в микросекундах вместо миллисекунд:

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


## Столбец `id`

Столбец `id` содержит идентификаторы; каждый идентификатор вычисляется для комбинации имени метрики и тегов.
Выражение DEFAULT для столбца `id` — это выражение, которое будет использоваться для вычисления таких идентификаторов.
И тип столбца `id`, и это выражение могут быть изменены путём их явного указания:

```sql
CREATE TABLE my_table
(
  id UInt64 DEFAULT sipHash64(metric_name, all_tags)
)
ENGINE=TimeSeries
```


## Столбцы `tags` и `all_tags`

Есть два столбца, содержащих отображения тегов, — `tags` и `all_tags`. В этом примере они по сути эквивалентны, однако могут отличаться,
если используется настройка `tags_to_columns`. Эта настройка позволяет указать, что конкретный тег должен храниться в отдельном столбце вместо хранения
в отображении внутри столбца `tags`:

```sql
CREATE TABLE my_table
ENGINE = TimeSeries 
SETTINGS tags_to_columns = {'instance': 'instance', 'job': 'job'}
```

Этот оператор добавит столбцы:

```sql
`instance` String,
`job` String
```

к определению и таблицы `my_table`, и ее внутренней целевой таблицы [tags](#tags-table). В этом случае столбец `tags` не будет содержать теги `instance` и `job`,
но столбец `all_tags` будет содержать их. Столбец `all_tags` является временным, и его единственное назначение — использоваться в выражении DEFAULT
для столбца `id`.

Типы столбцов можно изменить, явно указав их:

```sql
CREATE TABLE my_table (
  instance LowCardinality(String),
  job LowCardinality(Nullable(String))
)
ENGINE=TimeSeries
SETTINGS tags_to_columns = {'instance': 'instance', 'job': 'job'}
```


## Движки внутренних целевых таблиц

По умолчанию внутренние целевые таблицы используют следующие движки таблиц:

* таблица [data](#data-table) использует [MergeTree](../mergetree-family/mergetree);
* таблица [tags](#tags-table) использует [AggregatingMergeTree](../mergetree-family/aggregatingmergetree), так как одни и те же данные часто многократно вставляются в эту таблицу, поэтому нам необходим механизм
  удаления дубликатов, а также потому, что требуется выполнять агрегацию для столбцов `min_time` и `max_time`;
* таблица [metrics](#metrics-table) использует [ReplacingMergeTree](../mergetree-family/replacingmergetree), так как одни и те же данные часто многократно вставляются в эту таблицу, поэтому нам необходим механизм
  удаления дубликатов.

Для внутренних целевых таблиц также могут использоваться и другие движки таблиц, если это явно указано:

```sql
CREATE TABLE my_table ENGINE=TimeSeries
DATA ENGINE=ReplicatedMergeTree
TAGS ENGINE=ReplicatedAggregatingMergeTree
METRICS ENGINE=ReplicatedReplacingMergeTree
```


## Внешние таблицы назначения

Можно настроить таблицу `TimeSeries` на использование созданной вручную таблицы:

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

Ниже приведён список настроек, которые можно задать при определении таблицы `TimeSeries`:

| Name | Type | Default | Description |
|---|---|---|---|
| `tags_to_columns` | Map | {} | Отображение, задающее, какие теги следует вынести в отдельные столбцы в таблице [tags](#tags-table). Синтаксис: `{'tag1': 'column1', 'tag2' : column2, ...}` |
| `use_all_tags_column_to_generate_id` | Bool | true | При генерации выражения для вычисления идентификатора временного ряда этот флаг включает использование столбца `all_tags` в этом вычислении |
| `store_min_time_and_max_time` | Bool | true | Если установлено значение `true`, таблица будет сохранять `min_time` и `max_time` для каждого временного ряда |
| `aggregate_min_time_and_max_time` | Bool | true | При создании внутренней целевой таблицы `tags` этот флаг включает использование `SimpleAggregateFunction(min, Nullable(DateTime64(3)))` вместо просто `Nullable(DateTime64(3))` как типа столбца `min_time`, и аналогично для столбца `max_time` |
| `filter_by_min_time_and_max_time` | Bool | true | Если установлено значение `true`, таблица будет использовать столбцы `min_time` и `max_time` для фильтрации временных рядов |



# Функции {#functions}

Ниже приведен список функций, которые принимают таблицу `TimeSeries` в качестве аргумента:
- [timeSeriesData](../../../sql-reference/table-functions/timeSeriesData.md)
- [timeSeriesTags](../../../sql-reference/table-functions/timeSeriesTags.md)
- [timeSeriesMetrics](../../../sql-reference/table-functions/timeSeriesMetrics.md)
