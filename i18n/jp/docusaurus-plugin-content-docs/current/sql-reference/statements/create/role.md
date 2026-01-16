---
description: 'ロールに関するドキュメント'
sidebar_label: 'ROLE'
sidebar_position: 40
slug: /sql-reference/statements/create/role
title: 'CREATE ROLE'
doc_type: 'reference'
---

新しい[ロール](../../../guides/sre/user-management/index.md#role-management)を作成します。ロールは[権限](/sql-reference/statements/grant#granting-privilege-syntax)の集合です。[ユーザー](../../../sql-reference/statements/create/user.md)にロールを割り当てると、そのユーザーにはそのロールに含まれるすべての権限が付与されます。

構文:

```sql
CREATE ROLE [IF NOT EXISTS | OR REPLACE] name1 [, name2 [,...]] [ON CLUSTER cluster_name]
    [IN access_storage_type]
    [SETTINGS variable [= value] [MIN [=] min_value] [MAX [=] max_value] [CONST|READONLY|WRITABLE|CHANGEABLE_IN_READONLY] | PROFILE 'profile_name'] [,...]
```

## ロールの管理 \\{#managing-roles\\}

1人のユーザーには複数のロールを割り当てることができます。ユーザーは、[SET ROLE](../../../sql-reference/statements/set-role.md) ステートメントを使用して、自分に割り当てられたロールを任意の組み合わせで適用できます。最終的な権限の範囲は、適用されたすべてのロールが持つ権限を統合した集合になります。ユーザーアカウントに直接付与された権限がある場合、それらもロールによって付与された権限と統合されます。

ユーザーには、ログイン時に適用されるデフォルトロールを設定できます。デフォルトロールを設定するには、[SET DEFAULT ROLE](/sql-reference/statements/set-role#set-default-role) ステートメント、または [ALTER USER](/sql-reference/statements/alter/user) ステートメントを使用します。

ロールを取り消すには、[REVOKE](../../../sql-reference/statements/revoke.md) ステートメントを使用します。

ロールを削除するには、[DROP ROLE](/sql-reference/statements/drop#drop-role) ステートメントを使用します。削除されたロールは、それが割り当てられていたすべてのユーザーおよびロールから自動的に取り消されます。

## 例 \\{#examples\\}

```sql
CREATE ROLE accountant;
GRANT SELECT ON db.* TO accountant;
```

この一連のクエリでは、`db` データベースからデータを読み取る権限を持つロール `accountant` を作成します。

ユーザー `mira` へのロール割り当て:

```sql
GRANT accountant TO mira;
```

ロールが割り当てられると、ユーザーはそのロールを有効にして、許可されたクエリを実行できます。例えば、次のとおりです。

```sql
SET ROLE accountant;
SELECT * FROM db.*;
```
