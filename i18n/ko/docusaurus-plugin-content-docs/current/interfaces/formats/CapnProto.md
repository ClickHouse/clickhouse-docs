---
'alias': []
'description': 'Capnproto에 대한 문서'
'input_format': true
'keywords':
- 'CapnProto'
'output_format': true
'slug': '/interfaces/formats/CapnProto'
'title': 'CapnProto'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge/>

| 입력 | 출력 | 별칭 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 설명 {#description}

`CapnProto` 형식은 [`Protocol Buffers`](https://developers.google.com/protocol-buffers/) 형식 및 [Thrift](https://en.wikipedia.org/wiki/Apache_Thrift)와 유사한 이진 메시지 형식이지만 [JSON](./JSON/JSON.md)이나 [MessagePack](https://msgpack.org/)과는 다릅니다. CapnProto 메시지는 엄격하게 타입이 지정되어 있으며 자기 설명적이지 않으므로 외부 스키마 설명이 필요합니다. 스키마는 즉시 적용되며 각 쿼리에 대해 캐시됩니다.

자세한 내용은 [형식 스키마](/interfaces/formats/#formatschema)를 참조하세요.

## 데이터 유형 일치 {#data_types-matching-capnproto}

아래 표는 지원되는 데이터 유형과 `INSERT` 및 `SELECT` 쿼리에서 ClickHouse [데이터 유형](/sql-reference/data-types/index.md)와의 일치를 보여줍니다.

| CapnProto 데이터 유형 (`INSERT`)                       | ClickHouse 데이터 유형                                                                                                                                                           | CapnProto 데이터 유형 (`SELECT`)                       |
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

- 정수 유형은 입력/출력 중 서로 변환할 수 있습니다.
- CapnProto 형식에서 `Enum`을 사용하려면 [format_capn_proto_enum_comparising_mode](/operations/settings/settings-formats.md/#format_capn_proto_enum_comparising_mode) 설정을 사용하세요.
- 배열은 중첩될 수 있으며 `Nullable` 유형의 값을 인수로 가질 수 있습니다. `Tuple` 및 `Map` 유형도 중첩될 수 있습니다.

## 예제 사용법 {#example-usage}

### 데이터 삽입 및 선택 {#inserting-and-selecting-data-capnproto}

다음 명령을 사용하여 파일에서 ClickHouse 테이블에 CapnProto 데이터를 삽입할 수 있습니다:

```bash
$ cat capnproto_messages.bin | clickhouse-client --query "INSERT INTO test.hits SETTINGS format_schema = 'schema:Message' FORMAT CapnProto"
```

여기서 `schema.capnp`는 다음과 같습니다:

```capnp
struct Message {
  SearchPhrase @0 :Text;
  c @1 :Uint64;
}
```

다음 명령을 사용하여 ClickHouse 테이블에서 데이터를 선택하고 CapnProto 형식으로 파일에 저장할 수 있습니다:

```bash
$ clickhouse-client --query = "SELECT * FROM test.hits FORMAT CapnProto SETTINGS format_schema = 'schema:Message'"
```

### 자동 생성된 스키마 사용 {#using-autogenerated-capn-proto-schema}

데이터에 대한 외부 `CapnProto` 스키마가 없는 경우에도 자동 생성된 스키마를 사용하여 `CapnProto` 형식으로 데이터 입력/출력을 수행할 수 있습니다.

예를 들면:

```sql
SELECT * FROM test.hits 
FORMAT CapnProto 
SETTINGS format_capn_proto_use_autogenerated_schema=1
```

이 경우 ClickHouse는 [structureToCapnProtoSchema](/sql-reference/functions/other-functions.md#structureToCapnProtoSchema) 함수를 사용하여 테이블 구조에 따라 CapnProto 스키마를 자동 생성하고 이 스키마를 사용하여 CapnProto 형식으로 데이터를 직렬화합니다.

자동 생성된 스키마로 CapnProto 파일을 읽을 수도 있습니다 (이 경우 파일은 동일한 스키마를 사용하여 생성되어야 합니다):

```bash
$ cat hits.bin | clickhouse-client --query "INSERT INTO test.hits SETTINGS format_capn_proto_use_autogenerated_schema=1 FORMAT CapnProto"
```

## 형식 설정 {#format-settings}

설정 [`format_capn_proto_use_autogenerated_schema`](../../operations/settings/settings-formats.md/#format_capn_proto_use_autogenerated_schema)는 기본적으로 활성화되어 있으며 [`format_schema`](/interfaces/formats#formatschema)가 설정되지 않은 경우에 적용됩니다.

또한 설정 [`output_format_schema`](/operations/settings/formats#output_format_schema)를 사용하여 입력/출력 중에 자동 생성된 스키마를 파일에 저장할 수 있습니다.

예를 들어:

```sql
SELECT * FROM test.hits 
FORMAT CapnProto 
SETTINGS 
    format_capn_proto_use_autogenerated_schema=1,
    output_format_schema='path/to/schema/schema.capnp'
```
이 경우 자동 생성된 `CapnProto` 스키마는 `path/to/schema/schema.capnp` 파일에 저장됩니다.
