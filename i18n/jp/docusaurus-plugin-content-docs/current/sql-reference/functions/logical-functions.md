---
description: '論理関数のドキュメント'
sidebar_label: '論理'
sidebar_position: 110
slug: /sql-reference/functions/logical-functions
title: '論理関数'
---

# 論理関数

以下の関数は任意の数値型の引数に対して論理演算を行います。返り値は、[UInt8](../data-types/int-uint.md) で 0 または 1、または場合によっては `NULL` です。

引数としてのゼロは `false` と見なされ、非ゼロの値は `true` と見なされます。

## and {#and}

2 つ以上の値の論理積を計算します。

設定 [short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation) は、ショートサーキット評価が使用されるかどうかを制御します。有効な場合、`val_i` は `(val_1 AND val_2 AND ... AND val_{i-1})` が `true` の場合のみ評価されます。例えば、ショートサーキット評価が有効な場合、クエリ `SELECT and(number = 2, intDiv(1, number)) FROM numbers(5)` を実行するときにゼロ除算の例外は発生しません。

**構文**

```sql
and(val1, val2...)
```

エイリアス: [AND 演算子](../../sql-reference/operators/index.md#logical-and-operator)。

**引数**

- `val1, val2, ...` — 少なくとも二つの値のリスト。 [Int](../data-types/int-uint.md), [UInt](../data-types/int-uint.md), [Float](../data-types/float.md) または [Nullable](../data-types/nullable.md)。

**返り値**

- 引数の一つ以上が `false` と評価された場合は `0`、
- 引数が全て `false` と評価されず、少なくとも一つの引数が `NULL` の場合は `NULL`、
- それ以外の場合は `1`。

型: [UInt8](../../sql-reference/data-types/int-uint.md) または [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md))。

**例**

```sql
SELECT and(0, 1, -2);
```

結果:

```text
┌─and(0, 1, -2)─┐
│             0 │
└───────────────┘
```

`NULL` の場合:

```sql
SELECT and(NULL, 1, 10, -2);
```

結果:

```text
┌─and(NULL, 1, 10, -2)─┐
│                 ᴺᵁᴸᴸ │
└──────────────────────┘
```

## or {#or}

2 つ以上の値の論理和を計算します。

設定 [short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation) は、ショートサーキット評価が使用されるかどうかを制御します。有効な場合、`val_i` は `((NOT val_1) AND (NOT val_2) AND ... AND (NOT val_{i-1}))` が `true` の場合のみ評価されます。例えば、ショートサーキット評価が有効な場合、クエリ `SELECT or(number = 0, intDiv(1, number) != 0) FROM numbers(5)` を実行するときにゼロ除算の例外は発生しません。

**構文**

```sql
or(val1, val2...)
```

エイリアス: [OR 演算子](../../sql-reference/operators/index.md#logical-or-operator)。

**引数**

- `val1, val2, ...` — 少なくとも二つの値のリスト。 [Int](../data-types/int-uint.md), [UInt](../data-types/int-uint.md), [Float](../data-types/float.md) または [Nullable](../data-types/nullable.md)。

**返り値**

- 引数の一つ以上が `true` と評価された場合は `1`、
- すべての引数が `false` と評価された場合は `0`、
- すべての引数が `false` と評価されず、少なくとも一つの引数が `NULL` の場合は `NULL`。

型: [UInt8](../../sql-reference/data-types/int-uint.md) または [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md))。

**例**

```sql
SELECT or(1, 0, 0, 2, NULL);
```

結果:

```text
┌─or(1, 0, 0, 2, NULL)─┐
│                    1 │
└──────────────────────┘
```

`NULL` の場合:

```sql
SELECT or(0, NULL);
```

結果:

```text
┌─or(0, NULL)─┐
│        ᴺᵁᴸᴸ │
└─────────────┘
```

## not {#not}

値の論理否定を計算します。

**構文**

```sql
not(val);
```

エイリアス: [否定演算子](../../sql-reference/operators/index.md#logical-negation-operator)。

**引数**

- `val` — 値。 [Int](../data-types/int-uint.md), [UInt](../data-types/int-uint.md), [Float](../data-types/float.md) または [Nullable](../data-types/nullable.md)。

**返り値**

- `val` が `false` と評価された場合は `1`、
- `val` が `true` と評価された場合は `0`、
- `val` が `NULL` の場合は `NULL`。

型: [UInt8](../../sql-reference/data-types/int-uint.md) または [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md))。

**例**

```sql
SELECT NOT(1);
```

結果:

```test
┌─not(1)─┐
│      0 │
└────────┘
```

## xor {#xor}

2 つ以上の値の論理排他的論理和を計算します。2 つ以上の入力値の場合、関数は最初の 2 つの値を XOR した後、結果を三つ目の値と XOR します。

**構文**

```sql
xor(val1, val2...)
```

**引数**

- `val1, val2, ...` — 少なくとも二つの値のリスト。 [Int](../data-types/int-uint.md), [UInt](../data-types/int-uint.md), [Float](../data-types/float.md) または [Nullable](../data-types/nullable.md)。

**返り値**

- 2つの値の場合: 一方の値が `false` と評価され、もう一方がそうでない場合は `1`、
- 2つの値の場合: 両方の値が `false` または両方が `true` と評価された場合は `0`、
- 入力の一つ以上が `NULL` の場合は `NULL`。

型: [UInt8](../../sql-reference/data-types/int-uint.md) または [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md))。

**例**

```sql
SELECT xor(0, 1, 1);
```

結果:

```text
┌─xor(0, 1, 1)─┐
│            0 │
└──────────────┘
```
