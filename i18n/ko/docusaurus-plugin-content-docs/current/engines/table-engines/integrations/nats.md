---
'description': '이 엔진은 ClickHouse와 NATS를 통합하여 메시지 주제를 게시하거나 구독하고 새로운 메시지가 사용 가능해질 때
  처리할 수 있도록 합니다.'
'sidebar_label': 'NATS'
'sidebar_position': 140
'slug': '/engines/table-engines/integrations/nats'
'title': 'NATS 테이블 엔진'
'doc_type': 'guide'
---


# NATS 테이블 엔진 {#redisstreams-engine}

이 엔진은 ClickHouse와 [NATS](https://nats.io/)를 통합할 수 있도록 합니다.

`NATS`를 사용하면:

- 메시지 주제를 게시하거나 구독할 수 있습니다.
- 새 메시지가 제공될 때 이를 처리할 수 있습니다.

## 테이블 생성 {#creating-a-table}

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

- `nats_url` – host:port (예: `localhost:5672`)..
- `nats_subjects` – NATS 테이블이 구독/게시할 주제 목록. `foo.*.bar` 또는 `baz.>`와 같은 와일드카드 주제를 지원합니다.
- `nats_format` – 메시지 형식. `JSONEachRow`와 같은 SQL `FORMAT` 함수와 같은 표기법을 사용합니다. 자세한 내용은 [형식](../../../interfaces/formats.md) 섹션을 참조하세요.

선택적 매개변수:

- `nats_schema` – 형식에 스키마 정의가 필요한 경우 사용해야 하는 매개변수. 예를 들어, [Cap'n Proto](https://capnproto.org/)는 스키마 파일의 경로와 루트 `schema.capnp:Message` 객체의 이름이 필요합니다.
- `nats_stream` – NATS JetStream의 기존 스트림 이름.
- `nats_consumer` – NATS JetStream의 기존 내구성 풀 소비자 이름.
- `nats_num_consumers` – 테이블당 소비자 수. 기본값: `1`. NATS 코어 전용에 대해 하나의 소비자의 처리량이 부족한 경우 더 많은 소비자를 지정합니다.
- `nats_queue_group` – NATS 구독자의 대기열 그룹 이름. 기본값은 테이블 이름입니다.
- `nats_max_reconnect` – 더 이상 사용되지 않으며 영향을 미치지 않습니다. 재연결은 nats_reconnect_wait 타임아웃으로 영구적으로 수행됩니다.
- `nats_reconnect_wait` – 각 재연결 시도 사이에 슬립할 시간(밀리초). 기본값: `5000`.
- `nats_server_list` - 연결을 위한 서버 목록. NATS 클러스터에 연결하기 위해 지정할 수 있습니다.
- `nats_skip_broken_messages` - 블록당 스키마와 호환되지 않는 메시지에 대한 NATS 메시지 파서 허용오차. 기본값: `0`. 만약 `nats_skip_broken_messages = N`이면 엔진은 파싱할 수 없는 *N* 개의 NATS 메시지를 건너뜁니다(메시지는 데이터의 행과 같습니다).
- `nats_max_block_size` - NATS에서 데이터를 플러시하기 위해 폴링으로 수집된 행 수. 기본값: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size).
- `nats_flush_interval_ms` - NATS에서 읽은 데이터를 플러시하기 위한 타임아웃. 기본값: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms).
- `nats_username` - NATS 사용자 이름.
- `nats_password` - NATS 비밀번호.
- `nats_token` - NATS 인증 토큰.
- `nats_credential_file` - NATS 자격 증명 파일의 경로.
- `nats_startup_connect_tries` - 시작 시 연결 시도 횟수. 기본값: `5`.
- `nats_max_rows_per_message` — 행 기반 형식의 한 NATS 메시지에 기록되는 최대 행 수입니다. (기본값: `1`).
- `nats_handle_error_mode` — NATS 엔진의 오류 처리 방법. 가능한 값: 기본값 (메시지 파싱에 실패하면 예외가 발생함), 스트림(예외 메시지와 원시 메시지가 가상 컬럼 `_error` 및 `_raw_message`에 저장됨).

SSL 연결:

보안 연결을 위해 `nats_secure = 1`을 사용합니다.
사용되는 라이브러리의 기본 동작은 생성된 TLS 연결이 충분히 안전한지 확인하지 않습니다. 인증서가 만료되었거나, 자체 서명되었거나, 누락되었거나, 잘못된 경우에도 연결이 허용됩니다. 인증서에 대한 보다 엄격한 검사는 미래에 구현될 수 있습니다.

NATS 테이블에 쓰기:

테이블이 하나의 주제만 읽는 경우, 모든 삽입은 동일한 주제에 게시됩니다.
그러나 테이블이 여러 주제에서 읽는 경우 게시할 주제를 지정해야 합니다.
이것이 바로 여러 주제로 테이블에 삽입할 때 `stream_like_engine_insert_queue`를 설정해야 하는 이유입니다.
테이블이 읽는 주제 중 하나를 선택하여 해당 주제에 데이터를 게시할 수 있습니다. 예를 들어:

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

또한 nats 관련 설정과 함께 형식 설정을 추가할 수 있습니다.

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

NATS 서버 구성은 ClickHouse 구성 파일을 사용하여 추가할 수 있습니다.
보다 구체적으로 NATS 엔진을 위한 Redis 비밀번호를 추가할 수 있습니다:

```xml
<nats>
    <user>click</user>
    <password>house</password>
    <token>clickhouse</token>
</nats>
```

## 설명 {#description}

`SELECT`는 메시지를 읽는 데 그리 유용하지 않습니다(디버깅 용도를 제외하고), 각 메시지는 한 번만 읽을 수 있기 때문입니다. 실제 시간 스레드를 만들기 위해 [물리화된 뷰](../../../sql-reference/statements/create/view.md)를 만드는 것이 더 실용적입니다. 이를 위해:

1.  엔진을 사용하여 NATS 소비자를 만들고 이를 데이터 스트림으로 간주합니다.
2.  원하는 구조로 테이블을 생성합니다.
3.  엔진에서 데이터를 변환하고 이전에 생성된 테이블에 넣는 물리화된 뷰를 만듭니다.

`MATERIALIZED VIEW`가 엔진에 결합되면 백그라운드에서 데이터를 수집하기 시작합니다. 이를 통해 NATS에서 지속적으로 메시지를 수신하고 `SELECT`를 사용하여 요구되는 형식으로 변환할 수 있습니다.
하나의 NATS 테이블에는 원하는 만큼의 물리화된 뷰가 있을 수 있으며, 이들은 테이블에서 직접 데이터를 읽지 않고 새 레코드(블록으로)를 수신하므로 서로 다른 세부 정보 레벨(그룹화 - 집계됨 또는 집계되지 않음)로 여러 테이블에 쓸 수 있습니다.

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

스트림 데이터를 수신을 중지하거나 변환 논리를 변경하려면 물리화된 뷰를 분리하십시오:

```sql
DETACH TABLE consumer;
ATTACH TABLE consumer;
```

`ALTER`를 사용하여 대상 테이블을 변경하려면, 대상 테이블과 뷰에서의 데이터 간의 불일치를 피하기 위해 물리화된 뷰를 비활성화하는 것이 좋습니다.

## 가상 컬럼 {#virtual-columns}

- `_subject` - NATS 메시지 주제. 데이터 유형: `String`.

`nats_handle_error_mode='stream'`일 때 추가 가상 컬럼:

- `_raw_message` - 성공적으로 파싱되지 못한 원시 메시지. 데이터 유형: `Nullable(String)`.
- `_error` - 파싱 실패 시 발생한 예외 메시지. 데이터 유형: `Nullable(String)`.

참고: `_raw_message` 및 `_error` 가상 컬럼은 파싱 중 예외가 발생할 경우에만 채워지며, 메시지가 성공적으로 파싱되면 항상 `NULL`입니다.

## 데이터 형식 지원 {#data-formats-support}

NATS 엔진은 ClickHouse에서 지원하는 모든 [형식](../../../interfaces/formats.md)을 지원합니다.
하나의 NATS 메시지에서 행 수는 형식이 행 기반인지 블록 기반인지에 따라 달라집니다:

- 행 기반 형식의 경우 하나의 NATS 메시지에서 행 수는 `nats_max_rows_per_message`를 설정하여 제어할 수 있습니다.
- 블록 기반 형식의 경우 블록을 더 작은 부분으로 나눌 수는 없지만 한 블록에서의 행 수는 일반 설정 [max_block_size](/operations/settings/settings#max_block_size)를 통해 제어할 수 있습니다.

## JetStream 사용하기 {#using-jetstream}

NATS JetStream과 함께 NATS 엔진을 사용하기 전에 NATS 스트림과 내구성 풀 소비자를 생성해야 합니다. 이를 위해, 예를 들어 [NATS CLI](https://github.com/nats-io/natscli) 패키지의 nats 유틸리티를 사용할 수 있습니다:
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
<summary>내구성 풀 소비자 생성</summary>

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

스트림과 내구성 풀 소비자를 생성한 후 NATS 엔진으로 테이블을 생성할 수 있습니다. 이를 위해 다음을 초기화해야 합니다: nats_stream, nats_consumer_name, nats_subjects:

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
