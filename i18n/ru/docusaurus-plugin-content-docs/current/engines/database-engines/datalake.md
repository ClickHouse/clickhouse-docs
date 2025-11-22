---
description: 'Движок базы данных DataLakeCatalog позволяет подключать ClickHouse к внешним каталогам данных и выполнять запросы к данным в открытых табличных форматах'
sidebar_label: 'DataLakeCatalog'
slug: /engines/database-engines/datalakecatalog
title: 'DataLakeCatalog'
doc_type: 'reference'
---



# DataLakeCatalog

Движок базы данных `DataLakeCatalog` позволяет подключить ClickHouse к внешним
каталогам данных и выполнять запросы к данным в открытых табличных форматах без необходимости их дублирования.
Это превращает ClickHouse в мощный механизм выполнения запросов, который органично работает
с вашей существующей инфраструктурой озера данных.



## Поддерживаемые каталоги {#supported-catalogs}

Движок `DataLakeCatalog` поддерживает следующие каталоги данных:

- **AWS Glue Catalog** — для таблиц Iceberg в средах AWS
- **Databricks Unity Catalog** — для таблиц Delta Lake и Iceberg
- **Hive Metastore** — традиционный каталог экосистемы Hadoop
- **REST Catalogs** — любой каталог с поддержкой спецификации Iceberg REST


## Создание базы данных {#creating-a-database}

Для использования движка `DataLakeCatalog` необходимо включить соответствующие настройки:

```sql
SET allow_experimental_database_iceberg = 1;
SET allow_experimental_database_unity_catalog = 1;
SET allow_experimental_database_glue_catalog = 1;
SET allow_experimental_database_hms_catalog = 1;
```

Базы данных с движком `DataLakeCatalog` создаются с использованием следующего синтаксиса:

```sql
CREATE DATABASE database_name
ENGINE = DataLakeCatalog(catalog_endpoint[, user, password])
SETTINGS
catalog_type,
[...]
```

Поддерживаются следующие настройки:

| Настройка               | Описание                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------- |
| `catalog_type`          | Тип каталога: `glue`, `unity` (Delta), `rest` (Iceberg), `hive`, `onelake` (Iceberg) |
| `warehouse`             | Имя хранилища/базы данных, используемое в каталоге.                                    |
| `catalog_credential`    | Учетные данные для аутентификации в каталоге (например, API-ключ или токен)            |
| `auth_header`           | Пользовательский HTTP-заголовок для аутентификации в службе каталога                   |
| `auth_scope`            | Область OAuth2 для аутентификации (при использовании OAuth)                            |
| `storage_endpoint`      | URL конечной точки базового хранилища                                                  |
| `oauth_server_uri`      | URI сервера авторизации OAuth2 для аутентификации                                      |
| `vended_credentials`    | Логическое значение, указывающее на использование предоставляемых учетных данных (специфично для AWS) |
| `aws_access_key_id`     | Идентификатор ключа доступа AWS для доступа к S3/Glue (если не используются предоставляемые учетные данные) |
| `aws_secret_access_key` | Секретный ключ доступа AWS для доступа к S3/Glue (если не используются предоставляемые учетные данные) |
| `region`                | Регион AWS для службы (например, `us-east-1`)                                          |


## Примеры {#examples}

Примеры использования движка `DataLakeCatalog` приведены в следующих разделах:

- [Unity Catalog](/use-cases/data-lake/unity-catalog)
- [Glue Catalog](/use-cases/data-lake/glue-catalog)
- OneLake Catalog
  Можно использовать, включив настройку `allow_experimental_database_iceberg` или `allow_database_iceberg`.

```sql
CREATE DATABASE database_name
ENGINE = DataLakeCatalog(catalog_endpoint)
SETTINGS
   catalog_type = 'onelake',
   warehouse = warehouse,
   onelake_tenant_id = tenant_id,
   oauth_server_uri = server_uri,
   auth_scope = auth_scope,
   onelake_client_id = client_id,
   onelake_client_secret = client_secret;
SHOW TABLES IN databse_name;
SELECT count() from database_name.table_name;
```
