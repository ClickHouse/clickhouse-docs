---
sidebar_label: 'Введение'
description: 'Бесшовно подключите свои внешние источники данных к ClickHouse Cloud.'
slug: /integrations/clickpipes
title: 'Интеграция с ClickHouse Cloud'
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
import Image from '@theme/IdealImage';


# Интеграция с ClickHouse Cloud

## Введение {#introduction}

[ClickPipes](/integrations/clickpipes) — это управляемая платформа интеграции, которая делает прием данных из разнообразных источников таким же простым, как нажать несколько кнопок. Разработанная для самых требовательных рабочих нагрузок, надежная и масштабируемая архитектура ClickPipes обеспечивает стабильную производительность и надежность. ClickPipes может использоваться как для долгосрочной потоковой передачи данных, так и для однократной загрузки данных.

<Image img={clickpipes_stack} alt="ClickPipes stack" size="lg" border/>

## Поддерживаемые источники данных {#supported-data-sources}

| Название              | Логотип| Тип          | Статус         | Описание                                                                                           |
|----------------------|--------|--------------|----------------|----------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Логотип Apache Kafka" style={{width: '3rem', 'height': '3rem'}}/>| Потоковые    | Стабильно      | Настройте ClickPipes и начните принимать потоковые данные из Apache Kafka в ClickHouse Cloud.       |
| Confluent Cloud      |<Confluentsvg class="image" alt="Логотип Confluent Cloud" style={{width: '3rem'}}/>| Потоковые    | Стабильно      | Освободите совокупную мощь Confluent и ClickHouse Cloud через нашу прямую интеграцию.              |
| Redpanda             |<Image img={redpanda_logo} size="logo" alt="Логотип Redpanda"/> | Потоковые    | Стабильно      | Настройте ClickPipes и начните принимать потоковые данные из Redpanda в ClickHouse Cloud.          |
| AWS MSK              |<Msksvg class="image" alt="Логотип AWS MSK" style={{width: '3rem', 'height': '3rem'}}/>| Потоковые    | Стабильно      | Настройте ClickPipes и начните принимать потоковые данные из AWS MSK в ClickHouse Cloud.           |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Логотип Azure Event Hubs" style={{width: '3rem'}}/>| Потоковые    | Стабильно      | Настройте ClickPipes и начните принимать потоковые данные из Azure Event Hubs в ClickHouse Cloud.  |
| WarpStream           |<Warpstreamsvg class="image" alt="Логотип WarpStream" style={{width: '3rem'}}/>| Потоковые    | Стабильно      | Настройте ClickPipes и начните принимать потоковые данные из WarpStream в ClickHouse Cloud.        |
| Amazon S3            |<S3svg class="image" alt="Логотип Amazon S3" style={{width: '3rem', height: 'auto'}}/>| Объектное хранилище| Стабильно  | Настройте ClickPipes для приема больших объемов данных из объектного хранилища.                    |
| Google Cloud Storage |<Gcssvg class="image" alt="Логотип Google Cloud Storage" style={{width: '3rem', height: 'auto'}}/>| Объектное хранилище| Стабильно  | Настройте ClickPipes для приема больших объемов данных из объектного хранилища.                    |
| Amazon Kinesis       |<Amazonkinesis class="image" alt="Логотип Amazon Kinesis" style={{width: '3rem', height: 'auto'}}/>| Потоковые    | Стабильно      | Настройте ClickPipes и начните принимать потоковые данные из Amazon Kinesis в ClickHouse Cloud.     |
| Postgres             |<Postgressvg class="image" alt="Логотип Postgres" style={{width: '3rem', height: 'auto'}}/>| СУБД         | Открытая бета  | Настройте ClickPipes и начните принимать данные из Postgres в ClickHouse Cloud.                    |

Будут добавлены новые коннекторы в ClickPipes, вы можете узнать больше, [связавшись с нами](https://clickhouse.com/company/contact?loc=clickpipes).

## Список статических IP-адресов {#list-of-static-ips}

Следующие статические NAT IP-адреса (разделенные по регионам), которые ClickPipes использует для подключения к вашим внешним сервисам.
Добавьте IP-адреса вашего региона экземпляра в разрешенный список IP, чтобы разрешить трафик.
Если ваш регион экземпляра не указан здесь, он будет относиться к региону по умолчанию:

- **eu-central-1** для регионов ЕС
- **us-east-1** для экземпляров в `us-east-1`
- **us-east-2** для всех остальных регионов

| Регион ClickHouse Cloud | IP-адреса                                                             |
|-------------------------|----------------------------------------------------------------------|
| **eu-central-1**        | `18.195.233.217`, `3.127.86.90`, `35.157.23.2`, `18.197.167.47`, `3.122.25.29`, `52.28.148.40` |
| **us-east-2**           | `3.131.130.196`, `3.23.172.68`, `3.20.208.150`, `3.132.20.192`, `18.119.76.110`, `3.134.185.180` |
| **us-east-1**           | `54.82.38.199`, `3.90.133.29`, `52.5.177.8`, `3.227.227.145`, `3.216.6.184`, `54.84.202.92`, `3.131.130.196`, `3.23.172.68`, `3.20.208.150` |

## Настройка параметров ClickHouse {#adjusting-clickhouse-settings}
ClickHouse Cloud предоставляет разумные параметры по умолчанию для большинства случаев использования. Однако если вам нужно настроить некоторые параметры ClickHouse для таблиц назначения ClickPipes, специализированная роль для ClickPipes является самым гибким решением.
Шаги:
1. создайте пользовательскую роль `CREATE ROLE my_clickpipes_role SETTINGS ...`. См. синтаксис [CREATE ROLE](/sql-reference/statements/create/role.md) для получения деталей.
2. добавьте пользовательскую роль к пользователю ClickPipes на шаге `Details and Settings` во время создания ClickPipes.

<Image img={cp_custom_role} alt="Назначить пользовательскую роль" size="lg" border/>

## Сообщение об ошибках {#error-reporting}
ClickPipes создаст таблицу рядом с вашей таблицей назначения с постфиксом `<destination_table_name>_clickpipes_error`. Эта таблица будет содержать любые ошибки, возникающие в ходе работы вашего ClickPipe (сеть, подключение и т. д.), а также любые данные, которые не соответствуют схеме. Таблица ошибок имеет [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) в 7 дней.
Если ClickPipes не может подключиться к источнику данных или назначению после 15 минут, экземпляр ClickPipes останавливается и сохраняет соответствующее сообщение в таблице ошибок (при условии, что экземпляр ClickHouse доступен).

## ЧаВо {#faq}
- **Что такое ClickPipes?**

  ClickPipes — это функция ClickHouse Cloud, которая упрощает пользователям подключение своих служб ClickHouse к внешним источникам данных, особенно Kafka. С помощью ClickPipes для Kafka пользователи могут легко непрерывно загружать данные в ClickHouse, делая их доступными для аналитики в реальном времени.

- **Поддерживает ли ClickPipes преобразование данных?**

  Да, ClickPipes поддерживает базовое преобразование данных, предоставляя создание DDL. Вы можете затем применять более сложные преобразования к данным по мере их загрузки в таблицу назначения в службе ClickHouse Cloud с использованием функции [материализованных представлений](/guides/developer/cascading-materialized-views).

- **Влечет ли использование ClickPipes дополнительные затраты?**

  ClickPipes тарифицируется по двум параметрам: Объем данных и Вычисления. Полные детали о ценообразовании доступны на [этой странице](/cloud/manage/jan-2025-faq/pricing-dimensions#clickpipes-pricing-faq). Запуск ClickPipes также может генерировать косвенные затраты на вычисления и хранение в службе ClickHouse Cloud, аналогично любой рабочей нагрузке на прием данных.

- **Существует ли способ обработки ошибок или сбоев при использовании ClickPipes для Kafka?**

  Да, ClickPipes для Kafka автоматически повторит попытки в случае сбоев при потреблении данных из Kafka. ClickPipes также поддерживает включение специализированной таблицы ошибок, которая будет хранить ошибки и неправильно сформированные данные в течение 7 дней.
