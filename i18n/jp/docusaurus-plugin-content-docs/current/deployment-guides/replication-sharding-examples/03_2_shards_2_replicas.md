---
slug: /architecture/cluster-deployment
sidebar_label: 'レプリケーションとスケーリング'
sidebar_position: 100
title: 'レプリケーションとスケーリング'
description: 'このチュートリアルでは、シンプルな ClickHouse クラスターの構成方法を学びます。'
doc_type: 'guide'
keywords: ['cluster deployment', 'replication', 'sharding', 'high availability', 'scalability']
---

import Image from '@theme/IdealImage';
import SharedReplicatedArchitecture from '@site/static/images/deployment-guides/replication-sharding-examples/both.png';
import ConfigExplanation from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_config_explanation.mdx';
import ListenHost from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_listen_host.mdx';
import KeeperConfig from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_keeper_config.mdx';
import KeeperConfigExplanation from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_keeper_explanation.mdx';
import VerifyKeeperStatus from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_verify_keeper_using_mntr.mdx';
import DedicatedKeeperServers from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_dedicated_keeper_servers.mdx';
import ExampleFiles from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_working_example.mdx';
import CloudTip from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_cloud_tip.mdx';

> この例では、レプリケーションとスケーリングの両方を行うシンプルな ClickHouse クラスターのセットアップ方法を説明します。
> このクラスターは、2 つのシャードと 2 つのレプリカに加え、クラスタ内の調整の管理とクォーラムの維持を行う 3 ノード構成の ClickHouse Keeper クラスターで構成されています。

これからセットアップするクラスターのアーキテクチャを次に示します。

<Image img={SharedReplicatedArchitecture} size="md" alt="2 つのシャードと 1 つのレプリカのアーキテクチャ図" />

<DedicatedKeeperServers />


## 前提条件 {#prerequisites}

- 事前に[ローカルClickHouseサーバー](/install)をセットアップ済みであること
- [設定ファイル](/operations/configuration-files)などのClickHouseの基本的な設定概念を理解していること
- マシンにDockerがインストールされていること

<VerticalStepper level="h2">


## ディレクトリ構造とテスト環境のセットアップ {#set-up}

<ExampleFiles />

このチュートリアルでは、[Docker compose](https://docs.docker.com/compose/)を使用してClickHouseクラスタをセットアップします。このセットアップは、個別のローカルマシン、仮想マシン、またはクラウドインスタンスでも動作するように変更できます。

この例のディレクトリ構造をセットアップするには、以下のコマンドを実行してください:

```bash
mkdir cluster_2S_2R
cd cluster_2S_2R

```


# clickhouse-keeperディレクトリを作成

for i in {01..03}; do
mkdir -p fs/volumes/clickhouse-keeper-${i}/etc/clickhouse-keeper
done


# clickhouse-serverディレクトリを作成

for i in {01..04}; do
mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server
done

```

`clickhouse-cluster`ディレクトリに以下の`docker-compose.yml`ファイルを追加します:

```


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

次のサブディレクトリとファイルを作成します：

```bash
for i in {01..04}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d/config.xml
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d/users.xml
done
```

<ConfigExplanation />


## ClickHouseノードの設定 {#configure-clickhouse-servers}

### サーバーのセットアップ {#server-setup}

次に、`fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d`に配置されている空の設定ファイル`config.xml`をそれぞれ変更します。以下でハイライトされている行は、各ノード固有の内容に変更する必要があります:

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

| ディレクトリ                                                 | ファイル                                                                                                                                                                             |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-03/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-03/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-04/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-04/etc/clickhouse-server/config.d/config.xml) |

上記の設定ファイルの各セクションについては、以下で詳しく説明します。

#### ネットワークとログ {#networking}

<ListenHost />

ログ設定は`<logger>`ブロックで定義されます。この設定例では、1000Mで3回ローテーションするデバッグログが出力されます:


```xml
<logger>
   <level>debug</level>
   <log>/var/log/clickhouse-server/clickhouse-server.log</log>
   <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
   <size>1000M</size>
   <count>3</count>
</logger>
```

ロギング設定の詳細については、デフォルトのClickHouse[設定ファイル](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)に含まれるコメントを参照してください。

#### クラスタ設定 {#cluster-config}

クラスタの設定は`<remote_servers>`ブロックで行います。
ここでは、クラスタ名`cluster_2S_2R`が定義されています。

`<cluster_2S_2R></cluster_2S_2R>`ブロックは、`<shard></shard>`および`<replica></replica>`設定を使用してクラスタのレイアウトを定義し、分散DDLクエリのテンプレートとして機能します。分散DDLクエリは、`ON CLUSTER`句を使用してクラスタ全体で実行されるクエリです。デフォルトでは分散DDLクエリは許可されていますが、`allow_distributed_ddl_queries`設定で無効にすることもできます。

`internal_replication`をtrueに設定することで、データはレプリカのいずれか1つにのみ書き込まれます。

```xml
<remote_servers>
   <!-- クラスタ名(ドットを含めないでください) -->
  <cluster_2S_2R>
      <!-- <allow_distributed_ddl_queries>false</allow_distributed_ddl_queries> -->
      <shard>
          <!-- オプション。レプリカのいずれか1つにのみデータを書き込むかどうか。デフォルト: false(すべてのレプリカにデータを書き込む)。 -->
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

`<cluster_2S_2R></cluster_2S_2R>`セクションはクラスタのレイアウトを定義し、分散DDLクエリのテンプレートとして機能します。分散DDLクエリは、`ON CLUSTER`句を使用してクラスタ全体で実行されるクエリです。

#### Keeper設定 {#keeper-config-explanation}

`<ZooKeeper>`セクションは、ClickHouse Keeper(またはZooKeeper)が実行されている場所をClickHouseに伝えます。
ClickHouse Keeperクラスタを使用しているため、クラスタの各`<node>`を、`<host>`タグと`<port>`タグを使用してそれぞれホスト名とポート番号とともに指定する必要があります。

ClickHouse Keeperのセットアップについては、チュートリアルの次のステップで説明します。

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
ClickHouse KeeperをClickHouse Serverと同じサーバー上で実行することは可能ですが、本番環境では専用ホスト上でClickHouse Keeperを実行することを強く推奨します。
:::

#### マクロ設定 {#macros-config-explanation}

さらに、`<macros>`セクションは、レプリケートされたテーブルのパラメータ置換を定義するために使用されます。これらは`system.macros`にリストされ、クエリ内で`{shard}`や`{replica}`のような置換を使用できるようにします。

```xml
<macros>
   <shard>01</shard>
   <replica>01</replica>
</macros>
```

### ユーザー設定 {#cluster-configuration}

次に、`fs/volumes/clickhouse-{}/etc/clickhouse-server/users.d`にある各空の設定ファイル`users.xml`を以下のように変更します:


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

この例では、簡略化のためにデフォルトユーザーにはパスワードが設定されていません。
実際の運用環境では、このような設定は推奨されません。

:::note
この例では、クラスター内のすべてのノードで `users.xml` ファイルの内容は同一です。
:::


## ClickHouse Keeperの設定 {#configure-clickhouse-keeper-nodes}

次に、調整機能に使用されるClickHouse Keeperを設定します。

### Keeperのセットアップ {#configuration-explanation}

<KeeperConfig />

| ディレクトリ                                               | ファイル                                                                                                                                                                                         |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

<KeeperConfigExplanation />

<CloudTip />


## セットアップのテスト {#test-the-setup}

マシン上でDockerが実行されていることを確認してください。
`cluster_2S_2R`ディレクトリのルートから`docker-compose up`コマンドを使用してクラスタを起動します:

```bash
docker-compose up -d
```

DockerがClickHouseとKeeperのイメージをプルし始め、
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

クラスタが実行されていることを確認するには、いずれかのノードに接続して
以下のクエリを実行します。最初のノードに接続するコマンドを以下に示します:


```bash
# 任意のノードに接続
docker exec -it clickhouse-01 clickhouse-client
```

成功すると、ClickHouse クライアントのプロンプトが表示されます。

```response
cluster_2S_2R node 1 :)
```

次のクエリを実行して、どのホストにどのクラスタートポロジーが定義されているかを確認します。

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

ClickHouse Keeper クラスターの状態を確認するには、次のクエリを実行します。

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

これで、2 つのシャードと 2 つのレプリカを持つ ClickHouse クラスターのセットアップが完了しました。
次のステップでは、クラスター内にテーブルを作成します。


## データベースの作成 {#creating-a-database}

クラスタが正しくセットアップされ、稼働していることを確認したので、次に[UK property prices](/getting-started/example-datasets/uk-price-paid)のサンプルデータセットチュートリアルで使用したものと同じテーブルを再作成します。このデータセットは、1995年以降のイングランドとウェールズにおける不動産物件の取引価格約3000万行で構成されています。

各ホストのクライアントに接続するには、別々のターミナルタブまたはウィンドウから以下の各コマンドを実行します:

```bash
docker exec -it clickhouse-01 clickhouse-client
docker exec -it clickhouse-02 clickhouse-client
docker exec -it clickhouse-03 clickhouse-client
docker exec -it clickhouse-04 clickhouse-client
```

各ホストのclickhouse-clientから以下のクエリを実行して、デフォルトのデータベース以外にデータベースがまだ作成されていないことを確認できます:

```sql title="クエリ"
SHOW DATABASES;
```

```response title="レスポンス"
   ┌─name───────────────┐
1. │ INFORMATION_SCHEMA │
2. │ default            │
3. │ information_schema │
4. │ system             │
   └────────────────────┘
```

`clickhouse-01`クライアントから、`ON CLUSTER`句を使用して以下の**分散**DDLクエリを実行し、`uk`という名前の新しいデータベースを作成します:

```sql
CREATE DATABASE IF NOT EXISTS uk
-- highlight-next-line
ON CLUSTER cluster_2S_2R;
```

各ホストのクライアントから再度同じクエリを実行して、`clickhouse-01`からのみクエリを実行したにもかかわらず、クラスタ全体にデータベースが作成されたことを確認できます:

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


## クラスター上にテーブルを作成する {#creating-a-table}

データベースが作成されたので、次はレプリケーション機能を持つテーブルを作成します。

いずれかのホストクライアントから以下のクエリを実行します：

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

このクエリは、[UK property prices](/getting-started/example-datasets/uk-price-paid)サンプルデータセットチュートリアルの元の`CREATE`文で使用されたクエリと同一ですが、`ON CLUSTER`句と`ReplicatedMergeTree`エンジンの使用が異なります。

`ON CLUSTER`句は、`CREATE`、`DROP`、`ALTER`、`RENAME`などのDDL（データ定義言語）クエリを分散実行するために設計されており、これらのスキーマ変更がクラスター内のすべてのノードに適用されることを保証します。

[`ReplicatedMergeTree`](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replication#converting-from-mergetree-to-replicatedmergetree)エンジンは通常の`MergeTree`テーブルエンジンと同様に動作しますが、データのレプリケーションも行います。
このエンジンには2つのパラメータの指定が必要です：

- `zoo_path`: テーブルのメタデータへのKeeper/ZooKeeperパス
- `replica_name`: テーブルのレプリカ名

<br />

`zoo_path`パラメータは任意の値に設定できますが、以下のプレフィックスを使用する慣例に従うことを推奨します

```text
/clickhouse/tables/{shard}/{database}/{table}
```

ここで：

- `{database}`と`{table}`は自動的に置換されます
- `{shard}`と`{replica}`は、各ClickHouseノードの`config.xml`ファイルで事前に[定義](#macros-config-explanation)されたマクロです

各ホストのクライアントから以下のクエリを実行して、クラスター全体でテーブルが作成されたことを確認できます：

```sql title="クエリ"
SHOW TABLES IN uk;
```

```response title="レスポンス"
   ┌─name────────────────┐
1. │ uk_price_paid_local │
   └─────────────────────┘
```


## 分散テーブルへのデータ挿入 {#inserting-data-using-distributed}

テーブルにデータを挿入する際、`ON CLUSTER`は使用できません。これは`INSERT`、`UPDATE`、
`DELETE`などのDML（Data Manipulation Language）クエリには適用されないためです。データを挿入するには、
[`Distributed`](/engines/table-engines/special/distributed)テーブルエンジンを利用する必要があります。
2シャード1レプリカのクラスタをセットアップする[ガイド](/architecture/horizontal-scaling)で学んだように、分散テーブルは異なるホストに配置されたシャードにアクセス可能なテーブルであり、`Distributed`テーブルエンジンを使用して定義されます。
分散テーブルは、クラスタ内のすべてのシャードに対するインターフェースとして機能します。

任意のホストクライアントから、前のステップで作成した既存のレプリケートテーブルを使用して分散テーブルを作成するために、次のクエリを実行します:

```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_distributed
ON CLUSTER cluster_2S_2R
ENGINE = Distributed('cluster_2S_2R', 'uk', 'uk_price_paid_local', rand());
```

各ホストで、`uk`データベースに次のテーブルが表示されます:

```sql
   ┌─name──────────────────────┐
1. │ uk_price_paid_distributed │
2. │ uk_price_paid_local       │
   └───────────────────────────┘
```

任意のホストクライアントから、次のクエリを使用して`uk_price_paid_distributed`テーブルにデータを挿入できます:

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

挿入されたデータがクラスタのノード全体に均等に分散されていることを確認するために、次のクエリを実行します:

```sql
SELECT count(*)
FROM uk.uk_price_paid_distributed;

SELECT count(*) FROM uk.uk_price_paid_local;
```

```response
   ┌──count()─┐
1. │ 30212555 │ -- 3021万件
   └──────────┘

   ┌──count()─┐
1. │ 15105983 │ -- 1510万件
   └──────────┘
```

</VerticalStepper>


## まとめ {#conclusion}

2つのシャードと2つのレプリカを持つこのクラスタトポロジの利点は、スケーラビリティと耐障害性の両方を提供することです。
データは別々のホストに分散されるため、ノードごとのストレージとI/O要件が削減され、クエリは両方のシャードで並列処理されることでパフォーマンスとメモリ効率が向上します。
重要な点として、各シャードが別のノードにバックアップレプリカを持つため、クラスタは1つのノードの損失に耐え、中断することなくクエリを処理し続けることができます。

このクラスタトポロジの主な欠点は、ストレージオーバーヘッドの増加です。各シャードが複製されるため、レプリカを持たない構成と比較して2倍のストレージ容量が必要になります。
さらに、クラスタは単一ノードの障害には耐えられますが、どのノードが障害を起こすか、またシャードがどのように分散されているかによっては、2つのノードが同時に失われるとクラスタが動作不能になる可能性があります。
このトポロジは可用性とコストのバランスを取っており、より高いレプリケーション係数のコストをかけずに一定レベルの耐障害性が必要な本番環境に適しています。

ClickHouse Cloudがスケーラビリティと耐障害性の両方を提供しながらクエリを処理する方法については、[「Parallel Replicas」](/deployment-guides/parallel-replicas)のセクションを参照してください。
