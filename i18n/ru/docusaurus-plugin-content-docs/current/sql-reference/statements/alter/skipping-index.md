---
description: 'Документация по операциям с индексами пропуска данных'
sidebar_label: 'INDEX'
sidebar_position: 42
slug: /sql-reference/statements/alter/skipping-index
title: 'Операции с индексами пропуска данных'
toc_hidden_folder: true
doc_type: 'reference'
---

# Работа с индексами пропуска данных {#manipulating-data-skipping-indices}

Доступны следующие операции:

## ADD INDEX {#add-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] ADD INDEX [IF NOT EXISTS] name expression TYPE type [GRANULARITY value] [FIRST|AFTER name]` - Добавляет описание индекса в метаданные таблицы.

## DROP INDEX {#drop-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] DROP INDEX [IF EXISTS] name` — удаляет описание индекса из метаданных таблицы и файлы индекса с диска. Реализована как [мутация](/sql-reference/statements/alter/index.md#mutations).

## MATERIALIZE INDEX {#materialize-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] MATERIALIZE INDEX [IF EXISTS] name [IN PARTITION partition_name]` — перестраивает вторичный индекс `name` для указанного `partition_name`. Операция реализована как [мутация](/sql-reference/statements/alter/index.md#mutations). Если часть `IN PARTITION` опущена, индекс перестраивается для данных всей таблицы.

## CLEAR INDEX {#clear-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] CLEAR INDEX [IF EXISTS] name [IN PARTITION partition_name]` — удаляет с диска файлы вторичного индекса, при этом не удаляя его описание. Эта операция реализована как [мутация](/sql-reference/statements/alter/index.md#mutations).

Команды `ADD`, `DROP` и `CLEAR` являются «легковесными» в том смысле, что они только изменяют метаданные или удаляют файлы.
Кроме того, они реплицируются, синхронизируя метаданные индексов через ClickHouse Keeper или ZooKeeper.

:::note    
Управление индексами поддерживается только для таблиц с движком [`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) (включая [реплицируемые](/engines/table-engines/mergetree-family/replication.md) варианты).
:::
