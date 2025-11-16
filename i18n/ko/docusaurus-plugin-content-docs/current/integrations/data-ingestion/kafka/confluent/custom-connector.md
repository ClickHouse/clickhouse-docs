---
'sidebar_label': 'Confluent Platform의 Kafka Connector Sink'
'sidebar_position': 3
'slug': '/integrations/kafka/cloud/confluent/custom-connector'
'description': 'ClickHouse와 함께 Kafka Connect를 사용하는 ClickHouse Connector Sink'
'title': 'Confluent Cloud와 ClickHouse 통합'
'keywords':
- 'Confluent ClickHouse integration'
- 'ClickHouse Kafka connector'
- 'Kafka Connect ClickHouse sink'
- 'Confluent Platform ClickHouse'
- 'custom connector Confluent'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import AddCustomConnectorPlugin from '@site/static/images/integrations/data-ingestion/kafka/confluent/AddCustomConnectorPlugin.png';


# Confluent 플랫폼과 ClickHouse 통합하기

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
다음과 같은 사항에 익숙하다고 가정합니다:
* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
* Confluent Platform 및 [커스텀 커넥터](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/overview.html).

## Confluent 플랫폼과 ClickHouse의 공식 Kafka 커넥터 {#the-official-kafka-connector-from-clickhouse-with-confluent-platform}

### Confluent 플랫폼에 설치하기 {#installing-on-confluent-platform}
이 문서는 Confluent Platform에서 ClickHouse Sink Connector를 시작하는 빠른 가이드입니다.
자세한 내용은 [공식 Confluent 문서](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#uploading-and-launching-the-connector)를 참조하시기 바랍니다.

#### 주제 만들기 {#create-a-topic}
Confluent Platform에서 주제를 만드는 것은 상당히 간단하며, 자세한 지침은 [여기](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html)에 있습니다.

#### 중요 사항 {#important-notes}

* Kafka 주제 이름은 ClickHouse 테이블 이름과 같아야 합니다. 이 점을 조정하는 방법은 변환기를 사용하는 것입니다 (예: [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html)).
* 더 많은 파티션이 항상 더 나은 성능을 의미하지는 않습니다 - 자세한 내용과 성능 팁은 다가오는 가이드를 참조하십시오.

#### 커넥터 설치하기 {#install-connector}
커넥터는 [저희 리포지토리](https://github.com/ClickHouse/clickhouse-kafka-connect/releases)에서 다운로드할 수 있습니다 - 거기에서 의견이나 문제를 제출하는 것도 좋습니다!

"커넥터 플러그인" -> "플러그인 추가"로 이동하고 다음 설정을 사용합니다:

```text
'Connector Class' - 'com.clickhouse.kafka.connect.ClickHouseSinkConnector'
'Connector type' - Sink
'Sensitive properties' - 'password'. This will ensure entries of the ClickHouse password are masked during configuration.
```
예시:
<Image img={AddCustomConnectorPlugin} size="md" alt="Confluent Platform UI showing settings for adding a custom ClickHouse connector" border/>

#### 연결 세부정보 수집하기 {#gather-your-connection-details}
<ConnectionDetails />

#### 커넥터 구성하기 {#configure-the-connector}
`Connectors` -> `Add Connector`로 이동하고 다음 설정을 사용합니다 (값은 예시일 뿐입니다):

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

#### 연결 엔드포인트 지정하기 {#specify-the-connection-endpoints}
커넥터가 접근할 수 있는 허용 목록의 엔드포인트를 지정해야 합니다.
네트워킹 이그레스 엔드포인트를 추가할 때는 완전한 도메인 이름(FQDN)을 사용해야 합니다.
예시: `u57swl97we.eu-west-1.aws.clickhouse.com:8443`

:::note
HTTP(S) 포트를 지정해야 합니다. 커넥터는 네이티브 프로토콜을 아직 지원하지 않습니다.
:::

[문서를 읽어보세요.](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#cc-byoc-endpoints)

모든 것이 준비되었습니다!

#### 알려진 제한 사항 {#known-limitations}
* 커스텀 커넥터는 공용 인터넷 엔드포인트를 사용해야 합니다. 정적 IP 주소는 지원되지 않습니다.
* 일부 커스텀 커넥터 속성을 재정의할 수 있습니다. 공식 문서에서 전체 [목록을 확인하세요.](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-manage.html#override-configuration-properties)
* 커스텀 커넥터는 [일부 AWS 지역에서만](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#supported-aws-regions) 사용할 수 있습니다.
* [공식 문서](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#limitations)에서 커스텀 커넥터의 제한 사항 목록을 확인하세요.
