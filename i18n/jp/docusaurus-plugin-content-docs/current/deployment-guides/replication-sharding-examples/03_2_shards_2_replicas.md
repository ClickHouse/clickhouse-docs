---
slug: /architecture/cluster-deployment
sidebar_label: 'レプリケーションとスケーリング'
sidebar_position: 100
title: 'レプリケーションとスケーリング'
description: 'このチュートリアルでは、シンプルな ClickHouse クラスターのセットアップ方法を学びます。'
doc_type: 'guide'
keywords: ['クラスター展開', 'レプリケーション', 'シャーディング', '高可用性', 'スケーラビリティ']
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

> この例では、レプリケーションとスケーリングの両方に対応したシンプルな ClickHouse クラスターの構成方法について説明します。\
> これは 2 つのシャードと 2 つのレプリカ、およびクラスター内のコーディネーションとクォーラム維持を行う 3 ノード構成の ClickHouse Keeper クラスターで構成されます。

これからセットアップするクラスターのアーキテクチャは、次の図のとおりです。

<Image img={SharedReplicatedArchitecture} size="md" alt="2 つのシャードと 1 つのレプリカのアーキテクチャ図" />

<DedicatedKeeperServers />


## 前提条件 {#prerequisites}

- 事前に[ローカルClickHouseサーバー](/install)をセットアップ済みであること
- [設定ファイル](/operations/configuration-files)などのClickHouseの基本的な設定概念を理解していること
- マシンにDockerがインストールされていること

<VerticalStepper level="h2">


## ディレクトリ構造とテスト環境のセットアップ

<ExampleFiles />

このチュートリアルでは、[Docker Compose](https://docs.docker.com/compose/) を使用して
ClickHouse クラスターをセットアップします。この構成は、
個別のローカルマシン、仮想マシン、あるいはクラウドインスタンスでも動作するように調整できます。

この例用のディレクトリ構造を用意するために、次のコマンドを実行します。

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

以下の`docker-compose.yml`ファイルを`clickhouse-cluster`ディレクトリに追加します:

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

次のサブディレクトリとファイルを作成してください。

```bash
for i in {01..04}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d/config.xml
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d/users.xml
done
```

<ConfigExplanation />


## ClickHouse ノードを構成する

### サーバーのセットアップ

次に、`fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d` にある空の設定ファイル `config.xml` を各ノードごとに編集します。以下で強調表示されている行は、各ノードに固有の設定となるよう変更する必要があります。

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

| Directory                                                 | File                                                                                                                                                                             |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-03/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-03/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-04/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-04/etc/clickhouse-server/config.d/config.xml) |

上記の設定ファイルの各セクションについて、以下でより詳しく説明します。

#### ネットワークとロギング

<ListenHost />

ロギングの設定は `<logger>` ブロック内で定義します。このサンプル設定では、上限サイズ 1000M、最大 3 世代までローテーションされるデバッグログを出力します。


```xml
<logger>
   <level>debug</level>
   <log>/var/log/clickhouse-server/clickhouse-server.log</log>
   <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
   <size>1000M</size>
   <count>3</count>
</logger>
```

ログ設定の詳細については、デフォルトの ClickHouse [設定ファイル](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml) に含まれているコメントを参照してください。

#### クラスター設定

クラスターの設定は `<remote_servers>` ブロックで定義します。
ここでクラスター名 `cluster_2S_2R` が定義されています。

`<cluster_2S_2R></cluster_2S_2R>` ブロックは、`<shard></shard>` および `<replica></replica>` 設定を使ってクラスターのレイアウトを定義し、`ON CLUSTER` 句を使用してクラスター全体で実行される分散 DDL クエリのテンプレートとして機能します。デフォルトでは分散 DDL クエリは許可されていますが、`allow_distributed_ddl_queries` 設定で無効にすることもできます。

`internal_replication` は true に設定されており、データはレプリカのうち 1 つのみに書き込まれます。

```xml
<remote_servers>
   <!-- クラスタ名（ドットを含めないこと） -->
  <cluster_2S_2R>
      <!-- <allow_distributed_ddl_queries>false</allow_distributed_ddl_queries> -->
      <shard>
          <!-- オプション。レプリカの1つのみにデータを書き込むかどうか。デフォルト: false（全レプリカにデータを書き込む） -->
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

`<cluster_2S_2R></cluster_2S_2R>` セクションはクラスタの構成を定義し、
分散 DDL クエリのためのテンプレートとして機能します。分散 DDL クエリとは、
`ON CLUSTER` 句を使用してクラスタ全体に対して実行されるクエリのことです。

#### Keeper の設定

`<ZooKeeper>` セクションは、ClickHouse Keeper（または ZooKeeper）がどこで動作しているかを
ClickHouse に伝えます。
ClickHouse Keeper クラスタを使用しているため、クラスタの各 `<node>` を、
それぞれのホスト名およびポート番号と合わせて `<host>` と `<port>` タグで指定する必要があります。

ClickHouse Keeper のセットアップについては、このチュートリアルの次のステップで説明します。

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
ClickHouse Server と同じサーバー上で ClickHouse Keeper を実行することは可能ですが、
本番環境では ClickHouse Keeper を専用ホスト上で実行することを強く推奨します。
:::

#### Macros の設定

さらに、`<macros>` セクションは、レプリケートテーブル向けの
パラメータ置換を定義するために用いられます。これらは `system.macros` に一覧され、
クエリ内で `{shard}` や `{replica}` といった置換を利用できるようにします。

```xml
<macros>
   <shard>01</shard>
   <replica>01</replica>
</macros>
```

### ユーザー設定

次に、`fs/volumes/clickhouse-{}/etc/clickhouse-server/users.d` にある空の設定ファイル `users.xml` を、それぞれ以下の内容で編集します。


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

この例では、簡略化のためにデフォルトユーザーはパスワードなしで構成されています。
実運用環境では、これは推奨されません。

:::note
この例では、クラスター内のすべてのノードで、`users.xml` ファイルの内容は同一です。
:::


## ClickHouse Keeper を構成する {#configure-clickhouse-keeper-nodes}

次に、クラスタ内のコーディネーションに使用される ClickHouse Keeper を構成します。

### Keeper のセットアップ {#configuration-explanation}

<KeeperConfig/>

| ディレクトリ                                                        | ファイル                                                                                                                                                                                         |
|------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

<KeeperConfigExplanation/>

<CloudTip/>



## セットアップをテストする

お使いのマシンで Docker が動作していることを確認してください。
`cluster_2S_2R` ディレクトリのルートディレクトリで `docker-compose up` コマンドを実行してクラスターを起動します：

```bash
docker-compose up -d
```

Docker が ClickHouse と Keeper のイメージのプルを開始し、その後コンテナが起動する様子が確認できるはずです。

```bash
[+] 8/8 実行中
 ✔ Network   cluster_2s_2r_default     作成済み
 ✔ Container clickhouse-keeper-03      起動済み
 ✔ Container clickhouse-keeper-02      起動済み
 ✔ Container clickhouse-keeper-01      起動済み
 ✔ Container clickhouse-01             起動済み
 ✔ Container clickhouse-02             起動済み
 ✔ Container clickhouse-04             起動済み
 ✔ Container clickhouse-03             起動済み
```

クラスターが稼働していることを確認するには、いずれかのノードに接続して
次のクエリを実行します。最初のノードに接続するためのコマンドは次のとおりです。


```bash
# 任意のノードに接続
docker exec -it clickhouse-01 clickhouse-client
```

成功すると、ClickHouse クライアントのプロンプトが表示されます。

```response
cluster_2S_2R node 1 :)
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
1. │ cluster_2S_2R │         1 │           1 │ clickhouse-01 │ 9000 │
2. │ cluster_2S_2R │         1 │           2 │ clickhouse-03 │ 9000 │
3. │ cluster_2S_2R │         2 │           1 │ clickhouse-02 │ 9000 │
4. │ cluster_2S_2R │         2 │           2 │ clickhouse-04 │ 9000 │
5. │ default       │         1 │           1 │ localhost     │ 9000 │
   └───────────────┴───────────┴─────────────┴───────────────┴──────┘
```

ClickHouse Keeper クラスターのステータスを確認するには、次のクエリを実行してください。

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

これで、2つのシャードと2つのレプリカを備えた ClickHouse クラスターのセットアップが完了しました。
次のステップでは、クラスター内にテーブルを作成します。


## データベースを作成する

クラスターが正しくセットアップされて稼働していることを確認できたので、
[UK property prices](/getting-started/example-datasets/uk-price-paid)
サンプルデータセットのチュートリアルで使用したものと同じテーブルを再作成します。これは、1995年以降のイングランドおよびウェールズの不動産物件の支払価格を約 3,000 万行分含んでいます。

別々のターミナルタブまたはウィンドウから、次の各コマンドを実行して、それぞれのホストのクライアントに接続します。

```bash
docker exec -it clickhouse-01 clickhouse-client
docker exec -it clickhouse-02 clickhouse-client
docker exec -it clickhouse-03 clickhouse-client
docker exec -it clickhouse-04 clickhouse-client
```

各ホスト上の clickhouse-client から以下のクエリを実行して、デフォルトのものを除いて、まだデータベースが作成されていないことを確認できます。

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

`clickhouse-01` クライアントから、`ON CLUSTER` 句を指定した次の **分散** DDL クエリを実行して、`uk` という名前の新しいデータベースを作成します。

```sql
CREATE DATABASE IF NOT EXISTS uk 
-- highlight-next-line
ON CLUSTER cluster_2S_2R;
```

各ホストのクライアントから再度、先ほどと同じクエリを実行することで、クエリ自体は `clickhouse-01` からしか実行していないにもかかわらず、クラスタ全体にデータベースが作成されていることを確認できます。

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

データベースを作成したので、次にレプリケーション付きのテーブルを作成します。

いずれかのホストのクライアントから次のクエリを実行します。

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

先ほどのクエリは、`ON CLUSTER` 句と `ReplicatedMergeTree` エンジンの使用を除けば、
[UK property prices](/getting-started/example-datasets/uk-price-paid) のサンプルデータセットチュートリアルで
元の `CREATE` 文に使われていたクエリと同一であることに注意してください。

`ON CLUSTER` 句は、`CREATE`、`DROP`、`ALTER`、`RENAME` といった
DDL（Data Definition Language）クエリを分散実行するために設計されており、
これらのスキーマ変更がクラスター内のすべてのノードに適用されることを保証します。

[`ReplicatedMergeTree`](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replication#converting-from-mergetree-to-replicatedmergetree)
エンジンは、通常の `MergeTree` テーブルエンジンと同様に動作しますが、データのレプリケーションも行います。
このエンジンでは 2 つのパラメーターを指定する必要があります：

* `zoo_path`: Keeper/ZooKeeper 上のテーブルメタデータへのパス。
* `replica_name`: テーブルのレプリカ名。

<br />

`zoo_path` パラメーターには任意の値を設定できますが、慣例として次のようなプレフィックスを使用することが推奨されます。

```text
/clickhouse/tables/{shard}/{database}/{table}
```

ここで:

* `{database}` と `{table}` は自動的に置き換えられます。
* `{shard}` と `{replica}` は、各 ClickHouse ノードの `config.xml` ファイル内であらかじめ[定義](#macros-config-explanation)されたマクロです。

次のクエリを各ホストのクライアントから実行して、テーブルがクラスター全体に作成されていることを確認できます。

```sql title="Query"
SHOW TABLES IN uk;
```

```response title="Response"
   ┌─name────────────────┐
1. │ uk_price_paid_local │
   └─────────────────────┘
```


## 分散テーブルへのデータ挿入 {#inserting-data-using-distributed}

テーブルにデータを挿入する際、`ON CLUSTER`は使用できません。これは`INSERT`、`UPDATE`、`DELETE`などのDML(データ操作言語)クエリには適用されないためです。データを挿入するには、[`Distributed`](/engines/table-engines/special/distributed)テーブルエンジンを使用する必要があります。
2シャード1レプリカのクラスタ構築[ガイド](/architecture/horizontal-scaling)で学んだように、分散テーブルは異なるホスト上に配置されたシャードにアクセス可能なテーブルであり、`Distributed`テーブルエンジンを使用して定義されます。
分散テーブルは、クラスタ内のすべてのシャードに対するインターフェースとして機能します。

いずれかのホストクライアントから、前のステップで作成した既存のレプリケートテーブルを使用して分散テーブルを作成するため、以下のクエリを実行します:

```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_distributed
ON CLUSTER cluster_2S_2R
ENGINE = Distributed('cluster_2S_2R', 'uk', 'uk_price_paid_local', rand());
```

各ホストで、`uk`データベース内に以下のテーブルが表示されます:

```sql
   ┌─name──────────────────────┐
1. │ uk_price_paid_distributed │
2. │ uk_price_paid_local       │
   └───────────────────────────┘
```

いずれかのホストクライアントから、以下のクエリを使用して`uk_price_paid_distributed`テーブルにデータを挿入できます:

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

挿入されたデータがクラスタのノード間で均等に分散されていることを確認するため、以下のクエリを実行します:

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


## 結論 {#conclusion}

2 つのシャードと 2 つのレプリカを持つこのクラスター構成の利点は、スケーラビリティとフォールトトレランスの両方を提供できる点にあります。
データは個別のホストに分散されるため、ノードあたりのストレージおよび I/O 要件が削減される一方で、クエリは両方のシャードで並列に処理され、パフォーマンスとメモリ効率が向上します。
重要な点として、各シャードには別ノード上にバックアップレプリカが存在するため、クラスターはノード 1 台の喪失を許容し、中断することなくクエリ処理を継続できます。

このクラスター構成の主な欠点は、ストレージのオーバーヘッドが増加することです。各シャードが複製されるため、レプリカなしの構成と比べて 2 倍のストレージ容量が必要になります。
さらに、クラスターは単一ノード障害には耐えられるものの、どのノードが障害を起こすかとシャードの分散状況によっては、2 ノードが同時に失われるとクラスターが動作不能になる可能性があります。
この構成は、可用性とコストのバランスをとるものであり、より高いレプリケーション係数に伴うコストをかけずに、一定のフォールトトレランスが求められる本番環境に適しています。

ClickHouse Cloud がどのようにクエリを処理し、スケーラビリティとフォールトトレランスを両立しているかについては、「[Parallel Replicas](/deployment-guides/parallel-replicas)」セクションを参照してください。