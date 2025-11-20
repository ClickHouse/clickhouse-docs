---
slug: /use-cases/data-lake/unity-catalog
sidebar_label: 'Unity catalog'
title: 'Unity catalog'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве мы рассмотрим, как выполнять запросы
 к данным в корзинах S3 с помощью ClickHouse и Unity Catalog.'
keywords: ['Unity', 'Data Lake']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

:::note
Интеграция с Unity Catalog работает для управляемых и внешних таблиц.
В настоящее время эта интеграция поддерживается только в AWS.
:::

ClickHouse поддерживает интеграцию с несколькими каталогами (Unity, Glue, Polaris и др.). В этом руководстве описаны шаги по запросу данных, управляемых Databricks, с использованием ClickHouse и [Unity Catalog](https://www.databricks.com/product/unity-catalog).

Databricks поддерживает несколько форматов данных для своего lakehouse. С помощью ClickHouse можно запрашивать таблицы Unity Catalog как в формате Delta, так и в формате Iceberg.

:::note
Поскольку эта функция является экспериментальной, её необходимо включить с помощью команды:
`SET allow_experimental_database_unity_catalog = 1;`
:::


## Настройка Unity в Databricks {#configuring-unity-in-databricks}

Чтобы ClickHouse мог взаимодействовать с каталогом Unity, необходимо убедиться, что Unity Catalog настроен для взаимодействия с внешним читателем. Это можно сделать, следуя руководству ["Enable external data access to Unity Catalog"](https://docs.databricks.com/aws/en/external-access/admin).

Помимо включения внешнего доступа, убедитесь, что субъект, настраивающий интеграцию, имеет [привилегию](https://docs.databricks.com/aws/en/external-access/admin#external-schema) `EXTERNAL USE SCHEMA` для схемы, содержащей таблицы.

После настройки каталога необходимо сгенерировать учетные данные для ClickHouse. В зависимости от режима взаимодействия с Unity можно использовать два различных метода:

- Для клиентов Iceberg используйте аутентификацию как [сервисный принципал](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m).

- Для клиентов Delta используйте персональный токен доступа ([PAT](https://docs.databricks.com/aws/en/dev-tools/auth/pat)).


## Создание подключения между Unity Catalog и ClickHouse {#creating-a-connection-between-unity-catalog-and-clickhouse}

После настройки Unity Catalog и аутентификации установите подключение между ClickHouse и Unity Catalog.

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


## Запрос таблиц каталога Unity с использованием ClickHouse {#querying-unity-catalog-tables-using-clickhouse}

Теперь, когда соединение установлено, можно начать выполнять запросы через каталог Unity. Например:

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

При использовании клиента Iceberg будут отображаться только таблицы Delta с включенным Uniform:

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
Обратные кавычки необходимы, так как ClickHouse не поддерживает более одного пространства имен.
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


## Загрузка данных из Data Lake в ClickHouse {#loading-data-from-your-data-lake-into-clickhouse}

Для загрузки данных из Databricks в ClickHouse сначала создайте локальную таблицу ClickHouse:

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

Затем загрузите данные из таблицы Unity Catalog с помощью `INSERT INTO SELECT`:

```sql
INSERT INTO hits SELECT * FROM unity_uniform.`uniform.delta_hits`;
```
