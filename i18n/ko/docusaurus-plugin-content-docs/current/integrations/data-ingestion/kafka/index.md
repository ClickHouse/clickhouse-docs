---
'sidebar_label': 'Kafka와 ClickHouse 통합'
'sidebar_position': 1
'slug': '/integrations/kafka'
'description': 'ClickHouse와 함께하는 Kafka 소개'
'title': 'Kafka와 ClickHouse 통합'
'keywords':
- 'Apache Kafka'
- 'event streaming'
- 'data pipeline'
- 'message broker'
- 'real-time data'
'doc_type': 'guide'
'integration':
- 'support_level': 'core'
- 'category': 'data_ingestion'
---


# Kafka를 ClickHouse와 통합하기

[Apache Kafka](https://kafka.apache.org/)는 수천 개의 기업이 고성능 데이터 파이프라인, 스트리밍 분석, 데이터 통합 및 중요 애플리케이션을 위해 사용하는 오픈 소스 분산 이벤트 스트리밍 플랫폼입니다. ClickHouse는 Kafka 및 기타 Kafka API 호환 브로커(예: Redpanda, Amazon MSK)에서 **읽기** 및 **쓰기**를 위한 여러 가지 옵션을 제공합니다.

## 사용 가능한 옵션 {#available-options}

사용 사례에 적합한 올바른 옵션을 선택하는 것은 ClickHouse 배포 유형, 데이터 흐름 방향 및 운영 요구 사항을 포함한 여러 요인에 따라 달라집니다.

| 옵션                                                  | 배포 유형 | 완전 관리형  | Kafka에서 ClickHouse로 | ClickHouse에서 Kafka로 |
|-------------------------------------------------------|----------|:-----------:|:---------------------:|:---------------------:|
| [ClickPipes for Kafka](/integrations/clickpipes/kafka)                                | [Cloud], [BYOC] (곧 제공됩니다!) | ✅ | ✅ |   |
| [Kafka Connect Sink](./kafka-clickhouse-connect-sink.md) | [Cloud], [BYOC], [자체 호스팅] | | ✅ |   |
| [Kafka 테이블 엔진](./kafka-table-engine.md)           | [Cloud], [BYOC], [자체 호스팅] | | ✅ | ✅ |

이 옵션들 간의 보다 자세한 비교는 [옵션 선택하기](#choosing-an-option)를 참조하세요.

### ClickPipes for Kafka {#clickpipes-for-kafka}

[ClickPipes](../clickpipes/index.md)는 다양한 소스에서 데이터를 수집하는 것을 버튼 클릭 몇 번으로 간단하게 만드는 관리형 통합 플랫폼입니다. 전적으로 관리되고 생산 워크로드에 맞춰 설계되었기 때문에 ClickPipes는 인프라 및 운영 비용을 크게 낮추고, 외부 데이터 스트리밍 및 ETL 도구의 필요성을 제거합니다.

:::tip
ClickHouse Cloud 사용자라면 이 옵션을 권장합니다. ClickPipes는 **완전 관리형**이며 클라우드 환경에서 **최고의 성능**을 제공하도록 설계되었습니다.
:::

#### 주요 기능 {#clickpipes-for-kafka-main-features}

[//]: # "TODO Terraform 프로바이더의 정적 알파 릴리즈에 링크하는 것은 최적이 아닙니다. 가용성이 있을 때 Terraform 가이드에 링크하세요."

* ClickHouse Cloud에 최적화되어 매우 빠른 성능 제공
* 높은 처리량의 워크로드를 위한 수평 및 수직 확장성
* 구성 가능한 복제본 및 자동 재시도로 내장된 장애 내성
* ClickHouse Cloud UI, [Open API](/cloud/manage/api/api-overview), 또는 [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.3.3-alpha2/docs/resources/clickpipe)을 통한 배포 및 관리
* 클라우드 네이티브 권한 부여(IAM)와 사설 연결(PrivateLink)을 지원하는 엔터프라이즈급 보안
* Confluent Cloud, Amazon MSK, Redpanda Cloud 및 Azure Event Hubs를 포함한 광범위한 [데이터 소스](/integrations/clickpipes/kafka/reference/) 지원
* 가장 일반적인 직렬화 형식(JSON, Avro, Protobuf 곧 제공됨!) 지원

#### 시작하기 {#clickpipes-for-kafka-getting-started}

Kafka용 ClickPipes를 사용하려면 [참조 문서](/integrations/clickpipes/kafka/reference)를 참조하시거나 ClickHouse Cloud UI의 `Data Sources` 탭으로 이동하세요.

### Kafka Connect Sink {#kafka-connect-sink}

Kafka Connect는 Kafka와 다른 데이터 시스템 간의 간단한 데이터 통합을 위한 중앙 집중식 데이터 허브로 작동하는 오픈 소스 프레임워크입니다. [ClickHouse Kafka Connect Sink](https://github.com/ClickHouse/clickhouse-kafka-connect) 커넥터는 Apache Kafka 및 기타 Kafka API 호환 브로커에서 데이터를 읽기 위한 확장 가능하고 구성 가능한 옵션을 제공합니다.

:::tip
**높은 구성 가능성**을 선호하거나 이미 Kafka Connect 사용자인 경우 이 옵션을 권장합니다.
:::

#### 주요 기능 {#kafka-connect-sink-main-features}

* 정확히 한 번의 의미론을 지원하도록 구성할 수 있음
* 가장 일반적인 직렬화 형식(JSON, Avro, Protobuf) 지원
* ClickHouse Cloud에 대해 지속적으로 테스트됨

#### 시작하기 {#kafka-connect-sink-getting-started}

ClickHouse Kafka Connect Sink를 사용하려면 [참조 문서](./kafka-clickhouse-connect-sink.md)를 참조하세요.

### Kafka 테이블 엔진 {#kafka-table-engine}

[Kafka 테이블 엔진](./kafka-table-engine.md)은 Apache Kafka 및 기타 Kafka API 호환 브로커에서 데이터를 읽고 쓸 때 사용할 수 있습니다. 이 옵션은 오픈 소스 ClickHouse에 함께 제공되며 모든 배포 유형에서 사용할 수 있습니다.

:::tip
ClickHouse를 자체 호스팅하고 **진입 장벽이 낮은** 옵션이 필요하거나 Kafka에 **쓰기**를 해야 하는 경우 이 옵션을 권장합니다.
:::

#### 주요 기능 {#kafka-table-engine-main-features}

* 데이터를 [읽고](./kafka-table-engine.md/#kafka-to-clickhouse) [쓸 수 있음](./kafka-table-engine.md/#clickhouse-to-kafka)
* 오픈 소스 ClickHouse와 함께 제공됨
* 가장 일반적인 직렬화 형식(JSON, Avro, Protobuf) 지원

#### 시작하기 {#kafka-table-engine-getting-started}

Kafka 테이블 엔진을 사용하려면 [참조 문서](./kafka-table-engine.md)를 참조하세요.

### 옵션 선택하기 {#choosing-an-option}

| 제품 | 강점 | 약점 |
|------|------|------|
| **ClickPipes for Kafka** | • 높은 처리량과 낮은 지연을 위한 확장 가능한 아키텍처<br/>• 내장 모니터링 및 스키마 관리<br/>• 사설 네트워킹 연결(PrivateLink 이용)<br/>• SSL/TLS 인증 및 IAM 권한 부여 지원<br/>• 프로그래밍적 구성(Terraform, API 엔드포인트) 지원 | • Kafka로 데이터를 푸시할 수 없음<br/>• 적어도 한 번의 의미론 |
| **Kafka Connect Sink** | • 정확히 한 번의 의미론<br/>• 데이터 변환, 배치 및 오류 처리를 세밀하게 제어할 수 있음<br/>• 사설 네트워크에 배포 가능<br/>• 아직 ClickPipes에서 지원되지 않는 데이터베이스의 실시간 복제 지원(Debezium 통해) | • Kafka로 데이터를 푸시할 수 없음<br/>• 설정 및 유지 관리가 operationally 복잡함<br/>• Kafka 및 Kafka Connect에 대한 전문 지식 필요 |
| **Kafka 테이블 엔진** | • [Kafka로 데이터 푸시 지원](./kafka-table-engine.md/#clickhouse-to-kafka)<br/>• 설정이 operationally 간단함 | • 적어도 한 번의 의미론<br/>• 소비자에 대한 제한된 수평 확장. ClickHouse 서버와 독립적으로 확장할 수 없음<br/>• 제한된 오류 처리 및 디버깅 옵션<br/>• Kafka 전문 지식 요구 |

### 기타 옵션 {#other-options}

* [**Confluent Cloud**](./confluent/index.md) - Confluent Platform은 ClickHouse Connector Sink를 [Confluent Cloud에 업로드하고 실행](./confluent/custom-connector.md)하거나 HTTP 또는 HTTPS를 통해 API와 Apache Kafka를 통합하는 [HTTP Sink Connector for Confluent Platform](./confluent/kafka-connect-http.md)을 사용할 수 있는 옵션을 제공합니다.

* [**Vector**](./kafka-vector.md) - Vector는 공급업체 독립적인 데이터 파이프라인입니다. Kafka에서 읽고 ClickHouse로 이벤트를 전송할 수 있는 기능을 가지고 있어 안정적인 통합 옵션을 제공합니다.

* [**JDBC Connect Sink**](./kafka-connect-jdbc.md) - Kafka Connect JDBC Sink 커넥터를 사용하면 Kafka 주제에서 JDBC 드라이버가 있는 모든 관계형 데이터베이스로 데이터를 내보낼 수 있습니다.

* **커스텀 코드** - Kafka 및 ClickHouse [클라이언트 라이브러리](../../language-clients/index.md)를 사용하는 커스텀 코드는 이벤트의 맞춤형 처리가 필요한 경우에 적합할 수 있습니다.

[BYOC]: /cloud/reference/byoc/overview
[Cloud]: /cloud/get-started
[Self-hosted]: ../../../intro.md
