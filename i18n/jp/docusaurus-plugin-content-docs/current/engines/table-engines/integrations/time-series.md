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

時系列データ、すなわちタイムスタンプおよびタグ (またはラベル) に関連付けられた値の集合を格納するテーブルエンジンです。

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
[SAMPLES db.samples_table_name | [SAMPLES INNER COLUMNS (...)] [SAMPLES INNER ENGINE engine(arguments)]]
[TAGS db.tags_table_name | [TAGS INNER COLUMNS (...)] [TAGS INNER ENGINE engine(arguments)]]
[METRICS db.metrics_table_name | [METRICS INNER COLUMNS (...)] [METRICS INNER ENGINE engine(arguments)]]
```

:::note
キーワード `SAMPLES` には、後方互換性を保つために `DATA` という別名があります。
:::

## 使用方法 \{#usage\}

すべてをデフォルト設定のままにして開始するのが簡単です (列の一覧を指定しなくても `TimeSeries` テーブルを作成できます) :

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

このテーブルは、サーバー設定でポートを割り当てれば、次のプロトコルで利用できます：

* [prometheus remote-write](/interfaces/prometheus#remote-write)
* [prometheus remote-read](/interfaces/prometheus#remote-read)

### 外部カラム \{#outer-columns\}

TimeSeries テーブルのカラムは自動的に生成されます。これらは外部カラムであり、データ自体は保持せず、`SELECT/INSERT` 用のインターフェイスを提供するだけです。実際のデータは[ターゲットテーブル](#target-tables)に格納されます。以下は外部カラムの一覧です。

| 名前              | 型                                                 | 説明                                                                                                                                               |
| --------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `metric_name`   | `String`                                          | メトリック名                                                                                                                                           |
| `tags`          | `Map(String, String)`                             | 時系列のタグ (ラベル) の Map                                                                                                                               |
| `time_series`   | `Array(Tuple(DateTime64(3), Float64))` by default | 時系列の `(timestamp, value)` ペアの Array。タプルの timestamp 要素型と scalar 要素型は、サンプルの `INNER COLUMNS` 宣言から導出できます ([外部カラムの指定](#specifying-outer-columns)を参照)  |
| `metric_family` | `String`                                          | メトリックファミリー名 (メトリックメタデータ用)                                                                                                                        |
| `type`          | `String`                                          | メトリックの型 (例: &quot;counter&quot;、&quot;gauge&quot;)                                                                                               |
| `unit`          | `String`                                          | メトリックの単位                                                                                                                                         |
| `help`          | `String`                                          | メトリックの説明                                                                                                                                         |

例:

```sql
INSERT INTO my_table (metric_name, tags, time_series) VALUES
    ('cpu_usage', {'job': 'node_exporter', 'instance': 'host1:9100'},
     [(toDateTime64('2024-01-01 00:00:00', 3), 0.5), (toDateTime64('2024-01-01 00:01:00', 3), 0.7)])
```

`metric_name` は挿入時に空でも構いません。つまり、メトリック名は `tags` の `__name__` で指定します。例:

```sql
INSERT INTO my_table (tags, time_series) VALUES
    ({'__name__': 'cpu_usage', 'job': 'test'},
     [(toDateTime64('2024-01-01 00:00:00', 3), 0.5)])
```

メトリクスのメタデータを挿入するには、`metric_family`、`type`、`unit`、`help` の各カラムに値を挿入します:

```sql
INSERT INTO my_table (metric_name, tags, time_series, metric_family, type, unit, help) VALUES
    ('http_requests_total', {'method': 'GET'}, [(now64(), 100.0)],
     'http_requests_total', 'counter', 'requests', 'Total HTTP requests')
```

### 外部カラムの指定 \{#specifying-outer-columns\}

外側の `time_series` カラムは、デフォルトの `Array(Tuple(DateTime64(3), Float64))` 型を上書きするため、`CREATE TABLE` ステートメントで明示的に指定できます。ClickHouse はこのタプルからタイムスタンプ型とスカラー型を抽出し、それらを内部の `samples` テーブルに反映します。

```sql
CREATE TABLE my_table (time_series Array(Tuple(UInt32, Float32))) ENGINE=TimeSeries
```

これは、samplesの`INNER COLUMNS`句で timestamp カラムと value カラムの型を直接宣言するのと同等です：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
SAMPLES INNER COLUMNS (timestamp UInt32, value Float32)
```

両方の形式を同じ`CREATE TABLE`ステートメント内で使用する場合、宣言する型は一致している必要があります。

## ターゲットテーブル \{#target-tables\}

`TimeSeries` テーブル自体はデータを持たず、すべてのデータはターゲットテーブルに保存されます。
これは [マテリアライズドビュー](../../../sql-reference/statements/create/view#materialized-view) の動作に似ていますが、
マテリアライズドビューがターゲットテーブルを 1 つだけ持つのに対して、
`TimeSeries` テーブルは [samples](#samples-table)、[tags](#tags-table)、[metrics](#metrics-table) という 3 つのターゲットテーブルを持つ点が異なります。

ターゲットテーブルは `CREATE TABLE` クエリ内で明示的に指定することも、
`TimeSeries` テーブルエンジンに内部ターゲットテーブルを自動的に生成させることもできます。

`TimeSeries` テーブルに挿入された行は変換され、ブロックに分割されたうえで、これら 3 つのターゲットテーブルに挿入されます。

ターゲットテーブルは次のとおりです。

### Samples テーブル \{#samples-table\}

*samples* テーブルには、何らかの識別子に関連付けられた時系列データが格納されます。

*samples* テーブルは次のカラムを持たなければなりません:

| Name        | Mandatory? | Default type    | Possible types         | Description           |
| ----------- | ---------- | --------------- | ---------------------- | --------------------- |
| `id`        | [x]        | `UUID`          | any                    | メトリック名とタグの組み合わせを識別します |
| `timestamp` | [x]        | `DateTime64(3)` | `DateTime64(X)`        | 時刻                    |
| `value`     | [x]        | `Float64`       | `Float32` or `Float64` | `timestamp` に関連付けられた値 |

### Tags テーブル \{#tags-table\}

*tags* テーブルには、メトリック名とタグの各組み合わせに対して計算された識別子が格納されます。

*tags* テーブルは次のカラムを持たなければなりません:

| Name                 | Mandatory? | Default type                          | Possible types                                                                                                          | Description                                                                                               |
| -------------------- | ---------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `id`                 | [x]        | `UUID`                                | any (must match the type of `id` in the [samples](#samples-table) table)                                                | `id` はメトリック名とタグの組み合わせを識別します。DEFAULT 式でそのような識別子の計算方法を指定します                                                 |
| `metric_name`        | [x]        | `LowCardinality(String)`              | `String` or `LowCardinality(String)`                                                                                    | メトリックの名前                                                                                                  |
| `<tag_value_column>` | [ ]        | `String`                              | `String` or `LowCardinality(String)` or `LowCardinality(Nullable(String))`                                              | 特定のタグの値。タグ名と対応するカラム名は [tags&#95;to&#95;columns](#settings) 設定で指定します                                       |
| `tags`               | [x]        | `Map(LowCardinality(String), String)` | `Map(String, String)` or `Map(LowCardinality(String), String)` or `Map(LowCardinality(String), LowCardinality(String))` | メトリック名を保持するタグ `__name__` および [tags&#95;to&#95;columns](#settings) 設定で列挙された名前を持つタグを除いたタグのマップ               |
| `all_tags`           | [ ]        | `Map(String, String)`                 | `Map(String, String)` or `Map(LowCardinality(String), String)` or `Map(LowCardinality(String), LowCardinality(String))` | 一時的なカラムであり、各行はメトリック名を保持するタグ `__name__` のみを除外したすべてのタグのマップです。このカラムの唯一の目的は、`id` を計算する際に使用されることです             |
| `min_time`           | [ ]        | `Nullable(DateTime64(3))`             | `DateTime64(X)` or `Nullable(DateTime64(X))`                                                                            | 当該 `id` を持つ時系列の最小タイムスタンプ。[store&#95;min&#95;time&#95;and&#95;max&#95;time](#settings) が `true` の場合に作成されます |
| `max_time`           | [ ]        | `Nullable(DateTime64(3))`             | `DateTime64(X)` or `Nullable(DateTime64(X))`                                                                            | 当該 `id` を持つ時系列の最大タイムスタンプ。[store&#95;min&#95;time&#95;and&#95;max&#95;time](#settings) が `true` の場合に作成されます |

### Metrics テーブル \{#metrics-table\}

*metrics* テーブルには、収集対象となるメトリクスに関する情報、そのメトリクスのタイプ、およびその説明が含まれます。

*metrics* テーブルには、次のカラムが必要です。

| Name                 | Mandatory? | Default type             | Possible types                       | Description                                                                                                                                          |
| -------------------- | ---------- | ------------------------ | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `metric_family_name` | [x]        | `String`                 | `String` or `LowCardinality(String)` | メトリックファミリー名                                                                                                                                          |
| `type`               | [x]        | `LowCardinality(String)` | `String` or `LowCardinality(String)` | メトリックファミリーのタイプ。&quot;counter&quot;、&quot;gauge&quot;、&quot;summary&quot;、&quot;stateset&quot;、&quot;histogram&quot;、&quot;gaugehistogram&quot; のいずれか |
| `unit`               | [x]        | `LowCardinality(String)` | `String` or `LowCardinality(String)` | メトリックで使用される単位                                                                                                                                        |
| `help`               | [x]        | `String`                 | `String` or `LowCardinality(String)` | メトリックの説明                                                                                                                                             |

## 作成 \{#creation\}

`TimeSeries` テーブルエンジンでテーブルを作成する方法はいくつかあります。
最も簡単なステートメントは

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

実際には、次のテーブルが作成されます (`SHOW CREATE TABLE my_table` を実行すると確認できます) :

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

したがって、列は自動的に生成され、さらに `INNER COLUMNS` 句には、それぞれ独自のカラム定義を持つ 3 つの内部ターゲットテーブルが含まれています。

内部ターゲットテーブルは
`.inner_id.samples.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
`.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, `.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
のような名前になり、各ターゲットテーブルはそれぞれ独自のカラムセットを持ちます:

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

## 既存のテーブルを AS で指定してテーブルを作成する \{#create-as\}

ステートメント `CREATE TABLE new_table AS existing_table` は、`existing_table` から以下をコピーします。

* `SETTINGS`
* kind ごとの `INNER COLUMNS`
* kind ごとの `INNER ENGINE`

`existing_table` に外部ターゲットがある場合、このステートメントは使用できません。
外部カラム一覧はコピーされず、再生成されます。

## カラムの型を調整する \{#adjusting-column-types\}

`INNER COLUMNS` 句を使用すると、内部ターゲットテーブル内のカラムの型を調整できます。たとえば、タイムスタンプをマイクロ秒単位で、値を `Float32` として保存するには、次のようにします。

```sql
CREATE TABLE my_table ENGINE=TimeSeries
SAMPLES INNER COLUMNS (timestamp DateTime64(6), value Float32)
```

同じ句を使って、コーデックやその他のカラム属性も指定できます:

```sql
CREATE TABLE my_table ENGINE=TimeSeries
SAMPLES INNER COLUMNS (timestamp DateTime64(3) CODEC(DoubleDelta))
```

## `id` カラム \{#id-column\}

`id` カラムには識別子が格納されます。各識別子は、メトリック名とタグの組み合わせごとに計算されます。
識別子の生成に使用する型と `DEFAULT` 式は、`TAGS INNER COLUMNS` 句でカスタマイズできます。

```sql
CREATE TABLE my_table ENGINE=TimeSeries
TAGS INNER COLUMNS (id UInt64 DEFAULT sipHash64(metric_name, all_tags))
```

`id` カラムの型は、`UUID`、`UInt64`、`UInt128`、または `FixedString(16)` のいずれかである必要があります。`DEFAULT` 式が指定されていない場合、ClickHouse は `id` の型に基づいて自動的に選択します。samples および tags の内部テーブルで宣言する `id` の型は一致している必要があります。

`id_generator` 設定を使用すると、`INNER COLUMNS` 句 を使わずに同じカスタマイズを行えます。

```sql
CREATE TABLE my_table ENGINE=TimeSeries
SETTINGS id_generator = 'sipHash64(metric_name, all_tags)'
```

この設定が有効な場合、カラムの `DEFAULT` に別の式が含まれていても、`id` の生成にはこちらが使用されます。

## `tags` 列と `all_tags` 列 \{#tags-and-all-tags\}

タグのマップを含む列が 2 つあります。`tags` と `all_tags` です。この例では同じものですが、`tags_to_columns` 設定を使用した場合には異なる場合があります。この設定を使用すると、特定のタグを `tags` 列内のマップとしてではなく、別の列に保存するよう指定できます。

```sql
CREATE TABLE my_table
ENGINE = TimeSeries 
SETTINGS tags_to_columns = {'instance': 'instance', 'job': 'job'}
```

このステートメントにより、内部の [tags](#tags-table) ターゲットテーブルに `instance` 列と `job` 列が追加されます。
この場合、`tags` 列には `instance` と `job` のタグは含まれませんが、`all_tags` 列には含まれます。`all_tags` 列は一時的な列であり、その唯一の用途は `id` 列の DEFAULT 式で使用されることです。

## 内部ターゲットテーブルのテーブルエンジン \{#inner-table-engines\}

デフォルトでは、内部ターゲットテーブルは次のテーブルエンジンを使用します。

* [samples](#samples-table) テーブルは [MergeTree](../mergetree-family/mergetree) を使用します。
* [tags](#tags-table) テーブルは [AggregatingMergeTree](../mergetree-family/aggregatingmergetree) を使用します。これは、同じデータがこのテーブルに複数回挿入されることが多く、重複を削除する必要があることに加え、`min_time` と `max_time` 列に対して集約を実行する必要があるためです。
* [metrics](#metrics-table) テーブルは [ReplacingMergeTree](../mergetree-family/replacingmergetree) を使用します。これは、同じデータがこのテーブルに複数回挿入されることが多く、重複を削除する必要があるためです。

明示的に指定されている場合には、内部ターゲットテーブルに他のテーブルエンジンを使用することもできます。

```sql
CREATE TABLE my_table ENGINE=TimeSeries
SAMPLES ENGINE=ReplicatedMergeTree
TAGS ENGINE=ReplicatedAggregatingMergeTree
METRICS ENGINE=ReplicatedReplacingMergeTree
```

## 外部ターゲットテーブル \{#external-target-tables\}

手動で作成したテーブルを `TimeSeries` テーブルで使用することもできます:

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

外部テーブルのカラム型 (`id`、`timestamp`、`value`、および [`tags_to_columns`](#settings) に列挙された `<tag_value_column>`) は、`TimeSeries` テーブルが内部的に生成する型と一致している必要があります (型の制約については、[Samples テーブル](#samples-table)、[Tags テーブル](#tags-table)、および [Metrics table](#metrics-table) を参照してください) 。型の不一致は `CREATE` 時に報告されます。

外部 tags ターゲットの id-generator expression は、INSERT 時に次の順序で解決されます。まず [`id_generator`](#settings) 設定 (指定されている場合) 、次に外部テーブルの `id` カラムで宣言された `DEFAULT` (存在する場合) 、最後に `id` 型から導出される正規の generator です。したがって、この設定は外部テーブルで宣言された `DEFAULT` を上書きします。詳細は [The `id` column](#id-column) を参照してください。

## 設定の変更 \{#altering-settings\}

`CREATE` の後で変更できる設定は、次の 2 つです。

* `id_generator`
* `filter_by_min_time_and_max_time`

```sql
ALTER TABLE my_table MODIFY SETTING id_generator = 'sipHash64(metric_name, all_tags)';
ALTER TABLE my_table MODIFY SETTING filter_by_min_time_and_max_time = 0;
```

データがすでに `tags` テーブルに存在する状態で `id_generator` を変更すると、同じメトリクス+タグの組み合わせに対して異なる ID が生成される可能性がある点に注意してください。古い行は従来の ID のまま保持され、新しい行には新しいジェネレーターが使用されます。

他の設定は、`CREATE` 時点で内部テーブルのスキーマに組み込まれるため、`ALTER ... MODIFY SETTING` では変更できません。

## 設定 \{#settings\}

`TimeSeries` テーブルを定義する際に指定できる設定の一覧は次のとおりです。

| Name                                 | Type       | Default    | Description                                                                                                                                                                           |
| ------------------------------------ | ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id_generator`                       | Expression | `id` の型に依存 | タグから時系列の識別子 (フィンガープリント) を計算する式。未設定の場合は、`id` カラムのデフォルト式が使用されます。`id` カラムのデフォルト式も未設定であれば、式は自動的に選択されます                                                                                    |
| `tags_to_columns`                    | Map        | {}         | [tags](#tags-table) テーブル内で、どのタグを個別のカラムとして出力するかを指定する Map。構文: `{'tag1': 'column1', 'tag2' : column2, ...}`                                                                              |
| `use_all_tags_column_to_generate_id` | Bool       | true       | 時系列の ID を計算する式を生成する際に、このフラグを有効にすると、その計算で `all_tags` カラムを使用します                                                                                                                         |
| `store_min_time_and_max_time`        | Bool       | true       | true に設定すると、テーブルは各時系列について `min_time` と `max_time` を保存します                                                                                                                              |
| `aggregate_min_time_and_max_time`    | Bool       | true       | 内部ターゲットの `tags` テーブルを作成する際に、このフラグを有効にすると、`min_time` カラムの型として単なる `Nullable(DateTime64(3))` ではなく `SimpleAggregateFunction(min, Nullable(DateTime64(3)))` を使用し、`max_time` カラムについても同様にします |
| `filter_by_min_time_and_max_time`    | Bool       | true       | true に設定すると、テーブルは時系列をフィルタリングする際に `min_time` および `max_time` カラムを使用します                                                                                                                  |

# 関数 \{#functions\}

`TimeSeries` テーブルを引数として受け取る関数は次のとおりです:

* [timeSeriesSamples](../../../sql-reference/table-functions/timeSeriesSamples.md)
* [timeSeriesTags](../../../sql-reference/table-functions/timeSeriesTags.md)
* [timeSeriesMetrics](../../../sql-reference/table-functions/timeSeriesMetrics.md)