---
slug: /architecture/horizontal-scaling
sidebar_label: 'スケーリング'
sidebar_position: 10
title: 'スケーリング'
description: 'スケーラビリティを実現するために設計されたサンプルアーキテクチャを説明するページ'
doc_type: 'guide'
keywords: ['sharding', 'horizontal scaling', 'distributed data', 'cluster setup', 'data distribution']
---

import Image from '@theme/IdealImage';
import ReplicationShardingTerminology from '@site/docs/_snippets/_replication-sharding-terminology.md';
import ShardingArchitecture from '@site/static/images/deployment-guides/replication-sharding-examples/sharding.png';
import ConfigFileNote from '@site/docs/_snippets/_config-files.md';
import KeeperConfigFileNote from '@site/docs/_snippets/_keeper-config-files.md';
import ConfigExplanation from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_config_explanation.mdx';
import ListenHost from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_listen_host.mdx';
import ServerParameterTable from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_server_parameter_table.mdx';
import KeeperConfig from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_keeper_config.mdx';
import KeeperConfigExplanation from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_keeper_explanation.mdx';
import VerifyKeeperStatus from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_verify_keeper_using_mntr.mdx';
import DedicatedKeeperServers from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_dedicated_keeper_servers.mdx';
import ExampleFiles from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_working_example.mdx';
import CloudTip from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_cloud_tip.mdx';

> この例では、スケール可能なシンプルな ClickHouse クラスターの構成方法を学びます。
> サーバーは 5 台で構成されています。そのうち 2 台はデータのシャーディングに使用されます。
> 残りの 3 台のサーバーは調整用に使用されます。

これから構成するクラスターのアーキテクチャを次に示します。

<Image img={ShardingArchitecture} size="md" alt="2 つのシャードと 1 つのレプリカのアーキテクチャ図" />

<DedicatedKeeperServers />


## 前提条件 {#pre-requisites}

- 事前に[ローカルClickHouseサーバー](/install)をセットアップ済みであること
- [設定ファイル](/operations/configuration-files)などClickHouseの基本的な設定概念を理解していること
- マシンにDockerがインストールされていること

<VerticalStepper level="h2">


## ディレクトリ構造とテスト環境のセットアップ {#set-up}

<ExampleFiles />

このチュートリアルでは、[Docker Compose](https://docs.docker.com/compose/)を使用してClickHouseクラスタをセットアップします。このセットアップは、個別のローカルマシン、仮想マシン、またはクラウドインスタンスでも動作するように変更可能です。

以下のコマンドを実行して、この例で使用するディレクトリ構造をセットアップします:

```bash
mkdir cluster_2S_1R
cd cluster_2S_1R

```


# clickhouse-keeperディレクトリの作成

for i in {01..03}; do
mkdir -p fs/volumes/clickhouse-keeper-${i}/etc/clickhouse-keeper
done


# clickhouse-serverディレクトリを作成

for i in {01..02}; do
mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server
done

````

以下の`docker-compose.yml`ファイルを`clickhouse-cluster`ディレクトリに追加してください:

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
````

以下のサブディレクトリとファイルを作成してください:


```bash
for i in {01..02}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d/config.xml
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d/users.xml
done
```

<ConfigExplanation />


## ClickHouseノードの設定 {#configure-clickhouse-servers}

### サーバーのセットアップ {#server-setup}

`fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d`に配置されている空の設定ファイル`config.xml`をそれぞれ編集します。以下でハイライトされている行は、各ノードに応じて変更する必要があります:

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

| ディレクトリ                                                 | ファイル                                                                                                                                                                             |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml) |

上記の設定ファイルの各セクションについて、以下で詳しく説明します。

#### ネットワークとログ {#networking}

<ListenHost />

ログは`<logger>`ブロックで定義されます。この設定例では、1000Mで3回ローテーションするデバッグログが設定されます:

```xml
<logger>
    <level>debug</level>
    <log>/var/log/clickhouse-server/clickhouse-server.log</log>
    <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
    <size>1000M</size>
    <count>3</count>
</logger>
```

ログ設定の詳細については、ClickHouseのデフォルト[設定ファイル](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)に含まれるコメントを参照してください。

#### クラスター設定 {#cluster-configuration}

クラスターの設定は`<remote_servers>`ブロックで行います。
ここでは、クラスター名`cluster_2S_1R`が定義されています。


`<cluster_2S_1R></cluster_2S_1R>` ブロックは、`<shard></shard>` と `<replica></replica>` 設定を使用してクラスタのレイアウトを定義し、`ON CLUSTER` 句を使用してクラスタ全体で実行される分散DDLクエリのテンプレートとして機能します。デフォルトでは分散DDLクエリは許可されていますが、`allow_distributed_ddl_queries` 設定で無効にすることもできます。

`internal_replication` は、シャードごとにレプリカが1つのみであるため、デフォルトでfalseに設定されたままになっています。

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

#### Keeper設定 {#keeper-config-explanation}

`<ZooKeeper>` セクションは、ClickHouse Keeper(またはZooKeeper)が実行されている場所をClickHouseに指定します。
ClickHouse Keeperクラスタを使用しているため、クラスタの各 `<node>` を、`<host>` タグと `<port>` タグを使用してそれぞれホスト名とポート番号とともに指定する必要があります。

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
ClickHouse KeeperをClickHouse Serverと同じサーバー上で実行することは可能ですが、本番環境では、ClickHouse Keeperを専用ホスト上で実行することを強く推奨します。
:::

#### マクロ設定 {#macros-config-explanation}

さらに、`<macros>` セクションは、レプリケートされたテーブルのパラメータ置換を定義するために使用されます。これらは `system.macros` にリストされ、クエリ内で `{shard}` や `{replica}` のような置換を使用できるようにします。

```xml
<macros>
    <shard>01</shard>
    <replica>01</replica>
</macros>
```

:::note
これらは、クラスタのレイアウトに応じて個別に定義されます。
:::

### ユーザー設定 {#user-config}

次に、`fs/volumes/clickhouse-{}/etc/clickhouse-server/users.d` にある各空の設定ファイル `users.xml` を以下のように変更します:

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


| Directory                                                 | File                                                                                                                                                                             |
|-----------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-01/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-01/etc/clickhouse-server/users.d/users.xml)    |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-02/etc/clickhouse-server/users.d/users.xml)    |

この例では、説明を簡単にするために、デフォルトユーザーはパスワードなしで設定されています。
実運用では、このような設定は推奨されません。

:::note
この例では、各 `users.xml` ファイルはクラスター内のすべてのノードで同一です。
:::



## ClickHouse Keeperの設定 {#configure-clickhouse-keeper-nodes}

### Keeperのセットアップ {#configuration-explanation}

<KeeperConfig />

| ディレクトリ                                               | ファイル                                                                                                                                                                                         |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

<KeeperConfigExplanation />

<CloudTip />


## セットアップのテスト {#test-the-setup}

マシン上でDockerが実行されていることを確認してください。
`cluster_2S_1R`ディレクトリのルートから`docker-compose up`コマンドを使用してクラスタを起動します:

```bash
docker-compose up -d
```

DockerがClickHouseとKeeperのイメージをプルし始め、
その後コンテナが起動する様子が表示されます:

```bash
[+] Running 6/6
 ✔ Network cluster_2s_1r_default   Created
 ✔ Container clickhouse-keeper-03  Started
 ✔ Container clickhouse-keeper-02  Started
 ✔ Container clickhouse-keeper-01  Started
 ✔ Container clickhouse-01         Started
 ✔ Container clickhouse-02         Started
```

クラスタが実行されていることを確認するには、`clickhouse-01`または`clickhouse-02`のいずれかに接続し、
以下のクエリを実行します。最初のノードに接続するコマンドを以下に示します:


```bash
# 任意のノードに接続
docker exec -it clickhouse-01 clickhouse-client
```

成功すると、ClickHouse クライアントのプロンプトが表示されます。

```response
cluster_2S_1R node 1 :)
```

次のクエリを実行して、どのホストにどのクラスタトポロジーが定義されているかを確認します。

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
3. │ clickhouse │       │ /           │
4. │ keeper     │       │ /           │
   └────────────┴───────┴─────────────┘
```

<VerifyKeeperStatus />

これで、1 つのシャードと 2 つのレプリカを持つ ClickHouse クラスターのセットアップが完了しました。
次のステップでは、クラスター内にテーブルを作成します。


## データベースの作成 {#creating-a-database}

クラスタが正しく設定され稼働していることを確認したので、次に[UK property prices](/getting-started/example-datasets/uk-price-paid)のサンプルデータセットチュートリアルで使用したものと同じテーブルを再作成します。このデータセットは、1995年以降のイングランドとウェールズにおける不動産取引価格の約3,000万行で構成されています。

別々のターミナルタブまたはウィンドウから以下の各コマンドを実行して、各ホストのクライアントに接続します:

```bash
docker exec -it clickhouse-01 clickhouse-client
docker exec -it clickhouse-02 clickhouse-client
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
ON CLUSTER cluster_2S_1R;
```

各ホストのクライアントから再度同じクエリを実行して、`clickhouse-01`でのみクエリを実行したにもかかわらず、クラスタ全体でデータベースが作成されたことを確認できます:

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

データベースが作成されたので、次にテーブルを作成します。
いずれかのホストクライアントから以下のクエリを実行してください：

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

このクエリは、[UK property prices](/getting-started/example-datasets/uk-price-paid)サンプルデータセットチュートリアルの元の`CREATE`文で使用されたクエリと、`ON CLUSTER`句を除いて同一であることに注意してください。

`ON CLUSTER`句は、`CREATE`、`DROP`、`ALTER`、`RENAME`などのDDL（データ定義言語）クエリの分散実行のために設計されており、これらのスキーマ変更がクラスター内のすべてのノードに適用されることを保証します。

各ホストのクライアントから以下のクエリを実行して、テーブルがクラスター全体に作成されたことを確認できます：

```sql title="クエリ"
SHOW TABLES IN uk;
```

```response title="レスポンス"
   ┌─name────────────────┐
1. │ uk_price_paid_local │
   └─────────────────────┘
```

UK不動産価格データを挿入する前に、いずれかのホストから通常のテーブルにデータを挿入した場合に何が起こるかを確認する簡単な実験を行いましょう。

いずれかのホストから以下のクエリを使用してテストデータベースとテーブルを作成します：

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

次に`clickhouse-01`から以下の`INSERT`クエリを実行します：

```sql
INSERT INTO test.test_table (id, name) VALUES (1, 'Clicky McClickface');
```

`clickhouse-02`に切り替えて、以下の`INSERT`クエリを実行します：

```sql title="クエリ"
INSERT INTO test.test_table (id, name) VALUES (1, 'Alexey Milovidov');
```

次に`clickhouse-01`または`clickhouse-02`から以下のクエリを実行します：

```sql
-- clickhouse-01から
SELECT * FROM test.test_table;
--   ┌─id─┬─name───────────────┐
-- 1.│  1 │ Clicky McClickface │
--   └────┴────────────────────┘

-- clickhouse-02から
SELECT * FROM test.test_table;
--   ┌─id─┬─name───────────────┐
-- 1.│  1 │ Alexey Milovidov   │
--   └────┴────────────────────┘
```

`ReplicatedMergeTree`テーブルとは異なり、その特定のホスト上のテーブルに挿入された行のみが返され、両方の行は返されないことに気付くでしょう。

2つのシャード全体のデータを読み取るには、すべてのシャードにわたってクエリを処理できるインターフェースが必要です。このインターフェースは、selectクエリを実行する際に両方のシャードからのデータを結合し、insertクエリを実行する際には両方のシャードにデータを挿入します。

ClickHouseでは、このインターフェースは**分散テーブル**と呼ばれ、[`Distributed`](/engines/table-engines/special/distributed)テーブルエンジンを使用して作成します。その仕組みを見ていきましょう。


## 分散テーブルの作成 {#create-distributed-table}

以下のクエリで分散テーブルを作成します：

```sql
CREATE TABLE test.test_table_dist ON CLUSTER cluster_2S_1R AS test.test_table
ENGINE = Distributed('cluster_2S_1R', 'test', 'test_table', rand())
```

この例では、シャーディングキーとして `rand()` 関数を選択しているため、挿入データがシャード全体にランダムに分散されます。

次に、いずれかのホストから分散テーブルをクエリすると、前の例とは異なり、2つのホストに挿入された両方の行が返されます：

```sql
SELECT * FROM test.test_table_dist;
```

```sql
   ┌─id─┬─name───────────────┐
1. │  1 │ Alexey Milovidov   │
2. │  1 │ Clicky McClickface │
   └────┴────────────────────┘
```

英国不動産価格データについても同様に行いましょう。いずれかのホストクライアントから、以前に `ON CLUSTER` で作成した既存のテーブルを使用して分散テーブルを作成するため、以下のクエリを実行します：

```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_distributed
ON CLUSTER cluster_2S_1R
ENGINE = Distributed('cluster_2S_1R', 'uk', 'uk_price_paid_local', rand());
```


## 分散テーブルへのデータ挿入 {#inserting-data-into-distributed-table}

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

データが挿入されたら、分散テーブルを使用して行数を確認できます：

```sql title="クエリ"
SELECT count(*)
FROM uk.uk_price_paid_distributed
```

```response title="レスポンス"
   ┌──count()─┐
1. │ 30212555 │ -- 3021万件
   └──────────┘
```

いずれかのホストで以下のクエリを実行すると、データがシャード間でほぼ均等に分散されていることが確認できます（挿入先のシャードの選択は`rand()`で設定されているため、結果は異なる場合があります）：

```sql
-- clickhouse-01から
SELECT count(*)
FROM uk.uk_price_paid_local
--    ┌──count()─┐
-- 1. │ 15107353 │ -- 1511万件
--    └──────────┘

--clickhouse-02から
SELECT count(*)
FROM uk.uk_price_paid_local
--    ┌──count()─┐
-- 1. │ 15105202 │ -- 1511万件
--    └──────────┘
```

ホストの1つに障害が発生した場合、何が起こるでしょうか？`clickhouse-01`をシャットダウンしてシミュレートしてみましょう：

```bash
docker stop clickhouse-01
```

以下を実行してホストが停止していることを確認します：

```bash
docker-compose ps
```

```response title="レスポンス"
NAME                   IMAGE                                        COMMAND            SERVICE                CREATED          STATUS          PORTS
clickhouse-02          clickhouse/clickhouse-server:latest          "/entrypoint.sh"   clickhouse-02          X分前            起動中 X分      127.0.0.1:8124->8123/tcp, 127.0.0.1:9001->9000/tcp
clickhouse-keeper-01   clickhouse/clickhouse-keeper:latest-alpine   "/entrypoint.sh"   clickhouse-keeper-01   X分前            起動中 X分      127.0.0.1:9181->9181/tcp
clickhouse-keeper-02   clickhouse/clickhouse-keeper:latest-alpine   "/entrypoint.sh"   clickhouse-keeper-02   X分前            起動中 X分      127.0.0.1:9182->9181/tcp
clickhouse-keeper-03   clickhouse/clickhouse-keeper:latest-alpine   "/entrypoint.sh"   clickhouse-keeper-03   X分前            起動中 X分      127.0.0.1:9183->9181/tcp
```

次に`clickhouse-02`から、先ほど分散テーブルに対して実行したのと同じselectクエリを実行します：

```sql
SELECT count(*)
FROM uk.uk_price_paid_distributed
```

```response title="レスポンス"
Received exception from server (version 25.5.2):
Code: 279. DB::Exception: Received from localhost:9000. DB::Exception: All connection tries failed. Log:

```


コード: 32. DB::Exception: EOF の後に読み取りを試行しました。 (ATTEMPT&#95;TO&#95;READ&#95;AFTER&#95;EOF) (バージョン 25.5.2.47 (official build))
コード: 209. DB::NetException: タイムアウト: 接続がタイムアウトしました: 192.168.7.1:9000 (clickhouse-01:9000, 192.168.7.1, ローカルアドレス: 192.168.7.2:37484, 接続タイムアウト 1000 ms)。 (SOCKET&#95;TIMEOUT) (バージョン 25.5.2.47 (official build))
#highlight-next-line
コード: 198. DB::NetException: ホストのアドレスが見つかりません: clickhouse-01: (clickhouse-01:9000, 192.168.7.1, ローカルアドレス: 192.168.7.2:37484)。 (DNS&#95;ERROR) (バージョン 25.5.2.47 (official build))

: Remote の実行中に発生しました。 (ALL&#95;CONNECTION&#95;TRIES&#95;FAILED)

```

残念ながら、このクラスタには耐障害性がありません。ホストの1つに障害が発生すると、
クラスタは異常状態と見なされ、クエリは失敗します。これは、[前の例](/architecture/replication)で見たレプリケーションテーブルとは対照的です。レプリケーションテーブルでは、ホストの1つに障害が発生しても
データを挿入できました。

</VerticalStepper>
```


## まとめ {#conclusion}

このクラスタトポロジの利点は、データが複数のホストに分散され、ノードあたりのストレージ使用量が半分になることです。さらに重要なのは、クエリが両方のシャードで処理されるため、メモリ使用効率が向上し、ホストあたりのI/O負荷が削減されることです。

このクラスタトポロジの主な欠点は、いずれか1台のホストが停止すると、クエリを処理できなくなることです。

[次の例](/architecture/cluster-deployment)では、スケーラビリティと耐障害性の両方を実現する、2つのシャードと2つのレプリカを持つクラスタのセットアップ方法について説明します。
