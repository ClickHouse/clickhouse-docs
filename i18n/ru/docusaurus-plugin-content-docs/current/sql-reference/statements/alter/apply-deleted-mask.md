---
description: 'Документация для Применения маски удалённых строк'
sidebar_label: 'ПРИМЕНИТЕ МАСКУ УДАЛЁННЫХ'
sidebar_position: 46
slug: /sql-reference/statements/alter/apply-deleted-mask
title: 'Применение маски удалённых строк'
---


# Применение маски удалённых строк

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] APPLY DELETED MASK [IN PARTITION partition_id]
```

Команда применяет маску, созданную с помощью [легковесного удаления](/sql-reference/statements/delete), и принудительно удаляет строки, помеченные как удалённые, с диска. Эта команда является тяжёлой мутацией и семантически эквивалентна запросу ```ALTER TABLE [db].name DELETE WHERE _row_exists = 0```.

:::note
Она работает только с таблицами из семейства [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) (включая [реплицированные](../../../engines/table-engines/mergetree-family/replication.md) таблицы).
:::

**Смотрите также**

- [Легковесные удаления](/sql-reference/statements/delete)
- [Тяжёлые удаления](/sql-reference/statements/alter/delete.md)
