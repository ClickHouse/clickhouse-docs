---
'alias': []
'description': 'Avro 포맷에 대한 Documentation'
'input_format': true
'keywords':
- 'Avro'
'output_format': true
'slug': '/interfaces/formats/Avro'
'title': 'Avro'
'doc_type': 'reference'
---

import DataTypeMapping from './_snippets/data-types-matching.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 설명 {#description}

[Apache Avro](https://avro.apache.org/)는 효율적인 데이터 처리를 위해 바이너리 인코딩을 사용하는 행 단위 직렬화 형식입니다. `Avro` 형식은 [Avro 데이터 파일](https://avro.apache.org/docs/++version++/specification/#object-container-files)의 읽기와 작성을 지원합니다. 이 형식은 내장 스키마가 있는 자기 설명형 메시지를 기대합니다. 스키마 레지스트리와 함께 Avro를 사용하는 경우, [`AvroConfluent`](./AvroConfluent.md) 형식을 참조하십시오.

## 데이터 유형 매핑 {#data-type-mapping}

<DataTypeMapping/>

## 형식 설정 {#format-settings}

| 설정                                       | 설명                                                                                             | 기본값 |
|-------------------------------------------|--------------------------------------------------------------------------------------------------|-------|
| `input_format_avro_allow_missing_fields`  | 스키마에서 필드를 찾을 수 없을 때 오류를 발생시키는 대신 기본값을 사용할지 여부.                           | `0`   |
| `input_format_avro_null_as_default`       | 비Nullable 컬럼에 `null` 값을 삽입할 때 오류를 발생시키는 대신 기본값을 사용할지 여부.                      | `0`   |
| `output_format_avro_codec`                | Avro 출력 파일의 압축 알고리즘. 가능한 값: `null`, `deflate`, `snappy`, `zstd`.                        |       |
| `output_format_avro_sync_interval`        | Avro 파일의 동기화 마커 빈도 (바이트 단위).                                                            | `16384` |
| `output_format_avro_string_column_pattern` | Avro 문자열 유형 매핑을 위한 `String` 컬럼을 식별하는 정규 표현식. 기본적으로 ClickHouse `String` 컬럼은 Avro `bytes` 유형으로 기록됩니다. |       |
| `output_format_avro_rows_in_file`         | Avro 출력 파일당 최대 행 수. 이 한도에 도달하면 새 파일이 생성됩니다 (저장 시스템에서 파일 분할을 지원하는 경우). | `1`   |

## 예제 {#examples}

### Avro 데이터 읽기 {#reading-avro-data}

ClickHouse 테이블로 Avro 파일에서 데이터를 읽으려면:

```bash
$ cat file.avro | clickhouse-client --query="INSERT INTO {some_table} FORMAT Avro"
```

수집된 Avro 파일의 루트 스키마는 `record` 유형이어야 합니다.

ClickHouse는 테이블 컬럼과 Avro 스키마의 필드 간의 대응 관계를 확인하기 위해 이름을 비교합니다. 
이 비교는 대소문자를 구분하며 사용되지 않는 필드는 건너뜁니다.

ClickHouse 테이블 컬럼의 데이터 유형은 삽입된 Avro 데이터의 해당 필드와 다를 수 있습니다. 데이터를 삽입할 때 ClickHouse는 위에 있는 표에 따라 데이터 유형을 해석한 후 [형변환](/sql-reference/functions/type-conversion-functions#cast)을 수행하여 해당 컬럼 유형으로 데이터를 변환합니다.

데이터를 가져올 때, 스키마에서 필드를 찾을 수 없고 [`input_format_avro_allow_missing_fields`](/operations/settings/settings-formats.md/#input_format_avro_allow_missing_fields) 설정이 활성화된 경우, 오류를 발생시키는 대신 기본값이 사용됩니다.

### Avro 데이터 쓰기 {#writing-avro-data}

ClickHouse 테이블에서 Avro 파일로 데이터를 쓰려면:

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Avro" > file.avro
```

컬럼 이름은 다음을 만족해야 합니다:

- `[A-Za-z_]`로 시작해야 함
- 이후는 오직 `[A-Za-z0-9_]`만 가능

Avro 파일의 출력 압축 및 동기화 간격은 각각 [`output_format_avro_codec`](/operations/settings/settings-formats.md/#output_format_avro_codec) 및 [`output_format_avro_sync_interval`](/operations/settings/settings-formats.md/#output_format_avro_sync_interval) 설정을 사용하여 구성할 수 있습니다.

### Avro 스키마 추론 {#inferring-the-avro-schema}

ClickHouse에서 [`DESCRIBE`](/sql-reference/statements/describe-table) 함수를 사용하면 Avro 파일의 추론된 형식을 빠르게 볼 수 있습니다. 
이 예제에는 ClickHouse S3 공개 버킷에 있는 공개 접근 가능한 Avro 파일의 URL이 포함됩니다:

```sql
DESCRIBE url('https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/hits.avro','Avro);

┌─name───────────────────────┬─type────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ WatchID                    │ Int64           │              │                    │         │                  │                │
│ JavaEnable                 │ Int32           │              │                    │         │                  │                │
│ Title                      │ String          │              │                    │         │                  │                │
│ GoodEvent                  │ Int32           │              │                    │         │                  │                │
│ EventTime                  │ Int32           │              │                    │         │                  │                │
│ EventDate                  │ Date32          │              │                    │         │                  │                │
│ CounterID                  │ Int32           │              │                    │         │                  │                │
│ ClientIP                   │ Int32           │              │                    │         │                  │                │
│ ClientIP6                  │ FixedString(16) │              │                    │         │                  │                │
│ RegionID                   │ Int32           │              │                    │         │                  │                │
...
│ IslandID                   │ FixedString(16) │              │                    │         │                  │                │
│ RequestNum                 │ Int32           │              │                    │         │                  │                │
│ RequestTry                 │ Int32           │              │                    │         │                  │                │
└────────────────────────────┴─────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
