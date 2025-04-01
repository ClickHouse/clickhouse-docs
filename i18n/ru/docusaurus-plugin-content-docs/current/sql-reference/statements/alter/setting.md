---
description: 'Документация по манипуляциям с настройками таблиц'
sidebar_label: 'НАСТРОЙКА'
sidebar_position: 38
slug: /sql-reference/statements/alter/setting
title: 'Манипуляции с настройками таблиц'
---


# Манипуляции с настройками таблиц

Существует набор запросов для изменения настроек таблицы. Вы можете модифицировать настройки или сбросить их до значений по умолчанию. Один запрос может изменить несколько настроек сразу.
Если настройка с указанным именем не существует, то запрос вызывает исключение.

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

Сбрасывает настройки таблицы до их значений по умолчанию. Если настройка находится в состоянии по умолчанию, то никаких действий не предпринимается.

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
