---
title: 'Подключение к каталогу данных'
sidebar_label: 'Подключение к каталогам'
slug: /use-cases/data-lake/getting-started/connecting-catalogs
sidebar_position: 2
toc_max_heading_level: 3
pagination_prev: use-cases/data_lake/guides/querying-directly
pagination_next: use-cases/data_lake/guides/accelerating-analytics
description: 'Подключите ClickHouse к внешним каталогам данных с помощью движка баз данных DataLakeCatalog, чтобы представить таблицы каталога в виде собственных баз данных ClickHouse.'
keywords: ['озера данных', 'lakehouse', 'каталог', 'glue', 'unity', 'rest', 'lakekeeper', 'nessie', 'OneLake']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

В [предыдущем разделе](/use-cases/data-lake/getting-started/querying-directly) вы выполняли запросы к открытым табличным форматам, напрямую указывая пути к хранилищу. На практике большинство организаций управляют метаданными таблиц через **каталог данных** — централизованный реестр, в котором хранятся сведения о расположении таблиц, схемах и партициях. При подключении ClickHouse к каталогу с помощью движка базы данных [`DataLakeCatalog`](/engines/database-engines/datalakecatalog) весь каталог становится доступен как база данных ClickHouse. Все таблицы из каталога появляются автоматически, и к ним можно выполнять запросы, используя полный SQL ClickHouse, — без необходимости знать пути к отдельным таблицам или управлять учетными данными для каждой из них.

В этом руководстве показано, как подключиться к [Databricks Unity Catalog](https://www.databricks.com/product/unity-catalog). ClickHouse также поддерживает следующие каталоги — полные инструкции по настройке см. в соответствующих справочных руководствах:

| Каталог              | Справочное руководство                                        |
| -------------------- | ------------------------------------------------------------- |
| AWS Glue             | [Каталог AWS Glue](/use-cases/data-lake/glue-catalog)         |
| Iceberg REST Catalog | [REST-каталог](/use-cases/data-lake/rest-catalog)             |
| Lakekeeper           | [Каталог Lakekeeper](/use-cases/data-lake/lakekeeper-catalog) |
| Project Nessie       | [Каталог Nessie](/use-cases/data-lake/nessie-catalog)         |
| Microsoft OneLake    | [Fabric OneLake](/use-cases/data-lake/onelake-catalog)        |

## Подключение к Unity Catalog \{#connecting-to-unity-catalog\}

<BetaBadge />

В качестве примера мы будем использовать Unity Catalog.

[Databricks Unity Catalog](https://www.databricks.com/product/unity-catalog) предоставляет централизованное управление данными lakehouse в Databricks.

Databricks поддерживает несколько форматов данных для своего lakehouse. С помощью ClickHouse вы можете выполнять запросы к таблицам Unity Catalog как к таблицам Delta и Iceberg.

:::note
Интеграция с Unity Catalog работает как с управляемыми, так и с внешними таблицами.
В настоящее время эта интеграция поддерживается только в AWS.
:::

### Настройка Unity в Databricks \{#configuring-unity-in-databricks\}

Чтобы разрешить ClickHouse взаимодействовать с каталогом Unity, необходимо убедиться, что ваш Unity Catalog настроен на взаимодействие с внешним клиентом чтения. Для этого следуйте руководству [«Enable external data access to Unity Catalog»](https://docs.databricks.com/aws/en/external-access/admin).

Помимо включения внешнего доступа, убедитесь, что субъект безопасности, настраивающий интеграцию, имеет [привилегию](https://docs.databricks.com/aws/en/external-access/admin#external-schema) `EXTERNAL USE SCHEMA` для схемы, содержащей таблицы.

После настройки каталога необходимо сгенерировать учетные данные для ClickHouse. В зависимости от режима взаимодействия с Unity можно использовать два разных метода:

* Для клиентов Iceberg используйте аутентификацию через [сервисный субъект](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m).

* Для клиентов Delta используйте персональный токен доступа ([PAT](https://docs.databricks.com/aws/en/dev-tools/auth/pat)).

### Подключение к каталогу \{#connect-catalog\}

Используя эти учетные данные, вы можете подключиться к соответствующему эндпоинту и выполнять запросы к таблицам Iceberg или Delta.

<Tabs groupId="connection-formats">
  <TabItem value="delta" label="Delta" default>
    Для доступа к данным в формате Delta следует использовать [Unity Catalog](/use-cases/data-lake/unity-catalog).

    ```sql
    SET allow_experimental_database_unity_catalog = 1;

    CREATE DATABASE unity
    ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog')
    SETTINGS warehouse = 'CATALOG_NAME', catalog_credential = '<PAT>', catalog_type = 'unity';
    ```
  </TabItem>

  <TabItem value="iceberg" label="Iceberg" default>
    ```sql
    SET allow_database_iceberg = 1;

    CREATE DATABASE unity
    ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog/iceberg-rest')
    SETTINGS catalog_type = 'rest', catalog_credential = '<client-id>:<client-secret>', warehouse = 'workspace',
    oauth_server_uri = 'https://<workspace-id>.cloud.databricks.com/oidc/v1/token', auth_scope = 'all-apis,sql';
    ```
  </TabItem>
</Tabs>

### Просмотр списка таблиц \{#list-tables\}

После подключения к каталогу вы можете вывести список таблиц.

```sql
SHOW TABLES FROM unity

┌─name───────────────────────────────────────────────┐
│ unity.logs                                         │
│ unity.single_day_log                               │
└────────────────────────────────────────────────────┘

31 rows in set.
```

### Изучение схем таблиц \{#exploring-table-schemas\}

Мы можем использовать стандартную команду `SHOW CREATE TABLE`, чтобы посмотреть, как были созданы таблицы.

:::note Обратные кавычки обязательны
Обратите внимание, что необходимо указать пространство имен и имя таблицы, заключив их в обратные кавычки, — ClickHouse не поддерживает более одного пространства имен.
:::

Ниже предполагается выполнение запросов к REST-каталогу Iceberg:

```sql
SHOW CREATE TABLE unity.`icebench.single_day_log`

CREATE TABLE unity.`icebench.single_day_log`
(
    `pull_request_number` Nullable(Int64),
    `commit_sha` Nullable(String),
    `check_start_time` Nullable(DateTime64(6, 'UTC')),
    `check_name` Nullable(String),
    `instance_type` Nullable(String),
    `instance_id` Nullable(String),
    `event_date` Nullable(Date32),
    `event_time` Nullable(DateTime64(6, 'UTC')),
    `event_time_microseconds` Nullable(DateTime64(6, 'UTC')),
    `thread_name` Nullable(String),
    `thread_id` Nullable(Decimal(20, 0)),
    `level` Nullable(String),
    `query_id` Nullable(String),
    `logger_name` Nullable(String),
    `message` Nullable(String),
    `revision` Nullable(Int64),
    `source_file` Nullable(String),
    `source_line` Nullable(Decimal(20, 0)),
    `message_format_string` Nullable(String)
)
ENGINE = Iceberg('s3://...')
```

### Запрос к таблице \{#querying-a-table\}

Поддерживаются все функции ClickHouse. И снова: пространство имен и имя таблицы должны быть заключены в обратные кавычки.

```sql

SELECT count()
FROM unity.`icebench.single_day_log`

┌───count()─┐
│ 282634391 │ -- 282.63 million
└───────────┘

1 row in set. Elapsed: 1.265 sec.
```

Полные инструкции по настройке см. в [справочном руководстве по Unity Catalog](/use-cases/data-lake/unity-catalog).
