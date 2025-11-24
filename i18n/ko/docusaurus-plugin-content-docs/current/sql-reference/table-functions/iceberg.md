---
'description': 'Amazon S3, Azure, HDFS 또는 로컬에 저장된 Apache Iceberg 테이블에 대한 읽기 전용 테이블과
  유사한 인터페이스를 제공합니다.'
'sidebar_label': '얼음산'
'sidebar_position': 90
'slug': '/sql-reference/table-functions/iceberg'
'title': '얼음산'
'doc_type': 'reference'
---


# iceberg Table Function {#iceberg-table-function}

Apache [Iceberg](https://iceberg.apache.org/) 테이블에 대해 읽기 전용 테이블과 유사한 인터페이스를 Amazon S3, Azure, HDFS 또는 로컬에 저장된 데이터에 제공합니다.

## Syntax {#syntax}

```sql
icebergS3(url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])
icebergS3(named_collection[, option=value [,..]])

icebergAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
icebergAzure(named_collection[, option=value [,..]])

icebergHDFS(path_to_table, [,format] [,compression_method])
icebergHDFS(named_collection[, option=value [,..]])

icebergLocal(path_to_table, [,format] [,compression_method])
icebergLocal(named_collection[, option=value [,..]])
```

## Arguments {#arguments}

인수에 대한 설명은 각각의 테이블 함수 `s3`, `azureBlobStorage`, `HDFS` 및 `file`의 인수 설명과 일치합니다.
`format`은 Iceberg 테이블의 데이터 파일 형식을 나타냅니다.

### Returned value {#returned-value}

지정된 Iceberg 테이블에서 데이터를 읽기 위한 지정된 구조의 테이블입니다.

### Example {#example}

```sql
SELECT * FROM icebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

:::important
ClickHouse는 현재 `icebergS3`, `icebergAzure`, `icebergHDFS` 및 `icebergLocal` 테이블 함수와 `IcebergS3`, `icebergAzure`, `IcebergHDFS` 및 `IcebergLocal` 테이블 엔진을 통해 Iceberg 형식의 v1 및 v2를 읽는 것을 지원합니다.
:::

## Defining a named collection {#defining-a-named-collection}

URL 및 자격 증명을 저장하기 위한 이름 있는 컬렉션 구성 예는 다음과 같습니다:

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

## Schema Evolution {#schema-evolution}

현재 CH를 통해 시간이 지남에 따라 스키마가 변경된 iceberg 테이블을 읽을 수 있습니다. 현재 열이 추가되거나 제거되고 순서가 변경된 테이블을 읽는 것을 지원합니다. 또한, 값이 필요했던 열을 NULL을 허용하는 열로 변경할 수 있습니다. 추가로, 간단한 유형에 대한 허용되는 형 변환을 지원합니다. 즉:  

* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S) where P' > P.

현재 중첩 구조나 배열 및 맵 내의 요소 유형을 변경하는 것은 불가능합니다.

## Partition Pruning {#partition-pruning}

ClickHouse는 Iceberg 테이블에 대한 SELECT 쿼리에서 파티션 프루닝을 지원하여 관련 없는 데이터 파일을 스킵하여 쿼리 성능을 최적화합니다. 파티션 프루닝을 활성화하려면 `use_iceberg_partition_pruning = 1`로 설정하십시오. Iceberg 파티션 프루닝에 대한 자세한 정보는 https://iceberg.apache.org/spec/#partitioning 를 참조하십시오.

## Time Travel {#time-travel}

ClickHouse는 Iceberg 테이블에 대한 타임 트래블을 지원하여 특정 타임스탬프 또는 스냅샷 ID로 과거 데이터를 쿼리할 수 있습니다.

## Processing of tables with deleted rows {#deleted-rows}

현재 지원되는 것은 [위치 삭제](https://iceberg.apache.org/spec/#position-delete-files)가 있는 Iceberg 테이블뿐입니다.

다음 삭제 방법은 **지원되지 않습니다**:
- [동등 삭제](https://iceberg.apache.org/spec/#equality-delete-files)
- [삭제 벡터](https://iceberg.apache.org/spec/#deletion-vectors) (v3에서 도입됨)

### Basic usage {#basic-usage}

```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_timestamp_ms = 1714636800000
```

```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_snapshot_id = 3547395809148285433
```

참고: 동일한 쿼리에서 `iceberg_timestamp_ms`와 `iceberg_snapshot_id` 매개변수를 함께 지정할 수 없습니다.

### Important considerations {#important-considerations}

* **스냅샷**은 일반적으로 다음과 같은 경우에 생성됩니다:
* 새 데이터가 테이블에 기록될 때
* 일부 데이터 압축 작업이 수행될 때

* **스키마 변경은 일반적으로 스냅샷을 생성하지 않습니다** - 이는 스키마 진화를 겪은 테이블에서 타임 트래블을 사용할 때 중요한 동작으로 이어집니다.

### Example scenarios {#example-scenarios}

모든 시나리오는 Spark에서 작성되었으며, CH는 아직 Iceberg 테이블에 데이터 작성을 지원하지 않습니다.

#### Scenario 1: Schema Changes Without New Snapshots {#scenario-1}

다음 작업 시퀀스를 고려하십시오:

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

다양한 타임스탬프에서의 쿼리 결과:

* ts1 및 ts2에서: 원래 두 개의 열만 나타납니다.
* ts3에서: 세 개의 열이 모두 나타나며, 첫 번째 행의 가격은 NULL입니다.

#### Scenario 2: Historical vs. Current Schema Differences {#scenario-2}

현재 시점에서의 타임 트래블 쿼리는 현재 테이블과 다른 스키마를 보여줄 수 있습니다:

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

이는 `ALTER TABLE`이 새로운 스냅샷을 생성하지 않지만 현재 테이블은 최신 메타데이터 파일에서 `schema_id` 값을 가져오기 때문에 발생합니다.

#### Scenario 3: Historical vs. Current Schema Differences {#scenario-3}

두 번째는 시간 여행 중에 테이블에 데이터가 기록되기 전에 테이블 상태를 가져올 수 없다는 것입니다:

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

Clickhouse의 동작은 Spark와 일치합니다. Spark Select 쿼리는 Clickhouse Select 쿼리로 정신적으로 대체할 수 있으며 같은 방식으로 작동합니다.

## Metadata File Resolution {#metadata-file-resolution}

ClickHouse에서 `iceberg` 테이블 함수를 사용할 때 시스템은 Iceberg 테이블 구조를 설명하는 올바른 metadata.json 파일을 찾는必要가 있습니다. 다음은 이 해석 과정이 작동하는 방식입니다:

### Candidate Search (in Priority Order) {#candidate-search}

1. **Direct Path Specification**:
* `iceberg_metadata_file_path`를 설정하면, 시스템은 Iceberg 테이블 디렉토리 경로와 결합하여 이 경로를 사용할 것입니다.
* 이 설정이 제공될 경우, 모든 다른 해석 설정은 무시됩니다.

2. **Table UUID Matching**:
* `iceberg_metadata_table_uuid`가 지정되면, 시스템은:
    * `metadata` 디렉토리 내의 `.metadata.json` 파일만을 확인합니다.
    * 지정한 UUID와 일치하는 `table-uuid` 필드를 포함하는 파일로 필터링합니다 (대소문자 구분 없음)

3. **Default Search**:
* 위의 두 설정이 제공되지 않으면, `metadata` 디렉토리의 모든 `.metadata.json` 파일이 후보가 됩니다.

### Selecting the Most Recent File {#most-recent-file}

위의 규칙을 사용하여 후보 파일을 식별한 후, 시스템은 어떤 것이 가장 최근인지 결정합니다:

* `iceberg_recent_metadata_file_by_last_updated_ms_field`가 활성화된 경우:
* 가장 큰 `last-updated-ms` 값을 가진 파일이 선택됩니다.

* 그렇지 않으면:
* 가장 높은 버전 번호를 가진 파일이 선택됩니다.
* (버전은 `V.metadata.json` 또는 `V-uuid.metadata.json` 형식의 파일 이름에 `V`로 나타납니다.)

**참고**: 언급된 모든 설정은 테이블 함수 설정입니다 (전역 또는 쿼리 수준의 설정이 아님) 아래와 같이 지정해야 합니다:

```sql
SELECT * FROM iceberg('s3://bucket/path/to/iceberg_table', 
    SETTINGS iceberg_metadata_table_uuid = 'a90eed4c-f74b-4e5b-b630-096fb9d09021');
```

**참고**: Iceberg 카탈로그는 일반적으로 메타데이터 해석을 처리하지만, ClickHouse의 `iceberg` 테이블 함수는 S3에 저장된 파일을 Iceberg 테이블로 직접 해석하므로 이러한 해석 규칙을 이해하는 것이 중요합니다.

## Metadata cache {#metadata-cache}

`Iceberg` 테이블 엔진과 테이블 함수는 매니페스트 파일, 매니페스트 목록 및 메타데이터 json 정보를 저장하는 메타데이터 캐시를 지원합니다. 캐시는 메모리에 저장됩니다. 이 기능은 기본적으로 활성화되는 `use_iceberg_metadata_files_cache`를 설정하여 제어할 수 있습니다.

## Aliases {#aliases}

현재 테이블 함수 `iceberg`는 `icebergS3`의 별칭입니다.

## Virtual Columns {#virtual-columns}

- `_path` — 파일 경로입니다. 유형: `LowCardinality(String)`.
- `_file` — 파일 이름입니다. 유형: `LowCardinality(String)`.
- `_size` — 파일 크기(바이트)입니다. 유형: `Nullable(UInt64)`. 파일 크기가 알려지지 않은 경우 값은 `NULL`입니다.
- `_time` — 파일의 마지막 수정 시간입니다. 유형: `Nullable(DateTime)`. 시간에 대한 정보가 없는 경우 값은 `NULL`입니다.
- `_etag` — 파일의 etag입니다. 유형: `LowCardinality(String)`. etag가 알려지지 않은 경우 값은 `NULL`입니다.

## Writes into iceberg table {#writes-into-iceberg-table}

버전 25.7부터 ClickHouse는 사용자의 Iceberg 테이블 수정 작업을 지원합니다.

현재, 이 기능은 실험적이므로 먼저 이를 활성화해야 합니다:

```sql
SET allow_experimental_insert_into_iceberg = 1;
```

### Creating table {#create-iceberg-table}

자신의 빈 Iceberg 테이블을 만들려면 읽기와 동일한 명령을 사용하되, 스키마를 명시적으로 지정하십시오.
쓰기는 Iceberg 사양의 모든 데이터 형식을 지원합니다, 예를 들어 Parquet, Avro, ORC.

### Example {#example-iceberg-writes-create}

```sql
CREATE TABLE iceberg_writes_example
(
    x Nullable(String),
    y Nullable(Int32)
)
ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/')
```

참고: 버전 힌트 파일을 생성하려면 `iceberg_use_version_hint` 설정을 활성화하십시오.
metadata.json 파일을 압축하려면 `iceberg_metadata_compression_method` 설정에 코덱 이름을 지정하십시오.

### INSERT {#writes-inserts}

새 테이블을 생성한 후에는 일반 ClickHouse 구문을 사용하여 데이터를 삽입할 수 있습니다.

### Example {#example-iceberg-writes-insert}

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

### DELETE {#iceberg-writes-delete}

병합-온-읽기 형식에서 추가 행 삭제도 ClickHouse에서 지원됩니다.
이 쿼리는 위치 삭제 파일로 새 스냅샷을 생성할 것입니다.

참고: 나중에 다른 Iceberg 엔진(Spark 등)에서 테이블을 읽으려면 `output_format_parquet_use_custom_encoder` 및 `output_format_parquet_parallel_encoding` 설정을 비활성화해야 합니다.
이는 Spark가 이러한 파일을 parquet 필드 ID로 읽는 반면, ClickHouse는 현재 이러한 플래그가 활성화될 때 필드 ID를 쓰 support하지 않기 때문입니다.
우리는 이 동작을 향후 수정할 계획입니다.

### Example {#example-iceberg-writes-delete}

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

### Schema evolution {#iceberg-writes-schema-evolution}

ClickHouse는 단순 유형(튜플, 배열, 맵이 아닌)으로 열을 추가, 삭제 또는 수정할 수 있도록 지원합니다.

### Example {#example-iceberg-writes-evolution}

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
```

### Compaction {#iceberg-writes-compaction}

ClickHouse는 Iceberg 테이블의 압축을 지원합니다. 현재는 메타데이터 업데이트 중에 위치 삭제 파일을 데이터 파일로 병합할 수 있습니다. 이전 스냅샷 ID 및 타임스탬프는 변경되지 않으므로 시간 여행 기능은 여전히 동일한 값으로 사용할 수 있습니다.

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

## Table with catalogs {#iceberg-writes-catalogs}

위에 설명된 모든 쓰기 기능은 REST 및 Glue 카탈로그와 함께 사용할 수 있습니다.
이를 사용하려면 `IcebergS3` 엔진으로 테이블을 생성하고 필요한 설정을 제공합니다:

```sql
CREATE TABLE `database_name.table_name`  ENGINE = IcebergS3('http://minio:9000/warehouse-rest/table_name/', 'minio_access_key', 'minio_secret_key')
SETTINGS storage_catalog_type="rest", storage_warehouse="demo", object_storage_endpoint="http://minio:9000/warehouse-rest", storage_region="us-east-1", storage_catalog_url="http://rest:8181/v1",
```

## See Also {#see-also}

* [Iceberg engine](/engines/table-engines/integrations/iceberg.md)
* [Iceberg cluster table function](/sql-reference/table-functions/icebergCluster.md)
