---
description: 'Включает одновременную обработку файлов, соответствующих заданному пути, на нескольких узлах кластера. Инициатор устанавливает соединения с рабочими узлами, расширяет шаблоны в пути к файлам и делегирует задачи чтения файлов рабочим узлам. Каждый рабочий узел запрашивает у инициатора следующий файл для обработки, повторяя процесс до завершения всех задач (все файлы прочитаны).'
sidebar_label: 'fileCluster'
sidebar_position: 61
slug: /sql-reference/table-functions/fileCluster
title: 'fileCluster'
---


# Функция таблицы fileCluster

Включает одновременную обработку файлов, соответствующих заданному пути, на нескольких узлах кластера. Инициатор устанавливает соединения с рабочими узлами, расширяет шаблоны в пути к файлам и делегирует задачи чтения файлов рабочим узлам. Каждый рабочий узел запрашивает у инициатора следующий файл для обработки, повторяя процесс до завершения всех задач (все файлы прочитаны).

:::note    
Эта функция будет работать _корректно_ только в случае, если набор файлов, соответствующих изначально указанному пути, идентичен на всех узлах, а их содержимое согласовано на разных узлах.  
Если эти файлы различаются между узлами, возвращаемое значение не может быть предопределено и зависит от порядка, в котором рабочие узлы запрашивают задачи у инициатора.
:::

**Синтаксис**

```sql
fileCluster(cluster_name, path[, format, structure, compression_method])
```

**Аргументы**

- `cluster_name` — Имя кластера, которое используется для построения набора адресов и параметров подключения к удалённым и локальным серверам.
- `path` — Относительный путь к файлу от [user_files_path](/operations/server-configuration-parameters/settings.md#user_files_path). Путь к файлу также поддерживает [шаблоны](#globs-in-path).
- `format` — [Формат](/sql-reference/formats) файлов. Тип: [String](../../sql-reference/data-types/string.md).
- `structure` — Структура таблицы в формате `'UserID UInt64, Name String'`. Определяет имена и типы колонок. Тип: [String](../../sql-reference/data-types/string.md).
- `compression_method` — Метод сжатия. Поддерживаемые типы сжатия: `gz`, `br`, `xz`, `zst`, `lz4` и `bz2`.

**Возвращаемое значение**

Таблица с указанным форматом и структурой и с данными из файлов, соответствующих заданному пути.

**Пример**

Дан кластер с именем `my_cluster` и следующее значение настройки `user_files_path`:

```bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
Также даны файлы `test1.csv` и `test2.csv` внутри `user_files_path` каждого узла кластера, и их содержимое идентично на разных узлах:
```bash
$ cat /var/lib/clickhouse/user_files/test1.csv
    1,"file1"
    11,"file11"

$ cat /var/lib/clickhouse/user_files/test2.csv
    2,"file2"
    22,"file22"
```

Например, можно создать эти файлы, выполнив следующие два запроса на каждом узле кластера:
```sql
INSERT INTO TABLE FUNCTION file('file1.csv', 'CSV', 'i UInt32, s String') VALUES (1,'file1'), (11,'file11');
INSERT INTO TABLE FUNCTION file('file2.csv', 'CSV', 'i UInt32, s String') VALUES (2,'file2'), (22,'file22');
```

Теперь прочитайте содержимое данных из `test1.csv` и `test2.csv` с помощью функции таблицы `fileCluster`:

```sql
SELECT * FROM fileCluster('my_cluster', 'file{1,2}.csv', 'CSV', 'i UInt32, s String') ORDER BY i, s
```

```response
┌──i─┬─s──────┐
│  1 │ file1  │
│ 11 │ file11 │
└────┴────────┘
┌──i─┬─s──────┐
│  2 │ file2  │
│ 22 │ file22 │
└────┴────────┘
```


## Шаблоны в пути {#globs-in-path}

Все шаблоны, поддерживаемые функцией таблицы [File](../../sql-reference/table-functions/file.md#globs-in-path), поддерживаются и функцией FileCluster.

**Смотрите также**

- [Функция таблицы File](../../sql-reference/table-functions/file.md)
