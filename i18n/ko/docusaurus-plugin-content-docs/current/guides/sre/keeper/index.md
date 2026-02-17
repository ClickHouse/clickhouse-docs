---
slug: /guides/sre/keeper/clickhouse-keeper

sidebar_label: 'ClickHouse Keeper 구성'
sidebar_position: 10
keywords: ['Keeper', 'ZooKeeper', 'clickhouse-keeper']
description: 'ClickHouse Keeper 또는 clickhouse-keeper는 ZooKeeper를 대체하며 복제 및 조정을 담당합니다.'
title: 'ClickHouse Keeper'
doc_type: 'guide'
---

# ClickHouse Keeper (clickhouse-keeper) \{#clickhouse-keeper-clickhouse-keeper\}

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

ClickHouse Keeper는 데이터 [복제](/engines/table-engines/mergetree-family/replication.md) 및 [분산 DDL](/sql-reference/distributed-ddl.md) 쿼리 실행을 위한 조정 시스템 역할을 합니다. ClickHouse Keeper는 ZooKeeper와 호환됩니다.


### 구현 세부 사항 \{#implementation-details\}

ZooKeeper는 가장 잘 알려진 오픈 소스 조정(coordination) 시스템 중 하나입니다. Java로 구현되었으며, 상당히 단순하면서도 강력한 데이터 모델을 가지고 있습니다. ZooKeeper의 조정 알고리즘인 ZooKeeper Atomic Broadcast (ZAB)는 각 ZooKeeper 노드가 로컬에서 읽기를 처리하기 때문에 읽기에 대해 선형화(linearizability)를 보장하지 않습니다. ZooKeeper와 달리 ClickHouse Keeper는 C++로 작성되었으며 [RAFT algorithm](https://raft.github.io/) [implementation](https://github.com/eBay/NuRaft)을 사용합니다. 이 알고리즘은 읽기와 쓰기에 대해 선형화를 보장하며, 여러 언어로 구현된 오픈 소스 구현체들이 존재합니다.

기본적으로 ClickHouse Keeper는 ZooKeeper와 동일한 보장을 제공합니다. 즉, 선형화 가능한 쓰기와 선형화가 보장되지 않는 읽기를 제공합니다. 클라이언트-서버 프로토콜은 호환되므로, 표준 ZooKeeper 클라이언트를 사용하여 ClickHouse Keeper와 상호작용할 수 있습니다. 스냅샷과 로그는 ZooKeeper와 호환되지 않는 형식을 사용하지만, `clickhouse-keeper-converter` 도구를 사용하면 ZooKeeper 데이터를 ClickHouse Keeper 스냅샷으로 변환할 수 있습니다. ClickHouse Keeper의 서버 간(interserver) 프로토콜 역시 ZooKeeper와 호환되지 않으므로, ZooKeeper와 ClickHouse Keeper가 혼합된 클러스터는 구성할 수 없습니다.

ClickHouse Keeper는 [ZooKeeper](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#sc_ZooKeeperAccessControl)와 동일한 방식으로 Access Control Lists (ACLs)를 지원합니다. ClickHouse Keeper는 동일한 권한 집합을 지원하며, `world`, `auth`, `digest`와 같은 동일한 기본 스킴(scheme)을 제공합니다. digest 인증 스킴은 `username:password` 쌍을 사용하며, 비밀번호는 Base64로 인코딩됩니다.

:::note
외부 통합은 지원되지 않습니다.
:::

### 구성 \{#configuration\}

ClickHouse Keeper는 ZooKeeper의 독립 실행형 대체품으로 사용할 수도 있고, ClickHouse 서버의 내부 구성 요소로 사용할 수도 있습니다. 두 경우 모두 거의 동일한 `.xml` 구성 파일을 사용합니다.

#### Keeper 구성 설정 \{#keeper-configuration-settings\}

주요 ClickHouse Keeper 구성 태그는 `<keeper_server>`이며, 다음과 같은 매개변수를 가집니다.

| Parameter                            | Description                                                                                                                                                                                                                                         | Default                                                                                                      |
|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `tcp_port`                           | 클라이언트가 연결할 포트입니다.                                                                                                                                                                                                                    | `2181`                                                                                                       |
| `tcp_port_secure`                    | 클라이언트와 keeper-server 간 SSL 연결을 위한 보안 포트입니다.                                                                                                                                                                                     | -                                                                                                            |
| `server_id`                          | 고유한 서버 ID입니다. ClickHouse Keeper 클러스터의 각 노드는 서로 다른 고유 번호(1, 2, 3 등)를 가져야 합니다.                                                                                                                                      | -                                                                                                            |
| `log_storage_path`                   | 조정(coordination) 로그를 저장하는 경로입니다. ZooKeeper와 마찬가지로, 부하가 크지 않은 노드에 로그를 저장하는 것이 좋습니다.                                                                                                                       | -                                                                                                            |
| `snapshot_storage_path`              | 조정 스냅샷을 저장하는 경로입니다.                                                                                                                                                                                                                  | -                                                                                                            |
| `enable_reconfiguration`             | [`reconfig`](#reconfiguration)를 통한 동적 클러스터 재구성을 활성화합니다.                                                                                                                                                                         | `False`                                                                                                      |
| `max_memory_usage_soft_limit`        | Keeper 최대 메모리 사용량에 대한 소프트 한도(바이트)입니다.                                                                                                                                                                                        | `max_memory_usage_soft_limit_ratio` * `physical_memory_amount`                                               |
| `max_memory_usage_soft_limit_ratio`  | `max_memory_usage_soft_limit`가 설정되지 않았거나 0으로 설정된 경우, 기본 소프트 한도를 정의하기 위해 이 값을 사용합니다.                                                                                                                          | `0.9`                                                                                                        |
| `cgroups_memory_observer_wait_time`  | `max_memory_usage_soft_limit`가 설정되지 않았거나 `0`으로 설정된 경우, 물리 메모리 양을 관찰하는 데 사용하는 주기(초)입니다. 메모리 양이 변경되면 `max_memory_usage_soft_limit_ratio`를 사용하여 Keeper의 메모리 소프트 한도를 다시 계산합니다. | `15`                                                                                                         |
| `http_control`                       | [HTTP control](#http-control) 인터페이스의 구성입니다.                                                                                                                                                                                             | -                                                                                                            |
| `digest_enabled`                     | 실시간 데이터 일관성 검사를 활성화합니다.                                                                                                                                                                                                           | `True`                                                                                                       |
| `create_snapshot_on_exit`            | 종료 시 스냅샷을 생성합니다.                                                                                                                                                                                                                       | -                                                                                                            |
| `hostname_checks_enabled`            | 클러스터 구성에 대한 호스트 이름 검증을 활성화합니다(예: `localhost`가 원격 엔드포인트와 함께 사용되는 경우 등).                                                                                                                                 | `True`                                                                                                       |
| `four_letter_word_white_list`        | 4lw 명령에 대한 허용 목록(white list)입니다.                                                                                                                                                                                                       | `conf, cons, crst, envi, ruok, srst, srvr, stat, wchs, dirs, mntr, isro, rcvr, apiv, csnp, lgif, rqld, ydld` |
|`enable_ipv6`| IPv6를 활성화합니다. | `True`|

그 외 공통 매개변수는 ClickHouse 서버 구성(`listen_host`, `logger` 등)에서 상속됩니다.

#### 내부 코디네이션 설정 \{#internal-coordination-settings\}

내부 코디네이션 설정은 `<keeper_server>.<coordination_settings>` 섹션에 있으며, 다음과 같은 파라미터가 있습니다:

| Parameter                          | Description                                                                                                                                                                                                              | Default                                                                                                      |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `operation_timeout_ms`             | 단일 클라이언트 작업에 대한 타임아웃(ms)                                                                                                                                                                                | `10000`                                                                                                      |
| `min_session_timeout_ms`           | 클라이언트 세션의 최소 타임아웃(ms)                                                                                                                                                                                     | `10000`                                                                                                      |
| `session_timeout_ms`               | 클라이언트 세션의 최대 타임아웃(ms)                                                                                                                                                                                     | `100000`                                                                                                     |
| `dead_session_check_period_ms`     | ClickHouse Keeper가 죽은 세션을 검사하고 제거하는 주기(ms)                                                                                                                                                              | `500`                                                                                                        |
| `heart_beat_interval_ms`           | ClickHouse Keeper 리더가 팔로워에게 하트비트(heartbeat)를 전송하는 주기(ms)                                                                                                                                             | `500`                                                                                                        |
| `election_timeout_lower_bound_ms`  | 팔로워가 이 구간 동안 리더로부터 하트비트를 받지 못하면 리더 선출을 시작할 수 있습니다. `election_timeout_upper_bound_ms` 이하여야 합니다. 이상적으로는 두 값이 같지 않아야 합니다.                                    | `1000`                                                                                                       |
| `election_timeout_upper_bound_ms`  | 팔로워가 이 구간 동안 리더로부터 하트비트를 받지 못하면 리더 선출을 시작해야 합니다.                                                                                                                                    | `2000`                                                                                                       |
| `rotate_log_storage_interval`      | 하나의 파일에 저장할 로그 레코드 개수입니다.                                                                                                                                                                            | `100000`                                                                                                     |
| `reserved_log_items`               | 컴팩션 이전에 유지할 코디네이션 로그 레코드 개수입니다.                                                                                                                                                                 | `100000`                                                                                                     |
| `snapshot_distance`                | ClickHouse Keeper가 새 스냅샷을 생성하는 주기(로그에 기록된 레코드 개수 기준)입니다.                                                                                                                                    | `100000`                                                                                                     |
| `snapshots_to_keep`                | 유지할 스냅샷 개수입니다.                                                                                                                                                                                                | `3`                                                                                                          |
| `stale_log_gap`                    | 리더가 팔로워를 오래된(stale) 상태로 간주하고 로그 대신 스냅샷을 전송하기 시작하는 임계값입니다.                                                                                                                        | `10000`                                                                                                      |
| `fresh_log_gap`                    | 노드가 다시 최신(fresh) 상태로 간주되는 시점입니다.                                                                                                                                                                     | `200`                                                                                                        |
| `max_requests_batch_size`          | RAFT로 전송되기 전에 하나의 배치에 포함될 최대 요청 개수입니다.                                                                                                                                                          | `100`                                                                                                        |
| `force_sync`                       | 코디네이션 로그에 대한 각 쓰기 시 `fsync`를 호출합니다.                                                                                                                                                                 | `true`                                                                                                       |
| `quorum_reads`                     | 읽기 요청을 전체 RAFT 합의(컨센서스)를 거치는 쓰기와 동일한 방식으로 실행하여, 유사한 속도로 처리되도록 합니다.                                                                                                       | `false`                                                                                                      |
| `raft_logs_level`                  | 코디네이션에 대한 텍스트 로그 레벨입니다(trace, debug 등).                                                                                                                                                              | `system default`                                                                                             |
| `auto_forwarding`                  | 팔로워가 리더로 쓰기 요청을 전달(forward)할 수 있도록 허용합니다.                                                                                                                                                       | `true`                                                                                                       |
| `shutdown_timeout`                 | 내부 연결이 종료되고 셧다운될 때까지 대기하는 시간(ms)입니다.                                                                                                                                                           | `5000`                                                                                                       |
| `startup_timeout`                  | 서버가 지정된 타임아웃 내에 다른 쿼럼 참가자와 연결되지 않으면 종료되는 시간(ms)입니다.                                                                                                                                | `30000`                                                                                                      |
| `async_replication`                | 비동기 복제를 활성화합니다. 모든 쓰기 및 읽기 보장은 유지하면서 더 나은 성능을 제공합니다. 역호환성을 깨지 않기 위해 기본적으로 비활성화되어 있습니다.                                                                 | `false`                                                                                                      |
| `latest_logs_cache_size_threshold` | 최신 로그 엔트리의 인메모리 캐시 총 최대 크기입니다.                                                                                                                                                                    | `1GiB`                                                                                                       |
| `commit_logs_cache_size_threshold` | 커밋에 다음으로 필요한 로그 엔트리의 인메모리 캐시 총 최대 크기입니다.                                                                                                                                                   | `500MiB`                                                                                                     |
| `disk_move_retries_wait_ms`        | 초기화 여부와 관계없이, 디스크 간에 파일을 이동하는 동안 발생한 실패 이후 재시도 사이에 대기할 시간(ms)입니다.                                                                                                          | `1000`                                                                                                       |
| `disk_move_retries_during_init`    | 초기화 중 디스크 간에 파일을 이동하는 동안 발생한 실패 이후 수행할 재시도 횟수입니다.                                                                                                                                  | `100`                                                                                                        |
| `experimental_use_rocksdb`         | 백엔드 스토리지로 RocksDB를 사용합니다.                                                                                                    | `0`                                                                                                        |

쿼럼 구성은 `<keeper_server>.<raft_configuration>` 섹션에 있으며, 서버에 대한 설명이 포함됩니다.

전체 쿼럼에 대한 유일한 파라미터는 `secure`이며, 쿼럼 참가자 간 통신에 대해 암호화된 연결을 활성화합니다. 노드 간 내부 통신에 SSL 연결이 필요하면 이 파라미터를 `true`로 설정하고, 그렇지 않으면 지정하지 않고 둘 수 있습니다.

각 `<server>`에 대한 주요 파라미터는 다음과 같습니다:

* `id` — 쿼럼 내 서버 식별자입니다.
* `hostname` — 이 서버가 위치한 호스트 이름입니다.
* `port` — 이 서버가 연결을 수신하는 포트입니다.
* `can_become_leader` — 서버를 `learner`로 설정하려면 `false`로 설정합니다. 생략되면 기본값은 `true`입니다.

:::note
ClickHouse Keeper 클러스터의 토폴로지가 변경되는 경우(예: 서버 교체), `server_id`와 `hostname` 간 매핑이 일관되도록 유지하고, 서로 다른 서버에 대해 기존 `server_id`를 섞거나 재사용하지 않도록 하십시오(예: ClickHouse Keeper를 배포하는 자동화 스크립트에 의존하는 경우 발생할 수 있습니다).

Keeper 인스턴스의 호스트가 변경될 수 있는 경우, 순수 IP 주소 대신 호스트 이름을 정의하여 사용하는 것이 좋습니다. 호스트 이름을 변경하는 것은 서버를 제거했다가 다시 추가하는 것과 동일하며, 일부 상황에서는 이를 수행할 수 없는 경우가 있을 수 있습니다(예: 쿼럼을 구성하기에 충분한 Keeper 인스턴스가 없는 경우).
:::

:::note
`async_replication`은 이전 버전과의 호환성을 깨뜨리지 않기 위해 기본적으로 비활성화되어 있습니다. 클러스터의 모든 Keeper 인스턴스가 `async_replication`을 지원하는 버전(v23.9+)을 실행 중인 경우, 이를 활성화할 것을 권장합니다. 활성화하면 부작용 없이 성능을 향상시킬 수 있습니다.
:::

3개의 노드로 쿼럼을 구성하는 설정 예시는 `test_keeper_` 접두사를 사용하는 [integration tests](https://github.com/ClickHouse/ClickHouse/tree/master/tests/integration)에서 확인할 수 있습니다. 1번 서버에 대한 설정 예시는 다음과 같습니다:

```xml
<keeper_server>
    <tcp_port>2181</tcp_port>
    <server_id>1</server_id>
    <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
    <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

    <coordination_settings>
        <operation_timeout_ms>10000</operation_timeout_ms>
        <session_timeout_ms>30000</session_timeout_ms>
        <raft_logs_level>trace</raft_logs_level>
    </coordination_settings>

    <raft_configuration>
        <server>
            <id>1</id>
            <hostname>zoo1</hostname>
            <port>9234</port>
        </server>
        <server>
            <id>2</id>
            <hostname>zoo2</hostname>
            <port>9234</port>
        </server>
        <server>
            <id>3</id>
            <hostname>zoo3</hostname>
            <port>9234</port>
        </server>
    </raft_configuration>
</keeper_server>
```


### 실행 방법 \{#how-to-run\}

ClickHouse Keeper는 ClickHouse 서버 패키지에 함께 포함되어 있으므로, `<keeper_server>` 설정을 `/etc/your_path_to_config/clickhouse-server/config.xml`에 추가한 다음 평소와 같이 ClickHouse 서버를 시작하면 됩니다. 독립 실행형 ClickHouse Keeper를 실행하려는 경우에는 다음과 같이 비슷한 방식으로 시작할 수 있습니다:

```bash
clickhouse-keeper --config /etc/your_path_to_config/config.xml
```

`clickhouse-keeper` 심볼릭 링크가 없다면 해당 링크를 생성하거나 `clickhouse` 명령에 `keeper`를 인수로 지정하십시오.

```bash
clickhouse keeper --config /etc/your_path_to_config/config.xml
```


### Four letter word commands \{#four-letter-word-commands\}

ClickHouse Keeper는 Zookeeper와 거의 동일한 4lw(four-letter word) 명령도 제공합니다. 각 명령은 `mntr`, `stat` 등과 같이 네 글자로 구성됩니다. 몇 가지 유용한 명령이 있습니다. `stat`는 서버와 연결된 클라이언트에 대한 일반적인 정보를 제공하며, `srvr`와 `cons`는 각각 서버와 연결에 대한 보다 상세한 정보를 제공합니다.

4lw 명령에는 `four_letter_word_white_list`라는 화이트리스트 설정이 있으며, 기본값은 `conf,cons,crst,envi,ruok,srst,srvr,stat,wchs,dirs,mntr,isro,rcvr,apiv,csnp,lgif,rqld,ydld`로 설정됩니다.

클라이언트 포트에서 telnet 또는 nc를 사용하여 ClickHouse Keeper에 이러한 명령을 보낼 수 있습니다.

```bash
echo mntr | nc localhost 9181
```

아래는 자세한 4lw 명령입니다:

* `ruok`: 서버가 오류 없이 실행 중인지 테스트합니다. 서버가 실행 중이면 `imok`으로 응답합니다. 그렇지 않으면 전혀 응답하지 않습니다. `imok` 응답이 있다고 해서 반드시 서버가 쿼럼에 참여했다는 뜻은 아니며, 단지 서버 프로세스가 활성 상태이며 지정된 클라이언트 포트에 바인딩되어 있음을 의미합니다. 쿼럼 상태 및 클라이언트 연결 정보에 대한 세부 정보는 「stat」 명령을 사용하여 확인하십시오.

```response
imok
```

* `mntr`: 클러스터의 상태를 모니터링하는 데 사용할 수 있는 변수 목록을 출력합니다.

```response
zk_version      v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
zk_avg_latency  0
zk_max_latency  0
zk_min_latency  0
zk_packets_received     68
zk_packets_sent 68
zk_num_alive_connections        1
zk_outstanding_requests 0
zk_server_state leader
zk_znode_count  4
zk_watch_count  1
zk_ephemerals_count     0
zk_approximate_data_size        723
zk_open_file_descriptor_count   310
zk_max_file_descriptor_count    10240
zk_followers    0
zk_synced_followers     0
```

* `srvr`: 서버에 대한 전체 정보를 출력합니다.

```response
ClickHouse Keeper version: v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
Latency min/avg/max: 0/0/0
Received: 2
Sent : 2
Connections: 1
Outstanding: 0
Zxid: 34
Mode: leader
Node count: 4
```

* `stat`: 서버와 연결된 클라이언트에 대한 간단한 요약 정보를 출력합니다.

```response
ClickHouse Keeper version: v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
Clients:
 192.168.1.1:52852(recved=0,sent=0)
 192.168.1.1:52042(recved=24,sent=48)
Latency min/avg/max: 0/0/0
Received: 4
Sent : 4
Connections: 1
Outstanding: 0
Zxid: 36
Mode: leader
Node count: 4
```

* `srst`: 서버 통계 정보를 초기화합니다. 이 명령은 `srvr`, `mntr`, `stat`의 결과에 영향을 줍니다.

```response
Server stats reset.
```

* `conf`: 현재 사용 중인 설정에 대한 세부 정보를 출력합니다.

```response
server_id=1
tcp_port=2181
four_letter_word_white_list=*
log_storage_path=./coordination/logs
snapshot_storage_path=./coordination/snapshots
max_requests_batch_size=100
session_timeout_ms=30000
operation_timeout_ms=10000
dead_session_check_period_ms=500
heart_beat_interval_ms=500
election_timeout_lower_bound_ms=1000
election_timeout_upper_bound_ms=2000
reserved_log_items=1000000000000000
snapshot_distance=10000
auto_forwarding=true
shutdown_timeout=5000
startup_timeout=240000
raft_logs_level=information
snapshots_to_keep=3
rotate_log_storage_interval=100000
stale_log_gap=10000
fresh_log_gap=200
max_requests_batch_size=100
quorum_reads=false
force_sync=false
compress_logs=true
compress_snapshots_with_zstd_format=true
configuration_change_tries_count=20
```


* `cons`: 이 서버에 연결된 모든 클라이언트의 전체 연결/세션 상세 정보를 나열합니다. 수신/전송된 패킷 수, 세션 ID, 작업 지연 시간, 마지막으로 수행된 작업 등의 정보를 포함합니다.

```response
 192.168.1.1:52163(recved=0,sent=0,sid=0xffffffffffffffff,lop=NA,est=1636454787393,to=30000,lzxid=0xffffffffffffffff,lresp=0,llat=0,minlat=0,avglat=0,maxlat=0)
 192.168.1.1:52042(recved=9,sent=18,sid=0x0000000000000001,lop=List,est=1636454739887,to=30000,lcxid=0x0000000000000005,lzxid=0x0000000000000005,lresp=1636454739892,llat=0,minlat=0,avglat=0,maxlat=0)
```

* `crst`: 모든 연결에 대한 연결/세션 통계를 초기화합니다.

```response
Connection stats reset.
```

* `envi`: 서비스 환경에 대한 자세한 정보를 출력합니다

```response
Environment:
clickhouse.keeper.version=v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
host.name=ZBMAC-C02D4054M.local
os.name=Darwin
os.arch=x86_64
os.version=19.6.0
cpu.count=12
user.name=root
user.home=/Users/JackyWoo/
user.dir=/Users/JackyWoo/project/jd/clickhouse/cmake-build-debug/programs/
user.tmp=/var/folders/b4/smbq5mfj7578f2jzwn602tt40000gn/T/
```

* `dirs`: 스냅샷 및 로그 파일의 전체 크기를 바이트 단위로 표시합니다.

```response
snapshot_dir_size: 0
log_dir_size: 3875
```

* `isro`: 서버가 읽기 전용 모드로 실행 중인지 확인합니다. 서버가 읽기 전용 모드이면 `ro`로, 읽기 전용 모드가 아니면 `rw`로 응답합니다.

```response
rw
```

* `wchs`: 서버에서 설정된 watch들의 요약 정보를 출력합니다.

```response
1 connections watching 1 paths
Total watches:1
```

* `wchc`: 세션별로 서버에 설정된 watch에 대한 상세 정보를 나열합니다. 이 명령은 관련된 watch(경로)와 함께 세션(연결) 목록을 출력합니다. watch 수에 따라 이 명령은 비용이 많이 들 수 있어(서버 성능에 영향을 줄 수 있으므로) 주의해서 사용해야 합니다.

```response
0x0000000000000001
    /clickhouse/task_queue/ddl
```

* `wchp`: 서버의 watch 정보를 경로별로 상세히 나열합니다. 이 명령은 세션이 연결된 경로(znodes) 목록을 출력합니다. watch 수가 많을 경우 이 작업은 비용이 많이 들 수 있으며(즉, 서버 성능에 영향을 줄 수 있으므로) 주의해서 사용하십시오.

```response
/clickhouse/task_queue/ddl
    0x0000000000000001
```

* `dump`: 활성 세션과 ephemeral 노드를 나열합니다. 리더 노드에서만 동작합니다.

```response
Sessions dump (2):
0x0000000000000001
0x0000000000000002
Sessions with Ephemerals (1):
0x0000000000000001
 /clickhouse/task_queue/ddl
```

* `csnp`: 스냅샷 생성 작업을 예약합니다. 성공하면 예약된 스냅샷의 마지막 커밋된 로그 인덱스를 반환하고, 실패하면 `Failed to schedule snapshot creation task.` 오류 메시지를 반환합니다. 스냅샷 완료 여부는 `lgif` 명령으로 확인할 수 있습니다.

```response
100
```

* `lgif`: Keeper 로그 정보입니다. `first_log_idx` : 로그 저장소에서의 첫 번째 로그 인덱스; `first_log_term` : 첫 번째 로그 term; `last_log_idx` : 로그 저장소에서의 마지막 로그 인덱스; `last_log_term` : 마지막 로그 term; `last_committed_log_idx` : 상태 머신에서 마지막으로 커밋된 로그 인덱스; `leader_committed_log_idx` : 이 노드 관점에서 본 리더의 커밋된 로그 인덱스; `target_committed_log_idx` : 커밋되어야 하는 목표 로그 인덱스; `last_snapshot_idx` : 마지막 스냅샷에서 커밋된 로그 인덱스 중 가장 큰 값입니다.

```response
first_log_idx   1
first_log_term  1
last_log_idx    101
last_log_term   1
last_committed_log_idx  100
leader_committed_log_idx    101
target_committed_log_idx    101
last_snapshot_idx   50
```


* `rqld`: 새 리더가 되도록 요청합니다. 요청이 전송되면 `Sent leadership request to leader.` 를 반환하고, 요청이 전송되지 않으면 `Failed to send leadership request to leader.` 를 반환합니다. 노드가 이미 리더인 경우에도 요청이 전송된 것으로 간주되어 결과는 동일합니다.

```response
Sent leadership request to leader.
```

* `ftfl`: 모든 feature flag와 각 flag가 해당 Keeper 인스턴스에서 활성화되어 있는지 여부를 나열합니다.

```response
filtered_list   1
multi_read  1
check_not_exists    0
```

* `ydld`: 리더십을 양도하고 follower가 되도록 요청합니다. 이 요청을 받은 서버가 leader인 경우, 먼저 쓰기 작업을 일시 중지하고, 후임자(현재 leader는 후임자가 될 수 없음)가 최신 로그를 모두 따라잡을 때까지 대기한 뒤 사임합니다. 후임자는 자동으로 선택됩니다. 요청이 전송되면 `Sent yield leadership request to leader.` 를 반환하고, 요청이 전송되지 못하면 `Failed to send yield leadership request to leader.` 를 반환합니다. 노드가 이미 follower인 경우에도, 요청이 전송된 것으로 간주되어 결과는 동일합니다.

```response
Sent yield leadership request to leader.
```

* `pfev`: 수집된 모든 이벤트의 값을 반환합니다. 각 이벤트에 대해 이벤트 이름, 이벤트 값, 이벤트 설명을 반환합니다.

```response
FileOpen        62      Number of files opened.
Seek    4       Number of times the 'lseek' function was called.
ReadBufferFromFileDescriptorRead        126     Number of reads (read/pread) from a file descriptor. Does not include sockets.
ReadBufferFromFileDescriptorReadFailed  0       Number of times the read (read/pread) from a file descriptor have failed.
ReadBufferFromFileDescriptorReadBytes   178846  Number of bytes read from file descriptors. If the file is compressed, this will show the compressed data size.
WriteBufferFromFileDescriptorWrite      7       Number of writes (write/pwrite) to a file descriptor. Does not include sockets.
WriteBufferFromFileDescriptorWriteFailed        0       Number of times the write (write/pwrite) to a file descriptor have failed.
WriteBufferFromFileDescriptorWriteBytes 153     Number of bytes written to file descriptors. If the file is compressed, this will show compressed data size.
FileSync        2       Number of times the F_FULLFSYNC/fsync/fdatasync function was called for files.
DirectorySync   0       Number of times the F_FULLFSYNC/fsync/fdatasync function was called for directories.
FileSyncElapsedMicroseconds     12756   Total time spent waiting for F_FULLFSYNC/fsync/fdatasync syscall for files.
DirectorySyncElapsedMicroseconds        0       Total time spent waiting for F_FULLFSYNC/fsync/fdatasync syscall for directories.
ReadCompressedBytes     0       Number of bytes (the number of bytes before decompression) read from compressed sources (files, network).
CompressedReadBufferBlocks      0       Number of compressed blocks (the blocks of data that are compressed independent of each other) read from compressed sources (files, network).
CompressedReadBufferBytes       0       Number of uncompressed bytes (the number of bytes after decompression) read from compressed sources (files, network).
AIOWrite        0       Number of writes with Linux or FreeBSD AIO interface
AIOWriteBytes   0       Number of bytes written with Linux or FreeBSD AIO interface
...
```


### HTTP 제어 \{#http-control\}

ClickHouse Keeper는 레플리카가 트래픽을 수신할 준비가 되었는지 확인하기 위한 HTTP 인터페이스를 제공합니다. 이는 [Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes)와 같은 클라우드 환경에서 사용할 수 있습니다.

`/ready` 엔드포인트를 활성화하는 구성 예시는 다음과 같습니다.

```xml
<clickhouse>
    <keeper_server>
        <http_control>
            <port>9182</port>
            <readiness>
                <endpoint>/ready</endpoint>
            </readiness>
        </http_control>
    </keeper_server>
</clickhouse>
```


### 기능 플래그 \{#feature-flags\}

Keeper는 ZooKeeper 및 해당 클라이언트와 완전히 호환되지만, ClickHouse 클라이언트에서 사용할 수 있는 고유한 기능과 요청 유형도 제공합니다.
이러한 기능은 이전 버전과 호환되지 않는 변경을 유발할 수 있으므로, 대부분은 기본적으로 비활성화되어 있으며 `keeper_server.feature_flags` 설정으로 활성화할 수 있습니다.
모든 기능은 명시적으로 비활성화할 수 있습니다.
Keeper 클러스터에서 새 기능을 사용하려는 경우, 먼저 클러스터의 모든 Keeper 인스턴스를 해당 기능을 지원하는 버전으로 업데이트한 다음 기능 자체를 활성화할 것을 권장합니다.

`multi_read`를 비활성화하고 `check_not_exists`를 활성화하는 기능 플래그 설정 예는 다음과 같습니다:

```xml
<clickhouse>
    <keeper_server>
        <feature_flags>
            <multi_read>0</multi_read>
            <check_not_exists>1</check_not_exists>
        </feature_flags>
    </keeper_server>
</clickhouse>
```

다음 기능을 사용할 수 있습니다:

| Feature                | Description                                                                                     | Default |
| ---------------------- | ----------------------------------------------------------------------------------------------- | ------- |
| `multi_read`           | 여러 개의 읽기 요청을 지원합니다.                                                                             | `1`     |
| `filtered_list`        | 노드 유형(임시 노드 또는 영구 노드)에 따라 결과를 필터링하는 목록(list) 요청을 지원합니다.                                         | `1`     |
| `check_not_exists`     | 노드가 존재하지 않음을 확인하는 `CheckNotExists` 요청을 지원합니다.                                                   | `1`     |
| `create_if_not_exists` | 노드가 존재하지 않을 경우 생성을 시도하는 `CreateIfNotExists` 요청을 지원합니다. 노드가 이미 존재하면 아무 변경도 적용되지 않고 `ZOK`가 반환됩니다. | `1`     |
| `remove_recursive`     | 노드와 해당 서브트리를 함께 제거하는 `RemoveRecursive` 요청을 지원합니다.                                               | `1`     |

:::note
일부 기능 플래그는 25.7 버전부터 기본적으로 활성화됩니다.
Keeper를 25.7+ 버전으로 업그레이드하는 권장 방법은 먼저 24.9+ 버전으로 업그레이드한 후 진행하는 것입니다.
:::


### ZooKeeper에서 마이그레이션 \{#migration-from-zookeeper\}

ZooKeeper에서 ClickHouse Keeper로 중단 없이 매끄럽게 마이그레이션하는 것은 불가능합니다. ZooKeeper 클러스터를 중지하고, 데이터를 변환한 뒤, ClickHouse Keeper를 시작해야 합니다. `clickhouse-keeper-converter` 도구를 사용하면 ZooKeeper 로그와 스냅샷을 ClickHouse Keeper 스냅샷으로 변환할 수 있습니다. 이 도구는 ZooKeeper &gt; 3.4 버전에서만 작동합니다. 마이그레이션 절차는 다음과 같습니다.

1. 모든 ZooKeeper 노드를 중지합니다.

2. 선택 사항이지만 권장됨: ZooKeeper 리더 노드를 찾은 후, 해당 노드를 다시 시작했다가 중지합니다. 이렇게 하면 ZooKeeper가 일관된 스냅샷을 생성하도록 강제할 수 있습니다.

3. 리더 노드에서 `clickhouse-keeper-converter` 를 실행합니다. 예를 들어:

```bash
clickhouse-keeper-converter --zookeeper-logs-dir /var/lib/zookeeper/version-2 --zookeeper-snapshots-dir /var/lib/zookeeper/version-2 --output-dir /path/to/clickhouse/keeper/snapshots
```

4. 스냅샷을 `keeper`가 설정된 ClickHouse 서버 노드로 복사하거나, ZooKeeper 대신 ClickHouse Keeper를 시작합니다. 스냅샷은 모든 노드에 존재해야 하며, 그렇지 않으면 비어 있는 노드가 더 빨리 시작되어 그중 하나가 리더가 될 수 있습니다.

:::note
`keeper-converter` 도구는 Keeper 단독 바이너리에서는 사용할 수 없습니다.
ClickHouse가 설치되어 있는 경우, 해당 바이너리를 직접 사용할 수 있습니다:

```bash
clickhouse keeper-converter ...
```

그 밖의 경우에는 [바이너리를 다운로드](/getting-started/quick-start/oss#download-the-binary)하여 ClickHouse를 설치하지 않고도 위에서 설명한 대로 도구를 실행할 수 있습니다.
:::


### 정족수(quorum) 손실 후 복구 \{#recovering-after-losing-quorum\}

ClickHouse Keeper는 Raft를 사용하므로 클러스터 크기에 따라 일정 개수의 노드 장애를 허용합니다. \
예를 들어 3노드 클러스터에서는 1개 노드에만 장애가 발생한 경우 정상적으로 동작을 계속합니다.

클러스터 설정은 동적으로 조정할 수 있지만, 몇 가지 제약 사항이 있습니다. 재구성 또한 Raft에 의존하므로
클러스터에서 노드를 추가/제거하려면 정족수가 필요합니다. 클러스터의 노드를 너무 많이 동시에 잃고
다시 시작할 수 있는 가능성이 전혀 없다면, Raft는 동작을 중단하며 일반적인 방식으로 클러스터를 재구성하는 것을 허용하지 않습니다.

하지만 ClickHouse Keeper에는 복구 모드가 있어서, 단 1개의 노드만으로 클러스터를 강제로 재구성할 수 있습니다.
이는 노드를 다시 시작할 수 없거나, 동일한 엔드포인트에서 새 인스턴스를 시작할 수 없는 경우에만 최후의 수단으로 수행해야 합니다.

계속 진행하기 전에 다음 사항을 유의하십시오.

- 장애가 발생한 노드가 다시 클러스터에 연결될 수 없는지 확인합니다.
- 아래 단계에서 명시되기 전까지는 새로운 노드 중 어떤 것도 시작하지 않습니다.

위 조건들이 충족되는지 확인한 후, 다음을 수행합니다.

1. 새 리더가 될 Keeper 노드 하나를 선택합니다. 해당 노드의 데이터가 전체 클러스터에 사용되므로, 가장 최신 상태를 가진 노드를 사용하는 것이 좋습니다.
2. 다른 작업을 하기 전에, 선택한 노드의 `log_storage_path` 및 `snapshot_storage_path` 폴더를 백업합니다.
3. 사용하려는 모든 노드에서 클러스터 설정을 재구성합니다.
4. 선택한 노드에 네 글자 명령 `rcvr`를 전송하여 해당 노드를 복구 모드로 전환하거나, 선택한 노드에서 Keeper 인스턴스를 중지한 뒤 `--force-recovery` 인자를 사용하여 다시 시작합니다.
5. 새 노드에서 Keeper 인스턴스를 하나씩 순차적으로 시작하고, 다음 노드를 시작하기 전에 `mntr`에서 `zk_server_state`가 `follower`를 반환하는지 확인합니다.
6. 복구 모드에서는, 리더 노드는 새로운 노드들과 정족수를 달성할 때까지 `mntr` 명령에 대해 오류 메시지를 반환하며, 클라이언트와 follower로부터 오는 모든 요청을 거부합니다.
7. 정족수가 달성되면 리더 노드는 정상 동작 모드로 돌아가며, 모든 요청을 수락합니다. Raft 기준으로 `mntr`로 검증했을 때 `zk_server_state`가 `leader`를 반환해야 합니다.

## Keeper에서 디스크 사용하기 \{#using-disks-with-keeper\}

Keeper는 스냅샷, 로그 파일 및 상태 파일(state file)을 저장하기 위해 [외부 디스크](/operations/storing-data.md) 유형 중 일부를 지원합니다.

지원되는 디스크 유형은 다음과 같습니다:

* s3&#95;plain
* s3
* local

다음은 구성 파일(config)에 포함되는 디스크 정의의 예시입니다.

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <log_local>
                <type>local</type>
                <path>/var/lib/clickhouse/coordination/logs/</path>
            </log_local>
            <log_s3_plain>
                <type>s3_plain</type>
                <endpoint>https://some_s3_endpoint/logs/</endpoint>
                <access_key_id>ACCESS_KEY</access_key_id>
                <secret_access_key>SECRET_KEY</secret_access_key>
            </log_s3_plain>
            <snapshot_local>
                <type>local</type>
                <path>/var/lib/clickhouse/coordination/snapshots/</path>
            </snapshot_local>
            <snapshot_s3_plain>
                <type>s3_plain</type>
                <endpoint>https://some_s3_endpoint/snapshots/</endpoint>
                <access_key_id>ACCESS_KEY</access_key_id>
                <secret_access_key>SECRET_KEY</secret_access_key>
            </snapshot_s3_plain>
            <state_s3_plain>
                <type>s3_plain</type>
                <endpoint>https://some_s3_endpoint/state/</endpoint>
                <access_key_id>ACCESS_KEY</access_key_id>
                <secret_access_key>SECRET_KEY</secret_access_key>
            </state_s3_plain>
        </disks>
    </storage_configuration>
</clickhouse>
```

로그용 디스크를 사용하려면 `keeper_server.log_storage_disk` 설정을 디스크 이름으로 설정해야 합니다.
스냅샷용 디스크를 사용하려면 `keeper_server.snapshot_storage_disk` 설정을 디스크 이름으로 설정해야 합니다.
또한 `keeper_server.latest_log_storage_disk` 및 `keeper_server.latest_snapshot_storage_disk`를 각각 사용하여 최신 로그 또는 스냅샷에 서로 다른 디스크를 사용할 수 있습니다.
이 경우 새로운 로그 또는 스냅샷이 생성될 때 Keeper가 파일을 올바른 디스크로 자동으로 이동합니다.
상태 파일(state file)을 디스크에 저장하려면 `keeper_server.state_storage_disk` 설정을 디스크 이름으로 설정해야 합니다.

디스크 간에 파일을 이동하는 작업은 안전하며, 전송 중간에 Keeper가 중지되더라도 데이터가 손실될 위험은 없습니다.
파일이 새 디스크로 완전히 이동할 때까지는 기존 디스크에서 삭제되지 않습니다.

`keeper_server.coordination_settings.force_sync`가 `true`(`true`가 기본값)로 설정된 Keeper는 모든 종류의 디스크에 대해 동일한 보장을 제공할 수 없습니다.
현재는 `local` 타입의 디스크만 영구 동기화(persistent sync)를 지원합니다.
`force_sync`를 사용하는 경우, `latest_log_storage_disk`를 사용하지 않는다면 `log_storage_disk`는 반드시 `local` 디스크여야 합니다.
`latest_log_storage_disk`를 사용하는 경우에는 항상 `local` 디스크여야 합니다.
`force_sync`가 비활성화된 경우에는 어떤 구성에서도 모든 타입의 디스크를 사용할 수 있습니다.

Keeper 인스턴스에 대한 가능한 스토리지 구성 예시는 다음과 같습니다:

```xml
<clickhouse>
    <keeper_server>
        <log_storage_disk>log_s3_plain</log_storage_disk>
        <latest_log_storage_disk>log_local</latest_log_storage_disk>

        <snapshot_storage_disk>snapshot_s3_plain</snapshot_storage_disk>
        <latest_snapshot_storage_disk>snapshot_local</latest_snapshot_storage_disk>
    </keeper_server>
</clickhouse>
```

이 인스턴스는 최신 로그를 제외한 모든 로그를 `log_s3_plain` 디스크에 저장하고, 최신 로그는 `log_local` 디스크에 저장합니다.
스냅샷도 마찬가지로 최신 스냅샷을 제외한 모든 스냅샷은 `snapshot_s3_plain` 디스크에 저장되고, 최신 스냅샷은 `snapshot_local` 디스크에 저장됩니다.


### 디스크 설정 변경 \{#changing-disk-setup\}

:::important
새 디스크 설정을 적용하기 전에 모든 Keeper 로그와 스냅샷을 수동으로 백업하십시오.
:::

계층형 디스크 설정(최신 파일에 대해 별도의 디스크를 사용하는 방식)이 정의되어 있는 경우 Keeper는 시작 시 파일을 올바른 디스크로 자동으로 이동하려고 시도합니다.
이전과 동일한 보장이 적용되며, 파일이 새 디스크로 완전히 이동하기 전에는 기존 디스크에서 삭제되지 않으므로 여러 번 재시작해도 안전합니다.

완전히 새로운 디스크로 파일을 이동해야 하거나(또는 2개 디스크 설정에서 단일 디스크 설정으로 전환해야 하는 경우) `keeper_server.old_snapshot_storage_disk` 및 `keeper_server.old_log_storage_disk`를 여러 번 정의하여 사용할 수 있습니다.

다음 설정 예시는 기존의 2개 디스크 설정에서 완전히 새로운 단일 디스크 설정으로 전환하는 방법을 보여줍니다:

```xml
<clickhouse>
    <keeper_server>
        <old_log_storage_disk>log_local</old_log_storage_disk>
        <old_log_storage_disk>log_s3_plain</old_log_storage_disk>
        <log_storage_disk>log_local2</log_storage_disk>

        <old_snapshot_storage_disk>snapshot_s3_plain</old_snapshot_storage_disk>
        <old_snapshot_storage_disk>snapshot_local</old_snapshot_storage_disk>
        <snapshot_storage_disk>snapshot_local2</snapshot_storage_disk>
    </keeper_server>
</clickhouse>
```

시작 시 모든 로그 파일은 `log_local` 및 `log_s3_plain`에서 `log_local2` 디스크로 이동됩니다.
또한 모든 스냅샷 파일은 `snapshot_local` 및 `snapshot_s3_plain`에서 `snapshot_local2` 디스크로 이동됩니다.


## 로그 캐시 구성 \{#configuring-logs-cache\}

디스크에서 읽는 데이터 양을 최소화하기 위해 Keeper는 로그 엔트리를 메모리에 캐시합니다.
요청 크기가 큰 경우 로그 엔트리가 너무 많은 메모리를 사용하게 되므로, 캐시되는 로그 양에는 상한이 있습니다.
이 한도는 다음 두 설정으로 제어합니다:

- `latest_logs_cache_size_threshold` - 캐시에 저장되는 최신 로그의 총 크기
- `commit_logs_cache_size_threshold` - 다음에 커밋해야 하는 이후 로그의 총 크기

기본값이 너무 크면 이 두 설정값을 줄여 메모리 사용량을 줄일 수 있습니다.

:::note
각 캐시와 파일에서 읽은 로그의 양은 `pfev` 명령으로 확인할 수 있습니다.
또한 Prometheus 엔드포인트의 메트릭을 사용하여 두 캐시의 현재 크기를 추적할 수 있습니다.
:::

## Prometheus \{#prometheus\}

Keeper는 [Prometheus](https://prometheus.io)가 스크레이핑할 수 있도록 메트릭 데이터를 노출할 수 있습니다.

설정:

* `endpoint` – Prometheus 서버가 메트릭을 스크레이핑하기 위한 HTTP 엔드포인트입니다. 「/」로 시작해야 합니다.
* `port` – `endpoint`에 사용할 포트입니다.
* `metrics` – [system.metrics](/operations/system-tables/metrics) 테이블의 메트릭을 노출하도록 설정하는 플래그입니다.
* `events` – [system.events](/operations/system-tables/events) 테이블의 메트릭을 노출하도록 설정하는 플래그입니다.
* `asynchronous_metrics` – [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) 테이블의 현재 메트릭 값을 노출하도록 설정하는 플래그입니다.

**예시**

```xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <!-- highlight-start -->
    <prometheus>
        <endpoint>/metrics</endpoint>
        <port>9363</port>
        <metrics>true</metrics>
        <events>true</events>
        <asynchronous_metrics>true</asynchronous_metrics>
    </prometheus>
    <!-- highlight-end -->
</clickhouse>
```

다음을 확인하십시오 (`127.0.0.1`를 ClickHouse 서버의 IP 주소 또는 호스트 이름으로 바꾸십시오):

```bash
curl 127.0.0.1:9363/metrics
```

ClickHouse Cloud [Prometheus 통합](/integrations/prometheus)도 참고하십시오.


## ClickHouse Keeper 사용자 가이드 \{#clickhouse-keeper-user-guide\}

이 가이드는 ClickHouse Keeper를 구성하기 위한 단순하고 최소한의 설정과, 분산 연산을 테스트하는 예제를 제공합니다. 이 예제에서는 Linux 환경에서 3개의 노드를 사용합니다.

### 1. Keeper 설정으로 노드 구성하기 \{#1-configure-nodes-with-keeper-settings\}

1. 3대의 호스트(`chnode1`, `chnode2`, `chnode3`)에 3개의 ClickHouse 인스턴스를 설치합니다. (ClickHouse 설치 방법에 대한 자세한 내용은 [빠른 시작](/getting-started/install/install.mdx)을 참조하십시오.)

2. 각 노드마다 네트워크 인터페이스를 통해 외부와 통신할 수 있도록 다음 설정을 추가합니다.
   ```xml
   <listen_host>0.0.0.0</listen_host>
   ```

3. 다음 ClickHouse Keeper 설정을 세 대의 모든 서버에 추가하고, 각 서버에 맞게 `<server_id>` SETTING 값을 변경하십시오. 예를 들어 `chnode1`에는 `1`, `chnode2`에는 `2`를 설정합니다.

   ```xml
   <keeper_server>
       <tcp_port>9181</tcp_port>
       <server_id>1</server_id>
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
               <hostname>chnode1.domain.com</hostname>
               <port>9234</port>
           </server>
           <server>
               <id>2</id>
               <hostname>chnode2.domain.com</hostname>
               <port>9234</port>
           </server>
           <server>
               <id>3</id>
               <hostname>chnode3.domain.com</hostname>
               <port>9234</port>
           </server>
       </raft_configuration>
   </keeper_server>
   ```

   위에서 사용한 기본 설정은 다음과 같습니다.

   | Parameter                 | Description                                | Example                            |
   | ------------------------- | ------------------------------------------ | ---------------------------------- |
   | tcp&#95;port              | Keeper 클라이언트가 사용할 포트                       | 기본값 9181 (ZooKeeper의 2181과 동일한 역할) |
   | server&#95;id             | Raft 구성에서 사용되는 각 ClickHouse Keeper 서버의 식별자 | 1                                  |
   | coordination&#95;settings | 타임아웃 등 관련 매개변수를 정의하는 섹션                    | timeouts: 10000, log level: trace  |
   | server                    | 참여하는 서버에 대한 정의                             | 각 서버 정의 목록                         |
   | raft&#95;configuration    | Keeper 클러스터의 각 서버에 대한 설정                   | 각 서버와 그 설정                         |
   | id                        | Keeper 서비스용 서버의 숫자 ID                      | 1                                  |
   | hostname                  | Keeper 클러스터의 각 서버에 대한 호스트명, IP 또는 FQDN     | `chnode1.domain.com`               |
   | port                      | 서버 간 Keeper 연결을 수신 대기할 포트                  | 9234                               |

4. Zookeeper 컴포넌트를 활성화합니다. 해당 컴포넌트는 ClickHouse Keeper 엔진을 사용합니다.

   ```xml
       <zookeeper>
           <node>
               <host>chnode1.domain.com</host>
               <port>9181</port>
           </node>
           <node>
               <host>chnode2.domain.com</host>
               <port>9181</port>
           </node>
           <node>
               <host>chnode3.domain.com</host>
               <port>9181</port>
           </node>
       </zookeeper>
   ```

   위에서 사용한 기본 설정은 다음과 같습니다.

   | Parameter | Description                                | Example              |
   | --------- | ------------------------------------------ | -------------------- |
   | node      | ClickHouse Keeper 연결용 노드 목록                | 각 서버에 대한 settings 항목 |
   | host      | 각 ClickHouse Keeper 노드의 호스트 이름, IP 또는 FQDN | `chnode1.domain.com` |
   | port      | ClickHouse Keeper 클라이언트 포트                 | 9181                 |

5. ClickHouse를 다시 시작한 후 각 Keeper 인스턴스가 실행 중인지 확인합니다. 각 서버에서 다음 명령을 실행하십시오. Keeper가 실행 중이고 상태가 정상이면 `ruok` 명령은 `imok`를 반환합니다:
   ```bash
   # echo ruok | nc localhost 9181; echo
   imok
   ```

6. `system` 데이터베이스에는 ClickHouse Keeper 인스턴스의 세부 정보를 담고 있는 `zookeeper` 테이블이 있습니다. 이 테이블을 조회해 보겠습니다:`

   ```sql
   SELECT *
   FROM system.zookeeper
   WHERE path IN ('/', '/clickhouse')
   ```

   테이블은 다음과 같습니다.

   ```response
   ┌─name───────┬─value─┬─czxid─┬─mzxid─┬───────────────ctime─┬───────────────mtime─┬─version─┬─cversion─┬─aversion─┬─ephemeralOwner─┬─dataLength─┬─numChildren─┬─pzxid─┬─path────────┐
   │ clickhouse │       │   124 │   124 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        2 │        0 │              0 │          0 │           2 │  5693 │ /           │
   │ task_queue │       │   125 │   125 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        1 │        0 │              0 │          0 │           1 │   126 │ /clickhouse │
   │ tables     │       │  5693 │  5693 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        3 │        0 │              0 │          0 │           3 │  6461 │ /clickhouse │
   └────────────┴───────┴───────┴───────┴─────────────────────┴─────────────────────┴─────────┴──────────┴──────────┴────────────────┴────────────┴─────────────┴───────┴─────────────┘
   ```

### 2.  ClickHouse에서 클러스터 구성 \{#2--configure-a-cluster-in-clickhouse\}

1. 2개의 노드에 2개의 세그먼트를 구성하고 각 노드에는 레플리카 1개만 두는 단순한 클러스터를 구성합니다. 세 번째 노드는 ClickHouse Keeper의 요구 사항인 쿼럼을 달성하는 데 사용됩니다. `chnode1` 및 `chnode2`의 설정을 업데이트하십시오. 다음 클러스터는 각 노드에 1개의 세그먼트를 정의하여 총 2개의 세그먼트를 가지며, 복제는 없습니다. 이 예제에서는 일부 데이터는 한 노드에, 나머지 일부는 다른 노드에 저장됩니다:
    ```xml
        <remote_servers>
            <cluster_2S_1R>
                <shard>
                    <replica>
                        <host>chnode1.domain.com</host>
                        <port>9000</port>
                        <user>default</user>
                        <password>ClickHouse123!</password>
                    </replica>
                </shard>
                <shard>
                    <replica>
                        <host>chnode2.domain.com</host>
                        <port>9000</port>
                        <user>default</user>
                        <password>ClickHouse123!</password>
                    </replica>
                </shard>
            </cluster_2S_1R>
        </remote_servers>
    ```

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |shard   |클러스터 정의에서 세그먼트 목록|각 세그먼트에 대한 레플리카 목록|
    |replica|각 레플리카에 대한 설정 목록|각 레플리카에 대한 설정 항목|
    |host|레플리카 세그먼트를 호스트할 서버의 호스트 이름, IP 또는 FQDN|`chnode1.domain.com`|
    |port|네이티브 TCP 프로토콜을 사용해 통신하는 데 사용되는 포트|9000|
    |user|클러스터 인스턴스에 인증하는 데 사용되는 사용자 이름|default|
    |password|클러스터 인스턴스에 대한 연결을 허용하도록 정의된 사용자의 비밀번호|`ClickHouse123!`|

2. ClickHouse를 재시작하고 클러스터가 생성되었는지 확인합니다:
    ```bash
    SHOW clusters;
    ```

    클러스터가 다음과 같이 표시되어야 합니다:
    ```response
    ┌─cluster───────┐
    │ cluster_2S_1R │
    └───────────────┘
    ```

### 3. 분산 테이블 생성 및 테스트 \{#3-create-and-test-distributed-table\}

1.  `chnode1`에서 ClickHouse client를 사용하여 새 클러스터에 새 데이터베이스를 생성합니다. `ON CLUSTER` 절은 자동으로 두 노드 모두에 데이터베이스를 생성합니다.
    ```sql
    CREATE DATABASE db1 ON CLUSTER 'cluster_2S_1R';
    ```

2. `db1` 데이터베이스에 새 테이블을 생성합니다. 마찬가지로 `ON CLUSTER` 절이 테이블을 두 노드 모두에 생성합니다.
    ```sql
    CREATE TABLE db1.table1 on cluster 'cluster_2S_1R'
    (
        `id` UInt64,
        `column1` String
    )
    ENGINE = MergeTree
    ORDER BY column1
    ```

3. `chnode1` 노드에서 몇 개의 행을 추가합니다:
    ```sql
    INSERT INTO db1.table1
        (id, column1)
    VALUES
        (1, 'abc'),
        (2, 'def')
    ```

4. `chnode2` 노드에도 몇 개의 행을 추가합니다:
    ```sql
    INSERT INTO db1.table1
        (id, column1)
    VALUES
        (3, 'ghi'),
        (4, 'jkl')
    ```

5. 각 노드에서 `SELECT` 쿼리를 실행하면 해당 노드의 데이터만 표시됩니다. 예를 들어 `chnode1`에서:
    ```sql
    SELECT *
    FROM db1.table1
    ```

    ```response
    쿼리 ID: 7ef1edbc-df25-462b-a9d4-3fe6f9cb0b6d

    ┌─id─┬─column1─┐
    │  1 │ abc     │
    │  2 │ def     │
    └────┴─────────┘

    2개의 행이 있습니다. 경과 시간: 0.006초.
    ```

    `chnode2`에서:
6.
    ```sql
    SELECT *
    FROM db1.table1
    ```

    ```response
    쿼리 ID: c43763cc-c69c-4bcc-afbe-50e764adfcbf

    ┌─id─┬─column1─┐
    │  3 │ ghi     │
    │  4 │ jkl     │
    └────┴─────────┘
    ```

6. 두 세그먼트의 데이터를 표현하는 `Distributed` 테이블을 생성할 수 있습니다. `Distributed` 테이블 엔진을 사용하는 테이블은 자체적으로는 어떤 데이터도 저장하지 않지만, 여러 서버에 걸쳐 분산 쿼리 처리를 할 수 있도록 합니다. 읽기는 모든 세그먼트에 대해 수행되며, 쓰기는 세그먼트들 사이에 분산될 수 있습니다. `chnode1`에서 다음 쿼리를 실행합니다:
    ```sql
    CREATE TABLE db1.dist_table (
        id UInt64,
        column1 String
    )
    ENGINE = Distributed(cluster_2S_1R,db1,table1)
    ```

7. `dist_table`을 쿼리하면 두 세그먼트에서 가져온 네 개의 행이 모두 반환되는 것을 확인할 수 있습니다:
    ```sql
    SELECT *
    FROM db1.dist_table
    ```

    ```response
    쿼리 ID: 495bffa0-f849-4a0c-aeea-d7115a54747a

    ┌─id─┬─column1─┐
    │  1 │ abc     │
    │  2 │ def     │
    └────┴─────────┘
    ┌─id─┬─column1─┐
    │  3 │ ghi     │
    │  4 │ jkl     │
    └────┴─────────┘

    4개의 행이 있습니다. 경과 시간: 0.018초.
    ```

### 요약 \{#summary\}

이 가이드는 ClickHouse Keeper를 사용하여 클러스터를 설정하는 방법을 보여줍니다. ClickHouse Keeper를 사용하면 클러스터를 구성하고 여러 세그먼트에 걸쳐 복제되는 분산 테이블을 정의할 수 있습니다.

## 고유한 경로를 사용하여 ClickHouse Keeper 구성하기 \{#configuring-clickhouse-keeper-with-unique-paths\}

<SelfManaged />

### 설명 \{#description\}

이 문서는 내장 `{uuid}` 매크로 설정을 사용하여
ClickHouse Keeper 또는 ZooKeeper에 고유한 엔트리를 생성하는 방법을 설명합니다. 고유한
경로를 사용하면 테이블을 자주 생성 및 삭제할 때 유리합니다. 경로가 생성될 때마다 해당 경로에
새로운 `uuid`가 사용되므로, Keeper 가비지 컬렉션이 경로 엔트리를
제거할 때까지 몇 분씩 대기할 필요가 없으며, 경로는 재사용되지 않습니다.

### 예시 환경 \{#example-environment\}

3개의 노드로 구성된 클러스터로, 세 노드 모두에 ClickHouse Keeper를
구성하고 이 중 두 노드에는 ClickHouse를 구성합니다. 이렇게 하면
ClickHouse Keeper는 타이브레이커 노드를 포함한 3개의 노드에서 동작하며,
2개의 레플리카로 구성된 하나의 ClickHouse 세그먼트를 갖게 됩니다.

| node                    | description                   |
| ----------------------- | ----------------------------- |
| `chnode1.marsnet.local` | 데이터 노드 - 클러스터 `cluster_1S_2R` |
| `chnode2.marsnet.local` | 데이터 노드 - 클러스터 `cluster_1S_2R` |
| `chnode3.marsnet.local` | ClickHouse Keeper 타이브레이커 노드   |

클러스터 예시 설정:

```xml
    <remote_servers>
        <cluster_1S_2R>
            <shard>
                <replica>
                    <host>chnode1.marsnet.local</host>
                    <port>9440</port>
                    <user>default</user>
                    <password>ClickHouse123!</password>
                    <secure>1</secure>
                </replica>
                <replica>
                    <host>chnode2.marsnet.local</host>
                    <port>9440</port>
                    <user>default</user>
                    <password>ClickHouse123!</password>
                    <secure>1</secure>
                </replica>
            </shard>
        </cluster_1S_2R>
    </remote_servers>
```


### `{uuid}`를 사용하도록 테이블을 설정하는 절차 \{#procedures-to-set-up-tables-to-use-uuid\}

1. 각 서버에 Macros를 설정합니다.
   서버 1의 예:

```xml
    <macros>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
```

:::note
여기서는 `shard`와 `replica` 매크로는 정의하지만 `{uuid}`는 정의하지 않습니다. `{uuid}`는 이미 내장되어 있으므로 별도로 정의할 필요가 없습니다.
:::

2. 데이터베이스 생성

```sql
CREATE DATABASE db_uuid
      ON CLUSTER 'cluster_1S_2R'
      ENGINE Atomic;
```

```response
CREATE DATABASE db_uuid ON CLUSTER cluster_1S_2R
ENGINE = Atomic

Query id: 07fb7e65-beb4-4c30-b3ef-bd303e5c42b5

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

3. 매크로와 `{uuid}`를 사용하여 클러스터에서 테이블을 CREATE합니다.

```sql
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER 'cluster_1S_2R'
   (
     id UInt64,
     column1 String
   )
   ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/db_uuid/{uuid}', '{replica}' )
   ORDER BY (id);
```

```response
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/db_uuid/{uuid}', '{replica}')
ORDER BY id

Query id: 8f542664-4548-4a02-bd2a-6f2c973d0dc4

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode2.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

4. 분산 테이블을 생성합니다

```sql
CREATE TABLE db_uuid.dist_uuid_table1 ON CLUSTER 'cluster_1S_2R'
   (
     id UInt64,
     column1 String
   )
   ENGINE = Distributed('cluster_1S_2R', 'db_uuid', 'uuid_table1' );
```

```response
CREATE TABLE db_uuid.dist_uuid_table1 ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `column1` String
)
ENGINE = Distributed('cluster_1S_2R', 'db_uuid', 'uuid_table1')

Query id: 3bc7f339-ab74-4c7d-a752-1ffe54219c0e

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```


### 테스트 \{#testing\}

1. 첫 번째 노드(예: `chnode1`)에 데이터를 삽입합니다.

```sql
INSERT INTO db_uuid.uuid_table1
   ( id, column1)
   VALUES
   ( 1, 'abc');
```

```response
INSERT INTO db_uuid.uuid_table1 (id, column1) FORMAT Values

Query id: 0f178db7-50a6-48e2-9a1b-52ed14e6e0f9

Ok.

1 row in set. Elapsed: 0.033 sec.
```

2. 두 번째 노드(예: `chnode2`)에 데이터를 삽입합니다.

```sql
INSERT INTO db_uuid.uuid_table1
   ( id, column1)
   VALUES
   ( 2, 'def');
```

```response
INSERT INTO db_uuid.uuid_table1 (id, column1) FORMAT Values

Query id: edc6f999-3e7d-40a0-8a29-3137e97e3607

Ok.

1 row in set. Elapsed: 0.529 sec.
```

3. 분산 테이블에서 레코드를 조회합니다

```sql
SELECT * FROM db_uuid.dist_uuid_table1;
```

```response
SELECT *
FROM db_uuid.dist_uuid_table1

Query id: 6cbab449-9e7f-40fe-b8c2-62d46ba9f5c8

┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘

2 rows in set. Elapsed: 0.007 sec.
```


### 대안 \{#alternatives\}

기본 복제(replication) 경로는 매크로와 `{uuid}`를 사용해 미리 정의할 수 있습니다.

1. 각 노드의 테이블에 대한 기본값을 설정합니다.

```xml
<default_replica_path>/clickhouse/tables/{shard}/db_uuid/{uuid}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```

:::tip
노드를 특정 데이터베이스에 사용하고 있다면, 각 노드에 매크로 `{database}`를 정의할 수도 있습니다.
:::

2. 매개변수를 명시적으로 지정하지 않고 테이블을 생성합니다:

```sql
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER 'cluster_1S_2R'
   (
     id UInt64,
     column1 String
   )
   ENGINE = ReplicatedMergeTree
   ORDER BY (id);
```

```response
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree
ORDER BY id

Query id: ab68cda9-ae41-4d6d-8d3b-20d8255774ee

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

2 rows in set. Elapsed: 1.175 sec.
```

3. 기본 구성의 설정이 사용되었는지 확인합니다

```sql
SHOW CREATE TABLE db_uuid.uuid_table1;
```

```response
SHOW CREATE TABLE db_uuid.uuid_table1

CREATE TABLE db_uuid.uuid_table1
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/db_uuid/{uuid}', '{replica}')
ORDER BY id

1 row in set. Elapsed: 0.003 sec.
```


### 문제 해결 \{#troubleshooting\}

테이블 정보와 UUID를 확인하기 위한 예시 명령은 다음과 같습니다:

```sql
SELECT * FROM system.tables
WHERE database = 'db_uuid' AND name = 'uuid_table1';
```

위의 테이블에 대해 UUID를 사용하여 ZooKeeper에 있는 테이블 정보를 조회하는 예제 명령어

```sql
SELECT * FROM system.zookeeper
WHERE path = '/clickhouse/tables/1/db_uuid/9e8a3cc2-0dec-4438-81a7-c3e63ce2a1cf/replicas';
```

:::note
데이터베이스는 `Atomic` 형식이어야 합니다. 이전 버전에서 업그레이드하는 경우
`default` 데이터베이스는 `Ordinary` 유형일 가능성이 높습니다.
:::

확인하려면:

예를 들어,

```sql
SELECT name, engine FROM system.databases WHERE name = 'db_uuid';
```

```response
SELECT
    name,
    engine
FROM system.databases
WHERE name = 'db_uuid'

Query id: b047d459-a1d2-4016-bcf9-3e97e30e49c2

┌─name────┬─engine─┐
│ db_uuid │ Atomic │
└─────────┴────────┘

1 row in set. Elapsed: 0.004 sec.
```


## ClickHouse Keeper 동적 재구성 \{#reconfiguration\}

<SelfManaged />

### 설명 \{#description-1\}

ClickHouse Keeper는 `keeper_server.enable_reconfiguration`이 활성화되어 있는 경우, 동적 클러스터 재구성을 위한 ZooKeeper의 [`reconfig`](https://zookeeper.apache.org/doc/r3.5.3-beta/zookeeperReconfig.html#sc_reconfig_modifying)
명령을 부분적으로 지원합니다.

:::note
이 설정이 비활성화된 경우, 레플리카의 `raft_configuration`
섹션을 수동으로 변경하여 클러스터를 재구성할 수 있습니다. 리더만 변경 사항을 적용하므로, 모든 레플리카에서 해당 파일을 편집했는지 반드시 확인하십시오.
또는 ZooKeeper와 호환되는 클라이언트를 통해 `reconfig` 쿼리를 전송할 수도 있습니다.
:::

가상 노드 `/keeper/config`에는 다음 형식으로 마지막으로 커밋된 클러스터 구성이 저장됩니다:

```text
server.id = server_host:server_port[;server_type][;server_priority]
server.id2 = ...
...
```

* 각 서버 항목은 줄바꿈으로 구분됩니다.
* `server_type`은 `participant` 또는 `learner` 중 하나입니다([learner](https://github.com/eBay/NuRaft/blob/master/docs/readonly_member.md)는 리더 선출에 참여하지 않습니다).
* `server_priority`는 [리더 선출 시 어떤 노드를 우선적으로 선출해야 하는지](https://github.com/eBay/NuRaft/blob/master/docs/leader_election_priority.md)를 나타내는 0 이상 정수입니다.
  우선순위가 0이면 해당 서버는 리더로 선출되지 않습니다.

예:

```sql
:) get /keeper/config
server.1=zoo1:9234;participant;1
server.2=zoo2:9234;participant;1
server.3=zoo3:9234;participant;1
```

`reconfig` 명령을 사용하여 새 서버를 추가하고, 기존 서버를 제거하며, 기존 서버의 우선순위를 변경할 수 있습니다. 예시는 다음과 같습니다 (`clickhouse-keeper-client` 사용):

```bash
# Add two new servers
reconfig add "server.5=localhost:123,server.6=localhost:234;learner"
# Remove two other servers
reconfig remove "3,4"
# Change existing server priority to 8
reconfig add "server.5=localhost:5123;participant;8"
```

`kazoo` 예시는 다음과 같습니다:

```python
# Add two new servers, remove two other servers
reconfig(joining="server.5=localhost:123,server.6=localhost:234;learner", leaving="3,4")

# Change existing server priority to 8
reconfig(joining="server.5=localhost:5123;participant;8", leaving=None)
```

`joining`에 있는 서버는 위에서 설명한 서버 형식을 따라야 합니다. 서버 항목은 쉼표로 구분해야 합니다.
새 서버를 추가할 때는 `server_priority`(기본값은 1)와 `server_type`(기본값은 `participant`)를 생략할 수 있습니다.

기존 서버의 우선순위를 변경하려면, 대상 우선순위를 설정해 해당 서버를 `joining`에 추가하면 됩니다.
서버 호스트, 포트, 유형은 기존 서버 설정과 동일해야 합니다.

서버는 `joining`과 `leaving`에 나타나는 순서대로 추가 및 제거됩니다.
`joining`으로부터의 모든 업데이트가 `leaving`으로부터의 업데이트보다 먼저 처리됩니다.

Keeper 재구성 구현에는 몇 가지 주의사항이 있습니다:

* 증분 재구성만 지원합니다. 비어 있지 않은 `new_members`를 가진 요청은 거부됩니다.

  ClickHouse Keeper 구현은 멤버십을 동적으로 변경하기 위해 NuRaft API에 의존합니다. NuRaft는 한 번에
  단일 서버를 추가하거나 단일 서버를 제거하는 방식만 제공합니다. 이는 설정의 각 변경 사항
  (`joining`의 각 요소, `leaving`의 각 요소)이 별도로 결정되어야 함을 의미합니다. 따라서 일괄 재구성은
  최종 사용자에게 오해를 줄 수 있으므로 제공되지 않습니다.

  서버 유형(participant/learner)을 변경하는 것도 불가능합니다. NuRaft에서 이를 지원하지 않기 때문에,
  유일한 방법은 서버를 제거한 뒤 다시 추가하는 것이지만, 이 역시 오해를 줄 수 있습니다.

* 반환된 `znodestat` 값을 사용할 수 없습니다.

* `from_version` 필드는 사용되지 않습니다. `from_version`이 설정된 모든 요청은 거부됩니다.
  이는 `/keeper/config`가 가상 노드이기 때문이며, 영구 스토리지에 저장되지 않고
  각 요청마다 지정된 노드 설정을 사용해 즉석에서 동적으로 생성됩니다.
  이 결정은 NuRaft가 이미 이 설정을 저장하고 있으므로 데이터를 중복 저장하지 않기 위해 내려졌습니다.

* ZooKeeper와 달리, `sync` 명령을 전송해 클러스터 재구성이 완료될 때까지 기다릴 방법이 없습니다.
  새로운 설정은 *결국* 적용되지만, 적용 시점에 대한 보장은 없습니다.

* `reconfig` 명령은 여러 이유로 실패할 수 있습니다. 클러스터 상태를 확인해
  업데이트가 적용되었는지 확인할 수 있습니다.


## 단일 노드 keeper를 클러스터로 전환하기 \{#converting-a-single-node-keeper-into-a-cluster\}

실험용 keeper 노드를 클러스터로 확장해야 하는 경우가 있습니다. 3개 노드로 구성된 클러스터를 예로 들어, 이를 단계별로 수행하는 방식은 다음과 같습니다:

- **중요**: 새 노드는 현재 쿼럼보다 작은 수의 배치로 추가해야 합니다. 그렇지 않으면 해당 노드들끼리 리더를 선출하게 됩니다. 이 예제에서는 한 번에 하나씩 추가합니다.
- 기존 keeper 노드에는 `keeper_server.enable_reconfiguration` 설정 파라미터가 활성화되어 있어야 합니다.
- 최종 keeper 클러스터 구성을 모두 포함한 설정으로 두 번째 노드를 시작합니다.
- 두 번째 노드가 시작되면 [`reconfig`](#reconfiguration)를 사용하여 노드 1에 추가합니다.
- 이제 세 번째 노드를 시작하고 [`reconfig`](#reconfiguration)를 사용하여 추가합니다.
- `clickhouse-server` 설정에 새로운 keeper 노드를 추가하고, 변경 사항을 적용하기 위해 재시작합니다.
- 노드 1의 Raft 설정을 업데이트하고, 필요하다면 재시작합니다.

절차에 익숙해지기 위해 다음 [sandbox 저장소](https://github.com/ClickHouse/keeper-extend-cluster)를 참고하십시오.

## 지원되지 않는 기능 \{#unsupported-features\}

ClickHouse Keeper는 ZooKeeper와의 완전한 호환성을 목표로 하지만, 현재(개발은 진행 중)이지만 아직 구현되지 않은 기능이 일부 있습니다:

- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat))는 `Stat` 객체 반환을 지원하지 않습니다
- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat))는 [TTL](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/CreateMode.html#PERSISTENT_WITH_TTL)을 지원하지 않습니다
- [`addWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#addWatch(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.AddWatchMode))는 [`PERSISTENT`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/AddWatchMode.html#PERSISTENT) watch와 함께 동작하지 않습니다
- [`removeWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.Watcher.WatcherType,boolean)) 및 [`removeAllWatches`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeAllWatches(java.lang.String,org.apache.zookeeper.Watcher.WatcherType,boolean))는 지원되지 않습니다
- `setWatches`는 지원되지 않습니다
- [`CONTAINER`](https://zookeeper.apache.org/doc/r3.5.1-alpha/api/org/apache/zookeeper/CreateMode.html) 유형 znode 생성은 지원되지 않습니다
- [`SASL authentication`](https://cwiki.apache.org/confluence/display/ZOOKEEPER/Zookeeper+and+SASL)은 지원되지 않습니다