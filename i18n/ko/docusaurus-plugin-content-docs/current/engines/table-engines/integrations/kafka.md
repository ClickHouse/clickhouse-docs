---
'description': 'Kafka 테이블 엔진은 Apache Kafka와 함께 작업을 게시하는 데 사용될 수 있으며, 데이터 흐름에 게시하거나
  구독하고, 내결함성 스토리지를 조직하며, 스트림이 제공될 때 처리할 수 있게 해줍니다.'
'sidebar_label': 'Kafka'
'sidebar_position': 110
'slug': '/engines/table-engines/integrations/kafka'
'title': 'Kafka 테이블 엔진'
'keywords':
- 'Kafka'
- 'table engine'
'doc_type': 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# Kafka 테이블 엔진

:::tip
ClickHouse Cloud를 사용 중이라면 [ClickPipes](/integrations/clickpipes)를 사용하는 것이 좋습니다. ClickPipes는 개인 네트워크 연결을 기본으로 지원하고, 데이터 수집 및 클러스터 리소스를 독립적으로 확장하며, ClickHouse로 스트리밍 Kafka 데이터를 모니터링할 수 있는 포괄적인 모니터링 기능을 제공합니다.
:::

- 데이터 흐름을 게시하거나 구독합니다.
- 내결함성이 있는 스토리지를 구성합니다.
- 스트림이 사용 가능해지면 처리합니다.

## 테이블 생성 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [ALIAS expr1],
    name2 [type2] [ALIAS expr2],
    ...
) ENGINE = Kafka()
SETTINGS
    kafka_broker_list = 'host:port',
    kafka_topic_list = 'topic1,topic2,...',
    kafka_group_name = 'group_name',
    kafka_format = 'data_format'[,]
    [kafka_security_protocol = '',]
    [kafka_sasl_mechanism = '',]
    [kafka_sasl_username = '',]
    [kafka_sasl_password = '',]
    [kafka_schema = '',]
    [kafka_num_consumers = N,]
    [kafka_max_block_size = 0,]
    [kafka_skip_broken_messages = N,]
    [kafka_commit_every_batch = 0,]
    [kafka_client_id = '',]
    [kafka_poll_timeout_ms = 0,]
    [kafka_poll_max_batch_size = 0,]
    [kafka_flush_interval_ms = 0,]
    [kafka_thread_per_consumer = 0,]
    [kafka_handle_error_mode = 'default',]
    [kafka_commit_on_select = false,]
    [kafka_max_rows_per_message = 1,]
    [kafka_compression_codec = '',]
    [kafka_compression_level = -1];
```

필수 매개변수:

- `kafka_broker_list` — 쉼표로 구분된 브로커 목록 (예: `localhost:9092`).
- `kafka_topic_list` — Kafka 주제 목록.
- `kafka_group_name` — Kafka 소비자 그룹. 각 그룹에 대한 읽기 여백은 별도로 추적됩니다. 클러스터에서 메시지가 중복되지 않도록 하려면 모든 곳에서 동일한 그룹 이름을 사용하십시오.
- `kafka_format` — 메시지 형식. `JSONEachRow`와 같은 SQL `FORMAT` 함수와 동일한 표기법을 사용합니다. 자세한 내용은 [형식](../../../interfaces/formats.md) 섹션을 참조하십시오.

선택적 매개변수:

- `kafka_security_protocol` - 브로커와 통신하는 데 사용되는 프로토콜. 가능한 값: `plaintext`, `ssl`, `sasl_plaintext`, `sasl_ssl`.
- `kafka_sasl_mechanism` - 인증에 사용할 SASL 메커니즘. 가능한 값: `GSSAPI`, `PLAIN`, `SCRAM-SHA-256`, `SCRAM-SHA-512`, `OAUTHBEARER`.
- `kafka_sasl_username` - `PLAIN` 및 `SASL-SCRAM-..` 메커니즘에서 사용할 SASL 사용자 이름.
- `kafka_sasl_password` - `PLAIN` 및 `SASL-SCRAM-..` 메커니즘에서 사용할 SASL 비밀번호.
- `kafka_schema` — 형식이 스키마 정의를 요구하는 경우 사용해야 하는 매개변수. 예를 들어, [Cap'n Proto](https://capnproto.org/)는 스키마 파일 경로와 루트 `schema.capnp:Message` 객체의 이름을 요구합니다.
- `kafka_schema_registry_skip_bytes` — 봉투 헤더가 있는 스키마 레지스트리를 사용할 때 각 메시지의 시작에서 건너뛰어야 하는 바이트 수 (예: 19바이트 봉투를 포함하는 AWS Glue Schema Registry). 범위: `[0, 255]`. 기본값: `0`.
- `kafka_num_consumers` — 테이블당 소비자 수. 하나의 소비자 처리량이 부족할 경우 더 많은 소비자를 지정하십시오. 소비자 총 수는 주제의 파티션 수를 초과해서는 안 되며, 물리적 코어 수보다 많아서도 안 됩니다. 기본값: `1`.
- `kafka_max_block_size` — 폴링을 위한 최대 배치 크기 (메시지 기준). 기본값: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size).
- `kafka_skip_broken_messages` — 스키마와 호환되지 않는 메시지에 대한 Kafka 메시지 파서의 허용 오차. `kafka_skip_broken_messages = N`이면 엔진은 분석할 수 없는 *N* 개의 Kafka 메시지를 건너뜁니다 (메시지는 데이터의 행에 해당). 기본값: `0`.
- `kafka_commit_every_batch` — 전체 블록을 작성한 후 단일 커밋 대신 소비하고 처리한 배치를 매번 커밋합니다. 기본값: `0`.
- `kafka_client_id` — 클라이언트 식별자. 기본값은 비어 있습니다.
- `kafka_poll_timeout_ms` — Kafka에서 단일 폴링의 타임아웃. 기본값: [stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms).
- `kafka_poll_max_batch_size` — 단일 Kafka 폴링에서 폴링할 수 있는 최대 메시지 수. 기본값: [max_block_size](/operations/settings/settings#max_block_size).
- `kafka_flush_interval_ms` — Kafka에서 데이터를 플러시하는 타임아웃. 기본값: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms).
- `kafka_thread_per_consumer` — 각 소비자에 대해 독립 스레드를 제공합니다. 활성화하면 각 소비자는 독립적으로 데이터를 플러시하며(그렇지 않으면 여러 소비자의 행이 하나의 블록을 형성하도록 압축됨) 기본값: `0`.
- `kafka_handle_error_mode` — Kafka 엔진에 대한 오류 처리 방법. 가능한 값: default (메시지 분석 실패 시 예외가 발생), stream (예외 메시지와 원시 메시지가 가상 열 `_error` 및 `_raw_message`에 저장됨), dead_letter_queue (오류 관련 데이터가 system.dead_letter_queue에 저장됨).
- `kafka_commit_on_select` — 선택 쿼리가 수행될 때 메시지를 커밋합니다. 기본값: `false`.
- `kafka_max_rows_per_message` — 행 기반 형식의 단일 Kafka 메시지에 기록되는 최대 행 수. 기본값: `1`.
- `kafka_compression_codec` — 메시지를 생성하는 데 사용되는 압축 코덱. 지원되는 값: 빈 문자열, `none`, `gzip`, `snappy`, `lz4`, `zstd`. 빈 문자열의 경우, 테이블에 의해 압축 코덱이 설정되지 않으며 구성 파일의 값이나 `librdkafka`의 기본값이 사용됩니다. 기본값: 빈 문자열.
- `kafka_compression_level` — kafka_compression_codec으로 선택된 알고리즘에 대한 압축 수준 매개변수. 값이 클수록 CPU 사용량은 더 많지만 더 나은 압축을 도출합니다. 사용 가능한 범위는 알고리즘에 따라 다릅니다: `gzip`에 대해 `[0-9]`; `lz4`에 대해 `[0-12]`; `snappy`에 대해서는 `0`만 해당; `zstd`에 대해 `[0-12]`; `-1`은 코덱에 따라 의존하는 기본 압축 수준입니다. 기본값: `-1`.

예제:

```sql
CREATE TABLE queue (
  timestamp UInt64,
  level String,
  message String
) ENGINE = Kafka('localhost:9092', 'topic', 'group1', 'JSONEachRow');

SELECT * FROM queue LIMIT 5;

CREATE TABLE queue2 (
  timestamp UInt64,
  level String,
  message String
) ENGINE = Kafka SETTINGS kafka_broker_list = 'localhost:9092',
                          kafka_topic_list = 'topic',
                          kafka_group_name = 'group1',
                          kafka_format = 'JSONEachRow',
                          kafka_num_consumers = 4;

CREATE TABLE queue3 (
  timestamp UInt64,
  level String,
  message String
) ENGINE = Kafka('localhost:9092', 'topic', 'group1')
            SETTINGS kafka_format = 'JSONEachRow',
                     kafka_num_consumers = 4;
```

<details markdown="1">

<summary>테이블 생성의 사용 중단된 방법</summary>

:::note
새 프로젝트에서는 이 방법을 사용하지 마십시오. 가능하면 이전 프로젝트를 위의 방법으로 전환하십시오.
:::

```sql
Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
      [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
```

</details>

:::info
Kafka 테이블 엔진은 [기본값](/sql-reference/statements/create/table#default_values)이 있는 컬럼을 지원하지 않습니다. 기본값이 있는 컬럼이 필요한 경우 물리화된 뷰 수준에서 추가할 수 있습니다(아래 참조).
:::

## 설명 {#description}

전달된 메시지는 자동으로 추적되며, 그룹 내의 각 메시지는 한 번만 계산됩니다. 데이터를 두 번 가져오려면 다른 그룹 이름을 가진 테이블을 복사하여 생성하십시오.

그룹은 유연하며 클러스터에서 동기화됩니다. 예를 들어, 주제가 10개이고 클러스터에 테이블 복제가 5개 있을 경우, 각 복제본은 2개의 주제를 받습니다. 복제본의 수가 변경되면 주제는 자동으로 복제본에 재분배됩니다. 이에 대한 자세한 내용은 http://kafka.apache.org/intro를 참조하십시오.

각 Kafka 주제에 전용 소비자 그룹이 있는 것이 좋으며, 이는 주제와 그룹 간의 독점적인 쌍을 보장하며, 특히 주제가 동적으로 생성 및 삭제될 수 있는 환경(예: 테스트 또는 스테이징)에서 권장됩니다.

`SELECT`는 메시지를 읽는 데 특히 유용하지 않으며(디버깅 제외), 각 메시지는 한 번만 읽을 수 있기 때문에, 실제 시간 스레드를 생성하기 위해 물리화된 뷰를 사용하는 것이 더 실용적입니다. 이렇게 하려면:

1. 엔진을 사용하여 Kafka 소비자를 생성하고 이를 데이터 스트림으로 간주합니다.
2. 원하는 구조를 가진 테이블을 생성합니다.
3. 엔진에서 데이터를 변환하여 이전에 생성된 테이블에 넣는 물리화된 뷰를 생성합니다.

`MATERIALIZED VIEW`가 엔진과 결합되면, 백그라운드에서 데이터 수집을 시작합니다. 이를 통해 Kafka에서 메시지를 지속적으로 수신하고 `SELECT`를 사용하여 필요한 형식으로 변환할 수 있습니다.
하나의 kafka 테이블은 원하는 만큼의 물리화된 뷰를 가질 수 있으며, 이들은 kafka 테이블에서 직접 데이터에 접근하지 않고 새로운 레코드(블록 단위)를 수신하게 됩니다. 이 방식으로 여러 테이블에 다른 세부 수준(집계된 데이터와 비집계된 데이터)으로 쓰기 가능하게 됩니다.

예제:

```sql
CREATE TABLE queue (
  timestamp UInt64,
  level String,
  message String
) ENGINE = Kafka('localhost:9092', 'topic', 'group1', 'JSONEachRow');

CREATE TABLE daily (
  day Date,
  level String,
  total UInt64
) ENGINE = SummingMergeTree(day, (day, level), 8192);

CREATE MATERIALIZED VIEW consumer TO daily
  AS SELECT toDate(toDateTime(timestamp)) AS day, level, count() AS total
  FROM queue GROUP BY day, level;

SELECT level, sum(total) FROM daily GROUP BY level;
```
성능 개선을 위해 수신된 메시지는 [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size) 크기의 블록으로 그룹화됩니다. 블록이 [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms) 밀리초 이내에 형성되지 않으면, 블록의 완전성과 관계없이 데이터가 테이블로 플러시됩니다.

토픽 데이터 수신을 중지하거나 변환 논리를 변경하려면 물리화된 뷰를 분리합니다:

```sql
DETACH TABLE consumer;
ATTACH TABLE consumer;
```

`ALTER`를 사용하여 대상 테이블을 변경하려는 경우, 대상 테이블과 뷰의 데이터 간 불일치를 피하기 위해 물리화된 뷰를 비활성화하는 것이 좋습니다.

## 구성 {#configuration}

GraphiteMergeTree와 유사하게, Kafka 엔진은 ClickHouse 구성 파일을 사용하여 확장된 구성을 지원합니다. 사용할 수 있는 두 가지 구성 키가 있으며: 글로벌(아래 `<kafka>`), 주제 수준(아래 `<kafka><kafka_topic>`). 글로벌 구성은 먼저 적용되며, 그 후에 주제 수준의 구성이 적용됩니다(존재하는 경우).

```xml
<kafka>
  <!-- Global configuration options for all tables of Kafka engine type -->
  <debug>cgrp</debug>
  <statistics_interval_ms>3000</statistics_interval_ms>

  <kafka_topic>
      <name>logs</name>
      <statistics_interval_ms>4000</statistics_interval_ms>
  </kafka_topic>

  <!-- Settings for consumer -->
  <consumer>
      <auto_offset_reset>smallest</auto_offset_reset>
      <kafka_topic>
          <name>logs</name>
          <fetch_min_bytes>100000</fetch_min_bytes>
      </kafka_topic>

      <kafka_topic>
          <name>stats</name>
          <fetch_min_bytes>50000</fetch_min_bytes>
      </kafka_topic>
  </consumer>

  <!-- Settings for producer -->
  <producer>
      <kafka_topic>
          <name>logs</name>
          <retry_backoff_ms>250</retry_backoff_ms>
      </kafka_topic>

      <kafka_topic>
          <name>stats</name>
          <retry_backoff_ms>400</retry_backoff_ms>
      </kafka_topic>
  </producer>
</kafka>
```

가능한 구성 옵션 목록은 [librdkafka 구성 참고서](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)를 참조하십시오. ClickHouse 구성에서는 점 대신 언더스코어(`_`)를 사용하십시오. 예를 들어, `check.crcs=true`는 `<check_crcs>true</check_crcs>`로 변환됩니다.

### Kerberos 지원 {#kafka-kerberos-support}

Kerberos 인식 Kafka와 작업하려면, `sasl_plaintext` 값을 가진 `security_protocol` 자식 요소를 추가합니다. Kerberos 티켓을 OS 기능이 획득하고 캐시하는 것으로 충분합니다.
ClickHouse는 키탭 파일을 사용하여 Kerberos 자격 증명을 유지 관리할 수 있습니다. `sasl_kerberos_service_name`, `sasl_kerberos_keytab` 및 `sasl_kerberos_principal` 자식 요소를 고려하십시오.

예제:

```xml
<!-- Kerberos-aware Kafka -->
<kafka>
  <security_protocol>SASL_PLAINTEXT</security_protocol>
  <sasl_kerberos_keytab>/home/kafkauser/kafkauser.keytab</sasl_kerberos_keytab>
  <sasl_kerberos_principal>kafkauser/kafkahost@EXAMPLE.COM</sasl_kerberos_principal>
</kafka>
```

## 가상 열 {#virtual-columns}

- `_topic` — Kafka 주제. 데이터 유형: `LowCardinality(String)`.
- `_key` — 메시지의 키. 데이터 유형: `String`.
- `_offset` — 메시지의 오프셋. 데이터 유형: `UInt64`.
- `_timestamp` — 메시지의 타임스탬프. 데이터 유형: `Nullable(DateTime)`.
- `_timestamp_ms` — 메시지의 밀리 초 단위 타임스탬프. 데이터 유형: `Nullable(DateTime64(3))`.
- `_partition` — Kafka 주제의 파티션. 데이터 유형: `UInt64`.
- `_headers.name` — 메시지 헤더 키의 배열. 데이터 유형: `Array(String)`.
- `_headers.value` — 메시지 헤더 값의 배열. 데이터 유형: `Array(String)`.

`kafka_handle_error_mode='stream'`인 경우 추가 가상 열:

- `_raw_message` - 성공적으로 구문 분석할 수 없었던 원시 메시지. 데이터 유형: `String`.
- `_error` - 구문 분석이 실패할 때 발생한 예외 메시지. 데이터 유형: `String`.

참고: `_raw_message` 및 `_error` 가상 열은 구문 분석 중 예외가 발생한 경우에만 채워지며, 메시지가 성공적으로 구문 분석된 경우 항상 비어 있습니다.

## 데이터 형식 지원 {#data-formats-support}

Kafka 엔진은 ClickHouse에서 지원하는 모든 [형식](../../../interfaces/formats.md)을 지원합니다.
하나의 Kafka 메시지의 행 수는 형식이 행 기반인지 블록 기반인지에 따라 다릅니다:

- 행 기반 형식의 경우, 단일 Kafka 메시지의 행 수는 `kafka_max_rows_per_message` 설정으로 제어할 수 있습니다.
- 블록 기반 형식의 경우, 블록을 더 작은 부분으로 나눌 수는 없지만 하나의 블록의 행 수는 일반 설정 [max_block_size](/operations/settings/settings#max_block_size)로 제어할 수 있습니다.

## ClickHouse Keeper에 커밋된 오프셋 저장을 위한 엔진 {#engine-to-store-committed-offsets-in-clickhouse-keeper}

<ExperimentalBadge/>

`allow_experimental_kafka_offsets_storage_in_keeper`가 활성화되면, Kafka 테이블 엔진에 대해 두 개의 추가 설정을 지정할 수 있습니다:
- `kafka_keeper_path`는 ClickHouse Keeper의 테이블 경로를 지정합니다.
- `kafka_replica_name`은 ClickHouse Keeper의 복제본 이름을 지정합니다.

두 설정 모두 지정하거나 둘 다 지정하지 않아야 합니다. 두 설정 모두 지정하면 새로운 실험적인 Kafka 엔진이 사용됩니다. 새로운 엔진은 Kafka에서 커밋된 오프셋 저장에 의존하지 않으며 ClickHouse Keeper에 저장됩니다. 여전히 Kafka에 오프셋을 커밋하려고 시도하지만, 테이블 생성 시에만 해당 오프셋에 의존합니다. 기타 모든 상황(테이블이 재시작되거나 오류 후 복구될 때)에서는 ClickHouse Keeper에 저장된 오프셋이 메시지 소비를 계속하는 데 사용됩니다. 커밋된 오프셋 외에도, 마지막 배치에서 소비된 메시지 수를 저장하므로, 인서트가 실패할 경우 동일한 수의 메시지가 소비될 것이며, 필요할 경우 중복되기를 방지할 수 있습니다.

예제:

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

### 알려진 제한 사항 {#known-limitations}

새 엔진이 실험적이므로 아직 프로덕션 준비가 되지 않았습니다. 구현에 대한 몇 가지 알려진 제한 사항이 있습니다:
- 가장 큰 제한은 엔진이 직접 읽기를 지원하지 않는다는 것입니다. 물리화된 뷰를 사용하여 엔진에서 읽고 엔진에 기록하는 것은 가능하지만, 직접 읽기는 지원되지 않습니다. 그 결과, 모든 직접 `SELECT` 쿼리는 실패하게 됩니다.
- 테이블을 빠르게 삭제하고 다시 생성하거나 동일한 ClickHouse Keeper 경로를 다른 엔진에 지정하면 문제가 발생할 수 있습니다. 모범 사례로 `{uuid}`를 `kafka_keeper_path`에서 사용하여 충돌하는 경로를 피할 수 있습니다.
- 반복 가능한 읽기를 수행하려면, 여러 파티션에서 단일 스레드로 메시지를 소비할 수 없습니다. 반면에 Kafka 소비자는 정기적으로 폴링해야 활성 상태를 유지합니다. 이러한 두 가지 목표의 결과로, 우리는 `kafka_thread_per_consumer`가 활성화되어 있는 경우에만 여러 소비자의 생성을 허용하기로 결정했습니다. 그렇지 않으면 소비자를 정기적으로 폴링하는 것과 관련하여 문제를 피하기가 너무 복잡합니다.
- 새로운 저장 엔진에서 생성된 소비자는 [`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md) 테이블에 나타나지 않습니다.

**참고자료**

- [가상 열](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)
- [system.kafka_consumers](../../../operations/system-tables/kafka_consumers.md)
