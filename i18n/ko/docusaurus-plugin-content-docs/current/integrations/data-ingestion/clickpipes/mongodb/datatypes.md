---
title: '지원되는 데이터 타입'
slug: /integrations/clickpipes/mongodb/datatypes
description: 'MongoDB에서 ClickHouse로의 MongoDB ClickPipe 데이터 타입 매핑을 설명하는 페이지'
doc_type: 'reference'
keywords: ['clickpipes', 'mongodb', 'cdc', '데이터 수집', '실시간 동기화']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

MongoDB는 데이터 레코드를 BSON 문서로 저장합니다. ClickPipes에서는 BSON 문서를 JSON 또는 JSON String 형태로 ClickHouse에 수집하도록 설정할 수 있습니다. 다음 표는 지원되는 BSON에서 JSON 필드 타입 매핑을 보여줍니다.

| MongoDB BSON 타입        | ClickHouse JSON 타입                   | 비고                      |
| ------------------------ | -------------------------------------- | ------------------------ |
| ObjectId                 | String                                 |                          |
| String                   | String                                 |                          |
| 32-bit integer           | Int64                                  |                          |
| 64-bit integer           | Int64                                  |                          |
| Double                   | Float64                                |                          |
| Boolean                  | Bool                                   |                          |
| Date                     | String                                 | ISO 8601 형식            |
| Regular Expression       | \{Options: String, Pattern: String\}   | MongoDB 정규식으로, 고정 필드인 Options(regex 플래그)와 Pattern(정규식 패턴)을 포함합니다 |
| Timestamp                | \{T: Int64, I: Int64\}                 | MongoDB 내부 타임스탬프 형식으로, 고정 필드인 T(timestamp)와 I(increment)를 포함합니다 |
| Decimal128               | String                                 |                          |
| Binary data              | \{Data: String, Subtype: Int64\}       | MongoDB 바이너리 데이터로, 고정 필드인 Data(base64 인코딩)와 Subtype([바이너리 타입](https://www.mongodb.com/docs/manual/reference/bson-types/#binary-data))을 포함합니다 |
| JavaScript               | String                                 |                          |
| Null                     | Null                                   |                          |
| Array                    | Dynamic                                | 동일한 타입의 요소를 가진 배열은 Array(Nullable(T))가 되며, 서로 다른 원시 타입이 섞인 배열은 가장 일반적인 공통 타입으로 승격되며, 호환되지 않는 복잡한 타입이 섞인 배열은 Tuple이 됩니다 |
| Object                   | Dynamic                                | 각 중첩 필드는 재귀적으로 매핑됩니다 |

:::info
ClickHouse의 JSON 데이터 타입에 대해 더 알아보려면 [문서](https://clickhouse.com/docs/sql-reference/data-types/newjson)를 참고하십시오.
:::