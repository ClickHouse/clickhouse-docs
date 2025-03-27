---
description: 'Документация по манипуляциям с ограничениями'
sidebar_label: 'ОГРАНИЧЕНИЕ'
sidebar_position: 43
slug: /sql-reference/statements/alter/constraint
title: 'Манипуляции с ограничениями'
---


# Манипуляции с ограничениями

Ограничения могут быть добавлены или удалены с использованием следующего синтаксиса:

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] ADD CONSTRAINT [IF NOT EXISTS] constraint_name CHECK expression;
ALTER TABLE [db].name [ON CLUSTER cluster] DROP CONSTRAINT [IF EXISTS] constraint_name;
```

Подробнее о [ограничениях](../../../sql-reference/statements/create/table.md#constraints).

Запросы будут добавлять или удалять метаданные об ограничениях из таблицы, поэтому они обрабатываются немедленно.

:::tip
Проверка ограничения **не будет выполнена** на существующих данных, если оно было добавлено.
:::

Все изменения в реплицированных таблицах транслируются в ZooKeeper и будут применены и на других репликах.
