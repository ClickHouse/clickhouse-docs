---
description: 'Движок базы данных DataLakeCatalog позволяет подключать ClickHouse к внешним каталогам данных и выполнять запросы к данным в открытых форматах таблиц'
sidebar_label: 'DataLakeCatalog'
slug: /engines/database-engines/datalakecatalog
title: 'DataLakeCatalog'
doc_type: 'reference'
---



# DataLakeCatalog {#datalakecatalog}

Движок базы данных `DataLakeCatalog` позволяет подключить ClickHouse к внешним
каталогам данных и выполнять запросы к данным в открытых табличных форматах без необходимости дублирования данных.
Это превращает ClickHouse в мощный движок запросов, который бесшовно работает
с инфраструктурой вашего существующего дата-лейка.



## Поддерживаемые каталоги {#supported-catalogs}

Движок `DataLakeCatalog` поддерживает следующие каталоги данных:

- **AWS Glue Catalog** — для таблиц Iceberg в средах AWS
- **Databricks Unity Catalog** — для таблиц Delta Lake и Iceberg
- **Hive Metastore** — традиционный каталог экосистемы Hadoop
- **REST Catalogs** — любой каталог, поддерживающий спецификацию REST для Iceberg



## Создание базы данных {#creating-a-database}

Чтобы использовать движок `DataLakeCatalog`, необходимо включить приведённые ниже настройки:

```sql
SET allow_experimental_database_iceberg = 1;
SET allow_experimental_database_unity_catalog = 1;
SET allow_experimental_database_glue_catalog = 1;
SET allow_experimental_database_hms_catalog = 1;
```

Базы данных с движком `DataLakeCatalog` можно создавать с помощью следующего синтаксиса:

```sql
CREATE DATABASE имя_базы_данных
ENGINE = DataLakeCatalog(адрес_каталога[, пользователь, пароль])
SETTINGS
тип_каталога,
[...]
```

Поддерживаются следующие настройки:

| Setting                 | Description                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| `catalog_type`          | Тип каталога: `glue`, `unity` (Delta), `rest` (Iceberg), `hive`, `onelake` (Iceberg)                   |
| `warehouse`             | Имя хранилища/базы данных, которое будет использоваться в каталоге.                                    |
| `catalog_credential`    | Учетные данные для аутентификации в каталоге (например, API-ключ или токен)                            |
| `auth_header`           | Пользовательский HTTP-заголовок для аутентификации в сервисе каталога                                  |
| `auth_scope`            | Область действия OAuth2 для аутентификации (если используется OAuth)                                   |
| `storage_endpoint`      | URL конечной точки базового хранилища                                                                  |
| `oauth_server_uri`      | URI сервера авторизации OAuth2 для аутентификации                                                      |
| `vended_credentials`    | Логический флаг, указывающий, использовать ли выдаваемые учетные данные (специфично для AWS)           |
| `aws_access_key_id`     | Идентификатор ключа доступа AWS для доступа к S3/Glue (если не используются выдаваемые учетные данные) |
| `aws_secret_access_key` | Секретный ключ доступа AWS для доступа к S3/Glue (если не используются выдаваемые учетные данные)      |
| `region`                | Регион AWS для сервиса (например, `us-east-1`)                                                         |


## Примеры {#examples}

Ниже приведены примеры использования движка `DataLakeCatalog`:

* [Unity Catalog](/use-cases/data-lake/unity-catalog)
* [Glue Catalog](/use-cases/data-lake/glue-catalog)
* OneLake Catalog\
  может использоваться при включении `allow_experimental_database_iceberg` или `allow_database_iceberg`.

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
