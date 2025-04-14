---
alias: []
description: 'Документация по формату Parquet'
input_format: true
keywords: ['Parquet']
output_format: true
slug: /interfaces/formats/Parquet
title: 'Parquet'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

[Apache Parquet](https://parquet.apache.org/) - это формат столбцового хранения, широко распространенный в экосистеме Hadoop. ClickHouse поддерживает операции чтения и записи для этого формата.

## Соответствие типов данных {#data-types-matching-parquet}

Таблица ниже показывает поддерживаемые типы данных и как они соответствуют [типам данных ClickHouse](/sql-reference/data-types/index.md) в запросах `INSERT` и `SELECT`.

| Тип данных Parquet (`INSERT`)                  | Тип данных ClickHouse                                                                                       | Тип данных Parquet (`SELECT`)  |
|-----------------------------------------------|------------------------------------------------------------------------------------------------------------|-------------------------------|
| `BOOL`                                        | [Bool](/sql-reference/data-types/boolean.md)                                                       | `BOOL`                        |
| `UINT8`, `BOOL`                               | [UInt8](/sql-reference/data-types/int-uint.md)                                                     | `UINT8`                       |
| `INT8`                                        | [Int8](/sql-reference/data-types/int-uint.md)/[Enum8](/sql-reference/data-types/enum.md)   | `INT8`                        |
| `UINT16`                                      | [UInt16](/sql-reference/data-types/int-uint.md)                                                    | `UINT16`                      |
| `INT16`                                       | [Int16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md) | `INT16`                       |
| `UINT32`                                      | [UInt32](/sql-reference/data-types/int-uint.md)                                                    | `UINT32`                      |
| `INT32`                                       | [Int32](/sql-reference/data-types/int-uint.md)                                                     | `INT32`                       |
| `UINT64`                                      | [UInt64](/sql-reference/data-types/int-uint.md)                                                    | `UINT64`                      |
| `INT64`                                       | [Int64](/sql-reference/data-types/int-uint.md)                                                     | `INT64`                       |
| `FLOAT`                                       | [Float32](/sql-reference/data-types/float.md)                                                      | `FLOAT`                       |
| `DOUBLE`                                      | [Float64](/sql-reference/data-types/float.md)                                                      | `DOUBLE`                      |
| `DATE`                                        | [Date32](/sql-reference/data-types/date.md)                                                        | `DATE`                        |
| `TIME (ms)`                                   | [DateTime](/sql-reference/data-types/datetime.md)                                                  | `UINT32`                      |
| `TIMESTAMP`, `TIME (us, ns)`                  | [DateTime64](/sql-reference/data-types/datetime64.md)                                              | `TIMESTAMP`                   |
| `STRING`, `BINARY`                            | [String](/sql-reference/data-types/string.md)                                                      | `BINARY`                      |
| `STRING`, `BINARY`, `FIXED_LENGTH_BYTE_ARRAY` | [FixedString](/sql-reference/data-types/fixedstring.md)                                            | `FIXED_LENGTH_BYTE_ARRAY`     |
| `DECIMAL`                                     | [Decimal](/sql-reference/data-types/decimal.md)                                                    | `DECIMAL`                     |
| `LIST`                                        | [Array](/sql-reference/data-types/array.md)                                                        | `LIST`                        |
| `STRUCT`                                      | [Tuple](/sql-reference/data-types/tuple.md)                                                        | `STRUCT`                      |
| `MAP`                                         | [Map](/sql-reference/data-types/map.md)                                                            | `MAP`                         |
| `UINT32`                                      | [IPv4](/sql-reference/data-types/ipv4.md)                                                          | `UINT32`                      |
| `FIXED_LENGTH_BYTE_ARRAY`, `BINARY`           | [IPv6](/sql-reference/data-types/ipv6.md)                                                          | `FIXED_LENGTH_BYTE_ARRAY`     |
| `FIXED_LENGTH_BYTE_ARRAY`, `BINARY`           | [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md)                             | `FIXED_LENGTH_BYTE_ARRAY`     |

Массивы могут быть вложенными и могут иметь значение типа `Nullable` в качестве аргумента. Типы `Tuple` и `Map` также могут быть вложенными.

Не поддерживаемые типы данных Parquet:
- `FIXED_SIZE_BINARY`
- `JSON`
- `UUID`
- `ENUM`.

Типы данных столбцов таблицы ClickHouse могут отличаться от соответствующих полей данных Parquet, которые вставляются. При вставке данных ClickHouse интерпретирует типы данных в соответствии с таблицей выше и затем [приводит типы данных](/sql-reference/functions/type-conversion-functions#cast) к тому типу данных, который задан для столбца таблицы ClickHouse.

## Пример использования {#example-usage}

### Вставка и выборка данных {#inserting-and-selecting-data-parquet}

Вы можете вставить данные Parquet из файла в таблицу ClickHouse, используя следующую команду:

```bash
$ cat {filename} | clickhouse-client --query="INSERT INTO {some_table} FORMAT Parquet"
```

Вы можете выбрать данные из таблицы ClickHouse и сохранить их в каком-либо файле в формате Parquet, используя следующую команду:

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Parquet" > {some_file.pq}
```

Для обмена данными с Hadoop вы можете использовать [`движок таблиц HDFS`](/engines/table-engines/integrations/hdfs.md).

## Настройки формата {#format-settings}

| Настройка                                                                        | Описание                                                                                                                                                                                                                       | По умолчанию |
|----------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| `input_format_parquet_case_insensitive_column_matching`                          | Игнорировать регистр при сопоставлении столбцов Parquet с столбцами CH.                                                                                                                                                       | `0`         |
| `input_format_parquet_preserve_order`                                            | Избежать переупорядочивания строк при чтении из файлов Parquet. Обычно это значительно замедляет процесс.                                                                                                                                              | `0`         |
| `input_format_parquet_filter_push_down`                                          | При чтении файлов Parquet пропускать целые группы строк на основе выражений WHERE/PREWHERE и статистики min/max в метаданных Parquet.                                                                                          | `1`         |
| `input_format_parquet_bloom_filter_push_down`                                    | При чтении файлов Parquet пропускать целые группы строк на основе выражений WHERE и фильтра Блума в метаданных Parquet.                                                                                                          | `0`         |
| `input_format_parquet_use_native_reader`                                         | При чтении файлов Parquet использовать нативный читатель вместо arrow-читателя.                                                                                                                                                          | `0`         |
| `input_format_parquet_allow_missing_columns`                                     | Разрешить отсутствие столбцов при чтении Parquet форматов ввода                                                                                                                                                                          | `1`         |
| `input_format_parquet_local_file_min_bytes_for_seek`                             | Минимальное количество байт, необходимых для локального чтения (файла) для выполнения поиска, вместо чтения с игнорированием в Parquet формате ввода                                                                                                                          | `8192`      |
| `input_format_parquet_enable_row_group_prefetch`                                 | Включить предварительную выборку групп строк во время парсинга Parquet. В настоящее время только однопоточная обработка может выполнять предварительную выборку.                                                                                                                          | `1`         |
| `input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference`   | Пропускать столбцы с неподдерживаемыми типами при выводе схемы для формата Parquet                                                                                                                                                      | `0`         |
| `input_format_parquet_max_block_size`                                            | Максимальный размер блока для Parquet читателя.                                                                                                                                                                                                | `65409`     |
| `input_format_parquet_prefer_block_bytes`                                        | Средний размер блока в байтах, выводимый Parquet читателем.                                                                                                                                                                                      | `16744704`  |
| `output_format_parquet_row_group_size`                                           | Целевой размер группы строк в строках.                                                                                                                                                                                                      | `1000000`   |
| `output_format_parquet_row_group_size_bytes`                                     | Целевой размер группы строк в байтах, до сжатия.                                                                                                                                                                                  | `536870912` |
| `output_format_parquet_string_as_string`                                         | Использовать Parquet строковый тип вместо бинарного для строковых столбцов.                                                                                                                                                                      | `1`         |
| `output_format_parquet_fixed_string_as_fixed_byte_array`                         | Использовать Parquet тип FIXED_LENGTH_BYTE_ARRAY вместо бинарного для FixedString столбцов.                                                                                                                                                  | `1`         |
| `output_format_parquet_version`                                                  | Версия формата Parquet для формата вывода. Поддерживаемые версии: 1.0, 2.4, 2.6 и 2.latest (по умолчанию)                                                                                                                                  | `2.latest`  |
| `output_format_parquet_compression_method`                                       | Метод сжатия для формата Parquet вывода. Поддерживаемые кодеки: snappy, lz4, brotli, zstd, gzip, none (несжатый)                                                                                                              | `zstd`      |
| `output_format_parquet_compliant_nested_types`                                   | В схеме файла parquet использовать имя 'element' вместо 'item' для элементов списка. Это исторический артефакт реализации библиотеки Arrow. В общем, повышает совместимость, за исключением, возможно, с некоторыми старыми версиями Arrow. | `1`         | 
| `output_format_parquet_use_custom_encoder`                                       | Использовать более быстрым реализацию кодировщика Parquet.                                                                                                                                                                                      | `1`         |
| `output_format_parquet_parallel_encoding`                                        | Выполнять кодирование Parquet в нескольких потоках. Требует `output_format_parquet_use_custom_encoder`.                                                                                                                                          | `1`         |
| `output_format_parquet_data_page_size`                                           | Целевой размер страницы в байтах, до сжатия.                                                                                                                                                                                      | `1048576`   |
| `output_format_parquet_batch_size`                                               | Проверять размер страницы каждые это количество строк. Рекомендуется уменьшить, если у вас есть столбцы со средним размером значений выше нескольких Кб.                                                                                                              | `1024`      |
| `output_format_parquet_write_page_index`                                         | Добавить возможность записи индекса страниц в файлы parquet.                                                                                                                                                                          | `1`         |
| `input_format_parquet_import_nested`                                             | Устаревшая настройка, ничего не делает.                                                                                                                                                                                                   | `0`         |
