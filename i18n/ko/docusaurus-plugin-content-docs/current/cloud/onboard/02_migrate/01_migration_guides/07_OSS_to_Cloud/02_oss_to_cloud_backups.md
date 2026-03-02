---
sidebar_label: 'BACKUP 및 RESTORE 사용하기'
slug: /cloud/migration/oss-to-cloud-backup-restore
title: 'BACKUP/RESTORE를 사용한 자가 관리형 ClickHouse와 ClickHouse Cloud 간 마이그레이션'
description: 'BACKUP 및 RESTORE 명령을 사용하여 자가 관리형 ClickHouse와 ClickHouse Cloud 간에 마이그레이션하는 방법을 설명하는 페이지'
doc_type: 'guide'
keywords: ['마이그레이션', 'ClickHouse Cloud', 'OSS', '자가 관리형에서 Cloud로 마이그레이션', 'BACKUP', 'RESTORE']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Image from '@theme/IdealImage';
import create_service from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/create_service.png';
import service_details from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/service_details.png';
import open_console from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/open_console.png';
import service_role_id from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/service_role_id.png';
import create_new_role from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/create_new_role.png';
import backup_s3_bucket from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/backup_in_s3_bucket.png';


# 백업 명령을 사용하여 자가 관리형 ClickHouse를 ClickHouse Cloud로 마이그레이션하기 \{#migrating-from-self-managed-clickhouse-to-clickhouse-cloud-using-backup-commands\}

## 개요 \{#overview-migration-approaches\}

자가 관리형 ClickHouse(OSS)에서 ClickHouse Cloud로 데이터를 마이그레이션하는 주요 방법은 두 가지입니다.

- 데이터를 직접 가져오고 전송하는 [`remoteSecure()`](/cloud/migration/clickhouse-to-cloud) 함수 사용
- 클라우드 객체 스토리지를 통한 `BACKUP`/`RESTORE` 명령 사용

>이 마이그레이션 가이드는 `BACKUP`/`RESTORE` 방식을 중심으로 설명하며, 오픈 소스 ClickHouse의 데이터베이스 또는 전체 서비스를 S3 버킷을 통해 Cloud로 마이그레이션하는 실용적인 예제를 제공합니다.

**사전 준비 사항**

- Docker가 설치되어 있어야 합니다.
- [S3 버킷과 IAM 사용자](/integrations/s3/creating-iam-user-and-s3-bucket)가 있어야 합니다.
- 새 ClickHouse Cloud 서비스를 생성할 수 있어야 합니다.

이 가이드의 절차를 따라 하기 쉽고 재현 가능하게 만들기 위해, 세그먼트 2개와 레플리카 2개로 구성된 ClickHouse 클러스터용 Docker Compose 레시피 중 하나를 사용합니다.

:::note[클러스터 필요]
이 백업 방법은 `MergeTree` 엔진에서 `ReplicatedMergeTree`로 테이블을 변환해야 하므로 ClickHouse 클러스터가 필요합니다.
단일 인스턴스를 실행 중인 경우, 대신 ["`remoteSecure()`를 사용하여 자가 관리형 ClickHouse와 ClickHouse Cloud 간 마이그레이션"](/cloud/migration/clickhouse-to-cloud)의 단계를 따르십시오.
:::

## OSS 준비 \{#oss-setup\}

먼저 예제 저장소에 있는 Docker Compose 설정을 사용하여 ClickHouse 클러스터를 기동합니다.
이미 실행 중인 ClickHouse 클러스터가 있다면 이 단계는 건너뛰어도 됩니다.

1. [examples 저장소](https://github.com/ClickHouse/examples)를 로컬 머신으로 클론합니다.
2. 터미널에서 `examples/docker-compose-recipes/recipes/cluster_2S_2R` 디렉터리로 `cd` 명령을 사용해 이동합니다.
3. Docker가 실행 중인지 확인한 다음, ClickHouse 클러스터를 시작합니다:

```bash
docker compose up
```

다음과 같은 결과가 표시됩니다:

```bash
[+] Running 7/7
 ✔ Container clickhouse-keeper-01  Created  0.1s
 ✔ Container clickhouse-keeper-02  Created  0.1s
 ✔ Container clickhouse-keeper-03  Created  0.1s
 ✔ Container clickhouse-01         Created  0.1s
 ✔ Container clickhouse-02         Created  0.1s
 ✔ Container clickhouse-04         Created  0.1s
 ✔ Container clickhouse-03         Created  0.1s
```

폴더의 루트에서 새 터미널 창을 열고 클러스터의 첫 번째 노드에 연결하려면 다음 명령을 실행하십시오:

```bash
docker exec -it clickhouse-01 clickhouse-client
```


### 샘플 데이터 생성 \{#create-sample-data\}

ClickHouse Cloud는 [`SharedMergeTree`](/cloud/reference/shared-merge-tree)를 사용합니다.
백업을 복원할 때 ClickHouse는 `ReplicatedMergeTree` 테이블을 자동으로 `SharedMergeTree` 테이블로 변환합니다.

클러스터를 실행 중이라면 테이블이 이미 `ReplciatedMergeTree` 엔진을 사용하고 있을 가능성이 높습니다.
그렇지 않다면 백업하기 전에 모든 `MergeTree` 테이블을 `ReplicatedMergeTree`로 변환해야 합니다.

`MergeTree` 테이블을 `ReplicatedMergeTree`로 변환하는 방법을 보여 주기 위해, 우선 `MergeTree` 테이블로 시작한 후 나중에 이를 `ReplicatedMergeTree`로 변환하겠습니다.
샘플 테이블을 생성하고 데이터를 적재하기 위해 [New York taxi data guide](/getting-started/example-datasets/nyc-taxi)의 처음 두 단계를 따르겠습니다.
편의를 위해 해당 단계를 아래에 포함했습니다.

다음 명령을 실행하여 새 데이터베이스를 만들고 S3 버킷에서 새 테이블로 데이터를 삽입하십시오:

```sql
CREATE DATABASE nyc_taxi;

CREATE TABLE nyc_taxi.trips_small (
    trip_id             UInt32,
    pickup_datetime     DateTime,
    dropoff_datetime    DateTime,
    pickup_longitude    Nullable(Float64),
    pickup_latitude     Nullable(Float64),
    dropoff_longitude   Nullable(Float64),
    dropoff_latitude    Nullable(Float64),
    passenger_count     UInt8,
    trip_distance       Float32,
    fare_amount         Float32,
    extra               Float32,
    tip_amount          Float32,
    tolls_amount        Float32,
    total_amount        Float32,
    payment_type        Enum('CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4, 'UNK' = 5),
    pickup_ntaname      LowCardinality(String),
    dropoff_ntaname     LowCardinality(String)
)
ENGINE = MergeTree
PRIMARY KEY (pickup_datetime, dropoff_datetime);
```

```sql
INSERT INTO nyc_taxi.trips_small
SELECT
    trip_id,
    pickup_datetime,
    dropoff_datetime,
    pickup_longitude,
    pickup_latitude,
    dropoff_longitude,
    dropoff_latitude,
    passenger_count,
    trip_distance,
    fare_amount,
    extra,
    tip_amount,
    tolls_amount,
    total_amount,
    payment_type,
    pickup_ntaname,
    dropoff_ntaname
FROM s3(
    'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_{0..2}.gz',
    'TabSeparatedWithNames'
);
```

테이블을 `DETACH`하기 위해 다음 명령을 실행합니다.

```sql
DETACH TABLE nyc_taxi.trips_small;
```

그런 다음 이를 레플리카로 추가합니다:

```sql
ATTACH TABLE nyc_taxi.trips_small AS REPLICATED;
```

마지막으로 레플리카 메타데이터를 복원하십시오:

```sql
SYSTEM RESTORE REPLICA nyc_taxi.trips_small;
```

`ReplicatedMergeTree`로 변환되었는지 확인하십시오:

```sql
SELECT engine
FROM system.tables
WHERE name = 'trips_small' AND database = 'nyc_taxi';

┌─engine──────────────┐
│ ReplicatedMergeTree │
└─────────────────────┘
```

이제 이후에 S3 버킷에서 백업을 복원할 수 있도록 Cloud 서비스를 설정할 준비가 되었습니다.


## Cloud 준비 \{#cloud-setup\}

데이터를 새 Cloud 서비스로 복원하게 됩니다.
아래 단계에 따라 새 Cloud 서비스를 생성합니다.

<VerticalStepper headerLevel="h4">

#### Cloud Console 열기 \{#open-cloud-console\}

Go to [https://console.clickhouse.cloud/](https://console.clickhouse.cloud/)

#### 새 서비스 생성 \{#create-new-service\}

<Image img={create_service} size="md" alt="새 서비스 생성"/> 

#### 서비스 구성 및 생성 \{#configure-and-create\}

원하는 리전과 구성을 선택한 다음 `Create service`를 클릭합니다.

<Image img={service_details} size="md" alt="서비스 기본 설정 구성"/> 

#### 액세스 역할 생성 \{#create-an-access-role\}

Open SQL console

<Image img={open_console} size="md" alt="서비스 기본 설정 구성"/>

### S3 액세스 설정 \{#set-up-s3-access\}

S3에서 백업을 복원하려면 ClickHouse Cloud와 S3 버킷 간의 보안 액세스를 구성해야 합니다.

1. ["S3 데이터에 안전하게 액세스하기"](/cloud/data-sources/secure-s3)의 단계에 따라 액세스 역할을 생성하고 역할 ARN을 가져옵니다.

2. ["S3 버킷 및 IAM 역할 생성 방법"](/integrations/s3/creating-iam-user-and-s3-bucket)에서 생성한 S3 버킷 정책에 이전 단계에서 얻은 역할 ARN을 추가하여 업데이트합니다.

업데이트된 S3 버킷 정책은 다음과 비슷한 형태입니다:

```json
{
    "Version": "2012-10-17",
    "Id": "Policy123456",
    "Statement": [
        {
            "Sid": "abc123",
            "Effect": "Allow",
            "Principal": {
                "AWS": [
#highlight-start                  
                    "arn:aws:iam::123456789123:role/ClickHouseAccess-001",
                    "arn:aws:iam::123456789123:user/docs-s3-user"
#highlight-end                            
                ]
            },
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::ch-docs-s3-bucket",
                "arn:aws:s3:::ch-docs-s3-bucket/*"
            ]
        }
    ]
}
```

이 정책에는 두 개의 ARN이 모두 포함됩니다:
- **IAM user** (`docs-s3-user`): 자가 관리형 ClickHouse 클러스터가 S3에 백업할 수 있도록 허용합니다.
- **ClickHouse Cloud role** (`ClickHouseAccess-001`): Cloud 서비스가 S3에서 복원할 수 있도록 허용합니다.

</VerticalStepper>

## 백업 수행(자가 관리형 배포 환경에서) \{#taking-a-backup-on-oss\}

단일 데이터베이스를 백업하려면 OSS 자가 관리형 배포에 연결된 `clickhouse-client`에서
다음 명령을 실행합니다.

```sql
BACKUP DATABASE nyc_taxi
TO S3(
  'BUCKET_URL',
  'KEY_ID',
  'SECRET_KEY'
)
```

`BUCKET_URL`, `KEY_ID`, `SECRET_KEY`를 본인의 AWS 자격 증명으로 바꾸십시오.
가이드 [&quot;How to create an S3 bucket and IAM role&quot;](/integrations/s3/creating-iam-user-and-s3-bucket)에서는
아직 해당 정보를 가지고 있지 않은 경우 이를 얻는 방법을 설명합니다.

모든 구성이 올바르게 완료되었다면,
백업에 할당된 고유 ID와 백업 상태가 포함된 아래와 유사한 응답이 표시됩니다.

```response
Query id: efcaf053-75ed-4924-aeb1-525547ea8d45

┌─id───────────────────────────────────┬─status─────────┐
│ e73b99ab-f2a9-443a-80b4-533efe2d40b3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

이전에 비어 있던 S3 버킷을 확인하면 이제 몇 개의 폴더가 생성된 것을 확인할 수 있습니다:

<Image img={backup_s3_bucket} size="md" alt="backup, data and metadata" />

전체 마이그레이션을 수행 중이라면 다음 명령을 실행하여 서버 전체를 백업할 수 있습니다:

```sql
BACKUP
TABLE system.users,
TABLE system.roles,
TABLE system.settings_profiles,
TABLE system.row_policies,
TABLE system.quotas,
TABLE system.functions,
ALL EXCEPT DATABASES INFORMATION_SCHEMA, information_schema, system
TO S3(
  'BUCKET_ID',
  'KEY_ID',
  'SECRET_ID'
)
SETTINGS
  compression_method='lzma',
  compression_level=3;
```

위 명령은 다음을 백업합니다:

* 모든 사용자 데이터베이스와 테이블
* 사용자 계정과 비밀번호
* 역할과 권한
* 설정 프로필(Settings profiles)
* 행 정책(Row policies)
* 쿼터(Quotas)
* 사용자 정의 함수(User-Defined Functions)

다른 클라우드 서비스 제공자(Cloud Service Provider, CSP)를 사용하는 경우, `TO S3()`(AWS와 GCP 모두에서 사용 가능)와 `TO AzureBlobStorage()` 구문을 사용할 수 있습니다.

매우 큰 데이터베이스의 경우, `ASYNC`를 사용하여 백그라운드에서 백업을 실행하도록 하는 것을 고려하십시오:

```sql
BACKUP DATABASE my_database 
TO S3('https://your-bucket.s3.amazonaws.com/backup.zip', 'key', 'secret')
ASYNC;
       
-- Returns immediately with backup ID
-- Example result:
-- ┌─id──────────────────────────────────┬─status────────────┐
-- │ abc123-def456-789                   │ CREATING_BACKUP   │
-- └─────────────────────────────────────┴───────────────────┘
```

이제 이 백업 ID를 사용하여 백업 진행 상황을 모니터링할 수 있습니다:

```sql
SELECT * 
FROM system.backups 
WHERE id = 'abc123-def456-789'
```

증분 백업을 수행할 수도 있습니다.
백업 전반에 대한 자세한 내용은 [backup and restore](/operations/backup/overview) 문서를 참조하십시오.


## ClickHouse Cloud로 복원 \{#restore-to-clickhouse-cloud\}

단일 데이터베이스를 복원하려면 Cloud 서비스에서 아래 쿼리를 실행하십시오. 이때 아래에 AWS 자격 증명을 입력하고,
`ROLE_ARN`을 [&quot;Accessing S3 data securely&quot;](/cloud/data-sources/secure-s3)에 자세히 설명된 단계의 출력으로 얻은 값과 동일하게 설정합니다.

```sql
RESTORE DATABASE nyc_taxi
FROM S3(
    'BUCKET_URL',
    extra_credentials(role_arn = 'ROLE_ARN')
)
```

마찬가지로 전체 서비스를 복원할 수 있습니다.

```sql
RESTORE
    TABLE system.users,
    TABLE system.roles,
    TABLE system.settings_profiles,
    TABLE system.row_policies,
    TABLE system.quotas,
    ALL EXCEPT DATABASES INFORMATION_SCHEMA, information_schema, system
FROM S3(
    'BUCKET_URL',
    extra_credentials(role_arn = 'ROLE_ARN')
)
```

이제 Cloud에서 다음 쿼리를 실행하면 데이터베이스와 테이블이 Cloud에 성공적으로 복원된 것을 확인할 수 있습니다:

```sql
SELECT count(*) FROM nyc_taxi.trips_small;
3000317
```
