---
'description': '이 엔진은 ClickHouse와 RabbitMQ를 통합할 수 있게 해줍니다.'
'sidebar_label': 'RabbitMQ'
'sidebar_position': 170
'slug': '/engines/table-engines/integrations/rabbitmq'
'title': 'RabbitMQ 테이블 엔진'
'doc_type': 'guide'
---



# RabbitMQ 테이블 엔진

이 엔진은 ClickHouse와 [RabbitMQ](https://www.rabbitmq.com) 통합을 가능하게 합니다.

`RabbitMQ`를 사용하면 다음을 수행할 수 있습니다:

- 데이터 흐름을 게시하거나 구독합니다.
- 사용 가능한 데이터 스트림을 처리합니다.

## 테이블 생성하기 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1],
    name2 [type2],
    ...
) ENGINE = RabbitMQ SETTINGS
    rabbitmq_host_port = 'host:port' [or rabbitmq_address = 'amqp(s)://guest:guest@localhost/vhost'],
    rabbitmq_exchange_name = 'exchange_name',
    rabbitmq_format = 'data_format'[,]
    [rabbitmq_exchange_type = 'exchange_type',]
    [rabbitmq_routing_key_list = 'key1,key2,...',]
    [rabbitmq_secure = 0,]
    [rabbitmq_schema = '',]
    [rabbitmq_num_consumers = N,]
    [rabbitmq_num_queues = N,]
    [rabbitmq_queue_base = 'queue',]
    [rabbitmq_deadletter_exchange = 'dl-exchange',]
    [rabbitmq_persistent = 0,]
    [rabbitmq_skip_broken_messages = N,]
    [rabbitmq_max_block_size = N,]
    [rabbitmq_flush_interval_ms = N,]
    [rabbitmq_queue_settings_list = 'x-dead-letter-exchange=my-dlx,x-max-length=10,x-overflow=reject-publish',]
    [rabbitmq_queue_consume = false,]
    [rabbitmq_address = '',]
    [rabbitmq_vhost = '/',]
    [rabbitmq_username = '',]
    [rabbitmq_password = '',]
    [rabbitmq_commit_on_select = false,]
    [rabbitmq_max_rows_per_message = 1,]
    [rabbitmq_handle_error_mode = 'default']
```

필수 매개변수:

- `rabbitmq_host_port` – 호스트:포트 (예: `localhost:5672`).
- `rabbitmq_exchange_name` – RabbitMQ 교환 이름.
- `rabbitmq_format` – 메시지 형식. SQL `FORMAT` 함수와 동일한 표기법을 사용합니다. 예를 들어 `JSONEachRow`. 자세한 정보는 [Formats](../../../interfaces/formats.md) 섹션을 참조하십시오.

선택적 매개변수:

- `rabbitmq_exchange_type` – RabbitMQ 교환 유형: `direct`, `fanout`, `topic`, `headers`, `consistent_hash`. 기본값: `fanout`.
- `rabbitmq_routing_key_list` – 라우팅 키의 쉼표로 구분된 목록.
- `rabbitmq_schema` – 형식이 스키마 정의를 요구할 경우 사용해야 하는 매개변수. 예를 들어, [Cap'n Proto](https://capnproto.org/)는 스키마 파일의 경로와 루트 `schema.capnp:Message` 객체의 이름이 필요합니다.
- `rabbitmq_num_consumers` – 테이블당 소비자 수. 하나의 소비자 처리량이 불충분할 경우 소비자를 더 지정하십시오. 기본값: `1`.
- `rabbitmq_num_queues` – 큐의 총 수. 이 숫자를 늘리면 성능이 크게 향상될 수 있습니다. 기본값: `1`.
- `rabbitmq_queue_base` - 큐 이름에 대한 힌트를 지정합니다. 이 설정의 사용 사례는 아래에 설명되어 있습니다.
- `rabbitmq_deadletter_exchange` - [데드 레터 교환](https://www.rabbitmq.com/dlx.html)에 대한 이름을 지정합니다. 이 교환 이름으로 또 다른 테이블을 생성하고 메시지를 수집할 수 있습니다. 기본적으로 데드 레터 교환은 지정되지 않습니다.
- `rabbitmq_persistent` - 1(참)로 설정되면, 삽입 쿼리의 배달 모드가 2로 설정됩니다(메시지를 '영구적'으로 표시). 기본값: `0`.
- `rabbitmq_skip_broken_messages` – 블록당 스키마 호환되지 않는 메시지에 대한 RabbitMQ 메시지 파서의 허용 오차. `rabbitmq_skip_broken_messages = N`이면 파싱할 수 없는 *N* 개의 RabbitMQ 메시지를 건너뜁니다 (메시지는 데이터의 행과 같습니다). 기본값: `0`.
- `rabbitmq_max_block_size` - RabbitMQ에서 데이터를 플러시하기 전에 수집된 행 수. 기본값: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size).
- `rabbitmq_flush_interval_ms` - RabbitMQ에서 데이터를 플러시하기 위한 시간 초과. 기본값: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms).
- `rabbitmq_queue_settings_list` - 큐를 생성할 때 RabbitMQ 설정을 설정할 수 있습니다. 사용 가능한 설정: `x-max-length`, `x-max-length-bytes`, `x-message-ttl`, `x-expires`, `x-priority`, `x-max-priority`, `x-overflow`, `x-dead-letter-exchange`, `x-queue-type`. `durable` 설정은 큐에 대해 자동으로 활성화됩니다.
- `rabbitmq_address` - 연결을 위한 주소. 이 설정 또는 `rabbitmq_host_port`를 사용하십시오.
- `rabbitmq_vhost` - RabbitMQ vhost. 기본값: `'\'`.
- `rabbitmq_queue_consume` - 사용자 정의 큐를 사용하고 RabbitMQ 설정을 하지 않습니다: 교환, 큐, 바인딩 선언. 기본값: `false`.
- `rabbitmq_username` - RabbitMQ 사용자 이름.
- `rabbitmq_password` - RabbitMQ 비밀번호.
- `reject_unhandled_messages` - 오류가 발생할 경우 메시지를 거부합니다 (RabbitMQ 부정 확인 전송). 이 설정은 `rabbitmq_queue_settings_list`에 `x-dead-letter-exchange`가 정의되어 있을 경우 자동으로 활성화됩니다.
- `rabbitmq_commit_on_select` - 선택 쿼리가 수행될 때 메시지를 커밋합니다. 기본값: `false`.
- `rabbitmq_max_rows_per_message` — 행 기반 형식에 대해 한 RabbitMQ 메시지에 기록될 수 있는 최대 행 수. 기본값: `1`.
- `rabbitmq_empty_queue_backoff_start` — RabbitMQ 큐가 비어있을 경우 읽기를 재조정하기 위한 시작 백오프 지점.
- `rabbitmq_empty_queue_backoff_end` — RabbitMQ 큐가 비어있을 경우 읽기를 재조정하기 위한 종료 백오프 지점.
- `rabbitmq_handle_error_mode` — RabbitMQ 엔진의 오류를 처리하는 방법. 가능한 값: default (메시지 파싱에 실패했을 경우 예외가 발생함), stream (예외 메시지와 원시 메시지가 가상 컬럼 `_error`와 `_raw_message`에 저장됨), dead_letter_queue (오류 관련 데이터가 system.dead_letter_queue에 저장됨).

  * [ ] SSL 연결:

`rabbitmq_secure = 1` 또는 연결 주소에 `amqps`를 사용하십시오: `rabbitmq_address = 'amqps://guest:guest@localhost/vhost'`.
사용된 라이브러리의 기본 동작은 생성된 TLS 연결이 충분히 안전한지 확인하지 않는 것입니다. 인증서가 만료되었거나, 자체 서명되었거나, 누락되었거나, 유효하지 않은 경우: 연결이 간단히 허용됩니다. 인증서에 대한 보다 엄격한 검사는 향후 구현될 수 있습니다.

또한 RabbitMQ 관련 설정과 함께 형식 설정을 추가할 수 있습니다.

예시:

```sql
CREATE TABLE queue (
  key UInt64,
  value UInt64,
  date DateTime
) ENGINE = RabbitMQ SETTINGS rabbitmq_host_port = 'localhost:5672',
                          rabbitmq_exchange_name = 'exchange1',
                          rabbitmq_format = 'JSONEachRow',
                          rabbitmq_num_consumers = 5,
                          date_time_input_format = 'best_effort';
```

RabbitMQ 서버 구성은 ClickHouse 구성 파일을 사용하여 추가해야 합니다.

필수 구성:

```xml
<rabbitmq>
   <username>root</username>
   <password>clickhouse</password>
</rabbitmq>
```

추가 구성:

```xml
<rabbitmq>
   <vhost>clickhouse</vhost>
</rabbitmq>
```

## 설명 {#description}

`SELECT`는 메시지를 읽는 데 특히 유용하지 않습니다 (디버깅을 제외하고) 왜냐하면 각 메시지는 한 번만 읽을 수 있기 때문입니다. 실제 시간 스레드를 생성하는 것이 더 실용적입니다. [물리화된 뷰](../../../sql-reference/statements/create/view.md)를 사용하여:

1.  엔진을 사용하여 RabbitMQ 소비자를 생성하고 데이터 스트림으로 간주합니다.
2.  원하는 구조의 테이블을 생성합니다.
3.  엔진에서 데이터를 변환하고 이전에 생성된 테이블에 넣는 물리화된 뷰를 생성합니다.

`MATERIALIZED VIEW`가 엔진에 연결되면 백그라운드에서 데이터를 수집하기 시작합니다. 이를 통해 RabbitMQ에서 지속적으로 메시지를 수신하고 `SELECT`를 사용하여 필요한 형식으로 변환할 수 있습니다.
하나의 RabbitMQ 테이블은 원하는 만큼 많은 물리화된 뷰를 가질 수 있습니다.

데이터는 `rabbitmq_exchange_type` 및 지정된 `rabbitmq_routing_key_list`에 따라 채널링될 수 있습니다.
테이블당 교환은 하나만 있을 수 있습니다. 하나의 교환은 여러 테이블 간에 공유될 수 있습니다 - 이로 인해 동시에 여러 테이블로 라우팅할 수 있습니다.

교환 유형 옵션:

- `direct` - 키의 정확한 일치를 기반으로 라우팅됩니다. 예시 테이블 키 목록: `key1,key2,key3,key4,key5`, 메시지 키는 이 중 하나와 같을 수 있습니다.
- `fanout` - 키와 무관하게 모든 테이블(교환 이름이 동일한 경우)로 라우팅됩니다.
- `topic` - 점으로 구분된 키의 패턴을 기반으로 라우팅합니다. 예시: `*.logs`, `records.*.*.2020`, `*.2018,*.2019,*.2020`.
- `headers` - `key=value` 일치를 기반으로 라우팅하며, 설정 `x-match=all` 또는 `x-match=any`가 있습니다. 예시 테이블 키 목록: `x-match=all,format=logs,type=report,year=2020`.
- `consistent_hash` - 데이터는 모든 바인딩된 테이블(교환 이름이 동일한 경우) 간에 균등하게 분배됩니다. 이 교환 유형은 RabbitMQ 플러그인과 함께 활성화되어야 합니다: `rabbitmq-plugins enable rabbitmq_consistent_hash_exchange`.

`rabbitmq_queue_base` 설정은 다음 경우에 사용될 수 있습니다:

- 서로 다른 테이블이 큐를 공유하도록 하여, 동일한 큐에 대해 여러 소비자가 등록되어 성능을 개선할 수 있습니다. `rabbitmq_num_consumers` 및/또는 `rabbitmq_num_queues` 설정을 사용하는 경우 이러한 매개변수가 동일할 경우 큐의 정확한 매치가 달성됩니다.
- 모든 메시지가 성공적으로 소비되지 않았을 경우 특정 내구성 있는 큐에서 읽기를 복원할 수 있습니다. 하나의 특정 큐에서 소비를 다시 시작하려면 `rabbitmq_queue_base` 설정에서 해당 큐의 이름을 설정하고 `rabbitmq_num_consumers` 및 `rabbitmq_num_queues`를 지정하지 마십시오 (기본값은 1). 특정 테이블에 대해 선언된 모든 큐에서 소비를 다시 시작하려면 동일한 설정: `rabbitmq_queue_base`, `rabbitmq_num_consumers`, `rabbitmq_num_queues`를 지정하기만 하면 됩니다. 기본적으로 큐 이름은 테이블에 고유합니다.
- 큐가 내구성 있게 선언되고 자동삭제되지 않도록 재사용할 수 있습니다. (RabbitMQ CLI 도구 중 어떤 것을 이용해 삭제할 수 있습니다.)

성능 향상을 위해 수신된 메시지는 [max_insert_block_size](/operations/settings/settings#max_insert_block_size) 크기로 그룹화됩니다. [stream_flush_interval_ms](../../../operations/server-configuration-parameters/settings.md) 밀리초 이내에 블록이 형성되지 않으면 블록의 완전성과 관계없이 데이터가 테이블로 플러시됩니다.

`rabbitmq_num_consumers` 및/또는 `rabbitmq_num_queues` 설정이 `rabbitmq_exchange_type`과 함께 지정되면:

- `rabbitmq-consistent-hash-exchange` 플러그인이 활성화되어야 합니다.
- 게시된 메시지의 `message_id` 속성이 지정되어야 합니다 (각 메시지/배치에 대해 고유).

삽입 쿼리에 대해 각 게시된 메시지에 대한 메타데이터가 추가됩니다: `messageID` 및 `republished` 플래그 (게시된 횟수가 1회 초과일 경우 참) - 메시지 헤더를 통해 접근할 수 있습니다.

삽입 및 물리화된 뷰에 동일한 테이블을 사용하지 마십시오.

예시:

```sql
CREATE TABLE queue (
  key UInt64,
  value UInt64
) ENGINE = RabbitMQ SETTINGS rabbitmq_host_port = 'localhost:5672',
                          rabbitmq_exchange_name = 'exchange1',
                          rabbitmq_exchange_type = 'headers',
                          rabbitmq_routing_key_list = 'format=logs,type=report,year=2020',
                          rabbitmq_format = 'JSONEachRow',
                          rabbitmq_num_consumers = 5;

CREATE TABLE daily (key UInt64, value UInt64)
  ENGINE = MergeTree() ORDER BY key;

CREATE MATERIALIZED VIEW consumer TO daily
  AS SELECT key, value FROM queue;

SELECT key, value FROM daily ORDER BY key;
```

## 가상 컬럼 {#virtual-columns}

- `_exchange_name` - RabbitMQ 교환 이름. 데이터 유형: `String`.
- `_channel_id` - 메시지를 수신한 소비자가 선언된 ChannelID. 데이터 유형: `String`.
- `_delivery_tag` - 수신된 메시지의 DeliveryTag. 채널당 적용됩니다. 데이터 유형: `UInt64`.
- `_redelivered` - 메시지의 `redelivered` 플래그. 데이터 유형: `UInt8`.
- `_message_id` - 수신된 메시지의 messageID; 메시지가 게시될 때 설정되면 비어 있지 않습니다. 데이터 유형: `String`.
- `_timestamp` - 수신된 메시지의 타임스탬프; 메시지가 게시될 때 설정되면 비어 있지 않습니다. 데이터 유형: `UInt64`.

`rabbitmq_handle_error_mode='stream'`일 때 추가 가상 컬럼:

- `_raw_message` - 성공적으로 파싱할 수 없었던 원시 메시지. 데이터 유형: `Nullable(String)`.
- `_error` - 파싱 실패 시 발생한 예외 메시지. 데이터 유형: `Nullable(String)`.

주: `_raw_message` 및 `_error` 가상 컬럼은 파싱 중 예외가 발생할 경우에만 채워지며, 메시지가 성공적으로 파싱되면 항상 `NULL`입니다.

## 주의사항 {#caveats}

테이블 정의에서 [기본 컬럼 표현식](/sql-reference/statements/create/table.md/#default_values)(예: `DEFAULT`, `MATERIALIZED`, `ALIAS`)를 지정할 수 있지만, 이는 무시됩니다. 대신 컬럼은 해당 유형의 기본 값으로 채워집니다.

## 지원하는 데이터 형식 {#data-formats-support}

RabbitMQ 엔진은 ClickHouse에서 지원하는 모든 [형식](../../../interfaces/formats.md)을 지원합니다.
하나의 RabbitMQ 메시지에 있는 행의 수는 형식이 행 기반인지 블록 기반인지에 따라 다릅니다:

- 행 기반 형식의 경우 메시지당 행 수는 `rabbitmq_max_rows_per_message`를 설정하여 제어할 수 있습니다.
- 블록 기반 형식의 경우 블록을 더 작은 부분으로 나눌 수는 없지만, 하나의 블록에 있는 행 수는 일반 설정 [max_block_size](/operations/settings/settings#max_block_size)로 제어할 수 있습니다.
