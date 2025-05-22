---
'description': '集約関数のドキュメント'
'sidebar_label': '集約関数'
'sidebar_position': 33
'slug': '/sql-reference/aggregate-functions/'
'title': '集約関数'
---




# 集約関数

集約関数は、データベースのエキスパートが期待する[通常の](http://www.sql-tutorial.com/sql-aggregate-functions-sql-tutorial)方法で動作します。

ClickHouseは以下もサポートしています：

- [パラメトリック集約関数](/sql-reference/aggregate-functions/parametric-functions)は、カラムに加えて他のパラメータを受け取ります。
- [コンビネーター](/sql-reference/aggregate-functions/combinators)は、集約関数の動作を変更します。


## NULL処理 {#null-processing}

集約中は、すべての `NULL` 引数がスキップされます。集約に複数の引数がある場合、1つ以上の引数がNULLである行は無視されます。

このルールには例外があります。`first_value`（`any`）および `last_value`（`anyLast`）関数は、修飾子 `RESPECT NULLS` に続く場合です。例えば、`FIRST_VALUE(b) RESPECT NULLS` のようになります。

**例:**

このテーブルを考えてみましょう：

```text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

`y` カラムの合計を求めるとします：

```sql
SELECT sum(y) FROM t_null_big
```

```text
┌─sum(y)─┐
│      7 │
└────────┘
```

次に、`groupArray` 関数を使用して `y` カラムから配列を作成します：

```sql
SELECT groupArray(y) FROM t_null_big
```

```text
┌─groupArray(y)─┐
│ [2,2,3]       │
└───────────────┘
```

`groupArray` は結果の配列に `NULL` を含めません。

[COALESCE](../../sql-reference/functions/functions-for-nulls.md#coalesce) を使用して、NULL をケースに応じて意味のある値に変更できます。例えば、`avg(COALESCE(column, 0))` は、NULL の場合は 0 を使用し、カラム値を集約に使用します：

```sql
SELECT
    avg(y),
    avg(coalesce(y, 0))
FROM t_null_big
```

```text
┌─────────────avg(y)─┬─avg(coalesce(y, 0))─┐
│ 2.3333333333333335 │                 1.4 │
└────────────────────┴─────────────────────┘
```

また、[Tuple](sql-reference/data-types/tuple.md) を使用して NULL スキップの動作を回避することもできます。`NULL` のみを含む `Tuple` は NULL ではないため、その NULL 値によって集約関数はその行をスキップしません。

```sql
SELECT
    groupArray(y),
    groupArray(tuple(y)).1
FROM t_null_big;

┌─groupArray(y)─┬─tupleElement(groupArray(tuple(y)), 1)─┐
│ [2,2,3]       │ [2,NULL,2,3,NULL]                     │
└───────────────┴───────────────────────────────────────┘
```

集約関数に引数としてカラムが使用されると、集約がスキップされることに注意してください。例えば、引数なしの [`count`](../../sql-reference/aggregate-functions/reference/count.md) （`count()`）や定数のもの（`count(1)`）は、ブロック内のすべての行をカウントします（GROUP BY カラムの値にかかわらず、引数ではないため）。一方で、`count(column)` は、カラムがNULLでない行の数のみを返します。

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

次に、`RESPECT NULLS` を使用した first_value の例を示します。ここでは、NULL 入力が尊重され、最初に読み取られた値が NULL であっても返されることを示しています：

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
