---
description: 'タイムスタンプとタグ（またはラベル）に関連付けられた値の集合である時系列データを格納するテーブルエンジン。'
sidebar_label: 'TimeSeries'
sidebar_position: 60
slug: /engines/table-engines/special/time_series
title: 'TimeSeries テーブルエンジン'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# TimeSeries テーブルエンジン

<ExperimentalBadge />

<CloudNotSupportedBadge />

時系列データ、すなわちタイムスタンプとタグ（またはラベル）に関連付けられた値の集合を格納するテーブルエンジンです。

```sql
metric_name1[tag1=value1, tag2=value2, ...] = {timestamp1: value1, timestamp2: value2, ...}
metric_name2[...] = ...
```

:::info
これは実験的な機能であり、将来のリリースで後方互換性のない形で変更される可能性があります。
TimeSeries テーブルエンジンを使用するには、
[allow&#95;experimental&#95;time&#95;series&#95;table](/operations/settings/settings#allow_experimental_time_series_table) 設定を有効にしてください。
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


## 使用方法 {#usage}

すべてをデフォルト設定で開始するのが最も簡単です（`TimeSeries`テーブルは列のリストを指定せずに作成できます）：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

このテーブルは以下のプロトコルで使用できます（サーバー設定でポートを割り当てる必要があります）：

- [prometheus remote-write](../../../interfaces/prometheus.md#remote-write)
- [prometheus remote-read](../../../interfaces/prometheus.md#remote-read)


## ターゲットテーブル {#target-tables}

`TimeSeries`テーブルは独自のデータを持たず、すべてターゲットテーブルに格納されます。
これは[マテリアライズドビュー](../../../sql-reference/statements/create/view#materialized-view)の動作と似ていますが、マテリアライズドビューが1つのターゲットテーブルを持つのに対し、`TimeSeries`テーブルは[data](#data-table)、[tags](#tags-table)、[metrics](#metrics-table)という3つのターゲットテーブルを持つ点が異なります。

ターゲットテーブルは`CREATE TABLE`クエリで明示的に指定することも、`TimeSeries`テーブルエンジンが内部ターゲットテーブルを自動生成することもできます。

ターゲットテーブルは以下の通りです:

### データテーブル {#data-table}

_data_テーブルには、識別子に関連付けられた時系列データが格納されます。

_data_テーブルには以下のカラムが必要です:

| 名前        | 必須? | デフォルト型    | 使用可能な型         | 説明                                         |
| ----------- | ---------- | --------------- | ---------------------- | --------------------------------------------------- |
| `id`        | [x]        | `UUID`          | 任意                    | メトリック名とタグの組み合わせを識別します |
| `timestamp` | [x]        | `DateTime64(3)` | `DateTime64(X)`        | 時点                                        |
| `value`     | [x]        | `Float64`       | `Float32`または`Float64` | `timestamp`に関連付けられた値             |

### タグテーブル {#tags-table}

_tags_テーブルには、メトリック名とタグの各組み合わせに対して計算された識別子が格納されます。

_tags_テーブルには以下のカラムが必要です:

| 名前                 | 必須? | デフォルト型                          | 使用可能な型                                                                                                          | 説明                                                                                                                                                                                 |
| -------------------- | ---------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                 | [x]        | `UUID`                                | 任意([data](#data-table)テーブルの`id`の型と一致する必要があります)                                                      | `id`はメトリック名とタグの組み合わせを識別します。DEFAULT式はこの識別子の計算方法を指定します                                                            |
| `metric_name`        | [x]        | `LowCardinality(String)`              | `String`または`LowCardinality(String)`                                                                                    | メトリックの名前                                                                                                                                                                        |
| `<tag_value_column>` | [ ]        | `String`                              | `String`または`LowCardinality(String)`または`LowCardinality(Nullable(String))`                                              | 特定のタグの値。タグ名と対応するカラム名は[tags_to_columns](#settings)設定で指定されます                                                |
| `tags`               | [x]        | `Map(LowCardinality(String), String)` | `Map(String, String)`または`Map(LowCardinality(String), String)`または`Map(LowCardinality(String), LowCardinality(String))` | メトリック名を含む`__name__`タグと、[tags_to_columns](#settings)設定で列挙されたタグを除くタグのマップ                               |
| `all_tags`           | [ ]        | `Map(String, String)`                 | `Map(String, String)`または`Map(LowCardinality(String), String)`または`Map(LowCardinality(String), LowCardinality(String))` | エフェメラルカラム。各行はメトリック名を含む`__name__`タグのみを除くすべてのタグのマップです。このカラムの唯一の目的は`id`の計算時に使用されることです |
| `min_time`           | [ ]        | `Nullable(DateTime64(3))`             | `DateTime64(X)`または`Nullable(DateTime64(X))`                                                                            | その`id`を持つ時系列の最小タイムスタンプ。このカラムは[store_min_time_and_max_time](#settings)が`true`の場合に作成されます                                                                |
| `max_time`           | [ ]        | `Nullable(DateTime64(3))`             | `DateTime64(X)`または`Nullable(DateTime64(X))`                                                                            | その`id`を持つ時系列の最大タイムスタンプ。このカラムは[store_min_time_and_max_time](#settings)が`true`の場合に作成されます                                                                |

### メトリックテーブル {#metrics-table}

_metrics_テーブルには、収集されたメトリックに関する情報、それらのメトリックの型、および説明が格納されます。

_metrics_テーブルには以下のカラムが必要です:


| 名前 | 必須? | デフォルトの型 | 指定可能な型 | 説明 |
|---|---|---|---|---|
| `metric_family_name` | [x] | `String` | `String` または `LowCardinality(String)` | メトリックファミリー名 |
| `type` | [x] | `String` | `String` または `LowCardinality(String)` | メトリックファミリーの種別。"counter"、"gauge"、"summary"、"stateset"、"histogram"、"gaugehistogram" のいずれか |
| `unit` | [x] | `String` | `String` または `LowCardinality(String)` | メトリックで使用される単位 |
| `help` | [x] | `String` | `String` または `LowCardinality(String)` | メトリックの説明 |

`TimeSeries` テーブルに挿入された行は、実際にはこれら 3 つの対象テーブルに格納されます。
`TimeSeries` テーブルには、[data](#data-table)、[tags](#tags-table)、[metrics](#metrics-table) 各テーブルに存在するこれらすべてのカラムが含まれます。



## 作成 {#creation}

`TimeSeries`テーブルエンジンを使用してテーブルを作成する方法は複数あります。
最もシンプルな文は

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

実際には次のテーブルを作成します（`SHOW CREATE TABLE my_table`を実行することで確認できます）：

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

このように、カラムは自動的に生成され、この文には3つの内部UUIDが含まれています。
これは作成された各内部ターゲットテーブルに1つずつ対応しています。
（内部UUIDは、設定
[show_table_uuid_in_table_create_query_if_not_nil](../../../operations/settings/settings#show_table_uuid_in_table_create_query_if_not_nil)
が設定されるまで通常は表示されません。）

内部ターゲットテーブルは`.inner_id.data.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`、
`.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`、`.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
のような名前を持ち、各ターゲットテーブルはメインの`TimeSeries`テーブルのカラムのサブセットとなるカラムを持ちます：

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

メインテーブルの定義時に明示的に指定することで、内部ターゲットテーブルのほぼすべてのカラムの型を調整できます。例えば、

```sql
CREATE TABLE my_table
(
    timestamp DateTime64(6)
) ENGINE=TimeSeries
```

とすると、内部の[data](#data-table)テーブルはタイムスタンプをミリ秒ではなくマイクロ秒で格納するようになります：

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

`id` カラムには識別子が含まれており、各識別子はメトリック名とタグの組み合わせに基づいて計算されます。
`id` カラムの DEFAULT 式は、これらの識別子を計算するために使用される式です。
`id` カラムの型とその式は、いずれも明示的に指定することで調整できます:

```sql
CREATE TABLE my_table
(
  id UInt64 DEFAULT sipHash64(metric_name, all_tags)
)
ENGINE=TimeSeries
```


## `tags` と `all_tags` カラム {#tags-and-all-tags}

タグのマップを含む2つのカラム `tags` と `all_tags` があります。この例では両者は同じ意味を持ちますが、`tags_to_columns` 設定を使用した場合は異なる内容になることがあります。 この設定により、特定のタグを `tags` カラム内のマップに格納する代わりに、別のカラムに格納するように指定できます:

```sql
CREATE TABLE my_table
ENGINE = TimeSeries
SETTINGS tags_to_columns = {'instance': 'instance', 'job': 'job'}
```

このステートメントは以下のカラムを追加します:

```sql
`instance` String,
`job` String
```

これらは `my_table` とその内部の [tags](#tags-table) ターゲットテーブルの両方の定義に追加されます。 この場合、`tags` カラムには `instance` と `job` タグは含まれませんが、`all_tags` カラムにはこれらが含まれます。 `all_tags` カラムはエフェメラルであり、その唯一の目的は `id` カラムの DEFAULT 式で使用されることです。

カラムの型は明示的に指定することで調整できます:

```sql
CREATE TABLE my_table (
  instance LowCardinality(String),
  job LowCardinality(Nullable(String))
)
ENGINE=TimeSeries
SETTINGS tags_to_columns = {'instance': 'instance', 'job': 'job'}
```


## 内部ターゲットテーブルのテーブルエンジン {#inner-table-engines}

デフォルトでは、内部ターゲットテーブルは以下のテーブルエンジンを使用します:

- [data](#data-table)テーブルは[MergeTree](../mergetree-family/mergetree)を使用します;
- [tags](#tags-table)テーブルは[AggregatingMergeTree](../mergetree-family/aggregatingmergetree)を使用します。これは、同じデータがこのテーブルに複数回挿入されることが多く重複を削除する必要があること、また`min_time`と`max_time`カラムの集計を行う必要があるためです;
- [metrics](#metrics-table)テーブルは[ReplacingMergeTree](../mergetree-family/replacingmergetree)を使用します。これは、同じデータがこのテーブルに複数回挿入されることが多く重複を削除する必要があるためです。

内部ターゲットテーブルには、以下のように明示的に指定することで他のテーブルエンジンも使用できます:

```sql
CREATE TABLE my_table ENGINE=TimeSeries
DATA ENGINE=ReplicatedMergeTree
TAGS ENGINE=ReplicatedAggregatingMergeTree
METRICS ENGINE=ReplicatedReplacingMergeTree
```


## 外部ターゲットテーブル {#external-target-tables}

`TimeSeries`テーブルに手動で作成したテーブルを使用させることができます:

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

`TimeSeries`テーブルを定義する際に指定可能な設定の一覧です:

| 名前                                 | 型 | デフォルト | 説明                                                                                                                                                                                                                                        |
| ------------------------------------ | ---- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tags_to_columns`                    | Map  | {}      | [tags](#tags-table)テーブル内で、どのタグを個別のカラムに配置するかを指定するマップ。構文: `{'tag1': 'column1', 'tag2' : column2, ...}`                                                                                                 |
| `use_all_tags_column_to_generate_id` | Bool | true    | 時系列の識別子を計算する式を生成する際に、このフラグにより計算で`all_tags`カラムを使用できるようになります                                                                                                       |
| `store_min_time_and_max_time`        | Bool | true    | trueに設定すると、各時系列の`min_time`と`max_time`がテーブルに保存されます                                                                                                                                                            |
| `aggregate_min_time_and_max_time`    | Bool | true    | 内部ターゲット`tags`テーブルを作成する際に、このフラグにより`min_time`カラムの型として単なる`Nullable(DateTime64(3))`ではなく`SimpleAggregateFunction(min, Nullable(DateTime64(3)))`が使用され、`max_time`カラムについても同様になります |
| `filter_by_min_time_and_max_time`    | Bool | true    | trueに設定すると、時系列のフィルタリングに`min_time`と`max_time`カラムがテーブルで使用されます                                                                                                                                             |


# 関数 {#functions}

以下は、`TimeSeries`テーブルを引数としてサポートする関数の一覧です:

- [timeSeriesData](../../../sql-reference/table-functions/timeSeriesData.md)
- [timeSeriesTags](../../../sql-reference/table-functions/timeSeriesTags.md)
- [timeSeriesMetrics](../../../sql-reference/table-functions/timeSeriesMetrics.md)
