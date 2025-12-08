---
description: 'DataLakeCatalog 数据库引擎允许你将 ClickHouse 连接到外部数据目录，并查询开放表格式数据'
sidebar_label: 'DataLakeCatalog'
slug: /engines/database-engines/datalakecatalog
title: 'DataLakeCatalog'
doc_type: 'reference'
---

# DataLakeCatalog {#datalakecatalog}

`DataLakeCatalog` 数据库引擎使您能够将 ClickHouse 连接到外部数据目录，并在无需复制数据的情况下查询开放表格式数据。
这使 ClickHouse 成为一个功能强大的查询引擎，能够与您现有的数据湖基础设施无缝协同工作。

## 支持的目录 {#supported-catalogs}

`DataLakeCatalog` 引擎支持以下数据目录：

- **AWS Glue Catalog** - 用于 AWS 环境中的 Iceberg 表
- **Databricks Unity Catalog** - 用于 Delta Lake 和 Iceberg 表
- **Hive Metastore** - 传统 Hadoop 生态系统中的目录
- **REST Catalogs** - 任意支持 Iceberg REST 规范的目录

## 创建数据库 {#creating-a-database}

要使用 `DataLakeCatalog` 引擎，需要启用下列相关设置：

```sql
SET allow_experimental_database_iceberg = 1;
SET allow_experimental_database_unity_catalog = 1;
SET allow_experimental_database_glue_catalog = 1;
SET allow_experimental_database_hms_catalog = 1;
```

可以使用以下语法创建使用 `DataLakeCatalog` 引擎的数据库：

```sql
CREATE DATABASE database_name
ENGINE = DataLakeCatalog(catalog_endpoint[, user, password])
SETTINGS
catalog_type,
[...]
```

支持以下设置：

| Setting                 | Description                                                          |
| ----------------------- | -------------------------------------------------------------------- |
| `catalog_type`          | 目录类型：`glue`、`unity`（Delta）、`rest`（Iceberg）、`hive`、`onelake`（Iceberg） |
| `warehouse`             | 在目录中使用的仓库 / 数据库名称。                                                   |
| `catalog_credential`    | 目录的认证凭证（例如 API key 或 token）                                          |
| `auth_header`           | 用于与目录服务进行认证的自定义 HTTP 请求头                                             |
| `auth_scope`            | 用于认证的 OAuth2 范围（scope）（如果使用 OAuth）                                   |
| `storage_endpoint`      | 底层存储的端点 URL                                                          |
| `oauth_server_uri`      | 用于认证的 OAuth2 授权服务器 URI                                               |
| `vended_credentials`    | 布尔值，指示是否使用由服务下发的凭证（vended credentials，AWS 特定）                        |
| `aws_access_key_id`     | 用于访问 S3/Glue 的 AWS access key ID（如果不使用 vended credentials）           |
| `aws_secret_access_key` | 用于访问 S3/Glue 的 AWS secret access key（如果不使用 vended credentials）       |
| `region`                | 服务所在的 AWS 区域（例如 `us-east-1`）                                         |

## 示例 {#examples}

请参阅以下部分，了解如何使用 `DataLakeCatalog` 引擎的示例：

* [Unity Catalog](/use-cases/data-lake/unity-catalog)
* [Glue Catalog](/use-cases/data-lake/glue-catalog)
* OneLake Catalog\
  可以通过启用 `allow_experimental_database_iceberg` 或 `allow_database_iceberg` 来使用。

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
