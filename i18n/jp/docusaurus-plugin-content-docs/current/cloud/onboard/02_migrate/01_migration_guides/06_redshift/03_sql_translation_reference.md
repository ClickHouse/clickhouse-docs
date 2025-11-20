---
sidebar_label: 'SQL 移行リファレンス'
slug: /migrations/redshift/sql-translation-reference
description: 'Amazon Redshift から ClickHouse への SQL 移行リファレンス'
keywords: ['Redshift']
title: 'Amazon Redshift SQL 移行ガイド'
doc_type: 'reference'
---



# Amazon Redshift SQL 翻訳ガイド



## データ型 {#data-types}

ClickHouseとRedshift間でデータを移行するユーザーは、ClickHouseがより豊富な型を提供しており、制約も少ないことにすぐに気づくでしょう。Redshiftでは可変長であっても文字列の長さを指定する必要がありますが、ClickHouseは文字列をバイト列としてエンコードせずに格納することで、この制約とユーザーの負担を取り除いています。そのため、ClickHouseのString型には制限や長さ指定の要件がありません。

さらに、ユーザーはArray、Tuple、Enumを活用できます。これらはRedshiftでは第一級の型として存在せず（`SUPER`を使用してArray/Structを模倣することは可能ですが）、ユーザーの共通の不満点となっています。ClickHouseはさらに、クエリ実行時またはテーブル内での集約状態の永続化を可能にします。これにより、通常はマテリアライズドビューを使用してデータを事前集約でき、一般的なクエリのパフォーマンスを劇的に向上させることができます。

以下に、各Redshift型に対応するClickHouse型のマッピングを示します:


| Redshift                                                                                                                             | ClickHouse                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`SMALLINT`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                | [`Int8`](/sql-reference/data-types/int-uint)-                                                                                                                                                                                                |
| [`INTEGER`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                 | [`Int32`](/sql-reference/data-types/int-uint)-                                                                                                                                                                                               |
| [`BIGINT`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                  | [`Int64`](/sql-reference/data-types/int-uint)-                                                                                                                                                                                               |
| [`DECIMAL`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-decimal-or-numeric-type)       | [`UInt128`, `UInt256`, `Int128`, `Int256`](/sql-reference/data-types/int-uint)（高精度かつ広範囲が可能）[`Decimal(P, S)`, `Decimal32(S)`, `Decimal64(S)`, `Decimal128(S)`, `Decimal256(S)`](/sql-reference/data-types/decimal)- (高い精度と広い範囲をサポート)          |
| [`REAL`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-floating-point-types)             | [`Float32`](/sql-reference/data-types/float)                                                                                                                                                                                                 |
| [`DOUBLE PRECISION`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-floating-point-types) | [`Float64`](/sql-reference/data-types/float)                                                                                                                                                                                                 |
| [`BOOLEAN`](https://docs.aws.amazon.com/redshift/latest/dg/r_Boolean_type.html)                                                      | [`Bool`](/sql-reference/data-types/boolean)                                                                                                                                                                                                  |
| [`CHAR`](https://docs.aws.amazon.com/redshift/latest/dg/r_Character_types.html#r_Character_types-char-or-character)                  | [`String`](/sql-reference/data-types/string),[`FixedString`](/sql-reference/data-types/fixedstring)                                                                                                                                          |
| [`VARCHAR`](https://docs.aws.amazon.com/redshift/latest/dg/r_Character_types.html#r_Character_types-varchar-or-character-varying)**  | [`String`](/sql-reference/data-types/string)                                                                                                                                                                                                 |
| [`DATE`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-date)                                 | [`Date32`](/sql-reference/data-types/date32)                                                                                                                                                                                                 |
| [`TIMESTAMP`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timestamp)                       | [`DateTime`](/sql-reference/data-types/datetime),[`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                        |
| [`TIMESTAMPTZ`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timestamptz)                   | [`DateTime`](/sql-reference/data-types/datetime),[`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                        |
| [`GEOMETRY`](https://docs.aws.amazon.com/redshift/latest/dg/geospatial-overview.html)                                                | [地理空間データ型](/sql-reference/data-types/geo)                                                                                                                                                                                                    |
| [`GEOGRAPHY`](https://docs.aws.amazon.com/redshift/latest/dg/geospatial-overview.html)                                               | [地理データ型](/sql-reference/data-types/geo)(あまり発達していない例: 座標系がないなど。ただし関数(/sql-reference/functions/geo/)で擬似的に再現可能)[関数で実現可能](/sql-reference/functions/geo/)（開発中。例：座標系がない。関数](/sql-reference/functions/geo/) でエミュレート可能）                              |
| [`HLLSKETCH`](https://docs.aws.amazon.com/redshift/latest/dg/r_HLLSKTECH_type.html)                                                  | [`AggregateFunction(uniqHLL12, X)`](/sql-reference/data-types/aggregatefunction)                                                                                                                                                             |
| [`SUPER`](https://docs.aws.amazon.com/redshift/latest/dg/r_SUPER_type.html)                                                          | [`Tuple`](/sql-reference/data-types/tuple)、[`Nested`](/sql-reference/data-types/nested-data-structures/nested)、[`Array`](/sql-reference/data-types/array)、[`JSON`](/sql-reference/data-types/newjson),[`Map`](/sql-reference/data-types/map) |
| [`TIME`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-time)                                 | [`DateTime`](/sql-reference/data-types/datetime),[`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                        |
| [`TIMETZ`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timetz)                             | [`DateTime`](/sql-reference/data-types/datetime),[`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                        |
| [`VARBYTE`](https://docs.aws.amazon.com/redshift/latest/dg/r_VARBYTE_type.html)**                                                    | [`String`](/sql-reference/data-types/string)HEX 関数と組み合わせて使用[`ビット`](/sql-reference/functions/bit-functions)および[エンコード](/sql-reference/functions/encoding-functions/#hex)関数                                                                     |



<sub><span>*</span> ClickHouse は、拡張された範囲を持つ符号なし整数、すなわち <a href='http://clickhouse.com/docs/sql-reference/data-types/int-uint'>`UInt8`、`UInt16`、`UInt32`、`UInt64`</a> もサポートしています。</sub><br />
<sub><span>**</span>ClickHouse の String 型はデフォルトでは長さに制限がありませんが、<a href='http://clickhouse.com/docs/sql-reference/statements/create/table#constraints'>Constraints</a> を使用して特定の長さに制約することができます。</sub>



## DDL構文 {#compression}

### ソートキー {#sorting-keys}

ClickHouseとRedshiftはどちらも「ソートキー」という概念を持ち、データ保存時のソート方法を定義します。Redshiftでは`SORTKEY`句を使用してソートキーを定義します：

```sql
CREATE TABLE some_table(...) SORTKEY (column1, column2)
```

対して、ClickHouseでは`ORDER BY`句を使用してソート順を指定します：

```sql
CREATE TABLE some_table(...) ENGINE = MergeTree ORDER BY (column1, column2)
```

ほとんどの場合、デフォルトの`COMPOUND`タイプを使用している限り、Redshiftと同じソートキーの列と順序をClickHouseでも使用できます。Redshiftにデータを追加する際は、`VACUUM`および`ANALYZE`コマンドを実行して、新しく追加されたデータを再ソートし、クエリプランナーの統計情報を更新する必要があります。これを行わないと、未ソート領域が増大します。ClickHouseではこのようなプロセスは不要です。

Redshiftはソートキーに関していくつかの便利な機能をサポートしています。1つ目は自動ソートキー（`SORTKEY AUTO`を使用）です。これは導入時には適切かもしれませんが、ソートキーが最適化されている場合、明示的なソートキーを使用することで最高のパフォーマンスとストレージ効率が保証されます。2つ目は`INTERLEAVED`ソートキーで、ソートキー内の列のサブセットに等しい重みを与え、クエリが1つ以上のセカンダリソート列を使用する場合のパフォーマンスを向上させます。ClickHouseは明示的な[プロジェクション](/data-modeling/projections)をサポートしており、若干異なる設定で同じ結果を実現します。

ユーザーは、「プライマリキー」の概念がClickHouseとRedshiftでは異なるものを表すことを認識しておく必要があります。Redshiftでは、プライマリキーは制約を強制することを目的とした従来のRDBMSの概念に似ています。ただし、Redshiftでは厳密には強制されず、クエリプランナーやノード間のデータ分散のヒントとして機能します。ClickHouseでは、プライマリキーはスパースプライマリインデックスの構築に使用される列を示し、ディスク上でデータが順序付けられることを保証することで、プライマリインデックスの汚染やメモリの浪費を回避しながら圧縮を最大化します。
