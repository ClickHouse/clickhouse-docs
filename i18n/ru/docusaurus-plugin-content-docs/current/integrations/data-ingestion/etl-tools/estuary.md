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
keywords: ['estuary', 'ингестия данных', 'etl', 'pipeline', 'интеграция данных', 'clickpipes']
---

import PartnerBadge from '@theme/badges/PartnerBadge';


# Подключение Estuary к ClickHouse \{#connect-estuary-with-clickhouse\}

<PartnerBadge/>

[Estuary](https://estuary.dev/) — это платформа для своевременной работы с данными, которая гибко объединяет потоковые и пакетные данные в простые в настройке ETL-конвейеры. Благодаря корпоративному уровню безопасности и гибким вариантам развертывания Estuary обеспечивает надежные потоки данных из SaaS-систем, баз данных и стриминговых источников в различные целевые системы, включая ClickHouse.

Estuary подключается к ClickHouse через Kafka ClickPipe. Для этой интеграции вам не нужно поддерживать собственную экосистему Kafka.

## Руководство по настройке \{#setup-guide\}

**Предварительные требования**

* [Учетная запись Estuary](https://dashboard.estuary.dev/register)
* Одна или несколько [**captures**](https://docs.estuary.dev/concepts/captures/) в Estuary, которые считывают данные из нужных вам источников
* Учетная запись ClickHouse Cloud с правами на использование ClickPipe

<VerticalStepper headerLevel="h3">

### Создайте материализацию в Estuary \{#1-create-an-estuary-materialization\}

Чтобы перенести данные из ваших исходных коллекций в Estuary в ClickHouse, сначала необходимо создать **materialization** (материализацию).

1. В панели управления Estuary перейдите на страницу [Destinations](https://dashboard.estuary.dev/materializations).

2. Нажмите **+ New Materialization**.

3. Выберите коннектор **ClickHouse**.

4. Заполните сведения в разделах Materialization, Endpoint и Source Collections:

   * **Materialization Details:** Укажите уникальное имя для вашей материализации и выберите data plane (облачного провайдера и регион)

   * **Endpoint Config:** Укажите защищённый **Auth Token**

   * **Source Collections:** Свяжите существующий **capture** или выберите коллекции данных, которые нужно сделать доступными в ClickHouse

5. Нажмите **Next**, затем **Save and Publish**.

6. На странице сведений о материализации запомните полное имя вашей ClickHouse materialization. Оно будет выглядеть примерно так: `your-tenant/your-unique-name/dekaf-clickhouse`.

Estuary начнёт передавать выбранные коллекции в виде сообщений Kafka. ClickHouse может получить доступ к этим данным через Kafka ClickPipe, используя данные брокера Estuary и указанный вами auth token.

### Введите параметры подключения к Kafka \{#2-enter-kafka-connection-details\}

Настройте новый Kafka ClickPipe в ClickHouse и укажите параметры подключения:

1. В панели управления ClickHouse Cloud выберите **Data sources**.

2. Создайте новый **ClickPipe**.

3. В качестве источника данных выберите **Apache Kafka**.

4. Введите параметры подключения к Kafka, используя информацию о брокере и реестре Estuary:

   * Укажите имя для вашего ClickPipe
   * В качестве брокера используйте: `dekaf.estuary-data.com:9092`
   * Оставьте аутентификацию по умолчанию — `SASL/PLAIN`
   * В поле user введите полное имя вашей материализации из Estuary (например, `your-tenant/your-unique-name/dekaf-clickhouse`)
   * В поле password введите auth token, который вы указали для своей материализации

5. Включите опцию schema registry

   * В качестве schema URL используйте: `https://dekaf.estuary-data.com`
   * Schema key будет таким же, как и broker user (имя вашей материализации)
   * Secret будет таким же, как и broker password (ваш auth token)

### Настройте входящие данные \{#3-configure-incoming-data\}

1. Выберите один из ваших **topics** Kafka (одну из коллекций данных из Estuary).

2. Выберите **offset**.

3. ClickHouse обнаружит сообщения топика. Затем можно перейти к разделу **Parse information**, чтобы настроить параметры таблицы.

4. Выберите, создать новую таблицу или загружать данные в подходящую существующую таблицу.

5. Отобразите поля источника на столбцы таблицы, подтвердив имя столбца, тип и то, допускает ли он значения Nullable.

6. В финальном разделе **Details and settings** вы можете выбрать права доступа для выделенного пользователя базы данных.

После того как вы завершите настройку конфигурации, создайте ваш ClickPipe.

ClickHouse подготовит новый источник данных и начнёт потреблять сообщения из Estuary. Создайте столько ClickPipes, сколько нужно, чтобы передавать данные в потоковом режиме из всех требуемых коллекций данных.

</VerticalStepper>

## Дополнительные ресурсы \{#additional-resources\}

Чтобы узнать больше о настройке интеграции с Estuary, см. документацию Estuary:

* Обратитесь к [документации по материализации ClickHouse](https://docs.estuary.dev/reference/Connectors/materialization-connectors/Dekaf/clickhouse/) в Estuary.

* Estuary публикует данные в виде сообщений Kafka с использованием **Dekaf**. Подробнее о Dekaf можно узнать [здесь](https://docs.estuary.dev/guides/dekaf_reading_collections_from_kafka/).

* Чтобы увидеть список источников, которые вы можете передавать в ClickHouse в потоковом режиме с помощью Estuary, ознакомьтесь с [коннекторами захвата Estuary](https://docs.estuary.dev/reference/Connectors/capture-connectors/).