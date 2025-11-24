---
'sidebar_label': 'Kafka Table Engine'
'sidebar_position': 5
'slug': '/integrations/kafka/kafka-table-engine'
'description': 'Kafka 테이블 엔진 사용하기'
'title': 'Kafka 테이블 엔진 사용하기'
'doc_type': 'guide'
'keywords':
- 'kafka'
- 'table engine'
- 'streaming'
- 'real-time'
- 'message queue'
---

import Image from '@theme/IdealImage';
import kafka_01 from '@site/static/images/integrations/data-ingestion/kafka/kafka_01.png';
import kafka_02 from '@site/static/images/integrations/data-ingestion/kafka/kafka_02.png';
import kafka_03 from '@site/static/images/integrations/data-ingestion/kafka/kafka_03.png';
import kafka_04 from '@site/static/images/integrations/data-ingestion/kafka/kafka_04.png';


# Kafka 테이블 엔진 사용하기

Kafka 테이블 엔진은 [**데이터 읽기**](#kafka-to-clickhouse) 및 [**데이터 쓰기**](#clickhouse-to-kafka) 용도로 Apache Kafka 및 기타 Kafka API 호환 브로커(예: Redpanda, Amazon MSK)에서 사용할 수 있습니다.

### Kafka에서 ClickHouse로 {#kafka-to-clickhouse}

:::note
ClickHouse Cloud를 사용 중이라면, [ClickPipes](/integrations/clickpipes)를 대신 사용하는 것이 좋습니다. ClickPipes는 프라이빗 네트워크 연결을 기본적으로 지원하며, 독립적으로 인제스트 및 클러스터 리소스를 확장하고, ClickHouse에 Kafka 스트리밍 데이터를 위한 종합 모니터링 기능을 제공합니다.
:::

Kafka 테이블 엔진을 사용하기 위해서는 [ClickHouse 물리화된 뷰](../../../guides/developer/cascading-materialized-views.md)에 대한 기본적인 이해가 필요합니다.

#### 개요 {#overview}

우리는 처음에 가장 일반적인 사용 사례인 Kafka에서 ClickHouse로 데이터 삽입을 위한 Kafka 테이블 엔진을 사용하는 데 초점을 맞춤니다.

Kafka 테이블 엔진은 ClickHouse가 Kafka 주제에서 데이터를 직접 읽을 수 있도록 해줍니다. 주제의 메시지를 보는 데 유용하지만, 이 엔진은 설계상 단 한 번의 검색만 허용합니다. 즉, 테이블에 쿼리가 발행되면, 큐에서 데이터를 소비하고 소비자 오프셋을 증가시킨 후 호출자에게 결과를 반환합니다. 사실상 이러한 오프셋을 리셋하지 않고는 데이터를 다시 읽을 수 없습니다.

테이블 엔진의 읽기에서 이 데이터를 지속적으로 사용하기 위해서는 데이터를 캡처하고 다른 테이블에 삽입할 수 있는 수단이 필요합니다. 트리거 기반 물리화된 뷰는 이 기능을 기본적으로 제공합니다. 물리화된 뷰는 테이블 엔진에서 읽기를 시작하고, 문서 배치를 수신합니다. TO 절은 데이터의 목적지를 결정합니다 - 일반적으로 [Merge Tree 패밀리의 테이블](../../../engines/table-engines/mergetree-family/index.md)입니다. 이 과정은 아래와 같이 시각화됩니다:

<Image img={kafka_01} size="lg" alt="Kafka 테이블 엔진 아키텍처 다이어그램" style={{width: '80%'}} />

#### 단계 {#steps}

##### 1. 준비 {#1-prepare}

목표 주제에 데이터가 미리 채워져 있다면, 다음 내용을 데이터셋에 사용하도록 조정할 수 있습니다. 또는 샘플 Github 데이터셋이 [여기](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson) 제공됩니다. 이 데이터셋은 아래의 예제에서 사용되며, 줄 수의 부분집합과 축약된 스키마를 사용합니다(구체적으로는 ClickHouse 리포지토리에 관한 [Github 이벤트](https://github.com/ClickHouse/ClickHouse)로 제한함), 전체 데이터셋 [여기](https://ghe.clickhouse.tech/)와 비교했을 때 간결성을 위해서입니다. 이는 여전히 데이터셋과 함께 게시된 대부분의 쿼리가 작동하는 데 충분합니다.

##### 2. ClickHouse 구성 {#2-configure-clickhouse}

이 단계는 보안 Kafka에 연결하는 경우 필요합니다. 이러한 설정은 SQL DDL 명령을 통해 전달할 수 없으며, ClickHouse config.xml에서 구성해야 합니다. SASL로 보호된 인스턴스에 연결한다고 가정합니다. 이는 Confluent Cloud와 상호작용할 때 가장 간단한 방법입니다.

```xml
<clickhouse>
   <kafka>
       <sasl_username>username</sasl_username>
       <sasl_password>password</sasl_password>
       <security_protocol>sasl_ssl</security_protocol>
       <sasl_mechanisms>PLAIN</sasl_mechanisms>
   </kafka>
</clickhouse>
```

위 코드를 conf.d/ 디렉토리 아래의 새로운 파일로 배치하거나 기존 구성 파일에 병합합니다. 구성할 수 있는 설정은 [여기](../../../engines/table-engines/integrations/kafka.md#configuration)를 참조하십시오.

이 튜토리얼에 사용할 `KafkaEngine`이라는 데이터베이스를 생성할 것입니다:

```sql
CREATE DATABASE KafkaEngine;
```

데이터베이스를 생성한 후에는 해당 데이터베이스로 전환해야 합니다:

```sql
USE KafkaEngine;
```

##### 3. 대상 테이블 생성 {#3-create-the-destination-table}

대상 테이블을 준비합니다. 아래 예제에서는 간결성을 위해 축약된 GitHub 스키마를 사용합니다. MergeTree 테이블 엔진을 사용하지만, 이 예제는 [MergeTree 패밀리](../../../engines/table-engines/mergetree-family/index.md)의 어떤 구성원에 대해서도 쉽게 조정될 수 있습니다.

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
    labels Array(LowCardinality(String)),
    state Enum('none' = 0, 'open' = 1, 'closed' = 2),
    assignee LowCardinality(String),
    assignees Array(LowCardinality(String)),
    closed_at DateTime,
    merged_at DateTime,
    merge_commit_sha String,
    requested_reviewers Array(LowCardinality(String)),
    merged_by LowCardinality(String),
    review_comments UInt32,
    member_login LowCardinality(String)
) ENGINE = MergeTree ORDER BY (event_type, repo_name, created_at)
```

##### 4. 주제 생성 및 데이터 채우기 {#4-create-and-populate-the-topic}

다음으로 주제를 생성할 것입니다. 이를 위해 사용할 수 있는 여러 도구가 있습니다. 자신의 머신이나 Docker 컨테이너 내에서 Kafka를 실행하고 있다면, [RPK](https://docs.redpanda.com/current/get-started/rpk-install/)가 잘 작동합니다. 다음 명령을 실행하여 5개의 파티션을 가진 `github`라는 주제를 생성할 수 있습니다:

```bash
rpk topic create -p 5 github --brokers <host>:<port>
```

Confluent Cloud에서 Kafka를 실행하고 있다면, [Confluent CLI](https://docs.confluent.io/platform/current/tutorials/examples/clients/docs/kcat.html#produce-records)를 사용하는 것이 더 좋을 수 있습니다:

```bash
confluent kafka topic create --if-not-exists github
```

이제 이 주제에 데이터를 채워야 하는데, [kcat](https://github.com/edenhill/kcat)를 사용하여 이를 수행할 것입니다. 인증이 비활성화된 상태에서 Kafka를 로컬로 실행하고 있다면 다음과 유사한 명령을 실행할 수 있습니다:

```bash
cat github_all_columns.ndjson |
kcat -P \
  -b <host>:<port> \
  -t github
```

또는 Kafka 클러스터가 SASL을 사용하여 인증하는 경우 다음과 같이 실행합니다:

```bash
cat github_all_columns.ndjson |
kcat -P \
  -b <host>:<port> \
  -t github
  -X security.protocol=sasl_ssl \
  -X sasl.mechanisms=PLAIN \
  -X sasl.username=<username>  \
  -X sasl.password=<password> \
```

데이터셋에는 200,000 행이 포함되어 있으므로 몇 초 내에 인제스트됩니다. 더 큰 데이터셋으로 작업하고 싶다면, [ClickHouse/kafka-samples](https://github.com/ClickHouse/kafka-samples) GitHub 리포지토리의 [대형 데이터셋 섹션](https://github.com/ClickHouse/kafka-samples/tree/main/producer#large-datasets)을 참조하십시오.

##### 5. Kafka 테이블 엔진 생성 {#5-create-the-kafka-table-engine}

아래 예제는 Merge Tree 테이블과 동일한 스키마로 테이블 엔진을 생성합니다. 이는 엄격히 필수는 아니며, 대상 테이블에서 별칭이나 임시 컬럼을 가질 수 있습니다. 그러나 설정은 중요합니다; Kafka 주제에서 JSON을 소비하기 위한 데이터 형식으로 `JSONEachRow` 사용을 주의하세요. `github`와 `clickhouse` 값은 각각 주제 및 소비자 그룹 이름을 나타냅니다. 주제는 사실상 값의 목록일 수 있습니다.

```sql
CREATE TABLE github_queue
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
    labels Array(LowCardinality(String)),
    state Enum('none' = 0, 'open' = 1, 'closed' = 2),
    assignee LowCardinality(String),
    assignees Array(LowCardinality(String)),
    closed_at DateTime,
    merged_at DateTime,
    merge_commit_sha String,
    requested_reviewers Array(LowCardinality(String)),
    merged_by LowCardinality(String),
    review_comments UInt32,
    member_login LowCardinality(String)
)
   ENGINE = Kafka('kafka_host:9092', 'github', 'clickhouse',
            'JSONEachRow') SETTINGS kafka_thread_per_consumer = 0, kafka_num_consumers = 1;
```

엔진 설정 및 성능 조정에 대해서는 아래에서 논의합니다. 현재 시점에서 테이블 `github_queue`에 대해 간단한 선택을 수행하면 몇 개의 행이 읽힐 것입니다. 이로 인해 소비자 오프셋이 앞으로 이동하며, 이러한 행을 [리셋](#common-operations)하지 않고는 다시 읽을 수 없게 됩니다. `stream_like_engine_allow_direct_select`의 한계 및 필수 매개변수를 유의하십시오.

##### 6. 물리화된 뷰 생성 {#6-create-the-materialized-view}

물리화된 뷰는 이전에 생성된 두 테이블을 연결하여 Kafka 테이블 엔진에서 데이터를 읽고, 이를 대상 Merge Tree 테이블에 삽입합니다. 우리는 간단한 읽기 및 삽입을 수행할 것입니다. *의 사용은 컬럼 이름이 동일하다고 가정합니다(대소문자 구분).

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *
FROM github_queue;
```

생성 시점에 물리화된 뷰는 Kafka 엔진에 연결하여 읽기를 시작하고, 대상 테이블에 행을 삽입하기 시작합니다. 이 과정은 무한정 계속되며, Kafka에 대한 후속 메시지 삽입이 소비됩니다. 추가 메시지를 Kafka에 삽입하려면 삽입 스크립트를 다시 실행하십시오.

##### 7. 행이 삽입되었는지 확인 {#7-confirm-rows-have-been-inserted}

대상 테이블에 데이터가 존재하는지 확인합니다:

```sql
SELECT count() FROM github;
```

200,000 행을 볼 수 있어야 합니다:
```response
┌─count()─┐
│  200000 │
└─────────┘
```

#### 일반 작업 {#common-operations}

##### 메시지 소비 중지 및 재시작 {#stopping--restarting-message-consumption}

메시지 소비를 중지하려면 Kafka 엔진 테이블을 분리할 수 있습니다:

```sql
DETACH TABLE github_queue;
```

이렇게 해도 소비자 그룹의 오프셋에는 영향을 미치지 않습니다. 소비를 재시작하고 이전 오프셋에서 계속하려면 테이블을 다시 연결하십시오.

```sql
ATTACH TABLE github_queue;
```

##### Kafka 메타데이터 추가 {#adding-kafka-metadata}

ClickHouse로 데이터를 인제스트한 후에도 원래 Kafka 메시지의 메타데이터를 추적하는 것이 유용할 수 있습니다. 예를 들어, 특정 주제나 파티션을 얼마나 소비했는지 알고 싶을 수 있습니다. 이를 위해 Kafka 테이블 엔진은 여러 개의 [가상 컬럼](../../../engines/table-engines/index.md#table_engines-virtual_columns)을 노출합니다. 이러한 컬럼은 스키마 및 물리화된 뷰의 선택 문을 수정하여 우리의 대상 테이블에 컬럼으로 지속될 수 있습니다.

우선, 목표 테이블에 컬럼을 추가하기 전에 위에서 설명한 중지 작업을 수행합니다.

```sql
DETACH TABLE github_queue;
```

아래에서는 행이 유래한 출처 주제 및 파티션을 식별하기 위한 정보 컬럼을 추가합니다.

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

다음으로 가상 컬럼이 필요에 따라 매핑되었는지 확인해야 합니다. 가상 컬럼은 `_`로 접두사가 붙습니다. 가상 컬럼의 전체 목록은 [여기](../../../engines/table-engines/integrations/kafka.md#virtual-columns)에서 찾을 수 있습니다.

가상 컬럼으로 테이블을 업데이트하려면 물리화된 뷰를 삭제하고 Kafka 엔진 테이블을 다시 연결한 후 물리화된 뷰를 재생성해야 합니다.

```sql
DROP VIEW github_mv;
```

```sql
ATTACH TABLE github_queue;
```

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *, _topic AS topic, _partition as partition
FROM github_queue;
```

새로 소비된 행에는 메타데이터가 포함되어야 합니다.

```sql
SELECT actor_login, event_type, created_at, topic, partition
FROM github
LIMIT 10;
```

결과는 다음과 같아야 합니다:

| actor_login | event_type | created_at | topic | partition |
| :--- | :--- | :--- | :--- | :--- |
| IgorMinar | CommitCommentEvent | 2011-02-12 02:22:00 | github | 0 |
| queeup | CommitCommentEvent | 2011-02-12 02:23:23 | github | 0 |
| IgorMinar | CommitCommentEvent | 2011-02-12 02:23:24 | github | 0 |
| IgorMinar | CommitCommentEvent | 2011-02-12 02:24:50 | github | 0 |
| IgorMinar | CommitCommentEvent | 2011-02-12 02:25:20 | github | 0 |
| dapi | CommitCommentEvent | 2011-02-12 06:18:36 | github | 0 |
| sourcerebels | CommitCommentEvent | 2011-02-12 06:34:10 | github | 0 |
| jamierumbelow | CommitCommentEvent | 2011-02-12 12:21:40 | github | 0 |
| jpn | CommitCommentEvent | 2011-02-12 12:24:31 | github | 0 |
| Oxonium | CommitCommentEvent | 2011-02-12 12:31:28 | github | 0 |

##### Kafka 엔진 설정 수정 {#modify-kafka-engine-settings}

Kafka 엔진 테이블을 삭제하고 새로운 설정으로 재생성하는 것을 권장합니다. 이 과정에서 물리화된 뷰는 수정할 필요가 없습니다. Kafka 엔진 테이블이 재생성되면 메시지 소비가 재개됩니다.

##### 문제 디버깅 {#debugging-issues}

인증 문제와 같은 오류는 Kafka 엔진 DDL에 대한 응답에서 보고되지 않습니다. 문제 진단을 위해서는 기본 ClickHouse 로그 파일인 clickhouse-server.err.log를 사용하는 것이 좋습니다. 기본 Kafka 클라이언트 라이브러리인 [librdkafka](https://github.com/edenhill/librdkafka)에 대한 추가 추적 로깅은 구성을 통해 활성화할 수 있습니다.

```xml
<kafka>
   <debug>all</debug>
</kafka>
```

##### 잘못된 메시지 처리 {#handling-malformed-messages}

Kafka는 종종 데이터의 "폐기장"으로 사용됩니다. 이는 주제에 혼합된 메시지 형식과 일관성이 없는 필드 이름이 포함되게 합니다. 이를 피하고 Kafka Streams 또는 ksqlDB와 같은 Kafka 기능을 활용하여 메시지가 Kafka에 삽입되기 전에 올바른 형식과 일관성을 유지하도록 해야 합니다. 이러한 옵션이 불가능할 경우, ClickHouse에 도움이 될 수 있는 몇 가지 기능이 있습니다.

* 메시지 필드를 문자열로 처리하십시오. 필요시 물리화된 뷰 문에서 클렌징 및 캐스팅을 수행하는 함수를 사용할 수 있습니다. 이는 프로덕션 솔루션을 나타내서는 안되지만, 일회성 인제스트에 도움이 될 수 있습니다.
* 주제에서 JSON을 소비하고 있고 JSONEachRow 형식을 사용하고 있다면, 설정 [`input_format_skip_unknown_fields`](/operations/settings/formats#input_format_skip_unknown_fields)를 사용하십시오. 데이터를 쓸 때, 기본적으로 ClickHouse는 입력 데이터에 대상 테이블에 존재하지 않는 컬럼이 포함되어 있으면 예외를 발생시킵니다. 그러나 이 옵션이 활성화되면 이러한 여분의 컬럼은 무시됩니다. 다시 말하지만, 이는 프로덕션 수준의 솔루션이 아니며 다른 사람을 혼란스럽게 할 수 있습니다.
* 설정 `kafka_skip_broken_messages`를 고려해보십시오. 이는 잘못된 메시지에 대해 블록당 허용 수준을 지정하도록 요구합니다 - kafka_max_block_size의 맥락에서 고려됩니다. 이 허용 수준이 초과되면(절대 메시지 수로 측정됨) 일반 예외 동작으로 되돌아가며, 다른 메시지는 건너뛰게 됩니다.

##### 전달 의미론 및 중복 문제 {#delivery-semantics-and-challenges-with-duplicates}

Kafka 테이블 엔진은 최소한 한 번의 의미론을 가지고 있습니다. 중복은 여러 알려진 드문 상황에서 발생할 수 있습니다. 예를 들어, 메시지가 Kafka에서 읽히고 ClickHouse에 성공적으로 삽입 될 수 있습니다. 새로운 오프셋을 커밋하기 전에 Kafka와의 연결이 끊어질 수 있습니다. 이러한 상황에서 블록을 재시도해야 합니다. 이 블록은 [분산 테이블](#) 또는 ReplicatedMergeTree를 대상으로 하여 [중복 제거](/engines/table-engines/mergetree-family/replication)될 수 있습니다. 이는 중복 행의 기회를 줄이지만, 동일한 블록에 의존합니다. Kafka 리밸런싱과 같은 이벤트는 이 가정을 무효화하여 드문 경우에 중복을 초래할 수 있습니다.

##### 쿼럼 기반 삽입 {#quorum-based-inserts}

ClickHouse에서 더 높은 전달 보장이 필요한 경우 [quorum-based inserts](/operations/settings/settings#insert_quorum)가 필요할 수 있습니다. 이는 물리화된 뷰나 대상 테이블에서 설정할 수 없습니다. 그러나 사용자 프로필에 대해 설정할 수 있습니다. 

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouse에서 Kafka로 {#clickhouse-to-kafka}

드문 사용 사례지만, ClickHouse 데이터를 Kafka에 지속할 수도 있습니다. 예를 들어 Kafka 테이블 엔진에 행을 수동으로 삽입할 것입니다. 이 데이터는 같은 Kafka 엔진이 읽게 되며, 해당 물리화된 뷰는 데이터를 Merge Tree 테이블에 삽입할 것입니다. 마지막으로, 기존 원본 테이블에서 테이블을 읽기 위해 Kafka에 삽입하는 물리화된 뷰의 적용을 보여줍니다.

#### 단계 {#steps-1}

우리의 초기 목표는 다음과 같이 가장 잘 설명됩니다:

<Image img={kafka_02} size="lg" alt="Kafka 테이블 엔진 삽입 다이어그램" />

우리는 [Kafka에서 ClickHouse로](#kafka-to-clickhouse) 단계에 따라 테이블과 뷰가 생성되었다고 가정하며, 주제가 완전히 소비되었다고 가정합니다.

##### 1. 행을 직접 삽입하기 {#1-inserting-rows-directly}

먼저 대상 테이블의 개수를 확인하십시오.

```sql
SELECT count() FROM github;
```

200,000 행이 있어야 합니다:
```response
┌─count()─┐
│  200000 │
└─────────┘
```

이제 GitHub 대상 테이블에서 Kafka 테이블 엔진인 github_queue로 행을 다시 삽입합니다. JSONEachRow 형식을 활용하고 선택을 100으로 제한하는 방법을 주목하십시오.

```sql
INSERT INTO github_queue SELECT * FROM github LIMIT 100 FORMAT JSONEachRow
```

GitHub에서 행을 다시 세어보아야 하며 100이 증가했음을 확인해야 합니다. 위 다이어그램에서 볼 수 있듯이, 행이 Kafka 테이블 엔진을 통해 Kafka에 삽입된 후, 같은 엔진에 의해 다시 읽혀 GitHub 대상 테이블에 물리화된 뷰로 삽입되었습니다!

```sql
SELECT count() FROM github;
```

100개의 추가 행을 볼 수 있어야 합니다:
```response
┌─count()─┐
│  200100 │
└─────────┘
```

##### 2. 물리화된 뷰 사용하기 {#2-using-materialized-views}

우리는 문서가 테이블에 삽입될 때 Kafka 엔진(및 주제)으로 메시지를 푸시하기 위해 물리화된 뷰를 활용할 수 있습니다. GitHub 테이블에 행이 삽입되면 물리화된 뷰가 발동되어, 행이 다시 Kafka 엔진으로 삽입되고 새로운 주제로 저장됩니다. 다시 말하지만 이는 다음과 같이 가장 잘 설명됩니다:

<Image img={kafka_03} size="lg" alt="물리화된 뷰가 있는 Kafka 테이블 엔진 다이어그램"/>

새 Kafka 주제 `github_out` 또는 이에 상응하는 주제를 생성합니다. Kafka 테이블 엔진 `github_out_queue`가 이 주제를 가리키도록 하십시오.

```sql
CREATE TABLE github_out_queue
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
    labels Array(LowCardinality(String)),
    state Enum('none' = 0, 'open' = 1, 'closed' = 2),
    assignee LowCardinality(String),
    assignees Array(LowCardinality(String)),
    closed_at DateTime,
    merged_at DateTime,
    merge_commit_sha String,
    requested_reviewers Array(LowCardinality(String)),
    merged_by LowCardinality(String),
    review_comments UInt32,
    member_login LowCardinality(String)
)
   ENGINE = Kafka('host:port', 'github_out', 'clickhouse_out',
            'JSONEachRow') SETTINGS kafka_thread_per_consumer = 0, kafka_num_consumers = 1;
```

이제 GitHub 테이블을 가리키는 새로운 물리화된 뷰 `github_out_mv`를 생성하여, 트리거 시 위의 엔진에 행을 삽입합니다. 결과적으로 GitHub 테이블의 추가는 우리의 새로운 Kafka 주제로 전송될 것입니다.

```sql
CREATE MATERIALIZED VIEW github_out_mv TO github_out_queue AS
SELECT file_time, event_type, actor_login, repo_name,
       created_at, updated_at, action, comment_id, path,
       ref, ref_type, creator_user_login, number, title,
       labels, state, assignee, assignees, closed_at, merged_at,
       merge_commit_sha, requested_reviewers, merged_by,
       review_comments, member_login
FROM github
FORMAT JsonEachRow;
```

[Kafka에서 ClickHouse로](#kafka-to-clickhouse) 단계에서 생성된 원래 github 주제로 삽입하는 경우, 문서는 마법처럼 "github_clickhouse" 주제에서 나타날 것입니다. 이를 원주율 Kafka 도구로 확인하십시오. 예를 들어, 아래에서 Confluent Cloud 호스팅 주제에 [kcat](https://github.com/edenhill/kcat)를 사용하여 github 주제로 100개 행을 삽입합니다:

```sql
head -n 10 github_all_columns.ndjson |
kcat -P \
  -b <host>:<port> \
  -t github
  -X security.protocol=sasl_ssl \
  -X sasl.mechanisms=PLAIN \
  -X sasl.username=<username> \
  -X sasl.password=<password>
```

`github_out` 주제를 읽으면 메시지 전달이 확인되어야 합니다.

```sql
kcat -C \
  -b <host>:<port> \
  -t github_out \
  -X security.protocol=sasl_ssl \
  -X sasl.mechanisms=PLAIN \
  -X sasl.username=<username> \
  -X sasl.password=<password> \
  -e -q |
wc -l
```

비록 복잡한 예이지만, 이는 Kafka 엔진과 함께 사용할 때 물리화된 뷰의 힘을 보여줍니다.

### 클러스터 및 성능 {#clusters-and-performance}

#### ClickHouse 클러스터 작업하기 {#working-with-clickhouse-clusters}

Kafka 소비자 그룹을 통해, 여러 ClickHouse 인스턴스가 동일한 주제에서 데이터를 잠재적으로 읽을 수 있습니다. 각 소비자는 1:1 매핑으로 주제 파티션에 할당됩니다. Kafka 테이블 엔진을 사용하여 ClickHouse 소비를 확장할 때, 클러스터 내의 소비자 총 수는 주제의 파티션 수를 초과할 수 없습니다. 따라서 주제를 위해 적절하게 파티셔닝이 구성되었는지 미리 확인하십시오.

여러 ClickHouse 인스턴스는 모두 동일한 소비자 그룹 id를 사용하여 주제로부터 읽도록 구성될 수 있습니다 - 이는 Kafka 테이블 엔진 생성 시 지정됩니다. 따라서 각 인스턴스는 하나 이상의 파티션에서 읽고, 그들의 로컬 대상 테이블에 세그먼트를 삽입합니다. 대상 테이블은 중복 데이터 처리를 위해 ReplicatedMergeTree를 사용하도록 구성될 수 있습니다. 이러한 접근 방식은 Kafka 읽기를 ClickHouse 클러스터와 함께 확장할 수 있게 하며, 충분한 Kafka 파티션이 제공됩니다.

<Image img={kafka_04} size="lg" alt="ClickHouse 클러스터가 있는 Kafka 테이블 엔진 다이어그램"/>

#### 성능 조정 {#tuning-performance}

Kafka 엔진 테이블의 처리량 성능을 높이기 위해 다음을 고려하십시오:

* 성능은 메시지 크기, 형식 및 대상 테이블 유형에 따라 달라집니다. 단일 테이블 엔진에서 100k 행/초는 달성 가능한 것으로 간주해야 합니다. 기본적으로 메시지는 kafka_max_block_size 매개변수에 의해 제어되는 블록으로 읽힙니다. 기본값은 [max_insert_block_size](/operations/settings/settings#max_insert_block_size)로 기본값은 1,048,576입니다. 메시지가 매우 크지 않으면, 이는 거의 항상 증가해야 합니다. 500k에서 1M 사이의 값은 드물지 않습니다. 테스트를 수행하고 처리량 성능에 미치는 영향을 평가하십시오.
* 테이블 엔진의 소비자 수는 kafka_num_consumers를 사용하여 증가시킬 수 있습니다. 그러나 기본적으로 삽입은 단일 스레드에서 선형화됩니다. 이를 위해서는 kafka_thread_per_consumer의 기본값인 1에서 변경해야 합니다. 이를 1로 설정하면 플러시가 병렬로 수행되도록 보장됩니다. 주의할 점은 N 소비자와 kafka_thread_per_consumer=1인 Kafka 엔진 테이블을 생성하는 것은 각각 물리화된 뷰와 kafka_thread_per_consumer=0을 가진 N개의 Kafka 엔진을 생성하는 것과 논리적으로 동등하다는 점입니다.
* 소비자를 증가시키는 것은 무료 작업이 아닙니다. 각 소비자는 자기 고유의 버퍼와 스레드를 유지하며, 서버에서 오버헤드를 증가시킵니다. 소비자 오버헤드를 주의하고 클러스터 전반에 걸쳐 선형적으로 스케일을 확장하십시오.
* Kafka 메시지의 처리량이 변동적이고 지연이 허용된다면, stream_flush_interval_ms를 증가시켜 더 큰 블록이 플러시 될 수 있도록 하십시오.
* [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)는 백그라운드 작업을 수행하는 스레드 수를 설정합니다. 이러한 스레드는 Kafka 스트리밍에 사용됩니다. 이 설정은 ClickHouse 서버 시작 시 적용되며, 사용자 세션에서 변경할 수 없으며 기본값은 16입니다. 로그에서 시간 초과가 발생하는 경우 이를 증가시키는 것이 적절할 수 있습니다.
* Kafka와의 통신을 위해 librdkafka 라이브러리가 사용되며, 이는 자체적으로 스레드를 생성합니다. 대량의 Kafka 테이블이나 소비자가 있을 경우, 대량의 컨텍스트 스위치가 발생할 수 있습니다. 이 부하를 클러스터 전반에 분산하고 대상을 가능하면 복제하는 것을 고려하십시오. 또는 여러 주제로부터 읽기 위해 테이블 엔진을 사용하는 것을 고려하십시오 - 값의 목록이 지원됩니다. 단일 테이블에서 여러 물리화된 뷰를 읽을 수 있으며, 각 물리화된 뷰는 특정 주제의 데이터로 필터링합니다.

모든 설정 변경 사항은 테스트되어야 합니다. 적절히 스케일되었는지를 보장하기 위해 Kafka 소비자 지연 시간을 모니터링하는 것을 권장합니다.

#### 추가 설정 {#additional-settings}

위에서 논의한 설정 이외에도, 다음 설정이 유용할 수 있습니다:

* [Kafka_max_wait_ms](/operations/settings/settings#kafka_max_wait_ms) - 재시도 전에 Kafka에서 메시지를 읽기 위한 대기 시간(밀리초)입니다. 사용자 프로필 수준에서 설정되며 기본값은 5000입니다.

기본 라이브러리인 librdkafka의 [모든 설정](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)은 ClickHouse 구성 파일 내의 _kafka_ 요소에 배치될 수 있습니다 - 설정 이름은 마침표를 밑줄로 대체한 XML 요소여야 합니다 (예를 들어).

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

이것은 전문가 설정이며, Kafka 문서를 참고하여 심층적인 설명을 확인하는 것이 좋습니다.
