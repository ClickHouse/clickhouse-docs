---
description: 'Позволяет параллельно обрабатывать файлы из HDFS на множестве узлов в указанном кластере.'
sidebar_label: 'hdfsCluster'
sidebar_position: 81
slug: /sql-reference/table-functions/hdfsCluster
title: 'hdfsCluster'
doc_type: 'reference'
---



# Табличная функция hdfsCluster

Позволяет обрабатывать файлы из HDFS параллельно на множестве узлов заданного кластера. На узле-инициаторе создаётся соединение со всеми узлами кластера, раскрываются символы `*` в пути к файлам HDFS, и каждый файл динамически распределяется по узлам. Рабочий узел запрашивает у инициатора следующую задачу и обрабатывает её. Это повторяется до тех пор, пока все задачи не будут выполнены.



## Синтаксис {#syntax}

```sql
hdfsCluster(cluster_name, URI, format, structure)
```


## Аргументы {#arguments}

| Аргумент       | Описание                                                                                                                                                                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cluster_name` | Имя кластера, используемое для формирования набора адресов и параметров подключения к удалённым и локальным серверам.                                                                                                                                                                                |
| `URI`          | URI файла или набора файлов. Поддерживает следующие подстановочные символы в режиме только для чтения: `*`, `**`, `?`, `{'abc','def'}` и `{N..M}`, где `N`, `M` — числа, `abc`, `def` — строки. Подробнее см. [Подстановочные символы в пути](../../engines/table-engines/integrations/s3.md#wildcards-in-path). |
| `format`       | [Формат](/sql-reference/formats) файла.                                                                                                                                                                                                                                                |
| `structure`    | Структура таблицы. Формат: `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                                                                                                                                    |


## Возвращаемое значение {#returned_value}

Таблица с указанной структурой для чтения данных из указанного файла.


## Примеры {#examples}

1.  Предположим, у нас есть кластер ClickHouse с именем `cluster_simple` и несколько файлов со следующими URI в HDFS:

- 'hdfs://hdfs1:9000/some_dir/some_file_1'
- 'hdfs://hdfs1:9000/some_dir/some_file_2'
- 'hdfs://hdfs1:9000/some_dir/some_file_3'
- 'hdfs://hdfs1:9000/another_dir/some_file_1'
- 'hdfs://hdfs1:9000/another_dir/some_file_2'
- 'hdfs://hdfs1:9000/another_dir/some_file_3'

2.  Запрос для подсчета количества строк в этих файлах:

```sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3.  Запрос для подсчета количества строк во всех файлах этих двух каталогов:

```sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
Если список файлов содержит диапазоны чисел с ведущими нулями, используйте конструкцию с фигурными скобками для каждой цифры отдельно или символ `?`.
:::


## Связанные разделы {#related}

- [Движок HDFS](../../engines/table-engines/integrations/hdfs.md)
- [Табличная функция HDFS](../../sql-reference/table-functions/hdfs.md)
