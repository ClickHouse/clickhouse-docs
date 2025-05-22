---
'description': 'テーブルエンジンのドキュメント'
'slug': '/engines/table-engines/'
'toc_folder_title': 'Table Engines'
'toc_priority': 26
'toc_title': 'Introduction'
'title': 'テーブルエンジン'
---




# テーブルエンジン

テーブルエンジン（テーブルの種類）は、以下を決定します。

- データがどのように、どこに保存されるか、書き込む場所、読み取る場所。
- サポートされるクエリとその方法。
- 同時データアクセス。
- 存在する場合のインデックスの使用。
- マルチスレッドリクエスト実行が可能かどうか。
- データレプリケーションパラメータ。

## エンジンファミリー {#engine-families}

### MergeTree {#mergetree}

高負荷タスクに対する最も汎用的で機能的なテーブルエンジン。これらのエンジンに共通する特性は、迅速なデータ挿入と、その後のバックグラウンドでのデータ処理です。`MergeTree`ファミリーのエンジンは、データレプリケーション（[Replicated\*](/engines/table-engines/mergetree-family/replication)バージョンのエンジン）、パーティション、セカンダリデータスキッピングインデックス、その他の機能をサポートしていますが、他のエンジンではサポートされていません。

ファミリー内のエンジン:

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

最小限の機能を持つ軽量[エンジン](../../engines/table-engines/log-family/index.md)。多くの小さなテーブル（約100万行まで）を迅速に書き込み、後で全体として読み取る必要がある場合に最も効果的です。

ファミリー内のエンジン:

| Logエンジン                                                                |
|----------------------------------------------------------------------------|
| [TinyLog](/engines/table-engines/log-family/tinylog)       |
| [StripeLog](/engines/table-engines/log-family/stripelog) |
| [Log](/engines/table-engines/log-family/log)                   |

### 統合エンジン {#integration-engines}

他のデータストレージおよび処理システムと通信するためのエンジン。

ファミリー内のエンジン:

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

ファミリー内のエンジン:

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

## バーチャルカラム {#table_engines-virtual_columns}

バーチャルカラムは、エンジンソースコードで定義されたテーブルエンジンの不可欠な属性です。

`CREATE TABLE`クエリではバーチャルカラムを指定してはいけません。`SHOW CREATE TABLE`や`DESCRIBE TABLE`クエリの結果にも表示されません。バーチャルカラムは読み取り専用であり、そこにデータを挿入することはできません。

バーチャルカラムからデータを選択するには、その名前を`SELECT`クエリで指定する必要があります。`SELECT *`ではバーチャルカラムの値は返されません。

テーブルにテーブルのバーチャルカラムのいずれかと同じ名前のカラムがある場合、バーチャルカラムはアクセスできなくなります。これを行うことはお勧めしません。競合を避けるために、バーチャルカラム名には通常アンダースコアがプレフィックスとして付けられます。
