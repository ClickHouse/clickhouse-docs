---
description: 'Distributed 엔진을 사용하는 테이블은 자체적으로 데이터를 저장하지 않고, 여러 서버에서 분산 쿼리 처리를 수행할 수 있도록 합니다. 읽기 작업은 자동으로 병렬화됩니다. 읽기 작업 시 원격 서버에 테이블 인덱스가 존재하면 이를 사용합니다.'
sidebar_label: 'Distributed'
sidebar_position: 10
slug: /engines/table-engines/special/distributed
title: 'Distributed 테이블 엔진'
doc_type: 'reference'
---



# Distributed 테이블 엔진 \{#distributed-table-engine\}

:::warning Cloud에서의 Distributed 테이블 엔진
ClickHouse Cloud에서 Distributed 테이블 엔진을 생성하려면 [`remote` 및 `remoteSecure`](../../../sql-reference/table-functions/remote) 테이블 함수를 사용합니다. 
`Distributed(...)` 구문은 ClickHouse Cloud에서 사용할 수 없습니다.
:::

Distributed 엔진을 사용하는 테이블은 자체적으로 데이터를 저장하지 않으며, 여러 서버에서 분산 쿼리 처리를 수행할 수 있도록 합니다. 
읽기 작업은 자동으로 병렬 처리됩니다. 읽기 시에는 원격 서버에 존재하는 경우 해당 서버의 테이블 인덱스가 사용됩니다.



## 테이블 생성하기 \{#distributed-creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = Distributed(cluster, database, table[, sharding_key[, policy_name]])
[SETTINGS name=value, ...]
```

### 테이블에서 \{#distributed-from-a-table\}

`Distributed` 테이블이 현재 서버의 테이블을 가리키는 경우, 해당 테이블의 스키마를 그대로 사용할 수 있습니다:

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster] AS [db2.]name2 ENGINE = Distributed(cluster, database, table[, sharding_key[, policy_name]]) [SETTINGS name=value, ...]
```

### Distributed 매개변수 \{#distributed-parameters\}

| Parameter                 | Description                                                                                                                                                                                                                                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cluster`                 | 서버 설정 파일에 정의된 클러스터 이름                                                                                                                                                                                                                                                                                                                             |
| `database`                | 원격 데이터베이스 이름                                                                                                                                                                                                                                                                                                                                      |
| `table`                   | 원격 테이블 이름                                                                                                                                                                                                                                                                                                                                         |
| `sharding_key` (Optional) | 샤딩 키입니다.<br /> `sharding_key` 지정은 다음의 경우에 필요합니다. <ul><li>분산 테이블에 `INSERTs`를 수행할 때 필요합니다. 테이블 엔진이 데이터를 어떻게 분할할지 결정하기 위해 `sharding_key`가 필요하기 때문입니다. 단, `insert_distributed_one_random_shard` 설정이 활성화된 경우에는 `INSERTs`에 샤딩 키가 필요하지 않습니다.</li><li>`optimize_skip_unused_shards`와 함께 사용할 때, 어떤 세그먼트를 조회해야 하는지 결정하기 위해 `sharding_key`가 필요합니다.</li></ul> |
| `policy_name` (Optional)  | 정책 이름입니다. 백그라운드 전송에 사용되는 임시 파일을 저장하는 데 사용됩니다.                                                                                                                                                                                                                                                                                                     |

**함께 보기**

* [distributed&#95;foreground&#95;insert](../../../operations/settings/settings.md#distributed_foreground_insert) 설정
* 예시는 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes)를 참고하십시오.

### Distributed 설정 \{#distributed-settings\}


| Setting                                    | Description                                                                                                                                                      | Default value |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `fsync_after_insert`                       | Distributed에 대해 백그라운드 `INSERT` 후 파일 데이터에 `fsync`를 수행합니다. 운영체제가 **이니시에이터 노드(initiator node)** 디스크의 파일에 전체 insert된 데이터를 플러시했음을 보장합니다.                              | `false`       |
| `fsync_directories`                        | 디렉터리에 `fsync`를 수행합니다. Distributed 테이블에서 백그라운드 insert와 관련된 작업(삽입 후, 데이터를 세그먼트로 전송한 후 등) 후에 운영체제가 디렉터리 메타데이터를 새로 고쳤음을 보장합니다.                                       | `false`       |
| `skip_unavailable_shards`                  | true이면 ClickHouse가 사용 불가능한 세그먼트를 조용히 건너뜁니다. 세그먼트는 다음의 경우 사용 불가능한 것으로 표시됩니다. 1) 연결 실패로 인해 세그먼트에 도달할 수 없는 경우 2) DNS를 통해 세그먼트를 해석할 수 없는 경우 3) 세그먼트에 테이블이 존재하지 않는 경우 | `false`       |
| `bytes_to_throw_insert`                    | 백그라운드 `INSERT`를 위해 대기 중인 압축 바이트 수가 이 값보다 많으면 예외가 발생합니다. `0` — 예외를 발생시키지 않습니다.                                                                                    | `0`           |
| `bytes_to_delay_insert`                    | 백그라운드 `INSERT`를 위해 대기 중인 압축 바이트 수가 이 값보다 많으면 쿼리가 지연됩니다. `0` — 지연하지 않습니다.                                                                                         | `0`           |
| `max_delay_to_insert`                      | 백그라운드 전송을 위해 대기 중인 바이트가 많을 때 Distributed 테이블로 데이터를 삽입하는 최대 지연 시간(초)입니다.                                                                                          | `60`          |
| `background_insert_batch`                  | [`distributed_background_insert_batch`](../../../operations/settings/settings.md#distributed_background_insert_batch)와 동일합니다.                                    | `0`           |
| `background_insert_split_batch_on_failure` | [`distributed_background_insert_split_batch_on_failure`](../../../operations/settings/settings.md#distributed_background_insert_split_batch_on_failure)와 동일합니다.  | `0`           |
| `background_insert_sleep_time_ms`          | [`distributed_background_insert_sleep_time_ms`](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms)와 동일합니다.                    | `0`           |
| `background_insert_max_sleep_time_ms`      | [`distributed_background_insert_max_sleep_time_ms`](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms)와 동일합니다.            | `0`           |
| `flush_on_detach`                          | `DETACH`/`DROP`/서버 종료 시 원격 노드로 데이터를 플러시합니다.                                                                                                                      | `true`        |

:::note
**내구성 설정** (`fsync_...`):

* 데이터가 먼저 이니시에이터 노드 디스크에 저장되고 이후 백그라운드에서 세그먼트로 전송되는 경우, 백그라운드 `INSERT`(즉, `distributed_foreground_insert=false`)에만 영향을 줍니다.
* `INSERT` 성능을 크게 저하시킬 수 있습니다.
* 분산 테이블 폴더 내부에 저장된 데이터를 **insert를 수락한 노드**에 기록하는 동작에 영향을 줍니다. 하위 MergeTree 테이블에 데이터를 기록하는 것에 대한 보장이 필요하다면, `system.merge_tree_settings`의 내구성 설정(`...fsync...`)을 참조하십시오.

**INSERT 제한 설정** (`..._insert`)에 대해서는 다음도 참조하십시오.

* [`distributed_foreground_insert`](../../../operations/settings/settings.md#distributed_foreground_insert) 설정
* [`prefer_localhost_replica`](/operations/settings/settings#prefer_localhost_replica) 설정
* `bytes_to_throw_insert`는 `bytes_to_delay_insert`보다 먼저 처리되므로 `bytes_to_delay_insert`보다 작은 값으로 설정해서는 안 됩니다.
  :::

**예제**

```sql
CREATE TABLE hits_all AS hits
ENGINE = Distributed(logs, default, hits[, sharding_key[, policy_name]])
SETTINGS
    fsync_after_insert=0,
    fsync_directories=0;
```

데이터는 `logs` 클러스터의 모든 서버에 존재하는 `default.hits` 테이블에서 읽습니다. 데이터는 읽기만 하는 것이 아니라, 가능한 범위 내에서 원격 서버에서 일부가 처리됩니다. 예를 들어 `GROUP BY`가 포함된 쿼리의 경우, 데이터는 원격 서버에서 집계되고 집계 함수의 중간 상태가 요청을 수신하는 서버로 전송됩니다. 그런 다음 해당 서버에서 데이터가 추가로 집계됩니다.

데이터베이스 이름 대신 문자열을 반환하는 상수 표현식을 사용할 수 있습니다. 예: `currentDatabase()`.


## 클러스터 \{#distributed-clusters\}

클러스터는 [서버 구성 파일](../../../operations/configuration-files.md)에서 설정합니다.

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

여기서는 `logs`라는 이름의 클러스터가 정의되어 있으며, 두 개의 세그먼트로 구성되고 각 세그먼트는 두 개의 레플리카를 포함합니다. 세그먼트는 서로 다른 데이터 파트를 보유하는 서버를 의미합니다(전체 데이터를 읽으려면 모든 세그먼트에 접근해야 합니다). 레플리카는 동일한 데이터를 복제하는 서버입니다(전체 데이터를 읽기 위해서는 레플리카 중 어느 하나에만 접근해도 됩니다).

클러스터 이름에는 마침표(`.`)를 포함할 수 없습니다.

각 서버마다 `host`, `port`와 선택적으로 `user`, `password`, `secure`, `compression`, `bind_host` 파라미터를 지정합니다:


| Parameter     | Description                                                                                                                                                                                                                                                                                                                              | Default Value |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| `host`        | 원격 서버의 주소입니다. 도메인 또는 IPv4, IPv6 주소를 사용할 수 있습니다. 도메인을 지정하는 경우 서버는 시작 시 DNS 요청을 수행하고, 그 결과를 서버가 실행되는 동안 유지합니다. DNS 요청에 실패하면 서버는 시작되지 않습니다. DNS 레코드를 변경한 경우 서버를 다시 시작해야 합니다.                                                                                     | -            |
| `port`        | 메시지 송수신(클라이언트 연결)을 위한 TCP 포트입니다(설정의 `tcp_port`, 일반적으로 9000으로 설정됨). `http_port`와 혼동하지 마십시오.                                                                                                                                                                                                    | -            |
| `user`        | 원격 서버에 연결할 때 사용할 사용자 이름입니다. 이 사용자는 지정된 서버에 연결할 수 있는 권한이 있어야 합니다. 권한은 `users.xml` 파일에서 구성합니다. 자세한 내용은 [Access rights](../../../guides/sre/user-management/index.md) 섹션을 참조하십시오.                                                                                | `default`    |
| `password`    | 원격 서버에 연결할 때 사용할 비밀번호입니다(마스킹되지 않음).                                                                                                                                                                                                                                                                           | ''           |
| `secure`      | 보안 SSL/TLS 연결을 사용할지 여부입니다. 일반적으로 포트도 함께 지정해야 합니다(기본 보안 포트는 `9440`입니다). 서버는 `<tcp_port_secure>9440</tcp_port_secure>` 포트에서 수신 대기해야 하며, 올바른 인증서로 구성되어야 합니다.                                                                                                     | `false`      |
| `compression` | 데이터 압축을 사용할지 여부입니다.                                                                                                                                                                                                                                                                                                       | `true`       |
| `bind_host`   | 이 노드에서 원격 서버에 연결할 때 사용할 소스 주소입니다. IPv4 주소만 지원합니다. ClickHouse 분산 쿼리에서 사용할 소스 IP 주소를 설정해야 하는 고급 배포 시나리오를 위한 옵션입니다.                                                                                                                                            | -            |

레플리카를 지정하면, 각 세그먼트를 읽을 때 사용 가능한 레플리카 중 하나가 선택됩니다. 부하 분산 알고리즘(어느 레플리카에 우선적으로 접근할지)을 설정할 수 있습니다. 관련 내용은 [load_balancing](../../../operations/settings/settings.md#load_balancing) 설정을 참조하십시오. 서버와의 연결이 설정되지 않으면 짧은 타임아웃으로 연결을 시도합니다. 연결에 실패하면 다음 레플리카가 선택되며, 모든 레플리카에 대해 동일하게 진행됩니다. 모든 레플리카에 대한 연결 시도가 실패한 경우, 동일한 방식으로 여러 차례 재시도합니다. 이는 복원력 향상에는 도움이 되지만 완전한 장애 허용을 제공하지는 않습니다. 예를 들어, 원격 서버가 연결은 수락하지만 전혀 동작하지 않거나 성능이 매우 나쁠 수 있습니다.

세그먼트를 하나만 지정할 수도 있으며(이 경우 쿼리 처리는 분산이 아닌 원격 처리로 보아야 합니다), 여러 개의 세그먼트를 지정할 수도 있습니다. 각 세그먼트 내에서는 하나 이상 임의의 개수만큼 레플리카를 지정할 수 있습니다. 세그먼트마다 서로 다른 개수의 레플리카를 지정할 수 있습니다.

구성에서 원하는 만큼 많은 클러스터를 지정할 수 있습니다.

클러스터를 보려면 `system.clusters` 테이블을 사용하십시오.

`Distributed` 엔진을 사용하면 클러스터를 로컬 서버처럼 사용할 수 있습니다. 다만, 클러스터 설정은 동적으로 지정할 수 없으며 서버 설정 파일에서 구성해야 합니다. 일반적으로 클러스터의 모든 서버는 동일한 클러스터 구성을 사용하지만(필수는 아님), 설정 파일의 클러스터 정의는 서버를 재시작하지 않고도 실시간으로 갱신됩니다.

매번 미리 알 수 없는 세그먼트 및 레플리카 집합으로 쿼리를 전송해야 하는 경우에는 `Distributed` 테이블을 생성할 필요가 없습니다. 대신 `remote` 테이블 함수를 사용하십시오. 자세한 내용은 [Table functions](../../../sql-reference/table-functions/index.md) 섹션을 참조하십시오.



## 데이터 쓰기 \{#distributed-writing-data\}

클러스터에 데이터를 쓰는 방법은 두 가지가 있습니다:

첫 번째 방법은 어떤 서버에 어떤 데이터를 쓸지 사용자가 정의하고, 각 세그먼트에 직접 쓰는 것입니다. 즉, `Distributed` 테이블이 가리키는 클러스터 내 원격 테이블에 직접 `INSERT` SQL 문을 수행하는 방식입니다. 이 방식은 주제 영역의 요구 사항 때문에 복잡한 샤딩 방식이 필요하더라도 어떤 샤딩 스킴이든 사용할 수 있으므로 가장 유연한 해결책입니다. 또한 서로 다른 세그먼트에 데이터를 완전히 독립적으로 쓸 수 있기 때문에 가장 효율적인 해결책이기도 합니다.

두 번째 방법은 `Distributed` 테이블에 `INSERT` SQL 문을 수행하는 것입니다. 이 경우, 테이블이 삽입된 데이터를 자체적으로 서버들 간에 분산합니다. `Distributed` 테이블에 쓰기 위해서는 (세그먼트가 하나만 있는 경우를 제외하고) 반드시 `sharding_key` 파라미터가 설정되어 있어야 합니다.

각 세그먼트는 설정 파일에서 `<weight>`를 가질 수 있습니다. 기본적으로 weight 값은 `1`입니다. 데이터는 세그먼트 weight에 비례하는 양만큼 세그먼트들에 분산됩니다. 모든 세그먼트의 weight를 합산한 뒤, 각 세그먼트의 weight를 그 합으로 나누어 세그먼트별 비율을 결정합니다. 예를 들어, 세그먼트가 두 개 있고 첫 번째 세గ먼트의 weight가 1, 두 번째 세그먼트의 weight가 2라면, 첫 번째 세그먼트에는 삽입된 행의 3분의 1(1 / 3), 두 번째 세그먼트에는 3분의 2(2 / 3)가 전송됩니다.

각 세그먼트는 설정 파일에 `internal_replication` 파라미터를 가질 수 있습니다. 이 파라미터가 `true`로 설정된 경우, 쓰기 작업은 첫 번째 정상 레플리카를 선택하여 그곳에 데이터를 기록합니다. `Distributed` 테이블 아래에 있는 테이블들이 복제된 테이블(예: `Replicated*MergeTree` 테이블 엔진 중 하나)인 경우 이 방식을 사용하십시오. 테이블 레플리카 중 하나가 쓰기를 받고, 이 데이터는 다른 레플리카로 자동으로 복제됩니다.

`internal_replication`이 `false`(기본값)로 설정된 경우, 데이터는 모든 레플리카에 기록됩니다. 이 경우 `Distributed` 테이블이 자체적으로 데이터를 복제합니다. 레플리카 간 일관성이 검사되지 않고 시간이 지남에 따라 약간씩 다른 데이터를 갖게 되므로, 이는 복제된 테이블을 사용하는 것보다 좋지 않습니다.

행 데이터가 전송될 세그먼트를 선택하기 위해 샤딩 표현식을 분석하고, 그 결과를 모든 세그먼트 weight 합으로 나눈 나머지를 사용합니다. 해당 행은 `prev_weights`부터 `prev_weights + weight`까지의 나머지 반구간에 해당하는 세그먼트로 전송됩니다. 여기서 `prev_weights`는 번호가 더 작은 세그먼트들의 weight 합이고, `weight`는 해당 세그먼트의 weight입니다. 예를 들어, 세그먼트가 두 개 있고 첫 번째 세그먼트의 weight가 9, 두 번째 세그먼트의 weight가 10이라면, 나머지가 \[0, 9) 범위에 속하는 행은 첫 번째 세그먼트로, \[9, 19) 범위에 속하는 행은 두 번째 세그먼트로 전송됩니다.

샤딩 표현식은 상수와 테이블 컬럼으로 구성되며 정수를 반환하는 아무 표현식이나 사용할 수 있습니다. 예를 들어, 데이터의 무작위 분산을 위해 `rand()` 표현식을 사용할 수 있고, 사용자 ID를 나눈 나머지에 의한 분산을 위해 `UserID`를 사용할 수 있습니다(이 경우 단일 사용자의 데이터는 하나의 세그먼트에만 저장되므로 사용자 기준 `IN` 및 `JOIN` 실행이 간단해집니다). 특정 컬럼이 충분히 균등하게 분산되지 않는다면 `intHash64(UserID)`와 같이 해시 함수로 감싸서 사용할 수 있습니다.

단순한 나머지 연산에 기반한 분산은 제한적인 샤딩 방식이며 항상 적합하지는 않습니다. 이 방식은 (수십 대 서버 수준의) 중간 및 큰 규모의 데이터에는 잘 동작하지만, (수백 대 이상의 서버를 사용하는) 매우 큰 규모의 데이터에는 적합하지 않습니다. 후자의 경우에는 `Distributed` 테이블을 사용하는 대신, 주제 영역에 필요한 샤딩 스킴을 사용해야 합니다.

다음과 같은 경우에는 샤딩 스킴에 주의를 기울여야 합니다:



- 특정 키로 데이터를 조인하는(`IN` 또는 `JOIN`) 쿼리를 사용하는 경우입니다. 데이터가 이 키를 기준으로 세그먼트에 분산되어 있다면, 훨씬 더 효율적인 로컬 `IN` 또는 `JOIN`을 `GLOBAL IN` 또는 `GLOBAL JOIN` 대신 사용할 수 있습니다.
- 많은 수의 서버(수백 대 이상)와 많은 수의 소규모 쿼리를 사용하는 경우입니다. 예를 들어 개별 클라이언트(웹사이트, 광고주 또는 파트너 등)의 데이터를 조회하는 쿼리입니다. 소규모 쿼리가 전체 클러스터에 영향을 주지 않도록 하려면, 단일 클라이언트의 데이터를 단일 세그먼트에 위치시키는 것이 합리적입니다. 또는 2단계 샤딩을 설정할 수 있습니다. 전체 클러스터를 여러 "레이어"로 나누고, 하나의 레이어는 여러 세그먼트로 구성되도록 합니다. 단일 클라이언트의 데이터는 단일 레이어에 저장되지만, 필요에 따라 레이어에 세그먼트를 추가할 수 있고, 데이터는 그 안에서 무작위로 분산됩니다. 각 레이어마다 `Distributed` 테이블이 생성되며, 전역 쿼리를 위해 단일 공유 분산 테이블이 생성됩니다.

데이터 쓰기는 백그라운드에서 수행됩니다. 테이블에 데이터를 삽입할 때, 데이터 블록은 우선 로컬 파일 시스템에만 기록됩니다. 데이터는 가능한 한 빨리 백그라운드에서 원격 서버로 전송됩니다. 데이터 전송 주기는 [distributed_background_insert_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms) 및 [distributed_background_insert_max_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms) 설정으로 관리됩니다. `Distributed` 엔진은 삽입된 데이터가 있는 각 파일을 개별적으로 전송하지만, [distributed_background_insert_batch](../../../operations/settings/settings.md#distributed_background_insert_batch) 설정을 사용하여 파일 배치 전송을 활성화할 수 있습니다. 이 설정은 로컬 서버와 네트워크 리소스를 더 잘 활용하여 클러스터 성능을 향상시킵니다. 데이터가 성공적으로 전송되었는지는 테이블 디렉터리에 있는 파일 목록(전송 대기 중인 데이터)을 확인하여 점검할 수 있습니다: `/var/lib/clickhouse/data/database/table/`. 백그라운드 작업을 수행하는 스레드 개수는 [background_distributed_schedule_pool_size](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 설정으로 지정할 수 있습니다.

서버가 `Distributed` 테이블에 대한 `INSERT` 이후 더 이상 존재하지 않게 되었거나(예: 하드웨어 장애로 인한 경우) 강제 재시작이 발생한 경우, 삽입된 데이터가 손실될 수 있습니다. 테이블 디렉터리에서 손상된 데이터 파트가 감지되면 `broken` 하위 디렉터리로 이동되며 더 이상 사용되지 않습니다.



## 데이터 읽기 \{#distributed-reading-data\}

`Distributed` 테이블에 대해 쿼리를 실행하면 `SELECT` 쿼리가 모든 세그먼트로 전송되어, 데이터가 세그먼트에 어떻게 분산되어 있는지(완전히 무작위로 분산되어 있을 수도 있음)에 상관없이 실행됩니다. 새 세그먼트를 추가하더라도 기존 데이터를 그 세그먼트로 옮길 필요는 없습니다. 대신 더 높은 가중치를 사용해 새 데이터를 그 세그먼트에 기록하면 됩니다. 이 경우 데이터 분포는 다소 불균형해지지만, 쿼리는 여전히 올바르고 효율적으로 실행됩니다.

`max_parallel_replicas` 옵션이 활성화되면 단일 세그먼트 내의 모든 레플리카에 걸쳐 쿼리 처리가 병렬화됩니다. 자세한 내용은 [max_parallel_replicas](../../../operations/settings/settings.md#max_parallel_replicas) 섹션을 참조하십시오.

분산된 `in` 및 `global in` 쿼리가 어떻게 처리되는지에 대해 자세히 알아보려면 [이 문서](/sql-reference/operators/in#distributed-subqueries)를 참조하십시오.



## 가상 컬럼 \{#virtual-columns\}

#### _Shard_num \{#_shard_num\}

`_shard_num` — 테이블 `system.clusters`의 `shard_num` 값을 포함합니다. 형식: [UInt32](../../../sql-reference/data-types/int-uint.md).

:::note
[`remote`](../../../sql-reference/table-functions/remote.md) 및 [`cluster`](../../../sql-reference/table-functions/cluster.md) 테이블 함수는 내부적으로 임시 분산 테이블(Distributed table)을 생성하므로, 해당 테이블에서도 `_shard_num`을 사용할 수 있습니다.
:::

**관련 항목**

- [가상 컬럼](../../../engines/table-engines/index.md#table_engines-virtual_columns) 설명
- [`background_distributed_schedule_pool_size`](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 설정
- [`shardNum()`](../../../sql-reference/functions/other-functions.md#shardNum) 및 [`shardCount()`](../../../sql-reference/functions/other-functions.md#shardCount) 함수
