---
description: 'Документация по SET ROLE'
sidebar_label: 'SET ROLE'
sidebar_position: 51
slug: /sql-reference/statements/set-role
title: 'Оператор SET ROLE'
doc_type: 'reference'
---

Активирует роли для текущего пользователя.

```sql
SET ROLE {DEFAULT | NONE | роль [,...] | ALL | ALL EXCEPT роль [,...]}
```

## SET DEFAULT ROLE {#set-default-role}

Устанавливает роли по умолчанию для пользователя.

Роли по умолчанию автоматически активируются при входе пользователя в систему. В качестве ролей по умолчанию можно указать только ранее назначенные роли. Если роль не назначена пользователю, ClickHouse выбрасывает исключение.

```sql
SET DEFAULT ROLE {NONE | роль [,...] | ALL | ALL EXCEPT роль [,...]} TO {пользователь|CURRENT_USER} [,...]
```

## Примеры {#examples}

Назначение пользователю нескольких ролей по умолчанию:

```sql
SET DEFAULT ROLE роль1, роль2, ... TO пользователь
```

Назначьте все выданные роли ролями по умолчанию для пользователя:

```sql
SET DEFAULT ROLE ALL TO user
```

Удалить у пользователя роли по умолчанию:

```sql
SET DEFAULT ROLE NONE TO user
```

Сделайте все выданные роли ролями по умолчанию, кроме ролей `role1` и `role2`:

```sql
SET DEFAULT ROLE ALL EXCEPT role1, role2 TO user
```
