---
sidebar_label: 'Confluent Cloud에서 Kafka Connector Sink 사용'
sidebar_position: 2
slug: /integrations/kafka/cloud/confluent/sink-connector
description: 'Confluent Cloud에서 완전 관리형 ClickHouse Connector Sink를 사용하는 방법 안내'
title: 'Confluent Cloud와 ClickHouse 통합'
keywords: ['Kafka', 'Confluent Cloud']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
  - website: 'https://clickhouse.com/cloud/clickpipes'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';


# Confluent Cloud와 ClickHouse 통합 \{#integrating-confluent-cloud-with-clickhouse\}

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

## 사전 요구 사항 \{#prerequisites\}

다음 항목에 이미 익숙하다고 가정합니다.

* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
* Confluent Cloud

## ClickHouse 공식 Kafka 커넥터와 Confluent Cloud \{#the-official-kafka-connector-from-clickhouse-with-confluent-cloud\}

#### 토픽 생성 \{#create-a-topic\}

Confluent Cloud에서 토픽을 생성하는 것은 비교적 간단하며, 자세한 방법은 [여기](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html)에 안내되어 있습니다.

#### 중요 사항 \{#important-notes\}

* Kafka 토픽 이름은 ClickHouse 테이블 이름과 동일해야 합니다. 이를 조정하는 방법 중 하나는 transformer(예: [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html))를 사용하는 것입니다.
* 파티션 수가 많다고 해서 항상 더 나은 성능을 의미하는 것은 아닙니다. 자세한 내용과 성능 최적화 팁은 곧 제공될 가이드를 참고하십시오.

#### 연결 정보 수집 \{#gather-your-connection-details\}

<ConnectionDetails />

#### 커넥터 설치 \{#install-connector\}

[공식 문서](https://docs.confluent.io/cloud/current/connectors/cc-clickhouse-sink-connector/cc-clickhouse-sink.html)에 따라 Confluent Cloud에서 완전 관리형 ClickHouse Sink Connector를 설치합니다.

#### 커넥터 구성 \{#configure-the-connector\}

ClickHouse Sink Connector를 구성할 때 다음과 같은 세부 정보를 제공해야 합니다:

- ClickHouse 서버의 호스트 이름(hostname)
- ClickHouse 서버의 포트(port) (기본값은 8443)
- ClickHouse 서버의 사용자 이름(username)과 비밀번호(password)
- 데이터가 기록될 ClickHouse 데이터베이스(database) 이름
- ClickHouse로 데이터를 쓰는 데 사용될 Kafka 토픽(topic) 이름

Confluent Cloud UI에서는 폴링 간격, 배치 크기 및 기타 파라미터를 조정하여 성능을 최적화할 수 있는 고급 구성 옵션을 지원합니다.

:::note  
Confluent Cloud에서 [fetch settings](/integrations/kafka/clickhouse-kafka-connect-sink/#fetch-settings) 및 [poll settings](/integrations/kafka/clickhouse-kafka-connect-sink/#poll-settings)와 같은 일부 설정을 조정하려면 Confluent Cloud를 통해 지원 케이스(Support case)를 생성해야 합니다.
:::  

#### 알려진 제한 사항 \{#known-limitations\}

* [공식 문서의 커넥터 제한 사항 목록](https://docs.confluent.io/cloud/current/connectors/cc-clickhouse-sink-connector/cc-clickhouse-sink.html#limitations)을 참조하십시오.