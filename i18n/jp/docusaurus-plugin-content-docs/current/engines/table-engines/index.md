---
slug: /engines/table-engines/
toc_folder_title: テーブルエンジン
toc_priority: 26
toc_title: はじめに
---


# テーブルエンジン

テーブルエンジン（テーブルのタイプ）は以下を決定します：

- データの保存方法と場所、書き込み先、読み込み元。
- サポートされているクエリとその方法。
- 同時データアクセス。
- インデックスの使用（存在する場合）。
- マルチスレッドリクエスト実行が可能かどうか。
- データレプリケーションパラメータ。

## エンジンファミリー {#engine-families}

### MergeTree {#mergetree}

高負荷タスクに対する最も汎用的で機能的なテーブルエンジンです。これらのエンジンが共有する特性は、迅速なデータ挿入とその後のバックグラウンドデータ処理です。 `MergeTree` ファミリーのエンジンはデータレプリケーション（[Replicated\*](/engines/table-engines/mergetree-family/replication) バージョンのエンジン）、パーティショニング、二次データスキッピングインデックスなど、他のエンジンではサポートされていないさまざまな機能をサポートしています。

ファミリー内のエンジン：

| MergeTreeエンジン                                                                                                                       |
|-----------------------------------------------------------------------------------------------------------------------------------------|
| [MergeTree](/engines/table-engines/mergetree-family/mergetree)                                                              |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replication)                               |
| [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)                                       |
| [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)                       |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)               |
| [VersionedCollapsingMergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) |
| [GraphiteMergeTree](/engines/table-engines/mergetree-family/graphitemergetree)                                |

### Log {#log}

最小限の機能を持つ軽量な [エンジン](../../engines/table-engines/log-family/index.md) です。多くの小さなテーブル（約100万行まで）を迅速に書き込む必要がある場合や、後で全体として読み込む場合に最も効果的です。

ファミリー内のエンジン：

| Logエンジン                                                                  |
|-----------------------------------------------------------------------------|
| [TinyLog](/engines/table-engines/log-family/tinylog)       |
| [StripeLog](/engines/table-engines/log-family/stripelog) |
| [Log](/engines/table-engines/log-family/log)                   |

### インテグレーションエンジン {#integration-engines}

他のデータストレージおよび処理システムと通信するためのエンジンです。

ファミリー内のエンジン：

| インテグレーションエンジン                                                              |
|---------------------------------------------------------------------------------|
| [ODBC](../../engines/table-engines/integrations/odbc.md)                          |
| [JDBC](../../engines/table-engines/integrations/jdbc.md)                          |
| [MySQL](../../engines/table-engines/integrations/mysql.md)                        |
| [MongoDB](../../engines/table-engines/integrations/mongodb.md)                    |
| [Redis](../../engines/table-engines/integrations/redis.md)                        |
| [HDFS](../../engines/table-engines/integrations/hdfs.md)                          |
| [S3](../../engines/table-engines/integrations/s3.md)                              |
| [Kafka](../../engines/table-engines/integrations/kafka.md)                        |
| [EmbeddedRocksDB](../../engines/table-engines/integrations/embedded-rocksdb.md) |
| [RabbitMQ](../../engines/table-engines/integrations/rabbitmq.md)                  |
| [PostgreSQL](../../engines/table-engines/integrations/postgresql.md)              |
| [S3Queue](../../engines/table-engines/integrations/s3queue.md)                    |
| [TimeSeries](../../engines/table-engines/integrations/time-series.md)             |

### 特殊エンジン {#special-engines}

ファミリー内のエンジン：

| 特殊エンジン                                                 |
|------------------------------------------------------------|
| [Distributed](/engines/table-engines/special/distributed)     |
| [Dictionary](/engines/table-engines/special/dictionary)       |
| [Merge](/engines/table-engines/special/merge)                 |
| [Executable](/engines/table-engines/special/executable)       |
| [File](/engines/table-engines/special/file)                   |
| [Null](/engines/table-engines/special/null)                   |
| [Set](/engines/table-engines/special/set)                     |
| [Join](/engines/table-engines/special/join)                   |
| [URL](/engines/table-engines/special/url)                     |
| [View](/engines/table-engines/special/view)                   |
| [Memory](/engines/table-engines/special/memory)               |
| [Buffer](/engines/table-engines/special/buffer)               |
| [External Data](/engines/table-engines/special/external-data) |
| [GenerateRandom](/engines/table-engines/special/generate)     |
| [KeeperMap](/engines/table-engines/special/keeper-map)        |
| [FileLog](/engines/table-engines/special/filelog)             |

## 仮想カラム {#table_engines-virtual_columns}

仮想カラムは、エンジンソースコードで定義された不可欠なテーブルエンジン属性です。

`CREATE TABLE` クエリで仮想カラムを指定するべきではなく、`SHOW CREATE TABLE` および `DESCRIBE TABLE` クエリの結果にも表示されません。仮想カラムは読み取り専用であり、データを挿入することはできません。

仮想カラムからデータを選択するには、`SELECT` クエリでその名前を指定する必要があります。 `SELECT *` では仮想カラムの値は返されません。

テーブルに仮想カラムと同じ名前のカラムを作成すると、その仮想カラムにアクセスできなくなります。これを行うことは推奨されません。衝突を避けるために、仮想カラム名には通常アンダースコアがプレフィックスとして付けられます。
