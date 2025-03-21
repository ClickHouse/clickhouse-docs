---
slug: '/sql-reference/functions/type-conversion-functions'
sidebar_position: 185
sidebar_label: '型変換'
---


# 型変換関数
## データ変換に関する一般的な問題 {#common-issues-with-data-conversion}

ClickHouseは一般的に[C++プログラムと同じ振る舞い](https://en.cppreference.com/w/cpp/language/implicit_conversion)をします。

`to<type>`関数と[cast](#cast)は、いくつかのケースで異なる振る舞いをします。例えば、[LowCardinality](../data-types/lowcardinality.md)の場合： [cast](#cast)は[LowCardinality](../data-types/lowcardinality.md)特性を削除しますが、`to<type>`関数は削除しません。 [Nullable](../data-types/nullable.md)についても同様です。この挙動はSQL標準と互換性がなく、[cast_keep_nullable](../../operations/settings/settings.md/#cast_keep_nullable)設定を使うことで変更できます。

:::note
より小さいデータ型（例えば、`Int64`から`Int32`へ）や互換性のないデータ型（例えば、`String`から`Int`へ）に変換される場合は、データ損失の可能性に注意してください。結果が予期した通りであるかを慎重に確認してください。
:::

例：

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

入力値を[`Bool`](../data-types/boolean.md)型の値に変換します。エラーが発生した場合は例外を投げます。

**構文**

```sql
toBool(expr)
```

**引数**

- `expr` — 数字または文字列を返す式。 [Expression](/sql-reference/syntax#expressions)。

サポートされる引数：
- 型（U）Int8/16/32/64/128/256の値。
- 型Float32/64の値。
- 文字列 `true` または `false`（大文字小文字を区別しない）。

**返される値**

- 引数の評価に基づいて `true` または `false` を返します。 [Bool](../data-types/boolean.md)。

**例**

クエリ：

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

入力値を[`Int8`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外を投げます。

**構文**

```sql
toInt8(expr)
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [Expression](/sql-reference/syntax#expressions)。

サポートされる引数：
- 型（U）Int8/16/32/64/128/256の値またはその文字列表現。
- 型Float32/64の値。

サポートされていない引数：
- `NaN`や`Inf`を含むFloat32/64値の文字列表現。
- バイナリや16進数の値の文字列表現、例：`SELECT toInt8('0xc0fe');`。

:::note
入力値が[Int8](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
例： `SELECT toInt8(128) == -128;`。
:::

**返される値**

- 8ビット整数値。 [Int8](../data-types/int-uint.md)。

:::note
この関数は[ゼロに向かう丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数字の小数部分を切り捨てます。
:::

**例**

クエリ：

```sql
SELECT
    toInt8(-8),
    toInt8(-8.8),
    toInt8('-8')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toInt8(-8):   -8
toInt8(-8.8): -8
toInt8('-8'): -8
```

**参照**

- [`toInt8OrZero`](#toint8orzero)。
- [`toInt8OrNull`](#toInt8OrNull)。
- [`toInt8OrDefault`](#toint8ordefault)。
## toInt8OrZero {#toint8orzero}

[`toInt8`](#toint8)と同様に、この関数は入力値を[Int8](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toInt8OrZero(x)
```

**引数**

- `x` — 数字の文字列表現。 [String](../data-types/string.md)。

サポートされる引数：
- (U)Int8/16/32/128/256の文字列表現。

サポートされていない引数（`0`を返す）：
- `NaN`や`Inf`を含む通常のFloat32/64の文字列表現。
- バイナリや16進数の値の文字列表現、例：`SELECT toInt8OrZero('0xc0fe');`。

:::note
入力値が[Int8](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は8ビット整数値、それ以外の場合は`0`。 [Int8](../data-types/int-uint.md)。

:::note
この関数は[ゼロに向かう丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数字の小数部分を切り捨てます。
:::

**例**

クエリ：

``` sql
SELECT
    toInt8OrZero('-8'),
    toInt8OrZero('abc')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toInt8OrZero('-8'):  -8
toInt8OrZero('abc'): 0
```

**参照**

- [`toInt8`](#toint8)。
- [`toInt8OrNull`](#toInt8OrNull)。
- [`toInt8OrDefault`](#toint8ordefault)。
## toInt8OrNull {#toInt8OrNull}

[`toInt8`](#toint8)と同様に、この関数は入力値を[Int8](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toInt8OrNull(x)
```

**引数**

- `x` — 数字の文字列表現。 [String](../data-types/string.md)。

サポートされる引数：
- (U)Int8/16/32/128/256の文字列表現。

サポートされていない引数（`\N`を返す）：
- Float32/64の文字列表現、`NaN`や`Inf`を含む。
- バイナリや16進数の値の文字列表現、例：`SELECT toInt8OrNull('0xc0fe');`。

:::note
入力値が[Int8](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は8ビット整数値、それ以外の場合は`NULL`。 [Int8](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロに向かう丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数字の小数部分を切り捨てます。
:::

**例**

クエリ：

``` sql
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

**参照**

- [`toInt8`](#toint8)。
- [`toInt8OrZero`](#toint8orzero)。
- [`toInt8OrDefault`](#toint8ordefault)。
## toInt8OrDefault {#toint8ordefault}

[`toInt8`](#toint8)と同様に、この関数は入力値を[Int8](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
デフォルト値が渡されない場合は、エラーが発生した場合に `0` が返されます。

**構文**

```sql
toInt8OrDefault(expr[, default])
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
- `default` (オプション) — `Int8`型に変換が失敗した場合に返すデフォルト値。 [Int8](../data-types/int-uint.md)。

サポートされる引数：
- 型（U）Int8/16/32/64/128/256の値またはその文字列表現。
- 型Float32/64の値。

デフォルト値が返される引数：
- Float32/64の値の文字列表現、`NaN`や`Inf`を含む。
- バイナリや16進数の値の文字列表現、例：`SELECT toInt8OrDefault('0xc0fe', CAST('-1', 'Int8'));`。

:::note
入力値が[Int8](../data-types/int-uint.md)の範囲内で表現できない場合、結果のオーバーフローまたはアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は8ビット整数値、それ以外の場合は渡されたデフォルト値または渡されていない場合は`0`を返します。 [Int8](../data-types/int-uint.md)。

:::note
- この関数は[ゼロに向かう丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数字の小数部分を切り捨てます。
- デフォルト値の型はキャストする型と同じである必要があります。
:::

**例**

クエリ：

``` sql
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

**参照**

- [`toInt8`](#toint8)。
- [`toInt8OrZero`](#toint8orzero)。
- [`toInt8OrNull`](#toInt8OrNull)。
## toInt16 {#toint16}

入力値を[`Int16`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外を投げます。

**構文**

```sql
toInt16(expr)
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [Expression](/sql-reference/syntax#expressions)。

サポートされる引数：
- 型（U）Int8/16/32/64/128/256の値またはその文字列表現。
- 型Float32/64の値。

サポートされていない引数：
- `NaN`や`Inf`を含むFloat32/64の文字列表現。
- バイナリや16進数の値の文字列表現、例：`SELECT toInt16('0xc0fe');`。

:::note
入力値が[Int16](../data-types/int-uint.md)の範囲内で表現できない場合、オーバーフローやアンダーフローが発生します。
これはエラーとは見なされません。
例：`SELECT toInt16(32768) == -32768;`。
:::

**返される値**

- 16ビット整数値。 [Int16](../data-types/int-uint.md)。

:::note
この関数は[ゼロに向かう丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数字の小数部分を切り捨てます。
:::

**例**

クエリ：

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

**参照**

- [`toInt16OrZero`](#toint16orzero)。
- [`toInt16OrNull`](#toint16ornull)。
- [`toInt16OrDefault`](#toint16ordefault)。
## toInt16OrZero {#toint16orzero}

[`toInt16`](#toint16)と同様に、この関数は入力値を[Int16](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toInt16OrZero(x)
```

**引数**

- `x` — 数字の文字列表現。 [String](../data-types/string.md)。

サポートされる引数：
- (U)Int8/16/32/128/256の文字列表現。

サポートされていない引数（`0`を返す）：
- Float32/64の文字列表現、`NaN`や`Inf`を含む。
- バイナリや16進数の値の文字列表現、例：`SELECT toInt16OrZero('0xc0fe');`。

:::note
入力値が[Int16](../data-types/int-uint.md)の範囲内で表現できない場合、オーバーフローやアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 16ビット整数値が成功した場合、それ以外の時は`0`。[Int16](../data-types/int-uint.md)。

:::note
この関数は[ゼロに向かう丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数字の小数部分を切り捨てます。
:::

**例**

クエリ：

``` sql
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

**参照**

- [`toInt16`](#toint16)。
- [`toInt16OrNull`](#toint16ornull)。
- [`toInt16OrDefault`](#toint16ordefault)。
## toInt16OrNull {#toint16ornull}

[`toInt16`](#toint16)と同様に、この関数は入力値を[Int16](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toInt16OrNull(x)
```

**引数**

- `x` — 数字の文字列表現。 [String](../data-types/string.md)。

サポートされる引数：
- (U)Int8/16/32/128/256の文字列表現。

サポートされていない引数（`\N`を返す）：
- Float32/64の文字列表現、`NaN`や`Inf`を含む。
- バイナリや16進数の値の文字列表現、例：`SELECT toInt16OrNull('0xc0fe');`。

:::note
入力値が[Int16](../data-types/int-uint.md)の範囲内で表現できない場合、オーバーフローやアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 16ビット整数値が成功した場合、それ以外の場合は`NULL`。[Int16](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロに向かう丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数字の小数部分を切り捨てます。
:::

**例**

クエリ：

``` sql
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

**参照**

- [`toInt16`](#toint16)。
- [`toInt16OrZero`](#toint16orzero)。
- [`toInt16OrDefault`](#toint16ordefault)。
## toInt16OrDefault {#toint16ordefault}

[`toInt16`](#toint16)と同様に、この関数は入力値を[Int16](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
デフォルト値が渡されていない場合は`0`が返されます。

**構文**

```sql
toInt16OrDefault(expr[, default])
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
- `default` (オプション) — `Int16`型に変換が失敗した場合に返すデフォルト値。 [Int16](../data-types/int-uint.md)。

サポートされる引数：
- 型（U）Int8/16/32/64/128/256の値またはその文字列表現。
- 型Float32/64の値。

デフォルト値が返される引数：
- Float32/64の値の文字列表現、`NaN`や`Inf`を含む。
- バイナリや16進数の値の文字列表現、例：`SELECT toInt16OrDefault('0xc0fe', CAST('-1', 'Int16'));`。

:::note
入力値が[Int16](../data-types/int-uint.md)の範囲内で表現できない場合、オーバーフローやアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は16ビット整数値、それ以外の場合は渡されたデフォルト値または渡されていない場合は`0`を返します。 [Int16](../data-types/int-uint.md)。

:::note
- この関数は[ゼロに向かう丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数字の小数部分を切り捨てます。
- デフォルト値のタイプはキャストする型と同じである必要があります。
:::

**例**

クエリ：

``` sql
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

**参照**

- [`toInt16`](#toint16)。
- [`toInt16OrZero`](#toint16orzero)。
- [`toInt16OrNull`](#toint16ornull)。
## toInt32 {#toint32}

入力値を[`Int32`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外を投げます。

**構文**

```sql
toInt32(expr)
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [Expression](/sql-reference/syntax#expressions)。

サポートされる引数：
- 型（U）Int8/16/32/64/128/256の値またはその文字列表現。
- 型Float32/64の値。

サポートされていない引数：
- `NaN`や`Inf`を含むFloat32/64の文字列表現。
- バイナリや16進数の値の文字列表現、例：`SELECT toInt32('0xc0fe');`。

:::note
入力値が[Int32](../data-types/int-uint.md)の範囲内で表現できない場合、オーバーフローやアンダーフローが発生します。
これはエラーとして扱われません。
例えば：`SELECT toInt32(2147483648) == -2147483648;`
:::

**返される値**

- 32ビット整数値。 [Int32](../data-types/int-uint.md)。

:::note
この関数は[ゼロに向かう丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数字の小数部分を切り捨てます。
:::

**例**

クエリ：

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

**参照**

- [`toInt32OrZero`](#toint32orzero)。
- [`toInt32OrNull`](#toint32ornull)。
- [`toInt32OrDefault`](#toint32ordefault)。
## toInt32OrZero {#toint32orzero}

[`toInt32`](#toint32)と同様に、この関数は入力値を[Int32](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toInt32OrZero(x)
```

**引数**

- `x` — 数字の文字列表現。 [String](../data-types/string.md)。

サポートされる引数：
- (U)Int8/16/32/128/256の文字列表現。

サポートされていない引数（`0`を返す）：
- Float32/64の文字列表現、`NaN`や`Inf`を含む。
- バイナリや16進数の値の文字列表現、例：`SELECT toInt32OrZero('0xc0fe');`。

:::note
入力値が[Int32](../data-types/int-uint.md)の範囲内で表現できない場合、オーバーフローやアンダーフローが発生します。
これはエラーとして扱われません。
:::

**返される値**

- 32ビット整数値が成功した場合、それ以外の場合は`0`。[Int32](../data-types/int-uint.md)。

:::note
この関数は[ゼロに向かう丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数字の小数部分を切り捨てます。
:::

**例**

クエリ：

``` sql
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

**参照**

- [`toInt32`](#toint32)。
- [`toInt32OrNull`](#toint32ornull)。
- [`toInt32OrDefault`](#toint32ordefault)。
## toInt32OrNull {#toint32ornull}

[`toInt32`](#toint32)と同様に、この関数は入力値を[Int32](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toInt32OrNull(x)
```

**引数**

- `x` — 数字の文字列表現。 [String](../data-types/string.md)。

サポートされる引数：
- (U)Int8/16/32/128/256の文字列表現。

サポートされていない引数（`\N`を返す）：
- Float32/64の文字列表現、`NaN`や`Inf`を含む。
- バイナリや16進数の値の文字列表現、例：`SELECT toInt32OrNull('0xc0fe');`。

:::note
入力値が[Int32](../data-types/int-uint.md)の範囲内で表現できない場合、オーバーフローやアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は32ビット整数値、それ以外の場合は`NULL`。[Int32](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロに向かう丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数字の小数部分を切り捨てます。
:::

**例**

クエリ：

``` sql
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

**参照**

- [`toInt32`](#toint32)。
- [`toInt32OrZero`](#toint32orzero)。
- [`toInt32OrDefault`](#toint32ordefault)。
## toInt32OrDefault {#toint32ordefault}

[`toInt32`](#toint32)と同様に、この関数は入力値を[Int32](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
デフォルト値が渡されていない場合は`0`が返されます。

**構文**

```sql
toInt32OrDefault(expr[, default])
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
- `default` (オプション) — `Int32`型に変換が失敗した場合に返すデフォルト値。 [Int32](../data-types/int-uint.md)。

サポートされる引数：
- 型（U）Int8/16/32/64/128/256の値またはその文字列表現。
- 型Float32/64の値。

デフォルト値が返される引数：
- Float32/64の値の文字列表現、`NaN`や`Inf`を含む。
- バイナリや16進数の値の文字列表現、例：`SELECT toInt32OrDefault('0xc0fe', CAST('-1', 'Int32'));`。

:::note
入力値が[Int32](../data-types/int-uint.md)の範囲内で表現できない場合、オーバーフローやアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は32ビット整数値、それ以外の場合は渡されたデフォルト値または渡されていない場合は`0`を返します。 [Int32](../data-types/int-uint.md)。

:::note
- この関数は[ゼロに向かう丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数字の小数部分を切り捨てます。
- デフォル卜値の型はキャストする型と同じである必要があります。
:::

**例**

クエリ：

``` sql
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

**参照**

- [`toInt32`](#toint32)。
- [`toInt32OrZero`](#toint32orzero)。
- [`toInt32OrNull`](#toint32ornull)。
## toInt64 {#toint64}

入力値を[`Int64`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外を投げます。

**構文**

```sql
toInt64(expr)
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [Expression](/sql-reference/syntax#expressions)。

サポートされる引数：
- 型（U）Int8/16/32/64/128/256の値またはその文字列表現。
- 型Float32/64の値。

サポートされていない引数：
- `NaN`や`Inf`を含むFloat32/64の文字列表現。
- バイナリや16進数の値の文字列表現、例：`SELECT toInt64('0xc0fe');`。

:::note
入力値が[Int64](../data-types/int-uint.md)の範囲内で表現できない場合、オーバーフローやアンダーフローが発生します。
これはエラーとは見なされません。
例えば：`SELECT toInt64(9223372036854775808) == -9223372036854775808;`
:::

**返される値**

- 64ビット整数値。 [Int64](../data-types/int-uint.md)。

:::note
この関数は[ゼロに向かう丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数字の小数部分を切り捨てます。
:::

**例**

クエリ：

```sql
SELECT
    toInt64(-64),
    toInt64(-64.64),
    toInt64('-64')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toInt64(-64):    -64
toInt64(-64.64): -64
toInt64('-64'):  -64
```

**参照**

- [`toInt64OrZero`](#toint64orzero)。
- [`toInt64OrNull`](#toint64ornull)。
- [`toInt64OrDefault`](#toint64ordefault)。
## toInt64OrZero {#toint64orzero}

[`toInt64`](#toint64)と同様に、この関数は入力値を[Int64](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は `0` を返します。

**構文**

```sql
toInt64OrZero(x)
```

**引数**

- `x` — 数字の文字列表現。 [String](../data-types/string.md)。

サポートされる引数：
- (U)Int8/16/32/128/256の文字列表現。

サポートされていない引数（`0`を返す）：
- Float32/64の文字列表現、`NaN`や`Inf`を含む。
- バイナリや16進数の値の文字列表現、例：`SELECT toInt64OrZero('0xc0fe');`。

:::note
入力値が[Int64](../data-types/int-uint.md)の範囲内で表現できない場合、オーバーフローやアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 64ビット整数値が成功した場合、それ以外の場合は`0`。[Int64](../data-types/int-uint.md)。

:::note
この関数は[ゼロに向かう丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数字の小数部分を切り捨てます。
:::

**例**

クエリ：

``` sql
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

**参照**

- [`toInt64`](#toint64)。
- [`toInt64OrNull`](#toint64ornull)。
- [`toInt64OrDefault`](#toint64ordefault)。
## toInt64OrNull {#toint64ornull}

[`toInt64`](#toint64)と同様に、この関数は入力値を[Int64](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合は `NULL` を返します。

**構文**

```sql
toInt64OrNull(x)
```

**引数**

- `x` — 数字の文字列表現。 [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

サポートされる引数：
- (U)Int8/16/32/128/256の文字列表現。

サポートされていない引数（`\N`を返す）：
- Float32/64の文字列表現、`NaN`や`Inf`を含む。
- バイナリや16進数の値の文字列表現、例：`SELECT toInt64OrNull('0xc0fe');`。

:::note
入力値が[Int64](../data-types/int-uint.md)の範囲内で表現できない場合、オーバーフローやアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 64ビット整数値が成功した場合、それ以外の場合は`NULL`。[Int64](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
この関数は[ゼロに向かう丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数字の小数部分を切り捨てます。
:::

**例**

クエリ：

``` sql
SELECT
    toInt64OrNull('-64'),
    toInt64OrNull('abc')
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
toInt64OrNull('-64'): -64
toInt64OrNull('abc'): ᴺᵁᴸᴸ
```

**参照**

- [`toInt64`](#toint64)。
- [`toInt64OrZero`](#toint64orzero)。
- [`toInt64OrDefault`](#toint64ordefault)。
## toInt64OrDefault {#toint64ordefault}

[`toInt64`](#toint64)と同様に、この関数は入力値を[Int64](../data-types/int-uint.md)型の値に変換しますが、エラーが発生した場合はデフォルト値を返します。
デフォルト値が渡されていない場合は`0`が返されます。

**構文**

```sql
toInt64OrDefault(expr[, default])
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
- `default` (オプション) — `Int64`型に変換が失敗した場合に返すデフォルト値。 [Int64](../data-types/int-uint.md)。

サポートされる引数：
- 型（U）Int8/16/32/64/128/256の値またはその文字列表現。
- 型Float32/64の値。

デフォルト値が返される引数：
- Float32/64の値の文字列表現、`NaN`や`Inf`を含む。
- バイナリや16進数の値の文字列表現、例：`SELECT toInt64OrDefault('0xc0fe', CAST('-1', 'Int64'));`。

:::note
入力値が[Int64](../data-types/int-uint.md)の範囲内で表現できない場合、オーバーフローやアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 成功した場合は64ビット整数値、それ以外の場合は渡されたデフォルト値または渡されていない場合は`0`を返します。 [Int64](../data-types/int-uint.md)。

:::note
- この関数は[ゼロに向かう丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数字の小数部分を切り捨てます。
- デフォルト値の型はキャストする型と同じである必要があります。
:::

**例**

クエリ：

``` sql
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

**参照**

- [`toInt64`](#toint64)。
- [`toInt64OrZero`](#toint64orzero)。
- [`toInt64OrNull`](#toint64ornull)。
## toInt128 {#toint128}

入力値を[`Int128`](../data-types/int-uint.md)型の値に変換します。エラーが発生した場合は例外を投げます。

**構文**

```sql
toInt128(expr)
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [Expression](/sql-reference/syntax#expressions)。

サポートされる引数：
- 型（U）Int8/16/32/64/128/256の値またはその文字列表現。
- 型Float32/64の値。

サポートされていない引数：
- `NaN`や`Inf`を含むFloat32/64の文字列表現。
- バイナリや16進数の値の文字列表現、例：`SELECT toInt128('0xc0fe');`。

:::note
入力値が[Int128](../data-types/int-uint.md)の範囲内で表現できない場合、オーバーフローやアンダーフローが発生します。
これはエラーとは見なされません。
:::

**返される値**

- 128ビット整数値。 [Int128](../data-types/int-uint.md)。

:::note
この関数は[ゼロに向かう丸め](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)を使用しており、数字の小数部分を切り捨てます。
:::

**例**

クエリ：

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

**参照**

- [`toInt128OrZero`](#toint128orzero)。
- [`toInt128OrNull`](#toint128ornull)。
- [`toInt128OrDefault`](#toint128ordefault)。
```yaml
title: 'toInt128OrZero'
sidebar_label: 'toInt128OrZero'
keywords: ['ClickHouse', 'toInt128OrZero', 'データベース', '関数']
description: 'toInt128OrZero: エラー時に0を返すInt128型への値の変換'
```

## toInt128OrZero {#toint128orzero}

Like [`toInt128`](#toint128), this function converts an input value to a value of type [Int128](../data-types/int-uint.md) but returns `0` in case of an error.

**構文**

```sql
toInt128OrZero(expr)
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions) / [文字列](../data-types/string.md)。

サポートされる引数:
- (U)Int8/16/32/128/256の文字列表現。

サポートされていない引数（`0`を返す）:
- Float32/64の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例えば `SELECT toInt128OrZero('0xc0fe');`。

:::note
If the input value cannot be represented within the bounds of [Int128](../data-types/int-uint.md), overflow or underflow of the result occurs.
This is not considered an error.
:::

**戻り値**

- 成功すれば128ビット整数値、そうでなければ`0`。 [Int128](../data-types/int-uint.md)。

:::note
The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
:::

**例**

クエリ:

``` sql
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

- [`toInt128`](#toint128).
- [`toInt128OrNull`](#toint128ornull).
- [`toInt128OrDefault`](#toint128ordefault).
## toInt128OrNull {#toint128ornull}

Like [`toInt128`](#toint128), this function converts an input value to a value of type [Int128](../data-types/int-uint.md) but returns `NULL` in case of an error.

**構文**

```sql
toInt128OrNull(x)
```

**引数**

- `x` — 数字の文字列表現。 [式](/sql-reference/syntax#expressions) / [文字列](../data-types/string.md)。

サポートされる引数:
- (U)Int8/16/32/128/256の文字列表現。

サポートされていない引数（`\N`を返す）:
- Float32/64の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例えば `SELECT toInt128OrNull('0xc0fe');`。

:::note
If the input value cannot be represented within the bounds of [Int128](../data-types/int-uint.md), overflow or underflow of the result occurs.
This is not considered an error.
:::

**戻り値**

- 成功すれば128ビット整数値、そうでなければ`NULL`。 [Int128](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
:::

**例**

クエリ:

``` sql
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

- [`toInt128`](#toint128).
- [`toInt128OrZero`](#toint128orzero).
- [`toInt128OrDefault`](#toint128ordefault).
## toInt128OrDefault {#toint128ordefault}

Like [`toInt128`](#toint128), this function converts an input value to a value of type [Int128](../data-types/int-uint.md) but returns the default value in case of an error.
If no `default` value is passed then `0` is returned in case of an error.

**構文**

```sql
toInt128OrDefault(expr[, default])
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions) / [文字列](../data-types/string.md)。
- `default` (オプション) — `Int128`型へのパースが失敗した場合に返されるデフォルト値。 [Int128](../data-types/int-uint.md)。

サポートされる引数:
- (U)Int8/16/32/64/128/256の値。
- Float32/64の値。
- (U)Int8/16/32/128/256の文字列表現。

デフォルト値が返される引数:
- Float32/64の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例えば `SELECT toInt128OrDefault('0xc0fe', CAST('-1', 'Int128'));`。

:::note
If the input value cannot be represented within the bounds of [Int128](../data-types/int-uint.md), overflow or underflow of the result occurs.
This is not considered an error.
:::

**戻り値**

- 成功すれば128ビット整数値、そうでなければ渡されたデフォルト値が返されるか、そうでなければ`0`が返される。 [Int128](../data-types/int-uint.md)。

:::note
- The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
- The default value type should be the same as the cast type.
:::

**例**

クエリ:

``` sql
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

- [`toInt128`](#toint128).
- [`toInt128OrZero`](#toint128orzero).
- [`toInt128OrNull`](#toint128ornull).
## toInt256 {#toint256}

Converts an input value to a value of type [`Int256`](../data-types/int-uint.md). Throws an exception in case of an error.

**構文**

```sql
toInt256(expr)
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions)。

サポートされる引数:
- (U)Int8/16/32/64/128/256の値または文字列表現。
- Float32/64の型の値。

サポートされていない引数:
- Float32/64の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例えば `SELECT toInt256('0xc0fe');`。

:::note
If the input value cannot be represented within the bounds of [Int256](../data-types/int-uint.md), the result over or under flows.
This is not considered an error.
:::

**戻り値**

- 256ビット整数値。 [Int256](../data-types/int-uint.md)。

:::note
The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
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

- [`toInt256OrZero`](#toint256orzero).
- [`toInt256OrNull`](#toint256ornull).
- [`toInt256OrDefault`](#toint256ordefault).
## toInt256OrZero {#toint256orzero}

Like [`toInt256`](#toint256), this function converts an input value to a value of type [Int256](../data-types/int-uint.md) but returns `0` in case of an error.

**構文**

```sql
toInt256OrZero(x)
```

**引数**

- `x` — 数字の文字列表現。 [文字列](../data-types/string.md)。

サポートされる引数:
- (U)Int8/16/32/128/256の文字列表現。

サポートされていない引数（`0`を返す）:
- Float32/64の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例えば `SELECT toInt256OrZero('0xc0fe');`。

:::note
If the input value cannot be represented within the bounds of [Int256](../data-types/int-uint.md), overflow or underflow of the result occurs.
This is not considered an error.
:::

**戻り値**

- 成功すれば256ビット整数値、そうでなければ`0`。 [Int256](../data-types/int-uint.md)。

:::note
The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
:::

**例**

クエリ:

``` sql
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

- [`toInt256`](#toint256).
- [`toInt256OrNull`](#toint256ornull).
- [`toInt256OrDefault`](#toint256ordefault).
## toInt256OrNull {#toint256ornull}

Like [`toInt256`](#toint256), this function converts an input value to a value of type [Int256](../data-types/int-uint.md) but returns `NULL` in case of an error.

**構文**

```sql
toInt256OrNull(x)
```

**引数**

- `x` — 数字の文字列表現。 [文字列](../data-types/string.md)。

サポートされる引数:
- (U)Int8/16/32/128/256の文字列表現。

サポートされていない引数（`\N`を返す）:
- Float32/64の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例えば `SELECT toInt256OrNull('0xc0fe');`。

:::note
If the input value cannot be represented within the bounds of [Int256](../data-types/int-uint.md), overflow or underflow of the result occurs.
This is not considered an error.
:::

**戻り値**

- 成功すれば256ビット整数値、そうでなければ`NULL`。 [Int256](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
:::

**例**

クエリ:

``` sql
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

- [`toInt256`](#toint256).
- [`toInt256OrZero`](#toint256orzero).
- [`toInt256OrDefault`](#toint256ordefault).
## toInt256OrDefault {#toint256ordefault}

Like [`toInt256`](#toint256), this function converts an input value to a value of type [Int256](../data-types/int-uint.md) but returns the default value in case of an error.
If no `default` value is passed then `0` is returned in case of an error.

**構文**

```sql
toInt256OrDefault(expr[, default])
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions) / [文字列](../data-types/string.md)。
- `default` (オプション) — `Int256`型へのパースが失敗した場合に返されるデフォルト値。 [Int256](../data-types/int-uint.md)。

サポートされる引数:
- (U)Int8/16/32/64/128/256の値。
- Float32/64の値。

デフォルト値が返される引数:
- Float32/64の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例えば `SELECT toInt256OrDefault('0xc0fe', CAST('-1', 'Int256'));`。

:::note
If the input value cannot be represented within the bounds of [Int256](../data-types/int-uint.md), overflow or underflow of the result occurs.
This is not considered an error.
:::

**戻り値**

- 成功すれば256ビット整数値、そうでなければ渡されたデフォルト値が返されるか、そうでなければ`0`が返される。 [Int256](../data-types/int-uint.md)。

:::note
- The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
- The default value type should be the same as the cast type.
:::

**例**

クエリ:

``` sql
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

- [`toInt256`](#toint256).
- [`toInt256OrZero`](#toint256orzero).
- [`toInt256OrNull`](#toint256ornull).
## toUInt8 {#touint8}

Converts an input value to a value of type [`UInt8`](../data-types/int-uint.md). Throws an exception in case of an error.

**構文**

```sql
toUInt8(expr)
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions)。

サポートされる引数:
- (U)Int8/16/32/64/128/256の値または文字列表現。
- Float32/64の型の値。

サポートされていない引数:
- Float32/64の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例えば `SELECT toUInt8('0xc0fe');`。

:::note
If the input value cannot be represented within the bounds of [UInt8](../data-types/int-uint.md), overflow or underflow of the result occurs.
This is not considered an error.
For example: `SELECT toUInt8(256) == 0;`.
:::

**戻り値**

- 8ビット符号なし整数値。 [UInt8](../data-types/int-uint.md)。

:::note
The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
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

- [`toUInt8OrZero`](#touint8orzero).
- [`toUInt8OrNull`](#touint8ornull).
- [`toUInt8OrDefault`](#touint8ordefault).
## toUInt8OrZero {#touint8orzero}

Like [`toUInt8`](#touint8), this function converts an input value to a value of type [UInt8](../data-types/int-uint.md) but returns `0` in case of an error.

**構文**

```sql
toUInt8OrZero(x)
```

**引数**

- `x` — 数字の文字列表現。 [文字列](../data-types/string.md)。

サポートされる引数:
- (U)Int8/16/32/128/256の文字列表現。

サポートされていない引数（`0`を返す）:
- 通常のFloat32/64の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例えば `SELECT toUInt8OrZero('0xc0fe');`。

:::note
If the input value cannot be represented within the bounds of [UInt8](../data-types/int-uint.md), overflow or underflow of the result occurs.
This is not considered an error.
:::

**戻り値**

- 成功すれば8ビット符号なし整数値、そうでなければ`0`。 [UInt8](../data-types/int-uint.md)。

:::note
The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
:::

**例**

クエリ:

``` sql
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

- [`toUInt8`](#touint8).
- [`toUInt8OrNull`](#touint8ornull).
- [`toUInt8OrDefault`](#touint8ordefault).
## toUInt8OrNull {#touint8ornull}

Like [`toUInt8`](#touint8), this function converts an input value to a value of type [UInt8](../data-types/int-uint.md) but returns `NULL` in case of an error.

**構文**

```sql
toUInt8OrNull(x)
```

**引数**

- `x` — 数字の文字列表現。 [文字列](../data-types/string.md)。

サポートされる引数:
- (U)Int8/16/32/128/256の文字列表現。

サポートされていない引数（`\N`を返す）:
- Float32/64の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例えば `SELECT toUInt8OrNull('0xc0fe');`。

:::note
If the input value cannot be represented within the bounds of [UInt8](../data-types/int-uint.md), overflow or underflow of the result occurs.
This is not considered an error.
:::

**戻り値**

- 成功すれば8ビット符号なし整数値、そうでなければ`NULL`。 [UInt8](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
:::

**例**

クエリ:

``` sql
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

- [`toUInt8`](#touint8).
- [`toUInt8OrZero`](#touint8orzero).
- [`toUInt8OrDefault`](#touint8ordefault).
## toUInt8OrDefault {#touint8ordefault}

Like [`toUInt8`](#touint8), this function converts an input value to a value of type [UInt8](../data-types/int-uint.md) but returns the default value in case of an error.
If no `default` value is passed then `0` is returned in case of an error.

**構文**

```sql
toUInt8OrDefault(expr[, default])
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions) / [文字列](../data-types/string.md)。
- `default` (オプション) — `UInt8`型へのパースが失敗した場合に返されるデフォルト値。 [UInt8](../data-types/int-uint.md)。

サポートされる引数:
- (U)Int8/16/32/64/128/256の値または文字列表現。
- Float32/64の型の値。

デフォルト値が返される引数:
- Float32/64の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例えば `SELECT toUInt8OrDefault('0xc0fe', CAST('0', 'UInt8'));`。

:::note
If the input value cannot be represented within the bounds of [UInt8](../data-types/int-uint.md), overflow or underflow of the result occurs.
This is not considered an error.
:::

**戻り値**

- 成功すれば8ビット符号なし整数値、そうでなければ渡されたデフォルト値が返されるか、そうでなければ`0`が返される。 [UInt8](../data-types/int-uint.md)。

:::note
- The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
- The default value type should be the same as the cast type.
:::

**例**

クエリ:

``` sql
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

- [`toUInt8`](#touint8).
- [`toUInt8OrZero`](#touint8orzero).
- [`toUInt8OrNull`](#touint8ornull).
## toUInt16 {#touint16}

Converts an input value to a value of type [`UInt16`](../data-types/int-uint.md). Throws an exception in case of an error.

**構文**

```sql
toUInt16(expr)
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions)。

サポートされる引数:
- (U)Int8/16/32/64/128/256の値または文字列表現。
- Float32/64の型の値。

サポートされていない引数:
- Float32/64の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例えば `SELECT toUInt16('0xc0fe');`。

:::note
If the input value cannot be represented within the bounds of [UInt16](../data-types/int-uint.md), overflow or underflow of the result occurs.
This is not considered an error.
For example: `SELECT toUInt16(65536) == 0;`.
:::

**戻り値**

- 16ビット符号なし整数値。 [UInt16](../data-types/int-uint.md)。

:::note
The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
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

- [`toUInt16OrZero`](#touint16orzero).
- [`toUInt16OrNull`](#touint16ornull).
- [`toUInt16OrDefault`](#touint16ordefault).
## toUInt16OrZero {#touint16orzero}

Like [`toUInt16`](#touint16), this function converts an input value to a value of type [UInt16](../data-types/int-uint.md) but returns `0` in case of an error.

**構文**

```sql
toUInt16OrZero(x)
```

**引数**

- `x` — 数字の文字列表現。 [文字列](../data-types/string.md)。

サポートされる引数:
- (U)Int8/16/32/128/256の文字列表現。

サポートされていない引数（`0`を返す）:
- Float32/64の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例えば `SELECT toUInt16OrZero('0xc0fe');`。

:::note
If the input value cannot be represented within the bounds of [UInt16](../data-types/int-uint.md), overflow or underflow of the result occurs.
This is not considered as an error.
:::

**戻り値**

- 成功すれば16ビット符号なし整数値、そうでなければ`0`。 [UInt16](../data-types/int-uint.md)。

:::note
The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
:::

**例**

クエリ:

``` sql
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

- [`toUInt16`](#touint16).
- [`toUInt16OrNull`](#touint16ornull).
- [`toUInt16OrDefault`](#touint16ordefault).
## toUInt16OrNull {#touint16ornull}

Like [`toUInt16`](#touint16), this function converts an input value to a value of type [UInt16](../data-types/int-uint.md) but returns `NULL` in case of an error.

**構文**

```sql
toUInt16OrNull(x)
```

**引数**

- `x` — 数字の文字列表現。 [文字列](../data-types/string.md)。

サポートされる引数:
- (U)Int8/16/32/128/256の文字列表現。

サポートされていない引数（`\N`を返す）:
- Float32/64の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例えば `SELECT toUInt16OrNull('0xc0fe');`。

:::note
If the input value cannot be represented within the bounds of [UInt16](../data-types/int-uint.md), overflow or underflow of the result occurs.
This is not considered an error.
:::

**戻り値**

- 成功すれば16ビット符号なし整数値、そうでなければ`NULL`。 [UInt16](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
:::

**例**

クエリ:

``` sql
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

- [`toUInt16`](#touint16).
- [`toUInt16OrZero`](#touint16orzero).
- [`toUInt16OrDefault`](#touint16ordefault).
## toUInt16OrDefault {#touint16ordefault}

Like [`toUInt16`](#touint16), this function converts an input value to a value of type [UInt16](../data-types/int-uint.md) but returns the default value in case of an error.
If no `default` value is passed then `0` is returned in case of an error.

**構文**

```sql
toUInt16OrDefault(expr[, default])
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions) / [文字列](../data-types/string.md)。
- `default` (オプション) — `UInt16`型へのパースが失敗した場合に返されるデフォルト値。 [UInt16](../data-types/int-uint.md)。

サポートされる引数:
- (U)Int8/16/32/64/128/256の値または文字列表現。
- Float32/64の型の値。

デフォルト値が返される引数:
- Float32/64の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例えば `SELECT toUInt16OrDefault('0xc0fe', CAST('0', 'UInt16'));`。

:::note
If the input value cannot be represented within the bounds of [UInt16](../data-types/int-uint.md), overflow or underflow of the result occurs.
This is not considered an error.
:::

**戻り値**

- 成功すれば16ビット符号なし整数値、そうでなければ渡されたデフォルト値が返されるか、そうでなければ`0`が返される。 [UInt16](../data-types/int-uint.md)。

:::note
- The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
- The default value type should be the same as the cast type.
:::

**例**

クエリ:

``` sql
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

- [`toUInt16`](#touint16).
- [`toUInt16OrZero`](#touint16orzero).
- [`toUInt16OrNull`](#touint16ornull).
## toUInt32 {#touint32}

Converts an input value to a value of type [`UInt32`](../data-types/int-uint.md). Throws an exception in case of an error.

**構文**

```sql
toUInt32(expr)
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions)。

サポートされる引数:
- (U)Int8/16/32/64/128/256の値または文字列表現。
- Float32/64の型の値。

サポートされていない引数:
- Float32/64の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例えば `SELECT toUInt32('0xc0fe');`。

:::note
If the input value cannot be represented within the bounds of [UInt32](../data-types/int-uint.md), the result over or under flows.
This is not considered an error.
For example: `SELECT toUInt32(4294967296) == 0;`
:::

**戻り値**

- 32ビット符号なし整数値。 [UInt32](../data-types/int-uint.md)。

:::note
The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
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

- [`toUInt32OrZero`](#touint32orzero).
- [`toUInt32OrNull`](#touint32ornull).
- [`toUInt32OrDefault`](#touint32ordefault).
## toUInt32OrZero {#touint32orzero}

Like [`toUInt32`](#touint32), this function converts an input value to a value of type [UInt32](../data-types/int-uint.md) but returns `0` in case of an error.

**構文**

```sql
toUInt32OrZero(x)
```

**引数**

- `x` — 数字の文字列表現。 [文字列](../data-types/string.md)。

サポートされる引数:
- (U)Int8/16/32/128/256の文字列表現。

サポートされていない引数（`0`を返す）:
- Float32/64の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例えば `SELECT toUInt32OrZero('0xc0fe');`。

:::note
If the input value cannot be represented within the bounds of [UInt32](../data-types/int-uint.md), overflow or underflow of the result occurs.
This is not considered an error.
:::

**戻り値**

- 成功すれば32ビット符号なし整数値、そうでなければ`0`。 [UInt32](../data-types/int-uint.md)

:::note
The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)
, meaning it truncates fractional digits of numbers.
:::

**例**

クエリ:

``` sql
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

- [`toUInt32`](#touint32).
- [`toUInt32OrNull`](#touint32ornull).
- [`toUInt32OrDefault`](#touint32ordefault).
## toUInt32OrNull {#touint32ornull}

Like [`toUInt32`](#touint32), this function converts an input value to a value of type [UInt32](../data-types/int-uint.md) but returns `NULL` in case of an error.

**構文**

```sql
toUInt32OrNull(x)
```

**引数**

- `x` — 数字の文字列表現。 [文字列](../data-types/string.md)。

サポートされる引数:
- (U)Int8/16/32/128/256の文字列表現。

サポートされていない引数（`\N`を返す）:
- Float32/64の値の文字列表現、`NaN`および`Inf`を含む。
- バイナリおよび16進数の値の文字列表現、例えば `SELECT toUInt32OrNull('0xc0fe');`。

:::note
If the input value cannot be represented within the bounds of [UInt32](../data-types/int-uint.md), overflow or underflow of the result occurs.
This is not considered an error.
:::

**戻り値**

- 成功すれば32ビット符号なし整数値、そうでなければ`NULL`。 [UInt32](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)
, meaning it truncates fractional digits of numbers.
:::

**例**

クエリ:

``` sql
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

- [`toUInt32`](#touint32).
- [`toUInt32OrZero`](#touint32orzero).
- [`toUInt32OrDefault`](#touint32ordefault).
```
```yaml
title: 'toUInt32OrDefault'
sidebar_label: 'toUInt32OrDefault'
keywords: ['ClickHouse', 'Function', 'UInt32', 'Default']
description: 'ClickHouse documentation for the function toUInt32OrDefault.'
```

## toUInt32OrDefault {#touint32ordefault}

Like [`toUInt32`](#touint32), this function converts an input value to a value of type [UInt32](../data-types/int-uint.md) but returns the default value in case of an error.  
If no `default` value is passed then `0` is returned in case of an error.

**Syntax**

```sql
toUInt32OrDefault(expr[, default])
```

**Arguments**

- `expr` — Expression returning a number or a string representation of a number. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).
- `default` (optional) — The default value to return if parsing to type `UInt32` is unsuccessful. [UInt32](../data-types/int-uint.md).

Supported arguments:
- Values or string representations of type (U)Int8/16/32/64/128/256.
- Values of type Float32/64.

Arguments for which the default value is returned:
- String representations of Float32/64 values, including `NaN` and `Inf`.
- String representations of binary and hexadecimal values, e.g. `SELECT toUInt32OrDefault('0xc0fe', CAST('0', 'UInt32'));`.

:::note
If the input value cannot be represented within the bounds of [UInt32](../data-types/int-uint.md), overflow or underflow of the result occurs.  
This is not considered an error.
:::

**Returned value**

- 32-bit unsigned integer value if successful, otherwise returns the default value if passed or `0` if not. [UInt32](../data-types/int-uint.md).

:::note
- The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
- The default value type should be the same as the cast type.
:::

**Example**

Query:

```sql
SELECT
    toUInt32OrDefault('32', CAST('0', 'UInt32')),
    toUInt32OrDefault('abc', CAST('0', 'UInt32'))
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toUInt32OrDefault('32', CAST('0', 'UInt32')):  32
toUInt32OrDefault('abc', CAST('0', 'UInt32')): 0
```

**See also**

- [`toUInt32`](#touint32).
- [`toUInt32OrZero`](#touint32orzero).
- [`toUInt32OrNull`](#touint32ornull).
## toUInt64 {#touint64}

Converts an input value to a value of type [`UInt64`](../data-types/int-uint.md). Throws an exception in case of an error.

**Syntax**

```sql
toUInt64(expr)
```

**Arguments**

- `expr` — Expression returning a number or a string representation of a number. [Expression](/sql-reference/syntax#expressions).

Supported arguments:
- Values or string representations of type (U)Int8/16/32/64/128/256.
- Values of type Float32/64.

Unsupported types:
- String representations of Float32/64 values, including `NaN` and `Inf`.
- String representations of binary and hexadecimal values, e.g. `SELECT toUInt64('0xc0fe');`.

:::note
If the input value cannot be represented within the bounds of [UInt64](../data-types/int-uint.md), the result over or under flows.  
This is not considered an error.  
For example: `SELECT toUInt64(18446744073709551616) == 0;`
:::

**Returned value**

- 64-bit unsigned integer value. [UInt64](../data-types/int-uint.md).

:::note
The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
:::

**Example**

Query:

```sql
SELECT
    toUInt64(64),
    toUInt64(64.64),
    toUInt64('64')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toUInt64(64):    64
toUInt64(64.64): 64
toUInt64('64'):  64
```

**See also**

- [`toUInt64OrZero`](#touint64orzero).
- [`toUInt64OrNull`](#touint64ornull).
- [`toUInt64OrDefault`](#touint64ordefault).
## toUInt64OrZero {#touint64orzero}

Like [`toUInt64`](#touint64), this function converts an input value to a value of type [UInt64](../data-types/int-uint.md) but returns `0` in case of an error.

**Syntax**

```sql
toUInt64OrZero(x)
```

**Arguments**

- `x` — A String representation of a number. [String](../data-types/string.md).

Supported arguments:
- String representations of (U)Int8/16/32/128/256.

Unsupported arguments (return `0`):
- String representations of Float32/64 values, including `NaN` and `Inf`.
- String representations of binary and hexadecimal values, e.g. `SELECT toUInt64OrZero('0xc0fe');`.

:::note
If the input value cannot be represented within the bounds of [UInt64](../data-types/int-uint.md), overflow or underflow of the result occurs.  
This is not considered an error.
:::

**Returned value**

- 64-bit unsigned integer value if successful, otherwise `0`. [UInt64](../data-types/int-uint.md).

:::note
The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
:::

**Example**

Query:

```sql
SELECT
    toUInt64OrZero('64'),
    toUInt64OrZero('abc')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toUInt64OrZero('64'):  64
toUInt64OrZero('abc'): 0
```

**See also**

- [`toUInt64`](#touint64).
- [`toUInt64OrNull`](#touint64ornull).
- [`toUInt64OrDefault`](#touint64ordefault).
## toUInt64OrNull {#touint64ornull}

Like [`toUInt64`](#touint64), this function converts an input value to a value of type [UInt64](../data-types/int-uint.md) but returns `NULL` in case of an error.

**Syntax**

```sql
toUInt64OrNull(x)
```

**Arguments**

- `x` — A String representation of a number. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).

Supported arguments:
- String representations of (U)Int8/16/32/128/256.

Unsupported arguments (return `\N`)
- String representations of Float32/64 values, including `NaN` and `Inf`.
- String representations of binary and hexadecimal values, e.g. `SELECT toUInt64OrNull('0xc0fe');`.

:::note
If the input value cannot be represented within the bounds of [UInt64](../data-types/int-uint.md), overflow or underflow of the result occurs.  
This is not considered an error.
:::

**Returned value**

- 64-bit unsigned integer value if successful, otherwise `NULL`. [UInt64](../data-types/int-uint.md) / [NULL](../data-types/nullable.md).

:::note
The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
:::

**Example**

Query:

```sql
SELECT
    toUInt64OrNull('64'),
    toUInt64OrNull('abc')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toUInt64OrNull('64'):  64
toUInt64OrNull('abc'): ᴺᵁᴸᴸ
```

**See also**

- [`toUInt64`](#touint64).
- [`toUInt64OrZero`](#touint64orzero).
- [`toUInt64OrDefault`](#touint64ordefault).
## toUInt64OrDefault {#touint64ordefault}

Like [`toUInt64`](#touint64), this function converts an input value to a value of type [UInt64](../data-types/int-uint.md) but returns the default value in case of an error.  
If no `default` value is passed then `0` is returned in case of an error.

**Syntax**

```sql
toUInt64OrDefault(expr[, default])
```

**Arguments**

- `expr` — Expression returning a number or a string representation of a number. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).
- `default` (optional) — The default value to return if parsing to type `UInt64` is unsuccessful. [UInt64](../data-types/int-uint.md).

Supported arguments:
- Values or string representations of type (U)Int8/16/32/64/128/256.
- Values of type Float32/64.

Arguments for which the default value is returned:
- String representations of Float32/64 values, including `NaN` and `Inf`.
- String representations of binary and hexadecimal values, e.g. `SELECT toUInt64OrDefault('0xc0fe', CAST('0', 'UInt64'));`.

:::note
If the input value cannot be represented within the bounds of [UInt64](../data-types/int-uint.md), overflow or underflow of the result occurs.  
This is not considered an error.
:::

**Returned value**

- 64-bit unsigned integer value if successful, otherwise returns the default value if passed or `0` if not. [UInt64](../data-types/int-uint.md).

:::note
- The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
- The default value type should be the same as the cast type.
:::

**Example**

Query:

```sql
SELECT
    toUInt64OrDefault('64', CAST('0', 'UInt64')),
    toUInt64OrDefault('abc', CAST('0', 'UInt64'))
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toUInt64OrDefault('64', CAST('0', 'UInt64')):  64
toUInt64OrDefault('abc', CAST('0', 'UInt64')): 0
```

**See also**

- [`toUInt64`](#touint64).
- [`toUInt64OrZero`](#touint64orzero).
- [`toUInt64OrNull`](#touint64ornull).
## toUInt128 {#touint128}

Converts an input value to a value of type [`UInt128`](../data-types/int-uint.md). Throws an exception in case of an error.

**Syntax**

```sql
toUInt128(expr)
```

**Arguments**

- `expr` — Expression returning a number or a string representation of a number. [Expression](/sql-reference/syntax#expressions).

Supported arguments:
- Values or string representations of type (U)Int8/16/32/64/128/256.
- Values of type Float32/64.

Unsupported arguments:
- String representations of Float32/64 values, including `NaN` and `Inf`.
- String representations of binary and hexadecimal values, e.g. `SELECT toUInt128('0xc0fe');`.

:::note
If the input value cannot be represented within the bounds of [UInt128](../data-types/int-uint.md), the result over or under flows.  
This is not considered an error.
:::

**Returned value**

- 128-bit unsigned integer value. [UInt128](../data-types/int-uint.md).

:::note
The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
:::

**Example**

Query:

```sql
SELECT
    toUInt128(128),
    toUInt128(128.8),
    toUInt128('128')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toUInt128(128):   128
toUInt128(128.8): 128
toUInt128('128'): 128
```

**See also**

- [`toUInt128OrZero`](#touint128orzero).
- [`toUInt128OrNull`](#touint128ornull).
- [`toUInt128OrDefault`](#touint128ordefault).
## toUInt128OrZero {#touint128orzero}

Like [`toUInt128`](#touint128), this function converts an input value to a value of type [UInt128](../data-types/int-uint.md) but returns `0` in case of an error.

**Syntax**

```sql
toUInt128OrZero(expr)
```

**Arguments**

- `expr` — Expression returning a number or a string representation of a number. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).

Supported arguments:
- String representations of (U)Int8/16/32/128/256.

Unsupported arguments (return `0`):
- String representations of Float32/64 values, including `NaN` and `Inf`.
- String representations of binary and hexadecimal values, e.g. `SELECT toUInt128OrZero('0xc0fe');`.

:::note
If the input value cannot be represented within the bounds of [UInt128](../data-types/int-uint.md), overflow or underflow of the result occurs.  
This is not considered an error.
:::

**Returned value**

- 128-bit unsigned integer value if successful, otherwise `0`. [UInt128](../data-types/int-uint.md).

:::note
The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
:::

**Example**

Query:

```sql
SELECT
    toUInt128OrZero('128'),
    toUInt128OrZero('abc')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toUInt128OrZero('128'): 128
toUInt128OrZero('abc'): 0
```

**See also**

- [`toUInt128`](#touint128).
- [`toUInt128OrNull`](#touint128ornull).
- [`toUInt128OrDefault`](#touint128ordefault).
## toUInt128OrNull {#touint128ornull}

Like [`toUInt128`](#touint128), this function converts an input value to a value of type [UInt128](../data-types/int-uint.md) but returns `NULL` in case of an error.

**Syntax**

```sql
toUInt128OrNull(x)
```

**Arguments**

- `x` — A String representation of a number. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).

Supported arguments:
- String representations of (U)Int8/16/32/128/256.

Unsupported arguments (return `\N`)
- String representations of Float32/64 values, including `NaN` and `Inf`.
- String representations of binary and hexadecimal values, e.g. `SELECT toUInt128OrNull('0xc0fe');`.

:::note
If the input value cannot be represented within the bounds of [UInt128](../data-types/int-uint.md), overflow or underflow of the result occurs.  
This is not considered an error.
:::

**Returned value**

- 128-bit unsigned integer value if successful, otherwise `NULL`. [UInt128](../data-types/int-uint.md) / [NULL](../data-types/nullable.md).

:::note
The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
:::

**Example**

Query:

```sql
SELECT
    toUInt128OrNull('128'),
    toUInt128OrNull('abc')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toUInt128OrNull('128'): 128
toUInt128OrNull('abc'): ᴺᵁᴸᴸ
```

**See also**

- [`toUInt128`](#touint128).
- [`toUInt128OrZero`](#touint128orzero).
- [`toUInt128OrDefault`](#touint128ordefault).
## toUInt128OrDefault {#touint128ordefault}

Like [`toUInt128`](#toint128), this function converts an input value to a value of type [UInt128](../data-types/int-uint.md) but returns the default value in case of an error.  
If no `default` value is passed then `0` is returned in case of an error.

**Syntax**

```sql
toUInt128OrDefault(expr[, default])
```

**Arguments**

- `expr` — Expression returning a number or a string representation of a number. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).
- `default` (optional) — The default value to return if parsing to type `UInt128` is unsuccessful. [UInt128](../data-types/int-uint.md).

Supported arguments:
- (U)Int8/16/32/64/128/256.
- Float32/64.
- String representations of (U)Int8/16/32/128/256.

Arguments for which the default value is returned:
- String representations of Float32/64 values, including `NaN` and `Inf`.
- String representations of binary and hexadecimal values, e.g. `SELECT toUInt128OrDefault('0xc0fe', CAST('0', 'UInt128'));`.

:::note
If the input value cannot be represented within the bounds of [UInt128](../data-types/int-uint.md), overflow or underflow of the result occurs.  
This is not considered an error.
:::

**Returned value**

- 128-bit unsigned integer value if successful, otherwise returns the default value if passed or `0` if not. [UInt128](../data-types/int-uint.md).

:::note
- The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
- The default value type should be the same as the cast type.
:::

**Example**

Query:

```sql
SELECT
    toUInt128OrDefault('128', CAST('0', 'UInt128')),
    toUInt128OrDefault('abc', CAST('0', 'UInt128'))
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toUInt128OrDefault('128', CAST('0', 'UInt128')): 128
toUInt128OrDefault('abc', CAST('0', 'UInt128')): 0
```

**See also**

- [`toUInt128`](#touint128).
- [`toUInt128OrZero`](#touint128orzero).
- [`toUInt128OrNull`](#touint128ornull).
## toUInt256 {#touint256}

Converts an input value to a value of type [`UInt256`](../data-types/int-uint.md). Throws an exception in case of an error.

**Syntax**

```sql
toUInt256(expr)
```

**Arguments**

- `expr` — Expression returning a number or a string representation of a number. [Expression](/sql-reference/syntax#expressions).

Supported arguments:
- Values or string representations of type (U)Int8/16/32/64/128/256.
- Values of type Float32/64.

Unsupported arguments:
- String representations of Float32/64 values, including `NaN` and `Inf`.
- String representations of binary and hexadecimal values, e.g. `SELECT toUInt256('0xc0fe');`.

:::note
If the input value cannot be represented within the bounds of [UInt256](../data-types/int-uint.md), the result over or under flows.  
This is not considered an error.
:::

**Returned value**

- 256-bit unsigned integer value. [Int256](../data-types/int-uint.md).

:::note
The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
:::

**Example**

Query:

```sql
SELECT
    toUInt256(256),
    toUInt256(256.256),
    toUInt256('256')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toUInt256(256):     256
toUInt256(256.256): 256
toUInt256('256'):   256
```

**See also**

- [`toUInt256OrZero`](#touint256orzero).
- [`toUInt256OrNull`](#touint256ornull).
- [`toUInt256OrDefault`](#touint256ordefault).
## toUInt256OrZero {#touint256orzero}

Like [`toUInt256`](#touint256), this function converts an input value to a value of type [UInt256](../data-types/int-uint.md) but returns `0` in case of an error.

**Syntax**

```sql
toUInt256OrZero(x)
```

**Arguments**

- `x` — A String representation of a number. [String](../data-types/string.md).

Supported arguments:
- String representations of (U)Int8/16/32/128/256.

Unsupported arguments (return `0`):
- String representations of Float32/64 values, including `NaN` and `Inf`.
- String representations of binary and hexadecimal values, e.g. `SELECT toUInt256OrZero('0xc0fe');`.

:::note
If the input value cannot be represented within the bounds of [UInt256](../data-types/int-uint.md), overflow or underflow of the result occurs.  
This is not considered an error.
:::

**Returned value**

- 256-bit unsigned integer value if successful, otherwise `0`. [UInt256](../data-types/int-uint.md).

:::note
The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
:::

**Example**

Query:

```sql
SELECT
    toUInt256OrZero('256'),
    toUInt256OrZero('abc')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toUInt256OrZero('256'): 256
toUInt256OrZero('abc'): 0
```

**See also**

- [`toUInt256`](#touint256).
- [`toUInt256OrNull`](#touint256ornull).
- [`toUInt256OrDefault`](#touint256ordefault).
## toUInt256OrNull {#touint256ornull}

Like [`toUInt256`](#touint256), this function converts an input value to a value of type [UInt256](../data-types/int-uint.md) but returns `NULL` in case of an error.

**Syntax**

```sql
toUInt256OrNull(x)
```

**Arguments**

- `x` — A String representation of a number. [String](../data-types/string.md).

Supported arguments:
- String representations of (U)Int8/16/32/128/256.

Unsupported arguments (return `\N`)
- String representations of Float32/64 values, including `NaN` and `Inf`.
- String representations of binary and hexadecimal values, e.g. `SELECT toUInt256OrNull('0xc0fe');`.

:::note
If the input value cannot be represented within the bounds of [UInt256](../data-types/int-uint.md), overflow or underflow of the result occurs.  
This is not considered an error.
:::

**Returned value**

- 256-bit unsigned integer value if successful, otherwise `NULL`. [UInt256](../data-types/int-uint.md) / [NULL](../data-types/nullable.md).

:::note
The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
:::

**Example**

Query:

```sql
SELECT
    toUInt256OrNull('256'),
    toUInt256OrNull('abc')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toUInt256OrNull('256'): 256
toUInt256OrNull('abc'): ᴺᵁᴸᴸ
```

**See also**

- [`toUInt256`](#touint256).
- [`toUInt256OrZero`](#touint256orzero).
- [`toUInt256OrDefault`](#touint256ordefault).
## toUInt256OrDefault {#touint256ordefault}

Like [`toUInt256`](#touint256), this function converts an input value to a value of type [UInt256](../data-types/int-uint.md) but returns the default value in case of an error.  
If no `default` value is passed then `0` is returned in case of an error.

**Syntax**

```sql
toUInt256OrDefault(expr[, default])
```

**Arguments**

- `expr` — Expression returning a number or a string representation of a number. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).
- `default` (optional) — The default value to return if parsing to type `UInt256` is unsuccessful. [UInt256](../data-types/int-uint.md).

Supported arguments:
- Values or string representations of type (U)Int8/16/32/64/128/256.
- Values of type Float32/64.

Arguments for which the default value is returned:
- String representations of Float32/64 values, including `NaN` and `Inf`
- String representations of binary and hexadecimal values, e.g. `SELECT toUInt256OrDefault('0xc0fe', CAST('0', 'UInt256'));`

:::note
If the input value cannot be represented within the bounds of [UInt256](../data-types/int-uint.md), overflow or underflow of the result occurs.  
This is not considered an error.
:::

**Returned value**

- 256-bit unsigned integer value if successful, otherwise returns the default value if passed or `0` if not. [UInt256](../data-types/int-uint.md).

:::note
- The function uses [rounding towards zero](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero), meaning it truncates fractional digits of numbers.
- The default value type should be the same as the cast type.
:::

**Example**

Query:

```sql
SELECT
    toUInt256OrDefault('-256', CAST('0', 'UInt256')),
    toUInt256OrDefault('abc', CAST('0', 'UInt256'))
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toUInt256OrDefault('-256', CAST('0', 'UInt256')): 0
toUInt256OrDefault('abc', CAST('0', 'UInt256')):  0
```

**See also**

- [`toUInt256`](#touint256).
- [`toUInt256OrZero`](#touint256orzero).
- [`toUInt256OrNull`](#touint256ornull).
## toFloat32 {#tofloat32}

Converts an input value to a value of type [`Float32`](../data-types/float.md). Throws an exception in case of an error.

**Syntax**

```sql
toFloat32(expr)
```

**Arguments**

- `expr` — Expression returning a number or a string representation of a number. [Expression](/sql-reference/syntax#expressions).

Supported arguments:
- Values of type (U)Int8/16/32/64/128/256.
- String representations of (U)Int8/16/32/128/256.
- Values of type Float32/64, including `NaN` and `Inf`.
- String representations of Float32/64, including `NaN` and `Inf` (case-insensitive).

Unsupported arguments:
- String representations of binary and hexadecimal values, e.g. `SELECT toFloat32('0xc0fe');`.

**Returned value**

- 32-bit floating point value. [Float32](../data-types/float.md).

**Example**

Query:

```sql
SELECT
    toFloat32(42.7),
    toFloat32('42.7'),
    toFloat32('NaN')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toFloat32(42.7):   42.7
toFloat32('42.7'): 42.7
toFloat32('NaN'):  nan
```

**See also**

- [`toFloat32OrZero`](#tofloat32orzero).
- [`toFloat32OrNull`](#tofloat32ornull).
- [`toFloat32OrDefault`](#tofloat32ordefault).
## toFloat32OrZero {#tofloat32orzero}

Like [`toFloat32`](#tofloat32), this function converts an input value to a value of type [Float32](../data-types/float.md) but returns `0` in case of an error.

**Syntax**

```sql
toFloat32OrZero(x)
```

**Arguments**

- `x` — A String representation of a number. [String](../data-types/string.md).

Supported arguments:
- String representations of (U)Int8/16/32/128/256, Float32/64.

Unsupported arguments (return `0`):
- String representations of binary and hexadecimal values, e.g. `SELECT toFloat32OrZero('0xc0fe');`.

**Returned value**

- 32-bit Float value if successful, otherwise `0`. [Float32](../data-types/float.md).

**Example**

Query:

```sql
SELECT
    toFloat32OrZero('42.7'),
    toFloat32OrZero('abc')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toFloat32OrZero('42.7'): 42.7
toFloat32OrZero('abc'):  0
```

**See also**

- [`toFloat32`](#tofloat32).
- [`toFloat32OrNull`](#tofloat32ornull).
- [`toFloat32OrDefault`](#tofloat32ordefault).
## toFloat32OrNull {#tofloat32ornull}

Like [`toFloat32`](#tofloat32), this function converts an input value to a value of type [Float32](../data-types/float.md) but returns `NULL` in case of an error.

**Syntax**

```sql
toFloat32OrNull(x)
```

**Arguments**

- `x` — A String representation of a number. [String](../data-types/string.md).

Supported arguments:
- String representations of (U)Int8/16/32/128/256, Float32/64.

Unsupported arguments (return `\N`):
- String representations of binary and hexadecimal values, e.g. `SELECT toFloat32OrNull('0xc0fe');`.

**Returned value**

- 32-bit Float value if successful, otherwise `\N`. [Float32](../data-types/float.md).

**Example**

Query:

```sql
SELECT
    toFloat32OrNull('42.7'),
    toFloat32OrNull('abc')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toFloat32OrNull('42.7'): 42.7
toFloat32OrNull('abc'):  ᴺᵁᴸᴸ
```

**See also**

- [`toFloat32`](#tofloat32).
- [`toFloat32OrZero`](#tofloat32orzero).
- [`toFloat32OrDefault`](#tofloat32ordefault).
## toFloat32OrDefault {#tofloat32ordefault}

Like [`toFloat32`](#tofloat32), this function converts an input value to a value of type [Float32](../data-types/float.md) but returns the default value in case of an error.  
If no `default` value is passed then `0` is returned in case of an error.

**Syntax**

```sql
toFloat32OrDefault(expr[, default])
```

**Arguments**

- `expr` — Expression returning a number or a string representation of a number. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).
- `default` (optional) — The default value to return if parsing to type `Float32` is unsuccessful. [Float32](../data-types/float.md).

Supported arguments:
- Values of type (U)Int8/16/32/64/128/256.
- String representations of (U)Int8/16/32/128/256.
- Values of type Float32/64, including `NaN` and `Inf`.
- String representations of Float32/64, including `NaN` and `Inf` (case-insensitive).

Arguments for which the default value is returned:
- String representations of binary and hexadecimal values, e.g. `SELECT toFloat32OrDefault('0xc0fe', CAST('0', 'Float32'));`.

**Returned value**

- 32-bit Float value if successful, otherwise returns the default value if passed or `0` if not. [Float32](../data-types/float.md).

**Example**

Query:

```sql
SELECT
    toFloat32OrDefault('8', CAST('0', 'Float32')),
    toFloat32OrDefault('abc', CAST('0', 'Float32'))
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toFloat32OrDefault('8', CAST('0', 'Float32')):   8
toFloat32OrDefault('abc', CAST('0', 'Float32')): 0
```

**See also**

- [`toFloat32`](#tofloat32).
- [`toFloat32OrZero`](#tofloat32orzero).
- [`toFloat32OrNull`](#tofloat32ornull).
## toFloat64 {#tofloat64}

Converts an input value to a value of type [`Float64`](../data-types/float.md). Throws an exception in case of an error.

**Syntax**

```sql
toFloat64(expr)
```

**Arguments**

- `expr` — Expression returning a number or a string representation of a number. [Expression](/sql-reference/syntax#expressions).

Supported arguments:
- Values of type (U)Int8/16/32/64/128/256.
- String representations of (U)Int8/16/32/128/256.
- Values of type Float32/64, including `NaN` and `Inf`.
- String representations of type Float32/64, including `NaN` and `Inf` (case-insensitive).

Unsupported arguments:
- String representations of binary and hexadecimal values, e.g. `SELECT toFloat64('0xc0fe');`.

**Returned value**

- 64-bit floating point value. [Float64](../data-types/float.md).

**Example**

Query:

```sql
SELECT
    toFloat64(42.7),
    toFloat64('42.7'),
    toFloat64('NaN')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toFloat64(42.7):   42.7
toFloat64('42.7'): 42.7
toFloat64('NaN'):  nan
```

**See also**

- [`toFloat64OrZero`](#tofloat64orzero).
- [`toFloat64OrNull`](#tofloat64ornull).
- [`toFloat64OrDefault`](#tofloat64ordefault).
## toFloat64OrZero {#tofloat64orzero}

Like [`toFloat64`](#tofloat64), this function converts an input value to a value of type [Float64](../data-types/float.md) but returns `0` in case of an error.

**Syntax**

```sql
toFloat64OrZero(x)
```

**Arguments**

- `x` — A String representation of a number. [String](../data-types/string.md).

Supported arguments:
- String representations of (U)Int8/16/32/128/256, Float32/64.

Unsupported arguments (return `0`):
- String representations of binary and hexadecimal values, e.g. `SELECT toFloat64OrZero('0xc0fe');`.

**Returned value**

- 64-bit Float value if successful, otherwise `0`. [Float64](../data-types/float.md).

**Example**

Query:

```sql
SELECT
    toFloat64OrZero('42.7'),
    toFloat64OrZero('abc')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toFloat64OrZero('42.7'): 42.7
toFloat64OrZero('abc'):  0
```

**See also**

- [`toFloat64`](#tofloat64).
- [`toFloat64OrNull`](#tofloat64ornull).
- [`toFloat64OrDefault`](#tofloat64ordefault).
## toFloat64OrNull {#tofloat64ornull}

Like [`toFloat64`](#tofloat64), this function converts an input value to a value of type [Float64](../data-types/float.md) but returns `NULL` in case of an error.

**Syntax**

```sql
toFloat64OrNull(x)
```

**Arguments**

- `x` — A String representation of a number. [String](../data-types/string.md).

Supported arguments:
- String representations of (U)Int8/16/32/128/256, Float32/64.

Unsupported arguments (return `\N`):
- String representations of binary and hexadecimal values, e.g. `SELECT toFloat64OrNull('0xc0fe');`.

**Returned value**

- 64-bit Float value if successful, otherwise `\N`. [Float64](../data-types/float.md).

**Example**

Query:

```sql
SELECT
    toFloat64OrNull('42.7'),
    toFloat64OrNull('abc')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toFloat64OrNull('42.7'): 42.7
toFloat64OrNull('abc'):  ᴺᵁᴸᴸ
```

**See also**

- [`toFloat64`](#tofloat64).
- [`toFloat64OrZero`](#tofloat64orzero).
- [`toFloat64OrDefault`](#tofloat64ordefault).
```

## toFloat64OrDefault {#tofloat64ordefault}

Like [`toFloat64`](#tofloat64), this function converts an input value to a value of type [Float64](../data-types/float.md) but returns the default value in case of an error.
If no `default` value is passed then `0` is returned in case of an error.

**構文**

```sql
toFloat64OrDefault(expr[, default])
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions) / [文字列](../data-types/string.md)。
- `default` (オプション) — `Float64`型へのパースが失敗した場合に返すデフォルト値。 [Float64](../data-types/float.md)。

サポートされる引数:
- (U)Int8/16/32/64/128/256型の値。
- (U)Int8/16/32/128/256の文字列表現。
- Float32/64型の値、`NaN`および`Inf`を含む。
- Float32/64の文字列表現、`NaN`および`Inf`を含む（ケース非感知）。

デフォルト値が返される引数:
- 2進数および16進数の文字列表現、例: `SELECT toFloat64OrDefault('0xc0fe', CAST('0', 'Float64'));`。

**返される値**

- 成功した場合は64ビットのFloat値、失敗した場合は渡されたデフォルト値または渡されなかった場合は`0`が返されます。 [Float64](../data-types/float.md)。

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

**その他の情報**

- [`toFloat64`](#tofloat64).
- [`toFloat64OrZero`](#tofloat64orzero).
- [`toFloat64OrNull`](#tofloat64ornull).

## toBFloat16 {#tobfloat16}

Converts an input value to a value of type [`BFloat16`](../data-types/float.md/#bfloat16). 
Throws an exception in case of an error.

**構文**

```sql
toBFloat16(expr)
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions)。

サポートされる引数:
- (U)Int8/16/32/64/128/256型の値。
- (U)Int8/16/32/128/256の文字列表現。
- Float32/64型の値、`NaN`および`Inf`を含む。
- Float32/64の文字列表現、`NaN`および`Inf`を含む（ケース非感知）。

**返される値**

- 16ビットのブレインフロート値。 [BFloat16](../data-types/float.md/#bfloat16)。

**例**

```sql
SELECT toBFloat16(toFloat32(42.7))

42.5

SELECT toBFloat16(toFloat32('42.7'));

42.5

SELECT toBFloat16('42.7');

42.5
```

**その他の情報**

- [`toBFloat16OrZero`](#tobfloat16orzero).
- [`toBFloat16OrNull`](#tobfloat16ornull).

## toBFloat16OrZero {#tobfloat16orzero}

Converts a String input value to a value of type [`BFloat16`](../data-types/float.md/#bfloat16).
If the string does not represent a floating point value, the function returns zero.

**構文**

```sql
toBFloat16OrZero(x)
```

**引数**

- `x` — 数字の文字列表現。 [文字列](../data-types/string.md)。

サポートされる引数:

- 数値の文字列表現。

サポートされていない引数（`0`を返す）:

- 2進数および16進数の文字列表現。
- 数値。

**返される値**

- 16ビットのブレインフロート値、さもなくば`0`。 [BFloat16](../data-types/float.md/#bfloat16)。

:::note
関数は文字列表現から変換する際に精度の静かな損失を許可します。
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

**その他の情報**

- [`toBFloat16`](#tobfloat16).
- [`toBFloat16OrNull`](#tobfloat16ornull).

## toBFloat16OrNull {#tobfloat16ornull}

Converts a String input value to a value of type [`BFloat16`](../data-types/float.md/#bfloat16) 
but if the string does not represent a floating point value, the function returns `NULL`.

**構文**

```sql
toBFloat16OrNull(x)
```

**引数**

- `x` — 数字の文字列表現。 [文字列](../data-types/string.md)。

サポートされる引数:

- 数値の文字列表現。

サポートされていない引数（`NULL`を返す）:

- 2進数および16進数の文字列表現。
- 数値。

**返される値**

- 16ビットのブレインフロート値、さもなくば`NULL` (`\N`)。 [BFloat16](../data-types/float.md/#bfloat16)。

:::note
関数は文字列表現から変換する際に精度の静かな損失を許可します。
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

**その他の情報**

- [`toBFloat16`](#tobfloat16).
- [`toBFloat16OrZero`](#tobfloat16orzero).

## toDate {#todate}

Converts the argument to [Date](../data-types/date.md) data type.

If the argument is [DateTime](../data-types/datetime.md) or [DateTime64](../data-types/datetime64.md), it truncates it and leaves the date component of the DateTime:

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

If the argument is a [String](../data-types/string.md), it is parsed as [Date](../data-types/date.md) or [DateTime](../data-types/datetime.md). If it was parsed as [DateTime](../data-types/datetime.md), the date component is being used:

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

If the argument is a number and looks like a UNIX timestamp (is greater than 65535), it is interpreted as a [DateTime](../data-types/datetime.md), then truncated to [Date](../data-types/date.md) in the current timezone. The timezone argument can be specified as a second argument of the function. The truncation to [Date](../data-types/date.md) depends on the timezone:

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

The example above demonstrates how the same UNIX timestamp can be interpreted as different dates in different time zones.

If the argument is a number and it is smaller than 65536, it is interpreted as the number of days since 1970-01-01 (the first UNIX day) and converted to [Date](../data-types/date.md). It corresponds to the internal numeric representation of the `Date` data type. Example:

```sql
SELECT toDate(12345)
```
```response
┌─toDate(12345)─┐
│    2003-10-20 │
└───────────────┘
```

This conversion does not depend on timezones.

If the argument does not fit in the range of the Date type, it results in an implementation-defined behavior, that can saturate to the maximum supported date or overflow:
```sql
SELECT toDate(10000000000.)
```
```response
┌─toDate(10000000000.)─┐
│           2106-02-07 │
└──────────────────────┘
```

The function `toDate` can be also written in alternative forms:

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

The same as [toDate](#todate) but returns lower boundary of [Date](../data-types/date.md) if an invalid argument is received. Only [String](../data-types/string.md) argument is supported.

**例**

クエリ:

``` sql
SELECT toDateOrZero('2022-12-30'), toDateOrZero('');
```

結果:

```response
┌─toDateOrZero('2022-12-30')─┬─toDateOrZero('')─┐
│                 2022-12-30 │       1970-01-01 │
└────────────────────────────┴──────────────────┘
```

## toDateOrNull {#todateornull}

The same as [toDate](#todate) but returns `NULL` if an invalid argument is received. Only [String](../data-types/string.md) argument is supported.

**例**

クエリ:

``` sql
SELECT toDateOrNull('2022-12-30'), toDateOrNull('');
```

結果:

```response
┌─toDateOrNull('2022-12-30')─┬─toDateOrNull('')─┐
│                 2022-12-30 │             ᴺᵁᴸᴸ │
└────────────────────────────┴──────────────────┘
```

## toDateOrDefault {#todateordefault}

Like [toDate](#todate) but if unsuccessful, returns a default value which is either the second argument (if specified), or otherwise the lower boundary of [Date](../data-types/date.md).

**構文**

``` sql
toDateOrDefault(expr [, default_value])
```

**例**

クエリ:

``` sql
SELECT toDateOrDefault('2022-12-30'), toDateOrDefault('', '2023-01-01'::Date);
```

結果:

```response
┌─toDateOrDefault('2022-12-30')─┬─toDateOrDefault('', CAST('2023-01-01', 'Date'))─┐
│                    2022-12-30 │                                      2023-01-01 │
└───────────────────────────────┴─────────────────────────────────────────────────┘
```

## toDateTime {#todatetime}

Converts an input value to [DateTime](../data-types/datetime.md).

**構文**

``` sql
toDateTime(expr[, time_zone ])
```

**引数**

- `expr` — 値。 [文字列](../data-types/string.md)、[整数](../data-types/int-uint.md)、[日付](../data-types/date.md)または[DateTime](../data-types/datetime.md)。
- `time_zone` — タイムゾーン。 [文字列](../data-types/string.md)。

:::note
`expr` が数値の場合、それはUnixエポックの始まりからの秒数として解釈されます（Unixタイムスタンプとして）。
`expr` が [文字列](../data-types/string.md) の場合、Unixタイムスタンプまたは日付/日時の文字列として解釈される場合があります。
したがって、短い数値の文字列表現（最大4桁）のパースはあいまいさのために明示的に無効化されています。例えば、文字列`'1999'`は年（不完全な日付/日時の文字列表現）またはUnixタイムスタンプの両方として解釈されます。長い数値の文字列は許可されます。
:::

**返される値**

- 日時。 [DateTime](../data-types/datetime.md)

**例**

クエリ:

``` sql
SELECT toDateTime('2022-12-30 13:44:17'), toDateTime(1685457500, 'UTC');
```

結果:

```response
┌─toDateTime('2022-12-30 13:44:17')─┬─toDateTime(1685457500, 'UTC')─┐
│               2022-12-30 13:44:17 │           2023-05-30 14:38:20 │
└───────────────────────────────────┴───────────────────────────────┘
```

## toDateTimeOrZero {#todatetimeorzero}

The same as [toDateTime](#todatetime) but returns lower boundary of [DateTime](../data-types/datetime.md) if an invalid argument is received. Only [String](../data-types/string.md) argument is supported.

**例**

クエリ:

``` sql
SELECT toDateTimeOrZero('2022-12-30 13:44:17'), toDateTimeOrZero('');
```

結果:

```response
┌─toDateTimeOrZero('2022-12-30 13:44:17')─┬─toDateTimeOrZero('')─┐
│                     2022-12-30 13:44:17 │  1970-01-01 00:00:00 │
└─────────────────────────────────────────┴──────────────────────┘
```

## toDateTimeOrNull {#todatetimeornull}

The same as [toDateTime](#todatetime) but returns `NULL` if an invalid argument is received. Only [String](../data-types/string.md) argument is supported.

**例**

クエリ:

``` sql
SELECT toDateTimeOrNull('2022-12-30 13:44:17'), toDateTimeOrNull('');
```

結果:

```response
┌─toDateTimeOrNull('2022-12-30 13:44:17')─┬─toDateTimeOrNull('')─┐
│                     2022-12-30 13:44:17 │                 ᴺᵁᴸᴸ │
└─────────────────────────────────────────┴──────────────────────┘
```

## toDateTimeOrDefault {#todatetimeordefault}

Like [toDateTime](#todatetime) but if unsuccessful, returns a default value which is either the third argument (if specified), or otherwise the lower boundary of [DateTime](../data-types/datetime.md).

**構文**

``` sql
toDateTimeOrDefault(expr [, time_zone [, default_value]])
```

**例**

クエリ:

``` sql
SELECT toDateTimeOrDefault('2022-12-30 13:44:17'), toDateTimeOrDefault('', 'UTC', '2023-01-01'::DateTime('UTC'));
```

結果:

```response
┌─toDateTimeOrDefault('2022-12-30 13:44:17')─┬─toDateTimeOrDefault('', 'UTC', CAST('2023-01-01', 'DateTime(\'UTC\')'))─┐
│                        2022-12-30 13:44:17 │                                                     2023-01-01 00:00:00 │
└────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────────┘
```

## toDate32 {#todate32}

Converts the argument to the [Date32](../data-types/date32.md) data type. If the value is outside the range, `toDate32` returns the border values supported by [Date32](../data-types/date32.md). If the argument has [Date](../data-types/date.md) type, it's borders are taken into account.

**構文**

``` sql
toDate32(expr)
```

**引数**

- `expr` — 値。 [文字列](../data-types/string.md)、[UInt32](../data-types/int-uint.md)または[日付](../data-types/date.md)。

**返される値**

- カレンダー日。 タイプ [Date32](../data-types/date32.md)。

**例**

1. 値が範囲内である場合:

``` sql
SELECT toDate32('1955-01-01') AS value, toTypeName(value);
```

```response
┌──────value─┬─toTypeName(toDate32('1925-01-01'))─┐
│ 1955-01-01 │ Date32                             │
└────────────┴────────────────────────────────────┘
```

2. 値が範囲外である場合:

``` sql
SELECT toDate32('1899-01-01') AS value, toTypeName(value);
```

```response
┌──────value─┬─toTypeName(toDate32('1899-01-01'))─┐
│ 1900-01-01 │ Date32                             │
└────────────┴────────────────────────────────────┘
```

3. [Date](../data-types/date.md)引数を使用:

``` sql
SELECT toDate32(toDate('1899-01-01')) AS value, toTypeName(value);
```

```response
┌──────value─┬─toTypeName(toDate32(toDate('1899-01-01')))─┐
│ 1970-01-01 │ Date32                                     │
└────────────┴────────────────────────────────────────────┘
```

## toDate32OrZero {#todate32orzero}

The same as [toDate32](#todate32) but returns the min value of [Date32](../data-types/date32.md) if an invalid argument is received.

**例**

クエリ:

``` sql
SELECT toDate32OrZero('1899-01-01'), toDate32OrZero('');
```

結果:

```response
┌─toDate32OrZero('1899-01-01')─┬─toDate32OrZero('')─┐
│                   1900-01-01 │         1900-01-01 │
└──────────────────────────────┴────────────────────┘
```

## toDate32OrNull {#todate32ornull}

The same as [toDate32](#todate32) but returns `NULL` if an invalid argument is received.

**例**

クエリ:

``` sql
SELECT toDate32OrNull('1955-01-01'), toDate32OrNull('');
```

結果:

```response
┌─toDate32OrNull('1955-01-01')─┬─toDate32OrNull('')─┐
│                   1955-01-01 │               ᴺᵁᴸᴸ │
└──────────────────────────────┴────────────────────┘
```

## toDate32OrDefault {#todate32ordefault}

Converts the argument to the [Date32](../data-types/date32.md) data type. If the value is outside the range, `toDate32OrDefault` returns the lower border value supported by [Date32](../data-types/date32.md). If the argument has [Date](../data-types/date.md) type, it's borders are taken into account. Returns default value if an invalid argument is received.

**例**

クエリ:

``` sql
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

Converts an input value to a value of type [DateTime64](../data-types/datetime64.md).

**構文**

``` sql
toDateTime64(expr, scale, [timezone])
```

**引数**

- `expr` — 値。 [文字列](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[浮動小数点](../data-types/float.md)または[DateTime](../data-types/datetime.md)。
- `scale` - ティックサイズ（精度）：10<sup>-precision</sup>秒。 有効な範囲: [ 0 : 9 ]。
- `timezone` (オプション) - 指定されたdatetime64オブジェクトのタイムゾーン。

**返される値**

- サブ秒精度を持つカレンダー日と時間帯。 [DateTime64](../data-types/datetime64.md)。

**例**

1. 値が範囲内である場合:

``` sql
SELECT toDateTime64('1955-01-01 00:00:00.000', 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64('1955-01-01 00:00:00.000', 3))─┐
│ 1955-01-01 00:00:00.000 │ DateTime64(3)                                          │
└─────────────────────────┴────────────────────────────────────────────────────────┘
```

2. 精度付きの小数として:

``` sql
SELECT toDateTime64(1546300800.000, 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64(1546300800., 3))─┐
│ 2019-01-01 00:00:00.000 │ DateTime64(3)                            │
└─────────────────────────┴──────────────────────────────────────────┘
```

小数点なしの値はUnixタイムスタンプ（秒単位）のものとして扱われます:

``` sql
SELECT toDateTime64(1546300800000, 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64(1546300800000, 3))─┐
│ 2282-12-31 00:00:00.000 │ DateTime64(3)                              │
└─────────────────────────┴────────────────────────────────────────────┘
```

3. `timezone`を使用:

``` sql
SELECT toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul') AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul'))─┐
│ 2019-01-01 00:00:00.000 │ DateTime64(3, 'Asia/Istanbul')                                      │
└─────────────────────────┴─────────────────────────────────────────────────────────────────────┘
```

## toDateTime64OrZero {#todatetime64orzero}

Like [toDateTime64](#todatetime64), this function converts an input value to a value of type [DateTime64](../data-types/datetime64.md) but returns the min value of [DateTime64](../data-types/datetime64.md) if an invalid argument is received.

**構文**

``` sql
toDateTime64OrZero(expr, scale, [timezone])
```

**引数**

- `expr` — 値。 [文字列](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[浮動小数点](../data-types/float.md)または[DateTime](../data-types/datetime.md)。
- `scale` - ティックサイズ（精度）：10<sup>-precision</sup>秒。 有効な範囲: [ 0 : 9 ]。
- `timezone` (オプション) - 指定されたDateTime64オブジェクトのタイムゾーン。

**返される値**

- サブ秒精度を持つカレンダー日と時間帯、さもなくば`DateTime64`の最小値：`1970-01-01 01:00:00.000`。 [DateTime64](../data-types/datetime64.md)。

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

**その他の情報**

- [toDateTime64](#todatetime64).
- [toDateTime64OrNull](#todatetime64ornull).
- [toDateTime64OrDefault](#todatetime64ordefault).

## toDateTime64OrNull {#todatetime64ornull}

Like [toDateTime64](#todatetime64), this function converts an input value to a value of type [DateTime64](../data-types/datetime64.md) but returns `NULL` if an invalid argument is received.

**構文**

``` sql
toDateTime64OrNull(expr, scale, [timezone])
```

**引数**

- `expr` — 値。 [文字列](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[浮動小数点](../data-types/float.md)または[DateTime](../data-types/datetime.md)。
- `scale` - ティックサイズ（精度）：10<sup>-precision</sup>秒。 有効な範囲: [ 0 : 9 ]。
- `timezone` (オプション) - 指定されたDateTime64オブジェクトのタイムゾーン。

**返される値**

- サブ秒精度を持つカレンダー日と時間帯、さもなくば`NULL`。 [DateTime64](../data-types/datetime64.md)/[NULL](../data-types/nullable.md)。

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
│ 1976-10-18 00:00:00.300 │        ᴺᵁᴺᴸ │
└─────────────────────────┴─────────────┘
```

**その他の情報**

- [toDateTime64](#todatetime64).
- [toDateTime64OrZero](#todatetime64orzero).
- [toDateTime64OrDefault](#todatetime64ordefault).

## toDateTime64OrDefault {#todatetime64ordefault}

Like [toDateTime64](#todatetime64), this function converts an input value to a value of type [DateTime64](../data-types/datetime64.md),
but returns either the default value of [DateTime64](../data-types/datetime64.md)
or the provided default if an invalid argument is received.

**構文**

``` sql
toDateTime64OrNull(expr, scale, [timezone, default])
```

**引数**

- `expr` — 値。 [文字列](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[浮動小数点](../data-types/float.md)または[DateTime](../data-types/datetime.md)。
- `scale` - ティックサイズ（精度）：10<sup>-precision</sup>秒。 有効な範囲: [ 0 : 9 ]。
- `timezone` (オプション) - 指定されたDateTime64オブジェクトのタイムゾーン。
- `default` (オプション) - 無効な引数が渡された場合に返すデフォルト値。 [DateTime64](../data-types/datetime64.md)。

**返される値**

- サブ秒精度を持つカレンダー日と時間帯、さもなくば`DateTime64`の最小値または提供された`default`値が返されます。 [DateTime64](../data-types/datetime64.md)。

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

**その他の情報**

- [toDateTime64](#todatetime64).
- [toDateTime64OrZero](#todatetime64orzero).
- [toDateTime64OrNull](#todatetime64ornull).

## toDecimal32 {#todecimal32}

Converts an input value to a value of type [`Decimal(9, S)`](../data-types/decimal.md) with scale of `S`. Throws an exception in case of an error.

**構文**

```sql
toDecimal32(expr, S)
```

**引数**

- `expr` — 数字または数字の文字列表現を返す式。 [式](/sql-reference/syntax#expressions)。
- `S` — 数値の小数部が持つことができる桁数を指定するスケールパラメータ、0から9の間。 [UInt8](../data-types/int-uint.md)。

サポートされる引数:
- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値または文字列表現。

サポートされていない引数:
- Float32/64型の値 `NaN` および `Inf` の文字列表現（ケース非感知）。
- 2進数および16進数の文字列表現、例: `SELECT toDecimal32('0xc0fe', 1);`。

:::note
オーバーフローが発生する可能性があります。もし`expr`の値が`Decimal32`の境界を超えると: `( -1 * 10^(9 - S), 1 * 10^(9 - S) )`。
小数部に過剰な桁が含まれている場合は切り捨てられます（四捨五入ではない）。
整数部に過剰な桁が含まれていると、例外が発生します。
:::

:::warning
変換は余分な桁を削除し、Float32/Float64入力での操作が予期せぬ方法で行われる可能性があります。演算は浮動小数点命令を使用して行われるためです。
たとえば、`toDecimal32(1.15, 2)`は`1.14`に等しいです。これは1.15 * 100が浮動小数点で114.99に等しいからです。
文字列入力を使用することで元の整数型を使用して演算が行われるようにできます：`toDecimal32('1.15', 2) = 1.15`
:::

**返される値**

- タイプ `Decimal(9, S)` の値。 [Decimal32(S)](../data-types/int-uint.md)。

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

**その他の情報**

- [`toDecimal32OrZero`](#todecimal32orzero).
- [`toDecimal32OrNull`](#todecimal32ornull).
- [`toDecimal32OrDefault`](#todecimal32ordefault).

## toDecimal32OrZero {#todecimal32orzero}

Like [`toDecimal32`](#todecimal32), this function converts an input value to a value of type [Decimal(9, S)](../data-types/decimal.md) but returns `0` in case of an error.

**構文**

```sql
toDecimal32OrZero(expr, S)
```

**引数**

- `expr` — 数字の文字列表現。 [文字列](../data-types/string.md)。
- `S` — 数値の小数部が持つことができる桁数を指定するスケールパラメータ、0から9の間。 [UInt8](../data-types/int-uint.md)。

サポートされる引数:
- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値または文字列表現。

サポートされていない引数:
- Float32/64型の値の`NaN`および`Inf`の文字列表現。
- 2進数および16進数の文字列表現、例: `SELECT toDecimal32OrZero('0xc0fe', 1);`。

:::note
オーバーフローが発生する可能性があります。もし`expr`の値が`Decimal32`の境界を超えると: `( -1 * 10^(9 - S), 1 * 10^(9 - S) )`。
小数部に過剰な桁が含まれている場合は切り捨てられます（四捨五入ではない）。
整数部に過剰な桁が含まれているとエラーが発生します。
:::

**返される値**

- 成功した場合は型 `Decimal(9, S)`の値、それ以外の場合は`0`で `S` 小数桁数の値。 [Decimal32(S)](../data-types/decimal.md)。

**例**

クエリ:

``` sql
SELECT
    toDecimal32OrZero(toString(-1.111), 5) AS a,
    toTypeName(a),
    toDecimal32OrZero(toString('Inf'), 5) as b,
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

**その他の情報**

- [`toDecimal32`](#todecimal32).
- [`toDecimal32OrNull`](#todecimal32ornull).
- [`toDecimal32OrDefault`](#todecimal32ordefault).

## toDecimal32OrNull {#todecimal32ornull}

Like [`toDecimal32`](#todecimal32), this function converts an input value to a value of type [Nullable(Decimal(9, S))](../data-types/decimal.md) but returns `0` in case of an error.

**構文**

```sql
toDecimal32OrNull(expr, S)
```

**引数**

- `expr` — 数字の文字列表現。 [文字列](../data-types/string.md)。
- `S` — 数値の小数部が持つことができる桁数を指定するスケールパラメータ、0から9の間。 [UInt8](../data-types/int-uint.md)。

サポートされる引数:
- (U)Int8/16/32/64/128/256型の値または文字列表現。
- Float32/64型の値または文字列表現。

サポートされていない引数:
- Float32/64型の値 `NaN` および `Inf` の文字列表現。
- 2進数および16進数の文字列表現、例: `SELECT toDecimal32OrNull('0xc0fe', 1);`。

:::note
オーバーフローが発生する可能性があります。もし`expr`の値が`Decimal32`の境界を超えると: `( -1 * 10^(9 - S), 1 * 10^(9 - S) )`。
小数部に過剰な桁が含まれている場合は切り捨てられます（四捨五入ではない）。
整数部に過剰な桁が含まれているとエラーが発生します。
:::

**返される値**

- 成功した場合は型 `Nullable(Decimal(9, S))`の値、それ以外の場合は同じ型の値`NULL`。 [Decimal32(S)](../data-types/decimal.md)。

**例**

クエリ:

``` sql
SELECT
    toDecimal32OrNull(toString(-1.111), 5) AS a,
    toTypeName(a),
    toDecimal32OrNull(toString('Inf'), 5) as b,
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

**その他の情報**

- [`toDecimal32`](#todecimal32).
- [`toDecimal32OrZero`](#todecimal32orzero).
- [`toDecimal32OrDefault`](#todecimal32ordefault).
```

## toDecimal32OrDefault {#todecimal32ordefault}

Like [`toDecimal32`](#todecimal32), this function converts an input value to a value of type [Decimal(9, S)](../data-types/decimal.md) but returns the default value in case of an error.

**Syntax**

```sql
toDecimal32OrDefault(expr, S[, default])
```

**Arguments**

- `expr` — A String representation of a number. [String](../data-types/string.md).
- `S` — Scale parameter between 0 and 9, specifying how many digits the fractional part of a number can have. [UInt8](../data-types/int-uint.md).
- `default` (optional) — The default value to return if parsing to type `Decimal32(S)` is unsuccessful. [Decimal32(S)](../data-types/decimal.md).

Supported arguments:
- String representations of type (U)Int8/16/32/64/128/256.
- String representations of type Float32/64.

Unsupported arguments:
- String representations of Float32/64 values `NaN` and `Inf`.
- String representations of binary and hexadecimal values, e.g. `SELECT toDecimal32OrDefault('0xc0fe', 1);`.

:::note
An overflow can occur if the value of `expr` exceeds the bounds of `Decimal32`: `( -1 * 10^(9 - S), 1 * 10^(9 - S) )`.
Excessive digits in a fraction are discarded (not rounded).
Excessive digits in the integer part will lead to an error.
:::

:::warning
Conversions drop extra digits and could operate in an unexpected way when working with Float32/Float64 inputs as the operations are performed using floating point instructions.
For example: `toDecimal32OrDefault(1.15, 2)` is equal to `1.14` because 1.15 * 100 in floating point is 114.99.
You can use a String input so the operations use the underlying integer type: `toDecimal32OrDefault('1.15', 2) = 1.15`
:::

**Returned value**

- Value of type `Decimal(9, S)` if successful, otherwise returns the default value if passed or `0` if not. [Decimal32(S)](../data-types/decimal.md).

**Examples**

Query:

``` sql
SELECT
    toDecimal32OrDefault(toString(0.0001), 5) AS a,
    toTypeName(a),
    toDecimal32OrDefault('Inf', 0, CAST('-1', 'Decimal32(0)')) AS b,
    toTypeName(b)
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
a:             0.0001
toTypeName(a): Decimal(9, 5)
b:             -1
toTypeName(b): Decimal(9, 0)
```

**See also**

- [`toDecimal32`](#todecimal32).
- [`toDecimal32OrZero`](#todecimal32orzero).
- [`toDecimal32OrNull`](#todecimal32ornull).
## toDecimal64 {#todecimal64}

Converts an input value to a value of type [`Decimal(18, S)`](../data-types/decimal.md) with scale of `S`. Throws an exception in case of an error.

**Syntax**

```sql
toDecimal64(expr, S)
```

**Arguments**

- `expr` — Expression returning a number or a string representation of a number. [Expression](/sql-reference/syntax#expressions).
- `S` — Scale parameter between 0 and 18, specifying how many digits the fractional part of a number can have. [UInt8](../data-types/int-uint.md).

Supported arguments:
- Values or string representations of type (U)Int8/16/32/64/128/256.
- Values or string representations of type Float32/64.

Unsupported arguments:
- Values or string representations of Float32/64 values `NaN` and `Inf` (case-insensitive).
- String representations of binary and hexadecimal values, e.g. `SELECT toDecimal64('0xc0fe', 1);`.

:::note
An overflow can occur if the value of `expr` exceeds the bounds of `Decimal64`: `( -1 * 10^(18 - S), 1 * 10^(18 - S) )`.
Excessive digits in a fraction are discarded (not rounded).
Excessive digits in the integer part will lead to an exception.
:::

:::warning
Conversions drop extra digits and could operate in an unexpected way when working with Float32/Float64 inputs as the operations are performed using floating point instructions.
For example: `toDecimal64(1.15, 2)` is equal to `1.14` because 1.15 * 100 in floating point is 114.99.
You can use a String input so the operations use the underlying integer type: `toDecimal64('1.15', 2) = 1.15`
:::

**Returned value**

- Value of type `Decimal(18, S)`. [Decimal64(S)](../data-types/int-uint.md).

**Example**

Query:

```sql
SELECT
    toDecimal64(2, 1) AS a, toTypeName(a) AS type_a,
    toDecimal64(4.2, 2) AS b, toTypeName(b) AS type_b,
    toDecimal64('4.2', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical;
```

Result:

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

**See also**

- [`toDecimal64OrZero`](#todecimal64orzero).
- [`toDecimal64OrNull`](#todecimal64ornull).
- [`toDecimal64OrDefault`](#todecimal64ordefault).
## toDecimal64OrZero {#todecimal64orzero}

Like [`toDecimal64`](#todecimal64), this function converts an input value to a value of type [Decimal(18, S)](../data-types/decimal.md) but returns `0` in case of an error.

**Syntax**

```sql
toDecimal64OrZero(expr, S)
```

**Arguments**

- `expr` — A String representation of a number. [String](../data-types/string.md).
- `S` — Scale parameter between 0 and 18, specifying how many digits the fractional part of a number can have. [UInt8](../data-types/int-uint.md).

Supported arguments:
- String representations of type (U)Int8/16/32/64/128/256.
- String representations of type Float32/64.

Unsupported arguments:
- String representations of Float32/64 values `NaN` and `Inf`.
- String representations of binary and hexadecimal values, e.g. `SELECT toDecimal64OrZero('0xc0fe', 1);`.

:::note
An overflow can occur if the value of `expr` exceeds the bounds of `Decimal64`: `( -1 * 10^(18 - S), 1 * 10^(18 - S) )`.
Excessive digits in a fraction are discarded (not rounded).
Excessive digits in the integer part will lead to an error.
:::

**Returned value**

- Value of type `Decimal(18, S)` if successful, otherwise `0` with `S` decimal places. [Decimal64(S)](../data-types/decimal.md).

**Example**

Query:

``` sql
SELECT
    toDecimal64OrZero(toString(0.0001), 18) AS a,
    toTypeName(a),
    toDecimal64OrZero(toString('Inf'), 18) as b,
    toTypeName(b)
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
a:             0.0001
toTypeName(a): Decimal(18, 18)
b:             0
toTypeName(b): Decimal(18, 18)
```

**See also**

- [`toDecimal64`](#todecimal64).
- [`toDecimal64OrNull`](#todecimal64ornull).
- [`toDecimal64OrDefault`](#todecimal64ordefault).
## toDecimal64OrNull {#todecimal64ornull}

Like [`toDecimal64`](#todecimal64), this function converts an input value to a value of type [Nullable(Decimal(18, S))](../data-types/decimal.md) but returns `0` in case of an error.

**Syntax**

```sql
toDecimal64OrNull(expr, S)
```

**Arguments**

- `expr` — A String representation of a number. [String](../data-types/string.md).
- `S` — Scale parameter between 0 and 18, specifying how many digits the fractional part of a number can have. [UInt8](../data-types/int-uint.md).

Supported arguments:
- String representations of type (U)Int8/16/32/64/128/256.
- String representations of type Float32/64.

Unsupported arguments:
- String representations of Float32/64 values `NaN` and `Inf`.
- String representations of binary and hexadecimal values, e.g. `SELECT toDecimal64OrNull('0xc0fe', 1);`.

:::note
An overflow can occur if the value of `expr` exceeds the bounds of `Decimal64`: `( -1 * 10^(18 - S), 1 * 10^(18 - S) )`.
Excessive digits in a fraction are discarded (not rounded).
Excessive digits in the integer part will lead to an error.
:::

**Returned value**

- Value of type `Nullable(Decimal(18, S))` if successful, otherwise value `NULL` of the same type. [Decimal64(S)](../data-types/decimal.md).

**Examples**

Query:

``` sql
SELECT
    toDecimal64OrNull(toString(0.0001), 18) AS a,
    toTypeName(a),
    toDecimal64OrNull(toString('Inf'), 18) as b,
    toTypeName(b)
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
a:             0.0001
toTypeName(a): Nullable(Decimal(18, 18))
b:             ᴺᵁᴸᴸ
toTypeName(b): Nullable(Decimal(18, 18))
```

**See also**

- [`toDecimal64`](#todecimal64).
- [`toDecimal64OrZero`](#todecimal64orzero).
- [`toDecimal64OrDefault`](#todecimal64ordefault).
## toDecimal64OrDefault {#todecimal64ordefault}

Like [`toDecimal64`](#todecimal64), this function converts an input value to a value of type [Decimal(18, S)](../data-types/decimal.md) but returns the default value in case of an error.

**Syntax**

```sql
toDecimal64OrDefault(expr, S[, default])
```

**Arguments**

- `expr` — A String representation of a number. [String](../data-types/string.md).
- `S` — Scale parameter between 0 and 18, specifying how many digits the fractional part of a number can have. [UInt8](../data-types/int-uint.md).
- `default` (optional) — The default value to return if parsing to type `Decimal64(S)` is unsuccessful. [Decimal64(S)](../data-types/decimal.md).

Supported arguments:
- String representations of type (U)Int8/16/32/64/128/256.
- String representations of type Float32/64.

Unsupported arguments:
- String representations of Float32/64 values `NaN` and `Inf`.
- String representations of binary and hexadecimal values, e.g. `SELECT toDecimal64OrDefault('0xc0fe', 1);`.

:::note
An overflow can occur if the value of `expr` exceeds the bounds of `Decimal64`: `( -1 * 10^(18 - S), 1 * 10^(18 - S) )`.
Excessive digits in a fraction are discarded (not rounded).
Excessive digits in the integer part will lead to an error.
:::

:::warning
Conversions drop extra digits and could operate in an unexpected way when working with Float32/Float64 inputs as the operations are performed using floating point instructions.
For example: `toDecimal64OrDefault(1.15, 2)` is equal to `1.14` because 1.15 * 100 in floating point is 114.99.
You can use a String input so the operations use the underlying integer type: `toDecimal64OrDefault('1.15', 2) = 1.15`
:::

**Returned value**

- Value of type `Decimal(18, S)` if successful, otherwise returns the default value if passed or `0` if not. [Decimal64(S)](../data-types/decimal.md).

**Examples**

Query:

``` sql
SELECT
    toDecimal64OrDefault(toString(0.0001), 18) AS a,
    toTypeName(a),
    toDecimal64OrDefault('Inf', 0, CAST('-1', 'Decimal64(0)')) AS b,
    toTypeName(b)
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
a:             0.0001
toTypeName(a): Decimal(18, 18)
b:             -1
toTypeName(b): Decimal(18, 0)
```

**See also**

- [`toDecimal64`](#todecimal64).
- [`toDecimal64OrZero`](#todecimal64orzero).
- [`toDecimal64OrNull`](#todecimal64ornull).
## toDecimal128 {#todecimal128}

Converts an input value to a value of type [`Decimal(38, S)`](../data-types/decimal.md) with scale of `S`. Throws an exception in case of an error.

**Syntax**

```sql
toDecimal128(expr, S)
```

**Arguments**

- `expr` — Expression returning a number or a string representation of a number. [Expression](/sql-reference/syntax#expressions).
- `S` — Scale parameter between 0 and 38, specifying how many digits the fractional part of a number can have. [UInt8](../data-types/int-uint.md).

Supported arguments:
- Values or string representations of type (U)Int8/16/32/64/128/256.
- Values or string representations of type Float32/64.

Unsupported arguments:
- Values or string representations of Float32/64 values `NaN` and `Inf` (case-insensitive).
- String representations of binary and hexadecimal values, e.g. `SELECT toDecimal128('0xc0fe', 1);`.

:::note
An overflow can occur if the value of `expr` exceeds the bounds of `Decimal128`: `( -1 * 10^(38 - S), 1 * 10^(38 - S) )`.
Excessive digits in a fraction are discarded (not rounded).
Excessive digits in the integer part will lead to an exception.
:::

:::warning
Conversions drop extra digits and could operate in an unexpected way when working with Float32/Float64 inputs as the operations are performed using floating point instructions.
For example: `toDecimal128(1.15, 2)` is equal to `1.14` because 1.15 * 100 in floating point is 114.99.
You can use a String input so the operations use the underlying integer type: `toDecimal128('1.15', 2) = 1.15`
:::

**Returned value**

- Value of type `Decimal(38, S)`. [Decimal128(S)](../data-types/int-uint.md).

**Example**

Query:

```sql
SELECT
    toDecimal128(99, 1) AS a, toTypeName(a) AS type_a,
    toDecimal128(99.67, 2) AS b, toTypeName(b) AS type_b,
    toDecimal128('99.67', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical;
```

Result:

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

**See also**

- [`toDecimal128OrZero`](#todecimal128orzero).
- [`toDecimal128OrNull`](#todecimal128ornull).
- [`toDecimal128OrDefault`](#todecimal128ordefault).
## toDecimal128OrZero {#todecimal128orzero}

Like [`toDecimal128`](#todecimal128), this function converts an input value to a value of type [Decimal(38, S)](../data-types/decimal.md) but returns `0` in case of an error.

**Syntax**

```sql
toDecimal128OrZero(expr, S)
```

**Arguments**

- `expr` — A String representation of a number. [String](../data-types/string.md).
- `S` — Scale parameter between 0 and 38, specifying how many digits the fractional part of a number can have. [UInt8](../data-types/int-uint.md).

Supported arguments:
- String representations of type (U)Int8/16/32/64/128/256.
- String representations of type Float32/64.

Unsupported arguments:
- String representations of Float32/64 values `NaN` and `Inf`.
- String representations of binary and hexadecimal values, e.g. `SELECT toDecimal128OrZero('0xc0fe', 1);`.

:::note
An overflow can occur if the value of `expr` exceeds the bounds of `Decimal128`: `( -1 * 10^(38 - S), 1 * 10^(38 - S) )`.
Excessive digits in a fraction are discarded (not rounded).
Excessive digits in the integer part will lead to an error.
:::

**Returned value**

- Value of type `Decimal(38, S)` if successful, otherwise `0` with `S` decimal places. [Decimal128(S)](../data-types/decimal.md).

**Example**

Query:

``` sql
SELECT
    toDecimal128OrZero(toString(0.0001), 38) AS a,
    toTypeName(a),
    toDecimal128OrZero(toString('Inf'), 38) as b,
    toTypeName(b)
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
a:             0.0001
toTypeName(a): Decimal(38, 38)
b:             0
toTypeName(b): Decimal(38, 38)
```

**See also**

- [`toDecimal128`](#todecimal128).
- [`toDecimal128OrNull`](#todecimal128ornull).
- [`toDecimal128OrDefault`](#todecimal128ordefault).
## toDecimal128OrNull {#todecimal128ornull}

Like [`toDecimal128`](#todecimal128), this function converts an input value to a value of type [Nullable(Decimal(38, S))](../data-types/decimal.md) but returns `0` in case of an error.

**Syntax**

```sql
toDecimal128OrNull(expr, S)
```

**Arguments**

- `expr` — A String representation of a number. [String](../data-types/string.md).
- `S` — Scale parameter between 0 and 38, specifying how many digits the fractional part of a number can have. [UInt8](../data-types/int-uint.md).

Supported arguments:
- String representations of type (U)Int8/16/32/64/128/256.
- String representations of type Float32/64.

Unsupported arguments:
- String representations of Float32/64 values `NaN` and `Inf`.
- String representations of binary and hexadecimal values, e.g. `SELECT toDecimal128OrNull('0xc0fe', 1);`.

:::note
An overflow can occur if the value of `expr` exceeds the bounds of `Decimal128`: `( -1 * 10^(38 - S), 1 * 10^(38 - S) )`.
Excessive digits in a fraction are discarded (not rounded).
Excessive digits in the integer part will lead to an error.
:::

**Returned value**

- Value of type `Nullable(Decimal(38, S))` if successful, otherwise value `NULL` of the same type. [Decimal128(S)](../data-types/decimal.md).

**Examples**

Query:

``` sql
SELECT
    toDecimal128OrNull(toString(1/42), 38) AS a,
    toTypeName(a),
    toDecimal128OrNull(toString('Inf'), 38) as b,
    toTypeName(b)
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
a:             0.023809523809523808
toTypeName(a): Nullable(Decimal(38, 38))
b:             ᴺᵁᴸᴸ
toTypeName(b): Nullable(Decimal(38, 38))
```

**See also**

- [`toDecimal128`](#todecimal128).
- [`toDecimal128OrZero`](#todecimal128orzero).
- [`toDecimal128OrDefault`](#todecimal128ordefault).
## toDecimal128OrDefault {#todecimal128ordefault}

Like [`toDecimal128`](#todecimal128), this function converts an input value to a value of type [Decimal(38, S)](../data-types/decimal.md) but returns the default value in case of an error.

**Syntax**

```sql
toDecimal128OrDefault(expr, S[, default])
```

**Arguments**

- `expr` — A String representation of a number. [String](../data-types/string.md).
- `S` — Scale parameter between 0 and 38, specifying how many digits the fractional part of a number can have. [UInt8](../data-types/int-uint.md).
- `default` (optional) — The default value to return if parsing to type `Decimal128(S)` is unsuccessful. [Decimal128(S)](../data-types/decimal.md).

Supported arguments:
- String representations of type (U)Int8/16/32/64/128/256.
- String representations of type Float32/64.

Unsupported arguments:
- String representations of Float32/64 values `NaN` and `Inf`.
- String representations of binary and hexadecimal values, e.g. `SELECT toDecimal128OrDefault('0xc0fe', 1);`.

:::note
An overflow can occur if the value of `expr` exceeds the bounds of `Decimal128`: `( -1 * 10^(38 - S), 1 * 10^(38 - S) )`.
Excessive digits in a fraction are discarded (not rounded).
Excessive digits in the integer part will lead to an error.
:::

:::warning
Conversions drop extra digits and could operate in an unexpected way when working with Float32/Float64 inputs as the operations are performed using floating point instructions.
For example: `toDecimal128OrDefault(1.15, 2)` is equal to `1.14` because 1.15 * 100 in floating point is 114.99.
You can use a String input so the operations use the underlying integer type: `toDecimal128OrDefault('1.15', 2) = 1.15`
:::

**Returned value**

- Value of type `Decimal(38, S)` if successful, otherwise returns the default value if passed or `0` if not. [Decimal128(S)](../data-types/decimal.md).

**Examples**

Query:

``` sql
SELECT
    toDecimal128OrDefault(toString(1/42), 76) AS a,
    toTypeName(a),
    toDecimal128OrDefault('Inf', 0, CAST('-1', 'Decimal128(0)')) AS b,
    toTypeName(b)
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
a:             0.023809523809523808
toTypeName(a): Decimal(38, 18)
b:             -1
toTypeName(b): Decimal(38, 0)
```

**See also**

- [`toDecimal128`](#todecimal128).
- [`toDecimal128OrZero`](#todecimal128orzero).
- [`toDecimal128OrNull`](#todecimal128ornull).
## toDecimal256 {#todecimal256}

Converts an input value to a value of type [`Decimal(76, S)`](../data-types/decimal.md) with scale of `S`. Throws an exception in case of an error.

**Syntax**

```sql
toDecimal256(expr, S)
```

**Arguments**

- `expr` — Expression returning a number or a string representation of a number. [Expression](/sql-reference/syntax#expressions).
- `S` — Scale parameter between 0 and 76, specifying how many digits the fractional part of a number can have. [UInt8](../data-types/int-uint.md).

Supported arguments:
- Values or string representations of type (U)Int8/16/32/64/128/256.
- Values or string representations of type Float32/64.

Unsupported arguments:
- Values or string representations of Float32/64 values `NaN` and `Inf` (case-insensitive).
- String representations of binary and hexadecimal values, e.g. `SELECT toDecimal256('0xc0fe', 1);`.

:::note
An overflow can occur if the value of `expr` exceeds the bounds of `Decimal256`: `( -1 * 10^(76 - S), 1 * 10^(76 - S) )`.
Excessive digits in a fraction are discarded (not rounded).
Excessive digits in the integer part will lead to an exception.
:::

:::warning
Conversions drop extra digits and could operate in an unexpected way when working with Float32/Float64 inputs as the operations are performed using floating point instructions.
For example: `toDecimal256(1.15, 2)` is equal to `1.14` because 1.15 * 100 in floating point is 114.99.
You can use a String input so the operations use the underlying integer type: `toDecimal256('1.15', 2) = 1.15`
:::

**Returned value**

- Value of type `Decimal(76, S)`. [Decimal256(S)](../data-types/int-uint.md).

**Example**

Query:

```sql
SELECT
    toDecimal256(99, 1) AS a, toTypeName(a) AS type_a,
    toDecimal256(99.67, 2) AS b, toTypeName(b) AS type_b,
    toDecimal256('99.67', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical;
```

Result:

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

**See also**

- [`toDecimal256OrZero`](#todecimal256orzero).
- [`toDecimal256OrNull`](#todecimal256ornull).
- [`toDecimal256OrDefault`](#todecimal256ordefault).
## toDecimal256OrZero {#todecimal256orzero}

Like [`toDecimal256`](#todecimal256), this function converts an input value to a value of type [Decimal(76, S)](../data-types/decimal.md) but returns `0` in case of an error.

**Syntax**

```sql
toDecimal256OrZero(expr, S)
```

**Arguments**

- `expr` — A String representation of a number. [String](../data-types/string.md).
- `S` — Scale parameter between 0 and 76, specifying how many digits the fractional part of a number can have. [UInt8](../data-types/int-uint.md).

Supported arguments:
- String representations of type (U)Int8/16/32/64/128/256.
- String representations of type Float32/64.

Unsupported arguments:
- String representations of Float32/64 values `NaN` and `Inf`.
- String representations of binary and hexadecimal values, e.g. `SELECT toDecimal256OrZero('0xc0fe', 1);`.

:::note
An overflow can occur if the value of `expr` exceeds the bounds of `Decimal256`: `( -1 * 10^(76 - S), 1 * 10^(76 - S) )`.
Excessive digits in a fraction are discarded (not rounded).
Excessive digits in the integer part will lead to an error.
:::

**Returned value**

- Value of type `Decimal(76, S)` if successful, otherwise `0` with `S` decimal places. [Decimal256(S)](../data-types/decimal.md).

**Example**

Query:

``` sql
SELECT
    toDecimal256OrZero(toString(0.0001), 76) AS a,
    toTypeName(a),
    toDecimal256OrZero(toString('Inf'), 76) as b,
    toTypeName(b)
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
a:             0.0001
toTypeName(a): Decimal(76, 76)
b:             0
toTypeName(b): Decimal(76, 76)
```

**See also**

- [`toDecimal256`](#todecimal256).
- [`toDecimal256OrNull`](#todecimal256ornull).
- [`toDecimal256OrDefault`](#todecimal256ordefault).
## toDecimal256OrNull {#todecimal256ornull}

Like [`toDecimal256`](#todecimal256), this function converts an input value to a value of type [Nullable(Decimal(76, S))](../data-types/decimal.md) but returns `0` in case of an error.

**Syntax**

```sql
toDecimal256OrNull(expr, S)
```

**Arguments**

- `expr` — A String representation of a number. [String](../data-types/string.md).
- `S` — Scale parameter between 0 and 76, specifying how many digits the fractional part of a number can have. [UInt8](../data-types/int-uint.md).

Supported arguments:
- String representations of type (U)Int8/16/32/64/128/256.
- String representations of type Float32/64.

Unsupported arguments:
- String representations of Float32/64 values `NaN` and `Inf`.
- String representations of binary and hexadecimal values, e.g. `SELECT toDecimal256OrNull('0xc0fe', 1);`.

:::note
An overflow can occur if the value of `expr` exceeds the bounds of `Decimal256`: `( -1 * 10^(76 - S), 1 * 10^(76 - S) )`.
Excessive digits in a fraction are discarded (not rounded).
Excessive digits in the integer part will lead to an error.
:::

**Returned value**

- Value of type `Nullable(Decimal(76, S))` if successful, otherwise value `NULL` of the same type. [Decimal256(S)](../data-types/decimal.md).

**Examples**

Query:

``` sql
SELECT
    toDecimal256OrNull(toString(1/42), 76) AS a,
    toTypeName(a),
    toDecimal256OrNull(toString('Inf'), 76) as b,
    toTypeName(b)
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
a:             0.023809523809523808
toTypeName(a): Nullable(Decimal(76, 76))
b:             ᴺᵁᴸᴸ
toTypeName(b): Nullable(Decimal(76, 76))
```

**See also**

- [`toDecimal256`](#todecimal256).
- [`toDecimal256OrZero`](#todecimal256orzero).
- [`toDecimal256OrDefault`](#todecimal256ordefault).
## toDecimal256OrDefault {#todecimal256ordefault}

Like [`toDecimal256`](#todecimal256), this function converts an input value to a value of type [Decimal(76, S)](../data-types/decimal.md) but returns the default value in case of an error.

**Syntax**

```sql
toDecimal256OrDefault(expr, S[, default])
```

**Arguments**

- `expr` — A String representation of a number. [String](../data-types/string.md).
- `S` — Scale parameter between 0 and 76, specifying how many digits the fractional part of a number can have. [UInt8](../data-types/int-uint.md).
- `default` (optional) — The default value to return if parsing to type `Decimal256(S)` is unsuccessful. [Decimal256(S)](../data-types/decimal.md).

Supported arguments:
- String representations of type (U)Int8/16/32/64/128/256.
- String representations of type Float32/64.

Unsupported arguments:
- String representations of Float32/64 values `NaN` and `Inf`.
- String representations of binary and hexadecimal values, e.g. `SELECT toDecimal256OrDefault('0xc0fe', 1);`.

:::note
An overflow can occur if the value of `expr` exceeds the bounds of `Decimal256`: `( -1 * 10^(76 - S), 1 * 10^(76 - S) )`.
Excessive digits in a fraction are discarded (not rounded).
Excessive digits in the integer part will lead to an error.
:::

:::warning
Conversions drop extra digits and could operate in an unexpected way when working with Float32/Float64 inputs as the operations are performed using floating point instructions.
For example: `toDecimal256OrDefault(1.15, 2)` is equal to `1.14` because 1.15 * 100 in floating point is 114.99.
You can use a String input so the operations use the underlying integer type: `toDecimal256OrDefault('1.15', 2) = 1.15`
:::

**Returned value**

- Value of type `Decimal(76, S)` if successful, otherwise returns the default value if passed or `0` if not. [Decimal256(S)](../data-types/decimal.md).

**Examples**

Query:

``` sql
SELECT
    toDecimal256OrDefault(toString(1/42), 76) AS a,
    toTypeName(a),
    toDecimal256OrDefault('Inf', 0, CAST('-1', 'Decimal256(0)')) AS b,
    toTypeName(b)
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
a:             0.023809523809523808
toTypeName(a): Decimal(76, 76)
b:             -1
toTypeName(b): Decimal(76, 0)
```

**See also**

- [`toDecimal256`](#todecimal256).
- [`toDecimal256OrZero`](#todecimal256orzero).
- [`toDecimal256OrNull`](#todecimal256ornull).
## toString {#tostring}

Functions for converting between numbers, strings (but not fixed strings), dates, and dates with times.
All these functions accept one argument.

When converting to or from a string, the value is formatted or parsed using the same rules as for the TabSeparated format (and almost all other text formats). If the string can't be parsed, an exception is thrown and the request is canceled.

When converting dates to numbers or vice versa, the date corresponds to the number of days since the beginning of the Unix epoch.
When converting dates with times to numbers or vice versa, the date with time corresponds to the number of seconds since the beginning of the Unix epoch.

The date and date-with-time formats for the toDate/toDateTime functions are defined as follows:

```response
YYYY-MM-DD
YYYY-MM-DD hh:mm:ss
```

As an exception, if converting from UInt32, Int32, UInt64, or Int64 numeric types to Date, and if the number is greater than or equal to 65536, the number is interpreted as a Unix timestamp (and not as the number of days) and is rounded to the date. This allows support for the common occurrence of writing `toDate(unix_timestamp)`, which otherwise would be an error and would require writing the more cumbersome `toDate(toDateTime(unix_timestamp))`.

Conversion between a date and a date with time is performed the natural way: by adding a null time or dropping the time.

Conversion between numeric types uses the same rules as assignments between different numeric types in C++.

Additionally, the toString function of the DateTime argument can take a second String argument containing the name of the time zone. Example: `Asia/Yekaterinburg` In this case, the time is formatted according to the specified time zone.

**Example**

Query:

``` sql
SELECT
    now() AS ts,
    time_zone,
    toString(ts, time_zone) AS str_tz_datetime
FROM system.time_zones
WHERE time_zone LIKE 'Europe%'
LIMIT 10
```

Result:

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

Also see the `toUnixTimestamp` function.
```
```yaml
title: 'タイプ変換関数'
sidebar_label: 'タイプ変換関数'
keywords: ['ClickHouse', 'タイプ変換', 'SQL']
description: 'ClickHouseにおけるタイプ変換関数に関する詳細情報。'
```

## toFixedString {#tofixedstring}

引数の [String](../data-types/string.md) 型を [FixedString(N)](../data-types/fixedstring.md) 型（固定長 N の文字列）に変換します。文字列のバイト数が N より少ない場合は、右側にヌルバイトが追加されます。文字列のバイト数が N より多い場合は、例外がスローされます。

**構文**

```sql
toFixedString(s, N)
```

**引数**

- `s` — 固定文字列に変換する文字列。 [String](../data-types/string.md)。
- `N` — 長さ N。 [UInt8](../data-types/int-uint.md)。

**戻り値**

- `s` の N 長さの固定文字列。 [FixedString](../data-types/fixedstring.md)。

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

String または FixedString 引数を受け取ります。最初に見つかったゼロバイトで内容が切り捨てられた文字列を返します。

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

数値を文字列に変換し、小数点以下の桁数はユーザーが指定します。

**構文**

```sql
toDecimalString(number, scale)
```

**引数**

- `number` — 文字列として表現される値。 [Int, UInt](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Decimal](../data-types/decimal.md)。
- `scale` — 小数点以下の桁数。 [UInt8](../data-types/int-uint.md)。
    * [Decimal](../data-types/decimal.md) および [Int, UInt](../data-types/int-uint.md) 型の最大スケールは 77 です（Decimal の有効数字の最大数です）。
    * [Float](../data-types/float.md) の最大スケールは 60 です。

**戻り値**

- 指定された小数点以下の桁数を持つ [String](../data-types/string.md) として表現された入力値。
    リクエストされたスケールが元の数のスケールより小さい場合、数は一般的な算術に従って切り捨てられます。

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

入力値を UInt8 型の値として扱うことでバイトの再解釈を行います。 [`CAST`](#cast) とは異なり、この関数は元の値を保持しようとはしません - 対象の型が入力型を表現できない場合、出力は意味を成しません。

**構文**

```sql
reinterpretAsUInt8(x)
```

**引数**

- `x`: UInt8 として再解釈する値。 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

- UInt8 として再解釈された値 `x`。 [UInt8](/sql-reference/data-types/int-uint)。

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

入力値を UInt16 型の値として扱うことでバイトの再解釈を行います。 [`CAST`](#cast) とは異なり、この関数は元の値を保持しようとはしません - 対象の型が入力型を表現できない場合、出力は意味を成しません。

**構文**

```sql
reinterpretAsUInt16(x)
```

**引数**

- `x`: UInt16 として再解釈する値。 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

- UInt16 として再解釈された値 `x`。 [UInt16](/sql-reference/data-types/int-uint)。

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

入力値を UInt32 型の値として扱うことでバイトの再解釈を行います。 [`CAST`](#cast) とは異なり、この関数は元の値を保持しようとはしません - 対象の型が入力型を表現できない場合、出力は意味を成しません。

**構文**

```sql
reinterpretAsUInt32(x)
```

**引数**

- `x`: UInt32 として再解釈する値。 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

- UInt32 として再解釈された値 `x`。 [UInt32](/sql-reference/data-types/int-uint)。

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

入力値を UInt64 型の値として扱うことでバイトの再解釈を行います。 [`CAST`](#cast) とは異なり、この関数は元の値を保持しようとはしません - 対象の型が入力型を表現できない場合、出力は意味を成しません。

**構文**

```sql
reinterpretAsUInt64(x)
```

**引数**

- `x`: UInt64 として再解釈する値。 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

- UInt64 として再解釈された値 `x`。 [UInt64](/sql-reference/data-types/int-uint)。

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

入力値を UInt128 型の値として扱うことでバイトの再解釈を行います。 [`CAST`](#cast) とは異なり、この関数は元の値を保持しようとはしません - 対象の型が入力型を表現できない場合、出力は意味を成しません。

**構文**

```sql
reinterpretAsUInt128(x)
```

**引数**

- `x`: UInt128 として再解釈する値。 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

- UInt128 として再解釈された値 `x`。 [UInt128](/sql-reference/data-types/int-uint)。

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

入力値を UInt256 型の値として扱うことでバイトの再解釈を行います。 [`CAST`](#cast) とは異なり、この関数は元の値を保持しようとはしません - 対象の型が入力型を表現できない場合、出力は意味を成しません。

**構文**

```sql
reinterpretAsUInt256(x)
```

**引数**

- `x`: UInt256 として再解釈する値。 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

- UInt256 として再解釈された値 `x`。 [UInt256](/sql-reference/data-types/int-uint)。

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

入力値を Int8 型の値として扱うことでバイトの再解釈を行います。 [`CAST`](#cast) とは異なり、この関数は元の値を保持しようとはしません - 対象の型が入力型を表現できない場合、出力は意味を成しません。

**構文**

```sql
reinterpretAsInt8(x)
```

**引数**

- `x`: Int8 として再解釈する値。 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

- Int8 として再解釈された値 `x`。 [Int8](/sql-reference/data-types/int-uint#integer-ranges)。

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

入力値を Int16 型の値として扱うことでバイトの再解釈を行います。 [`CAST`](#cast) とは異なり、この関数は元の値を保持しようとはしません - 対象の型が入力型を表現できない場合、出力は意味を成しません。

**構文**

```sql
reinterpretAsInt16(x)
```

**引数**

- `x`: Int16 として再解釈する値。 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

- Int16 として再解釈された値 `x`。 [Int16](/sql-reference/data-types/int-uint#integer-ranges)。

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

入力値を Int32 型の値として扱うことでバイトの再解釈を行います。 [`CAST`](#cast) とは異なり、この関数は元の値を保持しようとはしません - 対象の型が入力型を表現できない場合、出力は意味を成しません。

**構文**

```sql
reinterpretAsInt32(x)
```

**引数**

- `x`: Int32 として再解釈する値。 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

- Int32 として再解釈された値 `x`。 [Int32](/sql-reference/data-types/int-uint#integer-ranges)。

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

入力値を Int64 型の値として扱うことでバイトの再解釈を行います。 [`CAST`](#cast) とは異なり、この関数は元の値を保持しようとはしません - 対象の型が入力型を表現できない場合、出力は意味を成しません。

**構文**

```sql
reinterpretAsInt64(x)
```

**引数**

- `x`: Int64 として再解釈する値。 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

- Int64 として再解釈された値 `x`。 [Int64](/sql-reference/data-types/int-uint#integer-ranges)。

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

入力値を Int128 型の値として扱うことでバイトの再解釈を行います。 [`CAST`](#cast) とは異なり、この関数は元の値を保持しようとはしません - 対象の型が入力型を表現できない場合、出力は意味を成しません。

**構文**

```sql
reinterpretAsInt128(x)
```

**引数**

- `x`: Int128 として再解釈する値。 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

- Int128 として再解釈された値 `x`。 [Int128](/sql-reference/data-types/int-uint#integer-ranges)。

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

入力値を Int256 型の値として扱うことでバイトの再解釈を行います。 [`CAST`](#cast) とは異なり、この関数は元の値を保持しようとはしません - 対象の型が入力型を表現できない場合、出力は意味を成しません。

**構文**

```sql
reinterpretAsInt256(x)
```

**引数**

- `x`: Int256 として再解釈する値。 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

- Int256 として再解釈された値 `x`。 [Int256](/sql-reference/data-types/int-uint#integer-ranges)。

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

入力値を Float32 型の値として扱うことでバイトの再解釈を行います。 [`CAST`](#cast) とは異なり、この関数は元の値を保持しようとはしません - 対象の型が入力型を表現できない場合、出力は意味を成しません。

**構文**

```sql
reinterpretAsFloat32(x)
```

**引数**

- `x`: Float32 として再解釈する値。 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

- Float32 として再解釈された値 `x`。 [Float32](../data-types/float.md)。

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

入力値を Float64 型の値として扱うことでバイトの再解釈を行います。 [`CAST`](#cast) とは異なり、この関数は元の値を保持しようとはしません - 対象の型が入力型を表現できない場合、出力は意味を成しません。

**構文**

```sql
reinterpretAsFloat64(x)
```

**引数**

- `x`: Float64 として再解釈する値。 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

- Float64 として再解釈された値 `x`。 [Float64](../data-types/float.md)。

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

文字列、固定文字列、または数値の値を受け取り、バイトをホスト順序（リトルエンディアン）で数値として解釈します。Unixエポックの開始からの日数として解釈された日付を返します。

**構文**

```sql
reinterpretAsDate(x)
```

**引数**

- `x`: Unixエポックの開始からの日数。 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

- 日付。 [Date](../data-types/date.md)。

**実装の詳細**

:::note
提供された文字列が十分に長くない場合、関数は必要な数のヌルバイトでパディングされた文字列として機能します。文字列が必要以上に長い場合、余分なバイトは無視されます。
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

これらの関数は文字列を受け取り、文字列の最初に配置されたバイトをホスト順序（リトルエンディアン）で数値として解釈します。Unixエポックの開始からの秒数として解釈された日時を返します。

**構文**

```sql
reinterpretAsDateTime(x)
```

**引数**

- `x`: Unixエポックの開始からの秒数。 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

- 日付と時刻。 [DateTime](../data-types/datetime.md)。

**実装の詳細**

:::note
提供された文字列が十分に長くない場合、関数は必要な数のヌルバイトでパディングされた文字列として機能します。文字列が必要以上に長い場合、余分なバイトは無視されます。
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

この関数は数値、日付、または日時を受け取り、ホスト順序（リトルエンディアン）で対応する値を表すバイトを含む文字列を返します。末尾のヌルバイトはドロップされます。例えば、UInt32 タイプの値 255 は 1 バイトの長さの文字列です。

**構文**

```sql
reinterpretAsString(x)
```

**引数**

- `x`: 文字列に再解釈する値。 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)。

**戻り値**

- `x` を表すバイトを含む文字列。 [String](../data-types/fixedstring.md)。

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

この関数は数値、日付、または日時を受け取り、ホスト順序（リトルエンディアン）で対応する値を表すバイトを含む FixedString を返します。末尾のヌルバイトはドロップされます。例えば、UInt32 タイプの値 255 は 1 バイトの長さの FixedString です。

**構文**

```sql
reinterpretAsFixedString(x)
```

**引数**

- `x`: 文字列に再解釈する値。 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)。

**戻り値**

- `x` を表すバイトを含む FixedString。 [FixedString](../data-types/fixedstring.md)。

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
ここにリストされた UUID 関数に加えて、専用の [UUID 関数のドキュメント](../functions/uuid-functions.md) があります。
:::

16 バイトの文字列を受け取り、8 バイトの半分をリトルエンディアンのバイト順で解釈することによって UUID を返します。文字列が十分に長くない場合、関数は必要な数のヌルバイトでパディングされた文字列として機能します。文字列が 16 バイトより長い場合、末尾の余分なバイトは無視されます。

**構文**

```sql
reinterpretAsUUID(fixed_string)
```

**引数**

- `fixed_string` — ビッグエンディアンバイト文字列。 [FixedString](/sql-reference/data-types/fixedstring)。

**戻り値**

- UUID 型の値。 [UUID](/sql-reference/data-types/uuid)。

**例**

文字列から UUID への変換。

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

文字列から UUID への往復変換。

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

ソースのメモリ内バイトシーケンスを `x` 値に使用し、宛先型として再解釈します。

**構文**

```sql
reinterpret(x, type)
```

**引数**

- `x` — 任意の型。
- `type` — 目的の型。 [String](../data-types/string.md)。

**戻り値**

- 目的の型の値。

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

入力値を指定されたデータ型に変換します。 [`reinterpret`](#reinterpret) 関数とは異なり、`CAST` は新しいデータ型を使用して同じ値を提示しようとします。変換ができない場合は、例外がスローされます。いくつかの構文のバリアントがサポートされています。

**構文**

```sql
CAST(x, T)
CAST(x AS t)
x::t
```

**引数**

- `x` — 変換する値。任意の型で構いません。
- `T` — 目的のデータ型の名前。 [String](../data-types/string.md)。
- `t` — 目的のデータ型。

**戻り値**

- 変換された値。

:::note
入力値が対象型の範囲に収まらない場合、結果がオーバーフローします。たとえば、`CAST(-1, 'UInt8')` は `255` を返します。
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

[FixedString (N)](../data-types/fixedstring.md) への型変換は、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md) 型の引数に対してのみ機能します。

[Nullable](../data-types/nullable.md) への型変換とその逆もサポートされています。

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

- [cast_keep_nullable](../../operations/settings/settings.md/#cast_keep_nullable) 設定
## accurateCast(x, T) {#accuratecastx-t}

`x` を `T` データ型に変換します。

[cast](#cast) との違いは、`accurateCast` は型 T の範囲に収まらない場合、数値型のオーバーフローを許可しません。たとえば、`accurateCast(-1, 'UInt8')` は例外をスローします。

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

入力値 `x` を指定されたデータ型 `T` に変換します。常に [Nullable](../data-types/nullable.md) 型を返し、キャスト値が対象型に表現できない場合は [NULL](/sql-reference/syntax#null) を返します。

**構文**

```sql
accurateCastOrNull(x, T)
```

**引数**

- `x` — 入力値。
- `T` — 戻り値のデータ型の名前。

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

入力値 `x` を指定されたデータ型 `T` に変換します。キャストした値がターゲット型に表現できない場合、指定した場合はデフォルト型の値または `default_value` を返します。

**文法**

```sql
accurateCastOrDefault(x, T)
```

**引数**

- `x` — 入力値。
- `T` — 返されるデータ型の名前。
- `default_value` — 返されるデータ型のデフォルト値。

**返される値**

- 指定されたデータ型 `T` に変換された値。

**例**

クエリ:

``` sql
SELECT toTypeName(accurateCastOrDefault(5, 'UInt8'));
```

結果:

```response
┌─toTypeName(accurateCastOrDefault(5, 'UInt8'))─┐
│ UInt8                                         │
└───────────────────────────────────────────────┘
```

クエリ:

``` sql
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
## toIntervalYear {#tointervalyear}

`n` 年の間隔をデータ型 [IntervalYear](../data-types/special-data-types/interval.md) で返します。

**文法**

``` sql
toIntervalYear(n)
```

**引数**

- `n` — 年数。整数またはそれに対応する文字列、及び浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n` 年の間隔。[IntervalYear](../data-types/special-data-types/interval.md)。

**例**

クエリ:

``` sql
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

`n` 四半期の間隔をデータ型 [IntervalQuarter](../data-types/special-data-types/interval.md) で返します。

**文法**

``` sql
toIntervalQuarter(n)
```

**引数**

- `n` — 四半期の数。整数またはそれに対応する文字列、及び浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n` 四半期の間隔。[IntervalQuarter](../data-types/special-data-types/interval.md)。

**例**

クエリ:

``` sql
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

`n` ヶ月の間隔をデータ型 [IntervalMonth](../data-types/special-data-types/interval.md) で返します。

**文法**

``` sql
toIntervalMonth(n)
```

**引数**

- `n` — ヶ月数。整数またはそれに対応する文字列、及び浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n` ヶ月の間隔。[IntervalMonth](../data-types/special-data-types/interval.md)。

**例**

クエリ:

``` sql
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

`n` 週間の間隔をデータ型 [IntervalWeek](../data-types/special-data-types/interval.md) で返します。

**文法**

``` sql
toIntervalWeek(n)
```

**引数**

- `n` — 週間数。整数またはそれに対応する文字列、及び浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n` 週間の間隔。[IntervalWeek](../data-types/special-data-types/interval.md)。

**例**

クエリ:

``` sql
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

`n` 日の間隔をデータ型 [IntervalDay](../data-types/special-data-types/interval.md) で返します。

**文法**

``` sql
toIntervalDay(n)
```

**引数**

- `n` — 日数。整数またはそれに対応する文字列、及び浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n` 日の間隔。[IntervalDay](../data-types/special-data-types/interval.md)。

**例**

クエリ:

``` sql
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

`n` 時間の間隔をデータ型 [IntervalHour](../data-types/special-data-types/interval.md) で返します。

**文法**

``` sql
toIntervalHour(n)
```

**引数**

- `n` — 時間数。整数またはそれに対応する文字列、及び浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n` 時間の間隔。[IntervalHour](../data-types/special-data-types/interval.md)。

**例**

クエリ:

``` sql
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

`n` 分の間隔をデータ型 [IntervalMinute](../data-types/special-data-types/interval.md) で返します。

**文法**

``` sql
toIntervalMinute(n)
```

**引数**

- `n` — 分数。整数またはそれに対応する文字列、及び浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n` 分の間隔。[IntervalMinute](../data-types/special-data-types/interval.md)。

**例**

クエリ:

``` sql
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

`n` 秒の間隔をデータ型 [IntervalSecond](../data-types/special-data-types/interval.md) で返します。

**文法**

``` sql
toIntervalSecond(n)
```

**引数**

- `n` — 秒数。整数またはそれに対応する文字列、及び浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n` 秒の間隔。[IntervalSecond](../data-types/special-data-types/interval.md)。

**例**

クエリ:

``` sql
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

`n` ミリ秒の間隔をデータ型 [IntervalMillisecond](../data-types/special-data-types/interval.md) で返します。

**文法**

``` sql
toIntervalMillisecond(n)
```

**引数**

- `n` — ミリ秒数。整数またはそれに対応する文字列、及び浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n` ミリ秒の間隔。[IntervalMilliseconds](../data-types/special-data-types/interval.md)。

**例**

クエリ:

``` sql
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

`n` マイクロ秒の間隔をデータ型 [IntervalMicrosecond](../data-types/special-data-types/interval.md) で返します。

**文法**

``` sql
toIntervalMicrosecond(n)
```

**引数**

- `n` — マイクロ秒数。整数またはそれに対応する文字列、及び浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n` マイクロ秒の間隔。[IntervalMicrosecond](../data-types/special-data-types/interval.md)。

**例**

クエリ:

``` sql
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

`n` ナノ秒の間隔をデータ型 [IntervalNanosecond](../data-types/special-data-types/interval.md) で返します。

**文法**

``` sql
toIntervalNanosecond(n)
```

**引数**

- `n` — ナノ秒数。整数またはそれに対応する文字列、及び浮動小数点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返される値**

- `n` ナノ秒の間隔。[IntervalNanosecond](../data-types/special-data-types/interval.md)。

**例**

クエリ:

``` sql
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

[文字列](../data-types/string.md) を [DateTime](../data-types/datetime.md) に変換します。この際、[MySQL のフォーマット文字列](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format) に従います。

この関数は、関数 [formatDateTime](/sql-reference/functions/date-time-functions#formatdatetime) の反対の操作です。

**文法**

``` sql
parseDateTime(str[, format[, timezone]])
```

**引数**

- `str` — パースする文字列
- `format` — フォーマット文字列。省略可能。指定しない場合は `%Y-%m-%d %H:%i:%s`。
- `timezone` — [タイムゾーン](operations/server-configuration-parameters/settings.md#timezone)。省略可能。

**返される値**

入力文字列から解析された [DateTime](../data-types/datetime.md) 値。

**サポートされているフォーマット指定子**

[formatDateTime](/sql-reference/functions/date-time-functions#formatdatetime) にリストされたすべてのフォーマット指定子をサポートしていますが、次は除きます:
- %Q: 四半期 (1-4)

**例**

``` sql
SELECT parseDateTime('2021-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')

┌─parseDateTime('2021-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')─┐
│                                       2021-01-04 23:00:00 │
└───────────────────────────────────────────────────────────┘
```

エイリアス: `TO_TIMESTAMP`.
## parseDateTimeOrZero {#parsedatetimeorzero}

[parseDateTime](#parsedatetime) と同様ですが、処理できない日付形式に遭遇した場合はゼロ日付を返します。
## parseDateTimeOrNull {#parsedatetimeornull}

[parseDateTime](#parsedatetime) と同様ですが、処理できない日付形式に遭遇した場合は `NULL` を返します。

エイリアス: `str_to_date`.
## parseDateTimeInJodaSyntax {#parsedatetimeinjodasyntax}

[parseDateTime](#parsedatetime) と似ていますが、フォーマット文字列は MySQL 構文ではなく [Joda](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html) の形式です。

この関数は、関数 [formatDateTimeInJodaSyntax](/sql-reference/functions/date-time-functions#formatdatetimeinjodasyntax) の反対の操作です。

**文法**

``` sql
parseDateTimeInJodaSyntax(str[, format[, timezone]])
```

**引数**

- `str` — パースする文字列
- `format` — フォーマット文字列。省略可能。指定しない場合は `yyyy-MM-dd HH:mm:ss`。
- `timezone` — [タイムゾーン](operations/server-configuration-parameters/settings.md#timezone)。省略可能。

**返される値**

入力文字列から取得された [DateTime](../data-types/datetime.md) 値を返します。

**サポートされているフォーマット指定子**

[formatDateTimeInJoda](/sql-reference/functions/date-time-functions#formatdatetime) にリストされているすべてのフォーマット指定子をサポートしていますが、次は除きます:
- S: 秒の分数
- z: タイムゾーン
- Z: タイムゾーンのオフセット/id

**例**

``` sql
SELECT parseDateTimeInJodaSyntax('2023-02-24 14:53:31', 'yyyy-MM-dd HH:mm:ss', 'Europe/Minsk')

┌─parseDateTimeInJodaSyntax('2023-02-24 14:53:31', 'yyyy-MM-dd HH:mm:ss', 'Europe/Minsk')─┐
│                                                                     2023-02-24 14:53:31 │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```
## parseDateTimeInJodaSyntaxOrZero {#parsedatetimeinjodasyntaxorzero}

[parseDateTimeInJodaSyntax](#parsedatetimeinjodasyntax) と同様ですが、処理できない日付形式に遭遇した場合はゼロ日付を返します。
## parseDateTimeInJodaSyntaxOrNull {#parsedatetimeinjodasyntaxornull}

[parseDateTimeInJodaSyntax](#parsedatetimeinjodasyntax) と同様ですが、処理できない日付形式に遭遇した場合は `NULL` を返します。
## parseDateTime64 {#parsedatetime64}

[文字列](../data-types/string.md) を [DateTime64](../data-types/datetime64.md) に変換します。この際、[MySQL のフォーマット文字列](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format) に従います。

**文法**

``` sql
parseDateTime64(str[, format[, timezone]])
```

**引数**

- `str` — パースする文字列。
- `format` — フォーマット文字列。省略可能。指定しない場合は `%Y-%m-%d %H:%i:%s.%f`。
- `timezone` — [タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。省略可能。

**返される値**

入力文字列から取得された [DateTime64](../data-types/datetime64.md) 値を返します。
返される値の精度は6です。
## parseDateTime64OrZero {#parsedatetime64orzero}

[parseDateTime64](#parsedatetime64) と同様ですが、処理できない日付形式に遭遇した場合はゼロ日付を返します。
## parseDateTime64OrNull {#parsedatetime64ornull}

[parseDateTime64](#parsedatetime64) と同様ですが、処理できない日付形式に遭遇した場合は `NULL` を返します。
## parseDateTime64InJodaSyntax {#parsedatetime64injodasyntax}

[文字列](../data-types/string.md) を [DateTime64](../data-types/datetime64.md) に変換します。この際、[Joda のフォーマット文字列](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html) に従います。

**文法**

``` sql
parseDateTime64InJodaSyntax(str[, format[, timezone]])
```

**引数**

- `str` — パースする文字列。
- `format` — フォーマット文字列。省略可能。指定しない場合は `yyyy-MM-dd HH:mm:ss`。
- `timezone` — [タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。省略可能。

**返される値**

入力文字列から取得された [DateTime64](../data-types/datetime64.md) 値を返します。
返される値の精度はフォーマット文字列内の `S` プレースホルダーの数に等しいですが、最大で6に制限されます。
## parseDateTime64InJodaSyntaxOrZero {#parsedatetime64injodasyntaxorzero}

[parseDateTime64InJodaSyntax](#parsedatetime64injodasyntax) と同様ですが、処理できない日付形式に遭遇した場合はゼロ日付を返します。
## parseDateTime64InJodaSyntaxOrNull {#parsedatetime64injodasyntaxornull}

[parseDateTime64InJodaSyntax](#parsedatetime64injodasyntax) と同様ですが、処理できない日付形式に遭遇した場合は `NULL` を返します。
## parseDateTimeBestEffort {#parsedatetimebesteffort}
## parseDateTime32BestEffort {#parsedatetime32besteffort}

[文字列](../data-types/string.md) で表現された日付と時刻を [DateTime](/sql-reference/data-types/datetime) データ型に変換します。

この関数は、[ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)、[RFC 1123 - 5.2.14 RFC-822 日付および時刻の仕様](https://tools.ietf.org/html/rfc1123#page-55)、ClickHouse のおよびその他のいくつかの日付と時刻の形式を解析します。

**文法**

``` sql
parseDateTimeBestEffort(time_string [, time_zone])
```

**引数**

- `time_string` — 変換する日付と時刻を含む文字列。[文字列](../data-types/string.md)。
- `time_zone` — タイムゾーン。この関数は `time_string` を指定されたタイムゾーンに従って解析します。[文字列](../data-types/string.md)。

**サポートされている非標準形式**

- 9..10 桁の [unix timestamp](https://en.wikipedia.org/wiki/Unix_time) を含む文字列。
- 日付と時刻のコンポーネントを持つ文字列: `YYYYMMDDhhmmss`、`DD/MM/YYYY hh:mm:ss`、`DD-MM-YY hh:mm`、`YYYY-MM-DD hh:mm:ss` など。
- 時間コンポーネントを持たない日付を含む文字列: `YYYY`、`YYYYMM`、`YYYY*MM`、`DD/MM/YYYY`、`DD-MM-YY` など。
- 日と時きを含む文字列: `DD`、`DD hh`、`DD hh:mm`。この場合、`MM` は `01` に置き換えられます。
- 日付と時刻の他にタイムゾーンのオフセット情報を含む文字列: `YYYY-MM-DD hh:mm:ss ±h:mm` など。例えば、`2020-12-12 17:36:00 -5:00` です。
- [syslog タイムスタンプ](https://datatracker.ietf.org/doc/html/rfc3164#section-4.1.2): `Mmm dd hh:mm:ss`。例えば、`Jun  9 14:20:32` です。

セパレータを持つすべての形式の場合、関数は月の名前をその完全な名前または月名の最初の3文字で表したもので解析します。例: `24/DEC/18`、`24-Dec-18`、`01-September-2018`。
年が指定されていない場合は、現在の年と同じとみなされます。結果の DateTime が将来（現在の瞬間の 1 秒後でも）にあたる場合には、現在の年が前の年に置き換えられます。

**返される値**

- `time_string` が [DateTime](../data-types/datetime.md) データ型に変換されます。

**例**

クエリ:

``` sql
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

``` sql
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

``` sql
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

``` sql
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

``` sql
SELECT toYear(now()) as year, parseDateTimeBestEffort('10 20:19');
```

結果:

```response
┌─year─┬─parseDateTimeBestEffort('10 20:19')─┐
│ 2023 │                 2023-01-10 20:19:00 │
└──────┴─────────────────────────────────────┘
```

クエリ:

``` sql
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

**参照**

- [RFC 1123](https://datatracker.ietf.org/doc/html/rfc1123)
- [toDate](#todate)
- [toDateTime](#todatetime)
- [ISO 8601 の @xkcd による発表](https://xkcd.com/1179/)
- [RFC 3164](https://datatracker.ietf.org/doc/html/rfc3164#section-4.1.2)
## parseDateTimeBestEffortUS {#parsedatetimebesteffortus}

この関数は、ISO 日付形式、例: `YYYY-MM-DD hh:mm:ss` の場合、及び月と日コンポーネントが明確に区別できるその他の日付形式、例: `YYYYMMDDhhmmss`、`YYYY-MM`、`DD hh`、または `YYYY-MM-DD hh:mm:ss ±h:mm` の場合は、[parseDateTimeBestEffort](#parsedatetimebesteffort) と同様に動作します。月と日コンポーネントが明確に区別できない場合、例: `MM/DD/YYYY`、`MM-DD-YYYY`、または `MM-DD-YY` の場合は、 `DD/MM/YYYY`、`DD-MM-YYYY`、または `DD-MM-YY` の代わりに米国日付形式を優先します。ただし例外として、月の値が12より大きく31以下の場合は、この関数は [parseDateTimeBestEffort](#parsedatetimebesteffort) の動作に従います。例: `15/08/2020` は `2020-08-15` として解析されます。
## parseDateTimeBestEffortOrNull {#parsedatetimebesteffortornull}
## parseDateTime32BestEffortOrNull {#parsedatetime32besteffortornull}

[parseDateTimeBestEffort](#parsedatetimebesteffort) と同様ですが、処理できない日付形式に遭遇した場合は `NULL` を返します。
## parseDateTimeBestEffortOrZero {#parsedatetimebesteffortorzero}
## parseDateTime32BestEffortOrZero {#parsedatetime32besteffortorzero}

[parseDateTimeBestEffort](#parsedatetimebesteffort) と同様ですが、処理できない日付形式に遭遇した場合はゼロ日付またはゼロ日付時刻を返します。
## parseDateTimeBestEffortUSOrNull {#parsedatetimebesteffortusornull}

[parseDateTimeBestEffortUS](#parsedatetimebesteffortus) 関数と同様ですが、処理できない日付形式に遭遇した場合は `NULL` を返します。
## parseDateTimeBestEffortUSOrZero {#parsedatetimebesteffortusorzero}

[parseDateTimeBestEffortUS](#parsedatetimebesteffortus) 関数と同様ですが、処理できない日付形式に遭遇した場合はゼロ日付 (`1970-01-01`) またはゼロ日付と時刻 (`1970-01-01 00:00:00`) を返します。
## parseDateTime64BestEffort {#parsedatetime64besteffort}

[parseDateTimeBestEffort](#parsedatetimebesteffort) 関数と同様ですが、ミリ秒とマイクロ秒を解析し、[DateTime](/sql-reference/data-types/datetime) データ型を返します。

**文法**

``` sql
parseDateTime64BestEffort(time_string [, precision [, time_zone]])
```

**引数**

- `time_string` — 変換する日付または日付と時刻を含む文字列。[文字列](../data-types/string.md)。
- `precision` — 精度。ミリ秒には `3`、マイクロ秒には `6` を指定します。デフォルトは `3`。省略可能。[UInt8](../data-types/int-uint.md)。
- `time_zone` — [タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。関数は `time_string` を指定されたタイムゾーンに従って解析します。省略可能。[文字列](../data-types/string.md)。

**返される値**

- `time_string` が [DateTime](../data-types/datetime.md) データ型に変換されます。

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

[parseDateTime64BestEffort](#parsedatetime64besteffort) と同様ですが、この関数は揺らぎがある場合は米国の日付形式 (`MM/DD/YYYY` など) を優先します。
## parseDateTime64BestEffortOrNull {#parsedatetime64besteffortornull}

[parseDateTime64BestEffort](#parsedatetime64besteffort) と同様ですが、処理できない日付形式に遭遇した場合は `NULL` を返します。
## parseDateTime64BestEffortOrZero {#parsedatetime64besteffortorzero}

[parseDateTime64BestEffort](#parsedatetime64besteffort) と同様ですが、処理できない日付形式に遭遇した場合はゼロ日付またはゼロ日付時刻を返します。
## parseDateTime64BestEffortUSOrNull {#parsedatetime64besteffortusornull}

[parseDateTime64BestEffort](#parsedatetime64besteffort) と同様ですが、この関数は揺らぎがある場合は米国の日付形式 (`MM/DD/YYYY` など) を優先し、処理できない日付形式に遭遇した場合は `NULL` を返します。
## parseDateTime64BestEffortUSOrZero {#parsedatetime64besteffortusorzero}

[parseDateTime64BestEffort](#parsedatetime64besteffort) と同様ですが、この関数は揺らぎがある場合は米国の日付形式 (`MM/DD/YYYY` など) を優先し、処理できない日付形式に遭遇した場合はゼロ日付またはゼロ日付時刻を返します。
## toLowCardinality {#tolowcardinality}

入力パラメータを同じデータ型の [LowCardinality](../data-types/lowcardinality.md) バージョンに変換します。

`LowCardinality` データ型からデータを変換するには、[CAST](#cast) 関数を使用します。例えば、`CAST(x as String)`。

**文法**

```sql
toLowCardinality(expr)
```

**引数**

- `expr` — 結果として取得される [式](/sql-reference/syntax#expressions)、およびサポートされているデータ型の1つ。 

**返される値**

- `expr` の結果。[LowCardinality](../data-types/lowcardinality.md) の型。

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

`DateTime64` を固定秒精度の `Int64` 値に変換します。入力値は、その精度に応じて適切にスケーリングされます。

:::note
出力値は UTC のタイムスタンプであり、`DateTime64` のタイムゾーンではありません。
:::

**文法**

```sql
toUnixTimestamp64Second(value)
```

**引数**

- `value` — 任意の精度の `DateTime64` 値。[DateTime64](../data-types/datetime64.md)。

**返される値**

- `value` が `Int64` データ型に変換されます。[Int64](../data-types/int-uint.md)。

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

`DateTime64` を固定ミリ秒精度の `Int64` 値に変換します。入力値は、その精度に応じて適切にスケーリングされます。

:::note
出力値は UTC のタイムスタンプであり、`DateTime64` のタイムゾーンではありません。
:::

**文法**

```sql
toUnixTimestamp64Milli(value)
```

**引数**

- `value` — 任意の精度の `DateTime64` 値。[DateTime64](../data-types/datetime64.md)。

**返される値**

- `value` が `Int64` データ型に変換されます。[Int64](../data-types/int-uint.md)。

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

`DateTime64` を固定マイクロ秒精度の `Int64` 値に変換します。入力値は、その精度に応じて適切にスケーリングされます。

:::note
出力値は UTC のタイムスタンプであり、`DateTime64` のタイムゾーンではありません。
:::

**文法**

```sql
toUnixTimestamp64Micro(value)
```

**引数**

- `value` — 任意の精度の `DateTime64` 値。[DateTime64](../data-types/datetime64.md)。

**返される値**

- `value` が `Int64` データ型に変換されます。[Int64](../data-types/int-uint.md)。

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

`DateTime64` を固定ナノ秒精度の `Int64` 値に変換します。入力値は、その精度に応じて適切にスケーリングされます。

:::note
出力値は UTC のタイムスタンプであり、`DateTime64` のタイムゾーンではありません。
:::

**文法**

```sql
toUnixTimestamp64Nano(value)
```

**引数**

- `value` — 任意の精度の `DateTime64` 値。[DateTime64](../data-types/datetime64.md)。

**返される値**

- `value` が `Int64` データ型に変換されます。[Int64](../data-types/int-uint.md)。

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

`Int64`を固定の秒精度とオプションのタイムゾーンを持つ`DateTime64`値に変換します。入力値は、その精度に応じて適切にスケーリングされます。

:::note
入力値は、指定された（または暗黙の）タイムゾーンではなく、UTCタイムスタンプとして扱われることに注意してください。
:::

**構文**

``` sql
fromUnixTimestamp64Second(value[, timezone])
```

**引数**

- `value` — 任意の精度の値。[Int64](../data-types/int-uint.md)。
- `timezone` — （オプション）結果のタイムゾーン名。[String](../data-types/string.md)。

**返される値**

- 精度`0`のDateTime64に変換された`value`。[DateTime64](../data-types/datetime64.md)。

**例**

クエリ：

``` sql
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

`Int64`を固定のミリ秒精度とオプションのタイムゾーンを持つ`DateTime64`値に変換します。入力値は、その精度に応じて適切にスケーリングされます。

:::note
入力値は、指定された（または暗黙の）タイムゾーンではなく、UTCタイムスタンプとして扱われることに注意してください。
:::

**構文**

``` sql
fromUnixTimestamp64Milli(value[, timezone])
```

**引数**

- `value` — 任意の精度の値。[Int64](../data-types/int-uint.md)。
- `timezone` — （オプション）結果のタイムゾーン名。[String](../data-types/string.md)。

**返される値**

- 精度`3`のDateTime64に変換された`value`。[DateTime64](../data-types/datetime64.md)。

**例**

クエリ：

``` sql
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

`Int64`を固定のマイクロ秒精度とオプションのタイムゾーンを持つ`DateTime64`値に変換します。入力値は、その精度に応じて適切にスケーリングされます。

:::note
入力値は、指定された（または暗黙の）タイムゾーンではなく、UTCタイムスタンプとして扱われることに注意してください。
:::

**構文**

``` sql
fromUnixTimestamp64Micro(value[, timezone])
```

**引数**

- `value` — 任意の精度の値。[Int64](../data-types/int-uint.md)。
- `timezone` — （オプション）結果のタイムゾーン名。[String](../data-types/string.md)。

**返される値**

- 精度`6`のDateTime64に変換された`value`。[DateTime64](../data-types/datetime64.md)。

**例**

クエリ：

``` sql
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

`Int64`を固定のナノ秒精度とオプションのタイムゾーンを持つ`DateTime64`値に変換します。入力値は、その精度に応じて適切にスケーリングされます。

:::note
入力値は、指定された（または暗黙の）タイムゾーンではなく、UTCタイムスタンプとして扱われることに注意してください。
:::

**構文**

``` sql
fromUnixTimestamp64Nano(value[, timezone])
```

**引数**

- `value` — 任意の精度の値。[Int64](../data-types/int-uint.md)。
- `timezone` — （オプション）結果のタイムゾーン名。[String](../data-types/string.md)。

**返される値**

- 精度`9`のDateTime64に変換された`value`。[DateTime64](../data-types/datetime64.md)。

**例**

クエリ：

``` sql
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

``` sql
formatRow(format, x, y, ...)
```

**引数**

- `format` — テキスト形式。たとえば、[CSV](/interfaces/formats.md/#csv)、[TSV](/interfaces/formats.md/#tabseparated)。
- `x`,`y`, ... — 式。

**返される値**

- 形式化された文字列。（テキスト形式の場合、通常は改行文字で終了します）。

**例**

クエリ：

``` sql
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

``` sql
SELECT formatRow('CustomSeparated', number, 'good')
FROM numbers(3)
SETTINGS format_custom_result_before_delimiter='<prefix>\n', format_custom_result_after_delimiter='<suffix>'
```

結果：

```response
┌─formatRow('CustomSeparated', number, 'good')─┐
│ <prefix>
0	good
<suffix>                   │
│ <prefix>
1	good
<suffix>                   │
│ <prefix>
2	good
<suffix>                   │
└──────────────────────────────────────────────┘
```

注: この関数では、行ベースの形式のみがサポートされています。
## formatRowNoNewline {#formatrownonewline}

任意の式を指定された形式の文字列に変換します。formatRowとは異なり、この関数は最後の`\n`をトリムします（もしあれば）。

**構文**

``` sql
formatRowNoNewline(format, x, y, ...)
```

**引数**

- `format` — テキスト形式。たとえば、[CSV](/interfaces/formats.md/#csv)、[TSV](/interfaces/formats.md/#tabseparated)。
- `x`,`y`, ... — 式。

**返される値**

- 形式化された文字列。

**例**

クエリ：

``` sql
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
