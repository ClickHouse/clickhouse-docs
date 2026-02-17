---
description: '이 엔진은 Amazon S3, Azure, HDFS 및 로컬에 저장된 기존 Apache Iceberg 테이블과 읽기 전용으로 통합됩니다.'
sidebar_label: 'Iceberg'
sidebar_position: 90
slug: /engines/table-engines/integrations/iceberg
title: 'Iceberg 테이블 엔진'
doc_type: 'reference'
---



# Iceberg table engine \{#iceberg-table-engine\}

:::warning 
ClickHouse에서 Iceberg 데이터를 다룰 때는 [Iceberg Table Function](/sql-reference/table-functions/iceberg.md)을 사용할 것을 권장합니다. Iceberg Table Function은 현재 Iceberg 테이블에 대해 읽기 전용의 부분적인 인터페이스를 제공하지만, 대부분의 사용 사례에 충분한 기능을 갖추고 있습니다.

Iceberg Table Engine도 사용 가능하지만 일부 제약이 있을 수 있습니다. ClickHouse는 원래 외부에서 스키마가 변경되는 테이블을 지원하도록 설계되지 않았기 때문에 이 점이 Iceberg Table Engine의 동작에 영향을 줄 수 있습니다. 그 결과, 일반 테이블에서 동작하는 일부 기능은 사용할 수 없거나, 특히 기존 분석기("old analyzer")를 사용할 때 올바르게 동작하지 않을 수 있습니다.

최적의 호환성을 위해 Iceberg Table Engine에 대한 지원을 지속적으로 개선하는 동안에는 Iceberg Table Function을 사용할 것을 권장합니다.
:::

이 엔진은 Amazon S3, Azure, HDFS 및 로컬에 저장된 기존 Apache [Iceberg](https://iceberg.apache.org/) 테이블과의 읽기 전용 통합 기능을 제공합니다.



## 테이블 생성 \{#create-table\}

Iceberg 테이블은 스토리지에 이미 존재해야 하며, 이 명령에는 새 테이블을 생성하기 위한 DDL 매개변수가 포함되지 않습니다.

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


## 엔진 인수 \{#engine-arguments\}

인수에 대한 설명은 각각 엔진 `S3`, `AzureBlobStorage`, `HDFS`, `File`의 인수 설명과 동일합니다.
`format`은 Iceberg 테이블에서 데이터 파일의 형식을 나타냅니다.

엔진 매개변수는 [Named Collections](../../../operations/named-collections.md)를 사용하여 지정할 수 있습니다.

### 예제 \{#example\}

```sql
CREATE TABLE iceberg_table ENGINE=IcebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

이름이 지정된 컬렉션 사용하기:

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


## 별칭 \{#aliases\}

테이블 엔진 `Iceberg`는 이제 `IcebergS3`의 별칭으로 사용됩니다.



## 스키마 진화 \{#schema-evolution\}
현재 ClickHouse를 사용하면 시간이 지나면서 스키마가 변경된 Iceberg 테이블을 읽을 수 있습니다. 현재는 컬럼이 추가되거나 제거되고, 순서가 변경된 테이블을 읽는 것을 지원합니다. 또한 NULL을 허용하지 않던 컬럼을 `NULL` 값을 허용하는 컬럼으로 변경할 수도 있습니다. 추가로, 단순 타입에 대한 허용되는 형 변환도 지원합니다. 구체적으로:  
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S) where P' > P. 

현재는 중첩 구조나 배열 및 맵 내부 요소의 타입을 변경하는 것은 불가능합니다.

동적 스키마 추론(dynamic schema inference)을 사용하여 생성 이후 스키마가 변경된 테이블을 읽으려면, 테이블을 생성할 때 `allow_dynamic_metadata_for_data_lakes = true`로 설정하십시오.



## Partition pruning \{#partition-pruning\}

ClickHouse는 Iceberg 테이블에 대한 SELECT 쿼리 실행 시 파티션 프루닝(partition pruning)을 지원하여 관련 없는 데이터 파일을 건너뛰어 쿼리 성능을 최적화합니다. 파티션 프루닝을 활성화하려면 `use_iceberg_partition_pruning = 1`로 설정합니다. Iceberg 파티션 프루닝에 대한 자세한 내용은 https://iceberg.apache.org/spec/#partitioning 을(를) 참조하십시오.



## 시간 여행 \{#time-travel\}

ClickHouse는 Iceberg 테이블에 대해 시간 여행을 지원하여 특정 타임스탬프나 스냅샷 ID를 기준으로 과거 데이터를 쿼리할 수 있습니다.



## 삭제된 행을 포함하는 테이블 처리 \{#deleted-rows\}

현재는 [position deletes](https://iceberg.apache.org/spec/#position-delete-files)가 있는 Iceberg 테이블만 지원합니다.

다음과 같은 삭제 방식은 **지원하지 않습니다**:

* [Equality deletes](https://iceberg.apache.org/spec/#equality-delete-files)
* [Deletion vectors](https://iceberg.apache.org/spec/#deletion-vectors) (v3에서 도입됨)

### 기본 사용법 \{#basic-usage\}

```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_timestamp_ms = 1714636800000
```

```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_snapshot_id = 3547395809148285433
```

참고: 하나의 쿼리에서 `iceberg_timestamp_ms`와 `iceberg_snapshot_id` 매개변수를 동시에 지정할 수 없습니다.

### 중요한 고려 사항 \{#important-considerations\}

* **스냅샷(snapshot)** 은 일반적으로 다음과 같은 경우에 생성됩니다.
  * 새로운 데이터가 테이블에 기록될 때
  * 어떤 형태로든 데이터 컴팩션(compaction)이 수행될 때

* **스키마 변경은 일반적으로 스냅샷을 생성하지 않습니다.** 이는 스키마 진화(schema evolution)를 거친 테이블에서 타임 트래블(time travel)을 사용할 때 동작에 중요한 영향을 미칩니다.

### 시나리오 예시 \{#example-scenarios\}

모든 시나리오는 ClickHouse가 아직 Iceberg 테이블에 대한 쓰기를 지원하지 않기 때문에 Spark로 작성되었습니다.

#### 시나리오 1: 새로운 스냅샷 없이 스키마 변경 \{#scenario-1\}

다음 연산 순서를 고려하십시오.

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

타임스탬프에 따른 쿼리 결과:

* ts1 및 ts2 시점에서는 원래의 두 개 컬럼만 표시됩니다.
* ts3 시점에서는 세 개 컬럼이 모두 표시되며, 첫 번째 행의 price 값은 NULL입니다.

#### 시나리오 2: 과거 스키마와 현재 스키마 간 차이 \{#scenario-2\}

현재 시점에 타임 트래블 쿼리를 실행하면, 현재 테이블과는 다른 스키마가 표시될 수 있습니다:

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

이는 `ALTER TABLE`이 새로운 스냅샷을 생성하지 않고, 현재 테이블에 대해서는 Spark가 스냅샷이 아니라 최신 메타데이터 파일에서 `schema_id` 값을 가져오기 때문에 발생합니다.


#### 시나리오 3: 과거 스키마와 현재 스키마 간 차이 \{#scenario-3\}

두 번째로, time travel을 수행할 때 테이블에 어떤 데이터도 아직 기록되지 않았던 시점의 상태는 조회할 수 없습니다.

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

ClickHouse에서는 동작 방식이 Spark와 동일합니다. Spark Select 쿼리를 ClickHouse Select 쿼리로 바꾸어 생각해도 동일한 방식으로 동작합니다.


## 메타데이터 파일 결정 \{#metadata-file-resolution\}

ClickHouse에서 `Iceberg` 테이블 엔진을 사용할 때, 시스템은 Iceberg 테이블 구조를 설명하는 올바른 metadata.json 파일을 찾아야 합니다. 이 결정 과정은 다음과 같이 작동합니다:

### 후보 검색 \{#candidate-search\}

1. **경로 직접 지정**:

* `iceberg_metadata_file_path`를 설정하면 시스템은 이 경로를 Iceberg 테이블 디렉터리 경로와 결합하여 그대로 사용합니다.
* 이 설정이 지정되면 다른 모든 관련 설정은 무시됩니다.

2. **테이블 UUID 매칭**:

* `iceberg_metadata_table_uuid`가 지정된 경우, 시스템은:
  * `metadata` 디렉터리 안의 `.metadata.json` 파일만 확인하고
  * 지정한 UUID와 일치하는 `table-uuid` 필드를 포함하는 파일만 필터링합니다 (대소문자 구분 없음)

3. **기본 검색**:

* 위 설정들이 제공되지 않은 경우, `metadata` 디렉터리 안의 모든 `.metadata.json` 파일이 후보가 됩니다.

### 가장 최신 파일 선택 \{#most-recent-file\}

위 규칙으로 후보 파일을 식별한 후, 시스템은 그중 가장 최신 파일을 결정합니다:

* `iceberg_recent_metadata_file_by_last_updated_ms_field`가 활성화된 경우:
  * `last-updated-ms` 값이 가장 큰 파일이 선택됩니다.

* 그렇지 않은 경우:
  * 버전 번호가 가장 높은 파일이 선택됩니다.
  * (버전은 `V.metadata.json` 또는 `V-uuid.metadata.json` 형식의 파일 이름에서 `V`로 나타납니다)

**참고**: 언급된 모든 설정은 엔진 수준 설정이며, 아래와 같이 테이블 생성 시점에 지정해야 합니다:

```sql
CREATE TABLE example_table ENGINE = Iceberg(
    's3://bucket/path/to/iceberg_table'
) SETTINGS iceberg_metadata_table_uuid = '6f6f6407-c6a5-465f-a808-ea8900e35a38';
```

**참고**: 일반적으로 Iceberg Catalog는 메타데이터 결정(해결)을 처리하지만, ClickHouse의 `Iceberg` 테이블 엔진은 S3에 저장된 파일을 Iceberg 테이블로 직접 해석하므로 이러한 결정 규칙을 이해하는 것이 중요합니다.


## 데이터 캐시 \{#data-cache\}

`Iceberg` 테이블 엔진과 테이블 함수는 `S3`, `AzureBlobStorage`, `HDFS` 스토리지와 마찬가지로 데이터 캐시 기능을 지원합니다. 자세한 내용은 [여기](../../../engines/table-engines/integrations/s3.md#data-cache)를 참고하십시오.



## 메타데이터 캐시 \{#metadata-cache\}

`Iceberg` 테이블 엔진과 테이블 함수는 매니페스트 파일, 매니페스트 목록 및 메타데이터 JSON 정보를 저장하는 메타데이터 캐시를 지원합니다. 캐시는 메모리에 저장됩니다. 이 기능은 `use_iceberg_metadata_files_cache` 설정으로 제어되며, 기본적으로 활성화되어 있습니다.



## 같이 보기 \{#see-also\}

- [iceberg 테이블 함수](/sql-reference/table-functions/iceberg.md)
