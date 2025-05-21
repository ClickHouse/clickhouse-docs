---
description: 'テーブルのドキュメンテーション'
keywords: ['圧縮', 'コーデック', 'スキーマ', 'DDL']
sidebar_label: 'テーブル'
sidebar_position: 36
slug: /sql-reference/statements/create/table
title: 'テーブルの作成'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

新しいテーブルを作成します。このクエリは使用ケースに応じて様々な構文形式を持つことができます。

デフォルトでは、テーブルは現在のサーバーにのみ作成されます。分散DDLクエリは `ON CLUSTER` 句として実装されており、[別途説明されています](../../../sql-reference/distributed-ddl.md)。
## 構文形式 {#syntax-forms}
### 明示的なスキーマを使用 {#with-explicit-schema}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr1] [COMMENT 'カラムのコメント'] [compression_codec] [TTL expr1],
    name2 [type2] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr2] [COMMENT 'カラムのコメント'] [compression_codec] [TTL expr2],
    ...
) ENGINE = engine
  [COMMENT 'テーブルのコメント']
```

`table_name`という名前のテーブルを `db` データベース内に、または `db` が設定されていない場合は現在のデータベース内に作成します。構造はブラケット内で指定されたものとエンジン `engine` になります。
テーブルの構造は、カラムの説明、二次インデックス、制約のリストです。[主キー](#primary-key) がエンジンによってサポートされている場合、テーブルエンジンのパラメータとして示されます。

最も単純な形でのカラムの説明は `name type` です。例: `RegionID UInt32`。

必要に応じて、主キーを1つ以上のキー式で指定できます。

カラムとテーブルにコメントを追加できます。
### 他のテーブルと似たスキーマを使用 {#with-a-schema-similar-to-other-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine]
```

他のテーブルと同じ構造を持つテーブルを作成します。別のエンジンをテーブルに指定できます。エンジンが指定されていない場合は、`db2.name2` テーブルと同じエンジンが使用されます。
### 他のテーブルからクローンしたスキーマとデータ {#with-a-schema-and-data-cloned-from-another-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name CLONE AS [db2.]name2 [ENGINE = engine]
```

他のテーブルと同じ構造を持つテーブルを作成します。別のエンジンをテーブルに指定できます。エンジンが指定されていない場合は、`db2.name2` テーブルと同じエンジンが使用されます。新しいテーブルが作成されると、`db2.name2` からすべてのパーティションがそれにアタッチされます。言い換えれば、`db2.name2` のデータが作成時に `db.table_name` にクローンされます。このクエリは以下に相当します：

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine];
ALTER TABLE [db.]table_name ATTACH PARTITION ALL FROM [db2].name2;
```
### テーブル関数から {#from-a-table-function}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS table_function()
```

指定された[テーブル関数](/sql-reference/table-functions) と同じ結果を持つテーブルを作成します。作成されたテーブルは、指定されたテーブル関数と同様に動作します。
### SELECTクエリから {#from-select-query}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name[(name1 [type1], name2 [type2], ...)] ENGINE = engine AS SELECT ...
```

`SELECT` クエリの結果に似た構造のテーブルを作成し、`engine` エンジンを指定して`SELECT`からデータで満たします。また、カラムの説明を明示的に指定することもできます。

テーブルがすでに存在し、`IF NOT EXISTS` が指定されている場合、クエリは何もしません。

`ENGINE` 句の後に他の句を追加することもできます。[テーブルエンジン](/engines/table-engines)の説明でテーブルを作成する方法についての詳細なドキュメントを参照してください。

:::tip
ClickHouse Cloud では、これを2つのステップに分けてください：
1. テーブル構造を作成する

  ```sql
  CREATE TABLE t1
  ENGINE = MergeTree
  ORDER BY ...
  -- highlight-next-line
  EMPTY AS
  SELECT ...
  ```

2. テーブルを人口する

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
## NULLまたはNOT NULL 修飾子 {#null-or-not-null-modifiers}

カラム定義内のデータ型の後にある `NULL` および `NOT NULL` 修飾子は、それが[Nullable](/sql-reference/data-types/nullable)であることを許可または許可しません。

型が `Nullable` でなく、`NULL` が指定された場合、それは `Nullable` として扱われます；`NOT NULL` が指定された場合はそうではありません。たとえば、`INT NULL` は `Nullable(INT)` と同じです。型が `Nullable` の場合に `NULL` または `NOT NULL` 修飾子が指定された場合には例外がスローされます。

[データタイプのデフォルトがNullableであるかどうか](../../../operations/settings/settings.md#data_type_default_nullable)の設定も参照してください。
## デフォルト値 {#default_values}

カラムの説明には、`DEFAULT expr`、`MATERIALIZED expr`、または `ALIAS expr` 形式のデフォルト値式を指定できます。例：`URLDomain String DEFAULT domain(URL)`。

式 `expr` はオプションです。省略された場合、カラムの型は明示的に指定されなければならず、デフォルト値は数値カラムの場合は `0`、文字列カラムの場合は `''` (空文字)、配列カラムの場合は `[]` (空配列)、日付カラムの場合は `1970-01-01`、または nullable カラムの場合は `NULL` になります。

デフォルト値カラムのカラム型は省略でき、その場合は `expr` の型から推論されます。たとえば、カラム `EventDate DEFAULT toDate(EventTime)` の型は日付になります。

データ型とデフォルト値式の両方が指定されている場合は、指定された型に式を変換する暗黙の型キャスティング関数が挿入されます。例：`Hits UInt32 DEFAULT 0` は内部的には `Hits UInt32 DEFAULT toUInt32(0)` として表現されます。

デフォルト値式 `expr` は任意のテーブルのカラムおよび定数を参照できます。ClickHouseは、テーブル構造の変更が式計算にループを導入しないことを確認します。INSERTに関しては、式が解決可能であることを確認します - 計算に必要なすべてのカラムが既に含まれていることを確認します。
### DEFAULT {#default}

`DEFAULT expr`

通常のデフォルト値です。このようなカラムの値がINSERTクエリに指定されていない場合、`expr` から計算されます。

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

マテリアライズされた式です。このようなカラムの値は、行が挿入されるときに指定されたマテリアライズされた式に従って自動的に計算されます。値は `INSERT` の際に明示的に指定することはできません。

また、このタイプのデフォルト値カラムは `SELECT *` の結果に含まれません。これは、`SELECT *` の結果を常に INSERT を使用してテーブルに戻すことができるという不変性を保持するためです。この動作は、`asterisk_include_materialized_columns` 設定を使用して無効にできます。

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

エフェメラルカラムです。このタイプのカラムはテーブルに保存されず、選択することもできません。エフェメラルカラムの唯一の目的は、他のカラムのデフォルト値式を構築することです。

明示的に指定されたカラムなしのINSERTは、このタイプのカラムをスキップします。これは、`SELECT *` の結果を常にINSERTでテーブルに戻すことができるという不変性を保持するためです。

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

計算カラム（同義語）です。このタイプのカラムはテーブルに保存されず、値を挿入することもできません。

SELECTクエリがこのタイプのカラムを明示的に参照する場合、値はクエリ時に `expr` から計算されます。デフォルトでは `SELECT *` は ALIAS カラムを除外します。この動作は、`asterisk_include_alias_columns` 設定を使用して無効にできます。

ALTERクエリを使用して新しいカラムを追加する際、これらのカラムに対して古いデータは書き込まれません。代わりに、新しいカラムに値がない古いデータを読み込む場合、式はデフォルトで動的に計算されます。ただし、式の実行に異なるカラムが必要な場合、それらはデータが必要なブロックについてのみ追加で読み取られます。

テーブルに新しいカラムを追加するが、その後デフォルト式を変更した場合、古いデータに使用される値が変更されます（値がディスクに保存されていないデータの場合）。バックグラウンドマージを実行すると、1つのマージパーツに存在しないカラムのデータはマージされたパーツに書き込まれます。

ネストされたデータ構造内の要素にデフォルト値を設定することはできません。

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

テーブル作成時に[主キー](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries)を定義できます。主キーは2つの方法で指定できます：

- カラムリスト内

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...,
    PRIMARY KEY(expr1[, expr2,...])
)
ENGINE = engine;
```

- カラムリストの外

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
PRIMARY KEY(expr1[, expr2,...]);
```

:::tip
1つのクエリ内で両方の方法を組み合わせることはできません。
:::
## 制約 {#constraints}

カラムの説明に加えて制約を定義することもできます：
### 制約 {#constraint}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [compression_codec] [TTL expr1],
    ...
    CONSTRAINT constraint_name_1 CHECK boolean_expr_1,
    ...
) ENGINE = engine
```

`boolean_expr_1` は任意のブーリアン式である可能性があります。テーブルに対して制約が定義されている場合、それぞれがINSERTクエリの各行に対してチェックされます。いずれかの制約が満たされない場合、サーバーは制約名とチェック式を伴う例外をスローします。

多くの制約を追加すると、大量の `INSERT` クエリのパフォーマンスに悪影響を与える可能性があります。
### ASSUME {#assume}

`ASSUME` 句は、真であることが仮定されるテーブルの `CONSTRAINT` を定義するために使用されます。この制約は、SQLクエリのパフォーマンスを向上させるためにオプティマイザーによって使用されることがあります。

次の例では、`ASSUME CONSTRAINT` が `users_a` テーブルの作成に使用されています：

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

ここでは、`ASSUME CONSTRAINT` は `length(name)` 関数が常に `name_len` カラムの値に等しいと主張します。これは、クエリで `length(name)` が呼び出されるたびに、ClickHouseはこれを `name_len` に置き換えることができることを意味します。これは、`length()` 関数を呼び出さずに行えるため、より速くなるはずです。

次に、クエリ `SELECT name FROM users_a WHERE length(name) < 5;` を実行すると、ClickHouseは `SELECT name FROM users_a WHERE name_len < 5;` に最適化できます。これは、`ASSUME CONSTRAINT` のおかげです。このように、各行の `name` の長さを計算することを避けることができるため、クエリが速く実行される可能性があります。

`ASSUME CONSTRAINT` は **制約を強制しません**、単にオプティマイザーにその制約が真であることを知らせるだけです。制約が実際には真でない場合、クエリの結果は不正確になる可能性があります。そのため、制約が真であることを確信している場合のみ `ASSUME CONSTRAINT` を使用するべきです。
## TTL 表現 {#ttl-expression}

値のストレージ時間を定義します。MergeTreeファミリーのテーブルに対してのみ指定できます。詳細な説明については、[カラムおよびテーブルのTTL](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)を参照してください。
## カラム圧縮コーデック {#column_compression_codec}

デフォルトでは、ClickHouseはセルフマネージド版で `lz4` 圧縮を適用し、ClickHouse Cloudでは `zstd` を適用します。

`MergeTree` エンジンファミリーにおいては、サーバ構成の[圧縮](/operations/server-configuration-parameters/settings#compression)セクションでデフォルトの圧縮方法を変更できます。

また、`CREATE TABLE` クエリで各カラムごとに圧縮方法を定義することもできます。

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

`Default` コーデックは、実行時に異なる設定（およびデータのプロパティ）に依存するデフォルトの圧縮を参照するために指定できます。
例: `value UInt64 CODEC(Default)` — これはコーデックの指定がない場合と同じです。

現在の CODEC をカラムから削除し、config.xml からのデフォルト圧縮を使用することもできます：

```sql
ALTER TABLE codec_example MODIFY COLUMN float_value CODEC(Default);
```

コーデックはパイプラインで組み合わせることができます。たとえば、`CODEC(Delta, Default)`。

:::tip
ClickHouseデータベースファイルを `lz4` のような外部ユーティリティで解凍することはできません。代わりに、特別な[clickhouse-compressor](https://github.com/ClickHouse/ClickHouse/tree/master/programs/compressor)ユーティリティを使用してください。
:::

圧縮は次のテーブルエンジンでサポートされています：

- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) ファミリー。カラム圧縮コーデックと[圧縮](/operations/server-configuration-parameters/settings#compression)設定によるデフォルト圧縮方法の選択をサポートします。
- [Log](../../../engines/table-engines/log-family/index.md) ファミリー。デフォルトに `lz4` 圧縮メソッドを使用し、カラム圧縮コーデックをサポートします。
- [Set](../../../engines/table-engines/special/set.md)。デフォルト圧縮のみに対応しています。
- [Join](../../../engines/table-engines/special/join.md)。デフォルト圧縮のみに対応しています。

ClickHouseは汎用のコーデックと専門的なコーデックをサポートします。
### 汎用コーデック {#general-purpose-codecs}
#### NONE {#none}

`NONE` — 圧縮なし。
#### LZ4 {#lz4}

`LZ4` — デフォルトで使用されるロスレス[データ圧縮アルゴリズム](https://github.com/lz4/lz4)。LZ4高速圧縮を適用します。
#### LZ4HC {#lz4hc}

`LZ4HC[(level)]` — 設定可能なレベルの LZ4 HC（高圧縮）アルゴリズム。デフォルトレベル：9。`level <= 0` を設定すると、デフォルトレベルが適用されます。可能なレベル: \[1, 12\]。推奨レベル範囲: \[4, 9\]。
#### ZSTD {#zstd}

`ZSTD[(level)]` — [ZSTD圧縮アルゴリズム](https://en.wikipedia.org/wiki/Zstandard)で設定可能な `level`。可能なレベル: \[1, 22\]。デフォルトレベル: 1。

高圧縮レベルは、圧縮を1回行い、繰り返し解凍するような非対称のシナリオに有用です。レベルが高いほど、より良い圧縮が得られ、CPU使用率が高くなります。
#### ZSTD_QAT {#zstd_qat}

<CloudNotSupportedBadge/>

`ZSTD_QAT[(level)]` — [ZSTD圧縮アルゴリズム](https://en.wikipedia.org/wiki/Zstandard)で設定可能なレベル、[Intel® QATlib](https://github.com/intel/qatlib)および [Intel® QAT ZSTD Plugin](https://github.com/intel/QAT-ZSTD-Plugin) によって実装されています。可能なレベル: \[1, 12\]。デフォルトレベル: 1。推奨レベル範囲: \[6, 12\]。いくつかの制限があります：

- ZSTD_QATはデフォルトでは無効で、[enable_zstd_qat_codec](../../../operations/settings/settings.md#enable_zstd_qat_codec)設定を有効にしてからのみ使用できます。
- 圧縮のために、ZSTD_QATはIntel® QATオフロードデバイス（[QuickAssist Technology](https://www.intel.com/content/www/us/en/developer/topic-technology/open/quick-assist-technology/overview.html)）を使用しようとします。そのようなデバイスが見つからない場合、ZSTD圧縮にソフトウェアでフォールバックされます。
- 解凍は常にソフトウェアで行われます。
#### DEFLATE_QPL {#deflate_qpl}

<CloudNotSupportedBadge/>

`DEFLATE_QPL` — [Deflate圧縮アルゴリズム](https://github.com/intel/qpl)がIntel® Query Processing Libraryによって実装されています。いくつかの制限があります：

- DEFLATE_QPLはデフォルトでは無効で、[enable_deflate_qpl_codec](../../../operations/settings/settings.md#enable_deflate_qpl_codec)設定を有効にしてからのみ使用できます。
- DEFLATE_QPLはSSE 4.2命令でコンパイルされたClickHouseビルドを必要とします（デフォルトではこれが当てはまります）。詳細情報については、[DEFLATE_QPLを使用したClickhouseのビルド](/development/building_and_benchmarking_deflate_qpl)を参照してください。
- DEFLATE_QPLは、システムにIntel® IAA（In-Memory Analytics Accelerator）オフロードデバイスがある場合に最適に機能します。詳細については、[アクセラレータ構成](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration)および[DEFLATE_QPLを使用したベンチマーク](/development/building_and_benchmarking_deflate_qpl)を参照してください。
- DEFLATE_QPLで圧縮されたデータは、SSE 4.2が有効なクリックハウスノード間でのみ転送できます。
### 専門的コーデック {#specialized-codecs}

これらのコーデックは、データの特定の機能を利用して、圧縮をより効果的にするように設計されています。これらのコーデックのいくつかはデータを圧縮しない代わりに、データを前処理して、一般的なコーデックを使用する2度目の圧縮段階で高いデータ圧縮率を達成できるようにします。
#### Delta {#delta}

`Delta(delta_bytes)` — 生の値が隣接する2つの値の差に置き換えられる圧縮アプローチ。ただし、最初の値は変更されません。最大 `delta_bytes` が差分値を保存するために使用されるため、`delta_bytes` は生の値の最大サイズです。可能な `delta_bytes` の値：1、2、4、8。`delta_bytes` のデフォルト値は、1、2、4、または8であれば `sizeof(type)` です。それ以外の場合は1です。Deltaはデータ準備コーデックであり、単独では使用できません。
#### DoubleDelta {#doubledelta}

`DoubleDelta(bytes_size)` — デルタのデルタを計算し、コンパクトなバイナリ形式で書き込みます。可能な `bytes_size` の値：1、2、4、8、デフォルト値は、1、2、4、または8であれば `sizeof(type)` です。それ以外の場合は1です。最適な圧縮率は、一定の間隔で単調なシーケンス（時系列データなど）に対して達成されます。任意の固定幅型と共に使用できます。Gorilla TSDBで使用されるアルゴリズムを実装し、64ビット型のサポートを拡張します。32ビットデルタに対して1ビットの追加ビットを使用：4ビットプレフィックスの代わりに5ビットプレフィックスを使用します。詳細情報については、[Gorilla: A Fast, Scalable, In-Memory Time Series Database](http://www.vldb.org/pvldb/vol8/p1816-teller.pdf)のタイムスタンプ圧縮を参照してください。DoubleDeltaはデータ準備コーデックであり、単独では使用できません。
#### GCD {#gcd}

`GCD()` - - カラム内の値の最大公約数（GCD）を計算し、その後各値をGCDで割ります。整数、10進数、日付/時刻カラムと共に使用できます。このコーデックは、値がGCDの倍数で変化するカラム（例：24、28、16、24、8、24（GCD = 4））に適しています。GCDはデータ準備コーデックであり、単独では使用できません。
#### Gorilla {#gorilla}

`Gorilla(bytes_size)` — 現在の浮動小数点値と前の浮動小数点値のXORを計算し、コンパクトなバイナリ形式で書き込みます。連続する値間の差が小さいほど、すなわち値の系列が緩やかに変化するほど、圧縮率が向上します。Gorilla TSDBで使用されるアルゴリズムを実装し、64ビット型のサポートを拡張します。可能な `bytes_size` の値：1、2、4、8、デフォルト値は、1、2、4、または8であれば `sizeof(type)` です。それ以外の場合は1です。詳細情報については、[Gorilla: A Fast, Scalable, In-Memory Time Series Database](https://doi.org/10.14778/2824032.2824078)のセクション4.1を参照してください。
#### FPC {#fpc}

`FPC(level, float_size)` - 基本的な2つの予測器のうちの1つを使用して、系列内の次の浮動小数点値を繰り返し予測した後、実際の値を予測値とXORし、結果を先頭ゼロで圧縮します。Gorillaと同様の動作をし、徐々に変化する浮動小数点値の系列を保存する際に効率的です。64ビット値（ダブル）の場合、FPCはGorillaよりも速く、32ビット値の場合はその効果が異なります。可能な `level` 値: 1-28、デフォルト値は12。可能な `float_size` 値: 4、8、デフォルト値は、型がFloatの場合は `sizeof(type)` です。それ以外の場合は4です。アルゴリズムの詳細な説明については、[High Throughput Compression of Double-Precision Floating-Point Data](https://userweb.cs.txstate.edu/~burtscher/papers/dcc07a.pdf)を参照してください。
#### T64 {#t64}

`T64` — 整数データ型（`Enum`、`Date`、`DateTime` を含む）の未使用の上位ビットを切り取る圧縮アプローチです。アルゴリズムの各ステップで、コーデックは64値のブロックを取得し、64 x 64ビットマトリックスに配置し、転置し、データ圧縮に使用される全体のデータ部分における最小値と最大値の間で異なるビットを切り取り、残りをシーケンスとして返します。

`DoubleDelta` と `Gorilla` コーデックは、Gorilla TSDBでその圧縮アルゴリズムのコンポーネントとして使用されています。Gorillaアプローチは、時刻スタンプ付きの緩やかに変化する値の系列があるシナリオで効果的です。タイムスタンプは `DoubleDelta` コーデックによって効果的に圧縮され、値は `Gorilla` コーデックによって効果的に圧縮されます。たとえば、効果的にストアされるテーブルを取得するには、次の構成で作成できます：

```sql
CREATE TABLE codec_example
(
    timestamp DateTime CODEC(DoubleDelta),
    slow_values Float32 CODEC(Gorilla)
)
ENGINE = MergeTree()
```
### 暗号化コーデック {#encryption-codecs}

これらのコーデックは実際にデータを圧縮するのではなく、代わりにディスク上のデータを暗号化します。これは、圧縮コーデックが[暗号化](/operations/server-configuration-parameters/settings#encryption)設定によって指定された暗号化キーがあるときにのみ使用できます。暗号化は、コーデックパイプラインの最後にのみ意味があります。なぜなら、暗号化されたデータは通常、意味のある方法で圧縮できないからです。

暗号化コーデック：
#### AES_128_GCM_SIV {#aes_128_gcm_siv}

`CODEC('AES-128-GCM-SIV')` — AES-128でデータを暗号化します。[RFC 8452](https://tools.ietf.org/html/rfc8452) GCM-SIVモード。
#### AES-256-GCM-SIV {#aes-256-gcm-siv}

`CODEC('AES-256-GCM-SIV')` — AES-256でデータを暗号化します。GCM-SIVモード。

これらのコーデックは固定のノンスを使用し、そのため暗号化は決定的です。これは、[ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md)のような重複排除エンジンと互換性がありますが、弱点があります：同じデータブロックが2回暗号化されると、結果の暗号文は完全に同じになるため、ディスクを読み取れる敵はこの同一性を確認できます（ただし、内容は確認できません）。

:::note
ほとんどのエンジンは、"\*MergeTree"ファミリーを含め、コーデックを適用せずにディスク上にインデックスファイルを作成します。これにより、暗号化されたカラムがインデックスされている場合、プレーンテキストがディスク上に表示される可能性があります。
:::

:::note
暗号化されたカラム内の特定の値を指定してSELECTクエリを実行すると（WHERE句などで）、その値が[system.query_log](../../../operations/system-tables/query_log.md)に表示される可能性があります。ログを無効にすることを検討する必要があります。
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
圧縮を適用する必要がある場合は、明示的に指定される必要があります。そうでない場合、データに対して暗号化のみが適用されます。
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
一時テーブルはレプリケートされないことに注意してください。その結果、一時テーブルに挿入されたデータが他のレプリカで使用可能であることは保証されません。一時テーブルが便利に使用される主な用途は、単一のセッションで小さな外部データセットをクエリまたは結合することです。
:::

ClickHouseは、次の特性を持つ一時テーブルをサポートしています：

- 一時テーブルは、セッションが終了したときに消失します。接続が失われた場合も含まれます。
- 一時テーブルは、エンジンが指定されていない場合、メモリテーブルエンジンを使用し、Replicatedおよび `KeeperMap` エンジン以外の任意のテーブルエンジンを使用できます。
- 一時テーブルにDBを指定することはできません。これは、データベースの外に作成されます。
- すべてのクラスターサーバーに対して分散DDLクエリを使用して一時テーブルを作成することは不可能です（`ON CLUSTER`を使用）：このテーブルは現在のセッションにのみ存在します。
- 一時テーブルが他のテーブルと同じ名前を持つ場合、DBを指定せずにクエリがテーブル名を指定すると、一時テーブルが使用されます。
- クエリでメモリエンジンを使用する一時テーブルは、リモートサーバーに渡されます。

一時テーブルを作成するには、次の構文を使用します：

```sql
CREATE TEMPORARY TABLE [IF NOT EXISTS] table_name
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) [ENGINE = engine]
```

ほとんどの場合、一時テーブルは手動で作成されることはなく、外部データをクエリする際や、分散`(GLOBAL) IN`の場合に使用されます。詳細については、適切なセクションを参照してください。

一時テーブルの代わりに[ENGINE = Memory](../../../engines/table-engines/special/memory.md)を使用することができます。
## テーブルの置換 {#replace-table}

`REPLACE` 文は、テーブルを[アトミックに](/concepts/glossary#atomicity)更新することを可能にします。

:::note
この文は、[`Atomic`](../../../engines/database-engines/atomic.md) および [`Replicated`](../../../engines/database-engines/replicated.md) データベースエンジンでサポートされています。 
これらはそれぞれClickHouseおよびClickHouse Cloudのデフォルトデータベースエンジンです。
:::

通常、テーブルからデータを削除する必要がある場合、 
新しいテーブルを作成し、望ましくないデータを取得しない `SELECT` 文でそれを埋め、 
古いテーブルを削除して新しいテーブルの名前を変更することができます。 
このアプローチは、以下の例で示されています：

```sql
CREATE TABLE myNewTable AS myOldTable;

INSERT INTO myNewTable
SELECT * FROM myOldTable 
WHERE CounterID <12345;

DROP TABLE myOldTable;

RENAME TABLE myNewTable TO myOldTable;
```

上記のアプローチの代わりに、（デフォルトのデータベースエンジンを使用している場合）`REPLACE` を使用して同じ結果を達成することも可能です：

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
`CREATE` 文のすべての構文形式は、この文にも適用されます。存在しないテーブルに `REPLACE` を呼び出すとエラーが発生します。
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

`REPLACE` 文を使用して、すべてのデータをクリアできます:

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

次のテーブルを ClickHouse Cloud で考えてみましょう:

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

`REPLACE` 文を使用して、すべてのデータをクリアできます:

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
## COMMENT 句 {#comment-clause}

テーブルを作成する際に、コメントを追加できます。

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
│ t1   │ 一時テーブル       │
└──────┴─────────────────────┘
```
## 関連コンテンツ {#related-content}

- ブログ: [スキーマとコーデックで ClickHouse を最適化する](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- ブログ: [ClickHouse における時系列データの取り扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
