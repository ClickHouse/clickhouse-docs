---
title: Parquet
slug: /interfaces/formats/Parquet
keywords: [Parquet]
input_format: true
output_format: true
alias: []
---

| Входные данные | Выходные данные | Псевдоним |
|----------------|-----------------|-----------|
| ✔              | ✔               |           |

## Описание {#description}

[Apache Parquet](https://parquet.apache.org/) — это колоночный формат хранения, широко используемый в экосистеме Hadoop. ClickHouse поддерживает операции чтения и записи для этого формата.

## Соответствие типов данных {#data-types-matching-parquet}

В таблице ниже представлены поддерживаемые типы данных и то, как они соответствуют [типам данных ClickHouse](/sql-reference/data-types/index.md) в запросах `INSERT` и `SELECT`.

| Тип данных Parquet (`INSERT`)                | Тип данных ClickHouse                                                                                     | Тип данных Parquet (`SELECT`)  |
|----------------------------------------------|----------------------------------------------------------------------------------------------------------|--------------------------------|
| `BOOL`                                       | [Bool](/sql-reference/data-types/boolean.md)                                                            | `BOOL`                         |
| `UINT8`, `BOOL`                              | [UInt8](/sql-reference/data-types/int-uint.md)                                                         | `UINT8`                       |
| `INT8`                                       | [Int8](/sql-reference/data-types/int-uint.md)/[Enum8](/sql-reference/data-types/enum.md)                 | `INT8`                        |
| `UINT16`                                     | [UInt16](/sql-reference/data-types/int-uint.md)                                                        | `UINT16`                      |
| `INT16`                                      | [Int16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md)               | `INT16`                       |
| `UINT32`                                     | [UInt32](/sql-reference/data-types/int-uint.md)                                                        | `UINT32`                      |
| `INT32`                                      | [Int32](/sql-reference/data-types/int-uint.md)                                                         | `INT32`                       |
| `UINT64`                                     | [UInt64](/sql-reference/data-types/int-uint.md)                                                        | `UINT64`                      |
| `INT64`                                      | [Int64](/sql-reference/data-types/int-uint.md)                                                         | `INT64`                       |
| `FLOAT`                                      | [Float32](/sql-reference/data-types/float.md)                                                          | `FLOAT`                       |
| `DOUBLE`                                     | [Float64](/sql-reference/data-types/float.md)                                                          | `DOUBLE`                      |
| `DATE`                                       | [Date32](/sql-reference/data-types/date.md)                                                            | `DATE`                        |
| `TIME (ms)`                                  | [DateTime](/sql-reference/data-types/datetime.md)                                                      | `UINT32`                      |
| `TIMESTAMP`, `TIME (us, ns)`                 | [DateTime64](/sql-reference/data-types/datetime64.md)                                                  | `TIMESTAMP`                   |
| `STRING`, `BINARY`                           | [String](/sql-reference/data-types/string.md)                                                          | `BINARY`                      |
| `STRING`, `BINARY`, `FIXED_LENGTH_BYTE_ARRAY` | [FixedString](/sql-reference/data-types/fixedstring.md)                                                | `FIXED_LENGTH_BYTE_ARRAY`     |
| `DECIMAL`                                    | [Decimal](/sql-reference/data-types/decimal.md)                                                        | `DECIMAL`                     |
| `LIST`                                       | [Array](/sql-reference/data-types/array.md)                                                            | `LIST`                        |
| `STRUCT`                                     | [Tuple](/sql-reference/data-types/tuple.md)                                                            | `STRUCT`                      |
| `MAP`                                        | [Map](/sql-reference/data-types/map.md)                                                                | `MAP`                         |
| `UINT32`                                     | [IPv4](/sql-reference/data-types/ipv4.md)                                                              | `UINT32`                      |
| `FIXED_LENGTH_BYTE_ARRAY`, `BINARY`          | [IPv6](/sql-reference/data-types/ipv6.md)                                                              | `FIXED_LENGTH_BYTE_ARRAY`     |
| `FIXED_LENGTH_BYTE_ARRAY`, `BINARY`          | [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md)                                 | `FIXED_LENGTH_BYTE_ARRAY`     |

Массивы могут быть вложенными и могут иметь значение типа `Nullable` в качестве аргумента. Типы `Tuple` и `Map` также могут быть вложенными.

Типы данных Parquet, которые не поддерживаются:
- `FIXED_SIZE_BINARY`
- `JSON`
- `UUID`
- `ENUM`.

Типы данных колонок таблицы ClickHouse могут отличаться от соответствующих полей данных Parquet, которые вставляются. При вставке данных ClickHouse интерпретирует типы данных в соответствии с таблицей выше, а затем [приводит к типу](/sql-reference/functions/type-conversion-functions#cast) данных, который установлен для колонки таблицы ClickHouse.

## Пример использования {#example-usage}

### Вставка и выборка данных {#inserting-and-selecting-data-parquet}

Вы можете вставить данные Parquet из файла в таблицу ClickHouse с помощью следующей команды:

``` bash
$ cat {filename} | clickhouse-client --query="INSERT INTO {some_table} FORMAT Parquet"
```

Вы можете выбрать данные из таблицы ClickHouse и сохранить их в некоторый файл в формате Parquet с помощью следующей команды:

``` bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Parquet" > {some_file.pq}
```

Для обмена данными с Hadoop вы можете использовать [`HDFS table engine`](/engines/table-engines/integrations/hdfs.md).

## Настройки формата {#format-settings}

| Параметр                                                                       | Описание                                                                                                                                                                                                                       | Значение по умолчанию |
|--------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------|
| `input_format_parquet_case_insensitive_column_matching`                        | Игнорировать регистр при сопоставлении колонок Parquet с колонками CH.                                                                                                                                                     | `0`                  |
| `input_format_parquet_preserve_order`                                          | Избегать перетасовки строк при чтении из Parquet файлов. Обычно это значительно замедляет процесс.                                                                                                                            | `0`                  |
| `input_format_parquet_filter_push_down`                                        | При чтении Parquet файлов пропускать целые группы строк на основе условий WHERE/PREWHERE и минимальных/максимальных статистик в метаданных Parquet.                                                                           | `1`                  |
| `input_format_parquet_bloom_filter_push_down`                                  | При чтении Parquet файлов пропускать целые группы строк на основе условий WHERE и фильтра Блума в метаданных Parquet.                                                                                                        | `0`                  |
| `input_format_parquet_use_native_reader`                                       | При чтении Parquet файлов использовать нативный читатель вместо arrow читателя.                                                                                                                                               | `0`                  |
| `input_format_parquet_allow_missing_columns`                                   | Разрешить отсутствующие колонки при чтении форматов ввода Parquet.                                                                                                                                                            | `1`                  |
| `input_format_parquet_local_file_min_bytes_for_seek`                           | Минимальный объем байт, необходимый для локального чтения (файла) для осуществления перемещения вместо чтения с игнорированием в формате ввода Parquet.                                                                       | `8192`               |
| `input_format_parquet_enable_row_group_prefetch`                               | Включить предзагрузку групп строк при парсинге Parquet. В настоящее время только многопоточный парсинг может делать предзагрузку.                                                                                                  | `1`                  |
| `input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference` | Пропускать колонки с неподдерживаемыми типами во время определения схемы для формата Parquet.                                                                                                                                 | `0`                  |
| `input_format_parquet_max_block_size`                                          | Максимальный размер блока для читателя Parquet.                                                                                                                                                                              | `65409`              |
| `input_format_parquet_prefer_block_bytes`                                      | Средний размер блока в байтах, выдаваемый читателем Parquet.                                                                                                                                                                 | `16744704`           |
| `output_format_parquet_row_group_size`                                         | Целевой размер группы строк в строках.                                                                                                                                                                                        | `1000000`            |
| `output_format_parquet_row_group_size_bytes`                                   | Целевой размер группы строк в байтах, до сжатия.                                                                                                                                                                             | `536870912`          |
| `output_format_parquet_string_as_string`                                       | Использовать тип Parquet String вместо Binary для строковых колонок.                                                                                                                                                         | `1`                  |
| `output_format_parquet_fixed_string_as_fixed_byte_array`                       | Использовать тип Parquet FIXED_LENGTH_BYTE_ARRAY вместо Binary для FixedString колонок.                                                                                                                                       | `1`                  |
| `output_format_parquet_version`                                                | Версия формата Parquet для формата вывода. Поддерживаемые версии: 1.0, 2.4, 2.6 и 2.latest (по умолчанию).                                                                                                                  | `2.latest`           |
| `output_format_parquet_compression_method`                                     | Метод сжатия для формата вывода Parquet. Поддерживаемые кодеки: snappy, lz4, brotli, zstd, gzip, none (без сжатия).                                                                                                        | `zstd`               |
| `output_format_parquet_compliant_nested_types`                                 | В схеме файла parquet использовать имя 'element' вместо 'item' для элементов списка. Это исторический артефакт реализации библиотеки Arrow. В общем повышает совместимость, за исключением, возможно, некоторых старых версий Arrow. | `1`                  | 
| `output_format_parquet_use_custom_encoder`                                     | Использовать более быстрые реализации кодировщика Parquet.                                                                                                                                                                  | `1`                  |
| `output_format_parquet_parallel_encoding`                                      | Выполнять кодирование Parquet в нескольких потоках. Требует `output_format_parquet_use_custom_encoder`.                                                                                                                      | `1`                  |
| `output_format_parquet_data_page_size`                                         | Целевой размер страницы в байтах, до сжатия.                                                                                                                                                                                | `1048576`            |
| `output_format_parquet_batch_size`                                             | Проверять размер страницы каждые это количество строк. Рассмотрите возможность уменьшения, если у вас есть колонки со средними значениями размера более нескольких КБ.                                                         | `1024`               |
| `output_format_parquet_write_page_index`                                       | Добавить возможность записывать индекс страниц в файлы parquet.                                                                                                                                                              | `1`                  |
| `input_format_parquet_import_nested`                                           | Устаревшая настройка, ничего не делает.                                                                                                                                                                                       | `0`                  |
