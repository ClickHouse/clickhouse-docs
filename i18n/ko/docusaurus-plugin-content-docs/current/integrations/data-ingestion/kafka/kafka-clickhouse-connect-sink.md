---
'sidebar_label': 'ClickHouse Kafka Connect Sink'
'sidebar_position': 2
'slug': '/integrations/kafka/clickhouse-kafka-connect-sink'
'description': 'ClickHouse의 공식 Kafka 커넥터입니다.'
'title': 'ClickHouse Kafka Connect Sink'
'doc_type': 'guide'
'keywords':
- 'ClickHouse Kafka Connect Sink'
- 'Kafka connector ClickHouse'
- 'official ClickHouse connector'
- 'ClickHouse Kafka integration'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# ClickHouse Kafka Connect Sink

:::note
도움이 필요하시면, [저장소에 문제를 제기해 주세요](https://github.com/ClickHouse/clickhouse-kafka-connect/issues) 또는 [ClickHouse 공개 Slack](https://clickhouse.com/slack)에서 질문해 주세요.
:::
**ClickHouse Kafka Connect Sink**는 Kafka 주제로부터 ClickHouse 테이블로 데이터를 전송하는 Kafka 커넥터입니다.
### License {#license}

Kafka Connector Sink는 [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0) 아래 배포됩니다.
### Requirements for the environment {#requirements-for-the-environment}

환경에 [Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html) 프레임워크 v2.7 이상이 설치되어 있어야 합니다.
### Version compatibility matrix {#version-compatibility-matrix}

| ClickHouse Kafka Connect version | ClickHouse version | Kafka Connect | Confluent platform |
|----------------------------------|--------------------|---------------|--------------------|
| 1.0.0                            | > 23.3             | > 2.7         | > 6.1              |
### Main features {#main-features}

- 아웃오브박스의 for 정확하게 한번 실행되는 의미를 가지고 배포됩니다. 이는 커넥터에 의해 상태 저장소로 사용되는 새로운 ClickHouse 핵심 기능인 [KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976) 에 의해 구동되며 최소한의 아키텍처를 허용합니다.
- 타사 상태 저장소 지원: 현재는 인메모리 기본값을 사용하지만 KeeperMap을 사용할 수 있습니다(곧 Redis 추가 예정).
- 핵심 통합: ClickHouse에 의해 구축, 유지 및 지원됩니다.
- [ClickHouse Cloud](https://clickhouse.com/cloud)와 지속적으로 테스트됩니다.
- 선언된 스키마와 스키마가 없는 데이터에 대한 데이터 삽입.
- ClickHouse의 모든 데이터 타입을 지원합니다.
### Installation instructions {#installation-instructions}
#### Gather your connection details {#gather-your-connection-details}

<ConnectionDetails />
#### General installation instructions {#general-installation-instructions}

커넥터는 플러그인을 실행하는 데 필요한 모든 클래스 파일을 포함하는 단일 JAR 파일로 배포됩니다.

플러그인을 설치하려면 다음 단계를 따르세요:

- [Releases](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) 페이지에서 ClickHouse Kafka Connect Sink 저장소에 있는 Connector JAR 파일이 포함된 zip 아카이브를 다운로드합니다.
- ZIP 파일 콘텐츠를 추출하여 원하는 위치에 복사합니다.
- Confluent Platform이 플러그인을 찾을 수 있도록 Connect 속성 파일에서 [plugin.path](https://kafka.apache.org/documentation/#connectconfigs_plugin.path) 구성에 플러그인 디렉터리에 대한 경로를 추가합니다.
- config에서 주제 이름, ClickHouse 인스턴스 호스트 이름 및 비밀번호를 제공합니다.

```yml
connector.class=com.clickhouse.kafka.connect.ClickHouseSinkConnector
tasks.max=1
topics=<topic_name>
ssl=true
jdbcConnectionProperties=?sslmode=STRICT
security.protocol=SSL
hostname=<hostname>
database=<database_name>
password=<password>
ssl.truststore.location=/tmp/kafka.client.truststore.jks
port=8443
value.converter.schemas.enable=false
value.converter=org.apache.kafka.connect.json.JsonConverter
exactlyOnce=true
username=default
schemas.enable=false
```

- Confluent Platform을 재시작합니다.
- Confluent Platform을 사용하는 경우, Confluent Control Center UI에 로그인하여 ClickHouse Sink가 사용 가능한 커넥터 목록에 있는지 확인합니다.
### Configuration options {#configuration-options}

ClickHouse Sink를 ClickHouse 서버에 연결하려면 다음을 제공해야 합니다:

- 연결 세부정보: 호스트 이름(**필수**) 및 포트(선택적)
- 사용자 자격 증명: 비밀번호(**필수**) 및 사용자 이름(선택적)
- 커넥터 클래스: `com.clickhouse.kafka.connect.ClickHouseSinkConnector` (**필수**)
- topics 또는 topics.regex: 폴링할 Kafka 주제 - 주제 이름은 테이블 이름과 일치해야 합니다(**필수**)
- 키 및 값 변환기: 주제의 데이터 유형에 따라 설정하십시오. 작업자 구성에서 이미 정의되지 않은 경우 필수입니다.

전체 구성 옵션 테이블:

| Property Name                                   | Description                                                                                                                                                                                                                        | Default Value                                            |
|-------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------|
| `hostname` (Required)                           | 서버의 호스트 이름 또는 IP 주소                                                                                                                                                                                               | N/A                                                      |
| `port`                                          | ClickHouse 포트 - 기본값은 8443 (클라우드의 경우 HTTPS), 그러나 HTTP(자체 호스팅의 기본값)에는 8123이어야 합니다                                                                                                       | `8443`                                                   |
| `ssl`                                           | ClickHouse에 대한 ssl 연결을 활성화합니다                                                                                                                                                                                  | `true`                                                   |
| `jdbcConnectionProperties`                      | Clickhouse에 연결할 때의 연결 속성. `?`로 시작하고 `param=value` 사이에 `&`로 연결되어야 합니다                                                                                                                 | `""`                                                     |
| `username`                                      | ClickHouse 데이터베이스 사용자 이름                                                                                                                                                                                              | `default`                                                |
| `password` (Required)                           | ClickHouse 데이터베이스 비밀번호                                                                                                                                                                                                 | N/A                                                      |
| `database`                                      | ClickHouse 데이터베이스 이름                                                                                                                                                                                                    | `default`                                                |
| `connector.class` (Required)                    | 커넥터 클래스(명시적으로 설정하고 기본값을 유지)                                                                                                                                                                               | `"com.clickhouse.kafka.connect.ClickHouseSinkConnector"` |
| `tasks.max`                                     | 커넥터 작업 수                                                                                                                                                                                                                  | `"1"`                                                    |
| `errors.retry.timeout`                          | ClickHouse JDBC 재시도 시간 초과                                                                                                                                                                                                  | `"60"`                                                   |
| `exactlyOnce`                                   | 정확히 한 번 실행 활성화                                                                                                                                                                                                                 | `"false"`                                                |
| `topics` (Required)                             | 폴링할 Kafka 주제 - 주제 이름은 테이블 이름과 일치해야 합니다                                                                                                                                                                 | `""`                                                     |
| `key.converter` (Required* - See Description)   | 키에 따라 설정합니다. 키를 전달하는 경우(그리고 작업자 구성에 정의되지 않은 경우) 필수입니다.                                                                                                                      | `"org.apache.kafka.connect.storage.StringConverter"`     |
| `value.converter` (Required* - See Description) | 주제의 데이터 유형에 따라 설정합니다. 지원되는 형식: - JSON, String, Avro 또는 Protobuf 형식. 작업자 구성에 정의되지 않은 경우 여기서 필수입니다.                                                               | `"org.apache.kafka.connect.json.JsonConverter"`          |
| `value.converter.schemas.enable`                | 커넥터 값 변환기 스키마 지원                                                                                                                                                                                                     | `"false"`                                                |
| `errors.tolerance`                              | 커넥터 오류 허용. 지원: none, all                                                                                                                                                                                                | `"none"`                                                 |
| `errors.deadletterqueue.topic.name`             | 설정된 경우(errors.tolerance=all) 실패한 배치에 대해 DLQ가 사용됩니다 (자세한 내용은 [문제 해결](#troubleshooting) 참조)                                                                                      | `""`                                                     |
| `errors.deadletterqueue.context.headers.enable` | DLQ를 위한 추가 헤더를 추가합니다                                                                                                                                                                                                | `""`                                                     |
| `clickhouseSettings`                            | ClickHouse 설정의 쉼표로 구분된 목록 (예: "insert_quorum=2, 등...")                                                                                                                                                           | `""`                                                     |
| `topic2TableMap`                                | 주제 이름을 테이블 이름에 매핑하는 쉼표로 구분된 목록 (예: "topic1=table1, topic2=table2, 등...")                                                                                                     | `""`                                                     |
| `tableRefreshInterval`                          | 테이블 정의 캐시를 새로 고치는 시간(초)                                                                                                                                                                                                      | `0`                                                      |
| `keeperOnCluster`                               | 자체 호스팅 인스턴스에 대한 ON CLUSTER 매개변수를 구성할 수 있습니다 (예: `ON CLUSTER configFile정의 clusterName`) 정확히 한 번 연결 상태 테이블에 대해 (자세한 내용은 [분산 DDL 쿼리](/sql-reference/distributed-ddl) 참조)         | `""`                                                     |
| `bypassRowBinary`                               | 스키마 기반 데이터(Avro, Protobuf 등)에 대해 RowBinary 및 RowBinaryWithDefaults 사용을 비활성화 할 수 있습니다 - 데이터에 누락된 열이 있을 경우만 사용해야 하며 Nullable/Default는 허용되지 않습니다.                             | `"false"`                                                |
| `dateTimeFormats`                               | DateTime64 스키마 필드를 파싱하기 위한 날짜 시간 형식, `;`로 구분하여 설정 (예: `someDateField=yyyy-MM-dd HH:mm:ss.SSSSSSSSS;someOtherDateField=yyyy-MM-dd HH:mm:ss`).                                                | `""`                                                     |
| `tolerateStateMismatch`                         | 커넥터가 AFTER_PROCESSING 저장된 현재 오프셋보다 "이전" 레코드를 삭제할 수 있습니다 (예: 오프셋 5가 전송되고, 마지막 기록된 오프셋이 250인 경우)                                                                                     | `"false"`                                                |
| `ignorePartitionsWhenBatching`                  | 삽입을 위해 메시지를 수집할 때 파티션을 무시하게 됩니다 (정확히 한 번이 `false`일 경우에만). 성능 주: 커넥터 작업이 많을수록 작업당 할당된 kafka 파티션이 적어지며, 이는 수익이 줄어들 수 있습니다.                           | `"false"`                                                |
### Target tables {#target-tables}

ClickHouse Connect Sink는 Kafka 주제에서 메시지를 읽고 적절한 테이블에 씁니다. ClickHouse Connect Sink는 기존 테이블에 데이터를 씁니다. 데이터를 삽입하기 전에 ClickHouse에서 적절한 스키마를 가진 대상 테이블이 생성되었는지 확인하세요.

각 주제는 ClickHouse의 전용 대상 테이블이 필요합니다. 대상 테이블 이름은 소스 주제 이름과 일치해야 합니다.
### Pre-processing {#pre-processing}

ClickHouse Kafka Connect Sink에 전송되기 전에 아웃바운드 메시지를 변환해야 하는 경우 [Kafka Connect Transformations](https://docs.confluent.io/platform/current/connect/transforms/overview.html)를 사용하세요.
### Supported data types {#supported-data-types}

**스키마가 선언된 경우:**

| Kafka Connect Type                      | ClickHouse Type       | Supported | Primitive |
| --------------------------------------- |-----------------------| --------- | --------- |
| STRING                                  | String                | ✅        | Yes       |
| STRING                                  | JSON. 아래 참조 (1)             | ✅        | Yes       |
| INT8                                    | Int8                  | ✅        | Yes       |
| INT16                                   | Int16                 | ✅        | Yes       |
| INT32                                   | Int32                 | ✅        | Yes       |
| INT64                                   | Int64                 | ✅        | Yes       |
| FLOAT32                                 | Float32               | ✅        | Yes       |
| FLOAT64                                 | Float64               | ✅        | Yes       |
| BOOLEAN                                 | Boolean               | ✅        | Yes       |
| ARRAY                                   | Array(T)              | ✅        | No        |
| MAP                                     | Map(Primitive, T)     | ✅        | No        |
| STRUCT                                  | Variant(T1, T2, ...)    | ✅        | No        |
| STRUCT                                  | Tuple(a T1, b T2, ...)  | ✅        | No        |
| STRUCT                                  | Nested(a T1, b T2, ...) | ✅        | No        |
| STRUCT                                  | JSON. 아래 참조 (1), (2)          | ✅        | No        |
| BYTES                                   | String                | ✅        | No        |
| org.apache.kafka.connect.data.Time      | Int64 / DateTime64    | ✅        | No        |
| org.apache.kafka.connect.data.Timestamp | Int32 / Date32        | ✅        | No        |
| org.apache.kafka.connect.data.Decimal   | Decimal               | ✅        | No        |

- (1) - JSON은 ClickHouse 설정에 `input_format_binary_read_json_as_string=1`이 있을 때만 지원됩니다. 이는 RowBinary 형식 계열에서만 작동하며 해당 설정은 모든 열에 영향을 미치므로 모두 문자열이어야 합니다. 이 경우 커넥터는 STRUCT를 JSON 문자열로 변환합니다.

- (2) - struct에 `oneof`와 같은 유니온이 있을 경우, 변환기는 필드 이름에 대한 접두사/접미사를 추가하지 않도록 구성되어야 합니다. `ProtobufConverter`에 대한 설정이 `generate.index.for.unions=false`가 있습니다. [자세한 내용은](https://docs.confluent.io/platform/current/schema-registry/connect.html#protobuf).

**스키마가 선언되지 않은 경우:**

레코드는 JSON으로 변환되어 [JSONEachRow](/interfaces/formats/JSONEachRow) 형식의 값으로 ClickHouse에 전송됩니다.
### Configuration recipes {#configuration-recipes}

아래는 빠르게 시작하기 위한 일반적인 구성 레시피입니다.
#### Basic configuration {#basic-configuration}

시작하기 위한 가장 기본적인 구성 - 이는 분산 모드에서 Kafka Connect를 실행하며 SSL이 활성화된 `localhost:8443`에 ClickHouse 서버가 실행 중이라는 가정을 합니다. 데이터는 스키마가 없는 JSON입니다.

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    "tasks.max": "1",
    "consumer.override.max.poll.records": "5000",
    "consumer.override.max.partition.fetch.bytes": "5242880",
    "database": "default",
    "errors.retry.timeout": "60",
    "exactlyOnce": "false",
    "hostname": "localhost",
    "port": "8443",
    "ssl": "true",
    "jdbcConnectionProperties": "?ssl=true&sslmode=strict",
    "username": "default",
    "password": "<PASSWORD>",
    "topics": "<TOPIC_NAME>",
    "value.converter": "org.apache.kafka.connect.json.JsonConverter",
    "value.converter.schemas.enable": "false",
    "clickhouseSettings": ""
  }
}
```
#### Basic configuration with multiple topics {#basic-configuration-with-multiple-topics}

커넥터는 여러 주제에서 데이터를 소비할 수 있습니다.

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "topics": "SAMPLE_TOPIC, ANOTHER_TOPIC, YET_ANOTHER_TOPIC",
    ...
  }
}
```
#### Basic configuration with DLQ {#basic-configuration-with-dlq}

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "errors.tolerance": "all",
    "errors.deadletterqueue.topic.name": "<DLQ_TOPIC>",
    "errors.deadletterqueue.context.headers.enable": "true",
  }
}
```
#### Using with different data formats {#using-with-different-data-formats}
##### Avro schema support {#avro-schema-support}

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "value.converter": "io.confluent.connect.avro.AvroConverter",
    "value.converter.schema.registry.url": "<SCHEMA_REGISTRY_HOST>:<PORT>",
    "value.converter.schemas.enable": "true",
  }
}
```
##### Protobuf schema support {#protobuf-schema-support}

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "value.converter": "io.confluent.connect.protobuf.ProtobufConverter",
    "value.converter.schema.registry.url": "<SCHEMA_REGISTRY_HOST>:<PORT>",
    "value.converter.schemas.enable": "true",
  }
}
```

문제 발생 시 주의: 누락된 클래스로 문제에 직면하면, 모든 환경에 protobuf 변환기가 포함되지 않으므로, 종속성이 포함된 대체 버전을 jar로 제공해야 할 수 있습니다.
##### JSON schema support {#json-schema-support}

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "value.converter": "org.apache.kafka.connect.json.JsonConverter",
  }
}
```
##### String support {#string-support}

커넥터는 [JSON](/interfaces/formats/JSONEachRow), [CSV](/interfaces/formats/CSV) 및 [TSV](/interfaces/formats/TabSeparated)와 같은 다양한 ClickHouse 형식에서 String 변환기를 지원합니다.

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "value.converter": "org.apache.kafka.connect.storage.StringConverter",
    "customInsertFormat": "true",
    "insertFormat": "CSV"
  }
}
```
### Logging {#logging}

로깅은 Kafka Connect 플랫폼에 의해 자동으로 제공됩니다.
로깅 대상 및 형식은 Kafka connect [구성 파일](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file)을 통해 구성할 수 있습니다.

Confluent Platform을 사용하는 경우, CLI 명령을 실행하여 로그를 볼 수 있습니다:

```bash
confluent local services connect log
```

추가 세부정보는 공식 [튜토리얼](https://docs.confluent.io/platform/current/connect/logging.html)을 참조하십시오.
### Monitoring {#monitoring}

ClickHouse Kafka Connect는 [Java Management Extensions (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html)를 통해 런타임 메트릭을 보고합니다. JMX는 기본적으로 Kafka Connector에서 활성화됩니다.
#### ClickHouse-Specific Metrics {#clickhouse-specific-metrics}

커넥터는 다음 MBean 이름을 통해 사용자 정의 메트릭을 노출합니다:

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

| Metric Name           | Type | Description                                                                             |
|-----------------------|------|-----------------------------------------------------------------------------------------|
| `receivedRecords`    | long | 수신된 총 레코드 수                                                                         |
| `recordProcessingTime` | long | 레코드를 그룹화하고 통합 구조로 변환하는 데 소요된 총 시간(나노초 단위)                                    |
| `taskProcessingTime`   | long | ClickHouse에 데이터를 처리하고 삽입하는 데 소요된 총 시간(나노초 단위)                                    |
#### Kafka Producer/Consumer Metrics {#kafka-producer-consumer-metrics}

커넥터는 데이터 흐름, 처리량 및 성능에 대한 통찰력을 제공하는 표준 Kafka 생산자 및 소비자 메트릭을 노출합니다.

**주제 수준 메트릭:**
- `records-sent-total`: 주제로 전송된 총 레코드 수
- `bytes-sent-total`: 주제로 전송된 총 바이트 수
- `record-send-rate`: 초당 전송된 레코드의 평균 속도
- `byte-rate`: 초당 전송된 바이트의 평균
- `compression-rate`: 달성한 압축 비율

**파티션 수준 메트릭:**
- `records-sent-total`: 파티션으로 전송된 총 레코드 수
- `bytes-sent-total`: 파티션으로 전송된 총 바이트 수
- `records-lag`: 현재 파티션의 대기 시간
- `records-lead`: 현재 파티션의 리드
- `replica-fetch-lag`: 복제본에 대한 대기 시간 정보

**노드 수준 연결 메트릭:**
- `connection-creation-total`: Kafka 노드에 대해 생성된 총 연결 수
- `connection-close-total`: 종료된 총 연결 수
- `request-total`: 노드에 발송된 총 요청
- `response-total`: 노드로부터 수신된 총 응답
- `request-rate`: 초당 평균 요청 속도
- `response-rate`: 초당 평균 응답 속도

이 메트릭은 다음을 모니터링하는 데 도움이 됩니다:
- **처리량**: 데이터 수집 속도 추적
- **대기**: 병목 현상 및 처리 지연 식별
- **압축**: 데이터 압축 효율성 측정
- **연결 건강**: 네트워크 연결성 및 안정성 모니터링
#### Kafka Connect Framework Metrics {#kafka-connect-framework-metrics}

커넥터는 Kafka Connect 프레임워크와 통합되며 작업 생애 주기 및 오류 추적을 위한 메트릭을 노출합니다.

**작업 상태 메트릭:**
- `task-count`: 커넥터의 총 작업 수
- `running-task-count`: 현재 실행 중인 작업 수
- `paused-task-count`: 현재 일시 중지된 작업 수
- `failed-task-count`: 실패한 작업 수
- `destroyed-task-count`: 삭제된 작업 수
- `unassigned-task-count`: 할당되지 않은 작업 수

작업 상태 값에는 `running`, `paused`, `failed`, `destroyed`, `unassigned`가 포함됩니다.

**오류 메트릭:**
- `deadletterqueue-produce-failures`: DLQ 쓰기 실패 수
- `deadletterqueue-produce-requests`: 총 DLQ 쓰기 시도
- `last-error-timestamp`: 마지막 오류의 타임스탬프
- `records-skip-total`: 오류로 인해 건너뛴 총 레코드 수
- `records-retry-total`: 재시도된 총 레코드 수
- `errors-total`: 발생한 총 오류 수

**성능 메트릭:**
- `offset-commit-failures`: 실패한 오프셋 커밋 수
- `offset-commit-avg-time-ms`: 오프셋 커밋의 평균 시간
- `offset-commit-max-time-ms`: 오프셋 커밋의 최대 시간
- `put-batch-avg-time-ms`: 배치 처리의 평균 시간
- `put-batch-max-time-ms`: 배치 처리의 최대 시간
- `source-record-poll-total`: 총 폴링된 레코드 수
#### Monitoring Best Practices {#monitoring-best-practices}

1. **소비자 대기 모니터링**: `records-lag`를 각 파티션별로 추적하여 처리 병목 현상을 식별합니다.
2. **오류 비율 추적**: `errors-total` 및 `records-skip-total`을 주시하여 데이터 품질 문제를 감지합니다.
3. **작업 건강 관찰**: 작업 상태 메트릭을 모니터링하여 작업이 제대로 실행되고 있는지 확인합니다.
4. **처리량 측정**: `records-send-rate` 및 `byte-rate`를 사용하여 수집 성능을 추적합니다.
5. **연결 건강 모니터링**: 네트워크 문제를 위해 노드 수준 연결 메트릭을 확인합니다.
6. **압축 효율성 추적**: `compression-rate`를 사용하여 데이터 전송을 최적화합니다.

자세한 JMX 메트릭 정의 및 Prometheus 통합은 [jmx-export-connector.yml](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/main/jmx-export-connector.yml) 구성 파일을 참조하세요.
### Limitations {#limitations}

- 삭제는 지원되지 않습니다.
- 배치 크기는 Kafka 소비자 속성에서 상속됩니다.
- 정확히 한번을 위해 KeeperMap을 사용하는 경우 오프셋이 변경되거나 되감기 되면 해당 주제에 대해 KeeperMap의 내용을 삭제해야 합니다. (자세한 내용은 아래 문제 해결 가이드를 참조하세요)
### Performance tuning and throughput optimization {#tuning-performance}

이 섹션에서는 ClickHouse Kafka Connect Sink의 성능 조정 전략을 다룹니다. 성능 조정은 높은 처리량 사용 사례를 처리하거나 자원 사용을 최적화하고 지연 시간을 최소화할 때 필수적입니다.
#### When is performance tuning needed? {#when-is-performance-tuning-needed}

성능 조정은 일반적으로 다음과 같은 시나리오에서 필요합니다:

- **높은 처리량 작업 부하**: Kafka 주제에서 초당 수백만 개의 이벤트를 처리할 때
- **소비자 대기**: 커넥터가 데이터 생산 속도를 따라가지 못해 대기가 증가하는 경우
- **자원 제약**: CPU, 메모리 또는 네트워크 사용을 최적화해야 하는 경우
- **여러 주제**: 동시에 여러 고용량 주제로부터 소비할 때
- **작은 메시지 크기**: 서버 측 배치의 이점을 받을 수 있는 많은 작은 메시지를 처리할 때

성능 조정은 **일반적으로 필요하지 않습니다**:

- 낮거나 보통의 볼륨을 처리할 때 (< 10,000 메시지/초)
- 소비자 대기가 안정적이며 사용 사례에 적합할 때
- 기본 커넥터 설정이 이미 처리량 요구사항을 충족할 때
- ClickHouse 클러스터가 들어오는 부하를 쉽게 처리할 수 있을 때
#### Understanding the data flow {#understanding-the-data-flow}

조정하기 전에 데이터가 커넥터를 통해 흐르는 방식을 이해하는 것이 중요합니다:

1. **Kafka Connect 프레임워크**가 백그라운드에서 Kafka 주제에서 메시지를 가져옵니다.
2. **커넥터가** 프레임워크의 내부 버퍼에서 메시지를 폴링합니다.
3. **커넥터가** 폴링 크기에 따라 메시지를 배치합니다.
4. **ClickHouse가** HTTP/S를 통해 배치 삽입을 수신합니다.
5. **ClickHouse가** 삽입을 처리합니다(동기 또는 비동기).

성능은 이러한 각 단계에서 최적화할 수 있습니다.
#### Kafka Connect batch size tuning {#connect-fetch-vs-connector-poll}

최적화의 첫 번째 수준은 커넥터가 Kafka로부터 배치당 가져오는 데이터 양을 제어하는 것입니다.
##### Fetch settings {#fetch-settings}

Kafka Connect(프레임워크)는 커넥터와 독립적으로 백그라운드에서 Kafka 주제로부터 메시지를 가져옵니다.

- **`fetch.min.bytes`**: 프레임워크가 커넥터에 값을 전달하기 전의 최소 데이터 양 (기본값: 1 바이트)
- **`fetch.max.bytes`**: 단일 요청으로 가져올 최대 데이터 양 (기본값: 52428800 / 50 MB)
- **`fetch.max.wait.ms`**: `fetch.min.bytes`가 충족되지 않을 경우 데이터 반환까지 대기할 최대 시간 (기본값: 500 ms)
##### Poll settings {#poll-settings}

커넥터는 프레임워크의 버퍼에서 메시지를 폴링합니다:

- **`max.poll.records`**: 단일 폴링에서 반환되는 최대 레코드 수 (기본값: 500)
- **`max.partition.fetch.bytes`**: 파티션당 최대 데이터 양 (기본값: 1048576 / 1 MB)
##### Recommended settings for high throughput {#recommended-batch-settings}

ClickHouse와 최적의 성능을 위해 더 큰 배치를 목표로 하는 것이 좋습니다:

```properties

# Increase the number of records per poll
consumer.max.poll.records=5000


# Increase the partition fetch size (5 MB)
consumer.max.partition.fetch.bytes=5242880


# Optional: Increase minimum fetch size to wait for more data (1 MB)
consumer.fetch.min.bytes=1048576


# Optional: Reduce wait time if latency is critical
consumer.fetch.max.wait.ms=300
```

**중요**: Kafka Connect의 가져오기 설정은 압축된 데이터를 나타내며, ClickHouse는 압축되지 않은 데이터를 수신합니다. 압축 비율에 따라 이러한 설정의 균형을 맞추십시오.

**트레이드오프**:
- **더 큰 배치** = ClickHouse 수집 성능 향상, 더 적은 파트, 적은 오버헤드
- **더 큰 배치** = 더 높은 메모리 사용량, 잠재적인 지연
- **너무 큰 배치** = 타임아웃, OutOfMemory 오류 위험 또는 `max.poll.interval.ms` 초과

자세한 내용: [Confluent 문서](https://docs.confluent.io/platform/current/connect/references/allconfigs.html#override-the-worker-configuration) | [Kafka 문서](https://kafka.apache.org/documentation/#consumerconfigs)
#### Asynchronous inserts {#asynchronous-inserts}

비동기 삽입은 커넥터가 상대적으로 작은 배치를 전송할 때 또는 ClickHouse에 배치 책임을 전가하여 수집을 추가로 최적화할 때 강력한 기능입니다.
##### When to use async inserts {#when-to-use-async-inserts}

비동기 삽입을 활성화하는 것을 고려하십시오:

- **많은 작은 배치**: 커넥터가 자주 작은 배치를 보냅니다 (< 1000 행당 배치)
- **높은 동시성**: 여러 커넥터 작업이 같은 테이블에 쓰고 있습니다.
- **분산 배포**: 서로 다른 호스트에서 많은 커넥터 인스턴스를 실행합니다.
- **파트 생성 오버헤드**: "너무 많은 파트" 오류가 발생하고 있습니다.
- **혼합 작업 부하**: 실시간 수집과 쿼리 작업 부하를 결합합니다.

비동기 삽입을 사용하지 마십시오:

- 이미 제어된 빈도로 큰 배치(> 10,000 행당 배치)를 보내고 있는 경우
- 즉시 데이터를 시각화해야 하는 경우(쿼리는 데이터를 즉시 봐야 함)
- `wait_for_async_insert=0`의 정확히 한 번 의미가 요구 사항과 충돌하는 경우
- 사용 사례가 클라이언트 측 배치 개선의 이점을 받을 수 있는 경우
##### How async inserts work {#how-async-inserts-work}

비동기 삽입이 활성화된 경우 ClickHouse는 다음과 같은 단계를 수행합니다:

1. 커넥터로부터 삽입 쿼리를 수신합니다.
2. 데이터를 메모리 버퍼에 씁니다(즉시 디스크로 전송하는 대신).
3. (가정: `wait_for_async_insert=0`인 경우) 커넥터에 성공을 반환합니다.
4. 다음 조건이 충족될 때까지 버퍼를 디스크에 플러시합니다:
   - 버퍼가 `async_insert_max_data_size` (기본값: 10 MB)에 도달합니다.
   - 첫 삽입 이후 `async_insert_busy_timeout_ms` 밀리초가 경과합니다 (기본값: 1000 ms).
   - 쿼리 수가 최대 수치(`async_insert_max_query_number`, 기본값: 100)에 도달합니다.

이는 생성되는 파트 수를 크게 줄이고 전체 처리량을 향상시킵니다.
##### Enabling async inserts {#enabling-async-inserts}

비동기 삽입 설정을 `clickhouseSettings` 구성 매개변수에 추가하십시오:

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "clickhouseSettings": "async_insert=1,wait_for_async_insert=1"
  }
}
```

**주요 설정**:

- **`async_insert=1`**: 비동기 삽입 활성화
- **`wait_for_async_insert=1`** (추천): 커넥터가 데이터가 ClickHouse 저장소에 플러시될 때까지 대기한 후 확인합니다. 전달 보장을 제공합니다.
- **`wait_for_async_insert=0`**: 커넥터가 즉시 확인합니다. 성능이 향상되지만, 플러시 전에 서버가 중단되면 데이터가 손실될 수 있습니다.
##### 비동기 삽입 동작 조정 {#tuning-async-inserts}

비동기 삽입 플러시 동작을 세밀하게 조정할 수 있습니다:

```json
"clickhouseSettings": "async_insert=1,wait_for_async_insert=1,async_insert_max_data_size=10485760,async_insert_busy_timeout_ms=1000"
```

일반적인 조정 매개변수:

- **`async_insert_max_data_size`** (기본값: 10485760 / 10 MB): 플러시 전 최대 버퍼 크기
- **`async_insert_busy_timeout_ms`** (기본값: 1000): 플러시 전 최대 시간 (ms)
- **`async_insert_stale_timeout_ms`** (기본값: 0): 플러시 전 마지막 삽입 이후 경과 시간 (ms)
- **`async_insert_max_query_number`** (기본값: 100): 플러시 전 최대 쿼리 수

**트레이드 오프**:

- **장점**: 더 적은 파트, 더 나은 병합 성능, 낮은 CPU 오버헤드, 높은 동시성 하에서 향상된 처리량
- **고려사항**: 데이터가 즉시 쿼리 가능하지 않음, 약간 증가한 엔드 투 엔드 지연 시간
- **위험**: `wait_for_async_insert=0`일 경우 서버 크래시 시 데이터 손실, 큰 버퍼로 인한 메모리 압박 가능성
##### 정확히 한 번 세맨틱을 갖춘 비동기 삽입 {#async-inserts-with-exactly-once}

비동기 삽입에 `exactlyOnce=true`를 사용하는 경우:

```json
{
  "config": {
    "exactlyOnce": "true",
    "clickhouseSettings": "async_insert=1,wait_for_async_insert=1"
  }
}
```

**중요**: 데이터가 지속된 후에만 오프셋 커밋이 일어나도록 하려면 항상 `wait_for_async_insert=1`을 사용하세요.

비동기 삽입에 대한 더 많은 정보는 [ClickHouse 비동기 삽입 문서](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)를 참조하십시오.
#### 커넥터 병렬성 {#connector-parallelism}

처리량을 향상시키기 위해 병렬성을 증가시킵니다:
##### 커넥터당 작업 수 {#tasks-per-connector}

```json
"tasks.max": "4"
```

각 작업은 주제 파티션의 하위 집합을 처리합니다. 작업이 많을수록 병렬성이 높아지지만:

- 최대 유효 작업 수 = 주제 파티션 수
- 각 작업은 ClickHouse에 대한 고유한 연결을 유지합니다
- 작업이 많을수록 높은 오버헤드와 잠재적인 리소스 경합 발생

**권장사항**: `tasks.max`를 주제 파티션 수와 같게 시작한 후 CPU 및 처리량 메트릭에 따라 조정합니다.
##### 배치 시 파티션 무시 {#ignoring-partitions}

기본적으로 커넥터는 각 파티션에 대해 메시지를 배치합니다. 더 높은 처리량을 위해 파티션 간에 배치할 수 있습니다:

```json
"ignorePartitionsWhenBatching": "true"
```

** 경고**: `exactlyOnce=false`일 때만 사용하세요. 이 설정은 더 큰 배치를 생성하여 처리량을 향상시킬 수 있지만, 파티션별 순서 보장을 잃게 됩니다.
#### 여러 개의 고처리량 주제 {#multiple-high-throughput-topics}

커넥터가 여러 주제를 구독하도록 구성되어 있고, `topic2TableMap`을 사용하여 주제를 테이블에 매핑하며, 삽입에서 병목 현상이 발생하여 소비자 지연이 발생하는 경우, 대신 주제마다 하나의 커넥터를 생성하는 것을 고려하십시오.

이런 일이 발생하는 주된 이유는 현재 배치가 모든 테이블에 대해 [직렬로](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/578ac07e8be1a920aaa3b26e49183595c3edd04b/src/main/java/com/clickhouse/kafka/connect/sink/ProxySinkTask.java#L95-L100) 삽입되기 때문입니다.

**권장사항**: 여러 고부하 주제의 경우 최대 병렬 삽입 처리량을 높이기 위해 주제별로 하나의 커넥터 인스턴스를 배포하세요.
#### ClickHouse 테이블 엔진 고려사항 {#table-engine-considerations}

사용 사례에 적합한 ClickHouse 테이블 엔진을 선택하세요:

- **`MergeTree`**: 대부분의 경우에 최적, 쿼리 및 삽입 성능 균형
- **`ReplicatedMergeTree`**: 고가용성 필수, 복제 오버헤드 추가
- **`*MergeTree`를 적절한 `ORDER BY`와 함께 사용**: 쿼리 패턴에 최적화

**고려할 설정**:

```sql
CREATE TABLE my_table (...)
ENGINE = MergeTree()
ORDER BY (timestamp, id)
SETTINGS 
    -- Increase max insert threads for parallel part writing
    max_insert_threads = 4,
    -- Allow inserts with quorum for reliability (ReplicatedMergeTree)
    insert_quorum = 2
```

커넥터 수준 삽입 설정을 위한:

```json
"clickhouseSettings": "insert_quorum=2,insert_quorum_timeout=60000"
```
#### 연결 풀링 및 타임아웃 {#connection-pooling}

커넥터는 ClickHouse에 대한 HTTP 연결을 유지합니다. 고지연 네트워크에 대해 타임아웃을 조정하세요:

```json
"clickhouseSettings": "socket_timeout=300000,connection_timeout=30000"
```

- **`socket_timeout`** (기본값: 30000 ms): 읽기 작업을 위한 최대 시간
- **`connection_timeout`** (기본값: 10000 ms): 연결을 설정하는 최대 시간

큰 배치를 사용할 때 타임아웃 오류가 발생하면 이러한 값을 증가시키십시오.
#### 성능 모니터링 및 문제 해결 {#monitoring-performance}

다음 주요 메트릭을 모니터링하세요:

1. **소비자 지연**: Kafka 모니터링 도구를 사용하여 파티션별 지연 추적
2. **커넥터 메트릭**: JMX를 통해 `receivedRecords`, `recordProcessingTime`, `taskProcessingTime` 모니터링 (참조 [모니터링](#monitoring))
3. **ClickHouse 메트릭**:
   - `system.asynchronous_inserts`: 비동기 삽입 버퍼 사용량 모니터링
   - `system.parts`: 병합 문제를 감지하기 위해 파트 수 모니터링
   - `system.merges`: 활성 병합 모니터링
   - `system.events`: `InsertedRows`, `InsertedBytes`, `FailedInsertQuery` 추적

**일반적인 성능 문제**:

| 증상 | 가능한 원인 | 해결책 |
|---------|----------------|----------|
| 높은 소비자 지연 | 배치가 너무 작음 | `max.poll.records` 증가, 비동기 삽입 활성화 |
| "파트가 너무 많음" 오류 | 작은 빈번한 삽입 | 비동기 삽입 활성화, 배치 크기 증가 |
| 타임아웃 오류 | 큰 배치 크기, 느린 네트워크 | 배치 크기 감소, `socket_timeout` 증가, 네트워크 확인 |
| 높은 CPU 사용량 | 너무 많은 작은 파트 | 비동기 삽입 활성화, 병합 설정 증가 |
| OutOfMemory 오류 | 배치 크기가 너무 큼 | `max.poll.records`, `max.partition.fetch.bytes` 감소 |
| 불균형한 작업 부하 | 불균형한 파티션 분배 | 파티션 재균형 또는 `tasks.max` 조정 |
#### 모범 사례 요약 {#performance-best-practices}

1. **기본값으로 시작**, 그런 다음 실제 성능에 따라 측정하고 조정
2. **더 큰 배치를 선호**: 가능한 경우 삽입당 10,000-100,000 행 목표
3. **많은 작은 배치 또는 높은 동시성 하에서 비동기 삽입 사용**
4. **정확히 한 번 세맨틱을 위해 항상 `wait_for_async_insert=1` 사용**
5. **수평 확장**: 파티션 수까지 `tasks.max` 증가
6. **최대 처리량을 위해 고부하 주제당 하나의 커넥터 사용**
7. **지속적으로 모니터링**: 소비자 지연, 파트 수 및 병합 활동 추적
8. **철저하게 테스트**: 프로덕션 배포 전에 현실적인 부하에서 항상 구성 변경 테스트
#### 예제: 고처리량 구성 {#example-high-throughput}

고처리량을 위해 최적화된 완전한 예제입니다:

```json
{
  "name": "clickhouse-high-throughput",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    "tasks.max": "8",

    "topics": "high_volume_topic",
    "hostname": "my-clickhouse-host.cloud",
    "port": "8443",
    "database": "default",
    "username": "default",
    "password": "<PASSWORD>",
    "ssl": "true",

    "value.converter": "org.apache.kafka.connect.json.JsonConverter",
    "value.converter.schemas.enable": "false",

    "exactlyOnce": "false",
    "ignorePartitionsWhenBatching": "true",

    "consumer.max.poll.records": "10000",
    "consumer.max.partition.fetch.bytes": "5242880",
    "consumer.fetch.min.bytes": "1048576",
    "consumer.fetch.max.wait.ms": "500",

    "clickhouseSettings": "async_insert=1,wait_for_async_insert=1,async_insert_max_data_size=16777216,async_insert_busy_timeout_ms=1000,socket_timeout=300000"
  }
}
```

**이 구성**:
- 각 폴링에서 최대 10,000 레코드를 처리
- 더 큰 삽입을 위해 파티션 간에 배치
- 비동기 삽입을 사용하며 16 MB 버퍼 사용
- 8개의 병렬 작업 실행 (파티션 수와 일치)
- 엄격한 순서보다 처리량에 최적화
### 문제 해결 {#troubleshooting}
#### "주제 `[someTopic]` 파티션 `[0]`의 상태 불일치" {#state-mismatch-for-topic-sometopic-partition-0}

KeeperMap에 저장된 오프셋이 Kafka에 저장된 오프셋과 다를 때 발생합니다. 일반적으로 주제가 삭제되었거나 오프셋이 수동으로 조정된 경우입니다.
이 문제를 해결하려면 해당 주제 + 파티션에 대해 저장된 이전 값을 삭제해야 합니다.

**참고: 이 조정은 정확히 한 번의 영향을 가질 수 있습니다.**
#### "커넥터가 재시도할 오류는 무엇입니까?" {#what-errors-will-the-connector-retry}

현재의 초점은 일시적이고 재시도할 수 있는 오류를 식별하는 것입니다. 다음을 포함합니다:

- `ClickHouseException` - ClickHouse에서 발생할 수 있는 일반적인 예외입니다.
  서버가 과부하 상태일 때 일반적으로 발생하며, 다음 오류 코드가 특히 일시적인 것으로 간주됩니다:
  - 3 - UNEXPECTED_END_OF_FILE
  - 159 - TIMEOUT_EXCEEDED
  - 164 - READONLY
  - 202 - TOO_MANY_SIMULTANEOUS_QUERIES
  - 203 - NO_FREE_CONNECTION
  - 209 - SOCKET_TIMEOUT
  - 210 - NETWORK_ERROR
  - 242 - TABLE_IS_READ_ONLY
  - 252 - TOO_MANY_PARTS
  - 285 - TOO_FEW_LIVE_REPLICAS
  - 319 - UNKNOWN_STATUS_OF_INSERT
  - 425 - SYSTEM_ERROR
  - 999 - KEEPER_EXCEPTION
  - 1002 - UNKNOWN_EXCEPTION
- `SocketTimeoutException` - 소켓이 타임아웃될 때 발생합니다.
- `UnknownHostException` - 호스트를 확인할 수 없을 때 발생합니다.
- `IOException` - 네트워크에 문제가 있을 때 발생합니다.
#### "내 데이터가 모두 빈값/제로입니다" {#all-my-data-is-blankzeroes}
데이터의 필드가 테이블의 필드와 일치하지 않아서 발생할 가능성이 높습니다 - 이는 특히 CDC (및 Debezium 형식)에서 흔합니다.
흔한 해결책 중 하나는 커넥터 구성에 flatten 변환을 추가하는 것입니다:

```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```

이것은 데이터를 중첩된 JSON에서 평면 JSON으로 변환합니다 (구분 기호로 `_` 사용). 테이블의 필드는 "field1_field2_field3" 형식을 따르게 됩니다 (예: "before_id", "after_id" 등).
#### "내 Kafka 키를 ClickHouse에서 사용하고 싶습니다" {#i-want-to-use-my-kafka-keys-in-clickhouse}
Kafka 키는 기본적으로 값 필드에 저장되지 않지만, `KeyToValue` 변환을 사용하여 키를 새 `_key` 필드 이름 아래의 값 필드로 이동할 수 있습니다:

```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```
