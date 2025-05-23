---
'description': 'A table engine storing time series, i.e. a set of values associated
  with timestamps and tags (or labels).'
'sidebar_label': 'TimeSeries'
'sidebar_position': 60
'slug': '/engines/table-engines/special/time_series'
'title': 'TimeSeries Engine'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# TimeSeries Engine

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

タイムシリーズ、すなわちタイムスタンプとタグ（またはラベル）に関連付けられた値のセットを格納するテーブルエンジン：

```sql
metric_name1[tag1=value1, tag2=value2, ...] = {timestamp1: value1, timestamp2: value2, ...}
metric_name2[...] = ...
```

:::info
これは実験的な機能であり、将来のリリースで後方互換性のない方法で変更される可能性があります。
[allow_experimental_time_series_table](/operations/settings/settings#allow_experimental_time_series_table) 設定を使用して、TimeSeriesテーブルエンジンの使用を有効にします。
コマンド `set allow_experimental_time_series_table = 1` を入力します。
:::

## Syntax {#syntax}

```sql
CREATE TABLE name [(columns)] ENGINE=TimeSeries
[SETTINGS var1=value1, ...]
[DATA db.data_table_name | DATA ENGINE data_table_engine(arguments)]
[TAGS db.tags_table_name | TAGS ENGINE tags_table_engine(arguments)]
[METRICS db.metrics_table_name | METRICS ENGINE metrics_table_engine(arguments)]
```

## Usage {#usage}

すべてがデフォルトで設定される状態から始める方が簡単です（カラムのリストを指定せずに `TimeSeries` テーブルを作成することが許可されます）：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

その後、このテーブルは以下のプロトコルで使用できます（ポートはサーバー設定で割り当てる必要があります）：
- [prometheus remote-write](../../../interfaces/prometheus.md#remote-write)
- [prometheus remote-read](../../../interfaces/prometheus.md#remote-read)

## Target tables {#target-tables}

`TimeSeries` テーブルは独自のデータを持っておらず、すべてのデータはターゲットテーブルに保存されています。
これは [materialized view](../../../sql-reference/statements/create/view#materialized-view) の動作に似ていますが、
materialized view は1つのターゲットテーブルであるのに対し、`TimeSeries` テーブルは [data](#data-table)、[tags](#tags-table)、および [metrics](#metrics-table) という名前の3つのターゲットテーブルを持っています。

ターゲットテーブルは `CREATE TABLE` クエリで明示的に指定することもでき、
`TimeSeries` テーブルエンジンは内部のターゲットテーブルを自動的に生成することもできます。

ターゲットテーブルは以下です：

### Data table {#data-table}

_data_ テーブルは、特定の識別子に関連付けられたタイムシリーズを含みます。

_data_ テーブルは次のカラムを持つ必要があります：

| Name | Mandatory? | Default type | Possible types | Description |
|---|---|---|---|---|
| `id` | [x] | `UUID` | いずれでもよい | メトリック名とタグの組み合わせを識別します |
| `timestamp` | [x] | `DateTime64(3)` | `DateTime64(X)` | 時間ポイント |
| `value` | [x] | `Float64` | `Float32` または `Float64` | `timestamp` に関連付けられた値 |


### Tags table {#tags-table}

_tags_ テーブルは、メトリック名とタグの組み合わせごとに計算された識別子を含んでいます。

_tags_ テーブルは次のカラムを持つ必要があります：

| Name | Mandatory? | Default type | Possible types | Description |
|---|---|---|---|---|
| `id` | [x] | `UUID` | いずれでもよい（[data](#data-table) テーブルの `id` の型と一致する必要があります） | `id` はメトリック名とタグの組み合わせを識別します。DEFAULT式はそのような識別子を計算する方法を指定します。 |
| `metric_name` | [x] | `LowCardinality(String)` | `String` または `LowCardinality(String)` | メトリックの名前 |
| `<tag_value_column>` | [ ] | `String` | `String` または `LowCardinality(String)` または `LowCardinality(Nullable(String))` | 特定のタグの値、タグの名前と対応するカラムの名前は [tags_to_columns](#settings) 設定で指定されます |
| `tags` | [x] | `Map(LowCardinality(String), String)` | `Map(String, String)` または `Map(LowCardinality(String), String)` または `Map(LowCardinality(String), LowCardinality(String))` | `__name__` タグを除くメトリックの名前を含むタグのマップ、[tags_to_columns](#settings) 設定で列挙された名前のタグを除外します |
| `all_tags` | [ ] | `Map(String, String)` | `Map(String, String)` または `Map(LowCardinality(String), String)` または `Map(LowCardinality(String), LowCardinality(String))` | 一時カラム、各行はメトリックの名前を含むすべてのタグのマップです。このカラムの唯一の目的は `id` を計算する際に使用されることです。 |
| `min_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` または `Nullable(DateTime64(X))` | その `id` を持つタイムシリーズの最小タイムスタンプ。このカラムは [store_min_time_and_max_time](#settings) が `true` の場合に作成されます。 |
| `max_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` または `Nullable(DateTime64(X))` | その `id` を持つタイムシリーズの最小タイムスタンプ。このカラムは [store_min_time_and_max_time](#settings) が `true` の場合に作成されます。 |

### Metrics table {#metrics-table}

_metrics_ テーブルは、収集されたメトリックについての情報、メトリックの種類、およびその説明を含みます。

_metrics_ テーブルは次のカラムを持つ必要があります：

| Name | Mandatory? | Default type | Possible types | Description |
|---|---|---|---|---|
| `metric_family_name` | [x] | `String` | `String` または `LowCardinality(String)` | メトリックファミリの名前 |
| `type` | [x] | `String` | `String` または `LowCardinality(String)` | メトリックファミリのタイプ、"counter"、"gauge"、"summary"、"stateset"、"histogram"、"gaugehistogram" のいずれか |
| `unit` | [x] | `String` | `String` または `LowCardinality(String)` | メトリックで使用される単位 |
| `help` | [x] | `String` | `String` または `LowCardinality(String)` | メトリックの説明 |

`TimeSeries` テーブルに挿入されたすべての行は、実際にはこれらの3つのターゲットテーブルに格納されます。
`TimeSeries` テーブルには、[data](#data-table)、[tags](#tags-table)、[metrics](#metrics-table) テーブルからこれらのすべてのカラムが含まれます。

## Creation {#creation}

`TimeSeries` テーブルエンジンを使用してテーブルを作成する方法はいくつかあります。
最も簡単なステートメントは次の通りです。

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

実際には、以下のテーブルが作成されます（`SHOW CREATE TABLE my_table` を実行すると確認できます）：

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

したがって、カラムは自動的に生成され、また、このステートメントには作成された各内部ターゲットテーブルに対する1つの内部UUIDが含まれています。
（内部UUIDは通常、設定された場合を除いて表示されません。
[show_table_uuid_in_table_create_query_if_not_nil](../../../operations/settings/settings#show_table_uuid_in_table_create_query_if_not_nil) が設定されている場合。）

内部ターゲットテーブルの名前は、`.inner_id.data.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`、`.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`、`.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` のようになり、
各ターゲットテーブルには、その主な `TimeSeries` テーブルのカラムのサブセットが含まれます：

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

## Adjusting types of columns {#adjusting-column-types}

内部ターゲットテーブルのほとんどのカラムの型を、メインテーブルを定義する際に明示的に指定することによって調整できます。
たとえば、

```sql
CREATE TABLE my_table
(
    timestamp DateTime64(6)
) ENGINE=TimeSeries
```

は、内部の [data](#data-table) テーブルがミリ秒ではなくマイクロ秒でタイムスタンプを格納するようにします：

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

## The `id` column {#id-column}

`id` カラムは識別子を含み、各識別子はメトリック名とタグの組み合わせのために計算されます。
`id` カラムのデフォルト式は、そのような識別子を計算するために使用される式です。
`id` カラムの型ともその式は、明示的に指定することによって調整できます：

```sql
CREATE TABLE my_table
(
    id UInt64 DEFAULT sipHash64(metric_name, all_tags)
) ENGINE=TimeSeries
```

## The `tags` and `all_tags` columns {#tags-and-all-tags}

`tags` と `all_tags` の2つのカラムがあります。これらはタグのマップを含みます。この例では同じ意味ですが、
`tags_to_columns` 設定が使用される場合には異なることがあります。この設定は、特定のタグをマップ内に格納する代わりに、別のカラムに格納することを指定できます：

```sql
CREATE TABLE my_table ENGINE=TimeSeries SETTINGS = {'instance': 'instance', 'job': 'job'}
```

このステートメントは、両方の `my_table` とその内部 [tags](#tags-table) ターゲットテーブルの定義に次のカラムを追加します。
```sql
    `instance` String,
    `job` String
```
この場合、`tags` カラムには `instance` と `job` タグは含まれませんが、`all_tags` カラムには含まれます。`all_tags` カラムは一時的なもので、その唯一の目的は `id` カラムのデフォルト式で使用されることです。

カラムの型は明示的に指定することによって調整できます：

```sql
CREATE TABLE my_table (instance LowCardinality(String), job LowCardinality(Nullable(String)))
ENGINE=TimeSeries SETTINGS = {'instance': 'instance', 'job': 'job'}
```

## Table engines of inner target tables {#inner-table-engines}

デフォルトでは、内部ターゲットテーブルは以下のテーブルエンジンを使用します：
- [data](#data-table) テーブルは [MergeTree](../mergetree-family/mergetree) を使用します。
- [tags](#tags-table) テーブルは [AggregatingMergeTree](../mergetree-family/aggregatingmergetree) を使用します。これは、同じデータがこのテーブルに何度も挿入されるため、重複を削除する方法が必要であり、また `min_time` および `max_time` カラムの集計を行うために必要です。
- [metrics](#metrics-table) テーブルは [ReplacingMergeTree](../mergetree-family/replacingmergetree) を使用します。これは、同じデータがこのテーブルに何度も挿入されるため、重複を削除する方法が必要です。

他のテーブルエンジンも、明示的に指定すれば内部ターゲットテーブルで使用できます：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
DATA ENGINE=ReplicatedMergeTree
TAGS ENGINE=ReplicatedAggregatingMergeTree
METRICS ENGINE=ReplicatedReplacingMergeTree
```

## External target tables {#external-target-tables}

手動で作成したテーブルを使用する `TimeSeries` テーブルを作成することも可能です：

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

## Settings {#settings}

ここに、`TimeSeries` テーブルを定義する際に指定できる設定のリストがあります：

| Name | Type | Default | Description |
|---|---|---|---|
| `tags_to_columns` | Map | {} | 特定のタグを [tags](#tags-table) テーブルの別々のカラムに入れるべきかを指定するマップ。構文： `{'tag1': 'column1', 'tag2' : column2, ...}` |
| `use_all_tags_column_to_generate_id` | Bool | true | タイムシリーズの識別子を計算するための式を生成する際、このフラグは `all_tags` カラムをその計算に使用することを有効にします。 |
| `store_min_time_and_max_time` | Bool | true | `true` に設定すると、テーブルは各タイムシリーズの `min_time` と `max_time` を保存します。 |
| `aggregate_min_time_and_max_time` | Bool | true | 内部ターゲット `tags` テーブルを作成する際に、このフラグは `min_time` カラムの型として `SimpleAggregateFunction(min, Nullable(DateTime64(3)))` 使用することを可能にします。同様に `max_time` カラムにも適用されます。 |
| `filter_by_min_time_and_max_time` | Bool | true | `true` に設定すると、テーブルはタイムシリーズのフィルタリングに `min_time` および `max_time` カラムを使用します。 |


# Functions {#functions}

以下は、`TimeSeries` テーブルを引数としてサポートする関数のリストです：
- [timeSeriesData](../../../sql-reference/table-functions/timeSeriesData.md)
- [timeSeriesTags](../../../sql-reference/table-functions/timeSeriesTags.md)
- [timeSeriesMetrics](../../../sql-reference/table-functions/timeSeriesMetrics.md)
