---
'sidebar_label': 'Интеграции'
'slug': '/manage/integrations'
'title': 'Интеграции'
'description': 'Интеграции для ClickHouse'
'doc_type': 'landing-page'
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

ClickHouse Cloud позволяет вам подключать любимые инструменты и сервисы.

## Управляемые интеграционные конвейеры для ClickHouse Cloud {#clickpipes}

ClickPipes — это управляемая интеграционная платформа, которая упрощает прием данных из разнообразных источников до простого нажатия нескольких кнопок. 
Разработанная для самых требовательных рабочих нагрузок, надежная и масштабируемая архитектура ClickPipes гарантирует стабильную производительность и надежность. 
ClickPipes может использоваться как для долгосрочных потоковых нужд, так и для одноразовых задач загрузки данных.

| Название                                            | Логотип                                                                                              | Тип            | Статус           | Описание                                                                                              |
|-----------------------------------------------------|-----------------------------------------------------------------------------------------------------|----------------|------------------|-------------------------------------------------------------------------------------------------------|
| [Apache Kafka](/integrations/clickpipes/kafka)      | <Kafkasvg class="image" alt="Логотип Apache Kafka" style={{width: '3rem', 'height': '3rem'}}/>      | Потоковая      | Стабильная       | Настройте ClickPipes и начните принимать потоковые данные из Apache Kafka в ClickHouse Cloud.        |
| Confluent Cloud                                     | <Confluentsvg class="image" alt="Логотип Confluent Cloud" style={{width: '3rem'}}/>                | Потоковая      | Стабильная       | Используйте комбинированную мощь Confluent и ClickHouse Cloud через нашу прямую интеграцию.         |
| Redpanda                                            | <Image img={redpanda_logo} size="logo" alt="Логотип Redpanda"/>                                    | Потоковая      | Стабильная       | Настройте ClickPipes и начните принимать потоковые данные из Redpanda в ClickHouse Cloud.            |
| AWS MSK                                             | <Msksvg class="image" alt="Логотип AWS MSK" style={{width: '3rem', 'height': '3rem'}}/>            | Потоковая      | Стабильная       | Настройте ClickPipes и начните принимать потоковые данные из AWS MSK в ClickHouse Cloud.             |
| Azure Event Hubs                                    | <Azureeventhubssvg class="image" alt="Логотип Azure Event Hubs" style={{width: '3rem'}}/>          | Потоковая      | Стабильная       | Настройте ClickPipes и начните получать потоковые данные из Azure Event Hubs в ClickHouse Cloud.     |
| WarpStream                                          | <Warpstreamsvg class="image" alt="Логотип WarpStream" style={{width: '3rem'}}/>                    | Потоковая      | Стабильная       | Настройте ClickPipes и начните принимать потоковые данные из WarpStream в ClickHouse Cloud.          |
| Amazon S3                                           | <S3svg class="image" alt="Логотип Amazon S3" style={{width: '3rem', height: 'auto'}}/>              | Объектное хранилище | Стабильная       | Настройте ClickPipes для приема больших объемов данных из объектного хранилища.                      |
| Google Cloud Storage                                | <Gcssvg class="image" alt="Логотип Google Cloud Storage" style={{width: '3rem', height: 'auto'}}/> | Объектное хранилище | Стабильная       | Настройте ClickPipes для приема больших объемов данных из объектного хранилища.                      |
| DigitalOcean Spaces                                 | <DOsvg class="image" alt="Логотип Digital Ocean" style={{width: '3rem', height: 'auto'}}/>         | Объектное хранилище | Стабильная | Настройте ClickPipes для приема больших объемов данных из объектного хранилища.                     |
| Azure Blob Storage                                  | <ABSsvg class="image" alt="Логотип Azure Blob Storage" style={{width: '3rem', height: 'auto'}}/>   | Объектное хранилище | Приватная бета   | Настройте ClickPipes для приема больших объемов данных из объектного хранилища.                     |
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <AmazonKinesis class="image" alt="Логотип Amazon Kinesis" style={{width: '3rem', height: 'auto'}}/> | Потоковая      | Стабильная       | Настройте ClickPipes и начните принимать потоковые данные из Amazon Kinesis в ClickHouse Cloud.      |
| [Postgres](/integrations/clickpipes/postgres)       | <Postgressvg class="image" alt="Логотип Postgres" style={{width: '3rem', height: 'auto'}}/>       | СУБД           | Стабильная       | Настройте ClickPipes и начните принимать данные из Postgres в ClickHouse Cloud.                      |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="Логотип MySQL" style={{width: '3rem', height: 'auto'}}/>              | СУБД           | Приватная бета   | Настройте ClickPipes и начните принимать данные из MySQL в ClickHouse Cloud.                         |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="Логотип MongoDB" style={{width: '3rem', height: 'auto'}}/>          | СУБД           | Приватный превью  | Настройте ClickPipes и начните принимать данные из MongoDB в ClickHouse Cloud.                      |

## Интеграции клиентских языков {#language-client-integrations}

ClickHouse предлагает ряд интеграций клиентских языков, документация для каждой из которых представлена ниже.

| Страница                                                                  | Описание                                                                 |
|---------------------------------------------------------------------------|---------------------------------------------------------------------------|
| [C++](/interfaces/cpp)                                           | Библиотека клиента C++ и асинхронный фреймворк userver                   |
| [C#](/integrations/csharp)                                   | Узнайте, как подключить ваши проекты на C# к ClickHouse.                 |
| [Go](/integrations/go)                                         | Узнайте, как подключить ваши проекты на Go к ClickHouse.                 |
| [JavaScript](/integrations/javascript)                         | Узнайте, как подключить ваши JS проекты к ClickHouse с помощью официального JS клиента. |
| [Java](/integrations/java)                                     | Узнайте больше о нескольких интеграциях для Java и ClickHouse.            |
| [Python](/integrations/python)                                   | Узнайте, как подключить ваши проекты на Python к ClickHouse.              |
| [Rust](/integrations/rust)                                       | Узнайте, как подключить ваши проекты на Rust к ClickHouse.                |
| [Клиенты третьих сторон](/interfaces/third-party/client-libraries) | Узнайте больше о библиотеках клиентов от сторонних разработчиков.         |

В дополнение к ClickPipes и клиентским языкам, ClickHouse поддерживает множество других интеграций, охватывающих основные интеграции, интеграции партнеров и интеграции сообщества. 
Для получения полного списка смотрите раздел ["Интеграции"](/integrations) документации.
