---
'slug': '/architecture/cluster-deployment'
'sidebar_label': 'レプリケーション + スケーリング'
'sidebar_position': 100
'title': 'レプリケーション + スケーリング'
'description': 'このチュートリアルを通じて、シンプルな ClickHouse クラスターのセットアップ方法を学ぶことができます。'
'doc_type': 'guide'
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

> この例では、レプリケーションとスケーリングの両方を行うシンプルなClickHouseクラスタのセットアップ方法を学びます。これは、2つのシャードと2つのレプリカから成り、クラスター内での調整とクオラムを維持するために3ノードのClickHouse Keeperクラスターを使用します。

あなたが設定するクラスターのアーキテクチャは以下の通りです。

<Image img={SharedReplicatedArchitecture} size='md' alt='2つのシャードと1つのレプリカのアーキテクチャ図' />

<DedicatedKeeperServers/>

## 前提条件 {#prerequisites}

- あなたは以前に[ローカルClickHouseサーバー](/install)をセットアップしている
- あなたはClickHouseの基本的な設定概念、例えば[設定ファイル](/operations/configuration-files)に慣れている
- あなたのマシンにdockerがインストールされている

<VerticalStepper level="h2">

## ディレクトリ構造とテスト環境の設定 {#set-up}

<ExampleFiles/>

このチュートリアルでは、[Docker compose](https://docs.docker.com/compose/)を使用してClickHouseクラスタをセットアップします。このセットアップは、別のローカルマシン、仮想マシン、またはクラウドインスタンスでも動作するように変更できます。

次のコマンドを実行して、この例のためのディレクトリ構造を設定します。

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

次の`docker-compose.yml`ファイルを`clickhouse-cluster`ディレクトリに追加します：

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

<ConfigExplanation/>

## ClickHouseノードの設定 {#configure-clickhouse-servers}

### サーバーの設定 {#server-setup}

次に、`fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d` にある各空の設定ファイル `config.xml` を変更します。以下に強調表示された行を各ノードに特有のものに変更する必要があります：

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

| ディレクトリ                                                        | ファイル                                                                                                                                                                               |
|------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml)  |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml)  |
| `fs/volumes/clickhouse-03/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-03/etc/clickhouse-server/config.d/config.xml)  |
| `fs/volumes/clickhouse-04/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-04/etc/clickhouse-server/config.d/config.xml)  |

上記の設定ファイルの各セクションについては、以下で詳細に説明します。

#### ネットワーキングとロギング {#networking}

<ListenHost/>

ロギングの設定は`<logger>`ブロックで定義されています。この例の設定では、1000Mで3回ロールオーバーするデバッグログを生成します：

```xml
<logger>
   <level>debug</level>
   <log>/var/log/clickhouse-server/clickhouse-server.log</log>
   <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
   <size>1000M</size>
   <count>3</count>
</logger>
```

ロギング設定についての詳細は、デフォルトのClickHouse[設定ファイル](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)に含まれるコメントを参照してください。

#### クラスター設定 {#cluster-config}

クラスターの設定は`<remote_servers>`ブロックで行います。ここでクラスター名`cluster_2S_2R`が定義されています。

`<cluster_2S_2R></cluster_2S_2R>`ブロックは、シャードのレイアウトを定義し、分散DDLクエリ（`ON CLUSTER`句を使用してクラスター全体で実行されるクエリ）のテンプレートとして機能します。デフォルトでは、分散DDLクエリは許可されていますが、`allow_distributed_ddl_queries`の設定を使ってオフにすることもできます。

`internal_replication`はtrueに設定されており、データは1つのレプリカに書き込まれます。

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

`<cluster_2S_2R></cluster_2S_2R>`セクションはクラスターのレイアウトを定義し、`ON CLUSTER`句を用いてクラスター全体で実行される分散DDLクエリのテンプレートとして機能します。

#### Keeper設定 {#keeper-config-explanation}

`<ZooKeeper>`セクションは、ClickHouse Keeper（またはZooKeeper）がどこで動作しているかをClickHouseに指示します。ClickHouse Keeperクラスターを使用しているため、クラスタの各`<node>`のホスト名とポート番号をそれぞれ`<host>`および`<port>`タグを使用して指定する必要があります。

ClickHouse Keeperの設定については、次の手順で説明します。

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
ClickHouse KeeperをClickHouse Serverと同じサーバーで実行することは可能ですが、本番環境ではClickHouse Keeperを専用ホストで実行することを強く推奨します。
:::

#### マクロ設定 {#macros-config-explanation}

加えて、`<macros>`セクションは複製されたテーブルのパラメータ置換を定義するために使用されます。これらは`system.macros`にリストされ、クエリ内で`{shard}`や`{replica}`といった置換を使用することが可能です。

```xml
<macros>
   <shard>01</shard>
   <replica>01</replica>
</macros>
```

### ユーザー設定 {#cluster-configuration}

次に、`fs/volumes/clickhouse-{}/etc/clickhouse-server/users.d`にある各空の設定ファイル `users.xml`を以下のように変更します：

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

この例では、デフォルトのユーザーは簡単のためにパスワードなしで設定されています。実際には、これは推奨されません。

:::note
この例では、各`users.xml`ファイルはクラスタ内のすべてのノードで同一です。
:::

## ClickHouse Keeperの設定 {#configure-clickhouse-keeper-nodes}

次に、調整用にClickHouse Keeperを設定します。

### Keeperの設定 {#configuration-explanation}

<KeeperConfig/>

| ディレクトリ                                                         | ファイル                                                                                                                                                                                      |
|------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-keeper-01/etc/clickhouse-server/config.d` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-02/etc/clickhouse-server/config.d` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-03/etc/clickhouse-server/config.d` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

<KeeperConfigExplanation/>

<CloudTip/>

## セットアップのテスト {#test-the-setup}

マシンでdockerが実行されていることを確認してください。
`cluster_2S_2R`ディレクトリのルートから`docker-compose up`コマンドを使用してクラスターを起動します：

```bash
docker-compose up -d
```

ClickHouseおよびKeeperのイメージをdockerがプルし始め、その後コンテナが起動されるのを見ることができるはずです：

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

クラスターが稼働していることを確認するために、任意のノードに接続して以下のクエリを実行します。最初のノードへの接続コマンドは以下の通りです：

```bash

# Connect to any node
docker exec -it clickhouse-01 clickhouse-client
```

成功すれば、ClickHouseクライアントのプロンプトが表示されます：

```response
cluster_2S_2R node 1 :)
```

次のクエリを実行して、どのホストにクラスターのトポロジーが定義されているかを確認します：

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

次のクエリを実行して、ClickHouse Keeperクラスターの状態をチェックします：

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

<VerifyKeeperStatus/>

これで、2つのシャードと2つのレプリカを持つClickHouseクラスタが正常にセットアップされました。次のステップでは、クラスター内にテーブルを作成します。

## データベースの作成 {#creating-a-database}

クラスターが正しく設定されて稼働していることを確認したので、[UKの物件価格](/getting-started/example-datasets/uk-price-paid)例のデータセットで使用されているのと同じテーブルを再作成します。これは、1995年以降のイングランドとウェールズの不動産物件の支払い価格約3000万行から構成されています。

各ホストのクライアントに接続するには、別々のターミナルタブまたはウィンドウから以下の各コマンドを実行します：

```bash
docker exec -it clickhouse-01 clickhouse-client
docker exec -it clickhouse-02 clickhouse-client
docker exec -it clickhouse-03 clickhouse-client
docker exec -it clickhouse-04 clickhouse-client
```

各ホストのclickhouse-clientから以下のクエリを実行して、デフォルトのものを除いてまだ作成されていないデータベースがないことを確認できます：

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

`clickhouse-01`クライアントから、`ON CLUSTER`句を使用して新しいデータベース`uk`を作成するための**分散**DDLクエリを実行します：

```sql
CREATE DATABASE IF NOT EXISTS uk 
-- highlight-next-line
ON CLUSTER cluster_2S_2R;
```

再度、前回と同じクエリを各ホストのクライアントから実行して、`clickhouse-01`からのみクエリを実行したにもかかわらず、クラスター全体でデータベースが作成されたことを確認します：

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

## クラスター上に分散テーブルを作成する {#creating-a-table}

データベースが作成されたので、次に分散テーブルを作成します。分散テーブルは、異なるホストにあるシャードにアクセスできるテーブルであり、`Distributed`テーブルエンジンを使用して定義されます。分散テーブルは、クラスター内のすべてのシャードを通じてのインターフェースとして機能します。

任意のホストクライアントから以下のクエリを実行します：

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

これは、[UKの物件価格](/getting-started/example-datasets/uk-price-paid)例のデータセットチュートリアルの元の`CREATE`ステートメントで使用されたクエリと同一ですが、`ON CLUSTER`句と`ReplicatedMergeTree`エンジンの使用を除いています。

`ON CLUSTER`句は、`CREATE`、`DROP`、`ALTER`、`RENAME`などのDDL（データ定義言語）クエリの分散実行のために設計されており、これらのスキーマ変更がクラスター内のすべてのノードに適用されることを保証します。

[`ReplicatedMergeTree`](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replication#converting-from-mergetree-to-replicatedmergetree)エンジンは、普通の`MergeTree`テーブルエンジンと同様に機能しますが、データも複製します。これは、以下の2つのパラメータを指定する必要があります：

- `zoo_path`: テーブルのメタデータへのKeeper/ZooKeeperパス。
- `replica_name`: テーブルのレプリカ名。

<br/>

`zoo_path`パラメータは、任意の値に設定できますが、次の接頭辞を用いることが推奨されます。

```text
/clickhouse/tables/{shard}/{database}/{table}
```

ここで：
- `{database}`と`{table}`は自動的に置換されます。 
- `{shard}`と`{replica}`は、各ClickHouseノードの`config.xml`ファイルで[定義された](#macros-config-explanation)マクロです。

各ホストのクライアントから、テーブルがクラスター全体に作成されたことを確認するためのクエリを実行できます：

```sql title="Query"
SHOW TABLES IN uk;
```

```response title="Response"
   ┌─name────────────────┐
1. │ uk_price_paid_local │
   └─────────────────────┘
```

## 分散テーブルにデータを挿入する {#inserting-data-using-distributed}

分散テーブルにデータを挿入するには、`ON CLUSTER`を使用することはできません。これは、`INSERT`、`UPDATE`、および`DELETE`などのDML（データ操作言語）クエリには適用されません。データを挿入するには、[`Distributed`](/engines/table-engines/special/distributed)テーブルエンジンを使用する必要があります。

任意のホストクライアントから以下のクエリを実行して、先に`ON CLUSTER`と`ReplicatedMergeTree`を使用して作成した既存のテーブルを利用して分散テーブルを作成します：

```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_distributed
ON CLUSTER cluster_2S_2R
ENGINE = Distributed('cluster_2S_2R', 'uk', 'uk_price_paid_local', rand());
```

各ホストの`uk`データベースには、次のようなテーブルが表示されます：

```sql
   ┌─name──────────────────────┐
1. │ uk_price_paid_distributed │
2. │ uk_price_paid_local       │
   └───────────────────────────┘
```

データは、以下のクエリを使用して任意のホストクライアントから`uk_price_paid_distributed`テーブルに挿入できます：

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

以下のクエリを実行して、挿入されたデータがクラスターのノードに均等に分散されていることを確認します：

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
