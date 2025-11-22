---
description: '行数または NULL 以外の値の個数をカウントします。'
sidebar_position: 120
slug: /sql-reference/aggregate-functions/reference/count
title: 'count'
doc_type: 'reference'
---

# count

行数または NULL ではない値の数をカウントします。

ClickHouse は `count` に対して次の構文をサポートします:

* `count(expr)` または `COUNT(DISTINCT expr)`。
* `count()` または `COUNT(*)`。`count()` 構文は ClickHouse 固有です。

**引数**

この関数は次のいずれかを受け取ります:

* パラメータなし。
* 1 つの[式](/sql-reference/syntax#expressions)。

**返り値**

* 関数がパラメータなしで呼ばれた場合、行数をカウントします。
* [式](/sql-reference/syntax#expressions) が渡された場合、その式が NULL 以外を返した回数をカウントします。式が [Nullable](../../../sql-reference/data-types/nullable.md) 型の値を返す場合でも、`count` の結果は `Nullable` にはなりません。すべての行で式が `NULL` を返した場合、関数は 0 を返します。

どちらの場合も返り値の型は [UInt64](../../../sql-reference/data-types/int-uint.md) です。

**詳細**

ClickHouse は `COUNT(DISTINCT ...)` 構文をサポートします。この構文の動作は [count&#95;distinct&#95;implementation](../../../operations/settings/settings.md#count_distinct_implementation) 設定に依存します。この設定は、操作の実行にどの [uniq*](/sql-reference/aggregate-functions/reference/uniq) 関数を使用するかを定義します。デフォルトは [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact) 関数です。

`SELECT count() FROM table` クエリは、デフォルトでは MergeTree のメタデータを使用して最適化されます。行レベルセキュリティを使用する必要がある場合は、[optimize&#95;trivial&#95;count&#95;query](/operations/settings/settings#optimize_trivial_count_query) 設定を使用してこの最適化を無効にします。

一方、`SELECT count(nullable_column) FROM table` クエリは [optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 設定を有効にすることで最適化できます。`optimize_functions_to_subcolumns = 1` の場合、関数は列全体のデータを読み取って処理する代わりに、[null](../../../sql-reference/data-types/nullable.md#finding-null) サブカラムのみを読み取ります。クエリ `SELECT count(n) FROM table` は `SELECT sum(NOT n.null) FROM table` に変換されます。

**COUNT(DISTINCT expr) のパフォーマンス向上**

`COUNT(DISTINCT expr)` クエリが遅い場合は、並列化が改善されるため [`GROUP BY`](/sql-reference/statements/select/group-by) 句の追加を検討してください。`COUNT(DISTINCT target_col)` とともに使用される対象列にインデックスを作成するために、[projection](../../../sql-reference/statements/alter/projection.md) を使用することもできます。

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

例2：

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

この例は、`count_distinct_implementation` 設定の値に応じて、`count(DISTINCT num)` の集計が `uniqExact` 関数によって行われることを示しています。
