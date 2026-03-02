---
title: 'Named Collection을 사용하여 ClickHouse와 Kafka 연동하기'
description: 'Named Collection을 사용하여 ClickHouse를 Kafka와 연결하는 방법'
keywords: ['named collection', '사용 방법', 'kafka']
slug: /integrations/data-ingestion/kafka/kafka-table-engine-named-collections
doc_type: 'guide'
---



# 이름이 지정된 컬렉션(named collection)을 사용한 ClickHouse와 Kafka 통합 \{#integrating-clickhouse-with-kafka-using-named-collections\}



## 소개 \{#introduction\}

이 가이드에서는 named collections를 사용하여 ClickHouse를 Kafka에 연결하는 방법을 설명합니다. named collections용 구성 파일을 사용하면 다음과 같은 장점이 있습니다:
- 설정을 중앙에서 보다 쉽게 관리할 수 있습니다.
- SQL 테이블 정의를 변경하지 않고도 설정을 변경할 수 있습니다.
- 단일 구성 파일만 확인하여 설정을 더 쉽게 검토하고 문제를 해결할 수 있습니다.

이 가이드는 Apache Kafka 3.4.1 및 ClickHouse 24.5.1에서 테스트되었습니다.



## 가정 \{#assumptions\}

이 문서는 다음 조건을 충족하고 있다고 가정합니다:
1. 정상적으로 동작하는 Kafka 클러스터
2. 구성되어 실행 중인 ClickHouse 클러스터
3. 기본적인 SQL 지식과 ClickHouse 및 Kafka 구성에 대한 이해



## 사전 요구 사항 \{#prerequisites\}

Named collection을 생성하는 USER에게 필요한 액세스 권한이 있는지 확인하십시오.

```xml
<access_management>1</access_management>
<named_collection_control>1</named_collection_control>
<show_named_collections>1</show_named_collections>
<show_named_collections_secrets>1</show_named_collections_secrets>
```

액세스 제어를 활성화하는 방법에 대한 자세한 내용은 [User Management Guide](./../../../guides/sre/user-management/index.md)를 참조하십시오.


## 구성 \{#configuration\}

다음 섹션을 ClickHouse `config.xml` 파일에 추가하십시오:

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

### 구성 참고 사항 \{#configuration-notes\}

1. Kafka 주소와 관련 설정을 Kafka 클러스터 구성에 맞게 조정하십시오.
2. `<kafka>` 앞에 있는 섹션에는 ClickHouse Kafka 엔진 파라미터가 포함되어 있습니다. 전체 파라미터 목록은 [Kafka 엔진 파라미터](/engines/table-engines/integrations/kafka)를 참고하십시오.
3. `<kafka>` 섹션에는 추가적인 Kafka 구성 옵션이 포함되어 있습니다. 더 많은 옵션은 [librdkafka 구성](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md)을 참고하십시오.
4. 이 예시는 `SASL_SSL` 보안 프로토콜과 `PLAIN` 메커니즘을 사용합니다. Kafka 클러스터 구성에 따라 이러한 설정을 조정하십시오.


## 테이블과 데이터베이스 생성 \{#creating-tables-and-databases\}

ClickHouse 클러스터에 필요한 데이터베이스와 테이블을 생성합니다. ClickHouse를 단일 노드로 실행하는 경우 SQL 명령에서 클러스터 관련 구문을 생략하고 `ReplicatedMergeTree` 대신 다른 엔진을 사용하십시오.

### 데이터베이스 생성 \{#create-the-database\}

```sql
CREATE DATABASE kafka_testing ON CLUSTER LAB_CLICKHOUSE_CLUSTER;
```

### Kafka 테이블 생성 \{#create-kafka-tables\}

첫 번째 Kafka 클러스터에 대한 첫 번째 Kafka 테이블을 생성합니다:

```sql
CREATE TABLE kafka_testing.first_kafka_table ON CLUSTER LAB_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
)
ENGINE = Kafka(cluster_1);
```

두 번째 Kafka 클러스터에 대한 두 번째 Kafka 테이블을 생성합니다.

```sql
CREATE TABLE kafka_testing.second_kafka_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
)
ENGINE = Kafka(cluster_2);
```

### 복제된 테이블(Replicated Table) 생성 \{#create-replicated-tables\}

첫 번째 Kafka용 테이블을 생성합니다:

```sql
CREATE TABLE kafka_testing.first_replicated_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
) ENGINE = ReplicatedMergeTree()
ORDER BY id;
```

두 번째 Kafka용 테이블을 생성합니다:

```sql
CREATE TABLE kafka_testing.second_replicated_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
) ENGINE = ReplicatedMergeTree()
ORDER BY id;
```

### materialized view 생성 \{#create-materialized-views\}

첫 번째 Kafka 테이블의 데이터를 첫 번째 복제된 테이블(Replicated Table)에 삽입하는 materialized view를 생성합니다.

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_1_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO first_replicated_table AS
SELECT 
    id,
    first_name,
    last_name
FROM first_kafka_table;
```

두 번째 Kafka 테이블에서 두 번째 복제된 테이블(Replicated Table)로 데이터를 삽입하는 materialized view를 생성합니다:

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_2_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO second_replicated_table AS
SELECT 
    id,
    first_name,
    last_name
FROM second_kafka_table;
```


## 설정 검증하기 \{#verifying-the-setup\}

이제 각 Kafka 클러스터에서 해당 Consumer Group을 확인할 수 있습니다:

* `cluster_1`의 `cluster_1_clickhouse_consumer`
* `cluster_2`의 `cluster_2_clickhouse_consumer`

두 테이블의 데이터를 확인하려면, 사용 중인 ClickHouse 노드 중 임의의 노드에서 다음 쿼리를 실행하십시오:

```sql
SELECT * FROM first_replicated_table LIMIT 10;
```

```sql
SELECT * FROM second_replicated_table LIMIT 10;
```

### 참고 \{#note\}

이 가이드에서는 두 Kafka 토픽에 수집되는 데이터가 동일합니다. 실제 환경에서는 서로 다를 것입니다. 필요한 만큼 많은 Kafka 클러스터를 추가할 수 있습니다.

예시 출력:

```sql
┌─id─┬─first_name─┬─last_name─┐
│  0 │ FirstName0 │ LastName0 │
│  1 │ FirstName1 │ LastName1 │
│  2 │ FirstName2 │ LastName2 │
└────┴────────────┴───────────┘
```

이로써 named collection을 사용하여 ClickHouse와 Kafka를 연동하기 위한 설정이 완료됩니다. Kafka 설정을 ClickHouse의 `config.xml` 파일로 중앙집중화하면 설정을 더 쉽게 관리하고 조정할 수 있어, 보다 간소하고 효율적인 통합을 구현할 수 있습니다.
