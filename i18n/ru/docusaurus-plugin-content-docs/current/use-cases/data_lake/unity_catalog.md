---
slug: /use-cases/data-lake/unity-catalog
sidebar_label: 'Unity Catalog'
title: 'Unity Catalog'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве мы расскажем вам о шагах, необходимых для выполнения запросов
 к вашим данным в S3 корзинах с помощью ClickHouse и Unity Catalog.'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge/>

:::note
Интеграция с Unity Catalog работает для управляемых и внешних таблиц.
На данный момент эта интеграция поддерживается только в AWS.
:::

ClickHouse поддерживает интеграцию с несколькими каталогами (Unity, Glue, Polaris и т.д.). Это руководство проведёт вас через шаги выполнения запросов к вашим данным, управляемым Databricks, с использованием ClickHouse и [Unity Catalog](https://www.databricks.com/product/unity-catalog).

Databricks поддерживает несколько форматов данных для своего lakehouse. С ClickHouse вы можете выполнять запросы к таблицам Unity Catalog как к Delta, так и к Iceberg.

## Конфигурация Unity в Databricks {#configuring-unity-in-databricks}

Чтобы ClickHouse мог взаимодействовать с Unity Catalog, необходимо убедиться, что Unity Catalog настроен для разрешения взаимодействия с внешним читателем. Это можно сделать, следуя руководству [ "Enable external data access to Unity Catalog"](https://docs.databricks.com/aws/en/external-access/admin).

В дополнение к разрешению внешнего доступа убедитесь, что принципал, настраивающий интеграцию, имеет привилегию `EXTERNAL USE SCHEMA` [привилегия](https://docs.databricks.com/aws/en/external-access/admin#external-schema) на схему, содержащую таблицы.

После настройки вашего каталога вам необходимо сгенерировать учетные данные для ClickHouse. Можно использовать два различных метода в зависимости от вашего режима взаимодействия с Unity:

* Для клиентов Iceberg используйте аутентификацию в качестве [сервисного принципала](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m).

* Для клиентов Delta используйте токен персонального доступа ([PAT](https://docs.databricks.com/aws/en/dev-tools/auth/pat)).

## Создание соединения между Unity Catalog и ClickHouse {#creating-a-connection-between-unity-catalog-and-clickhouse}

С настроенным Unity Catalog и установленной аутентификацией установите соединение между ClickHouse и Unity Catalog.

### Чтение Delta {#read-delta}

```sql
CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog')
SETTINGS warehouse = 'CATALOG_NAME', catalog_credential = '<PAT>', catalog_type = 'unity'
```

### Чтение Iceberg {#read-iceberg}

```sql
CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog/iceberg')
SETTINGS catalog_type = 'rest', catalog_credential = '<client-id>:<client-secret>', warehouse = 'workspace', 
oauth_server_uri = 'https://<workspace-id>.cloud.databricks.com/oidc/v1/token', auth_scope = 'all-apis,sql'
```

## Запрос таблиц Unity Catalog с помощью ClickHouse {#querying-unity-catalog-tables-using-clickhouse}

Теперь, когда соединение установлено, вы можете начать выполнять запросы через Unity Catalog. Например:

```sql
USE unity;

SHOW TABLES;

┌─name───────────────────────────────────────────────┐
│ clickbench.delta_hits                              │
│ demo.fake_user                                     │
│ information_schema.catalog_privileges              │
│ information_schema.catalog_tags                    │
│ information_schema.catalogs                        │
│ information_schema.check_constraints               │
│ information_schema.column_masks                    │
│ information_schema.column_tags                     │
│ information_schema.columns                         │
│ information_schema.constraint_column_usage         │
│ information_schema.constraint_table_usage          │
│ information_schema.information_schema_catalog_name │
│ information_schema.key_column_usage                │
│ information_schema.parameters                      │
│ information_schema.referential_constraints         │
│ information_schema.routine_columns                 │
│ information_schema.routine_privileges              │
│ information_schema.routines                        │
│ information_schema.row_filters                     │
│ information_schema.schema_privileges               │
│ information_schema.schema_tags                     │
│ information_schema.schemata                        │
│ information_schema.table_constraints               │
│ information_schema.table_privileges                │
│ information_schema.table_tags                      │
│ information_schema.tables                          │
│ information_schema.views                           │
│ information_schema.volume_privileges               │
│ information_schema.volume_tags                     │
│ information_schema.volumes                         │
│ uniform.delta_hits                                 │
└────────────────────────────────────────────────────┘
```

Если вы используете клиента Iceberg, будут показаны только таблицы Delta с включенной функцией Uniform:

```sql
SHOW TABLES

┌─name───────────────┐
│ uniform.delta_hits │
└────────────────────┘
```

Чтобы выполнить запрос к таблице:

```sql
SELECT count(*) FROM `uniform.delta_hits`
```

:::note Требуются обратные кавычки
Обратные кавычки требуются, поскольку ClickHouse не поддерживает более одного пространства имен.
:::

Чтобы просмотреть DDL таблицы:

```sql
SHOW CREATE TABLE `uniform.delta_hits`

CREATE TABLE unity_uniform.`uniform.delta_hits`
(
    `WatchID` Int64,
    `JavaEnable` Int32,
    `Title` String,
    `GoodEvent` Int32,
    `EventTime` DateTime64(6, 'UTC'),
    `EventDate` Date,
    `CounterID` Int32,
    `ClientIP` Int32,
    ...
    `FromTag` String,
    `HasGCLID` Int32,
    `RefererHash` Int64,
    `URLHash` Int64,
    `CLID` Int32
)
ENGINE = Iceberg('s3://<path>);

```

## Загрузка данных из вашего Data Lake в ClickHouse {#loading-data-from-your-data-lake-into-clickhouse}

Если вам нужно загрузить данные из Databricks в ClickHouse, начните с создания локальной таблицы ClickHouse:

```sql
CREATE TABLE hits
(
    `WatchID` Int64,
    `JavaEnable` Int32,
    `Title` String,
    `GoodEvent` Int32,
    `EventTime` DateTime64(6, 'UTC'),
    `EventDate` Date,
    `CounterID` Int32,
    `ClientIP` Int32,
    ...
    `FromTag` String,
    `HasGCLID` Int32,
    `RefererHash` Int64,
    `URLHash` Int64,
    `CLID` Int32
)
PRIMARY KEY (CounterID, EventDate, UserID, EventTime, WatchID);
```

Затем загрузите данные из вашей таблицы Unity Catalog с помощью `INSERT INTO SELECT`:

```sql
INSERT INTO hits SELECT * FROM unity_uniform.`uniform.delta_hits`;
```
