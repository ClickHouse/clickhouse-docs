---
description: 'ロールに関するドキュメント'
sidebar_label: 'ロール'
sidebar_position: 40
slug: /sql-reference/statements/create/role
title: 'CREATE ROLE'
doc_type: 'reference'
---

新しい[ロール](../../../guides/sre/user-management/index.md#role-management)を作成します。ロールは[権限](/sql-reference/statements/grant#granting-privilege-syntax)の集合です。[ユーザー](../../../sql-reference/statements/create/user.md)にロールが割り当てられると、そのロールに含まれるすべての権限がそのユーザーに付与されます。

構文:

```sql
CREATE ROLE [IF NOT EXISTS | OR REPLACE] name1 [, name2 [,...]] [ON CLUSTER cluster_name]
    [IN access_storage_type]
    [SETTINGS variable [= value] [MIN [=] min_value] [MAX [=] max_value] [CONST|READONLY|WRITABLE|CHANGEABLE_IN_READONLY] | PROFILE 'profile_name'] [,...]
```


## ロールの管理 {#managing-roles}

ユーザーには複数のロールを割り当てることができます。ユーザーは[SET ROLE](../../../sql-reference/statements/set-role.md)文を使用して、割り当てられたロールを任意の組み合わせで適用できます。最終的な権限のスコープは、適用されたすべてのロールの権限を統合したものになります。ユーザーアカウントに直接付与された権限がある場合、それらもロールによって付与された権限と統合されます。

ユーザーは、ログイン時に適用されるデフォルトロールを設定できます。デフォルトロールを設定するには、[SET DEFAULT ROLE](/sql-reference/statements/set-role#set-default-role)文または[ALTER USER](/sql-reference/statements/alter/user)文を使用します。

ロールを取り消すには、[REVOKE](../../../sql-reference/statements/revoke.md)文を使用します。

ロールを削除するには、[DROP ROLE](/sql-reference/statements/drop#drop-role)文を使用します。削除されたロールは、それが割り当てられていたすべてのユーザーとロールから自動的に取り消されます。


## 例 {#examples}

```sql
CREATE ROLE accountant;
GRANT SELECT ON db.* TO accountant;
```

この一連のクエリは、`db`データベースからデータを読み取る権限を持つ`accountant`ロールを作成します。

ユーザー`mira`にロールを割り当てる:

```sql
GRANT accountant TO mira;
```

ロールが割り当てられた後、ユーザーはそれを適用して許可されたクエリを実行できます。例:

```sql
SET ROLE accountant;
SELECT * FROM db.*;
```
