---
slug: /architecture/cluster-deployment
sidebar_label: '복제 및 확장'
sidebar_position: 100
title: '복제 및 확장'
description: '이 튜토리얼에서는 간단한 ClickHouse 클러스터를 설정하는 방법을 알아봅니다.'
doc_type: 'guide'
keywords: ['클러스터 배포', '복제', '세그먼트(sharding)', '고가용성', '확장성']
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

> 이 예제에서는 복제와 스케일링이 모두 가능한 간단한 ClickHouse 클러스터를 설정하는 방법을 살펴봅니다.
> 이 클러스터는 2개의 세그먼트와 2개의 레플리카로 구성되며, 클러스터의 조정 및 쿼럼 유지를 위해 3개 노드의 ClickHouse Keeper 클러스터를 사용합니다.

설정하게 될 클러스터의 아키텍처는 아래와 같습니다:

<Image img={SharedReplicatedArchitecture} size="md" alt="2개의 세그먼트와 1개의 레플리카에 대한 아키텍처 다이어그램" />

<DedicatedKeeperServers />


## 사전 준비 사항 \{#prerequisites\}

- 이전에 [로컬 ClickHouse 서버](/install)를 설정해 둔 상태입니다
- ClickHouse의 [설정 파일](/operations/configuration-files) 등 기본 설정 개념을 이해하고 있습니다
- 사용 중인 머신에 Docker가 설치되어 있습니다

<VerticalStepper level="h2">
  ## 디렉터리 구조 및 테스트 환경 설정하기

  <ExampleFiles />

  이 튜토리얼에서는 [Docker compose](https://docs.docker.com/compose/)를 사용하여
  ClickHouse 클러스터를 설정합니다. 이 설정은 별도의 로컬 머신, 가상 머신 또는 Cloud 인스턴스에서도
  작동하도록 수정할 수 있습니다.

  다음 명령을 실행하여 이 예제의 디렉터리 구조를 설정하세요:

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

  `clickhouse-cluster` 디렉터리에 다음 `docker-compose.yml` 파일을 추가하세요:

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

  다음 하위 디렉터리와 파일을 생성하세요:

  ```bash
  for i in {01..04}; do
    mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d
    mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d
    touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d/config.xml
    touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d/users.xml
  done
  ```

  <ConfigExplanation />

  ## ClickHouse 노드 구성하기

  ### 서버 설정

  이제 `fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d`에 위치한 각 빈 설정 파일 `config.xml`을 수정하세요. 아래에서 강조 표시된 줄은 각 노드별로 변경해야 합니다:

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

  | 디렉터리                                                      | 파일                                                                                                                                                                               |
  | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml) |
  | `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml) |
  | `fs/volumes/clickhouse-03/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-03/etc/clickhouse-server/config.d/config.xml) |
  | `fs/volumes/clickhouse-04/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-04/etc/clickhouse-server/config.d/config.xml) |

  위 구성 파일의 각 섹션에 대한 자세한 설명은 다음과 같습니다.

  #### 네트워킹 및 로깅

  <ListenHost />

  로깅 구성은 `<logger>` 블록에 정의됩니다. 이 예제 구성을 사용하면 1000M 크기에 도달할 때마다 롤오버되는 디버그 로그를 3회까지 보관할 수 있습니다:

  ```xml
  <logger>
     <level>debug</level>
     <log>/var/log/clickhouse-server/clickhouse-server.log</log>
     <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
     <size>1000M</size>
     <count>3</count>
  </logger>
  ```

  로깅 구성에 대한 자세한 내용은 기본 ClickHouse [구성 파일](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)에 포함된 주석을 참조하세요.

  #### 클러스터 구성

  클러스터 구성은 `<remote_servers>` 블록에서 설정합니다.
  여기에서 클러스터 이름 `cluster_2S_2R`을 정의합니다.

  `<cluster_2S_2R></cluster_2S_2R>` 블록은 `<shard></shard>` 및 `<replica></replica>` 설정을 사용하여 클러스터의 레이아웃을 정의하며, `ON CLUSTER` 절을 사용하여 클러스터 전체에서 실행되는 쿼리인 분산 DDL 쿼리의 템플릿 역할을 합니다. 기본적으로 분산 DDL 쿼리가 허용되지만, `allow_distributed_ddl_queries` 설정을 통해 비활성화할 수도 있습니다.

  `internal_replication`을 true로 설정하면 데이터가 레플리카 중 하나에만 기록됩니다.

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

  `<cluster_2S_2R></cluster_2S_2R>` 섹션은 클러스터의 레이아웃을 정의하며,
  `ON CLUSTER` 절을 사용하여 클러스터 전체에서 실행되는 분산 DDL 쿼리의 템플릿 역할을 합니다.

  #### Keeper 구성

  `<ZooKeeper>` 섹션은 ClickHouse Keeper(또는 ZooKeeper)가 실행 중인 위치를 ClickHouse에 알려줍니다.
  ClickHouse Keeper 클러스터를 사용하는 경우, 클러스터의 각 `<node>`를 지정해야 하며,
  `<host>` 및 `<port>` 태그를 사용하여 각각의 호스트명과 포트 번호를 지정하십시오.

  ClickHouse Keeper 설정은 튜토리얼의 다음 단계에서 설명합니다.

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
  프로덕션 환경에서는 ClickHouse Keeper를 전용 호스트에서 실행하실 것을 강력히 권장합니다.
  :::

  #### 매크로 설정

  또한 `<macros>` 섹션은 복제된 테이블(Replicated Table)에 대한 매개변수 치환을 정의하는 데 사용됩니다. 이러한 매개변수는 `system.macros`에 나열되며, 쿼리에서 `{shard}`(세그먼트)와 `{replica}`(레플리카) 같은 치환을 사용할 수 있습니다.

  ```xml
  <macros>
     <shard>01</shard>
     <replica>01</replica>
  </macros>
  ```

  ### 사용자 구성

  이제 `fs/volumes/clickhouse-{}/etc/clickhouse-server/users.d`에 위치한 각 빈 설정 파일 `users.xml`을 다음과 같이 수정하세요:

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

  이 예제에서는 편의상 기본 사용자를 비밀번호 없이 구성합니다.
  실제 환경에서는 이 방식을 권장하지 않습니다.

  :::note
  이 예제에서는 클러스터의 모든 노드에서 각 `users.xml` 파일이 동일합니다.
  :::

  ## ClickHouse Keeper 구성하기

  다음으로 조정(coordination)에 사용되는 ClickHouse Keeper를 구성하십시오.

  ### Keeper 설정

  <KeeperConfig />

  | 디렉터리                                                    | 파일                                                                                                                                                                                           |
  | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
  | `fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
  | `fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

  <KeeperConfigExplanation />

  <CloudTip />

  ## 설정 테스트하기

  Docker가 머신에서 실행 중인지 확인하세요.
  `cluster_2S_2R` 디렉터리의 루트에서 `docker-compose up` 명령을 사용하여 클러스터를 시작하세요:

  ```bash
  docker-compose up -d
  ```

  docker가 ClickHouse 및 Keeper 이미지를 가져온 후
  컨테이너를 시작하는 것을 확인할 수 있습니다:

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

  클러스터가 실행 중인지 확인하려면 노드 중 하나에 연결한 후 다음 쿼리를 실행하세요. 첫 번째 노드에 연결하는 명령은 다음과 같습니다:

  ```bash
  # Connect to any node
  docker exec -it clickhouse-01 clickhouse-client
  ```

  성공하면 ClickHouse 클라이언트 프롬프트가 표시됩니다:

  ```response
  cluster_2S_2R node 1 :)
  ```

  다음 쿼리를 실행하여 각 호스트에 정의된 클러스터 토폴로지를 확인하세요:

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

  다음 쿼리를 실행하여 ClickHouse Keeper 클러스터의 상태를 확인하세요:

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

  <VerifyKeeperStatus />

  이로써 2개의 세그먼트와 2개의 레플리카를 가진 ClickHouse 클러스터 설정이 완료되었습니다.
  다음 단계에서는 클러스터에 테이블을 생성하세요.

  ## 데이터베이스 생성하기

  클러스터가 올바르게 설정되어 실행 중임을 확인했으므로, [UK property prices](/getting-started/example-datasets/uk-price-paid)
  예제 데이터셋 튜토리얼에서 사용된 것과 동일한 테이블을 재생성하게 됩니다. 이 데이터셋은 1995년 이후 영국 잉글랜드와 웨일스의 부동산 거래 가격에 대한 약 3천만 개의 행으로 구성되어 있습니다.

  각 호스트의 클라이언트에 연결하려면 별도의 터미널 탭 또는 창에서 다음 명령을 각각 실행하세요:

  ```bash
  docker exec -it clickhouse-01 clickhouse-client
  docker exec -it clickhouse-02 clickhouse-client
  docker exec -it clickhouse-03 clickhouse-client
  docker exec -it clickhouse-04 clickhouse-client
  ```

  각 호스트의 clickhouse-client에서 아래 쿼리를 실행하여 기본 데이터베이스를 제외하고 생성된 데이터베이스가 없음을 확인하십시오:

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

  `clickhouse-01` 클라이언트에서 `ON CLUSTER` 절을 사용하는 다음 **분산** DDL 쿼리를 실행하여 `uk`라는 새 데이터베이스를 생성하세요:

  ```sql
  CREATE DATABASE IF NOT EXISTS uk 
  -- highlight-next-line
  ON CLUSTER cluster_2S_2R;
  ```

  각 호스트의 클라이언트에서 이전과 동일한 쿼리를 다시 실행하여
  `clickhouse-01`에서만 쿼리를 실행했음에도 불구하고
  클러스터 전체에 데이터베이스가 생성되었는지 확인하세요:

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

  ## 클러스터에 테이블 생성

  데이터베이스가 생성되었으므로, 다음으로 복제가 적용된 테이블을 생성합니다.

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

  이는 [영국 부동산 가격](/getting-started/example-datasets/uk-price-paid) 예제 데이터셋 튜토리얼의 원본 `CREATE` 문에서 사용된 쿼리와 동일하며, `ON CLUSTER` 절과 `ReplicatedMergeTree` 엔진 사용 부분만 다릅니다.

  `ON CLUSTER` 절은 `CREATE`, `DROP`, `ALTER`, `RENAME`과 같은 DDL(Data Definition Language, 데이터 정의 언어) 쿼리를 분산 실행하기 위해 설계되었으며, 클러스터의 모든 노드에 스키마 변경 사항이 적용되도록 보장합니다.

  [`ReplicatedMergeTree`](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replication#converting-from-mergetree-to-replicatedmergetree)
  엔진은 일반 `MergeTree` 테이블 엔진과 동일하게 작동하며, 데이터를 복제합니다.
  두 개의 매개변수 지정이 필요합니다:

  * `zoo_path`: 테이블 메타데이터가 저장된 Keeper/ZooKeeper 경로입니다.
  * `replica_name`: 테이블 레플리카의 이름입니다.

  <br />

  `zoo_path` 매개변수는 원하는 값으로 설정할 수 있지만, 접두사 사용 규칙을 따르는 것을 권장합니다

  ```text
  /clickhouse/tables/{shard}/{database}/{table}
  ```

  여기서:

  * `{database}`와 `{table}`는 자동으로 치환됩니다.
  * `{shard}`와 `{replica}`는 각 ClickHouse 노드의 `config.xml` 파일에서 앞서 [정의](#macros-config-explanation)된 매크로입니다.

  각 호스트의 클라이언트에서 아래 쿼리를 실행하여 클러스터 전체에 테이블이 생성되었는지 확인하세요:

  ```sql title="Query"
  SHOW TABLES IN uk;
  ```

  ```response title="Response"
     ┌─name────────────────┐
  1. │ uk_price_paid_local │
     └─────────────────────┘
  ```

  ## 분산 테이블에 데이터 삽입

  테이블에 데이터를 삽입할 때는 `ON CLUSTER`를 사용할 수 없습니다. `ON CLUSTER`는 `INSERT`, `UPDATE`, `DELETE`와 같은 DML(Data Manipulation Language) 쿼리에 적용되지 않기 때문입니다. 데이터를 삽입하려면 [`Distributed`](/engines/table-engines/special/distributed) 테이블 엔진을 사용해야 합니다.
  2개의 세그먼트와 1개의 레플리카로 클러스터를 설정하는 [가이드](/architecture/horizontal-scaling)에서 설명한 것처럼, 분산 테이블은 서로 다른 호스트에 위치한 세그먼트에 접근할 수 있는 테이블이며 `Distributed` 테이블 엔진을 사용하여 정의됩니다.
  분산 테이블은 클러스터 내 모든 세그먼트에 대한 인터페이스 역할을 합니다.

  호스트 클라이언트 중 하나에서 다음 쿼리를 실행하여 이전 단계에서 생성한 복제된 테이블을 사용하는 분산 테이블을 생성하세요:

  ```sql
  CREATE TABLE IF NOT EXISTS uk.uk_price_paid_distributed
  ON CLUSTER cluster_2S_2R
  ENGINE = Distributed('cluster_2S_2R', 'uk', 'uk_price_paid_local', rand());
  ```

  이제 각 호스트에서 `uk` 데이터베이스의 다음 테이블을 확인할 수 있습니다:

  ```sql
     ┌─name──────────────────────┐
  1. │ uk_price_paid_distributed │
  2. │ uk_price_paid_local       │
     └───────────────────────────┘
  ```

  다음 쿼리를 사용하여 임의의 호스트 클라이언트에서 `uk_price_paid_distributed` 테이블에 데이터를 삽입할 수 있습니다:

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

  다음 쿼리를 실행하여 삽입된 데이터가 클러스터의 노드 전체에 고르게 분산되었는지 확인하세요:

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

## 결론 \{#conclusion\}

2개의 세그먼트와 2개의 레플리카로 구성된 이 클러스터 토폴로지의 장점은 확장성과 장애 허용을 모두 제공한다는 점에 있습니다.
데이터가 별도의 호스트에 분산되므로 노드당 스토리지 및 I/O 요구 사항이 줄어들며, 두 세그먼트 전체에서 쿼리가 병렬로 처리되어 성능과 메모리 효율성이 향상됩니다.
무엇보다도 각 세그먼트마다 다른 노드에 백업 레플리카가 있기 때문에, 클러스터는 노드 1개를 잃더라도 쿼리를 중단 없이 계속 처리할 수 있습니다.

이 클러스터 토폴로지의 주요 단점은 스토리지 오버헤드 증가입니다. 각 세그먼트가 중복되므로, 레플리카가 없는 구성과 비교해 두 배의 스토리지 용량이 필요합니다.
또한 클러스터가 단일 노드 장애는 견딜 수 있지만, 어떤 노드에 장애가 발생했는지와 세그먼트 분산 방식에 따라 두 개의 노드를 동시에 잃으면 클러스터가 동작하지 못할 수도 있습니다.
이 토폴로지는 가용성과 비용 간의 균형을 맞추므로, 높은 복제(replication) 계수로 인한 추가 비용 없이 일정 수준의 장애 허용이 필요한 프로덕션 환경에 적합합니다.

ClickHouse Cloud에서 쿼리를 처리하여 확장성과 장애 허용을 모두 제공하는 방식에 대해서는 ["Parallel Replicas"](/deployment-guides/parallel-replicas) 섹션을 참조하십시오.