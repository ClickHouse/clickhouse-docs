---
description: 'CHECK GRANT に関するドキュメント'
sidebar_label: 'CHECK GRANT'
sidebar_position: 56
slug: /sql-reference/statements/check-grant
title: 'CHECK GRANT ステートメント'
---

`CHECK GRANT` クエリは、現在のユーザーまたはロールが特定の権限を付与されているかどうかを確認するために使用されます。

## 構文 {#syntax}

クエリの基本構文は次のとおりです。

```sql
CHECK GRANT privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*}
```

- `privilege` — 権限の種類。

## 例 {#examples}

ユーザーがかつて権限を付与されていた場合、レスポンス `check_grant` は `1` になります。それ以外の場合、レスポンス `check_grant` は `0` になります。

もし `table_1.col1` が存在し、現在のユーザーが権限 `SELECT`/`SELECT(con)` または（権限を持つ）ロールによって付与されている場合、レスポンスは `1` です。
```sql
CHECK GRANT SELECT(col1) ON table_1;
```

```text
┌─result─┐
│      1 │
└────────┘
```
もし `table_2.col2` が存在しない場合、または現在のユーザーが権限 `SELECT`/`SELECT(con)` または（権限を持つ）ロールによって付与されていない場合、レスポンスは `0` です。
```sql
CHECK GRANT SELECT(col2) ON table_2;
```

```text
┌─result─┐
│      0 │
└────────┘
```

## ワイルドカード {#wildcard}
権限を指定する際に、テーブル名やデータベース名の代わりにアスタリスク (`*`) を使用できます。ワイルドカードのルールについては [WILDCARD GRANTS](../../sql-reference/statements/grant.md#wildcard-grants) をご確認ください。
