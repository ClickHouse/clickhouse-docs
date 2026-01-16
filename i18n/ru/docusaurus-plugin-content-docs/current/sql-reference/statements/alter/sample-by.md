---
description: 'Документация по изменению выражений ключа выборки SAMPLE BY'
sidebar_label: 'SAMPLE BY'
sidebar_position: 41
slug: /sql-reference/statements/alter/sample-by
title: 'Изменение выражений ключа выборки SAMPLE BY'
doc_type: 'reference'
---

# Работа с выражением SAMPLE BY \\{#manipulating-sample-by-expression\\}

Доступны следующие операции:

## MODIFY \\{#modify\\}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY SAMPLE BY new_expression
```

Команда изменяет [sampling key](../../../engines/table-engines/mergetree-family/mergetree.md) таблицы на `new_expression` (выражение или кортеж выражений). Первичный ключ должен включать новый sampling key.

## REMOVE \\{#remove\\}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] REMOVE SAMPLE BY
```

Команда удаляет [ключ выборки](../../../engines/table-engines/mergetree-family/mergetree.md) таблицы.

Команды `MODIFY` и `REMOVE` являются малозатратными в том смысле, что они только изменяют метаданные или удаляют файлы.

:::note
Работает только для таблиц семейства [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) (включая [реплицируемые](../../../engines/table-engines/mergetree-family/replication.md) таблицы).
:::
