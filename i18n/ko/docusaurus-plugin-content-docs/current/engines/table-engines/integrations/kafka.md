---
description: 'Kafka 테이블 엔진은 Apache Kafka와 연동하여 데이터 흐름을 게시하거나 구독하고, 내결함성 스토리지를 구성하며, 스트림이 들어오는 대로 처리할 수 있도록 합니다.'
sidebar_label: 'Kafka'
sidebar_position: 110
slug: /engines/table-engines/integrations/kafka
title: 'Kafka 테이블 엔진'
keywords: ['Kafka', 'table engine']
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# Kafka 테이블 엔진 \{#kafka-table-engine\}

:::tip
ClickHouse Cloud를 사용 중인 경우, 대신 [ClickPipes](/integrations/clickpipes) 사용을 권장합니다. ClickPipes는 사설 네트워크 연결을 기본적으로 지원하며, 수집 및 클러스터 리소스를 서로 독립적으로 확장할 수 있고, Kafka 스트리밍 데이터를 ClickHouse로 전달하기 위한 포괄적인 모니터링을 제공합니다.
:::

- 데이터 흐름을 발행하거나 구독합니다.
- 내결함성 스토리지를 구성합니다.
- 스트림이 들어오는 대로 처리합니다.

## 테이블 생성 \{#creating-a-table\}

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
    [kafka_consumer_reschedule_ms = 0,]
    [kafka_thread_per_consumer = 0,]
    [kafka_handle_error_mode = 'default',]
    [kafka_commit_on_select = false,]
    [kafka_max_rows_per_message = 1,]
    [kafka_compression_codec = '',]
    [kafka_compression_level = -1];
```

필수 매개변수:

* `kafka_broker_list` — 브로커 목록을 쉼표로 구분한 문자열입니다(예: `localhost:9092`).
* `kafka_topic_list` — Kafka 토픽 목록입니다.
* `kafka_group_name` — Kafka 컨슈머 그룹입니다. 각 그룹에 대해 읽기 위치가 별도로 추적됩니다. 클러스터에서 메시지가 중복되지 않도록 하려면 모든 곳에서 동일한 그룹 이름을 사용하십시오.
* `kafka_format` — 메시지 포맷입니다. `JSONEachRow`와 같이 SQL `FORMAT` 함수와 동일한 표기법을 사용합니다. 자세한 내용은 [Formats](../../../interfaces/formats.md) 섹션을 참조하십시오.

선택적 매개변수:


- `kafka_security_protocol` - 브로커와 통신할 때 사용하는 프로토콜입니다. 가능한 값: `plaintext`, `ssl`, `sasl_plaintext`, `sasl_ssl`.
- `kafka_sasl_mechanism` - 인증에 사용할 SASL 메커니즘입니다. 가능한 값: `GSSAPI`, `PLAIN`, `SCRAM-SHA-256`, `SCRAM-SHA-512`, `OAUTHBEARER`.
- `kafka_sasl_username` - `PLAIN` 및 `SASL-SCRAM-..` 메커니즘에서 사용할 SASL 사용자 이름입니다.
- `kafka_sasl_password` - `PLAIN` 및 `SASL-SCRAM-..` 메커니즘에서 사용할 SASL 비밀번호입니다.
- `kafka_schema` — 포맷이 스키마 정의를 필요로 하는 경우 반드시 사용해야 하는 매개변수입니다. 예를 들어 [Cap'n Proto](https://capnproto.org/)는 스키마 파일의 경로와 루트 `schema.capnp:Message` 객체의 이름을 요구합니다.
- `kafka_schema_registry_skip_bytes` — 스키마 레지스트리를 envelope 헤더와 함께 사용할 때(예: 19바이트 envelope을 포함하는 AWS Glue Schema Registry) 각 메시지의 시작 부분에서 건너뛸 바이트 수입니다. 범위: `[0, 255]`. 기본값: `0`.
- `kafka_num_consumers` — 테이블당 consumer 수입니다. 하나의 consumer 처리량이 충분하지 않은 경우 더 많은 consumer를 지정합니다. 전체 consumer 수는 토픽의 파티션 수를 초과해서는 안 되는데, 각 파티션에는 오직 하나의 consumer만 할당될 수 있으며, 또한 ClickHouse가 배포된 서버의 물리 코어 수보다 커서는 안 됩니다. 기본값: `1`.
- `kafka_max_block_size` — poll 시 배치의 최대 크기(메시지 수)입니다. 기본값: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size).
- `kafka_skip_broken_messages` — 블록당 스키마와 호환되지 않는 Kafka 메시지에 대한 Kafka 메시지 파서 허용 한도입니다. `kafka_skip_broken_messages = N`이면, 엔진은 파싱할 수 없는 Kafka 메시지 *N*개를 건너뜁니다(메시지 1개는 데이터 1행에 해당). 기본값: `0`.
- `kafka_commit_every_batch` — 전체 블록을 기록한 후 한 번만 커밋하는 대신, 소비 및 처리된 각 배치를 커밋합니다. 기본값: `0`.
- `kafka_client_id` — 클라이언트 식별자입니다. 기본적으로 빈 문자열입니다.
- `kafka_poll_timeout_ms` — Kafka에서 단일 poll에 대한 타임아웃입니다. 기본값: [stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms).
- `kafka_poll_max_batch_size` — 단일 Kafka poll에서 poll할 수 있는 최대 메시지 수입니다. 기본값: [max_block_size](/operations/settings/settings#max_block_size).
- `kafka_flush_interval_ms` — Kafka에서 데이터를 플러시하는 타임아웃입니다. 기본값: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms).
- `kafka_consumer_reschedule_ms` — Kafka 스트림 처리가 정체된 경우(예: 소비할 메시지가 없는 경우) 다시 스케줄하는 간격입니다. 이 설정은 consumer가 poll을 재시도하기 전의 지연 시간을 제어합니다. `kafka_consumers_pool_ttl_ms`를 초과해서는 안 됩니다. 기본값: `500`밀리초입니다.
- `kafka_thread_per_consumer` — 각 consumer에 독립적인 스레드를 제공합니다. 활성화된 경우, 각 consumer는 데이터를 병렬로 독립적으로 플러시합니다(비활성화된 경우에는 여러 consumer의 행을 합쳐 하나의 블록을 형성합니다). 기본값: `0`.
- `kafka_handle_error_mode` — Kafka 엔진의 오류 처리 방식입니다. 가능한 값: default(메시지 파싱에 실패하면 예외를 발생시킵니다), stream(예외 메시지와 원시 메시지를 가상 컬럼 `_error` 및 `_raw_message`에 저장합니다), dead_letter_queue(오류 관련 데이터를 `system.dead_letter_queue`에 저장합니다).
- `kafka_commit_on_select` — `SELECT` 쿼리가 실행될 때 메시지를 커밋합니다. 기본값: `false`.
- `kafka_max_rows_per_message` — 행 기반 포맷에서 Kafka 메시지 하나에 기록되는 최대 행 수입니다. 기본값: `1`.
- `kafka_compression_codec` — 메시지를 생성(프로듀스)하는 데 사용되는 압축 코덱입니다. 지원되는 값: 빈 문자열, `none`, `gzip`, `snappy`, `lz4`, `zstd`. 빈 문자열인 경우 테이블에서 압축 코덱을 설정하지 않으므로, 설정 파일의 값이나 `librdkafka`의 기본값이 사용됩니다. 기본값: 빈 문자열입니다.
- `kafka_compression_level` — `kafka_compression_codec`으로 선택된 알고리즘에 대한 압축 수준 매개변수입니다. 값이 높을수록 CPU 사용량 증가를 대가로 더 나은 압축률을 제공합니다. 사용 가능한 범위는 알고리즘에 따라 다릅니다: `gzip`의 경우 `[0-9]`; `lz4`의 경우 `[0-12]`; `snappy`의 경우 `0`만; `zstd`의 경우 `[0-12]`; `-1`은 코덱별 기본 압축 수준을 의미합니다. 기본값: `-1`.

Examples:

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
  <summary>사용이 중단된 테이블 생성 방법</summary>

  :::note
  새 프로젝트에서는 이 방법을 사용하지 마십시오. 가능하다면 기존 프로젝트를 위에서 설명한 방법으로 전환하십시오.
  :::

  ```sql
  Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
        [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_consumer_reschedule_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
  ```
</details>

:::info
Kafka 테이블 엔진은 [기본값](/sql-reference/statements/create/table#default_values)이 있는 컬럼을 지원하지 않습니다. 기본값이 필요한 컬럼은 아래에 설명된 것처럼 materialized view 수준에서 추가할 수 있습니다.
:::


## 설명 \{#description\}

전달된 메시지는 자동으로 추적되므로, 그룹 내 각 메시지는 한 번만 집계됩니다. 동일한 데이터를 두 번 처리하려면 다른 그룹 이름으로 테이블 복사본을 생성하면 됩니다.

그룹은 유연하며 클러스터에서 동기화됩니다. 예를 들어 10개의 토픽과 클러스터에 5개의 테이블 복사본이 있는 경우, 각 복사본은 2개의 토픽을 처리합니다. 복사본 수가 변경되면 토픽이 복사본 사이에서 자동으로 재분배됩니다. 이에 대한 자세한 내용은 http://kafka.apache.org/intro 를 참고하십시오.

각 Kafka 토픽에 전용 consumer group을 두어 토픽과 그룹이 배타적으로 1:1로 연결되도록 구성하는 것이 좋습니다. 특히 토픽이 동적으로 생성·삭제될 수 있는 환경(예: 테스트 또는 스테이징)에서는 이러한 구성이 바람직합니다.

각 메시지는 한 번만 읽을 수 있기 때문에 `SELECT`는 (디버깅을 제외하면) 메시지를 읽는 데 그다지 유용하지 않습니다. 실시간 처리를 위해서는 materialized view를 사용하여 실시간 처리 흐름을 구성하는 것이 더 실용적입니다. 이를 위해서는 다음을 수행합니다:

1. 엔진을 사용해 Kafka consumer를 생성하고, 이를 데이터 스트림으로 간주합니다.
2. 원하는 구조를 가진 테이블을 생성합니다.
3. 엔진에서 나오는 데이터를 변환하여 미리 생성해 둔 테이블에 적재하는 materialized view를 생성합니다.

`MATERIALIZED VIEW`가 엔진에 연결되면 백그라운드에서 데이터를 수집하기 시작합니다. 이를 통해 Kafka에서 메시지를 지속적으로 수신하고, `SELECT`를 사용하여 필요한 형식으로 변환할 수 있습니다. 하나의 Kafka 테이블에는 원하는 만큼 materialized view를 연결할 수 있으며, 이들은 Kafka 테이블에서 직접 데이터를 읽지 않고 새 레코드(블록 단위)를 수신합니다. 이렇게 하면 서로 다른 상세 수준(그룹화·집계가 있는 경우와 없는 경우)의 여러 테이블에 동시에 기록할 수 있습니다.

예:

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

성능을 향상하기 위해 수신된 메시지는 [max&#95;insert&#95;block&#95;size](../../../operations/settings/settings.md#max_insert_block_size) 크기의 블록으로 그룹화됩니다. [stream&#95;flush&#95;interval&#95;ms](/operations/settings/settings#stream_flush_interval_ms) 밀리초 이내에 블록이 형성되지 않으면, 블록이 완전한지 여부와 관계없이 데이터가 테이블로 저장됩니다.

토픽 데이터 수신을 중지하거나 변환 로직을 변경하려면 materialized view를 detach하십시오:

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

`ALTER`를 사용하여 대상 테이블을 변경하려는 경우, 대상 테이블과 뷰에서 오는 데이터 간의 불일치를 방지하도록 구체화된 뷰(Materialized View)를 비활성화하는 것이 좋습니다.


## 설정 \{#configuration\}

GraphiteMergeTree와 마찬가지로 Kafka 엔진은 ClickHouse 설정 파일을 사용한 확장 구성을 지원합니다. 사용할 수 있는 설정 키는 두 가지이며, 전역 키(`&lt;kafka&gt;` 아래)와 토픽 수준 키(`&lt;kafka&gt;&lt;kafka_topic&gt;` 아래)입니다. 전역 설정이 먼저 적용된 다음, 토픽 수준 설정이 존재하는 경우 해당 설정이 추가로 적용됩니다.

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

사용 가능한 설정 옵션 목록은 [librdkafka configuration reference](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)를 참조하십시오. ClickHouse 설정에서는 점(`.`) 대신 밑줄(`_`)을 사용합니다. 예를 들어 `check.crcs=true`는 `<check_crcs>true</check_crcs>`가 됩니다.


### Kerberos 지원 \{#kafka-kerberos-support\}

Kerberos를 사용하는 Kafka를 처리하려면 `security_protocol` 하위 요소에 `sasl_plaintext` 값을 추가합니다. Kerberos 티켓 발급 티켓(TGT)이 운영체제 기능을 통해 미리 발급되어 캐시되어 있으면 충분합니다.
ClickHouse는 keytab 파일을 사용하여 Kerberos 자격 증명을 유지 관리할 수 있습니다. `sasl_kerberos_service_name`, `sasl_kerberos_keytab`, `sasl_kerberos_principal` 하위 요소를 사용할 수 있습니다.

예:

```xml
<!-- Kerberos-aware Kafka -->
<kafka>
  <security_protocol>SASL_PLAINTEXT</security_protocol>
  <sasl_kerberos_keytab>/home/kafkauser/kafkauser.keytab</sasl_kerberos_keytab>
  <sasl_kerberos_principal>kafkauser/kafkahost@EXAMPLE.COM</sasl_kerberos_principal>
</kafka>
```


## 가상 컬럼(Virtual columns) \{#virtual-columns\}

- `_topic` — Kafka 토픽. 데이터 타입: `LowCardinality(String)`.
- `_key` — 메시지 키. 데이터 타입: `String`.
- `_offset` — 메시지 오프셋. 데이터 타입: `UInt64`.
- `_timestamp` — 메시지 타임스탬프. 데이터 타입: `Nullable(DateTime)`.
- `_timestamp_ms` — 메시지의 밀리초 단위 타임스탬프. 데이터 타입: `Nullable(DateTime64(3))`.
- `_partition` — Kafka 토픽의 파티션. 데이터 타입: `UInt64`.
- `_headers.name` — 메시지 헤더 키의 배열. 데이터 타입: `Array(String)`.
- `_headers.value` — 메시지 헤더 값의 배열. 데이터 타입: `Array(String)`.

`kafka_handle_error_mode='stream'`일 때 추가되는 가상 컬럼:

- `_raw_message` - 성공적으로 파싱되지 않은 원본 메시지. 데이터 타입: `String`.
- `_error` - 파싱 실패 시 발생한 예외 메시지. 데이터 타입: `String`.

참고: `_raw_message`와 `_error` 가상 컬럼은 파싱 중 예외가 발생한 경우에만 채워지며, 메시지가 성공적으로 파싱된 경우에는 항상 비어 있습니다.

## 데이터 포맷 지원 \{#data-formats-support\}

Kafka 엔진은 ClickHouse에서 지원하는 모든 [포맷](../../../interfaces/formats.md)을 지원합니다.
하나의 Kafka 메시지에 포함되는 행 수는 포맷이 row 기반인지 block 기반인지에 따라 달라집니다.

- row 기반 포맷의 경우 하나의 Kafka 메시지에 포함되는 행 수는 `kafka_max_rows_per_message` 설정으로 제어할 수 있습니다.
- block 기반 포맷의 경우 block을 더 작은 파트로 나눌 수는 없지만, 하나의 block에 포함되는 행 수는 일반 설정인 [max_block_size](/operations/settings/settings#max_block_size)로 제어할 수 있습니다.

## ClickHouse Keeper에 커밋된 오프셋을 저장하는 엔진 \{#engine-to-store-committed-offsets-in-clickhouse-keeper\}

<ExperimentalBadge />

`allow_experimental_kafka_offsets_storage_in_keeper`가 활성화되어 있으면 Kafka 테이블 엔진에 대해 다음 두 가지 설정을 추가로 지정할 수 있습니다.

* `kafka_keeper_path`는 ClickHouse Keeper에서 테이블의 경로를 지정합니다.
* `kafka_replica_name`는 ClickHouse Keeper에서 레플리카 이름을 지정합니다.

두 설정은 모두 지정하거나 둘 다 지정하지 않아야 합니다. 두 설정이 모두 지정되면 새로운 실험적 Kafka 엔진이 사용됩니다. 이 새로운 엔진은 커밋된 오프셋을 Kafka에 저장하는 것에 의존하지 않고 이를 ClickHouse Keeper에 저장합니다. 여전히 Kafka에 오프셋을 커밋하려고 시도하지만, 테이블이 생성될 때에만 해당 오프셋에 의존합니다. 그 외의 상황(테이블이 재시작되거나 어떤 오류 이후에 복구되는 경우)에는 ClickHouse Keeper에 저장된 오프셋이 이후 메시지를 계속 소비하기 위한 기준 오프셋으로 사용됩니다. 커밋된 오프셋뿐만 아니라 마지막 배치에서 얼마나 많은 메시지가 소비되었는지도 함께 저장하므로, INSERT가 실패하면 동일한 수의 메시지가 다시 소비되어 필요한 경우 중복 제거가 가능해집니다.

예시:

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```


### 알려진 제한 사항 \{#known-limitations\}

새 엔진은 실험적 단계이므로 아직 프로덕션 환경에서 사용할 준비가 되어 있지 않습니다. 구현에는 다음과 같은 알려진 제한 사항이 있습니다.

- 가장 큰 제한은 엔진이 직접 읽기를 지원하지 않는다는 점입니다. materialized view를 사용해 엔진에서 읽기를 수행하는 것과 엔진으로의 쓰기는 동작하지만, 직접 읽기는 동작하지 않습니다. 그 결과, 모든 직접 `SELECT` 쿼리는 실패합니다.
- 테이블을 빠르게 삭제했다가 다시 생성하거나, 동일한 ClickHouse Keeper 경로를 서로 다른 엔진에 지정하면 문제가 발생할 수 있습니다. 모범 사례로, 경로 충돌을 피하기 위해 `kafka_keeper_path`에 `{uuid}`를 사용하는 것이 좋습니다.
- repeatable read를 보장하려면, 단일 스레드에서 여러 파티션의 메시지를 동시에 소비할 수 없습니다. 한편, Kafka 컨슈머는 살아 있도록 정기적으로 폴링해야 합니다. 이 두 가지 요구사항을 모두 충족하기 위해, `kafka_thread_per_consumer`가 활성화된 경우에만 여러 컨슈머를 생성할 수 있도록 했습니다. 그렇지 않으면 컨슈머를 정기적으로 폴링하는 것과 관련된 문제를 피하는 작업이 지나치게 복잡해지기 때문입니다.
- 새 스토리지 엔진으로 생성된 컨슈머는 [`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md) 테이블에 표시되지 않습니다.

**함께 보기**

- [가상 컬럼](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)
- [system.kafka_consumers](../../../operations/system-tables/kafka_consumers.md)