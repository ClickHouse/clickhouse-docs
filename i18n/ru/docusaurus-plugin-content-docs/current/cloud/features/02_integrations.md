---
sidebar_label: 'Интеграции'
slug: /manage/integrations
title: 'Интеграции'
description: 'Интеграции с ClickHouse'
doc_type: 'landing-page'
keywords: ['integrations', 'cloud features', 'third-party tools', 'data sources', 'connectors']
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

ClickPipes — это управляемая платформа интеграции, которая делает загрузку данных из различных источников такой же простой, как нажатие нескольких кнопок.
Разработанная для самых требовательных рабочих нагрузок, надежная и масштабируемая архитектура ClickPipes обеспечивает стабильную производительность и надежность.
ClickPipes можно использовать как для долгосрочной потоковой передачи данных, так и для однократной загрузки.

| Название                                           | Логотип                                                                                          | Тип            | Статус          | Описание                                                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------- | --------------- | ---------------------------------------------------------------------------------------------------- |
| [Apache Kafka](/integrations/clickpipes/kafka)     | <Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>      | Потоковая передача | Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из Apache Kafka в ClickHouse Cloud.        |
| Confluent Cloud                                    | <Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>                 | Потоковая передача | Стабильный      | Раскройте объединенные возможности Confluent и ClickHouse Cloud через нашу прямую интеграцию.        |
| Redpanda                                           | <Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>                                     | Потоковая передача | Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из Redpanda в ClickHouse Cloud.            |
| AWS MSK                                            | <Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>             | Потоковая передача | Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из AWS MSK в ClickHouse Cloud.             |
| Azure Event Hubs                                   | <Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>           | Потоковая передача | Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из Azure Event Hubs в ClickHouse Cloud.    |
| WarpStream                                         | <Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>                     | Потоковая передача | Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из WarpStream в ClickHouse Cloud.          |
| Amazon S3                                          | <S3svg class="image" alt="Amazon S3 logo" style={{width: '3rem', height: 'auto'}}/>              | Объектное хранилище | Стабильный      | Настройте ClickPipes для загрузки больших объемов данных из объектного хранилища.                    |
| Google Cloud Storage                               | <Gcssvg class="image" alt="Google Cloud Storage logo" style={{width: '3rem', height: 'auto'}}/>  | Объектное хранилище | Стабильный      | Настройте ClickPipes для загрузки больших объемов данных из объектного хранилища.                    |
| DigitalOcean Spaces                                | <DOsvg class="image" alt="Digital Ocean logo" style={{width: '3rem', height: 'auto'}}/>          | Объектное хранилище | Стабильный      | Настройте ClickPipes для загрузки больших объемов данных из объектного хранилища.                    |
| Azure Blob Storage                                 | <ABSsvg class="image" alt="Azure Blob Storage logo" style={{width: '3rem', height: 'auto'}}/>    | Объектное хранилище | Закрытая бета   | Настройте ClickPipes для загрузки больших объемов данных из объектного хранилища.                    |
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <AmazonKinesis class="image" alt="Amazon Kinesis logo" style={{width: '3rem', height: 'auto'}}/> | Потоковая передача | Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из Amazon Kinesis в ClickHouse Cloud.      |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Postgres logo" style={{width: '3rem', height: 'auto'}}/>         | СУБД           | Стабильный      | Настройте ClickPipes и начните загружать данные из Postgres в ClickHouse Cloud.                      |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="MySQL logo" style={{width: '3rem', height: 'auto'}}/>               | СУБД           | Закрытая бета   | Настройте ClickPipes и начните загружать данные из MySQL в ClickHouse Cloud.                         |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="MongoDB logo" style={{width: '3rem', height: 'auto'}}/>           | СУБД           | Закрытый предварительный просмотр | Настройте ClickPipes и начните загружать данные из MongoDB в ClickHouse Cloud.                       |


## Интеграции языковых клиентов {#language-client-integrations}

ClickHouse предлагает ряд интеграций клиентских библиотек для различных языков программирования. Документация по каждой из них приведена ниже.

| Страница                                                        | Описание                                                                         |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [C++](/interfaces/cpp)                                          | Клиентская библиотека C++ и асинхронный фреймворк userver                       |
| [C#](/integrations/csharp)                                      | Узнайте, как подключить проекты на C# к ClickHouse.                             |
| [Go](/integrations/go)                                          | Узнайте, как подключить проекты на Go к ClickHouse.                             |
| [JavaScript](/integrations/javascript)                          | Узнайте, как подключить проекты на JS к ClickHouse с помощью официального JS-клиента. |
| [Java](/integrations/java)                                      | Узнайте больше о различных интеграциях для Java и ClickHouse.                   |
| [Python](/integrations/python)                                  | Узнайте, как подключить проекты на Python к ClickHouse.                         |
| [Rust](/integrations/rust)                                      | Узнайте, как подключить проекты на Rust к ClickHouse.                           |
| [Сторонние клиенты](/interfaces/third-party/client-libraries)  | Узнайте больше о клиентских библиотеках от сторонних разработчиков.             |

Помимо ClickPipes и языковых клиентов, ClickHouse поддерживает множество других интеграций, включая основные интеграции,
партнерские интеграции и интеграции сообщества.
Полный список см. в разделе [«Интеграции»](/integrations) документации.
