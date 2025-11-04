---
slug: '/sql-reference/statements/move'
sidebar_label: MOVE
sidebar_position: 54
description: '文档关于 MOVE запросы рекомендации语句'
title: 'Оператор MOVE доступа к сущности'
doc_type: reference
---
# MOVE access entity statement

Этот оператор позволяет переместить сущность доступа из одного хранилища доступа в другое.

Синтаксис:

```sql
MOVE {USER, ROLE, QUOTA, SETTINGS PROFILE, ROW POLICY} name1 [, name2, ...] TO access_storage_type
```

В данный момент в ClickHouse имеется пять хранилищ доступа:
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