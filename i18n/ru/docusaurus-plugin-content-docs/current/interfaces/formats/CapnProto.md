---
alias: []
description: 'Документация по CapnProto'
input_format: true
keywords: ['CapnProto']
output_format: true
slug: /interfaces/formats/CapnProto
title: 'CapnProto'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge />

| Вход | Выход | Псевдоним |
| ---- | ----- | --------- |
| ✔    | ✔     |           |


## Описание {#description}

Формат `CapnProto` — это двоичный формат сообщений, похожий на формат [`Protocol Buffers`](https://developers.google.com/protocol-buffers/) и [Thrift](https://en.wikipedia.org/wiki/Apache_Thrift), но, в отличие от [JSON](./JSON/JSON.md) или [MessagePack](https://msgpack.org/), не имеет с ними общего.
Сообщения CapnProto строго типизированы и не являются самоописательными, то есть им требуется внешнее описание схемы. Схема применяется на лету и кэшируется для каждого запроса.

См. также [Схема формата](/interfaces/formats/#formatschema).

## Соответствие типов данных {#data_types-matching-capnproto}

Приведённая ниже таблица показывает поддерживаемые типы данных и то, как они сопоставляются с [типами данных](/sql-reference/data-types/index.md) ClickHouse в запросах `INSERT` и `SELECT`.

| Тип данных CapnProto (`INSERT`)                       | Тип данных ClickHouse                                                                                                                                                           | Тип данных CapnProto (`SELECT`)                       |
|-------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------|
| `UINT8`, `BOOL`                                      | [UInt8](/sql-reference/data-types/int-uint.md)                                                                                                                                  | `UINT8`                                               |
| `INT8`                                               | [Int8](/sql-reference/data-types/int-uint.md)                                                                                                                                   | `INT8`                                                |
| `UINT16`                                             | [UInt16](/sql-reference/data-types/int-uint.md), [Date](/sql-reference/data-types/date.md)                                                                                      | `UINT16`                                              |
| `INT16`                                              | [Int16](/sql-reference/data-types/int-uint.md)                                                                                                                                  | `INT16`                                               |
| `UINT32`                                             | [UInt32](/sql-reference/data-types/int-uint.md), [DateTime](/sql-reference/data-types/datetime.md)                                                                              | `UINT32`                                              |
| `INT32`                                              | [Int32](/sql-reference/data-types/int-uint.md), [Decimal32](/sql-reference/data-types/decimal.md)                                                                               | `INT32`                                               |
| `UINT64`                                             | [UInt64](/sql-reference/data-types/int-uint.md)                                                                                                                                 | `UINT64`                                              |
| `INT64`                                              | [Int64](/sql-reference/data-types/int-uint.md), [DateTime64](/sql-reference/data-types/datetime.md), [Decimal64](/sql-reference/data-types/decimal.md)                         | `INT64`                                               |
| `FLOAT32`                                            | [Float32](/sql-reference/data-types/float.md)                                                                                                                                   | `FLOAT32`                                             |
| `FLOAT64`                                            | [Float64](/sql-reference/data-types/float.md)                                                                                                                                   | `FLOAT64`                                             |
| `TEXT, DATA`                                         | [String](/sql-reference/data-types/string.md), [FixedString](/sql-reference/data-types/fixedstring.md)                                                                          | `TEXT, DATA`                                          |
| `union(T, Void), union(Void, T)`                     | [Nullable(T)](/sql-reference/data-types/date.md)                                                                                                                                | `union(T, Void), union(Void, T)`                      |
| `ENUM`                                               | [Enum(8/16)](/sql-reference/data-types/enum.md)                                                                                                                                 | `ENUM`                                                |
| `LIST`                                               | [Array](/sql-reference/data-types/array.md)                                                                                                                                     | `LIST`                                                |
| `STRUCT`                                             | [Tuple](/sql-reference/data-types/tuple.md)                                                                                                                                     | `STRUCT`                                              |
| `UINT32`                                             | [IPv4](/sql-reference/data-types/ipv4.md)                                                                                                                                       | `UINT32`                                              |
| `DATA`                                               | [IPv6](/sql-reference/data-types/ipv6.md)                                                                                                                                       | `DATA`                                                |
| `DATA`                                               | [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md)                                                                                                          | `DATA`                                                |
| `DATA`                                               | [Decimal128/Decimal256](/sql-reference/data-types/decimal.md)                                                                                                                   | `DATA`                                                |
| `STRUCT(entries LIST(STRUCT(key Key, value Value)))` | [Map](/sql-reference/data-types/map.md)                                                                                                                                         | `STRUCT(entries LIST(STRUCT(key Key, value Value)))`  |

- Целочисленные типы могут быть преобразованы друг в друга при вводе и выводе данных.
- Для работы с `Enum` в формате CapnProto используйте настройку [format_capn_proto_enum_comparising_mode](/operations/settings/settings-formats.md/#format_capn_proto_enum_comparising_mode).
- Массивы могут быть вложенными и могут иметь значение типа `Nullable` в качестве аргумента. Типы `Tuple` и `Map` также могут быть вложенными.

## Пример использования {#example-usage}

### Вставка и выборка данных {#inserting-and-selecting-data-capnproto}

Вы можете вставить данные формата CapnProto из файла в таблицу ClickHouse с помощью следующей команды:

```bash
$ cat capnproto_messages.bin | clickhouse-client --query "INSERT INTO test.hits SETTINGS format_schema = 'schema:Message' FORMAT CapnProto"
```

где файл `schema.capnp` выглядит следующим образом:

```capnp
struct Message {
  SearchPhrase @0 :Text;
  c @1 :Uint64;
}
```

Вы можете выбрать данные из таблицы ClickHouse и сохранить их в файл в формате `CapnProto`, используя следующую команду:

```bash
$ clickhouse-client --query = "SELECT * FROM test.hits FORMAT CapnProto SETTINGS format_schema = 'schema:Message'"
```


### Использование автоматически сгенерированной схемы {#using-autogenerated-capn-proto-schema}

Если у вас нет внешней схемы `CapnProto` для ваших данных, вы все равно можете считывать и выводить данные в формате `CapnProto`, используя автоматически сгенерированную схему.

Например:

```sql
SELECT * FROM test.hits 
FORMAT CapnProto 
SETTINGS format_capn_proto_use_autogenerated_schema=1
```

В этом случае ClickHouse автоматически сгенерирует схему CapnProto в соответствии со структурой таблицы с помощью функции [structureToCapnProtoSchema](/sql-reference/functions/other-functions.md#structureToCapnProtoSchema) и будет использовать эту схему для сериализации данных в формате CapnProto.

Вы также можете прочитать файл CapnProto с автоматически сгенерированной схемой (в этом случае файл должен быть создан с использованием той же схемы):

```bash
$ cat hits.bin | clickhouse-client --query "INSERT INTO test.hits SETTINGS format_capn_proto_use_autogenerated_schema=1 FORMAT CapnProto"
```


## Настройки формата {#format-settings}

Настройка [`format_capn_proto_use_autogenerated_schema`](../../operations/settings/settings-formats.md/#format_capn_proto_use_autogenerated_schema) включена по умолчанию и применяется, если параметр [`format_schema`](/interfaces/formats#formatschema) не задан.

Вы также можете сохранить автоматически сгенерированную схему в файл при операциях ввода/вывода, используя настройку [`output_format_schema`](/operations/settings/formats#output_format_schema).

Например:

```sql
SELECT * FROM test.hits 
FORMAT CapnProto 
SETTINGS 
    format_capn_proto_use_autogenerated_schema=1,
    output_format_schema='path/to/schema/schema.capnp'
```

В этом случае автоматически сгенерированная схема `CapnProto` будет сохранена в файле `path/to/schema/schema.capnp`.
