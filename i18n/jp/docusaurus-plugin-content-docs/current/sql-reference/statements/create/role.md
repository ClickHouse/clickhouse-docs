---
'description': 'Documentation for Role'
'sidebar_label': 'ROLE'
'sidebar_position': 40
'slug': '/sql-reference/statements/create/role'
'title': 'CREATE ROLE'
---



新しい [roles](../../../guides/sre/user-management/index.md#role-management) を作成します。ロールは一連の [privileges](/sql-reference/statements/grant#granting-privilege-syntax) です。ロールが割り当てられた [user](../../../sql-reference/statements/create/user.md) は、このロールのすべての権限を取得します。

構文:

```sql
CREATE ROLE [IF NOT EXISTS | OR REPLACE] name1 [, name2 [,...]] [ON CLUSTER cluster_name]
    [IN access_storage_type]
    [SETTINGS variable [= value] [MIN [=] min_value] [MAX [=] max_value] [CONST|READONLY|WRITABLE|CHANGEABLE_IN_READONLY] | PROFILE 'profile_name'] [,...]
```

## Managing Roles {#managing-roles}

ユーザーは複数のロールを割り当てられることができます。ユーザーは [SET ROLE](../../../sql-reference/statements/set-role.md) ステートメントによって、割り当てられたロールを任意の組み合わせで適用できます。最終的な権限の範囲は、適用されたすべてのロールの権限の組み合わせです。ユーザーがそのユーザーアカウントに直接付与された権限も、ロールによって付与された権限と組み合わされます。

ユーザーはログイン時に適用されるデフォルトのロールを持つことができます。デフォルトのロールを設定するには、[SET DEFAULT ROLE](/sql-reference/statements/set-role#set-default-role) ステートメントまたは [ALTER USER](/sql-reference/statements/alter/user) ステートメントを使用します。

ロールを取り消すには、[REVOKE](../../../sql-reference/statements/revoke.md) ステートメントを使用します。

ロールを削除するには、[DROP ROLE](/sql-reference/statements/drop#drop-role) ステートメントを使用します。削除されたロールは、それが割り当てられていたすべてのユーザーおよびロールから自動的に取り消されます。

## Examples {#examples}

```sql
CREATE ROLE accountant;
GRANT SELECT ON db.* TO accountant;
```

このクエリのシーケンスは、`db` データベースからデータを読み取る権限を持つ `accountant` というロールを作成します。

ロールをユーザー `mira` に割り当てる:

```sql
GRANT accountant TO mira;
```

ロールが割り当てられると、ユーザーはそれを適用し、許可されたクエリを実行できます。例えば:

```sql
SET ROLE accountant;
SELECT * FROM db.*;
```
