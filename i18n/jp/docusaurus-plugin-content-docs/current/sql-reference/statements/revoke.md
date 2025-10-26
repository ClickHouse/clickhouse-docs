---
'description': 'REVOKE ステートメント の文書'
'sidebar_label': 'REVOKE'
'sidebar_position': 39
'slug': '/sql-reference/statements/revoke'
'title': 'REVOKE ステートメント'
'doc_type': 'reference'
---


# REVOKEステートメント

ユーザーまたはロールから権限を取り消します。

## 構文 {#syntax}

**ユーザーからの権限の取り消し**

```sql
REVOKE [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*} FROM {user | CURRENT_USER} [,...] | ALL | ALL EXCEPT {user | CURRENT_USER} [,...]
```

**ユーザーからのロールの取り消し**

```sql
REVOKE [ON CLUSTER cluster_name] [ADMIN OPTION FOR] role [,...] FROM {user | role | CURRENT_USER} [,...] | ALL | ALL EXCEPT {user_name | role_name | CURRENT_USER} [,...]
```

## 説明 {#description}

いくつかの権限を取り消すには、取り消そうとする権限よりも広い範囲の権限を使用できます。たとえば、ユーザーが `SELECT (x,y)` 権限を持っている場合、管理者は `REVOKE SELECT(x,y) ...`、または `REVOKE SELECT * ...`、さらには `REVOKE ALL PRIVILEGES ...` クエリを実行してこの権限を取り消すことができます。

### 部分的な取り消し {#partial-revokes}

権限の一部を取り消すことができます。たとえば、ユーザーが `SELECT *.*` 権限を持っている場合、その権限から特定のテーブルまたはデータベースのデータを読み取る権限を取り消すことができます。

## 例 {#examples}

`john`ユーザーアカウントに `accounts` データベース以外のすべてのデータベースから選択する権限を付与します。

```sql
GRANT SELECT ON *.* TO john;
REVOKE SELECT ON accounts.* FROM john;
```

`mira`ユーザーアカウントに `accounts.staff` テーブルのすべてのカラムから選択する権限を付与しますが、`wage` カラムは除外します。

```sql
GRANT SELECT ON accounts.staff TO mira;
REVOKE SELECT(wage) ON accounts.staff FROM mira;
```

[元の記事](/operations/settings/settings/)
