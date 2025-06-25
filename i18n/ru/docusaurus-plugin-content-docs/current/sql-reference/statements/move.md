---
description: 'Документация для оператора MOVE доступа к сущности'
sidebar_label: 'MOVE'
sidebar_position: 54
slug: /sql-reference/statements/move
title: 'Оператор MOVE доступа к сущности'
---


# Оператор MOVE доступа к сущности

Этот оператор позволяет переместить сущность доступа из одного хранилища доступа в другое.

Синтаксис:

```sql
MOVE {USER, ROLE, QUOTA, SETTINGS PROFILE, ROW POLICY} name1 [, name2, ...] TO access_storage_type
```

В настоящее время в ClickHouse имеется пять хранилищ доступа:
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
