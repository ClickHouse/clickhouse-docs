---
description: 'Документация по оператору SET ROLE'
sidebar_label: 'SET ROLE'
sidebar_position: 51
slug: /sql-reference/statements/set-role
title: 'Оператор SET ROLE'
doc_type: 'reference'
---

Активирует роли для текущего пользователя.

```sql
SET ROLE {DEFAULT | NONE | role [,...] | ALL | ALL EXCEPT role [,...]}
```


## SET DEFAULT ROLE {#set-default-role}

Устанавливает роли по умолчанию для пользователя.

Роли по умолчанию автоматически активируются при входе пользователя в систему. В качестве ролей по умолчанию можно установить только ранее назначенные роли. Если роль не назначена пользователю, ClickHouse генерирует исключение.

```sql
SET DEFAULT ROLE {NONE | role [,...] | ALL | ALL EXCEPT role [,...]} TO {user|CURRENT_USER} [,...]
```


## Примеры {#examples}

Установить несколько ролей по умолчанию для пользователя:

```sql
SET DEFAULT ROLE role1, role2, ... TO user
```

Установить все предоставленные роли в качестве ролей по умолчанию для пользователя:

```sql
SET DEFAULT ROLE ALL TO user
```

Удалить роли по умолчанию у пользователя:

```sql
SET DEFAULT ROLE NONE TO user
```

Установить все предоставленные роли в качестве ролей по умолчанию, за исключением конкретных ролей `role1` и `role2`:

```sql
SET DEFAULT ROLE ALL EXCEPT role1, role2 TO user
```
