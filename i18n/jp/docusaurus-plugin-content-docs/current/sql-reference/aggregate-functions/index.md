---
slug: /sql-reference/aggregate-functions/
sidebar_label: 集約関数
sidebar_position: 33
---


# 集約関数

集約関数は、データベースエキスパートが期待する[通常](http://www.sql-tutorial.com/sql-aggregate-functions-sql-tutorial)の方法で動作します。

ClickHouseは次のこともサポートしています：

- 列に加えて他のパラメータを受け取る[パラメトリック集約関数](../../sql-reference/aggregate-functions/parametric-functions.md#aggregate_functions_parametric)。
- 集約関数の動作を変更する[コンビネータ](../../sql-reference/aggregate-functions/combinators.md#aggregate_functions_combinators)。

## NULLの処理 {#null-processing}

集約中、すべての`NULL`引数はスキップされます。集約に複数の引数がある場合、いずれかがNULLである行は無視されます。

この規則には例外があり、`RESPECT NULLS`修飾子の後に続く[`first_value`](../../sql-reference/aggregate-functions/reference/first_value.md)、[`last_value`](../../sql-reference/aggregate-functions/reference/last_value.md)およびそのエイリアス（それぞれ`any`と`anyLast`）の関数があります。例えば、`FIRST_VALUE(b) RESPECT NULLS`のようになります。

**例:**

次のテーブルを考えてみましょう：

``` text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

`y`カラムの合計を求める必要があるとしましょう：

``` sql
SELECT sum(y) FROM t_null_big
```

```text
┌─sum(y)─┐
│      7 │
└────────┘
```

次に、`y`カラムから配列を作成するために`groupArray`関数を使用できます：

``` sql
SELECT groupArray(y) FROM t_null_big
```

``` text
┌─groupArray(y)─┐
│ [2,2,3]       │
└───────────────┘
```

`groupArray`は結果の配列に`NULL`を含めません。

NULLを使用ケースに合わせた値に変更するために[COALESCE](../../sql-reference/functions/functions-for-nulls.md#coalesce)を使用できます。例えば：`avg(COALESCE(column, 0))`は、カラムの値を集約時に使用し、NULLの場合はゼロを使用します：

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

また、[Tuple](sql-reference/data-types/tuple.md)を使用してNULLのスキッピング動作を回避できます。`NULL`値のみを含む`Tuple`は`NULL`ではなく、集約関数はその`NULL`値のためにその行をスキップしません。

```sql
SELECT
    groupArray(y),
    groupArray(tuple(y)).1
FROM t_null_big;

┌─groupArray(y)─┬─tupleElement(groupArray(tuple(y)), 1)─┐
│ [2,2,3]       │ [2,NULL,2,3,NULL]                     │
└───────────────┴───────────────────────────────────────┘
```

集約関数が引数としてカラムを使用する場合、集約がスキップされることに注意してください。例えば、引数なしの[`count`](../../sql-reference/aggregate-functions/reference/count.md)（`count()`）または一定の引数（`count(1)`）は、ブロック内のすべての行をカウントします（GROUP BYカラムの値に関係なく）、一方`count(column)`は、カラムがNULLでない行の数のみを返します。

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

以下は、`RESPECT NULLS`を用いたfirst_valueの例で、NULL入力を尊重し、最初に読み取った値（NULLであっても）を返すことがわかります：

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
