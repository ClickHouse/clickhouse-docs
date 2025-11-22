---
description: 'Документация по Files'
sidebar_label: 'Files'
slug: /sql-reference/functions/files
title: 'Files'
doc_type: 'reference'
---



## file {#file}

Читает файл как строку и загружает данные в указанный столбец. Содержимое файла не интерпретируется.

См. также табличную функцию [file](../table-functions/file.md).

**Синтаксис**

```sql
file(path[, default])
```

**Аргументы**

- `path` — путь к файлу относительно [user_files_path](../../operations/server-configuration-parameters/settings.md#user_files_path). Поддерживаются подстановочные символы `*`, `**`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, а `'abc'`, `'def'` — строки.
- `default` — значение, возвращаемое, если файл не существует или недоступен. Поддерживаемые типы данных: [String](../data-types/string.md) и [NULL](/operations/settings/formats#input_format_null_as_default).

**Пример**

Вставка данных из файлов a.txt и b.txt в таблицу в виде строк:

```sql
INSERT INTO table SELECT file('a.txt'), file('b.txt');
```
