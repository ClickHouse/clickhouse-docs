---
'slug': '/use-cases/data-lake/unity-catalog'
'sidebar_label': 'Unity Catalog'
'title': 'Unity Catalog'
'pagination_prev': null
'pagination_next': null
'description': 'В этом руководстве мы проведем вас через шаги, чтобы выполнить запрос
  к вашим данным в S3 корзинах с использованием ClickHouse и Unity Catalog.'
'keywords':
- 'Unity'
- 'Data Lake'
'show_related_blogs': true
'doc_type': 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge/>

:::note
Интеграция с Unity Catalog работает для управляемых и внешних таблиц.
В данный момент эта интеграция поддерживается только на AWS.
:::

ClickHouse поддерживает интеграцию с несколькими каталогами (Unity, Glue, Polaris и др.). Этот руководства проведет вас через шаги для выполнения запросов к вашим данным, управляемым Databricks, с использованием ClickHouse и [Unity Catalog](https://www.databricks.com/product/unity-catalog). 

Databricks поддерживает несколько форматов данных для своего lakehouse. С ClickHouse вы можете запрашивать таблицы Unity Catalog как Delta, так и Iceberg.

:::note
Поскольку эта функция является экспериментальной, вам нужно будет включить ее с помощью:
`SET allow_experimental_database_unity_catalog = 1;`
:::

## Конфигурирование Unity в Databricks {#configuring-unity-in-databricks}

Чтобы ClickHouse мог взаимодействовать с каталогом Unity, нужно убедиться, что Unity Catalog настроен для взаимодействия с внешним.reader. Это можно сделать, следуя руководству ["Включить доступ к внешним данным в Unity Catalog"](https://docs.databricks.com/aws/en/external-access/admin).

Кроме того, убедитесь, что принципал, настраивающий интеграцию, имеет привилегию `EXTERNAL USE SCHEMA` [право](https://docs.databricks.com/aws/en/external-access/admin#external-schema) на схему, содержащую таблицы.

После настройки вашего каталога вы должны сгенерировать учетные данные для ClickHouse. Можно использовать два разных метода в зависимости от вашего режима взаимодействия с Unity:

* Для клиентов Iceberg используйте аутентификацию как [служебный пользователь](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m).

* Для клиентов Delta используйте токен личного доступа ([PAT](https://docs.databricks.com/aws/en/dev-tools/auth/pat)).

## Создание соединения между Unity Catalog и ClickHouse {#creating-a-connection-between-unity-catalog-and-clickhouse}

С настроенным Unity Catalog и аутентификацией установите соединение между ClickHouse и Unity Catalog.

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

Если вы используете клиента Iceberg, будут отображаться только таблицы Delta с включенным Uniform:

```sql
SHOW TABLES

┌─name───────────────┐
│ uniform.delta_hits │
└────────────────────┘
```

Чтобы запросить таблицу:

```sql
SELECT count(*) FROM `uniform.delta_hits`
```

:::note Необходимы обратные кавычки
Обратные кавычки необходимы, потому что ClickHouse не поддерживает более одного пространства имен.
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
