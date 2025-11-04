---
slug: '/sql-reference/statements/create/role'
sidebar_label: ROLE
sidebar_position: 40
description: 'Документация для Role'
title: 'CREATE ROLE'
doc_type: reference
---
Создает новые [роли](../../../guides/sre/user-management/index.md#role-management). Роль — это набор [привилегий](/sql-reference/statements/grant#granting-privilege-syntax). Пользователь, которому назначена роль, получает все привилегии этой роли.

Синтаксис:

```sql
CREATE ROLE [IF NOT EXISTS | OR REPLACE] name1 [, name2 [,...]] [ON CLUSTER cluster_name]
    [IN access_storage_type]
    [SETTINGS variable [= value] [MIN [=] min_value] [MAX [=] max_value] [CONST|READONLY|WRITABLE|CHANGEABLE_IN_READONLY] | PROFILE 'profile_name'] [,...]
```

## Управление Ролями {#managing-roles}

Пользователю можно назначить несколько ролей. Пользователи могут применять свои назначенные роли в произвольных комбинациях с помощью оператора [SET ROLE](../../../sql-reference/statements/set-role.md). Конечный объём привилегий — это совокупный набор всех привилегий всех применённых ролей. Если пользователю предоставлены привилегии непосредственно для его учётной записи, они также комбинируются с привилегиями, предоставленными ролями.

У пользователя могут быть роли по умолчанию, которые применяются при входе пользователя. Чтобы установить роли по умолчанию, используйте оператор [SET DEFAULT ROLE](/sql-reference/statements/set-role#set-default-role) или оператор [ALTER USER](/sql-reference/statements/alter/user).

Чтобы отозвать роль, используйте оператор [REVOKE](../../../sql-reference/statements/revoke.md).

Чтобы удалить роль, используйте оператор [DROP ROLE](/sql-reference/statements/drop#drop-role). Удалённая роль автоматически отзывается у всех пользователей и ролей, которым она была назначена.

## Примеры {#examples}

```sql
CREATE ROLE accountant;
GRANT SELECT ON db.* TO accountant;
```

Эта последовательность запросов создаёт роль `accountant`, которая обладает привилегией чтения данных из базы данных `db`.

Назначение роли пользователю `mira`:

```sql
GRANT accountant TO mira;
```

После назначения роли пользователь может применить её и выполнить разрешённые запросы. Например:

```sql
SET ROLE accountant;
SELECT * FROM db.*;
```