---
description: 'Документация по манипуляциям с индексами пропуска данных'
sidebar_label: 'ИНДЕКС'
sidebar_position: 42
slug: /sql-reference/statements/alter/skipping-index
title: 'Манипуляции с индексами пропуска данных'
toc_hidden_folder: true
---


# Манипуляции с индексами пропуска данных

Доступны следующие операции:

## ADD INDEX {#add-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] ADD INDEX [IF NOT EXISTS] name expression TYPE type [GRANULARITY value] [FIRST|AFTER name]` - Добавляет описание индекса в метаданные таблиц.

## DROP INDEX {#drop-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] DROP INDEX [IF EXISTS] name` - Удаляет описание индекса из метаданных таблиц и удаляет файлы индекса с диска. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

## MATERIALIZE INDEX {#materialize-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] MATERIALIZE INDEX [IF EXISTS] name [IN PARTITION partition_name]` - Воссоздает вторичный индекс `name` для указанного `partition_name`. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations). Если часть `IN PARTITION` опущена, то индекс воссоздается для всех данных таблицы.

## CLEAR INDEX {#clear-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] CLEAR INDEX [IF EXISTS] name [IN PARTITION partition_name]` - Удаляет файлы вторичного индекса с диска без удаления описания. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

Команды `ADD`, `DROP` и `CLEAR` являются легковесными в том смысле, что они только изменяют метаданные или удаляют файлы. Также они реплицируются, синхронизируя метаданные индексов через ClickHouse Keeper или ZooKeeper.

:::note    
Манипуляция индексами поддерживается только для таблиц с движком [`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) (включая [реплицированные](/engines/table-engines/mergetree-family/replication.md) варианты).
:::
