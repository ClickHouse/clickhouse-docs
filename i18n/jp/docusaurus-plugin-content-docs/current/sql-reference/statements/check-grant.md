---
slug: /sql-reference/statements/check-grant
sidebar_position: 56
sidebar_label: CHECK GRANT
title: "CHECK GRANT ステートメント"
---

`CHECK GRANT` クエリは、現在のユーザー/ロールが特定の権限を付与されているかどうかを確認するために使用されます。

## 構文 {#syntax}

クエリの基本的な構文は次のとおりです：

```sql
CHECK GRANT privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*}
```

- `privilege` — 権限の種類。

## 例 {#examples}

ユーザーがかつて権限を付与されていた場合、応答の `check_grant` は `1` になります。そうでない場合、応答の `check_grant` は `0` になります。

`table_1.col1` が存在し、現在のユーザーが権限 `SELECT`/`SELECT(con)` または（権限のある）ロールによって付与されている場合、応答は `1` です。
```sql
CHECK GRANT SELECT(col1) ON table_1;
```

```text
┌─result─┐
│      1 │
└────────┘
```
`table_2.col2` が存在しない、または現在のユーザーが権限 `SELECT`/`SELECT(con)` または（権限のある）ロールによって付与されていない場合、応答は `0` です。
```sql
CHECK GRANT SELECT(col2) ON table_2;
```

```text
┌─result─┐
│      0 │
└────────┘
```

## ワイルドカード {#wildcard}
権限を指定する際には、テーブル名やデータベース名の代わりにアスタリスク (`*`) を使用できます。ワイルドカードのルールについては、[WILDCARD GRANTS](../../sql-reference/statements/grant.md#wildcard-grants) を確認してください。
