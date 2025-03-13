---
slug: /sql-reference/statements/set-role
sidebar_position: 51
sidebar_label: УСТАНОВИТЬ РОЛЬ
title: "УСТАНОВИТЬ РОЛЬ"
---

Активирует роли для текущего пользователя.

``` sql
SET ROLE {DEFAULT | NONE | role [,...] | ALL | ALL EXCEPT role [,...]}
```

## УСТАНОВИТЬ РОЛЬ ПО УМОЛЧАНИЮ {#set-default-role}

Устанавливает роли по умолчанию для пользователя.

Роли по умолчанию автоматически активируются при входе пользователя. Можно установить по умолчанию только ранее предоставленные роли. Если роль не предоставлена пользователю, ClickHouse выбрасывает исключение.

``` sql
SET DEFAULT ROLE {NONE | role [,...] | ALL | ALL EXCEPT role [,...]} TO {user|CURRENT_USER} [,...]
```

## Примеры {#examples}

Установить несколько ролей по умолчанию для пользователя:

``` sql
SET DEFAULT ROLE role1, role2, ... TO user
```

Установить все предоставленные роли по умолчанию для пользователя:

``` sql
SET DEFAULT ROLE ALL TO user
```

Удалить роли по умолчанию у пользователя:

``` sql
SET DEFAULT ROLE NONE TO user
```

Установить все предоставленные роли по умолчанию, кроме конкретных ролей `role1` и `role2`:

``` sql
SET DEFAULT ROLE ALL EXCEPT role1, role2 TO user
```
