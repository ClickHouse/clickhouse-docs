---
sidebar_label: 'SQL 変換リファレンス'
slug: /migrations/snowflake-translation-reference
description: 'SQL 変換リファレンス'
keywords: ['Snowflake']
title: 'Snowflake から ClickHouse への移行'
show_related_blogs: true
doc_type: 'guide'
---

# Snowflake SQL 変換ガイド {#snowflake-sql-translation-guide}

## データ型 {#data-types}

### 数値型 {#numerics}

ClickHouse と Snowflake 間でデータを移動するユーザーは、数値型の宣言に関して、ClickHouse の方がより細かい精度指定を提供していることにすぐに気づくでしょう。例えば、
Snowflake は数値型として Number 型を提供します。これはユーザーが 
精度（桁数の合計）とスケール（小数点以下の桁数）を最大 38 まで指定することを要求します。
整数の宣言は Number と同義であり、範囲が同じとなるように固定の精度とスケールを
単に定義します。この利便性は、精度を変更しても（整数の場合、スケールは 0）
Snowflake 上でのディスク上のデータサイズに影響しないために可能となっています。
書き込み時にはマイクロパーティション単位で、その数値範囲に必要な最小限のバイト数が
使用されます。ただしスケールはストレージ容量に影響し、その影響は圧縮によって軽減されます。
`Float64` 型は、精度を犠牲にする代わりに、より広い値の範囲を提供します。

これと対照的に、ClickHouse は符号付きおよび符号なしの複数のビット幅の
浮動小数点数および整数型を提供します。これにより、整数に必要な精度を明示的に指定して、
ストレージおよびメモリのオーバーヘッドを最適化できます。
Snowflake の Number 型と同等の Decimal 型は、最大 76 桁まで指定でき、Snowflake よりも
2 倍の精度とスケールを提供します。同様の `Float64` 値に加えて、
ClickHouse は精度がそれほど重要ではなく、圧縮が最優先となる場合のために
`Float32` も提供します。

### 文字列型 {#strings}

ClickHouse と Snowflake は、文字列データの保存方法について対照的なアプローチを取ります。
Snowflake の `VARCHAR` は UTF-8 の Unicode 文字を保持し、ユーザーが
最大長を指定できるようにします。この長さはストレージやパフォーマンスには影響せず、
文字列を格納するために常に最小限のバイト数が使用されます。そのため、長さ指定は
下流のツールで有用な制約を提供するだけです。`Text` や `NChar` といった他の型は、
この型の単なるエイリアスです。対照的に ClickHouse は、すべての
[文字列データを生のバイト列として](/sql-reference/data-types/string) `String`
型で保存します（長さの指定は不要）。エンコーディングはユーザーに委ねられ、
さまざまなエンコーディングに対しては
[クエリ時の関数](/sql-reference/functions/string-functions#lengthUTF8) が利用できます。
その理由付けについては ["Opaque data argument"](https://utf8everywhere.org/#cookie)
を参照してください。このため ClickHouse の `String` は、その実装上、
Snowflake の Binary 型により近いと言えます。[Snowflake](https://docs.snowflake.com/en/sql-reference/collation)
と [ClickHouse](/sql-reference/statements/select/order-by#collation-support) の両方が
「照合順序（collation）」をサポートしており、ユーザーは文字列のソートおよび比較方法を
カスタマイズできます。

### 準構造化データ型 {#semi-structured-data}

Snowflake は、準構造化データ向けに `VARIANT`、`OBJECT`、`ARRAY` 型を
サポートしています。

ClickHouse は、同等の [`Variant`](/sql-reference/data-types/variant) と
`Object`（現在はネイティブな `JSON` 型に置き換えられ非推奨）および
[`Array`](/sql-reference/data-types/array) 型を提供します。さらに ClickHouse には
[`JSON`](/sql-reference/data-types/newjson) 型があり、これは現在非推奨の
`Object('json')` 型を置き換え、特に
[他のネイティブ JSON 型と比較して](https://jsonbench.com/)
高いパフォーマンスとストレージ効率を実現します。

ClickHouse は、名前付きの [`Tuple`](/sql-reference/data-types/tuple) および
[`Nested`](/sql-reference/data-types/nested-data-structures/nested) 型を通じた
Tuple の配列もサポートしており、ユーザーが入れ子構造を明示的にマッピングできます。
これにより、Snowflake とは異なり、階層全体にわたってコーデックや型の
最適化を適用できます。Snowflake では外側のオブジェクトに対して
`OBJECT`、`VARIANT`、`ARRAY` 型を使用する必要があり、
[内部型を明示的に指定することはできません](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#characteristics-of-an-object)。
ClickHouse におけるこの内部型指定は、入れ子になった数値に対するクエリを単純化し、
キャストが不要でインデックス定義にもそのまま使用できます。

ClickHouse では、サブ構造にもコーデックや最適化された型を適用できます。
これにより、入れ子構造を持つデータでも圧縮効率が高く、
フラット化されたデータと同等の優れた結果が得られるという
追加の利点があります。対照的に、サブ構造に対して特定の型を適用できない結果として、
Snowflake では最適な圧縮を実現するために
[入れ子構造をフラット化することを推奨](https://docs.snowflake.com/en/user-guide/semistructured-considerations#storing-semi-structured-data-in-a-variant-column-vs-flattening-the-nested-structure)
しています。また、Snowflake はこれらのデータ型に対して
[サイズ制限を課しています](https://docs.snowflake.com/en/user-guide/semistructured-considerations#data-size-limitations)。

### 型リファレンス {#type-reference}

| Snowflake                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | ClickHouse                                                                                                                          | 注記                                                                                                                                                                                                                                          |   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | - |
| [`NUMBER`](https://docs.snowflake.com/en/sql-reference/data-types-numeric)                                                                                                                                                                                                                                                                                                                                                                                                      | [`Decimal`](/sql-reference/data-types/decimal)                                                                                      | ClickHouse は Snowflake よりも精度とスケールを 2 倍高い値までサポートしており、76 桁に対して Snowflake は 38 桁です。                                                                                                                                                            |   |
| [`FLOAT`, `FLOAT4`, `FLOAT8`](https://docs.snowflake.com/en/sql-reference/data-types-numeric#data-types-for-floating-point-numbers)                                                                                                                                                                                                                                                                                                                                             | [`Float32`, `Float64`](/sql-reference/data-types/float)                                                                             | Snowflake では、すべての浮動小数点数は 64 ビットです。                                                                                                                                                                                                          |   |
| [`VARCHAR`](https://docs.snowflake.com/en/sql-reference/data-types-text#varchar)                                                                                                                                                                                                                                                                                                                                                                                                | [`String`](/sql-reference/data-types/string)                                                                                        |                                                                                                                                                                                                                                             |   |
| [`BINARY`](https://docs.snowflake.com/en/sql-reference/data-types-text#binary)                                                                                                                                                                                                                                                                                                                                                                                                  | [`String`](/sql-reference/data-types/string)                                                                                        |                                                                                                                                                                                                                                             |   |
| [`BOOLEAN`](https://docs.snowflake.com/en/sql-reference/data-types-logical)                                                                                                                                                                                                                                                                                                                                                                                                     | [`Bool`](/sql-reference/data-types/boolean)                                                                                         |                                                                                                                                                                                                                                             |   |
| [`DATE`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#date)                                                                                                                                                                                                                                                                                                                                                                                                  | [`Date`](/sql-reference/data-types/date), [`Date32`](/sql-reference/data-types/date32)                                              | Snowflake の `DATE` は ClickHouse よりも広い日付範囲を扱えます。たとえば、`Date32` の最小値は `1900-01-01`、`Date` の最小値は `1970-01-01` です。ClickHouse の `Date` は、よりコスト効率の高い（2 バイトの）ストレージを提供します。                                                                           |   |
| [`TIME(N)`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#time)                                                                                                                                                                                                                                                                                                                                                                                               | 完全に対応する型はありませんが、[`DateTime`](/sql-reference/data-types/datetime) と [`DateTime64(N)`](/sql-reference/data-types/datetime64) で表現できます。 | `DateTime64` でも同じ精度の概念が使われます。                                                                                                                                                                                                               |   |
| [`TIMESTAMP`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp) - [`TIMESTAMP_LTZ`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp-ltz-timestamp-ntz-timestamp-tz), [`TIMESTAMP_NTZ`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp-ltz-timestamp-ntz-timestamp-tz), [`TIMESTAMP_TZ`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp-ltz-timestamp-ntz-timestamp-tz) | [`DateTime`](/sql-reference/data-types/datetime)と[`DateTime64`](/sql-reference/data-types/datetime64)                               | `DateTime` と `DateTime64` では、列に対してオプションとして TZ パラメータを定義できます。指定されていない場合は、サーバーのタイムゾーンが使用されます。さらに、クライアントには `--use_client_time_zone` パラメータも用意されています。                                                                                             |   |
| [`VARIANT`](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#variant)                                                                                                                                                                                                                                                                                                                                                                                      | [`JSON`, `Tuple`, `Nested`](/interfaces/formats)                                                                                    | `JSON` 型は ClickHouse において実験的機能です。この型では挿入時に列の型が推論されます。代替として、`Tuple`、`Nested`、`Array` を使用して、明示的に型付けされた構造を構築することもできます。                                                                                                                         |   |
| [`OBJECT`](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#object)                                                                                                                                                                                                                                                                                                                                                                                        | [`Tuple`, `Map`, `JSON`](/interfaces/formats)                                                                                       | `OBJECT` と `Map` はどちらも、キーが `String` である ClickHouse の `JSON` 型に相当します。ClickHouse では値が一貫していて強い型付けであることが求められますが、Snowflake では `VARIANT` が使用されます。これは、異なるキーごとに異なる型の値を持てることを意味します。ClickHouse でこれが必要な場合は、`Tuple` を使って階層を明示的に定義するか、`JSON` 型を使用してください。 |   |
| [`ARRAY`](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#array)                                                                                                                                                                                                                                                                                                                                                                                          | [`Array`](/sql-reference/data-types/array), [`Nested`](/sql-reference/data-types/nested-data-structures/nested)                     | Snowflake の `ARRAY` は、要素にスーパータイプである `VARIANT` を使用します。対照的に、ClickHouse ではこれらの要素は厳密に型付けされています。                                                                                                                                                 |   |
| [`GEOGRAPHY`](https://docs.snowflake.com/en/sql-reference/data-types-geospatial#geography-data-type)                                                                                                                                                                                                                                                                                                                                                                            | [`Point`, `Ring`, `Polygon`, `MultiPolygon`](/sql-reference/data-types/geo)                                                         | Snowflake では座標系 (WGS 84) が固定されますが、ClickHouse ではクエリ実行時に座標系を適用します。                                                                                                                                                                            |   |
| [`GEOMETRY`](https://docs.snowflake.com/en/sql-reference/data-types-geospatial#geometry-data-type)                                                                                                                                                                                                                                                                                                                                                                              | [`Point`, `Ring`, `Polygon`, `MultiPolygon`](/sql-reference/data-types/geo)                                                         |                                                                                                                                                                                                                                             |   |

| ClickHouse Type   | Description                                                                                         |
|-------------------|-----------------------------------------------------------------------------------------------------|
| `IPv4` and `IPv6` | IP 固有の型であり、Snowflake と比較してより効率的に保存できる可能性があります。                        |
| `FixedString`     | 固定長のバイト列を使用でき、ハッシュに有用です。                                                     |
| `LowCardinality`  | 任意の型を辞書エンコードできるようにします。カーディナリティが 100k 未満と見込まれる場合に有用です。      |
| `Enum`            | 名前付き値を 8 または 16 ビットの範囲で効率的にエンコードできます。                                   |
| `UUID`            | UUID を効率的に保存するための型です。                                                                |
| `Array(Float32)`  | ベクトルは、距離関数をサポートする Float32 の配列として表現できます。                                 |

最後に、ClickHouse は中間的な
[集約関数の状態](/sql-reference/data-types/aggregatefunction) を保存できるという、独自の機能を提供します。この状態は実装依存ですが、集約結果を保存しておき、後で（対応するマージ関数を用いて）クエリできるようにします。通常、この機能はマテリアライズドビューを介して利用され、以下で示すように、挿入されたデータに対するクエリの増分結果を保存することで、最小限のストレージコストで特定のクエリのパフォーマンスを向上させることができます（詳細は後述します）。