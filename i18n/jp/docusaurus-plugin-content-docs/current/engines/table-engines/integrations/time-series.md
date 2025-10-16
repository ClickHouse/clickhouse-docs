---
'description': '時系列を保存するテーブルエンジン、つまりタイムスタンプとタグ（またはラベル）に関連付けられた値のセット。'
'sidebar_label': 'TimeSeries'
'sidebar_position': 60
'slug': '/engines/table-engines/special/time_series'
'title': 'TimeSeries エンジン'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# TimeSeries エンジン

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

時間系列を保存するテーブルエンジン、つまりタイムスタンプおよびタグ（またはラベル）に関連付けられた値の集合を保存します：

```sql
metric_name1[tag1=value1, tag2=value2, ...] = {timestamp1: value1, timestamp2: value2, ...}
metric_name2[...] = ...
```

:::info
これは実験的な機能であり、将来のリリースでは後方互換性のない方法で変更される可能性があります。
[allow_experimental_time_series_table](/operations/settings/settings#allow_experimental_time_series_table) 設定で TimeSeries テーブルエンジンの使用を有効にします。
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

すべてをデフォルトで設定して始めると簡単です（カラムのリストを指定せずに `TimeSeries` テーブルを作成することが許可されています）：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

その後、このテーブルは次のプロトコルで使用できます（ポートはサーバー設定で割り当てる必要があります）：
- [prometheus remote-write](../../../interfaces/prometheus.md#remote-write)
- [prometheus remote-read](../../../interfaces/prometheus.md#remote-read)

## ターゲットテーブル {#target-tables}

`TimeSeries` テーブルには独自のデータはなく、すべてはそのターゲットテーブルに保存されます。
これは、[materialized view](../../../sql-reference/statements/create/view#materialized-view) が機能する方法に似ていますが、
materialized view は一つのターゲットテーブルを持つのに対し、`TimeSeries` テーブルには [data](#data-table)、[tags](#tags-table)、および [metrics](#metrics-table) と呼ばれる三つのターゲットテーブルがあります。

ターゲットテーブルは、`CREATE TABLE` クエリで明示的に指定することもできますし、`TimeSeries` テーブルエンジンが内部ターゲットテーブルを自動的に生成することもできます。

ターゲットテーブルは次の通りです：

### データテーブル {#data-table}

_data_ テーブルには、いくつかの識別子に関連付けられた時間系列が含まれています。

_data_ テーブルには次のカラムが必要です：

| 名前 | 必須？ | デフォルトタイプ | 可能なタイプ | 説明 |
|---|---|---|---|---|
| `id` | [x] | `UUID` | 任意 | メトリック名とタグの組み合わせを識別します |
| `timestamp` | [x] | `DateTime64(3)` | `DateTime64(X)` | タイムポイント |
| `value` | [x] | `Float64` | `Float32` または `Float64` | `timestamp` に関連付けられた値 |

### タグテーブル {#tags-table}

_tags_ テーブルには、メトリック名とタグの組み合わせごとに計算された識別子が含まれています。

_tags_ テーブルには次のカラムが必要です：

| 名前 | 必須？ | デフォルトタイプ | 可能なタイプ | 説明 |
|---|---|---|---|---|
| `id` | [x] | `UUID` | 任意（[data](#data-table) テーブルの `id` タイプと一致する必要があります） | `id` はメトリック名とタグの組み合わせを識別します。DEFAULT式はそのような識別子を計算する方法を指定します |
| `metric_name` | [x] | `LowCardinality(String)` | `String` または `LowCardinality(String)` | メトリックの名前 |
| `<tag_value_column>` | [ ] | `String` | `String` または `LowCardinality(String)` または `LowCardinality(Nullable(String))` | 特定のタグの値で、タグの名前と対応するカラムの名前は [tags_to_columns](#settings) 設定で指定されます |
| `tags` | [x] | `Map(LowCardinality(String), String)` | `Map(String, String)` または `Map(LowCardinality(String), String)` または `Map(LowCardinality(String), LowCardinality(String))` | メトリックの名前を含むタグ `__name__` を除外したタグのマップで、[tags_to_columns](#settings) 設定に列挙された名前のタグを除外します |
| `all_tags` | [ ] | `Map(String, String)` | `Map(String, String)` または `Map(LowCardinality(String), String)` または `Map(LowCardinality(String), LowCardinality(String))` | 一時的なカラムで、各行はメトリックの名前を含むタグ `__name__` を除外したすべてのタグのマップです。このカラムの唯一の目的は `id` を計算する際に使用されることです |
| `min_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` または `Nullable(DateTime64(X))` | その `id` を持つ時間系列の最小タイムスタンプ。このカラムは [store_min_time_and_max_time](#settings) が `true` の場合に作成されます |
| `max_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` または `Nullable(DateTime64(X))` | その `id` を持つ時間系列の最大タイムスタンプ。このカラムは [store_min_time_and_max_time](#settings) が `true` の場合に作成されます |

### メトリックテーブル {#metrics-table}

_metrics_ テーブルには、収集されたメトリックに関する情報、そのメトリックのタイプと説明が含まれています。

_metrics_ テーブルには次のカラムが必要です：

| 名前 | 必須？ | デフォルトタイプ | 可能なタイプ | 説明 |
|---|---|---|---|---|
| `metric_family_name` | [x] | `String` | `String` または `LowCardinality(String)` | メトリックファミリの名前 |
| `type` | [x] | `String` | `String` または `LowCardinality(String)` | メトリックファミリのタイプ、「counter」、「gauge」、「summary」、「stateset」、「histogram」、「gaugehistogram」のいずれか |
| `unit` | [x] | `String` | `String` または `LowCardinality(String)` | メトリックで使用される単位 |
| `help` | [x] | `String` | `String` または `LowCardinality(String)` | メトリックの説明 |

`TimeSeries` テーブルに挿入された任意の行は、実際にはこれら三つのターゲットテーブルに保存されます。
`TimeSeries` テーブルは、[data](#data-table)、[tags](#tags-table)、[metrics](#metrics-table) テーブルのすべてのカラムを含みます。

## 作成 {#creation}

`TimeSeries` テーブルエンジンを持つテーブルを作成する方法はいくつかあります。最も簡単な文は

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

実際には次のテーブルを作成します（`SHOW CREATE TABLE my_table` を実行することで確認できます）：

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

したがって、カラムは自動的に生成され、またこの文には三つの内部 UUID があります -
各内部ターゲットテーブルごとに一つずつ。
（内部 UUID は通常 [show_table_uuid_in_table_create_query_if_not_nil](../../../operations/settings/settings#show_table_uuid_in_table_create_query_if_not_nil) 設定が設定されていない限り表示されません。）

内部ターゲットテーブルは、`.inner_id.data.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` のように名前が付けられ、
`.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`、`.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` となり、
各ターゲットテーブルはメインの `TimeSeries` テーブルのカラムのサブセットを持ちます：

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

## カラムのタイプを調整する {#adjusting-column-types}

メインテーブルの定義中に明示的に指定することで、内部ターゲットテーブルのほとんどのカラムのタイプを調整できます。例えば、

```sql
CREATE TABLE my_table
(
    timestamp DateTime64(6)
) ENGINE=TimeSeries
```

これにより、内部 [data](#data-table) テーブルにタイムスタンプがミリ秒ではなくマイクロ秒で保存されます：

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

`id` カラムは識別子を含んでおり、各識別子はメトリック名とタグの組み合わせに対して計算されます。
`id` カラムの DEFAULT 式は、そのような識別子を計算するために使用されます。
`id` カラムのタイプとその式は明示的に指定することで調整できます：

```sql
CREATE TABLE my_table
(
  id UInt64 DEFAULT sipHash64(metric_name, all_tags)
)
ENGINE=TimeSeries
```

## `tags` および `all_tags` カラム {#tags-and-all-tags}

タグのマップを含む二つのカラム - `tags` と `all_tags` があります。この例では、それらは同じ意味を持ちますが、`tags_to_columns` 設定を使用する場合は異なることがあります。この設定により、特定のタグを `tags` カラム内のマップに保存するのではなく、別のカラムに保存することを指定できます：

```sql
CREATE TABLE my_table
ENGINE = TimeSeries 
SETTINGS tags_to_columns = {'instance': 'instance', 'job': 'job'}
```

この文は次のカラムを追加します：

```sql
`instance` String,
`job` String
```

`my_table` とその内部 [tags](#tags-table) ターゲットテーブルの両方の定義に対して。 この場合、`tags` カラムには `instance` と `job` タグが含まれませんが、`all_tags` カラムにはそれらが含まれます。`all_tags` カラムは一時的であり、その唯一の目的は `id` カラムの DEFAULT 式で使用されることです。

カラムのタイプは明示的に指定することで調整できます：

```sql
CREATE TABLE my_table (
  instance LowCardinality(String),
  job LowCardinality(Nullable(String))
)
ENGINE=TimeSeries
SETTINGS tags_to_columns = {'instance': 'instance', 'job': 'job'}
```

## 内部ターゲットテーブルのテーブルエンジン {#inner-table-engines}

内部ターゲットテーブルはデフォルトで次のテーブルエンジンを使用します：
- [data](#data-table) テーブルは [MergeTree](../mergetree-family/mergetree) を使用します；
- [tags](#tags-table) テーブルは [AggregatingMergeTree](../mergetree-family/aggregatingmergetree) を使用します。なぜなら同じデータがこのテーブルに複数回挿入されることが多いため、重複を取り除く方法が必要で、また `min_time` および `max_time` カラムの集約を行うことが必要だからです；
- [metrics](#metrics-table) テーブルは [ReplacingMergeTree](../mergetree-family/replacingmergetree) を使用します。これも同じデータがこのテーブルに複数回挿入されることが多いため、重複を取り除く方法が必要です。

他のテーブルエンジンも、指定されている場合は内部ターゲットテーブルに使用できます：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
DATA ENGINE=ReplicatedMergeTree
TAGS ENGINE=ReplicatedAggregatingMergeTree
METRICS ENGINE=ReplicatedReplacingMergeTree
```

## 外部ターゲットテーブル {#external-target-tables}

手動で作成されたテーブルを `TimeSeries` テーブルで使用することも可能です：

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

`TimeSeries` テーブルを定義する際に指定できる設定のリストは次のとおりです：

| 名前 | タイプ | デフォルト | 説明 |
|---|---|---|---|
| `tags_to_columns` | Map | {} | [tags](#tags-table) テーブルにどのタグを別のカラムに格納するかを指定するマップ。構文： `{'tag1': 'column1', 'tag2' : column2, ...}` |
| `use_all_tags_column_to_generate_id` | Bool | true | 時間系列の識別子を計算する式を生成する際に、このフラグが `all_tags` カラムをその計算に使用することを有効にします |
| `store_min_time_and_max_time` | Bool | true | true に設定された場合、このテーブルは各時間系列の `min_time` および `max_time` を保存します |
| `aggregate_min_time_and_max_time` | Bool | true | 内部ターゲット `tags` テーブルを作成する際、このフラグは `min_time` カラムの型として `SimpleAggregateFunction(min, Nullable(DateTime64(3)))` を使用することを有効にし、`max_time` カラムも同様にします |
| `filter_by_min_time_and_max_time` | Bool | true | true に設定された場合、このテーブルは時間系列のフィルタリングに `min_time` および `max_time` カラムを使用します |


# 関数 {#functions}

`TimeSeries` テーブルを引数としてサポートする関数のリストは次のとおりです：
- [timeSeriesData](../../../sql-reference/table-functions/timeSeriesData.md)
- [timeSeriesTags](../../../sql-reference/table-functions/timeSeriesTags.md)
- [timeSeriesMetrics](../../../sql-reference/table-functions/timeSeriesMetrics.md)
