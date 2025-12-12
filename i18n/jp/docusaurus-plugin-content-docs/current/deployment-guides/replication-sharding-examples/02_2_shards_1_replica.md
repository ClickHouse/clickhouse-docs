---
slug: /architecture/horizontal-scaling
sidebar_label: 'スケーリング'
sidebar_position: 10
title: 'スケーリング'
description: 'スケーラビリティを備えたサンプルアーキテクチャについて説明するページ'
doc_type: 'guide'
keywords: ['シャーディング', '水平スケーリング', '分散データ', 'クラスター構成', 'データ分散']
---

import Image from '@theme/IdealImage';
import ReplicationShardingTerminology from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_replication-sharding-terminology.md';
import ShardingArchitecture from '@site/static/images/deployment-guides/replication-sharding-examples/sharding.png';
import ConfigFileNote from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_config-files.md';
import KeeperConfigFileNote from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_keeper-config-files.md';
import ConfigExplanation from '@site/i18n/jp/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_config_explanation.mdx';
import ListenHost from '@site/i18n/jp/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_listen_host.mdx';
import ServerParameterTable from '@site/i18n/jp/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_server_parameter_table.mdx';
import KeeperConfig from '@site/i18n/jp/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_keeper_config.mdx';
import KeeperConfigExplanation from '@site/i18n/jp/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_keeper_explanation.mdx';
import VerifyKeeperStatus from '@site/i18n/jp/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_verify_keeper_using_mntr.mdx';
import DedicatedKeeperServers from '@site/i18n/jp/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_dedicated_keeper_servers.mdx';
import ExampleFiles from '@site/i18n/jp/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_working_example.mdx';
import CloudTip from '@site/i18n/jp/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_cloud_tip.mdx';

> この例では、スケールするシンプルな ClickHouse クラスターのセットアップ方法を学びます。
> ここでは 5 台のサーバーを構成します。うち 2 台はデータのシャーディングに使用し、
> 残りの 3 台はコーディネーション（調停）に使用します。

これからセットアップするクラスターのアーキテクチャは、以下のとおりです。

<Image img={ShardingArchitecture} size="md" alt="2 シャードと 1 レプリカのアーキテクチャ図" />

<DedicatedKeeperServers />

## 前提条件 {#pre-requisites}

- 以前に [ローカル ClickHouse サーバー](/install) をセットアップしたことがある
- ClickHouse の [設定ファイル](/operations/configuration-files) など、基本的な設定に関する概念に慣れている
- 手元のマシンに Docker がインストールされている

<VerticalStepper level="h2">
  ## ディレクトリ構造とテスト環境のセットアップ

  <ExampleFiles />

  このチュートリアルでは、[Docker compose](https://docs.docker.com/compose/)を使用してClickHouseクラスタをセットアップします。このセットアップは、個別のローカルマシン、仮想マシン、クラウドインスタンスでも動作するように変更可能です。

  この例のディレクトリ構造をセットアップするには、以下のコマンドを実行します:

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

  以下の `docker-compose.yml` ファイルを `clickhouse-cluster` ディレクトリに追加します：

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

  以下のサブディレクトリとファイルを作成します：

  ```bash
for i in {01..02}; do
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

  | ディレクトリ                                                    | ファイル                                                                                                                                                                             |
  | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml) |
  | `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml) |

  上記の設定ファイルの各セクションについて、以下で詳細に説明します。

  #### ネットワーキングとロギング

  <ListenHost />

  ログ記録は `<logger>` ブロックで定義します。この設定例では、1000Mに達すると3回ローテーションするデバッグログが出力されます:

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
  ここでクラスタ名 `cluster_2S_1R` を定義しています。

  `<cluster_2S_1R></cluster_2S_1R>` ブロックは、`<shard></shard>` および `<replica></replica>` 設定を使用してクラスタのレイアウトを定義し、分散DDLクエリのテンプレートとして機能します。分散DDLクエリは、`ON CLUSTER` 句を使用してクラスタ全体で実行されるクエリです。デフォルトでは分散DDLクエリは許可されていますが、`allow_distributed_ddl_queries` 設定により無効化することも可能です。

  `internal_replication`は、シャードごとにレプリカが1つのみであるため、デフォルトでfalseに設定されたままになっています。

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

  :::note
  これらはクラスタの構成に応じて個別に定義する必要があります。
  :::

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

  | 目次                                                       | ファイル                                                                                                                                                                          |
  | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `fs/volumes/clickhouse-01/etc/clickhouse-server/users.d` | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-01/etc/clickhouse-server/users.d/users.xml) |
  | `fs/volumes/clickhouse-02/etc/clickhouse-server/users.d` | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-02/etc/clickhouse-server/users.d/users.xml) |

  この例では、簡略化のためデフォルトユーザーをパスワードなしで設定しています。
  実際の運用環境では、この設定は推奨されません。

  :::note
  この例では、クラスター内のすべてのノードで`users.xml`ファイルが同一です。
  :::

  ## ClickHouse Keeperの設定

  ### Keeperのセットアップ

  <KeeperConfig />

  | ディレクトリ                                                  | ファイル                                                                                                                                                                                         |
  | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
  | `fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
  | `fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

  <KeeperConfigExplanation />

  <CloudTip />

  ## セットアップのテスト

  マシン上でDockerが実行されていることを確認してください。
  `cluster_2S_1R`ディレクトリのルートから`docker-compose up`コマンドを使用してクラスタを起動します:

  ```bash
docker-compose up -d
```

  dockerがClickHouseとKeeperのイメージをプルし、
  その後コンテナを起動する様子が確認できます:

  ```bash
[+] Running 6/6
 ✔ Network cluster_2s_1r_default   Created
 ✔ Container clickhouse-keeper-03  Started
 ✔ Container clickhouse-keeper-02  Started
 ✔ Container clickhouse-keeper-01  Started
 ✔ Container clickhouse-01         Started
 ✔ Container clickhouse-02         Started
```

  クラスタが稼働していることを確認するには、`clickhouse-01` または `clickhouse-02` のいずれかに接続し、以下のクエリを実行します。最初のノードへの接続コマンドは次のとおりです:

  ```bash
# Connect to any node
docker exec -it clickhouse-01 clickhouse-client
```

  成功すると、ClickHouseクライアントのプロンプトが表示されます：

  ```response
cluster_2S_1R node 1 :)
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
1. │ cluster_2S_1R │         1 │           1 │ clickhouse-01 │ 9000 │
2. │ cluster_2S_1R │         2 │           1 │ clickhouse-02 │ 9000 │
3. │ default       │         1 │           1 │ localhost     │ 9000 │
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
3. │ clickhouse │       │ /           │
4. │ keeper     │       │ /           │
   └────────────┴───────┴─────────────┘
```

  <VerifyKeeperStatus />

  これで、1つのシャードと2つのレプリカを持つClickHouseクラスタのセットアップが完了しました。
  次のステップでは、クラスタにテーブルを作成します。

  ## データベースを作成する

  クラスタが正しくセットアップされ、実行されていることを確認したので、[UK property prices](/getting-started/example-datasets/uk-price-paid)サンプルデータセットチュートリアルで使用されているものと同じテーブルを再作成します。このデータセットは、1995年以降にイングランドとウェールズで取引された不動産物件の価格データ約3,000万行で構成されています。

  各ホストのクライアントに接続するには、以下の各コマンドを別々のターミナルタブまたはウィンドウから実行します:

  ```bash
docker exec -it clickhouse-01 clickhouse-client
docker exec -it clickhouse-02 clickhouse-client
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
ON CLUSTER cluster_2S_1R;
```

  各ホストのクライアントから先ほどと同じクエリを再度実行し、`clickhouse-01`でのみクエリを実行したにもかかわらず、クラスタ全体でデータベースが作成されていることを確認できます。

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

  データベースが作成されたので、次にテーブルを作成します。
  任意のホストクライアントから以下のクエリを実行してください:

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

  これは[UK property prices](/getting-started/example-datasets/uk-price-paid)サンプルデータセットチュートリアルの元の`CREATE`文で使用されたクエリと同一です。ただし、`ON CLUSTER`句は除きます。

  `ON CLUSTER`句は、`CREATE`、`DROP`、`ALTER`、`RENAME`などのDDL(Data Definition Language)クエリを分散実行するために設計されており、これらのスキーマ変更をクラスタ内のすべてのノードに適用します。

  各ホストのクライアントから以下のクエリを実行し、クラスタ全体でテーブルが作成されていることを確認してください:

  ```sql title="Query"
SHOW TABLES IN uk;
```

  ```response title="Response"
   ┌─name────────────────┐
1. │ uk_price_paid_local │
   └─────────────────────┘
```

  英国の不動産取引価格データを挿入する前に、各ホストから通常のテーブルにデータを挿入した際の動作を確認するため、簡単な実験を実施します。

  いずれかのホストから次のクエリでテストデータベースとテーブルを作成します：

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

  次に `clickhouse-01` から以下の `INSERT` クエリを実行します:

  ```sql
INSERT INTO test.test_table (id, name) VALUES (1, 'Clicky McClickface');
```

  `clickhouse-02` に切り替えて、以下の `INSERT` クエリを実行します:

  ```sql title="Query"
INSERT INTO test.test_table (id, name) VALUES (1, 'Alexey Milovidov');
```

  次に、`clickhouse-01` または `clickhouse-02` から以下のクエリを実行してください:

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

  `ReplicatedMergeTree`テーブルとは異なり、その特定のホストのテーブルに挿入された行のみが返され、両方の行が返されることはありません。

  2つのシャードにまたがるデータを読み取るには、全シャードに対するクエリを処理できるインターフェースが必要です。このインターフェースは、SELECTクエリ実行時に両シャードのデータを結合し、INSERTクエリ実行時には両シャードへデータを挿入します。

  ClickHouseでは、このインターフェースは**分散テーブル**と呼ばれ、[`Distributed`](/engines/table-engines/special/distributed)テーブルエンジンを使用して作成します。その仕組みを見ていきましょう。

  ## 分散テーブルの作成

  以下のクエリを使用して分散テーブルを作成します:

  ```sql
CREATE TABLE test.test_table_dist ON CLUSTER cluster_2S_1R AS test.test_table
ENGINE = Distributed('cluster_2S_1R', 'test', 'test_table', rand())
```

  この例では、`rand()` 関数をシャーディングキーとして選択しており、
  これによりデータの挿入がシャード全体にランダムに分散されます。

  どちらのホストからでも分散テーブルをクエリすると、前の例とは異なり、両方のホストに挿入された2つの行がすべて返されます:

  ```sql
SELECT * FROM test.test_table_dist;
```

  ```sql
   ┌─id─┬─name───────────────┐
1. │  1 │ Alexey Milovidov   │
2. │  1 │ Clicky McClickface │
   └────┴────────────────────┘
```

  UK不動産価格データについても同様に実行します。任意のホストクライアントから、
  以下のクエリを実行して、先ほど`ON CLUSTER`で作成した既存のテーブルを使用した分散テーブルを作成してください：

  ```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_distributed
ON CLUSTER cluster_2S_1R
ENGINE = Distributed('cluster_2S_1R', 'uk', 'uk_price_paid_local', rand());
```

  ## 分散テーブルへのデータ挿入

  いずれかのホストに接続し、データを挿入します：

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

  データが挿入されたら、分散テーブルを使用して行数を確認できます:

  ```sql title="Query"
SELECT count(*)
FROM uk.uk_price_paid_distributed
```

  ```response title="Response"
   ┌──count()─┐
1. │ 30212555 │ -- 30.21 million
   └──────────┘
```

  いずれかのホストで以下のクエリを実行すると、データがシャード間でほぼ均等に分散されていることが確認できます（挿入先のシャードの選択は `rand()` で設定されているため、結果が異なる可能性があります）:

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

  ホストの1つに障害が発生した場合、何が起こるでしょうか。`clickhouse-01`をシャットダウンして、これをシミュレートしてみましょう:

  ```bash
docker stop clickhouse-01
```

  以下を実行してホストがダウンしていることを確認します：

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

  次に、`clickhouse-02` から、先ほど分散テーブルに対して実行したのと同じ select クエリを実行します：

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

  残念ながら、このクラスタには耐障害性がありません。ホストの1つに障害が発生すると、クラスタは異常状態と見なされ、クエリは失敗します。これは、[前の例](/architecture/replication)で見たレプリケーテッドテーブルとは対照的です。レプリケーテッドテーブルでは、ホストの1つに障害が発生してもデータを挿入できました。
</VerticalStepper>

## 結論 {#conclusion}

このクラスタトポロジーの利点は、データが複数のホストに分散され、ノードあたりのストレージ使用量が半分になる点です。さらに重要な点として、クエリは両方のシャードにまたがって処理されるため、メモリ使用効率が高くなり、ホストあたりの I/O が削減されます。

このクラスタトポロジーの主な欠点は、もちろん、ホストの 1 つを失うとクエリを処理できなくなることです。

[次の例](/architecture/cluster-deployment)では、スケーラビリティとフォールトトレランスの両方を提供する、2 つのシャードと 2 つのレプリカを持つクラスタのセットアップ方法を見ていきます。