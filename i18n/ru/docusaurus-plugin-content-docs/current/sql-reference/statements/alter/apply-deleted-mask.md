---
description: 'Документация для применения маски удалённых строк'
sidebar_label: 'APPLY DELETED MASK'
sidebar_position: 46
slug: /sql-reference/statements/alter/apply-deleted-mask
title: 'Применить маску удалённых строк'
---


# Применить маску удалённых строк

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] APPLY DELETED MASK [IN PARTITION partition_id]
```

Команда применяет маску, созданную с помощью [легковесного удаления](/sql-reference/statements/delete), и принудительно удаляет строки, помеченные как удалённые, с диска. Эта команда является тяжёлой мутацией и семантически эквивалентна запросу ```ALTER TABLE [db].name DELETE WHERE _row_exists = 0```.

:::note
Она работает только для таблиц в семье [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) (включая [реплицированные](../../../engines/table-engines/mergetree-family/replication.md) таблицы).
:::

**См. также**

- [Легковесные удаления](/sql-reference/statements/delete)
- [Тяжёлые удаления](/sql-reference/statements/alter/delete.md)
