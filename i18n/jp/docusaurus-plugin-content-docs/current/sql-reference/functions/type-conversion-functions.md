---
description: '型変換関数に関するドキュメント'
sidebar_label: '型変換'
slug: /sql-reference/functions/type-conversion-functions
title: '型変換関数'
doc_type: 'reference'
---



# 型変換関数



## データ変換における一般的な問題 {#common-issues-with-data-conversion}

ClickHouseは通常、[C++プログラムと同じ動作](https://en.cppreference.com/w/cpp/language/implicit_conversion)を使用します。

`to<type>`関数と[cast](#cast)は、場合によって異なる動作をします。例えば[LowCardinality](../data-types/lowcardinality.md)の場合、[cast](#cast)は[LowCardinality](../data-types/lowcardinality.md)特性を削除しますが、`to<type>`関数は削除しません。[Nullable](../data-types/nullable.md)についても同様です。この動作はSQL標準と互換性がなく、[cast_keep_nullable](../../operations/settings/settings.md/#cast_keep_nullable)設定を使用して変更できます。

:::note
データ型の値がより小さいデータ型に変換される場合(例:`Int64`から`Int32`へ)、または互換性のないデータ型間で変換される場合(例:`String`から`Int`へ)、データ損失の可能性があることに注意してください。結果が期待通りであるかを慎重に確認してください。
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


## `toString`関数に関する注意事項 {#to-string-functions}

`toString`関数ファミリーは、数値、文字列(固定長文字列を除く)、日付、および日時の間の変換を可能にします。
これらの関数はすべて1つの引数を受け取ります。

- 文字列との間で変換する場合、値はTabSeparated形式(およびほぼすべての他のテキスト形式)と同じルールを使用してフォーマットまたは解析されます。文字列を解析できない場合は、例外がスローされ、リクエストがキャンセルされます。
- 日付を数値に変換する場合、またはその逆の場合、日付はUnixエポックの開始からの日数に対応します。
- 日時を数値に変換する場合、またはその逆の場合、日時はUnixエポックの開始からの秒数に対応します。
- `DateTime`引数の`toString`関数は、タイムゾーン名を含む2番目のString引数を取ることができます(例:`Europe/Amsterdam`)。この場合、時刻は指定されたタイムゾーンに従ってフォーマットされます。


## `toDate`/`toDateTime`関数に関する注意事項 {#to-date-and-date-time-functions}

`toDate`/`toDateTime`関数の日付および日時の形式は以下のように定義されています：

```response
YYYY-MM-DD
YYYY-MM-DD hh:mm:ss
```

例外として、UInt32、Int32、UInt64、またはInt64の数値型からDate型に変換する際、数値が65536以上の場合、その数値は（日数ではなく）Unixタイムスタンプとして解釈され、日付に丸められます。
これにより、`toDate(unix_timestamp)`という一般的な記述がサポートされます。この機能がなければエラーとなり、より煩雑な`toDate(toDateTime(unix_timestamp))`という記述が必要になります。

日付と日時の間の変換は自然な方法で実行されます：null時刻を追加するか、時刻を削除します。

数値型間の変換は、C++における異なる数値型間の代入と同じ規則を使用します。

**例**

クエリ：

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

[`toUnixTimestamp`](#toUnixTimestamp)関数も参照してください。


## toBool {#tobool}

入力値を[`Bool`](../data-types/boolean.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toBool(expr)
```

**引数**

- `expr` — 数値または文字列を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値。
- Float32/64型の値。
- 文字列`true`または`false`(大文字小文字を区別しません)。

**戻り値**

- 引数の評価に基づいて`true`または`false`を返します。[Bool](../data-types/boolean.md)。

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


## toInt8 {#toint8}

入力値を[`Int8`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toInt8(expr)
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

サポートされない引数:

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現(例: `SELECT toInt8('0xc0fe');`)。

:::note
入力値が[Int8](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
例: `SELECT toInt8(128) == -128;`。
:::

**戻り値**

- 8ビット整数値。[Int8](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
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

- [`toInt8OrZero`](#toint8orzero)。
- [`toInt8OrNull`](#toInt8OrNull)。
- [`toInt8OrDefault`](#toint8ordefault)。


## toInt8OrZero {#toint8orzero}

[`toInt8`](#toint8)と同様に、この関数は入力値を[Int8](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`0`を返します。

**構文**

```sql
toInt8OrZero(x)
```

**引数**

- `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256の文字列表現。

サポートされない引数(`0`を返す):

- `NaN`や`Inf`を含む通常のFloat32/64値の文字列表現。
- 2進数や16進数の文字列表現。例: `SELECT toInt8OrZero('0xc0fe');`。

:::note
入力値が[Int8](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返り値**

- 成功した場合は8ビット整数値、それ以外の場合は`0`。[Int8](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
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
Row 1:
──────
toInt8OrZero('-8'):  -8
toInt8OrZero('abc'): 0
```

**関連項目**

- [`toInt8`](#toint8)。
- [`toInt8OrNull`](#toInt8OrNull)。
- [`toInt8OrDefault`](#toint8ordefault)。


## toInt8OrNull {#toInt8OrNull}

[`toInt8`](#toint8)と同様に、この関数は入力値を[Int8](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`NULL`を返します。

**構文**

```sql
toInt8OrNull(x)
```

**引数**

- `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256の文字列表現。

サポートされない引数(`\N`を返す)

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- バイナリおよび16進数値の文字列表現(例: `SELECT toInt8OrNull('0xc0fe');`)。

:::note
入力値が[Int8](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は8ビット整数値、それ以外の場合は`NULL`。[Int8](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toInt8OrNull('-8'),
    toInt8OrNull('abc')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toInt8OrNull('-8'):  -8
toInt8OrNull('abc'): ᴺᵁᴸᴸ
```

**関連項目**

- [`toInt8`](#toint8)
- [`toInt8OrZero`](#toint8orzero)
- [`toInt8OrDefault`](#toint8ordefault)


## toInt8OrDefault {#toint8ordefault}

[`toInt8`](#toint8)と同様に、この関数は入力値を[Int8](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default`値が指定されていない場合、エラー時には`0`が返されます。

**構文**

```sql
toInt8OrDefault(expr[, default])
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
- `default` (オプション) — `Int8`型への解析が失敗した場合に返すデフォルト値。[Int8](../data-types/int-uint.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

デフォルト値が返される引数:

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現。例: `SELECT toInt8OrDefault('0xc0fe', CAST('-1', 'Int8'));`。

:::note
入力値が[Int8](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は8ビット整数値、それ以外の場合は指定されたデフォルト値、または指定されていない場合は`0`を返します。[Int8](../data-types/int-uint.md)。

:::note

- この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
- デフォルト値の型はキャスト型と同じである必要があります。
  :::

**例**

クエリ:

```sql
SELECT
    toInt8OrDefault('-8', CAST('-1', 'Int8')),
    toInt8OrDefault('abc', CAST('-1', 'Int8'))
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toInt8OrDefault('-8', CAST('-1', 'Int8')):  -8
toInt8OrDefault('abc', CAST('-1', 'Int8')): -1
```

**関連項目**

- [`toInt8`](#toint8)。
- [`toInt8OrZero`](#toint8orzero)。
- [`toInt8OrNull`](#toInt8OrNull)。


## toInt16 {#toint16}

入力値を[`Int16`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toInt16(expr)
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

サポートされない引数:

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現(例: `SELECT toInt16('0xc0fe');`)。

:::note
入力値が[Int16](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
例: `SELECT toInt16(32768) == -32768;`。
:::

**戻り値**

- 16ビット整数値。[Int16](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
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
Row 1:
──────
toInt16(-16):    -16
toInt16(-16.16): -16
toInt16('-16'):  -16
```

**関連項目**

- [`toInt16OrZero`](#toint16orzero)。
- [`toInt16OrNull`](#toint16ornull)。
- [`toInt16OrDefault`](#toint16ordefault)。


## toInt16OrZero {#toint16orzero}

[`toInt16`](#toint16)と同様に、この関数は入力値を[Int16](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`0`を返します。

**構文**

```sql
toInt16OrZero(x)
```

**引数**

- `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256の文字列表現。

サポートされない引数(`0`を返す):

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- バイナリおよび16進数値の文字列表現。例: `SELECT toInt16OrZero('0xc0fe');`

:::note
入力値が[Int16](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は16ビット整数値、それ以外の場合は`0`。[Int16](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
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

- [`toInt16`](#toint16)
- [`toInt16OrNull`](#toint16ornull)
- [`toInt16OrDefault`](#toint16ordefault)


## toInt16OrNull {#toint16ornull}

[`toInt16`](#toint16)と同様に、この関数は入力値を[Int16](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`NULL`を返します。

**構文**

```sql
toInt16OrNull(x)
```

**引数**

- `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256の文字列表現。

サポートされない引数(`\N`を返す)

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現。例: `SELECT toInt16OrNull('0xc0fe');`。

:::note
入力値が[Int16](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は16ビット整数値、それ以外の場合は`NULL`。[Int16](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toInt16OrNull('-16'),
    toInt16OrNull('abc')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toInt16OrNull('-16'): -16
toInt16OrNull('abc'): ᴺᵁᴸᴸ
```

**関連項目**

- [`toInt16`](#toint16)。
- [`toInt16OrZero`](#toint16orzero)。
- [`toInt16OrDefault`](#toint16ordefault)。


## toInt16OrDefault {#toint16ordefault}

[`toInt16`](#toint16)と同様に、この関数は入力値を[Int16](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default`値が指定されていない場合、エラー時には`0`が返されます。

**構文**

```sql
toInt16OrDefault(expr[, default])
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
- `default`(オプション) — `Int16`型への解析が失敗した場合に返すデフォルト値。[Int16](../data-types/int-uint.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

デフォルト値が返される引数:

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現。例: `SELECT toInt16OrDefault('0xc0fe', CAST('-1', 'Int16'));`

:::note
入力値が[Int16](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は16ビット整数値、それ以外の場合はデフォルト値が指定されていればそれを返し、指定されていなければ`0`を返します。[Int16](../data-types/int-uint.md)。

:::note

- この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
- デフォルト値の型はキャスト先の型と同じである必要があります。
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

- [`toInt16`](#toint16)
- [`toInt16OrZero`](#toint16orzero)
- [`toInt16OrNull`](#toint16ornull)


## toInt32 {#toint32}

入力値を[`Int32`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toInt32(expr)
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

サポートされない引数:

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現(例: `SELECT toInt32('0xc0fe');`)。

:::note
入力値が[Int32](../data-types/int-uint.md)の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
例: `SELECT toInt32(2147483648) == -2147483648;`
:::

**戻り値**

- 32ビット整数値。[Int32](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
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

結果:

```response
Row 1:
──────
toInt32(-32):    -32
toInt32(-32.32): -32
toInt32('-32'):  -32
```

**関連項目**

- [`toInt32OrZero`](#toint32orzero)。
- [`toInt32OrNull`](#toint32ornull)。
- [`toInt32OrDefault`](#toint32ordefault)。


## toInt32OrZero {#toint32orzero}

[`toInt32`](#toint32)と同様に、この関数は入力値を[Int32](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`0`を返します。

**構文**

```sql
toInt32OrZero(x)
```

**引数**

- `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256の文字列表現。

サポートされない引数(`0`を返す):

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- バイナリおよび16進数値の文字列表現(例: `SELECT toInt32OrZero('0xc0fe');`)。

:::note
入力値が[Int32](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は32ビット整数値、それ以外の場合は`0`。[Int32](../data-types/int-uint.md)

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
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
Row 1:
──────
toInt32OrZero('-32'): -32
toInt32OrZero('abc'): 0
```

**関連項目**

- [`toInt32`](#toint32)
- [`toInt32OrNull`](#toint32ornull)
- [`toInt32OrDefault`](#toint32ordefault)


## toInt32OrNull {#toint32ornull}

[`toInt32`](#toint32)と同様に、この関数は入力値を[Int32](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`NULL`を返します。

**構文**

```sql
toInt32OrNull(x)
```

**引数**

- `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256の文字列表現。

サポートされない引数(`\N`を返す)

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現(例: `SELECT toInt32OrNull('0xc0fe');`)。

:::note
入力値が[Int32](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は32ビット整数値、それ以外の場合は`NULL`。[Int32](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toInt32OrNull('-32'),
    toInt32OrNull('abc')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toInt32OrNull('-32'): -32
toInt32OrNull('abc'): ᴺᵁᴸᴸ
```

**関連項目**

- [`toInt32`](#toint32)
- [`toInt32OrZero`](#toint32orzero)
- [`toInt32OrDefault`](#toint32ordefault)


## toInt32OrDefault {#toint32ordefault}

[`toInt32`](#toint32)と同様に、この関数は入力値を[Int32](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default`値が指定されていない場合、エラー時には`0`が返されます。

**構文**

```sql
toInt32OrDefault(expr[, default])
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
- `default` (オプション) — `Int32`型への解析が失敗した場合に返すデフォルト値。[Int32](../data-types/int-uint.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

デフォルト値が返される引数:

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現。例: `SELECT toInt32OrDefault('0xc0fe', CAST('-1', 'Int32'));`。

:::note
入力値が[Int32](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は32ビット整数値、それ以外の場合はデフォルト値が指定されていればそれを返し、指定されていなければ`0`を返します。[Int32](../data-types/int-uint.md)。

:::note

- この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
- デフォルト値の型はキャスト先の型と同じである必要があります。
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

- [`toInt32`](#toint32)。
- [`toInt32OrZero`](#toint32orzero)。
- [`toInt32OrNull`](#toint32ornull)。


## toInt64 {#toint64}

入力値を[`Int64`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toInt64(expr)
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

サポートされない型:

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現(例: `SELECT toInt64('0xc0fe');`)。

:::note
入力値が[Int64](../data-types/int-uint.md)の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
例: `SELECT toInt64(9223372036854775808) == -9223372036854775808;`
:::

**戻り値**

- 64ビット整数値。[Int64](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
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

- [`toInt64OrZero`](#toint64orzero)。
- [`toInt64OrNull`](#toint64ornull)。
- [`toInt64OrDefault`](#toint64ordefault)。


## toInt64OrZero {#toint64orzero}

[`toInt64`](#toint64)と同様に、この関数は入力値を[Int64](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`0`を返します。

**構文**

```sql
toInt64OrZero(x)
```

**引数**

- `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256の文字列表現。

サポートされない引数(`0`を返す):

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- バイナリおよび16進数値の文字列表現(例: `SELECT toInt64OrZero('0xc0fe');`)。

:::note
入力値が[Int64](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は64ビット整数値、それ以外の場合は`0`。[Int64](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toInt64OrZero('-64'),
    toInt64OrZero('abc')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toInt64OrZero('-64'): -64
toInt64OrZero('abc'): 0
```

**関連項目**

- [`toInt64`](#toint64)
- [`toInt64OrNull`](#toint64ornull)
- [`toInt64OrDefault`](#toint64ordefault)


## toInt64OrNull {#toint64ornull}

[`toInt64`](#toint64)と同様に、この関数は入力値を[Int64](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`NULL`を返します。

**構文**

```sql
toInt64OrNull(x)
```

**引数**

- `x` — 数値の文字列表現。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256の文字列表現。

サポートされない引数(`\N`を返す)

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現。例: `SELECT toInt64OrNull('0xc0fe');`。

:::note
入力値が[Int64](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は64ビット整数値、それ以外の場合は`NULL`。[Int64](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
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

- [`toInt64`](#toint64)。
- [`toInt64OrZero`](#toint64orzero)。
- [`toInt64OrDefault`](#toint64ordefault)。


## toInt64OrDefault {#toint64ordefault}

[`toInt64`](#toint64)と同様に、この関数は入力値を[Int64](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default`値が指定されていない場合、エラー時には`0`が返されます。

**構文**

```sql
toInt64OrDefault(expr[, default])
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
- `default` (オプション) — `Int64`型への解析が失敗した場合に返すデフォルト値。[Int64](../data-types/int-uint.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

デフォルト値が返される引数:

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現。例: `SELECT toInt64OrDefault('0xc0fe', CAST('-1', 'Int64'));`。

:::note
入力値が[Int64](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は64ビット整数値、それ以外の場合は指定されたデフォルト値、または指定されていない場合は`0`を返します。[Int64](../data-types/int-uint.md)。

:::note

- この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
- デフォルト値の型はキャスト型と同じである必要があります。
  :::

**例**

クエリ:

```sql
SELECT
    toInt64OrDefault('-64', CAST('-1', 'Int64')),
    toInt64OrDefault('abc', CAST('-1', 'Int64'))
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toInt64OrDefault('-64', CAST('-1', 'Int64')): -64
toInt64OrDefault('abc', CAST('-1', 'Int64')): -1
```

**関連項目**

- [`toInt64`](#toint64)。
- [`toInt64OrZero`](#toint64orzero)。
- [`toInt64OrNull`](#toint64ornull)。


## toInt128 {#toint128}

入力値を[`Int128`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toInt128(expr)
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

サポートされない引数:

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現(例: `SELECT toInt128('0xc0fe');`)。

:::note
入力値が[Int128](../data-types/int-uint.md)の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**戻り値**

- 128ビット整数値。[Int128](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
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
Row 1:
──────
toInt128(-128):   -128
toInt128(-128.8): -128
toInt128('-128'): -128
```

**関連項目**

- [`toInt128OrZero`](#toint128orzero)。
- [`toInt128OrNull`](#toint128ornull)。
- [`toInt128OrDefault`](#toint128ordefault)。


## toInt128OrZero {#toint128orzero}

[`toInt128`](#toint128)と同様に、この関数は入力値を[Int128](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`0`を返します。

**構文**

```sql
toInt128OrZero(expr)
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256の文字列表現。

サポートされない引数(`0`を返す):

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- バイナリおよび16進数値の文字列表現。例: `SELECT toInt128OrZero('0xc0fe');`。

:::note
入力値が[Int128](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は128ビット整数値、それ以外の場合は`0`。[Int128](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toInt128OrZero('-128'),
    toInt128OrZero('abc')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toInt128OrZero('-128'): -128
toInt128OrZero('abc'):  0
```

**関連項目**

- [`toInt128`](#toint128)。
- [`toInt128OrNull`](#toint128ornull)。
- [`toInt128OrDefault`](#toint128ordefault)。


## toInt128OrNull {#toint128ornull}

[`toInt128`](#toint128)と同様に、この関数は入力値を[Int128](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`NULL`を返します。

**構文**

```sql
toInt128OrNull(x)
```

**引数**

- `x` — 数値の文字列表現。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256の文字列表現。

サポートされない引数(`\N`を返す)

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現。例: `SELECT toInt128OrNull('0xc0fe');`。

:::note
入力値が[Int128](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は128ビット整数値、それ以外の場合は`NULL`。[Int128](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
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

- [`toInt128`](#toint128)。
- [`toInt128OrZero`](#toint128orzero)。
- [`toInt128OrDefault`](#toint128ordefault)。


## toInt128OrDefault {#toint128ordefault}

[`toInt128`](#toint128)と同様に、この関数は入力値を[Int128](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default`値が指定されていない場合、エラー時には`0`が返されます。

**構文**

```sql
toInt128OrDefault(expr[, default])
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
- `default` (オプション) — `Int128`型への解析が失敗した場合に返すデフォルト値。[Int128](../data-types/int-uint.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256。
- Float32/64。
- (U)Int8/16/32/128/256の文字列表現。

デフォルト値が返される引数:

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現。例: `SELECT toInt128OrDefault('0xc0fe', CAST('-1', 'Int128'));`。

:::note
入力値が[Int128](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は128ビット整数値、それ以外の場合は指定されたデフォルト値、または指定されていない場合は`0`を返します。[Int128](../data-types/int-uint.md)。

:::note

- この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
- デフォルト値の型はキャスト型と同じである必要があります。
  :::

**例**

クエリ:

```sql
SELECT
    toInt128OrDefault('-128', CAST('-1', 'Int128')),
    toInt128OrDefault('abc', CAST('-1', 'Int128'))
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toInt128OrDefault('-128', CAST('-1', 'Int128')): -128
toInt128OrDefault('abc', CAST('-1', 'Int128')):  -1
```

**関連項目**

- [`toInt128`](#toint128)。
- [`toInt128OrZero`](#toint128orzero)。
- [`toInt128OrNull`](#toint128ornull)。


## toInt256 {#toint256}

入力値を[`Int256`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toInt256(expr)
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

サポートされない引数:

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現(例: `SELECT toInt256('0xc0fe');`)。

:::note
入力値が[Int256](../data-types/int-uint.md)の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**戻り値**

- 256ビット整数値。[Int256](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
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

- [`toInt256OrZero`](#toint256orzero)。
- [`toInt256OrNull`](#toint256ornull)。
- [`toInt256OrDefault`](#toint256ordefault)。


## toInt256OrZero {#toint256orzero}

[`toInt256`](#toint256)と同様に、この関数は入力値を[Int256](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`0`を返します。

**構文**

```sql
toInt256OrZero(x)
```

**引数**

- `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256の文字列表現。

サポートされない引数(`0`を返す):

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- バイナリおよび16進数値の文字列表現。例: `SELECT toInt256OrZero('0xc0fe');`。

:::note
入力値が[Int256](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は256ビット整数値、それ以外の場合は`0`。[Int256](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
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

- [`toInt256`](#toint256)。
- [`toInt256OrNull`](#toint256ornull)。
- [`toInt256OrDefault`](#toint256ordefault)。


## toInt256OrNull {#toint256ornull}

[`toInt256`](#toint256)と同様に、この関数は入力値を[Int256](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`NULL`を返します。

**構文**

```sql
toInt256OrNull(x)
```

**引数**

- `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256の文字列表現。

サポートされない引数(`\N`を返す)

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現(例: `SELECT toInt256OrNull('0xc0fe');`)。

:::note
入力値が[Int256](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は256ビット整数値、それ以外の場合は`NULL`。[Int256](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toInt256OrNull('-256'),
    toInt256OrNull('abc')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toInt256OrNull('-256'): -256
toInt256OrNull('abc'):  ᴺᵁᴸᴸ
```

**関連項目**

- [`toInt256`](#toint256)
- [`toInt256OrZero`](#toint256orzero)
- [`toInt256OrDefault`](#toint256ordefault)


## toInt256OrDefault {#toint256ordefault}

[`toInt256`](#toint256)と同様に、この関数は入力値を[Int256](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default`値が指定されていない場合、エラー時には`0`が返されます。

**構文**

```sql
toInt256OrDefault(expr[, default])
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
- `default`(オプション) — `Int256`型への解析が失敗した場合に返すデフォルト値。[Int256](../data-types/int-uint.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

デフォルト値が返される引数:

- `NaN`および`Inf`を含むFloat32/64値の文字列表現
- 2進数および16進数値の文字列表現、例: `SELECT toInt256OrDefault('0xc0fe', CAST('-1', 'Int256'));`

:::note
入力値が[Int256](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は256ビット整数値、それ以外の場合は指定されたデフォルト値、または指定されていない場合は`0`を返します。[Int256](../data-types/int-uint.md)。

:::note

- この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
- デフォルト値の型はキャスト型と同じである必要があります。
  :::

**例**

クエリ:

```sql
SELECT
    toInt256OrDefault('-256', CAST('-1', 'Int256')),
    toInt256OrDefault('abc', CAST('-1', 'Int256'))
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toInt256OrDefault('-256', CAST('-1', 'Int256')): -256
toInt256OrDefault('abc', CAST('-1', 'Int256')):  -1
```

**関連項目**

- [`toInt256`](#toint256)。
- [`toInt256OrZero`](#toint256orzero)。
- [`toInt256OrNull`](#toint256ornull)。


## toUInt8 {#touint8}

入力値を[`UInt8`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toUInt8(expr)
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

サポートされない引数:

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- バイナリ値および16進数値の文字列表現。例: `SELECT toUInt8('0xc0fe');`。

:::note
入力値が[UInt8](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
例: `SELECT toUInt8(256) == 0;`。
:::

**戻り値**

- 8ビット符号なし整数値。[UInt8](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
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

- [`toUInt8OrZero`](#touint8orzero)。
- [`toUInt8OrNull`](#touint8ornull)。
- [`toUInt8OrDefault`](#touint8ordefault)。


## toUInt8OrZero {#touint8orzero}

[`toUInt8`](#touint8)と同様に、この関数は入力値を[UInt8](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`0`を返します。

**構文**

```sql
toUInt8OrZero(x)
```

**引数**

- `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256の文字列表現。

サポートされない引数(`0`を返す):

- `NaN`や`Inf`を含む通常のFloat32/64値の文字列表現。
- 2進数や16進数の文字列表現。例: `SELECT toUInt8OrZero('0xc0fe');`。

:::note
入力値が[UInt8](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は8ビット符号なし整数値、それ以外の場合は`0`。[UInt8](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
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
Row 1:
──────
toUInt8OrZero('-8'):  0
toUInt8OrZero('abc'): 0
```

**関連項目**

- [`toUInt8`](#touint8)。
- [`toUInt8OrNull`](#touint8ornull)。
- [`toUInt8OrDefault`](#touint8ordefault)。


## toUInt8OrNull {#touint8ornull}

[`toUInt8`](#touint8)と同様に、この関数は入力値を[UInt8](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`NULL`を返します。

**構文**

```sql
toUInt8OrNull(x)
```

**引数**

- `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256の文字列表現。

サポートされない引数(`\N`を返す)

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現(例: `SELECT toUInt8OrNull('0xc0fe');`)。

:::note
入力値が[UInt8](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は8ビット符号なし整数値、それ以外の場合は`NULL`。[UInt8](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toUInt8OrNull('8'),
    toUInt8OrNull('abc')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toUInt8OrNull('8'):   8
toUInt8OrNull('abc'): ᴺᵁᴸᴸ
```

**関連項目**

- [`toUInt8`](#touint8)
- [`toUInt8OrZero`](#touint8orzero)
- [`toUInt8OrDefault`](#touint8ordefault)


## toUInt8OrDefault {#touint8ordefault}

[`toUInt8`](#touint8)と同様に、この関数は入力値を[UInt8](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default`値が指定されていない場合、エラー時には`0`が返されます。

**構文**

```sql
toUInt8OrDefault(expr[, default])
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
- `default`(オプション) — `UInt8`型への変換が失敗した場合に返すデフォルト値。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

デフォルト値が返される引数:

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現。例: `SELECT toUInt8OrDefault('0xc0fe', CAST('0', 'UInt8'));`。

:::note
入力値が[UInt8](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は8ビット符号なし整数値、それ以外の場合はデフォルト値が指定されていればその値を返し、指定されていなければ`0`を返します。[UInt8](../data-types/int-uint.md)。

:::note

- この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
- デフォルト値の型は変換先の型と同じである必要があります。
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

- [`toUInt8`](#touint8)。
- [`toUInt8OrZero`](#touint8orzero)。
- [`toUInt8OrNull`](#touint8ornull)。


## toUInt16 {#touint16}

入力値を[`UInt16`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toUInt16(expr)
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

サポートされない引数:

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- バイナリ値および16進数値の文字列表現(例: `SELECT toUInt16('0xc0fe');`)。

:::note
入力値が[UInt16](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
例: `SELECT toUInt16(65536) == 0;`。
:::

**戻り値**

- 16ビット符号なし整数値。[UInt16](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
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

- [`toUInt16OrZero`](#touint16orzero)。
- [`toUInt16OrNull`](#touint16ornull)。
- [`toUInt16OrDefault`](#touint16ordefault)。


## toUInt16OrZero {#touint16orzero}

[`toUInt16`](#touint16)と同様に、この関数は入力値を[UInt16](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`0`を返します。

**構文**

```sql
toUInt16OrZero(x)
```

**引数**

- `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256の文字列表現。

サポートされない引数(`0`を返す):

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- バイナリおよび16進数値の文字列表現(例: `SELECT toUInt16OrZero('0xc0fe');`)。

:::note
入力値が[UInt16](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は16ビット符号なし整数値、それ以外の場合は`0`。[UInt16](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toUInt16OrZero('16'),
    toUInt16OrZero('abc')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toUInt16OrZero('16'):  16
toUInt16OrZero('abc'): 0
```

**関連項目**

- [`toUInt16`](#touint16)
- [`toUInt16OrNull`](#touint16ornull)
- [`toUInt16OrDefault`](#touint16ordefault)


## toUInt16OrNull {#touint16ornull}

[`toUInt16`](#touint16)と同様に、この関数は入力値を[UInt16](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`NULL`を返します。

**構文**

```sql
toUInt16OrNull(x)
```

**引数**

- `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256の文字列表現。

サポートされない引数（`\N`を返す）

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現。例: `SELECT toUInt16OrNull('0xc0fe');`

:::note
入力値が[UInt16](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は16ビット符号なし整数値、それ以外の場合は`NULL`。[UInt16](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
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

**関連項目**

- [`toUInt16`](#touint16)
- [`toUInt16OrZero`](#touint16orzero)
- [`toUInt16OrDefault`](#touint16ordefault)


## toUInt16OrDefault {#touint16ordefault}

[`toUInt16`](#touint16)と同様に、この関数は入力値を[UInt16](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default`値が指定されていない場合、エラー時には`0`が返されます。

**構文**

```sql
toUInt16OrDefault(expr[, default])
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
- `default`(オプション) — `UInt16`型への変換が失敗した場合に返すデフォルト値。[UInt16](../data-types/int-uint.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

デフォルト値が返される引数:

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現。例: `SELECT toUInt16OrDefault('0xc0fe', CAST('0', 'UInt16'));`。

:::note
入力値が[UInt16](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は16ビット符号なし整数値、それ以外の場合はデフォルト値が指定されていればその値を返し、指定されていなければ`0`を返します。[UInt16](../data-types/int-uint.md)。

:::note

- この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
- デフォルト値の型はキャスト先の型と同じである必要があります。
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

- [`toUInt16`](#touint16)。
- [`toUInt16OrZero`](#touint16orzero)。
- [`toUInt16OrNull`](#touint16ornull)。


## toUInt32 {#touint32}

入力値を[`UInt32`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toUInt32(expr)
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

サポートされない引数:

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- バイナリ値および16進数値の文字列表現。例: `SELECT toUInt32('0xc0fe');`

:::note
入力値が[UInt32](../data-types/int-uint.md)の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
例: `SELECT toUInt32(4294967296) == 0;`
:::

**戻り値**

- 32ビット符号なし整数値。[UInt32](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
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

結果:

```response
Row 1:
──────
toUInt32(32):    32
toUInt32(32.32): 32
toUInt32('32'):  32
```

**関連項目**

- [`toUInt32OrZero`](#touint32orzero)。
- [`toUInt32OrNull`](#touint32ornull)。
- [`toUInt32OrDefault`](#touint32ordefault)。


## toUInt32OrZero {#touint32orzero}

[`toUInt32`](#touint32)と同様に、この関数は入力値を[UInt32](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`0`を返します。

**構文**

```sql
toUInt32OrZero(x)
```

**引数**

- `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256の文字列表現。

サポートされない引数(`0`を返す):

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- バイナリおよび16進数値の文字列表現(例: `SELECT toUInt32OrZero('0xc0fe');`)。

:::note
入力値が[UInt32](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は32ビット符号なし整数値、それ以外の場合は`0`。[UInt32](../data-types/int-uint.md)

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。
つまり、数値の小数部分を切り捨てます。
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
Row 1:
──────
toUInt32OrZero('32'):  32
toUInt32OrZero('abc'): 0
```

**関連項目**

- [`toUInt32`](#touint32)
- [`toUInt32OrNull`](#touint32ornull)
- [`toUInt32OrDefault`](#touint32ordefault)


## toUInt32OrNull {#touint32ornull}

[`toUInt32`](#touint32)と同様に、この関数は入力値を[UInt32](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`NULL`を返します。

**構文**

```sql
toUInt32OrNull(x)
```

**引数**

- `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256の文字列表現。

サポートされない引数(`\N`を返す)

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現(例: `SELECT toUInt32OrNull('0xc0fe');`)。

:::note
入力値が[UInt32](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は32ビット符号なし整数値、それ以外の場合は`NULL`。[UInt32](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。
つまり、数値の小数部分を切り捨てます。
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

- [`toUInt32`](#touint32)
- [`toUInt32OrZero`](#touint32orzero)
- [`toUInt32OrDefault`](#touint32ordefault)


## toUInt32OrDefault {#touint32ordefault}

[`toUInt32`](#touint32)と同様に、この関数は入力値を[UInt32](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default`値が指定されていない場合、エラー時には`0`が返されます。

**構文**

```sql
toUInt32OrDefault(expr[, default])
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
- `default`(オプション) — `UInt32`型への変換が失敗した場合に返すデフォルト値。[UInt32](../data-types/int-uint.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

デフォルト値が返される引数:

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現。例: `SELECT toUInt32OrDefault('0xc0fe', CAST('0', 'UInt32'));`。

:::note
入力値が[UInt32](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は32ビット符号なし整数値、それ以外の場合はデフォルト値が指定されていればその値を返し、指定されていなければ`0`を返します。[UInt32](../data-types/int-uint.md)。

:::note

- この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
- デフォルト値の型はキャスト先の型と同じである必要があります。
  :::

**例**

クエリ:

```sql
SELECT
    toUInt32OrDefault('32', CAST('0', 'UInt32')),
    toUInt32OrDefault('abc', CAST('0', 'UInt32'))
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toUInt32OrDefault('32', CAST('0', 'UInt32')):  32
toUInt32OrDefault('abc', CAST('0', 'UInt32')): 0
```

**関連項目**

- [`toUInt32`](#touint32)。
- [`toUInt32OrZero`](#touint32orzero)。
- [`toUInt32OrNull`](#touint32ornull)。


## toUInt64 {#touint64}

入力値を[`UInt64`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toUInt64(expr)
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

サポートされない型:

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- バイナリおよび16進数値の文字列表現(例: `SELECT toUInt64('0xc0fe');`)。

:::note
入力値が[UInt64](../data-types/int-uint.md)の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
例: `SELECT toUInt64(18446744073709551616) == 0;`
:::

**返される値**

- 64ビット符号なし整数値。[UInt64](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
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

- [`toUInt64OrZero`](#touint64orzero)。
- [`toUInt64OrNull`](#touint64ornull)。
- [`toUInt64OrDefault`](#touint64ordefault)。


## toUInt64OrZero {#touint64orzero}

[`toUInt64`](#touint64)と同様に、この関数は入力値を[UInt64](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`0`を返します。

**構文**

```sql
toUInt64OrZero(x)
```

**引数**

- `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256の文字列表現。

サポートされない引数(`0`を返す):

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現(例: `SELECT toUInt64OrZero('0xc0fe');`)。

:::note
入力値が[UInt64](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は64ビット符号なし整数値、それ以外の場合は`0`。[UInt64](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
:::

**例**

クエリ:

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

- [`toUInt64`](#touint64)
- [`toUInt64OrNull`](#touint64ornull)
- [`toUInt64OrDefault`](#touint64ordefault)


## toUInt64OrNull {#touint64ornull}

[`toUInt64`](#touint64)と同様に、この関数は入力値を[UInt64](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`NULL`を返します。

**構文**

```sql
toUInt64OrNull(x)
```

**引数**

- `x` — 数値の文字列表現。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256の文字列表現。

サポートされない引数（`\N`を返す）

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現。例: `SELECT toUInt64OrNull('0xc0fe');`。

:::note
入力値が[UInt64](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は64ビット符号なし整数値、それ以外の場合は`NULL`。[UInt64](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
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

- [`toUInt64`](#touint64).
- [`toUInt64OrZero`](#touint64orzero).
- [`toUInt64OrDefault`](#touint64ordefault).


## toUInt64OrDefault {#touint64ordefault}

[`toUInt64`](#touint64)と同様に、この関数は入力値を[UInt64](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default`値が指定されていない場合、エラー時には`0`が返されます。

**構文**

```sql
toUInt64OrDefault(expr[, default])
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
- `default` (オプション) — `UInt64`型への解析が失敗した場合に返すデフォルト値。[UInt64](../data-types/int-uint.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

デフォルト値が返される引数:

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現。例: `SELECT toUInt64OrDefault('0xc0fe', CAST('0', 'UInt64'));`。

:::note
入力値が[UInt64](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は64ビット符号なし整数値、それ以外の場合は指定されたデフォルト値、または指定されていない場合は`0`を返します。[UInt64](../data-types/int-uint.md)。

:::note

- この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
- デフォルト値の型はキャスト型と同じである必要があります。
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

- [`toUInt64`](#touint64)。
- [`toUInt64OrZero`](#touint64orzero)。
- [`toUInt64OrNull`](#touint64ornull)。


## toUInt128 {#touint128}

入力値を[`UInt128`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toUInt128(expr)
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

サポートされない引数:

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現(例: `SELECT toUInt128('0xc0fe');`)。

:::note
入力値が[UInt128](../data-types/int-uint.md)の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**返される値**

- 128ビット符号なし整数値。[UInt128](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
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
Row 1:
──────
toUInt128(128):   128
toUInt128(128.8): 128
toUInt128('128'): 128
```

**関連項目**

- [`toUInt128OrZero`](#touint128orzero)。
- [`toUInt128OrNull`](#touint128ornull)。
- [`toUInt128OrDefault`](#touint128ordefault)。


## toUInt128OrZero {#touint128orzero}

[`toUInt128`](#touint128)と同様に、この関数は入力値を[UInt128](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`0`を返します。

**構文**

```sql
toUInt128OrZero(expr)
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256の文字列表現。

サポートされない引数(`0`を返す):

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- バイナリおよび16進数値の文字列表現。例: `SELECT toUInt128OrZero('0xc0fe');`。

:::note
入力値が[UInt128](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は128ビット符号なし整数値、それ以外の場合は`0`。[UInt128](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toUInt128OrZero('128'),
    toUInt128OrZero('abc')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toUInt128OrZero('128'): 128
toUInt128OrZero('abc'): 0
```

**関連項目**

- [`toUInt128`](#touint128)。
- [`toUInt128OrNull`](#touint128ornull)。
- [`toUInt128OrDefault`](#touint128ordefault)。


## toUInt128OrNull {#touint128ornull}

[`toUInt128`](#touint128)と同様に、この関数は入力値を[UInt128](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`NULL`を返します。

**構文**

```sql
toUInt128OrNull(x)
```

**引数**

- `x` — 数値の文字列表現。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256の文字列表現。

サポートされない引数（`\N`を返す）

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現。例: `SELECT toUInt128OrNull('0xc0fe');`。

:::note
入力値が[UInt128](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は128ビット符号なし整数値、それ以外の場合は`NULL`。[UInt128](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toUInt128OrNull('128'),
    toUInt128OrNull('abc')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toUInt128OrNull('128'): 128
toUInt128OrNull('abc'): ᴺᵁᴸᴸ
```

**関連項目**

- [`toUInt128`](#touint128)。
- [`toUInt128OrZero`](#touint128orzero)。
- [`toUInt128OrDefault`](#touint128ordefault)。


## toUInt128OrDefault {#touint128ordefault}

[`toUInt128`](#toint128)と同様に、この関数は入力値を[UInt128](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default`値が指定されていない場合、エラー時には`0`が返されます。

**構文**

```sql
toUInt128OrDefault(expr[, default])
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
- `default`(オプション) — `UInt128`型への解析が失敗した場合に返すデフォルト値。[UInt128](../data-types/int-uint.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256。
- Float32/64。
- (U)Int8/16/32/128/256の文字列表現。

デフォルト値が返される引数:

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現。例: `SELECT toUInt128OrDefault('0xc0fe', CAST('0', 'UInt128'));`。

:::note
入力値が[UInt128](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は128ビット符号なし整数値、それ以外の場合は指定されたデフォルト値、または指定されていない場合は`0`を返します。[UInt128](../data-types/int-uint.md)。

:::note

- この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
- デフォルト値の型はキャスト型と同じである必要があります。
  :::

**例**

クエリ:

```sql
SELECT
    toUInt128OrDefault('128', CAST('0', 'UInt128')),
    toUInt128OrDefault('abc', CAST('0', 'UInt128'))
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toUInt128OrDefault('128', CAST('0', 'UInt128')): 128
toUInt128OrDefault('abc', CAST('0', 'UInt128')): 0
```

**関連項目**

- [`toUInt128`](#touint128)。
- [`toUInt128OrZero`](#touint128orzero)。
- [`toUInt128OrNull`](#touint128ornull)。


## toUInt256 {#touint256}

入力値を[`UInt256`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toUInt256(expr)
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

サポートされない引数:

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- バイナリ値および16進数値の文字列表現(例: `SELECT toUInt256('0xc0fe');`)。

:::note
入力値が[UInt256](../data-types/int-uint.md)の範囲内で表現できない場合、結果はオーバーフローまたはアンダーフローします。
これはエラーとは見なされません。
:::

**戻り値**

- 256ビット符号なし整数値。[UInt256](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
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

結果:

```response
Row 1:
──────
toUInt256(256):     256
toUInt256(256.256): 256
toUInt256('256'):   256
```

**関連項目**

- [`toUInt256OrZero`](#touint256orzero)。
- [`toUInt256OrNull`](#touint256ornull)。
- [`toUInt256OrDefault`](#touint256ordefault)。


## toUInt256OrZero {#touint256orzero}

[`toUInt256`](#touint256)と同様に、この関数は入力値を[UInt256](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`0`を返します。

**構文**

```sql
toUInt256OrZero(x)
```

**引数**

- `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256の文字列表現。

サポートされない引数(`0`を返す):

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現。例: `SELECT toUInt256OrZero('0xc0fe');`。

:::note
入力値が[UInt256](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は256ビット符号なし整数値、それ以外の場合は`0`。[UInt256](../data-types/int-uint.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
:::

**例**

クエリ:

```sql
SELECT
    toUInt256OrZero('256'),
    toUInt256OrZero('abc')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toUInt256OrZero('256'): 256
toUInt256OrZero('abc'): 0
```

**関連項目**

- [`toUInt256`](#touint256)。
- [`toUInt256OrNull`](#touint256ornull)。
- [`toUInt256OrDefault`](#touint256ordefault)。


## toUInt256OrNull {#touint256ornull}

[`toUInt256`](#touint256)と同様に、この関数は入力値を[UInt256](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`NULL`を返します。

**構文**

```sql
toUInt256OrNull(x)
```

**引数**

- `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256の文字列表現。

サポートされない引数（`\N`を返す）

- `NaN`および`Inf`を含むFloat32/64値の文字列表現。
- 2進数および16進数値の文字列表現。例: `SELECT toUInt256OrNull('0xc0fe');`。

:::note
入力値が[UInt256](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は256ビット符号なし整数値、それ以外の場合は`NULL`。[UInt256](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
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

- [`toUInt256`](#touint256)。
- [`toUInt256OrZero`](#touint256orzero)。
- [`toUInt256OrDefault`](#touint256ordefault)。


## toUInt256OrDefault {#touint256ordefault}

[`toUInt256`](#touint256)と同様に、この関数は入力値を[UInt256](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default`値が指定されていない場合、エラー時には`0`が返されます。

**構文**

```sql
toUInt256OrDefault(expr[, default])
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
- `default`(オプション) — `UInt256`型への変換が失敗した場合に返すデフォルト値。[UInt256](../data-types/int-uint.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

デフォルト値が返される引数:

- `NaN`および`Inf`を含むFloat32/64値の文字列表現
- 2進数および16進数値の文字列表現、例: `SELECT toUInt256OrDefault('0xc0fe', CAST('0', 'UInt256'));`

:::note
入力値が[UInt256](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**戻り値**

- 成功した場合は256ビット符号なし整数値、それ以外の場合は指定されたデフォルト値、または指定されていない場合は`0`を返します。[UInt256](../data-types/int-uint.md)。

:::note

- この関数は[ゼロ方向への丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用します。つまり、数値の小数部分を切り捨てます。
- デフォルト値の型はキャスト先の型と同じである必要があります。
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

- [`toUInt256`](#touint256)。
- [`toUInt256OrZero`](#touint256orzero)。
- [`toUInt256OrNull`](#touint256ornull)。


## toFloat32 {#tofloat32}

入力値を[`Float32`](../data-types/float.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toFloat32(expr)
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値。
- (U)Int8/16/32/128/256の文字列表現。
- `NaN`および`Inf`を含むFloat32/64型の値。
- `NaN`および`Inf`を含むFloat32/64の文字列表現(大文字小文字を区別しない)。

サポートされない引数:

- 二進数および十六進数の文字列表現。例: `SELECT toFloat32('0xc0fe');`。

**戻り値**

- 32ビット浮動小数点値。[Float32](../data-types/float.md)。

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

- [`toFloat32OrZero`](#tofloat32orzero)。
- [`toFloat32OrNull`](#tofloat32ornull)。
- [`toFloat32OrDefault`](#tofloat32ordefault)。


## toFloat32OrZero {#tofloat32orzero}

[`toFloat32`](#tofloat32)と同様に、この関数は入力値を[Float32](../data-types/float.md)型の値に変換しますが、エラーが発生した場合は`0`を返します。

**構文**

```sql
toFloat32OrZero(x)
```

**引数**

- `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256、Float32/64の文字列表現。

サポートされない引数(`0`を返す):

- 2進数および16進数値の文字列表現。例: `SELECT toFloat32OrZero('0xc0fe');`

**戻り値**

- 成功した場合は32ビットFloat値、それ以外の場合は`0`。[Float32](../data-types/float.md)。

**例**

クエリ:

```sql
SELECT
    toFloat32OrZero('42.7'),
    toFloat32OrZero('abc')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toFloat32OrZero('42.7'): 42.7
toFloat32OrZero('abc'):  0
```

**関連項目**

- [`toFloat32`](#tofloat32)。
- [`toFloat32OrNull`](#tofloat32ornull)。
- [`toFloat32OrDefault`](#tofloat32ordefault)。


## toFloat32OrNull {#tofloat32ornull}

[`toFloat32`](#tofloat32)と同様に、この関数は入力値を[Float32](../data-types/float.md)型の値に変換しますが、エラーが発生した場合は`NULL`を返します。

**構文**

```sql
toFloat32OrNull(x)
```

**引数**

- `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256、Float32/64の文字列表現。

サポートされない引数(`\N`を返す):

- 2進数および16進数値の文字列表現。例: `SELECT toFloat32OrNull('0xc0fe');`

**返される値**

- 成功した場合は32ビットFloat値、それ以外の場合は`\N`。[Float32](../data-types/float.md)。

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

- [`toFloat32`](#tofloat32)
- [`toFloat32OrZero`](#tofloat32orzero)
- [`toFloat32OrDefault`](#tofloat32ordefault)


## toFloat32OrDefault {#tofloat32ordefault}

[`toFloat32`](#tofloat32)と同様に、この関数は入力値を[Float32](../data-types/float.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default`値が指定されていない場合、エラー時には`0`が返されます。

**構文**

```sql
toFloat32OrDefault(expr[, default])
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
- `default`(オプション) — `Float32`型への解析が失敗した場合に返すデフォルト値。[Float32](../data-types/float.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値。
- (U)Int8/16/32/128/256の文字列表現。
- `NaN`および`Inf`を含むFloat32/64型の値。
- `NaN`および`Inf`を含むFloat32/64の文字列表現(大文字小文字を区別しない)。

デフォルト値が返される引数:

- 2進数および16進数の文字列表現。例: `SELECT toFloat32OrDefault('0xc0fe', CAST('0', 'Float32'));`。

**返される値**

- 成功した場合は32ビットFloat値、それ以外の場合は指定されたデフォルト値、または指定されていない場合は`0`を返します。[Float32](../data-types/float.md)。

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
Row 1:
──────
toFloat32OrDefault('8', CAST('0', 'Float32')):   8
toFloat32OrDefault('abc', CAST('0', 'Float32')): 0
```

**関連項目**

- [`toFloat32`](#tofloat32)。
- [`toFloat32OrZero`](#tofloat32orzero)。
- [`toFloat32OrNull`](#tofloat32ornull)。


## toFloat64 {#tofloat64}

入力値を[`Float64`](../data-types/float.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toFloat64(expr)
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値。
- (U)Int8/16/32/128/256の文字列表現。
- `NaN`および`Inf`を含むFloat32/64型の値。
- `NaN`および`Inf`を含むFloat32/64型の文字列表現(大文字小文字を区別しない)。

サポートされない引数:

- 二進数および十六進数の文字列表現。例: `SELECT toFloat64('0xc0fe');`。

**戻り値**

- 64ビット浮動小数点値。[Float64](../data-types/float.md)。

**例**

クエリ:

```sql
SELECT
    toFloat64(42.7),
    toFloat64('42.7'),
    toFloat64('NaN')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toFloat64(42.7):   42.7
toFloat64('42.7'): 42.7
toFloat64('NaN'):  nan
```

**関連項目**

- [`toFloat64OrZero`](#tofloat64orzero)。
- [`toFloat64OrNull`](#tofloat64ornull)。
- [`toFloat64OrDefault`](#tofloat64ordefault)。


## toFloat64OrZero {#tofloat64orzero}

[`toFloat64`](#tofloat64)と同様に、この関数は入力値を[Float64](../data-types/float.md)型の値に変換しますが、エラーが発生した場合は`0`を返します。

**構文**

```sql
toFloat64OrZero(x)
```

**引数**

- `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256、Float32/64の文字列表現。

サポートされない引数(`0`を返す):

- 2進数および16進数値の文字列表現。例: `SELECT toFloat64OrZero('0xc0fe');`

**返される値**

- 成功した場合は64ビットFloat値、それ以外の場合は`0`。[Float64](../data-types/float.md)。

**例**

クエリ:

```sql
SELECT
    toFloat64OrZero('42.7'),
    toFloat64OrZero('abc')
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
toFloat64OrZero('42.7'): 42.7
toFloat64OrZero('abc'):  0
```

**関連項目**

- [`toFloat64`](#tofloat64)
- [`toFloat64OrNull`](#tofloat64ornull)
- [`toFloat64OrDefault`](#tofloat64ordefault)


## toFloat64OrNull {#tofloat64ornull}

[`toFloat64`](#tofloat64)と同様に、この関数は入力値を[Float64](../data-types/float.md)型の値に変換しますが、エラーが発生した場合は`NULL`を返します。

**構文**

```sql
toFloat64OrNull(x)
```

**引数**

- `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

- (U)Int8/16/32/128/256、Float32/64の文字列表現。

サポートされない引数(`\N`を返す):

- 2進数および16進数値の文字列表現。例: `SELECT toFloat64OrNull('0xc0fe');`

**戻り値**

- 成功した場合は64ビットFloat値、それ以外の場合は`\N`。[Float64](../data-types/float.md)。

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

- [`toFloat64`](#tofloat64)
- [`toFloat64OrZero`](#tofloat64orzero)
- [`toFloat64OrDefault`](#tofloat64ordefault)


## toFloat64OrDefault {#tofloat64ordefault}

[`toFloat64`](#tofloat64)と同様に、この関数は入力値を[Float64](../data-types/float.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
`default`値が指定されていない場合、エラー時には`0`が返されます。

**構文**

```sql
toFloat64OrDefault(expr[, default])
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
- `default`(オプション) — `Float64`型への解析が失敗した場合に返すデフォルト値。[Float64](../data-types/float.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値。
- (U)Int8/16/32/128/256の文字列表現。
- `NaN`および`Inf`を含むFloat32/64型の値。
- `NaN`および`Inf`を含むFloat32/64の文字列表現(大文字小文字を区別しない)。

デフォルト値が返される引数:

- 2進数および16進数の文字列表現。例: `SELECT toFloat64OrDefault('0xc0fe', CAST('0', 'Float64'));`。

**返される値**

- 成功した場合は64ビットのFloat値、それ以外の場合は指定されたデフォルト値、または指定されていない場合は`0`を返します。[Float64](../data-types/float.md)。

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
Row 1:
──────
toFloat64OrDefault('8', CAST('0', 'Float64')):   8
toFloat64OrDefault('abc', CAST('0', 'Float64')): 0
```

**関連項目**

- [`toFloat64`](#tofloat64)。
- [`toFloat64OrZero`](#tofloat64orzero)。
- [`toFloat64OrNull`](#tofloat64ornull)。


## toBFloat16 {#tobfloat16}

入力値を[`BFloat16`](/sql-reference/data-types/float#bfloat16)型の値に変換します。
エラーが発生した場合は例外をスローします。

**構文**

```sql
toBFloat16(expr)
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[式](/sql-reference/syntax#expressions)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値。
- (U)Int8/16/32/128/256の文字列表現。
- `NaN`および`Inf`を含むFloat32/64型の値。
- `NaN`および`Inf`を含むFloat32/64の文字列表現(大文字小文字を区別しません)。

**戻り値**

- 16ビットbrain-float値。[BFloat16](/sql-reference/data-types/float#bfloat16)。

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

- [`toBFloat16OrZero`](#tobfloat16orzero).
- [`toBFloat16OrNull`](#tobfloat16ornull).


## toBFloat16OrZero {#tobfloat16orzero}

String型の入力値を[`BFloat16`](/sql-reference/data-types/float#bfloat16)型の値に変換します。
文字列が浮動小数点値を表していない場合、この関数はゼロを返します。

**構文**

```sql
toBFloat16OrZero(x)
```

**引数**

- `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

- 数値の文字列表現。

サポートされない引数(`0`を返す):

- 二進数および十六進数値の文字列表現。
- 数値型の値。

**戻り値**

- 16ビットbrain-float値、それ以外の場合は`0`。[BFloat16](/sql-reference/data-types/float#bfloat16)。

:::note
この関数は文字列表現からの変換時に精度の暗黙的な損失を許容します。
:::

**例**

```sql
SELECT toBFloat16OrZero('0x5E'); -- サポートされない引数

0

SELECT toBFloat16OrZero('12.3'); -- 典型的な使用例

12.25

SELECT toBFloat16OrZero('12.3456789');

12.3125 -- 精度の暗黙的な損失
```

**関連項目**

- [`toBFloat16`](#tobfloat16)。
- [`toBFloat16OrNull`](#tobfloat16ornull)。


## toBFloat16OrNull {#tobfloat16ornull}

文字列入力値を[`BFloat16`](/sql-reference/data-types/float#bfloat16)型の値に変換しますが、文字列が浮動小数点値を表していない場合、この関数は`NULL`を返します。

**構文**

```sql
toBFloat16OrNull(x)
```

**引数**

- `x` — 数値の文字列表現。[String](../data-types/string.md)。

サポートされる引数:

- 数値の文字列表現。

サポートされない引数(`NULL`を返す):

- 二進数および十六進数値の文字列表現。
- 数値型の値。

**戻り値**

- 16ビットbrain-float値、それ以外の場合は`NULL`(`\N`)。[BFloat16](/sql-reference/data-types/float#bfloat16)。

:::note
この関数は、文字列表現からの変換時に精度の暗黙的な損失を許容します。
:::

**例**

```sql
SELECT toBFloat16OrNull('0x5E'); -- サポートされない引数

\N

SELECT toBFloat16OrNull('12.3'); -- 典型的な使用例

12.25

SELECT toBFloat16OrNull('12.3456789');

12.3125 -- 精度の暗黙的な損失
```

**関連項目**

- [`toBFloat16`](#tobfloat16)。
- [`toBFloat16OrZero`](#tobfloat16orzero)。


## toDate {#todate}

引数を[Date](../data-types/date.md)データ型に変換します。

引数が[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)の場合、時刻部分が切り捨てられ、日付部分のみが残ります:

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

引数が[String](../data-types/string.md)の場合、[Date](../data-types/date.md)または[DateTime](../data-types/datetime.md)として解析されます。[DateTime](../data-types/datetime.md)として解析された場合は、日付部分が使用されます:

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

引数が数値でUNIXタイムスタンプと見なされる場合(65535より大きい場合)、[DateTime](../data-types/datetime.md)として解釈された後、現在のタイムゾーンで[Date](../data-types/date.md)に切り捨てられます。タイムゾーン引数は関数の第2引数として指定できます。[Date](../data-types/date.md)への切り捨てはタイムゾーンに依存します:

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

上記の例は、同じUNIXタイムスタンプが異なるタイムゾーンで異なる日付として解釈されることを示しています。

引数が数値で65536より小さい場合、1970-01-01(最初のUNIX日)からの日数として解釈され、[Date](../data-types/date.md)に変換されます。これは`Date`データ型の内部数値表現に対応します。例:

```sql
SELECT toDate(12345)
```

```response
┌─toDate(12345)─┐
│    2003-10-20 │
└───────────────┘
```

この変換はタイムゾーンに依存しません。

引数がDate型の範囲に収まらない場合、実装定義の動作となり、サポートされる最大日付に飽和するか、オーバーフローする可能性があります:

```sql
SELECT toDate(10000000000.)
```

```response
┌─toDate(10000000000.)─┐
│           2106-02-07 │
└──────────────────────┘
```

`toDate`関数は代替形式でも記述できます:


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

[toDate](#todate)と同じですが、無効な引数を受け取った場合は[Date](../data-types/date.md)の下限値を返します。[String](../data-types/string.md)型の引数のみサポートされています。

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

[toDate](#todate)と同じですが、無効な引数を受け取った場合は`NULL`を返します。[String](../data-types/string.md)型の引数のみサポートされています。

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


## toDateOrDefault {#todateordefault}

[toDate](#todate)と同様ですが、変換に失敗した場合はデフォルト値を返します。デフォルト値は、指定されている場合は第2引数、それ以外の場合は[Date](../data-types/date.md)の下限値です。

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


## toDateTime {#todatetime}

入力値を[DateTime](../data-types/datetime.md)に変換します。

**構文**

```sql
toDateTime(expr[, time_zone ])
```

**引数**

- `expr` — 値。[String](../data-types/string.md)、[Int](../data-types/int-uint.md)、[Date](../data-types/date.md)、または[DateTime](../data-types/datetime.md)。
- `time_zone` — タイムゾーン。[String](../data-types/string.md)。

:::note
`expr`が数値の場合、Unixエポック(1970年1月1日00:00:00 UTC)からの経過秒数(Unixタイムスタンプ)として解釈されます。
`expr`が[String](../data-types/string.md)の場合、Unixタイムスタンプまたは日付/日時の文字列表現として解釈されます。
そのため、曖昧性を避けるため、短い数値文字列(4桁以下)の解析は明示的に無効化されています。例えば、文字列`'1999'`は年(Date/DateTimeの不完全な文字列表現)またはUnixタイムスタンプのいずれかとして解釈される可能性があります。より長い数値文字列は許可されています。
:::

**返り値**

- 日時。[DateTime](../data-types/datetime.md)

**例**

クエリ:

```sql
SELECT toDateTime('2022-12-30 13:44:17'), toDateTime(1685457500, 'UTC');
```

結果:

```response
┌─toDateTime('2022-12-30 13:44:17')─┬─toDateTime(1685457500, 'UTC')─┐
│               2022-12-30 13:44:17 │           2023-05-30 14:38:20 │
└───────────────────────────────────┴───────────────────────────────┘
```


## toDateTimeOrZero {#todatetimeorzero}

[toDateTime](#todatetime)と同じですが、無効な引数を受け取った場合は[DateTime](../data-types/datetime.md)の下限値を返します。[String](../data-types/string.md)型の引数のみサポートされます。

**例**

クエリ:

```sql
SELECT toDateTimeOrZero('2022-12-30 13:44:17'), toDateTimeOrZero('');
```

結果:

```response
┌─toDateTimeOrZero('2022-12-30 13:44:17')─┬─toDateTimeOrZero('')─┐
│                     2022-12-30 13:44:17 │  1970-01-01 00:00:00 │
└─────────────────────────────────────────┴──────────────────────┘
```


## toDateTimeOrNull {#todatetimeornull}

[toDateTime](#todatetime)と同じですが、無効な引数を受け取った場合は`NULL`を返します。[String](../data-types/string.md)型の引数のみサポートされています。

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


## toDateTimeOrDefault {#todatetimeordefault}

[toDateTime](#todatetime)と同様ですが、変換に失敗した場合はデフォルト値を返します。デフォルト値は、指定されている場合は第3引数、それ以外の場合は[DateTime](../data-types/datetime.md)の下限値です。

**構文**

```sql
toDateTimeOrDefault(expr [, time_zone [, default_value]])
```

**例**

クエリ:

```sql
SELECT toDateTimeOrDefault('2022-12-30 13:44:17'), toDateTimeOrDefault('', 'UTC', '2023-01-01'::DateTime('UTC'));
```

結果:

```response
┌─toDateTimeOrDefault('2022-12-30 13:44:17')─┬─toDateTimeOrDefault('', 'UTC', CAST('2023-01-01', 'DateTime(\'UTC\')'))─┐
│                        2022-12-30 13:44:17 │                                                     2023-01-01 00:00:00 │
└────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────────┘
```


## toDate32 {#todate32}

引数を[Date32](../data-types/date32.md)データ型に変換します。値が範囲外の場合、`toDate32`は[Date32](../data-types/date32.md)でサポートされている境界値を返します。引数が[Date](../data-types/date.md)型の場合、その境界値が考慮されます。

**構文**

```sql
toDate32(expr)
```

**引数**

- `expr` — 値。[String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、または[Date](../data-types/date.md)。

**返される値**

- カレンダー日付。型: [Date32](../data-types/date32.md)。

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

3. [Date](../data-types/date.md)引数を使用する場合:

```sql
SELECT toDate32(toDate('1899-01-01')) AS value, toTypeName(value);
```

```response
┌──────value─┬─toTypeName(toDate32(toDate('1899-01-01')))─┐
│ 1970-01-01 │ Date32                                     │
└────────────┴────────────────────────────────────────────┘
```


## toDate32OrZero {#todate32orzero}

[toDate32](#todate32)と同じですが、無効な引数を受け取った場合は[Date32](../data-types/date32.md)の最小値を返します。

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


## toDate32OrNull {#todate32ornull}

[toDate32](#todate32)と同じですが、無効な引数を受け取った場合は`NULL`を返します。

**例**

クエリ:

```sql
SELECT toDate32OrNull('1955-01-01'), toDate32OrNull('');
```

結果:

```response
┌─toDate32OrNull('1955-01-01')─┬─toDate32OrNull('')─┐
│                   1955-01-01 │               ᴺᵁᴸᴸ │
└──────────────────────────────┴────────────────────┘
```


## toDate32OrDefault {#todate32ordefault}

引数を[Date32](../data-types/date32.md)データ型に変換します。値が範囲外の場合、`toDate32OrDefault`は[Date32](../data-types/date32.md)でサポートされる下限値を返します。引数が[Date](../data-types/date.md)型の場合、その境界値が考慮されます。無効な引数を受け取った場合はデフォルト値を返します。

**例**

クエリ:

```sql
SELECT
    toDate32OrDefault('1930-01-01', toDate32('2020-01-01')),
    toDate32OrDefault('xx1930-01-01', toDate32('2020-01-01'));
```

結果:

```response
┌─toDate32OrDefault('1930-01-01', toDate32('2020-01-01'))─┬─toDate32OrDefault('xx1930-01-01', toDate32('2020-01-01'))─┐
│                                              1930-01-01 │                                                2020-01-01 │
└─────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────┘
```


## toDateTime64 {#todatetime64}

入力値を[DateTime64](../data-types/datetime64.md)型の値に変換します。

**構文**

```sql
toDateTime64(expr, scale, [timezone])
```

**引数**

- `expr` — 値。[String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[Float](../data-types/float.md)、または[DateTime](../data-types/datetime.md)。
- `scale` - ティックサイズ(精度): 10<sup>-precision</sup>秒。有効範囲: [ 0 : 9 ]。
- `timezone` (オプション) - 指定されたdatetime64オブジェクトのタイムゾーン。

**戻り値**

- サブ秒精度を持つ暦日付と時刻。[DateTime64](../data-types/datetime64.md)。

**例**

1. 値が範囲内の場合:

```sql
SELECT toDateTime64('1955-01-01 00:00:00.000', 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64('1955-01-01 00:00:00.000', 3))─┐
│ 1955-01-01 00:00:00.000 │ DateTime64(3)                                          │
└─────────────────────────┴────────────────────────────────────────────────────────┘
```

2. 精度を持つ小数として:

```sql
SELECT toDateTime64(1546300800.000, 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64(1546300800., 3))─┐
│ 2019-01-01 00:00:00.000 │ DateTime64(3)                            │
└─────────────────────────┴──────────────────────────────────────────┘
```

小数点がない場合、値は秒単位のUnixタイムスタンプとして扱われます:

```sql
SELECT toDateTime64(1546300800000, 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64(1546300800000, 3))─┐
│ 2282-12-31 00:00:00.000 │ DateTime64(3)                              │
└─────────────────────────┴────────────────────────────────────────────┘
```

3. `timezone`を指定した場合:

```sql
SELECT toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul') AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul'))─┐
│ 2019-01-01 00:00:00.000 │ DateTime64(3, 'Asia/Istanbul')                                      │
└─────────────────────────┴─────────────────────────────────────────────────────────────────────┘
```


## toDateTime64OrZero {#todatetime64orzero}

[toDateTime64](#todatetime64)と同様に、この関数は入力値を[DateTime64](../data-types/datetime64.md)型の値に変換しますが、無効な引数を受け取った場合は[DateTime64](../data-types/datetime64.md)の最小値を返します。

**構文**

```sql
toDateTime64OrZero(expr, scale, [timezone])
```

**引数**

- `expr` — 値。[String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[Float](../data-types/float.md)、または[DateTime](../data-types/datetime.md)。
- `scale` - ティックサイズ(精度): 10<sup>-precision</sup>秒。有効範囲: [ 0 : 9 ]。
- `timezone` (オプション) - 指定されたDateTime64オブジェクトのタイムゾーン。

**戻り値**

- サブ秒精度を持つ暦日と時刻。無効な場合は`DateTime64`の最小値: `1970-01-01 01:00:00.000`。[DateTime64](../data-types/datetime64.md)。

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

- [toDateTime64](#todatetime64)。
- [toDateTime64OrNull](#todatetime64ornull)。
- [toDateTime64OrDefault](#todatetime64ordefault)。


## toDateTime64OrNull {#todatetime64ornull}

[toDateTime64](#todatetime64)と同様に、この関数は入力値を[DateTime64](../data-types/datetime64.md)型の値に変換しますが、無効な引数を受け取った場合は`NULL`を返します。

**構文**

```sql
toDateTime64OrNull(expr, scale, [timezone])
```

**引数**

- `expr` — 値。[String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[Float](../data-types/float.md)、または[DateTime](../data-types/datetime.md)。
- `scale` - ティックサイズ(精度): 10<sup>-precision</sup>秒。有効範囲: [ 0 : 9 ]。
- `timezone` (オプション) - 指定されたDateTime64オブジェクトのタイムゾーン。

**戻り値**

- サブ秒精度を持つ日付と時刻、それ以外の場合は`NULL`。[DateTime64](../data-types/datetime64.md)/[NULL](../data-types/nullable.md)。

**例**

クエリ:

```sql
SELECT
    toDateTime64OrNull('1976-10-18 00:00:00.30', 3) AS valid_arg,
    toDateTime64OrNull('1976-10-18 00:00:00 30', 3) AS invalid_arg
```

結果:

```response
┌───────────────valid_arg─┬─invalid_arg─┐
│ 1976-10-18 00:00:00.300 │        ᴺᵁᴸᴸ │
└─────────────────────────┴─────────────┘
```

**関連項目**

- [toDateTime64](#todatetime64).
- [toDateTime64OrZero](#todatetime64orzero).
- [toDateTime64OrDefault](#todatetime64ordefault).


## toDateTime64OrDefault {#todatetime64ordefault}

[toDateTime64](#todatetime64)と同様に、この関数は入力値を[DateTime64](../data-types/datetime64.md)型の値に変換しますが、無効な引数を受け取った場合は[DateTime64](../data-types/datetime64.md)のデフォルト値、または指定されたデフォルト値を返します。

**構文**

```sql
toDateTime64OrNull(expr, scale, [timezone, default])
```

**引数**

- `expr` — 値。[String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[Float](../data-types/float.md)、または[DateTime](../data-types/datetime.md)。
- `scale` - ティックサイズ(精度): 10<sup>-precision</sup>秒。有効範囲: [ 0 : 9 ]。
- `timezone` (オプション) - 指定されたDateTime64オブジェクトのタイムゾーン。
- `default` (オプション) - 無効な引数を受け取った場合に返すデフォルト値。[DateTime64](../data-types/datetime64.md)。

**戻り値**

- サブ秒精度を持つ暦日と時刻。それ以外の場合は`DateTime64`の最小値、または指定された場合は`default`値。[DateTime64](../data-types/datetime64.md)。

**例**

クエリ:

```sql
SELECT
    toDateTime64OrDefault('1976-10-18 00:00:00 30', 3) AS invalid_arg,
    toDateTime64OrDefault('1976-10-18 00:00:00 30', 3, 'UTC', toDateTime64('2001-01-01 00:00:00.00',3)) AS invalid_arg_with_default
```

結果:

```response
┌─────────────invalid_arg─┬─invalid_arg_with_default─┐
│ 1970-01-01 01:00:00.000 │  2000-12-31 23:00:00.000 │
└─────────────────────────┴──────────────────────────┘
```

**関連項目**

- [toDateTime64](#todatetime64)
- [toDateTime64OrZero](#todatetime64orzero)
- [toDateTime64OrNull](#todatetime64ornull)


## toDecimal32 {#todecimal32}

入力値をスケール`S`の[`Decimal(9, S)`](../data-types/decimal.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toDecimal32(expr, S)
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。
- `S` — 0から9の間のスケールパラメータで、数値の小数部が持つことができる桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値または文字列表現。

サポートされない引数:

- Float32/64型の値`NaN`および`Inf`の値または文字列表現(大文字小文字を区別しない)。
- 二進数および十六進数の値の文字列表現。例: `SELECT toDecimal32('0xc0fe', 1);`。

:::note
`expr`の値が`Decimal32`の範囲`( -1 * 10^(9 - S), 1 * 10^(9 - S) )`を超える場合、オーバーフローが発生する可能性があります。
小数部の余分な桁は破棄されます(四捨五入されません)。
整数部の余分な桁は例外を引き起こします。
:::

:::warning
変換では余分な桁が削除され、Float32/Float64入力を扱う際に予期しない動作をする可能性があります。これは演算が浮動小数点命令を使用して実行されるためです。
例: `toDecimal32(1.15, 2)`は`1.14`と等しくなります。これは浮動小数点での1.15 \* 100が114.99になるためです。
文字列入力を使用することで、演算が基礎となる整数型を使用するようにできます: `toDecimal32('1.15', 2) = 1.15`
:::

**戻り値**

- `Decimal(9, S)`型の値。[Decimal32(S)](../data-types/int-uint.md)。

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

- [`toDecimal32OrZero`](#todecimal32orzero)。
- [`toDecimal32OrNull`](#todecimal32ornull)。
- [`toDecimal32OrDefault`](#todecimal32ordefault)。


## toDecimal32OrZero {#todecimal32orzero}

[`toDecimal32`](#todecimal32)と同様に、この関数は入力値を[Decimal(9, S)](../data-types/decimal.md)型の値に変換しますが、エラーが発生した場合は`0`を返します。

**構文**

```sql
toDecimal32OrZero(expr, S)
```

**引数**

- `expr` — 数値の文字列表現。[String](../data-types/string.md)。
- `S` — 0から9の範囲のスケールパラメータで、数値の小数部の桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の文字列表現。
- Float32/64型の文字列表現。

サポートされない引数:

- Float32/64の値`NaN`および`Inf`の文字列表現。
- バイナリおよび16進数値の文字列表現(例: `SELECT toDecimal32OrZero('0xc0fe', 1);`)。

:::note
`expr`の値が`Decimal32`の範囲`( -1 * 10^(9 - S), 1 * 10^(9 - S) )`を超える場合、オーバーフローが発生する可能性があります。
小数部の余分な桁は破棄されます(四捨五入されません)。
整数部の余分な桁はエラーになります。
:::

**戻り値**

- 成功した場合は`Decimal(9, S)`型の値、それ以外の場合は小数点以下`S`桁の`0`。[Decimal32(S)](../data-types/decimal.md)。

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

結果:

```response
Row 1:
──────
a:             -1.111
toTypeName(a): Decimal(9, 5)
b:             0
toTypeName(b): Decimal(9, 5)
```

**関連項目**

- [`toDecimal32`](#todecimal32)。
- [`toDecimal32OrNull`](#todecimal32ornull)。
- [`toDecimal32OrDefault`](#todecimal32ordefault)。


## toDecimal32OrNull {#todecimal32ornull}

[`toDecimal32`](#todecimal32)と同様に、この関数は入力値を[Nullable(Decimal(9, S))](../data-types/decimal.md)型の値に変換しますが、エラーが発生した場合は`NULL`を返します。

**構文**

```sql
toDecimal32OrNull(expr, S)
```

**引数**

- `expr` — 数値の文字列表現。[String](../data-types/string.md)。
- `S` — 0から9の間のスケールパラメータで、数値の小数部分の桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の文字列表現。
- Float32/64型の文字列表現。

サポートされない引数:

- Float32/64の値`NaN`および`Inf`の文字列表現。
- 2進数および16進数の値の文字列表現。例: `SELECT toDecimal32OrNull('0xc0fe', 1);`。

:::note
`expr`の値が`Decimal32`の範囲`( -1 * 10^(9 - S), 1 * 10^(9 - S) )`を超える場合、オーバーフローが発生する可能性があります。
小数部分の余分な桁は破棄されます(四捨五入されません)。
整数部分の余分な桁はエラーになります。
:::

**戻り値**

- 成功した場合は`Nullable(Decimal(9, S))`型の値、それ以外の場合は同じ型の`NULL`値。[Decimal32(S)](../data-types/decimal.md)。

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

- [`toDecimal32`](#todecimal32)。
- [`toDecimal32OrZero`](#todecimal32orzero)。
- [`toDecimal32OrDefault`](#todecimal32ordefault)。


## toDecimal32OrDefault {#todecimal32ordefault}

[`toDecimal32`](#todecimal32)と同様に、この関数は入力値を[Decimal(9, S)](../data-types/decimal.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。

**構文**

```sql
toDecimal32OrDefault(expr, S[, default])
```

**引数**

- `expr` — 数値の文字列表現。[String](../data-types/string.md)。
- `S` — 0から9の間のスケールパラメータで、数値の小数部分の桁数を指定します。[UInt8](../data-types/int-uint.md)。
- `default`(オプション) — `Decimal32(S)`型への解析が失敗した場合に返すデフォルト値。[Decimal32(S)](../data-types/decimal.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の文字列表現。
- Float32/64型の文字列表現。

サポートされない引数:

- Float32/64の値`NaN`および`Inf`の文字列表現。
- バイナリおよび16進数値の文字列表現。例: `SELECT toDecimal32OrDefault('0xc0fe', 1);`。

:::note
`expr`の値が`Decimal32`の範囲`( -1 * 10^(9 - S), 1 * 10^(9 - S) )`を超える場合、オーバーフローが発生する可能性があります。
小数部分の余分な桁は破棄されます(丸められません)。
整数部分の余分な桁はエラーになります。
:::

:::warning
変換では余分な桁が削除され、Float32/Float64入力を扱う際には予期しない動作をする可能性があります。これは、演算が浮動小数点命令を使用して実行されるためです。
例: `toDecimal32OrDefault(1.15, 2)`は`1.14`と等しくなります。これは、浮動小数点での1.15 \* 100が114.99になるためです。
文字列入力を使用すると、演算が基礎となる整数型を使用するようになります: `toDecimal32OrDefault('1.15', 2) = 1.15`
:::

**戻り値**

- 成功した場合は`Decimal(9, S)`型の値、それ以外の場合は渡されたデフォルト値、または渡されていない場合は`0`を返します。[Decimal32(S)](../data-types/decimal.md)。

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

結果:

```response
Row 1:
──────
a:             0.0001
toTypeName(a): Decimal(9, 5)
b:             -1
toTypeName(b): Decimal(9, 0)
```

**関連項目**

- [`toDecimal32`](#todecimal32)。
- [`toDecimal32OrZero`](#todecimal32orzero)。
- [`toDecimal32OrNull`](#todecimal32ornull)。


## toDecimal64 {#todecimal64}

入力値をスケール`S`の[`Decimal(18, S)`](../data-types/decimal.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toDecimal64(expr, S)
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。
- `S` — 0から18の範囲のスケールパラメータで、数値の小数部の桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値または文字列表現。

サポートされない引数:

- Float32/64型の値`NaN`および`Inf`の値または文字列表現(大文字小文字を区別しない)。
- 2進数および16進数値の文字列表現。例: `SELECT toDecimal64('0xc0fe', 1);`。

:::note
`expr`の値が`Decimal64`の範囲`( -1 * 10^(18 - S), 1 * 10^(18 - S) )`を超える場合、オーバーフローが発生する可能性があります。
小数部の余分な桁は破棄されます(四捨五入されません)。
整数部の余分な桁は例外を引き起こします。
:::

:::warning
変換では余分な桁が削除され、Float32/Float64入力を扱う際に予期しない動作をする可能性があります。これは、演算が浮動小数点命令を使用して実行されるためです。
例: `toDecimal64(1.15, 2)`は`1.14`になります。これは、浮動小数点での1.15 \* 100が114.99になるためです。
文字列入力を使用することで、演算が基礎となる整数型を使用するようにできます: `toDecimal64('1.15', 2) = 1.15`
:::

**戻り値**

- `Decimal(18, S)`型の値。[Decimal64(S)](../data-types/int-uint.md)。

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

- [`toDecimal64OrZero`](#todecimal64orzero)。
- [`toDecimal64OrNull`](#todecimal64ornull)。
- [`toDecimal64OrDefault`](#todecimal64ordefault)。


## toDecimal64OrZero {#todecimal64orzero}

[`toDecimal64`](#todecimal64)と同様に、この関数は入力値を[Decimal(18, S)](../data-types/decimal.md)型の値に変換しますが、エラーが発生した場合は`0`を返します。

**構文**

```sql
toDecimal64OrZero(expr, S)
```

**引数**

- `expr` — 数値の文字列表現。[String](../data-types/string.md)。
- `S` — 0から18の範囲のスケールパラメータで、数値の小数部の桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の文字列表現。
- Float32/64型の文字列表現。

サポートされない引数:

- Float32/64の値`NaN`および`Inf`の文字列表現。
- バイナリおよび16進数値の文字列表現(例: `SELECT toDecimal64OrZero('0xc0fe', 1);`)。

:::note
`expr`の値が`Decimal64`の範囲`( -1 * 10^(18 - S), 1 * 10^(18 - S) )`を超える場合、オーバーフローが発生する可能性があります。
小数部の余分な桁は破棄されます(四捨五入されません)。
整数部の余分な桁はエラーになります。
:::

**戻り値**

- 成功した場合は`Decimal(18, S)`型の値、それ以外の場合は小数点以下`S`桁の`0`。[Decimal64(S)](../data-types/decimal.md)。

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

結果:

```response
Row 1:
──────
a:             0.0001
toTypeName(a): Decimal(18, 18)
b:             0
toTypeName(b): Decimal(18, 18)
```

**関連項目**

- [`toDecimal64`](#todecimal64)。
- [`toDecimal64OrNull`](#todecimal64ornull)。
- [`toDecimal64OrDefault`](#todecimal64ordefault)。


## toDecimal64OrNull {#todecimal64ornull}

[`toDecimal64`](#todecimal64)と同様に、この関数は入力値を[Nullable(Decimal(18, S))](../data-types/decimal.md)型の値に変換しますが、エラーが発生した場合は`NULL`を返します。

**構文**

```sql
toDecimal64OrNull(expr, S)
```

**引数**

- `expr` — 数値の文字列表現。[String](../data-types/string.md)。
- `S` — 0から18の間のスケールパラメータで、数値の小数部分の桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の文字列表現。
- Float32/64型の文字列表現。

サポートされない引数:

- Float32/64の値`NaN`および`Inf`の文字列表現。
- 2進数および16進数の値の文字列表現。例: `SELECT toDecimal64OrNull('0xc0fe', 1);`。

:::note
`expr`の値が`Decimal64`の範囲`( -1 * 10^(18 - S), 1 * 10^(18 - S) )`を超える場合、オーバーフローが発生する可能性があります。
小数部分の余分な桁は破棄されます(四捨五入されません)。
整数部分の余分な桁はエラーになります。
:::

**戻り値**

- 成功した場合は`Nullable(Decimal(18, S))`型の値、それ以外の場合は同じ型の`NULL`値。[Decimal64(S)](../data-types/decimal.md)。

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

- [`toDecimal64`](#todecimal64)。
- [`toDecimal64OrZero`](#todecimal64orzero)。
- [`toDecimal64OrDefault`](#todecimal64ordefault)。


## toDecimal64OrDefault {#todecimal64ordefault}

[`toDecimal64`](#todecimal64)と同様に、この関数は入力値を[Decimal(18, S)](../data-types/decimal.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。

**構文**

```sql
toDecimal64OrDefault(expr, S[, default])
```

**引数**

- `expr` — 数値の文字列表現。[String](../data-types/string.md)。
- `S` — 0から18の間のスケールパラメータで、数値の小数部が持つことができる桁数を指定します。[UInt8](../data-types/int-uint.md)。
- `default`(オプション) — `Decimal64(S)`型への解析が失敗した場合に返すデフォルト値。[Decimal64(S)](../data-types/decimal.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の文字列表現。
- Float32/64型の文字列表現。

サポートされない引数:

- Float32/64の値`NaN`および`Inf`の文字列表現。
- バイナリおよび16進数値の文字列表現。例: `SELECT toDecimal64OrDefault('0xc0fe', 1);`。

:::note
`expr`の値が`Decimal64`の範囲`( -1 * 10^(18 - S), 1 * 10^(18 - S) )`を超える場合、オーバーフローが発生する可能性があります。
小数部の余分な桁は破棄されます(四捨五入されません)。
整数部の余分な桁はエラーになります。
:::

:::warning
変換では余分な桁が削除され、Float32/Float64入力を扱う際には予期しない動作をする可能性があります。これは、演算が浮動小数点命令を使用して実行されるためです。
例: `toDecimal64OrDefault(1.15, 2)`は`1.14`と等しくなります。これは、浮動小数点での1.15 \* 100が114.99になるためです。
String入力を使用すると、演算が基礎となる整数型を使用するようになります: `toDecimal64OrDefault('1.15', 2) = 1.15`
:::

**戻り値**

- 成功した場合は`Decimal(18, S)`型の値、それ以外の場合は渡されたデフォルト値、または渡されていない場合は`0`を返します。[Decimal64(S)](../data-types/decimal.md)。

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

結果:

```response
Row 1:
──────
a:             0.0001
toTypeName(a): Decimal(18, 18)
b:             -1
toTypeName(b): Decimal(18, 0)
```

**関連項目**

- [`toDecimal64`](#todecimal64)。
- [`toDecimal64OrZero`](#todecimal64orzero)。
- [`toDecimal64OrNull`](#todecimal64ornull)。


## toDecimal128 {#todecimal128}

入力値をスケール`S`の[`Decimal(38, S)`](../data-types/decimal.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toDecimal128(expr, S)
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。
- `S` — 0から38の範囲のスケールパラメータで、数値の小数部の桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値または文字列表現。

サポートされない引数:

- Float32/64型の値`NaN`および`Inf`の値または文字列表現(大文字小文字を区別しない)。
- 二進数および十六進数の値の文字列表現。例: `SELECT toDecimal128('0xc0fe', 1);`。

:::note
`expr`の値が`Decimal128`の範囲`( -1 * 10^(38 - S), 1 * 10^(38 - S) )`を超える場合、オーバーフローが発生する可能性があります。
小数部の余分な桁は破棄されます(四捨五入されません)。
整数部の余分な桁は例外を引き起こします。
:::

:::warning
変換では余分な桁が削除され、Float32/Float64入力を扱う際に予期しない動作をする可能性があります。これは、演算が浮動小数点命令を使用して実行されるためです。
例: `toDecimal128(1.15, 2)`は`1.14`になります。これは、浮動小数点での1.15 \* 100が114.99になるためです。
文字列入力を使用することで、演算が基礎となる整数型を使用するようにできます: `toDecimal128('1.15', 2) = 1.15`
:::

**戻り値**

- `Decimal(38, S)`型の値。[Decimal128(S)](../data-types/int-uint.md)。

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

- [`toDecimal128OrZero`](#todecimal128orzero)。
- [`toDecimal128OrNull`](#todecimal128ornull)。
- [`toDecimal128OrDefault`](#todecimal128ordefault)。


## toDecimal128OrZero {#todecimal128orzero}

[`toDecimal128`](#todecimal128)と同様に、この関数は入力値を[Decimal(38, S)](../data-types/decimal.md)型の値に変換しますが、エラーが発生した場合は`0`を返します。

**構文**

```sql
toDecimal128OrZero(expr, S)
```

**引数**

- `expr` — 数値の文字列表現。[String](../data-types/string.md)。
- `S` — 0から38の範囲のスケールパラメータで、数値の小数部の桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の文字列表現。
- Float32/64型の文字列表現。

サポートされない引数:

- Float32/64の値`NaN`および`Inf`の文字列表現。
- バイナリおよび16進数値の文字列表現(例: `SELECT toDecimal128OrZero('0xc0fe', 1);`)。

:::note
`expr`の値が`Decimal128`の範囲`( -1 * 10^(38 - S), 1 * 10^(38 - S) )`を超える場合、オーバーフローが発生する可能性があります。
小数部の余分な桁は破棄されます(四捨五入されません)。
整数部の余分な桁はエラーになります。
:::

**返される値**

- 成功した場合は`Decimal(38, S)`型の値、それ以外の場合は小数点以下`S`桁の`0`。[Decimal128(S)](../data-types/decimal.md)。

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

- [`toDecimal128`](#todecimal128)。
- [`toDecimal128OrNull`](#todecimal128ornull)。
- [`toDecimal128OrDefault`](#todecimal128ordefault)。


## toDecimal128OrNull {#todecimal128ornull}

[`toDecimal128`](#todecimal128)と同様に、この関数は入力値を[Nullable(Decimal(38, S))](../data-types/decimal.md)型の値に変換しますが、エラーが発生した場合は`NULL`を返します。

**構文**

```sql
toDecimal128OrNull(expr, S)
```

**引数**

- `expr` — 数値の文字列表現。[String](../data-types/string.md)。
- `S` — 0から38の間のスケールパラメータで、数値の小数部分の桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の文字列表現。
- Float32/64型の文字列表現。

サポートされない引数:

- Float32/64の値`NaN`および`Inf`の文字列表現。
- 2進数および16進数の値の文字列表現。例: `SELECT toDecimal128OrNull('0xc0fe', 1);`。

:::note
`expr`の値が`Decimal128`の範囲`( -1 * 10^(38 - S), 1 * 10^(38 - S) )`を超える場合、オーバーフローが発生する可能性があります。
小数部分の余分な桁は破棄されます(四捨五入されません)。
整数部分の余分な桁はエラーになります。
:::

**戻り値**

- 成功した場合は`Nullable(Decimal(38, S))`型の値、それ以外の場合は同じ型の`NULL`値。[Decimal128(S)](../data-types/decimal.md)。

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

結果:

```response
Row 1:
──────
a:             0.023809523809523808
toTypeName(a): Nullable(Decimal(38, 38))
b:             ᴺᵁᴸᴸ
toTypeName(b): Nullable(Decimal(38, 38))
```

**関連項目**

- [`toDecimal128`](#todecimal128)。
- [`toDecimal128OrZero`](#todecimal128orzero)。
- [`toDecimal128OrDefault`](#todecimal128ordefault)。


## toDecimal128OrDefault {#todecimal128ordefault}

[`toDecimal128`](#todecimal128)と同様に、この関数は入力値を[Decimal(38, S)](../data-types/decimal.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。

**構文**

```sql
toDecimal128OrDefault(expr, S[, default])
```

**引数**

- `expr` — 数値の文字列表現。[String](../data-types/string.md)。
- `S` — 0から38の間のスケールパラメータで、数値の小数部分の桁数を指定します。[UInt8](../data-types/int-uint.md)。
- `default`(オプション) — `Decimal128(S)`型への解析が失敗した場合に返すデフォルト値。[Decimal128(S)](../data-types/decimal.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の文字列表現。
- Float32/64型の文字列表現。

サポートされない引数:

- Float32/64の値`NaN`および`Inf`の文字列表現。
- バイナリおよび16進数値の文字列表現。例: `SELECT toDecimal128OrDefault('0xc0fe', 1);`。

:::note
`expr`の値が`Decimal128`の範囲`( -1 * 10^(38 - S), 1 * 10^(38 - S) )`を超える場合、オーバーフローが発生する可能性があります。
小数部分の余分な桁は破棄されます(四捨五入されません)。
整数部分の余分な桁はエラーになります。
:::

:::warning
変換では余分な桁が削除され、Float32/Float64入力を扱う際に予期しない動作をする可能性があります。これは、演算が浮動小数点命令を使用して実行されるためです。
例: `toDecimal128OrDefault(1.15, 2)`は`1.14`と等しくなります。これは、浮動小数点での1.15 \* 100が114.99になるためです。
文字列入力を使用すると、演算が基礎となる整数型を使用するようになります: `toDecimal128OrDefault('1.15', 2) = 1.15`
:::

**戻り値**

- 成功した場合は`Decimal(38, S)`型の値、それ以外の場合は渡されたデフォルト値、または渡されていない場合は`0`を返します。[Decimal128(S)](../data-types/decimal.md)。

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

結果:

```response
Row 1:
──────
a:             0.023809523809523808
toTypeName(a): Decimal(38, 18)
b:             -1
toTypeName(b): Decimal(38, 0)
```

**関連項目**

- [`toDecimal128`](#todecimal128)。
- [`toDecimal128OrZero`](#todecimal128orzero)。
- [`toDecimal128OrNull`](#todecimal128ornull)。


## toDecimal256 {#todecimal256}

入力値をスケール`S`の[`Decimal(76, S)`](../data-types/decimal.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toDecimal256(expr, S)
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。[Expression](/sql-reference/syntax#expressions)。
- `S` — 0から76の範囲のスケールパラメータで、数値の小数部の桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値または文字列表現。

サポートされない引数:

- Float32/64型の値`NaN`および`Inf`の値または文字列表現(大文字小文字を区別しない)。
- 二進数および十六進数の値の文字列表現。例: `SELECT toDecimal256('0xc0fe', 1);`。

:::note
`expr`の値が`Decimal256`の範囲`( -1 * 10^(76 - S), 1 * 10^(76 - S) )`を超える場合、オーバーフローが発生する可能性があります。
小数部の余分な桁は破棄されます(四捨五入されません)。
整数部の余分な桁は例外を引き起こします。
:::

:::warning
変換では余分な桁が削除され、Float32/Float64入力を扱う際に予期しない動作をする可能性があります。これは、演算が浮動小数点命令を使用して実行されるためです。
例: `toDecimal256(1.15, 2)`は`1.14`になります。これは、浮動小数点での1.15 \* 100が114.99になるためです。
文字列入力を使用することで、演算が基礎となる整数型を使用するようにできます: `toDecimal256('1.15', 2) = 1.15`
:::

**戻り値**

- `Decimal(76, S)`型の値。[Decimal256(S)](../data-types/int-uint.md)。

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

- [`toDecimal256OrZero`](#todecimal256orzero)。
- [`toDecimal256OrNull`](#todecimal256ornull)。
- [`toDecimal256OrDefault`](#todecimal256ordefault)。


## toDecimal256OrZero {#todecimal256orzero}

[`toDecimal256`](#todecimal256)と同様に、この関数は入力値を[Decimal(76, S)](../data-types/decimal.md)型の値に変換しますが、エラーが発生した場合は`0`を返します。

**構文**

```sql
toDecimal256OrZero(expr, S)
```

**引数**

- `expr` — 数値の文字列表現。[String](../data-types/string.md)。
- `S` — 0から76の範囲のスケールパラメータで、数値の小数部分の桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の文字列表現。
- Float32/64型の文字列表現。

サポートされない引数:

- Float32/64の値`NaN`および`Inf`の文字列表現。
- バイナリおよび16進数値の文字列表現(例: `SELECT toDecimal256OrZero('0xc0fe', 1);`)。

:::note
`expr`の値が`Decimal256`の範囲`( -1 * 10^(76 - S), 1 * 10^(76 - S) )`を超える場合、オーバーフローが発生する可能性があります。
小数部分の余分な桁は破棄されます(四捨五入されません)。
整数部分の余分な桁はエラーになります。
:::

**返される値**

- 成功した場合は`Decimal(76, S)`型の値、それ以外の場合は小数点以下`S`桁の`0`。[Decimal256(S)](../data-types/decimal.md)。

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

結果:

```response
Row 1:
──────
a:             0.0001
toTypeName(a): Decimal(76, 76)
b:             0
toTypeName(b): Decimal(76, 76)
```

**関連項目**

- [`toDecimal256`](#todecimal256)。
- [`toDecimal256OrNull`](#todecimal256ornull)。
- [`toDecimal256OrDefault`](#todecimal256ordefault)。


## toDecimal256OrNull {#todecimal256ornull}

[`toDecimal256`](#todecimal256)と同様に、この関数は入力値を[Nullable(Decimal(76, S))](../data-types/decimal.md)型の値に変換しますが、エラーが発生した場合は`NULL`を返します。

**構文**

```sql
toDecimal256OrNull(expr, S)
```

**引数**

- `expr` — 数値の文字列表現。[String](../data-types/string.md)。
- `S` — 0から76の間のスケールパラメータで、数値の小数部分の桁数を指定します。[UInt8](../data-types/int-uint.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の文字列表現。
- Float32/64型の文字列表現。

サポートされない引数:

- Float32/64の値`NaN`および`Inf`の文字列表現。
- 2進数および16進数の値の文字列表現。例: `SELECT toDecimal256OrNull('0xc0fe', 1);`。

:::note
`expr`の値が`Decimal256`の範囲`( -1 * 10^(76 - S), 1 * 10^(76 - S) )`を超える場合、オーバーフローが発生する可能性があります。
小数部分の余分な桁は破棄されます(四捨五入されません)。
整数部分の余分な桁はエラーになります。
:::

**戻り値**

- 成功した場合は`Nullable(Decimal(76, S))`型の値、それ以外の場合は同じ型の`NULL`値。[Decimal256(S)](../data-types/decimal.md)。

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

結果:

```response
Row 1:
──────
a:             0.023809523809523808
toTypeName(a): Nullable(Decimal(76, 76))
b:             ᴺᵁᴸᴸ
toTypeName(b): Nullable(Decimal(76, 76))
```

**関連項目**

- [`toDecimal256`](#todecimal256)。
- [`toDecimal256OrZero`](#todecimal256orzero)。
- [`toDecimal256OrDefault`](#todecimal256ordefault)。


## toDecimal256OrDefault {#todecimal256ordefault}

[`toDecimal256`](#todecimal256)と同様に、この関数は入力値を[Decimal(76, S)](../data-types/decimal.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。

**構文**

```sql
toDecimal256OrDefault(expr, S[, default])
```

**引数**

- `expr` — 数値の文字列表現。[String](../data-types/string.md)。
- `S` — 0から76の間のスケールパラメータで、数値の小数部分の桁数を指定します。[UInt8](../data-types/int-uint.md)。
- `default`(オプション) — `Decimal256(S)`型への解析が失敗した場合に返すデフォルト値。[Decimal256(S)](../data-types/decimal.md)。

サポートされる引数:

- (U)Int8/16/32/64/128/256型の文字列表現。
- Float32/64型の文字列表現。

サポートされない引数:

- Float32/64の値`NaN`および`Inf`の文字列表現。
- バイナリおよび16進数値の文字列表現。例: `SELECT toDecimal256OrDefault('0xc0fe', 1);`。

:::note
`expr`の値が`Decimal256`の範囲`( -1 * 10^(76 - S), 1 * 10^(76 - S) )`を超える場合、オーバーフローが発生する可能性があります。
小数部分の余分な桁は破棄されます(四捨五入されません)。
整数部分の余分な桁はエラーになります。
:::

:::warning
変換では余分な桁が削除され、Float32/Float64入力を扱う際には予期しない動作をする可能性があります。これは、演算が浮動小数点命令を使用して実行されるためです。
例: `toDecimal256OrDefault(1.15, 2)`は`1.14`と等しくなります。これは、浮動小数点での1.15 \* 100が114.99になるためです。
String入力を使用すると、演算が基礎となる整数型を使用するようになります: `toDecimal256OrDefault('1.15', 2) = 1.15`
:::

**戻り値**

- 成功した場合は`Decimal(76, S)`型の値、それ以外の場合は渡されたデフォルト値、または渡されていない場合は`0`を返します。[Decimal256(S)](../data-types/decimal.md)。

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

結果:

```response
Row 1:
──────
a:             0.023809523809523808
toTypeName(a): Decimal(76, 76)
b:             -1
toTypeName(b): Decimal(76, 0)
```

**関連項目**

- [`toDecimal256`](#todecimal256)。
- [`toDecimal256OrZero`](#todecimal256orzero)。
- [`toDecimal256OrNull`](#todecimal256ornull)。


## toString {#tostring}

値を文字列表現に変換します。
DateTime引数の場合、タイムゾーン名を含む2番目のString引数を指定できます。

**構文**

```sql
toString(value[, timezone])
```

**引数**

- `value`: 文字列に変換する値。[`Any`](/sql-reference/data-types)。
- `timezone`: オプション。`DateTime`変換用のタイムゾーン名。[`String`](/sql-reference/data-types/string)。

**戻り値**

- 入力値の文字列表現を返します。[`String`](/sql-reference/data-types/string)。

**例**

**使用例**

```sql title="クエリ"
SELECT
    now() AS ts,
    time_zone,
    toString(ts, time_zone) AS str_tz_datetime
FROM system.time_zones
WHERE time_zone LIKE 'Europe%'
LIMIT 10;
```

```response title="レスポンス"
┌──────────────────ts─┬─time_zone─────────┬─str_tz_datetime─────┐
│ 2023-09-08 19:14:59 │ Europe/Amsterdam  │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Andorra    │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Astrakhan  │ 2023-09-08 23:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Athens     │ 2023-09-08 22:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Belfast    │ 2023-09-08 20:14:59 │
└─────────────────────┴───────────────────┴─────────────────────┘
```


## toFixedString {#tofixedstring}

[String](../data-types/string.md)型の引数を[FixedString(N)](../data-types/fixedstring.md)型(固定長Nの文字列)に変換します。
文字列のバイト数がNより少ない場合、右側にヌルバイトでパディングされます。文字列のバイト数がNより多い場合、例外がスローされます。

**構文**

```sql
toFixedString(s, N)
```

**引数**

- `s` — 固定文字列に変換する文字列。[String](../data-types/string.md)。
- `N` — 長さN。[UInt8](../data-types/int-uint.md)

**戻り値**

- `s`の長さNの固定文字列。[FixedString](../data-types/fixedstring.md)。

**例**

クエリ:

```sql
SELECT toFixedString('foo', 8) AS s;
```

結果:

```response
┌─s─────────────┐
│ foo\0\0\0\0\0 │
└───────────────┘
```


## toStringCutToZero {#tostringcuttozero}

StringまたはFixedString型の引数を受け取ります。最初のゼロバイトが見つかった位置で内容を切り詰めたStringを返します。

**構文**

```sql
toStringCutToZero(s)
```

**例**

クエリ:

```sql
SELECT toFixedString('foo', 8) AS s, toStringCutToZero(s) AS s_cut;
```

結果:

```response
┌─s─────────────┬─s_cut─┐
│ foo\0\0\0\0\0 │ foo   │
└───────────────┴───────┘
```

クエリ:

```sql
SELECT toFixedString('foo\0bar', 8) AS s, toStringCutToZero(s) AS s_cut;
```

結果:

```response
┌─s──────────┬─s_cut─┐
│ foo\0bar\0 │ foo   │
└────────────┴───────┘
```


## toDecimalString {#todecimalstring}

数値をString型に変換し、出力の小数点以下の桁数をユーザーが指定できます。

**構文**

```sql
toDecimalString(number, scale)
```

**引数**

- `number` — String型として表現する値。[Int, UInt](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Decimal](../data-types/decimal.md)
- `scale` — 小数点以下の桁数。[UInt8](../data-types/int-uint.md)
  - [Decimal](../data-types/decimal.md)および[Int, UInt](../data-types/int-uint.md)型の最大スケールは77です（Decimal型の有効桁数の最大値）
  - [Float](../data-types/float.md)の最大スケールは60です

**戻り値**

- 指定された小数点以下の桁数（スケール）で[String](../data-types/string.md)型として表現された入力値。
  要求されたスケールが元の数値のスケールより小さい場合、一般的な算術規則に従って数値は丸められます。

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


## reinterpretAsUInt8 {#reinterpretasuint8}

入力値をUInt8型の値として扱い、バイト再解釈を実行します。[`CAST`](#cast)とは異なり、この関数は元の値の保持を試みません。対象型が入力型を表現できない場合、出力は無意味なものになります。

**構文**

```sql
reinterpretAsUInt8(x)
```

**パラメータ**

- `x`: UInt8としてバイト再解釈する値。[(U)Int\*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md)、または[FixedString](../data-types/fixedstring.md)。

**戻り値**

- UInt8として再解釈された値`x`。[UInt8](/sql-reference/data-types/int-uint)。

**例**

クエリ:

```sql
SELECT
    toInt8(257) AS x,
    toTypeName(x),
    reinterpretAsUInt8(x) AS res,
    toTypeName(res);
```

結果:

```response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ Int8          │   1 │ UInt8           │
└───┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt16 {#reinterpretasuint16}

入力値をUInt16型の値として扱い、バイト再解釈を実行します。[`CAST`](#cast)とは異なり、この関数は元の値の保持を試みません。ターゲット型が入力型を表現できない場合、出力は無意味になります。

**構文**

```sql
reinterpretAsUInt16(x)
```

**パラメータ**

- `x`: UInt16としてバイト再解釈する値。[(U)Int\*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md)、または[FixedString](../data-types/fixedstring.md)。

**戻り値**

- UInt16として再解釈された値`x`。[UInt16](/sql-reference/data-types/int-uint)。

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


## reinterpretAsUInt32 {#reinterpretasuint32}

入力値をUInt32型の値として扱い、バイト再解釈を実行します。[`CAST`](#cast)とは異なり、この関数は元の値の保持を試みません。ターゲット型が入力型を表現できない場合、出力は無意味になります。

**構文**

```sql
reinterpretAsUInt32(x)
```

**パラメータ**

- `x`: UInt32としてバイト再解釈する値。[(U)Int\*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md)、または[FixedString](../data-types/fixedstring.md)。

**戻り値**

- UInt32として再解釈された値`x`。[UInt32](/sql-reference/data-types/int-uint)。

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


## reinterpretAsUInt64 {#reinterpretasuint64}

入力値をUInt64型の値として扱い、バイト再解釈を実行します。[`CAST`](#cast)とは異なり、この関数は元の値の保持を試みません。対象型が入力型を表現できない場合、出力は無意味なものとなります。

**構文**

```sql
reinterpretAsUInt64(x)
```

**パラメータ**

- `x`: UInt64としてバイト再解釈する値。[(U)Int\*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md)、または[FixedString](../data-types/fixedstring.md)。

**戻り値**

- UInt64として再解釈された値`x`。[UInt64](/sql-reference/data-types/int-uint)。

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


## reinterpretAsUInt128 {#reinterpretasuint128}

入力値をUInt128型の値として扱い、バイト再解釈を実行します。[`CAST`](#cast)とは異なり、この関数は元の値の保持を試みません。ターゲット型が入力型を表現できない場合、出力は無意味になります。

**構文**

```sql
reinterpretAsUInt128(x)
```

**パラメータ**

- `x`: UInt128としてバイト再解釈する値。[(U)Int\*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md)、または[FixedString](../data-types/fixedstring.md)。

**戻り値**

- UInt128として再解釈された値`x`。[UInt128](/sql-reference/data-types/int-uint)。

**例**

クエリ:

```sql
SELECT
    toUInt64(257) AS x,
    toTypeName(x),
    reinterpretAsUInt128(x) AS res,
    toTypeName(res)
```

結果:

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt64        │ 257 │ UInt128         │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt256 {#reinterpretasuint256}

入力値をUInt256型の値として扱い、バイト再解釈を実行します。[`CAST`](#cast)とは異なり、この関数は元の値の保持を試みません。ターゲット型が入力型を表現できない場合、出力は無意味になります。

**構文**

```sql
reinterpretAsUInt256(x)
```

**パラメータ**

- `x`: UInt256としてバイト再解釈する値。[(U)Int\*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md)、または[FixedString](../data-types/fixedstring.md)。

**戻り値**

- UInt256として再解釈された値`x`。[UInt256](/sql-reference/data-types/int-uint)。

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


## reinterpretAsInt8 {#reinterpretasint8}

入力値をInt8型の値として扱い、バイト再解釈を実行します。[`CAST`](#cast)とは異なり、この関数は元の値の保持を試みません。対象の型が入力型を表現できない場合、出力は無意味なものになります。

**構文**

```sql
reinterpretAsInt8(x)
```

**パラメータ**

- `x`: Int8としてバイト再解釈する値。[(U)Int\*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md)、または[FixedString](../data-types/fixedstring.md)。

**戻り値**

- Int8として再解釈された値`x`。[Int8](/sql-reference/data-types/int-uint#integer-ranges)。

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


## reinterpretAsInt16 {#reinterpretasint16}

入力値をInt16型の値として扱い、バイト再解釈を実行します。[`CAST`](#cast)とは異なり、この関数は元の値の保持を試みません。対象の型が入力型を表現できない場合、出力は無意味なものになります。

**構文**

```sql
reinterpretAsInt16(x)
```

**パラメータ**

- `x`: Int16としてバイト再解釈する値。[(U)Int\*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md)、または[FixedString](../data-types/fixedstring.md)。

**戻り値**

- Int16として再解釈された値`x`。[Int16](/sql-reference/data-types/int-uint#integer-ranges)。

**例**

クエリ:

```sql
SELECT
    toInt8(257) AS x,
    toTypeName(x),
    reinterpretAsInt16(x) AS res,
    toTypeName(res);
```

結果:

```response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ Int8          │   1 │ Int16           │
└───┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt32 {#reinterpretasint32}

入力値をInt32型の値として扱い、バイト再解釈を実行します。[`CAST`](#cast)とは異なり、この関数は元の値の保持を試みません。対象型が入力型を表現できない場合、出力は無意味なものになります。

**構文**

```sql
reinterpretAsInt32(x)
```

**パラメータ**

- `x`: Int32としてバイト再解釈する値。[(U)Int\*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md)、または[FixedString](../data-types/fixedstring.md)。

**戻り値**

- Int32として再解釈された値`x`。[Int32](/sql-reference/data-types/int-uint#integer-ranges)。

**例**

クエリ:

```sql
SELECT
    toInt16(257) AS x,
    toTypeName(x),
    reinterpretAsInt32(x) AS res,
    toTypeName(res);
```

結果:

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int16         │ 257 │ Int32           │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt64 {#reinterpretasint64}

入力値をInt64型の値として扱い、バイト再解釈を実行します。[`CAST`](#cast)とは異なり、この関数は元の値の保持を試みません。対象型が入力型を表現できない場合、出力は無意味なものになります。

**構文**

```sql
reinterpretAsInt64(x)
```

**パラメータ**

- `x`: Int64としてバイト再解釈する値。[(U)Int\*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md)、または[FixedString](../data-types/fixedstring.md)。

**戻り値**

- Int64として再解釈された値`x`。[Int64](/sql-reference/data-types/int-uint#integer-ranges)。

**例**

クエリ:

```sql
SELECT
    toInt32(257) AS x,
    toTypeName(x),
    reinterpretAsInt64(x) AS res,
    toTypeName(res);
```

結果:

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int32         │ 257 │ Int64           │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt128 {#reinterpretasint128}

入力値をInt128型の値として扱い、バイト再解釈を実行します。[`CAST`](#cast)とは異なり、この関数は元の値の保持を試みません。対象型が入力型を表現できない場合、出力は無意味になります。

**構文**

```sql
reinterpretAsInt128(x)
```

**パラメータ**

- `x`: Int128としてバイト再解釈する値。[(U)Int\*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md)、または[FixedString](../data-types/fixedstring.md)。

**戻り値**

- Int128として再解釈された値`x`。[Int128](/sql-reference/data-types/int-uint#integer-ranges)。

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

入力値をInt256型の値として扱い、バイト再解釈を実行します。[`CAST`](#cast)とは異なり、この関数は元の値の保持を試みません。対象型が入力型を表現できない場合、出力は無意味になります。

**構文**

```sql
reinterpretAsInt256(x)
```

**パラメータ**

- `x`: Int256としてバイト再解釈する値。[(U)Int\*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md)、または[FixedString](../data-types/fixedstring.md)。

**戻り値**

- Int256として再解釈された値`x`。[Int256](/sql-reference/data-types/int-uint#integer-ranges)。

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

入力値をFloat32型の値として扱い、バイト単位での再解釈を実行します。[`CAST`](#cast)とは異なり、この関数は元の値の保持を試みません。対象の型が入力型を表現できない場合、出力は無意味なものとなります。

**構文**

```sql
reinterpretAsFloat32(x)
```

**パラメータ**

- `x`: Float32として再解釈する値。[(U)Int\*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md)、または[FixedString](../data-types/fixedstring.md)。

**返り値**

- Float32として再解釈された値`x`。[Float32](../data-types/float.md)。

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

入力値をFloat64型の値として扱い、バイト単位で再解釈を行います。[`CAST`](#cast)とは異なり、この関数は元の値の保持を試みません。対象型が入力型を表現できない場合、出力は無意味なものとなります。

**構文**

```sql
reinterpretAsFloat64(x)
```

**パラメータ**

- `x`: Float64として再解釈する値。[(U)Int\*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md)、または[FixedString](../data-types/fixedstring.md)。

**戻り値**

- Float64として再解釈された値`x`。[Float64](../data-types/float.md)。

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

文字列、固定長文字列、または数値を受け取り、バイト列をホストバイトオーダー（リトルエンディアン）の数値として解釈します。解釈された数値をUnixエポック開始からの日数とみなし、日付を返します。

**構文**

```sql
reinterpretAsDate(x)
```

**パラメータ**

- `x`: Unixエポック開始からの日数。[(U)Int\*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md)、または[FixedString](../data-types/fixedstring.md)。

**戻り値**

- 日付。[Date](../data-types/date.md)。

**実装の詳細**

:::note
指定された文字列の長さが不足している場合、関数は必要な数のヌルバイトで文字列がパディングされているかのように動作します。文字列が必要以上に長い場合、余分なバイトは無視されます。
:::

**例**

クエリ:

```sql
SELECT reinterpretAsDate(65), reinterpretAsDate('A');
```

結果:

```response
┌─reinterpretAsDate(65)─┬─reinterpretAsDate('A')─┐
│            1970-03-07 │             1970-03-07 │
└───────────────────────┴────────────────────────┘
```


## reinterpretAsDateTime {#reinterpretasdatetime}

この関数は文字列を受け取り、文字列の先頭に配置されたバイトをホストバイトオーダー(リトルエンディアン)の数値として解釈します。Unixエポックの開始からの秒数として解釈された日時を返します。

**構文**

```sql
reinterpretAsDateTime(x)
```

**パラメータ**

- `x`: Unixエポックの開始からの秒数。[(U)Int\*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md)、または[FixedString](../data-types/fixedstring.md)。

**戻り値**

- 日付と時刻。[DateTime](../data-types/datetime.md)。

**実装の詳細**

:::note
指定された文字列が十分な長さでない場合、関数は必要な数のヌルバイトで文字列がパディングされているかのように動作します。文字列が必要以上に長い場合、余分なバイトは無視されます。
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


## reinterpretAsString {#reinterpretasstring}

この関数は、数値、日付、または日時を受け取り、ホストバイトオーダー(リトルエンディアン)で対応する値を表すバイト列を含む文字列を返します。末尾のNullバイトは削除されます。例えば、UInt32型の値255は1バイト長の文字列となります。

**構文**

```sql
reinterpretAsString(x)
```

**パラメータ**

- `x`: 文字列として再解釈する値。[(U)Int\*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)。

**戻り値**

- `x`を表すバイト列を含む文字列。[String](../data-types/fixedstring.md)。

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


## reinterpretAsFixedString {#reinterpretasfixedstring}

この関数は、数値、日付、または日時を受け取り、ホストバイトオーダー(リトルエンディアン)で対応する値を表すバイト列を含むFixedStringを返します。末尾のNullバイトは削除されます。例えば、UInt32型の値255は、1バイト長のFixedStringとなります。

**構文**

```sql
reinterpretAsFixedString(x)
```

**パラメータ**

- `x`: 文字列として再解釈する値。[(U)Int\*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)。

**返り値**

- `x`を表すバイト列を含む固定長文字列。[FixedString](../data-types/fixedstring.md)。

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


## reinterpretAsUUID {#reinterpretasuuid}

:::note
ここに記載されているUUID関数に加えて、専用の[UUID関数ドキュメント](../functions/uuid-functions.md)があります。
:::

16バイトの文字列を受け取り、各8バイトの半分をリトルエンディアンのバイト順で解釈してUUIDを返します。文字列が十分な長さでない場合、関数は文字列の末尾に必要な数のヌルバイトでパディングされているかのように動作します。文字列が16バイトより長い場合、末尾の余分なバイトは無視されます。

**構文**

```sql
reinterpretAsUUID(fixed_string)
```

**引数**

- `fixed_string` — ビッグエンディアンのバイト文字列。[FixedString](/sql-reference/data-types/fixedstring)。

**戻り値**

- UUID型の値。[UUID](/sql-reference/data-types/uuid)。

**例**

文字列からUUIDへの変換。

クエリ:

```sql
SELECT reinterpretAsUUID(reverse(unhex('000102030405060708090a0b0c0d0e0f')));
```

結果:

```response
┌─reinterpretAsUUID(reverse(unhex('000102030405060708090a0b0c0d0e0f')))─┐
│                                  08090a0b-0c0d-0e0f-0001-020304050607 │
└───────────────────────────────────────────────────────────────────────┘
```

文字列とUUID間の相互変換。

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

`x`の値に対して同じソースのメモリ内バイト列を使用し、それを変換先の型として再解釈します。

**構文**

```sql
reinterpret(x, type)
```

**引数**

- `x` — 任意の型。
- `type` — 変換先の型。配列の場合、配列要素の型は固定長型である必要があります。

**戻り値**

- 変換先の型の値。

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

クエリ:

```sql
SELECT reinterpret(x'3108b4403108d4403108b4403108d440', 'Array(Float32)') AS string_to_array_of_Float32;
```

結果:

```text
┌─string_to_array_of_Float32─┐
│ [5.626,6.626,5.626,6.626]  │
└────────────────────────────┘
```


## CAST {#cast}

入力値を指定されたデータ型に変換します。[reinterpret](#reinterpret)関数とは異なり、`CAST`は新しいデータ型を使用して同じ値を表現しようとします。変換ができない場合は例外が発生します。
複数の構文形式がサポートされています。

**構文**

```sql
CAST(x, T)
CAST(x AS t)
x::t
```

**引数**

- `x` — 変換する値。任意の型を指定できます。
- `T` — 変換先のデータ型の名前。[String](../data-types/string.md)型。
- `t` — 変換先のデータ型。

**戻り値**

- 変換された値。

:::note
入力値が変換先の型の範囲に収まらない場合、結果はオーバーフローします。例えば、`CAST(-1, 'UInt8')`は`255`を返します。
:::

**例**

クエリ:

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

クエリ:

```sql
SELECT
    '2016-06-15 23:00:00' AS timestamp,
    CAST(timestamp AS DateTime) AS datetime,
    CAST(timestamp AS Date) AS date,
    CAST(timestamp, 'String') AS string,
    CAST(timestamp, 'FixedString(22)') AS fixed_string;
```

結果:

```response
┌─timestamp───────────┬────────────datetime─┬───────date─┬─string──────────────┬─fixed_string──────────────┐
│ 2016-06-15 23:00:00 │ 2016-06-15 23:00:00 │ 2016-06-15 │ 2016-06-15 23:00:00 │ 2016-06-15 23:00:00\0\0\0 │
└─────────────────────┴─────────────────────┴────────────┴─────────────────────┴───────────────────────────┘
```

[FixedString (N)](../data-types/fixedstring.md)への変換は、[String](../data-types/string.md)型または[FixedString](../data-types/fixedstring.md)型の引数に対してのみ機能します。

[Nullable](../data-types/nullable.md)への型変換および逆変換がサポートされています。

**Example**

クエリ:

```sql
SELECT toTypeName(x) FROM t_null;
```

結果:

```response
┌─toTypeName(x)─┐
│ Int8          │
│ Int8          │
└───────────────┘
```

クエリ:

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

- [cast_keep_nullable](../../operations/settings/settings.md/#cast_keep_nullable)設定


## accurateCast(x, T) {#accuratecastx-t}

`x` を `T` データ型に変換します。

[cast](#cast) との違いは、`x` の値が型 `T` の範囲に収まらない場合、`accurateCast` はキャスト時に数値型のオーバーフローを許可しない点です。例えば、`accurateCast(-1, 'UInt8')` は例外をスローします。

**例**

クエリ:

```sql
SELECT cast(-1, 'UInt8') AS uint8;
```

結果:

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
Code: 70. DB::Exception: Received from localhost:9000. DB::Exception: Value in column Int8 cannot be safely converted into type UInt8: While processing accurateCast(-1, 'UInt8') AS uint8.
```


## accurateCastOrNull(x, T) {#accuratecastornullx-t}

入力値 `x` を指定されたデータ型 `T` に変換します。常に [Nullable](../data-types/nullable.md) 型を返し、キャスト値が対象型で表現できない場合は [NULL](/sql-reference/syntax#null) を返します。

**構文**

```sql
accurateCastOrNull(x, T)
```

**引数**

- `x` — 入力値。
- `T` — 返されるデータ型の名前。

**戻り値**

- 指定されたデータ型 `T` に変換された値。

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

クエリ:

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


## accurateCastOrDefault(x, T[, default_value]) {#accuratecastordefaultx-t-default_value}

入力値 `x` を指定されたデータ型 `T` に変換します。キャスト値が対象の型で表現できない場合、デフォルトの型値、または指定されている場合は `default_value` を返します。

**構文**

```sql
accurateCastOrDefault(x, T)
```

**引数**

- `x` — 入力値。
- `T` — 返されるデータ型の名前。
- `default_value` — 返されるデータ型のデフォルト値。

**戻り値**

- 指定されたデータ型 `T` に変換された値。

**例**

クエリ:

```sql
SELECT toTypeName(accurateCastOrDefault(5, 'UInt8'));
```

結果:

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

結果:

```response
┌─uint8─┬─uint8_default─┬─int8─┬─int8_default─┬─fixed_string─┬─fixed_string_default─┐
│     0 │             5 │    0 │            5 │              │ Te                   │
└───────┴───────────────┴──────┴──────────────┴──────────────┴──────────────────────┘
```


## toInterval {#toInterval}

数値と間隔単位（例：'second'または'day'）から[Interval](../../sql-reference/data-types/special-data-types/interval.md)データ型の値を作成します。

**構文**

```sql
toInterval(value, unit)
```

**引数**

- `value` — 間隔の長さ。整数、その文字列表現、または浮動小数点数。[(U)Int\*](../data-types/int-uint.md)/[Float\*](../data-types/float.md)/[String](../data-types/string.md)。

- `unit` — 作成する間隔の種類。[文字列リテラル](/sql-reference/syntax#string)。
  使用可能な値：
  - `nanosecond`
  - `microsecond`
  - `millisecond`
  - `second`
  - `minute`
  - `hour`
  - `day`
  - `week`
  - `month`
  - `quarter`
  - `year`

  `unit`引数は大文字小文字を区別しません。

**戻り値**

- 結果として得られる間隔。[Interval](../../sql-reference/data-types/special-data-types/interval.md)

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

データ型[IntervalYear](../data-types/special-data-types/interval.md)の`n`年の期間を返します。

**構文**

```sql
toIntervalYear(n)
```

**引数**

- `n` — 年数。整数またはその文字列表現、および浮動小数点数。[(U)Int\*](../data-types/int-uint.md)/[Float\*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n`年の期間。[IntervalYear](../data-types/special-data-types/interval.md)。

**例**

クエリ:

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalYear(1) AS interval_to_year
SELECT date + interval_to_year AS result
```

結果:

```response
┌─────result─┐
│ 2025-06-15 │
└────────────┘
```


## toIntervalQuarter {#tointervalquarter}

データ型[IntervalQuarter](../data-types/special-data-types/interval.md)の`n`四半期の間隔を返します。

**構文**

```sql
toIntervalQuarter(n)
```

**引数**

- `n` — 四半期数。整数またはその文字列表現、および浮動小数点数。[(U)Int\*](../data-types/int-uint.md)/[Float\*](../data-types/float.md)/[String](../data-types/string.md)。

**戻り値**

- `n`四半期の間隔。[IntervalQuarter](../data-types/special-data-types/interval.md)。

**例**

クエリ:

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalQuarter(1) AS interval_to_quarter
SELECT date + interval_to_quarter AS result
```

結果:

```response
┌─────result─┐
│ 2024-09-15 │
└────────────┘
```


## toIntervalMonth {#tointervalmonth}

データ型[IntervalMonth](../data-types/special-data-types/interval.md)の`n`ヶ月の期間を返します。

**構文**

```sql
toIntervalMonth(n)
```

**引数**

- `n` — 月数。整数またはその文字列表現、および浮動小数点数。[(U)Int\*](../data-types/int-uint.md)/[Float\*](../data-types/float.md)/[String](../data-types/string.md)。

**戻り値**

- `n`ヶ月の期間。[IntervalMonth](../data-types/special-data-types/interval.md)。

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


## toIntervalWeek {#tointervalweek}

データ型[IntervalWeek](../data-types/special-data-types/interval.md)の`n`週間の間隔を返します。

**構文**

```sql
toIntervalWeek(n)
```

**引数**

- `n` — 週数。整数またはその文字列表現、および浮動小数点数。[(U)Int\*](../data-types/int-uint.md)/[Float\*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n`週間の間隔。[IntervalWeek](../data-types/special-data-types/interval.md)。

**例**

クエリ:

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalWeek(1) AS interval_to_week
SELECT date + interval_to_week AS result
```

結果:

```response
┌─────result─┐
│ 2024-06-22 │
└────────────┘
```


## toIntervalDay {#tointervalday}

データ型[IntervalDay](../data-types/special-data-types/interval.md)の`n`日の間隔を返します。

**構文**

```sql
toIntervalDay(n)
```

**引数**

- `n` — 日数。整数またはその文字列表現、および浮動小数点数。[(U)Int\*](../data-types/int-uint.md)/[Float\*](../data-types/float.md)/[String](../data-types/string.md)。

**戻り値**

- `n`日の間隔。[IntervalDay](../data-types/special-data-types/interval.md)。

**例**

クエリ:

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalDay(5) AS interval_to_days
SELECT date + interval_to_days AS result
```

結果:

```response
┌─────result─┐
│ 2024-06-20 │
└────────────┘
```


## toIntervalHour {#tointervalhour}

データ型[IntervalHour](../data-types/special-data-types/interval.md)の`n`時間の間隔を返します。

**構文**

```sql
toIntervalHour(n)
```

**引数**

- `n` — 時間数。整数またはその文字列表現、浮動小数点数。[(U)Int\*](../data-types/int-uint.md)/[Float\*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n`時間の間隔。[IntervalHour](../data-types/special-data-types/interval.md)。

**例**

クエリ:

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalHour(12) AS interval_to_hours
SELECT date + interval_to_hours AS result
```

結果:

```response
┌──────────────result─┐
│ 2024-06-15 12:00:00 │
└─────────────────────┘
```


## toIntervalMinute {#tointervalminute}

データ型[IntervalMinute](../data-types/special-data-types/interval.md)の`n`分間の間隔を返します。

**構文**

```sql
toIntervalMinute(n)
```

**引数**

- `n` — 分数。整数またはその文字列表現、および浮動小数点数。[(U)Int\*](../data-types/int-uint.md)/[Float\*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n`分間の間隔。[IntervalMinute](../data-types/special-data-types/interval.md)。

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

データ型[IntervalSecond](../data-types/special-data-types/interval.md)の`n`秒の間隔を返します。

**構文**

```sql
toIntervalSecond(n)
```

**引数**

- `n` — 秒数。整数またはその文字列表現、浮動小数点数。[(U)Int\*](../data-types/int-uint.md)/[Float\*](../data-types/float.md)/[String](../data-types/string.md)。

**戻り値**

- `n`秒の間隔。[IntervalSecond](../data-types/special-data-types/interval.md)。

**例**

クエリ:

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalSecond(30) AS interval_to_seconds
SELECT date + interval_to_seconds AS result
```

結果:

```response
┌──────────────result─┐
│ 2024-06-15 00:00:30 │
└─────────────────────┘
```


## toIntervalMillisecond {#tointervalmillisecond}

データ型[IntervalMillisecond](../data-types/special-data-types/interval.md)の`n`ミリ秒の間隔を返します。

**構文**

```sql
toIntervalMillisecond(n)
```

**引数**

- `n` — ミリ秒数。整数またはその文字列表現、および浮動小数点数。[(U)Int\*](../data-types/int-uint.md)/[Float\*](../data-types/float.md)/[String](../data-types/string.md)。

**戻り値**

- `n`ミリ秒の間隔。[IntervalMilliseconds](../data-types/special-data-types/interval.md)。

**例**

クエリ:

```sql
WITH
    toDateTime('2024-06-15') AS date,
    toIntervalMillisecond(30) AS interval_to_milliseconds
SELECT date + interval_to_milliseconds AS result
```

結果:

```response
┌──────────────────result─┐
│ 2024-06-15 00:00:00.030 │
└─────────────────────────┘
```


## toIntervalMicrosecond {#tointervalmicrosecond}

データ型[IntervalMicrosecond](../data-types/special-data-types/interval.md)の`n`マイクロ秒の間隔を返します。

**構文**

```sql
toIntervalMicrosecond(n)
```

**引数**

- `n` — マイクロ秒数。整数、その文字列表現、または浮動小数点数。[(U)Int\*](../data-types/int-uint.md)/[Float\*](../data-types/float.md)/[String](../data-types/string.md)。

**返り値**

- `n`マイクロ秒の間隔。[IntervalMicrosecond](../data-types/special-data-types/interval.md)。

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

データ型[IntervalNanosecond](../data-types/special-data-types/interval.md)の`n`ナノ秒の間隔を返します。

**構文**

```sql
toIntervalNanosecond(n)
```

**引数**

- `n` — ナノ秒数。整数またはその文字列表現、および浮動小数点数。[(U)Int\*](../data-types/int-uint.md)/[Float\*](../data-types/float.md)/[String](../data-types/string.md)。

**戻り値**

- `n`ナノ秒の間隔。[IntervalNanosecond](../data-types/special-data-types/interval.md)。

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

[MySQL形式文字列](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format)に従って、[String](../data-types/string.md)を[DateTime](../data-types/datetime.md)に変換します。

この関数は[formatDateTime](/sql-reference/functions/date-time-functions#formatDateTime)関数の逆操作です。

**構文**

```sql
parseDateTime(str[, format[, timezone]])
```

**引数**

- `str` — 解析する文字列
- `format` — 形式文字列。省略可能。指定しない場合は`%Y-%m-%d %H:%i:%s`
- `timezone` — [タイムゾーン](operations/server-configuration-parameters/settings.md#timezone)。省略可能

**戻り値**

MySQL形式の形式文字列に従って入力文字列から解析された[DateTime](../data-types/datetime.md)値を返します。

**サポートされる形式指定子**

[formatDateTime](/sql-reference/functions/date-time-functions#formatDateTime)に記載されているすべての形式指定子(以下を除く):

- %Q: 四半期(1-4)

**例**

```sql
SELECT parseDateTime('2021-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')

┌─parseDateTime('2021-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')─┐
│                                       2021-01-04 23:00:00 │
└───────────────────────────────────────────────────────────┘
```

別名: `TO_TIMESTAMP`


## parseDateTimeOrZero {#parsedatetimeorzero}

[parseDateTime](#parsedatetime)と同じですが、処理できない日付形式に遭遇した場合はゼロ日付を返します。


## parseDateTimeOrNull {#parsedatetimeornull}

[parseDateTime](#parsedatetime)と同様ですが、処理できない日付形式に遭遇した場合は`NULL`を返します。

エイリアス: `str_to_date`


## parseDateTimeInJodaSyntax {#parsedatetimeinjodasyntax}

[parseDateTime](#parsedatetime)と同様ですが、フォーマット文字列がMySQL構文ではなく[Joda](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html)形式である点が異なります。

この関数は[formatDateTimeInJodaSyntax](/sql-reference/functions/date-time-functions#formatDateTimeInJodaSyntax)関数の逆操作です。

**構文**

```sql
parseDateTimeInJodaSyntax(str[, format[, timezone]])
```

**引数**

- `str` — パースする文字列
- `format` — フォーマット文字列。省略可能。指定しない場合は`yyyy-MM-dd HH:mm:ss`
- `timezone` — [タイムゾーン](operations/server-configuration-parameters/settings.md#timezone)。省略可能

**戻り値**

Joda形式のフォーマット文字列に従って入力文字列からパースされた[DateTime](../data-types/datetime.md)値を返します。

**サポートされるフォーマット指定子**

[`formatDateTimeInJodaSyntax`](/sql-reference/functions/date-time-functions#formatDateTimeInJodaSyntax)に記載されているすべてのフォーマット指定子がサポートされますが、以下は除きます:

- S: 秒の小数部
- z: タイムゾーン
- Z: タイムゾーンオフセット/ID

**例**

```sql
SELECT parseDateTimeInJodaSyntax('2023-02-24 14:53:31', 'yyyy-MM-dd HH:mm:ss', 'Europe/Minsk')

┌─parseDateTimeInJodaSyntax('2023-02-24 14:53:31', 'yyyy-MM-dd HH:mm:ss', 'Europe/Minsk')─┐
│                                                                     2023-02-24 14:53:31 │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```


## parseDateTimeInJodaSyntaxOrZero {#parsedatetimeinjodasyntaxorzero}

[parseDateTimeInJodaSyntax](#parsedatetimeinjodasyntax)と同様ですが、処理できない日付形式が検出された場合はゼロ日付を返します。


## parseDateTimeInJodaSyntaxOrNull {#parsedatetimeinjodasyntaxornull}

[parseDateTimeInJodaSyntax](#parsedatetimeinjodasyntax)と同様ですが、処理できない日付形式が検出された場合は`NULL`を返します。


## parseDateTime64 {#parsedatetime64}

[MySQL形式文字列](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format)に従って、[String](../data-types/string.md)を[DateTime64](../data-types/datetime64.md)に変換します。

**構文**

```sql
parseDateTime64(str[, format[, timezone]])
```

**引数**

- `str` — パース対象の文字列。
- `format` — 形式文字列。省略可能。指定しない場合は`%Y-%m-%d %H:%i:%s.%f`。
- `timezone` — [タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。省略可能。

**戻り値**

MySQL形式の形式文字列に従って入力文字列からパースされた[DateTime64](../data-types/datetime64.md)値を返します。
戻り値の精度は6です。


## parseDateTime64OrZero {#parsedatetime64orzero}

[parseDateTime64](#parsedatetime64)と同様ですが、処理できない日付形式に遭遇した場合はゼロ日付を返します。


## parseDateTime64OrNull {#parsedatetime64ornull}

[parseDateTime64](#parsedatetime64)と同じですが、処理できない日付形式に遭遇した場合は`NULL`を返します。


## parseDateTime64InJodaSyntax {#parsedatetime64injodasyntax}

[Joda形式文字列](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html)に従って、[String](../data-types/string.md)を[DateTime64](../data-types/datetime64.md)に変換します。

**構文**

```sql
parseDateTime64InJodaSyntax(str[, format[, timezone]])
```

**引数**

- `str` — 解析する文字列。
- `format` — 形式文字列。省略可能。指定しない場合は`yyyy-MM-dd HH:mm:ss`。
- `timezone` — [タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。省略可能。

**返り値**

Joda形式の形式文字列に従って入力文字列から解析された[DateTime64](../data-types/datetime64.md)値を返します。
返り値の精度は、形式文字列内の`S`プレースホルダーの数と等しくなります(ただし最大6)。


## parseDateTime64InJodaSyntaxOrZero {#parsedatetime64injodasyntaxorzero}

[parseDateTime64InJodaSyntax](#parsedatetime64injodasyntax)と同様ですが、処理できない日付形式が検出された場合はゼロ日付を返します。


## parseDateTime64InJodaSyntaxOrNull {#parsedatetime64injodasyntaxornull}

[parseDateTime64InJodaSyntax](#parsedatetime64injodasyntax)と同様ですが、処理できない日付形式に遭遇した場合は`NULL`を返します。


## parseDateTimeBestEffort {#parsedatetimebesteffort}

## parseDateTime32BestEffort {#parsedatetime32besteffort}

[String](../data-types/string.md)形式の日付と時刻を[DateTime](/sql-reference/data-types/datetime)データ型に変換します。

この関数は[ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)、[RFC 1123 - 5.2.14 RFC-822 Date and Time Specification](https://tools.ietf.org/html/rfc1123#page-55)、ClickHouse独自の形式、およびその他の日付と時刻の形式を解析します。

**構文**

```sql
parseDateTimeBestEffort(time_string [, time_zone])
```

**引数**

- `time_string` — 変換する日付と時刻を含む文字列。[String](../data-types/string.md)。
- `time_zone` — タイムゾーン。この関数は指定されたタイムゾーンに従って`time_string`を解析します。[String](../data-types/string.md)。

**サポートされる非標準形式**

- 9桁から10桁の[UNIXタイムスタンプ](https://en.wikipedia.org/wiki/Unix_time)を含む文字列。
- 日付と時刻の要素を含む文字列：`YYYYMMDDhhmmss`、`DD/MM/YYYY hh:mm:ss`、`DD-MM-YY hh:mm`、`YYYY-MM-DD hh:mm:ss`など。
- 日付のみで時刻要素を含まない文字列：`YYYY`、`YYYYMM`、`YYYY*MM`、`DD/MM/YYYY`、`DD-MM-YY`など。
- 日と時刻を含む文字列：`DD`、`DD hh`、`DD hh:mm`。この場合、`MM`は`01`に置き換えられます。
- タイムゾーンオフセット情報を含む日付と時刻の文字列：`YYYY-MM-DD hh:mm:ss ±h:mm`など。例：`2020-12-12 17:36:00 -5:00`。
- [syslogタイムスタンプ](https://datatracker.ietf.org/doc/html/rfc3164#section-4.1.2)：`Mmm dd hh:mm:ss`。例：`Jun  9 14:20:32`。

区切り文字を含むすべての形式において、この関数は月名の完全な名前または月名の最初の3文字で表現された月名を解析します。例：`24/DEC/18`、`24-Dec-18`、`01-September-2018`。
年が指定されていない場合、現在の年と等しいとみなされます。結果のDateTimeが未来になる場合(現在の時刻より1秒でも後の場合)、現在の年は前年に置き換えられます。

**戻り値**

- [DateTime](../data-types/datetime.md)データ型に変換された`time_string`。

**例**

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

クエリ:

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

クエリ:

```sql
SELECT parseDateTimeBestEffort('1284101485')
AS parseDateTimeBestEffort;
```

結果:

```response
┌─parseDateTimeBestEffort─┐
│     2015-07-07 12:04:41 │
└─────────────────────────┘
```

クエリ:

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

クエリ:

```sql
SELECT toYear(now()) AS year, parseDateTimeBestEffort('10 20:19');
```

結果:


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

結果：

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
* [ISO 8601 に関する @xkcd のアナウンス](https://xkcd.com/1179/)
* [RFC 3164](https://datatracker.ietf.org/doc/html/rfc3164#section-4.1.2)


## parseDateTimeBestEffortUS {#parsedatetimebesteffortus}

この関数は、ISO日付形式(例: `YYYY-MM-DD hh:mm:ss`)や、月と日の要素を明確に抽出できるその他の日付形式(例: `YYYYMMDDhhmmss`、`YYYY-MM`、`DD hh`、`YYYY-MM-DD hh:mm:ss ±h:mm`)に対しては、[parseDateTimeBestEffort](#parsedatetimebesteffort)と同様に動作します。月と日の要素を明確に抽出できない場合(例: `MM/DD/YYYY`、`MM-DD-YYYY`、`MM-DD-YY`)は、`DD/MM/YYYY`、`DD-MM-YYYY`、`DD-MM-YY`ではなく、米国式の日付形式を優先します。ただし例外として、月の値が12より大きく31以下の場合、この関数は[parseDateTimeBestEffort](#parsedatetimebesteffort)の動作にフォールバックします。例えば、`15/08/2020`は`2020-08-15`として解析されます。


## parseDateTimeBestEffortOrNull {#parsedatetimebesteffortornull}

## parseDateTime32BestEffortOrNull {#parsedatetime32besteffortornull}

[parseDateTimeBestEffort](#parsedatetimebesteffort)と同じですが、処理できない日付形式が検出された場合は`NULL`を返します。


## parseDateTimeBestEffortOrZero {#parsedatetimebesteffortorzero}

## parseDateTime32BestEffortOrZero {#parsedatetime32besteffortorzero}

[parseDateTimeBestEffort](#parsedatetimebesteffort)と同様ですが、処理できない日付形式に遭遇した場合は、ゼロ日付またはゼロ日時を返します。


## parseDateTimeBestEffortUSOrNull {#parsedatetimebesteffortusornull}

[parseDateTimeBestEffortUS](#parsedatetimebesteffortus)関数と同じですが、処理できない日付形式に遭遇した場合は`NULL`を返します。


## parseDateTimeBestEffortUSOrZero {#parsedatetimebesteffortusorzero}

[parseDateTimeBestEffortUS](#parsedatetimebesteffortus)関数と同じですが、処理できない日付形式に遭遇した場合は、ゼロ日付(`1970-01-01`)またはゼロ日付と時刻(`1970-01-01 00:00:00`)を返します。


## parseDateTime64BestEffort {#parsedatetime64besteffort}

[parseDateTimeBestEffort](#parsedatetimebesteffort)関数と同様ですが、ミリ秒とマイクロ秒も解析し、[DateTime](/sql-reference/data-types/datetime)データ型を返します。

**構文**

```sql
parseDateTime64BestEffort(time_string [, precision [, time_zone]])
```

**引数**

- `time_string` — 変換する日付または日時を含む文字列。[String](../data-types/string.md)。
- `precision` — 必要な精度。`3` — ミリ秒、`6` — マイクロ秒。デフォルト — `3`。オプション。[UInt8](../data-types/int-uint.md)。
- `time_zone` — [タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。関数は指定されたタイムゾーンに従って`time_string`を解析します。オプション。[String](../data-types/string.md)。

**返り値**

- [DateTime](../data-types/datetime.md)データ型に変換された`time_string`。

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

[parseDateTime64BestEffort](#parsedatetime64besteffort)と同様ですが、曖昧性がある場合、この関数は米国の日付形式（`MM/DD/YYYY`など）を優先します。


## parseDateTime64BestEffortOrNull {#parsedatetime64besteffortornull}

[parseDateTime64BestEffort](#parsedatetime64besteffort)と同じですが、処理できない日付形式に遭遇した場合は`NULL`を返します。


## parseDateTime64BestEffortOrZero {#parsedatetime64besteffortorzero}

[parseDateTime64BestEffort](#parsedatetime64besteffort)と同様ですが、処理できない日付形式に遭遇した場合は、ゼロ日付またはゼロ日時を返します。


## parseDateTime64BestEffortUSOrNull {#parsedatetime64besteffortusornull}

[parseDateTime64BestEffort](#parsedatetime64besteffort)と同様ですが、この関数は曖昧な場合に米国の日付形式（`MM/DD/YYYY`など）を優先し、処理できない日付形式が検出された場合は`NULL`を返します。


## parseDateTime64BestEffortUSOrZero {#parsedatetime64besteffortusorzero}

[parseDateTime64BestEffort](#parsedatetime64besteffort)と同様ですが、この関数は曖昧な場合に米国の日付形式（`MM/DD/YYYY`など）を優先し、処理できない日付形式が検出された場合はゼロ日付またはゼロ日時を返します。


## toLowCardinality {#tolowcardinality}

入力パラメータを同じデータ型の[LowCardinality](../data-types/lowcardinality.md)版に変換します。

`LowCardinality`データ型からデータを変換するには、[CAST](#cast)関数を使用します。例:`CAST(x as String)`。

**構文**

```sql
toLowCardinality(expr)
```

**引数**

- `expr` — [サポートされているデータ型](/sql-reference/data-types)のいずれかを返す[式](/sql-reference/syntax#expressions)。

**戻り値**

- `expr`の結果。`expr`の型の[LowCardinality](../data-types/lowcardinality.md)。

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

`String`、`Date`、または`DateTime`をUnixタイムスタンプ(`1970-01-01 00:00:00 UTC`からの秒数)として`UInt32`に変換します。

**構文**

```sql
toUnixTimestamp(date, [timezone])
```

**引数**

- `date`: 変換する値。[`Date`](/sql-reference/data-types/date)、[`Date32`](/sql-reference/data-types/date32)、[`DateTime`](/sql-reference/data-types/datetime)、[`DateTime64`](/sql-reference/data-types/datetime64)、または[`String`](/sql-reference/data-types/string)。
- `timezone`: オプション。変換に使用するタイムゾーン。指定されない場合は、サーバーのタイムゾーンが使用されます。[`String`](/sql-reference/data-types/string)

**戻り値**

Unixタイムスタンプを返します。[`UInt32`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title="クエリ"
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

```response title="レスポンス"
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

`DateTime64`を秒精度固定の`Int64`値に変換します。入力値はその精度に応じて適切にスケールアップまたはスケールダウンされます。

:::note
出力値はUTCのタイムスタンプであり、`DateTime64`のタイムゾーンのものではありません。
:::

**構文**

```sql
toUnixTimestamp64Second(value)
```

**引数**

- `value` — 任意の精度を持つDateTime64値。[DateTime64](../data-types/datetime64.md)。

**戻り値**

- `Int64`データ型に変換された`value`。[Int64](../data-types/int-uint.md)。

**例**

クエリ:

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


## toUnixTimestamp64Milli {#tounixtimestamp64milli}

`DateTime64`を固定ミリ秒精度の`Int64`値に変換します。入力値はその精度に応じて適切にスケールアップまたはスケールダウンされます。

:::note
出力値は`DateTime64`のタイムゾーンではなく、UTCのタイムスタンプです。
:::

**構文**

```sql
toUnixTimestamp64Milli(value)
```

**引数**

- `value` — 任意の精度を持つDateTime64値。[DateTime64](../data-types/datetime64.md)。

**戻り値**

- `Int64`データ型に変換された`value`。[Int64](../data-types/int-uint.md)。

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


## toUnixTimestamp64Micro {#tounixtimestamp64micro}

`DateTime64`を固定マイクロ秒精度の`Int64`値に変換します。入力値は、その精度に応じて適切にスケールアップまたはスケールダウンされます。

:::note
出力値は`DateTime64`のタイムゾーンではなく、UTCのタイムスタンプです。
:::

**構文**

```sql
toUnixTimestamp64Micro(value)
```

**引数**

- `value` — 任意の精度を持つDateTime64値。[DateTime64](../data-types/datetime64.md)。

**戻り値**

- `Int64`データ型に変換された`value`。[Int64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
WITH toDateTime64('1970-01-15 06:56:07.891011', 6, 'UTC') AS dt64
SELECT toUnixTimestamp64Micro(dt64);
```

結果:

```response
┌─toUnixTimestamp64Micro(dt64)─┐
│                1234567891011 │
└──────────────────────────────┘
```


## toUnixTimestamp64Nano {#tounixtimestamp64nano}

`DateTime64`を固定ナノ秒精度の`Int64`値に変換します。入力値はその精度に応じて適切にスケールアップまたはスケールダウンされます。

:::note
出力値は`DateTime64`のタイムゾーンではなく、UTCのタイムスタンプです。
:::

**構文**

```sql
toUnixTimestamp64Nano(value)
```

**引数**

- `value` — 任意の精度を持つDateTime64値。[DateTime64](../data-types/datetime64.md)。

**戻り値**

- `Int64`データ型に変換された`value`。[Int64](../data-types/int-uint.md)。

**例**

クエリ:

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

`Int64`を固定秒精度とオプションのタイムゾーンを持つ`DateTime64`値に変換します。入力値はその精度に応じて適切にスケールアップまたはスケールダウンされます。

:::note
入力値は、指定された(または暗黙的な)タイムゾーンのタイムスタンプではなく、UTCタイムスタンプとして扱われることに注意してください。
:::

**構文**

```sql
fromUnixTimestamp64Second(value[, timezone])
```

**引数**

- `value` — 任意の精度を持つ値。[Int64](../data-types/int-uint.md)。
- `timezone` — (オプション)結果のタイムゾーン名。[String](../data-types/string.md)。

**戻り値**

- 精度`0`のDateTime64に変換された`value`。[DateTime64](../data-types/datetime64.md)。

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


## fromUnixTimestamp64Milli {#fromunixtimestamp64milli}

`Int64`を固定ミリ秒精度とオプションのタイムゾーンを持つ`DateTime64`値に変換します。入力値はその精度に応じて適切にスケールアップまたはスケールダウンされます。

:::note
入力値は、指定された(または暗黙的な)タイムゾーンのタイムスタンプではなく、UTCタイムスタンプとして扱われることに注意してください。
:::

**構文**

```sql
fromUnixTimestamp64Milli(value[, timezone])
```

**引数**

- `value` — 任意の精度を持つ値。[Int64](../data-types/int-uint.md)。
- `timezone` — (オプション)結果のタイムゾーン名。[String](../data-types/string.md)。

**戻り値**

- 精度`3`のDateTime64に変換された`value`。[DateTime64](../data-types/datetime64.md)。

**例**

クエリ:

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

`Int64`を固定マイクロ秒精度とオプションのタイムゾーンを持つ`DateTime64`値に変換します。入力値はその精度に応じて適切にスケールアップまたはスケールダウンされます。

:::note
入力値は、指定された(または暗黙的な)タイムゾーンのタイムスタンプではなく、UTCタイムスタンプとして扱われることに注意してください。
:::

**構文**

```sql
fromUnixTimestamp64Micro(value[, timezone])
```

**引数**

- `value` — 任意の精度を持つ値。[Int64](../data-types/int-uint.md)。
- `timezone` — (オプション)結果のタイムゾーン名。[String](../data-types/string.md)。

**返り値**

- 精度`6`のDateTime64に変換された`value`。[DateTime64](../data-types/datetime64.md)。

**例**

クエリ:

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


## fromUnixTimestamp64Nano {#fromunixtimestamp64nano}

`Int64`を固定ナノ秒精度とオプションのタイムゾーンを持つ`DateTime64`値に変換します。入力値はその精度に応じて適切にスケールアップまたはスケールダウンされます。

:::note
入力値は、指定された(または暗黙的な)タイムゾーンのタイムスタンプではなく、UTCタイムスタンプとして扱われることに注意してください。
:::

**構文**

```sql
fromUnixTimestamp64Nano(value[, timezone])
```

**引数**

- `value` — 任意の精度を持つ値。[Int64](../data-types/int-uint.md)。
- `timezone` — (オプション)結果のタイムゾーン名。[String](../data-types/string.md)。

**戻り値**

- 精度`9`のDateTime64に変換された`value`。[DateTime64](../data-types/datetime64.md)。

**例**

クエリ:

```sql
WITH CAST(1733935988123456789, 'Int64') AS i64
SELECT
    fromUnixTimestamp64Nano(i64, 'UTC') AS x,
    toTypeName(x);
```

結果:

```response
┌─────────────────────────────x─┬─toTypeName(x)────────┐
│ 2024-12-11 16:53:08.123456789 │ DateTime64(9, 'UTC') │
└───────────────────────────────┴──────────────────────┘
```


## formatRow {#formatrow}

指定された形式で任意の式を文字列に変換します。

**構文**

```sql
formatRow(format, x, y, ...)
```

**引数**

- `format` — テキスト形式。例: [CSV](/interfaces/formats/CSV)、[TabSeparated (TSV)](/interfaces/formats/TabSeparated)。
- `x`,`y`, ... — 式。

**戻り値**

- 書式設定された文字列(テキスト形式の場合、通常は改行文字で終了します)。

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

**注**: 形式に接頭辞/接尾辞が含まれている場合、各行に書き込まれます。

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

注: この関数では行ベースの形式のみがサポートされています。


## formatRowNoNewline {#formatrownonewline}

任意の式を指定された形式で文字列に変換します。この関数は、末尾に `\n` が存在する場合にそれを削除する点で formatRow と異なります。

**構文**

```sql
formatRowNoNewline(format, x, y, ...)
```

**引数**

- `format` — テキスト形式。例: [CSV](/interfaces/formats/CSV)、[TabSeparated (TSV)](/interfaces/formats/TabSeparated)。
- `x`,`y`, ... — 式。

**戻り値**

- 書式化された文字列。

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

<!--
The inner content of the tags below are replaced at doc framework build time with
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
