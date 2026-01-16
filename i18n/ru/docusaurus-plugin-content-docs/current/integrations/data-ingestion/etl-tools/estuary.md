---
sidebar_label: 'Estuary'
slug: /integrations/estuary
description: 'Организуйте потоковую передачу данных из различных источников в ClickHouse с помощью интеграции Estuary'
title: 'Подключение Estuary к ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_ingestion'
  - website: 'https://estuary.dev'
keywords: ['estuary', 'ингестия данных', 'etl', 'конвейер данных', 'интеграция данных', 'clickpipes']
---

import PartnerBadge from '@theme/badges/PartnerBadge';

# Подключение Estuary к ClickHouse \{#connect-estuary-with-clickhouse\}

<PartnerBadge/>

[Estuary](https://estuary.dev/) — это платформа обработки данных в режиме, близком к реальному времени (right-time), которая гибко сочетает потоковые (real-time) и пакетные данные в простых в настройке ETL-конвейерах. Благодаря корпоративному уровню безопасности и вариантам развертывания Estuary обеспечивает надежные потоки данных из SaaS-систем, баз данных и стриминговых источников данных в различные системы‑получатели, включая ClickHouse.

Estuary подключается к ClickHouse через Kafka ClickPipe. Для этой интеграции вам не нужно поддерживать собственную экосистему Kafka.

## Руководство по настройке \\{#setup-guide\\}

**Предварительные требования**

* [Учетная запись Estuary](https://dashboard.estuary.dev/register)
* Одна или несколько [**captures**](https://docs.estuary.dev/concepts/captures/) в Estuary, которые извлекают данные из нужных вам источников
* Учетная запись ClickHouse Cloud с правами на использование ClickPipe

<VerticalStepper headerLevel="h3">

### Создайте materialization в Estuary \\{#1-create-an-estuary-materialization\\}

Чтобы передавать данные из ваших коллекций-источников в Estuary в ClickHouse, сначала нужно создать **materialization**.

1. В панели управления Estuary перейдите на страницу [Destinations](https://dashboard.estuary.dev/materializations).

2. Нажмите **+ New Materialization**.

3. Выберите коннектор **ClickHouse**.

4. Заполните разделы Materialization, Endpoint и Source Collections:

   * **Materialization Details:** Укажите уникальное имя для вашей materialization и выберите data plane (облачного провайдера и регион)

   * **Endpoint Config:** Укажите защищенный **Auth Token**

   * **Source Collections:** Свяжите существующий **capture** или выберите коллекции данных, которые будут доступны в ClickHouse

5. Нажмите **Next**, затем **Save and Publish**.

6. На странице с деталями materialization запишите полное имя вашей ClickHouse materialization. Оно будет выглядеть примерно так: `your-tenant/your-unique-name/dekaf-clickhouse`.

Estuary начнет транслировать выбранные коллекции в виде сообщений Kafka. ClickHouse может получать эти данные через Kafka ClickPipe, используя сведения о брокере Estuary и указанный вами токен аутентификации.

### Введите параметры подключения к Kafka \\{#2-enter-kafka-connection-details\\}

Настройте новый Kafka ClickPipe в ClickHouse и введите параметры подключения:

1. В панели управления ClickHouse Cloud выберите **Data sources**.

2. Создайте новый **ClickPipe**.

3. В качестве источника данных выберите **Apache Kafka**.

4. Введите параметры подключения к Kafka, используя сведения о брокере и реестре Estuary:

   * Укажите имя для вашего ClickPipe
   * В качестве брокера используйте: `dekaf.estuary-data.com:9092`
   * Оставьте аутентификацию со значением по умолчанию `SASL/PLAIN`
   * В качестве user укажите полное имя вашей materialization из Estuary (например, `your-tenant/your-unique-name/dekaf-clickhouse`)
   * В качестве password укажите токен аутентификации (auth token), который вы задали для своей materialization

5. Включите параметр использования schema registry

   * В качестве schema URL используйте: `https://dekaf.estuary-data.com`
   * Schema key будет таким же, как broker user (имя вашей materialization)
   * Secret будет таким же, как broker password (ваш auth token)

### Настройте входящие данные \\{#3-configure-incoming-data\\}

1. Выберите один из своих Kafka **topics** (одну из коллекций данных из Estuary).

2. Выберите **offset**.

3. ClickHouse обнаружит сообщения топика. Затем вы можете перейти к разделу **Parse information**, чтобы настроить параметры таблицы.

4. Выберите, создать новую таблицу или загружать данные в соответствующую существующую таблицу.

5. Отобразите поля источника на столбцы таблицы, подтвердив имя столбца, тип и то, является ли он типом Nullable.

6. В финальном разделе **Details and settings** вы можете выбрать права доступа для выделенного пользователя базы данных.

Когда вас устроит конфигурация, создайте ClickPipe.

ClickHouse подготовит новый источник данных и начнет потреблять сообщения из Estuary. Создайте столько ClickPipes, сколько нужно, чтобы организовать потоковую передачу из всех требуемых коллекций данных.

</VerticalStepper>

## Дополнительные ресурсы \\{#additional-resources\\}

Дополнительную информацию по настройке интеграции с Estuary см. в документации Estuary:

* См. раздел документации Estuary [о материализации в ClickHouse](https://docs.estuary.dev/reference/Connectors/materialization-connectors/Dekaf/clickhouse/).

* Estuary публикует данные в виде Kafka-сообщений с помощью **Dekaf**. Подробнее о Dekaf можно узнать [здесь](https://docs.estuary.dev/guides/dekaf_reading_collections_from_kafka/).

* Чтобы посмотреть список источников, данные из которых можно передавать в ClickHouse в потоковом режиме с помощью Estuary, изучите раздел [capture-коннекторы Estuary](https://docs.estuary.dev/reference/Connectors/capture-connectors/).