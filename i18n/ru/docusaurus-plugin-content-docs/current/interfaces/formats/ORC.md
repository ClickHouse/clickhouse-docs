---
title: ORC
slug: /interfaces/formats/ORC
keywords: ['ORC']
input_format: true
output_format: true
alias: []
---

| Входящие данные | Исходящие данные | Псевдоним |
|----------------|------------------|-----------|
| ✔              | ✔                |           |

## Описание {#description}

[Apache ORC](https://orc.apache.org/) — это колоночный формат хранения, который широко используется в экосистеме [Hadoop](https://hadoop.apache.org/).

## Сопоставление типов данных {#data-types-matching-orc}

Таблица ниже сравнивает поддерживаемые типы данных ORC и соответствующие им типы данных ClickHouse в `INSERT` и `SELECT` запросах.

| Тип данных ORC (`INSERT`)             | Тип данных ClickHouse                                                                                          | Тип данных ORC (`SELECT`) |
|---------------------------------------|----------------------------------------------------------------------------------------------------------------|--------------------------|
| `Boolean`                             | [UInt8](/sql-reference/data-types/int-uint.md)                                                            | `Boolean`                |
| `Tinyint`                             | [Int8/UInt8](/sql-reference/data-types/int-uint.md)/[Enum8](/sql-reference/data-types/enum.md)    | `Tinyint`                |
| `Smallint`                            | [Int16/UInt16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md) | `Smallint`               |
| `Int`                                 | [Int32/UInt32](/sql-reference/data-types/int-uint.md)                                                     | `Int`                    |
| `Bigint`                              | [Int64/UInt32](/sql-reference/data-types/int-uint.md)                                                     | `Bigint`                 |
| `Float`                               | [Float32](/sql-reference/data-types/float.md)                                                             | `Float`                  |
| `Double`                              | [Float64](/sql-reference/data-types/float.md)                                                             | `Double`                 |
| `Decimal`                             | [Decimal](/sql-reference/data-types/decimal.md)                                                           | `Decimal`                |
| `Date`                                | [Date32](/sql-reference/data-types/date32.md)                                                             | `Date`                   |
| `Timestamp`                           | [DateTime64](/sql-reference/data-types/datetime64.md)                                                     | `Timestamp`              |
| `String`, `Char`, `Varchar`, `Binary` | [String](/sql-reference/data-types/string.md)                                                             | `Binary`                 |
| `List`                                | [Array](/sql-reference/data-types/array.md)                                                               | `List`                   |
| `Struct`                              | [Tuple](/sql-reference/data-types/tuple.md)                                                               | `Struct`                 |
| `Map`                                 | [Map](/sql-reference/data-types/map.md)                                                                   | `Map`                    |
| `Int`                                 | [IPv4](/sql-reference/data-types/int-uint.md)                                                             | `Int`                    |
| `Binary`                              | [IPv6](/sql-reference/data-types/ipv6.md)                                                                 | `Binary`                 |
| `Binary`                              | [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md)                                    | `Binary`                 |
| `Binary`                              | [Decimal256](/sql-reference/data-types/decimal.md)                                                        | `Binary`                 |

- Другие типы не поддерживаются.
- Массивы могут быть вложенными и могут иметь значение типа `Nullable` в качестве аргумента. Типы `Tuple` и `Map` также могут быть вложенными.
- Типы данных колонок таблицы ClickHouse не обязательно должны соответствовать соответствующим полям данных ORC. При вставке данных ClickHouse интерпретирует типы данных в соответствии с таблицей выше, а затем [приводит](https://sql-reference/functions/type-conversion-functions#cast) данные к типу данных, установленному для колонки таблицы ClickHouse.

## Пример использования {#example-usage}

### Вставка данных {#inserting-data-orc}

Вы можете вставить данные ORC из файла в таблицу ClickHouse с помощью следующей команды:

```bash
$ cat filename.orc | clickhouse-client --query="INSERT INTO some_table FORMAT ORC"
```

### Выбор данных {#selecting-data-orc}

Вы можете выбрать данные из таблицы ClickHouse и сохранить их в файл в формате ORC с помощью следующей команды:

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT ORC" > {filename.orc}
```

## Настройки формата {#format-settings}

| Настройка                                                                                                                                                                                                      | Описание                                                                             | Значение по умолчанию |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------|---------------------|
| [`output_format_arrow_string_as_string`](/operations/settings/settings-formats.md/#output_format_arrow_string_as_string)                                                                                  | Использовать тип Arrow String вместо Binary для строковых колонок.                   | `false`             |
| [`output_format_orc_compression_method`](/operations/settings/settings-formats.md/#output_format_orc_compression_method)                                                                                  | Метод сжатия, используемый в выходном формате ORC. Значение по умолчанию            | `none`              |
| [`input_format_arrow_case_insensitive_column_matching`](/operations/settings/settings-formats.md/#input_format_arrow_case_insensitive_column_matching)                                                    | Игнорировать регистр при сопоставлении колонок Arrow с колонками ClickHouse.       | `false`             |
| [`input_format_arrow_allow_missing_columns`](/operations/settings/settings-formats.md/#input_format_arrow_allow_missing_columns)                                                                          | Разрешить отсутствие колонок при чтении данных Arrow.                               | `false`             |
| [`input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference) | Разрешить пропуск колонок с неподдерживаемыми типами при выводе схемы для формата Arrow. | `false`             |

Для обмена данными с Hadoop вы можете использовать [HDFS table engine](/engines/table-engines/integrations/hdfs.md).
