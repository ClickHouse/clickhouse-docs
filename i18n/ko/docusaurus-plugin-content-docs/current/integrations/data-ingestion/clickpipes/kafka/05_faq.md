---
'sidebar_label': 'FAQ'
'description': 'Kafka에 대한 ClickPipes의 자주 묻는 질문'
'slug': '/integrations/clickpipes/kafka/faq'
'sidebar_position': 1
'title': 'Kafka ClickPipes FAQ'
'doc_type': 'guide'
'keywords':
- 'kafka faq'
- 'clickpipes'
- 'upstash'
- 'azure event hubs'
- 'private link'
---

## Kafka ClickPipes FAQ {#faq}

### General {#general}

<details>

<summary>ClickPipes for Kafka는 어떻게 작동하나요?</summary>

ClickPipes는 Kafka Consumer API를 실행하는 전용 아키텍처를 사용하여 지정된 주제에서 데이터를 읽고, 그 데이터를 특정 ClickHouse 클라우드 서비스의 ClickHouse 테이블에 삽입합니다.
</details>

<details>

<summary>ClickPipes와 ClickHouse Kafka 테이블 엔진의 차이는 무엇인가요?</summary>

Kafka 테이블 엔진은 ClickHouse 서버가 Kafka에 연결하여 이벤트를 가져온 후 로컬에 기록하는 "풀 모델"을 구현하는 ClickHouse의 핵심 기능입니다.

ClickPipes는 ClickHouse 서비스와 독립적으로 실행되는 별도의 클라우드 서비스입니다. Kafka(또는 다른 데이터 소스)에 연결하고, 이벤트를 연결된 ClickHouse 클라우드 서비스로 전송합니다. 이러한 분리된 아키텍처는 운영 유연성, 문제의 명확한 분리, 확장 가능한 데이터 수집, 우아한 실패 관리, 확장성 등을 제공합니다.
</details>

<details>

<summary>ClickPipes for Kafka 사용에 대한 요구 사항은 무엇인가요?</summary>

ClickPipes for Kafka를 사용하기 위해서는 실행 중인 Kafka 브로커와 ClickPipes가 활성화된 ClickHouse 클라우드 서비스가 필요합니다. 또한 ClickHouse Cloud가 Kafka 브로커에 접근할 수 있도록 해야 합니다. 이는 Kafka 측에서 원격 연결을 허용하고, Kafka 설정에서 [ClickHouse Cloud Egress IP 주소](/manage/data-sources/cloud-endpoints-api)를 화이트리스트에 추가하여 달성할 수 있습니다. 또는 [AWS PrivateLink](/integrations/clickpipes/aws-privatelink)를 사용하여 ClickPipes for Kafka를 Kafka 브로커에 연결할 수 있습니다.
</details>

<details>

<summary>ClickPipes for Kafka는 AWS PrivateLink를 지원하나요?</summary>

AWS PrivateLink가 지원됩니다. 설정 방법에 대한 자세한 내용은 [문서](/integrations/clickpipes/aws-privatelink)를 참조하세요.
</details>

<details>

<summary>ClickPipes for Kafka를 사용하여 Kafka 주제에 데이터를 쓸 수 있나요?</summary>

아니요, ClickPipes for Kafka는 Kafka 주제로부터 데이터를 읽도록 설계되었으며, Kafka 주제에 데이터를 쓰는 용도가 아닙니다. Kafka 주제에 데이터를 쓰려면 전용 Kafka 프로듀서를 사용해야 합니다.
</details>

<details>

<summary>ClickPipes는 여러 브로커를 지원하나요?</summary>

네, 브로커가 동일한 쿼럼의 일부인 경우, `,`로 구분하여 함께 구성할 수 있습니다.
</details>

<details>

<summary>ClickPipes 복제본을 확장할 수 있나요?</summary>

네, ClickPipes for 스트리밍은 수평 및 수직으로 확장할 수 있습니다. 수평 확장은 처리량을 늘리기 위해 더 많은 복제본을 추가하고, 수직 확장은 더 집중적인 워크로드를 처리하기 위해 각 복제본에 할당된 리소스(CPU 및 RAM)를 증가시킵니다. 이는 ClickPipe 생성 중 또는 **설정** -> **고급 설정** -> **확장**에서 다른 시점에 구성할 수 있습니다.
</details>

### Azure Event Hubs {#azure-eventhubs}

<details>

<summary>Azure Event Hubs ClickPipe는 Kafka 인터페이스 없이 작동하나요?</summary>

아니요. ClickPipes는 Event Hubs 네임스페이스에 Kafka 인터페이스가 활성화되어 있어야 합니다. 이는 **basic** 이상의 계층에서만 가능합니다. 자세한 내용은 [Azure Event Hubs 문서](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-quickstart-kafka-enabled-event-hubs?tabs=passwordless#create-an-azure-event-hubs-namespace)를 참조하세요.
</details>

<details>

<summary>Azure 스키마 레지스트리가 ClickPipes와 작동하나요?</summary>

아니요. ClickPipes는 Confluent 스키마 레지스트리와 API 호환 되는 스키마 레지스트리만 지원하며, 이는 Azure 스키마 레지스트리와는 다릅니다. 이 스키마 레지스트리에 대한 지원이 필요하다면, [우리 팀에 연락하세요](https://clickhouse.com/company/contact?loc=clickpipes).
</details>

<details>

<summary>Azure Event Hubs에서 소비하기 위해 내 정책에 어떤 권한이 필요하나요?</summary>

주제를 나열하고 이벤트를 소비하려면, ClickPipes에 부여된 공유 액세스 정책이 최소한 'Listen' 클레임을 요구합니다.
</details>

<details>

<summary>내 Event Hubs에서 데이터가 반환되지 않는 이유는 무엇인가요?</summary>

ClickHouse 인스턴스가 Event Hubs 배포와 다른 지역 또는 대륙에 있는 경우, ClickPipes를 온보딩할 때 타임아웃이 발생할 수 있으며, Event Hub에서 데이터를 소비할 때 더 높은 대기 시간이 발생할 수 있습니다. 성능 오버헤드를 피하기 위해 ClickHouse Cloud와 Azure Event Hubs를 동일한 클라우드 지역 또는 가까운 지역에 배포하는 것을 권장합니다.
</details>

<details>

<summary>Azure Event Hubs에 포트 번호를 포함해야 하나요?</summary>

네. ClickPipes는 Kafka 인터페이스에 대한 포트 번호를 `:9093`으로 포함할 것으로 기대합니다.
</details>

<details>

<summary>ClickPipes IP는 Azure Event Hubs에 여전히 중요한가요?</summary>

네. Event Hubs 인스턴스에 대한 트래픽을 제한하려면 [문서화된 정적 NAT IPs](../index.md#list-of-static-ips)를 추가해 주세요.
</details>

<details>

<summary>Event Hub에 대한 연결 문자열인가요, 아니면 Event Hub 네임스페이스에 대한 것인가요?</summary>

둘 다 작동합니다. 여러 Event Hubs에서 샘플을 검색하려면 **네임스페이스 수준**에서 공유 액세스 정책을 사용하는 것을 강력히 권장합니다.
</details>
