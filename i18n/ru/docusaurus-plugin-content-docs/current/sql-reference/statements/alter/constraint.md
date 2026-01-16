---
description: 'Документация по работе с ограничениями'
sidebar_label: 'CONSTRAINT'
sidebar_position: 43
slug: /sql-reference/statements/alter/constraint
title: 'Работа с ограничениями'
doc_type: 'reference'
---

# Управление ограничениями \\{#manipulating-constraints\\}

Ограничения можно добавлять или удалять, используя следующий синтаксис:

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] ADD CONSTRAINT [IF NOT EXISTS] constraint_name CHECK expression;
ALTER TABLE [db].name [ON CLUSTER cluster] DROP CONSTRAINT [IF EXISTS] constraint_name;
```

Подробнее см. в разделе [ограничения](../../../sql-reference/statements/create/table.md#constraints).

Запросы добавляют или удаляют метаданные об ограничениях в таблице, поэтому обрабатываются немедленно.

:::tip
Проверка ограничения **не будет выполнена** для существующих данных, если оно было добавлено.
:::

Все изменения в реплицируемых таблицах транслируются в ZooKeeper и будут применены на других репликах.
