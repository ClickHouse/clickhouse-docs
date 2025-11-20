---
'slug': '/architecture/replication'
'sidebar_label': '복제'
'sidebar_position': 10
'title': '데이터 복제'
'description': '서버 다섯 개가 구성된 예제 아키텍처를 설명하는 페이지입니다. 두 개는 데이터의 복사본을 호스팅하는 데 사용되며 나머지는
  데이터 복제를 조정하는 데 사용됩니다.'
'doc_type': 'guide'
'keywords':
- 'replication'
- 'high availability'
- 'cluster setup'
- 'data redundancy'
- 'fault tolerance'
---

import Image from '@theme/IdealImage';
import ReplicationShardingTerminology from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_replication-sharding-terminology.md';
import ReplicationArchitecture from '@site/static/images/deployment-guides/replication-sharding-examples/replication.png';
import ConfigFileNote from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_config-files.md';
import KeeperConfigFileNote from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_keeper-config-files.md';
import ConfigExplanation from '@site/i18n/ko/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_config_explanation.mdx';
import ListenHost from '@site/i18n/ko/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_listen_host.mdx';
import ServerParameterTable from '@site/i18n/ko/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_server_parameter_table.mdx';
import KeeperConfig from '@site/i18n/ko/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_keeper_config.mdx';
import KeeperConfigExplanation from '@site/i18n/ko/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_keeper_explanation.mdx';
import VerifyKeeperStatus from '@site/i18n/ko/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_verify_keeper_using_mntr.mdx';
import DedicatedKeeperServers from '@site/i18n/ko/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_dedicated_keeper_servers.mdx';
import ExampleFiles from '@site/i18n/ko/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_working_example.mdx';
import CloudTip from '@site/i18n/ko/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_cloud_tip.mdx';

> 이 예제에서는 데이터를 복제하는 간단한 ClickHouse 클러스터를 설정하는 방법을 배웁니다. 총 다섯 대의 서버가 구성되어 있습니다. 두 대의 서버는 데이터 복사본을 호스팅하는 데 사용되며, 나머지 세 대의 서버는 데이터 복제를 조율하는 데 사용됩니다.

설정할 클러스터의 아키텍처는 아래와 같습니다:

<Image img={ReplicationArchitecture} size="md" alt="1 샤드 및 2 복제본을 위한 아키텍처 다이어그램" />

<DedicatedKeeperServers/>

## 필수 조건 {#pre-requisites}

- 이전에 [로컬 ClickHouse 서버](/install)를 설정한 적이 있다.
- ClickHouse의 기본 구성 파일 개념, 예를 들어 [구성 파일](/operations/configuration-files)에 익숙하다.
- 머신에 Docker가 설치되어 있다.

<VerticalStepper level="h2">

## 디렉토리 구조 및 테스트 환경 설정 {#set-up}

<ExampleFiles/>

이 튜토리얼에서는 [Docker Compose](https://docs.docker.com/compose/)를 사용하여 ClickHouse 클러스터를 설정합니다. 이 설정은 별도의 로컬 머신, 가상 머신 또는 클라우드 인스턴스에서도 작동하도록 수정될 수 있습니다.

다음 명령어를 실행하여 이 예제의 디렉토리 구조를 설정합니다:

```bash
mkdir cluster_1S_2R
cd cluster_1S_2R


# Create clickhouse-keeper directories
for i in {01..03}; do
  mkdir -p fs/volumes/clickhouse-keeper-${i}/etc/clickhouse-keeper
done


# Create clickhouse-server directories
for i in {01..02}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server
done
```

다음 `docker-compose.yml` 파일을 `cluster_1S_2R` 디렉토리에 추가합니다:

```yaml title="docker-compose.yml"
version: '3.8'
services:
  clickhouse-01:
    image: "clickhouse/clickhouse-server:latest"
    user: "101:101"
    container_name: clickhouse-01
    hostname: clickhouse-01
    volumes:
      - ${PWD}/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml:/etc/clickhouse-server/config.d/config.xml
      - ${PWD}/fs/volumes/clickhouse-01/etc/clickhouse-server/users.d/users.xml:/etc/clickhouse-server/users.d/users.xml
    ports:
      - "127.0.0.1:8123:8123"
      - "127.0.0.1:9000:9000"
    depends_on:
      - clickhouse-keeper-01
      - clickhouse-keeper-02
      - clickhouse-keeper-03
  clickhouse-02:
    image: "clickhouse/clickhouse-server:latest"
    user: "101:101"
    container_name: clickhouse-02
    hostname: clickhouse-02
    volumes:
      - ${PWD}/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml:/etc/clickhouse-server/config.d/config.xml
      - ${PWD}/fs/volumes/clickhouse-02/etc/clickhouse-server/users.d/users.xml:/etc/clickhouse-server/users.d/users.xml
    ports:
      - "127.0.0.1:8124:8123"
      - "127.0.0.1:9001:9000"
    depends_on:
      - clickhouse-keeper-01
      - clickhouse-keeper-02
      - clickhouse-keeper-03
  clickhouse-keeper-01:
    image: "clickhouse/clickhouse-keeper:latest-alpine"
    user: "101:101"
    container_name: clickhouse-keeper-01
    hostname: clickhouse-keeper-01
    volumes:
     - ${PWD}/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml:/etc/clickhouse-keeper/keeper_config.xml
    ports:
        - "127.0.0.1:9181:9181"
  clickhouse-keeper-02:
    image: "clickhouse/clickhouse-keeper:latest-alpine"
    user: "101:101"
    container_name: clickhouse-keeper-02
    hostname: clickhouse-keeper-02
    volumes:
     - ${PWD}/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml:/etc/clickhouse-keeper/keeper_config.xml
    ports:
        - "127.0.0.1:9182:9181"
  clickhouse-keeper-03:
    image: "clickhouse/clickhouse-keeper:latest-alpine"
    user: "101:101"
    container_name: clickhouse-keeper-03
    hostname: clickhouse-keeper-03
    volumes:
     - ${PWD}/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml:/etc/clickhouse-keeper/keeper_config.xml
    ports:
        - "127.0.0.1:9183:9181"
```

다음 하위 디렉토리 및 파일을 생성합니다:

```bash
for i in {01..02}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d/config.xml
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d/users.xml
done
```

<ConfigExplanation/>

## ClickHouse 노드 구성 {#configure-clickhouse-servers}

### 서버 설정 {#server-setup}

이제 `fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d`에 위치한 각 빈 구성 파일 `config.xml`을 수정합니다. 아래에 강조된 줄은 각 노드에 맞게 변경해야 합니다:

```xml
<clickhouse replace="true">
    <logger>
        <level>debug</level>
        <log>/var/log/clickhouse-server/clickhouse-server.log</log>
        <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <!--highlight-next-line-->
    <display_name>cluster_1S_2R node 1</display_name>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <user_directories>
        <users_xml>
            <path>users.xml</path>
        </users_xml>
        <local_directory>
            <path>/var/lib/clickhouse/access/</path>
        </local_directory>
    </user_directories>
    <distributed_ddl>
        <path>/clickhouse/task_queue/ddl</path>
    </distributed_ddl>
    <remote_servers>
        <cluster_1S_2R>
            <shard>
                <internal_replication>true</internal_replication>
                <replica>
                    <host>clickhouse-01</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>clickhouse-02</host>
                    <port>9000</port>
                </replica>
            </shard>
        </cluster_1S_2R>
    </remote_servers>
    <zookeeper>
        <node>
            <host>clickhouse-keeper-01</host>
            <port>9181</port>
        </node>
        <node>
            <host>clickhouse-keeper-02</host>
            <port>9181</port>
        </node>
        <node>
            <host>clickhouse-keeper-03</host>
            <port>9181</port>
        </node>
    </zookeeper>
    <!--highlight-start-->
    <macros>
        <shard>01</shard>
        <replica>01</replica>
        <cluster>cluster_1S_2R</cluster>
    </macros>
    <!--highlight-end-->
</clickhouse>
```

| 디렉토리                                                  | 파일                                                                                                                                                                               |
|-----------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml)  |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml)  |

위 구성 파일의 각 섹션은 아래에서 더 자세히 설명됩니다.

#### 네트워킹 및 로깅 {#networking}

<ListenHost/>

로깅은 `<logger>` 블록에 정의됩니다. 이 예제 구성은 1000M에서 세 번 롤오버되는 디버그 로그를 제공합니다:

```xml
<logger>
    <level>debug</level>
    <log>/var/log/clickhouse-server/clickhouse-server.log</log>
    <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
    <size>1000M</size>
    <count>3</count>
</logger>
```

로깅 구성에 대한 자세한 내용은 기본 ClickHouse의 [구성 파일](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)에 포함된 주석을 참조하세요.

#### 클러스터 구성 {#cluster-configuration}

클러스터에 대한 구성은 `<remote_servers>` 블록에서 설정됩니다. 여기에서 클러스터 이름 `cluster_1S_2R`이 정의됩니다.

`<cluster_1S_2R></cluster_1S_2R>` 블록은 클러스터의 레이아웃을 정의하며, `<shard></shard>` 및 `<replica></replica>` 설정을 사용하고, `ON CLUSTER` 절을 사용하여 클러스터 전역에서 실행되는 분산 DDL 쿼리의 템플릿 역할을 합니다. 기본적으로 분산 DDL 쿼리는 허용되지만, `allow_distributed_ddl_queries` 설정으로 꺼둘 수도 있습니다.

`internal_replication`이 true로 설정되어 있어 데이터가 단 하나의 복제본에만 기록됩니다.

```xml
<remote_servers>
    <!-- cluster name (should not contain dots) -->
    <cluster_1S_2R>
        <!-- <allow_distributed_ddl_queries>false</allow_distributed_ddl_queries> -->
        <shard>
            <!-- Optional. Whether to write data to just one of the replicas. Default: false (write data to all replicas). -->
            <internal_replication>true</internal_replication>
            <replica>
                <host>clickhouse-01</host>
                <port>9000</port>
            </replica>
            <replica>
                <host>clickhouse-02</host>
                <port>9000</port>
            </replica>
        </shard>
    </cluster_1S_2R>
</remote_servers>
```

<ServerParameterTable/>

#### 키퍼 구성 {#keeper-config-explanation}

`<ZooKeeper>` 섹션은 ClickHouse가 ClickHouse Keeper (또는 ZooKeeper)가 실행되고 있는 위치를 알려줍니다. ClickHouse Keeper 클러스터를 사용하는 만큼, 클러스터의 각 `<node>`는 호스트 이름과 포트 번호를 `<host>` 및 `<port>` 태그를 사용하여 각각 지정해야 합니다.

ClickHouse Keeper의 설정은 튜토리얼의 다음 단계에서 설명됩니다.

```xml
<zookeeper>
    <node>
        <host>clickhouse-keeper-01</host>
        <port>9181</port>
    </node>
    <node>
        <host>clickhouse-keeper-02</host>
        <port>9181</port>
    </node>
    <node>
        <host>clickhouse-keeper-03</host>
        <port>9181</port>
    </node>
</zookeeper>
```

:::note
ClickHouse Keeper를 ClickHouse Server와 동일한 서버에서 실행할 수 있지만, 
생산 환경에서는 ClickHouse Keeper를 전용 호스트에서 실행할 것을 강력히 권장합니다.
:::

#### 매크로 구성 {#macros-config-explanation}

또한, `<macros>` 섹션은 복제 테이블을 위한 매개변수 치환을 정의하는 데 사용됩니다. 이들 매크로는 `system.macros`에 나열되며, 쿼리에서 `{shard}`와 `{replica}`와 같은 치환을 사용할 수 있게 해줍니다.

```xml
<macros>
    <shard>01</shard>
    <replica>01</replica>
    <cluster>cluster_1S_2R</cluster>
</macros>
```

:::note
이들은 클러스터의 레이아웃에 따라 고유하게 정의됩니다.
:::

### 사용자 구성 {#user-config}

이제 `fs/volumes/clickhouse-{}/etc/clickhouse-server/users.d`에 위치한 각 빈 구성 파일 `users.xml`을 다음 내용으로 수정합니다:

```xml title="/users.d/users.xml"
<?xml version="1.0"?>
<clickhouse replace="true">
    <profiles>
        <default>
            <max_memory_usage>10000000000</max_memory_usage>
            <use_uncompressed_cache>0</use_uncompressed_cache>
            <load_balancing>in_order</load_balancing>
            <log_queries>1</log_queries>
        </default>
    </profiles>
    <users>
        <default>
            <access_management>1</access_management>
            <profile>default</profile>
            <networks>
                <ip>::/0</ip>
            </networks>
            <quota>default</quota>
            <access_management>1</access_management>
            <named_collection_control>1</named_collection_control>
            <show_named_collections>1</show_named_collections>
            <show_named_collections_secrets>1</show_named_collections_secrets>
        </default>
    </users>
    <quotas>
        <default>
            <interval>
                <duration>3600</duration>
                <queries>0</queries>
                <errors>0</errors>
                <result_rows>0</result_rows>
                <read_rows>0</read_rows>
                <execution_time>0</execution_time>
            </interval>
        </default>
    </quotas>
</clickhouse>
```

| 디렉토리                                                   | 파일                                                                                                                                                                             |
|-----------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-01/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/users.d/users.xml)    |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/users.d/users.xml)    |

이 예제에서는 기본 사용자에게 단순함을 위해 비밀번호 없이 구성합니다.
실제로는 이는 권장되지 않습니다.

:::note
이 예제에서 각 `users.xml` 파일은 클러스터의 모든 노드에 대해 동일합니다.
:::

## ClickHouse Keeper 구성 {#configure-clickhouse-keeper-nodes}

### 키퍼 설정 {#configuration-explanation}

<KeeperConfig/>

| 디렉토리                                                       | 파일                                                                                                                                                                                          |
|---------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

<KeeperConfigExplanation/>

<CloudTip/>

## 설정 테스트 {#test-the-setup}

먼저 Docker가 머신에서 실행되고 있는지 확인합니다.
`cluster_1S_2R` 디렉토리의 루트에서 `docker-compose up` 명령어를 사용하여 클러스터를 시작합니다:

```bash
docker-compose up -d
```

ClickHouse 및 Keeper 이미지를 가져오고 컨테이너를 시작하는 것을 확인할 수 있습니다:

```bash
[+] Running 6/6
 ✔ Network cluster_1s_2r_default   Created
 ✔ Container clickhouse-keeper-03  Started
 ✔ Container clickhouse-keeper-02  Started
 ✔ Container clickhouse-keeper-01  Started
 ✔ Container clickhouse-01         Started
 ✔ Container clickhouse-02         Started
```

클러스터가 실행되고 있는지 확인하려면 `clickhouse-01` 또는 `clickhouse-02`에 연결하고 다음 쿼리를 실행합니다. 첫 번째 노드에 연결하는 명령은 다음과 같습니다:

```bash

# Connect to any node
docker exec -it clickhouse-01 clickhouse-client
```

성공하면 ClickHouse 클라이언트 프롬프트가 표시됩니다:

```response
cluster_1S_2R node 1 :)
```

다음 쿼리를 실행하여 어떤 호스트에 대해 어떤 클러스터 토폴로지가 정의되어 있는지 확인합니다:

```sql title="Query"
SELECT 
    cluster,
    shard_num,
    replica_num,
    host_name,
    port
FROM system.clusters;
```

```response title="Response"
   ┌─cluster───────┬─shard_num─┬─replica_num─┬─host_name─────┬─port─┐
1. │ cluster_1S_2R │         1 │           1 │ clickhouse-01 │ 9000 │
2. │ cluster_1S_2R │         1 │           2 │ clickhouse-02 │ 9000 │
3. │ default       │         1 │           1 │ localhost     │ 9000 │
   └───────────────┴───────────┴─────────────┴───────────────┴──────┘
```

다음 쿼리를 실행하여 ClickHouse Keeper 클러스터의 상태를 확인합니다:

```sql title="Query"
SELECT *
FROM system.zookeeper
WHERE path IN ('/', '/clickhouse')
```

```response title="Response"
   ┌─name───────┬─value─┬─path────────┐
1. │ sessions   │       │ /clickhouse │
2. │ task_queue │       │ /clickhouse │
3. │ keeper     │       │ /           │
4. │ clickhouse │       │ /           │
   └────────────┴───────┴─────────────┘
```

<VerifyKeeperStatus/>

이를 통해 단일 샤드 및 두 개의 복제본을 가진 ClickHouse 클러스터를 성공적으로 설정했습니다.
다음 단계에서는 클러스터에서 테이블을 생성합니다.

## 데이터베이스 생성 {#creating-a-database}

클러스터가 제대로 설정되어 실행되고 있음을 확인한 후, 
[UK property prices](/getting-started/example-datasets/uk-price-paid) 예제 데이터셋 튜토리얼에서 사용된 것과 동일한 테이블을 재구성합니다. 이 데이터셋은 1995년 이후 영국 및 웨일즈의 부동산 가격에 대한 약 3천만 개의 행으로 구성되어 있습니다.

각 호스트의 클라이언트에 연결하려면 다음 명령어를 별도의 터미널 탭 또는 창에서 실행합니다:

```bash
docker exec -it clickhouse-01 clickhouse-client
docker exec -it clickhouse-02 clickhouse-client
```

아래 쿼리를 각 호스트의 ClickHouse 클라이언트에서 실행하여 기본 데이터베이스 외에 생성된 데이터베이스가 없음을 확인합니다:

```sql title="Query"
SHOW DATABASES;
```

```response title="Response"
   ┌─name───────────────┐
1. │ INFORMATION_SCHEMA │
2. │ default            │
3. │ information_schema │
4. │ system             │
   └────────────────────┘
```

`clickhouse-01` 클라이언트에서 `ON CLUSTER` 절을 사용하여 `uk`라는 새 데이터베이스를 만드는 **분산** DDL 쿼리를 실행합니다:

```sql
CREATE DATABASE IF NOT EXISTS uk 
-- highlight-next-line
ON CLUSTER cluster_1S_2R;
```

이전에 모든 호스트의 클라이언트에서 동일한 쿼리를 다시 실행하여 `clickhouse-01`에서만 쿼리를 실행했음에도 불구하고 클러스터 전체에 데이터베이스가 생성되었음을 확인할 수 있습니다:

```sql
SHOW DATABASES;
```

```response
   ┌─name───────────────┐
1. │ INFORMATION_SCHEMA │
2. │ default            │
3. │ information_schema │
4. │ system             │
#highlight-next-line
5. │ uk                 │
   └────────────────────┘
```

## 클러스터에서 테이블 생성 {#creating-a-table}

데이터베이스가 생성되었으므로 클러스터에서 테이블을 만듭니다.
다음 쿼리를 모든 호스트 클라이언트에서 실행합니다:

```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_local
--highlight-next-line
ON CLUSTER cluster_1S_2R
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4, 'other' = 0),
    is_new UInt8,
    duration Enum8('freehold' = 1, 'leasehold' = 2, 'unknown' = 0),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
--highlight-next-line
ENGINE = ReplicatedMergeTree
ORDER BY (postcode1, postcode2, addr1, addr2);
```

이 쿼리는 원래 `CREATE` 문에서 사용된 쿼리와 동일하며, 
[UK property prices](/getting-started/example-datasets/uk-price-paid) 예제 데이터셋 튜토리얼에서 `ON CLUSTER` 절과 `ReplicatedMergeTree` 엔진 사용을 제외한 것입니다.

`ON CLUSTER` 절은 `CREATE`, `DROP`, `ALTER`, `RENAME`과 같은 DDL (데이터 정의 언어) 쿼리의 분산 실행을 위해 설계되었으며, 이러한 스키마 변경이 클러스터의 모든 노드에 적용되도록 보장합니다.

[`ReplicatedMergeTree`](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replication#converting-from-mergetree-to-replicatedmergetree) 엔진은 일반적인 `MergeTree` 테이블 엔진과 동일하게 작동하지만, 데이터를 복제합니다.

클러스터 전체에 테이블이 생성되었는지 확인하기 위해 `clickhouse-01` 또는 `clickhouse-02` 클라이언트에서 다음 쿼리를 실행할 수 있습니다:

```sql title="Query"
SHOW TABLES IN uk;
```

```response title="Response"
   ┌─name────────────────┐
1. │ uk_price_paid.      │
   └─────────────────────┘
```

## 데이터 삽입 {#inserting-data}

데이터셋이 크고 완전히 수집하는 데 몇 분이 걸리므로, 
우리는 처음에 작은 하위 집합만 삽입할 것입니다.

`clickhouse-01`에서 아래 쿼리를 사용하여 더 작은 데이터 하위 집합을 삽입합니다:

```sql
INSERT INTO uk.uk_price_paid_local
SELECT
    toUInt32(price_string) AS price,
    parseDateTimeBestEffortUS(time) AS date,
    splitByChar(' ', postcode)[1] AS postcode1,
    splitByChar(' ', postcode)[2] AS postcode2,
    transform(a, ['T', 'S', 'D', 'F', 'O'], ['terraced', 'semi-detached', 'detached', 'flat', 'other']) AS type,
    b = 'Y' AS is_new,
    transform(c, ['F', 'L', 'U'], ['freehold', 'leasehold', 'unknown']) AS duration,
    addr1,
    addr2,
    street,
    locality,
    town,
    district,
    county
FROM url(
    'http://prod1.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-complete.csv',
    'CSV',
    'uuid_string String,
    price_string String,
    time String,
    postcode String,
    a String,
    b String,
    c String,
    addr1 String,
    addr2 String,
    street String,
    locality String,
    town String,
    district String,
    county String,
    d String,
    e String'
) LIMIT 10000
SETTINGS max_http_get_redirects=10;
```

각 호스트에서 데이터가 완전히 복제되는 것을 알 수 있습니다:

```sql
-- clickhouse-01
SELECT count(*)
FROM uk.uk_price_paid_local

--   ┌─count()─┐
-- 1.│   10000 │
--   └─────────┘

-- clickhouse-02
SELECT count(*)
FROM uk.uk_price_paid_local

--   ┌─count()─┐
-- 1.│   10000 │
--   └─────────┘
```

호스트 중 하나가 다운됐을 때의 상황을 시연하기 위해 간단한 테스트 데이터베이스와 테스트 테이블을 생성합니다:

```sql
CREATE DATABASE IF NOT EXISTS test ON CLUSTER cluster_1S_2R;
CREATE TABLE test.test_table ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `name` String
)
ENGINE = ReplicatedMergeTree
ORDER BY id;
```

`uk_price_paid` 테이블과 마찬가지로, 우리는 두 호스트 모두에서 데이터를 삽입할 수 있습니다:

```sql
INSERT INTO test.test_table (id, name) VALUES (1, 'Clicky McClickface');
```

하지만 호스트 중 하나가 다운되면 어떻게 될까요? 이를 시뮬레이션하기 위해 
`clickhouse-01`을 중지합니다:

```bash
docker stop clickhouse-01
```

다음 명령어를 실행하여 호스트가 다운되었는지 확인합니다:

```bash
docker-compose ps
```

```response title="Response"
NAME                   IMAGE                                        COMMAND            SERVICE                CREATED          STATUS          PORTS
clickhouse-02          clickhouse/clickhouse-server:latest          "/entrypoint.sh"   clickhouse-02          X minutes ago    Up X minutes    127.0.0.1:8124->8123/tcp, 127.0.0.1:9001->9000/tcp
clickhouse-keeper-01   clickhouse/clickhouse-keeper:latest-alpine   "/entrypoint.sh"   clickhouse-keeper-01   X minutes ago    Up X minutes    127.0.0.1:9181->9181/tcp
clickhouse-keeper-02   clickhouse/clickhouse-keeper:latest-alpine   "/entrypoint.sh"   clickhouse-keeper-02   X minutes ago    Up X minutes    127.0.0.1:9182->9181/tcp
clickhouse-keeper-03   clickhouse/clickhouse-keeper:latest-alpine   "/entrypoint.sh"   clickhouse-keeper-03   X minutes ago    Up X minutes    127.0.0.1:9183->9181/tcp
```

이제 `clickhouse-01`이 다운된 상태에서 테스트 테이블에 또 다른 행의 데이터를 삽입하고 해당 테이블을 쿼리합니다:

```sql
INSERT INTO test.test_table (id, name) VALUES (2, 'Alexey Milovidov');
SELECT * FROM test.test_table;
```

```response title="Response"
   ┌─id─┬─name───────────────┐
1. │  1 │ Clicky McClickface │
2. │  2 │ Alexey Milovidov   │
   └────┴────────────────────┘
```

다음 명령어로 `clickhouse-01`을 다시 시작합니다(확인을 위해 `docker-compose ps`를 다시 실행할 수 있습니다):

```sql
docker start clickhouse-01
```

`docker exec -it clickhouse-01 clickhouse-client` 명령어를 실행한 후 다시 `clickhouse-01`에서 테스트 테이블을 쿼리합니다:

```sql title="Query"
SELECT * FROM test.test_table
```

```response title="Response"
   ┌─id─┬─name───────────────┐
1. │  1 │ Clicky McClickface │
2. │  2 │ Alexey Milovidov   │
   └────┴────────────────────┘
```

이 시점에서 전체 UK 부동산 가격 데이터셋을 수집하고 싶다면,
다음 쿼리를 실행하여 그렇게 할 수 있습니다:

```sql
TRUNCATE TABLE uk.uk_price_paid_local ON CLUSTER cluster_1S_2R;
INSERT INTO uk.uk_price_paid_local
SELECT
    toUInt32(price_string) AS price,
    parseDateTimeBestEffortUS(time) AS date,
    splitByChar(' ', postcode)[1] AS postcode1,
    splitByChar(' ', postcode)[2] AS postcode2,
    transform(a, ['T', 'S', 'D', 'F', 'O'], ['terraced', 'semi-detached', 'detached', 'flat', 'other']) AS type,
    b = 'Y' AS is_new,
    transform(c, ['F', 'L', 'U'], ['freehold', 'leasehold', 'unknown']) AS duration,
    addr1,
    addr2,
    street,
    locality,
    town,
    district,
    county
FROM url(
    'http://prod1.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-complete.csv',
    'CSV',
    'uuid_string String,
    price_string String,
    time String,
    postcode String,
    a String,
    b String,
    c String,
    addr1 String,
    addr2 String,
    street String,
    locality String,
    town String,
    district String,
    county String,
    d String,
    e String'
    ) SETTINGS max_http_get_redirects=10;
```

`clickhouse-02` 또는 `clickhouse-01`에서 테이블을 쿼리합니다:

```sql title="Query"
SELECT count(*) FROM uk.uk_price_paid_local;
```

```response title="Response"
   ┌──count()─┐
1. │ 30212555 │ -- 30.21 million
   └──────────┘
```

</VerticalStepper>

## 결론 {#conclusion}

이 클러스터 토폴로지의 장점은 두 개의 복제본이 
두 개의 별도 호스트에 데이터가 존재한다는 것입니다. 하나의 호스트가 실패하면 다른 복제본이 데이터 제공을 계속하여 손실이 없습니다. 이는 저장소 수준에서 단일 실패 지점을 제거합니다.

하나의 호스트가 다운되면 남은 복제본은 다음을 수행할 수 있습니다:
- 중단 없이 읽기 쿼리 처리
- 새로운 쓰기 수락 (일관성 설정에 따라 다름)
- 애플리케이션을 위한 서비스 가용성 유지

장애가 발생한 호스트가 다시 온라인에 복구되면 다음을 실행할 수 있습니다:
- 건강한 복제본에서 누락된 데이터 자동 동기화
- 수동 개입 없이 정상 운영 재개
- 빠른 복원 전체 중복성

다음 예제에서는 두 개의 샤드를 갖지만 단 하나의 복제본으로 클러스터를 설정하는 방법을 살펴보겠습니다.
