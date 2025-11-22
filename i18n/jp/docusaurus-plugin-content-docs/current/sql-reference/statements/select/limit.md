---
description: 'LIMIT 句に関するドキュメント'
sidebar_label: 'LIMIT'
slug: /sql-reference/statements/select/limit
title: 'LIMIT 句'
doc_type: 'reference'
---



# LIMIT 句

`LIMIT m` は、結果セットの先頭から `m` 行を選択します。

`LIMIT n, m` は、結果セットの先頭から `n` 行をスキップした後の `m` 行を選択します。`LIMIT m OFFSET n` 構文はこれと同等です。

上記の標準形式では、`n` と `m` は 0 以上の整数です。

さらに、LIMIT に負の値を指定することもサポートされています:

`LIMIT -m` は、結果セットの末尾から `m` 行を選択します。

`LIMIT -m OFFSET -n` は、結果セットの末尾から `n` 行をスキップした後に、その直前の `m` 行を選択します。`LIMIT -n, -m` 構文はこれと同等です。

加えて、結果セットの一部（割合）を選択することもサポートされています:

`LIMIT m` - 0 < m < 1 の場合、先頭から全体の m * 100% の行が返されます。

`LIMIT m OFFSET n` - 0 < m < 1 かつ 0 < n < 1 の場合、先頭から全体の n * 100% の行をスキップした後に、そこから全体の m * 100% に相当する部分が返されます。`LIMIT n, m` 構文はこれと同等です。

例:
    • `LIMIT 0.1` - 結果セットの先頭 10% を選択します。
    • `LIMIT 1 OFFSET 0.5` - 中央に位置する行（メディアン行）を選択します。
    • `LIMIT 0.25 OFFSET 0.5` - 結果セットの第 3 四分位を選択します。

> **Note**
> • 割合を表す値は 0 より大きく 1 未満の [Float64](../../data-types/float.md) 型の数値でなければなりません。
> • 計算の結果として行数が小数になる場合は、次の整数に切り上げられます。

> **Note**
> • 標準の limit と割合による offset を組み合わせることができ、その逆も可能です。
> • 標準の limit と負の offset を組み合わせることができ、その逆も可能です。

結果を明示的にソートする [ORDER BY](../../../sql-reference/statements/select/order-by.md) 句がない場合、結果セットとして選択される行は任意であり、非決定的になる可能性があります。

:::note    
結果セットの行数は、[limit](../../../operations/settings/settings.md#limit) 設定にも依存する場合があります。
:::



## LIMIT ... WITH TIES 修飾子 {#limit--with-ties-modifier}

`LIMIT n[,m]`に`WITH TIES`修飾子を設定し、`ORDER BY expr_list`を指定すると、結果として最初の`n`行または`n,m`行と、`LIMIT n`の場合は位置`n`の行、`LIMIT n,m`の場合は位置`m`の行と同じ`ORDER BY`フィールド値を持つすべての行が取得されます。

> **注意**  
> • `WITH TIES`は現在、負の`LIMIT`ではサポートされていません。

この修飾子は[ORDER BY ... WITH FILL 修飾子](/sql-reference/statements/select/order-by#order-by-expr-with-fill-modifier)と組み合わせることもできます。

例えば、次のクエリは

```sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0, 5
```

次の結果を返します

```text
┌─n─┐
│ 0 │
│ 0 │
│ 1 │
│ 1 │
│ 2 │
└───┘
```

しかし、`WITH TIES`修飾子を適用すると

```sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0, 5 WITH TIES
```

別の行セットを返します

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

これは、6行目がフィールド`n`について5行目と同じ値「2」を持つためです
