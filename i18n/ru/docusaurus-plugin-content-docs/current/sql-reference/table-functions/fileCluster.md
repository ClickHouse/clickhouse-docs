---
slug: /sql-reference/table-functions/fileCluster
sidebar_position: 61
sidebar_label: fileCluster
title: 'fileCluster'
description: 'Enables simultaneous processing of files matching a specified path across multiple nodes within a cluster. The initiator establishes connections to worker nodes, expands globs in the file path, and delegates file-reading tasks to worker nodes. Each worker node is querying the initiator for the next file to process, repeating until all tasks are completed (all files are read).'
---


# Функция Таблицы fileCluster

Enables simultaneous processing of files matching a specified path across multiple nodes within a cluster. The initiator establishes connections to worker nodes, expands globs in the file path, and delegates file-reading tasks to worker nodes. Each worker node is querying the initiator for the next file to process, repeating until all tasks are completed (all files are read).

:::note    
Эта функция будет работать _корректно_ только в случае, если набор файлов, соответствующих изначально указанному пути, идентичен на всех узлах и их содержание согласовано между различными узлами.  
В случае, если эти файлы различаются между узлами, возвращаемое значение нельзя предсказать и оно зависит от порядка, в котором рабочие узлы запрашивают задачи у инициатора.
:::

**Синтаксис**

``` sql
fileCluster(cluster_name, path[, format, structure, compression_method])
```

**Аргументы**

- `cluster_name` — Имя кластера, которое используется для формирования набора адресов и параметров подключения к удаленным и локальным серверам.
- `path` — Относительный путь к файлу от [user_files_path](/operations/server-configuration-parameters/settings.md#user_files_path). Путь к файлу также поддерживает [globs](#globs-in-path).
- `format` — [Формат](/sql-reference/formats) файлов. Тип: [String](../../sql-reference/data-types/string.md).
- `structure` — Структура таблицы в формате `'UserID UInt64, Name String'`. Определяет имена колонок и их типы. Тип: [String](../../sql-reference/data-types/string.md).
- `compression_method` — Метод сжатия. Поддерживаемые типы сжатия: `gz`, `br`, `xz`, `zst`, `lz4`, и `bz2`.

**Возвращаемое значение**

Таблица с указанным форматом и структурой и с данными из файлов, соответствующих указанному пути.

**Пример**

Дано, что существует кластер с именем `my_cluster` и задано следующее значение параметра `user_files_path`:

``` bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
Также, имеется файлы `test1.csv` и `test2.csv` внутри `user_files_path` каждого узла кластера, и их содержимое идентично на различных узлах:
```bash
$ cat /var/lib/clickhouse/user_files/test1.csv
    1,"file1"
    11,"file11"

$ cat /var/lib/clickhouse/user_files/test2.csv
    2,"file2"
    22,"file22"
```

Например, эти файлы можно создать, выполнив следующие два запроса на каждом узле кластера:
```sql
INSERT INTO TABLE FUNCTION file('file1.csv', 'CSV', 'i UInt32, s String') VALUES (1,'file1'), (11,'file11');
INSERT INTO TABLE FUNCTION file('file2.csv', 'CSV', 'i UInt32, s String') VALUES (2,'file2'), (22,'file22');
```

Теперь, для чтения содержимого данных файлов `test1.csv` и `test2.csv` через функцию таблицы `fileCluster`:

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

## Globs в пути {#globs-in-path}

Все шаблоны, поддерживаемые функцией таблицы [File](../../sql-reference/table-functions/file.md#globs-in-path), поддерживаются и в FileCluster.

**См. Также**

- [Функция таблицы File](../../sql-reference/table-functions/file.md)
