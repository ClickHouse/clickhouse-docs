---
description: '이 엔진은 ClickHouse를 NATS와 통합하여 메시지 subject를 발행하거나
  구독하고, 새로운 메시지가 도착하는 대로 이를 처리할 수 있도록 합니다.'
sidebar_label: 'NATS'
sidebar_position: 140
slug: /engines/table-engines/integrations/nats
title: 'NATS 테이블 엔진'
doc_type: 'guide'
---

# NATS 테이블 엔진 \{#redisstreams-engine\}

이 엔진은 ClickHouse를 [NATS](https://nats.io/)와 통합합니다.

`NATS`를 사용하면 다음을 수행할 수 있습니다.

- 메시지 subject를 발행하거나 구독합니다.
- 새로운 메시지가 도착하는 대로 처리합니다.

## 테이블 생성 \{#creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = NATS SETTINGS
    nats_url = 'host:port',
    nats_subjects = 'subject1,subject2,...',
    nats_format = 'data_format'[,]
    [nats_schema = '',]
    [nats_num_consumers = N,]
    [nats_queue_group = 'group_name',]
    [nats_secure = false,]
    [nats_max_reconnect = N,]
    [nats_reconnect_wait = N,]
    [nats_server_list = 'host1:port1,host2:port2,...',]
    [nats_skip_broken_messages = N,]
    [nats_max_block_size = N,]
    [nats_flush_interval_ms = N,]
    [nats_username = 'user',]
    [nats_password = 'password',]
    [nats_token = 'clickhouse',]
    [nats_credential_file = '/var/nats_credentials',]
    [nats_startup_connect_tries = '5']
    [nats_max_rows_per_message = 1,]
    [nats_handle_error_mode = 'default']
```

필수 매개변수:

* `nats_url` – 호스트:포트 (예: `localhost:5672`).
* `nats_subjects` – 구독/발행할 NATS 테이블의 subject 목록입니다. `foo.*.bar` 또는 `baz.>`와 같은 와일드카드 subject를 지원합니다.
* `nats_format` – 메시지 포맷입니다. `JSONEachRow`와 같이 SQL `FORMAT` 함수와 동일한 표기법을 사용합니다. 자세한 내용은 [Formats](../../../interfaces/formats.md) 섹션을 참조하십시오.

선택 매개변수:

* `nats_schema` – 포맷이 스키마 정의를 필요로 하는 경우 사용해야 하는 매개변수입니다. 예를 들어 [Cap&#39;n Proto](https://capnproto.org/)는 스키마 파일의 경로와 루트 `schema.capnp:Message` 객체 이름을 필요로 합니다.
* `nats_stream` – NATS JetStream에 이미 존재하는 스트림 이름입니다.
* `nats_consumer` – NATS JetStream에 이미 존재하는 durable pull consumer의 이름입니다.
* `nats_num_consumers` – 테이블당 consumer 수입니다. 기본값: `1`. NATS core를 사용할 때 하나의 consumer 처리량이 부족한 경우 더 많은 consumer를 지정하십시오.
* `nats_queue_group` – NATS subscriber의 큐 그룹 이름입니다. 기본값은 테이블 이름입니다.
* `nats_max_reconnect` – 사용이 중단(deprecated)되었으며 효과가 없습니다. 재연결은 `nats_reconnect_wait` 타임아웃으로 계속 수행됩니다.
* `nats_reconnect_wait` – 각 재연결 시도 사이에 대기할 시간(밀리초)입니다. 기본값: `5000`.
* `nats_server_list` - 연결을 위한 서버 목록입니다. NATS 클러스터에 연결하기 위해 지정할 수 있습니다.
* `nats_skip_broken_messages` - 블록당 스키마와 호환되지 않는 메시지에 대해 NATS 메시지 파서가 허용하는 한도입니다. 기본값: `0`. `nats_skip_broken_messages = N`인 경우 파싱할 수 없는 N개의 NATS 메시지를 건너뜁니다(메시지 1개는 데이터 1행에 해당합니다).
* `nats_max_block_size` - NATS에서 데이터를 플러시하기 위해 poll로 수집되는 행 수입니다. 기본값: [max&#95;insert&#95;block&#95;size](../../../operations/settings/settings.md#max_insert_block_size).
* `nats_flush_interval_ms` - NATS에서 읽은 데이터를 플러시하기 위한 타임아웃입니다. 기본값: [stream&#95;flush&#95;interval&#95;ms](/operations/settings/settings#stream_flush_interval_ms).
* `nats_username` - NATS 사용자 이름입니다.
* `nats_password` - NATS 비밀번호입니다.
* `nats_token` - NATS 인증 토큰입니다.
* `nats_credential_file` - NATS 자격 증명 파일의 경로입니다.
* `nats_startup_connect_tries` - 시작 시 연결 시도 횟수입니다. 기본값: `5`.
* `nats_max_rows_per_message` — 행 기반 포맷에서 하나의 NATS 메시지에 기록되는 최대 행 수입니다(기본값: `1`).
* `nats_handle_error_mode` — NATS 엔진의 오류 처리 방식입니다. 가능한 값: default(메시지 파싱에 실패하면 예외를 발생시킵니다), stream(예외 메시지와 원시 메시지를 가상 컬럼 `_error` 및 `_raw_message`에 저장합니다).

SSL 연결:


보안 연결을 사용하려면 `nats_secure = 1`을 사용합니다.
인증서 검증은 `CLICKHOUSE_NATS_TLS_SECURE` 환경 변수로 제어됩니다.
인증서가 만료되었거나, self-signed이거나, 누락되었거나, 그 밖의 이유로 유효하지 않은 경우에는 `CLICKHOUSE_NATS_TLS_SECURE=0`으로 설정하여 검증을 비활성화합니다.

NATS 테이블에 쓰기:

테이블이 하나의 subject에서만 읽기를 수행하는 경우, 모든 insert는 동일한 subject로 발행됩니다.
그러나 테이블이 여러 subject에서 읽기를 수행하는 경우, 어느 subject로 발행할지 지정해야 합니다.
따라서 여러 subject에서 읽는 테이블에 데이터를 삽입할 때는 `stream_like_engine_insert_queue` 설정이 필요합니다.
테이블이 읽어 오는 subject 중 하나를 선택하여 해당 subject로 데이터를 발행할 수 있습니다. 예를 들면 다음과 같습니다:

```sql
  CREATE TABLE queue (
    key UInt64,
    value UInt64
  ) ENGINE = NATS
    SETTINGS nats_url = 'localhost:4444',
             nats_subjects = 'subject1,subject2',
             nats_format = 'JSONEachRow';

  INSERT INTO queue
  SETTINGS stream_like_engine_insert_queue = 'subject2'
  VALUES (1, 1);
```

또한 포맷 설정을 NATS 관련 설정과 함께 추가할 수 있습니다.

예시:

```sql
  CREATE TABLE queue (
    key UInt64,
    value UInt64,
    date DateTime
  ) ENGINE = NATS
    SETTINGS nats_url = 'localhost:4444',
             nats_subjects = 'subject1',
             nats_format = 'JSONEachRow',
             date_time_input_format = 'best_effort';
```

NATS 서버 설정은 ClickHouse 설정 파일에 추가할 수 있습니다.
보다 구체적으로는 NATS 엔진에 사용할 비밀번호를 추가할 수 있습니다:

```xml
<nats>
    <user>click</user>
    <password>house</password>
    <token>clickhouse</token>
</nats>
```


## 설명 \{#description\}

`SELECT`는 각 메시지를 한 번만 읽을 수 있기 때문에(디버깅을 제외하면) 메시지를 읽는 데에는 그다지 유용하지 않습니다. 대신 [materialized views](../../../sql-reference/statements/create/view.md)를 사용해 실시간 처리를 위한 흐름을 만드는 것이 더 실용적입니다. 이를 위해서는 다음과 같이 합니다.

1. 엔진을 사용해 NATS consumer를 생성하고 이를 데이터 스트림으로 취급합니다.
2. 원하는 구조를 가진 테이블을 생성합니다.
3. 엔진에서 나오는 데이터를 변환하여 미리 생성한 테이블에 넣는 materialized view를 생성합니다.

`MATERIALIZED VIEW`가 엔진에 연결되면 백그라운드에서 데이터를 수집하기 시작합니다. 이를 통해 NATS에서 지속적으로 메시지를 수신하고 `SELECT`를 사용하여 필요한 형식으로 변환할 수 있습니다.
하나의 NATS 테이블에는 원하는 만큼 materialized view를 연결할 수 있으며, 이들은 테이블에서 직접 데이터를 읽지 않고 새로운 레코드(블록 단위)를 수신합니다. 이렇게 하면 서로 다른 상세 수준(그룹화(집계) 여부에 따라)의 여러 테이블에 동시에 데이터를 기록할 수 있습니다.

예시:

```sql
  CREATE TABLE queue (
    key UInt64,
    value UInt64
  ) ENGINE = NATS
    SETTINGS nats_url = 'localhost:4444',
             nats_subjects = 'subject1',
             nats_format = 'JSONEachRow',
             date_time_input_format = 'best_effort';

  CREATE TABLE daily (key UInt64, value UInt64)
    ENGINE = MergeTree() ORDER BY key;

  CREATE MATERIALIZED VIEW consumer TO daily
    AS SELECT key, value FROM queue;

  SELECT key, value FROM daily ORDER BY key;
```

스트림 데이터 수신을 중단하거나 변환 로직을 변경하려면 materialized view를 분리(detach)하십시오:

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

`ALTER`를 사용해 대상 테이블을 변경해야 하는 경우, 대상 테이블과 뷰에서 들어오는 데이터 간에 불일치가 발생하지 않도록 구체화된 뷰(Materialized View)를 비활성화할 것을 권장합니다.


## 가상 컬럼 \{#virtual-columns\}

- `_subject` - NATS 메시지 subject입니다. 데이터 타입: `String`.

`nats_handle_error_mode='stream'`일 때 추가되는 가상 컬럼:

- `_raw_message` - 성공적으로 파싱되지 못한 원시 메시지입니다. 데이터 타입: `Nullable(String)`.
- `_error` - 파싱 실패 시 발생한 예외 메시지입니다. 데이터 타입: `Nullable(String)`.

주의: `_raw_message`와 `_error` 가상 컬럼은 파싱 중 예외가 발생한 경우에만 값이 설정되며, 메시지가 성공적으로 파싱되었을 때는 항상 `NULL`입니다.

## 데이터 형식 지원 \{#data-formats-support\}

NATS 엔진은 ClickHouse에서 지원하는 모든 [형식](../../../interfaces/formats.md)을 지원합니다.
하나의 NATS 메시지에 포함되는 행 수는 형식이 행 기반(row-based)인지 블록 기반(block-based)인지에 따라 달라집니다:

- 행 기반 형식의 경우, 하나의 NATS 메시지에 포함되는 행 수는 `nats_max_rows_per_message` 설정으로 제어할 수 있습니다.
- 블록 기반 형식의 경우 블록을 더 작은 단위로 나눌 수는 없지만, 하나의 블록에 포함되는 행 수는 일반 설정 [max_block_size](/operations/settings/settings#max_block_size)로 제어할 수 있습니다.

## JetStream 사용하기 \{#using-jetstream\}

NATS JetStream과 함께 NATS engine을 사용하기 전에 NATS 스트림과 durable pull consumer를 생성해 두어야 합니다. 이를 위해 예를 들어 [NATS CLI](https://github.com/nats-io/natscli) 패키지에 포함된 `nats` 유틸리티를 사용할 수 있습니다:

<details>
  <summary>스트림 생성</summary>

  ```bash
  $ nats stream add
  ? Stream Name stream_name
  ? Subjects stream_subject
  ? Storage file
  ? Replication 1
  ? Retention Policy Limits
  ? Discard Policy Old
  ? Stream Messages Limit -1
  ? Per Subject Messages Limit -1
  ? Total Stream Size -1
  ? Message TTL -1
  ? Max Message Size -1
  ? Duplicate tracking time window 2m0s
  ? Allow message Roll-ups No
  ? Allow message deletion Yes
  ? Allow purging subjects or the entire stream Yes
  Stream stream_name was created

  Information for Stream stream_name created 2025-10-03 14:12:51

                  Subjects: stream_subject
                  Replicas: 1
                   Storage: File

  Options:

                 Retention: Limits
           Acknowledgments: true
            Discard Policy: Old
          Duplicate Window: 2m0s
                Direct Get: true
         Allows Msg Delete: true
              Allows Purge: true
    Allows Per-Message TTL: false
            Allows Rollups: false

  Limits:

          Maximum Messages: unlimited
       Maximum Per Subject: unlimited
             Maximum Bytes: unlimited
               Maximum Age: unlimited
      Maximum Message Size: unlimited
         Maximum Consumers: unlimited

  State:

                  Messages: 0
                     Bytes: 0 B
            First Sequence: 0
             Last Sequence: 0
          Active Consumers: 0
  ```
</details>

<details>
  <summary>durable pull consumer 생성</summary>

  ```bash
  $ nats consumer add
  ? Select a Stream stream_name
  ? Consumer name consumer_name
  ? Delivery target (empty for Pull Consumers) 
  ? Start policy (all, new, last, subject, 1h, msg sequence) all
  ? Acknowledgment policy explicit
  ? Replay policy instant
  ? Filter Stream by subjects (blank for all) 
  ? Maximum Allowed Deliveries -1
  ? Maximum Acknowledgments Pending 0
  ? Deliver headers only without bodies No
  ? Add a Retry Backoff Policy No
  Information for Consumer stream_name > consumer_name created 2025-10-03T14:13:51+03:00

  Configuration:

                      Name: consumer_name
                 Pull Mode: true
            Deliver Policy: All
                Ack Policy: Explicit
                  Ack Wait: 30.00s
             Replay Policy: Instant
           Max Ack Pending: 1,000
         Max Waiting Pulls: 512

  State:

    Last Delivered Message: Consumer sequence: 0 Stream sequence: 0
      Acknowledgment Floor: Consumer sequence: 0 Stream sequence: 0
          Outstanding Acks: 0 out of maximum 1,000
      Redelivered Messages: 0
      Unprocessed Messages: 0
             Waiting Pulls: 0 of maximum 512
  ```
</details>

스트림과 durable pull consumer를 생성한 후에는 NATS engine으로 테이블을 생성할 수 있습니다. 이를 위해 `nats_stream`, `nats_consumer_name`, `nats_subjects`를 초기화해야 합니다:

```SQL
CREATE TABLE nats_jet_stream (
    key UInt64,
    value UInt64
  ) ENGINE NATS 
    SETTINGS  nats_url = 'localhost:4222',
              nats_stream = 'stream_name',
              nats_consumer_name = 'consumer_name',
              nats_subjects = 'stream_subject',
              nats_format = 'JSONEachRow';
```
