---
alias: []
description: 'Документация для формата BSONEachRow'
input_format: true
keywords: ['BSONEachRow']
output_format: true
slug: /interfaces/formats/BSONEachRow
title: 'BSONEachRow'
---

| Вход | Выход | Псевдоним |
|------|-------|-----------|
| ✔    | ✔     |           |

## Описание {#description}

Формат `BSONEachRow` парсит данные как последовательность документов Binary JSON (BSON) без какого-либо разделителя между ними. Каждая строка форматируется как единственный документ, а каждая колонка форматируется как одно поле документа BSON с именем колонки в качестве ключа.

## Соответствие типов данных {#data-types-matching}

Для вывода используется следующее соответствие между типами ClickHouse и типами BSON:

| Тип ClickHouse                                                                                                       | Тип BSON                                                                                                     |
|-----------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| [Bool](/sql-reference/data-types/boolean.md)                                                                  | `\x08` булевый                                                                                                   |
| [Int8/UInt8](/sql-reference/data-types/int-uint.md)/[Enum8](/sql-reference/data-types/enum.md)        | `\x10` int32                                                                                                  |
| [Int16/UInt16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md)      | `\x10` int32                                                                                                  |
| [Int32](/sql-reference/data-types/int-uint.md)                                                                | `\x10` int32                                                                                                  |
| [UInt32](/sql-reference/data-types/int-uint.md)                                                               | `\x12` int64                                                                                                  |
| [Int64/UInt64](/sql-reference/data-types/int-uint.md)                                                         | `\x12` int64                                                                                                  |
| [Float32/Float64](/sql-reference/data-types/float.md)                                                         | `\x01` double                                                                                                 |
| [Date](/sql-reference/data-types/date.md)/[Date32](/sql-reference/data-types/date32.md)               | `\x10` int32                                                                                                  |
| [DateTime](/sql-reference/data-types/datetime.md)                                                             | `\x12` int64                                                                                                  |
| [DateTime64](/sql-reference/data-types/datetime64.md)                                                         | `\x09` datetime                                                                                               |
| [Decimal32](/sql-reference/data-types/decimal.md)                                                             | `\x10` int32                                                                                                  |
| [Decimal64](/sql-reference/data-types/decimal.md)                                                             | `\x12` int64                                                                                                  |
| [Decimal128](/sql-reference/data-types/decimal.md)                                                            | `\x05` binary, `\x00` двоичный подкласс, размер = 16                                                               |
| [Decimal256](/sql-reference/data-types/decimal.md)                                                            | `\x05` binary, `\x00` двоичный подкласс, размер = 32                                                               |
| [Int128/UInt128](/sql-reference/data-types/int-uint.md)                                                       | `\x05` binary, `\x00` двоичный подкласс, размер = 16                                                               |
| [Int256/UInt256](/sql-reference/data-types/int-uint.md)                                                       | `\x05` binary, `\x00` двоичный подкласс, размер = 32                                                               |
| [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md) | `\x05` binary, `\x00` двоичный подкласс или \x02 строка, если настройка output_format_bson_string_as_string включена |
| [UUID](/sql-reference/data-types/uuid.md)                                                                     | `\x05` binary, `\x04` uuid подкласс, размер = 16                                                                 |
| [Array](/sql-reference/data-types/array.md)                                                                   | `\x04` массив                                                                                                  |
| [Tuple](/sql-reference/data-types/tuple.md)                                                                   | `\x04` массив                                                                                                  |
| [Named Tuple](/sql-reference/data-types/tuple.md)                                                             | `\x03` документ                                                                                               |
| [Map](/sql-reference/data-types/map.md)                                                                       | `\x03` документ                                                                                               |
| [IPv4](/sql-reference/data-types/ipv4.md)                                                                     | `\x10` int32                                                                                                  |
| [IPv6](/sql-reference/data-types/ipv6.md)                                                                     | `\x05` binary, `\x00` двоичный подкласс                                                                          |

Для ввода используется следующее соответствие между типами BSON и типами ClickHouse:

| Тип BSON                                | Тип ClickHouse                                                                                                                                                                                                                             |
|------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `\x01` double                            | [Float32/Float64](/sql-reference/data-types/float.md)                                                                                                                                                                               |
| `\x02` string                            | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x03` document                          | [Map](/sql-reference/data-types/map.md)/[Named Tuple](/sql-reference/data-types/tuple.md)                                                                                                                                   |
| `\x04` array                             | [Array](/sql-reference/data-types/array.md)/[Tuple](/sql-reference/data-types/tuple.md)                                                                                                                                     |
| `\x05` binary, `\x00` двоичный подкласс     | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)/[IPv6](/sql-reference/data-types/ipv6.md)                                                             |
| `\x05` binary, `\x02` старый двоичный подкласс | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x05` binary, `\x03` старый uuid подкласс   | [UUID](/sql-reference/data-types/uuid.md)                                                                                                                                                                                           |
| `\x05` binary, `\x04` uuid подкласс       | [UUID](/sql-reference/data-types/uuid.md)                                                                                                                                                                                           |
| `\x07` ObjectId                          | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x08` булевый                           | [Bool](/sql-reference/data-types/boolean.md)                                                                                                                                                                                        |
| `\x09` datetime                          | [DateTime64](/sql-reference/data-types/datetime64.md)                                                                                                                                                                               |
| `\x0A` нулевое значение                        | [NULL](/sql-reference/data-types/nullable.md)                                                                                                                                                                                       |
| `\x0D` код JavaScript                   | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x0E` символ                            | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x10` int32                             | [Int32/UInt32](/sql-reference/data-types/int-uint.md)/[Decimal32](/sql-reference/data-types/decimal.md)/[IPv4](/sql-reference/data-types/ipv4.md)/[Enum8/Enum16](/sql-reference/data-types/enum.md) |
| `\x12` int64                             | [Int64/UInt64](/sql-reference/data-types/int-uint.md)/[Decimal64](/sql-reference/data-types/decimal.md)/[DateTime64](/sql-reference/data-types/datetime64.md)                                                       |

Другие типы BSON не поддерживаются. Кроме того, производится преобразование между различными целочисленными типами. Например, возможно вставить значение BSON `int32` в ClickHouse как [`UInt8`](../../sql-reference/data-types/int-uint.md).

Большие целые числа и десятичные числа, такие как `Int128`/`UInt128`/`Int256`/`UInt256`/`Decimal128`/`Decimal256`, могут быть распознаны из двоичного значения BSON с подтипом `\x00`. В этом случае формат будет проверять, что размер бинарных данных равен размеру ожидаемого значения.

:::note
Этот формат не работает должным образом на платформах Big-Endian.
:::

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

| Настройка                                                                                                                                                                                               | Описание                                                                                  | По умолчанию  |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|----------|
| [`output_format_bson_string_as_string`](../../operations/settings/settings-formats.md/#output_format_bson_string_as_string)                                                                           | Использовать тип BSON String вместо Binary для строковых колонок.                                   | `false`  |
| [`input_format_bson_skip_fields_with_unsupported_types_in_schema_inference`](../../operations/settings/settings-formats.md/#input_format_bson_skip_fields_with_unsupported_types_in_schema_inference) | Позволить пропускать колонки с неподдерживаемыми типами во время вывода схемы для формата BSONEachRow. | `false`  |
