---
slug: /sql-reference/statements/create/settings-profile
sidebar_position: 43
sidebar_label: Профиль настроек
title: "СОЗДАТЬ ПРОФИЛЬ НАСТРОЕК"
---

Создает [профили настроек](../../../guides/sre/user-management/index.md#settings-profiles-management), которые могут быть назначены пользователю или роли.

Синтаксис:

``` sql
CREATE SETTINGS PROFILE [IF NOT EXISTS | OR REPLACE] name1 [, name2 [,...]] 
    [ON CLUSTER cluster_name]
    [IN access_storage_type]
    [SETTINGS variable [= value] [MIN [=] min_value] [MAX [=] max_value] [CONST|READONLY|WRITABLE|CHANGEABLE_IN_READONLY] | INHERIT 'profile_name'] [,...]
    [TO {{role1 | user1 [, role2 | user2 ...]} | NONE | ALL | ALL EXCEPT {role1 | user1 [, role2 | user2 ...]}}]
```

Клаузула `ON CLUSTER` позволяет создавать профили настроек на кластере, см. [Распределенный DDL](../../../sql-reference/distributed-ddl.md).

## Пример {#example}

Создайте пользователя:
```sql
CREATE USER robin IDENTIFIED BY 'password';
```

Создайте профиль настроек `max_memory_usage_profile` с значением и ограничениями для настройки `max_memory_usage` и назначьте его пользователю `robin`:

``` sql
CREATE
SETTINGS PROFILE max_memory_usage_profile SETTINGS max_memory_usage = 100000001 MIN 90000000 MAX 110000000
TO robin
```
