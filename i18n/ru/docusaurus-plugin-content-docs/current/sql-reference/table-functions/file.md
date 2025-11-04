---
slug: '/sql-reference/table-functions/file'
sidebar_label: file
sidebar_position: 60
description: 'Движок TABLE, который предоставляет интерфейс, похожий на таблицу,'
title: file
doc_type: reference
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Функция Таблицы file

Движок таблицы, который предоставляет интерфейс, похожий на таблицу, для выполнения SELECT и INSERT из файлов, аналогично функции таблицы [s3](/sql-reference/table-functions/url.md). Используйте `file()`, когда работаете с локальными файлами, и `s3()`, когда работаете с корзинами в объектном хранилище, таком как S3, GCS или MinIO.

Функция `file` может использоваться в запросах `SELECT` и `INSERT` для чтения из файлов или записи в них.

## Синтаксис {#syntax}

```sql
file([path_to_archive ::] path [,format] [,structure] [,compression])
```

## Аргументы {#arguments}

| Параметр          | Описание                                                                                                                                                                                                                                                                                                   |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `path`            | Относительный путь к файлу от [user_files_path](operations/server-configuration-parameters/settings.md#user_files_path). Поддерживает в режиме только для чтения следующие [глобусы](#globs-in-path): `*`, `?`, `{abc,def}` (где `'abc'` и `'def'` — строки) и `{N..M}` (где `N` и `M` — числа). |
| `path_to_archive` | Относительный путь к zip/tar/7z архиву. Поддерживает те же глобусы, что и `path`.                                                                                                                                                                                                                                 |
| `format`          | [формат](/interfaces/formats) файла.                                                                                                                                                                                                                                                                |
| `structure`       | Структура таблицы. Формат: `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                                                                                                                                                |
| `compression`     | Существующий тип сжатия при использовании в запросе `SELECT` или желаемый тип сжатия при использовании в запросе `INSERT`. Поддерживаемые типы сжатия: `gz`, `br`, `xz`, `zst`, `lz4` и `bz2`.                                                                                                       |

## Возвращаемое значение {#returned_value}

Таблица для чтения или записи данных в файл.

## Примеры записи в файл {#examples-for-writing-to-a-file}

### Запись в TSV файл {#write-to-a-tsv-file}

```sql
INSERT INTO TABLE FUNCTION
file('test.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

В результате данные записываются в файл `test.tsv`:

```bash

# cat /var/lib/clickhouse/user_files/test.tsv
1    2    3
3    2    1
1    3    2
```

### Разделенная запись в несколько TSV файлов {#partitioned-write-to-multiple-tsv-files}

Если вы укажете выражение `PARTITION BY` при вставке данных в таблицу функции типа `file()`, то для каждой партиции создается отдельный файл. Разделение данных на отдельные файлы помогает улучшить производительность операций чтения.

```sql
INSERT INTO TABLE FUNCTION
file('test_{_partition_id}.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
PARTITION BY column3
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

В результате данные записываются в три файла: `test_1.tsv`, `test_2.tsv` и `test_3.tsv`.

```bash

# cat /var/lib/clickhouse/user_files/test_1.tsv
3    2    1


# cat /var/lib/clickhouse/user_files/test_2.tsv
1    3    2


# cat /var/lib/clickhouse/user_files/test_3.tsv
1    2    3
```

## Примеры чтения из файла {#examples-for-reading-from-a-file}

### SELECT из CSV файла {#select-from-a-csv-file}

Сначала установите `user_files_path` в конфигурации сервера и подготовьте файл `test.csv`:

```bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>

$ cat /var/lib/clickhouse/user_files/test.csv
    1,2,3
    3,2,1
    78,43,45
```

Затем прочитайте данные из `test.csv` в таблицу и выберите первые две строки:

```sql
SELECT * FROM
file('test.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
LIMIT 2;
```

```text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

### Вставка данных из файла в таблицу {#inserting-data-from-a-file-into-a-table}

```sql
INSERT INTO FUNCTION
file('test.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
VALUES (1, 2, 3), (3, 2, 1);
```
```sql
SELECT * FROM
file('test.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32');
```

```text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

Чтение данных из `table.csv`, расположенного в `archive1.zip` или/и `archive2.zip`:

```sql
SELECT * FROM file('user_files/archives/archive{1..2}.zip :: table.csv');
```

## Глобусы в пути {#globs-in-path}

Пути могут использовать глобусы. Файлы должны соответствовать всему шаблону пути, а не только суффиксу или префиксу. Есть одно исключение: если путь ссылается на существующий
каталог и не использует глобусы, то `*` будет неявно добавлен к пути, так что
все файлы в каталоге будут выбраны.

- `*` — Представляет произвольное количество символов, кроме `/`, включая пустую строку.
- `?` — Представляет произвольный одиночный символ.
- `{some_string,another_string,yet_another_one}` — Заменяет любую из строк `'some_string', 'another_string', 'yet_another_one'`. Строки могут содержать символ `/`.
- `{N..M}` — Представляет любое число `>= N` и `<= M`.
- `**` - Представляет все файлы внутри папки рекурсивно.

Конструкции с `{}` аналогичны функциям таблиц [remote](remote.md) и [hdfs](hdfs.md).

## Примеры {#examples}

**Пример**

Предположим, есть эти файлы с следующими относительными путями:

- `some_dir/some_file_1`
- `some_dir/some_file_2`
- `some_dir/some_file_3`
- `another_dir/some_file_1`
- `another_dir/some_file_2`
- `another_dir/some_file_3`

Запросите общее количество строк во всех файлах:

```sql
SELECT count(*) FROM file('{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32');
```

Альтернативное выражение пути, которое достигает того же:

```sql
SELECT count(*) FROM file('{some,another}_dir/*', 'TSV', 'name String, value UInt32');
```

Запросите общее количество строк в `some_dir`, используя неявный `*`:

```sql
SELECT count(*) FROM file('some_dir', 'TSV', 'name String, value UInt32');
```

:::note
Если ваш список файлов содержит диапазоны чисел с ведущими нулями, используйте конструкцию с фигурными скобками для каждой цифры отдельно или используйте `?`.
:::

**Пример**

Запросите общее количество строк в файлах с именами `file000`, `file001`, ... , `file999`:

```sql
SELECT count(*) FROM file('big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32');
```

**Пример**

Запросите общее количество строк во всех файлах внутри директории `big_dir/` рекурсивно:

```sql
SELECT count(*) FROM file('big_dir/**', 'CSV', 'name String, value UInt32');
```

**Пример**

Запросите общее количество строк во всех файлах `file002` внутри любой папки в директории `big_dir/` рекурсивно:

```sql
SELECT count(*) FROM file('big_dir/**/file002', 'CSV', 'name String, value UInt32');
```

## Виртуальные Колонки {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер файла неизвестен, значение будет `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение будет `NULL`.

## Установка use_hive_partitioning {#hive-style-partitioning}

Когда установка `use_hive_partitioning` установлена на 1, ClickHouse будет определять партиционирование в стиле Hive в пути (`/name=value/`) и позволит использовать партиционные колонки в качестве виртуальных колонок в запросе. Эти виртуальные колонки будут иметь те же имена, что и в партиционированном пути, но начинающиеся с `_`.

**Пример**

Используйте виртуальную колонку, созданную с партиционированием в стиле Hive

```sql
SELECT * FROM file('data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```

## Настройки {#settings}

| Настройка                                                                                                            | Описание                                                                                                                                                                 |
|--------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists)                   | позволяет выбирать пустые данные из файла, который не существует. Отключено по умолчанию.                                                                                            |
| [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert)                     | позволяет обрезать файл перед вставкой в него. Отключено по умолчанию.                                                                                                         |
| [engine_file_allow_create_multiple_files](operations/settings/settings.md#engine_file_allow_create_multiple_files) | позволяет создавать новый файл при каждой вставке, если формат имеет суффикс. Отключено по умолчанию.                                                                                       |
| [engine_file_skip_empty_files](operations/settings/settings.md#engine_file_skip_empty_files)                       | позволяет пропускать пустые файлы при чтении. Отключено по умолчанию.                                                                                                              |
| [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists)                          | метод чтения данных из файла хранения, один из: read, pread, mmap (только для clickhouse-local). Значение по умолчанию: `pread` для clickhouse-server, `mmap` для clickhouse-local. |

## Связанные {#related}

- [Виртуальные колонки](engines/table-engines/index.md#table_engines-virtual_columns)
- [Переименование файлов после обработки](operations/settings/settings.md#rename_files_after_processing)