---
'description': 'Documentation for WHERE Clause'
'sidebar_label': 'WHERE'
'slug': '/sql-reference/statements/select/where'
'title': 'WHERE Clause'
---




# WHERE句

`WHERE`句は、`SELECT`の[FROM](../../../sql-reference/statements/select/from.md)句から受け取るデータをフィルタリングすることを可能にします。

`WHERE`句がある場合、それは通常`UInt8`型の式を含む必要があります。これは通常、比較演算子および論理演算子を使用した式です。この式が`0`に評価される行は、さらなる変換や結果から除外されます。

`WHERE`式は、基礎となるテーブルエンジンがそれをサポートしている場合、インデックスの使用能力やパーティションのプルーニングを考慮して評価されます。

:::note    
[PREWHERE](../../../sql-reference/statements/select/prewhere.md)というフィルタリングの最適化があります。
:::

[NULL](/sql-reference/syntax#null)値をテストする必要がある場合は、[IS NULL](/sql-reference/operators#is_null)および[IS NOT NULL](/sql-reference/operators#is_not_null)演算子や、[isNull](../../../sql-reference/functions/functions-for-nulls.md#isnull)および[isNotNull](../../../sql-reference/functions/functions-for-nulls.md#isnotnull)関数を使用してください。そうでなければ、`NULL`を含む式は決して通過しません。

**例**

3の倍数で10より大きい数字を見つけるには、[numbers table](../../../sql-reference/table-functions/numbers.md)で次のクエリを実行します。

```sql
SELECT number FROM numbers(20) WHERE (number > 10) AND (number % 3 == 0);
```

結果：

```text
┌─number─┐
│     12 │
│     15 │
│     18 │
└────────┘
```

`NULL`値を含むクエリ：

```sql
CREATE TABLE t_null(x Int8, y Nullable(Int8)) ENGINE=MergeTree() ORDER BY x;
INSERT INTO t_null VALUES (1, NULL), (2, 3);

SELECT * FROM t_null WHERE y IS NULL;
SELECT * FROM t_null WHERE y != 0;
```

結果：

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```
