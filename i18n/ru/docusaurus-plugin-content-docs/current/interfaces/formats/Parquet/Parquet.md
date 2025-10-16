---
slug: '/interfaces/formats/Parquet'
description: 'Документация для формата Parquet'
title: Parquet
keywords: ['Parquet']
doc_type: reference
input_format: true
output_format: true
---
| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

[Apache Parquet](https://parquet.apache.org/) — это столбцовый формат хранения, широко используемый в экосистеме Hadoop. ClickHouse поддерживает операции чтения и записи для этого формата.

## Сопоставление типов данных {#data-types-matching-parquet}

В таблице ниже представлены поддерживаемые типы данных и то, как они сопоставляются с [типами данных](/sql-reference/data-types/index.md) в ClickHouse при выполнении запросов `INSERT` и `SELECT`.

| Тип данных Parquet (`INSERT`)                   | Тип данных ClickHouse                                                                                       | Тип данных Parquet (`SELECT`)  |
|------------------------------------------------|------------------------------------------------------------------------------------------------------------|-------------------------------|
| `BOOL`                                         | [Bool](/sql-reference/data-types/boolean.md)                                                       | `BOOL`                        |
| `UINT8`, `BOOL`                                | [UInt8](/sql-reference/data-types/int-uint.md)                                                     | `UINT8`                       |
| `INT8`                                         | [Int8](/sql-reference/data-types/int-uint.md)/[Enum8](/sql-reference/data-types/enum.md)   | `INT8`                        |
| `UINT16`                                       | [UInt16](/sql-reference/data-types/int-uint.md)                                                    | `UINT16`                      |
| `INT16`                                        | [Int16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md) | `INT16`                       |
| `UINT32`                                       | [UInt32](/sql-reference/data-types/int-uint.md)                                                    | `UINT32`                      |
| `INT32`                                        | [Int32](/sql-reference/data-types/int-uint.md)                                                     | `INT32`                       |
| `UINT64`                                       | [UInt64](/sql-reference/data-types/int-uint.md)                                                    | `UINT64`                      |
| `INT64`                                        | [Int64](/sql-reference/data-types/int-uint.md)                                                     | `INT64`                       |
| `FLOAT`                                        | [Float32](/sql-reference/data-types/float.md)                                                      | `FLOAT`                       |
| `DOUBLE`                                       | [Float64](/sql-reference/data-types/float.md)                                                      | `DOUBLE`                      |
| `DATE`                                         | [Date32](/sql-reference/data-types/date.md)                                                        | `DATE`                        |
| `TIME (ms)`                                    | [DateTime](/sql-reference/data-types/datetime.md)                                                  | `UINT32`                      |
| `TIMESTAMP`, `TIME (us, ns)`                   | [DateTime64](/sql-reference/data-types/datetime64.md)                                              | `TIMESTAMP`                   |
| `STRING`, `BINARY`                             | [String](/sql-reference/data-types/string.md)                                                      | `BINARY`                      |
| `STRING`, `BINARY`, `FIXED_LENGTH_BYTE_ARRAY`  | [FixedString](/sql-reference/data-types/fixedstring.md)                                            | `FIXED_LENGTH_BYTE_ARRAY`     |
| `DECIMAL`                                      | [Decimal](/sql-reference/data-types/decimal.md)                                                    | `DECIMAL`                     |
| `LIST`                                         | [Array](/sql-reference/data-types/array.md)                                                        | `LIST`                        |
| `STRUCT`                                       | [Tuple](/sql-reference/data-types/tuple.md)                                                        | `STRUCT`                      |
| `MAP`                                          | [Map](/sql-reference/data-types/map.md)                                                            | `MAP`                         |
| `UINT32`                                       | [IPv4](/sql-reference/data-types/ipv4.md)                                                          | `UINT32`                      |
| `FIXED_LENGTH_BYTE_ARRAY`, `BINARY`            | [IPv6](/sql-reference/data-types/ipv6.md)                                                          | `FIXED_LENGTH_BYTE_ARRAY`     |
| `FIXED_LENGTH_BYTE_ARRAY`, `BINARY`            | [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md)                             | `FIXED_LENGTH_BYTE_ARRAY`     |
| `JSON`                                         | [JSON](/sql-reference/data-types/newjson.md)                                                          | `JSON`                        |

Массивы могут быть вложенными и могут иметь значение типа `Nullable` в качестве аргумента. Типы `Tuple` и `Map` также могут быть вложенными.

Поддерживаемые типы данных Parquet:
- `FIXED_SIZE_BINARY`
- `UUID`
- `ENUM`.

Типы данных столбцов таблицы ClickHouse могут отличаться от соответствующих полей вставляемых данных Parquet. При вставке данных ClickHouse интерпретирует типы данных в соответствии с таблицей выше и затем [приводит типы](/sql-reference/functions/type-conversion-functions#cast) данных к тому типу, который установлен для столбца таблицы ClickHouse.

## Пример использования {#example-usage}

### Вставка данных {#inserting-data}

Используя файл Parquet с следующими данными, названный `football.parquet`:

```text
    ┌───────date─┬─season─┬─home_team─────────────┬─away_team───────────┬─home_team_goals─┬─away_team_goals─┐
 1. │ 2022-04-30 │   2021 │ Sutton United         │ Bradford City       │               1 │               4 │
 2. │ 2022-04-30 │   2021 │ Swindon Town          │ Barrow              │               2 │               1 │
 3. │ 2022-04-30 │   2021 │ Tranmere Rovers       │ Oldham Athletic     │               2 │               0 │
 4. │ 2022-05-02 │   2021 │ Port Vale             │ Newport County      │               1 │               2 │
 5. │ 2022-05-02 │   2021 │ Salford City          │ Mansfield Town      │               2 │               2 │
 6. │ 2022-05-07 │   2021 │ Barrow                │ Northampton Town    │               1 │               3 │
 7. │ 2022-05-07 │   2021 │ Bradford City         │ Carlisle United     │               2 │               0 │
 8. │ 2022-05-07 │   2021 │ Bristol Rovers        │ Scunthorpe United   │               7 │               0 │
 9. │ 2022-05-07 │   2021 │ Exeter City           │ Port Vale           │               0 │               1 │
10. │ 2022-05-07 │   2021 │ Harrogate Town A.F.C. │ Sutton United       │               0 │               2 │
11. │ 2022-05-07 │   2021 │ Hartlepool United     │ Colchester United   │               0 │               2 │
12. │ 2022-05-07 │   2021 │ Leyton Orient         │ Tranmere Rovers     │               0 │               1 │
13. │ 2022-05-07 │   2021 │ Mansfield Town        │ Forest Green Rovers │               2 │               2 │
14. │ 2022-05-07 │   2021 │ Newport County        │ Rochdale            │               0 │               2 │
15. │ 2022-05-07 │   2021 │ Oldham Athletic       │ Crawley Town        │               3 │               3 │
16. │ 2022-05-07 │   2021 │ Stevenage Borough     │ Salford City        │               4 │               2 │
17. │ 2022-05-07 │   2021 │ Walsall               │ Swindon Town        │               0 │               3 │
    └────────────┴────────┴───────────────────────┴─────────────────────┴─────────────────┴─────────────────┘
```

Вставить данные:

```sql
INSERT INTO football FROM INFILE 'football.parquet' FORMAT Parquet;
```

### Чтение данных {#reading-data}

Чтение данных с использованием формата `Parquet`:

```sql
SELECT *
FROM football
INTO OUTFILE 'football.parquet'
FORMAT Parquet
```

:::tip
Parquet — это двоичный формат, который не отображается в читаемом виде в терминале. Используйте `INTO OUTFILE` для вывода файлов Parquet.
:::

Для обмена данными с Hadoop вы можете использовать [`HDFS table engine`](/engines/table-engines/integrations/hdfs.md).

## Настройки формата {#format-settings}

| Настройка                                                                       | Описание                                                                                                                                                                                                                       | По умолчанию |
|--------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| `input_format_parquet_case_insensitive_column_matching`                        | Игнорировать регистр при сопоставлении столбцов Parquet со столбцами CH.                                                                                                                                                             | `0`          |
| `input_format_parquet_preserve_order`                                          | Избежать переупорядочивания строк при чтении из файлов Parquet. Обычно значительно замедляет процесс.                                                                                                                                  | `0`          |
| `input_format_parquet_filter_push_down`                                        | При чтении файлов Parquet пропускать целые группы строк на основе выражений WHERE/PREWHERE и минимальной/максимальной статистики в метаданных Parquet.                                                                                    | `1`          |
| `input_format_parquet_bloom_filter_push_down`                                  | При чтении файлов Parquet пропускать целые группы строк на основе выражений WHERE и фильтра Блума в метаданных Parquet.                                                                                                            | `0`          |
| `input_format_parquet_use_native_reader`                                       | При чтении файлов Parquet использовать нативный ридер вместо ридера Arrow.                                                                                                                                                            | `0`          |
| `input_format_parquet_allow_missing_columns`                                   | Разрешить отсутствие столбцов при чтении входных форматов Parquet                                                                                                                                                                      | `1`          |
| `input_format_parquet_local_file_min_bytes_for_seek`                           | Минимальное количество байтов, необходимых для локального чтения (файла) для выполнения поиска, вместо чтения с игнорированием в формате ввода Parquet                                                                                   | `8192`       |
| `input_format_parquet_enable_row_group_prefetch`                               | Включить предварительную выборку групп строк во время разбора Parquet. В настоящее время только однопоточная обработка может выполнять предварительную выборку.                                                                          | `1`          |
| `input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference` | Пропускать столбцы с неподдерживаемыми типами при выводе схемы для формата Parquet                                                                                                                                                    | `0`          |
| `input_format_parquet_max_block_size`                                          | Максимальный размер блока для ридера Parquet.                                                                                                                                                                                    | `65409`      |
| `input_format_parquet_prefer_block_bytes`                                      | Средний размер блока, выдаваемый ридером Parquet                                                                                                                                                                                  | `16744704`   |
| `input_format_parquet_enable_json_parsing`                                     | При чтении файлов Parquet разбирать столбцы JSON как столбец JSON ClickHouse.                                                                                                                                                                       | `1`          |
| `output_format_parquet_row_group_size`                                         | Целевой размер группы строк в строках.                                                                                                                                                                                               | `1000000`    |
| `output_format_parquet_row_group_size_bytes`                                   | Целевой размер группы строк в байтах, до сжатия.                                                                                                                                                                                  | `536870912`  |
| `output_format_parquet_string_as_string`                                       | Использовать тип Parquet String вместо Binary для строковых столбцов.                                                                                                                                                                | `1`          |
| `output_format_parquet_fixed_string_as_fixed_byte_array`                       | Использовать тип Parquet FIXED_LENGTH_BYTE_ARRAY вместо Binary для столбцов FixedString.                                                                                                                                                    | `1`          |
| `output_format_parquet_version`                                                | Версия формата Parquet для формата вывода. Поддерживаемые версии: 1.0, 2.4, 2.6 и 2.latest (по умолчанию)                                                                                                                             | `2.latest`   |
| `output_format_parquet_compression_method`                                     | Метод сжатия для формата вывода Parquet. Поддерживаемые кодеки: snappy, lz4, brotli, zstd, gzip, none (несжатый)                                                                                                                  | `zstd`       |
| `output_format_parquet_compliant_nested_types`                                 | В схеме файла parquet использовать имя 'element' вместо 'item' для элементов списка. Это исторический артефакт реализации библиотеки Arrow. Как правило, повышает совместимость, кроме, возможно, с некоторыми старыми версиями Arrow. | `1`          | 
| `output_format_parquet_use_custom_encoder`                                     | Использовать более быстрые реализации кодировщика Parquet.                                                                                                                                                                       | `1`          |
| `output_format_parquet_parallel_encoding`                                      | Выполнять кодирование Parquet в нескольких потоках. Требует `output_format_parquet_use_custom_encoder`.                                                                                                                                      | `1`          |
| `output_format_parquet_data_page_size`                                         | Целевой размер страницы в байтах, до сжатия.                                                                                                                                                                                      | `1048576`    |
| `output_format_parquet_batch_size`                                             | Проверять размер страницы каждые столько строк. Рассмотрите возможность уменьшения, если у вас есть столбцы со средним размером значений выше нескольких КБ.                                                                                  | `1024`       |
| `output_format_parquet_write_page_index`                                       | Добавить возможность записывать индекс страницы в файлы parquet.                                                                                                                                                                   | `1`          |
| `input_format_parquet_import_nested`                                           | Устаревшая настройка, не делает ничего.                                                                                                                                                                                                | `0`          |