---
title: '데이터 카탈로그에 연결하기'
sidebar_label: '카탈로그에 연결하기'
slug: /use-cases/data-lake/getting-started/connecting-catalogs
sidebar_position: 2
toc_max_heading_level: 3
pagination_prev: use-cases/data_lake/getting-started/querying-directly
pagination_next: use-cases/data_lake/getting-started/accelerating-analytics
description: 'DataLakeCatalog 데이터베이스 엔진을 사용하여 ClickHouse를 외부 데이터 카탈로그에 연결하고, 카탈로그 테이블을 네이티브 ClickHouse 데이터베이스처럼 노출합니다.'
keywords: ['데이터 레이크', 'lakehouse', 'catalog', 'glue', 'unity', 'rest', 'lakekeeper', 'nessie', 'OneLake']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[이전 섹션](/use-cases/data-lake/getting-started/querying-directly)에서는 스토리지 경로를 직접 전달하여 오픈 테이블 포맷을 쿼리했습니다. 실제로는 대부분의 조직이 테이블 위치, 스키마, 파티션을 추적하는 중앙 레지스트리인 **데이터 카탈로그(data catalog)** 를 통해 테이블 메타데이터를 관리합니다. [`DataLakeCatalog`](/engines/database-engines/datalakecatalog) 데이터베이스 엔진을 사용해 ClickHouse를 카탈로그에 연결하면 전체 카탈로그가 하나의 ClickHouse 데이터베이스로 노출됩니다. 카탈로그의 모든 테이블이 자동으로 표시되며, 개별 테이블 경로나 테이블별 자격 증명을 알 필요 없이 ClickHouse SQL의 모든 기능을 사용해 쿼리할 수 있습니다.

이 가이드는 [Databricks Unity Catalog](https://www.databricks.com/product/unity-catalog)에 연결하는 과정을 설명합니다. ClickHouse는 다음과 같은 카탈로그도 지원하며, 전체 설정 방법은 각 참조 가이드를 참고하십시오:

| Catalog              | Reference guide                                            |
| -------------------- | ---------------------------------------------------------- |
| AWS Glue             | [AWS Glue 카탈로그](/use-cases/data-lake/glue-catalog)         |
| Iceberg REST Catalog | [REST 카탈로그](/use-cases/data-lake/rest-catalog)             |
| Lakekeeper           | [Lakekeeper 카탈로그](/use-cases/data-lake/lakekeeper-catalog) |
| Project Nessie       | [Nessie 카탈로그](/use-cases/data-lake/nessie-catalog)         |
| Microsoft OneLake    | [Fabric OneLake](/use-cases/data-lake/onelake-catalog)     |


## Unity Catalog에 연결하기 \{#connecting-to-unity-catalog\}

<BetaBadge/>

예제에서는 Unity Catalog를 사용합니다.

[Databricks Unity Catalog](https://www.databricks.com/product/unity-catalog)는 Databricks 레이크하우스 데이터에 대한 중앙 집중식 거버넌스를 제공합니다.

Databricks 레이크하우스에서는 여러 데이터 형식을 지원합니다. ClickHouse를 사용하면 Unity Catalog 테이블을 Delta와 Iceberg 형식으로 모두 쿼리할 수 있습니다.

:::note
Unity Catalog 통합은 관리형(managed) 및 외부(external) 테이블 모두에서 작동합니다.
이 통합은 현재 AWS에서만 지원됩니다.
:::

### Databricks에서 Unity 구성하기 \{#configuring-unity-in-databricks\}

ClickHouse가 Unity Catalog와 상호작용하도록 허용하려면, Unity Catalog가 외부 리더(reader)와의 상호작용을 허용하도록 구성되어 있는지 확인해야 합니다. 이는 [ "Enable external data access to Unity Catalog"](https://docs.databricks.com/aws/en/external-access/admin) 가이드를 따라 수행할 수 있습니다.

외부 액세스를 활성화하는 것 외에도, 통합을 구성하는 주체(principal)가 테이블이 포함된 스키마에 대해 `EXTERNAL USE SCHEMA` [권한](https://docs.databricks.com/aws/en/external-access/admin#external-schema)을 가지고 있는지 확인해야 합니다.

카탈로그 구성이 완료되면 ClickHouse용 자격 증명을 생성해야 합니다. Unity와의 상호작용 모드에 따라 두 가지 서로 다른 방법을 사용할 수 있습니다.

* Iceberg 클라이언트의 경우 [service principal](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m)로 인증합니다.

* Delta 클라이언트의 경우 Personal Access Token ([PAT](https://docs.databricks.com/aws/en/dev-tools/auth/pat))을 사용합니다.

### 카탈로그에 연결 \{#connect-catalog\}

자격 증명이 준비되면 관련 엔드포인트에 연결하여 Iceberg 또는 Delta 테이블에 쿼리를 실행할 수 있습니다.

<Tabs groupId="connection-formats">
<TabItem value="delta" label="Delta" default>

[Unity Catalog](/use-cases/data-lake/unity-catalog)는 Delta 형식의 데이터에 액세스할 때 사용합니다.

```sql
SET allow_experimental_database_unity_catalog = 1;

CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog')
SETTINGS warehouse = 'CATALOG_NAME', catalog_credential = '<PAT>', catalog_type = 'unity';
```

</TabItem>
<TabItem value="iceberg" label="Iceberg" default>

```sql
SET allow_database_iceberg = 1;

CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog/iceberg-rest')
SETTINGS catalog_type = 'rest', catalog_credential = '<client-id>:<client-secret>', warehouse = 'workspace',
oauth_server_uri = 'https://<workspace-id>.cloud.databricks.com/oidc/v1/token', auth_scope = 'all-apis,sql';
```

</TabItem>
</Tabs>

### 테이블 목록 보기 \{#list-tables\}

카탈로그에 연결되면 테이블 목록을 확인할 수 있습니다.

```sql
SHOW TABLES FROM unity

┌─name───────────────────────────────────────────────┐
│ unity.logs                                         │
│ unity.single_day_log                               │
└────────────────────────────────────────────────────┘

31 rows in set.
```


### 테이블 스키마 살펴보기 \{#exploring-table-schemas\}

표준 `SHOW CREATE TABLE` 명령을 사용하여 테이블이 어떻게 생성되었는지 확인할 수 있습니다.

:::note Backticks required
네임스페이스와 테이블 이름을 지정할 때, 둘 다 백틱으로 둘러싸야 합니다. ClickHouse에서는 둘 이상의 네임스페이스를 지원하지 않습니다.
:::

다음 예시는 REST iceberg 카탈로그를 대상으로 쿼리를 수행한다고 가정합니다:

```sql
SHOW CREATE TABLE unity.`icebench.single_day_log`

CREATE TABLE unity.`icebench.single_day_log`
(
    `pull_request_number` Nullable(Int64),
    `commit_sha` Nullable(String),
    `check_start_time` Nullable(DateTime64(6, 'UTC')),
    `check_name` Nullable(String),
    `instance_type` Nullable(String),
    `instance_id` Nullable(String),
    `event_date` Nullable(Date32),
    `event_time` Nullable(DateTime64(6, 'UTC')),
    `event_time_microseconds` Nullable(DateTime64(6, 'UTC')),
    `thread_name` Nullable(String),
    `thread_id` Nullable(Decimal(20, 0)),
    `level` Nullable(String),
    `query_id` Nullable(String),
    `logger_name` Nullable(String),
    `message` Nullable(String),
    `revision` Nullable(Int64),
    `source_file` Nullable(String),
    `source_line` Nullable(Decimal(20, 0)),
    `message_format_string` Nullable(String)
)
ENGINE = Iceberg('s3://...')
```


### 테이블 쿼리하기 \{#querying-a-table\}

ClickHouse의 모든 함수가 지원됩니다. 다시 한 번, 네임스페이스와 테이블 이름은 백틱(`)으로 감싸야 합니다.

```sql

SELECT count()
FROM unity.`icebench.single_day_log`

┌───count()─┐
│ 282634391 │ -- 282.63 million
└───────────┘

1 row in set. Elapsed: 1.265 sec.
```

자세한 설정 방법은 [Unity catalog reference guide](/use-cases/data-lake/unity-catalog)를 참조하십시오.
