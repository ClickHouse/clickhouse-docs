---
description: 'DataLakeCatalogデータベースエンジンを使用すると、ClickHouseを外部データカタログに接続し、オープンなテーブル形式のデータをクエリできます'
sidebar_label: 'DataLakeCatalog'
slug: /engines/database-engines/datalakecatalog
title: 'DataLakeCatalog'
doc_type: 'reference'
---

# DataLakeCatalog \{#datalakecatalog\}

`DataLakeCatalog` データベースエンジンを使用すると、ClickHouse を外部の
データカタログに接続し、データを複製することなくオープンなテーブル形式のデータを
クエリできます。
これにより、ClickHouse は既存の
データレイク基盤とシームレスに連携する強力なクエリエンジンになります。

## サポートされているカタログ \{#supported-catalogs\}

`DataLakeCatalog` エンジンは、以下のデータカタログをサポートします。

* **AWS Glue Catalog** - AWS 環境の Iceberg テーブル用
* **Databricks Unity Catalog** - Delta Lake および Iceberg テーブル用
* **Hive Metastore** - 従来の Hadoop エコシステム向けカタログ
* **REST Catalogs** - Iceberg REST 仕様をサポートする任意のカタログ

## データベースの作成 \{#creating-a-database\}

`DataLakeCatalog` エンジンを使用するには、以下の該当する設定を有効にする必要があります。

```sql
SET allow_experimental_database_iceberg = 1;
SET allow_experimental_database_unity_catalog = 1;
SET allow_experimental_database_glue_catalog = 1;
SET allow_experimental_database_hms_catalog = 1;
SET allow_experimental_database_paimon_rest_catalog = 1;
```

`DataLakeCatalog`エンジンを使用するデータベースは、以下の構文で作成できます。

```sql
CREATE DATABASE database_name
ENGINE = DataLakeCatalog(catalog_endpoint[, user, password])
SETTINGS
catalog_type,
[...]
```

以下の設定がサポートされています。

| Setting                 | Description                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------- |
| `catalog_type`          | catalog の type: `glue`、`unity` (Delta) 、`rest` (Iceberg) 、`hive`、`onelake` (Iceberg)  |
| `warehouse`             | catalog で使用する warehouse/データベース名。                                                      |
| `catalog_credential`    | catalog の認証 credentials (例: API キーまたは token)                                          |
| `auth_header`           | catalog service での認証に使用する custom HTTP header                                          |
| `auth_scope`            | 認証用の OAuth2 scope (OAuth を使用する場合)                                                     |
| `storage_endpoint`      | 基盤となる storage の endpoint URL                                                          |
| `oauth_server_uri`      | 認証に使用する OAuth2 認可サーバーの URI                                                            |
| `vended_credentials`    | catalog から提供される credentials を使用するかどうかを示すブール値 (AWS S3 および Azure ADLS Gen2 をサポート)       |
| `aws_access_key_id`     | S3/Glue へのアクセスに使用する AWS access key ID (vended credentials を使用しない場合)                   |
| `aws_secret_access_key` | S3/Glue へのアクセスに使用する AWS secret access key (vended credentials を使用しない場合)               |
| `region`                | service 用の AWS region (例: `us-east-1`)                                                |
| `dlf_access_key_id`     | DLF へのアクセスに使用する access key ID                                                         |
| `dlf_access_key_secret` | DLF へのアクセスに使用する access key Secret                                                     |

## 例 \{#examples\}

`DataLakeCatalog` エンジンの使用例については、以下のセクションを参照してください。

* [Unity Catalog](/use-cases/data-lake/unity-catalog)
* [Glue Catalog](/use-cases/data-lake/glue-catalog)
* OneLake Catalog
  `allow_experimental_database_iceberg` または `allow_database_iceberg` を有効にすると使用できます。

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
