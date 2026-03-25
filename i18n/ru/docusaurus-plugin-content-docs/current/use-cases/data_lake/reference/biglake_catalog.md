---
slug: /use-cases/data-lake/biglake-catalog
sidebar_label: 'BigLake Metastore'
title: 'BigLake Metastore'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве мы пошагово разберем, как выполнять запросы к
 вашим данным в Google Cloud Storage с помощью ClickHouse и BigLake Metastore.'
keywords: ['BigLake', 'GCS', 'озеро данных', 'Iceberg', 'Google Cloud']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

ClickHouse поддерживает интеграцию с несколькими каталогами (Unity, Glue, Polaris и т. д.). В этом руководстве мы пошагово разберем, как выполнять запросы к вашим таблицам Iceberg в [BigLake Metastore](https://docs.cloud.google.com/biglake/docs/) через ClickHouse.

:::note
Поскольку эта функция находится на стадии бета-тестирования, вам потребуется включить ее с помощью:
`SET allow_database_iceberg = 1;`
:::

## Предварительные требования \{#prerequisites\}

Перед созданием подключения из ClickHouse к BigLake Metastore убедитесь, что у вас есть:

* **Проект Google Cloud** с включённым BigLake Metastore
* **Учётные данные Application Default Credentials** (ID клиента OAuth и секрет клиента) для приложения, созданные через [Google Cloud Console](https://docs.cloud.google.com/docs/authentication/provide-credentials-adc)
* **Токен обновления**, полученный после завершения OAuth-потока с соответствующими областями доступа (например, `https://www.googleapis.com/auth/bigquery` и областью доступа к хранилищу для GCS)
* Путь к **warehouse**: бакет GCS (и необязательный префикс), где хранятся ваши таблицы, например `gs://your-bucket` или `gs://your-bucket/prefix`

## Создание подключения между BigLake Metastore и ClickHouse \{#creating-a-connection\}

После настройки учетных данных OAuth создайте в ClickHouse базу данных с использованием движка базы данных [DataLakeCatalog](/engines/database-engines/datalakecatalog):

```sql
SET allow_database_iceberg = 1;

CREATE DATABASE biglake_metastore
ENGINE = DataLakeCatalog('https://biglake.googleapis.com/iceberg/v1/restcatalog')
SETTINGS
    catalog_type = 'biglake',
    google_adc_client_id = '<client-id>',
    google_adc_client_secret = '<client-secret>',
    google_adc_refresh_token = '<refresh-token>',
    google_adc_quota_project_id = '<gcp-project-id>',
    warehouse = 'gs://<bucket_name>/<optional-prefix>';
```

## Запросы к таблицам BigLake Metastore с помощью ClickHouse \{#querying-biglake-metastore-tables\}

После создания подключения вы можете выполнять запросы к таблицам, зарегистрированным в BigLake Metastore.

```sql
USE biglake_metastore;

SHOW TABLES;
```

Пример вывода:

```response
┌─name─────────────────────┐
│icebench.my_iceberg_table │   
└──────────────────────────┘
```

```sql
SELECT count(*) FROM `icebench.my_iceberg_table`;
```

:::note Требуются обратные кавычки
Обратные кавычки обязательны, потому что ClickHouse не поддерживает несколько пространств имен.
:::

Чтобы просмотреть определение таблицы:

```sql
SHOW CREATE TABLE `icebench.my_iceberg_table`;
```

## Загрузка данных из BigLake в ClickHouse \{#loading-data-into-clickhouse\}

Чтобы загрузить данные из таблицы BigLake Metastore в локальную таблицу ClickHouse для ускорения повторных запросов, создайте таблицу MergeTree и вставьте данные из каталога:

```sql
CREATE TABLE clickhouse_table
(
    `id` Int64,
    `event_time` DateTime64(3),
    `user_id` String,
    `payload` String
)
ENGINE = MergeTree
ORDER BY (event_time, id);

INSERT INTO local_events
SELECT * FROM biglake_metastore.`icebench.my_iceberg_table`;
```

После первоначальной загрузки выполняйте запросы к `clickhouse_table` с меньшей задержкой. При необходимости повторно выполните `INSERT INTO ... SELECT`, чтобы обновить данные из BigLake.
