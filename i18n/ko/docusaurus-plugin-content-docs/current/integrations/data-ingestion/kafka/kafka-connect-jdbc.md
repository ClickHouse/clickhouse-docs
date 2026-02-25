---
sidebar_label: 'Kafka Connect JDBC 커넥터'
sidebar_position: 4
slug: /integrations/kafka/kafka-connect-jdbc
description: 'Kafka Connect와 ClickHouse에서 JDBC Sink 커넥터를 사용하는 방법'
title: 'JDBC 커넥터'
doc_type: 'guide'
keywords: ['kafka', 'kafka connect', 'jdbc', 'integration', 'data pipeline']
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# JDBC connector \{#jdbc-connector\}

:::note
이 커넥터는 데이터가 단순하며 int와 같은 기본 자료형으로만 구성된 경우에만 사용해야 합니다. 맵과 같은 ClickHouse 고유 타입은 지원되지 않습니다.
:::

예제에서는 Confluent 배포판인 Kafka Connect를 사용합니다.

아래에서는 단일 Kafka 토픽에서 메시지를 가져와 ClickHouse 테이블에 행을 삽입하는 간단한 구성 방법을 설명합니다. Kafka 환경이 없는 사용자를 위해 넉넉한 무료 티어를 제공하는 Confluent Cloud 사용을 권장합니다.

JDBC Connector에는 스키마가 필요합니다(JDBC connector에서는 일반 JSON 또는 CSV만으로는 사용할 수 없습니다). 스키마를 각 메시지에 인코딩할 수도 있지만, 관련 오버헤드를 피하기 위해 [Confluent schema registry를 사용하는 것이 강력히 권장됩니다](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas). 제공된 삽입 스크립트는 메시지에서 스키마를 자동으로 추론하여 레지스트리에 삽입하므로, 이 스크립트는 다른 데이터셋에도 재사용할 수 있습니다. Kafka의 키는 String이라고 가정합니다. Kafka 스키마에 대한 자세한 내용은 [여기](https://docs.confluent.io/platform/current/schema-registry/index.html)에서 확인할 수 있습니다.

### 라이선스 \{#license\}

JDBC 커넥터는 [Confluent Community License](https://www.confluent.io/confluent-community-license)에 따라 배포됩니다.

### 절차 \{#steps\}

#### 연결 정보 확인 \{#gather-your-connection-details\}

<ConnectionDetails />

#### 1. Kafka Connect 및 커넥터 설치 \{#1-install-kafka-connect-and-connector\}

Confluent 패키지를 다운로드하여 로컬에 설치되어 있다고 가정합니다. 커넥터 설치 방법은 [여기](https://docs.confluent.io/kafka-connect-jdbc/current/#install-the-jdbc-connector)에 문서화된 설치 지침을 따르십시오.

confluent-hub 설치 방식을 사용하는 경우 로컬 설정 파일이 업데이트됩니다.

Kafka에서 ClickHouse로 데이터를 전송하기 위해 커넥터의 Sink 컴포넌트를 사용합니다.

#### 2. JDBC 드라이버 다운로드 및 설치 \{#2-download-and-install-the-jdbc-driver\}

[이 릴리스 페이지](https://github.com/ClickHouse/clickhouse-java/releases)에서 ClickHouse JDBC 드라이버 `clickhouse-jdbc-<version>-shaded.jar`를 다운로드하여 설치합니다. [이 문서](https://docs.confluent.io/kafka-connect-jdbc/current/#installing-jdbc-drivers)에 나와 있는 내용을 따라 Kafka Connect에 이 드라이버를 설치합니다. 다른 드라이버도 동작할 수도 있으나 테스트되지는 않았습니다.

:::note

자주 발생하는 문제: 문서에서는 jar 파일을 `share/java/kafka-connect-jdbc/`에 복사하도록 안내합니다. Connect가 드라이버를 찾지 못하는 문제가 발생하면, 드라이버를 `share/confluent-hub-components/confluentinc-kafka-connect-jdbc/lib/`에 복사하십시오. 또는 아래에 설명된 대로 `plugin.path`를 수정하여 드라이버가 포함되도록 하십시오.

:::

#### 3. 구성 준비 \{#3-prepare-configuration\}

단독형과 분산 클러스터 간의 차이점에 유의하면서, 설치 유형에 맞는 Connect를 설정하려면 [이 안내](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install)를 따르십시오. Confluent Cloud를 사용하는 경우 분산 구성이 해당합니다.

다음 파라미터는 ClickHouse와 함께 JDBC connector를 사용할 때 중요합니다. 전체 파라미터 목록은 [여기](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/index.html)에서 확인할 수 있습니다.

* `_connection.url_` - `jdbc:clickhouse://&lt;clickhouse host>:&lt;clickhouse http port>/&lt;target database>` 형식이어야 합니다.
* `connection.user` - 대상 데이터베이스에 쓰기 권한이 있는 사용자입니다.
* `table.name.format`- 데이터를 삽입할 ClickHouse 테이블입니다. 반드시 사전에 존재해야 합니다.
* `batch.size` - 한 번에 전송할 행 수입니다. 충분히 큰 값으로 설정해야 합니다. ClickHouse [권장 사항](/sql-reference/statements/insert-into#performance-considerations)에 따르면 1000 이상의 값을 최소 기준으로 고려해야 합니다.
* `tasks.max` - JDBC Sink connector는 하나 이상의 태스크 실행을 지원합니다. 성능 향상에 사용할 수 있습니다. batch size와 함께 성능을 개선하는 주요 수단입니다.
* `value.converter.schemas.enable` - schema registry를 사용하는 경우 false, 스키마를 메시지에 내장하는 경우 true로 설정합니다.
* `value.converter` - 데이터 타입에 따라 설정합니다. 예를 들어 JSON의 경우 `io.confluent.connect.json.JsonSchemaConverter`로 설정합니다.
* `key.converter` - `org.apache.kafka.connect.storage.StringConverter`로 설정합니다. String 키를 사용합니다.
* `pk.mode` - ClickHouse에는 관련이 없습니다. none으로 설정하십시오.
* `auto.create` - 지원되지 않으므로 반드시 false여야 합니다.
* `auto.evolve` - 이 설정은 false로 둘 것을 권장합니다. 향후 지원될 수는 있습니다.
* `insert.mode` - "insert"로 설정합니다. 다른 모드는 현재 지원되지 않습니다.
* `key.converter` - 키의 타입에 따라 설정합니다.
* `value.converter` - 토픽에 있는 데이터 타입에 맞게 설정합니다. 이 데이터는 JSON, Avro, Protobuf 형식처럼 지원되는 스키마를 가져야 합니다.

테스트용으로 샘플 데이터세트를 사용하는 경우, 다음 값이 설정되었는지 확인하십시오.

* `value.converter.schemas.enable` - schema registry를 사용하므로 false로 설정합니다. 각 메시지에 스키마를 내장하는 경우 true로 설정합니다.
* `key.converter` - "org.apache.kafka.connect.storage.StringConverter"로 설정합니다. String 키를 사용합니다.
* `value.converter` - "io.confluent.connect.json.JsonSchemaConverter"로 설정합니다.
* `value.converter.schema.registry.url` - schema server의 URL과 함께, `value.converter.schema.registry.basic.auth.user.info` 파라미터를 통해 schema server 자격 증명을 설정합니다.

Github 샘플 데이터용 예제 설정 파일은 Connect가 standalone 모드로 실행되고 Kafka가 Confluent Cloud에 호스팅된다고 가정할 때 [여기](https://github.com/ClickHouse/kafka-samples/tree/main/github_events/jdbc_sink)에서 확인할 수 있습니다.

#### 4. ClickHouse 테이블 생성 \{#4-create-the-clickhouse-table\}

테이블이 생성되었는지 확인하되, 이전 예제에서 이미 존재하는 경우 먼저 테이블을 삭제하십시오. 축소된 Github 데이터셋과 호환되는 예시는 아래와 같습니다. 현재 지원되지 않는 `Array` 또는 `Map` 타입이 사용되지 않았다는 점에 유의하십시오:

```sql
CREATE TABLE github
(
    file_time DateTime,
    event_type Enum('CommitCommentEvent' = 1, 'CreateEvent' = 2, 'DeleteEvent' = 3, 'ForkEvent' = 4, 'GollumEvent' = 5, 'IssueCommentEvent' = 6, 'IssuesEvent' = 7, 'MemberEvent' = 8, 'PublicEvent' = 9, 'PullRequestEvent' = 10, 'PullRequestReviewCommentEvent' = 11, 'PushEvent' = 12, 'ReleaseEvent' = 13, 'SponsorshipEvent' = 14, 'WatchEvent' = 15, 'GistEvent' = 16, 'FollowEvent' = 17, 'DownloadEvent' = 18, 'PullRequestReviewEvent' = 19, 'ForkApplyEvent' = 20, 'Event' = 21, 'TeamAddEvent' = 22),
    actor_login LowCardinality(String),
    repo_name LowCardinality(String),
    created_at DateTime,
    updated_at DateTime,
    action Enum('none' = 0, 'created' = 1, 'added' = 2, 'edited' = 3, 'deleted' = 4, 'opened' = 5, 'closed' = 6, 'reopened' = 7, 'assigned' = 8, 'unassigned' = 9, 'labeled' = 10, 'unlabeled' = 11, 'review_requested' = 12, 'review_request_removed' = 13, 'synchronize' = 14, 'started' = 15, 'published' = 16, 'update' = 17, 'create' = 18, 'fork' = 19, 'merged' = 20),
    comment_id UInt64,
    path String,
    ref LowCardinality(String),
    ref_type Enum('none' = 0, 'branch' = 1, 'tag' = 2, 'repository' = 3, 'unknown' = 4),
    creator_user_login LowCardinality(String),
    number UInt32,
    title String,
    state Enum('none' = 0, 'open' = 1, 'closed' = 2),
    assignee LowCardinality(String),
    closed_at DateTime,
    merged_at DateTime,
    merge_commit_sha String,
    merged_by LowCardinality(String),
    review_comments UInt32,
    member_login LowCardinality(String)
) ENGINE = MergeTree ORDER BY (event_type, repo_name, created_at)
```


#### 5. Kafka Connect 시작 \{#5-start-kafka-connect\}

Kafka Connect를 [standalone](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#standalone-cluster) 모드 또는 [distributed](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#distributed-cluster) 모드로 시작합니다.

```bash
./bin/connect-standalone connect.properties.ini github-jdbc-sink.properties.ini
```


#### 6. Kafka에 데이터 추가 \{#6-add-data-to-kafka\}

제공된 [스크립트와 설정](https://github.com/ClickHouse/kafka-samples/tree/main/producer)을 사용하여 Kafka에 메시지를 전송합니다. `github.config` 파일을 수정하여 Kafka 자격 증명을 추가해야 합니다. 이 스크립트는 현재 Confluent Cloud에서 사용하도록 구성되어 있습니다.

```bash
python producer.py -c github.config
```

이 스크립트는 어떤 ndjson 파일이든 Kafka 토픽에 삽입하는 데 사용할 수 있습니다. 스키마는 자동으로 추론됩니다. 제공된 샘플 구성은 기본적으로 1만 개의 메시지만 삽입하므로, 필요하다면 [여기에서 수정](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/producer/github.config#L25)하십시오. 또한 이 구성은 Kafka로 삽입하는 동안 데이터셋에서 호환되지 않는 Array 필드를 제거합니다.

이는 JDBC 커넥터가 메시지를 INSERT 문으로 변환하기 위해 필요합니다. 자체 데이터를 사용하는 경우, 각 메시지에 스키마를 함께 포함하도록 설정( `_value.converter.schemas.enable`을 `true`로 설정)하거나, 클라이언트가 레지스트리에 등록된 스키마를 참조하는 메시지를 발행하도록 구성해야 합니다.

Kafka Connect는 메시지 소비를 시작하여 ClickHouse에 행을 삽입합니다. 「[JDBC Compliant Mode] Transaction isn&#39;t supported.」와 관련된 경고는 예상된 동작이며 무시해도 됩니다.

대상 테이블 「Github」에 대해 간단히 조회를 수행하면 데이터가 삽입되었는지 확인할 수 있습니다.

```sql
SELECT count() FROM default.github;
```

```response
| count\(\) |
| :--- |
| 10000 |
```


### 추가로 읽어볼 자료 \{#recommended-further-reading\}

* [Kafka Sink Configuration Parameters](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/sink_config_options.html#sink-config-options)
* [Kafka Connect Deep Dive – JDBC Source Connector](https://www.confluent.io/blog/kafka-connect-deep-dive-jdbc-source-connector)
* [Kafka Connect JDBC Sink deep-dive: Working with Primary Keys](https://rmoff.net/2021/03/12/kafka-connect-jdbc-sink-deep-dive-working-with-primary-keys/)
* [Kafka Connect in Action: JDBC Sink](https://www.youtube.com/watch?v=b-3qN_tlYR4&t=981s) - 문서를 읽는 것보다 영상을 시청하는 것을 선호하는 사용자에게 적합합니다.
* [Kafka Connect Deep Dive – Converters and Serialization Explained](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)