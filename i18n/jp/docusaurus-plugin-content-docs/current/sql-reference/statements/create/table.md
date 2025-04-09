---
slug: '/sql-reference/statements/create/table'
sidebar_position: 36
sidebar_label: 'TABLE'
title: 'CREATE TABLE'
keywords: ['compression', 'codec', 'schema', 'DDL']
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

新しいテーブルを作成します。このクエリは使用ケースに応じてさまざまな構文形式を持つことができます。

デフォルトでは、テーブルは現在のサーバーにのみ作成されます。分散DDLクエリは `ON CLUSTER` 句として実装されており、これは [別途説明されています](../../../sql-reference/distributed-ddl.md)。

## 構文形式 {#syntax-forms}

### 明示的なスキーマを使用する {#with-explicit-schema}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr1] [COMMENT 'コメントカラム'] [compression_codec] [TTL expr1],
    name2 [type2] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr2] [COMMENT 'コメントカラム'] [compression_codec] [TTL expr2],
    ...
) ENGINE = engine
  [COMMENT 'コメントテーブル']
```

`db` データベースまたは `db` が設定されていない場合は現在のデータベースに `table_name` という名前のテーブルを作成し、ブラケット内で指定された構造と `engine` エンジンを持ちます。
テーブルの構造は、カラムの説明、セカンダリインデックス、および制約のリストです。[主キー](#primary-key) がエンジンによってサポートされている場合、それはテーブルエンジンのパラメータとして示されています。

カラムの説明は単純な場合は `name type` です。例: `RegionID UInt32`。

結果の値のデフォルト値についても定義できます（下記参照）。

必要に応じて、1つまたは複数のキー式を持つ主キーを指定できます。

カラムやテーブルにコメントを追加できます。

### 他のテーブルに似たスキーマを持つ {#with-a-schema-similar-to-other-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine]
```

別のテーブルと同じ構造を持つテーブルを作成します。テーブルの異なるエンジンを指定できます。エンジンが指定されていない場合は、`db2.name2` テーブルと同じエンジンが使用されます。

### 他のテーブルからスキーマとデータをクローンする {#with-a-schema-and-data-cloned-from-another-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name CLONE AS [db2.]name2 [ENGINE = engine]
```

別のテーブルと同じ構造を持つテーブルを作成します。テーブルの異なるエンジンを指定できます。エンジンが指定されていない場合は、`db2.name2` テーブルと同じエンジンが使用されます。新しいテーブルが作成されると、`db2.name2` からすべてのパーティションがそれにアタッチされます。言い換えれば、`db2.name2` のデータは作成時に `db.table_name` にクローンされます。このクエリは以下と同等です。

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine];
ALTER TABLE [db.]table_name ATTACH PARTITION ALL FROM [db2].name2;
```

### テーブル関数から {#from-a-table-function}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS table_function()
```

指定された [テーブル関数](/sql-reference/table-functions) と同じ結果を持つテーブルを作成します。作成されたテーブルは、指定された対応するテーブル関数と同じように動作します。

### SELECTクエリから {#from-select-query}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name[(name1 [type1], name2 [type2], ...)] ENGINE = engine AS SELECT ...
```

`SELECT` クエリの結果に似た構造を持つテーブルを作成し、`engine` エンジンを持ち、`SELECT` からデータを埋めます。また、カラムの説明を明示的に指定することもできます。

テーブルがすでに存在し、`IF NOT EXISTS` が指定されている場合、クエリは何も行いません。

クエリ内の `ENGINE` 句の後に他の句を付けることができます。[テーブルエンジン](/engines/table-engines)の説明でテーブルを作成する方法についての詳細なドキュメントを参照してください。

:::tip
ClickHouse Cloud では、これを2つのステップに分けてください：
1. テーブル構造を作成する

  ```sql
  CREATE TABLE t1
  ENGINE = MergeTree
  ORDER BY ...
  # highlight-next-line
  EMPTY AS
  SELECT ...
  ```

2. テーブルにデータを追加する

  ```sql
  INSERT INTO t1
  SELECT ...
  ```

:::

**例**

クエリ：

``` sql
CREATE TABLE t1 (x String) ENGINE = Memory AS SELECT 1;
SELECT x, toTypeName(x) FROM t1;
```

結果：

```text
┌─x─┬─toTypeName(x)─┐
│ 1 │ String        │
└───┴───────────────┘
```

## NULLまたはNOT NULL修飾子 {#null-or-not-null-modifiers}

カラム定義内のデータ型の後にある `NULL` および `NOT NULL` 修飾子により、それが [Nullable](/sql-reference/data-types/nullable) であるかどうかが許可または禁止されます。

タイプが `Nullable` でない場合、`NULL` が指定されているとそれは `Nullable` とみなされます；`NOT NULL` が指定されているのであればそうではありません。例えば、`INT NULL` は `Nullable(INT)` と同じです。タイプが `Nullable` で `NULL` または `NOT NULL` 修飾子が指定されている場合、例外がスローされます。

[デフォルトの Nullable データ型](../../../operations/settings/settings.md#data_type_default_nullable) 設定も参照してください。

## デフォルト値 {#default_values}

カラムの説明には `DEFAULT expr`、`MATERIALIZED expr`、または `ALIAS expr` の形のデフォルト値式を指定できます。例: `URLDomain String DEFAULT domain(URL)`。

式 `expr` はオプションです。省略された場合、カラムの型は明示的に指定する必要があり、数値カラムの場合デフォルト値は `0`、文字列カラムの場合は `''`（空文字列）、配列カラムの場合は `[]`（空配列）、日付カラムの場合は `1970-01-01`、または Nullable カラムの場合は `NULL` になります。

デフォルト値カラムのカラム型は省略でき、その場合は `expr` の型から推測されます。例えば、`EventDate DEFAULT toDate(EventTime)` のカラムの型は日付になります。

データ型とデフォルト値式の両方が指定された場合、指定された型に式を変換する暗黙の型キャスティング関数が挿入されます。例: `Hits UInt32 DEFAULT 0` は内部的には `Hits UInt32 DEFAULT toUInt32(0)` として表現されます。

デフォルト値式 `expr` は任意のテーブルカラムや定数を参照できます。ClickHouse は、テーブル構造の変更が式の計算にループを導入しないことを確認します。INSERT の場合、式が解決可能であることを確認します - それを計算するために必要なすべてのカラムが渡されている必要があります。

### DEFAULT {#default}

`DEFAULT expr`

通常のデフォルト値です。INSERT クエリでこのカラムの値が指定されていない場合、`expr` から計算されます。

例：

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    updated_at DateTime DEFAULT now(),
    updated_at_date Date DEFAULT toDate(updated_at)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test (id) Values (1);

SELECT * FROM test;
┌─id─┬──────────updated_at─┬─updated_at_date─┐
│  1 │ 2023-02-24 17:06:46 │      2023-02-24 │
└────┴─────────────────────┴─────────────────┘
```

### MATERIALIZED {#materialized}

`MATERIALIZED expr`

マテリアライズされた式です。このタイプのカラムの値は、行が挿入されるときに指定されたマテリアライズされた式に従って自動的に計算されます。`INSERT` で明示的に値を指定することはできません。

このタイプのデフォルト値カラムは、`SELECT *` の結果に含まれません。これは、`SELECT *` の結果が常に `INSERT` を使用してテーブルに戻されることが可能であるという不変性を保持するためです。この動作は、`asterisk_include_materialized_columns` 設定で無効にできます。

例：

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    updated_at DateTime MATERIALIZED now(),
    updated_at_date Date MATERIALIZED toDate(updated_at)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test Values (1);

SELECT * FROM test;
┌─id─┐
│  1 │
└────┘

SELECT id, updated_at, updated_at_date FROM test;
┌─id─┬──────────updated_at─┬─updated_at_date─┐
│  1 │ 2023-02-24 17:08:08 │      2023-02-24 │
└────┴─────────────────────┴─────────────────┘

SELECT * FROM test SETTINGS asterisk_include_materialized_columns=1;
┌─id─┬──────────updated_at─┬─updated_at_date─┐
│  1 │ 2023-02-24 17:08:08 │      2023-02-24 │
└────┴─────────────────────┴─────────────────┘
```

### EPHEMERAL {#ephemeral}

`EPHEMERAL [expr]`

エフェメラルカラム。このタイプのカラムはテーブルに保存されず、そこからの SELECT は不可能です。エフェメラルカラムの唯一の目的は、他のカラムからのデフォルト値式を構築することです。

明示的にカラムが指定されていない INSERT は、このタイプのカラムをスキップします。これは、`SELECT *` の結果が常に `INSERT` を使用してテーブルに戻されることができるという不変性を保持するためです。

例：

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    unhexed String EPHEMERAL,
    hexed FixedString(4) DEFAULT unhex(unhexed)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test (id, unhexed) Values (1, '5a90b714');

SELECT
    id,
    hexed,
    hex(hexed)
FROM test
FORMAT Vertical;

Row 1:
──────
id:         1
hexed:      Z��
hex(hexed): 5A90B714
```

### ALIAS {#alias}

`ALIAS expr`

計算カラム（同義語）。このタイプのカラムはテーブルに保存されず、そこに値を INSERT することはできません。

SELECT クエリが明示的にこのタイプのカラムを参照する場合、値は `expr` からクエリ時に計算されます。デフォルトでは、`SELECT *` は ALIAS カラムを除外します。この動作は、`asterisk_include_alias_columns` 設定で無効にできます。

ALTER クエリを使用して新しいカラムを追加する場合、これらのカラムの古いデータは書き込まれません。代わりに、新しいカラムに値がない古いデータを読み取るとき、式はデフォルトでオンザフライで計算されます。ただし、式の実行に異なるカラムが必要な場合、それらのカラムは追加で読み取られますが、必要なデータブロックにのみ適用されます。

テーブルに新しいカラムを追加しますが、後でそのデフォルト式を変更すると、古いデータに使用される値が変更されます（ディスクに値が保存されていないデータに対して）。バックグラウンドマージを実行する場合、一部がマージされていないカラムのデータは、マージされた部分に書き込まれます。

ネストされたデータ構造の要素に対してカラムにデフォルト値を設定することはできません。

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    size_bytes Int64,
    size String ALIAS formatReadableSize(size_bytes)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test VALUES (1, 4678899);

SELECT id, size_bytes, size FROM test;
┌─id─┬─size_bytes─┬─size─────┐
│  1 │    4678899 │ 4.46 MiB │
└────┴────────────┴──────────┘

SELECT * FROM test SETTINGS asterisk_include_alias_columns=1;
┌─id─┬─size_bytes─┬─size─────┐
│  1 │    4678899 │ 4.46 MiB │
└────┴────────────┴──────────┘
```

## 主キー {#primary-key}

テーブルを作成するときに [主キー](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries) を定義できます。主キーは2つの方法で指定できます：

- カラムリストの内側

``` sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...,
    PRIMARY KEY(expr1[, expr2,...])
)
ENGINE = engine;
```

- カラムリストの外側

``` sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
PRIMARY KEY(expr1[, expr2,...]);
```

:::tip
どちらの方法も1つのクエリで組み合わせることはできません。
:::

## 制約 {#constraints}

カラムの説明とともに制約を定義できます：

### CONSTRAINT {#constraint}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [compression_codec] [TTL expr1],
    ...
    CONSTRAINT constraint_name_1 CHECK boolean_expr_1,
    ...
) ENGINE = engine
```

`boolean_expr_1` は任意のブール式です。テーブルに制約が定義されている場合、それぞれが `INSERT` クエリの全行に対してチェックされます。いずれかの制約が満たされない場合、サーバーは制約名とチェック式で例外をスローします。

大量の制約を追加すると、大きな `INSERT` クエリのパフォーマンスに悪影響を与える可能性があります。

### ASSUME {#assume}

`ASSUME` 句は、真であると仮定されるテーブル上の `CONSTRAINT` を定義するために使用されます。この制約は最適化器によって SQL クエリのパフォーマンスを向上させるために使用されます。

以下は `ASSUME CONSTRAINT` を使用して `users_a` テーブルを作成する例です：

```sql
CREATE TABLE users_a (
    uid Int16, 
    name String, 
    age Int16, 
    name_len UInt8 MATERIALIZED length(name), 
    CONSTRAINT c1 ASSUME length(name) = name_len
) 
ENGINE=MergeTree 
ORDER BY (name_len, name);
```

ここで、`ASSUME CONSTRAINT` は `length(name)` 関数が常に `name_len` カラムの値と等しいと主張するために使用されます。これは、クエリで `length(name)` が呼び出されるたびに、ClickHouse が `name_len` に置き換えることができ、`length()` 関数を呼び出すのを避けるため、より高速です。

その後、クエリ `SELECT name FROM users_a WHERE length(name) < 5;` を実行すると、ClickHouse はそれを `SELECT name FROM users_a WHERE name_len < 5;` に最適化できます。これは `ASSUME CONSTRAINT` によるもので、各行の `name` の長さを計算するのを避けるため、クエリの実行速度が向上します。

`ASSUME CONSTRAINT` は **制約を強制** するものではなく、最適化器にその制約が真であることを通知するものです。制約が実際に真でない場合、クエリの結果が不正確になる可能性があります。したがって、その制約が真であると確信している場合にのみ `ASSUME CONSTRAINT` を使用するべきです。

## TTL式 {#ttl-expression}

値の保管期間を定義します。MergeTree系のテーブルのみに指定できます。詳細な説明は、[カラムとテーブルのTTL](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)を参照してください。

## カラム圧縮コーデック {#column_compression_codec}

デフォルトでは、ClickHouse はセルフマネージドバージョンで `lz4` 圧縮を適用し、ClickHouse Cloud では `zstd` を適用します。

`MergeTree` エンジンファミリーに対しては、サーバー configuration の [圧縮](/operations/server-configuration-parameters/settings#compression) セクションでデフォルトの圧縮方法を変更できます。

また、`CREATE TABLE` クエリ内の各カラムに対する圧縮方法を定義することもできます。

``` sql
CREATE TABLE codec_example
(
    dt Date CODEC(ZSTD),
    ts DateTime CODEC(LZ4HC),
    float_value Float32 CODEC(NONE),
    double_value Float64 CODEC(LZ4HC(9)),
    value Float32 CODEC(Delta, ZSTD)
)
ENGINE = <Engine>
...
```

`Default` コーデックは初期化に言及されているデフォルト圧縮に参照されることがあります。それはランタイムのさまざまな設定（およびデータのプロパティ）に依存します。
例: `value UInt64 CODEC(Default)` — コーデック指定がないのと同じです。

また、カラムから現在の CODEC を削除し、config.xml からデフォルト圧縮を使用することもできます：

``` sql
ALTER TABLE codec_example MODIFY COLUMN float_value CODEC(Default);
```

コーデックはパイプラインで組み合わせることができます。例えば、`CODEC(Delta, Default)`。

:::tip
ClickHouse データベースファイルを外部ユーティリティ（例えば `lz4`）でデコンプレッションすることはできません。代わりに、特別な [clickhouse-compressor](https://github.com/ClickHouse/ClickHouse/tree/master/programs/compressor) ユーティリティを使用してください。
:::

圧縮は以下のテーブルエンジンに対してサポートされています：

- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) ファミリー。カラム圧縮コーデックと、[圧縮](/operations/server-configuration-parameters/settings#compression) 設定によるデフォルト圧縮方法の選択をサポートしています。
- [Log](../../../engines/table-engines/log-family/index.md) ファミリー。デフォルトで `lz4` 圧縮方法を使用し、カラム圧縮コーデックをサポートしています。
- [Set](../../../engines/table-engines/special/set.md)。デフォルト圧縮のみに対応しています。
- [Join](../../../engines/table-engines/special/join.md)。デフォルト圧縮のみに対応しています。

ClickHouse は汎用コーデックと特殊コーデックをサポートしています。

### 汎用コーデック {#general-purpose-codecs}

#### NONE {#none}

`NONE` — 圧縮なし。

#### LZ4 {#lz4}

`LZ4` — デフォルトで使用されるロスレス [データ圧縮アルゴリズム](https://github.com/lz4/lz4)。LZ4 高速圧縮を適用します。

#### LZ4HC {#lz4hc}

`LZ4HC[(level)]` — 設定可能なレベルを持つ LZ4 HC（高圧縮）アルゴリズム。デフォルトレベル：9。`level <= 0` を設定するとデフォルトレベルが適用されます。可能なレベル：\[1, 12\]。推奨レベル範囲：\[4, 9\]。

#### ZSTD {#zstd}

`ZSTD[(level)]` — 設定可能な `level` を持つ [ZSTD 圧縮アルゴリズム](https://en.wikipedia.org/wiki/Zstandard)。可能なレベル：\[1, 22\]。デフォルトレベル：1。

高い圧縮レベルは、非対称のシナリオに便利です。一度圧縮し、何度もデコンプレッションすることができます。高いレベルは、より良い圧縮と高い CPU 使用率を意味します。

#### ZSTD_QAT {#zstd_qat}

<CloudNotSupportedBadge/>

`ZSTD_QAT[(level)]` — [ZSTD 圧縮アルゴリズム](https://en.wikipedia.org/wiki/Zstandard) で設定可能なレベルを持ち、[Intel® QATlib](https://github.com/intel/qatlib) および [Intel® QAT ZSTD プラグイン](https://github.com/intel/QAT-ZSTD-Plugin)によって実装されています。可能なレベル：\[1, 12\]。デフォルトレベル：1。推奨レベル範囲：\[6, 12\]。いくつかの制限が適用されます：

- ZSTD_QAT はデフォルトで無効になっており、 [enable_zstd_qat_codec](../../../operations/settings/settings.md#enable_zstd_qat_codec) 設定を有効にするまで使用できません。
- 圧縮のため、ZSTD_QAT は Intel® QAT オフロードデバイス（[QuickAssist Technology](https://www.intel.com/content/www/us/en/developer/topic-technology/open/quick-assist-technology/overview.html)）を使用しようとします。そのようなデバイスが見つからない場合、ソフトウェアで ZSTD 圧縮にフォールバックします。
- デコンプレッションは常にソフトウェアで行われます。

#### DEFLATE_QPL {#deflate_qpl}

<CloudNotSupportedBadge/>

`DEFLATE_QPL` — [Deflate 圧縮アルゴリズム](https://github.com/intel/qpl) が Intel® Query Processing Library によって実装されています。いくつかの制限が適用されます：

- DEFLATE_QPL はデフォルトで無効になっており、 [enable_deflate_qpl_codec](../../../operations/settings/settings.md#enable_deflate_qpl_codec) 設定を有効にした後のみ使用できます。
- DEFLATE_QPL は SSE 4.2 命令でコンパイルされた ClickHouse ビルドを必要とします（デフォルトでは、これはそうです）。詳細は [DEFLATE_QPL で Clickhouse をビルド]( /development/building_and_benchmarking_deflate_qpl) を参照してください。
- DEFLATE_QPL は Intel® IAA（インメモリアナリティクスアクセラレータ）オフロードデバイスがあるシステムで最も効果的に機能します。詳細は [アクセラレータ設定](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration) および [DEFLATE_QPL でのベンチマーク]( /development/building_and_benchmarking_deflate_qpl) を参照してください。
- DEFLATE_QPL 圧縮データは、SSE 4.2 が有効な ClickHouse ノード間でのみ転送できます。

### 特殊コーデック {#specialized-codecs}

これらのコーデックは、データの特定の特徴を利用して圧縮をより効果的にするために設計されています。一部のコーデックはデータ自体を圧縮するのではなく、データが一般目的コーデックによって圧縮される次のステージでより高いデータ圧縮率を達成するために前処理を行います。

#### Delta {#delta}

`Delta(delta_bytes)` — 生の値を隣接する2つの値の差に置き換える圧縮アプローチ。最初の値は変更されずにそのまま残ります。最大 `delta_bytes` がデルタ値の格納に使用されるので、`delta_bytes` は生の値の最大サイズとなります。可能な `delta_bytes` の値：1、2、4、8。`delta_bytes`のデフォルト値は、1、2、4、8 のいずれかであれば `sizeof(type)` です。それ以外の場合は1です。Delta はデータ準備コーデックであり、単独では使用できません。

#### DoubleDelta {#doubledelta}

`DoubleDelta(bytes_size)` — デルタのデルタを計算し、コンパクトなバイナリ形式で書き込みます。可能な `bytes_size` の値：1、2、4、8。デフォルト値は、1、2、4、8 のいずれかであれば `sizeof(type)` です。それ以外の場合は1です。連続した等間隔のモノトニックシーケンス（時間系列データなど）において最適な圧縮率が達成されます。任意の固定幅のタイプで使用できます。Gorilla TSDB で使用されるアルゴリズムを実装しており、64ビットタイプのサポートを拡張しています。32ビットのデルタには、4ビットプレフィックスの代わりに5ビットプレフィックスが必要なため、32ビットデルタには1ビット多く使用されます。詳細については [Gorilla: A Fast, Scalable, In-Memory Time Series Database](http://www.vldb.org/pvldb/vol8/p1816-teller.pdf)を参照してください。DoubleDelta はデータ準備コーデックであり、単独では使用できません。

#### GCD {#gcd}

`GCD()` — カラムの値の最大公約数（GCD）を計算し、その後各値を GCD で割ります。整数、十進法および日付/時刻カラムで使用できます。このコーデックは、GCD の倍数で変化するカラム（例えば、24、28、16、24、8、24（GCD = 4）のような）に最適です。GCD はデータ準備コーデックであり、単独では使用できません。

#### Gorilla {#gorilla}

`Gorilla(bytes_size)` — 現在および前の浮動小数点値の間で XOR を計算し、コンパクトなバイナリ形式で書き込みます。連続する値の間の差が小さいほど、すなわち時系列データの値の変化が遅いほど、圧縮率が良くなります。Gorilla TSDB で使用されるアルゴリズムを実装しており、64ビットタイプのサポートを拡張しています。可能な `bytes_size` の値：1、2、4、8。デフォルト値は、1、2、4、8 のいずれかであれば `sizeof(type)` です。それ以外の場合は1です。詳細については、[Gorilla: A Fast, Scalable, In-Memory Time Series Database](https://doi.org/10.14778/2824032.2824078) のセクション 4.1 を参照してください。

#### FPC {#fpc}

`FPC(level, float_size)` — シーケンス内の次の浮動小数点値を二つの予測器のうちのより良い方を使って繰り返し予測し、その後、実際の値と予測された値との XOR を計算し、その結果を先頭のゼロで圧縮します。Gorilla と同様に、浮動小数点値の連続的なシーケンスを保存する際に効率的です。64ビット値（ダブル）の場合は FPC が Gorilla よりも高速で、32ビット値の場合は状況によります。可能な `level` の値：1-28 デフォルト値は 12。可能な `float_size` の値：4、8。デフォルト値は `sizeof(type)` が Float の場合はそれになります。それ以外の場合は4です。アルゴリズムの詳細については [High Throughput Compression of Double-Precision Floating-Point Data](https://userweb.cs.txstate.edu/~burtscher/papers/dcc07a.pdf) を参照してください。

#### T64 {#t64}

`T64` — 整数データ型（`Enum`、`Date` および `DateTime` を含む）の未使用高ビットを削除する圧縮方法です。アルゴリズムの各ステップで、コーデックは64の値のブロックを取り、64x64ビットマトリックスに配置し、それを転置し、値の未使用ビットを切り詰め、その結果を配列として返します。

`DoubleDelta` と `Gorilla` コーデックは Gorilla TSDB でその圧縮アルゴリズムのコンポーネントとして使用されます。Gorilla アプローチは、タイムスタンプと共にゆっくりと変化する値のシーケンスにおいて効果的です。タイムスタンプは `DoubleDelta` コーデックによって効果的に圧縮され、値は `Gorilla` コーデックによって効果的に圧縮されます。例えば、効果的に保存されるテーブルを得るために、次の構成で作成することができます：

``` sql
CREATE TABLE codec_example
(
    timestamp DateTime CODEC(DoubleDelta),
    slow_values Float32 CODEC(Gorilla)
)
ENGINE = MergeTree()
```

### 暗号化コーデック {#encryption-codecs}

これらのコーデックは実際にはデータを圧縮するのではなく、ディスク上でデータを暗号化します。これらは、暗号化キーが [暗号化](/operations/server-configuration-parameters/settings#encryption) 設定で指定されている場合にのみ使用可能です。暗号化は通常コーデックパイプラインの最後に意味を持ちます。なぜなら、暗号化データは一般的に有意義な方法で圧縮できないからです。

暗号化コーデック：
#### AES_128_GCM_SIV {#aes_128_gcm_siv}

`CODEC('AES-128-GCM-SIV')` — データを AES-128 で [RFC 8452](https://tools.ietf.org/html/rfc8452) GCM-SIV モードで暗号化します。

#### AES-256-GCM-SIV {#aes-256-gcm-siv}

`CODEC('AES-256-GCM-SIV')` — データを AES-256 で GCM-SIV モードで暗号化します。

これらのコーデックは固定の nonce を使用し、したがって暗号化は決定的です。これにより、[ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md) のような重複排除エンジンとの互換性がありますが、次のような弱点があります。同じデータブロックが二度暗号化されると、結果として得られる暗号文は全く同じになります。このため、ディスクを読み取ることができる攻撃者はこの同値性を見ることができます（ただし、その内容を知ることなく）。

:::note
["*MergeTree"ファミリーを含むほとんどのエンジンは、コーデックを適用せずにディスク上にインデックスファイルを作成します。これにより、暗号化されたカラムがインデックスされている場合にはプレーンテキストがディスク上に現れます。](#) 
:::

:::note
暗号化されたカラム（その WHERE 節など）で特定の値を指定した SELECT クエリを実行すると、その値は [system.query_log](../../../operations/system-tables/query_log.md) に表示される場合があります。ロギングを無効にしたい場合もあります。
:::

**例**

```sql
CREATE TABLE mytable
(
    x String CODEC(AES_128_GCM_SIV)
)
ENGINE = MergeTree ORDER BY x;
```

:::note
圧縮を適用する必要がある場合、明示的に指定しなければなりません。さもなければ、データには暗号化のみが適用されます。
:::

**例**

```sql
CREATE TABLE mytable
(
    x String Codec(Delta, LZ4, AES_128_GCM_SIV)
)
ENGINE = MergeTree ORDER BY x;
```

## 一時テーブル {#temporary-tables}

:::note
一時テーブルはレプリケーションされないことに注意してください。したがって、一時テーブルに挿入されたデータが他のレプリカで利用できるという保証はありません。一時テーブルが便利な主なユースケースは、単一のセッション中に外部の小規模なデータセットをクエリまたは結合することです。
:::

ClickHouse は次の特性を持つ一時テーブルをサポートしています。

- 一時テーブルはセッションが終了すると消失します。接続が失われた場合も含まれます。
- 一時テーブルはエンジンが指定されていない場合に Memory テーブルエンジンを使用し、レプリケートおよび `KeeperMap` エンジン以外の任意のテーブルエンジンを使用できます。
- 一時テーブルに対してデータベースを指定することはできません。一時テーブルはデータベースの外部に作成されます。
- すべてのクラスタサーバーに分散DDlクエリを使用して一時テーブルを作成することはできません（`ON CLUSTER` を使用して）：このテーブルは現在のセッションにのみ存在します。
- 同じ名前の一時テーブルが存在し、クエリがデータベースを指定せずにテーブル名を指定した場合、一時テーブルが使用されます。
- 分散クエリ処理のために、クエリで使用されるメモリエンジンを持つ一時テーブルはリモートサーバーに渡されます。

一時テーブルを作成するには、次の構文を使用します：

``` sql
CREATE TEMPORARY TABLE [IF NOT EXISTS] table_name
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) [ENGINE = engine]
```

ほとんどの場合、一時テーブルは手動で作成されることはありませんが、外部データをクエリに使用する場合や、分散 `(GLOBAL) IN` のために使用されます。詳細については、関連するセクションを参照してください。

一時テーブルの代わりに、[ENGINE = Memory](../../../engines/table-engines/special/memory.md) を持つテーブルを使用することもできます。

## REPLACE TABLE {#replace-table}

`REPLACE` ステートメントはテーブルを [原子的に](/concepts/glossary#atomicity) 更新することを許可します。

:::note
このステートメントは、[`Atomic`](../../../engines/database-engines/atomic.md) および [`Replicated`](../../../engines/database-engines/replicated.md) データベースエンジンでサポートされています。これらはそれぞれ ClickHouse および ClickHouse Cloud のデフォルトのデータベースエンジンです。
:::

通常、テーブルからいくつかのデータを削除する必要がある場合、不要なデータを取得しない `SELECT` ステートメントで新しいテーブルを作成し、古いテーブルを削除して新しいテーブルの名前を変更することができます。このアプローチは、以下の例に示されています。

```sql
CREATE TABLE myNewTable AS myOldTable;

INSERT INTO myNewTable
SELECT * FROM myOldTable 
WHERE CounterID <12345;

DROP TABLE myOldTable;

RENAME TABLE myNewTable TO myOldTable;
```

上記のアプローチの代わりに、`REPLACE` を使用することも可能です（デフォルトのデータベースエンジンを使用している場合は）、同じ結果を達成できます：

```sql
REPLACE TABLE myOldTable
ENGINE = MergeTree()
ORDER BY CounterID 
AS
SELECT * FROM myOldTable
WHERE CounterID <12345;
```

### 構文 {#syntax}

``` sql
{CREATE [OR REPLACE] | REPLACE} TABLE [db.]table_name
```

:::note
`CREATE` ステートメントのすべての構文形式もこのステートメントで機能します。存在しないテーブルに対して `REPLACE` を呼び出すとエラーが発生します。
:::
### 例: {#examples}

<Tabs>
<TabItem value="clickhouse_replace_example" label="ローカル" default>

次のテーブルを考えてみましょう:

```sql
CREATE DATABASE base 
ENGINE = Atomic;

CREATE OR REPLACE TABLE base.t1
(
    n UInt64,
    s String
)
ENGINE = MergeTree
ORDER BY n;

INSERT INTO base.t1 VALUES (1, 'test');

SELECT * FROM base.t1;

┌─n─┬─s────┐
│ 1 │ test │
└───┴──────┘
```

`REPLACE` ステートメントを使用してすべてのデータをクリアできます:

```sql
CREATE OR REPLACE TABLE base.t1 
(
    n UInt64,
    s Nullable(String)
)
ENGINE = MergeTree
ORDER BY n;

INSERT INTO base.t1 VALUES (2, null);

SELECT * FROM base.t1;

┌─n─┬─s──┐
│ 2 │ \N │
└───┴────┘
```

または、`REPLACE` ステートメントを使用してテーブルの構造を変更できます:

```sql
REPLACE TABLE base.t1 (n UInt64) 
ENGINE = MergeTree 
ORDER BY n;

INSERT INTO base.t1 VALUES (3);

SELECT * FROM base.t1;

┌─n─┐
│ 3 │
└───┘
```  
</TabItem>
<TabItem value="cloud_replace_example" label="クラウド">

ClickHouse Cloudの次のテーブルを考えてみましょう: 

```sql
CREATE DATABASE base;

CREATE OR REPLACE TABLE base.t1 
(
    n UInt64,
    s String
)
ENGINE = MergeTree
ORDER BY n;

INSERT INTO base.t1 VALUES (1, 'test');

SELECT * FROM base.t1;

1	test
```

`REPLACE` ステートメントを使用してすべてのデータをクリアできます:

```sql
CREATE OR REPLACE TABLE base.t1 
(
    n UInt64, 
    s Nullable(String)
)
ENGINE = MergeTree
ORDER BY n;

INSERT INTO base.t1 VALUES (2, null);

SELECT * FROM base.t1;

2	
```

または、`REPLACE` ステートメントを使用してテーブルの構造を変更できます:

```sql
REPLACE TABLE base.t1 (n UInt64) 
ENGINE = MergeTree 
ORDER BY n;

INSERT INTO base.t1 VALUES (3);

SELECT * FROM base.t1;

3
```    
</TabItem>
</Tabs>
## COMMENT 句 {#comment-clause}

テーブルを作成する際にコメントを追加できます。

**構文**

``` sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
COMMENT 'コメント'
```

**例**

クエリ:

``` sql
CREATE TABLE t1 (x String) ENGINE = Memory COMMENT '一時テーブル';
SELECT name, comment FROM system.tables WHERE name = 't1';
```

結果:

```text
┌─name─┬─comment─────────────┐
│ t1   │ 一時テーブル       │
└──────┴─────────────────────┘
```
## 関連コンテンツ {#related-content}

- ブログ: [スキーマとコーデックを使ってClickHouseを最適化する](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- ブログ: [ClickHouseでの時系列データの扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
