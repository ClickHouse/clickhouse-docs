---
'sidebar_position': 1
'sidebar_label': '스토리지와 컴퓨트를 분리하는 방법'
'slug': '/guides/separation-storage-compute'
'title': '스토리지와 컴퓨트를 분리하는 방법'
'description': '이 가이드는 ClickHouse와 S3를 사용하여 스토리지와 컴퓨트를 분리한 아키텍처를 구현하는 방법을 살펴봅니다.'
'doc_type': 'guide'
'keywords':
- 'storage'
- 'compute'
- 'architecture'
- 'scalability'
- 'cloud'
---

import Image from '@theme/IdealImage';
import BucketDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_S3_authentication_and_bucket.md';
import s3_bucket_example from '@site/static/images/guides/s3_bucket_example.png';


# 스토리지와 컴퓨트 분리

## 개요 {#overview}

이 가이드는 ClickHouse와 S3를 사용하여 스토리지와 컴퓨트를 분리한 아키텍처를 구현하는 방법을 탐구합니다.

스토리지와 컴퓨트의 분리는 컴퓨팅 자원과 스토리지 자원을 독립적으로 관리함을 의미합니다. ClickHouse에서는 이를 통해 더 나은 확장성, 비용 효율성 및 유연성을 제공합니다. 필요에 따라 스토리지와 컴퓨트 자원을 별도로 확장하여 성능과 비용을 최적화할 수 있습니다.

ClickHouse와 S3를 사용하는 것은 "콜드(cold)" 데이터에 대한 쿼리 성능이 덜 중요한 사용 사례에서 특히 유용합니다. ClickHouse는 `S3BackedMergeTree`를 사용하여 `MergeTree` 엔진의 스토리지로 S3를 사용하는 것을 지원합니다. 이 테이블 엔진은 사용자가 S3의 확장성과 비용 이점을 활용하면서도 `MergeTree` 엔진의 삽입 및 쿼리 성능을 유지할 수 있게 해줍니다.

스토리지와 컴퓨트 분리 아키텍처를 구현하고 관리하는 것은 표준 ClickHouse 배포와 비교할 때 더 복잡합니다. 자가 관리 ClickHouse는 이 가이드에서 논의한 대로 스토리지와 컴퓨트를 분리할 수 있지만, 구성 없이 이 아키텍처에서 ClickHouse를 사용할 수 있는 [ClickHouse Cloud](https://clickhouse.com/cloud) 사용을 권장합니다. [`SharedMergeTree` 테이블 엔진](/cloud/reference/shared-merge-tree)을 사용하면 됩니다.

*이 가이드는 ClickHouse 버전 22.8 이상을 사용한다고 가정합니다.*

:::warning
AWS/GCS 생명 주기 정책을 구성하지 마십시오. 이는 지원되지 않으며 테이블이 손상될 수 있습니다.
:::

## 1. S3를 ClickHouse 디스크로 사용하기 {#1-use-s3-as-a-clickhouse-disk}

### 디스크 생성하기 {#creating-a-disk}

ClickHouse `config.d` 디렉토리에 스토리지 구성을 저장할 새 파일을 만듭니다:

```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```

다음 XML을 새로 생성된 파일에 복사하여 `BUCKET`, `ACCESS_KEY_ID`, `SECRET_ACCESS_KEY`를 데이터 저장을 원하는 AWS 버킷 세부정보로 교체합니다:

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

S3 디스크에 대한 추가 설정을 지정하려는 경우(예: `region`을 지정하거나 사용자 정의 HTTP `header`를 전송하려는 경우) 관련 설정 목록을 [여기서](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) 찾을 수 있습니다.

다음과 같이 `access_key_id`와 `secret_access_key`를 대체하여 환경 변수와 Amazon EC2 메타데이터에서 자격 증명을 얻으려고 시도할 수 있습니다:

```bash
<use_environment_credentials>true</use_environment_credentials>
```

구성 파일을 만든 후에는 파일의 소유자를 clickhouse 사용자 및 그룹으로 업데이트해야 합니다:

```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```

이제 ClickHouse 서버를 재시작하여 변경 사항을 적용할 수 있습니다:

```bash
service clickhouse-server restart
```

## 2. S3에 의해 지원되는 테이블 생성하기 {#2-create-a-table-backed-by-s3}

S3 디스크가 올바르게 구성되었는지 테스트하기 위해, 테이블을 생성하고 쿼리해 볼 수 있습니다.

새로운 S3 저장 정책을 지정하여 테이블을 생성합니다:

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

`S3BackedMergeTree`로 엔진을 명시할 필요가 없다는 것을 주의하십시오. ClickHouse는 내부적으로 테이블이 S3를 스토리지로 사용하는 것을 감지하면 자동으로 엔진 유형을 변환합니다.

테이블이 올바른 정책으로 생성되었는지 보여줍니다:

```sql
SHOW CREATE TABLE my_s3_table;
```

다음 결과를 보게 될 것입니다:

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

이제 새 테이블에 몇 행을 삽입해 보겠습니다:

```sql
INSERT INTO my_s3_table (id, column1)
  VALUES (1, 'abc'), (2, 'xyz');
```

행이 삽입되었는지 확인해 봅시다:

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

AWS 콘솔에서, 데이터가 S3에 성공적으로 삽입되었다면 ClickHouse가 지정한 버킷에 새로운 파일을 생성했음을 확인할 수 있어야 합니다.

모든 것이 성공적으로 작동했다면, 이제 ClickHouse에서 스토리지와 컴퓨트를 분리하여 사용하고 있는 것입니다!

<Image img={s3_bucket_example} size="md" alt="스토리지와 컴퓨트를 분리한 S3 버킷 예시" border/>

## 3. 내결함성을 위한 복제 구현하기 (선택 사항) {#3-implementing-replication-for-fault-tolerance-optional}

:::warning
AWS/GCS 생명 주기 정책을 구성하지 마십시오. 이는 지원되지 않으며 테이블이 손상될 수 있습니다.
:::

내결함성을 위해, 여러 개의 ClickHouse 서버 노드를 여러 AWS 지역에 분산하여 사용할 수 있으며, 각 노드에 대해 S3 버킷을 설정할 수 있습니다.

S3 디스크로 복제를 수행하려면 `ReplicatedMergeTree` 테이블 엔진을 사용할 수 있습니다. 자세한 내용은 다음 가이드를 참조하십시오:
- [S3 객체 저장소를 사용하여 두 개의 AWS 지역에서 단일 샤드를 복제하기](/integrations/s3#s3-multi-region).

## 추가 자료 {#further-reading}

- [SharedMergeTree 테이블 엔진](/cloud/reference/shared-merge-tree)
- [SharedMergeTree 발표 블로그](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)
