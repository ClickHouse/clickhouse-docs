---
description: 'Документация по операциям с настройками таблиц'
sidebar_label: 'НАСТРОЙКИ'
sidebar_position: 38
slug: /sql-reference/statements/alter/setting
title: 'Операции с настройками таблиц'
doc_type: 'reference'
---

# Операции с настройками таблицы {#table-settings-manipulations}

Существует набор запросов для изменения настроек таблицы. Вы можете изменять настройки или сбрасывать их к значениям по умолчанию. Один запрос может изменить сразу несколько настроек.
Если настройки с указанным именем не существует, запрос генерирует исключение.

**Синтаксис**

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY|RESET SETTING ...
```

:::note\
Эти запросы можно применять только к таблицам типа [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md).
:::

## MODIFY SETTING {#modify-setting}

Изменяет параметры таблицы.

**Синтаксис**

```sql
MODIFY SETTING имя_настройки=значение [, ...]
```

**Пример**

```sql
CREATE TABLE example_table (id UInt32, data String) ENGINE=MergeTree() ORDER BY id;

ALTER TABLE example_table MODIFY SETTING max_part_loading_threads=8, max_parts_in_total=50000;
```

## RESET SETTING {#reset-setting}

Сбрасывает настройки таблицы к значениям по умолчанию. Если настройка уже имеет значение по умолчанию, никаких действий не выполняется.

**Синтаксис**

```sql
RESET SETTING имя_настройки [, ...]
```

**Пример**

```sql
CREATE TABLE example_table (id UInt32, data String) ENGINE=MergeTree() ORDER BY id
    SETTINGS max_part_loading_threads=8;

ALTER TABLE example_table RESET SETTING max_part_loading_threads;
```

**См. также**

* [Настройки MergeTree](../../../operations/settings/merge-tree-settings.md)
