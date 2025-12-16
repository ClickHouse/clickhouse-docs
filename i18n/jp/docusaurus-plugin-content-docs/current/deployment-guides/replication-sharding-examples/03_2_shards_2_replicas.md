---
slug: /architecture/cluster-deployment
sidebar_label: 'レプリケーションとスケーリング'
sidebar_position: 100
title: 'レプリケーションとスケーリング'
description: 'このチュートリアルでは、簡単な ClickHouse クラスターのセットアップ方法を学びます。'
doc_type: 'ガイド'
keywords: ['クラスター デプロイメント', 'レプリケーション', 'シャーディング', '高可用性', 'スケーラビリティ']
---

import Image from '@theme/IdealImage';
import SharedReplicatedArchitecture from '@site/static/images/deployment-guides/replication-sharding-examples/both.png';
import ConfigExplanation from '@site/i18n/jp/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_config_explanation.mdx';
import ListenHost from '@site/i18n/jp/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_listen_host.mdx';
import KeeperConfig from '@site/i18n/jp/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_keeper_config.mdx';
import KeeperConfigExplanation from '@site/i18n/jp/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_keeper_explanation.mdx';
import VerifyKeeperStatus from '@site/i18n/jp/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_verify_keeper_using_mntr.mdx';
import DedicatedKeeperServers from '@site/i18n/jp/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_dedicated_keeper_servers.mdx';
import ExampleFiles from '@site/i18n/jp/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_working_example.mdx';
import CloudTip from '@site/i18n/jp/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_cloud_tip.mdx';

> この例では、レプリケーションとスケールの両方に対応したシンプルな ClickHouse クラスターをセットアップする方法を学びます。クラスターは 2 つのシャードと 2 つのレプリカに加え、クラスター内の調整とクォーラムの維持を行う 3 ノード構成の ClickHouse Keeper クラスターで構成されています。

これから構成するクラスターのアーキテクチャは、次の図のとおりです。

<Image img={SharedReplicatedArchitecture} size="md" alt="2 シャードと 1 レプリカのアーキテクチャ図" />

<DedicatedKeeperServers />

## 前提条件 {#prerequisites}

- すでに [ローカルの ClickHouse サーバー](/install) をセットアップしている
- [設定ファイル](/operations/configuration-files) など、ClickHouse の基本的な設定の概念に慣れている
- 使用しているマシンに Docker がインストールされている

<VerticalStepper level="h2">
  ## ディレクトリ構造とテスト環境のセットアップ

  <ExampleFiles />

  このチュートリアルでは、[Docker compose](https://docs.docker.com/compose/)を使用してClickHouseクラスタをセットアップします。このセットアップは、個別のローカルマシン、仮想マシン、クラウドインスタンスでも動作するように変更可能です。

  この例のディレクトリ構造をセットアップするには、以下のコマンドを実行します:

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

  以下の `docker-compose.yml` ファイルを `clickhouse-cluster` ディレクトリに追加します：

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

  以下のサブディレクトリとファイルを作成します：

  ```bash
  for i in {01..04}; do
    mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d
    mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d
    touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d/config.xml
    touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d/users.xml
  done
  ```

  <ConfigExplanation />

  ## ClickHouseノードの設定

  ### サーバーのセットアップ

  次に、`fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d`に配置されている各空の設定ファイル`config.xml`を修正します。以下で強調表示されている行は、各ノードに固有の内容に変更する必要があります:

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

  | ディレクトリ                                                    | ファイル                                                                                                                                                                             |
  | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml) |
  | `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml) |
  | `fs/volumes/clickhouse-03/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-03/etc/clickhouse-server/config.d/config.xml) |
  | `fs/volumes/clickhouse-04/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-04/etc/clickhouse-server/config.d/config.xml) |

  上記の設定ファイルの各セクションについて、以下で詳細に説明します。

  #### ネットワーキングとロギング

  <ListenHost />

  ログ設定は `<logger>` ブロックで定義します。この設定例では、1000Mに達するごとに3回までローテーションするデバッグログを出力します:

  ```xml
  <logger>
    <level>debug</level>
    <log>/var/log/clickhouse-server/clickhouse-server.log</log>
    <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
    <size>1000M</size>
    <count>3</count>
  </logger>
  ```

  ログ設定の詳細については、デフォルトのClickHouse[設定ファイル](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)に含まれているコメントを参照してください。

  #### クラスター設定

  クラスタの設定は `<remote_servers>` ブロックで設定します。
  ここでクラスタ名 `cluster_2S_2R` を定義しています。

  `<cluster_2S_2R></cluster_2S_2R>` ブロックは、`<shard></shard>` および `<replica></replica>` 設定を使用してクラスタのレイアウトを定義し、分散DDLクエリのテンプレートとして機能します。分散DDLクエリは、`ON CLUSTER` 句を使用してクラスタ全体で実行されるクエリです。デフォルトでは分散DDLクエリは許可されていますが、`allow_distributed_ddl_queries` 設定で無効化することもできます。

  `internal_replication` を true に設定すると、データはレプリカの1つにのみ書き込まれます。

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

  `<cluster_2S_2R></cluster_2S_2R>` セクションは、クラスタのレイアウトを定義し、
  分散DDLクエリ（`ON CLUSTER` 句を使用してクラスタ全体で実行されるクエリ）のテンプレートとして機能します。

  #### Keeper の設定

  `<ZooKeeper>` セクションは、ClickHouse Keeper（または ZooKeeper）の実行場所を ClickHouse に指定します。
  ClickHouse Keeper クラスタを使用する場合、クラスタの各 `<node>` を指定する必要があります。
  ホスト名とポート番号はそれぞれ `<host>` タグと `<port>` タグを使用して指定します。

  ClickHouse Keeperのセットアップは、チュートリアルの次のステップで説明されています。

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
  ClickHouse KeeperをClickHouse Serverと同じサーバー上で実行することは可能ですが、本番環境では専用ホスト上で実行することを強く推奨します。
  :::

  #### マクロの設定

  また、`<macros>` セクションは、レプリケーテッドテーブルのパラメータ置換を定義するために使用されます。これらは `system.macros` に記載され、クエリ内で `{shard}` や `{replica}` などの置換を使用できます。

  ```xml
  <macros>
    <shard>01</shard>
    <replica>01</replica>
  </macros>
  ```

  ### ユーザー設定

  次に、`fs/volumes/clickhouse-{}/etc/clickhouse-server/users.d` に配置されている各空の設定ファイル `users.xml` を以下の内容で変更します:

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

  この例では、簡略化のためデフォルトユーザーをパスワードなしで設定しています。
  実際の運用環境では、この設定は推奨されません。

  :::note
  この例では、クラスター内のすべてのノードで`users.xml`ファイルが同一です。
  :::

  ## ClickHouse Keeperの設定

  次に、コーディネーションに使用されるClickHouse Keeperを設定します。

  ### Keeperのセットアップ

  <KeeperConfig />

  | ディレクトリ                                                  | ファイル                                                                                                                                                                                         |
  | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
  | `fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
  | `fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

  <KeeperConfigExplanation />

  <CloudTip />

  ## セットアップのテスト

  マシン上でDockerが実行されていることを確認してください。
  `cluster_2S_2R`ディレクトリのルートから`docker-compose up`コマンドを使用してクラスタを起動します:

  ```bash
  docker-compose up -d
  ```

  dockerがClickHouseとKeeperのイメージをプルし始め、
  その後コンテナが起動する様子が表示されます:

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

  クラスタが稼働していることを確認するには、いずれかのノードに接続して以下のクエリを実行します。最初のノードへの接続コマンドは次のとおりです:

  ```bash
  # Connect to any node
  docker exec -it clickhouse-01 clickhouse-client
  ```

  成功すると、ClickHouseクライアントのプロンプトが表示されます：

  ```response
  cluster_2S_2R node 1 :)
  ```

  以下のクエリを実行して、各ホストに定義されているクラスタトポロジを確認します：

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

  以下のクエリを実行して、ClickHouse Keeperクラスタのステータスを確認します：

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

  これで、2つのシャードと2つのレプリカを持つClickHouseクラスタのセットアップが完了しました。
  次のステップでは、クラスタにテーブルを作成します。

  ## データベースを作成する

  クラスタが正しくセットアップされ、実行されていることを確認したので、[UK property prices](/getting-started/example-datasets/uk-price-paid)サンプルデータセットチュートリアルで使用されているものと同じテーブルを再作成します。このデータセットは、1995年以降にイングランドとウェールズで取引された不動産物件の価格データ約3,000万行で構成されています。

  各ホストのクライアントに接続するには、以下の各コマンドを別々のターミナルタブまたはウィンドウから実行します:

  ```bash
  docker exec -it clickhouse-01 clickhouse-client
  docker exec -it clickhouse-02 clickhouse-client
  docker exec -it clickhouse-03 clickhouse-client
  docker exec -it clickhouse-04 clickhouse-client
  ```

  各ホストのclickhouse-clientから以下のクエリを実行して、デフォルトのデータベース以外にデータベースが作成されていないことを確認してください:

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

  `clickhouse-01` クライアントから、`ON CLUSTER` 句を使用して以下の**分散型** DDL クエリを実行し、`uk` という名前の新しいデータベースを作成します：

  ```sql
  CREATE DATABASE IF NOT EXISTS uk 
  -- highlight-next-line
  ON CLUSTER cluster_2S_2R;
  ```

  各ホストのクライアントから先ほどと同じクエリを再度実行し、`clickhouse-01`からのみクエリを実行したにもかかわらず、クラスタ全体でデータベースが作成されていることを確認できます。

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

  ## クラスタ上にテーブルを作成する

  データベースが作成されたので、次はレプリケーション機能を持つテーブルを作成します。

  いずれかのホストクライアントから以下のクエリを実行します:

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

  これは、[英国不動産価格](/getting-started/example-datasets/uk-price-paid)サンプルデータセットチュートリアルの元の`CREATE`文で使用されたクエリと同一です。ただし、`ON CLUSTER`句と`ReplicatedMergeTree`エンジンの使用が異なる点に注意してください。

  `ON CLUSTER`句は、`CREATE`、`DROP`、`ALTER`、`RENAME`などのDDL(Data Definition Language)クエリを分散実行するために設計されており、これらのスキーマ変更をクラスタ内のすべてのノードに適用します。

  [`ReplicatedMergeTree`](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replication#converting-from-mergetree-to-replicatedmergetree)エンジンは、通常の`MergeTree`テーブルエンジンと同様に動作しますが、データのレプリケーションも実行します。
  2つのパラメータの指定が必要です:

  * `zoo_path`: テーブルのメタデータが格納されている Keeper/ZooKeeper のパス。
  * `replica_name`: テーブルのレプリカ名。

  <br />

  `zoo_path`パラメータは任意の値に設定できますが、プレフィックスを使用する慣例に従うことを推奨します

  ```text
  /clickhouse/tables/{shard}/{database}/{table}
  ```

  各項目の説明：

  * `{database}` と `{table}` は自動的に置き換えられます。
  * `{shard}` と `{replica}` は、各 ClickHouse ノードの `config.xml` ファイル内であらかじめ[定義](#macros-config-explanation)されたマクロです。

  各ホストのクライアントから以下のクエリを実行し、クラスタ全体でテーブルが作成されていることを確認してください:

  ```sql title="Query"
  SHOW TABLES IN uk;
  ```

  ```response title="Response"
    ┌─name────────────────┐
  1. │ uk_price_paid_local │
    └─────────────────────┘
  ```

  ## 分散テーブルへのデータ挿入

  テーブルへのデータ挿入時には`ON CLUSTER`を使用できません。これは`INSERT`、`UPDATE`、`DELETE`などのDML（Data Manipulation Language：データ操作言語）クエリには適用されないためです。 データを挿入するには、[`Distributed`](/engines/table-engines/special/distributed)テーブルエンジンを利用する必要があります。
  2シャード1レプリカ構成のクラスタをセットアップする[ガイド](/architecture/horizontal-scaling)で学んだように、分散テーブルとは異なるホスト上に配置されたシャードにアクセス可能なテーブルであり、`Distributed`テーブルエンジンを使用して定義されます。
  分散テーブルは、クラスタ内の全シャードに対するインターフェースとして機能します。

  いずれかのホストクライアントから、以下のクエリを実行して、前のステップで作成した既存のレプリケートテーブルを使用する分散テーブルを作成します:

  ```sql
  CREATE TABLE IF NOT EXISTS uk.uk_price_paid_distributed
  ON CLUSTER cluster_2S_2R
  ENGINE = Distributed('cluster_2S_2R', 'uk', 'uk_price_paid_local', rand());
  ```

  各ホストの`uk`データベースに、以下のテーブルが表示されるようになります：

  ```sql
    ┌─name──────────────────────┐
  1. │ uk_price_paid_distributed │
  2. │ uk_price_paid_local       │
    └───────────────────────────┘
  ```

  データは、以下のクエリを使用して、いずれかのホストクライアントから `uk_price_paid_distributed` テーブルに挿入できます:

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

  次のクエリを実行して、挿入されたデータがクラスタの各ノードに均等に分散されていることを確認します:

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

## 結論 {#conclusion}

2つのシャードと2つのレプリカを持つこのクラスター・トポロジーの利点は、スケーラビリティとフォールトトレランスの両方を提供できる点にあります。
データは個別のホスト間で分散されるため、ノードごとのストレージおよび I/O 要件が削減される一方で、クエリは両方のシャードにまたがって並列に処理されるため、パフォーマンスとメモリ効率が向上します。
重要な点として、各シャードには別ノード上にバックアップのレプリカが存在するため、クラスターはノードを1つ失ってもクエリを中断することなく処理し続けられます。

このクラスター・トポロジーの主な欠点は、ストレージのオーバーヘッドが増加することです。レプリカなしの構成と比較すると、各シャードが複製されるため、必要なストレージ容量は2倍になります。
さらに、クラスターは単一ノード障害には耐えられますが、どのノードが障害するかやシャードの配置によっては、2ノードが同時に失われるとクラスターが動作不能になる可能性があります。
このトポロジーは可用性とコストのバランスを取るものであり、より高いレプリケーション係数のコストをかけずに、一定レベルのフォールトトレランスが求められる本番環境に適しています。

スケーラビリティとフォールトトレランスの両方を提供する ClickHouse Cloud におけるクエリ処理の仕組みについては、["Parallel Replicas"](/deployment-guides/parallel-replicas) セクションを参照してください。