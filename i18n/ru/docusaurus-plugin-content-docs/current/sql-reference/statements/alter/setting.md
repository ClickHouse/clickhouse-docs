---
description: 'Документация по работе с настройками таблицы'
sidebar_label: 'SETTING'
sidebar_position: 38
slug: /sql-reference/statements/alter/setting
title: 'Работа с настройками таблицы'
doc_type: 'reference'
---



# Манипуляции с настройками таблицы

Существует набор запросов, позволяющих изменять настройки таблицы. Вы можете изменять настройки или сбрасывать их к значениям по умолчанию. Один запрос может изменять несколько настроек одновременно.
Если настройки с указанным именем не существует, то при выполнении запроса будет сгенерировано исключение.

**Синтаксис**

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY|RESET SETTING ...
```

:::note\
Эти запросы можно применять только к таблицам [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md).
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

Сбрасывает настройки таблицы к значениям по умолчанию. Если настройка уже имеет значение по умолчанию, никаких действий не выполняется.

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

- [Настройки MergeTree](../../../operations/settings/merge-tree-settings.md)
