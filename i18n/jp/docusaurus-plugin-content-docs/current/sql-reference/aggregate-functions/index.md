description: '集約関数に関する文書'
sidebar_label: '集約関数'
sidebar_position: 33
slug: /sql-reference/aggregate-functions/
title: '集約関数'
```


# 集約関数

集約関数は、データベースの専門家が期待するように [通常](http://www.sql-tutorial.com/sql-aggregate-functions-sql-tutorial) の方法で動作します。

ClickHouse はまた、次の機能もサポートしています：

- 他のパラメータをカラムに加えて受け入れる [パラメトリック集約関数](/sql-reference/aggregate-functions/parametric-functions)
- 集約関数の動作を変更する [コンビネータ](/sql-reference/aggregate-functions/combinators)

## NULL 処理 {#null-processing}

集約中に、すべての `NULL` 引数はスキップされます。集約に複数の引数がある場合、1つ以上の引数が NULL である行は無視されます。

このルールには例外があります。`RESPECT NULLS` 修飾子に続く [`first_value`](../../sql-reference/aggregate-functions/reference/first_value.md)、 [`last_value`](../../sql-reference/aggregate-functions/reference/last_value.md) およびそれらのエイリアス（それぞれ `any` と `anyLast`）です。たとえば、`FIRST_VALUE(b) RESPECT NULLS` のように使用します。

**例：**

次のテーブルを考えてみましょう：

```text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

`y` カラムの値を合計したいとします：

```sql
SELECT sum(y) FROM t_null_big
```

```text
┌─sum(y)─┐
│      7 │
└────────┘
```

次に、`groupArray` 関数を使用して `y` カラムから配列を作成できます：

```sql
SELECT groupArray(y) FROM t_null_big
```

```text
┌─groupArray(y)─┐
│ [2,2,3]       │
└───────────────┘
```

`groupArray` は、結果の配列に `NULL` を含めません。

[COALESCE](../../sql-reference/functions/functions-for-nulls.md#coalesce) を使用して、NULL を使用ケースに適した値に変更できます。たとえば、`avg(COALESCE(column, 0))` は、カラムの値を集約に使用するか、NULL の場合は 0 を使用します：

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

また、[Tuple](sql-reference/data-types/tuple.md) を使用して NULL スキッピングの動作を回避することもできます。`NULL` のみを含む `Tuple` は `NULL` ではないため、集約関数はその `NULL` 値のために行をスキップしません。

```sql
SELECT
    groupArray(y),
    groupArray(tuple(y)).1
FROM t_null_big;

┌─groupArray(y)─┬─tupleElement(groupArray(tuple(y)), 1)─┐
│ [2,2,3]       │ [2,NULL,2,3,NULL]                     │
└───────────────┴───────────────────────────────────────┘
```

カラムが集約された関数の引数として使用される場合、集約はスキップされることに注意してください。たとえば、引数のない [`count`](../../sql-reference/aggregate-functions/reference/count.md) （`count()`）や定数のもの（`count(1)`）はブロック内のすべての行をカウントします（GROUP BY カラムの値には依存しません）が、`count(column)` は、カラムが NULL でない行の数のみを返します。

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

ここでは、`RESPECT NULLS` を使用した `first_value` の例を示します。NULL 入力が尊重され、最初に読み取った値が返されることがわかります。NULL であるかどうかにかかわらず：

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
