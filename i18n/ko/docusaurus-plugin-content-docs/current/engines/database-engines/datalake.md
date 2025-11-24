---
'description': 'DataLakeCatalog 데이터베이스 엔진이 ClickHouse를 외부 데이터 카탈로그에 연결하고 개방형 테이블 형식
  데이터를 쿼리할 수 있도록 합니다.'
'sidebar_label': 'DataLakeCatalog'
'slug': '/engines/database-engines/datalakecatalog'
'title': 'DataLakeCatalog'
'doc_type': 'reference'
---


# DataLakeCatalog

`DataLakeCatalog` 데이터베이스 엔진은 ClickHouse를 외부 데이터 카탈로그에 연결하고 데이터 중복 없이 오픈 테이블 형식 데이터를 쿼리할 수 있게 해줍니다. 이는 ClickHouse를 기존 데이터 레이크 인프라와 원활하게 작동하는 강력한 쿼리 엔진으로 변모시킵니다.

## Supported catalogs {#supported-catalogs}

`DataLakeCatalog` 엔진은 다음과 같은 데이터 카탈로그를 지원합니다:

- **AWS Glue Catalog** - AWS 환경의 Iceberg 테이블용
- **Databricks Unity Catalog** - Delta Lake 및 Iceberg 테이블용
- **Hive Metastore** - 전통적인 Hadoop 생태계 카탈로그
- **REST Catalogs** - Iceberg REST 사양을 지원하는 모든 카탈로그

## Creating a database {#creating-a-database}

`DataLakeCatalog` 엔진을 사용하기 위해 아래의 관련 설정을 활성화해야 합니다:

```sql
SET allow_experimental_database_iceberg = 1;
SET allow_experimental_database_unity_catalog = 1;
SET allow_experimental_database_glue_catalog = 1;
SET allow_experimental_database_hms_catalog = 1;
```

`DataLakeCatalog` 엔진을 가진 데이터베이스는 다음 구문을 사용하여 생성할 수 있습니다:

```sql
CREATE DATABASE database_name
ENGINE = DataLakeCatalog(catalog_endpoint[, user, password])
SETTINGS
catalog_type,
[...]
```

다음 설정이 지원됩니다:

| Setting                 | Description                                                                             |
|-------------------------|-----------------------------------------------------------------------------------------|
| `catalog_type`          | 카탈로그 유형: `glue`, `unity` (Delta), `rest` (Iceberg), `hive`, `onelake` (Iceberg) |
| `warehouse`             | 카탈로그에서 사용할 웨어하우스/데이터베이스 이름.                                      |
| `catalog_credential`    | 카탈로그를 위한 인증 자격 증명 (예: API 키 또는 토큰)                                 |
| `auth_header`           | 카탈로그 서비스와의 인증을 위한 사용자 정의 HTTP 헤더                                 |
| `auth_scope`            | 인증을 위한 OAuth2 범위 (OAuth 사용 시)                                             |
| `storage_endpoint`      | 기본 스토리지의 엔드포인트 URL                                                        |
| `oauth_server_uri`      | 인증을 위한 OAuth2 권한 부여 서버의 URI                                              |
| `vended_credentials`    | 제공되는 자격 증명 사용 여부를 나타내는 Boolean (AWS 전용)                           |
| `aws_access_key_id`     | S3/Glue 접근을 위한 AWS 액세스 키 ID (제공된 자격 증명 사용하지 않는 경우)           |
| `aws_secret_access_key` | S3/Glue 접근을 위한 AWS 비밀 액세스 키 (제공된 자격 증명 사용하지 않는 경우)          |
| `region`                | 서비스의 AWS 리전 (예: `us-east-1`)                                                    |

## Examples {#examples}

`DataLakeCatalog` 엔진 사용에 대한 예는 아래 섹션을 참조하십시오:

* [Unity Catalog](/use-cases/data-lake/unity-catalog)
* [Glue Catalog](/use-cases/data-lake/glue-catalog)
* OneLake Catalog  
  `allow_experimental_database_iceberg` 또는 `allow_database_iceberg`를 활성화하여 사용할 수 있습니다.
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
