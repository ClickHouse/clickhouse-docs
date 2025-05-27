---
'description': '論理関数のドキュメント'
'sidebar_label': '論理'
'sidebar_position': 110
'slug': '/sql-reference/functions/logical-functions'
'title': 'Logical Functions'
---




# 論理関数

以下の関数は、任意の数値型の引数に対して論理演算を実行します。返される値は、[UInt8](../data-types/int-uint.md)として0または1、または場合によっては`NULL`です。

引数として0は`false`と見なされ、非ゼロの値は`true`と見なされます。

## and {#and}

2つ以上の値の論理結合を計算します。

[short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation)を設定することで、ショートサーキット評価が使用されるかどうかを制御します。これが有効な場合、`val_i`は`(val_1 AND val_2 AND ... AND val_{i-1})`が`true`の場合にのみ評価されます。たとえば、ショートサーキット評価を使用すると、クエリ`SELECT and(number = 2, intDiv(1, number)) FROM numbers(5)`を実行する際にゼロによる割り算の例外が発生しません。

**構文**

```sql
and(val1, val2...)
```

エイリアス: [AND演算子](../../sql-reference/operators/index.md#logical-and-operator)。

**引数**

- `val1, val2, ...` — 少なくとも2つの値のリスト。[Int](../data-types/int-uint.md)、[UInt](../data-types/int-uint.md)、[Float](../data-types/float.md)、または[Nullable](../data-types/nullable.md)。

**戻り値**

- `0`、少なくとも1つの引数が`false`に評価される場合、
- `NULL`、どの引数も`false`に評価されず、少なくとも1つの引数が`NULL`である場合、
- `1`、それ以外の場合。

タイプ: [UInt8](../../sql-reference/data-types/int-uint.md)または[Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md))。

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

`NULL`を使用した場合:

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

2つ以上の値の論理和を計算します。

[short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation)を設定することで、ショートサーキット評価が使用されるかどうかを制御します。これが有効な場合、`val_i`は`((NOT val_1) AND (NOT val_2) AND ... AND (NOT val_{i-1}))`が`true`の場合にのみ評価されます。たとえば、ショートサーキット評価を使用すると、クエリ`SELECT or(number = 0, intDiv(1, number) != 0) FROM numbers(5)`を実行する際にゼロによる割り算の例外が発生しません。

**構文**

```sql
or(val1, val2...)
```

エイリアス: [OR演算子](../../sql-reference/operators/index.md#logical-or-operator)。

**引数**

- `val1, val2, ...` — 少なくとも2つの値のリスト。[Int](../data-types/int-uint.md)、[UInt](../data-types/int-uint.md)、[Float](../data-types/float.md)、または[Nullable](../data-types/nullable.md)。

**戻り値**

- `1`、少なくとも1つの引数が`true`に評価される場合、
- `0`、すべての引数が`false`に評価される場合、
- `NULL`、すべての引数が`false`に評価され、少なくとも1つの引数が`NULL`である場合。

タイプ: [UInt8](../../sql-reference/data-types/int-uint.md)または[Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md))。

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

`NULL`を使用した場合:

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

- `val` — 値。[Int](../data-types/int-uint.md)、[UInt](../data-types/int-uint.md)、[Float](../data-types/float.md)、または[Nullable](../data-types/nullable.md)。

**戻り値**

- `1`、`val`が`false`に評価される場合、
- `0`、`val`が`true`に評価される場合、
- `NULL`、`val`が`NULL`である場合。

タイプ: [UInt8](../../sql-reference/data-types/int-uint.md)または[Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md))。

**例**

```sql
SELECT NOT(1);
```

結果:

```text
┌─not(1)─┐
│      0 │
└────────┘
```

## xor {#xor}

2つ以上の値の論理排他的和を計算します。2つ以上の入力値がある場合、関数は最初の2つの値をxorし、その結果を3つ目の値とxorします。

**構文**

```sql
xor(val1, val2...)
```

**引数**

- `val1, val2, ...` — 少なくとも2つの値のリスト。[Int](../data-types/int-uint.md)、[UInt](../data-types/int-uint.md)、[Float](../data-types/float.md)、または[Nullable](../data-types/nullable.md)。

**戻り値**

- `1`、2つの値の場合: 1つの値が`false`に評価され、もう1つの値が評価されない場合、
- `0`、2つの値の場合: 両方の値が`false`に評価されるか、両方の値が`true`に評価される場合、
- `NULL`、入力のいずれかが`NULL`である場合。

タイプ: [UInt8](../../sql-reference/data-types/int-uint.md)または[Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md))。

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
