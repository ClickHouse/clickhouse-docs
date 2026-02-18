---
alias: []
description: 'CapnProto 문서'
input_format: true
keywords: ['CapnProto']
output_format: true
slug: /interfaces/formats/CapnProto
title: 'CapnProto'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge />

| 입력 | 출력 | 별칭 |
| -- | -- | -- |
| ✔  | ✔  |    |


## 설명 \{#description\}

`CapnProto` 포맷은 [`Protocol Buffers`](https://developers.google.com/protocol-buffers/) 포맷 및 [Thrift](https://en.wikipedia.org/wiki/Apache_Thrift)와 유사한 이진 메시지 포맷이며, [JSON](./JSON/JSON.md)이나 [MessagePack](https://msgpack.org/)과는 다릅니다.
CapnProto 메시지는 엄격하게 타입이 지정되어 있으며 자기 기술(self-describing) 방식이 아니므로 외부 스키마 정의가 필요합니다. 이 스키마는 실행 시점에 동적으로 적용되며 각 쿼리마다 캐시됩니다.

[Format Schema](/interfaces/formats/#formatschema)도 참고하십시오.

## CapnProto와 데이터 타입 매칭 \{#data_types-matching-capnproto\}

아래 표는 지원되는 데이터 타입과 `INSERT` 및 `SELECT` 쿼리에서 각각이 ClickHouse [데이터 타입](/sql-reference/data-types/index.md)과 어떻게 매칭되는지 보여줍니다.

| CapnProto 데이터 타입 (`INSERT`)                     | ClickHouse 데이터 타입                                                                                                                                                        | CapnProto 데이터 타입 (`SELECT`)                     |
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

- 정수 타입은 입력/출력 시 서로 변환될 수 있습니다.
- CapnProto 포맷에서 `Enum`을 사용하려면 [format_capn_proto_enum_comparising_mode](/operations/settings/settings-formats.md/#format_capn_proto_enum_comparising_mode) SETTING을 사용하십시오.
- `Array`는 중첩될 수 있으며, 인자로 `Nullable` 타입(널 허용 타입)의 값을 가질 수 있습니다. `Tuple` 및 `Map` 타입 또한 중첩될 수 있습니다.

## 사용 예제 \{#example-usage\}

### 데이터 삽입 및 조회 \{#inserting-and-selecting-data-capnproto\}

다음 명령을 사용하여 파일에서 CapnProto 데이터를 ClickHouse 테이블에 삽입할 수 있습니다:

```bash
$ cat capnproto_messages.bin | clickhouse-client --query "INSERT INTO test.hits SETTINGS format_schema = 'schema:Message' FORMAT CapnProto"
```

이때 `schema.capnp` 파일은 다음과 같습니다:

```capnp
struct Message {
  SearchPhrase @0 :Text;
  c @1 :Uint64;
}
```

다음 명령을 사용하여 ClickHouse 테이블에서 데이터를 선택해 `CapnProto` 형식의 파일로 저장할 수 있습니다:

```bash
$ clickhouse-client --query = "SELECT * FROM test.hits FORMAT CapnProto SETTINGS format_schema = 'schema:Message'"
```


### 자동 생성된 스키마 사용 \{#using-autogenerated-capn-proto-schema\}

데이터에 대한 외부 `CapnProto` 스키마가 없더라도 자동 생성된 스키마를 사용하여 데이터를 `CapnProto` 형식으로 입력/출력할 수 있습니다.

예를 들어:

```sql
SELECT * FROM test.hits 
FORMAT CapnProto 
SETTINGS format_capn_proto_use_autogenerated_schema=1
```

이 경우 ClickHouse는 함수 [structureToCapnProtoSchema](/sql-reference/functions/other-functions.md#structureToCapnProtoSchema)를 사용하여 테이블 구조에 따라 CapnProto 스키마를 자동으로 생성하고, 이 스키마를 사용하여 데이터를 CapnProto 형식으로 직렬화합니다.

자동으로 생성된 스키마를 사용하여 CapnProto 파일을 읽을 수도 있습니다(이 경우 파일은 동일한 스키마로 생성되어야 합니다):

```bash
$ cat hits.bin | clickhouse-client --query "INSERT INTO test.hits SETTINGS format_capn_proto_use_autogenerated_schema=1 FORMAT CapnProto"
```


## 형식 설정 \{#format-settings\}

[`format_capn_proto_use_autogenerated_schema`](../../operations/settings/settings-formats.md/#format_capn_proto_use_autogenerated_schema) 설정은 기본적으로 활성화되어 있으며, [`format_schema`](/interfaces/formats#formatschema)가 설정되지 않은 경우에 적용됩니다.

입력/출출을 수행할 때 [`output_format_schema`](/operations/settings/formats#output_format_schema) 설정을 사용하여 자동 생성된 스키마를 파일로 저장할 수도 있습니다.

예를 들면 다음과 같습니다:

```sql
SELECT * FROM test.hits 
FORMAT CapnProto 
SETTINGS 
    format_capn_proto_use_autogenerated_schema=1,
    output_format_schema='path/to/schema/schema.capnp'
```

이 경우 자동 생성된 `CapnProto` 스키마는 `path/to/schema/schema.capnp` 파일에 저장됩니다.
