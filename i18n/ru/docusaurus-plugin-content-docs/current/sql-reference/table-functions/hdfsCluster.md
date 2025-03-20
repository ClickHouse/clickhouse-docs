---
slug: /sql-reference/table-functions/hdfsCluster
sidebar_position: 81
sidebar_label: hdfsCluster
title: 'hdfsCluster'
description: 'Позволяет обрабатывать файлы из HDFS параллельно с нескольких узлов в указанном кластере.'
---


# Функция Таблицы hdfsCluster

Позволяет обрабатывать файлы из HDFS параллельно с нескольких узлов в указанном кластере. На инициаторе она создает соединение со всеми узлами в кластере, раскрывает символы подстановки в пути к файлу HDFS и динамически распределяет каждый файл. На рабочем узле она запрашивает у инициатора следующую задачу для обработки и выполняет её. Это повторяется до завершения всех задач.

**Синтаксис**

``` sql
hdfsCluster(cluster_name, URI, format, structure)
```

**Аргументы**

- `cluster_name` — Имя кластера, которое используется для построения набора адресов и параметров соединения с удаленными и локальными серверами.
- `URI` — URI к файлу или набору файлов. Поддерживает следующие символы подстановки в режиме только для чтения: `*`, `**`, `?`, `{'abc','def'}` и `{N..M}`, где `N`, `M` — числа, `abc`, `def` — строки. Для получения дополнительной информации смотрите [Символы подстановки в пути](../../engines/table-engines/integrations/s3.md#wildcards-in-path).
- `format` — [формат](/sql-reference/formats) файла.
- `structure` — Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.

**Возвращаемое значение**

Таблица с указанной структурой для чтения данных в указанном файле.

**Примеры**

1.  Предположим, что у нас есть кластер ClickHouse с именем `cluster_simple`, и несколько файлов со следующими URI на HDFS:

- 'hdfs://hdfs1:9000/some_dir/some_file_1'
- 'hdfs://hdfs1:9000/some_dir/some_file_2'
- 'hdfs://hdfs1:9000/some_dir/some_file_3'
- 'hdfs://hdfs1:9000/another_dir/some_file_1'
- 'hdfs://hdfs1:9000/another_dir/some_file_2'
- 'hdfs://hdfs1:9000/another_dir/some_file_3'

2.  Запросите количество строк в этих файлах:

``` sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3.  Запросите количество строк во всех файлах этих двух директорий:

``` sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
Если ваш список файлов содержит диапазоны чисел с ведущими нулями, используйте конструкцию с фигурными скобками для каждой цифры отдельно или используйте `?`.
:::

**Смотрите также**

- [HDFS engine](../../engines/table-engines/integrations/hdfs.md)
- [Функция таблицы HDFS](../../sql-reference/table-functions/hdfs.md)
