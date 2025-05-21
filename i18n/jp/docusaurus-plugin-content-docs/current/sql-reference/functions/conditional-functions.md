---
description: '条件付き関数に関するドキュメント'
sidebar_label: '条件付き'
sidebar_position: 40
slug: /sql-reference/functions/conditional-functions
title: '条件付き関数'
---


# 条件付き関数

## if {#if}

条件分岐を実行します。

条件 `cond` が非ゼロの値に評価されると、関数は `then` の式の結果を返します。 `cond` がゼロまたは `NULL` に評価される場合は、`else` の式の結果が返されます。

設定 [short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation) により、ショートサーキット評価が使用されるかどうかを制御します。 有効にされている場合、`then` の式は `cond` が `true` の行に対してのみ評価され、`else` の式は `cond` が `false` の行に対して評価されます。 たとえば、ショートサーキット評価を使用すると、`SELECT if(number = 0, 0, intDiv(42, number)) FROM numbers(10)` のクエリを実行するときにゼロ除算例外がスローされません。

`then` と `else` は同じタイプである必要があります。

**構文**

```sql
if(cond, then, else)
```
エイリアス: `cond ? then : else`（三項演算子）

**引数**

- `cond` – 評価される条件。 UInt8、Nullable(UInt8)、または NULL。
- `then` – `condition` が true の場合に返される式。
- `else` – `condition` が false または NULL の場合に返される式。

**返される値**

条件 `cond` に応じて、`then` または `else` のいずれかの式の結果。

**例**

```sql
SELECT if(1, plus(2, 2), plus(2, 6));
```

結果:

```text
┌─plus(2, 2)─┐
│          4 │
└────────────┘
```

## multiIf {#multiif}

クエリ内で [CASE](../../sql-reference/operators/index.md#conditional-expression) 演算子をより簡潔に記述できます。

**構文**

```sql
multiIf(cond_1, then_1, cond_2, then_2, ..., else)
```

設定 [short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation) により、ショートサーキット評価が使用されるかどうかを制御します。 有効にされている場合、`then_i` の式は `((NOT cond_1) AND (NOT cond_2) AND ... AND (NOT cond_{i-1}) AND cond_i)` が `true` の行でのみ評価され、`cond_i` は `((NOT cond_1) AND (NOT cond_2) AND ... AND (NOT cond_{i-1}))` が `true` の行でのみ評価されます。 たとえば、ショートサーキット評価を使用すると、`SELECT multiIf(number = 2, intDiv(1, number), number = 5) FROM numbers(10)` のクエリを実行する際にゼロ除算例外がスローされません。

**引数**

関数は `2N+1` のパラメータを受け入れます:
- `cond_N` — `then_N` が返されるかどうかを制御する N 番目の評価条件。
- `then_N` — `cond_N` が true の場合の関数の結果。
- `else` — いずれの条件も true でない場合の関数の結果。

**返される値**

条件 `cond_N` に応じて、`then_N` または `else` のいずれかの式の結果。

**例**

次のテーブルを仮定します:

```text
┌─left─┬─right─┐
│ ᴺᵁᴸᴸ │     4 │
│    1 │     3 │
│    2 │     2 │
│    3 │     1 │
│    4 │  ᴺᵁᴸᴸ │
└──────┴───────┘
```

```sql
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

条件は常に `0`、`1`、または `NULL` になります。 したがって、以下のように条件の結果を直接使用できます：

```sql
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

## NULL 値と条件 {#null-values-in-conditionals}

条件に `NULL` 値が含まれると、結果も `NULL` になります。

```sql
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

次の例は、`multiIf` に等しい条件を追加することに失敗することを示しています。

```sql
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

値のリストの中で最大値を返します。リストのすべてのメンバーは比較可能なタイプである必要があります。

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
返される型は Float64 であり、UInt8 は比較のために 64 ビットに昇格される必要があります。
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
返される型は DateTime64 であり、DateTime32 は比較のために 64 ビットに昇格される必要があります。
:::

## least {#least}

値のリストの中で最小値を返します。リストのすべてのメンバーは比較可能なタイプである必要があります。

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
返される型は Float64 であり、UInt8 は比較のために 64 ビットに昇格される必要があります。
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
返される型は DateTime64 であり、DateTime32 は比較のために 64 ビットに昇格される必要があります。
:::

## clamp {#clamp}

返される値を A と B の間に制限します。

**構文**

```sql
clamp(value, min, max)
```

**引数**

- `value` – 入力値。
- `min` – 下限を制限します。
- `max` – 上限を制限します。

**返される値**

値が最小値未満の場合は最小値を返し、最大値を超える場合は最大値を返します。それ以外の場合は現在の値を返します。

例:

```sql
SELECT clamp(1, 2, 3) result,  toTypeName(result) type;
```
```response
┌─result─┬─type────┐
│      2 │ Float64 │
└────────┴─────────┘
```

## CASE ステートメント {#case-statement}

ClickHouse の CASE 式は、SQL CASE 演算子に似た条件論理を提供します。 条件を評価し、最初に一致した条件に基づいて値を返します。

ClickHouse は、2 つの形式の CASE をサポートしています：

1. `CASE WHEN ... THEN ... ELSE ... END`
<br/>
この形式は完全な柔軟性を提供し、内部的には [multiIf](/sql-reference/functions/conditional-functions#multiif) 関数を使用して実装されています。 各条件は独立して評価され、式には定数以外の値を含めることができます。

```sql
SELECT
    number,
    CASE
        WHEN number % 2 = 0 THEN number + 1
        WHEN number % 2 = 1 THEN number * 10
        ELSE number
    END AS result
FROM system.numbers
WHERE number < 5;

-- 次のように翻訳されます
SELECT
    number,
    multiIf((number % 2) = 0, number + 1, (number % 2) = 1, number * 10, number) AS result
FROM system.numbers
WHERE number < 5

┌─number─┬─result─┐
│      0 │      1 │
│      1 │     10 │
│      2 │      3 │
│      3 │     30 │
│      4 │      5 │
└────────┴────────┘

5 行のセット。 経過時間: 0.002 秒。
```

2. `CASE <expr> WHEN <val1> THEN ... WHEN <val2> THEN ... ELSE ... END`
<br/>
このよりコンパクトな形式は定数値の一致に最適化されており、内部で `caseWithExpression()` を使用します。

例えば、次のように記述できます：

```sql
SELECT
    number,
    CASE number
        WHEN 0 THEN 100
        WHEN 1 THEN 200
        ELSE 0
    END AS result
FROM system.numbers
WHERE number < 3;

-- 次のように翻訳されます

SELECT
    number,
    caseWithExpression(number, 0, 100, 1, 200, 0) AS result
FROM system.numbers
WHERE number < 3

┌─number─┬─result─┐
│      0 │    100 │
│      1 │    200 │
│      2 │      0 │
└────────┴────────┘

3 行のセット。 経過時間: 0.002 秒。
```

この形式では、戻り値の式が定数である必要はありません。

```sql
SELECT
    number,
    CASE number
        WHEN 0 THEN number + 1
        WHEN 1 THEN number * 10
        ELSE number
    END
FROM system.numbers
WHERE number < 3;

-- 次のように翻訳されます

SELECT
    number,
    caseWithExpression(number, 0, number + 1, 1, number * 10, number)
FROM system.numbers
WHERE number < 3

┌─number─┬─caseWithExpr⋯0), number)─┐
│      0 │                        1 │
│      1 │                       10 │
│      2 │                        2 │
└────────┴──────────────────────────┘

3 行のセット。 経過時間: 0.001 秒。
```

### 注意点 {#caveats}

ClickHouse は CASE 式の結果タイプ（またはその内部の同等のもの、たとえば `multiIf`）を、条件を評価する前に決定します。 これは、返される式の型が異なる場合、たとえば異なるタイムゾーンや数値型の時に重要です。

- 結果型は、すべてのブランチの中で最も大きい互換性のある型に基づいて選択されます。
- 一度この型が選択されると、他のブランチは暗黙的にこの型にキャストされます - 実行時にそのロジックが決して実行されない場合でも。
- DateTime64 のような型では、タイムゾーンが型のシグネチャの一部なので、驚くべき動作が発生する可能性があります。最初に出会ったタイムゾーンがすべてのブランチで使用される場合があり、他のブランチが異なるタイムゾーンを指定している場合でも同様です。

例えば、以下のようにすべての行が最初に一致したブランチのタイムゾーンでタイムスタンプを返します。すなわち `Asia/Kolkata` です。

```sql
SELECT
    number,
    CASE
        WHEN number = 0 THEN fromUnixTimestamp64Milli(0, 'Asia/Kolkata')
        WHEN number = 1 THEN fromUnixTimestamp64Milli(0, 'America/Los_Angeles')
        ELSE fromUnixTimestamp64Milli(0, 'UTC')
    END AS tz
FROM system.numbers
WHERE number < 3;

-- 次のように翻訳されます

SELECT
    number,
    multiIf(number = 0, fromUnixTimestamp64Milli(0, 'Asia/Kolkata'), number = 1, fromUnixTimestamp64Milli(0, 'America/Los_Angeles'), fromUnixTimestamp64Milli(0, 'UTC')) AS tz
FROM system.numbers
WHERE number < 3

┌─number─┬──────────────────────tz─┐
│      0 │ 1970-01-01 05:30:00.000 │
│      1 │ 1970-01-01 05:30:00.000 │
│      2 │ 1970-01-01 05:30:00.000 │
└────────┴─────────────────────────┘

3 行のセット。 経過時間: 0.011 秒。
```

ここで、ClickHouse は複数の `DateTime64(3, <timezone>)` 戻り値の型を確認します。最初に確認した型を `DateTime64(3, 'Asia/Kolkata'` として共通タイプと推測し、他のブランチをこの型に暗黙的にキャストします。

これは、意図したタイムゾーンの形式を保持するために文字列に変換することによって対処できます：

```sql
SELECT
    number,
    multiIf(
        number = 0, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'Asia/Kolkata'),
        number = 1, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'America/Los_Angeles'),
        formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'UTC')
    ) AS tz
FROM system.numbers
WHERE number < 3;

-- 次のように翻訳されます

SELECT
    number,
    multiIf(number = 0, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'Asia/Kolkata'), number = 1, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'America/Los_Angeles'), formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'UTC')) AS tz
FROM system.numbers
WHERE number < 3

┌─number─┬─tz──────────────────┐
│      0 │ 1970-01-01 05:30:00 │
│      1 │ 1969-12-31 16:00:00 │
│      2 │ 1970-01-01 00:00:00 │
└────────┴─────────────────────┘

3 行のセット。 経過時間: 0.002 秒。
```
