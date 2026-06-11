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

# Табличный движок TimeSeries \{#timeseries-table-engine\}

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

## Синтаксис \{#syntax\}

```sql
CREATE TABLE name [(columns)] ENGINE=TimeSeries
[SETTINGS var1=value1, ...]
[SAMPLES db.samples_table_name | [SAMPLES INNER COLUMNS (...)] [SAMPLES INNER ENGINE engine(arguments)]]
[TAGS db.tags_table_name | [TAGS INNER COLUMNS (...)] [TAGS INNER ENGINE engine(arguments)]]
[METRICS db.metrics_table_name | [METRICS INNER COLUMNS (...)] [METRICS INNER ENGINE engine(arguments)]]
```

:::note
Ключевое слово `SAMPLES` имеет псевдоним `DATA`, сохранённый для обеспечения обратной совместимости.
:::

## Использование \{#usage\}

Проще всего начать, оставив все настройки по умолчанию (можно создать таблицу `TimeSeries` без явного указания списка столбцов):

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

После этого эту таблицу можно использовать со следующими протоколами (порт должен быть указан в конфигурации сервера):

* [prometheus remote-write](/interfaces/prometheus#remote-write)
* [prometheus remote-read](/interfaces/prometheus#remote-read)

### Внешние столбцы \{#outer-columns\}

Столбцы таблицы TimeSeries создаются автоматически. Это внешние столбцы: они не хранят данные, а только предоставляют интерфейс для SELECT/INSERT. Фактические данные хранятся в [целевых таблицах](#target-tables). Ниже приведён список внешних столбцов:

| Имя             | Тип                                                 | Описание                                                                                                                                                                                                                            |
| --------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `metric_name`   | `String`                                            | Имя метрики                                                                                                                                                                                                                         |
| `tags`          | `Map(String, String)`                               | Набор тегов (меток) для временного ряда                                                                                                                                                                                             |
| `time_series`   | `Array(Tuple(DateTime64(3), Float64))` по умолчанию | Массив пар (временная метка, значение) для временного ряда. Типы временной метки и скалярного элемента кортежа можно вывести из объявления `INNER COLUMNS` для samples (см. [Указание внешних столбцов](#specifying-outer-columns)) |
| `metric_family` | `String`                                            | Имя семейства метрик (для метаданных метрик)                                                                                                                                                                                        |
| `type`          | `String`                                            | Тип метрики (например, &quot;counter&quot;, &quot;gauge&quot;)                                                                                                                                                                      |
| `unit`          | `String`                                            | Единица измерения метрики                                                                                                                                                                                                           |
| `help`          | `String`                                            | Описание метрики                                                                                                                                                                                                                    |

Пример:

```sql
INSERT INTO my_table (metric_name, tags, time_series) VALUES
    ('cpu_usage', {'job': 'node_exporter', 'instance': 'host1:9100'},
     [(toDateTime64('2024-01-01 00:00:00', 3), 0.5), (toDateTime64('2024-01-01 00:01:00', 3), 0.7)])
```

`metric_name` может быть пустым при вставке; это означает, что имя метрики задаётся в `tags`, в поле `__name__`, например:

```sql
INSERT INTO my_table (tags, time_series) VALUES
    ({'__name__': 'cpu_usage', 'job': 'test'},
     [(toDateTime64('2024-01-01 00:00:00', 3), 0.5)])
```

Чтобы вставить метаданные метрик, вставьте значения в столбцы `metric_family`, `type`, `unit` и `help`:

```sql
INSERT INTO my_table (metric_name, tags, time_series, metric_family, type, unit, help) VALUES
    ('http_requests_total', {'method': 'GET'}, [(now64(), 100.0)],
     'http_requests_total', 'counter', 'requests', 'Total HTTP requests')
```

### Указание внешних столбцов \{#specifying-outer-columns\}

Внешний столбец `time_series` можно явно указать в операторе `CREATE TABLE`, чтобы переопределить его тип по умолчанию `Array(Tuple(DateTime64(3), Float64))`. ClickHouse извлекает тип временной метки и скалярный тип из кортежа и передаёт их внутренней таблице samples:

```sql
CREATE TABLE my_table (time_series Array(Tuple(UInt32, Float32))) ENGINE=TimeSeries
```

Это эквивалентно прямому объявлению типов столбцов временной метки и значения в предложении `INNER COLUMNS` таблицы samples:

```sql
CREATE TABLE my_table ENGINE=TimeSeries
SAMPLES INNER COLUMNS (timestamp UInt32, value Float32)
```

Если обе формы используются в одном операторе `CREATE TABLE`, объявленные типы должны совпадать.

## Целевые таблицы \{#target-tables\}

Таблица `TimeSeries` не имеет собственных данных, всё хранится в её целевых таблицах.
Это похоже на работу [материализованного представления](../../../sql-reference/statements/create/view#materialized-view),
с той разницей, что у материализованного представления есть одна целевая таблица,
тогда как у таблицы `TimeSeries` есть три целевые таблицы с именами [samples](#samples-table), [tags](#tags-table) и [metrics](#metrics-table).

Целевые таблицы могут быть либо указаны явно в запросе `CREATE TABLE`,
либо движок таблицы `TimeSeries` может автоматически сгенерировать внутренние целевые таблицы.

Строки, вставленные в таблицу `TimeSeries`, преобразуются, разбиваются на блоки и вставляются в эти три целевые таблицы.

Целевые таблицы следующие:

### Таблица samples \{#samples-table\}

Таблица *samples* содержит временные ряды, связанные с некоторым идентификатором.

Таблица *samples* должна иметь столбцы:

| Name        | Mandatory? | Default type    | Possible types         | Description                                   |
| ----------- | ---------- | --------------- | ---------------------- | --------------------------------------------- |
| `id`        | [x]        | `UUID`          | any                    | Идентифицирует комбинацию имён метрик и тегов |
| `timestamp` | [x]        | `DateTime64(3)` | `DateTime64(X)`        | Точка во времени                              |
| `value`     | [x]        | `Float64`       | `Float32` or `Float64` | Значение, связанное с `timestamp`             |

### Таблица tags \{#tags-table\}

Таблица *tags* содержит идентификаторы, вычисленные для каждой комбинации имени метрики и тегов.

Таблица *tags* должна иметь столбцы:

| Name                 | Mandatory? | Default type                          | Possible types                                                                                                          | Description                                                                                                                                                                                     |
| -------------------- | ---------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                 | [x]        | `UUID`                                | any (must match the type of `id` in the [samples](#samples-table) table)                                                | `id` идентифицирует комбинацию имени метрики и тегов. Выражение DEFAULT определяет, как вычисляется такой идентификатор                                                                         |
| `metric_name`        | [x]        | `LowCardinality(String)`              | `String` or `LowCardinality(String)`                                                                                    | Имя метрики                                                                                                                                                                                     |
| `<tag_value_column>` | [ ]        | `String`                              | `String` or `LowCardinality(String)` or `LowCardinality(Nullable(String))`                                              | Значение конкретного тега, имя тега и имя соответствующего столбца задаются в настройке [tags&#95;to&#95;columns](#settings)                                                                    |
| `tags`               | [x]        | `Map(LowCardinality(String), String)` | `Map(String, String)` or `Map(LowCardinality(String), String)` or `Map(LowCardinality(String), LowCardinality(String))` | Карта тегов за исключением тега `__name__`, содержащего имя метрики, и за исключением тегов с именами, перечисленными в настройке [tags&#95;to&#95;columns](#settings)                          |
| `all_tags`           | [ ]        | `Map(String, String)`                 | `Map(String, String)` or `Map(LowCardinality(String), String)` or `Map(LowCardinality(String), LowCardinality(String))` | Эфемерный столбец, каждая строка — это карта всех тегов, за исключением только тега `__name__`, содержащего имя метрики. Единственная цель этого столбца — использовать его при вычислении `id` |
| `min_time`           | [ ]        | `Nullable(DateTime64(3))`             | `DateTime64(X)` or `Nullable(DateTime64(X))`                                                                            | Минимальная метка времени временных рядов с этим `id`. Столбец создаётся, если [store&#95;min&#95;time&#95;and&#95;max&#95;time](#settings) имеет значение `true`                               |
| `max_time`           | [ ]        | `Nullable(DateTime64(3))`             | `DateTime64(X)` or `Nullable(DateTime64(X))`                                                                            | Максимальная метка времени временных рядов с этим `id`. Столбец создаётся, если [store&#95;min&#95;time&#95;and&#95;max&#95;time](#settings) имеет значение `true`                              |

### Таблица metrics \{#metrics-table\}

Таблица *metrics* содержит сведения о собираемых метриках, их типах и описаниях.

Таблица *metrics* должна содержать следующие столбцы:

| Имя                  | Обязательный? | Тип по умолчанию         | Возможные типы                        | Описание                                                                                                                                                                               |
| -------------------- | ------------- | ------------------------ | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `metric_family_name` | [x]           | `String`                 | `String` или `LowCardinality(String)` | Имя семейства метрик                                                                                                                                                                   |
| `type`               | [x]           | `LowCardinality(String)` | `String` или `LowCardinality(String)` | Тип семейства метрик, одно из следующих значений: &quot;counter&quot;, &quot;gauge&quot;, &quot;summary&quot;, &quot;stateset&quot;, &quot;histogram&quot;, &quot;gaugehistogram&quot; |
| `unit`               | [x]           | `LowCardinality(String)` | `String` или `LowCardinality(String)` | Единица измерения, используемая в метрике                                                                                                                                              |
| `help`               | [x]           | `String`                 | `String` или `LowCardinality(String)` | Описание метрики                                                                                                                                                                       |

## Создание \{#creation\}

Существует несколько способов создать таблицу с движком `TimeSeries`.
Самый простой запрос

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

фактически создаст следующую таблицу (это можно увидеть, выполнив `SHOW CREATE TABLE my_table`):

```sql
CREATE TABLE my_table
(
    `metric_name` String,
    `tags` Map(String, String),
    `time_series` Array(Tuple(DateTime64(3), Float64)),
    `metric_family` String,
    `type` String,
    `unit` String,
    `help` String
)
ENGINE = TimeSeries
SAMPLES INNER COLUMNS
(
    `id` UUID,
    `timestamp` DateTime64(3),
    `value` Float64
)
SAMPLES INNER ENGINE = MergeTree ORDER BY (id, timestamp)
TAGS INNER COLUMNS
(
    `id` UUID DEFAULT reinterpretAsUUID(sipHash128(metric_name, all_tags)),
    `metric_name` LowCardinality(String),
    `tags` Map(LowCardinality(String), String),
    `all_tags` Map(String, String) EPHEMERAL,
    `min_time` SimpleAggregateFunction(min, Nullable(DateTime64(3))),
    `max_time` SimpleAggregateFunction(max, Nullable(DateTime64(3)))
)
TAGS INNER ENGINE = AggregatingMergeTree PRIMARY KEY metric_name ORDER BY (metric_name, id)
METRICS INNER COLUMNS
(
    `metric_family_name` String,
    `type` LowCardinality(String),
    `unit` LowCardinality(String),
    `help` String
)
METRICS INNER ENGINE = ReplacingMergeTree ORDER BY metric_family_name
```

Таким образом, столбцы были сгенерированы автоматически, а также имеются три внутренние целевые таблицы с собственными определениями столбцов,
сохранёнными в секциях `INNER COLUMNS`.

Внутренние целевые таблицы имеют имена вида `.inner_id.samples.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
`.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, `.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
и каждая целевая таблица имеет собственный набор столбцов:

```sql
CREATE TABLE default.`.inner_id.samples.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
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
    `type` LowCardinality(String),
    `unit` LowCardinality(String),
    `help` String
)
ENGINE = ReplacingMergeTree
ORDER BY metric_family_name
```

## Создание таблицы AS по образцу существующей таблицы \{#create-as\}

Оператор `CREATE TABLE new_table AS existing_table` копирует из `existing_table`:

* `SETTINGS`
* `INNER COLUMNS` для каждого типа
* `INNER ENGINE` для каждого типа

Оператор недопустим, если у `existing_table` есть внешние цели.
Внешний список столбцов создаётся заново и не копируется.

## Настройка типов столбцов \{#adjusting-column-types\}

Вы можете настраивать типы столбцов во внутренних целевых таблицах с помощью конструкции `INNER COLUMNS`. Например, чтобы хранить временные метки в микросекундах, а значения — в формате `Float32`:

```sql
CREATE TABLE my_table ENGINE=TimeSeries
SAMPLES INNER COLUMNS (timestamp DateTime64(6), value Float32)
```

Ту же конструкцию можно использовать для указания кодеков и других атрибутов столбца:

```sql
CREATE TABLE my_table ENGINE=TimeSeries
SAMPLES INNER COLUMNS (timestamp DateTime64(3) CODEC(DoubleDelta))
```

## Столбец `id` \{#id-column\}

Столбец `id` содержит идентификаторы; каждый идентификатор вычисляется для сочетания имени метрики и тегов.
Тип и выражение `DEFAULT`, используемое для генерации идентификаторов, можно настроить в секции `TAGS INNER COLUMNS`:

```sql
CREATE TABLE my_table ENGINE=TimeSeries
TAGS INNER COLUMNS (id UInt64 DEFAULT sipHash64(metric_name, all_tags))
```

Тип столбца `id` должен быть одним из следующих: `UUID`, `UInt64`, `UInt128` или `FixedString(16)`. Если выражение `DEFAULT` не задано, ClickHouse выберет его автоматически в зависимости от типа `id`. Типы `id`, объявленные во внутренних таблицах samples и tags, должны совпадать.

Настройка `id_generator` позволяет выполнить ту же настройку без использования конструкции `INNER COLUMNS`:

```sql
CREATE TABLE my_table ENGINE=TimeSeries
SETTINGS id_generator = 'sipHash64(metric_name, all_tags)'
```

Если этот параметр задан, `id` генерируется на его основе, даже если `DEFAULT` для столбца содержит другое выражение.

## Столбцы `tags` и `all_tags` \{#tags-and-all-tags\}

Есть два столбца, содержащих отображения тегов, — `tags` и `all_tags`. В этом примере они по сути эквивалентны, однако могут отличаться,
если используется настройка `tags_to_columns`. Эта настройка позволяет указать, что конкретный тег должен храниться в отдельном столбце вместо хранения
в отображении внутри столбца `tags`:

```sql
CREATE TABLE my_table
ENGINE = TimeSeries 
SETTINGS tags_to_columns = {'instance': 'instance', 'job': 'job'}
```

Этот оператор добавит столбцы `instance` и `job` во внутреннюю целевую таблицу [tags](#tags-table).
В этом случае столбец `tags` не будет содержать теги `instance` и `job`,
но столбец `all_tags` будет содержать их. Столбец `all_tags` является эфемерным, и его единственное назначение — использоваться в выражении DEFAULT
для столбца `id`.

## Движки внутренних целевых таблиц \{#inner-table-engines\}

По умолчанию внутренние целевые таблицы используют следующие движки таблиц:

* таблица [samples](#samples-table) использует [MergeTree](../mergetree-family/mergetree);
* таблица [tags](#tags-table) использует [AggregatingMergeTree](../mergetree-family/aggregatingmergetree), так как одни и те же данные часто многократно вставляются в эту таблицу, поэтому нам необходим механизм
  удаления дубликатов, а также потому, что требуется выполнять агрегацию для столбцов `min_time` и `max_time`;
* таблица [metrics](#metrics-table) использует [ReplacingMergeTree](../mergetree-family/replacingmergetree), так как одни и те же данные часто многократно вставляются в эту таблицу, поэтому нам необходим механизм
  удаления дубликатов.

Для внутренних целевых таблиц также могут использоваться и другие движки таблиц, если это явно указано:

```sql
CREATE TABLE my_table ENGINE=TimeSeries
SAMPLES ENGINE=ReplicatedMergeTree
TAGS ENGINE=ReplicatedAggregatingMergeTree
METRICS ENGINE=ReplicatedReplacingMergeTree
```

## Внешние целевые таблицы \{#external-target-tables\}

Таблицу `TimeSeries` можно настроить на использование созданной вручную таблицы:

```sql
CREATE TABLE samples_for_my_table
(
    `id` UUID,
    `timestamp` DateTime64(3),
    `value` Float64
)
ENGINE = MergeTree
ORDER BY (id, timestamp);

CREATE TABLE tags_for_my_table ...

CREATE TABLE metrics_for_my_table ...

CREATE TABLE my_table ENGINE=TimeSeries SAMPLES samples_for_my_table TAGS tags_for_my_table METRICS metrics_for_my_table;
```

Типы столбцов внешних таблиц (`id`, `timestamp`, `value` и столбцов `<tag_value_column>`, перечисленных в [`tags_to_columns`](#settings)) должны соответствовать типам, которые таблица `TimeSeries` иначе сгенерировала бы внутри системы (ограничения типов см. в разделах [Samples table](#samples-table), [Tags table](#tags-table) и [Metrics table](#metrics-table)). О несоответствии типов сообщается во время `CREATE`.

Выражение генератора `id` для внешней целевой таблицы тегов вычисляется во время `INSERT` в следующем порядке: сначала настройка [`id_generator`](#settings) (если задана), затем `DEFAULT`, объявленный для столбца `id` внешней таблицы (если он есть), затем канонический генератор, выведенный из типа `id`. Таким образом, эта настройка переопределяет любой `DEFAULT`, объявленный во внешней таблице — подробности см. в разделе [The `id` column](#id-column).

## Изменение параметров \{#altering-settings\}

После `CREATE` можно изменить два параметра:

* `id_generator`
* `filter_by_min_time_and_max_time`

```sql
ALTER TABLE my_table MODIFY SETTING id_generator = 'sipHash64(metric_name, all_tags)';
ALTER TABLE my_table MODIFY SETTING filter_by_min_time_and_max_time = 0;
```

Обратите внимание: если изменить `id_generator`, когда в таблице tags уже есть данные, для одной и той же комбинации metric+tag могут создаваться разные ID — старые строки сохраняют прежние ID, а новые используют новый генератор.

Остальные настройки нельзя изменить с помощью `ALTER ... MODIFY SETTING`, потому что они закладываются в схему внутренних таблиц в момент `CREATE`.

## Настройки \{#settings\}

Ниже приведён список настроек, которые можно задать при определении таблицы `TimeSeries`:

| Name                                 | Type       | Default              | Description                                                                                                                                                                                                                                                 |
| ------------------------------------ | ---------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id_generator`                       | Expression | зависит от типа `id` | Выражение, вычисляющее идентификатор (fingerprint) временного ряда по его тегам. Если оно не задано, используется выражение по умолчанию для столбца `id`. Если выражение по умолчанию для столбца `id` также не задано, выражение выбирается автоматически |
| `tags_to_columns`                    | Map        | {}                   | Отображение, задающее, какие теги следует вынести в отдельные столбцы в таблице [tags](#tags-table). Синтаксис: `{'tag1': 'column1', 'tag2' : column2, ...}`                                                                                                |
| `use_all_tags_column_to_generate_id` | Bool       | true                 | При генерации выражения для вычисления идентификатора временного ряда этот флаг включает использование столбца `all_tags` в этом вычислении                                                                                                                 |
| `store_min_time_and_max_time`        | Bool       | true                 | Если установлено значение `true`, таблица будет сохранять `min_time` и `max_time` для каждого временного ряда                                                                                                                                               |
| `aggregate_min_time_and_max_time`    | Bool       | true                 | При создании внутренней целевой таблицы `tags` этот флаг включает использование `SimpleAggregateFunction(min, Nullable(DateTime64(3)))` вместо просто `Nullable(DateTime64(3))` как типа столбца `min_time`, и аналогично для столбца `max_time`            |
| `filter_by_min_time_and_max_time`    | Bool       | true                 | Если установлено значение `true`, таблица будет использовать столбцы `min_time` и `max_time` для фильтрации временных рядов                                                                                                                                 |

# Функции \{#functions\}

Ниже приведен список функций, которые принимают таблицу `TimeSeries` в качестве аргумента:

* [timeSeriesSamples](../../../sql-reference/table-functions/timeSeriesSamples.md)
* [timeSeriesTags](../../../sql-reference/table-functions/timeSeriesTags.md)
* [timeSeriesMetrics](../../../sql-reference/table-functions/timeSeriesMetrics.md)