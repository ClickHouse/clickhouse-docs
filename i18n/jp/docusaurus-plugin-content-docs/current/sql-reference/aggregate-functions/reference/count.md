---
slug: /sql-reference/aggregate-functions/reference/count
sidebar_position: 120
title: "count"
description: "行または非NULL値の数をカウントします。"
---


# count

行または非NULL値の数をカウントします。

ClickHouseは`count`に対して以下の構文をサポートしています：

- `count(expr)` または `COUNT(DISTINCT expr)`。
- `count()` または `COUNT(*)`。`count()`の構文はClickHouse特有です。

**引数**

この関数は以下を受け取ることができます：

- ゼロ個のパラメータ。
- 一つの [式](/sql-reference/syntax#expressions)。

**返される値**

- パラメータなしで関数が呼ばれた場合、行の数をカウントします。
- [式](/sql-reference/syntax#expressions)が渡された場合、この式が何回非NULLを返したかをカウントします。式が[Nullable](../../../sql-reference/data-types/nullable.md)-タイプの値を返す場合、`count`の結果は非`Nullable`のままです。式が全ての行に対して`NULL`を返した場合、関数は0を返します。

どちらの場合も、返される値の型は[UInt64](../../../sql-reference/data-types/int-uint.md)です。

**詳細**

ClickHouseは`COUNT(DISTINCT ...)`構文をサポートしています。この構文の動作は、[count_distinct_implementation](../../../operations/settings/settings.md#count_distinct_implementation)設定に依存します。これは、操作を実行するために使用される[uniq\*](/sql-reference/aggregate-functions/reference/uniq)関数を定義します。デフォルトは[uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)関数です。

`SELECT count() FROM table` クエリは、通常、MergeTreeからのメタデータを使用して最適化されています。行レベルのセキュリティを使用する必要がある場合は、[optimize_trivial_count_query](/operations/settings/settings#optimize_trivial_count_query)設定を使用して最適化を無効にします。

ただし、`SELECT count(nullable_column) FROM table` クエリは、[optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns)設定を有効にすることで最適化できます。`optimize_functions_to_subcolumns = 1`の設定では、関数は列全体のデータを読み取るのではなく、[null](../../../sql-reference/data-types/nullable.md#finding-null)サブカラムのみを読み取ります。クエリ`SELECT count(n) FROM table`は`SELECT sum(NOT n.null) FROM table`に変換されます。

**COUNT(DISTINCT expr)のパフォーマンス向上**

`COUNT(DISTINCT expr)`クエリが遅い場合は[`GROUP BY`](/sql-reference/statements/select/group-by)句を追加することを検討してください。これにより並列化が改善されます。また、[プロジェクション](../../../sql-reference/statements/alter/projection.md)を使用して、`COUNT(DISTINCT target_col)`で使用されるターゲットカラムにインデックスを作成することもできます。

**例**

例1:

``` sql
SELECT count() FROM t
```

``` text
┌─count()─┐
│       5 │
└─────────┘
```

例2:

``` sql
SELECT name, value FROM system.settings WHERE name = 'count_distinct_implementation'
```

``` text
┌─name──────────────────────────┬─value─────┐
│ count_distinct_implementation │ uniqExact │
└───────────────────────────────┴───────────┘
```

``` sql
SELECT count(DISTINCT num) FROM t
```

``` text
┌─uniqExact(num)─┐
│              3 │
└────────────────┘
```

この例は、`count(DISTINCT num)`が`count_distinct_implementation`設定値に従って`uniqExact`関数によって実行されることを示しています。
