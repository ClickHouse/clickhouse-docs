---
description: 'テーブルのドキュメント'
keywords: ['圧縮', 'コーデック', 'スキーマ', 'DDL']
sidebar_label: 'TABLE'
sidebar_position: 36
slug: /sql-reference/statements/create/table
title: 'CREATE TABLE'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

新しいテーブルを作成します。このクエリは、ユースケースに応じてさまざまな構文が利用できます。

デフォルトでは、テーブルは現在のサーバー上にのみ作成されます。分散 DDL クエリは `ON CLUSTER` 句として実装されており、[別途説明されています](../../../sql-reference/distributed-ddl.md)。

## 構文形式 {#syntax-forms}

### 明示的なスキーマ指定 {#with-explicit-schema}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr1] [COMMENT '列のコメント'] [compression_codec] [TTL expr1],
    name2 [type2] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr2] [COMMENT '列のコメント'] [compression_codec] [TTL expr2],
    ...
) ENGINE = engine
  [COMMENT 'テーブルのコメント']
```

`db` データベース、もしくは `db` が設定されていない場合は現在のデータベースに、括弧内で指定された構造と `engine` エンジンを持つ `table_name` という名前のテーブルを作成します。
テーブルの構造は、列定義、セカンダリインデックス、および制約の一覧です。エンジンが [primary key](#primary-key) をサポートしている場合、テーブルエンジンのパラメータとして指定します。

最も単純な場合、列定義は `name type` です。例: `RegionID UInt32`。

デフォルト値用の式を定義することもできます（下記参照）。

必要に応じて、1 つ以上のキー式を用いて primary key を指定できます。

列およびテーブルにコメントを追加できます。

### 他のテーブルと同様のスキーマを使用する場合 {#with-a-schema-similar-to-other-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine]
```

別のテーブルと同じ構造のテーブルを作成します。テーブルに別のエンジンを指定できます。エンジンを指定しない場合は、`db2.name2` テーブルと同じエンジンが使用されます。

### 別のテーブルからスキーマとデータをクローンする場合 {#with-a-schema-and-data-cloned-from-another-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name を CLONE AS [db2.]name2 [ENGINE = engine]
```

別のテーブルと同じ構造を持つテーブルを作成します。テーブルには異なるエンジンを指定できます。エンジンが指定されていない場合、`db2.name2` テーブルと同じエンジンが使用されます。新しいテーブルが作成された後、`db2.name2` のすべてのパーティションがそのテーブルにアタッチされます。言い換えると、`db2.name2` のデータは作成時に `db.table_name` にクローンされます。このクエリは次のものと等価です：

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine];
ALTER TABLE [db.]table_name ATTACH PARTITION ALL FROM [db2].name2;
```

### テーブル関数から {#from-a-table-function}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS table_function()
```

指定した[テーブル関数](/sql-reference/table-functions)と同じ結果になるテーブルを作成します。作成されたテーブルは、指定した対応するテーブル関数と同様に動作します。

### SELECT クエリから {#from-select-query}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name[(name1 [type1], name2 [type2], ...)] ENGINE = engine AS SELECT ...
```

`SELECT` クエリの結果と同じ構造を持つテーブルを、`engine` エンジンを使用して作成し、`SELECT` で得られたデータを挿入します。列の定義を明示的に指定することもできます。

テーブルがすでに存在していて `IF NOT EXISTS` が指定されている場合、このクエリは何も行いません。

クエリの `ENGINE` 句の後には、他の句を続けて指定することができます。テーブルの作成方法についての詳細なドキュメントは、[table engines](/engines/table-engines) の説明を参照してください。

**例**

クエリ:

```sql
CREATE TABLE t1 (x String) ENGINE = Memory AS SELECT 1;
SELECT x, toTypeName(x) FROM t1;
```

結果：

```text
┌─x─┬─toTypeName(x)─┐
│ 1 │ String        │
└───┴───────────────┘
```

## NULL または NOT NULL 修飾子 {#null-or-not-null-modifiers}

列定義におけるデータ型の後ろに付ける `NULL` および `NOT NULL` 修飾子は、その列を [Nullable](/sql-reference/data-types/nullable) 型にできるかどうかを指定します。

型が `Nullable` でない場合に `NULL` が指定されると、その型は `Nullable` として扱われます。`NOT NULL` が指定されると、`Nullable` にはなりません。例えば、`INT NULL` は `Nullable(INT)` と同じ意味になります。型がすでに `Nullable` であり、そこに `NULL` または `NOT NULL` 修飾子が指定された場合は、例外がスローされます。

[data_type_default_nullable](../../../operations/settings/settings.md#data_type_default_nullable) 設定も参照してください。

## デフォルト値 {#default_values}

カラム定義では、`DEFAULT expr`、`MATERIALIZED expr`、`ALIAS expr` の形式でデフォルト値の式を指定できます。例: `URLDomain String DEFAULT domain(URL)`。

式 `expr` は省略可能です。省略された場合、カラム型を明示的に指定しなければならず、デフォルト値は数値カラムでは `0`、文字列カラムでは `''`（空文字列）、配列カラムでは `[]`（空配列）、日付カラムでは `1970-01-01`、Nullable カラムでは `NULL` になります。

デフォルト値を持つカラムについては、カラム型を省略することができ、その場合は `expr` の型から推論されます。例えば、カラム `EventDate DEFAULT toDate(EventTime)` の型は Date 型になります。

データ型とデフォルト値の式が両方指定されている場合、式を指定された型に変換する暗黙の型変換関数が挿入されます。例: `Hits UInt32 DEFAULT 0` は内部的には `Hits UInt32 DEFAULT toUInt32(0)` として表現されます。

デフォルト値の式 `expr` では、任意のテーブルカラムおよび定数を参照できます。ClickHouse は、テーブル構造の変更によって式の計算にループが導入されないことを検証します。INSERT 時には、式が解決可能であること、つまり式の計算に必要となるすべてのカラムが指定されていることを確認します。

### DEFAULT {#default}

`DEFAULT expr`

通常のデフォルト値です。INSERT クエリでこのカラムの値が指定されなかった場合、`expr` から計算されます。

例:

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    updated_at DateTime DEFAULT now(),
    updated_at_date Date DEFAULT toDate(updated_at)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test (id) VALUES (1);

SELECT * FROM test;
┌─id─┬──────────updated_at─┬─updated_at_date─┐
│  1 │ 2023-02-24 17:06:46 │      2023-02-24 │
└────┴─────────────────────┴─────────────────┘
```

### MATERIALIZED {#materialized}

`MATERIALIZED expr`

マテリアライズド式。行が挿入されるとき、これらの列の値は指定されたマテリアライズド式に従って自動的に計算されます。`INSERT` 時に値を明示的に指定することはできません。

また、この型のデフォルト値列は `SELECT *` の結果には含まれません。これは、`SELECT *` の結果を常に `INSERT` を使ってテーブルにそのまま挿入し直せる、という不変条件を維持するためです。この挙動は、設定 `asterisk_include_materialized_columns` によって無効化できます。

例:

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    updated_at DateTime MATERIALIZED now(),
    updated_at_date Date MATERIALIZED toDate(updated_at)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test VALUES (1);

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

エフェメラル列。 この型の列はテーブルに保存されず、そこから `SELECT` することはできません。 エフェメラル列の唯一の目的は、それを利用して他の列のデフォルト値式を構築することです。

明示的に列を指定しない `INSERT` では、この型の列はスキップされます。 これは、`SELECT *` の結果を常に `INSERT` を使ってテーブルに挿入し直せるというインバリアントを維持するためです。

例:

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    unhexed String EPHEMERAL,
    hexed FixedString(4) DEFAULT unhex(unhexed)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test (id, unhexed) VALUES (1, '5a90b714');

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

計算カラム（同義語）。このタイプのカラムはテーブルに保存されず、値をINSERTすることはできません。

SELECTクエリでこのタイプのカラムを明示的に参照すると、クエリ実行時に`expr`から値が計算されます。デフォルトでは、`SELECT *`はALIASカラムを除外します。この動作は設定`asterisk_include_alias_columns`で無効化できます。

ALTERクエリを使用して新しいカラムを追加する場合、これらのカラムの古いデータは書き込まれません。代わりに、新しいカラムの値を持たない古いデータを読み取る際、デフォルトでは式がその場で計算されます。ただし、式の実行にクエリで指定されていない別のカラムが必要な場合、それらのカラムも追加で読み取られますが、必要なデータブロックに対してのみ行われます。

テーブルに新しいカラムを追加した後、そのデフォルト式を変更すると、古いデータに使用される値が変更されます（ディスクに値が保存されていないデータの場合）。なお、バックグラウンドマージの実行時、マージ対象のパーツの一方に存在しないカラムのデータは、マージされたパーツに書き込まれることに注意してください。

ネストされたデータ構造の要素にデフォルト値を設定することはできません。

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

## プライマリキー {#primary-key}

テーブル作成時に[プライマリキー](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries)を定義できます。プライマリキーは次の 2 通りの方法で指定できます。

* 列リスト内で指定する

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...,
    PRIMARY KEY(expr1[, expr2,...])
)
ENGINE = engine;
```

* 列リスト外

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
PRIMARY KEY(expr1[, expr2,...]);
```

:::tip
1 つのクエリで両方の方法を併用することはできません。
:::

## 制約 {#constraints}

カラムの説明に加えて、制約を定義することもできます。

### CONSTRAINT {#constraint}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [compression_codec] [TTL expr1],
    ...
    CONSTRAINT constraint_name_1 CHECK boolean_expr_1,
    ...
) ENGINE = engine
```

`boolean_expr_1` には任意のブール式を指定できます。テーブルに制約が定義されている場合、`INSERT` クエリで挿入される各行に対して、それぞれの制約が検証されます。いずれかの制約が満たされない場合、サーバーは制約名と検証に使用された式を含む例外をスローします。

大量の制約を追加すると、大規模な `INSERT` クエリのパフォーマンスに悪影響を与える可能性があります。

### ASSUME {#assume}

`ASSUME` 句は、常に真であると仮定されるテーブル上の `CONSTRAINT` を定義するために使用されます。この制約は、その後オプティマイザによって SQL クエリのパフォーマンスを向上させるために利用できます。

次の例では、`users_a` テーブルを作成する際に `ASSUME CONSTRAINT` を使用しています。

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

ここで、`ASSUME CONSTRAINT` は、`length(name)` 関数が常に `name_len` カラムの値と等しいと仮定するために使用されています。これは、クエリ内で `length(name)` が呼び出されるたびに、ClickHouse がそれを `name_len` に置き換えることができることを意味します。`length()` 関数の呼び出しを避けられるため、その方が高速になるはずです。

次に、クエリ `SELECT name FROM users_a WHERE length(name) < 5;` を実行するとき、ClickHouse は `ASSUME CONSTRAINT` によって、これを `SELECT name FROM users_a WHERE name_len < 5;` に最適化できます。これにより、各行について `name` の長さを計算する処理を避けられるため、クエリの実行が速くなる可能性があります。

`ASSUME CONSTRAINT` は **制約を強制しません**。単にオプティマイザに対して、その制約が成り立つことを知らせるだけです。もし制約が実際には成り立たない場合、クエリ結果が不正確になる可能性があります。したがって、制約が正しいと確信できる場合にのみ `ASSUME CONSTRAINT` を使用すべきです。

## TTL Expression {#ttl-expression}

値の保持期間を定義します。MergeTree ファミリーのテーブルに対してのみ指定できます。詳細については、[列およびテーブルの TTL](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) を参照してください。

## 列圧縮コーデック {#column_compression_codec}

デフォルトでは、セルフマネージド版の ClickHouse では `lz4` 圧縮が、ClickHouse Cloud では `zstd` 圧縮が適用されます。

`MergeTree` エンジンファミリーでは、サーバー設定の [compression](/operations/server-configuration-parameters/settings#compression) セクションでデフォルトの圧縮方式を変更できます。

また、`CREATE TABLE` クエリ内で各列ごとに圧縮方式を定義することもできます。

```sql
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

`Default` コーデックを指定すると、デフォルトの圧縮方式を使用できます。これは実行時のさまざまな設定（およびデータの特性）に依存する場合があります。
例: `value UInt64 CODEC(Default)` — コーデック指定がない場合と同じです。

また、列から現在の CODEC を削除し、config.xml で定義されたデフォルトの圧縮方式を使用することもできます:

```sql
ALTER TABLE codec_example MODIFY COLUMN float_value CODEC(Default);
```

Codec はパイプラインで組み合わせることができます。たとえば `CODEC(Delta, Default)` のように指定します。

:::tip
`lz4` のような外部ユーティリティでは ClickHouse のデータベースファイルを伸長することはできません。代わりに、専用ユーティリティ [clickhouse-compressor](https://github.com/ClickHouse/ClickHouse/tree/master/programs/compressor) を使用してください。
:::

次のテーブルエンジンで圧縮がサポートされています。

* [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) ファミリー。カラム圧縮 codec と、[compression](/operations/server-configuration-parameters/settings#compression) 設定によるデフォルト圧縮方式の選択をサポートします。
* [Log](../../../engines/table-engines/log-family/index.md) ファミリー。デフォルトで `lz4` 圧縮方式を使用し、カラム圧縮 codec をサポートします。
* [Set](../../../engines/table-engines/special/set.md)。デフォルト圧縮のみサポートします。
* [Join](../../../engines/table-engines/special/join.md)。デフォルト圧縮のみサポートします。

ClickHouse は、汎用 codec と用途特化 codec の両方をサポートします。

### 汎用 Codec {#general-purpose-codecs}

#### NONE {#none}

`NONE` — 圧縮しません。

#### LZ4 {#lz4}

`LZ4` — デフォルトで使用されるロスレス[データ圧縮アルゴリズム](https://github.com/lz4/lz4)です。LZ4 の高速圧縮を適用します。

#### LZ4HC {#lz4hc}

`LZ4HC[(level)]` — 圧縮レベルを指定できる LZ4 HC (High Compression) アルゴリズムです。デフォルトレベル: 9。`level <= 0` を指定するとデフォルトレベルが適用されます。指定可能なレベル: [1, 12]。推奨レベル範囲: [4, 9]。

#### ZSTD {#zstd}

`ZSTD[(level)]` — 可変 `level` を持つ [ZSTD 圧縮アルゴリズム](https://en.wikipedia.org/wiki/Zstandard) です。指定可能なレベル: [1, 22]。デフォルトレベル: 1。

高い圧縮レベルは、一度圧縮しておき、そのデータを繰り返し伸長するといった非対称なシナリオで有用です。レベルを上げると圧縮率は向上しますが、CPU 使用率も増加します。

#### ZSTD&#95;QAT {#zstd_qat}

<CloudNotSupportedBadge />

`ZSTD_QAT[(level)]` — [Intel® QATlib](https://github.com/intel/qatlib) および [Intel® QAT ZSTD Plugin](https://github.com/intel/QAT-ZSTD-Plugin) で実装された、レベルを指定できる [ZSTD 圧縮アルゴリズム](https://en.wikipedia.org/wiki/Zstandard) です。指定可能なレベル: [1, 12]。デフォルトレベル: 1。推奨レベル範囲: [6, 12]。いくつかの制限があります。

* ZSTD&#95;QAT はデフォルトでは無効で、設定項目 [enable&#95;zstd&#95;qat&#95;codec](../../../operations/settings/settings.md#enable_zstd_qat_codec) を有効化して初めて使用できます。
* 圧縮時、ZSTD&#95;QAT は Intel® QAT オフロードデバイス（[QuickAssist Technology](https://www.intel.com/content/www/us/en/developer/topic-technology/open/quick-assist-technology/overview.html)）の利用を試みます。そのようなデバイスが見つからない場合は、ソフトウェアによる ZSTD 圧縮にフォールバックします。
* 伸長は常にソフトウェアで実行されます。

#### DEFLATE&#95;QPL {#deflate_qpl}

<CloudNotSupportedBadge />

`DEFLATE_QPL` — Intel® Query Processing Library によって実装された [Deflate 圧縮アルゴリズム](https://github.com/intel/qpl) です。いくつかの制限があります。

- DEFLATE_QPL はデフォルトでは無効になっており、設定 [enable_deflate_qpl_codec](../../../operations/settings/settings.md#enable_deflate_qpl_codec) を有効化した後にのみ使用できます。
- DEFLATE_QPL には、SSE 4.2 命令でコンパイルされた ClickHouse ビルドが必要です（デフォルトでそのようにビルドされています）。詳細は [Build Clickhouse with DEFLATE_QPL](/development/building_and_benchmarking_deflate_qpl) を参照してください。
- DEFLATE_QPL は、システムに Intel® IAA (In-Memory Analytics Accelerator) オフロードデバイスがある場合に最も効果的に動作します。詳細は [Accelerator Configuration](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration) および [Benchmark with DEFLATE_QPL](/development/building_and_benchmarking_deflate_qpl) を参照してください。
- DEFLATE_QPL で圧縮されたデータは、SSE 4.2 を有効にしてコンパイルされた ClickHouse ノード間でのみ転送できます。

### Specialized Codecs {#specialized-codecs}

これらのコーデックは、データの特定の特徴を利用して圧縮をより効果的にするよう設計されています。これらのコーデックの一部は自分自身ではデータを圧縮せず、汎用コーデックを用いた第 2 段階の圧縮でより高い圧縮率を得られるように、あらかじめデータを前処理します。

#### Delta {#delta}

`Delta(delta_bytes)` — 生の値を、直前の値との差分で置き換える圧縮手法です。先頭の値だけは変更されません。`delta_bytes` は生の値の最大サイズであり、デフォルト値は `sizeof(type)` です。`delta_bytes` を引数として指定する方法は非推奨であり、将来のリリースでサポートは削除されます。Delta はデータ準備用コーデックであり、単独では使用できません。

#### DoubleDelta {#doubledelta}

`DoubleDelta(bytes_size)` — 差分の差分を計算し、それをコンパクトなバイナリ形式で書き込みます。`bytes_size` は [Delta](#delta) コーデックにおける `delta_bytes` と同様の意味を持ちます。`bytes_size` を引数として指定する方法は非推奨であり、将来のリリースでサポートは削除されます。一定のステップ幅を持つ単調増加（または単調減少）系列、例えば時系列データに対して最適な圧縮率が得られます。任意の数値型で使用できます。Gorilla TSDB で使用されているアルゴリズムを実装し、64 ビット型をサポートするように拡張しています。32 ビットのデルタに対しては、4 ビット接頭辞ではなく 5 ビット接頭辞を使用するため、1 ビット余分に使用します。詳細については、[Gorilla: A Fast, Scalable, In-Memory Time Series Database](http://www.vldb.org/pvldb/vol8/p1816-teller.pdf) の「Compressing Time Stamps」を参照してください。DoubleDelta はデータ準備用コーデックであり、単独では使用できません。

#### GCD {#gcd}

`GCD()` - - 列内の値の最大公約数 (GCD) を計算し、各値をその GCD で割ります。整数、Decimal、日付/時刻の列で使用できます。このコーデックは、値が GCD の倍数単位で変化（増加または減少）する列、例: 24, 28, 16, 24, 8, 24 (GCD = 4) に適しています。GCD はデータ準備用コーデックであり、単独では使用できません。

#### Gorilla {#gorilla}

`Gorilla(bytes_size)` — 現在の浮動小数点値と直前の浮動小数点値の XOR を計算し、それをコンパクトなバイナリ形式で書き込みます。連続する値同士の差、すなわち系列の値の変化が小さい（遅い）ほど、圧縮率は高くなります。Gorilla TSDB で使用されているアルゴリズムを実装し、64 ビット型をサポートするように拡張しています。`bytes_size` に指定可能な値は 1, 2, 4, 8 で、デフォルト値は 1, 2, 4, 8 のいずれかと等しい場合は `sizeof(type)` です。それ以外の場合は 1 になります。詳細は [Gorilla: A Fast, Scalable, In-Memory Time Series Database](https://doi.org/10.14778/2824032.2824078) の 4.1 節を参照してください。

#### FPC {#fpc}

`FPC(level, float_size)` - 2種類の予測器のうち優れている方を用いて系列中の次の浮動小数点値を繰り返し予測し、その予測値と実際の値を XOR し、その結果を先頭ゼロ圧縮するコーデックです。Gorilla と同様に、ゆっくり変化する浮動小数点値の系列を保存する場合に効率的です。64ビット値（double）の場合、FPC は Gorilla より高速であり、32ビット値の場合は状況によって異なります。`level` に指定可能な値は 1-28 で、デフォルト値は 12 です。`float_size` に指定可能な値は 4, 8 で、型が Float の場合のデフォルト値は `sizeof(type)` です。それ以外のすべてのケースでは 4 になります。アルゴリズムの詳細な説明については [High Throughput Compression of Double-Precision Floating-Point Data](https://userweb.cs.txstate.edu/~burtscher/papers/dcc07a.pdf) を参照してください。

#### T64 {#t64}

`T64` — 整数データ型（`Enum`、`Date`、`DateTime` を含む）の値において未使用の上位ビットを切り詰める圧縮手法です。アルゴリズムの各ステップで、コーデックは 64 個の値のブロックを取り出し、それらを 64x64 ビット行列に配置して転置し、未使用ビットを切り詰め、残りをシーケンスとして返します。未使用ビットとは、この圧縮の対象となるデータ部分全体において、最大値と最小値の間で変化しないビットを指します。

`DoubleDelta` と `Gorilla` コーデックは、Gorilla TSDB でその圧縮アルゴリズムの構成要素として使用されています。Gorilla の手法は、タイムスタンプ付きのゆっくり変化する値の系列があるシナリオで効果的です。タイムスタンプは `DoubleDelta` コーデックで効率的に圧縮され、値は `Gorilla` コーデックで効率的に圧縮されます。例えば、効率的に保存されるテーブルとするには、次の構成でテーブルを作成できます。

```sql
CREATE TABLE codec_example
(
    timestamp DateTime CODEC(DoubleDelta),
    slow_values Float32 CODEC(Gorilla)
)
ENGINE = MergeTree()
```

### 暗号化コーデック {#encryption-codecs}

これらのコーデックは実際にはデータを圧縮せず、代わりにディスク上のデータを暗号化します。これらは [encryption](/operations/server-configuration-parameters/settings#encryption) 設定で暗号化キーが指定されている場合にのみ利用可能です。暗号化されたデータは通常、有意義な形で圧縮することができないため、暗号化はコーデックパイプラインの末尾でのみ意味を持つことに注意してください。

暗号化コーデック：

#### AES&#95;128&#95;GCM&#95;SIV {#aes_128_gcm_siv}

`CODEC('AES-128-GCM-SIV')` — [RFC 8452](https://tools.ietf.org/html/rfc8452) で定義されている GCM-SIV モードの AES-128 でデータを暗号化します。

#### AES-256-GCM-SIV {#aes-256-gcm-siv}

`CODEC('AES-256-GCM-SIV')` — GCM-SIV モードの AES-256 でデータを暗号化します。

これらのコーデックは固定ノンスを使用するため、暗号化は決定的（deterministic）になります。これは [ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md) のような重複排除エンジンと互換性がありますが、弱点もあります。同じデータブロックを 2 回暗号化すると、得られる暗号文は完全に同一になるため、ディスクを読み取れる攻撃者は、この同一性を確認できます（ただし内容そのものではなく、同一であることだけが分かります）。

:::note
「*MergeTree」ファミリーを含むほとんどのエンジンは、コーデックを適用せずにディスク上にインデックスファイルを作成します。つまり、暗号化されたカラムがインデックスされている場合、その値の平文がディスク上に現れることになります。
:::

:::note
暗号化されたカラムに対して特定の値を指定する SELECT クエリ（WHERE 句など）を実行すると、その値が [system.query&#95;log](../../../operations/system-tables/query_log.md) に記録される可能性があります。必要に応じてログ記録を無効化することを検討してください。
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
圧縮が必要な場合は、明示的に指定してください。指定しない場合は、データには暗号化のみが適用されます。
:::

**例**

```sql
CREATE TABLE mytable
(
    x String CODEC(Delta, LZ4, AES_128_GCM_SIV)
)
ENGINE = MergeTree ORDER BY x;
```

## 一時テーブル {#temporary-tables}

:::note
一時テーブルはレプリケートされない点に注意してください。そのため、一時テーブルに挿入されたデータが他のレプリカで利用可能であることは保証されません。一時テーブルが有用となる主なユースケースは、単一セッション中に小規模な外部データセットに対してクエリや結合を行う場合です。
:::

ClickHouse は、次の特性を持つ一時テーブルをサポートします。

* 一時テーブルは、セッション終了時に消滅します。これは接続が失われた場合も含みます。
* エンジンが指定されていない場合、一時テーブルは Memory テーブルエンジンを使用します。また、Replicated エンジンおよび `KeeperMap` エンジン以外の任意のテーブルエンジンを使用できます。
* 一時テーブルにはデータベース名を指定できません。いずれのデータベースにも属さない形で作成されます。
* すべてのクラスタサーバー上で分散 DDL クエリ（`ON CLUSTER` の使用）により一時テーブルを作成することはできません。このテーブルは現在のセッション内にのみ存在します。
* 一時テーブルが他のテーブルと同じ名前を持ち、クエリでデータベースを指定せずにテーブル名のみを指定した場合、一時テーブルが使用されます。
* 分散クエリ処理において、クエリで使用される Memory エンジンの一時テーブルはリモートサーバーに渡されます。

一時テーブルを作成するには、次の構文を使用します。

```sql
CREATE [OR REPLACE] TEMPORARY TABLE [IF NOT EXISTS] table_name
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) [ENGINE = engine]
```

ほとんどの場合、一時テーブルは手動で作成するのではなく、クエリで外部データを使用する場合や、分散 `(GLOBAL) IN` のために使用する場合に自動的に作成されます。詳しくは、該当するセクションを参照してください。

一時テーブルの代わりに、[ENGINE = Memory](../../../engines/table-engines/special/memory.md) を使用したテーブルを利用することもできます。

## REPLACE TABLE {#replace-table}

`REPLACE` ステートメントを使用すると、テーブルを[アトミックに](/concepts/glossary#atomicity)更新できます。

:::note
このステートメントは、[`Atomic`](../../../engines/database-engines/atomic.md) と [`Replicated`](../../../engines/database-engines/replicated.md) の各データベースエンジンでサポートされています。
これらはそれぞれ、ClickHouse および ClickHouse Cloud のデフォルトのデータベースエンジンです。
:::

通常、テーブルから一部のデータだけを削除する必要がある場合は、
新しいテーブルを作成し、不要なデータを取得しない `SELECT` ステートメントで新しいテーブルにデータを投入してから、
古いテーブルを削除し、新しいテーブルにリネームします。
このアプローチは、以下の例で示されています。

```sql
CREATE TABLE myNewTable AS myOldTable;

INSERT INTO myNewTable
SELECT * FROM myOldTable 
WHERE CounterID <12345;

DROP TABLE myOldTable;

RENAME TABLE myNewTable TO myOldTable;
```

上記の方法の代わりに、デフォルトのデータベースエンジンを使用している場合は `REPLACE` を使って同じ結果を得ることもできます。

```sql
REPLACE TABLE myOldTable
ENGINE = MergeTree()
ORDER BY CounterID 
AS
SELECT * FROM myOldTable
WHERE CounterID <12345;
```

### 構文 {#syntax}

```sql
{CREATE [OR REPLACE] | REPLACE} TABLE [db.]table_name
```

:::note
`CREATE` 文のすべての構文形式は、このステートメントでも使用できます。存在しないテーブルに対して `REPLACE` を実行するとエラーになります。
:::

### 例: {#examples}

<Tabs>
  <TabItem value="clickhouse_replace_example" label="ローカル" default>
    次のテーブルを例にします。

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

    `REPLACE` 文を使用すると、すべてのデータを消去できます。

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

    また、`REPLACE` 文を使用してテーブルの構造を変更することもできます。

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

  <TabItem value="cloud_replace_example" label="Cloud">
    ClickHouse Cloud 上に次のテーブルがあるとします。

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

    1    test
    ```

    `REPLACE` 文を使用すると、すべてのデータを消去できます。

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

    また、`REPLACE` 文を使用してテーブルの構造を変更することもできます。

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

テーブル作成時にコメントを追加できます。

**構文**

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
COMMENT 'Comment'
```

**例**

クエリ：

```sql
CREATE TABLE t1 (x String) ENGINE = Memory COMMENT '一時テーブル';
SELECT name, comment FROM system.tables WHERE name = 't1';
```

結果:

```text
┌─name─┬─comment─────────────┐
│ t1   │ 一時テーブル │
└──────┴─────────────────────┘
```

## 関連コンテンツ {#related-content}

- ブログ記事: [スキーマとコーデックによる ClickHouse の最適化](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- ブログ記事: [ClickHouse における時系列データの取り扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
