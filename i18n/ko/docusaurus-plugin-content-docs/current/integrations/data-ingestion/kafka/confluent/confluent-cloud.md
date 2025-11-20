---
'sidebar_label': 'Confluent Cloud의 Kafka Connector Sink'
'sidebar_position': 2
'slug': '/integrations/kafka/cloud/confluent/sink-connector'
'description': 'Confluent Cloud에서 완전 관리되는 ClickHouse Connector Sink를 사용하는 가이드'
'title': 'Confluent Cloud와 ClickHouse 통합'
'keywords':
- 'Kafka'
- 'Confluent Cloud'
'doc_type': 'guide'
'integration':
- 'support_level': 'core'
- 'category': 'data_ingestion'
- 'website': 'https://clickhouse.com/cloud/clickpipes'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';


# Confluent Cloud와 ClickHouse 통합하기

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/SQAiPVbd3gg"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

## 전제 조건 {#prerequisites}
다음에 익숙하다고 가정합니다:
* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
* Confluent Cloud

## Confluent Cloud와 ClickHouse의 공식 Kafka 커넥터 {#the-official-kafka-connector-from-clickhouse-with-confluent-cloud}

#### 주제 생성하기 {#create-a-topic}
Confluent Cloud에서 주제를 생성하는 것은 매우 간단하며, 자세한 지침은 [여기](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html)에 있습니다.

#### 중요한 사항 {#important-notes}

* Kafka 주제 이름은 ClickHouse 테이블 이름과 동일해야 합니다. 이를 조정하는 방법은 변환기를 사용하는 것입니다 (예: [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html)).
* 더 많은 파티션이 항상 더 나은 성능을 의미하는 것은 아닙니다 - 자세한 내용과 성능 팁은 곧 발표될 가이드를 참고하세요.

#### 연결 세부정보 수집하기 {#gather-your-connection-details}
<ConnectionDetails />

#### 커넥터 설치하기 {#install-connector}
Confluent Cloud에서 [공식 문서](https://docs.confluent.io/cloud/current/connectors/cc-clickhouse-sink-connector/cc-clickhouse-sink.html)에 따라 완전 관리되는 ClickHouse Sink Connector를 설치하세요.

#### 커넥터 구성하기 {#configure-the-connector}
ClickHouse Sink Connector를 구성하는 동안 다음 세부정보를 제공해야 합니다:
- ClickHouse 서버의 호스트 이름
- ClickHouse 서버의 포트 (기본값은 8443)
- ClickHouse 서버의 사용자 이름 및 비밀번호
- 데이터가 기록될 ClickHouse의 데이터베이스 이름
- ClickHouse에 데이터를 쓰기 위해 사용할 Kafka의 주제 이름

Confluent Cloud UI는 성능 최적화를 위한 폴 간격, 배치 크기 및 기타 매개변수를 조정할 수 있는 고급 구성 옵션을 지원합니다.

#### 알려진 제한 사항 {#known-limitations}
* [공식 문서](https://docs.confluent.io/cloud/current/connectors/cc-clickhouse-sink-connector/cc-clickhouse-sink.html#limitations)에서 커넥터 제한 사항 목록을 확인하세요.
