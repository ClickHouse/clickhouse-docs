---
'slug': '/architecture/cluster-deployment'
'sidebar_label': 'クラスター展開'
'sidebar_position': 100
'title': 'クラスターの展開'
'description': 'このチュートリアルを通じて、簡単なClickHouseクラスターの設定方法を学ぶことができます。'
---



このチュートリアルでは、[ローカル ClickHouse サーバー](../getting-started/install/install.mdx)が既にセットアップされている前提です。

このチュートリアルを通じて、シンプルな ClickHouse クラスターのセットアップ方法を学びます。小規模ですが、フォールトトレラントでスケーラブルです。その後、サンプルデータセットの1つを使用してデータを埋め込み、いくつかのデモクエリを実行します。

## クラスター展開 {#cluster-deployment}

この ClickHouse クラスターは均質なクラスターになります。手順は以下の通りです：

1. クラスター内のすべてのマシンに ClickHouse サーバーをインストールします
2. 設定ファイル内でクラスターの設定を行います
3. 各インスタンスにローカルテーブルを作成します
4. [分散テーブル](../engines/table-engines/special/distributed.md)を作成します

[分散テーブル](../engines/table-engines/special/distributed.md)は、ClickHouse クラスター内のローカルテーブルへの「ビュー」の一種です。分散テーブルからの SELECT クエリは、クラスター内のすべてのシャードのリソースを使用して実行されます。複数のクラスターに対して設定を指定し、異なるクラスターのビューを提供するために複数の分散テーブルを作成することができます。

以下は、1つのレプリカを持つ3つのシャードからなるクラスターの設定例です：

```xml
<remote_servers>
    <perftest_3shards_1replicas>
        <shard>
            <replica>
                <host>example-perftest01j.clickhouse.com</host>
                <port>9000</port>
            </replica>
        </shard>
        <shard>
            <replica>
                <host>example-perftest02j.clickhouse.com</host>
                <port>9000</port>
            </replica>
        </shard>
        <shard>
            <replica>
                <host>example-perftest03j.clickhouse.com</host>
                <port>9000</port>
            </replica>
        </shard>
    </perftest_3shards_1replicas>
</remote_servers>
```

さらにデモを行うために、シングルノード展開チュートリアルで使用した`CREATE TABLE`クエリと同じクエリで、異なるテーブル名で新しいローカルテーブルを作成します：

```sql
CREATE TABLE tutorial.hits_local (...) ENGINE = MergeTree() ...
```

分散テーブルを作成することで、クラスターのローカルテーブルへのビューを提供します：

```sql
CREATE TABLE tutorial.hits_all AS tutorial.hits_local
ENGINE = Distributed(perftest_3shards_1replicas, tutorial, hits_local, rand());
```

クラスター内のすべてのマシンに同様の分散テーブルを作成するのは一般的な手法です。これにより、クラスターの任意のマシン上で分散クエリを実行できます。また、特定の SELECT クエリのために[remote](../sql-reference/table-functions/remote.md)テーブル関数を使用して一時的な分散テーブルを作成する代替オプションもあります。

分散テーブルにデータを広めるために、[INSERT SELECT](../sql-reference/statements/insert-into.md)を実行しましょう。

```sql
INSERT INTO tutorial.hits_all SELECT * FROM tutorial.hits_v1;
```

予想通り、計算的に重いクエリは1台のサーバーの代わりに3台のサーバーを利用する場合、N倍速く実行されます。

この場合、3つのシャードを持つクラスターを使用しており、各シャードには単一のレプリカが含まれています。

本番環境での耐障害性を提供するために、各シャードには2〜3のレプリカを持たせることを推奨します。これらのレプリカは、複数のアベイラビリティゾーンまたはデータセンター（あるいは少なくともラック）に分散させるべきです。ClickHouseは無制限の数のレプリカをサポートしていることに注意してください。

以下は、3つのレプリカを持つ1つのシャードからなるクラスターの設定例です：

```xml
<remote_servers>
    ...
    <perftest_1shards_3replicas>
        <shard>
            <replica>
                <host>example-perftest01j.clickhouse.com</host>
                <port>9000</port>
             </replica>
             <replica>
                <host>example-perftest02j.clickhouse.com</host>
                <port>9000</port>
             </replica>
             <replica>
                <host>example-perftest03j.clickhouse.com</host>
                <port>9000</port>
             </replica>
        </shard>
    </perftest_1shards_3replicas>
</remote_servers>
```

ネイティブレプリケーションを有効にするには、[ZooKeeper](http://zookeeper.apache.org/)が必要です。ClickHouseはすべてのレプリカでデータの整合性を確保し、障害後に自動的に復元手順を実行します。ZooKeeper クラスターは、他のプロセス（ClickHouseを含む）が稼働していない専用サーバーに展開することを推奨します。

:::note 注
ZooKeeperは厳密な要件ではありません：単純な場合には、アプリケーションコードからすべてのレプリカにデータを書き込むことでデータを複製することができます。このアプローチは**推奨されません**。なぜなら、この場合 ClickHouse はすべてのレプリカでデータの整合性を保証できず、したがってアプリケーションの責任となるからです。
:::

ZooKeeperの位置は、設定ファイル内で指定します：

```xml
<zookeeper>
    <node>
        <host>zoo01.clickhouse.com</host>
        <port>2181</port>
    </node>
    <node>
        <host>zoo02.clickhouse.com</host>
        <port>2181</port>
    </node>
    <node>
        <host>zoo03.clickhouse.com</host>
        <port>2181</port>
    </node>
</zookeeper>
```

また、シャードとレプリカを識別するためのマクロを設定する必要があります。これらはテーブルの作成時に使用されます：

```xml
<macros>
    <shard>01</shard>
    <replica>01</replica>
</macros>
```

レプリケーションテーブル作成時にレプリカが存在しない場合、新しい最初のレプリカがインスタンス化されます。すでにライブレプリカがある場合は、新しいレプリカが既存のものからデータをクローンします。すべてのレプリケーションテーブルを先に作成し、その後でデータを挿入することができます。また、いくつかのレプリカを作成し、他をデータ挿入中またはその後に追加するオプションもあります。

```sql
CREATE TABLE tutorial.hits_replica (...)
ENGINE = ReplicatedMergeTree(
    '/clickhouse_perftest/tables/{shard}/hits',
    '{replica}'
)
...
```

ここでは、[ReplicatedMergeTree](../engines/table-engines/mergetree-family/replication.md)テーブルエンジンを使用しています。パラメータには、シャードおよびレプリカ識別子を含むZooKeeperパスを指定します。

```sql
INSERT INTO tutorial.hits_replica SELECT * FROM tutorial.hits_local;
```

レプリケーションはマルチマスターモードで行われます。データは任意のレプリカにロードでき、システムは自動的に他のインスタンスと同期します。レプリケーションは非同期であるため、特定の時点で全てのレプリカが最近挿入されたデータを含まない場合があります。データインジェクションを行うためには、少なくとも1つのレプリカが稼働している必要があります。他のレプリカは、再びアクティブになった際にデータを同期し、整合性を修復します。このアプローチは、最近挿入されたデータの損失の可能性を低く保つことができます。
