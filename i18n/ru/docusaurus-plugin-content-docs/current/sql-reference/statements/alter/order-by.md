---
slug: '/sql-reference/statements/alter/order-by'
sidebar_label: 'ORDER BY'
sidebar_position: 41
description: 'Документация по манипуляции ключевыми выражениями'
title: 'Манипулирование ключевыми выражениями'
doc_type: reference
---
# Манипулирование Ключевыми Выражениями

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY ORDER BY new_expression
```

Команда изменяет [ключ сортировки](../../../engines/table-engines/mergetree-family/mergetree.md) таблицы на `new_expression` (выражение или кортеж выражений). Первичный ключ остается прежним.

Команда легковесна в том смысле, что она изменяет только метаданные. Чтобы сохранить свойство, что строки частей данных упорядочены по выражению ключа сортировки, вы не можете добавлять выражения, содержащие существующие колонки, в ключ сортировки (только колонки, добавленные с помощью команды `ADD COLUMN` в том же запросе `ALTER`, без значения по умолчанию для колонки).

:::note    
Это работает только для таблиц из семейства [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) (включая [реплицированные](../../../engines/table-engines/mergetree-family/replication.md) таблицы).
:::