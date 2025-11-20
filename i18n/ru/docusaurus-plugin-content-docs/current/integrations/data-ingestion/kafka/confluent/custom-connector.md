---
sidebar_label: 'Kafka Connector Sink на Confluent Platform'
sidebar_position: 3
slug: /integrations/kafka/cloud/confluent/custom-connector
description: 'Использование ClickHouse Connector Sink с Kafka Connect и ClickHouse'
title: 'Интеграция Confluent Cloud с ClickHouse'
keywords: ['интеграция Confluent ClickHouse', 'коннектор Kafka ClickHouse', 'приёмник Kafka Connect ClickHouse', 'ClickHouse Confluent Platform', 'пользовательский коннектор Confluent']
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

Предполагается, что вы знакомы с:

- [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
- Confluent Platform и [пользовательскими коннекторами](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/overview.html).


## Официальный Kafka-коннектор от ClickHouse для Confluent Platform {#the-official-kafka-connector-from-clickhouse-with-confluent-platform}

### Установка на Confluent Platform {#installing-on-confluent-platform}

Это краткое руководство по началу работы с ClickHouse Sink Connector на Confluent Platform.
Подробнее см. в [официальной документации Confluent](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#uploading-and-launching-the-connector).

#### Создание топика {#create-a-topic}

Создание топика на Confluent Platform довольно простое, подробные инструкции доступны [здесь](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html).

#### Важные замечания {#important-notes}

- Имя топика Kafka должно совпадать с именем таблицы ClickHouse. Изменить это можно с помощью трансформера (например, [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html)).
- Большее количество партиций не всегда означает более высокую производительность — подробности и советы по производительности см. в нашем предстоящем руководстве.

#### Установка коннектора {#install-connector}

Вы можете скачать коннектор из нашего [репозитория](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) — не стесняйтесь оставлять комментарии и сообщать о проблемах там же!

Перейдите в «Connector Plugins» → «Add plugin» и используйте следующие настройки:

```text
'Connector Class' — 'com.clickhouse.kafka.connect.ClickHouseSinkConnector'
'Connector type' — Sink
'Sensitive properties' — 'password'. Это обеспечит маскировку записей пароля ClickHouse во время конфигурации.
```

Пример:

<Image
  img={AddCustomConnectorPlugin}
  size='md'
  alt='Интерфейс Confluent Platform с настройками для добавления пользовательского коннектора ClickHouse'
  border
/>

#### Сбор данных для подключения {#gather-your-connection-details}

<ConnectionDetails />

#### Настройка коннектора {#configure-the-connector}

Перейдите в `Connectors` → `Add Connector` и используйте следующие настройки (обратите внимание, что значения приведены только в качестве примера):

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

#### Указание конечных точек подключения {#specify-the-connection-endpoints}

Необходимо указать список разрешенных конечных точек, к которым коннектор может получить доступ.
При добавлении исходящих сетевых конечных точек необходимо использовать полное доменное имя (FQDN).
Пример: `u57swl97we.eu-west-1.aws.clickhouse.com:8443`

:::note
Необходимо указать порт HTTP(S). Коннектор пока не поддерживает нативный протокол.
:::

[Читайте документацию.](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#cc-byoc-endpoints)

Всё готово!

#### Известные ограничения {#known-limitations}

- Пользовательские коннекторы должны использовать публичные интернет-конечные точки. Статические IP-адреса не поддерживаются.
- Вы можете переопределить некоторые свойства пользовательских коннекторов. См. полный [список в официальной документации.](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-manage.html#override-configuration-properties)
- Пользовательские коннекторы доступны только в [некоторых регионах AWS](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#supported-aws-regions)
- См. список [ограничений пользовательских коннекторов в официальной документации](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#limitations)
