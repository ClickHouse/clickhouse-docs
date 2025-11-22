---
description: 'Документация по роли'
sidebar_label: 'ROLE'
sidebar_position: 40
slug: /sql-reference/statements/create/role
title: 'CREATE ROLE'
doc_type: 'reference'
---

Создает новые [роли](../../../guides/sre/user-management/index.md#role-management). Роль — это набор [привилегий](/sql-reference/statements/grant#granting-privilege-syntax). [Пользователь](../../../sql-reference/statements/create/user.md), которому назначена роль, получает все привилегии этой роли.

Синтаксис:

```sql
CREATE ROLE [IF NOT EXISTS | OR REPLACE] name1 [, name2 [,...]] [ON CLUSTER cluster_name]
    [IN access_storage_type]
    [SETTINGS variable [= value] [MIN [=] min_value] [MAX [=] max_value] [CONST|READONLY|WRITABLE|CHANGEABLE_IN_READONLY] | PROFILE 'profile_name'] [,...]
```


## Управление ролями {#managing-roles}

Пользователю может быть назначено несколько ролей. Пользователи могут применять назначенные им роли в произвольных комбинациях с помощью оператора [SET ROLE](../../../sql-reference/statements/set-role.md). Итоговый набор привилегий представляет собой объединение всех привилегий всех применённых ролей. Если пользователю предоставлены привилегии непосредственно на его учётную запись, они также объединяются с привилегиями, предоставленными через роли.

Пользователь может иметь роли по умолчанию, которые применяются при входе в систему. Для установки ролей по умолчанию используйте оператор [SET DEFAULT ROLE](/sql-reference/statements/set-role#set-default-role) или оператор [ALTER USER](/sql-reference/statements/alter/user).

Для отзыва роли используйте оператор [REVOKE](../../../sql-reference/statements/revoke.md).

Для удаления роли используйте оператор [DROP ROLE](/sql-reference/statements/drop#drop-role). Удалённая роль автоматически отзывается у всех пользователей и ролей, которым она была назначена.


## Примеры {#examples}

```sql
CREATE ROLE accountant;
GRANT SELECT ON db.* TO accountant;
```

Эта последовательность запросов создаёт роль `accountant` с привилегией чтения данных из базы данных `db`.

Назначение роли пользователю `mira`:

```sql
GRANT accountant TO mira;
```

После назначения роли пользователь может применить её и выполнить разрешённые запросы. Например:

```sql
SET ROLE accountant;
SELECT * FROM db.*;
```
