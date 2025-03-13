---
sidebar_label: 'Коннектор Kafka Sink на платформе Confluent'
sidebar_position: 2
slug: /integrations/kafka/cloud/confluent/custom-connector
description: 'Использование ClickHouse Connector Sink с Kafka Connect и ClickHouse'
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
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

## Требования {#prerequisites}
Предполагается, что вы знакомы с:
* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
* Confluent Cloud и [Пользовательскими коннекторами](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/overview.html).

## Официальный коннектор Kafka от ClickHouse с Confluent Cloud {#the-official-kafka-connector-from-clickhouse-with-confluent-cloud}

### Установка на Confluent Cloud {#installing-on-confluent-cloud}
Это краткое руководство, которое поможет вам начать работу с ClickHouse Sink Connector на Confluent Cloud.
Для получения более подробной информации просмотрите [официальную документацию Confluent](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#uploading-and-launching-the-connector).

#### Создание темы {#create-a-topic}
Создать тему на Confluent Cloud довольно просто, и подробные инструкции можно найти [здесь](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html).

#### Важные замечания {#important-notes}

* Имя темы Kafka должно совпадать с именем таблицы ClickHouse. Вы можете изменить это с помощью трансформатора (например, [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html)).
* Большее количество партиций не всегда означает лучшую производительность - смотрите наше предстоящее руководство для получения дополнительной информации и советов по производительности.

#### Установка коннектора {#install-connector}
Вы можете скачать коннектор из нашего [репозитория](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) - пожалуйста, не стесняйтесь оставлять комментарии и сообщения о проблемах там же!

Перейдите в "Коннекторные плагины" -> "Добавить плагин" и используйте следующие настройки:

```text
'Класс коннектора' - 'com.clickhouse.kafka.connect.ClickHouseSinkConnector'
'Тип коннектора' - Sink
'Чувствительные свойства' - 'password'. Это обеспечит маскировку значений пароля ClickHouse в процессе конфигурации.
```
Пример:
<img src={AddCustomConnectorPlugin} class="image" alt="Настройки для добавления пользовательского коннектора" style={{width: '50%'}}/>

#### Соберите ваши данные для подключения {#gather-your-connection-details}
<ConnectionDetails />

#### Настройка коннектора {#configure-the-connector}
Перейдите в `Connectors` -> `Add Connector` и используйте следующие настройки (обратите внимание, что значения являются только примерами):

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
Вам необходимо указать список разрешенных конечных точек, доступ к которым может получить коннектор.
Вы должны использовать полное доменное имя (FQDN) при добавлении сетевых конечных точек.
Пример: `u57swl97we.eu-west-1.aws.clickhouse.com:8443`

:::note
Вы должны указать порт HTTP(S). Коннектор пока не поддерживает нативный протокол.
:::

[Читать документацию.](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#cc-byoc-endpoints)

Вы готовы!

#### Известные ограничения {#known-limitations}
* Пользовательские коннекторы должны использовать публичные интернет-конечные точки. Статические IP-адреса не поддерживаются.
* Вы можете переопределить некоторые свойства пользовательского коннектора. Смотрите полный [список в официальной документации.](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-manage.html#override-configuration-properties)
* Пользовательские коннекторы доступны только в [некоторых регионах AWS](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#supported-aws-regions)
* Смотрите список [ограничений пользовательских коннекторов в официальной документации](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#limitations)
