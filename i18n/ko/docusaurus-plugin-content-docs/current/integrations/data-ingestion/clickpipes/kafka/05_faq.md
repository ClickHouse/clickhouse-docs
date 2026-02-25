---
sidebar_label: 'FAQ'
description: 'Kafka용 ClickPipes에 대한 자주 묻는 질문'
slug: /integrations/clickpipes/kafka/faq
sidebar_position: 1
title: 'Kafka ClickPipes 자주 묻는 질문(FAQ)'
doc_type: 'guide'
keywords: ['kafka faq', 'clickpipes', 'upstash', 'azure event hubs', 'private link']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

## Kafka ClickPipes 자주 묻는 질문(FAQ) \{#faq\}

### 일반 \{#general\}

<details>

<summary>Kafka용 ClickPipes는 어떻게 작동합니까?</summary>

ClickPipes는 Kafka Consumer API를 실행하는 전용 아키텍처를 사용하여 지정된 토픽에서 데이터를 읽은 다음 해당 데이터를 특정 ClickHouse Cloud 서비스의 ClickHouse 테이블에 삽입합니다.
</details>

<details>

<summary>ClickPipes와 ClickHouse Kafka Table Engine의 차이점은 무엇입니까?</summary>

Kafka Table 엔진은 ClickHouse 서버 자체가 Kafka에 연결하여 이벤트를 가져온 후 로컬에 기록하는 「pull 모델」을 구현하는 ClickHouse의 핵심 기능입니다.

ClickPipes는 ClickHouse 서비스와 독립적으로 실행되는 별도의 클라우드 서비스입니다. 이 서비스는 Kafka(또는 다른 데이터 소스)에 연결하여 관련된 ClickHouse Cloud 서비스로 이벤트를 푸시합니다. 이러한 분리된(디커플드) 아키텍처는 우수한 운영 유연성, 명확한 책임 분리, 확장 가능한 수집, 원활한 장애 관리, 확장성 등을 가능하게 합니다.
</details>

<details>

<summary>Kafka용 ClickPipes를 사용하기 위한 요구 사항은 무엇입니까?</summary>

Kafka용 ClickPipes를 사용하려면 실행 중인 Kafka 브로커와 ClickPipes가 활성화된 ClickHouse Cloud 서비스가 필요합니다. 또한 ClickHouse Cloud가 Kafka 브로커에 접근할 수 있어야 합니다. 이를 위해 Kafka 측에서 원격 연결을 허용하고, Kafka 설정에서 [ClickHouse Cloud Egress IP 주소](/manage/data-sources/cloud-endpoints-api)를 화이트리스트에 추가하면 됩니다. 또는 [AWS PrivateLink](/integrations/clickpipes/aws-privatelink)를 사용하여 Kafka용 ClickPipes를 Kafka 브로커에 연결할 수 있습니다.
</details>

<details>

<summary>Kafka용 ClickPipes는 AWS PrivateLink를 지원합니까?</summary>

AWS PrivateLink가 지원됩니다. 설정 방법에 대해서는 [문서](/integrations/clickpipes/aws-privatelink)를 참조하십시오.
</details>

<details>

<summary>Kafka용 ClickPipes를 사용하여 Kafka 토픽에 데이터를 쓸 수 있습니까?</summary>

아니요, Kafka용 ClickPipes는 Kafka 토픽에서 데이터를 읽도록 설계되었으며, 여기에 데이터를 쓰기 위한 용도는 아닙니다. Kafka 토픽에 데이터를 쓰려면 전용 Kafka 프로듀서를 사용해야 합니다.
</details>

<details>

<summary>ClickPipes는 여러 브로커를 지원합니까?</summary>

예, 브로커가 동일한 쿼럼(quorum)의 일부라면 `,`로 구분하여 함께 구성할 수 있습니다.
</details>

<details>

<summary>ClickPipes 레플리카는 확장할 수 있습니까?</summary>

예, 스트리밍용 ClickPipes는 수평 및 수직 확장이 모두 가능합니다.
수평 확장은 처리량을 높이기 위해 레플리카를 더 추가하는 것이고, 수직 확장은 보다 집약적인 워크로드를 처리하기 위해 각 레플리카에 할당된 리소스(CPU 및 RAM)를 늘리는 것입니다.
이는 ClickPipe를 생성할 때 또는 이후 언제든지 **Settings** -> **Advanced Settings** -> **Scaling**에서 구성할 수 있습니다.
</details>

### Azure Event Hubs \{#azure-eventhubs\}

<details>

<summary>Azure Event Hubs ClickPipe는 Kafka surface 없이도 동작합니까?</summary>

아니요. ClickPipes를 사용하려면 Event Hubs 네임스페이스에서 Kafka surface 기능이 활성화되어 있어야 합니다. 이는 **basic** 이상의 티어에서만 사용할 수 있습니다. 자세한 내용은 [Azure Event Hubs 문서](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-quickstart-kafka-enabled-event-hubs?tabs=passwordless#create-an-azure-event-hubs-namespace)를 참고하십시오.
</details>

<details>

<summary>Azure Schema Registry는 ClickPipes와 함께 사용할 수 있습니까?</summary>

아니요. ClickPipes는 Confluent Schema Registry와 API 호환되는 스키마 레지스트리만 지원하며, Azure Schema Registry는 이에 해당하지 않습니다. 이 스키마 레지스트리에 대한 지원이 필요한 경우, [당사 팀에 문의](https://clickhouse.com/company/contact?loc=clickpipes)하십시오.
</details>

<details>

<summary>Azure Event Hubs에서 소비하기 위해 정책에 어떤 권한이 필요합니까?</summary>

토픽을 나열하고 이벤트를 가져오려면, ClickPipes에 부여되는 공유 액세스 정책에 최소한 'Listen' 클레임이 있어야 합니다.
</details>

<details>

<summary>이벤트 허브에서 데이터가 반환되지 않는 이유는 무엇입니까?</summary>

ClickHouse 인스턴스가 Event Hubs 배포가 위치한 곳과 다른 지역 또는 대륙에 있는 경우, ClickPipes를 온보딩하는 동안 타임아웃이 발생하거나 Event Hub에서 데이터를 가져올 때 지연 시간이 증가할 수 있습니다. 성능 오버헤드를 피하기 위해, ClickHouse Cloud와 Azure Event Hubs를 동일한 클라우드 지역 또는 서로 가까운 지역에 배포할 것을 권장합니다.
</details>

<details>

<summary>Azure Event Hubs에 포트 번호를 포함해야 합니까?</summary>

예. ClickPipes는 Kafka surface에 대한 포트 번호가 포함되어 있다고 가정하며, 이는 `:9093`이어야 합니다.
</details>

<details>

<summary>ClickPipes IP는 Azure Event Hubs에서도 여전히 유효합니까?</summary>

예. Event Hubs 인스턴스로의 트래픽을 제한하려면, [문서화된 정적 NAT IP](../
/index.md#list-of-static-ips)를 구성에 추가하십시오.

</details>

<details>
<summary>연결 문자열은 Event Hub용 입니까, 아니면 Event Hub 네임스페이스용 입니까?</summary>

둘 다 사용할 수 있습니다. 여러 Event Hubs에서 샘플을 가져오기 위해 **네임스페이스 수준**의 공유 액세스 정책을 사용하는 것을 강력히 권장합니다.
</details>