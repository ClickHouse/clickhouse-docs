---
'description': 'Aggregate Functionsのドキュメント'
'sidebar_label': '集約関数'
'sidebar_position': 33
'slug': '/sql-reference/aggregate-functions/'
'title': '集約関数'
'doc_type': 'reference'
---


# 集約関数

集約関数は、データベースの専門家が期待する[通常の](http://www.sql-tutorial.com/sql-aggregate-functions-sql-tutorial)方法で機能します。

ClickHouseは以下もサポートしています：

- [パラメトリック集約関数](/sql-reference/aggregate-functions/parametric-functions)は、カラムに加えて他のパラメータを受け取ります。
- [コンビネーター](/sql-reference/aggregate-functions/combinators)は、集約関数の動作を変更します。

## NULL 処理 {#null-processing}

集約中は、すべての `NULL` 引数はスキップされます。集約に複数の引数がある場合、それらのうちの1つ以上がNULLである行は無視されます。

このルールには例外があり、関数 [`first_value`](../../sql-reference/aggregate-functions/reference/first_value.md)、[`last_value`](../../sql-reference/aggregate-functions/reference/last_value.md) およびそれらのエイリアス（それぞれ `any` と `anyLast`）は、修飾子 `RESPECT NULLS` に続くときにこの限りではありません。例えば、`FIRST_VALUE(b) RESPECT NULLS` のようになります。

**例：**

このテーブルを考えてみてください：

```text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

`y` カラムの値を合計する必要があるとしましょう：

```sql
SELECT sum(y) FROM t_null_big
```

```text
┌─sum(y)─┐
│      7 │
└────────┘
```

今、`groupArray` 関数を使って `y` カラムから配列を作成できます：

```sql
SELECT groupArray(y) FROM t_null_big
```

```text
┌─groupArray(y)─┐
│ [2,2,3]       │
└───────────────┘
```

`groupArray` は結果の配列に `NULL` を含めません。

[COALESCE](../../sql-reference/functions/functions-for-nulls.md#coalesce) を使用して、NULLをあなたの使用ケースに合った値に変更できます。例えば：`avg(COALESCE(column, 0))` は、集約でカラムの値を使用するか、NULLの場合はゼロを使用します：

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

また、[Tuple](sql-reference/data-types/tuple.md) を使用して NULL スキップの動作を回避できます。`NULL` 値のみを含む `Tuple` は `NULL` ではないため、集約関数はその `NULL` 値のためにその行をスキップしません。

```sql
SELECT
    groupArray(y),
    groupArray(tuple(y)).1
FROM t_null_big;

┌─groupArray(y)─┬─tupleElement(groupArray(tuple(y)), 1)─┐
│ [2,2,3]       │ [2,NULL,2,3,NULL]                     │
└───────────────┴───────────────────────────────────────┘
```

カラムが集約関数の引数として使用される場合、集約はスキップされることに注意してください。例えば、引数なしの [`count`](../../sql-reference/aggregate-functions/reference/count.md)（`count()`）または定数の引数 (`count(1)`) は、ブロック内のすべての行をカウントします（GROUP BY カラムの値に依存せず、引数ではないため）、一方、`count(column)` は、カラムが NULL でない行の数のみを返します。

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

そして、ここに `RESPECT NULLS` を伴う first_value の例があります。ここでは、NULL 入力が尊重され、最初に読み取った値が NULL であっても戻ることが示されています：

```sql
SELECT
    col || '_' || ((col + 1) * 5 - 1) AS range,
    first_value(odd_or_null) AS first,
    first_value(odd_or_null) IGNORE NULLS as first_ignore_null,
    first_value(odd_or_null) RESPECT NULLS as first_respect_nulls
FROM
(
    SELECT
        intDiv(number, 5) AS col,
        if(number % 2 == 0, NULL, number) AS odd_or_null
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
