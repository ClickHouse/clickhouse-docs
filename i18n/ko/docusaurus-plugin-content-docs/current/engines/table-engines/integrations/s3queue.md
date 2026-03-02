---
description: '이 엔진은 Amazon S3 생태계와의 통합을 제공하며 스트리밍 방식의 가져오기를 지원합니다. Kafka 및 RabbitMQ 엔진과 유사하지만 S3 특화 기능을 제공합니다.'
sidebar_label: 'S3Queue'
sidebar_position: 181
slug: /engines/table-engines/integrations/s3queue
title: 'S3Queue 테이블 엔진'
doc_type: 'reference'
---

import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# S3Queue 테이블 엔진 \{#s3queue-table-engine\}

이 엔진은 [Amazon S3](https://aws.amazon.com/s3/) 생태계와의 통합을 제공하며 스트리밍 방식의 데이터 가져오기를 지원합니다. 이 엔진은 [Kafka](../../../engines/table-engines/integrations/kafka.md), [RabbitMQ](../../../engines/table-engines/integrations/rabbitmq.md) 엔진과 유사하지만, S3 전용 기능을 제공합니다.

[S3Queue 구현을 위한 원래 PR](https://github.com/ClickHouse/ClickHouse/pull/49086/files#diff-e1106769c9c8fbe48dd84f18310ef1a250f2c248800fde97586b3104e9cd6af8R183)에 있는 다음 메모를 이해하는 것이 중요합니다. `MATERIALIZED VIEW`가 엔진에 연결될 때, S3Queue Table Engine은 백그라운드에서 데이터를 수집하기 시작합니다.

## 테이블 생성 \{#creating-a-table\}

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
`24.7` 이전 버전에서는 `mode`, `after_processing`, `keeper_path`를 제외한 모든 설정에 `s3queue_` 접두사를 사용해야 합니다.
:::

**엔진 매개변수**

`S3Queue` 매개변수는 `S3` 테이블 엔진이 지원하는 매개변수와 동일합니다. 매개변수 섹션은 [여기](../../../engines/table-engines/integrations/s3.md#parameters)를 참조하십시오.

**예시**

```sql
CREATE TABLE s3queue_engine_table (name String, value UInt32)
ENGINE=S3Queue('https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*', 'CSV', 'gzip')
SETTINGS
    mode = 'unordered';
```

이름이 있는 컬렉션 사용:

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


## Settings \{#settings\}

테이블에 대해 구성된 설정 목록을 확인하려면 `system.s3_queue_settings` 테이블을 사용합니다. ClickHouse 24.10 버전부터 사용할 수 있습니다.

:::note 설정 이름 (24.7+)
버전 24.7부터는 S3Queue 설정을 `s3queue_` 접두사 유무와 관계없이 지정할 수 있습니다.

- **최신 구문 (24.7+)**: `processing_threads_num`, `tracked_file_ttl_sec` 등
- **레거시 구문 (모든 버전)**: `s3queue_processing_threads_num`, `s3queue_tracked_file_ttl_sec` 등

두 형식 모두 24.7+에서 지원됩니다. 이 페이지의 예시는 접두사가 없는 최신 구문을 사용합니다.
:::

### Mode \{#mode\}

가능한 값:

- unordered — `unordered` 모드에서는 이미 처리된 모든 파일 집합을 ZooKeeper의 영구 노드(persistent node)로 추적합니다.
- ordered — `ordered` 모드에서는 파일이 사전식(lexicographic) 순서로 처리됩니다. 즉, 이름이 'BBB'인 파일이 어느 시점에 처리된 이후에 이름이 'AA'인 파일이 버킷에 추가되면 해당 파일은 무시됩니다. 성공적으로 처리된 파일들 가운데 사전식 의미에서의 최대 이름과, 로딩에 실패하여 다시 시도할 파일들의 이름만 ZooKeeper에 저장됩니다.

기본값: 24.6 이전 버전에서는 `ordered`입니다. 24.6부터는 기본값이 없으며, 이 설정을 반드시 수동으로 지정해야 합니다. 이전 버전에서 생성된 테이블의 경우 호환성을 위해 기본값은 계속 `Ordered`로 유지됩니다.

### `after_processing` \{#after_processing\}

성공적으로 처리된 파일을 어떻게 처리할지 지정합니다.

가능한 값:

* keep
* delete
* move
* tag

기본값: `keep`.

`move`를 사용하는 경우 추가 설정이 필요합니다. 동일한 버킷 내에서 이동하는 경우 `after_processing_move_prefix`로 새로운 경로 프리픽스를 지정해야 합니다.

다른 S3 버킷으로 이동하려면 대상 버킷 URI를 `after_processing_move_uri`로, S3 자격 증명을 `after_processing_move_access_key_id` 및 `after_processing_move_secret_access_key`로 지정해야 합니다.

예시:

```sql
CREATE TABLE s3queue_engine_table (name String, value UInt32)
ENGINE=S3Queue('https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*', 'CSV', 'gzip')
SETTINGS
    mode = 'unordered',
    after_processing = 'move',
    after_processing_retries = 20,
    after_processing_move_prefix = 'dst_prefix',
    after_processing_move_uri = 'https://clickhouse-public-datasets.s3.amazonaws.com/dst-bucket',
    after_processing_move_access_key_id = 'test',
    after_processing_move_secret_access_key = 'test';
```

한 Azure 컨테이너에서 다른 Azure 컨테이너로 이동하려면 Blob Storage 연결 문자열을 `after_processing_move_connection_string`으로, 컨테이너 이름을 `after_processing_move_container`로 지정해야 합니다. 자세한 내용은 [AzureQueue 설정](../../../engines/table-engines/integrations/azure-queue.md#settings)을 참조하십시오.

태그를 적용하려면 태그 키와 값을 각각 `after_processing_tag_key` 및 `after_processing_tag_value`로 제공해야 합니다.


### `after_processing_retries` \{#after_processing_retries\}

요청된 후처리 작업을 포기하기 전에 수행하는 재시도 횟수입니다.

가능한 값:

- 음수가 아닌 정수.

기본값: `10`.

### `after_processing_move_access_key_id` \{#after_processing_move_access_key_id\}

대상 위치가 다른 S3 버킷인 경우, 성공적으로 처리된 파일을 이동할 S3 버킷의 Access Key ID입니다.

가능한 값:

- String.

기본값: 빈 문자열.

### `after_processing_move_prefix` \{#after_processing_move_prefix\}

정상적으로 처리된 파일을 이동할 경로 접두사입니다. 동일한 버킷 내에서의 이동과 다른 버킷으로의 이동 모두에 적용됩니다.

가능한 값:

- String.

기본값: 빈 문자열.

### `after_processing_move_secret_access_key` \{#after_processing_move_secret_access_key\}

대상 위치가 다른 S3 버킷인 경우, 성공적으로 처리된 파일을 이동할 대상 S3 버킷의 Secret Access Key입니다.

가능한 값:

- String.

기본값: 빈 문자열.

### `after_processing_move_uri` \{#after_processing_move_uri\}

목적지가 다른 S3 버킷인 경우, 성공적으로 처리된 파일을 이동할 S3 버킷의 URI입니다.

가능한 값:

- String.

기본값: 빈 문자열.

### `after_processing_tag_key` \{#after_processing_tag_key\}

`after_processing='tag'`인 경우, 성공적으로 처리된 파일에 태그를 지정할 때 사용할 태그 키입니다.

가능한 값:

- String.

기본값: 빈 문자열.

### `after_processing_tag_value` \{#after_processing_tag_value\}

`after_processing='tag'`인 경우, 성공적으로 처리된 파일에 태그를 지정할 때 사용할 태그 값입니다.

가능한 값:

- String.

기본값: 빈 문자열.

### `keeper_path` \{#keeper_path\}

ZooKeeper 내 큐 메타데이터에 대한 경로입니다. 명시적으로 지정하지 않으면 ClickHouse는 `s3queue_default_zookeeper_path`, 데이터베이스 UUID, 테이블 UUID를 사용해 경로를 구성합니다. 절대 경로 값(`/`로 시작하는 값)은 그대로 사용되며, 상대 경로 값은 설정된 접두 경로(prefix)에 이어서 추가됩니다. `{database}`, `{uuid}`와 같은 매크로는 엔진이 ZooKeeper에 연결하기 전에 치환됩니다.

보조 ZooKeeper 클러스터를 사용하려면 값 앞에 설정된 이름을 접두사로 붙입니다. 예: `analytics_keeper:/clickhouse/queue/orders`. 이 이름은 `<auxiliary_zookeepers>`에 존재해야 하며, 그렇지 않으면 엔진이 `Unknown auxiliary ZooKeeper name ...` 오류를 반환합니다. 접두사를 포함한 전체 문자열은 `SHOW CREATE TABLE`에 그대로 보존되므로, 해당 구문을 그대로 복제하여 사용할 수 있습니다.

허용되는 값:

- 문자열.

기본값: `/`.

### `loading_retries` \{#loading_retries\}

지정된 횟수만큼 파일 로드를 재시도합니다. 기본적으로는 재시도를 하지 않습니다.
가능한 값:

- 양의 정수.

기본값: `0`.

### `processing_threads_num` \{#processing_threads_num\}

처리를 수행할 스레드 수입니다. `Unordered` 모드에만 적용됩니다.

기본값: CPU 수 또는 16입니다.

### `parallel_inserts` \{#parallel_inserts\}

기본적으로 `processing_threads_num`은 하나의 `INSERT`만 생성하므로, 파일 다운로드와 파싱만 여러 스레드에서 수행합니다.
하지만 이로 인해 병렬성이 제한되므로, 더 높은 처리량을 위해 `parallel_inserts=true`를 사용하는 것이 좋습니다. 이렇게 하면 데이터를 병렬로 삽입할 수 있습니다(단, MergeTree 패밀리에서 생성되는 데이터 파트의 수가 더 많아진다는 점을 유의하십시오).

:::note
여러 개의 `INSERT`는 `max_process*_before_commit` 설정을 준수하여 생성됩니다.
:::

기본값: `false`.

### `enable_logging_to_s3queue_log` \{#enable_logging_to_s3queue_log\}

`system.s3queue_log`에 로그를 기록하도록 활성화합니다.

기본값: `0`.

### `polling_min_timeout_ms` \{#polling_min_timeout_ms\}

ClickHouse가 다음 폴링 시도를 하기 전에 대기하는 최소 시간을 밀리초 단위로 지정합니다.

유효한 값:

- 양의 정수.

기본값: `1000`.

### `polling_max_timeout_ms` \{#polling_max_timeout_ms\}

ClickHouse가 다음 폴링을 시도하기 전에 대기하는 최대 시간(밀리초)을 정의합니다.

가능한 값:

- 양의 정수.

기본값: `10000`.

### `polling_backoff_ms` \{#polling_backoff_ms\}

새 파일이 발견되지 않았을 때, 이전 폴링 간격에 추가되는 대기 시간을 결정합니다. 다음 폴링은 이전 간격과 이 backoff 값을 더한 값과 최대 간격 중 더 작은 값이 지난 후에 수행됩니다.

가능한 값:

- 양의 정수.

기본값: `0`.

### `tracked_files_limit` \{#tracked_files_limit\}

'unordered' 모드가 사용되는 경우 ZooKeeper 노드 수를 제한할 수 있습니다. 'ordered' 모드에서는 어떤 동작도 수행하지 않습니다.
제한에 도달하면 가장 오래전에 처리된 파일이 ZooKeeper 노드에서 삭제된 후 다시 처리됩니다.

가능한 값:

- 양의 정수.

기본값: `1000`.

### `tracked_file_ttl_sec` \{#tracked_file_ttl_sec\}

'unordered' 모드에서 처리된 파일을 ZooKeeper 노드에 저장할 최대 시간(초 단위)입니다(기본적으로는 무기한 저장됩니다). 'ordered' 모드에서는 효과가 없습니다.
지정된 초 수가 지나면 파일이 다시 임포트됩니다.

가능한 값:

- 양의 정수입니다.

기본값: `0`.

### `cleanup_interval_min_ms` \{#cleanup_interval_min_ms\}

'Ordered' 모드에서 사용합니다. 추적 중인 파일 TTL과 최대 추적 파일 Set 유지를 담당하는 백그라운드 작업에 대해, 재스케줄링 간격의 최소 한계값을 정의합니다.

기본값: `10000`.

### `cleanup_interval_max_ms` \{#cleanup_interval_max_ms\}

'Ordered' 모드에서 사용합니다. 추적 중인 파일의 TTL과 최대 추적 파일 Set을 유지 관리하는 백그라운드 태스크의 재스케줄 간격에 대한 최대 한계를 정의합니다.

기본값: `30000`.

### `buckets` \{#buckets\}

'Ordered' 모드에서 사용하는 설정입니다. `24.6`부터 지원됩니다. 동일한 Keeper 메타데이터 디렉터리를 사용하는 S3Queue 테이블의 레플리카가 여러 개 있는 경우, `buckets` 값은 레플리카 개수 이상으로 설정해야 합니다. `processing_threads` 설정도 함께 사용하는 경우에는, `S3Queue` 처리의 실제 병렬성을 결정하는 값이므로 `buckets` 설정 값을 더 크게 늘리는 것이 좋습니다.

### `use_persistent_processing_nodes` \{#use_persistent_processing_nodes\}

기본적으로 S3Queue 테이블은 항상 휘발성 처리 노드(ephemeral processing nodes)를 사용합니다. 이 경우 S3Queue가 파일 처리를 시작한 이후 처리된 파일을 ZooKeeper에 커밋하기 전에 ZooKeeper 세션이 만료되면 데이터가 중복될 수 있습니다. 이 설정은 Keeper 세션이 만료되더라도 중복이 발생할 가능성을 서버가 제거하도록 강제합니다.

### `persistent_processing_nodes_ttl_seconds` \{#persistent_processing_nodes_ttl_seconds\}

서버가 비정상적으로 종료된 경우 `use_persistent_processing_nodes`가 활성화되어 있으면 처리 노드가 제거되지 않고 남아 있을 수 있습니다. 이 설정은 이러한 처리 노드를 안전하게 정리(삭제)할 수 있는 기간을 정의합니다.

기본값: `3600` (1시간).

## S3 관련 설정 \{#s3-settings\}

이 엔진은 모든 S3 관련 설정을 지원합니다. S3 설정에 대한 자세한 내용은 [여기](../../../engines/table-engines/integrations/s3.md)를 참조하십시오.

## S3 역할 기반 액세스 \{#s3-role-based-access\}

<ScalePlanFeatureBadge feature="S3 Role-Based Access" />

`s3Queue` 테이블 엔진은 역할 기반 액세스를 지원합니다.
버킷에 접근하기 위한 역할을 구성하는 방법은 [여기](/cloud/data-sources/secure-s3) 문서를 참조하십시오.

역할 구성이 완료되면, 다음과 같이 `extra_credentials` 매개변수를 통해 `roleARN`을 전달할 수 있습니다.

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


## S3Queue ordered 모드 \{#ordered-mode\}

`S3Queue` 처리 모드는 ZooKeeper에 저장되는 메타데이터 양을 줄일 수 있지만, 시간상 나중에 추가되는 파일은 알파벳과 숫자 순으로 더 뒤에 오는 이름을 가져야 한다는 제한이 있습니다.

`S3Queue` `ordered` 모드는 `unordered` 모드와 마찬가지로 `(s3queue_)processing_threads_num` 설정(`s3queue_` 접두사는 선택사항)을 지원하며, 이 설정을 통해 서버에서 `S3` 파일을 로컬로 처리하는 스레드 개수를 제어할 수 있습니다.
추가로, `ordered` 모드는 「논리 스레드」를 의미하는 `(s3queue_)buckets`라는 또 다른 설정을 도입합니다. 이는 분산 시나리오에서 `S3Queue` 테이블 레플리카가 여러 서버에 있을 때 이 설정이 처리 단위의 개수를 정의한다는 뜻입니다. 예를 들어, 각 `S3Queue` 레플리카의 각 처리 스레드는 처리를 위해 특정 `bucket`을 잠그려고 시도하며, 각 `bucket`은 파일 이름의 해시값에 따라 특정 파일들에 매핑됩니다. 따라서 분산 시나리오에서는 `(s3queue_)buckets` 설정 값을 레플리카 개수 이상으로 설정하는 것이 강력히 권장됩니다. `bucket` 개수가 레플리카 개수보다 많은 것은 문제가 되지 않습니다. 가장 최적의 시나리오는 `(s3queue_)buckets` 설정 값이 `number_of_replicas`와 `(s3queue_)processing_threads_num`의 곱과 같도록 하는 것입니다.
`(s3queue_)processing_threads_num` 설정은 버전 `24.6` 이전에서는 사용을 권장하지 않습니다.
`(s3queue_)buckets` 설정은 버전 `24.6`부터 사용할 수 있습니다.

## S3Queue 테이블 엔진에서의 SELECT \{#select\}

S3Queue 테이블에서는 기본적으로 SELECT 쿼리가 금지됩니다. 이는 데이터가 한 번만 읽힌 뒤 큐에서 제거되는 일반적인 큐 패턴을 따르기 때문입니다. 실수로 인한 데이터 손실을 방지하기 위해 SELECT가 금지되어 있습니다.
그러나 때때로 SELECT를 사용하는 것이 유용할 수 있습니다. 이를 위해서는 `stream_like_engine_allow_direct_select` 설정 값을 `True`로 지정해야 합니다.
S3Queue 엔진에는 SELECT 쿼리를 위한 전용 설정인 `commit_on_select`가 있습니다. 큐에서 데이터를 읽은 후에도 보존하려면 이 값을 `False`로 두고, 읽은 후 제거하려면 `True`로 설정합니다.

## 설명 \{#description\}

`SELECT`는 각 파일을 한 번만 가져올 수 있기 때문에(디버깅 목적을 제외하면) 스트리밍 가져오기에는 그다지 유용하지 않습니다. 대신 [materialized views](../../../sql-reference/statements/create/view.md)를 사용하여 실시간 처리 흐름을 구성하는 것이 더 실용적입니다. 이를 위해서는:

1. 지정된 S3 경로에서 데이터를 소비하는 테이블을 엔진을 사용해 생성하고, 이를 데이터 스트림으로 간주합니다.
2. 원하는 구조를 가진 테이블을 생성합니다.
3. 엔진이 읽어 들인 데이터를 변환하여 미리 생성한 테이블에 저장하는 materialized view를 생성합니다.

`MATERIALIZED VIEW`를 엔진과 연결하면, 백그라운드에서 데이터를 수집하기 시작합니다.

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


## 가상 컬럼 \{#virtual-columns\}

- `_path` — 파일의 경로.
- `_file` — 파일의 이름.
- `_size` — 파일의 크기.
- `_time` — 파일이 생성된 시간.

가상 컬럼에 대한 자세한 내용은 [여기](../../../engines/table-engines/index.md#table_engines-virtual_columns)를 참조하십시오.

## 경로의 와일드카드 \{#wildcards-in-path\}

`path` 인수는 Bash 스타일의 와일드카드를 사용하여 여러 파일을 지정할 수 있습니다. 처리되려면 파일이 실제로 존재해야 하며 전체 경로 패턴과 일치해야 합니다. 파일 목록은 `CREATE` 시점이 아니라 `SELECT` 시점에 결정됩니다.

- `*` — 비어 있는 문자열을 포함하여 `/`를 제외한 임의의 문자 0개 이상을 대체합니다.
- `**` — 비어 있는 문자열을 포함하여 `/`를 포함한 임의의 문자 0개 이상을 대체합니다.
- `?` — 임의의 단일 문자를 대체합니다.
- `{some_string,another_string,yet_another_one}` — `'some_string', 'another_string', 'yet_another_one'` 중 하나의 문자열을 대체합니다.
- `{N..M}` — N과 M을 포함하여 N에서 M까지 범위의 임의의 숫자를 대체합니다. N과 M에는 `000..078`과 같이 선행 0이 올 수 있습니다.

`{}`를 사용하는 구성은 [remote](../../../sql-reference/table-functions/remote.md) 테이블 함수와 유사합니다.

## 제한 사항 \{#limitations\}

1. 행이 중복될 수 있는 경우:

- 파일 처리 도중 파싱 예외가 발생했고 `s3queue_loading_retries`를 통해 재시도가 활성화된 경우

- 여러 서버에서 동일한 Zookeeper 경로를 가리키도록 `S3Queue`를 구성했는데, 한 서버가 처리된 파일을 커밋하기 전에 Keeper 세션이 만료되어, 첫 번째 서버가 파일을 일부 또는 전부 처리했음에도 다른 서버가 해당 파일 처리를 이어받는 경우. 다만 `use_persistent_processing_nodes = 1`인 경우, 이 동작은 버전 25.8부터는 더 이상 발생하지 않습니다.

- 비정상적인 서버 종료

2. 여러 서버에서 동일한 Zookeeper 경로를 가리키도록 `S3Queue`를 구성하고 `Ordered` 모드를 사용하는 경우, `s3queue_loading_retries`는 동작하지 않습니다. 이는 곧 수정될 예정입니다.

## 인트로스펙션(Introspection) \{#introspection\}

인트로스펙션을 위해 `system.s3queue_metadata_cache` 상태를 저장하지 않는(stateless) 테이블과 `system.s3queue_log` 영구적으로 저장되는(persistent) 테이블을 사용합니다.

1. `system.s3queue_metadata_cache`. 이 테이블은 영구적으로 저장되지 않으며, `S3Queue`의 메모리 내 상태를 보여 줍니다. 현재 어떤 파일이 처리 중인지, 어떤 파일이 처리되었거나 실패했는지를 표시합니다.

```sql
┌─statement──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE TABLE system.s3queue_metadata_cache
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

예:

```sql

SELECT *
FROM system.s3queue_metadata_cache

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

2. `system.s3queue_log`. 영구 테이블입니다. `processed` 및 `failed` 파일에 대해 `system.s3queue_metadata_cache`와 동일한 정보를 저장합니다.

이 테이블의 구조는 다음과 같습니다.

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
ORDER BY (event_date, event_time) │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

`system.s3queue_log`를 사용하려면 서버 설정 파일에서 해당 구성을 정의해야 합니다:

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
