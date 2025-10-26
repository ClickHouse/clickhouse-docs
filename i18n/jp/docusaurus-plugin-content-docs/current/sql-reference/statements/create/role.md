---
'description': 'ロールに関するドキュメント'
'sidebar_label': 'ROLE'
'sidebar_position': 40
'slug': '/sql-reference/statements/create/role'
'title': 'CREATE ROLE'
'doc_type': 'reference'
---

新しい [roles](../../../guides/sre/user-management/index.md#role-management) を作成します。ロールは、一連の [privileges](/sql-reference/statements/grant#granting-privilege-syntax) です。ロールに割り当てられた [user](../../../sql-reference/statements/create/user.md) は、このロールのすべての権限を取得します。

構文：

```sql
CREATE ROLE [IF NOT EXISTS | OR REPLACE] name1 [, name2 [,...]] [ON CLUSTER cluster_name]
    [IN access_storage_type]
    [SETTINGS variable [= value] [MIN [=] min_value] [MAX [=] max_value] [CONST|READONLY|WRITABLE|CHANGEABLE_IN_READONLY] | PROFILE 'profile_name'] [,...]
```

## ロールの管理 {#managing-roles}

ユーザーには複数のロールを割り当てることができます。ユーザーは、[SET ROLE](../../../sql-reference/statements/set-role.md) ステートメントを使用して、割り当てられたロールを任意の組み合わせで適用できます。権限の最終的な範囲は、適用されたすべてのロールのすべての権限の組み合わせです。ユーザーアカウントに直接付与された権限がある場合、それらもロールによって付与された権限と組み合わされます。

ユーザーは、ユーザーログイン時に適用されるデフォルトのロールを持つことができます。デフォルトのロールを設定するには、[SET DEFAULT ROLE](/sql-reference/statements/set-role#set-default-role) ステートメントまたは [ALTER USER](/sql-reference/statements/alter/user) ステートメントを使用します。

ロールを取り消すには、[REVOKE](../../../sql-reference/statements/revoke.md) ステートメントを使用します。

ロールを削除するには、[DROP ROLE](/sql-reference/statements/drop#drop-role) ステートメントを使用します。削除されたロールは、それが割り当てられたすべてのユーザーとロールから自動的に取り消されます。

## 例 {#examples}

```sql
CREATE ROLE accountant;
GRANT SELECT ON db.* TO accountant;
```

このクエリのシーケンスは、`db` データベースからデータを読み取る権限を持つ `accountant` ロールを作成します。

ユーザー `mira` にロールを割り当てます：

```sql
GRANT accountant TO mira;
```

ロールが割り当てられた後、ユーザーはそれを適用し、許可されたクエリを実行できます。たとえば：

```sql
SET ROLE accountant;
SELECT * FROM db.*;
```
