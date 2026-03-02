---
title: '지원되는 데이터 타입'
slug: /integrations/clickpipes/mysql/datatypes
description: 'MySQL에서 ClickHouse로의 MySQL ClickPipe 데이터 타입 매핑을 설명하는 페이지'
doc_type: 'reference'
keywords: ['MySQL ClickPipe 데이터 타입', 'MySQL에서 ClickHouse로의 데이터 타입', 'ClickPipe 데이터 타입 매핑', 'MySQL ClickHouse 타입 변환', '데이터베이스 타입 호환성']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

MySQL ClickPipe에서 지원되는 데이터 타입 매핑은 다음과 같습니다:

| MySQL 타입                | ClickHouse 타입        | 비고                                                                                   |
| --------------------------| -----------------------| -------------------------------------------------------------------------------------- |
| Enum                      | LowCardinality(String) ||
| Set                       | String                 ||
| Decimal                   | Decimal                ||
| TinyInt                   | Int8                   | 부호 없는 타입을 지원합니다.|
| SmallInt                  | Int16                  | 부호 없는 타입을 지원합니다.|
| MediumInt, Int            | Int32                  | 부호 없는 타입을 지원합니다.|
| BigInt                    | Int64                  | 부호 없는 타입을 지원합니다.|
| Year                      | Int16                  ||
| TinyText, Text, MediumText, LongText | String      ||
| TinyBlob, Blob, MediumBlob, LongBlob | String      ||
| Char, Varchar             | String                 ||
| Binary, VarBinary         | String                 ||
| TinyInt(1)                | Bool                   ||
| JSON                      | String                 | MySQL에만 해당합니다. MariaDB의 `json`은 `text`에 CONSTRAINT가 추가된 별칭일 뿐입니다.              |
| Geometry & Geometry Types | String                 | WKT(Well-Known Text)입니다. WKT는 소폭의 정밀도 손실이 발생할 수 있습니다.                       |
| Vector                    | Array(Float32)         | MySQL에만 해당합니다. MariaDB는 곧 지원을 추가할 예정입니다.                                            |
| Float                     | Float32                | 텍스트 프로토콜로 인해 초기 로드 시 ClickHouse의 정밀도가 MySQL과 다를 수 있습니다.|
| Double                    | Float64                | 텍스트 프로토콜로 인해 초기 로드 시 ClickHouse의 정밀도가 MySQL과 다를 수 있습니다.|
| Date                      | Date32                 | 일/월이 00인 값은 01로 매핑됩니다.|
| Time                      | DateTime64(6)          | 유닉스 에포크 기준의 시간 오프셋입니다.|
| Datetime, Timestamp       | DateTime64(6)          | 일/월이 00인 값은 01로 매핑됩니다.|