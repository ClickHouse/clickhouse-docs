---
description: 'Документация по Управлению CONSTRAINT'
sidebar_label: 'CONSTRAINT'
sidebar_position: 43
slug: /sql-reference/statements/alter/constraint
title: 'Управление CONSTRAINT'
---

# Управление CONSTRAINT

CONSTRAINT могут быть добавлены или удалены с использованием следующего синтаксиса:

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] ADD CONSTRAINT [IF NOT EXISTS] constraint_name CHECK expression;
ALTER TABLE [db].name [ON CLUSTER cluster] DROP CONSTRAINT [IF EXISTS] constraint_name;
```

Смотрите больше о [CONSTRAINT](../../../sql-reference/statements/create/table.md#constraints).

Запросы добавят или удалят метаданные о CONSTRAINT из таблицы, поэтому они обрабатываются немедленно.

:::tip
Проверка CONSTRAINT **не будет выполнена** на существующих данных, если она была добавлена.
:::

Все изменения в реплицируемых таблицах передаются в ZooKeeper и будут применены и к другим репликам.
