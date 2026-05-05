---
sidebar_label: 'Confluent Platform에서 Kafka Connector Sink 사용하기'
sidebar_position: 3
slug: /integrations/kafka/cloud/confluent/custom-connector
description: 'Kafka Connect 및 ClickHouse와 함께 ClickHouse Connector Sink를 사용하는 방법'
title: 'Confluent Cloud를 ClickHouse와 연동하기'
keywords: ['Confluent ClickHouse 연동', 'ClickHouse Kafka 커넥터', 'Kafka Connect ClickHouse Sink', 'Confluent Platform ClickHouse', 'Confluent 맞춤형 커넥터']
doc_type: 'guide'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import AddCustomConnectorPlugin from '@site/static/images/integrations/data-ingestion/kafka/confluent/AddCustomConnectorPlugin.png';


# Confluent Platform을 ClickHouse와 통합하기 \{#integrating-confluent-platform-with-clickhouse\}

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

## 사전 준비 사항 \{#prerequisites\}

다음 사항에 익숙하다고 가정합니다.

* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
* Confluent Platform 및 [Custom Connectors](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/overview.html)

## ClickHouse 공식 Kafka 커넥터(Confluent Platform용) \{#the-official-kafka-connector-from-clickhouse-with-confluent-platform\}

### Confluent Platform에 설치하기 \{#installing-on-confluent-platform\}

이 섹션은 Confluent Platform에서 ClickHouse Sink Connector를 빠르게 사용하기 시작할 수 있도록 작성된 간단한 가이드입니다.
자세한 내용은 [공식 Confluent 문서](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#uploading-and-launching-the-connector)를 참조하십시오.

#### 토픽 생성 \{#create-a-topic\}

Confluent Platform에서 토픽을 생성하는 것은 비교적 간단합니다. 자세한 내용은 [여기](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html)에서 확인할 수 있습니다.

#### 중요 사항 \{#important-notes\}

* Kafka 토픽 이름은 ClickHouse 테이블 이름과 동일해야 합니다. 이를 변경하려면 transformer(예: [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html))를 사용하면 됩니다.
* 파티션 수가 많다고 해서 항상 성능이 더 좋아지는 것은 아닙니다. 자세한 내용과 성능 팁은 곧 공개될 가이드를 참고하십시오.

#### 커넥터 설치 \{#install-connector\}

커넥터는 [repository](https://github.com/ClickHouse/clickhouse-kafka-connect/releases)에서 다운로드할 수 있습니다. 의견이나 이슈가 있으면 언제든지 해당 저장소에 등록해 주십시오.

&quot;Connector Plugins&quot; -&gt; &quot;Add plugin&quot;으로 이동한 다음, 아래 설정을 사용하십시오:

```text
'Connector Class' - 'com.clickhouse.kafka.connect.ClickHouseSinkConnector'
'Connector type' - Sink
'Sensitive properties' - 'password'. This will ensure entries of the ClickHouse password are masked during configuration.
```

예시:

<Image img={AddCustomConnectorPlugin} size="md" alt="사용자 지정 ClickHouse 커넥터 추가 설정이 표시된 Confluent Platform UI" border />


#### 연결 정보 수집 \{#gather-your-connection-details\}

<ConnectionDetails />

#### 커넥터 구성 \{#configure-the-connector\}

`Connectors` -&gt; `Add Connector`로 이동한 후 다음 설정을 사용합니다. (값은 예시일 뿐입니다.)

```json
{
  "database": "<DATABASE_NAME>",
  "errors.retry.timeout": "30",
  "exactlyOnce": "false",
  "schemas.enable": "false",
  "hostname": "<CLICKHOUSE_HOSTNAME>",
  "password": "<SAMPLE_PASSWORD>",
  "port": "8443",
  "ssl": "true",
  "topics": "<TOPIC_NAME>",
  "username": "<SAMPLE_USERNAME>",
  "key.converter": "org.apache.kafka.connect.storage.StringConverter",
  "value.converter": "org.apache.kafka.connect.json.JsonConverter",
  "value.converter.schemas.enable": "false"
}
```


#### 연결 엔드포인트 지정 \{#specify-the-connection-endpoints\}

커넥터가 접근할 수 있는 엔드포인트 허용 목록을 지정해야 합니다.
네트워크 egress 엔드포인트를 추가할 때는 FQDN(정규화된 도메인 이름)을 사용해야 합니다.
예: `u57swl97we.eu-west-1.aws.clickhouse.com:8443`

:::note
HTTP(S) 포트를 반드시 지정해야 합니다. 커넥터는 아직 Native 프로토콜을 지원하지 않습니다.
:::

[문서를 참조하십시오.](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#cc-byoc-endpoints)

이제 모든 준비가 완료되었습니다!

#### 알려진 제한 사항 \{#known-limitations\}

* Custom Connector는 퍼블릭 인터넷 엔드포인트를 사용해야 합니다. 고정 IP 주소는 지원되지 않습니다.
* 일부 Custom Connector 속성은 재정의할 수 있습니다. 전체 목록은 [공식 문서에서 확인할 수 있습니다.](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-manage.html#override-configuration-properties)
* Custom Connector는 [일부 AWS 리전](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#supported-aws-regions)에서만 사용할 수 있습니다.
* 자세한 [Custom Connector 제한 사항 목록은 공식 문서](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#limitations)를 참조하십시오.