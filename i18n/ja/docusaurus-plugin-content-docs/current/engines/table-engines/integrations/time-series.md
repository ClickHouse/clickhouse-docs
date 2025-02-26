---
slug: /engines/table-engines/special/time_series
sidebar_position: 60
sidebar_label: TimeSeries
title: "TimeSeries エンジン"
description: "タイムスタンプとタグ（またはラベル）に関連付けられた値のセットである時系列を格納するテーブルエンジン。"
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# TimeSeries エンジン

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

タイムスタンプとタグ（またはラベル）に関連付けられた値のセットである時系列を格納するテーブルエンジン：

```sql
metric_name1[tag1=value1, tag2=value2, ...] = {timestamp1: value1, timestamp2: value2, ...}
metric_name2[...] = ...
```

:::info
これは実験的な機能であり、今後のリリースでは後方互換性のない方法で変更される可能性があります。
[allow_experimental_time_series_table](../../../operations/settings/settings.md#allow-experimental-time-series-table) 設定を使用して、TimeSeries テーブルエンジンの使用を有効にします。
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

すべてをデフォルトで設定することから始めるのが簡単です（列のリストを指定せずに `TimeSeries` テーブルを作成することが許可されています）：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

このテーブルは、次のプロトコルで使用できます（サーバー設定でポートを割り当てる必要があります）：
- [prometheus remote-write](../../../interfaces/prometheus.md#remote-write)
- [prometheus remote-read](../../../interfaces/prometheus.md#remote-read)

## ターゲットテーブル {#target-tables}

`TimeSeries` テーブルは独自のデータを持たず、すべてはターゲットテーブルに格納されます。
これは、[マテリアライズドビュー](../../../sql-reference/statements/create/view#materialized-view)が動作する方法と似ていますが、
マテリアライズドビューは1つのターゲットテーブルを持つのに対し、`TimeSeries` テーブルは [data](#data-table)、[tags](#tags-table)、[metrics](#metrics-table) という3つのターゲットテーブルを持ちます。

ターゲットテーブルは、`CREATE TABLE` クエリで明示的に指定するか、`TimeSeries` テーブルエンジンが内部ターゲットテーブルを自動的に生成することができます。

ターゲットテーブルは以下の通りです：

### データテーブル {#data-table}

_データ_ テーブルは、ある識別子に関連付けられた時系列を含みます。

_データ_ テーブルには以下のカラムが必要です：

| 名前 | 必須? | デフォルトタイプ | 可能なタイプ | 説明 |
|---|---|---|---|---|
| `id` | [x] | `UUID` | 任意 | メトリック名とタグの組み合わせを特定 |
| `timestamp` | [x] | `DateTime64(3)` | `DateTime64(X)` | 時刻ポイント |
| `value` | [x] | `Float64` | `Float32` または `Float64` | `timestamp` に関連付けられた値 |

### タグテーブル {#tags-table}

_タグ_ テーブルは、メトリック名とタグの各組み合わせに対して計算された識別子を含みます。

_タグ_ テーブルには以下のカラムが必要です：

| 名前 | 必須? | デフォルトタイプ | 可能なタイプ | 説明 |
|---|---|---|---|---|
| `id` | [x] | `UUID` | 任意（[データ](#data-table) テーブルの `id` と同じタイプである必要があります） | `id` はメトリック名とタグの組み合わせを特定します。DEFAULT 式はその識別子の計算方法を指定します |
| `metric_name` | [x] | `LowCardinality(String)` | `String` または `LowCardinality(String)` | メトリックの名前 |
| `<tag_value_column>` | [ ] | `String` | `String` または `LowCardinality(String)` または `LowCardinality(Nullable(String))` | 特定のタグの値、タグの名前と対応するカラムの名前は [tags_to_columns](#settings) 設定で指定されます |
| `tags` | [x] | `Map(LowCardinality(String), String)` | `Map(String, String)` または `Map(LowCardinality(String), String)` または `Map(LowCardinality(String), LowCardinality(String))` | メトリック名を含む `__name__` タグを除外し、[tags_to_columns](#settings) 設定で列挙されたタグを除外したタグのマップ |
| `all_tags` | [ ] | `Map(String, String)` | `Map(String, String)` または `Map(LowCardinality(String), String)` または `Map(LowCardinality(String), LowCardinality(String))` | 一時的なカラム、各行はメトリック名を含む `__name__` タグを除くすべてのタグのマップです。このカラムの唯一の目的は `id` の計算時に使用されることです |
| `min_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` または `Nullable(DateTime64(X))` | その `id` を持つ時系列の最小タイムスタンプ。 [store_min_time_and_max_time](#settings) が `true` の場合、カラムが作成されます |
| `max_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` または `Nullable(DateTime64(X))` | その `id` を持つ時系列の最大タイムスタンプ。 [store_min_time_and_max_time](#settings) が `true` の場合、カラムが作成されます |

### メトリックテーブル {#metrics-table}

_メトリック_ テーブルは、収集されたメトリックに関する情報、そのメトリックのタイプや説明を含みます。

_メトリック_ テーブルには以下のカラムが必要です：

| 名前 | 必須? | デフォルトタイプ | 可能なタイプ | 説明 |
|---|---|---|---|---|
| `metric_family_name` | [x] | `String` | `String` または `LowCardinality(String)` | メトリックファミリーの名前 |
| `type` | [x] | `String` | `String` または `LowCardinality(String)` | メトリックファミリーのタイプ、「counter」、「gauge」、「summary」、「stateset」、「histogram」、「gaugehistogram」のいずれか |
| `unit` | [x] | `String` | `String` または `LowCardinality(String)` | メトリックで使用される単位 |
| `help` | [x] | `String` | `String` または `LowCardinality(String)` | メトリックの説明 |

`TimeSeries` テーブルに挿入された行は、実際にはこれらの3つのターゲットテーブルに格納されます。
`TimeSeries` テーブルには、[データ](#data-table)、[タグ](#tags-table)、[メトリック](#metrics-table) テーブルからのすべてのカラムが含まれます。

## 作成 {#creation}

`TimeSeries` テーブルエンジンを使用してテーブルを作成する方法はいくつかあります。
最も簡単なステートメント

``` sql
CREATE TABLE my_table ENGINE=TimeSeries
```

実際には次のテーブルが作成されます（`SHOW CREATE TABLE my_table` を実行することで確認できます）：

``` sql
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

したがって、カラムは自動的に生成され、また、この文には3つの内部UUIDもあります。
それぞれ作成された内部ターゲットテーブルに1つずつです。
（内部UUIDは、[show_table_uuid_in_table_create_query_if_not_nil](../../../operations/settings/settings#show_table_uuid_in_table_create_query_if_not_nil) が設定されていない限り通常は表示されません。）

内部ターゲットテーブルは次のように名前が付けられています：`.inner_id.data.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`、
`.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`、`.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
および各ターゲットテーブルには、メインの `TimeSeries` テーブルのカラムのサブセットが含まれています：

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

## カラムタイプの調整 {#adjusting-column-types}

主テーブルを定義する際に、ほぼすべての内部ターゲットテーブルのカラムのタイプを明示的に指定することで調整できます。
例えば、

```sql
CREATE TABLE my_table
(
    timestamp DateTime64(6)
) ENGINE=TimeSeries
```

は、内部 [データ](#data-table) テーブルがミリ秒ではなくマイクロ秒でタイムスタンプを保存するようにします：

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
`id` カラムの DEFAULT 式は、そのような識別子を計算するために使用される表現です。
`id` カラムのタイプとその式は、明示的に指定することで調整できます：

``` sql
CREATE TABLE my_table
(
    id UInt64 DEFAULT sipHash64(metric_name, all_tags)
) ENGINE=TimeSeries
```

## `tags` および `all_tags` カラム {#tags-and-all-tags}

2つのカラムがあり、タグのマップを含んでいます - `tags` と `all_tags`。この例ではそれらは同じ意味ですが、`tags_to_columns` 設定が使用される場合は異なることがあります。この設定を使用すると、特定のタグを `tags` カラム内のマップに保存するのではなく、別のカラムに格納するように指定できます：

```sql
CREATE TABLE my_table ENGINE=TimeSeries SETTINGS = {'instance': 'instance', 'job': 'job'}
```

このステートメントは以下のカラムを追加します
```sql
    `instance` String,
    `job` String
```
`my_table` とその内部 [tags](#tags-table) ターゲットテーブルの定義にです。この場合、`tags` カラムには `instance` と `job` タグは含まれませんが、`all_tags` カラムには含まれます。`all_tags` カラムは一時的で、その唯一の目的は `id` カラムの DEFAULT 式に使用されることです。

カラムのタイプは明示的に指定することで調整できます：

``` sql
CREATE TABLE my_table (instance LowCardinality(String), job LowCardinality(Nullable(String)))
ENGINE=TimeSeries SETTINGS = {'instance': 'instance', 'job': 'job'}
```

## 内部ターゲットテーブルのテーブルエンジン {#inner-table-engines}

デフォルトでは、内部ターゲットテーブルは以下のテーブルエンジンを使用します：
- [データ](#data-table) テーブルは [MergeTree](../mergetree-family/mergetree) を使用します；
- [タグ](#tags-table) テーブルは [AggregatingMergeTree](../mergetree-family/aggregatingmergetree) を使用します。これは同じデータが頻繁にこのテーブルに挿入されるため、重複を削除する方法が必要であり、また `min_time` と `max_time` カラムの集約を行う必要があるためです；
- [メトリック](#metrics-table) テーブルは [ReplacingMergeTree](../mergetree-family/replacingmergetree) を使用します。同様に、同じデータが頻繁にこのテーブルに挿入されるため、重複を削除する方法が必要です。

他のテーブルエンジンも、次のように指定すれば内部ターゲットテーブルに使用できます：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
DATA ENGINE=ReplicatedMergeTree
TAGS ENGINE=ReplicatedAggregatingMergeTree
METRICS ENGINE=ReplicatedReplacingMergeTree
```

## 外部ターゲットテーブル {#external-target-tables}

`TimeSeries` テーブルが手動で作成されたテーブルを使用するようにすることも可能です：

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

ここに、`TimeSeries` テーブルを定義する際に指定できる設定のリストがあります：

| 名前 | タイプ | デフォルト | 説明 |
|---|---|---|---|
| `tags_to_columns` | Map | {} | タグをそれぞれのカラムに置くべきマップ。構文：`{'tag1': 'column1', 'tag2' : column2, ...}` |
| `use_all_tags_column_to_generate_id` | Bool | true | 時系列の識別子を計算するための式を生成する際に、このフラグが `all_tags` カラムの使用を有効にします。 |
| `store_min_time_and_max_time` | Bool | true | `true` に設定すると、テーブルは各時系列の `min_time` と `max_time` を保存します。 |
| `aggregate_min_time_and_max_time` | Bool | true | 内部ターゲットの `tags` テーブルを作成する際に、このフラグによって `min_time` カラムのタイプに `SimpleAggregateFunction(min, Nullable(DateTime64(3)))` を使用し、`max_time` カラムでも同様のことを行います。 |
| `filter_by_min_time_and_max_time` | Bool | true | `true` に設定すると、テーブルは時系列のフィルタリングに `min_time` および `max_time` カラムを使用します。 |

# 関数 {#functions}

以下は、`TimeSeries` テーブルを引数としてサポートする関数のリストです：
- [timeSeriesData](../../../sql-reference/table-functions/timeSeriesData.md)
- [timeSeriesTags](../../../sql-reference/table-functions/timeSeriesTags.md)
- [timeSeriesMetrics](../../../sql-reference/table-functions/timeSeriesMetrics.md)
