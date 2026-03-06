---
sidebar_label: 'ClickPipes и языковые клиенты'
slug: /manage/integrations
title: 'ClickPipes и языковые клиенты'
description: 'Интеграции ClickPipes и языковых клиентов с ClickHouse Cloud'
doc_type: 'landing-page'
keywords: ['интеграции', 'возможности Cloud', 'clickpipes', 'языковые клиенты', 'коннекторы']
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import AmazonKinesis from '@site/static/images/integrations/logos/amazon_kinesis_logo.svg';
import Gcssvg from '@site/static/images/integrations/logos/gcs.svg';
import DOsvg from '@site/static/images/integrations/logos/digitalocean.svg';
import ABSsvg from '@site/static/images/integrations/logos/azureblobstorage.svg';
import Postgressvg from '@site/static/images/integrations/logos/postgresql.svg';
import Mysqlsvg from '@site/static/images/integrations/logos/mysql.svg';
import Mongodbsvg from '@site/static/images/integrations/logos/mongodb.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import clickpipes_stack from '@site/static/images/integrations/data-ingestion/clickpipes/clickpipes_stack.png';
import cp_custom_role from '@site/static/images/integrations/data-ingestion/clickpipes/cp_custom_role.png';
import Image from '@theme/IdealImage';

ClickHouse Cloud позволяет вам подключать ваши любимые инструменты и сервисы.


## Управляемые конвейеры интеграции для ClickHouse Cloud \{#clickpipes\}

ClickPipes — это управляемая платформа интеграции, которая делает приём данных из широкого набора источников таким же простым, как несколько кликов мышью.
Разработанные для самых требовательных нагрузок, ClickPipes с их надёжной и масштабируемой архитектурой обеспечивают стабильную производительность и отказоустойчивость.
ClickPipes можно использовать как для долгосрочного потокового приёма данных, так и для разовой загрузки.

| Name                                               | Logo                                                                                             |Type| Status           | Description                                                                                          |
|----------------------------------------------------|--------------------------------------------------------------------------------------------------|----|------------------|------------------------------------------------------------------------------------------------------|
| [Apache Kafka](/integrations/clickpipes/kafka)     | <Kafkasvg class="image" alt="Логотип Apache Kafka" style={{width: '3rem', 'height': '3rem'}}/>      |Streaming| Stable           | Настройте ClickPipes и начните приём потоковых данных из Apache Kafka в ClickHouse Cloud.     |
| Confluent Cloud                                    | <Confluentsvg class="image" alt="Логотип Confluent Cloud" style={{width: '3rem'}}/>                 |Streaming| Stable           | Объедините возможности Confluent и ClickHouse Cloud через нашу прямую интеграцию.          |
| Redpanda                                           | <Image img={redpanda_logo} size="logo" alt="Логотип Redpanda"/>                                     |Streaming| Stable           | Настройте ClickPipes и начните приём потоковых данных из Redpanda в ClickHouse Cloud.         |
| AWS MSK                                            | <Msksvg class="image" alt="Логотип AWS MSK" style={{width: '3rem', 'height': '3rem'}}/>             |Streaming| Stable           | Настройте ClickPipes и начните приём потоковых данных из AWS MSK в ClickHouse Cloud.          |
| Azure Event Hubs                                   | <Azureeventhubssvg class="image" alt="Логотип Azure Event Hubs" style={{width: '3rem'}}/>           |Streaming| Stable           | Настройте ClickPipes и начните приём потоковых данных из Azure Event Hubs в ClickHouse Cloud. |
| WarpStream                                         | <Warpstreamsvg class="image" alt="Логотип WarpStream" style={{width: '3rem'}}/>                     |Streaming| Stable           | Настройте ClickPipes и начните приём потоковых данных из WarpStream в ClickHouse Cloud.       |
| Amazon S3                                          | <S3svg class="image" alt="Логотип Amazon S3" style={{width: '3rem', height: 'auto'}}/>              |Object Storage| Stable           | Настройте ClickPipes для приёма больших объёмов данных из объектного хранилища.                            |
| Google Cloud Storage                               | <Gcssvg class="image" alt="Логотип Google Cloud Storage" style={{width: '3rem', height: 'auto'}}/>  |Object Storage| Stable           | Настройте ClickPipes для приёма больших объёмов данных из объектного хранилища.                            |
| DigitalOcean Spaces                                | <DOsvg class="image" alt="Логотип Digital Ocean" style={{width: '3rem', height: 'auto'}}/>          | Object Storage | Stable | Настройте ClickPipes для приёма больших объёмов данных из объектного хранилища.
| Azure Blob Storage                                 | <ABSsvg class="image" alt="Логотип Azure Blob Storage" style={{width: '3rem', height: 'auto'}}/>    | Object Storage | Private Beta | Настройте ClickPipes для приёма больших объёмов данных из объектного хранилища.
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <AmazonKinesis class="image" alt="Логотип Amazon Kinesis" style={{width: '3rem', height: 'auto'}}/> |Streaming| Stable           | Настройте ClickPipes и начните приём потоковых данных из Amazon Kinesis в ClickHouse Cloud.   |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Логотип Postgres" style={{width: '3rem', height: 'auto'}}/>         |DBMS| Stable      | Настройте ClickPipes и начните приём данных из Postgres в ClickHouse Cloud.                   |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="Логотип MySQL" style={{width: '3rem', height: 'auto'}}/>               |DBMS| Private Beta | Настройте ClickPipes и начните приём данных из MySQL в ClickHouse Cloud.                      |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="Логотип MongoDB" style={{width: '3rem', height: 'auto'}}/>           |DBMS| Private Preview | Настройте ClickPipes и начните приём данных из MongoDB в ClickHouse Cloud.                   |

## Интеграции клиентских библиотек для языков программирования \{#language-client-integrations\}

ClickHouse предлагает ряд интеграций клиентских библиотек для различных языков программирования, документация по каждой из которых приведена по ссылкам ниже.

| Страница                                                                | Описание                                                                         |
|-------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| [C++](/interfaces/cpp)                                                  | Клиентская библиотека C++ и асинхронный фреймворк userver                       |
| [C#](/integrations/csharp)                                              | Узнайте, как подключить ваши проекты на C# к ClickHouse.                        |
| [Go](/integrations/go)                                                  | Узнайте, как подключить ваши проекты на Go к ClickHouse.                        |
| [JavaScript](/integrations/javascript)                                  | Узнайте, как подключить ваши JS‑проекты к ClickHouse с помощью официального JS‑клиента. |
| [Java](/integrations/java)                                              | Узнайте больше о нескольких интеграциях для Java и ClickHouse.                  |
| [Python](/integrations/python)                                          | Узнайте, как подключить ваши проекты на Python к ClickHouse.                    |
| [Rust](/integrations/rust)                                              | Узнайте, как подключить ваши проекты на Rust к ClickHouse.                      |
| [Сторонние клиенты](/interfaces/third-party/client-libraries)           | Узнайте больше о клиентских библиотеках от сторонних разработчиков.             |

Помимо ClickPipes и клиентских библиотек для языков программирования, ClickHouse поддерживает множество других интеграций, включая базовые интеграции,
интеграции с партнёрами и интеграции от сообщества.
Полный список см. в разделе документации ["Интеграции"](/integrations).