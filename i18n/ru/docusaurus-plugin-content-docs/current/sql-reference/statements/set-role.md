---
slug: '/sql-reference/statements/set-role'
sidebar_label: 'SET ROLE'
sidebar_position: 51
description: 'SET ROLE \0\0'
title: 'Оператор SET ROLE'
doc_type: reference
---
Активирует роли для текущего пользователя.

```sql
SET ROLE {DEFAULT | NONE | role [,...] | ALL | ALL EXCEPT role [,...]}
```

## УСТАНОВИТЬ ПО УМОЛЧАНИЮ РОЛЬ {#set-default-role}

Устанавливает роли по умолчанию для пользователя.

Роли по умолчанию автоматически активируются при входе пользователя. В качестве ролей по умолчанию можно установить только ранее предоставленные роли. Если роль не была предоставлена пользователю, ClickHouse выбрасывает исключение.

```sql
SET DEFAULT ROLE {NONE | role [,...] | ALL | ALL EXCEPT role [,...]} TO {user|CURRENT_USER} [,...]
```

## Примеры {#examples}

Установить несколько ролей по умолчанию для пользователя:

```sql
SET DEFAULT ROLE role1, role2, ... TO user
```

Установить все предоставленные роли по умолчанию для пользователя:

```sql
SET DEFAULT ROLE ALL TO user
```

Очистить роли по умолчанию у пользователя:

```sql
SET DEFAULT ROLE NONE TO user
```

Установить все предоставленные роли по умолчанию, кроме конкретных ролей `role1` и `role2`:

```sql
SET DEFAULT ROLE ALL EXCEPT role1, role2 TO user
```