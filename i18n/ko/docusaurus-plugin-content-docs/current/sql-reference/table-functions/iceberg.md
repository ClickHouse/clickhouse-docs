---
description: 'Amazon S3, Azure, HDFS 또는 로컬 스토리지에 저장된 Apache Iceberg 테이블에 대해 읽기 전용 테이블과 유사한 인터페이스를 제공합니다.'
sidebar_label: 'iceberg'
sidebar_position: 90
slug: /sql-reference/table-functions/iceberg
title: 'iceberg'
doc_type: 'reference'
---

# iceberg Table Function \{#iceberg-table-function\}

Amazon S3, Azure, HDFS 또는 로컬에 저장된 Apache [Iceberg](https://iceberg.apache.org/) 테이블에 대해 읽기 전용 테이블형 인터페이스를 제공합니다.

## 구문 \{#syntax\}

```sql
icebergS3(url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method] [,extra_credentials])
icebergS3(named_collection[, option=value [,..]])

icebergAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
icebergAzure(named_collection[, option=value [,..]])

icebergHDFS(path_to_table, [,format] [,compression_method])
icebergHDFS(named_collection[, option=value [,..]])

icebergLocal(path_to_table, [,format] [,compression_method])
icebergLocal(named_collection[, option=value [,..]])
```


## Arguments \{#arguments\}

인수에 대한 설명은 각각 `s3`, `azureBlobStorage`, `HDFS`, `file` 테이블 함수의 인수 설명과 동일합니다.
`format`은 Iceberg 테이블에서 데이터 파일의 형식을 나타냅니다.

`icebergS3`의 경우, ClickHouse Cloud에서 역할 기반 액세스를 위한 `role_arn`을 전달하는 데 선택적 `extra_credentials` 매개변수를 사용할 수 있습니다. 구성 단계는 [Secure S3](/cloud/data-sources/secure-s3)를 참조하십시오.

### 반환 값 \{#returned-value\}

지정된 Iceberg 테이블의 데이터를 읽기 위한 지정된 구조의 테이블입니다.

### 예제 \{#example\}

```sql
SELECT * FROM icebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

:::important
ClickHouse는 현재 `icebergS3`, `icebergAzure`, `icebergHDFS`, `icebergLocal` 테이블 함수와 `IcebergS3`, `icebergAzure`, `IcebergHDFS`, `IcebergLocal` 테이블 엔진을 통해 Iceberg 포맷 v1 및 v2 데이터를 읽는 것을 지원합니다.
:::


## 명명된 컬렉션 정의 \{#defining-a-named-collection\}

URL과 자격 증명을 저장할 명명된 컬렉션을 구성하는 예시는 다음과 같습니다:

```xml
<clickhouse>
    <named_collections>
        <iceberg_conf>
            <url>http://test.s3.amazonaws.com/clickhouse-bucket/</url>
            <access_key_id>test<access_key_id>
            <secret_access_key>test</secret_access_key>
            <format>auto</format>
            <structure>auto</structure>
        </iceberg_conf>
    </named_collections>
</clickhouse>
```

```sql
SELECT * FROM icebergS3(iceberg_conf, filename = 'test_table')
DESCRIBE icebergS3(iceberg_conf, filename = 'test_table')
```


## 데이터 카탈로그 사용 \{#iceberg-writes-catalogs\}

Iceberg 테이블은 [REST Catalog](https://iceberg.apache.org/rest-catalog-spec/), [AWS Glue Data Catalog](https://docs.aws.amazon.com/prescriptive-guidance/latest/serverless-etl-aws-glue/aws-glue-data-catalog.html), [Unity Catalog](https://www.unitycatalog.io/) 등 다양한 데이터 카탈로그와 함께 사용할 수 있습니다.

:::important
카탈로그를 사용하는 경우 대부분의 사용자는 `DataLakeCatalog` 데이터베이스 엔진을 사용하여 카탈로그에 ClickHouse를 연결하고, 카탈로그에 등록된 테이블을 자동으로 탐색하도록 설정합니다. 이 데이터베이스 엔진을 사용하면 `IcebergS3` 테이블 엔진으로 개별 테이블을 일일이 수동 생성하지 않고도 테이블을 사용할 수 있습니다.
:::

데이터 카탈로그를 사용하려면 `IcebergS3` 테이블 엔진으로 테이블을 생성하고 필요한 설정을 지정합니다.

예를 들어, MinIO 스토리지와 REST Catalog를 함께 사용하는 경우:

```sql
CREATE TABLE `database_name.table_name`
ENGINE = IcebergS3(
  'http://minio:9000/warehouse-rest/table_name/',
  'minio_access_key',
  'minio_secret_key'
)
```

또는 S3와 함께 AWS Glue Data Catalog를 사용하는 경우:

```sql
CREATE TABLE `my_database.my_table`  
ENGINE = IcebergS3(
  's3://my-data-bucket/warehouse/my_database/my_table/',
  'aws_access_key',
  'aws_secret_key'
)
```

## 스키마 변경(Schema Evolution) \{#schema-evolution\}

현재 CH를 사용하여 시간이 지나면서 스키마가 변경된 iceberg 테이블을 읽을 수 있습니다. 컬럼이 추가되거나 제거되고 순서가 변경된 테이블을 읽는 것을 지원합니다. 값이 필수인 컬럼을 `NULL`을 허용하는 컬럼으로 변경하는 것도 가능합니다. 추가로, 단순 타입에 대해 허용되는 타입 캐스팅을 다음과 같이 지원합니다:  

* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S) where P' > P.

현재는 중첩 구조나 배열 및 맵 내부 요소의 타입을 변경하는 것은 불가능합니다.

## 파티션 프루닝 \{#partition-pruning\}

ClickHouse는 SELECT 쿼리에서 Iceberg 테이블에 대한 파티션 프루닝을 지원하여 관련 없는 데이터 파일을 건너뛰고 쿼리 성능을 최적화합니다. 파티션 프루닝을 활성화하려면 `use_iceberg_partition_pruning = 1`로 설정합니다. Iceberg 파티션 프루닝에 대한 자세한 내용은 https://iceberg.apache.org/spec/#partitioning을 참조하십시오.

## 타임 트래블 \{#time-travel\}

ClickHouse는 Iceberg 테이블에 대해 타임 트래블을 지원하여 특정 타임스탬프나 스냅샷 ID를 기준으로 과거 시점의 데이터를 쿼리할 수 있도록 합니다.

## 삭제된 행이 포함된 테이블 처리 \{#deleted-rows\}

현재는 [position deletes](https://iceberg.apache.org/spec/#position-delete-files)를 사용하는 Iceberg 테이블만 지원합니다. 

다음과 같은 삭제 방식은 **지원되지 않습니다**:

- [Equality deletes](https://iceberg.apache.org/spec/#equality-delete-files)
- [Deletion vectors](https://iceberg.apache.org/spec/#deletion-vectors) (v3에서 도입됨)

### 기본 사용법 \{#basic-usage\}

```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_timestamp_ms = 1714636800000
```

```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_snapshot_id = 3547395809148285433
```

참고: 하나의 쿼리에서 `iceberg_timestamp_ms`와 `iceberg_snapshot_id` 파라미터를 동시에 지정할 수 없습니다.


### 중요한 고려 사항 \{#important-considerations\}

* **스냅샷(Snapshot)**은 일반적으로 다음과 같은 경우에 생성됩니다:
* 테이블에 새 데이터가 기록될 때
* 어떤 형태로든 데이터 압축(compaction)이 수행될 때

* **스키마 변경으로는 일반적으로 스냅샷이 생성되지 않습니다** - 이는 스키마 변경이 발생한 테이블에서 시간 이동(time travel)을 사용할 때 중요한 동작상의 특성을 가져옵니다.

### 예시 시나리오 \{#example-scenarios\}

모든 시나리오는 ClickHouse가 아직 Iceberg 테이블에 쓰기를 지원하지 않기 때문에 Spark로 작성되어 있습니다.

#### 시나리오 1: 새 스냅샷 없이 스키마 변경 \{#scenario-1\}

다음과 같은 작업 순서를 가정합니다:

```sql
 -- Create a table with two columns
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

- - Insert data into the table
  INSERT INTO spark_catalog.db.time_travel_example VALUES 
    (1, 'Mars')

  ts1 = now() // A piece of pseudo code

- - Alter table to add a new column
  ALTER TABLE spark_catalog.db.time_travel_example ADD COLUMN (price double)
 
  ts2 = now()

- - Insert data into the table
  INSERT INTO spark_catalog.db.time_travel_example VALUES (2, 'Venus', 100)

   ts3 = now()

- - Query the table at each timestamp
  SELECT * FROM spark_catalog.db.time_travel_example TIMESTAMP AS OF ts1;

+------------+------------+
|order_number|product_code|
+------------+------------+
|           1|        Mars|
+------------+------------+
  SELECT * FROM spark_catalog.db.time_travel_example TIMESTAMP AS OF ts2;

+------------+------------+
|order_number|product_code|
+------------+------------+
|           1|        Mars|
+------------+------------+

  SELECT * FROM spark_catalog.db.time_travel_example TIMESTAMP AS OF ts3;

+------------+------------+-----+
|order_number|product_code|price|
+------------+------------+-----+
|           1|        Mars| NULL|
|           2|       Venus|100.0|
+------------+------------+-----+
```

서로 다른 타임스탬프에서의 쿼리 결과:

* ts1 및 ts2 시점: 원래의 두 개 컬럼만 표시됩니다
* ts3 시점: 세 개 컬럼이 모두 표시되며, 첫 번째 행의 price 값은 NULL입니다


#### 시나리오 2: 과거 스키마와 현재 스키마 차이 \{#scenario-2\}

현재 시점에 실행하는 타임 트래블 쿼리는 현재 테이블과는 다른 스키마를 보여줄 수 있습니다:

```sql
-- Create a table
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_2 (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

-- Insert initial data into the table
  INSERT INTO spark_catalog.db.time_travel_example_2 VALUES (2, 'Venus');

-- Alter table to add a new column
  ALTER TABLE spark_catalog.db.time_travel_example_2 ADD COLUMN (price double);

  ts = now();

-- Query the table at a current moment but using timestamp syntax

  SELECT * FROM spark_catalog.db.time_travel_example_2 TIMESTAMP AS OF ts;

    +------------+------------+
    |order_number|product_code|
    +------------+------------+
    |           2|       Venus|
    +------------+------------+

-- Query the table at a current moment
  SELECT * FROM spark_catalog.db.time_travel_example_2;
    +------------+------------+-----+
    |order_number|product_code|price|
    +------------+------------+-----+
    |           2|       Venus| NULL|
    +------------+------------+-----+
```

이러한 현상은 `ALTER TABLE`이 새로운 스냅샷을 생성하지 않고, 현재 테이블에 대해서는 Spark가 스냅샷이 아니라 최신 메타데이터 파일에서 `schema_id` 값을 읽어오기 때문입니다.


#### 시나리오 3: 과거 스키마와 현재 스키마 간 차이 \{#scenario-3\}

둘째, time travel을 수행하더라도 테이블에 어떤 데이터도 기록되기 전 시점의 상태는 조회할 수 없습니다:

```sql
-- Create a table
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2');

  ts = now();

-- Query the table at a specific timestamp
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- Finises with error: Cannot find a snapshot older than ts.
```

ClickHouse의 동작은 Spark와 동일합니다. Spark SELECT 쿼리를 ClickHouse SELECT 쿼리로 생각해도 동일하게 동작합니다.


## Metadata File Resolution \{#metadata-file-resolution\}

ClickHouse에서 `iceberg` table function을 사용할 때, 시스템은 Iceberg 테이블 구조를 정의하는 적절한 metadata.json 파일을 찾아야 합니다. 이 메타데이터 파일을 찾는 절차는 다음과 같습니다.

### 후보 검색(우선순위 기준) \{#candidate-search\}

1. **직접 경로 지정**:
*`iceberg_metadata_file_path`을(를) 설정하면, 시스템은 이 값을 Iceberg 테이블 디렉터리 경로와 결합하여 해당 경로 그대로 사용합니다.

* 이 설정이 지정된 경우, 다른 모든 메타데이터 해석(결정) 관련 설정은 무시됩니다.

2. **테이블 UUID 일치**:
*`iceberg_metadata_table_uuid`가 지정된 경우, 시스템은 다음을 수행합니다:
    * `metadata` 디렉터리의 `.metadata.json` 파일만 확인합니다
    * 지정한 UUID와 일치하는 `table-uuid` 필드를 포함하는 파일만 필터링합니다(대소문자 구분 없음)

3. **기본 검색**:
*위의 두 설정이 모두 지정되지 않은 경우, `metadata` 디렉터리의 모든 `.metadata.json` 파일이 후보가 됩니다

### 가장 최근 파일 선택 \{#most-recent-file\}

위 규칙을 사용해 후보 파일을 식별한 후, 시스템은 다음 기준으로 어떤 파일이 가장 최근인지 결정합니다:

* `iceberg_recent_metadata_file_by_last_updated_ms_field`가 활성화된 경우:

* `last-updated-ms` 값이 가장 큰 파일이 선택됩니다

* 그렇지 않은 경우:

* 버전 번호가 가장 높은 파일이 선택됩니다

* (버전은 `V.metadata.json` 또는 `V-uuid.metadata.json` 형식의 파일 이름에서 `V`로 표시됩니다)

**참고**: 언급된 모든 설정은 테이블 함수 설정(전역 설정이나 쿼리 수준 설정이 아님)이며, 아래와 같이 지정해야 합니다:

```sql
SELECT * FROM iceberg('s3://bucket/path/to/iceberg_table', 
    SETTINGS iceberg_metadata_table_uuid = 'a90eed4c-f74b-4e5b-b630-096fb9d09021');
```

**참고**: 일반적으로 Iceberg Catalog는 메타데이터 해석을 처리하지만, ClickHouse의 `iceberg` 테이블 함수는 S3에 저장된 파일을 Iceberg 테이블로 직접 해석합니다. 이런 이유로 이러한 해석 규칙을 이해하는 것이 중요합니다.


## 메타데이터 캐시 \{#metadata-cache\}

`Iceberg` 테이블 엔진과 테이블 함수는 매니페스트 파일, 매니페스트 목록, 메타데이터 JSON 정보를 저장하는 메타데이터 캐시를 지원합니다. 메타데이터 캐시는 메모리에 저장됩니다. 이 기능은 기본적으로 활성화되어 있는 `use_iceberg_metadata_files_cache` 설정으로 제어됩니다.

## 별칭 \{#aliases\}

테이블 함수 `iceberg`는 이제 `icebergS3`의 별칭입니다.

## 가상 컬럼 \{#virtual-columns\}

- `_path` — 파일 경로입니다. 형식: `LowCardinality(String)`.
- `_file` — 파일 이름입니다. 형식: `LowCardinality(String)`.
- `_size` — 파일 크기(바이트 단위)입니다. 형식: `Nullable(UInt64)`. 파일 크기를 알 수 없는 경우 값은 `NULL`입니다.
- `_time` — 파일의 마지막 수정 시각입니다. 형식: `Nullable(DateTime)`. 시각을 알 수 없는 경우 값은 `NULL`입니다.
- `_etag` — 파일의 ETag입니다. 형식: `LowCardinality(String)`. ETag를 알 수 없는 경우 값은 `NULL`입니다.

## iceberg 테이블에 쓰기 \{#writes-into-iceberg-table\}

버전 25.7부터 ClickHouse에서는 사용자 Iceberg 테이블에 대한 수정 작업을 지원합니다.

현재 이 기능은 실험적 기능이므로, 먼저 다음과 같이 활성화해야 합니다:

```sql
SET allow_insert_into_iceberg = 1;
```


### 테이블 생성 \{#create-iceberg-table\}

비어 있는 Iceberg 테이블을 생성하려면 읽기와 동일한 명령을 사용하되 스키마를 명시적으로 지정하면 됩니다.
쓰기 작업은 Iceberg 사양에서 정의된 모든 데이터 포맷(Parquet, Avro, ORC 등)을 지원합니다.

### 예제 \{#example-iceberg-writes-create\}

```sql
CREATE TABLE iceberg_writes_example
(
    x Nullable(String),
    y Nullable(Int32)
)
ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/')
```

참고: 버전 힌트 파일을 생성하려면 `iceberg_use_version_hint` 설정을 활성화하십시오.
metadata.json 파일을 압축하려면 `iceberg_metadata_compression_method` 설정에서 코덱 이름을 지정하십시오.


### INSERT \{#writes-inserts\}

새 테이블을 생성한 후, 일반적인 ClickHouse 구문을 사용해 데이터를 삽입할 수 있습니다.

### 예제 \{#example-iceberg-writes-insert\}

```sql
INSERT INTO iceberg_writes_example VALUES ('Pavel', 777), ('Ivanov', 993);

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Row 1:
──────
x: Pavel
y: 777

Row 2:
──────
x: Ivanov
y: 993
```


### DELETE \{#iceberg-writes-delete\}

merge-on-read 형식에서 불필요한 행 삭제도 ClickHouse에서 지원합니다.
이 쿼리는 position delete 파일이 포함된 새로운 스냅샷을 생성합니다.

NOTE: 향후 다른 Iceberg 엔진(Spark 등)으로 테이블을 읽으려면 `output_format_parquet_use_custom_encoder` 및 `output_format_parquet_parallel_encoding` 설정을 비활성화해야 합니다.
이는 Spark가 이러한 파일을 Parquet 필드 ID(field-id)를 기준으로 읽는 반면, ClickHouse는 해당 플래그가 활성화된 경우 현재 필드 ID 쓰기를 지원하지 않기 때문입니다.
향후 이 동작은 수정될 예정입니다.

### 예제 \{#example-iceberg-writes-delete\}

```sql
ALTER TABLE iceberg_writes_example DELETE WHERE x != 'Ivanov';

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Row 1:
──────
x: Ivanov
y: 993
```


### 스키마 변경 \{#iceberg-writes-schema-evolution\}

ClickHouse에서는 단순 타입(튜플, 배열, 맵이 아닌 타입)을 사용하는 컬럼을 추가, 삭제 또는 수정하거나 이름을 변경할 수 있습니다.

### 예제 \{#example-iceberg-writes-evolution\}

```sql
ALTER TABLE iceberg_writes_example MODIFY COLUMN y Nullable(Int64);
SHOW CREATE TABLE iceberg_writes_example;

   ┌─statement─────────────────────────────────────────────────┐
1. │ CREATE TABLE default.iceberg_writes_example              ↴│
   │↳(                                                        ↴│
   │↳    `x` Nullable(String),                                ↴│
   │↳    `y` Nullable(Int64)                                  ↴│
   │↳)                                                        ↴│
   │↳ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/') │
   └───────────────────────────────────────────────────────────┘

ALTER TABLE iceberg_writes_example ADD COLUMN z Nullable(Int32);
SHOW CREATE TABLE iceberg_writes_example;

   ┌─statement─────────────────────────────────────────────────┐
1. │ CREATE TABLE default.iceberg_writes_example              ↴│
   │↳(                                                        ↴│
   │↳    `x` Nullable(String),                                ↴│
   │↳    `y` Nullable(Int64),                                 ↴│
   │↳    `z` Nullable(Int32)                                  ↴│
   │↳)                                                        ↴│
   │↳ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/') │
   └───────────────────────────────────────────────────────────┘

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Row 1:
──────
x: Ivanov
y: 993
z: ᴺᵁᴸᴸ

ALTER TABLE iceberg_writes_example DROP COLUMN z;
SHOW CREATE TABLE iceberg_writes_example;
   ┌─statement─────────────────────────────────────────────────┐
1. │ CREATE TABLE default.iceberg_writes_example              ↴│
   │↳(                                                        ↴│
   │↳    `x` Nullable(String),                                ↴│
   │↳    `y` Nullable(Int64)                                  ↴│
   │↳)                                                        ↴│
   │↳ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/') │
   └───────────────────────────────────────────────────────────┘

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Row 1:
──────
x: Ivanov
y: 993

ALTER TABLE iceberg_writes_example RENAME COLUMN y TO value;
SHOW CREATE TABLE iceberg_writes_example;

   ┌─statement─────────────────────────────────────────────────┐
1. │ CREATE TABLE default.iceberg_writes_example              ↴│
   │↳(                                                        ↴│
   │↳    `x` Nullable(String),                                ↴│
   │↳    `value` Nullable(Int64)                              ↴│
   │↳)                                                        ↴│
   │↳ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/') │
   └───────────────────────────────────────────────────────────┘

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Row 1:
──────
x: Ivanov
value: 993
```


### 압축(Compaction) \{#iceberg-writes-compaction\}

ClickHouse는 Iceberg 테이블용 컴팩션(compaction)을 지원합니다. 현재는 메타데이터를 업데이트하면서 position delete 파일을 데이터 파일로 병합할 수 있습니다. 이전 스냅샷 ID와 타임스탬프는 변경되지 않으므로, 동일한 값으로 time-travel 기능을 계속 사용할 수 있습니다.

사용 방법:

```sql
SET allow_experimental_iceberg_compaction = 1

OPTIMIZE TABLE iceberg_writes_example;

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Row 1:
──────
x: Ivanov
y: 993
```


### 스냅샷 만료 \{#iceberg-expire-snapshots\}

Iceberg 테이블은 각 INSERT, DELETE 또는 UPDATE 작업이 수행될 때마다 스냅샷을 누적합니다. 시간이 지나면 많은 수의 스냅샷과 관련 데이터 파일이 쌓일 수 있습니다. `expire_snapshots` 명령은 오래된 스냅샷을 제거하고, 유지된 스냅샷 중 어느 것에서도 더 이상 참조되지 않는 데이터 파일을 정리합니다.

**구문:**

```sql
ALTER TABLE iceberg_table EXECUTE expire_snapshots(
    ['timestamp']
    [, expire_before = 'timestamp']
    [, retention_period = '3d']
    [, retain_last = 100]
    [, snapshot_ids = [1, 2, 3, 4]]
    [, dry_run = 1]
);
```

기본적으로 유지할 스냅샷은 [보존 정책](#iceberg-snapshot-retention-policy)(테이블 속성 `min-snapshots-to-keep`, `max-snapshot-age-ms` 및 ref별 재정의)에 따라 결정됩니다. `snapshot_ids`를 지정하면 보존 정책을 우회하며, 나열된 스냅샷만 만료 대상으로 고려됩니다.

**인수:**

* `'timestamp'` (위치 인수) 또는 `expire_before = 'timestamp'` — **서버의 타임존**으로 해석되는 datetime 문자열입니다(예: `'2024-06-01 00:00:00'`). 안전장치 역할을 합니다. `timestamp-ms`가 이 값과 같거나 이후인 스냅샷은 보존 정책에 따라 원래 만료 대상이더라도 만료되지 않도록 보호됩니다. `snapshot_ids`와 함께 사용할 수 있으며, 이 경우 목록에 있는 스냅샷 중 timestamp와 같거나 더 최신인 항목은 만료되지 않습니다.
* `retention_period = '<duration>'` — 이번 호출에만 테이블 수준의 `history.expire.max-snapshot-age-ms`를 재정의합니다. 이 기간보다 오래된 스냅샷(현재 시점을 기준으로 계산)이 만료 후보가 됩니다. 값은 하나 이상의 `{number}{unit}` 쌍을 이어 붙인 duration 문자열입니다. 지원되는 단위: `y` (365일), `w` (7일), `d` (24시간), `h` (60분), `m` (60초), `s` (1초), `ms` (1밀리초). 단위는 조합할 수 있으며, 예: `'3d'`, `'12h'`, `'1d12h30m'`, `'500ms'`.
* `retain_last = N` — 이번 호출에만 테이블 수준의 `history.expire.min-snapshots-to-keep`를 재정의합니다. 기간과 관계없이 최소 `N`개의 스냅샷은 항상 유지됩니다.
* `snapshot_ids = [id1, id2, ...]` — 나열된 스냅샷 ID만 정확히 만료합니다(현재 스냅샷, 브랜치 또는 태그가 참조하는 스냅샷은 제외). 이 모드는 보존 정책을 완전히 우회하며 `retention_period` 또는 `retain_last`와 함께 사용할 수 없습니다.
* `dry_run = 1` — 무엇이 만료될지를 계산하고, 새 메타데이터를 기록하거나 파일을 삭제하지 않은 상태로 메트릭을 반환합니다.

:::note
`retention_period` 및 `retain_last`는 **테이블 수준의** 기본 보존 설정만 재정의합니다. Iceberg 테이블 속성에 구성된 ref별(브랜치/태그) 보존 재정의(예: `refs.<branch>.min-snapshots-to-keep`)는 절대 재정의되지 않으며, 항상 테이블 메타데이터에 지정된 대로 적용됩니다.
:::

**예시:**

```sql
SET allow_insert_into_iceberg = 1;

-- Create some snapshots by inserting data
INSERT INTO iceberg_table VALUES (1);
INSERT INTO iceberg_table VALUES (2);
INSERT INTO iceberg_table VALUES (3);

-- Expire using retention policy only
ALTER TABLE iceberg_table EXECUTE expire_snapshots();

-- Expire with a safety fuse: protect snapshots newer than the timestamp (positional syntax)
ALTER TABLE iceberg_table EXECUTE expire_snapshots('2025-01-01 00:00:00');

-- Same using the named argument form
ALTER TABLE iceberg_table EXECUTE expire_snapshots(expire_before = '2025-01-01 00:00:00');

-- Override retention parameters for one execution
ALTER TABLE iceberg_table EXECUTE expire_snapshots(retention_period = '3d', retain_last = 10);

-- Expire explicit snapshots
ALTER TABLE iceberg_table EXECUTE expire_snapshots(snapshot_ids = [101, 102, 103]);

-- Dry-run preview (no metadata updates, no file deletes)
ALTER TABLE iceberg_table EXECUTE expire_snapshots(retention_period = '1d', dry_run = 1);
```

**출력:**

이 명령은 두 개의 컬럼(`metric_name String`, `metric_value Int64`)으로 구성된 테이블을 반환하며, 각 메트릭마다 1개의 행이 포함됩니다. 메트릭 이름은 [Iceberg 사양](https://iceberg.apache.org/docs/latest/spark-procedures/#output)을 따릅니다.


| metric&#95;name                       | 설명                            |
| ------------------------------------- | ----------------------------- |
| `deleted_data_files_count`            | 삭제된 데이터 파일 수                  |
| `deleted_position_delete_files_count` | 삭제된 position delete 파일 수      |
| `deleted_equality_delete_files_count` | 삭제된 equality delete 파일 수      |
| `deleted_manifest_files_count`        | 삭제된 매니페스트 파일 수                |
| `deleted_manifest_lists_count`        | 삭제된 매니페스트 목록 파일 수             |
| `deleted_statistics_files_count`      | 삭제된 통계 파일 수(현재는 항상 0)         |
| `dry_run`                             | 드라이 런 모드에서는 `1`, 일반 실행에서는 `0` |

이 명령은 다음 단계를 수행합니다:

1. 보존 정책(아래 참조)을 평가하여 보존해야 하는 스냅샷을 결정합니다
2. 타임스탬프 인수가 제공된 경우 해당 타임스탬프와 같거나 그 이후의 모든 스냅샷도 추가로 보호합니다
3. 정책에 따라 보존되지 않고 타임스탬프 안전장치로도 보호되지 않는 스냅샷을 만료시킵니다
4. 만료된 스냅샷에만 연결된 파일을 계산합니다
5. 일반 모드에서는 만료된 스냅샷을 제외한 새 메타데이터를 생성합니다
6. 일반 모드에서는 더 이상 참조할 수 없는 매니페스트 목록, 매니페스트 파일, 데이터 파일을 물리적으로 삭제합니다
7. `dry_run = 1` 모드에서는 5단계와 6단계를 건너뛰고 계산된 메트릭만 반환합니다

#### 스냅샷 보존 정책 \{#iceberg-snapshot-retention-policy\}

`expire_snapshots` 명령은 [Iceberg 스냅샷 보존 정책](https://iceberg.apache.org/spec/#snapshot-retention-policy)을 따릅니다. 보존 설정은 Iceberg 테이블 속성과 참조별 재정의 설정을 통해 구성됩니다.

| Property                               | Scope | Default                                                                    | Description                                   |
| -------------------------------------- | ----- | -------------------------------------------------------------------------- | --------------------------------------------- |
| `history.expire.min-snapshots-to-keep` | Table | `iceberg_expire_default_min_snapshots_to_keep` (default `1`)               | 각 브랜치의 조상 체인에서 유지할 스냅샷의 최소 개수                 |
| `history.expire.max-snapshot-age-ms`   | Table | `iceberg_expire_default_max_snapshot_age_ms` (default `432000000`, 5 days) | 브랜치에서 유지할 스냅샷의 최대 보존 기간(ms)                   |
| `history.expire.max-ref-age-ms`        | Table | `iceberg_expire_default_max_ref_age_ms` (default `∞`)                      | 스냅샷 참조(브랜치 또는 태그) 자체가 제거되기 전까지 허용되는 최대 기간(ms) |

각 스냅샷 참조(Iceberg 메타데이터의 `refs`)는 참조별 필드인 `min-snapshots-to-keep`, `max-snapshot-age-ms`, `max-ref-age-ms`를 사용해 이 설정을 재정의할 수 있습니다.

**보존 평가:**

* **각 브랜치**(`main` 포함): 브랜치 헤드부터 시작해 조상 체인을 따라 검사합니다. 다음 조건 중 하나라도 참이면 스냅샷이 유지됩니다.
  * 해당 스냅샷이 체인에서 처음 `min-snapshots-to-keep`개에 포함됩니다
  * 해당 스냅샷의 생성 시점이 `max-snapshot-age-ms` 이내입니다(즉, `now - timestamp-ms <= max-snapshot-age-ms`)
* **태그**: 태그가 가리키는 스냅샷은 태그의 `max-ref-age-ms`를 초과하지 않는 한 유지되며, 초과하면 태그 참조가 제거됩니다
* **`main`이 아닌 참조** 중 사용 기간이 `max-ref-age-ms`를 초과한 것은 완전히 제거됩니다(`main` 브랜치는 제거되지 않음)
* 존재하지 않는 스냅샷을 가리키는 **dangling 참조**는 경고와 함께 제거됩니다
* **현재 스냅샷은 항상 유지**되며, 보존 설정과 관계없습니다

**필수 권한:**

`ALTER TABLE EXECUTE` 권한이 필요합니다. 이 권한은 ClickHouse 접근 제어 계층에서 `ALTER TABLE`의 하위 권한입니다. 이 권한만 별도로 부여하거나 상위 권한을 통해 부여할 수 있습니다.

```sql
-- Grant only EXECUTE permission
GRANT ALTER TABLE EXECUTE ON my_iceberg_table TO my_user;

-- Or grant all ALTER TABLE permissions (includes ALTER TABLE EXECUTE)
GRANT ALTER TABLE ON my_iceberg_table TO my_user;
```

:::note

* Iceberg 형식 버전 2 테이블만 지원됩니다(v1 스냅샷은 정리 시 파일을 안전하게 식별하는 데 필요한 `manifest-list`를 보장하지 않기 때문입니다)
* 현재 스냅샷은 지정된 타임스탬프보다 오래된 경우에도 항상 유지됩니다
* `allow_insert_into_iceberg` 설정을 활성화해야 합니다
* `allow_experimental_expire_snapshots` 설정을 활성화해야 합니다
* ClickHouse가 메타데이터를 업데이트할 때는 카탈로그 자체의 인증/권한 부여(REST catalog auth, AWS Glue IAM 등)가 별도로 적용됩니다
  :::


### 고아 파일 제거 \{#iceberg-remove-orphan-files\}

고아 파일은 Iceberg 테이블 메타데이터의 어떤 스냅샷에서도 참조되지 않는 스토리지 내 파일입니다. 이러한 파일은 쓰기 실패, 컴팩션 이후의 불완전한 정리, 중단된 작업으로 인해 누적되며 스토리지 사용량이 제한 없이 증가하는 원인이 됩니다. `remove_orphan_files` 명령어는 이러한 고아 파일을 식별하여 제거합니다.

**구문:**

```sql
-- Positional form: single unnamed older_than argument
ALTER TABLE iceberg_table EXECUTE remove_orphan_files('timestamp')

-- Named form
ALTER TABLE iceberg_table EXECUTE remove_orphan_files(
    older_than = 'timestamp',
    location = 'path',
    dry_run = 0|1
)

-- No arguments: use all defaults (older_than = 3 days ago)
ALTER TABLE iceberg_table EXECUTE remove_orphan_files()
```

**매개변수:**

| 매개변수         | 유형               | 기본값                                                     | 설명                                                                                  |
| ------------ | ---------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `older_than` | `String` (타임스탬프) | 3일 전 (`iceberg_orphan_files_older_than_seconds`로 설정 가능) | 마지막 수정 시간이 이 타임스탬프보다 이전인 파일만 고아 파일 후보로 간주합니다. 진행 중인 쓰기 작업의 파일이 삭제되지 않도록 하는 안전장치입니다. |
| `location`   | `String`         | 테이블 위치                                                  | 스캔 범위를 테이블 위치 아래의 특정 하위 디렉터리로 제한합니다(예: `'data/'` 또는 `'metadata/'`).                 |
| `dry_run`    | `UInt64`         | `0`                                                     | `1`로 설정하면 고아 파일을 식별하고, 실제로는 아무 파일도 삭제하지 않은 상태로 결과 요약을 반환합니다.                        |

**예시:**

```sql
-- Remove orphan files older than a specific timestamp
ALTER TABLE iceberg_table EXECUTE remove_orphan_files('2026-03-01 00:00:00');

-- Dry run: preview which files would be deleted
ALTER TABLE iceberg_table EXECUTE remove_orphan_files(dry_run = 1);

-- Scan only the data directory
ALTER TABLE iceberg_table EXECUTE remove_orphan_files(
    older_than = '2026-03-01 00:00:00',
    location = 'data/'
);

-- Combine positional older_than with named arguments
ALTER TABLE iceberg_table EXECUTE remove_orphan_files(
    '2026-03-01 00:00:00',
    dry_run = 1
);
```

**출력:**

이 명령어는 카테고리별 삭제된 파일 수(또는 `dry_run` 모드에서는 삭제 대상 파일 수)를 보여주는 `metric_name` 및 `metric_value` 컬럼이 포함된 테이블을 반환합니다. 파일 카테고리는 파일 이름 규칙을 바탕으로 한 최선형 휴리스틱으로 분류되며, 특정 패턴과 일치하지 않는 파일은 기본적으로 `deleted_data_files_count`로 분류됩니다:

| metric&#95;name                                     | metric&#95;value |
| --------------------------------------------------- | ---------------- |
| deleted&#95;data&#95;files&#95;count                | 5                |
| deleted&#95;position&#95;delete&#95;files&#95;count | 2                |
| deleted&#95;equality&#95;delete&#95;files&#95;count | 0                |
| deleted&#95;manifest&#95;files&#95;count            | 3                |
| deleted&#95;manifest&#95;lists&#95;count            | 1                |
| deleted&#95;metadata&#95;files&#95;count            | 0                |
| deleted&#95;statistics&#95;files&#95;count          | 0                |
| skipped&#95;missing&#95;metadata&#95;count          | 0                |
| failed&#95;deletions&#95;count                      | 0                |

**설정:**

| Setting                                   | Type     | Default           | Description                                |
| ----------------------------------------- | -------- | ----------------- | ------------------------------------------ |
| `allow_iceberg_remove_orphan_files`       | `Bool`   | `false`           | 이 기능을 활성화하는 게이트 설정입니다(Experimental).       |
| `iceberg_orphan_files_older_than_seconds` | `UInt64` | `259200` (3 days) | 인수가 생략되면 적용되는 초 단위 기본 `older_than` 임곗값입니다. |

:::note

* **Iceberg 형식 버전 2 이상이 필요합니다.** 버전 1 테이블은 스냅샷에 `manifest-list` 포인터가 없어 안전하게 참조 가능한 파일 집합을 판별할 수 없으므로 거부됩니다. v1 테이블에서 이 명령어를 실행하면 `BAD_ARGUMENTS` 오류가 반환됩니다.
* `allow_insert_into_iceberg`와 `allow_iceberg_remove_orphan_files` 설정을 모두 활성화해야 합니다
* 만료된 스냅샷에서만 참조되는 파일이 먼저 정리되도록 `remove_orphan_files`를 실행하기 전에 `expire_snapshots`를 실행하는 것이 좋습니다
* 삭제 전에 고아 파일을 미리 확인하려면 `dry_run = 1`을 사용하십시오
* `older_than` 임곗값은 진행 중인 쓰기 작업의 파일이 삭제되지 않도록 보호합니다 — 기본 3일 임곗값은 충분한 안전 여유를 제공합니다
  :::

## 같이 보기 \{#see-also\}

* [Iceberg 엔진](/engines/table-engines/integrations/iceberg.md)
* [Iceberg 클러스터 테이블 함수](/sql-reference/table-functions/icebergCluster.md)