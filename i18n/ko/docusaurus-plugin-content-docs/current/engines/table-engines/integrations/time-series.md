---
'description': '시간 시리즈를 저장하는 테이블 엔진, 즉 타임스탬프 및 태그(또는 레이블)와 연결된 값의 집합입니다.'
'sidebar_label': 'TimeSeries'
'sidebar_position': 60
'slug': '/engines/table-engines/special/time_series'
'title': 'TimeSeries 테이블 엔진'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# TimeSeries 테이블 엔진

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

타임 시리즈, 즉 타임스탬프 및 태그(또는 레이블)와 연관된 값 집합을 저장하는 테이블 엔진:

```sql
metric_name1[tag1=value1, tag2=value2, ...] = {timestamp1: value1, timestamp2: value2, ...}
metric_name2[...] = ...
```

:::info
이것은 실험적인 기능으로, 향후 릴리스에서 하위 호환성이 없는 방식으로 변경될 수 있습니다. 
[allow_experimental_time_series_table](/operations/settings/settings#allow_experimental_time_series_table) 설정으로 TimeSeries 테이블 엔진 사용을 활성화하세요. 
명령어 `set allow_experimental_time_series_table = 1`을 입력하세요.
:::

## 구문 {#syntax}

```sql
CREATE TABLE name [(columns)] ENGINE=TimeSeries
[SETTINGS var1=value1, ...]
[DATA db.data_table_name | DATA ENGINE data_table_engine(arguments)]
[TAGS db.tags_table_name | TAGS ENGINE tags_table_engine(arguments)]
[METRICS db.metrics_table_name | METRICS ENGINE metrics_table_engine(arguments)]
```

## 사용 방법 {#usage}

기본값으로 설정된 상태로 시작하는 것이 더 쉽습니다(열 목록을 지정하지 않고 `TimeSeries` 테이블을 생성하는 것이 허용됩니다):

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

그런 다음 이 테이블은 다음 프로토콜로 사용될 수 있습니다(서버 구성에서 포트가 지정되어야 함):
- [prometheus remote-write](../../../interfaces/prometheus.md#remote-write)
- [prometheus remote-read](../../../interfaces/prometheus.md#remote-read)

## 대상 테이블 {#target-tables}

`TimeSeries` 테이블은 자체 데이터를 가지지 않으며, 모든 데이터는 대상 테이블에 저장됩니다. 
이는 [물리화된 뷰](../../../sql-reference/statements/create/view#materialized-view)와 유사하게 작동하지만, 
물리화된 뷰는 하나의 대상 테이블을 가지는 반면, `TimeSeries` 테이블은 [data](#data-table), [tags](#tags-table), [metrics](#metrics-table)이라는 세 개의 대상 테이블을 가집니다.

대상 테이블은 `CREATE TABLE` 쿼리에서 명시적으로 지정하거나 `TimeSeries` 테이블 엔진이 내부 대상 테이블을 자동으로 생성할 수 있습니다.

대상 테이블은 다음과 같습니다:

### 데이터 테이블 {#data-table}

_data_ 테이블은 특정 식별자와 연관된 타임 시리즈를 포함합니다.

_data_ 테이블은 다음과 같은 컬럼을 가져야 합니다:

| 이름 | 필수? | 기본 유형 | 가능한 유형 | 설명 |
|---|---|---|---|---|
| `id` | [x] | `UUID` | any | 메트릭 이름과 태그의 조합을 식별 |
| `timestamp` | [x] | `DateTime64(3)` | `DateTime64(X)` | 시간 점 |
| `value` | [x] | `Float64` | `Float32` 또는 `Float64` | `timestamp`와 연관된 값 |

### 태그 테이블 {#tags-table}

_tags_ 테이블은 메트릭 이름과 태그의 조합에 대해 계산된 식별자를 포함합니다.

_tags_ 테이블은 다음과 같은 컬럼을 가져야 합니다:

| 이름 | 필수? | 기본 유형 | 가능한 유형 | 설명 |
|---|---|---|---|---|
| `id` | [x] | `UUID` | any (필드 [data](#data-table) 테이블의 `id` 유형과 일치해야 함) | 메트릭 이름과 태그의 조합을 식별하는 `id`. DEFAULT 표현식은 그러한 식별자를 계산하는 방법을 지정 |
| `metric_name` | [x] | `LowCardinality(String)` | `String` 또는 `LowCardinality(String)` | 메트릭의 이름 |
| `<tag_value_column>` | [ ] | `String` | `String` 또는 `LowCardinality(String)` 또는 `LowCardinality(Nullable(String))` | 특정 태그의 값, 태그 이름과 해당하는 컬럼 이름은 [tags_to_columns](#settings) 설정에서 지정 |
| `tags` | [x] | `Map(LowCardinality(String), String)` | `Map(String, String)` 또는 `Map(LowCardinality(String), String)` 또는 `Map(LowCardinality(String), LowCardinality(String))` | 메트릭의 이름을 포함하는 태그 `__name__`을 제외한 태그의 맵과 [tags_to_columns](#settings) 설정에서 열거된 태그 제외 |
| `all_tags` | [ ] | `Map(String, String)` | `Map(String, String)` 또는 `Map(LowCardinality(String), String)` 또는 `Map(LowCardinality(String), LowCardinality(String))` | 일시적인 컬럼, 각각의 행은 메트릭의 이름을 포함하는 태그 `__name__`을 제외한 모든 태그의 맵입니다. 이 컬럼의 유일한 목적은 `id`를 계산하는 것입니다. |
| `min_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` 또는 `Nullable(DateTime64(X))` | 해당 `id`를 가진 타임 시리즈의 최소 타임스탬프. [store_min_time_and_max_time](#settings) 설정이 `true`인 경우 컬럼이 생성됩니다. |
| `max_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` 또는 `Nullable(DateTime64(X))` | 해당 `id`를 가진 타임 시리즈의 최대 타임스탬프. [store_min_time_and_max_time](#settings) 설정이 `true`인 경우 컬럼이 생성됩니다. |

### 메트릭 테이블 {#metrics-table}

_metrics_ 테이블은 수집된 메트릭에 대한 정보, 해당 메트릭의 유형 및 설명을 포함합니다.

_metrics_ 테이블은 다음과 같은 컬럼을 가져야 합니다:

| 이름 | 필수? | 기본 유형 | 가능한 유형 | 설명 |
|---|---|---|---|---|
| `metric_family_name` | [x] | `String` | `String` 또는 `LowCardinality(String)` | 메트릭 패밀리의 이름 |
| `type` | [x] | `String` | `String` 또는 `LowCardinality(String)` | 메트릭 패밀리의 유형: "counter", "gauge", "summary", "stateset", "histogram", "gaugehistogram" 중 하나 |
| `unit` | [x] | `String` | `String` 또는 `LowCardinality(String)` | 메트릭에 사용되는 단위 |
| `help` | [x] | `String` | `String` 또는 `LowCardinality(String)` | 메트릭의 설명 |

`TimeSeries` 테이블에 삽입된 모든 행은 사실상 이 세 개의 대상 테이블에 저장됩니다. 
`TimeSeries` 테이블은 [data](#data-table), [tags](#tags-table), [metrics](#metrics-table) 테이블의 모든 컬럼을 포함합니다.

## 생성 {#creation}

`TimeSeries` 테이블 엔진으로 테이블을 생성하는 방법은 여러 가지가 있습니다. 
가장 간단한 문장은

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

실제로는 다음 테이블을 생성합니다(명령어 `SHOW CREATE TABLE my_table`을 실행하여 확인할 수 있습니다):

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

따라서 컬럼이 자동으로 생성되었으며, 이 문장에 세 개의 내부 UUID가 있습니다 - 생성된 각각의 내부 대상 테이블당 하나씩입니다. 
(내부 UUID는 기본적으로 표시되지 않으며 설정 [show_table_uuid_in_table_create_query_if_not_nil](../../../operations/settings/settings#show_table_uuid_in_table_create_query_if_not_nil) 이 설정되어야만 볼 수 있습니다.)

내부 대상 테이블 이름은 `.inner_id.data.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
`.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, `.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`와 같으며 
각 대상 테이블에는 메인 `TimeSeries` 테이블의 컬럼의 하위 집합이 있습니다:

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

## 컬럼 유형 조정 {#adjusting-column-types}

주 테이블 정의 시 명시적으로 지정함으로써 내부 대상 테이블의 거의 모든 컬럼의 유형을 조정할 수 있습니다. 예를 들어,

```sql
CREATE TABLE my_table
(
    timestamp DateTime64(6)
) ENGINE=TimeSeries
```

내부 [data](#data-table) 테이블이 밀리초 대신 마이크로초로 타임스탬프를 저장하게 만들 것입니다:

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

## `id` 컬럼 {#id-column}

`id` 컬럼은 식별자를 포함하며, 각 식별자는 메트릭 이름과 태그의 조합에 대해 계산됩니다. 
`id` 컬럼의 DEFAULT 표현식은 그러한 식별자를 계산하는 데 사용되는 표현식입니다. 
`id` 컬럼의 유형 및 그 표현식도 명시적으로 지정하여 조정할 수 있습니다:

```sql
CREATE TABLE my_table
(
  id UInt64 DEFAULT sipHash64(metric_name, all_tags)
)
ENGINE=TimeSeries
```

## `tags` 및 `all_tags` 컬럼 {#tags-and-all-tags}

`tags` 및 `all_tags`의 두 개의 컬럼이 태그 맵을 포함합니다. 이 예에서 두 컬럼은 동일한 의미를 가지지만, 
`tags_to_columns` 설정을 사용하는 경우 서로 다를 수 있습니다. 이 설정은 특정 태그가 `tags` 컬럼 내의 맵으로 저장되는 대신 개별 컬럼에 저장되도록 지정할 수 있습니다:

```sql
CREATE TABLE my_table
ENGINE = TimeSeries 
SETTINGS tags_to_columns = {'instance': 'instance', 'job': 'job'}
```

이 문장은 다음과 같은 컬럼을 추가합니다:

```sql
`instance` String,
`job` String
```

`my_table`과 내부 [tags](#tags-table) 대상 테이블 두 정의에 대해서도. 이러한 경우 `tags` 컬럼은 `instance` 및 `job` 태그를 포함하지 않지만, `all_tags` 컬럼은 이를 포함합니다. 
`all_tags` 컬럼은 일시적이며 유일한 목적은 `id` 컬럼의 DEFAULT 표현식에서 사용되는 것입니다.

컬럼의 유형은 명시적으로 지정하여 조정할 수 있습니다:

```sql
CREATE TABLE my_table (
  instance LowCardinality(String),
  job LowCardinality(Nullable(String))
)
ENGINE=TimeSeries
SETTINGS tags_to_columns = {'instance': 'instance', 'job': 'job'}
```

## 내부 대상 테이블의 테이블 엔진 {#inner-table-engines}

기본적으로 내부 대상 테이블은 다음과 같은 테이블 엔진을 사용합니다:
- [data](#data-table) 테이블은 [MergeTree](../mergetree-family/mergetree)를 사용합니다;
- [tags](#tags-table) 테이블은 [AggregatingMergeTree](../mergetree-family/aggregatingmergetree)를 사용합니다. 이 테이블에는 자주 중복된 데이터가 삽입되기 때문에 중복 제거 방법이 필요하고, `min_time` 및 `max_time` 컬럼에 대한 집계를 수행해야 합니다;
- [metrics](#metrics-table) 테이블은 [ReplacingMergeTree](../mergetree-family/replacingmergetree)를 사용합니다. 이 테이블에도 자주 중복된 데이터가 삽입되기 때문에 중복 제거 방법이 필요합니다.

내부 대상 테이블에 대해서는 지정할 경우 다른 테이블 엔진도 사용할 수 있습니다:

```sql
CREATE TABLE my_table ENGINE=TimeSeries
DATA ENGINE=ReplicatedMergeTree
TAGS ENGINE=ReplicatedAggregatingMergeTree
METRICS ENGINE=ReplicatedReplacingMergeTree
```

## 외부 대상 테이블 {#external-target-tables}

`TimeSeries` 테이블이 수동으로 생성된 테이블을 사용할 수 있습니다:

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

## 설정 {#settings}

다음은 `TimeSeries` 테이블 정의 시 지정할 수 있는 설정 목록입니다:

| 이름 | 유형 | 기본값 | 설명 |
|---|---|---|---|
| `tags_to_columns` | Map | {} | 개별 컬럼에 저장해야 하는 태그를 지정하는 맵. 구문: `{'tag1': 'column1', 'tag2' : column2, ...}` |
| `use_all_tags_column_to_generate_id` | Bool | true | 타임 시리즈의 식별자를 계산하기 위한 표현식을 생성할 때 이 플래그는 `all_tags` 컬럼을 해당 계산에 사용하도록 합니다. |
| `store_min_time_and_max_time` | Bool | true | true로 설정되면 테이블은 각 타임 시리즈에 대해 `min_time` 및 `max_time`을 저장합니다. |
| `aggregate_min_time_and_max_time` | Bool | true | 내부 대상 `tags` 테이블을 생성하는 경우 이 플래그가 설정되면 `min_time` 컬럼의 유형으로 `SimpleAggregateFunction(min, Nullable(DateTime64(3)))`를 사용하도록 하며, `max_time` 컬럼에도 동일하게 적용됩니다. |
| `filter_by_min_time_and_max_time` | Bool | true | true로 설정되면 테이블은 타임 시리즈 필터링에 `min_time` 및 `max_time` 컬럼을 사용합니다. |


# 함수 {#functions}

`TimeSeries` 테이블을 인수로 지원하는 함수 목록입니다:
- [timeSeriesData](../../../sql-reference/table-functions/timeSeriesData.md)
- [timeSeriesTags](../../../sql-reference/table-functions/timeSeriesTags.md)
- [timeSeriesMetrics](../../../sql-reference/table-functions/timeSeriesMetrics.md)
