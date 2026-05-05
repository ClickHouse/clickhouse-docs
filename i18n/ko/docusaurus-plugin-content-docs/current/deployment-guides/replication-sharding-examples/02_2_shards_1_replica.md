---
slug: /architecture/horizontal-scaling
sidebar_label: '확장'
sidebar_position: 10
title: '확장'
description: '확장성을 제공하도록 설계된 예시 아키텍처를 설명하는 페이지'
doc_type: 'guide'
keywords: ['세그먼트', '수평 확장', '분산 데이터', '클러스터 설정', '데이터 분배']
---

import Image from '@theme/IdealImage';
import ReplicationShardingTerminology from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_replication-sharding-terminology.md';
import ShardingArchitecture from '@site/static/images/deployment-guides/replication-sharding-examples/sharding.png';
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

> 이 예제에서는 확장 가능한 간단한 ClickHouse 클러스터를 설정하는 방법을 설명합니다. 서버는 총 다섯 대로 구성됩니다. 이 중 두 대는 데이터를 세그먼트로 분산 저장하는 데 사용됩니다.
> 나머지 세 대의 서버는 클러스터 조정을 위해 사용됩니다.

구성하게 될 클러스터의 아키텍처는 아래와 같습니다:

<Image img={ShardingArchitecture} size="md" alt="2개의 세그먼트와 1개의 레플리카에 대한 아키텍처 다이어그램" />

<DedicatedKeeperServers />


## 사전 요구 사항 \{#pre-requisites\}

- 이전에 [로컬 ClickHouse 서버](/install)를 설정해 본 적이 있습니다.
- ClickHouse의 [설정 파일](/operations/configuration-files) 등 기본 설정 개념에 익숙합니다.
- 사용 중인 머신에 Docker가 설치되어 있습니다.

<VerticalStepper level="h2">
  ## 디렉터리 구조 및 테스트 환경 설정하기

  <ExampleFiles />

  이 튜토리얼에서는 [Docker compose](https://docs.docker.com/compose/)를 사용하여
  ClickHouse 클러스터를 설정합니다. 이 설정은 별도의 로컬 머신, 가상 머신 또는 Cloud 인스턴스에서도
  작동하도록 수정할 수 있습니다.

  다음 명령을 실행하여 이 예제의 디렉터리 구조를 설정하세요:

  ```bash
  mkdir cluster_2S_1R
  cd cluster_2S_1R

  # Create clickhouse-keeper directories
  for i in {01..03}; do
    mkdir -p fs/volumes/clickhouse-keeper-${i}/etc/clickhouse-keeper
  done

  # Create clickhouse-server directories
  for i in {01..02}; do
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
      networks:
        cluster_2S_1R:
          ipv4_address: 192.168.7.1
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
      networks:
        cluster_2S_1R:
          ipv4_address: 192.168.7.2
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
      networks:
        cluster_2S_1R:
          ipv4_address: 192.168.7.5
      volumes:
       - ${PWD}/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml:/etc/clickhouse-keeper/keeper_config.xml
      ports:
          - "127.0.0.1:9181:9181"
    clickhouse-keeper-02:
      image: "clickhouse/clickhouse-keeper:latest-alpine"
      user: "101:101"
      container_name: clickhouse-keeper-02
      hostname: clickhouse-keeper-02
      networks:
        cluster_2S_1R:
          ipv4_address: 192.168.7.6
      volumes:
       - ${PWD}/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml:/etc/clickhouse-keeper/keeper_config.xml
      ports:
          - "127.0.0.1:9182:9181"
    clickhouse-keeper-03:
      image: "clickhouse/clickhouse-keeper:latest-alpine"
      user: "101:101"
      container_name: clickhouse-keeper-03
      hostname: clickhouse-keeper-03
      networks:
        cluster_2S_1R:
          ipv4_address: 192.168.7.7
      volumes:
       - ${PWD}/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml:/etc/clickhouse-keeper/keeper_config.xml
      ports:
          - "127.0.0.1:9183:9181"
  networks:
    cluster_2S_1R:
      driver: bridge
      ipam:
        config:
          - subnet: 192.168.7.0/24
            gateway: 192.168.7.254
  ```

  다음 하위 디렉터리와 파일을 생성하세요:

  ```bash
  for i in {01..02}; do
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
      <display_name>cluster_2S_1R node 1</display_name>
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
          <cluster_2S_1R>
              <shard>
                  <replica>
                      <host>clickhouse-01</host>
                      <port>9000</port>
                  </replica>
              </shard>
              <shard>
                  <replica>
                      <host>clickhouse-02</host>
                      <port>9000</port>
                  </replica>
              </shard>
          </cluster_2S_1R>
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
  | `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml) |
  | `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml) |

  위 구성 파일의 각 섹션에 대한 자세한 설명은 다음과 같습니다.

  #### 네트워킹 및 로깅

  <ListenHost />

  로깅은 `<logger>` 블록에서 정의됩니다. 이 예제 구성은 1000M 크기에 도달할 때마다 롤오버되는 디버그 로그를 제공하며, 총 3회 롤오버됩니다:

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
  여기에서 클러스터 이름 `cluster_2S_1R`을 정의합니다.

  `<cluster_2S_1R></cluster_2S_1R>` 블록은 `<shard></shard>` 및 `<replica></replica>` 설정을 사용하여 클러스터의 레이아웃을 정의하며, `ON CLUSTER` 절을 사용하여 클러스터 전체에서 실행되는 쿼리인 분산 DDL 쿼리의 템플릿 역할을 합니다. 기본적으로 분산 DDL 쿼리가 허용되지만, `allow_distributed_ddl_queries` 설정을 통해 비활성화할 수도 있습니다.

  세그먼트당 레플리카가 하나만 존재하므로 `internal_replication`은 기본적으로 false로 설정되어 있습니다.

  ```xml
  <remote_servers>
      <cluster_2S_1R>
          <shard>
              <replica>
                  <host>clickhouse-01</host>
                  <port>9000</port>
              </replica>
          </shard>
          <shard>
              <replica>
                  <host>clickhouse-02</host>
                  <port>9000</port>
              </replica>
          </shard>
      </cluster_2S_1R>
  </remote_servers>
  ```

  <ServerParameterTable />

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

  :::note
  이러한 값들은 클러스터의 레이아웃에 따라 고유하게 정의됩니다.
  :::

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

  | 디렉터리                                                     | 파일                                                                                                                                                                            |
  | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `fs/volumes/clickhouse-01/etc/clickhouse-server/users.d` | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-01/etc/clickhouse-server/users.d/users.xml) |
  | `fs/volumes/clickhouse-02/etc/clickhouse-server/users.d` | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-02/etc/clickhouse-server/users.d/users.xml) |

  이 예제에서는 편의상 기본 사용자를 비밀번호 없이 구성합니다.
  실제 환경에서는 이 방식을 권장하지 않습니다.

  :::note
  이 예제에서는 클러스터의 모든 노드에서 각 `users.xml` 파일이 동일합니다.
  :::

  ## ClickHouse Keeper 구성하기

  ### Keeper 설정

  <KeeperConfig />

  | 디렉토리                                                    | 파일                                                                                                                                                                                           |
  | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
  | `fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
  | `fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

  <KeeperConfigExplanation />

  <CloudTip />

  ## 설정 테스트하기

  Docker가 머신에서 실행 중인지 확인하세요.
  `cluster_2S_1R` 디렉터리의 루트에서 `docker-compose up` 명령을 사용하여 클러스터를 시작하세요:

  ```bash
  docker-compose up -d
  ```

  docker가 ClickHouse 및 Keeper 이미지를 가져온 후
  컨테이너를 시작하는 것을 확인할 수 있습니다:

  ```bash
  [+] Running 6/6
   ✔ Network cluster_2s_1r_default   Created
   ✔ Container clickhouse-keeper-03  Started
   ✔ Container clickhouse-keeper-02  Started
   ✔ Container clickhouse-keeper-01  Started
   ✔ Container clickhouse-01         Started
   ✔ Container clickhouse-02         Started
  ```

  클러스터가 실행 중인지 확인하려면 `clickhouse-01` 또는 `clickhouse-02`에 연결한 후 다음 쿼리를 실행하세요. 첫 번째 노드에 연결하는 명령은 다음과 같습니다:

  ```bash
  # Connect to any node
  docker exec -it clickhouse-01 clickhouse-client
  ```

  성공하면 ClickHouse 클라이언트 프롬프트가 표시됩니다:

  ```response
  cluster_2S_1R node 1 :)
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
  1. │ cluster_2S_1R │         1 │           1 │ clickhouse-01 │ 9000 │
  2. │ cluster_2S_1R │         2 │           1 │ clickhouse-02 │ 9000 │
  3. │ default       │         1 │           1 │ localhost     │ 9000 │
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
  3. │ clickhouse │       │ /           │
  4. │ keeper     │       │ /           │
     └────────────┴───────┴─────────────┘
  ```

  <VerifyKeeperStatus />

  이로써 단일 세그먼트와 두 개의 레플리카로 구성된 ClickHouse 클러스터 설정을 완료했습니다.
  다음 단계에서는 클러스터에 테이블을 생성하세요.

  ## 데이터베이스 생성하기

  클러스터가 올바르게 설정되어 실행 중임을 확인했으므로, [UK property prices](/getting-started/example-datasets/uk-price-paid)
  예제 데이터셋 튜토리얼에서 사용된 것과 동일한 테이블을 재생성하게 됩니다. 이 데이터셋은 1995년 이후 영국 잉글랜드와 웨일스의 부동산 거래 가격에 대한 약 3천만 개의 행으로 구성되어 있습니다.

  각 호스트의 클라이언트에 연결하려면 별도의 터미널 탭 또는 창에서 다음 명령을 각각 실행하세요:

  ```bash
  docker exec -it clickhouse-01 clickhouse-client
  docker exec -it clickhouse-02 clickhouse-client
  ```

  각 호스트의 clickhouse-client에서 아래 쿼리를 실행하여 기본 데이터베이스를 제외하고 생성된 데이터베이스가 없음을 확인하세요:

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
  ON CLUSTER cluster_2S_1R;
  ```

  각 호스트의 클라이언트에서 이전과 동일한 쿼리를 다시 실행하여
  `clickhouse-01`에서만 쿼리를 실행했음에도 불구하고 클러스터 전체에 데이터베이스가
  생성되었는지 확인하십시오:

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

  데이터베이스가 생성되었으므로 테이블을 생성합니다.
  호스트 클라이언트 중 하나에서 다음 쿼리를 실행하세요:

  ```sql
  CREATE TABLE IF NOT EXISTS uk.uk_price_paid_local
  --highlight-next-line
  ON CLUSTER cluster_2S_1R
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
  ENGINE = MergeTree
  ORDER BY (postcode1, postcode2, addr1, addr2);
  ```

  이는 [영국 부동산 가격](/getting-started/example-datasets/uk-price-paid) 예제 데이터셋 튜토리얼의
  원본 `CREATE` 문에서 사용된 쿼리와 동일하며,
  `ON CLUSTER` 절을 제외하고는 같습니다.

  `ON CLUSTER` 절은 `CREATE`, `DROP`, `ALTER`, `RENAME`과 같은 DDL(Data Definition Language, 데이터 정의 언어) 쿼리를 분산 실행하기 위해 설계되었으며, 클러스터의 모든 노드에 스키마 변경 사항이 적용되도록 보장합니다.

  각 호스트의 클라이언트에서 아래 쿼리를 실행하여 클러스터 전체에 테이블이 생성되었는지 확인하십시오:

  ```sql title="Query"
  SHOW TABLES IN uk;
  ```

  ```response title="Response"
     ┌─name────────────────┐
  1. │ uk_price_paid_local │
     └─────────────────────┘
  ```

  영국 부동산 거래 데이터를 삽입하기 전에, 두 호스트 중 하나에서 일반 테이블에 데이터를 삽입하면 어떤 일이 발생하는지 확인하기 위해 간단한 실험을 수행하겠습니다.

  다음 쿼리를 사용하여 두 호스트 중 하나에서 테스트 데이터베이스와 테이블을 생성하세요:

  ```sql
  CREATE DATABASE IF NOT EXISTS test ON CLUSTER cluster_2S_1R;
  CREATE TABLE test.test_table ON CLUSTER cluster_2S_1R
  (
      `id` UInt64,
      `name` String
  )
  ENGINE = MergeTree()
  ORDER BY id;
  ```

  이제 `clickhouse-01`에서 다음 `INSERT` 쿼리를 실행하세요:

  ```sql
  INSERT INTO test.test_table (id, name) VALUES (1, 'Clicky McClickface');
  ```

  `clickhouse-02`로 전환한 후 다음 `INSERT` 쿼리를 실행하세요:

  ```sql title="Query"
  INSERT INTO test.test_table (id, name) VALUES (1, 'Alexey Milovidov');
  ```

  이제 `clickhouse-01` 또는 `clickhouse-02`에서 다음 쿼리를 실행하세요:

  ```sql
  -- from clickhouse-01
  SELECT * FROM test.test_table;
  --   ┌─id─┬─name───────────────┐
  -- 1.│  1 │ Clicky McClickface │
  --   └────┴────────────────────┘

  --from clickhouse-02
  SELECT * FROM test.test_table;
  --   ┌─id─┬─name───────────────┐
  -- 1.│  1 │ Alexey Milovidov   │
  --   └────┴────────────────────┘
  ```

  `ReplicatedMergeTree` 테이블과 달리, 해당 특정 호스트의 테이블에 삽입된 행만 반환되며 두 행이 모두 반환되지는 않습니다.

  두 샤드에 걸쳐 데이터를 읽으려면 모든 샤드에서 쿼리를 처리할 수 있는 인터페이스가 필요합니다. 이 인터페이스는 select 쿼리 실행 시 두 샤드의 데이터를 결합하고, insert 쿼리 실행 시 두 샤드에 데이터를 삽입합니다.

  ClickHouse에서 이 인터페이스를 **분산 테이블**이라고 하며, [`Distributed`](/engines/table-engines/special/distributed) 테이블 엔진을 사용하여 생성합니다. 작동 방식을 살펴보겠습니다.

  ## 분산 테이블 생성하기

  다음 쿼리로 분산 테이블을 생성하세요:

  ```sql
  CREATE TABLE test.test_table_dist ON CLUSTER cluster_2S_1R AS test.test_table
  ENGINE = Distributed('cluster_2S_1R', 'test', 'test_table', rand())
  ```

  이 예제에서는 `rand()` 함수를 샤딩 키로 선택하여
  삽입 작업이 세그먼트 전체에 무작위로 분산됩니다.

  이제 어느 호스트에서든 분산 테이블을 쿼리하면 이전 예제와 달리
  두 호스트에 삽입된 두 개의 행이 모두 반환됩니다:

  ```sql
  SELECT * FROM test.test_table_dist;
  ```

  ```sql
     ┌─id─┬─name───────────────┐
  1. │  1 │ Alexey Milovidov   │
  2. │  1 │ Clicky McClickface │
     └────┴────────────────────┘
  ```

  영국 부동산 가격 데이터에 대해서도 동일하게 수행합니다. 호스트 클라이언트 중 하나에서
  다음 쿼리를 실행하여 이전에 `ON CLUSTER`로 생성한 기존 테이블을 사용하는 분산 테이블을 생성하세요:

  ```sql
  CREATE TABLE IF NOT EXISTS uk.uk_price_paid_distributed
  ON CLUSTER cluster_2S_1R
  ENGINE = Distributed('cluster_2S_1R', 'uk', 'uk_price_paid_local', rand());
  ```

  ## 분산 테이블에 데이터 삽입

  이제 호스트 중 하나에 연결하고 데이터를 삽입하세요:

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

  데이터가 삽입된 후 분산 테이블을 사용하여 행 수를 확인하세요:

  ```sql title="Query"
  SELECT count(*)
  FROM uk.uk_price_paid_distributed
  ```

  ```response title="Response"
     ┌──count()─┐
  1. │ 30212555 │ -- 30.21 million
     └──────────┘
  ```

  두 호스트 중 하나에서 다음 쿼리를 실행하면 데이터가 세그먼트 전체에 고르게 분산되어 있음을 확인할 수 있습니다 (삽입할 세그먼트 선택은 `rand()`로 설정되었으므로 결과가 다를 수 있습니다):

  ```sql
  -- from clickhouse-01
  SELECT count(*)
  FROM uk.uk_price_paid_local
  --    ┌──count()─┐
  -- 1. │ 15107353 │ -- 15.11 million
  --    └──────────┘

  --from clickhouse-02
  SELECT count(*)
  FROM uk.uk_price_paid_local
  --    ┌──count()─┐
  -- 1. │ 15105202 │ -- 15.11 million
  --    └──────────┘
  ```

  호스트 중 하나가 장애가 발생하면 어떻게 될까요? `clickhouse-01`을 종료하여 시뮬레이션해 보겠습니다:

  ```bash
  docker stop clickhouse-01
  ```

  다음 명령을 실행하여 호스트가 다운되었는지 확인하세요:

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

  이제 `clickhouse-02`에서 분산 테이블에 대해 이전에 실행했던 것과 동일한 select 쿼리를 실행하세요:

  ```sql
  SELECT count(*)
  FROM uk.uk_price_paid_distributed
  ```

  ```response title="Response"
  Received exception from server (version 25.5.2):
  Code: 279. DB::Exception: Received from localhost:9000. DB::Exception: All connection tries failed. Log:

  Code: 32. DB::Exception: Attempt to read after eof. (ATTEMPT_TO_READ_AFTER_EOF) (version 25.5.2.47 (official build))
  Code: 209. DB::NetException: Timeout: connect timed out: 192.168.7.1:9000 (clickhouse-01:9000, 192.168.7.1, local address: 192.168.7.2:37484, connection timeout 1000 ms). (SOCKET_TIMEOUT) (version 25.5.2.47 (official build))
  #highlight-next-line
  Code: 198. DB::NetException: Not found address of host: clickhouse-01: (clickhouse-01:9000, 192.168.7.1, local address: 192.168.7.2:37484). (DNS_ERROR) (version 25.5.2.47 (official build))

  : While executing Remote. (ALL_CONNECTION_TRIES_FAILED)
  ```

  안타깝게도 이 클러스터는 장애 허용(fault-tolerant) 기능이 없습니다. 호스트 중 하나가 장애를 일으키면
  클러스터는 비정상 상태로 간주되며 쿼리가 실패합니다. 이는 [이전 예제](/architecture/replication)에서 살펴본 복제된
  테이블과 대조됩니다. 복제된 테이블의 경우 호스트 중 하나가 장애를 일으켜도
  데이터를 삽입할 수 있었습니다.
</VerticalStepper>

## 결론 \{#conclusion\}

이 클러스터 토폴로지의 장점은 데이터가 개별 호스트에 분산되고 노드당 절반의 스토리지만 사용된다는 점입니다. 더 중요하게는 쿼리가 두 세그먼트 전체에 걸쳐 처리되어 메모리 활용 측면에서 더 효율적이며 호스트당 I/O를 줄여 줍니다.

이 클러스터 토폴로지의 주요 단점은, 물론, 호스트 중 하나를 잃게 되면 쿼리를 처리할 수 없게 된다는 점입니다.

[다음 예제](/architecture/cluster-deployment)에서는 두 개의 세그먼트와 두 개의 레플리카로 구성된 클러스터를 설정해 확장성과 장애 허용을 모두 제공하는 방법을 살펴봅니다.