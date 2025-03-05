---
slug: /sql-reference/functions/logical-functions
sidebar_position: 110
sidebar_label: Logical
---


# 論理関数

以下の関数は、任意の数値型の引数に対して論理演算を実行します。これらは、[UInt8](../data-types/int-uint.md)として0または1、または場合によっては`NULL`を返します。

引数がゼロの場合は`false`と見なされ、非ゼロ値は`true`と見なされます。

## and {#and}

2つ以上の値の論理積を計算します。

設定 [short_circuit_function_evaluation](../../operations/settings/settings.md#short-circuit-function-evaluation) によって、ショートサーキット評価が使用されるかどうかが制御されます。有効にした場合、`val_i`は`(val_1 AND val_2 AND ... AND val_{i-1})`が`true`の場合のみ評価されます。たとえば、ショートサーキット評価を使用すると、クエリ `SELECT and(number = 2, intDiv(1, number)) FROM numbers(5)` を実行する際にゼロ除算例外がスローされません。

**構文**

``` sql
and(val1, val2...)
```

エイリアス: [AND演算子](../../sql-reference/operators/index.md#logical-and-operator)。

**引数**

- `val1, val2, ...` — 少なくとも2つの値のリスト。 [Int](../data-types/int-uint.md)、[UInt](../data-types/int-uint.md)、[Float](../data-types/float.md)、または [Nullable](../data-types/nullable.md)。

**戻り値**

- `0`、もし少なくとも1つの引数が`false`と評価される場合、
- `NULL`、もしすべての引数が`false`ではなく、少なくとも1つの引数が`NULL`の場合、
- それ以外は`1`。

型: [UInt8](../../sql-reference/data-types/int-uint.md) または [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md))。

**例**

``` sql
SELECT and(0, 1, -2);
```

結果：

``` text
┌─and(0, 1, -2)─┐
│             0 │
└───────────────┘
```

`NULL`を使用した場合：

``` sql
SELECT and(NULL, 1, 10, -2);
```

結果：

``` text
┌─and(NULL, 1, 10, -2)─┐
│                 ᴺᵁᴸᴸ │
└──────────────────────┘
```

## or {#or}

2つ以上の値の論理和を計算します。

設定 [short_circuit_function_evaluation](../../operations/settings/settings.md#short-circuit-function-evaluation) によって、ショートサーキット評価が使用されるかどうかが制御されます。有効にした場合、`val_i`は`((NOT val_1) AND (NOT val_2) AND ... AND (NOT val_{i-1}))`が`true`の場合のみ評価されます。たとえば、ショートサーキット評価を使用すると、クエリ `SELECT or(number = 0, intDiv(1, number) != 0) FROM numbers(5)` を実行する際にゼロ除算例外がスローされません。

**構文**

``` sql
or(val1, val2...)
```

エイリアス: [OR演算子](../../sql-reference/operators/index.md#logical-or-operator)。

**引数**

- `val1, val2, ...` — 少なくとも2つの値のリスト。 [Int](../data-types/int-uint.md)、[UInt](../data-types/int-uint.md)、[Float](../data-types/float.md)、または [Nullable](../data-types/nullable.md)。

**戻り値**

- `1`、もし少なくとも1つの引数が`true`と評価される場合、
- `0`、もしすべての引数が`false`と評価される場合、
- `NULL`、もしすべての引数が`false`と評価され、少なくとも1つの引数が`NULL`の場合。

型: [UInt8](../../sql-reference/data-types/int-uint.md) または [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md))。

**例**

``` sql
SELECT or(1, 0, 0, 2, NULL);
```

結果：

``` text
┌─or(1, 0, 0, 2, NULL)─┐
│                    1 │
└──────────────────────┘
```

`NULL`を使用した場合：

``` sql
SELECT or(0, NULL);
```

結果：

``` text
┌─or(0, NULL)─┐
│        ᴺᵁᴸᴸ │
└─────────────┘
```

## not {#not}

値の論理否定を計算します。

**構文**

``` sql
not(val);
```

エイリアス: [否定演算子](../../sql-reference/operators/index.md#logical-negation-operator)。

**引数**

- `val` — 値。 [Int](../data-types/int-uint.md)、[UInt](../data-types/int-uint.md)、[Float](../data-types/float.md)、または [Nullable](../data-types/nullable.md)。

**戻り値**

- `1`、もし`val`が`false`と評価される場合、
- `0`、もし`val`が`true`と評価される場合、
- `NULL`、もし`val`が`NULL`の場合。

型: [UInt8](../../sql-reference/data-types/int-uint.md) または [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md))。

**例**

``` sql
SELECT NOT(1);
```

結果：

``` text
┌─not(1)─┐
│      0 │
└────────┘
```

## xor {#xor}

2つ以上の値の論理排他的論理和を計算します。2つ以上の入力値の場合、この関数は最初の2つの値をxorし、その結果を3番目の値とxorし、というように続きます。

**構文**

``` sql
xor(val1, val2...)
```

**引数**

- `val1, val2, ...` — 少なくとも2つの値のリスト。 [Int](../data-types/int-uint.md)、[UInt](../data-types/int-uint.md)、[Float](../data-types/float.md)、または [Nullable](../data-types/nullable.md)。

**戻り値**

- `1`、2つの値について：もし1つの値が`false`と評価され、もう1つが評価されない場合、
- `0`、2つの値について：もし両方の値が`false`または両方が`true`と評価される場合、
- `NULL`、もし少なくとも1つの入力が`NULL`の場合。

型: [UInt8](../../sql-reference/data-types/int-uint.md) または [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md))。

**例**

``` sql
SELECT xor(0, 1, 1);
```

結果：

``` text
┌─xor(0, 1, 1)─┐
│            0 │
└──────────────┘
```
