---
slug: '/interfaces/formats/Arrow'
description: 'Документация для формата Arrow'
title: Arrow
keywords: ['Arrow']
doc_type: reference
input_format: true
output_format: true
---
| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

[Apache Arrow](https://arrow.apache.org/) поставляется с двумя встроенными форматами столбцового хранилища. ClickHouse поддерживает операции чтения и записи для этих форматов. 
`Arrow` - это формат "режима файла" Apache Arrow. Он предназначен для случайного доступа к данным в памяти.

## Соответствие типов данных {#data-types-matching}

В таблице ниже показаны поддерживаемые типы данных и их соответствие типам данных ClickHouse [data types](/sql-reference/data-types/index.md) в запросах `INSERT` и `SELECT`.

| Тип данных Arrow (`INSERT`)              | Тип данных ClickHouse                                                                                       | Тип данных Arrow (`SELECT`) |
|-----------------------------------------|------------------------------------------------------------------------------------------------------------|----------------------------|
| `BOOL`                                  | [Bool](/sql-reference/data-types/boolean.md)                                                       | `BOOL`                     |
| `UINT8`, `BOOL`                         | [UInt8](/sql-reference/data-types/int-uint.md)                                                     | `UINT8`                    |
| `INT8`                                  | [Int8](/sql-reference/data-types/int-uint.md)/[Enum8](/sql-reference/data-types/enum.md)   | `INT8`                     |
| `UINT16`                                | [UInt16](/sql-reference/data-types/int-uint.md)                                                    | `UINT16`                   |
| `INT16`                                 | [Int16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md) | `INT16`                    |
| `UINT32`                                | [UInt32](/sql-reference/data-types/int-uint.md)                                                    | `UINT32`                   |
| `INT32`                                 | [Int32](/sql-reference/data-types/int-uint.md)                                                     | `INT32`                    |
| `UINT64`                                | [UInt64](/sql-reference/data-types/int-uint.md)                                                    | `UINT64`                   |
| `INT64`                                 | [Int64](/sql-reference/data-types/int-uint.md)                                                     | `INT64`                    |
| `FLOAT`, `HALF_FLOAT`                   | [Float32](/sql-reference/data-types/float.md)                                                      | `FLOAT32`                  |
| `DOUBLE`                                | [Float64](/sql-reference/data-types/float.md)                                                      | `FLOAT64`                  |
| `DATE32`                                | [Date32](/sql-reference/data-types/date32.md)                                                      | `UINT16`                   |
| `DATE64`                                | [DateTime](/sql-reference/data-types/datetime.md)                                                  | `UINT32`                   |
| `TIMESTAMP`, `TIME32`, `TIME64`         | [DateTime64](/sql-reference/data-types/datetime64.md)                                              | `TIMESTAMP`                |
| `STRING`, `BINARY`                      | [String](/sql-reference/data-types/string.md)                                                      | `BINARY`                   |
| `STRING`, `BINARY`, `FIXED_SIZE_BINARY` | [FixedString](/sql-reference/data-types/fixedstring.md)                                            | `FIXED_SIZE_BINARY`        |
| `DECIMAL`                               | [Decimal](/sql-reference/data-types/decimal.md)                                                    | `DECIMAL`                  |
| `DECIMAL256`                            | [Decimal256](/sql-reference/data-types/decimal.md)                                                 | `DECIMAL256`               |
| `LIST`                                  | [Array](/sql-reference/data-types/array.md)                                                        | `LIST`                     |
| `STRUCT`                                | [Tuple](/sql-reference/data-types/tuple.md)                                                        | `STRUCT`                   |
| `MAP`                                   | [Map](/sql-reference/data-types/map.md)                                                            | `MAP`                      |
| `UINT32`                                | [IPv4](/sql-reference/data-types/ipv4.md)                                                          | `UINT32`                   |
| `FIXED_SIZE_BINARY`, `BINARY`           | [IPv6](/sql-reference/data-types/ipv6.md)                                                          | `FIXED_SIZE_BINARY`        |
| `FIXED_SIZE_BINARY`, `BINARY`           | [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md)                             | `FIXED_SIZE_BINARY`        |

Массивы могут быть вложенными и могут иметь значение типа `Nullable` в качестве аргумента. Типы `Tuple` и `Map` также могут быть вложенными.

Тип `DICTIONARY` поддерживается для запросов `INSERT`, а для запросов `SELECT` существует [`output_format_arrow_low_cardinality_as_dictionary`](/operations/settings/formats#output_format_arrow_low_cardinality_as_dictionary) настройка, которая позволяет выводить тип [LowCardinality](/sql-reference/data-types/lowcardinality.md) как тип `DICTIONARY`.

Некоторые типы данных Arrow не поддерживаются: 
- `FIXED_SIZE_BINARY`
- `JSON`
- `UUID`
- `ENUM`.

Типы данных колонок таблицы ClickHouse не обязательно должны соответствовать соответствующим полям данных Arrow. При вставке данных ClickHouse интерпретирует типы данных в соответствии с таблицей выше и затем [приводит тип](/sql-reference/functions/type-conversion-functions#cast) данных к типу данных, установленному для колонки таблицы ClickHouse.

## Пример использования {#example-usage}

### Вставка данных {#inserting-data}

Вы можете вставить данные Arrow из файла в таблицу ClickHouse, используя следующую команду:

```bash
$ cat filename.arrow | clickhouse-client --query="INSERT INTO some_table FORMAT Arrow"
```

### Выбор данных {#selecting-data}

Вы можете выбрать данные из таблицы ClickHouse и сохранить их в файл в формате Arrow, используя следующую команду:

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Arrow" > {filename.arrow}
```

## Настройки формата {#format-settings}

| Настройка                                                                                                              | Описание                                                                                            | Значение по умолчанию |
|-------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|-----------------------|
| `input_format_arrow_allow_missing_columns`                                                                              | Позволить отсутствующие колонки при чтении входных форматов Arrow                                   | `1`                   |
| `input_format_arrow_case_insensitive_column_matching`                                                                   | Игнорировать регистр при сопоставлении колонок Arrow с колонками CH.                               | `0`                   |
| `input_format_arrow_import_nested`                                                                                      | Устаревшая настройка, ничего не делает.                                                              | `0`                   |
| `input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference`                                            | Пропускать колонки с неподдерживаемыми типами при выводе схемы для формата Arrow                     | `0`                   |
| `output_format_arrow_compression_method`                                                                                | Метод сжатия для формата вывода Arrow. Поддерживаемые кодеки: lz4_frame, zstd, none (несжатый)     | `lz4_frame`           |
| `output_format_arrow_fixed_string_as_fixed_byte_array`                                                                  | Использовать тип Arrow FIXED_SIZE_BINARY вместо Binary для колонок FixedString.                      | `1`                   |
| `output_format_arrow_low_cardinality_as_dictionary`                                                                     | Включить вывод LowCardinality типа как типа Dictionary Arrow                                       | `0`                   |
| `output_format_arrow_string_as_string`                                                                                  | Использовать тип Arrow String вместо Binary для колонок String                                       | `1`                   |
| `output_format_arrow_use_64_bit_indexes_for_dictionary`                                                                 | Всегда использовать 64-битные целые числа для индексов словаря в формате Arrow                       | `0`                   |
| `output_format_arrow_use_signed_indexes_for_dictionary`                                                                 | Использовать знаковые целые числа для индексов словаря в формате Arrow                              | `1`                   |