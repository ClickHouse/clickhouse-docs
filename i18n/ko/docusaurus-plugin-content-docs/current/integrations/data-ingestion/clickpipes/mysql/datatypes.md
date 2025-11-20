---
'title': '지원되는 데이터 유형'
'slug': '/integrations/clickpipes/mysql/datatypes'
'description': 'MySQL에서 ClickHouse로의 MySQL ClickPipe 데이터 유형 매핑을 설명하는 페이지'
'doc_type': 'reference'
'keywords':
- 'MySQL ClickPipe datatypes'
- 'MySQL to ClickHouse data types'
- 'ClickPipe datatype mapping'
- 'MySQL ClickHouse type conversion'
- 'database type compatibility'
---

Here is the supported data-type mapping for the MySQL ClickPipe:

| MySQL Type                | ClickHouse type        | Notes                                                                                  |
| --------------------------| -----------------------| -------------------------------------------------------------------------------------- |
| Enum                      | LowCardinality(String) || 
| Set                       | String                 || 
| Decimal                   | Decimal                || 
| TinyInt                   | Int8                   | Supports unsigned.|
| SmallInt                  | Int16                  | Supports unsigned.|
| MediumInt, Int            | Int32                  | Supports unsigned.|
| BigInt                    | Int64                  | Supports unsigned.|
| Year                      | Int16                  || 
| TinyText, Text, MediumText, LongText | String      || 
| TinyBlob, Blob, MediumBlob, LongBlob | String      || 
| Char, Varchar             | String                 || 
| Binary, VarBinary         | String                 || 
| TinyInt(1)                | Bool                   || 
| JSON                      | String                 | MySQL 전용; MariaDB `json`은 제약 조건이 있는 `text`의 별칭입니다.              |
| Geometry & Geometry Types | String                 | WKT (잘 알려진 텍스트). WKT는 작은 정밀도 손실이 발생할 수 있습니다.                       |
| Vector                    | Array(Float32)         | MySQL 전용; MariaDB는 곧 지원을 추가할 예정입니다.                                            |
| Float                     | Float32                | ClickHouse의 정밀도는 텍스트 프로토콜로 인해 MySQL과 초기 로드 시 다를 수 있습니다.|
| Double                    | Float64                | ClickHouse의 정밀도는 텍스트 프로토콜로 인해 MySQL과 초기 로드 시 다를 수 있습니다.|
| Date                      | Date32                 | 00 일/월이 01로 매핑됩니다.|
| Time                      | DateTime64(6)          | 유닉스 기준 시간에서의 시간 오프셋.|
| Datetime, Timestamp       | DateTime64(6)          | 00 일/월이 01로 매핑됩니다.|
