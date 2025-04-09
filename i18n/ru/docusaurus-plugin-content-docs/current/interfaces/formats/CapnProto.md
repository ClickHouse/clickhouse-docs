---
alias: []
description: 'Документация для Capnproto'
input_format: true
keywords: ['CapnProto']
output_format: true
slug: /interfaces/formats/CapnProto
title: 'CapnProto'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge/>

| Ввод | Вывод | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Формат `CapnProto` — это бинарный формат сообщений, похожий на формат [`Protocol Buffers`](https://developers.google.com/protocol-buffers/) и [Thrift](https://en.wikipedia.org/wiki/Apache_Thrift), но не похожий на [JSON](./JSON/JSON.md) или [MessagePack](https://msgpack.org/).
Сообщения CapnProto строго типизированы и не являются самодокументируемыми, что означает, что им требуется внешнее описание схемы. Схема применяется на лету и кешируется для каждого запроса.

Смотрите также [Схема Формата](/interfaces/formats/#formatschema).

## Соответствие Типов Данных {#data_types-matching-capnproto}

В таблице ниже показаны поддерживаемые типы данных и как они соответствуют типам данных ClickHouse в запросах `INSERT` и `SELECT`.

| Тип данных CapnProto (`INSERT`)                       | Тип данных ClickHouse                                                                                                                                                           | Тип данных CapnProto (`SELECT`)                       |
|------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------|
| `UINT8`, `BOOL`                                      | [UInt8](/sql-reference/data-types/int-uint.md)                                                                                                                         | `UINT8`                                              |
| `INT8`                                               | [Int8](/sql-reference/data-types/int-uint.md)                                                                                                                          | `INT8`                                               |
| `UINT16`                                             | [UInt16](/sql-reference/data-types/int-uint.md), [Date](/sql-reference/data-types/date.md)                                                                     | `UINT16`                                             |
| `INT16`                                              | [Int16](/sql-reference/data-types/int-uint.md)                                                                                                                         | `INT16`                                              |
| `UINT32`                                             | [UInt32](/sql-reference/data-types/int-uint.md), [DateTime](/sql-reference/data-types/datetime.md)                                                             | `UINT32`                                             |
| `INT32`                                              | [Int32](/sql-reference/data-types/int-uint.md), [Decimal32](/sql-reference/data-types/decimal.md)                                                              | `INT32`                                              |
| `UINT64`                                             | [UInt64](/sql-reference/data-types/int-uint.md)                                                                                                                        | `UINT64`                                             |
| `INT64`                                              | [Int64](/sql-reference/data-types/int-uint.md), [DateTime64](/sql-reference/data-types/datetime.md), [Decimal64](/sql-reference/data-types/decimal.md) | `INT64`                                              |
| `FLOAT32`                                            | [Float32](/sql-reference/data-types/float.md)                                                                                                                          | `FLOAT32`                                            |
| `FLOAT64`                                            | [Float64](/sql-reference/data-types/float.md)                                                                                                                          | `FLOAT64`                                            |
| `TEXT, DATA`                                         | [String](/sql-reference/data-types/string.md), [FixedString](/sql-reference/data-types/fixedstring.md)                                                         | `TEXT, DATA`                                         |
| `union(T, Void), union(Void, T)`                     | [Nullable(T)](/sql-reference/data-types/date.md)                                                                                                                       | `union(T, Void), union(Void, T)`                     |
| `ENUM`                                               | [Enum(8/16)](/sql-reference/data-types/enum.md)                                                                                                                        | `ENUM`                                               |
| `LIST`                                               | [Array](/sql-reference/data-types/array.md)                                                                                                                            | `LIST`                                               |
| `STRUCT`                                             | [Tuple](/sql-reference/data-types/tuple.md)                                                                                                                            | `STRUCT`                                             |
| `UINT32`                                             | [IPv4](/sql-reference/data-types/ipv4.md)                                                                                                                              | `UINT32`                                             |
| `DATA`                                               | [IPv6](/sql-reference/data-types/ipv6.md)                                                                                                                              | `DATA`                                               |
| `DATA`                                               | [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md)                                                                                                 | `DATA`                                               |
| `DATA`                                               | [Decimal128/Decimal256](/sql-reference/data-types/decimal.md)                                                                                                          | `DATA`                                               |
| `STRUCT(entries LIST(STRUCT(key Key, value Value)))` | [Map](/sql-reference/data-types/map.md)                                                                                                                                | `STRUCT(entries LIST(STRUCT(key Key, value Value)))` |

- Целочисленные типы могут быть преобразованы друг в друга во время ввода/вывода.
- Для работы с `Enum` в формате CapnProto используйте настройку [format_capn_proto_enum_comparising_mode](/operations/settings/settings-formats.md/#format_capn_proto_enum_comparising_mode).
- Массивы могут быть вложенными и могут иметь значение типа `Nullable` в качестве аргумента. Типы `Tuple` и `Map` также могут быть вложенными.

## Пример Использования {#example-usage}

### Вставка и Выбор Данных {#inserting-and-selecting-data-capnproto}

Вы можете вставить данные CapnProto из файла в таблицу ClickHouse с помощью следующей команды:

```bash
$ cat capnproto_messages.bin | clickhouse-client --query "INSERT INTO test.hits SETTINGS format_schema = 'schema:Message' FORMAT CapnProto"
```

Где `schema.capnp` выглядит следующим образом:

```capnp
struct Message {
  SearchPhrase @0 :Text;
  c @1 :Uint64;
}
```

Вы можете выбрать данные из таблицы ClickHouse и сохранить их в какой-либо файл в формате `CapnProto`, используя следующую команду:

```bash
$ clickhouse-client --query = "SELECT * FROM test.hits FORMAT CapnProto SETTINGS format_schema = 'schema:Message'"
```

### Использование Автосгенерированной Схемы {#using-autogenerated-capn-proto-schema}

Если у вас нет внешней схемы `CapnProto` для ваших данных, вы все равно можете выводить/вводить данные в формате `CapnProto`, используя автосгенерированную схему.

Например:

```sql
SELECT * FROM test.hits 
FORMAT CapnProto 
SETTINGS format_capn_proto_use_autogenerated_schema=1
```

В этом случае ClickHouse автоматически сгенерирует схему CapnProto в соответствии со структурой таблицы, используя функцию [structureToCapnProtoSchema](/sql-reference/functions/other-functions.md#structure_to_capn_proto_schema), и будет использовать эту схему для сериализации данных в формате CapnProto.

Вы также можете прочитать файл CapnProto с автосгенерированной схемой (в этом случае файл должен быть создан с использованием той же схемы):

```bash
$ cat hits.bin | clickhouse-client --query "INSERT INTO test.hits SETTINGS format_capn_proto_use_autogenerated_schema=1 FORMAT CapnProto"
```

## Настройки Формата {#format-settings}

Настройка [`format_capn_proto_use_autogenerated_schema`](../../operations/settings/settings-formats.md/#format_capn_proto_use_autogenerated_schema) включена по умолчанию и применяется, если [`format_schema`](/interfaces/formats#formatschema) не задан.

Вы также можете сохранить автосгенерированную схему в файл во время ввода/вывода, используя настройку [`output_format_schema`](/operations/settings/formats#output_format_schema). 

Например:

```sql
SELECT * FROM test.hits 
FORMAT CapnProto 
SETTINGS 
    format_capn_proto_use_autogenerated_schema=1,
    output_format_schema='path/to/schema/schema.capnp'
```
В этом случае автосгенерированная схема `CapnProto` будет сохранена в файл `path/to/schema/schema.capnp`.
