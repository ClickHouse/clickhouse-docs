---
sidebar_label: 'Интеграции'
slug: /manage/integrations
title: 'Интеграции'
description: 'Интеграции для ClickHouse'
doc_type: 'landing-page'
keywords: ['интеграции', 'возможности облака', 'сторонние инструменты', 'источники данных', 'коннекторы']
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

ClickHouse Cloud позволяет подключать ваши любимые инструменты и сервисы.


## Управляемые конвейеры интеграции для ClickHouse Cloud {#clickpipes}

ClickPipes — это управляемая платформа интеграции, которая делает приём данных из широкого спектра источников таким же простым, как несколько кликов мышью.
Разработанная для самых требовательных нагрузок, масштабируемая и отказоустойчивая архитектура ClickPipes обеспечивает стабильную производительность и надёжность.
ClickPipes можно использовать как для долгосрочных сценариев потоковой передачи данных, так и для разовых задач загрузки данных.

| Name                                               | Logo                                                                                             |Type| Status           | Description                                                                                          |
|----------------------------------------------------|--------------------------------------------------------------------------------------------------|----|------------------|------------------------------------------------------------------------------------------------------|
| [Apache Kafka](/integrations/clickpipes/kafka)     | <Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>      |Streaming| Stable           | Настройте ClickPipes и начните приём потоковых данных из Apache Kafka в ClickHouse Cloud.           |
| Confluent Cloud                                    | <Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>                 |Streaming| Stable           | Раскройте совместные возможности Confluent и ClickHouse Cloud с помощью нашей прямой интеграции.    |
| Redpanda                                           | <Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>                                     |Streaming| Stable           | Настройте ClickPipes и начните приём потоковых данных из Redpanda в ClickHouse Cloud.               |
| AWS MSK                                            | <Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>             |Streaming| Stable           | Настройте ClickPipes и начните приём потоковых данных из AWS MSK в ClickHouse Cloud.                |
| Azure Event Hubs                                   | <Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>           |Streaming| Stable           | Настройте ClickPipes и начните приём потоковых данных из Azure Event Hubs в ClickHouse Cloud.       |
| WarpStream                                         | <Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>                     |Streaming| Stable           | Настройте ClickPipes и начните приём потоковых данных из WarpStream в ClickHouse Cloud.             |
| Amazon S3                                          | <S3svg class="image" alt="Amazon S3 logo" style={{width: '3rem', height: 'auto'}}/>              |Object Storage| Stable           | Настройте ClickPipes для приёма больших объёмов данных из объектного хранилища.                     |
| Google Cloud Storage                               | <Gcssvg class="image" alt="Google Cloud Storage logo" style={{width: '3rem', height: 'auto'}}/>  |Object Storage| Stable           | Настройте ClickPipes для приёма больших объёмов данных из объектного хранилища.                     |
| DigitalOcean Spaces                                | <DOsvg class="image" alt="Digital Ocean logo" style={{width: '3rem', height: 'auto'}}/>          | Object Storage | Stable | Настройте ClickPipes для приёма больших объёмов данных из объектного хранилища.
| Azure Blob Storage                                 | <ABSsvg class="image" alt="Azure Blob Storage logo" style={{width: '3rem', height: 'auto'}}/>    | Object Storage | Private Beta | Настройте ClickPipes для приёма больших объёмов данных из объектного хранилища.
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <AmazonKinesis class="image" alt="Amazon Kinesis logo" style={{width: '3rem', height: 'auto'}}/> |Streaming| Stable           | Настройте ClickPipes и начните приём потоковых данных из Amazon Kinesis в ClickHouse Cloud.         |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Postgres logo" style={{width: '3rem', height: 'auto'}}/>         |DBMS| Stable      | Настройте ClickPipes и начните приём данных из Postgres в ClickHouse Cloud.                         |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="MySQL logo" style={{width: '3rem', height: 'auto'}}/>               |DBMS| Private Beta | Настройте ClickPipes и начните приём данных из MySQL в ClickHouse Cloud.                            |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="MongoDB logo" style={{width: '3rem', height: 'auto'}}/>           |DBMS| Private Preview | Настройте ClickPipes и начните приём данных из MongoDB в ClickHouse Cloud.                         |



## Интеграции клиентов для языков программирования {#language-client-integrations}

ClickHouse предлагает ряд клиентских библиотек для различных языков программирования; ссылки на документацию по каждой из них приведены ниже.

| Page                                                                    | Description                                                                      |
|-------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| [C++](/interfaces/cpp)                                          | Клиентская библиотека C++ и асинхронный фреймворк userver                        |
| [C#](/integrations/csharp)                                  | Узнайте, как подключить проекты на C# к ClickHouse.                         |
| [Go](/integrations/go)                                          | Узнайте, как подключить проекты на Go к ClickHouse.                             |
| [JavaScript](/integrations/javascript)                          | Узнайте, как подключить проекты на JS к ClickHouse с помощью официального JS‑клиента. |
| [Java](/integrations/java)                                      | Узнайте больше о нескольких интеграциях для Java и ClickHouse.                   |
| [Python](/integrations/python)                                  | Узнайте, как подключить проекты на Python к ClickHouse.                         |
| [Rust](/integrations/rust)                                      | Узнайте, как подключить проекты на Rust к ClickHouse.                           |
| [Сторонние клиенты](/interfaces/third-party/client-libraries) | Узнайте больше о клиентских библиотеках от сторонних разработчиков.              |

Помимо ClickPipes и клиентов для языков программирования, ClickHouse поддерживает множество других интеграций, включая базовые интеграции, интеграции с партнёрами и интеграции от сообщества.
Полный список смотрите в разделе документации [«Integrations»](/integrations).