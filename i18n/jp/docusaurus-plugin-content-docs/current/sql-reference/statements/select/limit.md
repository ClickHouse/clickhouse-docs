---
'description': 'LIMIT句に関するDocumentation'
'sidebar_label': 'LIMIT'
'slug': '/sql-reference/statements/select/limit'
'title': 'LIMIT 句'
'doc_type': 'reference'
---


# LIMIT句

`LIMIT m` は結果から最初の `m` 行を選択することを許可します。

`LIMIT n, m` は最初の `n` 行をスキップした後、結果から `m` 行を選択することを許可します。`LIMIT m OFFSET n` 構文は同等です。

`n` と `m` は非負整数でなければなりません。

明示的に結果をソートする [ORDER BY](../../../sql-reference/statements/select/order-by.md) 句がない場合、結果の行の選択は任意であり、非決定的である可能性があります。

:::note    
結果セットの行数は [limit](../../../operations/settings/settings.md#limit) 設定にも依存する場合があります。
:::

## LIMIT ... WITH TIES 修飾子 {#limit--with-ties-modifier}

`LIMIT n[,m]` のために `WITH TIES` 修飾子を設定し、`ORDER BY expr_list` を指定すると、結果には最初の `n` 行または `n,m` 行と、`LIMIT n` の場合は位置 `n` で、`LIMIT n,m` の場合は `m` の行と同じ `ORDER BY` フィールド値を持つすべての行が含まれます。

この修飾子は、[ORDER BY ... WITH FILL 修飾子](/sql-reference/statements/select/order-by#order-by-expr-with-fill-modifier) とも組み合わせることができます。

例えば、次のクエリ

```sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0,5
```

は

```text
┌─n─┐
│ 0 │
│ 0 │
│ 1 │
│ 1 │
│ 2 │
└───┘
```

を返しますが、`WITH TIES` 修飾子を適用すると

```sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0,5 WITH TIES
```

は別の行セットを返します

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

なぜなら行番号 6 が行番号 5 と同じ値 "2" を `n` フィールドに持っているからです。
