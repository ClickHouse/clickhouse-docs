---
slug: '/integrations/clickpipes'
sidebar_label: Введение
description: 'Бесшовно подключите ваши внешние источники данных к ClickHouse Cloud.'
title: 'Интеграция с ClickHouse Cloud'
doc_type: guide
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

[ClickPipes](/integrations/clickpipes) - это управляемая платформа интеграции, которая упрощает прием данных из разнообразных источников до простого нажатия нескольких кнопок. Разработанная для самых требовательных рабочих нагрузок, надежная и масштабируемая архитектура ClickPipes гарантирует стабильную производительность и надежность. ClickPipes может быть использован как для долгосрочных потоковых нужд, так и для одноразовых задач загрузки данных.

<Image img={clickpipes_stack} alt="ClickPipes stack" size="lg" border/>

## Поддерживаемые источники данных {#supported-data-sources}

| Название                                         | Логотип                                                                                         |Тип        | Статус          | Описание                                                                                             |
|--------------------------------------------------|------------------------------------------------------------------------------------------------|-----------|------------------|------------------------------------------------------------------------------------------------------|
| [Apache Kafka](/integrations/clickpipes/kafka)   | <Kafkasvg class="image" alt="Логотип Apache Kafka" style={{width: '3rem', 'height': '3rem'}}/> |Потоковые  | Стабильно        | Настройте ClickPipes и начните получать потоковые данные из Apache Kafka в ClickHouse Cloud.        |
| Confluent Cloud                                  | <Confluentsvg class="image" alt="Логотип Confluent Cloud" style={{width: '3rem'}}/>          |Потоковые  | Стабильно        | Откройте комбинированную мощь Confluent и ClickHouse Cloud через нашу прямую интеграцию.            |
| Redpanda                                         | <Image img={redpanda_logo} size="logo" alt="Логотип Redpanda"/>                               |Потоковые  | Стабильно        | Настройте ClickPipes и начните получать потоковые данные из Redpanda в ClickHouse Cloud.           |
| AWS MSK                                          | <Msksvg class="image" alt="Логотип AWS MSK" style={{width: '3rem', 'height': '3rem'}}/>      |Потоковые  | Стабильно        | Настройте ClickPipes и начните получать потоковые данные из AWS MSK в ClickHouse Cloud.            |
| Azure Event Hubs                                 | <Azureeventhubssvg class="image" alt="Логотип Azure Event Hubs" style={{width: '3rem'}}/>    |Потоковые  | Стабильно        | Настройте ClickPipes и начните получать потоковые данные из Azure Event Hubs в ClickHouse Cloud. Подробности см. в [FAQ по Azure Event Hubs](/integrations/clickpipes/kafka/faq/#azure-eventhubs). |
| WarpStream                                       | <Warpstreamsvg class="image" alt="Логотип WarpStream" style={{width: '3rem'}}/>              |Потоковые  | Стабильно        | Настройте ClickPipes и начните получать потоковые данные из WarpStream в ClickHouse Cloud.        |
| Amazon S3                                        | <S3svg class="image" alt="Логотип Amazon S3" style={{width: '3rem', height: 'auto'}}/>      |Объектное хранилище| Стабильно   | Настройте ClickPipes для приема больших объемов данных из объектного хранилища.                     |
| Google Cloud Storage                             | <Gcssvg class="image" alt="Логотип Google Cloud Storage" style={{width: '3rem', height: 'auto'}}/> |Объектное хранилище| Стабильно   | Настройте ClickPipes для приема больших объемов данных из объектного хранилища.                     |
| DigitalOcean Spaces                              | <DOsvg class="image" alt="Логотип Digital Ocean" style={{width: '3rem', height: 'auto'}}/>   | Объектное хранилище | Стабильно   | Настройте ClickPipes для приема больших объемов данных из объектного хранилища.                    |
| Azure Blob Storage                               | <ABSsvg class="image" alt="Логотип Azure Blob Storage" style={{width: '3rem', height: 'auto'}}/> | Объектное хранилище | Стабильно   | Настройте ClickPipes для приема больших объемов данных из объектного хранилища.                    |
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <Amazonkinesis class="image" alt="Логотип Amazon Kinesis" style={{width: '3rem', height: 'auto'}}/> |Потоковые  | Стабильно        | Настройте ClickPipes и начните получать потоковые данные из Amazon Kinesis в ClickHouse Cloud.      |
| [Postgres](/integrations/clickpipes/postgres)    | <Postgressvg class="image" alt="Логотип Postgres" style={{width: '3rem', height: 'auto'}}/>  |DBMS       | Стабильно        | Настройте ClickPipes и начните получать данные из Postgres в ClickHouse Cloud.                     |
| [MySQL](/integrations/clickpipes/mysql)          | <Mysqlsvg class="image" alt="Логотип MySQL" style={{width: '3rem', height: '3rem'}}/>        |DBMS       | Публичная бета  | Настройте ClickPipes и начните получать данные из MySQL в ClickHouse Cloud.                        |
| [MongoDB](/integrations/clickpipes/mongodb)      | <Mongodbsvg class="image" alt="Логотип MongoDB" style={{width: '3rem', height: '3rem'}}/>    |DBMS       | Приватный просмотр | Настройте ClickPipes и начните получать данные из MongoDB в ClickHouse Cloud.                      |

Более новые коннекторы будут добавлены в ClickPipes, вы можете узнать больше, [связавшись с нами](https://clickhouse.com/company/contact?loc=clickpipes).

## Список статических IP-адресов {#list-of-static-ips}

Ниже приведены статические NAT IP-адреса (разделенные по регионам), которые ClickPipes использует для подключения к вашим внешним сервисам. Добавьте IP-адреса вашего экземпляра региона в белый список IP, чтобы разрешить трафик.

Для всех сервисов трафик ClickPipes будет исходить из региона по умолчанию на основе местоположения вашего сервиса:
- **eu-central-1**: Для всех сервисов в регионах ЕС. (это включает регионы GCP и Azure в ЕС)
- **us-east-1**: Для всех сервисов в AWS `us-east-1`.
- **ap-south-1**: Для услуг в AWS `ap-south-1`, созданных 25 июня 2025 года или позже (услуги, созданные до этой даты, используют IP-адреса `us-east-2`).
- **ap-southeast-2**: Для услуг в AWS `ap-southeast-2`, созданных 25 июня 2025 года или позже (услуги, созданные до этой даты, используют IP-адреса `us-east-2`).
- **us-west-2**: Для услуг в AWS `us-west-2`, созданных 24 июня 2025 года или позже (услуги, созданные до этой даты, используют IP-адреса `us-east-2`).
- **us-east-2**: Для всех остальных регионов, не указанных явно. (это включает регионы GCP и Azure в США)

| Регион AWS                          | IP-адреса                                                                                                                                    |
|-------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| **eu-central-1**                    | `18.195.233.217`, `3.127.86.90`, `35.157.23.2`, `18.197.167.47`, `3.122.25.29`, `52.28.148.40`                                               |
| **us-east-1**                       | `54.82.38.199`, `3.90.133.29`, `52.5.177.8`, `3.227.227.145`, `3.216.6.184`, `54.84.202.92`, `3.131.130.196`, `3.23.172.68`, `3.20.208.150`  |
| **us-east-2**                       | `3.131.130.196`, `3.23.172.68`, `3.20.208.150`, `3.132.20.192`, `18.119.76.110`, `3.134.185.180`                                              |
| **ap-south-1** (с 25 июня 2025 года) | `13.203.140.189`, `13.232.213.12`, `13.235.145.208`, `35.154.167.40`, `65.0.39.245`, `65.1.225.89`                                          |
| **ap-southeast-2** (с 25 июня 2025 года) | `3.106.48.103`, `52.62.168.142`, `13.55.113.162`, `3.24.61.148`, `54.206.77.184`, `54.79.253.17`                                          |
| **us-west-2** (с 24 июня 2025 года)  | `52.42.100.5`, `44.242.47.162`, `52.40.44.52`, `44.227.206.163`, `44.246.241.23`, `35.83.230.19`                                          |

## Настройка параметров ClickHouse {#adjusting-clickhouse-settings}
ClickHouse Cloud предоставляет разумные значения по умолчанию для большинства случаев использования. Однако, если вам нужно настроить некоторые параметры ClickHouse для таблиц назначения ClickPipes, специализированная роль для ClickPipes является самым гибким решением.
Шаги:
1. создайте пользовательскую роль `CREATE ROLE my_clickpipes_role SETTINGS ...`. См. синтаксис [CREATE ROLE](/sql-reference/statements/create/role.md) для подробностей.
2. добавьте пользовательскую роль к пользователю ClickPipes на шаге `Details and Settings` во время создания ClickPipes.

<Image img={cp_custom_role} alt="Назначить пользовательскую роль" size="lg" border/>

## Настройка дополнительных параметров ClickPipes {#clickpipes-advanced-settings}
ClickPipes предоставляет разумные значения по умолчанию, охватывающие требования большинства случаев использования. Если ваш случай использования требует дополнительной настройки, вы можете изменить следующие параметры:

### Объектное хранилище ClickPipes {#clickpipes-advanced-settings-object-storage}

| Параметр                                  | Значение по умолчанию  | Описание                                |                    
|-------------------------------------------|-----------------------|-----------------------------------------|
| `Max insert bytes`                        | 10GB                  | Количество байтов, обрабатываемых в одной批 вставки.                              |
| `Max file count`                          | 100                   | Максимальное количество файлов, обрабатываемых в одной批 вставки.                  |
| `Max threads`                             | auto(3)              | [Максимальное количество параллельных потоков](/operations/settings/settings#max_threads) для обработки файлов. |
| `Max insert threads`                      | 1                     | [Максимальное количество параллельных потоков вставки](/operations/settings/settings#max_insert_threads) для обработки файлов. |
| `Min insert block size bytes`             | 1GB                   | [Минимальный размер блока в байтах](/operations/settings/settings#min_insert_block_size_bytes), который может быть вставлен в таблицу. |
| `Max download threads`                    | 4                     | [Максимальное количество параллельных потоков загрузки](/operations/settings/settings#max_download_threads). |
| `Object storage polling interval`         | 30s                   | Настраивает максимальный период ожидания перед вставкой данных в кластер ClickHouse. |
| `Parallel distributed insert select`       | 2                     | [Параметр параллельной распределенной вставки](/operations/settings/settings#parallel_distributed_insert_select). |
| `Parallel view processing`                | false                 | Включать ли обработку присоединенных представлений [параллельно вместо последовательно](/operations/settings/settings#parallel_view_processing). |
| `Use cluster function`                    | true                  | Обрабатывать ли файлы параллельно по нескольким узлам. |

<Image img={cp_advanced_settings} alt="Дополнительные настройки для ClickPipes" size="lg" border/>

### Потоковые ClickPipes {#clickpipes-advanced-settings-streaming}

| Параметр                                  | Значение по умолчанию  | Описание                                |                    
|-------------------------------------------|-----------------------|-----------------------------------------|
| `Streaming max insert wait time`         | 5s                    | Настраивает максимальный период ожидания перед вставкой данных в кластер ClickHouse. |

## Сообщение об ошибках {#error-reporting}
ClickPipes будет хранить ошибки в двух отдельных таблицах в зависимости от типа ошибки, возникшей в процессе получения данных.
### Ошибки записей {#record-errors}
ClickPipes создаст таблицу рядом с вашей таблицей назначения с постфиксом `<destination_table_name>_clickpipes_error`. Эта таблица будет содержать любые ошибки из неправильно отформатированных данных или несовпадающей схемы и будет включать всю неверную информацию. Эта таблица имеет [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) в 7 дней.
### Системные ошибки {#system-errors}
Ошибки, связанные с работой ClickPipe, будут храниться в таблице `system.clickpipes_log`. Эта таблица будет хранить все остальные ошибки, связанные с работой вашего ClickPipe (сети, подключение и т. д.). Эта таблица имеет [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) в 7 дней.

Если ClickPipes не сможет подключиться к источнику данных после 15 минут или к месту назначения после 1 часа, экземпляр ClickPipes останавливается и сохраняет соответствующее сообщение в таблице системной ошибки (при условии, что экземпляр ClickHouse доступен).

## FAQ {#faq}
- **Что такое ClickPipes?**

  ClickPipes - это функция ClickHouse Cloud, которая упрощает пользователям подключение их служб ClickHouse к внешним источникам данных, в частности к Kafka. С помощью ClickPipes для Kafka пользователи могут легко непрерывно загружать данные в ClickHouse, делая их доступными для аналитики в реальном времени.

- **Поддерживает ли ClickPipes преобразование данных?**

  Да, ClickPipes поддерживает основное преобразование данных, предоставляя создание DDL. Вы можете затем применять более сложные преобразования к данным по мере их загрузки в целевую таблицу в службе ClickHouse Cloud, используя [функцию материализованных представлений](/guides/developer/cascading-materialized-views).

- **Влечет ли использование ClickPipes дополнительные расходы?**

  ClickPipes оплачивается по двум направлениям: загружаемым данным и вычислениям. Полные детали ценообразования доступны [на этой странице](/cloud/reference/billing/clickpipes). Запуск ClickPipes также может генерировать косвенные расходы на вычисление и хранение в службе назначения ClickHouse Cloud, аналогично любому рабочему процессу загрузки.

- **Есть ли способ обработать ошибки или сбои при использовании ClickPipes для Kafka?**

  Да, ClickPipes для Kafka автоматически повторит попытку в случае сбоя при получении данных из Kafka из-за любой операционной проблемы, включая сетевые проблемы, проблемы с подключением и т. д. В случае неправильно отформатированных данных или недействительной схемы ClickPipes сохранит запись в таблице record_error и продолжит обработку.