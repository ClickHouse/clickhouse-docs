---
slug: /architecture/replication
sidebar_label: 'レプリケーション'
sidebar_position: 10
title: 'データのレプリケーション'
description: 'このページでは、5 台のサーバーで構成されるサンプルアーキテクチャについて説明します。2 台はデータのコピーを保持するために使用し、残りはデータレプリケーションの調整に使用します'
doc_type: 'guide'
keywords: ['レプリケーション', '高可用性', 'クラスター構成', 'データ冗長性', 'フォールトトレランス']
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

> この例では、データをレプリケーションするシンプルな ClickHouse クラスターの構成方法について説明します。
> ここでは 5 台のサーバーが設定されています。そのうち 2 台はデータのコピーを保持するために使用されます。
> 残りの 3 台のサーバーは、データのレプリケーションを調整するために使用されます。

これから構成するクラスターのアーキテクチャは、次の図のとおりです。

<Image img={ReplicationArchitecture} size="md" alt="ReplicatedMergeTree を用いた 1 シャード 2 レプリカ構成のアーキテクチャ図" />

<DedicatedKeeperServers />


## 前提条件 {#pre-requisites}

- 事前に[ローカルClickHouseサーバー](/install)をセットアップ済みであること
- [設定ファイル](/operations/configuration-files)などのClickHouseの基本的な設定概念を理解していること
- マシンにDockerがインストールされていること

<VerticalStepper level="h2">


## ディレクトリ構造とテスト環境のセットアップ

<ExampleFiles />

このチュートリアルでは、[Docker Compose](https://docs.docker.com/compose/) を使用して
ClickHouse クラスターを構成します。この構成は、個別のローカルマシン、仮想マシン、あるいはクラウドインスタンスでも動作するように変更できます。

この例のディレクトリ構造をセットアップするには、次のコマンドを実行します。

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

以下の`docker-compose.yml`ファイルを`cluster_1S_2R`ディレクトリに追加します:

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

以下のサブディレクトリとファイルを作成します:

```bash
for i in {01..02}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d/config.xml
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d/users.xml
done
```

<ConfigExplanation />


## ClickHouse ノードの設定

### サーバーのセットアップ

次に、`fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d` にある空の設定ファイル `config.xml` を各ノードごとに編集します。以下でハイライトされている行は、各ノードに固有の値へ変更する必要があります。

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
    <display_name>cluster_1S_2R ノード 1</display_name>
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

| Directory                                                 | File                                                                                                                                                                             |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml) |

上記の構成ファイルの各セクションについて、以下でより詳しく説明します。

#### ネットワークおよびログ

<ListenHost />

ログは `<logger>` ブロックで定義します。この設定例では、
1000M に達するごとにローテーションされ、最大 3 個分のデバッグログファイルが保持されます。

```xml
<logger>
    <level>debug</level>
    <log>/var/log/clickhouse-server/clickhouse-server.log</log>
    <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
    <size>1000M</size>
    <count>3</count>
</logger>
```

ログ設定の詳細については、ClickHouse のデフォルト[設定ファイル](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)に記載されているコメントを参照してください。

#### クラスター設定

クラスターの設定は `<remote_servers>` ブロック内で行います。
ここでは、クラスター名 `cluster_1S_2R` が定義されています。


`<cluster_1S_2R></cluster_1S_2R>` ブロックは、`<shard></shard>` と `<replica></replica>` の設定を使用してクラスタのレイアウトを定義し、`ON CLUSTER` 句を用いてクラスタ全体で実行される分散 DDL クエリのテンプレートとして機能します。分散 DDL クエリはデフォルトで許可されていますが、設定 `allow_distributed_ddl_queries` によって無効化することもできます。

`internal_replication` は true に設定されており、データはレプリカのうち 1 つのみに書き込まれます。

```xml
<remote_servers>
    <!-- クラスター名(ドットを含めないこと) -->
    <cluster_1S_2R>
        <!-- <allow_distributed_ddl_queries>false</allow_distributed_ddl_queries> -->
        <shard>
            <!-- オプション。レプリカの1つのみにデータを書き込むかどうか。デフォルト: false(すべてのレプリカにデータを書き込む)。 -->
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

#### Keeper の設定

`<ZooKeeper>` セクションは、ClickHouse Keeper（または ZooKeeper）がどこで動作しているかを ClickHouse に示します。
ClickHouse Keeper クラスターを使用する場合は、クラスター内の各 `<node>` について、
それぞれのホスト名とポート番号を `<host>` および `<port>` タグで指定する必要があります。

ClickHouse Keeper のセットアップ方法については、このチュートリアルの次のステップで説明します。

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
ClickHouse Keeper を ClickHouse Server と同じサーバー上で実行することも可能ですが、
本番環境では ClickHouse Keeper を専用ホスト上で実行することを強く推奨します。
:::

#### Macros の設定

さらに、`<macros>` セクションは、レプリケートテーブル向けのパラメータ置換を定義するために使用されます。これらは `system.macros` に一覧表示され、クエリ内で `{shard}` や `{replica}` といった置換を使用できるようになります。

```xml
<macros>
    <shard>01</shard>
    <replica>01</replica>
    <cluster>cluster_1S_2R</cluster>
</macros>
```

:::note
これらは、クラスターのレイアウトに応じて個別に定義します。
:::

### ユーザー設定

次に、`fs/volumes/clickhouse-{}/etc/clickhouse-server/users.d` にある空の設定ファイル `users.xml` を、以下の内容でそれぞれ編集します。

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
| `fs/volumes/clickhouse-01/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/users.d/users.xml)    |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/users.d/users.xml)    |

この例では、デフォルトユーザーは説明を簡単にするためパスワードなしで構成されています。
実運用では、このような設定は推奨されません。

:::note
この例では、各 `users.xml` ファイルはクラスター内のすべてのノードで同一です。
:::



## ClickHouse Keeper を設定する {#configure-clickhouse-keeper-nodes}

### Keeper のセットアップ {#configuration-explanation}

<KeeperConfig/>

| ディレクトリ                                                        | ファイル                                                                                                                                                                                         |
|------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

<KeeperConfigExplanation/>

<CloudTip/>



## セットアップをテストする

お使いのマシンで Docker が稼働していることを確認してください。
`cluster_1S_2R` ディレクトリのルートで `docker-compose up` コマンドを実行してクラスターを起動します。

```bash
docker-compose up -d
```

Docker が ClickHouse と Keeper のイメージをプルし、その後コンテナの起動を開始する様子が確認できるはずです：

```bash
[+] 6/6 個が稼働中
 ✔ ネットワーク cluster_1s_2r_default   作成済み
 ✔ コンテナ clickhouse-keeper-03  起動済み
 ✔ コンテナ clickhouse-keeper-02  起動済み
 ✔ コンテナ clickhouse-keeper-01  起動済み
 ✔ コンテナ clickhouse-01         起動済み
 ✔ コンテナ clickhouse-02         起動済み
```

クラスターが稼働していることを確認するには、`clickhouse-01` または `clickhouse-02` のいずれかに接続して、
次のクエリを実行します。最初のノードへの接続コマンドは次のとおりです。


```bash
# 任意のノードに接続
docker exec -it clickhouse-01 clickhouse-client
```

成功すると、ClickHouse クライアントのプロンプトが表示されます。

```response
cluster_1S_2R node 1 :)
```

どのホストにどのクラスタートポロジーが定義されているかを確認するには、次のクエリを実行します。

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

ClickHouse Keeper クラスターの状態を確認するには、次のクエリを実行してください。

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

これで、1つのシャードと2つのレプリカを持つ ClickHouse クラスターの構成が完了しました。
次のステップでは、クラスター内にテーブルを作成します。


## データベースを作成する

クラスターが正しくセットアップされ、正常に稼働していることを確認したので、
[UK property prices](/getting-started/example-datasets/uk-price-paid)
サンプルデータセットのチュートリアルで使用したものと同じテーブルを再作成します。これは、1995年以降のイングランドおよびウェールズの不動産物件に対して支払われた価格を約 3,000 万行分含むテーブルです。

各ホストのクライアントに接続するには、次の各コマンドを別々のターミナルタブまたはウィンドウから実行します。

```bash
docker exec -it clickhouse-01 clickhouse-client
docker exec -it clickhouse-02 clickhouse-client
```

各ホストで clickhouse-client から次のクエリを実行し、デフォルトのもの以外にはまだデータベースが作成されていないことを確認します。

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

`clickhouse-01` クライアントから、`ON CLUSTER` 句を使用した次の **分散** DDL クエリを実行して、`uk` という名前の新しいデータベースを作成します：

```sql
CREATE DATABASE IF NOT EXISTS uk 
-- highlight-next-line
ON CLUSTER cluster_1S_2R;
```

各ホストのクライアントから、先ほどと同じクエリを再度実行してみてください。
これにより、クエリは `clickhouse-01` に対してのみ実行したにもかかわらず、
クラスタ全体でデータベースが作成されていることを確認できます。

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


## クラスター内にテーブルを作成する

データベースを作成したので、クラスター内にテーブルを作成します。
いずれかのホストクライアントから次のクエリを実行します：

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

`ON CLUSTER` 句と `ReplicatedMergeTree` エンジンの使用を除けば、
[UK property prices](/getting-started/example-datasets/uk-price-paid) のサンプルデータセットチュートリアルで使用した
元の `CREATE` ステートメントとまったく同じクエリであることに注意してください。

`ON CLUSTER` 句は、`CREATE`、`DROP`、`ALTER`、`RENAME` といった
DDL (Data Definition Language) クエリを分散実行するために設計されており、
これらのスキーマ変更がクラスタ内のすべてのノードに適用されることを保証します。

[`ReplicatedMergeTree`](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replication#converting-from-mergetree-to-replicatedmergetree)
エンジンは通常の `MergeTree` テーブルエンジンと同様に動作しますが、データを複製する点が異なります。

以下のクエリを `clickhouse-01` または `clickhouse-02` のいずれかのクライアントから実行して、
テーブルがクラスタ全体で作成されたことを確認できます。

```sql title="Query"
SHOW TABLES IN uk;
```

```response title="Response"
   ┌─name────────────────┐
1. │ uk_price_paid.      │
   └─────────────────────┘
```


## データを挿入する

データセットが大きく、完全に取り込むまでに数分かかるため、まずは一部のみを挿入します。

`clickhouse-01` から以下のクエリを実行して、データの小さなサブセットを挿入します。

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

各ホストでデータが完全にレプリケートされていることに注意してください。

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

ホストの一つが障害した場合に何が起こるかを確認するため、どちらか一方のホストから簡単なテストデータベースとテストテーブルを作成します。

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

`uk_price_paid` テーブルの場合と同様に、いずれのホストからでもデータを挿入できます。

```sql
INSERT INTO test.test_table (id, name) VALUES (1, 'Clicky McClickface');
```

しかし、ホストの 1 つがダウンした場合はどうなるでしょうか？ これを再現するために、次のコマンドを実行して `clickhouse-01` を停止します：

```bash
docker stop clickhouse-01
```

ホストがダウンしていることを確認するため、次のコマンドを実行します：

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

`clickhouse-01` が現在停止しているので、テストテーブルにさらに 1 行データを挿入し、テーブルをクエリします：

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

次のコマンドで `clickhouse-01` を再起動します（確認する場合は、その後 `docker-compose ps` を再度実行してください）：

```sql
docker start clickhouse-01
```

`docker exec -it clickhouse-01 clickhouse-client` を実行した後、`clickhouse-01` からテストテーブルに再度クエリを実行します：

```sql title="Query"
SELECT * FROM test.test_table
```

```response title="Response"
   ┌─id─┬─name───────────────┐
1. │  1 │ Clicky McClickface │
2. │  2 │ Alexey Milovidov   │
   └────┴────────────────────┘
```

この段階で、試用のために英国不動産価格データセット全体を取り込む場合は、次のクエリを実行してください：

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

`clickhouse-02` または `clickhouse-01` からテーブルにクエリを実行します：

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

このクラスター構成の利点は、レプリカが 2 つあることで、
データが 2 つの別々のホスト上に存在する点です。1 つのホストで障害が発生しても、もう一方のレプリカが
データ損失なく提供を継続できます。これにより、ストレージレベルでの
単一障害点を排除できます。

1 つのホストがダウンしても、残りのレプリカは引き続き次のことができます。
- 中断することなく読み取りクエリを処理する
- （整合性設定に応じて）新規書き込みを受け付ける
- アプリケーション向けのサービスの可用性を維持する

障害が発生したホストが再びオンラインになると、次のことができます。
- 正常なレプリカから不足しているデータを自動的に同期する
- 手動操作なしで通常運用を再開する
- 迅速に完全な冗長性を復元する

次の例では、2 つのシャードを持ち、レプリカが 1 つだけの
クラスターを構成する方法を見ていきます。
