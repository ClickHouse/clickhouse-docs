---


sidebar_label: 'Kafka와 ClickHouse 통합'
sidebar_position: 1
slug: /integrations/kafka
description: 'Kafka와 ClickHouse 통합 소개'
title: 'Kafka와 ClickHouse 통합'
keywords: ['Apache Kafka', '이벤트 스트리밍', '데이터 파이프라인', '메시지 브로커', '실시간 데이터']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

# Kafka를 ClickHouse와 통합하기 \{#integrating-kafka-with-clickhouse\}

[Apache Kafka](https://kafka.apache.org/)는 고성능 데이터 파이프라인, 스트리밍 분석, 데이터 통합, 미션 크리티컬 애플리케이션을 위해 수천 개의 기업에서 사용하는 오픈 소스 분산 이벤트 스트리밍 플랫폼입니다. ClickHouse는 Kafka 및 Redpanda, Amazon MSK와 같은 Kafka API와 호환되는 브로커와 간에 데이터를 **읽고** **쓸 수 있는** 여러 가지 옵션을 제공합니다.

## 사용 가능한 옵션 \{#available-options\}

사용 사례에 가장 적합한 옵션을 선택하려면 ClickHouse 배포 유형, 데이터 흐름 방향, 운영 요구 사항 등 여러 요소를 고려해야 합니다.

| 옵션                                                  | 배포 유형 | 완전 관리형 | Kafka에서 ClickHouse로 | ClickHouse에서 Kafka로 |
|---------------------------------------------------------|------------|:-------------------:|:-------------------:|:------------------:|
| [ClickPipes for Kafka](/integrations/clickpipes/kafka)                                | [Cloud], [BYOC] (출시 예정)   | ✅ | ✅ |   |
| [Kafka Connect Sink](./kafka-clickhouse-connect-sink.md) | [Cloud], [BYOC], [Self-hosted] | | ✅ |   |
| [Kafka 테이블 엔진](./kafka-table-engine.md)           | [Cloud], [BYOC], [Self-hosted] | | ✅ | ✅ |

이들 옵션을 보다 자세히 비교하려면 [옵션 선택하기](#choosing-an-option)를 참조하십시오.

### ClickPipes for Kafka \{#clickpipes-for-kafka\}

[ClickPipes](../clickpipes/index.md)는 다양한 소스에서 들어오는 데이터를 몇 번의 클릭만으로 간단하게 수집할 수 있게 해 주는 관리형 통합 플랫폼입니다. 완전 관리형이며 프로덕션 워크로드를 위해 설계되었기 때문에 ClickPipes는 인프라 및 운영 비용을 크게 절감하고, 외부 데이터 스트리밍 및 ETL 도구를 별도로 사용할 필요를 제거합니다.

:::tip
ClickHouse Cloud를 사용하는 경우 이 옵션을 권장합니다. ClickPipes는 **완전 관리형**이며 Cloud 환경에서 **최상의 성능**을 제공하도록 특별히 설계되어 있습니다.
:::

#### 주요 기능 \{#clickpipes-for-kafka-main-features\}

[//]: # "TODO Terraform provider 알파 릴리스에 대한 정적 링크는 최적이 아닙니다. 사용 가능해지면 Terraform 가이드로 연결하십시오."

* ClickHouse Cloud에 최적화되어 초고속 성능을 제공합니다.
* 고처리량 워크로드를 위한 수평 및 수직 확장성을 제공합니다.
* 구성 가능한 레플리카 및 자동 재시도를 통한 내장된 장애 허용 기능
* ClickHouse Cloud UI, [Open API](/cloud/manage/api/api-overview), 또는 [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.3.3-alpha2/docs/resources/clickpipe)을 통한 배포 및 관리
* Cloud 네이티브 권한 부여(IAM) 및 프라이빗 연결(PrivateLink)을 지원하는 엔터프라이즈급 보안
* Confluent Cloud, Amazon MSK, Redpanda Cloud, Azure Event Hubs 등을 포함한 광범위한 [데이터 소스](/integrations/clickpipes/kafka/reference/) 지원
* JSON, Avro, Protobuf(지원 예정)를 포함한 대부분의 일반적인 직렬화 형식 지원

#### 시작하기 \{#clickpipes-for-kafka-getting-started\}

Kafka용 ClickPipes 사용을 시작하려면 [레퍼런스 문서](/integrations/clickpipes/kafka/reference)를 참조하거나 ClickHouse Cloud UI에서 `Data Sources` 탭으로 이동합니다.

### Kafka Connect Sink \{#kafka-connect-sink\}

Kafka Connect는 Kafka와 다른 데이터 시스템 간의 간단한 데이터 통합을 위해 중앙 집중식 데이터 허브로 동작하는 오픈소스 프레임워크입니다. [ClickHouse Kafka Connect Sink](https://github.com/ClickHouse/clickhouse-kafka-connect) 커넥터는 Apache Kafka 및 다른 Kafka API 호환 브로커에서 데이터를 읽기 위한 확장성과 고도의 구성 가능성을 제공하는 옵션입니다.

:::tip
**구성 자유도**가 높은 옵션을 선호하거나 이미 Kafka Connect를 사용 중인 경우 권장되는 방법입니다.
:::

#### 주요 기능 \{#kafka-connect-sink-main-features\}

* 정확히 한 번(exactly-once) 처리 의미론을 지원하도록 구성할 수 있습니다
* 가장 일반적인 직렬화 형식(JSON, Avro, Protobuf)을 지원합니다
* ClickHouse Cloud 환경을 대상으로 지속적으로 테스트하고 있습니다

#### 시작하기 \{#kafka-connect-sink-getting-started\}

ClickHouse Kafka Connect Sink 사용을 시작하려면 [참고 문서](./kafka-clickhouse-connect-sink.md)를 참조하십시오.

### Kafka 테이블 엔진 \{#kafka-table-engine\}

[Kafka table engine](./kafka-table-engine.md)은(는) Apache Kafka 및 기타 Kafka API 호환 브로커로부터 데이터를 읽고, 해당 브로커로 데이터를 쓸 때 사용할 수 있습니다. 이 옵션은 오픈 소스 ClickHouse에 기본 포함되어 있으며, 모든 배포 유형에서 사용할 수 있습니다.

:::tip
ClickHouse를 셀프 호스팅하면서 **진입 장벽이 낮은** 옵션이 필요하거나, Kafka로 데이터를 **쓰기** 위한 기능이 필요한 경우에 권장되는 옵션입니다.
:::

#### 주요 기능 \{#kafka-table-engine-main-features\}

* 데이터 [읽기](./kafka-table-engine.md/#kafka-to-clickhouse) 및 [쓰기](./kafka-table-engine.md/#clickhouse-to-kafka)에 사용할 수 있습니다.
* 오픈 소스 ClickHouse에 기본으로 포함되어 있습니다.
* 가장 일반적인 직렬화 형식(JSON, Avro, Protobuf)을 지원합니다.

#### 시작하기 \{#kafka-table-engine-getting-started\}

Kafka 테이블 엔진 사용을 시작하려면 [참고 문서](./kafka-table-engine.md)를 참조하십시오.

### 옵션 선택하기 \{#choosing-an-option\}

| Product | 강점 | 약점 |
|---------|-----------|------------|
| **ClickPipes for Kafka** | • 높은 처리량과 낮은 지연 시간을 위한 확장 가능한 아키텍처<br/>• 내장 모니터링 및 스키마 관리<br/>• PrivateLink를 통한 프라이빗 네트워크 연결<br/>• SSL/TLS 인증 및 IAM 인가 지원<br/>• Terraform, API endpoints를 통한 프로그래밍 방식 구성 지원 | • Kafka로 데이터를 푸시하는 기능 미지원<br/>• At-least-once 의미론(semantics) |
| **Kafka Connect Sink** | • Exactly-once 의미론(semantics)<br/>• 데이터 변환, 배치 처리 및 오류 처리에 대한 세밀한 제어 가능<br/>• 프라이빗 네트워크에 배포 가능<br/>• Debezium을 통해 아직 ClickPipes에서 지원하지 않는 데이터베이스에서의 실시간 복제 지원 | • Kafka로 데이터를 푸시하는 기능 미지원<br/>• 설정 및 유지 관리가 운영 측면에서 복잡함<br/>• Kafka 및 Kafka Connect 전문 지식 필요 |
| **Kafka table engine** | • [Kafka로 데이터 푸시](./kafka-table-engine.md/#clickhouse-to-kafka) 지원<br/>• 설정이 운영 측면에서 간단함 | • At-least-once 의미론(semantics)<br/>• 컨슈머에 대한 수평 확장에 제약이 있으며, ClickHouse 서버와 독립적으로 확장할 수 없음<br/>• 오류 처리 및 디버깅 옵션이 제한적임<br/>• Kafka 전문 지식 필요 |

### 기타 옵션 \{#other-options\}

* [**Confluent Cloud**](./confluent/index.md) - Confluent Platform은 [Confluent Cloud에서 ClickHouse Connector Sink를 업로드하고 실행](./confluent/custom-connector.md)하거나, HTTP 또는 HTTPS를 통해 Apache Kafka를 API와 통합하는 [HTTP Sink Connector for Confluent Platform](./confluent/kafka-connect-http.md)을 사용하는 옵션을 제공합니다.

* [**Vector**](./kafka-vector.md) - Vector는 특정 벤더에 종속되지 않는 데이터 파이프라인입니다. Kafka에서 데이터를 읽고 이벤트를 ClickHouse로 전송할 수 있으므로 강력한 통합 옵션이 됩니다.

* [**JDBC Connect Sink**](./kafka-connect-jdbc.md) - Kafka Connect JDBC Sink 커넥터를 사용하면 Kafka 토픽의 데이터를 JDBC 드라이버가 있는 임의의 관계형 데이터베이스로 내보낼 수 있습니다.

* **Custom code** - Kafka와 ClickHouse [client libraries](../../language-clients/index.md)를 사용하는 사용자 정의 코드는 이벤트에 대한 맞춤형 처리가 필요한 경우에 적합할 수 있습니다.

[BYOC]: /cloud/reference/byoc/overview

[Cloud]: /cloud/get-started

[Self-hosted]: ../../../intro.md