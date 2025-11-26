---
description: 'Документация по управлению выражением SAMPLE BY'
sidebar_label: 'SAMPLE BY'
sidebar_position: 41
slug: /sql-reference/statements/alter/sample-by
title: 'Управление выражениями ключа выборки'
doc_type: 'reference'
---



# Работа с выражением SAMPLE BY

Доступны следующие операции:



## ИЗМЕНЕНИЕ

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY SAMPLE BY new_expression
```

Команда изменяет [sampling key](../../../engines/table-engines/mergetree-family/mergetree.md) таблицы на `new_expression` (выражение или кортеж выражений). Первичный ключ должен содержать новый ключ выборки.


## УДАЛИТЬ

```sql
ALTER TABLE [db].имя [ON CLUSTER кластер] REMOVE SAMPLE BY
```

Эта команда удаляет [ключ выборки](../../../engines/table-engines/mergetree-family/mergetree.md) таблицы.

Команды `MODIFY` и `REMOVE` являются легковесными в том смысле, что они изменяют только метаданные или удаляют файлы.

:::note\
Эти команды работают только для таблиц семейства [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) (включая [реплицируемые](../../../engines/table-engines/mergetree-family/replication.md) таблицы).
:::
