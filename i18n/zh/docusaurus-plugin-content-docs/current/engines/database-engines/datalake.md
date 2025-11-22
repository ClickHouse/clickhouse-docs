---
description: 'DataLakeCatalog 数据库引擎使您能够将 ClickHouse 连接到外部数据目录，并查询开放表格式的数据'
sidebar_label: 'DataLakeCatalog'
slug: /engines/database-engines/datalakecatalog
title: 'DataLakeCatalog'
doc_type: 'reference'
---



# DataLakeCatalog

`DataLakeCatalog` 数据库引擎使您能够将 ClickHouse 连接到外部
数据目录，并在无需复制数据的情况下查询开放表格式数据。
这使 ClickHouse 转变为一个强大的查询引擎，可与您现有的数据湖基础设施
无缝协同工作。



## 支持的目录 {#supported-catalogs}

`DataLakeCatalog` 引擎支持以下数据目录：

- **AWS Glue Catalog** - 适用于 AWS 环境中的 Iceberg 表
- **Databricks Unity Catalog** - 适用于 Delta Lake 和 Iceberg 表
- **Hive Metastore** - 传统 Hadoop 生态系统目录
- **REST Catalogs** - 任何支持 Iceberg REST 规范的目录


## 创建数据库 {#creating-a-database}

要使用 `DataLakeCatalog` 引擎,需要启用以下相关设置:

```sql
SET allow_experimental_database_iceberg = 1;
SET allow_experimental_database_unity_catalog = 1;
SET allow_experimental_database_glue_catalog = 1;
SET allow_experimental_database_hms_catalog = 1;
```

可以使用以下语法创建使用 `DataLakeCatalog` 引擎的数据库:

```sql
CREATE DATABASE database_name
ENGINE = DataLakeCatalog(catalog_endpoint[, user, password])
SETTINGS
catalog_type,
[...]
```

支持以下设置:

| 设置                     | 描述                                                                             |
| ----------------------- | --------------------------------------------------------------------------------------- |
| `catalog_type`          | 目录类型:`glue`、`unity` (Delta)、`rest` (Iceberg)、`hive`、`onelake` (Iceberg) |
| `warehouse`             | 目录中使用的仓库/数据库名称                                      |
| `catalog_credential`    | 目录的身份验证凭据(例如 API 密钥或令牌)                      |
| `auth_header`           | 用于目录服务身份验证的自定义 HTTP 标头                          |
| `auth_scope`            | 身份验证的 OAuth2 作用域(如果使用 OAuth)                                        |
| `storage_endpoint`      | 底层存储的端点 URL                                                 |
| `oauth_server_uri`      | 身份验证的 OAuth2 授权服务器 URI                               |
| `vended_credentials`    | 布尔值,指示是否使用托管凭据(AWS 特定)                     |
| `aws_access_key_id`     | 用于 S3/Glue 访问的 AWS 访问密钥 ID(如果不使用托管凭据)                  |
| `aws_secret_access_key` | 用于 S3/Glue 访问的 AWS 秘密访问密钥(如果不使用托管凭据)              |
| `region`                | 服务的 AWS 区域(例如 `us-east-1`)                                          |


## 示例 {#examples}

以下章节提供了使用 `DataLakeCatalog` 引擎的示例：

- [Unity Catalog](/use-cases/data-lake/unity-catalog)
- [Glue Catalog](/use-cases/data-lake/glue-catalog)
- OneLake Catalog
  通过启用 `allow_experimental_database_iceberg` 或 `allow_database_iceberg` 即可使用。

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
