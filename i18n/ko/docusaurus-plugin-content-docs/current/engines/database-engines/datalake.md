---
description: 'DataLakeCatalog 데이터베이스 엔진은 ClickHouse를 외부 데이터 카탈로그에 연결하여 오픈 테이블 포맷 데이터를 쿼리할 수 있도록 합니다'
sidebar_label: 'DataLakeCatalog'
slug: /engines/database-engines/datalakecatalog
title: 'DataLakeCatalog'
doc_type: 'reference'
---

# DataLakeCatalog \{#datalakecatalog\}

`DataLakeCatalog` 데이터베이스 엔진을 사용하면 ClickHouse를 외부
데이터 카탈로그에 연결하여, 데이터를 복제할 필요 없이 오픈 테이블 포맷 데이터를
쿼리할 수 있습니다. 이를 통해 ClickHouse는 기존 데이터 레이크 인프라와
원활하게 연동되는 강력한 쿼리 엔진으로 활용됩니다.

## 지원되는 카탈로그 \{#supported-catalogs\}

`DataLakeCatalog` 엔진은 다음과 같은 데이터 카탈로그를 지원합니다:

- **AWS Glue Catalog** - AWS 환경의 Iceberg 테이블용
- **Databricks Unity Catalog** - Delta Lake 및 Iceberg 테이블용
- **Hive Metastore** - 전통적인 Hadoop 에코시스템의 카탈로그
- **REST Catalogs** - Iceberg REST 사양을 준수하는 모든 카탈로그

## 데이터베이스 생성 \{#creating-a-database\}

`DataLakeCatalog` 엔진을 사용하려면 아래의 설정을 활성화해야 합니다.

```sql
SET allow_experimental_database_iceberg = 1;
SET allow_experimental_database_unity_catalog = 1;
SET allow_experimental_database_glue_catalog = 1;
SET allow_experimental_database_hms_catalog = 1;
SET allow_experimental_database_paimon_rest_catalog = 1;
```

`DataLakeCatalog` 엔진을 사용하는 데이터베이스는 다음 구문으로 생성할 수 있습니다.

```sql
CREATE DATABASE database_name
ENGINE = DataLakeCatalog(catalog_endpoint[, user, password])
SETTINGS
catalog_type,
[...]
```

다음 설정을 지원합니다.

| Setting                 | Description                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------ |
| `catalog_type`          | 카탈로그 유형: `glue`, `unity` (Delta), `rest` (Iceberg), `hive`, `onelake` (Iceberg)      |
| `warehouse`             | 카탈로그에서 사용할 웨어하우스/데이터베이스 이름                                                           |
| `catalog_credential`    | 카탈로그 인증용 자격 증명(예: API 키 또는 토큰)                                                       |
| `auth_header`           | 카탈로그 서비스 인증에 사용할 사용자 지정 HTTP 헤더                                                      |
| `auth_scope`            | 인증용 OAuth2 scope(OAuth를 사용하는 경우)                                                     |
| `storage_endpoint`      | 기본 스토리지의 엔드포인트 URL                                                                   |
| `oauth_server_uri`      | 인증을 위한 OAuth2 인가 서버 URI                                                              |
| `vended_credentials`    | 카탈로그에서 발급한 자격 증명을 사용할지 여부를 나타내는 불리언 값(AWS S3 및 Azure ADLS Gen2 지원)                   |
| `aws_access_key_id`     | S3/Glue 액세스를 위한 AWS access key ID(카탈로그 발급 자격 증명(vended credentials)을 사용하지 않는 경우)     |
| `aws_secret_access_key` | S3/Glue 액세스를 위한 AWS secret access key(카탈로그 발급 자격 증명(vended credentials)을 사용하지 않는 경우) |
| `region`                | 서비스용 AWS 리전(예: `us-east-1`)                                                          |
| `dlf_access_key_id`     | DLF 액세스를 위한 access key ID                                                            |
| `dlf_access_key_secret` | DLF 액세스를 위한 access key secret                                                        |


## 예시 \{#examples\}

`DataLakeCatalog` 엔진 사용 예시는 아래 섹션을 참고하십시오.

* [Unity Catalog](/use-cases/data-lake/unity-catalog)
* [Glue Catalog](/use-cases/data-lake/glue-catalog)
* OneLake Catalog
  `allow_experimental_database_iceberg` 또는 `allow_database_iceberg`를 활성화하면 사용할 수 있습니다.

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
