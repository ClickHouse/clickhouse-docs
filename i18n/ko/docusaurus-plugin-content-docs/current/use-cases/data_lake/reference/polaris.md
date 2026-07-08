---
slug: /use-cases/data-lake/polaris-catalog
sidebar_label: 'Polaris 카탈로그'
title: 'Polaris 카탈로그'
pagination_prev: null
pagination_next: null
description: '이 가이드에서는 ClickHouse와 Snowflake Polaris 카탈로그를 사용해 데이터를 쿼리하는
 단계를 안내합니다.'
keywords: ['Polaris', 'Snowflake', '데이터 레이크']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

ClickHouse는 여러 catalog(Unity, Glue, Polaris 등)과의 통합을 지원합니다.
이 가이드에서는 ClickHouse와 [Apache Polaris Catalog](https://polaris.apache.org/releases/1.1.0/getting-started/using-polaris/#setup)를 사용하여 데이터를 쿼리하는 단계를 설명합니다.
Apache Polaris는 Iceberg 테이블과 Delta Tables(Generic Tables 경유)를 지원합니다. 현재 이 통합은 Iceberg 테이블만 지원합니다.

:::note
이 기능은 실험적이므로 다음을 사용하여 활성화해야 합니다.
`SET allow_experimental_database_unity_catalog = 1;`
:::

## 사전 요구 사항 \{#prerequisites\}

Polaris 카탈로그에 연결하려면 다음이 필요합니다.

* Snowflake Open Catalog(호스팅형 Polaris) 또는 자체 호스팅 Polaris Catalog
* Polaris 카탈로그 URI(예: `https://<account-id>.<region>.aws.snowflakecomputing.com/polaris/api/catalog/v1` 또는 `http://polaris:8181/api/catalog/v1/oauth/tokens`)
* 카탈로그 자격 증명(client ID 및 client secret)
* Polaris 인스턴스의 OAuth token URI
* Iceberg 데이터가 저장된 객체 스토리지의 storage endpoint(예: S3)
* ClickHouse 버전 26.1+

Snowflake의 관리형 Polaris 서비스인 Open Catalog의 경우 URI에 `/polaris`가 포함되지만, 자체 호스팅 환경에서는 포함되지 않을 수 있습니다.

<VerticalStepper>
  ## Polaris와 ClickHouse 간 연결 생성 \{#connecting\}

  ClickHouse를 Polaris 카탈로그에 연결하는 데이터베이스를 생성합니다.

  ```sql
  CREATE DATABASE polaris_catalog
  ENGINE = DataLakeCatalog('https://<catalog_uri>/api/catalog/v1')
  SETTINGS
      catalog_type = 'rest',
      catalog_credential = '<client-id>:<client-secret>',
      warehouse = 'snowflake',
      auth_scope = 'PRINCIPAL_ROLE:ALL',
      oauth_server_uri = 'https://<catalog_uri>/api/catalog/v1/oauth/tokens',
      storage_endpoint = '<storage_endpoint>'
  ```

  ## ClickHouse를 사용해 Polaris 카탈로그 쿼리 \{#query-polaris-catalog\}

  연결이 설정되면 Polaris를 쿼리할 수 있습니다.

  ```sql title="쿼리"
  USE polaris_catalog;
  SHOW TABLES;
  ```

  테이블을 쿼리하려면 다음을 실행합니다.

  ```sql title="쿼리"
  SELECT count(*) FROM `polaris_db.my_iceberg_table`;
  ```

  :::note
  예를 들어 `schema.table`과 같이 백틱이 필요합니다.
  :::

  테이블 DDL을 확인하려면 다음을 실행합니다.

  ```sql
  SHOW CREATE TABLE `polaris_db.my_iceberg_table`;
  ```

  ## Polaris에서 ClickHouse로 데이터 로드 \{#loading-data-into-clickhouse\}

  Polaris에서 ClickHouse 테이블로 데이터를 로드하려면, 원하는 스키마로 대상 테이블을 생성한 다음 Polaris 테이블에서 데이터를 삽입합니다.

  ```sql title="쿼리"
  CREATE TABLE my_clickhouse_table
  (
      -- Iceberg 테이블에 맞게 컬럼을 정의합니다
      `id` Int64,
      `name` String,
      `event_time` DateTime64(3)
  )
  ENGINE = MergeTree
  ORDER BY id;

  INSERT INTO my_clickhouse_table
  SELECT * FROM polaris_catalog.`polaris_db.my_iceberg_table`;
  ```
</VerticalStepper>