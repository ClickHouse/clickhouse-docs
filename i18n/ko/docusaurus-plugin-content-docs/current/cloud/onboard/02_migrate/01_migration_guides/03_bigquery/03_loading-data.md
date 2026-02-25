---
sidebar_label: '데이터 로딩'
title: 'BigQuery에서 ClickHouse로 데이터 로딩'
slug: /migrations/bigquery/loading-data
description: 'BigQuery에서 ClickHouse로 데이터를 로딩하는 방법'
keywords: ['migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'BigQuery']
doc_type: 'guide'
---

_이 가이드는 ClickHouse Cloud 및 자가 호스팅 ClickHouse v23.5+와 호환됩니다._

이 가이드는 [BigQuery](https://cloud.google.com/bigquery)의 데이터를 ClickHouse로 마이그레이션하는 방법을 설명합니다.

먼저 테이블을 [Google의 객체 스토리지(GCS)](https://cloud.google.com/storage)로 내보낸 다음, 해당 데이터를 [ClickHouse Cloud](https://clickhouse.com/cloud)로 가져옵니다. BigQuery에서 ClickHouse로 내보내려는 각 테이블마다 이 단계를 반복해야 합니다.

## ClickHouse로 데이터를 내보내는 데 얼마나 걸립니까? \{#how-long-will-exporting-data-to-clickhouse-take\}

BigQuery에서 ClickHouse로 데이터를 내보내는 데 걸리는 시간은 데이터셋의 크기에 따라 달라집니다. 비교를 위해 이 가이드를 사용하여 BigQuery에서 ClickHouse로 [4TB 공개 Ethereum 데이터셋](https://cloud.google.com/blog/products/data-analytics/ethereum-bigquery-public-dataset-smart-contract-analytics)을 내보내는 데 약 1시간이 소요됩니다.

| 테이블                                                                                             | 행            | 내보낸 파일 수 | 데이터 크기 | BigQuery 내보내기 | 슬롯 시간       | ClickHouse 임포트 |
| ------------------------------------------------------------------------------------------------- | ------------- | -------------- | ----------- | ----------------- | --------------- | ----------------- |
| [blocks](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/blocks.md)             | 16,569,489    | 73             | 14.53GB     | 23초              | 37분            | 15.4초            |
| [transactions](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/transactions.md) | 1,864,514,414 | 5169           | 957GB       | 1분 38초          | 1일 8시간       | 18분 5초          |
| [traces](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/traces.md)             | 6,325,819,306 | 17,985         | 2.896TB     | 5분 46초          | 5일 19시간      | 34분 55초         |
| [contracts](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/contracts.md)       | 57,225,837    | 350            | 45.35GB     | 16초              | 1시간 51분      | 39.4초            |
| 합계                                                                                              | 8.26 billion  | 23,577         | 3.982TB     | 8분 3초           | \> 6일 5시간    | 53분 45초         |

<VerticalStepper headerLevel="h2">
  ## GCS로 테이블 데이터 내보내기

  이 단계에서는 [BigQuery SQL workspace](https://cloud.google.com/bigquery/docs/bigquery-web-ui)를 활용하여 SQL 명령을 실행합니다. 아래에서는 [`EXPORT DATA`](https://cloud.google.com/bigquery/docs/reference/standard-sql/other-statements) SQL 문을 사용하여 `mytable`이라는 이름의 BigQuery 테이블을 GCS 버킷으로 내보냅니다.

  ```sql
  DECLARE export_path STRING;
  DECLARE n INT64;
  DECLARE i INT64;
  SET i = 0;

  -- We recommend setting n to correspond to x billion rows. So 5 billion rows, n = 5
  SET n = 100;

  WHILE i < n DO
    SET export_path = CONCAT('gs://mybucket/mytable/', i,'-*.parquet');
    EXPORT DATA
      OPTIONS (
        uri = export_path,
        format = 'PARQUET',
        overwrite = true
      )
    AS (
      SELECT * FROM mytable WHERE export_id = i
    );
    SET i = i + 1;
  END WHILE;
  ```

  위 쿼리에서는 BigQuery 테이블을 [Parquet 데이터 형식](https://parquet.apache.org/)으로 내보냅니다. 또한 `uri` 매개변수에 `*` 문자가 포함되어 있습니다. 이를 통해 내보내기 데이터가 1GB를 초과할 경우 출력이 숫자 증가 접미사를 가진 여러 파일로 세그먼트화됩니다.

  이 방식에는 다음과 같은 여러 장점이 있습니다:

  * Google에서는 하루 최대 50TB까지 GCS로 데이터를 무료로 내보낼 수 있으며, 비용은 GCS 스토리지 요금만 발생합니다.
  * 내보내기는 각 파일의 테이블 데이터 크기를 최대 1GB로 제한하여 여러 개의 파일을 자동으로 생성합니다. 이는 가져오기 작업을 병렬로 수행할 수 있게 해 주므로 ClickHouse에 유리합니다.
  * 컬럼 지향 포맷인 Parquet는 기본적으로 압축되며 BigQuery에서 데이터 내보내기와 ClickHouse에서 쿼리 실행 속도가 더 빠르기 때문에 더 나은 데이터 교환 포맷입니다

  ## GCS에서 ClickHouse로 데이터 가져오기

  내보내기가 완료되면 이 데이터를 ClickHouse 테이블로 가져올 수 있습니다. 아래 명령을 실행하려면 [ClickHouse SQL 콘솔](/integrations/sql-clients/sql-console) 또는 [`clickhouse-client`](/interfaces/cli)를 사용하세요.

  먼저 ClickHouse에서 [테이블을 생성](/sql-reference/statements/create/table)하셔야 합니다:

  ```sql
  -- If your BigQuery table contains a column of type STRUCT, you must enable this setting
  -- to map that column to a ClickHouse column of type Nested
  SET input_format_parquet_import_nested = 1;

  CREATE TABLE default.mytable
  (
          `timestamp` DateTime64(6),
          `some_text` String
  )
  ENGINE = MergeTree
  ORDER BY (timestamp);
  ```

  테이블을 생성한 후, 클러스터에 여러 개의 ClickHouse 레플리카가 있는 경우 내보내기 속도를 높이기 위해 `parallel_distributed_insert_select` 설정을 활성화하십시오. ClickHouse 노드가 하나만 있는 경우 이 단계를 건너뛸 수 있습니다:

  ```sql
  SET parallel_distributed_insert_select = 1;
  ```

  마지막으로 [`INSERT INTO SELECT` 명령](/sql-reference/statements/insert-into#inserting-the-results-of-select)을 사용하여 GCS의 데이터를 ClickHouse 테이블에 삽입할 수 있습니다. 이 명령은 `SELECT` 쿼리 결과를 기반으로 테이블에 데이터를 삽입합니다.

  `INSERT`할 데이터를 가져오려면 [s3Cluster 함수](/sql-reference/table-functions/s3Cluster)를 사용하여 GCS 버킷에서 데이터를 조회할 수 있습니다. GCS는 [Amazon S3](https://aws.amazon.com/s3/)와 상호 운용 가능합니다. ClickHouse 노드가 하나만 있는 경우 `s3Cluster` 함수 대신 [s3 테이블 함수](/sql-reference/table-functions/s3)를 사용하십시오.

  ```sql
  INSERT INTO mytable
  SELECT
      timestamp,
      ifNull(some_text, '') AS some_text
  FROM s3Cluster(
      'default',
      'https://storage.googleapis.com/mybucket/mytable/*.parquet.gz',
      '<ACCESS_ID>',
      '<SECRET>'
  );
  ```

  위 쿼리에서 사용된 `ACCESS_ID`와 `SECRET`은 GCS 버킷에 연결된 [HMAC 키](https://cloud.google.com/storage/docs/authentication/hmackeys)입니다.

  :::note 널 허용 컬럼을 내보낼 때 `ifNull`을 사용하세요
  위 쿼리에서는 [`ifNull` 함수](/sql-reference/functions/functions-for-nulls#ifNull)를 `some_text` 컬럼과 함께 사용하여 기본값으로 ClickHouse 테이블에 데이터를 삽입합니다. ClickHouse에서 컬럼을 [`널 허용`](/sql-reference/data-types/nullable)으로 만들 수도 있지만, 성능에 부정적인 영향을 미칠 수 있으므로 권장하지 않습니다.

  또는 `SET input_format_null_as_default=1`을 설정하면 누락되거나 NULL 값이 해당 컬럼의 기본값으로 대체됩니다(기본값이 지정된 경우).
  :::

  ## 데이터 내보내기 성공 여부 테스트

  데이터가 올바르게 삽입되었는지 테스트하려면 새 테이블에서 `SELECT` 쿼리를 실행하세요:

  ```sql
  SELECT * FROM mytable LIMIT 10;
  ```

  더 많은 BigQuery 테이블을 내보내려면 추가 테이블마다 위의 단계를 반복하세요.
</VerticalStepper>

## 추가 자료 및 지원 \{#further-reading-and-support\}

이 가이드 외에도 [ClickHouse를 사용해 BigQuery 성능을 향상하고 증분 가져오기를 처리하는 방법](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries)을 설명한 블로그 게시물을 함께 읽어 보시기를 권장합니다.

BigQuery에서 ClickHouse로 데이터를 전송하는 과정에서 문제가 발생하면 언제든지 support@clickhouse.com으로 문의해 주시기 바랍니다.