---
slug: '/sql-reference/functions/files'
sidebar_label: Файлы
description: 'Документация по Files'
title: Файлы
doc_type: reference
---
## file {#file}

Читает файл как строку и загружает данные в указанную колонку. Содержимое файла не интерпретируется.

Также см. табличную функцию [file](../table-functions/file.md).

**Синтаксис**

```sql
file(path[, default])
```

**Аргументы**

- `path` — Путь к файлу относительно [user_files_path](../../operations/server-configuration-parameters/settings.md#user_files_path). Поддерживает подстановочные знаки `*`, `**`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, а `'abc', 'def'` — строки.
- `default` — Значение, возвращаемое, если файл не существует или не может быть доступен. Поддерживаемые типы данных: [String](../data-types/string.md) и [NULL](/operations/settings/formats#input_format_null_as_default).

**Пример**

Вставка данных из файлов a.txt и b.txt в таблицу как строки:

```sql
INSERT INTO table SELECT file('a.txt'), file('b.txt');
```