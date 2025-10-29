---
slug: '/sql-reference/statements/alter/constraint'
sidebar_label: CONSTRAINT
sidebar_position: 43
description: 'Документация по манипулированию ограничениями'
title: 'Управление CONSTRAINT'
doc_type: reference
---
# Управление CONSTRAINT

CONSTRAINT можно добавлять или удалять, используя следующий синтаксис:

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] ADD CONSTRAINT [IF NOT EXISTS] constraint_name CHECK expression;
ALTER TABLE [db].name [ON CLUSTER cluster] DROP CONSTRAINT [IF EXISTS] constraint_name;
```

Смотрите подробнее о [constraints](../../../sql-reference/statements/create/table.md#constraints).

Запросы будут добавлять или удалять метаданные о CONSTRAINT из таблицы, поэтому они обрабатываются немедленно.

:::tip
Проверка CONSTRAINT **не будет выполнена** на существующих данных, если она была добавлена.
:::

Все изменения на реплицированных таблицах транслируются в ZooKeeper и будут применены на других репликах также.