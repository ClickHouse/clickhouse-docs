---
alias: []
description: 'BSONEachRow 형식에 대한 문서'
input_format: true
keywords: ['BSONEachRow']
output_format: true
slug: /interfaces/formats/BSONEachRow
title: 'BSONEachRow'
doc_type: 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 설명 \{#description\}

`BSONEachRow` 형식은 데이터를 구분자 없이 연속된 Binary JSON(BSON) 문서 시퀀스로 파싱합니다.
각 행은 단일 문서로 표현되며, 각 컬럼은 컬럼 이름을 키로 갖는 단일 BSON 문서 필드로 표현됩니다.

## 데이터 타입 매칭 \{#data-types-matching\}

출력 시에는 ClickHouse 타입과 BSON 타입 사이에 다음과 같은 매핑을 사용합니다:

| ClickHouse type                                                                                                       | BSON 타입                                                                                                     |
|-----------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| [Bool](/sql-reference/data-types/boolean.md)                                                                  | `\x08` boolean                                                                                                |
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
| [Decimal128](/sql-reference/data-types/decimal.md)                                                            | `\x05` 바이너리, `\x00` 바이너리 서브타입, 크기 = 16                                                         |
| [Decimal256](/sql-reference/data-types/decimal.md)                                                            | `\x05` 바이너리, `\x00` 바이너리 서브타입, 크기 = 32                                                         |
| [Int128/UInt128](/sql-reference/data-types/int-uint.md)                                                       | `\x05` 바이너리, `\x00` 바이너리 서브타입, 크기 = 16                                                         |
| [Int256/UInt256](/sql-reference/data-types/int-uint.md)                                                       | `\x05` 바이너리, `\x00` 바이너리 서브타입, 크기 = 32                                                         |
| [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md) | `\x05` 바이너리, `\x00` 바이너리 서브타입 또는 설정 `output_format_bson_string_as_string`이 활성화된 경우 \x02 string |
| [UUID](/sql-reference/data-types/uuid.md)                                                                     | `\x05` 바이너리, `\x04` uuid 서브타입, 크기 = 16                                                             |
| [Array](/sql-reference/data-types/array.md)                                                                   | `\x04` 배열                                                                                                   |
| [Tuple](/sql-reference/data-types/tuple.md)                                                                   | `\x04` 배열                                                                                                   |
| [Named Tuple](/sql-reference/data-types/tuple.md)                                                             | `\x03` 도큐먼트                                                                                               |
| [Map](/sql-reference/data-types/map.md)                                                                       | `\x03` 도큐먼트                                                                                               |
| [IPv4](/sql-reference/data-types/ipv4.md)                                                                     | `\x10` int32                                                                                                  |
| [IPv6](/sql-reference/data-types/ipv6.md)                                                                     | `\x05` 바이너리, `\x00` 바이너리 서브타입                                                                    |

입력 시에는 BSON 타입과 ClickHouse 타입 사이에 다음과 같은 매핑을 사용합니다:

| BSON Type                                | ClickHouse Type                                                                                                                                                                                                                             |
|------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `\x01` double                            | [Float32/Float64](/sql-reference/data-types/float.md)                                                                                                                                                                               |
| `\x02` string                            | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x03` document                          | [Map](/sql-reference/data-types/map.md)/[Named Tuple](/sql-reference/data-types/tuple.md)                                                                                                                                   |
| `\x04` array                             | [Array](/sql-reference/data-types/array.md)/[Tuple](/sql-reference/data-types/tuple.md)                                                                                                                                     |
| `\x05` binary, `\x00` binary subtype     | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)/[IPv6](/sql-reference/data-types/ipv6.md)                                                             |
| `\x05` binary, `\x02` old binary subtype | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x05` binary, `\x03` old uuid subtype   | [UUID](/sql-reference/data-types/uuid.md)                                                                                                                                                                                           |
| `\x05` binary, `\x04` uuid subtype       | [UUID](/sql-reference/data-types/uuid.md)                                                                                                                                                                                           |
| `\x07` ObjectId                          | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x08` boolean                           | [Bool](/sql-reference/data-types/boolean.md)                                                                                                                                                                                        |
| `\x09` datetime                          | [DateTime64](/sql-reference/data-types/datetime64.md)                                                                                                                                                                               |
| `\x0A` null value                        | [NULL](/sql-reference/data-types/nullable.md)                                                                                                                                                                                       |
| `\x0D` JavaScript code                   | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x0E` symbol                            | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x10` int32                             | [Int32/UInt32](/sql-reference/data-types/int-uint.md)/[Decimal32](/sql-reference/data-types/decimal.md)/[IPv4](/sql-reference/data-types/ipv4.md)/[Enum8/Enum16](/sql-reference/data-types/enum.md) |
| `\x12` int64                             | [Int64/UInt64](/sql-reference/data-types/int-uint.md)/[Decimal64](/sql-reference/data-types/decimal.md)/[DateTime64](/sql-reference/data-types/datetime64.md)                                                       |

다른 BSON 타입은 지원되지 않습니다. 또한 서로 다른 정수 타입 간 변환도 수행합니다.  
예를 들어, BSON `int32` 값을 ClickHouse에 [`UInt8`](../../sql-reference/data-types/int-uint.md)로 삽입할 수 있습니다.

`Int128`/`UInt128`/`Int256`/`UInt256`/`Decimal128`/`Decimal256`과 같은 큰 정수 및 소수 타입은 `\x00` 바이너리 서브타입을 가진 BSON Binary 값에서 파싱할 수 있습니다.  
이 경우, 형식은 바이너리 데이터의 크기가 예상 값의 크기와 동일한지 검증합니다.

:::note
이 형식은 Big-Endian 플랫폼에서는 제대로 동작하지 않습니다.
:::

## 사용 예시 \{#example-usage\}

### 데이터 삽입 \{#inserting-data\}

다음 데이터가 포함된 BSON 파일 `football.bson`을 사용합니다.

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

데이터를 삽입하십시오:

```sql
INSERT INTO football FROM INFILE 'football.bson' FORMAT BSONEachRow;
```


### 데이터 읽기 \{#reading-data\}

`BSONEachRow` 형식을 사용해 데이터를 읽습니다:

```sql
SELECT *
FROM football INTO OUTFILE 'docs_data/bson/football.bson'
FORMAT BSONEachRow
```

:::tip
BSON은 바이너리 형식이라 터미널에서 사람이 읽을 수 있는 형태로 표시되지 않습니다. BSON 파일로 출력하려면 `INTO OUTFILE`을 사용하십시오.
:::


## Format settings \{#format-settings\}

| Setting                                                                                                                                                                                               | 설명                                                                                                   | 기본값   |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|----------|
| [`output_format_bson_string_as_string`](../../operations/settings/settings-formats.md/#output_format_bson_string_as_string)                                                                           | String 컬럼에 대해 Binary 대신 BSON String 타입을 사용합니다.                                         | `false`  |
| [`input_format_bson_skip_fields_with_unsupported_types_in_schema_inference`](../../operations/settings/settings-formats.md/#input_format_bson_skip_fields_with_unsupported_types_in_schema_inference) | BSONEachRow 포맷에 대한 스키마 추론(schema inference) 시, 지원되지 않는 타입을 가진 컬럼을 건너뜀을 허용합니다. | `false`  |