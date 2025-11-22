---
description: 'Документация по применению маски удалённых строк'
sidebar_label: 'ПРИМЕНИТЬ МАСКУ УДАЛЁННЫХ СТРОК'
sidebar_position: 46
slug: /sql-reference/statements/alter/apply-deleted-mask
title: 'Применение маски удалённых строк'
doc_type: 'reference'
---

# Применение маски для удалённых строк

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] APPLY DELETED MASK [IN PARTITION partition_id]
```

Команда применяет маску, созданную [легковесным удалением](/sql-reference/statements/delete), и принудительно удаляет с диска строки, помеченные как удалённые. Эта команда является ресурсоёмкой мутацией и семантически эквивалентна запросу `ALTER TABLE [db].name DELETE WHERE _row_exists = 0`.

:::note
Команда работает только для таблиц семейства [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) (включая [реплицируемые](../../../engines/table-engines/mergetree-family/replication.md) таблицы).
:::

**См. также**

* [Легковесные удаления](/sql-reference/statements/delete)
* [Тяжеловесные удаления](/sql-reference/statements/alter/delete.md)
