---
'sidebar_label': 'DynamoDB'
'sidebar_position': 10
'slug': '/integrations/dynamodb'
'description': 'ClickPipes를 사용하면 ClickHouse를 DynamoDB에 연결할 수 있습니다.'
'keywords':
- 'DynamoDB'
'title': 'DynamoDB에서 ClickHouse로의 CDC'
'show_related_blogs': true
'doc_type': 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import dynamodb_kinesis_stream from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-kinesis-stream.png';
import dynamodb_s3_export from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-s3-export.png';
import dynamodb_map_columns from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-map-columns.png';
import Image from '@theme/IdealImage';


# CDC from DynamoDB to ClickHouse

<ExperimentalBadge/>

이 페이지는 ClickPipes를 사용하여 DynamoDB에서 ClickHouse로 CDC를 설정하는 방법을 다룹니다. 이 통합에는 2개의 구성 요소가 있습니다:
1. S3 ClickPipes를 통한 초기 스냅샷
2. Kinesis ClickPipes를 통한 실시간 업데이트

데이터는 `ReplacingMergeTree`에 적재됩니다. 이 테이블 엔진은 업데이트 작업이 적용될 수 있도록 CDC 시나리오에서 일반적으로 사용됩니다. 이 패턴에 대한 자세한 내용은 다음 블로그 기사를 참조하십시오:

* [PostgreSQL 및 ClickHouse로 변경 데이터 캡처 (CDC) - 1부](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1?loc=docs-rockest-migrations)
* [PostgreSQL 및 ClickHouse로 변경 데이터 캡처 (CDC) - 2부](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2?loc=docs-rockest-migrations)

## 1. Kinesis 스트림 설정 {#1-set-up-kinesis-stream}

먼저, DynamoDB 테이블에서 Kinesis 스트림을 활성화하여 실시간으로 변경 사항을 캡처해야 합니다. 스냅샷을 생성하기 전에 이 작업을 수행하여 데이터를 놓치는 것을 방지합니다.
AWS 가이드는 [여기](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/kds.html)에 있습니다.

<Image img={dynamodb_kinesis_stream} size="lg" alt="DynamoDB Kinesis Stream" border/>

## 2. 스냅샷 생성 {#2-create-the-snapshot}

다음으로, DynamoDB 테이블의 스냅샷을 생성합니다. 이는 AWS의 S3로 내보내기를 통해 달성할 수 있습니다. AWS 가이드는 [여기](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html)에 있습니다.
**DynamoDB JSON 형식으로 "전체 내보내기"를 수행해야 합니다.**

<Image img={dynamodb_s3_export} size="md" alt="DynamoDB S3 Export" border/>

## 3. ClickHouse에 스냅샷 로드 {#3-load-the-snapshot-into-clickhouse}

### 필요한 테이블 생성 {#create-necessary-tables}

DynamoDB의 스냅샷 데이터는 다음과 같은 형식일 것입니다:
```json
{
  "age": {
    "N": "26"
  },
  "first_name": {
    "S": "sally"
  },
  "id": {
    "S": "0A556908-F72B-4BE6-9048-9E60715358D4"
  }
}
```

데이터가 중첩된 형식임을 관찰하십시오. ClickHouse에 로드하기 전에 이 데이터를 평면화해야 합니다. 이는 ClickHouse의 물리화된 뷰에서 `JSONExtract` 함수를 사용하여 수행할 수 있습니다.

세 개의 테이블을 생성해야 합니다:
1. DynamoDB에서 원시 데이터를 저장할 테이블
2. 최종 평면화된 데이터를 저장할 테이블 (대상 테이블)
3. 데이터를 평면화할 물리화된 뷰

위의 예시 DynamoDB 데이터에 대해 ClickHouse 테이블은 다음과 같을 것입니다:

```sql
/* Snapshot table */
CREATE TABLE IF NOT EXISTS "default"."snapshot"
(
    `item` String
)
ORDER BY tuple();

/* Table for final flattened data */
CREATE MATERIALIZED VIEW IF NOT EXISTS "default"."snapshot_mv" TO "default"."destination" AS
SELECT
    JSONExtractString(item, 'id', 'S') AS id,
    JSONExtractInt(item, 'age', 'N') AS age,
    JSONExtractString(item, 'first_name', 'S') AS first_name
FROM "default"."snapshot";

/* Table for final flattened data */
CREATE TABLE IF NOT EXISTS "default"."destination" (
    "id" String,
    "first_name" String,
    "age" Int8,
    "version" Int64
)
ENGINE ReplacingMergeTree("version")
ORDER BY id;
```

대상 테이블에 대한 몇 가지 요구 사항이 있습니다:
- 이 테이블은 `ReplacingMergeTree` 테이블이어야 합니다.
- 테이블에는 `version` 컬럼이 있어야 합니다.
  - 이후 단계에서 Kinesis 스트림의 `ApproximateCreationDateTime` 필드를 `version` 컬럼에 매핑할 것입니다.
- 테이블은 `ORDER BY`에 지정된 대로 파티션 키를 정렬 키로 사용해야 합니다.
  - 동일한 정렬 키를 가진 행은 `version` 컬럼을 기준으로 중복 제거됩니다.

### 스냅샷 ClickPipe 생성 {#create-the-snapshot-clickpipe}
이제 S3의 스냅샷 데이터를 ClickHouse로 로드할 ClickPipe를 생성할 수 있습니다. S3 ClickPipe 가이드는 [여기](/integrations/clickpipes/object-storage)를 참조하되, 다음 설정을 사용하십시오:

- **적재 경로**: S3에서 내보낸 JSON 파일의 경로를 찾아야 합니다. 경로는 다음과 같을 것입니다:

```text
https://{bucket}.s3.amazonaws.com/{prefix}/AWSDynamoDB/{export-id}/data/*
```

- **형식**: JSONEachRow
- **테이블**: 귀하의 스냅샷 테이블 (예: 위 예제의 `default.snapshot`)

생성된 후, 데이터가 스냅샷 및 대상 테이블에 채워지기 시작합니다. 다음 단계로 넘어가기 전에 스냅샷 로드가 완료되기를 기다릴 필요는 없습니다.

## 4. Kinesis ClickPipe 생성 {#4-create-the-kinesis-clickpipe}

이제 Kinesis 스트림에서 실시간 변경 사항을 캡처하기 위해 Kinesis ClickPipe를 설정할 수 있습니다. Kinesis ClickPipe 가이드는 [여기](/integrations/data-ingestion/clickpipes/kinesis.md)를 참조하되, 다음 설정을 사용하십시오:

- **스트림**: 1단계에서 사용한 Kinesis 스트림
- **테이블**: 귀하의 대상 테이블 (예: 위 예제의 `default.destination`)
- **객체 평면화**: true
- **컬럼 매핑**:
  - `ApproximateCreationDateTime`: `version`
  - 다른 필드를 아래와 같이 적절한 대상 컬럼에 매핑합니다.

<Image img={dynamodb_map_columns} size="md" alt="DynamoDB Map Columns" border/>

## 5. 정리 (선택 사항) {#5-cleanup-optional}

스냅샷 ClickPipe가 완료되면 스냅샷 테이블과 물리화된 뷰를 삭제할 수 있습니다.

```sql
DROP TABLE IF EXISTS "default"."snapshot";
DROP TABLE IF EXISTS "default"."snapshot_clickpipes_error";
DROP VIEW IF EXISTS "default"."snapshot_mv";
```
