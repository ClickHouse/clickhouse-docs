---
sidebar_label: 'Введение'
description: 'Бесшовно подключайте свои внешние источники данных к ClickHouse Cloud.'
slug: '/integrations/clickpipes'
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import Amazonkinesis from '@site/static/images/integrations/logos/amazon_kinesis_logo.svg';
import Gcssvg from '@site/static/images/integrations/logos/gcs.svg';
import Postgressvg from '@site/static/images/integrations/logos/postgresql.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import clickpipes_stack from '@site/static/images/integrations/data-ingestion/clickpipes/clickpipes_stack.png';
import cp_custom_role from '@site/static/images/integrations/data-ingestion/clickpipes/cp_custom_role.png';


# Интеграция с ClickHouse Cloud

## Введение {#introduction}

[ClickPipes](/integrations/clickpipes) — это управляемая платформа интеграции, которая делает процесс загрузки данных из различных источников простым и удобным. Разработанная для самых требовательных рабочих нагрузок, надежная и масштабируемая архитектура ClickPipes обеспечивает стабильную производительность и надежность. ClickPipes можно использовать как для долгосрочных потоковых нужд, так и для одноразовых загрузок данных.

<img src={clickpipes_stack} alt="ClickPipes stack" />

## Поддерживаемые источники данных {#supported-data-sources}

| Название             | Логотип| Тип           | Статус          | Описание                                                                                           |
|----------------------|--------|---------------|-----------------|----------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Логотип Apache Kafka" style={{width: '3rem', 'height': '3rem'}}/>| Потоковые    | Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из Apache Kafka в ClickHouse Cloud.     |
| Confluent Cloud      |<Confluentsvg class="image" alt="Логотип Confluent Cloud" style={{width: '3rem'}}/>| Потоковые    | Стабильный      | Откройте комбинированную мощь Confluent и ClickHouse Cloud через нашу прямую интеграцию.          |
| Redpanda             |<img src={redpanda_logo} class="image" alt="Логотип Redpanda" style={{width: '2.5rem', 'background-color': 'transparent'}}/>| Потоковые    | Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из Redpanda в ClickHouse Cloud.         |
| AWS MSK              |<Msksvg class="image" alt="Логотип AWS MSK" style={{width: '3rem', 'height': '3rem'}}/>| Потоковые    | Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из AWS MSK в ClickHouse Cloud.          |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Логотип Azure Event Hubs" style={{width: '3rem'}}/>| Потоковые    | Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из Azure Event Hubs в ClickHouse Cloud. |
| WarpStream           |<Warpstreamsvg class="image" alt="Логотип WarpStream" style={{width: '3rem'}}/>| Потоковые    | Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из WarpStream в ClickHouse Cloud.       |
| Amazon S3            |<S3svg class="image" alt="Логотип Amazon S3" style={{width: '3rem', height: 'auto'}}/>| Объектное хранилище| Стабильный  | Настройте ClickPipes для загрузки больших объемов данных из объектного хранилища.                  |
| Google Cloud Storage |<Gcssvg class="image" alt="Логотип Google Cloud Storage" style={{width: '3rem', height: 'auto'}}/>| Объектное хранилище| Стабильный  | Настройте ClickPipes для загрузки больших объемов данных из объектного хранилища.                  |
| Amazon Kinesis       |<Amazonkinesis class="image" alt="Логотип Amazon Kinesis" style={{width: '3rem', height: 'auto'}}/>| Потоковые    | Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из Amazon Kinesis в ClickHouse Cloud.   |
| Postgres             |<Postgressvg class="image" alt="Логотип Postgres" style={{width: '3rem', height: 'auto'}}/>| СУБД         | Публичная бета | Настройте ClickPipes и начните загружать данные из Postgres в ClickHouse Cloud.                   |

Больше коннекторов будет добавлено в ClickPipes, вы можете узнать больше, [связавшись с нами](https://clickhouse.com/company/contact?loc=clickpipes).

## Список статических IP-адресов {#list-of-static-ips}

Следующие статические NAT IP-адреса (разделенные по регионам), которые ClickPipes использует для подключения к вашим внешним службам.
Добавьте соответствующие IP-адреса региона вашей инстанции в белый список IP-адресов для разрешения трафика.
Если регион вашей инстанции не указан здесь, он будет считаться регионом по умолчанию:

- **eu-central-1** для регионов ЕС
- **us-east-1** для инстанций в `us-east-1`
- **us-east-2** для всех остальных регионов

| Регион ClickHouse Cloud | IP-адреса |
|-------------------------|-----------|
| **eu-central-1**        | `18.195.233.217`, `3.127.86.90`, `35.157.23.2`, `18.197.167.47`, `3.122.25.29`, `52.28.148.40` |
| **us-east-2**           | `3.131.130.196`, `3.23.172.68`, `3.20.208.150`, `3.132.20.192`, `18.119.76.110`, `3.134.185.180` |
| **us-east-1**           | `54.82.38.199`, `3.90.133.29`, `52.5.177.8`, `3.227.227.145`, `3.216.6.184`, `54.84.202.92`, `3.131.130.196`, `3.23.172.68`, `3.20.208.150` |

## Настройка параметров ClickHouse {#adjusting-clickhouse-settings}
ClickHouse Cloud предоставляет разумные параметры по умолчанию для большинства случаев использования. Однако, если вам нужно настроить некоторые параметры ClickHouse для целевых таблиц ClickPipes, создание специальной роли для ClickPipes является наиболее гибким решением.
Шаги:
1. создайте пользовательскую роль `CREATE ROLE my_clickpipes_role SETTINGS ...`. Смотрите синтаксис [CREATE ROLE](/sql-reference/statements/create/role.md) для подробностей.
2. добавьте пользовательскую роль к пользователю ClickPipes на шаге `Детали и настройки` во время создания ClickPipes.

<img src={cp_custom_role} alt="Назначьте пользовательскую роль" />

## Сообщение об ошибках {#error-reporting}
ClickPipes создаст таблицу рядом с вашей целевой таблицей с постфиксом `<destination_table_name>_clickpipes_error`. Эта таблица будет содержать любые ошибки, возникающие при работе вашего ClickPipes (сеть, подключение и т.д.), а также любые данные, которые не соответствуют схеме. У таблицы с ошибками есть [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 7 дней.
Если ClickPipes не может подключиться к источнику данных или цели в течение 15 минут, инстанция ClickPipes останавливается и сохраняет соответствующее сообщение в таблице с ошибками (при условии, что инстанция ClickHouse доступна).

## ЧАВО {#faq}
- **Что такое ClickPipes?**

  ClickPipes — это функция ClickHouse Cloud, которая упрощает пользователям подключение своих услуг ClickHouse к внешним источникам данных, особенно к Kafka. С помощью ClickPipes для Kafka пользователи могут легко загружать данные в ClickHouse, делая их доступными для аналитики в реальном времени.

- **Поддерживает ли ClickPipes преобразование данных?**

  Да, ClickPipes поддерживает базовые преобразования данных, предоставляя возможность создания DDL. Вы можете затем применять более сложные преобразования к данным по мере их загрузки в целевую таблицу в ClickHouse Cloud, используя [функцию материализованных представлений](/guides/developer/cascading-materialized-views) ClickHouse.

- **Влечет ли использование ClickPipes дополнительные расходы?**

  ClickPipes платится по двум параметрам: загруженные данные и вычисления. Полные детали ценообразования доступны на [этой странице](/cloud/manage/jan-2025-faq/pricing-dimensions#clickpipes-pricing-faq). Запуск ClickPipes также может генерировать косвенные расходы на вычисления и хранение в целевой службе ClickHouse Cloud, аналогично любой нагрузке на загрузку.

- **Существует ли способ обработки ошибок или сбоев при использовании ClickPipes для Kafka?**

  Да, ClickPipes для Kafka будет автоматически повторять попытки в случае сбоев при получении данных из Kafka. ClickPipes также поддерживает возможность включения специальной таблицы ошибок, которая будет хранить ошибки и неправильно отформатированные данные в течение 7 дней.
