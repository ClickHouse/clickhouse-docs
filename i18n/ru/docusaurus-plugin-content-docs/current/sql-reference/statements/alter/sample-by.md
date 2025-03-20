---
slug: /sql-reference/statements/alter/sample-by
sidebar_position: 41
sidebar_label: SAMPLE BY
title: "Манипулирование выражениями ключа выборки"
---


# Манипулирование выражением SAMPLE BY

Доступны следующие операции:

## MODIFY {#modify}

``` sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY SAMPLE BY new_expression
```

Команда изменяет [ключ выборки](../../../engines/table-engines/mergetree-family/mergetree.md) таблицы на `new_expression` (выражение или кортеж выражений). Первичный ключ должен содержать новый ключ выборки.

## REMOVE {#remove}

``` sql
ALTER TABLE [db].name [ON CLUSTER cluster] REMOVE SAMPLE BY
```

Команда удаляет [ключ выборки](../../../engines/table-engines/mergetree-family/mergetree.md) таблицы.


Команды `MODIFY` и `REMOVE` являются легковесными в том смысле, что они только изменяют метаданные или удаляют файлы.

:::note    
Это работает только для таблиц в семействе [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) (включая [реплицированные](../../../engines/table-engines/mergetree-family/replication.md) таблицы).
:::
