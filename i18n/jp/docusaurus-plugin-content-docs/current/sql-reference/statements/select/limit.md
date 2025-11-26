---
description: 'LIMIT 句に関するドキュメント'
sidebar_label: 'LIMIT'
slug: /sql-reference/statements/select/limit
title: 'LIMIT 句'
doc_type: 'reference'
---



# LIMIT 句

`LIMIT m` は、結果の先頭から `m` 行を取得します。

`LIMIT n, m` は、結果の先頭から `n` 行をスキップした後の `m` 行を取得します。`LIMIT m OFFSET n` 構文はこれと同等です。

上記の標準的な形式では、`n` と `m` は 0 以上の整数です。

さらに、負の LIMIT もサポートされています:

`LIMIT -m` は、結果の末尾から `m` 行を取得します。

`LIMIT -m OFFSET -n` は、結果の末尾から `n` 行をスキップした後の末尾側の `m` 行を取得します。`LIMIT -n, -m` 構文はこれと同等です。

また、結果の一部（割合）を選択することもサポートされています:

`LIMIT m` - 0 < m < 1 の場合、先頭から全行の m * 100% が返されます。

`LIMIT m OFFSET n` - 0 < m < 1 かつ 0 < n < 1 の場合、全体のうち先頭から n * 100% の行をスキップした後、その位置からさらに m * 100% に相当する行が返されます。`LIMIT n, m` 構文はこれと同等です。

例:
    • `LIMIT 0.1` - 結果の先頭 10% を取得します。
    • `LIMIT 1 OFFSET 0.5` - 中央の行（中央値の行）を取得します。
    • `LIMIT 0.25 OFFSET 0.5` - 結果の第 3 四分位を取得します。

> **Note**
> • 比率を表す値は、1 未満かつ 0 より大きい [Float64](../../data-types/float.md) 型の数値でなければなりません。
> • 計算結果として行数が小数になる場合は、次の整数値に切り上げられます。

> **Note**
> • 通常の LIMIT と小数の OFFSET を組み合わせることができます（およびその逆も可能です）。
> • 通常の LIMIT と負の OFFSET を組み合わせることができます（およびその逆も可能です）。

結果を明示的にソートする [ORDER BY](../../../sql-reference/statements/select/order-by.md) 句が存在しない場合、結果として選択される行は任意かつ非決定的になります。

:::note    
結果セット内の行数は、[limit](../../../operations/settings/settings.md#limit) 設定にも依存する場合があります。
:::



## LIMIT ... WITH TIES 修飾子

`LIMIT n[,m]` に対して `WITH TIES` 修飾子を設定し、`ORDER BY expr_list` を指定すると、結果として、先頭の `n` 行（`LIMIT n` の場合）または `n,m` 行（`LIMIT n,m` の場合）に加えて、`LIMIT n` の場合は位置 `n` の行、`LIMIT n,m` の場合は位置 `m` の行と同じ `ORDER BY` フィールド値を持つすべての行が返されます。

> **注記**\
> • `WITH TIES` は現在、負の `LIMIT` との組み合わせではサポートされていません。

この修飾子は、[ORDER BY ... WITH FILL 修飾子](/sql-reference/statements/select/order-by#order-by-expr-with-fill-modifier) と組み合わせることもできます。

例えば、次のクエリでは

```sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0, 5
```

戻り値

```text
┌─n─┐
│ 0 │
│ 0 │
│ 1 │
│ 1 │
│ 2 │
└───┘
```

しかし`WITH TIES`修飾子を適用すると

```sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0, 5 WITH TIES
```

別の結果セットを返します

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

行番号6は、フィールド `n` の値が行番号5と同じ「2」であるためです
