---
description: 'Nullable値を扱うための機能に関するドキュメント'
sidebar_label: 'Nullable'
sidebar_position: 135
slug: '/sql-reference/functions/functions-for-nulls'
title: 'Nullable Values用の機能'
---




# Nullable 値を扱う関数

## isNull {#isnull}

引数が [NULL](../../sql-reference/syntax.md#null) であるかどうかを返します。

[`IS NULL`](../operators/index.md#is_null) 演算子も参照してください。

**構文**

```sql
isNull(x)
```

エイリアス: `ISNULL`.

**引数**

- `x` — 非複合データ型の値。

**返される値**

- `x` が `NULL` の場合は `1`。
- `x` が `NULL` でない場合は `0`。

**例**

テーブル:

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

クエリ:

```sql
SELECT x FROM t_null WHERE isNull(y);
```

結果:

```text
┌─x─┐
│ 1 │
└───┘
```

## isNullable {#isnullable}

カラムが [Nullable](../data-types/nullable.md) である場合は `1` を返し（つまり、`NULL` 値を許可）、そうでない場合は `0` を返します。

**構文**

```sql
isNullable(x)
```

**引数**

- `x` — カラム。

**返される値**

- `x` が `NULL` 値を許可する場合は `1`。 [UInt8](../data-types/int-uint.md)。
- `x` が `NULL` 値を許可しない場合は `0`。 [UInt8](../data-types/int-uint.md)。

**例**

クエリ:

```sql
CREATE TABLE tab (ordinary_col UInt32, nullable_col Nullable(UInt32)) ENGINE = Log;
INSERT INTO tab (ordinary_col, nullable_col) VALUES (1,1), (2, 2), (3,3);
SELECT isNullable(ordinary_col), isNullable(nullable_col) FROM tab;    
```

結果:

```text
   ┌───isNullable(ordinary_col)──┬───isNullable(nullable_col)──┐
1. │                           0 │                           1 │
2. │                           0 │                           1 │
3. │                           0 │                           1 │
   └─────────────────────────────┴─────────────────────────────┘
```

## isNotNull {#isnotnull}

引数が [NULL](/operations/settings/formats#input_format_null_as_default) でないかを返します。

[`IS NOT NULL`](../operators/index.md#is_not_null) 演算子も参照してください。

```sql
isNotNull(x)
```

**引数:**

- `x` — 非複合データ型の値。

**返される値**

- `x` が `NULL` でない場合は `1`。
- `x` が `NULL` の場合は `0`。

**例**

テーブル:

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

クエリ:

```sql
SELECT x FROM t_null WHERE isNotNull(y);
```

結果:

```text
┌─x─┐
│ 2 │
└───┘
```

## isNotDistinctFrom {#isnotdistinctfrom}

NULL 安全比較を実行します。これは、JOIN ON セクションに NULL 値を含む JOIN キーを比較するために使用されます。
この関数は、2 つの `NULL` 値を同一と見なし、`true` を返します。これは、通常の等値比較の動作とは異なり、2 つの `NULL` 値を比較すると `NULL` が返されるということです。

:::note
この関数は、JOIN ON の実装で使用される内部関数です。クエリで手動で使用しないでください。
:::

**構文**

```sql
isNotDistinctFrom(x, y)
```

**引数**

- `x` — 最初の JOIN キー。
- `y` — 2 番目の JOIN キー。

**返される値**

- `x` と `y` が両方とも `NULL` の場合は `true`。
- そうでない場合は `false`。

**例**

完全な例については、[JOIN キーの NULL 値](../../sql-reference/statements/select/join#null-values-in-join-keys) を参照してください。

## isZeroOrNull {#iszeroornull}

引数が 0（ゼロ）または [NULL](/operations/settings/formats#input_format_null_as_default) であるかどうかを返します。

```sql
isZeroOrNull(x)
```

**引数:**

- `x` — 非複合データ型の値。

**返される値**

- `x` が 0（ゼロ）または `NULL` の場合は `1`。
- それ以外は `0`。

**例**

テーブル:

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    0 │
│ 3 │    3 │
└───┴──────┘
```

クエリ:

```sql
SELECT x FROM t_null WHERE isZeroOrNull(y);
```

結果:

```text
┌─x─┐
│ 1 │
│ 2 │
└───┘
```

## coalesce {#coalesce}

最も左の非 `NULL` 引数を返します。

```sql
coalesce(x,...)
```

**引数:**

- 複合型でない任意の数のパラメータ。すべてのパラメータは相互に互換性のあるデータ型でなければなりません。

**返される値**

- 最初の非 `NULL` 引数
- すべての引数が `NULL` の場合は `NULL`。

**例**

顧客への連絡方法を複数指定する可能性のある連絡先のリストを考えます。

```text
┌─name─────┬─mail─┬─phone─────┬──telegram─┐
│ client 1 │ ᴺᵁᴺᴸ │ 123-45-67 │       123 │
│ client 2 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ      │      ᴺᵁᴸᴸ │
└──────────┴──────┴───────────┴───────────┘
```

`mail` と `phone` フィールドは文字列型ですが、`telegram` フィールドは `UInt32` なので、文字列に変換する必要があります。

顧客からの連絡方法のリストから最初に利用可能な連絡方法を取得します。

```sql
SELECT name, coalesce(mail, phone, CAST(telegram,'Nullable(String)')) FROM aBook;
```

```text
┌─name─────┬─coalesce(mail, phone, CAST(telegram, 'Nullable(String)'))─┐
│ client 1 │ 123-45-67                                                 │
│ client 2 │ ᴺᵁᴸᴸ                                                      │
└──────────┴───────────────────────────────────────────────────────────┘
```

## ifNull {#ifnull}

引数が `NULL` の場合、代替値を返します。

```sql
ifNull(x, alt)
```

**引数:**

- `x` — `NULL` をチェックする値。
- `alt` — `x` が `NULL` の場合に関数が返す値。

**返される値**

- `x` が `NULL` でない場合は `x`。
- `x` が `NULL` の場合は `alt`。

**例**

クエリ:

```sql
SELECT ifNull('a', 'b');
```

結果:

```text
┌─ifNull('a', 'b')─┐
│ a                │
└──────────────────┘
```

クエリ:

```sql
SELECT ifNull(NULL, 'b');
```

結果:

```text
┌─ifNull(NULL, 'b')─┐
│ b                 │
└───────────────────┘
```

## nullIf {#nullif}

両方の引数が等しい場合に `NULL` を返します。

```sql
nullIf(x, y)
```

**引数:**

`x`, `y` — 比較する値。互換性のある型でなければなりません。

**返される値**

- 引数が等しい場合は `NULL`。
- 引数が等しくない場合は `x`。

**例**

クエリ:

```sql
SELECT nullIf(1, 1);
```

結果:

```text
┌─nullIf(1, 1)─┐
│         ᴺᵁᴸᴸ │
└──────────────┘
```

クエリ:

```sql
SELECT nullIf(1, 2);
```

結果:

```text
┌─nullIf(1, 2)─┐
│            1 │
└──────────────┘
```

## assumeNotNull {#assumenotnull}

[Nullable](../data-types/nullable.md) 型の値に対し、対応する非 `Nullable` 値を返します。元の値が `NULL` の場合、適当な結果が返されることがあります。`ifNull` および `coalesce` 関数も参照してください。

```sql
assumeNotNull(x)
```

**引数:**

- `x` — 元の値。

**返される値**

- 入力値が `NULL` でない場合は非 `Nullable` 型の入力値。
- 入力値が `NULL` の場合は任意の値。

**例**

テーブル:

```text

┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

クエリ:

```sql
SELECT assumeNotNull(y) FROM table;
```

結果:

```text
┌─assumeNotNull(y)─┐
│                0 │
│                3 │
└──────────────────┘
```

クエリ:

```sql
SELECT toTypeName(assumeNotNull(y)) FROM t_null;
```

結果:

```text
┌─toTypeName(assumeNotNull(y))─┐
│ Int8                         │
│ Int8                         │
└──────────────────────────────┘
```

## toNullable {#tonullable}

引数の型を `Nullable` に変換します。

```sql
toNullable(x)
```

**引数:**

- `x` — 非複合型の値。

**返される値**

- 入力値だが、`Nullable` 型の値。

**例**

クエリ:

```sql
SELECT toTypeName(10);
```

結果:

```text
┌─toTypeName(10)─┐
│ UInt8          │
└────────────────┘
```

クエリ:

```sql
SELECT toTypeName(toNullable(10));
```

結果:

```text
┌─toTypeName(toNullable(10))─┐
│ Nullable(UInt8)            │
└────────────────────────────┘
```
