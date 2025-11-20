---
'sidebar_label': '데이터 로드하기'
'title': 'BigQuery에서 ClickHouse로 데이터 로드하기'
'slug': '/migrations/bigquery/loading-data'
'description': 'BigQuery에서 ClickHouse로 데이터를 로드하는 방법'
'keywords':
- 'migrate'
- 'migration'
- 'migrating'
- 'data'
- 'etl'
- 'elt'
- 'BigQuery'
'doc_type': 'guide'
---

_이 가이드는 ClickHouse Cloud와 자가 호스팅 ClickHouse v23.5+에 호환됩니다._

이 가이드는 [BigQuery](https://cloud.google.com/bigquery)에서 ClickHouse로 데이터를 마이그레이션하는 방법을 보여줍니다.

우리는 먼저 테이블을 [Google의 객체 저장소 (GCS)](https://cloud.google.com/storage)에 내보내고, 그런 다음 해당 데이터를 [ClickHouse Cloud](https://clickhouse.com/cloud)로 가져옵니다. 각 테이블을 BigQuery에서 ClickHouse로 내보내기 위해 이 단계를 반복해야 합니다.

## ClickHouse로 데이터 내보내는 데 얼마나 걸리나요? {#how-long-will-exporting-data-to-clickhouse-take}

BigQuery에서 ClickHouse로 데이터를 내보내는 시간은 데이터셋의 크기에 따라 다릅니다. 예를 들어, 이 가이드를 사용하여 [4TB 공용 이더리움 데이터셋](https://cloud.google.com/blog/products/data-analytics/ethereum-bigquery-public-dataset-smart-contract-analytics)을 BigQuery에서 ClickHouse로 내보내는 데 약 1시간이 걸립니다.

| 테이블                                                                                              | 행 수              | 내보낸 파일 수 | 데이터 크기 | BigQuery 내보내기 | 슬롯 시간       | ClickHouse 가져오기 |
| --------------------------------------------------------------------------------------------------- | ----------------- | -------------- | ----------- | ----------------- | ---------------- | ------------------- |
| [blocks](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/blocks.md)               | 16,569,489        | 73             | 14.53GB     | 23 초            | 37 분            | 15.4 초             |
| [transactions](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/transactions.md)   | 1,864,514,414     | 5169           | 957GB       | 1 분 38 초       | 1일 8시간        | 18 분 5 초          |
| [traces](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/traces.md)               | 6,325,819,306     | 17,985         | 2.896TB     | 5 분 46 초       | 5일 19시간       | 34 분 55 초         |
| [contracts](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/contracts.md)         | 57,225,837        | 350            | 45.35GB     | 16 초            | 1 시간 51 분     | 39.4 초             |
| 합계                                                                                                 | 82.6억            | 23,577         | 3.982TB     | 8 분 3 초        | \> 6일 5시간     | 53 분 45 초         |

<VerticalStepper headerLevel="h2">

## GCS로 테이블 데이터 내보내기 {#1-export-table-data-to-gcs}

이 단계에서는 [BigQuery SQL 작업 공간](https://cloud.google.com/bigquery/docs/bigquery-web-ui)을 활용하여 SQL 명령을 실행합니다. 아래에서 `mytable`이라는 BigQuery 테이블을 GCS 버킷으로 내보내기 위해 [`EXPORT DATA`](https://cloud.google.com/bigquery/docs/reference/standard-sql/other-statements) 문을 사용합니다.

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

위 쿼리에서 우리는 BigQuery 테이블을 [Parquet 데이터 형식](https://parquet.apache.org/)으로 내보냅니다. `uri` 매개변수에 `*` 문자가 포함되어 있습니다. 이것은 내보내는 데이터가 1GB를 초과할 경우 출력이 여러 파일로 분할되며, 숫자가 증가하는 접미사가 붙도록 합니다.

이 접근 방식에는 여러 가지 이점이 있습니다:

- Google은 하루 최대 50TB를 GCS로 무료로 내보낼 수 있도록 허용합니다. 사용자는 GCS 저장소에 대해서만 비용을 지불합니다.
- 내보낼 때 여러 파일이 자동으로 생성되며, 각 파일의 최대 크기는 1GB로 제한됩니다. 이는 ClickHouse에 유리하게 작용하여 병렬로 가져오는 것이 가능합니다.
- Parquet은 컬럼형 형식으로, 본질적으로 압축되어 있으며 BigQuery에서 데이터를 내보내고 ClickHouse에서 쿼리하는 데 더 빠른 교환 형식을 제공합니다.

## GCS에서 ClickHouse로 데이터 가져오기 {#2-importing-data-into-clickhouse-from-gcs}

내보내기가 완료되면, 이 데이터를 ClickHouse 테이블로 가져올 수 있습니다. 아래 명령을 실행하기 위해 [ClickHouse SQL 콘솔](/integrations/sql-clients/sql-console) 또는 [`clickhouse-client`](/interfaces/cli)를 사용할 수 있습니다.

먼저 ClickHouse에서 테이블을 [생성해야 합니다](/sql-reference/statements/create/table):

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

테이블을 생성한 후에는 클러스터에 여러 ClickHouse 복제본이 있는 경우 내보내기를 빠르게 하기 위해 `parallel_distributed_insert_select` 설정을 활성화합니다. ClickHouse 노드가 하나만 있는 경우 이 단계를 건너뛸 수 있습니다:

```sql
SET parallel_distributed_insert_select = 1;
```

마지막으로, [`INSERT INTO SELECT` 명령](/sql-reference/statements/insert-into#inserting-the-results-of-select)을 사용하여 GCS에서 우리의 ClickHouse 테이블로 데이터를 삽입할 수 있습니다. 이 명령은 `SELECT` 쿼리의 결과를 바탕으로 테이블에 데이터를 삽입합니다.

삽입할 데이터를 검색하기 위해 [s3Cluster 함수](/sql-reference/table-functions/s3Cluster)를 사용하여 GCS 버킷에서 데이터를 검색할 수 있습니다. GCS는 [Amazon S3](https://aws.amazon.com/s3/)와 호환됩니다. ClickHouse 노드가 하나만 있는 경우 `s3` 테이블 함수 대신 [s3Cluster 함수](/sql-reference/table-functions/s3)를 사용할 수 있습니다.

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

:::note Nullable 컬럼을 내보낼 때 `ifNull` 사용
위 쿼리에서 우리는 `some_text` 컬럼에 대해 기본값을 사용하여 ClickHouse 테이블에 데이터를 삽입하기 위해 [`ifNull` 함수](/sql-reference/functions/functions-for-nulls#ifNull)를 사용합니다. ClickHouse에서 컬럼을 [`Nullable`](/sql-reference/data-types/nullable)로 만들 수 있지만, 이는 성능에 부정적인 영향을 미칠 수 있으므로 권장되지 않습니다.

대안으로, `SET input_format_null_as_default=1`을 사용하면 누락되거나 NULL 값이 해당 컬럼의 기본값으로 교체됩니다. 기본값이 지정되어 있는 경우에 한정됩니다.
:::

## 내보내기가 성공적으로 되었는지 테스트하기 {#3-testing-successful-data-export}

데이터가 제대로 삽입되었는지 테스트하려면, 새로운 테이블에서 `SELECT` 쿼리를 실행하면 됩니다:

```sql
SELECT * FROM mytable LIMIT 10;
```

추가 BigQuery 테이블을 내보내려면, 각 추가 테이블에 대해 위 단계를 반복하면 됩니다.

</VerticalStepper>

## 추가 자료 및 지원 {#further-reading-and-support}

이 가이드 외에도 [ClickHouse를 사용하여 BigQuery를 빠르게 하고 증분 가져오기를 처리하는 방법](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries)에 대한 블로그 게시물도 읽어보시기를 권장합니다.

BigQuery에서 ClickHouse로 데이터를 전송하는 데 문제가 있는 경우, 언제든지 지원을 위해 support@clickhouse.com으로 문의해 주십시오.
