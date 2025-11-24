---
'sidebar_label': 'Kafka Connect JDBC 커넥터'
'sidebar_position': 4
'slug': '/integrations/kafka/kafka-connect-jdbc'
'description': 'Kafka Connect와 ClickHouse를 사용한 JDBC 커넥터 싱크'
'title': 'JDBC 커넥터'
'doc_type': 'guide'
'keywords':
- 'kafka'
- 'kafka connect'
- 'jdbc'
- 'integration'
- 'data pipeline'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# JDBC 커넥터

:::note
이 커넥터는 데이터가 단순하고 정수형 같은 원시 데이터 타입으로 구성된 경우에만 사용해야 합니다. ClickHouse의 맵과 같은 특정 데이터 타입은 지원되지 않습니다.
:::

우리의 예제에서는 Kafka Connect의 Confluent 배포판을 사용합니다.

아래에서는 단일 Kafka 주제에서 메시지를 가져와 ClickHouse 테이블에 행을 삽입하는 간단한 설치 과정을 설명합니다. Kafka 환경이 없는 분들을 위해 넉넉한 무료 티어를 제공하는 Confluent Cloud를 추천합니다.

JDBC 커넥터에는 스키마가 필요하다는 점에 유의하십시오 (JDBC 커넥터와 함께 일반 JSON이나 CSV를 사용할 수 없습니다). 스키마는 각 메시지에 인코딩할 수 있지만, 관련된 오버헤드를 피하기 위해 [Confluent 스키마 레지스트리](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)를 사용하는 것이 강력히 권장됩니다. 제공된 삽입 스크립트는 메시지에서 스키마를 자동으로 유추하고 이를 레지스트리에 삽입합니다 - 따라서 이 스크립트는 다른 데이터 세트에 재사용될 수 있습니다. Kafka의 키는 문자열로 가정됩니다. Kafka 스키마에 대한 더 많은 세부정보는 [여기](https://docs.confluent.io/platform/current/schema-registry/index.html)에서 찾을 수 있습니다.

### 라이센스 {#license}
JDBC 커넥터는 [Confluent Community License](https://www.confluent.io/confluent-community-license) 하에 배포됩니다.

### 단계 {#steps}
#### 연결 세부정보 수집 {#gather-your-connection-details}
<ConnectionDetails />

#### 1. Kafka Connect 및 커넥터 설치 {#1-install-kafka-connect-and-connector}

Confluent 패키지를 다운로드하여 로컬에 설치했다고 가정합니다. 커넥터를 설치하는 방법에 대한 설치 지침은 [여기](https://docs.confluent.io/kafka-connect-jdbc/current/#install-the-jdbc-connector)를 참조하십시오.

confluent-hub 설치 방법을 사용하면 로컬 구성 파일이 업데이트됩니다.

Kafka에서 ClickHouse로 데이터를 전송하기 위해 커넥터의 Sink 구성 요소를 사용합니다.

#### 2. JDBC 드라이버 다운로드 및 설치 {#2-download-and-install-the-jdbc-driver}

[여기](https://github.com/ClickHouse/clickhouse-java/releases)에서 ClickHouse JDBC 드라이버 `clickhouse-jdbc-<version>-shaded.jar`를 다운로드하여 설치합니다. Kafka Connect에 설치하는 방법은 [여기](https://docs.confluent.io/kafka-connect-jdbc/current/#installing-jdbc-drivers)를 참조하십시오. 다른 드라이버도 작동할 수 있지만 테스트되지는 않았습니다.

:::note

일반적인 문제: 문서에서는 JAR 파일을 `share/java/kafka-connect-jdbc/`에 복사하는 것을 제안합니다. Connect가 드라이버를 찾는 데 문제가 발생하는 경우, 드라이버를 `share/confluent-hub-components/confluentinc-kafka-connect-jdbc/lib/`로 복사하십시오. 또는 드라이버를 포함하도록 `plugin.path`를 수정하십시오 - 아래를 참조하십시오.

:::

#### 3. 구성 준비 {#3-prepare-configuration}

설치 유형에 따라 Connect를 설정하는 [이 지침](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install)을 따르십시오. 독립형 클러스터와 분산 클러스터 간의 차이점을 주의하십시오. Confluent Cloud를 사용하는 경우 분산 설정이 관련됩니다.

다음 매개변수는 ClickHouse와 함께 JDBC 커넥터를 사용할 때 중요합니다. 전체 매개변수 목록은 [여기](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/index.html)에서 확인할 수 있습니다:

* `_connection.url_` - `jdbc:clickhouse://&lt;clickhouse host>:&lt;clickhouse http port>/&lt;target database>` 형식을 가져야 합니다.
* `connection.user` - 대상 데이터베이스에 쓰기 권한이 있는 사용자
* `table.name.format`- 데이터를 삽입할 ClickHouse 테이블. 이 테이블은 존재해야 합니다.
* `batch.size` - 단일 배치에서 전송할 행 수. 적절히 큰 숫자로 설정해야 합니다. ClickHouse의 [권장사항](/sql-reference/statements/insert-into#performance-considerations)으로는 최소값을 1000으로 고려해야 합니다.
* `tasks.max` - JDBC Sink 커넥터는 하나 이상의 작업을 실행할 수 있습니다. 이는 성능 개선에 사용할 수 있습니다. 배치 크기와 함께 주된 성능 개선 수단을 나타냅니다.
* `value.converter.schemas.enable` - 스키마 레지스트리를 사용하는 경우 false로 설정하고, 메시지에 스키마를 포함하는 경우 true로 설정합니다.
* `value.converter` - 데이터 타입에 따라 설정하십시오. 예를 들어 JSON의 경우, `io.confluent.connect.json.JsonSchemaConverter`로 설정합니다.
* `key.converter` - `org.apache.kafka.connect.storage.StringConverter`로 설정합니다. 우리는 문자열 키를 사용합니다.
* `pk.mode` - ClickHouse와 관련이 없습니다. none으로 설정하십시오.
* `auto.create` - 지원되지 않으며 false로 설정해야 합니다.
* `auto.evolve` - 이 설정은 false로 추천하지만 나중에 지원될 수 있습니다.
* `insert.mode` - "insert"로 설정합니다. 다른 모드는 현재 지원되지 않습니다.
* `key.converter` - 키의 종류에 따라 설정합니다.
* `value.converter` - 주제의 데이터 종류에 따라 설정합니다. 이 데이터는 지원되는 스키마 - JSON, Avro 또는 Protobuf 형식을 가져야 합니다.

테스트를 위한 샘플 데이터 세트를 사용하는 경우, 다음을 설정해야 합니다:

* `value.converter.schemas.enable` - 스키마 레지스트리를 사용하므로 false로 설정합니다. 각 메시지에 스키마를 포함하는 경우 true로 설정합니다.
* `key.converter` - "org.apache.kafka.connect.storage.StringConverter"로 설정합니다. 우리는 문자열 키를 사용합니다.
* `value.converter` - "io.confluent.connect.json.JsonSchemaConverter"로 설정합니다.
* `value.converter.schema.registry.url` - 스키마 서버 URL과 스키마 서버의 자격 증명을 `value.converter.schema.registry.basic.auth.user.info` 매개변수를 통해 설정합니다.

Github 샘플 데이터에 대한 예제 구성 파일은 [여기](https://github.com/ClickHouse/kafka-samples/tree/main/github_events/jdbc_sink)에서 찾을 수 있습니다. 이 예시는 Connect가 독립형 모드에서 실행되고 Kafka가 Confluent Cloud에 호스팅되는 경우를 가정합니다.

#### 4. ClickHouse 테이블 생성 {#4-create-the-clickhouse-table}

테이블이 생성되었는지 확인하고, 이전 예제에서 이미 존재하는 경우 드롭합니다. 축소된 Github 데이터 세트와 호환되는 예제는 아래와 같습니다. 현재 지원되지 않는 Array 또는 Map 타입이 없음을 주의하십시오:

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

#### 5. Kafka Connect 시작 {#5-start-kafka-connect}

[독립형](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#standalone-cluster) 또는 [분산](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#distributed-cluster) 모드에서 Kafka Connect를 시작합니다.

```bash
./bin/connect-standalone connect.properties.ini github-jdbc-sink.properties.ini
```

#### 6. Kafka에 데이터 추가 {#6-add-data-to-kafka}

제공된 [스크립트 및 구성](https://github.com/ClickHouse/kafka-samples/tree/main/producer)을 사용하여 Kafka에 메시지를 삽입합니다. Kafka 자격 증명을 포함하도록 github.config를 수정해야 합니다. 스크립트는 현재 Confluent Cloud와 함께 사용하도록 구성되어 있습니다.

```bash
python producer.py -c github.config
```

이 스크립트는 어떤 ndjson 파일을 Kafka 주제에 삽입하는 데 사용할 수 있습니다. 이 스크립트는 자동으로 스키마를 유추하려고 시도합니다. 제공된 샘플 구성은 10,000 메시지만 삽입하며, 필요한 경우 [여기](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/producer/github.config#L25)에서 수정할 수 있습니다. 이 구성은 Kafka에 삽입 중에 데이터 세트에서 호환되지 않는 Array 필드를 제거합니다.

이는 JDBC 커넥터가 메시지를 INSERT 문으로 변환할 수 있도록 필요합니다. 사용자 데이터를 사용하는 경우, 메시지마다 스키마를 삽입하거나 ( _value.converter.schemas.enable _을 true로 설정) 클라이언트가 레지스트리에 스키마를 참조하는 메시지를 발행하는지 확인해야 합니다.

Kafka Connect는 메시지를 소비하고 ClickHouse에 행을 삽입하기 시작해야 합니다. "[JDBC Compliant Mode] Transaction is not supported."라는 경고는 예상되며 무시할 수 있습니다.

대상 테이블 "Github"에 대한 간단한 읽기는 데이터 삽입을 확인할 수 있습니다.

```sql
SELECT count() FROM default.github;
```

```response
| count\(\) |
| :--- |
| 10000 |
```

### 추천 추가 읽기 {#recommended-further-reading}

* [Kafka Sink 구성 매개변수](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/sink_config_options.html#sink-config-options)
* [Kafka Connect 심층 분석 - JDBC 소스 커넥터](https://www.confluent.io/blog/kafka-connect-deep-dive-jdbc-source-connector)
* [Kafka Connect JDBC Sink 심층 분석: 기본 키 작업](https://rmoff.net/2021/03/12/kafka-connect-jdbc-sink-deep-dive-working-with-primary-keys/)
* [Kafka Connect in Action: JDBC Sink](https://www.youtube.com/watch?v=b-3qN_tlYR4&t=981s) - 읽기보다 보기 선호하시는 분들을 위해.
* [Kafka Connect 심층 분석 - 변환기와 직렬화 설명](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)
