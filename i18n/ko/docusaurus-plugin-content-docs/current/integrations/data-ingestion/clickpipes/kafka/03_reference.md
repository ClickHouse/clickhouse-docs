---
sidebar_label: '레퍼런스'
description: 'Kafka ClickPipes가 지원하는 형식, 데이터 소스, 전송 시맨틱, 인증 방식 및 실험적 기능에 대한 상세 정보'
slug: /integrations/clickpipes/kafka/reference
sidebar_position: 1
title: '레퍼런스'
doc_type: 'reference'
keywords: ['kafka 레퍼런스', 'clickpipes', '데이터 소스', 'avro', '가상 컬럼']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import Image from '@theme/IdealImage';
import ExperimentalBadge from '@site/src/theme/badges/ExperimentalBadge';


# 참고 \{#reference\}

## 지원되는 데이터 소스 \{#supported-data-sources\}

| 이름                 |Logo|유형| 상태           | 설명                                                                                                   |
|----------------------|----|----|----------------|--------------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Apache Kafka 로고" style={{width: '3rem', 'height': '3rem'}}/>|스트리밍| 안정           | ClickPipes를 구성해 Apache Kafka에서 ClickHouse Cloud로 스트리밍 데이터를 수집합니다.                 |
| Confluent Cloud      |<Confluentsvg class="image" alt="Confluent Cloud 로고" style={{width: '3rem'}}/>|스트리밍| 안정           | 직접 통합을 통해 Confluent와 ClickHouse Cloud의 결합된 성능을 활용합니다.                             |
| Redpanda             |<Image img={redpanda_logo} size="logo" alt="Redpanda 로고"/>|스트리밍| 안정           | ClickPipes를 구성해 Redpanda에서 ClickHouse Cloud로 스트리밍 데이터를 수집합니다.                     |
| AWS MSK              |<Msksvg class="image" alt="AWS MSK 로고" style={{width: '3rem', 'height': '3rem'}}/>|스트리밍| 안정           | ClickPipes를 구성해 AWS MSK에서 ClickHouse Cloud로 스트리밍 데이터를 수집합니다.                      |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Azure Event Hubs 로고" style={{width: '3rem'}}/>|스트리밍| 안정           | ClickPipes를 구성해 Azure Event Hubs에서 ClickHouse Cloud로 스트리밍 데이터를 수집합니다.             |
| WarpStream           |<Warpstreamsvg class="image" alt="WarpStream 로고" style={{width: '3rem'}}/>|스트리밍| 안정           | ClickPipes를 구성해 WarpStream에서 ClickHouse Cloud로 스트리밍 데이터를 수집합니다.                   |

## 지원되는 데이터 포맷 \{#supported-data-formats\}

지원되는 데이터 포맷은 다음과 같습니다:

- [JSON](/integrations/data-formats/json/overview)
- [AvroConfluent](/interfaces/formats/AvroConfluent)

## 지원되는 데이터 유형 \{#supported-data-types\}

### 표준 \{#standard-types-support\}

다음과 같은 표준 ClickHouse 데이터 타입이 현재 ClickPipes에서 지원됩니다:

- 기본 숫자 타입 - \[U\]Int8/16/32/64, Float32/64, 그리고 BFloat16
- 대정수 타입 - \[U\]Int128/256
- Decimal 타입
- Boolean
- String
- FixedString
- Date, Date32
- DateTime, DateTime64 (UTC 시간대만)
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- 모든 ClickHouse LowCardinality 타입
- 위의 타입(널 허용 포함)을 키와 값으로 사용하는 Map 타입
- 위의 타입(널 허용 포함)을 요소로 사용하는 Tuple 및 Array (깊이 1단계만)
- SimpleAggregateFunction 타입 (AggregatingMergeTree 또는 SummingMergeTree를 대상으로 하는 경우)

### Avro \{#avro\}

#### 지원되는 Avro 데이터 타입 \{#supported-avro-data-types\}

ClickPipes는 모든 Avro Primitive 및 Complex 타입과, `time-millis`, `time-micros`, `local-timestamp-millis`, `local_timestamp-micros`, `duration`을 제외한 모든 Avro Logical 타입을 지원합니다. Avro `record` 타입은 Tuple로, `array` 타입은 Array로, `map` 타입은 Map으로 변환됩니다(키는 문자열만 지원). 일반적으로 [여기](/interfaces/formats/Avro#data-type-mapping)에 나열된 변환을 사용할 수 있습니다. ClickPipes는 타입 변환 시 오버플로 또는 정밀도 손실을 검사하지 않으므로, Avro 숫자 타입에 대해서는 가능한 한 정확히 일치하는 타입을 매핑하여 사용할 것을 권장합니다.
또는, 모든 Avro 타입을 `String` 컬럼에 삽입할 수 있으며, 이 경우 유효한 JSON 문자열로 표현됩니다.

#### Nullable types and Avro unions \{#nullable-types-and-avro-unions\}

Avro에서 널 허용(Nullable) 타입은 기본 Avro 타입 T에 대해 `(T, null)` 또는 `(null, T)` 형태의 Union 스키마를 사용하여 정의합니다. 스키마 추론(schema inference) 시 이러한 Union은 ClickHouse의 「Nullable」 컬럼으로 매핑됩니다. 단, ClickHouse는
`Nullable(Array)`, `Nullable(Map)`, `Nullable(Tuple)` 타입을 지원하지 않습니다. 이러한 타입에 대한 Avro null Union은 널 비허용(non-nullable) 버전으로 매핑됩니다(Avro Record 타입은 ClickHouse의 이름이 지정된 Tuple로 매핑됨). 이들 타입에 대한 Avro "null" 값은 다음과 같이 삽입됩니다:

- null Avro array의 경우 빈 Array
- null Avro Map의 경우 빈 Map
- null Avro Record의 경우 모든 값이 기본값/0인 이름이 지정된 Tuple

#### Variant 타입 지원 \{#variant-type-support\}

ClickPipes는 다음과 같은 경우 Variant 타입을 지원합니다:

- Avro Union. Avro 스키마에 여러 개의 null이 아닌 타입으로 구성된 union이 포함되어 있는 경우, ClickPipes가
  적절한 Variant 타입을 추론합니다. 이 경우를 제외하면 Avro 데이터에는 Variant 타입이 지원되지 않습니다.
- JSON 필드. 소스 데이터 스트림의 모든 JSON 필드에 대해 수동으로 Variant 타입(예: `Variant(String, Int64, DateTime)`)을 지정할 수 있습니다.
  복잡한 하위 타입(배열/맵/튜플)은 지원되지 않습니다. 또한 ClickPipes가 올바른 Variant 하위 타입을 결정하는 방식 때문에,
  Variant 정의 내에서는 정수형 또는 datetime 타입을 각각 하나만 사용할 수 있습니다. 예를 들어 `Variant(Int64, UInt32)`는 지원되지 않습니다.

#### JSON 타입 지원 \{#json-type-support\}

ClickPipes에서는 다음과 같은 경우 JSON 타입을 지원합니다.

- Avro Record 타입은 항상 JSON 컬럼에 지정할 수 있습니다.
- Avro String 및 Bytes 타입은 해당 컬럼이 실제로 JSON String 객체를 포함하는 경우 JSON 컬럼에 지정할 수 있습니다.
- 항상 JSON 객체인 JSON 필드는 JSON 대상 컬럼에 지정할 수 있습니다.

대상 컬럼은 고정 또는 건너뛴 경로를 포함하여, 원하는 JSON 타입으로 수동으로 변경해야 합니다.

## Kafka 가상 컬럼 \{#kafka-virtual-columns\}

다음 가상 컬럼이 Kafka 호환 스트리밍 데이터 소스에서 지원됩니다. 새 대상 테이블을 생성할 때 `Add Column` 버튼을 사용하여 가상 컬럼을 추가할 수 있습니다.

| Name             | Description                                           | Recommended Data Type  |
|------------------|-------------------------------------------------------|------------------------|
| `_key`           | Kafka 메시지 키                                       | `String`               |
| `_timestamp`     | Kafka 타임스탬프 (밀리초 단위 정밀도)                | `DateTime64(3)`        |
| `_partition`     | Kafka 파티션                                          | `Int32`                |
| `_offset`        | Kafka 오프셋                                          | `Int64`                |
| `_topic`         | Kafka 토픽                                            | `String`               |
| `_header_keys`   | 레코드 헤더(Headers)에 포함된 키의 병렬 배열         | `Array(String)`        |
| `_header_values` | 레코드 헤더(Headers)에 포함된 헤더 값의 병렬 배열    | `Array(String)`        |
| `_raw_message`   | 전체 Kafka 메시지                                     | `String`               |

`_raw_message` 컬럼은 JSON 데이터에만 사용하는 것을 권장합니다.  
JSON 문자열만 필요한 사용 사례(예: ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 함수를 사용하여
다운스트림 materialized view를 채우는 경우)에서는, 모든 "비-가상(non-virtual)" 컬럼을 삭제하는 것이 ClickPipes 성능 향상에 도움이 될 수 있습니다.