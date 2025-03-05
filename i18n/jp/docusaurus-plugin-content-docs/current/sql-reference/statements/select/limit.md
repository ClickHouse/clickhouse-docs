---
slug: /sql-reference/statements/select/limit
sidebar_label: LIMIT
---


# LIMIT句

`LIMIT m` は、結果から最初の `m` 行を選択することを可能にします。

`LIMIT n, m` は、最初の `n` 行をスキップした後に結果から `m` 行を選択することを可能にします。`LIMIT m OFFSET n` の構文は同等です。

`n` と `m` は非負の整数でなければなりません。

明示的に結果をソートする [ORDER BY](../../../sql-reference/statements/select/order-by.md) 句がない場合、結果の行の選択は任意かつ非決定的である可能性があります。

:::note    
結果セットの行数は、[limit](../../../operations/settings/settings.md#limit) 設定にも依存する場合があります。
:::

## LIMIT ... WITH TIES 修飾子 {#limit--with-ties-modifier}

`LIMIT n[,m]` に対して `WITH TIES` 修飾子を設定し、`ORDER BY expr_list` を指定すると、結果として最初の `n` または `n,m` 行と、`LIMIT n` の場合は位置 `n` の行で、`LIMIT n,m` の場合は位置 `m` の行と同じ `ORDER BY` フィールド値を持つすべての行が取得されます。

この修飾子は、[ORDER BY ... WITH FILL 修飾子](../../../sql-reference/statements/select/order-by.md#orderby-with-fill) と組み合わせることもできます。

例えば、次のクエリ

``` sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0,5
```

は次の結果を返します。

``` text
┌─n─┐
│ 0 │
│ 0 │
│ 1 │
│ 1 │
│ 2 │
└───┘
```

しかし、`WITH TIES` 修飾子を適用すると

``` sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0,5 WITH TIES
```

は別の行のセットを返します。

``` text
┌─n─┐
│ 0 │
│ 0 │
│ 1 │
│ 1 │
│ 2 │
│ 2 │
└───┘
```

これは、行番号 6 が行番号 5 と同じ値 "2" を `n` フィールドに持っているためです。
