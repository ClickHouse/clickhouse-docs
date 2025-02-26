---
slug: /engines/table-engines/
toc_folder_title: テーブルエンジン
toc_priority: 26
toc_title: はじめに
---

# テーブルエンジン

テーブルエンジン（テーブルの種類）は次のことを決定します。

- データの保存方法と場所、書き込み先、読み込み先。
- サポートされているクエリとその方法。
- 同時データアクセス。
- インデックスの使用（存在する場合）。
- マルチスレッドリクエストの実行が可能かどうか。
- データレプリケーションのパラメータ。

## エンジンファミリー {#engine-families}

### MergeTree {#mergetree}

高負荷タスクに最も汎用性があり機能的なテーブルエンジン。これらのエンジンが共有する特性は、迅速なデータ挿入とその後のバックグラウンドデータ処理です。 `MergeTree`ファミリーのエンジンは、データのレプリケーション（[Replicated*](../../engines/table-engines/mergetree-family/replication.md#table_engines-replication)バージョンのエンジン）、パーティション、セカンダリーデータスキッピングインデックス、その他の機能をサポートしており、他のエンジンではサポートされていません。

ファミリー内のエンジン:

| MergeTreeエンジン                                                                                                                        |
|-------------------------------------------------------------------------------------------------------------------------------------------|
| [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md#mergetree)                                                          |
| [ReplacingMergeTree](../../engines/table-engines/mergetree-family/replacingmergetree.md#replacingmergetree)                               |
| [SummingMergeTree](../../engines/table-engines/mergetree-family/summingmergetree.md#summingmergetree)                                     |
| [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md#aggregatingmergetree)                         |
| [CollapsingMergeTree](../../engines/table-engines/mergetree-family/collapsingmergetree.md#table_engine-collapsingmergetree)               |
| [VersionedCollapsingMergeTree](../../engines/table-engines/mergetree-family/versionedcollapsingmergetree.md#versionedcollapsingmergetree) |
| [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md#graphitemergetree)                                  |

### Log {#log}

最低限の機能を持つ軽量の[エンジン](../../engines/table-engines/log-family/index.md)。多くの小さなテーブル（約100万行まで）を迅速に書き込み、後で全体を読み取る必要がある場合に最も効果的です。

ファミリー内のエンジン:

| Logエンジン                                                                |
|----------------------------------------------------------------------------|
| [TinyLog](../../engines/table-engines/log-family/tinylog.md#tinylog)       |
| [StripeLog](../../engines/table-engines/log-family/stripelog.md#stripelog) |
| [Log](../../engines/table-engines/log-family/log.md#log)                   |

### インテグレーションエンジン {#integration-engines}

他のデータストレージおよび処理システムとの通信のためのエンジン。

ファミリー内のエンジン:

| インテグレーションエンジン                                                             |
|---------------------------------------------------------------------------------|
| [ODBC](../../engines/table-engines/integrations/odbc.md)                        |
| [JDBC](../../engines/table-engines/integrations/jdbc.md)                        |
| [MySQL](../../engines/table-engines/integrations/mysql.md)                      |
| [MongoDB](../../engines/table-engines/integrations/mongodb.md)                  |
| [Redis](../../engines/table-engines/integrations/redis.md)                      |
| [HDFS](../../engines/table-engines/integrations/hdfs.md)                        |
| [S3](../../engines/table-engines/integrations/s3.md)                            |
| [Kafka](../../engines/table-engines/integrations/kafka.md)                      |
| [EmbeddedRocksDB](../../engines/table-engines/integrations/embedded-rocksdb.md) |
| [RabbitMQ](../../engines/table-engines/integrations/rabbitmq.md)                |
| [PostgreSQL](../../engines/table-engines/integrations/postgresql.md)            |
| [S3Queue](../../engines/table-engines/integrations/s3queue.md)                  |
| [TimeSeries](../../engines/table-engines/integrations/time-series.md)           |

### 特殊エンジン {#special-engines}

ファミリー内のエンジン:

| 特殊エンジン                                                               |
|-------------------------------------------------------------------------------|
| [Distributed](../../engines/table-engines/special/distributed.md#distributed) |
| [Dictionary](../../engines/table-engines/special/dictionary.md#dictionary)    |
| [Merge](../../engines/table-engines/special/merge.md#merge)                   |
| [File](../../engines/table-engines/special/file.md#file)                      |
| [Null](../../engines/table-engines/special/null.md#null)                      |
| [Set](../../engines/table-engines/special/set.md#set)                         |
| [Join](../../engines/table-engines/special/join.md#join)                      |
| [URL](../../engines/table-engines/special/url.md#table_engines-url)           |
| [View](../../engines/table-engines/special/view.md#table_engines-view)        |
| [Memory](../../engines/table-engines/special/memory.md#memory)                |
| [Buffer](../../engines/table-engines/special/buffer.md#buffer)                |
| [KeeperMap](../../engines/table-engines/special/keepermap.md)                 |

## 仮想カラム {#table_engines-virtual_columns}

仮想カラムは、エンジンのソースコードで定義された不可欠なテーブルエンジンの属性です。

`CREATE TABLE`クエリで仮想カラムを指定するべきではなく、`SHOW CREATE TABLE`および`DESCRIBE TABLE`クエリの結果にも表示されません。仮想カラムは読み取り専用であるため、仮想カラムにデータを挿入することはできません。

仮想カラムからデータを選択するには、`SELECT`クエリでその名前を指定する必要があります。`SELECT *`は仮想カラムからの値を返しません。

テーブルにテーブルの仮想カラムと同じ名前のカラムを作成すると、仮想カラムはアクセスできなくなります。このようなことは推奨されません。衝突を避けるために、仮想カラムの名前には通常、アンダースコアが付けられます。
