---
slug: /sql-reference/statements/select/limit
sidebar_label: LIMIT
---

# LIMIT句

`LIMIT m`は、結果から最初の`m`行を選択することを可能にします。

`LIMIT n, m`は、最初の`n`行をスキップした後に結果から`m`行を選択することを可能にします。`LIMIT m OFFSET n`構文は同等です。

`n`と`m`は非負の整数でなければなりません。

結果を明示的にソートする[ORDER BY](../../../sql-reference/statements/select/order-by.md)句がない場合、結果に選ばれる行は任意であり、非決定的である可能性があります。

:::note    
結果セットの行数は、[limit](../../../operations/settings/settings.md#limit)設定にも依存する場合があります。
:::

## LIMIT ... WITH TIES修飾子 {#limit--with-ties-modifier}

`LIMIT n[,m]`に対して`WITH TIES`修飾子を設定し、`ORDER BY expr_list`を指定すると、最初の`n`または`n,m`行と、行番号`n`の`LIMIT n`または行番号`m`の`LIMIT n,m`において同じ`ORDER BY`フィールドの値が等しいすべての行が結果に含まれます。

この修飾子は、[ORDER BY ... WITH FILL修飾子](../../../sql-reference/statements/select/order-by.md#orderby-with-fill)と組み合わせることもできます。

例えば、以下のクエリは

``` sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0,5
```

次のような結果を返します。

``` text
┌─n─┐
│ 0 │
│ 0 │
│ 1 │
│ 1 │
│ 2 │
└───┘
```

しかし、`WITH TIES`修飾子を適用すると

``` sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0,5 WITH TIES
```

別の行セットを返します。

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

これは行番号6が行番号5とフィールド`n`の値"2"が同じだからです。
