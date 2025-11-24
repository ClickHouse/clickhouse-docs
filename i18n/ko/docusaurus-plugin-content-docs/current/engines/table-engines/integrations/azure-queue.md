---
'description': '이 엔진은 Azure Blob Storage 생태계와의 통합을 제공하여 데이터 스트리밍 가져오기를 허용합니다.'
'sidebar_label': 'AzureQueue'
'sidebar_position': 181
'slug': '/engines/table-engines/integrations/azure-queue'
'title': 'AzureQueue 테이블 엔진'
'doc_type': 'reference'
---


# AzureQueue 테이블 엔진

이 엔진은 [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 생태계와 통합을 제공하여 스트리밍 데이터 가져오기를 가능하게 합니다.

## 테이블 생성 {#creating-a-table}

```sql
CREATE TABLE test (name String, value UInt32)
    ENGINE = AzureQueue(...)
    [SETTINGS]
    [mode = '',]
    [after_processing = 'keep',]
    [keeper_path = '',]
    ...
```

**엔진 매개변수**

`AzureQueue` 매개변수는 `AzureBlobStorage` 테이블 엔진에서 지원하는 것과 동일합니다. 매개변수 섹션은 [여기](../../../engines/table-engines/integrations/azureBlobStorage.md)를 참조하십시오.

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) 테이블 엔진과 유사하게, 사용자는 로컬 Azure Storage 개발을 위해 Azurite 에뮬레이터를 사용할 수 있습니다. 추가 세부 사항은 [여기](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)를 참조하십시오.

**예제**

```sql
CREATE TABLE azure_queue_engine_table
(
    `key` UInt64,
    `data` String
)
ENGINE = AzureQueue('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', '*', 'CSV')
SETTINGS mode = 'unordered'
```

## 설정 {#settings}

지원되는 설정의 집합은 `S3Queue` 테이블 엔진과 동일하지만 `s3queue_` 접두사는 없습니다. [설정의 전체 목록](../../../engines/table-engines/integrations/s3queue.md#settings)을 참조하십시오.
테이블에 구성된 설정 목록을 가져오려면 `system.azure_queue_settings` 테이블을 사용하십시오. `24.10` 버전부터 사용할 수 있습니다.

## 설명 {#description}

`SELECT`는 스트리밍 가져오기에 특히 유용하지 않습니다(디버깅을 제외하고), 각 파일은 한 번만 가져올 수 있기 때문입니다. 실제로는 [물리화된 뷰](../../../sql-reference/statements/create/view.md)를 사용하여 실시간 스레드를 생성하는 것이 더 실용적입니다. 이를 위해:

1. 지정된 경로에서 S3의 데이터를 소비할 테이블을 생성하는 엔진을 사용하고 이를 데이터 스트림으로 간주합니다.
2. 원하는 구조의 테이블을 생성합니다.
3. 엔진에서 데이터를 변환하여 이전에 생성한 테이블에 넣는 물리화된 뷰를 생성합니다.

`MATERIALIZED VIEW`가 엔진에 연결되면 백그라운드에서 데이터를 수집하기 시작합니다.

예제:

```sql
CREATE TABLE azure_queue_engine_table (key UInt64, data String)
  ENGINE=AzureQueue('<endpoint>', 'CSV', 'gzip')
  SETTINGS
      mode = 'unordered';

CREATE TABLE stats (key UInt64, data String)
  ENGINE = MergeTree() ORDER BY key;

CREATE MATERIALIZED VIEW consumer TO stats
  AS SELECT key, data FROM azure_queue_engine_table;

SELECT * FROM stats ORDER BY key;
```

## 가상 컬럼 {#virtual-columns}

- `_path` — 파일 경로.
- `_file` — 파일 이름.

가상 컬럼에 대한 자세한 내용은 [여기](../../../engines/table-engines/index.md#table_engines-virtual_columns)를 참조하십시오.

## 내성 {#introspection}

테이블 설정 `enable_logging_to_queue_log=1`을 통해 테이블에 대한 로깅을 활성화합니다.

내성 기능은 여러 가지 명확한 차이가 있는 [S3Queue 테이블 엔진](/engines/table-engines/integrations/s3queue#introspection)과 동일합니다:

1. 서버 버전 >= 25.1의 경우 `system.azure_queue`를 사용하여 큐의 인메모리 상태를 확인합니다. 이전 버전은 `system.s3queue`를 사용합니다(이는 `azure` 테이블에 대한 정보도 포함됩니다).
2. 주요 ClickHouse 구성에서 `system.azure_queue_log`를 활성화합니다. 예:

```xml
<azure_queue_log>
  <database>system</database>
  <table>azure_queue_log</table>
</azure_queue_log>
```

이 영구 테이블은 처리된 파일과 실패한 파일에 대한 정보를 포함하여 `system.s3queue`와 동일한 정보를 가지고 있습니다.

테이블 구조는 다음과 같습니다:

```sql

CREATE TABLE system.azure_queue_log
(
    `hostname` LowCardinality(String) COMMENT 'Hostname',
    `event_date` Date COMMENT 'Event date of writing this log row',
    `event_time` DateTime COMMENT 'Event time of writing this log row',
    `database` String COMMENT 'The name of a database where current S3Queue table lives.',
    `table` String COMMENT 'The name of S3Queue table.',
    `uuid` String COMMENT 'The UUID of S3Queue table',
    `file_name` String COMMENT 'File name of the processing file',
    `rows_processed` UInt64 COMMENT 'Number of processed rows',
    `status` Enum8('Processed' = 0, 'Failed' = 1) COMMENT 'Status of the processing file',
    `processing_start_time` Nullable(DateTime) COMMENT 'Time of the start of processing the file',
    `processing_end_time` Nullable(DateTime) COMMENT 'Time of the end of processing the file',
    `exception` String COMMENT 'Exception message if happened'
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_date, event_time)
SETTINGS index_granularity = 8192
COMMENT 'Contains logging entries with the information files processes by S3Queue engine.'

```

예제:

```sql
SELECT *
FROM system.azure_queue_log
LIMIT 1
FORMAT Vertical

Row 1:
──────
hostname:              clickhouse
event_date:            2024-12-16
event_time:            2024-12-16 13:42:47
database:              default
table:                 azure_queue_engine_table
uuid:                  1bc52858-00c0-420d-8d03-ac3f189f27c8
file_name:             test_1.csv
rows_processed:        3
status:                Processed
processing_start_time: 2024-12-16 13:42:47
processing_end_time:   2024-12-16 13:42:47
exception:

1 row in set. Elapsed: 0.002 sec.

```
