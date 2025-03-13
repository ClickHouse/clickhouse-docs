---
slug: '/sql-reference/statements/select/limit'
sidebar_label: 'LIMIT'
keywords: ['LIMIT', 'ClickHouse', SQL']
description: 'LIMIT句についての詳細な説明'
---


# LIMIT句

`LIMIT m`は、結果から最初の`m`行を選択することを許可します。

`LIMIT n, m`は、最初の`n`行をスキップした後の`m`行を結果から選択することを許可します。`LIMIT m OFFSET n`の構文は同等です。

`n`と`m`は非負の整数でなければなりません。

明示的に結果をソートする[ORDER BY](../../../sql-reference/statements/select/order-by.md)句がない場合、結果の行の選択は任意で非決定的になる可能性があります。

:::note
結果セットの行数は、[limit](../../../operations/settings/settings.md#limit)設定にも依存する場合があります。
:::

## LIMIT ... WITH TIES 修飾子 {#limit--with-ties-modifier}

`LIMIT n[,m]`に`WITH TIES`修飾子を設定し、`ORDER BY expr_list`を指定すると、結果では最初の`n`行または`n,m`行と、`LIMIT n`の場合は位置`n`の行と同じ`ORDER BY`フィールド値を持つすべての行が返されます。また、`LIMIT n,m`の場合は`m`です。

この修飾子は、[ORDER BY ... WITH FILL 修飾子](/sql-reference/statements/select/order-by#order-by-expr-with-fill-modifier)と組み合わせることもできます。

例えば、以下のクエリ

``` sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0,5
```

は次のような結果を返します

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

は別の行セットを返します

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

なぜなら、行番号6が行番号5とフィールド`n`の同じ値"2"を持っているからです。
