---
sidebar_position: 1
sidebar_label: '스토리지와 컴퓨트의 분리'
slug: /guides/separation-storage-compute
title: '스토리지와 컴퓨트의 분리'
description: '이 가이드는 ClickHouse와 S3를 활용하여 스토리지와 컴퓨트를 분리한 아키텍처를 구현하는 방법을 살펴봅니다.'
doc_type: 'guide'
keywords: ['storage', 'compute', 'architecture', 'scalability', 'cloud']
---

import Image from '@theme/IdealImage';
import BucketDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_S3_authentication_and_bucket.md';
import s3_bucket_example from '@site/static/images/guides/s3_bucket_example.png';


# 스토리지와 컴퓨트 분리 \{#separation-of-storage-and-compute\}

## 개요 \{#overview\}

이 가이드는 ClickHouse와 S3를 사용하여 스토리지와 컴퓨트를 분리한 아키텍처를 구현하는 방법을 설명합니다.

스토리지와 컴퓨트의 분리는 컴퓨팅 리소스와 스토리지 리소스를 서로 독립적으로 관리한다는 의미입니다. ClickHouse에서는 이를 통해 더 나은 확장성, 비용 효율성, 유연성을 확보할 수 있습니다. 필요에 따라 스토리지와 컴퓨트 리소스를 각각 개별적으로 확장하여 성능과 비용을 최적화할 수 있습니다.

S3를 기반 스토리지로 사용하는 ClickHouse는 "콜드(cold)" 데이터에 대한 쿼리 성능이 크게 중요하지 않은 사용 사례에서 특히 유용합니다. ClickHouse는 `S3BackedMergeTree`를 사용하여 `MergeTree` 엔진의 스토리지를 S3에 두는 구성을 지원합니다. 이 테이블 엔진을 사용하면 `MergeTree` 엔진의 데이터 삽입 및 쿼리 성능을 유지하면서도 S3의 확장성과 비용 이점을 활용할 수 있습니다.

스토리지와 컴퓨트 분리 아키텍처를 구현하고 운영하는 작업은 표준 ClickHouse 배포에 비해 더 복잡하다는 점에 유의해야 합니다. 자가 관리형 ClickHouse에서도 이 가이드에서 설명하는 것처럼 스토리지와 컴퓨트 분리가 가능하지만, 설정 없이 [`SharedMergeTree` table engine](/cloud/reference/shared-merge-tree)을 사용해 이 아키텍처로 ClickHouse를 운영할 수 있는 [ClickHouse Cloud](https://clickhouse.com/cloud) 사용을 권장합니다.

*이 가이드는 ClickHouse 버전 22.8 이상을 사용한다고 가정합니다.*

:::warning
AWS/GCS 수명 주기(lifecycle) 정책을 구성하지 마십시오. 이는 지원되지 않으며 테이블이 손상될 수 있습니다.
:::

## 1. ClickHouse 디스크로 S3를 사용하기 \{#1-use-s3-as-a-clickhouse-disk\}

### 디스크 생성 \{#creating-a-disk\}

스토리지 구성을 저장할 새 파일을 ClickHouse `config.d` 디렉터리에 만듭니다.

```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```

다음 XML을 새로 만든 파일에 복사한 다음, `BUCKET`, `ACCESS_KEY_ID`, `SECRET_ACCESS_KEY`를 데이터를 저장할 AWS 버킷 정보로 바꾸십시오.

```xml
<clickhouse>
  <storage_configuration>
    <disks>
      <s3_disk>
        <type>s3</type>
        <endpoint>$BUCKET</endpoint>
        <access_key_id>$ACCESS_KEY_ID</access_key_id>
        <secret_access_key>$SECRET_ACCESS_KEY</secret_access_key>
        <metadata_path>/var/lib/clickhouse/disks/s3_disk/</metadata_path>
      </s3_disk>
      <s3_cache>
        <type>cache</type>
        <disk>s3_disk</disk>
        <path>/var/lib/clickhouse/disks/s3_cache/</path>
        <max_size>10Gi</max_size>
      </s3_cache>
    </disks>
    <policies>
      <s3_main>
        <volumes>
          <main>
            <disk>s3_disk</disk>
          </main>
        </volumes>
      </s3_main>
    </policies>
  </storage_configuration>
</clickhouse>
```

S3 디스크에 대해 `region`을 지정하거나 사용자 정의 HTTP `header`를 전송하는 등 설정을 보다 세부적으로 구성해야 하는 경우, 관련 설정 목록은 [여기](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)에서 확인할 수 있습니다.

또한 `access_key_id`와 `secret_access_key`를 아래와 같이 대체할 수 있으며, 이 구성은 환경 변수와 Amazon EC2 메타데이터에서 자격 증명을 가져오려고 시도합니다:

```bash
<use_environment_credentials>true</use_environment_credentials>
```

구성 파일을 생성한 후에는 파일의 소유자와 그룹을 clickhouse 사용자와 그룹으로 변경해야 합니다.

```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```

이제 ClickHouse 서버를 재시작하여 변경 사항이 적용되도록 하십시오:

```bash
service clickhouse-server restart
```


## 2. S3를 사용하는 테이블 생성 \{#2-create-a-table-backed-by-s3\}

S3 디스크가 제대로 구성되었는지 확인하기 위해 테이블을 생성하고 쿼리를 실행해 볼 수 있습니다.

새 S3 스토리지 정책(storage policy)을 지정하여 테이블을 생성하십시오:

```sql
CREATE TABLE my_s3_table
  (
    `id` UInt64,
    `column1` String
  )
ENGINE = MergeTree
ORDER BY id
SETTINGS storage_policy = 's3_main';
```

엔진을 `S3BackedMergeTree`로 명시할 필요는 없습니다. 테이블이 저장소로 S3를 사용하고 있음을 감지하면 ClickHouse가 내부적으로 엔진 유형을 자동으로 변환합니다.

테이블이 올바른 정책으로 생성되었음을 확인하십시오:

```sql
SHOW CREATE TABLE my_s3_table;
```

다음과 같은 결과가 출력됩니다.

```response
┌─statement────────────────────────────────────────────────────
│ CREATE TABLE default.my_s3_table
(
  `id` UInt64,
  `column1` String
)
ENGINE = MergeTree
ORDER BY id
SETTINGS storage_policy = 's3_main', index_granularity = 8192
└──────────────────────────────────────────────────────────────
```

이제 새 테이블에 몇 개의 행을 삽입해 보겠습니다:

```sql
INSERT INTO my_s3_table (id, column1)
  VALUES (1, 'abc'), (2, 'xyz');
```

행이 삽입되었는지 확인합니다:

```sql
SELECT * FROM my_s3_table;
```

```response
┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ xyz     │
└────┴─────────┘

2 rows in set. Elapsed: 0.284 sec.
```

AWS 콘솔에서 데이터가 S3에 성공적으로 저장되었다면, 지정한 S3 버킷에 ClickHouse가 새 파일을 생성한 것을 확인할 수 있습니다.

모든 작업이 성공적으로 완료되었다면, 이제 스토리지와 컴퓨트를 분리한 상태로 ClickHouse를 사용하고 있습니다!

<Image img={s3_bucket_example} size="md" alt="스토리지와 컴퓨트 분리를 사용하는 S3 버킷 예시" border />


## 3. 장애 허용을 위한 복제 구현(선택 사항) \{#3-implementing-replication-for-fault-tolerance-optional\}

:::warning
AWS/GCS 수명 주기(lifecycle) 정책을 구성하지 마십시오. 이는 지원되지 않으며 테이블이 손상될 수 있습니다.
:::

장애 허용을 위해 여러 AWS 리전에 분산된 여러 ClickHouse 서버 노드를 사용하고, 각 노드마다 하나의 S3 버킷을 둘 수 있습니다.

S3 디스크를 사용한 복제는 `ReplicatedMergeTree` 테이블 엔진을 사용하여 구현할 수 있습니다. 자세한 내용은 다음 가이드를 참조하십시오.

- [S3 Object Storage를 사용하여 단일 세그먼트를 두 개의 AWS 리전에 걸쳐 복제하기](/integrations/s3#s3-multi-region).

## 추가 자료 \{#further-reading\}

- [SharedMergeTree 테이블 엔진](/cloud/reference/shared-merge-tree)
- [SharedMergeTree 소개 블로그](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)