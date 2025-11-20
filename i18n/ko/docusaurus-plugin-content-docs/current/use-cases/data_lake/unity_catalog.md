---
'slug': '/use-cases/data-lake/unity-catalog'
'sidebar_label': 'Unity catalog'
'title': 'Unity catalog'
'pagination_prev': null
'pagination_next': null
'description': '이 가이드에서는 ClickHouse와 Unity Catalog를 사용하여 S3 버킷에서 데이터를 쿼리하는 단계를 안내합니다.'
'keywords':
- 'Unity'
- 'Data Lake'
'show_related_blogs': true
'doc_type': 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

:::note
Unity Catalog와의 통합은 관리형 및 외부 테이블에서 작동합니다.
이 통합은 현재 AWS에서만 지원됩니다.
:::

ClickHouse는 여러 카탈로그(Unity, Glue, Polaris 등)와의 통합을 지원합니다. 이 가이드는 ClickHouse를 사용하여 Databricks에서 관리하는 데이터를 쿼리하는 단계에 대해 안내합니다. [Unity Catalog](https://www.databricks.com/product/unity-catalog).

Databricks는 lakehouse에 대해 여러 데이터 형식을 지원합니다. ClickHouse를 사용하면 Unity Catalog 테이블을 Delta 및 Iceberg 형식으로 쿼리할 수 있습니다.

:::note
이 기능은 실험적이므로 다음을 사용하여 활성화해야 합니다:
`SET allow_experimental_database_unity_catalog = 1;`
:::

## Databricks에서 Unity 구성 {#configuring-unity-in-databricks}

ClickHouse가 Unity 카탈로그와 상호 작용할 수 있도록 하려면 Unity Catalog가 외부 리더와의 상호 작용을 허용하도록 구성되어 있는지 확인해야 합니다. 이는 [ "Enable external data access to Unity Catalog"](https://docs.databricks.com/aws/en/external-access/admin) 가이드를 따라 설정할 수 있습니다.

외부 액세스를 활성화하는 것 외에도, 통합을 구성하는 주체가 테이블이 포함된 스키마에 대해 `EXTERNAL USE SCHEMA` [특권](https://docs.databricks.com/aws/en/external-access/admin#external-schema)을 가지고 있는지 확인하세요.

카탈로그가 구성되면 ClickHouse를 위한 자격 증명을 생성해야 합니다. Unity와의 상호 작용 모드에 따라 두 가지 방법을 사용할 수 있습니다:

* Iceberg 클라이언트의 경우, [서비스 주체](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m)로 인증을 사용하세요.

* Delta 클라이언트의 경우, 개인 액세스 토큰([PAT](https://docs.databricks.com/aws/en/dev-tools/auth/pat))을 사용하세요.

## Unity Catalog와 ClickHouse 간의 연결 만들기 {#creating-a-connection-between-unity-catalog-and-clickhouse}

Unity Catalog가 구성되고 인증이 완료되면 ClickHouse와 Unity Catalog 간의 연결을 설정하세요.

### Delta 읽기 {#read-delta}

```sql
CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog')
SETTINGS warehouse = 'CATALOG_NAME', catalog_credential = '<PAT>', catalog_type = 'unity'
```

### Iceberg 읽기 {#read-iceberg}

```sql
CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog/iceberg')
SETTINGS catalog_type = 'rest', catalog_credential = '<client-id>:<client-secret>', warehouse = 'workspace', 
oauth_server_uri = 'https://<workspace-id>.cloud.databricks.com/oidc/v1/token', auth_scope = 'all-apis,sql'
```

## ClickHouse를 사용하여 Unity 카탈로그 테이블 쿼리하기 {#querying-unity-catalog-tables-using-clickhouse}

연결이 설정되었으므로 Unity 카탈로그를 통해 쿼리를 시작할 수 있습니다. 예를 들어:

```sql
USE unity;

SHOW TABLES;

┌─name───────────────────────────────────────────────┐
│ clickbench.delta_hits                              │
│ demo.fake_user                                     │
│ information_schema.catalog_privileges              │
│ information_schema.catalog_tags                    │
│ information_schema.catalogs                        │
│ information_schema.check_constraints               │
│ information_schema.column_masks                    │
│ information_schema.column_tags                     │
│ information_schema.columns                         │
│ information_schema.constraint_column_usage         │
│ information_schema.constraint_table_usage          │
│ information_schema.information_schema_catalog_name │
│ information_schema.key_column_usage                │
│ information_schema.parameters                      │
│ information_schema.referential_constraints         │
│ information_schema.routine_columns                 │
│ information_schema.routine_privileges              │
│ information_schema.routines                        │
│ information_schema.row_filters                     │
│ information_schema.schema_privileges               │
│ information_schema.schema_tags                     │
│ information_schema.schemata                        │
│ information_schema.table_constraints               │
│ information_schema.table_privileges                │
│ information_schema.table_tags                      │
│ information_schema.tables                          │
│ information_schema.views                           │
│ information_schema.volume_privileges               │
│ information_schema.volume_tags                     │
│ information_schema.volumes                         │
│ uniform.delta_hits                                 │
└────────────────────────────────────────────────────┘
```

Iceberg 클라이언트를 사용하는 경우 Uniform이 활성화된 Delta 테이블만 표시됩니다:

```sql
SHOW TABLES

┌─name───────────────┐
│ uniform.delta_hits │
└────────────────────┘
```

테이블을 쿼리하려면:

```sql
SELECT count(*) FROM `uniform.delta_hits`
```

:::note 백틱 필요
ClickHouse는 여러 네임스페이스를 지원하지 않으므로 백틱이 필요합니다.
:::

테이블 DDL을 검사하려면:

```sql
SHOW CREATE TABLE `uniform.delta_hits`

CREATE TABLE unity_uniform.`uniform.delta_hits`
(
    `WatchID` Int64,
    `JavaEnable` Int32,
    `Title` String,
    `GoodEvent` Int32,
    `EventTime` DateTime64(6, 'UTC'),
    `EventDate` Date,
    `CounterID` Int32,
    `ClientIP` Int32,
    ...
    `FromTag` String,
    `HasGCLID` Int32,
    `RefererHash` Int64,
    `URLHash` Int64,
    `CLID` Int32
)
ENGINE = Iceberg('s3://<path>);

```

## 데이터 레이크에서 ClickHouse로 데이터 로드하기 {#loading-data-from-your-data-lake-into-clickhouse}

Databricks에서 ClickHouse로 데이터를 로드해야 하는 경우, 먼저 로컬 ClickHouse 테이블을 생성하세요:

```sql
CREATE TABLE hits
(
    `WatchID` Int64,
    `JavaEnable` Int32,
    `Title` String,
    `GoodEvent` Int32,
    `EventTime` DateTime64(6, 'UTC'),
    `EventDate` Date,
    `CounterID` Int32,
    `ClientIP` Int32,
    ...
    `FromTag` String,
    `HasGCLID` Int32,
    `RefererHash` Int64,
    `URLHash` Int64,
    `CLID` Int32
)
PRIMARY KEY (CounterID, EventDate, UserID, EventTime, WatchID);
```

그런 다음 `INSERT INTO SELECT`를 통해 Unity Catalog 테이블에서 데이터를 로드하세요:

```sql
INSERT INTO hits SELECT * FROM unity_uniform.`uniform.delta_hits`;
```
