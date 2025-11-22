---
description: 'Создаёт таблицу на основе файлов в HDFS. Эта табличная функция аналогична табличным функциям url и file.'
sidebar_label: 'hdfs'
sidebar_position: 80
slug: /sql-reference/table-functions/hdfs
title: 'hdfs'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Табличная функция hdfs

Создаёт таблицу на основе файлов в HDFS. Эта табличная функция аналогична табличным функциям [url](../../sql-reference/table-functions/url.md) и [file](../../sql-reference/table-functions/file.md).



## Синтаксис {#syntax}

```sql
hdfs(URI, format, structure)
```


## Аргументы {#arguments}

| Аргумент    | Описание                                                                                                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `URI`       | Относительный URI файла в HDFS. Путь к файлу поддерживает следующие glob-шаблоны в режиме только для чтения: `*`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, `'abc', 'def'` — строки. |
| `format`    | [Формат](/sql-reference/formats) файла.                                                                                                                                   |
| `structure` | Структура таблицы. Формат: `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                       |


## Возвращаемое значение {#returned_value}

Таблица с указанной структурой для чтения или записи данных в указанном файле.

**Пример**

Таблица из `hdfs://hdfs1:9000/test` и выборка первых двух строк из неё:

```sql
SELECT *
FROM hdfs('hdfs://hdfs1:9000/test', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
LIMIT 2
```

```text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```


## Глобальные шаблоны в пути {#globs_in_path}

Пути могут использовать глобальные шаблоны. Файлы должны соответствовать всему шаблону пути, а не только суффиксу или префиксу.

- `*` — Соответствует произвольному количеству символов, кроме `/`, включая пустую строку.
- `**` — Соответствует всем файлам внутри папки рекурсивно.
- `?` — Соответствует одному произвольному символу.
- `{some_string,another_string,yet_another_one}` — Подставляет любую из строк `'some_string', 'another_string', 'yet_another_one'`. Строки могут содержать символ `/`.
- `{N..M}` — Соответствует любому числу `>= N` и `<= M`.

Конструкции с `{}` аналогичны табличным функциям [remote](remote.md) и [file](file.md).

**Пример**

1.  Предположим, что у нас есть несколько файлов со следующими URI в HDFS:

- 'hdfs://hdfs1:9000/some_dir/some_file_1'
- 'hdfs://hdfs1:9000/some_dir/some_file_2'
- 'hdfs://hdfs1:9000/some_dir/some_file_3'
- 'hdfs://hdfs1:9000/another_dir/some_file_1'
- 'hdfs://hdfs1:9000/another_dir/some_file_2'
- 'hdfs://hdfs1:9000/another_dir/some_file_3'

2.  Запросим количество строк в этих файлах:

<!-- -->

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3.  Запросим количество строк во всех файлах этих двух каталогов:

<!-- -->

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
Если список файлов содержит диапазоны чисел с ведущими нулями, используйте конструкцию с фигурными скобками для каждой цифры отдельно или используйте `?`.
:::

**Пример**

Запросим данные из файлов с именами `file000`, `file001`, ... , `file999`:

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32')
```


## Виртуальные столбцы {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер неизвестен, значение — `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение — `NULL`.


## Настройка use_hive_partitioning {#hive-style-partitioning}

Когда настройка `use_hive_partitioning` установлена в 1, ClickHouse будет обнаруживать партиционирование в стиле Hive в пути (`/name=value/`) и позволит использовать столбцы партиций как виртуальные столбцы в запросе. Эти виртуальные столбцы будут иметь те же имена, что и в партиционированном пути, но начинающиеся с `_`.

**Пример**

Использование виртуального столбца, созданного с партиционированием в стиле Hive

```sql
SELECT * FROM HDFS('hdfs://hdfs1:9000/data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```


## Настройки хранилища {#storage-settings}

- [hdfs_truncate_on_insert](operations/settings/settings.md#hdfs_truncate_on_insert) - позволяет усекать файл перед вставкой в него данных. По умолчанию отключена.
- [hdfs_create_new_file_on_insert](operations/settings/settings.md#hdfs_create_new_file_on_insert) - позволяет создавать новый файл при каждой вставке, если формат имеет суффикс. По умолчанию отключена.
- [hdfs_skip_empty_files](operations/settings/settings.md#hdfs_skip_empty_files) - позволяет пропускать пустые файлы при чтении. По умолчанию отключена.


## Связанные разделы {#related}

- [Виртуальные столбцы](../../engines/table-engines/index.md#table_engines-virtual_columns)
