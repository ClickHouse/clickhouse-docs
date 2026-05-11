---
slug: /use-cases/data-lake/polaris-catalog
sidebar_label: 'Каталог Polaris'
title: 'Каталог Polaris'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве мы пошагово покажем, как выполнять запросы к
 вашим данным с помощью ClickHouse и каталога Snowflake Polaris.'
keywords: ['Polaris', 'Snowflake', 'озера данных']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

ClickHouse поддерживает интеграцию с несколькими каталогами (Unity, Glue, Polaris,
и т. д.). В этом руководстве мы пошагово покажем, как выполнять запросы к данным
с помощью ClickHouse и [каталога Apache Polaris](https://polaris.apache.org/releases/1.1.0/getting-started/using-polaris/#setup).
Apache Polaris поддерживает таблицы Iceberg и Delta Tables (через Generic Tables). На данный момент эта интеграция поддерживает только таблицы Iceberg.

:::note
Поскольку эта функция является экспериментальной, её необходимо включить с помощью:
`SET allow_experimental_database_unity_catalog = 1;`
:::

## Предварительные требования \{#prerequisites\}

Чтобы подключиться к каталогу Polaris, вам понадобятся:

* Snowflake Open Catalog (размещённый Polaris) или самостоятельно размещённый Polaris Catalog
* URI вашего каталога Polaris (например, `https://<account-id>.<region>.aws.snowflakecomputing.com/polaris/api/catalog/v1` или `http://polaris:8181/api/catalog/v1/oauth/tokens`)
* Учётные данные каталога (client ID и client secret)
* URI OAuth-токенов для вашего экземпляра Polaris
* Конечная точка объектного хранилища, в котором находятся ваши данные Iceberg (например, S3)
* ClickHouse версии 26.1+

Для Open Catalog, управляемого предложения Polaris от Snowflake, ваш URI будет содержать `/polaris`, а для самостоятельно размещённого варианта это может быть не так.

<VerticalStepper>
  ## Создание подключения между Polaris и ClickHouse \{#connecting\}

  Создайте базу данных, которая подключает ClickHouse к вашему каталогу Polaris:

  ```sql
  CREATE DATABASE polaris_catalog
  ENGINE = DataLakeCatalog('https://<catalog_uri>/api/catalog/v1')
  SETTINGS
      catalog_type = 'rest',
      catalog_credential = '<client-id>:<client-secret>',
      warehouse = 'snowflake',
      auth_scope = 'PRINCIPAL_ROLE:ALL',
      oauth_server_uri = 'https://<catalog_uri>/api/catalog/v1/oauth/tokens',
      storage_endpoint = '<storage_endpoint>'
  ```

  ## Запросы к каталогу Polaris с помощью ClickHouse \{#query-polaris-catalog\}

  После настройки подключения вы можете выполнять запросы к Polaris:

  ```sql title="Запрос"
  USE polaris_catalog;
  SHOW TABLES;
  ```

  Чтобы выполнить запрос к таблице:

  ```sql title="Запрос"
  SELECT count(*) FROM `polaris_db.my_iceberg_table`;
  ```

  :::note
  Обратные кавычки обязательны, например, `schema.table`.
  :::

  Чтобы просмотреть DDL таблицы:

  ```sql
  SHOW CREATE TABLE `polaris_db.my_iceberg_table`;
  ```

  ## Загрузка данных из Polaris в ClickHouse \{#loading-data-into-clickhouse\}

  Чтобы загрузить данные из Polaris в таблицу ClickHouse, создайте целевую таблицу с нужной схемой, затем выполните insert из таблицы Polaris:

  ```sql title="Запрос"
  CREATE TABLE my_clickhouse_table
  (
      -- определите столбцы так, чтобы они соответствовали вашей таблице Iceberg
      `id` Int64,
      `name` String,
      `event_time` DateTime64(3)
  )
  ENGINE = MergeTree
  ORDER BY id;

  INSERT INTO my_clickhouse_table
  SELECT * FROM polaris_catalog.`polaris_db.my_iceberg_table`;
  ```
</VerticalStepper>