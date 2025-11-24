---
'title': '지원하는 데이터 유형'
'slug': '/integrations/clickpipes/mongodb/datatypes'
'description': 'MongoDB에서 ClickHouse로의 MongoDB ClickPipe 데이터 유형 매핑을 설명하는 페이지'
'doc_type': 'reference'
'keywords':
- 'clickpipes'
- 'mongodb'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---

MongoDB는 데이터를 BSON 문서로 저장합니다. ClickPipes에서는 BSON 문서를 ClickHouse에 JSON 또는 JSON 문자열로 수집하도록 구성할 수 있습니다. 아래 표는 지원되는 BSON에서 JSON 필드 유형 매핑을 보여줍니다:

| MongoDB BSON 유형       | ClickHouse JSON 유형                  | 비고                      |
| ------------------------ | -------------------------------------- | ------------------------ |
| ObjectId                 | String                                 |                          |
| String                   | String                                 |                          |
| 32비트 정수             | Int64                                  |                          |
| 64비트 정수             | Int64                                  |                          |
| Double                   | Float64                                |                          |
| Boolean                  | Bool                                   |                          |
| Date                     | String                                 | ISO 8601 형식           |
| 정규 표현식            | \{Options: String, Pattern: String\}   | 고정 필드를 가진 MongoDB 정규 표현식: Options (정규표현식 플래그) 및 Pattern (정규 표현식 패턴) |
| Timestamp                | \{T: Int64, I: Int64\}                 | 고정 필드를 가진 MongoDB 내부 타임스탬프 형식: T (타임스탬프) 및 I (증가) |
| Decimal128               | String                                 |                          |
| 이진 데이터              | \{Data: String, Subtype: Int64\}       | 고정 필드를 가진 MongoDB 이진 데이터: Data (base64 인코딩) 및 Subtype ([이진 유형의 종류](https://www.mongodb.com/docs/manual/reference/bson-types/#binary-data)) |
| JavaScript               | String                                 |                          |
| Null                     | Null                                   |                          |
| 배열                    | Dynamic                                | 동종 유형을 가진 배열은 Array(Nullable(T)); 혼합 원시 유형을 가진 배열은 가장 일반적인 공통 유형으로 승격; 호환되지 않는 복합 유형을 가진 배열은 Tuples로 변환 |
| 객체                     | Dynamic                                | 각 중첩 필드는 재귀적으로 매핑됩니다 |

:::info
ClickHouse의 JSON 데이터 유형에 대해 더 알아보려면 [우리 문서](https://clickhouse.com/docs/sql-reference/data-types/newjson)를 참조하세요.
:::
