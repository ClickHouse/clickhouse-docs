---
description: 'Позволяет обрабатывать файлы из HDFS параллельно с многих узлов в указанном
  кластере.'
sidebar_label: 'hdfsCluster'
sidebar_position: 81
slug: /sql-reference/table-functions/hdfsCluster
title: 'hdfsCluster'
---


# hdfsCluster Табличная Функция

Позволяет обрабатывать файлы из HDFS параллельно с многих узлов в указанном кластере. На инициаторе создается соединение со всеми узлами в кластере, раскрываются подстановочные знаки в пути к файлам HDFS и динамически распределяются каждое задание. На рабочем узле он запрашивает у инициатора следующее задание для обработки и выполняет его. Это повторяется до завершения всех заданий.

**Синтаксис**

```sql
hdfsCluster(cluster_name, URI, format, structure)
```

**Аргументы**

- `cluster_name` — Название кластера, который используется для построения набора адресов и параметров соединения с удаленными и локальными серверами.
- `URI` — URI к файлу или группе файлов. Поддерживает следующие подстановочные знаки в режиме только для чтения: `*`, `**`, `?`, `{'abc','def'}` и `{N..M}`, где `N`, `M` — числа, `abc`, `def` — строки. Для получения дополнительной информации смотрите [Подстановочные Знаки В Путях](../../engines/table-engines/integrations/s3.md#wildcards-in-path).
- `format` — [формат](/sql-reference/formats) файла.
- `structure` — Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.

**Возвращаемое значение**

Таблица с заданной структурой для чтения данных из указанного файла.

**Примеры**

1.  Предположим, что у нас есть кластер ClickHouse под названием `cluster_simple`, и несколько файлов со следующими URI на HDFS:

- 'hdfs://hdfs1:9000/some_dir/some_file_1'
- 'hdfs://hdfs1:9000/some_dir/some_file_2'
- 'hdfs://hdfs1:9000/some_dir/some_file_3'
- 'hdfs://hdfs1:9000/another_dir/some_file_1'
- 'hdfs://hdfs1:9000/another_dir/some_file_2'
- 'hdfs://hdfs1:9000/another_dir/some_file_3'

2.  Запросите количество строк в этих файлах:

```sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3.  Запросите количество строк во всех файлах этих двух директорий:

```sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
Если ваш список файлов содержит диапазоны чисел с ведущими нулями, используйте конструкцию с фигурными скобками для каждой цифры отдельно или используйте `?`.
:::

**Смотрите Также**

- [HDFS движок](../../engines/table-engines/integrations/hdfs.md)
- [HDFS табличная функция](../../sql-reference/table-functions/hdfs.md)
