---
'description': 'WHERE 句のドキュメント'
'sidebar_label': 'WHERE'
'slug': '/sql-reference/statements/select/where'
'title': 'WHERE 句'
'doc_type': 'reference'
---


# WHERE句

`WHERE` 句は、`SELECT` の [FROM](../../../sql-reference/statements/select/from.md) 句からのデータをフィルタリングするために使用されます。

`WHERE` 句がある場合、それは `UInt8` 型の式を含まなければなりません。通常、これは比較演算子や論理演算子を含む式です。この式が `0` と評価される行は、さらなる変換や結果から除外されます。

`WHERE` 式は、基盤となるテーブルエンジンがサポートしていれば、インデックスの使用能力とパーティションプルーニングに基づいて評価されます。

:::note    
[PREWHERE](../../../sql-reference/statements/select/prewhere.md) というフィルタリング最適化があります。
:::

[NULL](/sql-reference/syntax#null) 値をテストする必要がある場合は、[IS NULL](/sql-reference/operators#is_null) と [IS NOT NULL](/sql-reference/operators#is_not_null) 演算子、または [isNull](../../../sql-reference/functions/functions-for-nulls.md#isNull) と [isNotNull](../../../sql-reference/functions/functions-for-nulls.md#isNotNull) 関数を使用してください。
そうしないと、`NULL` を含む式は決して通過しません。

**例**

3の倍数で10より大きい数を見つけるために、[numbers table](../../../sql-reference/table-functions/numbers.md) に対して次のクエリを実行します。

```sql
SELECT number FROM numbers(20) WHERE (number > 10) AND (number % 3 == 0);
```

結果:

```text
┌─number─┐
│     12 │
│     15 │
│     18 │
└────────┘
```

`NULL` 値を含むクエリ:

```sql
CREATE TABLE t_null(x Int8, y Nullable(Int8)) ENGINE=MergeTree() ORDER BY x;
INSERT INTO t_null VALUES (1, NULL), (2, 3);

SELECT * FROM t_null WHERE y IS NULL;
SELECT * FROM t_null WHERE y != 0;
```

結果:

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```
