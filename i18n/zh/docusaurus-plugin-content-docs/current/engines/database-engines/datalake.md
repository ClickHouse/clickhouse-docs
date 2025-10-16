---
'description': 'DataLakeCatalog 数据库引擎使您能够将 ClickHouse 连接到外部数据目录并查询开放表格式数据'
'sidebar_label': 'DataLakeCatalog'
'slug': '/engines/database-engines/datalakecatalog'
'title': 'DataLakeCatalog'
'doc_type': 'reference'
---


# DataLakeCatalog

`DataLakeCatalog` 数据库引擎使您能够将 ClickHouse 连接到外部数据目录，并查询开放表格式数据，无需数据重复。这将 ClickHouse 转变为一个强大的查询引擎，可以与您现有的数据湖基础设施无缝协作。

## Supported catalogs {#supported-catalogs}

`DataLakeCatalog` 引擎支持以下数据目录：

- **AWS Glue Catalog** - 用于 AWS 环境中的 Iceberg 表
- **Databricks Unity Catalog** - 用于 Delta Lake 和 Iceberg 表
- **Hive Metastore** - 传统 Hadoop 生态系统目录
- **REST Catalogs** - 支持 Iceberg REST 规范的任何目录

## Creating a database {#creating-a-database}

您需要启用以下相关设置以使用 `DataLakeCatalog` 引擎：

```sql
SET allow_experimental_database_iceberg = 1;
SET allow_experimental_database_unity_catalog = 1;
SET allow_experimental_database_glue_catalog = 1;
SET allow_experimental_database_hms_catalog = 1;
```

使用以下语法可以创建带有 `DataLakeCatalog` 引擎的数据库：

```sql
CREATE DATABASE database_name
ENGINE = DataLakeCatalog(catalog_endpoint[, user, password])
SETTINGS
catalog_type,
[...]
```

支持以下设置：

| Setting                 | Description                                                               |
|-------------------------|---------------------------------------------------------------------------|
| `catalog_type`          | 目录类型: `glue`, `unity` (Delta), `rest` (Iceberg), `hive`            |
| `warehouse`             | 要在目录中使用的仓库/数据库名称。                                       |
| `catalog_credential`    | 用于目录的身份验证凭据（例如，API 密钥或令牌）                          |
| `auth_header`           | 用于与目录服务进行身份验证的自定义 HTTP 头                             |
| `auth_scope`            | 用于身份验证的 OAuth2 范围（如果使用 OAuth）                           |
| `storage_endpoint`      | 用于底层存储的端点 URL                                                  |
| `oauth_server_uri`      | 用于身份验证的 OAuth2 授权服务器的 URI                                 |
| `vended_credentials`    | 布尔值，指示是否使用供应商凭据（特定于 AWS）                             |
| `aws_access_key_id`     | 用于 S3/Glue 访问的 AWS 访问密钥 ID（如果不使用供应商凭据）            |
| `aws_secret_access_key` | 用于 S3/Glue 访问的 AWS 秘密访问密钥（如果不使用供应商凭据）          |
| `region`                | 服务的 AWS 区域（例如，`us-east-1`）                                     |

## Examples {#examples}

请参见以下页面以获取使用 `DataLakeCatalog` 引擎的示例：

* [Unity Catalog](/use-cases/data-lake/unity-catalog)
* [Glue Catalog](/use-cases/data-lake/glue-catalog)
