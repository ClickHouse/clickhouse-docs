---
slug: /sql-reference/statements/create/table
sidebar_position: 36
sidebar_label: テーブル
title: "テーブルを作成する"
keywords: [圧縮, コーデック, スキーマ, DDL]
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

新しいテーブルを作成します。このクエリは、使用ケースに応じてさまざまな構文形式を持つことができます。

デフォルトでは、テーブルは現在のサーバーにのみ作成されます。分散DDLクエリは、`ON CLUSTER`句として実装されており、[別途説明されています](../../../sql-reference/distributed-ddl.md)。
## 構文形式 {#syntax-forms}
### 明示的スキーマを持つ {#with-explicit-schema}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr1] [COMMENT 'columnのコメント'] [compression_codec] [TTL expr1],
    name2 [type2] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr2] [COMMENT 'columnのコメント'] [compression_codec] [TTL expr2],
    ...
) ENGINE = engine
  [COMMENT 'tableのコメント']
```

`db`データベースまたは`db`が設定されていない場合は現在のデータベースに`table_name`という名前のテーブルを作成し、構造は角括弧内に指定されたものとし、`engine`エンジンを使用します。
テーブルの構造は、カラムの説明のリスト、二次インデックス、および制約です。[主キー](#primary-key)がエンジンによってサポートされている場合、それはテーブルエンジンのパラメータとして示されます。

カラムの説明は、最も単純なケースでは`name type`です。例: `RegionID UInt32`。

デフォルト値のために式も定義できます（以下参照）。

必要に応じて、1つ以上のキー式を指定して主キーを指定できます。

コメントはカラムおよびテーブルに追加できます。
### 他のテーブルに似たスキーマを持つ {#with-a-schema-similar-to-other-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine]
```

他のテーブルと同じ構造のテーブルを作成します。テーブルに異なるエンジンを指定できます。エンジンが指定されていない場合は、`db2.name2`テーブルと同じエンジンが使用されます。
### 他のテーブルからスキーマとデータをクローンする {#with-a-schema-and-data-cloned-from-another-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name CLONE AS [db2.]name2 [ENGINE = engine]
```

他のテーブルと同じ構造のテーブルを作成します。テーブルに異なるエンジンを指定できます。エンジンが指定されていない場合は、`db2.name2`テーブルと同じエンジンが使用されます。新しいテーブルが作成されると、`db2.name2`からすべてのパーティションがそれにアタッチされます。言い換えれば、`db2.name2`のデータは`db.table_name`に作成時にクローンされます。このクエリは次のものと同等です：

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine];
ALTER TABLE [db.]table_name ATTACH PARTITION ALL FROM [db2].name2;
```
### テーブル関数から {#from-a-table-function}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS table_function()
```

指定された[テーブル関数](../../../sql-reference/table-functions/index.md#table-functions)と同じ結果のテーブルを作成します。作成されたテーブルは、指定された対応するテーブル関数と同じように機能します。
### SELECTクエリから {#from-select-query}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name[(name1 [type1], name2 [type2], ...)] ENGINE = engine AS SELECT ...
```

`SELECT`クエリの結果のような構造を持つテーブルを作成し、`engine`エンジンを使用し、それにデータを`SELECT`から入力します。また、カラムの説明を明示的に指定することもできます。

テーブルがすでに存在し、`IF NOT EXISTS`が指定されている場合、クエリは何も行いません。

クエリの`ENGINE`句の後に他の句を追加することができます。テーブルの作成方法の詳細な文書は、[テーブルエンジン](../../../engines/table-engines/index.md#table_engines)の説明にあります。

:::tip
ClickHouse Cloudにおいては、これを2つのステップに分けてください：
1. テーブル構造を作成する

  ```sql
  CREATE TABLE t1
  ENGINE = MergeTree
  ORDER BY ...
  # highlight-next-line
  EMPTY AS
  SELECT ...
  ```

2. テーブルにデータを入力する

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

カラム定義のデータ型の後の`NULL`および`NOT NULL`修飾子は、それを[Nullable](/sql-reference/data-types/nullable)とするかどうかを決定します。

型が`Nullable`でなく、`NULL`が指定された場合は`Nullable`として扱われます；`NOT NULL`が指定された場合はそうではありません。例えば、`INT NULL`は`Nullable(INT)`と同じです。型が`Nullable`であり、`NULL`または`NOT NULL`修飾子が指定された場合、例外がスローされます。

また、[data_type_default_nullable](../../../operations/settings/settings.md#data_type_default_nullable)設定も参照してください。
## デフォルト値 {#default_values}

カラムの説明において、`DEFAULT expr`、`MATERIALIZED expr`、または`ALIAS expr`の形式でデフォルト値の式を指定できます。例：`URLDomain String DEFAULT domain(URL)`。

式`expr`は省略可能です。省略した場合、カラムの型は明示的に指定する必要があり、デフォルト値は数値型カラムの場合は`0`、文字列型カラムの場合は`''`（空文字列）、配列型カラムの場合は`[]`（空配列）、日付型カラムの場合は`1970-01-01`、またはnullableカラムの場合は`NULL`となります。

デフォルト値カラムのカラム型は省略可能で、その場合は`expr`の型から推測されます。例えば、`EventDate DEFAULT toDate(EventTime)`のカラムの型は日付となります。

データ型とデフォルト値の式の両方が指定された場合、指定された型に変換する暗黙の型キャスト関数が挿入されます。例：`Hits UInt32 DEFAULT 0`は内部的には`Hits UInt32 DEFAULT toUInt32(0)`として表現されます。

デフォルト値の式`expr`は任意のテーブルカラムおよび定数を参照できます。ClickHouseは、テーブル構造の変更が式の計算にループを導入しないことを確認します。INSERTの場合、すべてのカラムが渡されているかどうかを確認します。
### DEFAULT {#default}

`DEFAULT expr`

通常のデフォルト値です。このカラムの値がINSERTクエリで指定されていない場合、`expr`から計算されます。

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

マテリアライズされた式です。このタイプのカラムの値は、行が挿入されるときに、指定されたマテリアライズされた式に従って自動的に計算されます。`INSERT`の際に値を明示的に指定することはできません。

また、このタイプのデフォルト値カラムは、`SELECT *`の結果に含まれません。これは、`SELECT *`の結果を常にテーブルに`INSERT`し戻すことができるという不変性を保持するためです。この動作は、設定`asterisk_include_materialized_columns`で無効にできます。

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

エフェメラルカラムです。このタイプのカラムはテーブルに保存されず、そこからSELECTすることもできません。エフェメラルカラムの唯一の目的は、他のカラムのデフォルト値式を構築することです。

明示的に指定されたカラムがないINSERTは、このタイプのカラムをスキップします。これは、`SELECT *`の結果を常にテーブルに`INSERT`し戻すことができるという不変性を保持するためです。

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

計算されたカラム（同義語）です。このタイプのカラムはテーブルに保存されず、値をINSERTすることもできません。

SELECTクエリがこのタイプのカラムを明示的に参照する場合、値はクエリ時に`expr`から計算されます。デフォルトでは、`SELECT *`はALIASカラムを除外します。この動作は、設定`asterisk_include_alias_columns`で無効にできます。

ALTERクエリを使用して新しいカラムを追加する際、これらのカラムの古いデータは書き込まれません。代わりに、古いデータを読み込む際、これらの新しいカラムの値が保持されていない場合は、式が動的に計算されます。ただし、式の実行に異なるカラムが必要な場合、そのカラムは必要なデータブロックに対してのみ追加で読み取られます。

テーブルに新しいカラムを追加したが、後でそのデフォルト式を変更した場合、古いデータに使用される値が変更されます（ディスクに値が保存されていないデータの場合）。バックグラウンドマージを実行する際、マージ中のパーツの1つに不足しているカラムのデータはマージされたパーツに書き込まれます。

ネストされたデータ構造内の要素のデフォルト値を設定することはできません。

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

テーブルを作成する際に[主キー](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries)を定義できます。主キーは2つの方法で指定できます：

- カラムリストの内部

``` sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...,
    PRIMARY KEY(expr1[, expr2,...])
)
ENGINE = engine;
```

- カラムリストの外部

``` sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
PRIMARY KEY(expr1[, expr2,...]);
```

:::tip
1つのクエリで両方の方法を組み合わせることはできません。
:::
## 制約 {#constraints}

カラムの説明とともに制約を定義できます：
### 制約 {#constraint}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [compression_codec] [TTL expr1],
    ...
    CONSTRAINT constraint_name_1 CHECK boolean_expr_1,
    ...
) ENGINE = engine
```

`boolean_expr_1`は任意のブール式である可能性があります。テーブルに制約が定義されている場合、それぞれが`INSERT`クエリのすべての行に対してチェックされます。制約が満たされない場合、サーバーは制約名とチェック式を持つ例外を発生させます。

大量の制約を追加すると、大きな`INSERT`クエリのパフォーマンスに悪影響を与える可能性があります。
### ASSUME {#assume}

`ASSUME`句は、真であると仮定されるテーブルに`CONSTRAINT`を定義するために使用されます。この制約は、最適化によってSQLクエリのパフォーマンスを向上させるために使用される可能性があります。

以下の例では、`ASSUME CONSTRAINT`が`users_a`テーブルの作成に使用されています：

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

ここで、`ASSUME CONSTRAINT`は、`length(name)`関数が常に`name_len`カラムの値と等しいことを主張するために使用されます。これにより、クエリ内で`length(name)`が呼び出されるたびに、ClickHouseは`name_len`で置き換えることができ、`length()`関数を呼び出す必要がなくなるため、より高速になる可能性があります。

次に、`SELECT name FROM users_a WHERE length(name) < 5;`というクエリを実行する際、ClickHouseはこれを`SELECT name FROM users_a WHERE name_len < 5;`に最適化できます。これは、`ASSUME CONSTRAINT`のおかげで実行が速くなる可能性があるからです。

`ASSUME CONSTRAINT`は**制約を強制しません**。単に最適化に対して制約が成り立つことを通知するだけです。制約が実際には成り立たない場合、クエリの結果が不正確になる可能性があります。したがって、制約が真であると確信している場合のみ、`ASSUME CONSTRAINT`を使用するべきです。
## TTL式 {#ttl-expression}

値のストレージ時間を定義します。MergeTreeファミリーのテーブルに対してのみ指定できます。詳細な説明については、[カラムとテーブルのTTL](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)を参照してください。
## カラム圧縮コーデック {#column_compression_codec}

デフォルトでは、ClickHouseはセルフマネージド版で`lz4`圧縮を適用し、ClickHouse Cloudで`zstd`を適用します。

`MergeTree`エンジンファミリーでは、[圧縮](../../../operations/server-configuration-parameters/settings.md#server-settings-compression)セクションのサーバー設定でデフォルトの圧縮方法を変更できます。

また、`CREATE TABLE`クエリで各カラムの圧縮方法を定義できます。

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

`Default`コーデックを指定して、ランタイム中の異なる設定（およびデータのプロパティ）に依存するデフォルト圧縮を参照できます。
例：`value UInt64 CODEC(Default)` — コーデック仕様がないのと同じです。

また、現在のCODECをカラムから削除し、config.xmlのデフォルト圧縮を使用することもできます：

``` sql
ALTER TABLE codec_example MODIFY COLUMN float_value CODEC(Default);
```

コーデックはパイプラインで結合できます。たとえば、`CODEC(Delta, Default)`です。

:::tip
ClickHouseのデータベースファイルのデコンプレスは、`lz4`のような外部ユーティリティでは行えません。代わりに、特別な[clickhouse-compressor](https://github.com/ClickHouse/ClickHouse/tree/master/programs/compressor)ユーティリティを使用してください。
:::

圧縮は以下のテーブルエンジンでサポートされています：

- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)ファミリー。カラム圧縮コーデックと[圧縮](../../../operations/server-configuration-parameters/settings.md#server-settings-compression)設定によるデフォルト圧縮メソッドの選択をサポートします。
- [Log](../../../engines/table-engines/log-family/index.md)ファミリー。デフォルトで`lz4`圧縮方法を使用し、カラム圧縮コーデックをサポートします。
- [Set](../../../engines/table-engines/special/set.md)。デフォルト圧縮のみをサポートしています。
- [Join](../../../engines/table-engines/special/join.md)。デフォルト圧縮のみをサポートしています。

ClickHouseは一般的な目的のコーデックと特殊なコーデックをサポートしています。
### 一般的な目的のコーデック {#general-purpose-codecs}
#### NONE {#none}

`NONE` — 圧縮なし。
#### LZ4 {#lz4}

`LZ4` — デフォルトで使用される損失のない[データ圧縮アルゴリズム](https://github.com/lz4/lz4)。LZ4の高速圧縮を適用します。
#### LZ4HC {#lz4hc}

`LZ4HC[(level)]` — 設定可能なレベルのLZ4 HC（高圧縮）アルゴリズム。デフォルトレベル：9。レベル`level <= 0`はデフォルトレベルが適用されます。可能なレベル：\[1, 12\]。推奨レベル範囲：\[4, 9\]。
#### ZSTD {#zstd}

`ZSTD[(level)]` — 設定可能な`level`を持つ[ZSTD圧縮アルゴリズム](https://en.wikipedia.org/wiki/Zstandard)。可能なレベル：\[1, 22\]。デフォルトレベル：1。

高圧縮レベルは、圧縮は一度、解凍は繰り返し行うような非対称シナリオで有効です。高いレベルはより良い圧縮を意味しますが、CPUの使用率も高くなります。
#### ZSTD_QAT {#zstd_qat}

<CloudNotSupportedBadge/>

`ZSTD_QAT[(level)]` — 設定可能なレベルの[ZSTD圧縮アルゴリズム](https://en.wikipedia.org/wiki/Zstandard)。これは[Intel® QATlib](https://github.com/intel/qatlib)および[Intel® QAT ZSTD Plugin](https://github.com/intel/QAT-ZSTD-Plugin)によって実装されています。可能なレベル：\[1, 12\]。デフォルトレベル：1。推奨レベル範囲：\[6, 12\]。いくつかの制限があります：

- ZSTD_QATはデフォルトで無効であり、設定[enable_zstd_qat_codec](../../../operations/settings/settings.md#enable_zstd_qat_codec)を有効にした後にのみ使用できます。
- 圧縮のために、ZSTD_QATはIntel® QATオフロードデバイス（[QuickAssist Technology](https://www.intel.com/content/www/us/en/developer/topic-technology/open/quick-assist-technology/overview.html)）を使用します。そのようなデバイスが見つからない場合、ソフトウェアでのZSTD圧縮にフォールバックします。
- 解凍は常にソフトウェアで行われます。
#### DEFLATE_QPL {#deflate_qpl}

<CloudNotSupportedBadge/>

`DEFLATE_QPL` — [Deflate圧縮アルゴリズム](https://github.com/intel/qpl)で、Intel® Query Processing Libraryによって実装されています。いくつかの制限があります：

- DEFLATE_QPLはデフォルトで無効であり、設定[enable_deflate_qpl_codec](../../../operations/settings/settings.md#enable_deflate_qpl_codec)を有効にした後にのみ使用できます。
- DEFLATE_QPLは、SSE 4.2命令でコンパイルされたClickHouseビルドを必要とします（デフォルトではそのようになっています）。詳細については、[DEFLATE_QPLを使用してClickhouseをビルドする](/development/building_and_benchmarking_deflate_qpl.md/#Build-Clickhouse-with-DEFLATE_QPL)を参照してください。
- DEFLATE_QPLは、システムにIntel® IAA（In-Memory Analytics Accelerator）オフロードデバイスがある場合に最も効果的に機能します。詳細については、[Accelerator Configuration](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration)および[DEFLATE_QPLでのベンチマーク](/development/building_and_benchmarking_deflate_qpl.md/#Run-Benchmark-with-DEFLATE_QPL)を参照してください。
- DEFLATE_QPLで圧縮されたデータは、SSE 4.2が有効な状態でコンパイルされたClickHouseノード間でのみ転送できます。
### 特殊コーデック {#specialized-codecs}

これらのコーデックは、データの特定の特徴を活用することで圧縮をより効果的にするために設計されています。これらのコーデックの中には、データ自体を圧縮せず、代わりにデータを前処理して、一般的な目的のコーデックを使用する第二の圧縮段階でより高いデータ圧縮率を達成できるようにするものがあります。
#### Delta {#delta}

`Delta(delta_bytes)` — 生の値を、最初の値を除いて隣接する2つの値の差に置き換える圧縮アプローチ。`delta_bytes`までがデルタ値を保存するために使用されるため、`delta_bytes`は生の値の最大サイズです。可能な`delta_bytes`値：1、2、4、8。`delta_bytes`のデフォルト値は、1、2、4、または8に等しい場合は`sizeof(type)`です。それ以外の場合は1です。Deltaはデータ準備コーデックであり、単独で使用することはできません。
#### DoubleDelta {#doubledelta}

`DoubleDelta(bytes_size)` — デルタのデルタを計算し、コンパクトなバイナリ形式で書き込みます。可能な`bytes_size`値：1、2、4、8。デフォルト値は、1、2、4、または8に等しい場合は`sizeof(type)`です。それ以外の場合は1です。最適な圧縮率は、一定のストライドを持つ単調のシーケンス、たとえば時系列データにおいて達成されます。任意の固定幅型で使用できます。Gorilla TSDBで使用されるアルゴリズムを実装しており、64ビット型をサポートするように拡張しています。32ビットデータには1ビットの余分なビットを使用します：4ビットのプレフィックスの代わりに5ビットのプレフィックスを使用します。詳細については、[Gorilla: A Fast, Scalable, In-Memory Time Series Database](http://www.vldb.org/pvldb/vol8/p1816-teller.pdf)の時刻印の圧縮を参照してください。DoubleDeltaはデータ準備コーデックであり、単独で使用することはできません。
#### GCD {#gcd}

`GCD()` - カラム内の値の最大公約数（GCD）を計算し、その後各値をGCDで割ります。整数、小数、および日付/時間カラムと共に使用できます。このコーデックは、値がGCDの倍数（たとえば、24, 28, 16, 24, 8, 24（GCD = 4）のように）で変化するカラムに適しています。GCDはデータ準備コーデックであり、単独で使用することはできません。
#### Gorilla {#gorilla}

`Gorilla(bytes_size)` — 現在の浮動小数点値と前の浮動小数点値のXORを計算し、コンパクトなバイナリ形式で書き込みます。連続する値間の差が小さいほど、すなわち、系列の値が遅く変化するほど、圧縮率が向上します。Gorilla TSDBで使用されているアルゴリズムを実装しており、64ビット型をサポートするように拡張しています。可能な`bytes_size`値：1、2、4、8。デフォルト値は、1、2、4、または8に等しい場合は`sizeof(type)`です。それ以外の場合は1です。詳細については、[Gorilla: A Fast, Scalable, In-Memory Time Series Database](https://doi.org/10.14778/2824032.2824078)のセクション4.1を参照してください。
#### FPC {#fpc}

`FPC(level, float_size)` - シーケンス内の次の浮動小数点値を2つの予測器のうちのより優れたもので繰り返し予測し、実際の値と予測された値をXORし、結果をリーディングゼロ圧縮します。Gorillaと同様に、これは、浮動小数点値の系列がゆっくり変化する場合に効率的です。64ビット値（ダブル）では、FPCはGorillaよりも高速で、32ビット値では結果はさまざまです。可能な`level`値：1-28、デフォルト値は12。可能な`float_size`値：4、8。デフォルト値は、型がFloatの場合は`sizeof(type)`です。それ以外の場合は4です。アルゴリズムの詳細な説明については、[High Throughput Compression of Double-Precision Floating-Point Data](https://userweb.cs.txstate.edu/~burtscher/papers/dcc07a.pdf)を参照してください。
#### T64 {#t64}

`T64` — 整数データ型（`Enum`、`Date`、`DateTime`を含む）の未使用の高ビットを切り詰める圧縮アプローチです。アルゴリズムの各ステップでは、64の値のブロックを取得し、64x64ビットの行列に配置し、転置し、値の未使用ビットを切り詰め、残りをシーケンスとして返します。未使用ビットは、圧縮に使用される全データパートで最大値と最小値の間で異ならないビットです。

`DoubleDelta`および`Gorilla`コーデックは、Gorilla TSDBでその圧縮アルゴリズムのコンポーネントとして使用されます。Gorillaアプローチは、タイムスタンプを持つゆっくり変化する値の系列が存在するシナリオで効果的です。タイムスタンプは`DoubleDelta`コーデックで効果的に圧縮され、値は`Gorilla`コーデックで効果的に圧縮されます。たとえば、効果的に保存されたテーブルを取得するために、次の構成で作成できます：

``` sql
CREATE TABLE codec_example
(
    timestamp DateTime CODEC(DoubleDelta),
    slow_values Float32 CODEC(Gorilla)
)
ENGINE = MergeTree()
```
### 暗号化コーデック {#encryption-codecs}

これらのコーデックは、実際にデータを圧縮するのではなく、ディスク上のデータを暗号化します。これらは、[暗号化](../../../operations/server-configuration-parameters/settings.md#server-settings-encryption)設定によって暗号化キーが指定された場合のみ利用可能です。暗号化は、コーデックパイプラインの最終段階でのみ意味があります。なぜなら、暗号化されたデータは通常、意義のある方法で圧縮できないからです。

暗号化コーデック：
#### AES_128_GCM_SIV {#aes_128_gcm_siv}

`CODEC('AES-128-GCM-SIV')` — AES-128でデータを暗号化し、[RFC 8452](https://tools.ietf.org/html/rfc8452) GCM-SIVモードで動作します。
#### AES-256-GCM-SIV {#aes-256-gcm-siv}

`CODEC('AES-256-GCM-SIV')` — AES-256でデータを暗号化し、GCM-SIVモードで動作します。

これらのコーデックは固定のノンスを使用しており、暗号化はしたがって決定論的です。これにより、[ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md)のような重複排除エンジンとの互換性がありますが、一つの弱点があります：同じデータブロックが2回暗号化された場合、結果の暗号文は完全に同じであるため、ディスクを読み取ることができる攻撃者はこの同等性を確認できます（ただし、コンテンツを取得することなく）。

:::note
ほとんどのエンジンは、"\*MergeTree"ファミリーを含め、コーデックを適用せずにディスクにインデックスファイルを作成します。これは、インデックスされた暗号化カラムに平文がディスク上に現れることを意味します。
:::

:::note
暗号化カラムで特定の値を示すSELECTクエリを実行すると、その値が[system.query_log](../../../operations/system-tables/query_log.md)に表示される場合があります。ログを無効にすることを検討してください。
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
圧縮が適用される必要がある場合は、それを明示的に指定しなければなりません。そうでない場合、データには暗号化のみが適用されます。
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
一時テーブルはレプリケートされないことに注意してください。そのため、一時テーブルに挿入されたデータが他のレプリカで利用できるという保証はありません。一時テーブルが役立つ主な使用ケースは、単一のセッション中に小さな外部データセットをクエリまたは結合することです。
:::

ClickHouseは、一時テーブルをサポートしており、以下の特性を持ちます：

- 一時テーブルはセッションが終了すると消失します。接続が失われた場合も同様です。
- 一時テーブルはエンジンが指定されていない場合、Memoryテーブルエンジンを使用し、Replicatedおよび`KeeperMap`エンジンを除く任意のテーブルエンジンを使用できます。
- 一時テーブルにはDBを指定できません。データベースの外に作成されます。
- クラスタのすべてのサーバーで分散DDLクエリを使用して一時テーブルを作成することは不可能です（`ON CLUSTER`を使用）。このテーブルは現在のセッションのみに存在します。
- 一時テーブルが他のテーブルと同じ名前を持ち、クエリがDBを指定せずにテーブルの名前を指定する場合、一時テーブルが使用されます。
- 分散クエリ処理の場合、クエリで使用されるMemoryエンジンの一時テーブルはリモートサーバーに渡されます。

一時テーブルを作成するには、次の構文を使用します：

``` sql
CREATE TEMPORARY TABLE [IF NOT EXISTS] table_name
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) [ENGINE = engine]
```

ほとんどの場合、一時テーブルは手動で作成するのではなく、クエリのための外部データを使用する際、または分散による`(GLOBAL) IN`を使用する際に作成されます。詳細については、該当するセクションを参照してください。

一時テーブルの代わりに[ENGINE = Memory](../../../engines/table-engines/special/memory.md)を持つテーブルを使用できます。
## REPLACE TABLE {#replace-table}

`REPLACE`文は、テーブルを[原子的に](concepts/glossary#atomicity)更新することを可能にします。

:::note
この文は、[`Atomic`](../../../engines/database-engines/atomic.md)および[`Replicated`](../../../engines/database-engines/replicated.md)データベースエンジンに対してサポートされています。 
これらはそれぞれ、ClickHouseおよびClickHouse Cloudのデフォルトのデータベースエンジンです。
:::

通常、テーブルからデータを削除する必要がある場合、 
不要なデータを取得しない`SELECT`文で新しいテーブルを作成し、 
古いテーブルを削除して新しいテーブルの名前を変更できます。 
以下の例でこのアプローチが示されています：

```sql
CREATE TABLE myNewTable AS myOldTable;

INSERT INTO myNewTable
SELECT * FROM myOldTable 
WHERE CounterID <12345;

DROP TABLE myOldTable;

RENAME TABLE myNewTable TO myOldTable;
```

上記のアプローチの代わりに、`REPLACE`を使用することも可能です（デフォルトのデータベースエンジンを使用している場合）同じ結果を得るために：

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
`CREATE`文のすべての構文形式は、この文にも適用されます。存在しないテーブルに対して`REPLACE`を呼び出すと、エラーが発生します。
:::
### 例: {#examples}

<Tabs>
<TabItem value="clickhouse_replace_example" label="ローカル" default>

以下のテーブルを考えてみましょう:

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

`REPLACE` 文を使用してデータをすべてクリアすることができます:

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

または、`REPLACE` 文を使用してテーブルの構造を変更することもできます:

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

ClickHouse Cloud上の以下のテーブルを考えてみましょう:

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

`REPLACE` 文を使用してデータをすべてクリアすることができます:

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

または、`REPLACE` 文を使用してテーブルの構造を変更することもできます:

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

- ブログ: [スキーマとコーデックを使ったClickHouseの最適化](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- ブログ: [ClickHouseにおける時系列データの操作](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
