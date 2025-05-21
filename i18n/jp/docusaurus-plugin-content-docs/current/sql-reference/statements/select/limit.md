---
description: 'LIMIT句に関するドキュメント'
sidebar_label: 'LIMIT'
slug: /sql-reference/statements/select/limit
title: 'LIMIT句'
---


# LIMIT句

`LIMIT m`は、結果から最初の `m` 行を選択することを可能にします。

`LIMIT n, m`は、最初の `n` 行をスキップした後に結果から `m` 行を選択することを可能にします。`LIMIT m OFFSET n` 構文は同等です。

`n` と `m` は非負整数でなければなりません。

[ORDER BY](../../../sql-reference/statements/select/order-by.md) 句が無い場合、結果の行の選択は任意であり、非決定的である可能性があります。

:::note    
結果セットの行数は、[limit](../../../operations/settings/settings.md#limit) 設定にも依存する可能性があります。
:::

## LIMIT ... WITH TIES修飾子 {#limit--with-ties-modifier}

`LIMIT n[,m]` に `WITH TIES` 修飾子を設定し、`ORDER BY expr_list` を指定すると、結果には最初の `n` 行または `n,m` 行が含まれ、`LIMIT n` の場合は行番号 `n` の `ORDER BY` フィールド値と同じ値を持つすべての行が含まれます。 `LIMIT n,m` の場合は、行番号 `m` が含まれます。

この修飾子は、[ORDER BY ... WITH FILL修飾子](/sql-reference/statements/select/order-by#order-by-expr-with-fill-modifier)と組み合わせて使用することもできます。

例えば、次のクエリ

```sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0,5
```

は次の結果を返します。

```text
┌─n─┐
│ 0 │
│ 0 │
│ 1 │
│ 1 │
│ 2 │
└───┘
```

しかし、`WITH TIES` 修飾子を適用した後は

```sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0,5 WITH TIES
```

は別の行のセットを返します。

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

これは、行番号6が行番号5と同じ値 "2" をフィールド `n` に持つためです。
