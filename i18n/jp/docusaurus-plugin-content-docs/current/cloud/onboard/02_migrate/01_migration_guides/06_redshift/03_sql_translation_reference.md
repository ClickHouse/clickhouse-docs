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

ClickHouseとRedshift間でデータを移行するユーザーは、ClickHouseがより豊富な型を提供しており、制約も少ないことにすぐに気付くでしょう。Redshiftでは可変長であってもユーザーが文字列の長さを指定する必要がありますが、ClickHouseは文字列をエンコードせずにバイト列として格納することで、この制約と負担をユーザーから取り除いています。したがって、ClickHouseのString型には制限や長さ指定の要件がありません。

さらに、ユーザーはArray、Tuple、Enumを活用できます。これらはRedshiftでは第一級の型として存在せず（`SUPER`を使用してArray/Structを模倣することは可能ですが）、ユーザーの一般的な不満点となっています。ClickHouseはさらに、クエリ時またはテーブル内での集約状態の永続化を可能にします。これにより、通常はマテリアライズドビューを使用してデータを事前集約することができ、一般的なクエリのパフォーマンスを劇的に向上させることができます。

以下に、各Redshift型に対応するClickHouse型のマッピングを示します:


| Redshift                                                                                                                             | ClickHouse                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`SMALLINT`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                | [`Int8`](/sql-reference/data-types/int-uint)-                                                                                                                                                                                                |
| [`INTEGER`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                 | [`Int32`](/sql-reference/data-types/int-uint)-                                                                                                                                                                                               |
| [`BIGINT`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                  | [`Int64`](/sql-reference/data-types/int-uint)-                                                                                                                                                                                               |
| [`DECIMAL`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-decimal-or-numeric-type)       | [`UInt128`, `UInt256`, `Int128`, `Int256`](/sql-reference/data-types/int-uint),[`Decimal(P, S)`, `Decimal32(S)`, `Decimal64(S)`, `Decimal128(S)`, `Decimal256(S)`](/sql-reference/data-types/decimal)- （高精度かつ広い範囲に対応）                        |
| [`REAL`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-floating-point-types)             | [`Float32`](/sql-reference/data-types/float)                                                                                                                                                                                                 |
| [`DOUBLE PRECISION`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-floating-point-types) | [`Float64`](/sql-reference/data-types/float)                                                                                                                                                                                                 |
| [`BOOLEAN`](https://docs.aws.amazon.com/redshift/latest/dg/r_Boolean_type.html)                                                      | [`Bool`](/sql-reference/data-types/boolean)                                                                                                                                                                                                  |
| [`CHAR`](https://docs.aws.amazon.com/redshift/latest/dg/r_Character_types.html#r_Character_types-char-or-character)                  | [`String`](/sql-reference/data-types/string)、[`FixedString`](/sql-reference/data-types/fixedstring)                                                                                                                                          |
| [`VARCHAR`](https://docs.aws.amazon.com/redshift/latest/dg/r_Character_types.html#r_Character_types-varchar-or-character-varying)**  | [`String`](/sql-reference/data-types/string)                                                                                                                                                                                                 |
| [`DATE`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-date)                                 | [`Date32`](/sql-reference/data-types/date32)                                                                                                                                                                                                 |
| [`TIMESTAMP`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timestamp)                       | [`DateTime`](/sql-reference/data-types/datetime),[`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                        |
| [`TIMESTAMPTZ`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timestamptz)                   | [`DateTime`](/sql-reference/data-types/datetime),[`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                        |
| [`GEOMETRY`](https://docs.aws.amazon.com/redshift/latest/dg/geospatial-overview.html)                                                | [ジオデータ型](/sql-reference/data-types/geo)                                                                                                                                                                                                      |
| [`GEOGRAPHY`](https://docs.aws.amazon.com/redshift/latest/dg/geospatial-overview.html)                                               | [ジオデータ型](/sql-reference/data-types/geo)(機能は比較的未成熟、例：座標系なし — 関数でエミュレーション可能[関数を使用](/sql-reference/functions/geo/))（開発途上。たとえば座標系がない — 関数でエミュレート可能）                                                                                              |
| [`HLLSKETCH`](https://docs.aws.amazon.com/redshift/latest/dg/r_HLLSKTECH_type.html)                                                  | [`AggregateFunction(uniqHLL12, X)`](/sql-reference/data-types/aggregatefunction)                                                                                                                                                             |
| [`SUPER`](https://docs.aws.amazon.com/redshift/latest/dg/r_SUPER_type.html)                                                          | [`Tuple`](/sql-reference/data-types/tuple),[`Nested`](/sql-reference/data-types/nested-data-structures/nested),[`Array`](/sql-reference/data-types/array),[`JSON`](/sql-reference/data-types/newjson),[`Map`](/sql-reference/data-types/map) |
| [`TIME`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-time)                                 | [`DateTime`](/sql-reference/data-types/datetime),[`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                        |
| [`TIMETZ`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timetz)                             | [`DateTime`](/sql-reference/data-types/datetime),[`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                        |
| [`VARBYTE`](https://docs.aws.amazon.com/redshift/latest/dg/r_VARBYTE_type.html)**                                                    | [`String`](/sql-reference/data-types/string)と組み合わせて[`Bit`](/sql-reference/functions/bit-functions)および[エンコード](/sql-reference/functions/encoding-functions/#hex)関数                                                                             |



<sub><span>*</span> ClickHouse は、拡張された範囲を持つ符号なし整数、すなわち <a href='http://clickhouse.com/docs/sql-reference/data-types/int-uint'>`UInt8`、`UInt16`、`UInt32`、`UInt64`</a> もサポートしています。</sub><br />
<sub><span>**</span>ClickHouse の String 型はデフォルトでは長さが無制限ですが、<a href='http://clickhouse.com/docs/sql-reference/statements/create/table#constraints'>Constraints</a> を使用して特定の長さに制限できます。</sub>



## DDL構文 {#compression}

### ソートキー {#sorting-keys}

ClickHouseとRedshiftはどちらも「ソートキー」という概念を持ち、データ保存時のソート方法を定義します。Redshiftでは`SORTKEY`句を使用してソートキーを定義します：

```sql
CREATE TABLE some_table(...) SORTKEY (column1, column2)
```

対して、ClickHouseでは`ORDER BY`句を使用してソート順序を指定します：

```sql
CREATE TABLE some_table(...) ENGINE = MergeTree ORDER BY (column1, column2)
```

ほとんどの場合、デフォルトの`COMPOUND`タイプを使用している限り、Redshiftと同じソートキーの列と順序をClickHouseでも使用できます。Redshiftにデータを追加する際は、`VACUUM`および`ANALYZE`コマンドを実行して新しく追加されたデータを再ソートし、クエリプランナーの統計情報を更新する必要があります。これを行わないと、未ソート領域が増大します。ClickHouseではこのようなプロセスは不要です。

Redshiftはソートキーに関していくつかの便利な機能をサポートしています。1つ目は自動ソートキー（`SORTKEY AUTO`を使用）です。これは導入時には適切かもしれませんが、ソートキーが最適化されている場合、明示的なソートキーを使用することで最高のパフォーマンスとストレージ効率が保証されます。2つ目は`INTERLEAVED`ソートキーで、ソートキー内の列のサブセットに等しい重みを与え、クエリが1つ以上のセカンダリソート列を使用する際のパフォーマンスを向上させます。ClickHouseは明示的な[プロジェクション](/data-modeling/projections)をサポートしており、若干異なる設定で同じ結果を実現します。

ユーザーは、「プライマリキー」の概念がClickHouseとRedshiftでは異なるものを表すことを認識しておく必要があります。Redshiftでは、プライマリキーは制約を強制することを目的とした従来のRDBMSの概念に似ています。しかし、Redshiftでは厳密には強制されず、クエリプランナーやノード間のデータ分散のヒントとして機能します。ClickHouseでは、プライマリキーはスパースプライマリインデックスの構築に使用される列を示し、ディスク上でデータが順序付けられることを保証することで、圧縮を最大化しながらプライマリインデックスの汚染とメモリの浪費を回避します。
