---
'slug': '/architecture/replication'
'sidebar_label': 'Replication'
'sidebar_position': 10
'title': 'データのレプリケーション'
'description': '五台のサーバーが構成された例のアーキテクチャを説明するページです。二台はデータのコピーをホストするために使用され、残りはデータのレプリケーションを調整するために使用されます。'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import ReplicationShardingTerminology from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_replication-sharding-terminology.md';
import ReplicationArchitecture from '@site/static/images/deployment-guides/replication-sharding-examples/replication.png';
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

> この例では、データをレプリケートするシンプルな ClickHouse クラスターを設定する方法を学びます。5 台のサーバーが構成されています。2 台はデータのコピーをホストするために使用され、残りの 3 台はデータのレプリケーションを調整するために使用されます。

設定するクラスターのアーキテクチャは以下の通りです。

<Image img={ReplicationArchitecture} size="md" alt="Architecture diagram for 1 shard and 2 replicas with ReplicatedMergeTree" />

<DedicatedKeeperServers/>

## 前提条件 {#pre-requisites}

- 以前に [ローカル ClickHouse サーバー](/install) をセットアップしたことがある
- [構成ファイル](/operations/configuration-files) など、ClickHouse の基本的な構成概念に精通している
- あなたのマシンに Docker がインストールされている

<VerticalStepper level="h2">

## ディレクトリ構造とテスト環境の設定 {#set-up}

<ExampleFiles/>

このチュートリアルでは、 [Docker compose](https://docs.docker.com/compose/) を使用して ClickHouse クラスターを設定します。この設定は、別のローカル マシン、仮想マシン、またはクラウド インスタンスでも機能するように変更できます。

以下のコマンドを実行して、この例のためのディレクトリ構造を設定します。

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

次に、`cluster_1S_2R` ディレクトリに以下の `docker-compose.yml` ファイルを追加します。

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

以下のサブディレクトリとファイルを作成します。

```bash
for i in {01..02}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d/config.xml
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d/users.xml
done
```

<ConfigExplanation/>

## ClickHouse ノードの構成 {#configure-clickhouse-servers}

### サーバーのセットアップ {#server-setup}

次に、`fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d` にある各空の構成ファイル `config.xml` を変更します。以下に強調表示された行は、各ノードに特有のものに変更する必要があります。

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

| ディレクトリ                                                | ファイル                                                                                                                                                                           |
|-----------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml) |

上記の構成ファイルの各セクションについては、以下で詳しく説明します。

#### ネットワーキングとロギング {#networking}

<ListenHost/>

ロギングは `<logger>` ブロックで定義されています。この例の構成では、1000M ごとに 3 回ロールオーバーするデバッグログを提供します。

```xml
<logger>
    <level>debug</level>
    <log>/var/log/clickhouse-server/clickhouse-server.log</log>
    <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
    <size>1000M</size>
    <count>3</count>
</logger>
```

ロギング構成の詳細については、デフォルトの ClickHouse [構成ファイル](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml) に含まれているコメントを参照してください。

#### クラスター構成 {#cluster-configuration}

クラスターの構成は `<remote_servers>` ブロックで設定されています。ここでクラスター名 `cluster_1S_2R` が定義されています。

`<cluster_1S_2R></cluster_1S_2R>` ブロックは、クラスターのレイアウトを定義し、 `<shard></shard>` と `<replica></replica>` 設定を使用し、 `ON CLUSTER` 句を使用してクラスター全体で実行されるクエリのテンプレートとして機能します。デフォルトでは、分散 DDL クエリは許可されていますが、`allow_distributed_ddl_queries` 設定でオフにすることもできます。

`internal_replication` は、データがレプリカの 1 つにのみ書き込まれるように true に設定されています。

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

#### Keeper 構成 {#keeper-config-explanation}

`<ZooKeeper>` セクションは、ClickHouse が ClickHouse Keeper (または ZooKeeper) が実行されている場所を指示します。ClickHouse Keeper クラスターを使用しているため、クラスターの各 `<node>` は、次のように `<host>` および `<port>` タグを使用して、そのホスト名とポート番号を指定する必要があります。

ClickHouse Keeper のセットアップは、チュートリアルの次のステップで説明します。

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
ClickHouse Keeper を ClickHouse サーバーと同じサーバーで実行することは可能ですが、運用環境では ClickHouse Keeper を専用ホストで実行することを強く推奨します。
:::

#### マクロ構成 {#macros-config-explanation}

さらに、`<macros>` セクションは、レプリケートされたテーブルのパラメータ置換を定義するために使用されます。これらは `system.macros` にリストされ、クエリで `{shard}` や `{replica}` のような置換を使用できるようにします。

```xml
<macros>
    <shard>01</shard>
    <replica>01</replica>
    <cluster>cluster_1S_2R</cluster>
</macros>
```

:::note
これらは、クラスターのレイアウトに応じて一意に定義されます。
:::

### ユーザー構成 {#user-config}

次に、`fs/volumes/clickhouse-{}/etc/clickhouse-server/users.d` にある各空の構成ファイル `users.xml` を次のように変更します。

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

| ディレクトリ                                                | ファイル                                                                                                                                                                           |
|-----------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-01/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/users.d/users.xml) |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/users.d/users.xml) |

この例では、デフォルト ユーザーは単純さのためにパスワードなしで構成されています。実際には、これは推奨されません。

:::note
この例では、クラスター内のすべてのノードに対して `users.xml` ファイルは同一です。
:::

## ClickHouse Keeper の構成 {#configure-clickhouse-keeper-nodes}

### Keeper セットアップ {#configuration-explanation}

<KeeperConfig/>

| ディレクトリ                                                        | ファイル                                                                                                                                                                                       |
|------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-keeper-01/etc/clickhouse-server/config.d` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-02/etc/clickhouse-server/config.d` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-03/etc/clickhouse-server/config.d` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

<KeeperConfigExplanation/>

<CloudTip/>

## セットアップのテスト {#test-the-setup}

Docker がマシンで実行されていることを確認してください。`docker-compose up` コマンドを `cluster_1S_2R` ディレクトリのルートから使用してクラスターを起動します。

```bash
docker-compose up -d
```

ClickHouse と Keeper のイメージを Docker がプルし始め、その後、コンテナーが開始されるのを見ることができるはずです。

```bash
[+] Running 6/6
 ✔ Network cluster_1s_2r_default   Created
 ✔ Container clickhouse-keeper-03  Started
 ✔ Container clickhouse-keeper-02  Started
 ✔ Container clickhouse-keeper-01  Started
 ✔ Container clickhouse-01         Started
 ✔ Container clickhouse-02         Started
```

クラスターが実行されていることを確認するために、`clickhouse-01` または `clickhouse-02` のいずれかに接続し、以下のクエリを実行します。最初のノードに接続するためのコマンドは以下の通りです。

```bash

# Connect to any node
docker exec -it clickhouse-01 clickhouse-client
```

成功すると、ClickHouse クライアントのプロンプトが表示されます。

```response
cluster_1S_2R node 1 :)
```

次のクエリを実行して、どのホストにどのクラスター トポロジーが定義されているかを確認します。

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

次のクエリを実行して、ClickHouse Keeper クラスターのステータスを確認します。

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

これで、単一のシャードと 2 つのレプリカを持つ ClickHouse クラスターを正常にセットアップしました。次のステップでは、クラスターにテーブルを作成します。

## データベースを作成する {#creating-a-database}

クラスターが正しく設定され、実行されていることを確認したので、 [UK property prices](/getting-started/example-datasets/uk-price-paid) の例データセットで使用されているのと同じテーブルを再作成します。これは、1995 年以降のイギリスとウェールズでの不動産の価格に関する約 3000 万行のデータで構成されています。

以下のコマンドを別々のターミナル タブまたはウィンドウから実行して、各ホストのクライアントに接続します。

```bash
docker exec -it clickhouse-01 clickhouse-client
docker exec -it clickhouse-02 clickhouse-client
```

以下のクエリを各ホストの clickhouse-client から実行して、デフォルトのもの以外にまだデータベースが作成されていないことを確認できます。

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

`clickhouse-01` クライアントから以下の **分散** DDL クエリを `ON CLUSTER` 句を使用して実行し、`uk` という新しいデータベースを作成します。

```sql
CREATE DATABASE IF NOT EXISTS uk 
-- highlight-next-line
ON CLUSTER cluster_1S_2R;
```

再度、各ホストのクライアントから同じクエリを実行して、`clickhouse-01` でクエリを実行したにもかかわらず、データベースがクラスター全体に作成されていることを確認できます。

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

データベースが作成されたので、クラスター上にテーブルを作成します。任意のホストのクライアントから以下のクエリを実行してください。

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

それが、[UK property prices](/getting-started/example-datasets/uk-price-paid) の例データセットチュートリアルの元の `CREATE` ステートメントで使用されているクエリと同一であることに気付くでしょう。ただし `ON CLUSTER` 句と `ReplicatedMergeTree` エンジンの使用が異なります。

`ON CLUSTER` 句は、`CREATE`、`DROP`、`ALTER`、および `RENAME` のような DDL (データ定義言語) クエリを分散して実行するために設計されており、これらのスキーマ変更がクラスター内のすべてのノードに適用されることを保証します。

[`ReplicatedMergeTree`](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replication#converting-from-mergetree-to-replicatedmergetree) エンジンは、通常の `MergeTree` テーブルエンジンと同様に機能しますが、データもレプリケートします。

`clickhouse-01` または `clickhouse-02` クライアントから以下のクエリを実行して、テーブルがクラスター全体に作成されたことを確認できます。

```sql title="Query"
SHOW TABLES IN uk;
```

```response title="Response"
   ┌─name────────────────┐
1. │ uk_price_paid.      │
   └─────────────────────┘
```

## データを挿入する {#inserting-data}

データセットが大きく、完全に取り込むのに数分かかるため、最初に小さなサブセットのみを挿入します。

以下のクエリを使用して、`clickhouse-01` からデータの小さなサブセットを挿入します。

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

データは各ホストに完全にレプリケートされることに注意してください。

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

ホストの 1 つが失敗した場合に何が起こるかを示すために、どちらかのホストから簡単なテストデータベースとテストテーブルを作成します。

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

`uk_price_paid` テーブルと同様に、どちらのホストからでもデータを挿入できます。

```sql
INSERT INTO test.test_table (id, name) VALUES (1, 'Clicky McClickface');
```

しかし、ホストの 1 つがダウンした場合はどうなりますか？これをシミュレートするために、次のコマンドを実行して `clickhouse-01` を停止します。

```bash
docker stop clickhouse-01
```

以下のコマンドを実行して、ホストがダウンしていることを確認します。

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

`clickhouse-01` がダウンした状態で、テストテーブルに新しい行を挿入して、テーブルをクエリします。

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

次に、以下のコマンドを実行して `clickhouse-01` を再起動します（再起動後に確認するために再度 `docker-compose ps` を実行できます）。

```sql
docker start clickhouse-01
```

`clickhouse-01` で `docker exec -it clickhouse-01 clickhouse-client` を実行した後に再度テストテーブルをクエリします。

```sql title="Query"
SELECT * FROM test.test_table
```

```response title="Response"
   ┌─id─┬─name───────────────┐
1. │  1 │ Clicky McClickface │
2. │  2 │ Alexey Milovidov   │
   └────┴────────────────────┘
```

この時点で、完全な UK property price データセットを取り込んで遊びたい場合は、次のクエリを実行できます。

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

```sql title="Query"
SELECT count(*) FROM uk.uk_price_paid_local;
```

```response title="Response"
   ┌──count()─┐
1. │ 30212555 │ -- 30.21 million
   └──────────┘
```

</VerticalStepper>

## 結論 {#conclusion}

このクラスター トポロジーの利点は、2 つのレプリカを使用することで、データが 2 つの異なるホストに存在することです。1 つのホストが障害を起こしても、他のレプリカはデータを失うことなく提供を続けます。これにより、ストレージ レベルでの障害の単一ポイントが排除されます。

1 つのホストがダウンすると、残りのレプリカは次のことが可能です。
- 中断なしに読み取りクエリを処理する
- 新しい書き込みを受け入れる (一貫性設定による)
- アプリケーションのサービス可用性を維持する

障害が発生したホストがオンラインに戻ると、次のことが可能です。
- 健全なレプリカから不足しているデータを自動的に同期する
- 手動介入なしで通常の操作を再開する
- 迅速に完全な冗長性を回復する

次の例では、2 つのシャードを持ち、レプリカは 1 つだけのクラスターを設定する方法について見ていきます。
