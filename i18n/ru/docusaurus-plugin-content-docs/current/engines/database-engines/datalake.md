---
description: 'Движок базы данных DataLakeCatalog позволяет подключать ClickHouse к внешним каталогам данных и выполнять запросы к данным в открытых табличных форматах'
sidebar_label: 'DataLakeCatalog'
slug: /engines/database-engines/datalakecatalog
title: 'DataLakeCatalog'
doc_type: 'reference'
---

# DataLakeCatalog \{#datalakecatalog\}

Движок базы данных `DataLakeCatalog` позволяет подключать ClickHouse к внешним
каталогам данных и выполнять запросы к данным в открытых табличных форматах без
необходимости дублировать данные.
Это превращает ClickHouse в мощный механизм выполнения запросов, который
беспрепятственно работает с вашей существующей инфраструктурой озера данных.

## Поддерживаемые каталоги \{#supported-catalogs\}

Движок `DataLakeCatalog` поддерживает следующие каталоги данных:

* **AWS Glue Catalog** - Для таблиц Iceberg в средах AWS
* **Databricks Unity Catalog** - Для таблиц Delta Lake и Iceberg
* **Hive Metastore** - Традиционный каталог экосистемы Hadoop
* **REST Catalogs** - Любой каталог, поддерживающий спецификацию Iceberg REST

## Создание базы данных \{#creating-a-database\}

Чтобы использовать движок `DataLakeCatalog`, необходимо включить указанные ниже настройки:

```sql
SET allow_experimental_database_iceberg = 1;
SET allow_experimental_database_unity_catalog = 1;
SET allow_experimental_database_glue_catalog = 1;
SET allow_experimental_database_hms_catalog = 1;
SET allow_experimental_database_paimon_rest_catalog = 1;
```

Базы данных с движком `DataLakeCatalog` можно создавать с помощью следующего синтаксиса:

```sql
CREATE DATABASE database_name
ENGINE = DataLakeCatalog(catalog_endpoint[, user, password])
SETTINGS
catalog_type,
[...]
```

Поддерживаются следующие параметры:

| Setting                 | Description                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `catalog_type`          | Тип catalog: `glue`, `unity` (Delta), `rest` (Iceberg), `hive`, `onelake` (Iceberg)                                                         |
| `warehouse`             | Имя хранилища/базы данных, используемое в catalog.                                                                                          |
| `catalog_credential`    | Учетные данные для аутентификации в catalog (например, API-ключ или token)                                                                  |
| `auth_header`           | Пользовательский HTTP-заголовок для аутентификации в сервисе catalog                                                                        |
| `auth_scope`            | Область OAuth2 для аутентификации (при использовании OAuth)                                                                                 |
| `storage_endpoint`      | URL конечной точки для базового хранения                                                                                                    |
| `oauth_server_uri`      | URI сервера авторизации OAuth2 для аутентификации                                                                                           |
| `vended_credentials`    | Логическое значение, указывающее, следует ли использовать учетные данные, предоставляемые catalog (поддерживаются AWS S3 и Azure ADLS Gen2) |
| `aws_access_key_id`     | Идентификатор ключа доступа AWS для доступа к S3/Glue (если не используются предоставляемые учетные данные)                                 |
| `aws_secret_access_key` | Секретный ключ доступа AWS для доступа к S3/Glue (если не используются предоставляемые учетные данные)                                      |
| `region`                | Регион AWS для сервиса (например, `us-east-1`)                                                                                              |
| `dlf_access_key_id`     | Идентификатор ключа доступа для DLF                                                                                                         |
| `dlf_access_key_secret` | Секретный ключ доступа для DLF                                                                                                              |

## Примеры \{#examples\}

См. разделы ниже, чтобы ознакомиться с примерами использования движка `DataLakeCatalog`:

* [Unity Catalog](/use-cases/data-lake/unity-catalog)
* [Glue Catalog](/use-cases/data-lake/glue-catalog)
* OneLake Catalog
  Можно использовать, включив `allow_experimental_database_iceberg` или `allow_database_iceberg`.

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
SHOW TABLES IN database_name;
SELECT count() from database_name.table_name;
```
