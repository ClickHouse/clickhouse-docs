---
slug: /sql-reference/statements/alter/constraint
sidebar_position: 43
sidebar_label: ОГРАНИЧЕНИЕ
---


# Манипулирование ограничениями

Ограничения могут быть добавлены или удалены с использованием следующего синтаксиса:

``` sql
ALTER TABLE [db].name [ON CLUSTER cluster] ADD CONSTRAINT [IF NOT EXISTS] constraint_name CHECK expression;
ALTER TABLE [db].name [ON CLUSTER cluster] DROP CONSTRAINT [IF EXISTS] constraint_name;
```

Смотрите больше о [ограничениях](../../../sql-reference/statements/create/table.md#constraints).

Запросы будут добавлять или удалять метаданные об ограничениях из таблицы, поэтому они обрабатываются немедленно.

:::tip
Проверка ограничения **не будет выполнена** на существующих данных, если оно было добавлено.
:::

Все изменения в реплицируемых таблицах передаются в ZooKeeper и будут применены к другим репликам.
