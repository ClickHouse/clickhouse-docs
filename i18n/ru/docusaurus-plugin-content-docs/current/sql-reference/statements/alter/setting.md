---
slug: '/sql-reference/statements/alter/setting'
sidebar_label: SETTING
sidebar_position: 38
description: 'Документация по манипуляциям с настройками таблиц'
title: 'Манипуляции с настройками таблиц'
doc_type: reference
---
# Манипуляции с настройками таблиц

Существует набор запросов для изменения настроек таблицы. Вы можете изменять настройки или сбрасывать их на значения по умолчанию. Один запрос может изменить несколько настроек одновременно. Если настройка с указанным именем не существует, то запрос вызовет исключение.

**Синтаксис**

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY|RESET SETTING ...
```

:::note    
Эти запросы могут быть применены только к таблицам [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md).
:::

## MODIFY SETTING {#modify-setting}

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

## RESET SETTING {#reset-setting}

Сбрасывает настройки таблицы на значения по умолчанию. Если настройка находится в состоянии по умолчанию, то действие не выполняется.

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

**Смотрите также**

- [Настройки MergeTree](../../../operations/settings/merge-tree-settings.md)