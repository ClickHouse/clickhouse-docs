---
sidebar_label: '스키마 레지스트리 통합'
description: '스키마 관리를 위해 ClickPipes를 스키마 레지스트리와 연동하는 방법'
slug: /integrations/clickpipes/kafka/schema-registries
sidebar_position: 1
title: 'Kafka ClickPipe용 스키마 레지스트리'
doc_type: 'guide'
keywords: ['schema registries', 'kafka', 'clickpipes', 'avro', 'confluent']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

# 스키마 레지스트리 \{#schema-registries\}

ClickPipes는 Avro 형식 데이터 스트림을 위한 스키마 레지스트리를 지원합니다.

## Kafka ClickPipes에서 지원되는 스키마 레지스트리 \{#supported-schema-registries\}

Confluent Schema Registry와 API 호환되는 스키마 레지스트리를 지원합니다. 여기에는 다음이 포함됩니다:

- Confluent Schema Registry
- Redpanda Schema Registry

ClickPipes는 아직 AWS Glue Schema Registry나 Azure Schema Registry를 지원하지 않습니다. 이러한 스키마 레지스트리에 대한 지원이 필요한 경우 [당사 팀에 문의하십시오](https://clickhouse.com/company/contact?loc=clickpipes).

## 구성 \{#schema-registry-configuration\}

Avro 데이터를 사용하는 ClickPipes에는 스키마 레지스트리가 필요합니다. 다음 세 가지 방법 중 하나로 구성할 수 있습니다.

1. 스키마 subject에 대한 전체 경로를 제공합니다(예: `https://registry.example.com/subjects/events`).
    - 필요하다면 URL 끝에 `/versions/[version]`을 추가하여 특정 버전을 참조할 수 있습니다. 그렇지 않으면 ClickPipes에서 최신 버전을 가져옵니다.
2. 스키마 ID에 대한 전체 경로를 제공합니다(예: `https://registry.example.com/schemas/ids/1000`).
3. 루트 스키마 레지스트리 URL을 제공합니다(예: `https://registry.example.com`).

## 작동 방식 \{#how-schema-registries-work\}

ClickPipes는 설정된 스키마 레지스트리에서 Avro 스키마를 동적으로 조회하여 적용합니다.

- 메시지에 스키마 ID가 포함되어 있으면, 해당 ID를 사용하여 스키마를 조회합니다.
- 메시지에 스키마 ID가 포함되어 있지 않으면, ClickPipe 설정에 지정된 스키마 ID 또는 subject 이름을 사용하여 스키마를 조회합니다.
- 메시지가 포함된 스키마 ID 없이 기록되었고, ClickPipe 설정에 스키마 ID나 subject 이름이 지정되어 있지 않은 경우 스키마를 조회하지 않으며, 메시지는 건너뛰고 ClickPipes 오류 테이블에 `SOURCE_SCHEMA_ERROR`가 기록됩니다.
- 메시지가 스키마를 준수하지 않으면, 메시지는 건너뛰고 ClickPipes 오류 테이블에 `DATA_PARSING_ERROR`가 기록됩니다.

## 스키마 매핑 \{#schema-mapping\}

다음 규칙은 가져온 Avro 스키마와 ClickHouse 대상 테이블 간 매핑에 적용됩니다.

- Avro 스키마에 ClickHouse 대상 매핑에 포함되지 않은 필드가 있는 경우, 해당 필드는 무시됩니다.
- Avro 스키마에 ClickHouse 대상 매핑에 정의된 필드가 누락된 경우, 해당 ClickHouse 컬럼은 0 또는 빈 문자열과 같은 0 값으로 채워집니다. 현재 ClickPipes INSERT에서는 DEFAULT 식이 평가되지 않는다는 점에 유의하십시오(이는 ClickHouse 서버의 기본값 처리 업데이트를 대기하는 임시 제한 사항입니다).
- Avro 스키마 필드와 ClickHouse 컬럼이 호환되지 않는 경우, 해당 행/메시지의 INSERT는 실패하며, 실패 내역은 ClickPipes 오류 테이블에 기록됩니다. 여러 암시적 변환(숫자 타입 간 변환 등)은 지원되지만, 모든 경우를 지원하는 것은 아닙니다(예: Avro 레코드 필드는 Int32 ClickHouse 컬럼에 INSERT할 수 없습니다).