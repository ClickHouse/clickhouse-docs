---
slug: /sql-reference/functions/functions-for-nulls
sidebar_position: 135
sidebar_label: Nullable
---

# Nullable値を操作するための関数

## isNull {#isnull}

引数が[NULL](../../sql-reference/syntax.md#null)であるかどうかを返します。

他の関連情報として、演算子 [`IS NULL`](../operators/index.md#is_null) も参照してください。

**構文**

``` sql
isNull(x)
```

エイリアス: `ISNULL`.

**引数**

- `x` — 非コンパウンドデータ型の値。

**戻り値**

- `x` が `NULL` の場合、`1` を返します。
- `x` が `NULL` でない場合、`0` を返します。

**例**

テーブル:

``` text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

クエリ:

``` sql
SELECT x FROM t_null WHERE isNull(y);
```

結果:

``` text
┌─x─┐
│ 1 │
└───┘
```

## isNullable {#isnullable}

カラムが[Nullable](../data-types/nullable.md)（すなわち `NULL` 値を許可する）である場合に `1` を返し、それ以外の場合は `0` を返します。

**構文**

``` sql
isNullable(x)
```

**引数**

- `x` — カラム。

**戻り値**

- `x` が `NULL` 値を許可する場合は `1`。 [UInt8](../data-types/int-uint.md)。
- `x` が `NULL` 値を許可しない場合は `0`。 [UInt8](../data-types/int-uint.md)。

**例**

クエリ:

``` sql
CREATE TABLE tab (ordinary_col UInt32, nullable_col Nullable(UInt32)) ENGINE = Log;
INSERT INTO tab (ordinary_col, nullable_col) VALUES (1,1), (2, 2), (3,3);
SELECT isNullable(ordinary_col), isNullable(nullable_col) FROM tab;    
```

結果:

``` text
   ┌───isNullable(ordinary_col)──┬───isNullable(nullable_col)──┐
1. │                           0 │                           1 │
2. │                           0 │                           1 │
3. │                           0 │                           1 │
   └─────────────────────────────┴─────────────────────────────┘
```

## isNotNull {#isnotnull}

引数が[NULL](../../sql-reference/syntax.md#null-literal)でないかどうかを返します。

他の関連情報として、演算子 [`IS NOT NULL`](../operators/index.md#is_not_null) も参照してください。

``` sql
isNotNull(x)
```

**引数:**

- `x` — 非コンパウンドデータ型の値。

**戻り値**

- `x` が `NULL` でない場合、`1` を返します。
- `x` が `NULL` の場合、`0` を返します。

**例**

テーブル:

``` text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

クエリ:

``` sql
SELECT x FROM t_null WHERE isNotNull(y);
```

結果:

``` text
┌─x─┐
│ 2 │
└───┘
```

## isNotDistinctFrom {#isnotdistinctfrom}

NULL安全な比較を行います。JOIN ON部分でNULL値を含むJOINキーを比較するために使用されます。
この関数は、2つの`NULL`値を同一とみなし、`true`を返します。これは、通常の等号の振る舞い（2つの`NULL`値を比較すると`NULL`を返す）のとは異なります。

:::note
この関数はJOIN ONの実装で内部的に使用される関数です。クエリ内で手動で使用しないでください。
:::

**構文**

``` sql
isNotDistinctFrom(x, y)
```

**引数**

- `x` — 最初のJOINキー。
- `y` — 2番目のJOINキー。

**戻り値**

- `x` と `y` の両方が `NULL` の場合は `true`。
- それ以外の場合は `false`。

**例**

完全な例については、[JOINキーにおけるNULL値](../../sql-reference/statements/select/join#null-values-in-join-keys)を参照してください。

## isZeroOrNull {#iszeroornull}

引数が0（ゼロ）または[NULL](../../sql-reference/syntax.md#null-literal)であるかどうかを返します。

``` sql
isZeroOrNull(x)
```

**引数:**

- `x` — 非コンパウンドデータ型の値。

**戻り値**

- `x` が0（ゼロ）または `NULL` の場合、`1` を返します。
- それ以外の場合は `0` を返します。

**例**

テーブル:

``` text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    0 │
│ 3 │    3 │
└───┴──────┘
```

クエリ:

``` sql
SELECT x FROM t_null WHERE isZeroOrNull(y);
```

結果:

``` text
┌─x─┐
│ 1 │
│ 2 │
└───┘
```

## coalesce {#coalesce}

最も左の非`NULL`引数を返します。

``` sql
coalesce(x,...)
```

**引数:**

- 任意の数の非コンパウンド型のパラメータ。すべてのパラメータは互いに互換性のあるデータ型でなければなりません。

**戻り値**

- 最初の非`NULL`引数
- すべての引数が`NULL`の場合は `NULL`。

**例**

複数の方法で顧客に連絡する手段を指定している可能性のある連絡先リストを考えます。

``` text
┌─name─────┬─mail─┬─phone─────┬──telegram─┐
│ client 1 │ ᴺᵁᴸᴸ │ 123-45-67 │       123 │
│ client 2 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ      │      ᴺᵁᴸᴸ │
└──────────┴──────┴───────────┴───────────┘
```

`mail` と `phone` フィールドは String 型ですが、`telegram` フィールドは `UInt32` 型なので、String に変換する必要があります。

顧客の連絡先リストから最初に利用可能な連絡方法を取得します:

``` sql
SELECT name, coalesce(mail, phone, CAST(telegram,'Nullable(String)')) FROM aBook;
```

``` text
┌─name─────┬─coalesce(mail, phone, CAST(telegram, 'Nullable(String)'))─┐
│ client 1 │ 123-45-67                                                 │
│ client 2 │ ᴺᵁᴸᴸ                                                      │
└──────────┴───────────────────────────────────────────────────────────┘
```

## ifNull {#ifnull}

引数が `NULL` の場合に代替値を返します。

``` sql
ifNull(x, alt)
```

**引数:**

- `x` — `NULL`かどうかをチェックする値。
- `alt` — `x` が `NULL` である場合に関数が返す値。

**戻り値**

- `x` が `NULL` でない場合は `x` を返します。
- `x` が `NULL` の場合は `alt` を返します。

**例**

クエリ:

``` sql
SELECT ifNull('a', 'b');
```

結果:

``` text
┌─ifNull('a', 'b')─┐
│ a                │
└──────────────────┘
```

クエリ:

``` sql
SELECT ifNull(NULL, 'b');
```

結果:

``` text
┌─ifNull(NULL, 'b')─┐
│ b                 │
└───────────────────┘
```

## nullIf {#nullif}

両方の引数が等しい場合、`NULL` を返します。

``` sql
nullIf(x, y)
```

**引数:**

`x`, `y` — 比較する値。互換性のある型でなければならない。

**戻り値**

- 引数が等しい場合は `NULL` を返します。
- 引数が等しくない場合は `x` を返します。

**例**

クエリ:

``` sql
SELECT nullIf(1, 1);
```

結果:

``` text
┌─nullIf(1, 1)─┐
│         ᴺᵁᴸᴸ │
└──────────────┘
```

クエリ:

``` sql
SELECT nullIf(1, 2);
```

結果:

``` text
┌─nullIf(1, 2)─┐
│            1 │
└──────────────┘
```

## assumeNotNull {#assumenotnull}

[Nullable](../data-types/nullable.md)型の値に対して対応する非`Nullable`値を返します。元の値が`NULL`の場合、任意の結果が返される可能性があります。`ifNull`および`coalesce`関数も参照してください。

``` sql
assumeNotNull(x)
```

**引数:**

- `x` — 元の値。

**戻り値**

- 元の値が`NULL`でない場合、その値を非`Nullable`型として返します。
- 入力値が`NULL`の場合、任意の値を返します。

**例**

テーブル:

``` text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

クエリ:

``` sql
SELECT assumeNotNull(y) FROM table;
```

結果:

``` text
┌─assumeNotNull(y)─┐
│                0 │
│                3 │
└──────────────────┘
```

クエリ:

``` sql
SELECT toTypeName(assumeNotNull(y)) FROM t_null;
```

結果:

``` text
┌─toTypeName(assumeNotNull(y))─┐
│ Int8                         │
│ Int8                         │
└──────────────────────────────┘
```

## toNullable {#tonullable}

引数の型を `Nullable` に変換します。

``` sql
toNullable(x)
```

**引数:**

- `x` — 非コンパウンド型の値。

**戻り値**

- 入力値を `Nullable` 型として返します。

**例**

クエリ:

``` sql
SELECT toTypeName(10);
```

結果:

``` text
┌─toTypeName(10)─┐
│ UInt8          │
└────────────────┘
```

クエリ:

``` sql
SELECT toTypeName(toNullable(10));
```

結果:

``` text
┌─toTypeName(toNullable(10))─┐
│ Nullable(UInt8)            │
└────────────────────────────┘
```
