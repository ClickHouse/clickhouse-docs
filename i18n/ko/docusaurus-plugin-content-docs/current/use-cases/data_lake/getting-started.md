---
title: '레이크하우스 테이블 형식 시작하기'
sidebar_label: '시작하기'
slug: /use-cases/data-lake/getting-started
sidebar_position: 1
pagination_prev: null
pagination_next: use-cases/data_lake/guides/querying-directly
description: 'ClickHouse를 사용해 개방형 테이블 형식의 데이터를 쿼리하고, 가속하며, 다시 기록하는 방법을 실습을 통해 소개합니다.'
keywords: ['데이터 레이크', 'lakehouse', '시작하기', 'iceberg', 'delta lake', 'hudi', 'paimon']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import iceberg_query_direct from '@site/static/images/datalake/iceberg-query-direct.png';
import iceberg_query_engine from '@site/static/images/datalake/iceberg-query-engine.png';
import iceberg_query from '@site/static/images/datalake/iceberg-query.png';
import clickhouse_query from '@site/static/images/datalake/clickhouse-query.png';

# 데이터 레이크 시작하기 \{#data-lake-getting-started\}

:::note[TL;DR]
데이터 레이크 테이블을 쿼리하고, MergeTree로 성능을 높이며, 결과를 다시 Iceberg에 쓰는 과정을 실습으로 안내합니다. 모든 단계는 공개 데이터세트를 사용하며 Cloud와 OSS 모두에서 작동합니다.
:::

이 가이드의 스크린샷은 [ClickHouse Cloud](https://console.clickhouse.cloud) SQL 콘솔에서 가져왔습니다. 모든 쿼리는 Cloud와 자가 관리형 배포 환경 모두에서 작동합니다.

<VerticalStepper headerLevel="h2">
  ## Iceberg 데이터 직접 쿼리하기 \{#query-directly\}

  가장 빠르게 시작하는 방법은 [`icebergS3()`](/sql-reference/table-functions/iceberg) 테이블 함수를 사용하는 것입니다. S3의 Iceberg 테이블을 지정하면 별도의 설정 없이 즉시 쿼리할 수 있습니다.

  스키마를 확인합니다:

  ```sql
  DESCRIBE icebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')
  ```

  쿼리를 실행하세요:

  ```sql
  SELECT
      url,
      count() AS cnt
  FROM icebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')
  GROUP BY url
  ORDER BY cnt DESC
  LIMIT 5
  ```

  <Image img={iceberg_query_direct} alt="Iceberg 쿼리" />

  ClickHouse는 S3에서 Iceberg 메타데이터를 직접 읽어 스키마를 자동으로 추론합니다. 동일한 방식이 [`deltaLake()`](/sql-reference/table-functions/deltalake), [`hudi()`](/sql-reference/table-functions/hudi), [`paimon()`](/sql-reference/table-functions/paimon)에도 적용됩니다.

  **자세히 알아보기:** [오픈 테이블 형식 직접 쿼리하기](/use-cases/data-lake/getting-started/querying-directly)에서는 네 가지 형식 모두, 분산 읽기를 위한 클러스터 변형, 스토리지 백엔드 옵션(S3, Azure, HDFS, 로컬)을 다룹니다.

  ## 영구 테이블 엔진 생성 \{#table-engine\}

  반복적으로 접근하려면 Iceberg 테이블 엔진을 사용하여 테이블을 생성하세요. 이렇게 하면 매번 경로를 지정할 필요가 없습니다. 데이터는 S3에 그대로 유지되며 복제되지 않습니다:

  ```sql
  CREATE TABLE hits_iceberg
      ENGINE = IcebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')
  ```

  이제 일반 ClickHouse 테이블처럼 쿼리할 수 있습니다:

  ```sql
  SELECT
      url,
      count() AS cnt
  FROM hits_iceberg
  GROUP BY url
  ORDER BY cnt DESC
  LIMIT 5
  ```

  <Image img={iceberg_query_engine} alt="Iceberg 쿼리" />

  테이블 엔진은 데이터 캐싱, 메타데이터 캐싱, 스키마 진화, 타임 트래블을 지원합니다. 테이블 엔진 기능에 대한 자세한 내용은 [직접 쿼리하기](/use-cases/data-lake/getting-started/querying-directly) 가이드를, 전체 기능 비교는 [지원 매트릭스](/use-cases/data-lake/support-matrix)를 참조하십시오.

  ## 카탈로그에 연결 \{#connect-catalog\}

  대부분의 조직은 테이블 메타데이터와 데이터 검색을 중앙화하기 위해 데이터 카탈로그를 통해 Iceberg 테이블을 관리합니다. ClickHouse는 [`DataLakeCatalog`](/engines/database-engines/datalakecatalog) 데이터베이스 엔진을 사용하여 카탈로그에 연결할 수 있으며, 모든 카탈로그 테이블을 ClickHouse 데이터베이스로 노출합니다. 이는 더 확장성이 높은 방식으로, 새로운 Iceberg 테이블이 생성될 때마다 추가 작업 없이 ClickHouse에서 항상 접근할 수 있습니다.

  다음은 [AWS Glue](/use-cases/data-lake/glue-catalog)에 연결하는 예시입니다:

  ```sql
  CREATE DATABASE my_lake
  ENGINE = DataLakeCatalog
  SETTINGS
      catalog_type = 'glue',
      region = '<your-region>',
      aws_access_key_id = '<your-access-key>',
      aws_secret_access_key = '<your-secret-key>'
  ```

  각 카탈로그 유형마다 고유한 연결 설정이 필요합니다. 지원되는 카탈로그의 전체 목록과 구성 옵션은 [카탈로그 가이드](/use-cases/data-lake/reference)를 참조하십시오.

  테이블 탐색 및 쿼리:

  ```sql
  SHOW TABLES FROM my_lake;
  ```

  ```sql
  SELECT count(*) FROM my_lake.`<database>.<table>`
  ```

  :::note
  ClickHouse는 기본적으로 둘 이상의 네임스페이스를 지원하지 않기 때문에 `<database>.<table>` 주위에 백틱(backtick)이 필요합니다.
  :::

  **자세히 알아보기:** [데이터 카탈로그 연결](/use-cases/data-lake/getting-started/connecting-catalogs)에서는 Delta 및 Iceberg 예제를 포함한 전체 Unity Catalog 설정 과정을 안내합니다.

  ## 쿼리 실행 \{#issue-query\}

  위에서 어떤 방법을 사용했든 — 테이블 함수, 테이블 엔진, 카탈로그 — 동일한 ClickHouse SQL이 모든 방법에서 동작합니다.

  ```sql
  -- Table function
  SELECT url, count() AS cnt
  FROM icebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')
  GROUP BY url ORDER BY cnt DESC LIMIT 5

  -- Table engine
  SELECT url, count() AS cnt
  FROM hits_iceberg
  GROUP BY url ORDER BY cnt DESC LIMIT 5

  -- Catalog
  SELECT url, count() AS cnt
  FROM my_lake.`<database>.<table>`
  GROUP BY url ORDER BY cnt DESC LIMIT 5
  ```

  쿼리 구문은 동일하며, `FROM` 절만 변경됩니다. 모든 ClickHouse SQL 함수, 조인, 집계는 데이터 소스에 관계없이 동일하게 작동합니다.

  ## ClickHouse에 하위 집합 로드하기 \{#load-data\}

  Iceberg를 직접 쿼리하는 것은 편리하지만, 성능은 네트워크 처리량과 파일 레이아웃에 의해 제한됩니다. 분석 워크로드의 경우 데이터를 네이티브 MergeTree 테이블에 로드하십시오.

  먼저, 기준값을 얻기 위해 Iceberg 테이블에 필터링된 쿼리를 실행하십시오:

  ```sql
  SELECT
      url,
      count() AS cnt
  FROM hits_iceberg
  WHERE counterid = 38
  GROUP BY url
  ORDER BY cnt DESC
  LIMIT 5
  ```

  이 쿼리는 Iceberg가 `counterid` 필터를 인식하지 못하므로 S3의 전체 데이터셋을 스캔합니다. 완료까지 수 초가 소요될 수 있습니다.

  <Image img={iceberg_query} alt="Iceberg 쿼리" />

  이제 MergeTree 테이블을 생성하고 데이터를 로드하세요:

  ```sql
  CREATE TABLE hits_clickhouse
  (
      url String,
      eventtime DateTime,
      counterid UInt32
  )
  ENGINE = MergeTree()
  ORDER BY (counterid, eventtime);
  ```

  ```sql
  INSERT INTO hits_clickhouse
  SELECT url, eventtime, counterid
  FROM hits_iceberg
  ```

  MergeTree 테이블에 동일한 쿼리를 다시 실행하십시오:

  ```sql
  SELECT
      url,
      count() AS cnt
  FROM hits_clickhouse
  WHERE counterid = 38
  GROUP BY url
  ORDER BY cnt DESC
  LIMIT 5
  ```

  <Image img={clickhouse_query} alt="ClickHouse 쿼리" />

  `counterid`가 `ORDER BY` 키의 첫 번째 컬럼이므로, ClickHouse의 희소 기본 인덱스는 관련 그래뉼로 직접 건너뜁니다 — 1억 개의 행을 전부 스캔하는 대신 `counterid = 38`에 해당하는 행만 읽습니다. 그 결과 처리 속도가 크게 향상됩니다.

  [분석 가속화](/use-cases/data-lake/getting-started/accelerating-analytics) 가이드에서는 `LowCardinality` 타입, 전문 검색 인덱스, 최적화된 정렬 키를 활용하여 2억 8,300만 행 데이터셋에서 **약 40배의 성능 향상**을 달성하는 방법을 설명합니다.

  **자세히 알아보기:** [MergeTree로 분석 가속화](/use-cases/data-lake/getting-started/accelerating-analytics)에서는 스키마 최적화, 전문 검색(full-text) 인덱싱, 그리고 적용 전후의 성능 비교를 다룹니다.

  ## Iceberg에 데이터 쓰기 \{#write-back\}

  ClickHouse는 Iceberg 테이블에 데이터를 다시 쓸 수도 있어 역방향 ETL 워크플로를 지원합니다. 집계된 결과나 하위 집합을 Spark, Trino, DuckDB 등 다른 도구에서 활용할 수 있도록 게시하는 것이 가능합니다.

  출력용 Iceberg 테이블을 생성하십시오:

  ```sql
  CREATE TABLE output_iceberg
  (
      url String,
      cnt UInt64
  )
  ENGINE = IcebergS3('https://your-bucket.s3.amazonaws.com/output/', 'access_key', 'secret_key')
  ```

  집계 결과 쓰기:

  ```sql
  SET allow_experimental_insert_into_iceberg = 1;

  INSERT INTO output_iceberg
  SELECT
      url,
      count() AS cnt
  FROM hits_clickhouse
  GROUP BY url
  ORDER BY cnt DESC
  ```

  생성된 Iceberg 테이블은 Iceberg 호환 엔진이면 어디서든 읽을 수 있습니다.

  **자세히 알아보기:** [오픈 테이블 형식으로 데이터 쓰기](/use-cases/data-lake/getting-started/writing-data)에서는 UK Price Paid 데이터셋을 사용하여 원시 데이터 및 집계 결과를 작성하는 방법을 다루며, ClickHouse 타입을 Iceberg에 매핑할 때의 스키마 고려 사항도 포함합니다.
</VerticalStepper>

## 다음 단계 \{#next-steps\}

이제 전체 워크플로를 살펴보았으니, 각 영역을 더 자세히 확인해 보십시오:

* [직접 쿼리하기](/use-cases/data-lake/getting-started/querying-directly) — 지원되는 4가지 형식, 클러스터 구성, 테이블 엔진, 캐싱
* [카탈로그 연결하기](/use-cases/data-lake/getting-started/connecting-catalogs) — Delta 및 Iceberg를 포함한 Unity Catalog 전체 안내
* [분석 가속화하기](/use-cases/data-lake/getting-started/accelerating-analytics) — 스키마 최적화, 인덱스, 약 40배 속도 향상 데모
* [데이터 레이크에 쓰기](/use-cases/data-lake/getting-started/writing-data) — 원시 쓰기, 집계 쓰기, 타입 매핑
* [지원 매트릭스](/use-cases/data-lake/support-matrix) — 형식 및 스토리지 백엔드 전반에 걸친 기능 비교