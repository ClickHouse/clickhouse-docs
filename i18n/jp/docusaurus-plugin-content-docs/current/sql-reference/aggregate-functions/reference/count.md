---
slug: /sql-reference/aggregate-functions/reference/count
sidebar_position: 120
title: "count"
description: "行またはNULLでない値の数をカウントします。"
---


# count

行またはNULLでない値の数をカウントします。

ClickHouseは`count`に対して以下の構文をサポートしています：

- `count(expr)` または `COUNT(DISTINCT expr)`。
- `count()` または `COUNT(*)`。`count()`構文はClickHouse特有です。

**引数**

この関数は以下を受け取ることができます：

- 引数はゼロ個。
- 一つの[式](../../../sql-reference/syntax.md#syntax-expressions)。

**戻り値**

- 引数なしで関数が呼び出された場合、行の数をカウントします。
- [式](../../../sql-reference/syntax.md#syntax-expressions)が渡された場合、この式がNULLでない値を返した回数をカウントします。式が[Nullable](../../../sql-reference/data-types/nullable.md)-タイプの値を返す場合、`count`の結果は`Nullable`ではなくなります。全ての行で式が`NULL`を返した場合、関数は0を返します。

どちらの場合でも、返される値の型は[UInt64](../../../sql-reference/data-types/int-uint.md)です。

**詳細**

ClickHouseは`COUNT(DISTINCT ...)`構文をサポートしています。この構文の動作は、[count_distinct_implementation](../../../operations/settings/settings.md#count_distinct_implementation)設定に依存します。この設定はどの[uniq\*](../../../sql-reference/aggregate-functions/reference/uniq.md#agg_function-uniq)関数が操作を実行するために使用されるかを定義します。デフォルトは[uniqExact](../../../sql-reference/aggregate-functions/reference/uniqexact.md#agg_function-uniqexact)関数です。

`SELECT count() FROM table` クエリは、MergeTreeからのメタデータを使用してデフォルトで最適化されます。行レベルのセキュリティを使用する必要がある場合は、[optimize_trivial_count_query](../../../operations/settings/settings.md#optimize-trivial-count-query)設定を使用して最適化を無効にしてください。

ただし、`SELECT count(nullable_column) FROM table`クエリは、[optimize_functions_to_subcolumns](../../../operations/settings/settings.md#optimize-functions-to-subcolumns)設定を有効にすることで最適化できます。`optimize_functions_to_subcolumns = 1`の時、関数はカラムの全データを読み込み処理するのではなく、[null](../../../sql-reference/data-types/nullable.md#finding-null)サブカラムのみを読み取ります。クエリ`SELECT count(n) FROM table`は`SELECT sum(NOT n.null) FROM table`に変換されます。

**COUNT(DISTINCT expr)のパフォーマンス改善**

`COUNT(DISTINCT expr)`クエリが遅い場合は、並列処理が改善されるため、[`GROUP BY`](../../../sql-reference/statements/select/group-by.md)句を追加することを考慮してください。また、[プロジェクション](../../../sql-reference/statements/alter/projection.md)を使用して`COUNT(DISTINCT target_col)`に使用されるターゲットカラムにインデックスを作成することもできます。

**例**

例 1:

``` sql
SELECT count() FROM t
```

``` text
┌─count()─┐
│       5 │
└─────────┘
```

例 2:

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

この例は、`count(DISTINCT num)`が`count_distinct_implementation`設定値に従い、`uniqExact`関数によって実行されることを示しています。
