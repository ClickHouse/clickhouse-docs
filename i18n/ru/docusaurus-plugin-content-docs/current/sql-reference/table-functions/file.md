---
description: 'Движок таблицы, предоставляющий табличный интерфейс для выполнения SELECT и INSERT над файлами, аналогично табличной функции `s3`. Используйте `file()` при работе с локальными файлами и `s3()` при работе с бакетами в объектном хранилище, таком как S3, GCS или MinIO.'
sidebar_label: 'file'
sidebar_position: 60
slug: /sql-reference/table-functions/file
title: 'file'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Табличная функция file

Движок таблицы, который предоставляет табличный интерфейс для выполнения SELECT из файлов и вставки данных в файлы (INSERT), подобный табличной функции [s3](/sql-reference/table-functions/url.md). Используйте `file()` при работе с локальными файлами и `s3()` при работе с бакетами в объектных хранилищах, таких как S3, GCS или MinIO.

Функция `file` может использоваться в запросах `SELECT` и `INSERT` для чтения из файлов или записи в файлы.



## Синтаксис {#syntax}

```sql
file([path_to_archive ::] path [,format] [,structure] [,compression])
```


## Аргументы {#arguments}

| Параметр          | Описание                                                                                                                                                                                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `path`            | Относительный путь к файлу от [user_files_path](operations/server-configuration-parameters/settings.md#user_files_path). В режиме только для чтения поддерживает следующие [глобы](#globs-in-path): `*`, `?`, `{abc,def}` (где `'abc'` и `'def'` — строки) и `{N..M}` (где `N` и `M` — числа). |
| `path_to_archive` | Относительный путь к zip/tar/7z-архиву. Поддерживает те же глобы, что и `path`.                                                                                                                                                                                                                               |
| `format`          | [Формат](/interfaces/formats) файла.                                                                                                                                                                                                                                                                          |
| `structure`       | Структура таблицы. Формат: `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                                                                                                                                                     |
| `compression`     | Тип сжатия: существующий при использовании в запросе `SELECT` или желаемый при использовании в запросе `INSERT`. Поддерживаемые типы сжатия: `gz`, `br`, `xz`, `zst`, `lz4` и `bz2`.                                                                                                              |


## Возвращаемое значение {#returned_value}

Таблица для чтения или записи данных в файле.


## Примеры записи в файл {#examples-for-writing-to-a-file}

### Запись в TSV-файл {#write-to-a-tsv-file}

```sql
INSERT INTO TABLE FUNCTION
file('test.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

В результате данные будут записаны в файл `test.tsv`:


```bash
# cat /var/lib/clickhouse/user_files/test.tsv
1    2    3
3    2    1
1    3    2
```

### Партиционированная запись в несколько TSV-файлов {#partitioned-write-to-multiple-tsv-files}

Если при вставке данных в табличную функцию типа `file()` указать выражение `PARTITION BY`, для каждой партиции будет создан отдельный файл. Разделение данных на отдельные файлы позволяет повысить производительность операций чтения.

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
```


# cat /var/lib/clickhouse/user_files/test_2.tsv
1    3    2



# cat /var/lib/clickhouse/user&#95;files/test&#95;3.tsv

1    2    3

```
```


## Примеры чтения из файла {#examples-for-reading-from-a-file}

### SELECT из CSV-файла {#select-from-a-csv-file}

Сначала задайте `user_files_path` в конфигурации сервера и подготовьте файл `test.csv`:

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

Чтение данных из `table.csv`, расположенного в `archive1.zip` и/или `archive2.zip`:

```sql
SELECT * FROM file('user_files/archives/archive{1..2}.zip :: table.csv');
```


## Глобальные шаблоны в пути {#globs-in-path}

Пути могут использовать глобальные шаблоны. Файлы должны соответствовать всему шаблону пути, а не только суффиксу или префиксу. Существует одно исключение: если путь указывает на существующий
каталог и не использует глобальные шаблоны, к пути будет неявно добавлен символ `*`, чтобы
были выбраны все файлы в каталоге.

- `*` — Соответствует произвольному количеству символов, кроме `/`, включая пустую строку.
- `?` — Соответствует одному произвольному символу.
- `{some_string,another_string,yet_another_one}` — Подставляет любую из строк `'some_string', 'another_string', 'yet_another_one'`. Строки могут содержать символ `/`.
- `{N..M}` — Соответствует любому числу `>= N` и `<= M`.
- `**` — Соответствует всем файлам внутри папки рекурсивно.

Конструкции с `{}` аналогичны табличным функциям [remote](remote.md) и [hdfs](hdfs.md).


## Примеры {#examples}

**Пример**

Предположим, что существуют следующие файлы с относительными путями:

- `some_dir/some_file_1`
- `some_dir/some_file_2`
- `some_dir/some_file_3`
- `another_dir/some_file_1`
- `another_dir/some_file_2`
- `another_dir/some_file_3`

Запрос для подсчета общего количества строк во всех файлах:

```sql
SELECT count(*) FROM file('{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32');
```

Альтернативное выражение пути, дающее тот же результат:

```sql
SELECT count(*) FROM file('{some,another}_dir/*', 'TSV', 'name String, value UInt32');
```

Запрос для подсчета общего количества строк в `some_dir` с использованием неявного `*`:

```sql
SELECT count(*) FROM file('some_dir', 'TSV', 'name String, value UInt32');
```

:::note
Если список файлов содержит числовые диапазоны с ведущими нулями, используйте конструкцию с фигурными скобками для каждой цифры отдельно или используйте `?`.
:::

**Пример**

Запрос для подсчета общего количества строк в файлах с именами `file000`, `file001`, ... , `file999`:

```sql
SELECT count(*) FROM file('big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32');
```

**Пример**

Запрос для подсчета общего количества строк из всех файлов в каталоге `big_dir/` рекурсивно:

```sql
SELECT count(*) FROM file('big_dir/**', 'CSV', 'name String, value UInt32');
```

**Пример**

Запрос для подсчета общего количества строк из всех файлов `file002` в любой папке каталога `big_dir/` рекурсивно:

```sql
SELECT count(*) FROM file('big_dir/**/file002', 'CSV', 'name String, value UInt32');
```


## Виртуальные столбцы {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер файла неизвестен, значение — `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение — `NULL`.


## Настройка use_hive_partitioning {#hive-style-partitioning}

Когда настройка `use_hive_partitioning` установлена в 1, ClickHouse будет обнаруживать партиционирование в стиле Hive в пути (`/name=value/`) и позволит использовать столбцы партиций как виртуальные столбцы в запросе. Эти виртуальные столбцы будут иметь те же имена, что и в партиционированном пути, но начинающиеся с `_`.

**Пример**

Использование виртуального столбца, созданного с партиционированием в стиле Hive

```sql
SELECT * FROM file('data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```


## Настройки {#settings}

| Настройка                                                                                                            | Описание                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists)                   | Позволяет выбирать пустые данные из несуществующего файла. По умолчанию отключено.                                                                                            |
| [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert)                     | Позволяет очищать файл перед вставкой данных в него. По умолчанию отключено.                                                                                                         |
| [engine_file_allow_create_multiple_files](operations/settings/settings.md#engine_file_allow_create_multiple_files) | Позволяет создавать новый файл при каждой вставке, если формат имеет суффикс. По умолчанию отключено.                                                                                       |
| [engine_file_skip_empty_files](operations/settings/settings.md#engine_file_skip_empty_files)                       | Позволяет пропускать пустые файлы при чтении. По умолчанию отключено.                                                                                                              |
| [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists)                          | Метод чтения данных из файла хранилища, один из: read, pread, mmap (только для clickhouse-local). Значение по умолчанию: `pread` для clickhouse-server, `mmap` для clickhouse-local. |


## Связанные разделы {#related}

- [Виртуальные столбцы](engines/table-engines/index.md#table_engines-virtual_columns)
- [Переименование файлов после обработки](operations/settings/settings.md#rename_files_after_processing)
