---
'sidebar_label': '스키마 레지스트리와 통합하기'
'description': '스키마 관리를 위한 스키마 레지스트리와 ClickPipes를 통합하는 방법'
'slug': '/integrations/clickpipes/kafka/schema-registries'
'sidebar_position': 1
'title': 'Kafka ClickPipe를 위한 스키마 레지스트리'
'doc_type': 'guide'
'keywords':
- 'schema registries'
- 'kafka'
- 'clickpipes'
- 'avro'
- 'confluent'
---


# 스키마 레지스트리 {#schema-registries}

ClickPipes는 Avro 데이터 스트림을 위한 스키마 레지스트리를 지원합니다.

## Kafka ClickPipes를 위한 지원 스키마 레지스트리 {#supported-schema-registries}

Confluent Schema Registry와 API 호환되는 스키마 레지스트리가 지원됩니다. 여기에는 다음이 포함됩니다:

- Confluent Schema Registry
- Redpanda Schema Registry

ClickPipes는 아직 AWS Glue Schema Registry 또는 Azure Schema Registry를 지원하지 않습니다. 이러한 스키마 레지스트리에 대한 지원이 필요하시면, [저희 팀에 연락해 주시기 바랍니다](https://clickhouse.com/company/contact?loc=clickpipes).

## 구성 {#schema-registry-configuration}

Avro 데이터가 있는 ClickPipes는 스키마 레지스트리가 필요합니다. 이는 다음 세 가지 방법 중 하나로 구성할 수 있습니다:

1. 스키마 주제에 대한 전체 경로 제공 (예: `https://registry.example.com/subjects/events`)
    - 선택적으로, 특정 버전은 URL에 `/versions/[version]`를 추가하여 참조할 수 있습니다 (그렇지 않으면 ClickPipes가 최신 버전을 검색합니다).
2. 스키마 ID에 대한 전체 경로 제공 (예: `https://registry.example.com/schemas/ids/1000`)
3. 루트 스키마 레지스트리 URL 제공 (예: `https://registry.example.com`)

## 작동 방식 {#how-schema-registries-work}

ClickPipes는 구성된 스키마 레지스트리에서 Avro 스키마를 동적으로 검색하고 적용합니다.
- 메시지에 스키마 ID가 포함되어 있으면 이를 사용하여 스키마를 검색합니다.
- 메시지에 스키마 ID가 포함되어 있지 않으면, ClickPipe 구성에서 지정된 스키마 ID 또는 주제 이름을 사용하여 스키마를 검색합니다.
- 메시지가 임베디드 스키마 ID 없이 작성되고, ClickPipe 구성에서 스키마 ID 또는 주제 이름이 지정되지 않은 경우, 스키마는 검색되지 않으며 메시지는 건너뛰어지며 `SOURCE_SCHEMA_ERROR`가 ClickPipes 오류 테이블에 기록됩니다.
- 메시지가 스키마와 일치하지 않으면, 메시지는 건너뛰어지며 `DATA_PARSING_ERROR`가 ClickPipes 오류 테이블에 기록됩니다.

## 스키마 매핑 {#schema-mapping}

검색된 Avro 스키마와 ClickHouse 대상 테이블 간의 매핑에 다음 규칙이 적용됩니다:

- Avro 스키마가 ClickHouse 대상 매핑에 포함되지 않은 필드를 포함하는 경우, 해당 필드는 무시됩니다.
- Avro 스키마에 ClickHouse 대상 매핑에서 정의된 필드가 누락된 경우, ClickHouse 컬럼은 0 또는 빈 문자열과 같은 "제로" 값으로 채워집니다. ClickPipes 삽입에 대해 DEFAULT 표현식은 현재 평가되지 않음을 주의하십시오 (이는 ClickHouse 서버 기본 처리 업데이트를 기다리는 임시 제한 사항입니다).
- Avro 스키마 필드와 ClickHouse 컬럼이 호환되지 않으면, 해당 행/메시지의 삽입이 실패하며, 실패는 ClickPipes 오류 테이블에 기록됩니다. 여러 암묵적 변환이 지원되지만 (예: 숫자 유형 간의 변환) 모든 변환이 지원되는 것은 아닙니다 (예: Avro 레코드 필드는 Int32 ClickHouse 컬럼에 삽입될 수 없습니다).
