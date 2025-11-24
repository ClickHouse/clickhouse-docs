---
'sidebar_label': '마이그레이션 가이드'
'slug': '/migrations/snowflake'
'description': 'Snowflake에서 ClickHouse로 마이그레이션'
'keywords':
- 'Snowflake'
'title': 'Snowflake에서 ClickHouse로 마이그레이션'
'show_related_blogs': false
'doc_type': 'guide'
---

import migrate_snowflake_clickhouse from '@site/static/images/migrations/migrate_snowflake_clickhouse.png';
import Image from '@theme/IdealImage';


# Snowflake에서 ClickHouse로 마이그레이션하기

> 이 가이드는 Snowflake에서 ClickHouse로 데이터를 마이그레이션하는 방법을 보여줍니다.

Snowflake와 ClickHouse 간의 데이터 마이그레이션은 S3와 같은 객체 저장소를 전송을 위한 중간 저장소로 사용해야 합니다. 마이그레이션 프로세스는 Snowflake의 `COPY INTO` 명령과 ClickHouse의 `INSERT INTO SELECT` 명령을 사용합니다.

<VerticalStepper headerLevel="h2">

## Snowflake에서 데이터 내보내기 {#1-exporting-data-from-snowflake}

<Image img={migrate_snowflake_clickhouse} size="md" alt="Snowflake에서 ClickHouse로 마이그레이션"/>

Snowflake에서 데이터를 내보내려면 외부 스테이지를 사용해야 하며, 이는 위의 다이어그램에 나와 있습니다.

다음 스키마를 가진 Snowflake 테이블을 내보낸다고 가정해 보겠습니다:

```sql
CREATE TABLE MYDATASET (
   timestamp TIMESTAMP,
   some_text varchar,
   some_file OBJECT,
   complex_data VARIANT,
) DATA_RETENTION_TIME_IN_DAYS = 0;
```

이 테이블의 데이터를 ClickHouse 데이터베이스로 이동하려면 먼저 이 데이터를 외부 스테이지에 복사해야 합니다. 데이터를 복사할 때는 Parquet를 중간 형식으로 추천하며, 이는 타입 정보를 공유하고, 정밀도를 유지하며, 잘 압축되고, 분석에서 일반적으로 사용되는 중첩 구조를 기본적으로 지원합니다.

아래 예에서 우리는 Snowflake에서 Parquet를 나타내고 원하는 파일 옵션을 가진 이름이 지정된 파일 형식을 생성합니다. 그런 다음 복사된 데이터셋이 포함될 버킷을 지정합니다. 마지막으로 데이터셋을 버킷에 복사합니다.

```sql
CREATE FILE FORMAT my_parquet_format TYPE = parquet;

-- Create the external stage that specifies the S3 bucket to copy into
CREATE OR REPLACE STAGE external_stage
URL='s3://mybucket/mydataset'
CREDENTIALS=(AWS_KEY_ID='<key>' AWS_SECRET_KEY='<secret>')
FILE_FORMAT = my_parquet_format;

-- Apply "mydataset" prefix to all files and specify a max file size of 150mb
-- The `header=true` parameter is required to get column names
COPY INTO @external_stage/mydataset from mydataset max_file_size=157286400 header=true;
```

약 5TB의 데이터셋을 최대 파일 크기 150MB로 설정하고, 동일한 AWS `us-east-1` 지역에 위치한 2X-Large Snowflake 웨어하우스를 사용할 경우, S3 버킷으로 데이터를 복사하는 데 약 30분이 소요됩니다.

## ClickHouse로 가져오기 {#2-importing-to-clickhouse}

데이터가 중간 객체 저장소에 준비되면, ClickHouse의 [s3 테이블 함수](/sql-reference/table-functions/s3)를 사용하여 데이터를 테이블에 삽입할 수 있습니다. 아래와 같이 진행됩니다.

이 예시는 AWS S3용 [s3 테이블 함수](/sql-reference/table-functions/s3)를 사용하지만, Google Cloud Storage에는 [gcs 테이블 함수](/sql-reference/table-functions/gcs)를, Azure Blob Storage에는 [azureBlobStorage 테이블 함수](/sql-reference/table-functions/azureBlobStorage)를 사용할 수 있습니다.

다음과 같은 목표 테이블 스키마를 가정합니다:

```sql
CREATE TABLE default.mydataset
(
  `timestamp` DateTime64(6),
  `some_text` String,
  `some_file` Tuple(filename String, version String),
  `complex_data` Tuple(name String, description String),
)
ENGINE = MergeTree
ORDER BY (timestamp)
```

그런 다음 `INSERT INTO SELECT` 명령을 사용하여 S3에서 ClickHouse 테이블로 데이터를 삽입할 수 있습니다:

```sql
INSERT INTO mydataset
SELECT
  timestamp,
  some_text,
  JSONExtract(
    ifNull(some_file, '{}'),
    'Tuple(filename String, version String)'
  ) AS some_file,
  JSONExtract(
    ifNull(complex_data, '{}'),
    'Tuple(filename String, description String)'
  ) AS complex_data,
FROM s3('https://mybucket.s3.amazonaws.com/mydataset/mydataset*.parquet')
SETTINGS input_format_null_as_default = 1, -- Ensure columns are inserted as default if values are null
input_format_parquet_case_insensitive_column_matching = 1 -- Column matching between source data and target table should be case insensitive
```

:::note 중첩 컬럼 구조에 대한 주의
원래 Snowflake 테이블 스키마의 `VARIANT` 및 `OBJECT` 컬럼은 기본적으로 JSON 문자열로 출력되며, 이를 ClickHouse에 삽입할 때 강제로 형변환해야 합니다.

`some_file`과 같은 중첩 구조는 Snowflake에서 복사 시 JSON 문자열로 변환됩니다. 이 데이터를 가져오려면 ClickHouse에 삽입할 때 이러한 구조를 Tuple로 변환해야 하며, 위에서 설명한 [JSONExtract 함수](/sql-reference/functions/json-functions#JSONExtract)를 사용해야 합니다.
:::

## 성공적인 데이터 내보내기 테스트 {#3-testing-successful-data-export}

데이터가 올바르게 삽입되었는지 확인하려면 새 테이블에서 `SELECT` 쿼리를 실행하면 됩니다:

```sql
SELECT * FROM mydataset LIMIT 10;
```

</VerticalStepper>
