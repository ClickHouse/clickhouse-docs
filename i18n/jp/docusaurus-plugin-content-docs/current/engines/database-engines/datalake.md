---
'description': 'DataLakeCatalog データベースエンジンは、ClickHouse を外部データカタログに接続し、オープンテーブルフォーマットデータをクエリすることを可能にします。'
'sidebar_label': 'DataLakeCatalog'
'slug': '/engines/database-engines/datalakecatalog'
'title': 'DataLakeCatalog'
'doc_type': 'reference'
---


# DataLakeCatalog

`DataLakeCatalog` データベースエンジンを使用すると、ClickHouse を外部データカタログに接続し、データの重複なしにオープンテーブルフォーマットデータをクエリできます。これにより、ClickHouse は既存のデータレイクインフラストラクチャとシームレスに連携する強力なクエリエンジンへと変貌します。

## Supported catalogs {#supported-catalogs}

`DataLakeCatalog` エンジンは、以下のデータカタログをサポートしています：

- **AWS Glue Catalog** - AWS 環境における Iceberg テーブル用
- **Databricks Unity Catalog** - Delta Lake および Iceberg テーブル用
- **Hive Metastore** - 従来の Hadoop エコシステムカタログ
- **REST Catalogs** - Iceberg REST 仕様をサポートする任意のカタログ

## Creating a database {#creating-a-database}

`DataLakeCatalog` エンジンを使用するには、以下の関連設定を有効にする必要があります。

```sql
SET allow_experimental_database_iceberg = 1;
SET allow_experimental_database_unity_catalog = 1;
SET allow_experimental_database_glue_catalog = 1;
SET allow_experimental_database_hms_catalog = 1;
```

`DataLakeCatalog` エンジンを使用してデータベースを作成するには、以下の構文を使用できます：

```sql
CREATE DATABASE database_name
ENGINE = DataLakeCatalog(catalog_endpoint[, user, password])
SETTINGS
catalog_type,
[...]
```

サポートされている設定は次のとおりです：

| 設定                     | 説明                                                                    |
|-------------------------|---------------------------------------------------------------------------|
| `catalog_type`          | カタログの種類: `glue`、`unity` (Delta)、`rest` (Iceberg)、`hive`        |
| `warehouse`             | カタログで使用するウェアハウス/データベース名。                         |
| `catalog_credential`    | カタログ用の認証資格情報 (例: API キーまたはトークン)                   |
| `auth_header`           | カタログサービスとの認証用のカスタム HTTP ヘッダー                     |
| `auth_scope`            | 認証用の OAuth2 スコープ (OAuth を使用する場合)                         |
| `storage_endpoint`      | 基盤となるストレージのエンドポイント URL                               |
| `oauth_server_uri`      | 認証のための OAuth2 認可サーバーの URI                                  |
| `vended_credentials`    | ベンダー提供の資格情報を使用するかどうかを示すブール値 (AWS 特有)      |
| `aws_access_key_id`     | S3/Glue アクセス用の AWS アクセスキー ID (ベンダー提供の資格情報を使用しない場合) |
| `aws_secret_access_key` | S3/Glue アクセス用の AWS シークレットアクセスキー (ベンダー提供の資格情報を使用しない場合) |
| `region`                | サービスの AWS リージョン (例: `us-east-1`)                             |

## Examples {#examples}

以下のページに `DataLakeCatalog` エンジンの使用例があります：

* [Unity Catalog](/use-cases/data-lake/unity-catalog)
* [Glue Catalog](/use-cases/data-lake/glue-catalog)
