---
slug: /use-cases/data-lake/unity-catalog
sidebar_label: 'Unity Catalog'
title: 'Unity Catalog'
pagination_prev: null
pagination_next: null
description: '이 가이드에서는 ClickHouse와 Unity Catalog를 사용하여 S3 버킷의 데이터를 쿼리하는 방법을 단계별로 설명합니다.'
keywords: ['Unity', '데이터 레이크']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

:::note
Unity Catalog 통합은 관리형(managed) 테이블과 외부(external) 테이블 모두에서 작동합니다.
이 통합은 현재 AWS에서만 지원됩니다.
:::

ClickHouse는 여러 카탈로그(Unity, Glue, Polaris 등)와의 통합을 지원합니다. 이 가이드는 ClickHouse와 [Unity Catalog](https://www.databricks.com/product/unity-catalog)를 사용하여 Databricks에서 관리하는 데이터를 쿼리하는 방법을 단계별로 설명합니다.

Databricks는 레이크하우스를 위해 여러 데이터 형식을 지원합니다. ClickHouse를 사용하면 Unity Catalog 테이블을 Delta와 Iceberg 형식 모두로 쿼리할 수 있습니다.

:::note
이 기능은 실험적 기능이므로, 다음 설정을 사용해 활성화해야 합니다:
`SET allow_experimental_database_unity_catalog = 1;`
:::


## Databricks에서 Unity 구성하기 \{#configuring-unity-in-databricks\}

ClickHouse가 Unity Catalog와 상호 작용할 수 있도록 하려면 Unity Catalog가 외부 리더와의 상호 작용을 허용하도록 구성되어 있어야 합니다. 이를 위해 ["Enable external data access to Unity Catalog"](https://docs.databricks.com/aws/en/external-access/admin) 가이드를 따르십시오.

외부 액세스를 활성화하는 것 외에도, 통합을 구성하는 주체(principal)가 테이블이 포함된 스키마에 대해 `EXTERNAL USE SCHEMA` [권한](https://docs.databricks.com/aws/en/external-access/admin#external-schema)을 가지고 있는지 확인하십시오.

카탈로그 구성이 완료되면 ClickHouse용 자격 증명을 생성해야 합니다. Unity와의 상호 작용 방식에 따라 두 가지 다른 방법을 사용할 수 있습니다:

* Iceberg 클라이언트의 경우, [service principal](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m)을 사용하여 인증하십시오.

* Delta 클라이언트의 경우, Personal Access Token([PAT](https://docs.databricks.com/aws/en/dev-tools/auth/pat))을 사용하십시오.

## Unity Catalog와 ClickHouse 간 연결 생성 \{#creating-a-connection-between-unity-catalog-and-clickhouse\}

Unity Catalog를 구성하고 인증을 완료했으면 ClickHouse와 Unity Catalog 간에 연결을 설정합니다.

### Delta 읽기 \{#read-delta\}

```sql
CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog')
SETTINGS warehouse = 'CATALOG_NAME', catalog_credential = '<PAT>', catalog_type = 'unity'
```


### Iceberg 읽기 \{#read-iceberg\}

관리형 Iceberg 테이블에 접근하려면:

```sql
CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog/iceberg-rest')
SETTINGS catalog_type = 'rest', catalog_credential = '<client-id>:<client-secret>', warehouse = 'workspace', 
oauth_server_uri = 'https://<workspace-id>.cloud.databricks.com/oidc/v1/token', auth_scope = 'all-apis,sql'
```


## ClickHouse를 사용해 Unity 카탈로그 테이블 쿼리하기 \{#querying-unity-catalog-tables-using-clickhouse\}

이제 연결이 완료되었으므로 Unity 카탈로그를 통해 테이블을 쿼리할 수 있습니다. 예를 들면 다음과 같습니다.

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

:::note Backticks required
ClickHouse는 하나의 네임스페이스만을 지원하므로 백틱이 필요합니다.
:::

테이블의 DDL을 확인하려면:

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


## 데이터 레이크에서 ClickHouse로 데이터 적재 \{#loading-data-from-your-data-lake-into-clickhouse\}

Databricks에서 ClickHouse로 데이터를 가져와야 하는 경우, 먼저 로컬 ClickHouse 테이블을 생성하십시오:

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

그런 다음 `INSERT INTO SELECT`를 사용하여 Unity Catalog 테이블의 데이터를 로드합니다:

```sql
INSERT INTO hits SELECT * FROM unity_uniform.`uniform.delta_hits`;
```
