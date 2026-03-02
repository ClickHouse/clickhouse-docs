---
description: 'ClickHouse 백업 및 복원의 개요'
sidebar_label: 'S3 엔드포인트'
slug: /operations/backup/s3_endpoint
title: 'S3 엔드포인트로/에서의 백업 및 복원'
doc_type: 'guide'
---

import Syntax from '@site/i18n/ko/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_syntax.md';


# S3 엔드포인트를 통한 BACKUP / RESTORE \{#backup-to-a-local-disk\}

이 문서는 S3 엔드포인트를 통해 S3 버킷으로 백업을 수행하거나 S3 버킷에서 백업을 복원하는 방법을 설명합니다.

## 구문 \{#syntax\}

<Syntax/>

## 사용 예 \{#usage-examples\}

### S3 엔드포인트로 증분 백업 \{#incremental-backup-to-an-s3-endpoint\}

이 예제에서는 S3 엔드포인트로 백업을 생성한 다음, 해당 백업에서 다시 복원합니다.

:::note
전체 백업과 증분 백업의 차이에 대한 설명은 [&quot;Backup types&quot;](/operations/backup/overview/#backup-types)을 참고하십시오.
:::

이 방법을 사용하려면 다음 정보가 필요합니다:

| 매개변수      | 예                                                            |
| --------- | ------------------------------------------------------------ |
| S3 엔드포인트  | `https://backup-ch-docs.s3.us-east-1.amazonaws.com/backups/` |
| 액세스 키 ID  | `BKIOZLE2VYN3VXXTP9RC`                                       |
| 시크릿 액세스 키 | `40bwYnbqN7xU8bVePaUCh3+YEyGXu8UOMV9ANpwL`                   |

:::tip
S3 버킷 생성 방법은 [&quot;use S3 Object Storage as a ClickHouse disk&quot;](/integrations/data-ingestion/s3/index.md#configuring-s3-for-clickhouse-use) 섹션에서 다룹니다.
:::

백업 대상은 다음과 같이 지정합니다:

```sql
S3('<s3 endpoint>/<directory>', '<access key id>', '<secret access key>', '<extra_credentials>')
```

<br />


<VerticalStepper headerLevel="h4">

#### 설정 \{#create-a-table\}

다음 데이터베이스와 테이블을 생성한 후, 임의의 데이터를 삽입합니다:

```sql
CREATE DATABASE IF NOT EXISTS test_db;
CREATE TABLE test_db.test_table
(
    `key` Int,
    `value` String,
    `array` Array(String)
)
ENGINE = MergeTree
ORDER BY tuple()
```

```sql
INSERT INTO test_db.test_table SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 1000
```

#### 기본 백업 생성 \{#create-a-base-initial-backup\}

증분 백업은 시작점이 되는 _기본(base)_ 백업이 필요합니다.  
S3 대상의 첫 번째 매개변수는 S3 엔드포인트이며, 그 다음은 이 백업에 사용할 버킷 내 디렉터리입니다. 이 예제에서 디렉터리 이름은 `my_backup`입니다.

다음 명령을 실행하여 기본 백업을 생성합니다:

```sql
BACKUP TABLE test_db.test_table TO S3(
'https://backup-ch-docs.s3.us-east-1.amazonaws.com/backups/base_backup',
'<access key id>',
'<secret access key>'
)
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ de442b75-a66c-4a3c-a193-f76f278c70f3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

#### 데이터 추가 \{#add-more-data\}

증분 백업은 기본 백업과 현재 백업 대상 테이블 내용 간의 차이 데이터로 구성됩니다.  
증분 백업을 수행하기 전에 데이터를 추가합니다:

```sql
INSERT INTO test_db.test_table SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 100
```

#### 증분 백업 수행 \{#take-an-incremental-backup\}

이 백업 명령은 기본 백업과 유사하지만, `SETTINGS base_backup`과 기본 백업의 위치를 추가합니다.  
증분 백업의 대상은 기본 백업과 동일한 디렉터리가 아니라, 동일한 엔드포인트에서 버킷 내 다른 대상 디렉터리라는 점에 유의하십시오. 기본 백업은 `my_backup`에 있고, 증분 백업은 `my_incremental`에 기록됩니다:

```sql
BACKUP TABLE test_db.test_table TO S3(
'https://backup-ch-docs.s3.us-east-1.amazonaws.com/backups/incremental_backup',
'<access key id>',
'<secret access key>'
)
SETTINGS base_backup = S3(
'https://backup-ch-docs.s3.us-east-1.amazonaws.com/backups/base_backup',
'<access key id>',
'<secret access key>'
)
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ f6cd3900-850f-41c9-94f1-0c4df33ea528 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

#### 증분 백업에서 복원 \{#restore-from-the-incremental-backup\}

이 명령은 증분 백업을 새 테이블 `test_table_restored`로 복원합니다.  
증분 백업을 복원할 때 기본 백업도 함께 포함된다는 점에 유의하십시오.  
복원 시에는 **증분 백업**만 지정하면 됩니다:

```sql
RESTORE TABLE data AS test_db.test_table_restored FROM S3(
'https://backup-ch-docs.s3.us-east-1.amazonaws.com/backups/incremental_backup',
'<access key id>',
'<secret access key>'
)
```

```response
┌─id───────────────────────────────────┬─status───┐
│ ff0c8c39-7dff-4324-a241-000796de11ca │ RESTORED │
└──────────────────────────────────────┴──────────┘
```

#### 건수 확인 \{#verify-the-count\}

원본 테이블 `data`에는 2번의 INSERT가 수행되었으며, 한 번은 1,000개의 행, 한 번은 100개의 행이어서 총 1,100개입니다.  
복원된 테이블에 1,100개의 행이 있는지 확인합니다:

```sql
SELECT count()
FROM test_db.test_table_restored
```

```response
┌─count()─┐
│    1100 │
└─────────┘
```

#### 내용 확인 \{#verify-the-content\}

원본 테이블 `test_table`의 내용과 복원된 테이블 `test_table_restored`의 내용을 비교합니다:

```sql
SELECT throwIf((
   SELECT groupArray(tuple(*))
   FROM test_db.test_table
   ) != (
   SELECT groupArray(tuple(*))
   FROM test_db.test_table_restored
), 'Data does not match after BACKUP/RESTORE')
```

</VerticalStepper>