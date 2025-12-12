---
description: '条件付き関数のドキュメント'
sidebar_label: '条件'
slug: /sql-reference/functions/conditional-functions
title: '条件付き関数'
doc_type: 'reference'
---

# 条件付き関数 {#conditional-functions}

## 概要 {#overview}

### 条件式の結果を直接利用する {#using-conditional-results-directly}

条件式は常に `0`、`1`、または `NULL` を返します。そのため、次のように条件式の結果をそのまま利用できます。

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

### 条件式における NULL 値 {#null-values-in-conditionals}

条件式に `NULL` 値が含まれている場合、その評価結果も `NULL` になります。

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

そのため、型が `Nullable` の場合には、クエリを慎重に記述する必要があります。

次の例は、`multiIf` に等値条件を追加していないために失敗することを示しています。

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

### CASE ステートメント {#case-statement}

ClickHouse の CASE 式は、SQL の CASE 演算子と同様の条件付きロジックを提供します。条件を評価し、最初に一致した条件に基づいて値を返します。

ClickHouse は CASE 式の 2 つの形式をサポートします:

1. `CASE WHEN ... THEN ... ELSE ... END`
   <br />
   この形式は柔軟性が高く、内部的には [multiIf](/sql-reference/functions/conditional-functions#multiIf) 関数を使って実装されています。各条件は独立して評価され、式には非定数値を含めることができます。

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

-- is translated to
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

5 rows in set. Elapsed: 0.002 sec.
```

2. `CASE <expr> WHEN <val1> THEN ... WHEN <val2> THEN ... ELSE ... END`
   <br />
   このよりコンパクトな形式は定数値の一致に最適化されており、内部的には `caseWithExpression()` を使用します。

たとえば、次のような記述は有効です:

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

-- is translated to

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

3 rows in set. Elapsed: 0.002 sec.
```

┌─number─┬─result─┐
│      0 │    100 │
│      1 │    200 │
│      2 │      0 │
└────────┴────────┘

3 行の結果。経過時間: 0.002 秒。

````sql
SELECT
    number,
    CASE number
        WHEN 0 THEN number + 1
        WHEN 1 THEN number * 10
        ELSE number
    END
FROM system.numbers
WHERE number < 3;

-- is translated to

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

3 rows in set. Elapsed: 0.001 sec.
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

-- 次のように変換されます

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

3行のセット。経過時間: 0.001秒。
````sql
SELECT
    number,
    CASE
        WHEN number = 0 THEN fromUnixTimestamp64Milli(0, 'Asia/Kolkata')
        WHEN number = 1 THEN fromUnixTimestamp64Milli(0, 'America/Los_Angeles')
        ELSE fromUnixTimestamp64Milli(0, 'UTC')
    END AS tz
FROM system.numbers
WHERE number < 3;

-- is translated to

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

3 rows in set. Elapsed: 0.011 sec.
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

-- 次のように変換されます

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

3行のセット。経過時間: 0.011秒。
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

-- is translated to

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

3 rows in set. Elapsed: 0.002 sec.
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

-- is translated to

SELECT
    number,
    multiIf(number = 0, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'Asia/Kolkata'), number = 1, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'America/Los_Angeles'), formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'UTC')) AS tz
FROM system.numbers
WHERE number < 3
```sql
clamp(value, min, max)
```

<!-- 
以下のタグ内のコンテンツは、ドキュメントフレームワークのビルド時に
system.functions から生成されたドキュメントで置き換えられます。タグの変更や削除は行わないでください。
参照: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->
```

```sql
clamp(value, min, max)
```

**Value below minimum**

```sql title=Query
SELECT clamp(5, 1, 10) AS result;
```

```response title=Response
┌─result─┐
│      5 │
└────────┘
```

**Value above maximum**

```sql title=Query
SELECT clamp(-3, 0, 7) AS result;
```

```response title=Response
┌─result─┐
│      0 │
└────────┘
```



## greatest {#greatest}

Introduced in: v1.1


Returns the greatest value among the arguments.
`NULL` arguments are ignored.

- For arrays, returns the lexicographically greatest array.
- For `DateTime` types, the result type is promoted to the largest type (e.g., `DateTime64` if mixed with `DateTime32`).

:::note Use setting `least_greatest_legacy_null_behavior` to change `NULL` behavior
Version [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) introduced a backwards-incompatible change such that `NULL` values are ignored, while previously it returned `NULL` if one of the arguments was `NULL`.
To retain the previous behavior, set setting `least_greatest_legacy_null_behavior` (default: `false`) to `true`.
:::
    

**Syntax**

```sql title=Query
SELECT clamp(15, 0, 7) AS result;
```

**Arguments**

- `x1[, x2, ...]` — One or multiple values to compare. All arguments must be of comparable types. [`Any`](/sql-reference/data-types)


**Returned value**

Returns the greatest value among the arguments, promoted to the largest compatible type. [`Any`](/sql-reference/data-types)

**Examples**

**Numeric types**

```response title=Response
┌─result─┐
│      7 │
└────────┘
```

```sql
greatest(x1[, x2, ...])
```

**Arrays**

```sql title=Query
SELECT greatest(1, 2, toUInt8(3), 3.) AS result, toTypeName(result) AS type;
-- 返される型はFloat64です。比較のためにUInt8を64ビットに昇格する必要があるためです。
```

```response title=Response
┌─result─┬─type────┐
│      3 │ Float64 │
└────────┴─────────┘
```

**DateTime types**

```sql title=Query
SELECT greatest(['hello'], ['there'], ['world']);
```

```response title=Response
┌─greatest(['hello'], ['there'], ['world'])─┐
│ ['world']                                 │
└───────────────────────────────────────────┘
```



## if {#if}

Introduced in: v1.1


Performs conditional branching.

- If the condition `cond` evaluates to a non-zero value, the function returns the result of the expression `then`.
- If `cond` evaluates to zero or NULL, the result of the `else` expression is returned.

The setting [`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) controls whether short-circuit evaluation is used.

If enabled, the `then` expression is evaluated only on rows where `cond` is true and the `else` expression where `cond` is false.

For example, with short-circuit evaluation, no division-by-zero exception is thrown when executing the following query:

```sql title=Query
SELECT greatest(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3));
-- 返される型はDateTime64です。比較のためにDateTime32を64ビットに昇格する必要があるためです。
```

`then` and `else` must be of a similar type.


**Syntax**

```response title=Response
┌─greatest(toD⋯(now(), 3))─┐
│  2025-05-28 15:50:53.000 │
└──────────────────────────┘
```

**Arguments**

- `cond` — The evaluated condition. [`UInt8`](/sql-reference/data-types/int-uint) or [`Nullable(UInt8)`](/sql-reference/data-types/nullable) or [`NULL`](/sql-reference/syntax#null)
- `then` — The expression returned if `cond` is true. - `else` — The expression returned if `cond` is false or `NULL`. 

**Returned value**

The result of either the `then` or `else` expressions, depending on condition `cond`.

**Examples**

**Example usage**

```sql
SELECT if(number = 0, 0, intDiv(42, number)) FROM numbers(10)
```

```sql
if(cond, then, else)
```



## least {#least}

Introduced in: v1.1


Returns the smallest value among the arguments.
`NULL` arguments are ignored.

- For arrays, returns the lexicographically least array.
- For DateTime types, the result type is promoted to the largest type (e.g., DateTime64 if mixed with DateTime32).

:::note Use setting `least_greatest_legacy_null_behavior` to change `NULL` behavior
Version [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) introduced a backwards-incompatible change such that `NULL` values are ignored, while previously it returned `NULL` if one of the arguments was `NULL`.
To retain the previous behavior, set setting `least_greatest_legacy_null_behavior` (default: `false`) to `true`.
:::
    

**Syntax**

```sql title=Query
SELECT if(1, 2 + 2, 2 + 6) AS res;
```

**Arguments**

- `x1[, x2, ...]` — A single value or multiple values to compare. All arguments must be of comparable types. [`Any`](/sql-reference/data-types)


**Returned value**

Returns the least value among the arguments, promoted to the largest compatible type. [`Any`](/sql-reference/data-types)

**Examples**

**Numeric types**

```response title=Response
┌─res─┐
│   4 │
└─────┘
```

```sql
least(x1[, x2, ...])
```

**Arrays**

```sql title=Query
SELECT least(1, 2, toUInt8(3), 3.) AS result, toTypeName(result) AS type;
-- 返される型はFloat64です。比較のためにUInt8を64ビットに昇格する必要があるためです。
```

```response title=Response
┌─result─┬─type────┐
│      1 │ Float64 │
└────────┴─────────┘
```

**DateTime types**

```sql title=Query
SELECT least(['hello'], ['there'], ['world']);
```

```response title=Response
┌─least(['hell⋯ ['world'])─┐
│ ['hello']                │
└──────────────────────────┘
```



## multiIf {#multiIf}

Introduced in: v1.1


Allows writing the [`CASE`](/sql-reference/operators#conditional-expression) operator more compactly in the query.
Evaluates each condition in order. For the first condition that is true (non-zero and not `NULL`), returns the corresponding branch value.
If none of the conditions are true, returns the `else` value.

Setting [`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) controls
whether short-circuit evaluation is used. If enabled, the `then_i` expression is evaluated only on rows where
`((NOT cond_1) AND ... AND (NOT cond_{i-1}) AND cond_i)` is true.

For example, with short-circuit evaluation, no division-by-zero exception is thrown when executing the following query:

```sql title=Query
SELECT least(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3));
-- 返される型はDateTime64です。比較のためにDateTime32を64ビットに昇格する必要があるためです。
```

All branch and else expressions must have a common supertype. `NULL` conditions are treated as false.
    

**Syntax**

```response title=Response
┌─least(toDate⋯(now(), 3))─┐
│  2025-05-27 15:55:20.000 │
└──────────────────────────┘
```

**Aliases**: `caseWithoutExpression`, `caseWithoutExpr`

**Arguments**

- `cond_N` — The N-th evaluated condition which controls if `then_N` is returned. [`UInt8`](/sql-reference/data-types/int-uint) or [`Nullable(UInt8)`](/sql-reference/data-types/nullable) or [`NULL`](/sql-reference/syntax#null)
- `then_N` — The result of the function when `cond_N` is true. - `else` — The result of the function if none of the conditions is true. 

**Returned value**

Returns the result of `then_N` for matching `cond_N`, otherwise returns the `else` condition.

**Examples**

**Example usage**

```sql
SELECT multiIf(number = 2, intDiv(1, number), number = 5) FROM numbers(10)
```

```sql
multiIf(cond_1, then_1, cond_2, then_2, ..., else)
```

**別名**: `caseWithoutExpression`, `caseWithoutExpr`

**引数**

* `cond_N` — `then_N` が返されるかどうかを制御する N 番目の条件。[`UInt8`](/sql-reference/data-types/int-uint) または [`Nullable(UInt8)`](/sql-reference/data-types/nullable) または [`NULL`](/sql-reference/syntax#null)
* `then_N` — `cond_N` が true の場合に関数が返す結果。`else` — いずれの条件も true でない場合に関数が返す結果。

**返される値**

一致する `cond_N` に対する `then_N` の結果を返し、それ以外の場合は `else` の結果を返します。

**例**

**使用例**

```sql title=Query
CREATE TABLE LEFT_RIGHT (left Nullable(UInt8), right Nullable(UInt8)) ENGINE = Memory;
INSERT INTO LEFT_RIGHT VALUES (NULL, 4), (1, 3), (2, 2), (3, 1), (4, NULL);

SELECT
    left,
    right,
    multiIf(left < right, 'leftの方が小さい', left > right, 'leftの方が大きい', left = right, '両方とも等しい', 'NULL値') AS result
FROM LEFT_RIGHT;
```

```response title=Response
┌─left─┬─right─┬─result──────────┐
│ ᴺᵁᴸᴸ │     4 │ Null値          │
│    1 │     3 │ leftが小さい    │
│    2 │     2 │ 両方とも等しい  │
│    3 │     1 │ leftが大きい    │
│    4 │  ᴺᵁᴸᴸ │ Null値          │
└──────┴───────┴─────────────────┘
```

{/*AUTOGENERATED_END*/ }
