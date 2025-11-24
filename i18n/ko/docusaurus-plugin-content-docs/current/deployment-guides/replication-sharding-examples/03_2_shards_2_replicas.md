---
'slug': '/architecture/cluster-deployment'
'sidebar_label': '복제 + 스케일링'
'sidebar_position': 100
'title': '복제 + 스케일링'
'description': '이 튜토리얼을 통해 간단한 ClickHouse 클러스터를 설정하는 방법을 배울 수 있습니다.'
'doc_type': 'guide'
'keywords':
- 'cluster deployment'
- 'replication'
- 'sharding'
- 'high availability'
- 'scalability'
---

import Image from '@theme/IdealImage';
import SharedReplicatedArchitecture from '@site/static/images/deployment-guides/replication-sharding-examples/both.png';
import ConfigExplanation from '@site/i18n/ko/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_config_explanation.mdx';
import ListenHost from '@site/i18n/ko/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_listen_host.mdx';
import KeeperConfig from '@site/i18n/ko/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_keeper_config.mdx';
import KeeperConfigExplanation from '@site/i18n/ko/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_keeper_explanation.mdx';
import VerifyKeeperStatus from '@site/i18n/ko/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_verify_keeper_using_mntr.mdx';
import DedicatedKeeperServers from '@site/i18n/ko/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_dedicated_keeper_servers.mdx';
import ExampleFiles from '@site/i18n/ko/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_working_example.mdx';
import CloudTip from '@site/i18n/ko/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_cloud_tip.mdx';

> 이 예제에서는 복제 및 확장이 모두 가능한 간단한 ClickHouse 클러스터를 설정하는 방법을 배웁니다. 이는 두 개의 샤드와 두 개의 복제본으로 구성되며, 클러스터의 조정을 관리하고 정족수를 유지하기 위한 3노드 ClickHouse Keeper 클러스터가 포함됩니다.

설정할 클러스터의 아키텍처는 아래와 같습니다:

<Image img={SharedReplicatedArchitecture} size='md' alt='Architecture diagram for 2 shards and 1 replica' />

<DedicatedKeeperServers/>

## 필수 조건 {#prerequisites}

- 이전에 [로컬 ClickHouse 서버](/install)를 설정한 적이 있습니다.
- ClickHouse의 기본 구성 개념, 예를 들어 [configuration files](/operations/configuration-files)에 익숙합니다.
- 머신에 Docker가 설치되어 있습니다.

<VerticalStepper level="h2">

## 디렉토리 구조 및 테스트 환경 설정 {#set-up}

<ExampleFiles/>

이 튜토리얼에서는 [Docker compose](https://docs.docker.com/compose/)를 사용하여 ClickHouse 클러스터를 설정할 것입니다. 이 설정은 별도의 로컬 머신, 가상 머신 또는 클라우드 인스턴스에서 작동하도록 수정할 수 있습니다.

다음 명령어를 실행하여 이 예제의 디렉토리 구조를 설정합니다:

```bash
mkdir cluster_2S_2R
cd cluster_2S_2R


# Create clickhouse-keeper directories
for i in {01..03}; do
  mkdir -p fs/volumes/clickhouse-keeper-${i}/etc/clickhouse-keeper
done


# Create clickhouse-server directories
for i in {01..04}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server
done
```

다음 `docker-compose.yml` 파일을 `clickhouse-cluster` 디렉토리에 추가하세요:

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
  clickhouse-03:
    image: "clickhouse/clickhouse-server:latest"
    user: "101:101"
    container_name: clickhouse-03
    hostname: clickhouse-03
    volumes:
      - ${PWD}/fs/volumes/clickhouse-03/etc/clickhouse-server/config.d/config.xml:/etc/clickhouse-server/config.d/config.xml
      - ${PWD}/fs/volumes/clickhouse-03/etc/clickhouse-server/users.d/users.xml:/etc/clickhouse-server/users.d/users.xml
    ports:
      - "127.0.0.1:8125:8123"
      - "127.0.0.1:9002:9000"
    depends_on:
      - clickhouse-keeper-01
      - clickhouse-keeper-02
      - clickhouse-keeper-03
  clickhouse-04:
    image: "clickhouse/clickhouse-server:latest"
    user: "101:101"
    container_name: clickhouse-04
    hostname: clickhouse-04
    volumes:
      - ${PWD}/fs/volumes/clickhouse-04/etc/clickhouse-server/config.d/config.xml:/etc/clickhouse-server/config.d/config.xml
      - ${PWD}/fs/volumes/clickhouse-04/etc/clickhouse-server/users.d/users.xml:/etc/clickhouse-server/users.d/users.xml
    ports:
      - "127.0.0.1:8126:8123"
      - "127.0.0.1:9003:9000"
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

다음 하위 디렉토리 및 파일을 생성하세요:

```bash
for i in {01..04}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d/config.xml
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d/users.xml
done
```

<ConfigExplanation/>

## ClickHouse 노드 구성 {#configure-clickhouse-servers}

### 서버 설정 {#server-setup}

이제 `fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d`에 위치한 각 빈 구성 파일 `config.xml`을 수정합니다. 아래 강조된 줄은 각 노드에 대해 구체적으로 변경해야 합니다:

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
    <display_name>cluster_2S_2R node 1</display_name>
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
        <cluster_2S_2R>
            <shard>
                <internal_replication>true</internal_replication>
                <replica>
                    <host>clickhouse-01</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>clickhouse-03</host>
                    <port>9000</port>
                </replica>
            </shard>
            <shard>
                <internal_replication>true</internal_replication>
                <replica>
                    <host>clickhouse-02</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>clickhouse-04</host>
                    <port>9000</port>
                </replica>
            </shard>
        </cluster_2S_2R>
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
    </macros>
    <!--highlight-end-->
</clickhouse>
```

| 디렉토리                                                 | 파일                                                                                                                                                                              |
|-----------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml)  |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml)  |
| `fs/volumes/clickhouse-03/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-03/etc/clickhouse-server/config.d/config.xml)  |
| `fs/volumes/clickhouse-04/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-04/etc/clickhouse-server/config.d/config.xml)  |

위 구성 파일의 각 섹션은 아래에서 좀 더 자세히 설명됩니다.

#### 네트워킹 및 로깅 {#networking}

<ListenHost/>

로깅 구성은 `<logger>` 블록에서 정의됩니다. 이 예제 구성은 1000M에서 세 번 롤오버되는 디버그 로그를 제공합니다:

```xml
<logger>
   <level>debug</level>
   <log>/var/log/clickhouse-server/clickhouse-server.log</log>
   <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
   <size>1000M</size>
   <count>3</count>
</logger>
```

로깅 구성에 대한 더 많은 정보는 기본 ClickHouse [구성 파일](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)에 포함된 주석을 참조하세요.

#### 클러스터 구성 {#cluster-config}

클러스터에 대한 구성은 `<remote_servers>` 블록에서 설정됩니다. 여기서 클러스터 이름 `cluster_2S_2R`이 정의됩니다.

`<cluster_2S_2R></cluster_2S_2R>` 블록은 클러스터의 레이아웃을 정의하며, `<shard></shard>` 및 `<replica></replica>` 설정을 사용하여 분산 DDL 쿼리를 위한 템플릿 역할을 합니다. 기본적으로 분산 DDL 쿼리는 허용되지만, `allow_distributed_ddl_queries` 설정을 통해 끌 수 있습니다.

`internal_replication`는 데이터가 하나의 복제본에만 기록되도록 true로 설정됩니다.

```xml
<remote_servers>
   <!-- cluster name (should not contain dots) -->
  <cluster_2S_2R>
      <!-- <allow_distributed_ddl_queries>false</allow_distributed_ddl_queries> -->
      <shard>
          <!-- Optional. Whether to write data to just one of the replicas. Default: false (write data to all replicas). -->
          <internal_replication>true</internal_replication>
          <replica>
              <host>clickhouse-01</host>
              <port>9000</port>
          </replica>
          <replica>
              <host>clickhouse-03</host>
              <port>9000</port>
          </replica>
      </shard>
      <shard>
          <internal_replication>true</internal_replication>
          <replica>
              <host>clickhouse-02</host>
              <port>9000</port>
          </replica>
          <replica>
              <host>clickhouse-04</host>
              <port>9000</port>
          </replica>
      </shard>
  </cluster_2S_2R>
</remote_servers>
```

`<cluster_2S_2R></cluster_2S_2R>` 섹션은 클러스터의 레이아웃을 정의하고, `ON CLUSTER` 절을 사용하여 클러스터 전체에서 실행되는 쿼리를 위한 템플릿 역할을 합니다.

#### Keeper 구성 {#keeper-config-explanation}

`<ZooKeeper>` 섹션은 ClickHouse가 ClickHouse Keeper(또는 ZooKeeper)가 어디에서 실행되고 있는지를 알려줍니다. ClickHouse Keeper 클러스터를 사용하고 있으므로, 클러스터의 각 `<node>`를 지정해야 하며, 이때 각각의 호스트 이름과 포트 번호를 `<host>` 및 `<port>` 태그를 사용하여 설정해야 합니다.

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
ClickHouse Keeper를 ClickHouse 서버와 동일한 서버에서 실행하는 것이 가능하지만, 생산 환경에서는 ClickHouse Keeper가 전용 호스트에서 실행되기를 강력히 권장합니다.
:::

#### 매크로 구성 {#macros-config-explanation}

또한 `<macros>` 섹션은 복제 테이블에 대한 매개변수 치환을 정의하는 데 사용됩니다. 이는 `system.macros`에 나열되어 있으며, 쿼리에서 `{shard}` 및 `{replica}`와 같은 치환을 사용할 수 있게 합니다.

```xml
<macros>
   <shard>01</shard>
   <replica>01</replica>
</macros>
```

### 사용자 구성 {#cluster-configuration}

이제 `fs/volumes/clickhouse-{}/etc/clickhouse-server/users.d`에 위치한 각 빈 구성 파일 `users.xml`을 다음과 같이 수정합니다:

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

이번 예제에서는 기본 사용자가 단순성을 위해 비밀번호 없이 구성되어 있습니다. 실제로는 이를 권장하지 않습니다.

:::note
이번 예제에서는 모든 클러스터 노드의 `users.xml` 파일이 동일합니다.
:::

## ClickHouse Keeper 구성 {#configure-clickhouse-keeper-nodes}

다음으로 조정을 위한 ClickHouse Keeper를 구성할 것입니다.

### Keeper 설정 {#configuration-explanation}

<KeeperConfig/>

| 디렉토리                                                        | 파일                                                                                                                                                                                         |
|------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

<KeeperConfigExplanation/>

<CloudTip/>

## 설정 테스트 {#test-the-setup}

당신의 머신에서 docker가 실행되고 있는지 확인하세요. `cluster_2S_2R` 디렉토리의 루트에서 `docker-compose up` 명령어를 사용하여 클러스터를 시작하세요:

```bash
docker-compose up -d
```

ClickHouse 및 Keeper 이미지를 당기기 시작하고, 그 다음 컨테이너를 시작하는 것을 볼 수 있습니다:

```bash
[+] Running 8/8
 ✔ Network   cluster_2s_2r_default     Created
 ✔ Container clickhouse-keeper-03      Started
 ✔ Container clickhouse-keeper-02      Started
 ✔ Container clickhouse-keeper-01      Started
 ✔ Container clickhouse-01             Started
 ✔ Container clickhouse-02             Started
 ✔ Container clickhouse-04             Started
 ✔ Container clickhouse-03             Started
```

클러스터가 실행 중인지 확인하기 위해, 노드 중 하나에 연결하여 다음 쿼리를 실행합니다. 첫 번째 노드에 연결하는 명령은 다음과 같습니다:

```bash

# Connect to any node
docker exec -it clickhouse-01 clickhouse-client
```

성공적으로 연결되면 ClickHouse 클라이언트 프롬프트가 표시됩니다:

```response
cluster_2S_2R node 1 :)
```

어느 클러스터 토폴로지가 어떤 호스트에 정의되어 있는지 확인하기 위해 다음 쿼리를 실행하세요:

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
1. │ cluster_2S_2R │         1 │           1 │ clickhouse-01 │ 9000 │
2. │ cluster_2S_2R │         1 │           2 │ clickhouse-03 │ 9000 │
3. │ cluster_2S_2R │         2 │           1 │ clickhouse-02 │ 9000 │
4. │ cluster_2S_2R │         2 │           2 │ clickhouse-04 │ 9000 │
5. │ default       │         1 │           1 │ localhost     │ 9000 │
   └───────────────┴───────────┴─────────────┴───────────────┴──────┘
```

ClickHouse Keeper 클러스터의 상태를 확인하기 위해 다음 쿼리를 실행하세요:

```sql title="Query"
SELECT *
FROM system.zookeeper
WHERE path IN ('/', '/clickhouse')
```

```response title="Response"
   ┌─name───────┬─value─┬─path────────┐
1. │ task_queue │       │ /clickhouse │
2. │ sessions   │       │ /clickhouse │
3. │ keeper     │       │ /           │
4. │ clickhouse │       │ /           │
   └────────────┴───────┴─────────────┘
```

<VerifyKeeperStatus/>

이로써, 두 개의 샤드와 두 개의 복제본을 가진 ClickHouse 클러스터를 성공적으로 설정했습니다. 다음 단계에서는 클러스터에 테이블을 생성할 것입니다.

## 데이터베이스 생성 {#creating-a-database}

클러스터가 올바르게 설정되고 실행되고 있음을 확인했으므로, [영국 부동산 가격](/getting-started/example-datasets/uk-price-paid) 예제 데이터 세트 튜토리얼에서 사용된 것과 동일한 테이블을 재구성할 것입니다. 이는 1995년 이후 잉글랜드와 웨일스에서 부동산 자산에 대해 지불된 가격 약 3000만 행으로 구성됩니다.

각 호스트의 클라이언트에 접속하려면 다음 명령어를 각각의 터미널 탭이나 창에서 실행하세요:

```bash
docker exec -it clickhouse-01 clickhouse-client
docker exec -it clickhouse-02 clickhouse-client
docker exec -it clickhouse-03 clickhouse-client
docker exec -it clickhouse-04 clickhouse-client
```

아래 쿼리를 각 호스트의 clickhouse-client에서 실행하여 현재 생성된 데이터베이스가 기본 데이터베이스를 제외하고는 없음을 확인할 수 있습니다:

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

`clickhouse-01` 클라이언트에서 다음 **분산된** DDL 쿼리를 실행하여 `uk`라는 새 데이터베이스를 생성합니다:

```sql
CREATE DATABASE IF NOT EXISTS uk 
-- highlight-next-line
ON CLUSTER cluster_2S_2R;
```

앞서와 동일한 쿼리를 각 호스트의 클라이언트에서 다시 실행하여 데이터베이스가 `clickhouse-01`에서만 쿼리를 실행했음에도 클러스터 전체에서 생성되었음을 확인할 수 있습니다:

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

## 클러스터에 테이블 생성 {#creating-a-table}

이제 데이터베이스가 생성되었으므로, 다음으로 복제 기능이 있는 테이블을 생성할 것입니다.

호스트 클라이언트 중 하나에서 다음 쿼리를 실행하세요:

```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_local
--highlight-next-line
ON CLUSTER cluster_2S_2R
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
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{database}/{table}/{shard}', '{replica}')
ORDER BY (postcode1, postcode2, addr1, addr2);
```

이 쿼리는 [영국 부동산 가격](/getting-started/example-datasets/uk-price-paid) 예제 데이터 세트 튜토리얼의 원래 `CREATE` 문과 동일하지만, `ON CLUSTER` 절 및 `ReplicatedMergeTree` 엔진 사용을 제외하고는 동일합니다.

`ON CLUSTER` 절은 DDL(데이터 정의 언어) 쿼리인 `CREATE`, `DROP`, `ALTER` 및 `RENAME`의 분산 실행을 위해 설계되어 있으며, 이러한 스키마 변경 사항이 클러스터의 모든 노드에 적용되도록 합니다.

[`ReplicatedMergeTree`](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replication#converting-from-mergetree-to-replicatedmergetree) 엔진은 일반적인 `MergeTree` 테이블 엔진과 똑같이 작동하지만, 데이터 복제도 수행합니다. 두 가지 매개변수를 지정해야 합니다:

- `zoo_path`: 테이블 메타데이터에 대한 Keeper/ZooKeeper 경로입니다.
- `replica_name`: 테이블의 복제본 이름입니다.

<br/>

`zoo_path` 매개변수는 사용자가 선택하는 어떤 값으로 설정할 수 있지만, 접두사를 사용하는 관례를 따르는 것이 좋습니다.

```text
/clickhouse/tables/{shard}/{database}/{table}
```

여기서:
- `{database}` 및 `{table}`는 자동으로 교체됩니다.
- `{shard}` 및 `{replica}`는 이전에 `config.xml` 파일에서 정의된 매크로입니다.

각 호스트의 클라이언트에서 다음 쿼리를 실행하여 테이블이 클러스터 전체에 생성되었음을 확인할 수 있습니다:

```sql title="Query"
SHOW TABLES IN uk;
```

```response title="Response"
   ┌─name────────────────┐
1. │ uk_price_paid_local │
   └─────────────────────┘
```

## 분산 테이블에 데이터 삽입 {#inserting-data-using-distributed}

테이블에 데이터를 삽입하기 위해서는 `ON CLUSTER`를 사용할 수 없습니다. DML(데이터 조작 언어) 쿼리인 `INSERT`, `UPDATE` 및 `DELETE`에 적용되지 않기 때문입니다. 데이터를 삽입하려면, [`Distributed`](/engines/table-engines/special/distributed) 테이블 엔진을 사용해야 합니다. 
2개의 샤드와 1개의 복제본으로 클러스터를 설정하는 방법에 대한 [가이드](/architecture/horizontal-scaling)에서 배운 대로, 분산 테이블은 서로 다른 호스트에 위치한 샤드에 대한 액세스를 가진 테이블이며, `Distributed` 테이블 엔진을 사용하여 정의됩니다. 
분산 테이블은 클러스터의 모든 샤드 간의 인터페이스 역할을 합니다.

호스트 클라이언트 중 하나에서 기존의 복제된 테이블을 이용하여 분산 테이블을 생성하는 다음 쿼리를 실행하세요:

```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_distributed
ON CLUSTER cluster_2S_2R
ENGINE = Distributed('cluster_2S_2R', 'uk', 'uk_price_paid_local', rand());
```

이제 각 호스트에서 `uk` 데이터베이스에 다음 테이블이 표시됩니다:

```sql
   ┌─name──────────────────────┐
1. │ uk_price_paid_distributed │
2. │ uk_price_paid_local       │
   └───────────────────────────┘
```

다음 쿼리를 사용하여 호스트 클라이언트에서 `uk_price_paid_distributed` 테이블에 데이터가 삽입될 수 있습니다:

```sql
INSERT INTO uk.uk_price_paid_distributed
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

클러스터의 노드에 데이터가 고르게 분산되었는지 확인하기 위해 다음 쿼리를 실행하세요:

```sql
SELECT count(*)
FROM uk.uk_price_paid_distributed;

SELECT count(*) FROM uk.uk_price_paid_local;
```

```response
   ┌──count()─┐
1. │ 30212555 │ -- 30.21 million
   └──────────┘

   ┌──count()─┐
1. │ 15105983 │ -- 15.11 million
   └──────────┘
```

</VerticalStepper>

## 결론 {#conclusion}

이 클러스터 토폴로지의 장점은 2개의 샤드와 2개의 복제본이 존재하여 확장성과 장애 내성을 제공한다는 것입니다. 데이터가 별도의 호스트에 분산되어 저장 공간 및 각 노드의 I/O 요구 사항이 줄어들며, 쿼리는 두 개의 샤드를 통해 병렬로 처리되어 성능 및 메모리 효율성이 향상됩니다. 중요한 것은, 클러스터가 하나의 노드를 잃는 것을 견딜 수 있으며 중단 없이 쿼리를 계속 제공할 수 있다는 점입니다. 각 샤드는 다른 노드에서 사용할 수 있는 백업 복제본을 가지고 있습니다.

이러한 클러스터 토폴로지의 주요 단점은 증가된 저장 오버헤드입니다. 이는 복제본 없이 구성에 비해 두 배의 저장 용량이 필요합니다. 또한 클러스터는 단일 노드 실패에는 견딜 수 있지만, 두 개의 노드를 동시에 잃으면 샤드가 어떤 노드에 분배되어 있는지에 따라 클러스터가 비활성화될 수 있습니다. 이 토폴로지는 가용성과 비용 간의 균형을 이루어, 높은 복제 인자를 요구하지 않으면서 어느 정도의 장애 내성이 필요한 생산 환경에 적합합니다.

ClickHouse Cloud가 쿼리를 처리하는 방식, 확장성과 장애 내성을 제공하는 방식에 대해서는 ["병렬 복제본"](/deployment-guides/parallel-replicas) 섹션을 참조하세요.
