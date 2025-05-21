---
description: '時間系列を保存するテーブルエンジン、すなわちタイムスタンプとタグ（またはラベル）に関連付けられた値のセット。'
sidebar_label: 'TimeSeries'
sidebar_position: 60
slug: /engines/table-engines/special/time_series
title: 'TimeSeries エンジン'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# TimeSeries エンジン

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

時間系列を保存するテーブルエンジン、すなわちタイムスタンプとタグ（またはラベル）に関連付けられた値のセット：

```sql
metric_name1[tag1=value1, tag2=value2, ...] = {timestamp1: value1, timestamp2: value2, ...}
metric_name2[...] = ...
```

:::info
これは実験的な機能であり、将来のリリースで後方互換性のない変更が加えられる可能性があります。
[allow_experimental_time_series_table](/operations/settings/settings#allow_experimental_time_series_table) 設定を使用して TimeSeries テーブルエンジンの使用を有効にします。
コマンド `set allow_experimental_time_series_table = 1` を入力してください。
:::

## 構文 {#syntax}

```sql
CREATE TABLE name [(columns)] ENGINE=TimeSeries
[SETTINGS var1=value1, ...]
[DATA db.data_table_name | DATA ENGINE data_table_engine(arguments)]
[TAGS db.tags_table_name | TAGS ENGINE tags_table_engine(arguments)]
[METRICS db.metrics_table_name | METRICS ENGINE metrics_table_engine(arguments)]
```

## 使用法 {#usage}

全ての設定をデフォルトのままで始めるのが簡単です（カラムのリストを指定せずに `TimeSeries` テーブルを作成することが許可されています）：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

このテーブルは以下のプロトコルで使用できます（ポートはサーバー設定で割り当てる必要があります）：
- [prometheus remote-write](../../../interfaces/prometheus.md#remote-write)
- [prometheus remote-read](../../../interfaces/prometheus.md#remote-read)

## ターゲットテーブル {#target-tables}

`TimeSeries` テーブルは独自のデータを持っておらず、全てのデータはターゲットテーブルに保存されます。
これは [materialized view](../../../sql-reference/statements/create/view#materialized-view) の動作に似ていますが、
materialized view には一つのターゲットテーブルがあるのに対し、`TimeSeries` テーブルには [data](#data-table)、[tags](#tags-table)、および [metrics](#metrics-table) という 3 つのターゲットテーブルがあります。

ターゲットテーブルは `CREATE TABLE` クエリ内で明示的に指定することもできますし、
`TimeSeries` テーブルエンジンが内部ターゲットテーブルを自動生成することもできます。

ターゲットテーブルは以下の通りです：

### データテーブル {#data-table}

_data_ テーブルは、ある識別子に関連付けられた時間系列を含みます。

_data_ テーブルには次のカラムが必要です：

| 名前 | 必須？ | デフォルト型 | 可能な型 | 説明 |
|---|---|---|---|---|
| `id` | [x] | `UUID` | いずれでも可 | メトリック名とタグの組み合わせを識別 |
| `timestamp` | [x] | `DateTime64(3)` | `DateTime64(X)` | 時間のポイント |
| `value` | [x] | `Float64` | `Float32` または `Float64` | `timestamp` に関連付けられた値 |


### タグテーブル {#tags-table}

_tags_ テーブルは、メトリック名とタグの組み合わせごとに計算された識別子を含みます。

_tags_ テーブルには次のカラムが必要です：

| 名前 | 必須？ | デフォルト型 | 可能な型 | 説明 |
|---|---|---|---|---|
| `id` | [x] | `UUID` | いずれでも可（[data](#data-table) テーブルの `id` 型に一致する必要があります） | `id` はメトリック名とタグの組み合わせを識別します。DEFAULT 式はその識別子を計算する方法を指定します |
| `metric_name` | [x] | `LowCardinality(String)` | `String` または `LowCardinality(String)` | メトリックの名前 |
| `<tag_value_column>` | [ ] | `String` | `String` または `LowCardinality(String)` または `LowCardinality(Nullable(String))` | 特定のタグの値、タグの名前と対応するカラムの名前は [tags_to_columns](#settings) 設定で指定されます |
| `tags` | [x] | `Map(LowCardinality(String), String)` | `Map(String, String)` または `Map(LowCardinality(String), String)` または `Map(LowCardinality(String), LowCardinality(String))` | メトリックの名前を含むタグ `__name__` を除外したタグのマップで、[tags_to_columns](#settings) 設定で列挙されたタグは除外されます |
| `all_tags` | [ ] | `Map(String, String)` | `Map(String, String)` または `Map(LowCardinality(String), String)` または `Map(LowCardinality(String), LowCardinality(String))` | 一時的なカラム、各行はメトリックの名前を含むタグ `__name__` を除外した全てのタグのマップです。このカラムの唯一の目的は `id` を計算するために使用されることです |
| `min_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` または `Nullable(DateTime64(X))` | その `id` を持つ時間系列の最小タイムスタンプ。カラムは [store_min_time_and_max_time](#settings) が `true` の場合に作成されます |
| `max_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` または `Nullable(DateTime64(X))` | その `id` を持つ時間系列の最大タイムスタンプ。カラムは [store_min_time_and_max_time](#settings) が `true` の場合に作成されます |


### メトリックテーブル {#metrics-table}

_metrics_ テーブルは、収集されたメトリックに関する情報、メトリックの種類、およびその説明を含みます。

_metrics_ テーブルには次のカラムが必要です：

| 名前 | 必須？ | デフォルト型 | 可能な型 | 説明 |
|---|---|---|---|---|
| `metric_family_name` | [x] | `String` | `String` または `LowCardinality(String)` | メトリックファミリーの名前 |
| `type` | [x] | `String` | `String` または `LowCardinality(String)` | メトリックファミリーのタイプ。「counter」、「gauge」、「summary」、「stateset」、「histogram」、または「gaugehistogram」のいずれか |
| `unit` | [x] | `String` | `String` または `LowCardinality(String)` | メトリックで使用される単位 |
| `help` | [x] | `String` | `String` または `LowCardinality(String)` | メトリックの説明 |

`TimeSeries` テーブルに挿入された行は、実際にはこれらの 3 つのターゲットテーブルに保存されます。
`TimeSeries` テーブルには、[data](#data-table)、[tags](#tags-table)、[metrics](#metrics-table) テーブルの全てのカラムが含まれます。

## 作成 {#creation}

`TimeSeries` テーブルエンジンを使用してテーブルを作成する方法はいくつかあります。
最も簡単なステートメントは

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

で、実際には以下のようなテーブルが作成されます（`SHOW CREATE TABLE my_table` を実行することで確認できます）：

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

したがって、カラムは自動的に生成され、またこのステートメントには作成された各内部ターゲットテーブルに対して 1 つの内部 UUID が含まれています。
（通常、内部 UUID は設定
[show_table_uuid_in_table_create_query_if_not_nil](../../../operations/settings/settings#show_table_uuid_in_table_create_query_if_not_nil)
が設定されていない限り表示されません。）

内部ターゲットテーブルの名前は `.inner_id.data.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`、`.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`、`.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` のようになり、各ターゲットテーブルにはメインの `TimeSeries` テーブルのカラムのサブセットが含まれます：

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

## カラム型の調整 {#adjusting-column-types}

メインテーブルを定義するときにカラムの型を明示的に指定することで、内部ターゲットテーブルのほぼ全てのカラムの型を調整できます。例えば、

```sql
CREATE TABLE my_table
(
    timestamp DateTime64(6)
) ENGINE=TimeSeries
```

とすると、内部 [data](#data-table) テーブルはミリ秒ではなくマイクロ秒でタイムスタンプを保存します：

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

## `id` カラム {#id-column}

`id` カラムには識別子が含まれ、各識別子はメトリック名とタグの組み合わせのために計算されます。
`id` カラムのデフォルト式は、そのような識別子を計算するために使用される式です。
`id` カラムの型とその式は明示的に指定することで調整できます：

```sql
CREATE TABLE my_table
(
    id UInt64 DEFAULT sipHash64(metric_name, all_tags)
) ENGINE=TimeSeries
```

## `tags` と `all_tags` カラム {#tags-and-all-tags}

`tags` と `all_tags` の 2 つのカラムがタグのマップを含んでいます。この例では、どちらも同じ意味を持ちますが、`tags_to_columns` 設定を使用する場合、それらは異なる場合があります。この設定を使用すると、特定のタグを `tags` カラム内のマップではなく、別のカラムに保存するよう指定できます：

```sql
CREATE TABLE my_table ENGINE=TimeSeries SETTINGS = {'instance': 'instance', 'job': 'job'}
```

このステートメントは、次のカラムを追加します：
```sql
    `instance` String,
    `job` String
```
`my_table` とその内部 [tags](#tags-table) ターゲットテーブルの定義の両方にです。この場合、`tags` カラムには `instance` と `job` タグは含まれませんが、`all_tags` カラムには含まれます。`all_tags` カラムは一時的であり、唯一の目的は `id` カラムの DEFAULT 式で使用されることです。

カラムの型は明示的に指定することで調整できます：

```sql
CREATE TABLE my_table (instance LowCardinality(String), job LowCardinality(Nullable(String)))
ENGINE=TimeSeries SETTINGS = {'instance': 'instance', 'job': 'job'}
```

## 内部ターゲットテーブルのテーブルエンジン {#inner-table-engines}

デフォルトでは、内部ターゲットテーブルは以下のテーブルエンジンを使用します：
- [data](#data-table) テーブルは [MergeTree](../mergetree-family/mergetree) を使用します；
- [tags](#tags-table) テーブルは [AggregatingMergeTree](../mergetree-family/aggregatingmergetree) を使用します。これは、同じデータがこのテーブルに複数回挿入されることが多いため、重複を除去する方法が必要であり、また `min_time` と `max_time` カラムの集約を行うために必要です；
- [metrics](#metrics-table) テーブルは [ReplacingMergeTree](../mergetree-family/replacingmergetree) を使用します。これも、同じデータがこのテーブルに複数回挿入されることが多いため、重複を除去する方法が必要です。

他のテーブルエンジンも、次のように指定されれば内部ターゲットテーブルで使用可能です：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
DATA ENGINE=ReplicatedMergeTree
TAGS ENGINE=ReplicatedAggregatingMergeTree
METRICS ENGINE=ReplicatedReplacingMergeTree
```

## 外部ターゲットテーブル {#external-target-tables}

`TimeSeries` テーブルが手動で作成したテーブルを使用できるようにすることも可能です：

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

## 設定 {#settings}

`TimeSeries` テーブルを定義する際に指定できる設定のリストは以下の通りです：

| 名前 | 型 | デフォルト | 説明 |
|---|---|---|---|
| `tags_to_columns` | Map | {} | [tags](#tags-table) テーブルに別のカラムに移動すべきタグを指定するマップ。構文: `{'tag1': 'column1', 'tag2' : column2, ...}` |
| `use_all_tags_column_to_generate_id` | Bool | true | 時間系列の識別子を計算するための式を生成する際に、`all_tags` カラムを使用することを有効にします |
| `store_min_time_and_max_time` | Bool | true | true に設定されると、テーブルは各時間系列の `min_time` と `max_time` を保存します |
| `aggregate_min_time_and_max_time` | Bool | true | 内部ターゲット `tags` テーブルを作成する際、このフラグが有効になると、`min_time` カラムの型として `SimpleAggregateFunction(min, Nullable(DateTime64(3)))` を使用します。`max_time` カラムに対しても同様です |
| `filter_by_min_time_and_max_time` | Bool | true | true に設定されると、テーブルは時間系列のフィルタリングに `min_time` と `max_time` カラムを使用します |


# 関数 {#functions}

`TimeSeries` テーブルを引数としてサポートする関数のリストは以下の通りです：
- [timeSeriesData](../../../sql-reference/table-functions/timeSeriesData.md)
- [timeSeriesTags](../../../sql-reference/table-functions/timeSeriesTags.md)
- [timeSeriesMetrics](../../../sql-reference/table-functions/timeSeriesMetrics.md)
