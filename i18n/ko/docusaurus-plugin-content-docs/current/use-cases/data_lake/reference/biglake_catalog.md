---
slug: /use-cases/data-lake/biglake-catalog
sidebar_label: 'BigLake 메타스토어'
title: 'BigLake 메타스토어'
pagination_prev: null
pagination_next: null
description: '이 가이드에서는 ClickHouse와 BigLake 메타스토어를 사용하여 Google Cloud Storage에 있는 데이터를 쿼리하는 단계를 안내합니다.'
keywords: ['BigLake', 'GCS', 'Data Lake', 'Iceberg', 'Google Cloud']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

ClickHouse는 여러 카탈로그(Unity, Glue, Polaris 등)와의 통합을 지원합니다. 이 가이드에서는 ClickHouse를 통해 [BigLake 메타스토어](https://docs.cloud.google.com/biglake/docs/)에 있는 Iceberg 테이블을 쿼리하는 단계를 안내합니다.

:::note
이 기능은 베타이므로 다음을 사용하여 활성화해야 합니다:
`SET allow_database_iceberg = 1;`
:::


## Prerequisites \{#prerequisites\}

ClickHouse에서 BigLake 메타스토어로의 연결을 생성하기 전에 다음을 준비했는지 확인하세요.

- BigLake 메타스토어가 활성화된 **Google Cloud 프로젝트**
- [Google Cloud Console](https://docs.cloud.google.com/docs/authentication/provide-credentials-adc)을 통해 생성한 애플리케이션용 **Application Default 자격 증명**(Oauth client ID 및 client secret)
- 적절한 범위로 OAuth 흐름을 완료하여 얻은 **refresh token**(예: `https://www.googleapis.com/auth/bigquery` 및 GCS용 storage scope)
- 테이블이 저장된 위치인 **warehouse** 경로: GCS 버킷(및 선택적 prefix)(예: `gs://your-bucket` 또는 `gs://your-bucket/prefix`)

## BigLake 메타스토어와 ClickHouse 간 연결 생성 \{#creating-a-connection\}

OAuth 자격 증명이 준비되면 [DataLakeCatalog](/engines/database-engines/datalakecatalog) 데이터베이스 엔진을 사용하는 데이터베이스를 ClickHouse에 생성합니다:

```sql
SET allow_database_iceberg = 1;

CREATE DATABASE biglake_metastore
ENGINE = DataLakeCatalog('https://biglake.googleapis.com/iceberg/v1/restcatalog')
SETTINGS
    catalog_type = 'biglake',
    google_adc_client_id = '<client-id>',
    google_adc_client_secret = '<client-secret>',
    google_adc_refresh_token = '<refresh-token>',
    google_adc_quota_project_id = '<gcp-project-id>',
    warehouse = 'gs://<bucket_name>/<optional-prefix>';
```

## ClickHouse를 사용하여 BigLake 메타스토어 테이블 쿼리하기 \{#querying-biglake-metastore-tables\}

연결이 생성되면 BigLake 메타스토어에 등록된 테이블을 쿼리할 수 있습니다.

```sql
USE biglake_metastore;

SHOW TABLES;
```

출력 예시는 다음과 같습니다:

```response
┌─name─────────────────────┐
│icebench.my_iceberg_table │   
└──────────────────────────┘
```

```sql
SELECT count(*) FROM `icebench.my_iceberg_table`;
```

:::note 백틱 필요
ClickHouse는 둘 이상의 네임스페이스를 지원하지 않으므로 백틱이 필요합니다.
:::

테이블 정의를 확인하려면 다음을 실행합니다:

```sql
SHOW CREATE TABLE `icebench.my_iceberg_table`;
```

## BigLake에서 ClickHouse로 데이터 로드하기 \{#loading-data-into-clickhouse\}

반복 쿼리를 더 빠르게 수행하기 위해 BigLake 메타스토어 테이블의 데이터를 로컬 ClickHouse 테이블로 로드하려면, MergeTree 테이블을 생성하고 카탈로그에서 데이터를 삽입합니다:

```sql
CREATE TABLE clickhouse_table
(
    `id` Int64,
    `event_time` DateTime64(3),
    `user_id` String,
    `payload` String
)
ENGINE = MergeTree
ORDER BY (event_time, id);

INSERT INTO local_events
SELECT * FROM biglake_metastore.`icebench.my_iceberg_table`;
```

초기 로드 후에는 더 낮은 지연 시간을 위해 `clickhouse_table`을 쿼리합니다. 필요할 때 BigLake의 데이터를 새로 고치려면 `INSERT INTO ... SELECT`를 다시 실행합니다.