---
slug: '/sql-reference/statements/create/role'
sidebar_position: 40
sidebar_label: 'ROLE'
title: 'CREATE ROLE'
---

新しい [役割](../../../guides/sre/user-management/index.md#role-management) を作成します。役割は一連の [特権](/sql-reference/statements/grant#granting-privilege-syntax) です。役割が割り当てられた [ユーザー](../../../sql-reference/statements/create/user.md) は、この役割のすべての特権を取得します。

構文:

``` sql
CREATE ROLE [IF NOT EXISTS | OR REPLACE] name1 [, name2 [,...]] [ON CLUSTER cluster_name]
    [IN access_storage_type]
    [SETTINGS variable [= value] [MIN [=] min_value] [MAX [=] max_value] [CONST|READONLY|WRITABLE|CHANGEABLE_IN_READONLY] | PROFILE 'profile_name'] [,...]
```

## 役割の管理 {#managing-roles}

ユーザーは複数の役割を割り当てられることができます。ユーザーは [SET ROLE](../../../sql-reference/statements/set-role.md) ステートメントを使用して、割り当てられた役割を任意の組み合わせで適用できます。最終的な特権の範囲は、適用されたすべての役割の特権の結合セットです。ユーザーアカウントに直接付与された特権がある場合、それも役割によって付与された特権と組み合わされます。

ユーザーには、ログイン時に適用されるデフォルトの役割を持つことができます。デフォルトの役割を設定するには、[SET DEFAULT ROLE](/sql-reference/statements/set-role#set-default-role) ステートメントまたは [ALTER USER](/sql-reference/statements/alter/user) ステートメントを使用します。

役割を取り消すには、[REVOKE](../../../sql-reference/statements/revoke.md) ステートメントを使用します。

役割を削除するには、[DROP ROLE](/sql-reference/statements/drop#drop-role) ステートメントを使用します。削除された役割は、自動的にその役割が割り当てられたすべてのユーザーと役割から取り消されます。

## 例 {#examples}

``` sql
CREATE ROLE accountant;
GRANT SELECT ON db.* TO accountant;
```

このクエリのシーケンスは、`db` データベースからデータを読み取る特権を持つ役割 `accountant` を作成します。

役割をユーザー `mira` に割り当てる:

``` sql
GRANT accountant TO mira;
```

役割が割り当てられた後、ユーザーはそれを適用し、許可されたクエリを実行できます。例えば:

``` sql
SET ROLE accountant;
SELECT * FROM db.*;
```
