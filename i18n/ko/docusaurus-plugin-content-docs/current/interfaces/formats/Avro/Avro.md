---
alias: []
description: 'Avro 형식에 대한 문서'
input_format: true
keywords: ['Avro']
output_format: true
slug: /interfaces/formats/Avro
title: 'Avro'
doc_type: 'reference'
---

import DataTypeMapping from './_snippets/data-types-matching.md'

| 입력 | 출력 | 별칭 |
| -- | -- | -- |
| ✔  | ✔  |    |


## 설명 \{#description\}

[Apache Avro](https://avro.apache.org/)는 효율적인 데이터 처리를 위해 이진 인코딩을 사용하는 행 지향 직렬화 형식입니다. `Avro` 형식은 [Avro data files](https://avro.apache.org/docs/++version++/specification/#object-container-files)의 읽기 및 쓰기를 지원합니다. 이 형식은 스키마가 포함된 자기 기술(self-describing) 메시지를 사용하도록 되어 있습니다. Avro를 스키마 레지스트리와 함께 사용하는 경우 [`AvroConfluent`](./AvroConfluent.md) 형식을 참조하십시오.

## 데이터 유형 매핑 \{#data-type-mapping\}

<DataTypeMapping/>

## 형식 설정 \{#format-settings\}

| 설정                                        | 설명                                                                                               | 기본값  |
|---------------------------------------------|-----------------------------------------------------------------------------------------------------|---------|
| `input_format_avro_allow_missing_fields`    | 스키마에서 해당 필드를 찾을 수 없을 때 오류를 발생시키는 대신 기본값을 사용할지 여부입니다. | `0`     |
| `input_format_avro_null_as_default`         | 널 허용되지 않는 컬럼에 `null` 값을 삽입할 때 오류를 발생시키는 대신 기본값을 사용할지 여부입니다. |   `0`   |
| `output_format_avro_codec`                  | Avro 출력 파일에 사용할 압축 알고리즘입니다. 가능한 값: `null`, `deflate`, `snappy`, `zstd`.            |         |
| `output_format_avro_sync_interval`          | Avro 파일에서 동기화 마커가 나타나는 빈도(바이트 단위)입니다. | `16384` |
| `output_format_avro_string_column_pattern`  | Avro string 타입 매핑을 위해 `String` 컬럼을 식별하는 정규식입니다. 기본적으로 ClickHouse의 `String` 컬럼은 Avro의 `bytes` 타입으로 기록됩니다.                                 |         |
| `output_format_avro_rows_in_file`           | Avro 출력 파일당 최대 행 수입니다. 이 한도에 도달하면(스토리지 시스템이 파일 분할을 지원하는 경우) 새 파일이 생성됩니다.                                                         | `1`     |

## 예시 \{#examples\}

### Avro 데이터 읽기 \{#reading-avro-data\}

Avro 파일의 데이터를 ClickHouse 테이블로 읽어오려면 다음과 같이 합니다:

```bash
$ cat file.avro | clickhouse-client --query="INSERT INTO {some_table} FORMAT Avro"
```

수집된 Avro 파일의 루트 스키마는 `record` 타입이어야 합니다.

테이블 컬럼과 Avro 스키마 필드 간의 매핑을 찾기 위해 ClickHouse는 이름을 비교합니다.
이 비교는 대소문자를 구분하며, 사용되지 않는 필드는 건너뜁니다.

ClickHouse 테이블 컬럼의 데이터 타입은 삽입되는 Avro 데이터의 해당 필드 타입과 다를 수 있습니다. 데이터를 삽입할 때 ClickHouse는 위 표에 따라 데이터 타입을 해석한 후, 데이터를 해당 컬럼 타입으로 [캐스팅](/sql-reference/functions/type-conversion-functions#CAST)합니다.

데이터를 가져올 때 스키마에서 필드를 찾을 수 없고 [`input_format_avro_allow_missing_fields`](/operations/settings/settings-formats.md/#input_format_avro_allow_missing_fields) 설정이 활성화되어 있는 경우, 오류를 발생시키는 대신 기본값이 사용됩니다.


### Avro 데이터 쓰기 \{#writing-avro-data\}

ClickHouse 테이블의 데이터를 Avro 파일로 작성하려면 다음을 수행합니다:

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Avro" > file.avro
```

컬럼 이름은 다음 조건을 만족해야 합니다:

* `[A-Za-z_]`로 시작해야 합니다.
* 이어지는 문자는 `[A-Za-z0-9_]`만 사용할 수 있습니다.

Avro 파일의 출력 압축 방식과 동기화(sync) 간격은 각각 [`output_format_avro_codec`](/operations/settings/settings-formats.md/#output_format_avro_codec) 및 [`output_format_avro_sync_interval`](/operations/settings/settings-formats.md/#output_format_avro_sync_interval) 설정을 사용하여 구성할 수 있습니다.


### Avro 스키마 추론 \{#inferring-the-avro-schema\}

ClickHouse [`DESCRIBE`](/sql-reference/statements/describe-table) 함수를 사용하면 다음 예와 같이 Avro 파일의 추론된 포맷을 빠르게 확인할 수 있습니다.
이 예에는 ClickHouse S3 공개 버킷에 공개 접근이 가능한 Avro 파일의 URL이 포함되어 있습니다:

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
