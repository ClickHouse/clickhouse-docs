---
description: 'Документация по операциям с настройками таблиц'
sidebar_label: 'SETTING'
sidebar_position: 38
slug: /sql-reference/statements/alter/setting
title: 'Операции с настройками таблиц'
doc_type: 'reference'
---

# Операции с настройками таблиц \{#table-settings-manipulations\}

Существует ряд запросов, с помощью которых можно изменять настройки таблицы. Вы можете изменять настройки или сбрасывать их к значениям по умолчанию. Один запрос может изменять несколько настроек одновременно.
Если настройка с указанным именем не существует, запрос завершится с исключением.

**Синтаксис**

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY|RESET SETTING ...
```

:::note
Эти запросы можно применять только к таблицам [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md).
:::

## MODIFY SETTING \{#modify-setting\}

Изменяет настройки таблицы.

**Синтаксис**

```sql
MODIFY SETTING setting_name=value [, ...]
```

**Пример**

```sql
CREATE TABLE example_table (id UInt32, data String) ENGINE=MergeTree() ORDER BY id;

ALTER TABLE example_table MODIFY SETTING max_part_loading_threads=8, max_parts_in_total=50000;
```

## RESET SETTING \{#reset-setting\}

Сбрасывает настройки таблицы до их значений по умолчанию. Если настройка уже имеет значение по умолчанию, действие не выполняется.

**Синтаксис**

```sql
RESET SETTING setting_name [, ...]
```

**Пример**

```sql
CREATE TABLE example_table (id UInt32, data String) ENGINE=MergeTree() ORDER BY id
    SETTINGS max_part_loading_threads=8;

ALTER TABLE example_table RESET SETTING max_part_loading_threads;
```

**См. также**

* [Настройки MergeTree](../../../operations/settings/merge-tree-settings.md)
