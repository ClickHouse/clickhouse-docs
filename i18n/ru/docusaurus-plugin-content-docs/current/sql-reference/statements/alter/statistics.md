---
description: 'Документация по манипуляции статистиками столбцов'
sidebar_label: 'СТАТИСТИКА'
sidebar_position: 45
slug: /sql-reference/statements/alter/statistics
title: 'Манипуляция статистиками столбцов'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Манипуляция статистиками столбцов

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

Доступные операции:

-   `ALTER TABLE [db].table ADD STATISTICS [IF NOT EXISTS] (column list) TYPE (type list)` - Добавляет описание статистики в метаданные таблиц.

-   `ALTER TABLE [db].table MODIFY STATISTICS (column list) TYPE (type list)` - Изменяет описание статистики в метаданных таблиц.

-   `ALTER TABLE [db].table DROP STATISTICS [IF EXISTS] (column list)` - Удаляет статистику из метаданных указанных столбцов и удаляет все объекты статистики во всех частях для указанных столбцов.

-   `ALTER TABLE [db].table CLEAR STATISTICS [IF EXISTS] (column list)` - Удаляет все объекты статистики во всех частях для указанных столбцов. Объекты статистики могут быть восстановлены с помощью `ALTER TABLE MATERIALIZE STATISTICS`.

-   `ALTER TABLE [db.]table MATERIALIZE STATISTICS [IF EXISTS] (column list)` - Восстанавливает статистику для столбцов. Реализовано как [мутация](../../../sql-reference/statements/alter/index.md#mutations). 

Первые две команды являются легковесными в том смысле, что они только изменяют метаданные или удаляют файлы.

Кроме того, они реплицируются, синхронизируя метаданные статистики через ZooKeeper.

## Пример: {#example}

Добавление двух типов статистики к двум столбцам:

```sql
ALTER TABLE t1 MODIFY STATISTICS c, d TYPE TDigest, Uniq;
```

:::note
Статистика поддерживается только для таблиц движка [`*MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) (включая [реплицированные](../../../engines/table-engines/mergetree-family/replication.md) варианты).
:::
