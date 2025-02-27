---
slug: /sql-reference/statements/create/table
sidebar_position: 36
sidebar_label: TABLE
title: "CREATE TABLE"
keywords: [compression, codec, schema, DDL]
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

新しいテーブルを作成します。このクエリは、使用ケースに応じてさまざまな構文形式を持つことができます。

デフォルトでは、テーブルは現在のサーバーにのみ作成されます。分散DDLクエリは、`ON CLUSTER`句として実装されており、[別途説明されています](../../../sql-reference/distributed-ddl.md)。

## 構文形式 {#syntax-forms}

### 明示的スキーマを使用した場合 {#with-explicit-schema}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr1] [COMMENT 'columnのコメント'] [compression_codec] [TTL expr1],
    name2 [type2] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr2] [COMMENT 'columnのコメント'] [compression_codec] [TTL expr2],
    ...
) ENGINE = engine
  [COMMENT 'tableのコメント']
```

`db`データベース内、または`db`が設定されていない場合は現在のデータベースに`table_name`という名前のテーブルを作成します。テーブルの構造は、角括弧内に指定されたカラムの説明、二次インデックス、および制約のリストです。[主キー](#primary-key)がエンジンによってサポートされている場合、それはテーブルエンジンのパラメータとして示されます。

カラムの説明は、最も単純なケースでは`name type`です。例: `RegionID UInt32`。

必要に応じて、1つ以上のキーフィールドを持つ主キーを指定することができます。

カラムおよびテーブルにコメントを追加することができます。

### 他のテーブルに似たスキーマを使用した場合 {#with-a-schema-similar-to-other-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine]
```

他のテーブルと同じ構造のテーブルを作成します。テーブルのエンジンを別のものに指定することもできます。エンジンが指定されていない場合、`db2.name2`テーブルと同じエンジンが使用されます。

### 他のテーブルからクローンしたスキーマとデータで作成する場合 {#with-a-schema-and-data-cloned-from-another-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name CLONE AS [db2.]name2 [ENGINE = engine]
```

他のテーブルと同じ構造のテーブルを作成します。テーブルのエンジンを別のものに指定することもできます。エンジンが指定されていない場合、`db2.name2`テーブルと同じエンジンが使用されます。新しいテーブルが作成されると、すべてのパーティションが`db2.name2`からそのテーブルに添付されます。つまり、`db2.name2`のデータは作成時に`db.table_name`にクローンされます。このクエリは次のものと同等です：

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine];
ALTER TABLE [db.]table_name ATTACH PARTITION ALL FROM [db2].name2;
```

### テーブル関数から {#from-a-table-function}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS table_function()
```

指定された[テーブル関数](../../../sql-reference/table-functions/index.md#table-functions)と同じ結果を持つテーブルを作成します。作成されたテーブルは、指定されたテーブル関数と同じように機能します。

### SELECTクエリから {#from-select-query}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name[(name1 [type1], name2 [type2], ...)] ENGINE = engine AS SELECT ...
```

`SELECT`クエリの結果のような構造で、`engine`エンジンを持つテーブルを作成し、`SELECT`からデータを埋め込むことができます。また、カラムの説明を明示的に指定することも可能です。

テーブルがすでに存在し、`IF NOT EXISTS`が指定されている場合、クエリは何もしません。

クエリ内に`ENGINE`句の後に他の句を追加することができます。テーブルを作成する方法の詳細については、[テーブルエンジン](../../../engines/table-engines/index.md#table_engines)の説明を参照してください。

:::tip
ClickHouse Cloudでは、これを2つのステップに分けて実行してください。
1. テーブル構造を作成します

  ```sql
  CREATE TABLE t1
  ENGINE = MergeTree
  ORDER BY ...
  # highlight-next-line
  EMPTY AS
  SELECT ...
  ```

2. テーブルにデータを埋め込みます

  ```sql
  INSERT INTO t1
  SELECT ...
  ```

:::

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

カラム定義のデータ型の後に`NULL`および`NOT NULL`修飾子を使用すると、それが[Nullable](../../../sql-reference/data-types/nullable.md#data_type-nullable)を許可または禁止します。

型が`Nullable`でなく、`NULL`が指定されている場合、それは`Nullable`として扱われます；`NOT NULL`が指定されている場合、そうではありません。例えば、`INT NULL`は`Nullable(INT)`と同じです。型が`Nullable`であり、`NULL`または`NOT NULL`修飾子が指定されている場合は、例外がスローされます。

また、[data_type_default_nullable](../../../operations/settings/settings.md#data_type_default_nullable)設定も参照してください。

## デフォルト値 {#default_values}

カラムの説明では、`DEFAULT expr`、`MATERIALIZED expr`、または`ALIAS expr`の形式でデフォルト値の式を指定できます。例：`URLDomain String DEFAULT domain(URL)`。

式`expr`は省略可能です。省略された場合、カラムの型を明示的に指定する必要があり、数値型には`0`、文字列型には`''`（空文字列）、配列型には`[]`（空の配列）、日付型には`1970-01-01`がデフォルト値として使用され、nullableカラムには`NULL`がデフォルト値として使用されます。

デフォルト値カラムの型は省略可能で、その場合は`expr`の型から推測されます。例えば、カラム`EventDate DEFAULT toDate(EventTime)`の型は日付になります。

データ型とデフォルト値の式の両方が指定される場合、明示的な型キャスト関数が挿入され、式を指定された型に変換します。例：`Hits UInt32 DEFAULT 0`は内部では`Hits UInt32 DEFAULT toUInt32(0)`として表現されます。

デフォルト値式`expr`は任意のテーブルカラムや定数を参照することができます。ClickHouseは、テーブル構造の変更が式計算にサイクルを導入しないことを確認します。INSERTの際、式が解決可能であるか、すなわち計算に必要なすべてのカラムが渡されているかを確認します。

### DEFAULT {#default}

`DEFAULT expr`

通常のデフォルト値です。そのようなカラムの値がINSERTクエリで指定されていない場合、`expr`から計算されます。

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

物質化された式です。この種のカラムの値は、行が挿入されるときに指定された物質化された式に従って自動的に計算されます。INSERT時に明示的に値を指定することはできません。

また、この種のデフォルト値カラムは、`SELECT *`の結果には含まれません。これは、`SELECT *`の結果が常にINSERTを使用してテーブルに再挿入できるという不変を保つためです。この動作は、`asterisk_include_materialized_columns`の設定で無効にできます。

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

一時的なカラム。こうした型のカラムはテーブルに保存されず、そこからSELECTすることはできません。一時的なカラムの唯一の目的は、他のカラムのデフォルト値式を構築することです。

明示的に指定されたカラムなしでの挿入では、この型のカラムはスキップされます。これは、`SELECT *`の結果が常にINSERTを使用してテーブルに戻されるという不変を保つためです。

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

計算カラム（同義語）。この型のカラムはテーブルに保存されず、それに値をINSERTすることはできません。

SELECTクエリがこの型のカラムを明示的に参照する場合、その値はクエリの実行時に`expr`から計算されます。デフォルトで、`SELECT *`はALIASカラムを除外します。この動作は、`asterisk_include_alias_columns`の設定で無効にできます。

ALTERクエリを使用して新しいカラムを追加する場合、これらのカラムの古いデータには書き込まれません。代わりに、新しいカラムの値が存在しない古いデータを読む際には、式が自動的に計算されます。ただし、式の実行に他のカラムが必要な場合、それらのカラムは、必要なデータブロックのために追加で読み込まれます。

テーブルに新しいカラムを追加し、その後にデフォルトの式を変更すると、古いデータに使われる値が変わります（ディスクに値が保存されていないデータの場合）。バックグラウンドのマージを実行する際に、一方のマージ部分に存在しないカラムのデータは、マージ部分に書き込まれます。

ネストされたデータ構造内の要素には、デフォルト値を設定することはできません。

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

テーブルを作成するときに[主キー](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries)を定義することができます。主キーは次の2つの方法で指定できます：

- カラムリスト内で

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...,
    PRIMARY KEY(expr1[, expr2,...])
)
ENGINE = engine;
```

- カラムリスト外で

```sql
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

カラムの説明とともに制約を定義することも可能です。

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

`boolean_expr_1`は任意の論理式である可能性があります。テーブルに制約が定義されている場合、INSERTクエリの各行に対してそれらの制約がチェックされます。いずれかの制約が満たされない場合、サーバーは制約名とチェック式を示す例外を発生させます。

大量の制約を追加すると、大規模なINSERTクエリのパフォーマンスに悪影響を与える可能性があります。

### ASSUME {#assume}

`ASSUME`句は、真であると仮定されるテーブルに`CONSTRAINT`を定義するために使用されます。この制約は、SQLクエリのパフォーマンスを向上させるためにオプティマイザーによって使用されることがあります。

以下の例では、`ASSUME CONSTRAINT`を使用して`users_a`テーブルを作成しています：

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

ここで、`ASSUME CONSTRAINT`は、`length(name)`関数が常に`name_len`カラムの値と等しいことを保証します。つまり、クエリ内で`length(name)`が呼び出されるたびに、ClickHouseはそれを`name_len`に置き換えることができ、この方が高速で、`length()`関数の呼び出しを避けることができます。

その後、`SELECT name FROM users_a WHERE length(name) < 5;`クエリを実行すると、ClickHouseはそれを`SELECT name FROM users_a WHERE name_len < 5;`に最適化できます。これは、`ASSUME CONSTRAINT`により、クエリの実行が高速化され、各行の`name`の長さを計算する必要がないためです。

`ASSUME CONSTRAINT`は**制約を強制するものではなく**、単にオプティマイザーにその制約が真であることを通知するものです。制約が実際に真でない場合、クエリの結果が不正確になる可能性があります。そのため、制約が真であると確信できる場合にのみ、`ASSUME CONSTRAINT`を使用すべきです。

## TTL式 {#ttl-expression}

値のストレージ時間を定義します。MergeTreeファミリーのテーブルに対してのみ指定できます。詳細な説明については、[カラムおよびテーブルのTTL](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)を参照してください。

## カラム圧縮コーデック {#column_compression_codec}

デフォルトでは、ClickHouseは自己管理バージョンで`lz4`圧縮を適用し、ClickHouse Cloudで`zstd`を適用します。

`MergeTree`エンジンファミリーでは、サーバー構成の[compression](../../../operations/server-configuration-parameters/settings.md#server-settings-compression)セクションでデフォルトの圧縮方法を変更できます。

また、`CREATE TABLE`クエリ内の各個別のカラムに圧縮方法を定義することもできます。

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

`Default`コーデックを指定してデフォルト圧縮を参照することが可能であり、これには実行時に異なる設定（およびデータの特性）に依存する場合があります。
例: `value UInt64 CODEC(Default)` — これはコーデックの仕様が欠如したのと同じです。

現在のCODECをカラムから削除し、config.xmlのデフォルト圧縮を使用することもできます。

```sql
ALTER TABLE codec_example MODIFY COLUMN float_value CODEC(Default);
```

コーデックはパイプラインで組み合わせることができ、例えば、`CODEC(Delta, Default)`のように指定できます。

:::tip
ClickHouseデータベースファイルを外部ユーティリティ（例: `lz4`）で解凍することはできません。代わりに、特別な[clickhouse-compressor](https://github.com/ClickHouse/ClickHouse/tree/master/programs/compressor)ユーティリティを使用してください。
:::

圧縮は以下のテーブルエンジンでサポートされています：

- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)ファミリー。カラム圧縮コーデックをサポートしており、[compression](../../../operations/server-configuration-parameters/settings.md#server-settings-compression)設定によってデフォルト圧縮方法を選択します。
- [Log](../../../engines/table-engines/log-family/index.md)ファミリー。デフォルトで`lz4`圧縮方法を使用し、カラム圧縮コーデックをサポートします。
- [Set](../../../engines/table-engines/special/set.md)。デフォルト圧縮のみサポートされています。
- [Join](../../../engines/table-engines/special/join.md)。デフォルト圧縮のみサポートされています。

ClickHouseでは、一般的な目的のコーデックと専門的なコーデックをサポートしています。

### 一般的な目的のコーデック {#general-purpose-codecs}

#### NONE {#none}

`NONE` — 圧縮なし。

#### LZ4 {#lz4}

`LZ4` — デフォルトで使用されるロスレス[データ圧縮アルゴリズム](https://github.com/lz4/lz4)。LZ4の高速圧縮を適用します。

#### LZ4HC {#lz4hc}

`LZ4HC[(level)]` — 設定可能なレベルを持つLZ4 HC（高圧縮）アルゴリズム。デフォルトレベル：9。`level <= 0`が設定された場合、デフォルトレベルが適用されます。可能なレベル: \[1, 12\]。推奨レベル範囲: \[4, 9\]。

#### ZSTD {#zstd}

`ZSTD[(level)]` — 設定可能な`level`を持つ[ZSTD圧縮アルゴリズム](https://en.wikipedia.org/wiki/Zstandard)。可能なレベル: \[1, 22\]。デフォルトレベル: 1。

高圧縮レベルは、非対称のシナリオ（1回圧縮し、何度も解凍する場合）に有用です。より高いレベルは、より良い圧縮と高いCPU使用率を意味します。

#### ZSTD_QAT {#zstd_qat}

<CloudNotSupportedBadge/>

`ZSTD_QAT[(level)]` — [ZSTD圧縮アルゴリズム](https://en.wikipedia.org/wiki/Zstandard)の設定可能なレベルを持ち、[Intel® QATlib](https://github.com/intel/qatlib)と[Intel® QAT ZSTD Plugin](https://github.com/intel/QAT-ZSTD-Plugin)によって実装されたもの。可能なレベル: \[1, 12\]。デフォルトレベル: 1。推奨レベル範囲: \[6, 12\]。いくつかの制限が適用されます：

- ZSTD_QATはデフォルトで無効で、設定を[enable_zstd_qat_codec](../../../operations/settings/settings.md#enable_zstd_qat_codec)で有効にする必要があります。
- 圧縮時、ZSTD_QATはIntel® QATオフローディングデバイス（[QuickAssist Technology](https://www.intel.com/content/www/us/en/developer/topic-technology/open/quick-assist-technology/overview.html)）を使用しようとします。このデバイスが見つからない場合、ソフトウェア内でZSTD圧縮にフォールバックします。
- 解凍は常にソフトウェア内で行われます。

#### DEFLATE_QPL {#deflate_qpl}

<CloudNotSupportedBadge/>

`DEFLATE_QPL` — [Deflate圧縮アルゴリズム](https://github.com/intel/qpl)をIntel® Query Processing Libraryによって実装したもの。いくつかの制限が適用されます：

- DEFLATE_QPLはデフォルトで無効で、設定を[enable_deflate_qpl_codec](../../../operations/settings/settings.md#enable_deflate_qpl_codec)で有効にしなければなりません。
- DEFLATE_QPLはSSE 4.2命令でコンパイルされたClickHouseビルドが必要です（デフォルトではこれが正しいです）。詳細については、[DEFLATE_QPLでClickhouseをビルドする](/development/building_and_benchmarking_deflate_qpl.md/#Build-Clickhouse-with-DEFLATE_QPL)を参照してください。
- DEFLATE_QPLは、システムにIntel® IAA（インメモリアナリティクスアクセラレーター）オフローディングデバイスがある際に最も効果的に機能します。詳細については、[Accelerator Configuration](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration)と[DEFLATE_QPLのベンチマーク](/development/building_and_benchmarking_deflate_qpl.md/#Run-Benchmark-with-DEFLATE_QPL)を参照してください。
- DEFLATE_QPLで圧縮されたデータは、SSE 4.2が有効な状態でコンパイルされたClickHouseノード間でのみ転送できます。

### 専門的なコーデック {#specialized-codecs}

これらのコーデックは、データの特定の特徴を利用して圧縮をより効果的にするために設計されています。中にはデータを自ら圧縮せず、一般的な目的のコーデックを使用してより高いデータ圧縮率を達成するためにデータを前処理するものもあります。

#### Delta {#delta}

`Delta(delta_bytes)` — 生の値を2つの隣接する値の違いに置き換える圧縮アプローチであり、最初の値はそのままとなります。最大`delta_bytes`がデルタ値の保存に使用され、したがって`delta_bytes`が生の値の最大サイズとなります。可能な`delta_bytes`値: 1, 2, 4, 8。`delta_bytes`のデフォルト値は、`sizeof(type)`が1, 2, 4、または8の場合であり、他のすべての場合は1です。Deltaはデータ準備コーデックであり、単独で使用することはできません。

#### DoubleDelta {#doubledelta}

`DoubleDelta(bytes_size)` — デルタのデルタを計算し、コンパクトなバイナリ形式で書き込みます。可能な`bytes_size`値: 1, 2, 4, 8、デフォルト値は`sizeof(type)`が1, 2, 4、または8の場合であり、他のすべての場合は1です。単調なシーケンスで一定の間隔を持つデータ（時系列データなど）に対して最適な圧縮率を達成します。任意の固定幅の型で使用することができます。Gorilla TSDBで使用されるアルゴリズムを実装しており、64ビット型をサポートしています。32ビットのデルタに対しては5ビットプレフィックスを使用し、4ビットプレフィックスの代わりに1ビットが追加で使用されます。詳細については、[Gorilla: A Fast, Scalable, In-Memory Time Series Database](http://www.vldb.org/pvldb/vol8/p1816-teller.pdf)の「タイムスタンプの圧縮」を参照してください。DoubleDeltaはデータ準備コーデックであり、単独で使用することはできません。

#### GCD {#gcd}

`GCD()` - カラム内の値の最大公約数（GCD）を計算し、各値をそのGCDで割ります。整数、十進数、および日付/時刻のカラムで使用できます。このコーデックは、GCDの倍数で（増加または減少）値が変化するカラム（例えば、24, 28, 16, 24, 8, 24（GCD = 4））に適しています。GCDはデータ準備コーデックであり、単独で使用することはできません。

#### Gorilla {#gorilla}

`Gorilla(bytes_size)` — 現在の浮動小数点値と前の浮動小数点値の間のXORを計算し、コンパクトなバイナリ形式で書き込みます。連続する値の差が小さいほど、すなわち、系列が緩やかに変化するほど、圧縮率が良くなります。Gorilla TSDBで使用されるアルゴリズムを実装しており、64ビット型をサポートしています。可能な`bytes_size`値: 1, 2, 4, 8、デフォルト値は`sizeof(type)`が1, 2, 4、または8の場合であり、他のすべての場合は1です。詳細については、[Gorilla: A Fast, Scalable, In-Memory Time Series Database](https://doi.org/10.14778/2824032.2824078)の4.1節を参照してください。

#### FPC {#fpc}

`FPC(level, float_size)` - シーケンス内の次の浮動小数点値を2つの予測器のうちの優れた方を使用して繰り返し予測し、その後実際の値と予測された値をXORし、結果を先頭のゼロ圧縮します。Gorillaに似ており、緩やかに変化する浮動小数点値のシーケンスを保存する際に効果的です。64ビットの値（ダブル）に対して、FPCはGorillaよりも高速で、32ビットの値では結果が異なる場合があります。可能な`level`値: 1-28、デフォルト値は12。可能な`float_size`値: 4, 8、デフォルト値は型がFloatの場合に`sizeof(type)`であり、他のすべての場合は4です。アルゴリズムの詳細な説明については、[整数プレシジョンの高スループット圧縮](https://userweb.cs.txstate.edu/~burtscher/papers/dcc07a.pdf)を参照してください。

#### T64 {#t64}

`T64` — 整数データ型（`Enum`、`Date`、`DateTime`を含む）の未使用の高ビットを切り捨てる圧縮アプローチです。アルゴリズムの各ステップで、コーデックは64の値のブロックを取り、64x64ビットの行列に配置し、それを転置し、値の未使用ビットを切り捨て、残りをシーケンスとして返します。未使用のビットは、圧縮が使用される全データ部分の最大値と最小値の間で異ならないビットです。

`DoubleDelta`および`Gorilla`コーデックは、Gorilla TSDBの圧縮アルゴリズムの構成要素として使用されます。Gorillaアプローチは、タイムスタンプとともに徐々に変化する値のシーケンスがあるシナリオで効果的です。タイムスタンプは`DoubleDelta`コーデックによって効率的に圧縮され、値は`Gorilla`コーデックによって効果的に圧縮されます。例えば、効果的に保存されたテーブルを得るために、以下の構成で作成できます：

```sql
CREATE TABLE codec_example
(
    timestamp DateTime CODEC(DoubleDelta),
    slow_values Float32 CODEC(Gorilla)
)
ENGINE = MergeTree()
```

### 暗号化コーデック {#encryption-codecs}

これらのコーデックは実際にはデータを圧縮するのではなく、ディスク上のデータを暗号化します。これらは、[encryption](../../../operations/server-configuration-parameters/settings.md#server-settings-encryption)設定で暗号化キーが指定されている場合にのみ利用可能です。暗号化は通常、コーデックパイプラインの最後でのみ意味があります。なぜなら、暗号化されたデータは通常、意味のある方法で圧縮できないからです。

暗号化コーデック：

#### AES_128_GCM_SIV {#aes_128_gcm_siv}

`CODEC('AES-128-GCM-SIV')` — データを[RFQ 8452](https://tools.ietf.org/html/rfc8452) GCM-SIVモードのAES-128で暗号化します。

#### AES-256-GCM-SIV {#aes-256-gcm-siv}

`CODEC('AES-256-GCM-SIV')` — データをAES-256でGCM-SIVモードで暗号化します。

これらのコーデックは固定されたノンスを使用し、したがって暗号化は決定論的です。これにより、[ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md)のような重複排除エンジンとの互換性が確保されていますが、一つの弱点があります：同じデータブロックが2回暗号化されると、生成される暗号文はまったく同じになるため、ディスクを読み取ることのできる攻撃者はこの等価性を見ることができます（ただし内容は取得できませんが）。

:::note
「\*MergeTree」ファミリーを含め、ほとんどのエンジンはコーデックを適用せずにディスク上にインデックスファイルを作成します。これにより、暗号化されたカラムがインデックスされるとき、平文がディスク上に現れることになります。
:::

:::note
暗号化されたカラムの特定の値を含むSELECTクエリを実行すると（WHERE句など）、その値は[system.query_log](../../../operations/system-tables/query_log.md)に現れることがあります。ログ記録を無効にしたい場合があるかもしれません。
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
圧縮を適用する必要がある場合、明示的に指定する必要があります。そうでない場合、データに対しては暗号化のみが適用されます。
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
一時テーブルは複製されないことに注意してください。そのため、一時テーブルに挿入されたデータが他のレプリカで利用可能になる保証はありません。一時テーブルは、単一のセッション中に小さな外部データセットのクエリや結合を行う際に便利です。
:::

ClickHouseは、以下の特性を持つ一時テーブルをサポートします：

- 一時テーブルはセッションが終了すると消えます。接続が失われた場合も同様です。
- 一時テーブルはエンジンが指定されていない場合、Memoryテーブルエンジンを使用し、複製および`KeeperMap`エンジン以外の任意のテーブルエンジンを使用できます。
- 一時テーブルに対してデータベースを指定することはできません。データベースの外部に作成されます。
- クラスターのすべてのサーバーに対して分散DDLクエリを使用して一時テーブルを作成することはできません（`ON CLUSTER`を使用）：このテーブルは現在のセッション内のみに存在します。
- 一時テーブルが他のテーブルと同じ名前を持っている場合、DBを指定せずにテーブル名を指定するクエリでは、一時テーブルが使用されます。
- 分散クエリ処理のために、クエリで使用されるMemoryエンジンの一時テーブルは、リモートサーバーに渡されます。

一時テーブルを作成するには、次の構文を使用します：

```sql
CREATE TEMPORARY TABLE [IF NOT EXISTS] table_name
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) [ENGINE = engine]
```

ほとんどの場合、一時テーブルは手動で作成されるのではなく、外部データをクエリに使用する、または分散`(GLOBAL) IN`のために使用されます。詳細については、適切なセクションを参照してください。

一時テーブルの代わりに、[ENGINE = Memory](../../../engines/table-engines/special/memory.md)のテーブルを使用することも可能です。

## REPLACE TABLE {#replace-table}

`REPLACE`文は、テーブルを[原子的に](/concepts/glossary#atomicity)更新することを許可します。

:::note
この文は、ClickHouseおよびClickHouse Cloudのデフォルトのデータベースエンジンである[`Atomic`](../../../engines/database-engines/atomic.md)および[`Replicated`](../../../engines/database-engines/replicated.md)に対してサポートされています。
:::

通常、テーブルからデータを削除する必要がある場合、新しいテーブルを作成し、不要なデータを取得しない`SELECT`文でそれを埋め込み、その後古いテーブルを削除して新しいテーブルの名前を変更します。このアプローチは、以下の例で示されています：

```sql
CREATE TABLE myNewTable AS myOldTable;

INSERT INTO myNewTable
SELECT * FROM myOldTable 
WHERE CounterID <12345;

DROP TABLE myOldTable;

RENAME TABLE myNewTable TO myOldTable;
```

上記のアプローチの代わりに、（デフォルトのデータベースエンジンを使用している場合）、`REPLACE`を使用して同じ結果を達成することも可能です：

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
`CREATE`文のすべての構文形式もこの文に適用されます。存在しないテーブルに対して`REPLACE`を呼び出すと、エラーが発生します。
:::

### 例: {#examples}

<Tabs>
<TabItem value="clickhouse_replace_example" label="Local" default>

次のテーブルを考えてみましょう：

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

`REPLACE`文を使用してすべてのデータをクリアできます：

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

また、`REPLACE`文を使用してテーブルの構造を変更することもできます：

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

ClickHouse Cloudの次のテーブルを考えます：

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

`REPLACE`文を使用してすべてのデータをクリアできます：

```sql
```
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

あるいは、`REPLACE` ステートメントを使ってテーブル構造を変更することができます:

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

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
COMMENT 'コメント'
```

**例**

クエリ:

```sql
CREATE TABLE t1 (x String) ENGINE = Memory COMMENT '一時テーブル';
SELECT name, comment FROM system.tables WHERE name = 't1';
```

結果:

```text
┌─name─┬─comment─────────────┐
│ t1   │ 一時テーブル        │
└──────┴─────────────────────┘
```


## 関連コンテンツ {#related-content}

- ブログ: [スキーマとコーデックを使ったClickHouseの最適化](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- ブログ: [ClickHouseにおける時系列データの取り扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
