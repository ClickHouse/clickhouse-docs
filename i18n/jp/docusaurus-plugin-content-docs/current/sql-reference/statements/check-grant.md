---
'description': 'Check Grantのドキュメント'
'sidebar_label': 'CHECK GRANT'
'sidebar_position': 56
'slug': '/sql-reference/statements/check-grant'
'title': 'CHECK GRANT ステートメント'
'doc_type': 'reference'
---

The `CHECK GRANT` クエリは、現在のユーザー/ロールに特定の権限が付与されているかどうかを確認するために使用されます。

## 構文 {#syntax}

クエリの基本的な構文は次のとおりです：

```sql
CHECK GRANT privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*}
```

- `privilege` — 権限のタイプ。

## 例 {#examples}

ユーザーが権限を付与されていた場合、レスポンス `check_grant` は `1` になります。そうでない場合、レスポンス `check_grant` は `0` になります。

もし `table_1.col1` が存在し、現在のユーザーが権限 `SELECT`/`SELECT(con)` または権限を持つロールによって付与されている場合、レスポンスは `1` です。
```sql
CHECK GRANT SELECT(col1) ON table_1;
```

```text
┌─result─┐
│      1 │
└────────┘
```
もし `table_2.col2` が存在しないか、現在のユーザーが権限 `SELECT`/`SELECT(con)` または権限を持つロールによって付与されていない場合、レスポンスは `0` です。
```sql
CHECK GRANT SELECT(col2) ON table_2;
```

```text
┌─result─┐
│      0 │
└────────┘
```

## ワイルドカード {#wildcard}
権限を指定する際、テーブル名やデータベース名の代わりにアスタリスク（`*`）を使用することができます。ワイルドカードのルールについては [WILDCARD GRANTS](../../sql-reference/statements/grant.md#wildcard-grants) を確認してください。
