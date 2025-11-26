---
slug: /use-cases/data-lake/unity-catalog
sidebar_label: 'Unity catalog'
title: 'Unity catalog'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве мы рассмотрим, как выполнять запросы к вашим данным в бакетах S3 с помощью ClickHouse и Unity Catalog.'
keywords: ['Unity', 'Data Lake']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

:::note
Интеграция с Unity Catalog работает как для управляемых, так и для внешних таблиц.
В настоящий момент эта интеграция поддерживается только в AWS.
:::

ClickHouse поддерживает интеграцию с несколькими каталогами (Unity, Glue, Polaris и т.д.). В этом руководстве описаны шаги по выполнению запросов к данным, управляемым Databricks, с помощью ClickHouse и [Unity Catalog](https://www.databricks.com/product/unity-catalog).

Databricks поддерживает несколько форматов данных для своей lakehouse-платформы. С ClickHouse вы можете выполнять запросы к таблицам Unity Catalog в форматах Delta и Iceberg.

:::note
Поскольку эта функциональность является экспериментальной, вам необходимо включить её с помощью:
`SET allow_experimental_database_unity_catalog = 1;`
:::


## Настройка Unity в Databricks {#configuring-unity-in-databricks}

Чтобы ClickHouse мог взаимодействовать с каталогом Unity, необходимо убедиться, что Unity Catalog настроен на взаимодействие с внешним клиентом. Это можно сделать, выполнив шаги из руководства ["Enable external data access to Unity Catalog"](https://docs.databricks.com/aws/en/external-access/admin).

Помимо включения внешнего доступа, убедитесь, что принципал (principal), настраивающий интеграцию, имеет привилегию `EXTERNAL USE SCHEMA` ([privilege](https://docs.databricks.com/aws/en/external-access/admin#external-schema)) для схемы, содержащей таблицы.

После того как ваш каталог настроен, необходимо сгенерировать учетные данные для ClickHouse. Можно использовать два разных метода в зависимости от режима взаимодействия с Unity:

* Для клиентов Iceberg используйте аутентификацию от имени [service principal](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m).

* Для клиентов Delta используйте Personal Access Token ([PAT](https://docs.databricks.com/aws/en/dev-tools/auth/pat)).



## Создание соединения между Unity Catalog и ClickHouse

После настройки Unity Catalog и аутентификации установите соединение между ClickHouse и Unity Catalog.

### Чтение Delta

```sql
CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog')
SETTINGS warehouse = 'CATALOG_NAME', catalog_credential = '<PAT>', catalog_type = 'unity'
```

### Чтение из Iceberg

```sql
CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog/iceberg')
SETTINGS catalog_type = 'rest', catalog_credential = '<client-id>:<client-secret>', warehouse = 'workspace', 
oauth_server_uri = 'https://<workspace-id>.cloud.databricks.com/oidc/v1/token', auth_scope = 'all-apis,sql'
```


## Выполнение запросов к таблицам Unity Catalog с помощью ClickHouse

Теперь, когда подключение установлено, вы можете начинать выполнять запросы по Unity Catalog. Например:

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

Если вы используете клиент Iceberg, будут отображаться только таблицы Delta, для которых включён Uniform:

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
Обратные кавычки требуются, так как ClickHouse не поддерживает более одного пространства имен.
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


## Загрузка данных из озера данных (Data Lake) в ClickHouse

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

Затем загрузите данные из таблицы Unity Catalog с помощью оператора `INSERT INTO ... SELECT`:

```sql
INSERT INTO hits SELECT * FROM unity_uniform.`uniform.delta_hits`;
```
