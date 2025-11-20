---
'slug': '/guides/sre/keeper/clickhouse-keeper'
'sidebar_label': 'ClickHouse Keeper 구성하기'
'sidebar_position': 10
'keywords':
- 'Keeper'
- 'ZooKeeper'
- 'clickhouse-keeper'
'description': 'ClickHouse Keeper, 또는 clickhouse-keeper는 ZooKeeper를 대체하며 복제 및 조정을
  제공합니다.'
'title': 'ClickHouse Keeper'
'doc_type': 'guide'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';


# ClickHouse Keeper (clickhouse-keeper)

<SelfManaged />

ClickHouse Keeper는 데이터 [복제](/engines/table-engines/mergetree-family/replication.md)와 [분산 DDL](/sql-reference/distributed-ddl.md) 쿼리 실행을 위한 조정 시스템을 제공합니다. ClickHouse Keeper는 ZooKeeper와 호환됩니다.
### Implementation details {#implementation-details}

ZooKeeper는 잘 알려진 최초의 오픈 소스 조정 시스템 중 하나입니다. Java로 구현되었으며, 매우 간단하고 강력한 데이터 모델을 가지고 있습니다. ZooKeeper의 조정 알고리즘인 ZooKeeper Atomic Broadcast (ZAB)는 각 ZooKeeper 노드가 로컬에서 읽기를 처리하기 때문에 읽기에 대한 선형화 보장을 제공하지 않습니다. ZooKeeper와 달리 ClickHouse Keeper는 C++로 작성되었으며 [RAFT 알고리즘](https://raft.github.io/)의 [구현](https://github.com/eBay/NuRaft)을 사용합니다. 이 알고리즘은 읽기 및 쓰기에 대해 선형화 가능성을 허용하며, 다양한 언어에서 여러 개의 오픈 소스 구현이 존재합니다.

기본적으로 ClickHouse Keeper는 ZooKeeper와 동일한 보장을 제공합니다: 선형화된 쓰기 및 비선형화된 읽기. 호환 가능한 클라이언트-서버 프로토콜을 가지고 있으므로, 표준 ZooKeeper 클라이언트를 사용하여 ClickHouse Keeper와 상호 작용할 수 있습니다. 스냅샷과 로그는 ZooKeeper와 호환되지 않는 형식을 가지지만, `clickhouse-keeper-converter` 도구를 사용하면 ZooKeeper 데이터를 ClickHouse Keeper 스냅샷으로 변환할 수 있습니다. ClickHouse Keeper의 서버 간 프로토콜도 ZooKeeper와 호환되지 않아서 혼합된 ZooKeeper / ClickHouse Keeper 클러스터는 불가능합니다.

ClickHouse Keeper는 [ZooKeeper](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#sc_ZooKeeperAccessControl)와 동일한 방식으로 접근 제어 목록(ACL)을 지원합니다. ClickHouse Keeper는 동일한 권한 집합을 지원하며, `world`, `auth`, `digest`와 같은 동일한 내장 스킴을 가지고 있습니다. 다이제스트 인증 스킴은 `username:password` 쌍을 사용하며, 비밀번호는 Base64로 인코딩됩니다.

:::note
외부 통합은 지원되지 않습니다.
:::
### Configuration {#configuration}

ClickHouse Keeper는 ZooKeeper에 대한 독립 실행형 대체로 사용되거나 ClickHouse 서버의 내부 일부로 사용할 수 있습니다. 두 경우 모두 구성은 거의 동일한 `.xml` 파일입니다.
#### Keeper configuration settings {#keeper-configuration-settings}

주요 ClickHouse Keeper 구성 태그는 `<keeper_server>`이며, 다음 매개변수를 가지고 있습니다:

| Parameter                            | Description                                                                                                                                                                                                                                         | Default                                                                                                      |
|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `tcp_port`                           | 클라이언트가 연결하기 위한 포트.                                                                                                                                                                                                                       | `2181`                                                                                                       |
| `tcp_port_secure`                    | 클라이언트와 keeper-server 간의 SSL 연결을 위한 보안 포트.                                                                                                                                                                                 | -                                                                                                            |
| `server_id`                          | 고유한 서버 ID로, ClickHouse Keeper 클러스터의 각 참여자는 고유한 번호(1, 2, 3 등)를 가져야 합니다.                                                                                                                                               | -                                                                                                            |
| `log_storage_path`                   | 조정 로그의 경로로, ZooKeeper와 마찬가지로 로그를 비활성 노드에 저장하는 것이 좋습니다.                                                                                                                                                          | -                                                                                                            |
| `snapshot_storage_path`              | 조정 스냅샷의 경로.                                                                                                                                                                                                                     | -                                                                                                            |
| `enable_reconfiguration`             | [`reconfig`](#reconfiguration) 를 통한 동적 클러스터 재구성을 활성화합니다.                                                                                                                                                                          | `False`                                                                                                      |
| `max_memory_usage_soft_limit`        | keeper의 최대 메모리 사용의 바이트 단위 소프트 리미트.                                                                                                                                                                                                     | `max_memory_usage_soft_limit_ratio` * `physical_memory_amount`                                               |
| `max_memory_usage_soft_limit_ratio`  | `max_memory_usage_soft_limit`가 설정되지 않았거나 0으로 설정된 경우, 이 값을 사용하여 기본 소프트 리미트를 정의합니다.                                                                                                                                     | `0.9`                                                                                                        |
| `cgroups_memory_observer_wait_time`  | `max_memory_usage_soft_limit`가 설정되지 않았거나 `0`으로 설정된 경우, 물리적 메모리 양을 관찰하는 간격입니다. 메모리 양이 변경되면, Keeper의 메모리 소프트 리미트를 `max_memory_usage_soft_limit_ratio`에 의해 재계산합니다. | `15`                                                                                                         |
| `http_control`                       | [HTTP control](#http-control) 인터페이스의 구성.                                                                                                                                                                                           | -                                                                                                            |
| `digest_enabled`                     | 실시간 데이터 일관성 검사 활성화                                                                                                                                                                                                             | `True`                                                                                                       |
| `create_snapshot_on_exit`            | 종료 중에 스냅샷 생성                                                                                                                                                                                                                   | -                                                                                                            |
| `hostname_checks_enabled`            | 클러스터 구성에 대한 유효성 호스트 이름 체크 활성화 (예: 로컬호스트가 원격 엔드포인트와 함께 사용되는 경우)                                                                                                                                           | `True`                                                                                                       |
| `four_letter_word_white_list`        | 4lw 명령의 화이트 리스트.                                                                                                                                                                                                                         | `conf, cons, crst, envi, ruok, srst, srvr, stat, wchs, dirs, mntr, isro, rcvr, apiv, csnp, lgif, rqld, ydld` |
|`enable_ipv6`| IPv6 활성화 | `True`|

기타 일반적인 매개변수는 ClickHouse 서버 구성(`listen_host`, `logger` 등)에서 상속됩니다.
#### Internal coordination settings {#internal-coordination-settings}

내부 조정 설정은 `<keeper_server>.<coordination_settings>` 섹션에 위치하며, 다음 매개변수를 가집니다:

| Parameter                          | Description                                                                                                                                                                                                              | Default                                                                                                      |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `operation_timeout_ms`             | 단일 클라이언트 작업에 대한 타임아웃 (ms)                                                                                                                                                                               | `10000`                                                                                                      |
| `min_session_timeout_ms`           | 클라이언트 세션에 대한 최소 타임아웃 (ms)                                                                                                                                                                                      | `10000`                                                                                                      |
| `session_timeout_ms`               | 클라이언트 세션에 대한 최대 타임아웃 (ms)                                                                                                                                                                                      | `100000`                                                                                                     |
| `dead_session_check_period_ms`     | ClickHouse Keeper가 죽은 세션을 확인하고 제거하는 빈도 (ms)                                                                                                                                               | `500`                                                                                                        |
| `heart_beat_interval_ms`           | ClickHouse Keeper 리더가 팔로워에게 하트비트를 보내는 빈도 (ms)                                                                                                                                              | `500`                                                                                                        |
| `election_timeout_lower_bound_ms`  | 팔로워가 이 간섭 안에서 리더로부터 하트비트를 받지 못하면 리더 선출을 시작할 수 있습니다. `election_timeout_upper_bound_ms`와 같거나 작아야 합니다. 이상적으로는 같지 않아야 합니다.  | `1000`                                                                                                       |
| `election_timeout_upper_bound_ms`  | 팔로워가 이 간섭 안에서 리더로부터 하트비트를 받지 못하면 리더 선출을 시작해야 합니다.                                                                                                    | `2000`                                                                                                       |
| `rotate_log_storage_interval`      | 단일 파일에 저장할 로그 레코드의 수.                                                                                                                                                                          | `100000`                                                                                                     |
| `reserved_log_items`               | 압축 이전에 저장할 조정 로그 레코드의 수.                                                                                                                                                            | `100000`                                                                                                     |
| `snapshot_distance`                | ClickHouse Keeper가 새로운 스냅샷을 생성할 빈도 (로그의 레코드 수 기준).                                                                                                                                | `100000`                                                                                                     |
| `snapshots_to_keep`                | 유지할 스냅샷 수.                                                                                                                                                                                              | `3`                                                                                                          |
| `stale_log_gap`                    | 리더가 팔로워를 오래된 것으로 간주하는 임계값으로, 로그 대신 스냅샷을 보냅니다.                                                                                                                          | `10000`                                                                                                      |
| `fresh_log_gap`                    | 노드가 신선해진 시점.                                                                                                                                                                                                  | `200`                                                                                                        |
| `max_requests_batch_size`          | RAFT에 전송되기 전 요청 수의 최대 배치 크기.                                                                                                                                                      | `100`                                                                                                        |
| `force_sync`                       | 조정 로그의 각 쓰기에 대해 `fsync` 호출.                                                                                                                                                                          | `true`                                                                                                       |
| `quorum_reads`                     | 전체 RAFT 합의를 통해 쓰기처럼 읽기 요청을 실행하며 비슷한 속도로 처리.                                                                                                                                         | `false`                                                                                                      |
| `raft_logs_level`                  | 조정에 대한 텍스트 로깅 수준 (trace, debug 등).                                                                                                                                                         | `system default`                                                                                             |
| `auto_forwarding`                  | 팔로워에서 리더로의 쓰기 요청 전달을 허용.                                                                                                                                                            | `true`                                                                                                       |
| `shutdown_timeout`                 | 내부 연결 종료를 마무리하고 종료할 때까지 대기 (ms).                                                                                                                                                                   | `5000`                                                                                                       |
| `startup_timeout`                  | 서버가 지정된 타임아웃 내에 다른 쿼럼 참가자와 연결되지 않으면 종료됩니다 (ms).                                                                                                              | `30000`                                                                                                      |
| `async_replication`                | 비동기 복제를 활성화합니다. 모든 쓰기 및 읽기 보장은 유지되면서 성능이 향상됩니다. 기본적으로 설정이 비활성화되어 있어 이전의 호환성을 깨뜨리지 않습니다.                                         | `false`                                                                                                      |
| `latest_logs_cache_size_threshold` | 최신 로그 항목의 인 메모리 캐시의 최대 총 크기.                                                                                                                                                              | `1GiB`                                                                                                       |
| `commit_logs_cache_size_threshold` | 커밋을 위해 필요한 로그 항목의 인 메모리 캐시의 최대 총 크기.                                                                                                                                              | `500MiB`                                                                                                     |
| `disk_move_retries_wait_ms`        | 파일이 디스크 간 이동하는 동안 실패 후 재시도 사이의 대기 시간.                                                                                                               | `1000`                                                                                                       |
| `disk_move_retries_during_init`    | 초기화 동안 파일이 디스크 간 이동하는 동안 실패 후 재시도 수.                                                                                                    | `100`                                                                                                        |
| `experimental_use_rocksdb`         | rocksdb를 백엔드 스토리지로 사용합니다.                                                                                                    | `0`                                                                                                        |

쿼럼 구성은 `<keeper_server>.<raft_configuration>` 섹션에 위치하며 서버 설명을 포함합니다.

전체 쿼럼에 대한 유일한 매개변수는 `secure`로, 쿼럼 참가자 간의 통신을 위한 암호화된 연결을 활성화합니다. 이 매개변수는 노드 간의 내부 통신을 위해 SSL 연결이 필요한 경우 `true`로 설정하거나 그렇지 않으면 지정하지 않을 수 있습니다.

각 `<server>`에 대한 주요 매개변수는 다음과 같습니다:

- `id` — 쿼럼에서의 서버 식별자.
- `hostname` — 이 서버가 배치된 호스트 이름.
- `port` — 이 서버가 연결을 수신하는 포트.
- `can_become_leader` — 서버를 `learner`로 설정하려면 `false`로 설정합니다. 생략하면 값은 `true`입니다.

:::note
ClickHouse Keeper 클러스터의 토폴로지가 변경되는 경우 (예: 서버 교체), `server_id`와 `hostname`의 매핑을 일관되게 유지하고, 기존의 `server_id`를 다른 서버에 재사용하지 않도록 주의해 주세요 (예: ClickHouse Keeper를 배포하기 위해 자동화 스크립트에 의존하는 경우 발생할 수 있습니다).

Keeper 인스턴스의 호스트가 변경될 수 있는 경우, 원시 IP 주소 대신 호스트 이름을 정의하고 사용하는 것이 좋습니다. 호스트 이름을 변경하는 것은 서버를 제거하고 다시 추가하는 것과 동일하며, 이 경우에는 쿼럼을 위한 적절한 Keeper 인스턴스가 부족할 수 있습니다.
:::

:::note
`async_replication`는 이전 호환성을 깨뜨리지 않도록 기본적으로 비활성화되어 있습니다. 클러스터의 모든 Keeper 인스턴스가 `async_replication`을 지원하는 버전에서 실행되는 경우(v23.9+), 성능이 저하되지 않으면서 성능 향상을 위해 활성화하는 것이 좋습니다.
:::

세 개의 노드를 가진 쿼럼 구성 예시는 `test_keeper_` 접두사가 있는 [통합 테스트](https://github.com/ClickHouse/ClickHouse/tree/master/tests/integration)에서 확인할 수 있습니다. 서버 #1에 대한 구성 예시:

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
### How to run {#how-to-run}

ClickHouse Keeper는 ClickHouse 서버 패키지에 포함되어 있으며, `/etc/your_path_to_config/clickhouse-server/config.xml`에 `<keeper_server>` 구성을 추가하고, 항상처럼 ClickHouse 서버를 시작하면 됩니다. 독립 실행형 ClickHouse Keeper를 실행하려면 다음과 유사한 방식으로 시작할 수 있습니다:

```bash
clickhouse-keeper --config /etc/your_path_to_config/config.xml
```

심볼릭 링크 (`clickhouse-keeper`)가 없는 경우 생성하거나 `keeper`를 `clickhouse`에 대한 인수로 지정할 수 있습니다:

```bash
clickhouse keeper --config /etc/your_path_to_config/config.xml
```
### Four letter word commands {#four-letter-word-commands}

ClickHouse Keeper는 Zookeeper와 거의 동일한 4lw 명령을 제공합니다. 각 명령은 `mntr`, `stat` 등과 같은 네 글자로 구성됩니다. 더 흥미로운 명령도 있습니다: `stat`는 서버와 연결된 클라이언트에 대한 일반 정보를 제공하며, `srvr` 및 `cons`는 각각 서버와 연결에 대한 확장된 세부 정보를 제공합니다.

4lw 명령은 기본값이 `conf,cons,crst,envi,ruok,srst,srvr,stat,wchs,dirs,mntr,isro,rcvr,apiv,csnp,lgif,rqld,ydld`인 화이트 리스트 구성 `four_letter_word_white_list`를 가집니다.

클라이언트 포트에서 telnet 또는 nc를 통해 ClickHouse Keeper에 명령을 전송할 수 있습니다.

```bash
echo mntr | nc localhost 9181
```

아래는 자세한 4lw 명령입니다:

- `ruok`: 서버가 비오류 상태로 실행 중인지 테스트합니다. 서버가 실행 중이면 `imok`로 응답합니다. 그렇지 않으면 전혀 응답하지 않습니다. `imok` 응답은 서버가 쿼럼에 합류했음을 반드시 나타내는 것은 아니며, 단지 서버 프로세스가 활성화되어 있고 지정된 클라이언트 포트에 바인딩되어 있음을 의미합니다. 쿼럼 및 클라이언트 연결 정보와 관련된 상태에 대한 세부 정보를 보려면 "stat" 명령을 사용하세요.

```response
imok
```

- `mntr`: 클러스터의 건강을 모니터링하는 데 사용할 수 있는 변수 목록을 출력합니다.

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

- `srvr`: 서버에 대한 전체 세부 정보를 나열합니다.

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

- `stat`: 서버와 연결된 클라이언트에 대한 간단한 세부 정보를 나열합니다.

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

- `srst`: 서버 통계를 초기화합니다. 이 명령은 `srvr`, `mntr`, `stat`의 결과에 영향을 미칩니다.

```response
Server stats reset.
```

- `conf`: 서비스 구성을 인쇄합니다.

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

- `cons`: 이 서버에 연결된 모든 클라이언트에 대한 전체 연결/세션 세부 정보를 나열합니다. 수신/전송된 패킷 수, 세션 ID, 작업 대기 시간, 수행된 마지막 작업 등에 대한 정보를 포함합니다.

```response
192.168.1.1:52163(recved=0,sent=0,sid=0xffffffffffffffff,lop=NA,est=1636454787393,to=30000,lzxid=0xffffffffffffffff,lresp=0,llat=0,minlat=0,avglat=0,maxlat=0)
192.168.1.1:52042(recved=9,sent=18,sid=0x0000000000000001,lop=List,est=1636454739887,to=30000,lcxid=0x0000000000000005,lzxid=0x0000000000000005,lresp=1636454739892,llat=0,minlat=0,avglat=0,maxlat=0)
```

- `crst`: 모든 연결에 대해 연결/세션 통계를 초기화합니다.

```response
Connection stats reset.
```

- `envi`: 제공되는 환경에 대한 세부 정보를 인쇄합니다.

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

- `dirs`: 스냅샷 및 로그 파일의 총 크기를 바이트 단위로 보여줍니다.

```response
snapshot_dir_size: 0
log_dir_size: 3875
```

- `isro`: 서버가 읽기 전용 모드로 실행 중인지 테스트합니다. 서버가 읽기 전용 모드에 있으면 `ro`로 응답하고, 그렇지 않으면 `rw`로 응답합니다.

```response
rw
```

- `wchs`: 서버에 대한 감시 정보 요약을 나열합니다.

```response
1 connections watching 1 paths
Total watches:1
```

- `wchc`: 세션별로 서버에 대한 감시에 대한 자세한 정보를 나열합니다. 이는 관련 감시(경로)가 있는 세션(연결)의 목록을 출력합니다. 감시의 수에 따라 이 작업은 비용이 많이 들 수 있으므로 주의해서 사용하세요.

```response
0x0000000000000001
    /clickhouse/task_queue/ddl
```

- `wchp`: 경로별로 서버에 대한 감시에 대한 자세한 정보를 나열합니다. 이는 관련 세션이 있는 경로(znodes)의 목록을 출력합니다. 감시의 수에 따라 이 작업은 비용이 많이 들 수 있으므로 주의해서 사용하세요.

```response
/clickhouse/task_queue/ddl
    0x0000000000000001
```

- `dump`: outstanding sessions 및 ephemeral nodes를 나열합니다. 이는 리더에서만 작동합니다.

```response
Sessions dump (2):
0x0000000000000001
0x0000000000000002
Sessions with Ephemerals (1):
0x0000000000000001
 /clickhouse/task_queue/ddl
```

- `csnp`: 스냅샷 생성 작업을 예약합니다. 성공 시 예약된 스냅샷의 마지막 커밋 로그 인덱스를 반환하고, 실패 시 `Failed to schedule snapshot creation task.`를 반환합니다. `lgif` 명령은 스냅샷이 완료되었는지 확인하는 데 도움이 될 수 있습니다.

```response
100
```

- `lgif`: Keeper 로그 정보. `first_log_idx`: 로그 저장소의 첫 번째 로그 인덱스; `first_log_term`: 내 첫 번째 로그 기간; `last_log_idx`: 로그 저장소의 마지막 로그 인덱스; `last_log_term`: 내 마지막 로그 기간; `last_committed_log_idx`: 상태 머신에서 내 마지막 커밋 로그 인덱스; `leader_committed_log_idx`: 내 관점에서 리더의 커밋된 로그 인덱스; `target_committed_log_idx`: 커밋해야 하는 대상 로그 인덱스; `last_snapshot_idx`: 마지막 스냅샷의 가장 큰 커밋 로그 인덱스.

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

- `rqld`: 새로운 리더가 되기 위한 요청을 보냅니다. 요청이 전송되면 `Sent leadership request to leader.`를 반환하고, 요청이 전송되지 않으면 `Failed to send leadership request to leader.`를 반환합니다. 노드가 이미 리더인 경우 결과는 요청이 전송된 것과 동일합니다.

```response
Sent leadership request to leader.
```

- `ftfl`: 모든 기능 플래그와 Keeper 인스턴스에 대해 활성화되었는지 여부를 나열합니다.

```response
filtered_list   1
multi_read  1
check_not_exists    0
```

- `ydld`: 리더십 양도를 요청하고 팔로워가 됩니다. 요청을 받은 서버가 리더인 경우 먼저 쓰기 작업을 일시 중지하고, 후계자(현재 리더는 결코 후계자가 아님)가 최신 로그의 캐치업을 마칠 때까지 기다렸다가 사임합니다. 후계자는 자동으로 선택됩니다. 요청이 전송되면 `Sent yield leadership request to leader.`를 반환하고, 요청이 전송되지 않으면 `Failed to send yield leadership request to leader.`를 반환합니다. 노드가 이미 팔로워인 경우 결과는 요청이 전송된 것과 동일합니다.

```response
Sent yield leadership request to leader.
```

- `pfev`: 수집된 모든 이벤트에 대한 값을 반환합니다. 각 이벤트에 대해 이벤트 이름, 이벤트 값 및 이벤트 설명을 반환합니다.

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
### HTTP control {#http-control}

ClickHouse Keeper는 복제본이 트래픽을 수신할 준비가 되었는지 확인하는 HTTP 인터페이스를 제공합니다. 이는 [Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes)와 같은 클라우드 환경에서 사용할 수 있습니다.

`/ready` 엔드포인트를 활성화하는 구성 예시는 다음과 같습니다:

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
### Feature flags {#feature-flags}

Keeper는 ZooKeeper 및 그 클라이언트와 완전히 호환되지만 ClickHouse 클라이언트가 사용할 수 있는 몇 가지 고유한 기능과 요청 유형도 도입합니다. 이러한 기능은 이전 버전과 호환되지 않는 변경을 도입할 수 있으므로 기본적으로 비활성화되어 있으며 `keeper_server.feature_flags` 구성을 사용하여 활성화될 수 있습니다. 모든 기능은 명시적으로 비활성화할 수 있습니다. Keeper 클러스터에 새 기능을 활성화하려면 먼저 클러스터의 모든 Keeper 인스턴스를 해당 기능을 지원하는 버전으로 업데이트하고 나서 기능 자체를 활성화하는 것이 좋습니다.

`multi_read`를 비활성화하고 `check_not_exists`를 활성화하는 기능 플래그 구성 예시는 다음과 같습니다:

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

| Feature                | Description                                                                                                                                              | Default |
|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `multi_read`           | 읽기 다중 요청 지원                                                                                                                           | `1`     |
| `filtered_list`        | 노드 유형(일회성 또는 영구적)으로 결과를 필터링하는 목록 요청 지원                                                             | `1`     |
| `check_not_exists`     | 노드가 존재하지 않음을 주장하는 `CheckNotExists` 요청 지원                                                                              | `1`     |
| `create_if_not_exists` | 노드가 존재하지 않으면 생성하려고 시도하는 `CreateIfNotExists` 요청 지원. 존재하면 변경 사항이 적용되지 않고 `ZOK`가 반환됩니다. | `1`     |
| `remove_recursive`     | 서브 트리와 함께 노드를 제거하는 `RemoveRecursive` 요청 지원                                                                     | `1`     |

:::note
일부 기능 플래그는 버전 25.7부터 기본적으로 활성화됩니다. Keeper를 25.7+로 업그레이드하는 권장 방법은 먼저 버전 24.9+로 업그레이드하는 것입니다.
:::
### Migration from ZooKeeper {#migration-from-zookeeper}

ZooKeeper에서 ClickHouse Keeper로의 원활한 마이그레이션은 불가능합니다. ZooKeeper 클러스터를 중지하고, 데이터를 변환한 후 ClickHouse Keeper를 시작해야 합니다. `clickhouse-keeper-converter` 도구는 ZooKeeper 로그 및 스냅샷을 ClickHouse Keeper 스냅샷으로 변환할 수 있습니다. 이 도구는 ZooKeeper > 3.4에서만 작동합니다. 마이그레이션을 위한 단계는 다음과 같습니다.

1. 모든 ZooKeeper 노드를 중지합니다.

2. 선택 사항이지만 권장됨: ZooKeeper 리더 노드를 찾아 다시 시작하고 중지합니다. 이렇게 하면 ZooKeeper가 일관된 스냅샷을 생성합니다.

3. 예를 들어 리더에서 `clickhouse-keeper-converter`를 실행합니다:

```bash
clickhouse-keeper-converter --zookeeper-logs-dir /var/lib/zookeeper/version-2 --zookeeper-snapshots-dir /var/lib/zookeeper/version-2 --output-dir /path/to/clickhouse/keeper/snapshots
```

4. 스냅샷을 구성된 `keeper`가 있는 ClickHouse 서버 노드에 복사하거나 ZooKeeper 대신 ClickHouse Keeper를 시작합니다. 스냅샷은 모든 노드에 지속되어야 하며, 그렇지 않으면 빈 노드가 더 빨라질 수 있고 그 중 하나가 리더가 될 수 있습니다.

:::note
`keeper-converter` 도구는 Keeper 독립 이진 파일에서 사용할 수 없습니다.
ClickHouse가 설치되어 있는 경우, 다음과 같이 이진 파일을 직접 사용할 수 있습니다:

```bash
clickhouse keeper-converter ...
```

그렇지 않은 경우, [이진 파일을 다운로드](/getting-started/quick-start/oss#download-the-binary)하여 ClickHouse를 설치하지 않고도 위와 같이 도구를 실행할 수 있습니다.
:::
### Recovering after losing quorum {#recovering-after-losing-quorum}

ClickHouse Keeper는 Raft를 사용하므로 클러스터 크기에 따라 일정량의 노드 크래시를 허용할 수 있습니다. \
예를 들어, 3개 노드 클러스터의 경우 1개 노드만 크래시가 나더라도 정상적으로 작동합니다.

클러스터 구성은 동적으로 구성할 수 있지만 몇 가지 제한 사항이 있습니다. 재구성은 Raft에 의존하므로 클러스터에서 노드를 추가/제거하려면 과반수가 필요합니다. 클러스터에서 한 번에 너무 많은 노드를 잃어버리면 다시 시작할 수 있는 가능성이 없어지면서, Raft는 작동을 중지하고 전통적인 방법으로 클러스터를 재구성하는 것을 허용하지 않습니다.

그럼에도 불구하고 ClickHouse Keeper에는 단 하나의 노드로 클러스터를 강제로 재구성할 수 있는 복구 모드가 있습니다. 다시 시작할 수 없는 노드를 복구하거나 동일한 엔드포인트에서 새 인스턴스를 시작할 수 없는 경우에만 마지막 수단으로 수행해야 합니다.

계속하기 전에 주의할 사항:
- 실패한 노드가 다시 클러스터에 연결할 수 없도록 확인합니다.
- 단계에서 명시될 때까지 새로운 노드를 시작하지 마십시오.

위 사항이 사실임을 확인한 후, 다음을 수행해야 합니다:
1. 새로운 리더로 사용할 단일 Keeper 노드를 선택합니다. 해당 노드의 데이터가 전체 클러스터에서 사용되므로 최신 상태의 노드를 사용하는 것이 좋습니다.
2. 다른 작업을 수행하기 전에 선택한 노드의 `log_storage_path` 및 `snapshot_storage_path` 폴더의 백업을 만듭니다.
3. 사용하려는 모든 노드에서 클러스터를 재구성합니다.
4. 선택한 노드에 `rcvr`라는 네 글자 명령을 보내 노드를 복구 모드로 전환하거나, 선택한 노드에서 Keeper 인스턴스를 중지하고 `--force-recovery` 인수로 다시 시작합니다.
5. 새로운 노드에서 Keeper 인스턴스를 하나씩 시작하면서, 다음 노드를 시작하기 전 `mntr`가 `zk_server_state`에 대해 `follower`를 반환하는지 확인합니다.
6. 복구 모드에 있는 동안 리더 노드는 과반수를 달성할 때까지 `mntr` 명령에 대해 오류 메시지를 반환하고 클라이언트 및 팔로워의 모든 요청을 거부합니다.
7. 과반수가 달성되면 리더 노드는 Raft-verify를 사용하여 모든 요청을 수락하는 정상 작동 모드로 돌아갑니다. 이때 `mntr`는 `zk_server_state`에 대해 `leader`를 반환해야 합니다.
## Using disks with Keeper {#using-disks-with-keeper}

Keeper는 스냅샷, 로그 파일 및 상태 파일을 저장하기 위해 [외부 디스크](/operations/storing-data.md)의 하위 집합을 지원합니다.

지원되는 디스크 유형은 다음과 같습니다:
- s3_plain
- s3
- local

다음은 구성 내에 포함된 디스크 정의의 예입니다.

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

로그에 디스크를 사용하려면 `keeper_server.log_storage_disk` 구성을 디스크의 이름으로 설정해야 합니다.
스냅샷에 디스크를 사용하려면 `keeper_server.snapshot_storage_disk` 구성을 디스크의 이름으로 설정해야 합니다.
또한, `keeper_server.latest_log_storage_disk` 및 `keeper_server.latest_snapshot_storage_disk`를 사용하여 최신 로그 또는 스냅샷에 대해 서로 다른 디스크를 사용할 수 있습니다.
이 경우, Keeper는 새로운 로그 또는 스냅샷이 생성될 때 파일을 올바른 디스크로 자동으로 이동합니다.
상태 파일에 디스크를 사용하려면 `keeper_server.state_storage_disk` 구성을 디스크의 이름으로 설정해야 합니다.

디스크 간의 파일 이동은 안전하며 Keeper가 전송 중간에 중지되는 경우 데이터 손실 위험이 없습니다.
파일이 새 디스크로 완전히 이동될 때까지 이전 디스크에서 삭제되지 않습니다.

`keeper_server.coordination_settings.force_sync`가 `true`로 설정된 Keeper는 모든 디스크 유형에 대해 일부 보장을 만족할 수 없습니다(`true`는 기본값).
현재 `local` 유형의 디스크만 지속적인 동기화를 지원합니다.
`force_sync`가 사용되는 경우, `latest_log_storage_disk`가 사용되지 않는다면 `log_storage_disk`는 반드시 `local` 디스크여야 합니다.
`latest_log_storage_disk`가 사용되는 경우 항상 `local` 디스크여야 합니다.
`force_sync`가 비활성화된 경우, 모든 디스크 유형을 자유롭게 사용할 수 있습니다.

Keeper 인스턴스를 위한 가능한 저장 설정은 다음과 같습니다:

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

이 인스턴스는 `log_s3_plain` 디스크에 최신 로그를 제외한 모든 로그를 저장합니다. 최신 로그는 `log_local` 디스크에 저장됩니다.
스냅샷에 대해서도 동일한 논리가 적용되며 최신 스냅샷을 제외한 모든 스냅샷은 `snapshot_s3_plain`에 저장되고, 최신 스냅샷은 `snapshot_local` 디스크에 저장됩니다.
### Changing disk setup {#changing-disk-setup}

:::important
새 디스크 설정을 적용하기 전에 모든 Keeper 로그 및 스냅샷을 수동으로 백업하세요.
:::

계층형 디스크 설정이 정의된 경우(최신 파일에 대해 별도의 디스크를 사용하는 경우), Keeper는 시작할 때 파일을 올바른 디스크로 자동으로 이동하려고 시도합니다.
이전에 적용된 것과 동일한 보장이 적용됩니다. 파일이 새 디스크로 완전히 이동될 때까지 이전 디스크에서는 삭제되지 않으므로 안전하게 여러 번 재시작할 수 있습니다.

파일을 완전히 새 디스크로 이동해야 하거나 2 디스크 설정에서 단일 디스크 설정으로 이동해야 하는 경우, `keeper_server.old_snapshot_storage_disk` 및 `keeper_server.old_log_storage_disk`를 여러 정의로 사용할 수 있습니다.

다음 구성은 이전 2 디스크 설정에서 완전히 새로운 단일 디스크 설정으로 이동하는 방법을 보여줍니다:

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

시작할 때 모든 로그 파일은 `log_local` 및 `log_s3_plain`에서 `log_local2` 디스크로 이동됩니다.
또한 모든 스냅샷 파일은 `snapshot_local` 및 `snapshot_s3_plain`에서 `snapshot_local2` 디스크로 이동됩니다.
## Configuring logs cache {#configuring-logs-cache}

디스크에서 읽는 데이터 양을 최소화하기 위해, Keeper는 메모리에 로그 항목을 캐시합니다.
요청이 클 경우 로그 항목이 너무 많은 메모리를 차지하므로 캐시된 로그의 양은 제한됩니다.
이 제한은 다음 두 가지 구성으로 제어됩니다:
- `latest_logs_cache_size_threshold` - 캐시에 저장된 최신 로그의 총 크기
- `commit_logs_cache_size_threshold` - 다음에 커밋해야 하는 후속 로그의 총 크기

기본값이 너무 크면 이 두 가지 구성을 줄여 메모리 사용량을 줄일 수 있습니다.

:::note
`pfev` 명령을 사용하여 각 캐시와 파일에서 읽은 로그의 양을 확인할 수 있습니다.
또한 Prometheus 엔드포인트의 메트릭을 사용하여 두 캐시의 현재 크기를 추적할 수 있습니다.
:::
## Prometheus {#prometheus}

Keeper는 [Prometheus](https://prometheus.io)에서 스크랩할 메트릭 데이터를 노출할 수 있습니다.

설정:

- `endpoint` – Prometheus 서버가 메트릭을 스크랩할 HTTP 엔드포인트. '/'로 시작합니다.
- `port` – `endpoint`용 포트.
- `metrics` – [system.metrics](/operations/system-tables/metrics) 테이블의 메트릭을 노출하도록 설정하는 플래그.
- `events` – [system.events](/operations/system-tables/events) 테이블의 메트릭을 노출하도록 설정하는 플래그.
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 테이블의 현재 메트릭 값을 노출하도록 설정하는 플래그.

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

확인( `127.0.0.1`을 ClickHouse 서버의 IP 주소 또는 호스트 이름으로 교체):
```bash
curl 127.0.0.1:9363/metrics
```

ClickHouse Cloud [Prometheus 통합](/integrations/prometheus)도 참고하세요.
## ClickHouse Keeper user guide {#clickhouse-keeper-user-guide}

이 가이드는 ClickHouse Keeper를 구성하는 간단하고 최소한의 설정을 제공하며, 분산 작업을 테스트하는 방법에 대한 예제를 제공합니다. 이 예제는 Linux에서 3개 노드를 사용하여 수행됩니다.
### 1. Configure nodes with Keeper settings {#1-configure-nodes-with-keeper-settings}

1. 3개의 호스트(`chnode1`, `chnode2`, `chnode3`)에 ClickHouse 인스턴스 3개를 설치합니다. (ClickHouse 설치에 대한 자세한 내용은 [빠른 시작](/getting-started/install/install.mdx)을 참조하세요.)

2. 각 노드에서 네트워크 인터페이스를 통해 외부 통신을 허용하는 항목을 추가합니다.
```xml
<listen_host>0.0.0.0</listen_host>
```

3. 세 개의 서버 모두에 ClickHouse Keeper 구성을 추가하고 각 서버의 `<server_id>` 설정을 업데이트합니다. `chnode1`의 경우 `1`, `chnode2`의 경우 `2` 등으로 설정합니다.
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

    위에서 사용된 기본 설정은 다음과 같습니다:

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |tcp_port   |keeper의 클라이언트에서 사용할 포트|9181 (기본값은 2181, zookeeper와 동일)|
    |server_id|raft 구성에 사용되는 각 ClickHouse Keeper 서버 식별자| 1|
    |coordination_settings| 시간 초과와 같은 매개변수를 설정하는 섹션| timeouts: 10000, log level: trace|
    |server    |참여하는 서버 정의|각 서버 정의의 목록|
    |raft_configuration|keeper 클러스터의 각 서버에 대한 설정|각 서버 및 설정의 목록|
    |id      |keeper 서비스의 서버 숫자 ID|1|
    |hostname   |keeper 클러스터의 각 서버의 호스트 이름, IP 또는 FQDN|`chnode1.domain.com`|
    |port|서버 간 keeper 연결에 대한 수신 포트|9234|

4. Zookeeper 구성 요소를 활성화합니다. 이는 ClickHouse Keeper 엔진을 사용할 것입니다:
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

    위에서 사용된 기본 설정은 다음과 같습니다:

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |node   |ClickHouse Keeper 연결을 위한 노드 목록|각 서버의 설정 항목|
    |host|각 ClickHouse keeper 노드의 호스트 이름, IP 또는 FQDN| `chnode1.domain.com`|
    |port|ClickHouse Keeper 클라이언트 포트| 9181|

5. ClickHouse를 재시작하고 각 Keeper 인스턴스가 실행 중인지 확인합니다. 각 서버에서 다음 명령을 실행합니다. `ruok` 명령은 Keeper가 실행 중이고 건강할 때 `imok`를 반환합니다:
```bash

# echo ruok | nc localhost 9181; echo
imok
```

6. `system` 데이터베이스에는 ClickHouse Keeper 인스턴스의 세부 정보를 포함하는 `zookeeper`라는 테이블이 있습니다. 테이블을 조회해보겠습니다:
```sql
SELECT *
FROM system.zookeeper
WHERE path IN ('/', '/clickhouse')
```

    테이블은 다음과 같이 보입니다:
```response
┌─name───────┬─value─┬─czxid─┬─mzxid─┬───────────────ctime─┬───────────────mtime─┬─version─┬─cversion─┬─aversion─┬─ephemeralOwner─┬─dataLength─┬─numChildren─┬─pzxid─┬─path────────┐
│ clickhouse │       │   124 │   124 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        2 │        0 │              0 │          0 │           2 │  5693 │ /           │
│ task_queue │       │   125 │   125 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        1 │        0 │              0 │          0 │           1 │   126 │ /clickhouse │
│ tables     │       │  5693 │  5693 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        3 │        0 │              0 │          0 │           3 │  6461 │ /clickhouse │
└────────────┴───────┴───────┴───────┴─────────────────────┴─────────────────────┴─────────┴──────────┴──────────┴────────────────┴────────────┴─────────────┴───────┴─────────────┘
```
### 2.  Configure a cluster in ClickHouse {#2--configure-a-cluster-in-clickhouse}

1. 2개의 샤드와 하나의 복제본만 있는 간단한 클러스터를 구성합니다. 세 번째 노드는 ClickHouse Keeper의 요구 사항을 충족하기 위해 과반수를 얻는 데 사용할 것입니다. `chnode1` 및 `chnode2`의 구성을 업데이트합니다. 다음 클러스터는 각 노드에 1개의 샤드를 정의하여 총 2개의 샤드로 반복이 없습니다. 이 예제에서는 일부 데이터가 한 노드에, 일부가 다른 노드에 위치하게 됩니다:
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
    |shard   |클러스터 정의에서 복제본 목록|각 샤드에 대한 복제본 목록|
    |replica|각 복제본에 대한 설정 목록|각 복제본의 설정 항목|
    |host|복제본 샤드를 호스팅할 서버의 호스트 이름, IP 또는 FQDN|`chnode1.domain.com`|
    |port|네이티브 TCP 프로토콜을 사용하여 통신하는 데 사용되는 포트|9000|
    |user|클러스터 인스턴스에 인증하는 데 사용되는 사용자 이름|default|
    |password|클러스터 인스턴스에 연결을 허용하는 사용자의 비밀번호|`ClickHouse123!`|

2. ClickHouse를 재시작하고 클러스터가 생성되었는지 확인합니다:
```bash
SHOW clusters;
```

    클러스터를 확인할 수 있어야 합니다:
```response
┌─cluster───────┐
│ cluster_2S_1R │
└───────────────┘
```
### 3. Create and test distributed table {#3-create-and-test-distributed-table}

1. `chnode1`에서 ClickHouse 클라이언트를 사용하여 새로운 데이터베이스를 생성합니다. `ON CLUSTER` 절은 두 노드 모두에 데이터베이스를 자동으로 생성합니다.
```sql
CREATE DATABASE db1 ON CLUSTER 'cluster_2S_1R';
```

2. `db1` 데이터베이스에 새 테이블을 생성합니다. 다시 한 번, `ON CLUSTER`는 두 노드 모두에 테이블을 생성합니다.
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

4. `chnode2` 노드에서 몇 개의 행을 추가합니다:
```sql
INSERT INTO db1.table1
    (id, column1)
VALUES
    (3, 'ghi'),
    (4, 'jkl')
```

5. 각 노드에서 `SELECT` 문을 실행하면 해당 노드의 데이터만 표시되는 것을 주목하십시오. 예를 들어, `chnode1`에서:
```sql
SELECT *
FROM db1.table1
```

```response
Query id: 7ef1edbc-df25-462b-a9d4-3fe6f9cb0b6d

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
└────┴─────────┘

2 rows in set. Elapsed: 0.006 sec.
```

    `chnode2`에서:
6.
```sql
SELECT *
FROM db1.table1
```

```response
Query id: c43763cc-c69c-4bcc-afbe-50e764adfcbf

┌─id─┬─column1─┐
│  3 │ ghi     │
│  4 │ jkl     │
└────┴─────────┘
```

6. 두 샤드의 데이터를 나타내는 `Distributed` 테이블을 생성할 수 있습니다. `Distributed` 테이블 엔진을 가진 테이블은 자체 데이터를 저장하지 않지만 여러 서버에서 분산 쿼리 처리를 가능하게 합니다. 읽기는 모든 샤드에 히트를 주며, 쓰기는 샤드 전체에 분산될 수 있습니다. `chnode1`에서 다음 쿼리를 실행하세요:
```sql
CREATE TABLE db1.dist_table (
    id UInt64,
    column1 String
)
ENGINE = Distributed(cluster_2S_1R,db1,table1)
```

7. `dist_table` 쿼리를 실행하면 두 샤드에서 총 네 개의 데이터 행이 반환되는 것을 주목하십시오:
```sql
SELECT *
FROM db1.dist_table
```

```response
Query id: 495bffa0-f849-4a0c-aeea-d7115a54747a

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
└────┴─────────┘
┌─id─┬─column1─┐
│  3 │ ghi     │
│  4 │ jkl     │
└────┴─────────┘

4 rows in set. Elapsed: 0.018 sec.
```
### Summary {#summary}

이 가이드는 ClickHouse Keeper를 사용하여 클러스터를 설정하는 방법을 시연했습니다. ClickHouse Keeper를 사용하면 클러스터를 구성하고 샤드 간에 복제할 수 있는 분산 테이블을 정의할 수 있습니다.
## Configuring ClickHouse Keeper with unique paths {#configuring-clickhouse-keeper-with-unique-paths}

<SelfManaged />
### Description {#description}

이 문서에서는 내장된 `{uuid}` 매크로 설정을 사용하여 ClickHouse Keeper 또는 ZooKeeper에서 고유한 항목을 만드는 방법을 설명합니다. 고유한 경로는 테이블을 자주 생성하고 삭제할 때 도움이 됩니다. 이는 경로가 생성될 때마다 새로운 `uuid`가 사용되므로 Keeper 가비지 수집이 경로 항목을 제거하기 위해 몇 분을 기다릴 필요 없이 경로가 재사용되지 않도록 합니다.
### Example environment {#example-environment}
ClickHouse Keeper가 모든 세 노드에서 실행되고 ClickHouse가 두 개 노드에서 실행되는 클러스터입니다. 이렇게 하면 ClickHouse Keeper가 3개의 노드(타이브레이커 노드 포함)를 가지며, 2개의 복제본으로 구성된 단일 ClickHouse 샤드가 생성됩니다.

|node|description|
|-----|-----|
|`chnode1.marsnet.local`|데이터 노드 - 클러스터 `cluster_1S_2R`|
|`chnode2.marsnet.local`|데이터 노드 - 클러스터 `cluster_1S_2R`|
|`chnode3.marsnet.local`| ClickHouse Keeper 타이브레이커 노드|

클러스터에 대한 예제 구성:
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
### Procedures to set up tables to use `{uuid}` {#procedures-to-set-up-tables-to-use-uuid}

1. 각 서버에서 매크로를 구성합니다.
서버 1의 예:
```xml
<macros>
    <shard>1</shard>
    <replica>replica_1</replica>
</macros>
```
:::note
`shard` 및 `replica`에 대한 매크로를 정의하지만, `{uuid}`는 여기서 정의되지 않으며 내장되어 있으므로 정의할 필요가 없습니다.
:::

2. 데이터베이스를 생성합니다.

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

3. 매크로와 `{uuid}`를 사용하여 클러스터에서 테이블을 생성합니다.

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

4.  분산 테이블을 생성합니다.

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
### Testing {#testing}
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

3. 분산 테이블을 사용하여 레코드를 조회합니다.
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
### Alternatives {#alternatives}
기본 복제 경로는 매크로 및 `{uuid}`를 사용하여 미리 정의할 수 있습니다.

1. 각 노드의 기본값 설정
```xml
<default_replica_path>/clickhouse/tables/{shard}/db_uuid/{uuid}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```
:::tip
특정 데이터베이스에 대해 노드가 사용되는 경우 각 노드에서 `{database}` 매크로를 정의할 수 있습니다.
:::

2. 명시적인 매개변수 없이 테이블을 생성합니다:
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

3. 기본 구성에서 사용된 설정을 확인합니다.
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
### Troubleshooting {#troubleshooting}

테이블 정보 및 UUID를 얻기 위한 예제 명령:
```sql
SELECT * FROM system.tables
WHERE database = 'db_uuid' AND name = 'uuid_table1';
```

위 테이블에 대한 UUID로 ZooKeeper에서 테이블 정보 얻기 위한 예제 명령
```sql
SELECT * FROM system.zookeeper
WHERE path = '/clickhouse/tables/1/db_uuid/9e8a3cc2-0dec-4438-81a7-c3e63ce2a1cf/replicas';
```

:::note
데이터베이스는 `Atomic`이어야 하며, 이전 버전에서 업그레이드하는 경우 기본 데이터베이스는 `Ordinary` 유형일 수 있습니다.
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
## ClickHouse Keeper dynamic reconfiguration {#reconfiguration}

<SelfManaged />
### Description {#description-1}

ClickHouse Keeper는 `keeper_server.enable_reconfiguration`가 활성화된 경우 동적 클러스터 재구성을 위한 ZooKeeper [`reconfig`](https://zookeeper.apache.org/doc/r3.5.3-beta/zookeeperReconfig.html#sc_reconfig_modifying) 명령을 부분적으로 지원합니다.

:::note
이 설정이 비활성화된 경우, 복제본의 `raft_configuration` 섹션을 수동으로 변경하여 클러스터를 재구성할 수 있습니다. 변경 사항을 적용할 수 있는 것은 리더만이므로 모든 복제본에서 파일을 수정해야 합니다.
또는 ZooKeeper 호환 클라이언트를 통해 `reconfig` 쿼리를 보낼 수 있습니다.
:::

가상 노드 `/keeper/config`는 다음 형식의 마지막으로 커밋된 클러스터 구성을 포함합니다:

```text
server.id = server_host:server_port[;server_type][;server_priority]
server.id2 = ...
...
```

- 각 서버 항목은 줄 바꿈으로 구분됩니다.
- `server_type`은 `participant` 또는 `learner`입니다. ([learner](https://github.com/eBay/NuRaft/blob/master/docs/readonly_member.md)는 리더 선거에 참여하지 않습니다.)
- `server_priority`는 [리더 선거에서 우선시될 노드를 알려주는](https://github.com/eBay/NuRaft/blob/master/docs/leader_election_priority.md) 음수가 아닌 정수입니다.
  Priority가 0이면 해당 서버는 결코 리더가 되지 않습니다.

예시:

```sql
:) get /keeper/config
server.1=zoo1:9234;participant;1
server.2=zoo2:9234;participant;1
server.3=zoo3:9234;participant;1
```

`reconfig` 명령을 사용하여 새 서버를 추가하거나 기존 서버를 제거하거나 기존 서버의 우선 순위를 변경할 수 있습니다. 다음은 `clickhouse-keeper-client`를 사용하는 예입니다:

```bash

# Add two new servers
reconfig add "server.5=localhost:123,server.6=localhost:234;learner"

# Remove two other servers
reconfig remove "3,4"

# Change existing server priority to 8
reconfig add "server.5=localhost:5123;participant;8"
```

그리고 `kazoo`에 대한 예는 다음과 같습니다:

```python

# Add two new servers, remove two other servers
reconfig(joining="server.5=localhost:123,server.6=localhost:234;learner", leaving="3,4")


# Change existing server priority to 8
reconfig(joining="server.5=localhost:5123;participant;8", leaving=None)
```

`joining`의 서버는 위에서 설명한 서버 형식이어야 합니다. 서버 항목은 쉼표로 구분되어야 합니다.
새 서버를 추가하는 동안 `server_priority`(기본값은 1) 및 `server_type`(기본값은 `participant`)을 생략할 수 있습니다.

기존 서버의 우선 순위를 변경하려면 `joining`에 대상 우선 순위와 함께 추가합니다.
서버의 호스트, 포트 및 유형은 기존 서버 구성과 같아야 합니다.

서버는 `joining` 및 `leaving`에 나타나는 순서대로 추가되고 제거됩니다.
`joining`의 모든 업데이트는 `leaving`의 업데이트보다 먼저 처리됩니다.

Keeper 재구성 구현에는 몇 가지 주의 사항이 있습니다:

- 증분 재구성만 지원됩니다. 비어 있지 않은 `new_members`를 가진 요청은 거부됩니다.

  ClickHouse Keeper 구현은 NuRaft API를 사용하여 멤버십을 동적으로 변경합니다. NuRaft는 한 번에 하나의 서버를 추가하거나 제거하는 방법이 있습니다. 즉, 구성의 각 변경(각 `joining`의 일부, 각 `leaving`의 일부)은 별도로 결정해야 합니다. 따라서 대량 재구성은 제공되지 않습니다. 이는 최종 사용자에게 오해를 줄 수 있습니다.

  서버 유형(참여자/학습자)을 변경하는 것도 가능하지 않습니다. NuRaft에서 지원되지 않으며, 유일한 방법은 서버를 제거하고 추가하는 것입니다. 이것 또한 오해를 불러일으킬 수 있습니다.

- 반납된 `znodestat` 값을 사용할 수 없습니다.
- `from_version` 필드는 사용되지 않습니다. `from_version`이 설정된 모든 요청은 거부됩니다. 이는 `/keeper/config`가 가상 노드이므로 지속적 저장소에 저장되지 않고, 매 요청마다 지정된 노드 구성을 통해 생성되기 때문입니다. 이러한 결정은 NuRaft가 이미 이 구성을 저장하고 있으므로 데이터를 중복 저장하지 않기 위해 이루어졌습니다.
- ZooKeeper와 달리 `sync` 명령을 제출하여 클러스터 재구성을 기다릴 수 있는 방법이 없습니다. 새 구성은 _최종적으로_ 적용되지만 시간 보장이 없습니다.
- `reconfig` 명령은 여러 가지 이유로 실패할 수 있습니다. 클러스터의 상태를 확인하고 업데이트가 적용되었는지 확인할 수 있습니다.
## Converting a single-node keeper into a cluster {#converting-a-single-node-keeper-into-a-cluster}

때때로 실험적인 Keeper 노드를 클러스터로 확장해야 할 필요가 있습니다. 3개 노드 클러스터를 위한 단계별 방법을 다음과 같이 설명합니다:

- **중요**: 새로운 노드는 현재 과반수보다 적은 배치로 추가해야 하며, 그렇지 않으면 그들 사이에서 리더를 선출합니다. 이 예에서는 하나씩 추가합니다.
- 기존 Keeper 노드는 `keeper_server.enable_reconfiguration` 구성 매개변수가 활성화되어 있어야 합니다.
- Keeper 클러스터의 전체 새로운 구성으로 두 번째 노드를 시작합니다.
- 시작되면 첫 번째 노드에 추가합니다. [`reconfig`](#reconfiguration)를 사용합니다.
- 이제 세 번째 노드를 시작하고 [`reconfig`](#reconfiguration)로 추가합니다.
- 새로운 Keeper 노드를 추가하여 `clickhouse-server` 구성을 업데이트하고 변경 사항을 적용하기 위해 재시작합니다.
- 첫 번째 노드의 raft 구성을 업데이트하고, 선택적으로 재시작입니다.

이 과정에 익숙해지려면 [샌드박스 저장소](https://github.com/ClickHouse/keeper-extend-cluster)를 참조하세요.
## Unsupported features {#unsupported-features}

ClickHouse Keeper는 ZooKeeper와 완전히 호환되는 것을 목표로 하지만 현재 구현되지 않은 몇 가지 기능이 있습니다(개발은 진행 중입니다):

- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat))는 `Stat` 객체를 반환하는 것을 지원하지 않습니다.
- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat))는 [TTL](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/CreateMode.html#PERSISTENT_WITH_TTL)을 지원하지 않습니다.
- [`addWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#addWatch(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.AddWatchMode))는 [`PERSISTENT`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/AddWatchMode.html#PERSISTENT) 감시자와 함께 작동하지 않습니다.
- [`removeWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.Watcher.WatcherType,boolean)) 및 [`removeAllWatches`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeAllWatches(java.lang.String,org.apache.zookeeper.Watcher.WatcherType,boolean))는 지원되지 않습니다.
- `setWatches`는 지원되지 않습니다.
- [`CONTAINER`](https://zookeeper.apache.org/doc/r3.5.1-alpha/api/org/apache/zookeeper/CreateMode.html) 유형의 znodes 생성은 지원되지 않습니다.
- [`SASL authentication`](https://cwiki.apache.org/confluence/display/ZOOKEEPER/Zookeeper+and+SASL)는 지원되지 않습니다.
