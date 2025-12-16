---
description: '型変換関数のドキュメント'
sidebar_label: '型変換'
slug: /sql-reference/functions/type-conversion-functions
title: '型変換関数'
doc_type: 'reference'
---

# 型変換関数 {#type-conversion-functions}

## データ変換でよくある問題 {#common-issues-with-data-conversion}

ClickHouse は一般的に [C++ プログラムと同じ挙動](https://en.cppreference.com/w/cpp/language/implicit_conversion) を採用しています。

`to<type>` 関数と [cast](#cast) は、いくつかのケースで異なる動作をします。たとえば [LowCardinality](../data-types/lowcardinality.md) の場合、[cast](#cast) は [LowCardinality](../data-types/lowcardinality.md) の特性を削除しますが、`to<type>` 関数は削除しません。[Nullable](../data-types/nullable.md) についても同様です。この挙動は SQL 標準とは互換性がなく、[cast&#95;keep&#95;nullable](../../operations/settings/settings.md/#cast_keep_nullable) SETTING を使用して変更できます。

:::note
あるデータ型の値を、より小さいデータ型（たとえば `Int64` から `Int32`）や互換性のないデータ型（たとえば `String` から `Int`）に変換する場合、データが失われる可能性があることに注意してください。結果が期待どおりになっているかを慎重に確認してください。
:::

例:

```sql
SELECT
    toTypeName(toLowCardinality('') AS val) AS source_type,
    toTypeName(toString(val)) AS to_type_result_type,
    toTypeName(CAST(val, 'String')) AS cast_result_type

┌─source_type────────────┬─to_type_result_type────┬─cast_result_type─┐
│ LowCardinality(String) │ LowCardinality(String) │ String           │
└────────────────────────┴────────────────────────┴──────────────────┘

SELECT
    toTypeName(toNullable('') AS val) AS source_type,
    toTypeName(toString(val)) AS to_type_result_type,
    toTypeName(CAST(val, 'String')) AS cast_result_type

┌─source_type──────┬─to_type_result_type─┬─cast_result_type─┐
│ Nullable(String) │ Nullable(String)    │ String           │
└──────────────────┴─────────────────────┴──────────────────┘

SELECT
    toTypeName(toNullable('') AS val) AS source_type,
    toTypeName(toString(val)) AS to_type_result_type,
    toTypeName(CAST(val, 'String')) AS cast_result_type
SETTINGS cast_keep_nullable = 1

┌─source_type──────┬─to_type_result_type─┬─cast_result_type─┐
│ Nullable(String) │ Nullable(String)    │ Nullable(String) │
└──────────────────┴─────────────────────┴──────────────────┘
```


## `toString` 関数に関する注意事項 {#to-string-functions}

`toString` 系の関数は、数値、文字列（ただし FixedString ではない）、日付、および日時の間での変換を行います。
これらの関数はすべて 1 つの引数を受け取ります。

- 文字列への変換または文字列からの変換を行う場合、値は TabSeparated 形式（およびほぼすべての他のテキスト形式）と同じルールに従ってフォーマットまたは解析されます。文字列を解析できない場合は例外がスローされ、クエリはキャンセルされます。
- 日付を数値に変換する場合、またはその逆の場合、日付は Unix エポックの開始からの日数に対応します。
- 日時を数値に変換する場合、またはその逆の場合、日時は Unix エポックの開始からの秒数に対応します。
- `DateTime` 引数に対する `toString` 関数は、タイムゾーン名を含む 2 つ目の String 引数を取ることができます（例: `Europe/Amsterdam`）。この場合、時刻は指定されたタイムゾーンに従ってフォーマットされます。

## `toDate`/`toDateTime` 関数に関する注意事項 {#to-date-and-date-time-functions}

`toDate`/`toDateTime` 関数で使用される日付および日時の形式は、次のように定義されています。

```response
YYYY-MM-DD
YYYY-MM-DD hh:mm:ss
```

例外として、UInt32、Int32、UInt64、または Int64 の数値型から Date への変換において、数値が 65536 以上の場合、その数値は日数ではなく Unix タイムスタンプとして解釈され、日付に丸められます。
これにより、本来であればエラーとなり、より煩雑な `toDate(toDateTime(unix_timestamp))` と書く必要があるところを、よくある `toDate(unix_timestamp)` の記述もサポートできるようになります。

日付と日時との相互変換は、時刻 0 を付加するか、時刻を切り捨てるという自然な方法で行われます。

数値型同士の変換は、C++ における異なる数値型間の代入と同じルールに従います。

**例**

クエリ:

```sql
SELECT
    now() AS ts,
    time_zone,
    toString(ts, time_zone) AS str_tz_datetime
FROM system.time_zones
WHERE time_zone LIKE 'Europe%'
LIMIT 10
```

結果：

```response
┌──────────────────ts─┬─time_zone─────────┬─str_tz_datetime─────┐
│ 2023-09-08 19:14:59 │ Europe/Amsterdam  │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Andorra    │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Astrakhan  │ 2023-09-08 23:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Athens     │ 2023-09-08 22:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Belfast    │ 2023-09-08 20:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Belgrade   │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Berlin     │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Bratislava │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Brussels   │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Bucharest  │ 2023-09-08 22:14:59 │
└─────────────────────┴───────────────────┴─────────────────────┘
```

[`toUnixTimestamp`](#toUnixTimestamp) 関数も参照してください。


## toBool {#tobool}

入力値を型 [`Bool`](../data-types/boolean.md) の値に変換します。エラーが発生した場合は例外を送出します。

**構文**

```sql
toBool(expr)
```

**引数**

* `expr` — 数値または文字列を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値。
* 型 Float32/64 の値。
* 文字列 `true` または `false`（大文字・小文字は区別しない）。

**返される値**

* 引数の評価結果に応じて `true` または `false` を返します。[Bool](../data-types/boolean.md)。

**例**

クエリ:

```sql
SELECT
    toBool(toUInt8(1)),
    toBool(toInt8(-1)),
    toBool(toFloat32(1.01)),
    toBool('true'),
    toBool('false'),
    toBool('FALSE')
FORMAT Vertical
```

結果：

```response
toBool(toUInt8(1)):      true
toBool(toInt8(-1)):      true
toBool(toFloat32(1.01)): true
toBool('true'):          true
toBool('false'):         false
toBool('FALSE'):         false
```


## toInt8 {#toint8}

入力値を[`Int8`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toInt8(expr)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
* 型 Float32/64 の値。

サポートされない引数:

* `NaN` や `Inf` を含む、Float32/64 値の文字列表現。
* `SELECT toInt8('0xc0fe');` などの、2進数および16進数値の文字列表現。

:::note
入力値が [Int8](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
例: `SELECT toInt8(128) == -128;`。
:::

**戻り値**

* 8ビット整数値。[Int8](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を行います。つまり、小数点以下の桁を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toInt8(-8),
    toInt8(-8.8),
    toInt8('-8')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toInt8(-8):   -8
toInt8(-8.8): -8
toInt8('-8'): -8
```

**関連項目**

* [`toInt8OrZero`](#toint8orzero)。
* [`toInt8OrNull`](#toInt8OrNull)。
* [`toInt8OrDefault`](#toint8ordefault)。


## toInt8OrZero {#toint8orzero}

[`toInt8`](#toint8) と同様に、この関数は入力値を [Int8](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toInt8OrZero(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`0` を返す）:

* `NaN` や `Inf` を含む、通常の Float32/64 浮動小数点数値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toInt8OrZero('0xc0fe');`。

:::note
入力値が [Int8](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローを起こします。
これはエラーとは見なされません。
:::

**返される値**

* 成功した場合は 8 ビット整数値を、それ以外の場合は `0` を返します。[Int8](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。これは、数値の小数部分を切り捨てることを意味します。
:::

**例**

クエリ:

```sql
SELECT
    toInt8OrZero('-8'),
    toInt8OrZero('abc')
FORMAT Vertical;
```

戻り値:

```response
Row 1:
──────
toInt8OrZero('-8'):  -8
toInt8OrZero('abc'): 0
```

**関連項目**

* [`toInt8`](#toint8)。
* [`toInt8OrNull`](#toInt8OrNull)。
* [`toInt8OrDefault`](#toint8ordefault)。


## toInt8OrNull {#toInt8OrNull}

[`toInt8`](#toint8) と同様に、この関数は入力値を [Int8](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toInt8OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`\N` を返します）

* Float32/64 の値の文字列表現（`NaN` および `Inf` を含む）。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toInt8OrNull('0xc0fe');`。

:::note
入力値が [Int8](../data-types/int-uint.md) の範囲で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
:::

**戻り値**

* 成功した場合は 8 ビット整数値、それ以外の場合は `NULL`。[Int8](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)（ゼロ方向への丸め）を使用します。つまり、小数部を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toInt8OrNull('-8'),
    toInt8OrNull('abc')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toInt8OrNull('-8'):  -8
toInt8OrNull('abc'): ᴺᵁᴸᴸ
```

**関連項目**

* [`toInt8`](#toint8)。
* [`toInt8OrZero`](#toint8orzero)。
* [`toInt8OrDefault`](#toint8ordefault)。


## toInt8OrDefault {#toint8ordefault}

[`toInt8`](#toint8) と同様に、この関数は入力値を型 [Int8](../data-types/int-uint.md) の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 値が指定されていない場合は、エラー時に `0` が返されます。

**構文**

```sql
toInt8OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (省略可能) — 型 `Int8` への変換に失敗した場合に返されるデフォルト値。[Int8](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値またはその文字列表現。
* 型 Float32/64 の値。

デフォルト値が返される引数:

* `NaN` および `Inf` を含む、Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toInt8OrDefault('0xc0fe', CAST('-1', 'Int8'));`。

:::note
入力値が [Int8](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
:::

**戻り値**

* 成功した場合は 8 ビット整数値を返します。それ以外の場合、指定されていればデフォルト値を、指定されていなければ `0` を返します。[Int8](../data-types/int-uint.md)。

:::note

* この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数部の桁を切り捨てます。
* デフォルト値の型は、キャスト先の型と同じでなければなりません。
  :::

**例**

クエリ:

```sql
SELECT
    toInt8OrDefault('-8', CAST('-1', 'Int8')),
    toInt8OrDefault('abc', CAST('-1', 'Int8'))
FORMAT Vertical;
```

戻り値:

```response
Row 1:
──────
toInt8OrDefault('-8', CAST('-1', 'Int8')):  -8
toInt8OrDefault('abc', CAST('-1', 'Int8')): -1
```

**関連項目**

* [`toInt8`](#toint8)。
* [`toInt8OrZero`](#toint8orzero)。
* [`toInt8OrNull`](#toInt8OrNull)。


## toInt16 {#toint16}

入力値を [`Int16`](../data-types/int-uint.md) 型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toInt16(expr)
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数：

* 型 (U)Int8/16/32/64/128/256 の値またはその文字列表現。
* 型 Float32/64 の値。

サポートされない引数：

* `NaN` や `Inf` を含む、Float32/64 型の値を表す文字列。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toInt16('0xc0fe');`。

:::note
入力値が [Int16](../data-types/int-uint.md) の範囲内で表現できない場合、結果にオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
例: `SELECT toInt16(32768) == -32768;`。
:::

**戻り値**

* 16ビット整数値。[Int16](../data-types/int-uint.md)。

:::note
この関数は [ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を行い、小数部の桁を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toInt16(-16),
    toInt16(-16.16),
    toInt16('-16')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toInt16(-16):    -16
toInt16(-16.16): -16
toInt16('-16'):  -16
```

**関連項目**

* [`toInt16OrZero`](#toint16orzero)。
* [`toInt16OrNull`](#toint16ornull)。
* [`toInt16OrDefault`](#toint16ordefault)。


## toInt16OrZero {#toint16orzero}

[`toInt16`](#toint16) と同様に、この関数は入力値を [Int16](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toInt16OrZero(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`0` を返す）:

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toInt16OrZero('0xc0fe');`。

:::note
入力値が [Int16](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**返される値**

* 成功した場合は 16 ビット整数値、それ以外の場合は `0`。[Int16](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数部分を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toInt16OrZero('-16'),
    toInt16OrZero('abc')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toInt16OrZero('-16'): -16
toInt16OrZero('abc'): 0
```

**関連項目**

* [`toInt16`](#toint16)。
* [`toInt16OrNull`](#toint16ornull)。
* [`toInt16OrDefault`](#toint16ordefault)。


## toInt16OrNull {#toint16ornull}

[`toInt16`](#toint16) と同様に、この関数は入力値を [Int16](../data-types/int-uint.md) 型の値に変換し、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toInt16OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`\N` を返す）

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toInt16OrNull('0xc0fe');`。

:::note
入力値が [Int16](../data-types/int-uint.md) の範囲内で表現できない場合は、結果がオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
:::

**戻り値**

* 成功した場合は 16 ビット整数値、それ以外は `NULL`。[Int16](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。これは、小数部を切り捨てることを意味します。
:::

**例**

クエリ:

```sql
SELECT
    toInt16OrNull('-16'),
    toInt16OrNull('abc')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toInt16OrNull('-16'): -16
toInt16OrNull('abc'): ᴺᵁᴸᴸ
```

**関連項目**

* [`toInt16`](#toint16)。
* [`toInt16OrZero`](#toint16orzero)。
* [`toInt16OrDefault`](#toint16ordefault)。


## toInt16OrDefault {#toint16ordefault}

[`toInt16`](#toint16) と同様に、この関数は入力値を型 [Int16](../data-types/int-uint.md) の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 引数が渡されていない場合は、エラー時に `0` が返されます。

**構文**

```sql
toInt16OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (省略可能) — `Int16` 型への変換に失敗した場合に返されるデフォルト値。[Int16](../data-types/int-uint.md)。

サポートされる引数：

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
* 型 Float32/64 の値。

デフォルト値が返される引数：

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現（例：`SELECT toInt16OrDefault('0xc0fe', CAST('-1', 'Int16'));`）。

:::note
入力値が [Int16](../data-types/int-uint.md) の範囲内で表現できない場合、結果としてオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

* 成功した場合は 16 ビット整数値を返し、それ以外の場合は指定されたデフォルト値を返します。デフォルト値が指定されていない場合は `0` を返します。[Int16](../data-types/int-uint.md)。

:::note

* この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用し、小数部分の桁を切り捨てます。
* デフォルト値の型はキャスト先の型と同じである必要があります。
  :::

**例**

クエリ:

```sql
SELECT
    toInt16OrDefault('-16', CAST('-1', 'Int16')),
    toInt16OrDefault('abc', CAST('-1', 'Int16'))
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toInt16OrDefault('-16', CAST('-1', 'Int16')): -16
toInt16OrDefault('abc', CAST('-1', 'Int16')): -1
```

**関連項目**

* [`toInt16`](#toint16)
* [`toInt16OrZero`](#toint16orzero)
* [`toInt16OrNull`](#toint16ornull)


## toInt32 {#toint32}

入力値を [`Int32`](../data-types/int-uint.md) 型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toInt32(expr)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
* 型 Float32/64 の値。

サポートされない引数:

* `NaN` や `Inf` を含む、Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toInt32('0xc0fe');`。

:::note
入力値が [Int32](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
例: `SELECT toInt32(2147483648) == -2147483648;`
:::

**返される値**

* 32 ビット整数値。[Int32](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。これは、小数部分を切り捨てることを意味します。
:::

**例**

クエリ:

```sql
SELECT
    toInt32(-32),
    toInt32(-32.32),
    toInt32('-32')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toInt32(-32):    -32
toInt32(-32.32): -32
toInt32('-32'):  -32
```

**関連項目**

* [`toInt32OrZero`](#toint32orzero).
* [`toInt32OrNull`](#toint32ornull).
* [`toInt32OrDefault`](#toint32ordefault).


## toInt32OrZero {#toint32orzero}

[`toInt32`](#toint32) と同様に、この関数は入力値を型 [Int32](../data-types/int-uint.md) の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toInt32OrZero(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`0` を返す）:

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toInt32OrZero('0xc0fe');`。

:::note
入力値が [Int32](../data-types/int-uint.md) の表現可能範囲外の場合、結果がオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
:::

**戻り値**

* 成功した場合は 32 ビット整数値、それ以外の場合は `0`。[Int32](../data-types/int-uint.md)

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数部を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toInt32OrZero('-32'),
    toInt32OrZero('abc')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toInt32OrZero('-32'): -32
toInt32OrZero('abc'): 0
```

**関連項目**

* [`toInt32`](#toint32)。
* [`toInt32OrNull`](#toint32ornull)。
* [`toInt32OrDefault`](#toint32ordefault)。


## toInt32OrNull {#toint32ornull}

[`toInt32`](#toint32) と同様に、この関数は入力値を型 [Int32](../data-types/int-uint.md) の値に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toInt32OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`\N` を返す）:

* Float32/64 の値（`NaN` や `Inf` を含む）の文字列表現。
* 2 進数および 16 進数値の文字列表現（例: `SELECT toInt32OrNull('0xc0fe');`）。

:::note
入力値が [Int32](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

* 成功した場合は 32 ビット整数値、それ以外の場合は `NULL`。[Int32](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用し、小数部の桁を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toInt32OrNull('-32'),
    toInt32OrNull('abc')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toInt32OrNull('-32'): -32
toInt32OrNull('abc'): ᴺᵁᴸᴸ
```

**関連項目**

* [`toInt32`](#toint32)。
* [`toInt32OrZero`](#toint32orzero)。
* [`toInt32OrDefault`](#toint32ordefault)。


## toInt32OrDefault {#toint32ordefault}

[`toInt32`](#toint32) と同様に、この関数は入力値を型 [Int32](../data-types/int-uint.md) の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 値が指定されない場合、エラー時には `0` が返されます。

**構文**

```sql
toInt32OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (省略可能) — 型 `Int32` へのパースに失敗した場合に返されるデフォルト値。[Int32](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
* 型 Float32/64 の値。

デフォルト値が返される引数:

* `NaN` や `Inf` を含む、Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toInt32OrDefault('0xc0fe', CAST('-1', 'Int32'));`。

:::note
入力値が [Int32](../data-types/int-uint.md) の範囲で表現できない場合、結果はオーバーフローまたはアンダーフローが発生します。
これはエラーとはみなされません。
:::

**返される値**

* 成功した場合は 32 ビット整数値を返し、そうでない場合は指定されていればデフォルト値、指定されていなければ `0` を返します。[Int32](../data-types/int-uint.md)。

:::note

* この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を行い、小数部分の桁を切り捨てます。
* デフォルト値の型はキャスト先の型と同じである必要があります。
  :::

**例**

クエリ:

```sql
SELECT
    toInt32OrDefault('-32', CAST('-1', 'Int32')),
    toInt32OrDefault('abc', CAST('-1', 'Int32'))
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toInt32OrDefault('-32', CAST('-1', 'Int32')): -32
toInt32OrDefault('abc', CAST('-1', 'Int32')): -1
```

**関連項目**

* [`toInt32`](#toint32)。
* [`toInt32OrZero`](#toint32orzero)。
* [`toInt32OrNull`](#toint32ornull)。


## toInt64 {#toint64}

入力値を [`Int64`](../data-types/int-uint.md) 型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toInt64(expr)
```

**引数**

* `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値または文字列表現。
* 型 Float32/64 の値。

サポートされない型:

* `NaN` や `Inf` を含む、Float32/64 値の文字列表現。
* `SELECT toInt64('0xc0fe');` のような、2進数および16進数の文字列表現。

:::note
入力値が [Int64](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
例: `SELECT toInt64(9223372036854775808) == -9223372036854775808;`
:::

**戻り値**

* 64ビット整数値。[Int64](../data-types/int-uint.md)。

:::note
この関数は [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を行います。つまり、小数部を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toInt64(-64),
    toInt64(-64.64),
    toInt64('-64')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toInt64(-64):    -64
toInt64(-64.64): -64
toInt64('-64'):  -64
```

**関連項目**

* [`toInt64OrZero`](#toint64orzero)。
* [`toInt64OrNull`](#toint64ornull)。
* [`toInt64OrDefault`](#toint64ordefault)。


## toInt64OrZero {#toint64orzero}

[`toInt64`](#toint64) と同様に、この関数は入力値を [Int64](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toInt64OrZero(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`0` を返す）:

* `NaN` および `Inf` を含む Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toInt64OrZero('0xc0fe');`。

:::note
入力値が [Int64](../data-types/int-uint.md) の範囲内で表現できない場合、結果がオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
:::

**返される値**

* 成功した場合は 64 ビット整数値（[Int64](../data-types/int-uint.md)）、それ以外は `0`。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。これは数値の小数部を切り捨てることを意味します。
:::

**例**

クエリ:

```sql
SELECT
    toInt64OrZero('-64'),
    toInt64OrZero('abc')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toInt64OrZero('-64'): -64
toInt64OrZero('abc'): 0
```

**関連項目**

* [`toInt64`](#toint64)。
* [`toInt64OrNull`](#toint64ornull)。
* [`toInt64OrDefault`](#toint64ordefault)。


## toInt64OrNull {#toint64ornull}

[`toInt64`](#toint64) と同様に、この関数は入力値を型 [Int64](../data-types/int-uint.md) の値に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toInt64OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`\N` を返します）:

* Float32/64 値の文字列表現（`NaN` や `Inf` を含む）。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toInt64OrNull('0xc0fe');`。

:::note
入力値が [Int64](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
:::

**返される値**

* 成功した場合は 64 ビット整数値、それ以外の場合は `NULL`。[Int64](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数部分を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toInt64OrNull('-64'),
    toInt64OrNull('abc')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toInt64OrNull('-64'): -64
toInt64OrNull('abc'): ᴺᵁᴸᴸ
```

**関連項目**

* [`toInt64`](#toint64)
* [`toInt64OrZero`](#toint64orzero)
* [`toInt64OrDefault`](#toint64ordefault)


## toInt64OrDefault {#toint64ordefault}

[`toInt64`](#toint64) と同様に、この関数は入力値を [Int64](../data-types/int-uint.md) 型の値に変換しますが、エラー発生時にはデフォルト値を返します。
`default` 値が渡されなかった場合は、エラー時に `0` が返されます。

**構文**

```sql
toInt64OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (オプション) — 型 `Int64` への変換に失敗した場合に返されるデフォルト値。[Int64](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
* 型 Float32/64 の値。

デフォルト値が返される引数:

* `NaN` および `Inf` を含む、Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toInt64OrDefault('0xc0fe', CAST('-1', 'Int64'));`。

:::note
入力値が [Int64](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
:::

**返される値**

* 成功した場合は 64 ビット整数値。それ以外の場合、指定されていればデフォルト値を、指定されていなければ `0` を返します。[Int64](../data-types/int-uint.md)。

:::note

* この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数部の桁を切り捨てます。
* デフォルト値の型は、キャスト先の型と同一である必要があります。
  :::

**例**

クエリ:

```sql
SELECT
    toInt64OrDefault('-64', CAST('-1', 'Int64')),
    toInt64OrDefault('abc', CAST('-1', 'Int64'))
FORMAT Vertical;
```

戻り値:

```response
Row 1:
──────
toInt64OrDefault('-64', CAST('-1', 'Int64')): -64
toInt64OrDefault('abc', CAST('-1', 'Int64')): -1
```

**関連項目**

* [`toInt64`](#toint64)。
* [`toInt64OrZero`](#toint64orzero)。
* [`toInt64OrNull`](#toint64ornull)。


## toInt128 {#toint128}

入力値を [`Int128`](../data-types/int-uint.md) 型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toInt128(expr)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
* 型 Float32/64 の値。

サポートされない引数:

* `NaN` や `Inf` を含む、Float32/64 値の文字列表現。
* `SELECT toInt128('0xc0fe');` のような、2 進数値および 16 進数値の文字列表現。

:::note
入力値が [Int128](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローが発生します。
これはエラーとはみなされません。
:::

**戻り値**

* 128ビット整数値。[Int128](../data-types/int-uint.md)。

:::note
この関数は [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用します。つまり、小数部の桁を切り捨てます。
:::

**使用例**

クエリ:

```sql
SELECT
    toInt128(-128),
    toInt128(-128.8),
    toInt128('-128')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toInt128(-128):   -128
toInt128(-128.8): -128
toInt128('-128'): -128
```

**関連項目**

* [`toInt128OrZero`](#toint128orzero)。
* [`toInt128OrNull`](#toint128ornull)。
* [`toInt128OrDefault`](#toint128ordefault)。


## toInt128OrZero {#toint128orzero}

[`toInt128`](#toint128) と同様に、この関数は入力値を [Int128](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toInt128OrZero(expr)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

サポートされる引数：

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`0` を返す）：

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* 2進数値および16進数値の文字列表現。例: `SELECT toInt128OrZero('0xc0fe');`。

:::note
入力値が [Int128](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

* 成功した場合は 128 ビット整数値、それ以外の場合は `0`。[Int128](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数部分の桁を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toInt128OrZero('-128'),
    toInt128OrZero('abc')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toInt128OrZero('-128'): -128
toInt128OrZero('abc'):  0
```

**関連項目**

* [`toInt128`](#toint128)。
* [`toInt128OrNull`](#toint128ornull)。
* [`toInt128OrDefault`](#toint128ordefault)。


## toInt128OrNull {#toint128ornull}

[`toInt128`](#toint128) と同様に、この関数は入力値を [Int128](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toInt128OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`\N` を返す）:

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* バイナリ値や 16 進数値の文字列表現。例: `SELECT toInt128OrNull('0xc0fe');`。

:::note
入力値が [Int128](../data-types/int-uint.md) の範囲内で表現できない場合、結果にオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

* 正常に変換できた場合は 128 ビット整数値、それ以外の場合は `NULL`。[Int128](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数点以下の桁を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toInt128OrNull('-128'),
    toInt128OrNull('abc')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toInt128OrNull('-128'): -128
toInt128OrNull('abc'):  ᴺᵁᴸᴸ
```

**関連項目**

* [`toInt128`](#toint128)。
* [`toInt128OrZero`](#toint128orzero)。
* [`toInt128OrDefault`](#toint128ordefault)。


## toInt128OrDefault {#toint128ordefault}

[`toInt128`](#toint128) と同様に、この関数は入力値を型 [Int128](../data-types/int-uint.md) の値に変換しますが、エラーが発生した場合にはデフォルト値を返します。
`default` 値が指定されていない場合、エラー発生時には `0` が返されます。

**構文**

```sql
toInt128OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (省略可能) — `Int128` 型への変換に失敗した場合に返されるデフォルト値。[Int128](../data-types/int-uint.md)。

サポートされる引数:

* (U)Int8/16/32/64/128/256。
* Float32/64。
* (U)Int8/16/32/128/256 の文字列表現。

デフォルト値が返される引数:

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toInt128OrDefault('0xc0fe', CAST('-1', 'Int128'));`。

:::note
入力値が [Int128](../data-types/int-uint.md) の範囲で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
:::

**返される値**

* 正常に変換された場合は 128 ビット整数値を返し、失敗した場合は指定されていればデフォルト値を、指定されていなければ `0` を返します。[Int128](../data-types/int-uint.md)。

:::note

* この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。これは、小数部の桁を切り捨てることを意味します。
* デフォルト値の型はキャスト先の型と同じである必要があります。
  :::

**例**

クエリ:

```sql
SELECT
    toInt128OrDefault('-128', CAST('-1', 'Int128')),
    toInt128OrDefault('abc', CAST('-1', 'Int128'))
FORMAT Vertical;
```

戻り値:

```response
Row 1:
──────
toInt128OrDefault('-128', CAST('-1', 'Int128')): -128
toInt128OrDefault('abc', CAST('-1', 'Int128')):  -1
```

**関連項目**

* [`toInt128`](#toint128)。
* [`toInt128OrZero`](#toint128orzero)。
* [`toInt128OrNull`](#toint128ornull)。


## toInt256 {#toint256}

入力値を [`Int256`](../data-types/int-uint.md) 型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toInt256(expr)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値または文字列表現。
* 型 Float32/64 の値。

サポートされない引数:

* `NaN` や `Inf` を含む、Float32/64 の値の文字列表現。
* 2進数および16進数値の文字列表現。例: `SELECT toInt256('0xc0fe');`。

:::note
入力値が [Int256](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

* 256ビット整数値。[Int256](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用し、小数部分を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toInt256(-256),
    toInt256(-256.256),
    toInt256('-256')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toInt256(-256):     -256
toInt256(-256.256): -256
toInt256('-256'):   -256
```

**関連項目**

* [`toInt256OrZero`](#toint256orzero)。
* [`toInt256OrNull`](#toint256ornull)。
* [`toInt256OrDefault`](#toint256ordefault)。


## toInt256OrZero {#toint256orzero}

[`toInt256`](#toint256) と同様に、この関数は入力値を [Int256](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toInt256OrZero(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`0` を返す）:

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* 2 進数および 16 進数の文字列表現。例: `SELECT toInt256OrZero('0xc0fe');`。

:::note
入力値が [Int256](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
:::

**戻り値**

* 成功した場合は 256 ビット整数値、それ以外の場合は `0`。[Int256](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。これは、小数部を切り捨てることを意味します。
:::

**例**

クエリ:

```sql
SELECT
    toInt256OrZero('-256'),
    toInt256OrZero('abc')
FORMAT Vertical;
```

戻り値:

```response
Row 1:
──────
toInt256OrZero('-256'): -256
toInt256OrZero('abc'):  0
```

**関連項目**

* [`toInt256`](#toint256)。
* [`toInt256OrNull`](#toint256ornull)。
* [`toInt256OrDefault`](#toint256ordefault)。


## toInt256OrNull {#toint256ornull}

[`toInt256`](#toint256) と同様に、この関数は入力値を [Int256](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toInt256OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`\N` を返す）

* Float32/64 値の文字列表現（`NaN` や `Inf` を含む）。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toInt256OrNull('0xc0fe');`。

:::note
入力値が [Int256](../data-types/int-uint.md) の範囲内で表現できない場合、結果でオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

* 成功した場合は 256 ビット整数値を返し、それ以外の場合は `NULL` を返します。[Int256](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) による丸めを行います。つまり、小数点以下の桁を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toInt256OrNull('-256'),
    toInt256OrNull('abc')
FORMAT Vertical;
```

戻り値:

```response
Row 1:
──────
toInt256OrNull('-256'): -256
toInt256OrNull('abc'):  ᴺᵁᴸᴸ
```

**関連項目**

* [`toInt256`](#toint256)。
* [`toInt256OrZero`](#toint256orzero)。
* [`toInt256OrDefault`](#toint256ordefault)。


## toInt256OrDefault {#toint256ordefault}

[`toInt256`](#toint256) と同様に、この関数は入力値を型 [Int256](../data-types/int-uint.md) の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 引数が指定されていない場合は、エラー時に `0` が返されます。

**構文**

```sql
toInt256OrDefault(expr[, default])
```

**引数**

* `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (省略可能) — `Int256` 型への変換に失敗した場合に返されるデフォルト値。[Int256](../data-types/int-uint.md)。

サポートされる引数:

* (U)Int8/16/32/64/128/256 型の値またはその文字列表現。
* Float32/64 型の値。

デフォルト値が返される引数:

* `NaN` や `Inf` を含む Float32/64 の文字列表現
* 2 進数および 16 進数の文字列表現。例: `SELECT toInt256OrDefault('0xc0fe', CAST('-1', 'Int256'));`

:::note
入力値が [Int256](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**返される値**

* 成功した場合は 256 ビット整数値。失敗した場合は、指定されていればデフォルト値、指定されていなければ `0` を返します。[Int256](../data-types/int-uint.md)。

:::note

* この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数部分の桁を切り捨てます。
* デフォルト値の型はキャスト先の型と同じである必要があります。
  :::

**例**

クエリ:

```sql
SELECT
    toInt256OrDefault('-256', CAST('-1', 'Int256')),
    toInt256OrDefault('abc', CAST('-1', 'Int256'))
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toInt256OrDefault('-256', CAST('-1', 'Int256')): -256
toInt256OrDefault('abc', CAST('-1', 'Int256')):  -1
```

**関連項目**

* [`toInt256`](#toint256)。
* [`toInt256OrZero`](#toint256orzero)。
* [`toInt256OrNull`](#toint256ornull)。


## toUInt8 {#touint8}

入力値を[`UInt8`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toUInt8(expr)
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値またはその文字列表現。
* 型 Float32/64 の値。

サポートされない引数:

* `NaN` や `Inf` を含む、Float32/64 の値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toUInt8('0xc0fe');`。

:::note
入力値が [UInt8](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローが発生します。
これはエラーとはみなされません。
例: `SELECT toUInt8(256) == 0;`。
:::

**返される値**

* 8ビット符号なし整数値。[UInt8](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用し、小数部の桁を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toUInt8(8),
    toUInt8(8.8),
    toUInt8('8')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toUInt8(8):   8
toUInt8(8.8): 8
toUInt8('8'): 8
```

**関連項目**

* [`toUInt8OrZero`](#touint8orzero)。
* [`toUInt8OrNull`](#touint8ornull)。
* [`toUInt8OrDefault`](#touint8ordefault)。


## toUInt8OrZero {#touint8orzero}

[`toUInt8`](#touint8) と同様に、この関数は入力値を [UInt8](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toUInt8OrZero(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`0` を返す）:

* `NaN` や `Inf` を含む、通常の Float32/64 の値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toUInt8OrZero('0xc0fe');`。

:::note
入力値が [UInt8](../data-types/int-uint.md) の範囲外の場合、結果がオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**戻り値**

* 成功した場合は 8 ビットの符号なし整数値、それ以外の場合は `0`。[UInt8](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用し、小数点以下の桁を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toUInt8OrZero('-8'),
    toUInt8OrZero('abc')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toUInt8OrZero('-8'):  0
toUInt8OrZero('abc'): 0
```

**関連項目**

* [`toUInt8`](#touint8).
* [`toUInt8OrNull`](#touint8ornull).
* [`toUInt8OrDefault`](#touint8ordefault).


## toUInt8OrNull {#touint8ornull}

[`toUInt8`](#touint8) と同様に、この関数は入力値を [UInt8](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toUInt8OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`\N` を返します）

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toUInt8OrNull('0xc0fe');`。

:::note
入力値が [UInt8](../data-types/int-uint.md) の範囲で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは扱われません。
:::

**返される値**

* 成功した場合は 8 ビットの符号なし整数値、それ以外の場合は `NULL`。[UInt8](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用します。つまり、小数部を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toUInt8OrNull('8'),
    toUInt8OrNull('abc')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toUInt8OrNull('8'):   8
toUInt8OrNull('abc'): ᴺᵁᴸᴸ
```

**関連項目**

* [`toUInt8`](#touint8)。
* [`toUInt8OrZero`](#touint8orzero)。
* [`toUInt8OrDefault`](#touint8ordefault)。


## toUInt8OrDefault {#touint8ordefault}

[`toUInt8`](#touint8) と同様に、この関数は入力値を [UInt8](../data-types/int-uint.md) 型の値に変換します。エラーが発生した場合は、デフォルト値を返します。
`default` 値が引数として渡されない場合、エラー時には `0` が返されます。

**構文**

```sql
toUInt8OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。 [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (省略可能) — 型 `UInt8` へのパースに失敗した場合に返されるデフォルト値。 [UInt8](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値または文字列表現。
* 型 Float32/64 の値。

デフォルト値が返される引数:

* `NaN` および `Inf` を含む、Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toUInt8OrDefault('0xc0fe', CAST('0', 'UInt8'));`。

:::note
入力値が [UInt8](../data-types/int-uint.md) の範囲内で表現できない場合、結果がオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**戻り値**

* 成功した場合は 8 ビット符号なし整数値、それ以外の場合は渡されたデフォルト値、デフォルト値が指定されていなければ `0` を返します。 [UInt8](../data-types/int-uint.md)。

:::note

* この関数は[0 への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数部の桁を切り捨てます。
* デフォルト値の型は、キャスト先の型と同じである必要があります。
  :::

**例**

クエリ:

```sql
SELECT
    toUInt8OrDefault('8', CAST('0', 'UInt8')),
    toUInt8OrDefault('abc', CAST('0', 'UInt8'))
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toUInt8OrDefault('8', CAST('0', 'UInt8')):   8
toUInt8OrDefault('abc', CAST('0', 'UInt8')): 0
```

**関連項目**

* [`toUInt8`](#touint8)。
* [`toUInt8OrZero`](#touint8orzero)。
* [`toUInt8OrNull`](#touint8ornull)。


## toUInt16 {#touint16}

入力値を [`UInt16`](../data-types/int-uint.md) 型の値に変換します。エラーが発生した場合は例外を送出します。

**構文**

```sql
toUInt16(expr)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされている引数:

* 型 (U)Int8/16/32/64/128/256 の値または文字列表現。
* 型 Float32/64 の値。

サポートされていない引数:

* `NaN` や `Inf` を含む、Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toUInt16('0xc0fe');`。

:::note
入力値が [UInt16](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
例: `SELECT toUInt16(65536) == 0;`。
:::

**戻り値**

* 16 ビット符号なし整数値。[UInt16](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数部分の桁を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toUInt16(16),
    toUInt16(16.16),
    toUInt16('16')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toUInt16(16):    16
toUInt16(16.16): 16
toUInt16('16'):  16
```

**関連項目**

* [`toUInt16OrZero`](#touint16orzero)。
* [`toUInt16OrNull`](#touint16ornull)。
* [`toUInt16OrDefault`](#touint16ordefault)。


## toUInt16OrZero {#touint16orzero}

[`toUInt16`](#touint16) と同様に、この関数は入力値を [UInt16](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toUInt16OrZero(x)
```

**引数**

* `x` — 数値の文字列表現。 [String](../data-types/string.md)。

サポートされる引数：

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`0` を返す）：

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* 例えば `SELECT toUInt16OrZero('0xc0fe');` のような、2 進数および 16 進数値の文字列表現。

:::note
入力値が [UInt16](../data-types/int-uint.md) の範囲外の場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**返される値**

* 成功した場合は 16 ビットの符号なし整数値、それ以外の場合は `0` を返します。[UInt16](../data-types/int-uint.md)。

:::note
この関数は [ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用します。つまり、小数部分の桁を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toUInt16OrZero('16'),
    toUInt16OrZero('abc')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toUInt16OrZero('16'):  16
toUInt16OrZero('abc'): 0
```

**関連項目**

* [`toUInt16`](#touint16)。
* [`toUInt16OrNull`](#touint16ornull)。
* [`toUInt16OrDefault`](#touint16ordefault)。


## toUInt16OrNull {#touint16ornull}

[`toUInt16`](#touint16) と同様に、この関数は入力値を [UInt16](../data-types/int-uint.md) 型に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toUInt16OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数：

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`\N` を返す）：

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toUInt16OrNull('0xc0fe');`。

:::note
入力値が [UInt16](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

* 成功した場合は 16 ビット符号なし整数値、そうでない場合は `NULL`。[UInt16](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。これは、小数部分の桁を切り捨てることを意味します。
:::

**例**

クエリ:

```sql
SELECT
    toUInt16OrNull('16'),
    toUInt16OrNull('abc')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toUInt16OrNull('16'):  16
toUInt16OrNull('abc'): ᴺᵁᴸᴸ
```

**関連関数**

* [`toUInt16`](#touint16)。
* [`toUInt16OrZero`](#touint16orzero)。
* [`toUInt16OrDefault`](#touint16ordefault)。


## toUInt16OrDefault {#touint16ordefault}

[`toUInt16`](#touint16) と同様に、この関数は入力値を [UInt16](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合にはデフォルト値を返します。
`default` 値が渡されない場合、エラー時には `0` が返されます。

**構文**

```sql
toUInt16OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (省略可) — 型 `UInt16` への変換に失敗した場合に返されるデフォルト値。[UInt16](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値または文字列表現。
* 型 Float32/64 の値。

デフォルト値が返される引数:

* Float32/64 値の文字列表現（`NaN` や `Inf` を含む）。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toUInt16OrDefault('0xc0fe', CAST('0', 'UInt16'));`。

:::note
入力値が [UInt16](../data-types/int-uint.md) の範囲内で表現できない場合、結果でオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

* 成功した場合は 16 ビット符号なし整数値を返し、失敗した場合は指定されていればデフォルト値、指定されていなければ `0` を返します。[UInt16](../data-types/int-uint.md)。

:::note

* この関数は[0 への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を行い、小数部分の桁を切り捨てます。
* デフォルト値の型はキャスト先の型と同一でなければなりません。
  :::

**例**

クエリ:

```sql
SELECT
    toUInt16OrDefault('16', CAST('0', 'UInt16')),
    toUInt16OrDefault('abc', CAST('0', 'UInt16'))
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toUInt16OrDefault('16', CAST('0', 'UInt16')):  16
toUInt16OrDefault('abc', CAST('0', 'UInt16')): 0
```

**関連項目**

* [`toUInt16`](#touint16)。
* [`toUInt16OrZero`](#touint16orzero)。
* [`toUInt16OrNull`](#touint16ornull)。


## toUInt32 {#touint32}

入力値を[`UInt32`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toUInt32(expr)
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[式](/sql-reference/syntax#expressions)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
* 型 Float32/64 の値。

サポートされない引数:

* `NaN` や `Inf` を含む、Float32/64 の値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toUInt32('0xc0fe');`。

:::note
入力値が [UInt32](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
例: `SELECT toUInt32(4294967296) == 0;`
:::

**返される値**

* 32 ビットの符号なし整数値。[UInt32](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用し、小数部の桁を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toUInt32(32),
    toUInt32(32.32),
    toUInt32('32')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toUInt32(32):    32
toUInt32(32.32): 32
toUInt32('32'):  32
```

**関連項目**

* [`toUInt32OrZero`](#touint32orzero)。
* [`toUInt32OrNull`](#touint32ornull)。
* [`toUInt32OrDefault`](#touint32ordefault)。


## toUInt32OrZero {#touint32orzero}

[`toUInt32`](#touint32) と同様に、この関数は入力値を [UInt32](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toUInt32OrZero(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`0` を返す）:

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* `SELECT toUInt32OrZero('0xc0fe');` のような、2進数および16進数値の文字列表現。

:::note
入力値が [UInt32](../data-types/int-uint.md) の範囲内で表現できない場合、結果がオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**戻り値**

* 成功した場合は 32 ビットの符号なし整数値、そうでない場合は `0`。[UInt32](../data-types/int-uint.md)

:::note
この関数は [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)
を使用します。つまり、小数部の桁を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toUInt32OrZero('32'),
    toUInt32OrZero('abc')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toUInt32OrZero('32'):  32
toUInt32OrZero('abc'): 0
```

**関連項目**

* [`toUInt32`](#touint32)
* [`toUInt32OrNull`](#touint32ornull)
* [`toUInt32OrDefault`](#touint32ordefault)


## toUInt32OrNull {#touint32ornull}

[`toUInt32`](#touint32) と同様に、この関数は入力値を [UInt32](../data-types/int-uint.md) 型の値に変換しますが、エラー時には `NULL` を返します。

**構文**

```sql
toUInt32OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`\N` を返す）:

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toUInt32OrNull('0xc0fe');`。

:::note
入力値が [UInt32](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
:::

**返される値**

* 成功した場合は 32 ビット符号なし整数値、それ以外の場合は `NULL`。[UInt32](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)
（0 方向への丸め）を使用します。これは、小数部の桁を切り捨てることを意味します。
:::

**例**

クエリ:

```sql
SELECT
    toUInt32OrNull('32'),
    toUInt32OrNull('abc')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toUInt32OrNull('32'):  32
toUInt32OrNull('abc'): ᴺᵁᴸᴸ
```

**関連項目**

* [`toUInt32`](#touint32)。
* [`toUInt32OrZero`](#touint32orzero)。
* [`toUInt32OrDefault`](#touint32ordefault)。


## toUInt32OrDefault {#touint32ordefault}

[`toUInt32`](#touint32) と同様に、この関数は入力値を型 [UInt32](../data-types/int-uint.md) の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 引数が指定されていない場合、エラー時には `0` が返されます。

**構文**

```sql
toUInt32OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。 [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (オプション) — 型 `UInt32` への変換に失敗した場合に返されるデフォルト値。 [UInt32](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
* 型 Float32/64 の値。

デフォルト値が返される引数:

* `NaN` および `Inf` を含む、Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toUInt32OrDefault('0xc0fe', CAST('0', 'UInt32'));`。

:::note
入力値が [UInt32](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
:::

**戻り値**

* 成功した場合は 32-bit の符号なし整数値、そうでない場合は、指定されていればデフォルト値を、指定されていなければ `0` を返します。 [UInt32](../data-types/int-uint.md)。

:::note

* この関数は [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用します。つまり、小数部分の桁を切り捨てます。
* デフォルト値の型はキャスト先の型と同じである必要があります。
  :::

**例**

クエリ:

```sql
SELECT
    toUInt32OrDefault('32', CAST('0', 'UInt32')),
    toUInt32OrDefault('abc', CAST('0', 'UInt32'))
FORMAT Vertical;
```

戻り値:

```response
Row 1:
──────
toUInt32OrDefault('32', CAST('0', 'UInt32')):  32
toUInt32OrDefault('abc', CAST('0', 'UInt32')): 0
```

**関連項目**

* [`toUInt32`](#touint32)
* [`toUInt32OrZero`](#touint32orzero)
* [`toUInt32OrNull`](#touint32ornull)


## toUInt64 {#touint64}

入力値を [`UInt64`](../data-types/int-uint.md) 型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toUInt64(expr)
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
* 型 Float32/64 の値。

サポートされない型:

* `NaN` や `Inf` を含む、Float32/64 の値の文字列表現。
* 2進数および16進数の値の文字列表現。例: `SELECT toUInt64('0xc0fe');`。

:::note
入力値が [UInt64](../data-types/int-uint.md) の範囲で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
例: `SELECT toUInt64(18446744073709551616) == 0;`
:::

**返される値**

* 64ビット符号なし整数値。[UInt64](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用し、小数部分を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toUInt64(64),
    toUInt64(64.64),
    toUInt64('64')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toUInt64(64):    64
toUInt64(64.64): 64
toUInt64('64'):  64
```

**関連項目**

* [`toUInt64OrZero`](#touint64orzero)。
* [`toUInt64OrNull`](#touint64ornull)。
* [`toUInt64OrDefault`](#touint64ordefault)。


## toUInt64OrZero {#touint64orzero}

[`toUInt64`](#touint64) と同様に、この関数は入力値を [UInt64](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toUInt64OrZero(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数：

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`0` を返す）：

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例：`SELECT toUInt64OrZero('0xc0fe');`。

:::note
入力値が [UInt64](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

* 正常に変換された場合は 64 ビット符号なし整数値、それ以外の場合は `0`。[UInt64](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を行い、小数部分の桁を切り捨てます。
:::

**例**

クエリ：

```sql
SELECT
    toUInt64OrZero('64'),
    toUInt64OrZero('abc')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toUInt64OrZero('64'):  64
toUInt64OrZero('abc'): 0
```

**関連項目**

* [`toUInt64`](#touint64)。
* [`toUInt64OrNull`](#touint64ornull)。
* [`toUInt64OrDefault`](#touint64ordefault)。


## toUInt64OrNull {#touint64ornull}

[`toUInt64`](#touint64) と同様に、この関数は入力値を [UInt64](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合には `NULL` を返します。

**構文**

```sql
toUInt64OrNull(x)
```

**引数**

* `x` — 数値の String 表現。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の String 表現。

サポートされない引数（`\N` を返す）:

* `NaN` や `Inf` を含む Float32/64 値の String 表現。
* 2 進数および 16 進数値の String 表現。例: `SELECT toUInt64OrNull('0xc0fe');`。

:::note
入力値が [UInt64](../data-types/int-uint.md) の範囲内で表現できない場合、結果がオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**返される値**

* 成功した場合は 64 ビット符号なし整数値、それ以外の場合は `NULL`。[UInt64](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロへの丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を行います。つまり、小数部分を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toUInt64OrNull('64'),
    toUInt64OrNull('abc')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toUInt64OrNull('64'):  64
toUInt64OrNull('abc'): ᴺᵁᴸᴸ
```

**関連項目**

* [`toUInt64`](#touint64)。
* [`toUInt64OrZero`](#touint64orzero)。
* [`toUInt64OrDefault`](#touint64ordefault)。


## toUInt64OrDefault {#touint64ordefault}

[`toUInt64`](#touint64) と同様に、この関数は入力値を [UInt64](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 値が渡されない場合、エラー時には `0` が返されます。

**構文**

```sql
toUInt64OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `defauult` (省略可能) — `UInt64` 型へのパースに失敗した場合に返すデフォルト値。[UInt64](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
* 型 Float32/64 の値。

デフォルト値が返される引数:

* Float32/64 の値の文字列表現（`NaN` や `Inf` を含む）。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toUInt64OrDefault('0xc0fe', CAST('0', 'UInt64'));`。

:::note
入力値が [UInt64](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**返される値**

* 成功した場合は 64 ビットの符号なし整数値が返されます。失敗した場合は、指定されていればデフォルト値が、指定されていなければ `0` が返されます。[UInt64](../data-types/int-uint.md)。

:::note

* この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数点以下の桁を切り捨てます。
* デフォルト値の型はキャスト先の型と同じである必要があります。
  :::

**例**

クエリ:

```sql
SELECT
    toUInt64OrDefault('64', CAST('0', 'UInt64')),
    toUInt64OrDefault('abc', CAST('0', 'UInt64'))
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toUInt64OrDefault('64', CAST('0', 'UInt64')):  64
toUInt64OrDefault('abc', CAST('0', 'UInt64')): 0
```

**関連項目**

* [`toUInt64`](#touint64)。
* [`toUInt64OrZero`](#touint64orzero)。
* [`toUInt64OrNull`](#touint64ornull)。


## toUInt128 {#touint128}

入力値を[`UInt128`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toUInt128(expr)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数：

* 型 (U)Int8/16/32/64/128/256 の値またはその文字列表現。
* 型 Float32/64 の値。

サポートされない引数：

* `NaN` や `Inf` などを含む、Float32/64 値の文字列表現。
* 2 進数および 16 進数の文字列表現。例：`SELECT toUInt128('0xc0fe');`。

:::note
入力値が [UInt128](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

* 128 ビット符号なし整数値。[UInt128](../data-types/int-uint.md)。

:::note
この関数は[0 への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を行います。つまり、小数部を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toUInt128(128),
    toUInt128(128.8),
    toUInt128('128')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toUInt128(128):   128
toUInt128(128.8): 128
toUInt128('128'): 128
```

**関連項目**

* [`toUInt128OrZero`](#touint128orzero)。
* [`toUInt128OrNull`](#touint128ornull)。
* [`toUInt128OrDefault`](#touint128ordefault)。


## toUInt128OrZero {#touint128orzero}

[`toUInt128`](#touint128) と同様に、この関数は入力値を [UInt128](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toUInt128OrZero(expr)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`0` を返す）:

* Float32/64 値（`NaN` や `Inf` を含む）の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toUInt128OrZero('0xc0fe');`。

:::note
入力値が [UInt128](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**戻り値**

* 成功した場合は 128 ビット符号なし整数値 ([UInt128](../data-types/int-uint.md))、それ以外の場合は `0`。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を行います。つまり、小数部を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toUInt128OrZero('128'),
    toUInt128OrZero('abc')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toUInt128OrZero('128'): 128
toUInt128OrZero('abc'): 0
```

**関連項目**

* [`toUInt128`](#touint128)。
* [`toUInt128OrNull`](#touint128ornull)。
* [`toUInt128OrDefault`](#touint128ordefault)。


## toUInt128OrNull {#touint128ornull}

[`toUInt128`](#touint128) と同様に、この関数は入力値を型 [UInt128](../data-types/int-uint.md) の値に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toUInt128OrNull(x)
```

**引数**

* `x` — 数値を表す String の文字列表現。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

サポートされる引数：

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`\N` を返す）：

* `NaN` や `Inf` を含む、Float32/64 値の文字列表現。
* `SELECT toUInt128OrNull('0xc0fe');` のような、2 進数および 16 進数値の文字列表現。

:::note
入力値が [UInt128](../data-types/int-uint.md) の範囲内で表現できない場合、結果としてオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

* 成功した場合は 128 ビットの符号なし整数値、それ以外の場合は `NULL`。[UInt128](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を行います。つまり、小数部の桁を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toUInt128OrNull('128'),
    toUInt128OrNull('abc')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toUInt128OrNull('128'): 128
toUInt128OrNull('abc'): ᴺᵁᴸᴸ
```

**関連項目**

* [`toUInt128`](#touint128)。
* [`toUInt128OrZero`](#touint128orzero)。
* [`toUInt128OrDefault`](#touint128ordefault)。


## toUInt128OrDefault {#touint128ordefault}

[`toUInt128`](#toint128) と同様に、この関数は入力値を [UInt128](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 値が引数として渡されていない場合、エラー時には `0` が返されます。

**構文**

```sql
toUInt128OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (省略可能) — `UInt128` 型への変換に失敗した場合に返すデフォルト値。[UInt128](../data-types/int-uint.md)。

サポートされる引数:

* (U)Int8/16/32/64/128/256。
* Float32/64。
* (U)Int8/16/32/128/256 を表す文字列。

デフォルト値が返される引数:

* `NaN` や `Inf` を含む、Float32/64 値を表す文字列。
* 2 進数および 16 進数値を表す文字列。例: `SELECT toUInt128OrDefault('0xc0fe', CAST('0', 'UInt128'));`。

:::note
入力値が [UInt128](../data-types/int-uint.md) の範囲内で表現できない場合、結果としてオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

* 正常に処理された場合は 128 ビット符号なし整数値。それ以外の場合は、指定されていればデフォルト値、指定されていなければ `0` を返します。[UInt128](../data-types/int-uint.md)。

:::note

* この関数は [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用します。つまり、小数部の桁を切り捨てます。
* デフォルト値の型はキャスト先の型と同じである必要があります。
  :::

**例**

クエリ:

```sql
SELECT
    toUInt128OrDefault('128', CAST('0', 'UInt128')),
    toUInt128OrDefault('abc', CAST('0', 'UInt128'))
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toUInt128OrDefault('128', CAST('0', 'UInt128')): 128
toUInt128OrDefault('abc', CAST('0', 'UInt128')): 0
```

**関連項目**

* [`toUInt128`](#touint128)。
* [`toUInt128OrZero`](#touint128orzero)。
* [`toUInt128OrNull`](#touint128ornull)。


## toUInt256 {#touint256}

入力値を [`UInt256`](../data-types/int-uint.md) 型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toUInt256(expr)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値、またはそれらの文字列表現。
* 型 Float32/64 の値。

サポートされない引数:

* Float32/64 の値の文字列表現（`NaN` や `Inf` を含む）。
* 2 進数や 16 進数値の文字列表現。例: `SELECT toUInt256('0xc0fe');`。

:::note
入力値が [UInt256](../data-types/int-uint.md) の範囲で表現できない場合、結果はオーバーフローまたはアンダーフローが発生します。
これはエラーとはみなされません。
:::

**返される値**

* 256 ビット符号なし整数値。[Int256](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。これは、小数部分の桁を切り捨てることを意味します。
:::

**例**

クエリ:

```sql
SELECT
    toUInt256(256),
    toUInt256(256.256),
    toUInt256('256')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toUInt256(256):     256
toUInt256(256.256): 256
toUInt256('256'):   256
```

**関連項目**

* [`toUInt256OrZero`](#touint256orzero)。
* [`toUInt256OrNull`](#touint256ornull)。
* [`toUInt256OrDefault`](#touint256ordefault)。


## toUInt256OrZero {#touint256orzero}

[`toUInt256`](#touint256) と同様に、この関数は入力値を [UInt256](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toUInt256OrZero(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`0` を返す）:

* `NaN` や `Inf` を含む Float32/64 型値の文字列表現。
* 2 進数および 16 進数値の文字列表現（例: `SELECT toUInt256OrZero('0xc0fe');`）。

:::note
入力値が [UInt256](../data-types/int-uint.md) の範囲内で表現できない場合、結果がオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**返り値**

* 成功時は 256 ビットの符号なし整数値、そうでない場合は `0`。[UInt256](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用し、小数部の桁を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toUInt256OrZero('256'),
    toUInt256OrZero('abc')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toUInt256OrZero('256'): 256
toUInt256OrZero('abc'): 0
```

**関連項目**

* [`toUInt256`](#touint256)。
* [`toUInt256OrNull`](#touint256ornull)。
* [`toUInt256OrDefault`](#touint256ordefault)。


## toUInt256OrNull {#touint256ornull}

[`toUInt256`](#touint256) と同様に、この関数は入力値を [UInt256](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toUInt256OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`\N` を返す）:

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toUInt256OrNull('0xc0fe');`。

:::note
入力値が [UInt256](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**返り値**

* 成功した場合は 256 ビット符号なし整数値、そうでない場合は `NULL`。[UInt256](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。これは、小数部の桁を切り捨てることを意味します。
:::

**例**

クエリ:

```sql
SELECT
    toUInt256OrNull('256'),
    toUInt256OrNull('abc')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toUInt256OrNull('256'): 256
toUInt256OrNull('abc'): ᴺᵁᴸᴸ
```

**関連項目**

* [`toUInt256`](#touint256).
* [`toUInt256OrZero`](#touint256orzero).
* [`toUInt256OrDefault`](#touint256ordefault).


## toUInt256OrDefault {#touint256ordefault}

[`toUInt256`](#touint256) と同様に、この関数は入力値を [UInt256](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 値が渡されなかった場合、エラー時には `0` が返されます。

**構文**

```sql
toUInt256OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（オプション） — 型 `UInt256` への変換に失敗した場合に返されるデフォルト値。[UInt256](../data-types/int-uint.md)。

サポートされている引数：

* 型 (U)Int8/16/32/64/128/256 の値またはその文字列表現。
* 型 Float32/64 の値。

デフォルト値が返される引数：

* `NaN` および `Inf` を含む、Float32/64 値の文字列表現
* 2 進数および 16 進数値の文字列表現（例：`SELECT toUInt256OrDefault('0xc0fe', CAST('0', 'UInt256'));`）

:::note
入力値が [UInt256](../data-types/int-uint.md) の範囲内で表現できない場合、結果がオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**返される値**

* 成功した場合は 256 ビット符号なし整数値。失敗した場合は、指定されていればデフォルト値、それ以外の場合は `0` を返します。[UInt256](../data-types/int-uint.md)。

:::note

* この関数は [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用します。これは、小数部分の桁を切り捨てることを意味します。
* デフォルト値の型はキャスト先の型と同じである必要があります。
  :::

**例**

クエリ：

```sql
SELECT
    toUInt256OrDefault('-256', CAST('0', 'UInt256')),
    toUInt256OrDefault('abc', CAST('0', 'UInt256'))
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toUInt256OrDefault('-256', CAST('0', 'UInt256')): 0
toUInt256OrDefault('abc', CAST('0', 'UInt256')):  0
```

**関連項目**

* [`toUInt256`](#touint256)。
* [`toUInt256OrZero`](#touint256orzero)。
* [`toUInt256OrNull`](#touint256ornull)。


## toFloat32 {#tofloat32}

入力値を [`Float32`](../data-types/float.md) 型の値に変換します。エラー時には例外をスローします。

**構文**

```sql
toFloat32(expr)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数：

* 型 (U)Int8/16/32/64/128/256 の値。
* (U)Int8/16/32/128/256 の文字列表現。
* 型 Float32/64 の値（`NaN` および `Inf` を含む）。
* Float32/64 の文字列表現（`NaN` および `Inf` を含む、大文字・小文字は区別しない）。

サポートされない引数：

* 2進数および16進数値の文字列表現。例: `SELECT toFloat32('0xc0fe');`。

**戻り値**

* 32ビット浮動小数点値。[Float32](../data-types/float.md)。

**例**

クエリ:

```sql
SELECT
    toFloat32(42.7),
    toFloat32('42.7'),
    toFloat32('NaN')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toFloat32(42.7):   42.7
toFloat32('42.7'): 42.7
toFloat32('NaN'):  nan
```

**関連項目**

* [`toFloat32OrZero`](#tofloat32orzero)。
* [`toFloat32OrNull`](#tofloat32ornull)。
* [`toFloat32OrDefault`](#tofloat32ordefault)。


## toFloat32OrZero {#tofloat32orzero}

[`toFloat32`](#tofloat32) と同様に、この関数は入力値を [Float32](../data-types/float.md) 型の値に変換し、エラーが発生した場合は `0` を返します。

**構文**

```sql
toFloat32OrZero(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされている引数:

* (U)Int8/16/32/128/256、Float32/64 の文字列表現。

サポートされていない引数（`0` を返す）:

* 2 進数および 16 進数値の文字列表現（例: `SELECT toFloat32OrZero('0xc0fe');`）。

**返される値**

* 正常に変換された場合は 32-bit Float の値、それ以外の場合は `0`。[Float32](../data-types/float.md)。

**例**

クエリ:

```sql
SELECT
    toFloat32OrZero('42.7'),
    toFloat32OrZero('abc')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toFloat32OrZero('42.7'): 42.7
toFloat32OrZero('abc'):  0
```

**関連項目**

* [`toFloat32`](#tofloat32)
* [`toFloat32OrNull`](#tofloat32ornull)
* [`toFloat32OrDefault`](#tofloat32ordefault)


## toFloat32OrNull {#tofloat32ornull}

[`toFloat32`](#tofloat32) と同様に、この関数は入力値を [Float32](../data-types/float.md) 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toFloat32OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数：

* (U)Int8/16/32/128/256、Float32/64 の文字列表現。

サポートされない引数（`\N` を返す）：

* バイナリおよび 16 進値の文字列表現。例：`SELECT toFloat32OrNull('0xc0fe');`。

**返される値**

* 成功した場合は 32 ビットの Float 値、それ以外の場合は `\N`。[Float32](../data-types/float.md)。

**例**

クエリ:

```sql
SELECT
    toFloat32OrNull('42.7'),
    toFloat32OrNull('abc')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toFloat32OrNull('42.7'): 42.7
toFloat32OrNull('abc'):  ᴺᵁᴸᴸ
```

**関連項目**

* [`toFloat32`](#tofloat32)
* [`toFloat32OrZero`](#tofloat32orzero)
* [`toFloat32OrDefault`](#tofloat32ordefault)


## toFloat32OrDefault {#tofloat32ordefault}

[`toFloat32`](#tofloat32) と同様に、この関数は入力値を [Float32](../data-types/float.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 値が指定されていない場合、エラー時には `0` が返されます。

**構文**

```sql
toFloat32OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (省略可能) — 型 `Float32` への変換に失敗した場合に返すデフォルト値。[Float32](../data-types/float.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値。
* (U)Int8/16/32/128/256 の文字列表現。
* `NaN` と `Inf` を含む Float32/64 型の値。
* `NaN` と `Inf` を含む Float32/64 の文字列表現（大文字・小文字を区別しない）。

デフォルト値が返される引数:

* 2 進数および 16 進数値の文字列表現。例: `SELECT toFloat32OrDefault('0xc0fe', CAST('0', 'Float32'));`。

**返される値**

* 成功した場合は 32 ビット Float 型の値。失敗した場合は、指定されていればデフォルト値、指定されていなければ `0` を返す。[Float32](../data-types/float.md)。

**例**

クエリ:

```sql
SELECT
    toFloat32OrDefault('8', CAST('0', 'Float32')),
    toFloat32OrDefault('abc', CAST('0', 'Float32'))
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toFloat32OrDefault('8', CAST('0', 'Float32')):   8
toFloat32OrDefault('abc', CAST('0', 'Float32')): 0
```

**関連項目**

* [`toFloat32`](#tofloat32)
* [`toFloat32OrZero`](#tofloat32orzero)
* [`toFloat32OrNull`](#tofloat32ornull)


## toFloat64 {#tofloat64}

入力値を[`Float64`](../data-types/float.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toFloat64(expr)
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値。
* (U)Int8/16/32/128/256 の文字列表現。
* `NaN` および `Inf` を含む型 Float32/64 の値。
* `NaN` および `Inf` を含む、型 Float32/64 の文字列表現 (大文字小文字は区別されない)。

サポートされない引数:

* 2 進数値および 16 進数値の文字列表現。例: `SELECT toFloat64('0xc0fe');`。

**返される値**

* 64 ビット浮動小数点数値。[Float64](../data-types/float.md)。

**例**

クエリ:

```sql
SELECT
    toFloat64(42.7),
    toFloat64('42.7'),
    toFloat64('NaN')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toFloat64(42.7):   42.7
toFloat64('42.7'): 42.7
toFloat64('NaN'):  nan
```

**関連項目**

* [`toFloat64OrZero`](#tofloat64orzero)。
* [`toFloat64OrNull`](#tofloat64ornull)。
* [`toFloat64OrDefault`](#tofloat64ordefault)。


## toFloat64OrZero {#tofloat64orzero}

[`toFloat64`](#tofloat64) と同様に、この関数は入力値を [Float64](../data-types/float.md) 型の値に変換しますが、エラーが発生した場合には `0` を返します。

**構文**

```sql
toFloat64OrZero(x)
```

**引数**

* `x` — 数値を表す String。[String](../data-types/string.md)。

サポートされる引数：

* (U)Int8/16/32/128/256、Float32/64 の String 表現。

サポートされない引数（`0` を返す）：

* 2 進数および 16 進数値の String 表現。例: `SELECT toFloat64OrZero('0xc0fe');`。

**返される値**

* 成功した場合は 64-bit の Float 値、それ以外の場合は `0`。[Float64](../data-types/float.md)。

**例**

クエリ:

```sql
SELECT
    toFloat64OrZero('42.7'),
    toFloat64OrZero('abc')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toFloat64OrZero('42.7'): 42.7
toFloat64OrZero('abc'):  0
```

**関連項目**

* [`toFloat64`](#tofloat64).
* [`toFloat64OrNull`](#tofloat64ornull).
* [`toFloat64OrDefault`](#tofloat64ordefault).


## toFloat64OrNull {#tofloat64ornull}

[`toFloat64`](#tofloat64) と同様に、この関数は入力値を [Float64](../data-types/float.md) 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toFloat64OrNull(x)
```

**引数**

* `x` — 数値を表す String。[String](../data-types/string.md)。

サポートされる引数：

* (U)Int8/16/32/128/256、Float32/64 を表す String。

サポートされない引数（`\N` を返す）：

* 2 進数および 16 進数値を表す String。例：`SELECT toFloat64OrNull('0xc0fe');`。

**返される値**

* 成功した場合は 64 ビットの Float 値、それ以外の場合は `\N`。[Float64](../data-types/float.md)。

**例**

クエリ:

```sql
SELECT
    toFloat64OrNull('42.7'),
    toFloat64OrNull('abc')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toFloat64OrNull('42.7'): 42.7
toFloat64OrNull('abc'):  ᴺᵁᴸᴸ
```

**関連項目**

* [`toFloat64`](#tofloat64)。
* [`toFloat64OrZero`](#tofloat64orzero)。
* [`toFloat64OrDefault`](#tofloat64ordefault)。


## toFloat64OrDefault {#tofloat64ordefault}

[`toFloat64`](#tofloat64) と同様に、この関数は入力値を [Float64](../data-types/float.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 引数が指定されていない場合は、エラー時に `0` が返されます。

**構文**

```sql
toFloat64OrDefault(expr[, default])
```

**引数**

* `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (省略可能) — 型 `Float64` への変換に失敗した場合に返すデフォルト値。[Float64](../data-types/float.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値。
* (U)Int8/16/32/128/256 型の文字列表現。
* `NaN` および `Inf` を含む Float32/64 型の値。
* `NaN` および `Inf` を含む Float32/64 型の文字列表現 (大文字・小文字は区別しない)。

デフォルト値が返される引数:

* 2 進数および 16 進数値の文字列表現。例: `SELECT toFloat64OrDefault('0xc0fe', CAST('0', 'Float64'));`。

**返される値**

* 成功した場合は 64 ビット浮動小数点数値。失敗した場合は、指定されていればデフォルト値を、指定されていなければ `0` を返す。[Float64](../data-types/float.md)。

**例**

クエリ:

```sql
SELECT
    toFloat64OrDefault('8', CAST('0', 'Float64')),
    toFloat64OrDefault('abc', CAST('0', 'Float64'))
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toFloat64OrDefault('8', CAST('0', 'Float64')):   8
toFloat64OrDefault('abc', CAST('0', 'Float64')): 0
```

**関連項目**

* [`toFloat64`](#tofloat64)
* [`toFloat64OrZero`](#tofloat64orzero)
* [`toFloat64OrNull`](#tofloat64ornull)


## toBFloat16 {#tobfloat16}

入力値を [`BFloat16`](/sql-reference/data-types/float#bfloat16) 型の値に変換します。
エラーが発生した場合は、例外をスローします。

**構文**

```sql
toBFloat16(expr)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

* (U)Int8/16/32/64/128/256 型の値。
* (U)Int8/16/32/64/128/256 の文字列表現。
* `NaN` および `Inf` を含む Float32/64 型の値。
* `NaN` および `Inf` を含む Float32/64 の文字列表現（大文字・小文字は区別しない）。

**返される値**

* 16ビット brain-float 値。[BFloat16](/sql-reference/data-types/float#bfloat16)。

**例**

```sql
SELECT toBFloat16(toFloat32(42.7))

42.5

SELECT toBFloat16(toFloat32('42.7'));

42.5

SELECT toBFloat16('42.7');

42.5
```

**関連項目**

* [`toBFloat16OrZero`](#tobfloat16orzero)。
* [`toBFloat16OrNull`](#tobfloat16ornull)。


## toBFloat16OrZero {#tobfloat16orzero}

文字列の入力値を [`BFloat16`](/sql-reference/data-types/float#bfloat16) 型の値に変換します。
文字列が浮動小数点数を表していない場合、この関数はゼロを返します。

**構文**

```sql
toBFloat16OrZero(x)
```

**引数**

* `x` — 数値を表す文字列。[String](../data-types/string.md)。

サポートされている引数:

* 数値を表す文字列。

サポートされていない引数（`0` を返す）:

* 2 進数および 16 進数値を表す文字列。
* 数値型の値。

**返される値**

* 16 ビットの brain-float 値。該当しない場合は `0`。[BFloat16](/sql-reference/data-types/float#bfloat16)。

:::note
この関数は、文字列表現から変換する際に精度が暗黙的に失われることを許容します。
:::

**例**

```sql
SELECT toBFloat16OrZero('0x5E'); -- unsupported arguments

0

SELECT toBFloat16OrZero('12.3'); -- typical use

12.25

SELECT toBFloat16OrZero('12.3456789');

12.3125 -- silent loss of precision
```

**関連項目**

* [`toBFloat16`](#tobfloat16)
* [`toBFloat16OrNull`](#tobfloat16ornull)


## toBFloat16OrNull {#tobfloat16ornull}

文字列の入力値を [`BFloat16`](/sql-reference/data-types/float#bfloat16) 型の値に変換します。
ただし、その文字列が浮動小数点値を表していない場合は `NULL` を返します。

**構文**

```sql
toBFloat16OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

* 数値の文字列表現。

サポートされない引数（`NULL` を返す）:

* 2 進数および 16 進数の文字列表現。
* 数値型の値。

**戻り値**

* 16 ビットの brain-float 値。それ以外の場合は `NULL` (`\N`)。[BFloat16](/sql-reference/data-types/float#bfloat16)。

:::note
この関数は、文字列表現からの変換時に、精度がエラーなしに失われることを許容します。
:::

**例**

```sql
SELECT toBFloat16OrNull('0x5E'); -- unsupported arguments

\N

SELECT toBFloat16OrNull('12.3'); -- typical use

12.25

SELECT toBFloat16OrNull('12.3456789');

12.3125 -- silent loss of precision
```

**関連項目**

* [`toBFloat16`](#tobfloat16)。
* [`toBFloat16OrZero`](#tobfloat16orzero)。


## toDate {#todate}

引数を [Date](../data-types/date.md) データ型に変換します。

引数が [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md) の場合、時刻部分を切り捨て、DateTime の日付部分のみを残します。

```sql
SELECT
    now() AS x,
    toDate(x)
```

```response
┌───────────────────x─┬─toDate(now())─┐
│ 2022-12-30 13:44:17 │    2022-12-30 │
└─────────────────────┴───────────────┘
```

引数が[String](../data-types/string.md)の場合、[Date](../data-types/date.md)または[DateTime](../data-types/datetime.md)としてパースされます。[DateTime](../data-types/datetime.md)としてパースされた場合は、その日付部分が使用されます。

```sql
SELECT
    toDate('2022-12-30') AS x,
    toTypeName(x)
```

```response
┌──────────x─┬─toTypeName(toDate('2022-12-30'))─┐
│ 2022-12-30 │ Date                             │
└────────────┴──────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

```sql
SELECT
    toDate('2022-12-30 01:02:03') AS x,
    toTypeName(x)
```

```response
┌──────────x─┬─toTypeName(toDate('2022-12-30 01:02:03'))─┐
│ 2022-12-30 │ Date                                      │
└────────────┴───────────────────────────────────────────┘
```

引数が数値で、UNIX タイムスタンプ形式であると判断できる場合（65535 より大きい場合）、現在のタイムゾーンにおいて [DateTime](../data-types/datetime.md) として解釈され、その後 [Date](../data-types/date.md) に切り捨てられます。タイムゾーンは、この関数の第 2 引数として指定できます。[Date](../data-types/date.md) への切り捨て結果はタイムゾーンに依存します。

```sql
SELECT
    now() AS current_time,
    toUnixTimestamp(current_time) AS ts,
    toDateTime(ts) AS time_Amsterdam,
    toDateTime(ts, 'Pacific/Apia') AS time_Samoa,
    toDate(time_Amsterdam) AS date_Amsterdam,
    toDate(time_Samoa) AS date_Samoa,
    toDate(ts) AS date_Amsterdam_2,
    toDate(ts, 'Pacific/Apia') AS date_Samoa_2
```

```response
Row 1:
──────
current_time:     2022-12-30 13:51:54
ts:               1672404714
time_Amsterdam:   2022-12-30 13:51:54
time_Samoa:       2022-12-31 01:51:54
date_Amsterdam:   2022-12-30
date_Samoa:       2022-12-31
date_Amsterdam_2: 2022-12-30
date_Samoa_2:     2022-12-31
```

上記の例は、同じ UNIX タイムスタンプが、タイムゾーンの違いによって異なる日付として解釈されることを示しています。

引数が数値で、かつ 65536 未満の場合、それは 1970-01-01（UNIX の最初の日）からの経過日数として解釈され、[Date](../data-types/date.md) に変換されます。これは `Date` データ型の内部的な数値表現に対応します。例:

```sql
SELECT toDate(12345)
```

```response
┌─toDate(12345)─┐
│    2003-10-20 │
└───────────────┘
```

この変換はタイムゾーンに依存しません。

引数が `Date` 型の範囲に収まらない場合、結果の挙動は実装依存となり、サポートされている最大日付に飽和するか、オーバーフローする可能性があります。

```sql
SELECT toDate(10000000000.)
```

```response
┌─toDate(10000000000.)─┐
│           2106-02-07 │
└──────────────────────┘
```

関数 `toDate` は、次のような別の書き方もできます。

```sql
SELECT
    now() AS time,
    toDate(time),
    DATE(time),
    CAST(time, 'Date')
```


```response
┌────────────────time─┬─toDate(now())─┬─DATE(now())─┬─CAST(now(), 'Date')─┐
│ 2022-12-30 13:54:58 │    2022-12-30 │  2022-12-30 │          2022-12-30 │
└─────────────────────┴───────────────┴─────────────┴─────────────────────┘
```


## toDateOrZero {#todateorzero}

[toDate](#todate) と同様ですが、無効な引数を受け取った場合は [Date](../data-types/date.md) の最小値を返します。[String](../data-types/string.md) 引数のみサポートされます。

**例**

クエリ:

```sql
SELECT toDateOrZero('2022-12-30'), toDateOrZero('');
```

結果:

```response
┌─toDateOrZero('2022-12-30')─┬─toDateOrZero('')─┐
│                 2022-12-30 │       1970-01-01 │
└────────────────────────────┴──────────────────┘
```


## toDateOrNull {#todateornull}

[toDate](#todate) と同様ですが、不正な引数を受け取った場合は `NULL` を返します。[String](../data-types/string.md) 型の引数のみがサポートされます。

**例**

クエリ：

```sql
SELECT toDateOrNull('2022-12-30'), toDateOrNull('');
```

結果：

```response
┌─toDateOrNull('2022-12-30')─┬─toDateOrNull('')─┐
│                 2022-12-30 │             ᴺᵁᴸᴸ │
└────────────────────────────┴──────────────────┘
```


## toDateOrDefault {#todateordefault}

[toDate](#todate) と同様ですが、変換に失敗した場合はデフォルト値を返します。デフォルト値は、第 2 引数が指定されていればその値、指定されていない場合は [Date](../data-types/date.md) 型の下限値です。

**構文**

```sql
toDateOrDefault(expr [, default_value])
```

**例**

クエリ：

```sql
SELECT toDateOrDefault('2022-12-30'), toDateOrDefault('', '2023-01-01'::Date);
```

結果：

```response
┌─toDateOrDefault('2022-12-30')─┬─toDateOrDefault('', CAST('2023-01-01', 'Date'))─┐
│                    2022-12-30 │                                      2023-01-01 │
└───────────────────────────────┴─────────────────────────────────────────────────┘
```


## toDateTime {#todatetime}

入力値を [DateTime](../data-types/datetime.md) に変換します。

**構文**

```sql
toDateTime(expr[, time_zone ])
```

**引数**

* `expr` — 値。[String](../data-types/string.md)、[Int](../data-types/int-uint.md)、[Date](../data-types/date.md) または [DateTime](../data-types/datetime.md)。
* `time_zone` — タイムゾーン。[String](../data-types/string.md)。

:::note
`expr` が数値の場合、Unix エポックの開始時刻からの秒数（Unix タイムスタンプ）として解釈されます。
`expr` が [String](../data-types/string.md) の場合、Unix タイムスタンプとして、または日付 / 日付と時刻の文字列表現として解釈されることがあります。
したがって、短い数値の文字列表現（4 桁まで）は曖昧性があるため明示的に無効になっています。たとえば文字列 `'1999'` は、年（Date / DateTime の不完全な文字列表現）とも Unix タイムスタンプとも解釈できてしまいます。一方、より長い数値文字列は有効です。
:::

**返される値**

* 日時。[DateTime](../data-types/datetime.md)

**例**

クエリ:

```sql
SELECT toDateTime('2022-12-30 13:44:17'), toDateTime(1685457500, 'UTC');
```

結果：

```response
┌─toDateTime('2022-12-30 13:44:17')─┬─toDateTime(1685457500, 'UTC')─┐
│               2022-12-30 13:44:17 │           2023-05-30 14:38:20 │
└───────────────────────────────────┴───────────────────────────────┘
```


## toDateTimeOrZero {#todatetimeorzero}

[toDateTime](#todatetime) と同様ですが、無効な引数を受け取った場合は [DateTime](../data-types/datetime.md) の最小値を返します。[String](../data-types/string.md) 型の引数のみがサポートされています。

**例**

クエリ:

```sql
SELECT toDateTimeOrZero('2022-12-30 13:44:17'), toDateTimeOrZero('');
```

結果：

```response
┌─toDateTimeOrZero('2022-12-30 13:44:17')─┬─toDateTimeOrZero('')─┐
│                     2022-12-30 13:44:17 │  1970-01-01 00:00:00 │
└─────────────────────────────────────────┴──────────────────────┘
```


## toDateTimeOrNull {#todatetimeornull}

[toDateTime](#todatetime) と同様ですが、無効な引数を受け取った場合は `NULL` を返します。[String](../data-types/string.md) 型の引数のみをサポートします。

**例**

クエリ:

```sql
SELECT toDateTimeOrNull('2022-12-30 13:44:17'), toDateTimeOrNull('');
```

結果：

```response
┌─toDateTimeOrNull('2022-12-30 13:44:17')─┬─toDateTimeOrNull('')─┐
│                     2022-12-30 13:44:17 │                 ᴺᵁᴸᴸ │
└─────────────────────────────────────────┴──────────────────────┘
```


## toDateTimeOrDefault {#todatetimeordefault}

[toDateTime](#todatetime) と同様ですが、変換に失敗した場合はデフォルト値を返します。デフォルト値は、第 3 引数が指定されていればその値、指定されていなければ [DateTime](../data-types/datetime.md) 型の下限値です。

**構文**

```sql
toDateTimeOrDefault(expr [, time_zone [, default_value]])
```

**例**

クエリ：

```sql
SELECT toDateTimeOrDefault('2022-12-30 13:44:17'), toDateTimeOrDefault('', 'UTC', '2023-01-01'::DateTime('UTC'));
```

結果：

```response
┌─toDateTimeOrDefault('2022-12-30 13:44:17')─┬─toDateTimeOrDefault('', 'UTC', CAST('2023-01-01', 'DateTime(\'UTC\')'))─┐
│                        2022-12-30 13:44:17 │                                                     2023-01-01 00:00:00 │
└────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────────┘
```


## toDate32 {#todate32}

引数を [Date32](../data-types/date32.md) データ型に変換します。値が範囲外の場合、`toDate32` は [Date32](../data-types/date32.md) でサポートされる境界値を返します。引数が [Date](../data-types/date.md) 型の場合、その型の取りうる範囲の境界も考慮されます。

**構文**

```sql
toDate32(expr)
```

**引数**

* `expr` — 値。[String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、または [Date](../data-types/date.md)。

**戻り値**

* 暦日。型は [Date32](../data-types/date32.md)。

**例**

1. 値が範囲内の場合:

```sql
SELECT toDate32('1955-01-01') AS value, toTypeName(value);
```

```response
┌──────value─┬─toTypeName(toDate32('1925-01-01'))─┐
│ 1955-01-01 │ Date32                             │
└────────────┴────────────────────────────────────┘
```

2. 値が範囲外の場合:

```sql
SELECT toDate32('1899-01-01') AS value, toTypeName(value);
```

```response
┌──────value─┬─toTypeName(toDate32('1899-01-01'))─┐
│ 1900-01-01 │ Date32                             │
└────────────┴────────────────────────────────────┘
```

3. [Date](../data-types/date.md) 型の引数を指定した場合:

```sql
SELECT toDate32(toDate('1899-01-01')) AS value, toTypeName(value);
```

```response
┌──────value─┬─toTypeName(toDate32(toDate('1899-01-01')))─┐
│ 1970-01-01 │ Date32                                     │
└────────────┴────────────────────────────────────────────┘
```


## toDate32OrZero {#todate32orzero}

[toDate32](#todate32) と同様ですが、無効な引数を受け取った場合には [Date32](../data-types/date32.md) の最小値を返します。

**例**

クエリ:

```sql
SELECT toDate32OrZero('1899-01-01'), toDate32OrZero('');
```

結果：

```response
┌─toDate32OrZero('1899-01-01')─┬─toDate32OrZero('')─┐
│                   1900-01-01 │         1900-01-01 │
└──────────────────────────────┴────────────────────┘
```


## toDate32OrNull {#todate32ornull}

[toDate32](#todate32) と同様ですが、無効な引数を受け取った場合は `NULL` を返します。

**例**

クエリ:

```sql
SELECT toDate32OrNull('1955-01-01'), toDate32OrNull('');
```

戻り値:

```response
┌─toDate32OrNull('1955-01-01')─┬─toDate32OrNull('')─┐
│                   1955-01-01 │               ᴺᵁᴸᴸ │
└──────────────────────────────┴────────────────────┘
```


## toDate32OrDefault {#todate32ordefault}

引数を [Date32](../data-types/date32.md) データ型に変換します。値が範囲外の場合、`toDate32OrDefault` は [Date32](../data-types/date32.md) でサポートされる下限値を返します。引数が [Date](../data-types/date.md) 型の場合は、その型の範囲も考慮されます。不正な引数が渡された場合はデフォルト値を返します。

**例**

クエリ:

```sql
SELECT
    toDate32OrDefault('1930-01-01', toDate32('2020-01-01')),
    toDate32OrDefault('xx1930-01-01', toDate32('2020-01-01'));
```

結果：

```response
┌─toDate32OrDefault('1930-01-01', toDate32('2020-01-01'))─┬─toDate32OrDefault('xx1930-01-01', toDate32('2020-01-01'))─┐
│                                              1930-01-01 │                                                2020-01-01 │
└─────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────┘
```


## toDateTime64 {#todatetime64}

入力値を [DateTime64](../data-types/datetime64.md) 型の値に変換します。

**構文**

```sql
toDateTime64(expr, scale, [timezone])
```

**引数**

* `expr` — 値。[String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[Float](../data-types/float.md) または [DateTime](../data-types/datetime.md)。
* `scale` - ティックサイズ（精度）。10<sup>-precision</sup> 秒。有効な範囲: [ 0 : 9 ]。
* `timezone` (オプション) - 指定された DateTime64 オブジェクトのタイムゾーン。

**返される値**

* サブ秒精度を持つカレンダー日付と時刻。[DateTime64](../data-types/datetime64.md)。

**例**

1. 値が範囲内にある場合:

```sql
SELECT toDateTime64('1955-01-01 00:00:00.000', 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64('1955-01-01 00:00:00.000', 3))─┐
│ 1955-01-01 00:00:00.000 │ DateTime64(3)                                          │
└─────────────────────────┴────────────────────────────────────────────────────────┘
```

2. 精度を指定した Decimal として:

```sql
SELECT toDateTime64(1546300800.000, 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64(1546300800., 3))─┐
│ 2019-01-01 00:00:00.000 │ DateTime64(3)                            │
└─────────────────────────┴──────────────────────────────────────────┘
```

小数点がない場合でも、その値は秒単位の Unix タイムスタンプとして扱われます。

```sql
SELECT toDateTime64(1546300800000, 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64(1546300800000, 3))─┐
│ 2282-12-31 00:00:00.000 │ DateTime64(3)                              │
└─────────────────────────┴────────────────────────────────────────────┘
```

3. `timezone` を指定した場合:

```sql
SELECT toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul') AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul'))─┐
│ 2019-01-01 00:00:00.000 │ DateTime64(3, 'Asia/Istanbul')                                      │
└─────────────────────────┴─────────────────────────────────────────────────────────────────────┘
```


## toDateTime64OrZero {#todatetime64orzero}

[toDateTime64](#todatetime64) と同様に、この関数は入力値を [DateTime64](../data-types/datetime64.md) 型の値に変換しますが、無効な引数が渡された場合は [DateTime64](../data-types/datetime64.md) の最小値を返します。

**構文**

```sql
toDateTime64OrZero(expr, scale, [timezone])
```

**引数**

* `expr` — 値。[String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[Float](../data-types/float.md) または [DateTime](../data-types/datetime.md)。
* `scale` - ティックサイズ（精度）：10<sup>-precision</sup> 秒。有効な範囲: [ 0 : 9 ]。
* `timezone`（任意）- 指定された DateTime64 オブジェクトのタイムゾーン。

**返り値**

* サブ秒精度を持つカレンダー日付および一日の時刻。それ以外の場合は `DateTime64` の最小値 `1970-01-01 01:00:00.000`。[DateTime64](../data-types/datetime64.md)。

**例**

クエリ:

```sql
SELECT toDateTime64OrZero('2008-10-12 00:00:00 00:30:30', 3) AS invalid_arg
```

結果：

```response
┌─────────────invalid_arg─┐
│ 1970-01-01 01:00:00.000 │
└─────────────────────────┘
```

**関連項目**

* [toDateTime64](#todatetime64)。
* [toDateTime64OrNull](#todatetime64ornull)。
* [toDateTime64OrDefault](#todatetime64ordefault)。


## toDateTime64OrNull {#todatetime64ornull}

[toDateTime64](#todatetime64) と同様に、この関数は入力値を [DateTime64](../data-types/datetime64.md) 型の値に変換しますが、無効な引数を受け取った場合は `NULL` を返します。

**構文**

```sql
toDateTime64OrNull(expr, scale, [timezone])
```

**引数**

* `expr` — 値。[String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[Float](../data-types/float.md) または [DateTime](../data-types/datetime.md)。
* `scale` - ティックサイズ（精度）：10<sup>-precision</sup> 秒。有効な範囲: [ 0 : 9 ]。
* `timezone`（省略可能）- 指定された DateTime64 オブジェクトのタイムゾーン。

**戻り値**

* サブ秒精度を持つ日付と時刻。条件を満たさない場合は `NULL`。[DateTime64](../data-types/datetime64.md)/[NULL](../data-types/nullable.md)。

**例**

クエリ:

```sql
SELECT
    toDateTime64OrNull('1976-10-18 00:00:00.30', 3) AS valid_arg,
    toDateTime64OrNull('1976-10-18 00:00:00 30', 3) AS invalid_arg
```

結果：

```response
┌───────────────valid_arg─┬─invalid_arg─┐
│ 1976-10-18 00:00:00.300 │        ᴺᵁᴸᴸ │
└─────────────────────────┴─────────────┘
```

**関連項目**

* [toDateTime64](#todatetime64)
* [toDateTime64OrZero](#todatetime64orzero)
* [toDateTime64OrDefault](#todatetime64ordefault)


## toDateTime64OrDefault {#todatetime64ordefault}

[toDateTime64](#todatetime64) と同様に、この関数は入力値を [DateTime64](../data-types/datetime64.md) 型の値に変換しますが、
無効な引数が渡された場合には、[DateTime64](../data-types/datetime64.md) のデフォルト値、
または指定されたデフォルト値のいずれかを返します。

**構文**

```sql
toDateTime64OrNull(expr, scale, [timezone, default])
```

**引数**

* `expr` — 値。[String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[Float](../data-types/float.md) または [DateTime](../data-types/datetime.md)。
* `scale` - ティックサイズ（精度）。10<sup>-precision</sup> 秒。有効な範囲: [ 0 : 9 ]。
* `timezone` (省略可能) - 指定された DateTime64 オブジェクトのタイムゾーン。
* `default` (省略可能) - 無効な引数が渡された場合に返すデフォルト値。[DateTime64](../data-types/datetime64.md)。

**返される値**

* サブ秒精度を持つカレンダー日付と時刻。それ以外の場合は `DateTime64` の最小値、または指定されていれば `default` の値。[DateTime64](../data-types/datetime64.md)。

**例**

クエリ:

```sql
SELECT
    toDateTime64OrDefault('1976-10-18 00:00:00 30', 3) AS invalid_arg,
    toDateTime64OrDefault('1976-10-18 00:00:00 30', 3, 'UTC', toDateTime64('2001-01-01 00:00:00.00',3)) AS invalid_arg_with_default
```

結果：

```response
┌─────────────invalid_arg─┬─invalid_arg_with_default─┐
│ 1970-01-01 01:00:00.000 │  2000-12-31 23:00:00.000 │
└─────────────────────────┴──────────────────────────┘
```

**関連項目**

* [toDateTime64](#todatetime64).
* [toDateTime64OrZero](#todatetime64orzero).
* [toDateTime64OrNull](#todatetime64ornull).


## toDecimal32 {#todecimal32}

入力値をスケール `S` を持つ [`Decimal(9, S)`](../data-types/decimal.md) 型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toDecimal32(expr, S)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。
* `S` — 0 から 9 の間のスケールパラメータ。数値の小数部に許容される桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
* 型 Float32/64 の値、またはその文字列表現。

サポートされない引数:

* Float32/64 の値 `NaN` および `Inf`、またはその文字列表現（大文字小文字は区別されません）。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toDecimal32('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal32` の範囲 `( -1 * 10^(9 - S), 1 * 10^(9 - S) )` を超えるとオーバーフローが発生する可能性があります。
小数部の余分な桁は切り捨てられます（丸められません）。
整数部の桁が多すぎる場合は、例外が発生します。
:::

:::warning
Float32/Float64 入力に対しては、浮動小数点命令を使用して演算が行われるため、変換時に余分な桁が失われ、予期しない挙動となる可能性があります。
例えば、`toDecimal32(1.15, 2)` は、浮動小数点において 1.15 * 100 が 114.99 となるため、`1.14` と等しくなります。
基になる整数型を使って演算させたい場合は、文字列入力を使用できます: `toDecimal32('1.15', 2) = 1.15`
:::

**返される値**

* 型 `Decimal(9, S)` の値。[Decimal32(S)](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT
    toDecimal32(2, 1) AS a, toTypeName(a) AS type_a,
    toDecimal32(4.2, 2) AS b, toTypeName(b) AS type_b,
    toDecimal32('4.2', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
a:      2
type_a: Decimal(9, 1)
b:      4.2
type_b: Decimal(9, 2)
c:      4.2
type_c: Decimal(9, 3)
```

**関連項目**

* [`toDecimal32OrZero`](#todecimal32orzero).
* [`toDecimal32OrNull`](#todecimal32ornull).
* [`toDecimal32OrDefault`](#todecimal32ordefault).


## toDecimal32OrZero {#todecimal32orzero}

[`toDecimal32`](#todecimal32) と同様に、この関数は入力値を型 [Decimal(9, S)](../data-types/decimal.md) の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toDecimal32OrZero(expr, S)
```

**引数**

* `expr` — 数値の文字列表現。[String](../data-types/string.md)。
* `S` — 0〜9 のスケールパラメーター。数値の小数部が持つことができる桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の文字列表現。
* 型 Float32/64 の文字列表現。

サポートされない引数:

* Float32/64 の値 `NaN` および `Inf` の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toDecimal32OrZero('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal32` の範囲 `( -1 * 10^(9 - S), 1 * 10^(9 - S) )` を超えると、オーバーフローが発生する可能性があります。
小数部の過剰な桁は切り捨てられます（丸めは行われません）。
整数部に過剰な桁があるとエラーになります。
:::

**返される値**

* 成功した場合は `Decimal(9, S)` 型の値。それ以外の場合は小数点以下 `S` 桁の `0`。[Decimal32(S)](../data-types/decimal.md)。

**例**

クエリ:

```sql
SELECT
    toDecimal32OrZero(toString(-1.111), 5) AS a,
    toTypeName(a),
    toDecimal32OrZero(toString('Inf'), 5) AS b,
    toTypeName(b)
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
a:             -1.111
toTypeName(a): Decimal(9, 5)
b:             0
toTypeName(b): Decimal(9, 5)
```

**関連項目**

* [`toDecimal32`](#todecimal32)
* [`toDecimal32OrNull`](#todecimal32ornull)
* [`toDecimal32OrDefault`](#todecimal32ordefault)


## toDecimal32OrNull {#todecimal32ornull}

[`toDecimal32`](#todecimal32) と同様に、この関数は入力値を [Nullable(Decimal(9, S))](../data-types/decimal.md) 型の値に変換しますが、エラーの場合は `0` を返します。

**構文**

```sql
toDecimal32OrNull(expr, S)
```

**引数**

* `expr` — 数値を表す String 型の値。[String](../data-types/string.md)。
* `S` — 0〜9 のスケールパラメーター。数値の小数部が持てる桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の文字列表現。
* 型 Float32/64 の文字列表現。

サポートされない引数:

* Float32/64 の値 `NaN` および `Inf` の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toDecimal32OrNull('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal32` の範囲 `( -1 * 10^(9 - S), 1 * 10^(9 - S) )` を超えると、オーバーフローが発生する可能性があります。
小数部の桁数が多すぎる場合は、余分な桁は切り捨てられます（四捨五入はされません）。
整数部の桁数が多すぎる場合は、エラーになります。
:::

**戻り値**

* 正常に変換された場合は型 `Nullable(Decimal(9, S))` の値、それ以外の場合は同じ型の値 `NULL`。[Decimal32(S)](../data-types/decimal.md)。

**例**

クエリ:

```sql
SELECT
    toDecimal32OrNull(toString(-1.111), 5) AS a,
    toTypeName(a),
    toDecimal32OrNull(toString('Inf'), 5) AS b,
    toTypeName(b)
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
a:             -1.111
toTypeName(a): Nullable(Decimal(9, 5))
b:             ᴺᵁᴸᴸ
toTypeName(b): Nullable(Decimal(9, 5))
```

**関連項目**

* [`toDecimal32`](#todecimal32)。
* [`toDecimal32OrZero`](#todecimal32orzero)。
* [`toDecimal32OrDefault`](#todecimal32ordefault)。


## toDecimal32OrDefault {#todecimal32ordefault}

[`toDecimal32`](#todecimal32) と同様に、この関数は入力値を型 [Decimal(9, S)](../data-types/decimal.md) の値に変換しますが、エラーが発生した場合にはデフォルト値を返します。

**構文**

```sql
toDecimal32OrDefault(expr, S[, default])
```

**引数**

* `expr` — 数値の文字列表現。[String](../data-types/string.md)。
* `S` — 0 から 9 の間のスケールパラメーターで、数値の小数部が持つことができる桁数を指定します。[UInt8](../data-types/int-uint.md)。
* `default` (省略可) — `Decimal32(S)` 型へのパースに失敗した場合に返されるデフォルト値。[Decimal32(S)](../data-types/decimal.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の文字列表現。
* 型 Float32/64 の文字列表現。

サポート対象外の引数:

* Float32/64 の値 `NaN` と `Inf` の文字列表現。
* 2 進数および 16 進数値の文字列表現 (例: `SELECT toDecimal32OrDefault('0xc0fe', 1);`)。

:::note
`expr` の値が `Decimal32` の範囲 `( -1 * 10^(9 - S), 1 * 10^(9 - S) )` を超えると、オーバーフローが発生する可能性があります。
小数部の過剰な桁は切り捨てられます (四捨五入はされません)。
整数部の過剰な桁はエラーになります。
:::

:::warning
変換では余分な桁が切り捨てられ、演算が浮動小数点命令を使って行われるため、Float32/Float64 の入力に対して予期しない動作をする可能性があります。
例えば、`toDecimal32OrDefault(1.15, 2)` は `1.14` と等しくなります。これは、浮動小数点において 1.15 * 100 が 114.99 となるためです。
演算に内部の整数型を使用させるには、`String` 入力を使用できます: `toDecimal32OrDefault('1.15', 2) = 1.15`
:::

**戻り値**

* 成功した場合は型 `Decimal(9, S)` の値を返し、失敗した場合は指定されていればデフォルト値を、指定されていなければ `0` を返します。[Decimal32(S)](../data-types/decimal.md)。

**使用例**

クエリ:

```sql
SELECT
    toDecimal32OrDefault(toString(0.0001), 5) AS a,
    toTypeName(a),
    toDecimal32OrDefault('Inf', 0, CAST('-1', 'Decimal32(0)')) AS b,
    toTypeName(b)
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
a:             0.0001
toTypeName(a): Decimal(9, 5)
b:             -1
toTypeName(b): Decimal(9, 0)
```

**関連項目**

* [`toDecimal32`](#todecimal32)。
* [`toDecimal32OrZero`](#todecimal32orzero)。
* [`toDecimal32OrNull`](#todecimal32ornull)。


## toDecimal64 {#todecimal64}

入力値を、スケール `S` を持つ型 [`Decimal(18, S)`](../data-types/decimal.md) の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toDecimal64(expr, S)
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions)。
* `S` — 0 以上 18 以下のスケールパラメータ。数値の小数部で許容される桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
* 型 Float32/64 の値、またはその文字列表現。

サポートされない引数:

* Float32/64 の値 `NaN` および `Inf`、またはそれらの文字列表現（大文字小文字は区別しない）。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toDecimal64('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal64` の範囲 `( -1 * 10^(18 - S), 1 * 10^(18 - S) )` を超えると、オーバーフローが発生する可能性があります。
小数部の過剰な桁は切り捨てられます（丸めは行われません）。
整数部の桁が多すぎる場合は、例外がスローされます。
:::

:::warning
変換では余分な桁が切り捨てられ、Float32/Float64 を入力として扱う場合、浮動小数点命令で演算が行われるため、想定外の動作になる可能性があります。
たとえば、`toDecimal64(1.15, 2)` は `1.14` になります。これは浮動小数点において 1.15 * 100 が 114.99 となるためです。
演算で基盤となる整数型を使用するようにするには、文字列（String）入力を使用できます: `toDecimal64('1.15', 2) = 1.15`
:::

**戻り値**

* 型 `Decimal(18, S)` の値。[Decimal64(S)](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT
    toDecimal64(2, 1) AS a, toTypeName(a) AS type_a,
    toDecimal64(4.2, 2) AS b, toTypeName(b) AS type_b,
    toDecimal64('4.2', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
a:      2
type_a: Decimal(18, 1)
b:      4.2
type_b: Decimal(18, 2)
c:      4.2
type_c: Decimal(18, 3)
```

**関連項目**

* [`toDecimal64OrZero`](#todecimal64orzero)。
* [`toDecimal64OrNull`](#todecimal64ornull)。
* [`toDecimal64OrDefault`](#todecimal64ordefault)。


## toDecimal64OrZero {#todecimal64orzero}

[`toDecimal64`](#todecimal64) と同様に、この関数は入力値を型 [Decimal(18, S)](../data-types/decimal.md) に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toDecimal64OrZero(expr, S)
```

**引数**

* `expr` — 数値の文字列表現。[String](../data-types/string.md)。
* `S` — 0 から 18 の間のスケールパラメータで、小数部に許容される桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の文字列表現。
* 型 Float32/64 の文字列表現。

サポートされない引数:

* Float32/64 の値 `NaN` および `Inf` の文字列表現。
* 2進数および16進数値の文字列表現。例: `SELECT toDecimal64OrZero('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal64` の範囲 `( -1 * 10^(18 - S), 1 * 10^(18 - S) )` を超える場合、オーバーフローが発生する可能性があります。
小数部の過剰な桁は切り捨てられます（四捨五入はされません）。
整数部の桁が多すぎる場合はエラーになります。
:::

**戻り値**

* 成功した場合は型 `Decimal(18, S)` の値、失敗した場合は小数部 `S` 桁の `0`。[Decimal64(S)](../data-types/decimal.md)。

**例**

クエリ:

```sql
SELECT
    toDecimal64OrZero(toString(0.0001), 18) AS a,
    toTypeName(a),
    toDecimal64OrZero(toString('Inf'), 18) AS b,
    toTypeName(b)
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
a:             0.0001
toTypeName(a): Decimal(18, 18)
b:             0
toTypeName(b): Decimal(18, 18)
```

**関連項目**

* [`toDecimal64`](#todecimal64)。
* [`toDecimal64OrNull`](#todecimal64ornull)。
* [`toDecimal64OrDefault`](#todecimal64ordefault)。


## toDecimal64OrNull {#todecimal64ornull}

[`toDecimal64`](#todecimal64) と同様に、この関数は入力値を [Nullable(Decimal(18, S))](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toDecimal64OrNull(expr, S)
```

**引数**

* `expr` — 数値の文字列表現。 [String](../data-types/string.md)。
* `S` — 0 から 18 の間のスケールパラメータ。数値の小数部に含めることができる桁数を指定します。 [UInt8](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の文字列表現。
* 型 Float32/64 の文字列表現。

サポートされない引数:

* Float32/64 の値 `NaN` および `Inf` の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toDecimal64OrNull('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal64` の範囲 `( -1 * 10^(18 - S), 1 * 10^(18 - S) )` を超えるとオーバーフローが発生する可能性があります。
小数部の過剰な桁は切り捨てられます（丸めは行われません）。
整数部の桁が多すぎる場合はエラーになります。
:::

**戻り値**

* 成功した場合は型 `Nullable(Decimal(18, S))` の値、それ以外の場合は同じ型の値 `NULL`。 [Decimal64(S)](../data-types/decimal.md)。

**例**

クエリ:

```sql
SELECT
    toDecimal64OrNull(toString(0.0001), 18) AS a,
    toTypeName(a),
    toDecimal64OrNull(toString('Inf'), 18) AS b,
    toTypeName(b)
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
a:             0.0001
toTypeName(a): Nullable(Decimal(18, 18))
b:             ᴺᵁᴸᴸ
toTypeName(b): Nullable(Decimal(18, 18))
```

**関連項目**

* [`toDecimal64`](#todecimal64)。
* [`toDecimal64OrZero`](#todecimal64orzero)。
* [`toDecimal64OrDefault`](#todecimal64ordefault)。


## toDecimal64OrDefault {#todecimal64ordefault}

[`toDecimal64`](#todecimal64) と同様に、この関数は入力値を [Decimal(18, S)](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。

**構文**

```sql
toDecimal64OrDefault(expr, S[, default])
```

**引数**

* `expr` — 数値を表す文字列。[String](../data-types/string.md)。
* `S` — 0〜18 のスケールパラメータ。数値の小数部に許容される桁数を指定します。[UInt8](../data-types/int-uint.md)。
* `default` (省略可) — `Decimal64(S)` 型への解析に失敗した場合に返されるデフォルト値。[Decimal64(S)](../data-types/decimal.md)。

サポートされている引数:

* 型 (U)Int8/16/32/64/128/256 の文字列表現。
* 型 Float32/64 の文字列表現。

サポートされていない引数:

* Float32/64 の値 `NaN` および `Inf` の文字列表現。
* 2 進数および 16 進数の文字列表現。例: `SELECT toDecimal64OrDefault('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal64` の範囲 `( -1 * 10^(18 - S), 1 * 10^(18 - S) )` を超えると、オーバーフローが発生する可能性があります。
小数部の過剰な桁は切り捨てられます (四捨五入はされません)。
整数部の過剰な桁はエラーになります。
:::

:::warning
変換時に余分な桁が切り捨てられるため、Float32/Float64 入力を扱う場合、演算が浮動小数点命令を用いて実行されることにより、予期しない動作をする可能性があります。
たとえば、`toDecimal64OrDefault(1.15, 2)` は `1.14` となります。これは、浮動小数点における 1.15 * 100 が 114.99 となるためです。
内部の整数型で演算を行うには、String 入力を使用します: `toDecimal64OrDefault('1.15', 2) = 1.15`
:::

**戻り値**

* 成功した場合は `Decimal(18, S)` 型の値。失敗した場合は、指定されていればデフォルト値、指定されていなければ `0` を返します。[Decimal64(S)](../data-types/decimal.md)。

**使用例**

クエリ:

```sql
SELECT
    toDecimal64OrDefault(toString(0.0001), 18) AS a,
    toTypeName(a),
    toDecimal64OrDefault('Inf', 0, CAST('-1', 'Decimal64(0)')) AS b,
    toTypeName(b)
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
a:             0.0001
toTypeName(a): Decimal(18, 18)
b:             -1
toTypeName(b): Decimal(18, 0)
```

**関連項目**

* [`toDecimal64`](#todecimal64)。
* [`toDecimal64OrZero`](#todecimal64orzero)。
* [`toDecimal64OrNull`](#todecimal64ornull)。


## toDecimal128 {#todecimal128}

入力値を、スケール `S` を持つ [`Decimal(38, S)`](../data-types/decimal.md) 型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toDecimal128(expr, S)
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions)。
* `S` — 0〜38 のスケールパラメーターで、数値の小数部が持てる桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
* 型 Float32/64 の値、またはその文字列表現。

サポートされない引数:

* 値 `NaN` および `Inf`（大文字小文字は区別しない）の Float32/64 の値、またはその文字列表現。
* バイナリ値および 16 進値の文字列表現。例: `SELECT toDecimal128('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal128` の範囲 `( -1 * 10^(38 - S), 1 * 10^(38 - S) )` を超えるとオーバーフローが発生する可能性があります。
小数部の桁数が多すぎる場合、その超過分は切り捨てられます（丸められません）。
整数部の桁数が多すぎる場合は例外がスローされます。
:::

:::warning
変換では余分な桁が切り捨てられ、Float32/Float64 を入力として使用する場合、浮動小数点命令で演算が行われるため、予期しない動作をすることがあります。
例えば、`toDecimal128(1.15, 2)` は `1.14` と等しくなります。これは、浮動小数点において 1.15 * 100 が 114.99 になるためです。
内部の整数型で演算を行うようにするには、String を入力として使用できます: `toDecimal128('1.15', 2) = 1.15`
:::

**戻り値**

* 型 `Decimal(38, S)` の値。[Decimal128(S)](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT
    toDecimal128(99, 1) AS a, toTypeName(a) AS type_a,
    toDecimal128(99.67, 2) AS b, toTypeName(b) AS type_b,
    toDecimal128('99.67', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
a:      99
type_a: Decimal(38, 1)
b:      99.67
type_b: Decimal(38, 2)
c:      99.67
type_c: Decimal(38, 3)
```

**関連項目**

* [`toDecimal128OrZero`](#todecimal128orzero)。
* [`toDecimal128OrNull`](#todecimal128ornull)。
* [`toDecimal128OrDefault`](#todecimal128ordefault)。


## toDecimal128OrZero {#todecimal128orzero}

[`toDecimal128`](#todecimal128) と同様に、この関数は入力値を型 [Decimal(38, S)](../data-types/decimal.md) の値に変換し、エラーが発生した場合は `0` を返します。

**構文**

```sql
toDecimal128OrZero(expr, S)
```

**引数**

* `expr` — 数値の文字列表現。[String](../data-types/string.md)。
* `S` — 0 から 38 の間のスケールを表すパラメータで、数値の小数部に許容される桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数：

* 型 (U)Int8/16/32/64/128/256 の文字列表現。
* 型 Float32/64 の文字列表現。

サポートされない引数：

* Float32/64 の値 `NaN` および `Inf` の文字列表現。
* バイナリ値および 16 進値の文字列表現 (例: `SELECT toDecimal128OrZero('0xc0fe', 1);`)。

:::note
`expr` の値が `Decimal128` の範囲 `( -1 * 10^(38 - S), 1 * 10^(38 - S) )` を超えると、オーバーフローが発生する可能性があります。
小数部の余分な桁は切り捨てられます (四捨五入はされません)。
整数部の余分な桁はエラーになります。
:::

**返される値**

* 成功した場合は `Decimal(38, S)` 型の値が返されます。失敗した場合は小数部が `S` 桁の `0` が返されます。[Decimal128(S)](../data-types/decimal.md)。

**例**

クエリ:

```sql
SELECT
    toDecimal128OrZero(toString(0.0001), 38) AS a,
    toTypeName(a),
    toDecimal128OrZero(toString('Inf'), 38) AS b,
    toTypeName(b)
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
a:             0.0001
toTypeName(a): Decimal(38, 38)
b:             0
toTypeName(b): Decimal(38, 38)
```

**関連項目**

* [`toDecimal128`](#todecimal128)。
* [`toDecimal128OrNull`](#todecimal128ornull)。
* [`toDecimal128OrDefault`](#todecimal128ordefault)。


## toDecimal128OrNull {#todecimal128ornull}

[`toDecimal128`](#todecimal128) と同様に、この関数は入力値を [Nullable(Decimal(38, S))](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toDecimal128OrNull(expr, S)
```

**引数**

* `expr` — 数値の文字列表現。[String](../data-types/string.md)。
* `S` — 0〜38 のスケールを表すパラメータ。数値の小数部に含めることができる桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の文字列表現。
* 型 Float32/64 の文字列表現。

サポートされない引数:

* Float32/64 の値 `NaN` および `Inf` の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toDecimal128OrNull('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal128` の範囲 `( -1 * 10^(38 - S), 1 * 10^(38 - S) )` を超えると、オーバーフローが発生する可能性があります。
小数部で桁数が多すぎる分は切り捨てられます（丸めは行われません）。
整数部で桁数が多すぎる場合はエラーになります。
:::

**返される値**

* 正常に変換された場合は、型 `Nullable(Decimal(38, S))` の値が返されます。失敗した場合は、同じ型の `NULL` が返されます。[Decimal128(S)](../data-types/decimal.md)。

**例**

クエリ:

```sql
SELECT
    toDecimal128OrNull(toString(1/42), 38) AS a,
    toTypeName(a),
    toDecimal128OrNull(toString('Inf'), 38) AS b,
    toTypeName(b)
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
a:             0.023809523809523808
toTypeName(a): Nullable(Decimal(38, 38))
b:             ᴺᵁᴸᴸ
toTypeName(b): Nullable(Decimal(38, 38))
```

**関連項目**

* [`toDecimal128`](#todecimal128)。
* [`toDecimal128OrZero`](#todecimal128orzero)。
* [`toDecimal128OrDefault`](#todecimal128ordefault)。


## toDecimal128OrDefault {#todecimal128ordefault}

[`toDecimal128`](#todecimal128) と同様に、この関数は入力値を型 [Decimal(38, S)](../data-types/decimal.md) の値に変換しますが、エラーが発生した場合にはデフォルト値を返します。

**構文**

```sql
toDecimal128OrDefault(expr, S[, default])
```

**引数**

* `expr` — 数値の文字列表現。[String](../data-types/string.md)。
* `S` — 0〜38 のスケールパラメータ。数値の小数部が持てる桁数を指定します。[UInt8](../data-types/int-uint.md)。
* `default` (省略可) — `Decimal128(S)` 型へのパースが失敗した場合に返すデフォルト値。[Decimal128(S)](../data-types/decimal.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の文字列表現。
* 型 Float32/64 の文字列表現。

サポートされない引数:

* Float32/64 の値 `NaN` および `Inf` の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toDecimal128OrDefault('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal128` の範囲 `( -1 * 10^(38 - S), 1 * 10^(38 - S) )` を超えるとオーバーフローが発生する可能性があります。
小数部の過剰な桁は切り捨てられます (丸めません)。
整数部の過剰な桁はエラーになります。
:::

:::warning
変換時には余分な桁が切り捨てられ、Float32/Float64 入力を扱う場合、演算は浮動小数点命令で実行されるため予期しない結果になる可能性があります。
例えば、`toDecimal128OrDefault(1.15, 2)` は、浮動小数点では 1.15 * 100 が 114.99 となるため `1.14` と等しくなります。
演算を内部の整数型で行うには、String 入力を使用してください: `toDecimal128OrDefault('1.15', 2) = 1.15`
:::

**返される値**

* 成功時は型 `Decimal(38, S)` の値。それ以外の場合、指定されていればデフォルト値、指定されていなければ `0` を返します。[Decimal128(S)](../data-types/decimal.md)。

**例**

クエリ:

```sql
SELECT
    toDecimal128OrDefault(toString(1/42), 18) AS a,
    toTypeName(a),
    toDecimal128OrDefault('Inf', 0, CAST('-1', 'Decimal128(0)')) AS b,
    toTypeName(b)
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
a:             0.023809523809523808
toTypeName(a): Decimal(38, 18)
b:             -1
toTypeName(b): Decimal(38, 0)
```

**関連項目**

* [`toDecimal128`](#todecimal128)。
* [`toDecimal128OrZero`](#todecimal128orzero)。
* [`toDecimal128OrNull`](#todecimal128ornull)。


## toDecimal256 {#todecimal256}

入力値をスケール `S` を持つ型 [`Decimal(76, S)`](../data-types/decimal.md) の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toDecimal256(expr, S)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。
* `S` — 0 から 76 の間のスケールパラメーター。数値の小数部が持つことができる桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値または文字列表現。
* 型 Float32/64 の値または文字列表現。

サポートされない引数:

* Float32/64 の値 `NaN` および `Inf`、またはそれらの文字列表現（大文字小文字は区別されません）。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toDecimal256('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal256` の範囲 `( -1 * 10^(76 - S), 1 * 10^(76 - S) )` を超えるとオーバーフローが発生する可能性があります。
小数部の桁数が多すぎる場合は、余分な桁は切り捨てられます（四捨五入はされません）。
整数部の桁数が多すぎる場合は、例外が発生します。
:::

:::warning
変換時には余分な桁が切り捨てられ、Float32/Float64 を入力として使用する場合、演算は浮動小数点命令で実行されるため、予期しない動作をする可能性があります。
例えば、`toDecimal256(1.15, 2)` は、浮動小数点では 1.15 * 100 が 114.99 となるため `1.14` と等しくなります。
演算で内部的に整数型が使用されるようにするために、String を入力として使用できます: `toDecimal256('1.15', 2) = 1.15`
:::

**返される値**

* 型 `Decimal(76, S)` の値。[Decimal256(S)](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT
    toDecimal256(99, 1) AS a, toTypeName(a) AS type_a,
    toDecimal256(99.67, 2) AS b, toTypeName(b) AS type_b,
    toDecimal256('99.67', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
a:      99
type_a: Decimal(76, 1)
b:      99.67
type_b: Decimal(76, 2)
c:      99.67
type_c: Decimal(76, 3)
```

**関連項目**

* [`toDecimal256OrZero`](#todecimal256orzero)。
* [`toDecimal256OrNull`](#todecimal256ornull)。
* [`toDecimal256OrDefault`](#todecimal256ordefault)。


## toDecimal256OrZero {#todecimal256orzero}

[`toDecimal256`](#todecimal256) と同様に、この関数は入力値を [Decimal(76, S)](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toDecimal256OrZero(expr, S)
```

**引数**

* `expr` — 数値の文字列表現。[String](../data-types/string.md)。
* `S` — 0〜76 の間のスケールパラメータで、数値の小数部分が取りうる桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の文字列表現。
* 型 Float32/64 の文字列表現。

サポートされない引数:

* Float32/64 の値 `NaN` および `Inf` の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toDecimal256OrZero('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal256` の範囲 `( -1 * 10^(76 - S), 1 * 10^(76 - S) )` を超えるとオーバーフローが発生する可能性があります。
小数部の余分な桁は切り捨てられます（丸めは行われません）。
整数部の余分な桁はエラーになります。
:::

**戻り値**

* 正常に処理された場合は型 `Decimal(76, S)` の値、それ以外の場合は小数部が `S` 桁の `0`。[Decimal256(S)](../data-types/decimal.md)。

**例**

クエリ:

```sql
SELECT
    toDecimal256OrZero(toString(0.0001), 76) AS a,
    toTypeName(a),
    toDecimal256OrZero(toString('Inf'), 76) AS b,
    toTypeName(b)
FORMAT Vertical;
```

戻り値:

```response
Row 1:
──────
a:             0.0001
toTypeName(a): Decimal(76, 76)
b:             0
toTypeName(b): Decimal(76, 76)
```

**関連項目**

* [`toDecimal256`](#todecimal256).
* [`toDecimal256OrNull`](#todecimal256ornull).
* [`toDecimal256OrDefault`](#todecimal256ordefault).


## toDecimal256OrNull {#todecimal256ornull}

[`toDecimal256`](#todecimal256) と同様に、この関数は入力値を [Nullable(Decimal(76, S))](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toDecimal256OrNull(expr, S)
```

**引数**

* `expr` — 数値の文字列表現。[String](../data-types/string.md)。
* `S` — 0 から 76 までのスケールパラメータ。数値の小数部が取りうる桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の文字列表現。
* 型 Float32/64 の文字列表現。

サポートされない引数:

* Float32/64 の値 `NaN` および `Inf` の文字列表現。
* 2進数および16進数値の文字列表現。例: `SELECT toDecimal256OrNull('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal256` の範囲を超えるとオーバーフローが発生する可能性があります: `( -1 * 10^(76 - S), 1 * 10^(76 - S) )`。
小数部の過剰な桁は切り捨てられます(丸めは行われません)。
整数部の過剰な桁はエラーになります。
:::

**戻り値**

* 正常に変換された場合は型 `Nullable(Decimal(76, S))` の値、それ以外の場合は同じ型の `NULL` 値。[Decimal256(S)](../data-types/decimal.md)。

**例**

クエリ:

```sql
SELECT
    toDecimal256OrNull(toString(1/42), 76) AS a,
    toTypeName(a),
    toDecimal256OrNull(toString('Inf'), 76) AS b,
    toTypeName(b)
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
a:             0.023809523809523808
toTypeName(a): Nullable(Decimal(76, 76))
b:             ᴺᵁᴸᴸ
toTypeName(b): Nullable(Decimal(76, 76))
```

**関連項目**

* [`toDecimal256`](#todecimal256)。
* [`toDecimal256OrZero`](#todecimal256orzero)。
* [`toDecimal256OrDefault`](#todecimal256ordefault)。


## toDecimal256OrDefault {#todecimal256ordefault}

[`toDecimal256`](#todecimal256) と同様に、この関数は入力値を [Decimal(76, S)](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合にはデフォルト値を返します。

**構文**

```sql
toDecimal256OrDefault(expr, S[, default])
```

**引数**

* `expr` — 数値の文字列表現。 [String](../data-types/string.md)。
* `S` — 0 から 76 の間のスケールパラメータ。数値の小数部が持てる桁数を指定します。 [UInt8](../data-types/int-uint.md)。
* `default` (省略可) — `Decimal256(S)` 型へのパースに失敗した場合に返すデフォルト値。 [Decimal256(S)](../data-types/decimal.md)。

サポートされる引数:

* (U)Int8/16/32/64/128/256 型の文字列表現。
* Float32/64 型の文字列表現。

サポートされない引数:

* Float32/64 の値 `NaN` および `Inf` の文字列表現。
* 2 進数および 16 進数の文字列表現。例: `SELECT toDecimal256OrDefault('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal256` の範囲 `( -1 * 10^(76 - S), 1 * 10^(76 - S) )` を超える場合、オーバーフローが発生する可能性があります。
小数部の過剰な桁は切り捨てられます (四捨五入は行われません)。
整数部の過剰な桁はエラーの原因になります。
:::

:::warning
変換では余分な桁が切り捨てられ、Float32/Float64 の入力を扱う際には、演算が浮動小数点命令で実行されるため予期しない動作となる場合があります。
例えば、`toDecimal256OrDefault(1.15, 2)` は `1.14` になります。これは、浮動小数点では 1.15 * 100 が 114.99 となるためです。
演算で内部的な整数型を使用させるには、String 入力を使用できます: `toDecimal256OrDefault('1.15', 2) = 1.15`
:::

**戻り値**

* 成功した場合は `Decimal(76, S)` 型の値。失敗した場合は、指定されていればデフォルト値を、指定されていなければ `0` を返します。 [Decimal256(S)](../data-types/decimal.md)。

**例**

クエリ:

```sql
SELECT
    toDecimal256OrDefault(toString(1/42), 76) AS a,
    toTypeName(a),
    toDecimal256OrDefault('Inf', 0, CAST('-1', 'Decimal256(0)')) AS b,
    toTypeName(b)
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
a:             0.023809523809523808
toTypeName(a): Decimal(76, 76)
b:             -1
toTypeName(b): Decimal(76, 0)
```

**関連項目**

* [`toDecimal256`](#todecimal256)。
* [`toDecimal256OrZero`](#todecimal256orzero)。
* [`toDecimal256OrNull`](#todecimal256ornull)。


## toString {#tostring}

値をその文字列表現に変換します。
`DateTime` 型の引数に対しては、タイムゾーン名を指定する 2 番目の `String` 型引数を受け取ることができます。

**構文**

```sql
toString(value[, timezone])
```

**引数**

* `value`: 文字列に変換する値。[`Any`](/sql-reference/data-types)。
* `timezone`: 省略可能。`DateTime` 変換時のタイムゾーン名。[`String`](/sql-reference/data-types/string)。

**戻り値**

* 入力値の文字列表現を返します。[`String`](/sql-reference/data-types/string)。

**例**

**使用例**

```sql title="Query"
SELECT
    now() AS ts,
    time_zone,
    toString(ts, time_zone) AS str_tz_datetime
FROM system.time_zones
WHERE time_zone LIKE 'Europe%'
LIMIT 10;
```

```response title="Response"
┌──────────────────ts─┬─time_zone─────────┬─str_tz_datetime─────┐
│ 2023-09-08 19:14:59 │ Europe/Amsterdam  │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Andorra    │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Astrakhan  │ 2023-09-08 23:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Athens     │ 2023-09-08 22:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Belfast    │ 2023-09-08 20:14:59 │
└─────────────────────┴───────────────────┴─────────────────────┘
```


## toFixedString {#tofixedstring}

[String](../data-types/string.md) 型の引数を [FixedString(N)](../data-types/fixedstring.md) 型（長さ N の固定長文字列）に変換します。
文字列のバイト数が N 未満の場合は、右側をヌルバイトで埋めます。文字列のバイト数が N を超える場合は、例外がスローされます。

**構文**

```sql
toFixedString(s, N)
```

**引数**

* `s` — 固定長文字列に変換する対象の文字列。[String](../data-types/string.md)。
* `N` — 長さ N。[UInt8](../data-types/int-uint.md)。

**戻り値**

* `s` を長さ N の固定長文字列に変換した値。[FixedString](../data-types/fixedstring.md)。

**例**

クエリ:

```sql
SELECT toFixedString('foo', 8) AS s;
```

結果：

```response
┌─s─────────────┐
│ foo\0\0\0\0\0 │
└───────────────┘
```


## toStringCutToZero {#tostringcuttozero}

String または FixedString 型の引数を受け取り、最初に見つかったゼロバイト以降を切り捨てた String を返します。

**構文**

```sql
toStringCutToZero(s)
```

**例**

クエリ：

```sql
SELECT toFixedString('foo', 8) AS s, toStringCutToZero(s) AS s_cut;
```

結果:

```response
┌─s─────────────┬─s_cut─┐
│ foo\0\0\0\0\0 │ foo   │
└───────────────┴───────┘
```

クエリ：

```sql
SELECT toFixedString('foo\0bar', 8) AS s, toStringCutToZero(s) AS s_cut;
```

結果：

```response
┌─s──────────┬─s_cut─┐
│ foo\0bar\0 │ foo   │
└────────────┴───────┘
```


## toDecimalString {#todecimalstring}

数値を、ユーザーが指定した小数桁数で文字列（String）に変換します。

**構文**

```sql
toDecimalString(number, scale)
```

**引数**

* `number` — 文字列として表現される値。型は [Int, UInt](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Decimal](../data-types/decimal.md)。
* `scale` — 小数部の桁数。[UInt8](../data-types/int-uint.md)。
  * [Decimal](../data-types/decimal.md) および [Int, UInt](../data-types/int-uint.md) 型に対する `scale` の上限は 77（Decimal における有効桁数の最大値）です。
  * [Float](../data-types/float.md) に対する `scale` の上限は 60 です。

**返される値**

* 入力値を、指定された小数部の桁数（scale）で表現した [String](../data-types/string.md) 型の値。
  指定した `scale` が元の数値の小数部の桁数より小さい場合、数値は一般的な算術規則に従って四捨五入されます。

**例**

クエリ:

```sql
SELECT toDecimalString(CAST('64.32', 'Float64'), 5);
```

結果：

```response
┌toDecimalString(CAST('64.32', 'Float64'), 5)─┐
│ 64.32000                                    │
└─────────────────────────────────────────────┘
```


## reinterpretAsUInt8 {#reinterpretasuint8}

入力値を `UInt8` 型の値として扱うことで、バイト単位で再解釈を行います。[`CAST`](#cast) とは異なり、この関数は元の値を保持しようとはしません。ターゲット型が入力値を表現できない場合、出力は意味のない値になります。

**構文**

```sql
reinterpretAsUInt8(x)
```

**パラメータ**

* `x`: バイト列として再解釈し、UInt8 として扱う値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**返される値**

* UInt8 として再解釈された値 `x`。[UInt8](/sql-reference/data-types/int-uint)。

**例**

クエリ:

```sql
SELECT
    toInt8(257) AS x,
    toTypeName(x),
    reinterpretAsUInt8(x) AS res,
    toTypeName(res);
```

結果：

```response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ Int8          │   1 │ UInt8           │
└───┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt16 {#reinterpretasuint16}

入力値を `UInt16` 型の値として扱うことで、バイト表現を再解釈します。[`CAST`](#cast) と異なり、この関数は元の値を保持しようとしません。ターゲット型が入力型を表現できない場合、出力は無意味な値になります。

**構文**

```sql
reinterpretAsUInt16(x)
```

**パラメータ**

* `x`: UInt16 としてバイト列として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

* UInt16 として再解釈された `x` の値。[UInt16](/sql-reference/data-types/int-uint)。

**例**

クエリ:

```sql
SELECT
    toUInt8(257) AS x,
    toTypeName(x),
    reinterpretAsUInt16(x) AS res,
    toTypeName(res);
```

結果：

```response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ UInt8         │   1 │ UInt16          │
└───┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt32 {#reinterpretasuint32}

入力値を `UInt32` 型の値として扱うことで、バイト列を再解釈します。[`CAST`](#cast) とは異なり、この関数は元の値を保持しようとはしません。ターゲット型が入力値を表現できない場合、出力には意味がありません。

**構文**

```sql
reinterpretAsUInt32(x)
```

**パラメータ**

* `x`: UInt32 としてバイトレベルで再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

* UInt32 として再解釈された値 `x`。[UInt32](/sql-reference/data-types/int-uint)。

**例**

クエリ：

```sql
SELECT
    toUInt16(257) AS x,
    toTypeName(x),
    reinterpretAsUInt32(x) AS res,
    toTypeName(res)
```

結果：

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt16        │ 257 │ UInt32          │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt64 {#reinterpretasuint64}

入力値を `UInt64` 型の値として扱い、バイト列レベルで再解釈します。[`CAST`](#cast) と異なり、この関数は元の数値的な意味を保持しようとしません。ターゲット型が入力値を表現できない場合、出力結果には意味がありません。

**構文**

```sql
reinterpretAsUInt64(x)
```

**パラメータ**

* `x`: バイト列として UInt64 に再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

* `x` を UInt64 として再解釈した値。[UInt64](/sql-reference/data-types/int-uint)。

**例**

クエリ：

```sql
SELECT
    toUInt32(257) AS x,
    toTypeName(x),
    reinterpretAsUInt64(x) AS res,
    toTypeName(res)
```

結果：

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt32        │ 257 │ UInt64          │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt128 {#reinterpretasuint128}

入力値を `UInt128` 型の値として扱い、バイト列レベルで再解釈します。[`CAST`](#cast) と異なり、この関数は元の値の意味を保持しようとはしません。対象の型が入力の型を表現できない場合、出力は意味をなさない値になります。

**構文**

```sql
reinterpretAsUInt128(x)
```

**パラメータ**

* `x`: UInt128 としてバイト再解釈する対象の値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**返される値**

* `x` を UInt128 として再解釈した値。[UInt128](/sql-reference/data-types/int-uint)。

**例**

クエリ:

```sql
SELECT
    toUInt64(257) AS x,
    toTypeName(x),
    reinterpretAsUInt128(x) AS res,
    toTypeName(res)
```

結果：

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt64        │ 257 │ UInt128         │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt256 {#reinterpretasuint256}

入力値のバイト列を `UInt256` 型の値として再解釈します。[`CAST`](#cast) と異なり、この関数は元の値を保持しようとしません。対象の型が入力の型を表現できない場合、出力は意味を持たない値になります。

**構文**

```sql
reinterpretAsUInt256(x)
```

**パラメータ**

* `x`: バイト表現を UInt256 として再解釈する対象の値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

* UInt256 として再解釈された `x` の値。[UInt256](/sql-reference/data-types/int-uint)。

**例**

クエリ:

```sql
SELECT
    toUInt128(257) AS x,
    toTypeName(x),
    reinterpretAsUInt256(x) AS res,
    toTypeName(res)
```

結果：

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt128       │ 257 │ UInt256         │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt8 {#reinterpretasint8}

入力値を `Int8` 型の値としてバイトレベルで再解釈します。[`CAST`](#cast) と異なり、この関数は元の値を保持しようとはしません。対象の型で入力値を表現できない場合、出力は意味を持たない値になります。

**構文**

```sql
reinterpretAsInt8(x)
```

**パラメータ**

* `x`: Int8 としてバイトレベルで再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

* 値 `x` を Int8 として再解釈した結果。[Int8](/sql-reference/data-types/int-uint#integer-ranges)。

**例**

クエリ:

```sql
SELECT
    toUInt8(257) AS x,
    toTypeName(x),
    reinterpretAsInt8(x) AS res,
    toTypeName(res);
```

結果：

```response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ UInt8         │   1 │ Int8            │
└───┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt16 {#reinterpretasint16}

入力値を `Int16` 型の値として扱い、バイト列を再解釈します。[`CAST`](#cast) と異なり、この関数は元の値を保持しようとしません。対象の型で入力値を表現できない場合、出力は意味を持たない値になります。

**構文**

```sql
reinterpretAsInt16(x)
```

**パラメータ**

* `x`: バイト列を Int16 として再解釈する対象の値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

* `x` を Int16 として再解釈した値。[Int16](/sql-reference/data-types/int-uint#integer-ranges)。

**例**

クエリ:

```sql
SELECT
    toInt8(257) AS x,
    toTypeName(x),
    reinterpretAsInt16(x) AS res,
    toTypeName(res);
```

結果：

```response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ Int8          │   1 │ Int16           │
└───┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt32 {#reinterpretasint32}

入力値を `Int32` 型の値としてバイト列単位で再解釈します。[`CAST`](#cast) と異なり、この関数は元の値の意味を保持しようとしません。対象の型が入力の型を表現できない場合、結果は意味のない値になります。

**構文**

```sql
reinterpretAsInt32(x)
```

**パラメータ**

* `x`: Int32 としてバイト列レベルで再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md)、または [FixedString](../data-types/fixedstring.md)。

**返り値**

* `x` を Int32 として再解釈した値。[Int32](/sql-reference/data-types/int-uint#integer-ranges)。

**例**

クエリ:

```sql
SELECT
    toInt16(257) AS x,
    toTypeName(x),
    reinterpretAsInt32(x) AS res,
    toTypeName(res);
```

結果：

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int16         │ 257 │ Int32           │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt64 {#reinterpretasint64}

入力値を `Int64` 型の値として解釈することで、バイト列を再解釈します。[`CAST`](#cast) と異なり、この関数は元の値を保持しようとしません。対象の型で入力値を表現できない場合、出力は意味を持たない値になります。

**構文**

```sql
reinterpretAsInt64(x)
```

**パラメータ**

* `x`: Int64 としてバイトレベルで再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

* Int64 として再解釈された値 `x`。[Int64](/sql-reference/data-types/int-uint#integer-ranges)。

**例**

クエリ：

```sql
SELECT
    toInt32(257) AS x,
    toTypeName(x),
    reinterpretAsInt64(x) AS res,
    toTypeName(res);
```

結果：

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int32         │ 257 │ Int64           │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt128 {#reinterpretasint128}

入力値を `Int128` 型の値として扱うことで、バイト列の再解釈を行います。[`CAST`](#cast) 関数とは異なり、この関数は元の値の数値的な意味を保とうとしません。ターゲットの型が入力値を表現できない場合、出力結果には意味がありません。

**構文**

```sql
reinterpretAsInt128(x)
```

**パラメータ**

* `x`: バイト列を Int128 として再解釈する対象の値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

* Int128 として再解釈された `x` の値。[Int128](/sql-reference/data-types/int-uint#integer-ranges)。

**例**

クエリ:

```sql
SELECT
    toInt64(257) AS x,
    toTypeName(x),
    reinterpretAsInt128(x) AS res,
    toTypeName(res);
```

結果:

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int64         │ 257 │ Int128          │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt256 {#reinterpretasint256}

入力値を `Int256` 型の値として扱い、バイト列を再解釈します。[`CAST`](#cast) とは異なり、この関数は元の値を保持しようとはしません。ターゲット型が入力型を表現できない場合、その出力値には意味がありません。

**構文**

```sql
reinterpretAsInt256(x)
```

**パラメータ**

* `x`: Int256 としてバイト列を再解釈する対象の値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**返される値**

* Int256 として再解釈された値 `x`。[Int256](/sql-reference/data-types/int-uint#integer-ranges)。

**例**

クエリ:

```sql
SELECT
    toInt128(257) AS x,
    toTypeName(x),
    reinterpretAsInt256(x) AS res,
    toTypeName(res);
```

結果:

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int128        │ 257 │ Int256          │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsFloat32 {#reinterpretasfloat32}

入力値を `Float32` 型の値として扱うことで、バイト列を再解釈します。[`CAST`](#cast) と異なり、この関数は元の値を保持しようとしません。ターゲット型が入力の値を表現できない場合、出力は意味を持たない値になります。

**構文**

```sql
reinterpretAsFloat32(x)
```

**パラメータ**

* `x`: Float32 型として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

* 値 `x` を Float32 型として再解釈した値。[Float32](../data-types/float.md)。

**例**

クエリ:

```sql
SELECT reinterpretAsUInt32(toFloat32(0.2)) AS x, reinterpretAsFloat32(x);
```

結果:

```response
┌──────────x─┬─reinterpretAsFloat32(x)─┐
│ 1045220557 │                     0.2 │
└────────────┴─────────────────────────┘
```


## reinterpretAsFloat64 {#reinterpretasfloat64}

入力値を `Float64` 型の値として扱うことで、バイト表現の再解釈を行います。[`CAST`](#cast) と異なり、この関数は元の数値を保持しようとはしません。ターゲット型で入力値を表現できない場合、出力される値は意味を成さないものになります。

**構文**

```sql
reinterpretAsFloat64(x)
```

**パラメータ**

* `x`: Float64 型として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

* 値 `x` を Float64 型として再解釈したもの。[Float64](../data-types/float.md)。

**例**

クエリ:

```sql
SELECT reinterpretAsUInt64(toFloat64(0.2)) AS x, reinterpretAsFloat64(x);
```

結果:

```response
┌───────────────────x─┬─reinterpretAsFloat64(x)─┐
│ 4596373779694328218 │                     0.2 │
└─────────────────────┴─────────────────────────┘
```


## reinterpretAsDate {#reinterpretasdate}

文字列、固定長文字列、または数値を受け取り、そのバイト列をホストのバイトオーダー（リトルエンディアン）として数値に解釈します。解釈された数値を Unix エポックの開始からの経過日数として扱い、その日数に対応する日付を返します。

**構文**

```sql
reinterpretAsDate(x)
```

**パラメータ**

* `x`: Unixエポックの開始からの経過日数。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**返り値**

* 日付。[Date](../data-types/date.md)。

**実装の詳細**

:::note
指定された文字列の長さが不足している場合、この関数は、その文字列に必要な数のヌルバイトがパディングされているかのように動作します。文字列が必要以上に長い場合、余分なバイトは無視されます。
:::

**例**

クエリ:

```sql
SELECT reinterpretAsDate(65), reinterpretAsDate('A');
```

結果：

```response
┌─reinterpretAsDate(65)─┬─reinterpretAsDate('A')─┐
│            1970-03-07 │             1970-03-07 │
└───────────────────────┴────────────────────────┘
```


## reinterpretAsDateTime {#reinterpretasdatetime}

これらの関数は文字列を受け取り、その先頭にあるバイト列をホストのバイトオーダー（リトルエンディアン）の数値として解釈します。Unix エポックの開始時刻からの経過秒数として解釈し、その値に対応する日時を返します。

**構文**

```sql
reinterpretAsDateTime(x)
```

**パラメータ**

* `x`: Unix Epoch の開始からの経過秒数。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

* 日付と時刻。[DateTime](../data-types/datetime.md)。

**実装の詳細**

:::note
指定された文字列が十分な長さでない場合、この関数は文字列が必要な数のヌルバイトで埋められているものとして動作します。文字列が必要以上に長い場合、余分なバイトは無視されます。
:::

**例**

クエリ:

```sql
SELECT reinterpretAsDateTime(65), reinterpretAsDateTime('A');
```

結果：

```response
┌─reinterpretAsDateTime(65)─┬─reinterpretAsDateTime('A')─┐
│       1970-01-01 01:01:05 │        1970-01-01 01:01:05 │
└───────────────────────────┴────────────────────────────┘
```


## reinterpretAsString {#reinterpretasstring}

この関数は、数値、日付、または日時を受け取り、対応する値をホストのバイト順序（リトルエンディアン）で表現するバイト列を含む文字列を返します。末尾のヌルバイトは削除されます。たとえば、UInt32 型の値 255 は、1 バイトの長さの文字列になります。

**構文**

```sql
reinterpretAsString(x)
```

**パラメータ**

* `x`: 文字列として再解釈する値。型は [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)。

**返される値**

* `x` を表すバイト列からなる文字列。[String](../data-types/fixedstring.md)。

**例**

クエリ:

```sql
SELECT
    reinterpretAsString(toDateTime('1970-01-01 01:01:05')),
    reinterpretAsString(toDate('1970-03-07'));
```

結果：

```response
┌─reinterpretAsString(toDateTime('1970-01-01 01:01:05'))─┬─reinterpretAsString(toDate('1970-03-07'))─┐
│ A                                                      │ A                                         │
└────────────────────────────────────────────────────────┴───────────────────────────────────────────┘
```


## reinterpretAsFixedString {#reinterpretasfixedstring}

この関数は数値、日付、または日時を受け取り、対応する値をホストオーダー（リトルエンディアン）で表すバイト列を含む `FixedString` を返します。末尾のヌルバイトは削除されます。例えば、`UInt32` 型で値が `255` の場合、長さ 1 バイトの `FixedString` になります。

**構文**

```sql
reinterpretAsFixedString(x)
```

**パラメータ**

* `x`: 文字列として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)。

**戻り値**

* `x` を表すバイト列を格納した固定長文字列。[FixedString](../data-types/fixedstring.md)。

**例**

クエリ：

```sql
SELECT
    reinterpretAsFixedString(toDateTime('1970-01-01 01:01:05')),
    reinterpretAsFixedString(toDate('1970-03-07'));
```

結果:

```response
┌─reinterpretAsFixedString(toDateTime('1970-01-01 01:01:05'))─┬─reinterpretAsFixedString(toDate('1970-03-07'))─┐
│ A                                                           │ A                                              │
└─────────────────────────────────────────────────────────────┴────────────────────────────────────────────────┘
```


## reinterpretAsUUID {#reinterpretasuuid}

:::note
ここで挙げた UUID 関数に加えて、専用の [UUID 関数に関するドキュメント](../functions/uuid-functions.md)もあります。
:::

16 バイトの文字列を受け取り、8 バイトずつの 2 つの部分をリトルエンディアンのバイト順で解釈して UUID を返します。文字列の長さが十分でない場合、この関数は文字列の末尾に必要な数のヌルバイトが詰められたかのように動作します。文字列が 16 バイトより長い場合、末尾の余分なバイトは無視されます。

**構文**

```sql
reinterpretAsUUID(fixed_string)
```

**引数**

* `fixed_string` — ビッグエンディアンのバイト列。[FixedString](/sql-reference/data-types/fixedstring)。

**戻り値**

* UUID 型の値。[UUID](/sql-reference/data-types/uuid)。

**例**

文字列から UUID への変換。

クエリ：

```sql
SELECT reinterpretAsUUID(reverse(unhex('000102030405060708090a0b0c0d0e0f')));
```

結果:

```response
┌─reinterpretAsUUID(reverse(unhex('000102030405060708090a0b0c0d0e0f')))─┐
│                                  08090a0b-0c0d-0e0f-0001-020304050607 │
└───────────────────────────────────────────────────────────────────────┘
```

String 型と UUID 型を相互に変換します。

クエリ:

```sql
WITH
    generateUUIDv4() AS uuid,
    identity(lower(hex(reverse(reinterpretAsString(uuid))))) AS str,
    reinterpretAsUUID(reverse(unhex(str))) AS uuid2
SELECT uuid = uuid2;
```

結果:

```response
┌─equals(uuid, uuid2)─┐
│                   1 │
└─────────────────────┘
```


## reinterpret {#reinterpret}

`x` の値に対応するメモリ上のバイト列をそのまま利用して、宛先の型として再解釈します。

**構文**

```sql
reinterpret(x, type)
```

**引数**

* `x` — 任意の型。
* `type` — 変換先の型。配列の場合は、配列要素の型が固定長型である必要があります。

**戻り値**

* 変換先の型の値。

**例**

クエリ:

```sql
SELECT reinterpret(toInt8(-1), 'UInt8') AS int_to_uint,
    reinterpret(toInt8(1), 'Float32') AS int_to_float,
    reinterpret('1', 'UInt32') AS string_to_int;
```

結果：

```text
┌─int_to_uint─┬─int_to_float─┬─string_to_int─┐
│         255 │        1e-45 │            49 │
└─────────────┴──────────────┴───────────────┘
```

クエリ：

```sql
SELECT reinterpret(x'3108b4403108d4403108b4403108d440', 'Array(Float32)') AS string_to_array_of_Float32;
```

結果：

```text
┌─string_to_array_of_Float32─┐
│ [5.626,6.626,5.626,6.626]  │
└────────────────────────────┘
```


## CAST {#cast}

入力値を指定したデータ型に変換します。[reinterpret](#reinterpret) 関数とは異なり、`CAST` は新しいデータ型を使って同じ値を表現しようとします。変換できない場合は例外がスローされます。
いくつかの構文バリエーションがサポートされています。

**構文**

```sql
CAST(x, T)
CAST(x AS t)
x::t
```

**引数**

* `x` — 変換する値。任意の型を取ります。
* `T` — 変換先データ型の名前。[String](../data-types/string.md)。
* `t` — 変換先データ型。

**戻り値**

* 変換された値。

:::note
入力値が変換先の型の範囲に収まらない場合、結果はオーバーフローします。たとえば、`CAST(-1, 'UInt8')` は `255` を返します。
:::

**例**

クエリ:

```sql
SELECT
    CAST(toInt8(-1), 'UInt8') AS cast_int_to_uint,
    CAST(1.5 AS Decimal(3,2)) AS cast_float_to_decimal,
    '1'::Int32 AS cast_string_to_int;
```

結果：

```yaml
┌─cast_int_to_uint─┬─cast_float_to_decimal─┬─cast_string_to_int─┐
│              255 │                  1.50 │                  1 │
└──────────────────┴───────────────────────┴────────────────────┘
```

クエリ：

```sql
SELECT
    '2016-06-15 23:00:00' AS timestamp,
    CAST(timestamp AS DateTime) AS datetime,
    CAST(timestamp AS Date) AS date,
    CAST(timestamp, 'String') AS string,
    CAST(timestamp, 'FixedString(22)') AS fixed_string;
```

結果：

```response
┌─timestamp───────────┬────────────datetime─┬───────date─┬─string──────────────┬─fixed_string──────────────┐
│ 2016-06-15 23:00:00 │ 2016-06-15 23:00:00 │ 2016-06-15 │ 2016-06-15 23:00:00 │ 2016-06-15 23:00:00\0\0\0 │
└─────────────────────┴─────────────────────┴────────────┴─────────────────────┴───────────────────────────┘
```

[FixedString (N)](../data-types/fixedstring.md) への変換は、引数の型が [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md) の場合にのみ有効です。

[Nullable](../data-types/nullable.md) への型変換およびその逆方向の変換がサポートされています。

**例**

クエリ:

```sql
SELECT toTypeName(x) FROM t_null;
```

結果：

```response
┌─toTypeName(x)─┐
│ Int8          │
│ Int8          │
└───────────────┘
```

クエリ：

```sql
SELECT toTypeName(CAST(x, 'Nullable(UInt16)')) FROM t_null;
```

結果：

```response
┌─toTypeName(CAST(x, 'Nullable(UInt16)'))─┐
│ Nullable(UInt16)                        │
│ Nullable(UInt16)                        │
└─────────────────────────────────────────┘
```

**関連項目**

* [cast&#95;keep&#95;nullable](../../operations/settings/settings.md/#cast_keep_nullable) 設定


## accurateCast(x, T) {#accuratecastx-t}

`x` をデータ型 `T` に変換します。

[cast](#cast) との違いは、値 `x` が型 `T` の範囲に収まらない場合、キャスト時の数値型のオーバーフローを `accurateCast` は許可しない点です。例えば、`accurateCast(-1, 'UInt8')` は例外をスローします。

**例**

クエリ:

```sql
SELECT cast(-1, 'UInt8') AS uint8;
```

結果：

```response
┌─uint8─┐
│   255 │
└───────┘
```

クエリ：

```sql
SELECT accurateCast(-1, 'UInt8') AS uint8;
```

結果：

```response
Code: 70. DB::Exception: Received from localhost:9000. DB::Exception: Value in column Int8 cannot be safely converted into type UInt8: While processing accurateCast(-1, 'UInt8') AS uint8.
```


## accurateCastOrNull(x, T) {#accuratecastornullx-t}

入力値 `x` を指定されたデータ型 `T` に変換します。常に [Nullable](../data-types/nullable.md) 型を返し、キャスト結果が変換先の型で表現できない場合は [NULL](/sql-reference/syntax#null) を返します。

**構文**

```sql
accurateCastOrNull(x, T)
```

**引数**

* `x` — 入力値。
* `T` — 返されるデータ型の名前。

**戻り値**

* 指定されたデータ型 `T` に変換された値。

**例**

クエリ:

```sql
SELECT toTypeName(accurateCastOrNull(5, 'UInt8'));
```

結果:

```response
┌─toTypeName(accurateCastOrNull(5, 'UInt8'))─┐
│ Nullable(UInt8)                            │
└────────────────────────────────────────────┘
```

クエリ：

```sql
SELECT
    accurateCastOrNull(-1, 'UInt8') AS uint8,
    accurateCastOrNull(128, 'Int8') AS int8,
    accurateCastOrNull('Test', 'FixedString(2)') AS fixed_string;
```

結果:

```response
┌─uint8─┬─int8─┬─fixed_string─┐
│  ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ         │
└───────┴──────┴──────────────┘
```


## accurateCastOrDefault(x, T[, default&#95;value]) {#accuratecastordefaultx-t-default_value}

入力値 `x` を指定されたデータ型 `T` に変換します。キャスト結果が対象の型で表現できない場合は、型のデフォルト値、または指定されていれば `default_value` を返します。

**構文**

```sql
accurateCastOrDefault(x, T)
```

**引数**

* `x` — 入力値。
* `T` — 戻り値のデータ型名。
* `default_value` — 戻り値のデータ型におけるデフォルト値。

**戻り値**

* 指定されたデータ型 `T` に変換された値。

**例**

クエリ:

```sql
SELECT toTypeName(accurateCastOrDefault(5, 'UInt8'));
```

結果：

```response
┌─toTypeName(accurateCastOrDefault(5, 'UInt8'))─┐
│ UInt8                                         │
└───────────────────────────────────────────────┘
```

クエリ：

```sql
SELECT
    accurateCastOrDefault(-1, 'UInt8') AS uint8,
    accurateCastOrDefault(-1, 'UInt8', 5) AS uint8_default,
    accurateCastOrDefault(128, 'Int8') AS int8,
    accurateCastOrDefault(128, 'Int8', 5) AS int8_default,
    accurateCastOrDefault('Test', 'FixedString(2)') AS fixed_string,
    accurateCastOrDefault('Test', 'FixedString(2)', 'Te') AS fixed_string_default;
```

結果:

```response
┌─uint8─┬─uint8_default─┬─int8─┬─int8_default─┬─fixed_string─┬─fixed_string_default─┐
│     0 │             5 │    0 │            5 │              │ Te                   │
└───────┴───────────────┴──────┴──────────────┴──────────────┴──────────────────────┘
```


## toInterval {#toInterval}

数値とインターバル単位（例: &#39;second&#39; や &#39;day&#39;）から、[Interval](../../sql-reference/data-types/special-data-types/interval.md) データ型の値を作成します。

**構文**

```sql
toInterval(value, unit)
```

**引数**

* `value` — インターバルの長さ。整数値またはその文字列表現、または浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

* `unit` — 作成するインターバルの種類。[String Literal](/sql-reference/syntax#string)。
  指定可能な値:

  * `nanosecond`
  * `microsecond`
  * `millisecond`
  * `second`
  * `minute`
  * `hour`
  * `day`
  * `week`
  * `month`
  * `quarter`
  * `year`

  `unit` 引数は大文字・小文字を区別しません。

**戻り値**

* 結果のインターバル。[Interval](../../sql-reference/data-types/special-data-types/interval.md)

**例**

```sql
SELECT toDateTime('2025-01-01 00:00:00') + toInterval(1, 'hour')
```

```response
┌─toDateTime('2025-01-01 00:00:00') + toInterval(1, 'hour') ─┐
│                                        2025-01-01 01:00:00 │
└────────────────────────────────────────────────────────────┘
```


## toIntervalYear {#tointervalyear}

`n` 年を表す [IntervalYear](../data-types/special-data-types/interval.md) 型の期間を返します。

**構文**

```sql
toIntervalYear(n)
```

**引数**

* `n` — 年数。整数値、その文字列表現、または浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**戻り値**

* `n` 年のインターバル。[IntervalYear](../data-types/special-data-types/interval.md)。

**例**

クエリ:

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalYear(1) AS interval_to_year
SELECT date + interval_to_year AS result
```

結果：

```response
┌─────result─┐
│ 2025-06-15 │
└────────────┘
```


## toIntervalQuarter {#tointervalquarter}

データ型 [IntervalQuarter](../data-types/special-data-types/interval.md) の `n` 四半期を表す時間間隔を返します。

**構文**

```sql
toIntervalQuarter(n)
```

**引数**

* `n` — 四半期数。整数値またはその文字列表現、または浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**戻り値**

* `n` 四半期分の間隔。[IntervalQuarter](../data-types/special-data-types/interval.md)。

**例**

クエリ:

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalQuarter(1) AS interval_to_quarter
SELECT date + interval_to_quarter AS result
```

結果：

```response
┌─────result─┐
│ 2024-09-15 │
└────────────┘
```


## toIntervalMonth {#tointervalmonth}

`n` か月を表すデータ型 [IntervalMonth](../data-types/special-data-types/interval.md) のインターバルを返します。

**構文**

```sql
toIntervalMonth(n)
```

**引数**

* `n` — 月数。整数値、その文字列表現、または浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**戻り値**

* `n` か月の間隔を表す値。[IntervalMonth](../data-types/special-data-types/interval.md)。

**例**

クエリ:

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalMonth(1) AS interval_to_month
SELECT date + interval_to_month AS result
```

結果：

```response
┌─────result─┐
│ 2024-07-15 │
└────────────┘
```


## toIntervalWeek {#tointervalweek}

データ型 [IntervalWeek](../data-types/special-data-types/interval.md) の `n` 週間の時間間隔を返します。

**構文**

```sql
toIntervalWeek(n)
```

**引数**

* `n` — 週数。整数値またはその文字列表現、または浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**戻り値**

* `n` 週の間隔。[IntervalWeek](../data-types/special-data-types/interval.md)。

**例**

クエリ：

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalWeek(1) AS interval_to_week
SELECT date + interval_to_week AS result
```

結果：

```response
┌─────result─┐
│ 2024-06-22 │
└────────────┘
```


## toIntervalDay {#tointervalday}

`n` 日の間隔を [IntervalDay](../data-types/special-data-types/interval.md) 型の値として返します。

**構文**

```sql
toIntervalDay(n)
```

**引数**

* `n` — 日数。整数値またはその文字列表現、および浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**戻り値**

* `n` 日間のインターバル。[IntervalDay](../data-types/special-data-types/interval.md)。

**例**

クエリ：

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalDay(5) AS interval_to_days
SELECT date + interval_to_days AS result
```

結果：

```response
┌─────result─┐
│ 2024-06-20 │
└────────────┘
```


## toIntervalHour {#tointervalhour}

データ型 [IntervalHour](../data-types/special-data-types/interval.md) の `n` 時間を表す時間間隔を返します。

**構文**

```sql
toIntervalHour(n)
```

**引数**

* `n` — 時間数。整数値またはその文字列表現、または浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**戻り値**

* `n` 時間の間隔。[IntervalHour](../data-types/special-data-types/interval.md)。

**例**

クエリ:

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalHour(12) AS interval_to_hours
SELECT date + interval_to_hours AS result
```

結果：

```response
┌──────────────result─┐
│ 2024-06-15 12:00:00 │
└─────────────────────┘
```


## toIntervalMinute {#tointervalminute}

データ型 [IntervalMinute](../data-types/special-data-types/interval.md) の `n` 分を表す間隔を返します。

**構文**

```sql
toIntervalMinute(n)
```

**引数**

* `n` — 分を表す数値。整数値またはその文字列表現、および浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返り値**

* `n` 分の時間間隔。[IntervalMinute](../data-types/special-data-types/interval.md)。

**例**

クエリ:

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalMinute(12) AS interval_to_minutes
SELECT date + interval_to_minutes AS result
```

結果:

```response
┌──────────────result─┐
│ 2024-06-15 00:12:00 │
└─────────────────────┘
```


## toIntervalSecond {#tointervalsecond}

データ型 [IntervalSecond](../data-types/special-data-types/interval.md) の `n` 秒の時間間隔を返します。

**構文**

```sql
toIntervalSecond(n)
```

**引数**

* `n` — 秒数。整数値またはその文字列表現、または浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**戻り値**

* `n` 秒の間隔。[IntervalSecond](../data-types/special-data-types/interval.md)。

**例**

クエリ:

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalSecond(30) AS interval_to_seconds
SELECT date + interval_to_seconds AS result
```

結果：

```response
┌──────────────result─┐
│ 2024-06-15 00:00:30 │
└─────────────────────┘
```


## toIntervalMillisecond {#tointervalmillisecond}

`n` ミリ秒を表すデータ型 [IntervalMillisecond](../data-types/special-data-types/interval.md) の時間間隔を返します。

**構文**

```sql
toIntervalMillisecond(n)
```

**引数**

* `n` — ミリ秒数。整数値またはその文字列表現、および浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**戻り値**

* `n` ミリ秒の間隔。[IntervalMilliseconds](../data-types/special-data-types/interval.md)。

**例**

クエリ:

```sql
WITH
    toDateTime('2024-06-15') AS date,
    toIntervalMillisecond(30) AS interval_to_milliseconds
SELECT date + interval_to_milliseconds AS result
```

結果：

```response
┌──────────────────result─┐
│ 2024-06-15 00:00:00.030 │
└─────────────────────────┘
```


## toIntervalMicrosecond {#tointervalmicrosecond}

`n` マイクロ秒の時間間隔を、データ型 [IntervalMicrosecond](../data-types/special-data-types/interval.md) として返します。

**構文**

```sql
toIntervalMicrosecond(n)
```

**引数**

* `n` — マイクロ秒数。整数値またはその文字列表現、および浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

* `n` マイクロ秒の Interval。[IntervalMicrosecond](../data-types/special-data-types/interval.md)。

**例**

クエリ:

```sql
WITH
    toDateTime('2024-06-15') AS date,
    toIntervalMicrosecond(30) AS interval_to_microseconds
SELECT date + interval_to_microseconds AS result
```

結果:

```response
┌─────────────────────result─┐
│ 2024-06-15 00:00:00.000030 │
└────────────────────────────┘
```


## toIntervalNanosecond {#tointervalnanosecond}

`n` ナノ秒の間隔を表す値を、データ型 [IntervalNanosecond](../data-types/special-data-types/interval.md) として返します。

**構文**

```sql
toIntervalNanosecond(n)
```

**引数**

* `n` — ナノ秒の数。整数値またはその文字列表現、あるいは浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**戻り値**

* `n` ナノ秒の時間間隔。[IntervalNanosecond](../data-types/special-data-types/interval.md)。

**例**

クエリ:

```sql
WITH
    toDateTime('2024-06-15') AS date,
    toIntervalNanosecond(30) AS interval_to_nanoseconds
SELECT date + interval_to_nanoseconds AS result
```

結果:

```response
┌────────────────────────result─┐
│ 2024-06-15 00:00:00.000000030 │
└───────────────────────────────┘
```


## parseDateTime {#parsedatetime}

[MySQL フォーマット文字列](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format) に従って、[String](../data-types/string.md) を [DateTime](../data-types/datetime.md) に変換します。

この関数は、[formatDateTime](/sql-reference/functions/date-time-functions#formatDateTime) の逆の処理を行います。

**構文**

```sql
parseDateTime(str[, format[, timezone]])
```

**引数**

* `str` — 解析対象の文字列
* `format` — フォーマット文字列。省略可能。指定されていない場合は `%Y-%m-%d %H:%i:%s`。
* `timezone` — [Timezone](operations/server-configuration-parameters/settings.md#timezone)。省略可能。

**戻り値**

MySQL 形式のフォーマット文字列に従って、入力文字列を解析した [DateTime](../data-types/datetime.md) 値を返します。

**サポートされているフォーマット指定子**

[formatDateTime](/sql-reference/functions/date-time-functions#formatDateTime) に列挙されているすべてのフォーマット指定子（ただし以下を除く）:

* %Q: 四半期 (1-4)

**例**

```sql
SELECT parseDateTime('2021-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')

┌─parseDateTime('2021-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')─┐
│                                       2021-01-04 23:00:00 │
└───────────────────────────────────────────────────────────┘
```

エイリアス: `TO_TIMESTAMP`。


## parseDateTimeOrZero {#parsedatetimeorzero}

処理できない日付形式があった場合にゼロの日付を返す点を除き、[parseDateTime](#parsedatetime) と同じです。

## parseDateTimeOrNull {#parsedatetimeornull}

[parseDateTime](#parsedatetime) と同様ですが、処理できない日付形式が含まれていた場合は `NULL` を返します。

別名（エイリアス）: `str_to_date`。

## parseDateTimeInJodaSyntax {#parsedatetimeinjodasyntax}

[parseDateTime](#parsedatetime) と類似していますが、フォーマット文字列には MySQL 構文ではなく [Joda](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html) 構文を使用します。

この関数は、関数 [formatDateTimeInJodaSyntax](/sql-reference/functions/date-time-functions#formatDateTimeInJodaSyntax) の逆の処理を行います。

**構文**

```sql
parseDateTimeInJodaSyntax(str[, format[, timezone]])
```

**引数**

* `str` — パース対象の String
* `format` — フォーマット文字列。省略可能。指定されていない場合は `yyyy-MM-dd HH:mm:ss` が使用されます。
* `timezone` — [Timezone](operations/server-configuration-parameters/settings.md#timezone)。省略可能。

**返される値**

Joda 形式のフォーマット文字列に従って入力文字列をパースした [DateTime](../data-types/datetime.md) 値を返します。

**サポートされているフォーマット指定子**

[`formatDateTimeInJodaSyntax`](/sql-reference/functions/date-time-functions#formatDateTimeInJodaSyntax) に列挙されているすべてのフォーマット指定子がサポートされます。ただし、次のものは除きます:

* S: 秒の小数部
* z: タイムゾーン
* Z: タイムゾーンのオフセット/ID

**例**

```sql
SELECT parseDateTimeInJodaSyntax('2023-02-24 14:53:31', 'yyyy-MM-dd HH:mm:ss', 'Europe/Minsk')

┌─parseDateTimeInJodaSyntax('2023-02-24 14:53:31', 'yyyy-MM-dd HH:mm:ss', 'Europe/Minsk')─┐
│                                                                     2023-02-24 14:53:31 │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```


## parseDateTimeInJodaSyntaxOrZero {#parsedatetimeinjodasyntaxorzero}

[parseDateTimeInJodaSyntax](#parsedatetimeinjodasyntax) と同様ですが、処理できない日付フォーマットを受け取った場合は、ゼロの日時を返します。

## parseDateTimeInJodaSyntaxOrNull {#parsedatetimeinjodasyntaxornull}

[parseDateTimeInJodaSyntax](#parsedatetimeinjodasyntax) と同様ですが、処理できない日付フォーマットを検出した場合は `NULL` を返します。

## parseDateTime64 {#parsedatetime64}

[MySQL のフォーマット文字列](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format) に従って、[String](../data-types/string.md) を [DateTime64](../data-types/datetime64.md) に変換します。

**構文**

```sql
parseDateTime64(str[, format[, timezone]])
```

**引数**

* `str` — 解析対象の String 型の値。
* `format` — フォーマット文字列。省略可能。指定されていない場合は `%Y-%m-%d %H:%i:%s.%f`。
* `timezone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。省略可能。

**返される値**

MySQL 形式のフォーマット文字列に従って入力文字列を解析し、[DateTime64](../data-types/datetime64.md) の値を返します。
返される値の精度は 6 桁です。


## parseDateTime64OrZero {#parsedatetime64orzero}

日付形式を処理できなかった場合にゼロ日付を返す点を除き、[parseDateTime64](#parsedatetime64) と同様です。

## parseDateTime64OrNull {#parsedatetime64ornull}

[parseDateTime64](#parsedatetime64) と同様ですが、解釈できない日付形式を検出した場合は `NULL` を返します。

## parseDateTime64InJodaSyntax {#parsedatetime64injodasyntax}

[String](../data-types/string.md) 型の値を、[Joda 形式のフォーマット文字列](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html)に基づいて [DateTime64](../data-types/datetime64.md) 型に変換します。

**構文**

```sql
parseDateTime64InJodaSyntax(str[, format[, timezone]])
```

**引数**

* `str` — 解析する文字列。
* `format` — フォーマット文字列。省略可能。指定しない場合は `yyyy-MM-dd HH:mm:ss`。
* `timezone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。省略可能。

**返される値**

Joda スタイルのフォーマット文字列に従って入力文字列を解析した [DateTime64](../data-types/datetime64.md) 値を返します。
返される値の精度は、フォーマット文字列内の `S` プレースホルダーの数に等しくなります（最大 6 まで）。


## parseDateTime64InJodaSyntaxOrZero {#parsedatetime64injodasyntaxorzero}

解釈できない日付形式に遭遇した場合にゼロ日付を返す点を除き、[parseDateTime64InJodaSyntax](#parsedatetime64injodasyntax) と同じです。

## parseDateTime64InJodaSyntaxOrNull {#parsedatetime64injodasyntaxornull}

[parseDateTime64InJodaSyntax](#parsedatetime64injodasyntax) と同様ですが、処理できない日付形式が指定された場合は `NULL` を返します。

## parseDateTimeBestEffort {#parsedatetimebesteffort}

## parseDateTime32BestEffort {#parsedatetime32besteffort}

[String](../data-types/string.md) 形式で表現された日付と時刻を [DateTime](/sql-reference/data-types/datetime) データ型に変換します。

この関数は、[ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)、[RFC 1123 - 5.2.14 RFC-822 Date and Time Specification](https://tools.ietf.org/html/rfc1123#page-55)、ClickHouse の形式およびその他のいくつかの日付と時刻のフォーマットを解析します。

**構文**

```sql
parseDateTimeBestEffort(time_string [, time_zone])
```

**引数**

* `time_string` — 変換対象の日付と時刻を含む文字列。[String](../data-types/string.md)。
* `time_zone` — タイムゾーン。この関数は `time_string` をこのタイムゾーンに従ってパースします。[String](../data-types/string.md)。

**サポートされる非標準形式**

* 9〜10 桁の [unix timestamp](https://en.wikipedia.org/wiki/Unix_time) を含む文字列。
* 日付と時刻コンポーネントを含む文字列：`YYYYMMDDhhmmss`, `DD/MM/YYYY hh:mm:ss`, `DD-MM-YY hh:mm`, `YYYY-MM-DD hh:mm:ss` など。
* 日付を含むが時刻コンポーネントを含まない文字列：`YYYY`, `YYYYMM`, `YYYY*MM`, `DD/MM/YYYY`, `DD-MM-YY` など。
* 日と時刻を含む文字列：`DD`, `DD hh`, `DD hh:mm`。この場合、`MM` は `01` に置き換えられます。
* タイムゾーンオフセット情報を含む日付と時刻の文字列：`YYYY-MM-DD hh:mm:ss ±h:mm` など。例：`2020-12-12 17:36:00 -5:00`。
* [syslog timestamp](https://datatracker.ietf.org/doc/html/rfc3164#section-4.1.2)：`Mmm dd hh:mm:ss`。例：`Jun  9 14:20:32`。

区切り文字を含むすべての形式に対して、この関数は月名をフルスペル、または月名の先頭 3 文字で指定されたものとしてパースします。例：`24/DEC/18`, `24-Dec-18`, `01-September-2018`。
年が指定されていない場合は、現在の年と見なされます。結果として得られる DateTime が未来の時刻（現在時刻から 1 秒でも先）になる場合は、その現在の年は前年に置き換えられます。

**返される値**

* [DateTime](../data-types/datetime.md) データ型に変換された `time_string`。

**使用例**

クエリ:

```sql
SELECT parseDateTimeBestEffort('23/10/2020 12:12:57')
AS parseDateTimeBestEffort;
```

結果:

```response
┌─parseDateTimeBestEffort─┐
│     2020-10-23 12:12:57 │
└─────────────────────────┘
```

クエリ：

```sql
SELECT parseDateTimeBestEffort('Sat, 18 Aug 2018 07:22:16 GMT', 'Asia/Istanbul')
AS parseDateTimeBestEffort;
```

結果:

```response
┌─parseDateTimeBestEffort─┐
│     2018-08-18 10:22:16 │
└─────────────────────────┘
```

クエリ：

```sql
SELECT parseDateTimeBestEffort('1284101485')
AS parseDateTimeBestEffort;
```

結果：

```response
┌─parseDateTimeBestEffort─┐
│     2015-07-07 12:04:41 │
└─────────────────────────┘
```

クエリ：

```sql
SELECT parseDateTimeBestEffort('2018-10-23 10:12:12')
AS parseDateTimeBestEffort;
```

結果：

```response
┌─parseDateTimeBestEffort─┐
│     2018-10-23 10:12:12 │
└─────────────────────────┘
```

クエリ：

```sql
SELECT toYear(now()) AS year, parseDateTimeBestEffort('10 20:19');
```

結果：

```response
┌─year─┬─parseDateTimeBestEffort('10 20:19')─┐
│ 2023 │                 2023-01-10 20:19:00 │
└──────┴─────────────────────────────────────┘
```

クエリ：


```sql
WITH
    now() AS ts_now,
    formatDateTime(ts_around, '%b %e %T') AS syslog_arg
SELECT
    ts_now,
    syslog_arg,
    parseDateTimeBestEffort(syslog_arg)
FROM (SELECT arrayJoin([ts_now - 30, ts_now + 30]) AS ts_around);
```

結果:

```response
┌──────────────ts_now─┬─syslog_arg──────┬─parseDateTimeBestEffort(syslog_arg)─┐
│ 2023-06-30 23:59:30 │ Jun 30 23:59:00 │                 2023-06-30 23:59:00 │
│ 2023-06-30 23:59:30 │ Jul  1 00:00:00 │                 2022-07-01 00:00:00 │
└─────────────────────┴─────────────────┴─────────────────────────────────────┘
```

**関連項目**

* [RFC 1123](https://datatracker.ietf.org/doc/html/rfc1123)
* [toDate](#todate)
* [toDateTime](#todatetime)
* [@xkcd による ISO 8601 の告知](https://xkcd.com/1179/)
* [RFC 3164](https://datatracker.ietf.org/doc/html/rfc3164#section-4.1.2)


## parseDateTimeBestEffortUS {#parsedatetimebesteffortus}

この関数は、ISO 日付形式（例: `YYYY-MM-DD hh:mm:ss`）および月と日付の要素をあいまいさなく抽出できるその他の日付形式（例: `YYYYMMDDhhmmss`、`YYYY-MM`、`DD hh`、`YYYY-MM-DD hh:mm:ss ±h:mm`）に対しては、[parseDateTimeBestEffort](#parsedatetimebesteffort) と同様に動作します。月と日付の要素をあいまいさなく抽出できない場合、たとえば `MM/DD/YYYY`、`MM-DD-YYYY`、`MM-DD-YY` のような形式では、`DD/MM/YYYY`、`DD-MM-YYYY`、`DD-MM-YY` ではなく、米国式の日付形式を優先します。ただし例外として、月が 12 より大きく 31 以下の場合には、この関数は [parseDateTimeBestEffort](#parsedatetimebesteffort) の動作にフォールバックします。たとえば `15/08/2020` は `2020-08-15` として解釈されます。

## parseDateTimeBestEffortOrNull {#parsedatetimebesteffortornull}

## parseDateTime32BestEffortOrNull {#parsedatetime32besteffortornull}

[parseDateTimeBestEffort](#parsedatetimebesteffort) と同様に動作しますが、処理できない日付形式に遭遇した場合は `NULL` を返します。

## parseDateTimeBestEffortOrZero {#parsedatetimebesteffortorzero}

## parseDateTime32BestEffortOrZero {#parsedatetime32besteffortorzero}

[parseDateTimeBestEffort](#parsedatetimebesteffort) と同様ですが、処理できない日付フォーマットを検出した場合は、ゼロ日付またはゼロ日時を返します。

## parseDateTimeBestEffortUSOrNull {#parsedatetimebesteffortusornull}

[parseDateTimeBestEffortUS](#parsedatetimebesteffortus) 関数と同様ですが、処理できない日付形式に遭遇した場合は `NULL` を返します。

## parseDateTimeBestEffortUSOrZero {#parsedatetimebesteffortusorzero}

[parseDateTimeBestEffortUS](#parsedatetimebesteffortus) 関数と同様ですが、解釈できない日付形式を検出した場合には、ゼロ日付（`1970-01-01`）または時刻付きのゼロ日付（`1970-01-01 00:00:00`）を返します。

## parseDateTime64BestEffort {#parsedatetime64besteffort}

[parseDateTimeBestEffort](#parsedatetimebesteffort) 関数と同様ですが、ミリ秒およびマイクロ秒もパースし、[DateTime](/sql-reference/data-types/datetime) 型の値を返します。

**構文**

```sql
parseDateTime64BestEffort(time_string [, precision [, time_zone]])
```

**引数**

* `time_string` — 変換対象の日付、または日時を含む文字列。[String](../data-types/string.md)。
* `precision` — 必要な精度。`3` — ミリ秒、`6` — マイクロ秒。デフォルトは `3`。省略可能。[UInt8](../data-types/int-uint.md)。
* `time_zone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。関数はこのタイムゾーンに従って `time_string` を解釈します。省略可能。[String](../data-types/string.md)。

**戻り値**

* [DateTime](../data-types/datetime.md) データ型に変換された `time_string`。

**例**

クエリ:

```sql
SELECT parseDateTime64BestEffort('2021-01-01') AS a, toTypeName(a) AS t
UNION ALL
SELECT parseDateTime64BestEffort('2021-01-01 01:01:00.12346') AS a, toTypeName(a) AS t
UNION ALL
SELECT parseDateTime64BestEffort('2021-01-01 01:01:00.12346',6) AS a, toTypeName(a) AS t
UNION ALL
SELECT parseDateTime64BestEffort('2021-01-01 01:01:00.12346',3,'Asia/Istanbul') AS a, toTypeName(a) AS t
FORMAT PrettyCompactMonoBlock;
```

結果:

```sql
┌──────────────────────────a─┬─t──────────────────────────────┐
│ 2021-01-01 01:01:00.123000 │ DateTime64(3)                  │
│ 2021-01-01 00:00:00.000000 │ DateTime64(3)                  │
│ 2021-01-01 01:01:00.123460 │ DateTime64(6)                  │
│ 2020-12-31 22:01:00.123000 │ DateTime64(3, 'Asia/Istanbul') │
└────────────────────────────┴────────────────────────────────┘
```


## parseDateTime64BestEffortUS {#parsedatetime64besteffortus}

[parseDateTime64BestEffort](#parsedatetime64besteffort) と同様ですが、あいまいさがある場合には、米国式の日付フォーマット（`MM/DD/YYYY` など）を優先して解釈します。

## parseDateTime64BestEffortOrNull {#parsedatetime64besteffortornull}

[parseDateTime64BestEffort](#parsedatetime64besteffort) と同様ですが、処理できない日付形式が入力された場合は `NULL` を返します。

## parseDateTime64BestEffortOrZero {#parsedatetime64besteffortorzero}

[parseDateTime64BestEffort](#parsedatetime64besteffort) と同様ですが、処理できない形式の日付に遭遇した場合は、ゼロ日付またはゼロ日時を返します。

## parseDateTime64BestEffortUSOrNull {#parsedatetime64besteffortusornull}

[parseDateTime64BestEffort](#parsedatetime64besteffort) と同様ですが、あいまいな場合には US の日付形式（`MM/DD/YYYY` など）を優先し、解釈できない日付形式に対しては `NULL` を返します。

## parseDateTime64BestEffortUSOrZero {#parsedatetime64besteffortusorzero}

[parseDateTime64BestEffort](#parsedatetime64besteffort) と同様ですが、あいまいな場合には US の日付フォーマット（`MM/DD/YYYY` など）を優先し、処理できない日付フォーマットを検出した場合はゼロ日付またはゼロ日時を返します。

## toLowCardinality {#tolowcardinality}

入力引数を、同じデータ型の [LowCardinality](../data-types/lowcardinality.md) 版に変換します。

`LowCardinality` データ型からデータを変換するには、[CAST](#cast) 関数を使用します。たとえば、`CAST(x as String)` のように指定します。

**構文**

```sql
toLowCardinality(expr)
```

**引数**

* `expr` — 結果として[サポートされているデータ型](/sql-reference/data-types)のいずれかを返す[式](/sql-reference/syntax#expressions)。

**戻り値**

* `expr` の結果。`expr` の型に対する [LowCardinality](../data-types/lowcardinality.md)。

**例**

クエリ:

```sql
SELECT toLowCardinality('1');
```

結果:

```response
┌─toLowCardinality('1')─┐
│ 1                     │
└───────────────────────┘
```


## toUnixTimestamp {#toUnixTimestamp}

`String`、`Date`、または `DateTime` を、`1970-01-01 00:00:00 UTC` からの経過秒数を表す Unix タイムスタンプの `UInt32` 値に変換します。

**構文**

```sql
toUnixTimestamp(date, [timezone])
```

**引数**

* `date`: 変換する値。[`Date`](/sql-reference/data-types/date) または [`Date32`](/sql-reference/data-types/date32) または [`DateTime`](/sql-reference/data-types/datetime) または [`DateTime64`](/sql-reference/data-types/datetime64) または [`String`](/sql-reference/data-types/string)。
* `timezone`: オプション。変換に使用するタイムゾーン。指定しない場合はサーバーのタイムゾーンが使用されます。[`String`](/sql-reference/data-types/string)

**戻り値**

Unix タイムスタンプを返します。[`UInt32`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title="Query"
SELECT
'2017-11-05 08:07:47' AS dt_str,
toUnixTimestamp(dt_str) AS from_str,
toUnixTimestamp(dt_str, 'Asia/Tokyo') AS from_str_tokyo,
toUnixTimestamp(toDateTime(dt_str)) AS from_datetime,
toUnixTimestamp(toDateTime64(dt_str, 0)) AS from_datetime64,
toUnixTimestamp(toDate(dt_str)) AS from_date,
toUnixTimestamp(toDate32(dt_str)) AS from_date32
FORMAT Vertical;
```

```response title="Response"
Row 1:
──────
dt_str:          2017-11-05 08:07:47
from_str:        1509869267
from_str_tokyo:  1509836867
from_datetime:   1509869267
from_datetime64: 1509869267
from_date:       1509840000
from_date32:     1509840000
```


## toUnixTimestamp64Second {#tounixtimestamp64second}

`DateTime64` を秒単位の固定精度を持つ `Int64` 値に変換します。入力値は、その精度に応じて適切に拡大または縮小されます。

:::note
出力値は `DateTime64` のタイムゾーンではなく、UTC のタイムスタンプです。
:::

**構文**

```sql
toUnixTimestamp64Second(value)
```

**引数**

* `value` — 任意の精度の DateTime64 値。[DateTime64](../data-types/datetime64.md)。

**戻り値**

* `value` を `Int64` データ型に変換した値。[Int64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
WITH toDateTime64('2009-02-13 23:31:31.011', 3, 'UTC') AS dt64
SELECT toUnixTimestamp64Second(dt64);
```

結果：

```response
┌─toUnixTimestamp64Second(dt64)─┐
│                    1234567891 │
└───────────────────────────────┘
```


## toUnixTimestamp64Milli {#tounixtimestamp64milli}

`DateTime64` を固定のミリ秒精度を持つ `Int64` 型の値に変換します。入力値は、その精度に応じて適切にスケールアップまたはスケールダウンされます。

:::note
出力値は `DateTime64` のタイムゾーンではなく、UTC のタイムスタンプです。
:::

**構文**

```sql
toUnixTimestamp64Milli(value)
```

**引数**

* `value` — 任意の精度の DateTime64 値。[DateTime64](../data-types/datetime64.md)。

**戻り値**

* `value` を `Int64` データ型に変換した値。[Int64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
WITH toDateTime64('2009-02-13 23:31:31.011', 3, 'UTC') AS dt64
SELECT toUnixTimestamp64Milli(dt64);
```

結果：

```response
┌─toUnixTimestamp64Milli(dt64)─┐
│                1234567891011 │
└──────────────────────────────┘
```


## toUnixTimestamp64Micro {#tounixtimestamp64micro}

`DateTime64` をマイクロ秒精度を持つ `Int64` の値に変換します。入力値は、その精度に応じて適切にスケーリング（拡大または縮小）されます。

:::note
出力値は `DateTime64` のタイムゾーンではなく、UTC のタイムスタンプです。
:::

**構文**

```sql
toUnixTimestamp64Micro(value)
```

**引数**

* `value` — 任意の精度を持つ DateTime64 型の値。[DateTime64](../data-types/datetime64.md)。

**戻り値**

* `value` を `Int64` データ型に変換した値。[Int64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
WITH toDateTime64('1970-01-15 06:56:07.891011', 6, 'UTC') AS dt64
SELECT toUnixTimestamp64Micro(dt64);
```

結果：

```response
┌─toUnixTimestamp64Micro(dt64)─┐
│                1234567891011 │
└──────────────────────────────┘
```


## toUnixTimestamp64Nano {#tounixtimestamp64nano}

`DateTime64` をナノ秒精度の固定小数表現を持つ `Int64` 値に変換します。入力値は、その小数精度に応じて適切にスケーリングされます。

:::note
出力値は `DateTime64` のタイムゾーンではなく、UTC のタイムスタンプです。
:::

**構文**

```sql
toUnixTimestamp64Nano(value)
```

**引数**

* `value` — 任意の精度を持つ DateTime64 型の値。[DateTime64](../data-types/datetime64.md)。

**戻り値**

* `value` を `Int64` 型に変換した値。[Int64](../data-types/int-uint.md)。

**例**

クエリ：

```sql
WITH toDateTime64('1970-01-01 00:20:34.567891011', 9, 'UTC') AS dt64
SELECT toUnixTimestamp64Nano(dt64);
```

結果:

```response
┌─toUnixTimestamp64Nano(dt64)─┐
│               1234567891011 │
└─────────────────────────────┘
```


## fromUnixTimestamp64Second {#fromunixtimestamp64second}

`Int64` を秒精度固定の `DateTime64` 値に変換し、任意でタイムゾーンを指定できます。入力値は、その元の精度に応じて適切にスケールアップまたはスケールダウンされます。

:::note
入力値は、指定された（または暗黙の）タイムゾーンでのタイムスタンプではなく、UTC タイムスタンプとして解釈されることに注意してください。
:::

**構文**

```sql
fromUnixTimestamp64Second(value[, timezone])
```

**引数**

* `value` — 任意の精度の値。[Int64](../data-types/int-uint.md)。
* `timezone` — （オプション）結果に使用するタイムゾーン名。[String](../data-types/string.md)。

**返り値**

* `value` を精度 `0` の DateTime64 に変換した値。[DateTime64](../data-types/datetime64.md)。

**例**

クエリ:

```sql
WITH CAST(1733935988, 'Int64') AS i64
SELECT
    fromUnixTimestamp64Second(i64, 'UTC') AS x,
    toTypeName(x);
```

結果：

```response
┌───────────────────x─┬─toTypeName(x)────────┐
│ 2024-12-11 16:53:08 │ DateTime64(0, 'UTC') │
└─────────────────────┴──────────────────────┘
```


## fromUnixTimestamp64Milli {#fromunixtimestamp64milli}

`Int64` を、固定のミリ秒精度と任意指定のタイムゾーンを持つ `DateTime64` 値に変換します。入力値は、その持つ精度に応じて適切にスケールアップまたはスケールダウンされます。

:::note
入力値は、指定された（または暗黙の）タイムゾーンでのタイムスタンプではなく、UTC のタイムスタンプとして扱われることに注意してください。
:::

**構文**

```sql
fromUnixTimestamp64Milli(value[, timezone])
```

**引数**

* `value` — 任意精度の値。 [Int64](../data-types/int-uint.md)。
* `timezone` — （オプション）結果のタイムゾーン名。 [String](../data-types/string.md)。

**返される値**

* 精度 `3` の DateTime64 に変換された `value`。 [DateTime64](../data-types/datetime64.md)。

**例**

クエリ：

```sql
WITH CAST(1733935988123, 'Int64') AS i64
SELECT
    fromUnixTimestamp64Milli(i64, 'UTC') AS x,
    toTypeName(x);
```

結果:

```response
┌───────────────────────x─┬─toTypeName(x)────────┐
│ 2024-12-11 16:53:08.123 │ DateTime64(3, 'UTC') │
└─────────────────────────┴──────────────────────┘
```


## fromUnixTimestamp64Micro {#fromunixtimestamp64micro}

`Int64` を、固定のマイクロ秒精度と任意のタイムゾーンを持つ `DateTime64` 値に変換します。入力値は、その精度に応じて適切にスケールアップまたはスケールダウンされます。

:::note
入力値は、明示的（または暗黙的）に指定されたタイムゾーンでのタイムスタンプではなく、UTC のタイムスタンプとして扱われる点に注意してください。
:::

**構文**

```sql
fromUnixTimestamp64Micro(value[, timezone])
```

**引数**

* `value` — 任意精度の値。 [Int64](../data-types/int-uint.md)。
* `timezone` — （オプション）結果のタイムゾーン名。 [String](../data-types/string.md)。

**返り値**

* 精度 `6` の DateTime64 型の値に変換された `value`。 [DateTime64](../data-types/datetime64.md)。

**例**

クエリ:

```sql
WITH CAST(1733935988123456, 'Int64') AS i64
SELECT
    fromUnixTimestamp64Micro(i64, 'UTC') AS x,
    toTypeName(x);
```

結果：

```response
┌──────────────────────────x─┬─toTypeName(x)────────┐
│ 2024-12-11 16:53:08.123456 │ DateTime64(6, 'UTC') │
└────────────────────────────┴──────────────────────┘
```


## fromUnixTimestamp64Nano {#fromunixtimestamp64nano}

`Int64` を、ナノ秒単位の固定精度と任意のタイムゾーンを持つ `DateTime64` 値に変換します。入力値は、その精度に応じて適切にスケーリング（拡大または縮小）されます。

:::note
入力値は、指定された（または暗黙の）タイムゾーンでのタイムスタンプではなく、UTC タイムスタンプとして扱われる点に注意してください。
:::

**構文**

```sql
fromUnixTimestamp64Nano(value[, timezone])
```

**引数**

* `value` — 任意の精度の値。 [Int64](../data-types/int-uint.md)。
* `timezone` — （省略可）結果のタイムゾーン名。 [String](../data-types/string.md)。

**返される値**

* `value` を精度 `9` の DateTime64 に変換した値。 [DateTime64](../data-types/datetime64.md)。

**例**

クエリ:

```sql
WITH CAST(1733935988123456789, 'Int64') AS i64
SELECT
    fromUnixTimestamp64Nano(i64, 'UTC') AS x,
    toTypeName(x);
```

結果：

```response
┌─────────────────────────────x─┬─toTypeName(x)────────┐
│ 2024-12-11 16:53:08.123456789 │ DateTime64(9, 'UTC') │
└───────────────────────────────┴──────────────────────┘
```


## formatRow {#formatrow}

任意の式を、指定された形式で文字列に変換します。

**構文**

```sql
formatRow(format, x, y, ...)
```

**引数**

* `format` — テキスト形式。例: [CSV](/interfaces/formats/CSV)、[TabSeparated (TSV)](/interfaces/formats/TabSeparated)。
* `x`,`y`, ... — 式。

**戻り値**

* 書式化された文字列。（テキスト形式の場合、通常は末尾に改行文字が付きます）。

**例**

クエリ:

```sql
SELECT formatRow('CSV', number, 'good')
FROM numbers(3);
```

結果:

```response
┌─formatRow('CSV', number, 'good')─┐
│ 0,"good"
                         │
│ 1,"good"
                         │
│ 2,"good"
                         │
└──────────────────────────────────┘
```

**注記**: format に接頭辞/接尾辞が含まれている場合、それは各行に出力されます。

**例**

クエリ：

```sql
SELECT formatRow('CustomSeparated', number, 'good')
FROM numbers(3)
SETTINGS format_custom_result_before_delimiter='<prefix>\n', format_custom_result_after_delimiter='<suffix>'
```

結果:

```response
┌─formatRow('CustomSeparated', number, 'good')─┐
│ <prefix>
0    good
<suffix>                   │
│ <prefix>
1    good
<suffix>                   │
│ <prefix>
2    good
<suffix>                   │
└──────────────────────────────────────────────┘
```

注記: この関数でサポートされるのは、行ベースの形式のみです。


## formatRowNoNewline {#formatrownonewline}

任意の式を、指定されたフォーマットを用いて文字列に変換します。`formatRow` と異なり、この関数は末尾に `\n` がある場合はそれを削除します。

**構文**

```sql
formatRowNoNewline(format, x, y, ...)
```

**引数**

* `format` — テキスト形式。例: [CSV](/interfaces/formats/CSV)、[TabSeparated (TSV)](/interfaces/formats/TabSeparated)。
* `x`,`y`, ... — 式。

**戻り値**

* フォーマット済み文字列。

**例**

クエリ:

```sql
SELECT formatRowNoNewline('CSV', number, 'good')
FROM numbers(3);
```

結果:

```response
┌─formatRowNoNewline('CSV', number, 'good')─┐
│ 0,"good"                                  │
│ 1,"good"                                  │
│ 2,"good"                                  │
└───────────────────────────────────────────┘
```

{/* 
  以下のタグ内の内容は、ドキュメントフレームワークのビルド時に
  system.functions から自動生成されたドキュメントで置き換えられます。タグを変更または削除しないでください。
  詳細は https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md を参照してください。
  */ }

{/*AUTOGENERATED_START*/ }


## CAST {#CAST}

導入バージョン: v1.1

値を指定したデータ型に変換します。
`reinterpret` 関数とは異なり、CAST はターゲット型で同じ値を表現しようとします。
それが不可能な場合は、例外が送出されます。

**構文**

```sql
CAST(x, T)
or CAST(x AS T)
or x::T
```

**引数**

* `x` — 任意の型の値。[`Any`](/sql-reference/data-types)
* `T` — 変換先のデータ型。[`String`](/sql-reference/data-types/string)

**戻り値**

指定したデータ型に変換された値を返します。[`Any`](/sql-reference/data-types)

**例**

**基本的な使用方法**

```sql title=Query
SELECT CAST(42, 'String')
```

```response title=Response
┌─CAST(42, 'String')─┐
│ 42                 │
└────────────────────┘
```

**AS 句の使用**

```sql title=Query
SELECT CAST('2025-01-01' AS Date)
```

```response title=Response
┌─CAST('2025-01-01', 'Date')─┐
│                 2025-01-01 │
└────────────────────────────┘
```

**「::」構文の使用**

```sql title=Query
SELECT '123'::UInt32
```

```response title=Response
┌─CAST('123', 'UInt32')─┐
│                   123 │
└───────────────────────┘
```


## accurateCast {#accurateCast}

導入バージョン: v1.1

値を指定されたデータ型に変換します。[`CAST`](#CAST) と異なり、`accurateCast` はより厳密な型チェックを行い、変換によって精度の損失が発生する場合や、変換が不可能な場合には例外をスローします。

この関数は、精度の損失や無効な変換を防ぐため、通常の `CAST` よりも安全です。

**構文**

```sql
accurateCast(x, T)
```

**引数**

* `x` — 変換する値。[`Any`](/sql-reference/data-types)
* `T` — 変換先のデータ型名。[`String`](/sql-reference/data-types/string)

**返り値**

変換先のデータ型に変換された値を返します。[`Any`](/sql-reference/data-types)

**例**

**成功した変換**

```sql title=Query
SELECT accurateCast(42, 'UInt16')
```

```response title=Response
┌─accurateCast(42, 'UInt16')─┐
│                        42 │
└───────────────────────────┘
```

**文字列から数値への変換**

```sql title=Query
SELECT accurateCast('123.45', 'Float64')
```

```response title=Response
┌─accurateCast('123.45', 'Float64')─┐
│                            123.45 │
└───────────────────────────────────┘
```


## accurateCastOrDefault {#accurateCastOrDefault}

導入バージョン: v21.1

値を指定されたデータ型に変換します。
[`accurateCast`](#accurateCast) と同様ですが、変換を正確に行えない場合は、例外をスローする代わりにデフォルト値を返します。

第 2 引数としてデフォルト値を指定する場合、その値は変換先の型である必要があります。
デフォルト値を指定しない場合は、変換先の型のデフォルト値が使用されます。

**構文**

```sql
accurateCastOrDefault(x, T[, default_value])
```

**引数**

* `x` — 変換する値。[`Any`](/sql-reference/data-types)
* `T` — 変換先のデータ型名。[`const String`](/sql-reference/data-types/string)
* `default_value` — オプション。変換に失敗した場合に返されるデフォルト値。[`Any`](/sql-reference/data-types)

**戻り値**

変換先のデータ型に変換された値、または変換が不可能な場合はデフォルト値を返します。[`Any`](/sql-reference/data-types)

**使用例**

**正常に変換できる場合**

```sql title=Query
SELECT accurateCastOrDefault(42, 'String')
```

```response title=Response
┌─accurateCastOrDefault(42, 'String')─┐
│ 42                                  │
└─────────────────────────────────────┘
```

**明示的なデフォルト指定時の変換失敗**

```sql title=Query
SELECT accurateCastOrDefault('abc', 'UInt32', 999::UInt32)
```

```response title=Response
┌─accurateCastOrDefault('abc', 'UInt32', 999)─┐
│                                         999 │
└─────────────────────────────────────────────┘
```

**暗黙のデフォルト値を伴う変換失敗**

```sql title=Query
SELECT accurateCastOrDefault('abc', 'UInt32')
```

```response title=Response
┌─accurateCastOrDefault('abc', 'UInt32')─┐
│                                      0 │
└────────────────────────────────────────┘
```


## accurateCastOrNull {#accurateCastOrNull}

導入バージョン: v1.1

値を指定したデータ型に変換します。
[`accurateCast`](#accurateCast) と同様ですが、変換を正確に実行できない場合に、例外をスローする代わりに `NULL` を返します。

この関数は、[`accurateCast`](#accurateCast) の安全性と、より扱いやすいエラー処理を兼ね備えています。

**構文**

```sql
accurateCastOrNull(x, T)
```

**引数**

* `x` — 変換対象の値。[`Any`](/sql-reference/data-types)
* `T` — 変換先データ型の名前。[`String`](/sql-reference/data-types/string)

**返される値**

変換先のデータ型に変換された値、または変換できない場合は `NULL` が返されます。[`Any`](/sql-reference/data-types)

**例**

**変換が成功する例**

```sql title=Query
SELECT accurateCastOrNull(42, 'String')
```

```response title=Response
┌─accurateCastOrNull(42, 'String')─┐
│ 42                               │
└──────────────────────────────────┘
```

**変換に失敗すると NULL を返す**

```sql title=Query
SELECT accurateCastOrNull('abc', 'UInt32')
```

```response title=Response
┌─accurateCastOrNull('abc', 'UInt32')─┐
│                                ᴺᵁᴸᴸ │
└─────────────────────────────────────┘
```


## formatRow {#formatRow}

導入: v20.7

任意の式を、指定されたフォーマットで文字列に変換します。

:::note
フォーマットにサフィックスやプレフィックスが含まれている場合、それらは各行ごとに出力されます。
この関数では、行ベースのフォーマットのみがサポートされています。
:::

**構文**

```sql
formatRow(format, x, y, ...)
```

**引数**

* `format` — テキスト形式。例えば CSV、TSV など。[`String`](/sql-reference/data-types/string)
* `x, y, ...` — 式。[`Any`](/sql-reference/data-types)

**返り値**

フォーマット済みの文字列（テキスト形式の場合は通常、改行文字で終端されます）。[`String`](/sql-reference/data-types/string)

**例**

**基本的な使用方法**

```sql title=Query
SELECT formatRow('CSV', number, 'good')
FROM numbers(3)
```

```response title=Response
┌─formatRow('CSV', number, 'good')─┐
│ 0,"good"
                         │
│ 1,"good"
                         │
│ 2,"good"
                         │
└──────────────────────────────────┘
```

**カスタムフォーマットを使用**

```sql title=Query
SELECT formatRow('CustomSeparated', number, 'good')
FROM numbers(3)
SETTINGS format_custom_result_before_delimiter='<prefix>\n', format_custom_result_after_delimiter='<suffix>'
```

```response title=Response
┌─formatRow('CustomSeparated', number, 'good')─┐
│ <prefix>
0    good
<suffix>                   │
│ <prefix>
1    good
<suffix>                   │
│ <prefix>
2    good
<suffix>                   │
└──────────────────────────────────────────────┘
```


## formatRowNoNewline {#formatRowNoNewline}

導入バージョン: v20.7

[`formatRow`](#formatRow) と同じですが、各行の改行文字を取り除きます。

任意の式を指定されたフォーマットで文字列に変換しますが、結果の末尾に含まれる改行文字はすべて削除します。

**構文**

```sql
formatRowNoNewline(format, x, y, ...)
```

**引数**

* `format` — テキストフォーマット。例: CSV、TSV。[`String`](/sql-reference/data-types/string)
* `x, y, ...` — 式。[`Any`](/sql-reference/data-types)

**返される値**

改行を削除したフォーマットされた文字列を返します。[`String`](/sql-reference/data-types/string)

**例**

**基本的な使い方**

```sql title=Query
SELECT formatRowNoNewline('CSV', number, 'good')
FROM numbers(3)
```

```response title=Response
┌─formatRowNoNewline('CSV', number, 'good')─┐
│ 0,"good"                                  │
│ 1,"good"                                  │
│ 2,"good"                                  │
└───────────────────────────────────────────┘
```


## fromUnixTimestamp64Micro {#fromUnixTimestamp64Micro}

導入バージョン: v20.5

マイクロ秒単位の Unix タイムスタンプを、マイクロ秒精度の `DateTime64` 値に変換します。

入力値は、1970-01-01 00:00:00 UTC からの経過時間をマイクロ秒で表した Unix タイムスタンプとして扱われます。

**構文**

```sql
fromUnixTimestamp64Micro(value[, timezone])
```

**引数**

* `value` — マイクロ秒単位の Unix タイムスタンプ。[`Int64`](/sql-reference/data-types/int-uint)
* `timezone` — 省略可能。返される値のタイムゾーン。[`String`](/sql-reference/data-types/string)

**返される値**

マイクロ秒精度の `DateTime64` 値を返します。[`DateTime64(6)`](/sql-reference/data-types/datetime64)

**例**

**使用例**

```sql title=Query
SELECT fromUnixTimestamp64Micro(1640995200123456)
```

```response title=Response
┌─fromUnixTimestamp64Micro(1640995200123456)─┐
│                 2022-01-01 00:00:00.123456 │
└────────────────────────────────────────────┘
```


## fromUnixTimestamp64Milli {#fromUnixTimestamp64Milli}

導入バージョン: v20.5

ミリ秒単位の Unix タイムスタンプを、ミリ秒精度の `DateTime64` 型の値に変換します。

入力値は、ミリ秒精度の Unix タイムスタンプ（1970-01-01 00:00:00 UTC からのミリ秒数）として扱われます。

**構文**

```sql
fromUnixTimestamp64Milli(value[, timezone])
```

**引数**

* `value` — ミリ秒単位の Unix タイムスタンプ値。[`Int64`](/sql-reference/data-types/int-uint)
* `timezone` — 省略可。返される値のタイムゾーンを指定する文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

ミリ秒精度の `DateTime64` 型の値。[`DateTime64(3)`](/sql-reference/data-types/datetime64)

**例**

**使用例**

```sql title=Query
SELECT fromUnixTimestamp64Milli(1640995200123)
```

```response title=Response
┌─fromUnixTimestamp64Milli(1640995200123)─┐
│                 2022-01-01 00:00:00.123 │
└─────────────────────────────────────────┘
```


## fromUnixTimestamp64Nano {#fromUnixTimestamp64Nano}

導入バージョン: v20.5

ナノ秒単位の Unix タイムスタンプを、ナノ秒精度を持つ [`DateTime64`](/sql-reference/data-types/datetime64) 値に変換します。

入力値は、1970-01-01 00:00:00 UTC からの経過ナノ秒数としての Unix タイムスタンプとして扱われます。

:::note
入力値はタイムゾーンを考慮せず、UTC タイムスタンプとして扱われる点に注意してください。
:::

**構文**

```sql
fromUnixTimestamp64Nano(value[, timezone])
```

**引数**

* `value` — ナノ秒単位の Unix タイムスタンプ。[`Int64`](/sql-reference/data-types/int-uint)
* `timezone` — 省略可能。返される値のタイムゾーンを指定します。[`String`](/sql-reference/data-types/string)

**返り値**

ナノ秒精度の `DateTime64` 値を返します。[`DateTime64(9)`](/sql-reference/data-types/datetime64)

**例**

**使用例**

```sql title=Query
SELECT fromUnixTimestamp64Nano(1640995200123456789)
```

```response title=Response
┌─fromUnixTimestamp64Nano(1640995200123456789)─┐
│                2022-01-01 00:00:00.123456789 │
└──────────────────────────────────────────────┘
```


## fromUnixTimestamp64Second {#fromUnixTimestamp64Second}

導入バージョン: v24.12

秒単位の Unix タイムスタンプを、秒精度の `DateTime64` 値に変換します。

入力値は、秒精度（1970-01-01 00:00:00 UTC からの経過秒数）の Unix タイムスタンプとして解釈されます。

**構文**

```sql
fromUnixTimestamp64Second(value[, timezone])
```

**引数**

* `value` — 秒単位の UNIX タイムスタンプ。[`Int64`](/sql-reference/data-types/int-uint)
* `timezone` — 省略可能。返される値のタイムゾーンを指定します。[`String`](/sql-reference/data-types/string)

**戻り値**

秒精度の `DateTime64` 型の値を返します。[`DateTime64(0)`](/sql-reference/data-types/datetime64)

**例**

**使用例**

```sql title=Query
SELECT fromUnixTimestamp64Second(1640995200)
```

```response title=Response
┌─fromUnixTimestamp64Second(1640995200)─┐
│                   2022-01-01 00:00:00 │
└───────────────────────────────────────┘
```


## parseDateTime {#parseDateTime}

導入バージョン: v23.3

MySQL の日付フォーマット文字列に従って、日時文字列を解析します。

この関数は [`formatDateTime`](/sql-reference/functions/date-time-functions) の逆の動作をします。
フォーマットを表す String を使用して、引数の String を解析します。戻り値は DateTime 型です。

**構文**

```sql
parseDateTime(time_string, format[, timezone])
```

**別名**: `TO_UNIXTIME`

**引数**

* `time_string` — `DateTime` として解釈される文字列。[`String`](/sql-reference/data-types/string)
* `format` — `time_string` の解釈方法を指定するフォーマット文字列。[`String`](/sql-reference/data-types/string)
* `timezone` — 省略可。タイムゾーン。[`String`](/sql-reference/data-types/string)

**戻り値**

MySQL 形式のフォーマット文字列に従って、入力文字列から解釈された `DateTime` を返します。[`DateTime`](/sql-reference/data-types/datetime)

**例**

**使用例**

```sql title=Query
SELECT parseDateTime('2025-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')
```

```response title=Response
┌─parseDateTime('2025-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')─┐
│                                       2025-01-04 23:00:00 │
└───────────────────────────────────────────────────────────┘
```


## parseDateTime32BestEffort {#parseDateTime32BestEffort}

導入バージョン: v20.9

日付と時刻の文字列表現を、[`DateTime`](/sql-reference/data-types/datetime) データ型に変換します。

この関数は、[ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)、[RFC 1123 - 5.2.14 RFC-822 Date and Time Specification](https://tools.ietf.org/html/rfc1123#page-55)、ClickHouse 独自の形式およびそのほかのいくつかの日付と時刻の形式を解析します。

**構文**

```sql
parseDateTime32BestEffort(time_string[, time_zone])
```

**引数**

* `time_string` — 変換対象の日時を含む文字列。[`String`](/sql-reference/data-types/string)
* `time_zone` — 省略可。`time_string` の解析に使用するタイムゾーン。[`String`](/sql-reference/data-types/string)

**返り値**

`time_string` を `DateTime` として返します。[`DateTime`](/sql-reference/data-types/datetime)

**例**

**使用例**

```sql title=Query
SELECT parseDateTime32BestEffort('23/10/2025 12:12:57')
AS parseDateTime32BestEffort
```

```response title=Response
┌─parseDateTime32BestEffort─┐
│       2025-10-23 12:12:57 │
└───────────────────────────┘
```

**タイムゾーンあり**

```sql title=Query
SELECT parseDateTime32BestEffort('Sat, 18 Aug 2025 07:22:16 GMT', 'Asia/Istanbul')
AS parseDateTime32BestEffort
```

```response title=Response
┌─parseDateTime32BestEffort─┐
│       2025-08-18 10:22:16 │
└───────────────────────────┘
```

**Unixタイムスタンプ**

```sql title=Query
SELECT parseDateTime32BestEffort('1284101485')
AS parseDateTime32BestEffort
```

```response title=Response
┌─parseDateTime32BestEffort─┐
│       2015-07-07 12:04:41 │
└───────────────────────────┘
```


## parseDateTime32BestEffortOrNull {#parseDateTime32BestEffortOrNull}

導入バージョン: v20.9

[`parseDateTime32BestEffort`](#parseDateTime32BestEffort) と同様ですが、処理できない日付形式に遭遇した場合は `NULL` を返します。

**構文**

```sql
parseDateTime32BestEffortOrNull(time_string[, time_zone])
```

**引数**

* `time_string` — 変換対象の日付と時刻を含む文字列。[`String`](/sql-reference/data-types/string)
* `time_zone` — 省略可能。`time_string` をパースする際に使用するタイムゾーン。[`String`](/sql-reference/data-types/string)

**返り値**

文字列をパースして得られた `DateTime` オブジェクトを返し、パースに失敗した場合は `NULL` を返します。[`DateTime`](/sql-reference/data-types/datetime)

**例**

**使用例**

```sql title=Query
SELECT
    parseDateTime32BestEffortOrNull('23/10/2025 12:12:57') AS valid,
    parseDateTime32BestEffortOrNull('invalid date') AS invalid
```

```response title=Response
┌─valid───────────────┬─invalid─┐
│ 2025-10-23 12:12:57 │    ᴺᵁᴸᴸ │
└─────────────────────┴─────────┘
```


## parseDateTime32BestEffortOrZero {#parseDateTime32BestEffortOrZero}

導入バージョン: v20.9

[`parseDateTime32BestEffort`](#parseDateTime32BestEffort) と同様ですが、解釈できない日付形式に遭遇した場合は、ゼロ日付またはゼロの日時値を返します。

**構文**

```sql
parseDateTime32BestEffortOrZero(time_string[, time_zone])
```

**引数**

* `time_string` — 変換する日時を表す文字列。[`String`](/sql-reference/data-types/string)
* `time_zone` — 任意。`time_string` の解析に使用するタイムゾーン。[`String`](/sql-reference/data-types/string)

**返される値**

文字列から解析された `DateTime` オブジェクト、または解析に失敗した場合はゼロ日時（`1970-01-01 00:00:00`）を返します。[`DateTime`](/sql-reference/data-types/datetime)

**例**

**使用例**

```sql title=Query
SELECT
    parseDateTime32BestEffortOrZero('23/10/2025 12:12:57') AS valid,
    parseDateTime32BestEffortOrZero('invalid date') AS invalid
```

```response title=Response
┌─valid───────────────┬─invalid─────────────┐
│ 2025-10-23 12:12:57 │ 1970-01-01 00:00:00 │
└─────────────────────┴─────────────────────┘
```


## parseDateTime64BestEffort {#parseDateTime64BestEffort}

導入バージョン: v20.1

[`parseDateTimeBestEffort`](#parsedatetimebesteffort) 関数と同様ですが、ミリ秒およびマイクロ秒も解析し、[`DateTime64`](../../sql-reference/data-types/datetime64.md) データ型を返します。

**構文**

```sql
parseDateTime64BestEffort(time_string[, precision[, time_zone]])
```

**引数**

* `time_string` — 変換対象の日付、または日時を含む文字列。[`String`](/sql-reference/data-types/string)
* `precision` — 任意。要求される精度。ミリ秒の場合は `3`、マイクロ秒の場合は `6` を指定します。デフォルトは `3` です。[`UInt8`](/sql-reference/data-types/int-uint)
* `time_zone` — 任意。タイムゾーン。この関数は `time_string` をこのタイムゾーンとして解釈して解析します。[`String`](/sql-reference/data-types/string)

**戻り値**

`time_string` を [`DateTime64`](../../sql-reference/data-types/datetime64.md) データ型に変換して返します。[`DateTime64`](/sql-reference/data-types/datetime64)

**例**

**使用例**

```sql title=Query
SELECT parseDateTime64BestEffort('2025-01-01') AS a, toTypeName(a) AS t
UNION ALL
SELECT parseDateTime64BestEffort('2025-01-01 01:01:00.12346') AS a, toTypeName(a) AS t
UNION ALL
SELECT parseDateTime64BestEffort('2025-01-01 01:01:00.12346',6) AS a, toTypeName(a) AS t
UNION ALL
SELECT parseDateTime64BestEffort('2025-01-01 01:01:00.12346',3,'Asia/Istanbul') AS a, toTypeName(a) AS t
FORMAT PrettyCompactMonoBlock
```

```response title=Response
┌──────────────────────────a─┬─t──────────────────────────────┐
│ 2025-01-01 01:01:00.123000 │ DateTime64(3)                  │
│ 2025-01-01 00:00:00.000000 │ DateTime64(3)                  │
│ 2025-01-01 01:01:00.123460 │ DateTime64(6)                  │
│ 2025-12-31 22:01:00.123000 │ DateTime64(3, 'Asia/Istanbul') │
└────────────────────────────┴────────────────────────────────┘
```


## parseDateTime64BestEffortOrNull {#parseDateTime64BestEffortOrNull}

導入バージョン: v20.1

[`parseDateTime64BestEffort`](#parsedatetime64besteffort) と同様の動作をしますが、処理できない日付形式に遭遇した場合は `NULL` を返します。

**構文**

```sql
parseDateTime64BestEffortOrNull(time_string[, precision[, time_zone]])
```

**引数**

* `time_string` — 変換対象の日付、または日時を含む文字列。[`String`](/sql-reference/data-types/string)
* `precision` — 省略可能。指定する精度。ミリ秒の場合は `3`、マイクロ秒の場合は `6`。デフォルト: `3`。[`UInt8`](/sql-reference/data-types/int-uint)
* `time_zone` — 省略可能。タイムゾーン。この関数は `time_string` をこのタイムゾーンとして解釈してパースします。[`String`](/sql-reference/data-types/string)

**戻り値**

`time_string` を [`DateTime64`](../../sql-reference/data-types/datetime64.md) に変換して返します。入力をパースできない場合は `NULL` を返します。[`DateTime64`](/sql-reference/data-types/datetime64) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT parseDateTime64BestEffortOrNull('2025-01-01 01:01:00.123') AS valid,
       parseDateTime64BestEffortOrNull('invalid') AS invalid
```

```response title=Response
┌─valid───────────────────┬─invalid─┐
│ 2025-01-01 01:01:00.123 │    ᴺᵁᴸᴸ │
└─────────────────────────┴─────────┘
```


## parseDateTime64BestEffortOrZero {#parseDateTime64BestEffortOrZero}

導入バージョン: v20.1

[`parseDateTime64BestEffort`](#parsedatetime64besteffort) と同様ですが、処理できない日付形式に遭遇した場合は、ゼロ日付またはゼロ日時を返します。

**構文**

```sql
parseDateTime64BestEffortOrZero(time_string[, precision[, time_zone]])
```

**引数**

* `time_string` — 変換対象の日付、または日時を含む文字列。[`String`](/sql-reference/data-types/string)
* `precision` — 省略可能。必要な精度。ミリ秒の場合は `3`、マイクロ秒の場合は `6`。デフォルトは `3`。[`UInt8`](/sql-reference/data-types/int-uint)
* `time_zone` — 省略可能。タイムゾーン。関数は `time_string` をこのタイムゾーンとして解釈して解析します。[`String`](/sql-reference/data-types/string)

**返される値**

`time_string` を [`DateTime64`](../../sql-reference/data-types/datetime64.md) に変換した値、または入力を解析できない場合はゼロ日付/日時値（`1970-01-01 00:00:00.000`）を返します。[`DateTime64`](/sql-reference/data-types/datetime64)

**例**

**使用例**

```sql title=Query
SELECT parseDateTime64BestEffortOrZero('2025-01-01 01:01:00.123') AS valid,
       parseDateTime64BestEffortOrZero('invalid') AS invalid
```

```response title=Response
┌─valid───────────────────┬─invalid─────────────────┐
│ 2025-01-01 01:01:00.123 │ 1970-01-01 00:00:00.000 │
└─────────────────────────┴─────────────────────────┘
```


## parseDateTime64BestEffortUS {#parseDateTime64BestEffortUS}

導入バージョン: v22.8

[`parseDateTime64BestEffort`](#parsedatetime64besteffort) と同様ですが、あいまいな場合には米国式の日付形式（`MM/DD/YYYY` など）を優先して解釈します。

**構文**

```sql
parseDateTime64BestEffortUS(time_string [, precision [, time_zone]])
```

**引数**

* `time_string` — 変換対象の日付、または日時を含む文字列。[`String`](/sql-reference/data-types/string)
* `precision` — 省略可。指定する精度。ミリ秒の場合は `3`、マイクロ秒の場合は `6`。デフォルト: `3`。[`UInt8`](/sql-reference/data-types/int-uint)
* `time_zone` — 省略可。タイムゾーン。この関数は `time_string` をこのタイムゾーンとして解釈します。[`String`](/sql-reference/data-types/string)

**戻り値**

あいまいな日付表現については US の日付形式を優先して解釈し、`time_string` を [`DateTime64`](../../sql-reference/data-types/datetime64.md) に変換した値を返します。[`DateTime64`](/sql-reference/data-types/datetime64)

**例**

**使用例**

```sql title=Query
SELECT parseDateTime64BestEffortUS('02/10/2025 12:30:45.123') AS us_format,
       parseDateTime64BestEffortUS('15/08/2025 10:15:30.456') AS fallback_to_standard
```

```response title=Response
┌─us_format───────────────┬─fallback_to_standard────┐
│ 2025-02-10 12:30:45.123 │ 2025-08-15 10:15:30.456 │
└─────────────────────────┴─────────────────────────┘
```


## parseDateTime64BestEffortUSOrNull {#parseDateTime64BestEffortUSOrNull}

導入バージョン: v22.8

この関数は、あいまいな場合に US の日付形式（`MM/DD/YYYY` など）を優先し、処理できない日付形式に遭遇したときに `NULL` を返す点を除き、[`parseDateTime64BestEffort`](#parsedatetime64besteffort) と同じです。

**構文**

```sql
parseDateTime64BestEffortUSOrNull(time_string[, precision[, time_zone]])
```

**引数**

* `time_string` — 変換対象の日付、または日付と時刻を含む文字列。[`String`](/sql-reference/data-types/string)
* `precision` — オプション。指定する精度。ミリ秒の場合は `3`、マイクロ秒の場合は `6`。デフォルト: `3`。[`UInt8`](/sql-reference/data-types/int-uint)
* `time_zone` — オプション。タイムゾーン。この関数は `time_string` をこのタイムゾーンとして解釈して解析します。[`String`](/sql-reference/data-types/string)

**返り値**

米国形式を優先して `time_string` を [`DateTime64`](../../sql-reference/data-types/datetime64.md) に変換した値、または入力を解析できない場合は `NULL` を返します。[`DateTime64`](/sql-reference/data-types/datetime64) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT parseDateTime64BestEffortUSOrNull('02/10/2025 12:30:45.123') AS valid_us,
       parseDateTime64BestEffortUSOrNull('invalid') AS invalid
```

```response title=Response
┌─valid_us────────────────┬─invalid─┐
│ 2025-02-10 12:30:45.123 │    ᴺᵁᴸᴸ │
└─────────────────────────┴─────────┘
```


## parseDateTime64BestEffortUSOrZero {#parseDateTime64BestEffortUSOrZero}

導入バージョン: v22.8

[`parseDateTime64BestEffort`](#parsedatetime64besteffort) と同様ですが、この関数はあいまいな場合に米国式の日付形式（`MM/DD/YYYY` など）を優先し、処理できない日付形式に遭遇した場合はゼロの日付またはゼロの日時を返します。

**構文**

```sql
parseDateTime64BestEffortUSOrZero(time_string [, precision [, time_zone]])
```

**引数**

* `time_string` — 変換対象の日付、または日付と時刻を含む文字列。[`String`](/sql-reference/data-types/string)
* `precision` — 省略可。指定する精度。ミリ秒は `3`、マイクロ秒は `6`。デフォルト: `3`。[`UInt8`](/sql-reference/data-types/int-uint)
* `time_zone` — 省略可。タイムゾーン。この関数は、指定されたタイムゾーンに従って `time_string` をパースします。[`String`](/sql-reference/data-types/string)

**戻り値**

US 形式を優先してパースした結果として、`time_string` を [`DateTime64`](../../sql-reference/data-types/datetime64.md) に変換して返します。入力をパースできない場合は、ゼロ日付/日時 (`1970-01-01 00:00:00.000`) を返します。[`DateTime64`](/sql-reference/data-types/datetime64)

**例**

**使用例**

```sql title=Query
SELECT parseDateTime64BestEffortUSOrZero('02/10/2025 12:30:45.123') AS valid_us,
       parseDateTime64BestEffortUSOrZero('invalid') AS invalid
```

```response title=Response
┌─valid_us────────────────┬─invalid─────────────────┐
│ 2025-02-10 12:30:45.123 │ 1970-01-01 00:00:00.000 │
└─────────────────────────┴─────────────────────────┘
```


## parseDateTimeBestEffort {#parseDateTimeBestEffort}

導入バージョン: v1.1

String 形式で表現された日付と時刻を DateTime データ型に変換します。
この関数は [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html)、[RFC 1123 - 5.2.14 RFC-822](https://datatracker.ietf.org/doc/html/rfc822) Date and Time Specification、ClickHouse 独自のものやその他のいくつかの日付・時刻フォーマットを解析します。

サポートされる非標準フォーマットは次のとおりです:

* 9〜10 桁の Unix タイムスタンプを含む文字列。
* 日付と時刻の要素を含む文字列: `YYYYMMDDhhmmss`、`DD/MM/YYYY hh:mm:ss`、`DD-MM-YY hh:mm`、`YYYY-MM-DD hh:mm:ss` など。
* 日付を含み、時刻の要素を含まない文字列: `YYYY`、`YYYYMM`、`YYYY*MM`、`DD/MM/YYYY`、`DD-MM-YY` など。
* 日と時刻を含む文字列: `DD`、`DD hh`、`DD hh:mm`。この場合、`MM` は `01` に置き換えられます。
* 日付と時刻に加えてタイムゾーンオフセット情報を含む文字列: `YYYY-MM-DD hh:mm:ss ±h:mm` など。
* syslog のタイムスタンプ: `Mmm dd hh:mm:ss`。例えば、`Jun  9 14:20:32`。

区切り文字を含むすべてのフォーマットでは、この関数は月の名称を完全な綴り、または先頭 3 文字で表したものを解析します。
年が指定されていない場合は、現在の年と見なされます。

**構文**

```sql
parseDateTimeBestEffort(time_string[, time_zone])
```

**引数**

* `time_string` — 変換対象の日時を含む文字列。[`String`](/sql-reference/data-types/string)
* `time_zone` — 省略可能。`time_string` をパースする際に使用するタイムゾーン。[`String`](/sql-reference/data-types/string)

**返される値**

`time_string` を `DateTime` として返します。[`DateTime`](/sql-reference/data-types/datetime)

**例**

**使用例**

```sql title=Query
SELECT parseDateTimeBestEffort('23/10/2025 12:12:57') AS parseDateTimeBestEffort
```

```response title=Response
┌─parseDateTimeBestEffort─┐
│     2025-10-23 12:12:57 │
└─────────────────────────┘
```

**タイムゾーンあり**

```sql title=Query
SELECT parseDateTimeBestEffort('Sat, 18 Aug 2025 07:22:16 GMT', 'Asia/Istanbul') AS parseDateTimeBestEffort
```

```response title=Response
┌─parseDateTimeBestEffort─┐
│     2025-08-18 10:22:16 │
└─────────────────────────┘
```

**UNIX タイムスタンプ**

```sql title=Query
SELECT parseDateTimeBestEffort('1735689600') AS parseDateTimeBestEffort
```

```response title=Response
┌─parseDateTimeBestEffort─┐
│     2025-01-01 00:00:00 │
└─────────────────────────┘
```


## parseDateTimeBestEffortOrNull {#parseDateTimeBestEffortOrNull}

導入バージョン: v1.1

[`parseDateTimeBestEffort`](#parseDateTimeBestEffort) と同様ですが、処理できない日付フォーマットに遭遇した場合には `NULL` を返します。
この関数は [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)、[RFC 1123 - 5.2.14 RFC-822 Date and Time Specification](https://tools.ietf.org/html/rfc1123#page-55)、ClickHouse 独自のものやその他のいくつかの日付・時刻フォーマットをパースします。

サポートされる非標準フォーマットは次のとおりです。

* 9～10 桁の Unix タイムスタンプを含む文字列。
* 日付と時刻コンポーネントを含む文字列: `YYYYMMDDhhmmss`、`DD/MM/YYYY hh:mm:ss`、`DD-MM-YY hh:mm`、`YYYY-MM-DD hh:mm:ss` など。
* 日付はあるが時刻コンポーネントがない文字列: `YYYY`、`YYYYMM`、`YYYY*MM`、`DD/MM/YYYY`、`DD-MM-YY` など。
* 日と時刻のみを含む文字列: `DD`、`DD hh`、`DD hh:mm`。この場合、`MM` は `01` に置き換えられます。
* 日付と時刻に加えてタイムゾーンオフセット情報を含む文字列: `YYYY-MM-DD hh:mm:ss ±h:mm` など。
* syslog タイムスタンプ: `Mmm dd hh:mm:ss`。例: `Jun  9 14:20:32`。

区切り文字を含むすべてのフォーマットで、この関数は月名をフルスペルまたは先頭 3 文字の英字表記として解釈します。
年が指定されていない場合は、現在の年とみなされます。

**構文**

```sql
parseDateTimeBestEffortOrNull(time_string[, time_zone])
```

**引数**

* `time_string` — 変換対象の日付と時刻を含む文字列。[`String`](/sql-reference/data-types/string)
* `time_zone` — 省略可能。`time_string` を解析する際に使用するタイムゾーン。[`String`](/sql-reference/data-types/string)

**返される値**

`time_string` を DateTime 値として返し、入力を解析できない場合は `NULL` を返します。[`DateTime`](/sql-reference/data-types/datetime) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT parseDateTimeBestEffortOrNull('23/10/2025 12:12:57') AS valid,
       parseDateTimeBestEffortOrNull('invalid') AS invalid
```

```response title=Response
┌─valid───────────────┬─invalid─┐
│ 2025-10-23 12:12:57 │    ᴺᵁᴸᴸ │
└─────────────────────┴─────────┘
```


## parseDateTimeBestEffortOrZero {#parseDateTimeBestEffortOrZero}

導入バージョン: v1.1

[`parseDateTimeBestEffort`](#parseDateTimeBestEffort) と同様ですが、処理できない日付形式に遭遇した場合に、ゼロ日付またはゼロ日時を返します。
この関数は [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)、[RFC 1123 - 5.2.14 RFC-822 Date and Time Specification](https://tools.ietf.org/html/rfc1123#page-55)、ClickHouse 独自およびその他の日付・時刻形式をパースします。

サポートされる非標準形式:

* 9～10 桁の Unix タイムスタンプを含む文字列。
* 日付と時刻コンポーネントを含む文字列: `YYYYMMDDhhmmss`、`DD/MM/YYYY hh:mm:ss`、`DD-MM-YY hh:mm`、`YYYY-MM-DD hh:mm:ss` など。
* 日付のみで時刻コンポーネントを含まない文字列: `YYYY`、`YYYYMM`、`YYYY*MM`、`DD/MM/YYYY`、`DD-MM-YY` など。
* 日と時刻を含む文字列: `DD`、`DD hh`、`DD hh:mm`。この場合、月（`MM`）には `01` が補われます。
* 日付と時刻に加え、タイムゾーンオフセット情報を含む文字列: `YYYY-MM-DD hh:mm:ss ±h:mm` など。
* syslog のタイムスタンプ: `Mmm dd hh:mm:ss`。例: `Jun  9 14:20:32`。

区切り文字を含むすべての形式については、月名をフルスペルまたは最初の 3 文字で指定したものもパースします。
年が指定されていない場合、現在の年と見なされます。

**構文**

```sql
parseDateTimeBestEffortOrZero(time_string[, time_zone])
```

**引数**

* `time_string` — 変換対象の日時を含む文字列。[`String`](/sql-reference/data-types/string)
* `time_zone` — オプション。`time_string` の解析時に使用するタイムゾーン。[`String`](/sql-reference/data-types/string)

**返される値**

`time_string` を `DateTime` として返します。解析できない場合は、ゼロの日付/日時（`1970-01-01` または `1970-01-01 00:00:00`）を返します。[`DateTime`](/sql-reference/data-types/datetime)

**例**

**使用例**

```sql title=Query
SELECT parseDateTimeBestEffortOrZero('23/10/2025 12:12:57') AS valid,
       parseDateTimeBestEffortOrZero('invalid') AS invalid
```

```response title=Response
┌─valid───────────────┬─invalid─────────────┐
│ 2025-10-23 12:12:57 │ 1970-01-01 00:00:00 │
└─────────────────────┴─────────────────────┘
```


## parseDateTimeBestEffortUS {#parseDateTimeBestEffortUS}

導入バージョン: v1.1

この関数は、`YYYY-MM-DD hh:mm:ss` のような ISO 日付形式および、`YYYYMMDDhhmmss`、`YYYY-MM`、`DD hh`、`YYYY-MM-DD hh:mm:ss ±h:mm` など、月と日の成分を曖昧さなく抽出できるその他の日付形式に対しては、[`parseDateTimeBestEffort`](#parseDateTimeBestEffort) と同様に動作します。
月と日の成分を曖昧さなく抽出できない `MM/DD/YYYY`、`MM-DD-YYYY`、`MM-DD-YY` などの形式では、`DD/MM/YYYY`、`DD-MM-YYYY`、`DD-MM-YY` ではなく、米国式の日付形式を優先します。
前述のルールに対する例外として、月が 12 より大きく 31 以下である場合、この関数は [`parseDateTimeBestEffort`](#parseDateTimeBestEffort) の動作にフォールバックします。たとえば `15/08/2020` は `2020-08-15` としてパースされます。

**構文**

```sql
parseDateTimeBestEffortUS(time_string[, time_zone])
```

**引数**

* `time_string` — 変換対象の日時を含む文字列。[`String`](/sql-reference/data-types/string)
* `time_zone` — 任意。`time_string` を解釈する際に使用するタイムゾーン。[`String`](/sql-reference/data-types/string)

**戻り値**

あいまいな場合には US の日付形式を優先して解釈し、`time_string` を `DateTime` として返します。[`DateTime`](/sql-reference/data-types/datetime)

**例**

**使用例**

```sql title=Query
SELECT parseDateTimeBestEffortUS('02/10/2025') AS us_format,
       parseDateTimeBestEffortUS('15/08/2025') AS fallback_to_standard
```

```response title=Response
┌─us_format───────────┬─fallback_to_standard─┐
│ 2025-02-10 00:00:00 │  2025-08-15 00:00:00 │
└─────────────────────┴──────────────────────┘
```


## parseDateTimeBestEffortUSOrNull {#parseDateTimeBestEffortUSOrNull}

導入バージョン: v1.1

[`parseDateTimeBestEffortUS`](#parseDateTimeBestEffortUS) 関数と同様ですが、処理できない日付形式に出会った場合は `NULL` を返します。

この関数は ISO 日付形式に対しては [`parseDateTimeBestEffort`](#parseDateTimeBestEffort) と同様に動作しますが、あいまいな場合には US 日付形式を優先し、パースエラー時には `NULL` を返します。

**構文**

```sql
parseDateTimeBestEffortUSOrNull(time_string[, time_zone])
```

**引数**

* `time_string` — 変換対象の日時を含む文字列。[`String`](/sql-reference/data-types/string)
* `time_zone` — オプション。`time_string` を解析する際に使用するタイムゾーン。[`String`](/sql-reference/data-types/string)

**返される値**

US 形式を優先して `time_string` を DateTime 型として返すか、入力を解析できない場合は `NULL` を返します。[`DateTime`](/sql-reference/data-types/datetime) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT parseDateTimeBestEffortUSOrNull('02/10/2025') AS valid_us,
       parseDateTimeBestEffortUSOrNull('invalid') AS invalid
```

```response title=Response
┌─valid_us────────────┬─invalid─┐
│ 2025-02-10 00:00:00 │    ᴺᵁᴸᴸ │
└─────────────────────┴─────────┘
```


## parseDateTimeBestEffortUSOrZero {#parseDateTimeBestEffortUSOrZero}

導入バージョン: v1.1

[`parseDateTimeBestEffortUS`](#parseDateTimeBestEffortUS) 関数と同様ですが、処理できない日付形式に遭遇した場合は、ゼロ日付（`1970-01-01`）または時刻付きゼロ日付（`1970-01-01 00:00:00`）を返す点が異なります。

この関数は ISO 日付形式に対しては [`parseDateTimeBestEffort`](#parseDateTimeBestEffort) と同様に動作しますが、あいまいなケースでは米国式の日付形式を優先し、パースエラー時にはゼロを返します。

**構文**

```sql
parseDateTimeBestEffortUSOrZero(time_string[, time_zone])
```

**引数**

* `time_string` — 変換対象の日付と時刻を含む文字列。[`String`](/sql-reference/data-types/string)
* `time_zone` — 省略可能。`time_string` のパースに使用するタイムゾーン。[`String`](/sql-reference/data-types/string)

**戻り値**

US 形式を優先して `time_string` を `DateTime` として返します。入力をパースできない場合はゼロの日付/日時（`1970-01-01` または `1970-01-01 00:00:00`）を返します。[`DateTime`](/sql-reference/data-types/datetime)

**例**

**使用例**

```sql title=Query
SELECT parseDateTimeBestEffortUSOrZero('02/10/2025') AS valid_us,
       parseDateTimeBestEffortUSOrZero('invalid') AS invalid
```

```response title=Response
┌─valid_us────────────┬─invalid─────────────┐
│ 2025-02-10 00:00:00 │ 1970-01-01 00:00:00 │
└─────────────────────┴─────────────────────┘
```


## parseDateTimeOrNull {#parseDateTimeOrNull}

導入: v23.3

[`parseDateTime`](#parseDateTime) と同様ですが、解析できない日付形式に遭遇した場合は `NULL` を返します。

**構文**

```sql
parseDateTimeOrNull(time_string, format[, timezone])
```

**別名**: `str_to_date`

**引数**

* `time_string` — DateTime に解析する文字列。[`String`](/sql-reference/data-types/string)
* `format` — `time_string` をどのように解析するかを指定するフォーマット文字列。[`String`](/sql-reference/data-types/string)
* `timezone` — 省略可能。タイムゾーン。[`String`](/sql-reference/data-types/string)

**返り値**

入力文字列を解析して得られた DateTime を返します。解析に失敗した場合は NULL を返します。[`Nullable(DateTime)`](/sql-reference/data-types/nullable)

**例**

**使用例**

```sql title=Query
SELECT parseDateTimeOrNull('2025-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')
```

```response title=Response
┌─parseDateTimeOrNull('2025-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')─┐
│                                            2025-01-04 23:00:00  │
└─────────────────────────────────────────────────────────────────┘
```


## parseDateTimeOrZero {#parseDateTimeOrZero}

導入バージョン: v23.3

[`parseDateTime`](#parseDateTime) と同様ですが、解析できない日付時刻形式を検出した場合はゼロ日時を返します。

**構文**

```sql
parseDateTimeOrZero(time_string, format[, timezone])
```

**引数**

* `time_string` — `DateTime` として解釈する文字列。[`String`](/sql-reference/data-types/string)
* `format` — `time_string` の解析方法を指定するフォーマット文字列。[`String`](/sql-reference/data-types/string)
* `timezone` — 省略可能。タイムゾーン。[`String`](/sql-reference/data-types/string)

**戻り値**

入力文字列から解析された `DateTime` を返します。解析に失敗した場合はゼロ値の `DateTime` を返します。[`DateTime`](/sql-reference/data-types/datetime)

**例**

**使用例**

```sql title=Query
SELECT parseDateTimeOrZero('2025-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')
```

```response title=Response
┌─parseDateTimeOrZero('2025-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')─┐
│                                             2025-01-04 23:00:00 │
└─────────────────────────────────────────────────────────────────┘
```


## reinterpret {#reinterpret}

導入バージョン: v1.1

指定された値 `x` のメモリ上のバイト列をそのまま使用し、変換先の型として再解釈します。

**構文**

```sql
reinterpret(x, type)
```

**引数**

* `x` — 任意の型。[`Any`](/sql-reference/data-types)
* `type` — 変換先の型。配列である場合、その配列要素の型は固定長型である必要があります。[`String`](/sql-reference/data-types/string)

**戻り値**

変換先の型の値。[`Any`](/sql-reference/data-types)

**例**

**使用例**

```sql title=Query
SELECT reinterpret(toInt8(-1), 'UInt8') AS int_to_uint,
    reinterpret(toInt8(1), 'Float32') AS int_to_float,
    reinterpret('1', 'UInt32') AS string_to_int
```

```response title=Response
┌─int_to_uint─┬─int_to_float─┬─string_to_int─┐
│         255 │        1e-45 │            49 │
└─────────────┴──────────────┴───────────────┘
```

**配列の例**

```sql title=Query
SELECT reinterpret(x'3108b4403108d4403108b4403108d440', 'Array(Float32)') AS string_to_array_of_Float32
```

```response title=Response
┌─string_to_array_of_Float32─┐
│ [5.626,6.626,5.626,6.626]  │
└────────────────────────────┘
```


## reinterpretAsDate {#reinterpretAsDate}

導入バージョン: v1.1

入力値を、Unix エポック 1970-01-01 の開始時点からの経過日数を表す Date 値として（リトルエンディアン順であると仮定して）再解釈します。

**構文**

```sql
reinterpretAsDate(x)
```

**引数**

* `x` — Unix エポックの開始からの経過日数。[`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`Date`](/sql-reference/data-types/date) または [`DateTime`](/sql-reference/data-types/datetime) または [`UUID`](/sql-reference/data-types/uuid) または [`String`](/sql-reference/data-types/string) または [`FixedString`](/sql-reference/data-types/fixedstring)

**戻り値**

日付。[`Date`](/sql-reference/data-types/date)

**例**

**使用例**

```sql title=Query
SELECT reinterpretAsDate(65), reinterpretAsDate('A')
```

```response title=Response
┌─reinterpretAsDate(65)─┬─reinterpretAsDate('A')─┐
│            1970-03-07 │             1970-03-07 │
└───────────────────────┴────────────────────────┘
```


## reinterpretAsDateTime {#reinterpretAsDateTime}

導入バージョン: v1.1

入力値を DateTime 値として再解釈します（リトルエンディアンでの格納を想定）。Unix エポックである 1970-01-01 の開始時点からの経過日数として扱われます。

**構文**

```sql
reinterpretAsDateTime(x)
```

**引数**

* `x` — Unix エポックの開始からの経過秒数。[`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`Date`](/sql-reference/data-types/date) または [`DateTime`](/sql-reference/data-types/datetime) または [`UUID`](/sql-reference/data-types/uuid) または [`String`](/sql-reference/data-types/string) または [`FixedString`](/sql-reference/data-types/fixedstring) のいずれか

**戻り値**

日付と時刻。[`DateTime`](/sql-reference/data-types/datetime)

**例**

**使用例**

```sql title=Query
SELECT reinterpretAsDateTime(65), reinterpretAsDateTime('A')
```

```response title=Response
┌─reinterpretAsDateTime(65)─┬─reinterpretAsDateTime('A')─┐
│       1970-01-01 01:01:05 │        1970-01-01 01:01:05 │
└───────────────────────────┴────────────────────────────┘
```


## reinterpretAsFixedString {#reinterpretAsFixedString}

導入バージョン: v1.1

入力値を固定長の文字列として再解釈します（リトルエンディアン順を仮定します）。
末尾のヌルバイトは無視されます。たとえば、この関数は UInt32 値 255 に対して、1 文字だけから成る文字列を返します。

**構文**

```sql
reinterpretAsFixedString(x)
```

**引数**

* `x` — 文字列として再解釈する値。[`(U)Int*`](/sql-reference/data-types/int-uint)、[`Float*`](/sql-reference/data-types/float)、[`Date`](/sql-reference/data-types/date)、または [`DateTime`](/sql-reference/data-types/datetime)

**返される値**

`x` を表すバイト列を含む固定長文字列。[`FixedString`](/sql-reference/data-types/fixedstring)

**例**

**使用例**

```sql title=Query
SELECT
    reinterpretAsFixedString(toDateTime('1970-01-01 01:01:05')),
    reinterpretAsFixedString(toDate('1970-03-07'))
```

```response title=Response
┌─reinterpretAsFixedString(toDateTime('1970-01-01 01:01:05'))─┬─reinterpretAsFixedString(toDate('1970-03-07'))─┐
│ A                                                           │ A                                              │
└─────────────────────────────────────────────────────────────┴────────────────────────────────────────────────┘
```


## reinterpretAsFloat32 {#reinterpretAsFloat32}

導入バージョン: v1.1

入力値を `Float32` 型として再解釈します。
[`CAST`](#cast) と異なり、この関数は元の値を保持しようとしません。対象の型が入力値を表現できない場合、出力は未定義です。

**構文**

```sql
reinterpretAsFloat32(x)
```

**引数**

* `x` — Float32 型として再解釈する値。[`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`Date`](/sql-reference/data-types/date) または [`DateTime`](/sql-reference/data-types/datetime) または [`UUID`](/sql-reference/data-types/uuid) または [`String`](/sql-reference/data-types/string) または [`FixedString`](/sql-reference/data-types/fixedstring)

**戻り値**

再解釈された `x` の値を返します。[`Float32`](/sql-reference/data-types/float)

**例**

**使用例**

```sql title=Query
SELECT reinterpretAsUInt32(toFloat32(0.2)) AS x, reinterpretAsFloat32(x)
```

```response title=Response
┌──────────x─┬─reinterpretAsFloat32(x)─┐
│ 1045220557 │                     0.2 │
└────────────┴─────────────────────────┘
```


## reinterpretAsFloat64 {#reinterpretAsFloat64}

導入: v1.1

入力値を `Float64` 型の値として再解釈します。
[`CAST`](#cast) と異なり、この関数は元の値の保持を試みません。対象の型で入力値を表現できない場合、結果は未定義です。

**構文**

```sql
reinterpretAsFloat64(x)
```

**引数**

* `x` — Float64 として再解釈する値。[`(U)Int*`](/sql-reference/data-types/int-uint)、[`Float*`](/sql-reference/data-types/float)、[`Date`](/sql-reference/data-types/date)、[`DateTime`](/sql-reference/data-types/datetime)、[`UUID`](/sql-reference/data-types/uuid)、[`String`](/sql-reference/data-types/string)、または [`FixedString`](/sql-reference/data-types/fixedstring)

**戻り値**

再解釈された値 `x` を返します。[`Float64`](/sql-reference/data-types/float)

**例**

**使用例**

```sql title=Query
SELECT reinterpretAsUInt64(toFloat64(0.2)) AS x, reinterpretAsFloat64(x)
```

```response title=Response
┌───────────────────x─┬─reinterpretAsFloat64(x)─┐
│ 4596373779694328218 │                     0.2 │
└─────────────────────┴─────────────────────────┘
```


## reinterpretAsInt128 {#reinterpretAsInt128}

導入バージョン: v1.1

入力値を `Int128` 型の値として再解釈します。
[`CAST`](#cast) と異なり、この関数は元の値を保持しようとしません。変換先の型が入力の型を表現できない場合、出力は未定義になります。

**構文**

```sql
reinterpretAsInt128(x)
```

**引数**

* `x` — Int128 型として再解釈する値。[`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`Date`](/sql-reference/data-types/date) または [`DateTime`](/sql-reference/data-types/datetime) または [`UUID`](/sql-reference/data-types/uuid) または [`String`](/sql-reference/data-types/string) または [`FixedString`](/sql-reference/data-types/fixedstring)

**戻り値**

再解釈された `x` の値を返します。[`Int128`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toInt64(257) AS x,
    toTypeName(x),
    reinterpretAsInt128(x) AS res,
    toTypeName(res)
```

```response title=Response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int64         │ 257 │ Int128          │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt16 {#reinterpretAsInt16}

導入バージョン: v1.1

入力値を型 `Int16` の値として再解釈します。
[`CAST`](#cast) と異なり、この関数は元の値を保持しようとはしません。対象の型で入力値を表現できない場合、結果は未定義です。

**構文**

```sql
reinterpretAsInt16(x)
```

**引数**

* `x` — Int16 型として再解釈する値。[`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`Date`](/sql-reference/data-types/date) または [`DateTime`](/sql-reference/data-types/datetime) または [`UUID`](/sql-reference/data-types/uuid) または [`String`](/sql-reference/data-types/string) または [`FixedString`](/sql-reference/data-types/fixedstring)

**戻り値**

`x` を Int16 型として再解釈した値を返します。[`Int16`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toInt8(257) AS x,
    toTypeName(x),
    reinterpretAsInt16(x) AS res,
    toTypeName(res)
```

```response title=Response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ Int8          │   1 │ Int16           │
└───┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt256 {#reinterpretAsInt256}

導入バージョン: v1.1

入力値を Int256 型の値として再解釈します。
[`CAST`](#cast) と異なり、この関数は元の値を保持しようとしません。対象の型が入力の値を表現できない場合、出力は未定義です。

**構文**

```sql
reinterpretAsInt256(x)
```

**引数**

* `x` — Int256 として再解釈する値。[`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`Date`](/sql-reference/data-types/date) または [`DateTime`](/sql-reference/data-types/datetime) または [`UUID`](/sql-reference/data-types/uuid) または [`String`](/sql-reference/data-types/string) または [`FixedString`](/sql-reference/data-types/fixedstring)

**戻り値**

再解釈された値 `x` を返します。[`Int256`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toInt128(257) AS x,
    toTypeName(x),
    reinterpretAsInt256(x) AS res,
    toTypeName(res)
```

```response title=Response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int128        │ 257 │ Int256          │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt32 {#reinterpretAsInt32}

導入バージョン: v1.1

入力値を `Int32` 型の値として再解釈します。
[`CAST`](#cast) と異なり、この関数は元の値の保持を試みません。対象の型が入力の値を表現できない場合、結果は未定義です。

**構文**

```sql
reinterpretAsInt32(x)
```

**引数**

* `x` — Int32 型として再解釈する値。[`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`Date`](/sql-reference/data-types/date) または [`DateTime`](/sql-reference/data-types/datetime) または [`UUID`](/sql-reference/data-types/uuid) または [`String`](/sql-reference/data-types/string) または [`FixedString`](/sql-reference/data-types/fixedstring)

**返される値**

再解釈された `x` の値を返します。型は [`Int32`](/sql-reference/data-types/int-uint) です。

**例**

**使用例**

```sql title=Query
SELECT
    toInt16(257) AS x,
    toTypeName(x),
    reinterpretAsInt32(x) AS res,
    toTypeName(res)
```

```response title=Response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int16         │ 257 │ Int32           │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt64 {#reinterpretAsInt64}

導入バージョン: v1.1

入力値を `Int64` 型の値として再解釈します。
[`CAST`](#cast) と異なり、この関数は元の値を保持しようとはしません。対象の型が入力値を表現できない場合、出力は未定義です。

**構文**

```sql
reinterpretAsInt64(x)
```

**引数**

* `x` — Int64 型として再解釈する値。[`(U)Int*`](/sql-reference/data-types/int-uint)、[`Float*`](/sql-reference/data-types/float)、[`Date`](/sql-reference/data-types/date)、[`DateTime`](/sql-reference/data-types/datetime)、[`UUID`](/sql-reference/data-types/uuid)、[`String`](/sql-reference/data-types/string)、[`FixedString`](/sql-reference/data-types/fixedstring) のいずれか。

**戻り値**

再解釈後の値 `x` を返します。[`Int64`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toInt32(257) AS x,
    toTypeName(x),
    reinterpretAsInt64(x) AS res,
    toTypeName(res)
```

```response title=Response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int32         │ 257 │ Int64           │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt8 {#reinterpretAsInt8}

導入バージョン: v1.1

入力値を Int8 型として再解釈します。
[`CAST`](#cast) と異なり、この関数は元の値を保持しようとはしません。対象の型が入力の値を表現できない場合、出力は未定義となります。

**構文**

```sql
reinterpretAsInt8(x)
```

**引数**

* `x` — Int8 型として再解釈する値。[`(U)Int*`](/sql-reference/data-types/int-uint)、[`Float*`](/sql-reference/data-types/float)、[`Date`](/sql-reference/data-types/date)、[`DateTime`](/sql-reference/data-types/datetime)、[`UUID`](/sql-reference/data-types/uuid)、[`String`](/sql-reference/data-types/string)、[`FixedString`](/sql-reference/data-types/fixedstring) のいずれか。

**戻り値**

再解釈された値 `x` を返します。型は [`Int8`](/sql-reference/data-types/int-uint) です。

**例**

**使用例**

```sql title=Query
SELECT
    toUInt8(257) AS x,
    toTypeName(x),
    reinterpretAsInt8(x) AS res,
    toTypeName(res)
```

```response title=Response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ UInt8         │   1 │ Int8            │
└───┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsString {#reinterpretAsString}

導入バージョン: v1.1

入力値を文字列として再解釈します（バイト順はリトルエンディアンを前提とします）。
末尾のヌルバイトは無視されます。たとえば、UInt32 値 255 に対しては、1 文字だけからなる文字列を返します。

**構文**

```sql
reinterpretAsString(x)
```

**引数**

* `x` — 文字列として再解釈する値。[`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`Date`](/sql-reference/data-types/date) または [`DateTime`](/sql-reference/data-types/datetime)

**戻り値**

`x` のバイト表現を含む文字列。[`String`](/sql-reference/data-types/string)

**例**

**使用例**

```sql title=Query
SELECT
    reinterpretAsString(toDateTime('1970-01-01 01:01:05')),
    reinterpretAsString(toDate('1970-03-07'))
```

```response title=Response
┌─reinterpretAsString(toDateTime('1970-01-01 01:01:05'))─┬─reinterpretAsString(toDate('1970-03-07'))─┐
│ A                                                      │ A                                         │
└────────────────────────────────────────────────────────┴───────────────────────────────────────────┘
```


## reinterpretAsUInt128 {#reinterpretAsUInt128}

導入: v1.1

入力値を型 `UInt128` の値として再解釈します。
[`CAST`](#cast) とは異なり、この関数は元の値を保持しようとしません。対象の型が入力値を表現できない場合、出力は未定義です。

**構文**

```sql
reinterpretAsUInt128(x)
```

**引数**

* `x` — UInt128 として再解釈される値。[`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`Date`](/sql-reference/data-types/date) または [`DateTime`](/sql-reference/data-types/datetime) または [`UUID`](/sql-reference/data-types/uuid) または [`String`](/sql-reference/data-types/string) または [`FixedString`](/sql-reference/data-types/fixedstring)

**返り値**

再解釈された値 `x` を返します。[`UInt128`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toUInt64(257) AS x,
    toTypeName(x),
    reinterpretAsUInt128(x) AS res,
    toTypeName(res)
```

```response title=Response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt64        │ 257 │ UInt128         │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt16 {#reinterpretAsUInt16}

導入バージョン: v1.1

入力値を `UInt16` 型の値として再解釈します。
[`CAST`](#cast) と異なり、この関数は元の値を保持しようとはしません。ターゲット型が入力値を表現できない場合、出力は未定義となります。

**構文**

```sql
reinterpretAsUInt16(x)
```

**引数**

* `x` — UInt16 として再解釈する対象の値。[`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`Date`](/sql-reference/data-types/date) または [`DateTime`](/sql-reference/data-types/datetime) または [`UUID`](/sql-reference/data-types/uuid) または [`String`](/sql-reference/data-types/string) または [`FixedString`](/sql-reference/data-types/fixedstring)

**戻り値**

再解釈された `x` の値を返します。[`UInt16`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toUInt8(257) AS x,
    toTypeName(x),
    reinterpretAsUInt16(x) AS res,
    toTypeName(res)
```

```response title=Response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ UInt8         │   1 │ UInt16          │
└───┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt256 {#reinterpretAsUInt256}

導入バージョン: v1.1

入力値を `UInt256` 型の値として再解釈します。
[`CAST`](#cast) と異なり、この関数は元の値を保持しようとしません。ターゲット型で入力値を表現できない場合、出力は未定義です。

**構文**

```sql
reinterpretAsUInt256(x)
```

**引数**

* `x` — UInt256 型として再解釈する値。[`(U)Int*`](/sql-reference/data-types/int-uint)、[`Float*`](/sql-reference/data-types/float)、[`Date`](/sql-reference/data-types/date)、[`DateTime`](/sql-reference/data-types/datetime)、[`UUID`](/sql-reference/data-types/uuid)、[`String`](/sql-reference/data-types/string)、または [`FixedString`](/sql-reference/data-types/fixedstring)

**戻り値**

再解釈後の値 `x` を返します。型は [`UInt256`](/sql-reference/data-types/int-uint) です。

**例**

**使用例**

```sql title=Query
SELECT
    toUInt128(257) AS x,
    toTypeName(x),
    reinterpretAsUInt256(x) AS res,
    toTypeName(res)
```

```response title=Response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt128       │ 257 │ UInt256         │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt32 {#reinterpretAsUInt32}

導入バージョン: v1.1

入力値を `UInt32` 型として再解釈します。
[`CAST`](#cast) と異なり、この関数は元の値を保持しようとしません。変換先の型が入力値を表現できない場合、出力は未定義です。

**構文**

```sql
reinterpretAsUInt32(x)
```

**引数**

* `x` — UInt32 型として再解釈する値。[`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`Date`](/sql-reference/data-types/date) または [`DateTime`](/sql-reference/data-types/datetime) または [`UUID`](/sql-reference/data-types/uuid) または [`String`](/sql-reference/data-types/string) または [`FixedString`](/sql-reference/data-types/fixedstring)

**返り値**

再解釈した値 `x` を返します。[`UInt32`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toUInt16(257) AS x,
    toTypeName(x),
    reinterpretAsUInt32(x) AS res,
    toTypeName(res)
```

```response title=Response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt16        │ 257 │ UInt32          │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt64 {#reinterpretAsUInt64}

導入バージョン: v1.1

入力値を `UInt64` 型の値として再解釈します。
[`CAST`](#cast) と異なり、この関数は元の値の保持を試みません。対象の型が入力値の型を表現できない場合、結果は未定義です。

**構文**

```sql
reinterpretAsUInt64(x)
```

**引数**

* `x` — UInt64 型として再解釈する値。[`Int*`](/sql-reference/data-types/int-uint) または [`UInt*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`Date`](/sql-reference/data-types/date) または [`DateTime`](/sql-reference/data-types/datetime) または [`UUID`](/sql-reference/data-types/uuid) または [`String`](/sql-reference/data-types/string) または [`FixedString`](/sql-reference/data-types/fixedstring)

**戻り値**

`x` を再解釈した値を返します。[`UInt64`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toUInt32(257) AS x,
    toTypeName(x),
    reinterpretAsUInt64(x) AS res,
    toTypeName(res)
```

```response title=Response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt32        │ 257 │ UInt64          │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt8 {#reinterpretAsUInt8}

導入バージョン: v1.1

入力値を `UInt8` 型の値として再解釈します。
[`CAST`](#cast) と異なり、この関数は元の値を保持しようとしません。対象の型が入力値を表現できない場合、出力は未定義です。

**構文**

```sql
reinterpretAsUInt8(x)
```

**引数**

* `x` — UInt8 として再解釈する値。[`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`Date`](/sql-reference/data-types/date) または [`DateTime`](/sql-reference/data-types/datetime) または [`UUID`](/sql-reference/data-types/uuid) または [`String`](/sql-reference/data-types/string) または [`FixedString`](/sql-reference/data-types/fixedstring)

**返り値**

再解釈された値 `x` を返します。型は [`UInt8`](/sql-reference/data-types/int-uint) です。

**例**

**使用例**

```sql title=Query
SELECT
    toInt8(-1) AS val,
    toTypeName(val),
    reinterpretAsUInt8(val) AS res,
    toTypeName(res);
```

```response title=Response
┌─val─┬─toTypeName(val)─┬─res─┬─toTypeName(res)─┐
│  -1 │ Int8            │ 255 │ UInt8           │
└─────┴─────────────────┴─────┴─────────────────┘
```


## reinterpretAsUUID {#reinterpretAsUUID}

導入: v1.1

16 バイトの文字列を受け取り、各 8 バイトの部分をリトルエンディアンのバイト順として解釈して UUID を返します。文字列が十分な長さでない場合、この関数は末尾に不足分のヌルバイトがパディングされたかのように動作します。文字列が 16 バイトより長い場合、末尾の余分なバイトは無視されます。

**構文**

```sql
reinterpretAsUUID(fixed_string)
```

**引数**

* `fixed_string` — ビッグエンディアンのバイト列。[`FixedString`](/sql-reference/data-types/fixedstring)

**戻り値**

UUID 型の値。[`UUID`](/sql-reference/data-types/uuid)

**例**

**String から UUID への変換**

```sql title=Query
SELECT reinterpretAsUUID(reverse(unhex('000102030405060708090a0b0c0d0e0f')))
```

```response title=Response
┌─reinterpretAsUUID(reverse(unhex('000102030405060708090a0b0c0d0e0f')))─┐
│                                  08090a0b-0c0d-0e0f-0001-020304050607 │
└───────────────────────────────────────────────────────────────────────┘
```


## toBFloat16 {#toBFloat16}

導入バージョン: v1.1

入力値を BFloat16 型の値に変換します。
エラーが発生した場合は例外をスローします。

関連項目:

* [`toBFloat16OrZero`](#toBFloat16OrZero)
* [`toBFloat16OrNull`](#toBFloat16OrNull)

**構文**

```sql
toBFloat16(expr)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。 [`Expression`](/sql-reference/data-types/special-data-types/expression)

**返される値**

16 ビットの brain-float 値を返します。 [`BFloat16`](/sql-reference/data-types/float)

**例**

**使用例**

```sql title=Query
SELECT
toBFloat16(toFloat32(42.7)),
toBFloat16(toFloat32('42.7')),
toBFloat16('42.7')
FORMAT Vertical;
```

```response title=Response
toBFloat16(toFloat32(42.7)): 42.5
toBFloat16(t⋯32('42.7')):    42.5
toBFloat16('42.7'):          42.5
```


## toBFloat16OrNull {#toBFloat16OrNull}

導入バージョン: v1.1

`String` 型の入力値を `BFloat16` 型の値に変換します。
文字列が浮動小数点値を表していない場合、この関数は `NULL` を返します。

サポートされる引数:

* 数値を表す文字列。

サポートされない引数（`NULL` を返す）:

* 2 進数および 16 進数を表す文字列。
* 数値型の値。

:::note
この関数は、文字列表現からの変換時に精度が暗黙的に失われることを許容します。
:::

関連項目:

* [`toBFloat16`](#toBFloat16).
* [`toBFloat16OrZero`](#toBFloat16OrZero).

**構文**

```sql
toBFloat16OrNull(x)
```

**引数**

* `x` — 数値を表す文字列。[`String`](/sql-reference/data-types/string)

**返される値**

16 ビットの bfloat16 値を返し、それ以外の場合は `NULL`。[`BFloat16`](/sql-reference/data-types/float) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT toBFloat16OrNull('0x5E'), -- unsupported arguments
       toBFloat16OrNull('12.3'), -- typical use
       toBFloat16OrNull('12.3456789') -- silent loss of precision
```

```response title=Response
\N
12.25
12.3125
```


## toBFloat16OrZero {#toBFloat16OrZero}

導入バージョン: v1.1

String 型の入力値を BFloat16 型の値に変換します。
文字列が浮動小数点値を表していない場合、この関数はゼロを返します。

サポートされる引数:

* 数値を表す文字列表現。

サポートされない引数（`0` を返す）:

* 2 進数および 16 進数を表す文字列表現。
* 数値型の値。

:::note
この関数では、文字列表現からの変換時に精度が失われてもエラーにはなりません。
:::

関連項目:

* [`toBFloat16`](#toBFloat16)。
* [`toBFloat16OrNull`](#toBFloat16OrNull)。

**構文**

```sql
toBFloat16OrZero(x)
```

**引数**

* `x` — 数値を表す文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

16ビットの brain-float 値を返し、それ以外の場合は `0` を返します。[`BFloat16`](/sql-reference/data-types/float)

**例**

**使用例**

```sql title=Query
SELECT toBFloat16OrZero('0x5E'), -- unsupported arguments
       toBFloat16OrZero('12.3'), -- typical use
       toBFloat16OrZero('12.3456789') -- silent loss of precision
```

```response title=Response
0
12.25
12.3125
```


## toBool {#toBool}

導入: v22.2

入力値を Bool 型に変換します。

**構文**

```sql
toBool(expr)
```

**引数**

* `expr` — 数値または文字列を返す式。文字列の場合は、&#39;true&#39; または &#39;false&#39;（大文字小文字は区別しない）を受け取ります。[`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`String`](/sql-reference/data-types/string) または [`Expression`](/sql-reference/data-types/special-data-types/expression)

**戻り値**

引数の評価結果に応じて `true` または `false` を返します。[`Bool`](/sql-reference/data-types/boolean)

**例**

**使用例**

```sql title=Query
SELECT
    toBool(toUInt8(1)),
    toBool(toInt8(-1)),
    toBool(toFloat32(1.01)),
    toBool('true'),
    toBool('false'),
    toBool('FALSE')
FORMAT Vertical
```

```response title=Response
toBool(toUInt8(1)):      true
toBool(toInt8(-1)):      true
toBool(toFloat32(1.01)): true
toBool('true'):          true
toBool('false'):         false
toBool('FALSE'):         false
```


## toDate {#toDate}

導入バージョン: v1.1

入力値を型 [`Date`](/sql-reference/data-types/date) に変換します。
String、FixedString、DateTime、数値型からの変換をサポートします。

**構文**

```sql
toDate(x)
```

**引数**

* `x` — 変換する入力値。[`String`](/sql-reference/data-types/string) または [`FixedString`](/sql-reference/data-types/fixedstring) または [`DateTime`](/sql-reference/data-types/datetime) または [`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float)

**戻り値**

変換後の値を返します。[`Date`](/sql-reference/data-types/date)

**例**

**String から Date への変換**

```sql title=Query
SELECT toDate('2025-04-15')
```

```response title=Response
2025-04-15
```

**DateTime を Date に変換**

```sql title=Query
SELECT toDate(toDateTime('2025-04-15 10:30:00'))
```

```response title=Response
2025-04-15
```

**整数を日付に変換**

```sql title=Query
SELECT toDate(20297)
```

```response title=Response
2025-07-28
```


## toDate32 {#toDate32}

導入バージョン: v21.9

引数を [Date32](../data-types/date32.md) データ型に変換します。
値が範囲外の場合、`toDate32` は [Date32](../data-types/date32.md) でサポートされている境界値を返します。
引数が [`Date`](../data-types/date.md) 型の場合は、その型の範囲制約が考慮されます。

**構文**

```sql
toDate32(expr)
```

**引数**

* `expr` — 変換する値。[`String`](/sql-reference/data-types/string) または [`UInt32`](/sql-reference/data-types/int-uint) または [`Date`](/sql-reference/data-types/date)

**戻り値**

カレンダー上の日付を返します。[`Date32`](/sql-reference/data-types/date32)

**例**

**範囲内の例**

```sql title=Query
SELECT toDate32('2025-01-01') AS value, toTypeName(value)
FORMAT Vertical
```

```response title=Response
Row 1:
──────
value:           2025-01-01
toTypeName(value): Date32
```

**範囲外**

```sql title=Query
SELECT toDate32('1899-01-01') AS value, toTypeName(value)
FORMAT Vertical
```

```response title=Response
Row 1:
──────
value:           1900-01-01
toTypeName(value): Date32
```


## toDate32OrDefault {#toDate32OrDefault}

導入バージョン: v21.11

引数を [Date32](../data-types/date32.md) データ型に変換します。値が範囲外の場合、`toDate32OrDefault` は [Date32](../data-types/date32.md) でサポートされている下限値を返します。引数が [Date](../data-types/date.md) 型の場合は、その型の範囲制限も考慮されます。不正な引数が渡された場合はデフォルト値を返します。

**構文**

```sql
toDate32OrDefault(expr[, default])
```

**引数**

* `expr` — 数値または数値を表す文字列を返す式。[`String`](/sql-reference/data-types/string) または [`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float)
* `default` — 省略可能。パースに失敗した場合に返すデフォルト値。[`Date32`](/sql-reference/data-types/date32)

**戻り値**

成功した場合は `Date32` 型の値を返し、失敗した場合はデフォルト値が指定されていればそれを、指定されていなければ 1900-01-01 を返します。[`Date32`](/sql-reference/data-types/date32)

**例**

**変換が成功する例**

```sql title=Query
SELECT toDate32OrDefault('1930-01-01', toDate32('2020-01-01'))
```

```response title=Response
1930-01-01
```

**変換失敗**

```sql title=Query
SELECT toDate32OrDefault('xx1930-01-01', toDate32('2020-01-01'))
```

```response title=Response
2020-01-01
```


## toDate32OrNull {#toDate32OrNull}

導入バージョン: v21.9

入力値を `Date32` 型の値に変換しますが、無効な引数を受け取った場合は `NULL` を返します。
[`toDate32`](#toDate32) と同様ですが、無効な引数を受け取った場合に `NULL` を返す点が異なります。

**構文**

```sql
toDate32OrNull(x)
```

**引数**

* `x` — 日付の文字列表現を含む文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

処理が成功した場合は Date32 の値を返し、そうでない場合は `NULL` を返します。[`Date32`](/sql-reference/data-types/date32) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT toDate32OrNull('2025-01-01'), toDate32OrNull('invalid')
```

```response title=Response
┌─toDate32OrNull('2025-01-01')─┬─toDate32OrNull('invalid')─┐
│                   2025-01-01 │                      ᴺᵁᴸᴸ │
└──────────────────────────────┴───────────────────────────┘
```


## toDate32OrZero {#toDate32OrZero}

導入: v21.9

入力値を [Date32](../data-types/date32.md) 型の値に変換しますが、無効な引数が渡された場合は [Date32](../data-types/date32.md) の下限値を返します。
[toDate32](#toDate32) と同様に動作しますが、無効な引数が渡された場合は [Date32](../data-types/date32.md) の下限値を返します。

関連項目:

* [`toDate32`](#toDate32)
* [`toDate32OrNull`](#toDate32OrNull)
* [`toDate32OrDefault`](#toDate32OrDefault)

**構文**

```sql
toDate32OrZero(x)
```

**引数**

* `x` — 日付の文字列表現。[`String`](/sql-reference/data-types/string)

**戻り値**

成功した場合は Date32 型の値を返し、それ以外の場合は Date32 の下限値（`1900-01-01`）を返します。[`Date32`](/sql-reference/data-types/date32)

**例**

**使用例**

```sql title=Query
SELECT toDate32OrZero('2025-01-01'), toDate32OrZero('')
```

```response title=Response
┌─toDate32OrZero('2025-01-01')─┬─toDate32OrZero('')─┐
│                   2025-01-01 │         1900-01-01 │
└──────────────────────────────┴────────────────────┘
```


## toDateOrDefault {#toDateOrDefault}

導入バージョン: v21.11

[toDate](#toDate) と同様ですが、変換に失敗した場合はデフォルト値を返します。デフォルト値は第 2 引数が指定されていればその値、指定されていなければ [Date](../data-types/date.md) 型の下限値です。

**構文**

```sql
toDateOrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[`String`](/sql-reference/data-types/string) または [`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float)
* `default` — 省略可能。パースに失敗した場合に返すデフォルト値。[`Date`](/sql-reference/data-types/date)

**戻り値**

変換に成功した場合は型 `Date` の値を返し、失敗した場合は指定されていればデフォルト値を、指定されていなければ 1970-01-01 を返します。[`Date`](/sql-reference/data-types/date)

**例**

**変換が成功する例**

```sql title=Query
SELECT toDateOrDefault('2022-12-30')
```

```response title=Response
2022-12-30
```

**変換に失敗**

```sql title=Query
SELECT toDateOrDefault('', CAST('2023-01-01', 'Date'))
```

```response title=Response
2023-01-01
```


## toDateOrNull {#toDateOrNull}

導入バージョン: v1.1

入力値を `Date` 型の値に変換しますが、不正な引数が渡された場合は `NULL` を返します。
[`toDate`](#toDate) と同様ですが、不正な引数が渡された場合に `NULL` を返します。

**構文**

```sql
toDateOrNull(x)
```

**引数**

* `x` — 日付を表す文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

成功した場合は [`Date`](/sql-reference/data-types/date) の値を返し、それ以外の場合は [`NULL`](/sql-reference/syntax#null) を返します。

**例**

**使用例**

```sql title=Query
SELECT toDateOrNull('2025-12-30'), toDateOrNull('invalid')
```

```response title=Response
┌─toDateOrNull('2025-12-30')─┬─toDateOrNull('invalid')─┐
│                 2025-12-30 │                   ᴺᵁᴸᴸ │
└────────────────────────────┴────────────────────────┘
```


## toDateOrZero {#toDateOrZero}

導入バージョン: v1.1

入力値を[`Date`](../data-types/date.md)型の値に変換しますが、無効な引数が渡された場合は[`Date`](../data-types/date.md)型の最小値を返します。
[toDate](#todate)と同様の動作をしますが、無効な引数が渡された場合に[`Date`](../data-types/date.md)型の最小値を返します。

関連項目:

* [`toDate`](#toDate)
* [`toDateOrNull`](#toDateOrNull)
* [`toDateOrDefault`](#toDateOrDefault)

**構文**

```sql
toDateOrZero(x)
```

**引数**

* `x` — 日付を表す文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

成功した場合は `Date` 型の値を返し、失敗した場合は `Date` 型の下限値（`1970-01-01`）を返します。[`Date`](/sql-reference/data-types/date)

**例**

**使用例**

```sql title=Query
SELECT toDateOrZero('2025-12-30'), toDateOrZero('')
```

```response title=Response
┌─toDateOrZero('2025-12-30')─┬─toDateOrZero('')─┐
│                 2025-12-30 │       1970-01-01 │
└────────────────────────────┴──────────────────┘
```


## toDateTime {#toDateTime}

導入: v1.1

入力値を型 [DateTime](../data-types/datetime.md) に変換します。

:::note
`expr` が数値の場合、Unix エポックの開始からの経過秒数（Unix タイムスタンプ）として解釈されます。
`expr` が [String](../data-types/string.md) の場合、Unix タイムスタンプ、または日付 / 日付と時刻の文字列表現として解釈されることがあります。
そのため、短い数値文字列（4桁以下）のパースは曖昧さのため明示的に無効化されています。たとえば、文字列 `'1999'` は、年（Date / DateTime の不完全な文字列表現）にも、Unix タイムスタンプにもなり得ます。より長い数値文字列は許可されます。
:::

**構文**

```sql
toDateTime(expr[, time_zone])
```

**引数**

* `expr` — 値。[`String`](/sql-reference/data-types/string)、[`Int`](/sql-reference/data-types/int-uint)、[`Date`](/sql-reference/data-types/date)、[`DateTime`](/sql-reference/data-types/datetime) のいずれか。
* `time_zone` — タイムゾーン。[`String`](/sql-reference/data-types/string)

**戻り値**

日時を返します。[`DateTime`](/sql-reference/data-types/datetime)

**例**

**使用例**

```sql title=Query
SELECT toDateTime('2025-01-01 00:00:00'), toDateTime(1735689600, 'UTC')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toDateTime('2025-01-01 00:00:00'): 2025-01-01 00:00:00
toDateTime(1735689600, 'UTC'):     2025-01-01 00:00:00
```


## toDateTime32 {#toDateTime32}

導入バージョン: v20.9

入力値を `DateTime` 型に変換します。
`String`、`FixedString`、`Date`、`Date32`、`DateTime`、または数値型（`(U)Int*`、`Float*`、`Decimal`）からの変換をサポートします。
DateTime32 は `DateTime` と比較してより広い範囲を扱うことができ、`1900-01-01` から `2299-12-31` までの日付をサポートします。

**構文**

```sql
toDateTime32(x[, timezone])
```

**引数**

* `x` — 変換する入力値。[`String`](/sql-reference/data-types/string) または [`FixedString`](/sql-reference/data-types/fixedstring) または [`UInt*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`Date`](/sql-reference/data-types/date) または [`DateTime`](/sql-reference/data-types/datetime) または [`DateTime64`](/sql-reference/data-types/datetime64)
* `timezone` — 省略可能。返される `DateTime` 値のタイムゾーンを表します。[`String`](/sql-reference/data-types/string)

**返される値**

変換後の値を返します。[`DateTime`](/sql-reference/data-types/datetime)

**例**

**値が範囲内にある場合**

```sql title=Query
SELECT toDateTime64('2025-01-01 00:00:00.000', 3) AS value, toTypeName(value);
```

```response title=Response
┌───────────────────value─┬─toTypeName(toDateTime64('20255-01-01 00:00:00.000', 3))─┐
│ 2025-01-01 00:00:00.000 │ DateTime64(3)                                          │
└─────────────────────────┴────────────────────────────────────────────────────────┘
```

**指定した精度の10進数として**

```sql title=Query
SELECT toDateTime64(1735689600.000, 3) AS value, toTypeName(value);
-- without the decimal point the value is still treated as Unix Timestamp in seconds
SELECT toDateTime64(1546300800000, 3) AS value, toTypeName(value);
```

```response title=Response
┌───────────────────value─┬─toTypeName(toDateTime64(1735689600.000, 3))─┐
│ 2025-01-01 00:00:00.000 │ DateTime64(3)                            │
└─────────────────────────┴──────────────────────────────────────────┘
┌───────────────────value─┬─toTypeName(toDateTime64(1546300800000, 3))─┐
│ 2282-12-31 00:00:00.000 │ DateTime64(3)                              │
└─────────────────────────┴────────────────────────────────────────────┘
```

**タイムゾーン付き**

```sql title=Query
SELECT toDateTime64('2025-01-01 00:00:00', 3, 'Asia/Istanbul') AS value, toTypeName(value);
```

```response title=Response
┌───────────────────value─┬─toTypeName(toDateTime64('2025-01-01 00:00:00', 3, 'Asia/Istanbul'))─┐
│ 2025-01-01 00:00:00.000 │ DateTime64(3, 'Asia/Istanbul')                                      │
└─────────────────────────┴─────────────────────────────────────────────────────────────────────┘
```


## toDateTime64 {#toDateTime64}

導入バージョン: v20.1

入力値を [`DateTime64`](../data-types/datetime64.md) 型に変換します。

**構文**

```sql
toDateTime64(expr, scale[, timezone])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式です。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `scale` — ティックサイズ（精度）。10^(-scale) 秒です。[`UInt8`](/sql-reference/data-types/int-uint)
* `timezone` — 省略可能。指定された `DateTime64` オブジェクトのタイムゾーンです。[`String`](/sql-reference/data-types/string)

**戻り値**

サブ秒精度を持つ日付と時刻を返します。[`DateTime64`](/sql-reference/data-types/datetime64)

**使用例**

**値が範囲内の場合**

```sql title=Query
SELECT toDateTime64('2025-01-01 00:00:00.000', 3) AS value, toTypeName(value);
```

```response title=Response
┌───────────────────value─┬─toTypeName(toDateTime64('2025-01-01 00:00:00.000', 3))─┐
│ 2025-01-01 00:00:00.000 │ DateTime64(3)                                          │
└─────────────────────────┴────────────────────────────────────────────────────────┘
```

**精度指定付きの Decimal として**

```sql title=Query
SELECT toDateTime64(1546300800.000, 3) AS value, toTypeName(value);
-- Without the decimal point the value is still treated as Unix Timestamp in seconds
SELECT toDateTime64(1546300800000, 3) AS value, toTypeName(value);
```

```response title=Response
┌───────────────────value─┬─toTypeName(toDateTime64(1546300800000, 3))─┐
│ 2282-12-31 00:00:00.000 │ DateTime64(3)                              │
└─────────────────────────┴────────────────────────────────────────────┘
```

**タイムゾーン付き**

```sql title=Query
SELECT toDateTime64('2025-01-01 00:00:00', 3, 'Asia/Istanbul') AS value, toTypeName(value);
```

```response title=Response
┌───────────────────value─┬─toTypeName(toDateTime64('2025-01-01 00:00:00', 3, 'Asia/Istanbul'))─┐
│ 2025-01-01 00:00:00.000 │ DateTime64(3, 'Asia/Istanbul')                                      │
└─────────────────────────┴─────────────────────────────────────────────────────────────────────┘
```


## toDateTime64OrDefault {#toDateTime64OrDefault}

導入バージョン: v21.11

[toDateTime64](#todatetime64) と同様に、この関数は入力値を [DateTime64](../data-types/datetime64.md) 型の値に変換しますが、
無効な引数が渡された場合には、[DateTime64](../data-types/datetime64.md) のデフォルト値
または指定されたデフォルト値を返します。

**構文**

```sql
toDateTime64OrDefault(expr, scale[, timezone, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[`String`](/sql-reference/data-types/string) または [`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float)
* `scale` — ティックサイズ（精度）：10^-precision 秒。[`UInt8`](/sql-reference/data-types/int-uint)
* `timezone` — 省略可能。タイムゾーン。[`String`](/sql-reference/data-types/string)
* `default` — 省略可能。解析に失敗した場合に返すデフォルト値。[`DateTime64`](/sql-reference/data-types/datetime64)

**戻り値**

成功した場合は `DateTime64` 型の値を返します。失敗した場合は、デフォルト値が指定されていればその値を、指定されていなければ 1970-01-01 00:00:00.000 を返します。[`DateTime64`](/sql-reference/data-types/datetime64)

**使用例**

**成功した変換の例**

```sql title=Query
SELECT toDateTime64OrDefault('1976-10-18 00:00:00.30', 3)
```

```response title=Response
1976-10-18 00:00:00.300
```

**変換に失敗**

```sql title=Query
SELECT toDateTime64OrDefault('1976-10-18 00:00:00 30', 3, 'UTC', toDateTime64('2001-01-01 00:00:00.00',3))
```

```response title=Response
2000-12-31 23:00:00.000
```


## toDateTime64OrNull {#toDateTime64OrNull}

導入バージョン: v20.1

入力値を `DateTime64` 型の値に変換しますが、無効な引数が指定された場合は `NULL` を返します。
`toDateTime64` と同様ですが、無効な引数が指定された場合は `NULL` を返します。

**構文**

```sql
toDateTime64OrNull(x)
```

**引数**

* `x` — 時刻およびサブ秒精度を含む日時の文字列表現。[`String`](/sql-reference/data-types/string)

**戻り値**

成功した場合は DateTime64 型の値を返し、そうでない場合は `NULL` を返します。[`DateTime64`](/sql-reference/data-types/datetime64) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT toDateTime64OrNull('2025-12-30 13:44:17.123'), toDateTime64OrNull('invalid')
```

```response title=Response
┌─toDateTime64OrNull('2025-12-30 13:44:17.123')─┬─toDateTime64OrNull('invalid')─┐
│                         2025-12-30 13:44:17.123 │                          ᴺᵁᴸᴸ │
└─────────────────────────────────────────────────┴───────────────────────────────┘
```


## toDateTime64OrZero {#toDateTime64OrZero}

導入: v20.1

入力値を [DateTime64](../data-types/datetime64.md) 型の値に変換しますが、不正な引数が指定された場合は [DateTime64](../data-types/datetime64.md) の最小値を返します。
これは [toDateTime64](#todatetime64) と同様ですが、不正な引数が指定された場合に [DateTime64](../data-types/datetime64.md) の最小値を返します。

参照:

* [toDateTime64](#toDateTime64)。
* [toDateTime64OrNull](#toDateTime64OrNull)。
* [toDateTime64OrDefault](#toDateTime64OrDefault)。

**構文**

```sql
toDateTime64OrZero(x)
```

**引数**

* `x` — サブ秒精度付きの日時を表す文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

成功した場合は DateTime64 型の値を返し、失敗した場合は DateTime64 型の下限値（`1970-01-01 00:00:00.000`）を返します。[`DateTime64`](/sql-reference/data-types/datetime64)

**例**

**使用例**

```sql title=Query
SELECT toDateTime64OrZero('2025-12-30 13:44:17.123'), toDateTime64OrZero('invalid')
```

```response title=Response
┌─toDateTime64OrZero('2025-12-30 13:44:17.123')─┬─toDateTime64OrZero('invalid')─┐
│                         2025-12-30 13:44:17.123 │             1970-01-01 00:00:00.000 │
└─────────────────────────────────────────────────┴─────────────────────────────────────┘
```


## toDateTimeOrDefault {#toDateTimeOrDefault}

導入バージョン: v21.11

[toDateTime](#todatetime) と同様ですが、変換に失敗した場合はデフォルト値を返します。デフォルト値は、第 3 引数が指定されていればその値、指定されていなければ [DateTime](../data-types/datetime.md) の下限値になります。

**構文**

```sql
toDateTimeOrDefault(expr[, timezone, default])
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[`String`](/sql-reference/data-types/string) または [`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float)
* `timezone` — 省略可。タイムゾーン。[`String`](/sql-reference/data-types/string)
* `default` — 省略可。パースに失敗した場合に返されるデフォルト値。[`DateTime`](/sql-reference/data-types/datetime)

**戻り値**

成功した場合は `DateTime` 型の値を返し、失敗した場合は指定されたデフォルト値を返します。デフォルト値が指定されていない場合は 1970-01-01 00:00:00 を返します。[`DateTime`](/sql-reference/data-types/datetime)

**例**

**変換成功の例**

```sql title=Query
SELECT toDateTimeOrDefault('2022-12-30 13:44:17')
```

```response title=Response
2022-12-30 13:44:17
```

**変換に失敗**

```sql title=Query
SELECT toDateTimeOrDefault('', 'UTC', CAST('2023-01-01', 'DateTime(\'UTC\')'))
```

```response title=Response
2023-01-01 00:00:00
```


## toDateTimeOrNull {#toDateTimeOrNull}

導入バージョン: v1.1

入力値を `DateTime` 型に変換しますが、無効な引数が渡された場合は `NULL` を返します。
[`toDateTime`](#toDateTime) と同様ですが、無効な引数が渡された場合は `NULL` を返します。

**構文**

```sql
toDateTimeOrNull(x)
```

**引数**

* `x` — 日時を表す文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

成功した場合は `DateTime` 値、そうでない場合は `NULL` を返します。[`DateTime`](/sql-reference/data-types/datetime) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT toDateTimeOrNull('2025-12-30 13:44:17'), toDateTimeOrNull('invalid')
```

```response title=Response
┌─toDateTimeOrNull('2025-12-30 13:44:17')─┬─toDateTimeOrNull('invalid')─┐
│                     2025-12-30 13:44:17 │                        ᴺᵁᴸᴸ │
└─────────────────────────────────────────┴─────────────────────────────┘
```


## toDateTimeOrZero {#toDateTimeOrZero}

導入バージョン: v1.1

入力値を [DateTime](../data-types/datetime.md) 型の値に変換します。不正な引数が渡された場合は [DateTime](../data-types/datetime.md) の下限値を返します。
[toDateTime](#todatetime) と同様ですが、不正な引数が渡された場合には [DateTime](../data-types/datetime.md) の下限値を返します。

**構文**

```sql
toDateTimeOrZero(x)
```

**引数**

* `x` — 日時の文字列表現。[`String`](/sql-reference/data-types/string)

**戻り値**

成功した場合は `DateTime` 型の値を返し、失敗した場合は `DateTime` の最小値（`1970-01-01 00:00:00`）を返します。[`DateTime`](/sql-reference/data-types/datetime)

**例**

**使用例**

```sql title=Query
SELECT toDateTimeOrZero('2025-12-30 13:44:17'), toDateTimeOrZero('invalid')
```

```response title=Response
┌─toDateTimeOrZero('2025-12-30 13:44:17')─┬─toDateTimeOrZero('invalid')─┐
│                     2025-12-30 13:44:17 │         1970-01-01 00:00:00 │
└─────────────────────────────────────────┴─────────────────────────────┘
```


## toDecimal128 {#toDecimal128}

導入: v18.12

入力値をスケール `S` を持つ [`Decimal(38, S)`](../data-types/decimal.md) 型の値に変換します。
エラーが発生した場合は例外をスローします。

サポートされる引数:

* 型 (U)Int* の値、またはその文字列表現。
* 型 Float* の値、またはその文字列表現。

サポートされない引数:

* Float* 値 `NaN` および `Inf`（大文字小文字は区別しない）の値、またはその文字列表現。
* 2 進数および 16 進数値の文字列表現（例: `SELECT toDecimal128('0xc0fe', 1);`）。

:::note
`expr` の値が `Decimal128` の範囲 `(-1*10^(38 - S), 1*10^(38 - S))` を超える場合、オーバーフローが発生する可能性があります。
小数部分の桁数が多すぎる場合は、余分な桁は切り捨てられます（丸めは行いません）。
整数部分の桁数が多すぎる場合は、例外が発生します。
:::

:::warning
変換時には余分な桁が切り捨てられ、Float32/Float64 の入力に対しては浮動小数点命令を用いて演算が行われるため、予期しない動作になる可能性があります。
例えば、`toDecimal128(1.15, 2)` の結果は `1.14` になります。これは浮動小数点での 1.15 * 100 が 114.99 となるためです。
演算で内部の整数型を使用するようにするには、String 型の入力を使用できます: `toDecimal128('1.15', 2) = 1.15`
:::

**構文**

```sql
toDecimal128(expr, S)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — 0 から 38 の間のスケールパラメータ。数値の小数部として保持できる桁数を指定します。[`UInt8`](/sql-reference/data-types/int-uint)

**返される値**

型 `Decimal(38, S)` の値を返します。[`Decimal128(S)`](/sql-reference/data-types/decimal)

**例**

**使用例**

```sql title=Query
SELECT
    toDecimal128(99, 1) AS a, toTypeName(a) AS type_a,
    toDecimal128(99.67, 2) AS b, toTypeName(b) AS type_b,
    toDecimal128('99.67', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical
```

```response title=Response
Row 1:
──────
a:      99
type_a: Decimal(38, 1)
b:      99.67
type_b: Decimal(38, 2)
c:      99.67
type_c: Decimal(38, 3)
```


## toDecimal128OrDefault {#toDecimal128OrDefault}

導入: v21.11

[`toDecimal128`](#toDecimal128) と同様に、この関数は入力値を [Decimal(38, S)](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。

**構文**

```sql
toDecimal128OrDefault(expr, S[, default])
```

**引数**

* `expr` — 数値を表す文字列表現。[`String`](/sql-reference/data-types/string)
* `S` — 0 から 38 の間のスケールパラメーター。数値の小数部に許容される桁数を指定します。[`UInt8`](/sql-reference/data-types/int-uint)
* `default` — オプション。Decimal128(S) 型への変換に失敗した場合に返すデフォルト値。[`Decimal128(S)`](/sql-reference/data-types/decimal)

**戻り値**

変換に成功した場合は Decimal(38, S) 型の値を返します。失敗した場合は、指定されていればデフォルト値を、指定されていなければ 0 を返します。[`Decimal128(S)`](/sql-reference/data-types/decimal)

**使用例**

**変換が成功する例**

```sql title=Query
SELECT toDecimal128OrDefault(toString(1/42), 18)
```

```response title=Response
0.023809523809523808
```

**変換失敗**

```sql title=Query
SELECT toDecimal128OrDefault('Inf', 0, CAST('-1', 'Decimal128(0)'))
```

```response title=Response
-1
```


## toDecimal128OrNull {#toDecimal128OrNull}

導入バージョン: v20.1

入力値を型 [`Decimal(38, S)`](../data-types/decimal.md) の値に変換しますが、エラー時には `NULL` を返します。
[`toDecimal128`](#toDecimal128) と同様ですが、変換エラー時に例外をスローする代わりに `NULL` を返します。

サポートされる引数:

* 型 (U)Int* の値、またはその文字列表現。
* 型 Float* の値、またはその文字列表現。

サポートされない引数（`NULL` を返す）:

* Float* 型の `NaN` および `Inf`（大文字小文字は区別しない）の値、またはその文字列表現。
* 2 進数および 16 進数値の文字列表現。
* `Decimal128` の範囲 `(-1*10^(38 - S), 1*10^(38 - S))` を超える値。

関連項目:

* [`toDecimal128`](#toDecimal128).
* [`toDecimal128OrZero`](#toDecimal128OrZero).
* [`toDecimal128OrDefault`](#toDecimal128OrDefault).

**構文**

```sql
toDecimal128OrNull(expr, S)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — 0 から 38 の間のスケールパラメータ。数値の小数部が持てる桁数を指定します。[`UInt8`](/sql-reference/data-types/int-uint)

**返される値**

成功した場合は Decimal(38, S) の値、それ以外の場合は `NULL` を返します。[`Decimal128(S)`](/sql-reference/data-types/decimal) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT toDecimal128OrNull('42.7', 2), toDecimal128OrNull('invalid', 2)
```

```response title=Response
┌─toDecimal128OrNull('42.7', 2)─┬─toDecimal128OrNull('invalid', 2)─┐
│                         42.70 │                             ᴺᵁᴸᴸ │
└───────────────────────────────┴──────────────────────────────────┘
```


## toDecimal128OrZero {#toDecimal128OrZero}

導入バージョン: v20.1

入力値を型 [Decimal(38, S)](../data-types/decimal.md) の値に変換しますが、エラー時には `0` を返します。
[`toDecimal128`](#todecimal128) と同様ですが、変換エラー時に例外をスローする代わりに `0` を返します。

サポートされる引数:

* (U)Int* 型の値、またはその文字列表現。
* Float* 型の値、またはその文字列表現。

サポートされない引数（`0` を返す）:

* Float* 型の `NaN` および `Inf` 値、またはそれらの文字列表現（大文字小文字は区別しない）。
* 2進数および16進数値の文字列表現。

:::note
入力値が `Decimal128` の範囲 `(-1*10^(38 - S), 1*10^(38 - S))` を超える場合、この関数は `0` を返します。
:::

**構文**

```sql
toDecimal128OrZero(expr, S)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — 0 から 38 の範囲のスケールパラメーター。数値の小数部が持つことができる桁数を指定します。[`UInt8`](/sql-reference/data-types/int-uint)

**戻り値**

変換に成功した場合は Decimal(38, S) の値を返し、そうでない場合は `0` を返します。[`Decimal128(S)`](/sql-reference/data-types/decimal)

**例**

**基本的な使用方法**

```sql title=Query
SELECT toDecimal128OrZero('42.7', 2), toDecimal128OrZero('invalid', 2)
```

```response title=Response
┌─toDecimal128OrZero('42.7', 2)─┬─toDecimal128OrZero('invalid', 2)─┐
│                         42.70 │                             0.00 │
└───────────────────────────────┴──────────────────────────────────┘
```


## toDecimal256 {#toDecimal256}

導入バージョン: v20.8

入力値を、スケール `S` を持つ [`Decimal(76, S)`](../data-types/decimal.md) 型の値に変換します。エラーが発生した場合は例外をスローします。

サポートされる引数:

* 型が (U)Int* の値、またはその文字列表現。
* 型が Float* の値、またはその文字列表現。

サポートされない引数:

* Float* 型の値 `NaN` および `Inf`（大文字・小文字は区別しません）、またはその文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toDecimal256('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal256` の範囲 `(-1*10^(76 - S), 1*10^(76 - S))` を超えると、オーバーフローが発生する可能性があります。
小数部に過剰な桁がある場合、それらは切り捨てられます（四捨五入はされません）。
整数部に過剰な桁がある場合は例外が発生します。
:::

:::warning
変換では余分な桁が切り捨てられ、演算が浮動小数点命令を用いて実行されるため、Float32/Float64 の入力を扱う場合に予期しない動作をすることがあります。
例えば、`toDecimal256(1.15, 2)` は `1.14` と等しくなります。これは、浮動小数点では 1.15 * 100 が 114.99 となるためです。
String を入力として使用することで、演算に内部の整数型を用いることができます: `toDecimal256('1.15', 2) = 1.15`
:::

**構文**

```sql
toDecimal256(expr, S)
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — 0〜76 の範囲のスケールパラメータで、数値の小数部が取りうる桁数を指定します。[`UInt8`](/sql-reference/data-types/int-uint)

**戻り値**

型 `Decimal(76, S)` の値を返します。[`Decimal256(S)`](/sql-reference/data-types/decimal)

**例**

**使用例**

```sql title=Query
SELECT
    toDecimal256(99, 1) AS a, toTypeName(a) AS type_a,
    toDecimal256(99.67, 2) AS b, toTypeName(b) AS type_b,
    toDecimal256('99.67', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical
```

```response title=Response
Row 1:
──────
a:      99
type_a: Decimal(76, 1)
b:      99.67
type_b: Decimal(76, 2)
c:      99.67
type_c: Decimal(76, 3)
```


## toDecimal256OrDefault {#toDecimal256OrDefault}

導入バージョン: v21.11

[`toDecimal256`](#toDecimal256) と同様に、この関数は入力値を型 [Decimal(76, S)](../data-types/decimal.md) の値に変換しますが、エラーが発生した場合にはデフォルト値を返します。

**構文**

```sql
toDecimal256OrDefault(expr, S[, default])
```

**引数**

* `expr` — 数値の文字列表現。[`String`](/sql-reference/data-types/string)
* `S` — 0 から 76 の間のスケールパラメーター。数値の小数部が取り得る桁数を指定します。[`UInt8`](/sql-reference/data-types/int-uint)
* `default` — オプション。文字列を Decimal256(S) 型にパースする際に失敗した場合に返すデフォルト値。[`Decimal256(S)`](/sql-reference/data-types/decimal)

**戻り値**

成功した場合は Decimal(76, S) 型の値を返します。失敗した場合は、デフォルト値が指定されていればそれを返し、指定されていなければ 0 を返します。[`Decimal256(S)`](/sql-reference/data-types/decimal)

**使用例**

**正常に変換できる場合**

```sql title=Query
SELECT toDecimal256OrDefault(toString(1/42), 76)
```

```response title=Response
0.023809523809523808
```

**変換失敗**

```sql title=Query
SELECT toDecimal256OrDefault('Inf', 0, CAST('-1', 'Decimal256(0)'))
```

```response title=Response
-1
```


## toDecimal256OrNull {#toDecimal256OrNull}

導入バージョン: v20.8

入力値を型 [`Decimal(76, S)`](../data-types/decimal.md) の値に変換しますが、エラーが発生した場合は `NULL` を返します。
[`toDecimal256`](#toDecimal256) と似ていますが、変換エラー時に例外をスローする代わりに `NULL` を返します。

サポートされる引数:

* 型 (U)Int* の値、またはその文字列表現。
* 型 Float* の値、またはその文字列表現。

サポートされない引数（`NULL` を返す）:

* Float* 値 `NaN` および `Inf` の文字列表現（大文字小文字を区別しない）。
* 2進数および16進数値の文字列表現。
* `Decimal256` の範囲を超える値: `(-1 * 10^(76 - S), 1 * 10^(76 - S))`。

関連項目:

* [`toDecimal256`](#toDecimal256)。
* [`toDecimal256OrZero`](#toDecimal256OrZero)。
* [`toDecimal256OrDefault`](#toDecimal256OrDefault)。

**構文**

```sql
toDecimal256OrNull(expr, S)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — 0 から 76 の間のスケールを表すパラメータで、数値の小数部が持つことができる桁数を指定します。[`UInt8`](/sql-reference/data-types/int-uint)

**戻り値**

変換に成功した場合は Decimal(76, S) の値を返し、それ以外の場合は `NULL` を返します。[`Decimal256(S)`](/sql-reference/data-types/decimal) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT toDecimal256OrNull('42.7', 2), toDecimal256OrNull('invalid', 2)
```

```response title=Response
┌─toDecimal256OrNull('42.7', 2)─┬─toDecimal256OrNull('invalid', 2)─┐
│                         42.70 │                             ᴺᵁᴸᴸ │
└───────────────────────────────┴──────────────────────────────────┘
```


## toDecimal256OrZero {#toDecimal256OrZero}

導入バージョン: v20.8

入力値を型 [Decimal(76, S)](../data-types/decimal.md) の値に変換しますが、エラーが発生した場合は `0` を返します。
[`toDecimal256`](#todecimal256) と同様ですが、変換エラー時に例外をスローする代わりに `0` を返します。

サポートされる引数:

* 型 (U)Int* の値、またはその文字列表現。
* 型 Float* の値、またはその文字列表現。

サポートされない引数（`0` を返す）:

* Float* 型の `NaN` および `Inf` の値、またはそれらの文字列表現（大文字小文字は区別しない）。
* 2 進数および 16 進数の値の文字列表現。

:::note
入力値が `Decimal256` の範囲 `(-1*10^(76 - S), 1*10^(76 - S))` を超える場合、関数は `0` を返します。
:::

参照:

* [`toDecimal256`](#toDecimal256)。
* [`toDecimal256OrNull`](#toDecimal256OrNull)。
* [`toDecimal256OrDefault`](#toDecimal256OrDefault)。

**構文**

```sql
toDecimal256OrZero(expr, S)
```

**引数**

* `expr` — 評価結果として数値、または数値の文字列表現を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — 0〜76 の範囲のスケールパラメータで、数値の小数部が取り得る桁数を指定します。[`UInt8`](/sql-reference/data-types/int-uint)

**返される値**

成功した場合は Decimal(76, S) 型の値を返し、失敗した場合は `0` を返します。[`Decimal256(S)`](/sql-reference/data-types/decimal)

**例**

**使用例**

```sql title=Query
SELECT toDecimal256OrZero('42.7', 2), toDecimal256OrZero('invalid', 2)
```

```response title=Response
┌─toDecimal256OrZero('42.7', 2)─┬─toDecimal256OrZero('invalid', 2)─┐
│                         42.70 │                             0.00 │
└───────────────────────────────┴──────────────────────────────────┘
```


## toDecimal32 {#toDecimal32}

導入バージョン: v18.12

入力値を、スケール `S` を持つ型 [`Decimal(9, S)`](../data-types/decimal.md) の値に変換します。エラーが発生した場合は例外をスローします。

サポートされる引数:

* 型 (U)Int* の値、またはその文字列表現。
* 型 Float* の値、またはその文字列表現。

サポートされない引数:

* Float* の `NaN` および `Inf` の値、またはその文字列表現（大文字小文字は区別されません）。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toDecimal32('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal32` の範囲 `(-1*10^(9 - S), 1*10^(9 - S))` を超えると、オーバーフローが発生する可能性があります。
小数部で桁数が多すぎる場合、その余分な桁は切り捨てられます（四捨五入はされません）。
整数部で桁数が多すぎる場合は、例外が発生します。
:::

:::warning
変換時に余分な桁は切り捨てられ、Float32/Float64 入力を扱う場合、演算が浮動小数点命令で実行されるため、想定外の動作をする可能性があります。
例えば、`toDecimal32(1.15, 2)` は `1.14` と等しくなります。これは浮動小数点において 1.15 * 100 が 114.99 となるためです。
String 型の入力を使用すると、演算は内部の整数型を利用して行われます: `toDecimal32('1.15', 2) = 1.15`
:::

**構文**

```sql
toDecimal32(expr, S)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — 0 から 9 の間のスケールパラメータで、数値の小数部に許容される桁数を指定します。[`UInt8`](/sql-reference/data-types/int-uint)

**戻り値**

戻り値の型は `Decimal(9, S)`（[`Decimal32(S)`](/sql-reference/data-types/decimal)）です。

**例**

**使用例**

```sql title=Query
SELECT
    toDecimal32(2, 1) AS a, toTypeName(a) AS type_a,
    toDecimal32(4.2, 2) AS b, toTypeName(b) AS type_b,
    toDecimal32('4.2', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical
```

```response title=Response
Row 1:
──────
a:      2
type_a: Decimal(9, 1)
b:      4.2
type_b: Decimal(9, 2)
c:      4.2
type_c: Decimal(9, 3)
```


## toDecimal32OrDefault {#toDecimal32OrDefault}

導入バージョン: v21.11

[`toDecimal32`](#toDecimal32) と同様に、この関数は入力値を [Decimal(9, S)](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。

**構文**

```sql
toDecimal32OrDefault(expr, S[, default])
```

**引数**

* `expr` — 数値を表す文字列。[`String`](/sql-reference/data-types/string)
* `S` — 0 から 9 の間のスケールパラメータ。数値の小数部が取り得る桁数の上限を指定します。[`UInt8`](/sql-reference/data-types/int-uint)
* `default` — 省略可能。型 Decimal32(S) への変換に失敗した場合に返すデフォルト値。[`Decimal32(S)`](/sql-reference/data-types/decimal)

**戻り値**

成功した場合は型 Decimal(9, S) の値を返します。失敗した場合は、デフォルト値が渡されていればその値を、渡されていなければ 0 を返します。[`Decimal32(S)`](/sql-reference/data-types/decimal)

**例**

**変換が成功する例**

```sql title=Query
SELECT toDecimal32OrDefault(toString(0.0001), 5)
```

```response title=Response
0.0001
```

**変換が失敗した場合**

```sql title=Query
SELECT toDecimal32OrDefault('Inf', 0, CAST('-1', 'Decimal32(0)'))
```

```response title=Response
-1
```


## toDecimal32OrNull {#toDecimal32OrNull}

導入バージョン: v20.1

入力値を [`Decimal(9, S)`](../data-types/decimal.md) 型の値に変換しますが、エラー時には `NULL` を返します。
[`toDecimal32`](#toDecimal32) と同様ですが、変換エラー時に例外をスローする代わりに `NULL` を返します。

サポートされる引数:

* 型 (U)Int* の値、またはその文字列表現。
* 型 Float* の値、またはその文字列表現。

サポートされない引数（`NULL` を返す）:

* Float* 値 `NaN` および `Inf`、またはそれらの文字列表現（大文字小文字を区別しない）。
* 2 進数および 16 進数値の文字列表現。
* `Decimal32` の範囲を超える値: `(-1*10^(9 - S), 1*10^(9 - S))`。

関連項目:

* [`toDecimal32`](#toDecimal32)。
* [`toDecimal32OrZero`](#toDecimal32OrZero)。
* [`toDecimal32OrDefault`](#toDecimal32OrDefault)。

**構文**

```sql
toDecimal32OrNull(expr, S)
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — 0 から 9 の範囲のスケールパラメータで、数値の小数部に許容される桁数を指定します。[`UInt8`](/sql-reference/data-types/int-uint)

**戻り値**

成功すると Decimal(9, S) の値を返し、そうでない場合は `NULL` を返します。[`Decimal32(S)`](/sql-reference/data-types/decimal) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT toDecimal32OrNull('42.7', 2), toDecimal32OrNull('invalid', 2)
```

```response title=Response
┌─toDecimal32OrNull('42.7', 2)─┬─toDecimal32OrNull('invalid', 2)─┐
│                        42.70 │                            ᴺᵁᴸᴸ │
└──────────────────────────────┴─────────────────────────────────┘
```


## toDecimal32OrZero {#toDecimal32OrZero}

導入バージョン: v20.1

入力値を型 [Decimal(9, S)](../data-types/decimal.md) の値に変換しますが、エラー時には `0` を返します。
[`toDecimal32`](#todecimal32) と同様ですが、変換エラー時に例外をスローする代わりに `0` を返します。

サポートされる引数:

* 型 (U)Int* の値、またはその文字列表現。
* 型 Float* の値、またはその文字列表現。

サポートされない引数（`0` を返す）:

* 型 Float* の `NaN` および `Inf` の値（大文字小文字は問わない）、またはその文字列表現。
* バイナリ値および 16 進数値の文字列表現。

:::note
入力値が `Decimal32` の範囲 `(-1*10^(9 - S), 1*10^(9 - S))` を超える場合、この関数は `0` を返します。
:::

**構文**

```sql
toDecimal32OrZero(expr, S)
```

**引数**

* `expr` — 数値または数値を表す文字列を返す式です。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — 0 ～ 9 の範囲のスケールパラメーターで、数値の小数部が持つことのできる桁数を指定します。[`UInt8`](/sql-reference/data-types/int-uint)

**返される値**

成功した場合は Decimal(9, S) 型の値を返し、そうでない場合は `0` を返します。[`Decimal32(S)`](/sql-reference/data-types/decimal)

**例**

**使用例**

```sql title=Query
SELECT toDecimal32OrZero('42.7', 2), toDecimal32OrZero('invalid', 2)
```

```response title=Response
┌─toDecimal32OrZero('42.7', 2)─┬─toDecimal32OrZero('invalid', 2)─┐
│                        42.70 │                            0.00 │
└──────────────────────────────┴─────────────────────────────────┘
```


## toDecimal64 {#toDecimal64}

導入: v18.12

入力値をスケール `S` を持つ [`Decimal(18, S)`](../data-types/decimal.md) 型の値に変換します。
エラーが発生した場合は例外をスローします。

サポートされる引数:

* 型 (U)Int* の値、またはその文字列表現。
* 型 Float* の値、またはその文字列表現。

サポートされない引数:

* Float* の `NaN` および `Inf` の値、またはそれらの文字列表現（大文字小文字は区別しません）。
* 2進数および16進数値の文字列表現。例: `SELECT toDecimal64('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal64` の範囲 `(-1*10^(18 - S), 1*10^(18 - S))` を超える場合、オーバーフローが発生する可能性があります。
小数部分の桁数が多すぎる場合は、その余分な桁は切り捨てられます（四捨五入はされません）。
整数部分の桁数が多すぎる場合は、例外が発生します。
:::

:::warning
変換では余分な桁が切り捨てられ、演算が浮動小数点命令で実行されるため、Float32/Float64 の入力を扱う際に予期しない動作になる可能性があります。
たとえば、`toDecimal64(1.15, 2)` は `1.14` と等しくなります。これは、浮動小数点における 1.15 * 100 が 114.99 となるためです。
内部の整数型を使って演算を行うには、文字列入力を使用できます: `toDecimal64('1.15', 2) = 1.15`
:::

**構文**

```sql
toDecimal64(expr, S)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — 0 から 18 までのスケールパラメータで、数値の小数部が持てる桁数を指定します。[`UInt8`](/sql-reference/data-types/int-uint)

**戻り値**

Decimal 型の値を返します。[`Decimal(18, S)`](/sql-reference/data-types/decimal)

**例**

**使用例**

```sql title=Query
SELECT
    toDecimal64(2, 1) AS a, toTypeName(a) AS type_a,
    toDecimal64(4.2, 2) AS b, toTypeName(b) AS type_b,
    toDecimal64('4.2', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical
```

```response title=Response
Row 1:
──────
a:      2.0
type_a: Decimal(18, 1)
b:      4.20
type_b: Decimal(18, 2)
c:      4.200
type_c: Decimal(18, 3)
```


## toDecimal64OrDefault {#toDecimal64OrDefault}

導入バージョン: v21.11

[`toDecimal64`](#toDecimal64) と同様に、この関数は入力値を [Decimal(18, S)](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。

**構文**

```sql
toDecimal64OrDefault(expr, S[, default])
```

**引数**

* `expr` — 数値の文字列表現。[`String`](/sql-reference/data-types/string)
* `S` — 0 から 18 の間のスケールパラメーター。数値の小数部が取りうる桁数を指定します。[`UInt8`](/sql-reference/data-types/int-uint)
* `default` — 省略可能。型 Decimal64(S) への変換に失敗した場合に返すデフォルト値。[`Decimal64(S)`](/sql-reference/data-types/decimal)

**返される値**

成功した場合は Decimal(18, S) 型の値を返します。失敗した場合は、デフォルト値が指定されていればその値を、指定されていなければ 0 を返します。[`Decimal64(S)`](/sql-reference/data-types/decimal)

**例**

**変換が成功する例**

```sql title=Query
SELECT toDecimal64OrDefault(toString(0.0001), 18)
```

```response title=Response
0.0001
```

**変換に失敗**

```sql title=Query
SELECT toDecimal64OrDefault('Inf', 0, CAST('-1', 'Decimal64(0)'))
```

```response title=Response
-1
```


## toDecimal64OrNull {#toDecimal64OrNull}

導入バージョン: v20.1

入力値を型 [Decimal(18, S)](../data-types/decimal.md) の値に変換しますが、エラーが発生した場合は `NULL` を返します。
[`toDecimal64`](#todecimal64) と同様ですが、変換エラー時に例外をスローする代わりに `NULL` を返します。

サポートされる引数:

* 型 (U)Int* の値、またはその文字列表現。
* 型 Float* の値、またはその文字列表現。

サポートされない引数（`NULL` を返す）:

* Float* 型値 `NaN` および `Inf` の文字列表現（大文字・小文字を区別しない）。
* 2 進数および 16 進数値の文字列表現。
* `Decimal64` の範囲 `(-1*10^(18 - S), 1*10^(18 - S))` を超える値。

参照:

* [`toDecimal64`](#toDecimal64)。
* [`toDecimal64OrZero`](#toDecimal64OrZero)。
* [`toDecimal64OrDefault`](#toDecimal64OrDefault)。

**構文**

```sql
toDecimal64OrNull(expr, S)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — 0〜18 の範囲のスケールパラメータで、数値の小数部が取りうる桁数を指定します。[`UInt8`](/sql-reference/data-types/int-uint)

**戻り値**

成功した場合は Decimal(18, S) 型の値を返し、それ以外の場合は `NULL` を返します。[`Decimal64(S)`](/sql-reference/data-types/decimal) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT toDecimal64OrNull('42.7', 2), toDecimal64OrNull('invalid', 2)
```

```response title=Response
┌─toDecimal64OrNull('42.7', 2)─┬─toDecimal64OrNull('invalid', 2)─┐
│                        42.70 │                            ᴺᵁᴸᴸ │
└──────────────────────────────┴─────────────────────────────────┘
```


## toDecimal64OrZero {#toDecimal64OrZero}

導入バージョン: v20.1

入力値を [Decimal(18, S)](../data-types/decimal.md) 型の値に変換します。エラーの場合は `0` を返します。
[`toDecimal64`](#todecimal64) と同様ですが、変換エラー時に例外をスローする代わりに `0` を返します。

サポートされる引数:

* 型 (U)Int* の値、またはその文字列表現。
* 型 Float* の値、またはその文字列表現。

サポートされない引数（`0` を返す）:

* Float* 値 `NaN` および `Inf` の文字列表現（大文字小文字を区別しません）。
* 2進数および16進数値の文字列表現。

:::note
入力値が `Decimal64` の範囲 `(-1*10^(18 - S), 1*10^(18 - S))` を超える場合、この関数は `0` を返します。
:::

関連項目:

* [`toDecimal64`](#toDecimal64)。
* [`toDecimal64OrNull`](#toDecimal64OrNull)。
* [`toDecimal64OrDefault`](#toDecimal64OrDefault)。

**構文**

```sql
toDecimal64OrZero(expr, S)
```

**引数**

* `expr` — 数値または数値の文字列表現を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — 0 から 18 の範囲のスケールパラメータで、数値の小数部として持てる桁数を指定します。[`UInt8`](/sql-reference/data-types/int-uint)

**返される値**

成功した場合は Decimal(18, S) 型の値を返し、失敗した場合は `0` を返します。[`Decimal64(S)`](/sql-reference/data-types/decimal)

**例**

**使用例**

```sql title=Query
SELECT toDecimal64OrZero('42.7', 2), toDecimal64OrZero('invalid', 2)
```

```response title=Response
┌─toDecimal64OrZero('42.7', 2)─┬─toDecimal64OrZero('invalid', 2)─┐
│                        42.70 │                            0.00 │
└──────────────────────────────┴─────────────────────────────────┘
```


## toDecimalString {#toDecimalString}

導入バージョン: v

数値の文字列表現を返します。第1引数は任意の数値型の値で、
第2引数は小数部の桁数を指定します。戻り値は String です。

**構文**

```sql
```

**引数**

* なし。

**戻り値**

**例**

**toDecimalString**

```sql title=Query
SELECT toDecimalString(2.1456,2)
```

```response title=Response
```


## toFixedString {#toFixedString}

導入されたバージョン: v1.1

[`String`](/sql-reference/data-types/string) 引数を [`FixedString(N)`](/sql-reference/data-types/fixedstring) 型（長さ N の固定長文字列）に変換します。

文字列のバイト数が N 未満の場合は、右側がヌルバイトで埋められます。
文字列のバイト数が N を超える場合は、例外がスローされます。

**構文**

```sql
toFixedString(s, N)
```

**引数**

* `s` — 変換対象の文字列。[`String`](/sql-reference/data-types/string)
* `N` — 返される FixedString の長さ。[`const UInt*`](/sql-reference/data-types/int-uint)

**戻り値**

長さ N の FixedString を返します。[`FixedString(N)`](/sql-reference/data-types/fixedstring)

**例**

**使用例**

```sql title=Query
SELECT toFixedString('foo', 8) AS s;
```

```response title=Response
┌─s─────────────┐
│ foo\0\0\0\0\0 │
└───────────────┘
```


## toFloat32 {#toFloat32}

導入バージョン: v1.1

入力値を [Float32](/sql-reference/data-types/float) 型の値に変換します。
エラーが発生した場合は例外をスローします。

サポートされている引数:

* (U)Int* 型の値。
* (U)Int8/16/32/128/256 の文字列表現。
* `NaN` および `Inf` を含む Float* 型の値。
* `NaN` および `Inf` を含む Float* の文字列表現（大文字・小文字は区別しません）。

サポートされていない引数:

* 2進数および16進数の文字列表現（例: `SELECT toFloat32('0xc0fe');`）。

関連項目:

* [`toFloat32OrZero`](#toFloat32OrZero)。
* [`toFloat32OrNull`](#toFloat32OrNull)。
* [`toFloat32OrDefault`](#toFloat32OrDefault)。

**構文**

```sql
toFloat32(expr)
```

**引数**

* `expr` — 数値または数値を表す文字列を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**戻り値**

32 ビットの浮動小数点数を返します。[`Float32`](/sql-reference/data-types/float)

**例**

**使用例**

```sql title=Query
SELECT
    toFloat32(42.7),
    toFloat32('42.7'),
    toFloat32('NaN')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toFloat32(42.7):   42.7
toFloat32('42.7'): 42.7
toFloat32('NaN'):  nan
```


## toFloat32OrDefault {#toFloat32OrDefault}

導入バージョン: v21.11

[`toFloat32`](#toFloat32) と同様に、この関数は入力値を [Float32](../data-types/float.md) 型の値に変換しますが、エラーが発生した場合にはデフォルト値を返します。
`default` 値が指定されていない場合、エラー時には `0` が返されます。

**構文**

```sql
toFloat32OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列表現を返す式。[`String`](/sql-reference/data-types/string) または [`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float)
* `default` — 省略可能。変換に失敗した場合に返すデフォルト値。[`Float32`](/sql-reference/data-types/float)

**返り値**

変換に成功した場合は Float32 型の値を返し、失敗した場合は指定されていればデフォルト値を、指定されていなければ 0 を返します。[`Float32`](/sql-reference/data-types/float)

**例**

**変換が成功する例**

```sql title=Query
SELECT toFloat32OrDefault('8', CAST('0', 'Float32'))
```

```response title=Response
8
```

**変換に失敗**

```sql title=Query
SELECT toFloat32OrDefault('abc', CAST('0', 'Float32'))
```

```response title=Response
0
```


## toFloat32OrNull {#toFloat32OrNull}

導入: v1.1

入力値を [Float32](../data-types/float.md) 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。
[`toFloat32`](#toFloat32) と同様ですが、変換エラー時に例外をスローする代わりに `NULL` を返します。

サポートされる引数:

* (U)Int* 型の値。
* (U)Int8/16/32/128/256 の文字列表現。
* `NaN` および `Inf` を含む Float* 型の値。
* `NaN` および `Inf` を含む Float* の文字列表現（大文字・小文字を区別しない）。

サポートされない引数（`NULL` を返す）:

* 2 進数および 16 進数値の文字列表現。例: `SELECT toFloat32OrNull('0xc0fe');`。
* 無効な文字列形式。

関連項目:

* [`toFloat32`](#toFloat32)。
* [`toFloat32OrZero`](#toFloat32OrZero)。
* [`toFloat32OrDefault`](#toFloat32OrDefault)。

**構文**

```sql
toFloat32OrNull(x)
```

**引数**

* `x` — 数値を表す文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

成功した場合は 32 ビットの浮動小数点数を返し、失敗した場合は `NULL` を返します。[`Float32`](/sql-reference/data-types/float) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT
    toFloat32OrNull('42.7'),
    toFloat32OrNull('NaN'),
    toFloat32OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toFloat32OrNull('42.7'): 42.7
toFloat32OrNull('NaN'):  nan
toFloat32OrNull('abc'):  \N
```


## toFloat32OrZero {#toFloat32OrZero}

導入: v1.1

入力値を [Float32](../data-types/float.md) 型の値に変換しますが、エラーが発生した場合には `0` を返します。
[`toFloat32`](#tofloat32) と同様ですが、変換エラー時に例外をスローする代わりに `0` を返します。

関連項目:

* [`toFloat32`](#toFloat32)。
* [`toFloat32OrNull`](#toFloat32OrNull)。
* [`toFloat32OrDefault`](#toFloat32OrDefault)。

**構文**

```sql
toFloat32OrZero(x)
```

**引数**

* `x` — 数値を表す文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

成功した場合は 32 ビットの Float 値を返し、失敗した場合は `0` を返します。[`Float32`](/sql-reference/data-types/float)

**例**

**使用例**

```sql title=Query
SELECT
    toFloat32OrZero('42.7'),
    toFloat32OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toFloat32OrZero('42.7'): 42.7
toFloat32OrZero('abc'):  0
```


## toFloat64 {#toFloat64}

導入バージョン: v1.1

入力値を [`Float64`](../data-types/float.md) 型の値に変換します。
エラーが発生した場合は例外をスローします。

サポートされる引数:

* (U)Int* 型の値。
* (U)Int8/16/32/128/256 の文字列表現。
* Float* 型の値（`NaN` および `Inf` を含む）。
* Float* 型の文字列表現（`NaN` および `Inf` を含む。大文字小文字は区別しません）。

サポートされない引数:

* 2進数および16進数値の文字列表現（例: `SELECT toFloat64('0xc0fe');`）。

関連項目:

* [`toFloat64OrZero`](#toFloat64OrZero)。
* [`toFloat64OrNull`](#toFloat64OrNull)。
* [`toFloat64OrDefault`](#toFloat64OrDefault)。

**構文**

```sql
toFloat64(expr)
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**戻り値**

64 ビット浮動小数点数を返します。[`Float64`](/sql-reference/data-types/float)

**例**

**使用例**

```sql title=Query
SELECT
    toFloat64(42.7),
    toFloat64('42.7'),
    toFloat64('NaN')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toFloat64(42.7):   42.7
toFloat64('42.7'): 42.7
toFloat64('NaN'):  nan
```


## toFloat64OrDefault {#toFloat64OrDefault}

導入: v21.11

[`toFloat64`](#toFloat64) と同様に、この関数は入力値を [Float64](../data-types/float.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 値が指定されていない場合、エラー時には `0` が返されます。

**構文**

```sql
toFloat64OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[`String`](/sql-reference/data-types/string) または [`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float)
* `default` — 省略可。パースに失敗した場合に返すデフォルト値。[`Float64`](/sql-reference/data-types/float)

**戻り値**

成功した場合は型 Float64 の値を返し、失敗した場合は `default` が指定されていればその値を、指定されていない場合は 0 を返します。[`Float64`](/sql-reference/data-types/float)

**例**

**変換が成功する例**

```sql title=Query
SELECT toFloat64OrDefault('8', CAST('0', 'Float64'))
```

```response title=Response
8
```

**変換に失敗**

```sql title=Query
SELECT toFloat64OrDefault('abc', CAST('0', 'Float64'))
```

```response title=Response
0
```


## toFloat64OrNull {#toFloat64OrNull}

導入バージョン: v1.1

入力値を [Float64](../data-types/float.md) 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。
[`toFloat64`](#tofloat64) と同様ですが、変換エラー時に例外をスローする代わりに `NULL` を返します。

サポートされる引数:

* (U)Int* 型の値。
* (U)Int8/16/32/128/256 の文字列表現。
* `NaN` および `Inf` を含む Float* 型の値。
* `NaN` および `Inf` を含む Float* 型の文字列表現（大文字小文字を区別しない）。

サポートされない引数（`NULL` を返す）:

* バイナリ値および 16 進値の文字列表現。例: `SELECT toFloat64OrNull('0xc0fe');`
* 無効な文字列形式。

関連項目:

* [`toFloat64`](#toFloat64)。
* [`toFloat64OrZero`](#toFloat64OrZero)。
* [`toFloat64OrDefault`](#toFloat64OrDefault)。

**構文**

```sql
toFloat64OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[`String`](/sql-reference/data-types/string)

**戻り値**

変換に成功した場合は 64 ビットの Float 値を返し、失敗した場合は `NULL` を返します。[`Float64`](/sql-reference/data-types/float) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT
    toFloat64OrNull('42.7'),
    toFloat64OrNull('NaN'),
    toFloat64OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toFloat64OrNull('42.7'): 42.7
toFloat64OrNull('NaN'):  nan
toFloat64OrNull('abc'):  \N
```


## toFloat64OrZero {#toFloat64OrZero}

導入バージョン: v1.1

入力値を [Float64](../data-types/float.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。
[`toFloat64`](#toFloat64) と同様ですが、変換エラー時に例外をスローする代わりに `0` を返します。

関連項目:

* [`toFloat64`](#toFloat64)。
* [`toFloat64OrNull`](#toFloat64OrNull)。
* [`toFloat64OrDefault`](#toFloat64OrDefault)。

**構文**

```sql
toFloat64OrZero(x)
```

**引数**

* `x` — 数値を表す文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

成功した場合は 64 ビットの Float 値を返し、失敗した場合は `0` を返します。[`Float64`](/sql-reference/data-types/float)

**例**

**使用例**

```sql title=Query
SELECT
    toFloat64OrZero('42.7'),
    toFloat64OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toFloat64OrZero('42.7'): 42.7
toFloat64OrZero('abc'):  0
```


## toInt128 {#toInt128}

導入バージョン: v1.1

入力値を型 [Int128](/sql-reference/data-types/int-uint) の値に変換します。
エラーが発生した場合は例外をスローします。
この関数は 0 に向かう丸め（ゼロ方向への丸め）を行い、数値の小数桁を切り捨てます。

サポートされる引数:

* (U)Int* 型の値、またはその文字列表現。
* Float* 型の値。

サポートされない引数:

* `NaN` や `Inf` を含む、Float* 値の文字列表現。
* `SELECT toInt128('0xc0fe');` のような、バイナリ値および 16 進値の文字列表現。

:::note
入力値が Int128 の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

関連項目:

* [`toInt128OrZero`](#toInt128OrZero)
* [`toInt128OrNull`](#toInt128OrNull)
* [`toInt128OrDefault`](#toInt128OrDefault)

**構文**

```sql
toInt128(expr)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**返される値**

128 ビット整数値を返します。[`Int128`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toInt128(-128),
    toInt128(-128.8),
    toInt128('-128')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt128(-128):   -128
toInt128(-128.8): -128
toInt128('-128'): -128
```


## toInt128OrDefault {#toInt128OrDefault}

導入バージョン: v21.11

[`toInt128`](#toInt128) と同様に、この関数は入力値を型 [Int128](../data-types/int-uint.md) の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 値が指定されていない場合、エラー時には `0` が返されます。

**構文**

```sql
toInt128OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[`String`](/sql-reference/data-types/string) または [`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float)
* `default` — 省略可能。パースに失敗した場合に返されるデフォルト値。[`Int128`](/sql-reference/data-types/int-uint)

**戻り値**

成功した場合は型 `Int128` の値を返し、失敗した場合は指定されている場合はデフォルト値を、指定されていない場合は 0 を返します。[`Int128`](/sql-reference/data-types/int-uint)

**例**

**変換が成功する例**

```sql title=Query
SELECT toInt128OrDefault('-128', CAST('-1', 'Int128'))
```

```response title=Response
-128
```

**変換に失敗**

```sql title=Query
SELECT toInt128OrDefault('abc', CAST('-1', 'Int128'))
```

```response title=Response
-1
```


## toInt128OrNull {#toInt128OrNull}

導入されたバージョン: v20.8

[`toInt128`](#toInt128) と同様に、この関数は入力値を [Int128](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

サポートされる引数:

* (U)Int* の文字列表現。

サポートされない引数（`NULL` を返す）:

* `NaN` や `Inf` を含む Float* 値の文字列表現。
* 2 進数および 16 進数値の文字列表現（例: `SELECT toInt128OrNull('0xc0fe');`）。

:::note
入力値が [Int128](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
:::

関連項目:

* [`toInt128`](#toInt128)。
* [`toInt128OrZero`](#toInt128OrZero)。
* [`toInt128OrDefault`](#toInt128OrDefault)。

**構文**

```sql
toInt128OrNull(x)
```

**引数**

* `x` — 数値を表す文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

Int128 型の値を返します。変換に失敗した場合は `NULL` を返します。[`Int128`](/sql-reference/data-types/int-uint) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT
    toInt128OrNull('-128'),
    toInt128OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt128OrNull('-128'): -128
toInt128OrNull('abc'):  \N
```


## toInt128OrZero {#toInt128OrZero}

導入バージョン: v20.8

入力値を型 [Int128](/sql-reference/data-types/int-uint) に変換しますが、エラーが発生した場合は `0` を返します。
[`toInt128`](#toint128) と同様ですが、例外をスローする代わりに `0` を返します。

関連項目:

* [`toInt128`](#toInt128)。
* [`toInt128OrNull`](#toInt128OrNull)。
* [`toInt128OrDefault`](#toInt128OrDefault)。

**構文**

```sql
toInt128OrZero(x)
```

**引数**

* `x` — 変換対象の入力値。[`String`](/sql-reference/data-types/string)、[`FixedString`](/sql-reference/data-types/fixedstring)、[`Float*`](/sql-reference/data-types/float)、[`Decimal`](/sql-reference/data-types/decimal)、[`(U)Int*`](/sql-reference/data-types/int-uint)、[`Date`](/sql-reference/data-types/date)、[`DateTime`](/sql-reference/data-types/datetime) のいずれか。

**返り値**

変換された入力値を返します。変換に失敗した場合は `0` を返します。戻り値の型は [`Int128`](/sql-reference/data-types/int-uint) です。

**例**

**使用例**

```sql title=Query
SELECT toInt128OrZero('123')
```

```response title=Response
123
```

**変換に失敗すると 0 を返す**

```sql title=Query
SELECT toInt128OrZero('abc')
```

```response title=Response
0
```


## toInt16 {#toInt16}

導入バージョン: v1.1

入力値を [`Int16`](../data-types/int-uint.md) 型の値に変換します。
エラーが発生した場合は例外をスローします。

サポートされる引数:

* 型 (U)Int* の値、またはその文字列表現。
* 型 Float* の値。

サポートされない引数:

* `NaN` や `Inf` を含む、Float* 値の文字列表現。
* `SELECT toInt16('0xc0fe');` のような、バイナリ値および 16 進値の文字列表現。

:::note
入力値が [Int16](../data-types/int-uint.md) の範囲内で表現できない場合、結果としてオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
例: `SELECT toInt16(32768) == -32768;`。
:::

:::note
この関数は [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)（ゼロ方向への丸め）を使用します。つまり、小数部の桁を切り捨てます。
:::

関連項目:

* [`toInt16OrZero`](#toInt16OrZero)。
* [`toInt16OrNull`](#toInt16OrNull)。
* [`toInt16OrDefault`](#toInt16OrDefault)。

**構文**

```sql
toInt16(expr)
```

**引数**

* `expr` — 数値または数値を表す文字列を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**返り値**

16 ビット整数値を返します。[`Int16`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toInt16(-16),
    toInt16(-16.16),
    toInt16('-16')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt16(-16):    -16
toInt16(-16.16): -16
toInt16('-16'):  -16
```


## toInt16OrDefault {#toInt16OrDefault}

導入バージョン: v21.11

[`toInt16`](#toInt16) と同様に、この関数は入力値を [Int16](../data-types/int-uint.md) 型の値に変換しますが、エラー時にはデフォルト値を返します。
`default` 値が指定されていない場合は、エラー時に `0` が返されます。

**構文**

```sql
toInt16OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[`String`](/sql-reference/data-types/string) または [`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float)
* `default` — 任意。パースに失敗した場合に返すデフォルト値。[`Int16`](/sql-reference/data-types/int-uint)

**戻り値**

成功した場合は型 `Int16` の値を返し、失敗した場合はデフォルト値が指定されていればその値を、指定されていなければ 0 を返します。[`Int16`](/sql-reference/data-types/int-uint)

**例**

**変換が成功する場合**

```sql title=Query
SELECT toInt16OrDefault('-16', CAST('-1', 'Int16'))
```

```response title=Response
-16
```

**変換失敗**

```sql title=Query
SELECT toInt16OrDefault('abc', CAST('-1', 'Int16'))
```

```response title=Response
-1
```


## toInt16OrNull {#toInt16OrNull}

導入バージョン: v1.1

[`toInt16`](#toInt16) と同様に、この関数は入力値を型 [Int16](../data-types/int-uint.md) の値に変換しますが、エラーが発生した場合は `NULL` を返します。

サポートされている引数:

* (U)Int* 型値の文字列表現。

サポートされていない引数（`NULL` を返す）:

* `NaN` や `Inf` を含む、Float* 型値の文字列表現。
* `SELECT toInt16OrNull('0xc0fe');` のような、2進数および16進数値の文字列表現。

:::note
入力値が [Int16](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
:::

関連項目:

* [`toInt16`](#toInt16).
* [`toInt16OrZero`](#toInt16OrZero).
* [`toInt16OrDefault`](#toInt16OrDefault).

**構文**

```sql
toInt16OrNull(x)
```

**引数**

* `x` — 数値を表す文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

変換に成功した場合は `Int16` 型の値を返し、失敗した場合は `NULL` を返します。[`Int16`](/sql-reference/data-types/int-uint) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT
    toInt16OrNull('-16'),
    toInt16OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt16OrNull('-16'): -16
toInt16OrNull('abc'): \N
```


## toInt16OrZero {#toInt16OrZero}

導入バージョン: v1.1

[`toInt16`](#toInt16) と同様に、この関数は入力値を [Int16](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

サポートされる引数:

* (U)Int* の文字列表現。

サポートされない引数（`0` を返す）:

* `NaN` や `Inf` を含む Float* 型の値の文字列表現。
* `SELECT toInt16OrZero('0xc0fe');` のような、2進数および16進数値の文字列表現。

:::note
入力値が [Int16](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
:::

関連項目:

* [`toInt16`](#toInt16)。
* [`toInt16OrNull`](#toInt16OrNull)。
* [`toInt16OrDefault`](#toInt16OrDefault)。

**構文**

```sql
toInt16OrZero(x)
```

**引数**

* `x` — 数値を表す文字列。[`String`](/sql-reference/data-types/string)

**返される値**

`Int16` 型の値を返します。変換に失敗した場合は `0` を返します。[`Int16`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toInt16OrZero('16'),
    toInt16OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt16OrZero('16'): 16
toInt16OrZero('abc'): 0
```


## toInt256 {#toInt256}

導入バージョン: v1.1

入力値を型 [Int256](/sql-reference/data-types/int-uint) の値に変換します。
エラーが発生した場合には例外をスローします。
この関数は 0 に向かう丸めを行い、数値の小数部を切り捨てます。

サポートされる引数:

* 型 (U)Int* の値、またはその文字列表現。
* 型 Float* の値。

サポートされない引数:

* `NaN` や `Inf` を含む、型 Float* の値の文字列表現。
* 2 進数および 16 進数値の文字列表現（例: `SELECT toInt256('0xc0fe');`）。

:::note
入力値が Int256 の範囲内で表現できない場合、結果がオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

関連項目:

* [`toInt256OrZero`](#toInt256OrZero)
* [`toInt256OrNull`](#toInt256OrNull)
* [`toInt256OrDefault`](#toInt256OrDefault)

**構文**

```sql
toInt256(expr)
```

**引数**

* `expr` — 数値または数値を表す文字列を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**返される値**

256 ビット整数値を返します。[`Int256`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toInt256(-256),
    toInt256(-256.256),
    toInt256('-256')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt256(-256):     -256
toInt256(-256.256): -256
toInt256('-256'):   -256
```


## toInt256OrDefault {#toInt256OrDefault}

導入バージョン: v21.11

[`toInt256`](#toInt256) と同様に、この関数は入力値を [Int256](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 値が指定されていない場合は、エラー発生時に `0` が返されます。

**構文**

```sql
toInt256OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[`String`](/sql-reference/data-types/string) または [`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float)
* `default` — 省略可能。解析に失敗した場合に返すデフォルト値。[`Int256`](/sql-reference/data-types/int-uint)

**返される値**

成功した場合は型 `Int256` の値を返し、解析に失敗した場合は指定されていればデフォルト値を、指定されていなければ 0 を返します。[`Int256`](/sql-reference/data-types/int-uint)

**例**

**変換が成功する例**

```sql title=Query
SELECT toInt256OrDefault('-256', CAST('-1', 'Int256'))
```

```response title=Response
-256
```

**変換に失敗**

```sql title=Query
SELECT toInt256OrDefault('abc', CAST('-1', 'Int256'))
```

```response title=Response
-1
```


## toInt256OrNull {#toInt256OrNull}

導入バージョン: v20.8

[`toInt256`](#toInt256) と同様に、この関数は入力値を [Int256](../data-types/int-uint.md) 型の値に変換しますが、エラー時には `NULL` を返します。

サポートされる引数:

* (U)Int* の文字列表現。

サポートされない引数（`NULL` を返す）:

* `NaN` や `Inf` を含む、Float* 値の文字列表現。
* 2進数および16進数値を表す文字列表現。例: `SELECT toInt256OrNull('0xc0fe');`。

:::note
入力値が [Int256](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
この場合はエラーとは見なされません。
:::

関連項目:

* [`toInt256`](#toInt256)。
* [`toInt256OrZero`](#toInt256OrZero)。
* [`toInt256OrDefault`](#toInt256OrDefault)。

**構文**

```sql
toInt256OrNull(x)
```

**引数**

* `x` — 数値を表す文字列。[`String`](/sql-reference/data-types/string)

**返り値**

変換が成功した場合は Int256 型の値を返し、失敗した場合は `NULL` を返します。[`Int256`](/sql-reference/data-types/int-uint) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT
    toInt256OrNull('-256'),
    toInt256OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt256OrNull('-256'): -256
toInt256OrNull('abc'):  \N
```


## toInt256OrZero {#toInt256OrZero}

導入バージョン: v20.8

入力値を型 [Int256](/sql-reference/data-types/int-uint) に変換しますが、エラーが発生した場合は `0` を返します。
[`toInt256`](#toint256) と同様ですが、例外をスローせずに `0` を返します。

関連項目:

* [`toInt256`](#toInt256)。
* [`toInt256OrNull`](#toInt256OrNull)。
* [`toInt256OrDefault`](#toInt256OrDefault)。

**構文**

```sql
toInt256OrZero(x)
```

**引数**

* `x` — 変換対象の入力値。[`String`](/sql-reference/data-types/string)、[`FixedString`](/sql-reference/data-types/fixedstring)、[`Float*`](/sql-reference/data-types/float)、[`Decimal`](/sql-reference/data-types/decimal)、[`(U)Int*`](/sql-reference/data-types/int-uint)、[`Date`](/sql-reference/data-types/date)、または [`DateTime`](/sql-reference/data-types/datetime)

**戻り値**

変換された入力値を返し、変換に失敗した場合は `0` を返します。[`Int256`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT toInt256OrZero('123')
```

```response title=Response
123
```

**変換に失敗した場合は 0 を返します**

```sql title=Query
SELECT toInt256OrZero('abc')
```

```response title=Response
0
```


## toInt32 {#toInt32}

導入バージョン: v1.1

入力値を [`Int32`](../data-types/int-uint.md) 型の値に変換します。
エラーが発生した場合は例外をスローします。

サポートされる引数:

* 型 (U)Int* の値、またはその文字列表現
* 型 Float* の値

サポートされない引数:

* `NaN` や `Inf` を含む、Float* 値の文字列表現
* `SELECT toInt32('0xc0fe');` のような、バイナリおよび 16 進数値の文字列表現

:::note
入力値が [Int32](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
例: `SELECT toInt32(2147483648) == -2147483648;`
:::

:::note
この関数は [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用します。これは、小数部を切り捨てることを意味します。
:::

関連項目:

* [`toInt32OrZero`](#toInt32OrZero)
* [`toInt32OrNull`](#toInt32OrNull)
* [`toInt32OrDefault`](#toInt32OrDefault)

**構文**

```sql
toInt32(expr)
```

**引数**

* `expr` — 数値または数値を表す文字列を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**戻り値**

32ビットの整数値を返します。[`Int32`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toInt32(-32),
    toInt32(-32.32),
    toInt32('-32')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt32(-32):    -32
toInt32(-32.32): -32
toInt32('-32'):  -32
```


## toInt32OrDefault {#toInt32OrDefault}

導入バージョン: v21.11

[`toInt32`](#toInt32) と同様に、この関数は入力値を [Int32](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 引数が指定されていない場合、エラー時には `0` が返されます。

**構文**

```sql
toInt32OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[`String`](/sql-reference/data-types/string) または [`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float)
* `default` — 省略可能。パースに失敗した場合に返されるデフォルト値。[`Int32`](/sql-reference/data-types/int-uint)

**返される値**

成功した場合は Int32 型の値を返し、失敗した場合は default が指定されていればその値を、指定されていなければ 0 を返します。[`Int32`](/sql-reference/data-types/int-uint)

**使用例**

**変換に成功する例**

```sql title=Query
SELECT toInt32OrDefault('-32', CAST('-1', 'Int32'))
```

```response title=Response
-32
```

**変換に失敗**

```sql title=Query
SELECT toInt32OrDefault('abc', CAST('-1', 'Int32'))
```

```response title=Response
-1
```


## toInt32OrNull {#toInt32OrNull}

導入バージョン: v1.1

[`toInt32`](#toInt32) と同様に、この関数は入力値を [Int32](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

サポートされる引数:

* (U)Int* の文字列表現。

サポートされない引数（`NULL` を返す）:

* `NaN` や `Inf` を含む Float* 値の文字列表現。
* 2 進数や 16 進数値の文字列表現（例: `SELECT toInt32OrNull('0xc0fe');`）。

:::note
入力値が [Int32](../data-types/int-uint.md) の範囲内で表現できない場合、結果がオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
:::

関連項目:

* [`toInt32`](#toInt32)。
* [`toInt32OrZero`](#toInt32OrZero)。
* [`toInt32OrDefault`](#toInt32OrDefault)。

**構文**

```sql
toInt32OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[`String`](/sql-reference/data-types/string)

**返される値**

変換に成功した場合は `Int32` 型の値、変換に失敗した場合は `NULL` を返します。[`Int32`](/sql-reference/data-types/int-uint) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT
    toInt32OrNull('-32'),
    toInt32OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt32OrNull('-32'): -32
toInt32OrNull('abc'): \N
```


## toInt32OrZero {#toInt32OrZero}

導入バージョン: v1.1

[`toInt32`](#toInt32) と同様に、この関数は入力値を [Int32](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

サポートされる引数:

* (U)Int* の文字列表現。

サポートされない引数（`0` を返す）:

* `NaN` や `Inf` を含む Float* 値の文字列表現。
* 例えば `SELECT toInt32OrZero('0xc0fe');` のような、2進数および16進数値の文字列表現。

:::note
入力値が [Int32](../data-types/int-uint.md) の範囲で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
:::

関連項目:

* [`toInt32`](#toInt32)。
* [`toInt32OrNull`](#toInt32OrNull)。
* [`toInt32OrDefault`](#toInt32OrDefault)。

**構文**

```sql
toInt32OrZero(x)
```

**引数**

* `x` — 数値を表す文字列。[`String`](/sql-reference/data-types/string)

**返される値**

`Int32` 型の値を返します。変換に失敗した場合は `0` を返します。[`Int32`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toInt32OrZero('32'),
    toInt32OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt32OrZero('32'): 32
toInt32OrZero('abc'): 0
```


## toInt64 {#toInt64}

導入バージョン: v1.1

入力値を [`Int64`](../data-types/int-uint.md) 型の値に変換します。
エラーが発生した場合は例外をスローします。

サポートされる引数:

* 型が (U)Int* の値、またはその文字列表現。
* 型が Float* の値。

サポートされない引数:

* `NaN` や `Inf` を含む、Float* 値の文字列表現。
* `SELECT toInt64('0xc0fe');` のような、2進数および16進数値の文字列表現。

:::note
入力値が [Int64](../data-types/int-uint.md) の範囲で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
例: `SELECT toInt64(9223372036854775808) == -9223372036854775808;`
:::

:::note
この関数は [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)（ゼロ方向への丸め）を行います。つまり、小数部分の桁を切り捨てます。
:::

関連項目:

* [`toInt64OrZero`](#toInt64OrZero)。
* [`toInt64OrNull`](#toInt64OrNull)。
* [`toInt64OrDefault`](#toInt64OrDefault)。

**構文**

```sql
toInt64(expr)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。サポートされるもの: 型 (U)Int* の値およびその文字列表現、型 Float* の値。サポートされないもの: NaN や Inf を含む Float* 値の文字列表現、バイナリ値および 16 進値の文字列表現。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**戻り値**

64 ビットの整数値を返します。[`Int64`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toInt64(-64),
    toInt64(-64.64),
    toInt64('-64')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt64(-64):    -64
toInt64(-64.64): -64
toInt64('-64'):  -64
```


## toInt64OrDefault {#toInt64OrDefault}

導入バージョン: v21.11

[`toInt64`](#toInt64) と同様に、この関数は入力値を [Int64](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 値が渡されない場合、エラー時には `0` が返されます。

**構文**

```sql
toInt64OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[`String`](/sql-reference/data-types/string) または [`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float)
* `default` — オプション。解析に失敗した場合に返すデフォルト値。[`Int64`](/sql-reference/data-types/int-uint)

**戻り値**

変換に成功した場合は型 `Int64` の値を返し、失敗した場合はデフォルト値が指定されていればそれを、指定されていなければ 0 を返します。[`Int64`](/sql-reference/data-types/int-uint)

**例**

**変換が成功する例**

```sql title=Query
SELECT toInt64OrDefault('-64', CAST('-1', 'Int64'))
```

```response title=Response
-64
```

**変換に失敗した場合**

```sql title=Query
SELECT toInt64OrDefault('abc', CAST('-1', 'Int64'))
```

```response title=Response
-1
```


## toInt64OrNull {#toInt64OrNull}

導入バージョン: v1.1

[`toInt64`](#toInt64) と同様に、この関数は入力値を [Int64](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

サポートされる引数:

* (U)Int* 型の値を表す文字列。

サポートされない引数（`NULL` を返す）:

* `NaN` や `Inf` を含む Float* 型の値を表す文字列。
* `SELECT toInt64OrNull('0xc0fe');` のような、2進数および16進数値を表す文字列。

:::note
入力値が [Int64](../data-types/int-uint.md) の範囲内で表現できない場合、結果としてオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

関連項目:

* [`toInt64`](#toInt64)。
* [`toInt64OrZero`](#toInt64OrZero)。
* [`toInt64OrDefault`](#toInt64OrDefault)。

**構文**

```sql
toInt64OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[`String`](/sql-reference/data-types/string)

**戻り値**

変換に成功した場合は `Int64` 型の値を返し、失敗した場合は `NULL` を返します。[`Int64`](/sql-reference/data-types/int-uint) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT
    toInt64OrNull('-64'),
    toInt64OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt64OrNull('-64'): -64
toInt64OrNull('abc'): \N
```


## toInt64OrZero {#toInt64OrZero}

導入バージョン: v1.1

入力値を型 [Int64](/sql-reference/data-types/int-uint) に変換します。エラーが発生した場合は `0` を返します。
[`toInt64`](#toint64) と似ていますが、例外をスローする代わりに `0` を返します。

参照:

* [`toInt64`](#toInt64)
* [`toInt64OrNull`](#toInt64OrNull)
* [`toInt64OrDefault`](#toInt64OrDefault)

**構文**

```sql
toInt64OrZero(x)
```

**引数**

* `x` — 変換対象の入力値。[`String`](/sql-reference/data-types/string)、[`FixedString`](/sql-reference/data-types/fixedstring)、[`Float*`](/sql-reference/data-types/float)、[`Decimal`](/sql-reference/data-types/decimal)、[`(U)Int*`](/sql-reference/data-types/int-uint)、[`Date`](/sql-reference/data-types/date) または [`DateTime`](/sql-reference/data-types/datetime)

**戻り値**

変換された入力値を返します。変換に失敗した場合は `0` を返します。返される型は [`Int64`](/sql-reference/data-types/int-uint) です。

**例**

**使用例**

```sql title=Query
SELECT toInt64OrZero('123')
```

```response title=Response
123
```

**変換に失敗した場合は 0 を返します**

```sql title=Query
SELECT toInt64OrZero('abc')
```

```response title=Response
0
```


## toInt8 {#toInt8}

導入バージョン: v1.1

入力値を [`Int8`](../data-types/int-uint.md) 型の値に変換します。
エラーが発生した場合は例外をスローします。

サポートされる引数:

* 型 (U)Int* の値、またはその文字列表現。
* 型 Float* の値。

サポートされない引数:

* `NaN` や `Inf` を含む、Float* 値の文字列表現。
* 2進数および16進数値の文字列表現。例: `SELECT toInt8('0xc0fe');`。

:::note
入力値が [Int8](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
例: `SELECT toInt8(128) == -128;`。
:::

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用し、小数部分の桁を切り捨てます。
:::

関連項目:

* [`toInt8OrZero`](#toInt8OrZero)。
* [`toInt8OrNull`](#toInt8OrNull)。
* [`toInt8OrDefault`](#toInt8OrDefault)。

**構文**

```sql
toInt8(expr)
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**返される値**

8 ビット整数値を返します。[`Int8`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toInt8(-8),
    toInt8(-8.8),
    toInt8('-8')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt8(-8):   -8
toInt8(-8.8): -8
toInt8('-8'): -8
```


## toInt8OrDefault {#toInt8OrDefault}

導入バージョン: v21.11

[`toInt8`](#toInt8) と同様に、この関数は入力値を型 [Int8](../data-types/int-uint.md) の値に変換しますが、エラー発生時にはデフォルト値を返します。
`default` 値が指定されていない場合、エラー時には `0` が返されます。

**構文**

```sql
toInt8OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[`String`](/sql-reference/data-types/string) または [`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float)
* `default` — 省略可能。パースに失敗した場合に返されるデフォルト値。[`Int8`](/sql-reference/data-types/int-uint)

**返される値**

成功した場合は型 Int8 の値を返し、失敗した場合は指定されていればデフォルト値を、指定されていなければ 0 を返します。[`Int8`](/sql-reference/data-types/int-uint)

**例**

**変換が成功する例**

```sql title=Query
SELECT toInt8OrDefault('-8', CAST('-1', 'Int8'))
```

```response title=Response
-8
```

**変換失敗**

```sql title=Query
SELECT toInt8OrDefault('abc', CAST('-1', 'Int8'))
```

```response title=Response
-1
```


## toInt8OrNull {#toInt8OrNull}

導入: v1.1

[`toInt8`](#toInt8) と同様に、この関数は入力値を [Int8](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

サポートされる引数:

* (U)Int* の文字列表現。

サポートされない引数（`NULL` を返す）:

* `NaN` や `Inf` を含む Float* 値の文字列表現。
* `SELECT toInt8OrNull('0xc0fe');` のような、2 進および 16 進値の文字列表現。

:::note
入力値が [Int8](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローを起こします。
この場合もエラーとは見なされません。
:::

関連項目:

* [`toInt8`](#toInt8)。
* [`toInt8OrZero`](#toInt8OrZero)。
* [`toInt8OrDefault`](#toInt8OrDefault)。

**構文**

```sql
toInt8OrNull(x)
```

**引数**

* `x` — 数値を表す文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

`Int8` 型の値を返し、変換に失敗した場合は `NULL` を返します。[`Int8`](/sql-reference/data-types/int-uint) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT
    toInt8OrNull('-8'),
    toInt8OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt8OrNull('-8'):  -8
toInt8OrNull('abc'): \N
```


## toInt8OrZero {#toInt8OrZero}

導入バージョン: v1.1

[`toInt8`](#toInt8) と同様に、この関数は入力値を [Int8](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

サポートされる引数:

* (U)Int* の文字列表現。

サポートされない引数（`0` を返す）:

* `NaN` や `Inf` を含む Float* 型の値の文字列表現。
* `SELECT toInt8OrZero('0xc0fe');` のような 2 進数および 16 進数値の文字列表現。

:::note
入力値が [Int8](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローが発生します。
この場合もエラーとはみなされません。
:::

参照:

* [`toInt8`](#toInt8)。
* [`toInt8OrNull`](#toInt8OrNull)。
* [`toInt8OrDefault`](#toInt8OrDefault)。

**構文**

```sql
toInt8OrZero(x)
```

**引数**

* `x` — 数値を表す文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

変換に成功した場合は `Int8` 型の値を返し、失敗した場合は `0` を返します。[`Int8`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toInt8OrZero('8'),
    toInt8OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt8OrZero('8'): 8
toInt8OrZero('abc'): 0
```


## toInterval {#toInterval}

導入バージョン: v

値と単位から interval 型の値を生成します。

**構文**

```sql
```

**引数**

* なし。

**戻り値**

**例**


## toIntervalDay {#toIntervalDay}

導入バージョン: v1.1

データ型 [`IntervalDay`](../data-types/special-data-types/interval.md) の `n` 日の時間間隔を返します。

**構文**

```sql
toIntervalDay(n)
```

**引数**

* `n` — 日数。整数値またはその文字列表現、および浮動小数点数。[`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`String`](/sql-reference/data-types/string)

**戻り値**

`n` 日のインターバルを返します。[`Interval`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
WITH
    toDate('2025-06-15') AS date,
    toIntervalDay(5) AS interval_to_days
SELECT date + interval_to_days AS result
```

```response title=Response
┌─────result─┐
│ 2025-06-20 │
└────────────┘
```


## toIntervalHour {#toIntervalHour}

導入バージョン: v1.1

データ型 [`IntervalHour`](../data-types/special-data-types/interval.md) の `n` 時間を表すインターバルを返します。

**構文**

```sql
toIntervalHour(n)
```

**引数**

* `n` — 時間数。整数値またはその文字列表現、および浮動小数点数。[`Int*`](/sql-reference/data-types/int-uint) または [`UInt*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`String`](/sql-reference/data-types/string)

**戻り値**

`n` 時間の Interval を返します。[`Interval`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
WITH
    toDate('2025-06-15') AS date,
    toIntervalHour(12) AS interval_to_hours
SELECT date + interval_to_hours AS result
```

```response title=Response
┌──────────────result─┐
│ 2025-06-15 12:00:00 │
└─────────────────────┘
```


## toIntervalMicrosecond {#toIntervalMicrosecond}

導入バージョン: v22.6

`IntervalMicrosecond` 型の `n` マイクロ秒のインターバル（[`IntervalMicrosecond`](../../sql-reference/data-types/special-data-types/interval.md)）を返します。

**構文**

```sql
toIntervalMicrosecond(n)
```

**引数**

* `n` — マイクロ秒の数。[`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`String`](/sql-reference/data-types/string)

**戻り値**

`n` マイクロ秒の [`Interval`](/sql-reference/data-types/int-uint) 型の値を返します。

**例**

**使用例**

```sql title=Query
WITH
    toDateTime('2025-06-15') AS date,
    toIntervalMicrosecond(30) AS interval_to_microseconds
SELECT date + interval_to_microseconds AS result
```

```response title=Response
┌─────────────────────result─┐
│ 2025-06-15 00:00:00.000030 │
└────────────────────────────┘
```


## toIntervalMillisecond {#toIntervalMillisecond}

導入バージョン: v22.6

`n` ミリ秒を表すデータ型 [IntervalMillisecond](../../sql-reference/data-types/special-data-types/interval.md) の時間間隔を返します。

**構文**

```sql
toIntervalMillisecond(n)
```

**引数**

* `n` — ミリ秒数。型は [`(U)Int*`](/sql-reference/data-types/int-uint)、[`Float*`](/sql-reference/data-types/float)、または [`String`](/sql-reference/data-types/string)

**戻り値**

`n` ミリ秒の Interval を返します。[`Interval`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
WITH
    toDateTime('2025-06-15') AS date,
    toIntervalMillisecond(30) AS interval_to_milliseconds
SELECT date + interval_to_milliseconds AS result
```

```response title=Response
┌──────────────────result─┐
│ 2025-06-15 00:00:00.030 │
└─────────────────────────┘
```


## toIntervalMinute {#toIntervalMinute}

導入バージョン: v1.1

データ型 [`IntervalMinute`](../data-types/special-data-types/interval.md) の `n` 分を表す時間間隔を返します。

**構文**

```sql
toIntervalMinute(n)
```

**引数**

* `n` — 分を表す数値。整数値またはその文字列表現、および浮動小数点数。[`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`String`](/sql-reference/data-types/string)

**戻り値**

`n` 分のインターバルを返します。[`Interval`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
WITH
    toDate('2025-06-15') AS date,
    toIntervalMinute(12) AS interval_to_minutes
SELECT date + interval_to_minutes AS result
```

```response title=Response
┌──────────────result─┐
│ 2025-06-15 00:12:00 │
└─────────────────────┘
```


## toIntervalMonth {#toIntervalMonth}

導入バージョン: v1.1

データ型 [`IntervalMonth`](../../sql-reference/data-types/special-data-types/interval.md) の、`n` ヶ月の間隔を表す値を返します。

**構文**

```sql
toIntervalMonth(n)
```

**引数**

* `n` — 月数。[`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`String`](/sql-reference/data-types/string)

**返り値**

`n` か月のインターバルを返します。[`Interval`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
WITH
    toDate('2025-06-15') AS date,
    toIntervalMonth(1) AS interval_to_month
SELECT date + interval_to_month AS result
```

```response title=Response
┌─────result─┐
│ 2025-07-15 │
└────────────┘
```


## toIntervalNanosecond {#toIntervalNanosecond}

導入バージョン: v22.6

データ型 [`IntervalNanosecond`](../../sql-reference/data-types/special-data-types/interval.md) の、`n` ナノ秒を表す時間間隔を返します。

**構文**

```sql
toIntervalNanosecond(n)
```

**引数**

* `n` — ナノ秒の数。[`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`String`](/sql-reference/data-types/string)

**戻り値**

`n` ナノ秒の [`Interval`](/sql-reference/data-types/int-uint) を返します。

**例**

**使用例**

```sql title=Query
WITH
    toDateTime('2025-06-15') AS date,
    toIntervalNanosecond(30) AS interval_to_nanoseconds
SELECT date + interval_to_nanoseconds AS result
```

```response title=Response
┌────────────────────────result─┐
│ 2025-06-15 00:00:00.000000030 │
└───────────────────────────────┘
```


## toIntervalQuarter {#toIntervalQuarter}

導入バージョン: v1.1

データ型 [`IntervalQuarter`](../../sql-reference/data-types/special-data-types/interval.md) の `n` 四半期のインターバルを返します。

**構文**

```sql
toIntervalQuarter(n)
```

**引数**

* `n` — 四半期数。[`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`String`](/sql-reference/data-types/string)

**返される値**

`n` 四半期分の期間を表す [`Interval`](/sql-reference/data-types/int-uint) を返します。

**例**

**使用例**

```sql title=Query
WITH
    toDate('2025-06-15') AS date,
    toIntervalQuarter(1) AS interval_to_quarter
SELECT date + interval_to_quarter AS result
```

```response title=Response
┌─────result─┐
│ 2025-09-15 │
└────────────┘
```


## toIntervalSecond {#toIntervalSecond}

導入バージョン: v1.1

データ型 [`IntervalSecond`](../data-types/special-data-types/interval.md) の、長さ `n` 秒の時間間隔を返します。

**構文**

```sql
toIntervalSecond(n)
```

**引数**

* `n` — 秒数。整数値、その文字列表現、または浮動小数点数。[`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`String`](/sql-reference/data-types/string)

**返される値**

`n` 秒の時間間隔を返します。[`Interval`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
WITH
    toDate('2025-06-15') AS date,
    toIntervalSecond(30) AS interval_to_seconds
SELECT date + interval_to_seconds AS result
```

```response title=Response
┌──────────────result─┐
│ 2025-06-15 00:00:30 │
└─────────────────────┘
```


## toIntervalWeek {#toIntervalWeek}

導入バージョン: v1.1

データ型 [`IntervalWeek`](../../sql-reference/data-types/special-data-types/interval.md) の `n` 週間の間隔を表す値を返します。

**構文**

```sql
toIntervalWeek(n)
```

**引数**

* `n` — 週数。[`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`String`](/sql-reference/data-types/string)

**返される値**

`n` 週間の間隔（[`Interval`](/sql-reference/data-types/int-uint)）を返します。

**例**

**使用例**

```sql title=Query
WITH
    toDate('2025-06-15') AS date,
    toIntervalWeek(1) AS interval_to_week
SELECT date + interval_to_week AS result
```

```response title=Response
┌─────result─┐
│ 2025-06-22 │
└────────────┘
```


## toIntervalYear {#toIntervalYear}

導入: v1.1

データ型 [`IntervalYear`](../../sql-reference/data-types/special-data-types/interval.md) の `n` 年の期間を返します。

**構文**

```sql
toIntervalYear(n)
```

**引数**

* `n` — 年数。[`(U)Int*`](/sql-reference/data-types/int-uint)、[`Float*`](/sql-reference/data-types/float)、または [`String`](/sql-reference/data-types/string)

**戻り値**

`n` 年の Interval を返します。[`Interval`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
WITH
    toDate('2024-06-15') AS date,
    toIntervalYear(1) AS interval_to_year
SELECT date + interval_to_year AS result
```

```response title=Response
┌─────result─┐
│ 2025-06-15 │
└────────────┘
```


## toLowCardinality {#toLowCardinality}

導入バージョン: v18.12

入力引数を、同一データ型に対応する [LowCardinality](../data-types/lowcardinality.md) 型に変換します。

:::tip
`LowCardinality` データ型から通常のデータ型に変換するには、[CAST](#cast) 関数を使用します。
例: `CAST(x AS String)`。
:::

**構文**

```sql
toLowCardinality(expr)
```

**引数**

* `expr` — サポートされているいずれかのデータ型の値となる式。[`String`](/sql-reference/data-types/string) または [`FixedString`](/sql-reference/data-types/fixedstring) または [`Date`](/sql-reference/data-types/date) または [`DateTime`](/sql-reference/data-types/datetime) または [`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float)

**返される値**

入力値を `LowCardinality` データ型に変換した値を返します。[`LowCardinality`](/sql-reference/data-types/lowcardinality)

**例**

**使用例**

```sql title=Query
SELECT toLowCardinality('1')
```

```response title=Response
┌─toLowCardinality('1')─┐
│ 1                     │
└───────────────────────┘
```


## toString {#toString}

導入バージョン: v1.1

値を文字列表現に変換します。
DateTime 型の引数に対しては、タイムゾーン名を表す 2 番目の String 型引数を指定できます。

**構文**

```sql
toString(value[, timezone])
```

**引数**

* `value` — 文字列に変換する値。[`Any`](/sql-reference/data-types)
* `timezone` — オプション。DateTime への変換に用いるタイムゾーン名。[`String`](/sql-reference/data-types/string)

**戻り値**

入力値の文字列表現を返します。[`String`](/sql-reference/data-types/string)

**例**

**使用例**

```sql title=Query
SELECT
    now() AS ts,
    time_zone,
    toString(ts, time_zone) AS str_tz_datetime
FROM system.time_zones
WHERE time_zone LIKE 'Europe%'
LIMIT 10
```

```response title=Response
┌──────────────────ts─┬─time_zone─────────┬─str_tz_datetime─────┐
│ 2023-09-08 19:14:59 │ Europe/Amsterdam  │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Andorra    │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Astrakhan  │ 2023-09-08 23:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Athens     │ 2023-09-08 22:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Belfast    │ 2023-09-08 20:14:59 │
└─────────────────────┴───────────────────┴─────────────────────┘
```


## toStringCutToZero {#toStringCutToZero}

導入バージョン: v1.1

[String](/sql-reference/data-types/string) または [FixedString](/sql-reference/data-types/fixedstring) 型の引数を受け取り、最初のヌルバイトの位置で切り詰めた元の文字列のコピーを含む String を返します。

ヌルバイト (\0) は文字列終端として扱われます。
この関数は、ヌルバイトが有効な内容の終端を示す C 形式の文字列やバイナリデータを処理する際に有用です。

**構文**

```sql
toStringCutToZero(s)
```

**引数**

* `s` — 処理対象となる String または FixedString。[`String`](/sql-reference/data-types/string) または [`FixedString`](/sql-reference/data-types/fixedstring)

**戻り値**

最初のヌルバイトより前の文字からなる String を返します。[`String`](/sql-reference/data-types/string)

**例**

**使用例**

```sql title=Query
SELECT
    toStringCutToZero('hello'),
    toStringCutToZero('hello\0world')
```

```response title=Response
┌─toStringCutToZero('hello')─┬─toStringCutToZero('hello\\0world')─┐
│ hello                      │ hello                             │
└────────────────────────────┴───────────────────────────────────┘
```


## toTime {#toTime}

導入: v1.1

入力値を型 [Time](/sql-reference/data-types/time) に変換します。
String、FixedString、DateTime、または午前0時からの経過秒数を表す数値型からの変換をサポートします。

**構文**

```sql
toTime(x)
```

**引数**

* `x` — 変換する入力値。[`String`](/sql-reference/data-types/string)、[`FixedString`](/sql-reference/data-types/fixedstring)、[`DateTime`](/sql-reference/data-types/datetime)、[`(U)Int*`](/sql-reference/data-types/int-uint)、または [`Float*`](/sql-reference/data-types/float) のいずれか。

**返り値**

変換後の値を返します。[`Time`](/sql-reference/data-types/time)

**使用例**

**String 型から Time 型への変換**

```sql title=Query
SELECT toTime('14:30:25')
```

```response title=Response
14:30:25
```

**DateTime から Time への型変換**

```sql title=Query
SELECT toTime(toDateTime('2025-04-15 14:30:25'))
```

```response title=Response
14:30:25
```

**整数を Time 型に変換**

```sql title=Query
SELECT toTime(52225)
```

```response title=Response
14:30:25
```


## toTime64 {#toTime64}

導入バージョン: v25.6

入力値を型 [Time64](/sql-reference/data-types/time64) に変換します。
String、FixedString、DateTime64、または真夜中（0時）からの経過マイクロ秒数を表す数値型からの変換をサポートします。
時刻値に対してマイクロ秒単位の精度を提供します。

**構文**

```sql
toTime64(x)
```

**引数**

* `x` — 変換する入力値。[`String`](/sql-reference/data-types/string)、[`FixedString`](/sql-reference/data-types/fixedstring)、[`DateTime64`](/sql-reference/data-types/datetime64)、[`(U)Int*`](/sql-reference/data-types/int-uint)、または [`Float*`](/sql-reference/data-types/float)

**返される値**

マイクロ秒単位の精度で変換された入力値を返します。[`Time64(6)`](/sql-reference/data-types/time64)

**例**

**String 型から Time64 型への変換**

```sql title=Query
SELECT toTime64('14:30:25.123456')
```

```response title=Response
14:30:25.123456
```

**DateTime64 から Time64 への変換**

```sql title=Query
SELECT toTime64(toDateTime64('2025-04-15 14:30:25.123456', 6))
```

```response title=Response
14:30:25.123456
```

**整数から Time64 への型変換**

```sql title=Query
SELECT toTime64(52225123456)
```

```response title=Response
14:30:25.123456
```


## toTime64OrNull {#toTime64OrNull}

導入バージョン: v25.6

入力値を `Time64` 型に変換しますが、エラーが発生した場合は `NULL` を返します。
[`toTime64`](#toTime64) と同様ですが、変換エラー時に例外をスローする代わりに `NULL` を返します。

関連項目:

* [`toTime64`](#toTime64)
* [`toTime64OrZero`](#toTime64OrZero)

**構文**

```sql
toTime64OrNull(x)
```

**引数**

* `x` — サブ秒精度付きの時刻の文字列表現。[`String`](/sql-reference/data-types/string)

**戻り値**

成功した場合は Time64 型の値を返し、それ以外の場合は `NULL` を返します。[`Time64`](/sql-reference/data-types/time64) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT toTime64OrNull('12:30:45.123'), toTime64OrNull('invalid')
```

```response title=Response
┌─toTime64OrNull('12:30:45.123')─┬─toTime64OrNull('invalid')─┐
│                   12:30:45.123 │                      ᴺᵁᴸᴸ │
└────────────────────────────────┴───────────────────────────┘
```


## toTime64OrZero {#toTime64OrZero}

導入されたバージョン: v25.6

入力値を Time64 型の値に変換しますが、エラーが発生した場合は `00:00:00.000` を返します。
[`toTime64`](#toTime64) と同様ですが、変換エラー時に例外をスローする代わりに `00:00:00.000` を返します。

**構文**

```sql
toTime64OrZero(x)
```

**引数**

* `x` — サブ秒精度を持つ時刻を表す文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

成功した場合は Time64 値を返し、失敗した場合は `00:00:00.000` を返します。[`Time64`](/sql-reference/data-types/time64)

**例**

**使用例**

```sql title=Query
SELECT toTime64OrZero('12:30:45.123'), toTime64OrZero('invalid')
```

```response title=Response
┌─toTime64OrZero('12:30:45.123')─┬─toTime64OrZero('invalid')─┐
│                   12:30:45.123 │             00:00:00.000 │
└────────────────────────────────┴──────────────────────────┘
```


## toTimeOrNull {#toTimeOrNull}

導入バージョン: v1.1

入力値を `Time` 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。
変換エラー時に例外をスローする代わりに `NULL` を返す点を除き、[`toTime`](#toTime) と同様です。

関連項目:

* [`toTime`](#toTime)
* [`toTimeOrZero`](#toTimeOrZero)

**構文**

```sql
toTimeOrNull(x)
```

**引数**

* `x` — 時刻を表す文字列。[`String`](/sql-reference/data-types/string)

**返される値**

成功した場合は Time 型の値を返し、そうでない場合は `NULL` を返します。[`Time`](/sql-reference/data-types/time) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT toTimeOrNull('12:30:45'), toTimeOrNull('invalid')
```

```response title=Response
┌─toTimeOrNull('12:30:45')─┬─toTimeOrNull('invalid')─┐
│                 12:30:45 │                    ᴺᵁᴸᴸ │
└──────────────────────────┴─────────────────────────┘
```


## toTimeOrZero {#toTimeOrZero}

導入バージョン: v1.1

入力値を Time 型に変換しますが、エラーが発生した場合は `00:00:00` を返します。
toTime と同様に動作しますが、変換エラー時に例外をスローする代わりに `00:00:00` を返します。

**構文**

```sql
toTimeOrZero(x)
```

**引数**

* `x` — 時刻を表す文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

変換に成功した場合は Time 型の値を返し、失敗した場合は `00:00:00` を返します。[`Time`](/sql-reference/data-types/time)

**例**

**使用例**

```sql title=Query
SELECT toTimeOrZero('12:30:45'), toTimeOrZero('invalid')
```

```response title=Response
┌─toTimeOrZero('12:30:45')─┬─toTimeOrZero('invalid')─┐
│                 12:30:45 │                00:00:00 │
└──────────────────────────┴─────────────────────────┘
```


## toUInt128 {#toUInt128}

導入バージョン: v1.1

入力値を [`UInt128`](/sql-reference/functions/type-conversion-functions#touint128) 型の値に変換します。
エラーが発生した場合には例外をスローします。
関数はゼロ方向への丸めを使用し、数値の小数桁を切り捨てます。

サポートされる引数:

* 型 (U)Int* の値またはその文字列表現。
* 型 Float* の値。

サポートされない引数:

* `NaN` や `Inf` を含む、型 Float* の値の文字列表現。
* `SELECT toUInt128('0xc0fe');` のような、2進数および16進数値の文字列表現。

:::note
入力値が UInt128 の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

関連項目:

* [`toUInt128OrZero`](#toUInt128OrZero)。
* [`toUInt128OrNull`](#toUInt128OrNull)。
* [`toUInt128OrDefault`](#toUInt128OrDefault)。

**構文**

```sql
toUInt128(expr)
```

**引数**

* `expr` — 数値または数値を表す文字列を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**返される値**

128 ビットの符号なし整数値を返します。[`UInt128`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toUInt128(128),
    toUInt128(128.8),
    toUInt128('128')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt128(128):   128
toUInt128(128.8): 128
toUInt128('128'): 128
```


## toUInt128OrDefault {#toUInt128OrDefault}

導入バージョン: v21.11

[`toUInt128`](#toUInt128) と同様に、この関数は入力値を [`UInt128`](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 値が指定されていない場合、エラーが発生したときは `0` が返されます。

**構文**

```sql
toUInt128OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列表現を返す式。[`String`](/sql-reference/data-types/string) または [`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float)
* `default` — 省略可。パースに失敗した場合に返すデフォルト値。[`UInt128`](/sql-reference/data-types/int-uint)

**戻り値**

変換に成功した場合は `UInt128` 型の値を返し、失敗した場合は指定されていればデフォルト値を、指定されていなければ 0 を返します。[`UInt128`](/sql-reference/data-types/int-uint)

**例**

**変換が成功する例**

```sql title=Query
SELECT toUInt128OrDefault('128', CAST('0', 'UInt128'))
```

```response title=Response
128
```

**変換に失敗**

```sql title=Query
SELECT toUInt128OrDefault('abc', CAST('0', 'UInt128'))
```

```response title=Response
0
```


## toUInt128OrNull {#toUInt128OrNull}

導入バージョン: v21.6

[`toUInt128`](#toUInt128) と同様に、この関数は入力値を [`UInt128`](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合には `NULL` を返します。

サポートされる引数:

* (U)Int* の文字列表現。

サポートされない引数（`NULL` を返す）:

* `NaN` や `Inf` を含む Float* 型の値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toUInt128OrNull('0xc0fe');`。

:::note
入力値が [`UInt128`](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローを起こします。
これはエラーとは見なされません。
:::

関連項目:

* [`toUInt128`](#toUInt128)。
* [`toUInt128OrZero`](#toUInt128OrZero)。
* [`toUInt128OrDefault`](#toUInt128OrDefault)。

**構文**

```sql
toUInt128OrNull(x)
```

**引数**

* `x` — 数値を表す文字列。[`String`](/sql-reference/data-types/string)

**返される値**

UInt128 型の値を返します。変換に失敗した場合は `NULL` を返します。[`UInt128`](/sql-reference/data-types/int-uint) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT
    toUInt128OrNull('128'),
    toUInt128OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt128OrNull('128'): 128
toUInt128OrNull('abc'): \N
```


## toUInt128OrZero {#toUInt128OrZero}

導入バージョン: v1.1

[`toUInt128`](#toUInt128) と同様に、この関数は入力値を [`UInt128`](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合には `0` を返します。

サポートされる引数:

* (U)Int* の文字列表現。

サポートされない引数（`0` を返す）:

* `NaN` や `Inf` を含む Float* 値の文字列表現。
* 2 進数および 16 進数値の文字列表現（例: `SELECT toUInt128OrZero('0xc0fe');`）。

:::note
入力値が [`UInt128`](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生しますが、これはエラーとは見なされません。
:::

関連項目:

* [`toUInt128`](#toUInt128)。
* [`toUInt128OrNull`](#toUInt128OrNull)。
* [`toUInt128OrDefault`](#toUInt128OrDefault)。

**構文**

```sql
toUInt128OrZero(x)
```

**引数**

* `x` — 数値を表す文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

変換に成功した場合は UInt128 型の値を返し、失敗した場合は `0` を返します。[`UInt128`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toUInt128OrZero('128'),
    toUInt128OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt128OrZero('128'): 128
toUInt128OrZero('abc'): 0
```


## toUInt16 {#toUInt16}

導入バージョン: v1.1

入力値を [`UInt16`](../data-types/int-uint.md) 型の値に変換します。
エラーが発生した場合は例外をスローします。

サポートされる引数:

* (U)Int* 型の値またはその文字列表現。
* Float* 型の値。

サポートされない引数:

* `NaN` や `Inf` を含む、Float* 値の文字列表現。
* `SELECT toUInt16('0xc0fe');` のような、2 進数値および 16 進数値の文字列表現。

:::note
入力値が [`UInt16`](../data-types/int-uint.md) の表現可能範囲外の場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
例: `SELECT toUInt16(65536) == 0;`。
:::

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を行い、小数部分の桁を切り捨てます。
:::

関連項目:

* [`toUInt16OrZero`](#toUInt16OrZero)。
* [`toUInt16OrNull`](#toUInt16OrNull)。
* [`toUInt16OrDefault`](#toUInt16OrDefault)。

**構文**

```sql
toUInt16(expr)
```

**引数**

* `expr` — 数値、または数値を表す文字列のいずれかを返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**戻り値**

16 ビット符号なし整数値を返します。[`UInt16`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toUInt16(16),
    toUInt16(16.16),
    toUInt16('16')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt16(16):    16
toUInt16(16.16): 16
toUInt16('16'):  16
```


## toUInt16OrDefault {#toUInt16OrDefault}

導入バージョン: v21.11

[`toUInt16`](#toUInt16) と同様に、この関数は入力値を [UInt16](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 値が渡されていない場合、エラー時には `0` が返されます。

**構文**

```sql
toUInt16OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[`String`](/sql-reference/data-types/string) または [`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float)
* `default` — 省略可能。解析に失敗した場合に返されるデフォルト値。[`UInt16`](/sql-reference/data-types/int-uint)

**戻り値**

変換に成功した場合は UInt16 型の値を返します。失敗した場合は、デフォルト値が指定されていればその値を、指定されていなければ 0 を返します。[`UInt16`](/sql-reference/data-types/int-uint)

**例**

**変換が成功する例**

```sql title=Query
SELECT toUInt16OrDefault('16', CAST('0', 'UInt16'))
```

```response title=Response
16
```

**変換失敗**

```sql title=Query
SELECT toUInt16OrDefault('abc', CAST('0', 'UInt16'))
```

```response title=Response
0
```


## toUInt16OrNull {#toUInt16OrNull}

導入バージョン: v1.1

[`toUInt16`](#toUInt16) と同様に、この関数は入力値を [`UInt16`](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`NULL` を返す）:

* `NaN` や `Inf` を含む Float* 型の値の文字列表現。
* `SELECT toUInt16OrNull('0xc0fe');` のような、2 進数および 16 進数値の文字列表現。

:::note
入力値が [`UInt16`](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローが発生します。
これはエラーとはみなされません。
:::

関連項目:

* [`toUInt16`](#toUInt16)。
* [`toUInt16OrZero`](#toUInt16OrZero)。
* [`toUInt16OrDefault`](#toUInt16OrDefault)。

**構文**

```sql
toUInt16OrNull(x)
```

**引数**

* `x` — 数値を表す文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

変換が成功した場合は型 `UInt16` の値を返し、失敗した場合は `NULL` を返します。[`UInt16`](/sql-reference/data-types/int-uint) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT
    toUInt16OrNull('16'),
    toUInt16OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt16OrNull('16'):  16
toUInt16OrNull('abc'): \N
```


## toUInt16OrZero {#toUInt16OrZero}

導入バージョン: v1.1

[`toUInt16`](#toUInt16) と同様に、この関数は入力値を [`UInt16`](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`0` を返す）:

* `NaN` や `Inf` を含む Float* 値の文字列表現。
* `SELECT toUInt16OrZero('0xc0fe');` のような、バイナリ値および 16 進値の文字列表現。

:::note
入力値が [`UInt16`](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

関連項目:

* [`toUInt16`](#toUInt16)。
* [`toUInt16OrNull`](#toUInt16OrNull)。
* [`toUInt16OrDefault`](#toUInt16OrDefault)。

**構文**

```sql
toUInt16OrZero(x)
```

**引数**

* `x` — 数値の文字列表現。[`String`](/sql-reference/data-types/string)

**返される値**

変換が成功した場合は `UInt16` 型の値を返し、変換に失敗した場合は `0` を返します。[`UInt16`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toUInt16OrZero('16'),
    toUInt16OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt16OrZero('16'):  16
toUInt16OrZero('abc'): 0
```


## toUInt256 {#toUInt256}

導入バージョン: v1.1

入力値を UInt256 型の値に変換します。
エラーが発生した場合は例外をスローします。
この関数はゼロ方向への丸めを行い、数値の小数桁を切り捨てます。

サポートされる引数:

* 型 (U)Int* の値またはその文字列表現。
* 型 Float* の値。

サポートされない引数:

* `NaN` や `Inf` を含む、型 Float* の値の文字列表現。
* `SELECT toUInt256('0xc0fe');` のような、2 進数および 16 進数の値の文字列表現。

:::note
入力値が UInt256 の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

関連項目:

* [`toUInt256OrZero`](#toUInt256OrZero)。
* [`toUInt256OrNull`](#toUInt256OrNull)。
* [`toUInt256OrDefault`](#toUInt256OrDefault)。

**構文**

```sql
toUInt256(expr)
```

**引数**

* `expr` — 数値または数値を表す文字列を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**戻り値**

256 ビットの符号なし整数値を返します。[`UInt256`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toUInt256(256),
    toUInt256(256.256),
    toUInt256('256')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt256(256):     256
toUInt256(256.256): 256
toUInt256('256'):   256
```


## toUInt256OrDefault {#toUInt256OrDefault}

導入: v21.11

[`toUInt256`](#toUInt256) と同様に、この関数は入力値を [UInt256](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 値が渡されない場合、エラー時には `0` が返されます。

**構文**

```sql
toUInt256OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[`String`](/sql-reference/data-types/string) または [`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float)
* `default` — 省略可能。解析（パース）に失敗した場合に返されるデフォルト値。[`UInt256`](/sql-reference/data-types/int-uint)

**戻り値**

成功した場合は `UInt256` 型の値を返し、失敗した場合は、指定されていればデフォルト値を、指定されていなければ 0 を返します。[`UInt256`](/sql-reference/data-types/int-uint)

**例**

**変換が成功する例**

```sql title=Query
SELECT toUInt256OrDefault('-256', CAST('0', 'UInt256'))
```

```response title=Response
0
```

**変換に失敗した場合**

```sql title=Query
SELECT toUInt256OrDefault('abc', CAST('0', 'UInt256'))
```

```response title=Response
0
```


## toUInt256OrNull {#toUInt256OrNull}

導入バージョン: v20.8

[`toUInt256`](#toUInt256) と同様に、この関数は入力値を [`UInt256`](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

サポートされる引数:

* (U)Int* の文字列表現。

サポートされない引数（`NULL` を返す）:

* `NaN` および `Inf` を含む Float* 値の文字列表現。
* `SELECT toUInt256OrNull('0xc0fe');` のような、2 進数および 16 進数の値を表す文字列表現。

:::note
入力値が [`UInt256`](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
:::

参照:

* [`toUInt256`](#toUInt256)。
* [`toUInt256OrZero`](#toUInt256OrZero)。
* [`toUInt256OrDefault`](#toUInt256OrDefault)。

**構文**

```sql
toUInt256OrNull(x)
```

**引数**

* `x` — 数値を表す文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

変換が成功した場合は型 `UInt256` の値を返し、失敗した場合は `NULL` を返します。[`UInt256`](/sql-reference/data-types/int-uint) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT
    toUInt256OrNull('256'),
    toUInt256OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt256OrNull('256'): 256
toUInt256OrNull('abc'): \N
```


## toUInt256OrZero {#toUInt256OrZero}

導入バージョン: v20.8

[`toUInt256`](#toUInt256) と同様に、この関数は入力値を [`UInt256`](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

サポートされる引数:

* (U)Int* 型の値の文字列表現。

サポートされない引数（`0` を返す）:

* `NaN` や `Inf` を含む Float* 型の値の文字列表現。
* `SELECT toUInt256OrZero('0xc0fe');` のような、2進数および16進数の値の文字列表現。

:::note
入力値が [`UInt256`](../data-types/int-uint.md) の範囲で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

関連項目:

* [`toUInt256`](#toUInt256)。
* [`toUInt256OrNull`](#toUInt256OrNull)。
* [`toUInt256OrDefault`](#toUInt256OrDefault)。

**構文**

```sql
toUInt256OrZero(x)
```

**引数**

* `x` — 数値を表す文字列。[`String`](/sql-reference/data-types/string)

**返される値**

型 `UInt256` の値。変換に失敗した場合は `0` を返します。[`UInt256`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toUInt256OrZero('256'),
    toUInt256OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt256OrZero('256'): 256
toUInt256OrZero('abc'): 0
```


## toUInt32 {#toUInt32}

導入バージョン: v1.1

入力値を [`UInt32`](../data-types/int-uint.md) 型の値に変換します。
エラーが発生した場合は例外をスローします。

サポートされる引数:

* 型が (U)Int* の値、またはその文字列表現。
* 型が Float* の値。

サポートされない引数:

* `NaN` や `Inf` を含む、Float* 値の文字列表現。
* `SELECT toUInt32('0xc0fe');` のような、2 進数および 16 進数値の文字列表現。

:::note
入力値が [`UInt32`](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
例: `SELECT toUInt32(4294967296) == 0;`
:::

:::note
この関数は [ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用し、小数部の桁を切り捨てます。
:::

関連項目:

* [`toUInt32OrZero`](#toUInt32OrZero)
* [`toUInt32OrNull`](#toUInt32OrNull)
* [`toUInt32OrDefault`](#toUInt32OrDefault)

**構文**

```sql
toUInt32(expr)
```

**引数**

* `expr` — 数値または数値を表す文字列を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**戻り値**

32 ビットの符号なし整数値を返します。[`UInt32`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toUInt32(32),
    toUInt32(32.32),
    toUInt32('32')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt32(32):    32
toUInt32(32.32): 32
toUInt32('32'):  32
```


## toUInt32OrDefault {#toUInt32OrDefault}

導入バージョン: v21.11

[`toUInt32`](#toUInt32) と同様に、この関数は入力値を型 [UInt32](../data-types/int-uint.md) の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 値が渡されない場合は、エラー時に `0` が返されます。

**構文**

```sql
toUInt32OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[`String`](/sql-reference/data-types/string) または [`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float)
* `default` — 省略可能。パースに失敗した場合に返す既定値。[`UInt32`](/sql-reference/data-types/int-uint)

**戻り値**

成功した場合は UInt32 型の値を返します。失敗した場合は、既定値が指定されていればその値を、指定されていなければ 0 を返します。[`UInt32`](/sql-reference/data-types/int-uint)

**例**

**変換が成功する例**

```sql title=Query
SELECT toUInt32OrDefault('32', CAST('0', 'UInt32'))
```

```response title=Response
32
```

**変換失敗**

```sql title=Query
SELECT toUInt32OrDefault('abc', CAST('0', 'UInt32'))
```

```response title=Response
0
```


## toUInt32OrNull {#toUInt32OrNull}

導入バージョン: v1.1

[`toUInt32`](#toUInt32) と同様に、この関数は入力値を [`UInt32`](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`NULL` を返す）:

* `NaN` や `Inf` を含む Float* 型の値の文字列表現。
* 2 進数および 16 進数値の文字列表現（例: `SELECT toUInt32OrNull('0xc0fe');`）。

:::note
入力値が [`UInt32`](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
:::

参照:

* [`toUInt32`](#toUInt32)。
* [`toUInt32OrZero`](#toUInt32OrZero)。
* [`toUInt32OrDefault`](#toUInt32OrDefault)。

**構文**

```sql
toUInt32OrNull(x)
```

**引数**

* `x` — 数値を表す文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

変換に成功した場合は型 `UInt32` の値を返し、失敗した場合は `NULL` を返します。[`UInt32`](/sql-reference/data-types/int-uint) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT
    toUInt32OrNull('32'),
    toUInt32OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt32OrNull('32'):  32
toUInt32OrNull('abc'): \N
```


## toUInt32OrZero {#toUInt32OrZero}

導入バージョン: v1.1

[`toUInt32`](#toUInt32) と同様に、この関数は入力値を [`UInt32`](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合には `0` を返します。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`0` を返す）:

* `NaN` や `Inf` を含む Float* 値の文字列表現。
* `SELECT toUInt32OrZero('0xc0fe');` のような、2 進数値や 16 進数値の文字列表現。

:::note
入力値が [`UInt32`](../data-types/int-uint.md) の範囲内で表現できない場合、結果がオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

関連項目:

* [`toUInt32`](#toUInt32)。
* [`toUInt32OrNull`](#toUInt32OrNull)。
* [`toUInt32OrDefault`](#toUInt32OrDefault)。

**構文**

```sql
toUInt32OrZero(x)
```

**引数**

* `x` — 数値を表す文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

変換に成功した場合は型 `UInt32` の値を返し、失敗した場合は `0` を返します。[`UInt32`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toUInt32OrZero('32'),
    toUInt32OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt32OrZero('32'):  32
toUInt32OrZero('abc'): 0
```


## toUInt64 {#toUInt64}

導入バージョン: v1.1

入力値を[`UInt64`](../data-types/int-uint.md)型の値に変換します。
エラーが発生した場合は例外をスローします。

サポートされる引数:

* 型 (U)Int* の値またはその文字列表現。
* 型 Float* の値。

サポートされない型:

* `NaN` や `Inf` を含む、Float* 値の文字列表現。
* バイナリ値および 16 進値の文字列表現（例: `SELECT toUInt64('0xc0fe');`）。

:::note
入力値が[`UInt64`](../data-types/int-uint.md)の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
例: `SELECT toUInt64(18446744073709551616) == 0;`
:::

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を行います。つまり、小数部の桁を切り捨てます。
:::

関連項目:

* [`toUInt64OrZero`](#toUInt64OrZero)。
* [`toUInt64OrNull`](#toUInt64OrNull)。
* [`toUInt64OrDefault`](#toUInt64OrDefault)。

**構文**

```sql
toUInt64(expr)
```

**引数**

* `expr` — 数値または数値を表す文字列を返す式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**戻り値**

64 ビット符号なし整数値を返します。[`UInt64`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toUInt64(64),
    toUInt64(64.64),
    toUInt64('64')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt64(64):    64
toUInt64(64.64): 64
toUInt64('64'):  64
```


## toUInt64OrDefault {#toUInt64OrDefault}

導入バージョン: v21.11

[`toUInt64`](#toUInt64) と同様に、この関数は入力値を [UInt64](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合にはデフォルト値を返します。
`default` 引数が渡されていない場合は、エラー時に `0` が返されます。

**構文**

```sql
toUInt64OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式です。[`String`](/sql-reference/data-types/string) または [`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float)
* `default` — 省略可能。パースに失敗した場合に返されるデフォルト値。[`UInt64`](/sql-reference/data-types/int-uint)

**返される値**

成功した場合は UInt64 型の値を返し、そうでない場合は、指定されていればデフォルト値を返し、指定されていなければ 0 を返します。[`UInt64`](/sql-reference/data-types/int-uint)

**例**

**変換が成功する例**

```sql title=Query
SELECT toUInt64OrDefault('64', CAST('0', 'UInt64'))
```

```response title=Response
64
```

**変換に失敗**

```sql title=Query
SELECT toUInt64OrDefault('abc', CAST('0', 'UInt64'))
```

```response title=Response
0
```


## toUInt64OrNull {#toUInt64OrNull}

導入バージョン: v1.1

[`toUInt64`](#toUInt64) と同様に、この関数は入力値を [`UInt64`](../data-types/int-uint.md) 型の値に変換しますが、エラーの場合は `NULL` を返します。

サポートされる引数:

* (U)Int* の文字列表現。

サポートされない引数（`NULL` を返す）:

* `NaN` や `Inf` を含む Float* 型の値の文字列表現。
* 2進数および16進数の文字列表現（例: `SELECT toUInt64OrNull('0xc0fe');`）。

:::note
入力値が [`UInt64`](../data-types/int-uint.md) の範囲で表現できない場合、結果はオーバーフローまたはアンダーフローを起こします。
これはエラーとはみなされません。
:::

関連項目:

* [`toUInt64`](#toUInt64)。
* [`toUInt64OrZero`](#toUInt64OrZero)。
* [`toUInt64OrDefault`](#toUInt64OrDefault)。

**構文**

```sql
toUInt64OrNull(x)
```

**引数**

* `x` — 数値を表す文字列。[`String`](/sql-reference/data-types/string)

**返される値**

変換が成功した場合は `UInt64` 型の値を返し、失敗した場合は `NULL` を返します。[`UInt64`](/sql-reference/data-types/int-uint) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT
    toUInt64OrNull('64'),
    toUInt64OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt64OrNull('64'):  64
toUInt64OrNull('abc'): \N
```


## toUInt64OrZero {#toUInt64OrZero}

導入バージョン: v1.1

[`toUInt64`](#toUInt64) と同様に、この関数は入力値を型 [`UInt64`](../data-types/int-uint.md) の値に変換しますが、エラーが発生した場合は `0` を返します。

サポートされる引数:

* (U)Int* の文字列表現。

サポートされない引数（`0` を返す）:

* `NaN` や `Inf` を含む Float* 値の文字列表現。
* `SELECT toUInt64OrZero('0xc0fe');` のようなバイナリ値および 16 進値の文字列表現。

:::note
入力値が [`UInt64`](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

関連項目:

* [`toUInt64`](#toUInt64)。
* [`toUInt64OrNull`](#toUInt64OrNull)。
* [`toUInt64OrDefault`](#toUInt64OrDefault)。

**構文**

```sql
toUInt64OrZero(x)
```

**引数**

* `x` — 数値を表す文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

変換に成功した場合は UInt64 型の値を返し、失敗した場合は `0` を返します。[`UInt64`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toUInt64OrZero('64'),
    toUInt64OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt64OrZero('64'):  64
toUInt64OrZero('abc'): 0
```


## toUInt8 {#toUInt8}

導入バージョン: v1.1

入力値を [`UInt8`](../data-types/int-uint.md) 型に変換します。
エラーが発生した場合は例外をスローします。

サポートされる引数:

* 型 (U)Int* の値またはその文字列表現。
* 型 Float* の値。

サポートされない引数:

* `NaN` や `Inf` を含む、Float* 値の文字列表現。
* 2進数および16進数による値の文字列表現。例: `SELECT toUInt8('0xc0fe');`。

:::note
入力値が [UInt8](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
例: `SELECT toUInt8(256) == 0;`。
:::

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。これは数値の小数部を切り捨てることを意味します。
:::

関連項目:

* [`toUInt8OrZero`](#toUInt8OrZero)。
* [`toUInt8OrNull`](#toUInt8OrNull)。
* [`toUInt8OrDefault`](#toUInt8OrDefault)。

**構文**

```sql
toUInt8(expr)
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。 [`Expression`](/sql-reference/data-types/special-data-types/expression)

**戻り値**

8ビット符号なし整数値を返します。 [`UInt8`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toUInt8(8),
    toUInt8(8.8),
    toUInt8('8')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt8(8):   8
toUInt8(8.8): 8
toUInt8('8'): 8
```


## toUInt8OrDefault {#toUInt8OrDefault}

導入バージョン: v21.11

[`toUInt8`](#toUInt8) と同様に、この関数は入力値を [UInt8](../data-types/int-uint.md) 型の値に変換しますが、エラー発生時にはデフォルト値を返します。
`default` 引数が指定されていない場合、エラー発生時には `0` が返されます。

**構文**

```sql
toUInt8OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[`String`](/sql-reference/data-types/string) または [`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float)
* `default` — 省略可。変換に失敗した場合に返されるデフォルト値。[`UInt8`](/sql-reference/data-types/int-uint)

**戻り値**

成功した場合は UInt8 型の値を返し、失敗した場合は指定されていればデフォルト値を、指定されていなければ 0 を返します。[`UInt8`](/sql-reference/data-types/int-uint)

**例**

**変換が成功する例**

```sql title=Query
SELECT toUInt8OrDefault('8', CAST('0', 'UInt8'))
```

```response title=Response
8
```

**変換に失敗**

```sql title=Query
SELECT toUInt8OrDefault('abc', CAST('0', 'UInt8'))
```

```response title=Response
0
```


## toUInt8OrNull {#toUInt8OrNull}

導入バージョン: v1.1

[`toUInt8`](#toUInt8) と同様に、この関数は入力値を [`UInt8`](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`NULL` を返す）:

* `NaN` や `Inf` を含む、通常の Float* 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toUInt8OrNull('0xc0fe');`。

:::note
入力値が [`UInt8`](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
この場合もエラーとは見なされません。
:::

関連項目:

* [`toUInt8`](#toUInt8)。
* [`toUInt8OrZero`](#toUInt8OrZero)。
* [`toUInt8OrDefault`](#toUInt8OrDefault)。

**構文**

```sql
toUInt8OrNull(x)
```

**引数**

* `x` — 数値を表す文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

変換が成功した場合は型 UInt8 の値を返し、失敗した場合は `NULL` を返します。[`UInt8`](/sql-reference/data-types/int-uint) または [`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

```sql title=Query
SELECT
    toUInt8OrNull('42'),
    toUInt8OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt8OrNull('42'):  42
toUInt8OrNull('abc'): \N
```


## toUInt8OrZero {#toUInt8OrZero}

導入バージョン: v1.1

[`toUInt8`](#toUInt8) と同様に、この関数は入力値を [`UInt8`](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`0` を返す）:

* 通常の Float* 型の値（`NaN` や `Inf` を含む）の文字列表現。
* 2 進数および 16 進数値の文字列表現（例: `SELECT toUInt8OrZero('0xc0fe');`）。

:::note
入力値が [`UInt8`](../data-types/int-uint.md) の範囲内で表現できない場合、結果がオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

参照:

* [`toUInt8`](#toUInt8)。
* [`toUInt8OrNull`](#toUInt8OrNull)。
* [`toUInt8OrDefault`](#toUInt8OrDefault)。

**構文**

```sql
toUInt8OrZero(x)
```

**引数**

* `x` — 数値を表す文字列。[`String`](/sql-reference/data-types/string)

**返り値**

変換に成功した場合は UInt8 型の値を返し、失敗した場合は `0` を返します。[`UInt8`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT
    toUInt8OrZero('-8'),
    toUInt8OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt8OrZero('-8'):  0
toUInt8OrZero('abc'): 0
```


## toUUID {#toUUID}

バージョン v1.1 で導入。

String の値を UUID 型の値に変換します。

**構文**

```sql
toUUID(string)
```

**引数**

* `string` — UUID を表す文字列。[`String`](/sql-reference/data-types/string) または [`FixedString`](/sql-reference/data-types/fixedstring)

**返される値**

UUID の文字列表現から UUID 型の値を返します。[`UUID`](/sql-reference/data-types/uuid)

**例**

**使用例**

```sql title=Query
SELECT toUUID('61f0c404-5cb3-11e7-907b-a6006ad3dba0') AS uuid
```

```response title=Response
┌─────────────────────────────────uuid─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0 │
└──────────────────────────────────────┘
```


## toUUIDOrZero {#toUUIDOrZero}

導入バージョン: v20.12

入力値を [UUID](../data-types/uuid.md) 型の値に変換しますが、エラーが発生した場合はゼロ UUID を返します。
[`toUUID`](/sql-reference/functions/uuid-functions#touuid) と同様ですが、変換エラー時に例外をスローする代わりにゼロ UUID（`00000000-0000-0000-0000-000000000000`）を返します。

サポートされる引数:

* 標準形式の UUID の文字列表現（8-4-4-4-12 個の 16 進数）。
* ハイフンなしの UUID の文字列表現（32 個の 16 進数）。

サポートされない引数（ゼロ UUID を返す）:

* 無効な文字列形式。
* 文字列以外の型。

**構文**

```sql
toUUIDOrZero(x)
```

**引数**

* `x` — UUID を表す文字列表現。[`String`](/sql-reference/data-types/string)

**戻り値**

成功した場合は UUID 値を返し、失敗した場合はゼロ UUID（`00000000-0000-0000-0000-000000000000`）を返します。[`UUID`](/sql-reference/data-types/uuid)

**例**

**使用例**

```sql title=Query
SELECT
    toUUIDOrZero('550e8400-e29b-41d4-a716-446655440000') AS valid_uuid,
    toUUIDOrZero('invalid-uuid') AS invalid_uuid
```

```response title=Response
┌─valid_uuid───────────────────────────┬─invalid_uuid─────────────────────────┐
│ 550e8400-e29b-41d4-a716-446655440000 │ 00000000-0000-0000-0000-000000000000 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```


## toUnixTimestamp64Micro {#toUnixTimestamp64Micro}

導入バージョン: v20.5

[`DateTime64`](/sql-reference/data-types/datetime64) を、マイクロ秒精度が固定された [`Int64`](/sql-reference/data-types/int-uint) 値に変換します。
入力値は、その精度に応じて適切にスケーリングされて拡大または縮小されます。

:::note
出力値は、入力値のタイムゾーンではなく、UTC を基準にしています。
:::

**構文**

```sql
toUnixTimestamp64Micro(value)
```

**引数**

* `value` — 任意の精度を持つ DateTime64 型の値。[`DateTime64`](/sql-reference/data-types/datetime64)

**戻り値**

マイクロ秒単位の Unix タイムスタンプを返します。[`Int64`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
WITH toDateTime64('2025-02-13 23:31:31.011123', 6, 'UTC') AS dt64
SELECT toUnixTimestamp64Micro(dt64);
```

```response title=Response
┌─toUnixTimestamp64Micro(dt64)─┐
│               1739489491011123 │
└────────────────────────────────┘
```


## toUnixTimestamp64Milli {#toUnixTimestamp64Milli}

導入バージョン: v20.5

[`DateTime64`](/sql-reference/data-types/datetime64) を固定ミリ秒精度の [`Int64`](/sql-reference/data-types/int-uint) 値に変換します。
入力値は、その精度に応じて適切にスケールアップまたはスケールダウンされます。

:::note
出力値は、入力値のタイムゾーンではなく、UTC を基準とします。
:::

**構文**

```sql
toUnixTimestamp64Milli(value)
```

**引数**

* `value` — 任意の精度を持つ DateTime64 値。[`DateTime64`](/sql-reference/data-types/datetime64)

**戻り値**

ミリ秒単位の Unix タイムスタンプを返します。[`Int64`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
WITH toDateTime64('2025-02-13 23:31:31.011', 3, 'UTC') AS dt64
SELECT toUnixTimestamp64Milli(dt64);
```

```response title=Response
┌─toUnixTimestamp64Milli(dt64)─┐
│                1739489491011 │
└──────────────────────────────┘
```


## toUnixTimestamp64Nano {#toUnixTimestamp64Nano}

導入バージョン: v20.5

[`DateTime64`](/sql-reference/data-types/datetime64) を、ナノ秒の固定精度を持つ [`Int64`](/sql-reference/functions/type-conversion-functions#toint64) 値に変換します。
入力値は、その精度に応じて適切に拡大または縮小されます。

:::note
出力値は、入力値のタイムゾーンではなく、UTC を基準としています。
:::

**構文**

```sql
toUnixTimestamp64Nano(value)
```

**引数**

* `value` — 任意の精度を持つ DateTime64 値。[`DateTime64`](/sql-reference/data-types/datetime64)

**戻り値**

ナノ秒精度の Unix タイムスタンプを返します。[`Int64`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
WITH toDateTime64('2025-02-13 23:31:31.011123456', 9, 'UTC') AS dt64
SELECT toUnixTimestamp64Nano(dt64);
```

```response title=Response
┌─toUnixTimestamp64Nano(dt64)────┐
│            1739489491011123456 │
└────────────────────────────────┘
```


## toUnixTimestamp64Second {#toUnixTimestamp64Second}

導入バージョン: v24.12

[`DateTime64`](/sql-reference/data-types/datetime64) を秒単位の固定精度を持つ [`Int64`](/sql-reference/data-types/int-uint) 値に変換します。
入力値は、その小数精度に応じて適切にスケールアップまたはスケールダウンされます。

:::note
出力値は入力値のタイムゾーンではなく、UTC を基準とします。
:::

**構文**

```sql
toUnixTimestamp64Second(value)
```

**引数**

* `value` — 任意の精度を持つ DateTime64 型の値。[`DateTime64`](/sql-reference/data-types/datetime64)

**戻り値**

秒単位の Unix タイムスタンプを返します。[`Int64`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
WITH toDateTime64('2025-02-13 23:31:31.011', 3, 'UTC') AS dt64
SELECT toUnixTimestamp64Second(dt64);
```

```response title=Response
┌─toUnixTimestamp64Second(dt64)─┐
│                    1739489491 │
└───────────────────────────────┘
```

{/*AUTOGENERATED_END*/ }
