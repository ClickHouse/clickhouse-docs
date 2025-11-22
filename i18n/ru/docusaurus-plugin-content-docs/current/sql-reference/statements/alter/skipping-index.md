---
description: 'Документация по работе с индексами пропуска данных'
sidebar_label: 'ИНДЕКС'
sidebar_position: 42
slug: /sql-reference/statements/alter/skipping-index
title: 'Работа с индексами пропуска данных'
toc_hidden_folder: true
doc_type: 'reference'
---



# Операции с индексами пропуска данных

Доступны следующие операции:



## ADD INDEX {#add-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] ADD INDEX [IF NOT EXISTS] name expression TYPE type [GRANULARITY value] [FIRST|AFTER name]` — добавляет описание индекса в метаданные таблицы.


## DROP INDEX {#drop-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] DROP INDEX [IF EXISTS] name` - Удаляет описание индекса из метаданных таблицы и удаляет файлы индекса с диска. Реализовано в виде [мутации](/sql-reference/statements/alter/index.md#mutations).


## MATERIALIZE INDEX {#materialize-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] MATERIALIZE INDEX [IF EXISTS] name [IN PARTITION partition_name]` - Перестраивает вторичный индекс `name` для указанной партиции `partition_name`. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations). Если секция `IN PARTITION` опущена, индекс перестраивается для всех данных таблицы.


## CLEAR INDEX {#clear-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] CLEAR INDEX [IF EXISTS] name [IN PARTITION partition_name]` - Удаляет файлы вторичного индекса с диска, не удаляя его описание. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

Команды `ADD`, `DROP` и `CLEAR` являются легковесными в том смысле, что они только изменяют метаданные или удаляют файлы.
Кроме того, они реплицируются, синхронизируя метаданные индексов через ClickHouse Keeper или ZooKeeper.

:::note  
Манипуляции с индексами поддерживаются только для таблиц с движком [`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) (включая [реплицируемые](/engines/table-engines/mergetree-family/replication.md) варианты).
:::
