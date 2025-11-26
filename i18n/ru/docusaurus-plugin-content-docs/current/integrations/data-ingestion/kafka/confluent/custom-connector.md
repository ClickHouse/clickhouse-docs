---
sidebar_label: 'Sink-коннектор Kafka на платформе Confluent'
sidebar_position: 3
slug: /integrations/kafka/cloud/confluent/custom-connector
description: 'Использование sink-коннектора ClickHouse с Kafka Connect и ClickHouse'
title: 'Интеграция Confluent Cloud с ClickHouse'
keywords: ['Интеграция Confluent с ClickHouse', 'коннектор Kafka ClickHouse', 'Kafka Connect ClickHouse sink', 'Confluent Platform ClickHouse', 'пользовательский коннектор Confluent']
doc_type: 'guide'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import AddCustomConnectorPlugin from '@site/static/images/integrations/data-ingestion/kafka/confluent/AddCustomConnectorPlugin.png';


# Интеграция платформы Confluent с ClickHouse

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



## Предварительные требования {#prerequisites}
Мы исходим из того, что вы знакомы со следующим:
* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
* Платформой Confluent и [пользовательскими коннекторами (Custom Connectors)](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/overview.html).



## Официальный коннектор Kafka от ClickHouse для Confluent Platform

### Установка на Confluent Platform

Это краткое руководство, которое поможет вам начать работу с ClickHouse Sink Connector на Confluent Platform.
За дополнительной информацией обратитесь к [официальной документации Confluent](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#uploading-and-launching-the-connector).

#### Создание топика

Создание топика на Confluent Platform достаточно простое, подробные инструкции приведены [здесь](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html).

#### Важные замечания

* Имя топика Kafka должно совпадать с именем таблицы ClickHouse. Настроить это поведение можно с помощью трансформера (например, [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html)).
* Большее количество партиций не всегда означает более высокую производительность — см. наше следующее руководство для получения дополнительных сведений и рекомендаций по оптимизации производительности.

#### Установка коннектора

Вы можете скачать коннектор из нашего [репозитория](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) — там же вы можете оставлять комментарии и создавать issues!

Перейдите в «Connector Plugins» → «Add plugin» и используйте следующие настройки:

```text
'Connector Class' - 'com.clickhouse.kafka.connect.ClickHouseSinkConnector'
'Connector type' - Sink
'Sensitive properties' - 'password'. Это обеспечит маскировку паролей ClickHouse при настройке конфигурации.
```

Пример:

<Image img={AddCustomConnectorPlugin} size="md" alt="Интерфейс Confluent Platform с настройками для добавления пользовательского коннектора ClickHouse" border />

#### Соберите данные подключения

<ConnectionDetails />

#### Настройте коннектор

Перейдите в `Connectors` -&gt; `Add Connector` и используйте следующие настройки (обратите внимание, что значения приведены только в качестве примера):

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

#### Укажите конечные точки подключения

Вам нужно задать список разрешённых конечных точек, к которым коннектор может обращаться.
При добавлении конечных точек исходящего (egress) сетевого трафика необходимо использовать полное доменное имя (FQDN).
Пример: `u57swl97we.eu-west-1.aws.clickhouse.com:8443`

:::note
Необходимо указать порт HTTP(S). Коннектор пока не поддерживает нативный протокол.
:::

[Прочитайте документацию.](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#cc-byoc-endpoints)

На этом настройка завершена.

#### Известные ограничения

* Custom Connectors должны использовать конечные точки в публичном интернете. Статические IP‑адреса не поддерживаются.
* Вы можете переопределить некоторые свойства Custom Connector. См. полный [список в официальной документации.](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-manage.html#override-configuration-properties)
* Custom Connectors доступны только в [некоторых регионах AWS](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#supported-aws-regions)
* См. список [ограничений Custom Connectors в официальной документации](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#limitations)
