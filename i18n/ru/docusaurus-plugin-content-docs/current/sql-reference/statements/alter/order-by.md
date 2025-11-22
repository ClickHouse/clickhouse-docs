---
description: 'Документация по управлению выражениями ключей'
sidebar_label: 'ORDER BY'
sidebar_position: 41
slug: /sql-reference/statements/alter/order-by
title: 'Управление выражениями ключей'
doc_type: 'reference'
---

# Работа с ключевыми выражениями

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY ORDER BY new_expression
```

Команда изменяет [ключ сортировки](../../../engines/table-engines/mergetree-family/mergetree.md) таблицы на `new_expression` (выражение или кортеж выражений). Первичный ключ при этом остаётся тем же.

Команда является легковесной в том смысле, что изменяются только метаданные. Чтобы сохранить свойство, при котором строки в частях данных упорядочены по выражению ключа сортировки, вы не можете добавлять в ключ сортировки выражения, содержащие существующие столбцы (можно использовать только столбцы, добавленные командой `ADD COLUMN` в том же запросе `ALTER`, без значения по умолчанию).

:::note\
Работает только для таблиц семейства [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) (включая [реплицируемые](../../../engines/table-engines/mergetree-family/replication.md) таблицы).
:::
