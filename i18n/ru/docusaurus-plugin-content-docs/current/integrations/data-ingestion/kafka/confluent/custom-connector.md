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

## Предварительные условия {#prerequisites}
Мы предполагаем, что вы знакомы с:
* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
* Confluent Cloud и [Настройка пользовательских коннекторов](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/overview.html).

## Официальный коннектор Kafka от ClickHouse с Confluent Cloud {#the-official-kafka-connector-from-clickhouse-with-confluent-cloud}

### Установка на Confluent Cloud {#installing-on-confluent-cloud}
Это руководство предназначено для того, чтобы быстро начать работу с ClickHouse Sink Connector на Confluent Cloud.
Для получения более подробной информации, пожалуйста, обратитесь к [официальной документации Confluent](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#uploading-and-launching-the-connector).

#### Создание темы {#create-a-topic}
Создание темы в Confluent Cloud довольно просто, и подробные инструкции можно найти [здесь](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html).

#### Важные примечания {#important-notes}

* Имя темы Kafka должно совпадать с именем таблицы ClickHouse. Способом изменить это является использование трансформера (например, [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html)).
* Большее количество разделов не всегда означает лучшую производительность - смотрите наше предстоящее руководство для получения более подробной информации и советов по производительности.

#### Установите коннектор {#install-connector}
Вы можете скачать коннектор из нашего [репозитория](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) - не стесняйтесь оставлять комментарии и сообщения об ошибках там!

Перейдите в "Коннектор Плагины" -> "Добавить плагин" и используйте следующие настройки:

```text
'Класс коннектора' - 'com.clickhouse.kafka.connect.ClickHouseSinkConnector'
'Тип коннектора' - Sink
'Чувствительные свойства' - 'password'. Это обеспечит маскирование ввода пароля ClickHouse во время конфигурации.
```
Пример:
<Image img={AddCustomConnectorPlugin} size="md" alt="Интерфейс платформы Confluent, показывающий настройки для добавления пользовательского коннектора ClickHouse" border/>

#### Соберите свои данные для подключения {#gather-your-connection-details}
<ConnectionDetails />

#### Настройте коннектор {#configure-the-connector}
Перейдите в `Connectors` -> `Add Connector` и используйте следующие настройки (обратите внимание, что значения указаны только в качестве примера):

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
Вам нужно указать разрешенный список конечных точек, к которым может получить доступ коннектор.
Необходимо использовать полное доменное имя (FQDN) при добавлении сетевых исходящих конечных точек.
Пример: `u57swl97we.eu-west-1.aws.clickhouse.com:8443`

:::note
Необходимо указать порт HTTP(S). Коннектор пока не поддерживает нативный протокол.
:::

[Читать документацию.](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#cc-byoc-endpoints)

Теперь всё готово к работе!

#### Известные ограничения {#known-limitations}
* Пользовательские коннекторы должны использовать конечные точки общедоступного интернета. Статические IP-адреса не поддерживаются.
* Вы можете переопределить некоторые свойства пользовательского коннектора. См. полный [список в официальной документации.](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-manage.html#override-configuration-properties)
* Пользовательские коннекторы доступны только в [некоторых регионах AWS](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#supported-aws-regions)
* Смотрите список [ограничений пользовательских коннекторов в официальной документации](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#limitations)
