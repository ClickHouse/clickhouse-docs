---
description: 'REVOKE ステートメントに関するドキュメント'
sidebar_label: 'REVOKE'
sidebar_position: 39
slug: /sql-reference/statements/revoke
title: 'REVOKE ステートメント'
doc_type: 'reference'
---



# REVOKE ステートメント

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

権限を取り消す際には、取り消す対象の権限よりも広い範囲の権限を指定することができます。例えば、ユーザーが `SELECT (x,y)` 権限を持っている場合、管理者は `REVOKE SELECT(x,y) ...`、`REVOKE SELECT * ...`、または `REVOKE ALL PRIVILEGES ...` クエリを実行することで、この権限を取り消すことができます。

### 部分的な取り消し {#partial-revokes}

権限の一部を取り消すことができます。例えば、ユーザーが `SELECT *.*` 権限を持っている場合、特定のテーブルまたはデータベースからデータを読み取る権限を取り消すことが可能です。


## 例 {#examples}

`john`ユーザーアカウントに、`accounts`データベースを除くすべてのデータベースに対するSELECT権限を付与します:

```sql
GRANT SELECT ON *.* TO john;
REVOKE SELECT ON accounts.* FROM john;
```

`mira`ユーザーアカウントに、`accounts.staff`テーブルの`wage`列を除くすべての列に対するSELECT権限を付与します。

```sql
GRANT SELECT ON accounts.staff TO mira;
REVOKE SELECT(wage) ON accounts.staff FROM mira;
```

[原文](/operations/settings/settings/)
