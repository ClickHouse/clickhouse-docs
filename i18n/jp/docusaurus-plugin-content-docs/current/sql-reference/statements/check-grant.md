---
'description': 'Documentation for Check Grant'
'sidebar_label': 'CHECK GRANT'
'sidebar_position': 56
'slug': '/sql-reference/statements/check-grant'
'title': 'CHECK GRANT Statement'
---



`CHECK GRANT` クエリは、現在のユーザー/ロールに特定の権限が付与されているかどうかを確認するために使用されます。

## 構文 {#syntax}

クエリの基本的な構文は次のとおりです：

```sql
CHECK GRANT privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*}
```

- `privilege` — 権限の種類。

## 例 {#examples}

ユーザーが以前に権限を付与されていた場合、応答の `check_grant` は `1` になります。それ以外の場合、応答の `check_grant` は `0` になります。

`table_1.col1` が存在し、現在のユーザーが `SELECT`/`SELECT(con)` 権限または（権限のある）ロールを付与されている場合、応答は `1` になります。
```sql
CHECK GRANT SELECT(col1) ON table_1;
```

```text
┌─result─┐
│      1 │
└────────┘
```
`table_2.col2` が存在しない場合、または現在のユーザーが `SELECT`/`SELECT(con)` 権限または（権限のある）ロールを付与されていない場合、応答は `0` になります。
```sql
CHECK GRANT SELECT(col2) ON table_2;
```

```text
┌─result─┐
│      0 │
└────────┘
```

## ワイルドカード {#wildcard}
権限を指定する場合、アスタリスク（`*`）を使用してテーブルまたはデータベース名の代わりに使用できます。ワイルドカードのルールについては、[WILDCARD GRANTS](../../sql-reference/statements/grant.md#wildcard-grants) をご確認ください。
