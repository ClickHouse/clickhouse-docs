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
[DATA db.data_table_name | DATA ENGINE data_table_engine(arguments)]
[TAGS db.tags_table_name | TAGS ENGINE tags_table_engine(arguments)]
[METRICS db.metrics_table_name | METRICS ENGINE metrics_table_engine(arguments)]
```


## 사용 방법 \{#usage\}

모든 설정을 기본값 그대로 둔 상태에서 시작하는 것이 더 쉽습니다(컬럼 목록을 명시하지 않고도 `TimeSeries` 테이블을 생성할 수 있습니다):

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

이제 이 테이블은 다음 프로토콜로 사용할 수 있습니다(서버 구성에서 포트를 할당해야 합니다).

* [prometheus remote-write](/interfaces/prometheus#remote-write)
* [prometheus remote-read](/interfaces/prometheus#remote-read)


## Target tables \{#target-tables\}

`TimeSeries` 테이블은 자체적으로 보유하는 데이터가 없으며, 모든 데이터는 대상 테이블에 저장됩니다.
이는 [materialized view](../../../sql-reference/statements/create/view#materialized-view)의 동작 방식과 유사하지만,
materialized view는 하나의 대상 테이블만 가지는 반면,
`TimeSeries` 테이블은 [data](#data-table), [tags](#tags-table), [metrics](#metrics-table)라는 이름의 세 개의 대상 테이블을 가집니다.

대상 테이블은 `CREATE TABLE` 쿼리에서 명시적으로 지정할 수도 있고,
`TimeSeries` 테이블 엔진이 내부 대상 테이블을 자동으로 생성하도록 할 수도 있습니다.

대상 테이블은 다음과 같습니다.

### Data table \{#data-table\}

_data_ 테이블에는 특정 식별자에 연결된 시계열(time series) 데이터가 저장됩니다.

_data_ 테이블에는 다음 컬럼이 있어야 합니다:

| Name | Mandatory? | Default type | Possible types | Description |
|---|---|---|---|---|
| `id` | [x] | `UUID` | any | 메트릭 이름과 태그의 조합을 식별합니다 |
| `timestamp` | [x] | `DateTime64(3)` | `DateTime64(X)` | 특정 시점(time point)을 나타냅니다 |
| `value` | [x] | `Float64` | `Float32` or `Float64` | `timestamp`와 연관된 값입니다 |

### Tags 테이블 \{#tags-table\}

_tags_ 테이블에는 메트릭 이름과 태그의 각 조합에 대해 계산된 식별자가 저장됩니다.

_tags_ 테이블에는 다음 컬럼이 있어야 합니다:

| Name | Mandatory? | Default type | Possible types | Description |
|---|---|---|---|---|
| `id` | [x] | `UUID` | any (must match the type of `id` in the [data](#data-table) table) | `id`는 메트릭 이름과 태그의 조합을 식별합니다. DEFAULT 식은 이러한 식별자를 어떻게 계산할지 지정합니다 |
| `metric_name` | [x] | `LowCardinality(String)` | `String` or `LowCardinality(String)` | 메트릭의 이름 |
| `<tag_value_column>` | [ ] | `String` | `String` or `LowCardinality(String)` or `LowCardinality(Nullable(String))` | 특정 태그의 값입니다. 태그의 이름과 해당 컬럼의 이름은 [tags_to_columns](#settings) 설정에서 지정합니다 |
| `tags` | [x] | `Map(LowCardinality(String), String)` | `Map(String, String)` or `Map(LowCardinality(String), String)` or `Map(LowCardinality(String), LowCardinality(String))` | 메트릭 이름을 포함하는 태그 `__name__`과, 이름이 [tags_to_columns](#settings) 설정에 열거된 태그를 제외한 태그의 맵입니다 |
| `all_tags` | [ ] | `Map(String, String)` | `Map(String, String)` or `Map(LowCardinality(String), String)` or `Map(LowCardinality(String), LowCardinality(String))` | 휘발성 컬럼으로, 각 행은 메트릭 이름을 포함하는 태그 `__name__`만 제외한 모든 태그의 맵입니다. 이 컬럼의 유일한 목적은 `id`를 계산할 때 사용되는 것입니다 |
| `min_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` or `Nullable(DateTime64(X))` | 해당 `id`를 가진 시계열의 최소 타임스탬프입니다. [store_min_time_and_max_time](#settings)이 `true`인 경우에만 컬럼이 생성됩니다 |
| `max_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` or `Nullable(DateTime64(X))` | 해당 `id`를 가진 시계열의 최대 타임스탬프입니다. [store_min_time_and_max_time](#settings)이 `true`인 경우에만 컬럼이 생성됩니다 |

### Metrics 테이블 \{#metrics-table\}

_metrics_ 테이블에는 수집되는 메트릭에 대한 일부 정보, 해당 메트릭의 타입, 그리고 그 설명이 포함합니다.

_metrics_ 테이블에는 다음 컬럼들이 있어야 합니다:

| Name | Mandatory? | Default type | Possible types | Description |
|---|---|---|---|---|
| `metric_family_name` | [x] | `String` | `String` or `LowCardinality(String)` | 메트릭 패밀리의 이름 |
| `type` | [x] | `String` | `String` or `LowCardinality(String)` | 메트릭 패밀리의 타입. "counter", "gauge", "summary", "stateset", "histogram", "gaugehistogram" 중 하나 |
| `unit` | [x] | `String` | `String` or `LowCardinality(String)` | 메트릭에 사용되는 단위 |
| `help` | [x] | `String` | `String` or `LowCardinality(String)` | 메트릭에 대한 설명 |

`TimeSeries` 테이블에 삽입되는 모든 행은 실제로 이 세 개의 대상 테이블에 저장됩니다.
`TimeSeries` 테이블은 [data](#data-table), [tags](#tags-table), [metrics](#metrics-table) 테이블의 모든 컬럼을 포함합니다.

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

따라서 컬럼은 자동으로 생성되었으며, 또한 이 구문에는 세 개의 내부 UUID가 있습니다.
생성된 각 내부 대상 테이블마다 하나씩 존재합니다.
(내부 UUID는 일반적으로 표시되지 않으며,
[show&#95;table&#95;uuid&#95;in&#95;table&#95;create&#95;query&#95;if&#95;not&#95;nil](../../../operations/settings/settings#show_table_uuid_in_table_create_query_if_not_nil)
SETTING을 설정해야 표시됩니다.)

내부 대상 테이블의 이름은 `.inner_id.data.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
`.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, `.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
와 같으며, 각 대상 테이블에는 메인 `TimeSeries` 테이블 컬럼의 부분집합에 해당하는 컬럼들이 있습니다:

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


## 컬럼 타입 조정 \{#adjusting-column-types\}

메인 테이블을 정의할 때 내부 대상 테이블의 거의 모든 컬럼의 타입을 명시적으로 지정하여 조정할 수 있습니다.
예를 들어:

```sql
CREATE TABLE my_table
(
    timestamp DateTime64(6)
) ENGINE=TimeSeries
```

내부 [data](#data-table) 테이블이 타임스탬프를 밀리초 대신 마이크로초 단위로 저장하도록 설정합니다:

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


## `id` 컬럼 \{#id-column\}

`id` 컬럼에는 식별자가 포함되며, 각 식별자는 메트릭 이름과 태그의 조합에 대해 계산됩니다.
`id` 컬럼의 DEFAULT 표현식은 이러한 식별자를 계산하는 데 사용되는 식입니다.
`id` 컬럼의 타입과 해당 표현식은 둘 다 명시적으로 지정하여 조정할 수 있습니다.

```sql
CREATE TABLE my_table
(
  id UInt64 DEFAULT sipHash64(metric_name, all_tags)
)
ENGINE=TimeSeries
```


## `tags` 및 `all_tags` 컬럼 \{#tags-and-all-tags\}

태그의 맵을 포함하는 컬럼은 `tags`와 `all_tags` 두 개입니다. 이 예시에서는 두 컬럼이 동일한 의미이지만,
`tags_to_columns` SETTING을 사용하면 서로 달라질 수 있습니다. 이 SETTING을 사용하면 특정 태그를 `tags` 컬럼 내부의 맵에 저장하는 대신
별도의 컬럼에 저장하도록 지정할 수 있습니다:

```sql
CREATE TABLE my_table
ENGINE = TimeSeries 
SETTINGS tags_to_columns = {'instance': 'instance', 'job': 'job'}
```

다음 구문은 컬럼을 추가합니다:

```sql
`instance` String,
`job` String
```

`my_table`와 그 내부 [tags](#tags-table) 대상 테이블 정의 모두에 적용됩니다. 이 경우 `tags` 컬럼에는 `instance`와 `job` 태그가 포함되지 않지만,
`all_tags` 컬럼에는 포함됩니다. `all_tags` 컬럼은 일시적인(ephemeral) 컬럼이며, `id` 컬럼의 DEFAULT 표현식에서만 사용되도록 존재합니다.

컬럼 타입은 명시적으로 지정하여 조정할 수 있습니다:

```sql
CREATE TABLE my_table (
  instance LowCardinality(String),
  job LowCardinality(Nullable(String))
)
ENGINE=TimeSeries
SETTINGS tags_to_columns = {'instance': 'instance', 'job': 'job'}
```


## 내부 대상 테이블의 테이블 엔진 \{#inner-table-engines\}

기본적으로 내부 대상 테이블은 다음과 같은 테이블 엔진을 사용합니다:

* [data](#data-table) 테이블은 [MergeTree](../mergetree-family/mergetree) 엔진을 사용합니다.
* [tags](#tags-table) 테이블은 [AggregatingMergeTree](../mergetree-family/aggregatingmergetree) 엔진을 사용합니다. 동일한 데이터가 이 테이블에 여러 번 삽입되는 경우가 많아 중복을 제거할 방법이 필요하고, `min_time` 및 `max_time` 컬럼에 대해 집계를 수행해야 하기 때문입니다.
* [metrics](#metrics-table) 테이블은 [ReplacingMergeTree](../mergetree-family/replacingmergetree) 엔진을 사용합니다. 동일한 데이터가 이 테이블에 여러 번 삽입되는 경우가 많아 중복을 제거할 방법이 필요하기 때문입니다.

명시된 경우에는 다른 테이블 엔진도 내부 대상 테이블에 사용할 수 있습니다.

```sql
CREATE TABLE my_table ENGINE=TimeSeries
DATA ENGINE=ReplicatedMergeTree
TAGS ENGINE=ReplicatedAggregatingMergeTree
METRICS ENGINE=ReplicatedReplacingMergeTree
```


## 외부 대상 테이블 \{#external-target-tables\}

`TimeSeries` 테이블이 수동으로 CREATE한 테이블을 사용하도록 설정할 수 있습니다:

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


## Settings \{#settings\}

`TimeSeries` 테이블을 정의할 때 지정할 수 있는 설정 목록은 다음과 같습니다.

| Name | Type | Default | Description |
|---|---|---|---|
| `tags_to_columns` | 맵 | {} | [tags](#tags-table) 테이블에서 어떤 태그를 별도 컬럼으로 둘지 지정하는 맵입니다. 문법: `{'tag1': 'column1', 'tag2' : column2, ...}` |
| `use_all_tags_column_to_generate_id` | Bool | true | 시계열 식별자를 계산하는 식을 생성할 때, 이 플래그가 활성화되면 해당 계산에 `all_tags` 컬럼을 사용합니다. |
| `store_min_time_and_max_time` | Bool | true | true로 설정하면 각 시계열에 대해 `min_time` 및 `max_time` 값을 테이블에 저장합니다. |
| `aggregate_min_time_and_max_time` | Bool | true | 내부 대상 `tags` 테이블을 생성할 때, 이 플래그가 활성화되면 `min_time` 컬럼 타입으로 `Nullable(DateTime64(3))`만 사용하는 대신 `SimpleAggregateFunction(min, Nullable(DateTime64(3)))`을 사용하며, `max_time` 컬럼도 동일하게 처리합니다. |
| `filter_by_min_time_and_max_time` | Bool | true | true로 설정하면 테이블에서 시계열을 필터링할 때 `min_time` 및 `max_time` 컬럼을 사용합니다. |

# 함수 \{#functions\}

다음은 `TimeSeries` 테이블을 인수로 받을 수 있는 함수 목록입니다:

- [timeSeriesData](../../../sql-reference/table-functions/timeSeriesData.md)
- [timeSeriesTags](../../../sql-reference/table-functions/timeSeriesTags.md)
- [timeSeriesMetrics](../../../sql-reference/table-functions/timeSeriesMetrics.md)