---
sidebar_label: 'Коннектор Kafka Sink в Confluent Cloud'
sidebar_position: 2
slug: /integrations/kafka/cloud/confluent/sink-connector
description: 'Руководство по использованию полностью управляемого коннектора ClickHouse Sink в Confluent Cloud'
title: 'Интеграция Confluent Cloud с ClickHouse'
keywords: ['Kafka', 'Confluent Cloud']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
  - website: 'https://clickhouse.com/cloud/clickpipes'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';


# Интеграция Confluent Cloud с ClickHouse \{#integrating-confluent-cloud-with-clickhouse\}

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

## Предварительные требования \{#prerequisites\}

Предполагается, что вы знакомы со следующим:

* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
* Confluent Cloud

## Официальный коннектор Kafka от ClickHouse для Confluent Cloud \{#the-official-kafka-connector-from-clickhouse-with-confluent-cloud\}

#### Создание топика \{#create-a-topic\}

Создать топик в Confluent Cloud довольно просто; подробные инструкции приведены [здесь](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html).

#### Важные замечания \{#important-notes\}

* Имя топика Kafka должно совпадать с именем таблицы в ClickHouse. Настроить это соответствие можно с помощью трансформера (например, [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html)).
* Большее число партиций не всегда означает более высокую производительность — следите за нашим будущим руководством с дополнительной информацией и рекомендациями по производительности.

#### Соберите параметры подключения \{#gather-your-connection-details\}

<ConnectionDetails />

#### Установка коннектора \{#install-connector\}

Установите полностью управляемый ClickHouse Sink Connector в Confluent Cloud, следуя [официальной документации](https://docs.confluent.io/cloud/current/connectors/cc-clickhouse-sink-connector/cc-clickhouse-sink.html).

#### Настройка коннектора \{#configure-the-connector\}

Во время настройки ClickHouse Sink Connector вам потребуется указать следующие параметры:

- имя хоста (hostname) сервера ClickHouse
- порт сервера ClickHouse (по умолчанию 8443)
- имя пользователя и пароль для сервера ClickHouse
- имя базы данных в ClickHouse, в которую будут записываться данные
- имя топика в Kafka, который будет использоваться для записи данных в ClickHouse

Интерфейс Confluent Cloud поддерживает расширенные параметры конфигурации для задания интервалов опроса, размеров пакетов и других параметров с целью оптимизации производительности.

:::note  
В Confluent Cloud изменение некоторых настроек, таких как [fetch settings](/integrations/kafka/clickhouse-kafka-connect-sink/#fetch-settings) и [poll settings](/integrations/kafka/clickhouse-kafka-connect-sink/#poll-settings), требует открытия запроса в службу поддержки через Confluent Cloud.
:::  

#### Известные ограничения \{#known-limitations\}

* См. список [ограничений коннектора в официальной документации](https://docs.confluent.io/cloud/current/connectors/cc-clickhouse-sink-connector/cc-clickhouse-sink.html#limitations)