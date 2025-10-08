---
slug: '/sql-reference/table-functions/fileCluster'
sidebar_label: fileCluster
sidebar_position: 61
description: 'Включает однофременную обработку файлов, соответствующих заданному'
title: fileCluster
doc_type: reference
---
# Функция табличного типа fileCluster

Позволяет одновременно обрабатывать файлы, соответствующие указанному пути, на нескольких узлах внутри кластера. Инициатор устанавливает соединения с рабочими узлами, разворачивает шаблоны в пути к файлу и делегирует задачи чтения файлов рабочим узлам. Каждый рабочий узел запрашивает у инициатора следующий файл для обработки, повторяя процесс до завершения всех задач (все файлы прочитаны).

:::note    
Эта функция будет работать _корректно_ только в случае, если набор файлов, соответствующий изначально указанному пути, идентичен на всех узлах, и их содержимое согласовано между различными узлами.  
Если эти файлы различаются между узлами, возвращаемое значение нельзя предсказать и оно зависит от порядка, в котором рабочие узлы запрашивают задания у инициатора.
:::

## Синтаксис {#syntax}

```sql
fileCluster(cluster_name, path[, format, structure, compression_method])
```

## Аргументы {#arguments}

| Аргумент             | Описание                                                                                                                                                                        |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`       | Имя кластера, используемое для построения набора адресов и параметров соединения к удаленным и локальным серверам.                                                                  |
| `path`               | Относительный путь к файлу от [user_files_path](/operations/server-configuration-parameters/settings.md#user_files_path). Путь к файлу также поддерживает [глобальные шаблоны](#globs-in-path). |
| `format`             | [Формат](/sql-reference/formats) файлов. Тип: [String](../../sql-reference/data-types/string.md).                                                                           |
| `structure`          | Структура таблицы в формате `'UserID UInt64, Name String'`. Определяет имена и типы колонок. Тип: [String](../../sql-reference/data-types/string.md).                             |
| `compression_method` | Метод сжатия. Поддерживаемые типы сжатия: `gz`, `br`, `xz`, `zst`, `lz4` и `bz2`.                                                                                     |

## Возвращаемое значение {#returned_value}

Таблица с указанным форматом и структурой и с данными из файлов, соответствующих указанному пути.

**Пример**

При задании кластера с именем `my_cluster` и задании следующего значения настройки `user_files_path`:

```bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
Также, если на каждом узле кластера есть файлы `test1.csv` и `test2.csv`, и их содержимое идентично на различных узлах:
```bash
$ cat /var/lib/clickhouse/user_files/test1.csv
    1,"file1"
    11,"file11"

$ cat /var/lib/clickhouse/user_files/test2.csv
    2,"file2"
    22,"file22"
```

Например, можно создать эти файлы, выполнив эти два запроса на каждом узле кластера:
```sql
INSERT INTO TABLE FUNCTION file('file1.csv', 'CSV', 'i UInt32, s String') VALUES (1,'file1'), (11,'file11');
INSERT INTO TABLE FUNCTION file('file2.csv', 'CSV', 'i UInt32, s String') VALUES (2,'file2'), (22,'file22');
```

Теперь считайте данные из файлов `test1.csv` и `test2.csv` с помощью функции табличного типа `fileCluster`:

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

## Глобальные шаблоны в пути {#globs-in-path}

Все шаблоны, поддерживаемые функцией табличного типа [File](../../sql-reference/table-functions/file.md#globs-in-path), поддерживаются и в FileCluster.

## Связанные {#related}

- [Функция табличного типа File](../../sql-reference/table-functions/file.md)