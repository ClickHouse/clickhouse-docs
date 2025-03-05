---
slug: /sql-reference/functions/conditional-functions
sidebar_position: 40
sidebar_label: Conditional
---


# 条件付き関数

## if {#if}

条件分岐を実行します。

条件 `cond` が非ゼロの値を評価した場合、関数は `then` の式の結果を返します。`cond` がゼロまたは `NULL` を評価した場合、`else` の式の結果が返されます。

設定項目 [short_circuit_function_evaluation](../../operations/settings/settings.md#short-circuit-function-evaluation) は、ショートサーキット評価が使用されるかどうかを制御します。有効にすると、`then` の式は `cond` が `true` の行のみで評価され、`else` の式は `cond` が `false` の行で評価されます。たとえば、ショートサーキット評価を使用すると、`SELECT if(number = 0, 0, intDiv(42, number)) FROM numbers(10)` というクエリを実行してもゼロによる除算例外は発生しません。

`then` と `else` は同じタイプである必要があります。

**構文**

``` sql
if(cond, then, else)
```
エイリアス: `cond ? then : else` (三項演算子)

**引数**

- `cond` – 評価される条件。UInt8、Nullable(UInt8) または NULL。
- `then` – 条件が真の場合に返される式。
- `else` – 条件が偽または NULL の場合に返される式。

**返される値**

条件 `cond` に応じて、`then` または `else` のいずれかの式の結果。

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

クエリ内で [CASE](../../sql-reference/operators/index.md#conditional-expression) 演算子をより簡潔に記述できるようにします。

**構文**

``` sql
multiIf(cond_1, then_1, cond_2, then_2, ..., else)
```

設定項目 [short_circuit_function_evaluation](../../operations/settings/settings.md#short-circuit-function-evaluation) は、ショートサーキット評価が使用されるかどうかを制御します。有効にすると、`then_i` の式は、`((NOT cond_1) AND (NOT cond_2) AND ... AND (NOT cond_{i-1}) AND cond_i)` が `true` の行のみで評価され、`cond_i` は `((NOT cond_1) AND (NOT cond_2) AND ... AND (NOT cond_{i-1}))` が `true` の行のみで評価されます。たとえば、ショートサーキット評価を使用すると、`SELECT multiIf(number = 2, intDiv(1, number), number = 5) FROM numbers(10)` というクエリを実行してもゼロによる除算例外は発生しません。

**引数**

関数は `2N+1` のパラメータを受け取ります。
- `cond_N` — N 番目の評価される条件で、`then_N` が返されるかどうかを制御します。
- `then_N` — `cond_N` が真であるときの関数の結果。
- `else` — いずれの条件も真でない場合の関数の結果。

**返される値**

条件 `cond_N` に応じて、`then_N` または `else` のいずれかの式の結果。

**例**

次のテーブルを仮定します：

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

条件は常に `0`、`1` または `NULL` に評価されます。したがって、次のように条件の結果を直接使用できます：

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

条件に `NULL` 値が含まれる場合、結果も `NULL` になります。

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

したがって、型が `Nullable` である場合は、クエリを注意深く構築する必要があります。

次の例は、`multiIf` に等しい条件を追加できないことを示しています。

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

値のリストの中で最大のものを返します。すべてのリストメンバーは比較可能な型でなければなりません。

例:

```sql
SELECT greatest(1, 2, toUInt8(3), 3.) result,  toTypeName(result) type;
```
```response
┌─result─┬─type────┐
│      3 │ Float64 │
└────────┴─────────┘
```

:::note
返される型は Float64 です。UInt8 は比較のために 64 ビットに昇格される必要があります。
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
└──---──────────────────────────────────────────────────────────────────────────┘
```

:::note
返される型は DateTime64 です。DateTime32 は比較のために 64 ビットに昇格される必要があります。
:::

## least {#least}

値のリストの中で最小のものを返します。すべてのリストメンバーは比較可能な型でなければなりません。

例:

```sql
SELECT least(1, 2, toUInt8(3), 3.) result,  toTypeName(result) type;
```
```response
┌─result─┬─type────┐
│      1 │ Float64 │
└────────┴─────────┘
```

:::note
返される型は Float64 です。UInt8 は比較のために 64 ビットに昇格される必要があります。
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
返される型は DateTime64 です。DateTime32 は比較のために 64 ビットに昇格される必要があります。
:::

## clamp {#clamp}

返される値を A と B の間に制約します。

**構文**

``` sql
clamp(value, min, max)
```

**引数**

- `value` – 入力値。
- `min` – 下限を制約します。
- `max` – 上限を制約します。

**返される値**

値が最小値未満の場合は最小値を返し、最大値を超える場合は最大値を返し、それ以外の場合は現在の値を返します。

例:

```sql
SELECT clamp(1, 2, 3) result,  toTypeName(result) type;
```
```response
┌─result─┬─type────┐
│      2 │ Float64 │
└────────┴─────────┘
```
