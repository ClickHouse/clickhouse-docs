---
slug: /architecture/cluster-deployment
sidebar_label: 'クラスタデプロイメント'
sidebar_position: 100
title: 'クラスタデプロイメント'
description: 'このチュートリアルを通じて、シンプルな ClickHouse クラスタを設定する方法を学びます。'
---

このチュートリアルでは、すでに [ローカル ClickHouse サーバー](../getting-started/install/install.mdx) をセットアップしていることを前提としています。

このチュートリアルを通じて、シンプルな ClickHouse クラスタを設定する方法を学びます。小規模ですが、フォールトトレラントでスケーラブルです。その後、サンプルデータセットの一つを使用してデータを埋め込み、いくつかのデモクエリを実行します。

## クラスタデプロイメント {#cluster-deployment}

この ClickHouse クラスタは均質なクラスタになります。以下が手順です：

1.  クラスタのすべてのマシンに ClickHouse サーバーをインストールします
2.  構成ファイルにクラスタ設定を行います
3.  各インスタンスにローカルテーブルを作成します
4.  [分散テーブル](../engines/table-engines/special/distributed.md) を作成します

[分散テーブル](../engines/table-engines/special/distributed.md) は ClickHouse クラスタ内のローカルテーブルへの「ビュー」の一種です。分散テーブルからの SELECT クエリは、クラスタのすべてのシャードのリソースを使用して実行されます。複数のクラスタに対する設定を指定し、異なるクラスタのビューを提供するために複数の分散テーブルを作成できます。

以下は、3つのシャードとそれぞれに1つのレプリカを持つクラスタの構成の例です：

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

さらなるデモンストレーションのために、単一ノードデプロイメントチュートリアルで使用した `CREATE TABLE` クエリと同じクエリで、新しいローカルテーブルを作成しますが、テーブル名は異なります：

```sql
CREATE TABLE tutorial.hits_local (...) ENGINE = MergeTree() ...
```

分散テーブルを作成することで、クラスタのローカルテーブルへのビューが提供されます：

```sql
CREATE TABLE tutorial.hits_all AS tutorial.hits_local
ENGINE = Distributed(perftest_3shards_1replicas, tutorial, hits_local, rand());
```

一般的なプラクティスとして、クラスタのすべてのマシンに類似の分散テーブルを作成します。これにより、クラスタの任意のマシン上で分散クエリを実行できるようになります。また、[remote](../sql-reference/table-functions/remote.md) テーブル関数を使用して、特定の SELECT クエリのために一時的な分散テーブルを作成する代替オプションもあります。

分散テーブルに [INSERT SELECT](../sql-reference/statements/insert-into.md) を実行して、テーブルを複数のサーバーに広げましょう。

```sql
INSERT INTO tutorial.hits_all SELECT * FROM tutorial.hits_v1;
```

予想通り、計算負荷の重いクエリは、1つのサーバーの代わりに3つのサーバーを利用する場合、N倍速く実行されます。

この場合、3つのシャードを持つクラスタを使用し、各シャードには単一のレプリカが含まれています。

本番環境でのレジリエンスを提供するために、各シャードには2〜3のレプリカを持ち、複数のアベイラビリティゾーンまたはデータセンター（または少なくともラック）に分散させることを推奨します。ClickHouseは無限のレプリカをサポートしていることに注意してください。

以下は、3つのレプリカを持つ1つのシャードのクラスタの構成の例です：

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

ネイティブレプリケーションを有効にするために、[ZooKeeper](http://zookeeper.apache.org/) が必要です。ClickHouseはすべてのレプリカのデータ整合性を管理し、障害後に自動的にリストア手続きを実行します。ZooKeeperクラスタは、他のプロセス（ClickHouseを含む）が動作していない専用サーバーにデプロイすることを推奨します。

:::note 注
ZooKeeperは厳密な要件ではありません：単純なケースでは、アプリケーションコードからレプリカすべてにデータを書き込むことでデータを複製することができます。このアプローチは**推奨されません**。この場合、ClickHouseはすべてのレプリカのデータ整合性を保証できなくなるため、アプリケーションの責任となります。
:::

ZooKeeperの場所は構成ファイルで指定します：

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

また、テーブル作成時に使用される各シャードとレプリカを識別するためのマクロを設定する必要があります：

```xml
<macros>
    <shard>01</shard>
    <replica>01</replica>
</macros>
```

レプリケーションテーブル作成時にレプリカが存在しない場合、新しい最初のレプリカがインスタンス化されます。すでにライブレプリカが存在する場合、新しいレプリカは既存のレプリカからデータをクローンします。最初にすべてのレプリケートテーブルを作成し、その後データを挿入するオプションがあります。別のオプションとしては、一部のレプリカを作成し、データ挿入中または後に他のレプリカを追加することです。

```sql
CREATE TABLE tutorial.hits_replica (...)
ENGINE = ReplicatedMergeTree(
    '/clickhouse_perftest/tables/{shard}/hits',
    '{replica}'
)
...
```

ここでは、[ReplicatedMergeTree](../engines/table-engines/mergetree-family/replication.md) テーブルエンジンを使用しています。パラメーターでは、シャードとレプリカの識別子を含むZooKeeperパスを指定します。

```sql
INSERT INTO tutorial.hits_replica SELECT * FROM tutorial.hits_local;
```

レプリケーションはマルチマスターモードで動作します。データは任意のレプリカにロードでき、システムは他のインスタンスと自動的に同期します。レプリケーションは非同期であるため、特定の時点で、すべてのレプリカが最近挿入されたデータを含まない場合があります。データの取り込みを行うには、少なくとも1つのレプリカが稼働している必要があります。他のレプリカはデータを同期し、再度アクティブになると整合性を修復します。このアプローチにより、最近挿入されたデータの損失の可能性が低くなります。
