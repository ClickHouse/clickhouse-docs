---
description: 'テーブルエンジンのドキュメント'
slug: /engines/table-engines/
toc_folder_title: 'テーブルエンジン'
toc_priority: 26
toc_title: '概要'
title: 'テーブルエンジン'
doc_type: 'reference'
---



# テーブルエンジン

テーブルエンジン（テーブルの種類）は、次の点を決定します。

- データがどのように・どこに保存されるか、どこに書き込み、どこから読み取るか
- どのクエリがどのような方法でサポートされるか
- データへの同時アクセス
- インデックスが存在する場合の利用方法
- リクエストをマルチスレッドで実行できるかどうか
- データレプリケーションのパラメータ



## エンジンファミリー {#engine-families}

### MergeTree {#mergetree}

高負荷タスクに最適な、最も汎用性が高く機能豊富なテーブルエンジンです。これらのエンジンに共通する特性は、高速なデータ挿入と、その後のバックグラウンドでのデータ処理です。`MergeTree`ファミリーのエンジンは、データレプリケーション（エンジンの[Replicated\*](/engines/table-engines/mergetree-family/replication)バージョンを使用）、パーティショニング、セカンダリデータスキップインデックス、その他のエンジンではサポートされていない機能に対応しています。

ファミリーに含まれるエンジン：

| MergeTreeエンジン                                                                                    |
| ---------------------------------------------------------------------------------------------------- |
| [MergeTree](/engines/table-engines/mergetree-family/mergetree)                                       |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)                     |
| [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)                         |
| [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)                 |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)                   |
| [VersionedCollapsingMergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) |
| [GraphiteMergeTree](/engines/table-engines/mergetree-family/graphitemergetree)                       |
| [CoalescingMergeTree](/engines/table-engines/mergetree-family/coalescingmergetree)                   |

### Log {#log}

最小限の機能を持つ軽量な[エンジン](../../engines/table-engines/log-family/index.md)です。多数の小規模なテーブル（約100万行まで）を迅速に書き込み、後でそれらを一括で読み取る必要がある場合に最も効果的です。

ファミリーに含まれるエンジン：

| Logエンジン                                              |
| -------------------------------------------------------- |
| [TinyLog](/engines/table-engines/log-family/tinylog)     |
| [StripeLog](/engines/table-engines/log-family/stripelog) |
| [Log](/engines/table-engines/log-family/log)             |

### 統合エンジン {#integration-engines}

他のデータストレージおよび処理システムと通信するためのエンジンです。

ファミリーに含まれるエンジン：

| 統合エンジン                                                             |
| ------------------------------------------------------------------------------- |
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

ファミリーに含まれるエンジン：


| 特殊エンジン                                                   |
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
| [FileLog](/engines/table-engines/special/filelog)             |



## 仮想カラム {#table_engines-virtual_columns}

仮想カラムは、エンジンのソースコードで定義されるテーブルエンジンの不可欠な属性です。

仮想カラムは`CREATE TABLE`クエリで指定してはならず、`SHOW CREATE TABLE`および`DESCRIBE TABLE`クエリの結果にも表示されません。仮想カラムは読み取り専用であるため、仮想カラムにデータを挿入することはできません。

仮想カラムからデータを選択するには、`SELECT`クエリでその名前を指定する必要があります。`SELECT *`は仮想カラムの値を返しません。

テーブルの仮想カラムと同じ名前のカラムを持つテーブルを作成すると、仮想カラムにアクセスできなくなります。これは推奨されません。競合を避けるため、仮想カラム名には通常アンダースコアが接頭辞として付けられます。

- `_table` — データが読み取られたテーブルの名前を含みます。型: [String](../../sql-reference/data-types/string.md)。

  使用されているテーブルエンジンに関係なく、各テーブルには`_table`という名前の汎用仮想カラムが含まれます。

  mergeテーブルエンジンを使用してテーブルをクエリする場合、`WHERE/PREWHERE`句で`_table`に定数条件を設定できます(例: `WHERE _table='xyz'`)。この場合、読み取り操作は`_table`の条件が満たされるテーブルに対してのみ実行されるため、`_table`カラムはインデックスとして機能します。

  `SELECT ... FROM (... UNION ALL ...)`のような形式のクエリを使用する場合、`_table`カラムを指定することで、返された行がどの実際のテーブルに由来するかを判断できます。
