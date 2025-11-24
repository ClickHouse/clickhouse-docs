---
'sidebar_label': '참조'
'description': 'Kafka ClickPipes가 지원하는 형식, 소스, 전달 의미, 인증 및 실험적 기능에 대한 세부 정보'
'slug': '/integrations/clickpipes/kafka/reference'
'sidebar_position': 1
'title': '참조'
'doc_type': 'reference'
'keywords':
- 'kafka reference'
- 'clickpipes'
- 'data sources'
- 'avro'
- 'virtual columns'
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import Image from '@theme/IdealImage';
import ExperimentalBadge from '@site/src/theme/badges/ExperimentalBadge';


# Reference

## Supported data sources {#supported-data-sources}

| Name                 |Logo|Type| Status          | Description                                                                                          |
|----------------------|----|----|-----------------|------------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>|Streaming| Stable          | ClickPipes를 구성하고 Apache Kafka에서 ClickHouse Cloud로 스트리밍 데이터를 수집하기 시작하십시오.    |
| Confluent Cloud      |<Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>|Streaming| Stable          | 직접 통합을 통해 Confluent와 ClickHouse Cloud의 결합된 힘을 활용하십시오.                             |
| Redpanda             |<Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>|Streaming| Stable          | ClickPipes를 구성하고 Redpanda에서 ClickHouse Cloud로 스트리밍 데이터를 수집하기 시작하십시오.        |
| AWS MSK              |<Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>|Streaming| Stable          | ClickPipes를 구성하고 AWS MSK에서 ClickHouse Cloud로 스트리밍 데이터를 수집하기 시작하십시오.         |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>|Streaming| Stable          | ClickPipes를 구성하고 Azure Event Hubs에서 ClickHouse Cloud로 스트리밍 데이터를 수집하기 시작하십시오.|
| WarpStream           |<Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>|Streaming| Stable          | ClickPipes를 구성하고 WarpStream에서 ClickHouse Cloud로 스트리밍 데이터를 수집하기 시작하십시오.      |

## Supported data formats {#supported-data-formats}

지원되는 포맷은 다음과 같습니다:
- [JSON](/integrations/data-formats/json/overview)
- [AvroConfluent](/interfaces/formats/AvroConfluent)

## Supported data types {#supported-data-types}

### Standard {#standard-types-support}

현재 ClickPipes에서 지원되는 표준 ClickHouse 데이터 유형은 다음과 같습니다:

- 기본 숫자 유형 - \[U\]Int8/16/32/64, Float32/64, BFloat16
- 큰 정수 유형 - \[U\]Int128/256
- 소수 유형
- 불리언
- 문자열
- 고정 문자열
- 날짜, Date32
- 날짜시간, DateTime64 (UTC 시간대만 해당)
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- 모든 ClickHouse LowCardinality 유형
- 위의 모든 유형(Nullable 포함)을 사용하는 키와 값이 있는 맵
- 위의 모든 유형(Nullable 포함) 요소를 사용하는 튜플과 배열(한 수준 깊이만 해당)
- SimpleAggregateFunction 유형(AggregatingMergeTree 또는 SummingMergeTree 대상으로)

### Avro {#avro}

#### Supported Avro Data Types {#supported-avro-data-types}
ClickPipes는 모든 Avro 원시 및 복합 타입과 `time-millis`, `time-micros`, `local-timestamp-millis`, `local_timestamp-micros`, `duration`을 제외한 모든 Avro 논리 타입을 지원합니다. Avro `record` 유형은 튜플로 변환되며, `array` 유형은 배열로, `map`은 맵(문자열 키만 해당)으로 변환됩니다. 일반적으로 [여기]( /interfaces/formats/Avro#data-type-mapping) 나열된 변환이 가능합니다. ClickPipes는 유형 변환 시 오버플로우나 정밀도 손실을 확인하지 않으므로 Avro 숫자 유형에 대해 정확한 유형 일치를 사용하는 것이 좋습니다. 그렇지 않으면 모든 Avro 유형은 `String` 컬럼에 삽입할 수 있으며, 이 경우 유효한 JSON 문자열로 표시됩니다.

#### Nullable types and Avro unions {#nullable-types-and-avro-unions}
Avro의 Nullable 유형은 `(T, null)` 또는 `(null, T)`의 유니온 스키마를 사용하여 정의되며, 여기서 T는 기본 Avro 유형입니다. 스키마 추론 중 이러한 유니온은 ClickHouse "Nullable" 컬럼에 매핑됩니다. ClickHouse는 `Nullable(Array)`, `Nullable(Map)`, 또는 `Nullable(Tuple)` 유형을 지원하지 않습니다. 이러한 유형의 Avro null 유니온은 비-Nullable 버전으로 매핑됩니다(Avro Record 유형은 ClickHouse의 명명된 튜플로 매핑됨). 이러한 유형의 Avro "null"은 다음과 같이 삽입됩니다:
- null Avro 배열에 대한 빈 배열
- null Avro Map에 대한 빈 맵
- null Avro Record에 대한 모든 기본/제로 값을 가진 명명된 튜플

#### Variant type support {#variant-type-support}
ClickPipes는 다음과 같은 경우에 Variant 유형을 지원합니다:
- Avro 유니온. Avro 스키마에 여러 비-null 유형이 포함된 유니온이 있는 경우 ClickPipes는 적절한 Variant 유형을 추론합니다. Avro 데이터에 대해서는 다른 방식으로 Variant 유형이 지원되지 않습니다.
- JSON 필드. 소스 데이터 스트림의 JSON 필드에 대해 수동으로 Variant 유형(예: `Variant(String, Int64, DateTime)`)을 지정할 수 있습니다. ClickPipes가 올바른 Variant 하위 유형을 결정하는 방식 때문에, Variant 정의에는 하나의 정수 또는 날짜 시간 유형만 사용할 수 있습니다 - 예를 들어 `Variant(Int64, UInt32)`는 지원되지 않습니다.

#### JSON type support {#json-type-support}
ClickPipes는 다음과 같은 경우에 JSON 유형을 지원합니다:
- Avro Record 유형은 항상 JSON 컬럼에 할당할 수 있습니다.
- Avro String 및 Bytes 유형은 컬럼이 실제로 JSON String 객체를 보유하고 있는 경우 JSON 컬럼에 할당할 수 있습니다.
- 항상 JSON 객체인 JSON 필드는 JSON 대상 컬럼에 할당할 수 있습니다.

대상 컬럼을 원하는 JSON 유형으로 수동으로 변경해야 하며, 고정 경로 또는 스킵된 경로를 포함해야 합니다.

## Kafka virtual columns {#kafka-virtual-columns}

다음 가상 컬럼은 Kafka 호환 스트리밍 데이터 소스에 대해 지원됩니다. 새 대상 테이블을 생성할 때 `Add Column` 버튼을 사용하여 가상 변수를 추가할 수 있습니다.

| Name             | Description                                     | Recommended Data Type  |
|------------------|-------------------------------------------------|------------------------|
| `_key`           | Kafka 메시지 키                                | `String`               |
| `_timestamp`     | Kafka 타임스탬프 (밀리초 정밀도)               | `DateTime64(3)`        |
| `_partition`     | Kafka 파티션                                    | `Int32`                |
| `_offset`        | Kafka 오프셋                                    | `Int64`                |
| `_topic`         | Kafka 주제                                      | `String`               |
| `_header_keys`   | 레코드 헤더의 키에 대한 병렬 배열             | `Array(String)`        |
| `_header_values` | 레코드 헤더의 헤더에 대한 병렬 배열           | `Array(String)`        |
| `_raw_message`   | 전체 Kafka 메시지                               | `String`               |

`_raw_message` 컬럼은 JSON 데이터에 대해서만 권장됩니다. ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 함수 등을 사용하여 하류 물리화된 뷰를 채우는 경우 JSON 문자열만 필요하면 모든 "비-가상" 컬럼을 삭제하여 ClickPipes 성능을 개선할 수 있습니다.
