---
slug: /sql-reference/statements/alter/statistics
sidebar_position: 45
sidebar_label: СТАТИСТИКА
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Манипуляция Статистикой Колонок

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

Доступны следующие операции:

-   `ALTER TABLE [db].table ADD STATISTICS [IF NOT EXISTS] (column list) TYPE (type list)` - Добавляет описание статистики в метаданные таблицы.

-   `ALTER TABLE [db].table MODIFY STATISTICS (column list) TYPE (type list)` - Изменяет описание статистики в метаданных таблицы.

-   `ALTER TABLE [db].table DROP STATISTICS [IF EXISTS] (column list)` - Удаляет статистику из метаданных указанных колонок и удаляет все объекты статистики во всех частях для указанных колонок.

-   `ALTER TABLE [db].table CLEAR STATISTICS [IF EXISTS] (column list)` - Удаляет все объекты статистики во всех частях для указанных колонок. Объекты статистики могут быть восстановлены с помощью `ALTER TABLE MATERIALIZE STATISTICS`.

-   `ALTER TABLE [db.]table MATERIALIZE STATISTICS [IF EXISTS] (column list)` - Восстанавливает статистику для колонок. Реализовано как [мутация](../../../sql-reference/statements/alter/index.md#mutations). 

Первые две команды являются легковесными в том смысле, что они только изменяют метаданные или удаляют файлы.

Кроме того, они реплицированы, синхронизируя метаданные статистики через ZooKeeper.

## Пример: {#example}

Добавление двух типов статистики к двум колонкам:

```sql
ALTER TABLE t1 MODIFY STATISTICS c, d TYPE TDigest, Uniq;
```

:::note
Статистика поддерживается только для таблиц двигателя [`*MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) (включая [реплицированные](../../../engines/table-engines/mergetree-family/replication.md) варианты).
:::
