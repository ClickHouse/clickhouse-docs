---
description: 'Документация для установки роли'
sidebar_label: 'SET ROLE'
sidebar_position: 51
slug: /sql-reference/statements/set-role
title: 'Оператор SET ROLE'
---

Активирует роли для текущего пользователя.

```sql
SET ROLE {DEFAULT | NONE | role [,...] | ALL | ALL EXCEPT role [,...]}
```

## Установка Роли По Умолчанию {#set-default-role}

Устанавливает роли по умолчанию для пользователя.

Роли по умолчанию автоматически активируются при входе пользователя. Вы можете установить по умолчанию только ранее предоставленные роли. Если роль не предоставлена пользователю, ClickHouse выдает исключение.

```sql
SET DEFAULT ROLE {NONE | role [,...] | ALL | ALL EXCEPT role [,...]} TO {user|CURRENT_USER} [,...]
```

## Примеры {#examples}

Установите несколько ролей по умолчанию для пользователя:

```sql
SET DEFAULT ROLE role1, role2, ... TO user
```

Установите все предоставленные роли как роли по умолчанию для пользователя:

```sql
SET DEFAULT ROLE ALL TO user
```

Удалите роли по умолчанию у пользователя:

```sql
SET DEFAULT ROLE NONE TO user
```

Установите все предоставленные роли как роли по умолчанию, за исключением конкретных ролей `role1` и `role2`:

```sql
SET DEFAULT ROLE ALL EXCEPT role1, role2 TO user
```
