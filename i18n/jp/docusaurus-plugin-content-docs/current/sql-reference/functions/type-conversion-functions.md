---
description: '型変換関数に関するドキュメント'
sidebar_label: '型変換'
slug: /sql-reference/functions/type-conversion-functions
title: '型変換関数'
doc_type: 'reference'
---



# 型変換関数



## データ変換時の一般的な問題

ClickHouse は、一般的に [C++ プログラムと同じ動作](https://en.cppreference.com/w/cpp/language/implicit_conversion) を採用しています。

`to<type>` 関数と [cast](#cast) は、いくつかのケースで挙動が異なります。例えば [LowCardinality](../data-types/lowcardinality.md) の場合です。[cast](#cast) は [LowCardinality](../data-types/lowcardinality.md) の特性を削除しますが、`to<type>` 関数は削除しません。[Nullable](../data-types/nullable.md) についても同様です。この挙動は SQL 標準とは互換性がなく、[cast&#95;keep&#95;nullable](../../operations/settings/settings.md/#cast_keep_nullable) 設定を使用して変更できます。

:::note
あるデータ型の値を、より小さいデータ型（例えば `Int64` から `Int32`）や互換性のないデータ型（例えば `String` から `Int`）へ変換する場合、データが失われる可能性があることに注意してください。結果が期待どおりになっているかどうか、必ず慎重に確認してください。
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

`toString` ファミリーの関数は、数値、文字列（FixedString は除く）、日付、および日時の間での変換を行うための関数です。
これらの関数はいずれも 1 つの引数を受け取ります。

- 文字列への変換および文字列からの変換時には、値は TabSeparated 形式（およびほぼすべての他のテキスト形式）と同じルールでフォーマットまたはパースされます。文字列をパースできない場合は、例外がスローされ、リクエストはキャンセルされます。
- 日付と数値を相互に変換する場合、日付は Unix エポックの開始からの経過日数に対応します。
- 日時と数値を相互に変換する場合、日時は Unix エポックの開始からの経過秒数に対応します。
- `DateTime` 型の引数に対する `toString` 関数は、`Europe/Amsterdam` のようなタイムゾーン名を含む 2 つ目の String 型引数を取ることができます。この場合、時刻は指定されたタイムゾーンに従ってフォーマットされます。



## `toDate`/`toDateTime` 関数に関する注意事項

`toDate`/`toDateTime` 関数における日付および日時の形式は、次のように定義されています。

```response
YYYY-MM-DD
YYYY-MM-DD hh:mm:ss
```

例外として、数値型 UInt32、Int32、UInt64、あるいは Int64 から Date への変換において、その数値が 65536 以上の場合、その数値は日数ではなく Unix タイムスタンプとして解釈され、日付に切り捨てられます。
これにより、本来であればエラーとなり、より煩雑な `toDate(toDateTime(unix_timestamp))` と書く必要がある、よくある記述パターン `toDate(unix_timestamp)` をサポートできます。

日付と日時との間の変換は、自然な方法で行われます。すなわち、時刻 0:00 を付加するか、時刻部分を削除するかのいずれかです。

数値型同士の変換は、C++ における異なる数値型間の代入時の規則と同じ規則に従います。

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


## toBool

入力値を [`Bool`](../data-types/boolean.md) 型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toBool(expr)
```

**引数**

* `expr` — 数値または文字列を返す式。[式](/sql-reference/syntax#expressions)。

サポートされる引数は次のとおりです:

* 型 (U)Int8/16/32/64/128/256 の値。
* 型 Float32/64 の値。
* 文字列 `true` または `false`（大文字小文字は区別しない）。

**戻り値**

* 引数の評価結果に基づいて `true` または `false` を返します。[Bool](../data-types/boolean.md)。

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

結果:

```response
toBool(toUInt8(1)):      true
toBool(toInt8(-1)):      true
toBool(toFloat32(1.01)): true
toBool('true'):          true
toBool('false'):         false
toBool('FALSE'):         false
```


## toInt8

入力値を[`Int8`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外を送出します。

**構文**

```sql
toInt8(expr)
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
* 型 Float32/64 の値。

サポートされない引数:

* `NaN` や `Inf` を含む、Float32/64 値の文字列表現。
* バイナリ値や 16 進値の文字列表現。例: `SELECT toInt8('0xc0fe');`。

:::note
入力値が [Int8](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
例: `SELECT toInt8(128) == -128;`。
:::

**戻り値**

* 8 ビット整数型の値。[Int8](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数部を切り捨てます。
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
行 1:
──────
toInt8(-8):   -8
toInt8(-8.8): -8
toInt8('-8'): -8
```

**関連項目**

* [`toInt8OrZero`](#toint8orzero)。
* [`toInt8OrNull`](#toInt8OrNull)。
* [`toInt8OrDefault`](#toint8ordefault)。


## toInt8OrZero

[`toInt8`](#toint8) と同様に、この関数は入力値を [Int8](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toInt8OrZero(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数：

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`0` を返す）：

* `NaN` や `Inf` を含む、通常の Float32/64 値の文字列表現。
* 2 進数および 16 進数の値の文字列表現（例: `SELECT toInt8OrZero('0xc0fe');`）。

:::note
入力値が [Int8](../data-types/int-uint.md) の範囲内で表現できない場合、結果がオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**返される値**

* 成功した場合は 8 ビット整数値、それ以外の場合は `0`。[Int8](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数部の桁を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toInt8OrZero('-8'),
    toInt8OrZero('abc')
FORMAT Vertical;
```

結果:

```response
行 1:
──────
toInt8OrZero('-8'):  -8
toInt8OrZero('abc'): 0
```

**関連項目**

* [`toInt8`](#toint8).
* [`toInt8OrNull`](#toInt8OrNull).
* [`toInt8OrDefault`](#toint8ordefault).


## toInt8OrNull

[`toInt8`](#toint8) と同様に、この関数は入力値を [Int8](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toInt8OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数：

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`\N` を返す）：

* `NaN` や `Inf` を含む Float32/64 型の値の文字列表現。
* 2 進数および 16 進数の値の文字列表現（例：`SELECT toInt8OrNull('0xc0fe');`）。

:::note
入力値が [Int8](../data-types/int-uint.md) の表現可能範囲外の場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**返される値**

* 正常に変換された場合は 8 ビット整数値、それ以外の場合は `NULL`。[Int8](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用し、小数部の桁を切り捨てます。
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


## toInt8OrDefault

[`toInt8`](#toint8) と同様に、この関数は入力値を型 [Int8](../data-types/int-uint.md) の値に変換しますが、エラー発生時にはデフォルト値を返します。
`default` 値が渡されない場合、エラー発生時には `0` が返されます。

**構文**

```sql
toInt8OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (省略可) — `Int8` 型への変換に失敗した場合に返されるデフォルト値。[Int8](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
* 型 Float32/64 の値。

デフォルト値が返される引数:

* `NaN` や `Inf` を含む、Float32/64 の値の文字列表現。
* 2 進表記および 16 進表記の値の文字列表現。例: `SELECT toInt8OrDefault('0xc0fe', CAST('-1', 'Int8'));`。

:::note
入力値が [Int8](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
:::

**戻り値**

* 成功した場合は 8 ビット整数値。失敗した場合は、渡されたデフォルト値、渡されていなければ `0` を返します。[Int8](../data-types/int-uint.md)。

:::note

* この関数は [ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を行い、小数部分の桁を切り捨てます。
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

結果：

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


## toInt16

入力値を[`Int16`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合には例外をスローします。

**構文**

```sql
toInt16(expr)
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[式 (Expression)](/sql-reference/syntax#expressions)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値、またはそれらの文字列表現。
* 型 Float32/64 の値。

サポートされない引数:

* `NaN` や `Inf` を含む、Float32/64 値の文字列表現。
* `SELECT toInt16('0xc0fe');` のような、2 進数や 16 進数を表す文字列。

:::note
入力値が [Int16](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
例: `SELECT toInt16(32768) == -32768;`。
:::

**返される値**

* 16 ビット整数値。[Int16](../data-types/int-uint.md)。

:::note
この関数は [0 への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を行います。つまり、小数部分の桁を切り捨てます。
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

結果:

```response
行 1:
──────
toInt16(-16):    -16
toInt16(-16.16): -16
toInt16('-16'):  -16
```

**関連項目**

* [`toInt16OrZero`](#toint16orzero)。
* [`toInt16OrNull`](#toint16ornull)。
* [`toInt16OrDefault`](#toint16ordefault)。


## toInt16OrZero

[`toInt16`](#toint16) と同様に、この関数は入力値を [Int16](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合には `0` を返します。

**構文**

```sql
toInt16OrZero(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数：

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`0` を返す）：

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toInt16OrZero('0xc0fe');`。

:::note
入力値が [Int16](../data-types/int-uint.md) の範囲内で表現できない場合、結果がオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**返される値**

* 正常に変換できた場合は 16 ビット整数値、それ以外の場合は `0`。[Int16](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数部を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toInt16OrZero('-16'),
    toInt16OrZero('abc')
FORMAT Vertical;
```

結果:

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


## toInt16OrNull

[`toInt16`](#toint16) と同様に、この関数は入力値を [Int16](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合には `NULL` を返します。

**構文**

```sql
toInt16OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされている引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされていない引数（`\N` を返す）:

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toInt16OrNull('0xc0fe');`。

:::note
入力値が [Int16](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローを起こします。
これはエラーとは見なされません。
:::

**返される値**

* 成功した場合は 16 ビット整数値、それ以外の場合は `NULL`。[Int16](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数点以下の桁を切り捨てます。
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
行 1:
──────
toInt16OrNull('-16'): -16
toInt16OrNull('abc'): ᴺᵁᴸᴸ
```

**関連項目**

* [`toInt16`](#toint16).
* [`toInt16OrZero`](#toint16orzero).
* [`toInt16OrDefault`](#toint16ordefault).


## toInt16OrDefault

[`toInt16`](#toint16) と同様に、この関数は入力値を型 [Int16](../data-types/int-uint.md) の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 値が指定されていない場合、エラー時には `0` が返されます。

**構文**

```sql
toInt16OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (省略可) — `Int16` 型への変換に失敗した場合に返されるデフォルト値。[Int16](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
* 型 Float32/64 の値。

デフォルト値が返される引数:

* `NaN` や `Inf` を含む、Float32/64 値の文字列表現。
* 2 進数および 16 進数の値を表す文字列表現。例: `SELECT toInt16OrDefault('0xc0fe', CAST('-1', 'Int16'));`。

:::note
入力値が [Int16](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

* 成功した場合は 16 ビット整数値を返し、それ以外の場合は指定されていればデフォルト値、指定されていなければ `0` を返します。[Int16](../data-types/int-uint.md)。

:::note

* 関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用し、小数部を切り捨てます。
* デフォルト値の型はキャスト先の型と同じでなければなりません。
  :::

**例**

クエリ:

```sql
SELECT
    toInt16OrDefault('-16', CAST('-1', 'Int16')),
    toInt16OrDefault('abc', CAST('-1', 'Int16'))
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toInt16OrDefault('-16', CAST('-1', 'Int16')): -16
toInt16OrDefault('abc', CAST('-1', 'Int16')): -1
```

**関連項目**

* [`toInt16`](#toint16)。
* [`toInt16OrZero`](#toint16orzero)。
* [`toInt16OrNull`](#toint16ornull)。


## toInt32

入力値を[`Int32`](../data-types/int-uint.md)型の値に変換します。エラー時には例外をスローします。

**構文**

```sql
toInt32(expr)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値または文字列表現。
* 型 Float32/64 の値。

サポートされない引数:

* `NaN` や `Inf` を含む、Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toInt32('0xc0fe');`。

:::note
入力値が [Int32](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
例: `SELECT toInt32(2147483648) == -2147483648;`
:::

**戻り値**

* 32 ビット整数値。[Int32](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用し、小数部分を切り捨てます。
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
行 1:
──────
toInt32(-32):    -32
toInt32(-32.32): -32
toInt32('-32'):  -32
```

**関連項目**

* [`toInt32OrZero`](#toint32orzero)。
* [`toInt32OrNull`](#toint32ornull)。
* [`toInt32OrDefault`](#toint32ordefault)。


## toInt32OrZero

[`toInt32`](#toint32) と同様に、この関数は入力値を [Int32](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toInt32OrZero(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数：

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`0` を返す）：

* `NaN` や `Inf` を含む Float32/64 型の値の文字列表現。
* 2 進数値や 16 進数値の文字列表現（例: `SELECT toInt32OrZero('0xc0fe');`）。

:::note
入力値が [Int32](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**戻り値**

* 成功した場合は 32 ビット整数値、それ以外の場合は `0`。[Int32](../data-types/int-uint.md)

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。これは、小数部の桁を切り捨てることを意味します。
:::

**例**

クエリ:

```sql
SELECT
    toInt32OrZero('-32'),
    toInt32OrZero('abc')
FORMAT Vertical;
```

結果:

```response
行 1:
──────
toInt32OrZero('-32'): -32
toInt32OrZero('abc'): 0
```

**関連項目**

* [`toInt32`](#toint32)。
* [`toInt32OrNull`](#toint32ornull)。
* [`toInt32OrDefault`](#toint32ordefault)。


## toInt32OrNull

[`toInt32`](#toint32) と同様に、この関数は入力値を [Int32](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toInt32OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`\N` を返す）:

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* `SELECT toInt32OrNull('0xc0fe');` のような、2 進数および 16 進数値の文字列表現。

:::note
入力値が [Int32](../data-types/int-uint.md) の範囲内で表現できない場合、結果がオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**返される値**

* 成功した場合は 32 ビット整数値、それ以外の場合は `NULL`。[Int32](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は [ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用します。つまり、小数部の桁を切り捨てます。
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
行 1:
──────
toInt32OrNull('-32'): -32
toInt32OrNull('abc'): ᴺᵁᴸᴸ
```

**関連項目**

* [`toInt32`](#toint32).
* [`toInt32OrZero`](#toint32orzero).
* [`toInt32OrDefault`](#toint32ordefault).


## toInt32OrDefault

[`toInt32`](#toint32) と同様に、この関数は入力値を [Int32](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 値が指定されない場合、エラー時には `0` が返されます。

**構文**

```sql
toInt32OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (省略可能) — `Int32` 型へのパースに失敗した場合に返す既定値。[Int32](../data-types/int-uint.md)。

サポートされる引数:

* (U)Int8/16/32/64/128/256 型の値、またはその文字列表現。
* Float32/64 型の値。

既定値が返される引数:

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toInt32OrDefault('0xc0fe', CAST('-1', 'Int32'));`。

:::note
入力値が [Int32](../data-types/int-uint.md) の範囲で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

* 成功した場合は 32 ビット整数値を返し、そうでない場合は指定されていれば既定値を、指定されていなければ `0` を返します。[Int32](../data-types/int-uint.md)。

:::note

* この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。これは数値の小数部を切り捨てることを意味します。
* 既定値の型はキャスト先の型と同じである必要があります。
  :::

**例**

クエリ:

```sql
SELECT
    toInt32OrDefault('-32', CAST('-1', 'Int32')),
    toInt32OrDefault('abc', CAST('-1', 'Int32'))
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toInt32OrDefault('-32', CAST('-1', 'Int32')): -32
toInt32OrDefault('abc', CAST('-1', 'Int32')): -1
```

**関連項目**

* [`toInt32`](#toint32).
* [`toInt32OrZero`](#toint32orzero).
* [`toInt32OrNull`](#toint32ornull).


## toInt64

入力値を[`Int64`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外を送出します。

**構文**

```sql
toInt64(expr)
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値またはその文字列表現。
* 型 Float32/64 の値。

サポートされない型:

* Float32/64 の値を表す文字列（`NaN` や `Inf` を含む）。
* 2 進数および 16 進数の値を表す文字列（例: `SELECT toInt64('0xc0fe');`）。

:::note
入力値が [Int64](../data-types/int-uint.md) の範囲で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
例: `SELECT toInt64(9223372036854775808) == -9223372036854775808;`
:::

**返される値**

* 64 ビット整数値。[Int64](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部を切り捨てます。
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

結果：

```response
行 1:
──────
toInt64(-64):    -64
toInt64(-64.64): -64
toInt64('-64'):  -64
```

**関連項目**

* [`toInt64OrZero`](#toint64orzero)。
* [`toInt64OrNull`](#toint64ornull)。
* [`toInt64OrDefault`](#toint64ordefault)。


## toInt64OrZero

[`toInt64`](#toint64) と同様に、この関数は入力値を [Int64](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toInt64OrZero(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数：

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`0` を返す）：

* `NaN` や `Inf` を含む Float32/64 の文字列表現。
* 2 進数および 16 進数の文字列表現。例: `SELECT toInt64OrZero('0xc0fe');`。

:::note
入力値が [Int64](../data-types/int-uint.md) の表現範囲外の場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
:::

**戻り値**

* 成功した場合は 64 ビット整数値、それ以外の場合は `0`。[Int64](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数部分を切り捨てます。
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

* [`toInt64`](#toint64).
* [`toInt64OrNull`](#toint64ornull).
* [`toInt64OrDefault`](#toint64ordefault).


## toInt64OrNull

[`toInt64`](#toint64) と同様に、この関数は入力値を [Int64](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toInt64OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`\N` を返す）:

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* `SELECT toInt64OrNull('0xc0fe');` のような、2 進数および 16 進数値の文字列表現。

:::note
入力値が [Int64](../data-types/int-uint.md) の表現可能範囲外の場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**返される値**

* 成功した場合は 64 ビット整数値、それ以外の場合は `NULL`。[Int64](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向の丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数部分の桁を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toInt64OrNull('-64'),
    toInt64OrNull('abc')
FORMAT Vertical;
```

結果：

```response
行 1:
──────
toInt64OrNull('-64'): -64
toInt64OrNull('abc'): ᴺᵁᴸᴸ
```

**関連項目**

* [`toInt64`](#toint64).
* [`toInt64OrZero`](#toint64orzero).
* [`toInt64OrDefault`](#toint64ordefault).


## toInt64OrDefault

[`toInt64`](#toint64) と同様に、この関数は入力値を [Int64](../data-types/int-uint.md) 型の値に変換しますが、エラー時にはデフォルト値を返します。
`default` 値が渡されていない場合、エラー時には `0` が返されます。

**構文**

```sql
toInt64OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (省略可) — `Int64` 型への変換に失敗した場合に返される既定値。[Int64](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
* 型 Float32/64 の値。

既定値が返される引数:

* Float32/64 の値の文字列表現（`NaN` および `Inf` を含む）。
* 2 進数および 16 進数値の文字列表現（例: `SELECT toInt64OrDefault('0xc0fe', CAST('-1', 'Int64'));`）。

:::note
入力値が [Int64](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
:::

**戻り値**

* 成功した場合は 64 ビット整数値を返し、失敗した場合は指定されていれば既定値を、指定されていなければ `0` を返します。[Int64](../data-types/int-uint.md)。

:::note

* この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を行い、小数部の桁を切り捨てます。
* 既定値の型はキャスト先の型と同じでなければなりません。
  :::

**例**

クエリ:

```sql
SELECT
    toInt64OrDefault('-64', CAST('-1', 'Int64')),
    toInt64OrDefault('abc', CAST('-1', 'Int64'))
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toInt64OrDefault('-64', CAST('-1', 'Int64')): -64
toInt64OrDefault('abc', CAST('-1', 'Int64')): -1
```

**関連項目**

* [`toInt64`](#toint64).
* [`toInt64OrZero`](#toint64orzero).
* [`toInt64OrNull`](#toint64ornull).


## toInt128

入力値を [`Int128`](../data-types/int-uint.md) 型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toInt128(expr)
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数：

* 型 (U)Int8/16/32/64/128/256 の値またはその文字列表現。
* 型 Float32/64 の値。

サポートされない引数：

* Float32/64 の値を表す文字列（`NaN` や `Inf` を含むもの）。
* 2 進数および 16 進数値の文字列表現。例：`SELECT toInt128('0xc0fe');`。

:::note
入力値が [Int128](../data-types/int-uint.md) の範囲で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**戻り値**

* 128 ビット整数値。[Int128](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数部分の桁を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toInt128(-128),
    toInt128(-128.8),
    toInt128('-128')
FORMAT Vertical;
```

結果:

```response
行 1:
──────
toInt128(-128):   -128
toInt128(-128.8): -128
toInt128('-128'): -128
```

**関連項目**

* [`toInt128OrZero`](#toint128orzero)。
* [`toInt128OrNull`](#toint128ornull)。
* [`toInt128OrDefault`](#toint128ordefault)。


## toInt128OrZero

[`toInt128`](#toint128) と同様に、この関数は入力値を [Int128](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toInt128OrZero(expr)
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`0` を返す）:

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toInt128OrZero('0xc0fe');`。

:::note
入力値が [Int128](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
:::

**戻り値**

* 成功時は 128 ビット整数値、失敗時は `0`。[Int128](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数部の桁を切り捨てます。
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


## toInt128OrNull

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
* 2 進数値や 16 進数値の文字列表現。例: `SELECT toInt128OrNull('0xc0fe');`。

:::note
入力値が [Int128](../data-types/int-uint.md) の範囲内で表現できない場合、結果がオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**戻り値**

* 成功した場合は 128 ビットの整数値、そうでない場合は `NULL`。[Int128](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を行います。つまり、小数部の桁を切り捨てます。
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
行 1:
──────
toInt128OrNull('-128'): -128
toInt128OrNull('abc'):  ᴺᵁᴸᴸ
```

**関連項目**

* [`toInt128`](#toint128).
* [`toInt128OrZero`](#toint128orzero).
* [`toInt128OrDefault`](#toint128ordefault).


## toInt128OrDefault

[`toInt128`](#toint128) と同様に、この関数は入力値を [Int128](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 値が渡されない場合、エラー時には `0` が返されます。

**構文**

```sql
toInt128OrDefault(expr[, default])
```

**引数**

* `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (省略可能) — `Int128` 型へのパースに失敗した場合に返されるデフォルト値。[Int128](../data-types/int-uint.md)。

サポートされる引数:

* (U)Int8/16/32/64/128/256。
* Float32/64。
* (U)Int8/16/32/128/256 の文字列表現。

デフォルト値が返される引数:

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* 2進数および16進数値の文字列表現。例: `SELECT toInt128OrDefault('0xc0fe', CAST('-1', 'Int128'));`。

:::note
入力値が [Int128](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**戻り値**

* 成功した場合は 128ビット整数値を返し、そうでない場合は指定されていればデフォルト値、指定されていなければ `0` を返します。[Int128](../data-types/int-uint.md)。

:::note

* この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数部分の桁を切り捨てます。
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

結果：

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


## toInt256

入力値を[`Int256`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外をスローします。

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

* `NaN` や `Inf` を含む、Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toInt256('0xc0fe');`。

:::note
入力値が [Int256](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローした値になります。
これはエラーとは見なされません。
:::

**返される値**

* 256 ビット整数値。[Int256](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。これは、小数部を切り捨てることを意味します。
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
行 1:
──────
toInt256(-256):     -256
toInt256(-256.256): -256
toInt256('-256'):   -256
```

**関連項目**

* [`toInt256OrZero`](#toint256orzero)。
* [`toInt256OrNull`](#toint256ornull)。
* [`toInt256OrDefault`](#toint256ordefault)。


## toInt256OrZero

[`toInt256`](#toint256) と同様に、この関数は入力値を [Int256](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toInt256OrZero(x)
```

**引数**

* `x` — 数値を表す文字列。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`0` を返す）:

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現（例: `SELECT toInt256OrZero('0xc0fe');`）。

:::note
入力値が [Int256](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

* 正常に変換された場合は 256 ビット整数値、それ以外の場合は `0`。[Int256](../data-types/int-uint.md)。

:::note
この関数は[0 への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数部の桁を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toInt256OrZero('-256'),
    toInt256OrZero('abc')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toInt256OrZero('-256'): -256
toInt256OrZero('abc'):  0
```

**関連項目**

* [`toInt256`](#toint256).
* [`toInt256OrNull`](#toint256ornull).
* [`toInt256OrDefault`](#toint256ordefault).


## toInt256OrNull

[`toInt256`](#toint256) と同様に、この関数は入力値を型 [Int256](../data-types/int-uint.md) の値に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toInt256OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数：

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`\N` を返す）：

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現（例: `SELECT toInt256OrNull('0xc0fe');`）。

:::note
入力値が [Int256](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**戻り値**

* 成功した場合は 256 ビット整数値、それ以外の場合は `NULL`。[Int256](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用し、小数部を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toInt256OrNull('-256'),
    toInt256OrNull('abc')
FORMAT Vertical;
```

結果：

```response
行 1:
──────
toInt256OrNull('-256'): -256
toInt256OrNull('abc'):  ᴺᵁᴸᴸ
```

**関連項目**

* [`toInt256`](#toint256)。
* [`toInt256OrZero`](#toint256orzero)。
* [`toInt256OrDefault`](#toint256ordefault)。


## toInt256OrDefault

[`toInt256`](#toint256) と同様に、この関数は入力値を [Int256](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 引数が指定されない場合、エラー時には `0` が返されます。

**構文**

```sql
toInt256OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (省略可能) — `Int256` 型への変換に失敗した場合に返すデフォルト値。[Int256](../data-types/int-uint.md)。

サポートされる引数：

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
* 型 Float32/64 の値。

デフォルト値が返される引数：

* `NaN` や `Inf` を含む、Float32/64 値の文字列表現
* 2 進数および 16 進数値の文字列表現。例: `SELECT toInt256OrDefault('0xc0fe', CAST('-1', 'Int256'));`

:::note
入力値が [Int256](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**返される値**

* 成功した場合は 256 ビットの整数値を返し、失敗した場合は指定されていればデフォルト値を、指定されていなければ `0` を返します。[Int256](../data-types/int-uint.md)。

:::note

* この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を行い、小数部分の桁を切り捨てます。
* デフォルト値の型はキャスト先の型と同じでなければなりません。
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


## toUInt8

入力値を [`UInt8`](../data-types/int-uint.md) 型の値に変換します。エラーが発生した場合には例外をスローします。

**構文**

```sql
toUInt8(expr)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
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

* 8 ビットの符号なし整数値。[UInt8](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数部は切り捨てられます。
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
行 1:
──────
toUInt8(8):   8
toUInt8(8.8): 8
toUInt8('8'): 8
```

**関連項目**

* [`toUInt8OrZero`](#touint8orzero)。
* [`toUInt8OrNull`](#touint8ornull)。
* [`toUInt8OrDefault`](#touint8ordefault)。


## toUInt8OrZero

[`toUInt8`](#touint8) と同様に、この関数は入力値を [UInt8](../data-types/int-uint.md) 型の値に変換しますが、エラー時には `0` を返します。

**構文**

```sql
toUInt8OrZero(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`0` を返す）:

* `NaN` や `Inf` を含む、通常の Float32/64 型の値の文字列表現。
* 2 進数および 16 進数値の文字列表現（例: `SELECT toUInt8OrZero('0xc0fe');`）。

:::note
入力値が [UInt8](../data-types/int-uint.md) の範囲内で表現できない場合、結果にオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

* 成功した場合は 8 ビット符号なし整数値、失敗した場合は `0`。[UInt8](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を行い、数値の小数部分を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toUInt8OrZero('-8'),
    toUInt8OrZero('abc')
FORMAT Vertical;
```

結果:

```response
行 1:
──────
toUInt8OrZero('-8'):  0
toUInt8OrZero('abc'): 0
```

**関連項目**

* [`toUInt8`](#touint8)。
* [`toUInt8OrNull`](#touint8ornull)。
* [`toUInt8OrDefault`](#touint8ordefault)。


## toUInt8OrNull

[`toUInt8`](#touint8) と同様に、この関数は入力値を [UInt8](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toUInt8OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`\N` を返す）:

* `NaN` や `Inf` を含む Float32/64 型値の文字列表現。
* `SELECT toUInt8OrNull('0xc0fe');` のような、2進数および16進数値の文字列表現。

:::note
入力値が [UInt8](../data-types/int-uint.md) の範囲内で表現できない場合、結果にオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

* 成功した場合は 8 ビット符号なし整数値、それ以外の場合は `NULL`。[UInt8](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数桁を切り捨てます。
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
行 1:
──────
toUInt8OrNull('8'):   8
toUInt8OrNull('abc'): ᴺᵁᴸᴸ
```

**関連項目**

* [`toUInt8`](#touint8)。
* [`toUInt8OrZero`](#touint8orzero)。
* [`toUInt8OrDefault`](#touint8ordefault)。


## toUInt8OrDefault

[`toUInt8`](#touint8) と同様に、この関数は入力値を型 [UInt8](../data-types/int-uint.md) の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 値が渡されない場合、エラー時には `0` が返されます。

**構文**

```sql
toUInt8OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (省略可能) — `UInt8` 型への変換に失敗した場合に返されるデフォルト値。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

* (U)Int8/16/32/64/128/256 型の値またはその文字列表現。
* Float32/64 型の値。

デフォルト値が返される引数:

* `NaN` および `Inf` を含む、Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toUInt8OrDefault('0xc0fe', CAST('0', 'UInt8'));`。

:::note
入力値が [UInt8](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

* 成功した場合は 8 ビット符号なし整数値を返し、そうでない場合は指定されていればデフォルト値、指定されていなければ `0` を返します。[UInt8](../data-types/int-uint.md)。

:::note

* この関数は [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用します。つまり、小数部の桁を切り捨てます。
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


## toUInt16

入力値を[`UInt16`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toUInt16(expr)
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
* 型 Float32/64 の値。

サポートされない引数:

* `NaN` や `Inf` を含む、Float32/64 値の文字列表現。
* 2進数および16進数値の文字列表現。例: `SELECT toUInt16('0xc0fe');`。

:::note
入力値が [UInt16](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
例: `SELECT toUInt16(65536) == 0;`。
:::

**戻り値**

* 16ビット符号なし整数値。[UInt16](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用し、小数部を切り捨てます。
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

結果：

```response
行 1:
──────
toUInt16(16):    16
toUInt16(16.16): 16
toUInt16('16'):  16
```

**関連項目**

* [`toUInt16OrZero`](#touint16orzero)。
* [`toUInt16OrNull`](#touint16ornull)。
* [`toUInt16OrDefault`](#touint16ordefault)。


## toUInt16OrZero

[`toUInt16`](#touint16) と同様に、この関数は入力値を [UInt16](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toUInt16OrZero(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`0` を返します）:

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* `SELECT toUInt16OrZero('0xc0fe');` のような、2 進数および 16 進数値の文字列表現。

:::note
入力値が [UInt16](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**返り値**

* 成功した場合は 16 ビット符号なし整数値、それ以外の場合は `0`。[UInt16](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数部分の桁は切り捨てられます。
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
行 1:
──────
toUInt16OrZero('16'):  16
toUInt16OrZero('abc'): 0
```

**関連項目**

* [`toUInt16`](#touint16).
* [`toUInt16OrNull`](#touint16ornull).
* [`toUInt16OrDefault`](#touint16ordefault).


## toUInt16OrNull

[`toUInt16`](#touint16) と同様に、この関数は入力値を [UInt16](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toUInt16OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数：

* (U)Int8/16/32/128/256 型の値の文字列表現。

サポートされない引数（`\N` を返す）：

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* バイナリ値および 16 進値の文字列表現。例: `SELECT toUInt16OrNull('0xc0fe');`。

:::note
入力値が [UInt16](../data-types/int-uint.md) の範囲で表現できない場合、結果がオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
:::

**戻り値**

* 成功した場合は 16 ビットの符号なし整数値、それ以外の場合は `NULL`。[UInt16](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。これは数値の小数部を切り捨てることを意味します。
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
行 1:
──────
toUInt16OrNull('16'):  16
toUInt16OrNull('abc'): ᴺᵁᴸᴸ
```

**関連項目**

* [`toUInt16`](#touint16)。
* [`toUInt16OrZero`](#touint16orzero)。
* [`toUInt16OrDefault`](#touint16ordefault)。


## toUInt16OrDefault

[`toUInt16`](#touint16) と同様に、この関数は入力値を型 [UInt16](../data-types/int-uint.md) の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 値が渡されない場合、エラー時には `0` が返されます。

**構文**

```sql
toUInt16OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (任意) — `UInt16` 型への変換に失敗した場合に返されるデフォルト値。[UInt16](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値またはその文字列表現。
* 型 Float32/64 の値。

デフォルト値が返される引数:

* `NaN` や `Inf` を含む、Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toUInt16OrDefault('0xc0fe', CAST('0', 'UInt16'));`。

:::note
入力値が [UInt16](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**返される値**

* 成功した場合は 16 ビット符号なし整数値。失敗した場合は、指定されていればデフォルト値、指定されていなければ `0` を返します。[UInt16](../data-types/int-uint.md)。

:::note

* この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。これは、小数部を切り捨てることを意味します。
* デフォルト値の型は、キャスト先の型と同じでなければなりません。
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


## toUInt32

入力値を [`UInt32`](../data-types/int-uint.md) 型に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toUInt32(expr)
```

**引数**

* `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数：

* 型 (U)Int8/16/32/64/128/256 の値または文字列表現。
* 型 Float32/64 の値。

サポートされない引数：

* `NaN` や `Inf` を含む、Float32/64 値の文字列表現。
* バイナリ値および 16 進値の文字列表現。例：`SELECT toUInt32('0xc0fe');`。

:::note
入力値が [UInt32](../data-types/int-uint.md) の範囲内で表現できない場合、結果がオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
例：`SELECT toUInt32(4294967296) == 0;`
:::

**戻り値**

* 32 ビット符号なし整数値。[UInt32](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。これは、小数桁を切り捨てることを意味します。
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
行 1:
──────
toUInt32(32):    32
toUInt32(32.32): 32
toUInt32('32'):  32
```

**関連項目**

* [`toUInt32OrZero`](#touint32orzero)。
* [`toUInt32OrNull`](#touint32ornull)。
* [`toUInt32OrDefault`](#touint32ordefault)。


## toUInt32OrZero

[`toUInt32`](#touint32) と同様に、この関数は入力値を [UInt32](../data-types/int-uint.md) 型に変換しますが、エラーが発生した場合は `0` を返します。

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
* 2 進数および 16 進数値の文字列表現。例: `SELECT toUInt32OrZero('0xc0fe');`。

:::note
入力値が [UInt32](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

* 成功した場合は 32 ビット符号なし整数値、そうでない場合は `0`。[UInt32](../data-types/int-uint.md)

:::note
この関数は [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)
（ゼロ方向への丸め）を使用し、小数部の桁を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toUInt32OrZero('32'),
    toUInt32OrZero('abc')
FORMAT Vertical;
```

結果:

```response
行 1:
──────
toUInt32OrZero('32'):  32
toUInt32OrZero('abc'): 0
```

**関連項目**

* [`toUInt32`](#touint32)。
* [`toUInt32OrNull`](#touint32ornull)。
* [`toUInt32OrDefault`](#touint32ordefault)。


## toUInt32OrNull

[`toUInt32`](#touint32) と同様に、この関数は入力値を型 [UInt32](../data-types/int-uint.md) の値に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toUInt32OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`\N` を返す）:

* Float32/64 の値（`NaN` や `Inf` を含む）の文字列表現。
* 2 進数および 16 進数の値の文字列表現。例: `SELECT toUInt32OrNull('0xc0fe');`。

:::note
入力値が [UInt32](../data-types/int-uint.md) の範囲内で表現できない場合、結果でオーバーフローまたはアンダーフローが発生します。
これはエラーとはみなされません。
:::

**戻り値**

* 成功した場合は 32 ビット符号なし整数値、それ以外の場合は `NULL`。[UInt32](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)
を使用します。つまり、小数部の桁を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toUInt32OrNull('32'),
    toUInt32OrNull('abc')
FORMAT Vertical;
```

結果:

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


## toUInt32OrDefault

[`toUInt32`](#touint32) と同様に、この関数は入力値を型 [UInt32](../data-types/int-uint.md) の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 引数が指定されていない場合、エラー時には `0` が返されます。

**構文**

```sql
toUInt32OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (省略可) — `UInt32` 型への変換に失敗した場合に返すデフォルト値。[UInt32](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
* 型 Float32/64 の値。

次の場合はデフォルト値が返されます:

* `NaN` や `Inf` を含む、Float32/64 値の文字列表現。
* 2 進数や 16 進数値の文字列表現。例: `SELECT toUInt32OrDefault('0xc0fe', CAST('0', 'UInt32'));`。

:::note
入力値が [UInt32](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

* 変換に成功した場合は 32 ビット符号なし整数値を返し、失敗した場合は渡されたデフォルト値を、デフォルト値が指定されていない場合は `0` を返します。[UInt32](../data-types/int-uint.md)。

:::note

* この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数部の桁を切り捨てます。
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

結果：

```response
行 1:
──────
toUInt32OrDefault('32', CAST('0', 'UInt32')):  32
toUInt32OrDefault('abc', CAST('0', 'UInt32')): 0
```

**関連項目**

* [`toUInt32`](#touint32)
* [`toUInt32OrZero`](#touint32orzero)
* [`toUInt32OrNull`](#touint32ornull)


## toUInt64

入力値を [`UInt64`](../data-types/int-uint.md) 型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toUInt64(expr)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式です。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数：

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
* 型 Float32/64 の値。

サポートされない型：

* Float32/64 の値の文字列表現（`NaN` や `Inf` を含む）。
* 2 進数および 16 進数の値の文字列表現（例: `SELECT toUInt64('0xc0fe');`）。

:::note
入力値が [UInt64](../data-types/int-uint.md) の範囲内で表現できない場合、結果がオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
例: `SELECT toUInt64(18446744073709551616) == 0;`
:::

**戻り値**

* 64 ビット符号なし整数値。[UInt64](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数部の桁を切り捨てます。
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
行 1:
──────
toUInt64(64):    64
toUInt64(64.64): 64
toUInt64('64'):  64
```

**関連項目**

* [`toUInt64OrZero`](#touint64orzero)。
* [`toUInt64OrNull`](#touint64ornull)。
* [`toUInt64OrDefault`](#touint64ordefault)。


## toUInt64OrZero

[`toUInt64`](#touint64) と同様に、この関数は入力値を [UInt64](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toUInt64OrZero(x)
```

**引数**

* `x` — 数値を表す文字列。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 を表す文字列。

サポートされない引数（`0` を返す）:

* `NaN` や `Inf` を含む Float32/64 値を表す文字列。
* 2 進数および 16 進数値を表す文字列。例: `SELECT toUInt64OrZero('0xc0fe');`。

:::note
入力値が [UInt64](../data-types/int-uint.md) の範囲内で表現できない場合、結果にオーバーフローまたはアンダーフローが発生します。
これはエラーとはみなされません。
:::

**戻り値**

* 成功した場合は 64 ビットの符号なし整数値、それ以外の場合は `0`。[UInt64](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。これは、小数部の桁を切り捨てることを意味します。
:::

**例**

クエリ:

```sql
SELECT
    toUInt64OrZero('64'),
    toUInt64OrZero('abc')
FORMAT Vertical;
```

結果：

```response
行 1:
──────
toUInt64OrZero('64'):  64
toUInt64OrZero('abc'): 0
```

**関連項目**

* [`toUInt64`](#touint64)。
* [`toUInt64OrNull`](#touint64ornull)。
* [`toUInt64OrDefault`](#touint64ordefault)。


## toUInt64OrNull

[`toUInt64`](#touint64) と同様に、この関数は入力値を [UInt64](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toUInt64OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`\N` を返す）:

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* `SELECT toUInt64OrNull('0xc0fe');` のような、バイナリ値や 16 進数値の文字列表現。

:::note
入力値が [UInt64](../data-types/int-uint.md) の範囲で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとはみなされません。
:::

**返される値**

* 正常に変換された場合は 64 ビット符号なし整数値、それ以外の場合は `NULL`。[UInt64](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用するため、小数部分の桁は切り捨てられます。
:::

**例**

クエリ:

```sql
SELECT
    toUInt64OrNull('64'),
    toUInt64OrNull('abc')
FORMAT Vertical;
```

結果：

```response
行 1:
──────
toUInt64OrNull('64'):  64
toUInt64OrNull('abc'): ᴺᵁᴸᴸ
```

**関連項目**

* [`toUInt64`](#touint64)。
* [`toUInt64OrZero`](#touint64orzero)。
* [`toUInt64OrDefault`](#touint64ordefault)。


## toUInt64OrDefault

[`toUInt64`](#touint64) と同様に、この関数は入力値を型 [UInt64](../data-types/int-uint.md) の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 値が渡されていない場合は、エラーが発生した際に `0` が返されます。

**構文**

```sql
toUInt64OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `defauult` (オプション) — `UInt64` 型への変換に失敗した場合に返すデフォルト値。[UInt64](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値またはその文字列表現。
* 型 Float32/64 の値。

デフォルト値が返される引数:

* `NaN` や `Inf` を含む、Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toUInt64OrDefault('0xc0fe', CAST('0', 'UInt64'));`。

:::note
入力値が [UInt64](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

* 成功した場合は 64 ビット符号なし整数値、それ以外の場合は指定されていればデフォルト値、指定されていなければ `0` を返します。[UInt64](../data-types/int-uint.md)。

:::note

* この関数は[ゼロへの丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数部を切り捨てます。
* デフォルト値の型は、キャスト先の型と同じでなければなりません。
  :::

**例**

クエリ:

```sql
SELECT
    toUInt64OrDefault('64', CAST('0', 'UInt64')),
    toUInt64OrDefault('abc', CAST('0', 'UInt64'))
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toUInt64OrDefault('64', CAST('0', 'UInt64')):  64
toUInt64OrDefault('abc', CAST('0', 'UInt64')): 0
```

**関連項目**

* [`toUInt64`](#touint64).
* [`toUInt64OrZero`](#touint64orzero).
* [`toUInt64OrNull`](#touint64ornull).


## toUInt128

入力値を [`UInt128`](../data-types/int-uint.md) 型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toUInt128(expr)
```

**引数**

* `expr` — 数値または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

* (U)Int8/16/32/64/128/256 型の値または文字列表現。
* Float32/64 型の値。

サポートされない引数:

* `NaN` や `Inf` を含む、Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toUInt128('0xc0fe');`。

:::note
入力値が [UInt128](../data-types/int-uint.md) の範囲で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**戻り値**

* 128 ビット符号なし整数値。[UInt128](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を行います。これは、小数桁を切り捨てることを意味します。
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

結果:

```response
行 1:
──────
toUInt128(128):   128
toUInt128(128.8): 128
toUInt128('128'): 128
```

**関連項目**

* [`toUInt128OrZero`](#touint128orzero)。
* [`toUInt128OrNull`](#touint128ornull)。
* [`toUInt128OrDefault`](#touint128ordefault)。


## toUInt128OrZero

[`toUInt128`](#touint128) と同様に、この関数は入力値を [UInt128](../data-types/int-uint.md) 型の値に変換しますが、エラー時には `0` を返します。

**構文**

```sql
toUInt128OrZero(expr)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`0` を返す）:

* `NaN` や `Inf` を含む Float32/64 値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toUInt128OrZero('0xc0fe');`。

:::note
入力値を [UInt128](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとはみなされません。
:::

**返される値**

* 成功した場合は 128 ビット符号なし整数値、それ以外の場合は `0`。[UInt128](../data-types/int-uint.md)。

:::note
この関数は[0 への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を行います。つまり、小数部の桁を切り捨てます。
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
行 1:
──────
toUInt128OrZero('128'): 128
toUInt128OrZero('abc'): 0
```

**関連項目**

* [`toUInt128`](#touint128)。
* [`toUInt128OrNull`](#touint128ornull)。
* [`toUInt128OrDefault`](#touint128ordefault)。


## toUInt128OrNull

[`toUInt128`](#touint128) と同様に、この関数は入力値を [UInt128](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合には `NULL` を返します。

**構文**

```sql
toUInt128OrNull(x)
```

**引数**

* `x` — 数値の文字列表現。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`\N` を返す）:

* `NaN` や `Inf` を含む Float32/64 型値の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toUInt128OrNull('0xc0fe');`。

:::note
入力値が [UInt128](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

* 成功時は 128 ビット符号なし整数値、失敗時は `NULL`。[UInt128](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用し、小数部の桁を切り捨てます。
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
行 1:
──────
toUInt128OrNull('128'): 128
toUInt128OrNull('abc'): ᴺᵁᴸᴸ
```

**関連項目**

* [`toUInt128`](#touint128).
* [`toUInt128OrZero`](#touint128orzero).
* [`toUInt128OrDefault`](#touint128ordefault).


## toUInt128OrDefault

[`toUInt128`](#toint128) と同様に、この関数は入力値を [UInt128](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 値が渡されない場合、エラー時には `0` が返されます。

**構文**

```sql
toUInt128OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (省略可) — `UInt128` 型へのパースに失敗した場合に返すデフォルト値。[UInt128](../data-types/int-uint.md)。

サポートされる引数:

* (U)Int8/16/32/64/128/256。
* Float32/64。
* (U)Int8/16/32/128/256 の文字列表現。

デフォルト値が返される引数:

* `NaN` や `Inf` を含む Float32/64 の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toUInt128OrDefault('0xc0fe', CAST('0', 'UInt128'));`。

:::note
入力値が [UInt128](../data-types/int-uint.md) の範囲内で表現できない場合、結果がオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**返される値**

* 成功した場合は 128 ビットの符号なし整数値。失敗した場合は指定されたデフォルト値、指定されていない場合は `0` を返します。[UInt128](../data-types/int-uint.md)。

:::note

* この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を行い、小数部分の桁を切り捨てます。
* デフォルト値の型はキャスト先の型と同じでなければなりません。
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
行 1:
──────
toUInt128OrDefault('128', CAST('0', 'UInt128')): 128
toUInt128OrDefault('abc', CAST('0', 'UInt128')): 0
```

**関連項目**

* [`toUInt128`](#touint128)。
* [`toUInt128OrZero`](#touint128orzero)。
* [`toUInt128OrNull`](#touint128ornull)。


## toUInt256

入力値を[`UInt256`](../data-types/int-uint.md)型の値に変換します。エラーが発生すると例外をスローします。

**構文**

```sql
toUInt256(expr)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数：

* 型 (U)Int8/16/32/64/128/256 の値または文字列表現。
* 型 Float32/64 の値。

サポートされない引数：

* `NaN` や `Inf` を含む、Float32/64 値の文字列表現。
* `SELECT toUInt256('0xc0fe');` のような、2進数および16進数値の文字列表現。

:::note
入力値が [UInt256](../data-types/int-uint.md) の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**戻り値**

* 256ビット符号なし整数値。[Int256](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、小数部を切り捨てます。
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
行 1:
──────
toUInt256(256):     256
toUInt256(256.256): 256
toUInt256('256'):   256
```

**関連項目**

* [`toUInt256OrZero`](#touint256orzero)。
* [`toUInt256OrNull`](#touint256ornull)。
* [`toUInt256OrDefault`](#touint256ordefault)。


## toUInt256OrZero

[`toUInt256`](#touint256) と同様に、この関数は入力値を [UInt256](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toUInt256OrZero(x)
```

**引数**

* `x` — 数値を表す文字列。[String](../data-types/string.md)。

サポートされる引数：

* (U)Int8/16/32/128/256 を表す文字列。

サポートされない引数（`0` を返す）：

* `NaN` や `Inf` を含む Float32/64 値を表す文字列。
* バイナリ値および 16 進数値を表す文字列（例：`SELECT toUInt256OrZero('0xc0fe');`）。

:::note
入力値が [UInt256](../data-types/int-uint.md) の表現範囲外の場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**戻り値**

* 成功した場合は 256 ビット符号なし整数値、そうでない場合は `0` を返します。[UInt256](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用し、小数部を切り捨てます。
:::

**例**

クエリ：

```sql
SELECT
    toUInt256OrZero('256'),
    toUInt256OrZero('abc')
FORMAT Vertical;
```

結果：

```response
行 1:
──────
toUInt256OrZero('256'): 256
toUInt256OrZero('abc'): 0
```

**関連項目**

* [`toUInt256`](#touint256)。
* [`toUInt256OrNull`](#touint256ornull)。
* [`toUInt256OrDefault`](#touint256ordefault)。


## toUInt256OrNull

[`toUInt256`](#touint256) と同様に、この関数は入力値を型 [UInt256](../data-types/int-uint.md) の値に変換しますが、エラーが発生した場合には `NULL` を返します。

**構文**

```sql
toUInt256OrNull(x)
```

**引数**

* `x` — 数値を表す文字列。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256 の文字列表現。

サポートされない引数（`\N` を返す）:

* `NaN` および `Inf` を含む Float32/64 値の文字列表現。
* `SELECT toUInt256OrNull('0xc0fe');` のような、2進数および16進数値の文字列表現。

:::note
入力値が [UInt256](../data-types/int-uint.md) の範囲内で表現できない場合、結果でオーバーフローまたはアンダーフローが発生します。
これはエラーとはみなされません。
:::

**返される値**

* 成功時は 256 ビット符号なし整数値、それ以外は `NULL`。[UInt256](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用し、小数部を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toUInt256OrNull('256'),
    toUInt256OrNull('abc')
FORMAT Vertical;
```

結果：

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


## toUInt256OrDefault

[`toUInt256`](#touint256) と同様に、この関数は入力値を [UInt256](../data-types/int-uint.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default` 値が渡されていない場合、エラー時には `0` が返されます。

**構文**

```sql
toUInt256OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (省略可) — `UInt256` 型への解析に失敗した場合に返されるデフォルト値。[UInt256](../data-types/int-uint.md)。

サポートされる引数：

* 型 (U)Int8/16/32/64/128/256 の値または文字列表現。
* 型 Float32/64 の値。

デフォルト値が返される引数：

* `NaN` や `Inf` を含む Float32/64 値の文字列表現
* 2 進数値および 16 進数値の文字列表現。例: `SELECT toUInt256OrDefault('0xc0fe', CAST('0', 'UInt256'));`

:::note
入力値が [UInt256](../data-types/int-uint.md) の範囲内で表現できない場合、結果がオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**戻り値**

* 正常に変換された場合は 256 ビット符号なし整数値、それ以外の場合は指定されていればデフォルト値、指定されていなければ `0` を返します。[UInt256](../data-types/int-uint.md)。

:::note

* この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を行います。つまり、小数部を切り捨てます。
* デフォルト値の型は、キャスト先の型と同じである必要があります。
  :::

**例**

クエリ:

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

* [`toUInt256`](#touint256).
* [`toUInt256OrZero`](#touint256orzero).
* [`toUInt256OrNull`](#touint256ornull).


## toFloat32

入力値を [`Float32`](../data-types/float.md) 型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toFloat32(expr)
```

**引数**

* `expr` — 数値、または数値を表す文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数：

* 型 (U)Int8/16/32/64/128/256 の値。
* (U)Int8/16/32/128/256 の文字列表現。
* `NaN` および `Inf` を含む Float32/64 型の値。
* `NaN` および `Inf` を含む Float32/64 の文字列表現（大文字・小文字は区別しない）。

サポートされない引数：

* 2 進数および 16 進数値の文字列表現。例：`SELECT toFloat32('0xc0fe');`。

**戻り値**

* 32 ビット浮動小数点数。[Float32](../data-types/float.md)。

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
行 1:
──────
toFloat32(42.7):   42.7
toFloat32('42.7'): 42.7
toFloat32('NaN'):  nan
```

**関連項目**

* [`toFloat32OrZero`](#tofloat32orzero)。
* [`toFloat32OrNull`](#tofloat32ornull)。
* [`toFloat32OrDefault`](#tofloat32ordefault)。


## toFloat32OrZero

[`toFloat32`](#tofloat32) と同様に、この関数は入力値を [Float32](../data-types/float.md) 型の値に変換しますが、エラー発生時には `0` を返します。

**構文**

```sql
toFloat32OrZero(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256、Float32/64 の文字列表現。

サポートされない引数（`0` を返す）:

* 2 進数および 16 進数の文字列表現。例: `SELECT toFloat32OrZero('0xc0fe');`。

**戻り値**

* 成功した場合は 32 ビット浮動小数点数（Float）の値、それ以外の場合は `0`。[Float32](../data-types/float.md)。

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
行 1:
──────
toFloat32OrZero('42.7'): 42.7
toFloat32OrZero('abc'):  0
```

**関連項目**

* [`toFloat32`](#tofloat32).
* [`toFloat32OrNull`](#tofloat32ornull).
* [`toFloat32OrDefault`](#tofloat32ordefault).


## toFloat32OrNull

[`toFloat32`](#tofloat32) と同様に、この関数は入力値を [Float32](../data-types/float.md) 型の値に変換しますが、エラーが発生した場合には `NULL` を返します。

**構文**

```sql
toFloat32OrNull(x)
```

**引数**

* `x` — 数値を表す文字列。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256、Float32/64 の文字列表現。

サポートされない引数（`\N` を返す）:

* 2 進数および 16 進数値の文字列表現。例: `SELECT toFloat32OrNull('0xc0fe');`。

**戻り値**

* 変換に成功した場合は 32 ビット浮動小数点値、それ以外は `\N`。[Float32](../data-types/float.md)。

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
行 1:
──────
toFloat32OrNull('42.7'): 42.7
toFloat32OrNull('abc'):  ᴺᵁᴸᴸ
```

**関連項目**

* [`toFloat32`](#tofloat32).
* [`toFloat32OrZero`](#tofloat32orzero).
* [`toFloat32OrDefault`](#tofloat32ordefault).


## toFloat32OrDefault

[`toFloat32`](#tofloat32) と同様に、この関数は入力値を [Float32](../data-types/float.md) 型の値に変換しますが、エラー発生時にはデフォルト値を返します。
`default` 値が渡されない場合、エラー発生時には `0` が返されます。

**構文**

```sql
toFloat32OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (任意) — 型 `Float32` へのパースに失敗した場合に返すデフォルト値。[Float32](../data-types/float.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値。
* (U)Int8/16/32/128/256 を表す文字列表現。
* `NaN` および `Inf` を含む Float32/64 型の値。
* `NaN` および `Inf` を含む Float32/64 の文字列表現 (大文字小文字を区別しません)。

次の場合はデフォルト値が返されます:

* 2 進数および 16 進数形式の文字列表現。例: `SELECT toFloat32OrDefault('0xc0fe', CAST('0', 'Float32'));`。

**戻り値**

* 成功した場合は 32 ビットの Float 値を返し、失敗した場合は渡されたデフォルト値を返します。デフォルト値が指定されていない場合は `0` を返します。[Float32](../data-types/float.md)。

**例**

クエリ:

```sql
SELECT
    toFloat32OrDefault('8', CAST('0', 'Float32')),
    toFloat32OrDefault('abc', CAST('0', 'Float32'))
FORMAT Vertical;
```

結果:

```response
行 1:
──────
toFloat32OrDefault('8', CAST('0', 'Float32')):   8
toFloat32OrDefault('abc', CAST('0', 'Float32')): 0
```

**関連項目**

* [`toFloat32`](#tofloat32).
* [`toFloat32OrZero`](#tofloat32orzero).
* [`toFloat32OrNull`](#tofloat32ornull).


## toFloat64

入力値を [`Float64`](../data-types/float.md) 型の値に変換します。エラーが発生した場合には例外をスローします。

**構文**

```sql
toFloat64(expr)
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数：

* 型 (U)Int8/16/32/64/128/256 の値。
* (U)Int8/16/32/128/256 の文字列表現。
* 型 Float32/64 の値（`NaN` および `Inf` を含む）。
* 型 Float32/64 の文字列表現（`NaN` および `Inf` を含み、大文字小文字は区別しない）。

サポートされない引数：

* バイナリ値および 16 進値の文字列表現（例: `SELECT toFloat64('0xc0fe');`）。

**戻り値**

* 64 ビット浮動小数点値。[Float64](../data-types/float.md)。

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
行 1:
──────
toFloat64(42.7):   42.7
toFloat64('42.7'): 42.7
toFloat64('NaN'):  nan
```

**関連項目**

* [`toFloat64OrZero`](#tofloat64orzero).
* [`toFloat64OrNull`](#tofloat64ornull).
* [`toFloat64OrDefault`](#tofloat64ordefault).


## toFloat64OrZero

[`toFloat64`](#tofloat64) と同様に、この関数は入力値を [Float64](../data-types/float.md) 型の値に変換しますが、エラー時には `0` を返します。

**構文**

```sql
toFloat64OrZero(x)
```

**引数**

* `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256、Float32/64 の文字列表現。

サポートされない引数（`0` を返します）:

* 2 進数および 16 進数の値の文字列表現。例: `SELECT toFloat64OrZero('0xc0fe');`。

**戻り値**

* 成功した場合は 64 ビットの Float 値、それ以外の場合は `0`。[Float64](../data-types/float.md)。

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
行 1:
──────
toFloat64OrZero('42.7'): 42.7
toFloat64OrZero('abc'):  0
```

**関連項目**

* [`toFloat64`](#tofloat64).
* [`toFloat64OrNull`](#tofloat64ornull).
* [`toFloat64OrDefault`](#tofloat64ordefault).


## toFloat64OrNull

[`toFloat64`](#tofloat64) と同様に、この関数は入力値を [Float64](../data-types/float.md) 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toFloat64OrNull(x)
```

**引数**

* `x` — 数値を表す文字列。[String](../data-types/string.md)。

サポートされる引数:

* (U)Int8/16/32/128/256、Float32/64 の文字列表現。

サポートされない引数（`\N` を返す）:

* 2進数および16進数値の文字列表現。例: `SELECT toFloat64OrNull('0xc0fe');`。

**戻り値**

* 正しく変換できた場合は 64-bit の浮動小数点値、それ以外の場合は `\N`。[Float64](../data-types/float.md)。

**例**

クエリ:

```sql
SELECT
    toFloat64OrNull('42.7'),
    toFloat64OrNull('abc')
FORMAT Vertical;
```

結果：

```response
行 1:
──────
toFloat64OrNull('42.7'): 42.7
toFloat64OrNull('abc'):  ᴺᵁᴸᴸ
```

**関連項目**

* [`toFloat64`](#tofloat64).
* [`toFloat64OrZero`](#tofloat64orzero).
* [`toFloat64OrDefault`](#tofloat64ordefault).


## toFloat64OrDefault

[`toFloat64`](#tofloat64) と同様に、この関数は入力値を [Float64](../data-types/float.md) 型の値に変換しますが、エラーが発生した場合は既定値を返します。
`default` 値が渡されない場合、エラー時には `0` が返されます。

**構文**

```sql
toFloat64OrDefault(expr[, default])
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default` (省略可) — 型 `Float64` へのパースに失敗した場合に返されるデフォルト値。[Float64](../data-types/float.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値。
* (U)Int8/16/32/128/256 の文字列表現。
* `NaN` および `Inf` を含む Float32/64 型の値。
* `NaN` および `Inf` を含む Float32/64 型の文字列表現（大文字小文字を区別しない）。

デフォルト値が返される引数:

* 2 進数および 16 進数値の文字列表現。例: `SELECT toFloat64OrDefault('0xc0fe', CAST('0', 'Float64'));`。

**戻り値**

* 成功した場合は 64 ビット浮動小数点数。失敗した場合は、指定されていればデフォルト値、指定されていなければ `0` を返す。[Float64](../data-types/float.md)。

**例**

クエリ:

```sql
SELECT
    toFloat64OrDefault('8', CAST('0', 'Float64')),
    toFloat64OrDefault('abc', CAST('0', 'Float64'))
FORMAT Vertical;
```

結果:

```response
行 1:
──────
toFloat64OrDefault('8', CAST('0', 'Float64')):   8
toFloat64OrDefault('abc', CAST('0', 'Float64')): 0
```

**関連項目**

* [`toFloat64`](#tofloat64).
* [`toFloat64OrZero`](#tofloat64orzero).
* [`toFloat64OrNull`](#tofloat64ornull).


## toBFloat16

入力値を [`BFloat16`](/sql-reference/data-types/float#bfloat16) 型に変換します。
エラーが発生した場合は例外をスローします。

**構文**

```sql
toBFloat16(expr)
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値。
* (U)Int8/16/32/128/256 を表す文字列。
* `NaN` および `Inf` を含む Float32/64 型の値。
* `NaN` および `Inf` を含む、Float32/64 を表す文字列（大文字小文字を区別しない）。

**返される値**

* 16 ビットの brain-float 型の値。[BFloat16](/sql-reference/data-types/float#bfloat16)。

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


## toBFloat16OrZero

入力の文字列値を [`BFloat16`](/sql-reference/data-types/float#bfloat16) 型の値に変換します。
文字列が浮動小数点数の値を表していない場合、関数はゼロを返します。

**構文**

```sql
toBFloat16OrZero(x)
```

**引数**

* `x` — 数値を表す文字列。[String](../data-types/string.md)。

サポートされる引数:

* 数値の文字列表現。

サポートされない引数（`0` を返す）:

* 2 進数および 16 進数の文字列表現。
* 数値型の値。

**戻り値**

* 16 ビットの brain-float 値。それ以外の場合は `0`。[BFloat16](/sql-reference/data-types/float#bfloat16)。

:::note
この関数は、文字列表現からの変換時に精度が失われてもエラーにせず、そのまま処理を続行します。
:::

**例**

```sql
SELECT toBFloat16OrZero('0x5E'); -- サポートされていない引数

0

SELECT toBFloat16OrZero('12.3'); -- 典型的な使用例

12.25

SELECT toBFloat16OrZero('12.3456789');

12.3125 -- 精度の暗黙的な損失
```

**関連項目**

* [`toBFloat16`](#tobfloat16)。
* [`toBFloat16OrNull`](#tobfloat16ornull)。


## toBFloat16OrNull

文字列の入力値を [`BFloat16`](/sql-reference/data-types/float#bfloat16) 型の値に変換します。
ただし、その文字列が浮動小数点値を表していない場合、この関数は `NULL` を返します。

**構文**

```sql
toBFloat16OrNull(x)
```

**引数**

* `x` — 数値を表す文字列。[String](../data-types/string.md)。

サポートされる引数:

* 数値を表す文字列。

サポートされない引数（`NULL` を返す）:

* 2進数および16進数を表す文字列。
* 数値型の引数。

**戻り値**

* 16ビットの brain-float 値。変換できない場合は `NULL`（`\N`）。[BFloat16](/sql-reference/data-types/float#bfloat16)。

:::note
この関数は、文字列表現から変換する際に、精度が暗黙的に失われることを許容します。
:::

**例**

```sql
SELECT toBFloat16OrNull('0x5E'); -- サポートされていない引数

\N

SELECT toBFloat16OrNull('12.3'); -- 典型的な使用例

12.25

SELECT toBFloat16OrNull('12.3456789');

12.3125 -- 精度の暗黙的な損失
```

**関連項目**

* [`toBFloat16`](#tobfloat16)。
* [`toBFloat16OrZero`](#tobfloat16orzero)。


## toDate

引数を [Date](../data-types/date.md) データ型に変換します。

引数が [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md) の場合、時間情報を切り捨てて、DateTime の日付部分のみを残します。

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

引数が [String](../data-types/string.md) の場合、[Date](../data-types/date.md) または [DateTime](../data-types/datetime.md) としてパースされます。[DateTime](../data-types/datetime.md) としてパースされた場合は、日付部分が使用されます。

```sql
SELECT
    toDate('2022-12-30') AS x,
    toTypeName(x)
```

```response
┌──────────x─┬─toTypeName(toDate('2022-12-30'))─┐
│ 2022-12-30 │ Date                             │
└────────────┴──────────────────────────────────┘

1行のデータセット。経過時間: 0.001秒。
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

引数が数値で、UNIX タイムスタンプのように見える（65535 より大きい）場合は、現在のタイムゾーンで [DateTime](../data-types/datetime.md) として解釈され、その後 [Date](../data-types/date.md) に切り捨てられます。タイムゾーン引数は、この関数の第 2 引数として指定できます。[Date](../data-types/date.md) への切り捨ては、タイムゾーンに依存します。

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
行 1:
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

上記の例は、同じ UNIX タイムスタンプでも、タイムゾーンによって異なる日付として解釈されることを示しています。

引数が数値で、その値が 65536 未満の場合、それは 1970-01-01（最初の UNIX 日）からの経過日数として解釈され、[Date](../data-types/date.md) に変換されます。これは `Date` データ型の内部数値表現に対応します。例:

```sql
SELECT toDate(12345)
```

```response
┌─toDate(12345)─┐
│    2003-10-20 │
└───────────────┘
```

この変換はタイムゾーンに依存しません。

引数が Date 型の範囲に収まらない場合、その結果は実装定義となり、サポートされる最大の日付に切り詰められるか、あるいはオーバーフローが発生する可能性があります。

```sql
SELECT toDate(10000000000.)
```

```response
┌─toDate(10000000000.)─┐
│           2106-02-07 │
└──────────────────────┘
```

関数 `toDate` は、別の表記でも記述できます。


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


## toDateOrZero

無効な引数が渡された場合に [Date](../data-types/date.md) の下限値を返す点を除き、[toDate](#todate) と同じです。[String](../data-types/string.md) 型の引数のみがサポートされています。

**例**

クエリ:

```sql
SELECT toDateOrZero('2022-12-30'), toDateOrZero('');
```

結果：

```response
┌─toDateOrZero('2022-12-30')─┬─toDateOrZero('')─┐
│                 2022-12-30 │       1970-01-01 │
└────────────────────────────┴──────────────────┘
```


## toDateOrNull

[toDate](#todate) と同様ですが、無効な引数を受け取った場合は `NULL` を返します。[String](../data-types/string.md) 型の引数のみがサポートされます。

**例**

クエリ:

```sql
SELECT toDateOrNull('2022-12-30'), toDateOrNull('');
```

結果:

```response
┌─toDateOrNull('2022-12-30')─┬─toDateOrNull('')─┐
│                 2022-12-30 │             ᴺᵁᴸᴸ │
└────────────────────────────┴──────────────────┘
```


## toDateOrDefault

[toDate](#todate) と同様ですが、変換に失敗した場合はデフォルト値を返します。デフォルト値は、第 2 引数が指定されている場合はその値、指定されていない場合は [Date](../data-types/date.md) の最小値です。

**構文**

```sql
toDateOrDefault(expr [, default_value])
```

**例**

クエリ:

```sql
SELECT toDateOrDefault('2022-12-30'), toDateOrDefault('', '2023-01-01'::Date);
```

結果:

```response
┌─toDateOrDefault('2022-12-30')─┬─toDateOrDefault('', CAST('2023-01-01', 'Date'))─┐
│                    2022-12-30 │                                      2023-01-01 │
└───────────────────────────────┴─────────────────────────────────────────────────┘
```


## toDateTime

入力値を [DateTime](../data-types/datetime.md) 型に変換します。

**構文**

```sql
toDateTime(expr[, time_zone ])
```

**引数**

* `expr` — 値。[String](../data-types/string.md)、[Int](../data-types/int-uint.md)、[Date](../data-types/date.md) または [DateTime](../data-types/datetime.md)。
* `time_zone` — タイムゾーン。[String](../data-types/string.md)。

:::note
`expr` が数値の場合、Unix エポックの開始時点からの経過秒数（Unix タイムスタンプ）として解釈されます。
`expr` が [String](../data-types/string.md) の場合、Unix タイムスタンプとして、または日付／日時の文字列表現として解釈されることがあります。
このため、短い数値文字列（4 桁以下）のパースは曖昧さを避けるために明示的に無効化されています。たとえば、文字列 &#39;1999&#39; は、年（Date / DateTime の不完全な文字列表現）としても、Unix タイムスタンプとしても解釈できてしまいます。より長い数値文字列は許可されます。
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


## toDateTimeOrZero

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


## toDateTimeOrNull

[toDateTime](#todatetime) と同様ですが、無効な引数が渡された場合は `NULL` を返します。[String](../data-types/string.md) 型の引数のみがサポートされます。

**例**

クエリ:

```sql
SELECT toDateTimeOrNull('2022-12-30 13:44:17'), toDateTimeOrNull('');
```

結果:

```response
┌─toDateTimeOrNull('2022-12-30 13:44:17')─┬─toDateTimeOrNull('')─┐
│                     2022-12-30 13:44:17 │                 ᴺᵁᴸᴸ │
└─────────────────────────────────────────┴──────────────────────┘
```


## toDateTimeOrDefault

[toDateTime](#todatetime) と同様ですが、変換に失敗した場合はデフォルト値を返します。デフォルト値は、3 番目の引数が指定されていればその値、指定されていない場合は [DateTime](../data-types/datetime.md) の下限値です。

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


## toDate32

引数を [Date32](../data-types/date32.md) データ型に変換します。値が範囲外の場合、`toDate32` は [Date32](../data-types/date32.md) でサポートされる範囲の境界値を返します。引数が [Date](../data-types/date.md) 型の場合は、その型で取り得る値の範囲の境界も考慮されます。

**構文**

```sql
toDate32(expr)
```

**引数**

* `expr` — 値。[String](../data-types/string.md) 型、[UInt32](../data-types/int-uint.md) 型、または [Date](../data-types/date.md) 型。

**返される値**

* カレンダー上の日付。[Date32](../data-types/date32.md) 型。

**例**

1. 値が範囲内にある場合：

```sql
SELECT toDate32('1955-01-01') AS value, toTypeName(value);
```

```response
┌──────value─┬─toTypeName(toDate32('1925-01-01'))─┐
│ 1955-01-01 │ Date32                             │
└────────────┴────────────────────────────────────┘
```

2. 値が許容範囲外である:

```sql
SELECT toDate32('1899-01-01') AS value, toTypeName(value);
```

```response
┌──────value─┬─toTypeName(toDate32('1899-01-01'))─┐
│ 1900-01-01 │ Date32                             │
└────────────┴────────────────────────────────────┘
```

3. [Date](../data-types/date.md) 引数を指定する場合:

```sql
SELECT toDate32(toDate('1899-01-01')) AS value, toTypeName(value);
```

```response
┌──────value─┬─toTypeName(toDate32(toDate('1899-01-01')))─┐
│ 1970-01-01 │ Date32                                     │
└────────────┴────────────────────────────────────────────┘
```


## toDate32OrZero

[toDate32](#todate32) と同様ですが、無効な引数を受け取った場合は [Date32](../data-types/date32.md) の最小値を返します。

**例**

クエリ:

```sql
SELECT toDate32OrZero('1899-01-01'), toDate32OrZero('');
```

結果:

```response
┌─toDate32OrZero('1899-01-01')─┬─toDate32OrZero('')─┐
│                   1900-01-01 │         1900-01-01 │
└──────────────────────────────┴────────────────────┘
```


## toDate32OrNull

[toDate32](#todate32) と同様ですが、無効な引数が渡された場合は `NULL` を返します。

**例**

クエリ：

```sql
SELECT toDate32OrNull('1955-01-01'), toDate32OrNull('');
```

結果:

```response
┌─toDate32OrNull('1955-01-01')─┬─toDate32OrNull('')─┐
│                   1955-01-01 │               ᴺᵁᴸᴸ │
└──────────────────────────────┴────────────────────┘
```


## toDate32OrDefault

引数を [Date32](../data-types/date32.md) データ型に変換します。値が範囲外の場合、`toDate32OrDefault` は [Date32](../data-types/date32.md) でサポートされる下限値を返します。引数が [Date](../data-types/date.md) 型の場合は、その型で取り得る範囲が考慮されます。無効な引数が渡された場合は、デフォルト値を返します。

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


## toDateTime64

入力値を [DateTime64](../data-types/datetime64.md) 型の値に変換します。

**構文**

```sql
toDateTime64(expr, scale, [timezone])
```

**引数**

* `expr` — 値。[String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[Float](../data-types/float.md) または [DateTime](../data-types/datetime.md)。
* `scale` - ティックサイズ（精度）：10<sup>-precision</sup> 秒。有効範囲：[0 : 9]。
* `timezone` (optional) - 指定した datetime64 オブジェクトのタイムゾーン。

**返り値**

* サブ秒精度を持つ日付と時刻。[DateTime64](../data-types/datetime64.md)。

**例**

1. 値が有効範囲内にある場合:

```sql
SELECT toDateTime64('1955-01-01 00:00:00.000', 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64('1955-01-01 00:00:00.000', 3))─┐
│ 1955-01-01 00:00:00.000 │ DateTime64(3)                                          │
└─────────────────────────┴────────────────────────────────────────────────────────┘
```

2. 精度指定付きの decimal 型として:

```sql
SELECT toDateTime64(1546300800.000, 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64(1546300800., 3))─┐
│ 2019-01-01 00:00:00.000 │ DateTime64(3)                            │
└─────────────────────────┴──────────────────────────────────────────┘
```

小数点がない場合、その値は秒単位の Unix タイムスタンプとして解釈されます：

```sql
SELECT toDateTime64(1546300800000, 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64(1546300800000, 3))─┐
│ 2282-12-31 00:00:00.000 │ DateTime64(3)                              │
└─────────────────────────┴────────────────────────────────────────────┘
```

3. `timezone` を指定する:

```sql
SELECT toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul') AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul'))─┐
│ 2019-01-01 00:00:00.000 │ DateTime64(3, 'Asia/Istanbul')                                      │
└─────────────────────────┴─────────────────────────────────────────────────────────────────────┘
```


## toDateTime64OrZero

[toDateTime64](#todatetime64) と同様に、この関数は入力値を [DateTime64](../data-types/datetime64.md) 型の値に変換しますが、無効な引数を受け取った場合は [DateTime64](../data-types/datetime64.md) の最小値を返します。

**構文**

```sql
toDateTime64OrZero(expr, scale, [timezone])
```

**引数**

* `expr` — 値。[String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[Float](../data-types/float.md) または [DateTime](../data-types/datetime.md)。
* `scale` - ティックサイズ（精度）。10<sup>-precision</sup> 秒を単位とします。有効な範囲: [ 0 : 9 ]。
* `timezone` (任意) - 指定された DateTime64 オブジェクトのタイムゾーン。

**返される値**

* サブ秒精度を持つ暦日と時刻。それ以外の場合は `DateTime64` の最小値である `1970-01-01 01:00:00.000`。[DateTime64](../data-types/datetime64.md)。

**例**

クエリ:

```sql
SELECT toDateTime64OrZero('2008-10-12 00:00:00 00:30:30', 3) AS invalid_arg
```

結果:

```response
┌─────────────invalid_arg─┐
│ 1970-01-01 01:00:00.000 │
└─────────────────────────┘
```

**関連項目**

* [toDateTime64](#todatetime64)。
* [toDateTime64OrNull](#todatetime64ornull)。
* [toDateTime64OrDefault](#todatetime64ordefault)。


## toDateTime64OrNull

[toDateTime64](#todatetime64) と同様に、この関数は入力値を [DateTime64](../data-types/datetime64.md) 型の値に変換しますが、無効な引数を受け取った場合は `NULL` を返します。

**構文**

```sql
toDateTime64OrNull(expr, scale, [timezone])
```

**引数**

* `expr` — 値。[String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[Float](../data-types/float.md)、または [DateTime](../data-types/datetime.md)。
* `scale` - ティックサイズ（精度）：10<sup>-precision</sup> 秒。有効範囲：[ 0 : 9 ]。
* `timezone`（省略可能）- 指定された DateTime64 オブジェクトのタイムゾーン。

**返される値**

* サブ秒精度を持つ暦日と時刻、それ以外の場合は `NULL`。[DateTime64](../data-types/datetime64.md)/[NULL](../data-types/nullable.md)。

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


## toDateTime64OrDefault

[toDateTime64](#todatetime64) と同様に、この関数は入力値を [DateTime64](../data-types/datetime64.md) 型の値に変換しますが、
不正な引数を受け取った場合には、[DateTime64](../data-types/datetime64.md) 型のデフォルト値、
または指定されたデフォルト値を返します。

**構文**

```sql
toDateTime64OrNull(expr, scale, [timezone, default])
```

**引数**

* `expr` — 値。[String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[Float](../data-types/float.md)、または [DateTime](../data-types/datetime.md)。
* `scale` - ティックサイズ（精度）。10<sup>-precision</sup> 秒単位。有効な範囲: [ 0 : 9 ]。
* `timezone`（省略可） - 指定された DateTime64 オブジェクトのタイムゾーン。
* `default`（省略可） - 無効な引数を受け取った場合に返すデフォルト値。[DateTime64](../data-types/datetime64.md)。

**返される値**

* サブ秒精度を持つカレンダー日付と時刻を返します。そうでない場合は `DateTime64` の最小値、または指定されていれば `default` の値を返します。[DateTime64](../data-types/datetime64.md)。

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

* [toDateTime64](#todatetime64)。
* [toDateTime64OrZero](#todatetime64orzero)。
* [toDateTime64OrNull](#todatetime64ornull)。


## toDecimal32

入力値をスケールが `S` の型 [`Decimal(9, S)`](../data-types/decimal.md) の値に変換します。エラーが発生した場合は、例外をスローします。

**構文**

```sql
toDecimal32(expr, S)
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions)。
* `S` — 0 から 9 の範囲のスケールパラメータで、数値の小数部が取りうる桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
* 型 Float32/64 の値、またはその文字列表現。

サポートされない引数:

* Float32/64 の `NaN` および `Inf`（大文字小文字は区別しない）の値または文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toDecimal32('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal32` の範囲を超えるとオーバーフローが発生する可能性があります: `( -1 * 10^(9 - S), 1 * 10^(9 - S) )`。
小数部の桁数が多すぎる場合、その超過分は切り捨てられます（丸めは行われません）。
整数部の桁数が多すぎる場合は例外がスローされます。
:::

:::warning
変換時には余分な桁が切り捨てられ、Float32/Float64 の入力に対しては浮動小数点命令で処理が行われるため、予期しない動作となる場合があります。
たとえば、`toDecimal32(1.15, 2)` は `1.14` と等しくなります。これは、浮動小数点において 1.15 * 100 が 114.99 となるためです。
文字列入力を使用すると、演算は内部の整数型を用いて行われます: `toDecimal32('1.15', 2) = 1.15`
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

結果:

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

* [`toDecimal32OrZero`](#todecimal32orzero)。
* [`toDecimal32OrNull`](#todecimal32ornull)。
* [`toDecimal32OrDefault`](#todecimal32ordefault)。


## toDecimal32OrZero

[`toDecimal32`](#todecimal32) と同様に、この関数は入力値を [Decimal(9, S)](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toDecimal32OrZero(expr, S)
```

**引数**

* `expr` — 数値を表す文字列。[String](../data-types/string.md)。
* `S` — 0〜9 の範囲のスケールパラメータ。数値の小数部が取り得る桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の文字列表現。
* 型 Float32/64 の文字列表現。

サポートされない引数:

* Float32/64 の値 `NaN` および `Inf` の文字列表現。
* 2 進数および 16 進数表記の文字列表現。例: `SELECT toDecimal32OrZero('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal32` の範囲 `( -1 * 10^(9 - S), 1 * 10^(9 - S) )` を超えると、オーバーフローが発生する可能性があります。
小数部の桁が多すぎる場合は、余分な桁は切り捨てられます（丸めは行われません）。
整数部の桁が多すぎる場合はエラーになります。
:::

**戻り値**

* 正常に変換された場合は型 `Decimal(9, S)` の値、それ以外の場合は小数部が `S` 桁の `0`。[Decimal32(S)](../data-types/decimal.md)。

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

* [`toDecimal32`](#todecimal32).
* [`toDecimal32OrNull`](#todecimal32ornull).
* [`toDecimal32OrDefault`](#todecimal32ordefault).


## toDecimal32OrNull

[`toDecimal32`](#todecimal32) と同様に、この関数は入力値を [Nullable(Decimal(9, S))](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合には `0` を返します。

**構文**

```sql
toDecimal32OrNull(expr, S)
```

**引数**

* `expr` — 数値の文字列表現。[String](../data-types/string.md)。
* `S` — 0 から 9 の間のスケールパラメーターで、数値の小数部が持てる桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の文字列表現。
* 型 Float32/64 の文字列表現。

サポートされない引数:

* Float32/64 の値 `NaN` および `Inf` の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toDecimal32OrNull('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal32` の範囲 `( -1 * 10^(9 - S), 1 * 10^(9 - S) )` を超えると、オーバーフローが発生する可能性があります。
小数部の過剰な桁は切り捨てられます（丸めは行われません）。
整数部の過剰な桁はエラーになります。
:::

**返される値**

* 正常に変換できた場合は型 `Nullable(Decimal(9, S))` の値、それ以外の場合は同じ型の値 `NULL`。[Decimal32(S)](../data-types/decimal.md)。

**使用例**

クエリ:

```sql
SELECT
    toDecimal32OrNull(toString(-1.111), 5) AS a,
    toTypeName(a),
    toDecimal32OrNull(toString('Inf'), 5) AS b,
    toTypeName(b)
FORMAT Vertical;
```

結果:

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


## toDecimal32OrDefault

[`toDecimal32`](#todecimal32) と同様に、この関数は入力値を [Decimal(9, S)](../data-types/decimal.md) 型の値に変換しますが、エラー時にはデフォルト値を返します。

**構文**

```sql
toDecimal32OrDefault(expr, S[, default])
```

**引数**

* `expr` — 数値の文字列表現。[String](../data-types/string.md)。
* `S` — 0〜9 のスケールパラメーター。数値の小数部が持てる桁数を指定します。[UInt8](../data-types/int-uint.md)。
* `default` (任意) — `Decimal32(S)` 型への変換に失敗した場合に返すデフォルト値。[Decimal32(S)](../data-types/decimal.md)。

サポートされる引数：

* 型 (U)Int8/16/32/64/128/256 の文字列表現。
* 型 Float32/64 の文字列表現。

サポートされない引数：

* Float32/64 型の値 `NaN` および `Inf` の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toDecimal32OrDefault('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal32` の範囲 `( -1 * 10^(9 - S), 1 * 10^(9 - S) )` を超えると、オーバーフローが発生する可能性があります。
小数部の過剰な桁は切り捨てられます（丸めは行われません）。
整数部の過剰な桁はエラーになります。
:::

:::warning
変換時に余分な桁が切り捨てられるため、Float32/Float64 入力を扱う場合、演算が浮動小数点命令で実行されることにより予期しない動作となる可能性があります。
例えば、`toDecimal32OrDefault(1.15, 2)` は `1.14` と等しくなります。これは、浮動小数点では 1.15 * 100 が 114.99 となるためです。
演算で基になる整数型を使用するには、String 型の入力を使用してください: `toDecimal32OrDefault('1.15', 2) = 1.15`
:::

**戻り値**

* 成功した場合は `Decimal(9, S)` 型の値を返し、失敗した場合は指定されていればデフォルト値を、指定されていなければ `0` を返します。[Decimal32(S)](../data-types/decimal.md)。

**例**

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

* [`toDecimal32`](#todecimal32).
* [`toDecimal32OrZero`](#todecimal32orzero).
* [`toDecimal32OrNull`](#todecimal32ornull).


## toDecimal64

入力値をスケール `S` を持つ [`Decimal(18, S)`](../data-types/decimal.md) 型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toDecimal64(expr, S)
```

**引数**

* `expr` — 数値、または数値を表す文字列を返す式。[Expression](/sql-reference/syntax#expressions)。
* `S` — 0 〜 18 の範囲のスケールパラメータで、数値の小数部が持てる桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
* 型 Float32/64 の値、またはその文字列表現。

サポートされない引数:

* Float32/64 の値 `NaN` および `Inf`、またはそれらの文字列表現（大文字・小文字は区別しない）。
* 2 進数および 16 進数の文字列表現。例: `SELECT toDecimal64('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal64` の範囲 `( -1 * 10^(18 - S), 1 * 10^(18 - S) )` を超えるとオーバーフローが発生する可能性があります。
小数部の桁が多すぎる場合は切り捨てられます（丸められません）。
整数部の桁が多すぎる場合は例外が発生します。
:::

:::warning
変換では余分な桁が切り捨てられ、Float32/Float64 の入力を扱うとき、演算が浮動小数点命令で実行されるため、予期しない動作になる可能性があります。
たとえば、`toDecimal64(1.15, 2)` は `1.14` になります。これは、浮動小数点では 1.15 * 100 が 114.99 となるためです。
基盤となる整数型で演算を行うには、文字列入力を使用できます: `toDecimal64('1.15', 2) = 1.15`
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

結果:

```response
行 1:
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


## toDecimal64OrZero

[`toDecimal64`](#todecimal64) と同様に、この関数は入力値を [Decimal(18, S)](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toDecimal64OrZero(expr, S)
```

**引数**

* `expr` — 数値を表す文字列。[String](../data-types/string.md)。
* `S` — 0 から 18 の間のスケールパラメータで、数値の小数部が持てる桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数：

* 型 (U)Int8/16/32/64/128/256 の文字列表現。
* 型 Float32/64 の文字列表現。

サポートされない引数：

* Float32/64 型の値 `NaN` および `Inf` の文字列表現。
* 2進数および16進数値の文字列表現。例：`SELECT toDecimal64OrZero('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal64` の範囲 `( -1 * 10^(18 - S), 1 * 10^(18 - S) )` を超えると、オーバーフローが発生する可能性があります。
小数部の桁数が多すぎる場合、余分な桁は切り捨てられます（丸められません）。
整数部の桁数が多すぎる場合はエラーになります。
:::

**返される値**

* 成功した場合は型 `Decimal(18, S)` の値、そうでない場合は小数 `S` 桁を持つ `0`。[Decimal64(S)](../data-types/decimal.md)。

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
行 1:
──────
a:             0.0001
toTypeName(a): Decimal(18, 18)
b:             0
toTypeName(b): Decimal(18, 18)
```

**関連項目**

* [`toDecimal64`](#todecimal64).
* [`toDecimal64OrNull`](#todecimal64ornull).
* [`toDecimal64OrDefault`](#todecimal64ordefault).


## toDecimal64OrNull

[`toDecimal64`](#todecimal64) と同様に、この関数は入力値を [Nullable(Decimal(18, S))](../data-types/decimal.md) 型の値に変換します。ただし、エラーが発生した場合は `0` を返します。

**構文**

```sql
toDecimal64OrNull(expr, S)
```

**引数**

* `expr` — 数値を表す文字列。[String](../data-types/string.md)。
* `S` — 0〜18 のスケールパラメータで、数値の小数部が取りうる桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の文字列表現。
* 型 Float32/64 の文字列表現。

サポートされない引数:

* Float32/64 の値 `NaN` および `Inf` の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toDecimal64OrNull('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal64` の範囲 `( -1 * 10^(18 - S), 1 * 10^(18 - S) )` を超えるとオーバーフローが発生する可能性があります。
小数部の桁数が多すぎる場合は、余分な桁は切り捨てられます（丸めは行われません）。
整数部の桁数が多すぎる場合はエラーになります。
:::

**返される値**

* 正常に変換された場合は型 `Nullable(Decimal(18, S))` の値。それ以外の場合は同じ型の値 `NULL`。[Decimal64(S)](../data-types/decimal.md)。

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

結果：

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


## toDecimal64OrDefault

[`toDecimal64`](#todecimal64) と同様に、この関数は入力値を [Decimal(18, S)](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合は既定値を返します。

**構文**

```sql
toDecimal64OrDefault(expr, S[, default])
```

**引数**

* `expr` — 数値の文字列表現。[String](../data-types/string.md)。
* `S` — 0〜18 の範囲のスケールパラメータ。数値の小数部に含めることができる桁数を指定します。[UInt8](../data-types/int-uint.md)。
* `default` (省略可能) — `Decimal64(S)` 型への変換に失敗した場合に返されるデフォルト値。[Decimal64(S)](../data-types/decimal.md)。

サポートされる引数:

* (U)Int8/16/32/64/128/256 型の文字列表現。
* Float32/64 型の文字列表現。

サポートされない引数:

* Float32/64 の値 `NaN` および `Inf` の文字列表現。
* 2 進数および 16 進数の文字列表現。例: `SELECT toDecimal64OrDefault('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal64` の範囲 `( -1 * 10^(18 - S), 1 * 10^(18 - S) )` を超えると、オーバーフローが発生する可能性があります。
小数部の過剰な桁は切り捨てられます (丸めは行われません)。
整数部の桁数が多すぎる場合はエラーになります。
:::

:::warning
変換時には余分な桁が切り捨てられ、Float32/Float64 の入力を扱う際には、演算が浮動小数点命令で実行されるため、予期しない動作をする可能性があります。
例えば、`toDecimal64OrDefault(1.15, 2)` は `1.14` と等しくなります。これは、浮動小数点演算では 1.15 * 100 が 114.99 となるためです。
文字列入力を使用すると、演算は内部の整数型を用いて行われます: `toDecimal64OrDefault('1.15', 2) = 1.15`
:::

**戻り値**

* 成功した場合は `Decimal(18, S)` 型の値。失敗した場合は指定されていればデフォルト値、指定されていなければ `0` を返します。[Decimal64(S)](../data-types/decimal.md)。

**例**

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


## toDecimal128

入力値をスケール `S` を持つ型 [`Decimal(38, S)`](../data-types/decimal.md) の値に変換します。エラーが発生した場合は例外を送出します。

**構文**

```sql
toDecimal128(expr, S)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) を参照。
* `S` — 0〜38 のスケールパラメータで、数値の小数部が持てる桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値、またはその文字列表現。
* 型 Float32/64 の値、またはその文字列表現。

サポートされない引数:

* Float32/64 の値 `NaN` および `Inf`（大文字・小文字は区別しない）の値または文字列表現。
* 2 進数および 16 進数値の文字列表現（例: `SELECT toDecimal128('0xc0fe', 1);`）。

:::note
`expr` の値が `Decimal128` の範囲 `( -1 * 10^(38 - S), 1 * 10^(38 - S) )` を超えると、オーバーフローが発生する可能性があります。
小数部の過剰な桁は切り捨てられます（丸めは行われません）。
整数部の過剰な桁は例外の原因となります。
:::

:::warning
変換時には余分な桁が切り捨てられ、Float32/Float64 の入力を扱う場合、処理が浮動小数点命令で行われるため、予期しない結果になる可能性があります。
例えば、`toDecimal128(1.15, 2)` は `1.14` と等しくなります。これは、浮動小数点において 1.15 * 100 が 114.99 となるためです。
内部で整数型を使って演算を行うようにするには、String 型の入力を使用できます: `toDecimal128('1.15', 2) = 1.15`
:::

**返される値**

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

結果:

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

* [`toDecimal128OrZero`](#todecimal128orzero).
* [`toDecimal128OrNull`](#todecimal128ornull).
* [`toDecimal128OrDefault`](#todecimal128ordefault).


## toDecimal128OrZero

[`toDecimal128`](#todecimal128) と同様に、この関数は入力値を [Decimal(38, S)](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toDecimal128OrZero(expr, S)
```

**引数**

* `expr` — 数値を表す文字列。[String](../data-types/string.md)。
* `S` — 0〜38 の範囲のスケールパラメータ。数値の小数部分に許容される桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の文字列表現。
* 型 Float32/64 の文字列表現。

サポートされない引数:

* Float32/64 の値 `NaN` および `Inf` の文字列表現。
* 2 進数および 16 進数値の文字列表現（例: `SELECT toDecimal128OrZero('0xc0fe', 1);`）。

:::note
`expr` の値が `Decimal128` の範囲 `( -1 * 10^(38 - S), 1 * 10^(38 - S) )` を超える場合、オーバーフローが発生する可能性があります。
小数部分の桁数が多すぎる場合は切り捨てられます（丸めは行われません）。
整数部分の桁数が多すぎる場合はエラーになります。
:::

**戻り値**

* 成功した場合は `Decimal(38, S)` 型の値、それ以外の場合は小数点以下 `S` 桁の `0`。[Decimal128(S)](../data-types/decimal.md)。

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
行 1:
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


## toDecimal128OrNull

[`toDecimal128`](#todecimal128) と同様に、この関数は入力値を [Nullable(Decimal(38, S))](../data-types/decimal.md) 型の値に変換します。ただし、エラーが発生した場合は `0` を返します。

**構文**

```sql
toDecimal128OrNull(expr, S)
```

**引数**

* `expr` — 数値を表す文字列。[String](../data-types/string.md)。
* `S` — 0から38の間のスケールパラメータ。数値の小数部が取りうる桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

* (U)Int8/16/32/64/128/256 型の文字列表現。
* Float32/64 型の文字列表現。

サポートされない引数:

* 値 `NaN` および `Inf` の Float32/64 型の文字列表現。
* 2進数および16進数の値の文字列表現。例: `SELECT toDecimal128OrNull('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal128` の範囲 `( -1 * 10^(38 - S), 1 * 10^(38 - S) )` を超えると、オーバーフローが発生します。
小数部の過剰な桁は切り捨てられます（丸めは行われません）。
整数部の桁が多すぎる場合はエラーになります。
:::

**戻り値**

* 正常に変換された場合は型 `Nullable(Decimal(38, S))` の値、それ以外の場合は同じ型の `NULL` 値。[Decimal128(S)](../data-types/decimal.md)。

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


## toDecimal128OrDefault

[`toDecimal128`](#todecimal128) と同様に、この関数は入力値を [Decimal(38, S)](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合にはデフォルト値を返します。

**構文**

```sql
toDecimal128OrDefault(expr, S[, default])
```

**引数**

* `expr` — 数値を表す文字列表現。[String](../data-types/string.md)。
* `S` — 0 から 38 の間のスケールパラメータ。数値の小数部が取りうる桁数を指定します。[UInt8](../data-types/int-uint.md)。
* `default` (任意) — `Decimal128(S)` 型へのパースに失敗した場合に返すデフォルト値。[Decimal128(S)](../data-types/decimal.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の文字列表現。
* 型 Float32/64 の文字列表現。

サポートされない引数:

* Float32/64 の値 `NaN` および `Inf` の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toDecimal128OrDefault('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal128` の範囲 `( -1 * 10^(38 - S), 1 * 10^(38 - S) )` を超えるとオーバーフローが発生する可能性があります。
小数部の余分な桁は切り捨てられます (丸められません)。
整数部の余分な桁はエラーの原因になります。
:::

:::warning
変換時には余分な桁が切り捨てられ、Float32/Float64 の入力に対しては浮動小数点命令で演算が行われるため、想定外の動作となる可能性があります。
例えば、`toDecimal128OrDefault(1.15, 2)` は `1.14` と等しくなります。これは、浮動小数点では 1.15 * 100 が 114.99 となるためです。
演算で内部の整数型を使用させるには、String 入力を使用してください: `toDecimal128OrDefault('1.15', 2) = 1.15`
:::

**戻り値**

* 成功した場合は `Decimal(38, S)` 型の値。失敗した場合は、指定されていればデフォルト値を、指定されていなければ `0` を返します。[Decimal128(S)](../data-types/decimal.md)。

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
行 1:
──────
a:             0.023809523809523808
toTypeName(a): Decimal(38, 18)
b:             -1
toTypeName(b): Decimal(38, 0)
```

**関連項目**

* [`toDecimal128`](#todecimal128).
* [`toDecimal128OrZero`](#todecimal128orzero).
* [`toDecimal128OrNull`](#todecimal128ornull).


## toDecimal256

入力値を、スケール `S` を持つ [`Decimal(76, S)`](../data-types/decimal.md) 型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toDecimal256(expr, S)
```

**引数**

* `expr` — 数値、または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。
* `S` — 0〜76 のスケールパラメータ。数値の小数部に含めることができる桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値または文字列表現。
* 型 Float32/64 の値または文字列表現。

サポートされない引数:

* 型 Float32/64 の値 `NaN` および `Inf` とその文字列表現（大文字小文字は区別しません）。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toDecimal256('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal256` の範囲 `( -1 * 10^(76 - S), 1 * 10^(76 - S) )` を超えるとオーバーフローが発生する可能性があります。
小数部の余分な桁は切り捨てられます（四捨五入はされません）。
整数部の余分な桁は例外の原因となります。
:::

:::warning
変換では余分な桁が切り捨てられ、Float32/Float64 の入力を扱う場合、演算が浮動小数点命令で行われるため予期しない動作となる可能性があります。
例えば、`toDecimal256(1.15, 2)` は `1.14` と等しくなります。これは浮動小数点において 1.15 * 100 が 114.99 となるためです。
基になる整数型で演算を行うようにするには、String 型の入力を使用できます: `toDecimal256('1.15', 2) = 1.15`
:::

**戻り値**

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

結果:

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


## toDecimal256OrZero

[`toDecimal256`](#todecimal256) と同様に、この関数は入力値を [Decimal(76, S)](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toDecimal256OrZero(expr, S)
```

**引数**

* `expr` — 数値を表す文字列。[String](../data-types/string.md)。
* `S` — 0〜76 のスケールパラメータ。数値の小数部が取り得る最大桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の文字列表現。
* 型 Float32/64 の文字列表現。

サポートされない引数:

* Float32/64 の値 `NaN` および `Inf` の文字列表現。
* 2 進数および 16 進数値の文字列表現（例: `SELECT toDecimal256OrZero('0xc0fe', 1);`）。

:::note
`expr` の値が `Decimal256` の範囲 `( -1 * 10^(76 - S), 1 * 10^(76 - S) )` を超えるとオーバーフローが発生します。
小数部の過剰な桁は切り捨てられます（丸めはされません）。
整数部の過剰な桁はエラーになります。
:::

**戻り値**

* 正常終了時は型 `Decimal(76, S)` の値、それ以外の場合は小数部が `S` 桁の `0`。[Decimal256(S)](../data-types/decimal.md)。

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

結果：

```response
行 1:
──────
a:             0.0001
toTypeName(a): Decimal(76, 76)
b:             0
toTypeName(b): Decimal(76, 76)
```

**関連項目**

* [`toDecimal256`](#todecimal256)。
* [`toDecimal256OrNull`](#todecimal256ornull)。
* [`toDecimal256OrDefault`](#todecimal256ordefault)。


## toDecimal256OrNull

[`toDecimal256`](#todecimal256) と同様に、この関数は入力値を [Nullable(Decimal(76, S))](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合には `0` を返します。

**構文**

```sql
toDecimal256OrNull(expr, S)
```

**引数**

* `expr` — 数値を表す文字列。 [String](../data-types/string.md)。
* `S` — 0 から 76 の間のスケールパラメーターで、数値の小数部分に許容される桁数を指定します。 [UInt8](../data-types/int-uint.md)。

サポートされる引数:

* 型 (U)Int8/16/32/64/128/256 の値を表す文字列。
* 型 Float32/64 の値を表す文字列。

サポートされない引数:

* Float32/64 の値 `NaN` および `Inf` を表す文字列。
* バイナリ値および 16 進数値を表す文字列。例: `SELECT toDecimal256OrNull('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal256` の範囲 `( -1 * 10^(76 - S), 1 * 10^(76 - S) )` を超えると、オーバーフローが発生する可能性があります。
小数部の桁数が多すぎる場合、その超過分は切り捨てられます（丸めは行われません）。
整数部の桁数が多すぎる場合は、エラーが発生します。
:::

**返される値**

* 正常に変換された場合は `Nullable(Decimal(76, S))` 型の値。失敗した場合は同じ型の `NULL` 値。 [Decimal256(S)](../data-types/decimal.md)。

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

* [`toDecimal256`](#todecimal256).
* [`toDecimal256OrZero`](#todecimal256orzero).
* [`toDecimal256OrDefault`](#todecimal256ordefault).


## toDecimal256OrDefault

[`toDecimal256`](#todecimal256) と同様に、この関数は入力値を [Decimal(76, S)](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。

**構文**

```sql
toDecimal256OrDefault(expr, S[, default])
```

**引数**

* `expr` — 数値の文字列表現。[String](../data-types/string.md)。
* `S` — 0 から 76 の間のスケールパラメーター。数値の小数部が持てる桁数を指定します。[UInt8](../data-types/int-uint.md)。
* `default` (任意) — `Decimal256(S)` 型へのパースに失敗した場合に返すデフォルト値。[Decimal256(S)](../data-types/decimal.md)。

サポートされる引数:

* (U)Int8/16/32/64/128/256 型の文字列表現。
* Float32/Float64 型の文字列表現。

サポートされない引数:

* Float32/Float64 の値 `NaN` および `Inf` の文字列表現。
* 2 進数および 16 進数値の文字列表現。例: `SELECT toDecimal256OrDefault('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal256` の範囲を超えるとオーバーフローが発生する可能性があります: `( -1 * 10^(76 - S), 1 * 10^(76 - S) )`。
小数部の余分な桁は切り捨てられます (丸めは行われません)。
整数部の余分な桁はエラーの原因になります。
:::

:::warning
変換時には余分な桁が切り捨てられ、Float32/Float64 の入力を扱う場合、処理は浮動小数点命令を使用して行われるため、想定外の動作になる可能性があります。
例えば、`toDecimal256OrDefault(1.15, 2)` は `1.14` と等しくなります。これは、浮動小数点において 1.15 * 100 が 114.99 となるためです。
演算に基になる整数型を使用させるには、String 入力を使用します: `toDecimal256OrDefault('1.15', 2) = 1.15`
:::

**返される値**

* 正常に変換できた場合は `Decimal(76, S)` 型の値。失敗した場合は、指定されていればデフォルト値、指定されていなければ `0` を返します。[Decimal256(S)](../data-types/decimal.md)。

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

* [`toDecimal256`](#todecimal256).
* [`toDecimal256OrZero`](#todecimal256orzero).
* [`toDecimal256OrNull`](#todecimal256ornull).


## toString

値を文字列表現に変換します。
DateTime 型の引数に対しては、タイムゾーン名を指定する 2 番目の String 型引数を取ることができます。

**構文**

```sql
toString(value[, timezone])
```

**引数**

* `value`: 文字列に変換する値。[`Any`](/sql-reference/data-types)。
* `timezone`: 省略可能。`DateTime` への変換に使用するタイムゾーン名。[`String`](/sql-reference/data-types/string)。

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


## toFixedString

[String](../data-types/string.md) 型の引数を [FixedString(N)](../data-types/fixedstring.md) 型（長さ N の固定長文字列）に変換します。
文字列のバイト数が N より少ない場合は、右側がヌルバイトで埋められます。文字列のバイト数が N を超える場合は、例外が送出されます。

**構文**

```sql
toFixedString(s, N)
```

**引数**

* `s` — 固定長文字列に変換する対象の文字列。[String](../data-types/string.md)。
* `N` — 長さ N。[UInt8](../data-types/int-uint.md)。

**戻り値**

* `s` を長さ N の固定長文字列にしたもの。[FixedString](../data-types/fixedstring.md)。

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


## toStringCutToZero

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

結果：

```response
┌─s─────────────┬─s_cut─┐
│ foo\0\0\0\0\0 │ foo   │
└───────────────┴───────┘
```

クエリ：

```sql
SELECT toFixedString('foo\0bar', 8) AS s, toStringCutToZero(s) AS s_cut;
```

結果:

```response
┌─s──────────┬─s_cut─┐
│ foo\0bar\0 │ foo   │
└────────────┴───────┘
```


## toDecimalString

数値を、出力時の小数桁数をユーザーが指定できる `String` 型の値に変換します。

**構文**

```sql
toDecimalString(number, scale)
```

**引数**

* `number` — 文字列として表現する値。[Int, UInt](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Decimal](../data-types/decimal.md)。
* `scale` — 小数桁数。[UInt8](../data-types/int-uint.md)。
  * [Decimal](../data-types/decimal.md) 型および [Int, UInt](../data-types/int-uint.md) 型の最大スケールは 77（Decimal の有効桁数の最大値）、
  * [Float](../data-types/float.md) の最大スケールは 60。

**返される値**

* 入力値を、指定された小数桁数（scale）で表現した [String](../data-types/string.md)。
  要求されたスケールが元の数値のスケールより小さい場合、数値は一般的な算術規則に従って丸められます。

**例**

クエリ:

```sql
SELECT toDecimalString(CAST('64.32', 'Float64'), 5);
```

結果:

```response
┌toDecimalString(CAST('64.32', 'Float64'), 5)─┐
│ 64.32000                                    │
└─────────────────────────────────────────────┘
```


## reinterpretAsUInt8

入力値を `UInt8` 型の値として解釈し、バイト列の再解釈を行います。[`CAST`](#cast) と異なり、この関数は元の値を保持しようとはしません。ターゲット型が入力型を表現できない場合、出力は意味を成さない値になります。

**構文**

```sql
reinterpretAsUInt8(x)
```

**パラメーター**

* `x`: UInt8 としてバイトレベルで再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

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


## reinterpretAsUInt16

入力値を `UInt16` 型の値として扱い、バイト列の再解釈を行います。[`CAST`](#cast) と異なり、この関数は元の値を保持しようとは試みません。対象の型が入力の値を表現できない場合、出力される値は意味を持ちません。

**構文**

```sql
reinterpretAsUInt16(x)
```

**パラメーター**

* `x`: バイト表現を UInt16 として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

* UInt16 として再解釈された値 `x`。[UInt16](/sql-reference/data-types/int-uint)。

**例**

クエリ:

```sql
SELECT
    toUInt8(257) AS x,
    toTypeName(x),
    reinterpretAsUInt16(x) AS res,
    toTypeName(res);
```

結果:

```response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ UInt8         │   1 │ UInt16          │
└───┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt32

入力値を `UInt32` 型の値として扱い、バイト単位で再解釈します。[`CAST`](#cast) と異なり、この関数は元の値を保持しようとしません。対象の型が入力値を表現できない場合、出力は意味のない値になります。

**構文**

```sql
reinterpretAsUInt32(x)
```

**パラメーター**

* `x`: バイト表現を UInt32 として再解釈する対象の値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

* UInt32 として再解釈された値 `x`。[UInt32](/sql-reference/data-types/int-uint)。

**例**

クエリ:

```sql
SELECT
    toUInt16(257) AS x,
    toTypeName(x),
    reinterpretAsUInt32(x) AS res,
    toTypeName(res)
```

結果:

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt16        │ 257 │ UInt32          │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt64

入力値を `UInt64` 型の値として扱うことで、バイト列を再解釈します。[`CAST`](#cast) と異なり、この関数は元の値を保持しようとは試みません。対象の型が入力値を表現できない場合、出力結果は意味を持ちません。

**構文**

```sql
reinterpretAsUInt64(x)
```

**パラメータ**

* `x`: バイト表現を UInt64 として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md)、または [FixedString](../data-types/fixedstring.md)。

**戻り値**

* UInt64 として再解釈された `x` の値。[UInt64](/sql-reference/data-types/int-uint)。

**例**

クエリ:

```sql
SELECT
    toUInt32(257) AS x,
    toTypeName(x),
    reinterpretAsUInt64(x) AS res,
    toTypeName(res)
```

結果:

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt32        │ 257 │ UInt64          │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt128

入力値を `UInt128` 型の値として扱い、バイト列として再解釈します。[`CAST`](#cast) と異なり、この関数は元の値を保持しようとはしません。対象の型で入力の値を表現できない場合、出力は意味のある値にはなりません。

**構文**

```sql
reinterpretAsUInt128(x)
```

**パラメーター**

* `x`: バイト表現を UInt128 として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

* 値 `x` を UInt128 として再解釈した結果を返します。[UInt128](/sql-reference/data-types/int-uint)。

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


## reinterpretAsUInt256

入力値を `UInt256` 型の値として扱い、バイト単位で再解釈を行います。[`CAST`](#cast) と異なり、この関数は元の値を保持しようとはしません。対象の型が入力値を表現できない場合、出力は無意味な値になります。

**構文**

```sql
reinterpretAsUInt256(x)
```

**パラメータ**

* `x`: バイト列を UInt256 として再解釈する対象の値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

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

結果:

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt128       │ 257 │ UInt256         │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt8

入力値を `Int8` 型の値として扱い、バイト列として再解釈を行います。[`CAST`](#cast) と異なり、この関数は元の値を保持しようとはしません。対象の型が入力値を表現できない場合、出力は無意味な値になります。

**構文**

```sql
reinterpretAsInt8(x)
```

**パラメーター**

* `x`: Int8 としてバイト再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**返される値**

* Int8 として再解釈された値 `x`。[Int8](/sql-reference/data-types/int-uint#integer-ranges)。

**例**

クエリ:

```sql
SELECT
    toUInt8(257) AS x,
    toTypeName(x),
    reinterpretAsInt8(x) AS res,
    toTypeName(res);
```

結果:

```response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ UInt8         │   1 │ Int8            │
└───┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt16

入力値を `Int16` 型の値として扱うことで、バイトレベルで再解釈を行います。[`CAST`](#cast) と異なり、この関数は元の値を保持しようとはしません。対象の型が入力の型を表現できない場合、出力は意味のない値になります。

**構文**

```sql
reinterpretAsInt16(x)
```

**パラメータ**

* `x`: バイト表現を Int16 として再解釈する対象の値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

* 値 `x` を Int16 として再解釈した値。[Int16](/sql-reference/data-types/int-uint#integer-ranges)。

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


## reinterpretAsInt32

入力値を `Int32` 型の値として扱い、そのバイト表現を再解釈します。[`CAST`](#cast) と異なり、この関数は元の値を保持しようとしません。ターゲット型が入力値を表現できない場合、出力には意味がありません。

**構文**

```sql
reinterpretAsInt32(x)
```

**パラメーター**

* `x`: Int32 としてバイト列を再解釈する対象となる値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**返される値**

* 値 `x` を Int32 としてバイト列再解釈した結果。[Int32](/sql-reference/data-types/int-uint#integer-ranges)。

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


## reinterpretAsInt64

入力値を `Int64` 型の値として扱うことで、バイト列として再解釈を行います。[`CAST`](#cast) と異なり、この関数は元の値を保持しようとはしません。対象の型で入力値を表現できない場合、出力は意味のない値になります。

**構文**

```sql
reinterpretAsInt64(x)
```

**パラメーター**

* `x`: Int64 としてバイト表現を再解釈する対象の値。[ (U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**返される値**

* Int64 として再解釈した `x` の値。[Int64](/sql-reference/data-types/int-uint#integer-ranges)。

**例**

クエリ:

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


## reinterpretAsInt128

入力値を Int128 型の値として扱い、バイト列として再解釈します。[`CAST`](#cast) と異なり、この関数は元の値を保持しようとはしません。対象の型で入力値を表現できない場合、その出力は意味のない値になります。

**構文**

```sql
reinterpretAsInt128(x)
```

**パラメータ**

* `x`: Int128 としてバイト単位で再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**返される値**

* 値 `x` を Int128 としてバイト単位で再解釈した結果。[Int128](/sql-reference/data-types/int-uint#integer-ranges)。

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


## reinterpretAsInt256

入力値を `Int256` 型の値として解釈し直し、バイト列の再解釈を行います。[`CAST`](#cast) と異なり、この関数は元の値の保持を試みません。対象の型が入力の型を表現できない場合、出力結果は無意味な値になります。

**構文**

```sql
reinterpretAsInt256(x)
```

**パラメーター**

* `x`: バイト表現を Int256 として再解釈する対象の値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**返される値**

* 値 `x` をバイト表現のまま Int256 として再解釈した結果。[Int256](/sql-reference/data-types/int-uint#integer-ranges)。

**例**

クエリ:

```sql
SELECT
    toInt128(257) AS x,
    toTypeName(x),
    reinterpretAsInt256(x) AS res,
    toTypeName(res);
```

結果：

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int128        │ 257 │ Int256          │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsFloat32

入力値を Float32 型の値として解釈し、バイト列の再解釈を行います。[`CAST`](#cast) と異なり、この関数は元の値を保持しようとはしません。対象の型が入力の型を表現できない場合、出力には意味がありません。

**構文**

```sql
reinterpretAsFloat32(x)
```

**パラメータ**

* `x`: Float32 型として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md)、または [FixedString](../data-types/fixedstring.md)。

**返される値**

* Float32 型として再解釈された値 `x`。[Float32](../data-types/float.md)。

**例**

クエリ:

```sql
SELECT reinterpretAsUInt32(toFloat32(0.2)) AS x, reinterpretAsFloat32(x);
```

結果：

```response
┌──────────x─┬─reinterpretAsFloat32(x)─┐
│ 1045220557 │                     0.2 │
└────────────┴─────────────────────────┘
```


## reinterpretAsFloat64

入力値を `Float64` 型の値として扱い、バイト列の再解釈を行います。[`CAST`](#cast) と異なり、この関数は元の値を保持しようとはしません。対象の型が入力値の型を表現できない場合、出力は無意味な値になります。

**構文**

```sql
reinterpretAsFloat64(x)
```

**パラメータ**

* `x`: Float64 として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

* 値 `x` を Float64 として再解釈したもの。[Float64](../data-types/float.md)。

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


## reinterpretAsDate

文字列、FixedString、または数値を受け取り、そのバイト列をホストのバイト順序（リトルエンディアン）での数値として解釈します。解釈された数値を Unix Epoch の開始時点からの日数として解釈し、その日数に対応する日付を返します。

**構文**

```sql
reinterpretAsDate(x)
```

**パラメーター**

* `x`: UNIX エポックの開始からの経過日数。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

* Date 型。[Date](../data-types/date.md)。

**実装の詳細**

:::note
指定された文字列が十分な長さでない場合は、この関数は文字列が必要な数のヌルバイトで埋められているかのように動作します。文字列が必要な長さを超える場合は、余分なバイトは無視されます。
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


## reinterpretAsDateTime

これらの関数は文字列を受け取り、その文字列の先頭にあるバイト列をホスト順序（リトルエンディアン）の数値として解釈します。Unixエポックの開始時点からの経過秒数として解釈した日時を返します。

**構文**

```sql
reinterpretAsDateTime(x)
```

**パラメーター**

* `x`: Unixエポック開始からの秒数。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

* 日付と時刻。[DateTime](../data-types/datetime.md)。

**実装の詳細**

:::note
与えられた文字列が十分な長さでない場合、この関数は不足分が必要な数のヌルバイトで埋められているかのように動作します。文字列が必要以上に長い場合、余分なバイトは無視されます。
:::

**例**

クエリ:

```sql
SELECT reinterpretAsDateTime(65), reinterpretAsDateTime('A');
```

結果:

```response
┌─reinterpretAsDateTime(65)─┬─reinterpretAsDateTime('A')─┐
│       1970-01-01 01:01:05 │        1970-01-01 01:01:05 │
└───────────────────────────┴────────────────────────────┘
```


## reinterpretAsString

この関数は数値、日付、または日時を受け取り、対応する値をホストのバイトオーダー（リトルエンディアン）で表したバイト列を含む文字列を返します。末尾の null バイトは削除されます。例えば、UInt32 型の値 255 は 1 バイト長の文字列になります。

**構文**

```sql
reinterpretAsString(x)
```

**パラメーター**

* `x`: 文字列として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)。

**戻り値**

* `x` を表現するバイト列からなる文字列。[String](../data-types/fixedstring.md)。

**例**

クエリ:

```sql
SELECT
    reinterpretAsString(toDateTime('1970-01-01 01:01:05')),
    reinterpretAsString(toDate('1970-03-07'));
```

結果:

```response
┌─reinterpretAsString(toDateTime('1970-01-01 01:01:05'))─┬─reinterpretAsString(toDate('1970-03-07'))─┐
│ A                                                      │ A                                         │
└────────────────────────────────────────────────────────┴───────────────────────────────────────────┘
```


## reinterpretAsFixedString

この関数は数値、日付、または日時を受け取り、対応する値をホストのバイトオーダー（リトルエンディアン）で表すバイト列を含む `FixedString` を返します。末尾にあるヌルバイトは削除されます。たとえば、`UInt32` 型の値 255 は、長さ 1 バイトの `FixedString` になります。

**構文**

```sql
reinterpretAsFixedString(x)
```

**パラメーター**

* `x`: 文字列として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)。

**返される値**

* `x` を表すバイト列を含む固定長文字列型の値。[FixedString](../data-types/fixedstring.md)。

**例**

クエリ:

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


## reinterpretAsUUID

:::note
ここで挙げている UUID 関数に加えて、専用の [UUID 関数ドキュメント](../functions/uuid-functions.md) も用意されています。
:::

16 バイトの文字列を受け取り、前半と後半の 8 バイトずつをリトルエンディアンのバイト順序で解釈して UUID を返します。文字列が十分な長さでない場合、この関数は必要な数のヌルバイトが末尾にパディングされたものとして動作します。文字列が 16 バイトより長い場合、末尾の余分なバイトは無視されます。

**構文**

```sql
reinterpretAsUUID(fixed_string)
```

**引数**

* `fixed_string` — ビッグエンディアンのバイト列。[FixedString](/sql-reference/data-types/fixedstring)。

**戻り値**

* UUID 型の値。[UUID](/sql-reference/data-types/uuid)。

**使用例**

文字列から UUID への変換。

クエリ:

```sql
SELECT reinterpretAsUUID(reverse(unhex('000102030405060708090a0b0c0d0e0f')));
```

結果：

```response
┌─reinterpretAsUUID(reverse(unhex('000102030405060708090a0b0c0d0e0f')))─┐
│                                  08090a0b-0c0d-0e0f-0001-020304050607 │
└───────────────────────────────────────────────────────────────────────┘
```

String 型と UUID 型を相互に変換する。

クエリ:

```sql
WITH
    generateUUIDv4() AS uuid,
    identity(lower(hex(reverse(reinterpretAsString(uuid))))) AS str,
    reinterpretAsUUID(reverse(unhex(str))) AS uuid2
SELECT uuid = uuid2;
```

結果：

```response
┌─equals(uuid, uuid2)─┐
│                   1 │
└─────────────────────┘
```


## reinterpret

`x` の値のメモリ上のバイト列をそのまま利用し、それを変換先の型として再解釈します。

**構文**

```sql
reinterpret(x, type)
```

**引数**

* `x` — 任意の型。
* `type` — 変換先の型。配列の場合、その要素型は固定長型でなければなりません。

**戻り値**

* 変換先の型の値。

**例**

クエリ:

```sql
SELECT reinterpret(toInt8(-1), 'UInt8') AS int_to_uint,
    reinterpret(toInt8(1), 'Float32') AS int_to_float,
    reinterpret('1', 'UInt32') AS string_to_int;
```

結果:

```text
┌─int_to_uint─┬─int_to_float─┬─string_to_int─┐
│         255 │        1e-45 │            49 │
└─────────────┴──────────────┴───────────────┘
```

クエリ：

```sql
SELECT reinterpret(x'3108b4403108d4403108b4403108d440', 'Array(Float32)') AS string_to_array_of_Float32;
```

結果:

```text
┌─string_to_array_of_Float32─┐
│ [5.626,6.626,5.626,6.626]  │
└────────────────────────────┘
```


## CAST

入力値を指定されたデータ型に変換します。[reinterpret](#reinterpret) 関数と異なり、`CAST` は新しいデータ型を使って同じ値を表現しようとします。変換できない場合は例外が送出されます。
複数の構文がサポートされています。

**構文**

```sql
CAST(x, T)
CAST(x AS t)
x::t
```

**引数**

* `x` — 変換する値。任意の型の値を指定できます。
* `T` — 変換先のデータ型名。[String](../data-types/string.md)。
* `t` — 変換先のデータ型。

**戻り値**

* 変換された値。

:::note
入力値が変換先の型の範囲内に収まらない場合、結果はオーバーフローします。たとえば、`CAST(-1, 'UInt8')` は `255` を返します。
:::

**例**

クエリ：

```sql
SELECT
    CAST(toInt8(-1), 'UInt8') AS cast_int_to_uint,
    CAST(1.5 AS Decimal(3,2)) AS cast_float_to_decimal,
    '1'::Int32 AS cast_string_to_int;
```

結果:

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

[FixedString (N)](../data-types/fixedstring.md) への変換は、[String](../data-types/string.md) 型または [FixedString](../data-types/fixedstring.md) 型の引数に対してのみ可能です。

[Nullable](../data-types/nullable.md) 型への変換およびその逆方向への変換がサポートされています。

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

結果:

```response
┌─toTypeName(CAST(x, 'Nullable(UInt16)'))─┐
│ Nullable(UInt16)                        │
│ Nullable(UInt16)                        │
└─────────────────────────────────────────┘
```

**関連項目**

* [cast&#95;keep&#95;nullable](../../operations/settings/settings.md/#cast_keep_nullable) 設定


## accurateCast(x, T)

`x` をデータ型 `T` に変換します。

[cast](#cast) との違いは、`accurateCast` では、値 `x` が型 `T` の範囲に収まらない場合、キャスト時に数値型のオーバーフローを許可しない点です。例えば、`accurateCast(-1, 'UInt8')` は例外をスローします。

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

クエリ:

```sql
SELECT accurateCast(-1, 'UInt8') AS uint8;
```

結果:

```response
コード: 70. DB::Exception: localhost:9000 から受信。DB::Exception: Int8 列の値を UInt8 型に安全に変換できません: accurateCast(-1, 'UInt8') AS uint8 の処理中。
```


## accurateCastOrNull(x, T)

入力値 `x` を指定されたデータ型 `T` に変換します。常に [Nullable](../data-types/nullable.md) 型を返し、変換後の値が対象の型で表現できない場合は [NULL](/sql-reference/syntax#null) を返します。

**構文**

```sql
accurateCastOrNull(x, T)
```

**引数**

* `x` — 入力値。
* `T` — 戻り値のデータ型名。

**戻り値**

* データ型 `T` に変換された値。

**例**

クエリ:

```sql
SELECT toTypeName(accurateCastOrNull(5, 'UInt8'));
```

結果：

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

結果：

```response
┌─uint8─┬─int8─┬─fixed_string─┐
│  ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ         │
└───────┴──────┴──────────────┘
```


## accurateCastOrDefault(x, T[, default&#95;value])

入力値 `x` を指定されたデータ型 `T` に変換します。キャスト結果が対象型で表現できない場合は、その型のデフォルト値、もしくは指定されていれば `default_value` を返します。

**構文**

```sql
accurateCastOrDefault(x, T)
```

**引数**

* `x` — 入力値。
* `T` — 戻り値のデータ型名。
* `default_value` — 戻り値のデータ型のデフォルト値。

**返される値**

* 指定されたデータ型 `T` に変換された値。

**例**

クエリ：

```sql
SELECT toTypeName(accurateCastOrDefault(5, 'UInt8'));
```

結果：

```response
┌─toTypeName(accurateCastOrDefault(5, 'UInt8'))─┐
│ UInt8                                         │
└───────────────────────────────────────────────┘
```

クエリ:

```sql
SELECT
    accurateCastOrDefault(-1, 'UInt8') AS uint8,
    accurateCastOrDefault(-1, 'UInt8', 5) AS uint8_default,
    accurateCastOrDefault(128, 'Int8') AS int8,
    accurateCastOrDefault(128, 'Int8', 5) AS int8_default,
    accurateCastOrDefault('Test', 'FixedString(2)') AS fixed_string,
    accurateCastOrDefault('Test', 'FixedString(2)', 'Te') AS fixed_string_default;
```

結果：

```response
┌─uint8─┬─uint8_default─┬─int8─┬─int8_default─┬─fixed_string─┬─fixed_string_default─┐
│     0 │             5 │    0 │            5 │              │ Te                   │
└───────┴───────────────┴──────┴──────────────┴──────────────┴──────────────────────┘
```


## toInterval

数値とインターバル単位（例：&#39;second&#39; や &#39;day&#39;）から [Interval](../../sql-reference/data-types/special-data-types/interval.md) データ型の値を作成します。

**構文**

```sql
toInterval(値, 単位)
```

**引数**

* `value` — インターバルの長さ。整数値、その文字列表現、または浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

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

* 結果として得られるインターバル。[Interval](../../sql-reference/data-types/special-data-types/interval.md)

**例**

```sql
SELECT toDateTime('2025-01-01 00:00:00') + toInterval(1, 'hour')
```

```response
┌─toDateTime('2025-01-01 00:00:00') + toInterval(1, 'hour') ─┐
│                                        2025-01-01 01:00:00 │
└────────────────────────────────────────────────────────────┘
```


## toIntervalYear

`n` 年を表すインターバル値を、データ型 [IntervalYear](../data-types/special-data-types/interval.md) として返します。

**構文**

```sql
toIntervalYear(n)
```

**引数**

* `n` — 年数。整数値、その文字列表現、または浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**戻り値**

* `n` 年の期間。[IntervalYear](../data-types/special-data-types/interval.md)。

**例**

クエリ：

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


## toIntervalQuarter

`n` 四半期を表す [IntervalQuarter](../data-types/special-data-types/interval.md) 型の間隔を返します。

**構文**

```sql
toIntervalQuarter(n)
```

**引数**

* `n` — 四半期の数。整数値、整数値の文字列表現、または浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返り値**

* `n` 四半期分のインターバル。[IntervalQuarter](../data-types/special-data-types/interval.md)。

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


## toIntervalMonth

データ型 [IntervalMonth](../data-types/special-data-types/interval.md) の `n` か月の間隔を返します。

**構文**

```sql
toIntervalMonth(n)
```

**引数**

* `n` — 月数。整数値、その文字列表現、または浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**戻り値**

* `n` か月のインターバル。[IntervalMonth](../data-types/special-data-types/interval.md)。

**例**

クエリ:

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalMonth(1) AS interval_to_month
SELECT date + interval_to_month AS result
```

結果:

```response
┌─────result─┐
│ 2024-07-15 │
└────────────┘
```


## toIntervalWeek

データ型 [IntervalWeek](../data-types/special-data-types/interval.md) の `n` 週間を表す間隔を返します。

**構文**

```sql
toIntervalWeek(n)
```

**引数**

* `n` — 週数。整数値またはその文字列表現、および浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**戻り値**

* `n` 週を表すインターバル。[IntervalWeek](../data-types/special-data-types/interval.md)。

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


## toIntervalDay

`n` 日の時間間隔を表す [IntervalDay](../data-types/special-data-types/interval.md) 型の値を返します。

**構文**

```sql
toIntervalDay(n)
```

**引数**

* `n` — 日数。整数値またはその文字列表現、または浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

* `n` 日のインターバル。[IntervalDay](../data-types/special-data-types/interval.md)。

**例**

クエリ:

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


## toIntervalHour

長さ `n` 時間の間隔値を、データ型 [IntervalHour](../data-types/special-data-types/interval.md) として返します。

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


## toIntervalMinute

データ型 [IntervalMinute](../data-types/special-data-types/interval.md) の `n` 分を表す間隔を返します。

**構文**

```sql
toIntervalMinute(n)
```

**引数**

* `n` — 分数（時間の単位である分の数）。整数値またはその文字列表現、および浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**戻り値**

* `n` 分の時間間隔。[IntervalMinute](../data-types/special-data-types/interval.md)。

**例**

クエリ:

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalMinute(12) AS interval_to_minutes
SELECT date + interval_to_minutes AS result
```

Result: 結果:

```response
┌──────────────result─┐
│ 2024-06-15 00:12:00 │
└─────────────────────┘
```


## toIntervalSecond

`n` 秒のインターバルを表す [IntervalSecond](../data-types/special-data-types/interval.md) 型の値を返します。

**構文**

```sql
toIntervalSecond(n)
```

**引数**

* `n` — 秒数。整数値またはその文字列表現、および浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**戻り値**

* `n` 秒のインターバル。[IntervalSecond](../data-types/special-data-types/interval.md)。

**例**

クエリ：

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


## toIntervalMillisecond

`n` ミリ秒の間隔をデータ型 [IntervalMillisecond](../data-types/special-data-types/interval.md) で返します。

**構文**

```sql
toIntervalMillisecond(n)
```

**引数**

* `n` — ミリ秒数。整数値またはその文字列表現、および浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

* `n` ミリ秒の時間間隔。[IntervalMilliseconds](../data-types/special-data-types/interval.md)。

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


## toIntervalMicrosecond

`n` マイクロ秒の値を [IntervalMicrosecond](../data-types/special-data-types/interval.md) 型のインターバルとして返します。

**構文**

```sql
toIntervalMicrosecond(n)
```

**引数**

* `n` — マイクロ秒数。整数値、その文字列表現、または浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**戻り値**

* `n` マイクロ秒の時間間隔。[IntervalMicrosecond](../data-types/special-data-types/interval.md)。

**例**

クエリ:

```sql
WITH
    toDateTime('2024-06-15') AS date,
    toIntervalMicrosecond(30) AS interval_to_microseconds
SELECT date + interval_to_microseconds AS result
```

結果：

```response
┌─────────────────────result─┐
│ 2024-06-15 00:00:00.000030 │
└────────────────────────────┘
```


## toIntervalNanosecond

`n` ナノ秒のインターバルをデータ型 [IntervalNanosecond](../data-types/special-data-types/interval.md) で返します。

**構文**

```sql
toIntervalNanosecond(n)
```

**引数**

* `n` — ナノ秒の数。整数値、その文字列表現、または浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**戻り値**

* `n` ナノ秒を表す Interval。[IntervalNanosecond](../data-types/special-data-types/interval.md)。

**例**

クエリ:

```sql
WITH
    toDateTime('2024-06-15') AS date,
    toIntervalNanosecond(30) AS interval_to_nanoseconds
SELECT date + interval_to_nanoseconds AS result
```

結果：

```response
┌────────────────────────result─┐
│ 2024-06-15 00:00:00.000000030 │
└───────────────────────────────┘
```


## parseDateTime

[String](../data-types/string.md) を [MySQL のフォーマット文字列](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format) に従って [DateTime](../data-types/datetime.md) に変換します。

この関数は、[formatDateTime](/sql-reference/functions/date-time-functions#formatDateTime) 関数の逆の処理を行います。

**構文**

```sql
parseDateTime(str[, format[, timezone]])
```

**引数**

* `str` — パースする文字列
* `format` — フォーマット文字列。省略可能。指定されていない場合は `%Y-%m-%d %H:%i:%s`。
* `timezone` — [Timezone](operations/server-configuration-parameters/settings.md#timezone)。省略可能。

**戻り値**

MySQL スタイルのフォーマット文字列に従い、入力文字列からパースされた [DateTime](../data-types/datetime.md) 値を返します。

**サポートされているフォーマット指定子**

[formatDateTime](/sql-reference/functions/date-time-functions#formatDateTime) に列挙されているすべてのフォーマット指定子（ただし次を除く）:

* %Q: 四半期 (1-4)

**例**

```sql
SELECT parseDateTime('2021-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')

┌─parseDateTime('2021-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')─┐
│                                       2021-01-04 23:00:00 │
└───────────────────────────────────────────────────────────┘
```

別名：`TO_TIMESTAMP`


## parseDateTimeOrZero {#parsedatetimeorzero}

[parseDateTime](#parsedatetime) と同様ですが、処理できない日付形式に遭遇した場合は 0 の日時値を返します。



## parseDateTimeOrNull {#parsedatetimeornull}

[parseDateTime](#parsedatetime) と同様ですが、処理できない日付形式に遭遇した場合は `NULL` を返します。

エイリアス: `str_to_date`。



## parseDateTimeInJodaSyntax

[parseDateTime](#parsedatetime) と同様ですが、フォーマット文字列に MySQL 構文ではなく [Joda](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html) 構文を使用します。

この関数は、関数 [formatDateTimeInJodaSyntax](/sql-reference/functions/date-time-functions#formatDateTimeInJodaSyntax) の逆の処理を行います。

**構文**

```sql
parseDateTimeInJodaSyntax(str[, format[, timezone]])
```

**引数**

* `str` — 解析する文字列
* `format` — フォーマット文字列。省略可能。指定しない場合は `yyyy-MM-dd HH:mm:ss`。
* `timezone` — [Timezone](operations/server-configuration-parameters/settings.md#timezone)。省略可能。

**返される値**

入力文字列を Joda スタイルのフォーマット文字列に従って解析した [DateTime](../data-types/datetime.md) 値を返します。

**サポートされているフォーマット指定子**

[`formatDateTimeInJodaSyntax`](/sql-reference/functions/date-time-functions#formatDateTimeInJodaSyntax) に記載されているすべてのフォーマット指定子がサポートされていますが、次のものを除きます:

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

[parseDateTimeInJodaSyntax](#parsedatetimeinjodasyntax) と同様ですが、処理できない日付形式に当たった場合は、ゼロ値の日付を返します。



## parseDateTimeInJodaSyntaxOrNull {#parsedatetimeinjodasyntaxornull}

[parseDateTimeInJodaSyntax](#parsedatetimeinjodasyntax) と同様ですが、処理できない日付形式を検出した場合は `NULL` を返します。



## parseDateTime64

[MySQL のフォーマット文字列](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format)に従って、[String](../data-types/string.md) を [DateTime64](../data-types/datetime64.md) に変換します。

**構文**

```sql
parseDateTime64(str[, format[, timezone]])
```

**引数**

* `str` — 解析する文字列。
* `format` — フォーマット文字列。省略可能。指定されていない場合は `%Y-%m-%d %H:%i:%s.%f` が使用されます。
* `timezone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。省略可能。

**戻り値**

MySQL スタイルのフォーマット文字列に従って、入力文字列から解析された [DateTime64](../data-types/datetime64.md) 値を返します。
返される値の精度は 6 桁です。


## parseDateTime64OrZero {#parsedatetime64orzero}

[parseDateTime64](#parsedatetime64) と同様ですが、処理できない日付形式に遭遇した場合は、ゼロの日時を返します。



## parseDateTime64OrNull {#parsedatetime64ornull}

[parseDateTime64](#parsedatetime64) と同様ですが、処理できない日付形式に遭遇した場合は `NULL` を返します。



## parseDateTime64InJodaSyntax

[String](../data-types/string.md) を [Joda のフォーマット文字列](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html) に従って [DateTime64](../data-types/datetime64.md) に変換します。

**構文**

```sql
parseDateTime64InJodaSyntax(str[, format[, timezone]])
```

**引数**

* `str` — 解析対象の文字列。
* `format` — フォーマット文字列。省略可能。省略された場合は `yyyy-MM-dd HH:mm:ss` が使用されます。
* `timezone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。省略可能。

**返り値**

入力文字列を Joda スタイルのフォーマット文字列に従って解析した [DateTime64](../data-types/datetime64.md) 値を返します。
返される値の精度は、フォーマット文字列内の `S` プレースホルダーの数に等しくなります（ただし最大 6 まで）。


## parseDateTime64InJodaSyntaxOrZero {#parsedatetime64injodasyntaxorzero}

[parseDateTime64InJodaSyntax](#parsedatetime64injodasyntax) と同様ですが、処理できない日付フォーマットに遭遇した場合は、ゼロの日時を返します。



## parseDateTime64InJodaSyntaxOrNull {#parsedatetime64injodasyntaxornull}

[parseDateTime64InJodaSyntax](#parsedatetime64injodasyntax) と同様ですが、処理できない日付形式が指定された場合は `NULL` を返します。



## parseDateTimeBestEffort

## parseDateTime32BestEffort

[String](../data-types/string.md) 形式で表現された日付と時刻を [DateTime](/sql-reference/data-types/datetime) 型に変換します。

この関数は [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)、[RFC 1123 - 5.2.14 RFC-822 Date and Time Specification](https://tools.ietf.org/html/rfc1123#page-55)、ClickHouse 独自の形式およびその他のいくつかの日付・時刻形式を解析します。

**構文**

```sql
parseDateTimeBestEffort(time_string [, time_zone])
```

**引数**

* `time_string` — 変換対象の日付と時刻を含む文字列。[String](../data-types/string.md)。
* `time_zone` — タイムゾーン。このタイムゾーンに従って `time_string` を解析します。[String](../data-types/string.md)。

**サポートされている非標準フォーマット**

* 9〜10 桁の [Unix タイムスタンプ](https://en.wikipedia.org/wiki/Unix_time) を含む文字列。
* 日付と時刻の要素を含む文字列: `YYYYMMDDhhmmss`, `DD/MM/YYYY hh:mm:ss`, `DD-MM-YY hh:mm`, `YYYY-MM-DD hh:mm:ss` など。
* 日付の要素のみを含み、時刻の要素を含まない文字列: `YYYY`, `YYYYMM`, `YYYY*MM`, `DD/MM/YYYY`, `DD-MM-YY` など。
* 日と時刻を含む文字列: `DD`, `DD hh`, `DD hh:mm`。この場合、`MM` には `01` が補われます。
* 日付と時刻にタイムゾーンオフセット情報が付加された文字列: `YYYY-MM-DD hh:mm:ss ±h:mm` など。例: `2020-12-12 17:36:00 -5:00`。
* [syslog タイムスタンプ](https://datatracker.ietf.org/doc/html/rfc3164#section-4.1.2): `Mmm dd hh:mm:ss`。例: `Jun  9 14:20:32`。

区切り文字を含むすべてのフォーマットについて、月名はフルスペルまたは月名の先頭 3 文字のいずれでも解析されます。例: `24/DEC/18`, `24-Dec-18`, `01-September-2018`。
年が指定されていない場合は、現在の年と見なされます。結果の DateTime が現在時刻より 1 秒でも未来になる場合、現在の年は前年に置き換えられます。

**戻り値**

* [DateTime](../data-types/datetime.md) データ型に変換された `time_string`。

**例**

クエリ:

```sql
SELECT parseDateTimeBestEffort('23/10/2020 12:12:57')
AS parseDateTimeBestEffort;
```

結果：

```response
┌─parseDateTimeBestEffort─┐
│     2020-10-23 12:12:57 │
└─────────────────────────┘
```

クエリ:

```sql
SELECT parseDateTimeBestEffort('Sat, 18 Aug 2018 07:22:16 GMT', 'Asia/Istanbul')
AS parseDateTimeBestEffort;
```

結果：

```response
┌─parseDateTimeBestEffort─┐
│     2018-08-18 10:22:16 │
└─────────────────────────┘
```

クエリ:

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

結果:

```response
┌─parseDateTimeBestEffort─┐
│     2018-10-23 10:12:12 │
└─────────────────────────┘
```

クエリ：

```sql
SELECT toYear(now()) AS year, parseDateTimeBestEffort('10 20:19');
```

結果:


```response
┌─year─┬─parseDateTimeBestEffort('10 20:19')─┐
│ 2023 │                 2023-01-10 20:19:00 │
└──────┴─────────────────────────────────────┘
```

クエリ:

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
* [@xkcd による ISO 8601 に関するアナウンス](https://xkcd.com/1179/)
* [RFC 3164](https://datatracker.ietf.org/doc/html/rfc3164#section-4.1.2)


## parseDateTimeBestEffortUS {#parsedatetimebesteffortus}

この関数は、`YYYY-MM-DD hh:mm:ss` のような ISO の日付形式や、`YYYYMMDDhhmmss`、`YYYY-MM`、`DD hh`、`YYYY-MM-DD hh:mm:ss ±h:mm` など、月と日付の要素を曖昧さなしに抽出できるその他の日付形式に対しては、[parseDateTimeBestEffort](#parsedatetimebesteffort) と同様に動作します。`MM/DD/YYYY`、`MM-DD-YYYY`、`MM-DD-YY` のように月と日付の要素を一意に特定できない場合には、`DD/MM/YYYY`、`DD-MM-YYYY`、`DD-MM-YY` ではなく、米国式の日付形式を優先します。ただし例外として、月の値が 12 より大きく 31 以下の場合には、この関数は [parseDateTimeBestEffort](#parsedatetimebesteffort) の動作にフォールバックします。例えば、`15/08/2020` は `2020-08-15` として解析されます。



## parseDateTimeBestEffortOrNull {#parsedatetimebesteffortornull}
## parseDateTime32BestEffortOrNull {#parsedatetime32besteffortornull}

[parseDateTimeBestEffort](#parsedatetimebesteffort) と同様ですが、処理できない日付形式に出会った場合は `NULL` を返します。



## parseDateTimeBestEffortOrZero {#parsedatetimebesteffortorzero}
## parseDateTime32BestEffortOrZero {#parsedatetime32besteffortorzero}

[parseDateTimeBestEffort](#parsedatetimebesteffort) と同様ですが、処理できない形式の日付に遭遇した場合は、ゼロ日付またはゼロ日時を返します。



## parseDateTimeBestEffortUSOrNull {#parsedatetimebesteffortusornull}

[parseDateTimeBestEffortUS](#parsedatetimebesteffortus) 関数と同様ですが、処理できない日付形式を検出した場合は `NULL` を返します。



## parseDateTimeBestEffortUSOrZero {#parsedatetimebesteffortusorzero}

[parseDateTimeBestEffortUS](#parsedatetimebesteffortus) 関数と同様ですが、処理できない形式の日付を検出した場合に、ゼロ日付（`1970-01-01`）または時刻付きゼロ日付（`1970-01-01 00:00:00`）を返します。



## parseDateTime64BestEffort

[parseDateTimeBestEffort](#parsedatetimebesteffort) 関数と同様ですが、ミリ秒およびマイクロ秒も解析し、[DateTime](/sql-reference/data-types/datetime) 型の値を返します。

**構文**

```sql
parseDateTime64BestEffort(time_string [, precision [, time_zone]])
```

**引数**

* `time_string` — 変換する日付、または日付と時刻を含む文字列。[String](../data-types/string.md)。
* `precision` — 要求される精度。`3` — ミリ秒、`6` — マイクロ秒。既定値 — `3`。省略可。[UInt8](../data-types/int-uint.md)。
* `time_zone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。関数は `time_string` をこのタイムゾーンとして解釈します。省略可。[String](../data-types/string.md)。

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

[parseDateTime64BestEffort](#parsedatetime64besteffort) と同様ですが、あいまいさがある場合には、米国形式の日付（`MM/DD/YYYY` など）を優先して解釈します。



## parseDateTime64BestEffortOrNull {#parsedatetime64besteffortornull}

[parseDateTime64BestEffort](#parsedatetime64besteffort) と同様ですが、処理できない日付形式に遭遇した場合は `NULL` を返します。



## parseDateTime64BestEffortOrZero {#parsedatetime64besteffortorzero}

[parseDateTime64BestEffort](#parsedatetime64besteffort) と同様ですが、処理できない日付形式に遭遇した場合は、ゼロの日付またはゼロの日時を返します。



## parseDateTime64BestEffortUSOrNull {#parsedatetime64besteffortusornull}

[parseDateTime64BestEffort](#parsedatetime64besteffort) と同じですが、あいまいな場合には米国の日時形式（`MM/DD/YYYY` など）を優先的に解釈し、処理できない形式だった場合は `NULL` を返します。



## parseDateTime64BestEffortUSOrZero {#parsedatetime64besteffortusorzero}

[parseDateTime64BestEffort](#parsedatetime64besteffort) と同様ですが、この関数はあいまいな場合に US の日付形式（`MM/DD/YYYY` など）を優先し、解釈できない日付形式に遭遇したときはゼロ日付またはゼロ日時を返します。



## toLowCardinality

入力引数を、同じデータ型の [LowCardinality](../data-types/lowcardinality.md) バージョンに変換します。

`LowCardinality` データ型から通常のデータ型に変換するには、[CAST](#cast) 関数を使用します。たとえば `CAST(x as String)` のように指定します。

**構文**

```sql
toLowCardinality(expr)
```

**引数**

* `expr` — 結果が[サポートされているデータ型](/sql-reference/data-types)のいずれかとなる[式](/sql-reference/syntax#expressions)。

**戻り値**

* `expr` の結果。`expr` の型に対する [LowCardinality](../data-types/lowcardinality.md) 型。

**例**

クエリ:

```sql
SELECT toLowCardinality('1');
```

結果：

```response
┌─toLowCardinality('1')─┐
│ 1                     │
└───────────────────────┘
```


## toUnixTimestamp

`String`、`Date`、または `DateTime` を、Unix タイムスタンプ（`1970-01-01 00:00:00 UTC` からの経過秒数）を表す `UInt32` 値に変換します。

**構文**

```sql
toUnixTimestamp(date, [timezone])
```

**引数**

* `date`: 変換する値。[`Date`](/sql-reference/data-types/date) または [`Date32`](/sql-reference/data-types/date32) または [`DateTime`](/sql-reference/data-types/datetime) または [`DateTime64`](/sql-reference/data-types/datetime64) または [`String`](/sql-reference/data-types/string)。
* `timezone`: 省略可能。変換に使用するタイムゾーン。指定されていない場合は、サーバーのタイムゾーンが使用されます。[`String`](/sql-reference/data-types/string)

**戻り値**

Unixタイムスタンプを返します。[`UInt32`](/sql-reference/data-types/int-uint)

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


## toUnixTimestamp64Second

`DateTime64` を秒単位の固定精度を持つ `Int64` 値に変換します。入力値は、その精度に応じて適切にスケーリングされます。

:::note
出力値は UTC のタイムスタンプであり、`DateTime64` のタイムゾーンではありません。
:::

**構文**

```sql
toUnixTimestamp64Second(value)
```

**引数**

* `value` — 任意の精度を持つ DateTime64 型の値。[DateTime64](../data-types/datetime64.md)。

**戻り値**

* `value` を `Int64` データ型に変換した値。[Int64](../data-types/int-uint.md)。

**例**

クエリ：

```sql
WITH toDateTime64('2009-02-13 23:31:31.011', 3, 'UTC') AS dt64
SELECT toUnixTimestamp64Second(dt64);
```

結果:

```response
┌─toUnixTimestamp64Second(dt64)─┐
│                    1234567891 │
└───────────────────────────────┘
```


## toUnixTimestamp64Milli

`DateTime64` を固定のミリ秒精度を持つ `Int64` 値に変換します。入力値は、その精度に応じて適切にスケールアップまたはスケールダウンされます。

:::note
出力値は `DateTime64` のタイムゾーンではなく、UTC のタイムスタンプです。
:::

**構文**

```sql
toUnixTimestamp64Milli(value)
```

**引数**

* `value` — 任意の精度を持つ `DateTime64` 値。[DateTime64](../data-types/datetime64.md)。

**返り値**

* `value` を `Int64` データ型に変換した値。[Int64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
WITH toDateTime64('2009-02-13 23:31:31.011', 3, 'UTC') AS dt64
SELECT toUnixTimestamp64Milli(dt64);
```

結果:

```response
┌─toUnixTimestamp64Milli(dt64)─┐
│                1234567891011 │
└──────────────────────────────┘
```


## toUnixTimestamp64Micro

`DateTime64` を、マイクロ秒単位で固定精度の `Int64` 値に変換します。入力値は、その精度に応じて適切にスケール変換（拡大または縮小）されます。

:::note
出力値は `DateTime64` のタイムゾーンではなく、UTC のタイムスタンプです。
:::

**構文**

```sql
toUnixTimestamp64Micro(value)
```

**引数**

* `value` — 任意精度の DateTime64 値。[DateTime64](../data-types/datetime64.md)。

**戻り値**

* `Int64` データ型に変換された `value`。[Int64](../data-types/int-uint.md)。

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


## toUnixTimestamp64Nano

`DateTime64` をナノ秒精度に固定した `Int64` 値に変換します。入力値は、その精度に応じて適切にスケール変換（拡大または縮小）されます。

:::note
出力値は `DateTime64` のタイムゾーンではなく、UTC のタイムスタンプです。
:::

**構文**

```sql
toUnixTimestamp64Nano(value)
```

**引数**

* `value` — 任意の精度を持つ DateTime64 値。[DateTime64](../data-types/datetime64.md)。

**戻り値**

* `value` を `Int64` データ型に変換した値。[Int64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
WITH toDateTime64('1970-01-01 00:20:34.567891011', 9, 'UTC') AS dt64
SELECT toUnixTimestamp64Nano(dt64);
```

結果：

```response
┌─toUnixTimestamp64Nano(dt64)─┐
│               1234567891011 │
└─────────────────────────────┘
```


## fromUnixTimestamp64Second

`Int64` を固定の秒精度と任意のタイムゾーンを持つ `DateTime64` 値に変換します。入力値は、その精度に応じて適切にスケールアップまたはスケールダウンされます。

:::note
入力値は、指定された（または暗黙の）タイムゾーンでのタイムスタンプではなく、UTC のタイムスタンプとして扱われる点に注意してください。
:::

**構文**

```sql
fromUnixTimestamp64Second(value[, timezone])
```

**引数**

* `value` — 任意の精度の値。[Int64](../data-types/int-uint.md)。
* `timezone` — （オプション）結果のタイムゾーン名。[String](../data-types/string.md)。

**返される値**

* `value` を精度 `0` の DateTime64 に変換した結果。[DateTime64](../data-types/datetime64.md)。

**例**

クエリ:

```sql
WITH CAST(1733935988, 'Int64') AS i64
SELECT
    fromUnixTimestamp64Second(i64, 'UTC') AS x,
    toTypeName(x);
```

結果:

```response
┌───────────────────x─┬─toTypeName(x)────────┐
│ 2024-12-11 16:53:08 │ DateTime64(0, 'UTC') │
└─────────────────────┴──────────────────────┘
```


## fromUnixTimestamp64Milli

`Int64` を、固定のミリ秒単位の精度と任意のタイムゾーンを持つ `DateTime64` 値に変換します。入力値は、その精度に応じて適切にスケーリング（拡大または縮小）されます。

:::note
入力値は、指定（または暗黙）のタイムゾーンでのタイムスタンプではなく、UTC のタイムスタンプとして扱われる点に注意してください。
:::

**構文**

```sql
fromUnixTimestamp64Milli(value[, timezone])
```

**引数**

* `value` — 任意精度の値。[Int64](../data-types/int-uint.md)。
* `timezone` — （省略可能）結果のタイムゾーン名。[String](../data-types/string.md)。

**戻り値**

* `value` を精度 `3` の DateTime64 に変換した値。[DateTime64](../data-types/datetime64.md)。

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


## fromUnixTimestamp64Micro

`Int64` を、マイクロ秒固定精度と任意のタイムゾーンを持つ `DateTime64` 値に変換します。入力値は、その精度に応じて適切にスケールアップまたはスケールダウンされます。

:::note
入力値は、指定された（または暗黙の）タイムゾーンでのタイムスタンプではなく、UTC タイムスタンプとして扱われる点に注意してください。
:::

**構文**

```sql
fromUnixTimestamp64Micro(value[, timezone])
```

**引数**

* `value` — 任意の精度を持つ値。[Int64 型](../data-types/int-uint.md)。
* `timezone` — （省略可能）結果のタイムゾーン名。[String 型](../data-types/string.md)。

**返される値**

* `value` を精度 `6` の DateTime64 に変換した値。[DateTime64 型](../data-types/datetime64.md)。

**例**

クエリ：

```sql
WITH CAST(1733935988123456, 'Int64') AS i64
SELECT
    fromUnixTimestamp64Micro(i64, 'UTC') AS x,
    toTypeName(x);
```

結果:

```response
┌──────────────────────────x─┬─toTypeName(x)────────┐
│ 2024-12-11 16:53:08.123456 │ DateTime64(6, 'UTC') │
└────────────────────────────┴──────────────────────┘
```


## fromUnixTimestamp64Nano

`Int64` をナノ秒精度の `DateTime64` 値に変換し、必要に応じてタイムゾーンを指定します。入力値は、その精度に応じて適切にスケールアップまたはスケールダウンされます。

:::note
入力値は、指定された（または暗黙の）タイムゾーンでのタイムスタンプではなく、UTC のタイムスタンプとして解釈される点に注意してください。
:::

**構文**

```sql
fromUnixTimestamp64Nano(value[, timezone])
```

**引数**

* `value` — 任意の精度の値。[Int64](../data-types/int-uint.md)。
* `timezone` — （オプション）結果のタイムゾーン名を指定する値。[String](../data-types/string.md)。

**返り値**

* `value` を精度 `9` の DateTime64 型に変換した値。[DateTime64](../data-types/datetime64.md)。

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


## formatRow

任意の式を、指定されたフォーマットに従って文字列に変換します。

**構文**

```sql
formatRow(format, x, y, ...)
```

**引数**

* `format` — テキスト形式。例: [CSV](/interfaces/formats/CSV)、[TabSeparated (TSV)](/interfaces/formats/TabSeparated)。
* `x`,`y`, ... — 式。

**返される値**

* フォーマットされた文字列（テキスト形式の場合は、通常末尾に改行文字が付きます）。

**例**

クエリ:

```sql
SELECT formatRow('CSV', number, 'good')
FROM numbers(3);
```

結果：

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

**注記**: フォーマットに接頭辞や接尾辞が含まれている場合、それぞれの行に付加されます。

**例**

クエリ:

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

注意: この関数では行ベースのフォーマットのみがサポートされています。


## formatRowNoNewline

任意の式を、与えられたフォーマットを使って文字列に変換します。`formatRow` との違いは、この関数は末尾にある `\n` があればそれを取り除く点です。

**構文**

```sql
formatRowNoNewline(format, x, y, ...)
```

**引数**

* `format` — テキストフォーマット。たとえば、[CSV](/interfaces/formats/CSV)、[TabSeparated (TSV)](/interfaces/formats/TabSeparated)。
* `x`,`y`, ... — 式。

**戻り値**

* フォーマット済み文字列。

**例**

クエリ：

```sql
SELECT formatRowNoNewline('CSV', number, 'good')
FROM numbers(3);
```

結果：

```response
┌─formatRowNoNewline('CSV', number, 'good')─┐
│ 0,"good"                                  │
│ 1,"good"                                  │
│ 2,"good"                                  │
└───────────────────────────────────────────┘
```

{/* 
  以下のタグ内の内容は、ドキュメントフレームワークのビルド時に
  system.functions から自動生成されたドキュメントに置き換えられます。タグを変更したり削除したりしないでください。
  詳細は https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md を参照してください。
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
