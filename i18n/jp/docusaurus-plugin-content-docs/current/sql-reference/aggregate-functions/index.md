---
description: '集約関数のドキュメント'
sidebar_label: '集約関数'
sidebar_position: 33
slug: /sql-reference/aggregate-functions/
title: '集約関数'
doc_type: 'reference'
---



# 集約関数

集約関数は、データベースの専門家が想定する[一般的な](http://www.sql-tutorial.com/sql-aggregate-functions-sql-tutorial)方法で動作します。

ClickHouse では、次の機能もサポートしています。

- 列に加えて追加のパラメータも受け取る [パラメトリック集約関数](/sql-reference/aggregate-functions/parametric-functions)
- 集約関数の動作を変更する [コンビネータ](/sql-reference/aggregate-functions/combinators)



## NULL処理 {#null-processing}

集約処理中、すべての`NULL`引数はスキップされます。集約関数が複数の引数を持つ場合、そのうち1つ以上がNULLである行は無視されます。

このルールには例外があり、[`first_value`](../../sql-reference/aggregate-functions/reference/first_value.md)、[`last_value`](../../sql-reference/aggregate-functions/reference/last_value.md)およびそれらのエイリアス(それぞれ`any`と`anyLast`)に`RESPECT NULLS`修飾子を付けた場合です。例:`FIRST_VALUE(b) RESPECT NULLS`

**例:**

次のテーブルを考えます:

```text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

`y`列の値を合計する必要があるとします:

```sql
SELECT sum(y) FROM t_null_big
```

```text
┌─sum(y)─┐
│      7 │
└────────┘
```

次に、`groupArray`関数を使用して`y`列から配列を作成できます:

```sql
SELECT groupArray(y) FROM t_null_big
```

```text
┌─groupArray(y)─┐
│ [2,2,3]       │
└───────────────┘
```

`groupArray`は結果の配列に`NULL`を含めません。

[COALESCE](../../sql-reference/functions/functions-for-nulls.md#coalesce)を使用して、NULLをユースケースに適した値に変換できます。例えば、`avg(COALESCE(column, 0))`は集約時に列の値を使用し、NULLの場合はゼロを使用します:

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

また、[Tuple](sql-reference/data-types/tuple.md)を使用してNULLスキップ動作を回避できます。`NULL`値のみを含む`Tuple`は`NULL`ではないため、集約関数はその`NULL`値によって行をスキップしません。

```sql
SELECT
    groupArray(y),
    groupArray(tuple(y)).1
FROM t_null_big;

┌─groupArray(y)─┬─tupleElement(groupArray(tuple(y)), 1)─┐
│ [2,2,3]       │ [2,NULL,2,3,NULL]                     │
└───────────────┴───────────────────────────────────────┘
```

列が集約関数の引数として使用される場合、集約がスキップされることに注意してください。例えば、パラメータなしの[`count`](../../sql-reference/aggregate-functions/reference/count.md)(`count()`)または定数を持つもの(`count(1)`)は、ブロック内のすべての行をカウントします(GROUP BY列の値とは無関係に、引数ではないため)が、`count(column)`は列がNULLでない行の数のみを返します。

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

以下は`RESPECT NULLS`を使用したfirst_valueの例で、NULL入力が尊重され、NULLであるかどうかに関わらず最初に読み取られた値を返すことがわかります:


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
