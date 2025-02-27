---
slug: /sql-reference/statements/create/role
sidebar_position: 40
sidebar_label: ROLE
title: "ROLEを作成する"
---

新しい[ロール](../../../guides/sre/user-management/index.md#role-management)を作成します。ロールは一連の[権限](../../../sql-reference/statements/grant.md#grant-privileges)です。ロールが割り当てられた[ユーザー](../../../sql-reference/statements/create/user.md)は、このロールのすべての権限を取得します。

構文:

``` sql
CREATE ROLE [IF NOT EXISTS | OR REPLACE] name1 [, name2 [,...]] [ON CLUSTER cluster_name]
    [IN access_storage_type]
    [SETTINGS variable [= value] [MIN [=] min_value] [MAX [=] max_value] [CONST|READONLY|WRITABLE|CHANGEABLE_IN_READONLY] | PROFILE 'profile_name'] [,...]
```

## ロールの管理 {#managing-roles}

ユーザーは複数のロールを割り当てることができます。ユーザーは、[SET ROLE](../../../sql-reference/statements/set-role.md)文を使用して、割り当てられたロールを任意の組み合わせで適用することができます。最終的な権限の範囲は、適用されたすべてのロールの権限の組み合わせです。ユーザーに直接付与された権限は、ロールによって付与された権限と組み合わされます。

ユーザーは、ログイン時に適用されるデフォルトロールを持つことができます。デフォルトロールを設定するには、[SET DEFAULT ROLE](../../../sql-reference/statements/set-role.md#set-default-role-statement)文または[ALTER USER](../../../sql-reference/statements/alter/user.md#alter-user-statement)文を使用します。

ロールを取り消すには、[REVOKE](../../../sql-reference/statements/revoke.md)文を使用します。

ロールを削除するには、[DROP ROLE](../../../sql-reference/statements/drop.md#drop-role-statement)文を使用します。削除されたロールは、自動的にそのロールが割り当てられていたすべてのユーザーおよびロールから取り消されます。

## 例 {#examples}

``` sql
CREATE ROLE accountant;
GRANT SELECT ON db.* TO accountant;
```

このクエリのシーケンスは、`db`データベースからデータを読み取る権限を持つロール`accountant`を作成します。

ロールをユーザー`mira`に割り当てる:

``` sql
GRANT accountant TO mira;
```

ロールが割り当てられた後、ユーザーはそれを適用し、許可されたクエリを実行できます。たとえば:

``` sql
SET ROLE accountant;
SELECT * FROM db.*;
```
