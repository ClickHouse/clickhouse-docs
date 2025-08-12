---
description: 'Type Conversion Functionsのドキュメンテーション'
sidebar_label: '型変換'
sidebar_position: 185
slug: '/sql-reference/functions/type-conversion-functions'
title: 'Type Conversion Functions'
---





# 型変換関数
## データ変換に関する一般的な問題 {#common-issues-with-data-conversion}

ClickHouseは一般的に、[C++プログラムと同じ動作](https://en.cppreference.com/w/cpp/language/implicit_conversion)を使用します。

`to<type>`関数と[cast](#cast)は、いくつかのケースで異なる動作をします。例えば、[LowCardinality](../data-types/lowcardinality.md)の場合、[cast](#cast)は[LowCardinality](../data-types/lowcardinality.md)特性を削除し、`to<type>`関数は削除しません。同様に[Nullable](../data-types/nullable.md)でも、この動作はSQL標準と互換性がなく、[cast_keep_nullable](../../operations/settings/settings.md/#cast_keep_nullable)設定を使用して変更することができます。

:::note
データ型の値が小さいデータ型（例えば`Int64`から`Int32`へ）に変換される場合や、互換性のないデータ型（例えば`String`から`Int`へ）の間で変換される場合は、潜在的なデータ損失に注意してください。結果が期待通りであるかどうかを慎重に確認してください。
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
## toBool {#tobool}

入力値を[`Bool`](../data-types/boolean.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toBool(expr)
```

**引数**

- `expr` — 数字または文字列を返す式。 [式](/sql-reference/syntax#expressions)。

サポートされる引数:
- (U)Int8/16/32/64/128/256型の値。
- Float32/64型の値。
- 文字列`true`または`false`（大文字小文字は区別されません）。

**返される値**

- 引数の評価に基づいて`true`または`false`を返します。 [Bool](../data-types/boolean.md)。

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

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions)。

サポートされる引数:
- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

サポートされていない引数:
- Float32/64型の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例：`SELECT toInt8('0xc0fe');`。

:::note
入力値が[伊( Int8](../data-types/int-uint.md)の範囲内に表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーと見なされません。
例: `SELECT toInt8(128) == -128;`。
:::

**返される値**

- 8ビット整数値。 [Int8](../data-types/int-uint.md)。

:::note
関数は[ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数の小数部分を切り捨てます。
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

**関連事項**

- [`toInt8OrZero`](#toint8orzero)。
- [`toInt8OrNull`](#toInt8OrNull)。
- [`toInt8OrDefault`](#toint8ordefault)。
## toInt8OrZero {#toint8orzero}

[`toInt8`](#toint8)と同様に、この関数は入力値を[ Int8](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`0`を返します。

**構文**

```sql
toInt8OrZero(x)
```

**引数**

- `x` — 数字の文字列表現。 [String](../data-types/string.md)。

サポートされる引数:
- (U)Int8/16/32/128/256型の値の文字列表現。

サポートされていない引数（`0`を返します）:
- 通常のFloat32/64型の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例：`SELECT toInt8OrZero('0xc0fe');`。

:::note
入力値が[ Int8](../data-types/int-uint.md)の範囲内に表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーと見なされません。
:::

**返される値**

- 成功した場合は8ビット整数値を返し、そうでない場合は`0`を返します。 [Int8](../data-types/int-uint.md)。

:::note
関数は[ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数の小数部分を切り捨てます。
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

**関連事項**

- [`toInt8`](#toint8)。
- [`toInt8OrNull`](#toInt8OrNull)。
- [`toInt8OrDefault`](#toint8ordefault)。
## toInt8OrNull {#toInt8OrNull}

[`toInt8`](#toint8)と同様に、この関数は入力値を[ Int8](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`NULL`を返します。

**構文**

```sql
toInt8OrNull(x)
```

**引数**

- `x` — 数字の文字列表現。 [String](../data-types/string.md)。

サポートされる引数:
- (U)Int8/16/32/128/256型の値の文字列表現。

サポートされていない引数（`\N`を返します）
- Float32/64型の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例：`SELECT toInt8OrNull('0xc0fe');`。

:::note
入力値が[ Int8](../data-types/int-uint.md)の範囲内に表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーと見なされません。
:::

**返される値**

- 成功した場合は8ビット整数値を返し、そうでない場合は`NULL`を返します。 [Int8](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
関数は[ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数の小数部分を切り捨てます。
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

**関連事項**

- [`toInt8`](#toint8)。
- [`toInt8OrZero`](#toint8orzero)。
- [`toInt8OrDefault`](#toint8ordefault)。
## toInt8OrDefault {#toint8ordefault}

[`toInt8`](#toint8)と同様に、この関数は入力値を[ Int8](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
デフォルト値が指定されていない場合はエラーが発生した際に`0`が返されます。

**構文**

```sql
toInt8OrDefault(expr[, default])
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
- `default`（オプション）— `Int8`型への変換が失敗した場合に返されるデフォルト値。 [Int8](../data-types/int-uint.md)。

サポートされる引数:
- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

デフォルト値が返される引数:
- Float32/64型の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例：`SELECT toInt8OrDefault('0xc0fe', CAST('-1', 'Int8'));`。

:::note
入力値が[ Int8](../data-types/int-uint.md)の範囲内に表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーと見なされません。
:::

**返される値**

- 成功した場合は8ビット整数値を返し、そうでない場合は渡されたデフォルト値を返すか、デフォルト値が提供されていない場合は`0`を返します。 [Int8](../data-types/int-uint.md)。

:::note
- 関数は[ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数の小数部分を切り捨てます。
- デフォルト値の型はキャストする型と同じであるべきです。
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

**関連事項**

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

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions)。

サポートされる引数:
- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

サポートされていない引数:
- Float32/64型の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例：`SELECT toInt16('0xc0fe');`。

:::note
入力値が[ Int16](../data-types/int-uint.md)の範囲内に表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーと見なされません。
例: `SELECT toInt16(32768) == -32768;`。
:::

**返される値**

- 16ビット整数値。 [Int16](../data-types/int-uint.md)。

:::note
関数は[ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数の小数部分を切り捨てます。
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

**関連事項**

- [`toInt16OrZero`](#toint16orzero)。
- [`toInt16OrNull`](#toint16ornull)。
- [`toInt16OrDefault`](#toint16ordefault)。
## toInt16OrZero {#toint16orzero}

[`toInt16`](#toint16)と同様に、この関数は入力値を[ Int16](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`0`を返します。

**構文**

```sql
toInt16OrZero(x)
```

**引数**

- `x` — 数字の文字列表現。 [String](../data-types/string.md)。

サポートされる引数:
- (U)Int8/16/32/128/256型の値の文字列表現。

サポートされていない引数（`0`を返します）:
- Float32/64型の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例：`SELECT toInt16OrZero('0xc0fe');`。

:::note
入力値が[ Int16](../data-types/int-uint.md)の範囲内に表現できない場合、オーバーフローまたはアンダーフローが発生します。
これはエラーと見なされません。
:::

**返される値**

- 成功した場合は16ビット整数値を返し、そうでない場合は`0`を返します。 [Int16](../data-types/int-uint.md)。

:::note
関数は[ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数の小数部分を切り捨てます。
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

**関連事項**

- [`toInt16`](#toint16)。
- [`toInt16OrNull`](#toint16ornull)。
- [`toInt16OrDefault`](#toint16ordefault)。
## toInt16OrNull {#toint16ornull}

[`toInt16`](#toint16)と同様に、この関数は入力値を[ Int16](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`NULL`を返します。

**構文**

```sql
toInt16OrNull(x)
```

**引数**

- `x` — 数字の文字列表現。 [String](../data-types/string.md)。

サポートされる引数:
- (U)Int8/16/32/128/256型の値の文字列表現。

サポートされていない引数（`\N`を返します）
- Float32/64型の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例：`SELECT toInt16OrNull('0xc0fe');`。

:::note
入力値が[ Int16](../data-types/int-uint.md)の範囲内に表現できない場合、オーバーフローまたはアンダーフローが発生します。
これはエラーと見なされません。
:::

**返される値**

- 成功した場合は16ビット整数値を返し、そうでない場合は`NULL`を返します。 [Int16](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
関数は[ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数の小数部分を切り捨てます。
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

**関連事項**

- [`toInt16`](#toint16)。
- [`toInt16OrZero`](#toint16orzero)。
- [`toInt16OrDefault`](#toint16ordefault)。
## toInt16OrDefault {#toint16ordefault}

[`toInt16`](#toint16)と同様に、この関数は入力値を[ Int16](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
デフォルト値が指定されていない場合はエラーが発生した際に`0`が返されます。

**構文**

```sql
toInt16OrDefault(expr[, default])
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
- `default`（オプション）— `Int16`型への変換が失敗した場合に返されるデフォルト値。 [Int16](../data-types/int-uint.md)。

サポートされる引数:
- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

デフォルト値が返される引数:
- Float32/64型の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例：`SELECT toInt16OrDefault('0xc0fe', CAST('-1', 'Int16'));`。

:::note
入力値が[ Int16](../data-types/int-uint.md)の範囲内に表現できない場合、オーバーフローまたはアンダーフローが発生します。
これはエラーと見なされません。
:::

**返される値**

- 成功した場合は16ビット整数値を返し、そうでない場合は渡されたデフォルト値を返すか、デフォルト値が提供されていない場合は`0`を返します。 [Int16](../data-types/int-uint.md)。

:::note
- 関数は[ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数の小数部分を切り捨てます。
- デフォルト値の型はキャストする型と同じであるべきです。
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

**関連事項**

- [`toInt16`](#toint16)。
- [`toInt16OrZero`](#toint16orzero)。
- [`toInt16OrNull`](#toint16ornull)。
## toInt32 {#toint32}

入力値を[`Int32`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toInt32(expr)
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions)。

サポートされる引数:
- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

サポートされていない引数:
- Float32/64型の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例：`SELECT toInt32('0xc0fe');`。

:::note
入力値が[ Int32](../data-types/int-uint.md)の範囲内に表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーと見なされません。
例: `SELECT toInt32(2147483648) == -2147483648;`
:::

**返される値**

- 32ビット整数値。 [Int32](../data-types/int-uint.md)。

:::note
関数は[ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数の小数部分を切り捨てます。
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

**関連事項**

- [`toInt32OrZero`](#toint32orzero)。
- [`toInt32OrNull`](#toint32ornull)。
- [`toInt32OrDefault`](#toint32ordefault)。
## toInt32OrZero {#toint32orzero}

[`toInt32`](#toint32)と同様に、この関数は入力値を[ Int32](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`0`を返します。

**構文**

```sql
toInt32OrZero(x)
```

**引数**

- `x` — 数字の文字列表現。 [String](../data-types/string.md)。

サポートされる引数:
- (U)Int8/16/32/128/256型の値の文字列表現。

サポートされていない引数（`0`を返します）:
- Float32/64型の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例：`SELECT toInt32OrZero('0xc0fe');`。

:::note
入力値が[ Int32](../data-types/int-uint.md)の範囲内に表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーと見なされません。
:::

**返される値**

- 成功した場合は32ビット整数値を返し、そうでない場合は`0`を返します。 [Int32](../data-types/int-uint.md)

:::note
関数は[ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数の小数部分を切り捨てます。
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
**関連事項**

- [`toInt32`](#toint32)。
- [`toInt32OrNull`](#toint32ornull)。
- [`toInt32OrDefault`](#toint32ordefault)。
## toInt32OrNull {#toint32ornull}

[`toInt32`](#toint32)と同様に、この関数は入力値を[ Int32](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`NULL`を返します。

**構文**

```sql
toInt32OrNull(x)
```

**引数**

- `x` — 数字の文字列表現。 [String](../data-types/string.md)。

サポートされる引数:
- (U)Int8/16/32/128/256型の値の文字列表現。

サポートされていない引数（`\N`を返します）
- Float32/64型の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例：`SELECT toInt32OrNull('0xc0fe');`。

:::note
入力値が[ Int32](../data-types/int-uint.md)の範囲内に表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーと見なされません。
:::

**返される値**

- 成功した場合は32ビット整数値を返し、そうでない場合は`NULL`を返します。 [Int32](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
関数は[ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数の小数部分を切り捨てます。
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

**関連事項**

- [`toInt32`](#toint32)。
- [`toInt32OrZero`](#toint32orzero)。
- [`toInt32OrDefault`](#toint32ordefault)。
## toInt32OrDefault {#toint32ordefault}

[`toInt32`](#toint32)と同様に、この関数は入力値を[ Int32](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
デフォルト値が指定されていない場合はエラーが発生した際に`0`が返されます。

**構文**

```sql
toInt32OrDefault(expr[, default])
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
- `default`（オプション）— `Int32`型への変換が失敗した場合に返されるデフォルト値。 [Int32](../data-types/int-uint.md)。

サポートされる引数:
- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

デフォルト値が返される引数:
- Float32/64型の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例：`SELECT toInt32OrDefault('0xc0fe', CAST('-1', 'Int32'));`。

:::note
入力値が[ Int32](../data-types/int-uint.md)の範囲内に表現できない場合、オーバーフローまたはアンダーフローが発生します。
これはエラーと見なされません。
:::

**返される値**

- 成功した場合は32ビット整数値を返し、そうでない場合は渡されたデフォルト値を返すか、デフォルト値が提供されていない場合は`0`を返します。 [Int32](../data-types/int-uint.md)。

:::note
- 関数は[ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数の小数部分を切り捨てます。
- デフォルト値の型はキャストする型と同じであるべきです。
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

**関連事項**

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

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions)。

サポートされる引数:
- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

サポートされていないタイプ:
- Float32/64型の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例：`SELECT toInt64('0xc0fe');`。

:::note
入力値が[ Int64](../data-types/int-uint.md)の範囲内に表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーと見なされません。
例: `SELECT toInt64(9223372036854775808) == -9223372036854775808;`
:::

**返される値**

- 64ビット整数値。 [Int64](../data-types/int-uint.md)。

:::note
関数は[ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数の小数部分を切り捨てます。
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

**関連事項**

- [`toInt64OrZero`](#toint64orzero)。
- [`toInt64OrNull`](#toint64ornull)。
- [`toInt64OrDefault`](#toint64ordefault)。
## toInt64OrZero {#toint64orzero}

[`toInt64`](#toint64)と同様に、この関数は入力値を[ Int64](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`0`を返します。

**構文**

```sql
toInt64OrZero(x)
```

**引数**

- `x` — 数字の文字列表現。 [String](../data-types/string.md)。

サポートされる引数:
- (U)Int8/16/32/128/256型の値の文字列表現。

サポートされていない引数（`0`を返します）:
- Float32/64型の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例：`SELECT toInt64OrZero('0xc0fe');`。

:::note
入力値が[ Int64](../data-types/int-uint.md)の範囲内に表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーと見なされません。
:::

**返される値**

- 成功した場合は64ビット整数値を返し、そうでない場合は`0`を返します。 [Int64](../data-types/int-uint.md)。

:::note
関数は[ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数の小数部分を切り捨てます。
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

**関連事項**

- [`toInt64`](#toint64)。
- [`toInt64OrNull`](#toint64ornull)。
- [`toInt64OrDefault`](#toint64ordefault)。
## toInt64OrNull {#toint64ornull}

[`toInt64`](#toint64)と同様に、この関数は入力値を[ Int64](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`NULL`を返します。

**構文**

```sql
toInt64OrNull(x)
```

**引数**

- `x` — 数字の文字列表現。 [式](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

サポートされる引数:
- (U)Int8/16/32/128/256型の値の文字列表現。

サポートされていない引数（`\N`を返します）
- Float32/64型の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例：`SELECT toInt64OrNull('0xc0fe');`。

:::note
入力値が[ Int64](../data-types/int-uint.md)の範囲内に表現できない場合、オーバーフローまたはアンダーフローが発生します。
これはエラーと見なされません。
:::

**返される値**

- 成功した場合は64ビット整数値を返し、そうでない場合は`NULL`を返します。 [Int64](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
関数は[ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数の小数部分を切り捨てます。
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

**関連事項**

- [`toInt64`](#toint64)。
- [`toInt64OrZero`](#toint64orzero)。
- [`toInt64OrDefault`](#toint64ordefault)。
## toInt64OrDefault {#toint64ordefault}

[`toInt64`](#toint64)と同様に、この関数は入力値を[ Int64](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
デフォルト値が指定されていない場合はエラーが発生した際に`0`が返されます。

**構文**

```sql
toInt64OrDefault(expr[, default])
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
- `default`（オプション）— `Int64`型への変換が失敗した場合に返されるデフォルト値。 [Int64](../data-types/int-uint.md)。

サポートされる引数:
- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

デフォルト値が返される引数:
- Float32/64型の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例：`SELECT toInt64OrDefault('0xc0fe', CAST('-1', 'Int64'));`。

:::note
入力値が[ Int64](../data-types/int-uint.md)の範囲内に表現できない場合、オーバーフローまたはアンダーフローが発生します。
これはエラーと見なされません。
:::

**返される値**

- 成功した場合は64ビット整数値を返し、そうでない場合は渡されたデフォルト値を返すか、デフォルト値が提供されていない場合は`0`を返します。 [Int64](../data-types/int-uint.md)。

:::note
- 関数は[ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数の小数部分を切り捨てます。
- デフォルト値の型はキャストする型と同じであるべきです。
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

**関連事項**

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

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions)。

サポートされる引数:
- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

サポートされていない引数:
- Float32/64型の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例：`SELECT toInt128('0xc0fe');`。

:::note
入力値が[ Int128](../data-types/int-uint.md)の範囲内に表現できない場合、オーバーフローまたはアンダーフローが発生します。
これはエラーと見なされません。
:::

**返される値**

- 128ビット整数値。 [Int128](../data-types/int-uint.md)。

:::note
関数は[ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数の小数部分を切り捨てます。
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

**関連事項**

- [`toInt128OrZero`](#toint128orzero)。
- [`toInt128OrNull`](#toint128ornull)。
- [`toInt128OrDefault`](#toint128ordefault)。
```

## toInt128OrZero {#toint128orzero}

[`toInt128`](#toint128) と同様に、この関数は入力値を [Int128](../data-types/int-uint.md) 型に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toInt128OrZero(expr)
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions) / [文字列](../data-types/string.md)。

サポートされている引数:
- (U)Int8/16/32/128/256 の文字列表現。

サポートされていない引数（`0`を返す）:
- Float32/64 値の文字列表現、`NaN` および `Inf` を含む。
- バイナリおよび16進数の文字列表現、例: `SELECT toInt128OrZero('0xc0fe');`。

:::note
入力値が [Int128](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は 128 ビット整数値、それ以外の場合は `0` を返します。 [Int128](../data-types/int-uint.md)。

:::note
この関数は [ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用し、数字の小数点以下の桁を切り捨てます。
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

[`toInt128`](#toint128) と同様に、この関数は入力値を [Int128](../data-types/int-uint.md) 型に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toInt128OrNull(x)
```

**引数**

- `x` — 数字の文字列表現。 [式](/sql-reference/syntax#expressions) / [文字列](../data-types/string.md)。

サポートされている引数:
- (U)Int8/16/32/128/256 の文字列表現。

サポートされていない引数（`\N` を返す）:
- Float32/64 値の文字列表現、`NaN` および `Inf` を含む。
- バイナリおよび16進数の文字列表現、例: `SELECT toInt128OrNull('0xc0fe');`。

:::note
入力値が [Int128](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は 128 ビット整数値、それ以外の場合は `NULL` を返します。 [Int128](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は [ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用し、数字の小数点以下の桁を切り捨てます。
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

[`toInt128`](#toint128) と同様に、この関数は入力値を [Int128](../data-types/int-uint.md) 型に変換しますが、エラーが発生した場合はデフォルト値を返します。
デフォルト値が指定されていない場合、エラーが発生した場合は `0` が返されます。

**構文**

```sql
toInt128OrDefault(expr[, default])
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions) / [文字列](../data-types/string.md)。
- `default` (オプション) — `Int128` 型への解析が失敗した場合に返されるデフォルト値。 [Int128](../data-types/int-uint.md)。

サポートされている引数:
- (U)Int8/16/32/64/128/256 の値または文字列表現。
- Float32/64 の値。
- (U)Int8/16/32/128/256 の文字列表現。

デフォルト値が返される引数:
- Float32/64 値の文字列表現、`NaN` および `Inf` を含む。
- バイナリおよび16進数の文字列表現、例: `SELECT toInt128OrDefault('0xc0fe', CAST('-1', 'Int128'));`。

:::note
入力値が [Int128](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は 128 ビット整数値、それ以外の場合はデフォルト値が指定された場合はそれを返し、指定されていない場合は `0` を返します。 [Int128](../data-types/int-uint.md)。

:::note
- この関数は [ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用し、数字の小数点以下の桁を切り捨てます。
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

入力値を [`Int256`](../data-types/int-uint.md) 型に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toInt256(expr)
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions)。

サポートされている引数:
- (U)Int8/16/32/64/128/256 の値または文字列表現。
- Float32/64 の値。

サポートされていない引数:
- Float32/64 値の文字列表現、`NaN` および `Inf` を含む。
- バイナリおよび16進数の文字列表現、例: `SELECT toInt256('0xc0fe');`。

:::note
入力値が [Int256](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 256 ビット整数値。 [Int256](../data-types/int-uint.md)。

:::note
この関数は [ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用し、数字の小数点以下の桁を切り捨てます。
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

[`toInt256`](#toint256) と同様に、この関数は入力値を [Int256](../data-types/int-uint.md) 型に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toInt256OrZero(x)
```

**引数**

- `x` — 数字の文字列表現。 [文字列](../data-types/string.md)。

サポートされている引数:
- (U)Int8/16/32/128/256 の文字列表現。

サポートされていない引数（`0`を返す）:
- Float32/64 値の文字列表現，`NaN` および `Inf` を含む。
- バイナリおよび16進数の文字列表現、例: `SELECT toInt256OrZero('0xc0fe');`。

:::note
入力値が [Int256](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は 256 ビット整数値、それ以外の場合は `0` を返します。 [Int256](../data-types/int-uint.md)。

:::note
この関数は [ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用し、数字の小数点以下の桁を切り捨てます。
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

[`toInt256`](#toint256) と同様に、この関数は入力値を [Int256](../data-types/int-uint.md) 型に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toInt256OrNull(x)
```

**引数**

- `x` — 数字の文字列表現。 [文字列](../data-types/string.md)。

サポートされている引数:
- (U)Int8/16/32/128/256 の文字列表現。

サポートされていない引数（`\N` を返す）:
- Float32/64 値の文字列表現，`NaN` および `Inf` を含む。
- バイナリおよび16進数の文字列表現、例: `SELECT toInt256OrNull('0xc0fe');`。

:::note
入力値が [Int256](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は 256 ビット整数値、それ以外の場合は `NULL` を返します。 [Int256](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は [ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用し、数字の小数点以下の桁を切り捨てます。
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

- [`toInt256`](#toint256)。
- [`toInt256OrZero`](#toint256orzero)。
- [`toInt256OrDefault`](#toint256ordefault)。

## toInt256OrDefault {#toint256ordefault}

[`toInt256`](#toint256) と同様に、この関数は入力値を [Int256](../data-types/int-uint.md) 型に変換しますが、エラーが発生した場合はデフォルト値を返します。
デフォルト値が指定されていない場合、エラーが発生した場合は `0` が返されます。

**構文**

```sql
toInt256OrDefault(expr[, default])
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions) / [文字列](../data-types/string.md)。
- `default` (オプション) — `Int256` 型への解析が失敗した場合に返されるデフォルト値。 [Int256](../data-types/int-uint.md)。

サポートされている引数:
- (U)Int8/16/32/64/128/256 の値または文字列表現。
- Float32/64 の値。

デフォルト値が返される引数:
- Float32/64 値の文字列表現、`NaN` および `Inf` を含む。
- バイナリおよび16進数の文字列表現、例: `SELECT toInt256OrDefault('0xc0fe', CAST('-1', 'Int256'));`。

:::note
入力値が [Int256](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は 256 ビット整数値、それ以外の場合はデフォルト値が指定された場合はそれを返し、指定されていない場合は `0` を返します。 [Int256](../data-types/int-uint.md)。

:::note
- この関数は [ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用し、数字の小数点以下の桁を切り捨てます。
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

入力値を [`UInt8`](../data-types/int-uint.md) 型に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toUInt8(expr)
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions)。

サポートされている引数:
- (U)Int8/16/32/64/128/256 の値または文字列表現。
- Float32/64 の値。

サポートされていない引数:
- Float32/64 値の文字列表現、`NaN` および `Inf` を含む。
- バイナリおよび16進数の文字列表現、例: `SELECT toUInt8('0xc0fe');`。

:::note
入力値が [UInt8](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
例えば: `SELECT toUInt8(256) == 0;`。
:::

**返される値**

- 8 ビット符号なし整数値。 [UInt8](../data-types/int-uint.md)。

:::note
この関数は [ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用し、数字の小数点以下の桁を切り捨てます。
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

[`toUInt8`](#touint8) と同様に、この関数は入力値を [UInt8](../data-types/int-uint.md) 型に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toUInt8OrZero(x)
```

**引数**

- `x` — 数字の文字列表現。 [文字列](../data-types/string.md)。

サポートされている引数:
- (U)Int8/16/32/128/256 の文字列表現。

サポートされていない引数（`0`を返す）:
- 通常の Float32/64 値の文字列表現、`NaN` および `Inf` を含む。
- バイナリおよび16進数の文字列表現、例: `SELECT toUInt8OrZero('0xc0fe');`。

:::note
入力値が [UInt8](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は 8 ビット符号なし整数値、それ以外の場合は `0` を返します。 [UInt8](../data-types/int-uint.md)。

:::note
この関数は [ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用し、数字の小数点以下の桁を切り捨てます。
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

[`toUInt8`](#touint8) と同様に、この関数は入力値を [UInt8](../data-types/int-uint.md) 型に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toUInt8OrNull(x)
```

**引数**

- `x` — 数字の文字列表現。 [文字列](../data-types/string.md)。

サポートされている引数:
- (U)Int8/16/32/128/256 の文字列表現。

サポートされていない引数（`\N` を返す）:
- Float32/64 値の文字列表現、`NaN` および `Inf` を含む。
- バイナリおよび16進数の文字列表現、例: `SELECT toUInt8OrNull('0xc0fe');`。

:::note
入力値が [UInt8](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は 8 ビット符号なし整数値、それ以外の場合は `NULL` を返します。 [UInt8](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は [ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用し、数字の小数点以下の桁を切り捨てます。
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

- [`toUInt8`](#touint8)。
- [`toUInt8OrZero`](#touint8orzero)。
- [`toUInt8OrDefault`](#touint8ordefault)。

## toUInt8OrDefault {#touint8ordefault}

[`toUInt8`](#touint8) と同様に、この関数は入力値を [UInt8](../data-types/int-uint.md) 型に変換しますが、エラーが発生した場合はデフォルト値を返します。
デフォルト値が指定されていない場合、エラーが発生した場合は `0` が返されます。

**構文**

```sql
toUInt8OrDefault(expr[, default])
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions) / [文字列](../data-types/string.md)。
- `default` (オプション) — `UInt8` 型への解析が失敗した場合に返されるデフォルト値。 [UInt8](../data-types/int-uint.md)。

サポートされている引数:
- (U)Int8/16/32/64/128/256 の値または文字列表現。
- Float32/64 の値。

デフォルト値が返される引数:
- Float32/64 値の文字列表現、`NaN` および `Inf` を含む。
- バイナリおよび16進数の文字列表現、例: `SELECT toUInt8OrDefault('0xc0fe', CAST('0', 'UInt8'));`。

:::note
入力値が [UInt8](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は 8 ビット符号なし整数値、それ以外の場合はデフォルト値が指定された場合はそれを返し、指定されていない場合は `0` を返します。 [UInt8](../data-types/int-uint.md)。

:::note
- この関数は [ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用し、数字の小数点以下の桁を切り捨てます。
- デフォルト値の型はキャスト型と同じである必要があります。
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

入力値を [`UInt16`](../data-types/int-uint.md) 型に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toUInt16(expr)
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions)。

サポートされている引数:
- (U)Int8/16/32/64/128/256 の値または文字列表現。
- Float32/64 の値。

サポートされていない引数:
- Float32/64 値の文字列表現、`NaN` および `Inf` を含む。
- バイナリおよび16進数の文字列表現、例: `SELECT toUInt16('0xc0fe');`。

:::note
入力値が [UInt16](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
例えば: `SELECT toUInt16(65536) == 0;`。
:::

**返される値**

- 16 ビット符号なし整数値。 [UInt16](../data-types/int-uint.md)。

:::note
この関数は [ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用し、数字の小数点以下の桁を切り捨てます。
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

[`toUInt16`](#touint16) と同様に、この関数は入力値を [UInt16](../data-types/int-uint.md) 型に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toUInt16OrZero(x)
```

**引数**

- `x` — 数字の文字列表現。 [文字列](../data-types/string.md)。

サポートされている引数:
- (U)Int8/16/32/128/256 の文字列表現。

サポートされていない引数（`0`を返す）:
- Float32/64 値の文字列表現、`NaN` および `Inf` を含む。
- バイナリおよび16進数の文字列表現、例: `SELECT toUInt16OrZero('0xc0fe');`。

:::note
入力値が [UInt16](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は 16 ビット符号なし整数値、それ以外の場合は `0` を返します。 [UInt16](../data-types/int-uint.md)。

:::note
この関数は [ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用し、数字の小数点以下の桁を切り捨てます。
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

- [`toUInt16`](#touint16)。
- [`toUInt16OrNull`](#touint16ornull)。
- [`toUInt16OrDefault`](#touint16ordefault)。

## toUInt16OrNull {#touint16ornull}

[`toUInt16`](#touint16) と同様に、この関数は入力値を [UInt16](../data-types/int-uint.md) 型に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toUInt16OrNull(x)
```

**引数**

- `x` — 数字の文字列表現。 [文字列](../data-types/string.md)。

サポートされている引数:
- (U)Int8/16/32/128/256 の文字列表現。

サポートされていない引数（`\N` を返す）:
- Float32/64 値の文字列表現、`NaN` および `Inf` を含む。
- バイナリおよび16進数の文字列表現、例: `SELECT toUInt16OrNull('0xc0fe');`。

:::note
入力値が [UInt16](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は 16 ビット符号なし整数値、それ以外の場合は `NULL` を返します。 [UInt16](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は [ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用し、数字の小数点以下の桁を切り捨てます。
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

- [`toUInt16`](#touint16)。
- [`toUInt16OrZero`](#touint16orzero)。
- [`toUInt16OrDefault`](#touint16ordefault)。

## toUInt16OrDefault {#touint16ordefault}

[`toUInt16`](#touint16) と同様に、この関数は入力値を [UInt16](../data-types/int-uint.md) 型に変換しますが、エラーが発生した場合はデフォルト値を返します。
デフォルト値が指定されていない場合、エラーが発生した場合は `0` が返されます。

**構文**

```sql
toUInt16OrDefault(expr[, default])
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions) / [文字列](../data-types/string.md)。
- `default` (オプション) — `UInt16` 型への解析が失敗した場合に返されるデフォルト値。 [UInt16](../data-types/int-uint.md)。

サポートされている引数:
- (U)Int8/16/32/64/128/256 の値または文字列表現。
- Float32/64 の値。

デフォルト値が返される引数:
- Float32/64 値の文字列表現、`NaN` および `Inf` を含む。
- バイナリおよび16進数の文字列表現、例: `SELECT toUInt16OrDefault('0xc0fe', CAST('0', 'UInt16'));`。

:::note
入力値が [UInt16](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は 16 ビット符号なし整数値、それ以外の場合はデフォルト値が指定された場合はそれを返し、指定されていない場合は `0` を返します。 [UInt16](../data-types/int-uint.md)。

:::note
- この関数は [ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用し、数字の小数点以下の桁を切り捨てます。
- デフォルト値の型はキャスト型と同じである必要があります。
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

入力値を [`UInt32`](../data-types/int-uint.md) 型に変換します。エラーが発生した場合は例外をスローします。

**構文**

```sql
toUInt32(expr)
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions)。

サポートされている引数:
- (U)Int8/16/32/64/128/256 の値または文字列表現。
- Float32/64 の値。

サポートされていない引数:
- Float32/64 値の文字列表現、`NaN` および `Inf` を含む。
- バイナリおよび16進数の文字列表現、例: `SELECT toUInt32('0xc0fe');`。

:::note
入力値が [UInt32](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
例えば: `SELECT toUInt32(4294967296) == 0;`
:::

**返される値**

- 32 ビット符号なし整数値。 [UInt32](../data-types/int-uint.md)。

:::note
この関数は [ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) を使用し、数字の小数点以下の桁を切り捨てます。
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

[`toUInt32`](#touint32) と同様に、この関数は入力値を [UInt32](../data-types/int-uint.md) 型に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toUInt32OrZero(x)
```

**引数**

- `x` — 数字の文字列表現。 [文字列](../data-types/string.md)。

サポートされている引数:
- (U)Int8/16/32/128/256 の文字列表現。

サポートされていない引数（`0`を返す）:
- Float32/64 値の文字列表現、`NaN` および `Inf` を含む。
- バイナリおよび16進数の文字列表現、例: `SELECT toUInt32OrZero('0xc0fe');`。

:::note
入力値が [UInt32](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は 32 ビット符号なし整数値、それ以外の場合は `0` を返します。 [UInt32](../data-types/int-uint.md)

:::note
この関数は [ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)
, 意味する数字の小数点以下の桁を切り捨てます。
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

- [`toUInt32`](#touint32)。
- [`toUInt32OrNull`](#touint32ornull)。
- [`toUInt32OrDefault`](#touint32ordefault)。

## toUInt32OrNull {#touint32ornull}

[`toUInt32`](#touint32) と同様に、この関数は入力値を [UInt32](../data-types/int-uint.md) 型に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toUInt32OrNull(x)
```

**引数**

- `x` — 数字の文字列表現。 [文字列](../data-types/string.md)。

サポートされている引数:
- (U)Int8/16/32/128/256 の文字列表現。

サポートされていない引数（`\N` を返す）:
- Float32/64 値の文字列表現、`NaN` および `Inf` を含む。
- バイナリおよび16進数の文字列表現、例: `SELECT toUInt32OrNull('0xc0fe');`。

:::note
入力値が [UInt32](../data-types/int-uint.md) の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は 32 ビット符号なし整数値、それ以外の場合は `NULL` を返します。 [UInt32](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は [ゼロに向かって丸める](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)
, 意味する数字の小数点以下の桁を切り捨てます。
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

- [`toUInt32`](#touint32)。
- [`toUInt32OrZero`](#touint32orzero)。
- [`toUInt32OrDefault`](#touint32ordefault)。
```
## toUInt32OrDefault {#touint32ordefault}

[`toUInt32`](#touint32)と同様に、この関数は入力値を[UInt32](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
デフォルト値が指定されていない場合は、エラーが発生した場合に`0`が返されます。

**構文**

```sql
toUInt32OrDefault(expr[, default])
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。 [式](/sql-reference/syntax#expressions) / [文字列](../data-types/string.md)。
- `default`（オプション）— `UInt32`型へのパースに失敗した場合に返されるデフォルト値。 [UInt32](../data-types/int-uint.md)。

サポートされている引数:
- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

デフォルト値が返される引数:
- `NaN`や`Inf`を含むFloat32/64の文字列表現。
- `SELECT toUInt32OrDefault('0xc0fe', CAST('0', 'UInt32'));`のような2進数および16進数の文字列表現。

:::note
入力値が[UInt32](../data-types/int-uint.md)の範囲内に表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は32ビットの符号なし整数値、そうでなければ指定されたデフォルト値、または指定されていない場合は`0`が返されます。 [UInt32](../data-types/int-uint.md)。

:::note
- 関数は[ゼロに向かって切り捨て](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、これにより数値の小数点以下が切り捨てられます。
- デフォルト値の型はキャストされた型と同じである必要があります。
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

- `expr` — 数値または数値の文字列表現を返す式。 [式](/sql-reference/syntax#expressions)。

サポートされている引数:
- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

サポートされていない型:
- `NaN`や`Inf`を含むFloat32/64の文字列表現。
- `SELECT toUInt64('0xc0fe');`のような2進数および16進数の文字列表現。

:::note
入力値が[UInt64](../data-types/int-uint.md)の範囲内に表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
例えば: `SELECT toUInt64(18446744073709551616) == 0;`
:::

**返される値**

- 64ビットの符号なし整数値。 [UInt64](../data-types/int-uint.md)。

:::note
関数は[ゼロに向かって切り捨て](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、これにより数値の小数点以下が切り捨てられます。
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

- `x` — 数値を表す文字列。 [文字列](../data-types/string.md)。

サポートされている引数:
- (U)Int8/16/32/128/256の文字列表現。

サポートされていない引数（`0`を返す）:
- `NaN`や`Inf`を含むFloat32/64の文字列表現。
- `SELECT toUInt64OrZero('0xc0fe');`のような2進数および16進数の文字列表現。

:::note
入力値が[UInt64](../data-types/int-uint.md)の範囲内に表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は64ビットの符号なし整数値、それ以外の場合は`0`。 [UInt64](../data-types/int-uint.md)。

:::note
関数は[ゼロに向かって切り捨て](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、これにより数値の小数点以下が切り捨てられます。
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

- [`toUInt64`](#touint64)。
- [`toUInt64OrNull`](#touint64ornull)。
- [`toUInt64OrDefault`](#touint64ordefault)。

## toUInt64OrNull {#touint64ornull}

[`toUInt64`](#touint64)と同様に、この関数は入力値を[UInt64](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は`NULL`を返します。

**構文**

```sql
toUInt64OrNull(x)
```

**引数**

- `x` — 数値を表す文字列。 [式](/sql-reference/syntax#expressions) / [文字列](../data-types/string.md)。

サポートされている引数:
- (U)Int8/16/32/128/256の文字列表現。

サポートされていない引数（`\N`を返す）:
- `NaN`や`Inf`を含むFloat32/64の文字列表現。
- `SELECT toUInt64OrNull('0xc0fe');`のような2進数および16進数の文字列表現。

:::note
入力値が[UInt64](../data-types/int-uint.md)の範囲内に表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は64ビットの符号なし整数値、それ以外の場合は`NULL`。 [UInt64](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
関数は[ゼロに向かって切り捨て](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、これにより数値の小数点以下が切り捨てられます。
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

- [`toUInt64`](#touint64)。
- [`toUInt64OrZero`](#touint64orzero)。
- [`toUInt64OrDefault`](#touint64ordefault)。

## toUInt64OrDefault {#touint64ordefault}

[`toUInt64`](#touint64)と同様に、この関数は入力値を[UInt64](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
デフォルト値が指定されていない場合は、エラーが発生した場合に`0`が返されます。

**構文**

```sql
toUInt64OrDefault(expr[, default])
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。 [式](/sql-reference/syntax#expressions) / [文字列](../data-types/string.md)。
- `default`（オプション）— `UInt64`型へのパースに失敗した場合に返されるデフォルト値。 [UInt64](../data-types/int-uint.md)。

サポートされている引数:
- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

デフォルト値が返される引数:
- `NaN`や`Inf`を含むFloat32/64の文字列表現。
- `SELECT toUInt64OrDefault('0xc0fe', CAST('0', 'UInt64'));`のような2進数および16進数の文字列表現。

:::note
入力値が[UInt64](../data-types/int-uint.md)の範囲内に表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は64ビットの符号なし整数値、それ以外の場合は指定されたデフォルト値、または指定されていない場合は`0`が返されます。 [UInt64](../data-types/int-uint.md)。

:::note
- 関数は[ゼロに向かって切り捨て](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、これにより数値の小数点以下が切り捨てられます。
- デフォルト値の型はキャストされた型と同じである必要があります。
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

- `expr` — 数値または数値の文字列表現を返す式。 [式](/sql-reference/syntax#expressions)。

サポートされている引数:
- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

サポートされていない引数:
- `NaN`や`Inf`を含むFloat32/64の文字列表現。
- `SELECT toUInt128('0xc0fe');`のような2進数および16進数の文字列表現。

:::note
入力値が[UInt128](../data-types/int-uint.md)の範囲内に表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 128ビットの符号なし整数値。 [UInt128](../data-types/int-uint.md)。

:::note
関数は[ゼロに向かって切り捨て](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、これにより数値の小数点以下が切り捨てられます。
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

- `expr` — 数値または数値の文字列表現を返す式。 [式](/sql-reference/syntax#expressions) / [文字列](../data-types/string.md)。

サポートされている引数:
- (U)Int8/16/32/128/256の文字列表現。

サポートされていない引数（`0`を返す）:
- `NaN`や`Inf`を含むFloat32/64の文字列表現。
- `SELECT toUInt128OrZero('0xc0fe');`のような2進数および16進数の文字列表現。

:::note
入力値が[UInt128](../data-types/int-uint.md)の範囲内に表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は128ビットの符号なし整数値、それ以外の場合は`0`。 [UInt128](../data-types/int-uint.md)。

:::note
関数は[ゼロに向かって切り捨て](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、これにより数値の小数点以下が切り捨てられます。
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

- `x` — 数値を表す文字列。 [式](/sql-reference/syntax#expressions) / [文字列](../data-types/string.md)。

サポートされている引数:
- (U)Int8/16/32/128/256の文字列表現。

サポートされていない引数（`\N`を返す）:
- `NaN`や`Inf`を含むFloat32/64の文字列表現。
- `SELECT toUInt128OrNull('0xc0fe');`のような2進数および16進数の文字列表現。

:::note
入力値が[UInt128](../data-types/int-uint.md)の範囲内に表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は128ビットの符号なし整数値、それ以外の場合は`NULL`。 [UInt128](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
関数は[ゼロに向かって切り捨て](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、これにより数値の小数点以下が切り捨てられます。
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
デフォルト値が指定されていない場合は、エラーが発生した場合に`0`が返されます。

**構文**

```sql
toUInt128OrDefault(expr[, default])
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。 [式](/sql-reference/syntax#expressions) / [文字列](../data-types/string.md)。
- `default`（オプション）— `UInt128`型へのパースに失敗した場合に返されるデフォルト値。 [UInt128](../data-types/int-uint.md)。

サポートされている引数:
- (U)Int8/16/32/64/128/256。
- Float32/64。
- (U)Int8/16/32/128/256の文字列表現。

デフォルト値が返される引数:
- `NaN`や`Inf`を含むFloat32/64の文字列表現。
- `SELECT toUInt128OrDefault('0xc0fe', CAST('0', 'UInt128'));`のような2進数および16進数の文字列表現。

:::note
入力値が[UInt128](../data-types/int-uint.md)の範囲内に表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は128ビットの符号なし整数値、それ以外の場合は指定されたデフォルト値、または指定されていない場合は`0`が返されます。 [UInt128](../data-types/int-uint.md)。

:::note
- 関数は[ゼロに向かって切り捨て](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、これにより数値の小数点以下が切り捨てられます。
- デフォルト値の型はキャストされた型と同じである必要があります。
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

- `expr` — 数値または数値の文字列表現を返す式。 [式](/sql-reference/syntax#expressions)。

サポートされている引数:
- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値。

サポートされていない引数:
- `NaN`や`Inf`を含むFloat32/64の文字列表現。
- `SELECT toUInt256('0xc0fe');`のような2進数および16進数の文字列表現。

:::note
入力値が[UInt256](../data-types/int-uint.md)の範囲内に表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 256ビットの符号なし整数値。 [Int256](../data-types/int-uint.md)。

:::note
関数は[ゼロに向かって切り捨て](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、これにより数値の小数点以下が切り捨てられます。
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

- `x` — 数値を表す文字列。 [文字列](../data-types/string.md)。

サポートされている引数:
- (U)Int8/16/32/128/256の文字列表現。

サポートされていない引数（`0`を返す）:
- `NaN`や`Inf`を含むFloat32/64の文字列表現。
- `SELECT toUInt256OrZero('0xc0fe');`のような2進数および16進数の文字列表現。

:::note
入力値が[UInt256](../data-types/int-uint.md)の範囲内に表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は256ビットの符号なし整数値、それ以外の場合は`0`。 [UInt256](../data-types/int-uint.md)。

:::note
関数は[ゼロに向かって切り捨て](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、これにより数値の小数点以下が切り捨てられます。
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

- `x` — 数値を表す文字列。 [文字列](../data-types/string.md)。

サポートされている引数:
- (U)Int8/16/32/128/256の文字列表現。

サポートされていない引数（`\N`を返す）:
- `NaN`や`Inf`を含むFloat32/64の文字列表現。
- `SELECT toUInt256OrNull('0xc0fe');`のような2進数および16進数の文字列表現。

:::note
入力値が[UInt256](../data-types/int-uint.md)の範囲内に表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は256ビットの符号なし整数値、それ以外の場合は`NULL`。 [UInt256](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
関数は[ゼロに向かって切り捨て](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、これにより数値の小数点以下が切り捨てられます。
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
デフォルト値が指定されていない場合は、エラーが発生した場合に`0`が返されます。

**構文**

```sql
toUInt256OrDefault(expr[, default])
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。 [式](/sql-reference/syntax#expressions) / [文字列](../data-types/string.md)。
- `default`（オプション）— `UInt256`型へのパースに失敗した場合に返されるデフォルト値。 [UInt256](../data-types/int-uint.md)。

サポートされている引数:
- (U)Int8/16/32/64/128/256。
- Float32/64。
- (U)Int8/16/32/128/256の文字列表現。

デフォルト値が返される引数:
- `NaN`や`Inf`を含むFloat32/64の文字列表現。
- `SELECT toUInt256OrDefault('0xc0fe', CAST('0', 'UInt256'));`のような2進数および16進数の文字列表現。

:::note
入力値が[UInt256](../data-types/int-uint.md)の範囲内に表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は256ビットの符号なし整数値、それ以外の場合は指定されたデフォルト値、または指定されていない場合は`0`が返されます。 [UInt256](../data-types/int-uint.md)。

:::note
- 関数は[ゼロに向かって切り捨て](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、これにより数値の小数点以下が切り捨てられます。
- デフォルト値の型はキャストされた型と同じである必要があります。
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

- `expr` — 数値または数値の文字列表現を返す式。 [式](/sql-reference/syntax#expressions)。

サポートされている引数:
- (U)Int8/16/32/64/128/256型の値。
- (U)Int8/16/32/128/256の文字列表現。
- `NaN`や`Inf`を含むFloat32/64型の値。
- `NaN`や`Inf`を含むFloat32/64の文字列表現（大文字小文字を区別しない）。

サポートされていない引数:
- `SELECT toFloat32('0xc0fe');`のような2進数および16進数の文字列表現。

**返される値**

- 32ビットの浮動小数点値。 [Float32](../data-types/float.md)。

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

- `x` — 数値を表す文字列。 [文字列](../data-types/string.md)。

サポートされている引数:
- (U)Int8/16/32/128/256、Float32/64の文字列表現。

サポートされていない引数（`0`を返す）:
- `SELECT toFloat32OrZero('0xc0fe');`のような2進数および16進数の文字列表現。

**返される値**

- 成功した場合は32ビットのFloat値、それ以外の場合は`0`。 [Float32](../data-types/float.md)。

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

- `x` — 数値を表す文字列。 [文字列](../data-types/string.md)。

サポートされている引数:
- (U)Int8/16/32/128/256、Float32/64の文字列表現。

サポートされていない引数（`\N`を返す）:
- `SELECT toFloat32OrNull('0xc0fe');`のような2進数および16進数の文字列表現。

**返される値**

- 成功した場合は32ビットのFloat値、それ以外の場合は`\N`。 [Float32](../data-types/float.md)。

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

- [`toFloat32`](#tofloat32)。
- [`toFloat32OrZero`](#tofloat32orzero)。
- [`toFloat32OrDefault`](#tofloat32ordefault)。

## toFloat32OrDefault {#tofloat32ordefault}

[`toFloat32`](#tofloat32)と同様に、この関数は入力値を[Float32](../data-types/float.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
デフォルト値が指定されていない場合は、エラーが発生した場合に`0`が返されます。

**構文**

```sql
toFloat32OrDefault(expr[, default])
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。 [式](/sql-reference/syntax#expressions) / [文字列](../data-types/string.md)。
- `default`（オプション）— `Float32`型へのパースに失敗した場合に返されるデフォルト値。 [Float32](../data-types/float.md)。

サポートされている引数:
- (U)Int8/16/32/64/128/256型の値。
- (U)Int8/16/32/128/256の文字列表現。
- `NaN`や`Inf`を含むFloat32/64型の値。
- `NaN`や`Inf`を含むFloat32/64の文字列表現（大文字小文字を区別しない）。

デフォルト値が返される引数:
- 2進数および16進数の文字列表現、例: `SELECT toFloat32OrDefault('0xc0fe', CAST('0', 'Float32'));`。

**返される値**

- 成功した場合は32ビットのFloat値、それ以外の場合は指定されたデフォルト値、または指定されていない場合は`0`が返されます。 [Float32](../data-types/float.md)。

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

- `expr` — 数値または数値の文字列表現を返す式。 [式](/sql-reference/syntax#expressions)。

サポートされている引数:
- (U)Int8/16/32/64/128/256型の値。
- (U)Int8/16/32/128/256の文字列表現。
- `NaN`や`Inf`を含むFloat32/64型の値。
- `NaN`や`Inf`を含むFloat32/64の文字列表現（大文字小文字を区別しない）。

サポートされていない引数:
- `SELECT toFloat64('0xc0fe');`のような2進数および16進数の文字列表現。

**返される値**

- 64ビットの浮動小数点値。 [Float64](../data-types/float.md)。

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

- `x` — 数値を表す文字列。 [文字列](../data-types/string.md)。

サポートされている引数:
- (U)Int8/16/32/128/256、Float32/64の文字列表現。

サポートされていない引数（`0`を返す）:
- `SELECT toFloat64OrZero('0xc0fe');`のような2進数および16進数の文字列表現。

**返される値**

- 成功した場合は64ビットのFloat値、それ以外の場合は`0`。 [Float64](../data-types/float.md)。

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

- [`toFloat64`](#tofloat64)。
- [`toFloat64OrNull`](#tofloat64ornull)。
- [`toFloat64OrDefault`](#tofloat64ordefault)。

## toFloat64OrNull {#tofloat64ornull}

[`toFloat64`](#tofloat64)と同様に、この関数は入力値を[Float64](../data-types/float.md)型の値に変換しますが、エラーが発生した場合は`NULL`を返します。

**構文**

```sql
toFloat64OrNull(x)
```

**引数**

- `x` — 数値を表す文字列。 [文字列](../data-types/string.md)。

サポートされている引数:
- (U)Int8/16/32/128/256、Float32/64の文字列表現。

サポートされていない引数（`\N`を返す）:
- `SELECT toFloat64OrNull('0xc0fe');`のような2進数および16進数の文字列表現。

**返される値**

- 成功した場合は64ビットのFloat値、それ以外の場合は`\N`。 [Float64](../data-types/float.md)。

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

- [`toFloat64`](#tofloat64)。
- [`toFloat64OrZero`](#tofloat64orzero)。
- [`toFloat64OrDefault`](#tofloat64ordefault)。

## toFloat64OrDefault {#tofloat64ordefault}

[`toFloat64`](#tofloat64) と同様に、この関数は入力値を [Float64](../data-types/float.md) 型の値に変換しますが、エラーが発生した場合にはデフォルト値を返します。
`default` 値が渡されなかった場合は、エラー時に `0` が返されます。

**構文**

```sql
toFloat64OrDefault(expr[, default])
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。 [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
- `default` (オプション) — `Float64` 型への解析が失敗した場合に返されるデフォルト値。 [Float64](../data-types/float.md)。

サポートされている引数：
- (U)Int8/16/32/64/128/256 型の値。
- (U)Int8/16/32/128/256 の文字列表現。
- Float32/64 型の値、`NaN` および `Inf` を含む。
- Float32/64 の文字列表現、`NaN` および `Inf` を含む（大文字小文字を区別しない）。

デフォルト値が返される引数：
- バイナリおよび16進数値の文字列表現、例: `SELECT toFloat64OrDefault('0xc0fe', CAST('0', 'Float64'));`。

**返される値**

- 成功した場合は 64 ビットの Float 値、そうでなければ渡されたデフォルト値または `0` が返されます。 [Float64](../data-types/float.md)。

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

入力値を [`BFloat16`](/sql-reference/data-types/float#bfloat16) 型の値に変換します。 
エラーが発生した場合には例外がスローされます。

**構文**

```sql
toBFloat16(expr)
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。 [Expression](/sql-reference/syntax#expressions)。

サポートされている引数：
- (U)Int8/16/32/64/128/256 型の値。
- (U)Int8/16/32/128/256 の文字列表現。
- Float32/64 型の値、`NaN` および `Inf` を含む。
- Float32/64 の文字列表現、`NaN` および `Inf` を含む（大文字小文字を区別しない）。

**返される値**

- 16ビットのブレインフロート値。 [BFloat16](/sql-reference/data-types/float#bfloat16)。

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

- [`toBFloat16OrZero`](#tobfloat16orzero)。
- [`toBFloat16OrNull`](#tobfloat16ornull)。
## toBFloat16OrZero {#tobfloat16orzero}

String 入力値を [`BFloat16`](/sql-reference/data-types/float#bfloat16) 型の値に変換します。
文字列が浮動小数点値を表していない場合、関数はゼロを返します。

**構文**

```sql
toBFloat16OrZero(x)
```

**引数**

- `x` — 数値の文字列表現。 [String](../data-types/string.md)。

サポートされている引数：

- 数値の文字列表現。

サポートされていない引数（`0` を返します）：

- バイナリおよび16進数値の文字列表現。
- 数値の値。

**返される値**

- 16ビットのブレインフロート値、そうでなければ `0`。 [BFloat16](/sql-reference/data-types/float#bfloat16)。

:::note
この関数は文字列表現からの変換中に精度の損失を黙って許可します。
:::

**例**

```sql
SELECT toBFloat16OrZero('0x5E'); -- サポートされていない引数

0

SELECT toBFloat16OrZero('12.3'); -- 一般的な使用法

12.25

SELECT toBFloat16OrZero('12.3456789');

12.3125 -- 精度の損失
```

**関連項目**

- [`toBFloat16`](#tobfloat16)。
- [`toBFloat16OrNull`](#tobfloat16ornull)。
## toBFloat16OrNull {#tobfloat16ornull}

String 入力値を [`BFloat16`](/sql-reference/data-types/float#bfloat16) 型の値に変換しますが、文字列が浮動小数点値を表していない場合、関数は `NULL` を返します。

**構文**

```sql
toBFloat16OrNull(x)
```

**引数**

- `x` — 数値の文字列表現。 [String](../data-types/string.md)。

サポートされている引数：

- 数値の文字列表現。

サポートされていない引数（`NULL` を返します）：

- バイナリおよび16進数値の文字列表現。
- 数値の値。

**返される値**

- 16ビットのブレインフロート値、そうでなければ `NULL` (`\N`)。 [BFloat16](/sql-reference/data-types/float#bfloat16)。

:::note
この関数は文字列表現からの変換中に精度の損失を黙って許可します。
:::

**例**

```sql
SELECT toBFloat16OrNull('0x5E'); -- サポートされていない引数

\N

SELECT toBFloat16OrNull('12.3'); -- 一般的な使用法

12.25

SELECT toBFloat16OrNull('12.3456789');

12.3125 -- 精度の損失
```

**関連項目**

- [`toBFloat16`](#tobfloat16)。
- [`toBFloat16OrZero`](#tobfloat16orzero)。
## toDate {#todate}

引数を [Date](../data-types/date.md) データ型に変換します。

引数が [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md) の場合、それは切り捨てられ、DateTime の日付コンポーネントが残ります：

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

引数が [String](../data-types/string.md) の場合、[Date](../data-types/date.md) または [DateTime](../data-types/datetime.md) として解析されます。 それが [DateTime](../data-types/datetime.md) として解析された場合、日付コンポーネントが使用されます：

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

引数が数値であり、UNIX タイムスタンプのように見える場合（65535 より大きい）、それは [DateTime](../data-types/datetime.md) として解釈され、その後、現在のタイムゾーンで [Date](../data-types/date.md) に切り捨てられます。 タイムゾーン引数は、関数の第二引数として指定できます。[Date](../data-types/date.md) への切り捨てはタイムゾーンに依存します：

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

上記の例は、同じ UNIX タイムスタンプが異なるタイムゾーンで異なる日付として解釈される方法を示しています。

引数が数値であり、65536 より小さい場合、それは1970-01-01 からの日数（最初の UNIX 日）として解釈され、[Date](../data-types/date.md) に変換されます。これは `Date` データ型の内部的な数値表現に該当します。例：

```sql
SELECT toDate(12345)
```
```response
┌─toDate(12345)─┐
│    2003-10-20 │
└───────────────┘
```

この変換はタイムゾーンに依存しません。

引数が Date 型の範囲に当てはまらない場合、実装依存の動作を生成し、最大サポート日付に saturation するかオーバーフローで終了する可能性があります：
```sql
SELECT toDate(10000000000.)
```
```response
┌─toDate(10000000000.)─┐
│           2106-02-07 │
└──────────────────────┘
```

関数 `toDate` は、別の形式でも書くことができます：

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

[toDate](#todate) と同様ですが、無効な引数が与えられた場合には [Date](../data-types/date.md) の下限を返します。 サポートされているのは [String](../data-types/string.md) 引数のみです。

**例**

クエリ：

```sql
SELECT toDateOrZero('2022-12-30'), toDateOrZero('');
```

結果：

```response
┌─toDateOrZero('2022-12-30')─┬─toDateOrZero('')─┐
│                 2022-12-30 │       1970-01-01 │
└────────────────────────────┴──────────────────┘
```
## toDateOrNull {#todateornull}

[toDate](#todate) と同様ですが、無効な引数が与えられた場合には `NULL` を返します。 サポートされているのは [String](../data-types/string.md) 引数のみです。

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

[toDate](#todate) と同様ですが、失敗した場合は、第二引数（指定されている場合）または [Date](../data-types/date.md) の下限値を返します。

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

- `expr` — 値。 [String](../data-types/string.md)、[Int](../data-types/int-uint.md)、[Date](../data-types/date.md)、または [DateTime](../data-types/datetime.md)。
- `time_zone` — タイムゾーン。 [String](../data-types/string.md)。

:::note
`expr` が数値の場合、それはUnix エポックの始まりからの秒数（Unix タイムスタンプ）として解釈されます。
`expr` が [String](../data-types/string.md) の場合、Unix タイムスタンプまたは日付 / 時間の文字列表現として解釈される場合があります。
したがって、短い数字の文字列表現（最大4桁）はあいまい性のために明示的に無効となっており、例えば文字列 `'1999'` は年（未完成の文字列表現の日付 / 日付時刻）または Unix タイムスタンプの両方を意味する可能性があります。 より長い数値の文字列は許可されています。
:::

**返される値**

- 日付と時間。 [DateTime](../data-types/datetime.md)

**例**

クエリ：

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

[toDateTime](#todatetime) と同様ですが、無効な引数が与えられた場合には [DateTime](../data-types/datetime.md) の下限を返します。 サポートされているのは [String](../data-types/string.md) 引数のみです。

**例**

クエリ：

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

[toDateTime](#todatetime) と同様ですが、無効な引数が与えられた場合には `NULL` を返します。 サポートされているのは [String](../data-types/string.md) 引数のみです。

**例**

クエリ：

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

[toDateTime](#todatetime) と同様ですが、失敗した場合は、第三引数（指定されている場合）または [DateTime](../data-types/datetime.md) の下限値を返します。

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

引数を [Date32](../data-types/date32.md) データ型に変換します。 値が範囲外の場合、`toDate32` は [Date32](../data-types/date32.md) がサポートする境界値を返します。 引数が [Date](../data-types/date.md) 型の場合、その境界が考慮されます。

**構文**

```sql
toDate32(expr)
```

**引数**

- `expr` — 値。 [String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、または [Date](../data-types/date.md)。

**返される値**

- カレンダーの日付。 型は [Date32](../data-types/date32.md)。

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

2. 値が範囲外の場合：

```sql
SELECT toDate32('1899-01-01') AS value, toTypeName(value);
```

```response
┌──────value─┬─toTypeName(toDate32('1899-01-01'))─┐
│ 1900-01-01 │ Date32                             │
└────────────┴────────────────────────────────────┘
```

3. [Date](../data-types/date.md) 引数で：

```sql
SELECT toDate32(toDate('1899-01-01')) AS value, toTypeName(value);
```

```response
┌──────value─┬─toTypeName(toDate32(toDate('1899-01-01')))─┐
│ 1970-01-01 │ Date32                                     │
└────────────┴────────────────────────────────────────────┘
```
## toDate32OrZero {#todate32orzero}

[toDate32](#todate32) と同様ですが、無効な引数が与えられた場合には [Date32](../data-types/date32.md) の最小値を返します。

**例**

クエリ：

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

[toDate32](#todate32) と同様ですが、無効な引数が与えられた場合には `NULL` を返します。

**例**

クエリ：

```sql
SELECT toDate32OrNull('1955-01-01'), toDate32OrNull('');
```

結果：

```response
┌─toDate32OrNull('1955-01-01')─┬─toDate32OrNull('')─┐
│                   1955-01-01 │               ᴺᵁᴸᴸ │
└──────────────────────────────┴────────────────────┘
```
## toDate32OrDefault {#todate32ordefault}

引数を [Date32](../data-types/date32.md) データ型に変換します。 値が範囲外の場合、`toDate32OrDefault` は [Date32](../data-types/date32.md) がサポートする下限値を返します。 引数が [Date](../data-types/date.md) 型の場合、その境界が考慮されます。 無効な引数が与えられた場合はデフォルト値を返します。

**例**

クエリ：

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

- `expr` — 値。 [String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[Float](../data-types/float.md)、または [DateTime](../data-types/datetime.md)。
- `scale` - チックサイズ（精度）：10<sup>-精度</sup> 秒。 有効範囲：[ 0 : 9 ]。
- `timezone` (オプション) - 指定した datetime64 オブジェクトのタイムゾーン。

**返される値**

- カレンダーの日付と一日の時間。 サブ秒精度あり。 [DateTime64](../data-types/datetime64.md)。

**例**

1. 値が範囲内にある場合：

```sql
SELECT toDateTime64('1955-01-01 00:00:00.000', 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64('1955-01-01 00:00:00.000', 3))─┐
│ 1955-01-01 00:00:00.000 │ DateTime64(3)                                          │
└─────────────────────────┴────────────────────────────────────────────────────────┘
```

2. 精度を持つ小数の場合：

```sql
SELECT toDateTime64(1546300800.000, 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64(1546300800., 3))─┐
│ 2019-01-01 00:00:00.000 │ DateTime64(3)                            │
└─────────────────────────┴──────────────────────────────────────────┘
```

小数点なしでは、値は Unix タイムスタンプとして秒単位で扱われます。

```sql
SELECT toDateTime64(1546300800000, 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64(1546300800000, 3))─┐
│ 2282-12-31 00:00:00.000 │ DateTime64(3)                              │
└─────────────────────────┴────────────────────────────────────────────┘
```

3. `timezone` あり：

```sql
SELECT toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul') AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul'))─┐
│ 2019-01-01 00:00:00.000 │ DateTime64(3, 'Asia/Istanbul')                                      │
└─────────────────────────┴─────────────────────────────────────────────────────────────────────┘
```
## toDateTime64OrZero {#todatetime64orzero}

[toDateTime64](#todatetime64) と同様に、この関数は入力値を [DateTime64](../data-types/datetime64.md) 型の値に変換しますが、無効な引数が与えられた場合には [DateTime64](../data-types/datetime64.md) の最小値を返します。

**構文**

```sql
toDateTime64OrZero(expr, scale, [timezone])
```

**引数**

- `expr` — 値。 [String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[Float](../data-types/float.md)、または [DateTime](../data-types/datetime.md)。
- `scale` - チックサイズ（精度）：10<sup>-精度</sup> 秒。 有効範囲：[ 0 : 9 ]。
- `timezone` (オプション) - 指定した DateTime64 オブジェクトのタイムゾーン。

**返される値**

- カレンダーの日付と一日の時間。 サブ秒精度あり、無効な場合は `DateTime64` の最小値：`1970-01-01 01:00:00.000`。 [DateTime64](../data-types/datetime64.md)。

**例**

クエリ：

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

- [toDateTime64](#todatetime64)。
- [toDateTime64OrNull](#todatetime64ornull)。
- [toDateTime64OrDefault](#todatetime64ordefault)。
## toDateTime64OrNull {#todatetime64ornull}

[toDateTime64](#todatetime64) と同様に、この関数は入力値を [DateTime64](../data-types/datetime64.md) 型の値に変換しますが、無効な引数が与えられた場合には `NULL` を返します。

**構文**

```sql
toDateTime64OrNull(expr, scale, [timezone])
```

**引数**

- `expr` — 値。 [String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[Float](../data-types/float.md)、または [DateTime](../data-types/datetime.md)。
- `scale` - チックサイズ（精度）：10<sup>-精度</sup> 秒。 有効範囲：[ 0 : 9 ]。
- `timezone` (オプション) - 指定した DateTime64 オブジェクトのタイムゾーン。

**返される値**

- カレンダーの日付と一日の時間。 サブ秒精度あり、無効な場合は `NULL`。 [DateTime64](../data-types/datetime64.md)/[NULL](../data-types/nullable.md)。

**例**

クエリ：

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

- [toDateTime64](#todatetime64)。
- [toDateTime64OrZero](#todatetime64orzero)。
- [toDateTime64OrDefault](#todatetime64ordefault)。
## toDateTime64OrDefault {#todatetime64ordefault}

[toDateTime64](#todatetime64) と同様に、この関数は入力値を [DateTime64](../data-types/datetime64.md) 型の値に変換しますが、無効な引数が与えられた場合には [DateTime64](../data-types/datetime64.md) のデフォルト値または提供されたデフォルト値を返します。

**構文**

```sql
toDateTime64OrNull(expr, scale, [timezone, default])
```

**引数**

- `expr` — 値。 [String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[Float](../data-types/float.md)、または [DateTime](../data-types/datetime.md)。
- `scale` - チックサイズ（精度）：10<sup>-精度</sup> 秒。 有効範囲：[ 0 : 9 ]。
- `timezone` (オプション) - 指定した DateTime64 オブジェクトのタイムゾーン。
- `default` (オプション) - 無効な引数が与えられた場合に返されるデフォルト値。 [DateTime64](../data-types/datetime64.md)。

**返される値**

- カレンダーの日付と一日の時間。 サブ秒精度あり、無効な場合は `DateTime64` の最小値または提供された `default` 値。 [DateTime64](../data-types/datetime64.md)。

**例**

クエリ：

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

- [toDateTime64](#todatetime64)。
- [toDateTime64OrZero](#todatetime64orzero)。
- [toDateTime64OrNull](#todatetime64ornull)。
## toDecimal32 {#todecimal32}

入力値を [`Decimal(9, S)`](../data-types/decimal.md) 型の値に変換します。 スケール `S`。 エラーが発生した場合には例外が投げられます。

**構文**

```sql
toDecimal32(expr, S)
```

**引数**

- `expr` — 数値または数値の文字列表現を返す式。 [Expression](/sql-reference/syntax#expressions)。
- `S` — 数値の小数部が持つことができる桁数を指定する、0 から 9 の間のスケールパラメータ。 [UInt8](../data-types/int-uint.md)。

サポートされている引数：
- (U)Int8/16/32/64/128/256 型の値または文字列表現。
- Float32/64 型の値または文字列表現。

サポートされていない引数：
- Float32/64 値 `NaN` および `Inf` の値または文字列表現（大文字小文字を区別しない）。
- バイナリおよび16進数値の文字列表現、例: `SELECT toDecimal32('0xc0fe', 1);`。

:::note
`expr` の値が `Decimal32` の範囲を超えるとオーバーフローが発生します: `( -1 * 10^(9 - S), 1 * 10^(9 - S) )`。
小数部の余分な桁は破棄され（丸められません）、整数部が過剰な桁になると例外が発生します。
:::

:::warning
変換は余分な桁を削除し、Float32/Float64 入力で予期しない方法で動作する可能性があります。 操作は浮動小数点命令を使用して行われるためです。
例えば： `toDecimal32(1.15, 2)` は `1.14` と同等です。 なぜなら、浮動小数点での 1.15 * 100 は 114.99 になるからです。
文字列入力を使用すると、操作は基礎となる整数型を使用します： `toDecimal32('1.15', 2) = 1.15`
:::

**返される値**

- 型は `Decimal(9, S)`。 [Decimal32(S)](../data-types/int-uint.md)。

**例**

クエリ：

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

- [`toDecimal32OrZero`](#todecimal32orzero)。
- [`toDecimal32OrNull`](#todecimal32ornull)。
- [`toDecimal32OrDefault`](#todecimal32ordefault)。
## toDecimal32OrZero {#todecimal32orzero}

[`toDecimal32`](#todecimal32) と同様に、この関数は入力値を [Decimal(9, S)](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合には `0` を返します。

**構文**

```sql
toDecimal32OrZero(expr, S)
```

**引数**

- `expr` — 数値の文字列表現。 [String](../data-types/string.md)。
- `S` — 数値の小数部が持つことができる桁数を指定する、0 から 9 の間のスケールパラメータ。 [UInt8](../data-types/int-uint.md)。

サポートされている引数：
- (U)Int8/16/32/64/128/256 型の文字列表現。
- Float32/64 型の文字列表現。

サポートされていない引数：
- Float32/64 値 `NaN` および `Inf` の文字列表現。
- バイナリおよび16進数値の文字列表現、例: `SELECT toDecimal32OrZero('0xc0fe', 1);`。

:::note
オーバーフローが発生すると、`expr` の値が `Decimal32` の範囲を超えます: `( -1 * 10^(9 - S), 1 * 10^(9 - S) )`。
小数部の余分な桁は破棄され（丸められません）、整数部が過剰な桁になるとエラーが発生します。
:::

**返される値**

- 型は `Decimal(9, S)` で成功した場合、そうでなければ `0` で `S` 桁の小数部を持つ。 [Decimal32(S)](../data-types/decimal.md)。

**例**

クエリ：

```sql
SELECT
    toDecimal32OrZero(toString(-1.111), 5) AS a,
    toTypeName(a),
    toDecimal32OrZero(toString('Inf'), 5) as b,
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

- [`toDecimal32`](#todecimal32)。
- [`toDecimal32OrNull`](#todecimal32ornull)。
- [`toDecimal32OrDefault`](#todecimal32ordefault)。
## toDecimal32OrNull {#todecimal32ornull}

[`toDecimal32`](#todecimal32) と同様に、この関数は入力値を [Nullable(Decimal(9, S))](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合には `0` を返します。

**構文**

```sql
toDecimal32OrNull(expr, S)
```

**引数**

- `expr` — 数値の文字列表現。 [String](../data-types/string.md)。
- `S` — 数値の小数部が持つことができる桁数を指定する、0 から 9 の間のスケールパラメータ。 [UInt8](../data-types/int-uint.md)。

サポートされている引数：
- (U)Int8/16/32/64/128/256 型の文字列表現。
- Float32/64 型の文字列表現。

サポートされていない引数：
- Float32/64 値 `NaN` および `Inf` の文字列表現。
- バイナリおよび16進数値の文字列表現、例: `SELECT toDecimal32OrNull('0xc0fe', 1);`。

:::note
オーバーフローが発生すると、`expr` の値が `Decimal32` の範囲を超えると `( -1 * 10^(9 - S), 1 * 10^(9 - S) )`。
小数部の余分な桁は破棄され（丸められません）、整数部が過剰な桁になるとエラーが発生します。
:::

**返される値**

- 成功した場合は型は `Nullable(Decimal(9, S))`、そうでなければ同じ型の値 `NULL`。 [Decimal32(S)](../data-types/decimal.md)。

**例**

クエリ：

```sql
SELECT
    toDecimal32OrNull(toString(-1.111), 5) AS a,
    toTypeName(a),
    toDecimal32OrNull(toString('Inf'), 5) as b,
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

- [`toDecimal32`](#todecimal32)。
- [`toDecimal32OrZero`](#todecimal32orzero)。
- [`toDecimal32OrDefault`](#todecimal32ordefault)。
```
## toDecimal32OrDefault {#todecimal32ordefault}

[`toDecimal32`](#todecimal32) と同様に、この関数は入力値を [Decimal(9, S)](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。

**構文**

```sql
toDecimal32OrDefault(expr, S[, default])
```

**引数**

- `expr` — 数字の文字列表現。 [String](../data-types/string.md).
- `S` — 数字の小数部に持つことができる桁数を指定する0から9までのスケールパラメータ。 [UInt8](../data-types/int-uint.md).
- `default` (オプション) — `Decimal32(S)`型へのパースが失敗した場合に返されるデフォルト値。 [Decimal32(S)](../data-types/decimal.md).

サポートされている引数:
- (U)Int8/16/32/64/128/256型の文字列表現。
- Float32/64型の文字列表現。

サポートされていない引数:
- Float32/64値 `NaN` と `Inf` の文字列表現。
- バイナリおよび16進数値の文字列表現、例: `SELECT toDecimal32OrDefault('0xc0fe', 1);`.

:::note
`expr` の値が `Decimal32` の範囲を超えるとオーバーフローが発生する可能性があります: `( -1 * 10^(9 - S), 1 * 10^(9 - S) )`.
小数部分の過剰な桁は切り捨てられます（丸められません）。
整数部分の過剰な桁はエラーを引き起こします。
:::

:::warning
変換処理において、余分な桁がドロップされ、Float32/Float64入力を扱う際には予期しない動作をする可能性があります。なぜなら、操作は浮動小数点命令を使用して行われるからです。
例えば: `toDecimal32OrDefault(1.15, 2)` は `1.14` に等しいです。なぜなら、1.15 * 100 が浮動小数点では114.99になるからです。
文字列入力を使用することで、操作は基になる整数型を使用できます: `toDecimal32OrDefault('1.15', 2) = 1.15`
:::

**返される値**

- 成功した場合は `Decimal(9, S)` 型の値を返し、そうでない場合は渡されたデフォルト値を返すか、渡されなかった場合は `0` を返します。 [Decimal32(S)](../data-types/decimal.md).

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

- [`toDecimal32`](#todecimal32).
- [`toDecimal32OrZero`](#todecimal32orzero).
- [`toDecimal32OrNull`](#todecimal32ornull).
## toDecimal64 {#todecimal64}

入力値をスケール `S` を持つ [`Decimal(18, S)`](../data-types/decimal.md) 型の値に変換します。エラーが発生した場合は例外がスローされます。

**構文**

```sql
toDecimal64(expr, S)
```

**引数**

- `expr` — 数字を返す式または数字の文字列表現。 [Expression](/sql-reference/syntax#expressions).
- `S` — 数字の小数部に持つことができる桁数を指定する0から18までのスケールパラメータ。 [UInt8](../data-types/int-uint.md).

サポートされている引数:
- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値または文字列表現。

サポートされていない引数:
- Float32/64値 `NaN` と `Inf` の場合の値または文字列表現（ケースインセンシティブ）。
- バイナリおよび16進数値の文字列表現、例: `SELECT toDecimal64('0xc0fe', 1);`.

:::note
`expr` の値が `Decimal64` の範囲を超えるとオーバーフローが発生する可能性があります: `( -1 * 10^(18 - S), 1 * 10^(18 - S) )`.
小数部分の過剰な桁は切り捨てられます（丸められません）。
整数部分の過剰な桁は例外を引き起こします。
:::

:::warning
変換処理において、余分な桁がドロップされ、Float32/Float64入力を扱う際には予期しない動作をする可能性があります。操作は浮動小数点命令を使用して行われます。
例えば: `toDecimal64(1.15, 2)` は `1.14` に等しいです。なぜなら、1.15 * 100 が浮動小数点では114.99になるからです。
文字列入力を使用することで、操作は基になる整数型を使用できます: `toDecimal64('1.15', 2) = 1.15`
:::

**返される値**

- `Decimal(18, S)` 型の値。 [Decimal64(S)](../data-types/int-uint.md).

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

- [`toDecimal64OrZero`](#todecimal64orzero).
- [`toDecimal64OrNull`](#todecimal64ornull).
- [`toDecimal64OrDefault`](#todecimal64ordefault).
## toDecimal64OrZero {#todecimal64orzero}

[`toDecimal64`](#todecimal64) と同様に、この関数は入力値を [Decimal(18, S)](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toDecimal64OrZero(expr, S)
```

**引数**

- `expr` — 数字の文字列表現。 [String](../data-types/string.md).
- `S` — 数字の小数部に持つことができる桁数を指定する0から18までのスケールパラメータ。 [UInt8](../data-types/int-uint.md).

サポートされている引数:
- (U)Int8/16/32/64/128/256型の文字列表現。
- Float32/64型の文字列表現。

サポートされていない引数:
- Float32/64値 `NaN` と `Inf` の文字列表現。
- バイナリおよび16進数値の文字列表現、例: `SELECT toDecimal64OrZero('0xc0fe', 1);`.

:::note
`expr` の値が `Decimal64` の範囲を超えるとオーバーフローが発生する可能性があります: `( -1 * 10^(18 - S), 1 * 10^(18 - S) )`.
小数部分の過剰な桁は切り捨てられます（丸められません）。
整数部分の過剰な桁はエラーを引き起こします。
:::

**返される値**

- 成功した場合は `Decimal(18, S)` 型の値を返し、そうでない場合は `0` を返します。 [Decimal64(S)](../data-types/decimal.md).

**例**

クエリ:

```sql
SELECT
    toDecimal64OrZero(toString(0.0001), 18) AS a,
    toTypeName(a),
    toDecimal64OrZero(toString('Inf'), 18) as b,
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

- [`toDecimal64`](#todecimal64).
- [`toDecimal64OrNull`](#todecimal64ornull).
- [`toDecimal64OrDefault`](#todecimal64ordefault).
## toDecimal64OrNull {#todecimal64ornull}

[`toDecimal64`](#todecimal64) と同様に、この関数は入力値を [Nullable(Decimal(18, S))](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toDecimal64OrNull(expr, S)
```

**引数**

- `expr` — 数字の文字列表現。 [String](../data-types/string.md).
- `S` — 数字の小数部に持つことができる桁数を指定する0から18までのスケールパラメータ。 [UInt8](../data-types/int-uint.md).

サポートされている引数:
- (U)Int8/16/32/64/128/256型の文字列表現。
- Float32/64型の文字列表現。

サポートされていない引数:
- Float32/64値 `NaN` と `Inf` の文字列表現。
- バイナリおよび16進数値の文字列表現、例: `SELECT toDecimal64OrNull('0xc0fe', 1);`.

:::note
`expr` の値が `Decimal64` の範囲を超えるとオーバーフローが発生する可能性があります: `( -1 * 10^(18 - S), 1 * 10^(18 - S) )`.
小数部分の過剰な桁は切り捨てられます（丸められません）。
整数部分の過剰な桁はエラーを引き起こします。
:::

**返される値**

- 成功した場合は `Nullable(Decimal(18, S))` 型の値を返し、そうでない場合は同じ型の `NULL` 値を返します。 [Decimal64(S)](../data-types/decimal.md).

**例**

クエリ:

```sql
SELECT
    toDecimal64OrNull(toString(0.0001), 18) AS a,
    toTypeName(a),
    toDecimal64OrNull(toString('Inf'), 18) as b,
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

- [`toDecimal64`](#todecimal64).
- [`toDecimal64OrZero`](#todecimal64orzero).
- [`toDecimal64OrDefault`](#todecimal64ordefault).
## toDecimal64OrDefault {#todecimal64ordefault}

[`toDecimal64`](#todecimal64) と同様に、この関数は入力値を [Decimal(18, S)](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。

**構文**

```sql
toDecimal64OrDefault(expr, S[, default])
```

**引数**

- `expr` — 数字の文字列表現。 [String](../data-types/string.md).
- `S` — 数字の小数部に持つことができる桁数を指定する0から18までのスケールパラメータ。 [UInt8](../data-types/int-uint.md).
- `default` (オプション) — `Decimal64(S)`型へのパースが失敗した場合に返されるデフォルト値。 [Decimal64(S)](../data-types/decimal.md).

サポートされている引数:
- (U)Int8/16/32/64/128/256型の文字列表現。
- Float32/64型の文字列表現。

サポートされていない引数:
- Float32/64値 `NaN` と `Inf` の文字列表現。
- バイナリおよび16進数値の文字列表現、例: `SELECT toDecimal64OrDefault('0xc0fe', 1);`.

:::note
`expr` の値が `Decimal64` の範囲を超えるとオーバーフローが発生する可能性があります: `( -1 * 10^(18 - S), 1 * 10^(18 - S) )`.
小数部分の過剰な桁は切り捨てられます（丸められません）。
整数部分の過剰な桁はエラーを引き起こします。
:::

:::warning
変換処理において、余分な桁がドロップされ、Float32/Float64入力を扱う際には予期しない動作をする可能性があります。操作は浮動小数点命令を使用して行われます。
例えば: `toDecimal64OrDefault(1.15, 2)` は `1.14` に等しいです。なぜなら、1.15 * 100 が浮動小数点では114.99になるからです。
文字列入力を使用することで、操作は基になる整数型を使用できます: `toDecimal64OrDefault('1.15', 2) = 1.15`
:::

**返される値**

- 成功した場合は `Decimal(18, S)` 型の値を返し、そうでない場合は渡されたデフォルト値を返すか、渡されなかった場合は `0` を返します。 [Decimal64(S)](../data-types/decimal.md).

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

- [`toDecimal64`](#todecimal64).
- [`toDecimal64OrZero`](#todecimal64orzero).
- [`toDecimal64OrNull`](#todecimal64ornull).
## toDecimal128 {#todecimal128}

入力値をスケール `S` を持つ [`Decimal(38, S)`](../data-types/decimal.md) 型の値に変換します。エラーが発生した場合は例外がスローされます。

**構文**

```sql
toDecimal128(expr, S)
```

**引数**

- `expr` — 数字を返す式または数字の文字列表現。 [Expression](/sql-reference/syntax#expressions).
- `S` — 数字の小数部に持つことができる桁数を指定する0から38までのスケールパラメータ。 [UInt8](../data-types/int-uint.md).

サポートされている引数:
- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値または文字列表現。

サポートされていない引数:
- Float32/64値 `NaN` と `Inf` の場合の値または文字列表現（ケースインセンシティブ）。
- バイナリおよび16進数値の文字列表現、例: `SELECT toDecimal128('0xc0fe', 1);`.

:::note
`expr` の値が `Decimal128` の範囲を超えるとオーバーフローが発生する可能性があります: `( -1 * 10^(38 - S), 1 * 10^(38 - S) )`.
小数部分の過剰な桁は切り捨てられます（丸められません）。
整数部分の過剰な桁は例外を引き起こします。
:::

:::warning
変換処理において、余分な桁がドロップされ、Float32/Float64入力を扱う際には予期しない動作をする可能性があります。操作は浮動小数点命令を使用して行われます。
例えば: `toDecimal128(1.15, 2)` は `1.14` に等しいです。なぜなら、1.15 * 100 が浮動小数点では114.99になるからです。
文字列入力を使用することで、操作は基になる整数型を使用できます: `toDecimal128('1.15', 2) = 1.15`
:::

**返される値**

- `Decimal(38, S)` 型の値。 [Decimal128(S)](../data-types/int-uint.md).

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

- [`toDecimal128OrZero`](#todecimal128orzero).
- [`toDecimal128OrNull`](#todecimal128ornull).
- [`toDecimal128OrDefault`](#todecimal128ordefault).
## toDecimal128OrZero {#todecimal128orzero}

[`toDecimal128`](#todecimal128) と同様に、この関数は入力値を [Decimal(38, S)](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toDecimal128OrZero(expr, S)
```

**引数**

- `expr` — 数字の文字列表現。 [String](../data-types/string.md).
- `S` — 数字の小数部に持つことができる桁数を指定する0から38までのスケールパラメータ。 [UInt8](../data-types/int-uint.md).

サポートされている引数:
- (U)Int8/16/32/64/128/256型の文字列表現。
- Float32/64型の文字列表現。

サポートされていない引数:
- Float32/64値 `NaN` と `Inf` の文字列表現。
- バイナリおよび16進数値の文字列表現、例: `SELECT toDecimal128OrZero('0xc0fe', 1);`.

:::note
`expr` の値が `Decimal128` の範囲を超えるとオーバーフローが発生する可能性があります: `( -1 * 10^(38 - S), 1 * 10^(38 - S) )`.
小数部分の過剰な桁は切り捨てられます（丸められません）。
整数部分の過剰な桁はエラーを引き起こします。
:::

**返される値**

- 成功した場合は `Decimal(38, S)` 型の値を返し、そうでない場合は `0` を返します。 [Decimal128(S)](../data-types/decimal.md).

**例**

クエリ:

```sql
SELECT
    toDecimal128OrZero(toString(0.0001), 38) AS a,
    toTypeName(a),
    toDecimal128OrZero(toString('Inf'), 38) as b,
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

- [`toDecimal128`](#todecimal128).
- [`toDecimal128OrNull`](#todecimal128ornull).
- [`toDecimal128OrDefault`](#todecimal128ordefault).
## toDecimal128OrNull {#todecimal128ornull}

[`toDecimal128`](#todecimal128) と同様に、この関数は入力値を [Nullable(Decimal(38, S))](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toDecimal128OrNull(expr, S)
```

**引数**

- `expr` — 数字の文字列表現。 [String](../data-types/string.md).
- `S` — 数字の小数部に持つことができる桁数を指定する0から38までのスケールパラメータ。 [UInt8](../data-types/int-uint.md).

サポートされている引数:
- (U)Int8/16/32/64/128/256型の文字列表現。
- Float32/64型の文字列表現。

サポートされていない引数:
- Float32/64値 `NaN` と `Inf` の文字列表現。
- バイナリおよび16進数値の文字列表現、例: `SELECT toDecimal128OrNull('0xc0fe', 1);`.

:::note
`expr` の値が `Decimal128` の範囲を超えるとオーバーフローが発生する可能性があります: `( -1 * 10^(38 - S), 1 * 10^(38 - S) )`.
小数部分の過剰な桁は切り捨てられます（丸められません）。
整数部分の過剰な桁はエラーを引き起こします。
:::

**返される値**

- 成功した場合は `Nullable(Decimal(38, S))` 型の値を返し、そうでない場合は同じ型の `NULL` 値を返します。 [Decimal128(S)](../data-types/decimal.md).

**例**

クエリ:

```sql
SELECT
    toDecimal128OrNull(toString(1/42), 38) AS a,
    toTypeName(a),
    toDecimal128OrNull(toString('Inf'), 38) as b,
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

- [`toDecimal128`](#todecimal128).
- [`toDecimal128OrZero`](#todecimal128orzero).
- [`toDecimal128OrDefault`](#todecimal128ordefault).
## toDecimal128OrDefault {#todecimal128ordefault}

[`toDecimal128`](#todecimal128) と同様に、この関数は入力値を [Decimal(38, S)](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。

**構文**

```sql
toDecimal128OrDefault(expr, S[, default])
```

**引数**

- `expr` — 数字の文字列表現。 [String](../data-types/string.md).
- `S` — 数字の小数部に持つことができる桁数を指定する0から38までのスケールパラメータ。 [UInt8](../data-types/int-uint.md).
- `default` (オプション) — `Decimal128(S)`型へのパースが失敗した場合に返されるデフォルト値。 [Decimal128(S)](../data-types/decimal.md).

サポートされている引数:
- (U)Int8/16/32/64/128/256型の文字列表現。
- Float32/64型の文字列表現。

サポートされていない引数:
- Float32/64値 `NaN` と `Inf` の文字列表現。
- バイナリおよび16進数値の文字列表現、例: `SELECT toDecimal128OrDefault('0xc0fe', 1);`.

:::note
`expr` の値が `Decimal128` の範囲を超えるとオーバーフローが発生する可能性があります: `( -1 * 10^(38 - S), 1 * 10^(38 - S) )`.
小数部分の過剰な桁は切り捨てられます（丸められません）。
整数部分の過剰な桁はエラーを引き起こします。
:::

:::warning
変換処理において、余分な桁がドロップされ、Float32/Float64入力を扱う際には予期しない動作をする可能性があります。操作は浮動小数点命令を使用して行われます。
例えば: `toDecimal128OrDefault(1.15, 2)` は `1.14` に等しいです。なぜなら、1.15 * 100 が浮動小数点では114.99になるからです。
文字列入力を使用することで、操作は基になる整数型を使用できます: `toDecimal128OrDefault('1.15', 2) = 1.15`
:::

**返される値**

- 成功した場合は `Decimal(38, S)` 型の値を返し、そうでない場合は渡されたデフォルト値を返すか、渡されなかった場合は `0` を返します。 [Decimal128(S)](../data-types/decimal.md).

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

- [`toDecimal128`](#todecimal128).
- [`toDecimal128OrZero`](#todecimal128orzero).
- [`toDecimal128OrNull`](#todecimal128ornull).
## toDecimal256 {#todecimal256}

入力値をスケール `S` を持つ [`Decimal(76, S)`](../data-types/decimal.md) 型の値に変換します。エラーが発生した場合は例外がスローされます。

**構文**

```sql
toDecimal256(expr, S)
```

**引数**

- `expr` — 数字を返す式または数字の文字列表現。 [Expression](/sql-reference/syntax#expressions).
- `S` — 数字の小数部に持つことができる桁数を指定する0から76までのスケールパラメータ。 [UInt8](../data-types/int-uint.md).

サポートされている引数:
- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値または文字列表現。

サポートされていない引数:
- Float32/64値 `NaN` と `Inf` の場合の値または文字列表現（ケースインセンシティブ）。
- バイナリおよび16進数値の文字列表現、例: `SELECT toDecimal256('0xc0fe', 1);`.

:::note
`expr` の値が `Decimal256` の範囲を超えるとオーバーフローが発生する可能性があります: `( -1 * 10^(76 - S), 1 * 10^(76 - S) )`.
小数部分の過剰な桁は切り捨てられます（丸められません）。
整数部分の過剰な桁は例外を引き起こします。
:::

:::warning
変換処理において、余分な桁がドロップされ、Float32/Float64入力を扱う際には予期しない動作をする可能性があります。操作は浮動小数点命令を使用して行われます。
例えば: `toDecimal256(1.15, 2)` は `1.14` に等しいです。なぜなら、1.15 * 100 が浮動小数点では114.99になるからです。
文字列入力を使用することで、操作は基になる整数型を使用できます: `toDecimal256('1.15', 2) = 1.15`
:::

**返される値**

- `Decimal(76, S)` 型の値。 [Decimal256(S)](../data-types/int-uint.md).

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

- [`toDecimal256OrZero`](#todecimal256orzero).
- [`toDecimal256OrNull`](#todecimal256ornull).
- [`toDecimal256OrDefault`](#todecimal256ordefault).
## toDecimal256OrZero {#todecimal256orzero}

[`toDecimal256`](#todecimal256) と同様に、この関数は入力値を [Decimal(76, S)](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toDecimal256OrZero(expr, S)
```

**引数**

- `expr` — 数字の文字列表現。 [String](../data-types/string.md).
- `S` — 数字の小数部に持つことができる桁数を指定する0から76までのスケールパラメータ。 [UInt8](../data-types/int-uint.md).

サポートされている引数:
- (U)Int8/16/32/64/128/256型の文字列表現。
- Float32/64型の文字列表現。

サポートされていない引数:
- Float32/64値 `NaN` と `Inf` の文字列表現。
- バイナリおよび16進数値の文字列表現、例: `SELECT toDecimal256OrZero('0xc0fe', 1);`.

:::note
`expr` の値が `Decimal256` の範囲を超えるとオーバーフローが発生する可能性があります: `( -1 * 10^(76 - S), 1 * 10^(76 - S) )`.
小数部分の過剰な桁は切り捨てられます（丸められません）。
整数部分の過剰な桁はエラーを引き起こします。
:::

**返される値**

- 成功した場合は `Decimal(76, S)` 型の値を返し、そうでない場合は `0` を返します。 [Decimal256(S)](../data-types/decimal.md).

**例**

クエリ:

```sql
SELECT
    toDecimal256OrZero(toString(0.0001), 76) AS a,
    toTypeName(a),
    toDecimal256OrZero(toString('Inf'), 76) as b,
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

- [`toDecimal256`](#todecimal256).
- [`toDecimal256OrNull`](#todecimal256ornull).
- [`toDecimal256OrDefault`](#todecimal256ordefault).
## toDecimal256OrNull {#todecimal256ornull}

[`toDecimal256`](#todecimal256) と同様に、この関数は入力値を [Nullable(Decimal(76, S))](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toDecimal256OrNull(expr, S)
```

**引数**

- `expr` — 数字の文字列表現。 [String](../data-types/string.md).
- `S` — 数字の小数部に持つことができる桁数を指定する0から76までのスケールパラメータ。 [UInt8](../data-types/int-uint.md).

サポートされている引数:
- (U)Int8/16/32/64/128/256型の文字列表現。
- Float32/64型の文字列表現。

サポートされていない引数:
- Float32/64値 `NaN` と `Inf` の文字列表現。
- バイナリおよび16進数値の文字列表現、例: `SELECT toDecimal256OrNull('0xc0fe', 1);`.

:::note
`expr` の値が `Decimal256` の範囲を超えるとオーバーフローが発生する可能性があります: `( -1 * 10^(76 - S), 1 * 10^(76 - S) )`.
小数部分の過剰な桁は切り捨てられます（丸められません）。
整数部分の過剰な桁はエラーを引き起こします。
:::

**返される値**

- 成功した場合は `Nullable(Decimal(76, S))` 型の値を返し、そうでない場合は同じ型の `NULL` 値を返します。 [Decimal256(S)](../data-types/decimal.md).

**例**

クエリ:

```sql
SELECT
    toDecimal256OrNull(toString(1/42), 76) AS a,
    toTypeName(a),
    toDecimal256OrNull(toString('Inf'), 76) as b,
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

- [`toDecimal256`](#todecimal256).
- [`toDecimal256OrZero`](#todecimal256orzero).
- [`toDecimal256OrDefault`](#todecimal256ordefault).
## toDecimal256OrDefault {#todecimal256ordefault}

[`toDecimal256`](#todecimal256) と同様に、この関数は入力値を [Decimal(76, S)](../data-types/decimal.md) 型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。

**構文**

```sql
toDecimal256OrDefault(expr, S[, default])
```

**引数**

- `expr` — 数字の文字列表現。 [String](../data-types/string.md).
- `S` — 数字の小数部に持つことができる桁数を指定する0から76までのスケールパラメータ。 [UInt8](../data-types/int-uint.md).
- `default` (オプション) — `Decimal256(S)`型へのパースが失敗した場合に返されるデフォルト値。 [Decimal256(S)](../data-types/decimal.md).

サポートされている引数:
- (U)Int8/16/32/64/128/256型の文字列表現。
- Float32/64型の文字列表現。

サポートされていない引数:
- Float32/64値 `NaN` と `Inf` の文字列表現。
- バイナリおよび16進数値の文字列表現、例: `SELECT toDecimal256OrDefault('0xc0fe', 1);`.

:::note
`expr` の値が `Decimal256` の範囲を超えるとオーバーフローが発生する可能性があります: `( -1 * 10^(76 - S), 1 * 10^(76 - S) )`.
小数部分の過剰な桁は切り捨てられます（丸められません）。
整数部分の過剰な桁はエラーを引き起こします。
:::

:::warning
変換処理において、余分な桁がドロップされ、Float32/Float64入力を扱う際には予期しない動作をする可能性があります。操作は浮動小数点命令を使用して行われます。
例えば: `toDecimal256OrDefault(1.15, 2)` は `1.14` に等しいです。なぜなら、1.15 * 100 が浮動小数点では114.99になるからです。
文字列入力を使用することで、操作は基になる整数型を使用できます: `toDecimal256OrDefault('1.15', 2) = 1.15`
:::

**返される値**

- 成功した場合は `Decimal(76, S)` 型の値を返し、そうでない場合は渡されたデフォルト値を返すか、渡されなかった場合は `0` を返します。 [Decimal256(S)](../data-types/decimal.md).

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

- [`toDecimal256`](#todecimal256).
- [`toDecimal256OrZero`](#todecimal256orzero).
- [`toDecimal256OrNull`](#todecimal256ornull).
## toString {#tostring}

数字、文字列（固定文字列ではない）、日付、および日時の間で変換する関数。
これらの関数はすべて1つの引数を受け取ります。

文字列への変換または文字列からの変換を行う際、値はTabSeparated形式（およびほぼすべての他のテキスト形式）に対して同じルールを使用してフォーマットまたは解析されます。文字列を解析できない場合、例外がスローされ、リクエストがキャンセルされます。

日付を数値に変換する場合、またはその逆において、日付はUnixエポックの開始からの日数を表します。
日時を数値に変換する場合、またはその逆において、日時はUnixエポックの開始からの秒数を表します。

toDate/toDateTime関数の日付および日時形式は以下のように定義されます：

```response
YYYY-MM-DD
YYYY-MM-DD hh:mm:ss
```

例外として、UInt32、Int32、UInt64、またはInt64の数値型から日付に変換する場合、かつ、数値が65536以上である場合、その数値はUnixタイムスタンプとして解釈され（日数としてではなく）、日付に丸められます。これにより、`toDate(unix_timestamp)`を書き込む一般的な発生をサポートします。さもなければエラーが発生し、より面倒な`toDate(toDateTime(unix_timestamp))`を書く必要があります。

日付と日時の間の変換は、自然な方法で行われます：nullの時間を追加するか、時間を削除します。

数値型間の変換は、C++における異なる数値型間の代入と同じルールを使用します。

さらに、DateTime引数のtoString関数は、タイムゾーン名を含む2番目の文字列引数を受け取ることができます。例: `Asia/Yekaterinburg` この場合、時間は指定されたタイムゾーンに従ってフォーマットされます。

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

結果:

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

また、`toUnixTimestamp`関数も参照してください。
## toFixedString {#tofixedstring}

[文字列](../data-types/string.md)型の引数を[FixedString(N)](../data-types/fixedstring.md)型（固定長Nの文字列）に変換します。文字列のバイト数がN未満の場合、右側にヌルバイトでパディングされます。文字列のバイト数がNを超える場合、例外がスローされます。

**構文**

```sql
toFixedString(s, N)
```

**引数**

- `s` — 固定文字列に変換する文字列です。[文字列](../data-types/string.md)。
- `N` — 長さN。[UInt8](../data-types/int-uint.md)

**返される値**

- `s`のN長固定文字列です。[FixedString](../data-types/fixedstring.md)。

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

文字列またはFixedString引数を受け取ります。最初に見つかったヌルバイトで切り捨てられた文字列を返します。

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

数値を文字列に変換し、出力の小数点以下の桁数をユーザーが指定します。

**構文**

```sql
toDecimalString(number, scale)
```

**引数**

- `number` — 文字列として表現される値。[Int, UInt](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Decimal](../data-types/decimal.md)。
- `scale` — 小数点以下の桁数。[UInt8](../data-types/int-uint.md)。
    * [Decimal](../data-types/decimal.md)および[Int, UInt](../data-types/int-uint.md)型の最大スケールは77です（これはDecimalにおける有効数字の最大数です）。
    * [Float](../data-types/float.md)の最大スケールは60です。

**返される値**

- 指定された小数点以下の桁数（スケール）を持つ[文字列](../data-types/string.md)として表現された入力値。要求されたスケールが元の数値のスケールよりも小さい場合、数値は一般的な算術に従って丸められます。

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

入力値をUInt8型の値として扱うことによってバイト再解釈を行います。[`CAST`](#cast)とは異なり、元の値を保持しようとはしていません。ターゲット型が入力型を表現できない場合、出力は意味を持ちません。

**構文**

```sql
reinterpretAsUInt8(x)
```

**引数**

- `x`: UInt8として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[文字列](../data-types/string.md)か[FixedString](../data-types/fixedstring.md)。

**返される値**

- 再解釈された値`x`をUInt8として。[UInt8](/sql-reference/data-types/int-uint)。

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

入力値をUInt16型の値として扱うことによってバイト再解釈を行います。[`CAST`](#cast)とは異なり、元の値を保持しようとはしていません。ターゲット型が入力型を表現できない場合、出力は意味を持ちません。

**構文**

```sql
reinterpretAsUInt16(x)
```

**引数**

- `x`: UInt16として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[文字列](../data-types/string.md)か[FixedString](../data-types/fixedstring.md)。

**返される値**

- 再解釈された値`x`をUInt16として。[UInt16](/sql-reference/data-types/int-uint)。

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

入力値をUInt32型の値として扱うことによってバイト再解釈を行います。[`CAST`](#cast)とは異なり、元の値を保持しようとはしていません。ターゲット型が入力型を表現できない場合、出力は意味を持ちません。

**構文**

```sql
reinterpretAsUInt32(x)
```

**引数**

- `x`: UInt32として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[文字列](../data-types/string.md)か[FixedString](../data-types/fixedstring.md)。

**返される値**

- 再解釈された値`x`をUInt32として。[UInt32](/sql-reference/data-types/int-uint)。

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

入力値をUInt64型の値として扱うことによってバイト再解釈を行います。[`CAST`](#cast)とは異なり、元の値を保持しようとはしていません。ターゲット型が入力型を表現できない場合、出力は意味を持ちません。

**構文**

```sql
reinterpretAsUInt64(x)
```

**引数**

- `x`: UInt64として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[文字列](../data-types/string.md)か[FixedString](../data-types/fixedstring.md)。

**返される値**

- 再解釈された値`x`をUInt64として。[UInt64](/sql-reference/data-types/int-uint)。

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

入力値をUInt128型の値として扱うことによってバイト再解釈を行います。[`CAST`](#cast)とは異なり、元の値を保持しようとはしていません。ターゲット型が入力型を表現できない場合、出力は意味を持ちません。

**構文**

```sql
reinterpretAsUInt128(x)
```

**引数**

- `x`: UInt128として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[文字列](../data-types/string.md)か[FixedString](../data-types/fixedstring.md)。

**返される値**

- 再解釈された値`x`をUInt128として。[UInt128](/sql-reference/data-types/int-uint)。

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

入力値をUInt256型の値として扱うことによってバイト再解釈を行います。[`CAST`](#cast)とは異なり、元の値を保持しようとはしていません。ターゲット型が入力型を表現できない場合、出力は意味を持ちません。

**構文**

```sql
reinterpretAsUInt256(x)
```

**引数**

- `x`: UInt256として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[文字列](../data-types/string.md)か[FixedString](../data-types/fixedstring.md)。

**返される値**

- 再解釈された値`x`をUInt256として。[UInt256](/sql-reference/data-types/int-uint)。

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

入力値をInt8型の値として扱うことによってバイト再解釈を行います。[`CAST`](#cast)とは異なり、元の値を保持しようとはしていません。ターゲット型が入力型を表現できない場合、出力は意味を持ちません。

**構文**

```sql
reinterpretAsInt8(x)
```

**引数**

- `x`: Int8として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[文字列](../data-types/string.md)か[FixedString](../data-types/fixedstring.md)。

**返される値**

- 再解釈された値`x`をInt8として。[Int8](/sql-reference/data-types/int-uint#integer-ranges)。

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

入力値をInt16型の値として扱うことによってバイト再解釈を行います。[`CAST`](#cast)とは異なり、元の値を保持しようとはしていません。ターゲット型が入力型を表現できない場合、出力は意味を持ちません。

**構文**

```sql
reinterpretAsInt16(x)
```

**引数**

- `x`: Int16として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[文字列](../data-types/string.md)か[FixedString](../data-types/fixedstring.md)。

**返される値**

- 再解釈された値`x`をInt16として。[Int16](/sql-reference/data-types/int-uint#integer-ranges)。

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

入力値をInt32型の値として扱うことによってバイト再解釈を行います。[`CAST`](#cast)とは異なり、元の値を保持しようとはしていません。ターゲット型が入力型を表現できない場合、出力は意味を持ちません。

**構文**

```sql
reinterpretAsInt32(x)
```

**引数**

- `x`: Int32として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[文字列](../data-types/string.md)か[FixedString](../data-types/fixedstring.md)。

**返される値**

- 再解釈された値`x`をInt32として。[Int32](/sql-reference/data-types/int-uint#integer-ranges)。

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

入力値をInt64型の値として扱うことによってバイト再解釈を行います。[`CAST`](#cast)とは異なり、元の値を保持しようとはしていません。ターゲット型が入力型を表現できない場合、出力は意味を持ちません。

**構文**

```sql
reinterpretAsInt64(x)
```

**引数**

- `x`: Int64として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[文字列](../data-types/string.md)か[FixedString](../data-types/fixedstring.md)。

**返される値**

- 再解釈された値`x`をInt64として。[Int64](/sql-reference/data-types/int-uint#integer-ranges)。

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

入力値をInt128型の値として扱うことによってバイト再解釈を行います。[`CAST`](#cast)とは異なり、元の値を保持しようとはしていません。ターゲット型が入力型を表現できない場合、出力は意味を持ちません。

**構文**

```sql
reinterpretAsInt128(x)
```

**引数**

- `x`: Int128として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[文字列](../data-types/string.md)か[FixedString](../data-types/fixedstring.md)。

**返される値**

- 再解釈された値`x`をInt128として。[Int128](/sql-reference/data-types/int-uint#integer-ranges)。

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

入力値をInt256型の値として扱うことによってバイト再解釈を行います。[`CAST`](#cast)とは異なり、元の値を保持しようとはしていません。ターゲット型が入力型を表現できない場合、出力は意味を持ちません。

**構文**

```sql
reinterpretAsInt256(x)
```

**引数**

- `x`: Int256として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[文字列](../data-types/string.md)か[FixedString](../data-types/fixedstring.md)。

**返される値**

- 再解釈された値`x`をInt256として。[Int256](/sql-reference/data-types/int-uint#integer-ranges)。

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

入力値をFloat32型の値として扱うことによってバイト再解釈を行います。[`CAST`](#cast)とは異なり、元の値を保持しようとはしていません。ターゲット型が入力型を表現できない場合、出力は意味を持ちません。

**構文**

```sql
reinterpretAsFloat32(x)
```

**引数**

- `x`: Float32として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[文字列](../data-types/string.md)か[FixedString](../data-types/fixedstring.md)。

**返される値**

- 再解釈された値`x`をFloat32として。[Float32](../data-types/float.md)。

**例**

クエリ:

```sql
SELECT reinterpretAsUInt32(toFloat32(0.2)) as x, reinterpretAsFloat32(x);
```

結果:

```response
┌──────────x─┬─reinterpretAsFloat32(x)─┐
│ 1045220557 │                     0.2 │
└────────────┴─────────────────────────┘
```
## reinterpretAsFloat64 {#reinterpretasfloat64}

入力値をFloat64型の値として扱うことによってバイト再解釈を行います。[`CAST`](#cast)とは異なり、元の値を保持しようとはしていません。ターゲット型が入力型を表現できない場合、出力は意味を持ちません。

**構文**

```sql
reinterpretAsFloat64(x)
```

**引数**

- `x`: Float64として再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[文字列](../data-types/string.md)か[FixedString](../data-types/fixedstring.md)。

**返される値**

- 再解釈された値`x`をFloat64として。[Float64](../data-types/float.md)。

**例**

クエリ:

```sql
SELECT reinterpretAsUInt64(toFloat64(0.2)) as x, reinterpretAsFloat64(x);
```

結果:

```response
┌───────────────────x─┬─reinterpretAsFloat64(x)─┐
│ 4596373779694328218 │                     0.2 │
└─────────────────────┴─────────────────────────┘
```
## reinterpretAsDate {#reinterpretasdate}

文字列、固定文字列、または数値を受け取り、ホストオーダー（リトルエンディアン）で数値としてバイトを解釈します。Unix Epochの始まり以来の日数として解釈された数値から日付を返します。

**構文**

```sql
reinterpretAsDate(x)
```

**引数**

- `x`: Unix Epochの始まり以来の日数。[ (U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[文字列](../data-types/string.md)か[FixedString](../data-types/fixedstring.md)。

**返される値**

- 日付。[Date](../data-types/date.md)。

**実装に関する詳細**

:::note
提供された文字列が十分な長さでない場合、関数は、必要な数のヌルバイトでパディングされた文字列として動作します。文字列が必要よりも長い場合、余分なバイトは無視されます。
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

これらの関数は文字列を受け取り、文字列の先頭に配置されたバイトをホストオーダー（リトルエンディアン）で数値として解釈します。Unix Epochの始まり以来の秒数として解釈された数値から日付と時刻を返します。

**構文**

```sql
reinterpretAsDateTime(x)
```

**引数**

- `x`: Unix Epochの始まり以来の秒数。[ (U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[文字列](../data-types/string.md)か[FixedString](../data-types/fixedstring.md)。

**返される値**

- 日付と時刻。[DateTime](../data-types/datetime.md)。

**実装に関する詳細**

:::note
提供された文字列が十分な長さでない場合、関数は、必要な数のヌルバイトでパディングされた文字列として動作します。文字列が必要よりも長い場合、余分なバイトは無視されます。
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

この関数は数値、日付、または時刻付きの日付を受け取り、ホストオーダー（リトルエンディアン）で対応する値を表すバイトを含む文字列を返します。ヌルバイトは末尾から削除されます。たとえば、UInt32型の値255は、1バイトの長さの文字列になります。

**構文**

```sql
reinterpretAsString(x)
```

**引数**

- `x`: 文字列に再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)。

**返される値**

- `x`を表すバイトを含む文字列。[String](../data-types/fixedstring.md)。

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

この関数は数値、日付、または時刻付きの日付を受け取り、ホストオーダー（リトルエンディアン）で対応する値を表すバイトを含むFixedStringを返します。ヌルバイトは末尾から削除されます。たとえば、UInt32型の値255は、1バイトの長さのFixedStringになります。

**構文**

```sql
reinterpretAsFixedString(x)
```

**引数**

- `x`: 文字列に再解釈する値。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)。

**返される値**

- `x`を表すバイトを含むFixedString。[FixedString](../data-types/fixedstring.md)。

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
ここにリストされているUUID関数に加えて、専用の[UUID関数ドキュメント](../functions/uuid-functions.md)もあります。
:::

16バイトの文字列を受け取り、各8バイトの半分をリトルエンディアンバイト順で解釈してUUIDを返します。文字列が十分な長さでない場合、関数は、必要な数のヌルバイトで末尾までパディングされた文字列として動作します。文字列が16バイトを超える場合、末尾の余分なバイトは無視されます。

**構文**

```sql
reinterpretAsUUID(fixed_string)
```

**引数**

- `fixed_string` — ビッグエンディアンバイト文字列。[FixedString](/sql-reference/data-types/fixedstring)。

**返される値**

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

文字列とUUIDの往復変換。

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

メモリ内の同じバイトシーケンスを`x`値に使用し、これをターゲット型に再解釈します。

**構文**

```sql
reinterpret(x, type)
```

**引数**

- `x` — 任意の型。
- `type` — ターゲット型。[文字列](../data-types/string.md)。

**返される値**

- ターゲット型の値。

**例**

クエリ:
```sql
SELECT reinterpret(toInt8(-1), 'UInt8') as int_to_uint,
    reinterpret(toInt8(1), 'Float32') as int_to_float,
    reinterpret('1', 'UInt32') as string_to_int;
```

結果:

```text
┌─int_to_uint─┬─int_to_float─┬─string_to_int─┐
│         255 │        1e-45 │            49 │
└─────────────┴──────────────┴───────────────┘
```
## CAST {#cast}

入力値を指定されたデータ型に変換します。[reinterpret](#reinterpret)関数とは異なり、`CAST`は新しいデータ型を使用して同じ値を表すことを試みます。変換できない場合、例外が発生します。
いくつかの構文バリアントがサポートされています。

**構文**

```sql
CAST(x, T)
CAST(x AS t)
x::t
```

**引数**

- `x` — 変換する値。任意の型であることができます。
- `T` — ターゲットデータ型の名前。[文字列](../data-types/string.md)。
- `t` — ターゲットデータ型。

**返される値**

- 変換された値。

:::note
入力値がターゲット型の範囲に収まらない場合、結果はオーバーフローします。例えば、`CAST(-1, 'UInt8')`は`255`を返します。
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

[FixedString (N)](../data-types/fixedstring.md)への変換は、[文字列](../data-types/string.md)型または[FixedString](../data-types/fixedstring.md)型の引数に対してのみ機能します。

[Nullable](../data-types/nullable.md)型への型変換とその逆もサポートされています。

**例**

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

**参照**

- [cast_keep_nullable](../../operations/settings/settings.md/#cast_keep_nullable)設定
## accurateCast(x, T) {#accuratecastx-t}

`x`を`T`データ型に変換します。

[cast](#cast)との違いは、`accurateCast`は型値`x`が型`T`の範囲に収まらない場合、数値型のオーバーフローを許可しない点です。例えば、`accurateCast(-1, 'UInt8')`は例外をスローします。

**例**

クエリ:

```sql
SELECT cast(-1, 'UInt8') as uint8;
```

結果:

```response
┌─uint8─┐
│   255 │
└───────┘
```

クエリ:

```sql
SELECT accurateCast(-1, 'UInt8') as uint8;
```

結果:

```response
Code: 70. DB::Exception: Received from localhost:9000. DB::Exception: Value in column Int8 cannot be safely converted into type UInt8: While processing accurateCast(-1, 'UInt8') AS uint8.
```
## accurateCastOrNull(x, T) {#accuratecastornullx-t}

入力値`x`を指定されたデータ型`T`に変換します。常に[Nullable](../data-types/nullable.md)型を返し、キャストした値がターゲット型で表現できない場合は[NULL](/sql-reference/syntax#null)を返します。

**構文**

```sql
accurateCastOrNull(x, T)
```

**引数**

- `x` — 入力値。
- `T` — 返されるデータ型の名前。

**返される値**

- 指定されたデータ型`T`に変換された値。

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
    accurateCastOrNull(-1, 'UInt8') as uint8,
    accurateCastOrNull(128, 'Int8') as int8,
    accurateCastOrNull('Test', 'FixedString(2)') as fixed_string;
```

結果:

```response
┌─uint8─┬─int8─┬─fixed_string─┐
│  ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ         │
└───────┴──────┴──────────────┘
```
## accurateCastOrDefault(x, T[, default_value]) {#accuratecastordefaultx-t-default_value}

入力値 `x` を指定されたデータ型 `T` に変換します。キャストされた値がターゲット型で表現可能でない場合は、デフォルトの型値または指定した `default_value` を返します。

**構文**

```sql
accurateCastOrDefault(x, T)
```

**引数**

- `x` — 入力値。
- `T` — 返されるデータ型の名称。
- `default_value` — 返されるデータ型のデフォルト値。

**返される値**

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
    accurateCastOrDefault(-1, 'UInt8') as uint8,
    accurateCastOrDefault(-1, 'UInt8', 5) as uint8_default,
    accurateCastOrDefault(128, 'Int8') as int8,
    accurateCastOrDefault(128, 'Int8', 5) as int8_default,
    accurateCastOrDefault('Test', 'FixedString(2)') as fixed_string,
    accurateCastOrDefault('Test', 'FixedString(2)', 'Te') as fixed_string_default;
```

結果:

```response
┌─uint8─┬─uint8_default─┬─int8─┬─int8_default─┬─fixed_string─┬─fixed_string_default─┐
│     0 │             5 │    0 │            5 │              │ Te                   │
└───────┴───────────────┴──────┴──────────────┴──────────────┴──────────────────────┘
```
## toInterval {#toInterval}

数値と間隔単位（例： 'second' や 'day'）から [Interval](../../sql-reference/data-types/special-data-types/interval.md) データ型の値を作成します。

**構文**

```sql
toInterval(value, unit)
```

**引数**

- `value` — インターバルの長さ。整数またはその文字列表現、および浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。
  
- `unit` — 作成するインターバルの型。[String Literal](/sql-reference/syntax#string)。
    可能な値:
    
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

    `unit` 引数は大文字と小文字を区別しません。

**返される値**

- 結果のインターバル。[Interval](../../sql-reference/data-types/special-data-types/interval.md)

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

データ型 [IntervalYear](../data-types/special-data-types/interval.md) の `n` 年のインターバルを返します。

**構文**

```sql
toIntervalYear(n)
```

**引数**

- `n` — 年数。整数またはその文字列表現、および浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n` 年のインターバル。[IntervalYear](../data-types/special-data-types/interval.md)。

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

データ型 [IntervalQuarter](../data-types/special-data-types/interval.md) の `n` 四半期のインターバルを返します。

**構文**

```sql
toIntervalQuarter(n)
```

**引数**

- `n` — 四半期数。整数またはその文字列表現、および浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n` 四半期のインターバル。[IntervalQuarter](../data-types/special-data-types/interval.md)。

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

データ型 [IntervalMonth](../data-types/special-data-types/interval.md) の `n` 月のインターバルを返します。

**構文**

```sql
toIntervalMonth(n)
```

**引数**

- `n` — 月数。整数またはその文字列表現、および浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n` 月のインターバル。[IntervalMonth](../data-types/special-data-types/interval.md)。

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

データ型 [IntervalWeek](../data-types/special-data-types/interval.md) の `n` 週間のインターバルを返します。

**構文**

```sql
toIntervalWeek(n)
```

**引数**

- `n` — 週間数。整数またはその文字列表現、および浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n` 週間のインターバル。[IntervalWeek](../data-types/special-data-types/interval.md)。

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

データ型 [IntervalDay](../data-types/special-data-types/interval.md) の `n` 日のインターバルを返します。

**構文**

```sql
toIntervalDay(n)
```

**引数**

- `n` — 日数。整数またはその文字列表現、および浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n` 日のインターバル。[IntervalDay](../data-types/special-data-types/interval.md)。

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

データ型 [IntervalHour](../data-types/special-data-types/interval.md) の `n` 時間のインターバルを返します。

**構文**

```sql
toIntervalHour(n)
```

**引数**

- `n` — 時間数。整数またはその文字列表現、および浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n` 時間のインターバル。[IntervalHour](../data-types/special-data-types/interval.md)。

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

データ型 [IntervalMinute](../data-types/special-data-types/interval.md) の `n` 分のインターバルを返します。

**構文**

```sql
toIntervalMinute(n)
```

**引数**

- `n` — 分数。整数またはその文字列表現、および浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n` 分のインターバル。[IntervalMinute](../data-types/special-data-types/interval.md)。

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

データ型 [IntervalSecond](../data-types/special-data-types/interval.md) の `n` 秒のインターバルを返します。

**構文**

```sql
toIntervalSecond(n)
```

**引数**

- `n` — 秒数。整数またはその文字列表現、および浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n` 秒のインターバル。[IntervalSecond](../data-types/special-data-types/interval.md)。

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

データ型 [IntervalMillisecond](../data-types/special-data-types/interval.md) の `n` ミリ秒のインターバルを返します。

**構文**

```sql
toIntervalMillisecond(n)
```

**引数**

- `n` — ミリ秒数。整数またはその文字列表現、および浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n` ミリ秒のインターバル。[IntervalMilliseconds](../data-types/special-data-types/interval.md)。

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

データ型 [IntervalMicrosecond](../data-types/special-data-types/interval.md) の `n` マイクロ秒のインターバルを返します。

**構文**

```sql
toIntervalMicrosecond(n)
```

**引数**

- `n` — マイクロ秒数。整数またはその文字列表現、および浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n` マイクロ秒のインターバル。[IntervalMicrosecond](../data-types/special-data-types/interval.md)。

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

データ型 [IntervalNanosecond](../data-types/special-data-types/interval.md) の `n` ナノ秒のインターバルを返します。

**構文**

```sql
toIntervalNanosecond(n)
```

**引数**

- `n` — ナノ秒数。整数またはその文字列表現、および浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n` ナノ秒のインターバル。[IntervalNanosecond](../data-types/special-data-types/interval.md)。

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

この関数は、関数 [formatDateTime](/sql-reference/functions/date-time-functions#formatdatetime) の逆操作です。

**構文**

```sql
parseDateTime(str[, format[, timezone]])
```

**引数**

- `str` — パース対象の文字列
- `format` — フォーマット文字列。省略時は `%Y-%m-%d %H:%i:%s` です。
- `timezone` — [Timezone](operations/server-configuration-parameters/settings.md#timezone)。省略可能。

**返される値**

入力文字列から MySQLスタイルのフォーマット文字列に従ってパースした [DateTime](../data-types/datetime.md) 値を返します。

**サポートされているフォーマット指定子**

[formatDateTime](/sql-reference/functions/date-time-functions#formatdatetime) にリストされているすべてのフォーマット指定子。ただし:
- %Q: 四半期 (1-4)

**例**

```sql
SELECT parseDateTime('2021-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')

┌─parseDateTime('2021-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')─┐
│                                       2021-01-04 23:00:00 │
└───────────────────────────────────────────────────────────┘
```

エイリアス: `TO_TIMESTAMP`.
## parseDateTimeOrZero {#parsedatetimeorzero}

[parseDateTime](#parsedatetime) と同様ですが、処理できない日付フォーマットに遭遇した場合はゼロの日付を返します。
## parseDateTimeOrNull {#parsedatetimeornull}

[parseDateTime](#parsedatetime) と同様ですが、処理できない日付フォーマットに遭遇した場合は `NULL` を返します。

エイリアス: `str_to_date`.
## parseDateTimeInJodaSyntax {#parsedatetimeinjodasyntax}

[parseDateTime](#parsedatetime) と似ていますが、フォーマット文字列が MySQL 構文の代わりに [Joda](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html) にあります。

この関数は、関数 [formatDateTimeInJodaSyntax](/sql-reference/functions/date-time-functions#formatdatetimeinjodasyntax) の逆操作です。

**構文**

```sql
parseDateTimeInJodaSyntax(str[, format[, timezone]])
```

**引数**

- `str` — パース対象の文字列
- `format` — フォーマット文字列。省略時は `yyyy-MM-dd HH:mm:ss` です。
- `timezone` — [Timezone](operations/server-configuration-parameters/settings.md#timezone)。省略可能。

**返される値**

入力文字列から Jodaスタイルのフォーマット文字列に従ってパースした [DateTime](../data-types/datetime.md) 値を返します。

**サポートされているフォーマット指定子**

すべてのフォーマット指定子は [formatDateTimeInJoda](/sql-reference/functions/date-time-functions#formatdatetime) にリストされていますが、次のものは除外されます:
- S: 小数秒
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

[parseDateTimeInJodaSyntax](#parsedatetimeinjodasyntax) と同様ですが、処理できない日付フォーマットに遭遇した場合はゼロの日付を返します。
## parseDateTimeInJodaSyntaxOrNull {#parsedatetimeinjodasyntaxornull}

[parseDateTimeInJodaSyntax](#parsedatetimeinjodasyntax) と同様ですが、処理できない日付フォーマットに遭遇した場合は `NULL` を返します。
## parseDateTime64 {#parsedatetime64}

[MySQL フォーマット文字列](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format) に従って、[String](../data-types/string.md) を [DateTime64](../data-types/datetime64.md) に変換します。

**構文**

```sql
parseDateTime64(str[, format[, timezone]])
```

**引数**

- `str` — パース対象の文字列。
- `format` — フォーマット文字列。省略時は `%Y-%m-%d %H:%i:%s.%f` です。
- `timezone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。省略可能。

**返される値**

入力文字列から MySQLスタイルのフォーマット文字列に従ってパースした [DateTime64](../data-types/datetime64.md) 値を返します。
返される値の精度は 6 です。
## parseDateTime64OrZero {#parsedatetime64orzero}

[parseDateTime64](#parsedatetime64) と同様ですが、処理できない日付フォーマットに遭遇した場合はゼロの日付を返します。
## parseDateTime64OrNull {#parsedatetime64ornull}

[parseDateTime64](#parsedatetime64) と同様ですが、処理できない日付フォーマットに遭遇した場合は `NULL` を返します。
## parseDateTime64InJodaSyntax {#parsedatetime64injodasyntax}

[Jodaフォーマット文字列](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html) に従って [String](../data-types/string.md) を [DateTime64](../data-types/datetime64.md) に変換します。

**構文**

```sql
parseDateTime64InJodaSyntax(str[, format[, timezone]])
```

**引数**

- `str` — パース対象の文字列。
- `format` — フォーマット文字列。省略時は `yyyy-MM-dd HH:mm:ss` です。
- `timezone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。省略可能。

**返される値**

入力文字列から Jodaスタイルのフォーマット文字列に従ってパースした [DateTime64](../data-types/datetime64.md) 値を返します。
返される値の精度はフォーマット文字列内の `S` プレースホルダーの数に等しい（ただし最大で 6）。
## parseDateTime64InJodaSyntaxOrZero {#parsedatetime64injodasyntaxorzero}

[parseDateTime64InJodaSyntax](#parsedatetime64injodasyntax) と同様ですが、処理できない日付フォーマットに遭遇した場合はゼロの日付を返します。
## parseDateTime64InJodaSyntaxOrNull {#parsedatetime64injodasyntaxornull}

[parseDateTime64InJodaSyntax](#parsedatetime64injodasyntax) と同様ですが、処理できない日付フォーマットに遭遇した場合は `NULL` を返します。
## parseDateTimeBestEffort {#parsedatetimebesteffort}
## parseDateTime32BestEffort {#parsedatetime32besteffort}

[String](../data-types/string.md) 表現での日時を [DateTime](/sql-reference/data-types/datetime) データ型に変換します。

この関数は [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)、[RFC 1123 - 5.2.14 RFC-822 日付と時刻の仕様](https://tools.ietf.org/html/rfc1123#page-55)、ClickHouse のおよびその他のいくつかの日時形式をパースします。

**構文**

```sql
parseDateTimeBestEffort(time_string [, time_zone])
```

**引数**

- `time_string` — 変換される日付と時刻を含む文字列。[String](../data-types/string.md)。
- `time_zone` — タイムゾーン。この関数は `time_string` をタイムゾーンに従ってパースします。[String](../data-types/string.md)。

**サポートされる非標準フォーマット**

- 9..10 桁の [unix タイムスタンプ](https://en.wikipedia.org/wiki/Unix_time) を含む文字列。
- 日付と時刻コンポーネントを持つ文字列: `YYYYMMDDhhmmss`, `DD/MM/YYYY hh:mm:ss`, `DD-MM-YY hh:mm`, `YYYY-MM-DD hh:mm:ss` など。
- 日付コンポーネントを持つ文字列: `YYYY`, `YYYYMM`, `YYYY*MM`, `DD/MM/YYYY`, `DD-MM-YY` など。
- 日と時刻を含む文字列: `DD`, `DD hh`, `DD hh:mm`。この場合 `MM` は `01` に置き換えられます。
- 日付と時刻、さらにタイムゾーンオフセット情報を含む文字列: `YYYY-MM-DD hh:mm:ss ±h:mm` など。例えば、`2020-12-12 17:36:00 -5:00`。
- [syslog タイムスタンプ](https://datatracker.ietf.org/doc/html/rfc3164#section-4.1.2): `Mmm dd hh:mm:ss`。例えば、`Jun  9 14:20:32`。

すべての形式の分離子を用いた場合、この関数は月の名前を完全な名前でまたは最初の3文字で表現します。例: `24/DEC/18`, `24-Dec-18`, `01-September-2018`。
年が指定されていない場合、それは現在の年と等しいとみなされます。結果の日付時刻が未来のものである（現在の瞬間の後、たった1秒でも）場合、現在の年は前の年に置き換えられます。

**返される値**

- `time_string` を [DateTime](../data-types/datetime.md) データ型に変換します。

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
SELECT toYear(now()) as year, parseDateTimeBestEffort('10 20:19');
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

- [RFC 1123](https://datatracker.ietf.org/doc/html/rfc1123)
- [toDate](#todate)
- [toDateTime](#todatetime)
- [ISO 8601 announcement by @xkcd](https://xkcd.com/1179/)
- [RFC 3164](https://datatracker.ietf.org/doc/html/rfc3164#section-4.1.2)
## parseDateTimeBestEffortUS {#parsedatetimebesteffortus}

この関数は、ISO日付フォーマット（例：`YYYY-MM-DD hh:mm:ss`）と日付と月のコンポーネントが明確に抽出できるその他のフォーマットに対して [parseDateTimeBestEffort](#parsedatetimebesteffort) のように動作します。例えば、`YYYYMMDDhhmmss`、`YYYY-MM`、`DD hh`、`YYYY-MM-DD hh:mm:ss ±h:mm`。日付と月のコンポーネントが明確に抽出できない場合、例えば `MM/DD/YYYY`、`MM-DD-YYYY`、または `MM-DD-YY` の場合、`DD/MM/YYYY`、`DD-MM-YYYY`、または `DD-MM-YY` の代わりに米国の日付形式を優先します。例外として、月が12を超えて31以下の場合、この関数は [parseDateTimeBestEffort](#parsedatetimebesteffort) の動作に戻ります。例えば、`15/08/2020` は `2020-08-15` としてパースされます。
## parseDateTimeBestEffortOrNull {#parsedatetimebesteffortornull}
## parseDateTime32BestEffortOrNull {#parsedatetime32besteffortornull}

[parseDateTimeBestEffort](#parsedatetimebesteffort) と同様ですが、処理できない日付フォーマットに遭遇した場合は `NULL` を返します。
## parseDateTimeBestEffortOrZero {#parsedatetimebesteffortorzero}
## parseDateTime32BestEffortOrZero {#parsedatetime32besteffortorzero}

[parseDateTimeBestEffort](#parsedatetimebesteffort) と同様ですが、処理できない日付フォーマットに遭遇した場合はゼロの日付またはゼロの日付時間を返します。
## parseDateTimeBestEffortUSOrNull {#parsedatetimebesteffortusornull}

[parseDateTimeBestEffortUS](#parsedatetimebesteffortus) 関数と同様ですが、処理できない日付フォーマットに遭遇した場合は `NULL` を返します。
## parseDateTimeBestEffortUSOrZero {#parsedatetimebesteffortusorzero}

[parseDateTimeBestEffortUS](#parsedatetimebesteffortus) 関数と同様ですが、処理できない日付フォーマットに遭遇した場合はゼロの日付（`1970-01-01`）またはゼロの日付と時刻（`1970-01-01 00:00:00`）を返します。
## parseDateTime64BestEffort {#parsedatetime64besteffort}

[parseDateTimeBestEffort](#parsedatetimebesteffort) 関数と同様ですが、ミリ秒とマイクロ秒もパースし、[DateTime](/sql-reference/data-types/datetime) データ型を返します。

**構文**

```sql
parseDateTime64BestEffort(time_string [, precision [, time_zone]])
```

**引数**

- `time_string` — 変換される日付または日付と時刻を含む文字列。[String](../data-types/string.md)。
- `precision` — 必須の精度。`3` — ミリ秒用、`6` — マイクロ秒用。デフォルトは `3`です。省略可能。[UInt8](../data-types/int-uint.md)。
- `time_zone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。この関数は `time_string` をタイムゾーンに従ってパースします。省略可能。[String](../data-types/string.md)。

**返される値**

- `time_string` を [DateTime](../data-types/datetime.md) データ型に変換します。

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

[parseDateTime64BestEffort](#parsedatetime64besteffort) と同様ですが、この関数は曖昧な場合に米国の日付形式（`MM/DD/YYYY` など）を優先します。
## parseDateTime64BestEffortOrNull {#parsedatetime64besteffortornull}

[parseDateTime64BestEffort](#parsedatetime64besteffort) と同様ですが、処理できない日付フォーマットに遭遇した場合は `NULL` を返します。
## parseDateTime64BestEffortOrZero {#parsedatetime64besteffortorzero}

[parseDateTime64BestEffort](#parsedatetime64besteffort) と同様ですが、処理できない日付フォーマットに遭遇した場合はゼロの日付またはゼロの日付時間を返します。
## parseDateTime64BestEffortUSOrNull {#parsedatetime64besteffortusornull}

[parseDateTime64BestEffort](#parsedatetime64besteffort) と同様ですが、曖昧な場合に米国の日付形式（`MM/DD/YYYY` など）を優先し、処理できない日付フォーマットに遭遇した場合は `NULL` を返します。
## parseDateTime64BestEffortUSOrZero {#parsedatetime64besteffortusorzero}

[parseDateTime64BestEffort](#parsedatetime64besteffort) と同様ですが、曖昧な場合に米国の日付形式（`MM/DD/YYYY` など）を優先し、処理できない日付フォーマットに遭遇した場合はゼロの日付またはゼロの日付時間を返します。
## toLowCardinality {#tolowcardinality}

入力パラメータを同じデータ型の [LowCardinality](../data-types/lowcardinality.md) バージョンに変換します。

`LowCardinality` データ型からデータを変換するには、[CAST](#cast) 関数を使用します。例えば、`CAST(x as String)`。

**構文**

```sql
toLowCardinality(expr)
```

**引数**

- `expr` — 一つの [supported data types](/sql-reference/data-types) の結果となる [Expression](/sql-reference/syntax#expressions)。

**返される値**

- `expr` の結果。[LowCardinality](../data-types/lowcardinality.md) の `expr` の型。

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
## toUnixTimestamp64Second {#tounixtimestamp64second}

`DateTime64` を固定秒精度の `Int64` 値に変換します。入力値は、その精度に応じて適切にスケールアップまたはダウンされます。

:::note
出力値は UTC のタイムスタンプであり、`DateTime64` のタイムゾーンではありません。
:::

**構文**

```sql
toUnixTimestamp64Second(value)
```

**引数**

- `value` — 任意の精度の DateTime64 値。[DateTime64](../data-types/datetime64.md)。

**返される値**

- `value` を `Int64` データ型に変換します。[Int64](../data-types/int-uint.md)。

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

`DateTime64` を固定ミリ秒精度の `Int64` 値に変換します。入力値は、その精度に応じて適切にスケールアップまたはダウンされます。

:::note
出力値は UTC のタイムスタンプであり、`DateTime64` のタイムゾーンではありません。
:::

**構文**

```sql
toUnixTimestamp64Milli(value)
```

**引数**

- `value` — 任意の精度の DateTime64 値。[DateTime64](../data-types/datetime64.md)。

**返される値**

- `value` を `Int64` データ型に変換します。[Int64](../data-types/int-uint.md)。

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

`DateTime64` を固定マイクロ秒精度の `Int64` 値に変換します。入力値は、その精度に応じて適切にスケールアップまたはダウンされます。

:::note
出力値は UTC のタイムスタンプであり、`DateTime64` のタイムゾーンではありません。
:::

**構文**

```sql
toUnixTimestamp64Micro(value)
```

**引数**

- `value` — 任意の精度の DateTime64 値。[DateTime64](../data-types/datetime64.md)。

**返される値**

- `value` を `Int64` データ型に変換します。[Int64](../data-types/int-uint.md)。

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

`DateTime64`を固定ナノ秒精度の`Int64`値に変換します。入力値は、その精度に応じて適切にスケーリングされます。

:::note
出力値はUTCのタイムスタンプであり、`DateTime64`のタイムゾーンではありません。
:::

**構文**

```sql
toUnixTimestamp64Nano(value)
```

**引数**

- `value` — 任意の精度を持つDateTime64値。 [DateTime64](../data-types/datetime64.md)。

**返される値**

- `value`が`Int64`データ型に変換されます。 [Int64](../data-types/int-uint.md)。

**例**

クエリ：

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
## fromUnixTimestamp64Second {#fromunixtimestamp64second}

`Int64`を固定秒精度の`DateTime64`値に変換し、オプションのタイムゾーンを指定できます。入力値は、その精度に応じて適切にスケーリングされます。

:::note
入力値はUTCタイムスタンプとして扱われることに注意してください。指定された（または暗黙の）タイムゾーンでのタイムスタンプではありません。
:::

**構文**

```sql
fromUnixTimestamp64Second(value[, timezone])
```

**引数**

- `value` — 任意の精度を持つ値。 [Int64](../data-types/int-uint.md)。
- `timezone` — （オプション）結果のタイムゾーン名。 [String](../data-types/string.md)。

**返される値**

- 精度`0`のDateTime64に変換された`value`。 [DateTime64](../data-types/datetime64.md)。

**例**

クエリ：

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

`Int64`を固定ミリ秒精度の`DateTime64`値に変換し、オプションのタイムゾーンを指定できます。入力値は、その精度に応じて適切にスケーリングされます。

:::note
入力値はUTCタイムスタンプとして扱われることに注意してください。指定された（または暗黙の）タイムゾーンでのタイムスタンプではありません。
:::

**構文**

```sql
fromUnixTimestamp64Milli(value[, timezone])
```

**引数**

- `value` — 任意の精度を持つ値。 [Int64](../data-types/int-uint.md)。
- `timezone` — （オプション）結果のタイムゾーン名。 [String](../data-types/string.md)。

**返される値**

- 精度`3`のDateTime64に変換された`value`。 [DateTime64](../data-types/datetime64.md)。

**例**

クエリ：

```sql
WITH CAST(1733935988123, 'Int64') AS i64
SELECT
    fromUnixTimestamp64Milli(i64, 'UTC') AS x,
    toTypeName(x);
```

結果：

```response
┌───────────────────────x─┬─toTypeName(x)────────┐
│ 2024-12-11 16:53:08.123 │ DateTime64(3, 'UTC') │
└─────────────────────────┴──────────────────────┘
```
## fromUnixTimestamp64Micro {#fromunixtimestamp64micro}

`Int64`を固定マイクロ秒精度の`DateTime64`値に変換し、オプションのタイムゾーンを指定できます。入力値は、その精度に応じて適切にスケーリングされます。

:::note
入力値はUTCタイムスタンプとして扱われることに注意してください。指定された（または暗黙の）タイムゾーンでのタイムスタンプではありません。
:::

**構文**

```sql
fromUnixTimestamp64Micro(value[, timezone])
```

**引数**

- `value` — 任意の精度を持つ値。 [Int64](../data-types/int-uint.md)。
- `timezone` — （オプション）結果のタイムゾーン名。 [String](../data-types/string.md)。

**返される値**

- 精度`6`のDateTime64に変換された`value`。 [DateTime64](../data-types/datetime64.md)。

**例**

クエリ：

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

`Int64`を固定ナノ秒精度の`DateTime64`値に変換し、オプションのタイムゾーンを指定できます。入力値は、その精度に応じて適切にスケーリングされます。

:::note
入力値はUTCタイムスタンプとして扱われることに注意してください。指定された（または暗黙の）タイムゾーンでのタイムスタンプではありません。
:::

**構文**

```sql
fromUnixTimestamp64Nano(value[, timezone])
```

**引数**

- `value` — 任意の精度を持つ値。 [Int64](../data-types/int-uint.md)。
- `timezone` — （オプション）結果のタイムゾーン名。 [String](../data-types/string.md)。

**返される値**

- 精度`9`のDateTime64に変換された`value`。 [DateTime64](../data-types/datetime64.md)。

**例**

クエリ：

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

任意の式を指定された形式の文字列に変換します。

**構文**

```sql
formatRow(format, x, y, ...)
```

**引数**

- `format` — テキスト形式。例えば、[CSV](/interfaces/formats.md/#csv)、[TSV](/interfaces/formats.md/#tabseparated)。
- `x`,`y`, ... — 式。

**返される値**

- フォーマットされた文字列。（テキスト形式の場合、通常は改行文字で終了します）。

**例**

クエリ：

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

**注**: フォーマットに接頭辞/接尾辞が含まれている場合、各行に書き込まれます。

**例**

クエリ：

```sql
SELECT formatRow('CustomSeparated', number, 'good')
FROM numbers(3)
SETTINGS format_custom_result_before_delimiter='<prefix>\n', format_custom_result_after_delimiter='<suffix>'
```

結果：

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

注: この関数では行ベースのフォーマットのみがサポートされています。
## formatRowNoNewline {#formatrownonewline}

任意の式を指定された形式の文字列に変換します。formatRowとの違いは、この関数が最後の`\n`をトリミングする点です。

**構文**

```sql
formatRowNoNewline(format, x, y, ...)
```

**引数**

- `format` — テキスト形式。例えば、[CSV](/interfaces/formats.md/#csv)、[TSV](/interfaces/formats.md/#tabseparated)。
- `x`,`y`, ... — 式。

**返される値**

- フォーマットされた文字列。

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
