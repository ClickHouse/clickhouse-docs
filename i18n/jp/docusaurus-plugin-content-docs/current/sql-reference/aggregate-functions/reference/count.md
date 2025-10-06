---
'description': '行またはNOT NULLの値の数をカウントします。'
'sidebar_position': 120
'slug': '/sql-reference/aggregate-functions/reference/count'
'title': 'count'
'doc_type': 'reference'
---


# count

行または非NULL値の数をカウントします。

ClickHouseは、`count`の以下の構文をサポートしています：

- `count(expr)` または `COUNT(DISTINCT expr)`。
- `count()` または `COUNT(*)`。`count()` 構文はClickHouse特有のものです。

**引数**

この関数は次のものを取ります：

- 引数なし。
- 一つの [expression](/sql-reference/syntax#expressions)。

**返される値**

- 引数なしで関数が呼び出されると、行の数をカウントします。
- [expression](/sql-reference/syntax#expressions) が渡されると、その式が非NULLを返した回数をカウントします。式が [Nullable](../../../sql-reference/data-types/nullable.md)-型の値を返す場合、`count`の結果はNullableではなくなります。式が全ての行に対して`NULL`を返した場合、関数は0を返します。

どちらの場合も、返される値の型は [UInt64](../../../sql-reference/data-types/int-uint.md) です。

**詳細**

ClickHouseは `COUNT(DISTINCT ...)` 構文をサポートしています。この構文の動作は [count_distinct_implementation](../../../operations/settings/settings.md#count_distinct_implementation) 設定によって異なります。この設定は、操作を実行するためにどの [uniq\*](/sql-reference/aggregate-functions/reference/uniq) 関数が使用されるかを定義します。デフォルトは [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact) 関数です。

`SELECT count() FROM table` クエリは、MergeTreeからのメタデータを使用してデフォルトで最適化されています。行レベルのセキュリティを使用する必要がある場合は、[optimize_trivial_count_query](/operations/settings/settings#optimize_trivial_count_query) 設定を使用して最適化を無効にします。

ただし、`SELECT count(nullable_column) FROM table` クエリは [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 設定を有効にすることで最適化できます。`optimize_functions_to_subcolumns = 1` の場合、関数は全カラムデータを読み込むのではなく、[null](../../../sql-reference/data-types/nullable.md#finding-null) サブカラムのみを読み取ります。クエリ `SELECT count(n) FROM table` は `SELECT sum(NOT n.null) FROM table` に変換されます。

**COUNT(DISTINCT expr)のパフォーマンスを向上させる**

`COUNT(DISTINCT expr)` クエリが遅い場合、[`GROUP BY`](/sql-reference/statements/select/group-by) 句を追加することを検討してください。これにより並列実行の効果が向上します。また、`COUNT(DISTINCT target_col)` に使用されるターゲットカラムにインデックスを作成するために [projection](../../../sql-reference/statements/alter/projection.md) を使用することもできます。

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
