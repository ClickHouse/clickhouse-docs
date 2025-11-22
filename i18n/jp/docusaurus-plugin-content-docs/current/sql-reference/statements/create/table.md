---
description: 'テーブルに関するドキュメント'
keywords: ['compression', 'codec', 'schema', 'DDL']
sidebar_label: 'TABLE'
sidebar_position: 36
slug: /sql-reference/statements/create/table
title: 'CREATE TABLE'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

新しいテーブルを作成します。このクエリはユースケースに応じて、さまざまな構文形式を取ることができます。

既定では、テーブルは現在のサーバー上にのみ作成されます。分散 DDL クエリは `ON CLUSTER` 句として実装されており、[別途説明されています](../../../sql-reference/distributed-ddl.md)。


## 構文形式 {#syntax-forms}

### 明示的なスキーマの指定 {#with-explicit-schema}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr1] [COMMENT 'comment for column'] [compression_codec] [TTL expr1],
    name2 [type2] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr2] [COMMENT 'comment for column'] [compression_codec] [TTL expr2],
    ...
) ENGINE = engine
  [COMMENT 'comment for table']
```

`db`データベース内に`table_name`という名前のテーブルを作成します。`db`が指定されていない場合は現在のデータベースに作成されます。テーブルは括弧内で指定された構造と`engine`エンジンを持ちます。
テーブルの構造は、カラムの定義、セカンダリインデックス、および制約のリストです。エンジンが[プライマリキー](#primary-key)をサポートしている場合、テーブルエンジンのパラメータとして指定されます。

最も単純な場合、カラムの定義は`name type`の形式です。例：`RegionID UInt32`。

デフォルト値の式も定義できます（後述）。

必要に応じて、1つ以上のキー式でプライマリキーを指定できます。

カラムとテーブルにコメントを追加できます。

### 他のテーブルと同じスキーマの指定 {#with-a-schema-similar-to-other-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine]
```

別のテーブルと同じ構造のテーブルを作成します。テーブルに異なるエンジンを指定できます。エンジンが指定されていない場合、`db2.name2`テーブルと同じエンジンが使用されます。

### 他のテーブルからスキーマとデータを複製 {#with-a-schema-and-data-cloned-from-another-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name CLONE AS [db2.]name2 [ENGINE = engine]
```

別のテーブルと同じ構造のテーブルを作成します。テーブルに異なるエンジンを指定できます。エンジンが指定されていない場合、`db2.name2`テーブルと同じエンジンが使用されます。 新しいテーブルが作成された後、`db2.name2`のすべてのパーティションがアタッチされます。つまり、`db2.name2`のデータは作成時に`db.table_name`に複製されます。このクエリは以下と同等です：

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine];
ALTER TABLE [db.]table_name ATTACH PARTITION ALL FROM [db2].name2;
```

### テーブル関数からの作成 {#from-a-table-function}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS table_function()
```

指定された[テーブル関数](/sql-reference/table-functions)と同じ結果を持つテーブルを作成します。作成されたテーブルは、指定された対応するテーブル関数と同じように動作します。

### SELECTクエリからの作成 {#from-select-query}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name[(name1 [type1], name2 [type2], ...)] ENGINE = engine AS SELECT ...
```

`SELECT`クエリの結果と同じ構造を持つテーブルを`engine`エンジンで作成し、`SELECT`からのデータで埋めます。また、カラムの定義を明示的に指定することもできます。

テーブルが既に存在し、`IF NOT EXISTS`が指定されている場合、クエリは何も実行しません。

クエリ内の`ENGINE`句の後に他の句を含めることができます。テーブルの作成方法の詳細については、[テーブルエンジン](/engines/table-engines)の説明を参照してください。

**例**

クエリ：

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


## NULLまたはNOT NULL修飾子 {#null-or-not-null-modifiers}

カラム定義においてデータ型の後に指定する`NULL`および`NOT NULL`修飾子は、そのカラムを[Nullable](/sql-reference/data-types/nullable)にできるかどうかを制御します。

型が`Nullable`でない場合、`NULL`を指定すると`Nullable`として扱われます。`NOT NULL`を指定した場合は、`Nullable`にはなりません。例えば、`INT NULL`は`Nullable(INT)`と同じです。型がすでに`Nullable`である場合に`NULL`または`NOT NULL`修飾子を指定すると、例外がスローされます。

関連設定として[data_type_default_nullable](../../../operations/settings/settings.md#data_type_default_nullable)も参照してください。


## デフォルト値 {#default_values}

カラムの定義では、`DEFAULT expr`、`MATERIALIZED expr`、または`ALIAS expr`の形式でデフォルト値式を指定できます。例:`URLDomain String DEFAULT domain(URL)`

式`expr`は省略可能です。省略した場合、カラムの型を明示的に指定する必要があり、デフォルト値は数値型カラムでは`0`、文字列型カラムでは`''`(空文字列)、配列型カラムでは`[]`(空配列)、日付型カラムでは`1970-01-01`、nullable型カラムでは`NULL`となります。

デフォルト値を持つカラムの型は省略可能で、その場合は`expr`の型から推論されます。例えば、`EventDate DEFAULT toDate(EventTime)`というカラムの型は日付型になります。

データ型とデフォルト値式の両方が指定されている場合、式を指定された型に変換する暗黙的な型変換関数が挿入されます。例:`Hits UInt32 DEFAULT 0`は内部的に`Hits UInt32 DEFAULT toUInt32(0)`として表現されます。

デフォルト値式`expr`は、任意のテーブルカラムと定数を参照できます。ClickHouseは、テーブル構造の変更が式の計算にループを導入しないことを確認します。INSERTの場合、式が解決可能であること、つまり計算元となるすべてのカラムが渡されていることを確認します。

### DEFAULT {#default}

`DEFAULT expr`

通常のデフォルト値です。INSERTクエリでこのカラムの値が指定されていない場合、`expr`から計算されます。

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

マテリアライズド式です。このカラムの値は、行が挿入される際に指定されたマテリアライズド式に従って自動的に計算されます。`INSERT`時に値を明示的に指定することはできません。

また、この型のデフォルト値カラムは`SELECT *`の結果に含まれません。これは、`SELECT *`の結果を常に`INSERT`を使用してテーブルに挿入できるという不変条件を保持するためです。この動作は設定`asterisk_include_materialized_columns`で無効化できます。

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

エフェメラルカラムです。この型のカラムはテーブルに保存されず、SELECTすることもできません。エフェメラルカラムの唯一の目的は、他のカラムのデフォルト値式を構築することです。

カラムを明示的に指定しないINSERTでは、この型のカラムはスキップされます。これは、`SELECT *`の結果を常に`INSERT`を使用してテーブルに挿入できるという不変条件を保持するためです。

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

```


1 行目:
──────
id:         1
hexed:      Z��
hex(hexed): 5A90B714

````

### ALIAS {#alias}

`ALIAS expr`

計算カラム(シノニム)。このタイプのカラムはテーブルに保存されず、値をINSERTすることはできません。

SELECTクエリでこのタイプのカラムを明示的に参照すると、クエリ実行時に`expr`から値が計算されます。デフォルトでは、`SELECT *`はALIASカラムを除外します。この動作は設定`asterisk_include_alias_columns`で無効化できます。

ALTERクエリを使用して新しいカラムを追加する場合、これらのカラムの古いデータは書き込まれません。代わりに、新しいカラムの値を持たない古いデータを読み取る際、デフォルトでは式が動的に計算されます。ただし、式の実行にクエリで指定されていない別のカラムが必要な場合、それらのカラムは追加で読み取られますが、必要とするデータブロックに対してのみ行われます。

テーブルに新しいカラムを追加した後、そのデフォルト式を変更すると、古いデータに使用される値が変更されます(ディスクに値が保存されていなかったデータの場合)。バックグラウンドマージの実行時、マージ対象のパートの一方に存在しないカラムのデータは、マージされたパートに書き込まれることに注意してください。

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
````


## プライマリキー {#primary-key}

テーブル作成時に[プライマリキー](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries)を定義できます。プライマリキーの指定方法は2通りあります:

- カラムリスト内

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...,
    PRIMARY KEY(expr1[, expr2,...])
)
ENGINE = engine;
```

- カラムリスト外

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
PRIMARY KEY(expr1[, expr2,...]);
```

:::tip
1つのクエリ内で両方の方法を併用することはできません。
:::


## 制約 {#constraints}

列の定義と併せて制約を定義できます:

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

`boolean_expr_1` には任意のブール式を指定できます。テーブルに制約が定義されている場合、`INSERT` クエリの各行に対してすべての制約がチェックされます。いずれかの制約が満たされない場合、サーバーは制約名とチェック式を含む例外を発生させます。

大量の制約を追加すると、大規模な `INSERT` クエリのパフォーマンスに悪影響を及ぼす可能性があります。

### ASSUME {#assume}

`ASSUME` 句は、真であると仮定される `CONSTRAINT` をテーブルに定義するために使用されます。この制約はオプティマイザによって利用され、SQL クエリのパフォーマンスを向上させることができます。

以下は、`users_a` テーブルの作成時に `ASSUME CONSTRAINT` を使用する例です:

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

ここでは、`ASSUME CONSTRAINT` を使用して、`length(name)` 関数が常に `name_len` 列の値と等しいことを宣言しています。これにより、クエリ内で `length(name)` が呼び出されるたびに、ClickHouse はそれを `name_len` に置き換えることができます。`length()` 関数の呼び出しを回避できるため、より高速に処理されます。

その後、クエリ `SELECT name FROM users_a WHERE length(name) < 5;` を実行する際、ClickHouse は `ASSUME CONSTRAINT` により、これを `SELECT name FROM users_a WHERE name_len < 5;` に最適化できます。各行の `name` の長さを計算する必要がなくなるため、クエリの実行が高速化されます。

`ASSUME CONSTRAINT` は**制約を強制しません**。単にオプティマイザに制約が真であることを通知するだけです。制約が実際には真でない場合、クエリの結果が不正確になる可能性があります。したがって、制約が真であることが確実な場合にのみ `ASSUME CONSTRAINT` を使用してください。


## TTL式 {#ttl-expression}

値の保存期間を定義します。MergeTreeファミリーのテーブルでのみ指定できます。詳細については、[カラムとテーブルのTTL](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)を参照してください。


## カラム圧縮コーデック {#column_compression_codec}

デフォルトでは、ClickHouseはセルフマネージド版で`lz4`圧縮を、ClickHouse Cloudでは`zstd`を適用します。

`MergeTree`エンジンファミリーでは、サーバー設定の[compression](/operations/server-configuration-parameters/settings#compression)セクションでデフォルトの圧縮方式を変更できます。

また、`CREATE TABLE`クエリで各カラムごとに圧縮方式を定義することもできます。

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

`Default`コーデックを指定すると、実行時に異なる設定(およびデータの特性)に依存するデフォルト圧縮を参照できます。
例: `value UInt64 CODEC(Default)` — コーデック指定がない場合と同じです。

また、カラムから現在のCODECを削除し、config.xmlのデフォルト圧縮を使用することもできます:

```sql
ALTER TABLE codec_example MODIFY COLUMN float_value CODEC(Default);
```

コーデックはパイプラインで組み合わせることができます。例: `CODEC(Delta, Default)`

:::tip
`lz4`のような外部ユーティリティでClickHouseデータベースファイルを解凍することはできません。代わりに、専用の[clickhouse-compressor](https://github.com/ClickHouse/ClickHouse/tree/master/programs/compressor)ユーティリティを使用してください。
:::

圧縮は以下のテーブルエンジンでサポートされています:

- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)ファミリー。カラム圧縮コーデックをサポートし、[compression](/operations/server-configuration-parameters/settings#compression)設定によるデフォルト圧縮方式の選択が可能です。
- [Log](../../../engines/table-engines/log-family/index.md)ファミリー。デフォルトで`lz4`圧縮方式を使用し、カラム圧縮コーデックをサポートします。
- [Set](../../../engines/table-engines/special/set.md)。デフォルト圧縮のみサポートします。
- [Join](../../../engines/table-engines/special/join.md)。デフォルト圧縮のみサポートします。

ClickHouseは汎用コーデックと特殊コーデックをサポートしています。

### 汎用コーデック {#general-purpose-codecs}

#### NONE {#none}

`NONE` — 圧縮なし。

#### LZ4 {#lz4}

`LZ4` — デフォルトで使用される可逆[データ圧縮アルゴリズム](https://github.com/lz4/lz4)。LZ4高速圧縮を適用します。

#### LZ4HC {#lz4hc}

`LZ4HC[(level)]` — 設定可能なレベルを持つLZ4 HC(高圧縮)アルゴリズム。デフォルトレベル: 9。`level <= 0`を設定するとデフォルトレベルが適用されます。可能なレベル: \[1, 12\]。推奨レベル範囲: \[4, 9\]。

#### ZSTD {#zstd}

`ZSTD[(level)]` — 設定可能な`level`を持つ[ZSTD圧縮アルゴリズム](https://en.wikipedia.org/wiki/Zstandard)。可能なレベル: \[1, 22\]。デフォルトレベル: 1。

高圧縮レベルは、一度圧縮して繰り返し解凍するような非対称シナリオに有用です。レベルが高いほど圧縮率が向上しますが、CPU使用率も高くなります。

#### ZSTD_QAT {#zstd_qat}

<CloudNotSupportedBadge />

`ZSTD_QAT[(level)]` — [Intel® QATlib](https://github.com/intel/qatlib)および[Intel® QAT ZSTD Plugin](https://github.com/intel/QAT-ZSTD-Plugin)によって実装された、設定可能なレベルを持つ[ZSTD圧縮アルゴリズム](https://en.wikipedia.org/wiki/Zstandard)。可能なレベル: \[1, 12\]。デフォルトレベル: 1。推奨レベル範囲: \[6, 12\]。いくつかの制限があります:

- ZSTD_QATはデフォルトで無効になっており、設定[enable_zstd_qat_codec](../../../operations/settings/settings.md#enable_zstd_qat_codec)を有効にした後にのみ使用できます。
- 圧縮時、ZSTD_QATはIntel® QATオフロードデバイス([QuickAssist Technology](https://www.intel.com/content/www/us/en/developer/topic-technology/open/quick-assist-technology/overview.html))の使用を試みます。そのようなデバイスが見つからない場合は、ソフトウェアによるZSTD圧縮にフォールバックします。
- 解凍は常にソフトウェアで実行されます。

#### DEFLATE_QPL {#deflate_qpl}

<CloudNotSupportedBadge />

`DEFLATE_QPL` — Intel® Query Processing Libraryによって実装された[Deflate圧縮アルゴリズム](https://github.com/intel/qpl)。いくつかの制限があります:


- DEFLATE_QPLはデフォルトで無効になっており、設定項目[enable_deflate_qpl_codec](../../../operations/settings/settings.md#enable_deflate_qpl_codec)を有効にした後にのみ使用できます。
- DEFLATE_QPLは、SSE 4.2命令でコンパイルされたClickHouseビルドが必要です(デフォルトではこの条件を満たしています)。詳細については、[DEFLATE_QPLを使用したClickHouseのビルド](/development/building_and_benchmarking_deflate_qpl)を参照してください。
- DEFLATE_QPLは、システムにIntel® IAA(In-Memory Analytics Accelerator)オフロードデバイスがある場合に最も効果的に動作します。詳細については、[アクセラレータの設定](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration)および[DEFLATE_QPLを使用したベンチマーク](/development/building_and_benchmarking_deflate_qpl)を参照してください。
- DEFLATE_QPLで圧縮されたデータは、SSE 4.2を有効にしてコンパイルされたClickHouseノード間でのみ転送できます。

### 特殊コーデック {#specialized-codecs}

これらのコーデックは、データの特定の特性を活用することで、圧縮をより効果的にするように設計されています。これらのコーデックの一部は、データ自体を圧縮するのではなく、データを前処理することで、汎用コーデックを使用した第2段階の圧縮においてより高いデータ圧縮率を達成できるようにします。

#### Delta {#delta}

`Delta(delta_bytes)` — 生の値を隣接する2つの値の差分で置き換える圧縮手法です。ただし、最初の値は変更されません。`delta_bytes`は生の値の最大サイズで、デフォルト値は`sizeof(type)`です。引数として`delta_bytes`を指定することは非推奨であり、将来のリリースでサポートが削除される予定です。Deltaはデータ準備コーデックであり、単独では使用できません。

#### DoubleDelta {#doubledelta}

`DoubleDelta(bytes_size)` — 差分の差分を計算し、コンパクトなバイナリ形式で書き込みます。`bytes_size`は[Delta](#delta)コーデックの`delta_bytes`と同様の意味を持ちます。引数として`bytes_size`を指定することは非推奨であり、将来のリリースでサポートが削除される予定です。時系列データなど、一定の歩幅を持つ単調な数列に対して最適な圧縮率が得られます。任意の数値型で使用できます。Gorilla TSDBで使用されているアルゴリズムを実装し、64ビット型をサポートするように拡張しています。32ビットの差分に対して1ビット余分に使用します:4ビットプレフィックスの代わりに5ビットプレフィックスを使用します。詳細については、[Gorilla: A Fast, Scalable, In-Memory Time Series Database](http://www.vldb.org/pvldb/vol8/p1816-teller.pdf)のCompressing Time Stampsのセクションを参照してください。DoubleDeltaはデータ準備コーデックであり、単独では使用できません。

#### GCD {#gcd}

`GCD()` — カラム内の値の最大公約数(GCD)を計算し、各値をGCDで除算します。整数、小数、日付/時刻のカラムで使用できます。このコーデックは、GCDの倍数で変化(増加または減少)する値を持つカラムに適しています。例:24、28、16、24、8、24(GCD = 4)。GCDはデータ準備コーデックであり、単独では使用できません。

#### Gorilla {#gorilla}

`Gorilla(bytes_size)` — 現在の浮動小数点値と前の浮動小数点値の間のXORを計算し、コンパクトなバイナリ形式で書き込みます。連続する値の差が小さいほど、つまり系列の値の変化が遅いほど、圧縮率が向上します。Gorilla TSDBで使用されているアルゴリズムを実装し、64ビット型をサポートするように拡張しています。`bytes_size`の可能な値:1、2、4、8。デフォルト値は、1、2、4、または8に等しい場合は`sizeof(type)`です。それ以外の場合は1です。詳細については、[Gorilla: A Fast, Scalable, In-Memory Time Series Database](https://doi.org/10.14778/2824032.2824078)のセクション4.1を参照してください。

#### FPC {#fpc}


`FPC(level, float_size)` - 2つの予測器のうち優れた方を使用してシーケンス内の次の浮動小数点値を繰り返し予測し、実際の値と予測値をXOR演算し、結果を先頭ゼロ圧縮します。Gorillaと同様に、ゆっくりと変化する浮動小数点値の系列を格納する際に効率的です。64ビット値(double)の場合、FPCはGorillaより高速ですが、32ビット値の場合は状況によって異なります。`level`の指定可能な値: 1-28、デフォルト値は12です。`float_size`の指定可能な値: 4、8、デフォルト値は型がFloatの場合は`sizeof(type)`です。それ以外の場合は4です。アルゴリズムの詳細については、[High Throughput Compression of Double-Precision Floating-Point Data](https://userweb.cs.txstate.edu/~burtscher/papers/dcc07a.pdf)を参照してください。

#### T64 {#t64}

`T64` — 整数データ型(`Enum`、`Date`、`DateTime`を含む)の値の未使用の上位ビットを切り捨てる圧縮手法です。アルゴリズムの各ステップで、コーデックは64個の値のブロックを取得し、それらを64x64ビット行列に配置し、転置し、値の未使用ビットを切り捨て、残りをシーケンスとして返します。未使用ビットとは、圧縮が使用されるデータパート全体における最大値と最小値の間で差異がないビットのことです。

`DoubleDelta`および`Gorilla`コーデックは、Gorilla TSDBにおいてその圧縮アルゴリズムのコンポーネントとして使用されています。Gorillaアプローチは、タイムスタンプを伴うゆっくりと変化する値のシーケンスがある場合に効果的です。タイムスタンプは`DoubleDelta`コーデックによって効果的に圧縮され、値は`Gorilla`コーデックによって効果的に圧縮されます。例えば、効率的に格納されるテーブルを作成するには、次の構成で作成できます:

```sql
CREATE TABLE codec_example
(
    timestamp DateTime CODEC(DoubleDelta),
    slow_values Float32 CODEC(Gorilla)
)
ENGINE = MergeTree()
```

### 暗号化コーデック {#encryption-codecs}

これらのコーデックは実際にはデータを圧縮せず、ディスク上のデータを暗号化します。これらは[encryption](/operations/server-configuration-parameters/settings#encryption)設定で暗号化キーが指定されている場合にのみ使用できます。暗号化されたデータは通常、意味のある方法で圧縮できないため、暗号化はコーデックパイプラインの最後でのみ意味を持つことに注意してください。

暗号化コーデック:

#### AES_128_GCM_SIV {#aes_128_gcm_siv}

`CODEC('AES-128-GCM-SIV')` — [RFC 8452](https://tools.ietf.org/html/rfc8452) GCM-SIVモードでAES-128を使用してデータを暗号化します。

#### AES-256-GCM-SIV {#aes-256-gcm-siv}

`CODEC('AES-256-GCM-SIV')` — GCM-SIVモードでAES-256を使用してデータを暗号化します。

これらのコーデックは固定のnonceを使用するため、暗号化は決定論的です。これにより、[ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md)などの重複排除エンジンと互換性がありますが、弱点があります。同じデータブロックが2回暗号化されると、結果の暗号文は完全に同一になるため、ディスクを読み取ることができる攻撃者はこの等価性を確認できます(ただし、内容を取得することなく、等価性のみを確認できます)。

:::note
「\*MergeTree」ファミリーを含むほとんどのエンジンは、コーデックを適用せずにディスク上にインデックスファイルを作成します。これは、暗号化された列にインデックスが作成されている場合、平文がディスク上に表示されることを意味します。
:::

:::note
暗号化された列の特定の値を参照するSELECTクエリ(WHERE句など)を実行すると、その値が[system.query_log](../../../operations/system-tables/query_log.md)に表示される可能性があります。ログ記録を無効にすることを検討してください。
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
圧縮を適用する必要がある場合は、明示的に指定する必要があります。そうしないと、データには暗号化のみが適用されます。
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
一時テーブルはレプリケーションされないことに注意してください。そのため、一時テーブルに挿入されたデータが他のレプリカで利用可能になる保証はありません。一時テーブルが有用となる主なユースケースは、単一セッション中に小規模な外部データセットに対してクエリを実行したり結合したりする場合です。
:::

ClickHouseは以下の特性を持つ一時テーブルをサポートしています:

- 一時テーブルは、接続が失われた場合を含め、セッションが終了すると消失します。
- 一時テーブルは、エンジンが指定されていない場合はMemoryテーブルエンジンを使用し、ReplicatedおよびKeeperMapエンジンを除く任意のテーブルエンジンを使用できます。
- 一時テーブルにはデータベースを指定できません。データベースの外部に作成されます。
- すべてのクラスタサーバー上で分散DDLクエリ(`ON CLUSTER`を使用)を使用して一時テーブルを作成することはできません。このテーブルは現在のセッションにのみ存在します。
- 一時テーブルが別のテーブルと同じ名前を持ち、クエリがデータベースを指定せずにテーブル名を指定した場合、一時テーブルが使用されます。
- 分散クエリ処理では、クエリで使用されるMemoryエンジンを持つ一時テーブルはリモートサーバーに渡されます。

一時テーブルを作成するには、以下の構文を使用します:

```sql
CREATE [OR REPLACE] TEMPORARY TABLE [IF NOT EXISTS] table_name
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) [ENGINE = engine]
```

ほとんどの場合、一時テーブルは手動で作成されるのではなく、クエリに外部データを使用する場合や、分散`(GLOBAL) IN`の場合に作成されます。詳細については、該当するセクションを参照してください。

一時テーブルの代わりに[ENGINE = Memory](../../../engines/table-engines/special/memory.md)を持つテーブルを使用することも可能です。


## REPLACE TABLE {#replace-table}

`REPLACE`文を使用すると、テーブルを[アトミックに](/concepts/glossary#atomicity)更新できます。

:::note
この文は[`Atomic`](../../../engines/database-engines/atomic.md)および[`Replicated`](../../../engines/database-engines/replicated.md)データベースエンジンでサポートされています。
これらはそれぞれClickHouseとClickHouse Cloudのデフォルトデータベースエンジンです。
:::

通常、テーブルから一部のデータを削除する必要がある場合、
新しいテーブルを作成し、不要なデータを取得しない`SELECT`文でデータを投入し、
その後古いテーブルを削除して新しいテーブルの名前を変更します。
このアプローチは以下の例で示されています:

```sql
CREATE TABLE myNewTable AS myOldTable;

INSERT INTO myNewTable
SELECT * FROM myOldTable
WHERE CounterID <12345;

DROP TABLE myOldTable;

RENAME TABLE myNewTable TO myOldTable;
```

上記のアプローチの代わりに、`REPLACE`を使用して(デフォルトのデータベースエンジンを使用している場合)同じ結果を得ることができます:

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
`CREATE`文のすべての構文形式はこの文でも使用できます。存在しないテーブルに対して`REPLACE`を実行するとエラーが発生します。
:::

### 例: {#examples}

<Tabs>
<TabItem value="clickhouse_replace_example" label="Local" default>

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

`REPLACE`文を使用してすべてのデータをクリアできます:

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

または、`REPLACE`文を使用してテーブル構造を変更できます:

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

ClickHouse Cloud上の次のテーブルを考えてみましょう:

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

`REPLACE`文を使用してすべてのデータをクリアできます:

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

または、`REPLACE`文を使用してテーブル構造を変更できます:

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


## COMMENT句 {#comment-clause}

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

クエリ:

```sql
CREATE TABLE t1 (x String) ENGINE = Memory COMMENT 'The temporary table';
SELECT name, comment FROM system.tables WHERE name = 't1';
```

結果:

```text
┌─name─┬─comment─────────────┐
│ t1   │ The temporary table │
└──────┴─────────────────────┘
```


## 関連コンテンツ {#related-content}

- ブログ: [スキーマとコーデックを使用したClickHouseの最適化](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- ブログ: [ClickHouseでの時系列データの取り扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
