---
sidebar_label: 'Google Cloud Storage (GCS)'
sidebar_position: 4
slug: /integrations/gcs
description: 'Google Cloud Storage (GCS)를 백엔드로 사용하는 MergeTree'
title: 'ClickHouse와 Google Cloud Storage 연동하기'
doc_type: 'guide'
keywords: ['Google Cloud Storage ClickHouse', 'GCS ClickHouse 통합', 'GCS 기반 MergeTree', 'ClickHouse GCS 스토리지', 'Google Cloud ClickHouse']
---

import BucketDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_GCS_authentication_and_bucket.md';
import Image from '@theme/IdealImage';
import GCS_examine_bucket_1 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-1.png';
import GCS_examine_bucket_2 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-2.png';


# Google Cloud Storage를 ClickHouse와 통합하기 \{#integrate-google-cloud-storage-with-clickhouse\}

:::note
[Google Cloud](https://cloud.google.com)에서 ClickHouse Cloud를 사용하는 경우, 해당 서비스는 이미 [Google Cloud Storage](https://cloud.google.com/storage)를 사용하고 있으므로 이 페이지는 해당되지 않습니다. GCS에서 데이터를 `SELECT` 하거나 GCS로 데이터를 `INSERT` 하려는 경우, [`gcs` table function](/sql-reference/table-functions/gcs)을 참조하십시오.
:::

ClickHouse에서는 스토리지와 컴퓨트를 분리하려는 경우 GCS가 매력적인 스토리지 솔루션이 될 수 있다고 보고 있습니다. 이를 위해 MergeTree 엔진의 스토리지로 GCS를 사용할 수 있도록 지원합니다. 이를 통해 GCS의 확장성과 비용 효율성을 활용하는 동시에 MergeTree 엔진의 데이터 삽입 및 쿼리 성능을 그대로 사용할 수 있습니다.

## GCS 기반 MergeTree \{#gcs-backed-mergetree\}

### 디스크 생성 \{#creating-a-disk\}

GCS 버킷을 디스크로 활용하려면 먼저 ClickHouse 설정에서 `conf.d` 디렉터리 아래의 파일에 이를 선언해야 합니다. 아래는 GCS 디스크 선언 예시입니다. 이 설정에는 GCS "디스크", 캐시, 그리고 GCS 디스크에 테이블을 생성할 때 DDL 쿼리에서 지정되는 정책을 구성하기 위한 여러 섹션이 포함됩니다. 각 항목은 아래에서 설명합니다.

#### Storage configuration &gt; disks &gt; gcs \{#storage_configuration--disks--gcs\}

이 구성 부분은 강조 표시된 섹션에 나타나며 다음을 설정합니다.

* 일괄 삭제는 수행하지 않습니다. GCS는 아직 일괄 삭제를 지원하지 않으므로, 오류 메시지를 숨기기 위해 자동 감지가 비활성화되어 있습니다.
* S3 API를 사용하므로 디스크 유형은 `s3`입니다.
* GCS에서 제공하는 엔드포인트
* 서비스 계정 HMAC 키와 시크릿
* 로컬 디스크의 메타데이터 경로

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <gcs>
            <!--highlight-start-->
                <support_batch_delete>false</support_batch_delete>
                <type>s3</type>
                <endpoint>https://storage.googleapis.com/BUCKET NAME/FOLDER NAME/</endpoint>
                <access_key_id>SERVICE ACCOUNT HMAC KEY</access_key_id>
                <secret_access_key>SERVICE ACCOUNT HMAC SECRET</secret_access_key>
                <metadata_path>/var/lib/clickhouse/disks/gcs/</metadata_path>
            <!--highlight-end-->
            </gcs>
        </disks>
        <policies>
            <gcs_main>
                <volumes>
                    <main>
                        <disk>gcs</disk>
                    </main>
                </volumes>
            </gcs_main>
        </policies>
    </storage_configuration>
</clickhouse>
```


#### Storage configuration &gt; disks &gt; cache \{#storage_configuration--disks--cache\}

아래 강조된 예제 설정은 디스크 `gcs`에 대해 10Gi 크기의 메모리 캐시를 활성화합니다.

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <gcs>
                <support_batch_delete>false</support_batch_delete>
                <type>s3</type>
                <endpoint>https://storage.googleapis.com/BUCKET NAME/FOLDER NAME/</endpoint>
                <access_key_id>SERVICE ACCOUNT HMAC KEY</access_key_id>
                <secret_access_key>SERVICE ACCOUNT HMAC SECRET</secret_access_key>
                <metadata_path>/var/lib/clickhouse/disks/gcs/</metadata_path>
            </gcs>
            <!--highlight-start-->
            <gcs_cache>
                <type>cache</type>
                <disk>gcs</disk>
                <path>/var/lib/clickhouse/disks/gcs_cache/</path>
                <max_size>10Gi</max_size>
            </gcs_cache>
            <!--highlight-end-->
        </disks>
        <policies>
            <gcs_main>
                <volumes>
                    <main>
                        <disk>gcs_cache</disk>
                    </main>
                </volumes>
            </gcs_main>
        </policies>
    </storage_configuration>
</clickhouse>
```


#### Storage configuration &gt; policies &gt; gcs_main \{#storage_configuration--policies--gcs_main\}

Storage configuration의 정책을 사용하면 데이터가 저장될 위치를 선택할 수 있습니다. 아래의 정책을 사용하면 storage&#95;policy를 `gcs_main`으로 지정하여 데이터를 `gcs` 디스크에 저장할 수 있습니다. 예를 들어 `CREATE TABLE ... SETTINGS storage_policy='gcs_main'`와 같이 설정합니다.

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <gcs>
                <support_batch_delete>false</support_batch_delete>
                <type>s3</type>
                <endpoint>https://storage.googleapis.com/BUCKET NAME/FOLDER NAME/</endpoint>
                <access_key_id>SERVICE ACCOUNT HMAC KEY</access_key_id>
                <secret_access_key>SERVICE ACCOUNT HMAC SECRET</secret_access_key>
                <metadata_path>/var/lib/clickhouse/disks/gcs/</metadata_path>
            </gcs>
        </disks>
        <policies>
            <!--highlight-start-->
            <gcs_main>
                <volumes>
                    <main>
                        <disk>gcs</disk>
                    </main>
                </volumes>
            </gcs_main>
            <!--highlight-end-->
        </policies>
    </storage_configuration>
</clickhouse>
```

해당 디스크 선언과 관련된 설정의 전체 목록은 [여기](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)에서 확인할 수 있습니다.


### 테이블 생성 \{#creating-a-table\}

쓰기 권한이 있는 버킷을 사용하도록 디스크를 구성했다면, 아래 예시와 같은 테이블을 생성할 수 있습니다. 설명을 간단히 하기 위해 NYC 택시 컬럼의 일부만 사용하고, 데이터를 GCS를 백엔드로 사용하는 테이블로 직접 스트리밍합니다:

```sql
CREATE TABLE trips_gcs
(
   `trip_id` UInt32,
   `pickup_date` Date,
   `pickup_datetime` DateTime,
   `dropoff_datetime` DateTime,
   `pickup_longitude` Float64,
   `pickup_latitude` Float64,
   `dropoff_longitude` Float64,
   `dropoff_latitude` Float64,
   `passenger_count` UInt8,
   `trip_distance` Float64,
   `tip_amount` Float32,
   `total_amount` Float32,
   `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(pickup_date)
ORDER BY pickup_datetime
-- highlight-next-line
SETTINGS storage_policy='gcs_main'
```

```sql
INSERT INTO trips_gcs SELECT trip_id, pickup_date, pickup_datetime, dropoff_datetime, pickup_longitude, pickup_latitude, dropoff_longitude, dropoff_latitude, passenger_count, trip_distance, tip_amount, total_amount, payment_type FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames') LIMIT 1000000;
```

하드웨어에 따라 후자의 100만 행 INSERT 작업은 실행하는 데 몇 분이 걸릴 수 있습니다. 진행 상황은 `system.processes` 테이블을 통해 확인할 수 있습니다. 행 수를 최대 1,000만까지 자유롭게 조정하고, 몇 가지 샘플 쿼리를 실행해 보십시오.

```sql
SELECT passenger_count, avg(tip_amount) AS avg_tip, avg(total_amount) AS avg_amount FROM trips_gcs GROUP BY passenger_count;
```


### 복제 처리 \{#handling-replication\}

GCS 디스크에서는 `ReplicatedMergeTree` 테이블 엔진을 사용하여 복제를 구현할 수 있습니다. 자세한 내용은 [GCS를 사용하여 단일 세그먼트를 두 개의 GCP 리전 간에 복제](#gcs-multi-region)하는 방법에 대한 가이드를 참조하십시오.

### 더 알아보기 \{#learn-more\}

[Cloud Storage XML API](https://cloud.google.com/storage/docs/xml-api/overview)는 Amazon Simple Storage Service (Amazon S3)와 같은 서비스에서 사용하는 일부 도구와 라이브러리와도 상호 운용됩니다.

스레드 튜닝에 대한 추가 정보는 [성능 최적화](../s3/index.md#s3-optimizing-performance)를 참고하십시오.

## Google Cloud Storage(GCS) 사용 \{#gcs-multi-region\}

:::tip
객체 스토리지는 기본적으로 ClickHouse Cloud에서 사용되므로 ClickHouse Cloud에서 실행 중이라면 이 단계를 수행할 필요가 없습니다.
:::

### 배포 계획 \{#plan-the-deployment\}

이 튜토리얼은 Google Cloud에서 실행되며 Google Cloud Storage(GCS)를 ClickHouse 스토리지 디스크 유형("type")으로 사용하는 복제된 ClickHouse 배포를 설명하기 위해 작성되었습니다.

튜토리얼에서는 Google Cloud Engine VM 인스턴스에 ClickHouse 서버 노드를 배포하며, 각 노드에는 스토리지를 위한 GCS 버킷이 연결됩니다. 복제는 마찬가지로 VM으로 배포된 ClickHouse Keeper 노드 세트에 의해 조정됩니다.

고가용성을 위한 예시 요구사항은 다음과 같습니다.

- 두 개의 ClickHouse 서버 노드 (서로 다른 두 개의 GCP 리전)
- 두 개의 GCS 버킷 (각각 두 ClickHouse 서버 노드와 동일한 리전에 배포)
- 세 개의 ClickHouse Keeper 노드 (이 중 두 개는 ClickHouse 서버 노드와 동일한 리전에 배포하고, 세 번째 노드는 앞선 두 Keeper 노드 중 하나와 동일한 리전이지만 다른 가용 영역에 배포)

ClickHouse Keeper는 동작을 위해 두 개의 노드가 필요하므로, 고가용성을 위해 세 개의 노드가 필요합니다.

### 가상 머신 준비 \{#prepare-vms\}

세 개 리전에 5개의 VM을 배포합니다.

| 리전 | ClickHouse Server | 버킷            | ClickHouse Keeper |
|--------|-------------------|-------------------|-------------------|
| 1      | `chnode1`           | `bucket_regionname` | `keepernode1`       |
| 2      | `chnode2`           | `bucket_regionname` | `keepernode2`       |
| 3 `*`  |                   |                   | `keepernode3`       |

`*` 1번 또는 2번과 동일한 리전 내의 다른 가용 영역일 수 있습니다.

#### ClickHouse 배포 \{#deploy-clickhouse\}

두 개의 호스트에 ClickHouse를 배포합니다. 예제 구성에서는 각각 `chnode1`, `chnode2`라는 이름을 사용합니다.

`chnode1`은 한 GCP 리전에, `chnode2`는 다른 리전에 배치합니다. 이 가이드에서는 Compute Engine VM과 GCS 버킷에 모두 `us-east1`과 `us-east4` 리전을 사용합니다.

:::note
구성하기 전까지는 `clickhouse server`를 시작하지 마십시오. 설치만 하십시오.
:::

ClickHouse 서버 노드에서 배포 단계를 수행할 때는 [설치 안내](/getting-started/install/install.mdx)를 참조하십시오.

#### ClickHouse Keeper 배포 \{#deploy-clickhouse-keeper\}

세 개의 호스트에 ClickHouse Keeper를 배포합니다. 예시 구성에서는 이 호스트들의 이름을 `keepernode1`, `keepernode2`, `keepernode3`로 지정합니다. `keepernode1`은 `chnode1`과 동일한 리전에, `keepernode2`는 `chnode2`와 동일한 리전에 배포할 수 있으며, `keepernode3`는 두 리전 중 하나에 배포하되, 해당 리전의 ClickHouse 노드와는 다른 가용 영역에 배치해야 합니다.

ClickHouse Keeper 노드에서 배포 절차를 수행할 때는 [설치 안내](/getting-started/install/install.mdx)를 참고하십시오.

### 두 개의 버킷 생성 \{#create-two-buckets\}

두 개의 ClickHouse 서버는 고가용성을 위해 서로 다른 리전에 위치합니다. 각 서버는 해당 리전과 동일한 리전에 있는 하나의 GCS 버킷을 사용합니다.

**Cloud Storage > Buckets**에서 **CREATE BUCKET**을 선택합니다. 이 튜토리얼에서는 `us-east1`과 `us-east4`에 각각 하나씩, 총 두 개의 버킷을 생성합니다. 버킷은 Single Region, Standard storage class이며, 공개 버킷이 아니어야 합니다. 안내가 표시되면 Public access prevention을 활성화합니다. 폴더는 생성하지 마십시오. 저장소에 ClickHouse가 데이터를 기록할 때 자동으로 생성됩니다.

버킷과 HMAC 키를 생성하는 단계별 안내가 필요하면 **Create GCS buckets and an HMAC key**를 펼친 후 내용을 따라 진행하십시오:

<BucketDetails />

### ClickHouse Keeper 구성 \{#configure-clickhouse-keeper\}

모든 ClickHouse Keeper 노드는 `server_id` 줄(아래에서 첫 번째로 강조된 줄)을 제외하고 동일한 구성 파일을 사용합니다. 이 파일에서 ClickHouse Keeper 서버의 호스트 이름을 설정한 뒤, 각 서버에서 `server_id`를 `raft_configuration`의 해당 `server` 항목과 일치하도록 설정하십시오. 이 예제에서는 `server_id`가 `3`으로 설정되어 있으므로, `raft_configuration`에서 일치하는 줄을 강조 표시해 두었습니다.

* 파일을 편집하여 호스트 이름을 설정하고, 해당 호스트 이름이 ClickHouse 서버 노드와 Keeper 노드에서 올바르게 확인되는지 확인하십시오.
* 파일을 각 Keeper 서버의 `/etc/clickhouse-keeper/keeper_config.xml` 위치에 복사하십시오.
* 각 머신에서 `server_id`를 `raft_configuration`에 있는 해당 항목 번호에 맞게 수정하십시오.

```xml title=/etc/clickhouse-keeper/keeper_config.xml
<clickhouse>
    <logger>
        <level>trace</level>
        <log>/var/log/clickhouse-keeper/clickhouse-keeper.log</log>
        <errorlog>/var/log/clickhouse-keeper/clickhouse-keeper.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <listen_host>0.0.0.0</listen_host>
    <keeper_server>
        <tcp_port>9181</tcp_port>
<!--highlight-next-line-->
        <server_id>3</server_id>
        <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
        <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

        <coordination_settings>
            <operation_timeout_ms>10000</operation_timeout_ms>
            <session_timeout_ms>30000</session_timeout_ms>
            <raft_logs_level>warning</raft_logs_level>
        </coordination_settings>

        <raft_configuration>
            <server>
                <id>1</id>
                <hostname>keepernode1.us-east1-b.c.clickhousegcs-374921.internal</hostname>
                <port>9234</port>
            </server>
            <server>
                <id>2</id>
                <hostname>keepernode2.us-east4-c.c.clickhousegcs-374921.internal</hostname>
                <port>9234</port>
            </server>
<!--highlight-start-->
            <server>
                <id>3</id>
                <hostname>keepernode3.us-east5-a.c.clickhousegcs-374921.internal</hostname>
                <port>9234</port>
            </server>
<!--highlight-end-->
        </raft_configuration>
    </keeper_server>
</clickhouse>
```


### ClickHouse 서버 구성 \{#configure-clickhouse-server\}

:::note best practice
이 가이드의 일부 단계에서는 구성 파일을 `/etc/clickhouse-server/config.d/`에 배치하도록 합니다. 이 경로는 Linux 시스템에서 기본 구성을 재정의(override)하는 구성 파일의 기본 경로입니다. 해당 디렉터리에 파일을 배치하면 ClickHouse가 이들 파일의 내용을 기본 구성과 병합합니다. `config.d` 디렉터리에 파일을 두면 업그레이드 중에 구성 설정이 사라지는 것을 방지할 수 있습니다.
:::

#### 네트워킹 \{#networking\}

기본적으로 ClickHouse는 루프백 인터페이스에서만 수신 대기합니다. 레플리카 구성 환경에서는 서버 간 네트워크 통신이 필요합니다. 모든 인터페이스에서 수신 대기하도록 설정합니다:

```xml title=/etc/clickhouse-server/config.d/network.xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```


#### 원격 ClickHouse Keeper 서버 \{#remote-clickhouse-keeper-servers\}

복제는 ClickHouse Keeper가 조율합니다. 이 구성 파일에서는 호스트 이름과 포트 번호로 ClickHouse Keeper 노드를 지정합니다.

* Keeper 호스트에 맞도록 호스트 이름을 편집하십시오

```xml title=/etc/clickhouse-server/config.d/use-keeper.xml
<clickhouse>
    <zookeeper>
        <node index="1">
            <host>keepernode1.us-east1-b.c.clickhousegcs-374921.internal</host>
            <port>9181</port>
        </node>
        <node index="2">
            <host>keepernode2.us-east4-c.c.clickhousegcs-374921.internal</host>
            <port>9181</port>
        </node>
        <node index="3">
            <host>keepernode3.us-east5-a.c.clickhousegcs-374921.internal</host>
            <port>9181</port>
        </node>
    </zookeeper>
</clickhouse>
```


#### 원격 ClickHouse 서버 \{#remote-clickhouse-servers\}

이 파일은 클러스터 내 각 ClickHouse 서버의 호스트 이름과 포트를 구성합니다. 기본 구성 파일에는 예제 클러스터 정의가 포함되어 있으며, 완전히 구성된 클러스터만 표시하기 위해 `remote_servers` 항목에 태그 `replace="true"`가 추가됩니다. 이렇게 하면 이 구성이 기본 구성과 병합될 때 `remote_servers` 섹션에 항목을 추가하는 대신 해당 섹션을 대체합니다.

* 파일을 호스트 이름으로 편집하고, ClickHouse 서버 노드에서 해당 호스트 이름이 DNS에서 올바르게 조회되는지 확인하십시오

```xml title=/etc/clickhouse-server/config.d/remote-servers.xml
<clickhouse>
    <remote_servers replace="true">
        <cluster_1S_2R>
            <shard>
                <replica>
                    <host>chnode1.us-east1-b.c.clickhousegcs-374921.internal</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>chnode2.us-east4-c.c.clickhousegcs-374921.internal</host>
                    <port>9000</port>
                </replica>
            </shard>
        </cluster_1S_2R>
    </remote_servers>
</clickhouse>
```


#### 레플리카 식별 \{#replica-identification\}

이 파일은 ClickHouse Keeper 경로와 관련된 설정을 구성합니다. 구체적으로는 데이터가 어느 레플리카에 속하는지 식별하는 데 사용되는 매크로를 설정합니다. 한 서버에서는 레플리카를 `replica_1`로, 다른 서버에서는 `replica_2`로 지정해야 합니다. 이름은 변경해도 되며, 예시처럼 한 레플리카가 South Carolina에, 다른 레플리카가 Northern Virginia에 저장되는 경우 각각의 값은 `carolina`와 `virginia`로 설정할 수 있습니다. 각 서버마다 서로 다른 이름을 사용하기만 하면 됩니다.

```xml title=/etc/clickhouse-server/config.d/macros.xml
<clickhouse>
    <distributed_ddl>
            <path>/clickhouse/task_queue/ddl</path>
    </distributed_ddl>
    <macros>
        <cluster>cluster_1S_2R</cluster>
        <shard>1</shard>
<!--highlight-next-line-->
        <replica>replica_1</replica>
    </macros>
</clickhouse>
```


#### GCS에 저장 \{#storage-in-gcs\}

ClickHouse 스토리지 구성에는 `disks`와 `policies`가 포함됩니다. 아래에서 구성하는 디스크의 이름은 `gcs`이고, `type`은 `s3`입니다. 유형이 s3인 이유는 ClickHouse가 GCS 버킷에 AWS S3 버킷인 것처럼 접근하기 때문입니다. 이 구성은 각 ClickHouse 서버 노드마다 하나씩, 총 두 개가 필요합니다.

아래 구성에서 다음 항목들을 대체해야 합니다.

다음 대체 항목은 두 ClickHouse 서버 노드 간에 서로 다릅니다.

* `REPLICA 1 BUCKET`은 서버와 동일한 리전에 있는 버킷 이름으로 설정해야 합니다.
* `REPLICA 1 FOLDER`는 한 서버에서는 `replica_1`로, 다른 서버에서는 `replica_2`로 변경해야 합니다.

다음 대체 항목은 두 노드에서 공통입니다.

* `access_key_id`는 앞에서 생성한 HMAC Key로 설정해야 합니다.
* `secret_access_key`는 앞에서 생성한 HMAC Secret으로 설정해야 합니다.

```xml title=/etc/clickhouse-server/config.d/storage.xml
<clickhouse>
    <storage_configuration>
        <disks>
            <gcs>
                <support_batch_delete>false</support_batch_delete>
                <type>s3</type>
                <endpoint>https://storage.googleapis.com/REPLICA 1 BUCKET/REPLICA 1 FOLDER/</endpoint>
                <access_key_id>SERVICE ACCOUNT HMAC KEY</access_key_id>
                <secret_access_key>SERVICE ACCOUNT HMAC SECRET</secret_access_key>
                <metadata_path>/var/lib/clickhouse/disks/gcs/</metadata_path>
            </gcs>
            <cache>
                <type>cache</type>
                <disk>gcs</disk>
                <path>/var/lib/clickhouse/disks/gcs_cache/</path>
                <max_size>10Gi</max_size>
            </cache>
        </disks>
        <policies>
            <gcs_main>
                <volumes>
                    <main>
                        <disk>gcs</disk>
                    </main>
                </volumes>
            </gcs_main>
        </policies>
    </storage_configuration>
</clickhouse>
```


### ClickHouse Keeper 시작 \{#start-clickhouse-keeper\}

운영 체제에 맞는 명령을 사용하십시오. 예:

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```


#### ClickHouse Keeper 상태 확인 \{#check-clickhouse-keeper-status\}

`netcat`을 사용하여 ClickHouse Keeper에 명령을 보냅니다. 예를 들어 `mntr` 명령은 ClickHouse Keeper 클러스터의 상태를 출력합니다. 각 Keeper 노드에서 이 명령을 실행하면 하나는 리더이고 나머지 두 개는 팔로어인 것을 확인할 수 있습니다:

```bash
echo mntr | nc localhost 9181
```

```response
zk_version      v22.7.2.15-stable-f843089624e8dd3ff7927b8a125cf3a7a769c069
zk_avg_latency  0
zk_max_latency  11
zk_min_latency  0
zk_packets_received     1783
zk_packets_sent 1783
# highlight-start
zk_num_alive_connections        2
zk_outstanding_requests 0
zk_server_state leader
# highlight-end
zk_znode_count  135
zk_watch_count  8
zk_ephemerals_count     3
zk_approximate_data_size        42533
zk_key_arena_size       28672
zk_latest_snapshot_size 0
zk_open_file_descriptor_count   182
zk_max_file_descriptor_count    18446744073709551615
# highlight-start
zk_followers    2
zk_synced_followers     2
# highlight-end
```


### ClickHouse 서버 시작 \{#start-clickhouse-server\}

`chnode1` 및 `chnode`에서 다음 명령을 실행합니다:

```bash
sudo service clickhouse-server start
```

```bash
sudo service clickhouse-server status
```


### 확인 \{#verification\}

#### 디스크 구성 확인 \{#verify-disk-configuration\}

`system.disks`에는 각 디스크에 대한 레코드가 포함되어 있어야 합니다:

* default
* gcs
* cache

```sql
SELECT *
FROM system.disks
FORMAT Vertical
```

```response
Row 1:
──────
name:             cache
path:             /var/lib/clickhouse/disks/gcs/
free_space:       18446744073709551615
total_space:      18446744073709551615
unreserved_space: 18446744073709551615
keep_free_space:  0
type:             s3
is_encrypted:     0
is_read_only:     0
is_write_once:    0
is_remote:        1
is_broken:        0
cache_path:       /var/lib/clickhouse/disks/gcs_cache/

Row 2:
──────
name:             default
path:             /var/lib/clickhouse/
free_space:       6555529216
total_space:      10331889664
unreserved_space: 6555529216
keep_free_space:  0
type:             local
is_encrypted:     0
is_read_only:     0
is_write_once:    0
is_remote:        0
is_broken:        0
cache_path:

Row 3:
──────
name:             gcs
path:             /var/lib/clickhouse/disks/gcs/
free_space:       18446744073709551615
total_space:      18446744073709551615
unreserved_space: 18446744073709551615
keep_free_space:  0
type:             s3
is_encrypted:     0
is_read_only:     0
is_write_once:    0
is_remote:        1
is_broken:        0
cache_path:

3 rows in set. Elapsed: 0.002 sec.
```


#### 클러스터에서 생성한 테이블이 두 노드 모두에 생성되었는지 확인하십시오 \{#verify-that-tables-created-on-the-cluster-are-created-on-both-nodes\}

```sql
-- highlight-next-line
create table trips on cluster 'cluster_1S_2R' (
 `trip_id` UInt32,
 `pickup_date` Date,
 `pickup_datetime` DateTime,
 `dropoff_datetime` DateTime,
 `pickup_longitude` Float64,
 `pickup_latitude` Float64,
 `dropoff_longitude` Float64,
 `dropoff_latitude` Float64,
 `passenger_count` UInt8,
 `trip_distance` Float64,
 `tip_amount` Float32,
 `total_amount` Float32,
 `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4))
ENGINE = ReplicatedMergeTree
PARTITION BY toYYYYMM(pickup_date)
ORDER BY pickup_datetime
-- highlight-next-line
SETTINGS storage_policy='gcs_main'
```

```response
┌─host───────────────────────────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.us-east4-c.c.gcsqa-375100.internal │ 9000 │      0 │       │                   1 │                1 │
└────────────────────────────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
┌─host───────────────────────────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1.us-east1-b.c.gcsqa-375100.internal │ 9000 │      0 │       │                   0 │                0 │
└────────────────────────────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

2 rows in set. Elapsed: 0.641 sec.
```


#### 데이터를 삽입할 수 있는지 확인합니다 \{#verify-that-data-can-be-inserted\}

```sql
INSERT INTO trips SELECT
    trip_id,
    pickup_date,
    pickup_datetime,
    dropoff_datetime,
    pickup_longitude,
    pickup_latitude,
    dropoff_longitude,
    dropoff_latitude,
    passenger_count,
    trip_distance,
    tip_amount,
    total_amount,
    payment_type
FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames')
LIMIT 1000000
```


#### 테이블에서 스토리지 정책 `gcs_main`이 사용되고 있는지 확인하십시오. \{#verify-that-the-storage-policy-gcs_main-is-used-for-the-table\}

```sql
SELECT
    engine,
    data_paths,
    metadata_path,
    storage_policy,
    formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'trips'
FORMAT Vertical
```

```response
Row 1:
──────
engine:                          ReplicatedMergeTree
data_paths:                      ['/var/lib/clickhouse/disks/gcs/store/631/6315b109-d639-4214-a1e7-afbd98f39727/']
metadata_path:                   /var/lib/clickhouse/store/e0f/e0f3e248-7996-44d4-853e-0384e153b740/trips.sql
storage_policy:                  gcs_main
formatReadableSize(total_bytes): 36.42 MiB

1 row in set. Elapsed: 0.002 sec.
```


#### Google Cloud 콘솔에서 확인 \{#verify-in-google-cloud-console\}

버킷을 확인하면 `storage.xml` 구성 파일에서 지정한 이름의 폴더가 각 버킷에 생성된 것을 볼 수 있습니다. 해당 폴더를 펼치면 데이터 파티션을 나타내는 많은 파일이 있는 것을 확인할 수 있습니다.

#### 레플리카 1용 버킷 \{#bucket-for-replica-one\}

<Image img={GCS_examine_bucket_1} size="lg" border alt="Google Cloud Storage에서 데이터 파티션을 포함한 폴더 구조를 보여주는 레플리카 1의 버킷" />

#### 두 번째 레플리카용 버킷 \{#bucket-for-replica-two\}

<Image img={GCS_examine_bucket_2} size="lg" border alt="데이터 파티션 폴더 구조가 표시된 Google Cloud Storage의 두 번째 레플리카 버킷" />