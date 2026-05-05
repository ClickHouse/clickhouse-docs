---
sidebar_label: 'Введение'
description: 'Бесшовно подключайте внешние источники данных к ClickHouse Cloud.'
slug: /integrations/clickpipes
title: 'Интеграция с ClickHouse Cloud'
doc_type: 'guide'
keywords: ['ClickPipes', 'платформа для ингестии данных', 'потоковые данные', 'интеграционная платформа', 'ClickHouse Cloud']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
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


# Интеграция с ClickHouse Cloud \{#integrating-with-clickhouse-cloud\}

## Введение \{#introduction\}

[ClickPipes](/integrations/clickpipes) — это управляемая интеграционная платформа данных, которая делает приём данных из широкого спектра источников таким же простым, как несколько щелчков мышью. Разработанная для самых требовательных нагрузок, надёжная и масштабируемая архитектура ClickPipes обеспечивает стабильную производительность и отказоустойчивость. ClickPipes можно использовать как для долгосрочных сценариев потоковой передачи данных, так и для разовых задач по загрузке данных.

ClickPipes можно развернуть и администрировать вручную через интерфейс ClickPipes, а также программно с помощью [OpenAPI](/integrations/clickpipes/programmatic-access/openapi) и [Terraform](/integrations/clickpipes/programmatic-access/terraform).

<Image img={clickpipes_stack} alt="Стек ClickPipes" size="lg" border />

## Поддерживаемые источники данных \{#supported-data-sources\}

| Название                                           | Логотип                                                                                          |Тип| Статус          | Описание                                                                                             |
|----------------------------------------------------|--------------------------------------------------------------------------------------------------|----|------------------|------------------------------------------------------------------------------------------------------|
| [Apache Kafka](/integrations/clickpipes/kafka)     | <Kafkasvg class="image" alt="Логотип Apache Kafka" style={{width: '3rem', 'height': '3rem'}}/>   |Streaming| Стабильно        | Настройте ClickPipes и начните приём потоковых данных из Apache Kafka в ClickHouse Cloud.           |
| Confluent Cloud                                    | <Confluentsvg class="image" alt="Логотип Confluent Cloud" style={{width: '3rem'}}/>              |Streaming| Стабильно        | Используйте совместные возможности Confluent и ClickHouse Cloud благодаря нашей прямой интеграции.  |
| Redpanda                                           | <Image img={redpanda_logo} size="logo" alt="Логотип Redpanda"/>                                  |Streaming| Стабильно        | Настройте ClickPipes и начните приём потоковых данных из Redpanda в ClickHouse Cloud.               |
| AWS MSK                                            | <Msksvg class="image" alt="Логотип AWS MSK" style={{width: '3rem', 'height': '3rem'}}/>          |Streaming| Стабильно        | Настройте ClickPipes и начните приём потоковых данных из AWS MSK в ClickHouse Cloud.                |
| Azure Event Hubs                                   | <Azureeventhubssvg class="image" alt="Логотип Azure Event Hubs" style={{width: '3rem'}}/>        |Streaming| Стабильно        | Настройте ClickPipes и начните приём потоковых данных из Azure Event Hubs в ClickHouse Cloud. См. [Azure Event Hubs FAQ](/integrations/clickpipes/kafka/faq/#azure-eventhubs) для получения рекомендаций. |
| WarpStream                                         | <Warpstreamsvg class="image" alt="Логотип WarpStream" style={{width: '3rem'}}/>                  |Streaming| Стабильно        | Настройте ClickPipes и начните приём потоковых данных из WarpStream в ClickHouse Cloud.             |
| Amazon S3                                          | <S3svg class="image" alt="Логотип Amazon S3" style={{width: '3rem', height: 'auto'}}/>           |Object Storage| Стабильно        | Настройте ClickPipes для приёма больших объёмов данных из объектного хранилища.                     |
| Google Cloud Storage                               | <Gcssvg class="image" alt="Логотип Google Cloud Storage" style={{width: '3rem', height: 'auto'}}/> |Object Storage| Стабильно        | Настройте ClickPipes для приёма больших объёмов данных из объектного хранилища.                     |
| DigitalOcean Spaces                                | <DOsvg class="image" alt="Логотип Digital Ocean" style={{width: '3rem', height: 'auto'}}/> | Object Storage | Стабильно | Настройте ClickPipes для приёма больших объёмов данных из объектного хранилища.
| Azure Blob Storage                                 | <ABSsvg class="image" alt="Логотип Azure Blob Storage" style={{width: '3rem', height: 'auto'}}/> | Object Storage | Стабильно | Настройте ClickPipes для приёма больших объёмов данных из объектного хранилища.
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <Amazonkinesis class="image" alt="Логотип Amazon Kenesis" style={{width: '3rem', height: 'auto'}}/> |Streaming| Стабильно        | Настройте ClickPipes и начните приём потоковых данных из Amazon Kinesis в ClickHouse Cloud.         |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Логотип Postgres" style={{width: '3rem', height: 'auto'}}/>      |DBMS| Стабильно   | Настройте ClickPipes и начните приём данных из Postgres в ClickHouse Cloud.                         |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="Логотип MySQL" style={{width: '3rem', height: '3rem'}}/>            |DBMS| Публичная бета | Настройте ClickPipes и начните приём данных из MySQL в ClickHouse Cloud.                            |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="Логотип MongoDB" style={{width: '3rem', height: '3rem'}}/>        |DBMS| Закрытая предварительная версия | Настройте ClickPipes и начните приём данных из MongoDB в ClickHouse Cloud.                   |

В ClickPipes будут добавляться новые коннекторы; подробнее можно узнать, [связавшись с нами](https://clickhouse.com/company/contact?loc=clickpipes).

## Список статических IP-адресов \{#list-of-static-ips\}

Ниже приведены статические NAT IP-адреса (разделённые по регионам), которые ClickPipes использует для подключения к вашим внешним сервисам. Добавьте IP-адреса региона, соответствующего вашему экземпляру, в список разрешённых IP-адресов, чтобы разрешить трафик. В случае пайпов Объектного хранилища вам также следует добавить [IP-адреса кластера ClickHouse](/manage/data-sources/cloud-endpoints-api) в список разрешённых IP-адресов.

Для всех сервисов трафик ClickPipes будет исходить из региона по умолчанию, определяемого на основе расположения вашего сервиса:

* **eu-central-1**: Для всех регионов ЕС, явно не перечисленных (включая регионы GCP и Azure в ЕС).
* **eu-west-1**: Для всех сервисов в AWS `eu-west-1`, созданных 20 января 2026 г. или позднее (сервисы, созданные до этой даты, используют IP-адреса `eu-central-1`).
* **us-east-1**: Для всех сервисов в AWS `us-east-1`.
* **ap-south-1**: Для сервисов в AWS `ap-south-1`, созданных 25 июня 2025 г. или позднее (сервисы, созданные до этой даты, используют IP-адреса `us-east-2`).
* **ap-northeast-2**: Для сервисов в AWS `ap-northeast-2`, созданных 14 ноября 2025 г. или позднее (сервисы, созданные до этой даты, используют IP-адреса `us-east-2`).
* **af-south-1**: Для сервисов в AWS `af-south-1`, созданных 15 апреля 2026 г. или позднее (сервисы, созданные до этой даты, используют IP-адреса `us-east-2`).
* **ap-east-1**: Для сервисов в AWS `ap-east-1`, созданных 15 апреля 2026 г. или позднее (сервисы, созданные до этой даты, используют IP-адреса `us-east-2`).
* **ap-northeast-1**: Для сервисов в AWS `ap-northeast-1`, созданных 15 апреля 2026 г. или позднее (сервисы, созданные до этой даты, используют IP-адреса `us-east-2`).
* **ap-southeast-1**: Для сервисов в AWS `ap-southeast-1`, созданных 18 марта 2026 г. или позднее (сервисы, созданные до этой даты, используют IP-адреса `us-east-2`).
* **ap-southeast-2**: Для сервисов в AWS `ap-southeast-2`, созданных 25 июня 2025 г. или позднее (сервисы, созданные до этой даты, используют IP-адреса `us-east-2`).
* **ap-southeast-3**: Для сервисов в AWS `ap-southeast-3`, созданных 6 марта 2026 г. или позднее (сервисы, созданные до этой даты, используют IP-адреса `us-east-2`).
* **ca-central-1**: Для сервисов в AWS `ca-central-1`, созданных 15 апреля 2026 г. или позднее (сервисы, созданные до этой даты, используют IP-адреса `us-east-2`).
* **eu-north-1**: Для сервисов в AWS `eu-north-1`, созданных 15 апреля 2026 г. или позднее (сервисы, созданные до этой даты, используют IP-адреса `eu-central-1`).
* **eu-west-2**: Для сервисов в AWS `eu-west-2`, созданных 15 апреля 2026 г. или позднее (сервисы, созданные до этой даты, используют IP-адреса `eu-central-1`).
* **il-central-1**: Для сервисов в AWS `il-central-1`, созданных 15 апреля 2026 г. или позднее (сервисы, созданные до этой даты, используют IP-адреса `us-east-2`).
* **sa-east-1**: Для сервисов в AWS `sa-east-1`, созданных 15 апреля 2026 г. или позднее (сервисы, созданные до этой даты, используют IP-адреса `us-east-2`).
* **us-west-2**: Для сервисов в AWS `us-west-2`, созданных 24 июня 2025 г. или позднее (сервисы, созданные до этой даты, используют IP-адреса `us-east-2`).
* **us-east-2**: Для всех остальных регионов, явно не перечисленных (включая регионы GCP и Azure).

| Регион AWS                                         | IP-адреса                                                                                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **eu-central-1** - Франкфурт                       | `18.195.233.217`, `3.127.86.90`, `35.157.23.2`, `18.197.167.47`, `3.122.25.29`, `52.28.148.40`                                              |
| **eu-west-1** - Ирландия (с 20 января 2026 г.)     | `54.228.1.92`, `54.72.101.254`, `54.228.16.208`, `54.76.200.104`, `52.211.2.177`, `54.77.10.134`                                            |
| **us-east-1** - Северная Вирджиния                 | `54.82.38.199`, `3.90.133.29`, `52.5.177.8`, `3.227.227.145`, `3.216.6.184`, `54.84.202.92`, `3.131.130.196`, `3.23.172.68`, `3.20.208.150` |
| **us-east-2** - Огайо                              | `3.131.130.196`, `3.23.172.68`, `3.20.208.150`, `3.132.20.192`, `18.119.76.110`, `3.134.185.180`                                            |
| **ap-south-1** - Мумбаи (с 25 июня 2025 г.)        | `13.203.140.189`, `13.232.213.12`, `13.235.145.208`, `35.154.167.40`, `65.0.39.245`, `65.1.225.89`                                          |
| **ap-northeast-2** - Сеул (с 14 ноября 2025 г.)    | `3.38.68.69`, `52.78.68.128`, `13.209.152.13`, `3.38.24.84`, `3.37.159.31`, `3.34.25.104`                                                   |
| **ap-southeast-1** - Сингапур (с 18 марта 2026 г.) | `13.215.65.134`, `18.139.118.108`, `47.130.197.47`, `54.251.134.219`, `54.254.98.29`, `54.255.153.106`                                      |
| **ap-southeast-2** - Сидней (с 25 июня 2025 г.)    | `3.106.48.103`, `52.62.168.142`, `13.55.113.162`, `3.24.61.148`, `54.206.77.184`, `54.79.253.17`                                            |
| **af-south-1** - Кейптаун (с 15 апреля 2026 г.)    | `13.245.187.24`, `15.240.60.178`, `15.240.81.191`, `13.245.25.101`, `13.245.91.225`, `15.240.54.195`                                        |
| **ap-east-1** - Гонконг (с 15 апреля 2026 г.)      | `18.166.168.168`, `43.199.224.85`, `95.40.0.242`, `16.162.107.229`, `43.199.125.240`, `54.46.86.27`                                         |
| **ap-northeast-1** - Токио (с 15 апреля 2026 г.)   | `54.168.88.92`, `35.76.97.79`, `54.64.100.89`, `54.178.40.17`, `52.195.101.208`, `13.193.109.245`                                           |
| **ap-southeast-1** - Сингапур (с 18 марта 2026 г.) | `47.130.197.47`, `54.251.134.219`, `18.139.118.108`, `54.255.153.106`, `54.254.98.29`, `13.215.65.134`                                      |
| **ap-southeast-3** - Джакарта (с 6 марта 2026 г.)  | `16.78.195.195`, `43.218.184.235`, `16.79.88.54`, `16.78.153.162`, `16.79.6.125`, `108.137.52.155`                                          |
| **ca-central-1** - Канада (с 15 апреля 2026 г.)    | `52.60.123.235`, `3.97.222.98`, `3.99.62.248`, `15.223.61.186`, `3.96.255.101`, `3.97.29.96`                                                |
| **eu-north-1** - Стокгольм (с 15 апреля 2026 г.)   | `13.63.1.65`, `16.171.127.30`, `56.228.76.44`, `13.63.101.248`, `16.170.124.188`, `13.60.109.201`                                           |
| **eu-west-2** - Лондон (с 15 апреля 2026 г.)       | `13.134.82.158`, `16.60.209.167`, `18.134.221.203`, `16.60.139.176`, `13.43.66.75`, `3.11.78.183`                                           |
| **il-central-1** - Тель-Авив (с 15 апреля 2026 г.) | `16.164.25.13`, `51.84.162.29`, `51.85.90.183`, `51.84.36.146`, `51.84.72.29`, `51.85.28.184`                                               |
| **sa-east-1** - Сан-Паулу (с 15 апреля 2026 г.)    | `18.230.164.131`, `56.126.1.234`, `18.230.39.24`, `15.229.102.116`, `18.230.174.204`, `18.229.237.116`                                      |
| **us-west-2** - Орегон (с 24 июня 2025 г.)         | `52.42.100.5`, `44.242.47.162`, `52.40.44.52`, `44.227.206.163`, `44.246.241.23`, `35.83.230.19`                                            |

## Настройка параметров ClickHouse \{#adjusting-clickhouse-settings\}

ClickHouse Cloud предоставляет подходящие значения по умолчанию для большинства сценариев. Однако, если вам нужно изменить некоторые настройки ClickHouse для целевых таблиц ClickPipes, наиболее гибким решением будет использование отдельной роли для ClickPipes.
Шаги:

1. создайте пользовательскую роль `CREATE ROLE my_clickpipes_role SETTINGS ...`. Смотрите синтаксис [CREATE ROLE](/sql-reference/statements/create/role.md) для получения подробной информации.
2. добавьте эту пользовательскую роль пользователю ClickPipes на шаге `Details and Settings` при создании ClickPipes.

<Image img={cp_custom_role} alt="Назначение пользовательской роли" size="lg" border/>

## Настройка расширенных настроек ClickPipes \{#clickpipes-advanced-settings\}

ClickPipes предоставляет разумные значения по умолчанию, которые соответствуют требованиям большинства сценариев использования. Если в вашем случае требуется дополнительная тонкая настройка, вы можете изменить следующие настройки:

### ClickPipes для объектного хранилища \{#clickpipes-advanced-settings-object-storage\}

| Параметр                             | Значение по умолчанию | Описание                                                                                                                                         |
| ------------------------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Max insert bytes`                   | 10 GB                 | Количество байт, обрабатываемых в одном пакете вставки.                                                                                          |
| `Max file count`                     | 100                   | Максимальное количество файлов, обрабатываемых в одном пакете вставки.                                                                           |
| `Max threads`                        | auto(3)               | [Максимальное количество параллельных потоков](/operations/settings/settings#max_threads) для обработки файлов.                                  |
| `Max insert threads`                 | 1                     | [Максимальное количество параллельных потоков вставки](/operations/settings/settings#max_insert_threads) для обработки файлов.                   |
| `Min insert block size bytes`        | 1 GB                  | [Минимальный размер блока в байтах](/operations/settings/settings#min_insert_block_size_bytes), который может быть вставлен в таблицу.           |
| `Max download threads`               | 4                     | [Максимальное количество параллельных потоков загрузки](/operations/settings/settings#max_download_threads).                                     |
| `Object storage polling interval`    | 30 s                  | Определяет максимальный интервал ожидания перед вставкой данных в кластер ClickHouse.                                                            |
| `Parallel distributed insert select` | 2                     | [Параметр parallel&#95;distributed&#95;insert&#95;select](/operations/settings/settings#parallel_distributed_insert_select).                     |
| `Parallel view processing`           | false                 | Включать ли отправку в присоединённые представления [параллельно, а не последовательно](/operations/settings/settings#parallel_view_processing). |
| `Use cluster function`               | true                  | Обрабатывать ли файлы параллельно на нескольких узлах.                                                                                           |

<Image img={cp_advanced_settings} alt="Расширенные настройки для ClickPipes" size="lg" border />

### Потоковые ClickPipes \{#clickpipes-advanced-settings-streaming\}

| Параметр                         | Значение по умолчанию | Описание                                                                            |
| -------------------------------- | --------------------- | ----------------------------------------------------------------------------------- |
| `Streaming max insert wait time` | 5 s                   | Настраивает максимальное время ожидания перед вставкой данных в кластер ClickHouse. |

## Отчёт об ошибках \{#error-reporting\}

ClickPipes сохраняет ошибки в двух отдельных таблицах в зависимости от типа ошибки, возникшей во время ингестии.

### Ошибки при записи \{#record-errors\}

ClickPipes создаст таблицу рядом с целевой таблицей с постфиксом `<destination_table_name>_clickpipes_error`. В этой таблице будут содержаться все ошибки, связанные с некорректными данными или несовпадающей схемой, а также полное содержимое некорректного сообщения. Для этой таблицы установлен [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) в 7 дней.

### Системные ошибки \{#system-errors\}

Ошибки, связанные с работой ClickPipe, будут сохраняться в таблице `system.clickpipes_log`. В ней хранятся все прочие ошибки, связанные с работой вашего ClickPipe (сеть, подключение и т. д.). Для этой таблицы настроен [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 7 дней.

Если ClickPipes не удаётся подключиться к источнику данных в течение 15 минут или к приёмнику в течение 1 часа, инстанс ClickPipes останавливается и записывает соответствующее сообщение в таблицу системных ошибок (при условии, что инстанс ClickHouse доступен).

## FAQ \{#faq\}

- **Что такое ClickPipes?**

  ClickPipes — это возможность ClickHouse Cloud, которая упрощает подключение ваших сервисов ClickHouse к внешним источникам данных, в частности к Kafka. С помощью ClickPipes для Kafka вы можете легко и непрерывно загружать данные в ClickHouse, делая их доступными для аналитики в реальном времени.

- **Поддерживает ли ClickPipes преобразование данных?**

  Да, ClickPipes поддерживает базовое преобразование данных, предоставляя доступ к созданию DDL. Затем вы можете применять более продвинутые преобразования к данным по мере их загрузки в целевую таблицу в сервисе ClickHouse Cloud, используя возможность ClickHouse по работе с [materialized views](/guides/developer/cascading-materialized-views).

- **Приводит ли использование ClickPipes к дополнительным расходам?**

  ClickPipes тарифицируется по двум показателям: объём принятых данных (Ingested Data) и вычислительные ресурсы (Compute). Полная информация о ценах доступна на [этой странице](/cloud/reference/billing/clickpipes). Запуск ClickPipes также может приводить к косвенным затратам на вычисления и хранение в целевом сервисе ClickHouse Cloud, аналогично любой нагрузке на приём данных.

- **Есть ли способ обрабатывать ошибки или сбои при использовании ClickPipes для Kafka?**

  Да, ClickPipes для Kafka автоматически выполняет повторные попытки при сбоях при чтении данных из Kafka по любой операционной причине, включая сетевые проблемы, проблемы с подключением и т. п. В случае искажённых данных или недопустимой схемы ClickPipes сохранит запись в таблицу record_error и продолжит обработку.