---
alias: []
description: 'Документация формата Arrow'
input_format: true
keywords: ['Arrow']
output_format: true
slug: /interfaces/formats/Arrow
title: 'Arrow'
doc_type: 'reference'
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |



## Описание {#description}

[Apache Arrow](https://arrow.apache.org/) включает два встроенных формата колоночного хранения данных. ClickHouse поддерживает операции чтения и записи для этих форматов.
`Arrow` — это формат Apache Arrow в режиме «файла». Он предназначен для произвольного доступа к данным в памяти.


## Соответствие типов данных {#data-types-matching}

В таблице ниже приведены поддерживаемые типы данных и их соответствие [типам данных](/sql-reference/data-types/index.md) ClickHouse в запросах `INSERT` и `SELECT`.

| Тип данных Arrow (`INSERT`)              | Тип данных ClickHouse                                                                       | Тип данных Arrow (`SELECT`) |
| --------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------- |
| `BOOL`                                  | [Bool](/sql-reference/data-types/boolean.md)                                               | `BOOL`                     |
| `UINT8`, `BOOL`                         | [UInt8](/sql-reference/data-types/int-uint.md)                                             | `UINT8`                    |
| `INT8`                                  | [Int8](/sql-reference/data-types/int-uint.md)/[Enum8](/sql-reference/data-types/enum.md)   | `INT8`                     |
| `UINT16`                                | [UInt16](/sql-reference/data-types/int-uint.md)                                            | `UINT16`                   |
| `INT16`                                 | [Int16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md) | `INT16`                    |
| `UINT32`                                | [UInt32](/sql-reference/data-types/int-uint.md)                                            | `UINT32`                   |
| `INT32`                                 | [Int32](/sql-reference/data-types/int-uint.md)                                             | `INT32`                    |
| `UINT64`                                | [UInt64](/sql-reference/data-types/int-uint.md)                                            | `UINT64`                   |
| `INT64`                                 | [Int64](/sql-reference/data-types/int-uint.md)                                             | `INT64`                    |
| `FLOAT`, `HALF_FLOAT`                   | [Float32](/sql-reference/data-types/float.md)                                              | `FLOAT32`                  |
| `DOUBLE`                                | [Float64](/sql-reference/data-types/float.md)                                              | `FLOAT64`                  |
| `DATE32`                                | [Date32](/sql-reference/data-types/date32.md)                                              | `UINT16`                   |
| `DATE64`                                | [DateTime](/sql-reference/data-types/datetime.md)                                          | `UINT32`                   |
| `TIMESTAMP`, `TIME32`, `TIME64`         | [DateTime64](/sql-reference/data-types/datetime64.md)                                      | `TIMESTAMP`                |
| `STRING`, `BINARY`                      | [String](/sql-reference/data-types/string.md)                                              | `BINARY`                   |
| `STRING`, `BINARY`, `FIXED_SIZE_BINARY` | [FixedString](/sql-reference/data-types/fixedstring.md)                                    | `FIXED_SIZE_BINARY`        |
| `DECIMAL`                               | [Decimal](/sql-reference/data-types/decimal.md)                                            | `DECIMAL`                  |
| `DECIMAL256`                            | [Decimal256](/sql-reference/data-types/decimal.md)                                         | `DECIMAL256`               |
| `LIST`                                  | [Array](/sql-reference/data-types/array.md)                                                | `LIST`                     |
| `STRUCT`                                | [Tuple](/sql-reference/data-types/tuple.md)                                                | `STRUCT`                   |
| `MAP`                                   | [Map](/sql-reference/data-types/map.md)                                                    | `MAP`                      |
| `UINT32`                                | [IPv4](/sql-reference/data-types/ipv4.md)                                                  | `UINT32`                   |
| `FIXED_SIZE_BINARY`, `BINARY`           | [IPv6](/sql-reference/data-types/ipv6.md)                                                  | `FIXED_SIZE_BINARY`        |
| `FIXED_SIZE_BINARY`, `BINARY`           | [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md)                     | `FIXED_SIZE_BINARY`        |

Массивы могут быть вложенными и содержать значения типа `Nullable` в качестве аргумента. Типы `Tuple` и `Map` также могут быть вложенными.

Тип `DICTIONARY` поддерживается для запросов `INSERT`, а для запросов `SELECT` доступна настройка [`output_format_arrow_low_cardinality_as_dictionary`](/operations/settings/formats#output_format_arrow_low_cardinality_as_dictionary), которая позволяет выводить тип [LowCardinality](/sql-reference/data-types/lowcardinality.md) как тип `DICTIONARY`.

Неподдерживаемые типы данных Arrow:

- `FIXED_SIZE_BINARY`
- `JSON`
- `UUID`
- `ENUM`.


Типы данных столбцов таблицы ClickHouse не обязаны совпадать с соответствующими полями Arrow. При вставке данных ClickHouse интерпретирует типы данных в соответствии с таблицей выше, а затем [приводит](/sql-reference/functions/type-conversion-functions#cast) данные к типу, заданному для столбца таблицы ClickHouse.



## Примеры использования {#example-usage}

### Вставка данных {#inserting-data}

Данные Arrow из файла можно вставить в таблицу ClickHouse с помощью следующей команды:

```bash
$ cat filename.arrow | clickhouse-client --query="INSERT INTO some_table FORMAT Arrow"
```

### Выборка данных {#selecting-data}

Данные из таблицы ClickHouse можно выбрать и сохранить в файл в формате Arrow с помощью следующей команды:

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Arrow" > {filename.arrow}
```


## Настройки формата {#format-settings}

| Настройка                                                                    | Описание                                                                                           | По умолчанию |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------- |
| `input_format_arrow_allow_missing_columns`                                   | Разрешить отсутствующие столбцы при чтении входных форматов Arrow                                  | `1`         |
| `input_format_arrow_case_insensitive_column_matching`                        | Игнорировать регистр при сопоставлении столбцов Arrow со столбцами ClickHouse                      | `0`         |
| `input_format_arrow_import_nested`                                           | Устаревшая настройка, не используется                                                              | `0`         |
| `input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference` | Пропускать столбцы с неподдерживаемыми типами при автоматическом определении схемы для формата Arrow | `0`         |
| `output_format_arrow_compression_method`                                     | Метод сжатия для выходного формата Arrow. Поддерживаемые кодеки: lz4_frame, zstd, none (без сжатия) | `lz4_frame` |
| `output_format_arrow_fixed_string_as_fixed_byte_array`                       | Использовать тип Arrow FIXED_SIZE_BINARY вместо Binary для столбцов FixedString                    | `1`         |
| `output_format_arrow_low_cardinality_as_dictionary`                          | Включить вывод типа LowCardinality как типа Dictionary в Arrow                                     | `0`         |
| `output_format_arrow_string_as_string`                                       | Использовать тип Arrow String вместо Binary для столбцов String                                    | `1`         |
| `output_format_arrow_use_64_bit_indexes_for_dictionary`                      | Всегда использовать 64-битные целые числа для индексов словарей в формате Arrow                    | `0`         |
| `output_format_arrow_use_signed_indexes_for_dictionary`                      | Использовать знаковые целые числа для индексов словарей в формате Arrow                            | `1`         |
