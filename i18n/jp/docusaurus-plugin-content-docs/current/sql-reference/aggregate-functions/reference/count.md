---
description: 'Counts the number of rows or not-NULL values.'
sidebar_position: 120
slug: '/sql-reference/aggregate-functions/reference/count'
title: 'count'
---




# count

行または非NULL値の数をカウントします。

ClickHouseは`count`のために以下の構文をサポートしています：

- `count(expr)` または `COUNT(DISTINCT expr)`。
- `count()` または `COUNT(*)`。`count()`構文はClickHouse特有のものです。

**引数**

関数は次のものを受け取ることができます：

- パラメータなし。
- 一つの [expression](/sql-reference/syntax#expressions)。

**返される値**

- パラメータなしで関数が呼び出された場合、行の数をカウントします。
- [expression](/sql-reference/syntax#expressions)が渡された場合、この式が非NULLを返した回数をカウントします。式が[Nullable](../../../sql-reference/data-types/nullable.md)-タイプの値を返す場合、`count`の結果は非`Nullable`のままです。すべての行で式が`NULL`を返した場合、関数は0を返します。

両方の場合において、返される値の型は[UInt64](../../../sql-reference/data-types/int-uint.md)です。

**詳細**

ClickHouseは`COUNT(DISTINCT ...)`構文をサポートしています。この構文の動作は[ count_distinct_implementation](../../../operations/settings/settings.md#count_distinct_implementation)設定によって異なります。これは、操作を実行するために使用される[uniq\*](/sql-reference/aggregate-functions/reference/uniq)関数を定義します。デフォルトは[uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)関数です。

`SELECT count() FROM table`クエリは、デフォルトでMergeTreeからのメタデータを使用して最適化されます。行レベルのセキュリティを使用する必要がある場合は、[optimize_trivial_count_query](/operations/settings/settings#optimize_trivial_count_query)設定を使用して最適化を無効にしてください。

ただし、`SELECT count(nullable_column) FROM table`クエリは、[optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns)設定を有効にすることで最適化できます。`optimize_functions_to_subcolumns = 1`を設定すると、関数は全カラムデータを読み込み処理するのではなく、[null](../../../sql-reference/data-types/nullable.md#finding-null)サブカラムのみを読み取ります。クエリ`SELECT count(n) FROM table`は`SELECT sum(NOT n.null) FROM table`に変換されます。

**COUNT(DISTINCT expr)のパフォーマンス改善**

`COUNT(DISTINCT expr)`クエリが遅い場合は、並列化を改善するために[`GROUP BY`](/sql-reference/statements/select/group-by)句を追加することを検討してください。また、`COUNT(DISTINCT target_col)`に使用されるターゲットカラムにインデックスを作成するために[プロジェクション](../../../sql-reference/statements/alter/projection.md)を使用できます。

**例**

例 1:

```sql
SELECT count() FROM t
```

```text
┌─count()─┐
│       5 │
└─────────┘
```

例 2:

```sql
SELECT name, value FROM system.settings WHERE name = 'count_distinct_implementation'
```

```text
┌─name──────────────────────────┬─value─────┐
│ count_distinct_implementation │ uniqExact │
└───────────────────────────────┴───────────┘
```

```sql
SELECT count(DISTINCT num) FROM t
```

```text
┌─uniqExact(num)─┐
│              3 │
└────────────────┘
```

この例では、`count(DISTINCT num)`が`count_distinct_implementation`設定値に従って`uniqExact`関数によって実行されることが示されています。
