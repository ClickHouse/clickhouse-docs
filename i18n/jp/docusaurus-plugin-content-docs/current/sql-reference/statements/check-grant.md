---
description: 'CHECK GRANT のドキュメント'
sidebar_label: 'CHECK GRANT'
sidebar_position: 56
slug: /sql-reference/statements/check-grant
title: 'CHECK GRANT ステートメント'
doc_type: 'reference'
---

`CHECK GRANT` クエリは、現在のユーザーまたはロールに特定の権限が付与されているかどうかを確認するために使用されます。



## 構文 {#syntax}

クエリの基本構文は以下の通りです:

```sql
CHECK GRANT privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*}
```

- `privilege` — 権限のタイプ。


## 例 {#examples}

ユーザーに権限が付与されている場合、`check_grant`の結果は`1`となります。それ以外の場合、`check_grant`の結果は`0`となります。

`table_1.col1`が存在し、現在のユーザーに`SELECT`権限または`SELECT(col1)`権限、あるいは権限を持つロールが付与されている場合、結果は`1`となります。

```sql
CHECK GRANT SELECT(col1) ON table_1;
```

```text
┌─result─┐
│      1 │
└────────┘
```

`table_2.col2`が存在しない場合、または現在のユーザーに`SELECT`権限または`SELECT(col2)`権限、あるいは権限を持つロールが付与されていない場合、結果は`0`となります。

```sql
CHECK GRANT SELECT(col2) ON table_2;
```

```text
┌─result─┐
│      0 │
└────────┘
```


## ワイルドカード {#wildcard}

権限を指定する際、テーブル名やデータベース名の代わりにアスタリスク（`*`）を使用できます。ワイルドカードのルールについては、[WILDCARD GRANTS](../../sql-reference/statements/grant.md#wildcard-grants)を確認してください。
