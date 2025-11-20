---
'description': 'Distributed 엔진을 가진 테이블은 자체 데이터를 저장하지 않지만 여러 서버에서 분산 쿼리 처리를 허용합니다.
  읽기는 자동으로 병렬화됩니다. 읽기 중에 원격 서버의 테이블 인덱스가 사용됩니다, 만약 있다면.'
'sidebar_label': '분산'
'sidebar_position': 10
'slug': '/engines/table-engines/special/distributed'
'title': '분산 테이블 엔진'
'doc_type': 'reference'
---


# 분산 테이블 엔진

:::warning 클라우드의 분산 엔진
ClickHouse Cloud에서 분산 테이블 엔진을 생성하려면 [`remote` 및 `remoteSecure`](../../../sql-reference/table-functions/remote) 테이블 함수를 사용할 수 있습니다. 
`Distributed(...)` 구문은 ClickHouse Cloud에서 사용할 수 없습니다.
:::

분산 엔진이 있는 테이블은 자체 데이터를 저장하지 않지만 여러 서버에서 분산 쿼리 처리를 허용합니다. 
읽기는 자동으로 병렬화됩니다. 읽기 중에 원격 서버의 테이블 인덱스가 존재할 경우 사용됩니다.

## 테이블 생성하기 {#distributed-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = Distributed(cluster, database, table[, sharding_key[, policy_name]])
[SETTINGS name=value, ...]
```

### 테이블에서 {#distributed-from-a-table}

`Distributed` 테이블이 현재 서버에 있는 테이블을 가리킬 때, 해당 테이블의 스키마를 채택할 수 있습니다:

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster] AS [db2.]name2 ENGINE = Distributed(cluster, database, table[, sharding_key[, policy_name]]) [SETTINGS name=value, ...]
```

### 분산 매개변수 {#distributed-parameters}

| 매개변수                   | 설명                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster`                 | 서버의 구성 파일에서 클러스터 이름                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `database`                | 원격 데이터베이스의 이름                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `table`                   | 원격 테이블의 이름                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `sharding_key` (선택)    | 샤드 키입니다. <br/> 다음의 경우 `sharding_key`를 지정해야 합니다: <ul><li>분산 테이블에 대한 `INSERT`에서(테이블 엔진이 데이터를 분할하는 방법을 결정하기 위해 `sharding_key`가 필요합니다). 그러나 `insert_distributed_one_random_shard` 설정이 활성화되어 있으면 `INSERT`에서 샤딩 키가 필요하지 않습니다.</li><li>`optimize_skip_unused_shards`와 함께 사용하기 위해 `sharding_key`가 필요합니다. 이는 어떤 샤드를 쿼리해야 하는지 결정하는 데 필요합니다.</li></ul> |
| `policy_name` (선택)      | 임시 파일을 백그라운드 전송을 위해 저장하는 데 사용되는 정책 이름                                                                                                                                                                                                                                                                                                                                                                                                         |

**참고 추가**

- [distributed_foreground_insert](../../../operations/settings/settings.md#distributed_foreground_insert) 설정
- 예시를 위한 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes)

### 분산 설정 {#distributed-settings}

| 설정                                        | 설명                                                                                                                                                                                                                           | 기본값        |
|--------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| `fsync_after_insert`                       | 분산으로의 백그라운드 삽입 후 파일 데이터에 대한 `fsync`를 수행합니다. OS가 **이니시에이터 노드**의 디스크에 전체 삽입 데이터를 플러시하도록 보장합니다.                                                                              | `false`       |
| `fsync_directories`                        | 디렉터리에 대한 `fsync`를 수행합니다. 분산 테이블의 백그라운드 삽입과 관련된 작업 후 OS가 디렉터리 메타데이터를 새로 고쳤는지 보장합니다(예: 삽입 후, 샤드로의 데이터 전송 후 등).                                        | `false`       |
| `skip_unavailable_shards`                  | true이면 ClickHouse가 사용할 수 없는 샤드를 조용히 건너뜁니다. 샤드는 다음의 경우 사용할 수 없는 것으로 표시됩니다: 1) 연결 오류로 인해 샤드에 접근할 수 없는 경우. 2) 샤드가 DNS를 통해 해결할 수 없는 경우. 3) 테이블이 샤드에 존재하지 않는 경우.   | `false`       |
| `bytes_to_throw_insert`                    | 백그라운드 `INSERT`를 위해 대기 중인 압축된 바이트 수가 이 숫자를 초과하면 예외가 발생합니다. `0` - 예외를 발생시키지 않음.                                                                                                  | `0`           |
| `bytes_to_delay_insert`                    | 백그라운드 INSERT를 위해 대기 중인 압축된 바이트 수가 이 숫자를 초과하면 쿼리가 지연됩니다. `0` - 지연하지 않음.                                                                                                               | `0`           |
| `max_delay_to_insert`                      | 백그라운드 전송을 위해 대기 중인 바이트 수가 많을 경우 분산 테이블에 데이터를 삽입할 최대 지연 시간(초)입니다.                                                                                                               | `60`          |
| `background_insert_batch`                  | [`distributed_background_insert_batch`](../../../operations/settings/settings.md#distributed_background_insert_batch)와 동일합니다.                                                                                                     | `0`           |
| `background_insert_split_batch_on_failure` | [`distributed_background_insert_split_batch_on_failure`](../../../operations/settings/settings.md#distributed_background_insert_split_batch_on_failure)와 동일합니다.                                                                   | `0`           |
| `background_insert_sleep_time_ms`          | [`distributed_background_insert_sleep_time_ms`](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms)와 동일합니다.                                                                                     | `0`           |
| `background_insert_max_sleep_time_ms`      | [`distributed_background_insert_max_sleep_time_ms`](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms)와 동일합니다.                                                                             | `0`           |
| `flush_on_detach`                          | `DETACH`/`DROP`/서버 종료 시 원격 노드에 데이터를 플러시합니다.                                                                                                                                                                        | `true`        |

:::note
**내구성 설정** (`fsync_...`):

- 초기 저장 및 나중에 샤드로 전송 시 백그라운드 `INSERT`에만 영향을 미칩니다(`distributed_foreground_insert=false`인 경우).
- `INSERT` 성능을 비약적으로 저하 시킬 수 있습니다.
- **삽입한 데이터**가 있는 분산 테이블 폴더에 저장된 데이터를 노드 내부에 쓰는 것에 영향을 미칩니다. MergeTree 테이블에 대한 데이터 쓰기 보장 항목이 필요한 경우, `system.merge_tree_settings`의 내구성 설정(`...fsync...`)을 참조하시기 바랍니다.

**삽입 제한 설정** (`..._insert`)도 참고하시기 바랍니다:

- [`distributed_foreground_insert`](../../../operations/settings/settings.md#distributed_foreground_insert) 설정
- [`prefer_localhost_replica`](/operations/settings/settings#prefer_localhost_replica) 설정
- `bytes_to_throw_insert`는 `bytes_to_delay_insert`보다 먼저 처리되므로 이는 `bytes_to_delay_insert`보다 작은 값으로 설정해서는 안 됩니다.
:::

**예시**

```sql
CREATE TABLE hits_all AS hits
ENGINE = Distributed(logs, default, hits[, sharding_key[, policy_name]])
SETTINGS
    fsync_after_insert=0,
    fsync_directories=0;
```

데이터는 `logs` 클러스터의 모든 서버에서 `default.hits` 테이블에서 읽히며, 클러스터의 모든 서버에 위치합니다. 데이터는 단순히 읽히는 것이 아니라 원격 서버에서 부분적으로 처리됩니다(가능한 한도 내에서). 예를 들어, `GROUP BY`가 있는 쿼리는 원격 서버에서 집계되며 집계 함수의 중간 상태가 요청자 서버에 전송됩니다. 이후 데이터는 추가로 집계됩니다.

데이터베이스 이름 대신 문자열을 반환하는 상수 표현식을 사용할 수 있습니다. 예: `currentDatabase()`.

## 클러스터 {#distributed-clusters}

클러스터는 [서버 구성 파일](../../../operations/configuration-files.md)에서 구성됩니다:

```xml
<remote_servers>
    <logs>
        <!-- Inter-server per-cluster secret for Distributed queries
             default: no secret (no authentication will be performed)

             If set, then Distributed queries will be validated on shards, so at least:
             - such cluster should exist on the shard,
             - such cluster should have the same secret.

             And also (and which is more important), the initial_user will
             be used as current user for the query.
        -->
        <!-- <secret></secret> -->

        <!-- Optional. Whether distributed DDL queries (ON CLUSTER clause) are allowed for this cluster. Default: true (allowed). -->        
        <!-- <allow_distributed_ddl_queries>true</allow_distributed_ddl_queries> -->

        <shard>
            <!-- Optional. Shard weight when writing data. Default: 1. -->
            <weight>1</weight>
            <!-- Optional. The shard name.  Must be non-empty and unique among shards in the cluster. If not specified, will be empty. -->
            <name>shard_01</name>
            <!-- Optional. Whether to write data to just one of the replicas. Default: false (write data to all replicas). -->
            <internal_replication>false</internal_replication>
            <replica>
                <!-- Optional. Priority of the replica for load balancing (see also load_balancing setting). Default: 1 (less value has more priority). -->
                <priority>1</priority>
                <host>example01-01-1</host>
                <port>9000</port>
            </replica>
            <replica>
                <host>example01-01-2</host>
                <port>9000</port>
            </replica>
        </shard>
        <shard>
            <weight>2</weight>
            <name>shard_02</name>
            <internal_replication>false</internal_replication>
            <replica>
                <host>example01-02-1</host>
                <port>9000</port>
            </replica>
            <replica>
                <host>example01-02-2</host>
                <secure>1</secure>
                <port>9440</port>
            </replica>
        </shard>
    </logs>
</remote_servers>
```

여기서 클러스터는 `logs`라는 이름으로 정의되며, 두 개의 샤드가 포함되어 있으며 각 샤드에는 두 개의 복제본이 포함되어 있습니다. 샤드는 서로 다른 데이터 조각을 포함하는 서버를 참조합니다(모든 데이터를 읽기 위해서는 모든 샤드에 접근해야 합니다). 복제본은 데이터를 복제하는 서버입니다(모든 데이터를 읽기 위해서는 복제본 중 하나의 데이터에 접근하여도 좋습니다).

클러스터 이름에는 점을 포함할 수 없습니다.

각 서버에 대해 `host`, `port`, 선택적으로 `user`, `password`, `secure`, `compression`, `bind_host` 매개변수가 지정됩니다:

| 매개변수     | 설명                                                                                                                                                                                                                                                                                                                              | 기본 값 |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `host`        | 원격 서버의 주소입니다. 도메인 또는 IPv4 또는 IPv6 주소를 사용할 수 있습니다. 도메인을 지정하면 서버가 시작될 때 DNS 요청을 수행하고, 결과는 서버가 실행되고 있는 동안 저장됩니다. DNS 요청에 실패하면 서버가 시작되지 않습니다. DNS 레코드를 변경하면 서버를 재시작해야 합니다. | -        |
| `port`        | 메시저 활동을 위한 TCP 포트입니다(`tcp_port` 설정에서 보통 9000으로 설정됩니다). `http_port`와 혼동하지 마십시오.                                                                                                                                                            | -        |
| `user`        | 원격 서버에 연결할 사용자 이름입니다. 이 사용자는 지정된 서버에 연결할 수 있는 권한이 있어야 합니다. 액세스는 `users.xml` 파일에서 구성됩니다. 자세한 정보는 [액세스 권한](../../../guides/sre/user-management/index.md) 섹션을 참조하십시오.                                | `default` |
| `password`    | 원격 서버에 연결할 비밀번호(마스킹되지 않음)입니다.                                                                                                                                                                                                                                                                             | ''       |
| `secure`      | 안전한 SSL/TLS 연결을 사용할지 여부입니다. 일반적으로 포트를 지정해야 하며(기본 보안 포트는 `9440`입니다). 서버는 `<tcp_port_secure>9440</tcp_port_secure>`에서 수신해야 하며 올바른 인증서로 구성되어야 합니다.                                                                                            | `false`  |
| `compression` | 데이터 압축 사용 여부입니다.                                                                                                                                                                                                                                                                                                                    | `true`   |
| `bind_host`   | 이 노드에서 원격 서버에 연결할 때 사용할 소스 주소입니다. IPv4 주소만 지원됩니다. ClickHouse 분산 쿼리에서 소스 IP 주소를 설정해야 하는 고급 배포 사용 사례를 위해 설계되었습니다.                                                                                             | -        |

복제본을 지정할 때는 읽기 시 각 샤드에 대해 사용 가능한 복제본 중 하나가 선택됩니다. 부하 분산 알고리즘(어떤 복제본에 접근할지의 기본 설정)을 구성할 수 있습니다 – 자세한 내용은 [load_balancing](../../../operations/settings/settings.md#load_balancing) 설정을 참조하십시오. 서버와의 연결이 설정되지 않으면 짧은 타임아웃으로 연결을 시도합니다. 연결이 실패하면 다음 복제본이 선택되며, 모든 복제본에 대해 이러한 방식이 계속됩니다. 모든 복제본에 대한 연결 시도가 실패하면 몇 번 반복하여 동일한 방식으로 시도를 수행합니다. 이는 복원력에 도움이 되지만 완전한 결함 허용을 제공하지는 않습니다: 원격 서버가 연결을 수락할 수 있지만 작동하지 않거나 작동이 불완전할 수 있습니다.

샤드 중 하나만 지정할 수도 있고(이 경우 쿼리 처리는 분산이 아닌 원격으로 호출되어야 합니다) 원하는 만큼의 샤드를 지정할 수 있습니다. 각 샤드는 하나 이상의 복제본을 지정할 수 있습니다. 각 샤드에 대해 다른 수의 복제본을 지정할 수 있습니다.

구성에서 원하는 만큼 클러스터를 지정할 수 있습니다.

클러스터를 보려면 `system.clusters` 테이블을 사용하십시오.

`Distributed` 엔진은 클러스터를 로컬 서버처럼 작업할 수 있게 해줍니다. 그러나 클러스터의 구성은 동적으로 지정할 수 없으며 서버 구성 파일에서 구성해야 합니다. 일반적으로 클러스터의 모든 서버는 동일한 클러스터 구성을 가집니다(이는 필수 사항은 아님). 구성 파일의 클러스터는 서버를 재시작하지 않고도 즉시 업데이트됩니다.

매번 알 수 없는 샤드 및 복제본 집합에 쿼리를 전송해야 하는 경우 `Distributed` 테이블을 만들 필요가 없습니다 – 대신 `remote` 테이블 함수를 사용하십시오. [테이블 함수](../../../sql-reference/table-functions/index.md) 섹션을 참조하십시오.

## 데이터 쓰기 {#distributed-writing-data}

클러스터에 데이터를 쓰는 두 가지 방법이 있습니다:

첫째, 어떤 서버에 어떤 데이터를 쓸지를 정의하고 각 샤드에서 직접 쓰기를 수행할 수 있습니다. 즉, `Distributed` 테이블이 가리키는 원격 테이블의 경우에 대해 직접 `INSERT` 문을 수행하는 것입니다. 이는 주제 영역의 요구로 인해 비트리비얼일 수 있는 어떤 샤딩 계획도 사용할 수 있기 때문에 가장 유연한 솔루션입니다. 이는 또한 서로 다른 샤드에 완전히 독립적으로 데이터를 쓸 수 있기 때문에 가장 최적의 솔루션이기도 합니다.

둘째, `Distributed` 테이블에서 `INSERT` 문을 수행할 수 있습니다. 이 경우 테이블이 삽입된 데이터를 서버에 분배합니다. `Distributed` 테이블에 쓰려면 `sharding_key` 매개변수가 구성되어 있어야 합니다(하나의 샤드만 있는 경우 제외).

각 샤드는 구성 파일에서 `<weight>`가 정의될 수 있습니다. 기본적으로 가중치는 `1`입니다. 데이터는 샤드의 가중치에 비례하여 분배됩니다. 모든 샤드 가중치를 합산한 후 각 샤드의 가중치를 총합으로 나누어 각 샤드의 비율을 결정합니다. 예를 들어 두 개의 샤드가 있고 첫 번째 샤드의 가중치가 1이고 두 번째 샤드의 가중치가 2라면, 첫 번째 샤드는 삽입된 행의 1/3(1 / 3)을 전송받고 두 번째 샤드는 2/3(2 / 3)를 전송받습니다.

각 샤드는 구성 파일에서 `internal_replication` 매개변서를 정의할 수 있습니다. 이 매개변수가 `true`로 설정되면 쓰기 작업은 첫 번째 건강한 복제본을 선택하고 데이터에 쓰기를 합니다. 이는 `Distributed` 테이블의 기본이 되는 테이블이 복제본 테이블인 경우(예: `Replicated*MergeTree` 테이블 엔진에 대해) 사용하십시오. 테이블 복제본 중 하나가 쓰기를 받고 다른 복제본에 자동으로 복제됩니다.

`internal_replication`이 `false`로 설정되어 있는 경우(기본값) 데이터는 모든 복제본에 쓰여집니다. 이 경우 `Distributed` 테이블은 데이터를 자체적으로 복제합니다. 이는 복제본 테이블을 사용하는 것보다 좋지 않으며, 복제본의 일관성이 확인되지 않고 시간이 지나면 약간씩 다른 데이터가 포함될 수 있습니다.

데이터 행이 전송될 샤드를 선택하기 위해 샤딩 표현식이 분석되고, 이를 총 샤드 가중치로 나눈 나머지가 취해집니다. 행은 `prev_weights`부터 `prev_weights + weight`까지의 나머리의 반(interval)에 해당하는 샤드로 전송됩니다. 여기서 `prev_weights`는 가장 작은 번호를 가진 샤드의 총 가중치이고 `weight`는 해당 샤드의 가중치입니다. 예를 들어 두 개의 샤드가 있고 첫 번째 샤드의 가중치가 9이며 두 번째 샤드의 가중치가 10이라면 행은 범위 \[0, 9)에서 첫 번째 샤드로 전송되고 범위 \[9, 19)에서 두 번째 샤드로 전송됩니다.

샤딩 표현식은 정수를 반환하는 상수 및 테이블 컬럼의 어떤 표현식일 수 있습니다. 예를 들어, 데이터의 무작위 분포를 위해 `rand()` 표현식을 사용할 수도 있고, 사용자의 ID로 나눈 나머지를 기반으로 분포하기 위해 `UserID`를 사용할 수 있습니다(이렇게 하면 단일 사용자의 데이터가 단일 샤드에 남아 `IN` 및 `JOIN`을 사용자별로 실행하는 것이 간편해집니다). 특정 컬럼이 충분히 고르게 분포되지 않는 경우 해시 함수로 감쌀 수 있습니다(e.g. `intHash64(UserID)`).

단순한 나눗셈 나머지는 샤딩에 대한 제한된 솔루션이며 항상 적합하지 않습니다. 이는 중간 및 대량의 데이터(수십 개의 서버)에 대해 작동하지만 매우 대량의 데이터(수백 개 이상의 서버)에 대해서는 작동하지 않습니다. 후자의 경우 `Distributed` 테이블의 항목을 사용하는 대신 주제 영역에 필요한 샤딩 스킴을 사용하는 것이 좋습니다.

다음 경우에 샤딩 스킴에 대해 신경을 써야 합니다:

- 특정 키로 데이터를 조인하는 데 필요한 쿼리를 사용합니다(`IN` 또는 `JOIN`). 데이터가 이 키로 샤딩될 경우, 로컬 `IN` 또는 `JOIN`을 사용할 수 있으며, 이는 훨씬 더 효율적입니다.
- 많은 수의 서버(수백 개 이상)가 사용되며 수많은 소규모 쿼리가 사용되는 경우, 예를 들어 특정 클라이언트의 데이터 쿼리(웹사이트, 광고주, 파트너 등). 소규모 쿼리가 전체 클러스터에 영향을 주지 않도록 하기 위해 단일 클라이언트에 대한 데이터는 단일 샤드에 두는 것이 의미가 있습니다. 또는 바이 레벨 샤딩을 설정할 수 있습니다: 전체 클러스터를 "층"으로 나누고, 여기서 하나의 층은 여러 개의 샤드를 포함할 수 있습니다. 단일 클라이언트에 대한 데이터는 단일 층에 위치하지만 필요에 따라 층 내에서 샤드를 추가할 수 있고, 그 안에서는 데이터가 무작위로 분포됩니다. 각 층에 대한 `Distributed` 테이블이 생성되고, 전역 쿼리를 위한 단일 공유 분산 테이블이 생성됩니다.

데이터는 백그라운드에서 쓰여집니다. 테이블에 삽입되면 데이터 블록은 로컬 파일 시스템에 작성됩니다. 데이터는 가능한 한 빨리 원격 서버로 백그라운드에서 전송됩니다. 데이터 전송의 주기성은 [distributed_background_insert_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms) 및 [distributed_background_insert_max_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms) 설정에 의해 관리됩니다. `Distributed` 엔진은 삽입된 데이터가 있는 각각 파일을 따로 전송하지만, [distributed_background_insert_batch](../../../operations/settings/settings.md#distributed_background_insert_batch) 설정을 통해 파일의 배치 전송을 활성화할 수 있습니다. 이 설정은 로컬 서버와 네트워크 리소스를 더 잘 활용하여 클러스터 성능을 개선합니다. 데이터가 성공적으로 전송되었는지 확인하려면 테이블 디렉토리에서 대기 중인 파일 목록을 확인하십시오: `/var/lib/clickhouse/data/database/table/`. 백그라운드 작업을 수행하는 스레드 수는 [background_distributed_schedule_pool_size](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 설정으로 설정할 수 있습니다.

서버가 존재하지 않거나 `Distributed` 테이블에 대한 `INSERT` 후 하드웨어 오류와 같은 심각한 재시작으로 인해 작업이 중단된 경우, 삽입된 데이터가 손실될 수 있습니다. 테이블 디렉토리에서 손상된 데이터 파트가 발견되면 해당 파일은 `broken` 하위 디렉토리로 전송되며 더 이상 사용되지 않습니다.

## 데이터 읽기 {#distributed-reading-data}

`Distributed` 테이블을 쿼리할 때, `SELECT` 쿼리는 모든 샤드로 전송되며 데이터가 샤드에 어떻게 분배되어 있는지에 관계없이 작동합니다(완전히 무작위로 분배될 수 있습니다). 새로운 샤드를 추가할 때 기존 데이터를 해당 샤드로 옮길 필요가 없습니다. 대신, 더 무거운 가중치를 사용하여 새로운 데이터를 해당 샤드에 쓸 수 있습니다 – 이 경우 데이터는 약간 고르지 않게 분배되지만 쿼리는 올바르고 효율적으로 작동합니다.

`max_parallel_replicas` 옵션이 활성화되면 쿼리 처리는 단일 샤드 내의 모든 복제본에 걸쳐 병렬화됩니다. 자세한 내용은 [max_parallel_replicas](../../../operations/settings/settings.md#max_parallel_replicas) 섹션을 참조하십시오.

분산 `in` 및 `global in` 쿼리가 처리되는 방법에 대한 자세한 내용은 [이곳](/sql-reference/operators/in#distributed-subqueries) 문서를 참조하십시오.

## 가상 컬럼 {#virtual-columns}

#### _Shard_num {#_shard_num}

`_shard_num` — 테이블 `system.clusters`의 `shard_num` 값을 포함합니다. 유형: [UInt32](../../../sql-reference/data-types/int-uint.md).

:::note
[`remote`](../../../sql-reference/table-functions/remote.md) 및 [`cluster`](../../../sql-reference/table-functions/cluster.md) 테이블 함수는 내부적으로 임시 분산 테이블을 생성하므로, `_shard_num`은 여기에서도 사용 가능합니다.
:::

**참고 추가**

- [가상 컬럼](../../../engines/table-engines/index.md#table_engines-virtual_columns) 설명
- [`background_distributed_schedule_pool_size`](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 설정
- [`shardNum()`](../../../sql-reference/functions/other-functions.md#shardNum) 및 [`shardCount()`](../../../sql-reference/functions/other-functions.md#shardCount) 함수
