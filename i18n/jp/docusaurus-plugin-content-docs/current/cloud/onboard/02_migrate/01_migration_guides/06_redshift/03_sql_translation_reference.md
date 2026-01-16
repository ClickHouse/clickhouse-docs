---
sidebar_label: 'SQL 変換リファレンス'
slug: /migrations/redshift/sql-translation-reference
description: 'Amazon Redshift から ClickHouse への SQL 変換リファレンス'
keywords: ['Redshift']
title: 'Amazon Redshift SQL 変換ガイド'
doc_type: 'reference'
---

# Amazon Redshift SQL 変換ガイド \\{#amazon-redshift-sql-translation-guide\\}

## データ型 \\{#data-types\\}

ClickHouse と Redshift 間でデータを移動するユーザーは、ClickHouse がより幅広く、かつ制約の少ない型を提供していることにすぐ気付くでしょう。Redshift では、可変長の場合であってもユーザーは文字列の長さを指定する必要がありますが、ClickHouse は文字列をエンコードせずバイト列として格納することで、この制限と負担をユーザーから取り除きます。そのため、ClickHouse の `String` 型には長さの上限や長さ指定の要件がありません。

さらに、Redshift には第一級のデータ型としては存在しない（`SUPER` を使用して配列や構造体を模倣することは可能なものの、多くのユーザーの不満の原因となっている）`Array`、`Tuple`、`Enum` を活用できます。加えて ClickHouse では、集約状態をクエリ時、あるいはテーブル内に保持することも可能です。これにより、通常はマテリアライズドビューを使用してデータを事前集約でき、よく実行されるクエリのパフォーマンスを劇的に向上させることができます。

以下では、各 Redshift 型に対して同等の ClickHouse 型を対応付けて示します。

| Redshift                                                                                                                             | ClickHouse                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`SMALLINT`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                | [`Int8`](/sql-reference/data-types/int-uint) *                                                                                                                                                                                                   |
| [`INTEGER`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                 | [`Int32`](/sql-reference/data-types/int-uint) *                                                                                                                                                                                                  |
| [`BIGINT`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                  | [`Int64`](/sql-reference/data-types/int-uint) *                                                                                                                                                                                                  |
| [`DECIMAL`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-decimal-or-numeric-type)       | [`UInt128`, `UInt256`, `Int128`, `Int256`](/sql-reference/data-types/int-uint), [`Decimal(P, S)`, `Decimal32(S)`, `Decimal64(S)`, `Decimal128(S)`, `Decimal256(S)`](/sql-reference/data-types/decimal) - （高精度かつ広い範囲を扱える）                         |
| [`REAL`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-floating-point-types)             | [`Float32`](/sql-reference/data-types/float)                                                                                                                                                                                                     |
| [`DOUBLE PRECISION`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-floating-point-types) | [`Float64`](/sql-reference/data-types/float)                                                                                                                                                                                                     |
| [`BOOLEAN`](https://docs.aws.amazon.com/redshift/latest/dg/r_Boolean_type.html)                                                      | [`Bool`](/sql-reference/data-types/boolean)                                                                                                                                                                                                      |
| [`CHAR`](https://docs.aws.amazon.com/redshift/latest/dg/r_Character_types.html#r_Character_types-char-or-character)                  | [`String`](/sql-reference/data-types/string), [`FixedString`](/sql-reference/data-types/fixedstring)                                                                                                                                             |
| [`VARCHAR`](https://docs.aws.amazon.com/redshift/latest/dg/r_Character_types.html#r_Character_types-varchar-or-character-varying) ** | [`String`](/sql-reference/data-types/string)                                                                                                                                                                                                     |
| [`DATE`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-date)                                 | [`Date32`](/sql-reference/data-types/date32)                                                                                                                                                                                                     |
| [`TIMESTAMP`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timestamp)                       | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                           |
| [`TIMESTAMPTZ`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timestamptz)                   | [`DateTime`](/sql-reference/data-types/datetime)、[`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                            |
| [`GEOMETRY`](https://docs.aws.amazon.com/redshift/latest/dg/geospatial-overview.html)                                                | [地理データ型](/sql-reference/data-types/geo)                                                                                                                                                                                                          |
| [`GEOGRAPHY`](https://docs.aws.amazon.com/redshift/latest/dg/geospatial-overview.html)                                               | [Geo Data Types](/sql-reference/data-types/geo)（機能はまだ十分ではない（例: 座標系がない）が、[関数](/sql-reference/functions/geo/)でエミュレート可能）                                                                                                                            |
| [`HLLSKETCH`](https://docs.aws.amazon.com/redshift/latest/dg/r_HLLSKTECH_type.html)                                                  | [`AggregateFunction(uniqHLL12, X)`](/sql-reference/data-types/aggregatefunction)                                                                                                                                                                 |
| [`SUPER`](https://docs.aws.amazon.com/redshift/latest/dg/r_SUPER_type.html)                                                          | [`Tuple`](/sql-reference/data-types/tuple), [`Nested`](/sql-reference/data-types/nested-data-structures/nested), [`Array`](/sql-reference/data-types/array), [`JSON`](/sql-reference/data-types/newjson), [`Map`](/sql-reference/data-types/map) |
| [`TIME`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-time)                                 | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                           |
| [`TIMETZ`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timetz)                             | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                           |
| [`VARBYTE`](https://docs.aws.amazon.com/redshift/latest/dg/r_VARBYTE_type.html) **                                                   | [`String`](/sql-reference/data-types/string) を [`Bit`](/sql-reference/functions/bit-functions) 関数および [Encoding](/sql-reference/functions/encoding-functions/#hex) 関数と組み合わせて使用する                                                                  |

<sub><span>*</span> ClickHouse は、より広い範囲を持つ符号なし整数、すなわち <a href='http://clickhouse.com/docs/sql-reference/data-types/int-uint'>`UInt8`、`UInt32`、`UInt32`、`UInt64`</a> もサポートしています。</sub><br />
<sub><span>**</span>ClickHouse の String 型はデフォルトでは長さが無制限ですが、<a href='http://clickhouse.com/docs/sql-reference/statements/create/table#constraints'>Constraints</a> を使用して特定の長さに制限できます。</sub>

## DDL 構文 \\{#compression\\}

### ソートキー \{#sorting-keys\}

ClickHouse と Redshift の両方には「ソートキー」という概念があり、
データを保存する際にどのような順序で格納するかを定義します。Redshift では、
`SORTKEY` 句を使ってソートキーを定義します。

```sql
CREATE TABLE some_table(...) SORTKEY (column1, column2)
```

一方、ClickHouse では `ORDER BY` 句を使ってソート順を指定します。

```sql
CREATE TABLE some_table(...) ENGINE = MergeTree ORDER BY (column1, column2)
```

ほとんどの場合、デフォルトの `COMPOUND` 型を使用している前提で、ClickHouse では
Redshift と同じソートキーのカラムおよび順序を利用できます。Redshift にデータが
追加された際には、新しく追加されたデータを再ソートし、クエリプランナー用の統計情報を更新するために
`VACUUM` と `ANALYZE` コマンドを実行する必要があります。そうしないと、未ソート領域が
増大していきます。ClickHouse ではそのような処理は不要です。

Redshift はソートキー用のいくつかの便利な機能をサポートしています。1 つは
自動ソートキー（`SORTKEY AUTO` の使用）です。これは導入初期には適切な場合がありますが、
ソートキーが最適な場合には、明示的なソートキーを指定するほうが
最高のパフォーマンスとストレージ効率を得られます。2 つ目は `INTERLEAVED` ソートキーで、
ソートキー内の一部のカラムに同じ重みを与えることで、クエリが 1 つ以上のセカンダリソートカラムを
利用する場合のパフォーマンスを向上させます。ClickHouse は明示的な
[projections](/data-modeling/projections) をサポートしており、
セットアップはやや異なりますが、同様の結果を実現します。

「primary key」という概念が ClickHouse と Redshift で
異なるものを表していることを理解しておく必要があります。Redshift における primary key は、
制約を強制することを意図した、従来の RDBMS の概念に似ています。しかし、Redshift では
これらは厳密には強制されず、代わりにクエリプランナーおよびノード間でのデータ分散のための
ヒントとして機能します。ClickHouse では、primary key はスパースなプライマリインデックスを
構成するために使用されるカラムを示し、ディスク上でデータが順序付けられていることを保証して
圧縮率を最大化しつつ、プライマリインデックスを汚染してメモリを無駄に消費することを避けます。
