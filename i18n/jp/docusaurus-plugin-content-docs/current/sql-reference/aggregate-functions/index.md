---
description: '集約関数に関するリファレンス'
sidebar_label: '集約関数'
sidebar_position: 33
slug: /sql-reference/aggregate-functions/
title: '集約関数'
doc_type: 'reference'
---

# 集約関数 {#aggregate-functions}

集約関数は、データベースの専門家にとって[一般的な](http://www.sql-tutorial.com/sql-aggregate-functions-sql-tutorial)方法で動作します。

ClickHouse は次の機能もサポートしています：

* 列に加えて他のパラメータも受け取る [パラメトリック集約関数](/sql-reference/aggregate-functions/parametric-functions)
* 集約関数の動作を変更する [コンビネータ](/sql-reference/aggregate-functions/combinators)

## NULL の処理 {#null-processing}

集約処理の際、すべての `NULL` 引数はスキップされます。集約に複数の引数がある場合、それらのうち 1 つでも NULL が含まれる行は無視されます。

このルールには例外があり、`RESPECT NULLS` 修飾子を伴う関数 [`first_value`](../../sql-reference/aggregate-functions/reference/first_value.md)、[`last_value`](../../sql-reference/aggregate-functions/reference/last_value.md) と、それぞれのエイリアス（`any` と `anyLast`）が該当します。たとえば、`FIRST_VALUE(b) RESPECT NULLS` のように指定します。

**例:**

次のテーブルを考えてみます:

```text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

たとえば、`y` 列の値を合計する必要があるとしましょう。

```sql
SELECT sum(y) FROM t_null_big
```

```text
┌─sum(y)─┐
│      7 │
└────────┘
```

ここで `groupArray` 関数を使用して、`y` 列から配列を作成します。

```sql
SELECT groupArray(y) FROM t_null_big
```

```text
┌─groupArray(y)─┐
│ [2,2,3]       │
└───────────────┘
```

`groupArray` は、結果の配列に `NULL` を含めません。

[COALESCE](../../sql-reference/functions/functions-for-nulls.md#coalesce) を使用して、`NULL` をユースケースに応じて意味のある値に変換できます。たとえば、`avg(COALESCE(column, 0))` は、集約時に列の値を使用し、`NULL` の場合は 0 を使用します。

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

また、NULL がスキップされる挙動を回避するために [Tuple](sql-reference/data-types/tuple.md) を使用することもできます。`NULL` 値だけを含む `Tuple` は `NULL` ではないため、集約関数はその `NULL` 値を理由にその行をスキップしません。

```sql
SELECT
    groupArray(y),
    groupArray(tuple(y)).1
FROM t_null_big;

┌─groupArray(y)─┬─tupleElement(groupArray(tuple(y)), 1)─┐
│ [2,2,3]       │ [2,NULL,2,3,NULL]                     │
└───────────────┴───────────────────────────────────────┘
```

列が集約関数の引数として使用される場合、その列に対する集約はスキップされることに注意してください。たとえば、引数なしの [`count`](../../sql-reference/aggregate-functions/reference/count.md)（`count()`）や定数引数付きのもの（`count(1)`）は、（それが引数ではないため GROUP BY 列の値に依存せずに）ブロック内のすべての行をカウントしますが、`count(column)` は `column` が NULL でない行のみの数を返します。

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

以下は、`RESPECT NULLS` を使用した first&#95;value の例です。NULL の入力値が尊重され、読み取られた最初の値が NULL かどうかに関係なく返されることがわかります。

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
