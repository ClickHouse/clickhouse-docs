---
description: 'Документация по манипулированию ключевыми выражениями'
sidebar_label: 'ORDER BY'
sidebar_position: 41
slug: /sql-reference/statements/alter/order-by
title: 'Манипулирование ключевыми выражениями'
---


# Манипулирование ключевыми выражениями

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY ORDER BY new_expression
```

Команда изменяет [ключ сортировки](../../../engines/table-engines/mergetree-family/mergetree.md) таблицы на `new_expression` (выражение или кортеж выражений). Первичный ключ остается тем же.

Команда является легковесной в том смысле, что она изменяет только метаданные. Чтобы сохранить свойство, что строки частей данных упорядочены по выражению ключа сортировки, вы не можете добавлять выражения, содержащие существующие колонки, в ключ сортировки (только колонки, добавленные командой `ADD COLUMN` в том же запросе `ALTER`, без значения по умолчанию для колонки).

:::note    
Это работает только для таблиц из семейства [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) (включая [реплицированные](../../../engines/table-engines/mergetree-family/replication.md) таблицы).
:::
