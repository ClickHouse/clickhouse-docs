---
'description': '条件付き関数のドキュメント'
'sidebar_label': '条件付き関数'
'sidebar_position': 40
'slug': '/sql-reference/functions/conditional-functions'
'title': 'Conditional Functions'
---





# 条件付き関数

## if {#if}

条件分岐を実行します。

条件 `cond`がゼロ以外の値に評価される場合、関数は式 `then`の結果を返します。 `cond`がゼロまたは `NULL`に評価される場合は、`else`式の結果が返されます。

設定 [short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation) は、ショートサーキット評価が使用されるかどうかを制御します。 有効にすると、`then`式は `cond`が `true`である行に対してのみ評価され、 `else`式は `cond`が `false`である場合に評価されます。 たとえば、ショートサーキット評価を使用すると、クエリ `SELECT if(number = 0, 0, intDiv(42, number)) FROM numbers(10)`を実行するときに、ゼロ除算の例外がスローされません。

`then`と`else`は同様の型でなければなりません。

**構文**

```sql
if(cond, then, else)
```
エイリアス: `cond ? then : else`（三項演算子）

**引数**

- `cond` – 評価される条件。 UInt8, Nullable(UInt8) または NULL。
- `then` – `condition`が真である場合に返される式。
- `else` – `condition`が偽であるかNULLである場合に返される式。

**返される値**

条件 `cond`に応じて、`then`または`else`式のいずれかの結果。

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

クエリ内で[CASE](../../sql-reference/operators/index.md#conditional-expression)演算子をよりコンパクトに記述できるようにします。

**構文**

```sql
multiIf(cond_1, then_1, cond_2, then_2, ..., else)
```

設定 [short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation) は、ショートサーキット評価が使用されるかどうかを制御します。 有効にすると、`then_i`式は、`((NOT cond_1) AND (NOT cond_2) AND ... AND (NOT cond_{i-1}) AND cond_i)`が`true`である行に対してのみ評価され、`cond_i`は、`((NOT cond_1) AND (NOT cond_2) AND ... AND (NOT cond_{i-1}))`が`true`である行に対してのみ評価されます。たとえば、ショートサーキット評価を使用すると、クエリ `SELECT multiIf(number = 2, intDiv(1, number), number = 5) FROM numbers(10)`を実行するときに、ゼロ除算の例外が発生しません。

**引数**

関数は `2N+1` のパラメータを受け付けます:
- `cond_N` — `then_N`が返されるべきかを制御するN番目の評価された条件。
- `then_N` — `cond_N`が真である場合の関数の結果。
- `else` — どの条件も真でない場合の関数の結果。

**返される値**

条件 `cond_N`に応じて、`then_N`または`else`の式のいずれかの結果。

**例**

次のテーブルを考えます。

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

## 条件結果を直接使用 {#using-conditional-results-directly}

条件は常に `0`、`1` または `NULL` になります。したがって、次のように条件結果を直接使用できます。

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

## NULL値に関する条件 {#null-values-in-conditionals}

条件に `NULL` 値が関与すると、結果も `NULL` になります。

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

したがって、タイプが `Nullable` の場合は、クエリを慎重に構築する必要があります。

次の例は、`multiIf`に等しい条件を追加できずに失敗することでこれを示しています。

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

値のリストの中で最大のものを返します。 リストのすべてのメンバーは互換性のある型でなければなりません。

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
返される型はFloat64であり、UInt8は比較のために64ビットに昇格する必要があります。
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
└─────────────────────────────────────────────────────────────────────────────┘
```

:::note
返される型はDateTime64であり、DateTime32は比較のために64ビットに昇格する必要があります。
:::

## least {#least}

値のリストの中で最小のものを返します。 リストのすべてのメンバーは互換性のある型でなければなりません。

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
返される型はFloat64であり、UInt8は比較のために64ビットに昇格する必要があります。
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
返される型はDateTime64であり、DateTime32は比較のために64ビットに昇格する必要があります。
:::

## clamp {#clamp}

戻り値をAとBの間に制約します。

**構文**

```sql
clamp(value, min, max)
```

**引数**

- `value` – 入力値。
- `min` – 下限を制限します。
- `max` – 上限を制限します。

**返される値**

値が最小値より小さい場合、最小値を返します。最大値より大きい場合は、最大値を返します。それ以外の場合は、現在の値を返します。

例:

```sql
SELECT clamp(1, 2, 3) result,  toTypeName(result) type;
```
```response
┌─result─┬─type────┐
│      2 │ Float64 │
└────────┴─────────┘
```

## CASE文 {#case-statement}

ClickHouseのCASE式は、SQLのCASE演算子に類似した条件ロジックを提供します。条件を評価し、最初に一致した条件に基づいて値を返します。

ClickHouseは2つの形式のCASEをサポートしています。

1. `CASE WHEN ... THEN ... ELSE ... END`
<br/>
この形式は完全な柔軟性を提供し、内部的には[multiIf](/sql-reference/functions/conditional-functions#multiif)関数を使用して実装されています。各条件は独立して評価され、式は非定数の値を含むことができます。

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

-- 翻訳されます
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

5件の行がセットされました。経過時間: 0.002秒。
```

2. `CASE <expr> WHEN <val1> THEN ... WHEN <val2> THEN ... ELSE ... END`
<br/>
このよりコンパクトな形式は、定数値の一致の最適化を行い、内部的に `caseWithExpression()`を使用します。

たとえば、次のように記述できます。

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

-- 翻訳されます

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

3件の行がセットされました。経過時間: 0.002秒。
```

この形式では、返す式が定数である必要はありません。

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

-- 翻訳されます

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

3件の行がセットされました。経過時間: 0.001秒。
```

### 注意点 {#caveats}

ClickHouseは、CASE式（またはその内部相当物、たとえば `multiIf`）の結果型を、条件を評価する前に決定します。これは、返す式が異なる型、たとえば異なるタイムゾーンや数値型である場合に重要です。

- 結果型は、すべてのブランチの中で最大の互換性のある型に基づいて選択されます。
- この型が選択されると、他のすべてのブランチは暗黙的にこの型にキャストされます - 実行時にそのロジックが実行されない場合でも。
- DateTime64のような型では、タイムゾーンが型シグネチャの一部であるため、驚くべき動作を引き起こす可能性があります：最初に遭遇したタイムゾーンがすべてのブランチに使用される場合があります、他のブランチが異なるタイムゾーンを指定している場合であっても。

たとえば、以下ではすべての行が最初に一致したブランチのタイムスタンプを返します。つまり、`Asia/Kolkata`です。

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

-- 翻訳されます

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

3件の行がセットされました。経過時間: 0.011秒。
```

ここで、ClickHouseは複数の `DateTime64(3, <timezone>)`の返り値の型を見ます。最初に見るものを基に共通の型を推論し、他のブランチを暗黙的にこの型にキャストします。

これは、意図したタイムゾーンのフォーマットを保持するために文字列に変換することで対処できます。

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

-- 翻訳されます

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

3件の行がセットされました。経過時間: 0.002秒。
