---
description: 'Документация для ROLE'
sidebar_label: 'ROLE'
sidebar_position: 40
slug: /sql-reference/statements/create/role
title: 'CREATE ROLE'
---

Создает новые [роли](../../../guides/sre/user-management/index.md#role-management). Роль — это набор [привилегий](/sql-reference/statements/grant#granting-privilege-syntax). Пользователь, которому назначена роль, получает все привилегии этой роли.

Синтаксис:

```sql
CREATE ROLE [IF NOT EXISTS | OR REPLACE] name1 [, name2 [,...]] [ON CLUSTER cluster_name]
    [IN access_storage_type]
    [SETTINGS variable [= value] [MIN [=] min_value] [MAX [=] max_value] [CONST|READONLY|WRITABLE|CHANGEABLE_IN_READONLY] | PROFILE 'profile_name'] [,...]
```

## Управление ролями {#managing-roles}

Пользователю могут быть назначены несколько ролей. Пользователи могут применять свои назначенные роли в произвольных комбинациях с помощью оператора [SET ROLE](../../../sql-reference/statements/set-role.md). Конечный объем привилегий — это объединенный набор всех привилегий всех примененных ролей. Если у пользователя есть привилегии, предоставленные напрямую его учетной записи, они также комбинируются с привилегиями, предоставленными ролями.

Пользователь может иметь роли по умолчанию, которые применяются при входе пользователя в систему. Чтобы установить роли по умолчанию, используйте оператор [SET DEFAULT ROLE](/sql-reference/statements/set-role#set-default-role) или оператор [ALTER USER](/sql-reference/statements/alter/user).

Чтобы отозвать роль, используйте оператор [REVOKE](../../../sql-reference/statements/revoke.md).

Чтобы удалить роль, используйте оператор [DROP ROLE](/sql-reference/statements/drop#drop-role). Удаленная роль автоматически отзывается у всех пользователей и ролей, которым она была назначена.

## Примеры {#examples}

```sql
CREATE ROLE accountant;
GRANT SELECT ON db.* TO accountant;
```

Эта последовательность запросов создает роль `accountant`, которая имеет право на чтение данных из базы данных `db`.

Назначение роли пользователю `mira`:

```sql
GRANT accountant TO mira;
```

После назначения роли пользователь может применять ее и выполнять разрешенные запросы. Например:

```sql
SET ROLE accountant;
SELECT * FROM db.*;
```
