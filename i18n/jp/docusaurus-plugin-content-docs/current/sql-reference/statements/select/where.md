---
description: 'WHERE 句に関するドキュメント'
sidebar_label: 'WHERE'
slug: /sql-reference/statements/select/where
title: 'WHERE 句'
---


# WHERE 句

`WHERE` 句は、`SELECT` の [FROM](../../../sql-reference/statements/select/from.md) 句から取得されるデータをフィルタリングすることを可能にします。

`WHERE` 句が存在する場合、それは `UInt8` 型の式を含む必要があります。通常、これは比較演算子と論理演算子を含む式です。この式が `0` に評価される行は、さらなる変換や結果から除外されます。

`WHERE` の式は、基礎となるテーブルエンジンがそれをサポートしている場合、インデックスの使用とパーティションプルーニングの能力に基づいて評価されます。

:::note    
フィルタリング最適化として [PREWHERE](../../../sql-reference/statements/select/prewhere.md) という機能があります。
:::

[NULL](/sql-reference/syntax#null) の値をテストする必要がある場合は、[IS NULL](/sql-reference/operators#is_null) および [IS NOT NULL](/sql-reference/operators#is_not_null) 演算子、または [isNull](../../../sql-reference/functions/functions-for-nulls.md#isnull) および [isNotNull](../../../sql-reference/functions/functions-for-nulls.md#isnotnull) 関数を使用してください。
そうしないと、`NULL` を含む式は決して通過しません。

**例**

3の倍数で10より大きい数字を見つけるには、[numbers table](../../../sql-reference/table-functions/numbers.md) に対して次のクエリを実行してください。

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
