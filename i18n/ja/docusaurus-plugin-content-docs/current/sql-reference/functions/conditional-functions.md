---
slug: /sql-reference/functions/conditional-functions
sidebar_position: 40
sidebar_label: 条件
---

# 条件関数

## if {#if}

条件分岐を実行します。

条件 `cond` がゼロ以外の値に評価される場合、関数は式 `then` の結果を返します。`cond` がゼロまたは `NULL` に評価される場合、`else` 式の結果が返されます。

[short_circuit_function_evaluation](../../operations/settings/settings.md#short-circuit-function-evaluation) を設定することで、短絡評価が使用されるかどうかを制御できます。有効にすると、`then` 式は `cond` が `true` の行のみで評価され、`else` 式は `cond` が `false` の行で評価されます。例えば、短絡評価を用いることで、クエリ `SELECT if(number = 0, 0, intDiv(42, number)) FROM numbers(10)` を実行する際に、ゼロによる除算の例外はスローされません。

`then` と `else` は類似の型である必要があります。

**構文**

``` sql
if(cond, then, else)
```
エイリアス: `cond ? then : else` (三項演算子)

**引数**

- `cond` – 評価される条件。UInt8、Nullable(UInt8) または NULL。
- `then` – `condition` が true の場合に返される式。
- `else` – `condition` が false または NULL の場合に返される式。

**返される値**

条件 `cond` に応じて、`then` または `else` 式のいずれかの結果。

**例**

``` sql
SELECT if(1, plus(2, 2), plus(2, 6));
```

結果:

``` text
┌─plus(2, 2)─┐
│          4 │
└────────────┘
```

## multiIf {#multiif}

クエリ内で [CASE](../../sql-reference/operators/index.md#conditional-expression) 演算子を書くのをより簡潔にすることができます。

**構文**

``` sql
multiIf(cond_1, then_1, cond_2, then_2, ..., else)
```

[short_circuit_function_evaluation](../../operations/settings/settings.md#short-circuit-function-evaluation) を設定することで、短絡評価が使用されるかどうかを制御できます。有効にすると、`then_i` 式は `((NOT cond_1) AND (NOT cond_2) AND ... AND (NOT cond_{i-1}) AND cond_i)` が `true` の行でのみ評価され、`cond_i` は `((NOT cond_1) AND (NOT cond_2) AND ... AND (NOT cond_{i-1}))` が `true` の行でのみ評価されます。例えば、短絡評価を用いることで、クエリ `SELECT multiIf(number = 2, intDiv(1, number), number = 5) FROM numbers(10)` を実行する際に、ゼロによる除算の例外はスローされません。

**引数**

この関数は `2N+1` のパラメーターを受け取ります：
- `cond_N` — N 番目に評価される条件で、`then_N` が返されるかどうかを制御します。
- `then_N` — `cond_N` が true のときの関数の結果。
- `else` — 条件のいずれも true でない場合の関数の結果。

**返される値**

条件 `cond_N` に応じて、`then_N` または `else` 式のいずれかの結果。

**例**

このテーブルを仮定します：

``` text
┌─left─┬─right─┐
│ ᴺᵁᴸᴸ │     4 │
│    1 │     3 │
│    2 │     2 │
│    3 │     1 │
│    4 │  ᴺᵁᴸᴸ │
└──────┴───────┘
```

``` sql
SELECT
    left,
    right,
    multiIf(left < right, 'left is smaller', left > right, 'left is greater', left = right, 'Both equal', 'Null value') AS result
FROM LEFT_RIGHT

┌─left─┬─right─┬─result──────────┐
│ ᴺᵁᴸᴸ │     4 │ Null value      │
│    1 │     3 │ left is smaller │
│    2 │     2 │ Both equal      │
│    3 │     1 │ left is greater │
│    4 │  ᴺᵁᴸᴸ │ Null value      │
└──────┴───────┴─────────────────┘
```

## 条件結果を直接使用する {#using-conditional-results-directly}

条件は常に `0`、`1` または `NULL` になります。したがって、次のように条件結果を直接使用できます：

``` sql
SELECT left < right AS is_small
FROM LEFT_RIGHT

┌─is_small─┐
│     ᴺᵁᴸᴸ │
│        1 │
│        0 │
│        0 │
│     ᴺᵁᴸᴸ │
└──────────┘
```

## 条件内の NULL 値 {#null-values-in-conditionals}

`NULL` 値が条件に含まれる場合、結果も `NULL` になります。

``` sql
SELECT
    NULL < 1,
    2 < NULL,
    NULL < NULL,
    NULL = NULL

┌─less(NULL, 1)─┬─less(2, NULL)─┬─less(NULL, NULL)─┬─equals(NULL, NULL)─┐
│ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ             │ ᴺᵁᴸᴸ               │
└───────────────┴───────────────┴──────────────────┴────────────────────┘
```

したがって、型が `Nullable` の場合は、クエリを注意深く構築する必要があります。

以下の例は、`multiIf` に等しい条件を追加できずに失敗することを示しています。

``` sql
SELECT
    left,
    right,
    multiIf(left < right, 'left is smaller', left > right, 'right is smaller', 'Both equal') AS faulty_result
FROM LEFT_RIGHT

┌─left─┬─right─┬─faulty_result────┐
│ ᴺᵁᴸᴸ │     4 │ Both equal       │
│    1 │     3 │ left is smaller  │
│    2 │     2 │ Both equal       │
│    3 │     1 │ right is smaller │
│    4 │  ᴺᵁᴸᴸ │ Both equal       │
└──────┴───────┴──────────────────┘
```

## greatest {#greatest}

値のリストの中で最大のものを返します。リストのすべてのメンバーは比較可能な型でなければなりません。

例：

```sql
SELECT greatest(1, 2, toUInt8(3), 3.) result,  toTypeName(result) type;
```
```response
┌─result─┬─type────┐
│      3 │ Float64 │
└────────┴─────────┘
```

:::note
返される型は Float64 であり、UInt8 は比較のために 64 ビットに昇格する必要があります。
:::

```sql
SELECT greatest(['hello'], ['there'], ['world'])
```
```response
┌─greatest(['hello'], ['there'], ['world'])─┐
│ ['world']                                 │
└───────────────────────────────────────────┘
```

```sql
SELECT greatest(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3))
```
```response
┌─greatest(toDateTime32(plus(now(), toIntervalDay(1))), toDateTime64(now(), 3))─┐
│                                                       2023-05-12 01:16:59.000 │
└──────────────────────────────────────────────────────────────────────────┘
```

:::note
返される型は DateTime64 であり、DateTime32 は比較のために 64 ビットに昇格する必要があります。
:::

## least {#least}

値のリストの中で最小のものを返します。リストのすべてのメンバーは比較可能な型でなければなりません。

例：

```sql
SELECT least(1, 2, toUInt8(3), 3.) result,  toTypeName(result) type;
```
```response
┌─result─┬─type────┐
│      1 │ Float64 │
└────────┴─────────┘
```

:::note
返される型は Float64 であり、UInt8 は比較のために 64 ビットに昇格する必要があります。
:::

```sql
SELECT least(['hello'], ['there'], ['world'])
```
```response
┌─least(['hello'], ['there'], ['world'])─┐
│ ['hello']                              │
└────────────────────────────────────────┘
```

```sql
SELECT least(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3))
```
```response
┌─least(toDateTime32(plus(now(), toIntervalDay(1))), toDateTime64(now(), 3))─┐
│                                                    2023-05-12 01:16:59.000 │
└────────────────────────────────────────────────────────────────────────────┘
```

:::note
返される型は DateTime64 であり、DateTime32 は比較のために 64 ビットに昇格する必要があります。
:::

## clamp {#clamp}

A と B の間で返される値を制約します。

**構文**

``` sql
clamp(value, min, max)
```

**引数**

- `value` – 入力値。
- `min` – 下限を制限します。
- `max` – 上限を制限します。

**返される値**

値が最小値より小さい場合は最小値を返し、最大値より大きい場合は最大値を返し、それ以外の場合は現在の値を返します。

例：

```sql
SELECT clamp(1, 2, 3) result,  toTypeName(result) type;
```
```response
┌─result─┬─type────┐
│      2 │ Float64 │
└────────┴─────────┘
```
