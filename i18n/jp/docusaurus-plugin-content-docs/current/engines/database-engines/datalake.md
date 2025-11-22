---
description: 'DataLakeCatalog データベースエンジンを使用すると、ClickHouse を外部データカタログに接続し、オープンテーブルフォーマットのデータをクエリできます。'
sidebar_label: 'DataLakeCatalog'
slug: /engines/database-engines/datalakecatalog
title: 'DataLakeCatalog'
doc_type: 'reference'
---



# DataLakeCatalog

`DataLakeCatalog` データベースエンジンを使用すると、ClickHouse を外部データカタログに接続し、データを複製することなくオープンテーブル形式のデータをクエリできます。
これにより、ClickHouse は既存のデータレイクインフラストラクチャとシームレスに連携する強力なクエリエンジンへと変わります。



## サポートされているカタログ {#supported-catalogs}

`DataLakeCatalog`エンジンは以下のデータカタログをサポートしています：

- **AWS Glue Catalog** - AWS環境のIcebergテーブル向け
- **Databricks Unity Catalog** - Delta LakeおよびIcebergテーブル向け
- **Hive Metastore** - 従来のHadoopエコシステムカタログ
- **REST Catalogs** - Iceberg REST仕様をサポートする任意のカタログ


## データベースの作成 {#creating-a-database}

`DataLakeCatalog`エンジンを使用するには、以下の関連設定を有効にする必要があります：

```sql
SET allow_experimental_database_iceberg = 1;
SET allow_experimental_database_unity_catalog = 1;
SET allow_experimental_database_glue_catalog = 1;
SET allow_experimental_database_hms_catalog = 1;
```

`DataLakeCatalog`エンジンを使用したデータベースは、以下の構文で作成できます：

```sql
CREATE DATABASE database_name
ENGINE = DataLakeCatalog(catalog_endpoint[, user, password])
SETTINGS
catalog_type,
[...]
```

以下の設定がサポートされています：

| 設定                    | 説明                                                                             |
| ----------------------- | --------------------------------------------------------------------------------------- |
| `catalog_type`          | カタログのタイプ：`glue`、`unity`（Delta）、`rest`（Iceberg）、`hive`、`onelake`（Iceberg） |
| `warehouse`             | カタログで使用するウェアハウス/データベース名                                      |
| `catalog_credential`    | カタログの認証資格情報（例：APIキーまたはトークン）                      |
| `auth_header`           | カタログサービスとの認証用のカスタムHTTPヘッダー                          |
| `auth_scope`            | 認証用のOAuth2スコープ（OAuthを使用する場合）                                        |
| `storage_endpoint`      | 基盤となるストレージのエンドポイントURL                                                 |
| `oauth_server_uri`      | 認証用のOAuth2認可サーバーのURI                               |
| `vended_credentials`    | vended credentialsを使用するかどうかを示すブール値（AWS固有）                     |
| `aws_access_key_id`     | S3/Glueアクセス用のAWSアクセスキーID（vended credentialsを使用しない場合）                  |
| `aws_secret_access_key` | S3/Glueアクセス用のAWSシークレットアクセスキー（vended credentialsを使用しない場合）              |
| `region`                | サービスのAWSリージョン（例：`us-east-1`）                                          |


## 例 {#examples}

`DataLakeCatalog`エンジンの使用例については、以下のセクションを参照してください:

- [Unity Catalog](/use-cases/data-lake/unity-catalog)
- [Glue Catalog](/use-cases/data-lake/glue-catalog)
- OneLake Catalog
  `allow_experimental_database_iceberg`または`allow_database_iceberg`を有効にすることで使用できます。

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
