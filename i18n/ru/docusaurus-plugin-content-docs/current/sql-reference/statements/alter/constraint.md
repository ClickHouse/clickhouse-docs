---
description: 'Документация по манипуляции ограничениями'
sidebar_label: 'ОГРАНИЧЕНИЕ'
sidebar_position: 43
slug: /sql-reference/statements/alter/constraint
title: 'Манипуляция ограничениями'
---


# Манипуляция ограничениями

Ограничения можно добавлять или удалять, используя следующий синтаксис:

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] ADD CONSTRAINT [IF NOT EXISTS] constraint_name CHECK expression;
ALTER TABLE [db].name [ON CLUSTER cluster] DROP CONSTRAINT [IF EXISTS] constraint_name;
```

Подробности см. в разделе [ограничения](../../../sql-reference/statements/create/table.md#constraints).

Запросы добавят или удалят метаданные об ограничениях из таблицы, поэтому они обрабатываются немедленно.

:::tip
Проверка ограничения **не будет выполняться** на уже существующих данных, если оно было добавлено.
:::

Все изменения в реплицированных таблицах транслируются в ZooKeeper и будут применены на остальных репликах.
