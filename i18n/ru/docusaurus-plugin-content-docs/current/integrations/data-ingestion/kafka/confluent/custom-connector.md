---
sidebar_label: 'Коннектор Kafka Sink на платформе Confluent'
sidebar_position: 2
slug: /integrations/kafka/cloud/confluent/custom-connector
description: 'Использование ClickHouse Connector Sink с Kafka Connect и ClickHouse'
title: 'Интеграция Confluent Cloud с ClickHouse'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import AddCustomConnectorPlugin from '@site/static/images/integrations/data-ingestion/kafka/confluent/AddCustomConnectorPlugin.png';


# Интеграция Confluent Cloud с ClickHouse

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
Мы предполагаем, что вы знакомы с:
* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
* Confluent Cloud и [кастомными коннекторами](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/overview.html).

## Официальный коннектор Kafka от ClickHouse с Confluent Cloud {#the-official-kafka-connector-from-clickhouse-with-confluent-cloud}

### Установка на Confluent Cloud {#installing-on-confluent-cloud}
Это краткое руководство, чтобы помочь вам начать работу с ClickHouse Sink Connector на Confluent Cloud.
Для получения дополнительной информации, пожалуйста, обратитесь к [официальной документации Confluent](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#uploading-and-launching-the-connector).

#### Создание темы {#create-a-topic}
Создание темы на Confluent Cloud довольно просто, и есть подробные инструкции [здесь](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html).

#### Важные заметки {#important-notes}

* Имя Kafka-темы должно совпадать с именем таблицы ClickHouse. Налаштувати это можно с помощью трансформера (например, [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html)).
* Большее количество партиций не всегда означает лучшую производительность - смотрите наше предстоящее руководство для получения дополнительных деталей и советов по производительности.

#### Установка коннектора {#install-connector}
Вы можете загрузить коннектор из нашего [репозитория](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) - пожалуйста, не стесняйтесь оставлять комментарии и проблемы там же!

Перейдите в "Connector Plugins" -> "Add plugin" и используйте следующие настройки:

```text
'Connector Class' - 'com.clickhouse.kafka.connect.ClickHouseSinkConnector'
'Connector type' - Sink
'Sensitive properties' - 'password'. Это скроет записи пароля ClickHouse в процессе настройки.
```
Пример:
<Image img={AddCustomConnectorPlugin} size="md" alt="UI платформы Confluent, показывающая настройки для добавления кастомного коннектора ClickHouse" border/>

#### Соберите свои данные для подключения {#gather-your-connection-details}
<ConnectionDetails />

#### Настройка коннектора {#configure-the-connector}
Перейдите в `Connectors` -> `Add Connector` и используйте следующие настройки (обратите внимание, что значения являются примерами):

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

#### Укажите конечные точки подключения {#specify-the-connection-endpoints}
Вам необходимо указать список разрешенных конечных точек, к которым коннектор может получить доступ.
Вы должны использовать полностью квалифицированное доменное имя (FQDN) при добавлении конечных точек сетевого выхода.
Пример: `u57swl97we.eu-west-1.aws.clickhouse.com:8443`

:::note
Вы должны указать порт HTTP(S). Коннектор пока не поддерживает нативный протокол.
:::

[Читать документацию.](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#cc-byoc-endpoints)

Вы на верном пути!

#### Известные ограничения {#known-limitations}
* Кастомные коннекторы должны использовать публичные интернет-эндпоинты. Статические IP-адреса не поддерживаются.
* Вы можете переопределить некоторые свойства кастомного коннектора. Смотрите полный [список в официальной документации.](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-manage.html#override-configuration-properties)
* Кастомные коннекторы доступны только в [некоторых регионах AWS](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#supported-aws-regions)
* Смотрите список [ограничений кастомных коннекторов в официальной документации](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#limitations)
