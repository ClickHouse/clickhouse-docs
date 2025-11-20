---
slug: /architecture/replication
sidebar_label: 'レプリケーション'
sidebar_position: 10
title: 'データのレプリケーション'
description: '5 台のサーバーを構成した例のアーキテクチャについて説明します。2 台はデータのコピーを保持するために使用し、残りはデータのレプリケーションを調整するために使用します'
doc_type: 'guide'
keywords: ['replication', 'high availability', 'cluster setup', 'data redundancy', 'fault tolerance']
---

import Image from '@theme/IdealImage';
import ReplicationShardingTerminology from '@site/docs/_snippets/_replication-sharding-terminology.md';
import ReplicationArchitecture from '@site/static/images/deployment-guides/replication-sharding-examples/replication.png';
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

> この例では、データをレプリケートするシンプルな ClickHouse クラスターのセットアップ方法を説明します。5 台のサーバーが構成されており、そのうち 2 台はデータのコピーを保持するために使用し、残りの 3 台のサーバーはデータレプリケーションの調整に使用します。

これからセットアップするクラスターのアーキテクチャは、次の図のとおりです。

<Image img={ReplicationArchitecture} size="md" alt="ReplicatedMergeTree を用いた 1 シャード 2 レプリカのアーキテクチャ図" />

<DedicatedKeeperServers />


## 前提条件 {#pre-requisites}

- 事前に[ローカルClickHouseサーバー](/install)をセットアップしていること
- [設定ファイル](/operations/configuration-files)などClickHouseの基本的な設定概念に精通していること
- マシンにDockerがインストールされていること

<VerticalStepper level="h2">


## ディレクトリ構造とテスト環境のセットアップ {#set-up}

<ExampleFiles />

このチュートリアルでは、[Docker compose](https://docs.docker.com/compose/)を使用してClickHouseクラスタをセットアップします。このセットアップは、個別のローカルマシン、仮想マシン、またはクラウドインスタンスでも動作するように変更できます。

この例のディレクトリ構造をセットアップするには、以下のコマンドを実行してください:

```bash
mkdir cluster_1S_2R
cd cluster_1S_2R

```


# clickhouse-keeperディレクトリを作成

for i in {01..03}; do
mkdir -p fs/volumes/clickhouse-keeper-${i}/etc/clickhouse-keeper
done


# clickhouse-serverディレクトリを作成

for i in {01..02}; do
mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server
done

````

以下の`docker-compose.yml`ファイルを`cluster_1S_2R`ディレクトリに追加してください:

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

`fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d`に配置されている空の設定ファイル`config.xml`をそれぞれ変更します。以下でハイライトされている行は、各ノード固有の内容に変更する必要があります:

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

| ディレクトリ                                                 | ファイル                                                                                                                                                                             |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml) |

上記の設定ファイルの各セクションについて、以下で詳しく説明します。

#### ネットワークとログ {#networking}

<ListenHost />

ログは`<logger>`ブロックで定義されます。この設定例では、1000Mで3回ローテーションするデバッグログが出力されます:

```xml
<logger>
    <level>debug</level>
    <log>/var/log/clickhouse-server/clickhouse-server.log</log>
    <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
    <size>1000M</size>
    <count>3</count>
</logger>
```

ログ設定の詳細については、デフォルトのClickHouse[設定ファイル](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)に含まれるコメントを参照してください。

#### クラスター設定 {#cluster-configuration}

クラスターの設定は`<remote_servers>`ブロックで設定します。
ここでは、クラスター名`cluster_1S_2R`が定義されています。


`<cluster_1S_2R></cluster_1S_2R>` ブロックは、`<shard></shard>` および `<replica></replica>` 設定を使用してクラスタのレイアウトを定義し、分散DDLクエリのテンプレートとして機能します。分散DDLクエリとは、`ON CLUSTER` 句を使用してクラスタ全体で実行されるクエリです。デフォルトでは分散DDLクエリは許可されていますが、`allow_distributed_ddl_queries` 設定でオフにすることもできます。

`internal_replication` を true に設定すると、データはレプリカのうち1つのみに書き込まれます。

```xml
<remote_servers>
    <!-- クラスタ名(ドットを含めないでください) -->
    <cluster_1S_2R>
        <!-- <allow_distributed_ddl_queries>false</allow_distributed_ddl_queries> -->
        <shard>
            <!-- オプション。データをレプリカの1つのみに書き込むかどうか。デフォルト: false(すべてのレプリカにデータを書き込む)。 -->
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

<ServerParameterTable />

#### Keeper設定 {#keeper-config-explanation}

`<ZooKeeper>` セクションは、ClickHouse Keeper(またはZooKeeper)が実行されている場所をClickHouseに伝えます。
ClickHouse Keeperクラスタを使用しているため、クラスタの各 `<node>` を、`<host>` および `<port>` タグを使用してそれぞれホスト名とポート番号とともに指定する必要があります。

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
ClickHouse KeeperをClickHouse Serverと同じサーバー上で実行することは可能ですが、本番環境ではClickHouse Keeperを専用ホスト上で実行することを強く推奨します。
:::

#### マクロ設定 {#macros-config-explanation}

さらに、`<macros>` セクションは、レプリケートされたテーブルのパラメータ置換を定義するために使用されます。これらは `system.macros` にリストされ、クエリ内で `{shard}` や `{replica}` のような置換を使用できるようにします。

```xml
<macros>
    <shard>01</shard>
    <replica>01</replica>
    <cluster>cluster_1S_2R</cluster>
</macros>
```

:::note
これらはクラスタのレイアウトに応じて一意に定義されます。
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


| ディレクトリ                                                 | ファイル                                                                                                                                                                             |
|-----------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-01/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/users.d/users.xml)    |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/users.d/users.xml)    |

この例では、簡単のためにデフォルトユーザーはパスワードなしで設定されています。
実運用環境では、これは推奨されません。

:::note
この例では、クラスタ内のすべてのノードで各 `users.xml` ファイルは同一です。
:::



## ClickHouse Keeperの設定 {#configure-clickhouse-keeper-nodes}

### Keeperのセットアップ {#configuration-explanation}

<KeeperConfig />

| ディレクトリ                                               | ファイル                                                                                                                                                                                         |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

<KeeperConfigExplanation />

<CloudTip />


## セットアップのテスト {#test-the-setup}

マシン上でDockerが実行されていることを確認してください。
`cluster_1S_2R`ディレクトリのルートから`docker-compose up`コマンドを使用してクラスタを起動します:

```bash
docker-compose up -d
```

DockerがClickHouseとKeeperのイメージをプルし始め、
その後コンテナが起動する様子が表示されます:

```bash
[+] Running 6/6
 ✔ Network cluster_1s_2r_default   Created
 ✔ Container clickhouse-keeper-03  Started
 ✔ Container clickhouse-keeper-02  Started
 ✔ Container clickhouse-keeper-01  Started
 ✔ Container clickhouse-01         Started
 ✔ Container clickhouse-02         Started
```

クラスタが実行されていることを確認するには、`clickhouse-01`または`clickhouse-02`のいずれかに接続し、
以下のクエリを実行します。最初のノードへの接続コマンドを以下に示します:


```bash
# 任意のノードに接続
docker exec -it clickhouse-01 clickhouse-client
```

成功すると、ClickHouse クライアントのプロンプトが表示されます。

```response
cluster_1S_2R ノード 1 :)
```

次のクエリを実行して、どのホストに対してどのクラスタートポロジーが定義されているかを確認します。

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

ClickHouse Keeper クラスターの状態を確認するには、次のクエリを実行します。

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

<VerifyKeeperStatus />

これで、1 つのシャードと 2 つのレプリカを持つ ClickHouse クラスターのセットアップが完了しました。
次のステップでは、クラスター内にテーブルを作成します。


## データベースの作成 {#creating-a-database}

クラスタが正しくセットアップされ、稼働していることを確認したので、次に[英国不動産価格](/getting-started/example-datasets/uk-price-paid)のサンプルデータセットチュートリアルで使用したものと同じテーブルを再作成します。このデータセットは、1995年以降のイングランドとウェールズにおける不動産取引価格の約3000万行で構成されています。

各ホストのクライアントに接続するには、別々のターミナルタブまたはウィンドウから以下のコマンドをそれぞれ実行します:

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
ON CLUSTER cluster_1S_2R;
```

各ホストのクライアントから再度同じクエリを実行して、`clickhouse-01`でのみクエリを実行したにもかかわらず、クラスタ全体にデータベースが作成されたことを確認できます:

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

データベースが作成されたので、クラスター上にテーブルを作成します。
いずれかのホストクライアントから以下のクエリを実行してください：

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

これは[UK property prices](/getting-started/example-datasets/uk-price-paid)サンプルデータセットチュートリアルの元の`CREATE`文で使用されたクエリと同一ですが、`ON CLUSTER`句と`ReplicatedMergeTree`エンジンの使用が追加されている点が異なります。

`ON CLUSTER`句は、`CREATE`、`DROP`、`ALTER`、`RENAME`などのDDL（データ定義言語）クエリを分散実行するために設計されており、これらのスキーマ変更がクラスター内のすべてのノードに適用されることを保証します。

[`ReplicatedMergeTree`](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replication#converting-from-mergetree-to-replicatedmergetree)エンジンは通常の`MergeTree`テーブルエンジンと同様に動作しますが、データのレプリケーションも行います。

`clickhouse-01`または`clickhouse-02`のいずれかのクライアントから以下のクエリを実行して、テーブルがクラスター全体に作成されたことを確認できます：

```sql title="クエリ"
SHOW TABLES IN uk;
```

```response title="レスポンス"
   ┌─name────────────────┐
1. │ uk_price_paid.      │
   └─────────────────────┘
```


## データの挿入 {#inserting-data}

データセットが大規模で、完全に取り込むには数分かかるため、まずは小さなサブセットのみを挿入します。

`clickhouse-01`から以下のクエリを使用して、データの小さなサブセットを挿入します:

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

データが各ホストで完全にレプリケートされていることを確認してください:

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

ホストの1つに障害が発生した場合に何が起こるかを実証するために、いずれかのホストから簡単なテストデータベースとテストテーブルを作成します:

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

`uk_price_paid`テーブルと同様に、いずれかのホストからデータを挿入できます:

```sql
INSERT INTO test.test_table (id, name) VALUES (1, 'Clicky McClickface');
```

しかし、ホストの1つがダウンしている場合はどうなるでしょうか?これをシミュレートするために、以下を実行して`clickhouse-01`を停止します:

```bash
docker stop clickhouse-01
```

以下を実行してホストがダウンしていることを確認します:

```bash
docker-compose ps
```

```response title="レスポンス"
NAME                   IMAGE                                        COMMAND            SERVICE                CREATED          STATUS          PORTS
clickhouse-02          clickhouse/clickhouse-server:latest          "/entrypoint.sh"   clickhouse-02          X minutes ago    Up X minutes    127.0.0.1:8124->8123/tcp, 127.0.0.1:9001->9000/tcp
clickhouse-keeper-01   clickhouse/clickhouse-keeper:latest-alpine   "/entrypoint.sh"   clickhouse-keeper-01   X minutes ago    Up X minutes    127.0.0.1:9181->9181/tcp
clickhouse-keeper-02   clickhouse/clickhouse-keeper:latest-alpine   "/entrypoint.sh"   clickhouse-keeper-02   X minutes ago    Up X minutes    127.0.0.1:9182->9181/tcp
clickhouse-keeper-03   clickhouse/clickhouse-keeper:latest-alpine   "/entrypoint.sh"   clickhouse-keeper-03   X minutes ago    Up X minutes    127.0.0.1:9183->9181/tcp
```

`clickhouse-01`がダウンした状態で、テストテーブルに別のデータ行を挿入し、テーブルをクエリします:

```sql
INSERT INTO test.test_table (id, name) VALUES (2, 'Alexey Milovidov');
SELECT * FROM test.test_table;
```


```response title="レスポンス"
   ┌─id─┬─name───────────────┐
1. │  1 │ Clicky McClickface │
2. │  2 │ Alexey Milovidov   │
   └────┴────────────────────┘
```

次に、以下のコマンドで `clickhouse-01` を再起動します（再起動されたことを確認するには、その後で `docker-compose ps` を再度実行してください）。

```sql
docker start clickhouse-01
```

`docker exec -it clickhouse-01 clickhouse-client` を実行した後、`clickhouse-01` 上のテストテーブルを再度クエリします。

```sql title="クエリ"
SELECT * FROM test.test_table
```

```response title="レスポンス"
   ┌─id─┬─name───────────────┐
1. │  1 │ Clicky McClickface │
2. │  2 │ Alexey Milovidov   │
   └────┴────────────────────┘
```

この時点で、検証用に英国の不動産価格データセット全体を取り込みたい場合は、次のクエリを実行してください。

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

`clickhouse-02` または `clickhouse-01` からテーブルをクエリします。

```sql title="クエリ"
SELECT count(*) FROM uk.uk_price_paid_local;
```

```response title="レスポンス"
   ┌──count()─┐
1. │ 30212555 │ -- 約 3,021 万件
   └──────────┘
```

</VerticalStepper>


## まとめ {#conclusion}

このクラスタトポロジの利点は、2つのレプリカを使用することで、データが2つの別々のホスト上に存在することです。1つのホストに障害が発生しても、もう一方のレプリカがデータ損失なくデータ提供を継続します。これにより、ストレージレベルでの単一障害点が排除されます。

1つのホストがダウンした場合でも、残りのレプリカは以下のことが可能です:

- 読み取りクエリを中断なく処理する
- 新しい書き込みを受け付ける(整合性設定による)
- アプリケーションに対するサービス可用性を維持する

障害が発生したホストがオンラインに復帰すると、以下のことが可能です:

- 正常なレプリカから不足しているデータを自動的に同期する
- 手動介入なしで通常の運用を再開する
- 完全な冗長性を迅速に復元する

次の例では、2つのシャードを持つが、レプリカは1つだけのクラスタの設定方法を見ていきます。
