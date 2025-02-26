---
slug: /sql-reference/statements/check-grant
sidebar_position: 56
sidebar_label: CHECK GRANT
title: "CHECK GRANT ステートメント"
---

`CHECK GRANT` クエリは、現在のユーザー/ロールに特定の権限が与えられているかどうかをチェックするために使用されます。

## 構文 {#syntax}

クエリの基本的な構文は次のとおりです：

```sql
CHECK GRANT privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*}
```

- `privilege` — 権限の種類。

## 例 {#examples}

ユーザーが以前に権限を付与されていた場合、`check_grant` の応答は `1` になります。それ以外の場合、`check_grant` の応答は `0` になります。

`table_1.col1` が存在し、現在のユーザーが `SELECT`/`SELECT(con)` の権限または権限を持つロールを与えられている場合、応答は `1` となります。
```sql
CHECK GRANT SELECT(col1) ON table_1;
```

```text
┌─result─┐
│      1 │
└────────┘
```
`table_2.col2` が存在しないか、現在のユーザーが `SELECT`/`SELECT(con)` の権限または権限を持つロールを与えられていない場合、応答は `0` となります。
```sql
CHECK GRANT SELECT(col2) ON table_2;
```

```text
┌─result─┐
│      0 │
└────────┘
```

## ワイルドカード {#wildcard}
権限を指定する際に、テーブルやデータベース名の代わりにアスタリスク（`*`）を使用できます。ワイルドカードのルールについては、[WILDCARD GRANTS](../../sql-reference/statements/grant.md#wildcard-grants)を確認してください。
