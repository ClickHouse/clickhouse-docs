---
slug: '/sql-reference/statements/alter/skipping-index'
sidebar_label: INDEX
sidebar_position: 42
description: 'Документация по манипуляции индексами пропуска данных'
title: 'Манипулирование индексами пропуска данных'
doc_type: reference
toc_hidden_folder: true
---
# Манипулирование индексами пропуска данных

Доступны следующие операции:

## ДОБАВИТЬ ИНДЕКС {#add-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] ADD INDEX [IF NOT EXISTS] name expression TYPE type [GRANULARITY value] [FIRST|AFTER name]` - Добавляет описание индекса в метаданные таблиц.

## УДАЛИТЬ ИНДЕКС {#drop-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] DROP INDEX [IF EXISTS] name` - Удаляет описание индекса из метаданных таблиц и удаляет файлы индекса с диска. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

## МАТЕРИАЛИЗОВАТЬ ИНДЕКС {#materialize-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] MATERIALIZE INDEX [IF EXISTS] name [IN PARTITION partition_name]` - Перестраивает вторичный индекс `name` для указанной `partition_name`. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations). Если часть `IN PARTITION` опущена, то индекс перестраивается для всех данных таблицы.

## ОЧИСТИТЬ ИНДЕКС {#clear-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] CLEAR INDEX [IF EXISTS] name [IN PARTITION partition_name]` - Удаляет файлы вторичного индекса с диска, не удаляя описание. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

Команды `ADD`, `DROP` и `CLEAR` являются легковесными в том смысле, что они изменяют только метаданные или удаляют файлы. Также они реплицируются, синхронизируя метаданные индексов через ClickHouse Keeper или ZooKeeper.

:::note    
Манипулирование индексами поддерживается только для таблиц с движком [`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) (включая [реплицированные](/engines/table-engines/mergetree-family/replication.md) варианты).
:::