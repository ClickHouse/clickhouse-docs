---
'sidebar_label': 'Kafka Connector Sink на платформе Confluent'
'sidebar_position': 3
'slug': '/integrations/kafka/cloud/confluent/custom-connector'
'description': 'Используя ClickHouse Connector Sink с Kafka Connect и ClickHouse'
'title': 'Интеграция Confluent Cloud с ClickHouse'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
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
Мы предполагаем, что вы знакомы с:
* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
* Платформой Confluent и [Пользовательскими Коннекторами](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/overview.html).

## Официальный Kafka коннектор от ClickHouse для платформы Confluent {#the-official-kafka-connector-from-clickhouse-with-confluent-platform}

### Установка на платформе Confluent {#installing-on-confluent-platform}
Это краткое руководство, чтобы помочь вам начать работу с ClickHouse Sink Connector на платформе Confluent.
Для получения более подробной информации, пожалуйста, обратитесь к [официальной документации Confluent](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#uploading-and-launching-the-connector).

#### Создание темы {#create-a-topic}
Создание темы на платформе Confluent довольно просто, и подробные инструкции можно найти [здесь](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html).

#### Важные примечания {#important-notes}

* Имя темы Kafka должно совпадать с именем таблицы ClickHouse. Способ изменить это - использовать трансформатор (например, [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html)).
* Большее количество партиций не всегда означает большую производительность - смотрите наше предстоящее руководство для получения более подробной информации и советов по производительности.

#### Установка коннектора {#install-connector}
Вы можете скачать коннектор из нашего [репозитория](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) - оставляйте, пожалуйста, комментарии и проблемы там тоже!

Перейдите в "Connector Plugins" -> "Add plugin" и используйте следующие настройки:

```text
'Connector Class' - 'com.clickhouse.kafka.connect.ClickHouseSinkConnector'
'Connector type' - Sink
'Sensitive properties' - 'password'. This will ensure entries of the ClickHouse password are masked during configuration.
```
Пример:
<Image img={AddCustomConnectorPlugin} size="md" alt="Интерфейс платформы Confluent, показывающий настройки для добавления пользовательского коннектора ClickHouse" border/>

#### Соберите ваши данные подключения {#gather-your-connection-details}
<ConnectionDetails />

#### Настройка коннектора {#configure-the-connector}
Перейдите в `Connectors` -> `Add Connector` и используйте следующие настройки (обратите внимание, что значения приведены только в качестве примеров):

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
Необходимо указать список разрешенных конечных точек, к которым коннектор может обращаться.
Вы должны использовать полное доменное имя (FQDN) при добавлении конечной точки сетевого выхода.
Например: `u57swl97we.eu-west-1.aws.clickhouse.com:8443`

:::note
Вы должны указать HTTP(S) порт. Коннектор пока не поддерживает Native protocol.
:::

[Читать документацию.](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#cc-byoc-endpoints)

Теперь вы готовы!

#### Известные ограничения {#known-limitations}
* Пользовательские коннекторы должны использовать публичные интернет-адреса. Статические IP-адреса не поддерживаются.
* Вы можете переопределить некоторые свойства пользовательского коннектора. См. полный [список в официальной документации.](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-manage.html#override-configuration-properties)
* Пользовательские коннекторы доступны только в [некоторых регионах AWS](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#supported-aws-regions)
* См. список [ограничений пользовательских коннекторов в официальных документах](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#limitations)
