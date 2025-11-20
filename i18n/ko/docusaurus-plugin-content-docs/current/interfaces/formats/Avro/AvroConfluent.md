---
'alias': []
'description': 'AvroConfluent 형식에 대한 문서'
'input_format': true
'keywords':
- 'AvroConfluent'
'output_format': false
'slug': '/interfaces/formats/AvroConfluent'
'title': 'AvroConfluent'
'doc_type': 'reference'
---

import DataTypesMatching from './_snippets/data-types-matching.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |

## 설명 {#description}

[Apache Avro](https://avro.apache.org/)는 효율적인 데이터 처리를 위해 바이너리 인코딩을 사용하는 행 기반 직렬화 형식입니다. `AvroConfluent` 형식은 [Confluent Schema Registry](https://docs.confluent.io/current/schema-registry/index.html) (또는 API 호환 서비스)를 사용하여 직렬화된 단일 객체의 Avro 인코딩 Kafka 메시지를 디코딩하는 것을 지원합니다.

각 Avro 메시지는 ClickHouse가 설정된 스키마 레지스트리를 쿼리하여 자동으로 해결하는 스키마 ID를 포함합니다. 해결된 스키마는 최적의 성능을 위해 캐시됩니다.

<a id="data-types-matching"></a>
## 데이터 형식 매핑 {#data-type-mapping}

<DataTypesMatching/>

## 형식 설정 {#format-settings}

[//]: # "NOTE 이러한 설정은 세션 수준에서 설정할 수 있지만, 이건 일반적이지 않으며 이를 너무 두드러지게 문서화하면 사용자에게 혼란을 줄 수 있습니다."

| 설정                                       | 설명                                                                                               | 기본값  |
|-------------------------------------------|---------------------------------------------------------------------------------------------------|---------|
| `input_format_avro_allow_missing_fields`  | 스키마에서 필드를 찾을 수 없을 때 오류 대신 기본 값을 사용할지 여부.                              | `0`     |
| `input_format_avro_null_as_default`       | Nullable이 아닌 컬럼에 `null` 값을 삽입할 때 오류 대신 기본 값을 사용할지 여부.               |   `0`   |
| `format_avro_schema_registry_url`         | Confluent Schema Registry URL. 기본 인증의 경우 URL 인코딩된 자격 증명을 URL 경로에 직접 포함할 수 있습니다. |         |

## 예제 {#examples}

### 스키마 레지스트리 사용하기 {#using-a-schema-registry}

[Kafka 테이블 엔진](/engines/table-engines/integrations/kafka.md)을 사용하여 Avro 인코딩된 Kafka 주제를 읽으려면 `format_avro_schema_registry_url` 설정을 사용하여 스키마 레지스트리의 URL을 제공하십시오.

```sql
CREATE TABLE topic1_stream
(
    field1 String,
    field2 String
)
ENGINE = Kafka()
SETTINGS
kafka_broker_list = 'kafka-broker',
kafka_topic_list = 'topic1',
kafka_group_name = 'group1',
kafka_format = 'AvroConfluent',
format_avro_schema_registry_url = 'http://schema-registry-url';

SELECT * FROM topic1_stream;
```

#### 기본 인증 사용하기 {#using-basic-authentication}

스키마 레지스트리가 기본 인증을 요구하는 경우 (예: Confluent Cloud를 사용하는 경우) `format_avro_schema_registry_url` 설정에 URL 인코딩된 자격 증명을 제공할 수 있습니다.

```sql
CREATE TABLE topic1_stream
(
    field1 String,
    field2 String
)
ENGINE = Kafka()
SETTINGS
kafka_broker_list = 'kafka-broker',
kafka_topic_list = 'topic1',
kafka_group_name = 'group1',
kafka_format = 'AvroConfluent',
format_avro_schema_registry_url = 'https://<username>:<password>@schema-registry-url';
```

## 문제 해결 {#troubleshooting}

Kafka 소비자와 관련된 오류 및 수집 진행 상황을 모니터링하려면 [`system.kafka_consumers` 시스템 테이블](../../../operations/system-tables/kafka_consumers.md)을 쿼리할 수 있습니다. 배포에 여러 복제본이 있는 경우 (예: ClickHouse Cloud)에는 [`clusterAllReplicas`](../../../sql-reference/table-functions/cluster.md) 테이블 함수를 사용해야 합니다.

```sql
SELECT * FROM clusterAllReplicas('default',system.kafka_consumers)
ORDER BY assignments.partition_id ASC;
```

스키마 해결 문제에 직면한 경우 [kafkacat](https://github.com/edenhill/kafkacat)와 [clickhouse-local](/operations/utilities/clickhouse-local.md)을 사용하여 문제를 해결할 수 있습니다:

```bash
$ kafkacat -b kafka-broker  -C -t topic1 -o beginning -f '%s' -c 3 | clickhouse-local   --input-format AvroConfluent --format_avro_schema_registry_url 'http://schema-registry' -S "field1 Int64, field2 String"  -q 'select *  from table'
1 a
2 b
3 c
```
