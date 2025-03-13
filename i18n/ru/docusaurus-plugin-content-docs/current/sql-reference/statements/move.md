---
slug: /sql-reference/statements/move
sidebar_position: 54
sidebar_label: MOVE
---


# Оператор MOVE для сущностей доступа

Этот оператор позволяет перемещать сущности доступа из одного хранилища доступа в другое.

Синтаксис:

```sql
MOVE {USER, ROLE, QUOTA, SETTINGS PROFILE, ROW POLICY} name1 [, name2, ...] TO access_storage_type
```

В настоящее время в ClickHouse существует пять хранилищ доступа:
 - `local_directory`
 - `memory`
 - `replicated`
 - `users_xml` (только для чтения)
 - `ldap` (только для чтения)

Примеры:

```sql
MOVE USER test TO local_directory
```

```sql
MOVE ROLE test TO memory
```
