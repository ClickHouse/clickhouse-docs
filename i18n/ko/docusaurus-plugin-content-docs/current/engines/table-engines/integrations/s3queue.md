---
'description': '이 엔진은 Amazon S3 생태계와 통합을 제공하고 스트리밍 수입을 허용합니다. Kafka 및 RabbitMQ 엔진과
  유사하지만 S3 전용 기능을 제공합니다.'
'sidebar_label': 'S3Queue'
'sidebar_position': 181
'slug': '/engines/table-engines/integrations/s3queue'
'title': 'S3Queue 테이블 엔진'
'doc_type': 'reference'
---

import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# S3Queue 테이블 엔진

이 엔진은 [Amazon S3](https://aws.amazon.com/s3/) 생태계와의 통합을 제공하며 스트리밍 가져오기를 허용합니다. 이 엔진은 [Kafka](../../../engines/table-engines/integrations/kafka.md) 및 [RabbitMQ](../../../engines/table-engines/integrations/rabbitmq.md) 엔진과 유사하지만 S3 전용 기능을 제공합니다.

다음의 [S3Queue 구현에 대한 원래 PR에서의 노트](https://github.com/ClickHouse/ClickHouse/pull/49086/files#diff-e1106769c9c8fbe48dd84f18310ef1a250f2c248800fde97586b3104e9cd6af8R183)를 이해하는 것이 중요합니다: `MATERIALIZED VIEW`가 엔진에 결합되면 S3Queue 테이블 엔진은 백그라운드에서 데이터를 수집하기 시작합니다.

## 테이블 생성 {#creating-a-table}

```sql
CREATE TABLE s3_queue_engine_table (name String, value UInt32)
    ENGINE = S3Queue(path, [NOSIGN, | aws_access_key_id, aws_secret_access_key,] format, [compression], [headers])
    [SETTINGS]
    [mode = '',]
    [after_processing = 'keep',]
    [keeper_path = '',]
    [loading_retries = 0,]
    [processing_threads_num = 16,]
    [parallel_inserts = false,]
    [enable_logging_to_queue_log = true,]
    [last_processed_path = "",]
    [tracked_files_limit = 1000,]
    [tracked_file_ttl_sec = 0,]
    [polling_min_timeout_ms = 1000,]
    [polling_max_timeout_ms = 10000,]
    [polling_backoff_ms = 0,]
    [cleanup_interval_min_ms = 10000,]
    [cleanup_interval_max_ms = 30000,]
    [buckets = 0,]
    [list_objects_batch_size = 1000,]
    [enable_hash_ring_filtering = 0,]
    [max_processed_files_before_commit = 100,]
    [max_processed_rows_before_commit = 0,]
    [max_processed_bytes_before_commit = 0,]
    [max_processing_time_sec_before_commit = 0,]
```

:::warning
`24.7` 이전에는 `mode`, `after_processing`, 및 `keeper_path`를 제외한 모든 설정에 대해 `s3queue_` 접두사를 사용하는 것이 필요합니다.
:::

**엔진 매개변수**

`S3Queue` 매개변수는 `S3` 테이블 엔진과 동일합니다. 매개변수 섹션에 대한 자세한 내용은 [여기](../../../engines/table-engines/integrations/s3.md#parameters)를 참조하십시오.

**예제**

```sql
CREATE TABLE s3queue_engine_table (name String, value UInt32)
ENGINE=S3Queue('https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*', 'CSV', 'gzip')
SETTINGS
    mode = 'unordered';
```

명명된 컬렉션 사용:

```xml
<clickhouse>
    <named_collections>
        <s3queue_conf>
            <url>'https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*</url>
            <access_key_id>test<access_key_id>
            <secret_access_key>test</secret_access_key>
        </s3queue_conf>
    </named_collections>
</clickhouse>
```

```sql
CREATE TABLE s3queue_engine_table (name String, value UInt32)
ENGINE=S3Queue(s3queue_conf, format = 'CSV', compression_method = 'gzip')
SETTINGS
    mode = 'ordered';
```

## 설정 {#settings}

테이블에 대해 구성된 설정 목록을 가져오려면 `system.s3_queue_settings` 테이블을 사용하십시오. `24.10`부터 사용 가능합니다.

### 모드 {#mode}

가능한 값:

- unordered — 무작위 모드에서는 ZooKeeper에서 영구 노드와 함께 모든 이미 처리된 파일의 집합이 추적됩니다.
- ordered — 정렬된 모드에서는 파일이 사전 순서로 처리됩니다. 즉, 'BBB'라는 이름의 파일이 어느 시점에서 처리되고 나중에 'AA'라는 이름의 파일이 버킷에 추가되면 무시됩니다. 성공적으로 소비된 파일의 최대 이름(사전적 의미)과 실패한 로딩 시도를 재시도할 파일의 이름만 ZooKeeper에 저장됩니다.

기본 값: `ordered` (24.6 이전 버전). 24.6부터 기본 값이 없으며, 설정은 수동으로 지정해야 합니다. 이전 버전에 생성된 테이블의 경우 호환성을 위해 기본 값은 `Ordered`로 유지됩니다.

### `after_processing` {#after_processing}

처리 성공 후 파일을 삭제하거나 유지합니다.
가능한 값:

- keep.
- delete.

기본 값: `keep`.

### `keeper_path` {#keeper_path}

ZooKeeper의 경로는 테이블 엔진 설정으로 지정할 수 있으며, 기본 경로는 전역 구성에서 제공된 경로와 테이블 UUID를 기반으로 형성될 수 있습니다.
가능한 값:

- 문자열.

기본 값: `/`.

### `s3queue_loading_retries` {#loading_retries}

지정된 횟수만큼 파일 로딩을 재시도합니다. 기본적으로 재시도가 없습니다.
가능한 값:

- 양의 정수.

기본 값: `0`.

### `s3queue_processing_threads_num` {#processing_threads_num}

처리를 수행할 스레드 수. `Unordered` 모드에만 적용됩니다.

기본 값: CPU 수 또는 16.

### `s3queue_parallel_inserts` {#parallel_inserts}

기본적으로 `processing_threads_num`은 하나의 `INSERT`를 생성하므로 파일을 다운로드하고 여러 스레드에서 구문 분석만 수행합니다.
그러나 이는 병렬성을 제한하므로 더 나은 처리량을 위해 `parallel_inserts=true`를 사용하십시오. 이렇게 하면 데이터를 병렬로 삽입할 수 있습니다(하지만 이는 MergeTree 계열에 대해 생성된 데이터 파트 수가 더 많아짐을 의미합니다).

:::note
`INSERT`는 `max_process*_before_commit` 설정을 고려하여 생성됩니다.
:::

기본 값: `false`.

### `s3queue_enable_logging_to_s3queue_log` {#enable_logging_to_s3queue_log}

`system.s3queue_log`에 대한 로깅을 활성화합니다.

기본 값: `0`.

### `s3queue_polling_min_timeout_ms` {#polling_min_timeout_ms}

다음 폴링 시도 전에 ClickHouse가 기다리는 최소 시간을 밀리초 단위로 지정합니다.

가능한 값:

- 양의 정수.

기본 값: `1000`.

### `s3queue_polling_max_timeout_ms` {#polling_max_timeout_ms}

다음 폴링 시도를 시작하기 전에 ClickHouse가 기다리는 최대 시간을 밀리초 단위로 정의합니다.

가능한 값:

- 양의 정수.

기본 값: `10000`.

### `s3queue_polling_backoff_ms` {#polling_backoff_ms}

새 파일을 찾지 못할 경우 이전 폴링 간격에 추가되는 대기 시간을 결정합니다. 다음 폴링은 이전 간격과 이 백오프 값을 더한 합계 또는 최대 간격 중 더 낮은 값 후에 발생합니다.

가능한 값:

- 양의 정수.

기본 값: `0`.

### `s3queue_tracked_files_limit` {#tracked_files_limit}

'unordered' 모드를 사용하는 경우 Zookeeper 노드의 수를 제한할 수 있으며, 'ordered' 모드에는 영향을 미치지 않습니다.
제한에 도달하면 가장 오래된 처리된 파일이 ZooKeeper 노드에서 삭제되고 다시 처리됩니다.

가능한 값:

- 양의 정수.

기본 값: `1000`.

### `s3queue_tracked_file_ttl_sec` {#tracked_file_ttl_sec}

'unordered' 모드에서 ZooKeeper 노드에 처리된 파일을 저장하는 최대 초 수(기본적으로 영구적으로 저장됨). 지정된 초 수가 경과한 후 파일이 재수입됩니다.

가능한 값:

- 양의 정수.

기본 값: `0`.

### `s3queue_cleanup_interval_min_ms` {#cleanup_interval_min_ms}

'Ordered' 모드. 추적된 파일 TTL 및 최대 추적 파일 집합을 유지하는 배경 작업에 대한 재일정 간격의 최소 경계를 정의합니다.

기본 값: `10000`.

### `s3queue_cleanup_interval_max_ms` {#cleanup_interval_max_ms}

'Ordered' 모드. 추적된 파일 TTL 및 최대 추적 파일 집합을 유지하는 배경 작업에 대한 재일정 간격의 최대 경계를 정의합니다.

기본 값: `30000`.

### `s3queue_buckets` {#buckets}

'Ordered' 모드. `24.6`부터 사용 가능합니다. S3Queue 테이블의 여러 복제본이 동일한 메타데이터 디렉토리에서 작업하는 경우 `s3queue_buckets`의 값은 복제본 수와 같거나 그 이상이어야 합니다. 또한 `s3queue_processing_threads` 설정이 사용될 경우 `s3queue_buckets` 설정의 값을 더 증가시키는 것이 좋습니다. 이는 `S3Queue` 처리의 실제 병렬성을 정의하기 때문입니다.

### `use_persistent_processing_nodes` {#use_persistent_processing_nodes}

기본적으로 S3Queue 테이블은 항상 일시적인 처리 노드를 사용하였습니다. 이로 인해 ZooKeeper 세션이 만료되기 전에 S3Queue가 처리된 파일을 ZooKeeper에 커밋하면 데이터 중복이 발생할 수 있습니다. 이 설정은 서버가 만료된 keeper 세션의 경우 중복 가능성을 제거하도록 강제합니다.

### `persistent_processing_nodes_ttl_seconds` {#persistent_processing_nodes_ttl_seconds}

비정상적인 서버 종료의 경우, `use_persistent_processing_nodes`가 활성화된 경우, 제거되지 않은 처리 노드가 있을 수 있습니다. 이 설정은 이러한 처리 노드를 안전하게 정리할 수 있는 기간을 정의합니다.

기본 값: `3600` (1시간).

## S3 관련 설정 {#s3-settings}

엔진은 모든 S3 관련 설정을 지원합니다. S3 설정에 대한 자세한 내용은 [여기](../../../engines/table-engines/integrations/s3.md)를 참조하십시오.

## S3 역할 기반 액세스 {#s3-role-based-access}

<ScalePlanFeatureBadge feature="S3 Role-Based Access" />

s3Queue 테이블 엔진은 역할 기반 액세스를 지원합니다. 버킷에 액세스하는 역할을 구성하는 단계에 대한 자세한 내용은 [여기](//cloud/data-sources/secure-s3)를 참조하십시오.

역할이 구성되면, `extra_credentials` 매개변수를 통해 `roleARN`을 전달할 수 있습니다. 예시는 다음과 같습니다:
```sql
CREATE TABLE s3_table
(
    ts DateTime,
    value UInt64
)
ENGINE = S3Queue(
                'https://<your_bucket>/*.csv', 
                extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/<your_role>')
                ,'CSV')
SETTINGS 
    ...
```

## S3Queue 정렬 모드 {#ordered-mode}

`S3Queue` 처리 모드는 ZooKeeper에 저장된 메타데이터를 줄일 수 있지만, 시간에 따라 나중에 추가된 파일은 알파벳순으로 더 큰 이름을 가져야 한다는 제한이 있습니다.

`S3Queue`의 `ordered` 모드는 `unordered`와 마찬가지로 `(s3queue_)processing_threads_num` 설정을 지원하며, 이는 서버에서 로컬로 `S3` 파일을 처리할 스레드 수를 제어하는 데 사용됩니다.
또한 `ordered` 모드는 "논리적 스레드"를 의미하는 `(s3queue_)buckets`라는 또 다른 설정을 도입합니다. 이는 여러 서버가 `S3Queue` 테이블의 복제본을 가지고 있는 분산 시나리오에서 처리 단위의 수를 정의합니다. 예를 들어, 각 `S3Queue` 복제본의 각 처리 스레드는 특정 파일 이름의 해시에 의해 특정 파일에 할당된 `bucket`을 처리하려고 시도합니다. 따라서, 분산 시나리오에서는 `(s3queue_)buckets` 설정이 복제본 수와 같거나 더 크게 설정되는 것이 강력히 권장됩니다. 더 많은 버킷 수를 가지는 것은 괜찮습니다. 가장 최적의 시나리오는 `(s3queue_)buckets` 설정이 `number_of_replicas`와 `(s3queue_)processing_threads_num`의 곱과 같도록 하는 것입니다.
`(s3queue_)processing_threads_num` 설정은 `24.6` 이전 버전에서는 사용하지 않는 것이 좋습니다.
`(s3queue_)buckets` 설정은 `24.6` 버전부터 사용할 수 있습니다.

## 설명 {#description}

`SELECT`는 스트리밍 가져오기에 그다지 유용하지 않으며(디버깅을 제외하고), 각 파일은 한 번만 가져올 수 있습니다. 실제로 [물리화된 뷰](../../../sql-reference/statements/create/view.md)를 사용하여 실시간 스레드를 생성하는 것이 더 실용적입니다. 이를 위해:

1. S3의 지정된 경로에서 소비하기 위해 엔진을 사용하여 테이블을 생성하고 이를 데이터 스트림으로 간주합니다.
2. 원하는 구조의 테이블을 생성합니다.
3. 엔진에서 데이터를 변환하고 이전에 생성된 테이블에 넣는 물리화된 뷰를 생성합니다.

`MATERIALIZED VIEW`가 엔진에 결합되면 백그라운드에서 데이터 수집을 시작합니다.

예시:

```sql
CREATE TABLE s3queue_engine_table (name String, value UInt32)
  ENGINE=S3Queue('https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*', 'CSV', 'gzip')
  SETTINGS
      mode = 'unordered';

CREATE TABLE stats (name String, value UInt32)
  ENGINE = MergeTree() ORDER BY name;

CREATE MATERIALIZED VIEW consumer TO stats
  AS SELECT name, value FROM s3queue_engine_table;

SELECT * FROM stats ORDER BY name;
```

## 가상 컬럼 {#virtual-columns}

- `_path` — 파일 경로.
- `_file` — 파일 이름.
- `_size` — 파일 크기.
- `_time` — 파일 생성 시간.

가상 컬럼에 대한 자세한 내용은 [여기](../../../engines/table-engines/index.md#table_engines-virtual_columns)를 참조하십시오.

## 경로의 와일드카드 {#wildcards-in-path}

`path` 인수는 bash와 유사한 와일드카드를 사용하여 여러 파일을 지정할 수 있습니다. 처리될 파일은 존재해야 하며 전체 경로 패턴과 일치해야 합니다. 파일 목록은 `SELECT` 동안 결정됩니다( `CREATE` 순간이 아님).

- `*` — 빈 문자열을 포함하여 '/'를 제외한 모든 문자의 수를 대체합니다.
- `**` — 빈 문자열을 포함하여 모든 문자의 수를 대체하며 '/'도 포함합니다.
- `?` — 단일 문자를 대체합니다.
- `{some_string,another_string,yet_another_one}` — 문자열 `'some_string', 'another_string', 'yet_another_one'` 중 하나를 대체합니다.
- `{N..M}` — N에서 M까지의 범위의 모든 숫자를 대체합니다. N과 M은 선행 0을 가질 수 있습니다. 예: `000..078`.

`{}`를 사용한 구성은 [remote](../../../sql-reference/table-functions/remote.md) 테이블 함수와 유사합니다.

## 제한 사항 {#limitations}

1. 중복 행은 다음과 같은 경우에 발생할 수 있습니다:

- 파일 처리 중 구문 분석 중 예외가 발생하고 `s3queue_loading_retries`가 활성화된 경우;

- `S3Queue`가 동일한 경로의 여러 서버에 구성되어 있고 하나의 서버가 처리된 파일을 커밋하기 전에 keeper 세션이 만료되면, 이는 첫 번째 서버에 의해 부분적으로 또는 완전히 처리된 파일의 처리를 다른 서버가 맡게 될 수 있습니다. 그러나 `use_persistent_processing_nodes = 1`인 경우 25.8 버전 이후로는 사실이 아닙니다.

- 비정상적인 서버 종료.

2. `S3Queue`가 동일한 경로의 여러 서버에 구성되어 있고 `Ordered` 모드가 사용되면 `s3queue_loading_retries`는 작동하지 않습니다. 이는 곧 수정될 예정입니다.

## 내부 조사 {#introspection}

내부 조사를 위해 `system.s3queue` 비상태 테이블과 `system.s3queue_log` 지속 테이블을 사용하십시오.

1. `system.s3queue`. 이 테이블은 지속적이지 않으며 `S3Queue`의 메모리 내 상태를 보여줍니다: 현재 처리 중인 파일, 처리된 파일 또는 실패한 파일.

```sql
┌─statement──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE TABLE system.s3queue
(
    `database` String,
    `table` String,
    `file_name` String,
    `rows_processed` UInt64,
    `status` String,
    `processing_start_time` Nullable(DateTime),
    `processing_end_time` Nullable(DateTime),
    `ProfileEvents` Map(String, UInt64)
    `exception` String
)
ENGINE = SystemS3Queue
COMMENT 'Contains in-memory state of S3Queue metadata and currently processed rows per file.' │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

예시:

```sql

SELECT *
FROM system.s3queue

Row 1:
──────
zookeeper_path:        /clickhouse/s3queue/25ea5621-ae8c-40c7-96d0-cec959c5ab88/3b3f66a1-9866-4c2e-ba78-b6bfa154207e
file_name:             wikistat/original/pageviews-20150501-030000.gz
rows_processed:        5068534
status:                Processed
processing_start_time: 2023-10-13 13:09:48
processing_end_time:   2023-10-13 13:10:31
ProfileEvents:         {'ZooKeeperTransactions':3,'ZooKeeperGet':2,'ZooKeeperMulti':1,'SelectedRows':5068534,'SelectedBytes':198132283,'ContextLock':1,'S3QueueSetFileProcessingMicroseconds':2480,'S3QueueSetFileProcessedMicroseconds':9985,'S3QueuePullMicroseconds':273776,'LogTest':17}
exception:
```

2. `system.s3queue_log`. 지속 테이블입니다. `system.s3queue`와 동일한 정보를 가지지만 `processed` 및 `failed` 파일에 대한 것입니다.

테이블은 다음과 같은 구조를 가집니다:

```sql
SHOW CREATE TABLE system.s3queue_log

Query id: 0ad619c3-0f2a-4ee4-8b40-c73d86e04314

┌─statement──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE TABLE system.s3queue_log
(
    `event_date` Date,
    `event_time` DateTime,
    `table_uuid` String,
    `file_name` String,
    `rows_processed` UInt64,
    `status` Enum8('Processed' = 0, 'Failed' = 1),
    `processing_start_time` Nullable(DateTime),
    `processing_end_time` Nullable(DateTime),
    `ProfileEvents` Map(String, UInt64),
    `exception` String
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_date, event_time)
SETTINGS index_granularity = 8192 │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

`system.s3queue_log`를 사용하려면 서버 구성 파일에서 구성을 정의하십시오:

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
</s3queue_log>
```

예시:

```sql
SELECT *
FROM system.s3queue_log

Row 1:
──────
event_date:            2023-10-13
event_time:            2023-10-13 13:10:12
table_uuid:
file_name:             wikistat/original/pageviews-20150501-020000.gz
rows_processed:        5112621
status:                Processed
processing_start_time: 2023-10-13 13:09:48
processing_end_time:   2023-10-13 13:10:12
ProfileEvents:         {'ZooKeeperTransactions':3,'ZooKeeperGet':2,'ZooKeeperMulti':1,'SelectedRows':5112621,'SelectedBytes':198577687,'ContextLock':1,'S3QueueSetFileProcessingMicroseconds':1934,'S3QueueSetFileProcessedMicroseconds':17063,'S3QueuePullMicroseconds':5841972,'LogTest':17}
exception:
```
