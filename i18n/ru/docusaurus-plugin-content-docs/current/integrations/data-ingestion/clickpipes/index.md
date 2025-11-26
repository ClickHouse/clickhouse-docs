---
sidebar_label: 'Введение'
description: 'Без труда подключайте внешние источники данных к ClickHouse Cloud.'
slug: /integrations/clickpipes
title: 'Интеграция с ClickHouse Cloud'
doc_type: 'guide'
keywords: ['ClickPipes', 'платформа для ингестии данных', 'потоковые данные', 'интеграционная платформа', 'ClickHouse Cloud']
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

[ClickPipes](/integrations/clickpipes) — это управляемая интеграционная платформа, которая делает приём данных из широкого набора источников таким же простым, как несколько кликов. Разработанная для самых требовательных рабочих нагрузок, масштабируемая и надёжная архитектура ClickPipes обеспечивает стабильную производительность и надёжность. ClickPipes можно использовать как для долгосрочной потоковой передачи данных, так и для разовой загрузки данных.

<Image img={clickpipes_stack} alt="Стек ClickPipes" size="lg" border/>



## Поддерживаемые источники данных {#supported-data-sources}

| Название                                           | Логотип                                                                                          |Тип| Статус          | Описание                                                                                          |
|----------------------------------------------------|--------------------------------------------------------------------------------------------------|----|------------------|------------------------------------------------------------------------------------------------------|
| [Apache Kafka](/integrations/clickpipes/kafka)     | <Kafkasvg class="image" alt="Логотип Apache Kafka" style={{width: '3rem', 'height': '3rem'}}/>      |Потоковые данные| Стабильно           | Настройте ClickPipes и начните приём потоковых данных из Apache Kafka в ClickHouse Cloud.     |
| Confluent Cloud                                    | <Confluentsvg class="image" alt="Логотип Confluent Cloud" style={{width: '3rem'}}/>                 |Потоковые данные| Стабильно           | Используйте объединённые возможности Confluent и ClickHouse Cloud благодаря нашей прямой интеграции.          |
| Redpanda                                           | <Image img={redpanda_logo} size="logo" alt="Логотип Redpanda"/>                                     |Потоковые данные| Стабильно           | Настройте ClickPipes и начните приём потоковых данных из Redpanda в ClickHouse Cloud.         |
| AWS MSK                                            | <Msksvg class="image" alt="Логотип AWS MSK" style={{width: '3rem', 'height': '3rem'}}/>             |Потоковые данные| Стабильно           | Настройте ClickPipes и начните приём потоковых данных из AWS MSK в ClickHouse Cloud.          |
| Azure Event Hubs                                   | <Azureeventhubssvg class="image" alt="Логотип Azure Event Hubs" style={{width: '3rem'}}/>           |Потоковые данные| Стабильно           | Настройте ClickPipes и начните приём потоковых данных из Azure Event Hubs в ClickHouse Cloud. См. раздел [Azure Event Hubs FAQ](/integrations/clickpipes/kafka/faq/#azure-eventhubs) для получения дополнительных сведений. |
| WarpStream                                         | <Warpstreamsvg class="image" alt="Логотип WarpStream" style={{width: '3rem'}}/>                     |Потоковые данные| Стабильно           | Настройте ClickPipes и начните приём потоковых данных из WarpStream в ClickHouse Cloud.       |
| Amazon S3                                          | <S3svg class="image" alt="Логотип Amazon S3" style={{width: '3rem', height: 'auto'}}/>              |Объектное хранилище| Стабильно           | Настройте ClickPipes для приёма больших объёмов данных из объектного хранилища.                            |
| Google Cloud Storage                               | <Gcssvg class="image" alt="Логотип Google Cloud Storage" style={{width: '3rem', height: 'auto'}}/>  |Объектное хранилище| Стабильно           | Настройте ClickPipes для приёма больших объёмов данных из объектного хранилища.                            |
| DigitalOcean Spaces                                | <DOsvg class="image" alt="Логотип DigitalOcean" style={{width: '3rem', height: 'auto'}}/> | Объектное хранилище | Стабильно | Настройте ClickPipes для приёма больших объёмов данных из объектного хранилища.
| Azure Blob Storage                                 | <ABSsvg class="image" alt="Логотип Azure Blob Storage" style={{width: '3rem', height: 'auto'}}/> | Объектное хранилище | Стабильно | Настройте ClickPipes для приёма больших объёмов данных из объектного хранилища.
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <Amazonkinesis class="image" alt="Логотип Amazon Kenesis" style={{width: '3rem', height: 'auto'}}/> |Потоковые данные| Стабильно           | Настройте ClickPipes и начните приём потоковых данных из Amazon Kinesis в ClickHouse Cloud.   |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Логотип Postgres" style={{width: '3rem', height: 'auto'}}/>         |СУБД| Стабильно      | Настройте ClickPipes и начните приём данных из Postgres в ClickHouse Cloud.                   |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="Логотип MySQL" style={{width: '3rem', height: '3rem'}}/>               |СУБД| Публичная бета | Настройте ClickPipes и начните приём данных из MySQL в ClickHouse Cloud.                      |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="Логотип MongoDB" style={{width: '3rem', height: '3rem'}}/>           |СУБД| Закрытая предварительная версия | Настройте ClickPipes и начните приём данных из MongoDB в ClickHouse Cloud.                   |

В ClickPipes будут появляться новые коннекторы; подробнее вы можете узнать, [связавшись с нами](https://clickhouse.com/company/contact?loc=clickpipes).



## Список статических IP-адресов {#list-of-static-ips}

Ниже приведены статические IP-адреса NAT (разделенные по регионам), которые ClickPipes использует для подключения к вашим внешним сервисам. Добавьте IP-адреса, соответствующие региону вашего инстанса, в список разрешенных IP-адресов, чтобы разрешить трафик.

Для всех сервисов трафик ClickPipes будет исходить из региона по умолчанию, определяемого местоположением вашего сервиса:
- **eu-central-1**: Для всех сервисов в регионах ЕС (включая регионы GCP и Azure в ЕС).
- **us-east-1**: Для всех сервисов в AWS `us-east-1`.
- **ap-south-1**: Для сервисов в AWS `ap-south-1`, созданных 25 июня 2025 года или позже (сервисы, созданные до этой даты, используют IP-адреса `us-east-2`).
- **ap-northeast-2**: Для сервисов в AWS `ap-northeast-2`, созданных 14 ноября 2025 года или позже (сервисы, созданные до этой даты, используют IP-адреса `us-east-2`).
- **ap-southeast-2**: Для сервисов в AWS `ap-southeast-2`, созданных 25 июня 2025 года или позже (сервисы, созданные до этой даты, используют IP-адреса `us-east-2`).
- **us-west-2**: Для сервисов в AWS `us-west-2`, созданных 24 июня 2025 года или позже (сервисы, созданные до этой даты, используют IP-адреса `us-east-2`).
- **us-east-2**: Для всех остальных регионов, явно не указанных выше (включая регионы GCP и Azure в США).

| Регион AWS                           | IP-адреса                                                                                                                                       |
|--------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| **eu-central-1**                     | `18.195.233.217`, `3.127.86.90`, `35.157.23.2`, `18.197.167.47`, `3.122.25.29`, `52.28.148.40`                                                  |
| **us-east-1**                        | `54.82.38.199`, `3.90.133.29`, `52.5.177.8`, `3.227.227.145`, `3.216.6.184`, `54.84.202.92`, `3.131.130.196`, `3.23.172.68`, `3.20.208.150`     |
| **us-east-2**                        | `3.131.130.196`, `3.23.172.68`, `3.20.208.150`, `3.132.20.192`, `18.119.76.110`, `3.134.185.180`                                                |
| **ap-south-1** (с 25 июня 2025 года) | `13.203.140.189`, `13.232.213.12`, `13.235.145.208`, `35.154.167.40`, `65.0.39.245`, `65.1.225.89`                                              |
| **ap-northeast-2** (с 14 ноя 2025 г.)| `3.38.68.69`, `52.78.68.128`, `13.209.152.13`, `3.38.24.84`, `3.37.159.31`, `3.34.25.104`                                                       |
| **ap-southeast-2** (с 25 июня 2025 г.)| `3.106.48.103`, `52.62.168.142`, `13.55.113.162`, `3.24.61.148`, `54.206.77.184`, `54.79.253.17`                                               |
| **us-west-2** (с 24 июня 2025 г.)    | `52.42.100.5`, `44.242.47.162`, `52.40.44.52`, `44.227.206.163`, `44.246.241.23`, `35.83.230.19`                                                |
| **Дополнительно**                    | `3.132.20.192`, `18.119.76.110`, `3.134.185.180`                                                                                               |



## Настройка параметров ClickHouse {#adjusting-clickhouse-settings}
ClickHouse Cloud предоставляет разумные значения по умолчанию для большинства сценариев использования. Однако, если вам нужно изменить некоторые настройки ClickHouse для целевых таблиц ClickPipes, наиболее гибким решением будет выделенная роль для ClickPipes.
Шаги:
1. создайте пользовательскую роль `CREATE ROLE my_clickpipes_role SETTINGS ...`. См. синтаксис [CREATE ROLE](/sql-reference/statements/create/role.md) для подробностей.
2. добавьте пользовательскую роль пользователю ClickPipes на шаге `Details and Settings` при создании ClickPipes.

<Image img={cp_custom_role} alt="Назначение пользовательской роли" size="lg" border/>



## Настройка расширенных параметров ClickPipes {#clickpipes-advanced-settings}
ClickPipes предоставляет разумные значения по умолчанию, которые удовлетворяют требованиям большинства вариантов использования. Если в вашем случае требуется дополнительная тонкая настройка, вы можете изменить следующие параметры:

### ClickPipes для объектного хранилища {#clickpipes-advanced-settings-object-storage}

| Параметр                          | Значение по умолчанию |  Описание                     |                    
|-----------------------------------|------------------------|---------------------------------------------------------------------------------------|
| `Max insert bytes`                | 10GB                   | Количество байт, обрабатываемых в одном пакете вставки.                              |
| `Max file count`                  | 100                    | Максимальное количество файлов, обрабатываемых в одном пакете вставки.              |
| `Max threads`                     | auto(3)                | [Максимальное количество параллельных потоков](/operations/settings/settings#max_threads) для обработки файлов. |
| `Max insert threads`              | 1                      | [Максимальное количество параллельных потоков вставки](/operations/settings/settings#max_insert_threads) для обработки файлов. |
| `Min insert block size bytes`     | 1GB                    | [Минимальный размер блока в байтах](/operations/settings/settings#min_insert_block_size_bytes), который может быть вставлен в таблицу. |
| `Max download threads`            | 4                      | [Максимальное количество параллельных потоков загрузки](/operations/settings/settings#max_download_threads). |
| `Object storage polling interval` | 30s                    | Определяет максимальный период ожидания перед вставкой данных в кластер ClickHouse. |
| `Parallel distributed insert select` | 2                   | [Параметр parallel distributed insert select](/operations/settings/settings#parallel_distributed_insert_select). |
| `Parallel view processing`        | false                  | Определяет, следует ли выполнять отправку в присоединённые представления [параллельно, а не последовательно](/operations/settings/settings#parallel_view_processing). |
| `Use cluster function`            | true                   | Определяет, следует ли обрабатывать файлы параллельно на нескольких узлах. |

<Image img={cp_advanced_settings} alt="Расширенные параметры для ClickPipes" size="lg" border/>

### Потоковые ClickPipes {#clickpipes-advanced-settings-streaming}

| Параметр                          | Значение по умолчанию |  Описание                     |                    
|-----------------------------------|------------------------|---------------------------------------------------------------------------------------|
| `Streaming max insert wait time`  | 5s                     | Определяет максимальный период ожидания перед вставкой данных в кластер ClickHouse. |



## Отчёт об ошибках {#error-reporting}
ClickPipes будет сохранять ошибки в двух отдельных таблицах в зависимости от типа ошибки, возникшей в процессе ингестии.
### Ошибки записей {#record-errors}
ClickPipes создаст таблицу рядом с вашей целевой таблицей с суффиксом `<destination_table_name>_clickpipes_error`. Эта таблица будет содержать любые ошибки, связанные с некорректными данными или несоответствием схемы, и будет содержать полное содержимое недопустимого сообщения. Для этой таблицы задан [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 7 дней.
### Системные ошибки {#system-errors}
Ошибки, связанные с работой ClickPipe, будут сохраняться в таблице `system.clickpipes_log`. Она будет содержать все остальные ошибки, связанные с работой вашего ClickPipe (сеть, подключение и т. д.). Для этой таблицы задан [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 7 дней.

Если ClickPipes не удаётся подключиться к источнику данных в течение 15 минут или к целевой системе в течение 1 часа, экземпляр ClickPipes останавливается и сохраняет соответствующее сообщение в таблице системных ошибок (при условии, что экземпляр ClickHouse доступен).



## FAQ {#faq}
- **Что такое ClickPipes?**

  ClickPipes — это функция ClickHouse Cloud, которая упрощает подключение сервисов ClickHouse к внешним источникам данных, в частности к Kafka. С ClickPipes для Kafka пользователи могут легко и непрерывно загружать данные в ClickHouse, делая их доступными для аналитики в режиме реального времени.

- **Поддерживает ли ClickPipes преобразование данных?**

  Да, ClickPipes поддерживает базовое преобразование данных, предоставляя DDL для их создания. Затем вы можете применять более сложные преобразования к данным по мере их загрузки в целевую таблицу в сервисе ClickHouse Cloud, используя [функциональность материализованных представлений](/guides/developer/cascading-materialized-views) ClickHouse.

- **Влечёт ли использование ClickPipes дополнительные затраты?**

  ClickPipes тарифицируется по двум показателям: объём принятых данных (Ingested Data) и вычислительные ресурсы (Compute). Полная информация о ценах доступна на [этой странице](/cloud/reference/billing/clickpipes). Запуск ClickPipes также может приводить к косвенным затратам на вычисления и хранилище в целевом сервисе ClickHouse Cloud, аналогично любым нагрузкам на приём данных.

- **Есть ли способ обрабатывать ошибки или сбои при использовании ClickPipes для Kafka?**

  Да, ClickPipes для Kafka автоматически выполняет повторные попытки при сбоях при чтении данных из Kafka из‑за любых эксплуатационных проблем, включая сетевые проблемы, проблемы с подключением и т. д. В случае некорректных данных или недопустимой схемы ClickPipes сохранит запись в таблицу `record_error` и продолжит обработку.
