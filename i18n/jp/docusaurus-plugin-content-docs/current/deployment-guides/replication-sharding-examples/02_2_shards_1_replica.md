---
'slug': '/architecture/horizontal-scaling'
'sidebar_label': 'スケーリング'
'sidebar_position': 10
'title': 'スケーリング'
'description': 'ページは、スケーラビリティを提供するために設計された例のアーキテクチャについて説明しています。'
'doc_type': 'guide'
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

> この例では、スケール可能なシンプルな ClickHouse クラスターのセットアップ方法を学びます。設定されているサーバーは 5 台です。2 台はデータをシャードするために使用され、残りの 3 台はコーディネーションのために使用されます。

設定するクラスターのアーキテクチャは以下に示されています：

<Image img={ShardingArchitecture} size='md' alt='2 つのシャードと 1 つのレプリカのアーキテクチャ図' />

<DedicatedKeeperServers/>

## 前提条件 {#pre-requisites}

- 以前に [ローカル ClickHouse サーバー](/install) を設定したことがある
- [設定ファイル](/operations/configuration-files) など、ClickHouse の基本的な設定概念に精通している
- お使いのマシンに docker がインストールされている

<VerticalStepper level="h2">

## ディレクトリ構造とテスト環境をセットアップする {#set-up}

<ExampleFiles/>

このチュートリアルでは、[Docker compose](https://docs.docker.com/compose/) を使用して ClickHouse クラスターをセットアップします。このセットアップは、別々のローカルマシン、仮想マシン、またはクラウドインスタンスでも動作するように変更できます。

次のコマンドを実行して、この例のためのディレクトリ構造を設定します：

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

次の `docker-compose.yml` ファイルを `clickhouse-cluster` ディレクトリに追加します：

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

次のサブディレクトリとファイルを作成します：

```bash
for i in {01..02}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d/config.xml
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d/users.xml
done
```

<ConfigExplanation/>

## ClickHouse ノードを構成する {#configure-clickhouse-servers}

### サーバーセットアップ {#server-setup}

次に、`fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d` にある各空の設定ファイル `config.xml` を修正します。以下で強調表示されている行は、各ノードに特有のものに変更する必要があります：

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

| ディレクトリ                                                 | ファイル                                                                                                                                                                              |
|-----------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml)  |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml)  |

上記の設定ファイルの各セクションは、以下でより詳細に説明します。

#### ネットワーキングとロギング {#networking}

<ListenHost/>

ロギングは `<logger>` ブロックで定義されています。この例の設定では、デバッグログが 1000M ごとに 3 回ロールオーバーします：

```xml
<logger>
    <level>debug</level>
    <log>/var/log/clickhouse-server/clickhouse-server.log</log>
    <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
    <size>1000M</size>
    <count>3</count>
</logger>
```

ロギング設定の詳細については、デフォルトの ClickHouse [設定ファイル](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml) に含まれているコメントを参照してください。

#### クラスター構成 {#cluster-configuration}

クラスターの設定は `<remote_servers>` ブロックで行います。ここでクラスター名 `cluster_2S_1R` が定義されています。

`<cluster_2S_1R></cluster_2S_1R>` ブロックは、クラスターのレイアウトを定義し、`<shard></shard>` と `<replica></replica>` 設定を使用し、`ON CLUSTER` 句を使用してクラスター全体で実行されるクエリである分散 DDL クエリのテンプレートとして機能します。デフォルトでは、分散 DDL クエリは許可されますが、`allow_distributed_ddl_queries` 設定でオフにすることも可能です。

`internal_replication` は true に設定されており、データはレプリカの 1 つにのみ書き込まれます。

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

<ServerParameterTable/>

#### Keeper 構成 {#keeper-config-explanation}

`<ZooKeeper>` セクションは、ClickHouse が ClickHouse Keeper (または ZooKeeper) が実行されている場所を示します。ClickHouse Keeper クラスターを使用しているため、各クラスターの `<node>` を指定し、ホスト名とポート番号をそれぞれ `<host>` と `<port>` タグを使用して記述する必要があります。

ClickHouse Keeper のセットアップは、このチュートリアルの次のステップで説明します。

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
ClickHouse Keeper を ClickHouse Server と同じサーバーで実行することは可能ですが、本番環境では ClickHouse Keeper を専用ホストで実行することを強くお勧めします。
:::

#### マクロ構成 {#macros-config-explanation}

さらに、`<macros>` セクションは、レプリケートされたテーブルのパラメータ置換を定義するために使用されます。これらは `system.macros` にリストされ、クエリで `{shard}` や `{replica}` のような置換を使用できるようにします。

```xml
<macros>
    <shard>01</shard>
    <replica>01</replica>
</macros>
```

:::note
これらはクラスターのレイアウトによって一意に定義されます。
:::

### ユーザー構成 {#user-config}

次に、`fs/volumes/clickhouse-{}/etc/clickhouse-server/users.d` にある各空の設定ファイル `users.xml` を以下の内容で修正します：

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
| `fs/volumes/clickhouse-01/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-01/etc/clickhouse-server/users.d/users.xml)    |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-02/etc/clickhouse-server/users.d/users.xml)    |

この例では、デフォルトユーザーが簡単さを考慮してパスワードなしで設定されています。実際には、これは推奨されません。

:::note
この例では、各 `users.xml` ファイルはクラスター内のすべてのノードで同一です。
:::

## ClickHouse Keeper を構成する {#configure-clickhouse-keeper-nodes}

### Keeper セットアップ {#configuration-explanation}

<KeeperConfig/>

| ディレクトリ                                                        | ファイル                                                                                                                                                                                         |
|------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-keeper-01/etc/clickhouse-server/config.d` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-02/etc/clickhouse-server/config.d` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-03/etc/clickhouse-server/config.d` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

<KeeperConfigExplanation/>

<CloudTip/>

## セットアップをテストする {#test-the-setup}

お使いのマシンで docker が実行されていることを確認してください。`cluster_2S_1R` ディレクトリのルートから `docker-compose up` コマンドを使用してクラスターを起動します：

```bash
docker-compose up -d
```

ClickHouse と Keeper のイメージがプルされ、コンテナが起動し始めるのが表示されるはずです：

```bash
[+] Running 6/6
 ✔ Network cluster_2s_1r_default   Created
 ✔ Container clickhouse-keeper-03  Started
 ✔ Container clickhouse-keeper-02  Started
 ✔ Container clickhouse-keeper-01  Started
 ✔ Container clickhouse-01         Started
 ✔ Container clickhouse-02         Started
```

クラスターが実行中であることを確認するために、`clickhouse-01` または `clickhouse-02` に接続し、次のクエリを実行します。最初のノードに接続するためのコマンドが示されています：

```bash

# Connect to any node
docker exec -it clickhouse-01 clickhouse-client
```

成功した場合、ClickHouse クライアントプロンプトが表示されます：

```response
cluster_2S_1R node 1 :)
```

次のクエリを実行して、どのホストに対してどのクラスターのトポロジーが定義されているかを確認します：

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

次のクエリを実行して ClickHouse Keeper クラスターの状態を確認します：

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

<VerifyKeeperStatus/>

これで、単一のシャードと 2 つのレプリカを持つ ClickHouse クラスターが正常にセットアップされました。次のステップでは、クラスター内にテーブルを作成します。

## データベースを作成する {#creating-a-database}

クラスターが正しくセットアップされ、実行中であることを確認したので、[UK property prices](/getting-started/example-datasets/uk-price-paid) の例データセットチュートリアルで使用されているのと同じテーブルを再作成します。このテーブルは、1995 年以降のイングランドおよびウェールズの不動産物件に対する支払い価格の約 3000 万行で構成されています。

各ホストのクライアントに接続するには、別々のターミナルタブまたはウィンドウから次のコマンドを実行します：

```bash
docker exec -it clickhouse-01 clickhouse-client
docker exec -it clickhouse-02 clickhouse-client
```

各ホストの clickhouse-client から以下のクエリを実行して、デフォルトのデータベースを除いてまだデータベースが作成されていないことを確認できます：

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

`clickhouse-01` クライアントから、`ON CLUSTER` 句を使用して新しいデータベース `uk` を作成する **分散** DDL クエリを実行します：

```sql
CREATE DATABASE IF NOT EXISTS uk 
-- highlight-next-line
ON CLUSTER cluster_2S_1R;
```

前回と同じクエリを各ホストのクライアントから再度実行して、`clickhouse-01` でのみクエリを実行しても、クラスター全体でデータベースが作成されたことを確認できます：

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

データベースが作成されたので、分散テーブルを作成します。分散テーブルは、異なるホストにあるシャードにアクセスできるテーブルであり、`Distributed` テーブルエンジンを使用して定義されます。分散テーブルは、クラスター内のすべてのシャードを横断するインターフェイスとして機能します。

任意のホストクライアントから次のクエリを実行します：

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

このクエリは、[UK property prices](/getting-started/example-datasets/uk-price-paid) の例データセットチュートリアルの元の `CREATE` ステートメントで使用されたクエリと同一であることに注意してください。ただし、`ON CLUSTER` 句が異なります。

`ON CLUSTER` 句は、`CREATE`、`DROP`、`ALTER`、`RENAME` といった DDL (データ定義言語) クエリの分散実行のために設計されており、これらのスキーマ変更がクラスター内のすべてのノードに適用されることを保証します。

クラスター全体でテーブルが作成されていることを確認するために、各ホストのクライアントから以下のクエリを実行できます：

```sql title="Query"
SHOW TABLES IN uk;
```

```response title="Response"
   ┌─name────────────────┐
1. │ uk_price_paid_local │
   └─────────────────────┘
```

## 分散テーブルにデータを挿入する {#inserting-data}

UK 支払い価格データを挿入する前に、どのような状況になるかを確認するために、任意のホストから通常のテーブルにデータを挿入するための簡単な実験を行いましょう。

任意のホストから以下のクエリを実行してテストデータベースとテーブルを作成します：

```sql
CREATE DATABASE IF NOT EXISTS test ON CLUSTER cluster_2S_1R;
CREATE TABLE test.test_table ON CLUSTER cluster_2S_1R
(
    `id` UInt64,
    `name` String
)
ENGINE = ReplicatedMergeTree
ORDER BY id;
```

次に `clickhouse-01` から以下の `INSERT` クエリを実行します：

```sql
INSERT INTO test.test_table (id, name) VALUES (1, 'Clicky McClickface');
```

`clickhouse-02` に切り替え、以下の `INSERT` クエリを実行します：

```sql title="Query"
INSERT INTO test.test_table (id, name) VALUES (1, 'Alexey Milovidov');
```

次に `clickhouse-01` または `clickhouse-02` から以下のクエリを実行します：

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

特定のホストのテーブルに挿入された行のみが返されることに注意してください。

2 つのシャードからデータを読み取るには、すべてのシャードを横断し、選択クエリを実行する際に両方のシャードからデータを結合し、挿入クエリを実行する際に別のシャードへのデータの挿入を処理できるインターフェースが必要です。

ClickHouse では、このインターフェースは分散テーブルと呼ばれ、[`Distributed`](/engines/table-engines/special/distributed) テーブルエンジンを使用して作成します。その仕組みを見てみましょう。

次のクエリを使用して分散テーブルを作成します：

```sql
CREATE TABLE test.test_table_dist ON CLUSTER cluster_2S_1R AS test.test_table
ENGINE = Distributed('cluster_2S_1R', 'test', 'test_table', rand())
```

この例では、`rand()` 関数がシャーディングキーとして選ばれ、挿入がシャードにランダムに分配されます。

任意のホストから分散テーブルをクエリすると、2 つのホストに挿入された両方の行が返されます：

```sql
   ┌─id─┬─name───────────────┐
1. │  1 │ Alexey Milovidov   │
2. │  1 │ Clicky McClickface │
   └────┴────────────────────┘
```

UK プロパティ価格データでも同様のことを行いましょう。任意のホストクライアントから次のクエリを実行して、既存のテーブルを使用して分散テーブルを作成します：

```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_distributed
ON CLUSTER cluster_2S_1R
ENGINE = Distributed('cluster_2S_1R', 'uk', 'uk_price_paid_local', rand());
```

次に、任意のホストに接続し、データを挿入します：

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

```sql title="Query"
SELECT count(*)
FROM uk.uk_price_paid_distributed
```

```response title="Response"
   ┌──count()─┐
1. │ 30212555 │ -- 30.21 million
   └──────────┘
```

任意のホストで次のクエリを実行すると、データがシャード全体にほぼ均等に分配されていることが確認できます（挿入するシャードの選択が `rand()` で設定されているため、結果は異なる場合があります）：

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

一方のホストが失敗した場合はどうなるでしょうか？ `clickhouse-01` をシャットダウンしてシミュレートしてみましょう：

```bash
docker stop clickhouse-01
```

ホストがダウンしていることを確認するには、次のコマンドを実行します：

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

次に、`clickhouse-02` から分散テーブルで以前に実行したのと同じセレクトクエリを実行します：

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

残念ながら、私たちのクラスターはフォールトトレラントではありません。一方のホストが失敗すると、クラスターは不健全と見なされ、クエリは失敗します。これは、[前の例](/architecture/replication) で見たレプリケートテーブルとは異なり、そこではホストの 1 つが失敗してもデータを挿入できました。

</VerticalStepper>

## 結論 {#conclusion}

このクラスター トポロジーの利点は、データが別々のホストに分散され、各ノードあたりのストレージが半分になることです。さらに重要なのは、クエリが両方のシャードで処理されるため、メモリ利用効率が向上し、ホストごとの I/O が削減されることです。

このクラスター トポロジーの主な欠点はもちろん、ホストの 1 つを失うとクエリに応じることができなくなることです。

次の例では、スケーラビリティとフォールトトレランスの両方を提供する 2 つのシャードと 2 つのレプリカを持つクラスターのセットアップ方法を見ていきます。
