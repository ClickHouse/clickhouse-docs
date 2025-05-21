---
description: 'REVOKE ステートメントのドキュメント'
sidebar_label: 'REVOKE'
sidebar_position: 39
slug: /sql-reference/statements/revoke
title: 'REVOKE ステートメント'
---


# REVOKE ステートメント

ユーザーまたはロールから特権を取り消します。

## 構文 {#syntax}

**ユーザーから特権を取り消す**

```sql
REVOKE [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*} FROM {user | CURRENT_USER} [,...] | ALL | ALL EXCEPT {user | CURRENT_USER} [,...]
```

**ユーザーからロールを取り消す**

```sql
REVOKE [ON CLUSTER cluster_name] [ADMIN OPTION FOR] role [,...] FROM {user | role | CURRENT_USER} [,...] | ALL | ALL EXCEPT {user_name | role_name | CURRENT_USER} [,...]
```

## 説明 {#description}

特権を取り消すには、取り消したい特権よりも広い範囲の特権を使用することができます。たとえば、ユーザーが `SELECT (x,y)` 特権を持っている場合、管理者は `REVOKE SELECT(x,y) ...`、または `REVOKE SELECT * ...`、さらには `REVOKE ALL PRIVILEGES ...` クエリを実行してこの特権を取り消すことができます。

### 部分的な取り消し {#partial-revokes}

特権の一部を取り消すことができます。たとえば、ユーザーが `SELECT *.*` 特権を持っている場合、特定のテーブルまたはデータベースからデータを読み取る特権を取り消すことができます。

## 例 {#examples}

`john` ユーザーアカウントに、`accounts` を除くすべてのデータベースから選択する特権を付与します。

```sql
GRANT SELECT ON *.* TO john;
REVOKE SELECT ON accounts.* FROM john;
```

`mira` ユーザーアカウントに、`accounts.staff` テーブルのすべてのカラムを選択する特権を付与し、`wage` を除外します。

```sql
GRANT SELECT ON accounts.staff TO mira;
REVOKE SELECT(wage) ON accounts.staff FROM mira;
```

[原文記事](/operations/settings/settings/)
