---
description: '行数またはNULLでない値の数をカウントします。'
sidebar_position: 120
slug: /sql-reference/aggregate-functions/reference/count
title: 'count'
---


# count

行数またはNULLでない値の数をカウントします。

ClickHouse は `count` に対して以下の構文をサポートしています。

- `count(expr)` または `COUNT(DISTINCT expr)`。
- `count()` または `COUNT(*)`。`count()` 構文は ClickHouse 固有のものです。

**引数**

この関数は次の引数を取ることができます：

- ゼロ個のパラメータ。
- 一つの [式](/sql-reference/syntax#expressions)。

**戻り値**

- パラメータなしで関数が呼び出された場合、行数をカウントします。
- [式](/sql-reference/syntax#expressions) が渡された場合、その式が何回非NULLを返したかをカウントします。式が [Nullable](../../../sql-reference/data-types/nullable.md) 型の値を返す場合、`count` の結果は非 `Nullable` のままとなります。式がすべての行で `NULL` を返した場合、関数は 0 を返します。

いずれの場合も、戻り値の型は [UInt64](../../../sql-reference/data-types/int-uint.md) です。

**詳細**

ClickHouse は `COUNT(DISTINCT ...)` 構文をサポートしています。この構造の動作は [count_distinct_implementation](../../../operations/settings/settings.md#count_distinct_implementation) 設定に依存します。これによって、どの [uniq\*](/sql-reference/aggregate-functions/reference/uniq) 関数が操作を実行するために使用されるかが定義されます。デフォルトは [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact) 関数です。

`SELECT count() FROM table` クエリは、MergeTree からのメタデータを使用してデフォルトで最適化されます。行レベルのセキュリティを使用する必要がある場合は、[optimize_trivial_count_query](/operations/settings/settings#optimize_trivial_count_query) 設定を使用して最適化を無効にしてください。

ただし、`SELECT count(nullable_column) FROM table` クエリは、[optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 設定を有効にすることで最適化できます。`optimize_functions_to_subcolumns = 1` の場合、この関数は全カラムデータを読み取って処理するのではなく、[null](../../../sql-reference/data-types/nullable.md#finding-null) サブカラムのみを読み込みます。クエリ `SELECT count(n) FROM table` は `SELECT sum(NOT n.null) FROM table` に変換されます。

**COUNT(DISTINCT expr) のパフォーマンス改善**

`COUNT(DISTINCT expr)` クエリが遅い場合は、`GROUP BY` [/sql-reference/statements/select/group-by] 句を追加することを検討してください。これにより、並列処理が改善されます。また、ターゲットカラムにインデックスを作成するために [プロジェクション](../../../sql-reference/statements/alter/projection.md) を使用することもできます。

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

この例は、`count(DISTINCT num)` が `count_distinct_implementation` 設定値に従って `uniqExact` 関数によって実行されることを示しています。
