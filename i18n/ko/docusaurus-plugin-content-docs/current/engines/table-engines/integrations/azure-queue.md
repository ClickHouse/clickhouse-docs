---
description: '이 엔진은 Azure Blob Storage 생태계와의 통합 기능을 제공하여 스트리밍 데이터 가져오기를 지원합니다.'
sidebar_label: 'AzureQueue'
sidebar_position: 181
slug: /engines/table-engines/integrations/azure-queue
title: 'AzureQueue 테이블 엔진'
doc_type: 'reference'
---

# AzureQueue 테이블 엔진 \{#azurequeue-table-engine\}

이 엔진은 [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 에코시스템과의 통합 기능을 제공하여 스트리밍 방식의 데이터 입력을 지원합니다.

## 테이블 생성 \{#creating-a-table\}

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

`AzureQueue` 매개변수는 `AzureBlobStorage` 테이블 엔진이 지원하는 매개변수와 동일합니다. 매개변수 섹션은 [여기](../../../engines/table-engines/integrations/azureBlobStorage.md)를 참조하십시오.

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) 테이블 엔진과 마찬가지로, 로컬 Azure Storage 개발을 위해 Azurite 에뮬레이터를 사용할 수 있습니다. 자세한 내용은 [여기](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)를 참조하십시오.

**예시**

```sql
CREATE TABLE azure_queue_engine_table
(
    `key` UInt64,
    `data` String
)
ENGINE = AzureQueue('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', '*', 'CSV')
SETTINGS mode = 'unordered'
```


## Settings \{#settings\}

지원되는 설정 집합은 대부분 `S3Queue` 테이블 엔진과 동일하지만, `s3queue_` 접두사는 사용하지 않습니다. [설정 전체 목록](../../../engines/table-engines/integrations/s3queue.md#settings)을 참조하십시오.
테이블에 대해 구성된 설정 목록을 확인하려면 `system.azure_queue_settings` 테이블을 사용합니다. `24.10` 버전부터 사용할 수 있습니다.

아래 설정들은 AzureQueue에만 해당하며 S3Queue에는 적용되지 않습니다.

### `after_processing_move_connection_string` \{#after_processing_move_connection_string\}

대상 위치가 다른 Azure 컨테이너인 경우, 정상적으로 처리된 파일을 이동할 Azure Blob Storage의 연결 문자열입니다.

가능한 값:

- String.

기본값: 빈 문자열.

### `after_processing_move_container` \{#after_processing_move_container\}

대상 컨테이너가 다른 Azure 컨테이너인 경우, 성공적으로 처리된 파일을 이동할 컨테이너 이름입니다.

가능한 값:

* String.

기본값: 빈 문자열.

예시:

```sql
CREATE TABLE azure_queue_engine_table
(
    `key` UInt64,
    `data` String
)
ENGINE = AzureQueue('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', '*', 'CSV')
SETTINGS
    mode = 'unordered',
    after_processing = 'move',
    after_processing_move_connection_string = 'DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    after_processing_move_container = 'dst-container';
```


## AzureQueue 테이블 엔진에서의 SELECT \{#select\}

기본적으로 AzureQueue 테이블에서는 SELECT 쿼리가 허용되지 않습니다. 이는 데이터가 한 번 읽힌 후 큐에서 제거되는 일반적인 큐 패턴을 따르기 때문입니다. 실수로 인한 데이터 손실을 방지하기 위해 SELECT가 금지됩니다.
다만 경우에 따라 SELECT가 필요할 수 있습니다. 이때는 `stream_like_engine_allow_direct_select` 설정을 `True`로 지정해야 합니다.
AzureQueue 엔진에는 SELECT 쿼리를 위한 특별 설정인 `commit_on_select`가 있습니다. 읽은 후에도 큐의 데이터를 유지하려면 `False`로 설정하고, 읽은 후 데이터를 제거하려면 `True`로 설정합니다.

## 설명 \{#description\}

각 파일은 한 번만 가져올 수 있으므로(디버깅을 제외하면) 스트리밍 가져오기에서는 `SELECT`가 그다지 유용하지 않습니다. 대신 [materialized view](../../../sql-reference/statements/create/view.md)를 사용하여 실시간 처리 흐름을 만드는 것이 더 실용적입니다. 이를 위해서는 다음을 수행합니다.

1. 지정된 S3 경로에서 데이터를 소비하는 테이블을 해당 엔진을 사용하여 생성하고, 이를 데이터 스트림으로 간주합니다.
2. 원하는 구조의 테이블을 생성합니다.
3. 엔진에서 나오는 데이터를 변환하여 앞에서 생성한 테이블에 삽입하는 materialized view를 생성합니다.

`MATERIALIZED VIEW`가 해당 엔진과 함께 동작하도록 설정되면 백그라운드에서 데이터를 수집하기 시작합니다.

예시:

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


## 가상 컬럼 \{#virtual-columns\}

- `_path` — 파일 경로.
- `_file` — 파일 이름.

가상 컬럼에 대한 자세한 내용은 [여기](../../../engines/table-engines/index.md#table_engines-virtual_columns)를 참조하십시오.

## 인트로스펙션(Introspection) \{#introspection\}

테이블 설정 `enable_logging_to_queue_log=1`을 통해 테이블 로깅을 활성화합니다.

인트로스펙션 기능은 몇 가지 뚜렷한 차이점을 제외하면 [S3Queue table engine](/engines/table-engines/integrations/s3queue#introspection)과 동일합니다:

1. 서버 버전이 25.1 이상인 경우 큐의 메모리 상 상태를 위해 `system.azure_queue_metadata_cache`를 사용합니다. 더 이전 버전에서는 `system.s3queue_metadata_cache`를 사용합니다 (이 경우 `azure` 테이블에 대한 정보도 포함됩니다).
2. 기본 ClickHouse 구성에서 `system.azure_queue_log`를 활성화합니다. 예:

```xml
  <azure_queue_log>
    <database>system</database>
    <table>azure_queue_log</table>
  </azure_queue_log>
```

이 영구 테이블은 처리된 파일과 실패한 파일에 대해 `system.s3queue_metadata_cache`와 동일한 정보를 보관합니다.

테이블의 구조는 다음과 같습니다.

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
COMMENT 'Contains logging entries with the information files processes by S3Queue engine.'

```

예:

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
