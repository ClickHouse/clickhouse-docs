---
description: 'タイムスタンプとタグ（またはラベル）に関連付けられた値の集合としての時系列データを格納するテーブルエンジン。'
sidebar_label: 'TimeSeries'
sidebar_position: 60
slug: /engines/table-engines/special/time_series
title: 'TimeSeries テーブルエンジン'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# TimeSeries テーブルエンジン \{#timeseries-table-engine\}

<ExperimentalBadge />

<CloudNotSupportedBadge />

時系列データ、すなわちタイムスタンプおよびタグ（またはラベル）に関連付けられた値の集合を格納するテーブルエンジンです。

```sql
metric_name1[tag1=value1, tag2=value2, ...] = {timestamp1: value1, timestamp2: value2, ...}
metric_name2[...] = ...
```

:::info
これは実験的な機能であり、今後のリリースで後方互換性のない形で変更される可能性があります。
TimeSeries テーブルエンジンを使用するには、[allow&#95;experimental&#95;time&#95;series&#95;table](/operations/settings/settings#allow_experimental_time_series_table) 設定を有効にします。
`set allow_experimental_time_series_table = 1` コマンドを実行します。
:::


## 構文 \{#syntax\}

```sql
CREATE TABLE name [(columns)] ENGINE=TimeSeries
[SETTINGS var1=value1, ...]
[DATA db.data_table_name | DATA ENGINE data_table_engine(arguments)]
[TAGS db.tags_table_name | TAGS ENGINE tags_table_engine(arguments)]
[METRICS db.metrics_table_name | METRICS ENGINE metrics_table_engine(arguments)]
```


## 使用方法 \{#usage\}

すべてをデフォルト設定のままにして開始するのが簡単です（列の一覧を指定しなくても `TimeSeries` テーブルを作成できます）:

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

このテーブルは、サーバー設定でポートを割り当てれば、次のプロトコルで利用できます：

* [prometheus remote-write](/interfaces/prometheus#remote-write)
* [prometheus remote-read](/interfaces/prometheus#remote-read)


## ターゲットテーブル \{#target-tables\}

`TimeSeries` テーブル自体はデータを持たず、すべてのデータはターゲットテーブルに保存されます。
これは [マテリアライズドビュー](../../../sql-reference/statements/create/view#materialized-view) の動作に似ていますが、
マテリアライズドビューがターゲットテーブルを 1 つだけ持つのに対して、
`TimeSeries` テーブルは [data](#data-table)、[tags](#tags-table)、[metrics](#metrics-table) という 3 つのターゲットテーブルを持つ点が異なります。

ターゲットテーブルは `CREATE TABLE` クエリ内で明示的に指定することも、
`TimeSeries` テーブルエンジンに内部ターゲットテーブルを自動的に生成させることもできます。

ターゲットテーブルは次のとおりです。

### Data テーブル \{#data-table\}

_data_ テーブルには、何らかの識別子に関連付けられた時系列データが格納されます。

_data_ テーブルは次のカラムを持たなければなりません:

| Name | Mandatory? | Default type | Possible types | Description |
|---|---|---|---|---|
| `id` | [x] | `UUID` | any | メトリック名とタグの組み合わせを識別します |
| `timestamp` | [x] | `DateTime64(3)` | `DateTime64(X)` | 時刻 |
| `value` | [x] | `Float64` | `Float32` or `Float64` | `timestamp` に関連付けられた値 |

### Tags テーブル \{#tags-table\}

_tags_ テーブルには、メトリック名とタグの各組み合わせに対して計算された識別子が格納されます。

_tags_ テーブルは次のカラムを持たなければなりません:

| Name | Mandatory? | Default type | Possible types | Description |
|---|---|---|---|---|
| `id` | [x] | `UUID` | any (must match the type of `id` in the [data](#data-table) table) | `id` はメトリック名とタグの組み合わせを識別します。DEFAULT 式でそのような識別子の計算方法を指定します |
| `metric_name` | [x] | `LowCardinality(String)` | `String` or `LowCardinality(String)` | メトリックの名前 |
| `<tag_value_column>` | [ ] | `String` | `String` or `LowCardinality(String)` or `LowCardinality(Nullable(String))` | 特定のタグの値。タグ名と対応するカラム名は [tags_to_columns](#settings) 設定で指定します |
| `tags` | [x] | `Map(LowCardinality(String), String)` | `Map(String, String)` or `Map(LowCardinality(String), String)` or `Map(LowCardinality(String), LowCardinality(String))` | メトリック名を保持するタグ `__name__` および [tags_to_columns](#settings) 設定で列挙された名前を持つタグを除いたタグのマップ |
| `all_tags` | [ ] | `Map(String, String)` | `Map(String, String)` or `Map(LowCardinality(String), String)` or `Map(LowCardinality(String), LowCardinality(String))` | 一時的なカラムであり、各行はメトリック名を保持するタグ `__name__` のみを除外したすべてのタグのマップです。このカラムの唯一の目的は、`id` を計算する際に使用されることです |
| `min_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` or `Nullable(DateTime64(X))` | 当該 `id` を持つ時系列の最小タイムスタンプ。[store_min_time_and_max_time](#settings) が `true` の場合に作成されます |
| `max_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` or `Nullable(DateTime64(X))` | 当該 `id` を持つ時系列の最大タイムスタンプ。[store_min_time_and_max_time](#settings) が `true` の場合に作成されます |

### Metrics table \{#metrics-table\}

_metrics_ テーブルには、収集対象となるメトリクスに関する情報、そのメトリクスのタイプ、およびその説明が含まれます。

_metrics_ テーブルには、次のカラムが必要です。

| Name | Mandatory? | Default type | Possible types | Description |
|---|---|---|---|---|
| `metric_family_name` | [x] | `String` | `String` or `LowCardinality(String)` | メトリックファミリー名 |
| `type` | [x] | `String` | `String` or `LowCardinality(String)` | メトリックファミリーのタイプ。"counter"、"gauge"、"summary"、"stateset"、"histogram"、"gaugehistogram" のいずれか |
| `unit` | [x] | `String` | `String` or `LowCardinality(String)` | メトリックで使用される単位 |
| `help` | [x] | `String` | `String` or `LowCardinality(String)` | メトリックの説明 |

`TimeSeries` テーブルに挿入された行はすべて、実際にはこれら 3 つのターゲットテーブルに保存されます。
`TimeSeries` テーブルには、[data](#data-table)、[tags](#tags-table)、[metrics](#metrics-table) 各テーブルのすべてのカラムが含まれます。

## 作成 \{#creation\}

`TimeSeries` テーブルエンジンでテーブルを作成する方法はいくつかあります。
最も簡単なステートメントは

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

実際には、次のテーブルが作成されます（`SHOW CREATE TABLE my_table` を実行すると確認できます）:

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

したがって、列は自動的に生成され、このステートメントには、作成された各内部ターゲットテーブルに対応して 1 つずつ、合計 3 つの内部 UUID が含まれています。
（内部 UUID は、設定
[show&#95;table&#95;uuid&#95;in&#95;table&#95;create&#95;query&#95;if&#95;not&#95;nil](../../../operations/settings/settings#show_table_uuid_in_table_create_query_if_not_nil)
を有効にしない限り、通常は表示されません。）

内部ターゲットテーブルは
`.inner_id.data.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
`.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, `.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
のような名前になり、各ターゲットテーブルはメインの `TimeSeries` テーブルの列のサブセットを持ちます。

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


## 列型の調整 \{#adjusting-column-types\}

メインテーブルを定義する際に型を明示的に指定することで、内部ターゲットテーブルのほとんどすべての列型を調整できます。例えば、

```sql
CREATE TABLE my_table
(
    timestamp DateTime64(6)
) ENGINE=TimeSeries
```

これにより、内部の [data](#data-table) テーブルは、タイムスタンプをミリ秒ではなくマイクロ秒単位で保存するようになります。

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


## `id` 列 \{#id-column\}

`id` 列には識別子が格納されており、各識別子はメトリクス名とタグの組み合わせに対して計算されます。
`id` 列の DEFAULT 式は、これらの識別子を計算するために使用される式です。
`id` 列の型とその式の両方は、明示的に指定することで変更できます。

```sql
CREATE TABLE my_table
(
  id UInt64 DEFAULT sipHash64(metric_name, all_tags)
)
ENGINE=TimeSeries
```


## `tags` 列と `all_tags` 列 \{#tags-and-all-tags\}

タグのマップを含む列が 2 つあります。`tags` と `all_tags` です。この例では同じものですが、`tags_to_columns` 設定を使用した場合には異なる場合があります。この設定を使用すると、特定のタグを `tags` 列内のマップとしてではなく、別の列に保存するよう指定できます。

```sql
CREATE TABLE my_table
ENGINE = TimeSeries 
SETTINGS tags_to_columns = {'instance': 'instance', 'job': 'job'}
```

このステートメントにより、次の列が追加されます:

```sql
`instance` String,
`job` String
```

`my_table` と、その内部の [tags](#tags-table) ターゲットテーブルの両方の定義に対して指定します。この場合、`tags` 列には `instance` と `job` のタグは含まれませんが、`all_tags` 列には含まれます。`all_tags` 列は一時的な列であり、その唯一の用途は `id` 列の DEFAULT 式で使用されることです。

列の型は、明示的に指定することで調整できます。

```sql
CREATE TABLE my_table (
  instance LowCardinality(String),
  job LowCardinality(Nullable(String))
)
ENGINE=TimeSeries
SETTINGS tags_to_columns = {'instance': 'instance', 'job': 'job'}
```


## 内部ターゲットテーブルのテーブルエンジン \{#inner-table-engines\}

デフォルトでは、内部ターゲットテーブルは次のテーブルエンジンを使用します。

* [data](#data-table) テーブルは [MergeTree](../mergetree-family/mergetree) を使用します。
* [tags](#tags-table) テーブルは [AggregatingMergeTree](../mergetree-family/aggregatingmergetree) を使用します。これは、同じデータがこのテーブルに複数回挿入されることが多く、重複を削除する必要があることに加え、`min_time` と `max_time` 列に対して集約を実行する必要があるためです。
* [metrics](#metrics-table) テーブルは [ReplacingMergeTree](../mergetree-family/replacingmergetree) を使用します。これは、同じデータがこのテーブルに複数回挿入されることが多く、重複を削除する必要があるためです。

明示的に指定されている場合には、内部ターゲットテーブルに他のテーブルエンジンを使用することもできます。

```sql
CREATE TABLE my_table ENGINE=TimeSeries
DATA ENGINE=ReplicatedMergeTree
TAGS ENGINE=ReplicatedAggregatingMergeTree
METRICS ENGINE=ReplicatedReplacingMergeTree
```


## 外部ターゲットテーブル \{#external-target-tables\}

`TimeSeries` テーブルが手動で作成したテーブルを使用するように設定できます。

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


## 設定 \{#settings\}

`TimeSeries` テーブルを定義する際に指定できる設定の一覧は次のとおりです。

| Name | Type | Default | Description |
|---|---|---|---|
| `tags_to_columns` | Map | {} | [tags](#tags-table) テーブル内で、どのタグを個別のカラムとして出力するかを指定する Map。構文: `{'tag1': 'column1', 'tag2' : column2, ...}` |
| `use_all_tags_column_to_generate_id` | Bool | true | 時系列の ID を計算する式を生成する際に、このフラグを有効にすると、その計算で `all_tags` カラムを使用します |
| `store_min_time_and_max_time` | Bool | true | true に設定すると、テーブルは各時系列について `min_time` と `max_time` を保存します |
| `aggregate_min_time_and_max_time` | Bool | true | 内部ターゲットの `tags` テーブルを作成する際に、このフラグを有効にすると、`min_time` カラムの型として単なる `Nullable(DateTime64(3))` ではなく `SimpleAggregateFunction(min, Nullable(DateTime64(3)))` を使用し、`max_time` カラムについても同様にします |
| `filter_by_min_time_and_max_time` | Bool | true | true に設定すると、テーブルは時系列をフィルタリングする際に `min_time` および `max_time` カラムを使用します |

# 関数 \{#functions\}

`TimeSeries` テーブルを引数として受け取る関数は次のとおりです:

- [timeSeriesData](../../../sql-reference/table-functions/timeSeriesData.md)
- [timeSeriesTags](../../../sql-reference/table-functions/timeSeriesTags.md)
- [timeSeriesMetrics](../../../sql-reference/table-functions/timeSeriesMetrics.md)