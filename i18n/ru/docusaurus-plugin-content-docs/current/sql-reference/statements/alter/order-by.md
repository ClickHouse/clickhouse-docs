---
description: 'Документация по управлению ключевыми выражениями'
sidebar_label: 'ORDER BY'
sidebar_position: 41
slug: /sql-reference/statements/alter/order-by
title: 'Управление ключевыми выражениями'
doc_type: 'reference'
---

# Работа с ключевыми выражениями {#manipulating-key-expressions}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY ORDER BY new_expression
```

Команда изменяет [ключ сортировки](../../../engines/table-engines/mergetree-family/mergetree.md) таблицы на `new_expression` (выражение или кортеж выражений). Первичный ключ остаётся прежним.

Эта команда считается «лёгкой» в том смысле, что изменяет только метаданные. Чтобы сохранить свойство упорядоченности строк частей данных по выражению ключа сортировки, нельзя добавлять в ключ сортировки выражения, содержащие существующие столбцы (допускаются только столбцы, добавленные командой `ADD COLUMN` в том же запросе `ALTER`, без значения столбца по умолчанию).

:::note
Работает только для таблиц семейства [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) (включая [реплицированные](../../../engines/table-engines/mergetree-family/replication.md) таблицы).
:::
