---
description: 'CHECK GRANT のドキュメント'
sidebar_label: 'CHECK GRANT'
sidebar_position: 56
slug: /sql-reference/statements/check-grant
title: 'CHECK GRANT ステートメント'
doc_type: 'reference'
---

`CHECK GRANT` クエリは、現在のユーザーまたはロールに特定の権限が付与されているかどうかを確認するために使用します。

## 構文 \{#syntax\}

クエリの基本構文は以下のとおりです。

```sql
CHECK GRANT privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*}
```

* `privilege` — 権限のタイプ。

## 例 \{#examples\}

ユーザーにその権限が付与されている場合、レスポンスの `check_grant` は `1` になります。付与されていない場合、レスポンスの `check_grant` は `0` になります。

`table_1.col1` が存在し、かつ現在のユーザーに `SELECT` / `SELECT(con)` の権限、またはその権限を持つロールが付与されている場合、レスポンスは `1` になります。

```sql
CHECK GRANT SELECT(col1) ON table_1;
```

```text
┌─result─┐
│      1 │
└────────┘
```

`table_2.col2` が存在しない場合、または現在のユーザーに `SELECT` / `SELECT(con)` 権限、もしくはその権限を持つロールが付与されていない場合、レスポンスは `0` になります。

```sql
CHECK GRANT SELECT(col2) ON table_2;
```

```text
┌─result─┐
│      0 │
└────────┘
```

## ワイルドカード \{#wildcard\}
権限を指定する際には、テーブル名やデータベース名の代わりにアスタリスク（`*`）を使用できます。ワイルドカードのルールについては [WILDCARD GRANTS](../../sql-reference/statements/grant.md#wildcard-grants) を参照してください。
