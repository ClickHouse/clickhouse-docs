---
description: 'Документация по оператору MOVE для объектов доступа'
sidebar_label: 'MOVE'
sidebar_position: 54
slug: /sql-reference/statements/move
title: 'Оператор MOVE для объектов доступа'
doc_type: 'reference'
---

# Оператор MOVE access entity {#move-access-entity-statement}

Этот оператор позволяет переместить объект доступа из одного хранилища объектов доступа в другое.

Синтаксис:

```sql
MOVE {USER, ROLE, QUOTA, SETTINGS PROFILE, ROW POLICY} name1 [, name2, ...] TO access_storage_type
```

Сейчас в ClickHouse доступны пять хранилищ доступа:

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
