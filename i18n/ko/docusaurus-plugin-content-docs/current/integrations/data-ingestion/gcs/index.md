---
'sidebar_label': 'Google Cloud Storage (GCS)'
'sidebar_position': 4
'slug': '/integrations/gcs'
'description': 'Google Cloud Storage (GCS) 백업 MergeTree'
'title': 'Google Cloud Storage와 ClickHouse 통합하기'
'doc_type': 'guide'
'keywords':
- 'Google Cloud Storage ClickHouse'
- 'GCS ClickHouse integration'
- 'GCS backed MergeTree'
- 'ClickHouse GCS storage'
- 'Google Cloud ClickHouse'
---

import BucketDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_GCS_authentication_and_bucket.md';
import Image from '@theme/IdealImage';
import GCS_examine_bucket_1 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-1.png';
import GCS_examine_bucket_2 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-2.png';


# ClickHouse와 Google Cloud Storage 통합하기

:::note
ClickHouse Cloud를 [Google Cloud](https://cloud.google.com)에서 사용하고 있다면, 이 페이지는 적용되지 않습니다. 서비스는 이미 [Google Cloud Storage](https://cloud.google.com/storage)를 사용하고 있습니다. GCS에서 데이터를 `SELECT`하거나 `INSERT`하려고 한다면, [`gcs` 테이블 함수](/sql-reference/table-functions/gcs)를 참조하십시오.
:::

ClickHouse는 GCS가 스토리지와 컴퓨트를 분리하길 원하는 사용자에게 매력적으로 보이는 스토리지 솔루션임을 인식하고 있습니다. 이를 달성하기 위해 MergeTree 엔진의 스토리지로 GCS를 사용하는 것을 지원합니다. 이것은 사용자가 GCS의 확장성과 비용 절감의 이점을 활용하고, MergeTree 엔진의 삽입 및 쿼리 성능을 활용할 수 있게 합니다.

## GCS 기반 MergeTree {#gcs-backed-mergetree}

### 디스크 만들기 {#creating-a-disk}

GCS 버킷을 디스크로 활용하기 위해서는 먼저 ClickHouse 구성 파일에서 이를 선언해야 합니다. `conf.d` 하위에 있는 파일에서 GCS 디스크 선언의 예는 아래와 같습니다. 이 구성은 GCS "디스크", 캐시 및 테이블이 GCS 디스크에서 생성될 때 DDL 쿼리에 지정된 정책을 구성하기 위한 여러 섹션을 포함하고 있습니다. 각 섹션은 아래에서 설명됩니다.

#### 스토리지 구성 > 디스크 > gcs {#storage_configuration--disks--gcs}

구성의 이 부분은 강조된 섹션에 표시되어 있으며 다음을 지정합니다:
- 배치 삭제는 수행되지 않습니다. GCS는 현재 배치 삭제를 지원하지 않으므로 자동 감지가 비활성화되어 오류 메시지를 억제합니다.
- 디스크 유형은 `s3`입니다. S3 API가 사용되기 때문입니다.
- GCS에서 제공하는 엔드포인트
- 서비스 계정 HMAC 키 및 비밀
- 로컬 디스크의 메타데이터 경로

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
#### 스토리지 구성 > 디스크 > 캐시 {#storage_configuration--disks--cache}

아래 강조된 예제 구성은 디스크 `gcs`에 대한 10Gi 메모리 캐시를 활성화합니다.

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
#### 스토리지 구성 > 정책 > gcs_main {#storage_configuration--policies--gcs_main}

스토리지 구성 정책은 데이터가 저장될 위치를 선택할 수 있게 합니다. 아래 강조된 정책은 `gcs` 디스크에 데이터를 저장할 수 있게 하며, 정책 `gcs_main`을 지정합니다. 예를 들어, `CREATE TABLE ... SETTINGS storage_policy='gcs_main'`과 같이 사용할 수 있습니다.

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

이 디스크 선언과 관련된 설정의 전체 목록은 [여기](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)에서 확인할 수 있습니다.

### 테이블 만들기 {#creating-a-table}

디스크가 쓰기 권한이 있는 버킷을 사용하도록 구성되어 있다고 가정할 때, 아래의 예와 같은 테이블을 생성할 수 있어야 합니다. 간결함을 위해 NYC 택시 컬럼의 하위 집합을 사용하고, GCS-백된 테이블로 직접 스트리밍합니다:

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

하드웨어에 따라, 1m 행의 마지막 삽입은 몇 분 정도 소요될 수 있습니다. 시스템.processes 테이블을 통해 진행 상황을 확인할 수 있습니다. 행 수를 10m의 한도까지 조정하고 몇 가지 샘플 쿼리를 탐색해 보세요.

```sql
SELECT passenger_count, avg(tip_amount) AS avg_tip, avg(total_amount) AS avg_amount FROM trips_gcs GROUP BY passenger_count;
```

### 복제 처리 {#handling-replication}

GCS 디스크와의 복제는 `ReplicatedMergeTree` 테이블 엔진을 사용하여 수행할 수 있습니다. 자세한 내용은 [GCS를 사용하여 두 GCP 지역에 걸쳐 단일 샤드를 복제하는 방법](#gcs-multi-region) 가이드를 참조하세요.

### 더 알아보기 {#learn-more}

[Cloud Storage XML API](https://cloud.google.com/storage/docs/xml-api/overview)는 Amazon Simple Storage Service (Amazon S3)와 같은 서비스와 함께 작동하는 일부 도구 및 라이브러리와 상호 운용됩니다.

스레드 조정에 대한 자세한 정보는 [성능 최적화](../s3/index.md#s3-optimizing-performance)를 참조하십시오.

## Google Cloud Storage (GCS) 사용하기 {#gcs-multi-region}

:::tip
ClickHouse Cloud에서 기본적으로 오브젝트 스토리지를 사용하므로, ClickHouse Cloud에서 실행 중이라면 이 절차를 따를 필요가 없습니다.
:::

### 배포 계획 수립 {#plan-the-deployment}

이 튜토리얼은 Google Cloud에서 실행되는 복제된 ClickHouse 배포를 설명하기 위해 작성되었으며, Google Cloud Storage (GCS)를 ClickHouse 저장소 디스크 "유형"으로 사용합니다.

이 튜토리얼에서는 Google Cloud Engine VM에 ClickHouse 서버 노드를 배포하고, 각 노드에는 저장소를 위한 GCS 버킷이 연결됩니다. 복제는 VM으로 배포되는 ClickHouse Keeper 노드 집합에 의해 조정됩니다.

고가용성을 위한 샘플 요구 사항:
- 두 개의 ClickHouse 서버 노드, 두 개의 GCP 지역에
- 두 개의 GCS 버킷, 두 ClickHouse 서버 노드와 같은 지역에 배포
- 세 개의 ClickHouse Keeper 노드, 두 개는 ClickHouse 서버 노드와 같은 지역에 배포됩니다. 세 번째 노드는 첫 번째 두 Keeper 노드 중 하나와 동일한 지역에 있지만, 해당 지역의 다른 가용성 영역에 있어야 합니다.

ClickHouse Keeper는 기능을 위해 두 개의 노드가 필요하므로, 고가용성을 위해 세 개의 노드가 필요합니다.

### 가상 머신 준비 {#prepare-vms}

세 개 지역에 다섯 개의 VM을 배포합니다:

| 지역   | ClickHouse 서버   | 버킷                  | ClickHouse Keeper   |
|--------|-------------------|-----------------------|---------------------|
| 1      | `chnode1`        | `bucket_regionname`   | `keepernode1`       |
| 2      | `chnode2`        | `bucket_regionname`   | `keepernode2`       |
| 3 `*`  |                   |                       | `keepernode3`       |

`*` 이는 1 또는 2와 같은 지역의 다른 가용성 영역일 수 있습니다.

#### ClickHouse 배포 {#deploy-clickhouse}

두 호스트에 ClickHouse를 배포합니다. 샘플 구성에서 이들은 `chnode1`, `chnode2`로 명명됩니다.

`chnode1`은 한 GCP 지역에 배치하고, `chnode2`는 두 번째 지역에 배치합니다. 이 가이드에서 `us-east1`과 `us-east4`가 컴퓨트 엔진 VM과 GCS 버킷에 사용됩니다.

:::note
구성이 완료될 때까지 `clickhouse server`를 시작하지 마십시오. 단지 설치만 하십시오.
:::

ClickHouse 서버 노드에서 배포 단계를 수행할 때 [설치 지침](/getting-started/install/install.mdx)을 참조하십시오.

#### ClickHouse Keeper 배포 {#deploy-clickhouse-keeper}

세 개 호스트에 ClickHouse Keeper를 배포합니다. 샘플 구성에서 이들은 `keepernode1`, `keepernode2`, `keepernode3`로 명명됩니다. `keepernode1`은 `chnode1`과 동일한 지역에 배포될 수 있고, `keepernode2`는 `chnode2`와 함께, `keepernode3`는 어느 지역에서든 배포될 수 있지만, 해당 지역의 ClickHouse 노드와는 다른 가용성 영역에 있어야 합니다.

ClickHouse Keeper 노드에서 배포 단계를 수행할 때 [설치 지침](/getting-started/install/install.mdx)을 참조하십시오.

### 두 개의 버킷 만들기 {#create-two-buckets}

두 개의 ClickHouse 서버는 서로 다른 지역에 위치하여 고가용성을 보장합니다. 각 서버는 동일한 지역에 GCS 버킷을 가집니다.

**Cloud Storage > Buckets**에서 **CREATE BUCKET**을 선택합니다. 이 튜토리얼을 위해 두 개의 버킷이 생성되며, 하나는 `us-east1`, 다른 하나는 `us-east4`에 위치합니다. 버킷은 단일 지역, 표준 스토리지 클래스이며, 공개되지 않습니다. 프롬프트에 따라 공개 액세스 방지를 활성화합니다. 폴더를 생성하지 마십시오. ClickHouse가 저장소에 쓸 때 생성됩니다.

버킷 및 HMAC 키를 생성하는 단계별 지침이 필요한 경우, **Create GCS buckets and an HMAC key**를 확장하고 따라 하십시오:

<BucketDetails />

### ClickHouse Keeper 구성 {#configure-clickhouse-keeper}

모든 ClickHouse Keeper 노드는 `server_id` 라인(아래 강조된 첫 번째 줄)을 제외하고 동일한 구성 파일을 가지고 있습니다. ClickHouse Keeper 서버의 호스트 이름으로 파일을 수정하고, 각 서버에서 `server_id`를 `raft_configuration`의 적절한 `server` 항목에 맞게 설정합니다. 이 예제에서 `server_id`가 `3`으로 설정되어 있으므로, `raft_configuration`에서 일치하는 줄을 강조했습니다.

- 파일을 호스트 이름으로 수정하고, ClickHouse 서버 노드와 Keeper 노드에서 이들이 해석될 수 있는지 확인합니다.
- 파일을 각 Keeper 서버의 위치(`/etc/clickhouse-keeper/keeper_config.xml`)에 복사합니다.
- 각 머신에서 `raft_configuration`의 항목 번호에 따라 `server_id`를 수정합니다.

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

### ClickHouse 서버 구성 {#configure-clickhouse-server}

:::note 모범 사례
이 가이드의 몇 가지 단계는 `/etc/clickhouse-server/config.d/`에 구성 파일을 배치하라고 요청합니다. 이는 리눅스 시스템의 구성 오버라이드 파일에 대한 기본 위치입니다. 이러한 파일을 해당 디렉토리에 두면 ClickHouse는 기본 구성과 내용을 병합합니다. 이러한 파일을 `config.d` 디렉토리에 두면 업그레이드 중 구성 손실을 방지할 수 있습니다.
:::

#### 네트워킹 {#networking}
기본적으로 ClickHouse는 루프백 인터페이스에서 수신합니다. 복제된 설정에서는 머신 간의 네트워킹이 필요합니다. 모든 인터페이스에서 수신하도록 설정합니다:

```xml title=/etc/clickhouse-server/config.d/network.xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```

#### 원격 ClickHouse Keeper 서버 {#remote-clickhouse-keeper-servers}

복제는 ClickHouse Keeper에 의해 조정됩니다. 이 구성 파일은 ClickHouse Keeper 노드를 호스트 이름과 포트 번호로 식별합니다.

- 호스트 이름을 Keeper 호스트에 맞추어 수정합니다.

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

#### 원격 ClickHouse 서버 {#remote-clickhouse-servers}

이 파일은 클러스터의 각 ClickHouse 서버의 호스트 이름과 포트를 구성합니다. 기본 구성 파일에는 샘플 클러스터 정의가 포함되어 있으며, 완전히 구성된 클러스터만 표시하기 위해 `remote_servers` 항목에 `replace="true"` 태그를 추가하여 이 구성이 기본값과 병합될 때 `remote_servers` 섹션을 추가하는 것이 아니라 대체하도록 합니다.

- 호스트 이름으로 파일을 수정하고, ClickHouse 서버 노드에서 이들이 해석될 수 있는지 확인합니다.

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

#### 복제본 식별 {#replica-identification}

이 파일은 ClickHouse Keeper 경로와 관련된 설정을 구성합니다. 구체적으로, 데이터가 어떤 복제본에 속하는지를 식별하는 데 사용되는 매크로입니다. 한 서버에서는 복제본을 `replica_1`으로 지정하고, 다른 서버에서는 `replica_2`로 지정해야 합니다. 이름은 변경할 수 있으며, 예를 들어 한 복제본이 사우스 캐롤라이나에, 다른 복제본이 노스 버지니아에 저장되도록 한다면 값은 `carolina` 와 `virginia`로 설정할 수 있습니다. 각 머신마다 다르도록 설정만 하면 됩니다.

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

#### GCS 저장소 {#storage-in-gcs}

ClickHouse 스토리지 구성에는 `disks`와 `policies`가 포함됩니다. 아래 구성 중 디스크의 이름은 `gcs`이고, `type`은 `s3`입니다. 유형이 s3인 이유는 ClickHouse가 GCS 버킷에 AWS S3 버킷처럼 접근하기 때문입니다. 이 구성 복사본이 두 ClickHouse 서버 노드에 각각 필요합니다.

구성에서 다음과 같은 치환을 해야 합니다. 

이 치환은 두 ClickHouse 서버 노드 간에 다릅니다:
- `REPLICA 1 BUCKET`은 서버와 동일 지역의 버킷 이름으로 설정해야 하며,
- `REPLICA 1 FOLDER`는 하나의 서버에서 `replica_1`로 변경하고, 다른 서버에서는 `replica_2`로 설정해야 합니다.

이 치환은 두 노드 간에 공통적입니다:
- `access_key_id`는 이전에 생성된 HMAC 키로 설정해야 하며,
- `secret_access_key`는 이전에 생성된 HMAC 비밀로 설정해야 합니다.

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

### ClickHouse Keeper 시작 {#start-clickhouse-keeper}

운영 체제에 맞는 명령어를 사용하십시오. 예를 들어:

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

#### ClickHouse Keeper 상태 확인 {#check-clickhouse-keeper-status}

`netcat`을 사용하여 ClickHouse Keeper에 명령을 보냅니다. 예를 들어, `mntr`는 ClickHouse Keeper 클러스터의 상태를 반환합니다. 각 Keeper 노드에서 이 명령을 실행하면 하나는 리더이고 나머지 두 개는 팔로워인 것을 볼 수 있습니다:

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

### ClickHouse 서버 시작 {#start-clickhouse-server}

`chnode1` 및 `chnode2`에서 아래 명령을 실행합니다:

```bash
sudo service clickhouse-server start
```
```bash
sudo service clickhouse-server status
```

### 검증 {#verification}

#### 디스크 구성 검증 {#verify-disk-configuration}

`system.disks`는 각 디스크에 대한 레코드를 포함해야 합니다:
- default
- gcs
- cache

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
#### 클러스터에서 생성된 테이블이 두 노드에서 생성되었는지 검증 {#verify-that-tables-created-on-the-cluster-are-created-on-both-nodes}
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

#### 데이터가 삽입될 수 있는지 검증 {#verify-that-data-can-be-inserted}

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

#### 테이블에 대해 스토리지 정책 `gcs_main`이 사용되는지 검증합니다. {#verify-that-the-storage-policy-gcs_main-is-used-for-the-table}
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

#### Google Cloud Console에서 검증 {#verify-in-google-cloud-console}

버킷을 보면 `storage.xml` 구성 파일에서 사용한 이름으로 각 버킷에 폴더가 생성된 것을 볼 수 있습니다. 폴더를 확장하면 데이터 파티션을 나타내는 많은 파일을 볼 수 있습니다.
#### 복제본 하나의 버킷 {#bucket-for-replica-one}

<Image img={GCS_examine_bucket_1} size="lg" border alt="데이터 파티션 구조가 있는 Google Cloud Storage의 복제본 하나의 버킷" />

#### 복제본 두의 버킷 {#bucket-for-replica-two}

<Image img={GCS_examine_bucket_2} size="lg" border alt="데이터 파티션 구조가 있는 Google Cloud Storage의 복제본 두의 버킷" />
