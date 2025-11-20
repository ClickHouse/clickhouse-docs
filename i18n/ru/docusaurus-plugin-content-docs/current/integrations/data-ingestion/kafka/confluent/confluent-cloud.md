---
sidebar_label: 'Kafka Connector Sink на Confluent Cloud'
sidebar_position: 2
slug: /integrations/kafka/cloud/confluent/sink-connector
description: 'Руководство по использованию полностью управляемого коннектора ClickHouse Sink на Confluent Cloud'
title: 'Интеграция Confluent Cloud с ClickHouse'
keywords: ['Kafka', 'Confluent Cloud']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
  - website: 'https://clickhouse.com/cloud/clickpipes'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
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



## Предварительные требования {#prerequisites}

Предполагается, что вы знакомы с:

- [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
- Confluent Cloud


## Официальный Kafka-коннектор от ClickHouse для Confluent Cloud {#the-official-kafka-connector-from-clickhouse-with-confluent-cloud}

#### Создание топика {#create-a-topic}

Создание топика в Confluent Cloud довольно простое, подробные инструкции доступны [здесь](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html).

#### Важные замечания {#important-notes}

- Имя топика Kafka должно совпадать с именем таблицы ClickHouse. Изменить это можно с помощью трансформера (например, [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html)).
- Большее количество партиций не всегда означает более высокую производительность — подробности и советы по производительности см. в нашем предстоящем руководстве.

#### Сбор параметров подключения {#gather-your-connection-details}

<ConnectionDetails />

#### Установка коннектора {#install-connector}

Установите полностью управляемый ClickHouse Sink Connector в Confluent Cloud, следуя [официальной документации](https://docs.confluent.io/cloud/current/connectors/cc-clickhouse-sink-connector/cc-clickhouse-sink.html).

#### Настройка коннектора {#configure-the-connector}

При настройке ClickHouse Sink Connector необходимо указать следующие параметры:

- имя хоста вашего сервера ClickHouse
- порт вашего сервера ClickHouse (по умолчанию 8443)
- имя пользователя и пароль для вашего сервера ClickHouse
- имя базы данных в ClickHouse, в которую будут записываться данные
- имя топика в Kafka, который будет использоваться для записи данных в ClickHouse

Интерфейс Confluent Cloud поддерживает расширенные параметры конфигурации для настройки интервалов опроса, размеров пакетов и других параметров для оптимизации производительности.

#### Известные ограничения {#known-limitations}

- См. список [ограничений коннекторов в официальной документации](https://docs.confluent.io/cloud/current/connectors/cc-clickhouse-sink-connector/cc-clickhouse-sink.html#limitations)
