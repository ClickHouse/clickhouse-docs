---
alias: []
description: 'Документация для формата Arrow'
input_format: true
keywords: ['Arrow']
output_format: true
slug: /interfaces/formats/Arrow
title: 'Arrow'
---

| Входные данные | Выходные данные | Псевдоним |
|----------------|----------------|-----------|
| ✔              | ✔              |           |

## Описание {#description}

[Apache Arrow](https://arrow.apache.org/) поставляется с двумя встроенными формами столбцового хранения. ClickHouse поддерживает операции чтения и записи для этих форматов. `Arrow` — это формат "файлового режима" Apache Arrow. Он разработан для случайного доступа в памяти.

## Соответствие типов данных {#data-types-matching}

В таблице ниже показаны поддерживаемые типы данных и то, как они соответствуют [типам данных](/sql-reference/data-types/index.md) ClickHouse в запросах `INSERT` и `SELECT`.

| Тип данных Arrow (`INSERT`)               | Тип данных ClickHouse                                                                                     | Тип данных Arrow (`SELECT`) |
|-------------------------------------------|----------------------------------------------------------------------------------------------------------|------------------------------|
| `BOOL`                                    | [Bool](/sql-reference/data-types/boolean.md)                                                          | `BOOL`                       |
| `UINT8`, `BOOL`                           | [UInt8](/sql-reference/data-types/int-uint.md)                                                       | `UINT8`                      |
| `INT8`                                    | [Int8](/sql-reference/data-types/int-uint.md)/[Enum8](/sql-reference/data-types/enum.md)   | `INT8`                       |
| `UINT16`                                  | [UInt16](/sql-reference/data-types/int-uint.md)                                                      | `UINT16`                     |
| `INT16`                                   | [Int16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md) | `INT16`                      |
| `UINT32`                                  | [UInt32](/sql-reference/data-types/int-uint.md)                                                      | `UINT32`                     |
| `INT32`                                   | [Int32](/sql-reference/data-types/int-uint.md)                                                       | `INT32`                      |
| `UINT64`                                  | [UInt64](/sql-reference/data-types/int-uint.md)                                                      | `UINT64`                     |
| `INT64`                                   | [Int64](/sql-reference/data-types/int-uint.md)                                                       | `INT64`                      |
| `FLOAT`, `HALF_FLOAT`                     | [Float32](/sql-reference/data-types/float.md)                                                        | `FLOAT32`                    |
| `DOUBLE`                                  | [Float64](/sql-reference/data-types/float.md)                                                        | `FLOAT64`                    |
| `DATE32`                                  | [Date32](/sql-reference/data-types/date32.md)                                                        | `UINT16`                     |
| `DATE64`                                  | [DateTime](/sql-reference/data-types/datetime.md)                                                    | `UINT32`                     |
| `TIMESTAMP`, `TIME32`, `TIME64`           | [DateTime64](/sql-reference/data-types/datetime64.md)                                                | `TIMESTAMP`                  |
| `STRING`, `BINARY`                        | [String](/sql-reference/data-types/string.md)                                                        | `BINARY`                     |
| `STRING`, `BINARY`, `FIXED_SIZE_BINARY`   | [FixedString](/sql-reference/data-types/fixedstring.md)                                              | `FIXED_SIZE_BINARY`          |
| `DECIMAL`                                 | [Decimal](/sql-reference/data-types/decimal.md)                                                      | `DECIMAL`                    |
| `DECIMAL256`                              | [Decimal256](/sql-reference/data-types/decimal.md)                                                   | `DECIMAL256`                 |
| `LIST`                                    | [Array](/sql-reference/data-types/array.md)                                                          | `LIST`                       |
| `STRUCT`                                  | [Tuple](/sql-reference/data-types/tuple.md)                                                          | `STRUCT`                     |
| `MAP`                                     | [Map](/sql-reference/data-types/map.md)                                                              | `MAP`                        |
| `UINT32`                                  | [IPv4](/sql-reference/data-types/ipv4.md)                                                            | `UINT32`                     |
| `FIXED_SIZE_BINARY`, `BINARY`             | [IPv6](/sql-reference/data-types/ipv6.md)                                                            | `FIXED_SIZE_BINARY`          |
| `FIXED_SIZE_BINARY`, `BINARY`             | [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md)                               | `FIXED_SIZE_BINARY`          |

Массивы могут быть вложенными и могут иметь значение типа `Nullable` в качестве аргумента. Типы `Tuple` и `Map` также могут быть вложенными.

Тип `DICTIONARY` поддерживается для запросов `INSERT`, а для запросов `SELECT` существует настройка [`output_format_arrow_low_cardinality_as_dictionary`](/operations/settings/formats#output_format_arrow_low_cardinality_as_dictionary), которая позволяет выводить тип [LowCardinality](/sql-reference/data-types/lowcardinality.md) как тип `DICTIONARY`.

Не поддерживаемые типы данных Arrow:
- `FIXED_SIZE_BINARY`
- `JSON`
- `UUID`
- `ENUM`.

Типы данных столбцов таблицы ClickHouse не обязательно должны совпадать с соответствующими полям данных Arrow. При вставке данных ClickHouse интерпретирует типы данных в соответствии с таблицей выше, а затем [приводит](https://clickhouse.tech/docs/en/sql-reference/functions/type-conversion-functions#cast) данные к типу данных, установленному для столбца таблицы ClickHouse.

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

| Настройка                                                                                                                | Описание                                                                                           | По умолчанию |
|-------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|--------------|
| `input_format_arrow_allow_missing_columns`                                                                              | Разрешить отсутствующие столбцы при чтении форматов ввода Arrow                                   | `1`          |
| `input_format_arrow_case_insensitive_column_matching`                                                                   | Игнорировать регистр при сопоставлении столбцов Arrow с столбцами CH.                           | `0`          |
| `input_format_arrow_import_nested`                                                                                     | Устаревшая настройка, ничего не делает.                                                          | `0`          |
| `input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference`                                            | Пропустить столбцы с неподдерживаемыми типами при выводе схемы для формата Arrow                 | `0`          |
| `output_format_arrow_compression_method`                                                                                | Метод сжатия для формата выхода Arrow. Поддерживаемые кодеки: lz4_frame, zstd, none (несжатый)   | `lz4_frame`  |
| `output_format_arrow_fixed_string_as_fixed_byte_array`                                                                  | Использовать тип Arrow FIXED_SIZE_BINARY вместо Binary для столбцов FixedString.                 | `1`          |
| `output_format_arrow_low_cardinality_as_dictionary`                                                                     | Включить вывод типа LowCardinality как тип Dictionary Arrow                                      | `0`          |
| `output_format_arrow_string_as_string`                                                                                  | Использовать тип Arrow String вместо Binary для столбцов String                                   | `1`          |
| `output_format_arrow_use_64_bit_indexes_for_dictionary`                                                                 | Всегда использовать 64-битные целые числа для индексов словаря в формате Arrow                    | `0`          |
| `output_format_arrow_use_signed_indexes_for_dictionary`                                                                 | Использовать знаковые целые числа для индексов словаря в формате Arrow                             | `1`          |
