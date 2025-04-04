---
description: 'Документация по Файлам'
sidebar_label: 'Файлы'
sidebar_position: 75
slug: /sql-reference/functions/files
title: 'Файлы'
---

## file {#file}

Читает файл как строку и загружает данные в указанную колонку. Содержимое файла не интерпретируется.

Также смотрите табличную функцию [file](../table-functions/file.md).

**Синтаксис**

```sql
file(path[, default])
```

**Аргументы**

- `path` — Путь к файлу относительно [user_files_path](../../operations/server-configuration-parameters/settings.md#user_files_path). Поддерживает шаблоны `*`, `**`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, а `'abc', 'def'` — строки.
- `default` — Значение, возвращаемое, если файл не существует или к нему невозможно получить доступ. Поддерживаемые типы данных: [String](../data-types/string.md) и [NULL](/operations/settings/formats#input_format_null_as_default).

**Пример**

Вставка данных из файлов a.txt и b.txt в таблицу как строки:

```sql
INSERT INTO table SELECT file('a.txt'), file('b.txt');
```
