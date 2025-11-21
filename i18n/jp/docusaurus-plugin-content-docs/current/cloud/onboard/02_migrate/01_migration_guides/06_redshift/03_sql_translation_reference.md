---
sidebar_label: 'SQL 変換リファレンス'
slug: /migrations/redshift/sql-translation-reference
description: 'Amazon Redshift から ClickHouse への SQL 変換リファレンス'
keywords: ['Redshift']
title: 'Amazon Redshift SQL 変換ガイド'
doc_type: 'reference'
---



# Amazon Redshift SQL 変換ガイド



## データ型 {#data-types}

ClickHouseとRedshift間でデータを移行するユーザーは、ClickHouseがより広範囲な型を提供しており、制約も少ないことにすぐに気付くでしょう。Redshiftでは可変長であってもユーザーが文字列の長さを指定する必要がありますが、ClickHouseは文字列をエンコードせずにバイト列として格納することで、この制約と負担をユーザーから取り除いています。したがって、ClickHouseのString型には制限や長さ指定の要件がありません。

さらに、ユーザーはArray、Tuple、Enumを活用できます。これらはRedshiftでは第一級の型として存在せず（`SUPER`を使用してArray/Structを模倣することは可能ですが）、ユーザーの一般的な不満点となっています。ClickHouseはさらに、クエリ時またはテーブル内での集計状態の永続化を可能にします。これにより、通常はマテリアライズドビューを使用してデータを事前集計することができ、一般的なクエリのパフォーマンスを劇的に向上させることができます。

以下に、各Redshift型に対応するClickHouse型のマッピングを示します:


| Redshift                                                                                                                             | ClickHouse                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`SMALLINT`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                | [`Int8`](/sql-reference/data-types/int-uint) *                                                                                                                                                                                                   |
| [`INTEGER`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                 | [`Int32`](/sql-reference/data-types/int-uint) *                                                                                                                                                                                                  |
| [`BIGINT`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                  | [`Int64`](/sql-reference/data-types/int-uint) *                                                                                                                                                                                                  |
| [`DECIMAL`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-decimal-or-numeric-type)       | [`UInt128`, `UInt256`, `Int128`, `Int256`](/sql-reference/data-types/int-uint), [`Decimal(P, S)`, `Decimal32(S)`, `Decimal64(S)`, `Decimal128(S)`, `Decimal256(S)`](/sql-reference/data-types/decimal) - （高精度かつ広い値の範囲を扱うことが可能）                   |
| [`REAL`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-floating-point-types)             | [`Float32`](/sql-reference/data-types/float)                                                                                                                                                                                                     |
| [`DOUBLE PRECISION`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-floating-point-types) | [`Float64`](/sql-reference/data-types/float)                                                                                                                                                                                                     |
| [`BOOLEAN`](https://docs.aws.amazon.com/redshift/latest/dg/r_Boolean_type.html)                                                      | [`Bool`](/sql-reference/data-types/boolean)                                                                                                                                                                                                      |
| [`CHAR`](https://docs.aws.amazon.com/redshift/latest/dg/r_Character_types.html#r_Character_types-char-or-character)                  | [`String`](/sql-reference/data-types/string), [`FixedString`](/sql-reference/data-types/fixedstring)                                                                                                                                             |
| [`VARCHAR`](https://docs.aws.amazon.com/redshift/latest/dg/r_Character_types.html#r_Character_types-varchar-or-character-varying) ** | [`String`](/sql-reference/data-types/string)                                                                                                                                                                                                     |
| [`DATE`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-date)                                 | [`Date32`](/sql-reference/data-types/date32)                                                                                                                                                                                                     |
| [`TIMESTAMP`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timestamp)                       | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                           |
| [`TIMESTAMPTZ`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timestamptz)                   | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                           |
| [`GEOMETRY`](https://docs.aws.amazon.com/redshift/latest/dg/geospatial-overview.html)                                                | [Geoデータ型](/sql-reference/data-types/geo)                                                                                                                                                                                                         |
| [`GEOGRAPHY`](https://docs.aws.amazon.com/redshift/latest/dg/geospatial-overview.html)                                               | [Geo Data Types](/sql-reference/data-types/geo)（機能はまだ発展途上で、たとえば座標系には未対応だが、[関数](/sql-reference/functions/geo/)でエミュレート可能）                                                                                                                          |
| [`HLLSKETCH`](https://docs.aws.amazon.com/redshift/latest/dg/r_HLLSKTECH_type.html)                                                  | [`AggregateFunction(uniqHLL12, X)`](/sql-reference/data-types/aggregatefunction)                                                                                                                                                                 |
| [`SUPER`](https://docs.aws.amazon.com/redshift/latest/dg/r_SUPER_type.html)                                                          | [`Tuple`](/sql-reference/data-types/tuple), [`Nested`](/sql-reference/data-types/nested-data-structures/nested), [`Array`](/sql-reference/data-types/array), [`JSON`](/sql-reference/data-types/newjson), [`Map`](/sql-reference/data-types/map) |
| [`TIME`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-time)                                 | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                           |
| [`TIMETZ`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timetz)                             | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                           |
| [`VARBYTE`](https://docs.aws.amazon.com/redshift/latest/dg/r_VARBYTE_type.html) **                                                   | データ型 [`String`](/sql-reference/data-types/string) と [`Bit`](/sql-reference/functions/bit-functions) 関数および [Encoding](/sql-reference/functions/encoding-functions/#hex) 関数の組み合わせ                                                                  |



<sub><span>*</span> ClickHouse は、より広い範囲を持つ符号なし整数もサポートしています。たとえば、<a href='http://clickhouse.com/docs/sql-reference/data-types/int-uint'>`UInt8`、`UInt32`、`UInt32`、`UInt64`</a> です。</sub><br />
<sub><span>**</span>ClickHouse の String 型は、デフォルトでは長さに上限がありませんが、<a href='http://clickhouse.com/docs/sql-reference/statements/create/table#constraints'>Constraints（制約）</a> を使用して特定の長さに制限できます。</sub>



## DDL構文 {#compression}

### ソートキー {#sorting-keys}

ClickHouseとRedshiftはどちらも「ソートキー」という概念を持っており、データが保存される際のソート方法を定義します。Redshiftでは`SORTKEY`句を使用してソートキーを定義します：

```sql
CREATE TABLE some_table(...) SORTKEY (column1, column2)
```

一方、ClickHouseでは`ORDER BY`句を使用してソート順序を指定します：

```sql
CREATE TABLE some_table(...) ENGINE = MergeTree ORDER BY (column1, column2)
```

ほとんどの場合、デフォルトの`COMPOUND`タイプを使用している限り、Redshiftと同じソートキーの列と順序をClickHouseでも使用できます。Redshiftにデータを追加した際は、新しく追加されたデータを再ソートし、クエリプランナーの統計情報を更新するために`VACUUM`および`ANALYZE`コマンドを実行する必要があります。これを行わないと、未ソート領域が増大します。ClickHouseではこのようなプロセスは不要です。

Redshiftはソートキーに関していくつかの便利な機能をサポートしています。1つ目は自動ソートキー（`SORTKEY AUTO`を使用）です。これは導入時には適切かもしれませんが、ソートキーが最適化されている場合、明示的なソートキーを使用することで最高のパフォーマンスとストレージ効率が保証されます。2つ目は`INTERLEAVED`ソートキーで、ソートキー内の列のサブセットに等しい重みを与え、クエリが1つ以上のセカンダリソート列を使用する場合のパフォーマンスを向上させます。ClickHouseは明示的な[プロジェクション](/data-modeling/projections)をサポートしており、設定方法は若干異なりますが同じ結果を達成します。

ユーザーは、「プライマリキー」の概念がClickHouseとRedshiftでは異なる意味を持つことを認識しておく必要があります。Redshiftでは、プライマリキーは制約を強制することを目的とした従来のRDBMSの概念に似ています。ただし、Redshiftでは厳密には強制されず、クエリプランナーやノード間のデータ分散のヒントとして機能します。ClickHouseでは、プライマリキーはスパースプライマリインデックスの構築に使用される列を示し、ディスク上でデータの順序を保証することで、プライマリインデックスの肥大化とメモリの浪費を回避しながら圧縮を最大化します。
