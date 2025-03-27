---
description: 'Документация по манипуляции ключевыми выражениями'
sidebar_label: 'ORDER BY'
sidebar_position: 41
slug: /sql-reference/statements/alter/order-by
title: 'Манипуляция ключевыми выражениями'
---


# Манипуляция ключевыми выражениями

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY ORDER BY new_expression
```

Эта команда изменяет [ключ сортировки](../../../engines/table-engines/mergetree-family/mergetree.md) таблицы на `new_expression` (выражение или кортеж выражений). Первичный ключ остается прежним.

Команда является легковесной, поскольку она меняет только метаданные. Чтобы сохранить свойство, что строки частей данных упорядочены по выражению ключа сортировки, вы не можете добавлять выражения, содержащие существующие столбцы, в ключ сортировки (только столбцы, добавленные с помощью команды `ADD COLUMN` в той же команде `ALTER`, без значения столбца по умолчанию).

:::note    
Это работает только для таблиц в семействе [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) (включая [реплицированные](../../../engines/table-engines/mergetree-family/replication.md) таблицы).
:::
