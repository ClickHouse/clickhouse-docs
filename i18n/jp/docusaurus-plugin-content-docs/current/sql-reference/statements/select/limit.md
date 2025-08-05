---
description: 'Documentation for LIMIT Clause'
sidebar_label: 'LIMIT'
slug: '/sql-reference/statements/select/limit'
title: 'LIMIT Clause'
---




# LIMIT 句

`LIMIT m` は、結果から最初の `m` 行を選択することができます。

`LIMIT n, m` は、最初の `n` 行をスキップした後、結果から `m` 行を選択することができます。 `LIMIT m OFFSET n` という構文は等価です。

`n` と `m` は、非負の整数でなければなりません。

結果を明示的にソートする [ORDER BY](../../../sql-reference/statements/select/order-by.md) 句がない場合、結果の行の選択は任意で非決定的である可能性があります。

:::note    
結果セットの行数は、[limit](../../../operations/settings/settings.md#limit) 設定にも依存します。
:::

## LIMIT ... WITH TIES 修飾子 {#limit--with-ties-modifier}

`LIMIT n[,m]` に対して `WITH TIES` 修飾子を設定し、`ORDER BY expr_list` を指定すると、結果には最初の `n` または `n,m` 行と、`LIMIT n` の場合は位置 `n` の行と同じ `ORDER BY` フィールド値を持つすべての行が含まれます。 `LIMIT n,m` の場合は位置 `m` です。

この修飾子は、[ORDER BY ... WITH FILL 修飾子](/sql-reference/statements/select/order-by#order-by-expr-with-fill-modifier) とも組み合わせることができます。

例えば、次のクエリは

```sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0,5
```

を実行すると、次の結果が得られます。

```text
┌─n─┐
│ 0 │
│ 0 │
│ 1 │
│ 1 │
│ 2 │
└───┘
```

しかし、`WITH TIES` 修飾子を適用すると

```sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0,5 WITH TIES
```

次のような異なる行セットが返されます。

```text
┌─n─┐
│ 0 │
│ 0 │
│ 1 │
│ 1 │
│ 2 │
│ 2 │
└───┘
```

これは、行番号 6 が行番号 5 と同じ値 "2" をフィールド `n` に持つためです。
