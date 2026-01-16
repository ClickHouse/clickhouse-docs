---
description: 'Документация по применению маски удалённых строк'
sidebar_label: 'ПРИМЕНИТЬ МАСКУ УДАЛЁННЫХ СТРОК'
sidebar_position: 46
slug: /sql-reference/statements/alter/apply-deleted-mask
title: 'Применить маску удалённых строк'
doc_type: 'reference'
---

# Применить маску удалённых строк \{#apply-mask-of-deleted-rows\}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] APPLY DELETED MASK [IN PARTITION partition_id]
```

Команда применяет маску, созданную с помощью [легкого удаления](/sql-reference/statements/delete), и принудительно удаляет с диска строки, помеченные как удаленные. Эта команда выполняет тяжелую мутацию и семантически эквивалентна запросу `ALTER TABLE [db].name DELETE WHERE _row_exists = 0`.

:::note
Работает только для таблиц семейства [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) (включая [реплицируемые](../../../engines/table-engines/mergetree-family/replication.md) таблицы).
:::

**См. также**

* [Легкие удаления](/sql-reference/statements/delete)
* [Тяжелые удаления](/sql-reference/statements/alter/delete.md)
