---
slug: /sql-reference/statements/select/where
sidebar_label: WHERE
---

# WHERE 句

`WHERE` 句は、`SELECT` の [FROM](../../../sql-reference/statements/select/from.md) 句から取得されるデータをフィルタリングすることを可能にします。

`WHERE` 句が存在する場合、`UInt8` 型の式を含める必要があります。これは通常、比較および論理演算子を使用した式です。この式が `0` に評価される行は、さらなる変換や結果から除外されます。

`WHERE` 式は、基になるテーブルエンジンがそれをサポートしていれば、インデックスの使用やパーティションプルーニングの能力に基づいて評価されます。

:::note    
[FILTERING最適化](../../../sql-reference/statements/select/prewhere.md) として知られる [PREWHERE](../../../sql-reference/statements/select/prewhere.md) が存在します。
:::

[NULL](../../../sql-reference/syntax.md#null-literal) 値をテストする必要がある場合は、[IS NULL](../../operators/index.md#operator-is-null) および [IS NOT NULL](../../operators/index.md#is-not-null) 演算子、または [isNull](../../../sql-reference/functions/functions-for-nulls.md#isnull) および [isNotNull](../../../sql-reference/functions/functions-for-nulls.md#isnotnull) 関数を使用してください。
そうでなければ、`NULL` を含む式は決して通過しません。

**例**

3の倍数であり、かつ10より大きい数を見つけるためには、[numbers テーブル](../../../sql-reference/table-functions/numbers.md) に対して次のクエリを実行します。

``` sql
SELECT number FROM numbers(20) WHERE (number > 10) AND (number % 3 == 0);
```

結果:

``` text
┌─number─┐
│     12 │
│     15 │
│     18 │
└────────┘
```

`NULL` 値を持つクエリ:

``` sql
CREATE TABLE t_null(x Int8, y Nullable(Int8)) ENGINE=MergeTree() ORDER BY x;
INSERT INTO t_null VALUES (1, NULL), (2, 3);

SELECT * FROM t_null WHERE y IS NULL;
SELECT * FROM t_null WHERE y != 0;
```

結果:

``` text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```
