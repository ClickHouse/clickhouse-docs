---
description: '타임 시리즈, 즉 타임스탬프와 태그(또는 레이블)가 연결된 값 집합을 저장하는 테이블 엔진입니다.'
sidebar_label: 'TimeSeries'
sidebar_position: 60
slug: /engines/table-engines/special/time_series
title: 'TimeSeries 테이블 엔진'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# TimeSeries 테이블 엔진 \{#timeseries-table-engine\}

<ExperimentalBadge />

<CloudNotSupportedBadge />

시계열 데이터를 저장하는 테이블 엔진으로, 타임스탬프와 태그(또는 레이블)에 연관된 값들의 집합입니다.

```sql
metric_name1[tag1=value1, tag2=value2, ...] = {timestamp1: value1, timestamp2: value2, ...}
metric_name2[...] = ...
```

:::info
이 기능은 실험적 기능으로, 향후 릴리스에서 하위 호환성이 깨지는 방식으로 변경될 수 있습니다.
[allow&#95;experimental&#95;time&#95;series&#95;table](/operations/settings/settings#allow_experimental_time_series_table) 설정을 통해
TimeSeries 테이블 엔진 사용을 활성화하십시오.
명령어 `set allow_experimental_time_series_table = 1`을(를) 입력하십시오.
:::

## 구문 \{#syntax\}

```sql
CREATE TABLE name [(columns)] ENGINE=TimeSeries
[SETTINGS var1=value1, ...]
[SAMPLES db.samples_table_name | [SAMPLES INNER COLUMNS (...)] [SAMPLES INNER ENGINE engine(arguments)]]
[TAGS db.tags_table_name | [TAGS INNER COLUMNS (...)] [TAGS INNER ENGINE engine(arguments)]]
[METRICS db.metrics_table_name | [METRICS INNER COLUMNS (...)] [METRICS INNER ENGINE engine(arguments)]]
```

:::note
키워드 `SAMPLES`에는 이전 버전과의 호환성을 위해 유지되는 별칭 `DATA`가 있습니다.
:::

## 사용 방법 \{#usage\}

모든 설정을 기본값 그대로 둔 상태에서 시작하는 것이 더 쉽습니다(컬럼 목록을 명시하지 않고도 `TimeSeries` 테이블을 생성할 수 있습니다):

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

이제 이 테이블은 다음 프로토콜로 사용할 수 있습니다(서버 구성에서 포트를 할당해야 합니다).

* [prometheus remote-write](/interfaces/prometheus#remote-write)
* [prometheus remote-read](/interfaces/prometheus#remote-read)

### 외부 컬럼 \{#outer-columns\}

TimeSeries 테이블의 컬럼은 자동으로 생성됩니다. 이 컬럼들은 외부 컬럼으로, 데이터를 저장하지 않으며 SELECT/INSERT를 위한 인터페이스만 제공합니다. 실제 데이터는 [대상 테이블](#target-tables)에 저장됩니다. 외부 컬럼 목록은 다음과 같습니다.

| 이름              | 유형                                          | 설명                                                                                                                                           |
| --------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `metric_name`   | `String`                                    | 메트릭 이름                                                                                                                                       |
| `tags`          | `Map(String, String)`                       | 시계열에 대한 태그(레이블) 맵                                                                                                                            |
| `time_series`   | `Array(Tuple(DateTime64(3), Float64))`(기본값) | 시계열의 (timestamp, 값) 쌍으로 이루어진 배열입니다. 튜플의 timestamp 및 스칼라 요소 타입은 샘플 `INNER COLUMNS` 선언에서 유추할 수 있습니다([외부 컬럼 지정](#specifying-outer-columns) 참조). |
| `metric_family` | `String`                                    | 메트릭 패밀리 이름(메트릭 메타데이터용)                                                                                                                       |
| `type`          | `String`                                    | 메트릭 타입(예: &quot;counter&quot;, &quot;gauge&quot;)                                                                                            |
| `unit`          | `String`                                    | 메트릭 단위                                                                                                                                       |
| `help`          | `String`                                    | 메트릭 설명                                                                                                                                       |

예시:

```sql
INSERT INTO my_table (metric_name, tags, time_series) VALUES
    ('cpu_usage', {'job': 'node_exporter', 'instance': 'host1:9100'},
     [(toDateTime64('2024-01-01 00:00:00', 3), 0.5), (toDateTime64('2024-01-01 00:01:00', 3), 0.7)])
```

`metric_name`은 삽입 시 비어 있어도 됩니다. 이는 메트릭 이름이 `tags`의 `__name__`에 지정된다는 의미입니다. 예시는 다음과 같습니다:

```sql
INSERT INTO my_table (tags, time_series) VALUES
    ({'__name__': 'cpu_usage', 'job': 'test'},
     [(toDateTime64('2024-01-01 00:00:00', 3), 0.5)])
```

메트릭 메타데이터를 삽입하려면 `metric_family`, `type`, `unit`, `help` 컬럼에 값을 삽입합니다:

```sql
INSERT INTO my_table (metric_name, tags, time_series, metric_family, type, unit, help) VALUES
    ('http_requests_total', {'method': 'GET'}, [(now64(), 100.0)],
     'http_requests_total', 'counter', 'requests', 'Total HTTP requests')
```

### 외부 컬럼 지정 \{#specifying-outer-columns\}

기본 `Array(Tuple(DateTime64(3), Float64))` 타입을 재정의하려면 외부 `time_series` 컬럼을 `CREATE TABLE` 문에 명시적으로 나열할 수 있습니다. ClickHouse는 튜플에서 타임스탬프와 스칼라 타입을 추출하여 내부 samples 테이블로 전파합니다:

```sql
CREATE TABLE my_table (time_series Array(Tuple(UInt32, Float32))) ENGINE=TimeSeries
```

이는 samples `INNER COLUMNS` 절에서 timestamp와 값 컬럼의 타입을 직접 선언하는 것과 동일합니다:

```sql
CREATE TABLE my_table ENGINE=TimeSeries
SAMPLES INNER COLUMNS (timestamp UInt32, value Float32)
```

두 형식을 동일한 `CREATE TABLE` 구문에서 모두 사용하는 경우, 선언된 타입은 일치해야 합니다.

## Target tables \{#target-tables\}

`TimeSeries` 테이블은 자체적으로 보유하는 데이터가 없으며, 모든 데이터는 대상 테이블에 저장됩니다.
이는 [materialized view](../../../sql-reference/statements/create/view#materialized-view)의 동작 방식과 유사하지만,
materialized view는 하나의 대상 테이블만 가지는 반면,
`TimeSeries` 테이블은 [samples](#samples-table), [tags](#tags-table), [metrics](#metrics-table)라는 이름의 세 개의 대상 테이블을 가집니다.

대상 테이블은 `CREATE TABLE` 쿼리에서 명시적으로 지정할 수도 있고,
`TimeSeries` 테이블 엔진이 내부 대상 테이블을 자동으로 생성하도록 할 수도 있습니다.

`TimeSeries` 테이블에 삽입된 행은 변환되고, 블록으로 분할되어, 이 세 개의 대상 테이블에 삽입됩니다.

대상 테이블은 다음과 같습니다.

### Samples table \{#samples-table\}

*samples* 테이블에는 특정 식별자에 연결된 시계열(time series) 데이터가 저장됩니다.

*samples* 테이블에는 다음 컬럼이 있어야 합니다:

| Name        | Mandatory? | Default type    | Possible types         | Description              |
| ----------- | ---------- | --------------- | ---------------------- | ------------------------ |
| `id`        | [x]        | `UUID`          | any                    | 메트릭 이름과 태그의 조합을 식별합니다    |
| `timestamp` | [x]        | `DateTime64(3)` | `DateTime64(X)`        | 특정 시점(time point)을 나타냅니다 |
| `value`     | [x]        | `Float64`       | `Float32` or `Float64` | `timestamp`와 연관된 값입니다    |

### Tags 테이블 \{#tags-table\}

*tags* 테이블에는 메트릭 이름과 태그의 각 조합에 대해 계산된 식별자가 저장됩니다.

*tags* 테이블에는 다음 컬럼이 있어야 합니다:

| Name                 | Mandatory? | Default type                          | Possible types                                                                                                          | Description                                                                                                        |
| -------------------- | ---------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `id`                 | [x]        | `UUID`                                | any (must match the type of `id` in the [samples](#samples-table) table)                                                | `id`는 메트릭 이름과 태그의 조합을 식별합니다. DEFAULT 식은 이러한 식별자를 어떻게 계산할지 지정합니다                                                    |
| `metric_name`        | [x]        | `LowCardinality(String)`              | `String` or `LowCardinality(String)`                                                                                    | 메트릭의 이름                                                                                                            |
| `<tag_value_column>` | [ ]        | `String`                              | `String` or `LowCardinality(String)` or `LowCardinality(Nullable(String))`                                              | 특정 태그의 값입니다. 태그의 이름과 해당 컬럼의 이름은 [tags&#95;to&#95;columns](#settings) 설정에서 지정합니다                                    |
| `tags`               | [x]        | `Map(LowCardinality(String), String)` | `Map(String, String)` or `Map(LowCardinality(String), String)` or `Map(LowCardinality(String), LowCardinality(String))` | 메트릭 이름을 포함하는 태그 `__name__`과, 이름이 [tags&#95;to&#95;columns](#settings) 설정에 열거된 태그를 제외한 태그의 맵입니다                     |
| `all_tags`           | [ ]        | `Map(String, String)`                 | `Map(String, String)` or `Map(LowCardinality(String), String)` or `Map(LowCardinality(String), LowCardinality(String))` | 휘발성 컬럼으로, 각 행은 메트릭 이름을 포함하는 태그 `__name__`만 제외한 모든 태그의 맵입니다. 이 컬럼의 유일한 목적은 `id`를 계산할 때 사용되는 것입니다                    |
| `min_time`           | [ ]        | `Nullable(DateTime64(3))`             | `DateTime64(X)` or `Nullable(DateTime64(X))`                                                                            | 해당 `id`를 가진 시계열의 최소 타임스탬프입니다. [store&#95;min&#95;time&#95;and&#95;max&#95;time](#settings)이 `true`인 경우에만 컬럼이 생성됩니다 |
| `max_time`           | [ ]        | `Nullable(DateTime64(3))`             | `DateTime64(X)` or `Nullable(DateTime64(X))`                                                                            | 해당 `id`를 가진 시계열의 최대 타임스탬프입니다. [store&#95;min&#95;time&#95;and&#95;max&#95;time](#settings)이 `true`인 경우에만 컬럼이 생성됩니다 |

### Metrics 테이블 \{#metrics-table\}

*metrics* 테이블에는 수집되는 메트릭에 대한 일부 정보, 해당 메트릭의 타입, 그리고 그 설명이 포함합니다.

*metrics* 테이블에는 다음 컬럼들이 있어야 합니다:

| Name                 | Mandatory? | Default type             | Possible types                       | Description                                                                                                                                            |
| -------------------- | ---------- | ------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `metric_family_name` | [x]        | `String`                 | `String` or `LowCardinality(String)` | 메트릭 패밀리의 이름                                                                                                                                            |
| `type`               | [x]        | `LowCardinality(String)` | `String` or `LowCardinality(String)` | 메트릭 패밀리의 타입. &quot;counter&quot;, &quot;gauge&quot;, &quot;summary&quot;, &quot;stateset&quot;, &quot;histogram&quot;, &quot;gaugehistogram&quot; 중 하나 |
| `unit`               | [x]        | `LowCardinality(String)` | `String` or `LowCardinality(String)` | 메트릭에 사용되는 단위                                                                                                                                           |
| `help`               | [x]        | `String`                 | `String` or `LowCardinality(String)` | 메트릭에 대한 설명                                                                                                                                             |

## 생성 \{#creation\}

`TimeSeries` 테이블 엔진으로 테이블을 생성하는 방법은 여러 가지가 있습니다.
가장 단순한 구문은 다음과 같습니다.

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

실제로 다음과 같은 테이블이 생성됩니다 (`SHOW CREATE TABLE my_table`를 실행하여 확인할 수 있습니다):

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

따라서 컬럼은 자동으로 생성되며, `INNER COLUMNS` 절에는 각자의 컬럼 정의가 저장된 3개의 내부 대상 테이블도 있습니다.

내부 대상 테이블의 이름은 `.inner_id.samples.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
`.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, `.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
와 같으며, 각 대상 테이블은 저마다의 컬럼 집합을 가집니다:

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

## 기존 테이블을 AS로 지정해 테이블 생성하기 \{#create-as\}

`CREATE TABLE new_table AS existing_table` 구문은 `existing_table`에서 다음 항목을 복사합니다.

* `SETTINGS`
* 각 종류의 `INNER COLUMNS`
* 각 종류의 `INNER ENGINE`

`existing_table`에 외부 대상이 있으면 이 구문은 허용되지 않습니다.
바깥쪽 컬럼 목록은 복사되지 않고 다시 생성됩니다.

## 컬럼 타입 조정 \{#adjusting-column-types\}

`INNER COLUMNS` 절을 사용하면 내부 대상 테이블의 컬럼 타입을 조정할 수 있습니다. 예를 들어, timestamp를 마이크로초 단위로 저장하고 값을 `Float32`로 저장하려면 다음과 같습니다.

```sql
CREATE TABLE my_table ENGINE=TimeSeries
SAMPLES INNER COLUMNS (timestamp DateTime64(6), value Float32)
```

같은 절을 사용하여 코덱과 기타 컬럼 속성을 지정할 수 있습니다:

```sql
CREATE TABLE my_table ENGINE=TimeSeries
SAMPLES INNER COLUMNS (timestamp DateTime64(3) CODEC(DoubleDelta))
```

## `id` 컬럼 \{#id-column\}

`id` 컬럼에는 식별자가 들어 있으며, 각 식별자는 메트릭 이름과 태그의 조합을 기준으로 계산됩니다.
식별자를 생성하는 데 사용되는 유형과 `DEFAULT` 표현식은 `TAGS INNER COLUMNS` 절을 통해 사용자 지정할 수 있습니다:

```sql
CREATE TABLE my_table ENGINE=TimeSeries
TAGS INNER COLUMNS (id UInt64 DEFAULT sipHash64(metric_name, all_tags))
```

`id` 컬럼 타입은 `UUID`, `UInt64`, `UInt128`, `FixedString(16)` 중 하나여야 합니다. `DEFAULT` 표현식이 지정되지 않으면 ClickHouse가 `id` 타입에 따라 이를 자동으로 결정합니다. samples 및 tags 내부 테이블에 선언된 `id` 타입은 서로 일치해야 합니다.

`id_generator` 설정을 사용하면 `INNER COLUMNS` 절 없이도 동일하게 사용자 지정할 수 있습니다:

```sql
CREATE TABLE my_table ENGINE=TimeSeries
SETTINGS id_generator = 'sipHash64(metric_name, all_tags)'
```

이 설정이 지정되면 컬럼의 `DEFAULT`에 다른 표현식이 포함되어 있어도 `id` 생성에는 이 설정이 사용됩니다.

## `tags` 및 `all_tags` 컬럼 \{#tags-and-all-tags\}

태그의 맵을 포함하는 컬럼은 `tags`와 `all_tags` 두 개입니다. 이 예시에서는 두 컬럼이 동일한 의미이지만,
`tags_to_columns` SETTING을 사용하면 서로 달라질 수 있습니다. 이 SETTING을 사용하면 특정 태그를 `tags` 컬럼 내부의 맵에 저장하는 대신
별도의 컬럼에 저장하도록 지정할 수 있습니다:

```sql
CREATE TABLE my_table
ENGINE = TimeSeries 
SETTINGS tags_to_columns = {'instance': 'instance', 'job': 'job'}
```

다음 구문은 내부 [tags](#tags-table) 대상 테이블에 `instance`와 `job` 컬럼을 추가합니다.
이 경우 `tags` 컬럼에는 `instance`와 `job` 태그가 포함되지 않지만,
`all_tags` 컬럼에는 포함됩니다. `all_tags` 컬럼은 일시적인(ephemeral) 컬럼이며, `id` 컬럼의 DEFAULT 표현식에서만 사용되도록 존재합니다.

## 내부 대상 테이블의 테이블 엔진 \{#inner-table-engines\}

기본적으로 내부 대상 테이블은 다음과 같은 테이블 엔진을 사용합니다:

* [samples](#samples-table) 테이블은 [MergeTree](../mergetree-family/mergetree) 엔진을 사용합니다.
* [tags](#tags-table) 테이블은 [AggregatingMergeTree](../mergetree-family/aggregatingmergetree) 엔진을 사용합니다. 동일한 데이터가 이 테이블에 여러 번 삽입되는 경우가 많아 중복을 제거할 방법이 필요하고, `min_time` 및 `max_time` 컬럼에 대해 집계를 수행해야 하기 때문입니다.
* [metrics](#metrics-table) 테이블은 [ReplacingMergeTree](../mergetree-family/replacingmergetree) 엔진을 사용합니다. 동일한 데이터가 이 테이블에 여러 번 삽입되는 경우가 많아 중복을 제거할 방법이 필요하기 때문입니다.

명시된 경우에는 다른 테이블 엔진도 내부 대상 테이블에 사용할 수 있습니다:

```sql
CREATE TABLE my_table ENGINE=TimeSeries
SAMPLES ENGINE=ReplicatedMergeTree
TAGS ENGINE=ReplicatedAggregatingMergeTree
METRICS ENGINE=ReplicatedReplacingMergeTree
```

## 외부 대상 테이블 \{#external-target-tables\}

수동으로 생성한 테이블을 `TimeSeries` 테이블에서 사용하도록 구성할 수 있습니다:

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

외부 테이블의 컬럼 타입(`id`, `timestamp`, `value` 및 [`tags_to_columns`](#settings)에 나열된 `<tag_value_column>`들)은 `TimeSeries` 테이블이 내부적으로 생성했을 타입과 일치해야 합니다(타입 제약 조건은 [Samples table](#samples-table), [Tags 테이블](#tags-table), [Metrics 테이블](#metrics-table)을 참조하십시오). 타입 불일치는 `CREATE` 시점에 보고됩니다.

외부 tags 대상의 id 생성기 표현식은 INSERT 시점에 다음 순서로 해석됩니다. 먼저 [`id_generator`](#settings) 설정(설정된 경우), 다음으로 외부 테이블의 `id` 컬럼에 선언된 `DEFAULT`(있는 경우), 마지막으로 `id` 타입에서 파생된 canonical 생성기입니다. 따라서 이 설정은 외부 테이블에 선언된 `DEFAULT`보다 우선합니다. 자세한 내용은 [`id` 컬럼](#id-column)을 참조하십시오.

## 설정 변경 \{#altering-settings\}

`CREATE` 후에는 다음 두 가지 설정을 변경할 수 있습니다:

* `id_generator`
* `filter_by_min_time_and_max_time`

```sql
ALTER TABLE my_table MODIFY SETTING id_generator = 'sipHash64(metric_name, all_tags)';
ALTER TABLE my_table MODIFY SETTING filter_by_min_time_and_max_time = 0;
```

데이터가 이미 tags 테이블에 들어 있는 상태에서 `id_generator`를 변경하면 동일한 메트릭+tag 조합에 대해서도 서로 다른 ID가 생성될 수 있습니다. 기존 행은 이전 ID를 유지하고, 새 행은 새 생성기를 사용합니다.

나머지 설정은 `CREATE` 시점에 내부 테이블의 스키마(schema)에 내장되므로 `ALTER ... MODIFY SETTING`으로는 변경할 수 없습니다.

## Settings \{#settings\}

`TimeSeries` 테이블을 정의할 때 지정할 수 있는 설정 목록은 다음과 같습니다.

| Name                                 | Type       | Default        | Description                                                                                                                                                                           |
| ------------------------------------ | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id_generator`                       | Expression | `id` 유형에 따라 다름 | 태그로부터 시계열의 식별자(지문)를 계산하는 표현식입니다. 설정하지 않으면 `id` 컬럼의 기본 표현식을 사용합니다. `id` 컬럼의 기본 표현식도 설정되지 않은 경우 표현식이 자동으로 선택됩니다.                                                                        |
| `tags_to_columns`                    | 맵          | {}             | [tags](#tags-table) 테이블에서 어떤 태그를 별도 컬럼으로 둘지 지정하는 맵입니다. 문법: `{'tag1': 'column1', 'tag2' : column2, ...}`                                                                               |
| `use_all_tags_column_to_generate_id` | Bool       | true           | 시계열 식별자를 계산하는 식을 생성할 때, 이 플래그가 활성화되면 해당 계산에 `all_tags` 컬럼을 사용합니다.                                                                                                                     |
| `store_min_time_and_max_time`        | Bool       | true           | true로 설정하면 각 시계열에 대해 `min_time` 및 `max_time` 값을 테이블에 저장합니다.                                                                                                                           |
| `aggregate_min_time_and_max_time`    | Bool       | true           | 내부 대상 `tags` 테이블을 생성할 때, 이 플래그가 활성화되면 `min_time` 컬럼 타입으로 `Nullable(DateTime64(3))`만 사용하는 대신 `SimpleAggregateFunction(min, Nullable(DateTime64(3)))`을 사용하며, `max_time` 컬럼도 동일하게 처리합니다. |
| `filter_by_min_time_and_max_time`    | Bool       | true           | true로 설정하면 테이블에서 시계열을 필터링할 때 `min_time` 및 `max_time` 컬럼을 사용합니다.                                                                                                                       |

# 함수 \{#functions\}

다음은 `TimeSeries` 테이블을 인수로 받을 수 있는 함수 목록입니다:

* [timeSeriesSamples](../../../sql-reference/table-functions/timeSeriesSamples.md)
* [timeSeriesTags](../../../sql-reference/table-functions/timeSeriesTags.md)
* [timeSeriesMetrics](../../../sql-reference/table-functions/timeSeriesMetrics.md)