---
alias: []
description: 'Документация по формату BSONEachRow'
input_format: true
keywords: ['BSONEachRow']
output_format: true
slug: /interfaces/formats/BSONEachRow
title: 'BSONEachRow'
doc_type: 'reference'
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание \\{#description\\}

Формат `BSONEachRow` разбирает данные как последовательность документов в формате Binary JSON (BSON) без каких-либо разделителей между ними.
Каждая строка представлена одним документом, а каждый столбец — одним полем BSON-документа, где в качестве ключа используется имя столбца.

## Соответствие типов данных \\{#data-types-matching\\}

При выводе используется следующее соответствие между типами ClickHouse и типами BSON:

| Тип ClickHouse                                                                                                       | Тип BSON                                                                                                      |
|----------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| [Bool](/sql-reference/data-types/boolean.md)                                                                         | `\x08` boolean                                                                                                |
| [Int8/UInt8](/sql-reference/data-types/int-uint.md)/[Enum8](/sql-reference/data-types/enum.md)                      | `\x10` int32                                                                                                  |
| [Int16/UInt16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md)                   | `\x10` int32                                                                                                  |
| [Int32](/sql-reference/data-types/int-uint.md)                                                                       | `\x10` int32                                                                                                  |
| [UInt32](/sql-reference/data-types/int-uint.md)                                                                      | `\x12` int64                                                                                                  |
| [Int64/UInt64](/sql-reference/data-types/int-uint.md)                                                                | `\x12` int64                                                                                                  |
| [Float32/Float64](/sql-reference/data-types/float.md)                                                                | `\x01` double                                                                                                 |
| [Date](/sql-reference/data-types/date.md)/[Date32](/sql-reference/data-types/date32.md)                             | `\x10` int32                                                                                                  |
| [DateTime](/sql-reference/data-types/datetime.md)                                                                    | `\x12` int64                                                                                                  |
| [DateTime64](/sql-reference/data-types/datetime64.md)                                                                | `\x09` datetime                                                                                               |
| [Decimal32](/sql-reference/data-types/decimal.md)                                                                    | `\x10` int32                                                                                                  |
| [Decimal64](/sql-reference/data-types/decimal.md)                                                                    | `\x12` int64                                                                                                  |
| [Decimal128](/sql-reference/data-types/decimal.md)                                                                   | `\x05` binary, `\x00` подтип binary, размер = 16                                                              |
| [Decimal256](/sql-reference/data-types/decimal.md)                                                                   | `\x05` binary, `\x00` подтип binary, размер = 32                                                              |
| [Int128/UInt128](/sql-reference/data-types/int-uint.md)                                                             | `\x05` binary, `\x00` подтип binary, размер = 16                                                              |
| [Int256/UInt256](/sql-reference/data-types/int-uint.md)                                                             | `\x05` binary, `\x00` подтип binary, размер = 32                                                              |
| [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)               | `\x05` binary, `\x00` подтип binary или \x02 string, если включена настройка output_format_bson_string_as_string |
| [UUID](/sql-reference/data-types/uuid.md)                                                                            | `\x05` binary, `\x04` подтип uuid, размер = 16                                                                |
| [Array](/sql-reference/data-types/array.md)                                                                          | `\x04` array                                                                                                  |
| [Tuple](/sql-reference/data-types/tuple.md)                                                                          | `\x04` array                                                                                                  |
| [Named Tuple](/sql-reference/data-types/tuple.md)                                                                    | `\x03` document                                                                                               |
| [Map](/sql-reference/data-types/map.md)                                                                              | `\x03` document                                                                                               |
| [IPv4](/sql-reference/data-types/ipv4.md)                                                                            | `\x10` int32                                                                                                  |
| [IPv6](/sql-reference/data-types/ipv6.md)                                                                            | `\x05` binary, `\x00` подтип binary                                                                           |

При вводе используется следующее соответствие между типами BSON и типами ClickHouse:

| Тип BSON                                 | Тип ClickHouse                                                                                                                                                                                                                            |
|------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `\x01` double                            | [Float32/Float64](/sql-reference/data-types/float.md)                                                                                                                                                                               |
| `\x02` string                            | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x03` document                          | [Map](/sql-reference/data-types/map.md)/[Named Tuple](/sql-reference/data-types/tuple.md)                                                                                                                                   |
| `\x04` array                             | [Array](/sql-reference/data-types/array.md)/[Tuple](/sql-reference/data-types/tuple.md)                                                                                                                                     |
| `\x05` binary, `\x00` двоичный подтип    | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)/[IPv6](/sql-reference/data-types/ipv6.md)                                                             |
| `\x05` binary, `\x02` старый двоичный подтип | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x05` binary, `\x03` старый подтип uuid | [UUID](/sql-reference/data-types/uuid.md)                                                                                                                                                                                           |
| `\x05` binary, `\x04` подтип uuid        | [UUID](/sql-reference/data-types/uuid.md)                                                                                                                                                                                           |
| `\x07` ObjectId                          | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x08` boolean                           | [Bool](/sql-reference/data-types/boolean.md)                                                                                                                                                                                        |
| `\x09` datetime                          | [DateTime64](/sql-reference/data-types/datetime64.md)                                                                                                                                                                               |
| `\x0A` null value                        | [NULL](/sql-reference/data-types/nullable.md)                                                                                                                                                                                       |
| `\x0D` JavaScript code                   | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x0E` symbol                            | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x10` int32                             | [Int32/UInt32](/sql-reference/data-types/int-uint.md)/[Decimal32](/sql-reference/data-types/decimal.md)/[IPv4](/sql-reference/data-types/ipv4.md)/[Enum8/Enum16](/sql-reference/data-types/enum.md) |
| `\x12` int64                             | [Int64/UInt64](/sql-reference/data-types/int-uint.md)/[Decimal64](/sql-reference/data-types/decimal.md)/[DateTime64](/sql-reference/data-types/datetime64.md)                                                       |

Другие типы BSON не поддерживаются. Кроме того, выполняется преобразование между различными целочисленными типами. 
Например, можно вставить значение BSON типа `int32` в ClickHouse как [`UInt8`](../../sql-reference/data-types/int-uint.md).

Большие целые и десятичные числа, такие как `Int128`/`UInt128`/`Int256`/`UInt256`/`Decimal128`/`Decimal256`, могут быть получены при разборе значения BSON типа Binary с двоичным подтипом `\x00`. 
В этом случае формат проверяет, что размер двоичных данных равен размеру ожидаемого значения.

:::note
Этот формат работает некорректно на платформах с порядком байтов Big-Endian.
:::

## Пример использования \\{#example-usage\\}

### Вставка данных \\{#inserting-data\\}

Используем BSON-файл со следующими данными с именем `football.bson`:

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

Вставьте данные:

```sql
INSERT INTO football FROM INFILE 'football.bson' FORMAT BSONEachRow;
```

### Чтение данных \\{#reading-data\\}

Считывайте данные в формате `BSONEachRow`:

```sql
SELECT *
FROM football INTO OUTFILE 'docs_data/bson/football.bson'
FORMAT BSONEachRow
```

:::tip
BSON — это двоичный формат, который не отображается в человекочитаемом виде в терминале. Используйте `INTO OUTFILE` для вывода файлов BSON.
:::

## Настройки формата \\{#format-settings\\}

| Параметр                                                                                                                                                                                              | Описание                                                                                                   | Значение по умолчанию |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|------------------------|
| [`output_format_bson_string_as_string`](../../operations/settings/settings-formats.md/#output_format_bson_string_as_string)                                                                           | Использовать тип BSON String вместо Binary для строковых столбцов.                                        | `false`                |
| [`input_format_bson_skip_fields_with_unsupported_types_in_schema_inference`](../../operations/settings/settings-formats.md/#input_format_bson_skip_fields_with_unsupported_types_in_schema_inference) | Разрешить пропуск столбцов с неподдерживаемыми типами при определении схемы для формата BSONEachRow.      | `false`                |