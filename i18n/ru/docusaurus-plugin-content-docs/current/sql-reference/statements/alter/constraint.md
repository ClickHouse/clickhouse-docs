---
description: 'Документация по операциям с ограничениями'
sidebar_label: 'CONSTRAINT'
sidebar_position: 43
slug: /sql-reference/statements/alter/constraint
title: 'Операции с ограничениями'
doc_type: 'reference'
---

# Управление ограничениями

Ограничения можно добавлять и удалять с помощью следующего синтаксиса:

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] ADD CONSTRAINT [IF NOT EXISTS] constraint_name CHECK expression;
ALTER TABLE [db].name [ON CLUSTER cluster] DROP CONSTRAINT [IF EXISTS] constraint_name;
```

Подробнее см. в разделе [constraints](../../../sql-reference/statements/create/table.md#constraints).

Запросы добавляют или удаляют метаданные об ограничениях из таблицы, поэтому эти операции выполняются немедленно.

:::tip
Проверка ограничений **не будет выполнена** для уже существующих данных, если ограничение было добавлено.
:::

Все изменения в реплицируемых таблицах рассылаются в ZooKeeper и будут также применены на других репликах.
