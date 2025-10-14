---
'description': 'Движок базы данных DataLakeCatalog позволяет вам подключать ClickHouse
  к внешним каталогам данных и выполнять запросы к данным в открытом формате таблиц'
'sidebar_label': 'DataLakeCatalog'
'slug': '/engines/database-engines/datalakecatalog'
'title': 'DataLakeCatalog'
'doc_type': 'reference'
---
# DataLakeCatalog

Движок базы данных `DataLakeCatalog` позволяет вам подключать ClickHouse к внешним
каталогам данных и выполнять запросы к данным в открытом табличном формате без необходимости дублирования данных.
Это преобразует ClickHouse в мощный движок запросов, который бесшовно работает с
вашей существующей инфраструктурой ДатаЛэйк.

## Поддерживаемые каталоги {#supported-catalogs}

Движок `DataLakeCatalog` поддерживает следующие каталоги данных:

- **AWS Glue Catalog** - Для таблиц Iceberg в средах AWS
- **Databricks Unity Catalog** - Для таблиц Delta Lake и Iceberg
- **Hive Metastore** - Традиционный каталог экосистемы Hadoop
- **REST Catalogs** - Любой каталог, поддерживающий спецификацию Iceberg REST

## Создание базы данных {#creating-a-database}

Вам необходимо включить соответствующие настройки ниже, чтобы использовать движок `DataLakeCatalog`:

```sql
SET allow_experimental_database_iceberg = 1;
SET allow_experimental_database_unity_catalog = 1;
SET allow_experimental_database_glue_catalog = 1;
SET allow_experimental_database_hms_catalog = 1;
```

Базы данных с движком `DataLakeCatalog` могут быть созданы с использованием следующего синтаксиса:

```sql
CREATE DATABASE database_name
ENGINE = DataLakeCatalog(catalog_endpoint[, user, password])
SETTINGS
catalog_type,
[...]
```

Поддерживаются следующие настройки:

| Настройка               | Описание                                                                |
|-------------------------|-------------------------------------------------------------------------|
| `catalog_type`          | Тип каталога: `glue`, `unity` (Delta), `rest` (Iceberg), `hive`       |
| `warehouse`             | Имя склада/базы данных, используемое в каталоге.                       |
| `catalog_credential`    | Учетные данные для аутентификации в каталоге (например, API ключ или токен) |
| `auth_header`           | Именованный HTTP-заголовок для аутентификации с сервисом каталога      |
| `auth_scope`            | Область OAuth2 для аутентификации (если используется OAuth)            |
| `storage_endpoint`      | URL-адрес конечной точки для подлежащего хранилища                     |
| `oauth_server_uri`      | URI сервера авторизации OAuth2 для аутентификации                      |
| `vended_credentials`    | Boolean, указывающий на необходимость использования предоставленных учетных данных (специфично для AWS) |
| `aws_access_key_id`     | AWS access key ID для доступа к S3/Glue (если не используются предоставленные учетные данные) |
| `aws_secret_access_key` | AWS secret access key для доступа к S3/Glue (если не используются предоставленные учетные данные) |
| `region`                | Регион AWS для сервиса (например, `us-east-1`)                         |

## Примеры {#examples}

Смотрите страницы ниже для примеров использования движка `DataLakeCatalog`:

* [Unity Catalog](/use-cases/data-lake/unity-catalog)
* [Glue Catalog](/use-cases/data-lake/glue-catalog)