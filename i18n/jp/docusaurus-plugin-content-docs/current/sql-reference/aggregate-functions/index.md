---
slug: /sql-reference/aggregate-functions/
sidebar_label: 集約関数
sidebar_position: 33
---


# 集約関数

集約関数は、データベース専門家が期待する[通常の](http://www.sql-tutorial.com/sql-aggregate-functions-sql-tutorial)方法で動作します。

ClickHouse はまた、以下をサポートしています：

- カラムに加えて他のパラメータを受け付ける[パラメトリック集約関数](/sql-reference/aggregate-functions/parametric-functions)。
- 集約関数の動作を変更する[コンビネータ](/sql-reference/aggregate-functions/combinators)。

## NULL 処理 {#null-processing}

集約中は、すべての `NULL` 引数がスキップされます。集約に複数の引数がある場合、それらのいずれかが NULL の行は無視されます。

このルールには例外があります。`first_value`（`first` とそのエイリアス）、`last_value`（`last` とそのエイリアス）関数が `RESPECT NULLS` 修飾子の後に続く場合です。たとえば、`FIRST_VALUE(b) RESPECT NULLS` のようになります。

**例：**

次のテーブルを考えてみましょう：

``` text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴹ │
└───┴──────┘
```

`y` カラムの値を合計する必要があるとしましょう：

``` sql
SELECT sum(y) FROM t_null_big
```

```text
┌─sum(y)─┐
│      7 │
└────────┘
```

次に、`y` カラムから配列を作成するために `groupArray` 関数を使用することができます：

``` sql
SELECT groupArray(y) FROM t_null_big
```

``` text
┌─groupArray(y)─┐
│ [2,2,3]       │
└───────────────┘
```

`groupArray` は結果の配列に `NULL` を含めません。

[COALESCE](../../sql-reference/functions/functions-for-nulls.md#coalesce) を使用して NULL を意味のある値に変換できます。たとえば：`avg(COALESCE(column, 0))` は、NULL の場合は 0 を使用するか、カラムの値を集約に使います。

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

また、NULL スキップ動作を回避するために [Tuple](sql-reference/data-types/tuple.md) を使用できます。`NULL` 値のみを含む `Tuple` は NULL ではないため、その NULL 値のために集約関数はその行をスキップしません。

```sql
SELECT
    groupArray(y),
    groupArray(tuple(y)).1
FROM t_null_big;

┌─groupArray(y)─┬─tupleElement(groupArray(tuple(y)), 1)─┐
│ [2,2,3]       │ [2,NULL,2,3,NULL]                     │
└───────────────┴───────────────────────────────────────┘
```

集約関数に引数としてカラムが使用されると、集約はスキップされることに注意してください。たとえば、パラメータなしの [`count`](../../sql-reference/aggregate-functions/reference/count.md)（`count()`）または定数だけのもの（`count(1)`）は、GROUP BY カラムの値に関係なくブロック内のすべての行をカウントしますが、`count(column)` は、カラムが NULL でない行の数だけを返します。

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

ここに、`RESPECT NULLS` を使った `first_value` の例があります。NULL 入力が尊重され、最初に読み取られた値を返します、NULL であってもなくてもです。

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
