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
これは実験的な機能であり、将来のリリースで後方互換性のない変更が加わる可能性があります。
[allow_experimental_time_series_table](/operations/settings/settings#allow_experimental_time_series_table) 設定を使用して、TimeSeries テーブルエンジンの使用を有効にします。
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

すべての設定をデフォルトのままにして始める方が簡単です（カラムのリストを指定せずに `TimeSeries` テーブルを作成することが許可されています）：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

その後、このテーブルは以下のプロトコルで使用できます（ポートはサーバー構成で割り当てる必要があります）：
- [prometheus remote-write](../../../interfaces/prometheus.md#remote-write)
- [prometheus remote-read](../../../interfaces/prometheus.md#remote-read)

## ターゲットテーブル {#target-tables}

`TimeSeries` テーブルは独自のデータを持っておらず、すべてはそのターゲットテーブルに保存されます。
これは、[マテリアライズドビュー](../../../sql-reference/statements/create/view#materialized-view) が機能する方法に似ていますが、
マテリアライズドビューは1つのターゲットテーブルを持つのに対して、`TimeSeries` テーブルは [data](#data-table)、[tags](#tags-table)、および [metrics](#metrics-table) の3つのターゲットテーブルを持ちます。

ターゲットテーブルは、`CREATE TABLE` クエリで明示的に指定することも、
`TimeSeries` テーブルエンジンが内部ターゲットテーブルを自動生成することもできます。

ターゲットテーブルは次の通りです：

### データテーブル {#data-table}

_data_ テーブルは、ある識別子に関連付けられた時系列を含みます。

_data_ テーブルには以下のカラムが必要です：

| 名前 | 必須？ | デフォルトタイプ | 可能なタイプ | 説明 |
|---|---|---|---|---|
| `id` | [x] | `UUID` | いずれか | メトリック名とタグの組み合わせを識別 |
| `timestamp` | [x] | `DateTime64(3)` | `DateTime64(X)` | 時間ポイント |
| `value` | [x] | `Float64` | `Float32` または `Float64` | `timestamp` に関連する値 |

### タグテーブル {#tags-table}

_tags_ テーブルには、メトリック名とタグの組み合わせに対して計算された識別子が含まれます。

_tags_ テーブルには以下のカラムが必要です：

| 名前 | 必須？ | デフォルトタイプ | 可能なタイプ | 説明 |
|---|---|---|---|---|
| `id` | [x] | `UUID` | いずれか（[data](#data-table) テーブルの `id` のタイプと一致する必要があります） | `id` はメトリック名とタグの組み合わせを識別します。DEFAULT 式はその識別子を計算する方法を指定します。 |
| `metric_name` | [x] | `LowCardinality(String)` | `String` または `LowCardinality(String)` | メトリックの名前 |
| `<tag_value_column>` | [ ] | `String` | `String` または `LowCardinality(String)` または `LowCardinality(Nullable(String))` | 特定のタグの値、タグの名前と対応するカラムの名前は [tags_to_columns](#settings) 設定で指定されます |
| `tags` | [x] | `Map(LowCardinality(String), String)` | `Map(String, String)` または `Map(LowCardinality(String), String)` または `Map(LowCardinality(String), LowCardinality(String))` | メトリックの名前を含むタグ `__name__` を除いたタグのマップと、[tags_to_columns](#settings) 設定で列挙された名前を持つタグを除外します |
| `all_tags` | [ ] | `Map(String, String)` | `Map(String, String)` または `Map(LowCardinality(String), String)` または `Map(LowCardinality(String), LowCardinality(String))` | 瞬時のカラム、各行はメトリックの名前を含むすべてのタグのマップです。このカラムの唯一の目的は `id` を計算する際に使用することです |
| `min_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` または `Nullable(DateTime64(X))` | その `id` の時系列の最小タイムスタンプ。カラムは [store_min_time_and_max_time](#settings) が `true` の場合に作成されます |
| `max_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` または `Nullable(DateTime64(X))` | その `id` の時系列の最大タイムスタンプ。カラムは [store_min_time_and_max_time](#settings) が `true` の場合に作成されます |

### メトリックテーブル {#metrics-table}

_metrics_ テーブルには、収集されたメトリックについての情報、そのメトリックのタイプおよび説明が含まれます。

_metrics_ テーブルには以下のカラムが必要です：

| 名前 | 必須？ | デフォルトタイプ | 可能なタイプ | 説明 |
|---|---|---|---|---|
| `metric_family_name` | [x] | `String` | `String` または `LowCardinality(String)` | メトリックファミリーの名前 |
| `type` | [x] | `String` | `String` または `LowCardinality(String)` | メトリックファミリーのタイプ -"counter", "gauge", "summary", "stateset", "histogram", "gaugehistogram" のいずれか |
| `unit` | [x] | `String` | `String` または `LowCardinality(String)` | メトリックに使用される単位 |
| `help` | [x] | `String` | `String` または `LowCardinality(String)` | メトリックの説明 |

`TimeSeries` テーブルに挿入された行は、実際にはこれら3つのターゲットテーブルに保存されます。
`TimeSeries` テーブルには、[data](#data-table)、[tags](#tags-table)、[metrics](#metrics-table) テーブルからすべてのカラムが含まれています。

## 作成 {#creation}

`TimeSeries` テーブルエンジンでテーブルを作成する方法はいくつかあります。
最もシンプルなステートメント

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

は実際には次のテーブルを作成します（`SHOW CREATE TABLE my_table` を実行することで確認できます）：

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

したがって、カラムは自動生成され、またこのステートメントにはそれぞれのターゲットテーブルに対する3つの内部UUIDがあります。
（内部UUIDは通常、設定 [show_table_uuid_in_table_create_query_if_not_nil](../../../operations/settings/settings#show_table_uuid_in_table_create_query_if_not_nil) が設定されている場合を除き表示されません。）

内部ターゲットテーブルの名前は `.inner_id.data.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`、`.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`、`.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` などであり、それぞれのターゲットテーブルには主な `TimeSeries` テーブルのカラムのサブセットが含まれています：

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

## カラムの型の調整 {#adjusting-column-types}

主テーブルの定義時に明示的に指定することで、内部ターゲットテーブルのほぼすべてのカラムの型を調整できます。例えば、

```sql
CREATE TABLE my_table
(
    timestamp DateTime64(6)
) ENGINE=TimeSeries
```

は内部 [data](#data-table) テーブルがミリ秒ではなくマイクロ秒でタイムスタンプを格納するようにします：

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

`id` カラムは識別子を含み、それぞれの識別子はメトリック名とタグの組み合わせに対して計算されます。
`id` カラムのDEFAULT式は、そのような識別子を計算するために使用される式です。
`id` カラムの型とその式の両方は、明示的に指定することで調整できます：

```sql
CREATE TABLE my_table
(
    id UInt64 DEFAULT sipHash64(metric_name, all_tags)
) ENGINE=TimeSeries
```

## `tags` および `all_tags` カラム {#tags-and-all-tags}

`tags` と `all_tags` の2つのカラムがタグのマップを含んでいます。これらの例では同じ意味を持ちますが、`tags_to_columns` 設定を使用すると異なる場合もあります。この設定は、特定のタグを `tags` カラム内のマップに格納するのではなく、別々のカラムに格納することを指定することを可能にします：

```sql
CREATE TABLE my_table ENGINE=TimeSeries SETTINGS = {'instance': 'instance', 'job': 'job'}
```

このステートメントは次のカラムを追加します：
```sql
    `instance` String,
    `job` String
```
`my_table` とその内部 [tags](#tags-table) ターゲットテーブルの定義において。 この場合、`tags` カラムには `instance` と `job` タグは含まれず、ですが `all_tags` カラムにはそれらが含まれます。`all_tags` カラムは一時的で、その唯一の目的は `id` カラムのDEFAULT式内で使用されることです。

カラムの型は、明示的に指定することで調整できます：

```sql
CREATE TABLE my_table (instance LowCardinality(String), job LowCardinality(Nullable(String)))
ENGINE=TimeSeries SETTINGS = {'instance': 'instance', 'job': 'job'}
```

## 内部ターゲットテーブルのテーブルエンジン {#inner-table-engines}

デフォルトでは内部ターゲットテーブルは次のテーブルエンジンを使用します：
- [data](#data-table) テーブルは [MergeTree](../mergetree-family/mergetree) を使用します；
- [tags](#tags-table) テーブルは [AggregatingMergeTree](../mergetree-family/aggregatingmergetree) を使用します。なぜなら同じデータがこのテーブルに複数回挿入されることが多いため、重複を削除する方法が必要であり、また `min_time` と `max_time` カラムの集計を行う必要があるためです；
- [metrics](#metrics-table) テーブルは [ReplacingMergeTree](../mergetree-family/replacingmergetree) を使用します。こちらも同様に、同じデータがこのテーブルに複数回挿入されることが多いため、重複を削除する方法が必要です。

内部ターゲットテーブルに対して他のテーブルエンジンも使用可能です：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
DATA ENGINE=ReplicatedMergeTree
TAGS ENGINE=ReplicatedAggregatingMergeTree
METRICS ENGINE=ReplicatedReplacingMergeTree
```

## 外部ターゲットテーブル {#external-target-tables}

手動で作成したテーブルを使用するように `TimeSeries` テーブルを設定することもできます：

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

ここでは、`TimeSeries` テーブルを定義する際に指定できる設定のリストを示します：

| 名前 | 型 | デフォルト | 説明 |
|---|---|---|---|
| `tags_to_columns` | Map | {} | 特定のタグを [tags](#tags-table) テーブルの別カラムに配置するためのマップ。構文: `{'tag1': 'column1', 'tag2' : column2, ...}` |
| `use_all_tags_column_to_generate_id` | Bool | true | タイムシリーズの識別子を生成するための式を生成する際、このフラグは `all_tags` カラムをその計算に使用することを可能にします。 |
| `store_min_time_and_max_time` | Bool | true | `true` に設定されている場合、テーブルは各タイムシリーズの `min_time` と `max_time` を保存します。 |
| `aggregate_min_time_and_max_time` | Bool | true | 内部ターゲット `tags` テーブルを作成する際、このフラグは `Nullable(DateTime64(3))` の代わりに `SimpleAggregateFunction(min, Nullable(DateTime64(3)))` を `min_time` カラムの型として使用することを可能にし、同様に `max_time` カラムにも適用されます。 |
| `filter_by_min_time_and_max_time` | Bool | true | `true` に設定されている場合、テーブルはタイムシリーズをフィルタリングするために `min_time` と `max_time` カラムを使用します。 |


# 関数 {#functions}

ここでは、`TimeSeries` テーブルを引数としてサポートする関数のリストを示します：
- [timeSeriesData](../../../sql-reference/table-functions/timeSeriesData.md)
- [timeSeriesTags](../../../sql-reference/table-functions/timeSeriesTags.md)
- [timeSeriesMetrics](../../../sql-reference/table-functions/timeSeriesMetrics.md)
