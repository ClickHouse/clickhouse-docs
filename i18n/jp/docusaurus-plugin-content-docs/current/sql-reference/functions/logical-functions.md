---
slug: '/sql-reference/functions/logical-functions'
sidebar_position: 110
sidebar_label: '論理'
---


# 論理関数

以下の関数は、任意の数値型の引数に対して論理演算を行います。出力は0または1で、[UInt8](../data-types/int-uint.md)または場合によっては `NULL` になります。

引数の0は `false` とみなされ、非ゼロの値は `true` とみなされます。

## and {#and}

2つ以上の値の論理積を計算します。

設定 [short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation) により、ショートサーキット評価が使用されるかどうかを制御します。有効な場合、`val_i` は `val_1 AND val_2 AND ... AND val_{i-1}` が `true` の場合にのみ評価されます。例えば、ショートサーキット評価を使用すると、クエリ `SELECT and(number = 2, intDiv(1, number)) FROM numbers(5)` を実行する際にゼロ除算の例外が発生しません。

**構文**

``` sql
and(val1, val2...)
```

エイリアス: [AND演算子](../../sql-reference/operators/index.md#logical-and-operator)。

**引数**

- `val1, val2, ...` — 2つ以上の値のリスト。[Int](../data-types/int-uint.md)、[UInt](../data-types/int-uint.md)、[Float](../data-types/float.md)または[Nullable](../data-types/nullable.md)。

**返される値**

- いずれかの引数が `false` と評価される場合は `0`、
- いずれの引数も `false` と評価されず、少なくとも1つの引数が `NULL` の場合は `NULL`、
- それ以外の場合は `1`。

型: [UInt8](../../sql-reference/data-types/int-uint.md) または [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md))。

**例**

``` sql
SELECT and(0, 1, -2);
```

結果:

``` text
┌─and(0, 1, -2)─┐
│             0 │
└───────────────┘
```

`NULL` を使用した場合:

``` sql
SELECT and(NULL, 1, 10, -2);
```

結果:

``` text
┌─and(NULL, 1, 10, -2)─┐
│                 ᴺᵁᴸᴸ │
└──────────────────────┘
```

## or {#or}

2つ以上の値の論理和を計算します。

設定 [short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation) により、ショートサーキット評価が使用されるかどうかを制御します。有効な場合、`val_i` は `((NOT val_1) AND (NOT val_2) AND ... AND (NOT val_{i-1}))` が `true` の場合にのみ評価されます。例えば、ショートサーキット評価を使用すると、クエリ `SELECT or(number = 0, intDiv(1, number) != 0) FROM numbers(5)` を実行する際にゼロ除算の例外が発生しません。

**構文**

``` sql
or(val1, val2...)
```

エイリアス: [OR演算子](../../sql-reference/operators/index.md#logical-or-operator)。

**引数**

- `val1, val2, ...` — 2つ以上の値のリスト。[Int](../data-types/int-uint.md)、[UInt](../data-types/int-uint.md)、[Float](../data-types/float.md)または[Nullable](../data-types/nullable.md)。

**返される値**

- いずれかの引数が `true` と評価される場合は `1`、
- すべての引数が `false` と評価される場合は `0`、
- すべての引数が `false` と評価され、少なくとも1つの引数が `NULL` の場合は `NULL`。

型: [UInt8](../../sql-reference/data-types/int-uint.md) または [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md))。

**例**

``` sql
SELECT or(1, 0, 0, 2, NULL);
```

結果:

``` text
┌─or(1, 0, 0, 2, NULL)─┐
│                    1 │
└──────────────────────┘
```

`NULL` を使用した場合:

``` sql
SELECT or(0, NULL);
```

結果:

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

- `val` — 値。[Int](../data-types/int-uint.md)、[UInt](../data-types/int-uint.md)、[Float](../data-types/float.md)または[Nullable](../data-types/nullable.md)。

**返される値**

- `val` が `false` と評価される場合は `1`、
- `val` が `true` と評価される場合は `0`、
- `val` が `NULL` の場合は `NULL`。

型: [UInt8](../../sql-reference/data-types/int-uint.md) または [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md))。

**例**

``` sql
SELECT NOT(1);
```

結果:

``` text
┌─not(1)─┐
│      0 │
└────────┘
```

## xor {#xor}

二つ以上の値の論理排他的和を計算します。2つ以上の入力値がある場合、関数は最初の二つの値をまず XOR し、その後の結果を三番目の値と XOR するというように進みます。

**構文**

``` sql
xor(val1, val2...)
```

**引数**

- `val1, val2, ...` — 2つ以上の値のリスト。[Int](../data-types/int-uint.md)、[UInt](../data-types/int-uint.md)、[Float](../data-types/float.md)または[Nullable](../data-types/nullable.md)。

**返される値**

- 2つの値の場合: いずれかの値が `false` で、他が `true` の場合は `1`、
- 2つの値の場合: 両方の値が `false` または両方が `true` の場合は `0`、
- 入力の少なくとも1つが `NULL` の場合は `NULL`。

型: [UInt8](../../sql-reference/data-types/int-uint.md) または [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md))。

**例**

``` sql
SELECT xor(0, 1, 1);
```

結果:

``` text
┌─xor(0, 1, 1)─┐
│            0 │
└──────────────┘
```
