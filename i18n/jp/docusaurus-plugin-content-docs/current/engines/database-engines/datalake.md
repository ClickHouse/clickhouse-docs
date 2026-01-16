---
description: 'DataLakeCatalog データベースエンジンを使用すると、ClickHouse を外部のデータカタログに接続し、オープンなテーブル形式のデータをクエリできます'
sidebar_label: 'DataLakeCatalog'
slug: /engines/database-engines/datalakecatalog
title: 'DataLakeCatalog'
doc_type: 'reference'
---

# DataLakeCatalog \{#datalakecatalog\}

`DataLakeCatalog` データベースエンジンを使用すると、ClickHouse を外部の
データカタログに接続し、データを複製することなくオープンテーブルフォーマットのデータをクエリできます。
これにより、ClickHouse は既存のデータレイクインフラストラクチャとシームレスに連携する
強力なクエリエンジンになります。

## サポートされているカタログ \\{#supported-catalogs\\}

`DataLakeCatalog` エンジンは、次のデータカタログをサポートします。

- **AWS Glue Catalog** - AWS 環境での Iceberg テーブル向け
- **Databricks Unity Catalog** - Delta Lake および Iceberg テーブル向け
- **Hive Metastore** - 従来の Hadoop エコシステム向けカタログ
- **REST Catalogs** - Iceberg REST 仕様に準拠した任意のカタログ

## データベースの作成 \\{#creating-a-database\\}

`DataLakeCatalog` エンジンを使用するには、以下の必要な設定を有効にする必要があります。

```sql
SET allow_experimental_database_iceberg = 1;
SET allow_experimental_database_unity_catalog = 1;
SET allow_experimental_database_glue_catalog = 1;
SET allow_experimental_database_hms_catalog = 1;
SET allow_experimental_database_paimon_rest_catalog = 1;
```

`DataLakeCatalog` エンジンを利用するデータベースは、次の構文で作成できます。

```sql
CREATE DATABASE database_name
ENGINE = DataLakeCatalog(catalog_endpoint[, user, password])
SETTINGS
catalog_type,
[...]
```

サポートされている設定は次のとおりです:

| Setting                 | Description                                                                      |
| ----------------------- | -------------------------------------------------------------------------------- |
| `catalog_type`          | カタログの種類: `glue`, `unity` (Delta), `rest` (Iceberg), `hive`, `onelake` (Iceberg)  |
| `warehouse`             | カタログ内で使用する warehouse / データベース名                                                   |
| `catalog_credential`    | カタログの認証情報（例: API キーまたはトークン）                                                      |
| `auth_header`           | カタログサービスとの認証に使用するカスタム HTTP ヘッダー                                                  |
| `auth_scope`            | 認証用の OAuth2 スコープ（OAuth を使用する場合）                                                  |
| `storage_endpoint`      | バックエンドストレージのエンドポイント URL                                                          |
| `oauth_server_uri`      | 認証に使用する OAuth2 認可サーバーの URI                                                       |
| `vended_credentials`    | カタログから提供される vended credentials を使用するかどうかを示す真偽値（AWS S3 および Azure ADLS Gen2 をサポート） |
| `aws_access_key_id`     | S3/Glue へのアクセス用 AWS アクセスキー ID（vended credentials を使用しない場合）                       |
| `aws_secret_access_key` | S3/Glue へのアクセス用 AWS シークレットアクセスキー（vended credentials を使用しない場合）                    |
| `region`                | サービスの AWS リージョン（例: `us-east-1`）                                                  |
| `dlf_access_key_id`     | DLF へのアクセス用アクセスキー ID                                                             |
| `dlf_access_key_secret` | DLF へのアクセス用アクセスキーシークレット                                                          |


## 例 \{#examples\}

`DataLakeCatalog` エンジンの使用例については、以下のセクションを参照してください。

* [Unity Catalog](/use-cases/data-lake/unity-catalog)
* [Glue Catalog](/use-cases/data-lake/glue-catalog)
* OneLake Catalog
  `allow_experimental_database_iceberg` または `allow_database_iceberg` を有効化することで利用できます。

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
