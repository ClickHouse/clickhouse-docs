---
description: 'テーブルエンジンに関するドキュメント'
slug: /engines/table-engines/
toc_folder_title: 'テーブルエンジン'
toc_priority: 26
toc_title: 'イントロダクション'
title: 'テーブルエンジン'
---


# テーブルエンジン

テーブルエンジン（テーブルの種類）は以下を決定します：

- データの保存方法と場所、書き込み先、読み取り元。
- サポートされるクエリとその方法。
- 同時データアクセス。
- インデックスの使用（存在する場合）。
- マルチスレッドリクエストの実行が可能かどうか。
- データレプリケーションのパラメータ。

## エンジンファミリー {#engine-families}

### MergeTree {#mergetree}

高負荷タスク向けの最も汎用的で機能的なテーブルエンジンです。これらのエンジンが共有する特性は、迅速なデータ挿入と、その後のバックグラウンドでのデータ処理です。 `MergeTree` ファミリーのエンジンは、データレプリケーション（[Replicated\*](/engines/table-engines/mergetree-family/replication) バージョンのエンジン）、パーティション、二次データスキッピングインデックス、および他のエンジンではサポートされていないその他の機能をサポートします。

ファミリー内のエンジン：

| MergeTreeエンジン                                                                                                                         |
|-------------------------------------------------------------------------------------------------------------------------------------------|
| [MergeTree](/engines/table-engines/mergetree-family/mergetree)                                                          |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)                               |
| [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)                                     |
| [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)                         |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)               |
| [VersionedCollapsingMergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) |
| [GraphiteMergeTree](/engines/table-engines/mergetree-family/graphitemergetree)                                  |

### Log {#log}

最小限の機能を持つ軽量の [エンジン](../../engines/table-engines/log-family/index.md) です。多くの小さなテーブル（約100万行まで）を迅速に書き込み、その後全体として読み取る必要がある場合に最も効果的です。

ファミリー内のエンジン：

| Logエンジン                                                                |
|----------------------------------------------------------------------------|
| [TinyLog](/engines/table-engines/log-family/tinylog)       |
| [StripeLog](/engines/table-engines/log-family/stripelog) |
| [Log](/engines/table-engines/log-family/log)                   |

### 統合エンジン {#integration-engines}

他のデータストレージおよび処理システムとの通信のためのエンジン。

ファミリー内のエンジン：

| 統合エンジン                                                             |
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

ファミリー内のエンジン：

| 特殊エンジン                                               |
|---------------------------------------------------------------|
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
| [FileLog](/engines/table-engines/special/filelog)                                                   |

## 仮想カラム {#table_engines-virtual_columns}

仮想カラムは、エンジンのソースコードで定義された不可欠なテーブルエンジンの属性です。

`CREATE TABLE` クエリで仮想カラムを指定するべきではなく、`SHOW CREATE TABLE` および `DESCRIBE TABLE` クエリの結果には表示されません。仮想カラムは読み取り専用であるため、仮想カラムにデータを挿入することはできません。

仮想カラムからデータを選択するには、その名前を `SELECT` クエリで指定する必要があります。 `SELECT *` は仮想カラムからの値を返しません。

同じ名前のカラムを持つテーブルを作成すると、その仮想カラムはアクセスできなくなります。これを行うことは推奨されません。衝突を避けるために、仮想カラム名の先頭にアンダースコアを付けることが一般的です。
