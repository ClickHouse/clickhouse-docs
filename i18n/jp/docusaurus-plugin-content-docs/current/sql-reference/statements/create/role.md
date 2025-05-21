---
description: '役割に関するドキュメント'
sidebar_label: '役割'
sidebar_position: 40
slug: /sql-reference/statements/create/role
title: '役割の作成'
---

新しい[役割](../../../guides/sre/user-management/index.md#role-management)を作成します。役割は[特権](/sql-reference/statements/grant#granting-privilege-syntax)の集合です。役割が割り当てられた[user](../../../sql-reference/statements/create/user.md)は、この役割のすべての特権を取得します。

構文:

```sql
CREATE ROLE [IF NOT EXISTS | OR REPLACE] name1 [, name2 [,...]] [ON CLUSTER cluster_name]
    [IN access_storage_type]
    [SETTINGS variable [= value] [MIN [=] min_value] [MAX [=] max_value] [CONST|READONLY|WRITABLE|CHANGEABLE_IN_READONLY] | PROFILE 'profile_name'] [,...]
```

## 役割の管理 {#managing-roles}

ユーザーは複数の役割を割り当てられることがあります。ユーザーは、[SET ROLE](../../../sql-reference/statements/set-role.md) 文を使用して、割り当てられた役割を任意の組み合わせで適用できます。特権の最終的な範囲は、適用されたすべての役割の特権の集合になります。ユーザーが自分のユーザーアカウントに直接付与された特権がある場合、それらは役割によって付与された特権とも組み合わされます。

ユーザーは、ユーザーログイン時に適用されるデフォルトの役割を持つことができます。デフォルトの役割を設定するには、[SET DEFAULT ROLE](/sql-reference/statements/set-role#set-default-role) 文または [ALTER USER](/sql-reference/statements/alter/user) 文を使用します。

役割を取り消すには、[REVOKE](../../../sql-reference/statements/revoke.md) 文を使用します。

役割を削除するには、[DROP ROLE](/sql-reference/statements/drop#drop-role) 文を使用します。削除された役割は、自動的にそれが割り当てられていたすべてのユーザーおよび役割から取り消されます。

## 例 {#examples}

```sql
CREATE ROLE accountant;
GRANT SELECT ON db.* TO accountant;
```

このクエリのシーケンスは、`db` データベースからデータを読み取る特権を持つ `accountant` という役割を作成します。

役割をユーザー `mira` に割り当てる:

```sql
GRANT accountant TO mira;
```

役割が割り当てられた後、ユーザーはそれを適用し、許可されたクエリを実行できます。例えば:

```sql
SET ROLE accountant;
SELECT * FROM db.*;
```
