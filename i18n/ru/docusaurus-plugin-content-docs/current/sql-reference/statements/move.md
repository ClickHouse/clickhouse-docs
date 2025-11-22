---
description: 'Документация по оператору MOVE для сущностей доступа'
sidebar_label: 'MOVE'
sidebar_position: 54
slug: /sql-reference/statements/move
title: 'Оператор MOVE для сущностей доступа'
doc_type: 'reference'
---

# Оператор MOVE access entity

Этот оператор позволяет перенести объект доступа из одного хранилища доступа в другое.

Синтаксис:

```sql
MOVE {USER, ROLE, QUOTA, SETTINGS PROFILE, ROW POLICY} имя1 [, имя2, ...] TO тип_хранилища_доступа
```

На данный момент в ClickHouse доступны пять хранилищ доступа:

* `local_directory`
* `memory`
* `replicated`
* `users_xml` (ro)
* `ldap` (ro)

Примеры:

```sql
MOVE USER test TO local_directory
```

```sql
MOVE ROLE test TO memory
```
