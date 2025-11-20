---
sidebar_label: 'Введение'
description: 'Легко подключайте внешние источники данных к ClickHouse Cloud.'
slug: /integrations/clickpipes
title: 'Интеграция с ClickHouse Cloud'
doc_type: 'guide'
keywords: ['ClickPipes', 'платформа загрузки данных', 'потоковые данные', 'интеграционная платформа', 'ClickHouse Cloud']
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import Amazonkinesis from '@site/static/images/integrations/logos/amazon_kinesis_logo.svg';
import Gcssvg from '@site/static/images/integrations/logos/gcs.svg';
import DOsvg from '@site/static/images/integrations/logos/digitalocean.svg';
import ABSsvg from '@site/static/images/integrations/logos/azureblobstorage.svg';
import Postgressvg from '@site/static/images/integrations/logos/postgresql.svg';
import Mysqlsvg from '@site/static/images/integrations/logos/mysql.svg';
import Mongodbsvg from '@site/static/images/integrations/logos/mongodb.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import clickpipes_stack from '@site/static/images/integrations/data-ingestion/clickpipes/clickpipes_stack.png';
import cp_custom_role from '@site/static/images/integrations/data-ingestion/clickpipes/cp_custom_role.png';
import cp_advanced_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_advanced_settings.png';
import Image from '@theme/IdealImage';


# Интеграция с ClickHouse Cloud



## Введение {#introduction}

[ClickPipes](/integrations/clickpipes) — это управляемая платформа интеграции, которая упрощает загрузку данных из различных источников до нескольких нажатий кнопки. Разработанная для самых требовательных рабочих нагрузок, надёжная и масштабируемая архитектура ClickPipes обеспечивает стабильную производительность и отказоустойчивость. ClickPipes можно использовать как для долгосрочной потоковой передачи данных, так и для однократной загрузки.

<Image img={clickpipes_stack} alt='Стек ClickPipes' size='lg' border />


## Поддерживаемые источники данных {#supported-data-sources}

| Название                                           | Логотип                                                                                          | Тип            | Статус          | Описание                                                                                                                                                                                               |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Apache Kafka](/integrations/clickpipes/kafka)     | <Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>      | Потоковая передача      | Стабильный          | Настройте ClickPipes и начните загружать потоковые данные из Apache Kafka в ClickHouse Cloud.                                                                                                       |
| Confluent Cloud                                    | <Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>                 | Потоковая передача      | Стабильный          | Раскройте всю мощь совместного использования Confluent и ClickHouse Cloud благодаря нашей прямой интеграции.                                                                                                            |
| Redpanda                                           | <Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>                                     | Потоковая передача      | Стабильный          | Настройте ClickPipes и начните загружать потоковые данные из Redpanda в ClickHouse Cloud.                                                                                                           |
| AWS MSK                                            | <Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>             | Потоковая передача      | Стабильный          | Настройте ClickPipes и начните загружать потоковые данные из AWS MSK в ClickHouse Cloud.                                                                                                            |
| Azure Event Hubs                                   | <Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>           | Потоковая передача      | Стабильный          | Настройте ClickPipes и начните загружать потоковые данные из Azure Event Hubs в ClickHouse Cloud. См. [FAQ по Azure Event Hubs](/integrations/clickpipes/kafka/faq/#azure-eventhubs) для получения дополнительной информации. |
| WarpStream                                         | <Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>                     | Потоковая передача      | Стабильный          | Настройте ClickPipes и начните загружать потоковые данные из WarpStream в ClickHouse Cloud.                                                                                                         |
| Amazon S3                                          | <S3svg class="image" alt="Amazon S3 logo" style={{width: '3rem', height: 'auto'}}/>              | Объектное хранилище | Стабильный          | Настройте ClickPipes для загрузки больших объёмов данных из объектного хранилища.                                                                                                                              |
| Google Cloud Storage                               | <Gcssvg class="image" alt="Google Cloud Storage logo" style={{width: '3rem', height: 'auto'}}/>  | Объектное хранилище | Стабильный          | Настройте ClickPipes для загрузки больших объёмов данных из объектного хранилища.                                                                                                                              |
| DigitalOcean Spaces                                | <DOsvg class="image" alt="Digital Ocean logo" style={{width: '3rem', height: 'auto'}}/>          | Объектное хранилище | Стабильный          | Настройте ClickPipes для загрузки больших объёмов данных из объектного хранилища.                                                                                                                              |
| Azure Blob Storage                                 | <ABSsvg class="image" alt="Azure Blob Storage logo" style={{width: '3rem', height: 'auto'}}/>    | Объектное хранилище | Стабильный          | Настройте ClickPipes для загрузки больших объёмов данных из объектного хранилища.                                                                                                                              |
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <Amazonkinesis class="image" alt="Amazon Kenesis logo" style={{width: '3rem', height: 'auto'}}/> | Потоковая передача      | Стабильный          | Настройте ClickPipes и начните загружать потоковые данные из Amazon Kinesis в ClickHouse Cloud.                                                                                                     |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Postgres logo" style={{width: '3rem', height: 'auto'}}/>         | СУБД           | Стабильный          | Настройте ClickPipes и начните загружать данные из Postgres в ClickHouse Cloud.                                                                                                                     |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="MySQL logo" style={{width: '3rem', height: '3rem'}}/>               | СУБД           | Публичная бета-версия     | Настройте ClickPipes и начните загружать данные из MySQL в ClickHouse Cloud.                                                                                                                        |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="MongoDB logo" style={{width: '3rem', height: '3rem'}}/>           | СУБД           | Закрытый предпросмотр | Настройте ClickPipes и начните загружать данные из MongoDB в ClickHouse Cloud.                                                                                                                      |

В ClickPipes будут добавлены дополнительные коннекторы. Узнать больше можно, [связавшись с нами](https://clickhouse.com/company/contact?loc=clickpipes).


## Список статических IP-адресов {#list-of-static-ips}

Ниже приведены статические NAT IP-адреса (по регионам), которые ClickPipes использует для подключения к внешним сервисам. Добавьте IP-адреса региона вашего экземпляра в список разрешённых IP-адресов для обеспечения доступа.

Для всех сервисов трафик ClickPipes исходит из региона по умолчанию в зависимости от расположения вашего сервиса:

- **eu-central-1**: для всех сервисов в регионах ЕС (включая регионы ЕС в GCP и Azure).
- **us-east-1**: для всех сервисов в AWS `us-east-1`.
- **ap-south-1**: для сервисов в AWS `ap-south-1`, созданных 25 июня 2025 года или позже (сервисы, созданные до этой даты, используют IP-адреса `us-east-2`).
- **ap-northeast-2**: для сервисов в AWS `ap-northeast-2`, созданных 14 ноября 2025 года или позже (сервисы, созданные до этой даты, используют IP-адреса `us-east-2`).
- **ap-southeast-2**: для сервисов в AWS `ap-southeast-2`, созданных 25 июня 2025 года или позже (сервисы, созданные до этой даты, используют IP-адреса `us-east-2`).
- **us-west-2**: для сервисов в AWS `us-west-2`, созданных 24 июня 2025 года или позже (сервисы, созданные до этой даты, используют IP-адреса `us-east-2`).
- **us-east-2**: для всех остальных регионов, не указанных явно (включая регионы США в GCP и Azure).

| Регион AWS                            | IP-адреса                                                                                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **eu-central-1**                      | `18.195.233.217`, `3.127.86.90`, `35.157.23.2`, `18.197.167.47`, `3.122.25.29`, `52.28.148.40`                                              |
| **us-east-1**                         | `54.82.38.199`, `3.90.133.29`, `52.5.177.8`, `3.227.227.145`, `3.216.6.184`, `54.84.202.92`, `3.131.130.196`, `3.23.172.68`, `3.20.208.150` |
| **us-east-2**                         | `3.131.130.196`, `3.23.172.68`, `3.20.208.150`, `3.132.20.192`, `18.119.76.110`, `3.134.185.180`                                            |
| **ap-south-1** (с 25 июня 2025)       | `13.203.140.189`, `13.232.213.12`, `13.235.145.208`, `35.154.167.40`, `65.0.39.245`, `65.1.225.89`                                          |
| **ap-northeast-2** (с 14 ноября 2025) | `3.38.68.69`, `52.78.68.128`, `13.209.152.13`, `3.38.24.84`, `3.37.159.31`, `3.34.25.104`                                                   |
|  |
| **ap-southeast-2** (с 25 июня 2025)   | `3.106.48.103`, `52.62.168.142`, `13.55.113.162`, `3.24.61.148`, `54.206.77.184`, `54.79.253.17`                                            |
| **us-west-2** (с 24 июня 2025)        | `52.42.100.5`, `44.242.47.162`, `52.40.44.52`, `44.227.206.163`, `44.246.241.23`, `35.83.230.19`                                            |


## Настройка параметров ClickHouse {#adjusting-clickhouse-settings}

ClickHouse Cloud предоставляет оптимальные значения по умолчанию для большинства сценариев использования. Однако если вам необходимо настроить некоторые параметры ClickHouse для целевых таблиц ClickPipes, наиболее гибким решением будет создание выделенной роли для ClickPipes.
Шаги:

1. создайте пользовательскую роль `CREATE ROLE my_clickpipes_role SETTINGS ...`. Подробности см. в описании синтаксиса [CREATE ROLE](/sql-reference/statements/create/role.md).
2. добавьте пользовательскую роль пользователю ClickPipes на шаге `Details and Settings` при создании ClickPipes.

<Image img={cp_custom_role} alt='Назначение пользовательской роли' size='lg' border />


## Настройка расширенных параметров ClickPipes {#clickpipes-advanced-settings}

ClickPipes предоставляет разумные значения по умолчанию, которые покрывают требования большинства сценариев использования. Если ваш сценарий требует дополнительной тонкой настройки, вы можете настроить следующие параметры:

### ClickPipes для объектного хранилища {#clickpipes-advanced-settings-object-storage}

| Параметр                             | Значение по умолчанию | Описание                                                                                                                                 |
| ------------------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `Max insert bytes`                   | 10GB          | Количество байтов для обработки в одном пакете вставки.                                                                                        |
| `Max file count`                     | 100           | Максимальное количество файлов для обработки в одном пакете вставки.                                                                                |
| `Max threads`                        | auto(3)       | [Максимальное количество параллельных потоков](/operations/settings/settings#max_threads) для обработки файлов.                                      |
| `Max insert threads`                 | 1             | [Максимальное количество параллельных потоков вставки](/operations/settings/settings#max_insert_threads) для обработки файлов.                        |
| `Min insert block size bytes`        | 1GB           | [Минимальный размер блока в байтах](/operations/settings/settings#min_insert_block_size_bytes), который может быть вставлен в таблицу.         |
| `Max download threads`               | 4             | [Максимальное количество параллельных потоков загрузки](/operations/settings/settings#max_download_threads).                                        |
| `Object storage polling interval`    | 30s           | Настраивает максимальный период ожидания перед вставкой данных в кластер ClickHouse.                                                       |
| `Parallel distributed insert select` | 2             | [Настройка параллельной распределённой вставки с выборкой](/operations/settings/settings#parallel_distributed_insert_select).                             |
| `Parallel view processing`           | false         | Включить ли отправку данных в присоединённые представления [параллельно вместо последовательно](/operations/settings/settings#parallel_view_processing). |
| `Use cluster function`               | true          | Обрабатывать ли файлы параллельно на нескольких узлах.                                                                                 |

<Image
  img={cp_advanced_settings}
  alt='Расширенные параметры для ClickPipes'
  size='lg'
  border
/>

### ClickPipes для потоковой передачи {#clickpipes-advanced-settings-streaming}

| Параметр                         | Значение по умолчанию | Описание                                                                           |
| -------------------------------- | ------------- | ------------------------------------------------------------------------------------- |
| `Streaming max insert wait time` | 5s            | Настраивает максимальный период ожидания перед вставкой данных в кластер ClickHouse. |


## Отчёты об ошибках {#error-reporting}

ClickPipes сохраняет ошибки в двух отдельных таблицах в зависимости от типа ошибки, возникшей в процессе приёма данных.

### Ошибки записей {#record-errors}

ClickPipes создаёт таблицу рядом с целевой таблицей с постфиксом `<destination_table_name>_clickpipes_error`. Эта таблица содержит все ошибки, связанные с некорректными данными или несоответствием схемы, и включает полное содержимое недопустимого сообщения. Для этой таблицы установлен [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 7 дней.

### Системные ошибки {#system-errors}

Ошибки, связанные с работой ClickPipe, сохраняются в таблице `system.clickpipes_log`. В ней хранятся все остальные ошибки, связанные с работой вашего ClickPipe (сеть, подключение и т. д.). Для этой таблицы установлен [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 7 дней.

Если ClickPipes не может подключиться к источнику данных в течение 15 минут или к целевой системе в течение 1 часа, экземпляр ClickPipes останавливается и сохраняет соответствующее сообщение в таблице системных ошибок (при условии, что экземпляр ClickHouse доступен).


## Часто задаваемые вопросы {#faq}

- **Что такое ClickPipes?**

  ClickPipes — это функция ClickHouse Cloud, которая упрощает подключение сервисов ClickHouse к внешним источникам данных, в частности к Kafka. С помощью ClickPipes для Kafka пользователи могут легко организовать непрерывную загрузку данных в ClickHouse для аналитики в реальном времени.

- **Поддерживает ли ClickPipes преобразование данных?**

  Да, ClickPipes поддерживает базовое преобразование данных через возможность создания DDL. Вы можете применить более сложные преобразования к данным при их загрузке в целевую таблицу сервиса ClickHouse Cloud, используя [материализованные представления](/guides/developer/cascading-materialized-views) ClickHouse.

- **Влечет ли использование ClickPipes дополнительные расходы?**

  ClickPipes тарифицируется по двум параметрам: объем загруженных данных и вычислительные ресурсы. Полная информация о ценах доступна на [этой странице](/cloud/reference/billing/clickpipes). Работа ClickPipes также может создавать косвенные затраты на вычислительные ресурсы и хранение данных в целевом сервисе ClickHouse Cloud, как и любая другая рабочая нагрузка по загрузке данных.

- **Существует ли способ обработки ошибок или сбоев при использовании ClickPipes для Kafka?**

  Да, ClickPipes для Kafka автоматически повторяет попытки в случае сбоев при получении данных из Kafka при любых операционных проблемах, включая проблемы с сетью, подключением и т. д. В случае некорректных данных или недопустимой схемы ClickPipes сохранит запись в таблице record_error и продолжит обработку.
