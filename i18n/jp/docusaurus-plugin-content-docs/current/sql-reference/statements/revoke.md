---
description: 'REVOKE ステートメントに関するドキュメント'
sidebar_label: 'REVOKE'
sidebar_position: 39
slug: /sql-reference/statements/revoke
title: 'REVOKE ステートメント'
doc_type: 'reference'
---



# REVOKE ステートメント {#revoke-statement}

ユーザーまたはロールから権限を取り消します。



## 構文 {#syntax}

**ユーザーから権限を取り消す**

```sql
REVOKE [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*} FROM {user | CURRENT_USER} [,...] | ALL | ALL EXCEPT {user | CURRENT_USER} [,...]
```

**ユーザーからロールを削除する**

```sql
REVOKE [ON CLUSTER cluster_name] [ADMIN OPTION FOR] role [,...] FROM {user | role | CURRENT_USER} [,...] | ALL | ALL EXCEPT {user_name | role_name | CURRENT_USER} [,...]
```


## 説明 {#description}

権限を取り消す際には、取り消したい権限よりも広い範囲の権限を使って取り消すことができます。たとえば、ユーザーが `SELECT (x,y)` 権限を持っている場合、管理者はこの権限を取り消すために `REVOKE SELECT(x,y) ...`、`REVOKE SELECT * ...`、あるいは `REVOKE ALL PRIVILEGES ...` クエリを実行できます。

### 部分的な取り消し {#partial-revokes}

権限の一部だけを取り消すことができます。たとえば、ユーザーが `SELECT *.*` 権限を持っている場合、そのユーザーから、特定のテーブルまたはデータベースに対するデータ読み取り権限だけを取り消すことができます。



## 例 {#examples}

`john` ユーザーアカウントに、`accounts` 以外のすべてのデータベースから `SELECT` できる権限を付与します。

```sql
GRANT SELECT ON *.* TO john;
REVOKE SELECT ON accounts.* FROM john;
```

`mira` ユーザーアカウントに、`accounts.staff` テーブルの `wage` 列を除くすべての列に対する SELECT 権限を付与します。

```sql
GRANT SELECT ON accounts.staff TO mira;
REVOKE SELECT(wage) ON accounts.staff FROM mira;
```

[原文](/operations/settings/settings/)
