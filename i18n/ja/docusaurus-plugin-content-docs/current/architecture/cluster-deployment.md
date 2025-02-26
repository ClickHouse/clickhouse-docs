---
slug: /architecture/cluster-deployment
sidebar_label: クラスターのデプロイ
sidebar_position: 100
title: クラスターのデプロイ
---

このチュートリアルでは、[ローカル ClickHouse サーバー](../getting-started/install.md)が既にセットアップされていることを前提としています。

このチュートリアルを通じて、シンプルな ClickHouse クラスターをセットアップする方法を学びます。それは小規模ですが、フォールトトレラントでスケーラブルです。そして、サンプルデータセットの一つを使ってデータを充填し、いくつかのデモクエリを実行します。

## クラスターのデプロイ {#cluster-deployment}

この ClickHouse クラスターは均質なクラスターになります。手順は以下の通りです。

1.  クラスターのすべてのマシンに ClickHouse サーバーをインストールします
2.  設定ファイルでクラスター設定を行います
3.  各インスタンスにローカルテーブルを作成します
4.  [分散テーブル](../engines/table-engines/special/distributed.md)を作成します

[分散テーブル](../engines/table-engines/special/distributed.md)は、ClickHouse クラスター内のローカルテーブルに対する「ビュー」の一種です。分散テーブルからの SELECT クエリは、クラスターのすべてのシャードのリソースを利用して実行されます。複数のクラスターに対する設定を指定し、異なるクラスターのビューを提供するために複数の分散テーブルを作成できます。

以下は、各シャードに1つのレプリカを持つ、3つのシャードのクラスターの例の設定です：

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

さらなるデモンストレーションのために、単一ノードデプロイメントチュートリアルで `hits_v1` に使用したのと同じ `CREATE TABLE` クエリを使って、異なるテーブル名で新しいローカルテーブルを作成しましょう：

```sql
CREATE TABLE tutorial.hits_local (...) ENGINE = MergeTree() ...
```

分散テーブルを作成すると、クラスターのローカルテーブルへのビューが提供されます：

```sql
CREATE TABLE tutorial.hits_all AS tutorial.hits_local
ENGINE = Distributed(perftest_3shards_1replicas, tutorial, hits_local, rand());
```

一般的な慣行として、すべてのクラスターの各マシン上に類似の分散テーブルを作成します。これにより、クラスター内の任意のマシンで分散クエリを実行できます。また、特定の SELECT クエリ用に、一時的な分散テーブルを [remote](../sql-reference/table-functions/remote.md) テーブル関数を使用して作成するオプションもあります。

分散テーブルにデータを広げるために、[INSERT SELECT](../sql-reference/statements/insert-into.md) を実行します。

```sql
INSERT INTO tutorial.hits_all SELECT * FROM tutorial.hits_v1;
```

期待される通り、計算量の多いクエリは、1台のサーバーの代わりに3台のサーバーを利用すればN倍速く実行されます。

この場合、私たちは3つのシャードを持つクラスターを使用し、各シャードは単一のレプリカを含んでいます。

生産環境でのレジリエンスを提供するために、各シャードが複数のアベイラビリティゾーンやデータセンター（または少なくともラック）に分散された2～3のレプリカを含むことをお勧めします。ClickHouseは無制限の数のレプリカをサポートしていることに注意してください。

以下は、3つのレプリカを含む1つのシャードのクラスターの例の設定です：

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

ネイティブのレプリケーションを有効にするには、[ZooKeeper](http://zookeeper.apache.org/)が必要です。ClickHouseはすべてのレプリカにおけるデータの整合性を確保し、故障後に自動的に復元手順を実行します。ZooKeeper クラスターは、他のプロセス（ClickHouseを含む）が実行されていない別のサーバーにデプロイすることが推奨されます。

:::note 注
ZooKeeperは厳密な要件ではありません：いくつかの単純なケースでは、アプリケーションコードからすべてのレプリカにデータを書き込むことでデータを複製することができます。このアプローチは**推奨されません**。この場合、ClickHouseはすべてのレプリカにおけるデータの整合性を保証できません。したがって、それはアプリケーションの責任になります。
:::

ZooKeeperの場所は設定ファイルで指定します：

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

また、テーブル作成時に使用する各シャードおよびレプリカを識別するためのマクロを設定する必要があります：

```xml
<macros>
    <shard>01</shard>
    <replica>01</replica>
</macros>
```

レプリケートテーブルを作成する際にレプリカが存在しない場合、新しい最初のレプリカがインスタンス化されます。すでに稼働中のレプリカがある場合、新しいレプリカは既存のレプリカからデータをクローンします。最初にすべてのレプリケートテーブルを作成し、その後にデータを挿入するオプションがあります。または、一部のレプリカを作成し、データ挿入の後または途中で他のレプリカを追加することも可能です。

```sql
CREATE TABLE tutorial.hits_replica (...)
ENGINE = ReplicatedMergeTree(
    '/clickhouse_perftest/tables/{shard}/hits',
    '{replica}'
)
...
```

ここでは、[ReplicatedMergeTree](../engines/table-engines/mergetree-family/replication.md) テーブルエンジンを使用しています。パラメータでは、シャードおよびレプリカの識別子を含む ZooKeeper パスを指定します。

```sql
INSERT INTO tutorial.hits_replica SELECT * FROM tutorial.hits_local;
```

レプリケーションはマルチマスターモードで動作します。データは任意のレプリカに読み込むことができ、その後システムが自動的に他のインスタンスと同期します。レプリケーションは非同期であるため、特定の瞬間には、すべてのレプリカが最近挿入されたデータを含んでいない場合があります。データ取り込みを許可するためには、少なくとも1つのレプリカが稼働している必要があります。他のレプリカは、アクティブになるとデータを同期し、整合性を修復します。このアプローチでは、最近挿入されたデータの損失の可能性が低くなります。
