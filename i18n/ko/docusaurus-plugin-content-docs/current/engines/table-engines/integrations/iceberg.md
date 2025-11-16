---
'description': '이 엔진은 Amazon S3, Azure, HDFS 및 로컬 저장 테이블에 있는 기존 Apache Iceberg 테이블과의
  읽기 전용 통합을 제공합니다.'
'sidebar_label': 'Iceberg'
'sidebar_position': 90
'slug': '/engines/table-engines/integrations/iceberg'
'title': 'Iceberg 테이블 엔진'
'doc_type': 'reference'
---


# Iceberg 테이블 엔진 {#iceberg-table-engine}

:::warning 
ClickHouse에서 Iceberg 데이터를 다루기 위해 [Iceberg 테이블 함수](/sql-reference/table-functions/iceberg.md)를 사용하는 것을 권장합니다. Iceberg 테이블 함수는 현재 Iceberg 테이블에 대해 부분적인 읽기 전용 인터페이스를 제공하여 충분한 기능을 제공합니다.

Iceberg 테이블 엔진은 사용 가능하지만 제한이 있을 수 있습니다. ClickHouse는 원래 외부에서 변경되는 스키마를 지원하도록 설계되지 않았으며, 이는 Iceberg 테이블 엔진의 기능에 영향을 미칠 수 있습니다. 결과적으로, 일반 테이블과 함께 작동하는 일부 기능은 사용할 수 없거나 제대로 작동하지 않을 수 있으며, 특히 이전 분석기를 사용할 때 그러합니다.

최적의 호환성을 위해 Iceberg 테이블 엔진에 대한 지원을 개선하는 동안 Iceberg 테이블 함수를 사용하는 것이 좋습니다.
:::

이 엔진은 기존의 Apache [Iceberg](https://iceberg.apache.org/) 테이블과의 읽기 전용 통합을 제공하며, 이는 Amazon S3, Azure, HDFS, 그리고 로컬에 저장된 테이블에서 사용할 수 있습니다.

## 테이블 생성 {#create-table}

Iceberg 테이블은 반드시 저장소에 이미 존재해야 하며, 이 명령은 새로운 테이블을 생성하기 위한 DDL 매개변수를 사용하지 않습니다.

```sql
CREATE TABLE iceberg_table_s3
    ENGINE = IcebergS3(url,  [, NOSIGN | access_key_id, secret_access_key, [session_token]], format, [,compression])

CREATE TABLE iceberg_table_azure
    ENGINE = IcebergAzure(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression])

CREATE TABLE iceberg_table_hdfs
    ENGINE = IcebergHDFS(path_to_table, [,format] [,compression_method])

CREATE TABLE iceberg_table_local
    ENGINE = IcebergLocal(path_to_table, [,format] [,compression_method])
```

## 엔진 매개변수 {#engine-arguments}

인수에 대한 설명은 엔진 `S3`, `AzureBlobStorage`, `HDFS`, 및 `File`의 설명과 일치합니다.
`format`은 Iceberg 테이블의 데이터 파일 형식을 나타냅니다.

엔진 매개변수는 [Named Collections](../../../operations/named-collections.md)를 사용하여 지정할 수 있습니다.

### 예제 {#example}

```sql
CREATE TABLE iceberg_table ENGINE=IcebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

명명된 컬렉션 사용:

```xml
<clickhouse>
    <named_collections>
        <iceberg_conf>
            <url>http://test.s3.amazonaws.com/clickhouse-bucket/</url>
            <access_key_id>test</access_key_id>
            <secret_access_key>test</secret_access_key>
        </iceberg_conf>
    </named_collections>
</clickhouse>
```

```sql
CREATE TABLE iceberg_table ENGINE=IcebergS3(iceberg_conf, filename = 'test_table')

```

## 별칭 {#aliases}

테이블 엔진 `Iceberg`는 현재 `IcebergS3`의 별칭입니다.

## 스키마 진화 {#schema-evolution}
현재로서는 CH의 도움으로 시간이 지남에 따라 스키마가 변경된 iceberg 테이블을 읽을 수 있습니다. 현재 컬럼이 추가되거나 제거되고, 그 순서가 변경된 테이블을 읽는 것을 지원합니다. 또한, 값이 필요한 컬럼을 NULL이 허용되는 것으로 변경할 수 있습니다. 추가로, 다음과 같은 단순 유형에 대한 허용되는 유형 캐스팅을 지원합니다:  
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S)에서 P' > P.

현재로서는 중첩 구조 또는 배열 및 맵 내의 요소 유형을 변경하는 것은 불가능합니다.

스키마가 생성 후에 변경된 테이블을 동적 스키마 추론을 통해 읽으려면 테이블 생성을 할 때 allow_dynamic_metadata_for_data_lakes = true로 설정하세요.

## 파티션 프루닝 {#partition-pruning}

ClickHouse는 Iceberg 테이블에 대해 SELECT 쿼리 중에 파티션 프루닝을 지원하여 불필요한 데이터 파일을 건너뛰어 쿼리 성능을 최적화합니다. 파티션 프루닝을 활성화하려면 `use_iceberg_partition_pruning = 1`로 설정하세요. Iceberg 파티션 프루닝에 대한 자세한 내용은 https://iceberg.apache.org/spec/#partitioning을 참조하세요.

## 타임 트래블 {#time-travel}

ClickHouse는 Iceberg 테이블에 대한 타임 트래블을 지원하여 특정 타임스탬프 또는 스냅샷 ID로 과거 데이터를 쿼리할 수 있습니다.

## 삭제된 행이 있는 테이블 처리 {#deleted-rows}

현재로서는 [위치 삭제](https://iceberg.apache.org/spec/#position-delete-files)가 있는 Iceberg 테이블만 지원됩니다.

다음 삭제 방법은 **지원되지 않습니다**:
- [동등 삭제](https://iceberg.apache.org/spec/#equality-delete-files)
- [삭제 벡터](https://iceberg.apache.org/spec/#deletion-vectors) (v3에서 도입)

### 기본 사용법 {#basic-usage}
```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_timestamp_ms = 1714636800000
```

```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_snapshot_id = 3547395809148285433
```

참고: `iceberg_timestamp_ms`와 `iceberg_snapshot_id` 매개변수를 동일한 쿼리에서 함께 지정할 수 없습니다.

### 중요 고려사항 {#important-considerations}

- **스냅샷**은 일반적으로 다음 시점에 생성됩니다:
  - 테이블에 새 데이터가 기록될 때
  - 어떤 형태의 데이터 집합이 수행될 때

- **스키마 변경은 일반적으로 스냅샷을 생성하지 않습니다** - 이는 스키마 진화가 발생한 테이블을 사용할 때 타임 트래블과 관련한 중요한 동작을 초래합니다.

### 예제 시나리오 {#example-scenarios}

모든 시나리오는 Spark에서 작성되었습니다. CH는 아직 Iceberg 테이블에 쓰는 것을 지원하지 않기 때문입니다.

#### 시나리오 1: 새 스냅샷 없이 스키마 변경 {#scenario-1}

다음과 같은 작업 순서를 고려하십시오:

```sql
 -- Create a table with two columns
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example (
  order_number int, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

-- Insert data into the table
  INSERT INTO spark_catalog.db.time_travel_example VALUES 
    (1, 'Mars')

  ts1 = now() // A piece of pseudo code

-- Alter table to add a new column
  ALTER TABLE spark_catalog.db.time_travel_example ADD COLUMN (price double)

  ts2 = now()

-- Insert data into the table
  INSERT INTO spark_catalog.db.time_travel_example VALUES (2, 'Venus', 100)

   ts3 = now()

-- Query the table at each timestamp
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

다양한 타임스탬프에서 쿼리 결과:

- ts1 및 ts2: 원래의 두 개의 컬럼만 나타남
- ts3: 세 개의 컬럼이 모두 나타나고, 첫 번째 행의 가격은 NULL입니다.

#### 시나리오 2: 과거와 현재 스키마의 차이 {#scenario-2}

현재 순간에 대한 타임 트래블 쿼리는 현재 테이블과 다른 스키마를 보여줄 수 있습니다:

```sql
-- Create a table
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_2 (
  order_number int, 
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

이는 `ALTER TABLE`이 새 스냅샷을 생성하지 않기 때문이며, 현재 테이블의 Spark는 최신 메타데이터 파일에서 `schema_id` 값을 가져옵니다, 스냅샷이 아닙니다.

#### 시나리오 3: 과거와 현재 스키마의 차이 {#scenario-3}

두 번째로, 타임 트래블을 수행할 때 데이터가 테이블에 기록되기 전의 상태를 가져올 수 없습니다:

```sql
-- Create a table
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number int, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2');

  ts = now();

-- Query the table at a specific timestamp
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- Finises with error: Cannot find a snapshot older than ts.
```

Clickhouse에서의 동작은 Spark와 일관되며, Spark Select 쿼리를 Clickhouse Select 쿼리로 정신적으로 대체할 수 있으며, 동일한 방식으로 작동합니다.

## 메타데이터 파일 해상도 {#metadata-file-resolution}
ClickHouse에서 `Iceberg` 테이블 엔진을 사용할 때, 시스템은 Iceberg 테이블 구조를 설명하는 올바른 metadata.json 파일을 찾아야 합니다. 이 해상도 과정은 다음과 같이 작동합니다:

### 후보 검색 {#candidate-search}

1. **직접 경로 지정**:
* `iceberg_metadata_file_path`를 설정하면, 시스템은 이 경로를 Iceberg 테이블 디렉토리 경로와 결합하여 사용할 것입니다.
* 이 설정이 제공되면, 다른 모든 해상도 설정은 무시됩니다.
2. **테이블 UUID 일치**:
* `iceberg_metadata_table_uuid`가 지정되면, 시스템은:
  * `metadata` 디렉토리의 `.metadata.json` 파일만 확인합니다.
  * 지정한 UUID와 일치하는 `table-uuid` 필드가 있는 파일만 필터링합니다 (대소문자 구분 없음).

3. **기본 검색**:
* 위의 두 설정이 제공되지 않은 경우 `metadata` 디렉토리의 모든 `.metadata.json` 파일이 후보가 됩니다.

### 최신 파일 선택 {#most-recent-file}

위의 규칙을 사용하여 후보 파일을 식별한 후, 시스템은 가장 최신 파일을 결정합니다:

* `iceberg_recent_metadata_file_by_last_updated_ms_field`가 활성화된 경우:
  * `last-updated-ms` 값이 가장 큰 파일이 선택됩니다.

* 그렇지 않으면:
  * 버전 번호가 가장 높은 파일이 선택됩니다.
  * (버전은 `V.metadata.json` 또는 `V-uuid.metadata.json` 형식의 파일 이름에서 `V`로 표시됩니다.)

**참고**: 언급된 모든 설정은 엔진 수준의 설정이며, 아래와 같이 테이블 생성 시에 지정해야 합니다:

```sql
CREATE TABLE example_table ENGINE = Iceberg(
    's3://bucket/path/to/iceberg_table'
) SETTINGS iceberg_metadata_table_uuid = '6f6f6407-c6a5-465f-a808-ea8900e35a38';
```

**참고**: Iceberg 카탈로그가 일반적으로 메타데이터 해상도를 처리하는 동안, ClickHouse의 `Iceberg` 테이블 엔진은 S3에 저장된 파일을 Iceberg 테이블로 직접 해석하므로, 이러한 해상도 규칙을 이해하는 것이 중요합니다.

## 데이터 캐시 {#data-cache}

`Iceberg` 테이블 엔진과 테이블 함수는 `S3`, `AzureBlobStorage`, `HDFS` 저장소와 동일하게 데이터 캐싱을 지원합니다. [여기](../../../engines/table-engines/integrations/s3.md#data-cache)를 참조하세요.

## 메타데이터 캐시 {#metadata-cache}

`Iceberg` 테이블 엔진과 테이블 함수는 매니페스트 파일, 매니페스트 목록 및 메타데이터 JSON의 정보를 저장하는 메타데이터 캐시를 지원합니다. 캐시는 메모리에 저장됩니다. 이 기능은 기본적으로 활성화된 `use_iceberg_metadata_files_cache` 설정에 의해 제어됩니다.

## 추가 정보 {#see-also}

- [iceberg 테이블 함수](/sql-reference/table-functions/iceberg.md)
