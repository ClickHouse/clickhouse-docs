---
slug: /sql-reference/aggregate-functions/
sidebar_label: 集約関数
sidebar_position: 33
---

# 集約関数

集約関数は、データベースの専門家が期待する[通常の](http://www.sql-tutorial.com/sql-aggregate-functions-sql-tutorial)方法で動作します。

ClickHouseは以下もサポートしています：

- 他のパラメーターを受け入れる[パラメトリック集約関数](../../sql-reference/aggregate-functions/parametric-functions.md#aggregate_functions_parametric)。
- 集約関数の動作を変更する[コンビネーター](../../sql-reference/aggregate-functions/combinators.md#aggregate_functions_combinators)。

## NULL処理 {#null-processing}

集約中に、すべての `NULL` 引数はスキップされます。集約に複数の引数がある場合、いずれかの引数がNULLである行は無視されます。

このルールには例外があり、それは修飾子 `RESPECT NULLS` に続く関数 [`first_value`](../../sql-reference/aggregate-functions/reference/first_value.md)、[`last_value`](../../sql-reference/aggregate-functions/reference/last_value.md) およびそれらのエイリアス（それぞれ `any` および `anyLast`）です。例えば、`FIRST_VALUE(b) RESPECT NULLS`。

**例:**

以下のテーブルを考えます：

``` text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

`y` カラムの合計値を求めるとしましょう：

``` sql
SELECT sum(y) FROM t_null_big
```

```text
┌─sum(y)─┐
│      7 │
└────────┘
```

次に、`y` カラムから配列を作成するために `groupArray` 関数を使用できます：

``` sql
SELECT groupArray(y) FROM t_null_big
```

``` text
┌─groupArray(y)─┐
│ [2,2,3]       │
└───────────────┘
```

`groupArray` は結果の配列に `NULL` を含めません。

[COALESCE](../../sql-reference/functions/functions-for-nulls.md#coalesce) を使用して、NULLをユースケースに合った値に変更することもできます。たとえば：`avg(COALESCE(column, 0))` は、NULLの場合は0を使用し、そうでなければカラムの値を集約に使用します：

``` sql
SELECT
    avg(y),
    avg(coalesce(y, 0))
FROM t_null_big
```

``` text
┌─────────────avg(y)─┬─avg(coalesce(y, 0))─┐
│ 2.3333333333333335 │                 1.4 │
└────────────────────┴─────────────────────┘
```

また、NULLスキップの動作を回避するために[タプル](/sql-reference/data-types/tuple.md)を使用することもできます。`NULL` のみを含む `Tuple` は `NULL` ではないため、その `NULL` 値のために集約関数がその行をスキップすることはありません。

```sql
SELECT
    groupArray(y),
    groupArray(tuple(y)).1
FROM t_null_big;

┌─groupArray(y)─┬─tupleElement(groupArray(tuple(y)), 1)─┐
│ [2,2,3]       │ [2,NULL,2,3,NULL]                     │
└───────────────┴───────────────────────────────────────┘
```

集約関数に引数としてカラムが使用されると、集約はスキップされることに注意してください。たとえば、パラメーターなしの[`count`](../../sql-reference/aggregate-functions/reference/count.md)（`count()`）や定数のもの（`count(1)`）は、ブロック内のすべての行をカウントします（これは引数ではないため、GROUP BY カラムの値に依存しません）が、`count(column)`はカラムがNULLでない行の数のみを返します。

```sql
SELECT
    v,
    count(1),
    count(v)
FROM
(
    SELECT if(number < 10, NULL, number % 3) AS v
    FROM numbers(15)
)
GROUP BY v

┌────v─┬─count()─┬─count(v)─┐
│ ᴺᵁᴸᴸ │      10 │        0 │
│    0 │       1 │        1 │
│    1 │       2 │        2 │
│    2 │       2 │        2 │
└──────┴─────────┴──────────┘
```

ここに、`RESPECT NULLS` を使用した `first_value` の例があります。NULL入力が尊重され、最初に読み込まれた値（NULLであるかどうかにかかわらず）を返すことがわかります：

```sql
SELECT
    col || '_' || ((col + 1) * 5 - 1) as range,
    first_value(odd_or_null) as first,
    first_value(odd_or_null) IGNORE NULLS as first_ignore_null,
    first_value(odd_or_null) RESPECT NULLS as first_respect_nulls
FROM
(
    SELECT
        intDiv(number, 5) AS col,
        if(number % 2 == 0, NULL, number) as odd_or_null
    FROM numbers(15)
)
GROUP BY col
ORDER BY col

┌─range─┬─first─┬─first_ignore_null─┬─first_respect_nulls─┐
│ 0_4   │     1 │                 1 │                ᴺᵁᴸᴸ │
│ 1_9   │     5 │                 5 │                   5 │
│ 2_14  │    11 │                11 │                ᴺᵁᴸᴸ │
└───────┴───────┴───────────────────┴─────────────────────┘
```
