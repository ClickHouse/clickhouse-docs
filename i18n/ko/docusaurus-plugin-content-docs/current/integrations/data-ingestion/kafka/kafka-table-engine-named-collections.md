---
'title': 'ClickHouse와 Kafka를 명명된 컬렉션으로 통합하기'
'description': 'Kafka에 연결하기 위해 명명된 컬렉션을 사용하는 방법'
'keywords':
- 'named collection'
- 'how to'
- 'kafka'
'slug': '/integrations/data-ingestion/kafka/kafka-table-engine-named-collections'
'doc_type': 'guide'
---


# ClickHouse와 Kafka 통합하기: 명명된 컬렉션 사용

## 소개 {#introduction}

이 가이드에서는 명명된 컬렉션을 사용하여 ClickHouse를 Kafka에 연결하는 방법을 탐구합니다. 명명된 컬렉션을 위한 구성 파일을 사용하는 것은 여러 가지 장점을 제공합니다:
- 구성 설정을 중앙 집중화하고 더 쉽게 관리할 수 있습니다.
- SQL 테이블 정의를 변경하지 않고도 설정을 수정할 수 있습니다.
- 단일 구성 파일을 검사하여 구성 검토와 문제 해결이 더 쉽습니다.

이 가이드는 Apache Kafka 3.4.1과 ClickHouse 24.5.1에서 테스트되었습니다.

## 가정 {#assumptions}

이 문서는 다음 사항을 가정합니다:
1. 작동하는 Kafka 클러스터가 있습니다.
2. 설정되어 실행 중인 ClickHouse 클러스터가 있습니다.
3. SQL에 대한 기본 지식과 ClickHouse 및 Kafka 구성에 대한 친숙함이 있습니다.

## 전제 조건 {#prerequisites}

명명된 컬렉션을 생성하는 사용자가 필요한 액세스 권한을 가지고 있는지 확인하세요:

```xml
<access_management>1</access_management>
<named_collection_control>1</named_collection_control>
<show_named_collections>1</show_named_collections>
<show_named_collections_secrets>1</show_named_collections_secrets>
```

액세스 제어를 활성화하는 방법에 대한 자세한 내용은 [사용자 관리 가이드](./../../../guides/sre/user-management/index.md)를 참조하세요.

## 구성 {#configuration}

ClickHouse `config.xml` 파일에 다음 섹션을 추가하세요:

```xml
<!-- Named collections for Kafka integration -->
<named_collections>
    <cluster_1>
        <!-- ClickHouse Kafka engine parameters -->
        <kafka_broker_list>c1-kafka-1:9094,c1-kafka-2:9094,c1-kafka-3:9094</kafka_broker_list>
        <kafka_topic_list>cluster_1_clickhouse_topic</kafka_topic_list>
        <kafka_group_name>cluster_1_clickhouse_consumer</kafka_group_name>
        <kafka_format>JSONEachRow</kafka_format>
        <kafka_commit_every_batch>0</kafka_commit_every_batch>
        <kafka_num_consumers>1</kafka_num_consumers>
        <kafka_thread_per_consumer>1</kafka_thread_per_consumer>

        <!-- Kafka extended configuration -->
        <kafka>
            <security_protocol>SASL_SSL</security_protocol>
            <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
            <sasl_mechanism>PLAIN</sasl_mechanism>
            <sasl_username>kafka-client</sasl_username>
            <sasl_password>kafkapassword1</sasl_password>
            <debug>all</debug>
            <auto_offset_reset>latest</auto_offset_reset>
        </kafka>
    </cluster_1>

    <cluster_2>
        <!-- ClickHouse Kafka engine parameters -->
        <kafka_broker_list>c2-kafka-1:29094,c2-kafka-2:29094,c2-kafka-3:29094</kafka_broker_list>
        <kafka_topic_list>cluster_2_clickhouse_topic</kafka_topic_list>
        <kafka_group_name>cluster_2_clickhouse_consumer</kafka_group_name>
        <kafka_format>JSONEachRow</kafka_format>
        <kafka_commit_every_batch>0</kafka_commit_every_batch>
        <kafka_num_consumers>1</kafka_num_consumers>
        <kafka_thread_per_consumer>1</kafka_thread_per_consumer>

        <!-- Kafka extended configuration -->
        <kafka>
            <security_protocol>SASL_SSL</security_protocol>
            <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
            <sasl_mechanism>PLAIN</sasl_mechanism>
            <sasl_username>kafka-client</sasl_username>
            <sasl_password>kafkapassword2</sasl_password>
            <debug>all</debug>
            <auto_offset_reset>latest</auto_offset_reset>
        </kafka>
    </cluster_2>
</named_collections>
```

### 구성 노트 {#configuration-notes}

1. Kafka 주소 및 관련 구성을 귀하의 Kafka 클러스터 설정에 맞게 조정하세요.
2. `<kafka>` 앞의 섹션은 ClickHouse Kafka 엔진 매개변수를 포함하고 있습니다. 매개변수의 전체 목록은 [Kafka 엔진 매개변수 ](/engines/table-engines/integrations/kafka)를 참조하세요.
3. `<kafka>` 내의 섹션은 확장된 Kafka 구성 옵션을 포함하고 있습니다. 더 많은 옵션은 [librdkafka 구성](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md)을 참조하세요.
4. 이 예제에서는 `SASL_SSL` 보안 프로토콜 및 `PLAIN` 메커니즘을 사용합니다. Kafka 클러스터 구성에 따라 이 설정을 조정하세요.

## 데이터베이스 및 테이블 생성 {#creating-tables-and-databases}

ClickHouse 클러스터에 필요한 데이터베이스와 테이블을 생성하세요. ClickHouse를 단일 노드로 실행하는 경우 SQL 명령에서 클러스터 부분을 생략하고 `ReplicatedMergeTree` 대신 다른 엔진을 사용하세요.

### 데이터베이스 생성 {#create-the-database}

```sql
CREATE DATABASE kafka_testing ON CLUSTER LAB_CLICKHOUSE_CLUSTER;
```

### Kafka 테이블 생성 {#create-kafka-tables}

첫 번째 Kafka 클러스터에 대한 첫 번째 Kafka 테이블을 생성하세요:

```sql
CREATE TABLE kafka_testing.first_kafka_table ON CLUSTER LAB_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
)
ENGINE = Kafka(cluster_1);
```

두 번째 Kafka 클러스터에 대한 두 번째 Kafka 테이블을 생성하세요:

```sql
CREATE TABLE kafka_testing.second_kafka_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
)
ENGINE = Kafka(cluster_2);
```

### 복제 테이블 생성 {#create-replicated-tables}

첫 번째 Kafka 테이블에 대한 테이블을 생성하세요:

```sql
CREATE TABLE kafka_testing.first_replicated_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
) ENGINE = ReplicatedMergeTree()
ORDER BY id;
```

두 번째 Kafka 테이블에 대한 테이블을 생성하세요:

```sql
CREATE TABLE kafka_testing.second_replicated_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
) ENGINE = ReplicatedMergeTree()
ORDER BY id;
```

### 물리화된 뷰 생성 {#create-materialized-views}

첫 번째 Kafka 테이블에서 첫 번째 복제 테이블로 데이터를 삽입하는 물리화된 뷰를 생성하세요:

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_1_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO first_replicated_table AS
SELECT 
    id,
    first_name,
    last_name
FROM first_kafka_table;
```

두 번째 Kafka 테이블에서 두 번째 복제 테이블로 데이터를 삽입하는 물리화된 뷰를 생성하세요:

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_2_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO second_replicated_table AS
SELECT 
    id,
    first_name,
    last_name
FROM second_kafka_table;
```

## 설정 검증 {#verifying-the-setup}

이제 Kafka 클러스터에서 상대 소비자 그룹을 확인할 수 있어야 합니다:
- `cluster_1_clickhouse_consumer` on `cluster_1`
- `cluster_2_clickhouse_consumer` on `cluster_2`

어떤 ClickHouse 노드에서든 다음 쿼리를 실행하여 두 테이블의 데이터를 확인하세요:

```sql
SELECT * FROM first_replicated_table LIMIT 10;
```

```sql
SELECT * FROM second_replicated_table LIMIT 10;
```

### 참고 {#note}

이 가이드에서는 두 Kafka 주제에 수집된 데이터가 동일합니다. 귀하의 경우에는 다를 수 있습니다. 원하는 만큼 많은 Kafka 클러스터를 추가할 수 있습니다.

예시 출력:

```sql
┌─id─┬─first_name─┬─last_name─┐
│  0 │ FirstName0 │ LastName0 │
│  1 │ FirstName1 │ LastName1 │
│  2 │ FirstName2 │ LastName2 │
└────┴────────────┴───────────┘
```

이로써 명명된 컬렉션을 사용하여 ClickHouse와 Kafka 통합에 대한 설정이 완료되었습니다. ClickHouse `config.xml` 파일에서 Kafka 구성을 중앙 집중화함으로써 설정을 보다 쉽게 관리하고 조정할 수 있으며, 매끄럽고 효율적인 통합을 보장할 수 있습니다.
