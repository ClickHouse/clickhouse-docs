---
slug: /architecture/horizontal-scaling
sidebar_label: 'スケーリング'
sidebar_position: 10
title: 'スケーリング'
description: 'スケーラビリティを実現するよう設計されたアーキテクチャ例について説明するページ'
doc_type: 'guide'
keywords: ['シャーディング', '水平スケーリング', '分散データ', 'クラスター構成', 'データ分散']
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

> この例では、スケール可能なシンプルな ClickHouse クラスターを構成する方法を説明します。
> サーバーは 5 台構成されています。このうち 2 台はデータのシャーディングに使用され、
> 残りの 3 台のサーバーはクラスタの調整処理（コーディネーション）に使用されます。

これからセットアップするクラスターのアーキテクチャは、以下のとおりです。

<Image img={ShardingArchitecture} size="md" alt="2 つのシャードと 1 つのレプリカのアーキテクチャ図" />

<DedicatedKeeperServers />


## 前提条件 {#pre-requisites}

- 事前に[ローカルClickHouseサーバー](/install)をセットアップ済みであること
- [設定ファイル](/operations/configuration-files)などのClickHouseの基本的な設定概念を理解していること
- マシンにDockerがインストールされていること

<VerticalStepper level="h2">


## ディレクトリ構造とテスト環境のセットアップ

<ExampleFiles />

このチュートリアルでは、[Docker Compose](https://docs.docker.com/compose/) を使用して
ClickHouse クラスターをセットアップします。この構成は、
個別のローカルマシンや仮想マシン、クラウドインスタンスでも動作するように変更できます。

この例のディレクトリ構造をセットアップするには、次のコマンドを実行します。

```bash
mkdir cluster_2S_1R
cd cluster_2S_1R
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

以下の`docker-compose.yml`ファイルを`clickhouse-cluster`ディレクトリに追加します:

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


## ClickHouse ノードを構成する

### サーバーのセットアップ

次に、`fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d` にある空の設定ファイル `config.xml` を、各ノードごとに編集します。以下でハイライトされている行は、各ノードに固有の内容に変更する必要があります。

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
    <display_name>cluster_2S_1R ノード 1</display_name>
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

| Directory                                                 | File                                                                                                                                                                             |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml) |

上記の設定ファイルの各セクションについて、以下でより詳しく説明します。

#### ネットワークとログ

<ListenHost />

ログは `<logger>` ブロックで定義します。この設定例では、
サイズが 1000M に達すると最大 3 世代までローテーションされるデバッグログを出力します。

```xml
<logger>
    <level>debug</level>
    <log>/var/log/clickhouse-server/clickhouse-server.log</log>
    <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
    <size>1000M</size>
    <count>3</count>
</logger>
```

ログの設定の詳細については、デフォルトの ClickHouse [設定ファイル](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml) に記載されているコメントを参照してください。

#### クラスター設定

クラスターの設定は `<remote_servers>` ブロックで行います。
ここではクラスター名 `cluster_2S_1R` が定義されています。


`<cluster_2S_1R></cluster_2S_1R>` ブロックは、`<shard></shard>` および `<replica></replica>` 設定を使用してクラスターのレイアウトを定義し、`ON CLUSTER` 句を使用してクラスター全体で実行される分散 DDL クエリのテンプレートとして機能します。デフォルトでは分散 DDL クエリは許可されていますが、`allow_distributed_ddl_queries` 設定で無効にすることもできます。

`internal_replication` は、各シャードにつきレプリカが 1 つだけであるため、デフォルトで false のままにされています。

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

`<ZooKeeper>` セクションは、ClickHouse Keeper（または ZooKeeper）がどこで稼働しているかを ClickHouse に知らせます。
ClickHouse Keeper クラスターを使用している場合は、クラスター内の各 `<node>` について、対応するホスト名とポート番号を `<host>` および `<port>` タグで指定する必要があります。

ClickHouse Keeper の設定方法は、このチュートリアルの次のステップで説明します。

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

#### マクロの設定

さらに、`<macros>` セクションは、レプリケートテーブル用のパラメータ置換を定義するために使用されます。これらは `system.macros` に一覧表示され、クエリ内で `{shard}` や `{replica}` といった置換を使用できるようになります。

```xml
<macros>
    <shard>01</shard>
    <replica>01</replica>
</macros>
```

:::note
これらはクラスタの構成に応じて固有に定義されます。
:::

### ユーザー設定

次に、`fs/volumes/clickhouse-{}/etc/clickhouse-server/users.d` にある空の設定ファイル `users.xml` を、それぞれ以下の内容に編集します。

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

この例では、説明を簡単にするため、デフォルトユーザーはパスワードなしで設定されています。
しかし、実運用ではこのような設定は推奨されません。

:::note
この例では、各 `users.xml` ファイルはクラスタ内のすべてのノードで同一の内容になっています。
:::



## ClickHouse Keeper を設定する {#configure-clickhouse-keeper-nodes}

### Keeper のセットアップ {#configuration-explanation}

<KeeperConfig/>

| ディレクトリ                                                        | ファイル                                                                                                                                                                                         |
|------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

<KeeperConfigExplanation/>

<CloudTip/>



## セットアップを検証する

ローカルマシンで Docker が動作していることを確認してください。
`cluster_2S_1R` ディレクトリのルートで `docker-compose up` コマンドを実行してクラスターを起動します。

```bash
docker-compose up -d
```

docker が ClickHouse と Keeper のイメージをプルし始め、
その後コンテナを起動する様子が確認できるはずです。

```bash
[+] 6/6 実行中
 ✔ Network cluster_2s_1r_default   作成済み
 ✔ Container clickhouse-keeper-03  起動済み
 ✔ Container clickhouse-keeper-02  起動済み
 ✔ Container clickhouse-keeper-01  起動済み
 ✔ Container clickhouse-01         起動済み
 ✔ Container clickhouse-02         起動済み
```

クラスターが稼働していることを確認するには、`clickhouse-01` または `clickhouse-02` のいずれかに接続し、次のクエリを実行します。最初のノードに接続するためのコマンドは次のとおりです。


```bash
# 任意のノードに接続
docker exec -it clickhouse-01 clickhouse-client
```

成功すると、ClickHouse クライアントのプロンプトが表示されます。

```response
cluster_2S_1R node 1 :)
```

次のクエリを実行して、ホストごとにどのクラスタートポロジーが定義されているかを確認します。

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

ClickHouse Keeper クラスターのステータスを確認するには、次のクエリを実行してください：

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

これで、1シャード2レプリカ構成の ClickHouse クラスターを正常に構築できました。
次のステップでは、このクラスター上にテーブルを作成します。


## データベースを作成する

クラスターが正しくセットアップされて稼働していることを確認できたので、
[UK property prices](/getting-started/example-datasets/uk-price-paid)
サンプルデータセットのチュートリアルで使用したものと同じテーブルを再作成します。これは、1995年以降のイングランドおよびウェールズにおける不動産物件の支払済み価格が、約 3,000 万行分含まれています。

それぞれ別のターミナルタブまたはウィンドウから、次の各コマンドを実行して、各ホスト上のクライアントに接続します。

```bash
docker exec -it clickhouse-01 clickhouse-client
docker exec -it clickhouse-02 clickhouse-client
```

各ホスト上の clickhouse-client から以下のクエリを実行して、
デフォルトのもの以外のデータベースがまだ作成されていないことを確認できます。

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

`clickhouse-01` クライアントから次の **分散** DDL クエリを `ON CLUSTER` 句付きで実行し、`uk` という名前の新しいデータベースを作成します：

```sql
CREATE DATABASE IF NOT EXISTS uk 
-- highlight-next-line
ON CLUSTER cluster_2S_1R;
```

各ホストのクライアントから、先ほどと同じクエリを再度実行して、
クエリは `clickhouse-01` で一度実行しただけにもかかわらず、
クラスタ全体にデータベースが作成されていることを確認できます。

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


## クラスター上にテーブルを作成する

これでデータベースが作成できたので、次にテーブルを作成します。
どのホストクライアントからでも次のクエリを実行します：

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

`ON CLUSTER` 句を除いて、これは
[UK property prices](/getting-started/example-datasets/uk-price-paid) のサンプルデータセットチュートリアルで使用した
元の `CREATE` 文のクエリと同一であることに注意してください。

`ON CLUSTER` 句は、`CREATE`、`DROP`、`ALTER`、`RENAME` といった DDL（Data Definition Language、データ定義言語）
クエリを分散実行するためのものであり、これらのスキーマ変更がクラスター内のすべてのノードに適用されることを保証します。

以下のクエリを各ホストのクライアントから実行することで、テーブルがクラスター内のすべてのノード上に作成されていることを確認できます。

```sql title="Query"
SHOW TABLES IN uk;
```

```response title="Response"
   ┌─name────────────────┐
1. │ uk_price_paid_local │
   └─────────────────────┘
```

UK price paid データを挿入する前に、まず簡単な実験として、
いずれかのホストから通常のテーブルにデータを挿入した場合に何が起こるかを確認してみます。

いずれかのホストから、次のクエリを実行してテスト用のデータベースとテーブルを作成します。

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

次に、`clickhouse-01` から次の `INSERT` クエリを実行します:

```sql
INSERT INTO test.test_table (id, name) VALUES (1, 'Clicky McClickface');
```

`clickhouse-02` に切り替え、次の `INSERT` クエリを実行します：

```sql title="Query"
INSERT INTO test.test_table (id, name) VALUES (1, 'Alexey Milovidov');
```

次に、`clickhouse-01` または `clickhouse-02` のいずれかから、次のクエリを実行します。

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

`ReplicatedMergeTree` テーブルの場合と異なり、その特定のホスト上のテーブルに挿入された行だけが返され、両方の行は返されないことが分かります。

2つのシャードをまたいでデータを読み取るには、すべてのシャードを対象とするクエリを処理し、SELECT クエリを実行したときには両方のシャードからのデータを結合し、INSERT クエリを実行したときには両方のシャードにデータを挿入できるインターフェイスが必要です。

ClickHouse では、このインターフェイスは **distributed table** と呼ばれ、[`Distributed`](/engines/table-engines/special/distributed) テーブルエンジンを使って作成します。どのように動作するか見ていきましょう。


## 分散テーブルを作成する

次のクエリを使用して分散テーブルを作成します。

```sql
CREATE TABLE test.test_table_dist ON CLUSTER cluster_2S_1R AS test.test_table
ENGINE = Distributed('cluster_2S_1R', 'test', 'test_table', rand())
```

この例では、`rand()` 関数をシャーディングキーとして選択し、
挿入がシャード間でランダムに分散されるようにしています。

いずれかのホストから分散テーブルをクエリすると、2 つのホストに挿入された
2 行がどちらも返されます。これは前の例とは異なる動作です。

```sql
SELECT * FROM test.test_table_dist;
```

```sql
   ┌─id─┬─name───────────────┐
1. │  1 │ Alexey Milovidov   │
2. │  1 │ Clicky McClickface │
   └────┴────────────────────┘
```

同様の処理を、UK の不動産価格データに対しても行います。いずれかのホストクライアントから、
次のクエリを実行して、以前に `ON CLUSTER` で作成した既存テーブルを利用して
分散テーブルを作成します：

```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_distributed
ON CLUSTER cluster_2S_1R
ENGINE = Distributed('cluster_2S_1R', 'uk', 'uk_price_paid_local', rand());
```


## 分散テーブルにデータを挿入する

いずれかのホストに接続し、データを挿入します。

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

データの挿入が完了したら、分散テーブルを使用して行数を確認できます。

```sql title="Query"
SELECT count(*)
FROM uk.uk_price_paid_distributed
```

```response title="Response"
   ┌──count()─┐
1. │ 30212555 │ -- 3021万
   └──────────┘
```

いずれかのホストで次のクエリを実行すると、データがシャード間でおおむね均等に分散されていることが確認できます（どのシャードに挿入するかの選択は `rand()` によって決まるため、結果は異なる場合があります）:

```sql
-- clickhouse-01から
SELECT count(*)
FROM uk.uk_price_paid_local
--    ┌──count()─┐
-- 1. │ 15107353 │ -- 1511万件
--    └──────────┘

-- clickhouse-02から
SELECT count(*)
FROM uk.uk_price_paid_local
--    ┌──count()─┐
-- 1. │ 15105202 │ -- 1510万件
--    └──────────┘
```

ホストの1つがダウンした場合はどうなるでしょうか。これを検証するために、
`clickhouse-01` をシャットダウンしてみましょう。

```bash
docker stop clickhouse-01
```

ホストがダウンしていることを確認するには、次を実行してください：

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

では、`clickhouse-02` から、先ほど分散テーブルに対して実行したのと同じ SELECT クエリを実行します。

```sql
SELECT count(*)
FROM uk.uk_price_paid_distributed
```

```response title="Response"
サーバーから例外を受信しました (バージョン 25.5.2):
コード: 279. DB::Exception: localhost:9000 から受信しました。DB::Exception: すべての接続試行が失敗しました。ログ:
```


Code: 32. DB::Exception: EOF 以降を読み取ろうとしました。 (ATTEMPT&#95;TO&#95;READ&#95;AFTER&#95;EOF) (version 25.5.2.47 (official build))
Code: 209. DB::NetException: タイムアウト: 接続がタイムアウトしました: 192.168.7.1:9000 (clickhouse-01:9000, 192.168.7.1, local address: 192.168.7.2:37484, connection timeout 1000 ms). (SOCKET&#95;TIMEOUT) (version 25.5.2.47 (official build))
#highlight-next-line
Code: 198. DB::NetException: ホストのアドレスが見つかりません: clickhouse-01: (clickhouse-01:9000, 192.168.7.1, local address: 192.168.7.2:37484). (DNS&#95;ERROR) (version 25.5.2.47 (official build))

: Remote を実行中に発生しました。 (ALL&#95;CONNECTION&#95;TRIES&#95;FAILED)

```

残念ながら、このクラスタには耐障害性がありません。ホストの1つに障害が発生すると、
クラスタは異常状態と見なされ、クエリは失敗します。これは、[前の例](/architecture/replication)で確認したレプリケーションテーブルとは対照的です。レプリケーションテーブルでは、ホストの1つに障害が発生しても
データを挿入できました。

</VerticalStepper>
```


## まとめ {#conclusion}

このクラスタートポロジーの利点は、データが個別のホスト間で分散され、ノードごとのストレージ使用量が半分になることです。さらに重要なのは、クエリが両方のシャードに分散して処理されるため、メモリ使用効率が高まり、ホストごとの I/O が削減される点です。

このクラスタートポロジーの主な欠点は、当然ながら、ホストの 1 つを失うとクエリを処理できなくなることです。

[次の例](/architecture/cluster-deployment)では、スケーラビリティとフォールトトレランスの両方を備えた、2 シャード 2 レプリカ構成のクラスタのセットアップ方法を見ていきます。
