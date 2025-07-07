---
description: 'Создает таблицу из файлов в HDFS. Эта табличная функция аналогична
  табличным функциям url и file.'
sidebar_label: 'hdfs'
sidebar_position: 80
slug: /sql-reference/table-functions/hdfs
title: 'hdfs'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# hdfs Функция Таблицы

Создает таблицу из файлов в HDFS. Эта табличная функция аналогична [url](../../sql-reference/table-functions/url.md) и [file](../../sql-reference/table-functions/file.md) табличным функциям.

```sql
hdfs(URI, format, structure)
```

**Входные параметры**

- `URI` — Относительный URI к файлу в HDFS. Путь к файлу поддерживает следующие шаблоны в режиме только для чтения: `*`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, \``'abc', 'def'` — строки.
- `format` — [формат](/sql-reference/formats) файла.
- `structure` — Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.

**Возвращаемое значение**

Таблица с указанной структурой для чтения или записи данных в указанном файле.

**Пример**

Таблица из `hdfs://hdfs1:9000/test` и выбор первых двух строк из неё:

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

## Шаблоны в пути {#globs_in_path}

Пути могут использовать шаблоны. Файлы должны соответствовать полному шаблону пути, а не только суффиксу или префиксу.

- `*` — Представляет произвольное количество символов, кроме `/`, но включая пустую строку.
- `**` — Представляет все файлы внутри папки рекурсивно.
- `?` — Представляет произвольный один символ.
- `{some_string,another_string,yet_another_one}` — Заменяет любую из строк `'some_string', 'another_string', 'yet_another_one'`. Строки могут содержать символ `/`.
- `{N..M}` — Представляет любое число `>= N` и `<= M`.

Конструкции с `{}` аналогичны [remote](remote.md) и [file](file.md) табличным функциям.

**Пример**

1.  Предположим, что у нас есть несколько файлов со следующими URI в HDFS:

- 'hdfs://hdfs1:9000/some_dir/some_file_1'
- 'hdfs://hdfs1:9000/some_dir/some_file_2'
- 'hdfs://hdfs1:9000/some_dir/some_file_3'
- 'hdfs://hdfs1:9000/another_dir/some_file_1'
- 'hdfs://hdfs1:9000/another_dir/some_file_2'
- 'hdfs://hdfs1:9000/another_dir/some_file_3'

2.  Запрос количества строк в этих файлах:

<!-- -->

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3.  Запрос количества строк во всех файлах этих двух директорий:

<!-- -->

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
Если ваш список файлов содержит диапазоны чисел с ведущими нулями, используйте конструкцию с фигурными скобками для каждой цифры отдельно или используйте `?`.
:::

**Пример**

Запрос данных из файлов, названия которых `file000`, `file001`, ... , `file999`:

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32')
```

## Виртуальные Столбцы {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер неизвестен, значение будет `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение будет `NULL`.

## Разделение в стиле Hive {#hive-style-partitioning}

При установке `use_hive_partitioning` в 1, ClickHouse будет определять разбиение в стиле Hive в пути (`/name=value/`) и позволит использовать столбцы разбиения в качестве виртуальных столбцов в запросе. Эти виртуальные столбцы будут иметь такие же имена, как в разбиенном пути, но начинаться с `_`.

**Пример**

Использование виртуального столбца, созданного с помощью разбиения в стиле Hive

```sql
SELECT * from HDFS('hdfs://hdfs1:9000/data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## Настройки Хранилища {#storage-settings}

- [hdfs_truncate_on_insert](operations/settings/settings.md#hdfs_truncate_on_insert) - позволяет обрезать файл перед вставкой в него. По умолчанию отключено.
- [hdfs_create_new_file_on_insert](operations/settings/settings.md#hdfs_create_new_file_on_insert) - позволяет создавать новый файл при каждой вставке, если формат имеет суффикс. По умолчанию отключено.
- [hdfs_skip_empty_files](operations/settings/settings.md#hdfs_skip_empty_files) - позволяет пропускать пустые файлы при чтении. По умолчанию отключено.

**См. также**

- [Виртуальные столбцы](../../engines/table-engines/index.md#table_engines-virtual_columns)
