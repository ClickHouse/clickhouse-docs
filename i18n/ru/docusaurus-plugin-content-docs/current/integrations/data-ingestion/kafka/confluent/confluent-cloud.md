---
'sidebar_label': 'Kafka Connector Sink на Confluent Cloud'
'sidebar_position': 2
'slug': '/integrations/kafka/cloud/confluent/sink-connector'
'description': 'Руководство по использованию полностью управляемого ClickHouse Connector
  Sink на Confluent Cloud'
'title': 'Интеграция Confluent Cloud с ClickHouse'
'keywords':
- 'Kafka'
- 'Confluent Cloud'
'doc_type': 'guide'
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';


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
* Confluent Cloud

## Официальный Kafka коннектор от ClickHouse для Confluent Cloud {#the-official-kafka-connector-from-clickhouse-with-confluent-cloud}

#### Создание темы {#create-a-topic}
Создание темы в Confluent Cloud довольно просто, и подробные инструкции можно найти [здесь](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html).

#### Важные заметки {#important-notes}

* Имя темы Kafka должно совпадать с именем таблицы ClickHouse. Можно изменить это, используя трансформатор (например, [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html)).
* Большее количество партиций не всегда означает большую производительность - смотрите наше предстоящее руководство для получения дополнительных сведений и советов по производительности.

#### Соберите детали подключения {#gather-your-connection-details}
<ConnectionDetails />

#### Установите коннектор {#install-connector}
Установите полностью управляемый ClickHouse Sink Connector в Confluent Cloud, следуя [официальной документации](https://docs.confluent.io/cloud/current/connectors/cc-clickhouse-sink-connector/cc-clickhouse-sink.html).

#### Настройте коннектор {#configure-the-connector}
Во время настройки ClickHouse Sink Connector вам нужно будет предоставить следующие детали:
- hostname вашего сервера ClickHouse
- порт вашего сервера ClickHouse (по умолчанию 8443)
- имя пользователя и пароль для вашего сервера ClickHouse
- название базы данных в ClickHouse, в которую будут записываться данные
- имя темы в Kafka, которая будет использоваться для записи данных в ClickHouse

Интерфейс пользователя Confluent Cloud поддерживает дополнительные настройки для регулировки интервалов опроса, размеров пакетов и других параметров для оптимизации производительности.

#### Известные ограничения {#known-limitations}
* Смотрите список [ограничений коннекторов в официальной документации](https://docs.confluent.io/cloud/current/connectors/cc-clickhouse-sink-connector/cc-clickhouse-sink.html#limitations)