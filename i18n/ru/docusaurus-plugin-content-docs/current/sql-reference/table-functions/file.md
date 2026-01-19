---
description: 'Движок таблицы, который предоставляет табличный интерфейс для выполнения SELECT из файлов и INSERT в файлы, аналогично табличной функции s3. Используйте `file()` при работе с локальными файлами и `s3()` при работе с бакетами в объектном хранилище, таком как S3, GCS или MinIO.'
sidebar_label: 'file'
sidebar_position: 60
slug: /sql-reference/table-functions/file
title: 'file'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# Табличная функция file \{#file-table-function\}

Табличный движок, который предоставляет табличный интерфейс для выполнения SELECT из файлов и INSERT в файлы, аналогично табличной функции [s3](/sql-reference/table-functions/url.md). Используйте `file()` при работе с локальными файлами и `s3()` при работе с бакетами в объектном хранилище, например S3, GCS или MinIO.

Функция `file` может использоваться в запросах `SELECT` и `INSERT` для чтения из файлов или записи в файлы.

## Синтаксис \{#syntax\}

```sql
file([path_to_archive ::] path [,format] [,structure] [,compression])
```

## Аргументы \{#arguments\}

| Параметр          | Описание                                                                                                                                                                                                                                                                                                       |
|-------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `path`            | Относительный путь к файлу от [user_files_path](operations/server-configuration-parameters/settings.md#user_files_path). В режиме только чтения поддерживает следующие [шаблоны (globs)](#globs-in-path): `*`, `?`, `{abc,def}` (где `'abc'` и `'def'` — строки) и `{N..M}` (где `N` и `M` — числа).               |
| `path_to_archive` | Относительный путь к архиву в формате zip/tar/7z. Поддерживает те же шаблоны, что и `path`.                                                                                                                                                                                                                     |
| `format`          | [Формат](/interfaces/formats) файла.                                                                                                                                                                                                                                                                            |
| `structure`       | Структура таблицы. Формат: `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                                                                                                                                                      |
| `compression`     | Тип существующего сжатия при использовании в запросе `SELECT` или требуемый тип сжатия при использовании в запросе `INSERT`. Поддерживаемые типы сжатия: `gz`, `br`, `xz`, `zst`, `lz4` и `bz2`.                                                                                                               |

## Возвращаемое значение \{#returned_value\}

Таблица для чтения данных из файла или записи в файл.

## Примеры записи в файл \{#examples-for-writing-to-a-file\}

### Запись в файл в формате TSV \{#write-to-a-tsv-file\}

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

### Партиционированная запись в несколько TSV-файлов \{#partitioned-write-to-multiple-tsv-files\}

Если при вставке данных в табличную функцию типа `file()` указать выражение `PARTITION BY`, то для каждого раздела создаётся отдельный файл. Разбиение данных на отдельные файлы помогает повысить производительность операций чтения.

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

# cat /var/lib/clickhouse/user_files/test_2.tsv {#cat-varlibclickhouseuser_filestest_2tsv}
1    3    2

# cat /var/lib/clickhouse/user&#95;files/test&#95;3.tsv {#cat-varlibclickhouseuser_filestest_3tsv}

1    2    3

```bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>

$ cat /var/lib/clickhouse/user_files/test.csv
    1,2,3
    3,2,1
    78,43,45
```

## Примеры чтения из файла {#examples-for-reading-from-a-file}

### SELECT из CSV-файла {#select-from-a-csv-file}

Сначала задайте параметр `user_files_path` в конфигурации сервера и подготовьте файл `test.csv`:

```sql
SELECT * FROM
file('test.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
LIMIT 2;
```

Затем прочитайте данные из `test.csv` в таблицу и выберите ее первые две строки:

```text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

```sql
INSERT INTO FUNCTION
file('test.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
VALUES (1, 2, 3), (3, 2, 1);
```

### Загрузка данных из файла в таблицу {#inserting-data-from-a-file-into-a-table}

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

```sql
SELECT * FROM file('user_files/archives/archive{1..2}.zip :: table.csv');
```

Чтение данных из `table.csv`, находящегося в `archive1.zip` и/или `archive2.zip`:

```sql
SELECT count(*) FROM file('{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32');
```

## Глоб-шаблоны в пути \{#globs-in-path\}

В путях можно использовать глоб-шаблоны. Файлы должны соответствовать всему шаблону пути, а не только суффиксу или префиксу. Есть одно исключение: если путь указывает на существующий каталог и не использует глоб-шаблоны, к пути неявно добавляется `*`, чтобы были выбраны все файлы в каталоге.

- `*` — Обозначает произвольное количество символов, кроме `/`, включая пустую строку.
- `?` — Обозначает один произвольный символ.
- `{some_string,another_string,yet_another_one}` — Подставляет любую из строк `'some_string', 'another_string', 'yet_another_one'`. Строки могут содержать символ `/`.
- `{N..M}` — Обозначает любое число `>= N` и `<= M`.
- `**` — Обозначает все файлы внутри каталога рекурсивно.

Конструкции с `{}` аналогичны табличным функциям [remote](remote.md) и [hdfs](hdfs.md).

## Примеры \{#examples\}

**Пример**

Предположим, что есть файлы со следующими относительными путями:

* `some_dir/some_file_1`
* `some_dir/some_file_2`
* `some_dir/some_file_3`
* `another_dir/some_file_1`
* `another_dir/some_file_2`
* `another_dir/some_file_3`

Выполните запрос, чтобы получить общее число строк во всех файлах:

```sql
SELECT count(*) FROM file('{some,another}_dir/*', 'TSV', 'name String, value UInt32');
```

Альтернативное выражение пути, которое позволяет добиться того же результата:

```sql
SELECT count(*) FROM file('some_dir', 'TSV', 'name String, value UInt32');
```

Выполните запрос, чтобы получить общее количество строк в `some_dir`, используя неявный символ `*`:

```sql
SELECT count(*) FROM file('big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32');
```

:::note
Если в вашем списке файлов есть диапазоны чисел с ведущими нулями, используйте конструкцию с фигурными скобками для каждой цифры отдельно или используйте `?`.
:::

**Пример**

Выполните запрос общего количества строк в файлах с именами `file000`, `file001`, ... , `file999`:

```sql
SELECT count(*) FROM file('big_dir/**', 'CSV', 'name String, value UInt32');
```

**Пример**

Выполните запрос, чтобы рекурсивно получить общее количество строк во всех файлах каталога `big_dir/`:

```sql
SELECT count(*) FROM file('big_dir/**/file002', 'CSV', 'name String, value UInt32');
```

**Пример**

Рекурсивно выполните запрос общего числа строк во всех файлах `file002`, находящихся в любых папках каталога `big_dir/`:

```sql
SELECT * FROM file('data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```

## Виртуальные столбцы \{#virtual-columns\}

- `_path` — путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — имя файла. Тип: `LowCardinality(String)`.
- `_size` — размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер файла неизвестен, значение равно `NULL`.
- `_time` — время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение равно `NULL`.

## настройка use&#95;hive&#95;partitioning \{#hive-style-partitioning\}

Когда настройка `use_hive_partitioning` имеет значение 1, ClickHouse будет обнаруживать секционирование в стиле Hive в пути (`/name=value/`) и позволит использовать столбцы секций как виртуальные столбцы в запросе. Эти виртуальные столбцы будут иметь те же имена, что и в секционированном пути, но с префиксом `_`.

**Пример**

Использование виртуального столбца, создаваемого при секционировании в стиле Hive

```sql
SELECT * FROM file('data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```

## Настройки {#settings}

| Настройка                                                                                                          | Описание                                                                                                                                                                                                          |
|--------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists)                   | позволяет получать пустой набор данных из несуществующего файла. По умолчанию отключено.                                                                                   |
| [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert)                     | позволяет очищать файл перед вставкой в него. По умолчанию отключено.                                                                                                      |
| [engine_file_allow_create_multiple_files](operations/settings/settings.md#engine_file_allow_create_multiple_files) | позволяет создавать новый файл при каждой вставке, если формат имеет суффикс. По умолчанию отключено.                                                                     |
| [engine_file_skip_empty_files](operations/settings/settings.md#engine_file_skip_empty_files)                       | позволяет пропускать пустые файлы при чтении. По умолчанию отключено.                                                                                                      |
| [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists)                          | метод чтения данных из файла хранилища, один из: `read`, `pread`, `mmap` (только для `clickhouse-local`). Значение по умолчанию: `pread` для `clickhouse-server`, `mmap` для `clickhouse-local`. |

## См. также {#related}

- [Виртуальные столбцы](engines/table-engines/index.md#table_engines-virtual_columns)
- [Переименование файлов после обработки](operations/settings/settings.md#rename_files_after_processing)
