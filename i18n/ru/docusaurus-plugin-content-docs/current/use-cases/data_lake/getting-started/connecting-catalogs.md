---
title: 'Подключение к каталогу данных'
sidebar_label: 'Подключение к каталогам'
slug: /use-cases/data-lake/getting-started/connecting-catalogs
sidebar_position: 2
toc_max_heading_level: 3
pagination_prev: use-cases/data_lake/getting-started/querying-directly
pagination_next: use-cases/data_lake/getting-started/accelerating-analytics
description: 'Подключите ClickHouse к внешним каталогам данных с помощью движка базы данных DataLakeCatalog, чтобы сделать таблицы каталога доступными как нативные базы данных ClickHouse.'
keywords: ['data lake', 'lakehouse', 'catalog', 'glue', 'unity', 'rest', 'lakekeeper', 'nessie', 'OneLake']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

В [предыдущем разделе](/use-cases/data-lake/getting-started/querying-directly) вы выполняли запросы к открытым форматам таблиц, передавая пути к хранилищу напрямую. На практике большинство организаций управляют метаданными таблиц через **каталог данных** — центральный реестр, который отслеживает расположение таблиц, их схемы и партиции. Когда вы подключаете ClickHouse к каталогу с помощью движка базы данных [`DataLakeCatalog`](/engines/database-engines/datalakecatalog), весь каталог становится доступен как база данных ClickHouse. Каждая таблица в каталоге автоматически появляется и её можно запрашивать с использованием полного SQL ClickHouse — нет необходимости знать пути к отдельным таблицам или управлять учётными данными для каждой таблицы.

В этом руководстве рассматривается подключение к [Databricks Unity Catalog](https://www.databricks.com/product/unity-catalog). ClickHouse также поддерживает следующие каталоги — полные инструкции по настройке приведены в соответствующих руководствах:

| Каталог              | Руководство по настройке                                      |
| -------------------- | ------------------------------------------------------------- |
| AWS Glue             | [каталог AWS Glue](/use-cases/data-lake/glue-catalog)         |
| Iceberg REST Catalog | [REST-каталог](/use-cases/data-lake/rest-catalog)             |
| Lakekeeper           | [каталог Lakekeeper](/use-cases/data-lake/lakekeeper-catalog) |
| Project Nessie       | [каталог Nessie](/use-cases/data-lake/nessie-catalog)         |
| Microsoft OneLake    | [Fabric OneLake](/use-cases/data-lake/onelake-catalog)        |


## Подключение к Unity Catalog \{#connecting-to-unity-catalog\}

<BetaBadge/>

В качестве примера мы будем использовать Unity Catalog.

[Databricks Unity Catalog](https://www.databricks.com/product/unity-catalog) обеспечивает централизованное управление данными в lakehouse-платформе Databricks.

Databricks поддерживает несколько форматов данных для своей lakehouse-платформы. С ClickHouse вы можете выполнять запросы к таблицам Unity Catalog как в формате Delta, так и в формате Iceberg.

:::note
Интеграция с Unity Catalog работает как для управляемых, так и для внешних таблиц.
В настоящее время эта интеграция поддерживается только на AWS.
:::

### Настройка Unity в Databricks \{#configuring-unity-in-databricks\}

Чтобы разрешить ClickHouse взаимодействовать с Unity Catalog, необходимо убедиться, что ваш Unity Catalog настроен для взаимодействия с внешним клиентом. Это можно сделать, следуя руководству ["Enable external data access to Unity Catalog"](https://docs.databricks.com/aws/en/external-access/admin).

Помимо включения внешнего доступа, убедитесь, что субъект (principal), выполняющий настройку интеграции, имеет привилегию `EXTERNAL USE SCHEMA` ([privilege](https://docs.databricks.com/aws/en/external-access/admin#external-schema)) для схемы, содержащей таблицы.

После настройки каталога необходимо сгенерировать учетные данные для ClickHouse. Можно использовать два разных подхода в зависимости от режима взаимодействия с Unity:

* Для клиентов Iceberg аутентифицируйтесь с помощью [service principal](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m).

* Для клиентов Delta используйте Personal Access Token ([PAT](https://docs.databricks.com/aws/en/dev-tools/auth/pat)).

### Подключение к каталогу \{#connect-catalog\}

С указанными учетными данными вы можете подключиться к соответствующему endpoint, чтобы выполнять запросы к таблицам Iceberg или Delta.

<Tabs groupId="connection-formats">
<TabItem value="delta" label="Delta" default>

[Unity catalog](/use-cases/data-lake/unity-catalog) следует использовать для доступа к данным в формате Delta.

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

### Список таблиц \{#list-tables\}

После установления подключения к каталогу вы можете просмотреть список таблиц.

```sql
SHOW TABLES FROM unity

┌─name───────────────────────────────────────────────┐
│ unity.logs                                         │
│ unity.single_day_log                               │
└────────────────────────────────────────────────────┘

31 rows in set.
```


### Изучение схем таблиц \{#exploring-table-schemas\}

Мы можем воспользоваться стандартной командой `SHOW CREATE TABLE`, чтобы увидеть, как были созданы таблицы.

:::note Требуются обратные кавычки
Обратите внимание на необходимость указать Пространство имен и имя таблицы, заключённые в обратные кавычки — ClickHouse не поддерживает более одного Пространства имен.
:::

Далее предполагается, что запрос выполняется к REST-каталогу Iceberg:

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


### Выполнение запроса к таблице \{#querying-a-table\}

Поддерживаются все функции ClickHouse. Как и ранее, пространство имён и имя таблицы должны быть заключены в обратные кавычки.

```sql

SELECT count()
FROM unity.`icebench.single_day_log`

┌───count()─┐
│ 282634391 │ -- 282.63 million
└───────────┘

1 row in set. Elapsed: 1.265 sec.
```

Полные инструкции по настройке см. в [справочном руководстве по Unity Catalog](/use-cases/data-lake/unity-catalog).
