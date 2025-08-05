---
description: 'REVOKEステートメントのドキュメント'
sidebar_label: 'REVOKE'
sidebar_position: 39
slug: '/sql-reference/statements/revoke'
title: 'REVOKEステートメント'
---




# REVOKEステートメント

ユーザーまたはロールから権限を取り消します。

## 構文 {#syntax}

**ユーザーから権限を取り消す**

```sql
REVOKE [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*} FROM {user | CURRENT_USER} [,...] | ALL | ALL EXCEPT {user | CURRENT_USER} [,...]
```

**ユーザーからロールを取り消す**

```sql
REVOKE [ON CLUSTER cluster_name] [ADMIN OPTION FOR] role [,...] FROM {user | role | CURRENT_USER} [,...] | ALL | ALL EXCEPT {user_name | role_name | CURRENT_USER} [,...]
```

## 説明 {#description}

特定の権限を取り消すには、取り消す予定のより広い範囲の権限を使用できます。例えば、ユーザーが `SELECT (x,y)` 権限を持っている場合、管理者は `REVOKE SELECT(x,y) ...`、または `REVOKE SELECT * ...`、あるいは `REVOKE ALL PRIVILEGES ...` クエリを実行してこの権限を取り消すことができます。

### 部分的な取り消し {#partial-revokes}

権限の一部を取り消すことができます。たとえば、ユーザーが `SELECT *.*` 権限を持っている場合、特定のテーブルまたはデータベースからデータを読み取る権限を取り消すことができます。

## 例 {#examples}

`john` ユーザーアカウントにすべてのデータベースから選択する権限を付与し、 `accounts` データベースを除外します：

```sql
GRANT SELECT ON *.* TO john;
REVOKE SELECT ON accounts.* FROM john;
```

`mira` ユーザーアカウントに `accounts.staff` テーブルのすべてのカラムから選択する権限を付与し、 `wage` カラムを除外します。

```sql
GRANT SELECT ON accounts.staff TO mira;
REVOKE SELECT(wage) ON accounts.staff FROM mira;
```

[原文記事](/operations/settings/settings/)
