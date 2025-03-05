---
slug: /sql-reference/statements/select/where
sidebar_label: WHERE
---


# WHERE句

`WHERE`句は、`SELECT`の[FROM](../../../sql-reference/statements/select/from.md)句から取得されるデータをフィルタリングするために使用されます。

`WHERE`句がある場合、`UInt8`型の式を含む必要があります。これは通常、比較演算子と論理演算子を含む式です。この式が `0` に評価される行は、その後の変換や結果から除外されます。

`WHERE`式は、基盤となるテーブルエンジンがサポートしている場合、インデックスの使用能力やパーティションプルーニングに基づいて評価されます。

:::note    
フィルタリングの最適化の一つに[PREWHERE](../../../sql-reference/statements/select/prewhere.md)があります。
:::

[NULL](/sql-reference/syntax#null)の値をテストする必要がある場合は、[IS NULL](../../operators/index.md#operator-is-null)および[IS NOT NULL](../../operators/index.md#is-not-null)演算子、または[isNull](../../../sql-reference/functions/functions-for-nulls.md#isnull)および[isNotNull](../../../sql-reference/functions/functions-for-nulls.md#isnotnull)関数を使用してください。
そうでなければ、`NULL`を含む式は決して通過しません。

**例**

3の倍数で10より大きい数を見つけるためには、[numbers table](../../../sql-reference/table-functions/numbers.md)で以下のクエリを実行します：

``` sql
SELECT number FROM numbers(20) WHERE (number > 10) AND (number % 3 == 0);
```

結果：

``` text
┌─number─┐
│     12 │
│     15 │
│     18 │
└────────┘
```

`NULL`値を含むクエリ：

``` sql
CREATE TABLE t_null(x Int8, y Nullable(Int8)) ENGINE=MergeTree() ORDER BY x;
INSERT INTO t_null VALUES (1, NULL), (2, 3);

SELECT * FROM t_null WHERE y IS NULL;
SELECT * FROM t_null WHERE y != 0;
```

結果：

``` text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```
