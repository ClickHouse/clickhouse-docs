---
slug: /architecture/cluster-deployment
sidebar_label: クラスターのデプロイメント
sidebar_position: 100
title: クラスターのデプロイメント
---

このチュートリアルでは、すでに[ローカルの ClickHouse サーバー](../getting-started/install.md) をセットアップしている前提とします。

このチュートリアルを通して、シンプルな ClickHouse クラスターのセットアップ方法を学びます。小規模ですが、フォールトトレラントでスケーラブルです。その後、サンプルデータセットのいずれかを使用してデータを充填し、いくつかのデモクエリを実行します。

## クラスターのデプロイメント {#cluster-deployment}

この ClickHouse クラスターは、均一なクラスターになります。手順は以下の通りです：

1. クラスターのすべてのマシンに ClickHouse サーバーをインストール
2. 設定ファイルにクラスターの設定を行う
3. 各インスタンスにローカルテーブルを作成
4. [分散テーブル](../engines/table-engines/special/distributed.md) を作成

[分散テーブル](../engines/table-engines/special/distributed.md) は、ClickHouse クラスターのローカルテーブルへの「ビュー」の一種です。分散テーブルからの SELECT クエリは、クラスターのすべてのシャードのリソースを使用して実行されます。複数のクラスターの設定を指定し、異なるクラスターに対してビューを提供するために複数の分散テーブルを作成できます。

以下は、3 つのシャードと各シャードに 1 つのレプリカを持つクラスターの設定例です：

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

さらなるデモのために、単一ノードのデプロイメントチュートリアルで使用した `hits_v1` に対して使用したのと同じ `CREATE TABLE` クエリを使用して新しいローカルテーブルを異なるテーブル名で作成します：

```sql
CREATE TABLE tutorial.hits_local (...) ENGINE = MergeTree() ...
```

分散テーブルを作成することで、クラスターのローカルテーブルへのビューが提供されます：

```sql
CREATE TABLE tutorial.hits_all AS tutorial.hits_local
ENGINE = Distributed(perftest_3shards_1replicas, tutorial, hits_local, rand());
```

一般的な慣行として、クラスターのすべてのマシンに類似の分散テーブルを作成します。これにより、クラスター内の任意のマシンで分散クエリを実行できるようになります。また、指定された SELECT クエリのために一時的な分散テーブルを作成する代替オプションもあり、[remote](../sql-reference/table-functions/remote.md) テーブル関数を使用できます。

分散テーブルに[INSERT SELECT](../sql-reference/statements/insert-into.md)を実行して、テーブルを複数のサーバーに分散させましょう。

```sql
INSERT INTO tutorial.hits_all SELECT * FROM tutorial.hits_v1;
```

予想通り、計算負荷の高いクエリは、1 台のサーバーの代わりに 3 台のサーバーを利用すると、N 倍速く実行されます。

この場合、3 つのシャードを持つクラスターを使用しており、各シャードには単一のレプリカが含まれています。

本番環境での耐障害性を提供するために、各シャードには 2 〜 3 のレプリカを持たせることをお勧めします。これらは、複数のアベイラビリティゾーンまたはデータセンター（または少なくともラック間）に分散させます。ClickHouse は無制限の数のレプリカをサポートしていますので、注意してください。

以下は、3 つのレプリカを持つ 1 つのシャードから構成されるクラスターの設定例です：

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

ネイティブレプリケーションを有効にするには、[ZooKeeper](http://zookeeper.apache.org/) が必要です。ClickHouse はすべてのレプリカでのデータの整合性を管理し、障害発生後に自動的に復元手続きを実行します。ZooKeeper クラスターは、他のプロセス（ClickHouse を含む）が稼働していない別のサーバーにデプロイすることをお勧めします。

:::note 注意
ZooKeeper は厳密な要件ではありません。単純な場合には、アプリケーションコードからすべてのレプリカにデータを書き込むことでデータを複製できます。このアプローチは**推奨されていません**。その理由は、この場合 ClickHouse はすべてのレプリカでのデータ整合性を保証できなくなるためです。したがって、それはあなたのアプリケーションの責任となります。
:::

ZooKeeper の場所は設定ファイルに指定します：

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

また、テーブルの作成時に使用される各シャードおよびレプリカを識別するためのマクロも設定する必要があります：

```xml
<macros>
    <shard>01</shard>
    <replica>01</replica>
</macros>
```

レプリケートされたテーブルの作成時にレプリカが存在しない場合、新しい最初のレプリカがインスタンス化されます。すでにライブのレプリカが存在する場合、新しいレプリカは既存のレプリカからデータをクローンします。最初にすべてのレプリケートテーブルを作成し、その後データを挿入するオプションがあります。また、いくつかのレプリカを作成し、データ挿入の後またはその間に他のレプリカを追加するオプションもあります。

```sql
CREATE TABLE tutorial.hits_replica (...)
ENGINE = ReplicatedMergeTree(
    '/clickhouse_perftest/tables/{shard}/hits',
    '{replica}'
)
...
```

ここでは、[ReplicatedMergeTree](../engines/table-engines/mergetree-family/replication.md) テーブルエンジンを使用しています。パラメータでは、シャードとレプリカの識別子を含む ZooKeeper パスを指定します。

```sql
INSERT INTO tutorial.hits_replica SELECT * FROM tutorial.hits_local;
```

レプリケーションはマルチマスターモードで動作します。データは任意のレプリカにロードでき、その後システムが自動的に他のインスタンスと同期します。レプリケーションは非同期であるため、特定の時点では、すべてのレプリカに最近挿入されたデータが含まれていない場合があります。データ取り込みを行うためには、少なくとも 1 つのレプリカが稼働している必要があります。その他はデータを同期し、再びアクティブになると整合性を修復します。このアプローチにより、最近挿入されたデータの損失の可能性が低くなります。
